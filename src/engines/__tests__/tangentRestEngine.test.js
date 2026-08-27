import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  getSpeciesRestProfile,
  calculateRestDegradation,
  executeRestCycle,
  resetDailyRests
} from '../tangentRestEngine.js';

import {
  REST_SYSTEM_RULES
} from '../tangentConstants.js';

describe('Tangent SF RP — Canonical REST & Recovery Rules Engine', () => {

  describe('Species Physiology Rest Profiles', () => {
    it('categorizes standard biological sentient species into 6-8 hour sleep cycle', () => {
      const human = getSpeciesRestProfile({ 'char-species': 'Terran Human' });
      assert.strictEqual(human.category, 'standard_biological');
      assert.strictEqual(human.requiresSleep, true);
      assert.strictEqual(human.lightRestCountsAsFull, false);
      assert.strictEqual(human.standardSleepHours, '6 to 8 Hours');

      const caprian = getSpeciesRestProfile('Caprian');
      assert.strictEqual(caprian.category, 'standard_biological');
      assert.strictEqual(caprian.requiresSleep, true);
    });

    it('categorizes Synthetics as minimal rest where Light Rest counts as Full Rest', () => {
      const android = getSpeciesRestProfile({ 'char-species': 'Android', 'char-archetype': 'Synthetic Humanoid' });
      assert.strictEqual(android.category, 'minimal_rest');
      assert.strictEqual(android.requiresSleep, false);
      assert.strictEqual(android.lightRestCountsAsFull, true);
      assert.strictEqual(android.badgeColor, 'emerald');

      const mekan = getSpeciesRestProfile('Mekan Assimilation Unit');
      assert.strictEqual(mekan.category, 'minimal_rest');
      assert.strictEqual(mekan.lightRestCountsAsFull, true);
    });

    it('categorizes Fae and Fey species as minimal rest where Light Rest counts as Full Rest', () => {
      const fey = getSpeciesRestProfile({ 'char-species': 'Fey (Base)', parent_species: 'Asi' });
      assert.strictEqual(fey.category, 'minimal_rest');
      assert.strictEqual(fey.subType, 'Fae / Feyborn');
      assert.strictEqual(fey.requiresSleep, false);
      assert.strictEqual(fey.lightRestCountsAsFull, true);
    });

    it('categorizes Insect and Kitin species as minimal rest where Light Rest counts as Full Rest', () => {
      const kitin = getSpeciesRestProfile({ 'char-species': 'Maantene (Kitin Leaper)', parent_species: 'Kitin' });
      assert.strictEqual(kitin.category, 'minimal_rest');
      assert.strictEqual(kitin.subType, 'Insect / Kitin Hive');
      assert.strictEqual(kitin.requiresSleep, false);
      assert.strictEqual(kitin.lightRestCountsAsFull, true);
    });

    it('categorizes Alterians and Mondi as contemplative meditation species', () => {
      const alterian = getSpeciesRestProfile({ 'char-species': 'Alterian', 'char-archetype': 'Psionic Adept' });
      assert.strictEqual(alterian.category, 'meditative');
      assert.strictEqual(alterian.requiresSleep, false);
      assert.strictEqual(alterian.meditativeLightRest, true);
      assert.strictEqual(alterian.badgeColor, 'purple');

      const mondi = getSpeciesRestProfile('Mondi Xenotype');
      assert.strictEqual(mondi.category, 'meditative');
      assert.strictEqual(mondi.subType, 'Mondi');
      assert.strictEqual(mondi.meditativeLightRest, true);
    });
  });

  describe('Strenuous Activity Degradation Stepper', () => {
    it('keeps original tier when zero strenuous interruptions occur', () => {
      const nap = calculateRestDegradation('nap', 0);
      assert.strictEqual(nap.effectiveTier, 'nap');
      assert.strictEqual(nap.durationHours, 1);
      assert.strictEqual(nap.isCancelled, false);
      assert.strictEqual(nap.degradedSteps, 0);

      const lounging = calculateRestDegradation('lounging', 0);
      assert.strictEqual(lounging.effectiveTier, 'lounging');
      assert.strictEqual(lounging.durationHours, 2);

      const lightDuty = calculateRestDegradation('light_duty', 0);
      assert.strictEqual(lightDuty.effectiveTier, 'light_duty');
      assert.strictEqual(lightDuty.durationHours, 3);
    });

    it('degrades Nap (1h) to Lounging (2h) on 1 strenuous interruption', () => {
      const result = calculateRestDegradation('nap', 1);
      assert.strictEqual(result.effectiveTier, 'lounging');
      assert.strictEqual(result.durationHours, 2);
      assert.strictEqual(result.degradedSteps, 1);
      assert.strictEqual(result.isCancelled, false);
    });

    it('degrades Nap (1h) to Light Duty (3h) on 2 strenuous interruptions', () => {
      const result = calculateRestDegradation('nap', 2);
      assert.strictEqual(result.effectiveTier, 'light_duty');
      assert.strictEqual(result.durationHours, 3);
      assert.strictEqual(result.degradedSteps, 2);
      assert.strictEqual(result.isCancelled, false);
    });

    it('cancels rest entirely (Not Rested) on 3 strenuous interruptions starting from Nap', () => {
      const result = calculateRestDegradation('nap', 3);
      assert.strictEqual(result.effectiveTier, 'not_rested');
      assert.strictEqual(result.isCancelled, true);
      assert.strictEqual(result.durationHours, 0);
    });

    it('cancels rest from Lounging on 2 interruptions', () => {
      const result = calculateRestDegradation('lounging', 2);
      assert.strictEqual(result.effectiveTier, 'not_rested');
      assert.strictEqual(result.isCancelled, true);
    });

    it('cancels rest from Light Duty on 1 interruption', () => {
      const result = calculateRestDegradation('light_duty', 1);
      assert.strictEqual(result.effectiveTier, 'not_rested');
      assert.strictEqual(result.isCancelled, true);
    });
  });

  describe('Full Rest Execution', () => {
    it('restores 100% of maximum Vitality and clears Exhaustion', () => {
      const character = {
        'char-species': 'Terran Human',
        vitality: 40,
        current_vitality: 10,
        health: 30,
        current_health: 25
      };

      const result = executeRestCycle({
        character,
        restType: 'full'
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.restType, 'full');
      assert.strictEqual(result.newVitality, 40); // 100% of max 40
      assert.strictEqual(result.vitalityRestored, 30);
      assert.strictEqual(result.newLightRestsToday, 0); // Resets daily light rest count
      assert.strictEqual(result.clearedConditions.includes('Exhausted'), true);
      assert.strictEqual(result.resetFeatures, true);
    });
  });

  describe('Light Rest Execution for Minimal Rest Species (Synthetics, Fae, Insects)', () => {
    it('grants full Vitality refresh like a Full Rest for Synthetics during Light Rest', () => {
      const synthetic = {
        'char-species': 'Android',
        vitality: 50,
        current_vitality: 15,
        health: 30
      };

      const result = executeRestCycle({
        character: synthetic,
        restType: 'light',
        activityTier: 'nap',
        interruptions: 0,
        currentLightRestsToday: 1
      });

      assert.strictEqual(result.success, true);
      // For minimal rest species, Light Rest fully refreshes to 100% max Vitality
      assert.strictEqual(result.newVitality, 50);
      assert.strictEqual(result.vitalityRestored, 35);
      assert.strictEqual(result.newLightRestsToday, 2);
      assert.strictEqual(result.speciesProfile.lightRestCountsAsFull, true);
    });

    it('grants full Vitality refresh like a Full Rest for Fae during Light Rest', () => {
      const fae = {
        'char-species': 'Fey (Base)',
        vitality: 40,
        current_vitality: 10
      };

      const result = executeRestCycle({
        character: fae,
        restType: 'light',
        activityTier: 'nap'
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.newVitality, 40);
      assert.strictEqual(result.vitalityRestored, 30);
    });

    it('grants full Vitality refresh for Kitin (Insect) species during Light Rest', () => {
      const kitin = {
        'char-species': 'Maantene (Kitin Leaper)',
        vitality: 45,
        current_vitality: 5
      };

      const result = executeRestCycle({
        character: kitin,
        restType: 'light',
        activityTier: 'nap'
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.newVitality, 45);
      assert.strictEqual(result.vitalityRestored, 40);
    });
  });

  describe('Light Rest Execution for Standard & Meditative Species', () => {
    it('restores 50% of missing Vitality on Nap (1h) for standard biological species', () => {
      const human = {
        'char-species': 'Terran Human',
        vitality: 40,
        current_vitality: 20 // 20 missing
      };

      const result = executeRestCycle({
        character: human,
        restType: 'light',
        activityTier: 'nap',
        interruptions: 0,
        currentLightRestsToday: 0
      });

      assert.strictEqual(result.success, true);
      // Missing 20 * 0.5 = +10 restored -> 30
      assert.strictEqual(result.vitalityRestored, 10);
      assert.strictEqual(result.newVitality, 30);
      assert.strictEqual(result.newLightRestsToday, 1);
      assert.strictEqual(result.clearedConditions.includes('Exhausted'), true);
    });

    it('restores 40% of missing Vitality on Lounging (2h)', () => {
      const human = {
        'char-species': 'Terran Human',
        vitality: 40,
        current_vitality: 20 // 20 missing
      };

      const result = executeRestCycle({
        character: human,
        restType: 'light',
        activityTier: 'lounging'
      });

      assert.strictEqual(result.success, true);
      // Missing 20 * 0.4 = +8 restored -> 28
      assert.strictEqual(result.vitalityRestored, 8);
      assert.strictEqual(result.newVitality, 28);
      assert.strictEqual(result.hoursSpent, 2);
    });

    it('restores 30% of missing Vitality on Light Duty (3h)', () => {
      const human = {
        'char-species': 'Terran Human',
        vitality: 40,
        current_vitality: 20 // 20 missing
      };

      const result = executeRestCycle({
        character: human,
        restType: 'light',
        activityTier: 'light_duty'
      });

      assert.strictEqual(result.success, true);
      // Missing 20 * 0.3 = +6 restored -> 26
      assert.strictEqual(result.vitalityRestored, 6);
      assert.strictEqual(result.newVitality, 26);
      assert.strictEqual(result.hoursSpent, 3);
    });
  });

  describe('Daily Light Rest Limit (Max 4 Per Day)', () => {
    it('allows up to 4 light rests per day', () => {
      const human = { 'char-species': 'Terran Human', vitality: 40, current_vitality: 35 };

      // 4th rest (3 already used)
      const result = executeRestCycle({
        character: human,
        restType: 'light',
        currentLightRestsToday: 3
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.newLightRestsToday, 4);
    });

    it('rejects a 5th light rest when limit of 4 is already reached', () => {
      const human = { 'char-species': 'Terran Human', vitality: 40, current_vitality: 35 };

      const result = executeRestCycle({
        character: human,
        restType: 'light',
        currentLightRestsToday: 4
      });

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error.includes('Maximum Light Rests reached'), true);
    });

    it('resets daily rest counter to 0 upon calling resetDailyRests', () => {
      const reset = resetDailyRests();
      assert.strictEqual(reset.lightRestsToday, 0);
    });
  });

  describe('Second Wind (Karma Integration)', () => {
    it('executes Second Wind bypassing downtime and replacing Light Rest', () => {
      const human = { 'char-species': 'Terran Human', vitality: 40, current_vitality: 20 };

      const result = executeRestCycle({
        character: human,
        isSecondWind: true,
        currentLightRestsToday: 2
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.restType, 'second_wind');
      assert.strictEqual(result.hoursSpent, 0);
      assert.strictEqual(result.newVitality, 30); // 50% of missing 20
      assert.strictEqual(result.newLightRestsToday, 2); // Does not consume daily light rest slot
      assert.strictEqual(result.clearedConditions.includes('Exhausted'), true);
    });
  });

  describe('Canon Constant Verification', () => {
    it('exports official REST_SYSTEM_RULES with all specifications', () => {
      assert.ok(REST_SYSTEM_RULES.FULL_REST);
      assert.strictEqual(REST_SYSTEM_RULES.FULL_REST.standardHoursMin, 6);
      assert.strictEqual(REST_SYSTEM_RULES.FULL_REST.standardHoursMax, 8);
      assert.ok(REST_SYSTEM_RULES.LIGHT_REST);
      assert.strictEqual(REST_SYSTEM_RULES.LIGHT_REST.maxPerDay, 4);
      assert.strictEqual(REST_SYSTEM_RULES.LIGHT_REST.tiers.nap.durationHours, 1);
      assert.strictEqual(REST_SYSTEM_RULES.LIGHT_REST.tiers.lounging.durationHours, 2);
      assert.strictEqual(REST_SYSTEM_RULES.LIGHT_REST.tiers.light_duty.durationHours, 3);
      assert.deepStrictEqual(REST_SYSTEM_RULES.LIGHT_REST.degradationSequence, ['nap', 'lounging', 'light_duty', 'not_rested']);
    });
  });

});
