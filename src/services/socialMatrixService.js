/**
 * TANGENT SFF RP: Dynamic Scene Director & Social Disposition Matrix Service
 * Handles NPC disposition tiers, social negotiation mechanics, leverage generation, and social checks.
 */

export const DISPOSITION_TIERS = [
  {
    tier: -2,
    id: 'hostile',
    label: 'Hostile',
    icon: '😡',
    color: '#ef4444',
    bgClass: 'bg-red-950/80 border-red-600/70 text-red-300',
    baseDc: 18,
    tradeModifier: 1.5, // 50% price markup
    description: 'Actively antagonistic. Will deceive, sabotage, or attack unless intimidated with overwhelming force or major leverage.'
  },
  {
    tier: -1,
    id: 'suspicious',
    label: 'Suspicious / Guarded',
    icon: '🤨',
    color: '#f59e0b',
    bgClass: 'bg-amber-950/80 border-amber-600/70 text-amber-300',
    baseDc: 15,
    tradeModifier: 1.25, // 25% markup
    description: 'Distrustful of outsiders. Demands upfront collateral, verifiable credentials, or mutual contacts before sharing info.'
  },
  {
    tier: 0,
    id: 'neutral',
    label: 'Neutral / Transactional',
    icon: '😐',
    color: '#94a3b8',
    bgClass: 'bg-slate-900 border-slate-700 text-slate-300',
    baseDc: 12,
    tradeModifier: 1.0, // Standard market rates
    description: 'Pragmatic and professional. Open to fair business, standard contracts, and routine conversation.'
  },
  {
    tier: 1,
    id: 'cooperative',
    label: 'Cooperative / Friendly',
    icon: '🙂',
    color: '#22c55e',
    bgClass: 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300',
    baseDc: 9,
    tradeModifier: 0.9, // 10% discount
    description: 'Helpful and favorable. Voluntarily shares local rumors, provides guidance, and offers favorable contract terms.'
  },
  {
    tier: 2,
    id: 'allied',
    label: 'Allied / Devoted',
    icon: '🤝',
    color: '#06b6d4',
    bgClass: 'bg-cyan-950/80 border-cyan-500/70 text-cyan-300',
    baseDc: 6,
    tradeModifier: 0.75, // 25% discount
    description: 'Trusted ally. Will provide safe harbor, loan restricted equipment, and risk personal standing to protect the party.'
  }
];

export const SOCIAL_ACTION_TYPES = [
  {
    id: 'persuasion',
    label: 'Persuasion / Diplomacy',
    icon: '🗣️',
    attribute: 'Charisma',
    skill: 'Persuasion',
    description: 'Appeals to reason, shared interest, or mutual gain to sway attitude and secure agreement.'
  },
  {
    id: 'intimidation',
    label: 'Intimidation / Coercion',
    icon: '😠',
    attribute: 'Strength',
    skill: 'Intimidation',
    description: 'Leverages physical menace, authority, or collateral threats. Warning: Failure drops disposition by 1 tier.'
  },
  {
    id: 'deception',
    label: 'Deception / Con',
    icon: '🎭',
    attribute: 'Charisma',
    skill: 'Deception',
    description: 'Bluffs credentials, fabricates evidence, or misrepresents value to achieve an immediate objective.'
  },
  {
    id: 'insight',
    label: 'Sense Motive (Insight)',
    icon: '🧠',
    attribute: 'Intellect',
    skill: 'Insight',
    description: 'Reads vocal micro-stress, biometric telemetry, and body language to uncover hidden fears or leverage.'
  },
  {
    id: 'streetwise',
    label: 'Streetwise / Underworld Slang',
    icon: '🕶️',
    attribute: 'Charisma',
    skill: 'Streetwise',
    description: 'Speaks the local syndicate cant, references mutual criminal contacts, or verifies underworld reputation.'
  }
];

export const NPC_MOTIVATIONS = [
  'Greed for Credits & High-Tech Salvage',
  'Fierce Loyalty to Megacorp / Syndicate',
  'Personal Survival & Debt Escapement',
  'Scientific & Archaeological Obsession',
  'Vengeance against Corrupt Officials',
  'Protecting Family / Underground Enclave',
  'Religious / Transcendent Zealot Mission'
];

