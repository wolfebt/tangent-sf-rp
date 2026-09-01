/**
 * @file CoordinateEngine.ts
 * @description Stage 2.4: Multi-tier hierarchical grid mathematics and pathfinding integration.
 * Handles bidirectional translation of absolute PixiJS pixel space into strict Tangent
 * logical grid coordinates (Cube Coordinates for Hex, Axial/Orthogonal for Square).
 * Eliminates floating-point drift for token snapping.
 * 
 * Supports full 6-tier nested hierarchical grid scaling:
 * 1. Encounter / Tactical (Base 5ft per cell; Medium subject = 1 cell, 30ft base movement)
 * 2. Overland (50ft - 1km)
 * 3. Planetary (10km - 100km)
 * 4. Interplanetary (10,000km - 0.1 AU)
 * 5. Star System (1 AU)
 * 6. Sector / Interstellar (1 Light-Year - 1 Parsec)
 */

export const GridType = {
  Square: 'SQUARE',
  HexFlatTop: 'HEX_FLAT_TOP',
  HexPointyTop: 'HEX_POINTY_TOP'
} as const;

export type GridType = typeof GridType[keyof typeof GridType];

export const GridScaleTier = {
  Encounter: 'ENCOUNTER',       // 1 cell = 5 ft (Tactical base)
  Overland: 'OVERLAND',         // 1 cell = 50 ft to 1 km
  Planetary: 'PLANETARY',       // 1 cell = 10 km to 100 km
  Interplanetary: 'INTERPLANETARY', // 1 cell = 10,000 km to 0.1 AU
  StarSystem: 'STAR_SYSTEM',     // 1 cell = 1 AU
  Sector: 'SECTOR'              // 1 cell = 1 Light-Year to 1 Parsec
} as const;

export type GridScaleTier = typeof GridScaleTier[keyof typeof GridScaleTier];

export interface GridScaleConfig {
  tier: GridScaleTier;
  unitName: string;
  feetPerCell: number;           // Standard conversion baseline
  displayLabel: string;
  defaultPixelsPerCell: number;  // Standard visual PPI (e.g. 70px)
}

export const GRID_SCALE_CONFIGS: Record<GridScaleTier, GridScaleConfig> = {
  [GridScaleTier.Encounter]: {
    tier: GridScaleTier.Encounter,
    unitName: 'ft',
    feetPerCell: 5,
    displayLabel: '1 Cell = 5 ft (Encounter Scale)',
    defaultPixelsPerCell: 70
  },
  [GridScaleTier.Overland]: {
    tier: GridScaleTier.Overland,
    unitName: 'ft',
    feetPerCell: 50,
    displayLabel: '1 Cell = 50 ft (Overland Scale)',
    defaultPixelsPerCell: 70
  },
  [GridScaleTier.Planetary]: {
    tier: GridScaleTier.Planetary,
    unitName: 'km',
    feetPerCell: 32808.4, // ~10 km in feet
    displayLabel: '1 Cell = 10 km (Planetary Scale)',
    defaultPixelsPerCell: 70
  },
  [GridScaleTier.Interplanetary]: {
    tier: GridScaleTier.Interplanetary,
    unitName: 'km',
    feetPerCell: 32808400, // ~10,000 km in feet
    displayLabel: '1 Cell = 10,000 km (Interplanetary Scale)',
    defaultPixelsPerCell: 70
  },
  [GridScaleTier.StarSystem]: {
    tier: GridScaleTier.StarSystem,
    unitName: 'AU',
    feetPerCell: 4.908e11, // ~1 AU in feet
    displayLabel: '1 Cell = 1 AU (Star System Scale)',
    defaultPixelsPerCell: 70
  },
  [GridScaleTier.Sector]: {
    tier: GridScaleTier.Sector,
    unitName: 'LY',
    feetPerCell: 3.104e16, // ~1 Light-Year in feet
    displayLabel: '1 Cell = 1 Light-Year (Sector Scale)',
    defaultPixelsPerCell: 70
  }
};

// Canonical Tangent Encounter Scale baseline: 5ft per cell
export const TANGENT_BASE_CELL_FT = 5;
export const TANGENT_BASE_MOVEMENT_FT = 30; // 6 cells

// Cube coordinates specifically for Hex math (q + r + s must equal 0)
export interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

export interface PixelCoord {
  x: number;
  y: number;
}

export class CoordinateEngine {
  private gridType: GridType;
  private cellSizePx: number; // Pixels per cell width/diameter
  private scaleTier: GridScaleTier;
  private scaleConfig: GridScaleConfig;

  constructor(
    type: GridType = GridType.Square, 
    pixelsPerCell: number = 70, 
    tier: GridScaleTier = GridScaleTier.Encounter
  ) {
    this.gridType = type;
    this.cellSizePx = pixelsPerCell > 0 ? pixelsPerCell : 70;
    this.scaleTier = tier;
    this.scaleConfig = GRID_SCALE_CONFIGS[tier];
  }

  public setGridType(type: GridType) {
    this.gridType = type;
  }

  public getGridType(): GridType {
    return this.gridType;
  }

  public setCellSizePx(sizePx: number) {
    if (sizePx > 0) this.cellSizePx = sizePx;
  }

