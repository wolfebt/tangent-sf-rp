/**
 * @file Lighting3DManager.ts
 * @description Stage 3D: Dynamic Tactical Lighting and Atmospheric Environment for Three.js.
 * Renders directional keylights, ambient tactical fill, dynamic point lights with real-time shadows,
 * animated light modulation (flicker, pulse, strobe), and atmospheric background skyboxes.
 */

import * as THREE from 'three';
import type { SceneLightSource } from '../../vision/LightSourceManager';

export interface Lighting3DOptions {
  enableShadows?: boolean;
  ambientIntensity?: number;
}

export class Lighting3DManager {
  private group: THREE.Group;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private pointLightsMap: Map<string, { light: THREE.PointLight; config: SceneLightSource }> = new Map();
  private enableShadows: boolean;

  constructor(options: Lighting3DOptions = {}) {
    this.group = new THREE.Group();
    this.group.name = 'Lighting3DGroup';
    this.enableShadows = options.enableShadows !== false;

    // Ambient light provides baseline tactical readability (soft cool sci-fi tint)
    this.ambientLight = new THREE.AmbientLight(0x1e293b, options.ambientIntensity || 0.65);
    this.group.add(this.ambientLight);

    // Directional Keylight (Sun / Main Overhead Gantry)
    this.directionalLight = new THREE.DirectionalLight(0xf8fafc, 1.2);
    this.directionalLight.position.set(400, 1000, 500);

    if (this.enableShadows) {
      this.directionalLight.castShadow = true;
      this.directionalLight.shadow.mapSize.width = 2048;
      this.directionalLight.shadow.mapSize.height = 2048;
      this.directionalLight.shadow.camera.near = 10;
      this.directionalLight.shadow.camera.far = 3500;

      const d = 1200;
      this.directionalLight.shadow.camera.left = -d;
      this.directionalLight.shadow.camera.right = d;
      this.directionalLight.shadow.camera.top = d;
      this.directionalLight.shadow.camera.bottom = -d;
      this.directionalLight.shadow.bias = -0.0005;
    }

    this.group.add(this.directionalLight);
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  /**
   * Synchronizes scene point lights from the campaign map / LightSourceManager.
   */
  public syncLights(lights: SceneLightSource[]) {
    const currentIds = new Set(lights.map(l => l.id));

    // Remove defunct lights
    for (const [id, entry] of this.pointLightsMap.entries()) {
      if (!currentIds.has(id)) {
        this.group.remove(entry.light);
        entry.light.dispose();
        this.pointLightsMap.delete(id);
      }
    }

    // Add or update active lights
    for (const l of lights) {
      const colorHex = typeof l.color === 'string'
        ? parseInt(l.color.replace('#', '0x'), 16) || 0xf59e0b
        : l.color;

      const lightDist = (l.radius || 180) * 1.5;
      const posX = l.x;
      const posZ = l.y;
      const posY = (l as any).z || (l as any).elevation || 40; // Default elevation for light fixtures

      if (this.pointLightsMap.has(l.id)) {
        const entry = this.pointLightsMap.get(l.id)!;
        entry.light.color.setHex(colorHex);
        entry.light.distance = lightDist;
        entry.light.position.set(posX, posY, posZ);
        entry.config = l;
      } else {
        const pointLight = new THREE.PointLight(colorHex, (l.intensity || 1.0) * 1.8, lightDist, 1.2);
        pointLight.position.set(posX, posY, posZ);
        pointLight.castShadow = this.enableShadows && this.pointLightsMap.size < 8; // Limit shadow casting point lights for 60fps
        if (pointLight.castShadow) {
          pointLight.shadow.bias = -0.002;
        }

        // Small glowing orb mesh at light fixture position
        const orbGeom = new THREE.SphereGeometry(3, 8, 8);
        const orbMat = new THREE.MeshBasicMaterial({ color: colorHex });
        const orb = new THREE.Mesh(orbGeom, orbMat);
        pointLight.add(orb);

        this.group.add(pointLight);
        this.pointLightsMap.set(l.id, { light: pointLight, config: l });
      }
    }
  }

  /**
   * Per-frame animation for pulsing, flickering, or strobing lights.
   */
  public update(timeSec: number) {
    for (const entry of this.pointLightsMap.values()) {
      const { light, config } = entry;
      const baseIntensity = (config.intensity || 1.0) * 1.8;
      const animType = config.animation || 'none';

      let mult = 1.0;
      switch (animType) {
        case 'flicker':
          mult = 0.8 + 0.3 * Math.sin(timeSec * 15 + config.x) * Math.cos(timeSec * 23);
          break;
        case 'pulse':
          mult = 0.7 + 0.3 * Math.sin(timeSec * 3);
          break;
        case 'strobe':
          mult = (Math.floor(timeSec * 4) % 2 === 0) ? 1.0 : 0.1;
          break;
        case 'emergency':
          mult = 0.4 + 0.6 * Math.abs(Math.sin(timeSec * 2));
          break;
        default:
          mult = 1.0;
      }

      light.intensity = baseIntensity * Math.max(0, mult);
    }
  }

  /**
   * Configures environmental lighting preset (Atmosphere)
   */
  public setAtmosphere(preset: 'clear' | 'space' | 'cyberpunk' | 'toxic' | 'interior') {
    switch (preset) {
      case 'space':
        this.ambientLight.color.setHex(0x0a0f1d);
        this.ambientLight.intensity = 0.3;
        this.directionalLight.color.setHex(0x93c5fd);
        this.directionalLight.intensity = 1.5;
        break;
      case 'cyberpunk':
        this.ambientLight.color.setHex(0x1e1b4b);
        this.ambientLight.intensity = 0.5;
        this.directionalLight.color.setHex(0x06b6d4);
        this.directionalLight.intensity = 1.0;
        break;
      case 'toxic':
        this.ambientLight.color.setHex(0x14532d);
        this.ambientLight.intensity = 0.6;
        this.directionalLight.color.setHex(0x84cc16);
        this.directionalLight.intensity = 0.8;
        break;
      case 'interior':
        this.ambientLight.color.setHex(0x334155);
        this.ambientLight.intensity = 0.7;
        this.directionalLight.color.setHex(0xfef08a);
        this.directionalLight.intensity = 0.9;
        break;
      case 'clear':
      default:
        this.ambientLight.color.setHex(0x1e293b);
        this.ambientLight.intensity = 0.65;
        this.directionalLight.color.setHex(0xf8fafc);
        this.directionalLight.intensity = 1.2;
    }
  }

  public dispose() {
    this.ambientLight.dispose();
    this.directionalLight.dispose();
    for (const entry of this.pointLightsMap.values()) {
      entry.light.dispose();
    }
    this.pointLightsMap.clear();
    this.group.clear();
  }
}
