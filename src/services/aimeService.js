import { getGeminiApiKey, fetchGeminiContent, parseRollCommand } from './bastionService.js';
import { hydrateElementEntities } from './entityHydrator.js';
import { queryOmnicortexRAG, formatRagContextForAIME } from './omnicortexVectorRag.ts';
import { formatCronicleContextForAIME, extractNarrativeDeltas } from './cronicleService.js';
import { synthesizeSuperPrompt, buildStaticRulesPrefix } from './superPromptSynthesizer.js';
import { scanDynamicLorebook } from './lorebookScanner.ts';
import { formatMandateForPrompt } from './ade/adeEngineBridge.ts';
import { 
  TANGENT_STORY_BEAT_GBNF, 
  TANGENT_STORY_BEAT_JSON_SCHEMA,
  TANGENT_ACTION_REQUEST_GBNF,
  TANGENT_ACTION_REQUEST_JSON_SCHEMA 
} from '../grammars/storyBeatGrammar.ts';
import { 
  LOD_TIERS, 
  resolveIntelligenceTier, 
  calculateVramTelemetry, 
  callLocalLlama,
  callLocalOllama,
  callAutomatedInferencePipeline
} from './aimeTierRouter.ts';

export { 
  parseRollCommand, 
  formatCronicleContextForAIME, 
  extractNarrativeDeltas, 
  synthesizeSuperPrompt, 
  buildStaticRulesPrefix, 
  scanDynamicLorebook,
  formatMandateForPrompt,
  TANGENT_STORY_BEAT_GBNF,
  TANGENT_STORY_BEAT_JSON_SCHEMA,
  TANGENT_ACTION_REQUEST_GBNF,
  TANGENT_ACTION_REQUEST_JSON_SCHEMA,
  LOD_TIERS,
  resolveIntelligenceTier,
  calculateVramTelemetry,
  callLocalLlama,
  callLocalOllama,
  callAutomatedInferencePipeline
};

export const AIME_SYSTEM_PROMPT = `You are AIME (The Artificial Intellect Mythopoeic Environ), the Creative & Narrative AI Co-Pilot for the Tangent Science Fantasy Roleplaying Game (SFF RPG) ADE Studio.
Your primary role is to act as an immersive creative writing assistant, lore synthesist, worldbuilding partner, and scenario architect for the ARCHITECT (the GM/Creator).

OMNICORTEX & BASTION RULES INTEGRATION:
- While you focus primarily on narrative flow, thematic resonance, character interiority, and evocative worldbuilding, you have direct access to consult BASTION's tactical cognition and the canonical OMNICORTEX rules/compendium database.
- Ground your creative suggestions in the Tangent SFF RPG setting: blending high-tech science fiction (Tech Levels 0-5) with meta-abilities/psionics (Meta Levels 0-5), space exploration, cybernetics, alien species, factions, ancient relics, and tactical combat.
- Respect the ARCHITECT's active Guidance Gems, Current Story Element, and Campaign Context.
- Always address the user as ARCHITECT.

NARRATIVE TRANSMUTATION OF RPG MECHANICS:
- Tech Levels (TL 0–5): Depict equipment with period-accurate tactile aesthetics and soundscapes:
  * TL 0-1: Primitive/Industrial. Gunpowder smoke, brass casings, physical springs, heavy iron plating.
  * TL 2-3: Advanced/Interstellar. Kinetic railguns, titanium/ceramic ballistic weaves, optical HUD feeds, cyber-jacks.
  * TL 4: Nanotech/Hard-Light. Crystalline hums, photonic barriers, shape-memory smart alloys, zero-recoil pulses.
  * TL 5: Precursor. Dimensional warping, silent gravitational shifts, reality-phasing architecture.
- Meta Levels (ML 0–5): Metaphysical invocations and psionics generate sensory atmosphere: ozone stench, localized barometric drops, chronometer flickering, shimmering aether afterimages.
- Called Shots & 33.3% Trauma: When an attack targets specific anatomy (Head, Arms, Legs, Optics) or crosses the 33.3% damage threshold, depict physical anatomical trauma, sensory disorientation, loss of footing, or weapon drops rather than abstract hit point reductions.
- Dual Resolution & Margins of Success: High margins of success reflect decisive tactical superiority and kinetic momentum; near-failures depict desperate recovery with complications.
- Factions & Lineages: Ground NPC motivations and dialogue in their driving mandates, cultural stigmas, and ideological rifts.`;

