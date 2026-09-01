/**
 * @file LiveKitClient.ts
 * @description Stage 1.4: High-frequency WebRTC telemetry for zero-latency awareness.
 * Broadcasts unreliable binary payloads (cursors, ghosting) at 60Hz via LiveKit SFU DataChannels.
 */

import { Room, RoomEvent, DataPacket_Kind, RemoteParticipant } from 'livekit-client';
import { useEngineStore } from '../state/VolatileSharder';

// --- BINARY SERIALIZATION (Mocking Flatbuffers with DataView for standalone runnability) ---
// Payload Structure: [PayloadType(1 byte)] + [ParticipantId(4 bytes)] + [X(4 bytes float)] + [Y(4 bytes float)]
const PAYLOAD_TYPES = {
  CURSOR: 1,
  TOKEN_DRAG: 2,
  PING: 3
};

export class TelemetryClient {
  private room: Room;
  private broadcastInterval: number | null = null;
  private isConnected: boolean = false;
  
  // Track remote cursors for interpolation
  private remoteCursors: Map<string, { x: number, y: number, timestamp: number }> = new Map();

  constructor() {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    
    this.setupListeners();
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

  public async connect(url: string, token: string) {
    try {
      console.log('[Telemetry] Connecting to LiveKit SFU...');
      await this.room.connect(url, token);
      this.isConnected = true;
      console.log('[Telemetry] Connected successfully. Enabling 60Hz broadcast.');
      
      this.startBroadcastLoop();
    } catch (error) {
      console.error('[Telemetry] Failed to connect:', error);
    }
  }

  /**
   * Broadcasts the local user's volatile state 60 times per second using unreliable UDP
   */
  private startBroadcastLoop() {
    if (this.broadcastInterval) return;

    // ~16.6ms interval for 60fps telemetry target
    this.broadcastInterval = window.setInterval(() => {
      if (!this.isConnected) return;

      const cursorState = this.getLocalCursorState();
      
      // Serialize to binary (9 bytes total)
      const buffer = new ArrayBuffer(9);
      const view = new DataView(buffer);
      
      view.setUint8(0, PAYLOAD_TYPES.CURSOR);
      view.setFloat32(1, cursorState.x, true); // Little endian
      view.setFloat32(5, cursorState.y, true);

      // Publish via unreliable channel to prevent head-of-line blocking if packets drop
      this.room.localParticipant.publishData(new Uint8Array(buffer), DataPacket_Kind.LOSSY);
      
    }, 1000 / 60); 
  }

  private stopBroadcastLoop() {
    if (this.broadcastInterval) {
      window.clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
  }

  private getLocalCursorState() {
    // In production, this would read from a global Input Manager or the PixiJS interaction state
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  private decodeBinaryPayload(payload: Uint8Array, participantId: string) {
    const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
    const type = view.getUint8(0);

    if (type === PAYLOAD_TYPES.CURSOR) {
      const x = view.getFloat32(1, true);
      const y = view.getFloat32(5, true);
      
      // Store for linear extrapolation/interpolation in the rendering loop
      this.remoteCursors.set(participantId, { x, y, timestamp: Date.now() });
      
      // Dispatch to UI/Renderer (Transiently, bypassing React)
      this.dispatchCursorUpdate(participantId, x, y);
    }
  }

  /**
   * Pushes remote cursor data to the PixiJS renderer. 
   * (Placeholder for actual renderer integration).
   */
  private dispatchCursorUpdate(id: string, x: number, y: number) {
    // Antigravity directive: Update cursor positions directly on the canvas elements
    // or through transient Zustand subscriptions to avoid DOM re-renders.
    const customEvent = new CustomEvent('remote-cursor-update', {
      detail: { id, x, y }
    });
    window.dispatchEvent(customEvent);
  }

  public disconnect() {
    this.stopBroadcastLoop();
    this.room.disconnect();
  }
}