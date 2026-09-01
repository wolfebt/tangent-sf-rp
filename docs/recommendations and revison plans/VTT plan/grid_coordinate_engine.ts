/**
 * @file CoordinateEngine.ts
 * @description Stage 2.4: Grid mathematics and pathfinding integration.
 * Handles the bidirectional translation of absolute PixiJS pixel space into 
 * strict Tangent logical grid mechanics (Cube Coordinates for Hex, Axial for Square).
 * Eliminates floating-point drift for token snapping.
 */

export enum GridType {
  Square = 'SQUARE',
  HexFlatTop = 'HEX_FLAT_TOP',
  HexPointyTop = 'HEX_POINTY_TOP'
}

// Tangent specific mechanics: 1 Standard Cell = 30ft 
// Pixels Per Inch (PPI) scaling defines how many pixels represent a 5ft unit.
// Default assumes a standard 70px per 5ft scale, thus 1 Hex (30ft) = 420px.
export const TANGENT_SCALE_FT = 30;

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
  private cellSizePx: number; // The radius of the hex, or half-width of square

  constructor(type: GridType, pixelsPerCell: number) {
    this.gridType = type;
    this.cellSizePx = pixelsPerCell;
  }

  /**
   * Converts a logical Hex Cube Coordinate to absolute PixiJS Pixel space.
   */
  public cubeToPixel(hex: CubeCoord): PixelCoord {
    let x = 0;
    let y = 0;

    if (this.gridType === GridType.HexFlatTop) {
      x = this.cellSizePx * (3.0 / 2.0 * hex.q);
      y = this.cellSizePx * (Math.sqrt(3) / 2.0 * hex.q + Math.sqrt(3) * hex.r);
    } else if (this.gridType === GridType.HexPointyTop) {
      x = this.cellSizePx * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2.0 * hex.r);
      y = this.cellSizePx * (3.0 / 2.0 * hex.r);
    } else {
      // Fallback for square grid
      x = hex.q * this.cellSizePx;
      y = hex.r * this.cellSizePx;
    }

    return { x, y };
  }

  /**
   * Translates an arbitrary mouse click (pixel space) into a strict Hex Cube Coordinate.
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
   * Calculates the absolute distance between two logical coordinates.
   * Useful for A* Pathfinding heuristics and Tangent weapon range verification.
   */
  public calculateDistance(a: CubeCoord, b: CubeCoord): number {
    if (this.gridType === GridType.Square) {
      // Chebyshev distance for standard 8-way square grid movement
      return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r));
    } else {
      // Cube distance for hexes (max absolute difference between axes)
      return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
    }
  }
}