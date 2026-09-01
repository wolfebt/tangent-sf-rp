/**
 * @file FrustumChunkManager.ts
 * @description Stage 2.3: Infinite canvas spatial hashing and aggressive culling on the Stage.
 * Divides the infinite map into a 2048x2048 grid. Sprites outside the active camera
 * view (and its immediate 1-chunk padding) are explicitly flagged as non-renderable, 
 * bypassing the GPU entirely to maintain high frame rates during massive engagements.
 */

import { Sprite, Rectangle } from 'pixi.js';

// 2048x2048 is an optimal chunk size for modern WebGPU texture atlases
export const CHUNK_SIZE = 2048;

export class FrustumChunkManager {
  // A spatial hash map linking a chunk coordinate (e.g., "1,-2") to a Set of Sprites
  private spatialHash: Map<string, Set<Sprite>> = new Map();
  
  // Track which chunk a specific sprite belongs to for fast updates
  private spriteChunkMap: Map<Sprite, string> = new Map();
  
  // Cache of currently visible chunks to prevent redundant calculations
  private activeVisibleChunks: Set<string> = new Set();

  /**
   * Registers a sprite into the spatial hash based on its current absolute coordinates.
   */
  public registerSprite(sprite: Sprite) {
    const chunkKey = this.calculateChunkKey(sprite.x, sprite.y);
    
    if (!this.spatialHash.has(chunkKey)) {
      this.spatialHash.set(chunkKey, new Set());
    }
    
    this.spatialHash.get(chunkKey)!.add(sprite);
    this.spriteChunkMap.set(sprite, chunkKey);
    
    // Initial culling check: hide by default unless it's in a currently visible chunk
    sprite.renderable = this.activeVisibleChunks.has(chunkKey);
  }

  /**
   * Updates a sprite's chunk location if it has moved across the Stage grid.
   */
  public updateSpritePosition(sprite: Sprite) {
    const oldChunkKey = this.spriteChunkMap.get(sprite);
    const newChunkKey = this.calculateChunkKey(sprite.x, sprite.y);

    if (oldChunkKey !== newChunkKey) {
      // Remove from old chunk bucket
      if (oldChunkKey && this.spatialHash.has(oldChunkKey)) {
        this.spatialHash.get(oldChunkKey)!.delete(sprite);
      }
      
      // Add to new chunk bucket
      if (!this.spatialHash.has(newChunkKey)) {
        this.spatialHash.set(newChunkKey, new Set());
      }
      this.spatialHash.get(newChunkKey)!.add(sprite);
      this.spriteChunkMap.set(sprite, newChunkKey);
      
      // Instantly evaluate renderable state based on the new chunk
      sprite.renderable = this.activeVisibleChunks.has(newChunkKey);
    }
  }

  public unregisterSprite(sprite: Sprite) {
    const chunkKey = this.spriteChunkMap.get(sprite);
    if (chunkKey && this.spatialHash.has(chunkKey)) {
      this.spatialHash.get(chunkKey)!.delete(sprite);
    }
    this.spriteChunkMap.delete(sprite);
  }

  /**
   * Called every frame or whenever the Stage camera pans/zooms. 
   * Calculates intersecting chunks and flips renderable states.
   * @param viewportBounds A Rectangle representing the active camera view in world coordinates.
   */
  public updateCulling(viewportBounds: Rectangle) {
    // 1. Calculate which chunks intersect the camera bounds
    // We add 1 chunk of padding (hysteresis) in all directions to pre-load 
    // textures right before they pan onto the screen, eliminating edge-flicker.
    const startX = Math.floor(viewportBounds.left / CHUNK_SIZE) - 1;
    const endX = Math.floor(viewportBounds.right / CHUNK_SIZE) + 1;
    const startY = Math.floor(viewportBounds.top / CHUNK_SIZE) - 1;
    const endY = Math.floor(viewportBounds.bottom / CHUNK_SIZE) + 1;

    const newlyVisibleChunks = new Set<string>();

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        newlyVisibleChunks.add(`${x},${y}`);
      }
    }

    // 2. Hide sprites in chunks that are no longer visible
    for (const activeChunk of this.activeVisibleChunks) {
      if (!newlyVisibleChunks.has(activeChunk)) {
        const spritesToHide = this.spatialHash.get(activeChunk);
        if (spritesToHide) {
          spritesToHide.forEach(sprite => {
            sprite.renderable = false;
          });
        }
      }
    }

    // 3. Show sprites in chunks that just became visible
    for (const newChunk of newlyVisibleChunks) {
      if (!this.activeVisibleChunks.has(newChunk)) {
        const spritesToShow = this.spatialHash.get(newChunk);
        if (spritesToShow) {
          spritesToShow.forEach(sprite => {
            sprite.renderable = true;
          });
        }
      }
    }

    // 4. Update the cache for next frame
    this.activeVisibleChunks = newlyVisibleChunks;
  }

  public getActiveVisibleChunks(): Set<string> {
    return this.activeVisibleChunks;
  }

  public clear() {
    this.spatialHash.clear();
    this.spriteChunkMap.clear();
    this.activeVisibleChunks.clear();
  }

  /**
   * Converts raw world coordinates into a discrete string key.
   */
  private calculateChunkKey(x: number, y: number): string {
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkY = Math.floor(y / CHUNK_SIZE);
    return `${chunkX},${chunkY}`;
  }
}
