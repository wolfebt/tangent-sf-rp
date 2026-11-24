/**
 * @file RendererContext.ts
 * @description Stage 2.1: WebGPU Stage initialization, adapter management, and fault tolerance.
 * Attempts to mount a high-performance WebGPU context via PixiJS v8, falling back to WebGL
 * gracefully if the client hardware lacks support. Includes device-loss recovery hooks.
 */

import { Application, GlobalResourceRegistry, getCanvasTexture, hasCachedCanvasTexture } from 'pixi.js';

export class RendererContext {
  private app: Application;
  private isWebGPU: boolean = false;
  private canvasRef: HTMLCanvasElement | null = null;
  private isInitialized: boolean = false;
  private isDestroyed: boolean = false;
  private isRebuilding: boolean = false;
  private initPromise: Promise<void> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    // Instantiate the PixiJS v8 Application shell
    this.app = new Application();
  }

  /**
   * Cleans up any cached PixiJS Texture/CanvasSource or WebGPU context bindings on a canvas
   * to avoid Dawn validation errors when re-mounting or re-configuring devices.
   */
  public static cleanupCanvas(canvas: HTMLCanvasElement | null): void {
    if (!canvas) return;

    try {
      if (hasCachedCanvasTexture(canvas)) {
        const texture = getCanvasTexture(canvas);
        if (texture) {
          if ((texture.source as any)?._gpuContext) {
            (texture.source as any)._gpuContext = null;
          }
          texture.destroy(true);
        }
      }
    } catch {
      // Ignored
    }

    try {
      GlobalResourceRegistry.release();
    } catch {
      // Ignored
    }

    try {
      const gpuContext = (canvas as any).getContext?.('webgpu');
      if (gpuContext && typeof gpuContext.unconfigure === 'function') {
        gpuContext.unconfigure();
      }
    } catch {
      // Ignored
    }
  }

  private setupResizeObserver(canvas: HTMLCanvasElement): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    const target = canvas?.parentElement;
    if (!target || typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(() => {
      if (this.isDestroyed || !this.isInitialized || !this.app?.renderer) return;
      try {
        (this.app as any).resize?.();
      } catch {
        // Ignored during teardown
      }
    });
    this.resizeObserver.observe(target);
  }

  /**
   * Mounts the Stage renderer to the provided canvas element.
   * @param canvas The target HTMLCanvasElement injected via React
   */
  public async initialize(canvas: HTMLCanvasElement): Promise<void> {
    if (this.isDestroyed) return;
    this.canvasRef = canvas;
    const resizeTarget = canvas?.parentElement || (typeof window !== 'undefined' ? window : undefined);

    this.initPromise = (async () => {
      // Clean up any stale PixiJS canvas cache or unconfigured WebGPU context before booting
      RendererContext.cleanupCanvas(canvas);

      try {
        // Boot the engine with PixiJS v8 preferring WebGPU
        await this.app.init({
          ...(this.canvasRef ? { canvas: this.canvasRef } : {}),
          ...(resizeTarget ? { resizeTo: resizeTarget } : {}),
          preference: 'webgpu',
          antialias: false, // Disabled for crisp tactical grid sharpness and maximum compute performance
          backgroundAlpha: 0,
          resolution: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
          autoDensity: true,
        });

        if (this.isDestroyed) {
          this.cleanup();
          return;
        }

        this.isInitialized = true;
        this.setupResizeObserver(canvas);

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
        console.error('[RendererContext] WebGPU initialization error, attempting WebGL fallback:', error);
        if (this.isDestroyed) return;

        try {
          RendererContext.cleanupCanvas(canvas);
          this.app = new Application();
          await this.app.init({
            ...(this.canvasRef ? { canvas: this.canvasRef } : {}),
            ...(resizeTarget ? { resizeTo: resizeTarget } : {}),
            preference: 'webgl',
            backgroundAlpha: 0,
            antialias: false,
            resolution: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
            autoDensity: true,
          });

          if (this.isDestroyed) {
            this.cleanup();
            return;
          }

          this.isInitialized = true;
          this.isWebGPU = false;
          this.setupResizeObserver(canvas);
          console.log(`[RendererContext] Stage running on fallback renderer: ${this.app.renderer?.name}`);
        } catch (fallbackError) {
          console.error('[RendererContext] Catastrophic Stage initialization failure:', fallbackError);
        }
      }
    })();

    await this.initPromise;
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
    if (this.isRebuilding || this.isDestroyed || !this.canvasRef) return;
    this.isRebuilding = true;
    console.log('[RendererContext] Rebuilding graphics context for the Stage...');
    const rebuildRun = (async () => {
      try {
        this.cleanup();
        this.app = new Application();
        await this.initialize(this.canvasRef!);

        if (!this.isDestroyed && this.isInitialized && typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('stage-renderer-rebuilt', {
              detail: { rendererContext: this, isWebGPU: this.isWebGPU }
            })
          );
        }
      } catch (err) {
        console.error('[RendererContext] Failed to rebuild context:', err);
      } finally {
        this.isRebuilding = false;
      }
    })();
    this.initPromise = rebuildRun;
    await rebuildRun;
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

  private cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.app && (this.isInitialized || (this.app as any).renderer)) {
      try {
        if (typeof (this.app as any)._cancelResize !== 'function') {
          (this.app as any)._cancelResize = () => {};
        }
        // Destroy the renderer without removing the React-managed canvas from the DOM
        this.app.destroy(false, { children: true, texture: false });
      } catch (err) {
        console.warn('[RendererContext] Error during app destroy (safely bypassed):', err);
      }
    }
    if (this.canvasRef) {
      RendererContext.cleanupCanvas(this.canvasRef);
    }
    this.isInitialized = false;
    console.log('[RendererContext] Stage context destroyed. VRAM flushed.');
  }

  public async destroy(): Promise<void> {
    this.isDestroyed = true;
    if (this.initPromise) {
      try {
        await this.initPromise;
      } catch {
        // Ignored
      }
    }
    this.cleanup();
  }
}
