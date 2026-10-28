/**
 * Tangent SF RP — Unified Modifier Representation Engine
 * 
 * Ensures all selected traits, features, and hindrances have their modifiers
 * rigorously extracted, computed, and represented across rules, notes, and mechanics.
 */

import { DEFAULT_FEATURES } from '../data/featuresData.js';
import { 
  ALL_CANONICAL_TRAITS,
  SPECIES_TRAITS_BASIC,
  SPECIES_TRAITS_ADVANCED,
  SPECIES_TRAITS_ELITE
} from '../data/speciesTraitsData.js';
import { DEFAULT_SPECIES_DISADVANTAGES } from '../data/speciesDisadvantagesData.js';
import { DEFAULT_AUGMENTATIONS } from '../data/augmentationsData.js';
import { ALL_CANONICAL_SKILLS } from '../data/skillsData.js';
import { DEFAULT_SPECIES } from '../data/speciesData.js';
import { DEFAULT_ARCHETYPES } from '../data/archetypesData.js';

// Mapping of common check / save names to canonical keys
export const SAVE_TARGETS = {
  'fortitude': 'Fortitude',
  'reflex': 'Reflex',
  'will': 'Will',
  'willpower': 'Will',
  'concentration': 'Concentration',
  'reaction': 'Reaction'
};

export const ATTRIBUTE_MAP = {
  'strength': 'attr-strength',
  'might': 'attr-might',
  'agility': 'attr-agility',
  'reflex': 'attr-reflex',
  'stamina': 'attr-stamina',
  'constitution': 'attr-stamina',
  'fortitude': 'attr-fortitude',
  'intellect': 'attr-intellect',
  'reason': 'attr-logic',
  'logic': 'attr-logic',
  'wisdom': 'attr-wisdom',
  'will': 'attr-will',
  'willpower': 'attr-will',
  'charisma': 'attr-charisma',
  'etiquette': 'attr-etiquette'
};

/**
 * Parses structured modifiers from narrative text, mechanics, and rules descriptions.
 */
