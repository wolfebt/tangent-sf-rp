/**
 * @file RendererContext.ts
 * @description Stage 2.1: WebGPU initialization, adapter management, and fault tolerance.
 * Attempts to mount a high-performance WebGPU context via PixiJS v8, falling back to WebGL
 * gracefully if the client hardware lacks support. Includes device-loss recovery hooks.
 */

import { Application } from 'pixi.js';

export class RendererContext {
  private app: Application;
  private isWebGPU: boolean = false;
  private canvasRef: HTMLCanvasElement | null = null;

  constructor() {
    // Instantiate the PixiJS v8 Application shell
    this.app = new Application();
  }

  /**
   * Mounts the renderer to the provided canvas element.
   * @param canvas The target HTMLCanvasElement injected via React
   */
  public async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.canvasRef = canvas;

    try {
      // 1. Explicitly check for WebGPU support before initializing PixiJS
      if (navigator.gpu) {
        // Request the adapter to check if a high-performance discrete GPU is available
        const adapter = await navigator.gpu.requestAdapter({
          powerPreference: 'high-performance',
        });

        if (adapter) {
          console.log(`[RendererContext] WebGPU adapter acquired: ${adapter.name}`);
          this.isWebGPU = true;
          this.setupDeviceLossRecovery(adapter);
        } else {
          console.warn('[RendererContext] navigator.gpu exists, but no suitable adapter found.');
        }
      }

      // 2. Boot the engine. PixiJS v8 natively prefers WebGPU if available and 'preference' is set.
      await this.app.init({
        canvas: this.canvasRef,
        resizeTo: window, // Automatically fill the browser window
        preference: 'webgpu', // Fallback to 'webgl' is handled automatically by Pixi v8
        powerPreference: 'high-performance',
        antialias: false, // Disabled for pure pixel/tactical grid sharpness and compute performance
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // Verify what renderer actually booted
      if (this.app.renderer.name.includes('webgpu')) {
         console.log('[RendererContext] WebGPU Graphics Pipeline successfully initialized.');
      } else {
         console.log(`[RendererContext] WebGPU unavailable. Fallback successful. Running on: ${this.app.renderer.name}`);
         this.isWebGPU = false;
      }

    } catch (error) {
      console.error('[RendererContext] Catastrophic initialization failure:', error);
      // In a production environment, this would dispatch a fatal error to the React UI overlay
    }
  }

  /**
   * Hooks into the WebGPU device lost event to prevent the app from dying if the OS suspends the GPU.
   */
  private setupDeviceLossRecovery(adapter: GPUAdapter) {
    adapter.requestDevice().then((device) => {
      device.lost.then((info) => {
        console.error(`[RendererContext] WebGPU Device Lost: ${info.reason}. Attempting recovery...`);
        // If the device is lost (e.g., laptop goes to sleep, driver updates), 
        // we must explicitly destroy the current context and re-initialize it.
        if (info.reason !== 'destroyed') {
          this.rebuildContext();
        }
      });
    }).catch(err => {
      console.warn('[RendererContext] Failed to bind device loss listener:', err);
    });
  }

  private async rebuildContext() {
    console.log('[RendererContext] Rebuilding graphics context...');
    if (this.canvasRef) {
      this.app.destroy(false, { children: true, texture: false, baseTexture: false });
      this.app = new Application();
      await this.initialize(this.canvasRef);
      // Event bus emit: 'RENDERER_REBUILT' would go here so LayerCompositor knows to reconstruct the scene graph
    }
  }

  public getApp(): Application {
    return this.app;
  }

  public getIsWebGPU(): boolean {
    return this.isWebGPU;
  }

  public destroy() {
    // Completely nuke the WebGPU buffers and textures from VRAM
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    console.log('[RendererContext] Context destroyed. VRAM flushed.');
  }
}