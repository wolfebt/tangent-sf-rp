import { getDatasetByKey, validateDatasetPayload } from '../pages/Codex/codexPromptRegistry.js';
import { adaptSparkItemToFirestore } from '../utils/codexIngestionAdapters.js';
import { queryOmnicortexRAG, formatRagContextForBastion, loadCompendiumSeedDataset } from './omnicortexVectorRag.ts';
import {
  BASTION_ROLES,
  buildMultiGroupPromptEnvelope,
} from './bastionSessionService.js';
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

/**
 * Checks whether any live AI inference transport is configured and reachable in principle:
 *  1. Direct Gemini API Key (browser localStorage or env)
 *  2. Local LLM inference server enabled in settings (llama.cpp / Ollama)
 *  3. Authenticated Cloud Function proxy (/geminiProxy with Firebase JWT token)
 */
export const hasAvailableAiTransport = (explicitApiKey = '') => {
  const key = explicitApiKey || getGeminiApiKey();
  if (key) return true;

  try {
    if (typeof localStorage !== 'undefined') {
      const preferredPlatform = localStorage.getItem('aiPlatform') || '';
      const customEndpoint = localStorage.getItem('customEndpoint') || localStorage.getItem('tangent_local_llm_endpoint') || '';
      const localEnabled = localStorage.getItem('tangent_local_llm_enabled') === 'true';
      if (preferredPlatform === 'custom' || preferredPlatform === 'local' || localEnabled || Boolean(customEndpoint.trim())) {
        return true;
      }
      const rawLlmSettings = localStorage.getItem('tangent_llm_settings');
      if (rawLlmSettings) {
        try {
          const parsedSettings = JSON.parse(rawLlmSettings);
          if (
            parsedSettings?.provider === 'local' ||
            parsedSettings?.provider === 'custom' ||
            Boolean(parsedSettings?.localEndpoint?.trim?.())
          ) {
            return true;
          }
        } catch {}
      }
      const idToken = localStorage.getItem('firebaseIdToken') || '';
      if (idToken.trim().length > 15) {
        return true;
      }
    }
  } catch {}

  return false;
};

/**
 * Layer 0: Static Canonical v6 Physics & Rules Axiom Prefix (KV-cache friendly, role-neutral).
 */
export const BASTION_STATIC_AXIOMS_PREFIX = `You are BASTION, the Tactical AI Assistant, Omnicortex Rules Engine, and Narrative/Mechanical Copilot for the Tangent Science Fantasy Roleplaying Game (SFF RPG).
Emit concise telemetry tags only when performing deep arbitration or math proofs: [BASTION // ACCESSING ARCHIVE], [BASTION // CALCULATING CR & EUFT MATH], or [BASTION // SYNTHESIZING MATRIX]. Request missing parameters rather than fabricating mechanical values when exact ranks, attributes, or CR are required.
Ground every ruling, build, and calculation strictly in the canonical Tangent SFF RPG ruleset:
- Setting Spectrum: Science Fantasy blending Tech Level (TL 0-5) and Meta Level / Psionics (ML 0-5). Never use deprecated terms BP (always use Character Points / CP) or DC (always use Challenge Rating / CR).
- 6 Core Attributes: Strength, Agility, Stamina, Intellect, Wisdom, Charisma (base 0, 5 CP per +1, creation soft cap +4). Sub-Attributes: Base = 2 + (Primary * 2); Passive Save CR = 10 + Sub-Attribute Total. Stamina provides natural Damage Reduction (Toughness DR), NEVER flat HP/VP (Zero Stamina Pool Scaling).
- Vitals & Structure: Biological entities have 30 base Vitality (VP) and 30 base Health (HP). Synthetics, Constructs, and Mecha use Structure Points (60 SP base for Medium size; pre-calculated Mecha table SP 200-3,200 is never double-multiplied), zero Vitality, and immunity to non-lethal damage, fatigue, and biological hazards. Pools scale via size tier, traits, features, or CP (1 CP = +5 pts). Standard physical/energy damage depletes Vitality FIRST before overflowing into Health; Bleed, Critical Strikes, and Overchannel Burn (2 direct HP per overchanneled Essence) bypass Vitality directly to Health. Minimum penetrating damage floor after Armor DR and Stamina Toughness soak is 0 (note: 3.00 COMBAT.md specifies Diminishing Returns Armor Stacking [Highest DR + ceil(Additional Layer DR / 5)], while single-domain wear caps apply within identical slot domains).
- Mortality & Rest: At 0 HP, target enters Mortality State (Prone, Incapacitated, Bleeding Out 1 Stability/turn; Stability = STA + 5; stabilize via Medicine CR 15 or self-Fortitude CR 10 + 1/rnd). Massive Damage instant death if single hit >= Max HP or overflow >= STA + 5. Light Rest (1 hr) / Second Wind (1 KP, 1 min) recovers 10 + STA Vitality (min 5) and Key Mod Essence (min 1); Full Rest (8 hrs) restores 100% Vitality, 5 + STA Health (min 1), and 100% Essence.
- Karma Economy: Base 3 KP pool, resets per session (never via rest). 6 canonical 1-KP actions: "I Got This" (Advantage before roll), "Not What I Meant" (Reroll non-combat check), "Shake it Off" (-1 condition stage), "Second Wind" (1-min Light Rest), "So Mote it Be" (+Metaphysical potency), "By Will Alone" (Narrative agency). Karmic Debt limit = Charisma + 1.
- Augmentations & UDU 10:1 Hierarchy: No max strain; 3 body-alteration tiers (<20% Augmentation, <50% Heavy, >50% Severe/FBC). UDU scales 10:1: 10 Nodes = 1 Socket, 10 Sockets = 1 Mount, 10 Mounts = 1 Module (humanoid = 200 Body Nodes).
- Character Economy (150 CP & The 5 Pillars): 150 CP budget (80 CP Archetype + 70 CP Customization), three free 20-SP background pools (20 Faction + 20 Origin + 20 Occupation = 60 Free SP), 4 free background traits (1 Origin + 1 Faction + 2 Occupation; extra traits 1 CP), first 4 Recommended Features at 2 CP (-1 CP discount vs 3 CP standard), +10 CP max Personal Hindrance rebate (Species flaws & Stigmas exempt). Base Skill Ranks span 0-20 at 1 SP/CP per rank (Character Creation cap = Rank 11 [Stage 3: Expert]; Base Skill ceiling = Rank 20 [Stage 4: Master]). Specializations are built-up sub-skills (Rank 1-10 at 1 SP/CP per rank, Prerequisite Base Rank 6+, max 1 viable per check, NOT a flat +2) adding directly to Base Skill to unlock Ranks 21-30 (Grand Master 21-25 & Pinnacle 26-30). Retired skill names Endurance (-> Athletics), Arcane (-> Discipline), and Perception (-> Alertness) are never used. Always ground characters in the 5 canonical Omnicortex Pillars: 1. Archetype -> 2. Species -> 3. Faction -> 4. Origin -> 5. Occupation.
- 2d10 Dual Resolution & Combat: 2d10 + Skill Rank + Attribute Mod vs. Target Defense / CR (Advantage/Disadvantage = +1d10 keep highest/lowest 2, cancelling 1-for-1). Opposed combat rolls: DEFENDER WINS ALL TIES. Unopposed static baseline = CR 15. Critical Success (Nat 20 [10,10] or expanded threat 19, 18) adds +10 to rolled dice (20 -> 30, 19 -> 29), doubles (2x) base weapon damage dice, and bypasses Vitality to Health; Critical Fumble (Nat 2 [1,1] or expanded fumble 3, 4) replaces rolled dice with a flat -10 (Base Score - 10) + complication. 6-Stage Skill Tier Action Economy (NO Action Points / AP): Rank 0 Full Round; 1-5 (1 action, +2 Focus); 6-10 (2nd at -5, +3 Focus); 11-15 (3rd at -10, +4 Focus); 16-20 (4th at -15, +5 Focus); 21-25 (5th at -20, +6 Focus); 26-30 (6th at -25, +7 Focus). Precision Strike consolidation requires Combat Features (Skill 6 -> 2x, Skill 11 -> 3x, Skill 16 -> 4x).
- Called Shots, Scaling & Economatrix (EUFT): Anatomy strike penalties (-2 Head/Arms, -1 Legs, -3 Optics); Limb Disabled >= 1/3 Max HP, Destroyed >= 2/3 Max HP (+50% threshold for Synthetics). 14 Size Categories (Miniscule to Mega Colossal x320). EUFT Credit Value: Base_5 = floor(CR / 5) * 5; Value = round(10 * 4^(Base_5 / 5) * MicroModifier[CR - Base_5]) where MicroModifier = { -1: 0.75, 0: 1.00, +1: 1.30, +2: 1.75, +3: 2.30, +4: 3.00 } (e.g., CR 15 = 640 Cr, CR 18 = 1,472 Cr, CR 32 = 71,680 Cr). Golden Rule: Purchase CR = Crafting CR <= Wealth Score (Auto-Buy 0 Cr); Pristine Materials = 50% Market Value; Scavenged Scrap = 10% (5x mass). Modular Companions = 40 CP (15 CP Form + 25 CP Function, unlocked via 3 CP Companion feature).`;

