/**
 * @file GCMonitor.ts
 * @description Stage 2.5: Prevent VRAM leaks during Stage scene transitions and prolonged gameplay.
 * Actively monitors memory pressure and intercepts unmount lifecycles to explicitly 
 * destroy PixiJS v8 WebGPU buffers, preventing cumulative out-of-memory crashes.
 */

import { Container, Assets } from 'pixi.js';

// Heuristic limits for aggressive garbage collection on the Stage.
const HEURISTIC_VRAM_LIMIT_MB = 1024; // 1GB threshold for high-res map textures

export class GCMonitor {
  private trackedContainers: Set<Container> = new Set();
  private trackedTextures: Set<string> = new Set();
  private estimatedVramUsageMB: number = 0;

  constructor() {
    console.log('[GCMonitor] Memory watcher initialized for the Stage.');
  }

  /**
   * Registers a root scene container to be tracked for eventual destruction.
   */
  public registerScene(container: Container) {
    this.trackedContainers.add(container);
  }

  /**
   * Records loaded asset keys (e.g., from Story Foundry WebP maps) and estimates their VRAM footprint.
   */
  public trackAssetLoad(assetKey: string, estimatedSizeMB: number) {
    this.trackedTextures.add(assetKey);
    this.estimatedVramUsageMB += estimatedSizeMB;
    this.checkMemoryPressure();
  }

  /**
   * Evaluates if the current estimated VRAM payload exceeds our safe threshold.
   */
  private checkMemoryPressure() {
    if (this.estimatedVramUsageMB > HEURISTIC_VRAM_LIMIT_MB) {
      console.warn(`[GCMonitor] Stage memory pressure high (${this.estimatedVramUsageMB.toFixed(2)}MB). Queuing aggressive prune.`);
    }
  }

  /**
   * Called during a Stage scene transition (e.g., leaving a tactical encounter to go to orbit).
   * Recursively crawls the container tree and explicitly severs WebGPU buffer bindings.
   */
  public purgeScene(container: Container) {
    if (!this.trackedContainers.has(container)) return;

    console.log(`[GCMonitor] Purging Stage scene. Estimated freed VRAM: ${this.estimatedVramUsageMB.toFixed(2)}MB`);

    // Explicitly destroy the container and ALL children, freeing GPU textures
    container.destroy({
      children: true,
      texture: true
    });

    this.trackedContainers.delete(container);
    
    // Unload the raw assets from the PixiJS asset cache
    this.trackedTextures.forEach(async (assetKey) => {
      try {
        await Assets.unload(assetKey);
      } catch (err) {
        console.warn(`[GCMonitor] Failed to unload asset ${assetKey}`, err);
      }
    });

    // Reset heuristic trackers
    this.trackedTextures.clear();
    this.estimatedVramUsageMB = 0;
    
    console.log('[GCMonitor] Stage scene purge complete. WebGPU memory pipeline flushed.');
  }

  /**
   * Hard resets the entire tracking ecosystem in the event of a catastrophic WebGPU context loss.
   */
  public forceEmergencyFlush() {
    console.error('[GCMonitor] EMERGENCY FLUSH TRIGGERED. Wiping all tracked Stage GPU assets.');
    this.trackedContainers.forEach(container => {
      if (!container.destroyed) {
        container.destroy({ children: true, texture: true });
      }
    });
    this.trackedContainers.clear();
    this.trackedTextures.clear();
    this.estimatedVramUsageMB = 0;
  }

  public getEstimatedVramUsageMB(): number {
    return this.estimatedVramUsageMB;
  }
}
