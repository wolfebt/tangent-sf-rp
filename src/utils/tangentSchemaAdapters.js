// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — OMNICORTEX SCHEMA ADAPTER & NORMALIZER
// Bidirectional conversion between flat legacy documents and
// modern consolidated nested NoSQL maps and universal arrays.
// ═══════════════════════════════════════════════════════════

/**
 * Normalizes any legacy or modern Omnicortex item into a guaranteed structured object.
 *
 * @param {object} item - Raw database document or form data
 * @returns {object} Normalized item with nested costs, modifiers, modifications, critical_details, and sockets
 */
export function normalizeOmnicortexItem(item) {
  if (!item || typeof item !== 'object') {
    return {
      costs: { bp: 0, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
      modifiers: [],
      modifications: [],
      critical_details: { score: '', effect: [], success_effect: [], failure_effect: [] },
      sockets: { max: 0, used: 0, tier: 'Socket', allocated: [] }
    };
  }

  const normalized = { ...item };

  // 1. Costs & Economy Consolidation
  const costs = { ...(item.costs || {}) };
  if (costs.bp === undefined) {
    costs.bp = parseNumeric(item.bp ?? item.cp ?? item.cp_cost ?? item.cost_cp ?? item.bp_chassis ?? item.cost_bp ?? item.cp_refund, 0);
  }
  if (costs.credits === undefined) {
    costs.credits = parseNumeric(item.credits ?? item.cost ?? item.price ?? item.cost_credits, 0);
  }
  if (costs.nodes === undefined) {
    costs.nodes = parseNumeric(item.node_cost ?? item.nodes, 0);
  }
  if (costs.sockets === undefined) {
    costs.sockets = parseNumeric(item.socket_cost ?? item.sockets_cost ?? item.sockets_used, 0);
  }
  if (costs.strain === undefined) {
    costs.strain = parseNumeric(item.cost_essence ?? item.essence_cost ?? item.strain_cost ?? item.strain, 0);
  }
  if (costs.focus === undefined) {
    costs.focus = parseNumeric(item.focus_cost ?? item.focus, 0);
  }
  if (costs.ap === undefined) {
    costs.ap = parseNumeric(item.ap_cost ?? item.ap, 0);
  }
  normalized.costs = costs;

  // 2. Modifiers Simplification
  const modifiers = Array.isArray(item.modifiers) ? [...item.modifiers] : [];
  
  // Migrate legacy inherent_attribute_modifiers
  if (Array.isArray(item.inherent_attribute_modifiers) && item.inherent_attribute_modifiers.length > 0) {
    item.inherent_attribute_modifiers.forEach(attrMod => {
      const target = typeof attrMod === 'object' ? (attrMod.attribute || attrMod.name || '') : String(attrMod).split(/[:+(]/)[0].trim();
      const val = typeof attrMod === 'object' ? (attrMod.bonus ?? attrMod.value ?? 1) : (parseInt(String(attrMod).replace(/[^0-9-]/g, ''), 10) || 1);
      if (target && !modifiers.some(m => m.type === 'attribute' && m.target?.toLowerCase() === target.toLowerCase() && m.mode === 'inherent')) {
        modifiers.push({ target, type: 'attribute', value: val, mode: 'inherent' });
      }
    });
  }

  // Migrate legacy bonus_attribute_points
  if (item.bonus_attribute_points && Number(item.bonus_attribute_points) > 0) {
    if (!modifiers.some(m => m.type === 'attribute' && m.mode === 'bonus_pool')) {
      modifiers.push({ target: 'Any Attribute', type: 'attribute', value: Number(item.bonus_attribute_points), mode: 'bonus_pool' });
    }
  }

  // Migrate legacy specific_skill_bonuses
  if (Array.isArray(item.specific_skill_bonuses) && item.specific_skill_bonuses.length > 0) {
    item.specific_skill_bonuses.forEach(skillBonus => {
      const target = typeof skillBonus === 'object' ? (skillBonus.skill || skillBonus.name || '') : String(skillBonus).split(/[:+(]/)[0].trim();
      const val = typeof skillBonus === 'object' ? (skillBonus.bonus ?? skillBonus.value ?? 1) : (parseInt(String(skillBonus).replace(/[^0-9-]/g, ''), 10) || 1);
      if (target && !modifiers.some(m => m.type === 'skill' && m.target?.toLowerCase() === target.toLowerCase() && m.mode === 'inherent')) {
        modifiers.push({ target, type: 'skill', value: val, mode: 'inherent' });
      }
    });
  }

  // Migrate legacy bonus_skills
  if (item.bonus_skills && Number(item.bonus_skills) > 0) {
    if (!modifiers.some(m => m.type === 'skill' && m.mode === 'bonus_pool')) {
      modifiers.push({ target: 'General Skill Pool', type: 'skill', value: Number(item.bonus_skills), mode: 'bonus_pool' });
    }
  }

  // Migrate legacy bonus_skill_choices
  if (Array.isArray(item.bonus_skill_choices) && item.bonus_skill_choices.length > 0) {
    item.bonus_skill_choices.forEach(sc => {
      const target = typeof sc === 'object' ? (sc.name || sc.id || '') : String(sc);
      if (target && !modifiers.some(m => m.type === 'skill' && m.target?.toLowerCase() === target.toLowerCase() && m.mode === 'choice_pool')) {
        modifiers.push({ target, type: 'skill', value: 1, mode: 'choice_pool' });
      }
    });
  }

  // Migrate legacy inherent_features
  if (Array.isArray(item.inherent_features) && item.inherent_features.length > 0) {
    item.inherent_features.forEach(feat => {
      const target = typeof feat === 'object' ? (feat.name || feat.id || '') : String(feat);
      if (target && !modifiers.some(m => m.type === 'feature' && m.target?.toLowerCase() === target.toLowerCase() && m.mode === 'inherent')) {
        modifiers.push({ target, type: 'feature', value: 1, mode: 'inherent' });
      }
    });
  }

  // Migrate legacy bonus_features
  if (item.bonus_features && Number(item.bonus_features) > 0) {
    if (!modifiers.some(m => m.type === 'feature' && m.mode === 'bonus_pool')) {
      modifiers.push({ target: 'General Feature Pool', type: 'feature', value: Number(item.bonus_features), mode: 'bonus_pool' });
    }
  }

  // Migrate legacy bonus_feature_choices
  if (Array.isArray(item.bonus_feature_choices) && item.bonus_feature_choices.length > 0) {
    item.bonus_feature_choices.forEach(fc => {
      const target = typeof fc === 'object' ? (fc.name || fc.id || '') : String(fc);
      if (target && !modifiers.some(m => m.type === 'feature' && m.target?.toLowerCase() === target.toLowerCase() && m.mode === 'choice_pool')) {
        modifiers.push({ target, type: 'feature', value: 1, mode: 'choice_pool' });
      }
    });
  }

  // Migrate legacy recommended_features
  if (Array.isArray(item.recommended_features) && item.recommended_features.length > 0) {
    item.recommended_features.forEach(rf => {
      const target = typeof rf === 'object' ? (rf.name || rf.id || '') : String(rf);
      if (target && !modifiers.some(m => m.type === 'feature' && m.target?.toLowerCase() === target.toLowerCase() && m.mode === 'recommended')) {
        modifiers.push({ target, type: 'feature', value: 1, mode: 'recommended' });
      }
    });
  }

  // Migrate legacy wealth_modifier
  if (item.wealth_modifier !== undefined && item.wealth_modifier !== null && Number(item.wealth_modifier) !== 0) {
    if (!modifiers.some(m => m.type === 'wealth')) {
      modifiers.push({ target: 'Wealth Score', type: 'wealth', value: Number(item.wealth_modifier), mode: 'inherent' });
    }
  }

  // Migrate legacy bonus_disciplines / bonus_special_abilities
  if (item.bonus_disciplines && Number(item.bonus_disciplines) > 0) {
    if (!modifiers.some(m => m.type === 'discipline' && m.mode === 'bonus_pool')) {
      modifiers.push({ target: 'Disciplines', type: 'discipline', value: Number(item.bonus_disciplines), mode: 'bonus_pool' });
    }
  }
  if (item.bonus_special_abilities && Number(item.bonus_special_abilities) > 0) {
    if (!modifiers.some(m => m.type === 'feature' && m.target === 'Special Abilities' && m.mode === 'bonus_pool')) {
      modifiers.push({ target: 'Special Abilities', type: 'feature', value: Number(item.bonus_special_abilities), mode: 'bonus_pool' });
    }
  }

  normalized.modifiers = modifiers;

  // 3. Modifications Consolidation (Upgrades, Downgrades, Modules)
  const modifications = Array.isArray(item.modifications) ? [...item.modifications] : [];

  if (Array.isArray(item.weapon_upgrades) && item.weapon_upgrades.length > 0) {
    item.weapon_upgrades.forEach(u => {
      const name = typeof u === 'object' ? (u.name || u.id || '') : String(u);
      if (name && !modifications.some(m => m.name?.toLowerCase() === name.toLowerCase())) {
        modifications.push(typeof u === 'object' ? { type: 'upgrade', ...u } : { name, type: 'upgrade' });
      }
    });
  }

  if (Array.isArray(item.weapon_downgrades) && item.weapon_downgrades.length > 0) {
    item.weapon_downgrades.forEach(d => {
      const name = typeof d === 'object' ? (d.name || d.id || '') : String(d);
      if (name && !modifications.some(m => m.name?.toLowerCase() === name.toLowerCase())) {
        modifications.push(typeof d === 'object' ? { type: 'downgrade', ...d } : { name, type: 'downgrade' });
      }
    });
  }

  if (Array.isArray(item.downgrades) && item.downgrades.length > 0) {
    item.downgrades.forEach(d => {
      const name = typeof d === 'object' ? (d.name || d.id || '') : String(d);
      if (name && !modifications.some(m => m.name?.toLowerCase() === name.toLowerCase())) {
        modifications.push(typeof d === 'object' ? { type: 'downgrade', ...d } : { name, type: 'downgrade' });
      }
    });
  }

  if (Array.isArray(item.armor_downgrades) && item.armor_downgrades.length > 0) {
    item.armor_downgrades.forEach(d => {
      const name = typeof d === 'object' ? (d.name || d.id || '') : String(d);
      if (name && !modifications.some(m => m.name?.toLowerCase() === name.toLowerCase())) {
        modifications.push(typeof d === 'object' ? { type: 'downgrade', ...d } : { name, type: 'downgrade' });
      }
    });
  }

  if (Array.isArray(item.modules) && item.modules.length > 0) {
    item.modules.forEach(mod => {
      const name = typeof mod === 'object' ? (mod.name || mod.id || '') : String(mod);
      if (name && !modifications.some(m => m.name?.toLowerCase() === name.toLowerCase())) {
        modifications.push(typeof mod === 'object' ? { type: 'module', ...mod } : { name, type: 'module' });
      }
    });
  }

  if (Array.isArray(item.installed_modules) && item.installed_modules.length > 0) {
    item.installed_modules.forEach(mod => {
      const name = typeof mod === 'object' ? (mod.name || mod.id || '') : String(mod);
      if (name && !modifications.some(m => m.name?.toLowerCase() === name.toLowerCase())) {
        modifications.push(typeof mod === 'object' ? { type: 'module', ...mod } : { name, type: 'module' });
      }
    });
  }

  normalized.modifications = modifications;

  // 4. Critical Details Consolidation
  const critical_details = { ...(item.critical_details || {}) };
  if (critical_details.score === undefined) {
    critical_details.score = item.critical_score || item.critical || '';
  }
  if (!critical_details.effect) {
    critical_details.effect = Array.isArray(item.critical_effect)
      ? item.critical_effect
      : (item.critical_effect ? [String(item.critical_effect)] : []);
  }
  if (!critical_details.success_effect) {
    critical_details.success_effect = Array.isArray(item.critical_success_effect)
      ? item.critical_success_effect
      : (item.critical_success_effect ? [String(item.critical_success_effect)] : []);
  }
  if (!critical_details.failure_effect) {
    critical_details.failure_effect = Array.isArray(item.critical_failure_effect)
      ? item.critical_failure_effect
      : (item.critical_failure_effect ? [String(item.critical_failure_effect)] : []);
  }
  normalized.critical_details = critical_details;

  // 5. Sockets & Allocation Grouping
  const sockets = { ...(item.sockets_config || item.sockets_group || item.sockets || {}) };
  if (typeof item.sockets === 'number') {
    sockets.max = item.sockets;
  }
  if (sockets.max === undefined) {
    sockets.max = parseNumeric(item.total_sockets ?? item.sockets ?? item.component_slots, 0);
  }
  if (sockets.used === undefined) {
    sockets.used = parseNumeric(item.sockets_used, 0);
  }
  if (!sockets.tier) {
    sockets.tier = item.udu_tier || item.socket_tier || 'Socket';
  }
  if (!Array.isArray(sockets.allocated)) {
    sockets.allocated = [];
  }
  normalized.sockets = sockets;

  // 6. Tech Level & Meta Level Normalization
  if (normalized.tech_level === undefined && (item.tl !== undefined || item.techLevel !== undefined)) {
    normalized.tech_level = parseNumeric(item.tech_level ?? item.tl ?? item.techLevel, 0);
  }
  if (normalized.meta_level === undefined && (item.ml !== undefined || item.metaLevel !== undefined)) {
    normalized.meta_level = parseNumeric(item.meta_level ?? item.ml ?? item.metaLevel, 0);
  }

  return normalized;
}

/**
 * Prepares a clean NoSQL document payload for Firestore or JSON storage,
 * keeping structured nested maps and omitting redundant legacy top-level keys.
 *
 * @param {object} formData - Form state from the modal or editor
 * @returns {object} Clean sanitized document payload
 */
export function exportOmnicortexItem(formData) {
  if (!formData || typeof formData !== 'object') return {};

  const normalized = normalizeOmnicortexItem(formData);
  const clean = { ...normalized };

  // Strip redundant legacy top-level keys to prevent query clutter
  const legacyKeysToRemove = [
    'tl',
    'ml',
    'techLevel',
    'metaLevel',
    'cp_cost',
    'cost_cp',
    'cost_credits',
    'node_cost',
    'socket_cost',
    'sockets_cost',
    'strain_cost',
    'focus_cost',
    'ap_cost',
    'inherent_attribute_modifiers',
    'bonus_attribute_points',
    'specific_skill_bonuses',
    'bonus_skills',
    'bonus_skill_choices',
    'inherent_features',
    'bonus_features',
    'bonus_feature_choices',
    'recommended_features',
    'wealth_modifier',
    'bonus_disciplines',
    'bonus_special_abilities',
    'weapon_downgrades',
    'weapon_upgrades',
    'armor_downgrades',
    'critical_score',
    'critical_effect',
    'critical_success_effect',
    'critical_failure_effect',
    'sockets_used',
    'total_sockets'
  ];

  legacyKeysToRemove.forEach(k => {
    delete clean[k];
  });

  return clean;
}

/**
 * Safe convenience getters with full fallback support for legacy records.
 */

export function getItemCosts(item) {
  if (!item) return { bp: 0, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 };
  if (item.costs && typeof item.costs === 'object') {
    return {
      bp: Number(item.costs.bp ?? item.cp ?? item.cp_cost ?? 0),
      credits: Number(item.costs.credits ?? item.cost ?? item.price ?? 0),
      nodes: Number(item.costs.nodes ?? item.node_cost ?? 0),
      sockets: Number(item.costs.sockets ?? item.socket_cost ?? 0),
      strain: Number(item.costs.strain ?? item.strain_cost ?? 0),
      focus: Number(item.costs.focus ?? item.focus_cost ?? 0),
      ap: Number(item.costs.ap ?? item.ap_cost ?? item.ap ?? 0)
    };
  }
  return {
    bp: parseNumeric(item.bp ?? item.cp ?? item.cp_cost ?? item.cost_cp, 0),
    credits: parseNumeric(item.cost ?? item.price ?? item.cost_credits, 0),
    nodes: parseNumeric(item.node_cost, 0),
    sockets: parseNumeric(item.socket_cost ?? item.sockets_used, 0),
    strain: parseNumeric(item.strain_cost ?? item.strain, 0),
    focus: parseNumeric(item.focus_cost ?? item.focus, 0),
    ap: parseNumeric(item.ap_cost ?? item.ap, 0)
  };
}

export function getItemModifiers(item) {
  if (!item) return [];
  if (Array.isArray(item.modifiers) && item.modifiers.length > 0) {
    return item.modifiers;
  }
  const normalized = normalizeOmnicortexItem(item);
  return normalized.modifiers || [];
}

export function getItemModifications(item) {
  if (!item) return [];
  if (Array.isArray(item.modifications) && item.modifications.length > 0) {
    return item.modifications;
  }
  const normalized = normalizeOmnicortexItem(item);
  return normalized.modifications || [];
}

export function getItemCriticalDetails(item) {
  if (!item) return { score: '', effect: [], success_effect: [], failure_effect: [] };
  if (item.critical_details && typeof item.critical_details === 'object') {
    return item.critical_details;
  }
  const normalized = normalizeOmnicortexItem(item);
  return normalized.critical_details;
}

export function getItemSockets(item) {
  if (!item) return { max: 0, used: 0, tier: 'Socket', allocated: [] };
  if (item.sockets && typeof item.sockets === 'object' && !Array.isArray(item.sockets)) {
    return item.sockets;
  }
  const normalized = normalizeOmnicortexItem(item);
  return normalized.sockets;
}

function parseNumeric(val, fallback = 0) {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const str = String(val).replace(/,/g, '').replace(/Cr/gi, '').replace(/\+/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}
