/**
 * TANGENT SFF RP: Complex Skill Challenge & Heist Clock Engine Service
 * Manages multi-step progress clocks, success/alert tracks, skill variety rules, and partial successes.
 */

export const CANONICAL_CHALLENGE_PRESETS = [
  {
    id: 'heist_vault_incursion',
    title: 'Hyperion Cyber-Vault Incursion',
    icon: '🏦',
    category: 'Heist & Infiltration',
    description: 'Infiltrate the subterranean vault of a corporate arcology, bypassing biometric lasers, ICE firewalls, and guard patrols.',
    requiredSuccesses: 5,
    maxFailures: 3,
    baseDc: 13,
    suggestedSkills: ['Stealth', 'Cybernetics', 'Security', 'Deception', 'Athletics'],
    complicationEvents: [
      'Patrol drone changes sweep pattern (+1 Alert tick).',
      'Laser tripwire triggers security lockdown (Next check at -2).',
      'Corporate alarm sounds — Security forces deployed!'
    ]
  },
  {
    id: 'asteroid_field_slalom',
    title: 'Deep-Space Asteroid Slalom',
    icon: '☄️',
    category: 'Vehicle & Navigation',
    description: 'Navigate a heavily dense, tumbling iron-nickel asteroid belt while being pursued by syndicate pirate interceptors.',
    requiredSuccesses: 4,
    maxFailures: 3,
    baseDc: 12,
    suggestedSkills: ['Pilot', 'Sensors', 'Engineering', 'Astrogation', 'Gunner'],
    complicationEvents: [
      'Micro-meteorite shears off auxiliary sensor dish.',
      'Thruster manifold overburns (Next Pilot check at -2).',
      'Catastrophic kinetic collision with dense rock!'
    ]
  },
  {
    id: 'reactor_core_stabilization',
    title: 'Superheated Core Meltdown Override',
    icon: '☢️',
    category: 'Crisis & Disaster',
    description: 'Prevent a catastrophic anti-matter reactor breach by manually venting plasma conduits and rerouting magnetic containment warded seals.',
    requiredSuccesses: 6,
    maxFailures: 4,
    baseDc: 14,
    suggestedSkills: ['Engineering', 'Science', 'Heavy Machinery', 'Fortitude', 'Cybernetics'],
    complicationEvents: [
      'Radiation valve bursts, venting toxic steam into the compartment.',
      'Emergency mag-clamps fail, forcing manual lever engagement.',
      'Core thermal threshold breached — Critical evacuation imminent!'
    ]
  },
  {
    id: 'megacorp_investigation',
    title: 'Black-Budget Conspiracy Investigation',
    icon: '🕵️',
    category: 'Investigation & Social',
    description: 'Piece together shredded financial ledgers, interrogate underworld fixers, and decrypt dark-net data shards to expose high-level corporate treason.',
    requiredSuccesses: 4,
    maxFailures: 3,
    baseDc: 12,
    suggestedSkills: ['Investigation', 'Streetwise', 'Insight', 'Cyber-Forensics', 'Persuasion'],
    complicationEvents: [
      'Informant gets spooked and goes to ground.',
      'Corrupt police wiretap compromises investigation lead.',
      'Cover blown — Corporate hit squad dispatched!'
    ]
  }
];

export const getChallengePresets = () => CANONICAL_CHALLENGE_PRESETS;

export const createSkillChallenge = (presetId = 'heist_vault_incursion', customConfig = {}) => {
  const preset = CANONICAL_CHALLENGE_PRESETS.find(p => p.id === presetId) || CANONICAL_CHALLENGE_PRESETS[0];

  return {
    id: `challenge_${Date.now()}`,
    title: customConfig.title || preset.title,
    icon: customConfig.icon || preset.icon,
    category: customConfig.category || preset.category,
    description: customConfig.description || preset.description,
    requiredSuccesses: customConfig.requiredSuccesses || preset.requiredSuccesses,
    maxFailures: customConfig.maxFailures || preset.maxFailures,
    baseDc: customConfig.baseDc || preset.baseDc,
    suggestedSkills: customConfig.suggestedSkills || preset.suggestedSkills,
    currentSuccesses: 0,
    currentFailures: 0,
    isCompleted: false,
    outcome: null, // 'victory' | 'defeat'
    history: [],
    lastUsedSkill: null
  };
};

/**
 * Evaluates a single skill contribution to the active challenge.
 */
export const evaluateSkillChallengeRoll = (
  challenge,
  operativeName,
  skillName,
  rollTotal,
  targetDc,
  isCritTriumph = false,
  isCritFumble = false,
  isSuccessAtCost = false
) => {
  if (!challenge || challenge.isCompleted) return challenge;

  const isRepeatedSkill = challenge.lastUsedSkill === skillName;
  const marginOfSuccess = rollTotal - targetDc;
  let successesGained = 0;
  let failuresGained = 0;
  let eventText = '';

  if (isCritTriumph) {
    successesGained = 2;
    failuresGained = Math.max(-1, -challenge.currentFailures); // Can remove 1 failure on double 10s!
    eventText = `🌟 CRITICAL TRIUMPH (Natural Double 10s): +2 Successes and cleared 1 Alert tick!`;
  } else if (isCritFumble) {
    failuresGained = 2;
    eventText = `💀 CRITICAL FUMBLE (Natural Double 1s): +2 Alert ticks and major setback!`;
  } else if (isSuccessAtCost) {
    successesGained = 1;
    failuresGained = 1;
    eventText = `⚡ SUCCESS AT A COST: Progress achieved (+1 Success), but triggered alert (+1 Failure)!`;
  } else if (marginOfSuccess >= 0) {
    successesGained = 1;
    eventText = `✅ SUCCESS (MoS +${marginOfSuccess}): +1 Progress gained toward objective.`;
  } else {
    failuresGained = 1;
    eventText = `❌ FAILURE (Margin ${marginOfSuccess}): +1 Alert tick on security clock.`;
  }

  const nextSuccesses = Math.min(challenge.requiredSuccesses, challenge.currentSuccesses + successesGained);
  const nextFailures = Math.min(challenge.maxFailures, challenge.currentFailures + failuresGained);

  let isCompleted = false;
  let outcome = null;

  if (nextSuccesses >= challenge.requiredSuccesses) {
    isCompleted = true;
    outcome = 'victory';
  } else if (nextFailures >= challenge.maxFailures) {
    isCompleted = true;
    outcome = 'defeat';
  }

  const logItem = {
    roundIndex: challenge.history.length + 1,
    operativeName: operativeName || 'Operative',
    skillName,
    rollTotal,
    targetDc,
    marginOfSuccess,
    successesGained,
    failuresGained,
    eventText,
    timestamp: new Date().toLocaleTimeString()
  };

  return {
    ...challenge,
    currentSuccesses: nextSuccesses,
    currentFailures: nextFailures,
    isCompleted,
    outcome,
    lastUsedSkill: skillName,
    history: [logItem, ...challenge.history]
  };
};
