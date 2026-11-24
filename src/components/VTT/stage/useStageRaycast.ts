/**
 * @file useStageRaycast.ts
 * @description Hook and utilities for Stage Raycasting, Sentry Vision, and NPC Patrol loops.
 */

import { useEffect, useRef } from 'react';
import { stepNpcPatrols, evaluateSentryVision } from '../../../services/reactiveVttService';
import { VttEventBus } from '../../../utils/vttEventBus';
import { useEngineStore } from '../../../engine/state/VolatileSharder.ts';
import type { BVHBuilder } from '../../../engine/vision/BVHBuilder.ts';

export interface UseStageRaycastProps {
  isMultiplayerSimActive: boolean;
  isSimulationPaused: boolean;
  currentMapTokens: any[];
  engineStore?: {
    updatePosition: (id: string, x: number, y: number) => void;
  };
  bvhBuilderRef?: React.MutableRefObject<BVHBuilder | null>;
}

export function useStageRaycast({
  isMultiplayerSimActive,
  isSimulationPaused,
  currentMapTokens,
  engineStore,
  bvhBuilderRef
}: UseStageRaycastProps) {
  const npcTickRef = useRef<any>(null);
  const currentMapTokensRef = useRef(currentMapTokens);
  const engineStoreRef = useRef(engineStore);
  const patrolProgressRef = useRef<Map<string, { currentWaypointIndex: number; isReversing: boolean }>>(new Map());

  currentMapTokensRef.current = currentMapTokens;
  engineStoreRef.current = engineStore;

  /**
   * Evaluates line of sight between two positions using BVH spatial acceleration
   */
  const checkLineOfSight = (
    from: { x: number; y: number },
    to: { x: number; y: number }
  ): boolean => {
    if (!bvhBuilderRef?.current) return true;
    const occlusions = bvhBuilderRef.current.queryRayOcclusions(from, to);
    return occlusions.length === 0;
  };

  useEffect(() => {
    if (!isMultiplayerSimActive || isSimulationPaused) {
      if (npcTickRef.current) {
        clearInterval(npcTickRef.current);
        npcTickRef.current = null;
      }
      return;
    }

    npcTickRef.current = setInterval(() => {
      const storeSnapshot = useEngineStore.getState();
      const rawTokens = currentMapTokensRef.current || [];
      const activeIds = new Set(rawTokens.map((t: any) => t.id));
      for (const cachedId of patrolProgressRef.current.keys()) {
        if (!activeIds.has(cachedId)) {
          patrolProgressRef.current.delete(cachedId);
        }
      }

      const allTokens = rawTokens.map((t: any) => {
        const liveEph = storeSnapshot.ephemeralData?.[t.id];
        const cachedProg = patrolProgressRef.current.get(t.id);
        const mergedScript = t.script && typeof t.script === 'object'
          ? {
              ...t.script,
              ...(cachedProg
                ? {
                    currentWaypointIndex: cachedProg.currentWaypointIndex,
                    isReversing: cachedProg.isReversing
                  }
                : {})
            }
          : t.script;
        return {
          id: t.id,
          name: t.name || t.label,
          x: liveEph?.x ?? t.x ?? 0,
          y: liveEph?.y ?? t.y ?? 0,
          script: mergedScript,
          patrolRoute: t.patrolRoute,
          is_persona: t.is_persona || t.type === 'character' || t.isOperative,
          designation: t.designation || (t.is_persona ? 'Ally' : 'Neutral')
        };
      });

      // Step all NPC patrol tokens
      const updatedTokens = stepNpcPatrols(allTokens, 20);
      const updater = engineStoreRef.current?.updatePosition || storeSnapshot.updatePosition;
      updatedTokens.forEach((tok: any) => {
        if (tok.script?.type === 'patrol') {
          patrolProgressRef.current.set(tok.id, {
            currentWaypointIndex: tok.script.currentWaypointIndex ?? 0,
            isReversing: Boolean(tok.script.isReversing)
          });
        }
        const orig = allTokens.find((t: any) => t.id === tok.id);
        if (orig && (orig.x !== tok.x || orig.y !== tok.y)) {
          updater(tok.id, tok.x, tok.y);
        }
      });

      // Evaluate sentry vision against live hero token positions + BVH wall occlusion
      const heroTokens = updatedTokens.filter((t: any) => t.is_persona || t.designation === 'Ally');
      updatedTokens.forEach((tok: any) => {
        const script = tok.script;
        if (script?.type === 'sentry') {
          const detection = evaluateSentryVision(
            { ...tok, script },
            heroTokens
          );
          if (
            detection &&
            (!bvhBuilderRef?.current ||
              checkLineOfSight(
                { x: tok.x, y: tok.y },
                { x: detection.detectedHero.x, y: detection.detectedHero.y }
              ))
          ) {
            VttEventBus.emit('sentry-alert', detection);
          }
        }
      });
    }, 1500);

    return () => {
      if (npcTickRef.current) {
        clearInterval(npcTickRef.current);
        npcTickRef.current = null;
      }
    };
  }, [isMultiplayerSimActive, isSimulationPaused]);

  /**
   * Automatically calculates Line of Sight Cover per 3.00 COMBAT.md:
   * Casts 3 rays (center, left flank, right flank) from attacker to target.
   */
  const calculateCover = (
    attacker: { x: number; y: number },
    target: { x: number; y: number }
  ) => {
    if (!bvhBuilderRef?.current) {
      return { coverType: 'none', coverMod: 0, rayHitsCount: 0, occludingWalls: [] };
    }
    return bvhBuilderRef.current.calculateLineOfSightCover(attacker, target);
  };

  return {
    checkLineOfSight,
    calculateCover
  };
}
