import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_CHALLENGE_PRESETS,
  createSkillChallenge,
  evaluateSkillChallengeRoll
} from '../../services/skillChallengeService.js';

test('Tangent SFF RP — Complex Skill Challenge & Heist Clock Engine', async (t) => {
  await t.test('Canonical challenge presets integrity', () => {
    assert.ok(CANONICAL_CHALLENGE_PRESETS.length >= 4);
    const heist = CANONICAL_CHALLENGE_PRESETS.find(p => p.id === 'heist_vault_incursion');
    assert.ok(heist);
    assert.equal(heist.requiredSuccesses, 5);
    assert.equal(heist.maxFailures, 3);
    assert.ok(heist.suggestedSkills.includes('Cybernetics'));
  });

  await t.test('createSkillChallenge initializes empty progress and alert clocks', () => {
    const challenge = createSkillChallenge('heist_vault_incursion');
    assert.equal(challenge.currentSuccesses, 0);
    assert.equal(challenge.currentFailures, 0);
    assert.equal(challenge.isCompleted, false);
    assert.equal(challenge.outcome, null);
    assert.equal(challenge.history.length, 0);
  });

  await t.test('evaluateSkillChallengeRoll processes standard success and critical triumph', () => {
    let challenge = createSkillChallenge('heist_vault_incursion');

    // 1. Normal success
    challenge = evaluateSkillChallengeRoll(challenge, 'Jax', 'Stealth', 16, 13, false, false);
    assert.equal(challenge.currentSuccesses, 1);
    assert.equal(challenge.currentFailures, 0);
    assert.equal(challenge.lastUsedSkill, 'Stealth');

    // 2. Critical Triumph (+2 Successes)
    challenge = evaluateSkillChallengeRoll(challenge, 'Sola', 'Cybernetics', 34, 13, true, false);
    assert.equal(challenge.currentSuccesses, 3);
    assert.equal(challenge.currentFailures, 0);
  });

  await t.test('evaluateSkillChallengeRoll processes Success at a Cost (+1 Success / +1 Alert tick)', () => {
    let challenge = createSkillChallenge('heist_vault_incursion');

    challenge = evaluateSkillChallengeRoll(challenge, 'Kael', 'Security', 12, 13, false, false, true);
    assert.equal(challenge.currentSuccesses, 1);
    assert.equal(challenge.currentFailures, 1);
  });

  await t.test('evaluateSkillChallengeRoll completes challenge with victory upon reaching required successes', () => {
    let challenge = createSkillChallenge('heist_vault_incursion', { requiredSuccesses: 2, maxFailures: 2 });

    challenge = evaluateSkillChallengeRoll(challenge, 'Jax', 'Stealth', 15, 13);
    assert.equal(challenge.isCompleted, false);

    challenge = evaluateSkillChallengeRoll(challenge, 'Sola', 'Cybernetics', 16, 13);
    assert.equal(challenge.isCompleted, true);
    assert.equal(challenge.outcome, 'victory');
  });

  await t.test('evaluateSkillChallengeRoll completes challenge with defeat upon reaching max failures', () => {
    let challenge = createSkillChallenge('heist_vault_incursion', { requiredSuccesses: 3, maxFailures: 2 });

    challenge = evaluateSkillChallengeRoll(challenge, 'Jax', 'Stealth', 8, 13); // Fail 1
    challenge = evaluateSkillChallengeRoll(challenge, 'Sola', 'Cybernetics', 9, 13); // Fail 2

    assert.equal(challenge.isCompleted, true);
    assert.equal(challenge.outcome, 'defeat');
  });
});
