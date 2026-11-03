// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — REST & RECOVERY CALCULATION ENGINE
// Pure calculation helpers for Full Rest, Light Rest tiers,
// species physiology profiles, and strenuous activity degradation.
// ═══════════════════════════════════════════════════════════

import { REST_SYSTEM_RULES, VITALITY_HEALTH_STRUCTURE_RULES } from './tangentConstants.js';

/**
 * Evaluates a character's species and classification to determine their canonical rest profile.
 * 
 * - Minimal Rest (Synthetics, Fae, Insect/Kitin): Function without traditional sleep;
 *   a brief period of Light Rest is sufficient to fully refresh and maintain energy levels.
 * - Meditative Rest (Alterians, Mondi): Do not sleep; engage in meditations throughout
 *   the day as Light Rest, entering deep contemplation and reflection to recharge.
 * - Standard Biological (Most sentient species): 6 to 8 hour sleep cycle required.
 * 
 * @param {object|string} characterOrSpecies - Character object or species name string
 * @returns {object} Species rest profile
 */
export function getSpeciesRestProfile(characterOrSpecies) {
  let speciesStr = '';
  let archetypeStr = '';

  if (typeof characterOrSpecies === 'string') {
    speciesStr = characterOrSpecies.toLowerCase();
  } else if (characterOrSpecies && typeof characterOrSpecies === 'object') {
    speciesStr = String(characterOrSpecies['char-species'] || characterOrSpecies.species || characterOrSpecies.name || '').toLowerCase();
    archetypeStr = String(characterOrSpecies['char-archetype'] || characterOrSpecies.archetype || '').toLowerCase();
    if (characterOrSpecies.parent_species) {
      speciesStr += ' ' + String(characterOrSpecies.parent_species).toLowerCase();
    }
  }

  const { minimalRest, meditative } = REST_SYSTEM_RULES.FULL_REST.speciesExceptions;

  // 1. Check for Minimal Rest species (Synthetics, Fae, Insect/Kitin)
  const isMinimalRest = minimalRest.keywords.some(k => speciesStr.includes(k) || archetypeStr.includes(k));
  if (isMinimalRest) {
    let subType = 'Synthetic / Construct';
    if (speciesStr.includes('fae') || speciesStr.includes('fey') || speciesStr.includes('asi')) {
      subType = 'Fae / Feyborn';
    } else if (speciesStr.includes('kitin') || speciesStr.includes('insect') || speciesStr.includes('maantene') || speciesStr.includes('manelli') || speciesStr.includes('rakne') || speciesStr.includes('riezen')) {
      subType = 'Insect / Kitin Hive';
    }

    return {
      category: 'minimal_rest',
      subType,
      requiresSleep: false,
      lightRestCountsAsFull: true,
      badgeLabel: `${subType} (Minimal Rest)`,
      badgeColor: 'emerald',
      summary: minimalRest.summary,
      description: minimalRest.description,
      standardSleepHours: 'None (Brief Light Rest provides full refresh)'
    };
  }

  // 2. Check for Meditative species (Alterians, Mondi)
  const isMeditative = meditative.keywords.some(k => speciesStr.includes(k) || archetypeStr.includes(k));
  if (isMeditative) {
    const subType = speciesStr.includes('mondi') ? 'Mondi' : 'Alterian';
    return {
      category: 'meditative',
      subType,
      requiresSleep: false,
      lightRestCountsAsFull: false,
      meditativeLightRest: true,
      badgeLabel: `${subType} (Contemplative Meditation)`,
      badgeColor: 'purple',
      summary: meditative.summary,
      description: meditative.description,
      standardSleepHours: 'None (Engages in daily contemplative meditations)'
    };
  }

  // 3. Standard Sentient Species (6 to 8 hours sleep cycle)
  return {
    category: 'standard_biological',
    subType: 'Standard Biological',
    requiresSleep: true,
    lightRestCountsAsFull: false,
    badgeLabel: 'Sentient Sleep Cycle (6–8h)',
    badgeColor: 'cyan',
    summary: 'Standard Sentient Sleep Cycle (6 to 8 hours)',
    description: REST_SYSTEM_RULES.FULL_REST.description,
    standardSleepHours: '6 to 8 Hours'
  };
}

/**
 * Calculates the resulting Light Rest tier after strenuous interruptions.
 * 
 * Degradation sequence:
 * Nap (1h) ➔ Lounging (2h) ➔ Light Duty (3h) ➔ Not Rested (Ruined)
 * 
 * @param {string} startingTier - 'nap' | 'lounging' | 'light_duty'
 * @param {number} strenuousInterruptions - Number of strenuous activities performed
 * @returns {object} Degraded rest state
 */