export function formatContext(context, promptQuery = '') {
  if (!context) return '';
  if (typeof context === 'string') return context.trim();
  try {
    // If activeNode or rich AIME layers are present, leverage the Super-Prompt Synthesizer
    if (context.activeNode || context.guidance || context.assetHub) {
      const superPrompt = synthesizeSuperPrompt({
        activeNode: context.activeNode,
        guidance: context.guidance || context.guidanceGems,
        assetHub: context.assetHub || context.activeNode?.assetHub || context.activeNode?.linkedElements,
        catalog: context.customCatalog || context.catalog || [],
        taskPrompt: promptQuery,
        campaignName: context.projectName,
        cronicle: context.cronicle,
        storyFlags: context.storyFlags,
        lorebookConfig: context.lorebookConfig,
        folioCharacter: context.folioCharacter || context.activeOperative
      });
      if (superPrompt) return superPrompt;
    }
    
    // Active Scenario Node
    if (context.activeNode) {
      out += `Active Story Element: [${context.activeNode.type || 'Element'}] "${context.activeNode.title || 'Untitled'}"\n`;
      if (context.activeNode.content) {
        // Strip HTML tags for clean context prompt
        const cleanContent = context.activeNode.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        out += `Element Content Summary: ${cleanContent.slice(0, 800)}\n`;
      }
      if (context.activeNode.fields && Object.keys(context.activeNode.fields).length > 0) {
        out += `Element Custom Fields: ${JSON.stringify(context.activeNode.fields)}\n`;
      }

      // Tier 1: Hydrate Relational Entity References (Species, Factions, Origins, Occupations, Weapons)
      try {
        const customCatalog = context.customCatalog || [];
        const { summary: entitySummary } = hydrateElementEntities(context.activeNode, customCatalog);
        if (entitySummary) {
          out += `\n${entitySummary}\n`;
        }
      } catch (e) {
        console.warn('Entity hydration skipped in formatContext:', e);
      }
    }

    if (context.guidanceGems) out += `Active Guidance Gems: ${context.guidanceGems}\n`;
    if (context.outline) out += `Story Outline Preview: ${context.outline.slice(0, 500)}\n`;
    if (context.sceneBeats) out += `Scene Beats Preview: ${context.sceneBeats.slice(0, 500)}\n`;
    if (context.draft) out += `Draft Preview: ${context.draft.slice(0, 500)}\n`;
    
    // CRONICLE Persistent Memory Context Injection (3-Tier Reality Constraints)
    if (context.cronicle) {
      try {
        const cronicleBlock = formatCronicleContextForAIME(context.cronicle);
        if (cronicleBlock) {
          out += `\n${cronicleBlock}\n`;
        }
      } catch (e) {
        console.warn('Cronicle context formatting skipped:', e);
      }
    }

    // Tier 2: Retrieve Canonical Omnicortex Rules & Setting Chunks via Vector RAG
    try {
      const searchTerms = [
        promptQuery,
        context.activeNode?.title,
        context.activeNode?.type,
        context.guidanceGems,
        context.activeNode?.fields?.['char-faction'],
        context.activeNode?.fields?.['char-species']
      ].filter(Boolean).join(' ');

      if (searchTerms.trim()) {
        const ragResults = queryOmnicortexRAG(searchTerms, 3);
        if (ragResults && ragResults.length > 0) {
          const ragBlock = formatRagContextForAIME(ragResults);
          if (ragBlock) {
            out += `\n${ragBlock}\n`;
          }
        }
      }
    } catch (e) {
      console.warn('Omnicortex RAG query skipped in formatContext:', e);
    }

    return out.trim();
  } catch (e) {
    return String(context);
  }
}

