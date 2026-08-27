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

/**
 * Executes a canonical Rest Cycle on a character.
 * 
 * Rules applied:
 * - Full Rest: 6 to 8 hours. Restores 100% of max Vitality. Clears Exhaustion. Resets daily features. Resets daily Light Rests.
 * - Minimal Rest Species (Synthetics, Fae, Insect): A brief Light Rest provides Full Rest benefits.
 * - Light Rest: Max 4 per day. Takes 1h (Nap), 2h (Lounging), or 3h (Light Duty). Clears Exhaustion. Resets short-rest traits.
 * - Strenuous Activity: Each interruption worsens tier (Nap -> Lounging -> Light Duty -> Not Rested).
 * 
 * @param {object} params
 * @param {object} params.character - Character data
 * @param {string} [params.restType='light'] - 'light' | 'full'
 * @param {string} [params.activityTier='nap'] - 'nap' | 'lounging' | 'light_duty'
 * @param {number} [params.interruptions=0] - Strenuous interruptions count
 * @param {number} [params.currentLightRestsToday=0] - Rests already taken today
 * @param {boolean} [params.isSecondWind=false] - If triggered via Karma "Second Wind"
 * @returns {object} Rest execution result
 */
export function executeRestCycle({
  character = {},
  restType = 'light',
  activityTier = 'nap',
  interruptions = 0,
  currentLightRestsToday = 0,
  isSecondWind = false
} = {}) {
  const speciesProfile = getSpeciesRestProfile(character);
  const maxVitality = Math.max(30, parseInt(character.vitality || VITALITY_HEALTH_STRUCTURE_RULES.startingBaseVitality, 10));
  const currentVitality = parseInt(character.current_vitality !== undefined ? character.current_vitality : character.vitality || 30, 10);
  const currentHealth = parseInt(character.current_health !== undefined ? character.current_health : character.health || 30, 10);
  const maxHealth = Math.max(30, parseInt(character.health || 30, 10));

  // Handle Second Wind (Karma expenditure) — bypasses downtime, replaces Light Rest
  if (isSecondWind) {
    const missingVit = Math.max(0, maxVitality - currentVitality);
    const restoredVit = Math.ceil(missingVit * 0.5);
    const nextVit = Math.min(maxVitality, currentVitality + restoredVit);

    return {
      success: true,
      restType: 'second_wind',
      effectiveTier: 'second_wind',
      hoursSpent: 0,
      newVitality: nextVit,
      vitalityRestored: nextVit - currentVitality,
      newHealth: currentHealth,
      newLightRestsToday: currentLightRestsToday,
      clearedConditions: ['Exhausted'],
      resetFeatures: true,
      speciesProfile,
      logMessage: 'Second Wind executed (1 Karma + 1 min focus). Refreshed short-rest features and recovered Vitality without downtime.'
    };
  }

  // 1. FULL REST
  if (restType === 'full') {
    const newVitality = maxVitality;
    const vitalityRestored = Math.max(0, newVitality - currentVitality);

    return {
      success: true,
      restType: 'full',
      effectiveTier: 'full_rest',
      hoursSpent: 8,
      newVitality,
      vitalityRestored,
      newHealth: currentHealth,
      newLightRestsToday: 0, // Resets daily light rest count
      clearedConditions: ['Exhausted'],
      resetFeatures: true,
      speciesProfile,
      logMessage: `Full Rest completed (6–8 hours). 100% Vitality restored (+${vitalityRestored} Vit), Exhaustion cleared, all daily traits reset, daily rest count reset to 0.`
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

  // If species is Minimal Rest (Synthetic, Fae, Insect), a Light Rest fully refreshes like a Full Rest!
  let newVitality = currentVitality;
  let vitalityRestored = 0;

  if (speciesProfile.lightRestCountsAsFull) {
    newVitality = maxVitality;
    vitalityRestored = Math.max(0, newVitality - currentVitality);
  } else {
    // Standard or Meditative Light Rest restoration
    const missingVit = Math.max(0, maxVitality - currentVitality);
    let fraction = 0.5;
    if (degradation.effectiveTier === 'lounging') fraction = 0.4;
    else if (degradation.effectiveTier === 'light_duty') fraction = 0.3;

    const restoredAmount = Math.max(1, Math.ceil(missingVit * fraction));
    newVitality = Math.min(maxVitality, currentVitality + (missingVit > 0 ? restoredAmount : 0));
    vitalityRestored = Math.max(0, newVitality - currentVitality);
  }

  const nextRestsToday = Math.min(REST_SYSTEM_RULES.LIGHT_REST.maxPerDay, restsToday + 1);

  let message = `Light Rest (${degradation.name}, ${degradation.durationHours}h) completed.`;
  if (speciesProfile.lightRestCountsAsFull) {
    message += ` Physiological adaptation (${speciesProfile.subType}): Light Rest fully refreshes energy (+${vitalityRestored} Vit restored).`;
  } else if (speciesProfile.category === 'meditative') {
    message += ` Meditative reflection (${speciesProfile.subType}): Mind and body recharged (+${vitalityRestored} Vit restored).`;
  } else {
    message += ` Recovered +${vitalityRestored} Vitality.`;
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
    newHealth: currentHealth,
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