export function calculateRestDegradation(startingTier = 'nap', strenuousInterruptions = 0) {
  const sequence = REST_SYSTEM_RULES.LIGHT_REST.degradationSequence;
  const startIdx = sequence.indexOf(startingTier.toLowerCase());
  const validStartIdx = startIdx >= 0 && startIdx < 3 ? startIdx : 0;
  
  const count = Math.max(0, parseInt(strenuousInterruptions, 10) || 0);
  const targetIdx = Math.min(sequence.length - 1, validStartIdx + count);
  const effectiveTier = sequence[targetIdx];

  const isCancelled = effectiveTier === 'not_rested';
  const tierConfig = !isCancelled ? REST_SYSTEM_RULES.LIGHT_REST.tiers[effectiveTier] : null;

  return {
    startingTier: sequence[validStartIdx],
    effectiveTier,
    isCancelled,
    strenuousInterruptions: count,
    degradedSteps: targetIdx - validStartIdx,
    durationHours: isCancelled ? 0 : tierConfig.durationHours,
    quality: isCancelled ? 'Not Rested (Failed)' : tierConfig.quality,
    name: isCancelled ? 'Not Rested (Interrupted / Ruined)' : tierConfig.name,
    allowedActivities: isCancelled ? 'Rest ruined by physical or mental exertion' : tierConfig.allowedActivities
  };
}

function resolveCharacterStaminaMod(character = {}, explicitStaminaMod = undefined) {
  if (explicitStaminaMod !== undefined && explicitStaminaMod !== null && !Number.isNaN(Number(explicitStaminaMod))) {
    return Number(explicitStaminaMod);
  }
  const baseSta = Number(
    character['attr-stamina'] ??
    character.stamina ??
    character.attributes?.sta ??
    character.attributes?.con ??
    0
  ) || 0;
  const modSta = Number(character['attr-stamina-mod'] ?? 0) || 0;
  return baseSta + modSta;
}

function resolveCharacterKeyAttributeMod(character = {}, explicitKeyMod = undefined) {
  if (explicitKeyMod !== undefined && explicitKeyMod !== null && !Number.isNaN(Number(explicitKeyMod))) {
    return Number(explicitKeyMod);
  }
  const intVal = (Number(character['attr-intellect'] ?? character.intellect ?? character.attributes?.int ?? 0) || 0) + (Number(character['attr-intellect-mod'] ?? 0) || 0);
  const wisVal = (Number(character['attr-wisdom'] ?? character.wisdom ?? character.attributes?.wis ?? 0) || 0) + (Number(character['attr-wisdom-mod'] ?? 0) || 0);
  const chaVal = (Number(character['attr-charisma'] ?? character.charisma ?? character.attributes?.cha ?? 0) || 0) + (Number(character['attr-charisma-mod'] ?? 0) || 0);
  return Math.max(intVal, wisVal, chaVal);
}

function characterHasFastHeal(character = {}) {
  const pools = [
    ...(Array.isArray(character.traits) ? character.traits : []),
    ...(Array.isArray(character.features) ? character.features : [])
  ];
  return pools.some(entry => {
    const label = typeof entry === 'object' ? String(entry.name || entry.title || entry.id || '') : String(entry || '');
    return label.toLowerCase().includes('fast heal');
  });
}

/**
 * Executes a canonical Rest Cycle on a character per 3.00 COMBAT.md & 4.00 METAPHYSICS.md.
 * 
 * Rules applied:
 * - Full Rest: 6 to 8 hours. Restores 100% Vitality, (5 + Stamina Mod, min 1) Health (2x with Medical Care or Fast Heal), and 100% Essence. Clears Exhaustion. Resets daily Light Rests.
 * - Minimal Rest Species (Synthetics, Fae, Insect): A brief Light Rest provides Full Rest benefits.
 * - Light Rest: Max 4 per day (1h Nap, 2h Lounging, 3h Light Duty). Restores (10 + Stamina Mod, min 5) Vitality and (Key Attribute Mod, min 1) Essence. Clears Exhaustion.
 * - Second Wind (1 Karma + 1 min): Grants immediate Light Rest recovery without downtime or consuming daily Light Rest slots.
 * - Strenuous Activity: Each interruption worsens tier (Nap -> Lounging -> Light Duty -> Not Rested).
 * 
 * @param {object} params
 * @param {object} params.character - Character data
 * @param {string} [params.restType='light'] - 'light' | 'full'
 * @param {string} [params.activityTier='nap'] - 'nap' | 'lounging' | 'light_duty'
 * @param {number} [params.interruptions=0] - Strenuous interruptions count
 * @param {number} [params.currentLightRestsToday=0] - Rests already taken today
 * @param {boolean} [params.isSecondWind=false] - If triggered via Karma "Second Wind"
 * @param {boolean} [params.hasMedicalCare=false] - Whether treated with CR 15 Medicine / Medical Bay
 * @param {boolean} [params.hasFastHeal=false] - Explicit override for Fast Heal trait
 * @param {number} [params.staminaMod] - Optional explicit Stamina modifier override
 * @param {number} [params.keyAttributeMod] - Optional explicit Key Metaphysics Attribute modifier override
 * @returns {object} Rest execution result
 */
