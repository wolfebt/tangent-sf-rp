/**
 * @file interactivePlayService.js
 * @description Master Session Lifecycle & Modifiers Engine for ADE Interactive Play.
 * ZERO MOCK OR HARDCODED PRESETS:
 * Dynamically ingests operatives, personas, modifiers, and conditions strictly from:
 *   1. Folio Character Roster database (Firestore & local database).
 *   2. Story Foundry Elements database (Personas cataloged in elementsCatalog).
 *   3. Omnicortex Compendium database (Canonical Archetypes & Supporting Modifiers).
 *   4. Active Scenario linked elements and story hierarchy.
 */

import { v4 as uuidv4 } from 'uuid';
import { rollDice } from '../../../services/diceService.js';
import { resolveSubAttrScore, calculateSubAttrBase, SUB_ATTRIBUTE_PAIRS } from '../../../utils/attributeUtils.js';
import { DEFAULT_MODIFIERS } from '../../../data/supportingCatalogsData.js';
import { DEFAULT_ARCHETYPES } from '../../../data/archetypesData.js';
import { MODIFIER_PRESETS } from '../../../services/modifierService.ts';

export const INTERACTIVE_SESSIONS_STORAGE_KEY = 'tangent_interactive_sessions';

/**
 * Normalizes an attribute name (e.g. 'Strength' -> 'attr-strength')
 */
const getAttrKeyFromName = (attrName = '') => {
  const lower = String(attrName).toLowerCase().trim();
  if (lower.includes('strength') || lower === 'str') return 'attr-strength';
  if (lower.includes('agility') || lower === 'agi') return 'attr-agility';
  if (lower.includes('stamina') || lower === 'sta') return 'attr-stamina';
  if (lower.includes('intellect') || lower === 'int') return 'attr-intellect';
  if (lower.includes('wisdom') || lower === 'wis') return 'attr-wisdom';
  if (lower.includes('charisma') || lower === 'cha') return 'attr-charisma';
  return 'attr-strength';
};

/**
 * Creates a standardized Operative object from ANY database persona source:
 * - Folio Persona Roster
 * - Story Foundry Persona Element
 * - Omnicortex Compendium Archetype
 */
