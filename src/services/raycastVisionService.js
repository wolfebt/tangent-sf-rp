/**
 * raycastVisionService.js
 * High-performance 2D raycasting & visibility polygon calculation for Tangent SF RP VTT.
 */

import { doesWallBlockVision } from '../schemas/vttWallSchema.js';

/**
 * Calculates intersection between a ray starting at (ox, oy) in direction (dx, dy)
 * and a line segment (x1, y1) -> (x2, y2).
 * Returns { x, y, param, angle } or null if no intersection.
 */
function getRaySegmentIntersection(ox, oy, dx, dy, x1, y1, x2, y2) {
  const sx = x2 - x1;
  const sy = y2 - y1;
  const rxs = dx * sy - dy * sx;

  if (Math.abs(rxs) < 1e-9) return null; // Parallel or collinear

  const qpx = x1 - ox;
  const qpy = y1 - oy;

  const t = (qpx * sy - qpy * sx) / rxs;
  const u = (qpx * dy - qpy * dx) / rxs;

  if (t >= 0 && u >= 0 && u <= 1) {
    return {
      x: ox + t * dx,
      y: oy + t * dy,
      param: t
    };
  }

  return null;
}

/**
 * Computes a 2D visibility polygon from origin (originX, originY) given wall segments.
 *
 * @param {Object} origin - { x, y } origin coordinate (token center)
 * @param {Array} walls - List of wall objects adhering to vttWallSchema
 * @param {Object} options - { maxRadius: 800, bounds: { width: 3000, height: 2000 }, sensorMode: 'standard_optical' }
 * @returns {Array} Array of coordinates [x1, y1, x2, y2, ...] forming the closed visibility polygon.
 */
export function computeVisibilityPolygon(origin, walls = [], options = {}) {
  const {
    maxRadius = 1200,
    bounds = { width: 3000, height: 2000 },
    sensorMode = 'standard_optical'
  } = options;

  const ox = origin.x;
  const oy = origin.y;

  // 1. Filter walls that block vision for this sensor mode
  const activeSegments = [];
  
  // Add map bounding box segments
  const minX = Math.max(0, ox - maxRadius);
  const minY = Math.max(0, oy - maxRadius);
  const maxX = Math.min(bounds.width || 3000, ox + maxRadius);
  const maxY = Math.min(bounds.height || 2000, oy + maxRadius);

  activeSegments.push({ x1: minX, y1: minY, x2: maxX, y2: minY });
  activeSegments.push({ x1: maxX, y1: minY, x2: maxX, y2: maxY });
  activeSegments.push({ x1: maxX, y1: maxY, x2: minX, y2: maxY });
  activeSegments.push({ x1: minX, y1: maxY, x2: minX, y2: minY });

  for (const wall of walls) {
    if (!wall || !wall.p1 || !wall.p2) continue;
    if (!doesWallBlockVision(wall, sensorMode)) continue;

    // Check if wall is within rough bounding circle
    const d1 = Math.hypot(wall.p1.x - ox, wall.p1.y - oy);
    const d2 = Math.hypot(wall.p2.x - ox, wall.p2.y - oy);
    if (d1 > maxRadius * 1.5 && d2 > maxRadius * 1.5) continue;

    activeSegments.push({
      x1: wall.p1.x,
      y1: wall.p1.y,
      x2: wall.p2.x,
      y2: wall.p2.y
    });
  }

  // 2. Extract unique endpoints to cast rays towards
  const uniquePoints = [];
  for (const seg of activeSegments) {
    uniquePoints.push({ x: seg.x1, y: seg.y1 });
    uniquePoints.push({ x: seg.x2, y: seg.y2 });
  }

  // 3. Compute ray angles with small delta offsets (±0.0001 rad) to penetrate corners
  const angles = [];
  for (const p of uniquePoints) {
    const angle = Math.atan2(p.y - oy, p.x - ox);
    angles.push(angle - 0.0001);
    angles.push(angle);
    angles.push(angle + 0.0001);
  }

  // 4. Cast rays and find closest intersection for each angle
  const rawIntersections = [];

  for (const angle of angles) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    let closest = null;
    let minT = maxRadius;

    for (const seg of activeSegments) {
      const intersect = getRaySegmentIntersection(ox, oy, dx, dy, seg.x1, seg.y1, seg.x2, seg.y2);
      if (intersect && intersect.param < minT) {
        minT = intersect.param;
        closest = {
          x: intersect.x,
          y: intersect.y,
          angle: angle
        };
      }
    }

    if (!closest) {
      closest = {
        x: ox + dx * maxRadius,
        y: oy + dy * maxRadius,
        angle: angle
      };
    }

    rawIntersections.push(closest);
  }

  // 5. Sort intersections clockwise by angle
  rawIntersections.sort((a, b) => a.angle - b.angle);

  // 6. Format into flat array [x1, y1, x2, y2, ...]
  const flatPoints = [];
  for (const pt of rawIntersections) {
    flatPoints.push(Math.round(pt.x * 10) / 10, Math.round(pt.y * 10) / 10);
  }

  return flatPoints;
}

/**
 * Helper to check if a specific target coordinate is visible from token origin
 */
export function isPointVisible(origin, target, walls = [], sensorMode = 'standard_optical') {
  const ox = origin.x;
  const oy = origin.y;
  const tx = target.x;
  const ty = target.y;

  const dx = tx - ox;
  const dy = ty - oy;
  const dist = Math.hypot(dx, dy);

  if (dist === 0) return true;

  for (const wall of walls) {
    if (!doesWallBlockVision(wall, sensorMode)) continue;
    const hit = getRaySegmentIntersection(ox, oy, dx, dy, wall.p1.x, wall.p1.y, wall.p2.x, wall.p2.y);
    if (hit && hit.param < 1.0) {
      return false; // Vision is occluded by this wall
    }
  }

  return true;
}
