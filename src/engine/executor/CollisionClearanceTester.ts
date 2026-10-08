/**
 * @file CollisionClearanceTester.ts
 * @description Fast 2D spatial collision, boundary, and doorway clearance tester.
 * Ensures procedural placements do not block doors, intersect impassable bulkheads,
 * or violate frozen region locks.
 */

import { SemanticZoneMask, SemanticFlag } from './SemanticZoneMask.ts';

export interface ClearanceTestOptions {
  clearanceRadiusCells?: number;   // Minimum distance to maintain from doorways
  allowHazardOverlap?: boolean;    // Allow placement over hazard zones
  allowCoverOverlap?: boolean;     // Allow placement over existing cover
  requireWalkableFloor?: boolean;  // Must have FLOOR flag
}

export interface ClearanceTestResult {
  allowed: boolean;
  reason?: string;
  violatingCell?: [number, number];
}

export class CollisionClearanceTester {
  /**
   * Tests whether an asset unit can be placed at [col, row] with footprint [widthCells, heightCells].
   */
  public static testPlacement(
    mask: SemanticZoneMask,
    col: number,
    row: number,
    widthCells: number = 1,
    heightCells: number = 1,
    options: ClearanceTestOptions = {}
  ): ClearanceTestResult {
    const {
      clearanceRadiusCells = 1,
      allowHazardOverlap = false,
      allowCoverOverlap = false,
      requireWalkableFloor = true
    } = options;

    // 1. Boundary Check
    if (col < 0 || row < 0 || col + widthCells > mask.width || row + heightCells > mask.height) {
      return { allowed: false, reason: 'Out of bounds' };
    }

    // 2. Footprint Cell-by-Cell Checks
    for (let r = row; r < row + heightCells; r++) {
      for (let c = col; c < col + widthCells; c++) {
        const cellMask = mask.getMask(c, r);

        if (cellMask & SemanticFlag.FROZEN) {
          return { allowed: false, reason: 'Frozen region locked', violatingCell: [c, r] };
        }

        if (cellMask & SemanticFlag.WALL) {
          return { allowed: false, reason: 'Impassable wall collision', violatingCell: [c, r] };
        }

        if (cellMask & SemanticFlag.DOORWAY) {
          return { allowed: false, reason: 'Blocks doorway portal directly', violatingCell: [c, r] };
        }

        if (!allowHazardOverlap && (cellMask & SemanticFlag.HAZARD)) {
          return { allowed: false, reason: 'Hazard zone conflict', violatingCell: [c, r] };
        }

        if (!allowCoverOverlap && (cellMask & SemanticFlag.COVER)) {
          return { allowed: false, reason: 'Existing cover overlap', violatingCell: [c, r] };
        }

        if (requireWalkableFloor && !(cellMask & SemanticFlag.FLOOR)) {
          return { allowed: false, reason: 'Target cell is not walkable floor', violatingCell: [c, r] };
        }
      }
    }

    // 3. Doorway Clearance Buffer Check
    if (clearanceRadiusCells > 0) {
      const minC = Math.max(0, col - clearanceRadiusCells);
      const maxC = Math.min(mask.width - 1, col + widthCells - 1 + clearanceRadiusCells);
      const minR = Math.max(0, row - clearanceRadiusCells);
      const maxR = Math.min(mask.height - 1, row + heightCells - 1 + clearanceRadiusCells);

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          if (mask.hasFlag(c, r, SemanticFlag.DOORWAY)) {
            return {
              allowed: false,
              reason: `Violates doorway clearance radius of ${clearanceRadiusCells} cells`,
              violatingCell: [c, r]
            };
          }
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Scans a bounded zone and finds all valid placement coordinates for an asset footprint.
   */
  public static findValidPlacementCells(
    mask: SemanticZoneMask,
    zoneBounds: [number, number, number, number], // [minCol, minRow, maxCol, maxRow]
    widthCells: number = 1,
    heightCells: number = 1,
    options: ClearanceTestOptions = {}
  ): Array<[number, number]> {
    const [minCol, minRow, maxCol, maxRow] = zoneBounds;
    const validCells: Array<[number, number]> = [];

    const endCol = Math.min(mask.width - widthCells, maxCol - widthCells + 1);
    const endRow = Math.min(mask.height - heightCells, maxRow - heightCells + 1);

    for (let r = Math.max(0, minRow); r <= endRow; r++) {
      for (let c = Math.max(0, minCol); c <= endCol; c++) {
        const test = this.testPlacement(mask, c, r, widthCells, heightCells, options);
        if (test.allowed) {
          validCells.push([c, r]);
        }
      }
    }

    return validCells;
  }
}
