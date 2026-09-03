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
      // Boot the engine with PixiJS v8 preferring WebGPU
      await this.app.init({
        canvas: this.canvasRef,
        resizeTo: typeof window !== 'undefined' ? window : undefined,
        preference: 'webgpu',
        antialias: false, // Disabled for crisp tactical grid sharpness and maximum compute performance
        resolution: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
        autoDensity: true,
      });

      this.isInitialized = true;

      // Verify which renderer backend booted
      if (this.app.renderer?.name?.toLowerCase().includes('webgpu')) {
        console.log('[RendererContext] WebGPU Graphics Pipeline successfully initialized on the Stage.');
        this.isWebGPU = true;
        this.setupDeviceLossRecovery();
      } else {
        console.log(`[RendererContext] Stage running on fallback renderer: ${this.app.renderer?.name}`);
        this.isWebGPU = false;
      }

    } catch (error) {
      console.error('[RendererContext] Catastrophic Stage initialization failure:', error);
    }
  }

  /**
   * Hooks into the active WebGPU device lost event to prevent the app from dying if the OS suspends the GPU.
   */
  private setupDeviceLossRecovery() {
    const device = this.getGPUDevice();
    if (!device?.lost) return;

    device.lost.then((info: any) => {
      console.error(`[RendererContext] WebGPU Device Lost: ${info?.reason}. Attempting Stage recovery...`);
      if (info?.reason !== 'destroyed') {
        this.rebuildContext();
      }
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

  public getGPUDevice(): any {
    return (this.app.renderer as any)?.gpu?.device || (this.app.renderer as any)?.device || null;
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
