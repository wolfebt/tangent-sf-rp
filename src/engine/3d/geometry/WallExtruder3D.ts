/**
 * @file WallExtruder3D.ts
 * @description Stage 3D: High-performance 3D Wall & Bulkhead Extrusion Generator.
 * Converts 2D WallSegment vector geometry into 3D indexed meshes with PBR materials,
 * automated thickness, door opening states, and structural breach textures.
 */

import * as THREE from 'three';
import { WALL_TYPES, DOOR_STATES } from '../../../schemas/vttWallSchema.js';

export interface Wall3DOptions {
  defaultHeight?: number;       // default wall height in world units (e.g. 70 = 10ft)
  defaultThickness?: number;    // default wall thickness in world units (e.g. 8 = ~1.2ft)
}

export class WallExtruder3D {
  private defaultHeight: number;
  private defaultThickness: number;

  // Shared reusable materials
  private solidWallMaterial: THREE.MeshStandardMaterial;
  private windowMaterial: THREE.MeshPhysicalMaterial;
  private etherealMaterial: THREE.MeshStandardMaterial;
  private doorClosedMaterial: THREE.MeshStandardMaterial;
  private doorOpenMaterial: THREE.MeshStandardMaterial;
  private doorBreachedMaterial: THREE.MeshStandardMaterial;
  private frameMaterial: THREE.MeshStandardMaterial;

