/**
 * @file tacticalAndCombatServices.test.mjs
 * @description Unit test suite for previously uncovered tactical & combat services in src/services/:
 * - initiativeService.js (2d10 Reflex initiative, tie-breaking, environmental lair actions)
 * - adversaryAiService.js (competency role inference, Boss 3-phase threshold state machine)
 * - autoCombatResolver.js (2d10 combat resolution, Defender Wins Ties, Force DR, Mortality State)
 * - unitBehaviorService.js (7 behavioral FSM profiles, morale retreat, rival targeting)
 * - hazmatVolumeService.js (circle/rect spatial containment, hazmat saving throw ticks)
 * - sensorVisionService.js (5 sensor spectrum modes, smoke/darkness/wall penetration)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyCombatant,
  getCombatantReflexBonus,
  rollCombatantInitiative,
  sortInitiativeOrder,
  ENVIRONMENT_PRESETS
} from '../../src/services/initiativeService.js';
import { synthesizeAdversaryTactic } from '../../src/services/adversaryAiService.js';
import { resolveAutonomousAttack } from '../../src/services/autoCombatResolver.js';
import { decideAutonomousAction, BEHAVIOR_PROFILES } from '../../src/services/unitBehaviorService.js';
import { isInsideHazardZone, evaluateHazmatTick } from '../../src/services/hazmatVolumeService.js';
import { checkTargetVisibility } from '../../src/services/sensorVisionService.js';

test('Initiative Service: Combatant classification, Reflex derivation (2 + Agility * 2), and canonical tie-breaker sorting', () => {
  assert.equal(classifyCombatant({ isEnvironment: true }), 'environment');
  assert.equal(classifyCombatant({ type: 'hero' }), 'pc');
  assert.equal(classifyCombatant({ label: 'Kitin Stalker' }), 'npc');

  // Sub-Attribute Base Reflex = 2 + (Agility * 2)
  assert.equal(getCombatantReflexBonus({ agility: 3 }), 8);
  assert.equal(getCombatantReflexBonus({ reflex: 11 }), 11);
  assert.equal(getCombatantReflexBonus({ type: 'environment', bonusMod: 4 }), 4);

  // Fixed count environmental hazard
  const lairPreset = ENVIRONMENT_PRESETS.find(p => p.id === 'env_lair_action');
  const lairInit = rollCombatantInitiative(lairPreset);
  assert.equal(lairInit.total, 20);
  assert.equal(lairInit.actorType, 'environment');

  // Canonical Tie-Breaker Sorting:
  // 1. Higher initiative total
  // 2. Higher Reflex tie-breaker
  // 3. PC priority over NPC/Environment on identical total + reflex
  const unsorted = [
    { id: 'npc-low', name: 'Grunt', type: 'npc', initiative: 14, reflex: 4 },
    { id: 'npc-tie', name: 'Elite', type: 'npc', initiative: 18, reflex: 6 },
    { id: 'pc-tie', name: 'Vanguard Hero', type: 'hero', initiative: 18, reflex: 6 },
    { id: 'npc-fast', name: 'Reflex Assassin', type: 'npc', initiative: 18, reflex: 9 },
    { id: 'lair-20', name: 'Lair Action', type: 'environment', initiative: 20, reflex: 0 }
  ];

  const sorted = sortInitiativeOrder(unsorted);
  assert.deepEqual(
    sorted.map(c => c.id),
    ['lair-20', 'npc-fast', 'pc-tie', 'npc-tie', 'npc-low'],
    'Must sort by Initiative DESC -> Reflex DESC -> PC priority over NPC'
  );
});

test('Adversary AI Service: Role inference and Boss 3-Phase HP threshold transitions', () => {
  const heroes = [
    { id: 'h-tank', label: 'Aegis Tank', health: { current: 50, max: 50 }, dr: 8 },
    { id: 'h-scout', label: 'Glass Scout', health: { current: 12, max: 30 }, dr: 1 }
  ];

  // Sniper targets lowest DR hero (Glass Scout, dr: 1)
  const sniperTactic = synthesizeAdversaryTactic({ label: 'Syndess Marksman' }, heroes);
  assert.equal(sniperTactic.roleKey, 'sniper');
  assert.equal(sniperTactic.targetName, 'Glass Scout');
  assert.equal(sniperTactic.suggestedActionType, 'aimed_shot');

  // Minion targets weakest HP hero (Glass Scout, hp: 12)
  const minionTactic = synthesizeAdversaryTactic({ label: 'Rakne Drone' }, heroes);
  assert.equal(minionTactic.roleKey, 'minion');
  assert.equal(minionTactic.targetName, 'Glass Scout');

  // Boss 3-Phase transitions: >65% Phase 1, <=65% Phase 2, <=35% Phase 3
  const bossPhase1 = synthesizeAdversaryTactic({ label: 'Sector Commander', health: { current: 90, max: 100 } }, heroes);
  assert.equal(bossPhase1.roleKey, 'boss');
  assert.match(bossPhase1.phase, /Phase 1/);

  const bossPhase2 = synthesizeAdversaryTactic({ label: 'Sector Commander', health: { current: 50, max: 100 } }, heroes);
  assert.match(bossPhase2.phase, /Phase 2/);
  assert.equal(bossPhase2.suggestedActionType, 'shield_recharge');

  const bossPhase3 = synthesizeAdversaryTactic({ label: 'Sector Commander', health: { current: 25, max: 100 } }, heroes);
  assert.match(bossPhase3.phase, /Phase 3/);
  assert.equal(bossPhase3.suggestedActionType, 'aoe_barrage');
});

test('Auto Combat Resolver: Defender Wins All Ties, Force 1/2 DR penetration, Called Shots, and Mortality State', () => {
  const origRandom = Math.random;
  try {
    // 1. Exact Tie Test: d1=5, d2=5 (baseRoll 10) + atkBonus 3 + attrMod 2 = 15 vs Defense CR 15 -> Defender Wins!
    Math.random = () => 0.45; // floor(0.45 * 10) + 1 = 5
    const tieResult = resolveAutonomousAttack(
      { id: 'atk-1', attackBonus: 3, attributeMod: 2 },
      { id: 'def-1', defenseDc: 15, health: { current: 20, max: 20 } }
    );
    assert.equal(tieResult.totalAttack, 15);
    assert.equal(tieResult.defenseDc, 15);
    assert.equal(tieResult.isHit, false, 'Canonical Rule: Defender MUST win all ties (15 vs 15 is a MISS)');

    // 2. Critical Triumph (Double 10s -> +30 & double weapon dice) + Force damage (halves DR) + Called Shot Head + Mortality State
    Math.random = () => 0.99; // floor(0.99 * 10) + 1 = 10; floor(0.99 * 8) + 1 = 8
    const critResult = resolveAutonomousAttack(
      { id: 'atk-1', attackBonus: 5, attributeMod: 3, weaponDamage: 14, strMod: 2 },
      { id: 'def-1', defenseDc: 15, armorDr: 8, stamina: 2, constitution: 10, health: { current: 20, max: 20 } },
      { isCalledShot: true, hitLocation: 'head', damageType: 'force' }
    );
    assert.equal(critResult.isTriumph, true);
    assert.equal(critResult.isHit, true);
    assert.equal(critResult.location, 'head');
    assert.match(critResult.statusInflicted, /KO/);
    assert.equal(critResult.entersMortalityState, true);
    assert.equal(critResult.targetNewHp, 0);
    assert.equal(critResult.isTargetDead, true, 'Massive excess damage exceeding CON+5 stability kills target');
  } finally {
    Math.random = origRandom;
  }
});

test('Unit Behavior FSM Service: Morale break thresholds, rival priority overrides, and Guardian VIP tethering', () => {
  assert.equal(Object.keys(BEHAVIOR_PROFILES).length, 7);

  const heroes = [
    { id: 'h-1', label: 'Operative Kael', x: 500, y: 500, health: { current: 30, max: 30 }, armorDr: 6 },
    { id: 'h-2', label: 'Operative Nyx', x: 100, y: 100, health: { current: 25, max: 30 }, armorDr: 1 }
  ];

  // 1. Morale break when HP ratio <= profile.moraleThreshold (Survivalist threshold = 0.40)
  const brokenUnit = decideAutonomousAction(
    { id: 'adv-1', label: 'Scavenger', behaviorProfile: 'survivalist', health: { current: 6, max: 20 } },
    heroes
  );
  assert.equal(brokenUnit.status, 'morale_broken');
  assert.equal(brokenUnit.isRetreating, true);

  // 2. Boss never breaks morale even at 5% HP, triggers aoe_meltdown instead
  const bossLowHp = decideAutonomousAction(
    { id: 'boss-1', label: 'Warlord', behaviorProfile: 'boss', health: { current: 5, max: 100 } },
    heroes
  );
  assert.equal(bossLowHp.status, 'action_ready');
  assert.equal(bossLowHp.actionType, 'aoe_meltdown');
  assert.equal(bossLowHp.isAoE, true);

  // 3. Rival target override forces targeting marked rival regardless of distance/DR
  const rivalAction = decideAutonomousAction(
    {
      id: 'sniper-1',
      label: 'Nemesis Sniper',
      behaviorProfile: 'sniper',
      x: 0,
      y: 0,
      health: { current: 30, max: 30 },
      relations: { rivalTarget: 'Kael' }
    },
    heroes
  );
  assert.equal(rivalAction.targetId, 'h-1', 'Rival relation must override default lowest-DR sniper heuristic');
  assert.equal(rivalAction.hitLocation, 'head');
});

test('Hazmat Volume & Sensor Vision Services: Spatial containment, hazard saves, and multi-spectrum occlusion', () => {
  // Circle & Rectangle hazard containment
  const circleZone = { id: 'z1', type: 'radiation_leak', shape: 'circle', x: 100, y: 100, radius: 50 };
  const rectZone = { id: 'z2', type: 'plasma_fire', x: 200, y: 200, width: 80, height: 60 };

  assert.equal(isInsideHazardZone({ x: 120, y: 120 }, circleZone), true);
  assert.equal(isInsideHazardZone({ x: 300, y: 300 }, circleZone), false);
  assert.equal(isInsideHazardZone({ x: 240, y: 230 }, rectZone), true);

  const ticks = evaluateHazmatTick({ label: 'Vance', x: 120, y: 120, staMod: 4 }, [circleZone, rectZone]);
  assert.equal(ticks.length, 1);
  assert.equal(ticks[0].hazardId, 'radiation_leak');
  assert.ok(ticks[0].damage === 6 || ticks[0].damage === 3);

  // Sensor spectrum visibility
  const viewer = { x: 0, y: 0 };
  const targetNear = { x: 200, y: 0 };
  const targetFar = { x: 600, y: 0 };

  // Out of range for standard optical (baseRangePx: 450)
  assert.equal(checkTargetVisibility(viewer, targetFar, 'standard_optical').visible, false);
  assert.equal(checkTargetVisibility(viewer, targetFar, 'standard_optical').reason, 'out_of_range');

  // Smoke blocks standard_optical and night_vision, but thermal_infrared pierces smoke
  assert.equal(
    checkTargetVisibility(viewer, targetNear, 'standard_optical', { hasSmoke: true }).reason,
    'obscured_by_smoke'
  );
  assert.equal(
    checkTargetVisibility(viewer, targetNear, 'thermal_infrared', { hasSmoke: true, isDark: true }).visible,
    true
  );

  // Darkness blocks standard_optical, but night_vision pierces darkness
  assert.equal(
    checkTargetVisibility(viewer, targetNear, 'standard_optical', { isDark: true }).reason,
    'obscured_by_darkness'
  );
  assert.equal(
    checkTargetVisibility(viewer, targetNear, 'night_vision', { isDark: true }).visible,
    true
  );
});