  public getCellSizePx(): number {
    return this.cellSizePx;
  }

  public setScaleTier(tier: GridScaleTier) {
    this.scaleTier = tier;
    this.scaleConfig = GRID_SCALE_CONFIGS[tier];
  }

  public getScaleTier(): GridScaleTier {
    return this.scaleTier;
  }

  public getScaleConfig(): GridScaleConfig {
    return this.scaleConfig;
  }

  /**
   * Converts a logical Hex Cube / Square Coordinate to absolute PixiJS Pixel space on the Stage.
   */
  public cubeToPixel(coord: CubeCoord): PixelCoord {
    let x = 0;
    let y = 0;

    if (this.gridType === GridType.HexFlatTop) {
      x = this.cellSizePx * (3.0 / 2.0 * coord.q);
      y = this.cellSizePx * (Math.sqrt(3) / 2.0 * coord.q + Math.sqrt(3) * coord.r);
    } else if (this.gridType === GridType.HexPointyTop) {
      x = this.cellSizePx * (Math.sqrt(3) * coord.q + Math.sqrt(3) / 2.0 * coord.r);
      y = this.cellSizePx * (3.0 / 2.0 * coord.r);
    } else {
      // Standard square grid
      x = coord.q * this.cellSizePx;
      y = coord.r * this.cellSizePx;
    }

    return { x, y };
  }

  /**
   * Translates an arbitrary mouse click / touch (pixel space) into a strict logical coordinate.
   * Utilizes fractional cube rounding to eliminate floating point imprecision.
   */
  public pixelToCube(pixel: PixelCoord): CubeCoord {
    if (this.gridType === GridType.Square) {
      return {
        q: Math.round(pixel.x / this.cellSizePx),
        r: Math.round(pixel.y / this.cellSizePx),
        s: 0
      };
    }

    let q = 0;
    let r = 0;

    if (this.gridType === GridType.HexFlatTop) {
      q = (2.0 / 3.0 * pixel.x) / this.cellSizePx;
      r = (-1.0 / 3.0 * pixel.x + Math.sqrt(3) / 3.0 * pixel.y) / this.cellSizePx;
    } else {
      // Pointy top
      q = (Math.sqrt(3) / 3.0 * pixel.x - 1.0 / 3.0 * pixel.y) / this.cellSizePx;
      r = (2.0 / 3.0 * pixel.y) / this.cellSizePx;
    }

    const s = -q - r;
    return this.cubeRound(q, r, s);
  }

  /**
   * Snaps an arbitrary pixel coordinate to the nearest cell center on the Stage.
   */
  public snapPixelToGrid(pixel: PixelCoord): PixelCoord {
    const cube = this.pixelToCube(pixel);
    return this.cubeToPixel(cube);
  }

  /**
   * Forces fractional hex coordinates into perfect integers.
   * Resolves rounding conflicts by comparing the largest coordinate delta.
   */
  private cubeRound(fracQ: number, fracR: number, fracS: number): CubeCoord {
    let q = Math.round(fracQ);
    let r = Math.round(fracR);
    let s = Math.round(fracS);

    const qDiff = Math.abs(q - fracQ);
    const rDiff = Math.abs(r - fracR);
    const sDiff = Math.abs(s - fracS);

    if (qDiff > rDiff && qDiff > sDiff) {
      q = -r - s;
    } else if (rDiff > sDiff) {
      r = -q - s;
    } else {
      s = -q - r;
    }

    return { q, r, s };
  }

  /**
   * Calculates the discrete cell distance between two logical coordinates.
   */
  public calculateCellDistance(a: CubeCoord, b: CubeCoord): number {
    if (this.gridType === GridType.Square) {
      // Chebyshev distance for standard 8-way diagonal/cardinal tactical movement
      return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r));
    } else {
      // Cube distance for hexes (sum of absolute differences / 2)
      return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
    }
  }

  /**
   * Calculates the in-game distance in feet based on active Grid Scale Tier.
   */
  public calculateWorldDistanceFt(a: CubeCoord, b: CubeCoord): number {
    const cellDist = this.calculateCellDistance(a, b);
    return cellDist * this.scaleConfig.feetPerCell;
  }

  /**
   * Formats a distance into human-readable tactical units (e.g. "30 ft", "2.5 km", "1.4 AU").
   */
  public formatDistance(cellDistance: number): string {
    const ft = cellDistance * this.scaleConfig.feetPerCell;
    
    if (this.scaleTier === GridScaleTier.Encounter || this.scaleTier === GridScaleTier.Overland) {
      return `${ft.toLocaleString()} ft`;
    } else if (this.scaleTier === GridScaleTier.Planetary || this.scaleTier === GridScaleTier.Interplanetary) {
      const km = ft / 3280.84;
      return `${km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
    } else if (this.scaleTier === GridScaleTier.StarSystem) {
      const au = ft / 4.908e11;
      return `${au.toLocaleString(undefined, { maximumFractionDigits: 2 })} AU`;
    } else {
      const ly = ft / 3.104e16;
      return `${ly.toLocaleString(undefined, { maximumFractionDigits: 2 })} LY`;
    }
  }
}
