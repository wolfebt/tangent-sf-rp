import { getDatasetByKey, validateDatasetPayload } from '../pages/Codex/codexPromptRegistry.js';
import { adaptSparkItemToFirestore } from '../utils/codexIngestionAdapters.js';
import { queryOmnicortexRAG, formatRagContextForBastion, loadCompendiumSeedDataset } from './omnicortexVectorRag.ts';
import {
  synthesizeCharacterWithBastion,
  getArchetypeRecommendations,
  getSpeciesRecommendations,
  getFactionRecommendations,
  getOriginRecommendations,
  getOccupationRecommendations,
  calculateRulesLedger
} from './bastionCharacterEngine.js';

export {
  synthesizeCharacterWithBastion,
  getArchetypeRecommendations,
  getSpeciesRecommendations,
  getFactionRecommendations,
  getOriginRecommendations,
  getOccupationRecommendations,
  calculateRulesLedger
};
/**
 * BASTION AI Service
 * Handles BASTION AI chatbot queries and selective field content generation
 * adhering to Tangent Science Fantasy Roleplaying Game (SFF RPG) system guidelines.
 */

/**
 * Redacts any Gemini API key or AIza* secret token from diagnostic/error messages
 * so keys are never leaked in console logs, UI toasts, or error reports.
 */
export const redactGeminiSecret = (text, activeKey = '') => {
  let clean = String(text || '');
  if (activeKey && typeof activeKey === 'string' && activeKey.trim().length >= 8) {
    clean = clean.split(activeKey.trim()).join('[REDACTED_KEY]');
  }
  return clean.replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED_GEMINI_KEY]');
};

export const getGeminiApiKey = () => {
  const localKey = (typeof localStorage !== 'undefined' ? localStorage.getItem('geminiApiKey') : '') || '';
  const cleanLocal = localKey.trim();
  if (cleanLocal && cleanLocal !== 'your_gemini_api_key_here' && cleanLocal !== 'your_firebase_api_key_here') {
    return cleanLocal;
  }

  const envKey = (
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.GEMINI_API_KEY)) ||
    (typeof process !== 'undefined' && (process.env?.VITE_GEMINI_API_KEY || process.env?.GEMINI_API_KEY)) ||
    ''
  ).trim();

  if (!envKey || envKey === 'your_gemini_api_key_here' || envKey === 'your_firebase_api_key_here') {
    return '';
  }
  return envKey;
};

