/**
 * TANGENT SFF RP: Predictive Monte Carlo Encounter Balancer Service
 * Runs 500 rapid combat iterations between party and adversaries to forecast win probability, rounds, and casualties.
 */

/**
 * Runs a single combat simulation until one side is completely eliminated or round limit reached.
 */
const simulateSingleCombatEncounter = (heroes = [], enemies = [], maxRounds = 12) => {
  // Deep clone combatants
  let party = heroes.map(h => ({
    id: h.id,
    label: h.label || 'Hero',
    hp: h.health?.current !== undefined ? h.health.current : (h.hp?.current || 30),
    vitality: h.vitality?.current !== undefined ? h.vitality.current : 30,
    structure: h.structure?.current !== undefined ? h.structure.current : null,
    isSynthetic: Boolean(h.isSynthetic || h.structure),
    defense: Math.max(8, parseInt(h.defense || 12, 10)),
    attackMod: Math.max(0, parseInt(h.attackMod || h.skills?.Gunner || h.skills?.Melee || 4, 10)),
    damageDice: h.damageDice || '2d8+3',
    avgDamage: h.avgDamage || 11,
    armorDr: Math.max(0, parseInt(h.armorDr || h.dr || 2, 10)),
    toughness: Math.max(0, parseInt(h.toughness || h.stamina || 1, 10)),
    isDead: false
  }));

  let hostiles = enemies.map(e => ({
    id: e.id,
    label: e.label || 'Enemy',
    hp: e.health?.current !== undefined ? e.health.current : (e.hp?.current || 25),
    vitality: e.vitality?.current !== undefined ? e.vitality.current : 25,
    structure: e.structure?.current !== undefined ? e.structure.current : null,
    isSynthetic: Boolean(e.isSynthetic || e.structure),
    defense: Math.max(8, parseInt(e.defense || 11, 10)),
    attackMod: Math.max(0, parseInt(e.attackMod || e.tier ? (e.tier * 2 + 1) : 3, 10)),
    avgDamage: e.avgDamage || (e.tier ? (e.tier * 3 + 4) : 8),
    armorDr: Math.max(0, parseInt(e.armorDr || e.dr || 1, 10)),
    toughness: Math.max(0, parseInt(e.toughness || e.stamina || 1, 10)),
    isDead: false
  }));

  let round = 1;
  let casualties = 0;

  while (round <= maxRounds) {
    const activeHeroes = party.filter(h => !h.isDead && (h.isSynthetic ? h.structure > 0 : h.hp > 0));
    const activeEnemies = hostiles.filter(e => !e.isDead && (e.isSynthetic ? e.structure > 0 : e.hp > 0));

    if (activeHeroes.length === 0 || activeEnemies.length === 0) break;

    // 1. Party turn: Each active hero attacks a random enemy
    for (const hero of activeHeroes) {
      const livingEnemies = hostiles.filter(e => !e.isDead && (e.isSynthetic ? e.structure > 0 : e.hp > 0));
      if (livingEnemies.length === 0) break;
      const target = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];

      // 2d10 Roll
      const d1 = Math.floor(Math.random() * 10) + 1;
      const d2 = Math.floor(Math.random() * 10) + 1;
      const rollTotal = (d1 === 10 && d2 === 10) ? 30 : (d1 === 1 && d2 === 1) ? -10 : (d1 + d2);
      const attackTotal = rollTotal + hero.attackMod;

      if (attackTotal >= target.defense) {
        const rawDmg = Math.max(1, hero.avgDamage + (Math.floor(Math.random() * 5) - 2));
        const finalDmg = Math.max(1, rawDmg - (target.armorDr + target.toughness));

        if (target.isSynthetic) {
          target.structure = Math.max(0, target.structure - finalDmg);
          if (target.structure <= 0) target.isDead = true;
        } else {
          target.hp = Math.max(0, target.hp - finalDmg);
          if (target.hp <= 0) target.isDead = true;
        }
      }
    }

    // 2. Enemy turn: Each active enemy attacks a random hero
    const livingEnemies = hostiles.filter(e => !e.isDead && (e.isSynthetic ? e.structure > 0 : e.hp > 0));
    for (const enemy of livingEnemies) {
      const livingHeroes = party.filter(h => !h.isDead && (h.isSynthetic ? h.structure > 0 : h.hp > 0));
      if (livingHeroes.length === 0) break;
      const target = livingHeroes[Math.floor(Math.random() * livingHeroes.length)];

      const d1 = Math.floor(Math.random() * 10) + 1;
      const d2 = Math.floor(Math.random() * 10) + 1;
      const rollTotal = (d1 === 10 && d2 === 10) ? 30 : (d1 === 1 && d2 === 1) ? -10 : (d1 + d2);
      const attackTotal = rollTotal + enemy.attackMod;

      if (attackTotal >= target.defense) {
        const rawDmg = Math.max(1, enemy.avgDamage + (Math.floor(Math.random() * 5) - 2));
        const finalDmg = Math.max(1, rawDmg - (target.armorDr + target.toughness));

        if (target.isSynthetic) {
          target.structure = Math.max(0, target.structure - finalDmg);
          if (target.structure <= 0) {
            target.isDead = true;
            casualties++;
          }
        } else {
          target.hp = Math.max(0, target.hp - finalDmg);
          if (target.hp <= 0) {
            target.isDead = true;
            casualties++;
          }
        }
      }
    }

    round++;
  }

  const finalActiveHeroes = party.filter(h => !h.isDead && (h.isSynthetic ? h.structure > 0 : h.hp > 0));
  const finalActiveEnemies = hostiles.filter(e => !e.isDead && (e.isSynthetic ? e.structure > 0 : e.hp > 0));

  const partyWon = finalActiveHeroes.length > 0 && finalActiveEnemies.length === 0;

  return {
    partyWon,
    rounds: Math.min(maxRounds, round),
    casualties,
    partyRemainingHp: party.reduce((sum, h) => sum + (h.isSynthetic ? (h.structure || 0) : h.hp), 0),
    enemiesRemainingHp: hostiles.reduce((sum, e) => sum + (e.isSynthetic ? (e.structure || 0) : e.hp), 0)
  };
};

