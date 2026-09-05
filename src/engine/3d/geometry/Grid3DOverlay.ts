/**
 * @file Grid3DOverlay.ts
 * @description Stage 3D: Tactical 3D Grid Planes and Altitude Indicators.
 * Renders high-precision Square and Hexagonal grid lines in world coordinates,
 * supporting dynamic cell sizes, elevation altitude markers, and coordinate snapping.
 */

import * as THREE from 'three';
import { GridType } from '../../math/CoordinateEngine';

export interface Grid3DOptions {
  gridType?: GridType;
  cellSize?: number;        // in pixels / world units (default 70 = 5ft)
  gridExtent?: number;      // total grid width/depth (default 5000)
  gridColor?: string | number;
  centerLineColor?: string | number;
}

export class Grid3DOverlay {
  private group: THREE.Group;
  private cellSize: number;
  private gridExtent: number;
  private gridType: GridType;
  private gridColor: number;
  private centerLineColor: number;
  private gridMesh: THREE.Object3D | null = null;

  constructor(options: Grid3DOptions = {}) {
    this.group = new THREE.Group();
    this.group.name = 'Grid3DOverlay';
    this.cellSize = options.cellSize || 70;
    this.gridExtent = options.gridExtent || 4200;
    this.gridType = options.gridType || GridType.Square;
    this.gridColor = typeof options.gridColor === 'string' 
      ? parseInt(options.gridColor.replace('#', '0x'), 16) 
      : (options.gridColor || 0x1e293b);
    this.centerLineColor = typeof options.centerLineColor === 'string'
      ? parseInt(options.centerLineColor.replace('#', '0x'), 16)
      : (options.centerLineColor || 0x06b6d4);

    this.rebuildGrid();
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public setGridType(type: GridType) {
    if (this.gridType !== type) {
      this.gridType = type;
      this.rebuildGrid();
    }
  }

  public setCellSize(size: number) {
    if (this.cellSize !== size && size > 0) {
      this.cellSize = size;
      this.rebuildGrid();
    }
  }

  public setVisible(visible: boolean) {
    this.group.visible = visible;
  }

  public rebuildGrid() {
    if (this.gridMesh) {
      this.group.remove(this.gridMesh);
      if ((this.gridMesh as any).geometry) (this.gridMesh as any).geometry.dispose();
      this.gridMesh = null;
    }

    if (this.gridType === GridType.Square) {
      this.gridMesh = this.createSquareGrid();
    } else {
      this.gridMesh = this.createHexGrid();
    }

    if (this.gridMesh) {
      this.group.add(this.gridMesh);
    }
  }

  private createSquareGrid(): THREE.LineSegments {
    const divisions = Math.floor(this.gridExtent / this.cellSize);
    const actualExtent = divisions * this.cellSize;
    const halfActual = actualExtent / 2;

    const vertices: number[] = [];
    const colors: number[] = [];

    const c1 = new THREE.Color(this.gridColor);
    const cCenter = new THREE.Color(this.centerLineColor);

    // X-parallel and Z-parallel lines
    for (let i = 0; i <= divisions; i++) {
      const pos = -halfActual + (i * this.cellSize);
      const isCenter = Math.abs(pos) < 0.001;
      const col = isCenter ? cCenter : c1;

      // Line along X
      vertices.push(-halfActual, 0.1, pos, halfActual, 0.1, pos);
      colors.push(col.r, col.g, col.b, col.r, col.g, col.b);

      // Line along Z
      vertices.push(pos, 0.1, -halfActual, pos, 0.1, halfActual);
      colors.push(col.r, col.g, col.b, col.r, col.g, col.b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });

    const lines = new THREE.LineSegments(geometry, material);
    lines.name = 'SquareGridLines';
    return lines;
  }

  private createHexGrid(): THREE.LineSegments {
    // Hexagonal grid lines
    const hexRadius = this.cellSize / Math.sqrt(3);
    const vertices: number[] = [];

    const isFlatTop = this.gridType === GridType.HexFlatTop;
    const colDist = isFlatTop ? hexRadius * 1.5 : Math.sqrt(3) * hexRadius;
    const rowDist = isFlatTop ? Math.sqrt(3) * hexRadius : hexRadius * 1.5;

    const cols = Math.floor(this.gridExtent / colDist);
    const rows = Math.floor(this.gridExtent / rowDist);

    for (let col = -cols / 2; col <= cols / 2; col++) {
      for (let row = -rows / 2; row <= rows / 2; row++) {
        let cx = col * colDist;
        let cz = row * rowDist;

        if (isFlatTop && Math.abs(col) % 2 === 1) {
          cz += rowDist / 2;
        } else if (!isFlatTop && Math.abs(row) % 2 === 1) {
          cx += colDist / 2;
        }

        // Draw individual hexagon perimeter lines
        for (let i = 0; i < 6; i++) {
          const angle1 = (Math.PI / 3) * (i + (isFlatTop ? 0 : 0.5));
          const angle2 = (Math.PI / 3) * (i + 1 + (isFlatTop ? 0 : 0.5));

          const x1 = cx + hexRadius * Math.cos(angle1);
          const z1 = cz + hexRadius * Math.sin(angle1);
          const x2 = cx + hexRadius * Math.cos(angle2);
          const z2 = cz + hexRadius * Math.sin(angle2);

          vertices.push(x1, 0.1, z1, x2, 0.1, z2);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.LineBasicMaterial({
      color: this.gridColor,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });

    const lines = new THREE.LineSegments(geometry, material);
    lines.name = 'HexGridLines';
    return lines;
  }

  /**
   * Creates a vertical altitude laser stalk and elevation ring for an elevated token.
   */
  public createElevationStalk(groundX: number, groundZ: number, elevationY: number, color: number = 0x06b6d4): THREE.Group {
    const group = new THREE.Group();
    group.name = 'ElevationStalk';

    // Vertical dashed laser line
    const lineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(groundX, 0.2, groundZ),
      new THREE.Vector3(groundX, elevationY, groundZ)
    ]);
    const lineMat = new THREE.LineDashedMaterial({
      color,
      dashSize: 4,
      gapSize: 2,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.8
    });
    const line = new THREE.Line(lineGeom, lineMat);
    line.computeLineDistances();
    group.add(line);

    // Ground footprint shadow ring
    const groundRingGeom = new THREE.RingGeometry(20, 24, 32);
    groundRingGeom.rotateX(-Math.PI / 2);
    const groundRingMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const groundRing = new THREE.Mesh(groundRingGeom, groundRingMat);
    groundRing.position.set(groundX, 0.3, groundZ);
    group.add(groundRing);

    return group;
  }

  public dispose() {
    if (this.gridMesh) {
      if ((this.gridMesh as any).geometry) (this.gridMesh as any).geometry.dispose();
      if ((this.gridMesh as any).material) (this.gridMesh as any).material.dispose();
    }
    this.group.clear();
  }
}
