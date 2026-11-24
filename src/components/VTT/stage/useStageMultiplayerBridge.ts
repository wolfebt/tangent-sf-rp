/**
 * @file useStageMultiplayerBridge.ts
 * @description Live bridge connecting VoiceChatContext LiveKit Room, FirestoreDebouncer checkpoints,
 *   and VttMultiplayerSyncService Yjs CRDT channels into the active StageView runtime.
 */

import { useEffect, useRef, useState } from 'react';
import { useVoiceChat } from '../../../context/VoiceChatContext';
import { useAuth } from '../../../context/AuthContext';
import {
  getVttMultiplayerSync,
  type VttSyncStatus
} from '../../../services/vttMultiplayerSyncService';
import { VttEventBus } from '../../../utils/vttEventBus';
import { expandWallsForGeometry } from '../../../schemas/vttWallSchema.js';
import { useEngineStore } from '../../../engine/state/VolatileSharder.ts';
import type { BVHBuilder, WallSegment } from '../../../engine/vision/BVHBuilder.ts';
import type { SceneInteractiveObject } from '../../../engine/assets/FoundryIngestion.ts';
import type { InteractiveObjectManager } from '../../../engine/assets/InteractiveObjectManager.ts';

export interface UseStageMultiplayerBridgeOptions {
  campaignId?: string;
  currentMap?: any;
  userRole?: string;
  collectionRoot?: 'Campaigns' | 'user_stories';
  skipCanvasEvents?: boolean;
  skipSessionInit?: boolean;
  bvhBuilderRef?: React.MutableRefObject<BVHBuilder>;
  interactiveObjMgrRef?: React.MutableRefObject<InteractiveObjectManager>;
  setLocalWalls?: React.Dispatch<React.SetStateAction<WallSegment[]>>;
  setLocalObjects?: React.Dispatch<React.SetStateAction<SceneInteractiveObject[]>>;
  setActivePings?: React.Dispatch<React.SetStateAction<any[]>>;
  onRemoteTurnUpdate?: (turnState: { roundNumber: number; currentTurnIndex: number; initiativeScores?: Record<string, number> }) => void;
  onRemoteFogUpdate?: (payload: { mapId: string; exploredAreas?: any[]; hiddenAreas?: any[]; fogEnabled?: boolean }) => void;
  onRemoteHandout?: (handout: { id: string; title: string; imageUrl?: string; text?: string; sender?: string; timestamp: number }) => void;
  onRemoteAudioCue?: (cue: { bus: 'music' | 'ambient' | 'sfx'; action: string; trackId?: string; trackUrl?: string; title?: string; volume?: number }) => void;
}

