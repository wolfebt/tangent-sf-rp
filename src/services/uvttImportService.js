/**
 * uvttImportService.js
 * Universal VTT (.dd2vtt / .uvtt) Parser & Importer for Tangent SF RP.
 * Imports maps created in DungeonDraft, Arkenforge, and other standard cartography suites.
 */

import { createWallSegment, WALL_TYPES } from '../schemas/vttWallSchema.js';

/**
 * Parses Universal VTT (.dd2vtt / .uvtt) JSON string or object into a Tangent Map structure.
 *
 * @param {string|Object} rawData - Raw JSON string or parsed object from a .dd2vtt file
 * @param {string} mapName - User designated name for the imported map
 * @returns {Object} Tangent map document structure ready for Firestore / state insertion
 */
export function parseUniversalVtt(rawData, mapName = 'Imported Universal VTT Sector') {
  const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

  const rawPpg = Number(data.resolution?.pixels_per_grid);
  const rawGridW = Number(data.resolution?.map_size?.x);
  const rawGridH = Number(data.resolution?.map_size?.y);
  const pixelsPerGrid = Number.isFinite(rawPpg) ? Math.min(512, Math.max(16, rawPpg)) : 70;
  const gridWidth = Number.isFinite(rawGridW) ? Math.min(500, Math.max(1, rawGridW)) : 30;
  const gridHeight = Number.isFinite(rawGridH) ? Math.min(500, Math.max(1, rawGridH)) : 20;

  const totalWidth = gridWidth * pixelsPerGrid;
  const totalHeight = gridHeight * pixelsPerGrid;
  const originX = Number.isFinite(Number(data.resolution?.map_origin?.x)) ? Number(data.resolution.map_origin.x) : 0;
  const originY = Number.isFinite(Number(data.resolution?.map_origin?.y)) ? Number(data.resolution.map_origin.y) : 0;

  const toPixelPoint = (rawPt) => ({
    x: Math.round(((Number(rawPt?.x !== undefined ? rawPt.x : rawPt?.[0]) || 0) - originX) * pixelsPerGrid),
    y: Math.round(((Number(rawPt?.y !== undefined ? rawPt.y : rawPt?.[1]) || 0) - originY) * pixelsPerGrid)
  });

  // Format base64 raster image if present (strictly reject active SVG/HTML data URIs)
  let imageUrl = null;
  if (typeof data.image === 'string' && data.image.trim()) {
    const rawImg = data.image.trim();
    if (/^data:/i.test(rawImg)) {
      if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i.test(rawImg)) {
        imageUrl = rawImg;
      }
    } else if (/^[A-Za-z0-9+/=\s]+$/.test(rawImg)) {
      imageUrl = `data:image/png;base64,${rawImg}`;
    }
  }

  // Convert line_of_sight and objects_line_of_sight arrays into Tangent Wall Segments
  const walls = [];
  const ingestWallChains = (chains, labelPrefix) => {
    if (!Array.isArray(chains)) return;
    chains.forEach((losArray, chainIdx) => {
      if (!Array.isArray(losArray) || losArray.length < 2) return;
      for (let i = 0; i < losArray.length - 1; i++) {
        const p1 = toPixelPoint(losArray[i]);
        const p2 = toPixelPoint(losArray[i + 1]);
        walls.push(createWallSegment(p1, p2, WALL_TYPES.SOLID, {
          label: `${labelPrefix} ${chainIdx + 1}-${i + 1}`
        }));
      }
    });
  };
  ingestWallChains(data.line_of_sight, 'Wall Chain');
  ingestWallChains(data.objects_line_of_sight, 'Object Wall Chain');

  // Convert portals into Doors & Windows
  if (Array.isArray(data.portals)) {
    data.portals.forEach((portal, pIdx) => {
      if (!portal.bounds || portal.bounds.length < 2) return;
      const p1 = toPixelPoint(portal.bounds[0]);
      const p2 = toPixelPoint(portal.bounds[1]);

      const isClosed = portal.closed !== false;
      const isWindow = portal.freemove === true;

      const wallType = isWindow ? WALL_TYPES.WINDOW : WALL_TYPES.DOOR;
      walls.push(createWallSegment(p1, p2, wallType, {
        label: isWindow ? `Window ${pIdx + 1}` : `Door ${pIdx + 1}`,
        doorState: isClosed ? 'closed' : 'open',
        isOpen: !isClosed
      }));
    });
  }

  // Convert UVTT lights into dynamic light nodes
  const lights = [];
  if (Array.isArray(data.lights)) {
    data.lights.forEach((lt, lIdx) => {
      if (!lt) return;
      const pt = toPixelPoint(lt.position || lt);
      const rawRange = Number(lt.range ?? lt.radius ?? 3);
      const radiusPx = Math.max(40, Math.round((Number.isFinite(rawRange) ? rawRange : 3) * pixelsPerGrid));
      let colorHex = '#f59e0b';
      if (typeof lt.color === 'string' && lt.color.trim()) {
        const raw = lt.color.trim();
        const prefixed = raw.startsWith('#') ? raw : `#${raw}`;
        if (/^#[0-9a-f]{8}$/i.test(prefixed)) {
          colorHex = `#${prefixed.slice(3)}`;
        } else if (/^#[0-9a-f]{6}$/i.test(prefixed)) {
          colorHex = prefixed;
        }
      }
      const rawIntensity = Number(lt.intensity);
      const intensity = Number.isFinite(rawIntensity) ? Math.min(1.5, Math.max(0.1, rawIntensity)) : 0.85;
      lights.push({
        id: `uvtt_light_${Date.now()}_${lIdx + 1}`,
        x: pt.x,
        y: pt.y,
        radius: radiusPx,
        color: colorHex,
        intensity,
        brightness: Math.min(1, intensity),
        animation: 'steady',
        ...(lt.shadows !== undefined ? { shadows: Boolean(lt.shadows) } : {})
      });
    });
  }

  const ambientLight =
    typeof data.environment?.ambient_light === 'string' && data.environment.ambient_light.trim()
      ? data.environment.ambient_light.trim()
      : null;

  // Build Terrain Image Node
  const terrains = [];
  if (imageUrl) {
    terrains.push({
      id: `terrain_uvtt_bg_${Date.now()}`,
      renderType: 'canvasImage',
      imageUrl: imageUrl,
      x: 0,
      y: 0,
      width: totalWidth,
      height: totalHeight,
      name: 'UVTT Map Layer'
    });
  }

  // Return full Tangent Map Document (using canonical 'Interior' MAP_TYPES scale)
  return {
    id: `map_uvtt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: mapName,
    type: 'Interior',
    gridSize: pixelsPerGrid,
    gridMode: 'square',
    width: totalWidth,
    height: totalHeight,
    gridSnap: true,
    fogEnabled: true,
    terrains: terrains,
    walls: walls,
    lights: lights,
    ...(ambientLight ? { ambientLight, environment: { ambientLight } } : {}),
    objects: [],
    tokens: [],
    texts: [],
    lines: [],
    fog: [],
    metadata: {
      source: 'Universal VTT Import',
      importedAt: new Date().toISOString(),
      gridDimensions: { x: gridWidth, y: gridHeight },
      origin: { x: originX, y: originY }
    }
  };
}
