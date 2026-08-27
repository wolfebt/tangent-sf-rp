/**
 * TANGENT SFF RP: Proactive Pacing & Tactical Whisper AI Service
 * Analyzes encounter telemetry, detects combat stalls/crises, and generates proactive GM whisper cards.
 */

export const CANONICAL_WHISPER_CARDS = [
  {
    id: 'reinforcement_incursion',
    label: 'Rival Drop-Pod Incursion',
    icon: '🚨',
    category: 'Combat Escalation',
    pacingTrigger: 'blowout',
    title: 'Drop-Pod Hull Breach: Hostile Reinforcements',
    description: 'A mercenary fireteam or cyber-hound pack breaches through an orbital drop-pod or ceiling ventilation shaft.',
    actionEffect: 'Spawns 2-3 Tier 1 Minions or 1 Tier 2 Skirmisher on the outer map perimeter.'
  },
  {
    id: 'environmental_surge',
    label: 'Coolant / Plasma Pipe Rupture',
    icon: '🔥',
    category: 'Environmental Hazard',
    pacingTrigger: 'stall',
    title: 'Facility Structural Failure: Coolant Rupture',
    description: 'A stray projectile ruptures a superheated plasma conduit, cutting off standard cover and filling the center room with smoke.',
    actionEffect: 'Places a 3m radius Hazard zone dealing 4 thermal damage/round and granting Partial Cover smoke.'
  },
  {
    id: 'adversary_parley',
    label: 'Adversary Parley / Surrender',
    icon: '🏳️',
    category: 'Narrative Negotiation',
    pacingTrigger: 'stall',
    title: 'Adversary Commander Sues for Terms',
    description: 'Seeing their position compromised, the enemy squad leader holds fire and broadcasts an encrypted parley frequency.',
    actionEffect: 'Transitions combat into Social Disposition Matrix with +1 leverage for the party.'
  },
  {
    id: 'terminal_countdown',
    label: 'Data Terminal Self-Destruct Timer',
    icon: '⏳',
    category: 'Objective Pressure',
    pacingTrigger: 'stall',
    title: 'Data-Purge / Core Meltdown Countdown',
    description: 'The mainframe initiates a 3-round wipe sequence. Operatives must reach and hack the terminal before sensitive files vanish.',
    actionEffect: 'Starts a 3-round progress clock on the map with DC 14 Cybernetics check.'
  },
  {
    id: 'tactical_retreat',
    label: 'Tactical Smoke & Flank Shift',
    icon: '💨',
    category: 'Adversary Tactics',
    pacingTrigger: 'blowout',
    title: 'Adversaries Pop Smoke & Fall Back',
    description: 'Surviving hostiles deploy thermobaric smoke cannisters and retreat toward reinforced blast doors.',
    actionEffect: 'Grants Full Cover (+4 DC) to retreating enemies for 1 round.'
  },
  {
    id: 'heroic_inspiration',
    label: 'Heroic Tactical Breakthrough',
    icon: '✨',
    category: 'Player Reward',
    pacingTrigger: 'crisis',
    title: 'Karmic Spark in the Dark',
    description: 'The party faces overwhelming odds. An operative notices a structural weakpoint in the adversary’s kinetic shielding.',
    actionEffect: 'Grants +1 Karma to the party and lowers adversary Defense DC by 2 for 1 round.'
  }
];

/**
 * Evaluates live encounter telemetry to determine pacing health and recommended whisper cards.
 */
export const analyzeCombatPacing = (tokens = [], roundNumber = 1, eventHistory = []) => {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return {
      pacingState: 'optimal',
      pacingLabel: 'Encounter Idle / Setup',
      pacingColor: '#94a3b8',
      tensionScore: 0,
      heroHealthRatio: 1,
      enemyCount: 0,
      suggestedCards: []
    };
  }

  const heroTokens = tokens.filter(t => Boolean(t.linkedHeroId) && !t.isDead);
  const enemyTokens = tokens.filter(t => (t.isEnemy || t.type === 'adversary' || t.type === 'enemy') && !t.isDead);

  // Health / Vitality metrics
  let totalHeroMaxHealth = 0;
  let totalHeroCurrentHealth = 0;
  let heroesAtDeathsDoor = 0;

  heroTokens.forEach(t => {
    const maxH = t.health?.max || t.hp?.max || 30;
    const curH = t.health?.current !== undefined ? t.health.current : (t.hp?.current || 30);
    totalHeroMaxHealth += maxH;
    totalHeroCurrentHealth += Math.max(0, curH);

    if (curH <= 0 || (t.conditions || []).includes("Death's Door")) {
      heroesAtDeathsDoor++;
    }
  });

  const heroHealthRatio = totalHeroMaxHealth > 0 ? (totalHeroCurrentHealth / totalHeroMaxHealth) : 1;

  // Calculate Base Tension Score (0–100%)
  const damageFactor = Math.round((1 - heroHealthRatio) * 60);
  const enemyFactor = Math.min(25, enemyTokens.length * 5);
  const deathsDoorFactor = heroesAtDeathsDoor * 15;
  const roundFactor = Math.min(15, roundNumber * 2);

  const tensionScore = Math.min(100, damageFactor + enemyFactor + deathsDoorFactor + roundFactor);

  // Determine Pacing State
  let pacingState = 'optimal';
  let pacingLabel = 'Balanced Tactical Engagement';
  let pacingColor = '#22c55e';
  let advice = 'Combat pacing is currently well balanced. Allow players to execute tactical turns.';

  if (heroesAtDeathsDoor >= 2 || heroHealthRatio <= 0.25) {
    pacingState = 'crisis';
    pacingLabel = '🚨 Critical TPK Risk / Party Crisis';
    pacingColor = '#ef4444';
    advice = 'Party is on the verge of total collapse. Consider introducing a tactical extraction opportunity, adversary parley, or heroic inspiration.';
  } else if (heroHealthRatio >= 0.85 && enemyTokens.length <= 1 && roundNumber >= 2) {
    pacingState = 'blowout';
    pacingLabel = '⚡ Party Steamroll / Enemy Routing';
    pacingColor = '#38bdf8';
    advice = 'Party is sweeping through opposition without friction. Consider deploying drop-pod reinforcements, environmental hazards, or sudden objective countdowns.';
  } else if (roundNumber >= 4 && enemyTokens.length >= 3 && heroHealthRatio >= 0.5) {
    pacingState = 'stall';
    pacingLabel = '🟡 Tactical Stalemate / Combat Drag';
    pacingColor = '#f59e0b';
    advice = 'Combat has entered a defensive stalemate. Inject an environmental hazard, structural collapse, or adversary flank shift to accelerate resolution.';
  }

  // Filter suggested cards
  const suggestedCards = CANONICAL_WHISPER_CARDS.filter(card => {
    if (pacingState === 'crisis') return card.pacingTrigger === 'crisis' || card.id === 'adversary_parley';
    if (pacingState === 'blowout') return card.pacingTrigger === 'blowout';
    if (pacingState === 'stall') return card.pacingTrigger === 'stall';
    return true;
  });

  return {
    pacingState,
    pacingLabel,
    pacingColor,
    tensionScore,
    roundNumber,
    heroHealthRatio: Math.round(heroHealthRatio * 100),
    heroesAtDeathsDoor,
    enemyCount: enemyTokens.length,
    heroCount: heroTokens.length,
    advice,
    suggestedCards
  };
};