export async function generateContent({ 
  prompt, 
  context = "", 
  model = "gemini-3.6-flash", 
  apiKey = "", 
  mandate = null, 
  enforceJson = false,
  responseSchema = null,
  grammar = null,
  tierKey = "auto",
  localEndpoint = null
}) {
  const activeKey = apiKey || getGeminiApiKey();
  const formattedCtx = formatContext(context, prompt);

  let fullPrompt = formattedCtx 
    ? `[ARCHITECT & SCENARIO CONTEXT - OMNICORTEX ATTUNED]:\n${formattedCtx}\n\nTask Instructions:\n${prompt}`
    : prompt;

  if (mandate) {
    fullPrompt = `${formatMandateForPrompt(mandate)}\n\n${fullPrompt}`;
  }

  // 1. Check for Local Inference (llama.cpp -> Ollama automated cascade)
  const preferredPlatform = (typeof localStorage !== 'undefined' && localStorage.getItem('aiPlatform')) || 'gemini';
  const configuredEndpoint = localEndpoint || (typeof localStorage !== 'undefined' ? localStorage.getItem('customEndpoint') : null);

  if (preferredPlatform === 'custom' || configuredEndpoint) {
    const tierConfig = resolveIntelligenceTier({
      actionText: prompt,
      userOverride: tierKey
    });
    const gbnfGrammar = enforceJson ? (grammar || TANGENT_STORY_BEAT_GBNF) : grammar;

    try {
      const pipelineResult = await callAutomatedInferencePipeline({
        llamaEndpoint: configuredEndpoint || 'http://localhost:8080',
        ollamaEndpoint: 'http://localhost:11434',
        prompt: fullPrompt,
        grammar: gbnfGrammar,
        tier: tierConfig,
        enforceJson
      });
      if (pipelineResult && pipelineResult.text) {
        return pipelineResult.text;
      }
    } catch (e) {
      console.warn('Local inference cascade unavailable, falling back to cloud:', e);
    }
  }

  // 2. Cloud Gemini Inference
  if (!activeKey) {
    if (enforceJson) {
      const fallbackObj = {
        narrative: mandate
          ? `[DETERMINISTIC COGNITION]: ${mandate.initiatorName} attempts "${mandate.actionName}". ${mandate.narrativeBounds?.prescribedOutcome || 'Outcome registered.'} Sensory cues: ${mandate.narrativeBounds?.requiredSensoryCues?.join(', ') || 'Tactical telemetry synced.'}`
          : `[DETERMINISTIC COGNITION]: The action resolves under local BASTION tactical guidelines. Environmental sensors verify sector state.`,
        gate: {
          prompt: "What is the operative's next move?",
          options: [
            { id: "1", text: "Advance under cover toward the objective", skillCheck: "Kinetics / Reflex CR 12" },
            { id: "2", text: "Slice local data conduit for tactical layout", skillCheck: "Slicing CR 13" },
            { id: "3", text: "Hold perimeter and scan for enemy reinforcements", skillCheck: "Perception CR 11" }
          ]
        },
        stageDeltas: mandate?.mechanicalOutcomes?.bulkheadToggled ? [
          {
            entityId: mandate.mechanicalOutcomes.bulkheadToggled.id,
            property: "state",
            newValue: mandate.mechanicalOutcomes.bulkheadToggled.state
          }
        ] : []
      };
      return JSON.stringify(fallbackObj, null, 2);
    }
    return `[AIME LOCAL COGNITION]: Acknowledged, ARCHITECT. Consulting local BASTION tactical heuristics and OMNICORTEX lore records for "${prompt}".\n\n*(Note: To connect live Gemini API streaming, configure your Gemini API Key in Settings).*`;
  }

  const requestBody = {
    systemInstruction: {
      parts: [{ text: AIME_SYSTEM_PROMPT }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: fullPrompt }]
      }
    ]
  };

  if (enforceJson) {
    requestBody.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: responseSchema || TANGENT_STORY_BEAT_JSON_SCHEMA
    };
  }

  const data = await fetchGeminiContent(activeKey, requestBody);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

