/**
 * @file useStageTriggerEngine.ts
 * @description Live runtime evaluator for ADE Stage Manifest triggers across
 *   enter/leave/exit (region & radial waypoint), object interact, round_start,
 *   reactive flag, beat, timer, and manual events, honoring `when`/`conditionExpr`
 *   against adeStore.storyFlags and dispatching all canonical StageTriggerAction types.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { VttEventBus } from '../../../utils/vttEventBus';
import { useADEStore } from '../../../pages/Foundry/store/adeStore';
import { useStageStore } from '../../../pages/Foundry/Stage/stageStore';
import { useEngineStore } from '../../../engine/state/VolatileSharder';
import { dispatchStageMacroActions } from '../../../services/stageMacroDispatcher';
import { isPointInRegion } from '../../../engine/cartography/SceneRegionManager';
import { proAudioMixerService } from '../../../services/proAudioMixerService';
import { QuickJSSandbox } from '../../../engine/scripting/QuickJSSandbox';
import { normalizeElementType } from '../../../pages/Foundry/ElementForge/elementSchemas';
import { adeElementToInteractiveObject, adeElementToStageToken } from '../../../utils/storyAssetAdapter';

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
  elementsCatalog?: any[];
  universeState?: any;
  activeScenario?: any;
  updateScenario?: (id: string, updates: any) => void;
  setActiveScenarioId?: (id: string) => void;
  enabled?: boolean;
}

function isTokenInsideAnchor(pos: { x: number; y: number }, anchor: any): boolean {
  if (!pos || !anchor) return false;
  if (anchor.kind === 'region' || anchor.bounds) {
    const b = anchor.bounds || {};
    const bx = b.x ?? anchor.pos?.x ?? anchor.x ?? 0;
    const by = b.y ?? anchor.pos?.y ?? anchor.y ?? 0;
    const bw = b.width ?? anchor.pos?.w ?? anchor.width ?? 150;
    const bh = b.height ?? anchor.pos?.h ?? anchor.height ?? 150;
    return isPointInRegion(pos, {
      id: anchor.id,
      name: anchor.name || '',
      triggerType: 'story_flag',
      payload: {},
      autoTrigger: true,
      bounds: { x: bx, y: by, width: bw, height: bh },
    });
  }
  if ((anchor.pos?.w || anchor.pos?.h) && !anchor.radius && anchor.kind === 'object') {
    const bx = anchor.pos?.x ?? anchor.x ?? 0;
    const by = anchor.pos?.y ?? anchor.y ?? 0;
    const bw = anchor.pos?.w ?? 120;
    const bh = anchor.pos?.h ?? 120;
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

function getFlagSnapshot(storyFlags: Record<string, any> | undefined): Record<string, any> {
  const out: Record<string, any> = {};
  if (!storyFlags || typeof storyFlags !== 'object') return out;
  for (const [k, rec] of Object.entries(storyFlags)) {
    out[k] = rec && typeof rec === 'object' && 'value' in rec ? (rec as any).value : rec;
  }
  return out;
}

export function useStageTriggerEngine({
  compiledStage,
  liveTokens,
  currentMap,
  updateMap,
  setActiveMapId,
  applyCronicleDelta,
  openFloatingAimeWithPrompt,
  elementsCatalog = [],
  universeState,
  activeScenario,
  updateScenario,
  setActiveScenarioId,
  enabled = true,
}: UseStageTriggerEngineParams) {
  const lastTokenPosRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const firedOnceRef = useRef<Set<string>>(new Set());
  const prevFlagsRef = useRef<Record<string, any>>(getFlagSnapshot(useADEStore.getState().storyFlags));
  const [pendingTriggerPrompt, setPendingTriggerPrompt] = useState<StageTriggerPrompt | null>(null);

  const triggers: any[] = Array.isArray(compiledStage?.triggers) ? compiledStage.triggers : [];
  const anchors: any[] = Array.isArray(compiledStage?.anchors) ? compiledStage.anchors : [];

  const canTriggerFire = useCallback((trigger: any): boolean => {
    if (!trigger) return false;
    if (trigger.once && firedOnceRef.current.has(trigger.id)) return false;
    const adeState = useADEStore.getState();
    const condExpr = trigger.when || trigger.conditionExpr;
    if (
      condExpr &&
      typeof adeState.evaluateStoryCondition === 'function' &&
      !adeState.evaluateStoryCondition(condExpr)
    ) {
      return false;
    }
    return true;
  }, []);

  const executeTriggerActions = useCallback(
    (trigger: any, ctx: { anchor?: any; token?: any } = {}) => {
      if (!canTriggerFire(trigger)) return;

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
        } else if (typeUpper === 'REVEAL_BEAT') {
          const scenarioId = action.scenarioId || activeScenario?.id || compiledStage?.scenario?.id || compiledStage?.manifest?.scenarioId;
          const beatIndex = typeof action.beatIndex === 'number' ? action.beatIndex : 0;
          const beatText = action.text || action.beatText || action.prompt || trigger.name || 'Revealed scene beat.';
          if (scenarioId && typeof updateScenario === 'function' && activeScenario) {
            const existingCompleted = Array.isArray(activeScenario.completedBeats)
              ? activeScenario.completedBeats
              : (Array.isArray(activeScenario.fields?.completedBeats) ? activeScenario.fields.completedBeats : []);
            if (!existingCompleted.includes(beatIndex)) {
              const nextCompleted = [...existingCompleted, beatIndex];
              updateScenario(scenarioId, {
                completedBeats: nextCompleted,
                fields: { ...(activeScenario.fields || {}), completedBeats: nextCompleted }
              });
            }
          }
          VttEventBus.emit('story-foundry-milestone-reached', {
            scenarioId,
            scenarioTitle: activeScenario?.title || compiledStage?.scenario?.title || trigger.name,
            beatIndex,
            beatText,
            isCompleted: true,
            source: 'stage-trigger',
            triggerId: trigger.id,
            timestamp: new Date().toLocaleTimeString(),
          } as any);
          VttEventBus.emit('stage-chat-card' as any, {
            id: `trigger_beat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toISOString(),
            sender: trigger.name || 'Stage Director',
            visibility: 'public',
            kind: 'system',
            title: `Scene Beat #${beatIndex + 1}`,
            body: beatText
          });
        } else if (typeUpper === 'ADVANCE_SCENARIO') {
          const targetId = action.targetScenarioId || action.scenarioId;
          if (targetId) {
            setActiveScenarioId?.(targetId);
            VttEventBus.emit('stage-scenario-advanced' as any, {
              scenarioId: targetId,
              triggerId: trigger.id
            });
          }
        } else if (typeUpper === 'APPLY_MODIFIER') {
          const modifierId = action.modifierId;
          if (modifierId) {
            const activeStageState = useStageStore.getState();
            const currentManifest = activeStageState.stageManifest;
            if (currentManifest && (!compiledStage?.stageId || currentManifest.id === compiledStage.stageId)) {
              const existingMods = Array.isArray(currentManifest.environment?.modifierIds)
                ? currentManifest.environment.modifierIds
                : [];
              const shouldEnable = action.active ?? true;
              const nextMods = shouldEnable
                ? (existingMods.includes(modifierId) ? existingMods : [...existingMods, modifierId])
                : existingMods.filter((id: string) => id !== modifierId);
              activeStageState.updateEnvironment?.({ modifierIds: nextMods });
            }
            VttEventBus.emit('stage-modifier-applied' as any, {
              modifierId,
              active: action.active ?? true,
              triggerId: trigger.id
            });
          }
        } else if (typeUpper === 'SPAWN_ELEMENT') {
          const elemId = action.elementId;
          if (elemId) {
            const elem = (elementsCatalog || []).find((e: any) => e.id === elemId) || {
              id: elemId,
              title: elemId,
              type: 'Property'
            };
            const spawnPos = action.pos || (typeof action.x === 'number' && typeof action.y === 'number'
              ? { x: action.x, y: action.y }
              : {
                  x: ctx.anchor?.pos?.x ?? ctx.anchor?.x ?? 350,
                  y: ctx.anchor?.pos?.y ?? ctx.anchor?.y ?? 350
                });

            if (normalizeElementType(elem.type) === 'Persona') {
              const token = adeElementToStageToken(elem, spawnPos);
              if (token) {
                const eng = useEngineStore.getState();
                eng.loadStaticEntity?.(token as any);
                eng.updatePosition?.(token.id, spawnPos.x, spawnPos.y);
                if (currentMap && typeof updateMap === 'function') {
                  updateMap(currentMap.id, {
                    tokens: [...(currentMap.tokens || []), { ...token, x: spawnPos.x, y: spawnPos.y }]
                  });
                }
              }
            } else {
              const obj = adeElementToInteractiveObject(elem, spawnPos);
              if (obj && currentMap && typeof updateMap === 'function') {
                updateMap(currentMap.id, {
                  objects: [...(currentMap.objects || []), obj]
                });
              }
            }
          }
        } else if (typeUpper === 'DESPAWN_ELEMENT') {
          const targetId = action.elementId || action.targetId;
          if (targetId) {
            const matchesTarget = (item: any) =>
              item && (item.id === targetId || item.elementId === targetId || item.storyElementId === targetId);
            const eng = useEngineStore.getState();
            for (const tok of liveTokens || []) {
              if (matchesTarget(tok)) {
                eng.removeEntity?.(tok.id);
              }
            }
            eng.removeEntity?.(targetId);
            if (currentMap && typeof updateMap === 'function') {
              const nextTokens = (currentMap.tokens || []).filter((t: any) => !matchesTarget(t));
              const nextObjects = (currentMap.objects || []).filter((o: any) => !matchesTarget(o));
              updateMap(currentMap.id, { tokens: nextTokens, objects: nextObjects });
            }
          }
        } else if (typeUpper === 'RUN_MACRO') {
          const macroRef = action.macroId || action.scriptId;
          if (macroRef) {
            const stageMacros = Array.isArray(compiledStage?.macros) ? compiledStage.macros : [];
            const universeScripts = Array.isArray(universeState?.scripts) ? universeState.scripts : [];
            const matchedMacro = stageMacros.find(
              (m: any) => m.id === macroRef || m.scriptId === macroRef || m.name === macroRef || m.title === macroRef
            );
            const scriptLookupId = matchedMacro?.scriptId || macroRef;
            const matchedScript = universeScripts.find(
              (s: any) => s.id === scriptLookupId || s.name === scriptLookupId || s.title === scriptLookupId
            );
            const code = matchedMacro?.code || matchedScript?.code || matchedScript?.sourceCode || '';
            const staticActions = Array.isArray(matchedMacro?.actions) ? matchedMacro.actions : [];

            if (code && String(code).trim()) {
              const sandbox = new QuickJSSandbox();
              const adeState = useADEStore.getState();
              const workingFlags = getFlagSnapshot(adeState.storyFlags);
              void sandbox
                .executeWithActions(code, { storyFlags: workingFlags, triggerId: trigger.id, timestamp: Date.now() })
                .then(({ actions: queued }) => {
                  for (const [fk, fv] of Object.entries(workingFlags)) {
                    const prevSnapshot = getFlagSnapshot(useADEStore.getState().storyFlags);
                    if (prevSnapshot[fk] !== fv) {
                      useADEStore.getState().setStoryFlag?.(fk, fv);
                    }
                  }
                  if (Array.isArray(queued) && queued.length > 0) {
                    dispatchStageMacroActions(queued, {
                      role: 'architect',
                      onSetStoryFlag: (k: string, v: any) => useADEStore.getState().setStoryFlag?.(k, v)
                    });
                  }
                })
                .catch((err) => {
                  console.warn('[StageTriggerEngine] RUN_MACRO failed:', err);
                });
            } else if (staticActions.length > 0) {
              dispatchStageMacroActions(staticActions, {
                role: 'architect',
                onSetStoryFlag: (k: string, v: any) => useADEStore.getState().setStoryFlag?.(k, v)
              });
            }
          }
        } else if (typeUpper === 'DISPATCH_CHAT' || typeUpper === 'CHAT_MESSAGE' || typeUpper === 'NARRATION') {
          VttEventBus.emit('chat-message', {
            sender: action.sender || trigger.name || 'STAGE DIRECTOR',
            text: action.text || action.message || action.prompt || `Triggered: ${trigger.name || trigger.id}`,
            type: 'narration',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (typeUpper === 'PLAY_AUDIO' || typeUpper === 'AUDIO_CUE') {
          const track = action.track || action.cueId || action.audio || action.url;
          VttEventBus.emit('stage-audio-cue' as any, {
            track,
            volume: action.volume ?? 0.8,
            loop: Boolean(action.loop),
            triggerId: trigger.id,
          });
          if (track) {
            try {
              void proAudioMixerService.playCue(action.bus || 'sfx', String(track), true);
            } catch (err) {
              console.warn('[StageTriggerEngine] proAudioMixerService.playCue failed:', err);
            }
          }
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
    },
    [
      activeScenario,
      applyCronicleDelta,
      canTriggerFire,
      compiledStage?.macros,
      compiledStage?.manifest?.scenarioId,
      compiledStage?.scenario?.id,
      compiledStage?.scenario?.title,
      compiledStage?.stageId,
      currentMap,
      elementsCatalog,
      liveTokens,
      openFloatingAimeWithPrompt,
      setActiveMapId,
      setActiveScenarioId,
      universeState?.scripts,
      updateMap,
      updateScenario,
    ]
  );

  const dispatchOrPromptTrigger = useCallback(
    (trig: any, ctx: { anchor?: any; token?: any } = {}) => {
      if (!canTriggerFire(trig)) return;
      const needsConfirm = Boolean(trig.gmConfirm ?? trig.requiresConfirm);
      if (needsConfirm) {
        setPendingTriggerPrompt({ trigger: trig, anchor: ctx.anchor, token: ctx.token });
      } else {
        executeTriggerActions(trig, ctx);
      }
    },
    [canTriggerFire, executeTriggerActions]
  );

  // Reset firedOnce memory when switching compiled stages
  useEffect(() => {
    firedOnceRef.current.clear();
    lastTokenPosRef.current.clear();
    prevFlagsRef.current = getFlagSnapshot(useADEStore.getState().storyFlags);
    setPendingTriggerPrompt(null);
  }, [compiledStage?.stageId, compiledStage?.id]);

  // Spatial enter / leave / exit trigger evaluation on live token movement
  useEffect(() => {
    if (!enabled || triggers.length === 0 || !Array.isArray(liveTokens)) return;

    for (const tok of liveTokens) {
      if (!tok || !tok.id || typeof tok.x !== 'number' || typeof tok.y !== 'number') continue;
      const nextPos = { x: tok.x, y: tok.y };
      const prevPos = lastTokenPosRef.current.get(tok.id);
      lastTokenPosRef.current.set(tok.id, nextPos);

      if (!prevPos || (prevPos.x === nextPos.x && prevPos.y === nextPos.y)) continue;

      for (const trig of triggers) {
        const isExitEvent = trig?.on === 'exit' || trig?.on === 'leave';
        if (!trig || (trig.on !== 'enter' && !isExitEvent)) continue;
        if (trig.once && firedOnceRef.current.has(trig.id)) continue;

        const anchor =
          anchors.find((a: any) => a.id === trig.anchorId) ||
          (currentMap?.regions || []).find((r: any) => r.id === trig.anchorId) ||
          (currentMap?.waypoints || []).find((w: any) => w.id === trig.anchorId);
        if (!anchor) continue;

        const wasIn = isTokenInsideAnchor(prevPos, anchor);
        const isIn = isTokenInsideAnchor(nextPos, anchor);

        const matched = (trig.on === 'enter' && !wasIn && isIn) || (isExitEvent && wasIn && !isIn);
        if (!matched) continue;

        dispatchOrPromptTrigger(trig, { anchor, token: tok });
      }
    }
  }, [enabled, liveTokens, triggers, anchors, currentMap?.regions, currentMap?.waypoints, dispatchOrPromptTrigger]);

  // Event-based triggers: interact, round_start, and beat
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
          dispatchOrPromptTrigger(trig, { anchor });
        }
      }
    });

    const offRound = VttEventBus.on('stage-round-advanced' as any, () => {
      for (const trig of triggers) {
        if (trig?.on === 'round_start') {
          dispatchOrPromptTrigger(trig);
        }
      }
    });

    const offBeat = VttEventBus.on('story-foundry-milestone-reached', (payload: any) => {
      if (payload?.source === 'stage-trigger') return;
      for (const trig of triggers) {
        if (trig?.on !== 'beat') continue;
        if (
          typeof trig.beatIndex === 'number' &&
          typeof payload?.beatIndex === 'number' &&
          trig.beatIndex !== payload.beatIndex
        ) {
          continue;
        }
        const anchor = anchors.find((a: any) => a.id === trig.anchorId);
        dispatchOrPromptTrigger(trig, { anchor });
      }
    });

    return () => {
      offInteract();
      offRound();
      offBeat();
    };
  }, [enabled, triggers, anchors, dispatchOrPromptTrigger]);

  // Reactive storyFlag listener for `on: 'flag'` triggers
  useEffect(() => {
    if (!enabled || triggers.length === 0) return undefined;
    const flagTriggers = triggers.filter((t) => t?.on === 'flag');
    if (flagTriggers.length === 0) return undefined;

    prevFlagsRef.current = getFlagSnapshot(useADEStore.getState().storyFlags);

    const unsubscribe = useADEStore.subscribe((state) => {
      const nextSnap = getFlagSnapshot(state.storyFlags);
      const prevSnap = prevFlagsRef.current;
      const changedKeys = new Set<string>();

      for (const key of Object.keys(nextSnap)) {
        if (prevSnap[key] !== nextSnap[key]) changedKeys.add(key);
      }
      for (const key of Object.keys(prevSnap)) {
        if (!(key in nextSnap)) changedKeys.add(key);
      }
      prevFlagsRef.current = nextSnap;

      if (changedKeys.size === 0) return;

      for (const trig of flagTriggers) {
        if (trig.flagKey && !changedKeys.has(trig.flagKey)) continue;
        const anchor = anchors.find((a: any) => a.id === trig.anchorId);
        dispatchOrPromptTrigger(trig, { anchor });
      }
    });

    return () => unsubscribe();
  }, [enabled, triggers, anchors, dispatchOrPromptTrigger]);

  // Scheduled timer listeners for `on: 'timer'` triggers
  useEffect(() => {
    if (!enabled || triggers.length === 0) return undefined;
    const timerTriggers = triggers.filter((t) => t?.on === 'timer');
    if (timerTriggers.length === 0) return undefined;

    const timeoutIds: Array<ReturnType<typeof setTimeout>> = [];
    const intervalIds: Array<ReturnType<typeof setInterval>> = [];

    for (const trig of timerTriggers) {
      const ms = Number(trig.intervalMs ?? trig.delayMs ?? 0);
      if (!Number.isFinite(ms) || ms <= 0) continue;
      const anchor = anchors.find((a: any) => a.id === trig.anchorId);

      if (trig.once) {
        const tid = setTimeout(() => {
          dispatchOrPromptTrigger(trig, { anchor });
        }, ms);
        timeoutIds.push(tid);
      } else {
        const iid = setInterval(() => {
          dispatchOrPromptTrigger(trig, { anchor });
        }, ms);
        intervalIds.push(iid);
      }
    }

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
      intervalIds.forEach((id) => clearInterval(id));
    };
  }, [enabled, triggers, anchors, dispatchOrPromptTrigger]);

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
