/**
 * @file deployVttPackage.ts
 * @description Ingestion bridge: deploys a compiled VTT package into the engine and active map.
 */

import { useEngineStore } from '../engine/index';
import type { StaticEntity } from '../engine/index';
import type { CompiledVttPackage } from '../types/vttPackage';

export interface DeployPackageOptions {
  mergeMode?: 'replace' | 'merge';
}

export function deployCompiledPackage(
  pkg: CompiledVttPackage,
  updateMap: (mapId: string, patch: Partial<any>) => void,
  activeMapId: string,
  options: DeployPackageOptions = {}
): { tokensDeployed: number; objectsDeployed: number } {
  const { mergeMode = 'replace' } = options;
  const engineStore = useEngineStore.getState();

  // 1. Convert compiled tokens to StaticEntity and batch-load into engine
  const tokens = pkg.map?.tokens ?? [];
  const staticEntities: StaticEntity[] = tokens.map((tok: any) => ({
    id: tok.id,
    name: tok.name || tok.label || 'NPC Operative',
    base_hp: tok.health?.max ?? 30,
    base_vitality: tok.vitality?.max ?? 30,
    base_health: tok.health?.max ?? 30,
    armor_dr: tok.defense ?? 12,
    stamina_dr: 2,
    tech_level: pkg.manifest?.techLevel ?? 3,
    speed_ft: 30,
    size_modifier: 0,
    is_persona: false,
    character_doc_id: tok.storyElementId ?? undefined,
  }));

  if (typeof (engineStore as any).loadStaticEntitiesBatch === 'function') {
    (engineStore as any).loadStaticEntitiesBatch(staticEntities);
  } else {
    staticEntities.forEach((ent) => engineStore.loadStaticEntity(ent));
  }

  // Update token positions in ephemeral state
  tokens.forEach((tok: any) => {
    if (tok.x != null && tok.y != null) {
      engineStore.updatePosition(tok.id, tok.x, tok.y);
    }
  });

  // 2. Prepare tokens and objects for map state
  const patchedTokens = tokens.map((t: any) => ({
    ...t,
    x: t.x ?? 400,
    y: t.y ?? 400,
  }));
  const patchedObjects = pkg.map?.objects ?? [];

  const mapPatch: Record<string, any> = {
    tokens: patchedTokens,
    objects: patchedObjects,
    walls: pkg.map?.walls ?? undefined,
  };

  if (mergeMode === 'merge') {
    mapPatch._mergeStrategy = 'additive';
  }

  updateMap(activeMapId, mapPatch);

  return {
    tokensDeployed: tokens.length,
    objectsDeployed: patchedObjects.length,
  };
}
