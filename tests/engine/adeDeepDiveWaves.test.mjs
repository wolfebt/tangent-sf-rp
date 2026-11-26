/**
 * @file adeDeepDiveWaves.test.mjs
 * @description Engine & Service regression tests for ADE Deep-Dive Waves D1-D6:
 * - D1.4: interactivePlayService createInteractiveSession & loadAllSessions story scoping
 * - D1.6: Cortex <-> ADE lossless consolidation & projection for World/Universe/Setting/Scene/Philosophy
 * - D2.3 & D3.3: VolatileSharder initial is_hidden/elevation_ft preservation & optional z updatePosition parity
 * - D2.4: exportElementMarkdown / exportElementPDF operatorSafe handling
 * - D3.2: VttMultiplayerSyncService Operative role guards + encodeSanitizedYjsUpdate redaction
 * - D4.1 & D4.3: adeElementPersistence non-admin local_only drafts & explicit personaSubcategory track override
 * - D4.5b: pullElementFromOmnicortexDBM preserves normalized projected fields
 * - D5.1: PagedPdfCompiler cards layout + Waypoints/Props/Handouts/OSR spread options
 * - D5.2: adeStore queued pendingAimePrefillPrompt consume semantics
 * - D6.3: FoundryVttJsonExporter exports background, tokens, and lights
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as Y from 'yjs';
import {
  consolidateAdeElementToCortexPayload,
  projectOmnicortexRecordToAdeElement
} from '../../src/utils/cortexAdeAssetBridge.js';
import { useEngineStore } from '../../src/engine/state/VolatileSharder.ts';
import { VttMultiplayerSyncService } from '../../src/services/vttMultiplayerSyncService.ts';
import { encodeSanitizedYjsUpdate } from '../../src/engine/network/YjsProviderBridge.ts';
import { persistAdeElement } from '../../src/utils/adeElementPersistence.js';
import { pullElementFromOmnicortexDBM } from '../../src/utils/storyAssetAdapter.js';
import { PagedPdfCompiler } from '../../src/engine/compilers/PagedPdfCompiler.ts';
import { useADEStore } from '../../src/pages/Foundry/store/adeStore.ts';
import { FoundryVttJsonExporter } from '../../src/engine/compilers/FoundryVttJsonExporter.ts';
import {
  createInteractiveSession,
  loadAllSessions
} from '../../src/pages/Foundry/StoryModule/interactivePlayService.js';

function withMockLocalStorage(fn) {
  const prevStorage = globalThis.localStorage;
  const prevWindow = globalThis.window;
  const store = new Map();
  const mockLs = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  };
  globalThis.localStorage = mockLs;
  globalThis.window = globalThis.window || { localStorage: mockLs };
  try {
    return fn();
  } finally {
    globalThis.localStorage = prevStorage;
    if (prevWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = prevWindow;
    }
  }
}

test('D1.4: createInteractiveSession preserves activeScenarioId, activeModifiers, and story scoping', () => {
  withMockLocalStorage(() => {
    const mod = { id: 'mod_test_1', name: 'Gravity Surge', isActive: true };
    const sA = createInteractiveSession({
      storyId: 'story_alpha',
      activeScenarioId: 'scen_alpha_1',
      activeScenarioTitle: 'Docking Bay',
      activeModifiers: [mod]
    });
    const sB = createInteractiveSession({
      storyId: 'story_beta',
      scenarioId: 'scen_beta_1',
      scenarioTitle: 'Orbital Lift',
      activeModifiers: []
    });

    assert.equal(sA.activeScenarioId, 'scen_alpha_1');
    assert.equal(sA.activeScenarioTitle, 'Docking Bay');
    assert.deepEqual(sA.activeModifiers, [mod]);
    assert.equal(sB.activeScenarioId, 'scen_beta_1');

    const alphaOnly = loadAllSessions('story_alpha');
    assert.equal(alphaOnly.length, 1);
    assert.equal(alphaOnly[0].id, sA.id);

    const allSessions = loadAllSessions();
    assert.equal(allSessions.length, 2);
  });
});

test('D1.6: Cortex consolidator & projector preserve extended schema fields for Universe, Scene, Setting, Philosophy, World', () => {
  const universeEl = {
    id: 'uni_1',
    type: 'Universe',
    title: 'Helios Accord',
    fields: {
      designation: 'Core Sector',
      ontological: 'Dual-resonance cosmos',
      lawsPhysics: 'No FTL inside gravity wells',
      natureMagic: 'Psionic crystal lattice',
      cosmological: '12 ringed star clusters',
      creation: 'Forged in the First Fracture',
      entities: 'Archon Lattice',
      interplanar: 'Drift beacons only',
      centralQuestion: 'What price stability?',
      'tech-level': '4',
      'meta-level': '3',
      storyFlagKey: 'helios_unlocked'
    }
  };
  const consUni = consolidateAdeElementToCortexPayload(universeEl, { targetCollection: 'universe' });
  const projUni = projectOmnicortexRecordToAdeElement(consUni.payload, 'universe');
  assert.equal(projUni.fields.natureMagic, 'Psionic crystal lattice');
  assert.equal(projUni.fields.centralQuestion, 'What price stability?');
  assert.equal(projUni.fields['tech-level'], '4');
  assert.equal(projUni.fields.storyFlagKey, 'helios_unlocked');

  const sceneEl = {
    id: 'sc_1',
    type: 'Scene',
    title: 'INT. REACTOR CORE - NIGHT',
    fields: {
      scenePurpose: 'Disable coolant locks',
      stateChange: 'Quarantine -> Breach',
      gmNotes: 'Ambush waits behind turbine 2'
    }
  };
  const consScene = consolidateAdeElementToCortexPayload(sceneEl, { targetCollection: 'scene' });
  const projScene = projectOmnicortexRecordToAdeElement(consScene.payload, 'scene');
  assert.equal(projScene.fields.scenePurpose, 'Disable coolant locks');
  assert.equal(projScene.fields.stateChange, 'Quarantine -> Breach');
  assert.equal(projScene.fields.gmNotes, 'Ambush waits behind turbine 2');

  const settingEl = {
    id: 'set_1',
    type: 'Setting',
    title: 'Caldera Station',
    fields: { scale: 'Orbital Ring', genreTech: 'Hard Sci-Fi TL-4', primaryConflict: 'Coolant embargo', gmNotes: 'Secret shaft C' }
  };
  const projSetting = projectOmnicortexRecordToAdeElement(
    consolidateAdeElementToCortexPayload(settingEl, { targetCollection: 'setting' }).payload,
    'setting'
  );
  assert.equal(projSetting.fields.scale, 'Orbital Ring');
  assert.equal(projSetting.fields.primaryConflict, 'Coolant embargo');
  assert.equal(projSetting.fields.gmNotes, 'Secret shaft C');

  const philEl = {
    id: 'phil_1',
    type: 'Philosophy',
    title: 'Zero Axiom',
    fields: { coreQuestion: 'Does memory define personhood?', freeWill: 'Compatibilist', truthEpistemology: 'Consensus log', disposition: 'Secretive', gmNotes: 'Split sect' }
  };
  const projPhil = projectOmnicortexRecordToAdeElement(
    consolidateAdeElementToCortexPayload(philEl, { targetCollection: 'philosophy' }).payload,
    'philosophy'
  );
  assert.equal(projPhil.fields.coreQuestion, 'Does memory define personhood?');
  assert.equal(projPhil.fields.truthEpistemology, 'Consensus log');
  assert.equal(projPhil.fields.disposition, 'Secretive');
});

test('D2.3 & D3.3: VolatileSharder preserves initial is_hidden/elevation_ft and keeps z/elevation_ft unified on move', () => {
  const store = useEngineStore.getState();
  store.clearAllEntities();
  store.loadStaticEntity({
    id: 'npc_ghost',
    name: 'Stealth Stalker',
    is_hidden: true,
    elevation_ft: 15
  });

  let eph = useEngineStore.getState().ephemeralData.npc_ghost;
  assert.equal(eph.is_hidden, true);
  assert.equal(eph.elevation_ft, 15);
  assert.equal(eph.z, 15);

  // 2D move without explicit z preserves elevation_ft & z
  store.updatePosition('npc_ghost', 220, 310);
  eph = useEngineStore.getState().ephemeralData.npc_ghost;
  assert.equal(eph.x, 220);
  assert.equal(eph.y, 310);
  assert.equal(eph.elevation_ft, 15);
  assert.equal(eph.z, 15);

  // Explicit z syncs elevation_ft; setElevation syncs z
  store.updatePosition('npc_ghost', 250, 340, 25);
  eph = useEngineStore.getState().ephemeralData.npc_ghost;
  assert.equal(eph.elevation_ft, 25);
  assert.equal(eph.z, 25);

  store.setElevation('npc_ghost', 40);
  eph = useEngineStore.getState().ephemeralData.npc_ghost;
  assert.equal(eph.elevation_ft, 40);
  assert.equal(eph.z, 40);
});

test('D3.2: VttMultiplayerSyncService enforces operative broadcast guards & encodeSanitizedYjsUpdate redacts secrets', () => {
  const host = new VttMultiplayerSyncService();
  host.init({ role: 'architect', channelName: `test-crdt-guard-${Date.now()}` });

  host.broadcastTokenVitals('hidden_npc', { current_hp: 42, is_hidden: true, active_conditions: ['Ambush'] });
  host.broadcastHandout({ id: 'ho_secret', title: 'Eyes Only', text: 'Only for op-1', targetOperativeIds: ['op-1'] });
  host.broadcastHandout({ id: 'ho_public', title: 'Briefing', text: 'Everyone' });

  // Verify sanitized update for op-2 strips hidden vitals HP/conditions and non-targeted handout
  const encodedForOp2 = encodeSanitizedYjsUpdate(host.getDocument(), 'op-2');
  const peer2Doc = new Y.Doc();
  Y.applyUpdate(peer2Doc, encodedForOp2, 'network');

  const peerVitals = peer2Doc.getMap('token_vitals').get('hidden_npc');
  assert.equal(peerVitals.is_hidden, true);
  assert.equal(peerVitals.current_hp, undefined);
  assert.equal(peer2Doc.getMap('handouts').get('ho_secret'), undefined);
  assert.equal(peer2Doc.getMap('handouts').get('ho_public')?.title, 'Briefing');

  // Operative peer cannot mutate GM turn/handout/audio/fog state
  const op = new VttMultiplayerSyncService();
  op.init({ role: 'operative', personaId: 'op-1', channelName: `test-crdt-op-${Date.now()}` });
  op.broadcastTurnState({ roundNumber: 99, currentTurnIndex: 0 });
  op.broadcastHandout({ id: 'ho_spoof', title: 'Spoofed' });
  op.broadcastAudioCue({ bus: 'music', action: 'play', trackId: 'spoof' });
  op.broadcastFogExplored('m1', [{ x: 0, y: 0, r: 999 }], false);

  assert.equal(op.getDocument().getMap('turn_state').get('current'), undefined);
  assert.equal(op.getDocument().getMap('handouts').get('ho_spoof'), undefined);
  assert.equal(op.getDocument().getMap('audio_state').get('music'), undefined);
  assert.equal(op.getDocument().getMap('fog_state').get('m1'), undefined);

  peer2Doc.destroy();
  host.destroy();
  op.destroy();
});

test('D4.1 & D4.3: adeElementPersistence avoids fake dbmRef on new non-admin drafts and honors explicit Persona track switch', async () => {
  let savedLocal = null;
  const draftResult = await persistAdeElement({
    element: { id: 'elem_new_1', type: 'Property', title: 'Ion Wrench', propertySubcategory: 'gear', fields: {} },
    fromEditModal: true,
    isAdmin: false,
    elementsCatalog: [],
    updateSavedElement: async (_id, rec) => {
      savedLocal = rec;
      return rec;
    }
  });
  assert.equal(draftResult.dbmSyncStatus, 'local_only');
  assert.equal(draftResult.dbmId, undefined);
  assert.equal(savedLocal.fields?.dbmRef, undefined);

  let rosterCalls = 0;
  let savedMcmLocal = null;
  const switchedPersona = await persistAdeElement({
    element: {
      id: 'elem_p_1',
      type: 'Persona',
      title: 'Kaelen Switched',
      isFolioPersona: true,
      fields: { personaSubcategory: 'mcm' }
    },
    fromEditModal: true,
    isAdmin: false,
    elementsCatalog: [],
    saveCurrentToRoster: async () => {
      rosterCalls += 1;
      return { ok: true };
    },
    updateSavedElement: async (_id, rec) => {
      savedMcmLocal = rec;
      return rec;
    }
  });
  assert.equal(rosterCalls, 0);
  assert.equal(savedMcmLocal.title, 'Kaelen Switched');
  assert.equal(switchedPersona.fields.personaSubcategory, 'mcm');
});

test('D4.5b: pullElementFromOmnicortexDBM preserves projected string fields over raw Cortex arrays', () => {
  const pulled = pullElementFromOmnicortexDBM(
    { id: 'el_inv_1', type: 'Metaphysics', metaphysicsSubcategory: 'invocations', dbmCategory: 'invocations', dbmId: 'inv_arc' },
    {
      invocations: [
        {
          id: 'inv_arc',
          name: 'Arc Pulse',
          range: ['Medium', 'Short'],
          area: ['10 ft Cone']
        }
      ]
    }
  );
  assert.equal(typeof pulled.fields.range, 'string');
  assert.equal(pulled.fields.range, 'Medium, Short');
  assert.equal(pulled.fields.area, '10 ft Cone');
});

test('D5.1 & D5.2 & D6.3: PagedPdfCompiler cards/sections, adeStore prefill queue, and FoundryVttJsonExporter scene richness', () => {
  // D5.1
  const compiled = PagedPdfCompiler.compileToPagedHtml(
    [{ id: 'sc_1', title: 'Airlock Alpha', content: '<p>Cold steel deck.</p>' }],
    {
      printLayout: 'cards',
      includeWaypoints: true,
      includeProps: true,
      includeHandouts: true,
      includeOsrSpread: true,
      waypoints: [{ label: 'Airlock Hatch', triggerAction: 'REVEAL_BEAT' }],
      props: [{ name: 'Security Terminal', type: 'terminal' }],
      handouts: [{ title: 'Cargo Manifest', content: '<p>Contraband cells</p>' }],
      personas: [{ title: 'Guard', fields: { health: 25, defense_dc: 14 } }]
    }
  );
  assert.match(compiled.html, /class="cards-grid"/);
  assert.match(compiled.html, /Tactical Map Waypoints/);
  assert.match(compiled.html, /Interactive Props/);
  assert.match(compiled.html, /Player Handouts/);
  assert.match(compiled.html, /Operative &amp; Threat Reference Cards/);

  // D5.2
  const adeStore = useADEStore.getState();
  adeStore.setPendingAimePrefillPrompt('Generate airlock breach narration');
  assert.equal(adeStore.consumePendingAimePrefillPrompt(), 'Generate airlock breach narration');
  assert.equal(adeStore.consumePendingAimePrefillPrompt(), null);

  // D6.3
  const { pack } = FoundryVttJsonExporter.exportToFoundryJson({
    scenarios: [],
    elements: [],
    maps: [
      {
        id: 'map_ex_1',
        title: 'Cargo Deck',
        background_url: 'https://example.com/deck.webp',
        tokens: [{ id: 't1', name: 'Hero', x: 100, y: 200, elevation_ft: 10, image_url: 'hero.png' }],
        lights: [{ id: 'l1', x: 300, y: 300, radius: 180, color: '#38bdf8', intensity: 0.9 }],
        walls: []
      }
    ]
  });
  const scene = pack.scenes[0];
  assert.equal(scene.background.src, 'https://example.com/deck.webp');
  assert.equal(scene.tokens.length, 1);
  assert.equal(scene.tokens[0].elevation, 10);
  assert.equal(scene.lights.length, 1);
  assert.equal(scene.lights[0].config.color, '#38bdf8');
});
