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

  it('2. Lethal damage hits Health directly; excess beyond 0 is applied to remaining Vitality', () => {
    const result = applyDamageToEntity({
      currentHealth: 10,
      currentVitality: 25,
      incomingDamage: 16,
      isNonLethal: false,
      toughness: 0
    });

    assert.equal(result.newHealth, 0, 'Health should be reduced to 0');
    assert.equal(result.newVitality, 19, 'Excess 6 damage should be applied to remaining Vitality');
    assert.equal(result.excessToVitality, 6);
    assert.equal(result.incapacitated, true, 'Character at 0 Health must be Incapacitated');
    assert.equal(result.unconscious, true, 'Character at 0 Health must be Unconscious');
    assert.equal(result.prone, true, 'Character at 0 Health must fall Prone');
    assert.equal(result.droppedHeldItems, true, 'Character at 0 Health must drop held items');
    assert.equal(result.isAtDeathsDoor, false, 'Should NOT enter Death Door while Vitality remains');
  });

  it('3. 0 Health Incapacitated sequence: Unconscious, Prone, Drops items, but safe from Death Clock while Vitality > 0', () => {
    const result = applyDamageToEntity({
      currentHealth: 5,
      currentVitality: 15,
      incomingDamage: 5,
      isNonLethal: false,
      toughness: 0
    });

    assert.equal(result.newHealth, 0);
    assert.equal(result.newVitality, 15);
    assert.equal(result.incapacitated, true);
    assert.equal(result.unconscious, true);
    assert.equal(result.prone, true);
    assert.equal(result.droppedHeldItems, true);
    assert.equal(result.isAtDeathsDoor, false);
    assert.equal(result.isComatose, false);
  });

  it('4. Death\'s Door trigger: Occurs only when Health is 0 AND Vitality is 0', () => {
    const result = applyDamageToEntity({
      currentHealth: 5,
      currentVitality: 5,
      staminaScore: 4,
      incomingDamage: 20,
      isNonLethal: false,
      toughness: 0
    });

    assert.equal(result.newHealth, 0);
    assert.equal(result.newVitality, 0);
    assert.equal(result.isAtDeathsDoor, true, 'Must enter Death\'s Door state');
    assert.equal(result.isComatose, true, 'Condition: Comatose and severely wounded');
    assert.equal(result.deathClockMax, 4, 'Clock must equal Stamina score');
    assert.equal(result.deathClockRemaining, 4);
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

  it('6. Massive Damage instant kill: Hit >= STA score while at Death\'s Door kills instantly', () => {
    const isInstantKill = checkMassiveDamage(3, 3);
    assert.equal(isInstantKill, true, 'Damage equal to STA (3) must trigger instant death');

    const damageResult = applyDamageToEntity({
      currentHealth: 0,
      currentVitality: 0,
      staminaScore: 3,
      incomingDamage: 3,
      isAtDeathsDoor: true,
      toughness: 0
    });
    assert.equal(damageResult.isDead, true);
    assert.equal(damageResult.instantDeath, true);
    assert.ok(damageResult.conditions.includes('Dead'));
    assert.ok(!damageResult.conditions.includes("Death's Door"));
  });

  it('7. Non-massive damage while at Death\'s Door does not trigger instant kill if < STA', () => {
    const isInstantKill = checkMassiveDamage(3, 4);
    assert.equal(isInstantKill, false, 'Damage 3 < STA (4) should not instantly kill');

    const damageResult = applyDamageToEntity({
      currentHealth: 0,
      currentVitality: 0,
      staminaScore: 4,
      incomingDamage: 3,
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
    assert.equal(revived.updatedData.experience_debt, 7, 'Suffers -5 Experience Debt (2 + 5 = 7)');
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

  it('12. calculateDeathClock enforces minimum 1 round', () => {
    assert.equal(calculateDeathClock(0), 1);
    assert.equal(calculateDeathClock(-2), 1);
    assert.equal(calculateDeathClock(5), 5);
  });

  it('13. DEATH_AND_DYING_RULES constants match canonical design specification', () => {
    assert.ok(DEATH_AND_DYING_RULES);
    assert.equal(DEATH_AND_DYING_RULES.THRESHOLD_OF_DEATH.zeroHealth.name, '0 Health (Incapacitated)');
    assert.equal(DEATH_AND_DYING_RULES.THRESHOLD_OF_DEATH.deathsDoor.stabilization.medicineDC, 15);
    assert.equal(DEATH_AND_DYING_RULES.REVIVIFICATION.subtitle, 'The High Cost of Dying');
    assert.equal(DEATH_AND_DYING_RULES.REVIVIFICATION.penalties.experienceDebt, 5);
    assert.ok(DEATH_AND_DYING_RULES.REVIVIFICATION.penalties.debtDescription.includes('-5 Experience Debt'));
  });
});
