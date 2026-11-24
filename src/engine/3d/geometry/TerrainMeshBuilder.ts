/**
 * @file TerrainMeshBuilder.ts
 * @description Stage 3D: Tactical Ground Plane, Heightfield and Biome Mesh Builder.
 * Translates 2D map backgrounds, underlay blueprints, and terrain polygon/hex patches
 * into 3D textured terrain meshes with plateau elevations.
 */

import * as THREE from 'three';
import { feetToWorldUnits } from '../scaleConstants.ts';

export interface TerrainMeshOptions {
  width?: number;
  height?: number;
  backgroundUrl?: string | null;
  underlayUrl?: string | null;
  underlayOpacity?: number;
}

export class TerrainMeshBuilder {
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
  private loadedTextures: Map<string, THREE.Texture> = new Map();

  /**
   * Builds the foundational ground plane with the battlemap texture or sci-fi grid.
   */
  public buildGroundPlane(
    width: number = 4200,
    depth: number = 4200,
    backgroundUrl?: string | null
  ): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(width, depth, 1, 1);
    geometry.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    let material: THREE.Material;

    if (backgroundUrl) {
      const texture = this.loadTexture(backgroundUrl);
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.1
      });
    } else {
      // Default tactical floor: Deep sci-fi obsidian deckplate
      material = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.85,
        metalness: 0.2
      });
    }

    const ground = new THREE.Mesh(geometry, material);
    ground.name = 'GroundPlane3D';
    ground.receiveShadow = true;
    ground.position.set(0, 0, 0);

    return ground;
  }

  /**
   * Builds 3D terrain elevation plateaus from 2D terrain shapes.
   */
  public buildTerrainPlateaus(terrains: any[]): THREE.Group {
    const group = new THREE.Group();
    group.name = 'TerrainPlateaus3D';

    if (!Array.isArray(terrains) || terrains.length === 0) {
      return group;
    }

    for (const t of terrains) {
      const plateau = this.createPlateauMesh(t);
      if (plateau) {
        group.add(plateau);
      }
    }

    return group;
  }

  private buildOpenStrokeRibbon(pts: number[], halfWidth: number): Array<{ x: number; y: number }> {
    const leftSide: Array<{ x: number; y: number }> = [];
    const rightSide: Array<{ x: number; y: number }> = [];
    const count = Math.floor(pts.length / 2);
    for (let i = 0; i < count; i++) {
      const x = pts[i * 2];
      const y = pts[i * 2 + 1];
      const nextIdx = Math.min(count - 1, i + 1);
      const prevIdx = Math.max(0, i - 1);
      const dx = pts[nextIdx * 2] - pts[prevIdx * 2];
      const dy = pts[nextIdx * 2 + 1] - pts[prevIdx * 2 + 1];
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      leftSide.push({ x: x + nx * halfWidth, y: y + ny * halfWidth });
      rightSide.push({ x: x - nx * halfWidth, y: y - ny * halfWidth });
    }
    return [...leftSide, ...rightSide.reverse()];
  }

  private createPlateauMesh(terrain: any): THREE.Mesh | null {
    const isRoof = Boolean(terrain.isRoofLayer);
    const roofElevationFt = terrain.elevationOffsetFt !== undefined ? Number(terrain.elevationOffsetFt) : 30;
    const baseElevationY = isRoof ? feetToWorldUnits(roofElevationFt) : 0;
    const elevation = isRoof
      ? feetToWorldUnits(1.5)
      : (terrain.elevationOffsetFt !== undefined
          ? feetToWorldUnits(terrain.elevationOffsetFt)
          : (terrain.elevation ?? (terrain.renderType === 'hexTile' ? terrain.height : 2) ?? 2)); // in world units
    const color = terrain.color || '#334155';

    let geometry: THREE.BufferGeometry | null = null;

    if (terrain.renderType === 'hexTile' && terrain.radius) {
      // Hexagonal 3D Column / Step
      geometry = new THREE.CylinderGeometry(terrain.radius, terrain.radius, elevation, 6);
      geometry.translate(0, elevation / 2, 0);
    } else if (terrain.points && terrain.points.length >= 4) {
      const shape = new THREE.Shape();
      const pts = terrain.points;

      if (terrain.closed === false && pts.length >= 4) {
        const halfW = Math.max(4, Number(terrain.strokeWidth || 24) / 2);
        const ribbon = this.buildOpenStrokeRibbon(pts, halfW);
        shape.moveTo(ribbon[0].x, ribbon[0].y);
        for (let i = 1; i < ribbon.length; i++) {
          shape.lineTo(ribbon[i].x, ribbon[i].y);
        }
        shape.closePath();
      } else if (pts.length >= 6) {
        // Closed polygon shape extruded vertically
        shape.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) {
          shape.lineTo(pts[i], pts[i + 1]);
        }
        shape.closePath();
      } else {
        return null;
      }

      const extrudeSettings = {
        depth: elevation,
        bevelEnabled: !isRoof,
        bevelSegments: isRoof ? 1 : 2,
        steps: 1,
        bevelSize: isRoof ? 0 : 2,
        bevelThickness: isRoof ? 0 : 2
      };

      geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      // Three.js extrudes along Z, rotate to extrude vertically along Y
      geometry.rotateX(Math.PI / 2);
      geometry.translate(0, elevation, 0);
    } else if (terrain.x !== undefined && terrain.y !== undefined && terrain.width && terrain.height) {
      // Rectangular terrain block
      geometry = new THREE.BoxGeometry(terrain.width, elevation, terrain.height);
      geometry.translate(terrain.width / 2, elevation / 2, terrain.height / 2);
    }

    if (!geometry) return null;

    let mat: THREE.Material;
    if (terrain.textureUrl) {
      const tex = this.loadTexture(terrain.textureUrl);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      mat = new THREE.MeshStandardMaterial({
        map: tex,
        color: new THREE.Color(color),
        roughness: 0.7,
        metalness: 0.3,
        ...(isRoof ? { transparent: true, opacity: 0.92 } : {})
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.7,
        metalness: 0.2,
        ...(isRoof ? { transparent: true, opacity: 0.92 } : {})
      });
    }

    const mesh = new THREE.Mesh(geometry, mat);
    mesh.name = `Plateau_${terrain.id || 'ter'}`;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    if (isRoof) {
      mesh.userData.deckSliceable = true;
      mesh.userData.isRoofLayer = true;
      mesh.userData.elevationFt = roofElevationFt;
      mesh.position.y = baseElevationY;
    }

    if (terrain.x !== undefined && terrain.y !== undefined && (!terrain.points || terrain.points.length < 4)) {
      mesh.position.set(terrain.x, baseElevationY, terrain.y);
    }

    return mesh;
  }

  private loadTexture(url: string): THREE.Texture {
    if (this.loadedTextures.has(url)) {
      return this.loadedTextures.get(url)!;
    }

    const texture = this.textureLoader.load(url, () => {
      texture.needsUpdate = true;
    });
    texture.userData.shared = true;
    this.loadedTextures.set(url, texture);
    return texture;
  }

  public dispose() {
    this.loadedTextures.forEach(tex => tex.dispose());
    this.loadedTextures.clear();
  }
}
