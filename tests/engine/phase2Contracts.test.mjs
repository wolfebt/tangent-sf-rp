/**
 * @file phase2Contracts.test.mjs
 * @description Phase 2 regression tests covering P0/P1 data integrity & contract repairs:
 *   - Cortex consolidation losslessness & TL-0 / combined "DR 6 / AP 4" parsing
 *   - UVTT tuple endpoint X/Y coordinate parsing
 *   - Breached wall vision permeability
 *   - StoryFlagRecord { value } unwrapping in adeEngineBridge
 *   - Encounter simulator attackMod operator-precedence fix
 *   - ModifierService empty invocations ("[]") classification
 *   - Foundry VTT actor & wall export mapping
 *   - VolatileSharder absolute setHealth / setVitality / setStructure clamping
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { consolidateAdeElementToCortexPayload } from '../../src/utils/cortexAdeAssetBridge.js';
import { parseUniversalVtt } from '../../src/services/uvttImportService.js';
import {
  WALL_TYPES,
  damageWallSegment,
  doesWallBlockVision
} from '../../src/schemas/vttWallSchema.js';
import { adjudicateActionCheck } from '../../src/services/ade/adeEngineBridge.ts';
import { runMonteCarloEncounterSim } from '../../src/services/encounterSimService.js';
import { ModifierService } from '../../src/services/modifierService.ts';
import { FoundryVttJsonExporterService } from '../../src/engine/compilers/FoundryVttJsonExporter.ts';
import { useEngineStore } from '../../src/engine/state/VolatileSharder.ts';

test('Phase 2.1: consolidateAdeElementToCortexPayload preserves prose, customFields, Lorebook, domain fields, TL-0, and DR/AP', () => {
  const gearRes = consolidateAdeElementToCortexPayload({
    id: 'elem_gear_1',
    type: 'Property',
    propertySubcategory: 'armoring',
    title: 'Aegis EVA Rig',
    content: '<p>Reinforced void-rated carapace.</p>',
    customFields: [{ id: 'cf1', label: 'Batch', value: 'MK-IV' }],
    fields: {
      techLevel: 'TL-0',
      metaLevel: 'ML-0',
      dr: 'DR 6 / AP 4',
      cost: '1200',
      triggerLogic: 'AND_ALL',
      loreBudgetTokens: '180',
      loreSuppressCondition: 'alarm_triggered == true',
      pairedMapId: 'map_dock_7',
      weatherPreset: 'ion_storm',
      clockGoal: '6-Segment Breach',
      disposition: 'Hostile'
    }
  });

  assert.equal(gearRes.targetCollection, 'armoring');
  assert.equal(gearRes.payload.content, '<p>Reinforced void-rated carapace.</p>');
  assert.deepEqual(gearRes.payload.customFields, [{ id: 'cf1', label: 'Batch', value: 'MK-IV' }]);
  assert.equal(gearRes.payload.tech_level, 0);
  assert.equal(gearRes.payload.meta_level, 0);
  assert.equal(gearRes.payload.dr, 6);
  assert.equal(gearRes.payload.ap, 4);
  assert.equal(gearRes.payload.triggerLogic, 'AND_ALL');
  assert.equal(gearRes.payload.loreBudgetTokens, 180);
  assert.equal(gearRes.payload.loreSuppressCondition, 'alarm_triggered == true');
  assert.equal(gearRes.payload.pairedMapId, 'map_dock_7');
  assert.equal(gearRes.payload.weatherPreset, 'ion_storm');
  assert.equal(gearRes.payload.clockGoal, '6-Segment Breach');
  assert.equal(gearRes.payload.disposition, 'Hostile');

  const speciesZeroRes = consolidateAdeElementToCortexPayload({
    id: 'elem_sp_0',
    type: 'Species',
    title: 'Pre-FTL Drifter',
    fields: { techLevel: 'TL-0', meta_level: 0 }
  });
  assert.equal(speciesZeroRes.payload.tech_level, 0);

  const factionTl4Res = consolidateAdeElementToCortexPayload({
    id: 'elem_fac_4',
    type: 'Faction',
    title: 'Orbital Syndicate',
    fields: { techLevel: 'TL-4', metaLevel: 'ML-2' }
  });
  assert.equal(factionTl4Res.payload.tech_level, 4);
  assert.equal(factionTl4Res.payload.meta_level, 2);
});

test('Phase 2.2: uvttImportService reads tuple p2Raw[0] for X coordinate in LoS and portals', () => {
  const parsed = parseUniversalVtt({
    resolution: { pixels_per_grid: 100, map_size: { x: 10, y: 10 } },
    line_of_sight: [[[1, 2], [5, 7]]],
    portals: [{ bounds: [[1, 2], [5, 7]], closed: true, freemove: false }],
    lights: []
  });

  assert.equal(parsed.walls.length, 2);
  assert.deepEqual(parsed.walls[0].p1, { x: 100, y: 200 });
  assert.deepEqual(parsed.walls[0].p2, { x: 500, y: 700 });
  assert.deepEqual(parsed.walls[1].p1, { x: 100, y: 200 });
  assert.deepEqual(parsed.walls[1].p2, { x: 500, y: 700 });
});

test('Phase 2.3: breached solid wall no longer blocks line of sight', () => {
  const solidWall = {
    id: 'wall_bulkhead',
    type: WALL_TYPES.SOLID,
    p1: { x: 0, y: 0 },
    p2: { x: 100, y: 0 },
    breachHp: 50
  };
  assert.equal(doesWallBlockVision(solidWall), true);

  const breached = damageWallSegment(solidWall, 50);
  assert.equal(breached.breachHp, 0);
  assert.equal(doesWallBlockVision(breached), false);
});

test('Phase 2.4: adjudicateActionCheck unwraps StoryFlagRecord.value instead of checking object truthiness', () => {
  const falseFlagMandate = adjudicateActionCheck({
    actionText: 'Hack security console',
    targetDC: 12,
    storyFlags: { alarm_triggered: { key: 'alarm_triggered', value: false } },
    diceOverride: [5, 6]
  });
  assert.equal(falseFlagMandate.diceSummary.targetDC, 12);

  const trueFlagMandate = adjudicateActionCheck({
    actionText: 'Hack security console',
    targetDC: 12,
    storyFlags: { alarm_triggered: { key: 'alarm_triggered', value: true } },
    diceOverride: [5, 6]
  });
  assert.equal(trueFlagMandate.diceSummary.targetDC, 14);
});

test('Phase 2.5: encounterSimService handles enemy attackMod without NaN operator-precedence bug', () => {
  const result = runMonteCarloEncounterSim(
    [{ id: 'h1', label: 'Vance', health: { current: 35 }, vitality: { current: 25 }, defense: 13, attackMod: 7, avgDamage: 12 }],
    [{ id: 'e1', label: 'Corsair', health: { current: 20 }, defense: 11, attackMod: 6, avgDamage: 8 }],
    50
  );

  assert.equal(Number.isFinite(result.winRate), true);
  assert.equal(Number.isFinite(result.avgRounds), true);
  assert.equal(Number.isFinite(result.avgCasualties), true);
  assert.ok(result.avgRounds >= 1);
});

test('Phase 2.6: ModifierService does not treat empty invocations JSON string "[]" as Psion', () => {
  const nonPsionMod = ModifierService.createModifierFromPerson({
    id: 'p_cmd',
    title: 'Cmdr. Hale',
    fields: { magicLevel: 0, invocations: '[]', mcmRole: 'Commander' }
  });
  assert.notEqual(nonPsionMod.name.includes('Warp Flux Static'), true);

  const psionMod = ModifierService.createModifierFromPerson({
    id: 'p_psi',
    title: 'Esper Voss',
    fields: { magicLevel: 0, invocations: '["Kinetic Pulse"]', mcmRole: 'Commander' }
  });
  assert.equal(psionMod.name.includes('Warp Flux Static'), true);
});

test('Phase 2.7: FoundryVttJsonExporter exports Personas as actors and sets wall movement/vision flags accurately', () => {
  const exporter = new FoundryVttJsonExporterService();
  const { pack, stats } = exporter.exportToFoundryJson({
    scenarios: [],
    elements: [
      { id: 'p1', type: 'Persona', title: 'Kaelen Vance', fields: { hp: 32, tl: 4 } },
      { id: 'i1', type: 'Property', title: 'Arc Pistol', fields: { tl: 3 } }
    ],
    maps: [
      {
        title: 'Airlock Alpha',
        walls: [
          { type: 'solid', p1: { x: 0, y: 0 }, p2: { x: 100, y: 0 } },
          { type: 'window', p1: { x: 100, y: 0 }, p2: { x: 200, y: 0 } },
          { type: 'solid', p1: { x: 200, y: 0 }, p2: { x: 300, y: 0 }, breachHp: 0, doorState: 'breached' },
          { type: 'door', p1: { x: 300, y: 0 }, p2: { x: 400, y: 0 }, isOpen: false }
        ]
      }
    ]
  });

  assert.equal(stats.actors, 1);
  assert.equal(stats.items, 1);
  assert.equal(pack.actors[0].name, 'Kaelen Vance');
  assert.equal(pack.items[0].name, 'Arc Pistol');

  const exportedWalls = pack.scenes[0].walls;
  assert.equal(exportedWalls[0].move, 20);
  assert.equal(exportedWalls[0].sense, 20);
  assert.equal(exportedWalls[1].move, 20);
  assert.equal(exportedWalls[1].sense, 0);
  assert.equal(exportedWalls[2].move, 0);
  assert.equal(exportedWalls[2].sense, 0);
  assert.equal(exportedWalls[3].door, 1);
  assert.equal(exportedWalls[3].ds, 0);
});

test('Phase 2.8: VolatileSharder setHealth / setVitality / setStructure set clamped absolute values without healing on reduction', () => {
  const store = useEngineStore.getState();
  store.loadStaticEntity({
    id: 'op-phase2-hp',
    name: 'Test Operative',
    base_hp: 30,
    base_health: 30,
    base_vitality: 25,
    base_structure: 55,
    is_synthetic: false,
    tech_level: 3,
    armor_dr: 4
  });

  store.setHealth('op-phase2-hp', 12);
  let eph = useEngineStore.getState().ephemeralData['op-phase2-hp'];
  assert.equal(eph.current_health, 12);
  assert.equal(eph.current_hp, 12);

  store.setHealth('op-phase2-hp', 0);
  eph = useEngineStore.getState().ephemeralData['op-phase2-hp'];
  assert.equal(eph.current_health, 0);
  assert.ok(eph.active_conditions.includes('status_incapacitated'));
  assert.ok(eph.active_conditions.includes('status_bleeding_out'));

  store.setHealth('op-phase2-hp', 999);
  eph = useEngineStore.getState().ephemeralData['op-phase2-hp'];
  assert.equal(eph.current_health, 30);
  assert.equal(eph.active_conditions.includes('status_incapacitated'), false);

  store.setVitality('op-phase2-hp', 9);
  assert.equal(useEngineStore.getState().ephemeralData['op-phase2-hp'].current_vitality, 9);

  store.loadStaticEntity({
    id: 'op-phase2-synth',
    name: 'Test Automaton',
    base_hp: 60,
    base_structure: 60,
    is_synthetic: true,
    tech_level: 4,
    armor_dr: 6
  });
  store.setStructure('op-phase2-synth', 22);
  const synthEph = useEngineStore.getState().ephemeralData['op-phase2-synth'];
  assert.equal(synthEph.current_structure, 22);
  assert.equal(synthEph.current_hp, 22);
});
