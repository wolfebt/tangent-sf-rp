/**
 * @file WaypointRuler3D.ts
 * @description Stage 3D: Tactical 3D Euclidean Waypoint Ruler and Measurement Spline.
 * Computes 3D distance (\sqrt{\Delta x^2 + \Delta y^2 + \Delta z^2}), horizontal foot travel,
 * vertical elevation gain/loss, and converts to Tangent 5ft cells & AP costs.
 */

import * as THREE from 'three';

export interface RulerMeasurementResult {
  distanceFt: number;
  horizontalFt: number;
  verticalFt: number;
  cells: number;
  apCost: number;
}

export class WaypointRuler3D {
  private group: THREE.Group;
  private lineMesh: THREE.Line | null = null;
  private startMarker: THREE.Mesh | null = null;
  private endMarker: THREE.Mesh | null = null;
  private dropLine: THREE.Line | null = null;
  private labelSprite: THREE.Sprite | null = null;

  private startPos: THREE.Vector3 | null = null;
  private endPos: THREE.Vector3 | null = null;
  private isActive: boolean = false;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'WaypointRuler3DGroup';
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public start(x: number, y: number, z: number) {
    this.startPos = new THREE.Vector3(x, y, z);
    this.endPos = new THREE.Vector3(x, y, z);
    this.isActive = true;
    this.group.visible = true;
    this.rebuildRuler();
  }

  public updateEnd(x: number, y: number, z: number): RulerMeasurementResult | null {
    if (!this.isActive || !this.startPos) return null;
    this.endPos = new THREE.Vector3(x, y, z);
    this.rebuildRuler();
    return this.calculateMetrics();
  }

  public clear() {
    this.isActive = false;
    this.startPos = null;
    this.endPos = null;
    this.group.visible = false;
    this.clearMeshes();
  }

  public calculateMetrics(): RulerMeasurementResult | null {
    if (!this.startPos || !this.endPos) return null;

    // 1 cell = 70 world units = 5 ft -> scale factor: 5 / 70 = 1 / 14 ft per unit
    const ftPerUnit = 5 / 70;

    const dx = (this.endPos.x - this.startPos.x) * ftPerUnit;
    const dy = (this.endPos.y - this.startPos.y) * ftPerUnit;
    const dz = (this.endPos.z - this.startPos.z) * ftPerUnit;

    const horizontalFt = Math.hypot(dx, dz);
    const verticalFt = Math.abs(dy);
    const distanceFt = Math.hypot(horizontalFt, dy);
    const cells = Math.round((distanceFt / 5) * 10) / 10;
    const apCost = Math.max(1, Math.ceil(distanceFt / 30)); // 30ft per 1 AP

    return {
      distanceFt: Math.round(distanceFt * 10) / 10,
      horizontalFt: Math.round(horizontalFt * 10) / 10,
      verticalFt: Math.round(verticalFt * 10) / 10,
      cells,
      apCost
    };
  }

  private rebuildRuler() {
    this.clearMeshes();
    if (!this.startPos || !this.endPos) return;

    const metrics = this.calculateMetrics();
    if (!metrics) return;

    // 1. Direct 3D Euclidean laser line
    const lineGeom = new THREE.BufferGeometry().setFromPoints([this.startPos, this.endPos]);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x22d3ee, // Cyan laser
      dashSize: 6,
      gapSize: 3,
      linewidth: 2,
      depthTest: false,
      transparent: true,
      opacity: 0.95
    });
    this.lineMesh = new THREE.Line(lineGeom, lineMat);
    this.lineMesh.computeLineDistances();
    this.group.add(this.lineMesh);

    // 2. Start & End Markers (spheres + rings)
    const markerGeom = new THREE.SphereGeometry(4, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, depthTest: false });

    this.startMarker = new THREE.Mesh(markerGeom, markerMat);
    this.startMarker.position.copy(this.startPos);
    this.group.add(this.startMarker);

    this.endMarker = new THREE.Mesh(markerGeom, markerMat);
    this.endMarker.position.copy(this.endPos);
    this.group.add(this.endMarker);

    // 3. Vertical drop line if target is elevated above ground (or start)
    if (Math.abs(this.endPos.y) > 2) {
      const dropGeom = new THREE.BufferGeometry().setFromPoints([
        this.endPos,
        new THREE.Vector3(this.endPos.x, 0.2, this.endPos.z)
      ]);
      const dropMat = new THREE.LineDashedMaterial({
        color: 0xfacc15, // Yellow altitude drop line
        dashSize: 3,
        gapSize: 3,
        transparent: true,
        opacity: 0.6,
        depthTest: false
      });
      this.dropLine = new THREE.Line(dropGeom, dropMat);
      this.dropLine.computeLineDistances();
      this.group.add(this.dropLine);
    }

    // 4. Floating 3D Text Badge at midpoint
    const midPoint = new THREE.Vector3()
      .addVectors(this.startPos, this.endPos)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(0, 15, 0));

    this.labelSprite = this.createMeasurementBadge(metrics);
    this.labelSprite.position.copy(midPoint);
    this.group.add(this.labelSprite);
  }

  private createMeasurementBadge(metrics: RulerMeasurementResult): THREE.Sprite {
    if (typeof document === 'undefined') {
      return new THREE.Sprite();
    }
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Rounded pill box background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(10, 10, 364, 108, 20);
      ctx.fill();
      ctx.stroke();

      // Main Distance in large bold font
      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${metrics.distanceFt} FT (${metrics.cells} Cells)`, 192, 54);

      // Sub-metrics (Horizontal, Vertical, AP)
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 20px monospace';
      let subText = `AP Cost: ${metrics.apCost}`;
      if (metrics.verticalFt > 0) {
        subText += ` | Elev: ${metrics.verticalFt}ft`;
      }
      ctx.fillText(subText, 192, 92);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      transparent: true
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(60, 20, 1);
    return sprite;
  }

  private clearMeshes() {
    if (this.lineMesh) {
      this.group.remove(this.lineMesh);
      this.lineMesh.geometry.dispose();
      (this.lineMesh.material as THREE.Material).dispose();
      this.lineMesh = null;
    }
    if (this.startMarker) {
      this.group.remove(this.startMarker);
      this.startMarker.geometry.dispose();
      (this.startMarker.material as THREE.Material).dispose();
      this.startMarker = null;
    }
    if (this.endMarker) {
      this.group.remove(this.endMarker);
      this.endMarker.geometry.dispose();
      (this.endMarker.material as THREE.Material).dispose();
      this.endMarker = null;
    }
    if (this.dropLine) {
      this.group.remove(this.dropLine);
      this.dropLine.geometry.dispose();
      (this.dropLine.material as THREE.Material).dispose();
      this.dropLine = null;
    }
    if (this.labelSprite) {
      this.group.remove(this.labelSprite);
      if (this.labelSprite.material.map) this.labelSprite.material.map.dispose();
      this.labelSprite.material.dispose();
      this.labelSprite = null;
    }
  }

  public dispose() {
    this.clearMeshes();
    this.group.clear();
  }
}
