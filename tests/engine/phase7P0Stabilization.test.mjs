/**
 * @file phase7P0Stabilization.test.mjs
 * @description Phase 7 P0 Stabilization Gate covering combat rules parity,
 *   3D LoS & canonical 14 units/ft vertical scale, QuickJSSandbox & image/SVG
 *   security hardening, and ADE persistence/bridge contracts.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { CombatArbitrator, SizeCategory } from '../../src/engine/rules/CombatArbitrator.ts';
import { DamagePipeline } from '../../src/engine/rules/DamagePipeline.ts';
import { computeTacticalAttackModifiers } from '../../src/services/rulesAdjudicatorService.js';
import { runMonteCarloEncounterSim } from '../../src/services/encounterSimService.js';
import { MechaSocketManager, UDUTier } from '../../src/engine/rules/MechaSocketManager.ts';
import { DBMFunctionRegistry } from '../../src/engine/ai/DBMFunctionRegistry.ts';

import {
  WORLD_UNITS_PER_FOOT,
  CELL_SIZE_WORLD,
  CELL_SIZE_FT,
  DEFAULT_WALL_HEIGHT_WORLD,
  feetToWorldUnits,
  worldUnitsToFeet
} from '../../src/engine/3d/scaleConstants.ts';
import { WallExtruder3D } from '../../src/engine/3d/geometry/WallExtruder3D.ts';
import { LoSRaycast3D } from '../../src/engine/3d/vision/LoSRaycast3D.ts';
import { TokenStandee3D } from '../../src/engine/3d/tokens/TokenStandee3D.ts';
import { TerrainMeshBuilder } from '../../src/engine/3d/geometry/TerrainMeshBuilder.ts';
import { WALL_TYPES, DOOR_STATES } from '../../src/schemas/vttWallSchema.js';

import { QuickJSSandbox } from '../../src/engine/scripting/QuickJSSandbox.ts';
import {
  containsDangerousSvgConstructs,
  sanitizeAndOptimizeImageForUpload
} from '../../src/utils/safeImageUpload.js';
import { resolveAssetTexture } from '../../src/engine/assets/assetVisualFallbacks.ts';
import { persistAdeElement } from '../../src/utils/adeElementPersistence.js';
import {
  consolidateAdeElementToCortexPayload,
  buildUnifiedAdeCatalog
} from '../../src/utils/cortexAdeAssetBridge.js';

test('Phase 7.2: CombatArbitrator sizes, Opposed vs Unopposed ties, DamagePipeline synthetic 60 SP, & Hardpoint UDU', async () => {
  const arb = new CombatArbitrator();
  assert.equal(SizeCategory.Enormous, 32);
  assert.equal(SizeCategory.Titanic, 64);

  // Unopposed meets CR (>=), Opposed loses ties (Defender Wins Ties)
  assert.equal(arb.resolveUnopposedRoll(15, 15).isHit, true);
  assert.equal(arb.resolveUnopposedRoll(14, 15).isHit, false);
  assert.equal(arb.resolveOpposedRoll(15, 15).isHit, false);
  assert.equal(arb.resolveOpposedRoll(16, 15).isHit, true);

  // DamagePipeline synthetic 60 SP default + 1.5x non-called-shot trauma threshold (60 * 1.5 * 0.333 = 30)
  const dp = new DamagePipeline();
  const synthLightHit = dp.resolveStrike(
    { rawDamage: 25, armorPenetration: 0, damageType: 'kinetic', isCritical: false, isCalledShot: false },
    { is_synthetic: true, current_structure: 60 },
    [],
    0,
    0,
    5
  );
  assert.equal(synthLightHit.structureDamage, 25);
  assert.equal(synthLightHit.appliedStatuses.includes('status_trauma_internal'), false);

  const synthHeavyHit = dp.resolveStrike(
    { rawDamage: 35, armorPenetration: 0, damageType: 'kinetic', isCritical: false, isCalledShot: false },
    { is_synthetic: true, current_structure: 60 },
    [],
    0,
    0,
    5
  );
  assert.equal(synthHeavyHit.appliedStatuses.includes('status_trauma_internal'), true);

  // rulesAdjudicatorService exponential size step differential (Medium=0 -> Enormous=32 is 5 steps => +32)
  const giantShot = computeTacticalAttackModifiers({
    attackerSizeId: 'medium',
    targetSizeId: 'enormous'
  });
  assert.equal(giantShot.netAttackMod, 32);

  // encounterSimService initializes synthetics at 60 SP instead of dead/null
  const synthSim = runMonteCarloEncounterSim(
    [{ id: 'synth_hero', isSynthetic: true, armorDr: 4, defense: 18, attackMod: 10, avgDamage: 22 }],
    [{ id: 'raider_1', hp: 12, armorDr: 0, defense: 10, attackMod: 0, avgDamage: 4 }],
    25
  );
  assert.ok(synthSim.winRate >= 90, `Synthetic 60 SP unit should dominate weak target, got winRate=${synthSim.winRate}`);

  // MechaSocketManager enforces per-slot capacityUDU
  const mechaMgr = new MechaSocketManager();
  const validMount = mechaMgr.validateHardpointMounts([
    { slotId: 's1', tier: UDUTier.Mount, capacityUDU: 1, installedGearId: 'cannon', installedGearUDU: 1 }
  ]);
  assert.equal(validMount.isValid, true);

  const overloadedMount = mechaMgr.validateHardpointMounts([
    { slotId: 's1', tier: UDUTier.Mount, capacityUDU: 1, installedGearId: 'heavy_cannon', installedGearUDU: 2 }
  ]);
  assert.equal(overloadedMount.isValid, false);

  // DBMFunctionRegistry resolve_called_shot applies 1.5x threshold for synthetic targets (30 HP * 1.5 * 0.333 = 15)
  const synthCalledUnder = await DBMFunctionRegistry.executeToolCall({
    name: 'resolve_called_shot',
    args: { targetLocation: 'optics', incomingDamage: 12, armorDr: 0, targetMaxHp: 30, isSynthetic: true }
  });
  assert.equal(synthCalledUnder.limbStatus, 'INTACT');
  assert.equal(synthCalledUnder.requiresMajorWoundCheck, false);

  const synthCalledOver = await DBMFunctionRegistry.executeToolCall({
    name: 'resolve_called_shot',
    args: { targetLocation: 'optics', incomingDamage: 16, armorDr: 0, targetMaxHp: 30, isSynthetic: true }
  });
  assert.equal(synthCalledOver.limbStatus, 'DISABLED');
  assert.equal(synthCalledOver.requiresMajorWoundCheck, true);
  assert.equal(synthCalledOver.attackPenalty, -5);
});

test('Phase 7.3: Canonical 3D scale (14 units/ft) and LoSRaycast3D open-door/window traversal', () => {
  assert.equal(CELL_SIZE_WORLD, 70);
  assert.equal(CELL_SIZE_FT, 5);
  assert.equal(WORLD_UNITS_PER_FOOT, 14);
  assert.equal(DEFAULT_WALL_HEIGHT_WORLD, 140);
  assert.equal(feetToWorldUnits(10), 140);
  assert.equal(worldUnitsToFeet(140), 10);

  const standees = new TokenStandee3D();
  const tokGroup = standees.createTokenGroup({ id: 'flyer', x: 70, y: 70, elevation_ft: 10 });
  assert.equal(tokGroup.position.y, 140);

  const terrainBuilder = new TerrainMeshBuilder();
  const plateauGroup = terrainBuilder.buildTerrainPlateaus([
    { id: 'plat_1', x: 0, y: 0, width: 70, height: 70, elevationOffsetFt: 10 }
  ]);
  assert.equal(plateauGroup.children.length, 1);
  assert.equal(plateauGroup.children[0].position.y, 0);

  const extruder = new WallExtruder3D();
  const raycaster = new LoSRaycast3D();
  const attacker = { id: 'a1', x: 35, y: -70, elevation_ft: 0 };
  const target = { id: 't1', x: 35, y: 70, elevation_ft: 0 };

  const closedDoorGroup = extruder.createWallMesh({
    id: 'door_closed',
    p1: { x: 0, y: 0 },
    p2: { x: 70, y: 0 },
    type: WALL_TYPES.DOOR,
    doorState: DOOR_STATES.CLOSED,
    isOpen: false
  });
  closedDoorGroup.updateMatrixWorld(true);
  const closedLos = raycaster.evaluateLoS(attacker, target, [closedDoorGroup]);
  assert.equal(closedLos.hasLoS, false, 'Closed door must block 3D line of sight');

  const openDoorGroup = extruder.createWallMesh({
    id: 'door_open',
    p1: { x: 0, y: 0 },
    p2: { x: 70, y: 0 },
    type: WALL_TYPES.DOOR,
    doorState: DOOR_STATES.OPEN,
    isOpen: true
  });
  openDoorGroup.updateMatrixWorld(true);
  const openLos = raycaster.evaluateLoS(attacker, target, [openDoorGroup]);
  assert.equal(openLos.hasLoS, true, 'Open door must permit 3D line of sight through ancestor userData');

  const windowGroup = extruder.createWallMesh({
    id: 'win_1',
    p1: { x: 0, y: 0 },
    p2: { x: 70, y: 0 },
    type: WALL_TYPES.WINDOW,
    blocksVision: false
  });
  windowGroup.updateMatrixWorld(true);
  const windowLos = raycaster.evaluateLoS(attacker, target, [windowGroup]);
  assert.equal(windowLos.hasLoS, true, 'Window must permit 3D line of sight');
});

test('Phase 7.4: QuickJSSandbox check2d10/roundTo/StoryFlags & SVG upload/fallback XSS guards', async () => {
  const sandbox = new QuickJSSandbox();

  // Default CR 15 and exact total === roll + bonus invariant
  const check = await sandbox.execute('return Dice.check2d10(4);');
  assert.equal(check.dc, 15);
  assert.equal(check.total, check.roll + 4);

  // roundTo clamps precision between 0 and 12 without RangeError
  const rounded = await sandbox.execute('return MathOps.roundTo(3.14159265, 99);');
  assert.equal(rounded, 3.14159265);

  // Concatenated StoryFlags __proto__ attempt runs safely without prototype pollution
  const flags = {};
  const polluted = await sandbox.execute(
    "StoryFlags.set('__' + 'proto__', { pwn: 1 }); StoryFlags.set('clean', 42); return StoryFlags.has('__' + 'proto__');",
    { storyFlags: flags }
  );
  assert.equal(polluted, false);
  assert.equal(flags.clean, 42);
  assert.equal(({}).pwn, undefined);

  // Dangerous SVG constructs rejected
  assert.equal(containsDangerousSvgConstructs('<svg onload="alert(1)"><rect /></svg>'), true);
  assert.equal(containsDangerousSvgConstructs('<svg><circle r="5" /></svg>'), false);

  const evilSvgBlob = new Blob(['<svg><script>alert(1)</script></svg>'], { type: 'image/svg+xml' });
  await assert.rejects(
    async () => sanitizeAndOptimizeImageForUpload(evilSvgBlob),
    /Blocked unsafe SVG|browser canvas/i
  );

  // assetVisualFallbacks rejects malicious base64 SVG data URI
  const maliciousB64 = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(9)</script></svg>').toString('base64');
  const resolved = resolveAssetTexture({ image_url: `data:image/svg+xml;base64,${maliciousB64}`, category: 'token' });
  assert.equal(resolved.includes(maliciousB64), false);
  assert.equal(resolved.includes('<script'), false);
});

test('Phase 7.5: adeElementPersistence non-admin local_override & cortexAdeAssetBridge preferField/singleton dedupe', async () => {
  const savedCalls = [];
  const toasts = [];

  // Permission denied on Cortex triggers campaign-local override with warning toast
  const localRes = await persistAdeElement({
    element: {
      id: 'elem_custom_species',
      type: 'Species',
      title: 'Kaelari',
      fields: { techLevel: 'TL-3' }
    },
    elementsCatalog: [{ id: 'elem_custom_species', title: 'Kaelari' }],
    saveEntry: async () => ({ ok: true, id: 'elem_custom_species', cloudSynced: false, permissionDenied: true, localOnly: true }),
    updateSavedElement: async (id, rec) => savedCalls.push({ id, rec }),
    showToast: (t) => toasts.push(t)
  });

  assert.equal(localRes?.dbmSyncStatus, 'local_override');
  assert.equal(localRes?.isPinnedToModule, true);
  assert.equal(savedCalls.length, 1);
  assert.equal(toasts[0]?.type, 'warning');

  // Explicit clearing of Faction & Setting fields does NOT resurrect stale cortexRaw values
  const clearedFaction = consolidateAdeElementToCortexPayload({
    id: 'fac_clear_1',
    type: 'Faction',
    title: 'Freeholders',
    fields: { motto: '', description: '' },
    cortexRaw: { id: 'fac_clear_1', name: 'Freeholders', motto: 'Old Motto', description: 'Old Desc' }
  });
  assert.equal(clearedFaction.payload.motto, '');
  assert.equal(clearedFaction.payload.description, '');

  const clearedSetting = consolidateAdeElementToCortexPayload({
    id: 'set_clear_1',
    type: 'Setting',
    title: 'Orbital Pier',
    fields: { climateWeather: '' },
    cortexRaw: { id: 'set_clear_1', name: 'Orbital Pier', climateWeather: 'Acid Squall' }
  });
  assert.equal(clearedSetting.payload.climateWeather, '');

  // Faction & Setting singleton deduplication in buildUnifiedAdeCatalog
  const catalog = buildUnifiedAdeCatalog({
    elementsCatalog: [
      { id: 'elem_pinned_fac', type: 'Faction', title: 'Iron Syndicate', dbmCategory: 'factions', dbmId: 'fac_iron', fields: { motto: 'Steel First' } },
      { id: 'elem_dup_fac', type: 'Faction', title: 'Iron Syndicate', fields: { description: 'Duplicate entry' } },
      { id: 'elem_pinned_set', type: 'Setting', title: 'Dock 9', dbmCategory: 'setting', dbmId: 'set_dock9', fields: {} },
      { id: 'elem_dup_set', type: 'Setting', title: 'Dock 9', fields: {} }
    ],
    dbData: {
      factions: [{ id: 'fac_iron', name: 'Iron Syndicate', motto: 'Old' }],
      setting: [{ id: 'set_dock9', name: 'Dock 9' }]
    }
  });

  const factionMatches = catalog.filter((e) => e.type === 'Faction' && e.title === 'Iron Syndicate');
  const settingMatches = catalog.filter((e) => e.type === 'Setting' && e.title === 'Dock 9');
  assert.equal(factionMatches.length, 1);
  assert.equal(settingMatches.length, 1);
});
