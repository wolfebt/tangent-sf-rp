/**
 * @file galleryModuleCompilerAndModifiers.test.mjs
 * @description Unit and integration tests for Story Gallery, Situational Modifiers,
 * VTT Module Compilation, and Ingestion.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Imports
import { ModifierService, MODIFIER_PRESETS } from '../../src/services/modifierService.ts';
import { 
  computeTacticalAttackModifiers, 
  computeNetSituationalModifiers 
} from '../../src/services/rulesAdjudicatorService.js';
import { VttModuleCompiler } from '../../src/services/vttModuleCompilerService.js';
import { deployCompiledPackage } from '../../src/utils/deployVttPackage.ts';

describe('Story Gallery Situational & Temporary Modifiers', () => {
  test('creates a default modifier cleanly', () => {
    const mod = ModifierService.createModifier({
      name: 'Custom Static Field',
      category: 'tech',
      effects: { techMod: -2, defenseMod: 1 }
    });

    assert.equal(mod.name, 'Custom Static Field');
    assert.equal(mod.category, 'tech');
    assert.equal(mod.isActive, true);
    assert.equal(mod.effects.techMod, -2);
    assert.equal(mod.effects.defenseMod, 1);
  });

  test('derives a situational aura modifier from a Persona', () => {
    const mockPersona = {
      id: 'persona_valen',
      title: 'Commander Valen',
      fields: {
        'char-name': 'Commander Valen',
        mcmRole: 'Commander',
        magicLevel: 0
      }
    };

    const mod = ModifierService.createModifierFromPerson(mockPersona);
    assert.match(mod.name, /Commander Valen/);
    assert.equal(mod.sourceType, 'person');
    assert.equal(mod.sourceId, 'persona_valen');
    assert.equal(mod.targetScope, 'allies');
    assert.equal(mod.effects.attackMod, 1);
  });

  test('derives a metaphysic dampening modifier from an Item', () => {
    const mockItem = {
      id: 'item_nullifier',
      title: 'Psi-Dampening Nullifier',
      fields: {
        properties: 'Ancient psionic suppressor artifact',
        tags: 'psi, tech, relic'
      }
    };

    const mod = ModifierService.createModifierFromItem(mockItem);
    assert.equal(mod.sourceType, 'item');
    assert.equal(mod.sourceId, 'item_nullifier');
    assert.equal(mod.category, 'metaphysic');
    assert.equal(mod.effects.metaphysicMod, -4);
  });

  test('derives an environmental modifier from a Location/Map', () => {
    const mockMap = {
      id: 'map_derelict_hull',
      title: 'Derelict Starship Hull'
    };

    const mod = ModifierService.createModifierFromLocation(mockMap);
    assert.equal(mod.sourceType, 'location');
    assert.equal(mod.sourceId, 'map_derelict_hull');
    assert.equal(mod.category, 'environmental');
    assert.equal(mod.effects.attackMod, -2);
  });

  test('ticks down temporary combat round modifiers and expires them cleanly', () => {
    const tempMod = ModifierService.createModifier({
      name: 'EMP Flare',
      isTemporary: true,
      durationRounds: 2,
      remainingRounds: 2,
      isActive: true
    });

    const permMod = ModifierService.createModifier({
      name: 'Planetary Radiation',
      isTemporary: false,
      isActive: true
    });

    // Round 1 tick
    const tick1 = ModifierService.tickModifiers([tempMod, permMod]);
    assert.equal(tick1.expiredModifiers.length, 0);
    const updatedTemp1 = tick1.updatedModifiers.find(m => m.name === 'EMP Flare');
    assert.equal(updatedTemp1.remainingRounds, 1);

    // Round 2 tick -> expires tempMod
    const tick2 = ModifierService.tickModifiers(tick1.updatedModifiers);
    assert.equal(tick2.expiredModifiers.length, 1);
    assert.equal(tick2.expiredModifiers[0].name, 'EMP Flare');
    assert.equal(tick2.expiredModifiers[0].isActive, false);

    // permMod is still active
    const remainingPerm = tick2.updatedModifiers.find(m => m.name === 'Planetary Radiation');
    assert.equal(remainingPerm.isActive, true);
  });

  test('aggregates modifier effects across multiple active modifiers', () => {
    const mod1 = ModifierService.createModifier({
      name: 'Commander Aura',
      isActive: true,
      effects: { attackMod: 2, damageMod: 3 }
    });
    const mod2 = ModifierService.createModifier({
      name: 'Null-Field Matrix',
      isActive: true,
      effects: { metaphysicMod: -4, defenseMod: 1 }
    });
    const mod3 = ModifierService.createModifier({
      name: 'EMP Fallout',
      isActive: true,
      effects: { techMod: -3, attackMod: -1 }
    });

    const net = ModifierService.aggregateModifierEffects([mod1, mod2, mod3]);
    assert.equal(net.attackMod, 1); // 2 - 1 = 1
    assert.equal(net.defenseMod, 1);
    assert.equal(net.damageMod, 3);
    assert.equal(net.metaphysicMod, -4);
    assert.equal(net.techMod, -3);
    assert.equal(net.breakdowns.length, 6);
  });
});

describe('Rules Adjudicator Situational Modifiers Integration', () => {
  test('factors active Gallery modifiers into tactical attack calculation', () => {
    const activeMod = ModifierService.createModifier({
      name: 'High Altitude Turbulence',
      isActive: true,
      effects: { attackMod: -2, defenseMod: 2 }
    });

    const result = computeTacticalAttackModifiers({
      rangeBracketId: 'short',
      coverTypeId: 'none',
      lightingId: 'clear',
      activeModifiers: [activeMod]
    });

    assert.equal(result.netAttackMod, -2);
    assert.equal(result.netDefenseMod, 2);
    assert.ok(result.breakdown.some(b => b.includes('High Altitude Turbulence')));
  });

  test('computes net situational modifiers for Metaphysics and Tech checks', () => {
    const metaMod = ModifierService.createModifier({
      name: 'Ley-Nexus Confluence',
      isActive: true,
      effects: { metaphysicMod: 3, techMod: -2 }
    });

    const metaCheck = computeNetSituationalModifiers({
      actionType: 'metaphysic',
      activeModifiers: [metaMod]
    });
    assert.equal(metaCheck.netMod, 3);
    assert.ok(metaCheck.breakdown.some(b => b.includes('Metaphysic')));

    const techCheck = computeNetSituationalModifiers({
      actionType: 'tech',
      activeModifiers: [metaMod]
    });
    assert.equal(techCheck.netMod, -2);
    assert.ok(techCheck.breakdown.some(b => b.includes('Tech')));
  });
});

describe('Story Gallery VTT Module Compiler', () => {
  test('synthesizes scenario, maps, elements, and situational modifiers into a full module package', () => {
    const mockScenario = {
      id: 'scen_outpost_raid',
      title: 'Raid on Outpost Zeta',
      fields: {
        summary: 'Infiltrate the derelict communications relay and recover encrypted data cores.',
        'tech-level': '4',
        'magic-level': '1'
      }
    };

    const mockMap = {
      id: 'map_zeta_corridor',
      title: 'Zeta Corridor A',
      width: 2400,
      height: 1800,
      gridSize: 50,
      walls: [
        { id: 'w1', p1: { x: 0, y: 0 }, p2: { x: 500, y: 0 }, blocksMovement: true, blocksVision: true }
      ],
      objects: [
        { id: 'obj_trap_1', isTrap: true, name: 'Plasma Arc Mine', x: 200, y: 200 }
      ],
      tokens: []
    };

    const mockPersona = {
      id: 'elem_boss_sentinel',
      title: 'Automated Sentry Drone',
      type: 'Persona',
      fields: {
        'char-name': 'Sentry Drone Unit 7',
        mcmTier: '2',
        mcmRole: 'Commando',
        mcmDesignation: 'Adversary',
        vttScriptActive: 'true',
        vttScript: JSON.stringify({
          type: 'sentry',
          behaviorProfile: 'commando',
          moraleThreshold: 0.1
        })
      }
    };

    const mockModifier = ModifierService.createModifier({
      name: 'Corridor Bio-Hazard',
      category: 'environmental',
      sourceType: 'location',
      sourceId: 'map_zeta_corridor',
      sourceName: 'Zeta Corridor A',
      isActive: true,
      effects: {
        attackMod: -1,
        metaphysicMod: -2
      }
    });

    const compileResult = VttModuleCompiler.compileScenarioForVtt({
      scenario: mockScenario,
      activeMap: mockMap,
      mapsCatalog: [mockMap],
      elementsCatalog: [mockPersona],
      galleryModifiers: [mockModifier]
    });

    assert.ok(compileResult.package, 'Package was generated');
    const pkg = compileResult.package;

    // Verify Manifest
    assert.equal(pkg.manifest.title, 'Raid on Outpost Zeta');
    assert.equal(pkg.manifest.techLevel, 4);
    assert.equal(pkg.manifest.magicLevel, 1);
    assert.equal(pkg.manifest.stats.totalMaps, 1);
    assert.equal(pkg.manifest.stats.totalElements, 1);
    assert.equal(pkg.manifest.stats.totalModifiers, 1);
    assert.equal(pkg.manifest.stats.reactiveTraps, 1);

    // Verify Gallery
    assert.ok(pkg.gallery, 'Gallery object present');
    assert.equal(pkg.gallery.maps.length, 1);
    assert.equal(pkg.gallery.elements.length, 1);
    assert.equal(pkg.gallery.modifiers.length, 1);
    assert.equal(pkg.gallery.modifiers[0].name, 'Corridor Bio-Hazard');

    // Verify Map and Tokens
    assert.equal(pkg.map.id, 'map_zeta_corridor');
    assert.equal(pkg.map.tokens.length, 1);
    assert.equal(pkg.map.tokens[0].label, 'Sentry Drone Unit 7');

    // Verify Automations
    assert.equal(pkg.automations.activeModifiers.length, 1);
    assert.equal(pkg.automations.scriptedNpcs.length, 1);
    assert.equal(pkg.automations.reactiveTraps.length, 1);

    // Verify Diagnostics
    assert.equal(compileResult.diagnostics.isValid, true);
    assert.equal(compileResult.diagnostics.errors.length, 0);
  });
});

describe('VTT Module Runtime Ingestion', () => {
  test('deploys compiled package tokens, map objects, and gallery modifiers into runtime state', () => {
    const mockPackage = {
      packageId: 'pkg_test_123',
      compiledAt: new Date().toISOString(),
      manifest: {
        title: 'Tactical Module',
        techLevel: 3,
        magicLevel: 0,
        stats: { totalTokens: 1, scriptedNpcs: 0, totalObjects: 1, reactiveTraps: 0, wallVectors: 0 }
      },
      gallery: {
        maps: [{ id: 'map_test_1', title: 'Test Map', walls: [], objects: [], tokens: [] }],
        elements: [],
        modifiers: [
          ModifierService.createModifier({ name: 'Active Psi Static', category: 'metaphysic', isActive: true })
        ]
      },
      story: { id: 's1', title: 'Story', summary: '', triggers: [] },
      map: {
        id: 'map_test_1',
        title: 'Test Map',
        width: 1000,
        height: 1000,
        gridSize: 50,
        walls: [],
        objects: [{ id: 'obj1', type: 'crate' }],
        tokens: [{ id: 'tok_alpha', name: 'Alpha Operative', x: 500, y: 500, health: { max: 40 } }]
      },
      automations: { scriptedNpcs: [], reactiveTraps: [], storyTriggers: [] }
    };

    let updatedMapId = null;
    let appliedPatch = null;
    let deployedModifiers = null;

    const mockUpdateMap = (mapId, patch) => {
      updatedMapId = mapId;
      appliedPatch = patch;
    };

    const mockSetGalleryModifiers = (mods) => {
      deployedModifiers = mods;
    };

    const result = deployCompiledPackage(
      mockPackage,
      mockUpdateMap,
      'map_test_1',
      {
        setGalleryModifiers: mockSetGalleryModifiers
      }
    );

    assert.equal(result.tokensDeployed, 1);
    assert.equal(result.objectsDeployed, 1);
    assert.equal(result.modifiersDeployed, 1);
    assert.equal(updatedMapId, 'map_test_1');
    assert.equal(appliedPatch.tokens.length, 1);
    assert.equal(deployedModifiers.length, 1);
    assert.equal(deployedModifiers[0].name, 'Active Psi Static');
  });
});
