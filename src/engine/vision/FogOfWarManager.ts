/**
 * @file FogOfWarManager.ts
 * @description Stage 3-Tier Persistent Explored Fog-of-War Engine.
 * Separates unexplored areas (0.94 shroud), previously explored fog-of-memory (0.52 shroud),
 * live active token vision polygons (0.0 cutout), and manual Architect hide masks.
 */

export interface FogPoint {
  x: number;
  y: number;
}

export type FogPolygon = FogPoint[];

export interface ExploredFogSnapshot {
  mapId: string;
  exploredPolygons: FogPolygon[];
  hiddenPolygons: FogPolygon[];
  updatedAt: number;
}

interface MapFogState {
  exploredPolygons: FogPolygon[];
  hiddenPolygons: FogPolygon[];
  updatedAt: number;
}

const MAX_POLYGONS_PER_MAP = 250;

function computeBoundingSignature(poly: FogPolygon): string {
  if (poly.length === 0) return 'empty';
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const pt of poly) {
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  }
  const q = (n: number) => Math.round(n / 12) * 12;
  return `${q(minX)},${q(minY)},${q(maxX)},${q(maxY)},${poly.length}`;
}

export function normalizeFogPolygon(raw: FogPolygon | number[]): FogPolygon {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const first = raw[0];
  if (typeof first === 'number') {
    const numArr = raw as number[];
    const pts: FogPolygon = [];
    for (let i = 0; i + 1 < numArr.length; i += 2) {
      const x = Number(numArr[i]);
      const y = Number(numArr[i + 1]);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        pts.push({ x: Math.round(x), y: Math.round(y) });
      }
    }
    return pts;
  }
  const objArr = raw as FogPolygon;
  return objArr
    .filter((pt) => pt && Number.isFinite(pt.x) && Number.isFinite(pt.y))
    .map((pt) => ({ x: Math.round(pt.x), y: Math.round(pt.y) }));
}

export class FogOfWarManager {
  private readonly states: Map<string, MapFogState>;
  private readonly signatureIndex: Map<string, Set<string>>;

  constructor() {
    this.states = new Map();
    this.signatureIndex = new Map();
  }

  private ensureMapState(mapId: string): MapFogState {
    let state = this.states.get(mapId);
    if (!state) {
      state = {
        exploredPolygons: [],
        hiddenPolygons: [],
        updatedAt: Date.now()
      };
      this.states.set(mapId, state);
      this.signatureIndex.set(mapId, new Set());
    }
    return state;
  }

  /**
   * Records a live vision polygon into persistent explored history if it explores new space.
   * Returns true if the explored history actually changed.
   */
  public recordVisionPolygon(mapId: string, polygonInput: FogPolygon | number[]): boolean {
    if (!mapId) return false;
    const polygon = normalizeFogPolygon(polygonInput);
    if (polygon.length < 3) return false;

    const state = this.ensureMapState(mapId);
    let sigs = this.signatureIndex.get(mapId);
    if (!sigs) {
      sigs = new Set();
      this.signatureIndex.set(mapId, sigs);
    }

    const sig = computeBoundingSignature(polygon);
    if (sigs.has(sig)) return false;

    sigs.add(sig);
    state.exploredPolygons.push(polygon);
    if (state.exploredPolygons.length > MAX_POLYGONS_PER_MAP) {
      const removed = state.exploredPolygons.shift();
      if (removed) {
        sigs.delete(computeBoundingSignature(removed));
      }
    }
    state.updatedAt = Date.now();
    return true;
  }

  /**
   * Manually reveals a polygonal or rectangular area in permanent explored memory.
   */
  public revealArea(mapId: string, polygonInput: FogPolygon | number[]): void {
    this.recordVisionPolygon(mapId, polygonInput);
  }

  /**
   * Manually re-shrouds an area (even if previously explored).
   */
  public hideArea(mapId: string, polygonInput: FogPolygon | number[]): void {
    if (!mapId) return;
    const polygon = normalizeFogPolygon(polygonInput);
    if (polygon.length < 3) return;
    const state = this.ensureMapState(mapId);
    state.hiddenPolygons.push(polygon);
    if (state.hiddenPolygons.length > MAX_POLYGONS_PER_MAP) {
      state.hiddenPolygons.shift();
    }
    state.updatedAt = Date.now();
  }

  /**
   * Resets all explored and hidden polygons for a map back to 100% unexplored shroud.
   */
  public resetExplored(mapId: string): void {
    if (!mapId) return;
    this.states.set(mapId, {
      exploredPolygons: [],
      hiddenPolygons: [],
      updatedAt: Date.now()
    });
    this.signatureIndex.set(mapId, new Set());
  }

