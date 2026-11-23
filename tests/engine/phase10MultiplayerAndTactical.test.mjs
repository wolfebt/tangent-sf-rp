/**
 * @file phase10MultiplayerAndTactical.test.mjs
 * @description Phase 10 verification suite:
 *   - YjsProviderBridge ParticipantConnected auto-sync & expanded CRDT channels
 *   - VttMultiplayerSyncService door/vitals/turn/ping/chat/handout/audio/fog broadcasts + getSyncStatus
 *   - VolatileSharder sensor_mode state + setSensorMode action
 *   - useUILayoutStore AoE & Sensor Vision fields
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as Y from 'yjs';
import { RoomEvent, DataPacket_Kind } from 'livekit-client';

import { YjsProviderBridge } from '../../src/engine/network/YjsProviderBridge.ts';
import { VttMultiplayerSyncService } from '../../src/services/vttMultiplayerSyncService.ts';
import { useEngineStore } from '../../src/engine/state/VolatileSharder.ts';
import { useUILayoutStore } from '../../src/components/VTT/store/uiLayoutStore.ts';
import { VttEventBus } from '../../src/utils/vttEventBus.ts';
import {
  CANONICAL_AOE_PRESETS,
  getTokensInCircle,
  getTokensInCone,
  getTokensInLine,
  resolveAoEImpact
} from '../../src/services/aoeHazardService.js';
import { SENSOR_MODES, checkTargetVisibility } from '../../src/services/sensorVisionService.js';

test('Phase 10.1 YjsProviderBridge: ParticipantConnected broadcasts state vector and detaches cleanly', () => {
  const listeners = new Map();
  let publishedPayloads = 0;

  const mockRoom = {
    name: 'campaign_alpha',
    state: 'connected',
    remoteParticipants: new Map([['peer-1', {}]]),
    localParticipant: {
      publishData: (payload, opts) => {
        if (opts?.reliable && payload?.[0] === 0x02) {
          publishedPayloads += 1;
        }
      }
    },
    on(evt, fn) {
      if (!listeners.has(evt)) listeners.set(evt, new Set());
      listeners.get(evt).add(fn);
    },
    off(evt, fn) {
      listeners.get(evt)?.delete(fn);
    }
  };

  const doc = new Y.Doc();
  const bridge = new YjsProviderBridge(mockRoom, doc);

  assert.ok(bridge.doorsMap);
  assert.ok(bridge.fogStateMap);
  assert.ok(bridge.tokenVitalsMap);
  assert.ok(bridge.turnStateMap);
  assert.ok(bridge.tacticalPingsArray);
  assert.ok(bridge.chatFeedArray);
  assert.ok(bridge.handoutsMap);
  assert.ok(bridge.audioStateMap);
  assert.ok(bridge.sessionMetaMap);

  assert.equal(listeners.get(RoomEvent.ParticipantConnected)?.size, 1);

  // Trigger ParticipantConnected -> must broadcast full state vector
  for (const fn of listeners.get(RoomEvent.ParticipantConnected)) {
    fn({ identity: 'peer-2' });
  }
  assert.equal(publishedPayloads, 1);

  bridge.disconnect();
  assert.equal(listeners.get(RoomEvent.ParticipantConnected)?.size, 0);
  assert.equal(listeners.get(RoomEvent.DataReceived)?.size, 0);
  assert.equal(DataPacket_Kind.RELIABLE !== undefined, true);
});

test('Phase 10.1 VttMultiplayerSyncService: two-peer convergence across doors, vitals, turns, pings, chat, handouts, audio, fog', () => {
  const host = new VttMultiplayerSyncService();
  const peer = new VttMultiplayerSyncService();
  const ch = `phase10-sync-${Date.now()}`;

  host.init({ role: 'architect', channelName: ch });
  peer.init({ role: 'operative', personaId: 'op-jax', channelName: ch });

  // Wire direct CRDT binary pipe simulating LiveKit DataChannel
  host.getDocument().on('update', (upd, origin) => {
    if (origin !== 'network') Y.applyUpdate(peer.getDocument(), upd, 'network');
  });
  peer.getDocument().on('update', (upd, origin) => {
    if (origin !== 'network') Y.applyUpdate(host.getDocument(), upd, 'network');
  });

  // Load token on peer store so vitals observer can update it
  const eng = useEngineStore.getState();
  eng.clearAllEntities();
  eng.loadStaticEntity({ id: 'op-jax', name: 'Jax', base_health: 30, base_vitality: 30 });

  // Broadcast across all channels from host
  host.broadcastDoorToggle('wall-airlock-1', true, 'open');
  host.broadcastTokenVitals('op-jax', { current_health: 19, current_vitality: 12, active_conditions: ['Burning'] });
  host.broadcastTurnState({ roundNumber: 3, currentTurnIndex: 1, initiativeScores: { 'op-jax': 18 } });
  host.broadcastPing({ id: 'ping-1', x: 240, y: 360, type: 'danger', author: 'Architect' });
  host.broadcastChatCard({
    id: 'card-1',
    timestamp: '10:00',
    sender: 'Architect',
    visibility: 'public',
    kind: 'dice',
    title: 'Perception Check',
    body: 'Rolled 19 vs CR 15'
  });
  host.broadcastHandout({ id: 'ho-1', title: 'Encrypted Nav Chart', text: 'Sector 7 coordinates' });
  host.broadcastAudioCue({ bus: 'music', action: 'play', trackId: 'combat-1', title: 'Orbital Strike' });
  host.broadcastFogExplored('map-alpha', [{ type: 'circle', x: 100, y: 100, r: 200 }], true);

  // Check peer Y.Doc received every single channel
  assert.equal(peer.getDocument().getMap('doors').get('wall-airlock-1')?.isOpen, true);
  assert.equal(peer.getDocument().getMap('turn_state').get('current')?.roundNumber, 3);
  assert.equal(peer.getDocument().getArray('tactical_pings').length, 1);
  assert.equal(peer.getDocument().getArray('chat_feed').length, 1);
  assert.equal(peer.getDocument().getMap('handouts').get('ho-1')?.title, 'Encrypted Nav Chart');
  assert.equal(peer.getDocument().getMap('audio_state').get('music')?.trackId, 'combat-1');
  assert.equal(peer.getDocument().getMap('fog_state').get('map-alpha')?.fogEnabled, true);

  // Peer engineStore updated by tokenVitals observer
  const jaxEph = useEngineStore.getState().ephemeralData['op-jax'];
  assert.equal(jaxEph.current_health, 19);
  assert.equal(jaxEph.current_vitality, 12);
  assert.ok(jaxEph.active_conditions.includes('Burning'));

  // Sync status reflects epoch progression & mode
  const status = host.getSyncStatus();
  assert.equal(status.isInitialized, true);
  assert.equal(status.mode, 'local');
  assert.ok(status.epoch >= 8);

  // VttEventBus safe no-op in Node
  VttEventBus.emit('stage-sensor-mode-changed', { mode: 'thermal_infrared', tokenId: 'op-jax' });

  host.destroy();
  peer.destroy();
  eng.clearAllEntities();
});

test('Phase 10.2 AoE, Sensor Vision, VolatileSharder & uiLayoutStore integration', () => {
  const layout = useUILayoutStore.getState();
  layout.resetLayout();
  layout.setActiveArchitectTool('aoe');
  layout.setSelectedAoEPresetId('plasma_grenade');
  layout.setActiveSensorMode('thermal_infrared');

  assert.equal(useUILayoutStore.getState().activeArchitectTool, 'aoe');
  assert.equal(useUILayoutStore.getState().selectedAoEPresetId, 'plasma_grenade');
  assert.equal(useUILayoutStore.getState().activeSensorMode, 'thermal_infrared');

  // VolatileSharder sensor_mode tracking
  const eng = useEngineStore.getState();
  eng.clearAllEntities();
  eng.loadStaticEntity({ id: 'op-1', name: 'Nyx', base_health: 30, base_vitality: 30 });
  eng.updatePosition('op-1', 100, 100);
  eng.setSensorMode('op-1', 'cyber_motion_radar');
  assert.equal(useEngineStore.getState().ephemeralData['op-1'].sensor_mode, 'cyber_motion_radar');

  // Sensor visibility calculation
  const target = { id: 'en-1', x: 250, y: 100 };
  const opticalInSmoke = checkTargetVisibility({ x: 100, y: 100 }, target, 'standard_optical', { hasSmoke: true });
  const thermalInSmoke = checkTargetVisibility({ x: 100, y: 100 }, target, 'thermal_infrared', { hasSmoke: true });
  assert.equal(opticalInSmoke.visible, false);
  assert.equal(thermalInSmoke.visible, true);
  assert.ok(SENSOR_MODES.meta_attunement.piercesWalls);

  // AoE geometry + damage resolution
  const tokens = [
    { id: 't1', label: 'Trooper A', x: 110, y: 100, stamina: 2, armorDr: 4, reflex: 2 },
    { id: 't2', label: 'Trooper B', x: 165, y: 100, stamina: 1, armorDr: 2, reflex: 1 },
    { id: 't3', label: 'Far Trooper', x: 400, y: 400, stamina: 2, armorDr: 4, reflex: 2 }
  ];
  const circleHits = getTokensInCircle({ x: 100, y: 100 }, 80, tokens);
  assert.equal(circleHits.length, 2);

  const coneHits = getTokensInCone({ x: 100, y: 100 }, 0, 60, 120, tokens);
  assert.equal(coneHits.length, 2);

  const lineHits = getTokensInLine({ x: 100, y: 100 }, { x: 300, y: 100 }, 30, tokens);
  assert.equal(lineHits.length, 2);

  const frag = CANONICAL_AOE_PRESETS[0];
  const resolved = resolveAoEImpact(frag, circleHits, { saveRolls: { t1: 20, t2: 8 } });
  assert.equal(resolved[0].saved, true);
  assert.equal(resolved[1].saved, false);

  eng.clearAllEntities();
});
