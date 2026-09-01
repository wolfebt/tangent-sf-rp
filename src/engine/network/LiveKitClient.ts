/**
 * @file LiveKitClient.ts
 * @description Stage 1.4: High-frequency WebRTC telemetry for zero-latency awareness on the Stage.
 * Broadcasts unreliable binary payloads (cursors, token drag ghosts, tactical pings) at 60Hz via LiveKit SFU DataChannels.
 */

import { Room, RoomEvent, DataPacket_Kind, type RemoteParticipant } from 'livekit-client';

// --- BINARY SERIALIZATION ---
// Payload Structure: [PayloadType (1 byte)] + [X (4 bytes float32)] + [Y (4 bytes float32)]
export const TELEMETRY_PAYLOAD_TYPES = {
  CURSOR: 1,
  TOKEN_DRAG: 2,
  PING: 3
} as const;

export type TelemetryPayloadType = typeof TELEMETRY_PAYLOAD_TYPES[keyof typeof TELEMETRY_PAYLOAD_TYPES];

export interface RemoteCursorState {
  x: number;
  y: number;
  timestamp: number;
}

export interface RemoteDragGhostState {
  tokenId: string;
  x: number;
  y: number;
  timestamp: number;
}

export class TelemetryClient {
  private room: Room;
  private broadcastInterval: number | null = null;
  private isConnected: boolean = false;
  
  // Track remote states for linear extrapolation/interpolation on the Stage
  private remoteCursors: Map<string, RemoteCursorState> = new Map();
  private remoteGhosts: Map<string, RemoteDragGhostState> = new Map();
  private localCursorGetter: (() => { x: number; y: number }) | null = null;

  constructor() {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    
    this.setupListeners();
  }

  public setLocalCursorGetter(getter: () => { x: number; y: number }) {
    this.localCursorGetter = getter;
  }

  private setupListeners() {
    this.room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind) => {
      // We only care about LOSSY (unreliable) data for high-frequency telemetry
      if (kind === DataPacket_Kind.LOSSY && participant) {
        this.decodeBinaryPayload(payload, participant.identity);
      }
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.warn('[Telemetry] Lost connection to LiveKit SFU.');
      this.isConnected = false;
      this.stopBroadcastLoop();
    });
  }

  public async connect(url: string, token: string): Promise<boolean> {
    try {
      console.log('[Telemetry] Connecting to LiveKit SFU room...');
      await this.room.connect(url, token);
      this.isConnected = true;
      console.log('[Telemetry] Connected successfully. Enabling 60Hz telemetry broadcast.');
      
      this.startBroadcastLoop();
      return true;
    } catch (error) {
      console.error('[Telemetry] Failed to connect:', error);
      return false;
    }
  }

  /**
   * Broadcasts the local user's volatile Stage state 60 times per second using unreliable UDP
   */
  private startBroadcastLoop() {
    if (this.broadcastInterval) return;

    // ~16.6ms interval for 60fps telemetry target
    this.broadcastInterval = window.setInterval(() => {
      if (!this.isConnected || !this.room.localParticipant) return;

      const cursorState = this.getLocalCursorState();
      
      // Serialize to binary (9 bytes total)
      const buffer = new ArrayBuffer(9);
      const view = new DataView(buffer);
      
      view.setUint8(0, TELEMETRY_PAYLOAD_TYPES.CURSOR);
      view.setFloat32(1, cursorState.x, true); // Little endian
      view.setFloat32(5, cursorState.y, true);

      // Publish via unreliable channel to prevent head-of-line blocking if packets drop
      this.room.localParticipant.publishData(new Uint8Array(buffer), {
        reliable: false
      });
    }, 1000 / 60); 
  }

  /**
   * Broadcast a tactical ping on the Stage
   */
  public broadcastTacticalPing(x: number, y: number) {
    if (!this.isConnected || !this.room.localParticipant) return;
    
    const buffer = new ArrayBuffer(9);
    const view = new DataView(buffer);
    view.setUint8(0, TELEMETRY_PAYLOAD_TYPES.PING);
    view.setFloat32(1, x, true);
    view.setFloat32(5, y, true);
    
    this.room.localParticipant.publishData(new Uint8Array(buffer), {
      reliable: false
    });
  }

  private stopBroadcastLoop() {
    if (this.broadcastInterval) {
      window.clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
  }

  private getLocalCursorState() {
    if (this.localCursorGetter) {
      return this.localCursorGetter();
    }
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  private decodeBinaryPayload(payload: Uint8Array, participantId: string) {
    if (payload.byteLength < 9) return;
    
    const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
    const type = view.getUint8(0);
    const x = view.getFloat32(1, true);
    const y = view.getFloat32(5, true);

    if (type === TELEMETRY_PAYLOAD_TYPES.CURSOR) {
      this.remoteCursors.set(participantId, { x, y, timestamp: Date.now() });
      this.dispatchCustomEvent('stage-remote-cursor-update', { id: participantId, x, y });
    } else if (type === TELEMETRY_PAYLOAD_TYPES.PING) {
      this.dispatchCustomEvent('stage-tactical-ping', { id: participantId, x, y });
    }
  }

  private dispatchCustomEvent(name: string, detail: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
  }

  public getRemoteCursors(): Map<string, RemoteCursorState> {
    return this.remoteCursors;
  }

  public getRoom(): Room {
    return this.room;
  }

  public disconnect() {
    this.stopBroadcastLoop();
    this.room.disconnect();
    this.remoteCursors.clear();
    this.remoteGhosts.clear();
  }
}