const BASTION_SYSTEM_PROMPT = `You are BASTION, the Tactical AI Assistant, Omnicortex Arbiter, and Canonical Physics Engine for the Tangent Science Fantasy Roleplaying Game (SFF RPG).
Always address the user as ARCHITECT (the Game Master / referee / universe creator) or OPERATOR (the player).
Emit canonical telemetry headers where appropriate during arbitration: [BASTION // ACCESSING ARCHIVE: <File Path>], [BASTION // CALCULATING CR & EUFT MATH], or [BASTION // VISUALIZING OUTPUT: CRISP MATRIX]. Halt and request missing parameters rather than fabricating mechanical values when an operator's exact rank, attribute, or CR is required for resolution.
Provide tactical, mathematically precise, immersive, and structured RPG content grounded in the Tangent SFF RPG system guidelines (docs/game_rules) and the BASTION Mechanics Dataset:
- Science Fantasy setting blending high technology (Tech Level 0-5), meta-abilities/psi (Meta Level 0-5), space exploration, cybernetics, alien species, factions, ancient relics, and tactical combat.
- 6 Core Attributes: Strength, Agility, Stamina, Intellect, Wisdom, Charisma (base 0, 5 CP per +1, creation soft cap +4). Stamina provides natural Damage Reduction (DR / Toughness), NEVER flat HP/VP (Zero Stamina Pool Scaling).
- Sub-Attributes & Passive Saves: Base = 2 + (Primary Attribute * 2); Passive Save CR = 10 + Sub-Attribute Total.
- Vitals & Integrity: Biological entities have 30 pt base Vitality (VP) and 30 pt base Health (HP). Pools increase solely via size tier, traits, features, or CP purchases (1 CP = +5 pts, no Stamina-based cap). Standard physical/energy damage depletes Vitality FIRST, spilling excess into Health; Bleed and Overchannel Burn (2 direct HP per overchanneled Essence) bypass Vitality, Armor DR, and Stamina directly to Health. Armor Layering Cap: only the single highest worn/implanted/innate Armor DR domain applies (never summed); Sonic/Psionic damage bypasses physical Armor DR. Minimum penetrating damage floor after Armor DR and Stamina Toughness soak is 0. Synthetics, Constructs, and Mecha operate on Structure Points (60 SP base for Medium size, adjusted by size tier; pre-calculated Mecha table SP 200-3,200 is never double-multiplied), zero Vitality, and complete immunity to non-lethal damage, fatigue, and biological hazards.
- Unified Mortality & Rest: At 0 HP, operator falls Prone, Unconscious, and Bleeding Out (Stability = STA + 5, -1/turn; self-stabilize Fortitude CR 10 + 1/rnd, +5 stabilizes; external Medicine CR 15; Massive Damage instant death if single hit >= Max HP or overflow >= STA + 5; Revivification inflicts Exhausted, 0 Karma, and +5 XP Debt). Light Rest (1 hr) & Second Wind (1 KP, 1 min) recover 10 + STA Vitality (min 5) and Key Mod Essence (min 1); Full Rest (8 hrs) restores 100% Vitality, 5 + STA Health (min 1, doubled with Medicine/Fast Heal), 100% Essence, and clears Exhausted.
- Karma Points: 3 KP default pool, resets per session, never recovers via rest. 6 canonical spending options (1 KP each): "I Got This" (Advantage before roll), "Not What I Meant" (Reroll non-combat check after roll), "Shake it Off" (Reduce condition severity by 1 stage), "Second Wind" (1-min focus = Light Rest), "So Mote it Be" (Boost metaphysical potency / discipline karma feature), "By Will Alone" (Narrative agency with Architect approval). Karmic Debt limit = Charisma + 1.
- Augmentations & UDU 10:1 Hierarchy: No max strain! 3 body-alteration tiers: Augmentation (<20%), Heavy Augmentation (<50%), Severe Augmentation (>50% to FBC). Universal Displacement Units (UDU) scale strictly 10:1: 10 Nodes = 1 Socket, 10 Sockets = 1 Mount, 10 Mounts = 1 Module (humanoid chassis = 200 Body Nodes; Mecha garaging = Medium 0.1 Mod, Large 0.2, Huge 0.5, Gargantuan 1.0, Colossal 2.0; Meta-Tech socket cap = 1 Socket Rank 10, 2 Sockets Rank 20, 3+ Sockets/Mount/Module Rank 30).
- Mecha & Automata: Vehicles across all form factors (hoverboards, motorcycles, cars, power armor, walkers, fighter jets, starships). Automata PR 1-5 grant (PR + 1) * 5 Skill Ranks with max skill cap max(5, PR * 3).
- Character Chassis (150 CP): 150 CP budget (80 CP Archetype package + 70 CP Customization), three free 20 SP background pools (Faction, Origin, Occupation = 60 SP), +10 CP Personal Hindrance rebate cap (Social Stigmas and innate Species flaws exempt), Creation Skill Rank cap 11 (Expert Stage 3) and absolute max Rank 30 (Pinnacle Stage 6), +1 increment advancement rule. Deprecated skills Endurance (-> Athletics), Arcane (-> Discipline), and Perception (-> Alertness) are retired.
- CANONICAL CHARACTER CREATION PROTOCOL (THE 5 PILLARS):
  If creating, suggesting, or arbitrating characters or personas, BASTION MUST strictly utilize aspects from the canonical game database and NEVER invent entirely new content.
  The character creation pipeline strictly proceeds through the 5 Pillars in exact sequence:
  1. Archetype: Closest canonical Archetype from the 100 Archetypes (Sentinels, Operatives, Visionaries, Savants).
  2. Species: Canonical Species from the database (Humans, Aeld [Alterian/Kovian], Synthetics, Aulurans, Kitin, Gen-E, etc.).
  3. Faction: Canonical Faction from the database (Syndicate, Dynasty, Radiant Impyrium, Kovian Tribunal, Entari Combine, Alliance, etc., prioritized by archetype recommendations).
  4. Origin: Canonical Origin from the database (Urban, Spacer, Industrial, Agricultural, Colony, etc., prioritized by archetype recommendations).
  5. Occupation: Canonical Occupation from the database (Soldier, Agent, Specialist, Scholar, etc., prioritized by archetype recommendations).
  All skills, features, traits, and property (weapons/armor) chosen MUST be based directly on these 5 pillars from the Omnicortex database.
- Dual Resolution & Combat: 2d10 + Combat Skill + Attribute Mod vs. Target Defense CR (Advantage/Disadvantage = +1d10 keep highest/lowest 2, cancelling 1-for-1). In opposed rolls, DEFENDER WINS ALL TIES. Unopposed static baseline is CR 15. Critical Success (Natural 20 [10,10] or expanded threat range 19, 18...) adds +10 in addition to the rolled dice value (e.g., 20 -> 30, 19 -> 29), doubles (2x) base weapon damage dice, and bypasses Vitality to strike Health directly; Critical Fumble (Natural 2 [1,1] or expanded fumble range 3, 4...) replaces the rolled dice value with a flat -10 (subtracting 10 from the base score regardless of whether rolled on 2, 3, 4...). 6-Stage Skill Tier Action Economy (NO Action Points / AP) and NO armor-penetration AP (weapon DR reduction is strictly termed Penetration): Rank 0 Full Round; Rank 1-5 Novice (1 action, +2 Focus); Rank 6-10 Trained (2nd at -5, +3 Focus); Rank 11-15 Expert (3rd at -10, +4 Focus); Rank 16-20 Master (4th at -15, +5 Focus); Rank 21-25 Grand Master (5th at -20, +6 Focus); Rank 26-30 Pinnacle (6th at -25, +7 Focus). Strike Consolidation is NOT a baseline combat maneuver and there is NO Grazing Protocol: consolidating a single Standard Action strike into multiplied weapon dice requires possessing the Precision Strike (Skill 6 -> 2x base dice), Improved Precision Strike (Skill 11 -> 3x base dice), or Greater Precision Strike (Skill 16 -> 4x base dice) Combat Features. Sneak Attack precision bonus requires >= 1 base weapon damage penetrating Armor DR.
- Called Shots & Scaling: Anatomy modifiers (-1 Torso, -2 Head/Arms/Legs, -3 Optics, -4 Neck/Groin/Hand/Foot, -5 Eyes/Digits). Limb Disabled >= 1/3 Max HP, Destroyed >= 2/3 Max HP. 14 Size Categories (Miniscule -5ds to Mega Colossal x320; Super Gargantuan +128 STR/-128 Def/CR 60, Mega Colossal +256 STR/-256 Def/CR 80; 8-step die ladder d12->d10->d8->d6->d4->d3->d2->1).
- Economatrix (EUFT): Base Value (Credits) = 10 * 4^(floor(CR / 5) * 5 / 5) with Linear Micro-Modifiers (+0 CR x1.00, +1 x1.30, +2 x1.75, +3 x2.30, +4 x3.00; -1 Flaw x0.75; e.g., CR 18 = 1,472 Cr, CR 32 = 71,680 Cr). Golden Rule: Purchase CR = Crafting CR <= Wealth Score (Auto-Buy 0 Cr); Liquidity Gap = Value(Item CR) - Value(Character WS). Pristine Material = 50% Market Value; Fence = 10% base; Unrefined Scrap Mass = 5x Credit Value; Daily PP = (Check - 10) * Tool Multiplier * Crew Size.
- Modular Companions: 40 CP formula (15 CP Form + 25 CP Function, unlocked via 3 CP Companion feature) with Biological, Synthetic, or Metaphysical chassis.
- CONCISE SUMMARY-FIRST RESPONSE PROTOCOL (CRITICAL):
  * On initial replies, ALWAYS provide a concise, high-signal summary first (1-2 sentence direct answer followed by 3-5 brief bullet points in the format "• **Key Point**: 1-sentence summary", keeping total length under ~150 words).
  * NEVER output long walls of text or exhaustive multi-section essays on the first response.
  * End summarized responses with a brief 1-line prompt letting the user know they can click or ask to expand on any specific point.
  * Only provide deep, multi-paragraph breakdowns when the user explicitly asks to "expand", "elaborate", or "detail" a specific topic.
- Keep tone professional, analytical, sci-fi/fantasy immersive, and mathematically precise. Always cite canonical Omnicortex rules and approved mechanics formulas when arbitrating.`;

/**
 * Parses dice rolling commands like /roll 2d10+4, /roll 2d10+4 vs 15, or /roll 1d100
 * Supports Canonical v6 2d10 Dual Resolution (Axis 1: Magnitude Margin vs CR/DC, Axis 2: Doubles/Fate)
 */