export function parseModifiersFromText(name = '', text = '', body = '') {
  // Normalize markdown escapes and punctuation for robust matching
  const rawCombined = `${name} ${text} ${body}`.replace(/\r\n/g, '\n');
  const combined = rawCombined
    .split('\\+').join('+')
    .split('\\-').join('-')
    .replace(/[*_`]/g, '')
    .replace(/[()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ');

  const modifiers = [];
  const seenKeys = new Set();

  const addMod = (mod) => {
    const key = `${mod.type}_${mod.target}_${mod.value}_${mod.condition || ''}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      modifiers.push(mod);
    }
  };

  // 1. All Saving Throws (e.g., "+1 racial bonus on all saving throws", "+2 bonus to all saves")
  const allSavesRegex = /([+-]?\d+)\s*(?:racial|dodge|competence|trained|inherent)?\s*(?:bonus|penalty)?\s*(?:on|to)\s*all\s*(?:saving\s*throws?|saves?)/gi;
  let match;
  while ((match = allSavesRegex.exec(combined)) !== null) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val)) {
      ['Fortitude', 'Reflex', 'Will'].forEach(target => {
        addMod({
          target,
          type: 'save',
          value: val,
          mode: 'inherent',
          description: `${val >= 0 ? '+' : ''}${val} on all saving throws`
        });
      });
    }
  }

  // 2. Specific Saving Throw Bonuses & Penalties (e.g., "+2 bonus on all Fortitude Checks", "+2 Willpower", "+2 Logic Checks", "+2 Might Checks")
  const saveRegex = /([+-]?\d+)\s*(?:racial|dodge|competence|trained|inherent)?\s*(?:bonus|penalty)?\s*(?:on|to)?\s*(?:all\s*)?(Fortitude|Reflex|Will|Willpower|Concentration|Reaction|Might|Logic|Reason)\s*(?:Checks?|Saves?)?/gi;
  while ((match = saveRegex.exec(combined)) !== null) {
    const val = parseInt(match[1], 10);
    const rawTarget = match[2].toLowerCase();
    const target = SAVE_TARGETS[rawTarget] || (match[2].charAt(0).toUpperCase() + match[2].slice(1));
    if (!isNaN(val)) {
      addMod({
        target,
        type: 'save',
        value: val,
        mode: 'inherent',
        description: `${val >= 0 ? '+' : ''}${val} on ${target} Checks`
      });
    }
  }

  // 3. Advantage / Disadvantage on Checks / Saves
  const advOnRegex = /(?:roll|gain|make)?\s*Advantage\s+on\s+(?:all\s*)?(?:a\s*)?(?:single\s*)?([A-Za-z\s/,&-]+?)\s*(?:checks?|saves?|actions?|rolls?|\.|$)/gi;
  let advMatch;
  while ((advMatch = advOnRegex.exec(combined)) !== null) {
    const rawTarget = advMatch[1].trim();
    if (rawTarget && rawTarget.length >= 3 && rawTarget.length <= 50 && !['all', 'each', 'any', 'one'].includes(rawTarget.toLowerCase())) {
      let target = rawTarget;
      let isSave = ['fortitude', 'reflex', 'will', 'willpower', 'domination', 'mind-control'].some(s => rawTarget.toLowerCase().includes(s));
      if (/domination|mind-control/i.test(rawTarget)) {
        target = 'Will';
        isSave = true;
      } else {
        target = SAVE_TARGETS[rawTarget.toLowerCase()] || (rawTarget.charAt(0).toUpperCase() + rawTarget.slice(1));
      }
      if (target === 'Perception') target = 'Alertness';
      if (target === 'Sense Motive') target = 'Insight';
      if (target === 'Linguistics') target = 'Language';
      if (target === 'Swim' || target === 'Swimming') target = 'Athletics';
      addMod({
        target,
        type: isSave ? 'save_advantage' : 'check_advantage',
        value: 1,
        mode: 'inherent',
        description: `Advantage on ${target} Checks`
      });
    }
  }

  const targetAdvRegex = /(?:all\s+)?(?:checks\s+involving\s+)?([A-Za-z/&-]+(?:\s+[A-Za-z/&-]+){0,3})\s+(?:checks?|saves?|resistance\s+checks?)\s*(?:are\s+|may\s+be\s+)?(?:made\s+)?(?:with|at)\s+Advantage/gi;
  while ((advMatch = targetAdvRegex.exec(combined)) !== null) {
    const rawTarget = advMatch[1].replace(/^(?:you\s+|may\s+|roll\s+|make\s+|take\s+|your\s+|their\s+|a\s+|all\s+)+/i, '').trim();
    if (rawTarget && rawTarget.length >= 3 && rawTarget.length <= 50 && !['all', 'each', 'any', 'one', 'a'].includes(rawTarget.toLowerCase())) {
      let target = rawTarget;
      let isSave = ['fortitude', 'reflex', 'will', 'willpower', 'domination', 'mind-control'].some(s => rawTarget.toLowerCase().includes(s));
      if (/domination|mind-control/i.test(rawTarget)) {
        target = 'Will';
        isSave = true;
      } else {
        target = SAVE_TARGETS[rawTarget.toLowerCase()] || (rawTarget.charAt(0).toUpperCase() + rawTarget.slice(1));
      }
      if (target === 'Perception') target = 'Alertness';
      if (target === 'Sense Motive') target = 'Insight';
      if (target === 'Linguistics') target = 'Language';
      if (target === 'Swim' || target === 'Swimming') target = 'Athletics';
      addMod({
        target,
        type: isSave ? 'save_advantage' : 'check_advantage',
        value: 1,
        mode: 'inherent',
        description: `Advantage on ${target} Checks`
      });
    }
  }

  const shieldDefRegex = /Shield\s+bonus\s+to\s+Defense\s+(?:increases\s+to\s+|is\s+)?\+?(\d+)/gi;
  while ((match = shieldDefRegex.exec(combined)) !== null) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > 0) {
      addMod({
        target: 'defense-mod',
        type: 'combat',
        value: val,
        mode: 'inherent',
        description: `+${val} Shield bonus to Defense`
      });
    }
  }

  if (/(?:once\s+per\s+day\s+)?(?:make\s+)?(?:one|a)\s+skill\s+check\s+(?:of\s+choice\s+)?(?:at|with)\s+advantage/i.test(combined)) {
    addMod({
      target: 'Skill Choice',
      type: 'check_advantage',
      value: 1,
      mode: 'situational',
      condition: '1/Day',
      description: 'One Skill Check of choice at Advantage per day'
    });
  }

  if (/rolls?\s*all\s*checks\s*with\s*Disadvantage/i.test(combined)) {
    addMod({
      target: 'All Checks',
      type: 'disadvantage',
      value: -1,
      mode: 'penalty',
      description: 'Disadvantage on all checks'
    });
  }

  // 4. Take 10 on Checks (e.g., "May take 10 on Stealth Checks", "may take 10 on swimming checks")
  const take10Regex = /(?:may\s+)?take\s+10\s+on\s+([A-Za-z\s/,&-]+?)\s*checks?/gi;
  while ((match = take10Regex.exec(combined)) !== null) {
    const rawSkill = match[1].trim();
    if (rawSkill.length >= 3 && rawSkill.length <= 40) {
      let cap = rawSkill.charAt(0).toUpperCase() + rawSkill.slice(1);
      if (cap.toLowerCase() === 'swimming' || cap.toLowerCase() === 'swim') cap = 'Athletics';
      addMod({
        target: cap,
        type: 'take_10',
        value: 10,
        mode: 'inherent',
        description: `May take 10 on ${cap} Checks`
      });
    }
  }

  // 5. Tactical & Combat Stats (Initiative, Defense, Evasion, DR, Armor, Movement, Stability)
  const combatRegex = /([+-]?\d+)\s*(?:racial|dodge|natural|armor|equipment|shield|circumstance)?\s*(?:bonus|penalty)?\s*(?:to|on)?\s*(Initiative|Defense|Evasion|DR|Armor|Movement|Walk|Speed|Stability|Swim Speed|Equipment)/gi;
  while ((match = combatRegex.exec(combined)) !== null) {
    const val = parseInt(match[1], 10);
    const stat = match[2].toLowerCase();
    const statMap = {
      'initiative': 'initiative-mod',
      'defense': 'defense-mod',
      'evasion': 'evasion-mod',
      'armor': 'armor-dr',
      'dr': 'armor-dr',
      'movement': 'move-walk',
      'walk': 'move-walk',
      'speed': 'move-walk',
      'swim speed': 'move-swim',
      'stability': 'Stability',
      'equipment': 'equipment-bonus'
    };
    const targetKey = statMap[stat] || stat;
    addMod({
      target: targetKey,
      type: 'combat',
      value: val,
      mode: 'inherent',
      description: `${val >= 0 ? '+' : ''}${val} ${match[2]}`
    });
  }

  // 6. Direct Damage Reduction (e.g. "DR 10", "DR +5", "base DR 10", "natural Damage Reduction (DR +5)")
  const drRegex = /(?:natural\s+)?(?:damage\s+reduction|DR)\s*(?:of\s*|\+\s*|:\s*)?([+-]?\d+)/gi;
  while ((match = drRegex.exec(combined)) !== null) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val !== 0) {
      addMod({
        target: 'armor-dr',
        type: 'combat',
        value: val,
        mode: 'inherent',
        description: `${val >= 0 ? '+' : ''}${val} DR`
      });
    }
  }

  // 7. Specific Skill Bonuses / Penalties (e.g., "+5 to Disguise", "+2 Alertness", "+2 Diplomacy", "+1 bonus to intimidation and breach", "-2 Penalty to Insight")
  const skillRegex = /([+-]\d+)\s*(?:racial|competence|trained|inherent|dodge|equipment|appearance)?\s*(?:bonus|penalty)?\s*(?:to|on)?\s*(?:checks\s+involving\s*)?([A-Za-z\s/,&-]+?)(?:\s*(?:checks?|actions?|skills?|saves?|saving throws?|rolls?|\.|$))/gi;
  while ((match = skillRegex.exec(combined)) !== null) {
    const val = parseInt(match[1], 10);
    const rawTarget = match[2].trim();
    const lower = rawTarget.toLowerCase();
    
    // Skip targets that belong to saves, karma, wealth, tech level, combat, or generic words
    const skipList = [
      'will', 'fortitude', 'reflex', 'might', 'logic', 'reason', 'wealth', 'tech level', 
      'karma', 'all', 'each', 'all fortitude', 'all reflex', 'all will', 'all saving',
      'stability', 'defense', 'initiative', 'armor', 'evasion', 'points', 'point', 
      'damage', 'die', 'dice', 'action', 'actions', 'round', 'rounds', 'meter', 'meters'
    ];
    if (
      !skipList.includes(lower) &&
      rawTarget.length >= 3 &&
      rawTarget.length <= 80
    ) {
      // Split compound targets like "intimidation and breach" or "Insight and Social"
      const subTargets = rawTarget.split(/\s+and\s+|\s+or\s+|\s*,\s*|\s*\/\s*/i).map(s => s.replace(/^(?:all|or|and)\s+/i, '').trim()).filter(Boolean);
      subTargets.forEach(st => {
        const stLower = st.toLowerCase();
        if (!skipList.includes(stLower) && st.length >= 3) {
          let capitalized = st.charAt(0).toUpperCase() + st.slice(1);
          // Canonical aliases
          if (capitalized === 'Perception') capitalized = 'Alertness';
          if (capitalized === 'Sense Motive') capitalized = 'Insight';
          if (capitalized === 'Linguistics') capitalized = 'Language';
          if (capitalized === 'Swim' || capitalized === 'Swimming') capitalized = 'Athletics';
          addMod({
            target: capitalized,
            type: 'skill',
            value: val,
            mode: val >= 0 ? 'inherent' : 'penalty',
            description: `${val >= 0 ? '+' : ''}${val} to ${capitalized}`
          });
        }
      });
    }
  }

  // 8. Parenthetical Skill Bonuses (e.g., "(+5 Disguise)", "(+10 Disguise)", "(+2 Alertness)")
  const parenSkillRegex = /\(\s*([+-]\d+)\s+(?:to\s+)?([A-Za-z\s/,&-]+?)\s*\)/gi;
  while ((match = parenSkillRegex.exec(rawCombined)) !== null) {
    const val = parseInt(match[1], 10);
    const rawTarget = match[2].trim();
    const lower = rawTarget.toLowerCase();
    if (!['will', 'fortitude', 'reflex', 'wealth', 'tech level', 'karma', 'bp', 'cp', 'minute', 'minutes', 'hour', 'hours'].includes(lower) && rawTarget.length >= 3 && rawTarget.length <= 40) {
      let capitalized = rawTarget.charAt(0).toUpperCase() + rawTarget.slice(1);
      if (capitalized === 'Perception') capitalized = 'Alertness';
      if (capitalized === 'Sense Motive') capitalized = 'Insight';
      if (capitalized === 'Linguistics') capitalized = 'Language';
      addMod({
        target: capitalized,
        type: 'skill',
        value: val,
        mode: val >= 0 ? 'inherent' : 'penalty',
        description: `${val >= 0 ? '+' : ''}${val} to ${capitalized}`
      });
    }
  }

  // 9. Karma adjustments (e.g., "-2 to Karma Pool", "+1 Karma", "Karma Pool by +2 Points")
  const karmaRegex = /(?:([+-]?\d+)\s*(?:to\s*)?Karma\s*(?:Pool|\s*Points)?|Karma\s*(?:Pool)?\s*(?:by\s*)?([+-]?\d+))/gi;
  while ((match = karmaRegex.exec(combined)) !== null) {
    const val = parseInt(match[1] || match[2], 10);
    if (!isNaN(val)) {
      addMod({
        target: 'Karma',
        type: 'karma',
        value: val,
        mode: val >= 0 ? 'inherent' : 'penalty',
        description: `${val >= 0 ? '+' : ''}${val} to Karma Pool`
      });
    }
  }

  // 10. Tech Level Modifiers (e.g. "-1 Tech Level")
  const tlMatch = combined.match(/([+-]?\d+)\s*Tech\s*Level/i);
  if (tlMatch) {
    const val = parseInt(tlMatch[1], 10);
    if (!isNaN(val)) {
      addMod({
        target: 'Tech Level',
        type: 'tech_level',
        value: val,
        mode: val >= 0 ? 'inherent' : 'penalty',
        description: `${val >= 0 ? '+' : ''}${val} Tech Level`
      });
    }
  }

  // 11. Wealth Modifiers (e.g. "-4 to Wealth Score", "+2 Wealth", "+2 Bonus to Wealth", "Wealth Score by +3")
  const wealthRegex = /(?:([+-]?\d+)\s*(?:racial|competence|inherent|permanent)?\s*(?:bonus\s+to\s+|to\s+)?Wealth(?:\s*Score|\s*checks)?|Wealth(?:\s*Score)?\s*(?:by\s*)?([+-]?\d+))/gi;
  while ((match = wealthRegex.exec(combined)) !== null) {
    const val = parseInt(match[1] || match[2], 10);
    if (!isNaN(val)) {
      addMod({
        target: 'Wealth',
        type: 'wealth',
        value: val,
        mode: val >= 0 ? 'inherent' : 'penalty',
        description: `${val >= 0 ? '+' : ''}${val} Wealth Score`
      });
    }
  }

  // 12. Conditions
  if (/\bSickened\b/i.test(combined) && !/(?:immune to|resists?)\s+sickened/i.test(combined)) {
    addMod({
      target: 'Condition: Sickened',
      type: 'condition',
      value: -2,
      mode: 'penalty',
      description: 'Inflicts Sickened condition (-2 to all checks)'
    });
  }

  if (/\bFatigued\b/i.test(combined) && !/(?:when fatigued|speed is not reduced|immune to|resists?)/i.test(combined)) {
    addMod({
      target: 'Condition: Fatigued',
      type: 'condition',
      value: -2,
      mode: 'penalty',
      description: 'Inflicts Fatigued condition (-2 to all actions)'
    });
  }

  return modifiers;
}

/**
 * Formats a clean list of notes summarizing all active modifiers, rules, and conditions.
 */
