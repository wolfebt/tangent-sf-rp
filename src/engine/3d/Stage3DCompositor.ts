/**
 * @file Stage3DCompositor.ts
 * @description Stage 3D: Master Scene Graph Orchestrator for the Tangent Tactical 3D Stage.
 * Glues together Terrain, Extruded Walls, 3D Tokens & Standees, Dynamic Lighting,
 * 3D Grid, Waypoint Ruler, and Multi-Deck Slicing into a unified Three.js scene.
 */

import * as THREE from 'three';
import { TerrainMeshBuilder } from './geometry/TerrainMeshBuilder';
import { Grid3DOverlay } from './geometry/Grid3DOverlay';
import { WallExtruder3D } from './geometry/WallExtruder3D';
import { TokenStandee3D } from './tokens/TokenStandee3D';
import { Lighting3DManager } from './lighting/Lighting3DManager';
import { WaypointRuler3D } from './volumetrics/WaypointRuler3D';
import { LoSRaycast3D, type LoSResult3D } from './vision/LoSRaycast3D';
import { MultiDeckManager } from './cartography/MultiDeckManager';
import type { FusedToken } from '../state/VolatileSharder';

export class Stage3DCompositor {
  public scene: THREE.Scene;

  // Subsystems
  public terrainBuilder: TerrainMeshBuilder;
  public gridOverlay: Grid3DOverlay;
  public wallExtruder: WallExtruder3D;
  public tokenStandees: TokenStandee3D;
  public lightingManager: Lighting3DManager;
  public waypointRuler: WaypointRuler3D;
  public losRaycaster: LoSRaycast3D;
  public deckManager: MultiDeckManager;

  // Scene root containers
  private groundMesh: THREE.Mesh | null = null;
  private plateausGroup: THREE.Group = new THREE.Group();
  private wallsGroup: THREE.Group = new THREE.Group();
  private tokensGroup: THREE.Group = new THREE.Group();
  private propsGroup: THREE.Group = new THREE.Group();

  // Internal raycaster for pointer events
  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.name = 'Tactical3DScene';
    this.scene.background = new THREE.Color(0x060913); // Deep space / dark tactical void

    // Instantiate Subsystems
    this.terrainBuilder = new TerrainMeshBuilder();
    this.gridOverlay = new Grid3DOverlay();
    this.wallExtruder = new WallExtruder3D();
    this.tokenStandees = new TokenStandee3D();
    this.lightingManager = new Lighting3DManager({ enableShadows: true });
    this.waypointRuler = new WaypointRuler3D();
    this.losRaycaster = new LoSRaycast3D();
    this.deckManager = new MultiDeckManager();

    // Assemble Scene Hierarchy
    this.scene.add(this.lightingManager.getGroup());
    this.scene.add(this.gridOverlay.getGroup());
    this.scene.add(this.plateausGroup);
    this.scene.add(this.wallsGroup);
    this.scene.add(this.tokensGroup);
    this.scene.add(this.propsGroup);
    this.scene.add(this.waypointRuler.getGroup());