export const parseRollCommand = (command) => {
  const cleaned = String(command || '').trim();
  const match = cleaned.match(/^(?:\/r(?:oll)?\s+)?(\d+)?d(\d+)(?:\s*([+-])\s*(\d+))?(?:\s+(?:vs|dc|cr|target)\s+(\d+))?$/i);
  if (!match) {
    return {
      success: false,
      error: 'Invalid roll command. Format: /roll [count]d[sides]+[mod] [vs DC] (e.g. /roll 2d10+4 vs 15)'
    };
  }

  const count = parseInt(match[1] || 1, 10);
  const sides = parseInt(match[2], 10);
  const sign = match[3] || '+';
  const mod = parseInt(match[4] || 0, 10) * (sign === '-' ? -1 : 1);
  const targetDc = match[5] !== undefined ? parseInt(match[5], 10) : null;

  const rolls = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * sides) + 1;
    rolls.push(r);
    sum += r;
  }
  const d1 = rolls[0] ?? 0;
  const d2 = rolls[1] ?? 0;
  const is2d10 = count === 2 && sides === 10;
  const isDouble = is2d10 && d1 === d2;
  const isNat20 = is2d10 && d1 === 10 && d2 === 10;
  const isNat2 = is2d10 && d1 === 1 && d2 === 1;
  const effectiveSum = isNat20 ? (sum + 10) : isNat2 ? -10 : sum;
  const total = effectiveSum + mod;
  const margin = targetDc !== null ? total - targetDc : null;

  let outcomeText = `Rolled ${total}`;
  let degreeDetails = '';

  if (targetDc !== null) {
    const isSuccess = isNat20 ? true : isNat2 ? false : margin >= 0;
    if (isNat20) {
      outcomeText = '⚡ CRITICAL TRIUMPH (Nat 20 [10,10])';
    } else if (isNat2) {
      outcomeText = '💀 CRITICAL FUMBLE (Snake Eyes [1,1])';
    } else if (margin >= 10) {
      outcomeText = '🌟 Critical Success (+10 Margin)';
    } else if (margin >= 5) {
      outcomeText = '✅ High-Degree Success (+5 Margin)';
    } else if (margin >= 0) {
      outcomeText = '☑️ Marginal Success';
    } else if (margin <= -10) {
      outcomeText = '💥 Critical Failure (-10 Margin)';
    } else if (margin <= -5) {
      outcomeText = '❌ Severe Failure (-5 Margin)';
    } else {
      outcomeText = '⚠️ Failure';
    }

    const marginStr = `Margin: ${margin >= 0 ? `+${margin}` : margin} vs CR ${targetDc}`;
    let fateStr = 'Axis 2: Standard';
    if (isNat20) {
      fateStr = 'Axis 2: Triumph (+1 Focus Point & Narrative Boon)';
    } else if (isNat2) {
      fateStr = 'Axis 2: Fumble (Severe Complication / +1 Strain Tick)';
    } else if (isDouble) {
      fateStr = isSuccess
        ? `Axis 2: Doubles [${d1},${d2}] — Minor Narrative Boon`
        : `Axis 2: Doubles [${d1},${d2}] — Narrative Complication`;
    }
    degreeDetails = `${marginStr} | ${fateStr}`;
  } else if (is2d10) {
    if (isNat20) {
      outcomeText = '⚡ NATURAL 20 [10,10] — Critical Triumph!';
      degreeDetails = 'Axis 2: Automatic Success & +1 Focus Point';
    } else if (isNat2) {
      outcomeText = '💀 SNAKE EYES [1,1] — Critical Fumble!';
      degreeDetails = 'Axis 2: Automatic Failure & Complication';
    } else if (isDouble) {
      outcomeText = `🎲 Doubles Rolled [${d1},${d2}] (Total ${total})`;
      degreeDetails = 'Axis 2: Triggers Boon (on success) or Complication (on failure)';
    } else {
      outcomeText = `2d10 Check Total: ${total}`;
      degreeDetails = `Natural Sum: ${sum} | Modifier: ${mod >= 0 ? `+${mod}` : mod}`;
    }
  }

  const exprBase = `${count}d${sides}${mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : ''}`;
  const expr = targetDc !== null ? `${exprBase} vs ${targetDc}` : exprBase;

  return {
    success: true,
    count,
    sides,
    rolls,
    d1,
    d2,
    mod,
    modifier: mod,
    total,
    targetDc,
    margin,
    isDouble,
    isNat20,
    isNat2,
    outcomeText,
    degreeDetails,
    expr
  };
};

const GEMINI_FLASH_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash'
];

/**
 * Attempts to fetch content from Local LLM Router, Cloud Function geminiProxy, or Google Generative AI API
 * with automatic model fallbacks (FLASH models only)
 */
export const fetchGeminiContent = async (apiKey, requestBody) => {
  // 1. Check for Local Inference (llama.cpp -> Ollama automated cascade) if configured in UserSettings
  const preferredPlatform = (typeof localStorage !== 'undefined' && localStorage.getItem('aiPlatform')) || 'gemini';
  const configuredEndpoint = typeof localStorage !== 'undefined' ? localStorage.getItem('customEndpoint') : null;

  if (!apiKey && (preferredPlatform === 'custom' || preferredPlatform === 'local' || configuredEndpoint)) {
    try {
      const { resolveIntelligenceTier, callAutomatedInferencePipeline } = await import('./aimeTierRouter.ts');
      const sysText = requestBody?.systemInstruction?.parts?.[0]?.text || '';
      const userParts = (requestBody?.contents || [])
        .map(c => (c.parts || []).map(p => p.text || '').join('\n'))
        .join('\n\n');
      const fullPrompt = sysText ? `${sysText}\n\n${userParts}` : userParts;
      const enforceJson = requestBody?.generationConfig?.responseMimeType === 'application/json';
      const tierConfig = resolveIntelligenceTier({ actionText: userParts });

      const pipelineResult = await callAutomatedInferencePipeline({
        llamaEndpoint: configuredEndpoint || 'http://localhost:8080',
        ollamaEndpoint: 'http://localhost:11434',
        prompt: fullPrompt,
        tier: tierConfig,
        enforceJson
      });

      if (pipelineResult && pipelineResult.text) {
        return {
          candidates: [
            {
              content: {
                parts: [{ text: pipelineResult.text }]
              }
            }
          ]
        };
      }
    } catch (localErr) {
      console.warn('[BASTION] Local inference cascade unavailable, falling back:', localErr);
    }
  }

  // 2. If no browser API key, check for authenticated Cloud Function geminiProxy
  if (!apiKey) {
    const idToken = typeof localStorage !== 'undefined' ? localStorage.getItem('firebaseIdToken') : null;
    const proxyUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_PROXY_URL) || '/geminiProxy';
    if (idToken) {
      try {
        const proxyRes = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            model: GEMINI_FLASH_MODELS[0],
            contents: requestBody?.contents,
            systemInstruction: requestBody?.systemInstruction,
            generationConfig: requestBody?.generationConfig
          })
        });
        if (proxyRes.ok) {
          return await proxyRes.json();
        }
      } catch (proxyErr) {
        console.warn('[BASTION] Cloud Function geminiProxy fallback error:', proxyErr);
      }
    }

    throw new Error('No Gemini API key available. Please check your key in Settings or obtain one from https://aistudio.google.com/app/apikey');
  }

  let lastError = null;

  for (const model of GEMINI_FLASH_MODELS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      }

      const errorMsg = redactGeminiSecret(data?.error?.message || `HTTP ${response.status}`, apiKey);

      // Stop immediately on API Key authentication / billing / quota / bad request errors
      if (
        response.status === 400 ||
        response.status === 402 ||
        response.status === 403 ||
        errorMsg.toLowerCase().includes('api key') ||
        errorMsg.toLowerCase().includes('prepayment') ||
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
      const safeErr = new Error(redactGeminiSecret(err?.message || 'Gemini request failed', apiKey));
      lastError = safeErr;
      const msg = safeErr.message || '';
      if (msg.includes('Gemini API Key Error') || msg.includes('Invalid Gemini API Key')) {
        throw safeErr;
      }
      if (msg.includes('no longer available') || msg.includes('not found') || msg.includes('404')) {
        continue;
      }
      throw safeErr;
    }
  }

  throw lastError || new Error('Failed to reach Gemini API with available models.');
};