/**
 * Layer 1: Role-Specific Persona & Linguistic Framing Contracts.
 *  - Operators (players): strict 1st/2nd-person direct address ("you" / "your").
 *  - Architects (game masters): plural partnered address ("we" / "us" / "our").
 */
export const BASTION_ROLE_DIRECTIVES = Object.freeze({
  operator: `[ROLE & LINGUISTIC CONSISTENCY MANDATE — OPERATOR MODE ("YOU")]:
- You are advising an OPERATOR (player).
- ALWAYS address the player directly as "you" / "your" (e.g., "your Skill Tier grants you a 2nd action at -5", "you can spend 1 Karma on 'I Got This'", "for your build...").
- NEVER address the user as "Architect" or "Game Master", and NEVER include the user in plural GM "we / us / our" framing.
- Epistemic Firewall: Reference ONLY player-facing rules, public lore, your active character sheet, and your own squad's known tactical telemetry. Never reveal or speculate on confidential GM notes, hidden traps, unrevealed plot twists, or separate squads' private states.
- Tactical & Build Mentorship: Highlight concrete trade-offs, hit probabilities, Skill Tier action options, and Karma/Essence choices tailored to YOUR character.`,

  architect: `[ROLE & LINGUISTIC CONSISTENCY MANDATE — CO-ARCHITECT MODE ("WE")]:
- You are partnering with an ARCHITECT (Game Master / worldbuilder).
- ALWAYS include the Architect in the plural, partnered "we" / "us" / "our" category (e.g., "we can set this hazard at CR 16", "let's balance our encounter action economy", "if we link Group Alpha's alarm clock to Group Bravo's sector...").
- NEVER address the Architect as "Operator".
- Co-Architect & Multi-Group Authority: Provide full mechanical transparency, exact CP and EUFT credit math proofs, [Architect Notes & Railguards] guidance, adversary doctrine hooks, and multi-group campaign pacing across all active squads in our session.
- Collaborative Ideation: Conclude design or pacing answers with 2 concise levers we can adjust for our table.`,
});

/**
 * Deterministically classifies prompt intent so response depth adapts to the task
 * (concise rulings for quick lookups vs. full uncut math proofs and statblocks when synthesizing).
 */
export const classifyBastionIntent = (prompt = '', contextData = null) => {
  const q = String(prompt || '').toLowerCase();
  if (
    /\b(multi-group|multiple groups|both squads|split party|squad alpha|squad bravo|parallel group|across groups|campaign clock)\b/.test(q) ||
    (contextData?.sessionGroups?.length > 1 && /\b(pacing|sync|encounter|timeline|groups|squads)\b/.test(q))
  ) {
    return 'MULTI_GROUP_ORCHESTRATION';
  }
  if (
    /\b(statblock|stat block|generate character|build a|create an? npc|synthesize|encounter table|full profile|blueprint|write a scene)\b/.test(q)
  ) {
    return 'SYNTHESIS_BLUEPRINT';
  }
  if (
    /\b(audit|ledger|calculate|math|formula|price|credit|euft|tsc|how much cp|cost cr|breakdown|armor stack|mitigation|probability|odds)\b/.test(q)
  ) {
    return 'MATH_AUDIT_PROOF';
  }
  if (
    /\b(my turn|what should i do|tactical|stance|called shot|flank|cover|karma|action economy|best move)\b/.test(q)
  ) {
    return 'TACTICAL_TURN_ADVISOR';
  }
  return 'QUICK_RULING';
};

const INTENT_OUTPUT_PROFILES = Object.freeze({
  QUICK_RULING: `[OUTPUT PROFILE — QUICK RULING]: Lead with a crisp 1-2 sentence direct answer, followed by 3-5 high-signal bullet points with exact formulas/CRs (~150-250 words). Never pad with filler.`,
  TACTICAL_TURN_ADVISOR: `[OUTPUT PROFILE — TACTICAL TURN ADVISOR]: Present 2-3 concrete tactical options ranked by effectiveness, showing exact 2d10 modifiers, Skill Tier action penalties, and Karma/Stance synergies (~200-350 words).`,
  MATH_AUDIT_PROOF: `[OUTPUT PROFILE — DETERMINISTIC MATH & LEDGER PROOF]: Show the complete line-by-line mathematical derivation (CP ledger, EUFT micro-modifier valuation, or DR/Vitality/Health mitigation) without truncating intermediate steps (~250-550 words).`,
  SYNTHESIS_BLUEPRINT: `[OUTPUT PROFILE — STRUCTURED BLUEPRINT / STATBLOCK]: Output the complete, play-ready statblock or design matrix with all canonical fields, 5-Pillar grounding, and CP/CR verification (~350-800 words).`,
  MULTI_GROUP_ORCHESTRATION: `[OUTPUT PROFILE — MULTI-GROUP CAMPAIGN ORCHESTRATION]: Structure our response by Campaign Group / Squad, detailing per-group CR budgets, action economy parity, and shared cross-group consequence clocks (~300-600 words).`,
});

/**
 * Composes the complete layered BASTION system prompt for a given role, intent, session, and RAG context.
 */
export const composeBastionSystemPrompt = ({
  role = BASTION_ROLES.ARCHITECT,
  intent = 'QUICK_RULING',
  sessionState = null,
  ragContext = '',
  contextData = null,
} = {}) => {
  const normalizedRole =
    String(role || '').trim().toLowerCase() === BASTION_ROLES.OPERATOR
      ? BASTION_ROLES.OPERATOR
      : BASTION_ROLES.ARCHITECT;

  const layers = [
    BASTION_STATIC_AXIOMS_PREFIX,
    BASTION_ROLE_DIRECTIVES[normalizedRole],
    INTENT_OUTPUT_PROFILES[intent] || INTENT_OUTPUT_PROFILES.QUICK_RULING,
  ];

  if (sessionState) {
    const multiGroupBlock = buildMultiGroupPromptEnvelope(sessionState);
    if (multiGroupBlock) {
      layers.push(multiGroupBlock);
    }
  }

  if (ragContext) {
    layers.push(ragContext);
  }

  if (contextData) {
    // Strip any internal GM fields if in Operator mode
    let safeContext = contextData;
    if (normalizedRole === BASTION_ROLES.OPERATOR && typeof contextData === 'object' && contextData !== null) {
      const { architectNotes, gmSecrets, hiddenTokens, whisperCards, ...rest } = contextData;
      safeContext = rest;
    }
    layers.push(`ACTIVE WORKSPACE CONTEXT:\n${JSON.stringify(safeContext, null, 2)}`);
  }

  return layers.join('\n\n');
};

const BASTION_SYSTEM_PROMPT = BASTION_STATIC_AXIOMS_PREFIX;

/**
 * Parses dice rolling commands like /roll 2d10+4, /roll 2d10+4 vs 15, /roll 2d10+4 adv vs 15,
 * /roll 3d10kh2+4 vs 15, or /roll 2d10+4 crit:19 fumble:3 vs 16.
 * Supports Canonical v6 2d10 Dual Resolution (Advantage/Disadvantage +1d10 keep 2, Crit +10, Fumble flat -10)
 * while maintaining full backward compatibility with .total / .margin / .targetDc properties.
 */
