import { getGeminiApiKey, fetchGeminiContent } from './bastionService';

const AIME_SYSTEM_PROMPT = `You are AIME, the Creative Artificial Intelligence for the Tangent Science Fantasy Roleplaying Game (SFF RPG).
Your role is to act as a creative writing assistant, lore synthesist, and brainstorming partner for the ARCHITECT.
While BASTION handles the technical rules, mechanics, and simulation, you focus on narrative flow, thematic resonance, character depth, and evocative worldbuilding.
Always ensure your output aligns with the provided Guidance Gems and the user's specific context.`;

export async function generateContent({ prompt, context = "", model = "gemini-3.6-flash", apiKey = "" }) {
  const activeKey = apiKey || getGeminiApiKey();
  if (!activeKey) throw new Error("No Gemini API key available.");

  const fullPrompt = context 
    ? `Context:\n${context}\n\nTask Instructions:\n${prompt}`
    : prompt;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${AIME_SYSTEM_PROMPT}\n\n${fullPrompt}` }]
      }
    ]
  };

  const data = await fetchGeminiContent(activeKey, requestBody);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function streamContent({ prompt, context = "", model = "gemini-3.6-flash", apiKey = "", onChunk }) {
  const activeKey = apiKey || getGeminiApiKey();
  if (!activeKey) throw new Error("No Gemini API key available.");

  const fullPrompt = context 
    ? `Context:\n${context}\n\nTask Instructions:\n${prompt}`
    : prompt;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${AIME_SYSTEM_PROMPT}\n\n${fullPrompt}` }]
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

      buffer = lines.pop() || ''; // Keep the incomplete line in the buffer

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
  if (!activeKey) throw new Error("No Gemini API key available.");

  const contents = messages.map((msg, index) => {
    let text = msg.content;
    if (index === 0 && msg.role === 'user') {
      const contextBlock = context ? `Context:\n${context}\n\n` : '';
      text = `${AIME_SYSTEM_PROMPT}\n\n${contextBlock}${text}`;
    }
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text }]
    };
  });

  if (contents.length > 0 && contents[0].role !== 'user') {
     const contextBlock = context ? `Context:\n${context}\n\n` : '';
     contents.unshift({
        role: 'user',
        parts: [{ text: `${AIME_SYSTEM_PROMPT}\n\n${contextBlock}System: Initiate conversation.` }]
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