export const NPC_FEARS = [
  'Exposure of Black Market Smuggling Ops',
  'Loss of Corporate Executive Clearance',
  'Cyber-Extortion or Neural Wipe Threat',
  'Assassination by Rival Corporate Enforcers',
  'Contract Termination & Debt Foreclosure',
  'Kitin Collective Incursion or Plague'
];

export const NPC_LEVERAGE_CHIPS = [
  'Encrypted Access Codes to Sub-Vault Level 3',
  'High-Grade Military Stasis Pod Clearance',
  'Classified Hyperdrive Routing Nav-Data',
  'Direct Contact Frequency for Shadow Broker',
  'Supply Requisition Voucher (5,000 TSC Credits)',
  'Smuggler Tunnel Map bypassing Orbital Customs'
];

export const getDispositionDefinition = (tierOrId) => {
  if (typeof tierOrId === 'number') {
    return DISPOSITION_TIERS.find(t => t.tier === tierOrId) || DISPOSITION_TIERS[2];
  }
  const str = String(tierOrId).toLowerCase();
  return DISPOSITION_TIERS.find(t => t.id === str || t.label.toLowerCase().includes(str)) || DISPOSITION_TIERS[2];
};

/**
 * Generates a complete procedural social profile for an NPC.
 */
export const generateNpcSocialProfile = (npc = {}) => {
  const seed = (npc.label || npc.name || 'NPC') + (npc.id || '0');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const startTier = (absHash % 3) - 1; // Default to -1 (Suspicious), 0 (Neutral), or 1 (Cooperative)
  const motivation = NPC_MOTIVATIONS[absHash % NPC_MOTIVATIONS.length];
  const fear = NPC_FEARS[(absHash + 2) % NPC_FEARS.length];
  const leverage = NPC_LEVERAGE_CHIPS[(absHash + 4) % NPC_LEVERAGE_CHIPS.length];

  return {
    dispositionTier: startTier,
    motivation,
    fear,
    leverage,
    leverageRevealed: false,
    notes: ''
  };
};

/**
 * Evaluates how disposition shifts based on check result and Margin of Success.
 */
export const evaluateDispositionShift = (currentTier = 0, actionTypeId, rollTotal, targetDc, isCritTriumph = false, isCritFumble = false) => {
  const def = getDispositionDefinition(currentTier);
  const marginOfSuccess = rollTotal - targetDc;
  let newTier = currentTier;
  let shiftReason = '';

  if (isCritTriumph) {
    newTier = Math.min(2, currentTier + 2);
    shiftReason = '🌟 Critical Triumph! Disposition improved by +2 tiers and revealed secret leverage!';
  } else if (isCritFumble) {
    newTier = Math.max(-2, currentTier - 2);
    shiftReason = '💀 Critical Fumble! Complete diplomatic breakdown (-2 tiers).';
  } else if (marginOfSuccess >= 5) {
    newTier = Math.min(2, currentTier + 1);
    shiftReason = `✨ Major Success (MoS +${marginOfSuccess})! Disposition improved to ${getDispositionDefinition(newTier).label}.`;
  } else if (marginOfSuccess >= 0) {
    shiftReason = `✅ Success (MoS +${marginOfSuccess}). Objective achieved without disposition change.`;
  } else {
    // Failure
    if (actionTypeId === 'intimidation') {
      newTier = Math.max(-2, currentTier - 1);
      shiftReason = '⚠️ Failed Intimidation! Target becomes defiant (Disposition decreased by -1 tier).';
    } else if (marginOfSuccess <= -5) {
      newTier = Math.max(-2, currentTier - 1);
      shiftReason = `❌ Severe Failure (Margin ${marginOfSuccess})! Target offended (Disposition decreased by -1 tier).`;
    } else {
      shiftReason = `❌ Failed check (Margin ${marginOfSuccess}). Offer declined, no disposition shift.`;
    }
  }

  return {
    previousTier: currentTier,
    newTier,
    tierChanged: newTier !== currentTier,
    marginOfSuccess,
    shiftReason,
    disposition: getDispositionDefinition(newTier)
  };
};
