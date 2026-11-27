/**
 * @file useAttachedMacroRunner.ts
 * @description Executes isolated JS macros attached directly to Scenarios (`onEnterMacro`)
 *   and Map Objects (`vtt_properties.script` for `on_interact`, `on_trigger`, `on_turn_start`,
 *   `on_destruct`, plus legacy `macroScript`) when live Stage events occur.
 */

import { useEffect, useRef, useCallback } from 'react';
import { QuickJSSandbox } from '../../../engine/scripting/QuickJSSandbox';
import { dispatchStageMacroActions } from '../../../services/stageMacroDispatcher';
import { useADEStore } from '../../../pages/Foundry/store/adeStore';
import { VttEventBus } from '../../../utils/vttEventBus';

export interface UseAttachedMacroRunnerOptions {
  activeScenario?: any;
  currentMap?: any;
  updateMap?: (mapId: string, updates: any) => void;
  isArchitect?: boolean;
  enabled?: boolean;
}

const MAX_TURN_SCRIPTS = 16;

function readStoryFlagsSnapshot(): Record<string, any> {
  const storyFlags = useADEStore.getState().storyFlags || {};
  const snap: Record<string, any> = {};
  for (const [k, rec] of Object.entries(storyFlags)) {
    snap[k] = rec && typeof rec === 'object' && 'value' in rec ? (rec as any).value : rec;
  }
  return snap;
}