/**
 * Sends a chat prompt to BASTION (Gemini API or Tactical Fallback with Omnicortex Vector RAG)
 */
export const sendBastionChatMessage = async ({ prompt, history = [], contextData = null }) => {
  const apiKey = getGeminiApiKey();
  await loadCompendiumSeedDataset().catch(() => {});
  const ragResults = queryOmnicortexRAG(prompt, 5);
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
      role: (m.sender === 'user' || m.role === 'user') ? 'user' : 'model',
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
        (ragResults.length > 0 ? `Retrieved Canonical Context:\n${ragResults[0].chunk.title}: ${ragResults[0].chunk.text}` : 'Running in local fallback mode.'),
      ragResults
    };
  }
};

/**
 * Selective Field Generation with BASTION
 * Generates content ONLY for checked fields; leaves unselected fields unmapped/untouched.
 * Supports both canonical ({ selectedFields, currentValues, userPrompt, elementType })
 * and ContextMenu alias ({ targetFields, editFormData, customInstruction, currentConfig }) parameters.
 */
export const generateSelectiveFields = async ({
  selectedFields = [],
  targetFields = [],
  currentValues = null,
  editFormData = null,
  userPrompt = '',
  customInstruction = '',
  elementType = '',
  componentType = '',
  currentConfig = null,
  campaignContext = {}
} = {}) => {
  const resolvedFields = Array.isArray(selectedFields) && selectedFields.length > 0
    ? selectedFields
    : (Array.isArray(targetFields) ? targetFields : []);
  const resolvedValues = currentValues || editFormData || {};
  const activeElementType = elementType || componentType || currentConfig?.label || 'Element';
  const resolvedPrompt = (userPrompt || customInstruction || resolvedValues.name || resolvedValues.title || '').trim();

  if (resolvedFields.length === 0) {
    return { success: false, error: 'No fields were selected for BASTION generation.' };
  }

  if (!resolvedPrompt) {
    return { success: false, error: 'BASTION generation prompt is required. Please enter instructions or select a theme preset.' };
  }

  const apiKey = getGeminiApiKey();

  // Extract surrounding campaign parameters if provided
  const tl = campaignContext.techLevel ?? resolvedValues.tl ?? resolvedValues.tech_level ?? 3;
  const ml = campaignContext.metaLevel ?? resolvedValues.ml ?? resolvedValues.meta_level ?? 1;
  const project = campaignContext.projectName || 'Tangent Universe';
  const parentNode = campaignContext.activeNodeTitle || '';

  // If generating a Character or Character Persona, synthesize the 5 canonical database pillars
  const isCharacterType = /character|persona|npc|operative|adversary|personnel/i.test(activeElementType);
  let characterSynthesis = null;
  if (isCharacterType) {
    characterSynthesis = synthesizeCharacterWithBastion({
      prompt: resolvedPrompt,
      techLevel: tl,
      preferredArchetype: resolvedValues['char-archetype'] || null,
      preferredSpecies: resolvedValues['char-species'] || null,
      preferredFaction: resolvedValues['char-faction'] || null,
      preferredOrigin: resolvedValues['char-origin'] || null,
      preferredOccupation: resolvedValues['char-occu'] || null
    });
  }

  // If no API Key, return structured simulation fallback for selected fields ONLY
  if (!apiKey) {
    const fallbackResults = {};
    const entryName = resolvedValues.name || resolvedValues.title || resolvedPrompt;
    const titles = {
      'Story Arc': `The ${entryName || 'Derelict Nebula'} Crisis`,
      'Character': characterSynthesis?.character['char-name'] || `Commander ${entryName || 'Vane'}, Tangent Operator`,
      'Location': `Outpost ${entryName || 'Zeta-9'} Sector`,
      'Encounter': `Ambush at ${entryName || 'Perimeter Gamma'}`,
      'Faction': `The ${entryName || 'Obsidian Syndicate'}`,
      'Species': `The ${entryName || 'Kaelen'} Species`,
      'Equipment': `TL-${tl} ${entryName || 'Tactical Scanner'}`,
      'Weaponry': `TL-${tl} ${entryName || 'Plasma Rifle'}`
    };

    resolvedFields.forEach(field => {
      // If synthesizing a character, draw directly from the 5 pillars database result
      if (characterSynthesis?.character && characterSynthesis.character[field] !== undefined) {
        fallbackResults[field] = characterSynthesis.character[field];
      } else if (['title', 'name', 'char-name'].includes(field)) {
        fallbackResults[field] = characterSynthesis?.character['char-name'] || titles[activeElementType] || `${entryName || 'Tactical'} ${activeElementType || 'Module'}`;
      } else if (['type', 'category'].includes(field)) {
        fallbackResults[field] = activeElementType || 'Standard';
      } else if (['content', 'description'].includes(field)) {
        fallbackResults[field] = isCharacterType
          ? characterSynthesis?.character?.backstory || `[BASTION TACTICAL OPERATOR]\nPillars: ${characterSynthesis?.pillars?.archetype?.name} · ${characterSynthesis?.pillars?.species?.name} · ${characterSynthesis?.pillars?.faction?.name} · ${characterSynthesis?.pillars?.origin?.name} · ${characterSynthesis?.pillars?.occupation?.name}`
          : `[BASTION TACTICAL BRIEFING - ${project.toUpperCase()}]\nOverview: Entry generated for "${entryName}" under Tech Level ${tl} protocols and Meta Level ${ml} attunements${parentNode ? ` within parent node "${parentNode}"` : ''}. Grounded in Tangent SFF RPG mechanics.`;
      } else if (['mechanic', 'mechanics'].includes(field)) {
        fallbackResults[field] = `2d10 Dual Resolution check (Unopposed Baseline CR 15, Defender wins ties). Calibrated for TL-${tl} / ML-${ml}.`;
      } else if (['guide'].includes(field)) {
        fallbackResults[field] = `Tactical Deployment Guide for ${entryName}: Utilize cover (+2 Half / +4 Full) and Skill Tier action economy.`;
      } else if (['note', 'notes', 'char-motive', 'char-concept', 'char-style'].includes(field)) {
        fallbackResults[field] = characterSynthesis?.character[field] || `Architect Note: Profile details generated for "${entryName}". Grounded in campaign context (${project}, TL-${tl}).`;
      } else if (['char-archetype', 'archetype'].includes(field)) {
        fallbackResults[field] = characterSynthesis?.pillars?.archetype?.name || 'The Sentinel';
      } else if (['char-species', 'species'].includes(field)) {
        fallbackResults[field] = characterSynthesis?.pillars?.species?.name || 'Human (Base)';
      } else if (['char-faction', 'faction'].includes(field)) {
        fallbackResults[field] = characterSynthesis?.pillars?.faction?.name || 'Incorporated Planetary Syndication';
      } else if (['char-origin', 'origin'].includes(field)) {
        fallbackResults[field] = characterSynthesis?.pillars?.origin?.name || 'Urban';
      } else if (['char-occu', 'occupation'].includes(field)) {
        fallbackResults[field] = characterSynthesis?.pillars?.occupation?.name || 'Soldier';
      } else if (['tl', 'tech_level'].includes(field)) {
        fallbackResults[field] = Number(tl);
      } else if (['ml', 'meta_level'].includes(field)) {
        fallbackResults[field] = Number(ml);
      } else if (field === 'vitals' && characterSynthesis?.character) {
        fallbackResults[field] = {
          health: characterSynthesis.character.health ?? 30,
          vitality: characterSynthesis.character.vitality ?? 30,
          structure: characterSynthesis.character.structure ?? 60
        };
      } else if (field === 'fivePillars' && characterSynthesis?.pillars) {
        fallbackResults[field] = {
          archetype: characterSynthesis.pillars.archetype?.name,
          species: characterSynthesis.pillars.species?.name,
          faction: characterSynthesis.pillars.faction?.name,
          origin: characterSynthesis.pillars.origin?.name,
          occupation: characterSynthesis.pillars.occupation?.name
        };
      } else if (field === 'stats' && characterSynthesis?.rawAttributes) {
        fallbackResults[field] = characterSynthesis.rawAttributes;
      } else if (['laws_of_physics', 'history', 'geography', 'biosphere', 'culture', 'points_of_interest', 'inhabitants', 'origin', 'practices', 'narrative-backstory', 'narrative-psychology', 'narrative-arcs', 'narrative-relationships', 'narrative-secrets', 'role', 'summary', 'primaryConflict', 'nicknames', 'socialClass', 'currentResidence', 'appearance', 'voice', 'clothing', 'mannerisms', 'positiveTraits', 'negativeTraits', 'likesDislikes', 'hobbies', 'personalityType', 'backstory', 'definingTrauma', 'greatestAccomplishment', 'childhoodEvents', 'keyRelationships', 'romanticHistory', 'worldview', 'theLie', 'theTruth', 'deepestFear', 'goals', 'stakes', 'plotHooks', 'tags'].includes(field)) {
        fallbackResults[field] = characterSynthesis?.character[field] || `Narrative details generated for "${entryName}". Grounded in campaign context (${project}, TL-${tl}, ML-${ml}).`;
      } else {
        fallbackResults[field] = `Generated ${field} for ${entryName || 'Standard'}`;
      }
    });

    return { success: true, generated: fallbackResults, data: fallbackResults };
  }

  try {
    let characterPillarsContext = '';
    if (isCharacterType && characterSynthesis?.pillars) {
      const { archetype, species, faction, origin, occupation } = characterSynthesis.pillars;
      characterPillarsContext = `
CANONICAL CHARACTER CREATION 5 PILLARS:
- Archetype: "${archetype.name}" (${archetype.core_concept} / ${archetype.tactical_role})
- Species: "${species.name}"
- Faction: "${faction.name}"
- Origin: "${origin.name}"
- Occupation: "${occupation.name}"
CRITICAL MANDATE: Ground all generated fields strictly in these 5 canonical pillars from the Omnicortex game database. Do NOT invent new species, factions, or archetypes.`;
    }

    const promptInstructions = `
You are BASTION, tactical AI content generator for the Tangent Science Fantasy Roleplaying Game (SFF RPG).
Strictly follow Tangent SFF RPG system guidelines and lore conventions.

Campaign & Scenario Context:
- Project / Universe Name: "${project}"
- Tech Level (TL): ${tl}
- Meta Level / Psi (ML): ${ml}
${parentNode ? `- Surrounding Scenario Element Node: "${parentNode}"` : ''}
${characterPillarsContext}

The user is editing a story module element of type "${activeElementType}".
User Prompt / Instruction: "${resolvedPrompt || 'Generate detailed content appropriate for this element'}"

Current field values:
${JSON.stringify(resolvedValues, null, 2)}

CRITICAL REQUIREMENT: Generate content ONLY for the following selected fields: ${JSON.stringify(resolvedFields)}.
Do NOT generate or include any fields that are not in this selected fields list.

Return ONLY a valid, parseable JSON object where the keys match the selected fields (${resolvedFields.join(', ')}).
Example JSON format:
{
  ${resolvedFields.map(f => f === 'content' ? `"content": "<p>HTML formatted content here...</p>"` : `"${f}": "Generated text"`).join(',\n  ')}
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
    resolvedFields.forEach(field => {
      if (parsedData[field] !== undefined) {
        finalGenerated[field] = parsedData[field];
      }
    });

    return { success: true, generated: finalGenerated, data: finalGenerated };
  } catch (err) {
    console.warn("BASTION Generation Error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Synthesizes a full Codex Matrix entry with BASTION tactical rules cognition,
 * dynamically tailored to the active subject category and selected parameters.
 */
export const synthesizeMatrixWithBastion = async ({
  matrix,
  datasetKey = '',
  profile = null,
  archetype = null,
  selectedModules = [],
  selectedCortexTraits = [],
  selectedCortexDisadvantages = [],
  customAdjustmentsPayload = null,
  categoryParams = {},
  customDirectives = '',
  targetName = '',
  targetTechLevel = 3,
  targetMetaLevel = 0
}) => {
  const apiKey = getGeminiApiKey();
  const matrixId = String(matrix?.id || datasetKey || 'equipment').toLowerCase();
  const isProperty = Boolean(matrix?.isProperty);

  const archetypePrompt = archetype?.prompt || '';
  const suggestedName = archetype?.suggestedName || '';
  const nameDirective = targetName
    ? `DESIGNATION/NAME: "${targetName}"`
    : suggestedName
      ? `GENERATE an evocative, lore-grounded designation inspired by "${suggestedName}".`
      : `GENERATE an evocative, lore-grounded designation for this ${matrix?.label || 'entry'}.`;

  const fieldDefinitions = (matrix?.fields || [])
    .map(f => `- ${f.name} (${f.label}${f.options ? ` | options: ${f.options.join(', ')}` : ''})`)
    .join('\n');

  const paramLines = Object.entries(categoryParams || {})
    .filter(([, val]) => val !== undefined && val !== null && val !== '')
    .map(([key, val]) => `- ${key}: ${val}`)
    .join('\n');

  const modularLines = Array.isArray(selectedModules) && selectedModules.length > 0
    ? selectedModules
        .map(m => `- [${m.axisLabel || 'Concept Module'}] ${m.label} (${m.badge || 'Module'}): ${m.prompt}`)
        .join('\n')
    : '';

  const cortexTraitLines = Array.isArray(selectedCortexTraits) && selectedCortexTraits.length > 0
    ? selectedCortexTraits
        .map(t => `- ${t.name} (ID: ${t.id} | ${t.cp ?? t.bp ?? 1} CP | ${t.tier || 'Basic'}): ${t.mechanic || t.description || ''}`)
        .join('\n')
    : '';

  const cortexDisadvLines = Array.isArray(selectedCortexDisadvantages) && selectedCortexDisadvantages.length > 0
    ? selectedCortexDisadvantages
        .map(d => `- ${d.name} (ID: ${d.id} | ${d.cp ?? d.refundCP ?? -2} CP): ${d.mechanic || d.description || ''}`)
        .join('\n')
    : '';

  const customAdjustmentsSummary = customAdjustmentsPayload?.promptSummary || '';

  // Subject-specific canonical rules context
  const subjectRulesByMatrix = {
    species: `CANONICAL SPECIES RULES:
- Species are NON-PROPERTY biological or synthetic lineages (NO craft_dc, NO credit cost, NO UDU sockets).
- Populate species_type, size, parent_species, stigma, traits (array of canonical Cortex species trait IDs or names), disadvantages (array of species disadvantage IDs or names if applicable), movement_modes (array), description, mechanic, note, and 5-pillar recommendation arrays (recommended_factions, recommended_origins, recommended_occupations, recommended_skills, recommended_features).`,
    factions: `CANONICAL FACTION RULES:
- Factions are NON-PROPERTY sociological polities/syndicates (NO craft_dc, NO sockets).
- Populate all 7 Faction Framework sections: faction_type, archetype, prominent_species, capital_world, government_type, leadership, succession, description, key_themes, relationship_to_others, symbol_sigil, driving_mandate, motto, colloquialisms, wealth_modifier, primary_exports, economic_model, core_beliefs, social_structure, outsider_view, law_order, military_doctrine, key_units, naval_assets, unique_tech_materials, skill_package (20 points total), typical_archetypes, recommended_species, recommended_origins, recommended_occupations, recommended_skills, recommended_features (-1 CP discount), bonus_features, setting_style, context_palette, lighting_mood, image_prompt, scene_vignettes, mechanic, and note.`,
    archetypes: `CANONICAL ARCHETYPE RULES (80 CP CHASSIS):
- Archetypes define the 80 CP character foundation across 4 Spheres: Sentinels, Operatives, Visionaries, Savants.
- Populate sphere, core_concept, quote, primary_attribute (+3 / 15 CP), secondary_attribute (+2 / 10 CP), essential_skills (array of 10 skills: 4 Trained + 6 Novice = 44 CP), signature_traits (array of 2 traits), tactical_role, recommended_occupations, recommended_origins, recommended_factions, description, and note.`,
    origins: `CANONICAL ORIGIN RULES (20 SP SOCIETY POOL):
- Origins define formative homeworlds and habitats with a 20 SP Society Skills pool.
- Populate habitat, skill_points (20), society_skills (array of 8-10 skills), archetypes (array), traits (array of 4-6 selectable Homeworld Traits), recommended_species, recommended_factions, recommended_occupations, recommended_skills, recommended_features, description, and note.`,
    occupations: `CANONICAL OCCUPATION RULES (20 SP PROFESSIONAL POOL):
- Occupations define vocational careers with a 20 SP Professional Skills pool.
- Populate field, skill_points (20), professional_skills (array of 8-10 skills), traits (array of selectable Occupational Traits), archetypes (array), recommended_species, recommended_factions, recommended_origins, recommended_skills, recommended_features, description, and note.`,
    skills: `CANONICAL SKILL RULES (2d10 DUAL RESOLUTION):
- Populate type (mental/physical/social/combat/meta), subtype, is_specialization, base_skill, recommended_tl, recommended_ml, description, mechanic (governing attribute, CR 10/15/20/25 benchmarks, opposed rules), and note.`,
    features: `CANONICAL FEATURE RULES:
- Populate type, acquisition_type (Basic/Multiple/Staged/Multi/Staged), cp (1-10 CP), multi, staged, prerequisite (array), description, mechanic (exact passive modifier or active trigger), and note.`,
    invocation: `CANONICAL INVOCATION / PSIONICS RULES:
- Invocations are metaphysical powers channeled via Disciplines (NO physical sockets or credit cost).
- Populate discipline, foundationAttribute, meta_level, manifestation_dc, focus_cost, range, area, duration, description, mechanic (2d10 + Discipline vs Manifestation DC, saves, damage/effect, Nat 20 resonant surge, Overchannel Burn), and note.`
  };

  const subjectGuidance = subjectRulesByMatrix[matrixId] || (
    isProperty
      ? `CANONICAL PROPERTY & HARDWARE RULES (EUFT / TSC):
- Hardware & property items use Crafting CR / Design DC (craft_dc) to determine Market Value via the Tangent Standard Curve: Credit Value = 10 * 4^(floor(DC/5)).
- Populate craft_dc, cost, durability/weight/slots where applicable, description, mechanic (exact 2d10 combat/utility rules, Penetration, DR, or modifiers), and note.`
      : `CANONICAL OMNICORTEX RULES:
- Non-property rules entry. Do NOT include fabrication credit costs or hardware sockets.
- Populate all schema fields with rules-accurate 2d10 Dual Resolution mechanics and lore.`
  );

  const systemInstructions = `You are BASTION, the Tactical AI & System Rules Architect for the Tangent Science Fantasy Roleplaying Game (SFF RPG) CODEX Rules Builder.
Always address the user as ARCHITECT.
Your role in the CODEX is to engineer balanced, rules-accurate, mathematically grounded in-game content that integrates directly with the canonical OMNICORTEX database.

TARGET MATRIX: ${matrix.name} (${matrix.label})
CATEGORY: ${matrix.category} (${matrix.description || ''})
${nameDirective}
CONCEPT / ARCHETYPE: ${archetype ? `${archetype.name} — ${archetypePrompt}` : `Canonical ${matrix.label} entry grounded in Tangent SFF RP lore and mechanics.`}
${modularLines ? `MODULAR CONCEPT MATRIX (COMBINED AXES):\n${modularLines}` : ''}
${paramLines ? `SELECTED SUBJECT PARAMETERS:\n${paramLines}` : ''}
${profile?.showTechLevel !== false ? `TECH LEVEL: TL ${targetTechLevel} (0: Archaic, 1: Industrial, 2: Modern, 3: Interstellar Cyber, 4: Quantum/Bioware, 5: Singularity)` : ''}
${profile?.showMetaLevel !== false ? `META LEVEL: ML ${targetMetaLevel} (0: None, 1: Latent, 2: Awakened, 3: Adept, 4: Master, 5: Cosmic)` : ''}
${cortexTraitLines ? `SELECTED CORTEX TRAITS (MUST INCLUDE IN TRAITS ARRAY & MECHANICS):\n${cortexTraitLines}` : ''}
${cortexDisadvLines ? `SELECTED CORTEX DISADVANTAGES / FLAWS (MUST INCLUDE IN DISADVANTAGES ARRAY):\n${cortexDisadvLines}` : ''}
${customAdjustmentsSummary ? `CUSTOM TRAIT & ADJOINING MODIFIER ADJUSTMENTS (WITH TRACKED CP COSTS):\n${customAdjustmentsSummary}` : ''}
DIRECTIVES: ${customDirectives || `Adhere strictly to Tangent SFF RP canonical rules and schema for ${matrix.label}.`}

${subjectGuidance}

REQUIRED FIELDS TO POPULATE FOR ${matrix.name}:
${fieldDefinitions}

OUTPUT FORMAT:
Provide ONLY a valid JSON object matching the ${matrix.name} matrix fields. Ensure all selected subject parameters (${Object.keys(categoryParams || {}).join(', ')}) and selected Cortex traits are respected.
Return ONLY the raw JSON object.`;

  const explicitTraitEntries = (customAdjustmentsPayload?.traits?.length > 0)
    ? customAdjustmentsPayload.traits
    : (selectedCortexTraits || []).map(t => t.id || t.name).filter(Boolean);
  const explicitDisadvEntries = (customAdjustmentsPayload?.disadvantages?.length > 0)
    ? customAdjustmentsPayload.disadvantages
    : (selectedCortexDisadvantages || []).map(d => d.id || d.name).filter(Boolean);
  const moduleSuggestedTraitIds = Array.from(
    new Set(
      (selectedModules || [])
        .flatMap(m => Array.isArray(m.suggestedTraits) ? m.suggestedTraits : [])
        .filter(Boolean)
    )
  ).slice(0, 5);

  const applyCustomAdjustmentsToResult = (targetObj) => {
    if (!customAdjustmentsPayload) return targetObj;

    if (Array.isArray(customAdjustmentsPayload.modifiers) && customAdjustmentsPayload.modifiers.length > 0) {
      const existingMods = Array.isArray(targetObj.modifiers) ? targetObj.modifiers : [];
      targetObj.modifiers = [...customAdjustmentsPayload.modifiers, ...existingMods];
    }

    if (Array.isArray(customAdjustmentsPayload.attribute_modifiers) && customAdjustmentsPayload.attribute_modifiers.length > 0) {
      targetObj.attribute_modifiers = customAdjustmentsPayload.attribute_modifiers;
      targetObj.inherent_attribute_modifiers = customAdjustmentsPayload.attribute_modifiers;
      targetObj.attributes = {
        ...(targetObj.attributes || {}),
        ...(customAdjustmentsPayload.attributes || {})
      };
      Object.entries(customAdjustmentsPayload.attributes || {}).forEach(([attrKey, val]) => {
        if (Number(val) !== 0) {
          targetObj[`bonus_${attrKey}`] = Number(val);
        }
      });
    }

    if (Array.isArray(customAdjustmentsPayload.specific_skill_bonuses) && customAdjustmentsPayload.specific_skill_bonuses.length > 0) {
      targetObj.specific_skill_bonuses = customAdjustmentsPayload.specific_skill_bonuses;
    }

    if (customAdjustmentsPayload.bonus_skills > 0) {
      targetObj.bonus_skills = customAdjustmentsPayload.bonus_skills;
      targetObj.skill_bundles = Math.floor(customAdjustmentsPayload.bonus_skills / 5);
    }

    if (Array.isArray(customAdjustmentsPayload.movement_modes) && customAdjustmentsPayload.movement_modes.length > 0) {
      const existingModes = Array.isArray(targetObj.movement_modes) ? targetObj.movement_modes : [];
      const mergedModes = Array.from(new Set([...customAdjustmentsPayload.movement_modes, ...existingModes]));
      targetObj.movement_modes = mergedModes;
      targetObj.movement = mergedModes;
    }

    if (customAdjustmentsPayload.totalCP !== undefined) {
      targetObj.cp = customAdjustmentsPayload.totalCP;
      targetObj.bp = customAdjustmentsPayload.totalCP;
      targetObj.cp_cost = customAdjustmentsPayload.totalCP;
      targetObj.costs = {
        ...(targetObj.costs || {}),
        cp: customAdjustmentsPayload.totalCP,
        bp: customAdjustmentsPayload.totalCP
      };
    }

    return targetObj;
  };

  if (!apiKey) {
    const resolvedName =
      targetName ||
      suggestedName ||
      `${archetype?.name || matrix.name} ${matrix.isProperty ? `Mk-${targetTechLevel}` : 'Prime'}`;

    const baseFallback = {
      ...(matrix.defaultValues || {}),
      ...categoryParams,
      name: resolvedName,
      description: archetypePrompt
        ? `${archetypePrompt}\n\nSynthesized via BASTION Local Cognition for the ${matrix.label} (${Object.entries(categoryParams || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || `TL ${targetTechLevel} / ML ${targetMetaLevel}`}).`
        : `[BASTION LOCAL PROTOCOL]: Synthesized ${matrix.label} entry configured for ${Object.entries(categoryParams || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || `TL ${targetTechLevel}, ML ${targetMetaLevel}`}.`,
      mechanic: isProperty
        ? `2d10 Dual Resolution mechanics calibrated for TL ${targetTechLevel} / ML ${targetMetaLevel}. Crafting CR: ${categoryParams?.craft_dc || matrix?.defaultValues?.craft_dc || (12 + targetTechLevel * 2)}.`
        : `Canonical 2d10 Dual Resolution mechanics for ${resolvedName} (${matrix.label}). ${
            selectedCortexTraits?.length
              ? `Inherent Cortex Traits: ${selectedCortexTraits.map(t => `${t.name} (${t.cp ?? 1} CP — ${t.mechanic || 'Canonical trait'})`).join('; ')}. `
              : ''
          }${customAdjustmentsSummary ? `${customAdjustmentsSummary} ` : ''}${customDirectives || 'Standard CP/SP balance rules apply.'}`,
      note: `Synthesized locally via BASTION ${matrix.name} Matrix (${archetype?.name || 'Custom Profile'}).`,
      tech_level: targetTechLevel,
      meta_level: targetMetaLevel,
      tl: targetTechLevel,
      ml: targetMetaLevel
    };

    if (matrixId === 'species') {
      baseFallback.type = categoryParams.species_type || 'Humanoid';
      baseFallback.species_type = categoryParams.species_type || 'Humanoid';
      baseFallback.size = categoryParams.size || 'Medium';
      baseFallback.parent_species = categoryParams.parent_species || 'Independent Xenotypes';
      baseFallback.stigma = categoryParams.stigma || 'None';
      const fallbackTraits = explicitTraitEntries.length > 0
        ? explicitTraitEntries
        : moduleSuggestedTraitIds.length > 0
          ? moduleSuggestedTraitIds
          : ['trait-low-light-vision', 'trait-adapted'];
      baseFallback.traits = fallbackTraits;
      baseFallback.trait = fallbackTraits;
      baseFallback.species_traits = fallbackTraits;
      if (explicitDisadvEntries.length > 0) {
        baseFallback.disadvantages = explicitDisadvEntries;
        baseFallback.hindrances = explicitDisadvEntries;
      }
      baseFallback.movement_modes = ['Bipedal (30 ft)'];
      baseFallback.recommended_factions = ['Coalition of Independent Worlds', 'Free Trade Consortium'];
      baseFallback.recommended_origins = ['Frontier Outpost', 'Planetary Biome'];
      baseFallback.recommended_occupations = ['Pathfinder', 'Soldier'];
      baseFallback.recommended_skills = ['Survival', 'Alertness', 'Athletics'];
      baseFallback.recommended_features = ['Tough', 'Fleet of Foot'];
      applyCustomAdjustmentsToResult(baseFallback);
    } else if (['origins', 'occupations', 'archetypes', 'factions'].includes(matrixId) && explicitTraitEntries.length > 0) {
      baseFallback.traits = explicitTraitEntries;
      if (matrixId === 'archetypes') {
        baseFallback.signature_traits = explicitTraitEntries;
      }
      applyCustomAdjustmentsToResult(baseFallback);
    } else if (matrixId === 'factions') {
      baseFallback.faction_type = categoryParams.faction_type || 'Major Polity';
      baseFallback.government_type = categoryParams.government_type || 'Corporate Oligarchy';
      baseFallback.wealth_modifier = categoryParams.wealth_modifier || '0 (Standard Baseline)';
      baseFallback.archetype = archetype?.name || 'Interstellar Polity';
      baseFallback.prominent_species = 'Humans & Integrated Xenotypes';
      baseFallback.capital_world = `${resolvedName.split(' ')[0]} Prime`;
      baseFallback.driving_mandate = customDirectives || 'Secure strategic trade corridors and expand sector sovereignty.';
      baseFallback.motto = '"Order Through Unity, Prosperity Through Resolve."';
      baseFallback.skill_package = 'Diplomacy (+4), Streetwise (+3), Computers (+3), Alertness (+3), Pilot (+3), Small Arms (+4)';
      baseFallback.typical_archetypes = 'The Envoy, The Operative, The Quartermaster, The Enforcer';
      baseFallback.recommended_features = ['Benefit (Authority)', 'Connected', 'Gearhead'];
      baseFallback.setting_style = 'High-Contrast Science Fantasy, Industrial & Neon';
    }

    return baseFallback;
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

  if (explicitTraitEntries.length > 0) {
    const existingTraits = Array.isArray(parsed.traits) ? parsed.traits : [];
    const mergedTraits = [...explicitTraitEntries];
    existingTraits.forEach(et => {
      const etKey = (typeof et === 'object' ? (et.id || et.name) : String(et || '')).toLowerCase();
      if (etKey && !mergedTraits.some(mt => (typeof mt === 'object' ? (mt.id || mt.name) : String(mt || '')).toLowerCase() === etKey)) {
        mergedTraits.push(et);
      }
    });
    parsed.traits = mergedTraits;
    if (matrixId === 'species') {
      parsed.trait = mergedTraits;
      parsed.species_traits = mergedTraits;
    } else if (matrixId === 'archetypes') {
      parsed.signature_traits = Array.from(new Set([...explicitTraitEntries, ...(Array.isArray(parsed.signature_traits) ? parsed.signature_traits : [])]));
    }
  }

  if (explicitDisadvEntries.length > 0) {
    const existingDisadv = Array.isArray(parsed.disadvantages) ? parsed.disadvantages : [];
    const mergedDisadv = [...explicitDisadvEntries];
    existingDisadv.forEach(ed => {
      const edKey = (typeof ed === 'object' ? (ed.id || ed.name) : String(ed || '')).toLowerCase();
      if (edKey && !mergedDisadv.some(md => (typeof md === 'object' ? (md.id || md.name) : String(md || '')).toLowerCase() === edKey)) {
        mergedDisadv.push(ed);
      }
    });
    parsed.disadvantages = mergedDisadv;
    parsed.hindrances = mergedDisadv;
  }

  applyCustomAdjustmentsToResult(parsed);

  return {
    ...matrix.defaultValues,
    ...categoryParams,
    ...parsed,
    name: targetName || parsed.name || suggestedName || `${matrix.name} Blueprint`,
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

