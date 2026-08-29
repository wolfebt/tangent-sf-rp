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

  const pixelsPerGrid = data.resolution?.pixels_per_grid || 70;
  const gridWidth = data.resolution?.map_size?.x || 30;
  const gridHeight = data.resolution?.map_size?.y || 20;

  const totalWidth = gridWidth * pixelsPerGrid;
  const totalHeight = gridHeight * pixelsPerGrid;

  // Format base64 image if present
  let imageUrl = null;
  if (data.image) {
    if (data.image.startsWith('data:')) {
      imageUrl = data.image;
    } else {
      // Default to webp/png base64 prefix
      imageUrl = `data:image/png;base64,${data.image}`;
    }
  }

  // Convert line_of_sight arrays into Tangent Wall Segments
  const walls = [];
  if (Array.isArray(data.line_of_sight)) {
    data.line_of_sight.forEach((losArray, chainIdx) => {
      if (!Array.isArray(losArray) || losArray.length < 2) return;
      for (let i = 0; i < losArray.length - 1; i++) {
        const p1Raw = losArray[i];
        const p2Raw = losArray[i + 1];

        // UVTT coords are expressed in grid unit floats (e.g. 12.5), multiply by pixelsPerGrid
        const p1 = {
          x: Math.round((p1Raw.x !== undefined ? p1Raw.x : p1Raw[0]) * pixelsPerGrid),
          y: Math.round((p1Raw.y !== undefined ? p1Raw.y : p1Raw[1]) * pixelsPerGrid)
        };
        const p2 = {
          x: Math.round((p2Raw.x !== undefined ? p2Raw.x : p2Raw[1]) * pixelsPerGrid),
          y: Math.round((p2Raw.y !== undefined ? p2Raw.y : p2Raw[1]) * pixelsPerGrid)
        };

        walls.push(createWallSegment(p1, p2, WALL_TYPES.SOLID, {
          label: `Wall Chain ${chainIdx + 1}-${i + 1}`
        }));
      }
    });
  }

  // Convert portals into Doors & Windows
  if (Array.isArray(data.portals)) {
    data.portals.forEach((portal, pIdx) => {
      if (!portal.bounds || portal.bounds.length < 2) return;
      const p1Raw = portal.bounds[0];
      const p2Raw = portal.bounds[1];

      const p1 = {
        x: Math.round((p1Raw.x !== undefined ? p1Raw.x : p1Raw[0]) * pixelsPerGrid),
        y: Math.round((p1Raw.y !== undefined ? p1Raw.y : p1Raw[1]) * pixelsPerGrid)
      };
      const p2 = {
        x: Math.round((p2Raw.x !== undefined ? p2Raw.x : p2Raw[1]) * pixelsPerGrid),
        y: Math.round((p2Raw.y !== undefined ? p2Raw.y : p2Raw[1]) * pixelsPerGrid)
      };

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

  // Return full Tangent Map Document
  return {
    id: `map_uvtt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: mapName,
    type: 'Encounter',
    gridSize: pixelsPerGrid,
    gridMode: 'square',
    width: totalWidth,
    height: totalHeight,
    gridSnap: true,
    fogEnabled: true,
    terrains: terrains,
    walls: walls,
    objects: [],
    tokens: [],
    texts: [],
    lines: [],
    fog: [],
    metadata: {
      source: 'Universal VTT Import',
      importedAt: new Date().toISOString(),
      gridDimensions: { x: gridWidth, y: gridHeight }
    }
  };
}