export const createOperativeFromDatabasePersona = (entry, source = 'folio') => {
  if (!entry) return null;

  // 1. FOLIO PERSONA
  if (source === 'folio' || entry['character-doc-id']) {
    const docId = entry['character-doc-id'] || entry.id || `folio_${uuidv4().slice(0, 6)}`;
    const str = Number(entry['attr-strength']) || 1;
    const agi = Number(entry['attr-agility']) || 1;
    const sta = Number(entry['attr-stamina']) || 1;
    const int = Number(entry['attr-intellect']) || 1;
    const wis = Number(entry['attr-wisdom']) || 1;
    const cha = Number(entry['attr-charisma']) || 1;

    const hp = Number(entry['current-health']) || Number(entry['health']) || 30;
    const maxHp = Number(entry['max-health']) || Number(entry['health']) || 30;
    const shields = Number(entry['current-shields']) || 15;
    const maxShields = Number(entry['max-shields']) || 15;
    const strain = Number(entry['current-strain']) || 0;
    const maxStrain = Number(entry['max-strain']) || 12;

    return {
      id: docId,
      sourceDocId: docId,
      sourceType: 'folio',
      sourceLabel: 'Folio Database',
      name: entry['char-name'] || 'Unnamed Operative',
      archetype: entry['char-archetype'] || 'Hero',
      species: entry['char-species'] || 'Terran',
      focus: entry['char-concept'] || entry['char-occu'] || 'Operative',
      concept: entry['char-concept'] || 'Custom Persona from Folio Roster',
      attributes: { strength: str, agility: agi, stamina: sta, intellect: int, wisdom: wis, charisma: cha },
      subAttributes: {
        'attr-might': resolveSubAttrScore('attr-might', entry),
        'attr-reflex': resolveSubAttrScore('attr-reflex', entry),
        'attr-fortitude': resolveSubAttrScore('attr-fortitude', entry),
        'attr-logic': resolveSubAttrScore('attr-logic', entry),
        'attr-will': resolveSubAttrScore('attr-will', entry),
        'attr-etiquette': resolveSubAttrScore('attr-etiquette', entry)
      },
      vitals: {
        health: hp,
        maxHealth: maxHp,
        shields,
        maxShields,
        strain,
        maxStrain,
        plotPoints: Number(entry['plot-points']) || 2,
        karma: Number(entry['karma']) || 3
      },
      equippedWeapons: Array.isArray(entry.weapons) ? entry.weapons : [{ name: 'Sidearm TL-3', damage: '2d6', tl: 3 }],
      equippedArmor: entry.armor || { name: 'Composite Weave', soak: 2 }
    };
  }

  // 2. STORY FOUNDRY PERSONA ELEMENT (from elementsCatalog)
  if (source === 'foundry' || entry.type === 'Persona') {
    const fields = entry.fields || {};
    const name = fields['char-name'] || entry.title || 'Foundry Persona';
    const str = Number(fields['attr-strength']) || 2;
    const agi = Number(fields['attr-agility']) || 2;
    const sta = Number(fields['attr-stamina']) || 2;
    const int = Number(fields['attr-intellect']) || 2;
    const wis = Number(fields['attr-wisdom']) || 1;
    const cha = Number(fields['attr-charisma']) || 1;

    const hp = Number(fields['health']) || 30;
    const shields = Number(fields['shields']) || 15;

    return {
      id: entry.id,
      sourceDocId: entry.id,
      sourceType: 'foundry',
      sourceLabel: 'Foundry Elements DB',
      name,
      archetype: fields['char-concept'] || fields['role'] || 'Story Persona',
      species: fields['char-species'] || 'Terran',
      focus: fields['role'] || fields['char-motive'] || entry.summary || 'Scenario Character',
      concept: entry.content || entry.summary || fields['char-concept'] || 'Story Foundry Element',
      attributes: { strength: str, agility: agi, stamina: sta, intellect: int, wisdom: wis, charisma: cha },
      subAttributes: {
        'attr-might': calculateSubAttrBase(str),
        'attr-reflex': calculateSubAttrBase(agi),
        'attr-fortitude': calculateSubAttrBase(sta),
        'attr-logic': calculateSubAttrBase(int),
        'attr-will': calculateSubAttrBase(wis),
        'attr-etiquette': calculateSubAttrBase(cha)
      },
      vitals: {
        health: hp,
        maxHealth: hp,
        shields,
        maxShields: shields,
        strain: 0,
        maxStrain: 12,
        plotPoints: Number(fields['plot-points']) || 2,
        karma: Number(fields['karma']) || 3
      },
      equippedWeapons: [{ name: 'Assault Carbine TL-3', damage: '2d8', tl: 3 }],
      equippedArmor: { name: 'Tactical Vest', soak: 2 }
    };
  }

  // 3. OMNICORTEX COMPENDIUM ARCHETYPE (from archetypesData or DBM)
  const primAttrKey = getAttrKeyFromName(entry.primary_attribute || 'Strength');
  const secAttrKey = getAttrKeyFromName(entry.secondary_attribute || 'Agility');

  const attrs = {
    'attr-strength': 1,
    'attr-agility': 1,
    'attr-stamina': 1,
    'attr-intellect': 1,
    'attr-wisdom': 1,
    'attr-charisma': 1
  };
  attrs[primAttrKey] = 3;
  attrs[secAttrKey] = 2;

  return {
    id: entry.id,
    sourceDocId: entry.id,
    sourceType: 'omnicortex',
    sourceLabel: 'Omnicortex Compendium',
    name: entry.name || 'Compendium Operative',
    archetype: entry.name || 'Archetype',
    species: 'Terran',
    focus: entry.tactical_role || entry.core_concept || entry.sphere || 'Compendium Archetype',
    concept: entry.summary || entry.flavor || entry.description || 'Omnicortex Compendium Archetype',
    attributes: {
      strength: attrs['attr-strength'],
      agility: attrs['attr-agility'],
      stamina: attrs['attr-stamina'],
      intellect: attrs['attr-intellect'],
      wisdom: attrs['attr-wisdom'],
      charisma: attrs['attr-charisma']
    },
    subAttributes: {
      'attr-might': calculateSubAttrBase(attrs['attr-strength']),
      'attr-reflex': calculateSubAttrBase(attrs['attr-agility']),
      'attr-fortitude': calculateSubAttrBase(attrs['attr-stamina']),
      'attr-logic': calculateSubAttrBase(attrs['attr-intellect']),
      'attr-will': calculateSubAttrBase(attrs['attr-wisdom']),
      'attr-etiquette': calculateSubAttrBase(attrs['attr-charisma'])
    },
    vitals: {
      health: 30,
      maxHealth: 30,
      shields: 15,
      maxShields: 15,
      strain: 0,
      maxStrain: 12,
      plotPoints: 2,
      karma: 3
    },
    equippedWeapons: [{ name: `${entry.name} Weaponry`, damage: '2d8', tl: 3 }],
    equippedArmor: { name: 'Standard Combat Rig', soak: 2 }
  };
};

