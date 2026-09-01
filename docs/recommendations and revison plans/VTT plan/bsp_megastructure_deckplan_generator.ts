/**
 * @file BSPDeckplanGenerator.ts
 * @description Stage 4.6: Algorithmic interior map generation.
 * Utilizes Binary Space Partitioning (BSP) to rapidly slice large bounding boxes 
 * into distinct rooms and corridors, formatting the output as CSG operations for 
 * the WebGPU signed distance field renderer.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

class BSPNode {
  rect: Rect;
  leftChild: BSPNode | null = null;
  rightChild: BSPNode | null = null;
  room: Rect | null = null;
  halls: Rect[] = [];

  constructor(rect: Rect) {
    this.rect = rect;
  }
}

export class BSPDeckplanGenerator {
  private minRoomSize = 40; // Minimum size in pixels (e.g., 8 squares at 5ft/sq)
  private minSplitRatio = 0.4;
  private maxSplitRatio = 0.6;

  /**
   * Generates a fully connected dungeon/megastructure layout.
   */
  public generate(width: number, height: number): Rect[] {
    const rootRect: Rect = { x: 0, y: 0, w: width, h: height };
    const rootNode = new BSPNode(rootRect);

    // 1. Recursively partition the space
    this.splitNode(rootNode, 4); // Max depth of 4 = ~16 potential rooms

    // 2. Carve rooms inside the leaf nodes
    this.createRooms(rootNode);

    // 3. Drill corridors connecting sibling nodes
    this.createCorridors(rootNode);

    // 4. Flatten the tree into an array of rectangular CSG boxes for the shader
    return this.exportCSGRects(rootNode);
  }

  private splitNode(node: BSPNode, depth: number) {
    if (depth === 0) return;

    // Determine split direction based on the current bounding box aspect ratio
    const splitH = node.rect.w > node.rect.h; 
    const maxDimension = splitH ? node.rect.w : node.rect.h;

    // Prevent splitting if the box is getting too small
    if (maxDimension < this.minRoomSize * 2) return;

    // Randomize the split point to create organic layouts (avoiding perfect grids)
    const splitRatio = this.minSplitRatio + Math.random() * (this.maxSplitRatio - this.minSplitRatio);
    const splitPoint = Math.floor(maxDimension * splitRatio);

    let rect1: Rect, rect2: Rect;

    if (splitH) {
      // Split vertically (Left/Right)
      rect1 = { x: node.rect.x, y: node.rect.y, w: splitPoint, h: node.rect.h };
      rect2 = { x: node.rect.x + splitPoint, y: node.rect.y, w: node.rect.w - splitPoint, h: node.rect.h };
    } else {
      // Split horizontally (Top/Bottom)
      rect1 = { x: node.rect.x, y: node.rect.y, w: node.rect.w, h: splitPoint };
      rect2 = { x: node.rect.x, y: node.rect.y + splitPoint, w: node.rect.w, h: node.rect.h - splitPoint };
    }

    node.leftChild = new BSPNode(rect1);
    node.rightChild = new BSPNode(rect2);

    this.splitNode(node.leftChild, depth - 1);
    this.splitNode(node.rightChild, depth - 1);
  }

  private createRooms(node: BSPNode) {
    if (node.leftChild || node.rightChild) {
      // Branch node: continue recursion
      if (node.leftChild) this.createRooms(node.leftChild);
      if (node.rightChild) this.createRooms(node.rightChild);
    } else {
      // Leaf node: Carve a room within the boundaries, adding padded walls
      const padding = 5; 
      const roomW = Math.max(this.minRoomSize, Math.floor(node.rect.w - (Math.random() * (node.rect.w / 3)) - padding));
      const roomH = Math.max(this.minRoomSize, Math.floor(node.rect.h - (Math.random() * (node.rect.h / 3)) - padding));
      const roomX = node.rect.x + Math.floor(Math.random() * (node.rect.w - roomW - padding));
      const roomY = node.rect.y + Math.floor(Math.random() * (node.rect.h - roomH - padding));

      node.room = { x: roomX, y: roomY, w: roomW, h: roomH };
    }
  }

  private createCorridors(node: BSPNode) {
    if (!node.leftChild || !node.rightChild) return;

    // Recursively connect the children
    this.createCorridors(node.leftChild);
    this.createCorridors(node.rightChild);

    // Get the center points of the left and right children (could be rooms or clusters)
    const leftCenter = this.getCenter(node.leftChild);
    const rightCenter = this.getCenter(node.rightChild);

    const corridorWidth = 10; // Corridors are 10 pixels wide (e.g., 2 standard 5ft squares)

    // Drill an L-shaped corridor connecting the two centers
    const hall1: Rect = {
      x: Math.min(leftCenter.x, rightCenter.x),
      y: leftCenter.y - corridorWidth / 2,
      w: Math.abs(leftCenter.x - rightCenter.x) + corridorWidth,
      h: corridorWidth
    };

    const hall2: Rect = {
      x: rightCenter.x - corridorWidth / 2,
      y: Math.min(leftCenter.y, rightCenter.y),
      w: corridorWidth,
      h: Math.abs(leftCenter.y - rightCenter.y) + corridorWidth
    };

    node.halls.push(hall1, hall2);
  }

  private getCenter(node: BSPNode): { x: number, y: number } {
    if (node.room) {
      return { x: node.room.x + node.room.w / 2, y: node.room.y + node.room.h / 2 };
    }
    // If it's a branch, return the center of its bounding box
    return { x: node.rect.x + node.rect.w / 2, y: node.rect.y + node.rect.h / 2 };
  }

  /**
   * Flattens the entire tree into a single array of Rectangles.
   * These act as 'positive space' (walkable areas) to be passed into the 
   * WebGPU CSG shader using the opUnion function against the solid map.
   */
  private exportCSGRects(node: BSPNode | null): Rect[] {
    if (!node) return [];

    let shapes: Rect[] = [];
    if (node.room) shapes.push(node.room);
    if (node.halls.length > 0) shapes.push(...node.halls);

    shapes = shapes.concat(this.exportCSGRects(node.leftChild));
    shapes = shapes.concat(this.exportCSGRects(node.rightChild));

    return shapes;
  }
}