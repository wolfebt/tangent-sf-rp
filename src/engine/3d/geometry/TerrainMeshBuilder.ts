/**
 * @file TerrainMeshBuilder.ts
 * @description Stage 3D: Tactical Ground Plane, Heightfield and Biome Mesh Builder.
 * Translates 2D map backgrounds, underlay blueprints, and terrain polygon/hex patches
 * into 3D textured terrain meshes with plateau elevations.
 */

import * as THREE from 'three';

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

  private createPlateauMesh(terrain: any): THREE.Mesh | null {
    const elevation = terrain.elevation || terrain.height || 10; // in world units
    const color = terrain.color || '#334155';

    let geometry: THREE.BufferGeometry | null = null;

    if (terrain.renderType === 'hexTile' && terrain.radius) {
      // Hexagonal 3D Column / Step
      geometry = new THREE.CylinderGeometry(terrain.radius, terrain.radius, elevation, 6);
      geometry.translate(0, elevation / 2, 0);
    } else if (terrain.points && terrain.points.length >= 6) {
      // 2D Polygon shape extruded vertically
      const shape = new THREE.Shape();
      const pts = terrain.points;

      // Note: pts are flat array [x0, y0, x1, y1, ...]
      shape.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) {
        shape.lineTo(pts[i], pts[i + 1]);
      }
      shape.closePath();

      const extrudeSettings = {
        depth: elevation,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 2,
        bevelThickness: 2
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
        metalness: 0.3
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.7,
        metalness: 0.2
      });
    }

    const mesh = new THREE.Mesh(geometry, mat);
    mesh.name = `Plateau_${terrain.id || 'ter'}`;
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    if (terrain.x !== undefined && terrain.y !== undefined && terrain.renderType === 'hexTile') {
      mesh.position.set(terrain.x, 0, terrain.y);
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
    this.loadedTextures.set(url, texture);
    return texture;
  }

  public dispose() {
    this.loadedTextures.forEach(tex => tex.dispose());
    this.loadedTextures.clear();
  }
}
