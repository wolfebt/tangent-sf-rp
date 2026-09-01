/**
 * @file BVHBuilder.ts
 * @description Stage 3.2: CPU-side Bounding Volume Hierarchy (BVH) construction.
 * Pre-culls line-of-sight walls using an optimized spatial tree, preventing the GPU 
 * from testing millions of unnecessary ray intersections during complex map encounters.
 */

export interface Point2D { x: number; y: number; }

export interface WallSegment {
  id: string;
  p1: Point2D;
  p2: Point2D;
  isDynamic: boolean; // e.g., doors that can open/close, or moving vehicles
}

export interface AABB {
  minX: number; minY: number;
  maxX: number; maxY: number;
}

// A node in the binary tree
class BVHNode {
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
  private maxWallsPerLeaf: number = 4; // Tuning parameter

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
   * Constructs the BVH from a raw array of wall segments (e.g., parsed from a DBM map).
   */
  public build(walls: WallSegment[]) {
    console.log(`[BVH Builder] Constructing tree for ${walls.length} walls...`);
    this.root = this.split(walls);
  }

  /**
   * Recursively splits walls into left and right child nodes.
   * For the sake of this engine module, we use a simplified median split along the longest axis,
   * standing in for a full Surface Area Heuristic (SAH) to balance build-time vs render-time.
   */
  private split(walls: WallSegment[]): BVHNode {
    // 1. Calculate the bounding box for all walls in this bucket
    let globalBounds = this.getWallAABB(walls[0]);
    for (let i = 1; i < walls.length; i++) {
      globalBounds = this.mergeAABB(globalBounds, this.getWallAABB(walls[i]));
    }

    const node = new BVHNode(globalBounds);

    // 2. Leaf node condition
    if (walls.length <= this.maxWallsPerLeaf) {
      node.walls = walls;
      return node;
    }

    // 3. Find the longest axis to split along (X or Y)
    const spanX = globalBounds.maxX - globalBounds.minX;
    const spanY = globalBounds.maxY - globalBounds.minY;

    // Sort walls based on their center point along the longest axis
    if (spanX > spanY) {
      walls.sort((a, b) => ((a.p1.x + a.p2.x) / 2) - ((b.p1.x + b.p2.x) / 2));
    } else {
      walls.sort((a, b) => ((a.p1.y + a.p2.y) / 2) - ((b.p1.y + b.p2.y) / 2));
    }

    // 4. Median split
    const mid = Math.floor(walls.length / 2);
    const leftWalls = walls.slice(0, mid);
    const rightWalls = walls.slice(mid);

    // 5. Recursion
    node.left = this.split(leftWalls);
    node.right = this.split(rightWalls);

    return node;
  }

  /**
   * Queries the BVH using a token's vision radius (e.g., 60ft converted to pixels).
   * Rapidly rejects entire wings of the map that are too far away to cast shadows.
   */
  public queryRadius(centerX: number, centerY: number, radius: number): WallSegment[] {
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
      return; // The query box does not intersect this node's bounds. Prune this branch.
    }

    if (node.walls.length > 0) {
      // Leaf node: add walls to the result
      result.push(...node.walls);
    } else {
      // Branch node: continue traversal
      this.traverse(node.left, queryBox, result);
      this.traverse(node.right, queryBox, result);
    }
  }

  /**
   * Flattens the resulting queried walls into a Float32Array suitable for the 
   * WGSLComputeContext to upload to the GPU. (Format: p1.x, p1.y, p2.x, p2.y)
   */
  public flattenForGPU(walls: WallSegment[]): Float32Array {
    // 4 floats per wall segment (x1, y1, x2, y2). 
    // This coincidentally perfectly matches the 16-byte alignment requirement of WebGPU.
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
}