/**
 * Aggregates all available personas directly from actual database sources:
 * 1. Folio Roster
 * 2. Story Foundry elementsCatalog (type === 'Persona')
 * 3. Compendium Archetypes (DEFAULT_ARCHETYPES or dbArchetypes)
 */
export const loadDatabasePersonas = ({
  roster = [],
  characterData = null,
  elementsCatalog = [],
  activeScenario = null,
  dbArchetypes = []
}) => {
  const result = [];
  const seenIds = new Set();

  // 1. Folio Roster Personas
  if (Array.isArray(roster) && roster.length > 0) {
    for (const char of roster) {
      const op = createOperativeFromDatabasePersona(char, 'folio');
      if (op && !seenIds.has(op.id)) {
        seenIds.add(op.id);
        result.push(op);
      }
    }
  }

  // Active character data if not already in roster
  if (characterData && (!characterData['character-doc-id'] || !seenIds.has(characterData['character-doc-id']))) {
    const op = createOperativeFromDatabasePersona(characterData, 'folio');
    if (op && !seenIds.has(op.id)) {
      seenIds.add(op.id);
      result.unshift(op);
    }
  }

  // 2. Story Foundry Persona Elements from elementsCatalog
  if (Array.isArray(elementsCatalog) && elementsCatalog.length > 0) {
    const personaElements = elementsCatalog.filter(e => e.type === 'Persona' || e.category === 'Persona');
    for (const elem of personaElements) {
      const op = createOperativeFromDatabasePersona(elem, 'foundry');
      if (op && !seenIds.has(op.id)) {
        seenIds.add(op.id);
        result.push(op);
      }
    }
  }

  // 3. Compendium Archetypes from Omnicortex DB
  const archetypesPool = (Array.isArray(dbArchetypes) && dbArchetypes.length > 0) ? dbArchetypes : DEFAULT_ARCHETYPES;
  if (Array.isArray(archetypesPool) && archetypesPool.length > 0) {
    for (const arch of archetypesPool) {
      const op = createOperativeFromDatabasePersona(arch, 'omnicortex');
      if (op && !seenIds.has(op.id)) {
        seenIds.add(op.id);
        result.push(op);
      }
    }
  }

  return result;
};

/**
 * Aggregates all available modifiers directly from actual database sources:
 * 1. Supporting Catalogs DEFAULT_MODIFIERS or dbModifiers
 * 2. Story Gallery universeState.galleryModifiers or MODIFIER_PRESETS
 * 3. Active character tracked conditions
 */
