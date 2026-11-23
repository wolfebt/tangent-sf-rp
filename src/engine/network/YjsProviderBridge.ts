/**
 * @file YjsProviderBridge.ts
 * @description Stage 1.5: Conflict-free state resolution for collaborative documents and arrays.
 * Binds a Yjs Document to a LiveKit Reliable DataChannel for zero-conflict peer-to-peer merging.
 */

import * as Y from 'yjs';
import { Room, RoomEvent, DataPacket_Kind, type RemoteParticipant } from 'livekit-client';

// Unique byte prefix to differentiate Yjs binary payloads from Telemetry packets
const PAYLOAD_PREFIX_YJS = 0x02;

export class YjsProviderBridge {
  private doc: Y.Doc;
  private ownsDoc: boolean;
  public room: Room;
  private isConnected: boolean = false;
  private updateHandler?: ((update: Uint8Array, origin: any) => void) | undefined;
  private dataReceivedHandler?: ((payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind) => void) | undefined;
  private connectedHandler?: (() => void) | undefined;
  private disconnectedHandler?: (() => void) | undefined;
  private participantConnectedHandler?: ((participant: RemoteParticipant) => void) | undefined;
  
  // High-level CRDT structures mapped to Tangent mechanics
  public personaSheets: Y.Map<any>;
  public tacticalBoard: Y.Array<any>;
  public tacticalTokensMap: Y.Map<any>;
  public interactiveObjects: Y.Map<any>;
  public campaignWiki: Y.Text;
  public scenarioManuscripts: Y.Map<any>;
  public doorsMap: Y.Map<any>;
  public fogStateMap: Y.Map<any>;
  public tokenVitalsMap: Y.Map<any>;
  public turnStateMap: Y.Map<any>;
  public tacticalPingsArray: Y.Array<any>;
  public chatFeedArray: Y.Array<any>;
  public handoutsMap: Y.Map<any>;
  public audioStateMap: Y.Map<any>;
  public sessionMetaMap: Y.Map<any>;

  constructor(room: Room, existingDoc?: Y.Doc) {
    this.room = room;
    this.ownsDoc = !existingDoc;
    
    // Reuse the caller's Yjs document when provided so local mutations and LiveKit sync share one CRDT instance
    this.doc = existingDoc || new Y.Doc({ gc: true });
    this.isConnected = room?.state === 'connected';
    
    // Map the CRDT structures
    this.personaSheets = this.doc.getMap('personas');
    this.tacticalBoard = this.doc.getArray('tactical_board');
    this.tacticalTokensMap = this.doc.getMap('tactical_tokens');
    this.interactiveObjects = this.doc.getMap('interactive_objects');
    this.campaignWiki = this.doc.getText('campaign_wiki');
    this.scenarioManuscripts = this.doc.getMap('scenario_manuscripts');
    this.doorsMap = this.doc.getMap('doors');
    this.fogStateMap = this.doc.getMap('fog_state');
    this.tokenVitalsMap = this.doc.getMap('token_vitals');
    this.turnStateMap = this.doc.getMap('turn_state');
    this.tacticalPingsArray = this.doc.getArray('tactical_pings');
    this.chatFeedArray = this.doc.getArray('chat_feed');
    this.handoutsMap = this.doc.getMap('handouts');
    this.audioStateMap = this.doc.getMap('audio_state');
    this.sessionMetaMap = this.doc.getMap('session_meta');

    this.setupLiveKitListeners();
    this.setupYjsListeners();
  }

  private setupLiveKitListeners() {
    this.dataReceivedHandler = (payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind) => {
      // Yjs updates MUST be reliable. Ignore LOSSY packets (which are for 60Hz telemetry).
      if (kind === DataPacket_Kind.RELIABLE && participant) {
        this.decodeAndApplyYjsPayload(payload);
      }
    };

    this.connectedHandler = () => {
      console.log('[Yjs Bridge] Connected to LiveKit. Broadcasting full state update sync.');
      this.isConnected = true;
      // Send our current encoded state update to peers so they can merge our document state
      this.broadcastStateVector();
    };

    this.disconnectedHandler = () => {
      this.isConnected = false;
    };

    this.participantConnectedHandler = () => {
      if (this.isConnected && this.room?.localParticipant) {
        this.broadcastStateVector();
      }
    };

    this.room?.on?.(RoomEvent.DataReceived, this.dataReceivedHandler);
    this.room?.on?.(RoomEvent.Connected, this.connectedHandler);
    this.room?.on?.(RoomEvent.Disconnected, this.disconnectedHandler);
    this.room?.on?.(RoomEvent.ParticipantConnected, this.participantConnectedHandler);
  }

