/**
 * @file CellularAutomataCaverns.ts
 * @description Deterministic cellular automata algorithm for generating organic caverns and alien burrows.
 */

export interface CavernConfig {
  width: number;
  height: number;
  fillProbability?: number; // Initial wall density (default 0.45)
  smoothIterations?: number; // Number of cellular automata passes (default 4)
  connectPockets?: boolean;  // Connect disconnected cavern pockets
}

export class CellularAutomataCaverns {
  /**
   * Generates a 2D boolean array where true = floor, false = solid rock wall.
   */
  public static generateCavern(config: CavernConfig, randomFn: () => number = Math.random): boolean[][] {
    const { width, height, fillProbability = 0.45, smoothIterations = 4 } = config;

    // 1. Initialize random grid
    let grid: boolean[][] = [];
    for (let r = 0; r < height; r++) {
      grid[r] = [];
      for (let c = 0; c < width; c++) {
        // Force edges to be solid rock
        if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
          grid[r][c] = false;
        } else {
          // true = floor, false = wall
          grid[r][c] = randomFn() > fillProbability;
        }
      }
    }

    // 2. Run smoothing iterations (standard 4-5 rule)
    for (let iter = 0; iter < smoothIterations; iter++) {
      const nextGrid: boolean[][] = [];
      for (let r = 0; r < height; r++) {
        nextGrid[r] = [];
        for (let c = 0; c < width; c++) {
          if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
            nextGrid[r][c] = false;
            continue;
          }

          const wallCount = this.countSurroundingWalls(grid, c, r, width, height);

          // If surrounded by 5 or more walls, become a wall
          if (wallCount >= 5) {
            nextGrid[r][c] = false;
          } else if (wallCount <= 3) {
            nextGrid[r][c] = true;
          } else {
            nextGrid[r][c] = grid[r][c];
          }
        }
      }
      grid = nextGrid;
    }

    return grid;
  }

  private static countSurroundingWalls(
    grid: boolean[][],
    col: number,
    row: number,
    width: number,
    height: number
  ): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nc = col + dc;
        const nr = row + dr;
        if (nc < 0 || nc >= width || nr < 0 || nr >= height) {
          count++; // Out of bounds counts as wall
        } else if (!grid[nr][nc]) {
          count++;
        }
      }
    }
    return count;
  }
}