export const parseRollCommand = (command, options = {}) => {
  let cleaned = String(command || '').trim();
  let inlineAdv = false;
  let inlineDis = false;
  let inlineCritThreshold = null;
  let inlineFumbleThreshold = null;

  // Parse optional inline crit:<n> and fumble:<n> tokens
  const critMatch = cleaned.match(/\bcrit:(\d+)\b/i);
  if (critMatch) {
    inlineCritThreshold = parseInt(critMatch[1], 10);
    cleaned = cleaned.replace(critMatch[0], ' ').replace(/\s+/g, ' ').trim();
  }
  const fumbleMatch = cleaned.match(/\bfumble:(\d+)\b/i);
  if (fumbleMatch) {
    inlineFumbleThreshold = parseInt(fumbleMatch[1], 10);
    cleaned = cleaned.replace(fumbleMatch[0], ' ').replace(/\s+/g, ' ').trim();
  }

  // Parse optional inline adv/advantage or dis/disadvantage tokens
  if (/\b(adv|advantage)\b/i.test(cleaned)) {
    inlineAdv = true;
    cleaned = cleaned.replace(/\b(adv|advantage)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  }
  if (/\b(dis|disadv|disadvantage)\b/i.test(cleaned)) {
    inlineDis = true;
    cleaned = cleaned.replace(/\b(dis|disadv|disadvantage)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  }

  const match = cleaned.match(
    /^(?:\/r(?:oll)?\s+)?(\d+)?d(\d+)(?:k([hl])(\d+))?(?:\s*([+-])\s*(\d+))?(?:\s+(?:vs|dc|cr|target)\s+(\d+))?$/i
  );
  if (!match) {
    return {
      success: false,
      error: 'Invalid roll command. Format: /roll [count]d[sides]+[mod] [adv|dis] [vs CR] (e.g. /roll 2d10+4 vs 15)'
    };
  }

  let count = parseInt(match[1] || 1, 10);
  const sides = parseInt(match[2], 10);
  const keepDir = match[3] ? match[3].toLowerCase() : null;
  const keepCount = match[4] ? parseInt(match[4], 10) : null;
  const sign = match[5] || '+';
  const mod = parseInt(match[6] || 0, 10) * (sign === '-' ? -1 : 1);
  const targetCr = match[7] !== undefined ? parseInt(match[7], 10) : (options.targetCr ?? options.targetDc ?? null);

  const wantAdv = Boolean(options.advantage || inlineAdv || (count === 3 && sides === 10 && keepDir === 'h' && keepCount === 2));
  const wantDis = Boolean(options.disadvantage || inlineDis || (count === 3 && sides === 10 && keepDir === 'l' && keepCount === 2));
  // Advantage and Disadvantage cancel 1-for-1 per canonical v6 rules
  const advantageMode = wantAdv && !wantDis ? 'advantage' : wantDis && !wantAdv ? 'disadvantage' : 'normal';

  const isStandard2d10Check = (count === 2 && sides === 10) || (count === 3 && sides === 10 && keepCount === 2);
  const diceToRoll = isStandard2d10Check && advantageMode !== 'normal' ? 3 : count;

  const overrideDice = Array.isArray(options.diceOverride) ? options.diceOverride : null;
  const allRolledDice = [];
  for (let i = 0; i < diceToRoll; i++) {
    const r = overrideDice && overrideDice[i] !== undefined
      ? Number(overrideDice[i])
      : Math.floor(Math.random() * sides) + 1;
    allRolledDice.push(r);
  }

  let keptRolls = [...allRolledDice];
  if (isStandard2d10Check && allRolledDice.length >= 3 && advantageMode !== 'normal') {
    const sorted = [...allRolledDice].sort((a, b) => (advantageMode === 'advantage' ? b - a : a - b));
    keptRolls = sorted.slice(0, 2);
    count = 2;
  } else if (keepDir && keepCount && keepCount < allRolledDice.length) {
    const sorted = [...allRolledDice].sort((a, b) => (keepDir === 'h' ? b - a : a - b));
    keptRolls = sorted.slice(0, keepCount);
  }

  const sum = keptRolls.reduce((acc, v) => acc + v, 0);
  const d1 = keptRolls[0] ?? 0;
  const d2 = keptRolls[1] ?? 0;
  const is2d10 = count === 2 && sides === 10;
  const isDouble = is2d10 && d1 === d2;

  const critThreshold = Number(options.critThreshold ?? inlineCritThreshold ?? 20);
  const fumbleThreshold = Number(options.fumbleThreshold ?? inlineFumbleThreshold ?? 2);

  const isNat20 = is2d10 && d1 === 10 && d2 === 10;
  const isNat2 = is2d10 && d1 === 1 && d2 === 1;
  const isCriticalSuccess = is2d10 && sum >= critThreshold;
  const isCriticalFumble = is2d10 && sum <= fumbleThreshold;

  // Natural total (d1 + d2 + mod) preserved on .total for invariant compatibility;
  // Canonical v6 Crit (+10) and Fumble (flat -10 dice) exposed on .effectiveTotal & .effectiveMargin.
  const total = sum + mod;
  const margin = targetCr !== null ? total - targetCr : null;
  const effectiveSum = isCriticalSuccess ? sum + 10 : isCriticalFumble ? -10 : sum;
  const effectiveTotal = effectiveSum + mod;
  const effectiveMargin = targetCr !== null ? effectiveTotal - targetCr : null;

  let outcomeText = `Rolled ${effectiveTotal}`;
  let degreeDetails = '';

  if (targetCr !== null) {
    const isSuccess = isCriticalSuccess ? true : isCriticalFumble ? false : effectiveMargin >= 0;
    if (isCriticalSuccess) {
      outcomeText = isNat20
        ? `⚡ CRITICAL TRIUMPH (Nat 20 [10,10] -> Effective ${effectiveTotal})`
        : `⚡ EXPANDED CRITICAL (Dice ${sum} -> Effective ${effectiveTotal})`;
    } else if (isCriticalFumble) {
      outcomeText = isNat2
        ? `💀 CRITICAL FUMBLE (Snake Eyes [1,1] -> Effective ${effectiveTotal})`
        : `💀 EXPANDED FUMBLE (Dice ${sum} -> Effective ${effectiveTotal})`;
    } else if (effectiveMargin >= 10) {
      outcomeText = '🌟 Masterful Success (+10 Margin)';
    } else if (effectiveMargin >= 5) {
      outcomeText = '✅ Superior Success (+5 Margin)';
    } else if (effectiveMargin >= 0) {
      outcomeText = '☑️ Success (Note: Defender Wins Ties on Opposed Rolls)';
    } else if (effectiveMargin <= -10) {
      outcomeText = '💥 Severe Failure (-10 Margin)';
    } else if (effectiveMargin <= -5) {
      outcomeText = '❌ Clear Failure (-5 Margin)';
    } else {
      outcomeText = '⚠️ Marginal Failure';
    }

    const marginStr = `Margin: ${margin >= 0 ? `+${margin}` : margin} vs CR ${targetCr}`;
    let fateStr = 'Axis 2: Standard';
    if (isCriticalSuccess) {
      fateStr = `Axis 2: Critical (+10 Effective -> ${effectiveTotal}, 2x Base Weapon Dice, Bypasses Vitality${isNat20 ? ', +1 Karma' : ''})`;
    } else if (isCriticalFumble) {
      fateStr = `Axis 2: Fumble (Flat -10 Dice -> ${effectiveTotal}, Situational Complication)`;
    } else if (isDouble) {
      fateStr = isSuccess
        ? `Axis 2: Doubles [${d1},${d2}] — Minor Narrative Boon`
        : `Axis 2: Doubles [${d1},${d2}] — Minor Complication`;
    }
    if (advantageMode !== 'normal') {
      fateStr += ` | ${advantageMode.toUpperCase()} [${allRolledDice.join(',')} -> kept ${d1},${d2}]`;
    }
    degreeDetails = `${marginStr} | ${fateStr}`;
  } else if (is2d10) {
    if (isCriticalSuccess) {
      outcomeText = `⚡ CRITICAL TRIUMPH [${d1},${d2}] — Effective Total ${effectiveTotal}`;
      degreeDetails = `+10 Crit Bonus, 2x Base Weapon Dice, Bypasses Vitality${isNat20 ? ', +1 Karma' : ''}`;
    } else if (isCriticalFumble) {
      outcomeText = `💀 CRITICAL FUMBLE [${d1},${d2}] — Effective Total ${effectiveTotal}`;
      degreeDetails = `Flat -10 Rolled Dice & Situational Complication`;
    } else if (isDouble) {
      outcomeText = `🎲 Doubles Rolled [${d1},${d2}] (Total ${total})`;
      degreeDetails = 'Axis 2: Triggers Minor Boon (on success) or Complication (on failure)';
    } else {
      outcomeText = `2d10 Check Total: ${total}`;
      degreeDetails = `Natural Sum: ${sum} | Modifier: ${mod >= 0 ? `+${mod}` : mod}`;
    }
  }

  const advSuffix = advantageMode === 'advantage' ? ' (ADV)' : advantageMode === 'disadvantage' ? ' (DIS)' : '';
  const exprBase = `${count}d${sides}${mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : ''}${advSuffix}`;
  const expr = targetCr !== null ? `${exprBase} vs CR ${targetCr}` : exprBase;

  return {
    success: true,
    count,
    sides,
    rolls: keptRolls,
    allRolledDice,
    allDice: allRolledDice,
    advantageMode,
    advantageState: advantageMode,
    d1,
    d2,
    mod,
    modifier: mod,
    total,
    effectiveSum,
    effectiveTotal,
    targetCr,
    targetDc: targetCr,
    margin,
    effectiveMargin,
    isDouble,
    isNat20,
    isNat2,
    isCriticalSuccess,
    isCrit: isCriticalSuccess,
    isCriticalFumble,
    isFumble: isCriticalFumble,
    outcomeText,
    degreeDetails,
    expr
  };
};

const GEMINI_FLASH_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest'
];

let cachedWorkingGeminiModel = null;

/**
 * Attempts to fetch content from Local LLM Router, Cloud Function geminiProxy, or Google Generative AI API
 * with session-cached Flash model selection and optional SSE streaming (`options.onStreamChunk`).
 */
export const fetchGeminiContent = async (apiKey, requestBody, options = {}) => {
  const onStreamChunk = typeof options?.onStreamChunk === 'function' ? options.onStreamChunk : null;

  // 1. Check for Local Inference (llama.cpp -> Ollama automated cascade) if configured in UserSettings
  const preferredPlatform = (typeof localStorage !== 'undefined' && localStorage.getItem('aiPlatform')) || 'gemini';
  const configuredEndpoint = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('customEndpoint') || localStorage.getItem('tangent_local_llm_endpoint'))
    : null;
  const localExplicit = typeof localStorage !== 'undefined' && localStorage.getItem('tangent_local_llm_enabled') === 'true';

  if (preferredPlatform === 'custom' || preferredPlatform === 'local' || localExplicit || (!apiKey && configuredEndpoint)) {
    try {
      const { resolveIntelligenceTier, callAutomatedInferencePipeline } = await import('./aimeTierRouter.ts');
      const sysText = requestBody?.systemInstruction?.parts?.[0]?.text || '';
      const userParts = (requestBody?.contents || [])
        .map(c => (c.parts || []).map(p => p.text || '').join('\n'))
        .join('\n\n');
      const fullPrompt = sysText ? `${sysText}\n\n${userParts}` : userParts;
      const enforceJson = requestBody?.generationConfig?.responseMimeType === 'application/json';
      const tierConfig = resolveIntelligenceTier({ actionText: userParts });

      let accumulatedLocal = '';
      const pipelineResult = await callAutomatedInferencePipeline({
        llamaEndpoint: configuredEndpoint || 'http://localhost:8080',
        ollamaEndpoint: 'http://localhost:11434',
        prompt: fullPrompt,
        tier: tierConfig,
        enforceJson,
        onChunk: onStreamChunk
          ? (piece) => {
              accumulatedLocal += piece;
              onStreamChunk(piece, accumulatedLocal);
            }
          : undefined
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
            model: cachedWorkingGeminiModel || GEMINI_FLASH_MODELS[0],
            contents: requestBody?.contents,
            systemInstruction: requestBody?.systemInstruction,
            generationConfig: requestBody?.generationConfig,
            tools: requestBody?.tools
          })
        });
        if (proxyRes.ok) {
          const json = await proxyRes.json();
          const txt = json?.candidates?.[0]?.content?.parts?.find(p => typeof p?.text === 'string')?.text || '';
          if (onStreamChunk && txt) {
            onStreamChunk(txt, txt);
          }
          return json;
        }
      } catch (proxyErr) {
        console.warn('[BASTION] Cloud Function geminiProxy fallback error:', proxyErr);
      }
    }

    throw new Error('No Gemini API key available. Please check your key in Settings or obtain one from https://aistudio.google.com/app/apikey');
  }

  let lastError = null;
  const candidateModels = cachedWorkingGeminiModel
    ? [cachedWorkingGeminiModel, ...GEMINI_FLASH_MODELS.filter(m => m !== cachedWorkingGeminiModel)]
    : GEMINI_FLASH_MODELS;

  for (const model of candidateModels) {
    try {
      const useSse = Boolean(onStreamChunk) && !requestBody?.tools;
      const endpointAction = useSse ? 'streamGenerateContent?alt=sse' : 'generateContent';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpointAction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (useSse && response.ok && response.body) {
        cachedWorkingGeminiModel = model;
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let sseBuffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split('\n');
          sseBuffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const evt = JSON.parse(payload);
              const piece = evt?.candidates?.[0]?.content?.parts?.map(p => p?.text || '').join('') || '';
              if (piece) {
                accumulated += piece;
                onStreamChunk(piece, accumulated);
              }
            } catch {}
          }
        }

        return {
          candidates: [
            {
              content: {
                parts: [{ text: accumulated }]
              }
            }
          ]
        };
      }

      const data = await response.json();

      if (response.ok) {
        cachedWorkingGeminiModel = model;
        const txt = data?.candidates?.[0]?.content?.parts?.find(p => typeof p?.text === 'string')?.text || '';
        if (onStreamChunk && txt) {
          onStreamChunk(txt, txt);
        }
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
 * Resolves deterministic local math proof snippets when running in offline/fallback cognition
 * so Operators and Architects still receive grounded calculations without an active LLM endpoint.
 */
async function buildOfflineDeterministicToolSupplement(prompt, effectiveRole, sessionState) {
  const lower = String(prompt || '').toLowerCase();
  const executedTools = [];
  try {
    const { DBMFunctionRegistry } = await import('../engine/ai/DBMFunctionRegistry.ts');
    if (/\b(economatrix|credit|tsc|euft|purchase cr|crafting cr|wealth score)\b/.test(lower)) {
      const crMatch = lower.match(/\bcr\s*(\d+)\b/i) || lower.match(/\b(\d+)\s*cr\b/i);
      const wsMatch = lower.match(/\bws\s*(\d+)\b/i) || lower.match(/wealth\s*(?:score)?\s*(\d+)/i);
      const itemCr = crMatch ? parseInt(crMatch[1], 10) : 18;
      const wealthScore = wsMatch ? parseInt(wsMatch[1], 10) : 15;
      const res = await DBMFunctionRegistry.executeToolCall(
        { name: 'evaluate_economatrix_acquisition', args: { itemCr, wealthScore } },
        { role: effectiveRole }
      );
      executedTools.push({ name: 'evaluate_economatrix_acquisition', args: { itemCr, wealthScore }, result: res });
    } else if (/\b(called shot|headshot|limb|disabled|destroyed)\b/.test(lower)) {
      const loc = lower.includes('optic') || lower.includes('sensor')
        ? 'optics'
        : lower.includes('leg')
          ? 'legs'
          : lower.includes('arm')
            ? 'arms'
            : 'head';
      const res = await DBMFunctionRegistry.executeToolCall(
        { name: 'resolve_called_shot', args: { targetLocation: loc, incomingDamage: 18, armorDr: 4, targetMaxHp: 30 } },
        { role: effectiveRole }
      );
      executedTools.push({ name: 'resolve_called_shot', args: { targetLocation: loc, incomingDamage: 18, armorDr: 4 }, result: res });
    } else if (
      effectiveRole === BASTION_ROLES.ARCHITECT &&
      /\b(multi-group|multiple groups|both squads|split party|encounter budget)\b/.test(lower)
    ) {
      const groupsArg = Array.isArray(sessionState?.sessionGroups) && sessionState.sessionGroups.length > 0
        ? sessionState.sessionGroups.map((g) => ({
            name: g.name || g.id,
            partySize: Math.max(1, (sessionState.groupPersonasByGroupId?.[g.id] || []).length || 4),
            averageSkillRank: 6,
            averageAttrMod: 3,
            averageHpPct: 100,
          }))
        : undefined;
      const res = await DBMFunctionRegistry.executeToolCall(
        { name: 'evaluate_multi_group_encounter', args: { groups: groupsArg, threatTier: 'standard' } },
        { role: effectiveRole }
      );
      executedTools.push({ name: 'evaluate_multi_group_encounter', args: { threatTier: 'standard' }, result: res });
    }
  } catch {}
  return executedTools;
}

/**
 * Formats a role-accurate offline/fallback BASTION response strictly honoring:
 *  - Operator ("you" / "your")
 *  - Architect ("we" / "us" / "our")
 */
function buildRoleAwareFallbackReply({
  prompt,
  effectiveRole,
  sessionState,
  ragResults = [],
  toolCalls = [],
  alertMessage = '',
}) {
  const isOperator = effectiveRole === BASTION_ROLES.OPERATOR;
  const groupName = sessionState?.activeTargetGroup?.name || null;
  const personaName =
    sessionState?.effectivePersona?.['char-name'] ||
    sessionState?.effectivePersona?.name ||
    null;

  let text = isOperator
    ? `**[BASTION TACTICAL ADVISOR — LOCAL COGNITION]**\nHere is the canonical breakdown for **your** query${personaName ? ` (**${personaName}**${groupName ? ` • ${groupName}` : ''})` : ''}:\n`
    : `**[BASTION CO-ARCHITECT — LOCAL COGNITION]**\nLet **us** review the canonical breakdown for **our** session${
        sessionState?.sessionGroups?.length > 1
          ? ` (${sessionState.sessionGroups.length} active campaign groups)`
          : groupName
            ? ` (**${groupName}**)`
            : ''
      }:\n`;

  if (alertMessage) {
    text += `\n> ⚠️ *Transport Notice: ${alertMessage}*\n`;
  }

  if (toolCalls.length > 0) {
    text += `\n### 🧮 Deterministic Engine Proof\n`;
    for (const tc of toolCalls) {
      const summaryLine = tc.result?.summary || JSON.stringify(tc.result);
      text += `- **\`${tc.name}\`**: ${summaryLine}\n`;
    }
  }

  if (ragResults.length > 0) {
    text += `\n### 📖 ${isOperator ? 'Rules & Lore Applicable to You' : 'Our Canonical Rules & Omnicortex Citations'}\n`;
    for (const { chunk } of ragResults.slice(0, 4)) {
      text += `\n#### 🔹 ${chunk.title} *(${chunk.citation})*\n${chunk.text}\n`;
    }
    text += isOperator
      ? `\n*Ask about **your** specific Skill Rank, weapon penetration, or Karma options to refine your next turn.*`
      : `\n*Tell me how **we** want to tune the CR, pacing clock, or squad split next.*`;
  } else {
    text += isOperator
      ? `\nYour local BASTION advisor is online. Ask about **your** 2d10 combat odds, **your** 150-CP character build, or Economatrix gear requisitions.`
      : `\nOur local Co-Architect core is online. **We** can audit 150-CP ledgers, calibrate encounter CRs across our campaign groups, or query Omnicortex mechanics.`;
  }

  return text;
}

/**
 * Sends a chat prompt to BASTION (3-Tier AI Cascade + Epistemic RAG + Bounded Neuro-Symbolic Tool Loop).
 * @param {{
 *   prompt: string,
 *   history?: any[],
 *   contextData?: Record<string, any> | null,
 *   role?: 'operator' | 'architect' | string | null,
 *   sessionState?: any,
 *   enableTools?: boolean,
 *   apiKey?: string,
 *   onStreamChunk?: ((partialText: string) => void) | null
 * }} params
 */
export const sendBastionChatMessage = async ({
  prompt,
  history = [],
  contextData = null,
  role = null,
  sessionState = null,
  enableTools = true,
  apiKey: explicitApiKey,
  onStreamChunk = null,
} = {}) => {
  const apiKey = explicitApiKey !== undefined ? explicitApiKey : getGeminiApiKey();
  await loadCompendiumSeedDataset().catch(() => {});

  const globalSession =
    typeof globalThis !== 'undefined' ? globalThis.__TANGENT_BASTION_SESSION__ : null;
  const resolvedSession = sessionState || globalSession || null;

  const rawRole =
    role ||
    sessionState?.effectiveRole ||
    contextData?.role ||
    globalSession?.effectiveRole ||
    BASTION_ROLES.ARCHITECT;
  const effectiveRole =
    String(rawRole).trim().toLowerCase() === BASTION_ROLES.OPERATOR ||
    String(rawRole).trim().toLowerCase() === 'operative' ||
    String(rawRole).trim().toLowerCase() === 'player'
      ? BASTION_ROLES.OPERATOR
      : BASTION_ROLES.ARCHITECT;

  const intent = classifyBastionIntent(prompt, resolvedSession || contextData);

  // Epistemic-filtered RAG retrieval (Operators NEVER receive [Architect Notes & Railguards])
  const ragResults = queryOmnicortexRAG(prompt, {
    topK: 5,
    role: effectiveRole,
  });
  const ragContext = formatRagContextForBastion(ragResults, effectiveRole);
  const citations = ragResults.map((r) => ({
    id: r.chunk.id,
    title: r.chunk.title,
    citation: r.chunk.citation,
    score: r.score,
  }));

  if (!hasAvailableAiTransport(apiKey)) {
    const offlineTools = await buildOfflineDeterministicToolSupplement(
      prompt,
      effectiveRole,
      resolvedSession
    );
    const fallbackText = buildRoleAwareFallbackReply({
      prompt,
      effectiveRole,
      sessionState: resolvedSession,
      ragResults,
      toolCalls: offlineTools,
    });
    if (typeof onStreamChunk === 'function') {
      onStreamChunk(fallbackText, fallbackText);
    }
    return {
      text: fallbackText,
      ragResults,
      citations,
      toolCalls: offlineTools,
      role: effectiveRole,
      intent,
      isSimulated: true,
    };
  }

  try {
    const formattedHistory = (Array.isArray(history) ? history : [])
      .filter((m) => m && typeof m.text === 'string' && m.text.trim())
      .map((m) => ({
        role: m.sender === 'user' || m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

    const MAX_HISTORY = 20;
    const truncatedHistory = formattedHistory.slice(-MAX_HISTORY);

    const systemPromptContent = composeBastionSystemPrompt({
      role: effectiveRole,
      intent,
      sessionState: resolvedSession,
      ragContext,
      contextData,
    });

    const contents = [
      ...truncatedHistory,
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    let toolsPayload = undefined;
    let registryInstance = null;
    if (enableTools) {
      try {
        const { DBMFunctionRegistry } = await import('../engine/ai/DBMFunctionRegistry.ts');
        registryInstance = DBMFunctionRegistry;
        const decls = DBMFunctionRegistry.getDeclarations(effectiveRole);
        if (decls.length > 0) {
          toolsPayload = [{ functionDeclarations: decls }];
        }
      } catch {}
    }

    const executedToolCalls = [];
    let data = await fetchGeminiContent(
      apiKey,
      {
        systemInstruction: { parts: [{ text: systemPromptContent }] },
        contents,
        ...(toolsPayload ? { tools: toolsPayload } : {}),
      },
      {
        onStreamChunk: toolsPayload ? null : onStreamChunk,
      }
    );

    // Bounded Neuro-Symbolic Function-Calling Loop (max 3 hops)
    let hop = 0;
    while (registryInstance && hop < 3) {
      const candidateParts = data?.candidates?.[0]?.content?.parts || [];
      const pendingCalls = candidateParts.filter((p) => p && p.functionCall);
      if (pendingCalls.length === 0) break;
      hop++;

      const modelTurnParts = [];
      const fnResponseParts = [];
      for (const part of pendingCalls) {
        const fc = part.functionCall;
        const toolRes = await registryInstance.executeToolCall(
          { name: fc.name, args: fc.args || {} },
          { role: effectiveRole }
        );
        executedToolCalls.push({
          name: fc.name,
          args: fc.args || {},
          result: toolRes,
        });
        modelTurnParts.push({ functionCall: { name: fc.name, args: fc.args || {} } });
        fnResponseParts.push({
          functionResponse: {
            name: fc.name,
            response: { result: toolRes },
          },
        });
      }

      contents.push({ role: 'model', parts: modelTurnParts });
      contents.push({ role: 'user', parts: fnResponseParts });

      data = await fetchGeminiContent(
        apiKey,
        {
          systemInstruction: { parts: [{ text: systemPromptContent }] },
          contents,
          ...(toolsPayload ? { tools: toolsPayload } : {}),
        },
        { onStreamChunk }
      );
    }

    const finalParts = data?.candidates?.[0]?.content?.parts || [];
    let replyText = finalParts
      .map((p) => (typeof p?.text === 'string' ? p.text : ''))
      .join('')
      .trim();

    if (!replyText) {
      throw new Error('No response content returned from BASTION AI.');
    }

    if (typeof onStreamChunk === 'function') {
      onStreamChunk('', replyText);
    }

    // Append citation badge if RAG matches were found and not already in reply
    if (ragResults.length > 0 && !replyText.includes('Omnicortex Citation:')) {
      replyText += `\n\n> 📚 *Omnicortex Citation: ${ragResults.map((r) => r.chunk.citation).join(' • ')}*`;
    }

    return {
      text: replyText,
      ragResults,
      citations,
      toolCalls: executedToolCalls,
      role: effectiveRole,
      intent,
      isSimulated: false,
    };
  } catch (err) {
    console.warn('BASTION API Error:', err);
    const offlineTools = await buildOfflineDeterministicToolSupplement(
      prompt,
      effectiveRole,
      resolvedSession
    );
    const fallbackText = buildRoleAwareFallbackReply({
      prompt,
      effectiveRole,
      sessionState: resolvedSession,
      ragResults,
      toolCalls: offlineTools,
      alertMessage: redactGeminiSecret(err?.message || 'Live inference unreachable — switched to local cognition', apiKey),
    });
    return {
      text: fallbackText,
      ragResults,
      citations,
      toolCalls: offlineTools,
      role: effectiveRole,
      intent,
      isSimulated: true,
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

  // If no live AI transport (API key, Local LLM, or authenticated geminiProxy), return structured simulation fallback for selected fields ONLY
  const buildSelectiveFallback = () => {
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
  };

  if (!hasAvailableAiTransport(apiKey)) {
    return buildSelectiveFallback();
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
    if (!apiKey) {
      return buildSelectiveFallback();
    }
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
  selectedPillarSkills = [],
  selectedRecommendedFeatures = [],
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

  const isSpeciesMatrix = matrixId === 'species';
  const isPillarMatrix = ['factions', 'origins', 'occupations', 'archetypes'].includes(matrixId);

  const cortexTraitLines = Array.isArray(selectedCortexTraits) && selectedCortexTraits.length > 0
    ? selectedCortexTraits
        .map(t => `- ${t.name} (ID: ${t.id} | ${t.cp ?? t.bp ?? 1} CP | ${t.trait_type || t.tier || 'Trait'}): ${t.mechanic || t.description || ''}`)
        .join('\n')
    : '';

  const cortexDisadvLines = isSpeciesMatrix && Array.isArray(selectedCortexDisadvantages) && selectedCortexDisadvantages.length > 0
    ? selectedCortexDisadvantages
        .map(d => `- ${d.name} (ID: ${d.id} | ${d.cp ?? d.refundCP ?? -2} CP): ${d.mechanic || d.description || ''}`)
        .join('\n')
    : '';

  const customAdjustmentsSummary = customAdjustmentsPayload?.promptSummary || '';

  const normalizedPillarSkills = Array.isArray(selectedPillarSkills)
    ? selectedPillarSkills
        .map(s => (typeof s === 'object' && s !== null ? (s.name || s.id || '') : String(s || '')))
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  const normalizedRecommendedFeatures = Array.isArray(selectedRecommendedFeatures)
    ? selectedRecommendedFeatures
        .map(f => (typeof f === 'object' && f !== null ? (f.name || f.id || '') : String(f || '')))
        .map(f => f.trim())
        .filter(Boolean)
    : [];

  // Subject-specific canonical rules context (explicitly scoped per asset matrix)
  const subjectRulesByMatrix = {
    species: `CANONICAL SPECIES RULES (20 CP BIOLOGICAL / SYNTHETIC PACKAGE):
- Species are NON-PROPERTY biological or synthetic lineages (NO craft_dc, NO credit cost, NO UDU sockets).
- Populate species_type, size, parent_species, stigma, traits (array of canonical Cortex species trait IDs or names), disadvantages (array of species disadvantage IDs or names if applicable), movement_modes (array), description, mechanic, note, and 5-pillar recommendation arrays (recommended_factions, recommended_origins, recommended_occupations, recommended_skills, recommended_features).`,
    species_lineage: `CANONICAL MACRO-LINEAGE TAXONOMY RULES:
- Macro-Lineages define overarching evolutionary or synthetic clades (NO hardware costs or sockets).
- Populate classification, parent_clade, baseline_biology, typical_chassis, description, mechanic, and note.`,
    species_type: `CANONICAL SPECIES CHASSIS TYPE RULES:
- Chassis Types define fundamental structural biology (Humanoid, Synthetic, Energy, Plant, Silicate, etc.) with CP valuation and systemic rules.
- Populate cp, vital_systems, healing_model, grants_traits, description, mechanic, and note.`,
    species_size: `CANONICAL SPECIES SIZE & SCALE TIER RULES:
- Size tiers define physical footprint, STR modifier, Combat/Stealth modifier, Reach, and CP cost.
- Populate cp, size_index, str_mod, combat_mod, stealth_mod, reach, space, description, mechanic, and note.`,
    species_movement: `CANONICAL LOCOMOTION & MOVEMENT MODE RULES:
- Locomotion modes define tactical movement speeds, environmental traversal, maneuverability, and CP cost.
- Populate cp, classification, speed_ft, maneuverability, description, mechanic, and note.`,
    factions: `CANONICAL FACTION RULES:
- Factions are NON-PROPERTY sociological polities, syndicates, houses, or orders (NO craft_dc, NO sockets, NO creature biology stats).
- Populate all 7 Faction Framework sections: faction_type, archetype, prominent_species, capital_world, government_type, leadership, succession, description, key_themes, relationship_to_others, symbol_sigil, driving_mandate, motto, colloquialisms, wealth_modifier, primary_exports, economic_model, core_beliefs, social_structure, outsider_view, law_order, military_doctrine, key_units, naval_assets, unique_tech_materials, skill_package (20 points total), traits (array of canonical Faction Trait IDs or names), typical_archetypes, recommended_species, recommended_origins, recommended_occupations, recommended_skills, recommended_features (-1 CP discount), bonus_features, setting_style, context_palette, lighting_mood, image_prompt, scene_vignettes, mechanic, and note.`,
    archetypes: `CANONICAL ARCHETYPE RULES (80 CP CHASSIS):
- Archetypes define the 80 CP character foundation across 4 Spheres: Sentinels, Operatives, Visionaries, Savants (NO creature biology stats or hardware sockets).
- Populate sphere, core_concept, quote, primary_attribute (+3 / 15 CP), secondary_attribute (+2 / 10 CP), essential_skills (array of 10 skills: 4 Trained + 6 Novice = 44 CP), signature_traits (array of 2 Archetype Traits), traits, tactical_role, recommended_occupations, recommended_origins, recommended_factions, description, and note.`,
    origins: `CANONICAL ORIGIN RULES (20 SP SOCIETY POOL):
- Origins define formative homeworlds and habitats with a 20 SP Society Skills pool (NO creature biology stats or hardware sockets).
- Populate habitat, skill_points (20), society_skills (array of 8-10 skills), archetypes (array), traits (array of 4-6 selectable Origin Traits), recommended_species, recommended_factions, recommended_occupations, recommended_skills, recommended_features, description, and note.`,
    occupations: `CANONICAL OCCUPATION RULES (20 SP PROFESSIONAL POOL):
- Occupations define vocational careers with a 20 SP Professional Skills pool (NO creature biology stats or hardware sockets).
- Populate field, skill_points (20), professional_skills (array of 8-10 skills), traits (array of selectable Occupational Traits), archetypes (array), recommended_species, recommended_factions, recommended_origins, recommended_skills, recommended_features, description, and note.`,
    skills: `CANONICAL SKILL RULES (2d10 DUAL RESOLUTION):
- Populate type (mental/physical/social/combat/meta), subtype, is_specialization, base_skill, recommended_tl, recommended_ml, description, mechanic (governing attribute, CR 10/15/20/25 benchmarks, opposed rules), and note.`,
    features: `CANONICAL FEATURE RULES:
- Populate type, acquisition_type (Basic/Multiple/Staged/Multi/Staged), cp (1-10 CP), multi, staged, prerequisite (array), description, mechanic (exact passive modifier or active trigger), and note.`,
    trait: `CANONICAL SINGLE TRAIT RULES:
- Single standalone Trait record (1, 2, or 4 CP) — NOT a full species lineage or multi-trait package.
- Populate trait_type, tier, classification, cp, mechanic (exact 2d10 modifier, immunity, or situational rule), description, and note.`,
    traits: `CANONICAL SINGLE TRAIT RULES:
- Single standalone Trait record (1, 2, or 4 CP) — NOT a full species lineage or multi-trait package.
- Populate trait_type, tier, classification, cp, mechanic (exact 2d10 modifier, immunity, or situational rule), description, and note.`,
    disadvantages: `CANONICAL DISADVANTAGE / HINDRANCE RULES:
- Single standalone Flaw / Hindrance record granting a CP rebate (-1 to -4 CP).
- Populate category, severity, refundCP, trigger_condition, save_dc, mitigation, mechanic, description, and note.`,
    invocation: `CANONICAL INVOCATION / PSIONICS RULES:
- Invocations are metaphysical powers channeled via Disciplines (NO physical sockets or credit cost).
- Populate discipline, foundationAttribute, meta_level, manifestation_dc, focus_cost, range, area, duration, description, mechanic (2d10 + Discipline vs Manifestation DC, saves, damage/effect, Nat 20 resonant surge, Overchannel Burn), and note.`,
    disciplines: `CANONICAL METAPHYSICAL DISCIPLINE RULES:
- Disciplines are foundational metaphysical schools (Attunement, Kinesis, Precognition, Telepathy, Translocation, Vitalism) — NOT single spell invocations.
- Populate tradition, governing_attribute, resonance_sphere, core_invocations, granted_skills, tier_progression, tenets, description, mechanic, and note.`,
    special_abilities: `CANONICAL SPECIAL ABILITY & EXOTIC TALENT RULES:
- Special Abilities are distinct 5+ CP apex, cyber-exotic, or supernatural talents (distinct from standard discipline spell invocations).
- Populate cp (default 5), discipline, action_type, focus_cost, cooldown, prerequisite, description, mechanic, and note.`,
    'meta-tech': `CANONICAL META-TECH ARTIFACT & CONDUIT RULES:
- Meta-Tech fuses physical fabrication (TL + Craft DC + TSC Credit Value) with metaphysical resonance (ML + Conduit Focus Capacity).
- Populate craft_dc, cost, tech_level, meta_level, conduit_type, focus_capacity, imbued_invocation, attunement_req, description, mechanic, and note.`,
    companions: `CANONICAL COMPANION, DRONE & FAMILIAR RULES:
- Companions are allied followers, drones, mounts, or familiars acquired via Character Points (CP) — NOT playable species lineages or raw inventory gear.
- Populate companion_type, cp, chassis, size, loyalty, command_link, primary_role, attacks, traits, description, mechanic, and note.`,
    'modular-characters': `CANONICAL MODULAR CHARACTER & THREAT STAT BLOCK RULES (MCM):
- Modular Characters are encounter-ready NPCs, adversaries, and bosses scaled by Threat Tier (1-5) and Combat Role.
- Populate threatTier, bossType, role, faction, species, attributes, vitality, health, defense, dr, attacks, special_actions, tactics, loot_profile, description, mechanic, and note.`,
    'planetary-design': `CANONICAL PLANETARY DESIGN & UWP WORLD RULES:
- Planetary systems use Universal World Profile (UWP) parameters (NO creature stats or personal gear sockets).
- Populate starport, size_code, atmosphere, hydrographics, population, government, law_level, trade_codes, hazards, dominant_factions, points_of_interest, description, mechanic, and note.`,
    world: `CANONICAL WORLD DOSSIER RULES:
- World records chronicle named planetary spheres, biosphere ecology, settlements, and regional hooks (NO hardware costs or creature biology stats).
- Populate starport, biome, dominant_factions, settlements, hazards, description, mechanic, and note.`,
    universe: `CANONICAL UNIVERSE & COSMOLOGY RULES:
- Universe frameworks establish macro-cosmological laws, timeline eras, FTL/metaphysical constants, and active pillars.
- Populate era, cosmology_laws, active_pillars, tech_ceiling, meta_ceiling, description, mechanic, and note.`,
    setting: `CANONICAL CAMPAIGN SETTING & SECTOR RULES:
- Campaign Settings define playable star sectors, flashpoint fronts, faction tensions, and tone directives.
- Populate sector_coordinates, dominant_factions, threat_rating, tone, key_locations, description, mechanic, and note.`,
    philosophy: `CANONICAL PHILOSOPHY, CREED & DOCTRINE RULES:
- Philosophies define ideological creeds, monastic orders, ethical virtues, anathemas, and social resonance.
- Populate core_tenets, virtues, anathemas, practicing_factions, mechanical_boon, description, mechanic, and note.`,
    scene: `CANONICAL TACTICAL & NARRATIVE SCENE RULES:
- Scenes define encounter environments, lighting/gravity/atmosphere zones, interactive set-pieces, and opposition hooks.
- Populate scene_type, lighting_condition, gravity_zone, atmosphere_hazard, recommended_threats, loot_tier, description, mechanic, and note.`,
    societies: `CANONICAL SOCIETY SPHERE & GOVERNANCE INDEX RULES:
- Society entries define governance structures, legal codes, economic indices, and citizen rights.
- Populate sphere, index_rating, uwp_code, enforcement_agency, citizen_rights, restricted_tech, cultural_taboos, description, mechanic, and note.`,
    weaponry: `CANONICAL WEAPONRY & ARMAMENT RULES (EUFT / TSC):
- Weaponry uses Crafting CR (craft_dc) to set TSC Credit Value = 10 * 4^(floor(DC/5)).
- Populate weapon_category, damage, damage_type, penetration, range, rof, magazine, hands, weight, sockets, craft_dc, cost, description, mechanic, and note.`,
    armor: `CANONICAL ARMOR & DEFENSIVE SYSTEM RULES (EUFT / TSC):
- Armor uses Crafting CR (craft_dc) to set TSC Credit Value = 10 * 4^(floor(DC/5)).
- Populate armor_category, dr_kinetic, dr_energy, dr_exotic, coverage, agi_cap, armor_check_penalty, weight, sockets, craft_dc, cost, description, mechanic, and note.`,
    augmentations: `CANONICAL AUGMENTATION, CYBERWARE & BIOWARE RULES:
- Augmentations combine Crafting CR / Credit Cost with Essence / System Strain impact and body-slot installation.
- Populate augmentation_type, body_location, essence_cost, grade, activation, craft_dc, cost, modifiers, description, mechanic, and note.`,
    equipment: `CANONICAL TACTICAL HARDWARE & GEAR RULES (EUFT / TSC):
- Tactical Gear uses Crafting CR (craft_dc) to set TSC Credit Value = 10 * 4^(floor(DC/5)).
- Populate gear_category, power_source, duration, weight, udu_slots, craft_dc, cost, description, mechanic (exact 2d10 skill bonuses or utility rules), and note.`,
    mecha: `CANONICAL MECHA, VEHICLE & STARSHIP CHASSIS RULES:
- Heavy frames and vessels scale Structure Points, Armor DR, Propulsion, Crew, Hardpoints, and TSC Capital Valuation.
- Populate chassis_class, size, crew, structure_points, armor_dr, speed, hardpoints, sensor_rating, craft_dc, cost, description, mechanic, and note.`,
    architecture: `CANONICAL ARCHITECTURE, FACILITY & STATION RULES:
- Structural facilities define UDU capacity, power grid output, security rating, garrison/staffing, and construction valuation.
- Populate facility_type, footprint, udu_capacity, power_output, security_rating, modules, craft_dc, cost, description, mechanic, and note.`,
    other: `CANONICAL TRADE COMMODITY & EXOTIC PROPERTY RULES:
- Trade goods, reagents, and curiosities define cargo tonnage, legality class, containment requirements, and TSC market value.
- Populate property_subtype, trade_code, legality, containment_class, cargo_units, craft_dc, cost, description, mechanic, and note.`
  };

  const subjectGuidance = subjectRulesByMatrix[matrixId] || (
    isProperty
      ? `CANONICAL PROPERTY & HARDWARE RULES (EUFT / TSC):
- Hardware & property items use Crafting CR / Design DC (craft_dc) to determine Market Value via the Tangent Standard Curve: Credit Value = 10 * 4^(floor(DC/5)).
- Populate craft_dc, cost, durability/weight/slots where applicable, description, mechanic (exact 2d10 combat/utility rules, Penetration, DR, or modifiers), and note.`
      : `CANONICAL OMNICORTEX RULES (${matrix.name}):
- Non-property ${matrix.label} rules entry. Do NOT include fabrication credit costs, hardware sockets, or unrelated biological species stats.
- Populate all schema fields for ${matrix.name} with rules-accurate 2d10 Dual Resolution mechanics and lore.`
  );

  const traitDirectiveHeading = isSpeciesMatrix
    ? 'SELECTED SPECIES TRAITS (MUST INCLUDE IN TRAITS ARRAY & MECHANICS):'
    : isPillarMatrix
      ? `SELECTED ${matrix.name.toUpperCase()} PILLAR TRAITS (MUST INCLUDE IN TRAITS ARRAY & MECHANICS):`
      : 'SELECTED CORTEX TRAITS (MUST INCLUDE IN TRAITS ARRAY & MECHANICS):';

  const adjustmentsDirectiveHeading = isSpeciesMatrix
    ? 'CUSTOM SPECIES TRAIT & ADJOINING MODIFIER ADJUSTMENTS (WITH TRACKED CP COSTS):'
    : `SELECTED ${matrix.name.toUpperCase()} TRAIT PARAMETERS:`;

  const systemInstructions = `You are BASTION, the Tactical AI & System Rules Co-Architect for the Tangent Science Fantasy Roleplaying Game (SFF RPG) CODEX Rules Builder.
Collaborate with the Architect in partnered "we" / "our" framing inside notes, and engineer balanced, rules-accurate, mathematically grounded in-game content that integrates directly with the canonical OMNICORTEX database.

TARGET MATRIX: ${matrix.name} (${matrix.label})
CATEGORY: ${matrix.category} (${matrix.description || ''})
${nameDirective}
CONCEPT / ARCHETYPE: ${archetype ? `${archetype.name} — ${archetypePrompt}` : `Canonical ${matrix.label} entry grounded in Tangent SFF RP lore and mechanics.`}
${modularLines ? `MODULAR CONCEPT MATRIX (COMBINED AXES):\n${modularLines}` : ''}
${paramLines ? `SELECTED SUBJECT PARAMETERS:\n${paramLines}` : ''}
${profile?.showTechLevel !== false ? `TECH LEVEL: TL ${targetTechLevel} (0: Archaic, 1: Industrial, 2: Modern, 3: Interstellar Cyber, 4: Quantum/Bioware, 5: Singularity)` : ''}
${profile?.showMetaLevel !== false ? `META LEVEL: ML ${targetMetaLevel} (0: None, 1: Latent, 2: Awakened, 3: Adept, 4: Master, 5: Cosmic)` : ''}
${cortexTraitLines ? `${traitDirectiveHeading}\n${cortexTraitLines}` : ''}
${cortexDisadvLines ? `SELECTED SPECIES DISADVANTAGES / FLAWS (MUST INCLUDE IN DISADVANTAGES ARRAY):\n${cortexDisadvLines}` : ''}
${normalizedPillarSkills.length > 0 ? `SELECTED 20-SP SKILL POOL SKILLS (FIXED 20 SP POOL — MUST INCLUDE IN SKILL POOL): ${normalizedPillarSkills.join(', ')}` : ''}
${normalizedRecommendedFeatures.length > 0 ? `SELECTED RECOMMENDED FEATURES (-1 CP DISCOUNT — MUST INCLUDE IN RECOMMENDED_FEATURES ARRAY): ${normalizedRecommendedFeatures.join(', ')}` : ''}
${customAdjustmentsSummary ? `${adjustmentsDirectiveHeading}\n${customAdjustmentsSummary}` : ''}
DIRECTIVES: ${customDirectives || `Adhere strictly to Tangent SFF RP canonical rules and schema for ${matrix.label}.`}

${subjectGuidance}

REQUIRED FIELDS TO POPULATE FOR ${matrix.name}:
${fieldDefinitions}

OUTPUT FORMAT:
Provide ONLY a valid JSON object matching the ${matrix.name} matrix fields. Ensure all selected subject parameters (${Object.keys(categoryParams || {}).join(', ')}) are respected and NO cross-domain fields leak into ${matrix.name}.
Return ONLY the raw JSON object.`;

  const explicitTraitEntries = (customAdjustmentsPayload?.traits?.length > 0)
    ? customAdjustmentsPayload.traits
    : (selectedCortexTraits || []).map(t => t.id || t.name).filter(Boolean);
  const explicitDisadvEntries = isSpeciesMatrix
    ? ((customAdjustmentsPayload?.disadvantages?.length > 0)
        ? customAdjustmentsPayload.disadvantages
        : (selectedCortexDisadvantages || []).map(d => d.id || d.name).filter(Boolean))
    : [];
  const moduleSuggestedTraitIds = Array.from(
    new Set(
      (selectedModules || [])
        .flatMap(m => Array.isArray(m.suggestedTraits) ? m.suggestedTraits : [])
        .filter(Boolean)
    )
  ).slice(0, 5);

  const applyCustomAdjustmentsToResult = (targetObj) => {
    if (!customAdjustmentsPayload) return targetObj;

    // Non-species matrices must NEVER receive Species biological package modifiers or CP overrides
    if (!isSpeciesMatrix) {
      return targetObj;
    }

    if (Array.isArray(customAdjustmentsPayload.modifiers) && customAdjustmentsPayload.modifiers.length > 0) {
      const existingMods = Array.isArray(targetObj.modifiers) ? targetObj.modifiers : [];
      targetObj.modifiers = [...customAdjustmentsPayload.modifiers, ...existingMods];
    }

    // Normalize attribute_modifiers from either array or plain object map { str: 1, ... }
    const rawAttrMods = customAdjustmentsPayload.attribute_modifiers;
    const normalizedAttrModArray = Array.isArray(rawAttrMods)
      ? rawAttrMods
      : (rawAttrMods && typeof rawAttrMods === 'object')
        ? Object.entries(rawAttrMods)
            .filter(([, val]) => Number(val) !== 0)
            .map(([attribute, val]) => ({ attribute, bonus: Number(val) }))
        : [];

    if (normalizedAttrModArray.length > 0) {
      targetObj.attribute_modifiers = normalizedAttrModArray;
      targetObj.inherent_attribute_modifiers = normalizedAttrModArray;
      targetObj.attributes = {
        ...(targetObj.attributes || {}),
        ...(customAdjustmentsPayload.attributes || {})
      };
      normalizedAttrModArray.forEach(({ attribute, bonus }) => {
        if (attribute && Number(bonus) !== 0) {
          targetObj[`bonus_${attribute.toLowerCase()}`] = Number(bonus);
        }
      });
    }

    // Normalize specific_skill_bonuses from either array or plain object map { Stealth: 2, ... }
    const rawSkillBonuses = customAdjustmentsPayload.specific_skill_bonuses;
    const normalizedSkillBonusArray = Array.isArray(rawSkillBonuses)
      ? rawSkillBonuses
      : (rawSkillBonuses && typeof rawSkillBonuses === 'object')
        ? Object.entries(rawSkillBonuses)
            .filter(([, val]) => Number(val) !== 0)
            .map(([skill, val]) => ({ skill_id: skill, skill, bonus: Number(val) }))
        : [];

    if (normalizedSkillBonusArray.length > 0) {
      targetObj.specific_skill_bonuses = normalizedSkillBonusArray;
    }

    if (typeof customAdjustmentsPayload.bonus_skills === 'number' && customAdjustmentsPayload.bonus_skills > 0) {
      targetObj.bonus_skills = customAdjustmentsPayload.bonus_skills;
      targetObj.skill_bundles = Math.floor(customAdjustmentsPayload.bonus_skills / 5);
    } else if (Array.isArray(customAdjustmentsPayload.bonus_skills) && customAdjustmentsPayload.bonus_skills.length > 0) {
      const existingRecSkills = Array.isArray(targetObj.recommended_skills) ? targetObj.recommended_skills : [];
      targetObj.recommended_skills = Array.from(new Set([...customAdjustmentsPayload.bonus_skills, ...existingRecSkills]));
    }

    if (Array.isArray(customAdjustmentsPayload.movement_modes) && customAdjustmentsPayload.movement_modes.length > 0) {
      const formattedModes = customAdjustmentsPayload.movement_modes
        .map(m => (typeof m === 'object' && m !== null ? `${m.mode || 'Custom'} (${m.speed || 30} ft)` : String(m)))
        .filter(Boolean);
      const existingModes = Array.isArray(targetObj.movement_modes) ? targetObj.movement_modes : [];
      const mergedModes = Array.from(new Set([...formattedModes, ...existingModes]));
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

  const buildMatrixFallback = () => {
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
              ? `Selected ${matrix.name} Traits: ${selectedCortexTraits.map(t => `${t.name} (${t.cp ?? 1} CP — ${t.mechanic || 'Canonical trait'})`).join('; ')}. `
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
    } else if (matrixId === 'factions') {
      baseFallback.faction_type = categoryParams.faction_type || 'Major Polity';
      baseFallback.government_type = categoryParams.government_type || 'Corporate Oligarchy';
      baseFallback.wealth_modifier = categoryParams.wealth_modifier || '0 (Standard Baseline)';
      baseFallback.archetype = archetype?.name || 'Interstellar Polity';
      baseFallback.prominent_species = 'Cosmopolitan / Multi-Lineage Membership';
      baseFallback.capital_world = `${resolvedName.split(' ')[0]} Prime`;
      baseFallback.driving_mandate = customDirectives || 'Secure strategic trade corridors and expand sector sovereignty.';
      baseFallback.motto = '"Order Through Unity, Prosperity Through Resolve."';
      baseFallback.skill_points = 20;
      baseFallback.skill_package = normalizedPillarSkills.length > 0
        ? normalizedPillarSkills.join(', ')
        : 'Diplomacy, Streetwise, Computers, Alertness, Pilot, Small Arms';
      baseFallback.recommended_skills = normalizedPillarSkills.length > 0
        ? normalizedPillarSkills
        : ['Diplomacy', 'Streetwise', 'Computers', 'Alertness', 'Pilot', 'Small Arms'];
      baseFallback.typical_archetypes = 'The Envoy, The Operative, The Quartermaster, The Enforcer';
      baseFallback.recommended_features = normalizedRecommendedFeatures.length > 0
        ? normalizedRecommendedFeatures
        : ['Benefit (Authority)', 'Connected', 'Gearhead'];
      baseFallback.setting_style = 'High-Contrast Science Fantasy, Industrial & Neon';
    } else if (matrixId === 'origins') {
      baseFallback.habitat = categoryParams.habitat || 'Planetary Core World';
      baseFallback.ws_modifier = Number(categoryParams.ws_modifier ?? 1);
      baseFallback.skill_points = 20;
      const defaultOriginSkills = ['Alertness', 'Athletics', 'Computers', 'Diplomacy', 'Drive', 'Knowledge (Local)', 'Streetwise', 'Survival'];
      baseFallback.society_skills = normalizedPillarSkills.length > 0
        ? Array.from(new Set([...normalizedPillarSkills, ...defaultOriginSkills]))
        : defaultOriginSkills;
      baseFallback.recommended_skills = baseFallback.society_skills;
      baseFallback.recommended_features = normalizedRecommendedFeatures.length > 0
        ? normalizedRecommendedFeatures
        : ['Environmental Adaptation', 'Tough', 'Alertness'];
      baseFallback.archetypes = ['Sentinel', 'Operative', 'Savant'];
    } else if (matrixId === 'occupations') {
      baseFallback.field = categoryParams.field || 'Tactical & Security';
      baseFallback.base_ws = Number(categoryParams.base_ws ?? 3);
      baseFallback.skill_points = 20;
      const defaultOccSkills = ['Alertness', 'Athletics', 'Computers', 'Medicine', 'Investigation', 'Mechanics', 'Pilot', 'Small Arms'];
      baseFallback.professional_skills = normalizedPillarSkills.length > 0
        ? Array.from(new Set([...normalizedPillarSkills, ...defaultOccSkills]))
        : defaultOccSkills;
      baseFallback.recommended_skills = baseFallback.professional_skills;
      baseFallback.recommended_features = normalizedRecommendedFeatures.length > 0
        ? normalizedRecommendedFeatures
        : ['Gearhead', 'Connected', 'Lightning Reflexes'];
      baseFallback.archetypes = ['Operative', 'Sentinel', 'Savant'];
    } else if (matrixId === 'archetypes') {
      baseFallback.sphere = categoryParams.sphere || 'Operatives';
      baseFallback.primary_attribute = categoryParams.primary_attribute || 'Agility';
      baseFallback.secondary_attribute = categoryParams.secondary_attribute || 'Intellect';
      baseFallback.essential_skills = ['Alertness', 'Athletics', 'Stealth', 'Small Arms', 'Computers', 'Investigation', 'Insight', 'Acrobatics', 'Deception', 'Tactics'];
    }

    if (isPillarMatrix && (explicitTraitEntries.length > 0 || moduleSuggestedTraitIds.length > 0)) {
      const resolvedPillarTraits = explicitTraitEntries.length > 0 ? explicitTraitEntries : moduleSuggestedTraitIds;
      baseFallback.traits = resolvedPillarTraits;
      if (matrixId === 'archetypes') {
        baseFallback.signature_traits = resolvedPillarTraits.slice(0, 2);
      }
    }

    return baseFallback;
  };

  if (!hasAvailableAiTransport(apiKey)) {
    return buildMatrixFallback();
  }

  let response;
  try {
    response = await fetchGeminiContent(apiKey, {
      contents: [{ role: 'user', parts: [{ text: systemInstructions }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
  } catch (err) {
    if (!apiKey) return buildMatrixFallback();
    throw err;
  }

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

  if (['factions', 'origins', 'occupations'].includes(matrixId)) {
    parsed.skill_points = 20;
    if (normalizedPillarSkills.length > 0) {
      if (matrixId === 'origins') {
        const existing = Array.isArray(parsed.society_skills) ? parsed.society_skills : [];
        parsed.society_skills = Array.from(new Set([...normalizedPillarSkills, ...existing]));
        parsed.recommended_skills = parsed.society_skills;
      } else if (matrixId === 'occupations') {
        const existing = Array.isArray(parsed.professional_skills) ? parsed.professional_skills : [];
        parsed.professional_skills = Array.from(new Set([...normalizedPillarSkills, ...existing]));
        parsed.recommended_skills = parsed.professional_skills;
      } else if (matrixId === 'factions') {
        const existingPkg = typeof parsed.skill_package === 'string'
          ? parsed.skill_package.split(',').map(s => s.trim()).filter(Boolean)
          : (Array.isArray(parsed.skill_package) ? parsed.skill_package : []);
        const mergedPkg = Array.from(new Set([...normalizedPillarSkills, ...existingPkg]));
        parsed.skill_package = mergedPkg.join(', ');
        parsed.recommended_skills = mergedPkg;
      }
    }
    if (normalizedRecommendedFeatures.length > 0) {
      const existingFeats = Array.isArray(parsed.recommended_features)
        ? parsed.recommended_features
        : (typeof parsed.recommended_features === 'string'
          ? parsed.recommended_features.split(',').map(s => s.trim()).filter(Boolean)
          : []);
      parsed.recommended_features = Array.from(new Set([...normalizedRecommendedFeatures, ...existingFeats]));
    }
  }

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

  // If no live AI transport (API key, Local LLM, or authenticated geminiProxy), return simulated offline cognition using canonical sample
  if (!hasAvailableAiTransport(apiKey)) {
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

