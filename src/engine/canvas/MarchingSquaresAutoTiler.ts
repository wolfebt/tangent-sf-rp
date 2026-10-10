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

  /**
   * High-performance matrix generator: computes 8-bit bitmasks (including diagonals) across an entire grid.
   */
  public static calculateGridBitmasks8Bit(
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

        bitmasks[r][c] = this.calculateBitmask8Bit(c, r, getCell, isSame);
      }
    }

    return bitmasks;
  }

  /**
   * Generates a closed Marching Squares contour polygon for a cell.
   * Eliminates harsh 90° right angles by generating 45° beveled transitions on outer and inner corners.
   */
  public static getMarchingPolygonPoints(
    x: number,
    y: number,
    width: number,
    height: number,
    bitmask4Bit: number,
    bitmask8Bit: number = 0,
    bevelRatio: number = 0.5
  ): number[] {
    const n = (bitmask4Bit & 1) !== 0;
    const e = (bitmask4Bit & 2) !== 0;
    const s = (bitmask4Bit & 4) !== 0;
    const w = (bitmask4Bit & 8) !== 0;

    const ne = (bitmask8Bit & 2) !== 0;
    const se = (bitmask8Bit & 8) !== 0;
    const sw = (bitmask8Bit & 32) !== 0;
    const nw = (bitmask8Bit & 128) !== 0;

    const x0 = x;
    const x1 = x + width * bevelRatio;
    const x2 = x + width - width * bevelRatio;
    const x3 = x + width;

    const y0 = y;
    const y1 = y + height * bevelRatio;
    const y2 = y + height - height * bevelRatio;
    const y3 = y + height;

    const rawPts: number[] = [];

    // 1. Top-Left Corner
    if (!n && !w) {
      rawPts.push(x0, y1);
      rawPts.push(x1, y0);
    } else if (n && w && !nw) {
      rawPts.push(x0, y0 + height * 0.25);
      rawPts.push(x0 + width * 0.25, y0);
    } else {
      rawPts.push(x0, y0);
    }

    // 2. Top-Right Corner
    if (!n && !e) {
      rawPts.push(x2, y0);
      rawPts.push(x3, y1);
    } else if (n && e && !ne) {
      rawPts.push(x3 - width * 0.25, y0);
      rawPts.push(x3, y0 + height * 0.25);
    } else {
      rawPts.push(x3, y0);
    }

    // 3. Bottom-Right Corner
    if (!s && !e) {
      rawPts.push(x3, y2);
      rawPts.push(x2, y3);
    } else if (s && e && !se) {
      rawPts.push(x3, y3 - height * 0.25);
      rawPts.push(x3 - width * 0.25, y3);
    } else {
      rawPts.push(x3, y3);
    }

    // 4. Bottom-Left Corner
    if (!s && !w) {
      rawPts.push(x1, y3);
      rawPts.push(x0, y2);
    } else if (s && w && !sw) {
      rawPts.push(x0 + width * 0.25, y3);
      rawPts.push(x0, y3 - height * 0.25);
    } else {
      rawPts.push(x0, y3);
    }

    // Deduplicate consecutive identical vertices
    const cleanPts: number[] = [];
    for (let i = 0; i < rawPts.length; i += 2) {
      const px = rawPts[i];
      const py = rawPts[i + 1];
      const lastX = cleanPts[cleanPts.length - 2];
      const lastY = cleanPts[cleanPts.length - 1];
      if (lastX === undefined || Math.abs(px - lastX) > 0.001 || Math.abs(py - lastY) > 0.001) {
        cleanPts.push(px, py);
      }
    }

    // Pop closing vertex if equal to first
    if (cleanPts.length >= 4) {
      const firstX = cleanPts[0];
      const firstY = cleanPts[1];
      const lastX = cleanPts[cleanPts.length - 2];
      const lastY = cleanPts[cleanPts.length - 1];
      if (Math.abs(firstX - lastX) < 0.001 && Math.abs(firstY - lastY) < 0.001) {
        cleanPts.pop();
        cleanPts.pop();
      }
    }

    return cleanPts;
  }

  /**
   * Generates contour line segments along the exterior perimeter where the cell
   * meets non-matching boundaries (e.g. wall or empty space), accounting for beveled corners.
   */
  public static getMarchingContourLines(
    x: number,
    y: number,
    width: number,
    height: number,
    bitmask4Bit: number,
    bitmask8Bit: number = 0,
    bevelRatio: number = 0.5
  ): Array<[number, number, number, number]> {
    const lines: Array<[number, number, number, number]> = [];

    const n = (bitmask4Bit & 1) !== 0;
    const e = (bitmask4Bit & 2) !== 0;
    const s = (bitmask4Bit & 4) !== 0;
    const w = (bitmask4Bit & 8) !== 0;

    const ne = (bitmask8Bit & 2) !== 0;
    const se = (bitmask8Bit & 8) !== 0;
    const sw = (bitmask8Bit & 32) !== 0;
    const nw = (bitmask8Bit & 128) !== 0;

    const x0 = x;
    const x1 = x + width * bevelRatio;
    const x2 = x + width - width * bevelRatio;
    const x3 = x + width;

    const y0 = y;
    const y1 = y + height * bevelRatio;
    const y2 = y + height - height * bevelRatio;
    const y3 = y + height;

    const tlOuter = !n && !w;
    const trOuter = !n && !e;
    const brOuter = !s && !e;
    const blOuter = !s && !w;

    // North outer bevel
    if (tlOuter) {
      lines.push([x0, y1, x1, y0]);
    }
    // North straight edge
    if (!n) {
      const startX = tlOuter ? x1 : x0;
      const endX = trOuter ? x2 : x3;
      if (endX > startX) {
        lines.push([startX, y0, endX, y0]);
      }
    }
    // East outer bevel
    if (trOuter) {
      lines.push([x2, y0, x3, y1]);
    }
    // East straight edge
    if (!e) {
      const startY = trOuter ? y1 : y0;
      const endY = brOuter ? y2 : y3;
      if (endY > startY) {
        lines.push([x3, startY, x3, endY]);
      }
    }
    // South outer bevel
    if (brOuter) {
      lines.push([x3, y2, x2, y3]);
    }
    // South straight edge
    if (!s) {
      const startX = brOuter ? x2 : x3;
      const endX = blOuter ? x1 : x0;
      if (startX > endX) {
        lines.push([startX, y3, endX, y3]);
      }
    }
    // West outer bevel
    if (blOuter) {
      lines.push([x1, y3, x0, y2]);
    }
    // West straight edge
    if (!w) {
      const startY = blOuter ? y2 : y3;
      const endY = tlOuter ? y1 : y0;
      if (startY > endY) {
        lines.push([x0, startY, x0, endY]);
      }
    }

    // Inner Corner Diagonal Notches
    if (n && w && !nw) {
      lines.push([x0, y0 + height * 0.25, x0 + width * 0.25, y0]);
    }
    if (n && e && !ne) {
      lines.push([x3 - width * 0.25, y0, x3, y0 + height * 0.25]);
    }
    if (s && e && !se) {
      lines.push([x3, y3 - height * 0.25, x3 - width * 0.25, y3]);
    }
    if (s && w && !sw) {
      lines.push([x0 + width * 0.25, y3, x0, y3 - height * 0.25]);
    }

    return lines;
  }
}
