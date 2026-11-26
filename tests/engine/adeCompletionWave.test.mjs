/**
 * @file adeCompletionWave.test.mjs
 * @description Regression tests for ADE Completion Wave fixes:
 * - A1: executeStageAiDecision (Architect guard, morale_broken retreat, action_ready 2d10 Defender Wins Ties)
 * - A2: adeStore.clearActiveStoryFlags (clears active project flags without clobbering sibling projects)
 * - B2: pcgGridHelpers (fore_aft symmetry + deckTheme, mining branches + rail tracks, outpost perimeter wall)
 * - C1: cortexAdeAssetBridge 21-export facade parity + Cortex <-> ADE round-trip consolidation
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { executeStageAiDecision } from '../../src/components/VTT/stage/stageAiDecisionExecutor.ts';
import { useADEStore } from '../../src/pages/Foundry/store/adeStore.ts';
import {
  applyStarshipSymmetryAndTheme,
  applyMiningBranchesAndRails,
  applyOutpostPerimeterWall
} from '../../src/pages/Foundry/MapMaker/components/pcgGridHelpers.ts';
import * as cortexBridge from '../../src/utils/cortexAdeAssetBridge.js';

function createEmptyGrid(rows, cols, floorInit = false) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ isFloor: floorInit }))
  );
}

test('A1: executeStageAiDecision enforces Architect role and invalid inputs', () => {
  const res = executeStageAiDecision({
    tokenId: 'npc_1',
    decision: { status: 'action_ready', targetId: 'hero_1' },
    tokens: [],
    currentMap: null,
    engineStore: { updatePosition: () => {}, applyDamage: () => {}, ephemeralData: {} },
    broadcastTokenMove: () => {},
    broadcastTokenVitals: () => {},
    broadcastChatCard: () => {},
    emitChatCard: () => {},
    setCombatLog: () => {},
    isArchitectRole: false
  });
  assert.equal(res.executed, false);
  assert.equal(res.reason, 'unauthorized_or_invalid');
});

test('A1: executeStageAiDecision executes morale_broken retreat away from nearest ally with map & broadcast sync', () => {
  const movedPositions = [];
  const mapUpdates = [];
  const moveBroadcasts = [];
  const chatCards = [];
  const broadcasts = [];
  let logs = [];

  const tokens = [
    { id: 'npc_1', name: 'Raider', x: 200, y: 200, elevation_ft: 5 },
    { id: 'hero_1', name: 'Vanguard', type: 'hero', x: 100, y: 200, elevation_ft: 0 }
  ];
  const currentMap = { id: 'map_1', tokens: tokens.map((t) => ({ ...t })) };

  const res = executeStageAiDecision({
    tokenId: 'npc_1',
    decision: { status: 'morale_broken', actionType: 'retreat_or_surrender' },
    tokens,
    currentMap,
    engineStore: {
      updatePosition: (id, x, y) => movedPositions.push({ id, x, y }),
      applyDamage: () => {},
      ephemeralData: {}
    },
    updateMap: (mapId, updates) => mapUpdates.push({ mapId, updates }),
    broadcastTokenMove: (id, x, y, elev) => moveBroadcasts.push({ id, x, y, elev }),
    broadcastTokenVitals: () => {},
    broadcastChatCard: (c) => broadcasts.push(c),
    emitChatCard: (c) => chatCards.push(c),
    setCombatLog: (updater) => {
      logs = typeof updater === 'function' ? updater(logs) : updater;
    },
    isArchitectRole: true
  });

  assert.equal(res.executed, true);
  assert.deepEqual(res.movedTo, { x: 340, y: 200 });
  assert.deepEqual(movedPositions, [{ id: 'npc_1', x: 340, y: 200 }]);
  assert.equal(mapUpdates.length, 1);
  assert.equal(mapUpdates[0].mapId, 'map_1');
  assert.equal(mapUpdates[0].updates.tokens[0].x, 340);
  assert.deepEqual(moveBroadcasts, [{ id: 'npc_1', x: 340, y: 200, elev: 5 }]);
  assert.equal(chatCards.length, 1);
  assert.equal(broadcasts.length, 1);
  assert.match(logs[0], /\[AI RETREAT\] Raider withdrew to \(340, 200\)/);
});

test('A1: executeStageAiDecision applies Tangent v6 Defender Wins Ties and rushes + damages on hit', () => {
  const damaged = [];
  const moved = [];
  const emittedCards = [];
  let logs = [];

  const tokens = [
    { id: 'npc_1', name: 'Striker', x: 0, y: 0, speed_ft: 30, attack_bonus: 4, damage_base: 8 },
    { id: 'hero_1', name: 'Target', type: 'hero', x: 200, y: 0, defense_dc: 15, armor_dr: 2 }
  ];

  // Tie case: d1=5, d2=6 => natural=11 + attack_bonus(4) = 15 === defense_dc(15) => MISS (Defender Wins Ties)
  const seqTie = [0.45, 0.55];
  let idxTie = 0;
  const tieRes = executeStageAiDecision({
    tokenId: 'npc_1',
    decision: { status: 'action_ready', actionType: 'standard_attack', targetId: 'hero_1' },
    tokens,
    currentMap: { id: 'm1', tokens },
    engineStore: {
      updatePosition: (id, x, y) => moved.push({ id, x, y }),
      applyDamage: (id, dmg, lethal) => damaged.push({ id, dmg, lethal }),
      ephemeralData: {}
    },
    broadcastTokenMove: () => {},
    broadcastTokenVitals: () => {},
    broadcastChatCard: () => {},
    emitChatCard: (c) => emittedCards.push(c),
    setCombatLog: (u) => { logs = typeof u === 'function' ? u(logs) : u; },
    rng: () => seqTie[idxTie++] ?? 0.5
  });

  assert.equal(tieRes.executed, true);
  assert.equal(tieRes.effectiveTotal, 15);
  assert.equal(tieRes.defenseDc, 15);
  assert.equal(tieRes.isHit, false);
  assert.equal(damaged.length, 0);

  // Rush + Hit case: d1=7, d2=7 => natural=14 + 4 = 18 > 15 => HIT (netDamage = 8 - 2 = 6)
  const seqHit = [0.65, 0.65];
  let idxHit = 0;
  const hitRes = executeStageAiDecision({
    tokenId: 'npc_1',
    decision: { status: 'action_ready', actionType: 'rush_and_fire', targetId: 'hero_1', weaponName: 'Arc Carbine' },
    tokens,
    currentMap: { id: 'm1', tokens },
    engineStore: {
      updatePosition: (id, x, y) => moved.push({ id, x, y }),
      applyDamage: (id, dmg, lethal) => damaged.push({ id, dmg, lethal }),
      ephemeralData: {}
    },
    broadcastTokenMove: () => {},
    broadcastTokenVitals: () => {},
    broadcastChatCard: () => {},
    emitChatCard: (c) => emittedCards.push(c),
    setCombatLog: (u) => { logs = typeof u === 'function' ? u(logs) : u; },
    rng: () => seqHit[idxHit++] ?? 0.5
  });

  assert.equal(hitRes.executed, true);
  assert.equal(hitRes.isHit, true);
  assert.equal(hitRes.netDamage, 6);
  assert.ok(hitRes.movedTo && hitRes.movedTo.x > 0);
  assert.deepEqual(moved, [{ id: 'npc_1', x: hitRes.movedTo.x, y: 0 }]);
  assert.deepEqual(damaged, [{ id: 'hero_1', dmg: 6, lethal: true }]);
  assert.equal(emittedCards.length, 2);
});

test('A2: useADEStore.clearActiveStoryFlags clears active story flags while preserving sibling stories', () => {
  const store = useADEStore.getState();
  store.setStoryScope('story_A');
  store.setStoryFlag('airlock_sealed', true, 'global', 'sc_1');
  store.setStoryScope('story_B');
  store.setStoryFlag('vault_bypassed', true, 'global', 'sc_2');
  store.setStoryScope('story_A');

  assert.equal(useADEStore.getState().storyFlagsByStory.story_A.airlock_sealed.value, true);
  assert.equal(useADEStore.getState().storyFlagsByStory.story_B.vault_bypassed.value, true);

  store.clearActiveStoryFlags('story_A');

  const nextState = useADEStore.getState();
  assert.equal(nextState.storyFlagsByStory.story_A, undefined);
  assert.deepEqual(nextState.storyFlags, {});
  assert.equal(nextState.storyFlagsByStory.story_B.vault_bypassed.value, true);
});

test('B2: pcgGridHelpers applies fore_aft symmetry + deck theme, mining branches/rails, and outpost perimeter walls', () => {
  // 1. Starship fore_aft symmetry + cyber_grid theme
  const shipGrid = createEmptyGrid(4, 6, false);
  shipGrid[1][1] = { isFloor: true, isLight: true, lightColor: '#ffffff' };
  shipGrid[2][0] = { isFloor: true, isProp: true, propName: 'Helm' };
  applyStarshipSymmetryAndTheme(shipGrid, 'fore_aft', 'cyber_grid');

  assert.equal(shipGrid[1][4].isFloor, true);
  assert.equal(shipGrid[1][4].deckTheme, 'cyber_grid');
  assert.equal(shipGrid[1][4].lightColor, '#22d3ee');
  assert.equal(shipGrid[2][5].propName, 'Helm');

  // 2. Mining branches + rail tracks vs no rail tracks
  const mineWithRails = createEmptyGrid(12, 14, false);
  for (let r = 3; r <= 6; r++) {
    for (let c = 3; c <= 10; c++) {
      mineWithRails[r][c].isFloor = true;
    }
  }
  const mineWithoutRails = mineWithRails.map((row) => row.map((cell) => ({ ...cell })));
  const fixedRng = () => 0.1;

  applyMiningBranchesAndRails(mineWithRails, 3, true, fixedRng);
  applyMiningBranchesAndRails(mineWithoutRails, 0, false, fixedRng);

  const railCount = mineWithRails.flat().filter((c) => c.propCategory === 'rail_track').length;
  const noRailCount = mineWithoutRails.flat().filter((c) => c.propCategory === 'rail_track').length;
  assert.ok(railCount > 0, 'Expected mining rail track props when includeRailTracks=true');
  assert.equal(noRailCount, 0);

  // 3. Outpost perimeter wall toggle
  const sealedOutpost = createEmptyGrid(12, 12, true);
  applyOutpostPerimeterWall(sealedOutpost, true, 1, 8);
  assert.equal(sealedOutpost[1][3].isFloor, false);
  assert.equal(sealedOutpost[6][1].isDoor, true);
  assert.equal(sealedOutpost[6][1].doorType, 'airlock');

  const openOutpost = createEmptyGrid(12, 12, false);
  applyOutpostPerimeterWall(openOutpost, false, 1, 8);
  assert.equal(openOutpost[6][0].isFloor, true);
  assert.equal(openOutpost[6][11].isFloor, true);
});

test('C1: cortexAdeAssetBridge maintains exact 21-export facade parity and projection/consolidation round-trip', () => {
  const expectedExports = [
    'ADE_TYPE_TO_CORTEX_COLLECTIONS',
    'COLLECTION_TO_ADE_TYPE',
    'COLLECTION_TO_CODEX_MATRIX',
    'CORTEX_BACKED_ADE_TYPES',
    'CORTEX_METAPHYSICS_COLLECTIONS',
    'CORTEX_PROPERTY_COLLECTIONS',
    'buildUnifiedAdeCatalog',
    'buildUnifiedPersonaList',
    'buildVttUnitFromPersona',
    'consolidateAdeElementToCortexPayload',
    'convertFolioToMcmRecord',
    'convertMcmToFolioPersona',
    'convertPersonaElementToFolio',
    'normalizeStoryModuleElement',
    'projectFolioPersonaToAdeElement',
    'projectOmnicortexRecordToAdeElement',
    'resolveSynthesisDescriptorsForAsset',
    'resolveSynthesisFactionIds',
    'resolveSynthesisOccupationIds',
    'resolveSynthesisOriginIds',
    'resolveTargetCortexCollection'
  ];

  assert.deepEqual(Object.keys(cortexBridge).sort(), expectedExports);

  const projected = cortexBridge.projectOmnicortexRecordToAdeElement(
    {
      id: 'item_arc_01',
      name: 'Arc Projector',
      description: 'Compact stun emitter.',
      tags: ['tech', 'nonlethal'],
      stats: { powerLevel: 4 }
    },
    'gear'
  );
  assert.equal(projected.id, 'cortex_gear_item_arc_01');
  assert.equal(projected.type, 'Property');
  assert.equal(projected.fields.dbmCategory, 'gear');

  const consolidated = cortexBridge.consolidateAdeElementToCortexPayload(projected);
  assert.equal(consolidated.targetCollection, 'gear');
  assert.equal(consolidated.payload.name, 'Arc Projector');
});