/**
 * Runs a 500-iteration Monte Carlo simulation of the encounter.
 */
export const runMonteCarloEncounterSim = (heroes = [], enemies = [], iterations = 500) => {
  if (heroes.length === 0 || enemies.length === 0) {
    return {
      iterations: 0,
      winRate: 100,
      lossRate: 0,
      avgRounds: 1,
      avgCasualties: 0,
      threatTier: 'Trivial',
      threatColor: '#22c55e',
      summary: 'No active adversaries or heroes to simulate.'
    };
  }

  let wins = 0;
  let totalRounds = 0;
  let totalCasualties = 0;

  for (let i = 0; i < iterations; i++) {
    const result = simulateSingleCombatEncounter(heroes, enemies);
    if (result.partyWon) wins++;
    totalRounds += result.rounds;
    totalCasualties += result.casualties;
  }

  const winRate = Math.round((wins / iterations) * 100);
  const lossRate = 100 - winRate;
  const avgRounds = Number((totalRounds / iterations).toFixed(1));
  const avgCasualties = Number((totalCasualties / iterations).toFixed(1));

  // Threat Tier Classification
  let threatTier = 'Standard';
  let threatColor = '#22c55e';

  if (winRate >= 95 && avgRounds <= 2.5) {
    threatTier = 'Trivial';
    threatColor = '#06b6d4';
  } else if (winRate >= 80) {
    threatTier = 'Standard';
    threatColor = '#22c55e';
  } else if (winRate >= 60) {
    threatTier = 'Challenging';
    threatColor = '#f59e0b';
  } else {
    threatTier = 'Deadly';
    threatColor = '#ef4444';
  }

  return {
    iterations,
    winRate,
    lossRate,
    avgRounds,
    avgCasualties,
    threatTier,
    threatColor,
    partyCount: heroes.length,
    enemyCount: enemies.length
  };
};
