/**
 * @file extendedServicesSuite.test.mjs
 * @description Comprehensive unit & integration test suite for the full complement of Tangent SF RP
 * tactical, campaign, social, cyber-deck, starship, and session services (Option 1 Complete Coverage):
 * - aoeHazardService.js (Circle, Cone, Line blast templates & Reflex/Fortitude save falloff)
 * - conditionService.js (Turn-start affliction ticks, synthetic poison immunity, duration expiry)
 * - cyberDeckService.js (ICE breach progression, trace accumulation, SiphonCredits extraction)
 * - encounterSimService.js (Monte Carlo encounter balancer & threat tier classification)
 * - entityHydrator.js (Omnicortex static & custom catalog entity hydration)
 * - factionWebService.js (Party reputation [-3, +3] & 0–5 star heat levels)
 * - galaxySectorService.js (Procedural 8x6 parsec starmap, UWP codes & jump lanes)
 * - interactiveObjectService.js (Armor DR soak & volatile plasma canister secondary blasts)
 * - mapPingService.js (Radar beacon creation & expiration filtering)
 * - modularStarshipService.js (Chassis hardpoints, reactor MW power budget & deficit detection)
 * - npcSocialEngine.js & socialMatrixService.js (Disposition tiers, bribery, intimidation & MoS shifts)
 * - reactionService.js & reactionTriggerService.js (Reaction economy, melee opportunity strikes & overwatch)
 * - skillChallengeService.js (Progress clocks, critical triumph failure recovery & completion)
 * - tacticalBarksService.js, aimeDirectorService.js & bastionWhisperService.js (Combat barks, AIME commentary & pacing)
 * - vttSquadService.js & vttTeamService.js (Architect/Operator token control RBAC)
 * - sessionRecapService.js, adventureLogService.js & customFolderService.js (Recap markdown, logs & folders)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getAoEPreset,
  getTokensInCircle,
  getTokensInCone,
  getTokensInLine,
  resolveAoEImpact
} from '../../src/services/aoeHazardService.js';
import {
  getConditionDefinition,
  applyConditionToToken,
  evaluateTokenConditionsOnTurnStart,
  removeConditionFromToken
} from '../../src/services/conditionService.js';
import {
  createHackingSession,
  executeDeckProgram,
  getCanonicalDataSlates
} from '../../src/services/cyberDeckService.js';
import { runMonteCarloEncounterSim } from '../../src/services/encounterSimService.js';
import { resolveEntity, hydrateElementEntities } from '../../src/services/entityHydrator.js';
import {
  getCanonicalFactions,
  getCanonicalRelationships,
  getHeatDefinition,
  adjustPartyReputation
} from '../../src/services/factionWebService.js';
import { generateSectorStarmap } from '../../src/services/galaxySectorService.js';
import { applyDamageToObject, interactWithObject } from '../../src/services/interactiveObjectService.js';
import { createTacticalPing, filterExpiredPings } from '../../src/services/mapPingService.js';
import { computeVesselStats } from '../../src/services/modularStarshipService.js';
import { getDispositionTier, resolveSocialAction } from '../../src/services/npcSocialEngine.js';
import {
  getReactionDefinition,
  canTokenReact,
  spendTokenReaction,
  restoreTokenReaction
} from '../../src/services/reactionService.js';
import { checkMovementReactions } from '../../src/services/reactionTriggerService.js';
import { createSkillChallenge, evaluateSkillChallengeRoll } from '../../src/services/skillChallengeService.js';
import { generateNpcSocialProfile, evaluateDispositionShift } from '../../src/services/socialMatrixService.js';
import { getTacticalBark } from '../../src/services/tacticalBarksService.js';
import {
  VTT_ROLES,
  createDefaultSquadRoster,
  isUserArchitect,
  canUserControlToken,
  setAllowPlayerOverride
} from '../../src/services/vttSquadService.js';
import * as vttTeamService from '../../src/services/vttTeamService.js';
import { SessionJournal } from '../../src/services/sessionRecapService.js';
import { generateCombatCommentary } from '../../src/services/aimeDirectorService.js';
import { analyzeCombatPacing } from '../../src/services/bastionWhisperService.js';
import { createFolder, updateFolder, deleteFolder, getFolders } from '../../src/services/customFolderService.js';
import { AdventureLogService } from '../../src/services/adventureLogService.js';

test('AoE Hazard Service: Circle, Cone, and Line blast geometry & save/soak resolution', () => {
  const frag = getAoEPreset('frag_grenade');
  assert.equal(frag.id, 'frag_grenade');

  const tokens = [
    { id: 't1', label: 'Core Target', x: 110, y: 100, stamina: 2, armorDr: 3 },
    { id: 't2', label: 'Outer Target', x: 160, y: 100, stamina: 1, armorDr: 1 },
    { id: 't3', label: 'Distant Safe', x: 400, y: 400, stamina: 1, armorDr: 1 },
    { id: 't4', label: 'Dead Body', x: 105, y: 100, isDead: true }
  ];

  const circleHits = getTokensInCircle({ x: 100, y: 100 }, 75, tokens);
  assert.equal(circleHits.length, 2, 'Dead and out-of-range tokens must be excluded');
  assert.equal(circleHits[0].zone, 'core');
  assert.equal(circleHits[1].zone, 'outer');

  const coneHits = getTokensInCone({ x: 100, y: 100 }, 0, 60, 120, tokens);
  assert.equal(coneHits.length, 2);

  const lineHits = getTokensInLine({ x: 100, y: 100 }, { x: 200, y: 100 }, 30, tokens);
  assert.equal(lineHits.length, 2);

  const impacts = resolveAoEImpact(frag, circleHits, {
    saveRolls: { t1: 20, t2: 5 }
  });
  assert.equal(impacts[0].saved, true);
  assert.equal(impacts[0].appliedCondition, null, 'Saved target avoids applied condition');
  assert.equal(impacts[1].saved, false);
  assert.equal(impacts[1].appliedCondition, 'Prone');
});

test('Condition Service: Turn-start damage ticks, synthetic poison immunity, and duration expiration', () => {
  const bleedDef = getConditionDefinition('Bleeding');
  assert.equal(bleedDef.id, 'Bleeding');

  // Biological token with Bleeding (1 round left)
  let bioToken = {
    id: 'bio-1',
    health: { current: 20, max: 30 },
    vitality: { current: 20, max: 30 },
    conditions: []
  };
  bioToken = applyConditionToToken(bioToken, 'Bleeding', 1);
  assert.ok(bioToken.conditions.includes('Bleeding'));

  const turnTick = evaluateTokenConditionsOnTurnStart(bioToken);
  assert.equal(turnTick.updatedToken.health.current, 17, 'Bleeding ticks 3 lethal health damage');
  assert.ok(turnTick.expiredConditions.includes('Bleeding'), '1-round condition expires after turn tick');

  // Synthetic token immune to Poisoned vitality toxin
  let synthToken = {
    id: 'synth-1',
    isSynthetic: true,
    structure: { current: 40, max: 40 },
    conditions: []
  };
  synthToken = applyConditionToToken(synthToken, 'Poisoned', 2);
  const synthTick = evaluateTokenConditionsOnTurnStart(synthToken);
  assert.equal(synthTick.updatedToken.structure.current, 40, 'Synthetic unit takes 0 damage from Poisoned');
  assert.equal(synthTick.triggeredEffects[0].type, 'immune');

  const cleaned = removeConditionFromToken(synthTick.updatedToken, 'Poisoned');
  assert.equal(cleaned.conditions.length, 0);
});

test('Cyber-Deck Service & Interactive Objects: ICE breaches, credit siphoning, and explosive barrel cascades', () => {
  assert.ok(getCanonicalDataSlates().length >= 3);

  let session = createHackingSession('tier1', 'slate_pirate_nav');
  assert.equal(session.currentIceHp, 15);
  assert.equal(session.isBreached, false);

  // Execute SiphonCredits with high custom roll (18 -> 9+9 + 5 = 23 vs DC 11)
  session = executeDeckProgram(session, 'siphoncredits_pay', 5, 18);
  assert.ok(session.creditsExtracted >= 600);

  // Execute BruteForce with Critical Triumph (customRoll 20 -> 10+10) to breach remaining ICE
  session = executeDeckProgram(session, 'bruteforce_exe', 5, 20);
  assert.equal(session.isBreached, true);
  assert.equal(session.currentIceHp, 0);

  // Interactive object explosion & terminal slicing
  const barrel = { id: 'obj-1', type: 'explosive_canister', x: 100, y: 100, structure: 10 };
  const nearbyTokens = [{ id: 'tok-near', label: 'Guard', x: 120, y: 100 }];
  const blastResult = applyDamageToObject(barrel, 25, nearbyTokens);
  assert.equal(blastResult.isDestroyed, true);
  assert.equal(blastResult.affectedTokens.length, 1);
  assert.ok(blastResult.affectedTokens[0].damage > 0);
  assert.equal(blastResult.affectedTokens[0].condition, 'Burning');

  const sliceResult = interactWithObject({ id: 'term-1', type: 'security_terminal' }, { label: 'Vance', techSkill: 5 }, 'hack', 18);
  assert.equal(sliceResult.isSuccess, true);
});

test('Encounter Sim, Modular Starship, Galaxy Sector & Entity Hydrator Services', () => {
  // 1. Monte Carlo Encounter Balancer
  const sim = runMonteCarloEncounterSim(
    [{ id: 'h1', label: 'Vance', hp: { current: 45 }, attackMod: 8, avgDamage: 18, defense: 15, armorDr: 5 }],
    [{ id: 'e1', label: 'Drone', hp: { current: 12 }, attackMod: 2, avgDamage: 5, defense: 10, armorDr: 1 }],
    50
  );
  assert.equal(sim.iterations, 50);
  assert.ok(sim.winRate >= 80, `Expected high winRate for overpowered hero, got ${sim.winRate}`);

  // 2. Modular Starship Forge
  const vessel = computeVesselStats(
    'strike_corvette_200',
    ['spinal_particle_lance', 'twin_turbo_laser'],
    ['hyperdrive_core_mk3', 'reinforced_armor_plating']
  );
  assert.equal(vessel.totalHullSp, 100); // 80 base + 20 plating
  assert.equal(vessel.totalArmorDr, 6); // 4 base + 2 plating
  assert.equal(vessel.jumpRating, 3);
  assert.equal(vessel.isPowerDeficit, false);

  // 3. Galaxy Sector Starmap
  const starmap = generateSectorStarmap('hyperion_core');
  assert.equal(starmap.systems.length, 10);
  assert.ok(starmap.jumpLanes.length > 0);
  assert.match(starmap.systems[0].uwp, /^[A-E][0-9A-F]{6}-\d+$/);

  // 4. Entity Hydrator
  const customCat = [{ id: 'custom-wpn-1', name: 'Null-Phase Carbine', category: 'weaponry' }];
  const resolved = resolveEntity('weaponry', 'Null-Phase Carbine', customCat);
  assert.equal(resolved._source, 'user_catalog');
  const hydrated = hydrateElementEntities({
    name: 'Operative Kael',
    fields: { species: 'Human', weapon: 'Null-Phase Carbine' }
  }, customCat);
  assert.ok(hydrated && typeof hydrated === 'object');
});

test('Social Matrix, NPC Social Engine, Faction Web & Skill Challenge Services', () => {
  // Faction Web & Heat
  assert.ok(getCanonicalFactions().length >= 5);
  assert.ok(getCanonicalRelationships().length >= 5);
  assert.equal(getHeatDefinition(5).level, 5);
  const rep = adjustPartyReputation(1, 5);
  assert.equal(rep.reputation, 3, 'Reputation clamps at +3');
  assert.equal(rep.isAllied, true);

  // NPC Social Engine
  assert.equal(getDispositionTier(15).id, 'hostile');
  assert.equal(getDispositionTier(85).id, 'cooperative');
  const bribeRes = resolveSocialAction({ label: 'Sentry', disposition: 60 }, { label: 'Vance', chaMod: 5 }, 'bribe', 2000);
  assert.ok(bribeRes.newScore >= 0 && bribeRes.newScore <= 100);

  // Social Matrix
  const profile = generateNpcSocialProfile({ id: 'npc-1', label: 'Fixer' });
  assert.ok(profile.motivation.length > 0);
  const shift = evaluateDispositionShift(0, 'persuasion', 22, 12, false, false);
  assert.equal(shift.newTier, 1);

  // Skill Challenge Clock
  let challenge = createSkillChallenge('heist_vault_incursion', { requiredSuccesses: 2, maxFailures: 2 });
  challenge = evaluateSkillChallengeRoll(challenge, 'Vance', 'Stealth', 25, 13, true, false, false);
  assert.equal(challenge.currentSuccesses, 2, 'Critical Triumph grants 2 successes');
  assert.equal(challenge.isCompleted, true);
  assert.equal(challenge.outcome, 'victory');
});

test('Reactions, Movement Triggers, Squad RBAC, Barks, AIME Director, Whispers & Session Recap', async () => {
  // Reactions
  assert.equal(getReactionDefinition('opportunity_strike').id, 'opportunity_strike');
  let defender = { id: 'def-1', label: 'Sentry', team: 'opfor', x: 100, y: 100, isOverwatch: true };
  assert.equal(canTokenReact(defender), true);
  defender = spendTokenReaction(defender);
  assert.equal(canTokenReact(defender), false);
  defender = restoreTokenReaction(defender);
  assert.equal(canTokenReact(defender), true);

  // Movement triggers (retreating from melee + entering overwatch)
  const runner = { id: 'run-1', label: 'Vance', team: 'players' };
  const triggers = checkMovementReactions(runner, { x: 120, y: 100 }, { x: 250, y: 100 }, [defender]);
  assert.equal(triggers.length, 2, 'Should trigger both opportunity_strike and overwatch_snapshot');

  // Squad & Team RBAC
  let roster = createDefaultSquadRoster();
  assert.equal(isUserArchitect(roster.userAssignments.gm_host), true);
  assert.equal(canUserControlToken(roster.userAssignments.gm_host, { id: 'any-token' }, 'gm_host'), true);
  const opAssign = { role: VTT_ROLES.OPERATOR, assignedTokenIds: ['hero-1'] };
  assert.equal(canUserControlToken(opAssign, { id: 'hero-1' }, 'player-1'), true);
  assert.equal(canUserControlToken(opAssign, { id: 'enemy-99' }, 'player-1'), false);
  roster = setAllowPlayerOverride(roster, false);
  assert.equal(roster.allowPlayerOverride, false);
  assert.equal(typeof vttTeamService.createDefaultTeamRoster, 'function');

  // Tactical Barks, AIME Director & Bastion Whispers
  const bark = getTacticalBark('engaging', 'Enforcer');
  assert.match(bark.quote, /\[RADIO RELAY\] @Enforcer:/);
  const commentary = generateCombatCommentary('critical_triumph', { attackerName: 'Vance', targetName: 'Mech', damage: 42 });
  assert.match(commentary.narrativeText, /TRIUMPH/);
  const pacing = analyzeCombatPacing(
    [{ id: 'h1', linkedHeroId: 'h1', health: { current: 5, max: 40 } }, { id: 'e1', isEnemy: true }],
    4
  );
  assert.equal(pacing.pacingState, 'crisis');

  // Map Pings
  const ping = createTacticalPing(200.4, 300.6, 'danger', 'Sniper Nest', 'Vance');
  assert.equal(ping.x, 200);
  assert.equal(ping.y, 301);
  assert.equal(ping.label, 'Sniper Nest');
  assert.equal(filterExpiredPings([ping], ping.expiresAt - 1000).length, 1);
  assert.equal(filterExpiredPings([ping], ping.expiresAt + 1000).length, 0);

  // Session Journal & Adventure Log
  SessionJournal.clearEvents();
  SessionJournal.setCampaignName('Operation Starfall');
  SessionJournal.logEvent({ type: 'crit', actor: 'Vance', target: 'Warden', details: 'Critical plasma strike', isCrit: true });
  const md = SessionJournal.generateMarkdownRecap();
  assert.match(md, /Operation Starfall/);
  assert.match(md, /Critical plasma strike/);

  await AdventureLogService.clearLogs();
  const logEntry = AdventureLogService.log({ actor: 'Vance', summary: 'Sector 7 Breach', details: 'Entered vault.' });
  assert.equal(AdventureLogService.getLogs().length, 1);
  assert.equal(logEntry.summary, 'Sector 7 Breach');
  assert.match(AdventureLogService.exportAsMarkdown('Sector 7 Ops'), /Sector 7 Breach/);

  // Custom Folders (safe fallback when localStorage is undefined in Node)
  assert.ok(Array.isArray(getFolders()));
  const folder = createFolder('Tactical Ops', 'persona', '#22d3ee');
  assert.equal(folder.name, 'Tactical Ops');
  updateFolder(folder.id, { name: 'Strike Ops' });
  deleteFolder(folder.id);
});

test('Module Package Service: Architect vs Operator sanitization, validation & hydration', async () => {
  const {
    buildModulePackagePayload,
    buildSanitizedOperatorPackagePayload,
    parseAndValidateModuleFile,
    hydrateModuleIntoCampaign
  } = await import('../../src/services/modulePackageService.js');

  const mockUniverse = {
    id: 'mod-starfall',
    projectName: 'Operation Starfall',
    techLevel: 4,
    scenarios: [
      {
        id: 'sc-1',
        title: 'Act I: Breach',
        gmNotes: 'Hidden Kitin ambush behind bulkhead',
        fields: { publicBrief: 'Board the derelict.', secrets: 'Reactor is rigged', gmNotes: 'Secret DC 18' }
      }
    ],
    maps: [
      {
        id: 'map-1',
        title: 'Hangar Bay',
        tokens: [
          { id: 't-hero', type: 'hero', label: 'Vance' },
          { id: 't-ambush', type: 'enemy', label: 'Hidden Stalker', isPlayerVisible: false }
        ],
        objects: [
          { id: 'o-crate', type: 'crate' },
          { id: 'o-mine', type: 'hazard', isTrap: true }
        ],
        waypoints: [
          { id: 'wp-1', isPlayerVisible: true },
          { id: 'wp-secret', isPlayerVisible: false }
        ]
      }
    ]
  };

  const mockElements = [
    { id: 'el-1', type: 'Persona', name: 'Inquisitor', fields: { biography: 'Known envoy', theSecret: 'Double agent', stats: { might: 5 } } },
    { id: 'el-2', type: 'Handout', name: 'Data Slate', fields: { theSecret: 'Preserved on handouts' } }
  ];

  const archPkg = buildModulePackagePayload(mockUniverse, mockElements);
  assert.equal(archPkg.format, 'tangent-adventure-module');
  assert.equal(archPkg.manifest.stats.totalTokens, 2);
  assert.equal(archPkg.scenarios[0].fields.secrets, 'Reactor is rigged');

  const opPkg = buildSanitizedOperatorPackagePayload(mockUniverse, mockElements);
  assert.equal(opPkg.format, 'tangent-player-module');
  assert.equal(opPkg.manifest.isSanitizedForPlayers, true);
  assert.equal(opPkg.scenarios[0].fields.secrets, undefined, 'Operator package must strip scenario secrets');
  assert.equal(opPkg.scenarios[0].gmNotes, undefined, 'Operator package must strip GM notes');
  assert.equal(opPkg.maps[0].tokens.length, 1, 'Operator package must filter hidden enemy tokens');
  assert.equal(opPkg.maps[0].objects.length, 1, 'Operator package must filter traps and hazards');
  assert.equal(opPkg.elements[0].fields.theSecret, undefined, 'Operator package must strip NPC secrets');
  assert.equal(opPkg.elements[1].fields.theSecret, 'Preserved on handouts', 'Handout elements remain intact');

  const validation = parseAndValidateModuleFile(JSON.stringify(archPkg));
  assert.equal(validation.isValid, true);
  assert.equal(validation.isV2, true);

  let hydratedMaps = 0;
  let hydratedScenarios = 0;
  let hydratedElements = 0;
  const hydrationStats = hydrateModuleIntoCampaign(validation.data, {
    addMap: () => { hydratedMaps++; },
    addStory: () => { hydratedScenarios++; },
    addSavedElement: () => { hydratedElements++; }
  });
  assert.equal(hydrationStats.mapsImported, 1);
  assert.equal(hydrationStats.scenariosImported, 1);
  assert.equal(hydrationStats.elementsImported, 2);
});

