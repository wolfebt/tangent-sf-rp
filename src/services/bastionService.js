import { getDatasetByKey, validateDatasetPayload } from '../pages/Codex/codexPromptRegistry.js';
import { adaptSparkItemToFirestore } from '../utils/codexIngestionAdapters.js';
import { queryOmnicortexRAG, formatRagContextForBastion } from './omnicortexVectorRag';
/**
 * BASTION AI Service
 * Handles BASTION AI chatbot queries and selective field content generation
 * adhering to Tangent Science Fantasy Roleplaying Game (SFF RPG) system guidelines.
 */

export const getGeminiApiKey = () => {
  const key = (localStorage.getItem('geminiApiKey') || import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (!key || key === 'your_gemini_api_key_here' || key === 'your_firebase_api_key_here') {
    return '';
  }
  return key;
};

const BASTION_SYSTEM_PROMPT = `You are BASTION, the Tactical AI Assistant for the Tangent Science Fantasy Roleplaying Game (SFF RPG).
Always address the user as ARCHITECT (the Game Master / referee / universe creator) or OPERATIVE (if player).
Provide tactical, immersive, and structured RPG content grounded in the Tangent SFF RPG system guidelines:
- Science Fantasy setting blending high technology (Tech Level 0-5), meta-abilities/psi (Meta Level 0-5), space exploration, cybernetics, alien species, factions, ancient relics, and tactical combat.
- Archetype Framework: 100 canonical archetypes structured across 4 Spheres: Sentinels, Operatives, Visionaries, Savants.
- Character Chassis: 150 CP allocation, three 20 SP background pools (Faction, Origin, Occupation), +1 increment advancement rule.
- Dual Resolution & Combat: 2d10 + Attribute + Skill vs. Target Number (11 + Defense). Called shots with 33.3% major wound trauma.
- Economatrix: Cost = Base * (2^TL) * (1.5^ML).
- Keep tone professional, analytical, sci-fi/fantasy immersive, and precise. Always reference canonical Omnicortex rules when applicable.`;

/**
 * Parses dice rolling commands like /roll 2d10+4 or /roll d20
 */
export const parseRollCommand = (command) => {
  const match = command.match(/^\/roll\s+(\d+)?d(\d+)(?:\s*([+-])\s*(\d+))?$/i);
  if (!match) {
    return { success: false, error: 'Invalid roll command. Format: /roll [count]d[sides]+[mod] (e.g. /roll 2d10+4)' };
  }

  const count = parseInt(match[1] || 1, 10);
  const sides = parseInt(match[2], 10);
  const sign = match[3] || '+';
  const mod = parseInt(match[4] || 0, 10) * (sign === '-' ? -1 : 1);

  const rolls = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * sides) + 1;
    rolls.push(r);
    sum += r;
  }
  const total = sum + mod;

  return {
    success: true,
    count,
    sides,
    rolls,
    mod,
    total,
    expr: `${count}d${sides}${mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : ''}`
  };
};

const GEMINI_FLASH_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest'
];

/**
 * Attempts to fetch content from Google Generative AI API with automatic model fallbacks (FLASH models only)
 */
export const fetchGeminiContent = async (apiKey, requestBody) => {
  if (!apiKey) {
    throw new Error('No Gemini API key available. Please check your key in Settings or obtain one from https://aistudio.google.com/app/apikey');
  }

  let lastError = null;

  for (const model of GEMINI_FLASH_MODELS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      }

      const errorMsg = data?.error?.message || `HTTP ${response.status}`;

      // Stop immediately on API Key authentication / quota / bad request errors
      if (
        response.status === 400 ||
        response.status === 403 ||
        errorMsg.toLowerCase().includes('api key') ||
        errorMsg.toLowerCase().includes('invalid') ||
        errorMsg.toLowerCase().includes('unregistered')
      ) {
        throw new Error(`Gemini API Key Error (${response.status}): ${errorMsg}`);
      }
      
      // If model is deprecated or not found, try next candidate
      if (errorMsg.includes('no longer available') || errorMsg.includes('not found') || response.status === 404) {
        lastError = new Error(`[${model}]: ${errorMsg}`);
        continue;
      }

      throw new Error(errorMsg);
    } catch (err) {
      lastError = err;
      const msg = err.message || '';
      if (msg.includes('Gemini API Key Error') || msg.includes('Invalid Gemini API Key')) {
        throw err;
      }
      if (msg.includes('no longer available') || msg.includes('not found') || msg.includes('404')) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Failed to reach Gemini API with available models.');
};