export function useStageMultiplayerBridge({
  campaignId,
  currentMap,
  userRole,
  collectionRoot = 'Campaigns',
  skipCanvasEvents = false,
  skipSessionInit = false,
  bvhBuilderRef,
  interactiveObjMgrRef,
  setLocalWalls,
  setLocalObjects,
  setActivePings,
  onRemoteTurnUpdate,
  onRemoteFogUpdate,
  onRemoteHandout,
  onRemoteAudioCue
}: UseStageMultiplayerBridgeOptions): { syncStatus: VttSyncStatus } {
  const { activeRoom = null } = (useVoiceChat() as any) || {};
  const { currentUser } = (useAuth() as any) || {};
  const [syncStatus, setSyncStatus] = useState<VttSyncStatus>(() => getVttMultiplayerSync().getSyncStatus());

  const callbacksRef = useRef({
    onRemoteTurnUpdate,
    onRemoteFogUpdate,
    onRemoteHandout,
    onRemoteAudioCue
  });
  callbacksRef.current = {
    onRemoteTurnUpdate,
    onRemoteFogUpdate,
    onRemoteHandout,
    onRemoteAudioCue
  };

  // 1. Initialize sync + attach LiveKit Room + hydrate initial Y.Doc / Firestore session slices
  useEffect(() => {
    const sync = getVttMultiplayerSync();
    if (skipSessionInit) {
      setSyncStatus(sync.getSyncStatus());
      return;
    }
    const persistenceConfig =
      campaignId && currentUser?.uid && currentMap?.id
        ? {
            campaignId,
            sessionId: `stage_${currentMap.id}`,
            intervalMs: 5000,
            ownerId: currentUser.uid,
            collectionRoot
          }
        : undefined;

    const normalizedRole =
      userRole === 'operative' || userRole === 'player' || userRole === 'spectator'
        ? 'operative'
        : userRole === 'architect' || userRole === 'gm'
          ? 'architect'
          : undefined;

    sync.init({
      ...(normalizedRole ? { role: normalizedRole } : {}),
      ...(currentUser?.uid ? { actorId: currentUser.uid } : {}),
      ...(activeRoom ? { room: activeRoom } : {}),
      ...(persistenceConfig ? { persistence: persistenceConfig } : {})
    });

    if (activeRoom) {
      sync.attachLiveKitRoom(activeRoom);
    } else {
      sync.detachLiveKitRoom();
    }

    if (persistenceConfig) {
      sync.attachPersistence(persistenceConfig);
      void sync.hydrateFromPersistence();
    }

    // Hydrate current Y.Doc snapshot into engine/stage state on mount or mode switch
    const doc = sync.getDocument();
    const tokensMap = doc.getMap('tactical_tokens');
    const store = useEngineStore.getState();
    tokensMap.forEach((pos: any, tokId: string) => {
      if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
        store.updatePosition(tokId, pos.x, pos.y, pos.z || 0);
      }
    });
    const vitalsMap = doc.getMap('token_vitals');
    vitalsMap.forEach((v: any, tokId: string) => {
      if (!v) return;
      if (typeof v.current_structure === 'number') store.setStructure(tokId, v.current_structure);
      if (typeof v.current_health === 'number') store.setHealth(tokId, v.current_health);
      if (typeof v.current_vitality === 'number') store.setVitality(tokId, v.current_vitality);
      if (typeof v.is_hidden === 'boolean') store.setHidden(tokId, v.is_hidden);
    });
    const turnState = doc.getMap('turn_state').get('current') as any;
    if (turnState) callbacksRef.current.onRemoteTurnUpdate?.(turnState);

    setSyncStatus(sync.getSyncStatus());

    return () => {
      if (!activeRoom && !skipSessionInit) {
        sync.detachLiveKitRoom();
      }
    };
  }, [skipSessionInit, activeRoom, campaignId, currentUser?.uid, currentMap?.id, userRole, collectionRoot]);

  // 2. Subscribe to incoming remote CRDT events from VttEventBus (when attached to Stage canvas)
  useEffect(() => {
    if (skipCanvasEvents) return;

    const unsubDoor = VttEventBus.on('stage-remote-door-toggled', (payload) => {
      if (!payload?.wallId || !setLocalWalls) return;
      setLocalWalls((prev) => {
        const next = prev.map((w) =>
          w.id === payload.wallId
            ? ({
                ...w,
                isOpen: Boolean(payload.isOpen),
                ...(payload.doorState !== undefined ? { doorState: payload.doorState } : {}),
                ...(payload.breachHp !== undefined ? { breachHp: payload.breachHp } : {})
              } as WallSegment)
            : w
        );
        bvhBuilderRef?.current?.build(expandWallsForGeometry(next, 8) as any);
        return next;
      });

      if (interactiveObjMgrRef?.current && setLocalObjects) {
        const objs = interactiveObjMgrRef.current.getAllObjects();
        const matchingObj = objs.find((o) => o.bvhWallId === payload.wallId);
        if (matchingObj) {
          matchingObj.isOpen = Boolean(payload.isOpen);
          setLocalObjects([...objs]);
        }
      }
    });

    const unsubPing = VttEventBus.on('stage-remote-ping', (ping) => {
      if (!ping || !setActivePings) return;
      setActivePings((prev) => {
        if (ping.id && prev.some((p) => p.id === ping.id)) return prev;
        return [...prev.slice(-19), ping];
      });
    });

    const unsubTurn = VttEventBus.on('stage-remote-turn-update', (turnState) => {
      if (turnState) callbacksRef.current.onRemoteTurnUpdate?.(turnState);
    });

    const unsubFog = VttEventBus.on('stage-remote-fog-explored', (fogPayload) => {
      if (fogPayload) callbacksRef.current.onRemoteFogUpdate?.(fogPayload);
    });

    const unsubHandout = VttEventBus.on('stage-remote-handout', (handout) => {
      if (handout) callbacksRef.current.onRemoteHandout?.(handout);
    });

    const unsubAudio = VttEventBus.on('stage-remote-audio-cue', (cue) => {
      if (cue) callbacksRef.current.onRemoteAudioCue?.(cue);
    });

    return () => {
      unsubDoor();
      unsubPing();
      unsubTurn();
      unsubFog();
      unsubHandout();
      unsubAudio();
    };
  }, [skipCanvasEvents, bvhBuilderRef, interactiveObjMgrRef, setLocalWalls, setLocalObjects, setActivePings]);

  return { syncStatus };
}
