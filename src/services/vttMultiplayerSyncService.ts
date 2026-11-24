/**
 * @file vttMultiplayerSyncService.ts
 * @description Real-time CRDT and WebRTC multiplayer synchronization for VTT Stage (/stage).
 * Synchronizes token movements, door/bulkhead states, fog exploration, token vitals/conditions,
 * turn order, tactical pings, combat roll cards, handouts, and audio cues between Architect (GM)
 * and Operative (Player) roles using Yjs CRDTs over LiveKit Reliable DataChannels,
 * optional Firestore checkpoints, and local multi-window BroadcastChannels.
 */

import * as Y from 'yjs';
import { useEngineStore } from '../engine/state/VolatileSharder.ts';
import { YjsProviderBridge } from '../engine/network/YjsProviderBridge.ts';
import { FirestoreDebouncer } from '../engine/network/FirestoreDebouncer.ts';
import { VttEventBus } from '../utils/vttEventBus.ts';

export type UserVttRole = 'architect' | 'operative';

export interface VttSyncPersistenceConfig {
  campaignId: string;
  sessionId: string;
  intervalMs?: number;
  ownerId?: string;
  memberIds?: string[];
  collectionRoot?: 'Campaigns' | 'user_stories';
  firestoreInstance?: any;
}

export interface VttSyncConfig {
  role?: UserVttRole;
  personaId?: string;
  actorId?: string;
  room?: any; // LiveKit Room instance if active
  channelName?: string;
  persistence?: VttSyncPersistenceConfig;
}

export interface VttSyncStatus {
  isInitialized: boolean;
  mode: 'local' | 'livekit' | 'livekit+firestore';
  peerCount: number;
  role: UserVttRole;
  roomName: string | null;
  epoch: number;
}

export class VttMultiplayerSyncService {
  private static instance: VttMultiplayerSyncService | null = null;
  private doc: Y.Doc;
  private tacticalTokensMap: Y.Map<any>;
  private doorsMap: Y.Map<any>;
  private fogStateMap: Y.Map<any>;
  private tokenVitalsMap: Y.Map<any>;
  private turnStateMap: Y.Map<any>;
  private tacticalPingsArray: Y.Array<any>;
  private chatFeedArray: Y.Array<any>;
  private handoutsMap: Y.Map<any>;
  private audioStateMap: Y.Map<any>;
  private sessionMetaMap: Y.Map<any>;

  private broadcastChannel: BroadcastChannel | null = null;
  private yjsBridge: YjsProviderBridge | null = null;
  private persistenceDebouncer: FirestoreDebouncer | null = null;
  private role: UserVttRole = 'architect';
  private personaId: string | null = null;
  private actorId: string = `peer_${Math.random().toString(36).slice(2, 10)}`;
  private isInitialized = false;
  private seenChatCardIds = new Set<string>();
  private unsubscribers: Array<() => void> = [];
  private docUpdateHandler: ((update: Uint8Array, origin: any) => void) | null = null;

  constructor() {
    this.doc = new Y.Doc({ gc: true });
    this.tacticalTokensMap = this.doc.getMap('tactical_tokens');
    this.doorsMap = this.doc.getMap('doors');
    this.fogStateMap = this.doc.getMap('fog_state');
    this.tokenVitalsMap = this.doc.getMap('token_vitals');
    this.turnStateMap = this.doc.getMap('turn_state');
    this.tacticalPingsArray = this.doc.getArray('tactical_pings');
    this.chatFeedArray = this.doc.getArray('chat_feed');
    this.handoutsMap = this.doc.getMap('handouts');
    this.audioStateMap = this.doc.getMap('audio_state');
    this.sessionMetaMap = this.doc.getMap('session_meta');
  }

  public static getInstance(): VttMultiplayerSyncService {
    if (!VttMultiplayerSyncService.instance) {
      VttMultiplayerSyncService.instance = new VttMultiplayerSyncService();
    }
    return VttMultiplayerSyncService.instance;
  }