/**
 * Sends a chat prompt to BASTION (Gemini API or Tactical Fallback with Omnicortex Vector RAG)
 */
export const sendBastionChatMessage = async ({ prompt, history = [], contextData = null }) => {
  const apiKey = getGeminiApiKey();
  const ragResults = queryOmnicortexRAG(prompt, 2);
  const ragContext = formatRagContextForBastion(ragResults);

  if (!apiKey) {
    let fallbackText = `[BASTION LOCAL COGNITION]: Acknowledged, ARCHITECT. Analyzing query "${prompt}".\n\n`;
    if (ragResults.length > 0) {
      fallbackText += `📖 **Canonical Rules Retrieved**:\n`;
      for (const { chunk } of ragResults) {
        fallbackText += `\n### 🔹 ${chunk.title} (${chunk.citation})\n${chunk.text}\n`;
      }
    } else {
      fallbackText += `Tangent SFF RPG simulation protocol active.\n\n*(Note: To connect live Gemini API reasoning, configure your Gemini API Key in Omnicortex / DBM Settings).*`;
    }
    return { text: fallbackText, ragResults };
  }

  try {
    const formattedHistory = history.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const MAX_HISTORY = 20;
    const truncatedHistory = formattedHistory.slice(-MAX_HISTORY);

    let systemPromptContent = BASTION_SYSTEM_PROMPT;
    if (ragContext) {
      systemPromptContent += `\n\n${ragContext}`;
    }
    if (contextData) {
      systemPromptContent += `\n\nCURRENT CONTEXT:\n${JSON.stringify(contextData, null, 2)}`;
    }

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPromptContent }]
      },
      contents: [
        ...truncatedHistory,
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    };

    const data = await fetchGeminiContent(apiKey, requestBody);
    let replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      throw new Error('No response content returned from BASTION AI.');
    }

    // Append citation badge if RAG matches were found and not already in reply
    if (ragResults.length > 0 && !replyText.includes('Citation:')) {
      replyText += `\n\n> 📚 *Omnicortex Citation: ${ragResults.map(r => r.chunk.citation).join(' • ')}*`;
    }

    return { text: replyText, ragResults };
  } catch (err) {
    console.warn("BASTION API Error:", err);
    return {
      text: `[BASTION LOCAL COGNITION]: System Alert - ${err.message || 'API request failed'}.\n\n` +
        (ragResults.length > 0 ? `Retrieved Canonical Context:\n${ragResults[0].chunk.title}: ${ragResults[0].chunk.text}` : 'Running in local fallback mode.')
    };
  }
};

/**
 * Selective Field Generation with BASTION
 * Generates content ONLY for checked fields; leaves unselected fields unmapped/untouched.
 * @param {Object} params
 * @param {Array<string>} params.selectedFields - Array of field keys to generate (e.g. ['title', 'content'])
 * @param {Object} params.currentValues - Current values of fields { title, type, content }
 * @param {string} params.userPrompt - Generation instruction/theme
 * @param {string} params.elementType - Active element type (e.g. NPC, Encounter, Story Arc)
 */
