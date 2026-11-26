/**
 * @file YjsProviderBridge.ts
 * @description Stage 1.5: Conflict-free state resolution for collaborative documents and arrays.
 * Binds a Yjs Document to a LiveKit Reliable DataChannel for zero-conflict peer-to-peer merging.
 */

import * as Y from 'yjs';
import { Room, RoomEvent, DataPacket_Kind, type RemoteParticipant } from 'livekit-client';

// Unique byte prefixes to differentiate Yjs CRDT vs targeted Whisper packets from Telemetry packets
const DEFAULT_PREFIX_YJS = 0x02;
const DEFAULT_PREFIX_SYNC1 = 0x03;
export const PAYLOAD_PREFIX_WHISPER = 0x04;

export interface YjsBridgeOptions {
  onWhisperPayload?: (payload: any, senderIdentity?: string) => void;
  updatePrefix?: number;
  syncStep1Prefix?: number;
  whisperPrefix?: number;
}

/**
 * Encodes a public-safe Yjs state update excluding hidden token vitals stats
 * and private handouts not addressed to the target peer.
 */
export function encodeSanitizedYjsUpdate(
  sourceDoc: Y.Doc,
  targetPeerId?: string
): Uint8Array {
  const shadow = new Y.Doc();
  Y.applyUpdate(shadow, Y.encodeStateAsUpdate(sourceDoc), 'sanitize');
  const vitals = shadow.getMap('token_vitals');
  vitals.forEach((val: any, key: string) => {
    if (val && val.is_hidden === true) {
      vitals.set(key, {
        tokenId: key,
        is_hidden: true,
        timestamp: val.timestamp || Date.now()
      });
    }
  });
  const handouts = shadow.getMap('handouts');
  handouts.forEach((val: any, key: string) => {
    if (
      Array.isArray(val?.targetOperativeIds) &&
      val.targetOperativeIds.length > 0 &&
      (!targetPeerId || !val.targetOperativeIds.includes(targetPeerId))
    ) {
      handouts.delete(key);
    }
  });
  const encoded = Y.encodeStateAsUpdate(shadow);
  shadow.destroy();
  return encoded;
}

export class YjsProviderBridge {
  private doc: Y.Doc;
  private ownsDoc: boolean;
  public room: Room;
  private isConnected: boolean = false;
  private updatePrefix: number;
  private syncStep1Prefix: number;
  private whisperPrefix: number;
  private updateHandler?: ((update: Uint8Array, origin: any) => void) | undefined;
  private dataReceivedHandler?: ((payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind) => void) | undefined;
  private connectedHandler?: (() => void) | undefined;
  private disconnectedHandler?: (() => void) | undefined;
  private participantConnectedHandler?: ((participant: RemoteParticipant) => void) | undefined;
  private onWhisperPayload?: ((payload: any, senderIdentity?: string) => void) | undefined;
  
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

  constructor(room: Room, existingDoc?: Y.Doc, options?: YjsBridgeOptions) {
    this.room = room;
    this.ownsDoc = !existingDoc;
    this.onWhisperPayload = options?.onWhisperPayload;
    this.updatePrefix = options?.updatePrefix ?? DEFAULT_PREFIX_YJS;
    this.syncStep1Prefix = options?.syncStep1Prefix ?? DEFAULT_PREFIX_SYNC1;
    this.whisperPrefix = options?.whisperPrefix ?? PAYLOAD_PREFIX_WHISPER;
    
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
        this.decodeAndApplyYjsPayload(payload, participant.identity);
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
    payload.set([this.updatePrefix], 0);
    payload.set(update, 1);

    try {
      this.room.localParticipant?.publishData(payload, {
        reliable: true
      });
    } catch (error) {
      console.error('[Yjs Bridge] Failed to broadcast CRDT update:', error);
    }
  }

  public sendSyncStep1() {
    if (!this.isConnected || !this.room?.localParticipant) return;
    const stateVector = Y.encodeStateVector(this.doc);
    const payload = new Uint8Array(stateVector.length + 1);
    payload.set([this.syncStep1Prefix], 0);
    payload.set(stateVector, 1);
    try {
      this.room.localParticipant.publishData(payload, { reliable: true });
    } catch (error) {
      console.error('[Yjs Bridge] Failed to broadcast CRDT sync step 1:', error);
    }
  }

  /**
   * Sends a targeted encrypted/reliable whisper payload (0x04) over LiveKit to explicit recipient identities
   * (or all participants with GM/Architect metadata when destinationIdentities is omitted).
   */
  public sendWhisper(data: any, destinationIdentities?: string[]): boolean {
    if (!this.isConnected || !this.room?.localParticipant) return false;
    try {
      const json = JSON.stringify(data);
      const body = new TextEncoder().encode(json);
      const payload = new Uint8Array(body.length + 1);
      payload.set([this.whisperPrefix], 0);
      payload.set(body, 1);

      let targets = Array.isArray(destinationIdentities) && destinationIdentities.length > 0
        ? destinationIdentities
        : undefined;
      if (!targets && this.room?.remoteParticipants && typeof this.room.remoteParticipants.forEach === 'function') {
        const gmIds: string[] = [];
        this.room.remoteParticipants.forEach((p: any) => {
          const metaStr = String(p?.metadata || '').toLowerCase();
          if (metaStr.includes('"gm"') || metaStr.includes('"architect"') || metaStr.includes('"admin"')) {
            if (p.identity) gmIds.push(p.identity);
          }
        });
        if (gmIds.length > 0) targets = gmIds;
      }

      this.room.localParticipant.publishData(payload, {
        reliable: true,
        ...(targets ? { destinationIdentities: targets } : {})
      });
      return true;
    } catch (error) {
      console.error('[Yjs Bridge] Failed to broadcast whisper packet:', error);
      return false;
    }
  }

  public broadcastStateVector(targetPeerId?: string) {
    const publicStateUpdate = encodeSanitizedYjsUpdate(this.doc, targetPeerId);
    this.broadcastYjsUpdate(publicStateUpdate);
  }

  private decodeAndApplyYjsPayload(payload: Uint8Array, senderIdentity?: string) {
    if (payload.length < 2) return;
    const type = payload[0];

    // Verify Yjs packet prefix
    if (type === this.updatePrefix) {
      const updateData = payload.slice(1);
      
      try {
        // Yjs mathematically merges the remote update into our local document.
        // We pass 'network' as the origin to prevent our listener from re-broadcasting it.
        Y.applyUpdate(this.doc, updateData, 'network');
      } catch (error) {
        console.error('[Yjs Bridge] CRDT Merge Conflict / Decryption Error:', error);
      }
    } else if (type === this.syncStep1Prefix) {
      try {
        const remoteStateVector = payload.slice(1);
        const diffUpdate = Y.encodeStateAsUpdate(this.doc, remoteStateVector);
        if (diffUpdate.length > 0) {
          this.broadcastYjsUpdate(diffUpdate);
        }
      } catch (error) {
        console.error('[Yjs Bridge] SyncStep1 diff encode error:', error);
      }
    } else if (type === this.whisperPrefix) {
      try {
        const decoded = new TextDecoder().decode(payload.slice(1));
        const parsed = JSON.parse(decoded);
        this.onWhisperPayload?.(parsed, senderIdentity);
      } catch (error) {
        console.error('[Yjs Bridge] Whisper decode error:', error);
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