export function executeRestCycle({
  character = {},
  restType = 'light',
  activityTier = 'nap',
  interruptions = 0,
  currentLightRestsToday = 0,
  isSecondWind = false,
  hasMedicalCare = false,
  hasFastHeal = false,
  staminaMod = undefined,
  keyAttributeMod = undefined
} = {}) {
  const speciesProfile = getSpeciesRestProfile(character);
  const maxVitality = Math.max(1, parseInt(character.vitality || VITALITY_HEALTH_STRUCTURE_RULES.startingBaseVitality, 10));
  const currentVitality = parseInt(character.current_vitality !== undefined ? character.current_vitality : maxVitality, 10);
  const maxHealth = Math.max(1, parseInt(character.health || VITALITY_HEALTH_STRUCTURE_RULES.startingBaseHealth, 10));
  const currentHealth = parseInt(character.current_health !== undefined ? character.current_health : maxHealth, 10);

  const rawMaxEssence = parseInt(character.max_essence ?? character.essence ?? 0, 10) || 0;
  const maxEssence = Math.max(0, rawMaxEssence);
  const currentEssence = character.current_essence !== undefined
    ? parseInt(character.current_essence, 10) || 0
    : maxEssence;

  const staMod = resolveCharacterStaminaMod(character, staminaMod);
  const keyMod = resolveCharacterKeyAttributeMod(character, keyAttributeMod);
  const doubledHealthRecovery = Boolean(hasMedicalCare || hasFastHeal || characterHasFastHeal(character));

  const lightVitalityGain = Math.max(5, 10 + staMod);
  const lightEssenceGain = Math.max(1, keyMod);
  const fullHealthGain = Math.max(1, 5 + staMod) * (doubledHealthRecovery ? 2 : 1);

  // Handle Second Wind (1 Karma + 1 min) — grants immediate Light Rest recovery without downtime
  if (isSecondWind) {
    const nextVit = Math.min(maxVitality, currentVitality + lightVitalityGain);
    const nextEssence = maxEssence > 0 ? Math.min(maxEssence, Math.max(0, currentEssence) + lightEssenceGain) : currentEssence;
    const essenceRestored = maxEssence > 0 ? Math.max(0, nextEssence - currentEssence) : 0;

    return {
      success: true,
      restType: 'second_wind',
      effectiveTier: 'second_wind',
      hoursSpent: 0,
      newVitality: nextVit,
      vitalityRestored: Math.max(0, nextVit - currentVitality),
      newHealth: currentHealth,
      healthRestored: 0,
      newEssence: nextEssence,
      essenceRestored,
      newLightRestsToday: currentLightRestsToday,
      clearedConditions: ['Exhausted'],
      resetFeatures: true,
      speciesProfile,
      logMessage: `Second Wind executed (1 Karma + 1 min focus). Recovered +${Math.max(0, nextVit - currentVitality)} Vitality${maxEssence > 0 ? `, +${essenceRestored} Essence` : ''}, cleared Exhaustion, and refreshed short-rest features without downtime.`
    };
  }

  // 1. FULL REST
  if (restType === 'full') {
    const newVitality = maxVitality;
    const vitalityRestored = Math.max(0, newVitality - currentVitality);
    const newHealth = Math.min(maxHealth, currentHealth + fullHealthGain);
    const healthRestored = Math.max(0, newHealth - currentHealth);
    const newEssence = maxEssence > 0 ? maxEssence : currentEssence;
    const essenceRestored = maxEssence > 0 ? Math.max(0, newEssence - currentEssence) : 0;

    return {
      success: true,
      restType: 'full',
      effectiveTier: 'full_rest',
      hoursSpent: 8,
      newVitality,
      vitalityRestored,
      newHealth,
      healthRestored,
      newEssence,
      essenceRestored,
      doubledHealthRecovery,
      newLightRestsToday: 0, // Resets daily light rest count
      clearedConditions: ['Exhausted'],
      resetFeatures: true,
      speciesProfile,
      logMessage: `Full Rest completed (6–8 hours). 100% Vitality restored (+${vitalityRestored} Vit), +${healthRestored} Health recovered${doubledHealthRecovery ? ' (2x Medical/Fast Heal)' : ''}${maxEssence > 0 ? `, 100% Essence restored (+${essenceRestored})` : ''}, Exhaustion cleared, daily rest count reset to 0.`
    };
  }

  // 2. LIGHT REST
  const restsToday = Math.max(0, parseInt(currentLightRestsToday, 10) || 0);
  if (restsToday >= REST_SYSTEM_RULES.LIGHT_REST.maxPerDay) {
    return {
      success: false,
      error: `Maximum Light Rests reached for today (${REST_SYSTEM_RULES.LIGHT_REST.maxPerDay}/${REST_SYSTEM_RULES.LIGHT_REST.maxPerDay}). A Full Rest or new day cycle is required.`,
      currentLightRestsToday: restsToday,
      speciesProfile
    };
  }

  // Calculate degradation from interruptions
  const degradation = calculateRestDegradation(activityTier, interruptions);
  if (degradation.isCancelled) {
    return {
      success: false,
      error: 'Rest cancelled: Strenuous activities (physical labor, intense exercise, or mental exertion) completely ruined the rest period.',
      effectiveTier: 'not_rested',
      currentLightRestsToday: restsToday,
      speciesProfile
    };
  }

  // Minimal Rest species (Synthetic, Fae, Insect) gain Full Rest benefits from a Light Rest
  let newVitality = currentVitality;
  let vitalityRestored = 0;
  let newHealth = currentHealth;
  let healthRestored = 0;
  let newEssence = currentEssence;
  let essenceRestored = 0;

  if (speciesProfile.lightRestCountsAsFull) {
    newVitality = maxVitality;
    vitalityRestored = Math.max(0, newVitality - currentVitality);
    newHealth = Math.min(maxHealth, currentHealth + fullHealthGain);
    healthRestored = Math.max(0, newHealth - currentHealth);
    newEssence = maxEssence > 0 ? maxEssence : currentEssence;
    essenceRestored = maxEssence > 0 ? Math.max(0, newEssence - currentEssence) : 0;
  } else {
    // Canonical Light Rest restoration: (10 + Stamina Mod, min 5) Vitality & (Key Attribute Mod, min 1) Essence
    newVitality = Math.min(maxVitality, currentVitality + lightVitalityGain);
    vitalityRestored = Math.max(0, newVitality - currentVitality);
    if (maxEssence > 0) {
      newEssence = Math.min(maxEssence, Math.max(0, currentEssence) + lightEssenceGain);
      essenceRestored = Math.max(0, newEssence - currentEssence);
    }
  }

  const nextRestsToday = Math.min(REST_SYSTEM_RULES.LIGHT_REST.maxPerDay, restsToday + 1);

  let message = `Light Rest (${degradation.name}, ${degradation.durationHours}h) completed.`;
  if (speciesProfile.lightRestCountsAsFull) {
    message += ` Physiological adaptation (${speciesProfile.subType}): Light Rest fully refreshes energy (+${vitalityRestored} Vit${healthRestored > 0 ? `, +${healthRestored} Health` : ''}).`;
  } else if (speciesProfile.category === 'meditative') {
    message += ` Meditative reflection (${speciesProfile.subType}): Mind and body recharged (+${vitalityRestored} Vit${essenceRestored > 0 ? `, +${essenceRestored} Essence` : ''}).`;
  } else {
    message += ` Recovered +${vitalityRestored} Vitality${essenceRestored > 0 ? `, +${essenceRestored} Essence` : ''}.`;
  }
  if (degradation.degradedSteps > 0) {
    message += ` (Degraded by ${degradation.degradedSteps} step(s) due to strenuous interruptions).`;
  }

  return {
    success: true,
    restType: 'light',
    effectiveTier: degradation.effectiveTier,
    hoursSpent: degradation.durationHours,
    newVitality,
    vitalityRestored,
    newHealth,
    healthRestored,
    newEssence,
    essenceRestored,
    newLightRestsToday: nextRestsToday,
    clearedConditions: ['Exhausted'],
    resetFeatures: true,
    degradation,
    speciesProfile,
    logMessage: message
  };
}

/**
 * Resets daily rests count for a new adventuring day.
 * 
 * @returns {object} New day reset state
 */
export function resetDailyRests() {
  return {
    lightRestsToday: 0,
    resetTime: new Date().toISOString(),
    logMessage: 'Daily rest counter reset to 0/4 for the new day.'
  };
}
