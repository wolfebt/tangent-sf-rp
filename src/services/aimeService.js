import { getGeminiApiKey, fetchGeminiContent, parseRollCommand } from './bastionService';
import { hydrateElementEntities } from './entityHydrator';
import { queryOmnicortexRAG, formatRagContextForAIME } from './omnicortexVectorRag';

export { parseRollCommand };

export const AIME_SYSTEM_PROMPT = `You are AIME (The Artificial Intellect Mythopoeic Environ), the Creative & Narrative AI Co-Pilot for the Tangent Science Fantasy Roleplaying Game (SFF RPG) Story Foundry.
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
    let out = '';
    if (context.projectName) out += `Campaign/Project: "${context.projectName}"\n`;
    
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

export async function generateContent({ prompt, context = "", model = "gemini-3.6-flash", apiKey = "" }) {
  const activeKey = apiKey || getGeminiApiKey();
  const formattedCtx = formatContext(context, prompt);

  if (!activeKey) {
    return `[AIME LOCAL COGNITION]: Acknowledged, ARCHITECT. Consulting local BASTION tactical heuristics and OMNICORTEX lore records for "${prompt}".\n\n*(Note: To connect live Gemini API streaming, configure your Gemini API Key in Settings).*`;
  }

  const fullPrompt = formattedCtx 
    ? `[ARCHITECT & SCENARIO CONTEXT - OMNICORTEX ATTUNED]:\n${formattedCtx}\n\nTask Instructions:\n${prompt}`
    : prompt;

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

  const data = await fetchGeminiContent(activeKey, requestBody);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

const GEMINI_STREAM_MODELS = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest'
];

export async function streamContent({ prompt, context = "", model = "gemini-3.6-flash", apiKey = "", onChunk }) {
  const activeKey = apiKey || getGeminiApiKey();
  const formattedCtx = formatContext(context, prompt);

  if (!activeKey) {
    const fallback = `[AIME LOCAL COGNITION]: Acknowledged, ARCHITECT. Synthesizing narrative for "${prompt}" under local OMNICORTEX guidelines.\n\n*(To connect live streaming AI, add your Gemini API Key in Settings).*`;
    if (onChunk) onChunk(fallback);
    return;
  }

  const fullPrompt = formattedCtx 
    ? `[ARCHITECT & SCENARIO CONTEXT - OMNICORTEX ATTUNED]:\n${formattedCtx}\n\nTask Instructions:\n${prompt}`
    : prompt;

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
    const fallback = `[AIME LOCAL COGNITION]: Acknowledged, ARCHITECT. Analyzing query "${lastUserMsg}" with local BASTION tactical heuristics and OMNICORTEX rules knowledge.\n\n*Target Context:* ${formattedCtx ? formattedCtx.slice(0, 120) + '...' : 'General Story Foundry'}\n\n*(Note: To connect live Gemini API streaming, configure your Gemini API Key in Settings).*`;
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
