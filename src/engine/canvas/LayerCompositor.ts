/**
 * @file LayerCompositor.ts
 * @description Stage 2.2: Z-Axis hierarchy enforcement and render grouping on the Stage.
 * Instantiates the rigid PIXI.Container tree and utilizes RenderGroup optimization 
 * to prevent the CPU from recalculating transforms for static layers (like the map).
 */

import { Application, Container, Sprite, Graphics } from 'pixi.js';

// Strict Object enforcing the visual hierarchy of the Stage
export const ZLayer = {
  BackgroundMap: 0,
  UnderlayDebris: 10,
  InteractiveObjects: 15,
  Tokens: 20,
  RoofCanopy: 30,
  DynamicFX: 40,
  LightingDarkness: 50,
  FogOfWar: 60,
  ForegroundUI: 70
} as const;

export type ZLayer = typeof ZLayer[keyof typeof ZLayer];

export class LayerCompositor {
  private app: Application;
  private layers: Map<ZLayer, Container> = new Map();
  private roofMask: Graphics;

  constructor(app: Application) {
    this.app = app;
    this.roofMask = new Graphics();
    this.buildHierarchy();
  }

  private buildHierarchy() {
    // Ensure the main stage is clear
    this.app.stage.removeChildren();
    
    // Sort layer values to ensure they are added to the stage in strict numerical order
    const sortedLayers = Object.values(ZLayer).sort((a, b) => a - b);

    for (const layerId of sortedLayers) {
      const container = new Container();
      container.label = `Layer_${layerId}`;
      container.zIndex = layerId;

      // OPTIMIZATION: RenderGroups (Pixi v8 feature).
      // Marks static layers as render groups to skip heavy CPU transform traversal
      if (layerId === ZLayer.BackgroundMap || layerId === ZLayer.UnderlayDebris) {
        container.isRenderGroup = true; 
      }

      this.layers.set(layerId, container);
      this.app.stage.addChild(container);
    }

    // Sort stage once based on assigned zIndex
    this.app.stage.sortChildren();
    
    this.setupRoofMasking();
    console.log('[LayerCompositor] Strict Stage Z-Axis hierarchy initialized with RenderGroup optimizations.');
  }

  private setupRoofMasking() {
    const roofLayer = this.layers.get(ZLayer.RoofCanopy);
    if (!roofLayer) return;

    // Roof Canopy layer alpha mask allows "seeing inside" buildings when an operative enters
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
    
    this.roofMask.rect(0, 0, width, height);
    this.roofMask.fill(0xFFFFFF); // Fully opaque by default
    
    this.app.stage.addChild(this.roofMask);
    roofLayer.mask = this.roofMask;
  }

  /**
   * Safely injects a Sprite or Container strictly into its designated Z-Layer on the Stage.
   */
  public addToLayer(child: Container | Sprite, layerId: ZLayer) {
    const targetLayer = this.layers.get(layerId);
    if (targetLayer) {
      targetLayer.addChild(child);
    } else {
      console.warn(`[LayerCompositor] Attempted to add child to invalid Stage layer ID: ${layerId}`);
    }
  }

  /**
   * Removes a child from its designated Z-Layer.
   */
  public removeFromLayer(child: Container | Sprite, layerId: ZLayer) {
    const targetLayer = this.layers.get(layerId);
    if (targetLayer) {
      targetLayer.removeChild(child);
    }
  }

  /**
   * Punches a visibility hole in the Roof Canopy mask around active operative coordinates.
   * @param x The operative's absolute world X
   * @param y The operative's absolute world Y
   * @param radiusPx The size of the visibility cutout in pixels (e.g., 5ft-30ft converted to pixels)
   */
  public punchRoofHole(x: number, y: number, radiusPx: number) {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080;

    this.roofMask.clear();
    this.roofMask.rect(0, 0, width, height);
    this.roofMask.fill(0xFFFFFF);
    this.roofMask.circle(x, y, radiusPx);
    this.roofMask.cut(); 
  }

  /**
   * Resets the roof mask to fully solid
   */
  public resetRoofMask() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080;

    this.roofMask.clear();
    this.roofMask.rect(0, 0, width, height);
    this.roofMask.fill(0xFFFFFF);
  }

  public getLayer(layerId: ZLayer): Container | undefined {
    return this.layers.get(layerId);
  }

  public getAllLayers(): Map<ZLayer, Container> {
    return this.layers;
  }
}
