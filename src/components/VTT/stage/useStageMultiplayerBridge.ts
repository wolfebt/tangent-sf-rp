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
import type { BVHBuilder, WallSegment, SceneInteractiveObject, InteractiveObjectManager } from '../../../engine/index';

export interface UseStageMultiplayerBridgeOptions {
  campaignId?: string;
  currentMap?: any;
  bvhBuilderRef: React.MutableRefObject<BVHBuilder>;
  interactiveObjMgrRef: React.MutableRefObject<InteractiveObjectManager>;
  setLocalWalls: React.Dispatch<React.SetStateAction<WallSegment[]>>;
  setLocalObjects: React.Dispatch<React.SetStateAction<SceneInteractiveObject[]>>;
  setActivePings: React.Dispatch<React.SetStateAction<any[]>>;
  onRemoteTurnUpdate?: (turnState: { roundNumber: number; currentTurnIndex: number; initiativeScores?: Record<string, number> }) => void;
  onRemoteFogUpdate?: (payload: { mapId: string; exploredAreas?: any[]; fogEnabled?: boolean }) => void;
  onRemoteHandout?: (handout: { id: string; title: string; imageUrl?: string; text?: string; sender?: string; timestamp: number }) => void;
  onRemoteAudioCue?: (cue: { bus: 'music' | 'ambient' | 'sfx'; action: string; trackId?: string; trackUrl?: string; title?: string; volume?: number }) => void;
}

export function useStageMultiplayerBridge({
  campaignId,
  currentMap,
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
  const { activeRoom = null, participants = [] } = (useVoiceChat() as any) || {};
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

  // 1. Initialize sync + attach LiveKit Room & optional Firestore persistence
  useEffect(() => {
    const sync = getVttMultiplayerSync();
    const persistenceConfig =
      campaignId && currentUser?.uid && currentMap?.id
        ? {
            campaignId,
            sessionId: `stage_${currentMap.id}`,
            intervalMs: 5000,
            ownerId: currentUser.uid
          }
        : undefined;

    sync.init({
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
    }

    setSyncStatus(sync.getSyncStatus());

    return () => {
      if (!activeRoom) {
        sync.detachLiveKitRoom();
      }
    };
  }, [activeRoom, campaignId, currentUser?.uid, currentMap?.id, participants?.length]);

  // 2. Subscribe to incoming remote CRDT events from VttEventBus
  useEffect(() => {
    const unsubDoor = VttEventBus.on('stage-remote-door-toggled', (payload) => {
      if (!payload?.wallId) return;
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
        bvhBuilderRef.current.build(next);
        return next;
      });

      const objs = interactiveObjMgrRef.current.getAllObjects();
      const matchingObj = objs.find((o) => o.bvhWallId === payload.wallId);
      if (matchingObj) {
        matchingObj.isOpen = Boolean(payload.isOpen);
        setLocalObjects([...objs]);
      }
    });

    const unsubPing = VttEventBus.on('stage-remote-ping', (ping) => {
      if (!ping) return;
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
  }, [bvhBuilderRef, interactiveObjMgrRef, setLocalWalls, setLocalObjects, setActivePings]);

  return { syncStatus };
}
