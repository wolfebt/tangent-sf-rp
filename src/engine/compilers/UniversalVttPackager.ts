/**
 * @file UniversalVttPackager.ts
 * @description Universal VTT (.dd2vtt) Compiler and Packager.
 * Formats tactical maps with line-of-sight vectors, portal definitions, and dynamic lighting
 * into the industry-standard Universal VTT (.dd2vtt) format for Foundry VTT, Roll20, and Fantasy Grounds.
 * Includes collinear segment reduction to optimize VTT rendering performance.
 */

export interface UvttPoint {
  x: number;
  y: number;
}

export interface UvttPortal {
  position: UvttPoint;
  bounds: [UvttPoint, UvttPoint];
  closed: boolean;
  freemove: boolean;
}

export interface UvttLight {
  position: UvttPoint;
  range: number;
  color: string; // 6-character hex without # or with # stripped
  intensity: number;
}

export interface UniversalVttFile {
  format: 0.2;
  resolution: {
    map_origin: UvttPoint;
    map_size: UvttPoint;
    pixels_per_grid: number;
  };
  image: string; // Base64 WebP image payload
  line_of_sight: Array<[UvttPoint, UvttPoint]>;
  portals: UvttPortal[];
  lights: UvttLight[];
}

export interface RawWallSegment {
  p1: [number, number];
  p2: [number, number];
  blocksLight?: boolean;
}

export interface RawPortalInput {
  col: number;
  row: number;
  horizontal?: boolean;
  closed?: boolean;
  freemove?: boolean;
}

export interface RawLightInput {
  col: number;
  row: number;
  rangeFt: number;
  colorHex?: string;
  intensity?: number;
}

export interface UvttPackageRequest {
  widthCells: number;
  heightCells: number;
  pixelsPerGrid?: number;
  base64Image?: string;
  walls?: RawWallSegment[];
  portals?: RawPortalInput[];
  lights?: RawLightInput[];
}

export class UniversalVttPackager {
  /**
   * Compiles tactical map data into a valid .dd2vtt JSON object and string.
   */
  public static package(request: UvttPackageRequest): {
    data: UniversalVttFile;
    jsonString: string;
    stats: { wallCount: number; portalCount: number; lightCount: number };
  } {
    const {
      widthCells,
      heightCells,
      pixelsPerGrid = 100,
      base64Image = '',
      walls = [],
      portals = [],
      lights = []
    } = request;

    // 1. Process and simplify Line of Sight walls
    const simplifiedWalls = this.reduceCollinearSegments(walls);

    const formattedLos: Array<[UvttPoint, UvttPoint]> = simplifiedWalls.map(w => [
      { x: Number(w.p1[0].toFixed(3)), y: Number(w.p1[1].toFixed(3)) },
      { x: Number(w.p2[0].toFixed(3)), y: Number(w.p2[1].toFixed(3)) }
    ]);

    // 2. Format Portals / Doors
    const formattedPortals: UvttPortal[] = portals.map(p => {
      const isHoriz = p.horizontal ?? true;
      const x = p.col;
      const y = p.row;
      const bounds: [UvttPoint, UvttPoint] = isHoriz
        ? [{ x: x - 0.5, y }, { x: x + 0.5, y }]
        : [{ x, y: y - 0.5 }, { x, y: y + 0.5 }];

      return {
        position: { x, y },
        bounds,
        closed: p.closed ?? true,
        freemove: p.freemove ?? false
      };
    });

    // 3. Format Dynamic Lights
    const formattedLights: UvttLight[] = lights.map(l => {
      let cleanColor = (l.colorHex || 'ffffff').replace('#', '');
      if (cleanColor.length > 6) cleanColor = cleanColor.slice(0, 6);
      if (cleanColor.length < 6) cleanColor = cleanColor.padEnd(6, 'f');

      // Convert feet to grid units (assuming 5 ft per grid cell standard)
      const rangeInGrid = Number((l.rangeFt / 5).toFixed(2));

      return {
        position: { x: l.col, y: l.row },
        range: rangeInGrid,
        color: cleanColor,
        intensity: l.intensity ?? 1.0
      };
    });

    const file: UniversalVttFile = {
      format: 0.2,
      resolution: {
        map_origin: { x: 0, y: 0 },
        map_size: { x: widthCells, y: heightCells },
        pixels_per_grid: pixelsPerGrid
      },
      image: base64Image,
      line_of_sight: formattedLos,
      portals: formattedPortals,
      lights: formattedLights
    };

    const jsonString = JSON.stringify(file, null, 2);

    return {
      data: file,
      jsonString,
      stats: {
        wallCount: formattedLos.length,
        portalCount: formattedPortals.length,
        lightCount: formattedLights.length
      }
    };
  }

