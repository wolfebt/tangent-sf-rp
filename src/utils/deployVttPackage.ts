/**
 * @file deployVttPackage.ts
 * @description Ingestion bridge: deploys a compiled VTT Story Module into the engine, active map,
 * and Gallery runtime state (tokens, objects, walls, maps, and situational modifiers).
 */

import { useEngineStore } from '../engine/state/VolatileSharder.ts';
import type { StaticEntity } from '../engine/state/VolatileSharder.ts';
import type { CompiledVttPackage } from '../types/vttPackage.ts';
import { useUILayoutStore } from '../components/VTT/store/uiLayoutStore.ts';

export interface DeployPackageOptions {
  mergeMode?: 'replace' | 'merge';
  setGalleryModifiers?: (modifiers: any[]) => void;
  addMap?: (map: any) => void;
  availableMaps?: any[];
}

export interface DeployResult {
  tokensDeployed: number;
  objectsDeployed: number;
  modifiersDeployed: number;
  mapsDeployed: number;
}

export function deployCompiledPackage(
  pkg: CompiledVttPackage,
  updateMap: (mapId: string, patch: Partial<any>) => void,
  activeMapId: string,
  options: DeployPackageOptions = {}
): DeployResult {
  const { mergeMode = 'replace', setGalleryModifiers, addMap, availableMaps = [] } = options;
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

  if (activeMapId) {
    updateMap(activeMapId, mapPatch);
  }

  // 3. Ingest Gallery Situational Modifiers
  let modifiersDeployed = 0;
  const galleryMods = pkg.gallery?.modifiers || pkg.automations?.activeModifiers || [];
  if (galleryMods.length > 0) {
    modifiersDeployed = galleryMods.length;
    if (setGalleryModifiers) {
      setGalleryModifiers(galleryMods);
    }
  }

  // 4. Ingest Extra Gallery Maps if provided
  let mapsDeployed = 0;
  const galleryMaps = pkg.gallery?.maps || [];
  if (galleryMaps.length > 0 && addMap) {
    galleryMaps.forEach((gMap) => {
      const exists = availableMaps.some((m: any) => m.id === gMap.id);
      if (!exists && gMap.id !== activeMapId) {
        addMap({
          id: gMap.id,
          title: gMap.title || 'Imported Sector',
          width: gMap.width || 2400,
          height: gMap.height || 1800,
          gridSize: gMap.gridSize || 50,
          walls: gMap.walls || [],
          objects: gMap.objects || [],
          tokens: gMap.tokens || []
        });
        mapsDeployed++;
      }
    });
  }

  // 5. Store package in UI layout store
  useUILayoutStore.getState().setLastCompiledPackage(pkg);

  return {
    tokensDeployed: tokens.length,
    objectsDeployed: patchedObjects.length,
    modifiersDeployed,
    mapsDeployed
  };
}