    // Initialize baseline ground
    this.groundMesh = this.terrainBuilder.buildGroundPlane();
    this.scene.add(this.groundMesh);
  }

  /**
   * Complete synchronization of the 3D scene from current map data and tokens.
   */
  public syncFromMap(
    map: any,
    tokens: FusedToken[],
    selectedTokenId: string | null = null,
    targetTokenId: string | null = null,
    camera?: THREE.Camera
  ) {
    if (!map) return;

    // 1. Sync Ground & Background
    if (this.groundMesh) {
      this.scene.remove(this.groundMesh);
      if (this.groundMesh.geometry) this.groundMesh.geometry.dispose();
      this.groundMesh = null;
    }
    const bgUrl = map.background_url || map.imageUrl || null;
    this.groundMesh = this.terrainBuilder.buildGroundPlane(4200, 4200, bgUrl);
    this.scene.add(this.groundMesh);

    // 2. Sync Terrain Elevation Plateaus
    this.plateausGroup.clear();
    const plateaus = this.terrainBuilder.buildTerrainPlateaus(map.terrains || []);
    this.plateausGroup.add(plateaus);

    // 3. Sync Extruded Walls & Doors
    this.wallsGroup.clear();
    const walls = this.wallExtruder.buildWallsGroup(map.walls || []);
    this.wallsGroup.add(walls);

    // 4. Sync Dynamic Lighting
    if (Array.isArray(map.lights)) {
      this.lightingManager.syncLights(map.lights);
    }

    // 5. Sync Tokens & Standees
    this.syncTokens(tokens, selectedTokenId, targetTokenId, camera);
  }

  /**
   * Updates only token transforms and standees (for high-speed movement updates).
   */
  public syncTokens(
    tokens: FusedToken[],
    selectedTokenId: string | null,
    targetTokenId: string | null,
    camera?: THREE.Camera
  ) {
    this.tokensGroup.clear();

    for (const token of tokens) {
      const isSelected = token.id === selectedTokenId;
      const isTarget = token.id === targetTokenId;
      const tokenMesh = this.tokenStandees.createTokenGroup(token, isSelected, isTarget, camera);
      this.tokensGroup.add(tokenMesh);
    }
  }

  /**
   * Per-frame animation tick (for lights, standee billboard orientation, particle hazards).
   */
  public update(_delta: number, elapsed: number, camera?: THREE.Camera) {
    // 1. Animate point lights
    this.lightingManager.update(elapsed);

    // 2. Orient portrait standees towards the camera (billboard effect)
    if (camera) {
      this.tokensGroup.traverse(child => {
        if (child.name === 'PortraitStandee' || child.name === 'FloatingHUD') {
          child.quaternion.copy(camera.quaternion);
        }
      });
    }

    // 3. Apply Multi-Deck Slice if active
    this.deckManager.applySliceToScene(this.scene);
  }

  /**
   * Raycasts a screen pointer into the 3D world to find the ground position (Y = 0 or active deck).
   */
  public raycastGround(
    normalizedX: number,
    normalizedY: number,
    camera: THREE.Camera
  ): THREE.Vector3 | null {
    this.raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), camera);

    if (this.groundMesh) {
      const intersects = this.raycaster.intersectObject(this.groundMesh, false);
      if (intersects.length > 0) {
        return intersects[0].point;
      }
    }

    // Fallback plane intersection with Y = 0
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(plane, target);
    return hit || null;
  }

  /**
   * Raycasts a screen pointer into tokens.
   */
  public raycastToken(
    normalizedX: number,
    normalizedY: number,
    camera: THREE.Camera
  ): FusedToken | null {
    this.raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), camera);
    const intersects = this.raycaster.intersectObjects(this.tokensGroup.children, true);

    if (intersects.length > 0) {
      // Traverse up to find userData.token
      let curr: THREE.Object3D | null = intersects[0].object;
      while (curr) {
        if ((curr as any).userData?.token) {
          return (curr as any).userData.token;
        }
        curr = curr.parent;
      }
    }
    return null;
  }

  /**
   * Raycasts a screen pointer into walls or doors.
   */
  public raycastWall(
    normalizedX: number,
    normalizedY: number,
    camera: THREE.Camera
  ): any | null {
    this.raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), camera);
    const intersects = this.raycaster.intersectObjects(this.wallsGroup.children, true);

    if (intersects.length > 0) {
      let curr: THREE.Object3D | null = intersects[0].object;
      while (curr) {
        if ((curr as any).userData?.isWall) {
          return (curr as any).userData;
        }
        curr = curr.parent;
      }
    }
    return null;
  }

  /**
   * Evaluates 3D Line-of-Sight between two tokens.
   */
  public evaluateLoS(attackerToken: FusedToken, targetToken: FusedToken): LoSResult3D {
    const occluders = [this.wallsGroup, this.plateausGroup];
    return this.losRaycaster.evaluateLoS(attackerToken, targetToken, occluders);
  }

  public dispose() {
    this.terrainBuilder.dispose();
    this.gridOverlay.dispose();
    this.wallExtruder.dispose();
    this.tokenStandees.dispose();
    this.lightingManager.dispose();
    this.waypointRuler.dispose();

    if (this.groundMesh) {
      if (this.groundMesh.geometry) this.groundMesh.geometry.dispose();
    }

    this.scene.clear();
  }
}
