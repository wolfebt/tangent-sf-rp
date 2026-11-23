/**
 * TANGENT SFF RP: Predictive Monte Carlo Encounter Balancer Service
 * Runs 500 rapid combat iterations between party and adversaries to forecast win probability, rounds, and casualties.
 */

import {
  resolveTangent2d10Check,
  calculateDamageMitigation,
  CANONICAL_DEFAULT_DEFENSE_CR,
  CANONICAL_CRIT_DAMAGE_MULTIPLIER
} from '../engine/rules/CanonicalCombatMath.ts';

/**
 * Runs a single combat simulation until one side is completely eliminated or round limit reached.
 */
const simulateSingleCombatEncounter = (heroes = [], enemies = [], maxRounds = 12) => {
  const numOr = (val, fallback) => {
    const parsed = parseInt(val, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const resolveHp = (unit, defaultHp) => {
    if (unit?.health?.current !== undefined) return numOr(unit.health.current, defaultHp);
    if (unit?.hp?.current !== undefined) return numOr(unit.hp.current, defaultHp);
    if (typeof unit?.hp === 'number') return unit.hp;
    if (typeof unit?.health === 'number') return unit.health;
    return defaultHp;
  };

  const buildCombatant = (unit, defaultLabel, defaultHp, defaultAtk, defaultDmg, defaultArmor) => {
    const hasVitality = unit?.vitality !== undefined && unit?.vitality !== null;
    const vitVal = hasVitality ? numOr(unit.vitality?.current ?? unit.vitality, defaultHp) : 0;
    const armorLayers = Array.isArray(unit?.armorLayers) && unit.armorLayers.length > 0
      ? unit.armorLayers
      : [Math.max(0, numOr(unit?.armorDr ?? unit?.dr, defaultArmor))];

    const isSynthetic = Boolean(unit?.isSynthetic || unit?.is_synthetic || unit?.structure !== undefined);
    const defaultStructure = unit?.structure?.current !== undefined
      ? numOr(unit.structure.current, 60)
      : (typeof unit?.structure === 'number' ? unit.structure : (isSynthetic ? 60 : null));

    return {
      id: unit.id,
      label: unit.label || defaultLabel,
      hp: resolveHp(unit, defaultHp),
      hasVitalityPool: hasVitality,
      vitality: vitVal,
      structure: defaultStructure,
      isSynthetic,
      defense: Math.max(8, numOr(unit?.defense, CANONICAL_DEFAULT_DEFENSE_CR)),
      attackMod: Math.max(0, numOr(unit?.attackMod ?? unit?.skills?.Ballistic ?? unit?.skills?.Gunner ?? unit?.skills?.Melee, defaultAtk)),
      damageDice: unit?.damageDice || '2d8+3',
      avgDamage: unit?.avgDamage ?? defaultDmg,
      penetration: Math.max(0, numOr(unit?.penetration, 0)),
      damageType: unit?.damageType || 'kinetic',
      armorLayers,
      toughness: Math.max(0, numOr(unit?.toughness ?? unit?.stamina, 1)),
      isDead: false
    };
  };

  // Deep clone combatants
  const party = heroes.map(h => buildCombatant(h, 'Hero', 30, 4, 11, 2));
  const hostiles = enemies.map(e =>
    buildCombatant(
      e,
      'Enemy',
      30,
      e?.tier ? e.tier * 2 + 1 : 3,
      e?.tier ? e.tier * 3 + 4 : 8,
      1
    )
  );

  let roundsCompleted = 0;
  let casualties = 0;

  while (roundsCompleted < maxRounds) {
    const activeHeroes = party.filter(h => !h.isDead && (h.isSynthetic ? h.structure > 0 : h.hp > 0));
    const activeEnemies = hostiles.filter(e => !e.isDead && (e.isSynthetic ? e.structure > 0 : e.hp > 0));

    if (activeHeroes.length === 0 || activeEnemies.length === 0) break;
    roundsCompleted++;

    const applyStrike = (attacker, target, countCasualtyOnDeath) => {
      const check = resolveTangent2d10Check({
        modifier: attacker.attackMod,
        targetCR: target.defense,
        isOpposed: true
      });
      if (!check.isSuccess) return;

      let rawDmg = Math.max(1, attacker.avgDamage + (Math.floor(Math.random() * 5) - 2));
      if (check.isCrit) {
        rawDmg *= CANONICAL_CRIT_DAMAGE_MULTIPLIER;
      }

      const mitigation = calculateDamageMitigation({
        rawDamage: rawDmg,
        armorLayers: target.armorLayers,
        penetration: attacker.penetration,
        damageType: attacker.damageType,
        staminaToughness: target.toughness
      });
      const finalDmg = mitigation.netDamage;

      if (target.isSynthetic) {
        target.structure = Math.max(0, target.structure - finalDmg);
        if (target.structure <= 0) {
          target.isDead = true;
          if (countCasualtyOnDeath) casualties++;
        }
      } else if (target.hasVitalityPool && !check.isCrit && finalDmg > 0) {
        const vitAbsorb = Math.min(target.vitality, finalDmg);
        target.vitality = Math.max(0, target.vitality - vitAbsorb);
        const spill = finalDmg - vitAbsorb;
        target.hp = Math.max(0, target.hp - spill);
        if (target.hp <= 0) {
          target.isDead = true;
          if (countCasualtyOnDeath) casualties++;
        }
      } else {
        target.hp = Math.max(0, target.hp - finalDmg);
        if (target.hp <= 0) {
          target.isDead = true;
          if (countCasualtyOnDeath) casualties++;
        }
      }
    };

    // 1. Party turn: Each active hero attacks a random enemy
    for (const hero of activeHeroes) {
      const livingEnemies = hostiles.filter(e => !e.isDead && (e.isSynthetic ? e.structure > 0 : e.hp > 0));
      if (livingEnemies.length === 0) break;
      const target = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
      applyStrike(hero, target, false);
    }

    // 2. Enemy turn: Each active enemy attacks a random hero
    const livingEnemies = hostiles.filter(e => !e.isDead && (e.isSynthetic ? e.structure > 0 : e.hp > 0));
    for (const enemy of livingEnemies) {
      const livingHeroes = party.filter(h => !h.isDead && (h.isSynthetic ? h.structure > 0 : h.hp > 0));
      if (livingHeroes.length === 0) break;
      const target = livingHeroes[Math.floor(Math.random() * livingHeroes.length)];
      applyStrike(enemy, target, true);
    }
  }

  const finalActiveHeroes = party.filter(h => !h.isDead && (h.isSynthetic ? h.structure > 0 : h.hp > 0));
  const finalActiveEnemies = hostiles.filter(e => !e.isDead && (e.isSynthetic ? e.structure > 0 : e.hp > 0));

  const partyWon = finalActiveHeroes.length > 0 && finalActiveEnemies.length === 0;

  return {
    partyWon,
    rounds: Math.max(1, Math.min(maxRounds, roundsCompleted)),
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
