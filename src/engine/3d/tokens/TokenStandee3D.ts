/**
 * @file TokenStandee3D.ts
 * @description Stage 3D: Tactical 3D Standee & Miniatures Manager for Tangent SF RP.
 * Renders hybrid upright holographic portrait standees on tactical bases with faction rims,
 * elevation stalks, floating HP/VP status indicators, action pips, and selection halos.
 */

import * as THREE from 'three';
import type { FusedToken } from '../../state/VolatileSharder';

export interface Token3DOptions {
  baseRadius?: number;        // in world units (default 24 = standard 5ft footprint)
  standeeHeight?: number;     // height of billboard standee (default 48 = ~6.8ft)
}

export class TokenStandee3D {
  private baseRadius: number;
  private standeeHeight: number;
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
  private tokenTextures: Map<string, THREE.Texture> = new Map();

  // Shared reusable materials & geometries
  private baseGeometry: THREE.CylinderGeometry;
  private baseRimGeometry: THREE.RingGeometry;
  private defaultStandeeGeometry: THREE.PlaneGeometry;

  constructor(options: Token3DOptions = {}) {
    this.baseRadius = options.baseRadius || 24;
    this.standeeHeight = options.standeeHeight || 48;

    // Plinth disc base
    this.baseGeometry = new THREE.CylinderGeometry(this.baseRadius, this.baseRadius * 1.05, 4, 32);
    this.baseGeometry.translate(0, 2, 0);

    // Faction glowing rim ring
    this.baseRimGeometry = new THREE.RingGeometry(this.baseRadius * 0.95, this.baseRadius * 1.05, 32);
    this.baseRimGeometry.rotateX(-Math.PI / 2);
    this.baseRimGeometry.translate(0, 4.1, 0);

    // Upright rectangular card / billboard
    this.defaultStandeeGeometry = new THREE.PlaneGeometry(this.standeeHeight * 0.85, this.standeeHeight);
    this.defaultStandeeGeometry.translate(0, this.standeeHeight / 2 + 4, 0);
  }

