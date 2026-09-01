/**
 * @file LayerCompositor.ts
 * @description Stage 2.2: Z-Axis hierarchy enforcement and render grouping.
 * Instantiates the rigid PIXI.Container tree and utilizes RenderGroup optimization 
 * to prevent the CPU from recalculating transforms for static layers (like the map).
 */

import { Application, Container, Sprite, Graphics } from 'pixi.js';

// Strict Enum to prevent Z-fighting and enforce Tangent's visual hierarchy
export enum ZLayer {
  BackgroundMap = 0,
  UnderlayDebris = 10,
  Tokens = 20,
  RoofCanopy = 30,
  DynamicFX = 40,
  LightingDarkness = 50,
  FogOfWar = 60,
  ForegroundUI = 70
}

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
    
    // Sort the enum values to ensure they are added to the stage in strict numerical order
    const sortedLayers = Object.values(ZLayer)
      .filter(value => typeof value === 'number')
      .sort((a, b) => (a as number) - (b as number)) as ZLayer[];

    for (const layerId of sortedLayers) {
      const container = new Container();
      container.label = `Layer_${ZLayer[layerId]}`;
      container.zIndex = layerId;

      // OPTIMIZATION: RenderGroups (Pixi v8 feature). 
      // If a container is marked as a render group, the engine handles its local transforms 
      // collectively and skips heavy CPU traversal if its children are mostly static.
      if (layerId === ZLayer.BackgroundMap || layerId === ZLayer.UnderlayDebris) {
        container.isRenderGroup = true; 
        // Prevents the engine from wasting cycles calculating matrix math for stationary map tiles
      }

      this.layers.set(layerId, container);
      this.app.stage.addChild(container);
    }

    // Sort the stage once based on the zIndex we just assigned
    this.app.stage.sortChildren();
    
    this.setupRoofMasking();
    console.log('[LayerCompositor] Strict Z-Axis hierarchy initialized with RenderGroup optimizations.');
  }

  private setupRoofMasking() {
    const roofLayer = this.layers.get(ZLayer.RoofCanopy);
    if (!roofLayer) return;

    // The Roof Canopy layer needs an alpha mask so we can "see inside" buildings
    // when a token enters them, without making the entire roof disappear.
    // We bind a Graphics object as the mask.
    this.roofMask.rect(0, 0, window.innerWidth, window.innerHeight);
    this.roofMask.fill(0xFFFFFF); // Fully opaque by default
    
    // Add the mask to the scene so it can be rendered (it won't be visible directly)
    this.app.stage.addChild(this.roofMask);
    roofLayer.mask = this.roofMask;
  }

  /**
   * Safely injects a Sprite or Container strictly into its designated Z-Layer.
   * Prevents developers/agents from appending items directly to the main stage.
   */
  public addToLayer(child: Container | Sprite, layerId: ZLayer) {
    const targetLayer = this.layers.get(layerId);
    if (targetLayer) {
      targetLayer.addChild(child);
    } else {
      console.warn(`[LayerCompositor] Attempted to add child to invalid layer ID: ${layerId}`);
    }
  }

  /**
   * Punches a hole in the Roof Canopy mask based on the active token's coordinates.
   * @param x The token's absolute world X
   * @param y The token's absolute world Y
   * @param radius The size of the visibility cutout (e.g., 30ft converted to pixels)
   */
  public punchRoofHole(x: number, y: number, radius: number) {
    // Clear previous frame's mask
    this.roofMask.clear();
    
    // Fill the screen with white (opaque)
    this.roofMask.rect(0, 0, window.innerWidth, window.innerHeight);
    this.roofMask.fill(0xFFFFFF);
    
    // Erase a circle where the token is (transparent)
    this.roofMask.circle(x, y, radius);
    this.roofMask.cut(); 
  }

  public getLayer(layerId: ZLayer): Container | undefined {
    return this.layers.get(layerId);
  }
}