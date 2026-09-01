/**
 * @file BVHBuilder.ts
 * @description Stage 3.2: CPU-side Bounding Volume Hierarchy (BVH) construction.
 * Pre-culls line-of-sight walls and dynamic doors using an optimized spatial binary tree,
 * preventing the GPU from testing millions of unnecessary ray intersections during complex Stage encounters.
 */

export interface Point2D { 
  x: number; 
  y: number; 
}

export interface WallSegment {
  id: string;
  p1: Point2D;
  p2: Point2D;
  isDynamic?: boolean; // e.g. doors/bulkheads that can open, close, breach, or seal
  isOpen?: boolean;    // When open, the wall is non-occluding
}

export interface AABB {
  minX: number; 
  minY: number;
  maxX: number; 
  maxY: number;
}

// A node in the binary spatial tree
export class BVHNode {
  bounds: AABB;
  left: BVHNode | null = null;
  right: BVHNode | null = null;
  walls: WallSegment[] = [];
  
  constructor(bounds: AABB) {
    this.bounds = bounds;
  }
}

export class BVHBuilder {
  private root: BVHNode | null = null;
  private maxWallsPerLeaf: number = 4;
  private rawWalls: WallSegment[] = [];

  /**
   * Generates a bounding box that perfectly encapsulates a single line segment.
   */
  private getWallAABB(wall: WallSegment): AABB {
    return {
      minX: Math.min(wall.p1.x, wall.p2.x),
      minY: Math.min(wall.p1.y, wall.p2.y),
      maxX: Math.max(wall.p1.x, wall.p2.x),
      maxY: Math.max(wall.p1.y, wall.p2.y),
    };
  }

  /**
   * Expands a bounding box to include another bounding box.
   */
  private mergeAABB(a: AABB, b: AABB): AABB {
    return {
      minX: Math.min(a.minX, b.minX),
      minY: Math.min(a.minY, b.minY),
      maxX: Math.max(a.maxX, b.maxX),
      maxY: Math.max(a.maxY, b.maxY),
    };
  }

  /**
   * Constructs the BVH from a raw array of wall segments.
   */
  public build(walls: WallSegment[]) {
    this.rawWalls = [...walls];
    if (walls.length === 0) {
      this.root = null;
      return;
    }
    
    // Filter out active open doors from occluding tree
    const activeWalls = walls.filter(w => !w.isOpen);
    if (activeWalls.length === 0) {
      this.root = null;
      return;
    }

    this.root = this.split([...activeWalls]);
  }

  /**
   * Toggles a dynamic door state (open/closed) and rebuilds the BVH tree.
   */
  public setDoorState(doorId: string, isOpen: boolean) {
    let changed = false;
    for (const wall of this.rawWalls) {
      if (wall.id === doorId && wall.isDynamic) {
        wall.isOpen = isOpen;
        changed = true;
      }
    }
    if (changed) {
      this.build(this.rawWalls);
    }
  }

  /**
   * Recursively splits walls into left and right child nodes along the longest axis.
   */
  private split(walls: WallSegment[]): BVHNode {
    let globalBounds = this.getWallAABB(walls[0]);
    for (let i = 1; i < walls.length; i++) {
      globalBounds = this.mergeAABB(globalBounds, this.getWallAABB(walls[i]));
    }

    const node = new BVHNode(globalBounds);

    // Leaf node condition
    if (walls.length <= this.maxWallsPerLeaf) {
      node.walls = walls;
      return node;
    }

    // Find longest axis to split along (X or Y)
    const spanX = globalBounds.maxX - globalBounds.minX;
    const spanY = globalBounds.maxY - globalBounds.minY;

    if (spanX > spanY) {
      walls.sort((a, b) => ((a.p1.x + a.p2.x) / 2) - ((b.p1.x + b.p2.x) / 2));
    } else {
      walls.sort((a, b) => ((a.p1.y + a.p2.y) / 2) - ((b.p1.y + b.p2.y) / 2));
    }

    const mid = Math.floor(walls.length / 2);
    const leftWalls = walls.slice(0, mid);
    const rightWalls = walls.slice(mid);

    node.left = this.split(leftWalls);
    node.right = this.split(rightWalls);

    return node;
  }

  /**
   * Queries the BVH using an operative's vision radius.
   * Rapidly rejects entire wings of the Stage that are too far away to cast shadows.
   */
  public queryRadius(centerX: number, centerY: number, radius: number): WallSegment[] {
    if (!this.root) return [];
    
    const result: WallSegment[] = [];
    const queryAABB: AABB = {
      minX: centerX - radius,
      minY: centerY - radius,
      maxX: centerX + radius,
      maxY: centerY + radius,
    };

    this.traverse(this.root, queryAABB, result);
    return result;
  }

  private traverse(node: BVHNode | null, queryBox: AABB, result: WallSegment[]) {
    if (!node) return;

    // Fast AABB intersection check
    if (queryBox.maxX < node.bounds.minX || queryBox.minX > node.bounds.maxX ||
        queryBox.maxY < node.bounds.minY || queryBox.minY > node.bounds.maxY) {
      return; // Prune branch
    }

    if (node.walls.length > 0) {
      result.push(...node.walls);
    } else {
      this.traverse(node.left, queryBox, result);
      this.traverse(node.right, queryBox, result);
    }
  }

  /**
   * Flattens queried walls into a Float32Array suitable for the 
   * WGSLComputeContext to upload to the GPU. (Format: p1.x, p1.y, p2.x, p2.y)
   */
  public flattenForGPU(walls: WallSegment[]): Float32Array {
    // 4 floats per wall segment (x1, y1, x2, y2) -> perfectly matches 16-byte WebGPU alignment
    const buffer = new Float32Array(walls.length * 4);
    
    for (let i = 0; i < walls.length; i++) {
      const offset = i * 4;
      buffer[offset] = walls[i].p1.x;
      buffer[offset + 1] = walls[i].p1.y;
      buffer[offset + 2] = walls[i].p2.x;
      buffer[offset + 3] = walls[i].p2.y;
    }
    
    return buffer;
  }

  public getRawWalls(): WallSegment[] {
    return this.rawWalls;
  }
}