  /**
   * Builds or updates a 3D token object group.
   */
  public createTokenGroup(
    token: FusedToken,
    isSelected: boolean = false,
    isTarget: boolean = false,
    _camera?: THREE.Camera
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `Token3D_${token.id}`;

    // World placement: X = x, Z = y (2D coordinates map to XZ plane in 3D)
    // Elevation: elevation_ft in Tangent (5ft = 35 world units / 1 cell)
    const elevationWorld = ((token.elevation_ft || 0) / 5) * 35;
    group.position.set(token.x, elevationWorld, token.y);

    // Store metadata on userData for raycasting clicks
    (group as any).userData = {
      tokenId: token.id,
      token,
      isToken: true,
      elevation: token.elevation_ft || 0
    };

    const isSynthetic = !!token.is_synthetic || (token.species?.toLowerCase().includes('synthetic') ?? false);
    const isDowned = isSynthetic 
      ? (token.current_structure ?? token.base_structure ?? 60) <= 0
      : (token.current_health ?? token.current_hp ?? 30) <= 0;

    const factionColor = isDowned 
      ? 0xef4444 
      : token.is_persona 
        ? 0x06b6d4 // Cyan for Hero Personas
        : 0x8b5cf6; // Purple for NPCs/Enemies

    // 1. Tactical Base Plinth
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.8
    });
    const baseMesh = new THREE.Mesh(this.baseGeometry, baseMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // 2. Faction Glow Rim
    const rimMat = new THREE.MeshBasicMaterial({
      color: factionColor,
      side: THREE.DoubleSide
    });
    const rimMesh = new THREE.Mesh(this.baseRimGeometry, rimMat);
    group.add(rimMesh);

    // 3. Selection / Target Highlight Ring
    if (isSelected || isTarget) {
      const selectColor = isSelected ? 0xfacc15 : 0xef4444; // Yellow or Red
      const selectRingGeom = new THREE.RingGeometry(this.baseRadius * 1.1, this.baseRadius * 1.25, 32);
      selectRingGeom.rotateX(-Math.PI / 2);
      selectRingGeom.translate(0, 4.2, 0);

      const selectMat = new THREE.MeshBasicMaterial({
        color: selectColor,
        side: THREE.DoubleSide
      });
      const selectMesh = new THREE.Mesh(selectRingGeom, selectMat);
      group.add(selectMesh);
    }

    // 4. Upright Portrait Standee (Billboard)
    const standeeMesh = this.createStandeeCard(token, isDowned);
    group.add(standeeMesh);

    // 5. Floating Status & Health/Vitality Mini-Bars
    const hudGroup = this.createFloatingStatusHUD(token, isSynthetic);
    hudGroup.position.set(0, this.standeeHeight + 12, 0);
    group.add(hudGroup);

    // 6. Elevation Stalk (if airborne / hovering)
    if (elevationWorld > 1) {
      const stalk = this.createElevationStalk(elevationWorld, factionColor, token.elevation_ft || 0);
      group.add(stalk);
    }

    return group;
  }

  private createStandeeCard(token: FusedToken, isDowned: boolean): THREE.Mesh {
    const portraitUrl = (token as any).image_url || (token as any).avatar_url;
    let material: THREE.Material;

    if (portraitUrl) {
      const texture = this.loadTexture(portraitUrl);
      material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.1,
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide,
        color: isDowned ? 0xef4444 : 0xffffff
      });
    } else {
      // Procedural fallback standee texture with token initial
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Dark background with border
        ctx.fillStyle = isDowned ? '#450a0a' : (token.is_persona ? '#083344' : '#1e1b4b');
        ctx.fillRect(0, 0, 256, 320);

        ctx.strokeStyle = token.is_persona ? '#22d3ee' : '#a855f7';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, 246, 310);

        // Name / Initial
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 72px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = (token.name || 'U').substring(0, 2).toUpperCase();
        ctx.fillText(initial, 128, 140);

        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#94a3b8';
        const nameShort = (token.name || 'Unit').substring(0, 12);
        ctx.fillText(nameShort, 128, 240);
      }

      const canvasTexture = new THREE.CanvasTexture(canvas);
      material = new THREE.MeshStandardMaterial({
        map: canvasTexture,
        roughness: 0.4,
        side: THREE.DoubleSide
      });
    }

    const standee = new THREE.Mesh(this.defaultStandeeGeometry, material);
    standee.name = 'PortraitStandee';
    standee.castShadow = true;
    return standee;
  }

  private createFloatingStatusHUD(token: FusedToken, isSynthetic: boolean): THREE.Group {
    const group = new THREE.Group();
    group.name = 'FloatingHUD';

    const barWidth = 36;
    const barHeight = 3.5;

    // Background Bar Frame
    const bgGeom = new THREE.PlaneGeometry(barWidth + 2, (barHeight * 2) + 3);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide });
    const bgMesh = new THREE.Mesh(bgGeom, bgMat);
    group.add(bgMesh);

    if (isSynthetic) {
      // Single Structure Bar (Amber)
      const sCur = token.current_structure ?? token.base_structure ?? 60;
      const sMax = token.base_structure ?? 60;
      const sRatio = Math.max(0, Math.min(1, sCur / sMax));

      const barGeom = new THREE.PlaneGeometry(barWidth * sRatio, barHeight * 1.5);
      barGeom.translate((barWidth * sRatio) / 2 - barWidth / 2, 0, 0.1);
      const barMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
      const barMesh = new THREE.Mesh(barGeom, barMat);
      group.add(barMesh);

    } else {
      // Dual VP (Cyan) & HP (Rose) Bars
      const vCur = token.current_vitality ?? token.base_vitality ?? 30;
      const vMax = token.base_vitality ?? 30;
      const vRatio = Math.max(0, Math.min(1, vCur / vMax));

      const hCur = token.current_health ?? token.current_hp ?? 30;
      const hMax = token.base_health ?? token.base_hp ?? 30;
      const hRatio = Math.max(0, Math.min(1, hCur / hMax));

      // VP Bar (top)
      const vpGeom = new THREE.PlaneGeometry(barWidth * vRatio, barHeight);
      vpGeom.translate((barWidth * vRatio) / 2 - barWidth / 2, barHeight / 2 + 0.5, 0.1);
      const vpMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide });
      const vpMesh = new THREE.Mesh(vpGeom, vpMat);
      group.add(vpMesh);

      // HP Bar (bottom)
      const hpGeom = new THREE.PlaneGeometry(barWidth * hRatio, barHeight);
      hpGeom.translate((barWidth * hRatio) / 2 - barWidth / 2, -barHeight / 2 - 0.5, 0.1);
      const hpColor = hCur <= 0 ? 0x991b1b : 0xf43f5e;
      const hpMat = new THREE.MeshBasicMaterial({ color: hpColor, side: THREE.DoubleSide });
      const hpMesh = new THREE.Mesh(hpGeom, hpMat);
      group.add(hpMesh);
    }

    return group;
  }

  private createElevationStalk(elevationWorld: number, color: number, _elevationFt?: number): THREE.Group {
    const stalkGroup = new THREE.Group();
    stalkGroup.name = 'ElevationStalk';

    // Vertical dashed laser stalk from ground (Y = -elevationWorld) to token base (Y = 0)
    const points = [
      new THREE.Vector3(0, -elevationWorld, 0),
      new THREE.Vector3(0, 0, 0)
    ];
    const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineDashedMaterial({
      color,
      dashSize: 6,
      gapSize: 4,
      linewidth: 2,
      depthTest: false,
      transparent: true,
      opacity: 0.85
    });
    const line = new THREE.Line(lineGeom, lineMat);
    line.computeLineDistances();
    stalkGroup.add(line);

    // Ground footprint shadow ring
    const ringGeom = new THREE.RingGeometry(this.baseRadius * 0.8, this.baseRadius * 1.1, 32);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.set(0, -elevationWorld + 0.2, 0);
    stalkGroup.add(ring);

    return stalkGroup;
  }

  private loadTexture(url: string): THREE.Texture {
    if (this.tokenTextures.has(url)) {
      return this.tokenTextures.get(url)!;
    }
    const texture = this.textureLoader.load(url, () => {
      texture.needsUpdate = true;
    });
    this.tokenTextures.set(url, texture);
    return texture;
  }

  public dispose() {
    this.baseGeometry.dispose();
    this.baseRimGeometry.dispose();
    this.defaultStandeeGeometry.dispose();
    this.tokenTextures.forEach(t => t.dispose());
    this.tokenTextures.clear();
  }
}
