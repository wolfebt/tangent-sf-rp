/**
 * @file SceneRegionManager.ts
 * @description Spatial Scene Regions & Trigger Volumes for Multi-Deck teleports, map transitions,
 *   roof interior cutouts, story flag triggers, audio cues, and environmental hazards.
 */

export type SceneRegionTriggerType =
  | 'teleport_deck'
  | 'switch_map'
  | 'story_flag'
  | 'audio_cue'
  | 'hazard'
  | 'roof_zone';

export interface SceneRegionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SceneRegion {
  id: string;
  name: string;
  bounds: SceneRegionBounds;
  triggerType: SceneRegionTriggerType;
  payload: Record<string, any>;
  autoTrigger: boolean;
  enabled?: boolean;
}

export interface RegionTriggerEvent {
  region: SceneRegion;
  tokenId: string;
  event: 'enter' | 'exit';
}

export function isPointInRegion(
  point: { x: number; y: number },
  region: SceneRegion
): boolean {
  if (!region || region.enabled === false) return false;
  const b = region.bounds;
  if (!b) return false;
  return (
    point.x >= b.x &&
    point.x <= b.x + b.width &&
    point.y >= b.y &&
    point.y <= b.y + b.height
  );
}

export function createSceneRegion(
  partial: Partial<SceneRegion> & { name: string; triggerType: SceneRegionTriggerType }
): SceneRegion {
  return {
    id: partial.id || `region_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: partial.name,
    bounds: partial.bounds || { x: 200, y: 200, width: 200, height: 200 },
    triggerType: partial.triggerType,
    payload: partial.payload || {},
    autoTrigger: partial.autoTrigger ?? true,
    enabled: partial.enabled ?? true
  };
}

/**
 * Evaluates all enter/exit region transitions for a single token move.
 */
export function evaluateTokenRegions(
  tokenId: string,
  prevPos: { x: number; y: number },
  nextPos: { x: number; y: number },
  regions: SceneRegion[]
): RegionTriggerEvent[] {
  if (!tokenId || !Array.isArray(regions) || regions.length === 0) return [];
  const events: RegionTriggerEvent[] = [];

  for (const region of regions) {
    if (!region || region.enabled === false || region.autoTrigger === false) continue;
    const wasInside = isPointInRegion(prevPos, region);
    const isNowInside = isPointInRegion(nextPos, region);

    if (!wasInside && isNowInside) {
      events.push({ region, tokenId, event: 'enter' });
    } else if (wasInside && !isNowInside) {
      events.push({ region, tokenId, event: 'exit' });
    }
  }

  return events;
}

export const SceneRegionManager = {
  isPointInRegion,
  createSceneRegion,
  evaluateTokenRegions
};

export default SceneRegionManager;
