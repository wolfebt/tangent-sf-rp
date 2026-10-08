/**
 * @file MarchingSquaresAutoTiler.ts
 * @description 4-bit and 8-bit Marching Squares bitmask auto-tiling algorithm for seamless biome transitions.
 */

export interface GridCell {
  col: number;
  row: number;
  materialId?: string;
  unitId?: string;
}

export type NeighborPredicate = (cell: GridCell | undefined) => boolean;

export interface CardinalNeighbors {
  north: boolean;
  east: boolean;
  south: boolean;
  west: boolean;
}

export class MarchingSquaresAutoTiler {
  /**
   * Computes 4-bit cardinal neighbor bitmask.
   * North = 1, East = 2, South = 4, West = 8.
   * Returns integer between 0 and 15.
   */
  public static calculateBitmask4Bit(
    col: number,
    row: number,
    getCell: (c: number, r: number) => GridCell | undefined,
    isSameMaterial: NeighborPredicate
  ): number {
    let mask = 0;

    // North (y - 1)
    if (isSameMaterial(getCell(col, row - 1))) mask |= 1;
    // East (x + 1)
    if (isSameMaterial(getCell(col + 1, row))) mask |= 2;
    // South (y + 1)
    if (isSameMaterial(getCell(col, row + 1))) mask |= 4;
    // West (x - 1)
    if (isSameMaterial(getCell(col - 1, row))) mask |= 8;

    return mask;
  }

  /**
   * Computes 8-bit neighbor bitmask with diagonal awareness.
   * N=1, NE=2, E=4, SE=8, S=16, SW=32, W=64, NW=128.
   */
  public static calculateBitmask8Bit(
    col: number,
    row: number,
    getCell: (c: number, r: number) => GridCell | undefined,
    isSameMaterial: NeighborPredicate
  ): number {
    let mask = 0;

    const n = isSameMaterial(getCell(col, row - 1));
    const e = isSameMaterial(getCell(col + 1, row));
    const s = isSameMaterial(getCell(col, row + 1));
    const w = isSameMaterial(getCell(col - 1, row));

    if (n) mask |= 1;
    if (n && e && isSameMaterial(getCell(col + 1, row - 1))) mask |= 2;
    if (e) mask |= 4;
    if (s && e && isSameMaterial(getCell(col + 1, row + 1))) mask |= 8;
    if (s) mask |= 16;
    if (s && w && isSameMaterial(getCell(col - 1, row + 1))) mask |= 32;
    if (w) mask |= 64;
    if (n && w && isSameMaterial(getCell(col - 1, row - 1))) mask |= 128;

    return mask;
  }

  /**
   * Selects an appropriate texture index or variant from an asset's variant list based on bitmask.
   */
  public static resolveSpriteIndex(bitmask: number, totalVariants: number = 16): number {
    if (totalVariants <= 1) return 0;
    // Direct 1-to-1 map if 16 variants provided
    if (totalVariants === 16) {
      return bitmask;
    }
    // Modulo fallback
    return bitmask % totalVariants;
  }

  /**
   * Extracts cardinal flags from a 4-bit bitmask.
   */
  public static getCardinalNeighbors(bitmask4Bit: number): CardinalNeighbors {
    return {
      north: (bitmask4Bit & 1) !== 0,
      east: (bitmask4Bit & 2) !== 0,
      south: (bitmask4Bit & 4) !== 0,
      west: (bitmask4Bit & 8) !== 0
    };
  }

  /**
   * Generates line segments [x1, y1, x2, y2] for exterior cell borders where
   * neighbor is absent (e.g. wall/floor boundary or biome boundary).
   */
  public static getEdgeLines(
    x: number,
    y: number,
    width: number,
    height: number,
    bitmask4Bit: number
  ): Array<[number, number, number, number]> {
    const lines: Array<[number, number, number, number]> = [];

    // North border
    if ((bitmask4Bit & 1) === 0) {
      lines.push([x, y, x + width, y]);
    }
    // East border
    if ((bitmask4Bit & 2) === 0) {
      lines.push([x + width, y, x + width, y + height]);
    }
    // South border
    if ((bitmask4Bit & 4) === 0) {
      lines.push([x, y + height, x + width, y + height]);
    }
    // West border
    if ((bitmask4Bit & 8) === 0) {
      lines.push([x, y, x, y + height]);
    }

    return lines;
  }

  /**
   * High-performance matrix generator: computes 4-bit bitmasks across an entire grid.
   */
  public static calculateGridBitmasks(
    cols: number,
    rows: number,
    getCellMaterial: (c: number, r: number) => string | undefined
  ): number[][] {
    const bitmasks: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const currentMat = getCellMaterial(c, r);
        if (!currentMat) {
          bitmasks[r][c] = 0;
          continue;
        }

        const getCell = (col: number, row: number): GridCell | undefined => {
          if (col < 0 || col >= cols || row < 0 || row >= rows) return undefined;
          const mat = getCellMaterial(col, row);
          return mat ? { col, row, materialId: mat } : undefined;
        };

        const isSame = (neighbor: GridCell | undefined): boolean => {
          return neighbor !== undefined && neighbor.materialId === currentMat;
        };

        bitmasks[r][c] = this.calculateBitmask4Bit(c, r, getCell, isSame);
      }
    }

    return bitmasks;
  }
}