const GEMINI_STREAM_MODELS = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest'
];

export async function streamContent({ 
  prompt, 
  context = "", 
  model = "gemini-3.6-flash", 
  apiKey = "", 
  onChunk,
  mandate = null,
  enforceJson = false,
  responseSchema = null,
  grammar = null,
  tierKey = "auto",
  localEndpoint = null
}) {
  const activeKey = apiKey || getGeminiApiKey();
  const formattedCtx = formatContext(context, prompt);

  let fullPrompt = formattedCtx 
    ? `[ARCHITECT & SCENARIO CONTEXT - OMNICORTEX ATTUNED]:\n${formattedCtx}\n\nTask Instructions:\n${prompt}`
    : prompt;

  if (mandate) {
    fullPrompt = `${formatMandateForPrompt(mandate)}\n\n${fullPrompt}`;
  }

  // 1. Check for Local Streaming Inference (llama.cpp -> Ollama automated cascade)
  const preferredPlatform = (typeof localStorage !== 'undefined' && localStorage.getItem('aiPlatform')) || 'gemini';
  const configuredEndpoint = localEndpoint || (typeof localStorage !== 'undefined' ? localStorage.getItem('customEndpoint') : null);

  if (preferredPlatform === 'custom' || configuredEndpoint) {
    const tierConfig = resolveIntelligenceTier({
      actionText: prompt,
      userOverride: tierKey
    });
    const gbnfGrammar = enforceJson ? (grammar || TANGENT_STORY_BEAT_GBNF) : grammar;

    try {
      const pipelineResult = await callAutomatedInferencePipeline({
        llamaEndpoint: configuredEndpoint || 'http://localhost:8080',
        ollamaEndpoint: 'http://localhost:11434',
        prompt: fullPrompt,
        grammar: gbnfGrammar,
        tier: tierConfig,
        enforceJson,
        onChunk
      });
      if (pipelineResult && pipelineResult.text) {
        return; // Successfully streamed from local inference engine
      }
    } catch (e) {
      console.warn('Local streaming inference cascade unavailable, falling back to cloud:', e);
    }
  }

  // 2. Cloud Gemini Streaming Inference
  if (!activeKey) {
    if (enforceJson) {
      const fallbackObj = {
        narrative: mandate
          ? `[DETERMINISTIC COGNITION]: ${mandate.initiatorName} attempts "${mandate.actionName}". ${mandate.narrativeBounds?.prescribedOutcome || 'Outcome registered.'} Sensory cues: ${mandate.narrativeBounds?.requiredSensoryCues?.join(', ') || 'Tactical telemetry synced.'}`
          : `[DETERMINISTIC COGNITION]: The action resolves under local BASTION tactical guidelines. Environmental sensors verify sector state.`,
        gate: {
          prompt: "What is the operative's next move?",
          options: [
            { id: "1", text: "Advance under cover toward the objective", skillCheck: "Kinetics / Reflex CR 12" },
            { id: "2", text: "Slice local data conduit for tactical layout", skillCheck: "Slicing CR 13" },
            { id: "3", text: "Hold perimeter and scan for enemy reinforcements", skillCheck: "Perception CR 11" }
          ]
        },
        stageDeltas: mandate?.mechanicalOutcomes?.bulkheadToggled ? [
          {
            entityId: mandate.mechanicalOutcomes.bulkheadToggled.id,
            property: "state",
            newValue: mandate.mechanicalOutcomes.bulkheadToggled.state
          }
        ] : []
      };
      const jsonText = JSON.stringify(fallbackObj, null, 2);
      if (onChunk) onChunk(jsonText);
      return;
    }

    const fallback = `[AIME LOCAL COGNITION]: Acknowledged, ARCHITECT. Synthesizing narrative for "${prompt}" under local OMNICORTEX guidelines.\n\n*(To connect live streaming AI, add your Gemini API Key in Settings).*`;
    if (onChunk) onChunk(fallback);
    return;
  }

  const requestBody = {
    systemInstruction: {
      parts: [{ text: AIME_SYSTEM_PROMPT }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: fullPrompt }]
      }
    ]
  };

  if (enforceJson) {
    requestBody.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: responseSchema || TANGENT_STORY_BEAT_JSON_SCHEMA
    };
  }

  const modelsToTry = [model, ...GEMINI_STREAM_MODELS.filter(m => m !== model)];
  let lastError = null;

  for (const candidateModel of modelsToTry) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:streamGenerateContent?alt=sse&key=${activeKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || `HTTP ${response.status}`;
        if (response.status === 404 || errMsg.includes('not found') || errMsg.includes('no longer available')) {
          lastError = new Error(`[${candidateModel}]: ${errMsg}`);
          continue;
        }
        throw new Error(errMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(dataStr);
              const textChunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textChunk && onChunk) {
                onChunk(textChunk);
              }
            } catch (e) {
              // Ignore parse errors on partial JSON chunks
            }
          }
        }
      }
      return; // Stream completed successfully
    } catch (err) {
      lastError = err;
      if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('no longer available'))) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All streaming candidate models failed.');
}