  /**
   * Initializes real-time synchronization for the active Stage session.
   */
  public init(config: VttSyncConfig = {}): void {
    if (config.actorId) {
      this.actorId = config.actorId;
    }
    if (this.isInitialized) {
      if (config.role) {
        this.role = config.role;
      }
      if (config.personaId) {
        this.personaId = config.personaId;
      }
      if (config.room) {
        this.attachLiveKitRoom(config.room);
      }
      if (config.persistence?.campaignId && config.persistence?.sessionId) {
        this.attachPersistence(config.persistence);
      }
      return;
    }

    // Detect role & persona from config or window.location query params
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get('role')?.toLowerCase();
      if (queryRole === 'operative' || queryRole === 'player' || queryRole === 'spectator') {
        this.role = 'operative';
      } else {
        this.role = config.role || 'architect';
      }
      this.personaId = config.personaId || params.get('personaId') || params.get('persona') || null;
    } else {
      this.role = config.role || 'architect';
      this.personaId = config.personaId || null;
    }

    // 1. Initialize local multi-window BroadcastChannel & request catch-up state from sibling tabs
    const channelName = config.channelName || 'tangent_vtt_stage_sync';
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(channelName);
        this.broadcastChannel.onmessage = (event: MessageEvent) => {
          this.handleBroadcastMessage(event.data);
        };
        this.broadcastChannel.postMessage({
          type: 'SYNC_REQUEST',
          actorId: this.actorId,
          timestamp: Date.now()
        });
      } catch (err) {
        console.warn('[VttMultiplayerSync] BroadcastChannel not supported:', err);
      }
    }

    // 2. Attach LiveKit room if provided
    if (config.room) {
      this.attachLiveKitRoom(config.room);
    }

    // 3. Listen to Yjs CRDT updates to broadcast to peers
    this.docUpdateHandler = (update: Uint8Array, origin: any) => {
      if (origin !== 'network') {
        this.broadcastYjsUpdate(update);
      }
    };
    this.doc.on('update', this.docUpdateHandler);

    // 4. Optional throttled Firestore CRDT persistence (only when explicitly configured)
    if (config.persistence?.campaignId && config.persistence?.sessionId) {
      this.attachPersistence(config.persistence);
    }

    // 5. Observe tactical token positions
    const tokenObserver = (event: Y.YMapEvent<any>, transaction: Y.Transaction) => {
      if (transaction.origin !== 'network') return;
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          const data = this.tacticalTokensMap.get(key);
          if (data && typeof data.x === 'number' && typeof data.y === 'number') {
            useEngineStore.getState().updatePosition(key, data.x, data.y, data.z || 0);
          }
        }
      });
    };
    this.tacticalTokensMap.observe(tokenObserver);
    this.unsubscribers.push(() => this.tacticalTokensMap.unobserve(tokenObserver));

    // 6. Observe doors / bulkheads
    const doorsObserver = (event: Y.YMapEvent<any>, transaction: Y.Transaction) => {
      if (transaction.origin !== 'network') return;
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          const data = this.doorsMap.get(key);
          if (data) {
            VttEventBus.emit('stage-remote-door-toggled', {
              wallId: key,
              isOpen: Boolean(data.isOpen),
              doorState: data.doorState,
              breachHp: data.breachHp,
              timestamp: data.timestamp
            });
          }
        }
      });
    };
    this.doorsMap.observe(doorsObserver);
    this.unsubscribers.push(() => this.doorsMap.unobserve(doorsObserver));

    // 7. Observe token vitals / conditions
    const vitalsObserver = (event: Y.YMapEvent<any>, transaction: Y.Transaction) => {
      if (transaction.origin !== 'network') return;
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          const data = this.tokenVitalsMap.get(key);
          if (!data) return;
          const store = useEngineStore.getState();
          if (typeof data.current_structure === 'number') {
            store.setStructure(key, data.current_structure);
          }
          if (typeof data.current_health === 'number') {
            store.setHealth(key, data.current_health);
          } else if (typeof data.current_hp === 'number' && typeof data.current_structure !== 'number') {
            store.setHealth(key, data.current_hp);
          }
          if (typeof data.current_vitality === 'number') {
            store.setVitality(key, data.current_vitality);
          }
          if (typeof data.is_hidden === 'boolean') {
            store.setHidden(key, data.is_hidden);
          }
          if (Array.isArray(data.active_conditions)) {
            const current = store.ephemeralData[key]?.active_conditions || [];
            for (const cond of data.active_conditions) {
              if (!current.includes(cond)) store.addCondition(key, cond);
            }
            for (const existing of current) {
              if (!data.active_conditions.includes(existing)) {
                store.toggleCondition(key, existing);
              }
            }
          }
          if (Array.isArray(data.active_effects)) {
            const currentEffects = store.ephemeralData[key]?.active_effects || [];
            const incomingIds = new Set(data.active_effects.map((e: any) => e?.id).filter(Boolean));
            for (const existingEff of currentEffects) {
              if (existingEff?.id && !incomingIds.has(existingEff.id)) {
                store.removeActiveEffect(key, existingEff.id);
              }
            }
            for (const eff of data.active_effects) {
              if (eff && eff.id) {
                store.addActiveEffect(key, eff);
              }
            }
          }
        }
      });
    };
    this.tokenVitalsMap.observe(vitalsObserver);
    this.unsubscribers.push(() => this.tokenVitalsMap.unobserve(vitalsObserver));

    // 8. Observe turn state
    const turnObserver = (_event: Y.YMapEvent<any>, transaction: Y.Transaction) => {
      if (transaction.origin !== 'network') return;
      const turnState = this.turnStateMap.get('current');
      if (turnState) {
        VttEventBus.emit('stage-remote-turn-update', turnState);
      }
    };
    this.turnStateMap.observe(turnObserver);
    this.unsubscribers.push(() => this.turnStateMap.unobserve(turnObserver));

    // 9. Observe tactical pings
    const pingsObserver = (event: Y.YArrayEvent<any>, transaction: Y.Transaction) => {
      if (transaction.origin !== 'network') return;
      event.changes.added.forEach((item) => {
        const vals = item.content.getContent();
        vals.forEach((ping: any) => {
          if (ping && typeof ping.x === 'number' && typeof ping.y === 'number') {
            VttEventBus.emit('stage-remote-ping', ping);
          }
        });
      });
    };
    this.tacticalPingsArray.observe(pingsObserver);
    this.unsubscribers.push(() => this.tacticalPingsArray.unobserve(pingsObserver));

    // 10. Observe chat / roll cards with Operative whisper & blind-GM redaction
    const chatObserver = (event: Y.YArrayEvent<any>, transaction: Y.Transaction) => {
      if (transaction.origin !== 'network') return;
      event.changes.added.forEach((item) => {
        const vals = item.content.getContent();
        vals.forEach((card: any) => {
          if (card && card.id) {
            this.emitSanitizedRemoteCard(card);
          }
        });
      });
    };
    this.chatFeedArray.observe(chatObserver);
    this.unsubscribers.push(() => this.chatFeedArray.unobserve(chatObserver));

    // 11. Observe handouts
    const handoutsObserver = (event: Y.YMapEvent<any>, transaction: Y.Transaction) => {
      if (transaction.origin !== 'network') return;
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          const handout = this.handoutsMap.get(key);
          if (handout) {
            VttEventBus.emit('stage-remote-handout', handout);
          }
        }
      });
    };
    this.handoutsMap.observe(handoutsObserver);
    this.unsubscribers.push(() => this.handoutsMap.unobserve(handoutsObserver));

    // 12. Observe audio cues
    const audioObserver = (event: Y.YMapEvent<any>, transaction: Y.Transaction) => {
      if (transaction.origin !== 'network') return;
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          const cue = this.audioStateMap.get(key);
          if (cue) {
            VttEventBus.emit('stage-remote-audio-cue', cue);
          }
        }
      });
    };
    this.audioStateMap.observe(audioObserver);
    this.unsubscribers.push(() => this.audioStateMap.unobserve(audioObserver));

    // 13. Observe fog explored areas
    const fogObserver = (event: Y.YMapEvent<any>, transaction: Y.Transaction) => {
      if (transaction.origin !== 'network') return;
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          const fogData = this.fogStateMap.get(key);
          if (fogData) {
            VttEventBus.emit('stage-remote-fog-explored', {
              mapId: key,
              exploredAreas: Array.isArray(fogData.exploredAreas) ? fogData.exploredAreas : [],
              ...(Array.isArray(fogData.hiddenAreas) ? { hiddenAreas: fogData.hiddenAreas } : {}),
              fogEnabled: fogData.fogEnabled,
              timestamp: fogData.timestamp
            });
          }
        }
      });
    };
    this.fogStateMap.observe(fogObserver);
    this.unsubscribers.push(() => this.fogStateMap.unobserve(fogObserver));

    this.isInitialized = true;
    console.log(`[VttMultiplayerSync] Initialized as [${this.role.toUpperCase()}] (Persona: ${this.personaId || 'None'})`);
  }

  private sanitizeIncomingChatCard(card: any): any | null {
    if (!card || !card.id) return null;
    const isPrivileged = this.role === 'architect';
    if (!isPrivileged) {
      if (card.visibility === 'whisper_gm' && card.senderId !== this.actorId) {
        return null;
      }
      if (card.visibility === 'blind_gm') {
        return {
          id: card.id,
          timestamp: card.timestamp,
          sender: card.sender,
          senderRole: card.senderRole,
          senderId: card.senderId,
          visibility: 'blind_gm',
          kind: card.kind,
          title: '[BLIND GM ROLL]',
          body: 'Resolved in secret by the Architect.',
          remote: true
        };
      }
    }
    return { ...card, remote: true };
  }

  private emitSanitizedRemoteCard(card: any): void {
    const safeCard = this.sanitizeIncomingChatCard(card);
    if (!safeCard) return;
    if (this.seenChatCardIds.has(safeCard.id)) return;
    this.seenChatCardIds.add(safeCard.id);
    if (this.seenChatCardIds.size > 200) {
      const oldest = this.seenChatCardIds.values().next().value;
      if (oldest) this.seenChatCardIds.delete(oldest);
    }
    VttEventBus.emit('stage-chat-card', safeCard);
  }

  private bumpEpoch(): number {
    const prev = Number(this.sessionMetaMap.get('epoch') || 0);
    const next = prev + 1;
    this.sessionMetaMap.set('epoch', next);
    this.sessionMetaMap.set('lastActorId', this.actorId);
    this.sessionMetaMap.set('lastUpdatedAt', Date.now());
    return next;
  }

  /**
   * Broadcasts a local token position change across the multiplayer mesh.
   */
  public broadcastTokenMove(tokenId: string, x: number, y: number, z = 0): boolean {
    if (!this.canMoveToken(tokenId)) {
      console.warn(`[VttMultiplayerSync] Role "${this.role}" is not authorized to move token "${tokenId}".`);
      return false;
    }

    this.doc.transact(() => {
      this.tacticalTokensMap.set(tokenId, {
        id: tokenId,
        x,
        y,
        z,
        updatedBy: this.role,
        personaId: this.personaId,
        timestamp: Date.now()
      });
      this.bumpEpoch();
    }, 'local');

    return true;
  }

  public broadcastDoorToggle(wallId: string, isOpen: boolean, doorState?: string, breachHp?: number): void {
    this.doc.transact(() => {
      this.doorsMap.set(wallId, {
        wallId,
        isOpen: Boolean(isOpen),
        ...(doorState !== undefined ? { doorState } : {}),
        ...(breachHp !== undefined ? { breachHp } : {}),
        updatedBy: this.role,
        timestamp: Date.now()
      });
      this.bumpEpoch();
    }, 'local');
  }

  public broadcastTokenVitals(
    tokenId: string,
    vitalsPayload: {
      current_hp?: number;
      current_health?: number;
      current_vitality?: number;
      current_structure?: number;
      is_hidden?: boolean;
      active_conditions?: string[];
      active_effects?: any[];
    }
  ): void {
    this.doc.transact(() => {
      this.tokenVitalsMap.set(tokenId, {
        ...vitalsPayload,
        tokenId,
        updatedBy: this.role,
        timestamp: Date.now()
      });
      this.bumpEpoch();
    }, 'local');
  }

  public broadcastTurnState(state: {
    roundNumber: number;
    currentTurnIndex: number;
    initiativeScores?: Record<string, number>;
  }): void {
    this.doc.transact(() => {
      this.turnStateMap.set('current', {
        ...state,
        timestamp: Date.now()
      });
      this.bumpEpoch();
    }, 'local');
  }

  public broadcastPing(ping: { id?: string; x: number; y: number; type?: string; color?: string; label?: string; author?: string; timestamp?: number }): void {
    this.doc.transact(() => {
      this.tacticalPingsArray.push([
        {
          ...ping,
          timestamp: ping.timestamp ?? Date.now()
        }
      ]);
      if (this.tacticalPingsArray.length > 25) {
        this.tacticalPingsArray.delete(0, this.tacticalPingsArray.length - 25);
      }
      this.bumpEpoch();
    }, 'local');
  }

  public broadcastChatCard(card: {
    id: string;
    timestamp: string;
    sender: string;
    senderRole?: string;
    senderId?: string;
    recipientIds?: string[];
    visibility: 'public' | 'whisper_gm' | 'blind_gm';
    kind: 'attack' | 'aoe' | 'dice' | 'effect' | 'handout' | 'narration' | 'system';
    title: string;
    body: string;
    diceBreakdown?: any;
    damagePayload?: any;
    handoutPayload?: any;
  }): void {
    const stampedCard = {
      ...card,
      senderId: card.senderId || this.actorId,
      senderRole: card.senderRole || this.role
    };

    // Route private GM whispers over targeted LiveKit 0x04 channel when live room is active
    if (stampedCard.visibility === 'whisper_gm' && this.yjsBridge?.room?.state === 'connected') {
      this.yjsBridge.sendWhisper(stampedCard, stampedCard.recipientIds);
      return;
    }

    if (stampedCard.visibility === 'blind_gm' && this.yjsBridge?.room?.state === 'connected') {
      // Send full card directly to GM peers via targeted 0x04 whisper and push redacted placeholder to CRDT feed
      this.yjsBridge.sendWhisper(stampedCard, stampedCard.recipientIds);
      const redactedForFeed = {
        id: stampedCard.id,
        timestamp: stampedCard.timestamp,
        sender: stampedCard.sender,
        senderRole: stampedCard.senderRole,
        senderId: stampedCard.senderId,
        visibility: 'blind_gm' as const,
        kind: stampedCard.kind,
        title: '[BLIND GM ROLL]',
        body: 'Resolved in secret by the Architect.'
      };
      this.doc.transact(() => {
        this.chatFeedArray.push([redactedForFeed]);
        if (this.chatFeedArray.length > 100) {
          this.chatFeedArray.delete(0, this.chatFeedArray.length - 100);
        }
        this.bumpEpoch();
      }, 'local');
      return;
    }

    this.doc.transact(() => {
      this.chatFeedArray.push([stampedCard]);
      if (this.chatFeedArray.length > 100) {
        this.chatFeedArray.delete(0, this.chatFeedArray.length - 100);
      }
      this.bumpEpoch();
    }, 'local');
  }

  public broadcastHandout(handout: {
    id: string;
    title: string;
    imageUrl?: string;
    text?: string;
    sender?: string;
    targetOperativeIds?: string[];
  }): void {
    this.doc.transact(() => {
      this.handoutsMap.set(handout.id, {
        ...handout,
        timestamp: Date.now()
      });
      this.bumpEpoch();
    }, 'local');
  }

  public broadcastAudioCue(audioCue: {
    bus: 'music' | 'ambient' | 'sfx';
    action: 'play' | 'stop' | 'volume' | 'crossfade';
    trackId?: string;
    trackUrl?: string;
    title?: string;
    volume?: number;
  }): void {
    this.doc.transact(() => {
      this.audioStateMap.set(audioCue.bus, {
        ...audioCue,
        timestamp: Date.now()
      });
      this.bumpEpoch();
    }, 'local');
  }

  public broadcastFogExplored(mapId: string, exploredAreas: any[], fogEnabled?: boolean, hiddenAreas?: any[]): void {
    this.doc.transact(() => {
      this.fogStateMap.set(mapId, {
        mapId,
        exploredAreas,
        ...(Array.isArray(hiddenAreas) ? { hiddenAreas } : {}),
        ...(fogEnabled !== undefined ? { fogEnabled } : {}),
        timestamp: Date.now()
      });
      this.bumpEpoch();
    }, 'local');
  }

  /**
   * Verifies if the current user role is authorized to move this token.
   */
  public canMoveToken(tokenId: string): boolean {
    if (this.role === 'architect') return true;

    const store = useEngineStore.getState();
    const token = store.staticData[tokenId] as any;
    if (this.personaId) {
      if (tokenId === this.personaId) return true;
      if (token && (token.character_doc_id === this.personaId || token.source_persona_id === this.personaId)) {
        return true;
      }
      return false;
    }

    if (token) {
      if (this.actorId && (token.ownerUid === this.actorId || token.controllerUid === this.actorId)) {
        return true;
      }
      if (token.is_persona && !token.ownerUid && !token.creatorUid) {
        return true;
      }
    }

    return false;
  }

  /**
   * Broadcasts high-frequency 60Hz drag-ghost telemetry without writing to CRDT history.
   */
  public broadcastDragGhost(tokenId: string, x: number, y: number): void {
    if (!this.canMoveToken(tokenId)) return;

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'TOKEN_DRAG_GHOST',
        tokenId,
        x,
        y,
        role: this.role,
        timestamp: Date.now()
      });
    }
  }

  private broadcastYjsUpdate(update: Uint8Array): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'YJS_UPDATE',
        update: Array.from(update)
      });
    }
    // LiveKit YjsProviderBridge listens to `doc.on('update')` automatically.
  }

  public broadcastFogUpdate(mapId: string, fogEnabled: boolean, fog?: any[]): void {
    const payload = { type: 'fog_update', mapId, fogEnabled, ...(fog !== undefined ? { fog } : {}) };
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(payload);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stage-remote-fog-update', { detail: { mapId, fogEnabled, fog } }));
    }
  }

  private handleBroadcastMessage(data: any): void {
    if (!data) return;

    if (data.type === 'SYNC_REQUEST' && data.actorId && data.actorId !== this.actorId) {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'SYNC_STATE',
          targetActorId: data.actorId,
          actorId: this.actorId,
          epoch: Number(this.sessionMetaMap.get('epoch') || 0),
          state: Array.from(Y.encodeStateAsUpdate(this.doc)),
          timestamp: Date.now()
        });
      }
    } else if (data.type === 'SYNC_STATE' && Array.isArray(data.state)) {
      if (data.targetActorId && data.targetActorId !== this.actorId) return;
      const updateData = new Uint8Array(data.state);
      try {
        Y.applyUpdate(this.doc, updateData, 'network');
        const localEpoch = Number(this.sessionMetaMap.get('epoch') || 0);
        const localActor = String(this.sessionMetaMap.get('lastActorId') || '');
        const incomingEpoch = Number(data.epoch || 0);
        const incomingActor = String(data.actorId || '');
        if (incomingEpoch > localEpoch || (incomingEpoch === localEpoch && incomingActor > localActor)) {
          this.doc.transact(() => {
            this.sessionMetaMap.set('epoch', incomingEpoch);
            if (incomingActor) this.sessionMetaMap.set('lastActorId', incomingActor);
          }, 'network');
        }
      } catch (err) {
        console.error('[VttMultiplayerSync] Error applying SYNC_STATE update:', err);
      }
    } else if (data.type === 'YJS_UPDATE' && Array.isArray(data.update)) {
      const updateData = new Uint8Array(data.update);
      try {
        Y.applyUpdate(this.doc, updateData, 'network');
      } catch (err) {
        console.error('[VttMultiplayerSync] Error applying peer update:', err);
      }
    } else if (data.type === 'TOKEN_DRAG_GHOST') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('stage-remote-token-ghost', { detail: data }));
      }
    } else if (data.type === 'fog_update') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('stage-remote-fog-update', { detail: data }));
      }
    }
  }

  public attachPersistence(config: VttSyncPersistenceConfig): void {
    this.detachPersistence();
    if (!config?.campaignId || !config?.sessionId) return;
    this.persistenceDebouncer = new FirestoreDebouncer(
      config.campaignId,
      config.sessionId,
      this.doc,
      config.intervalMs ?? 5000,
      config.firestoreInstance,
      {
        ...(config.ownerId !== undefined ? { ownerId: config.ownerId } : {}),
        ...(config.memberIds !== undefined ? { memberIds: config.memberIds } : {}),
        ...(config.collectionRoot !== undefined ? { collectionRoot: config.collectionRoot } : {})
      }
    );
  }

  public async hydrateFromPersistence(): Promise<boolean> {
    if (!this.persistenceDebouncer) return false;
    return this.persistenceDebouncer.hydrateFromFirestore();
  }

  public detachPersistence(): void {
    if (this.persistenceDebouncer) {
      this.persistenceDebouncer.destroy();
      this.persistenceDebouncer = null;
    }
  }

  public attachLiveKitRoom(room: any): void {
    if (!room) return;
    if (this.yjsBridge?.room === room) return;
    if (this.yjsBridge) {
      this.yjsBridge.disconnect();
      this.yjsBridge = null;
    }

    try {
      this.yjsBridge = new YjsProviderBridge(room, this.doc, {
        onWhisperPayload: (card) => {
          if (card && card.id) {
            this.emitSanitizedRemoteCard(card);
          }
        }
      });
      if (room?.state === 'connected' && room?.localParticipant) {
        this.yjsBridge.broadcastStateVector();
      }
      console.log('[VttMultiplayerSync] Attached LiveKit room to YjsProviderBridge.');
    } catch (err) {
      console.warn('[VttMultiplayerSync] Failed to attach LiveKit room:', err);
    }
  }

  public detachLiveKitRoom(): void {
    if (this.yjsBridge) {
      this.yjsBridge.disconnect();
      this.yjsBridge = null;
    }
  }

  public getSyncStatus(): VttSyncStatus {
    const hasLiveKit = Boolean(this.yjsBridge);
    const hasPersistence = Boolean(this.persistenceDebouncer);
    const remoteCount = Number(this.yjsBridge?.room?.remoteParticipants?.size ?? 0);
    return {
      isInitialized: this.isInitialized,
      mode: hasLiveKit && hasPersistence ? 'livekit+firestore' : hasLiveKit ? 'livekit' : 'local',
      peerCount: hasLiveKit ? Math.max(1, remoteCount + 1) : 1,
      role: this.role,
      roomName: this.yjsBridge?.room?.name || null,
      epoch: Number(this.sessionMetaMap.get('epoch') || 0)
    };
  }

  public getRole(): UserVttRole {
    return this.role;
  }

  public setRole(role: UserVttRole): void {
    this.role = role;
  }

  public getDocument(): Y.Doc {
    return this.doc;
  }

  public getTacticalTokensMap(): Y.Map<any> {
    return this.tacticalTokensMap;
  }

  public destroy(): void {
    this.detachPersistence();
    if (this.docUpdateHandler) {
      this.doc.off('update', this.docUpdateHandler);
      this.docUpdateHandler = null;
    }
    this.unsubscribers.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    this.unsubscribers = [];
    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = null;
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    if (this.yjsBridge) {
      this.yjsBridge.disconnect();
      this.yjsBridge = null;
    }
    this.isInitialized = false;
  }
}

export const getVttMultiplayerSync = (): VttMultiplayerSyncService => VttMultiplayerSyncService.getInstance();
export default VttMultiplayerSyncService;
