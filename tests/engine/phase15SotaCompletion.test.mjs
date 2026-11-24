/**
 * @file phase15SotaCompletion.test.mjs
 * @description Phase 15 SOTA Regression & Edge-Case Verification Suite covering:
 *   1. gmSecretSanitizer (decodeHtmlEntities, stripGmSecretHtmlBlocks, sanitizeScenarioForOperator)
 *   2. DocumentExporters (EPUB &#8212; entity fix, RTF \uN? Unicode escaping, compileToRtfBlob, Operator-Safe filtering)
 *   3. crdtCollabService + YjsProviderBridge (incremental common-prefix/suffix Y.Text diffing & 0x11/0x12 protocol)
 *   4. canonRulesLinterService (AP safe-context masking vs Action Points autofix & 5e terminology)
 *   5. campaignCalendarService (getHolidaysForDate recurring holiday lookup)
 *   6. raycastVisionService + FoundryVttJsonExporter (curved bezierControl wall tessellation)
 *   7. vttMultiplayerSyncService (0x04 whisper, SYNC_REQUEST/SYNC_STATE epoch/actorId arbitration, persona lock, user_stories)
 *   8. aoeHazardService (organic structure:0 routing & Fortitude vs Reflex selection)
 *   9. VolatileSharder (tickActiveEffectsForToken on 0-HP organic token)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as Y from 'yjs';
import { DataPacket_Kind, RoomEvent } from 'livekit-client';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, terminate } from 'firebase/firestore';

import {
  decodeHtmlEntities,
  stripGmSecretHtmlBlocks,
  sanitizeScenarioForOperator
} from '../../src/utils/gmSecretSanitizer.js';
import {
  compileToEpubBytes,
  compileToWordHtmlString,
  compileToRtfString,
  compileToRtfBlob
} from '../../src/engine/compilers/DocumentExporters.ts';
import {
  syncScenarioProse,
  updateScenarioProse,
  getScenarioProseText
} from '../../src/services/crdtCollabService.js';
import { YjsProviderBridge } from '../../src/engine/network/YjsProviderBridge.ts';
import { FirestoreDebouncer } from '../../src/engine/network/FirestoreDebouncer.ts';
import {
  lintCanonContent,
  applyAutoFix
} from '../../src/services/canonRulesLinterService.ts';
import {
  createDefaultCalendarState,
  getHolidaysForDate
} from '../../src/services/campaignCalendarService.ts';
import { isPointVisible } from '../../src/services/raycastVisionService.js';
import { FoundryVttJsonExporter } from '../../src/engine/compilers/FoundryVttJsonExporter.ts';
import { VttMultiplayerSyncService } from '../../src/services/vttMultiplayerSyncService.ts';
import { CANONICAL_AOE_PRESETS, resolveAoEImpact } from '../../src/services/aoeHazardService.js';
import { useEngineStore } from '../../src/engine/state/VolatileSharder.ts';

test('15.1 gmSecretSanitizer: decodes HTML entities and recursively strips GM secret blocks/fields', () => {
  assert.strictEqual(
    decodeHtmlEntities('Sector &mdash; Delta &#8220;Zero&#8221; &amp; &#x2605;'),
    'Sector \u2014 Delta \u201cZero\u201d & \u2605'
  );

  const rawHtml =
    '<p>Public briefing.</p><div class="ade-gm-secret"><p>Nested ambush trigger</p></div><aside data-gm-secret="true">GM vault</aside>';
  const stripped = stripGmSecretHtmlBlocks(rawHtml);
  assert.ok(stripped.includes('Public briefing.'));
  assert.equal(stripped.includes('Nested ambush trigger'), false);
  assert.equal(stripped.includes('GM vault'), false);

  const scenario = sanitizeScenarioForOperator({
    id: 'sc_1',
    title: 'Airlock Zero',
    content: '<p>Dock open.</p><div class="ade-gm-secret">SECRET_BOSS</div>',
    fields: {
      readAloud: 'Doors hiss open.',
      gmSecrets: 'Ambush in Vent 3',
      trapsSummary: 'Laser tripwire'
    },
    children: [
      { id: 'c_vis', title: 'Public Hall', content: 'Safe corridor.' },
      { id: 'c_hid', title: 'Hidden Lair', isHidden: true, content: 'Boss awaits.' }
    ]
  });

  assert.equal(scenario.fields.gmSecrets, undefined);
  assert.equal(scenario.fields.trapsSummary, undefined);
  assert.equal(scenario.fields.readAloud, 'Doors hiss open.');
  assert.equal(scenario.content.includes('SECRET_BOSS'), false);
  assert.strictEqual(scenario.children.length, 1);
  assert.strictEqual(scenario.children[0].id, 'c_vis');
});

test('15.2 DocumentExporters: EPUB &#8212;, entity decoding, RTF Unicode escaping, Blob & Operator-Safe strip', () => {
  const nodes = [
    {
      id: 'sc_exp_1',
      title: 'Station \u2014 Alpha',
      summary: 'Summary &mdash; safe brief',
      content: '<p>Caf\u00e9 dock &mdash; enter quietly.</p><div class="ade-gm-secret">TOP_SECRET_KEY</div>',
      readAloud: 'Klaxons echo &#8212; lights dim.',
      gmNotes: 'Hidden syndicate stash.',
      fields: {
        threats: [{ name: 'Sentry Mech', tier: 'Boss', hp: 50, dr: 8, attack: '+9' }]
      }
    }
  ];

  // When threats are included, XHTML uses valid numeric entity &#8212; rather than undefined HTML4 &mdash;
  const fullEpubBytes = compileToEpubBytes(nodes, {
    adventureTitle: 'Orbital &mdash; Incident',
    authorName: 'Architect',
    includeGmSecrets: true
  });
  const fullEpubDecoded = new TextDecoder().decode(fullEpubBytes);
  assert.ok(fullEpubDecoded.includes('&#8212;'));
  assert.equal(fullEpubDecoded.includes('&mdash;'), false);

  // Operator-safe EPUB strips both TOP_SECRET_KEY and threat blocks
  const safeEpubBytes = compileToEpubBytes(nodes, {
    adventureTitle: 'Orbital &mdash; Incident',
    authorName: 'Architect',
    includeGmSecrets: false
  });
  const safeEpubDecoded = new TextDecoder().decode(safeEpubBytes);
  assert.equal(safeEpubDecoded.includes('TOP_SECRET_KEY'), false);
  assert.equal(safeEpubDecoded.includes('Sentry Mech'), false);

  const wordHtml = compileToWordHtmlString(nodes, { includeGmSecrets: false });
  assert.equal(wordHtml.includes('TOP_SECRET_KEY'), false);
  assert.equal(wordHtml.includes('Sentry Mech'), false);

  const rtf = compileToRtfString(nodes, { includeGmSecrets: false });
  assert.ok(rtf.startsWith('{\\rtf1\\ansi'));
  // \u2014 (em-dash = 8212) and \u00e9 (e-acute = 233) escaped using signed 16-bit \uN?
  assert.ok(rtf.includes('\\u8212?'));
  assert.ok(rtf.includes('\\u233?'));
  assert.equal(rtf.includes('TOP_SECRET_KEY'), false);

  const blob = compileToRtfBlob(nodes, { includeGmSecrets: false });
  assert.ok(blob instanceof Blob);
  assert.ok(blob.size > 50);
});

test('15.3 crdtCollabService & YjsProviderBridge: incremental Y.Text diffing + 0x11/0x12 LiveKit sync', () => {
  const { yText } = syncScenarioProse('sc_phase15_diff', 'The airlock opens smoothly.');
  const deltas = [];
  yText.observe((evt) => {
    deltas.push(evt.delta);
  });

  updateScenarioProse('sc_phase15_diff', 'The airlock opens loudly.');
  assert.strictEqual(getScenarioProseText('sc_phase15_diff').toString(), 'The airlock opens loudly.');
  assert.strictEqual(deltas.length, 1);
  // Minimal prefix diff retains "The airlock opens " (18 chars) instead of deleting index 0..end
  assert.strictEqual(deltas[0][0].retain, 18);

  // Two YjsProviderBridge peers wired over mock LiveKit Rooms with custom 0x11 / 0x12 prefixes
  const listenersA = new Map();
  const listenersB = new Map();
  const makeMockRoom = (selfListeners, peerListeners, id) => ({
    state: 'connected',
    on: (ev, fn) => {
      if (!selfListeners.has(ev)) selfListeners.set(ev, []);
      selfListeners.get(ev).push(fn);
    },
    off: (ev, fn) => {
      const list = selfListeners.get(ev) || [];
      selfListeners.set(ev, list.filter((f) => f !== fn));
    },
    localParticipant: {
      identity: id,
      publishData: (data) => {
        for (const fn of peerListeners.get(RoomEvent.DataReceived) || []) {
          fn(data, { identity: id, name: id }, DataPacket_Kind.RELIABLE);
        }
      }
    }
  });

  const sentPrefixesB = [];
  const docA = new Y.Doc();
  const docB = new Y.Doc();
  docA.getText('scenario_sync').insert(0, 'Initial sector state.');

  const roomA = makeMockRoom(listenersA, listenersB, 'peer-a');
  const origRoomB = makeMockRoom(listenersB, listenersA, 'peer-b');
  const roomB = {
    ...origRoomB,
    localParticipant: {
      ...origRoomB.localParticipant,
      publishData: (data, opts) => {
        sentPrefixesB.push(data[0]);
        origRoomB.localParticipant.publishData(data, opts);
      }
    }
  };

  const bridgeA = new YjsProviderBridge(roomA, docA, { updatePrefix: 0x11, syncStep1Prefix: 0x12 });
  const bridgeB = new YjsProviderBridge(roomB, docB, { updatePrefix: 0x11, syncStep1Prefix: 0x12 });

  // Trigger SyncStep1 from B -> A responds with 0x11 state delta
  bridgeB.sendSyncStep1();
  assert.ok(sentPrefixesB.includes(0x12));
  assert.strictEqual(docB.getText('scenario_sync').toString(), 'Initial sector state.');

  // Incremental mutation on A propagates via 0x11 to B
  docA.getText('scenario_sync').insert(21, ' Shield active.');
  assert.strictEqual(docB.getText('scenario_sync').toString(), 'Initial sector state. Shield active.');

  bridgeA.disconnect();
  bridgeB.disconnect();
});

test('15.4 canonRulesLinterService: masks armor AP/Award Points while catching cost AP & 5e jargon', () => {
  const cleanRes = lintCanonContent({
    text: 'Rated DR 6 / AP 4 protection. Armor Penetration resists 2 AP rounds. Mission yields 3 Award Points.'
  });
  assert.strictEqual(cleanRes.filter((d) => d.ruleCode === 'NO_ACTION_POINTS').length, 0);

  const dirtyRes = lintCanonContent({
    text: 'Fires pulse burst costing 2 AP with a bonus action vs CR 15.'
  });
  const apDiag = dirtyRes.find((d) => d.ruleCode === 'NO_ACTION_POINTS');
  assert.ok(apDiag, 'Expected NO_ACTION_POINTS diagnostic on costing 2 AP');
  assert.ok(dirtyRes.some((d) => d.ruleCode === 'NO_5E_TERMINOLOGY'));

  const fixed = applyAutoFix('costing 2 AP in combat', apDiag);
  assert.match(fixed, /Action Tier/i);
  assert.equal(/\bAP\b/.test(fixed), false);
});

test('15.5 campaignCalendarService: getHolidaysForDate resolves matching recurring holidays', () => {
  const cal = createDefaultCalendarState('galactic_standard');
  cal.config.holidays = [
    { id: 'h1', name: 'Founders Solstice', monthIndex: 0, day: 1 },
    { id: 'h2', name: 'Orbital Remembrance', monthIndex: 1, day: 15 }
  ];

  const day1Holidays = getHolidaysForDate({ year: 3120, monthIndex: 0, day: 1 }, cal.config);
  assert.strictEqual(day1Holidays.length, 1);
  assert.strictEqual(day1Holidays[0].name, 'Founders Solstice');

  const otherDay = getHolidaysForDate({ year: 3120, monthIndex: 0, day: 2 }, cal.config);
  assert.strictEqual(otherDay.length, 0);
});

test('15.6 raycastVisionService + FoundryVttJsonExporter: curved bezierControl walls tessellate into blocking segments', () => {
  const curvedWalls = [
    {
      id: 'curve-1',
      p1: { x: 100, y: 0 },
      p2: { x: 100, y: 200 },
      bezierControl: { x: 220, y: 100 },
      type: 'solid'
    }
  ];

  // Straight line from (100,0) to (100,200) is x=100; at y=100 the Bezier bulges right to x=160.
  assert.strictEqual(isPointVisible({ x: 0, y: 100 }, { x: 130, y: 100 }, curvedWalls), true);
  assert.strictEqual(isPointVisible({ x: 0, y: 100 }, { x: 200, y: 100 }, curvedWalls), false);

  const exported = FoundryVttJsonExporter.exportToFoundryJson({
    title: 'Curved Wall Test',
    maps: [{ id: 'm1', title: 'Dome', width: 1000, height: 1000, gridSize: 50, walls: curvedWalls }]
  });
  assert.strictEqual(exported.pack.scenes.length, 1);
  assert.ok(exported.pack.scenes[0].walls.length > 1, 'Expected curved wall to export as tessellated walls');
});

test('15.7 vttMultiplayerSyncService: 0x04 whisper, SYNC_REQUEST/SYNC_STATE arbitration, persona lock & user_stories', async () => {
  const testApp = initializeApp({ projectId: 'demo-tangent-p15', apiKey: 'demo-key' }, `p15_sync_${Date.now()}`);
  const testDb = getFirestore(testApp);
  const channels = new Map();
  const OrigBC = globalThis.BroadcastChannel;
  globalThis.BroadcastChannel = class MockBC {
    constructor(name) {
      this.name = name;
      this.onmessage = null;
      if (!channels.has(name)) channels.set(name, new Set());
      channels.get(name).add(this);
    }
    postMessage(data) {
      for (const peer of channels.get(this.name) || []) {
        if (peer !== this && typeof peer.onmessage === 'function') {
          peer.onmessage({ data });
        }
      }
    }
    close() {
      channels.get(this.name)?.delete(this);
    }
  };

  try {
    useEngineStore.getState().loadStaticEntitiesBatch([
      {
        id: 'hero-op-1',
        name: 'Vanguard One',
        base_hp: 35,
        base_vitality: 35,
        is_persona: true
      },
      {
        id: 'npc-drone-1',
        name: 'Security Drone',
        base_hp: 30,
        is_persona: false
      }
    ]);

    const gm = new VttMultiplayerSyncService();
    gm.init({ channelName: 'tangent_vtt_sync_camp_p15', role: 'architect', actorId: 'gm-z' });
    gm.attachPersistence({
      campaignId: 'camp_p15',
      sessionId: 'sess_1',
      firestoreInstance: testDb,
      collectionRoot: 'user_stories'
    });

    // Capture 0x04 whisper packet over mock LiveKit Room
    const sentPackets = [];
    gm.attachLiveKitRoom({
      state: 'connected',
      on: () => {},
      off: () => {},
      localParticipant: {
        identity: 'gm-z',
        publishData: (bytes, opts) => sentPackets.push({ bytes, opts })
      }
    });

    gm.broadcastChatCard({
      visibility: 'whisper_gm',
      kind: 'dice',
      sender: 'Architect',
      title: 'Hidden Recon',
      body: 'Secret ventilation shaft.'
    });
    assert.ok(sentPackets.some((p) => p.bytes[0] === 0x04), 'Expected 0x04 whisper packet on LiveKit');
    assert.strictEqual(gm.getSyncStatus().mode, 'livekit+firestore');

    // Bump GM epoch via door toggle before op joins
    gm.broadcastDoorToggle('wall-airlock', true, 'open', 0);

    const op = new VttMultiplayerSyncService();
    op.init({ channelName: 'tangent_vtt_sync_camp_p15', role: 'operative', actorId: 'op-a', personaId: 'hero-op-1' });

    // Persona move lock: op can move own hero-op-1, cannot move NPC drone
    assert.strictEqual(op.canMoveToken('hero-op-1'), true);
    assert.strictEqual(op.canMoveToken('npc-drone-1'), false);
    assert.strictEqual(gm.canMoveToken('npc-drone-1'), true);

    // Explicitly verify SYNC_REQUEST -> SYNC_STATE deterministic epoch synchronization
    for (const bc of channels.get('tangent_vtt_sync_camp_p15') || []) {
      if (bc !== op.broadcastChannel) {
        bc.onmessage?.({ data: { type: 'SYNC_REQUEST', actorId: 'op-a' } });
      }
    }
    assert.ok(op.getSyncStatus().epoch >= 1);

    // Verify FirestoreDebouncer accepts user_stories collectionRoot cleanly
    const debouncer = new FirestoreDebouncer('camp_p15', 'sess_1', new Y.Doc(), 5000, testDb, { collectionRoot: 'user_stories' });
    assert.strictEqual(debouncer.targetDocRef.path, 'user_stories/camp_p15/sessions/sess_1');
    debouncer.destroy();

    gm.destroy();
    op.destroy();
  } finally {
    globalThis.BroadcastChannel = OrigBC;
    await terminate(testDb);
    await deleteApp(testApp);
  }
});

test('15.8 aoeHazardService: organic structure:0 routes to vitality/health & Fortitude preset uses fortitude', () => {
  const radPreset = CANONICAL_AOE_PRESETS.find((p) => p.saveType === 'Fortitude');
  assert.ok(radPreset, 'Expected at least one canonical Fortitude AoE preset');

  const affected = [
    {
      token: {
        id: 'org-1',
        label: 'Orbital Marine',
        structure: 0,
        base_health: 25,
        base_vitality: 20,
        armorDr: 2,
        fortitude: 50,
        reflex: 0
      },
      distancePx: 10,
      zone: 'core'
    }
  ];

  // With saveCr=30, fortitude=50 guarantees save=true while reflex=0 would fail
  const res = resolveAoEImpact({ ...radPreset, saveCr: 30, baseDamage: 16 }, affected);
  assert.strictEqual(res.length, 1);
  assert.strictEqual(res[0].saved, true);
  assert.strictEqual(res[0].structureDamage, 0);
  assert.ok(res[0].healthDamage > 0 || res[0].vitalityDamage > 0);
});

test('15.9 VolatileSharder: ticks active effects and applies bleedout conditions on 0-HP organic tokens', () => {
  const store = useEngineStore.getState();
  store.loadStaticEntitiesBatch([
    {
      id: 'tok-bleed-0',
      name: 'Downed Operative',
      base_hp: 25,
      base_vitality: 20,
      base_health: 25,
      is_synthetic: false,
      is_persona: true
    }
  ]);

  // Bring token to 0 HP & 0 Vitality
  store.applyDamage('tok-bleed-0', 45, true);
  let eph = useEngineStore.getState().ephemeralData['tok-bleed-0'];
  assert.strictEqual(eph.current_health, 0);

  store.addActiveEffect('tok-bleed-0', {
    id: 'eff-plasma-burn',
    name: 'Plasma Burn',
    remainingRounds: 2,
    tickDamage: 5,
    isLethal: true
  });

  const tick1 = store.tickActiveEffectsForToken('tok-bleed-0');
  assert.strictEqual(tick1.totalDamage, 5);
  assert.strictEqual(tick1.ticked[0].remainingRounds, 1);
  assert.strictEqual(tick1.expired.length, 0);

  eph = useEngineStore.getState().ephemeralData['tok-bleed-0'];
  assert.strictEqual(eph.current_health, 0);
  assert.ok(eph.active_conditions.includes('status_bleeding_out'));

  const tick2 = store.tickActiveEffectsForToken('tok-bleed-0');
  assert.strictEqual(tick2.expired.length, 1);
});