export const generateSelectiveFields = async ({
  selectedFields = [],
  currentValues = {},
  userPrompt = '',
  elementType = 'Element',
  componentType = 'Element',
  campaignContext = {}
}) => {
  const activeElementType = elementType || componentType || 'Element';
  if (selectedFields.length === 0) {
    return { success: false, error: 'No fields were selected for BASTION generation.' };
  }

  if (!userPrompt || !userPrompt.trim()) {
    return { success: false, error: 'BASTION generation prompt is required. Please enter instructions or select a theme preset.' };
  }

  const apiKey = getGeminiApiKey();

  // Extract surrounding campaign parameters if provided
  const tl = campaignContext.techLevel ?? currentValues.tl ?? 3;
  const ml = campaignContext.metaLevel ?? currentValues.ml ?? 1;
  const project = campaignContext.projectName || 'Tangent Universe';
  const parentNode = campaignContext.activeNodeTitle || '';

  // If no API Key, return structured simulation fallback for selected fields ONLY
  if (!apiKey) {
    const fallbackResults = {};
    const titles = {
      'Story Arc': `The ${userPrompt || 'Derelict Nebula'} Crisis`,
      'Character': `Commander ${userPrompt || 'Vane'}, Tangent Operative`,
      'Location': `Outpost ${userPrompt || 'Zeta-9'} Sector`,
      'Encounter': `Ambush at ${userPrompt || 'Perimeter Gamma'}`,
      'Faction': `The ${userPrompt || 'Obsidian Syndicate'}`,
      'Species': `The ${userPrompt || 'Kaelen'} Species`,
      'Equipment': `TL-${tl} ${userPrompt || 'Tactical Scanner'}`,
      'Weaponry': `TL-${tl} ${userPrompt || 'Plasma Rifle'}`
    };

    selectedFields.forEach(field => {
      if (['title', 'name', 'char-name'].includes(field)) {
        fallbackResults[field] = titles[activeElementType] || `${userPrompt || 'Tactical'} ${activeElementType || 'Module'}`;
      } else if (['type', 'category'].includes(field)) {
        fallbackResults[field] = activeElementType || 'Standard';
      } else if (['content', 'description'].includes(field)) {
        fallbackResults[field] = `[BASTION TACTICAL BRIEFING - ${project.toUpperCase()}]\nOverview: Entry generated for "${userPrompt || 'Standard Concept'}" under Tech Level ${tl} protocols and Meta Level ${ml} attunements${parentNode ? ` within parent node "${parentNode}"` : ''}. Grounded in Tangent SFF RPG mechanics.`;
      } else if (['notes', 'char-motive', 'char-concept', 'char-style'].includes(field)) {
        fallbackResults[field] = `Operative profile details generated based on prompt "${userPrompt || 'Tactical Operative'}". Grounded in campaign context (${project}, TL-${tl}).`;
      } else if (['char-archetype', 'archetype'].includes(field)) {
        fallbackResults[field] = userPrompt ? `The ${userPrompt.split(' ')[0]}` : 'The Sentinel';
      } else if (['char-species', 'species', 'char-occu', 'occupation', 'char-origin', 'origin', 'char-faction', 'faction'].includes(field)) {
        fallbackResults[field] = userPrompt ? userPrompt.split(' ')[0] : 'Standard';
      } else if (['tl'].includes(field)) {
        fallbackResults[field] = Number(tl);
      } else if (['ml'].includes(field)) {
        fallbackResults[field] = Number(ml);
      } else if (['laws_of_physics', 'history', 'geography', 'biosphere', 'culture', 'points_of_interest', 'inhabitants', 'origin', 'practices', 'narrative-backstory', 'narrative-psychology', 'narrative-arcs', 'narrative-relationships', 'narrative-secrets', 'role', 'summary', 'primaryConflict', 'nicknames', 'socialClass', 'currentResidence', 'appearance', 'voice', 'clothing', 'mannerisms', 'positiveTraits', 'negativeTraits', 'likesDislikes', 'hobbies', 'personalityType', 'backstory', 'definingTrauma', 'greatestAccomplishment', 'childhoodEvents', 'keyRelationships', 'romanticHistory', 'worldview', 'theLie', 'theTruth', 'deepestFear', 'goals', 'stakes', 'plotHooks', 'tags'].includes(field)) {
        fallbackResults[field] = `Narrative details generated for "${userPrompt || 'this element'}". Grounded in campaign context (${project}, TL-${tl}, ML-${ml}).`;
      } else {
        fallbackResults[field] = `Generated ${field} for ${userPrompt || 'Standard'}`;
      }
    });

    return { success: true, generated: fallbackResults };
  }

  try {
    const promptInstructions = `
You are BASTION, tactical AI content generator for the Tangent Science Fantasy Roleplaying Game (SFF RPG).
Strictly follow Tangent SFF RPG system guidelines and lore conventions.

Campaign & Scenario Context:
- Project / Universe Name: "${project}"
- Tech Level (TL): ${tl}
- Meta Level / Psi (ML): ${ml}
${parentNode ? `- Surrounding Scenario Element Node: "${parentNode}"` : ''}

The user is editing a story module element of type "${activeElementType}".
User Prompt / Instruction: "${userPrompt || 'Generate detailed content appropriate for this element'}"

Current field values:
${JSON.stringify(currentValues, null, 2)}

CRITICAL REQUIREMENT: Generate content ONLY for the following selected fields: ${JSON.stringify(selectedFields)}.
Do NOT generate or include any fields that are not in this selected fields list.

Return ONLY a valid, parseable JSON object where the keys match the selected fields (${selectedFields.join(', ')}).
Example JSON format:
{
  ${selectedFields.map(f => f === 'content' ? `"content": "<p>HTML formatted content here...</p>"` : `"${f}": "Generated text"`).join(',\n  ')}
}
Do not wrap in markdown backticks if possible, or use standard json formatting.
`;

    const data = await fetchGeminiContent(apiKey, {
      contents: [{ role: 'user', parts: [{ text: promptInstructions }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const rawReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code block wrappers if present
    const cleanJsonStr = rawReply
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    // Extract JSON payload
    const jsonMatch = cleanJsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Unable to locate structured JSON in BASTION response.");
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      // Fallback recovery: sanitize raw linebreaks / unescaped characters inside string values
      try {
        const sanitized = jsonMatch[0]
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        parsedData = JSON.parse(sanitized);
      } catch (retryErr) {
        throw new Error(`SyntaxError in BASTION JSON response: ${parseErr.message}`);
      }
    }

    // Filter to ONLY selected fields
    const finalGenerated = {};
    selectedFields.forEach(field => {
      if (parsedData[field] !== undefined) {
        finalGenerated[field] = parsedData[field];
      }
    });

    return { success: true, generated: finalGenerated };
  } catch (err) {
    console.warn("BASTION Generation Error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Synthesizes a full Codex Matrix entry with BASTION tactical rules cognition
 */
export const synthesizeMatrixWithBastion = async ({
  matrix,
  archetype = null,
  customDirectives = '',
  targetName = '',
  targetTechLevel = 3,
  targetMetaLevel = 0
}) => {
  const apiKey = getGeminiApiKey();

  const archetypePrompt = archetype?.prompt || '';
  const nameDirective = targetName ? `DESIGNATION/NAME: "${targetName}"` : 'GENERATE an evocative, lore-grounded designation.';
  const fieldNames = matrix.fields.map(f => f.name).join(', ');

  const systemInstructions = `You are BASTION, the Tactical AI & System Rules Architect for the Tangent Science Fantasy Roleplaying Game (SFF RPG) CODEX Rules Builder.
Always address the user as ARCHITECT.
Your role in the CODEX is to engineer balanced, rules-accurate, mathematically grounded in-game content that integrates directly with the canonical OMNICORTEX database.

TARGET MATRIX: ${matrix.name} (${matrix.label})
CATEGORY: ${matrix.category}
${nameDirective}
CONCEPT / ARCHETYPE: ${archetypePrompt || 'Tactical science fantasy combat item with precise mechanics.'}
TECH LEVEL: TL ${targetTechLevel} (0: Archaic, 1: Industrial, 2: Modern, 3: Advanced Cyber/Space, 4: High Psitech/Nano, 5: Exotic Singularity)
META LEVEL: ML ${targetMetaLevel} (0: None, 1: Latent, 2: Awakened, 3: Adept, 4: Master, 5: Cosmic Flux)
DIRECTIVES: ${customDirectives || 'Adhere strictly to Tangent SFF RP mechanics, dice expressions, Design DCs, CP economy, and tactical interactions.'}

REQUIRED FIELDS TO POPULATE:
${fieldNames}

OUTPUT FORMAT:
Provide ONLY a valid JSON object matching the matrix fields:
{
  "name": "Designation",
  "description": "2-3 paragraphs of precise aesthetic, technological, and tactical overview.",
  "mechanic": "Concrete system rules, dice expressions (e.g. 2d10+4), ranges, AP, damage types, saves, and tactical conditions.",
  "note": "Architect notes, GM tactical hooks, and manufacturing/design notes.",
  "tech_level": ${targetTechLevel},
  "meta_level": ${targetMetaLevel}
  ...and all other relevant fields for ${matrix.name}
}

Return ONLY the raw JSON object.`;

  if (!apiKey) {
    return {
      name: targetName || `${matrix.name} Prototype [TL${targetTechLevel}/ML${targetMetaLevel}]`,
      description: `[BASTION LOCAL PROTOCOL]: Synthesized ${matrix.name} entry based on ${archetype?.name || 'standard tactical specs'}. Configured for TL${targetTechLevel}, ML${targetMetaLevel}.`,
      mechanic: `Standard tactical mechanics apply under Tangent SFF RP rules. Design DC: ${12 + targetTechLevel * 2}.`,
      note: 'Generated locally via BASTION tactical offline matrix.',
      tech_level: targetTechLevel,
      meta_level: targetMetaLevel,
      tl: targetTechLevel,
      ml: targetMetaLevel
    };
  }

  const response = await fetchGeminiContent(apiKey, {
    contents: [{ role: 'user', parts: [{ text: systemInstructions }] }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanJsonStr = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const match = cleanJsonStr.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('BASTION did not return structured JSON.');
  }

  const parsed = JSON.parse(match[0]);
  return {
    ...matrix.defaultValues,
    ...parsed,
    tech_level: parsed.tech_level ?? targetTechLevel,
    meta_level: parsed.meta_level ?? targetMetaLevel,
    tl: parsed.tl ?? targetTechLevel,
    ml: parsed.ml ?? targetMetaLevel
  };
};

/**
 * Verifies that an adapted item is safely structured for Persona Folio game asset calculation
 */
export function verifyFolioAssetHealth(item, categoryKey) {
  const issues = [];
  if (!item || typeof item !== 'object') {
    return { isFolioReady: false, issues: ['Item is not an object'] };
  }

  if (!item.name || !item.name.trim()) {
    issues.push('Missing designation/name');
  }

  // Check costs map
  if (!item.costs || typeof item.costs !== 'object') {
    issues.push('Invalid costs map structure');
  } else {
    if (isNaN(item.costs.cp ?? item.costs.bp)) issues.push('CP/BP cost is NaN');
    if (isNaN(item.costs.credits)) issues.push('Credit cost is NaN');
    if (isNaN(item.costs.nodes)) issues.push('Nodes cost is NaN');
    if (isNaN(item.costs.sockets)) issues.push('Sockets cost is NaN');
    if (isNaN(item.costs.strain)) issues.push('Strain cost is NaN');
    if (isNaN(item.costs.focus)) issues.push('Focus cost is NaN');
    if (isNaN(item.costs.ap)) issues.push('AP cost is NaN');
  }

  // Check modifiers
  if (Array.isArray(item.modifiers)) {
    item.modifiers.forEach((m, idx) => {
      if (!m.target) issues.push('Modifier #' + (idx + 1) + ' missing target');
      if (isNaN(m.value)) issues.push('Modifier #' + (idx + 1) + ' value is NaN');
    });
  }

  // Check tech_level & meta_level
  if (item.tech_level !== undefined && item.tech_level !== null && isNaN(item.tech_level)) {
    issues.push('Tech Level is NaN');
  }
  if (item.meta_level !== undefined && item.meta_level !== null && isNaN(item.meta_level)) {
    issues.push('Meta Level is NaN');
  }

  // Category-specific sanity checks based on DATASET_SCHEMA_FIELD_CATALOG.md
  switch (categoryKey) {
    case 'species':
      if (!item.size || (Array.isArray(item.size) && item.size.length === 0)) {
        issues.push('Species missing size classification');
      }
      if (!item.movement || (Array.isArray(item.movement) && item.movement.length === 0)) {
        issues.push('Species missing movement modes');
      }
      break;
    case 'weaponry':
      if (!item.damage) issues.push('Weapon missing damage formula');
      if (!item.damage_type) issues.push('Weapon missing damage type');
      if (!item.classification) issues.push('Weapon missing classification');
      break;
    case 'armoring':
      if (item.dr === undefined || isNaN(item.dr)) issues.push('Armor missing Damage Reduction (DR)');
      break;
    case 'invocations':
      if (!item.discipline) issues.push('Invocation missing discipline');
      break;
    case 'skills':
      if (!item.governing_attribute && !item.type) issues.push('Skill missing governing attribute / type');
      break;
    case 'origins':
      if (!item.origin_type) issues.push('Origin missing origin_type');
      break;
    case 'archetypes':
      if (!item.role) issues.push('Archetype missing tactical/narrative role');
      break;
    case 'traits':
      if (!item.trait_type) issues.push('Trait missing trait_type');
      break;
    case 'disciplines':
      if (!item.governing_attribute) issues.push('Discipline missing governing_attribute');
      break;
    default:
      break;
  }

  return {
    isFolioReady: issues.length === 0,
    issues
  };
}

/**
 * Autonomous BASTION Dataset Ingestion Service
 * Parses raw text or documents (PDF, TXT, MD, JSON) directly into canonical Omnicortex documents
 * using schema-enforced prompt instructions, pre-flight validation, and entity adapters.
 */
export const synthesizeDatasetIngestionWithBastion = async ({
  categoryKey,
  rawText = '',
  fileData = null,
  conflictStrategy = 'merge',
  onProgress = null
}) => {
  const hasText = rawText && rawText.trim().length > 0;
  const hasFile = fileData && (fileData.text || fileData.base64);

  if (!hasText && !hasFile) {
    return { success: false, error: 'Raw text or document content is required for BASTION parsing.' };
  }

  const dataset = getDatasetByKey(categoryKey);
  if (!dataset) {
    return { success: false, error: 'Unknown Omnicortex dataset category: "' + categoryKey + '".' };
  }

  const apiKey = getGeminiApiKey();

  // If no API key, return simulated offline cognition using canonical sample
  if (!apiKey) {
    const adaptedSample = adaptSparkItemToFirestore(categoryKey, dataset.sampleItem);
    const health = verifyFolioAssetHealth(adaptedSample, categoryKey);
    adaptedSample._folioHealth = health;

    return {
      success: true,
      isSimulated: true,
      rawItems: [dataset.sampleItem],
      adaptedItems: [adaptedSample],
      validationReport: {
        isValid: true,
        errors: [],
        warnings: ['Simulation mode: Connected to BASTION tactical offline matrix (configure Gemini API Key in Settings for live extraction).'],
        validCount: 1
      },
      folioHealthReport: {
        allReady: health.isFolioReady,
        itemIssues: health.issues
      }
    };
  }

  try {
    // Helper to parse a single payload or chunk with Gemini
    const executeGeminiCall = async (parts) => {
      const requestBody = {
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json'
        }
      };

      const response = await fetchGeminiContent(apiKey, requestBody);
      const rawTextOutput = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!rawTextOutput) {
        throw new Error('No structured response returned from BASTION AI.');
      }

      const cleanJson = rawTextOutput
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      try {
        const parsed = JSON.parse(cleanJson);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseErr) {
        const match = cleanJson.match(/\[[\s\S]*\]/) || cleanJson.match(/\{[\s\S]*\}/);
        if (!match) {
          throw new Error('Failed to parse BASTION output as JSON array: ' + parseErr.message);
        }
        const sanitized = match[0]
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        const recovered = JSON.parse(sanitized);
        return Array.isArray(recovered) ? recovered : [recovered];
      }
    };

    let allRawItems = [];

    // Check if a PDF file is provided with base64 data
    if (fileData && fileData.mimeType === 'application/pdf' && fileData.base64) {
      if (onProgress) onProgress({ current: 1, total: 1, status: 'Synthesizing PDF Document...' });
      const parts = [
        {
          text: dataset.promptText + '\n\nTASK: Parse the accompanying PDF document into the JSON schema defined above. Extract all playable entries for "' + dataset.label + '". Return ONLY the raw JSON array.'
        },
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: fileData.base64
          }
        }
      ];
      if (hasText) {
        parts.push({ text: 'ADDITIONAL CONTEXT / DIRECTIVES:\n' + rawText });
      }
      const pdfParsed = await executeGeminiCall(parts);
      allRawItems = pdfParsed;
    } else {
      // Standard Text or Text-Document input
      const combinedInput = [
        fileData && fileData.text ? '--- DOCUMENT CONTENT (' + (fileData.name || 'Uploaded File') + ') ---\n' + fileData.text : '',
        hasText ? '--- INPUT TEXT / NOTES ---\n' + rawText : ''
      ].filter(Boolean).join('\n\n');

      // Check if text is large enough to warrant section chunking (> 10,000 characters)
      const CHUNK_SIZE = 10000;
      if (combinedInput.length > CHUNK_SIZE) {
        // Split by markdown headers or double newlines
        const rawSections = combinedInput.split(/\n(?=#{1,4}\s|\n\n[A-Z0-9])/);
        const textChunks = [];
        let curChunk = '';

        for (const sec of rawSections) {
          if ((curChunk + '\n' + sec).length > CHUNK_SIZE && curChunk.trim().length > 0) {
            textChunks.push(curChunk.trim());
            curChunk = sec;
          } else {
            curChunk = curChunk ? curChunk + '\n\n' + sec : sec;
          }
        }
        if (curChunk.trim().length > 0) {
          textChunks.push(curChunk.trim());
        }

        for (let idx = 0; idx < textChunks.length; idx++) {
          const chunkText = textChunks[idx];
          if (onProgress) {
            onProgress({
              current: idx + 1,
              total: textChunks.length,
              status: `Synthesizing Section ${idx + 1} of ${textChunks.length}...`
            });
          }

          const promptInstructions = dataset.promptText.replace('[INSERT RAW ' + dataset.label.toUpperCase() + ' TEXT HERE]', chunkText) + '\n\nRAW INPUT TEXT SECTION ' + (idx + 1) + ' OF ' + textChunks.length + ' TO PARSE:\n' + chunkText;
          const chunkParsed = await executeGeminiCall([{ text: promptInstructions }]);
          if (Array.isArray(chunkParsed)) {
            allRawItems.push(...chunkParsed);
          }
        }
      } else {
        if (onProgress) onProgress({ current: 1, total: 1, status: 'Synthesizing text...' });
        const promptInstructions = dataset.promptText.replace('[INSERT RAW ' + dataset.label.toUpperCase() + ' TEXT HERE]', combinedInput) + '\n\nRAW INPUT TEXT TO PARSE:\n' + combinedInput;
        allRawItems = await executeGeminiCall([{ text: promptInstructions }]);
      }
    }

    // Run Pre-Flight Validation against Omnicortex expected schema
    const validationReport = validateDatasetPayload(categoryKey, allRawItems);

    // Adapt to canonical Omnicortex Firestore & Folio objects
    const adaptedItems = allRawItems
      .map(item => {
        const adapted = adaptSparkItemToFirestore(categoryKey, item);
        if (adapted) {
          adapted._folioHealth = verifyFolioAssetHealth(adapted, categoryKey);
        }
        return adapted;
      })
      .filter(Boolean);

    const folioHealthReport = {
      allReady: adaptedItems.every(i => i._folioHealth?.isFolioReady),
      failedCount: adaptedItems.filter(i => !i._folioHealth?.isFolioReady).length
    };

    return {
      success: true,
      isSimulated: false,
      rawItems: allRawItems,
      adaptedItems,
      validationReport,
      folioHealthReport
    };
  } catch (err) {
    console.warn('BASTION Ingestion Synthesis Error:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