  /**
   * Reduces consecutive horizontal or vertical collinear wall segments into continuous single segments.
   */
  public static reduceCollinearSegments(walls: RawWallSegment[]): RawWallSegment[] {
    if (walls.length <= 1) return [...walls];

    // Separate horizontal, vertical, and diagonal/other segments
    const horizontal: RawWallSegment[] = [];
    const vertical: RawWallSegment[] = [];
    const diagonal: RawWallSegment[] = [];

    const EPSILON = 0.001;

    for (const w of walls) {
      // Normalize segment orientation so p1 is always <= p2
      const [x1, y1] = w.p1;
      const [x2, y2] = w.p2;

      let normW: RawWallSegment;
      if (x1 < x2 || (Math.abs(x1 - x2) < EPSILON && y1 <= y2)) {
        normW = { p1: [x1, y1], p2: [x2, y2], blocksLight: w.blocksLight };
      } else {
        normW = { p1: [x2, y2], p2: [x1, y1], blocksLight: w.blocksLight };
      }

      if (Math.abs(normW.p1[1] - normW.p2[1]) < EPSILON) {
        horizontal.push(normW);
      } else if (Math.abs(normW.p1[0] - normW.p2[0]) < EPSILON) {
        vertical.push(normW);
      } else {
        diagonal.push(normW);
      }
    }

    // Merge horizontal segments
    const mergedHorizontal = this.mergeAxisAligned(horizontal, 1, 0); // same Y, merge along X
    // Merge vertical segments
    const mergedVertical = this.mergeAxisAligned(vertical, 0, 1);     // same X, merge along Y

    return [...mergedHorizontal, ...mergedVertical, ...diagonal];
  }

  private static mergeAxisAligned(
    segments: RawWallSegment[],
    fixedCoordIdx: 0 | 1,
    variableCoordIdx: 0 | 1
  ): RawWallSegment[] {
    if (segments.length <= 1) return segments;

    const EPSILON = 0.001;

    // Group segments by fixed coordinate (e.g. all segments on y = 5)
    const groups = new Map<number, RawWallSegment[]>();

    for (const seg of segments) {
      const key = Math.round(seg.p1[fixedCoordIdx] * 1000) / 1000;
      let list = groups.get(key);
      if (!list) {
        list = [];
        groups.set(key, list);
      }
      list.push(seg);
    }

    const merged: RawWallSegment[] = [];

    for (const [, list] of groups.entries()) {
      // Sort segments along variable coordinate
      list.sort((a, b) => a.p1[variableCoordIdx] - b.p1[variableCoordIdx]);

      let current = list[0];

      for (let i = 1; i < list.length; i++) {
        const next = list[i];

        // Check if `next` connects or overlaps with `current`
        if (Math.abs(current.p2[variableCoordIdx] - next.p1[variableCoordIdx]) < EPSILON &&
            current.blocksLight === next.blocksLight) {
          // Extend current segment
          const newP2: [number, number] = [...current.p2];
          newP2[variableCoordIdx] = Math.max(current.p2[variableCoordIdx], next.p2[variableCoordIdx]);
          current = {
            p1: current.p1,
            p2: newP2,
            blocksLight: current.blocksLight
          };
        } else {
          merged.push(current);
          current = next;
        }
      }
      merged.push(current);
    }

    return merged;
  }
}
