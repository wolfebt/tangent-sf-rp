/**
 * @file useStageRaycast.ts
 * @description Hook and utilities for Stage Raycasting, Sentry Vision, and NPC Patrol loops.
 */

import { useEffect, useRef } from 'react';
import { stepNpcPatrols, evaluateSentryVision } from '../../../services/reactiveVttService';
import { VttEventBus } from '../../../utils/vttEventBus';
import type { BVHBuilder } from '../../../engine/vision/BVHBuilder';

export interface UseStageRaycastProps {
  isMultiplayerSimActive: boolean;
  isSimulationPaused: boolean;
  currentMapTokens: any[];
  engineStore: {
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

  useEffect(() => {
    if (!isMultiplayerSimActive || isSimulationPaused) {
      if (npcTickRef.current) {
        clearInterval(npcTickRef.current);
        npcTickRef.current = null;
      }
      return;
    }

    npcTickRef.current = setInterval(() => {
      const allTokens = (currentMapTokens || []).map(t => {
        return {
          id: t.id,
          x: t.x || 0,
          y: t.y || 0,
          script: t.script,
          patrolRoute: t.patrolRoute,
          is_persona: t.is_persona || t.type === 'character' || t.isOperative,
          designation: t.designation || (t.is_persona ? 'Ally' : 'Neutral')
        };
      });

      // Step all NPC patrol tokens
      const updatedTokens = stepNpcPatrols(allTokens, 20);
      updatedTokens.forEach(tok => {
        const orig = allTokens.find(t => t.id === tok.id);
        if (orig && (orig.x !== tok.x || orig.y !== tok.y)) {
          engineStore.updatePosition(tok.id, tok.x, tok.y);
        }
      });

      // Evaluate sentry vision for each sentry token
      const heroTokens = allTokens.filter(t => t.is_persona || (t as any).designation === 'Ally');
      updatedTokens.forEach(tok => {
        const script = tok.script;
        if (script?.type === 'sentry') {
          const detection = evaluateSentryVision(
            { ...tok, script },
            heroTokens
          );
          if (detection) {
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
  }, [isMultiplayerSimActive, isSimulationPaused, currentMapTokens, engineStore]);

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
