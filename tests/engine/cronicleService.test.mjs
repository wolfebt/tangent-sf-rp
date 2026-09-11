/**
 * @file cronicleService.test.mjs
 * @description Unit Test Suite for CRONICLE Persistent Memory Service
 * Tests:
 * 1. Default CRONICLE container initialization & story prefix sanitization
 * 2. Working Copy Protocol (Source element preservation & prefixed working copy)
 * 3. Deterministic state transition engine: S(t+1) = E(S_t) for personas, locations, timeline & working memory
 * 4. Batch delta application across multi-turn narrative events
 * 5. 3-Tier Context Injection Pipeline (Guidance Gems serialization & content restraints)
 * 6. Markdown export compilation
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePrefix,
  createDefaultCronicleState,
  cloneToWorkingCopy,
  applyCronicleDelta,
  applyBatchDeltas,
  formatCronicleContextForAIME,
  exportCronicleToMarkdown
} from '../../src/services/cronicleService.js';

test('CRONICLE: Prefix sanitization converts strings to valid identifier tokens', () => {
  assert.equal(sanitizePrefix('Shadows of Elaria (Act 1)!'), 'shadows_of_elaria_act_1_');
  assert.equal(sanitizePrefix('Copia Fringe Campaign'), 'copia_fringe_campaign');
  assert.equal(sanitizePrefix(''), 'story');
});

test('CRONICLE: Default state initializes with correct schema partitions', () => {
  const cronicle = createDefaultCronicleState('Solar Ascendancy');
  assert.equal(cronicle.version, 1);
  assert.equal(cronicle.storyPrefix, 'solar_ascendancy');
  assert.ok(cronicle.workingMemory);
  assert.equal(cronicle.workingMemory.activeLocationId, null);
  assert.deepEqual(cronicle.workingMemory.activePersonaIds, []);
  assert.deepEqual(cronicle.personas, {});
  assert.deepEqual(cronicle.locations, {});
  assert.deepEqual(cronicle.timeline, []);
  assert.deepEqual(cronicle.pendingDeltas, []);
});

test('CRONICLE Working Copy Protocol: Preserves source element and creates prefixed working copy', () => {
  const sourcePersona = {
    id: 'elem_marshal_kael_npc',
    title: 'Marshal Kael',
    type: 'Persona',
    fields: {
      role: 'Frontier Marshal',
      STR: 3,
      DEX: 4,
      INT: 3,
      inventory: ['Mag-Rail Revolver', 'Badge of Office'],
      relationships: { 'governor_estate': -60 },
      psychological_traits: ['Unyielding'],
      physical_traits: ['Weathered']
    }
  };

  const copy = cloneToWorkingCopy(sourcePersona, 'Black Ridge Requiem');
  assert.ok(copy);
  assert.equal(copy.id, 'black_ridge_requiem_marshal_kael_npc');
  assert.equal(copy.sourceElementId, 'elem_marshal_kael_npc');
  assert.equal(copy.storyPrefix, 'black_ridge_requiem');

  const pState = copy.personaState;
  assert.ok(pState);
  assert.equal(pState.name, 'Marshal Kael');
  assert.equal(pState.role, 'Frontier Marshal');
  assert.equal(pState.current_status, 'active');
  assert.equal(pState.base_physical_stats.dex, 4);
  assert.deepEqual(pState.active_inventory, ['Mag-Rail Revolver', 'Badge of Office']);
  assert.deepEqual(pState.relationship_matrix, { 'governor_estate': -60 });
});

test('CRONICLE State Transition Engine: Mutates Persona status, traits, inventory & relationships', () => {
  let cronicle = createDefaultCronicleState('Black Ridge');
  cronicle.personas['p_elara'] = {
    id: 'p_elara',
    name: 'Elara Vex',
    role: 'Cyber-Operative',
    current_status: 'active',
    base_physical_stats: { str: 2, dex: 4, int: 3, hp: 28, maxHp: 30 },
    active_inventory: ['Monofilament Blade'],
    relationship_matrix: { 'syndicate_boss': -20 },
    dynamic_psychological_traits: ['Focused'],
    acquired_physical_traits: []
  };

  // 1. Inflict physical injury
  cronicle = applyCronicleDelta(cronicle, {
    id: 'd1',
    entityId: 'p_elara',
    action: 'add_trait',
    target: 'physical',
    value: 'Shattered Right Shoulder'
  });
  assert.deepEqual(cronicle.personas['p_elara'].acquired_physical_traits, ['Shattered Right Shoulder']);

  // 2. Add psychological trauma
  cronicle = applyCronicleDelta(cronicle, {
    id: 'd2',
    entityId: 'p_elara',
    action: 'add_trait',
    target: 'psychological',
    value: 'Paranoid Hypervigilance'
  });
  assert.deepEqual(cronicle.personas['p_elara'].dynamic_psychological_traits, ['Focused', 'Paranoid Hypervigilance']);

  // 3. Acquire inventory item
  cronicle = applyCronicleDelta(cronicle, {
    id: 'd3',
    entityId: 'p_elara',
    action: 'add_item',
    value: 'Encrypted Syndicate Datacore'
  });
  assert.deepEqual(cronicle.personas['p_elara'].active_inventory, ['Monofilament Blade', 'Encrypted Syndicate Datacore']);

  // 4. Update relationship matrix (decrease by 40)
  cronicle = applyCronicleDelta(cronicle, {
    id: 'd4',
    entityId: 'p_elara',
    action: 'update_relationship',
    target: 'syndicate_boss',
    value: -40
  });
  assert.equal(cronicle.personas['p_elara'].relationship_matrix['syndicate_boss'], -60);

  // 5. Update vital status
  cronicle = applyCronicleDelta(cronicle, {
    id: 'd5',
    entityId: 'p_elara',
    action: 'update_status',
    value: 'injured'
  });
  assert.equal(cronicle.personas['p_elara'].current_status, 'injured');
});

test('CRONICLE State Transition Engine: Mutates Location states, hazards, and occupants', () => {
  let cronicle = createDefaultCronicleState('Black Ridge');
  cronicle.locations['loc_citadel'] = {
    id: 'loc_citadel',
    name: 'The High Citadel',
    current_geospatial_state: 'thriving',
    environmental_hazards: [],
    occupant_lists: ['p_elara'],
    faction_control: 'Solar Ascendancy'
  };

  // 1. Under siege
  cronicle = applyCronicleDelta(cronicle, {
    id: 'd6',
    entityId: 'loc_citadel',
    action: 'update_location_state',
    value: 'under_siege'
  });
  assert.equal(cronicle.locations['loc_citadel'].current_geospatial_state, 'under_siege');

  // 2. Add environmental hazard
  cronicle = applyCronicleDelta(cronicle, {
    id: 'd7',
    entityId: 'loc_citadel',
    action: 'add_hazard',
    value: 'Plasma Firestorm'
  });
  assert.deepEqual(cronicle.locations['loc_citadel'].environmental_hazards, ['Plasma Firestorm']);

  // 3. Remove environmental hazard
  cronicle = applyCronicleDelta(cronicle, {
    id: 'd8',
    entityId: 'loc_citadel',
    action: 'remove_hazard',
    value: 'Plasma Firestorm'
  });
  assert.deepEqual(cronicle.locations['loc_citadel'].environmental_hazards, []);
});

test('CRONICLE State Transition Engine: Appends episodic Story Weaver timeline events', () => {
  let cronicle = createDefaultCronicleState('Campaign Test');
  assert.equal(cronicle.timeline.length, 0);

  cronicle = applyCronicleDelta(cronicle, {
    id: 'd9',
    action: 'add_timeline_event',
    sceneTitle: 'The Breach of Copia Alpha',
    value: 'The strike team disabled the orbital defense grid, sacrificing auxiliary power.',
    involved_entities: ['p_elara', 'p_vance']
  });

  assert.equal(cronicle.timeline.length, 1);
  assert.equal(cronicle.timeline[0].sceneTitle, 'The Breach of Copia Alpha');
  assert.deepEqual(cronicle.timeline[0].involved_entities, ['p_elara', 'p_vance']);
});

test('CRONICLE: Batch delta execution properly accumulates mutations', () => {
  const initial = createDefaultCronicleState('Batch Test');
  initial.personas['p_test'] = {
    id: 'p_test',
    name: 'Test Operative',
    role: 'Infiltrator',
    current_status: 'active',
    active_inventory: ['Combat Stiletto'],
    acquired_physical_traits: [],
    dynamic_psychological_traits: []
  };

  const deltas = [
    { id: 'b1', entityId: 'p_test', action: 'add_item', value: 'Plasma Grenade' },
    { id: 'b2', entityId: 'p_test', action: 'add_trait', target: 'physical', value: 'Minor Singe' },
    { id: 'b3', entityId: 'p_test', action: 'update_status', value: 'active' }
  ];

  const result = applyBatchDeltas(initial, deltas);
  assert.deepEqual(result.personas['p_test'].active_inventory, ['Combat Stiletto', 'Plasma Grenade']);
  assert.deepEqual(result.personas['p_test'].acquired_physical_traits, ['Minor Singe']);
});

test('CRONICLE 3-Tier Context Injection: Serializes Guidance Gems with proper priority', () => {
  const cronicle = createDefaultCronicleState('Outpost Defense');
  cronicle.workingMemory = {
    activeLocationId: 'loc_deep_rim',
    activePersonaIds: ['p_kael', 'p_vance'],
    immediateObjective: 'Defend the refinery terminal against the vanguard wave.',
    unresolvedConflicts: 'Low munitions; structural integrity at 42%.'
  };

  cronicle.locations['loc_deep_rim'] = {
    id: 'loc_deep_rim',
    name: 'Aetherite Refinery 4',
    current_geospatial_state: 'ruined',
    environmental_hazards: ['Toxic Sulfur Vents', 'Ozone Discharge'],
    faction_control: 'Coalition Fringe'
  };

  cronicle.personas['p_kael'] = {
    id: 'p_kael',
    name: 'Marshal Kael',
    role: 'Frontier Marshal',
    current_status: 'injured',
    active_inventory: ['Mag-Rail Revolver'],
    acquired_physical_traits: ['Fractured Ribs'],
    dynamic_psychological_traits: ['Grim Resolve'],
    relationship_matrix: { 'p_vance': 80 }
  };

  cronicle.personas['p_vance'] = {
    id: 'p_vance',
    name: 'Marshal Vance',
    role: 'Gunslinger',
    current_status: 'active',
    active_inventory: ['Dual Pistols'],
    acquired_physical_traits: [],
    dynamic_psychological_traits: ['Cynical'],
    relationship_matrix: { 'p_kael': 85 }
  };

  cronicle.timeline.push({
    id: 'tl_1',
    sceneTitle: 'Ambush at Railhead',
    summary: 'Rangers ambushed the convoy, destroying the transport crawler.',
    timestamp: new Date().toISOString()
  });

  const contextText = formatCronicleContextForAIME(cronicle);

  // Verify Tier 1 Mandatory Constraints
  assert.ok(contextText.includes('=== [CRONICLE TIER 1: MANDATORY NARRATIVE CONSTRAINTS] ==='));
  assert.ok(contextText.includes('Defend the refinery terminal'));
  assert.ok(contextText.includes('Aetherite Refinery 4'));
  assert.ok(contextText.includes('RUINED'));
  assert.ok(contextText.includes('Toxic Sulfur Vents'));
  assert.ok(contextText.includes('Marshal Kael'));
  assert.ok(contextText.includes('Fractured Ribs'));

  // Verify Tier 2 Relational Dynamics & Timeline
  assert.ok(contextText.includes('=== [CRONICLE TIER 2: RELATIONAL DYNAMICS & EPISODIC CAUSALITY] ==='));
  assert.ok(contextText.includes('Marshal Kael -> Marshal Vance: Affinity +80'));
  assert.ok(contextText.includes('Ambush at Railhead'));

  // Verify Markdown Export
  const md = exportCronicleToMarkdown(cronicle);
  assert.ok(md.includes('# CRONICLE: SINGLE SOURCE OF TRUTH'));
  assert.ok(md.includes('Aetherite Refinery 4'));
  assert.ok(md.includes('Marshal Kael'));
});