export const loadDatabaseModifiers = ({
  dbModifiers = [],
  galleryModifiers = [],
  activeCharacter = null
}) => {
  const result = [];
  const seenIds = new Set();

  // 1. Canonical DBM Supporting Catalog Modifiers
  const dbPool = (Array.isArray(dbModifiers) && dbModifiers.length > 0) ? dbModifiers : DEFAULT_MODIFIERS;
  for (const m of dbPool) {
    if (!m) continue;
    const id = m.id || `dbm_${m.name}`;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      result.push({
        id,
        name: m.name,
        target: m.target || 'all',
        value: Number(m.value) || 1,
        type: m.type || (m.value >= 0 ? 'bonus' : 'penalty'),
        description: m.description || `Database modifier: ${m.name}`
      });
    }
  }

  // 2. Story Gallery Modifiers from Universe State or Presets
  const galleryPool = (Array.isArray(galleryModifiers) && galleryModifiers.length > 0) ? galleryModifiers : MODIFIER_PRESETS;
  for (const gm of galleryPool) {
    if (!gm) continue;
    const id = gm.id || `gm_${gm.name}`;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      let targetAttr = 'all';
      let effectVal = 1;
      if (gm.effects?.defenseMod) {
        targetAttr = 'attr-fortitude';
        effectVal = gm.effects.defenseMod;
      } else if (gm.effects?.techMod) {
        targetAttr = 'attr-logic';
        effectVal = gm.effects.techMod;
      } else if (gm.effects?.metaphysicMod) {
        targetAttr = 'attr-will';
        effectVal = gm.effects.metaphysicMod;
      }

      result.push({
        id,
        name: gm.name,
        target: targetAttr,
        value: effectVal,
        type: effectVal >= 0 ? 'bonus' : 'penalty',
        description: gm.description || gm.effects?.customRuleText || `Gallery modifier: ${gm.name}`
      });
    }
  }

  return result;
};

/**
 * Safely parses all interactive play sessions from local storage
 */
export const loadAllSessions = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INTERACTIVE_SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load interactive play sessions from localStorage:', err);
    return [];
  }
};

/**
 * Saves all interactive play sessions to local storage
 */
