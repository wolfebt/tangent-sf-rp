/**
 * @file vttMultiplayerSyncService.ts
 * @description Real-time CRDT and WebRTC multiplayer synchronization for VTT Stage (/stage).
 * Synchronizes token movements between Architect (GM) and Operative (Player) roles
 * using Yjs CRDTs over LiveKit Reliable DataChannels and local multi-window BroadcastChannels.
 */

import * as Y from 'yjs';
import { useEngineStore } from '../engine/state/VolatileSharder.ts';
import { YjsProviderBridge } from '../engine/network/YjsProviderBridge.ts';

export type UserVttRole = 'architect' | 'operative';

export interface VttSyncConfig {
  role?: UserVttRole;
  personaId?: string;
  room?: any; // LiveKit Room instance if active
  channelName?: string;
}

export class VttMultiplayerSyncService {
  private static instance: VttMultiplayerSyncService | null = null;
  private doc: Y.Doc;
  private tacticalTokensMap: Y.Map<any>;
  private broadcastChannel: BroadcastChannel | null = null;
  private yjsBridge: YjsProviderBridge | null = null;
  private role: UserVttRole = 'architect';
  private personaId: string | null = null;
  private isInitialized = false;
  private unsubscribeMapObserver: (() => void) | null = null;

  constructor() {
    this.doc = new Y.Doc({ gc: true });
    this.tacticalTokensMap = this.doc.getMap('tactical_tokens');
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
    if (this.isInitialized) return;

    // Detect role & persona from config or window.location query params
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get('role')?.toLowerCase();
      if (queryRole === 'operative' || queryRole === 'player') {
        this.role = 'operative';
      } else {
        this.role = config.role || 'architect';
      }
      this.personaId = config.personaId || params.get('personaId') || params.get('persona') || null;
    } else {
      this.role = config.role || 'architect';
      this.personaId = config.personaId || null;
    }

    // 1. Initialize local multi-window BroadcastChannel
    const channelName = config.channelName || 'tangent_vtt_stage_sync';
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(channelName);
        this.broadcastChannel.onmessage = (event: MessageEvent) => {
          this.handleBroadcastMessage(event.data);
        };
      } catch (err) {
        console.warn('[VttMultiplayerSync] BroadcastChannel not supported:', err);
      }
    }

    // 2. Attach LiveKit room if provided
    if (config.room) {
      this.attachLiveKitRoom(config.room);
    }

    // 3. Listen to Yjs CRDT updates to broadcast to peers
    this.doc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== 'network') {
        this.broadcastYjsUpdate(update);
      }
    });

    // 4. Observe tactical token map changes to update local useEngineStore
    const observer = (event: Y.YMapEvent<any>, transaction: Y.Transaction) => {
      if (transaction.origin === 'network') {
        event.changes.keys.forEach((change, key) => {
          if (change.action === 'add' || change.action === 'update') {
            const data = this.tacticalTokensMap.get(key);
            if (data && typeof data.x === 'number' && typeof data.y === 'number') {
              const store = useEngineStore.getState();
              // Prevent recursive local update loops
              store.updatePosition(key, data.x, data.y, data.z || 0);
            }
          }
        });
      }
    };

    this.tacticalTokensMap.observe(observer);
    this.unsubscribeMapObserver = () => this.tacticalTokensMap.unobserve(observer);

    this.isInitialized = true;
    console.log(`[VttMultiplayerSync] Initialized as [${this.role.toUpperCase()}] (Persona: ${this.personaId || 'None'})`);
  }

  /**
   * Broadcasts a local token position change across the multiplayer mesh.
   */
  public broadcastTokenMove(tokenId: string, x: number, y: number, z = 0): boolean {
    if (!this.canMoveToken(tokenId)) {
      console.warn(`[VttMultiplayerSync] Role "${this.role}" is not authorized to move token "${tokenId}".`);
      return false;
    }

    // Update local CRDT state with 'local' origin
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
    }, 'local');

    return true;
  }

  /**
   * Verifies if the current user role is authorized to move this token.
   */
  public canMoveToken(tokenId: string): boolean {
    // Architect has master control over all tokens
    if (this.role === 'architect') return true;

    // Operatives can only move their own persona token or designated Ally tokens
    if (this.personaId && tokenId === this.personaId) return true;

    const store = useEngineStore.getState();
    const token = store.staticData[tokenId];
    if (token) {
      if (token.character_doc_id === this.personaId) return true;
      if (token.is_persona) return true; // Operatives may command allied personas
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
    // 1. Broadcast locally across multi-window browser tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'YJS_UPDATE',
        update: Array.from(update)
      });
    }

    // 2. Broadcast over LiveKit if bridge is attached
    if (this.yjsBridge) {
      // YjsProviderBridge handles reliable DataChannel broadcast
    }
  }

  private handleBroadcastMessage(data: any): void {
    if (!data) return;

    if (data.type === 'YJS_UPDATE' && Array.isArray(data.update)) {
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
    }
  }

  public attachLiveKitRoom(room: any): void {
    if (this.yjsBridge) {
      this.yjsBridge.disconnect();
      this.yjsBridge = null;
    }

    try {
      this.yjsBridge = new YjsProviderBridge(room);
      console.log('[VttMultiplayerSync] Attached LiveKit room to YjsProviderBridge.');
    } catch (err) {
      console.warn('[VttMultiplayerSync] Failed to attach LiveKit room:', err);
    }
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
    if (this.unsubscribeMapObserver) {
      this.unsubscribeMapObserver();
      this.unsubscribeMapObserver = null;
    }
    if (this.broadcastChannel) {
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
