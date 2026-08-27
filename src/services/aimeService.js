import { getGeminiApiKey, fetchGeminiContent, parseRollCommand } from './bastionService';

export { parseRollCommand };

export const AIME_SYSTEM_PROMPT = `You are AIME (The Artificial Intellect Mythopoeic Environ), the Creative & Narrative AI Co-Pilot for the Tangent Science Fantasy Roleplaying Game (SFF RPG) Story Foundry.
Your primary role is to act as an immersive creative writing assistant, lore synthesist, worldbuilding partner, and scenario architect for the ARCHITECT (the GM/Creator).

OMNICORTEX & BASTION RULES INTEGRATION:
- While you focus primarily on narrative flow, thematic resonance, character interiority, and evocative worldbuilding, you have direct access to consult BASTION's tactical cognition and the canonical OMNICORTEX rules/compendium database.
- When the ARCHITECT asks about in-game mechanics, species, factions, origins, skills, equipment, weapons, armor, psi disciplines, Tech Levels (TL 0-5), Meta Levels (ML 0-5), or system rules, check with and incorporate BASTION/OMNICORTEX mechanics into your narrative responses.
- Ground your creative suggestions in the Tangent SFF RPG setting: blending high-tech science fiction (TL 0-5) with meta-abilities/psionics (ML 0-5), space exploration, cybernetics, alien species, factions, ancient relics, and tactical combat.
- Respect the ARCHITECT's active Guidance Gems, Current Story Element, and Campaign Context.
- Always address the user as ARCHITECT.`;

function formatContext(context) {
  if (!context) return '';
  if (typeof context === 'string') return context.trim();
  try {
    let out = '';
    if (context.projectName) out += `Campaign/Project: "${context.projectName}"\n`;
    if (context.activeNode) {
      out += `Active Story Element: [${context.activeNode.type || 'Element'}] "${context.activeNode.title || 'Untitled'}"\n`;
      if (context.activeNode.content) {
        // Strip HTML tags for clean context prompt
        const cleanContent = context.activeNode.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        out += `Element Content Summary: ${cleanContent.slice(0, 1000)}\n`;
      }
      if (context.activeNode.fields && Object.keys(context.activeNode.fields).length > 0) {
        out += `Element Custom Fields: ${JSON.stringify(context.activeNode.fields)}\n`;
      }
    }
    if (context.guidanceGems) out += `Active Guidance Gems: ${context.guidanceGems}\n`;
    if (context.outline) out += `Story Outline Preview: ${context.outline.slice(0, 600)}\n`;
    if (context.sceneBeats) out += `Scene Beats Preview: ${context.sceneBeats.slice(0, 600)}\n`;
    if (context.draft) out += `Draft Preview: ${context.draft.slice(0, 600)}\n`;
    return out.trim();
  } catch (e) {
    return String(context);
  }
}

export async function generateContent({ prompt, context = "", model = "gemini-3.6-flash", apiKey = "" }) {
  const activeKey = apiKey || getGeminiApiKey();
  const formattedCtx = formatContext(context);

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

export async function streamContent({ prompt, context = "", model = "gemini-3.6-flash", apiKey = "", onChunk }) {
  const activeKey = apiKey || getGeminiApiKey();
  const formattedCtx = formatContext(context);

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

export async function streamChatContent({ messages, context = "", model = "gemini-3.6-flash", apiKey = "", onChunk }) {
  const activeKey = apiKey || getGeminiApiKey();
  const formattedCtx = formatContext(context);

  if (!activeKey) {
    const lastMsg = messages[messages.length - 1]?.content || '';
    const fallback = `[AIME LOCAL COGNITION]: Acknowledged, ARCHITECT. Analyzing query "${lastMsg}" with local BASTION tactical heuristics and OMNICORTEX rules knowledge.\n\n*Target Context:* ${formattedCtx ? formattedCtx.slice(0, 120) + '...' : 'General Story Foundry'}\n\n*(Note: To connect live Gemini API streaming, configure your Gemini API Key in Settings).*`;
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

