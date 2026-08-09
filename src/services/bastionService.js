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
Always address the user as ARCHITECT (the Game Master / referee / universe creator).
Provide tactical, immersive, and structured RPG content grounded in the Tangent SFF RPG system guidelines:
- Science Fantasy setting blending high technology (Tech Level 0-5), meta-abilities/psi (Meta Level 0-5), space exploration, cybernetics, alien species, factions, ancient relics, and tactical combat.
- Keep tone professional, analytical, sci-fi/fantasy immersive, and precise.`;

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
 * Sends a chat prompt to BASTION (Gemini API or Tactical Fallback)
 */
export const sendBastionChatMessage = async ({ prompt, history = [], contextData = null }) => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      text: `[BASTION LOCAL COGNITION]: Acknowledged, ARCHITECT. Analyzing query "${prompt}". Tangent SFF RPG protocol active.\n\n*(Note: To connect live Gemini API, configure your Gemini API Key in Omnicortex / DBM Settings).*`
    };
  }

  try {
    const formattedHistory = history.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    let systemPromptContent = BASTION_SYSTEM_PROMPT;
    if (contextData) {
      systemPromptContent += `\n\nCURRENT CONTEXT:\n${JSON.stringify(contextData, null, 2)}`;
    }

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: `${systemPromptContent}\n\nUser Query: ${prompt}` }]
      }
    ];

    const data = await fetchGeminiContent(apiKey, { contents });
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      throw new Error('No response content returned from BASTION AI.');
    }

    return { text: replyText };
  } catch (err) {
    console.warn("BASTION API Error:", err);
    return {
      text: `🤖 **BASTION Connection Warning**: Unable to reach live Gemini API (${err.message}). Reverting to tactical simulation cognition.`
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
      } else if (['char-species', 'species', 'char-occu', 'occupation', 'char-origin', 'origin', 'char-faction', 'faction'].includes(field)) {
        fallbackResults[field] = userPrompt ? userPrompt.split(' ')[0] : 'Standard';
      } else if (['tl'].includes(field)) {
        fallbackResults[field] = Number(tl);
      } else if (['ml'].includes(field)) {
        fallbackResults[field] = Number(ml);
      } else if (['laws_of_physics', 'history', 'geography', 'biosphere', 'culture', 'points_of_interest', 'inhabitants', 'origin', 'practices', 'narrative-backstory', 'narrative-psychology', 'narrative-arcs', 'narrative-relationships', 'narrative-secrets'].includes(field)) {
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
