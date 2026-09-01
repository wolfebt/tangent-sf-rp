/**
 * @file RendererContext.ts
 * @description Stage 2.1: WebGPU Stage initialization, adapter management, and fault tolerance.
 * Attempts to mount a high-performance WebGPU context via PixiJS v8, falling back to WebGL
 * gracefully if the client hardware lacks support. Includes device-loss recovery hooks.
 */

import { Application } from 'pixi.js';

export class RendererContext {
  private app: Application;
  private isWebGPU: boolean = false;
  private canvasRef: HTMLCanvasElement | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Instantiate the PixiJS v8 Application shell
    this.app = new Application();
  }

  /**
   * Mounts the Stage renderer to the provided canvas element.
   * @param canvas The target HTMLCanvasElement injected via React
   */
  public async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.canvasRef = canvas;

    try {
      // 1. Check for WebGPU support before initializing PixiJS
      if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
        try {
          const adapter = await (navigator as any).gpu.requestAdapter({
            powerPreference: 'high-performance',
          });

          if (adapter) {
            console.log(`[RendererContext] WebGPU adapter acquired: ${adapter.name || 'Discrete/Integrated GPU'}`);
            this.isWebGPU = true;
            this.setupDeviceLossRecovery(adapter);
          } else {
            console.warn('[RendererContext] navigator.gpu exists, but no suitable adapter found.');
          }
        } catch (e) {
          console.warn('[RendererContext] WebGPU adapter request error; proceeding with fallback:', e);
        }
      }

      // 2. Boot the engine. PixiJS v8 prefers WebGPU if available and 'preference' is set.
      await this.app.init({
        canvas: this.canvasRef,
        resizeTo: typeof window !== 'undefined' ? window : undefined,
        preference: 'webgpu',
        powerPreference: 'high-performance',
        antialias: false, // Disabled for crisp tactical grid sharpness and maximum compute performance
        resolution: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
        autoDensity: true,
      });

      this.isInitialized = true;

      // Verify which renderer backend booted
      if (this.app.renderer?.name?.toLowerCase().includes('webgpu')) {
        console.log('[RendererContext] WebGPU Graphics Pipeline successfully initialized on the Stage.');
        this.isWebGPU = true;
      } else {
        console.log(`[RendererContext] Stage running on fallback renderer: ${this.app.renderer?.name}`);
        this.isWebGPU = false;
      }

    } catch (error) {
      console.error('[RendererContext] Catastrophic Stage initialization failure:', error);
    }
  }

  /**
   * Hooks into the WebGPU device lost event to prevent the app from dying if the OS suspends the GPU.
   */
  private setupDeviceLossRecovery(adapter: any) {
    if (!adapter?.requestDevice) return;
    
    adapter.requestDevice().then((device: any) => {
      device?.lost?.then((info: any) => {
        console.error(`[RendererContext] WebGPU Device Lost: ${info?.reason}. Attempting Stage recovery...`);
        if (info?.reason !== 'destroyed') {
          this.rebuildContext();
        }
      });
    }).catch((err: any) => {
      console.warn('[RendererContext] Failed to bind device loss listener:', err);
    });
  }

  private async rebuildContext() {
    console.log('[RendererContext] Rebuilding graphics context for the Stage...');
    if (this.canvasRef) {
      try {
        this.app.destroy(false, { children: true, texture: false });
        this.app = new Application();
        await this.initialize(this.canvasRef);
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('stage-renderer-rebuilt'));
        }
      } catch (err) {
        console.error('[RendererContext] Failed to rebuild context:', err);
      }
    }
  }

  public getApp(): Application {
    return this.app;
  }

  public getIsWebGPU(): boolean {
    return this.isWebGPU;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  public destroy() {
    if (this.isInitialized) {
      // Completely flush WebGPU buffers and textures from VRAM
      this.app.destroy(true, { children: true, texture: true });
      this.isInitialized = false;
      console.log('[RendererContext] Stage context destroyed. VRAM flushed.');
    }
  }
}
