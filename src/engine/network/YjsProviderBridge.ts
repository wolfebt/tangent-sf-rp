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
  private room: Room;
  private isConnected: boolean = false;
  
  // High-level CRDT structures mapped to Tangent mechanics
  public personaSheets: Y.Map<any>;
  public tacticalBoard: Y.Array<any>;
  public interactiveObjects: Y.Map<any>;
  public campaignWiki: Y.Text;

  constructor(room: Room) {
    this.room = room;
    
    // Initialize the Yjs document with garbage collection enabled by default
    // Prevents document history from ballooning indefinitely over a long campaign
    this.doc = new Y.Doc({ gc: true });
    
    // Map the CRDT structures
    this.personaSheets = this.doc.getMap('personas');
    this.tacticalBoard = this.doc.getArray('tactical_board');
    this.interactiveObjects = this.doc.getMap('interactive_objects');
    this.campaignWiki = this.doc.getText('campaign_wiki');

    this.setupLiveKitListeners();
    this.setupYjsListeners();
  }

  private setupLiveKitListeners() {
    this.room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind) => {
      // Yjs updates MUST be reliable. Ignore LOSSY packets (which are for 60Hz telemetry).
      if (kind === DataPacket_Kind.RELIABLE && participant) {
        this.decodeAndApplyYjsPayload(payload);
      }
    });

    this.room.on(RoomEvent.Connected, () => {
      console.log('[Yjs Bridge] Connected to LiveKit. Broadcasting full state vector sync.');
      this.isConnected = true;
      // Send our current state vector to peers so they can calculate what we are missing
      this.broadcastStateVector();
    });

    this.room.on(RoomEvent.Disconnected, () => {
      this.isConnected = false;
    });
  }

  private setupYjsListeners() {
    // Listen for any local modifications to the Y.Doc (e.g., a player editing HP or moving a token)
    this.doc.on('update', (update: Uint8Array, origin: any) => {
      // If the origin is 'network', we just received this from a peer. 
      // We only broadcast local changes to avoid infinite echo loops.
      if (origin !== 'network' && this.isConnected && this.room.localParticipant) {
        this.broadcastYjsUpdate(update);
      }
    });
  }

  private broadcastYjsUpdate(update: Uint8Array) {
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
    const stateVector = Y.encodeStateVector(this.doc);
    this.broadcastYjsUpdate(stateVector);
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

  public getDocument(): Y.Doc {
    return this.doc;
  }

  public disconnect() {
    this.doc.destroy();
    console.log('[Yjs Bridge] CRDT Document destroyed and listeners detached.');
  }
}