export function useAttachedMacroRunner({
  activeScenario,
  currentMap,
  updateMap,
  isArchitect = true,
  enabled = true
}: UseAttachedMacroRunnerOptions) {
  const sandboxRef = useRef<QuickJSSandbox | null>(null);
  const lastScenarioIdRef = useRef<string | null>(null);
  const prevStructureRef = useRef<Map<string, number>>(new Map());
  const destroyedFiredRef = useRef<Set<string>>(new Set());
  const inFlightTurnRef = useRef<boolean>(false);

  const executeAttachedCode = useCallback(
    async (code: string, extraContext: Record<string, any> = {}) => {
      if (!code || !String(code).trim()) return;
      if (!sandboxRef.current) {
        sandboxRef.current = new QuickJSSandbox();
      }
      const workingFlags = readStoryFlagsSnapshot();
      try {
        const { actions } = await sandboxRef.current.executeWithActions(code, {
          storyFlags: workingFlags,
          timestamp: Date.now(),
          ...extraContext
        });

        const adeState = useADEStore.getState();
        const afterSnap = readStoryFlagsSnapshot();
        for (const [fk, fv] of Object.entries(workingFlags)) {
          if (afterSnap[fk] !== fv) {
            adeState.setStoryFlag?.(fk, fv);
          }
        }

        if (Array.isArray(actions) && actions.length > 0) {
          dispatchStageMacroActions(actions, {
            role: isArchitect ? 'architect' : 'operative',
            onSetStoryFlag: (k, v) => useADEStore.getState().setStoryFlag?.(k, v),
            onToggleDoor: (wallId: string) => {
              const targetWall = (currentMap?.walls || []).find(
                (w: any) => w?.id === wallId || w?.label === wallId
              );
              const nextOpen = targetWall ? !targetWall.isOpen : true;
              if (currentMap?.id && typeof updateMap === 'function' && Array.isArray(currentMap?.walls)) {
                const updatedWalls = currentMap.walls.map((w: any) =>
                  w?.id === wallId || w?.label === wallId
                    ? { ...w, isOpen: nextOpen, doorState: nextOpen ? 'open' : 'closed' }
                    : w
                );
                updateMap(currentMap.id, { walls: updatedWalls });
              }
              VttEventBus.emit('stage-bulkhead-toggled', {
                wallId,
                bulkheadId: wallId,
                isOpen: nextOpen,
                doorState: nextOpen ? 'open' : 'closed'
              } as any);
            }
          });
        }
      } catch (err) {
        console.warn('[useAttachedMacroRunner] Attached script execution failed:', err);
      }
    },
    [currentMap?.id, currentMap?.walls, isArchitect, updateMap]
  );

  // 1. Execute Scenario `onEnterMacro` (or `script`) when a scenario activates on Stage
  useEffect(() => {
    if (!enabled || !activeScenario?.id) return;
    if (lastScenarioIdRef.current === activeScenario.id) return;
    lastScenarioIdRef.current = activeScenario.id;

    const code = activeScenario.onEnterMacro || activeScenario.script || '';
    if (typeof code === 'string' && code.trim()) {
      void executeAttachedCode(code, {
        hook: 'on_scenario_enter',
        scenario: { id: activeScenario.id, title: activeScenario.title }
      });
    }
  }, [enabled, activeScenario?.id, activeScenario?.onEnterMacro, activeScenario?.script, activeScenario?.title, executeAttachedCode]);

  // 2. Event-driven Map Object script hooks: on_interact, on_trigger, on_turn_start
  useEffect(() => {
    if (!enabled) return undefined;
    const objects: any[] = Array.isArray(currentMap?.objects) ? currentMap.objects : [];

    const runMatchingObjectScripts = (
      hookName: 'on_interact' | 'on_trigger',
      matchId: string | undefined,
      storyElId?: string,
      extraCtx: Record<string, any> = {}
    ) => {
      for (const obj of objects) {
        if (!obj) continue;
        const matches =
          !matchId ||
          obj.id === matchId ||
          (storyElId && obj.storyElementId === storyElId);
        if (!matches) continue;

        const vttScript = obj.vtt_properties?.script;
        const scriptCode =
          vttScript?.enabled && vttScript.executionHook === hookName
            ? vttScript.sourceCode
            : hookName === 'on_interact'
              ? obj.macroScript
              : '';
        if (scriptCode && String(scriptCode).trim()) {
          void executeAttachedCode(scriptCode, {
            hook: hookName,
            targetAsset: { id: obj.id, name: obj.label || obj.name },
            ...extraCtx
          });
        }
      }
    };

    const offInteract = VttEventBus.on('vtt-object-interacted' as any, (payload: any) => {
      const objId = payload?.objectId || payload?.id;
      const storyElId = payload?.storyElementId;
      if (!objId && !storyElId) return;
      runMatchingObjectScripts('on_interact', objId, storyElId, { interaction: payload });
    });

    const offRegionTrigger = VttEventBus.on('stage-region-triggered' as any, (payload: any) => {
      runMatchingObjectScripts('on_trigger', payload?.regionId, undefined, { event: payload });
    });

    const offHazardTrigger = VttEventBus.on('stage-hazard-toggled' as any, (payload: any) => {
      runMatchingObjectScripts('on_trigger', payload?.hazardId, undefined, { event: payload });
    });

    const offRoundAdvance = VttEventBus.on('stage-round-advanced' as any, async () => {
      if (inFlightTurnRef.current) return;
      inFlightTurnRef.current = true;
      try {
        let dispatched = 0;
        for (const obj of objects) {
          if (dispatched >= MAX_TURN_SCRIPTS) break;
          const vttScript = obj?.vtt_properties?.script;
          if (
            vttScript?.enabled &&
            vttScript.executionHook === 'on_turn_start' &&
            vttScript.sourceCode &&
            String(vttScript.sourceCode).trim()
          ) {
            dispatched++;
            await executeAttachedCode(vttScript.sourceCode, {
              hook: 'on_turn_start',
              targetAsset: { id: obj.id, name: obj.label || obj.name }
            });
          }
        }
      } finally {
        inFlightTurnRef.current = false;
      }
    });

    return () => {
      offInteract();
      offRegionTrigger();
      offHazardTrigger();
      offRoundAdvance();
    };
  }, [enabled, currentMap?.objects, executeAttachedCode]);

  // Reset structure tracking on map switch
  useEffect(() => {
    prevStructureRef.current.clear();
    destroyedFiredRef.current.clear();
    const objects: any[] = Array.isArray(currentMap?.objects) ? currentMap.objects : [];
    for (const obj of objects) {
      if (obj?.id && typeof obj.structure === 'number') {
        prevStructureRef.current.set(obj.id, obj.structure);
      }
    }
  }, [currentMap?.id]);

  // 3. Structure-destruction watcher for `on_destruct` hooks
  useEffect(() => {
    if (!enabled) return;
    const objects: any[] = Array.isArray(currentMap?.objects) ? currentMap.objects : [];
    for (const obj of objects) {
      if (!obj?.id || typeof obj.structure !== 'number') continue;
      const prev = prevStructureRef.current.get(obj.id);
      prevStructureRef.current.set(obj.id, obj.structure);

      const becameDestroyed =
        prev !== undefined &&
        prev > 0 &&
        obj.structure <= 0 &&
        !destroyedFiredRef.current.has(obj.id);

      if (becameDestroyed) {
        const vttScript = obj.vtt_properties?.script;
        if (
          vttScript?.enabled &&
          vttScript.executionHook === 'on_destruct' &&
          vttScript.sourceCode &&
          String(vttScript.sourceCode).trim()
        ) {
          destroyedFiredRef.current.add(obj.id);
          void executeAttachedCode(vttScript.sourceCode, {
            hook: 'on_destruct',
            targetAsset: { id: obj.id, name: obj.label || obj.name }
          });
        }
      }
    }
  }, [enabled, currentMap?.objects, executeAttachedCode]);
}
