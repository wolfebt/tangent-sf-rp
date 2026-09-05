/**
 * @file Stage3DRendererContext.ts
 * @description Stage 3D: Three.js Graphics Context Manager for the Tangent Tactical 3D Stage.
 * Orchestrates WebGL2/WebGPU renderer initialization, shadow maps, tone mapping,
 * pixel-ratio clamping for high-DPI displays, and animation ticker loop.
 */

import * as THREE from 'three';

export interface Renderer3DOptions {
  antialias?: boolean;
  shadows?: boolean;
  powerPreference?: 'high-performance' | 'default' | 'low-power';
}

export class Stage3DRendererContext {
  private renderer: THREE.WebGLRenderer | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private animationFrameId: number | null = null;
  private isInitialized = false;
  private resizeObserver: ResizeObserver | null = null;
  private renderCallbacks: Array<(delta: number, elapsed: number) => void> = [];
  private clock: THREE.Clock = new THREE.Clock();

  /**
   * Initializes the Three.js renderer mounted to the target canvas.
   */
  public initialize(canvas: HTMLCanvasElement, options: Renderer3DOptions = {}): boolean {
    this.canvas = canvas;
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: options.antialias !== false,
        alpha: true,
        powerPreference: options.powerPreference || 'high-performance',
        stencil: true,
        depth: true
      });

      // Tactical lighting & shadow quality
      this.renderer.shadowMap.enabled = options.shadows !== false;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;

      // Handle high-DPI screens without GPU melting
      const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      this.renderer.setPixelRatio(dpr);

      // Set initial size
      const width = canvas.clientWidth || window.innerWidth || 800;
      const height = canvas.clientHeight || window.innerHeight || 600;
      this.renderer.setSize(width, height, false);

      // Bind ResizeObserver
      if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
        this.resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width: w, height: h } = entry.contentRect;
            if (w > 0 && h > 0) {
              this.resize(w, h);
            }
          }
        });
        this.resizeObserver.observe(canvas.parentElement);
      }

      this.isInitialized = true;
      this.startLoop();
      console.log('[Stage3DRendererContext] 3D Holographic Stage Graphics initialized successfully.');
      return true;
    } catch (err) {
      console.error('[Stage3DRendererContext] Failed to initialize 3D renderer:', err);
      return false;
    }
  }

  public resize(width: number, height: number) {
    if (!this.renderer || width <= 0 || height <= 0) return;
    this.renderer.setSize(width, height, false);
  }

  /**
   * Register a per-frame render callback (e.g. camera controls, particle updates, scene render).
   */
  public onRender(callback: (delta: number, elapsed: number) => void): () => void {
    this.renderCallbacks.push(callback);
    return () => {
      this.renderCallbacks = this.renderCallbacks.filter(cb => cb !== callback);
    };
  }

  private startLoop() {
    if (this.animationFrameId !== null) return;

    const tick = () => {
      this.animationFrameId = requestAnimationFrame(tick);
      if (!this.renderer) return;

      const delta = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.getElapsedTime();

      for (let i = 0; i < this.renderCallbacks.length; i++) {
        try {
          this.renderCallbacks[i](delta, elapsed);
        } catch (err) {
          console.warn('[Stage3DRendererContext] Render callback error:', err);
        }
      }
    };

    this.clock.start();
    this.animationFrameId = requestAnimationFrame(tick);
  }

  public stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public renderScene(scene: THREE.Scene, camera: THREE.Camera) {
    if (!this.renderer) return;
    this.renderer.render(scene, camera);
  }

  public getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  public getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  public destroy() {
    this.stopLoop();
    this.renderCallbacks = [];
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer = null;
    }
    this.canvas = null;
    this.isInitialized = false;
    console.log('[Stage3DRendererContext] 3D Graphics Context disposed cleanly.');
  }
}
