import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateExperiencePool,
  applyExperienceAward,
  validateExperienceSpend,
  settleExperienceDebt
} from '../tangentEntityEngines.js';
import { EXPERIENCE_RULES } from '../tangentConstants.js';

describe('Tangent Experience & Award Points (AP) Canonical System', () => {
  it('1. Constants match canonical specification (1 AP = 1 BP, Increment Rule = 1)', () => {
    assert.equal(EXPERIENCE_RULES.EXCHANGE_RATE.apToBp, 1, '1 AP must equal 1 BP');
    assert.equal(EXPERIENCE_RULES.INCREMENT_RULE.maxIncrementPerAward, 1, 'Max 1 point increment per award event');
    assert.equal(EXPERIENCE_RULES.INCREMENT_RULE.isCritical, true);
    
    // Story awards
    assert.equal(EXPERIENCE_RULES.STORY_AWARDS.CHAPTER_COMPLETION.minAP, 5);
    assert.equal(EXPERIENCE_RULES.STORY_AWARDS.CHAPTER_COMPLETION.maxAP, 10);
    assert.equal(EXPERIENCE_RULES.STORY_AWARDS.OVERCOMING_GOAL_VILLAIN_PLOT.minAP, 1);
    assert.equal(EXPERIENCE_RULES.STORY_AWARDS.OVERCOMING_GOAL_VILLAIN_PLOT.maxAP, 3);

    // Session awards
    assert.equal(EXPERIENCE_RULES.SESSION_AWARDS.PROPER_GAME_SESSION.minAP, 0);
    assert.equal(EXPERIENCE_RULES.SESSION_AWARDS.PROPER_GAME_SESSION.maxAP, 2);
    assert.equal(EXPERIENCE_RULES.SESSION_AWARDS.ROLEPLAYING_IN_CHARACTER.minAP, 0);
    assert.equal(EXPERIENCE_RULES.SESSION_AWARDS.ROLEPLAYING_IN_CHARACTER.maxAP, 2);
    assert.equal(EXPERIENCE_RULES.PACING.standardSessionMin, 1);
    assert.equal(EXPERIENCE_RULES.PACING.standardSessionMax, 3);

    // Epic Ad Hoc awards
    assert.equal(EXPERIENCE_RULES.EPIC_AWARDS.EPIC_ACTION_OR_IDEA.minAP, 1);
    assert.equal(EXPERIENCE_RULES.EPIC_AWARDS.EPIC_ACTION_OR_IDEA.maxAP, 5);
    assert.equal(EXPERIENCE_RULES.EPIC_AWARDS.EPIC_ACTION_OR_IDEA.isAdHoc, true);

    // Experience Debt
    assert.equal(EXPERIENCE_RULES.EXPERIENCE_DEBT.revivificationDebt, 5);
  });

  it('2. calculateExperiencePool computes effective total budget and remaining AP correctly', () => {
    const pool = calculateExperiencePool({
      startingCP: 150,
      earnedAP: 15,
      spentCP: 158,
      experienceDebt: 0
    });

    assert.equal(pool.startingBudget, 150);
    assert.equal(pool.totalEarnedAP, 15);
    assert.equal(pool.totalBudget, 165, 'Total budget should be startingCP + earnedAP');
    assert.equal(pool.totalSpent, 158);
    assert.equal(pool.remainingBudget, 7, '165 - 158 = 7 points remaining');
    assert.equal(pool.availableAP, 7);
    assert.equal(pool.isOverBudget, false);
    assert.equal(pool.deficit, 0);
  });

  it('3. calculateExperiencePool detects over-budget deficit when spend exceeds total AP budget', () => {
    const pool = calculateExperiencePool({
      startingCP: 150,
      earnedAP: 5,
      spentCP: 160,
      experienceDebt: 2
    });

    assert.equal(pool.totalBudget, 155);
    assert.equal(pool.totalSpent, 160);
    assert.equal(pool.isOverBudget, true);
    assert.equal(pool.deficit, 5, 'Deficit must be 5 CP');
    assert.equal(pool.activeDebt, 2);
  });

  it('4. applyExperienceAward adds AP to earned_ap and records chronological award entry', () => {
    const initialChar = {
      'char-name': 'Xy\'larra',
      earned_ap: 0,
      experience_awards: []
    };

    const result = applyExperienceAward(initialChar, {
      amount: 7,
      category: 'story',
      awardId: 'chapter_completion',
      reason: 'Completed Chapter 2: The Alterian Syndicate Infiltration',
      sessionNumber: 4
    });

    assert.equal(result.success, true);
    assert.equal(result.newEarnedAP, 7);
    assert.equal(result.updatedData.earned_ap, 7);
    assert.equal(result.updatedData.experience_awards.length, 1);
    assert.equal(result.updatedData.experience_awards[0].amount, 7);
    assert.equal(result.updatedData.experience_awards[0].category, 'story');
    assert.equal(result.updatedData.experience_awards[0].sessionNumber, 4);
    assert.ok(result.updatedData.experience_awards[0].id.startsWith('award-'));
  });

  it('5. applyExperienceAward with autoPayDebt immediately reduces active Experience Debt', () => {
    const charWithDebt = {
      'char-name': 'Revived Operative',
      earned_ap: 0,
      experience_debt: 5,
      experience_awards: []
    };

    // Award 3 AP with autoPayDebt
    const res1 = applyExperienceAward(charWithDebt, {
      amount: 3,
      category: 'session',
      reason: 'Tactical engagement & good roleplay',
      autoPayDebt: true
    });

    assert.equal(res1.debtPaid, 3);
    assert.equal(res1.remainingDebt, 2);
    assert.equal(res1.updatedData.experience_debt, 2);
    assert.equal(res1.updatedData.earned_ap, 3);

    // Award another 5 AP with autoPayDebt - should pay off remaining 2 debt
    const res2 = applyExperienceAward(res1.updatedData, {
      amount: 5,
      category: 'story',
      reason: 'Chapter completion',
      autoPayDebt: true
    });

    assert.equal(res2.debtPaid, 2);
    assert.equal(res2.remainingDebt, 0);
    assert.equal(res2.updatedData.experience_debt, 0);
    assert.equal(res2.updatedData.earned_ap, 8);
  });

  it('6. The Increment Rule: Validates 1-point increment per award, rejects bulk dumps', () => {
    const char = { 'skill-athletics-rank': 2 };

    // Valid: increment of 1
    const validCheck = validateExperienceSpend({
      characterData: char,
      targetType: 'skill',
      targetKey: 'skill-athletics-rank',
      increment: 1,
      costAP: 1
    });
    assert.equal(validCheck.valid, true);

    // Invalid: Attempting to dump +2 ranks in a single award event
    const invalidCheck = validateExperienceSpend({
      characterData: char,
      targetType: 'skill',
      targetKey: 'skill-athletics-rank',
      increment: 2,
      costAP: 2
    });
    assert.equal(invalidCheck.valid, false);
    assert.match(invalidCheck.error, /The Increment Rule \(CRITICAL\)/);
  });

  it('7. The Increment Rule: Validates Vitals (+5 buffer per 1 AP) and rejects >5 points', () => {
    // Valid: +5 Vitality buffer (1 AP)
    const validVit = validateExperienceSpend({
      targetType: 'vitality',
      targetKey: 'vitality',
      increment: 5,
      costAP: 1
    });
    assert.equal(validVit.valid, true);

    // Invalid: Attempting +10 Vitality in a single award event
    const invalidVit = validateExperienceSpend({
      targetType: 'vitality',
      targetKey: 'vitality',
      increment: 10,
      costAP: 2
    });
    assert.equal(invalidVit.valid, false);
    assert.match(invalidVit.error, /Vitals may only be increased by \+5 points/);
  });

  it('8. The Increment Rule: Prevents double-incrementing the same trait for the same awardId', () => {
    const char = {
      experience_spends: [
        { awardId: 'award-session-1', targetKey: 'skill-piloting-rank', increment: 1 }
      ]
    };

    // Attempting to spend on the same trait under the same award ID again
    const secondSpend = validateExperienceSpend({
      characterData: char,
      targetType: 'skill',
      targetKey: 'skill-piloting-rank',
      increment: 1,
      awardId: 'award-session-1'
    });
    assert.equal(secondSpend.valid, false);
    assert.match(secondSpend.error, /already been incremented for this experience award event/);

    // Different trait under the same award ID is permitted!
    const differentTrait = validateExperienceSpend({
      characterData: char,
      targetType: 'skill',
      targetKey: 'skill-stealth-rank',
      increment: 1,
      awardId: 'award-session-1'
    });
    assert.equal(differentTrait.valid, true);

    // Same trait under a NEW award ID is permitted!
    const newAwardSpend = validateExperienceSpend({
      characterData: char,
      targetType: 'skill',
      targetKey: 'skill-piloting-rank',
      increment: 1,
      awardId: 'award-session-2'
    });
    assert.equal(newAwardSpend.valid, true);
  });

  it('9. settleExperienceDebt manually repays debt with AP', () => {
    const char = { experience_debt: 5 };

    const result = settleExperienceDebt({
      characterData: char,
      apAmount: 3
    });

    assert.equal(result.success, true);
    assert.equal(result.previousDebt, 5);
    assert.equal(result.debtPaid, 3);
    assert.equal(result.remainingDebt, 2);
    assert.equal(result.updatedData.experience_debt, 2);
  });
});