  constructor(options: Wall3DOptions = {}) {
    this.defaultHeight = options.defaultHeight || 70; // 70px = 1 standard 5ft grid cell height = 10ft wall
    this.defaultThickness = options.defaultThickness || 8;

    // Sci-Fi Plasteel Wall Material
    this.solidWallMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.6,
      metalness: 0.4
    });

    // Reinforced Glass / Sensor-Transparent Window Material
    this.windowMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5
    });

    // Ethereal / Force Barrier Material
    this.etherealMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.4
    });

    // Bulkhead Door Materials
    this.doorClosedMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.5,
      metalness: 0.6,
      emissive: 0x78350f,
      emissiveIntensity: 0.2
    });

    this.doorOpenMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.5,
      metalness: 0.5,
      transparent: true,
      opacity: 0.3
    });

    this.doorBreachedMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.8,
      metalness: 0.2,
      wireframe: true
    });

    // Frame/Trim Material
    this.frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.8
    });
  }

  /**
   * Builds a complete Three.js Group containing all 3D walls for a scene.
   */
  public buildWallsGroup(walls: any[]): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Walls3DGroup';

    if (!Array.isArray(walls) || walls.length === 0) {
      return group;
    }

    for (const wall of walls) {
      const wallMesh = this.createWallMesh(wall);
      if (wallMesh) {
        group.add(wallMesh);
      }
    }

    return group;
  }

  /**
   * Creates a single 3D wall or door segment.
   * Coordinate mapping:
   * 2D X -> 3D X
   * 2D Y -> 3D Z (ground plane depth)
   * Wall Height -> 3D Y (vertical height)
   */
  public createWallMesh(wall: any): THREE.Group | null {
    if (!wall.p1 || !wall.p2) return null;

    const p1x = wall.p1.x;
    const p1y = wall.p1.y;
    const p2x = wall.p2.x;
    const p2y = wall.p2.y;

    const dx = p2x - p1x;
    const dy = p2y - p1y;
    const length = Math.hypot(dx, dy);
    if (length < 0.001) return null;

    const wallHeight = wall.height || this.defaultHeight;
    const thickness = wall.thickness || this.defaultThickness;
    const baseElevation = wall.baseZ || 0;

    const angle = Math.atan2(dy, dx);
    const midX = (p1x + p2x) / 2;
    const midZ = (p1y + p2y) / 2;

    const wallGroup = new THREE.Group();
    wallGroup.name = `Wall_${wall.id || 'seg'}`;
    wallGroup.position.set(midX, baseElevation, midZ);
    wallGroup.rotation.y = -angle; // Rotate to align with segment vector

    // Attach metadata for raycasting / interactive clicks
    (wallGroup as any).userData = {
      wallId: wall.id,
      wallType: wall.type,
      doorState: wall.doorState,
      isOpen: wall.isOpen,
      isLocked: wall.isLocked,
      isWall: true,
      originalWall: wall
    };

    const isDoor = wall.type === WALL_TYPES.DOOR;
    const isWindow = wall.type === WALL_TYPES.WINDOW;
    const isEthereal = wall.type === WALL_TYPES.ETHEREAL;

    if (isDoor) {
      // Build 3D Bulkhead Door with structural frame and sliding door leaf
      const frameThick = thickness * 1.2;
      const postWidth = Math.min(8, length * 0.15);
      const innerLength = Math.max(2, length - (postWidth * 2));

      // Left Post
      const leftPostGeom = new THREE.BoxGeometry(postWidth, wallHeight, frameThick);
      const leftPostMesh = new THREE.Mesh(leftPostGeom, this.frameMaterial);
      leftPostMesh.position.set(-length / 2 + postWidth / 2, wallHeight / 2, 0);
      leftPostMesh.castShadow = true;
      leftPostMesh.receiveShadow = true;
      wallGroup.add(leftPostMesh);

      // Right Post
      const rightPostGeom = new THREE.BoxGeometry(postWidth, wallHeight, frameThick);
      const rightPostMesh = new THREE.Mesh(rightPostGeom, this.frameMaterial);
      rightPostMesh.position.set(length / 2 - postWidth / 2, wallHeight / 2, 0);
      rightPostMesh.castShadow = true;
      rightPostMesh.receiveShadow = true;
      wallGroup.add(rightPostMesh);

      // Top Lintel Frame
      const lintelHeight = Math.min(10, wallHeight * 0.2);
      const lintelGeom = new THREE.BoxGeometry(length, lintelHeight, frameThick);
      const lintelMesh = new THREE.Mesh(lintelGeom, this.frameMaterial);
      lintelMesh.position.set(0, wallHeight - lintelHeight / 2, 0);
      lintelMesh.castShadow = true;
      lintelMesh.receiveShadow = true;
      wallGroup.add(lintelMesh);

      // Center Door Leaf
      const doorLeafHeight = wallHeight - lintelHeight;
      const doorGeom = new THREE.BoxGeometry(innerLength, doorLeafHeight, thickness * 0.8);
      
      let doorMat = this.doorClosedMaterial;
      if (wall.doorState === DOOR_STATES.BREACHED) {
        doorMat = this.doorBreachedMaterial;
      } else if (wall.doorState === DOOR_STATES.OPEN || wall.isOpen) {
        doorMat = this.doorOpenMaterial;
      }

      const doorMesh = new THREE.Mesh(doorGeom, doorMat);
      doorMesh.name = 'DoorLeaf';

      if (wall.doorState === DOOR_STATES.OPEN || wall.isOpen) {
        // Slide up into bulkhead ceiling recess
        doorMesh.position.set(0, doorLeafHeight / 2 + (doorLeafHeight * 0.8), 0);
      } else {
        doorMesh.position.set(0, doorLeafHeight / 2, 0);
        doorMesh.castShadow = true;
        doorMesh.receiveShadow = true;
      }

      wallGroup.add(doorMesh);

    } else {
      // Standard Solid, Window, or Ethereal Wall
      const wallGeom = new THREE.BoxGeometry(length, wallHeight, thickness);
      
      let mat: THREE.Material = this.solidWallMaterial;
      if (isWindow) {
        mat = this.windowMaterial;
      } else if (isEthereal) {
        mat = this.etherealMaterial;
      } else if (wall.color && wall.color !== '#e2e8f0') {
        // Custom colored wall (e.g. faction barricade)
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(wall.color),
          roughness: 0.6,
          metalness: 0.3
        });
      }

      const wallMesh = new THREE.Mesh(wallGeom, mat);
      wallMesh.position.set(0, wallHeight / 2, 0);
      wallMesh.castShadow = !isWindow && !isEthereal;
      wallMesh.receiveShadow = true;
      wallGroup.add(wallMesh);

      // Add top capping trim for visual realism
      const capGeom = new THREE.BoxGeometry(length, 2, thickness + 2);
      const capMesh = new THREE.Mesh(capGeom, this.frameMaterial);
      capMesh.position.set(0, wallHeight + 1, 0);
      wallGroup.add(capMesh);
    }

    return wallGroup;
  }

  public dispose() {
    this.solidWallMaterial.dispose();
    this.windowMaterial.dispose();
    this.etherealMaterial.dispose();
    this.doorClosedMaterial.dispose();
    this.doorOpenMaterial.dispose();
    this.doorBreachedMaterial.dispose();
    this.frameMaterial.dispose();
  }
}
