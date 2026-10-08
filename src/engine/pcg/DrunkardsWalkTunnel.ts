/**
 * @file DrunkardsWalkTunnel.ts
 * @description Drunkard's Walk (random walk) algorithm for carving natural mine shafts and winding tunnels.
 */

export interface DrunkardConfig {
  width: number;
  height: number;
  targetFloorRatio?: number; // 0.1 to 0.5 (default 0.3)
  startCol?: number;
  startRow?: number;
  straightBias?: number;     // 0.0 to 1.0 (preference to keep moving forward)
}

export class DrunkardsWalkTunnel {
  /**
   * Generates a tunnel network where true = floor, false = solid rock wall.
   */
  public static generateTunnel(config: DrunkardConfig, randomFn: () => number = Math.random): boolean[][] {
    const { width, height, targetFloorRatio = 0.3, straightBias = 0.4 } = config;

    // Initialize solid rock
    const grid: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));

    let col = config.startCol !== undefined ? config.startCol : Math.floor(width / 2);
    let row = config.startRow !== undefined ? config.startRow : Math.floor(height / 2);

    col = Math.max(1, Math.min(width - 2, col));
    row = Math.max(1, Math.min(height - 2, row));

    // Carve initial tile
    grid[row][col] = true;
    let floorCount = 1;
    const targetFloorCount = Math.floor(width * height * targetFloorRatio);

    const directions = [
      { dc: 0, dr: -1 }, // North
      { dc: 1, dr: 0 },  // East
      { dc: 0, dr: 1 },  // South
      { dc: -1, dr: 0 }  // West
    ];

    let currentDir = directions[Math.floor(randomFn() * directions.length)];
    let steps = 0;
    const maxSteps = targetFloorCount * 10;

    while (floorCount < targetFloorCount && steps < maxSteps) {
      steps++;

      // Change direction with probability
      if (randomFn() > straightBias) {
        currentDir = directions[Math.floor(randomFn() * directions.length)];
      }

      const nextCol = col + currentDir.dc;
      const nextRow = row + currentDir.dr;

      // Keep inside border walls
      if (nextCol >= 1 && nextCol < width - 1 && nextRow >= 1 && nextRow < height - 1) {
        col = nextCol;
        row = nextRow;

        if (!grid[row][col]) {
          grid[row][col] = true;
          floorCount++;
        }
      } else {
        // Hit edge, force pick new direction
        currentDir = directions[Math.floor(randomFn() * directions.length)];
      }
    }

    return grid;
  }
}
