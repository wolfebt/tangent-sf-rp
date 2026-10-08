/**
 * @file NodeGraphLayoutSolver.ts
 * @description Translates functional story flowcharts (nodes & edges) into spatial rooms and carved corridors.
 */

export interface StoryFlowNode {
  id: string;
  name: string;
  widthCells?: number;
  heightCells?: number;
}

export interface StoryFlowEdge {
  fromNodeId: string;
  toNodeId: string;
  doorType?: 'sliding' | 'bulkhead' | 'open';
}

export interface PlacedRoom {
  nodeId: string;
  name: string;
  bounds: {
    col: number;
    row: number;
    width: number;
    height: number;
  };
}

export interface CarvedHallway {
  fromNodeId: string;
  toNodeId: string;
  cells: Array<[number, number]>;
}

export class NodeGraphLayoutSolver {
  /**
   * Resolves a story node graph into non-overlapping spatial rooms connected by corridors.
   */
  public static solveLayout(
    mapWidth: number,
    mapHeight: number,
    nodes: StoryFlowNode[],
    edges: StoryFlowEdge[]
  ): {
    rooms: PlacedRoom[];
    hallways: CarvedHallway[];
    grid: boolean[][]; // true = floor, false = wall
  } {
    const grid: boolean[][] = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(false));
    const rooms: PlacedRoom[] = [];
    const roomMap = new Map<string, PlacedRoom>();

    // 1. Spatially place rooms in a linear / clustered arrangement with margin
    const margin = 2;
    let currentCol = margin;
    let currentRow = margin;
    let maxRowHeight = 0;

    for (const node of nodes) {
      const w = Math.min(mapWidth - 4, Math.max(3, node.widthCells || 6));
      const h = Math.min(mapHeight - 4, Math.max(3, node.heightCells || 6));

      // If exceeding row width, wrap to next line
      if (currentCol + w + margin >= mapWidth) {
        currentCol = margin;
        currentRow += maxRowHeight + margin + 1;
        maxRowHeight = 0;
      }

      // If exceeding map height, clamp
      const clampedRow = Math.min(mapHeight - h - margin, currentRow);
      const clampedCol = Math.min(mapWidth - w - margin, currentCol);

      const placed: PlacedRoom = {
        nodeId: node.id,
        name: node.name,
        bounds: {
          col: clampedCol,
          row: clampedRow,
          width: w,
          height: h
        }
      };

      rooms.push(placed);
      roomMap.set(node.id, placed);

      // Carve floor in grid
      for (let r = clampedRow; r < clampedRow + h; r++) {
        for (let c = clampedCol; c < clampedCol + w; c++) {
          if (r >= 0 && r < mapHeight && c >= 0 && c < mapWidth) {
            grid[r][c] = true;
          }
        }
      }

      currentCol += w + margin + 2;
      maxRowHeight = Math.max(maxRowHeight, h);
    }

    // 2. Carve corridors for each edge
    const hallways: CarvedHallway[] = [];

    for (const edge of edges) {
      const fromRoom = roomMap.get(edge.fromNodeId);
      const toRoom = roomMap.get(edge.toNodeId);

      if (!fromRoom || !toRoom) continue;

      const fromCenter: [number, number] = [
        Math.floor(fromRoom.bounds.col + fromRoom.bounds.width / 2),
        Math.floor(fromRoom.bounds.row + fromRoom.bounds.height / 2)
      ];

      const toCenter: [number, number] = [
        Math.floor(toRoom.bounds.col + toRoom.bounds.width / 2),
        Math.floor(toRoom.bounds.row + toRoom.bounds.height / 2)
      ];

      // L-shaped hallway
      const hallCells: Array<[number, number]> = [];

      // Move horizontally first
      const xStart = Math.min(fromCenter[0], toCenter[0]);
      const xEnd = Math.max(fromCenter[0], toCenter[0]);
      for (let c = xStart; c <= xEnd; c++) {
        grid[fromCenter[1]][c] = true;
        hallCells.push([c, fromCenter[1]]);
      }

      // Move vertically second
      const yStart = Math.min(fromCenter[1], toCenter[1]);
      const yEnd = Math.max(fromCenter[1], toCenter[1]);
      for (let r = yStart; r <= yEnd; r++) {
        grid[r][toCenter[0]] = true;
        hallCells.push([toCenter[0], r]);
      }

      hallways.push({
        fromNodeId: edge.fromNodeId,
        toNodeId: edge.toNodeId,
        cells: hallCells
      });
    }

    return {
      rooms,
      hallways,
      grid
    };
  }
}
