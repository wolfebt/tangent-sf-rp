/**
 * Canonical map schema normalization & layer-state utilities shared between
 * MapMaker, ADE Stage Compiler, VTT StageView, and Spectator View.
 */

export interface MapLayerEntry {
  id: string;
  name?: string;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  order?: number;
}

export interface NormalizedMapRecord {
  id: string;
  name: string;
  gridSize: number;
  gridMode: string;
  width: number;
  height: number;
  background_url: string;
  underlays: any[];
  layers: MapLayerEntry[];
  lighting: Record<string, any>;
  fogOfWar: Record<string, any>;
  chunks: any[];
  chunkInstances: any[];
  lines: any[];
  terrains: any[];
  walls: any[];
  lights: any[];
  regions: any[];
  objects: any[];
  tokens: any[];
  texts: any[];
  fog: any[];
  waypoints: any[];
  [key: string]: any;
}

const DEFAULT_LAYER_STATES: Record<string, { visible: boolean; locked: boolean }> = {
  background: { visible: true, locked: false },
  underlay: { visible: true, locked: false },
  terrain: { visible: true, locked: false },
  walls: { visible: true, locked: false },
  lighting: { visible: true, locked: false },
  objects: { visible: true, locked: false },
  tokens: { visible: true, locked: false },
  waypoints: { visible: true, locked: false },
  regions: { visible: true, locked: false },
  roof: { visible: true, locked: false },
  fog: { visible: true, locked: false },
  annotations: { visible: true, locked: false },
};

const LAYER_ALIAS_MAP: Record<string, string[]> = {
  background: ['background', 'underlay', 'underlays', 'map'],
  underlay: ['underlay', 'underlays', 'background'],
  terrain: ['terrain', 'terrains', 'ground'],
  walls: ['walls', 'walls_doors', 'architecture'],
  lighting: ['lighting', 'lights', 'atmosphere'],
  objects: ['objects', 'props', 'interactives'],
  tokens: ['tokens', 'actors', 'units'],
  waypoints: ['waypoints', 'anchors'],
  regions: ['regions', 'zones', 'triggers'],
  roof: ['roof', 'roofs', 'canopy'],
  fog: ['fog', 'fogOfWar', 'shroud'],
  annotations: ['annotations', 'texts', 'notes', 'drawings'],
};

/**
 * Resolves `{ visible, locked }` for a given logical layer id against `map.layers`.
 * Defaults to `{ visible: true, locked: false }` when the layer is absent.
 */
export function getMapLayerState(
  map: any,
  layerId: string
): { visible: boolean; locked: boolean; opacity: number } {
  const layers = Array.isArray(map?.layers) ? map.layers : [];
  const aliases = LAYER_ALIAS_MAP[layerId] || [layerId];
  const entry = layers.find(
    (l: any) => l && (l.id === layerId || aliases.includes(String(l.id).toLowerCase()))
  );
  if (!entry) {
    const def = DEFAULT_LAYER_STATES[layerId] || { visible: true, locked: false };
    return { ...def, opacity: 1 };
  }
  return {
    visible: entry.visible !== false,
    locked: entry.locked === true,
    opacity: typeof entry.opacity === 'number' ? entry.opacity : 1,
  };
}

/**
 * Resolves the primary underlay URL from either `background_url` or `underlays[0].url`.
 */
export function resolveMapBackgroundUrl(map: any): string {
  if (!map) return '';
  if (typeof map.background_url === 'string' && map.background_url.trim()) {
    return map.background_url;
  }
  if (Array.isArray(map.underlays) && map.underlays.length > 0) {
    const firstVisible = map.underlays.find((u: any) => u?.url && u.visible !== false) || map.underlays[0];
    if (typeof firstVisible?.url === 'string') return firstVisible.url;
  }
  return '';
}

/**
 * Normalizes any tactical map payload (MapMaker legacy, VTT starter, or Stage export)
 * into a unified canonical structure without dropping original properties.
 */
export function normalizeMapRecord(rawMap: any): NormalizedMapRecord {
  const base = rawMap && typeof rawMap === 'object' ? rawMap : {};
  const numericGridSize = Number(base.gridSize);
  const gridSize = Number.isFinite(numericGridSize) && numericGridSize >= 16 ? numericGridSize : 50;
  const width = Number.isFinite(Number(base.width)) && Number(base.width) > 0 ? Number(base.width) : 2400;
  const height = Number.isFinite(Number(base.height)) && Number(base.height) > 0 ? Number(base.height) : 1600;
  const backgroundUrl = resolveMapBackgroundUrl(base);

  const lightingObj = base.lighting && typeof base.lighting === 'object' ? base.lighting : {};
  const normalizedLighting = {
    ambientColor: lightingObj.ambientColor ?? base.ambientColor ?? '#020617',
    ambientAlpha:
      typeof lightingObj.ambientAlpha === 'number'
        ? lightingObj.ambientAlpha
        : (typeof base.ambientAlpha === 'number' ? base.ambientAlpha : 0.72),
    ambientLight:
      typeof lightingObj.ambientLight === 'number'
        ? lightingObj.ambientLight
        : (typeof base.ambientLight === 'number' ? base.ambientLight : 0.3),
    preset: lightingObj.preset ?? base.atmospherePreset ?? base.lightingPreset ?? 'none',
    globalIllumination: Boolean(lightingObj.globalIllumination ?? base.globalIllumination),
    weather: lightingObj.weather ?? base.weather ?? 'clear',
    ...lightingObj,
  };

  return {
    ...base,
    id: String(base.id || `map-${Date.now()}`),
    name: String(base.name || base.title || 'Untitled Tactical Map'),
    gridSize,
    gridMode: String(base.gridMode || 'square'),
    width,
    height,
    background_url: backgroundUrl,
    underlays: Array.isArray(base.underlays) ? base.underlays : [],
    layers: Array.isArray(base.layers) ? base.layers : [],
    lighting: normalizedLighting,
    fogOfWar: base.fogOfWar && typeof base.fogOfWar === 'object' ? base.fogOfWar : { enabled: false },
    chunks: Array.isArray(base.chunks) ? base.chunks : [],
    chunkInstances: Array.isArray(base.chunkInstances) ? base.chunkInstances : [],
    lines: Array.isArray(base.lines) ? base.lines : [],
    terrains: Array.isArray(base.terrains) ? base.terrains : [],
    walls: Array.isArray(base.walls) ? base.walls : [],
    lights: Array.isArray(base.lights) ? base.lights : [],
    regions: Array.isArray(base.regions) ? base.regions : [],
    objects: Array.isArray(base.objects) ? base.objects : [],
    tokens: Array.isArray(base.tokens) ? base.tokens : [],
    texts: Array.isArray(base.texts) ? base.texts : [],
    fog: Array.isArray(base.fog) ? base.fog : [],
    waypoints: Array.isArray(base.waypoints) ? base.waypoints : [],
  };
}