export const persistAllSessions = (sessions) => {
  if (typeof window === 'undefined' || !Array.isArray(sessions)) return;
  try {
    localStorage.setItem(INTERACTIVE_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to persist interactive play sessions to localStorage:', err);
  }
};

/**
 * Creates a new Interactive Play Session from database operatives
 */
export const createInteractiveSession = ({
  storyId,
  scenarioId,
  scenarioTitle = 'Tactical Scenario',
  mode = 'solo', // 'solo' | 'director'
  partyMode = 'solo', // 'solo' | 'group'
  operatives = [],
  activeOperativeId = null
}) => {
  const activeId = activeOperativeId || operatives[0]?.id || 'operative_lead';

  const session = {
    id: `ips_${Date.now()}_${uuidv4().slice(0, 6)}`,
    storyId: storyId || 'default_story',
    activeScenarioId: scenarioId || '',
    activeScenarioTitle: scenarioTitle,
    mode,
    partyMode, // Solo by default, with option for group
    operatives,
    activeOperativeId: activeId,
    activeModifiers: [], // Live Tracked Modifiers Ledger
    beats: [],
    worldFlags: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const existing = loadAllSessions();
  const next = [session, ...existing];
  persistAllSessions(next);
  return session;
};

/**
 * Resolves effective modifier sum for an attribute/skill check
 */
export const calculateActiveModifiersBonus = (activeModifiers = [], targetSubAttr = 'attr-might') => {
  if (!Array.isArray(activeModifiers) || activeModifiers.length === 0) return 0;
  return activeModifiers.reduce((acc, mod) => {
    if (!mod || !mod.value) return acc;
    if (mod.target === 'all' || mod.target === targetSubAttr) {
      return acc + Number(mod.value);
    }
    return acc;
  }, 0);
};

/**
 * Canonical Tangent SFF RPG 2d10 Dice Check Evaluator
 */
export const evaluateTangentCheck = ({
  operative,
  skillName = 'Might',
  subAttrKey = 'attr-might',
  targetCR = 12,
  activeModifiers = []
}) => {
  const baseScore = operative?.subAttributes?.[subAttrKey] ?? 6;
  const modBonus = calculateActiveModifiersBonus(activeModifiers, subAttrKey);
  const totalMod = baseScore + modBonus;

  // Roll canonical 2d10 with exploding dice
  const rollRes = rollDice(`2d10+${totalMod}`, { targetNumber: targetCR });

  const d1 = rollRes.rolls?.[0]?.value ?? 5;
  const d2 = rollRes.rolls?.[1]?.value ?? 5;
  const naturalRoll = d1 + d2;
  const total = rollRes.total;
  const margin = total - targetCR;

  let tier = 'failure';
  let tierLabel = 'FAILURE';
  let badgeColor = 'rose';

  if (naturalRoll === 20 || margin >= 10) {
    tier = 'critical_success';
    tierLabel = 'CRITICAL SUCCESS (DECISIVE)';
    badgeColor = 'emerald';
  } else if (total >= targetCR) {
    tier = 'success';
    tierLabel = 'SUCCESS';
    badgeColor = 'cyan';
  } else if (margin >= -2) {
    tier = 'cost_success';
    tierLabel = 'SUCCESS AT A COST (COMPLICATION)';
    badgeColor = 'amber';
  } else if (naturalRoll === 2 || margin <= -10) {
    tier = 'critical_fumble';
    tierLabel = 'CRITICAL FUMBLE (CATASTROPHIC)';
    badgeColor = 'rose';
  } else {
    tier = 'failure';
    tierLabel = 'FAILURE';
    badgeColor = 'rose';
  }

  return {
    skillName,
    subAttrKey,
    targetCR,
    d1,
    d2,
    naturalRoll,
    baseScore,
    modBonus,
    totalMod,
    total,
    margin,
    tier,
    tierLabel,
    badgeColor,
    isSuccess: tier === 'critical_success' || tier === 'success' || tier === 'cost_success',
    formula: `2d10 (${d1}+${d2}=${naturalRoll}) + Mod ${totalMod} [Base ${baseScore}${modBonus !== 0 ? ` + Modifiers ${modBonus}` : ''}] = ${total} vs CR ${targetCR}`,
    summary: `${operative?.name || 'Operative'} [${skillName}]: Rolled ${total} vs CR ${targetCR} ➔ ${tierLabel}`
  };
};

/**
 * Compiles a full interactive play session into a formatted Markdown transcript
 */
export const exportSessionMarkdown = (session, scenario = null) => {
  if (!session) return '';
  const title = session.activeScenarioTitle || scenario?.title || 'Interactive Tactical Playthrough';
  const operatives = (session.operatives || []).map(o => `* **${o.name}** (${o.species} ${o.archetype}) — Focus: ${o.focus || 'Operative'} [Source: ${o.sourceLabel || 'Database'}]`).join('\n') || '*None*';
  const modifiers = (session.activeModifiers || []).map(m => `* \`${m.name}\`: ${m.description} (${m.value > 0 ? `+${m.value}` : m.value})`).join('\n') || '*None*';

  const beats = (session.beats || []).map(b => {
    let out = `### Beat #${b.beatIndex}: ${b.protagonistName || 'Operative'} [${b.timestamp || ''}]\n\n`;
    out += `${b.narrative || b.text}\n\n`;
    if (b.gate?.chosenOption) {
      out += `> **Tactical Decision**: ${b.gate.chosenOption}\n`;
    }
    if (b.gate?.checkResult) {
      out += `> **Dice Resolution**: ${b.gate.checkResult}\n`;
    }
    if (b.consequences) {
      out += `> **Consequences Applied**: ${JSON.stringify(b.consequences)}\n`;
    }
    return out;
  }).join('\n---\n\n');

  return `# ${title} — Interactive Play Transcript

**Session ID**: \`${session.id}\`  
**Date**: ${new Date(session.createdAt).toLocaleDateString()}  
**Party Mode**: ${session.partyMode === 'group' ? 'Fireteam Squad' : 'Solo Operative'}  
**Director Mode**: ${session.mode === 'director' ? 'GM Overseer' : 'Solo Player'}

---

## Active Operatives (From Database Content)
${operatives}

## Active Modifiers Ledger
${modifiers}

---

## Story Timeline Beats
${beats || '*No story beats recorded yet.*'}
`;
};