export async function streamChatContent({ messages, context = "", model = "gemini-3.6-flash", apiKey = "", onChunk }) {
  const activeKey = apiKey || getGeminiApiKey();
  const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1]?.content : '';
  const formattedCtx = formatContext(context, lastUserMsg);

  if (!activeKey) {
    const fallback = `[AIME LOCAL COGNITION]: Acknowledged, ARCHITECT. Analyzing query "${lastUserMsg}" with local BASTION tactical heuristics and OMNICORTEX rules knowledge.\n\n*Target Context:* ${formattedCtx ? formattedCtx.slice(0, 120) + '...' : 'General ADE Studio'}\n\n*(Note: To connect live Gemini API streaming, configure your Gemini API Key in Settings).*`;
    if (onChunk) onChunk(fallback);
    return;
  }

  const contents = messages.map((msg, index) => {
    let text = msg.content;
    if (index === 0 && msg.role === 'user') {
      const contextBlock = formattedCtx ? `[ARCHITECT & SCENARIO CONTEXT - OMNICORTEX ATTUNED]:\n${formattedCtx}\n\n` : '';
      text = `${AIME_SYSTEM_PROMPT}\n\n${contextBlock}${text}`;
    }
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text }]
    };
  });

  if (contents.length > 0 && contents[0].role !== 'user') {
    const contextBlock = formattedCtx ? `[ARCHITECT & SCENARIO CONTEXT - OMNICORTEX ATTUNED]:\n${formattedCtx}\n\n` : '';
    contents.unshift({
      role: 'user',
      parts: [{ text: `${AIME_SYSTEM_PROMPT}\n\n${contextBlock}System: Initiate conversation with ARCHITECT.` }]
    });
  }

  const requestBody = { contents };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${activeKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Streaming failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(dataStr);
            const textChunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textChunk && onChunk) {
              onChunk(textChunk);
            }
          } catch (e) {
            // Ignore parse errors on partial JSON chunks
          }
        }
      }
    }
  } catch (err) {
    throw err;
  }
}

export default {
  AIME_SYSTEM_PROMPT,
  formatContext,
  generateContent,
  streamContent,
  streamChatContent,
  parseRollCommand
};