export function formatModifierNotes(modifiers = [], rules = '', item = {}) {
  const notes = [];

  // 1. Modifiers summary
  if (Array.isArray(modifiers) && modifiers.length > 0) {
    modifiers.forEach(m => {
      if (typeof m === 'object' && m !== null) {
        if (m.description) {
          notes.push(`[${m.type === 'penalty' || (m.value !== undefined && m.value < 0) ? 'Penalty' : 'Modifier'}] ${m.description}`);
        } else if (m.target) {
          const sign = typeof m.value === 'number' && m.value >= 0 ? '+' : '';
          notes.push(`[Modifier] ${m.target}: ${sign}${m.value ?? ''}`);
        }
      } else if (typeof m === 'string') {
        notes.push(`[Modifier] ${m}`);
      }
    });
  }

  // 2. Rules summary tags
  if (item.is_ranked) {
    notes.push('[Rule] Ranked: Bonus stacks with additional purchases');
  }
  if (item.is_multiple) {
    notes.push('[Rule] Multiple: May be purchased separately for different categories/types');
  }
  const isGroupPool = item.modifier_options?.mode === 'group_pool' || (Array.isArray(item.modifiers) && item.modifiers.some(m => m.mode === 'group_choice'));
  if (isGroupPool) {
    const selected = Array.isArray(item.selected_skills) ? item.selected_skills : (item.selected_skill ? [item.selected_skill] : []);
    const groupChoiceMod = Array.isArray(item.modifiers) ? item.modifiers.find(m => m.mode === 'group_choice') : null;
    const max = item.modifier_options?.max_skills || groupChoiceMod?.max_choices || 2;
    const val = item.modifier_options?.value || groupChoiceMod?.value || 2;
    if (selected.length > 0) {
      notes.push(`[Skill Group Choice] Active: ${selected.join(', ')} (+${val})`);
    } else {
      notes.push(`[Skill Group Choice] Pick up to ${max} skills (+${val})`);
    }
  } else if (item.modifier_options?.enabled && Array.isArray(item.modifier_options.options)) {
    const active = item.modifier_options.options.find(o => o.id === item.selected_option_id);
    if (active) {
      notes.push(`[Skill Choice] Active: ${active.label || active.id}`);
    } else {
      notes.push(`[Skill Choice] ${item.modifier_options.options.length} options available (${item.modifier_options.mode === 'pair' ? 'Pairs' : 'Single Skill'})`);
    }
  }
  if (rules && typeof rules === 'string' && rules.trim()) {
    const cleanRule = rules.replace(/^#+\s*Special Rules\s*/i, '').trim();
    if (cleanRule && !notes.some(n => n.includes(cleanRule.slice(0, 20)))) {
      notes.push(`[Rule] ${cleanRule.slice(0, 100)}${cleanRule.length > 100 ? '...' : ''}`);
    }
  }

  // 3. Prerequisite note
  const prereq = item.prerequisites || item.prerequisite;
  if (prereq && typeof prereq === 'string' && prereq !== 'None' && prereq.trim()) {
    notes.push(`[Prerequisite] ${prereq}`);
  }

  return notes;
}

/**
 * Resolves a canonical item from default databases (Features, Traits, Disadvantages, Augmentations).
 */
export function resolveCanonicalCatalogItem(raw) {
  if (!raw) return null;
  const idOrName = typeof raw === 'object' ? (raw.name || raw.title || raw.id || '') : String(raw);
  if (!idOrName || !idOrName.trim()) return null;
  const clean = idOrName.trim().toLowerCase();
  const normalized = clean.replace(/^(trait|feature|disadvantage|aug)-/i, '').replace(/[-_]/g, ' ').trim();

  // Search Features
  const feat = DEFAULT_FEATURES.find(f => {
    const fId = (f.id || '').toLowerCase();
    const fName = (f.name || '').toLowerCase();
    return fId === clean || fName === clean || fName.replace(/[-_]/g, ' ') === normalized;
  });
  if (feat) return feat;

  // Search Traits
  const trait = ALL_CANONICAL_TRAITS.find(t => {
    const tId = (t.id || '').toLowerCase();
    const tName = (t.name || t.title || '').toLowerCase();
    return tId === clean || tName === clean || tName.replace(/[-_]/g, ' ') === normalized;
  }) || [...SPECIES_TRAITS_ADVANCED, ...SPECIES_TRAITS_BASIC, ...SPECIES_TRAITS_ELITE].find(t => {
    const tId = (t.id || '').toLowerCase();
    const tName = (t.name || t.title || '').toLowerCase();
    return tId === clean || tName === clean || tName.replace(/[-_]/g, ' ') === normalized;
  });
  if (trait) return trait;

  // Search Disadvantages
  const dis = DEFAULT_SPECIES_DISADVANTAGES.find(d => {
    const dId = (d.id || '').toLowerCase();
    const dName = (d.name || '').toLowerCase();
    return dId === clean || dName === clean || dName.replace(/[-_]/g, ' ') === normalized;
  });
  if (dis) return dis;

  // Search Augmentations
  const aug = DEFAULT_AUGMENTATIONS.find(a => {
    const aId = (a.id || '').toLowerCase();
    const aName = (a.name || '').toLowerCase();
    return aId === clean || aName === clean || aName.replace(/[-_]/g, ' ') === normalized;
  });
  if (aug) return aug;

  return null;
}

export const ALL_SKILL_GROUP_KEYS = [
  'physical',
  'mental_general',
  'mental_knowledges',
  'mental_vocations',
  'social_expression',
  'social_manipulation',
  'combat_archaic',
  'combat_modern',
  'combat_advanced',
  'meta_general',
  'meta_dimension',
  'meta_energy',
  'meta_entropy',
  'meta_illusion',
  'meta_matter',
  'meta_mental'
];

export const COMBAT_SKILL_GROUP_KEYS = [
  'combat_archaic',
  'combat_modern',
  'combat_advanced'
];

export const DISCIPLINE_SKILL_GROUP_KEYS = [
  'meta_dimension',
  'meta_energy',
  'meta_entropy',
  'meta_illusion',
  'meta_matter',
  'meta_mental'
];

export const NON_COMBAT_SKILL_GROUP_KEYS = [
  'physical',
  'mental_general',
  'mental_knowledges',
  'mental_vocations',
  'social_expression',
  'social_manipulation'
];

export const MENTAL_SKILL_GROUP_KEYS = [
  'mental_general',
  'mental_knowledges',
  'mental_vocations'
];

export const SOCIAL_SKILL_GROUP_KEYS = [
  'social_expression',
  'social_manipulation'
];

export const CANONICAL_MODIFIER_OPTIONS_MAP = {
  // === FEATURES ===
  'combat-combat-skill-focus': { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 1, value: 2 },
  'combat skill focus': { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 1, value: 2 },
  'discipline-aptitude': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Discipline Skills', max_skills: 2, value: 2 },
  'aptitude': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Discipline Skills', max_skills: 2, value: 2 },
  'discipline-discipline-focus': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Discipline Skills', max_skills: 1, value: 2 },
  'discipline focus': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Discipline Skills', max_skills: 1, value: 2 },
  'discipline-discipline-expertise': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Discipline Skills', max_skills: 1, value: 4 },
  'discipline expertise': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Discipline Skills', max_skills: 1, value: 4 },
  'discipline-discipline-mastery': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Discipline Skills', max_skills: 1, value: 6 },
  'discipline mastery': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Discipline Skills', max_skills: 1, value: 6 },
  'discipline-awakened': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Discipline Skills', max_skills: 2, value: 2 },
  'awakened': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Discipline Skills', max_skills: 2, value: 2 },
  'skill-artistic': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations', 'social_expression'], group_label: 'Performance & Vocation Skills', max_skills: 2, value: 2 },
  'artistic': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations', 'social_expression'], group_label: 'Performance & Vocation Skills', max_skills: 2, value: 2 },
  'skill-skill-focus': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'skill focus': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'skill-skill-specialization': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'skill specialization': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'skill-skill-mastery': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'Focused Skills', max_skills: 1, value: 2 },
  'skill mastery': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'Focused Skills', max_skills: 1, value: 2 },
  'skill-entertaining': { enabled: true, mode: 'group_pool', group_keys: ['social_expression'], group_label: 'Expression & Performance Skills', max_skills: 1, value: 1 },
  'entertaining': { enabled: true, mode: 'group_pool', group_keys: ['social_expression'], group_label: 'Expression & Performance Skills', max_skills: 1, value: 1 },
  'skill-master-craftsman': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Crafting & Vocation Skills', max_skills: 1, value: 2 },
  'master craftsman': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Crafting & Vocation Skills', max_skills: 1, value: 2 },
  'skill-versatile-curator': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges'], group_label: 'Knowledge Skills', max_skills: 1, value: 1 },
  'versatile curator': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges'], group_label: 'Knowledge Skills', max_skills: 1, value: 1 },
  'skill-versatile-performer': { enabled: true, mode: 'group_pool', group_keys: ['social_expression'], group_label: 'Expression & Performance Skills', max_skills: 1, value: 1 },
  'versatile performer': { enabled: true, mode: 'group_pool', group_keys: ['social_expression'], group_label: 'Expression & Performance Skills', max_skills: 1, value: 1 },
  'skill-versatile-professional': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 1 },
  'versatile professional': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 1 },
  'karma-beginner-s-luck': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 5 },
  "beginner's luck": { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 5 },
  'combat-weapon-expertise': {
    enabled: true,
    mode: 'single',
    options: [
      'Archaic Weapons (Blades, Bows, Polearms, Thrown)',
      'Modern Firearms (Pistols, Submachine Guns, Rifles, Shotguns)',
      'Advanced Energy Weapons (Blasters, Lasers, Plasma, Particle)',
      'Heavy & Ordnance Weapons (HMGs, Rocket Launchers, Cannons, Mortars)',
      'Exotic & Specialized Weaponry (Aetheric, Gravitic, Monofilament, Disruption)',
      'Brawling & Natural Weaponry (Unarmed, Claws, Strikers, Gauntlets)'
    ]
  },
  'special-companion': {
    enabled: true,
    mode: 'single',
    options: [
      'Tactical Drone (Synthetic Recon/Assault Platform)',
      'Bio-Construct / Cyber-Beast (Engineered Organic Companion)',
      'Executive Cohort (Loyal Lieutenant / Specialist Officer)',
      'Metaphysical Guide (Aetheric / Entropic Manifestation)',
      'Field Automaton (Heavy Security / Logistics Android)'
    ]
  },
  'special-cohort': {
    enabled: true,
    mode: 'single',
    options: [
      'Executive Lieutenant (Strategic Advisor & Operations Command)',
      'Combat Specialist (Close-Protection Bodyguard & Assault)',
      'Tech Infiltrator (Cyber-Warfare & Electronic Countermeasures)',
      'Field Medic / Biomancer (Emergency Life Support & Triage)',
      'Metaphysical Conduit (Arcane / Entropic Weaver)'
    ]
  },
  'special-life-support': {
    enabled: true,
    mode: 'single',
    options: [
      'Aquatic (Breathe underwater, resist hydrostatic pressure up to 50 atm)',
      'Atmospheric (Breathe methane, ammonia, CO2, and toxic atmospheric mixes)',
      'Vacuum Sustenance (Sustain life in hard vacuum for up to 10 minutes)',
      'Low-Oxygen / Hypobaric (Function unimpeded in razor-thin alpine atmospheres)',
      'Bio-Filter / Contagion Seal (Lungs/spiracles filter all airborne pathogens and spores)'
    ]
  },
  'special-environmental-resistance': {
    enabled: true,
    mode: 'single',
    options: [
      'Radiation & Cosmic Rays (Ionizing radiation, solar flares, reactor leaks)',
      'Extreme Cold & Sub-Zero (Glacial worlds, cryo-atmospheres, void chill)',
      'Extreme Heat & Geothermal (Desert wastes, volcanic vents, plasma wash)',
      'Toxic & Corrosive Atmosphere (Methane, chlorine, acidic rain, spores)',
      'High Pressure & Deep Barometric (Gas giants, oceanic abyss, hyper-gravity)',
      'Vacuum & Decompression (Orbital void, explosive hull breaches, hypoxia)'
    ]
  },
  'special-resistance': {
    enabled: true,
    mode: 'single',
    options: [
      'Disease (Biological pathogens, plagues, cellular rot)',
      'Poison (Venoms, neurotoxins, synthetic chemical agents)',
      'Radiation (Ionizing fallout, stellar radiation, nuclear wash)',
      'Magic / Metaphysical Hazards (Aetheric backlash, psychic fallout, cursed zones)'
    ]
  },
  'special-technologist': {
    enabled: true,
    mode: 'single',
    group_label: 'Field of Study',
    options: [
      { id: 'tl-agri', label: 'Agriculture' },
      { id: 'tl-arch', label: 'Architecture' },
      { id: 'tl-biotech', label: 'Biotechnology' },
      { id: 'tl-commerce', label: 'Commerce' },
      { id: 'tl-comm', label: 'Communication' },
      { id: 'tl-devices', label: 'Devices' },
      { id: 'tl-edu', label: 'Education' },
      { id: 'tl-energy', label: 'Energy' },
      { id: 'tl-mfg', label: 'Manufacturing' },
      { id: 'tl-materials', label: 'Materials' },
      { id: 'tl-med', label: 'Medicine' },
      { id: 'tl-metasci', label: 'Meta Sciences' },
      { id: 'tl-sci', label: 'Science' },
      { id: 'tl-society', label: 'Society' },
      { id: 'tl-ai', label: 'Synthetic Intelligence' },
      { id: 'tl-trans', label: 'Transportation' },
      { id: 'tl-weapons', label: 'Weaponry' }
    ]
  },

  // === TRAITS ===
  'trait-adaptability': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'trait-sig-adaptability': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'adaptability': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'trait-flexibility': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'flexibility': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'trait-specialized-skills': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'specialized skills': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'trait-expertise': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'expertise': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'trait-focused-study': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'focused study': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'trait-skill-bonus': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'skill bonus': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: 2 },
  'trait-shards-of-the-past': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 2, value: 2 },
  'shards of the past': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 2, value: 2 },
  'trait-adaptive-skill-set': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 2, value: 2 },
  'adaptive skill set': { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 2, value: 2 },
  'trait-combat-training': { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 1, value: 2 },
  'combat training': { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 1, value: 2 },
  'trait-combat-skills': { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 1, value: 2 },
  'combat skills': { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 1, value: 2 },
  'trait-combat-trained': { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 1, value: 2 },
  'combat trained': { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 1, value: 2 },
  'trait-wasteland-warrior': { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 2, value: 2 },
  'wasteland warrior': { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 2, value: 2 },
  'trait-craftsman': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'craftsman': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'trait-non-combat-focus': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'non-combat focus': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'trait-technical-knowledge': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'technical knowledge': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'trait-specialized-knowledge': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'specialized knowledge': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'trait-master-vocation-skillsman': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'master vocation skillsman': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'trait-skilled-worker': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'skilled worker': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'trait-macro-engineering': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'macro-engineering': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'trait-biotechnologist': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'biotechnologist': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'trait-industrial-connections': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'industrial connections': { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: 2 },
  'trait-studious': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges'], group_label: 'Knowledge Skills', max_skills: 1, value: 2 },
  'studious': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges'], group_label: 'Knowledge Skills', max_skills: 1, value: 2 },
  'trait-logical-deduction': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges'], group_label: 'Knowledge Skills', max_skills: 1, value: 2 },
  'logical deduction': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges'], group_label: 'Knowledge Skills', max_skills: 1, value: 2 },
  'trait-ecological-expertise': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges'], group_label: 'Knowledge Skills', max_skills: 2, value: 2 },
  'ecological expertise': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges'], group_label: 'Knowledge Skills', max_skills: 2, value: 2 },
  'trait-product-knowledge': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges', 'mental_vocations'], group_label: 'Knowledge & Vocation Skills', max_skills: 1, value: 2 },
  'product knowledge': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges', 'mental_vocations'], group_label: 'Knowledge & Vocation Skills', max_skills: 1, value: 2 },
  'trait-entertainment-skill': { enabled: true, mode: 'group_pool', group_keys: NON_COMBAT_SKILL_GROUP_KEYS, group_label: 'Non-Combat Skills', max_skills: 1, value: 2 },
  'entertainment skill': { enabled: true, mode: 'group_pool', group_keys: NON_COMBAT_SKILL_GROUP_KEYS, group_label: 'Non-Combat Skills', max_skills: 1, value: 2 },
  'trait-star-power': { enabled: true, mode: 'group_pool', group_keys: SOCIAL_SKILL_GROUP_KEYS, group_label: 'Social Skills', max_skills: 1, value: 2 },
  'star power': { enabled: true, mode: 'group_pool', group_keys: SOCIAL_SKILL_GROUP_KEYS, group_label: 'Social Skills', max_skills: 1, value: 2 },
  'trait-mastery-of-a-discipline': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Metafocus Discipline Skills', max_skills: 1, value: 2 },
  'mastery of a discipline': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Metafocus Discipline Skills', max_skills: 1, value: 2 },
  'trait-arcane-mastery': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Metafocus Discipline Skills', max_skills: 1, value: 2 },
  'arcane mastery': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Metafocus Discipline Skills', max_skills: 1, value: 2 },
  'trait-spiritual-awareness': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Metafocus Discipline Skills', max_skills: 1, value: 1 },
  'spiritual awareness': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Metafocus Discipline Skills', max_skills: 1, value: 1 },
  'trait-awakened-psychic': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Metafocus Discipline Skills', max_skills: 2, value: 2 },
  'awakened (psychic)': { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Metafocus Discipline Skills', max_skills: 2, value: 2 },
  'trait-intellectualism': { enabled: true, mode: 'group_pool', group_keys: MENTAL_SKILL_GROUP_KEYS, group_label: 'Mental Skills', max_skills: 1, value: 2 },
  'intellectualism': { enabled: true, mode: 'group_pool', group_keys: MENTAL_SKILL_GROUP_KEYS, group_label: 'Mental Skills', max_skills: 1, value: 2 },
  'trait-adaptive-aspects': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges', 'mental_vocations', 'physical'], group_label: 'Knowledge, Engineering & Piloting Skills', max_skills: 1, value: 2 },
  'adaptive aspects (hive memories)': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges', 'mental_vocations', 'physical'], group_label: 'Knowledge, Engineering & Piloting Skills', max_skills: 1, value: 2 },
  'adaptive aspects': { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges', 'mental_vocations', 'physical'], group_label: 'Knowledge, Engineering & Piloting Skills', max_skills: 1, value: 2 },
  'trait-courtly-intrigue': {
    enabled: true,
    mode: 'single',
    group_label: 'Courtly Intrigue Skill',
    value: 2,
    options: [
      { id: 'bluff', label: 'Bluff (+2)', skills: ['Bluff'], value: 2 },
      { id: 'insight', label: 'Insight (+2)', skills: ['Insight'], value: 2 }
    ]
  },
  'courtly intrigue': {
    enabled: true,
    mode: 'single',
    group_label: 'Courtly Intrigue Skill',
    value: 2,
    options: [
      { id: 'bluff', label: 'Bluff (+2)', skills: ['Bluff'], value: 2 },
      { id: 'insight', label: 'Insight (+2)', skills: ['Insight'], value: 2 }
    ]
  },
  'trait-mimetic-form': {
    enabled: true,
    mode: 'single',
    group_label: 'Mimetic Deception Skill',
    value: 2,
    options: [
      { id: 'disguise', label: 'Disguise (+2)', skills: ['Disguise'], value: 2 },
      { id: 'bluff', label: 'Bluff / Deception (+2)', skills: ['Bluff'], value: 2 }
    ]
  },
  'mimetic form': {
    enabled: true,
    mode: 'single',
    group_label: 'Mimetic Deception Skill',
    value: 2,
    options: [
      { id: 'disguise', label: 'Disguise (+2)', skills: ['Disguise'], value: 2 },
      { id: 'bluff', label: 'Bluff / Deception (+2)', skills: ['Bluff'], value: 2 }
    ]
  }
};

/**
 * Resolves `modifier_options` for any feature or trait that grants a bonus to a chosen skill
 * or a mentioned list of skills. Checks explicit `modifier_options`, canonical ID/name lookup,
 * and regex patterns on mechanic/description text.
 */
export function resolveSkillChoiceModifierOptions(item, fallback = null) {
  if (!item && !fallback) return null;
  if (item?.modifier_options?.enabled) return item.modifier_options;
  if (fallback?.modifier_options?.enabled) return fallback.modifier_options;

  const rawId = String(item?.id || fallback?.id || '').trim().toLowerCase();
  const rawName = String(item?.name || item?.title || fallback?.name || fallback?.title || '')
    .replace(/\s*\(\d+\s*(?:CP|BP|pts?)\)/gi, '')
    .trim()
    .toLowerCase();

  if (rawId && CANONICAL_MODIFIER_OPTIONS_MAP[rawId]) {
    return { ...CANONICAL_MODIFIER_OPTIONS_MAP[rawId] };
  }
  if (rawName && CANONICAL_MODIFIER_OPTIONS_MAP[rawName]) {
    return { ...CANONICAL_MODIFIER_OPTIONS_MAP[rawName] };
  }

  const mech = String(item?.mechanic || item?.mechanics || fallback?.mechanic || fallback?.mechanics || item?.description || fallback?.description || '');
  if (!mech) return null;

  let m;
  if ((m = mech.match(/\+(\d+)[^\n.;]*?(?:to\s+)?(?:two|2|any\s+two)\s+Combat\s+Skills?/i))) {
    return { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 2, value: parseInt(m[1], 10) || 2 };
  }
  if ((m = mech.match(/\+(\d+)[^\n.;]*?(?:to\s+)?(?:a|one|any(?:\s+one)?|chosen)\s+Combat\s+Skill/i))) {
    return { enabled: true, mode: 'group_pool', group_keys: COMBAT_SKILL_GROUP_KEYS, group_label: 'Combat Skills', max_skills: 1, value: parseInt(m[1], 10) || 2 };
  }
  if ((m = mech.match(/\+(\d+)[^\n.;]*?(?:to\s+)?(?:a|one|any(?:\s+one)?)\s+Knowledge\s+or\s+Vocation\s+Skill/i))) {
    return { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges', 'mental_vocations'], group_label: 'Knowledge & Vocation Skills', max_skills: 1, value: parseInt(m[1], 10) || 2 };
  }
  if ((m = mech.match(/\+(\d+)[^\n.;]*?(?:to\s+)?(?:a|one|any(?:\s+one)?|specific)\s+Vocation(?:\s+Skill|\s+Specialization)?/i))) {
    return { enabled: true, mode: 'group_pool', group_keys: ['mental_vocations'], group_label: 'Vocation Skills', max_skills: 1, value: parseInt(m[1], 10) || 2 };
  }
  if ((m = mech.match(/\+(\d+)[^\n.;]*?(?:to\s+)?(?:two|2|any\s+two)\s+Knowledge\s+Skills?/i))) {
    return { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges'], group_label: 'Knowledge Skills', max_skills: 2, value: parseInt(m[1], 10) || 2 };
  }
  if ((m = mech.match(/\+(\d+)[^\n.;]*?(?:to\s+)?(?:a|one|any(?:\s+one)?|specific)\s+Knowledge(?:\s+Skill|\s+of\s+choice)?/i))) {
    return { enabled: true, mode: 'group_pool', group_keys: ['mental_knowledges'], group_label: 'Knowledge Skills', max_skills: 1, value: parseInt(m[1], 10) || 2 };
  }
  if ((m = mech.match(/\+(\d+)[^\n.;]*?(?:to\s+)?(?:a|one|any(?:\s+one)?)\s+Non-Combat\s+Skill/i))) {
    return { enabled: true, mode: 'group_pool', group_keys: NON_COMBAT_SKILL_GROUP_KEYS, group_label: 'Non-Combat Skills', max_skills: 1, value: parseInt(m[1], 10) || 2 };
  }
  if ((m = mech.match(/\+(\d+)[^\n.;]*?(?:to\s+)?(?:two|2|any\s+two)\s+(?:Metafocus\s+)?Discipline\s+Skills?/i))) {
    return { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Metafocus Discipline Skills', max_skills: 2, value: parseInt(m[1], 10) || 2 };
  }
  if ((m = mech.match(/\+(\d+)[^\n.;]*?(?:to\s+)?(?:a|one|any(?:\s+one)?|chosen)\s+(?:Metafocus\s+)?(?:Discipline|Metafocus)(?:\s+Skill)?/i))) {
    return { enabled: true, mode: 'group_pool', group_keys: DISCIPLINE_SKILL_GROUP_KEYS, group_label: 'Metafocus Discipline Skills', max_skills: 1, value: parseInt(m[1], 10) || 2 };
  }
  if ((m = mech.match(/\+(\d+)[^\n.;]*?(?:to\s+)?(?:a|one|any(?:\s+one)?|specific|chosen)\s+Skill(?:\s+Check|\s+Specialization|\s+of\s+choice)?/i))) {
    return { enabled: true, mode: 'group_pool', group_keys: ALL_SKILL_GROUP_KEYS, group_label: 'All Skills', max_skills: 1, value: parseInt(m[1], 10) || 2 };
  }

  return null;
}

const PLACEHOLDER_CHOICE_SKILL_TARGETS = new Set([
  'a specific',
  'the chosen',
  'from this feature',
  'checks with those specific',
  'checks made with that',
  'both',
  'divide amongst noted',
  'a combat',
  'combat skill',
  'specific vocation',
  'a vocation',
  'vocation',
  'a vocation specialization',
  'a knowledge of choice',
  'a knowledge',
  'a non-combat',
  'social',
  'social-expression',
  'a metafocus discipline',
  'discipline',
  'one metafocus',
  'a mental',
  'crafting',
  'the cr limit of what you can create allowing for more complex modifications',
  'temporary ranks in a specific',
  'for a short time',
  'gain a second companion',
  'chosen_skill',
  'skill choice'
]);

/**
 * Enriches a trait, feature, or hindrance object so that its modifiers are
 * fully represented across its rules, notes, and mechanics fields.
 * If canonicalFallback is not provided, automatically looks up the canonical item.
 */
export function enrichItemWithModifiers(rawItem, canonicalFallback = null) {
  if (!rawItem) return null;

  const item = typeof rawItem === 'object' ? { ...rawItem } : { name: String(rawItem) };
  const rawName = (item.name || item.title || item.id || '').trim();
  const fallback = canonicalFallback || resolveCanonicalCatalogItem(rawItem);
  const name = (typeof rawItem === 'object' && item.name && !/^(trait|feature|disadvantage|aug)-/i.test(item.name))
    ? item.name.trim()
    : (fallback?.name || fallback?.title || rawName);
  const body = item.body || fallback?.body || '';

  // 1. Resolve mechanics
  let mechanic = item.mechanic || item.mechanics || fallback?.mechanic || fallback?.mechanics || '';
  if (!mechanic && body) {
    const mechMatch = body.match(/(?:^|\n)## Mechanics[^\n]*\n([\s\S]*?)(?=(?:\n##\s)|$)/i);
    if (mechMatch) mechanic = mechMatch[1].trim();
  }
  if (!mechanic) {
    mechanic = item.description || item.desc || fallback?.description || '';
  }

  // 2. Resolve rules
  let rules = item.rules || item.special_rules || fallback?.rules || fallback?.special_rules || '';
  if (!rules && body) {
    const ruleMatch = body.match(/(?:^|\n)## Special Rules[^\n]*\n([\s\S]*?)(?=(?:\n##\s)|$)/i);
    if (ruleMatch) rules = ruleMatch[1].trim();
  }
  if (!rules) {
    const ruleParts = [];
    if (item.is_ranked || fallback?.is_ranked) ruleParts.push('Ranked selection.');
    if (item.is_multiple || fallback?.is_multiple) ruleParts.push('Multiple selections allowed.');
    const p = item.prerequisites || item.prerequisite || fallback?.prerequisites || fallback?.prerequisite;
    if (p && p !== 'None') ruleParts.push(`Prerequisite: ${p}.`);
    rules = ruleParts.join(' ');
  }

  // 3. Resolve modifier_options
  const resolvedModifierOptions = resolveSkillChoiceModifierOptions(item, fallback);

  // 4. Resolve & Parse Modifiers
  let existingMods = Array.isArray(item.modifiers) && item.modifiers.length > 0 ? [...item.modifiers] : [];
  if (existingMods.length === 0 && Array.isArray(fallback?.modifiers) && fallback.modifiers.length > 0) {
    existingMods = [...fallback.modifiers];
  }
  
  // Only parse from text if no explicit modifiers are defined
  let finalMods = existingMods.length > 0 ? existingMods : parseModifiersFromText(name, mechanic, body);

  // If this item has choice-based skill modifier_options, filter out placeholder skill targets
  if (resolvedModifierOptions?.enabled) {
    const isSingleSkillChoice = resolvedModifierOptions.mode === 'single' && Array.isArray(resolvedModifierOptions.options) && resolvedModifierOptions.options.some(o => typeof o === 'object' && (o.skills || o.skill));
    const singleChoiceSkillSet = new Set();
    if (isSingleSkillChoice) {
      resolvedModifierOptions.options.forEach(o => {
        if (typeof o === 'object') {
          (o.skills || (o.skill ? [o.skill] : [])).forEach(s => singleChoiceSkillSet.add(String(s).toLowerCase()));
        }
      });
      singleChoiceSkillSet.add('deception');
    }
    finalMods = finalMods.filter(m => {
      if (!m || typeof m !== 'object') return false;
      if (m.mode === 'group_choice') return false;
      if (m.type === 'skill' || m.type === 'specialization' || m.type === 'virtual_ranks') {
        const tLower = String(m.target || m.skill || '').trim().toLowerCase();
        if (PLACEHOLDER_CHOICE_SKILL_TARGETS.has(tLower)) return false;
        if (isSingleSkillChoice && singleChoiceSkillSet.has(tLower)) return false;
      }
      return true;
    });
  }

  // Ensure fixed inherent skill bonuses on compound choice traits are present
  const checkId = String(item.id || fallback?.id || '').toLowerCase();
  const checkName = String(name || '').toLowerCase();
  if ((checkId === 'trait-intellectualism' || checkName === 'intellectualism') && !finalMods.some(m => String(m.target).toLowerCase() === 'academics')) {
    finalMods.push({ target: 'Academics', type: 'skill', value: 2, mode: 'inherent', description: '+2 to Academics' });
  }
  if ((checkId === 'trait-spiritual-awareness' || checkName === 'spiritual awareness') && !finalMods.some(m => String(m.target).toLowerCase() === 'attune')) {
    finalMods.push({ target: 'Attune', type: 'skill', value: 1, mode: 'inherent', description: '+1 to Attune' });
  }

  // 5. Resolve Notes
  const notesArray = formatModifierNotes(finalMods, rules, { ...fallback, ...item });
  const notesText = notesArray.join('\n');

  const selectedSkills = Array.isArray(item.selected_skills)
    ? item.selected_skills
    : (item.selected_skill ? [item.selected_skill] : (Array.isArray(fallback?.selected_skills) ? fallback.selected_skills : undefined));
  const selectedOptionId = item.selected_option_id ?? fallback?.selected_option_id ?? undefined;

  return {
    ...item,
    name,
    modifiers: finalMods,
    ...(resolvedModifierOptions ? { modifier_options: resolvedModifierOptions } : {}),
    ...(selectedSkills !== undefined ? { selected_skills: selectedSkills } : {}),
    ...(selectedOptionId !== undefined ? { selected_option_id: selectedOptionId } : {}),
    mechanic,
    mechanics: mechanic,
    rules,
    special_rules: rules,
    notes: item.notes || notesText,
    notesList: notesArray,
    description: item.description || item.desc || fallback?.description || mechanic
  };
}

/**
 * Common skill aliases mapping informal/narrative check targets to canonical skills.
 */
export const SKILL_ALIASES = {
  'perception': ['alertness'],
  'notice': ['alertness'],
  'sensory': ['alertness'],
  'hacking': ['computers'],
  'programming': ['computers'],
  'first aid': ['medicine'],
  'medical': ['medicine'],
  'pilot': ['piloting'],
  'hide': ['stealth'],
  'sneak': ['stealth'],
  'investigate': ['investigation'],
  'tracking': ['survival'],
  'strategy': ['tactics'],
  'persuasion': ['diplomacy'],
  'negotiation': ['diplomacy'],
  'deception': ['bluff'],
  'intimidate': ['intimidation'],
  'coerce': ['intimidation'],
  'sense motive': ['insight'],
  'empathy': ['insight'],
  'arcana': ['arcane', 'knowledge (arcane)'],
  'engineer': ['engineer', 'engineering'],
  'engineering': ['engineer', 'engineering']
};

/**
 * Checks if a modifier target string matches a skill (by name, clean ID, parentheses, aliases, or category).
 */
export function isSkillTargetMatch(skill, targetStr) {
  if (!skill || !targetStr) return false;
  const sName = typeof skill === 'object' ? (skill.name || skill.id || '') : String(skill);
  const sId = typeof skill === 'object' ? (skill.id || '') : '';
  const sGroup = typeof skill === 'object' ? (skill.group || '') : '';
  const sSub = typeof skill === 'object' ? (skill.subcategory || '') : '';

  const cleanTarget = String(targetStr).trim().toLowerCase();
  const cleanTargetAlpha = cleanTarget.replace(/[^a-z0-9]/g, '');
  const cleanName = sName.toLowerCase().trim();
  const cleanNameAlpha = cleanName.replace(/[^a-z0-9]/g, '');
  const cleanId = sId.replace(/^[a-z]+-/, '').toLowerCase().trim();
  const cleanIdAlpha = cleanId.replace(/[^a-z0-9]/g, '');

  const sIdLower = sId.toLowerCase().trim();
  const sIdAlpha = sIdLower.replace(/[^a-z0-9]/g, '');
  const cleanTargetNoPrefix = cleanTarget.replace(/^[a-z]+-/, '').replace(/^[a-z]+-/, '');
  const cleanTargetNoPrefixAlpha = cleanTargetNoPrefix.replace(/[^a-z0-9]/g, '');

  // 1. Direct name, full sId, cleanId, or target without prefix match
  if (sIdLower && (sIdLower === cleanTarget || sIdAlpha === cleanTargetAlpha)) return true;
  if (cleanName === cleanTarget || cleanNameAlpha === cleanTargetAlpha) return true;
  if (cleanId && (cleanId === cleanTarget || cleanIdAlpha === cleanTargetAlpha || cleanId === cleanTargetNoPrefix || cleanIdAlpha === cleanTargetNoPrefixAlpha)) return true;
  if (cleanName === cleanTargetNoPrefix || cleanNameAlpha === cleanTargetNoPrefixAlpha) return true;

  // 2. Parentheses match: e.g. "Arcane" vs "Knowledge (Arcane)"
  const inParenMatch = cleanName.match(/\(([^)]+)\)/);
  if (inParenMatch && inParenMatch[1]) {
    const inside = inParenMatch[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (inside === cleanTargetAlpha) return true;
  }
  const targetParenMatch = cleanTarget.match(/\(([^)]+)\)/);
  if (targetParenMatch && targetParenMatch[1]) {
    const inside = targetParenMatch[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (inside === cleanNameAlpha || inside === cleanIdAlpha) return true;
  }

  // 3. Alias check
  for (const [alias, canonicals] of Object.entries(SKILL_ALIASES)) {
    const aliasAlpha = alias.replace(/[^a-z0-9]/g, '');
    if (cleanTargetAlpha === aliasAlpha) {
      if (canonicals.some(c => c.replace(/[^a-z0-9]/g, '') === cleanNameAlpha || c.replace(/[^a-z0-9]/g, '') === cleanIdAlpha)) {
        return true;
      }
    }
  }

  // 4. Scope and category wildcard targets
  if (['all checks', 'all skills', 'all actions'].includes(cleanTarget)) return true;
  if (sGroup) {
    const grpLower = sGroup.toLowerCase();
    if (cleanTarget === `${grpLower} skills` || cleanTarget === `all ${grpLower} skills` || cleanTarget === grpLower) return true;
  }
  if (sSub) {
    const subLower = sSub.toLowerCase();
    if (cleanTarget === subLower || cleanTarget === `all ${subLower}` || cleanTarget === `${subLower} skills`) return true;
  }
  if (cleanTarget === 'knowledges' || cleanTarget === 'all knowledges' || cleanTarget === 'knowledge skills') {
    if (sSub?.toLowerCase() === 'knowledges' || sId.includes('knowledge') || cleanName.startsWith('knowledge')) return true;
  }
  if (cleanTarget === 'vocations' || cleanTarget === 'all vocations' || cleanTarget === 'vocation skills') {
    if (sSub?.toLowerCase() === 'vocations' || sId.includes('vocation') || cleanName.startsWith('vocation')) return true;
  }
  if (cleanTarget === 'metafocus' || cleanTarget === 'disciplines' || cleanTarget === 'all disciplines') {
    if (sGroup === 'meta' || sId.startsWith('meta-')) return true;
  }

  return false;
}

/**
 * Extracts skill modifier descriptors from an equipment / property item.
 * Inspects `modifiers`, `skill_modifiers`, `skillModifiers`, `modifications`, and parsed text.
 */
export function extractEquipmentSkillModifiers(item) {
  if (!item || typeof item !== 'object') return [];
  const mods = [];
  const itemName = item.name || item.title || item.label || 'Unnamed Item';
  const category = item.category || 'gear';
  const qty = parseInt(item.qty ?? item.quantity ?? 1, 10) || 1;

  // 1. Direct item.modifiers array
  if (Array.isArray(item.modifiers)) {
    item.modifiers.forEach(m => {
      if (!m || typeof m !== 'object') return;
      const type = (m.type || '').toLowerCase();
      const target = (m.target || m.skill || '').trim();
      const val = parseInt(m.value ?? m.val ?? m.bonus ?? 0, 10);
      if ((type === 'skill' || (!type && target)) && target && !isNaN(val) && val !== 0) {
        mods.push({
          target,
          value: val,
          source: itemName,
          sourceType: 'equipment',
          category,
          qty,
          description: m.description || `${itemName}: ${val >= 0 ? '+' : ''}${val} to ${target}`,
          item
        });
      }
    });
  }

  // 2. Direct item.skill_modifiers / skillModifiers (array or object)
  const directSkillMods = item.skill_modifiers || item.skillModifiers || item.skill_modifier;
  if (Array.isArray(directSkillMods)) {
    directSkillMods.forEach(m => {
      if (!m) return;
      if (typeof m === 'object') {
        const target = (m.skill || m.target || m.name || '').trim();
        const val = parseInt(m.value ?? m.bonus ?? m.mod ?? 0, 10);
        if (target && !isNaN(val) && val !== 0) {
          mods.push({
            target,
            value: val,
            source: itemName,
            sourceType: 'equipment',
            category,
            qty,
            description: m.description || `${itemName}: ${val >= 0 ? '+' : ''}${val} to ${target}`,
            item
          });
        }
      }
    });
  } else if (directSkillMods && typeof directSkillMods === 'object') {
    Object.entries(directSkillMods).forEach(([skillKey, bonusVal]) => {
      const val = parseInt(bonusVal, 10);
      if (skillKey && !isNaN(val) && val !== 0) {
        mods.push({
          target: skillKey,
          value: val,
          source: itemName,
          sourceType: 'equipment',
          category,
          qty,
          description: `${itemName}: ${val >= 0 ? '+' : ''}${val} to ${skillKey}`,
          item
        });
      }
    });
  }

  // 3. item.modifications array
  if (Array.isArray(item.modifications)) {
    item.modifications.forEach(mod => {
      if (typeof mod === 'object' && mod !== null) {
        const subMods = extractEquipmentSkillModifiers(mod);
        subMods.forEach(sm => {
          mods.push({
            ...sm,
            source: `${itemName} [${mod.name || 'Mod'}]`,
            item
          });
        });
      }
    });
  }

  // 4. Parse text from mechanic / description
  const parsed = parseModifiersFromText(itemName, item.mechanic || item.mechanics || '', item.description || item.desc || '');
  parsed.forEach(pm => {
    if (pm.type === 'skill' && pm.target && pm.value) {
      const alreadyExtracted = mods.some(m => m.target.toLowerCase() === pm.target.toLowerCase() && m.value === pm.value);
      if (!alreadyExtracted) {
        mods.push({
          target: pm.target,
          value: pm.value,
          source: itemName,
          sourceType: 'equipment',
          category,
          qty,
          description: `${itemName}: ${pm.value >= 0 ? '+' : ''}${pm.value} to ${pm.target}`,
          item
        });
      }
    }
  });

  return mods;
}

/**
 * Computes a comprehensive breakdown for a specific skill:
 * score, attribute used, rank, all active modifiers, and associated possessed equipment.
 */
export function getSkillCheckBreakdown(skill, characterData = {}, dbData = {}, extraOptions = {}) {
  if (!skill) return null;

  const sId = typeof skill === 'object' ? (skill.id || '') : String(skill);
  const cleanId = sId.replace(/^[a-z]+-/, '');
  const sName = typeof skill === 'object' ? (skill.name || cleanId.replace(/-/g, ' ')) : cleanId.replace(/-/g, ' ');
  const canonSkill = ALL_CANONICAL_SKILLS.find(s => s.id === sId || s.id.replace(/^[a-z]+-/, '') === cleanId || s.name.toLowerCase() === sName.toLowerCase());
  const skillObj = {
    id: sId,
    name: canonSkill?.name || sName,
    group: canonSkill?.group || (typeof skill === 'object' ? skill.group : '') || '',
    subcategory: canonSkill?.subcategory || (typeof skill === 'object' ? skill.subcategory : '') || '',
    baseAttr: characterData[`skill-${sId}-base`] || characterData[`skill-${cleanId}-base`] || canonSkill?.baseAttr || (typeof skill === 'object' ? skill.baseAttr : '') || 'attr-agility'
  };

  // 1. Skill Rank (max 20)
  let rank = 0;
  if (characterData[`skill-${sId}-rank`] !== undefined) {
    rank = parseInt(characterData[`skill-${sId}-rank`], 10) || 0;
  } else if (cleanId && characterData[`skill-${cleanId}-rank`] !== undefined) {
    rank = parseInt(characterData[`skill-${cleanId}-rank`], 10) || 0;
  } else {
    // Check pools
    const pools = [
      characterData?.speciesAllocations?.skills,
      characterData?.occuAllocations?.skills,
      characterData?.originAllocations?.skills,
      characterData?.factionAllocations?.skills,
      characterData?.generalAllocations?.skills
    ];
    pools.forEach(p => {
      if (!p || typeof p !== 'object') return;
      Object.entries(p).forEach(([k, v]) => {
        if (isSkillTargetMatch(skillObj, k)) {
          rank += parseInt(v, 10) || 0;
        }
      });
    });
  }
  rank = Math.min(20, Math.max(0, rank));

  // 2. Base Attribute
  const baseAttrKey = skillObj.baseAttr || 'attr-agility';
  const attrMap = {
    'attr-strength': 'STR',
    'attr-agility': 'AGI',
    'attr-stamina': 'STA',
    'attr-intellect': 'INT',
    'attr-wisdom': 'WIS',
    'attr-charisma': 'CHA'
  };
  const baseAttrLabel = attrMap[baseAttrKey] || baseAttrKey.replace('attr-', '').toUpperCase().slice(0, 3);
  const baseAttrScore = parseInt(characterData[baseAttrKey] || 0, 10);
  const baseAttrUserMod = parseInt(characterData[`${baseAttrKey}-mod`] || 0, 10);
  const baseAttrIdentityMod = parseInt(extraOptions?.attributeMods?.[baseAttrKey] || 0, 10);
  const attrTotal = typeof extraOptions?.getAttrTotal === 'function'
    ? Number(extraOptions.getAttrTotal(baseAttrKey)) || 0
    : (baseAttrScore + baseAttrUserMod + baseAttrIdentityMod);

  // 3. Collect Modifiers from Features, Traits, Hindrances, Identity Packages, Equipment, and Direct
  const activeModifiers = [];
  const associatedEquipment = [];
  const seenModKeys = new Set();

  const addModifier = (mod) => {
    if (!mod || !mod.value) return;
    const key = `${mod.source}_${mod.target}_${mod.value}_${mod.mode || ''}_${mod.condition || ''}`;
    if (!seenModKeys.has(key)) {
      seenModKeys.add(key);
      activeModifiers.push(mod);
    }
  };

  // Direct manual modifier
  const directMod = parseInt(characterData[`skill-${sId}-mod`] || characterData[`skill-${cleanId}-mod`] || 0, 10);
  if (directMod !== 0) {
    addModifier({
      source: 'Direct Adjustment',
      sourceType: 'manual',
      target: skillObj.name,
      value: directMod,
      mode: 'manual',
      isSituational: false,
      description: `Manual Adjustment: ${directMod >= 0 ? '+' : ''}${directMod}`
    });
  }

  // Helper to scan items list
  const scanItemList = (list, defaultSourceType) => {
    if (!Array.isArray(list)) return;
    list.forEach(raw => {
      if (!raw) return;
      const enriched = enrichItemWithModifiers(raw);
      if (!enriched) return;
      const srcName = enriched.name || (typeof raw === 'object' ? (raw.name || raw.title) : String(raw));
      const sType = enriched.category || enriched.source || defaultSourceType;

      if (Array.isArray(enriched.modifiers)) {
        enriched.modifiers.forEach(m => {
          if (!m || typeof m !== 'object') return;
          const target = m.target || m.skill || '';
          const val = parseInt(m.value, 10) || 0;
          if (m.type === 'skill' || m.type === 'check_advantage' || m.type === 'take_10' || m.type === 'specialization' || m.type === 'virtual_ranks' || target) {
            if (isSkillTargetMatch(skillObj, target)) {
              addModifier({
                source: srcName,
                sourceType: defaultSourceType,
                target,
                value: val,
                mode: m.mode || 'inherent',
                type: m.type || 'skill',
                isSituational: Boolean(m.isSituational || m.mode === 'conditional' || m.mode === 'situational' || m.condition || m.type === 'check_advantage' || m.type === 'take_10'),
                condition: m.condition || null,
                description: m.description || `${srcName}: ${val >= 0 ? '+' : ''}${val} to ${target}`
              });
            }
          }
        });
      }

      // Check choice-based modifier_options (group_pool or single/pair options) or group_choice modifiers
      const rawOptions = (typeof raw === 'object' && raw.modifier_options) ? raw.modifier_options : enriched.modifier_options;
      const groupChoiceMod = Array.isArray(enriched.modifiers) ? enriched.modifiers.find(m => m.type === 'skill' && m.mode === 'group_choice') : null;
      const itemRank = Math.max(1, parseInt((typeof raw === 'object' ? raw.rank : undefined) ?? enriched.rank ?? 1, 10) || 1);
      const isRanked = Boolean((typeof raw === 'object' && raw.is_ranked) || enriched.is_ranked);
      const rankMultiplier = isRanked ? itemRank : 1;

      const cleanId = String((typeof raw === 'object' ? raw.id : '') || enriched.id || '').trim().toLowerCase();
      const cleanName = String(srcName || '').replace(/\s*\(\d+\s*(?:CP|BP|pts?)\)/gi, '').trim().toLowerCase();
      const selectionMap = defaultSourceType === 'trait'
        ? (characterData?.traitSkillSelections || {})
        : (defaultSourceType === 'feature' ? (characterData?.featureSkillSelections || {}) : {});
      const mapEntry = (cleanId && selectionMap[cleanId]) || (cleanName && selectionMap[cleanName]) || null;

      if ((rawOptions && rawOptions.enabled && rawOptions.mode === 'group_pool') || groupChoiceMod) {
        const baseOptValue = parseInt(rawOptions?.value ?? groupChoiceMod?.value ?? 2, 10) || 2;
        const optValue = baseOptValue * rankMultiplier;
        const rawSel = (typeof raw === 'object' && Array.isArray(raw.selected_skills) && raw.selected_skills.length > 0)
          ? raw.selected_skills
          : ((typeof raw === 'object' && raw.selected_skill) ? [raw.selected_skill] : null);
        const mapSel = Array.isArray(mapEntry?.selected_skills)
          ? mapEntry.selected_skills
          : (Array.isArray(mapEntry) ? mapEntry : (mapEntry?.selected_skill ? [mapEntry.selected_skill] : null));
        const selectedSkills = rawSel || mapSel || (Array.isArray(enriched?.selected_skills) ? enriched.selected_skills : []);
        const groupLabel = rawOptions?.group_label || groupChoiceMod?.group_label || groupChoiceMod?.target || 'Skill Group Choice';

        selectedSkills.forEach(skillTarget => {
          if (isSkillTargetMatch(skillObj, skillTarget)) {
            addModifier({
              source: `${srcName} [${skillTarget}]`,
              sourceType: defaultSourceType,
              target: skillTarget,
              value: optValue,
              description: `${srcName}: ${optValue >= 0 ? '+' : ''}${optValue} to ${skillTarget} (${groupLabel})`
            });
          }
        });
      } else if (rawOptions && rawOptions.enabled && Array.isArray(rawOptions.options) && rawOptions.options.length > 0) {
        const selectedId = (typeof raw === 'object' && raw.selected_option_id)
          ? raw.selected_option_id
          : (mapEntry?.selected_option_id || (typeof mapEntry === 'string' ? mapEntry : enriched.selected_option_id));
        const activeOption = rawOptions.options.find(opt => typeof opt === 'object' && opt.id === selectedId)
          || (rawOptions.options.length === 1 && typeof rawOptions.options[0] === 'object' ? rawOptions.options[0] : null);
        
        if (activeOption) {
          const baseOptValue = parseInt(activeOption.value !== undefined ? activeOption.value : (rawOptions.value || 2), 10) || 2;
          const optValue = baseOptValue * rankMultiplier;
          const targetSkills = Array.isArray(activeOption.skills) 
            ? activeOption.skills 
            : (activeOption.skill ? [activeOption.skill] : []);
            
          targetSkills.forEach(skillTarget => {
            if (isSkillTargetMatch(skillObj, skillTarget)) {
              addModifier({
                source: `${srcName} [${activeOption.label || activeOption.id || 'Selected Option'}]`,
                sourceType: defaultSourceType,
                target: skillTarget,
                value: optValue,
                description: `${srcName}: ${optValue >= 0 ? '+' : ''}${optValue} to ${skillTarget} (${activeOption.label || activeOption.id})`
              });
            }
          });
        }
      }
    });
  };

  // Scan Features (explicit + allocation pools)
  const allFeatures = [...(Array.isArray(characterData.features) ? characterData.features : [])];
  const poolFeatures = [
    characterData?.archetypeAllocations?.features,
    characterData?.speciesAllocations?.features,
    characterData?.occuAllocations?.features,
    characterData?.originAllocations?.features,
    characterData?.factionAllocations?.features
  ];
  poolFeatures.forEach(p => {
    if (Array.isArray(p)) {
      p.forEach(pf => {
        if (!pf) return;
        const n = (typeof pf === 'object' ? (pf.name || pf.title || pf.id) : String(pf)).toLowerCase();
        if (!allFeatures.some(ef => (typeof ef === 'object' ? (ef.name || ef.title || ef.id) : String(ef)).toLowerCase() === n)) {
          allFeatures.push(pf);
        }
      });
    }
  });
  scanItemList(allFeatures, 'feature');

  // Scan Traits (explicit + inherent species/archetype + allocation pools)
  const allTraits = [...(Array.isArray(characterData.traits) ? characterData.traits : [])];
  const speciesRef = characterData?.species ? String(characterData.species).toLowerCase() : '';
  const speciesObj = speciesRef && Array.isArray(DEFAULT_SPECIES)
    ? DEFAULT_SPECIES.find(s => (s.id || '').toLowerCase() === speciesRef || (s.name || '').toLowerCase() === speciesRef)
    : null;
  const archetypeRef = characterData?.archetype ? String(characterData.archetype).toLowerCase() : '';
  const archetypeObj = archetypeRef && Array.isArray(DEFAULT_ARCHETYPES)
    ? DEFAULT_ARCHETYPES.find(a => (a.id || '').toLowerCase() === archetypeRef || (a.name || '').toLowerCase() === archetypeRef)
    : null;
  const speciesInherentTraits = speciesObj ? (speciesObj.inherent_traits || speciesObj.species_traits || speciesObj.traits || []) : [];
  const archetypeSigTraits = archetypeObj ? (archetypeObj.signature_traits || archetypeObj.traits || archetypeObj.signature_features || []) : [];
  const poolTraits = [
    speciesInherentTraits,
    archetypeSigTraits,
    characterData?.archetypeAllocations?.traits,
    characterData?.speciesAllocations?.traits,
    characterData?.occuAllocations?.traits,
    characterData?.originAllocations?.traits,
    characterData?.factionAllocations?.traits
  ];
  poolTraits.forEach(p => {
    if (Array.isArray(p)) {
      p.forEach(pt => {
        if (!pt) return;
        const n = (typeof pt === 'object' ? (pt.name || pt.title || pt.id) : String(pt)).toLowerCase();
        if (!allTraits.some(et => (typeof et === 'object' ? (et.name || et.title || et.id) : String(et)).toLowerCase() === n)) {
          allTraits.push(pt);
        }
      });
    }
  });
  scanItemList(allTraits, 'trait');

  // Scan Hindrances and Disadvantages
  scanItemList(characterData.hindrances, 'hindrance');
  scanItemList(characterData.disadvantages, 'hindrance');
  // Scan Augmentations
  scanItemList(characterData.augmentations, 'augmentation');

  // Scan Possessed Equipment across all property lists
  const propertyLists = [
    characterData.gear,
    characterData.equipment,
    characterData.weapons,
    characterData.weaponry,
    characterData.armor,
    characterData.armoring,
    characterData.other,
    characterData.misc,
    characterData.mecha,
    characterData.architecture
  ];

  const seenEquipIds = new Set();
  propertyLists.forEach(propList => {
    if (!Array.isArray(propList)) return;
    propList.forEach(eqItem => {
      if (!eqItem) return;
      const itemKey = typeof eqItem === 'object' ? (eqItem.id || eqItem.name) : String(eqItem);
      if (itemKey && seenEquipIds.has(itemKey)) return;
      if (itemKey) seenEquipIds.add(itemKey);

      const parsedEq = typeof eqItem === 'object' ? eqItem : { name: String(eqItem) };
      const eqMods = extractEquipmentSkillModifiers(parsedEq);
      eqMods.forEach(em => {
        if (isSkillTargetMatch(skillObj, em.target)) {
          addModifier(em);
          associatedEquipment.push({
            name: em.source,
            category: em.category,
            qty: em.qty,
            value: em.value,
            description: em.description,
            item: parsedEq
          });
        }
      });
    });
  });

  // Separate Permanent Modifiers from Situational Modifiers
  const permanentModifiers = activeModifiers.filter(m => !m.isSituational && m.type !== 'check_advantage' && m.type !== 'take_10');
  const situationalModifiers = activeModifiers.filter(m => m.isSituational || m.type === 'check_advantage' || m.type === 'take_10');

  // Typed Bonus Resolution for Permanent Modifiers:
  // Same typed bonuses (e.g. 'competence') do not stack; take the highest.
  // Inherent, specialization, and manual adjustments stack.
  const typedBonusBuckets = {};
  let unstackedSum = 0;

  permanentModifiers.forEach(m => {
    const val = m.value || 0;
    const mode = (m.mode || 'inherent').toLowerCase();

    // Stackable types: inherent, specialization, manual, penalty
    if (['inherent', 'specialization', 'manual', 'penalty'].includes(mode) || val < 0) {
      unstackedSum += val;
    } else {
      // Typed bonuses: take highest positive bonus within each type category (e.g. competence, circumstance, equipment)
      if (!typedBonusBuckets[mode] || val > typedBonusBuckets[mode]) {
        typedBonusBuckets[mode] = val;
      }
    }
  });

  const typedBonusTotal = Object.values(typedBonusBuckets).reduce((sum, v) => sum + v, 0);
  const totalModifier = unstackedSum + typedBonusTotal;
  const finalScore = rank + attrTotal + totalModifier;

  // Advantage / Disadvantage resolution:
  // Advantage: Roll 3d10, take best 2
  // Disadvantage: Roll 3d10, take worse 2
  const hasAdvantage = situationalModifiers.some(m => m.type === 'check_advantage' || /advantage/i.test(m.description || ''));
  const hasDisadvantage = situationalModifiers.some(m => m.type === 'disadvantage' || /disadvantage/i.test(m.description || ''));

  return {
    skillId: sId,
    skillName: skillObj.name,
    group: skillObj.group,
    subcategory: skillObj.subcategory,
    rank,
    baseAttrKey,
    baseAttrLabel,
    baseAttrScore,
    baseAttrUserMod,
    attrTotal,
    totalModifier,
    score: finalScore,
    total: finalScore,
    modifiers: activeModifiers,
    permanentModifiers,
    situationalModifiers,
    hasAdvantage,
    hasDisadvantage,
    typedBonusBuckets,
    equipment: associatedEquipment,
    formula: `Score (${finalScore}) = Rank (${rank}) + ${baseAttrLabel} (${attrTotal}) + Mods (${totalModifier >= 0 ? '+' : ''}${totalModifier})`,
    rollExpression: hasAdvantage 
      ? `3d10k2${finalScore !== 0 ? (finalScore > 0 ? `+${finalScore}` : `${finalScore}`) : ''}`
      : hasDisadvantage
        ? `3d10kl2${finalScore !== 0 ? (finalScore > 0 ? `+${finalScore}` : `${finalScore}`) : ''}`
        : `2d10${finalScore !== 0 ? (finalScore > 0 ? `+${finalScore}` : `${finalScore}`) : ''}`,
    rollDescription: hasAdvantage
      ? `Advantage: Roll 3d10, take best 2 ${finalScore >= 0 ? `+ ${finalScore}` : finalScore}`
      : hasDisadvantage
        ? `Disadvantage: Roll 3d10, take worse 2 ${finalScore >= 0 ? `+ ${finalScore}` : finalScore}`
        : `Standard: Roll 2d10 ${finalScore >= 0 ? `+ ${finalScore}` : finalScore}`
  };
}

