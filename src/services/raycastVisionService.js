/**
 * raycastVisionService.js
 * High-performance 2D raycasting & visibility polygon calculation for Tangent SF RP VTT.
 */

import { doesWallBlockVision, expandWallsForGeometry } from '../schemas/vttWallSchema.js';

const TWO_PI = Math.PI * 2;
const NUM_ANGULAR_BUCKETS = 32;
const INV_BUCKET_WIDTH = NUM_ANGULAR_BUCKETS / TWO_PI;

function normalizeAngle(angle) {
  let a = angle;
  while (a <= -Math.PI) a += TWO_PI;
  while (a > Math.PI) a -= TWO_PI;
  return a;
}

function angleToBucket(angle) {
  let idx = Math.floor((angle + Math.PI) * INV_BUCKET_WIDTH);
  if (idx < 0) return 0;
  if (idx >= NUM_ANGULAR_BUCKETS) return NUM_ANGULAR_BUCKETS - 1;
  return idx;
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

  // 1. Collect bounding box + vision-blocking walls culled by AABB overlap
  const minX = Math.max(0, ox - maxRadius);
  const minY = Math.max(0, oy - maxRadius);
  const maxX = Math.min(bounds.width || 3000, ox + maxRadius);
  const maxY = Math.min(bounds.height || 2000, oy + maxRadius);

  const segX1 = [minX, maxX, maxX, minX];
  const segY1 = [minY, minY, maxY, maxY];
  const segX2 = [maxX, maxX, minX, minX];
  const segY2 = [minY, maxY, maxY, minY];

  const expandedWalls = expandWallsForGeometry(walls);
  for (let i = 0; i < expandedWalls.length; i++) {
    const wall = expandedWalls[i];
    if (!wall) continue;
    const p1 = wall.p1 || (wall.x1 !== undefined && wall.y1 !== undefined ? { x: wall.x1, y: wall.y1 } : null);
    const p2 = wall.p2 || (wall.x2 !== undefined && wall.y2 !== undefined ? { x: wall.x2, y: wall.y2 } : null);
    if (!p1 || !p2) continue;
    if (!doesWallBlockVision(wall, sensorMode)) continue;

    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;

    const segMinX = x1 < x2 ? x1 : x2;
    const segMaxX = x1 > x2 ? x1 : x2;
    const segMinY = y1 < y2 ? y1 : y2;
    const segMaxY = y1 > y2 ? y1 : y2;
    if (segMaxX < minX || segMinX > maxX || segMaxY < minY || segMinY > maxY) continue;

    segX1.push(x1);
    segY1.push(y1);
    segX2.push(x2);
    segY2.push(y2);
  }

  const segCount = segX1.length;

  // 2. Precompute scalar segment constants, deduplicated endpoints, and 32 angular sector buckets
  const sx = new Float64Array(segCount);
  const sy = new Float64Array(segCount);
  const qpx = new Float64Array(segCount);
  const qpy = new Float64Array(segCount);
  const numT = new Float64Array(segCount);

  const buckets = new Array(NUM_ANGULAR_BUCKETS);
  for (let b = 0; b < NUM_ANGULAR_BUCKETS; b++) {
    buckets[b] = [];
  }

  const seenEndpoints = new Set();
  const rawAngles = [];

  const pushEndpointAngle = (px, py) => {
    const key = `${Math.round(px * 10)},${Math.round(py * 10)}`;
    if (seenEndpoints.has(key)) return;
    seenEndpoints.add(key);
    const baseAngle = Math.atan2(py - oy, px - ox);
    rawAngles.push(
      normalizeAngle(baseAngle - 0.0001),
      normalizeAngle(baseAngle),
      normalizeAngle(baseAngle + 0.0001)
    );
  };

  for (let i = 0; i < segCount; i++) {
    const x1 = segX1[i];
    const y1 = segY1[i];
    const x2 = segX2[i];
    const y2 = segY2[i];

    const segDx = x2 - x1;
    const segDy = y2 - y1;
    const relX = x1 - ox;
    const relY = y1 - oy;
    const segNumT = relX * segDy - relY * segDx;

    sx[i] = segDx;
    sy[i] = segDy;
    qpx[i] = relX;
    qpy[i] = relY;
    numT[i] = segNumT;

    pushEndpointAngle(x1, y1);
    pushEndpointAngle(x2, y2);

    const a1 = Math.atan2(relY, relX);
    const a2 = Math.atan2(y2 - oy, x2 - ox);
    let delta = a2 - a1;
    if (delta > Math.PI) delta -= TWO_PI;
    else if (delta < -Math.PI) delta += TWO_PI;

    if (Math.abs(segNumT) < 1e-4 || Math.abs(delta) >= Math.PI - 0.05) {
      for (let b = 0; b < NUM_ANGULAR_BUCKETS; b++) {
        buckets[b].push(i);
      }
    } else {
      const startAngle = delta >= 0 ? a1 : a2;
      const span = delta >= 0 ? delta : -delta;
      const bStart = Math.floor((startAngle + Math.PI) * INV_BUCKET_WIDTH) - 1;
      const bEnd = Math.floor((startAngle + span + Math.PI) * INV_BUCKET_WIDTH) + 1;
      for (let b = bStart; b <= bEnd; b++) {
        const bucketIdx = ((b % NUM_ANGULAR_BUCKETS) + NUM_ANGULAR_BUCKETS) % NUM_ANGULAR_BUCKETS;
        buckets[bucketIdx].push(i);
      }
    }
  }

  // 3. Sort and deduplicate ray angles
  rawAngles.sort((a, b) => a - b);

  // 4. Cast rays against only the segments in their angular bucket
  const flatPoints = [];
  let prevAngle = NaN;

  for (let r = 0; r < rawAngles.length; r++) {
    const angle = rawAngles[r];
    if (r > 0 && angle - prevAngle < 1e-7) continue;
    prevAngle = angle;

    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const bucket = buckets[angleToBucket(angle)];

    let minT = maxRadius;

    for (let j = 0; j < bucket.length; j++) {
      const idx = bucket[j];
      const rxs = dx * sy[idx] - dy * sx[idx];
      if (rxs > -1e-9 && rxs < 1e-9) continue;

      const t = numT[idx] / rxs;
      if (t < 0 || t >= minT) continue;

      const u = (qpx[idx] * dy - qpy[idx] * dx) / rxs;
      if (u >= 0 && u <= 1) {
        minT = t;
      }
    }

    flatPoints.push(
      Math.round((ox + dx * minT) * 10) / 10,
      Math.round((oy + dy * minT) * 10) / 10
    );
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
  if (dx === 0 && dy === 0) return true;

  const rayMinX = ox < tx ? ox : tx;
  const rayMaxX = ox > tx ? ox : tx;
  const rayMinY = oy < ty ? oy : ty;
  const rayMaxY = oy > ty ? oy : ty;

  const expandedWalls = expandWallsForGeometry(walls);
  for (let i = 0; i < expandedWalls.length; i++) {
    const wall = expandedWalls[i];
    if (!wall) continue;
    const p1 = wall.p1 || (wall.x1 !== undefined && wall.y1 !== undefined ? { x: wall.x1, y: wall.y1 } : null);
    const p2 = wall.p2 || (wall.x2 !== undefined && wall.y2 !== undefined ? { x: wall.x2, y: wall.y2 } : null);
    if (!p1 || !p2) continue;
    if (!doesWallBlockVision(wall, sensorMode)) continue;

    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;

    const segMinX = x1 < x2 ? x1 : x2;
    const segMaxX = x1 > x2 ? x1 : x2;
    const segMinY = y1 < y2 ? y1 : y2;
    const segMaxY = y1 > y2 ? y1 : y2;
    if (segMaxX < rayMinX || segMinX > rayMaxX || segMaxY < rayMinY || segMinY > rayMaxY) continue;

    const sx = x2 - x1;
    const sy = y2 - y1;
    const rxs = dx * sy - dy * sx;
    if (rxs > -1e-9 && rxs < 1e-9) continue;

    const qpx = x1 - ox;
    const qpy = y1 - oy;
    const t = (qpx * sy - qpy * sx) / rxs;
    if (t < 0 || t >= 1.0) continue;

    const u = (qpx * dy - qpy * dx) / rxs;
    if (u >= 0 && u <= 1) {
      return false; // Vision is occluded by this wall
    }
  }

  return true;
}
