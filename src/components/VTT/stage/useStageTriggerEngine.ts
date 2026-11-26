/**
 * @file useStageTriggerEngine.ts
 * @description Live runtime evaluator for ADE Stage Manifest triggers across
 *   enter/exit (region & radial waypoint), object interact, round_start, and manual
 *   events, honoring conditionExpr against adeStore.storyFlags and dispatching actions.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { VttEventBus } from '../../../utils/vttEventBus';
import { useADEStore } from '../../../pages/Foundry/store/adeStore';
import { dispatchStageMacroActions } from '../../../services/stageMacroDispatcher';
import { isPointInRegion } from '../../../engine/cartography/SceneRegionManager';

export interface StageTriggerPrompt {
  trigger: any;
  anchor?: any;
  token?: any;
}

export interface UseStageTriggerEngineParams {
  compiledStage: any;
  liveTokens: any[];
  currentMap: any;
  updateMap?: (mapId: string, updates: any) => void;
  setActiveMapId?: (mapId: string) => void;
  applyCronicleDelta?: (delta: any) => void;
  openFloatingAimeWithPrompt?: (prompt: string) => void;
  enabled?: boolean;
}

function isTokenInsideAnchor(pos: { x: number; y: number }, anchor: any): boolean {
  if (!pos || !anchor) return false;
  if (anchor.kind === 'region' || anchor.bounds) {
    const b = anchor.bounds || {};
    const bx = b.x ?? anchor.pos?.x ?? anchor.x ?? 0;
    const by = b.y ?? anchor.pos?.y ?? anchor.y ?? 0;
    const bw = b.width ?? anchor.width ?? 150;
    const bh = b.height ?? anchor.height ?? 150;
    return isPointInRegion(pos, {
      id: anchor.id,
      name: anchor.name || '',
      triggerType: 'story_flag',
      payload: {},
      autoTrigger: true,
      bounds: { x: bx, y: by, width: bw, height: bh },
    });
  }
  const ax = anchor.pos?.x ?? anchor.x ?? 0;
  const ay = anchor.pos?.y ?? anchor.y ?? 0;
  const radius = Number(anchor.radius) > 0 ? Number(anchor.radius) : 85;
  return Math.hypot(pos.x - ax, pos.y - ay) <= radius;
}

export function useStageTriggerEngine({
  compiledStage,
  liveTokens,
  currentMap,
  updateMap,
  setActiveMapId,
  applyCronicleDelta,
  openFloatingAimeWithPrompt,
  enabled = true,
}: UseStageTriggerEngineParams) {
  const lastTokenPosRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const firedOnceRef = useRef<Set<string>>(new Set());
  const [pendingTriggerPrompt, setPendingTriggerPrompt] = useState<StageTriggerPrompt | null>(null);

  const triggers: any[] = Array.isArray(compiledStage?.triggers) ? compiledStage.triggers : [];
  const anchors: any[] = Array.isArray(compiledStage?.anchors) ? compiledStage.anchors : [];

  const executeTriggerActions = useCallback(
    (trigger: any, ctx: { anchor?: any; token?: any } = {}) => {
      if (!trigger) return;
      if (trigger.once && firedOnceRef.current.has(trigger.id)) return;

      const adeState = useADEStore.getState();
      if (
        trigger.conditionExpr &&
        typeof adeState.evaluateStoryCondition === 'function' &&
        !adeState.evaluateStoryCondition(trigger.conditionExpr)
      ) {
        return;
      }

      if (trigger.once) {
        firedOnceRef.current.add(trigger.id);
      }

      const actions: any[] = Array.isArray(trigger.actions) ? trigger.actions : [];
      const macroStyleActions: any[] = [];

      for (const action of actions) {
        if (!action || !action.type) continue;
        const typeUpper = String(action.type).toUpperCase();

        if (typeUpper === 'SET_FLAG') {
          const key = action.key || action.flag || action.name;
          if (key) {
            useADEStore.getState().setStoryFlag?.(String(key), action.value !== undefined ? action.value : true);
          }
        } else if (typeUpper === 'TRIGGER_AIME' || typeUpper === 'AIME_PROMPT') {
          const prompt = action.prompt || action.message || trigger.name || 'Stage trigger activated.';
          if (typeof openFloatingAimeWithPrompt === 'function') {
            openFloatingAimeWithPrompt(prompt);
          } else {
            VttEventBus.emit('toggle-stage-aime', undefined as any);
          }
        } else if (typeUpper === 'DISPATCH_CHAT' || typeUpper === 'CHAT_MESSAGE' || typeUpper === 'NARRATION') {
          VttEventBus.emit('chat-message', {
            sender: action.sender || trigger.name || 'STAGE DIRECTOR',
            text: action.text || action.message || action.prompt || `Triggered: ${trigger.name || trigger.id}`,
            type: 'narration',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (typeUpper === 'PLAY_AUDIO' || typeUpper === 'AUDIO_CUE') {
          VttEventBus.emit('stage-audio-cue' as any, {
            track: action.track || action.audio || action.url,
            volume: action.volume ?? 0.8,
            loop: Boolean(action.loop),
            triggerId: trigger.id,
          });
        } else if (typeUpper === 'SWITCH_MAP') {
          const targetMapId = action.mapId || action.targetMapId;
          if (targetMapId && typeof setActiveMapId === 'function') {
            setActiveMapId(targetMapId);
          }
        } else if (typeUpper === 'TOGGLE_OBJECT' || typeUpper === 'TOGGLE_DOOR') {
          const objId = action.objectId || ctx.anchor?.elementIds?.[0];
          if (objId && currentMap && typeof updateMap === 'function') {
            const nextObjects = (currentMap.objects || []).map((o: any) =>
              o.id === objId || o.storyElementId === objId ? { ...o, isOpen: !o.isOpen } : o
            );
            updateMap(currentMap.id, { objects: nextObjects });
          }
          if (action.wallId || typeUpper === 'TOGGLE_DOOR') {
            VttEventBus.emit('stage-bulkhead-toggled', {
              wallId: action.wallId || objId || trigger.id,
              isOpen: action.isOpen ?? true,
              doorState: (action.isOpen ?? true) ? 'open' : 'closed',
            } as any);
          }
        } else if (typeUpper === 'REVEAL_REGION' || typeUpper === 'REVEAL_WAYPOINT') {
          const targetId = action.anchorId || action.regionId || ctx.anchor?.id;
          if (targetId && currentMap && typeof updateMap === 'function') {
            const nextRegions = (currentMap.regions || []).map((r: any) =>
              r.id === targetId ? { ...r, enabled: true, hidden: false } : r
            );
            const nextWaypoints = (currentMap.waypoints || []).map((w: any) =>
              w.id === targetId ? { ...w, hidden: false, isHidden: false } : w
            );
            updateMap(currentMap.id, { regions: nextRegions, waypoints: nextWaypoints });
          }
        } else if (typeUpper === 'APPLY_CRONICLE' || typeUpper === 'GRANT_REWARD') {
          if (typeof applyCronicleDelta === 'function') {
            applyCronicleDelta({
              source: 'stage-trigger',
              triggerId: trigger.id,
              title: trigger.name || 'Stage Trigger',
              description: action.description || action.text || trigger.name,
              data: action.payload || action,
            });
          }
        } else {
          macroStyleActions.push(action);
        }
      }

      if (macroStyleActions.length > 0) {
        dispatchStageMacroActions(macroStyleActions, {
          role: 'architect',
          onSetStoryFlag: (k: string, v: any) => useADEStore.getState().setStoryFlag?.(k, v),
        });
      }

      VttEventBus.emit('story-foundry-milestone-reached', {
        scenarioId: compiledStage?.stageId || compiledStage?.id,
        scenarioTitle: compiledStage?.title || trigger.name,
        beatIndex: 0,
        beatText: trigger.name || trigger.id,
        isCompleted: true,
        completedBeats: [],
        timestamp: new Date().toLocaleTimeString(),
      });
    },
    [
      applyCronicleDelta,
      compiledStage?.id,
      compiledStage?.stageId,
      compiledStage?.title,
      currentMap,
      openFloatingAimeWithPrompt,
      setActiveMapId,
      updateMap,
    ]
  );

  // Reset firedOnce memory when switching compiled stages
  useEffect(() => {
    firedOnceRef.current.clear();
    lastTokenPosRef.current.clear();
    setPendingTriggerPrompt(null);
  }, [compiledStage?.stageId, compiledStage?.id]);

  // Spatial enter / exit trigger evaluation on live token movement
  useEffect(() => {
    if (!enabled || triggers.length === 0 || !Array.isArray(liveTokens)) return;

    for (const tok of liveTokens) {
      if (!tok || !tok.id || typeof tok.x !== 'number' || typeof tok.y !== 'number') continue;
      const nextPos = { x: tok.x, y: tok.y };
      const prevPos = lastTokenPosRef.current.get(tok.id);
      lastTokenPosRef.current.set(tok.id, nextPos);

      if (!prevPos || (prevPos.x === nextPos.x && prevPos.y === nextPos.y)) continue;

      for (const trig of triggers) {
        if (!trig || (trig.on !== 'enter' && trig.on !== 'exit')) continue;
        if (trig.once && firedOnceRef.current.has(trig.id)) continue;

        const anchor =
          anchors.find((a: any) => a.id === trig.anchorId) ||
          (currentMap?.regions || []).find((r: any) => r.id === trig.anchorId) ||
          (currentMap?.waypoints || []).find((w: any) => w.id === trig.anchorId);
        if (!anchor) continue;

        const wasIn = isTokenInsideAnchor(prevPos, anchor);
        const isIn = isTokenInsideAnchor(nextPos, anchor);

        const matched = (trig.on === 'enter' && !wasIn && isIn) || (trig.on === 'exit' && wasIn && !isIn);
        if (!matched) continue;

        if (trig.requiresConfirm) {
          setPendingTriggerPrompt({ trigger: trig, anchor, token: tok });
        } else {
          executeTriggerActions(trig, { anchor, token: tok });
        }
      }
    }
  }, [enabled, liveTokens, triggers, anchors, currentMap?.regions, currentMap?.waypoints, executeTriggerActions]);

  // Event-based triggers: interact & round_start
  useEffect(() => {
    if (!enabled || triggers.length === 0) return undefined;

    const offInteract = VttEventBus.on('vtt-object-interacted' as any, (payload: any) => {
      const objId = payload?.objectId || payload?.id;
      const storyElId = payload?.storyElementId;
      for (const trig of triggers) {
        if (trig?.on !== 'interact') continue;
        const anchor = anchors.find((a: any) => a.id === trig.anchorId);
        const matchesObj =
          trig.anchorId === objId ||
          (anchor &&
            (anchor.id === objId ||
              (Array.isArray(anchor.elementIds) &&
                (anchor.elementIds.includes(objId) || (storyElId && anchor.elementIds.includes(storyElId))))));
        if (matchesObj) {
          executeTriggerActions(trig, { anchor });
        }
      }
    });

    const offRound = VttEventBus.on('stage-round-advanced' as any, () => {
      for (const trig of triggers) {
        if (trig?.on === 'round_start') {
          executeTriggerActions(trig);
        }
      }
    });

    return () => {
      offInteract();
      offRound();
    };
  }, [enabled, triggers, anchors, executeTriggerActions]);

  const confirmPendingTrigger = useCallback(() => {
    if (!pendingTriggerPrompt) return;
    executeTriggerActions(pendingTriggerPrompt.trigger, {
      anchor: pendingTriggerPrompt.anchor,
      token: pendingTriggerPrompt.token,
    });
    setPendingTriggerPrompt(null);
  }, [pendingTriggerPrompt, executeTriggerActions]);

  const dismissPendingTrigger = useCallback(() => {
    setPendingTriggerPrompt(null);
  }, []);

  return {
    pendingTriggerPrompt,
    confirmPendingTrigger,
    dismissPendingTrigger,
    executeTrigger: executeTriggerActions,
  };
}