  private setupYjsListeners() {
    // Listen for any local modifications to the Y.Doc (e.g., a player editing HP or moving a token)
    this.updateHandler = (update: Uint8Array, origin: any) => {
      // If the origin is 'network', we just received this from a peer. 
      // We only broadcast local changes to avoid infinite echo loops.
      if (origin !== 'network' && this.isConnected && this.room.localParticipant) {
        this.broadcastYjsUpdate(update);
      }
    };
    this.doc.on('update', this.updateHandler);
  }

  public broadcastYjsUpdate(update: Uint8Array) {
    const payload = new Uint8Array(update.length + 1);
    payload.set([PAYLOAD_PREFIX_YJS], 0);
    payload.set(update, 1);

    try {
      this.room.localParticipant?.publishData(payload, {
        reliable: true
      });
    } catch (error) {
      console.error('[Yjs Bridge] Failed to broadcast CRDT update:', error);
    }
  }

  private broadcastStateVector() {
    const fullStateUpdate = Y.encodeStateAsUpdate(this.doc);
    this.broadcastYjsUpdate(fullStateUpdate);
  }

  private decodeAndApplyYjsPayload(payload: Uint8Array) {
    if (payload.length < 2) return;
    const type = payload[0];

    // Verify Yjs packet prefix
    if (type === PAYLOAD_PREFIX_YJS) {
      const updateData = payload.slice(1);
      
      try {
        // Yjs mathematically merges the remote update into our local document.
        // We pass 'network' as the origin to prevent our listener from re-broadcasting it.
        Y.applyUpdate(this.doc, updateData, 'network');
      } catch (error) {
        console.error('[Yjs Bridge] CRDT Merge Conflict / Decryption Error:', error);
      }
    }
  }

  public setTokenPosition(tokenId: string, pos: { x: number; y: number; z?: number; updatedBy?: string }): void {
    this.tacticalTokensMap.set(tokenId, {
      ...pos,
      timestamp: Date.now()
    });
  }

  public getTokenPosition(tokenId: string): any {
    return this.tacticalTokensMap.get(tokenId);
  }

  public observeTacticalTokens(callback: (tokenId: string, pos: any, origin: any) => void): () => void {
    const observer = (event: Y.YMapEvent<any>, transaction: Y.Transaction) => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          callback(key, this.tacticalTokensMap.get(key), transaction.origin);
        }
      });
    };
    this.tacticalTokensMap.observe(observer);
    return () => this.tacticalTokensMap.unobserve(observer);
  }

  public getDocument(): Y.Doc {
    return this.doc;
  }

  public disconnect() {
    const detachRoomListener = (eventName: any, handler: any) => {
      if (!handler || !this.room) return;
      if (typeof (this.room as any).off === 'function') {
        (this.room as any).off(eventName, handler);
      } else if (typeof (this.room as any).removeListener === 'function') {
        (this.room as any).removeListener(eventName, handler);
      }
    };

    detachRoomListener(RoomEvent.DataReceived, this.dataReceivedHandler);
    detachRoomListener(RoomEvent.Connected, this.connectedHandler);
    detachRoomListener(RoomEvent.Disconnected, this.disconnectedHandler);
    detachRoomListener(RoomEvent.ParticipantConnected, this.participantConnectedHandler);
    this.dataReceivedHandler = undefined;
    this.connectedHandler = undefined;
    this.disconnectedHandler = undefined;
    this.participantConnectedHandler = undefined;
    this.isConnected = false;

    if (this.updateHandler) {
      this.doc.off('update', this.updateHandler);
      this.updateHandler = undefined;
    }
    if (this.ownsDoc) {
      this.doc.destroy();
    }
    console.log('[Yjs Bridge] CRDT listeners detached.');
  }
}
