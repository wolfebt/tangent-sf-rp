import { MAP_TYPES, MASTER_TERRAINS, MASTER_OBJECTS, SCALE_METADATA_SCHEMAS } from './MapConstants';

/**
 * Get all terrain brush types for a specific scale (or all if 'All'), including custom user terrains.
 */
export function getTerrainsForScale(scaleType, customTerrains = []) {
  let baseList = [];
  if (!scaleType || scaleType === 'All') {
    baseList = Object.values(MASTER_TERRAINS).flat();
  } else {
    baseList = MASTER_TERRAINS[scaleType] || MASTER_TERRAINS['Planetary'];
  }

  const matchingCustom = (scaleType && scaleType !== 'All')
    ? customTerrains.filter(t => t.scale === scaleType || !t.scale)
    : customTerrains;

  return [...matchingCustom, ...baseList];
}

/**
 * Get all placeable objects for a scale, optionally filtered by category, including custom user objects.
 */
export function getObjectsForScale(scaleType, categoryFilter = 'All', customObjects = []) {
  let baseList = [];
  if (!scaleType || scaleType === 'All') {
    baseList = Object.values(MASTER_OBJECTS).flat();
  } else {
    baseList = MASTER_OBJECTS[scaleType] || MASTER_OBJECTS['Planetary'];
  }

  const matchingCustom = (scaleType && scaleType !== 'All')
    ? customObjects.filter(o => o.scale === scaleType || !o.scale)
    : customObjects;

  const list = [...matchingCustom, ...baseList];

  if (categoryFilter && categoryFilter !== 'All') {
    return list.filter(item => item.category === categoryFilter);
  }
  return list;
}

/**
 * Get all unique sub-categories available for a specific scale.
 */
export function getCategoriesForScale(scaleType, customObjects = []) {
  const objects = getObjectsForScale(scaleType, 'All', customObjects);
  const categories = Array.from(new Set(objects.map(o => o.category).filter(Boolean)));
  return ['All', ...categories];
}

/**
 * Look up any asset (terrain or object) by ID across base and custom catalogs.
 */
export function getAssetById(assetId, customAssets = { terrains: [], objects: [] }) {
  const cTerrains = customAssets.terrains || [];
  const cMatchT = cTerrains.find(t => t.id === assetId);
  if (cMatchT) return { ...cMatchT, assetKind: 'terrain', scale: cMatchT.scale || 'Planetary' };

  const cObjects = customAssets.objects || [];
  const cMatchO = cObjects.find(o => o.id === assetId);
  if (cMatchO) return { ...cMatchO, assetKind: 'object', scale: cMatchO.scale || 'Planetary' };

  for (const scale of MAP_TYPES) {
    const terrains = MASTER_TERRAINS[scale] || [];
    const tMatch = terrains.find(t => t.id === assetId);
    if (tMatch) return { ...tMatch, assetKind: 'terrain', scale };

    const objects = MASTER_OBJECTS[scale] || [];
    const oMatch = objects.find(o => o.id === assetId);
    if (oMatch) return { ...oMatch, assetKind: 'object', scale };
  }
  return null;
}

/**
 * Get default scale metadata object for initializing or updating map metadata.
 */
export function getScaleMetadataDefaults(scaleType) {
  const schema = SCALE_METADATA_SCHEMAS[scaleType] || SCALE_METADATA_SCHEMAS['Planetary'];
  const defaults = {};
  if (schema && schema.fields) {
    schema.fields.forEach(field => {
      defaults[field.key] = field.default;
    });
  }
  return defaults;
}

/**
 * Level of Detail (LOD) check:
 * Returns true if zoom scale is zoomed far out (< 0.65 zoom scale in Konva)
 */
export function isLODZoomOut(scaleZoom) {
  return scaleZoom < 0.65;
}
