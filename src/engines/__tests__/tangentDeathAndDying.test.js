import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyDamageToEntity,
  calculateDeathClock,
  checkMassiveDamage,
  stabilizeEntity,
  advanceDeathClock,
  revivifyEntity
} from '../tangentEntityEngines.js';
import { DEATH_AND_DYING_RULES } from '../tangentConstants.js';

describe('Tangent Death & Dying Canonical Mechanics', () => {
  it('1. Nonlethal damage is absorbed by Vitality first; excess spills into Health', () => {
    const result = applyDamageToEntity({
      currentVitality: 20,
      currentHealth: 30,
      incomingDamage: 25,
      isNonLethal: true,
      toughness: 0
    });

    assert.equal(result.newVitality, 0, 'Vitality should be fully depleted');
    assert.equal(result.newHealth, 25, 'Excess 5 damage should spill over into Health');
    assert.equal(result.spillover, 5);
    assert.equal(result.isAtDeathsDoor, false);
    assert.equal(result.incapacitated, false);
  });

  it('2. Vitality-first routing & Bleed/Overchannel direct-to-Health bypass', () => {
    // Standard damage depletes Vitality first before Health
    const standardResult = applyDamageToEntity({
      currentHealth: 10,
      currentVitality: 25,
      incomingDamage: 30,
      isNonLethal: false,
      toughness: 0
    });

    assert.equal(standardResult.newVitality, 0, 'Vitality should be depleted first');
    assert.equal(standardResult.newHealth, 5, 'Remaining 5 damage spills into Health');
    assert.equal(standardResult.incapacitated, false);

    // Bleed / Overchannel Burn bypasses Vitality directly to Health
    const bleedResult = applyDamageToEntity({
      currentHealth: 10,
      currentVitality: 25,
      incomingDamage: 16,
      bypassVitality: true,
      damageType: 'bleed',
      toughness: 4,
      armorDR: 5
    });

    assert.equal(bleedResult.newHealth, 0, 'Direct Health damage reduces Health to 0');
    assert.equal(bleedResult.newVitality, 25, 'Bleed bypasses Vitality completely');
    assert.equal(bleedResult.excessToStability, 6, 'Excess 6 damage beyond 0 Health tracks overflow past 0 Health');
    assert.equal(bleedResult.incapacitated, true, 'Character at 0 Health must be Incapacitated');
    assert.equal(bleedResult.unconscious, true, 'Character at 0 Health must be Unconscious');
    assert.equal(bleedResult.prone, true, 'Character at 0 Health must fall Prone');
    assert.equal(bleedResult.droppedHeldItems, true, 'Character at 0 Health must drop held items');
  });

  it('3. 0 Health Unified Mortality State: Unconscious, Prone, Bleeding Out, Stability = STA + 5', () => {
    const result = applyDamageToEntity({
      currentHealth: 5,
      currentVitality: 0,
      staminaScore: 3,
      incomingDamage: 5,
      isNonLethal: false,
      toughness: 0
    });

    assert.equal(result.newHealth, 0);
    assert.equal(result.newVitality, 0);
    assert.equal(result.incapacitated, true);
    assert.equal(result.unconscious, true);
    assert.equal(result.prone, true);
    assert.equal(result.droppedHeldItems, true);
    assert.equal(result.inMortalityState, true);
    assert.equal(result.stabilityMax, 8, 'Stability Points = STA (3) + 5 = 8');
    assert.ok(result.conditions.includes('Bleeding Out'));
  });

  it('4. Unified Mortality & Death\'s Door trigger: Stability Points = STA + 5', () => {
    const result = applyDamageToEntity({
      currentHealth: 5,
      currentVitality: 5,
      staminaScore: 4,
      incomingDamage: 15,
      isNonLethal: false,
      toughness: 0
    });

    assert.equal(result.newHealth, 0);
    assert.equal(result.newVitality, 0);
    assert.equal(result.isAtDeathsDoor, true, 'Must enter Mortality / Death\'s Door state');
    assert.equal(result.inMortalityState, true);
    assert.equal(result.isComatose, true, 'Condition: Comatose and severely wounded');
    assert.equal(result.stabilityMax, 9, 'Stability Points must equal STA (4) + 5 = 9');
    assert.equal(result.deathClockMax, 9);
    assert.equal(result.deathClockRemaining, 9);
    assert.ok(result.conditions.includes('Bleeding Out'));
    assert.ok(result.conditions.includes("Death's Door"));
    assert.ok(result.conditions.includes('Comatose'));
    assert.ok(result.conditions.includes('Incapacitated'));
    assert.ok(result.conditions.includes('Prone'));
  });

  it('5. Concussive damage 50/50 split between Vitality and Health', () => {
    const result = applyDamageToEntity({
      currentHealth: 30,
      currentVitality: 30,
      incomingDamage: 10,
      isConcussive: true,
      attemptedReduction: true,
      toughness: 0
    });

    assert.equal(result.newVitality, 25, '5 damage to Vitality');
    assert.equal(result.newHealth, 25, '5 damage to Health');
    assert.equal(result.concussiveSplit.wasSplit, true);
  });

  it('6. Massive Damage instant kill: Overflow or hit >= STA + 5 while at 0 HP kills instantly', () => {
    const isInstantKill = checkMassiveDamage(8, 3);
    assert.equal(isInstantKill, true, 'Damage >= STA + 5 (8) must trigger instant death');

    const damageResult = applyDamageToEntity({
      currentHealth: 0,
      currentVitality: 0,
      staminaScore: 3,
      incomingDamage: 8,
      isAtDeathsDoor: true,
      toughness: 0
    });
    assert.equal(damageResult.isDead, true);
    assert.equal(damageResult.instantDeath, true);
    assert.ok(damageResult.conditions.includes('Dead'));
    assert.ok(!damageResult.conditions.includes("Death's Door"));
  });

  it('7. Non-massive damage while at 0 HP does not trigger instant kill if < STA + 5', () => {
    const isInstantKill = checkMassiveDamage(7, 4);
    assert.equal(isInstantKill, false, 'Damage 7 < STA + 5 (9) should not instantly kill');

    const damageResult = applyDamageToEntity({
      currentHealth: 0,
      currentVitality: 0,
      staminaScore: 4,
      incomingDamage: 7,
      isAtDeathsDoor: true,
      toughness: 0
    });
    assert.equal(damageResult.isDead, false);
    assert.equal(damageResult.instantDeath, false);
  });

  it('8. Stabilization: Medicine DC 15 check / Healing stops the clock', () => {
    const stabilizedByCheck = stabilizeEntity({ medicineCheckRoll: 16 });
    assert.equal(stabilizedByCheck.stabilized, true);
    assert.equal(stabilizedByCheck.noLongerDying, true);
    assert.equal(stabilizedByCheck.remainsUnconscious, true);
    assert.ok(stabilizedByCheck.conditions.includes('Stabilized'));
    assert.ok(!stabilizedByCheck.conditions.includes("Death's Door"));
    assert.ok(!stabilizedByCheck.conditions.includes('Comatose'));
    assert.ok(stabilizedByCheck.conditions.includes('Incapacitated'));
    assert.ok(stabilizedByCheck.conditions.includes('Prone'));

    const failedCheck = stabilizeEntity({ medicineCheckRoll: 12 });
    assert.equal(failedCheck.stabilized, false);
    assert.equal(failedCheck.noLongerDying, false);

    const healingEffect = stabilizeEntity({ hasHealingEffect: true });
    assert.equal(healingEffect.stabilized, true);
  });

  it('9. Death Clock countdown: advanceDeathClock ticks down; at 0 round character dies permanently', () => {
    const round1 = advanceDeathClock({ currentClock: 2, isStabilized: false });
    assert.equal(round1.currentClock, 1);
    assert.equal(round1.dead, false);

    const round2 = advanceDeathClock({ currentClock: 1, isStabilized: false });
    assert.equal(round2.currentClock, 0);
    assert.equal(round2.dead, true);

    const stabilizedRound = advanceDeathClock({ currentClock: 2, isStabilized: true });
    assert.equal(stabilizedRound.currentClock, 2, 'Stabilized clock must not decrease');
    assert.equal(stabilizedRound.dead, false);
  });

  it('10. Revivification ("The High Cost of Dying"): Lose all Karma, suffer -5 Experience Debt', () => {
    const deadHero = {
      health: 0,
      vitality: 0,
      karma: 4,
      is_dead: true,
      experience_debt: 2
    };

    const revived = revivifyEntity({ characterData: deadHero, revivedHealth: 1 });
    assert.equal(revived.success, true);
    assert.equal(revived.updatedData.current_health, 1, 'Restored to 1 Health');
    assert.equal(revived.updatedData.is_dead, false);
    assert.equal(revived.updatedData.is_at_deaths_door, false);
    assert.equal(revived.updatedData.karma, 0, 'Loses ALL remaining Karma Points');
    assert.equal(revived.updatedData.experience_debt, 7, 'Suffers +5 Experience Debt (2 + 5 = 7)');
    assert.ok(revived.updatedData.conditions.includes('Exhausted'), 'Revivification applies Exhausted condition');
    assert.equal(revived.penalties.karmaLost, 4);
    assert.equal(revived.penalties.experienceDebtAdded, 5);
  });

  it('11. Synthetic entity: Structure pool damage directly; destroyed at 0 Structure', () => {
    const result = applyDamageToEntity({
      isSynthetic: true,
      currentStructure: 40,
      incomingDamage: 45,
      toughness: 0
    });

    assert.equal(result.newStructure, 0);
    assert.equal(result.isDead, true, 'Synthetic is destroyed at 0 Structure');
    assert.ok(result.conditions.includes('Dead'));
  });

  it('12. calculateDeathClock (Stability = STA + 5) enforces minimum 1 point', () => {
    assert.equal(calculateDeathClock(0), 5);
    assert.equal(calculateDeathClock(-6), 1);
    assert.equal(calculateDeathClock(5), 10);
  });

  it('13. DEATH_AND_DYING_RULES constants match canonical Unified Mortality specification', () => {
    assert.ok(DEATH_AND_DYING_RULES);
    assert.equal(DEATH_AND_DYING_RULES.THRESHOLD_OF_DEATH.deathsDoor.stabilization.medicineCR, 15);
    assert.equal(DEATH_AND_DYING_RULES.THRESHOLD_OF_DEATH.deathsDoor.stabilization.medicineDC, 15);
    assert.equal(DEATH_AND_DYING_RULES.REVIVIFICATION.subtitle, 'The High Cost of Dying');
    assert.equal(DEATH_AND_DYING_RULES.REVIVIFICATION.penalties.experienceDebt, 5);
    assert.equal(DEATH_AND_DYING_RULES.REVIVIFICATION.penalties.appliesExhausted, true);
  });
});
