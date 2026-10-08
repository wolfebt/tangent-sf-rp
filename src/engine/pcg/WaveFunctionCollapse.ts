/**
 * @file WaveFunctionCollapse.ts
 * @description Wave Function Collapse (WFC) solver using socket-based adjacency matrices for modular facility rooms.
 */

export interface TilePrototype {
  id: string;
  name: string;
  weight?: number; // Higher weight = more frequent selection
  sockets: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

export class WaveFunctionCollapse {
  /**
   * Runs the WFC algorithm to fill a grid with compatible tile IDs.
   */
  public static solve(
    width: number,
    height: number,
    prototypes: TilePrototype[],
    randomFn: () => number = Math.random
  ): (string | null)[][] {
    if (prototypes.length === 0 || width <= 0 || height <= 0) {
      return Array.from({ length: height }, () => Array(width).fill(null));
    }

    // 1. Initialize wave matrix with all possible candidates per cell
    const wave: Set<string>[][] = [];
    for (let r = 0; r < height; r++) {
      wave[r] = [];
      for (let c = 0; c < width; c++) {
        wave[r][c] = new Set(prototypes.map(p => p.id));
      }
    }

    const protoMap = new Map<string, TilePrototype>(prototypes.map(p => [p.id, p]));

    // 2. Iteration loop
    const totalCells = width * height;
    for (let iter = 0; iter < totalCells; iter++) {
      // Find cell with minimum entropy > 1
      let minEntropy = Infinity;
      let minCoord: [number, number] | null = null;

      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          const size = wave[r][c].size;
          if (size > 1 && size < minEntropy) {
            minEntropy = size;
            minCoord = [c, r];
          }
        }
      }

      // If no cell has entropy > 1, grid is fully collapsed!
      if (!minCoord) break;

      const [targetCol, targetRow] = minCoord;
      const candidates = Array.from(wave[targetRow][targetCol]);

      // Weighted random selection
      const chosenId = this.pickWeightedCandidate(candidates, protoMap, randomFn);
      wave[targetRow][targetCol] = new Set([chosenId]);

      // Propagate constraints
      this.propagate(targetCol, targetRow, width, height, wave, protoMap);
    }

    // 3. Format result
    const result: (string | null)[][] = [];
    for (let r = 0; r < height; r++) {
      result[r] = [];
      for (let c = 0; c < width; c++) {
        const remaining = Array.from(wave[r][c]);
        result[r][c] = remaining.length === 1 ? remaining[0] : null;
      }
    }

    return result;
  }

  private static pickWeightedCandidate(
    candidates: string[],
    protoMap: Map<string, TilePrototype>,
    randomFn: () => number
  ): string {
    const totalWeight = candidates.reduce((sum, id) => sum + (protoMap.get(id)?.weight || 1), 0);
    let threshold = randomFn() * totalWeight;

    for (const id of candidates) {
      const w = protoMap.get(id)?.weight || 1;
      threshold -= w;
      if (threshold <= 0) return id;
    }
    return candidates[0];
  }

  private static propagate(
    startCol: number,
    startRow: number,
    width: number,
    height: number,
    wave: Set<string>[][],
    protoMap: Map<string, TilePrototype>
  ): void {
    const queue: [number, number][] = [[startCol, startRow]];

    while (queue.length > 0) {
      const [col, row] = queue.shift()!;
      const currentCandidates = Array.from(wave[row][col]);

      // Check all 4 neighbors
      const neighbors = [
        { c: col, r: row - 1, dir: 'top' as const, opp: 'bottom' as const },
        { c: col + 1, r: row, dir: 'right' as const, opp: 'left' as const },
        { c: col, r: row + 1, dir: 'bottom' as const, opp: 'top' as const },
        { c: col - 1, r: row, dir: 'left' as const, opp: 'right' as const }
      ];

      for (const n of neighbors) {
        if (n.c < 0 || n.c >= width || n.r < 0 || n.r >= height) continue;

        const neighborSet = wave[n.r][n.c];
        if (neighborSet.size <= 1) continue; // Already collapsed

        // Calculate allowed sockets in this direction from current candidates
        const allowedSockets = new Set<string>();
        for (const currentId of currentCandidates) {
          const proto = protoMap.get(currentId);
          if (proto) {
            allowedSockets.add(proto.sockets[n.dir]);
          }
        }

        // Filter neighbor candidates: neighbor must have opposite socket in allowedSockets
        let reduced = false;
        for (const neighborId of Array.from(neighborSet)) {
          const nProto = protoMap.get(neighborId);
          if (!nProto || !allowedSockets.has(nProto.sockets[n.opp])) {
            neighborSet.delete(neighborId);
            reduced = true;
          }
        }

        if (reduced) {
          queue.push([n.c, n.r]);
        }
      }
    }
  }
}
