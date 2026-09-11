/**
 * Tangent SF RP — Unified Modifier Representation Engine
 * 
 * Ensures all selected traits, features, and hindrances have their modifiers
 * rigorously extracted, computed, and represented across rules, notes, and mechanics.
 */

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
    .replace(/[()[\]{}]/g, ' ');

  const modifiers = [];
  const seenKeys = new Set();

  const addMod = (mod) => {
    const key = `${mod.type}_${mod.target}_${mod.value}_${mod.condition || ''}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      modifiers.push(mod);
    }
  };

  // 1. Saving Throw Bonuses & Penalties (e.g., "+2 bonus on all Fortitude Checks", "-2 to Will saves")
  const saveRegex = /([+-]?\d+)\s*(?:bonus|penalty)?\s*(?:on|to)\s*(?:all\s*)?(Fortitude|Reflex|Will|Willpower|Concentration)\s*(?:Checks?|Saves?)/gi;
  let match;
  while ((match = saveRegex.exec(combined)) !== null) {
    const val = parseInt(match[1], 10);
    const target = SAVE_TARGETS[match[2].toLowerCase()] || match[2];
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

  // 2. Advantage / Disadvantage on Checks / Saves
  if (/roll\s*(?:all\s*)?(?:Fortitude|Reflex|Will|Willpower)\s*checks?\s*with\s*Advantage/i.test(combined)) {
    const saveType = combined.match(/(Fortitude|Reflex|Will|Willpower)/i)?.[1] || 'Save';
    addMod({
      target: SAVE_TARGETS[saveType.toLowerCase()] || saveType,
      type: 'save_advantage',
      value: 1,
      mode: 'inherent',
      description: `Advantage on ${saveType} Checks`
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

  // 3. Specific Skill Bonuses / Penalties (e.g., "+5 to Disguise", "+1 bonus to intimidation and breach", "-2 Penalty to Insight")
  const skillRegex = /([+-]\d+)\s*(?:bonus|penalty)?\s*(?:to|on)\s*([A-Za-z\s/&-]+?)(?:\s*(?:checks?|actions?|skills?|saves?|saving throws?|rolls?|[,.]|$))/gi;
  while ((match = skillRegex.exec(combined)) !== null) {
    const val = parseInt(match[1], 10);
    const rawTarget = match[2].trim();
    const lower = rawTarget.toLowerCase();
    
    // Skip targets that belong to saves, karma, wealth, tech level, or generic words
    if (
      !['will', 'fortitude', 'reflex', 'wealth', 'tech level', 'karma', 'all', 'each', 'all fortitude', 'all reflex', 'all will'].includes(lower) &&
      rawTarget.length >= 3 &&
      rawTarget.length <= 40
    ) {
      // Split compound targets like "intimidation and breach" or "Insight and Social"
      const subTargets = rawTarget.split(/\s+and\s+|\s*,\s*|\s*\/\s*/i).map(s => s.replace(/^all\s+/i, '').trim()).filter(Boolean);
      subTargets.forEach(st => {
        const stLower = st.toLowerCase();
        if (!['will', 'fortitude', 'reflex', 'wealth', 'tech level', 'karma', 'all', 'each'].includes(stLower) && st.length >= 3) {
          const capitalized = st.charAt(0).toUpperCase() + st.slice(1);
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

  // 4. Karma adjustments (e.g., "-2 to Karma Pool", "+1 Karma")
  const karmaMatch = combined.match(/([+-]?\d+)\s*(?:to\s*)?Karma\s*(?:Pool)?/i);
  if (karmaMatch) {
    const val = parseInt(karmaMatch[1], 10);
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

  // 5. Tech Level Modifiers (e.g. "-1 Tech Level")
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

  // 6. Wealth Modifiers (e.g. "-4 to Wealth Score")
  const wealthMatch = combined.match(/([+-]?\d+)\s*(?:to\s*)?Wealth(?:\s*Score)?/i);
  if (wealthMatch) {
    const val = parseInt(wealthMatch[1], 10);
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

  // 7. Tactical & Combat Stats (Initiative, Defense, Evasion, DR)
  const combatRegex = /([+-]?\d+)\s*(?:to\s*)?(Initiative|Defense|Evasion|DR|Armor|Movement|Walk|Speed)/gi;
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
      'speed': 'move-walk'
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

  // 8. Conditions
  if (/Sickened/i.test(combined)) {
    addMod({
      target: 'Condition: Sickened',
      type: 'condition',
      value: -2,
      mode: 'penalty',
      description: 'Inflicts Sickened condition (-2 to all checks)'
    });
  }

  if (/Fatigued/i.test(combined)) {
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
 * Enriches a trait, feature, or hindrance object so that its modifiers are
 * fully represented across its rules, notes, and mechanics fields.
 */
export function enrichItemWithModifiers(rawItem, canonicalFallback = null) {
  if (!rawItem) return null;

  const item = typeof rawItem === 'object' ? { ...rawItem } : { name: String(rawItem) };
  const name = (item.name || item.title || item.id || '').trim();
  const body = item.body || canonicalFallback?.body || '';

  // 1. Resolve mechanics
  let mechanic = item.mechanic || item.mechanics || canonicalFallback?.mechanic || canonicalFallback?.mechanics || '';
  if (!mechanic && body) {
    const mechMatch = body.match(/(?:^|\n)## Mechanics[^\n]*\n([\s\S]*?)(?=(?:\n##\s)|$)/i);
    if (mechMatch) mechanic = mechMatch[1].trim();
  }
  if (!mechanic) {
    mechanic = item.description || item.desc || canonicalFallback?.description || '';
  }

  // 2. Resolve rules
  let rules = item.rules || item.special_rules || canonicalFallback?.rules || canonicalFallback?.special_rules || '';
  if (!rules && body) {
    const ruleMatch = body.match(/(?:^|\n)## Special Rules[^\n]*\n([\s\S]*?)(?=(?:\n##\s)|$)/i);
    if (ruleMatch) rules = ruleMatch[1].trim();
  }
  if (!rules) {
    const ruleParts = [];
    if (item.is_ranked || canonicalFallback?.is_ranked) ruleParts.push('Ranked selection.');
    if (item.is_multiple || canonicalFallback?.is_multiple) ruleParts.push('Multiple selections allowed.');
    const p = item.prerequisites || item.prerequisite || canonicalFallback?.prerequisites || canonicalFallback?.prerequisite;
    if (p && p !== 'None') ruleParts.push(`Prerequisite: ${p}.`);
    rules = ruleParts.join(' ');
  }

  // 3. Resolve & Parse Modifiers
  let existingMods = Array.isArray(item.modifiers) ? [...item.modifiers] : [];
  if (existingMods.length === 0 && Array.isArray(canonicalFallback?.modifiers)) {
    existingMods = [...canonicalFallback.modifiers];
  }
  const parsedMods = parseModifiersFromText(name, mechanic, body);

  // Merge modifiers without duplication
  const finalMods = [...existingMods];
  parsedMods.forEach(pm => {
    const exists = finalMods.some(em => 
      em.target === pm.target && 
      em.type === pm.type && 
      em.value === pm.value
    );
    if (!exists) {
      finalMods.push(pm);
    }
  });

  // 4. Resolve Notes
  const notesArray = formatModifierNotes(finalMods, rules, { ...canonicalFallback, ...item });
  const notesText = notesArray.join('\n');

  return {
    ...item,
    name,
    modifiers: finalMods,
    mechanic,
    mechanics: mechanic,
    rules,
    special_rules: rules,
    notes: item.notes || notesText,
    notesList: notesArray,
    description: item.description || item.desc || canonicalFallback?.description || mechanic
  };
}