  public getState(mapId: string): ExploredFogSnapshot {
    const state = this.ensureMapState(mapId);
    return {
      mapId,
      exploredPolygons: state.exploredPolygons.map((p) => p.map((pt) => ({ ...pt }))),
      hiddenPolygons: state.hiddenPolygons.map((p) => p.map((pt) => ({ ...pt }))),
      updatedAt: state.updatedAt
    };
  }

  public serialize(mapId: string): ExploredFogSnapshot {
    return this.getState(mapId);
  }

  public hydrate(snapshot: ExploredFogSnapshot): void {
    if (!snapshot || !snapshot.mapId) return;
    const explored = Array.isArray(snapshot.exploredPolygons)
      ? snapshot.exploredPolygons
          .map((p) => normalizeFogPolygon(p))
          .filter((p) => p.length >= 3)
          .slice(-MAX_POLYGONS_PER_MAP)
      : [];
    const hidden = Array.isArray(snapshot.hiddenPolygons)
      ? snapshot.hiddenPolygons
          .map((p) => normalizeFogPolygon(p))
          .filter((p) => p.length >= 3)
          .slice(-MAX_POLYGONS_PER_MAP)
      : [];

    const sigs = new Set<string>();
    for (const p of explored) {
      sigs.add(computeBoundingSignature(p));
    }

    this.states.set(snapshot.mapId, {
      exploredPolygons: explored,
      hiddenPolygons: hidden,
      updatedAt: Number(snapshot.updatedAt || Date.now())
    });
    this.signatureIndex.set(snapshot.mapId, sigs);
  }

  /**
   * Renders 3-tier PixiJS v8 fog onto ZLayer.FogOfWar:
   *  - Tier 1 (0.94 / 0.38 preview): Unexplored shroud
   *  - Tier 2 (0.52 / 0.20 preview): Previously explored memory shroud
   *  - Tier 3 (0.0 cutout): Live active vision polygons
   */
  public renderToPixiLayer(
    graphics: any,
    mapWidth: number,
    mapHeight: number,
    mapId: string,
    activeVisionPolygons: Array<FogPolygon | number[]>,
    isArchitectPreview = false
  ): void {
    if (!graphics || typeof graphics.clear !== 'function') return;
    const w = Math.max(500, Number(mapWidth) || 2800);
    const h = Math.max(500, Number(mapHeight) || 2100);
    const state = this.ensureMapState(mapId);

    const unexploredAlpha = isArchitectPreview ? 0.38 : 0.94;
    const exploredAlpha = isArchitectPreview ? 0.18 : 0.52;

    const toFlat = (poly: FogPolygon): number[] => {
      const flat: number[] = [];
      for (const pt of poly) {
        flat.push(pt.x, pt.y);
      }
      return flat;
    };

    graphics.clear();

    // Base unexplored blackness
    graphics.rect(0, 0, w, h);
    graphics.fill({ color: 0x030712, alpha: unexploredAlpha });

    // Punch out all explored areas and active vision from deep unexplored shroud
    const hasCutSupport = typeof graphics.cut === 'function';
    const normalizedActive = (activeVisionPolygons || [])
      .map((p) => normalizeFogPolygon(p))
      .filter((p) => p.length >= 3);

    if (hasCutSupport && (state.exploredPolygons.length > 0 || normalizedActive.length > 0)) {
      for (const poly of state.exploredPolygons) {
        graphics.poly(toFlat(poly));
        graphics.cut();
      }
      for (const activePoly of normalizedActive) {
        graphics.poly(toFlat(activePoly));
        graphics.cut();
      }
    }

    // Re-draw explored fog-of-memory dim veil everywhere explored (then punch live vision)
    if (state.exploredPolygons.length > 0) {
      for (const poly of state.exploredPolygons) {
        graphics.poly(toFlat(poly));
      }
      graphics.fill({ color: 0x090f1e, alpha: exploredAlpha });

      if (hasCutSupport && normalizedActive.length > 0) {
        for (const activePoly of normalizedActive) {
          graphics.poly(toFlat(activePoly));
          graphics.cut();
        }
      }
    }

    // Re-apply explicit Architect manual shroud blocks on top
    if (state.hiddenPolygons.length > 0) {
      for (const poly of state.hiddenPolygons) {
        graphics.poly(toFlat(poly));
      }
      graphics.fill({ color: 0x030712, alpha: unexploredAlpha });
    }
  }
}

export const fogOfWarManager = new FogOfWarManager();
