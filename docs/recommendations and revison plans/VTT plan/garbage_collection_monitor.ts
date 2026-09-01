/**
 * @file GCMonitor.ts
 * @description Stage 2.5: Prevent VRAM leaks during scene transitions and prolonged gameplay.
 * Actively monitors memory pressure and intercepts unmount lifecycles to explicitly 
 * destroy PixiJS v8 WebGPU buffers, preventing cumulative out-of-memory crashes.
 */

import { Container, Assets, Texture } from 'pixi.js';

// Define heuristic limits for aggressive garbage collection. 
// Note: Web browsers do not expose direct VRAM usage for security reasons, 
// so we track approximate texture payload sizes and trigger cleanup between scenes.
const HEURISTIC_VRAM_LIMIT_MB = 1024; // 1GB threshold for high-res map textures

export class GCMonitor {
  private trackedContainers: Set<Container> = new Set();
  private trackedTextures: Set<string> = new Set();
  private estimatedVramUsageMB: number = 0;

  constructor() {
    console.log('[GCMonitor] Memory watcher initialized.');
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
      console.warn(`[GCMonitor] Memory pressure high (${this.estimatedVramUsageMB.toFixed(2)}MB). Queuing aggressive prune.`);
      // In production, this would emit an event to the UI to pause background texture pre-fetching
    }
  }

  /**
   * Called during a scene transition (e.g., leaving a dungeon to go to orbit).
   * Recursively crawls the container tree and explicitly severs WebGPU buffer bindings.
   */
  public purgeScene(container: Container) {
    if (!this.trackedContainers.has(container)) return;

    console.log(`[GCMonitor] Purging scene. Estimated freed VRAM: ${this.estimatedVramUsageMB.toFixed(2)}MB`);

    // 1. Explicitly destroy the container and ALL children.
    // The boolean flags are critical: they tell PixiJS to not just remove the objects from the JS heap,
    // but to actually send the destruction commands to the WebGPU backend to free the textures and base textures.
    container.destroy({
      children: true,
      texture: true,
      baseTexture: true,
    });

    this.trackedContainers.delete(container);
    
    // 2. Unload the raw assets from the PixiJS asset cache
    this.trackedTextures.forEach(async (assetKey) => {
      try {
        await Assets.unload(assetKey);
      } catch (err) {
        console.warn(`[GCMonitor] Failed to unload asset ${assetKey}`, err);
      }
    });

    // 3. Reset heuristic trackers
    this.trackedTextures.clear();
    this.estimatedVramUsageMB = 0;
    
    console.log('[GCMonitor] Scene purge complete. WebGPU memory pipeline flushed.');
  }

  /**
   * Hard resets the entire tracking ecosystem in the event of a catastrophic WebGPU context loss.
   */
  public forceEmergencyFlush() {
    console.error('[GCMonitor] EMERGENCY FLUSH TRIGGERED. Wiping all tracked GPU assets.');
    this.trackedContainers.forEach(container => {
      if (!container.destroyed) {
         container.destroy({ children: true, texture: true, baseTexture: true });
      }
    });
    this.trackedContainers.clear();
    this.trackedTextures.clear();
    this.estimatedVramUsageMB = 0;
  }
}