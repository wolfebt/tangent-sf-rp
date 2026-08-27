/**
 * TANGENT SFF RP: Dynamic NPC Disposition & Social Negotiation Engine
 * Tracks adversary/neutral NPC disposition meters and resolves Persuasion,
 * Intimidation, and Bribery social skill checks during encounters.
 */

import { AudioService } from './audioService';

export const DISPOSITION_TIERS = {
  hostile: { id: 'hostile', min: 0, max: 25, label: 'Hostile', color: 'text-red-400', icon: '😡' },
  suspicious: { id: 'suspicious', min: 26, max: 50, label: 'Suspicious', color: 'text-amber-400', icon: '🤨' },
  neutral: { id: 'neutral', min: 51, max: 75, label: 'Neutral', color: 'text-cyan-400', icon: '😐' },
  cooperative: { id: 'cooperative', min: 76, max: 100, label: 'Cooperative', color: 'text-emerald-400', icon: '🤝' }
};

export function getDispositionTier(score = 20) {
  if (score <= 25) return DISPOSITION_TIERS.hostile;
  if (score <= 50) return DISPOSITION_TIERS.suspicious;
  if (score <= 75) return DISPOSITION_TIERS.neutral;
  return DISPOSITION_TIERS.cooperative;
}

/**
 * Resolves a social action check against an NPC.
 */
export function resolveSocialAction(npcToken, operativeToken, actionType = 'persuasion', creditBribeAmount = 0) {
  const currentScore = parseInt(npcToken.disposition ?? 20, 10);
  const chaMod = operativeToken?.chaMod || operativeToken?.charismaMod || 2;
  const roll = Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1 + chaMod;

  let targetDc = 14;
  let delta = 0;
  let responseDialogue = '';

  if (actionType === 'bribe') {
    const bribeBonus = Math.min(10, Math.floor(creditBribeAmount / 200));
    const bribeRoll = roll + bribeBonus;
    if (bribeRoll >= 12) {
      delta = 25 + bribeBonus * 2;
      responseDialogue = `"Credits verified on my slate. I never saw you operatives here."`;
    } else {
      delta = -5;
      responseDialogue = `"You insulting me with this chump change? Move along!"`;
    }
  } else if (actionType === 'intimidation') {
    if (roll >= targetDc) {
      delta = 30;
      responseDialogue = `"Hold your fire! I'll tell you what you want to know! Don't shoot!"`;
    } else {
      delta = -15;
      responseDialogue = `"You don't scare me, runner. Guards, take them down!"`;
    }
  } else {
    // Persuasion / Parley
    if (roll >= targetDc) {
      delta = 20;
      responseDialogue = `"I see logic in your proposal. We can work together on this."`;
    } else {
      delta = -5;
      responseDialogue = `"I have my orders and company loyalty. We cannot parley."`;
    }
  }

  const newScore = Math.max(0, Math.min(100, currentScore + delta));
  const newTier = getDispositionTier(newScore);

  AudioService.playTerminalBeep(delta > 0 ? 1150 : 420, 0.08);

  return {
    actionType,
    operativeName: operativeToken?.label || 'Operative',
    npcName: npcToken.label || 'NPC',
    roll,
    targetDc,
    isSuccess: delta > 0,
    previousScore: currentScore,
    newScore,
    delta,
    newTier,
    responseDialogue,
    unlockedIntel: newScore >= 75 ? 'Facility Master Passcode: [0451-ALPHA]' : null
  };
}

export default {
  DISPOSITION_TIERS,
  getDispositionTier,
  resolveSocialAction
};
