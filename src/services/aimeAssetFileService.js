/**
 * @file aimeAssetFileService.js
 * @description Dedicated Portable Asset File Service for AIME ("The Art of AI Crafting").
 * Governs export, import, serialization, and batch ingestion of self-contained portable
 * asset files across the 7 Core Element Modules:
 *   - .world      (World Anvil)
 *   - .persona    (Persona Maker)
 *   - .setting    (Setting Architect)
 *   - .species    (Species Creator)
 *   - .tech       (Technology Forge)
 *   - .philosophy (Philosophy Scribe)
 *   - .scene      (Scene Builder)
 * As well as .aime bundles and backward-compatible .tangent-element / .json / .md files.
 */

import { getElementFileExtension, AIME_CORE_ELEMENT_TYPES } from '../pages/Foundry/ElementForge/elementSchemas.js';
import { parseElementMarkdown } from './elementIngestionService.js';

export const AIME_SCHEMA_URL = 'https://tangent-rpg.com/schemas/aime-asset-v1.json';
export const AIME_VERSION = '1.0';

/**
 * Extension to Element Type mapping
 */
export const EXTENSION_TO_TYPE_MAP = {
  '.world': 'World',
  '.persona': 'Persona',
  '.setting': 'Setting',
  '.species': 'Species',
  '.tech': 'Technology',
  '.philosophy': 'Philosophy',
  '.scene': 'Scene',
  '.faction': 'Faction',
  '.encounter': 'Encounter',
  '.item': 'Item',
  '.universe': 'Universe'
};

/**
 * Serializes an element into canonical AIME portable asset JSON.
 * @param {Object} element - The Tangent element or scenario object.
 * @returns {Object} Canonical AIME Portable Asset Object
 */
export function serializeAimeAsset(element) {
  if (!element || !element.type) {
    throw new Error('Invalid element provided for AIME asset serialization.');
  }

  const assetType = element.type;
  const fileExtension = getElementFileExtension(assetType);
  const now = new Date().toISOString();

  // Extract guidance from element.guidance or element.fields.guidance
  const guidance = element.guidance || element.fields?.guidance || {
    genre: '',
    tone: '',
    pacing: '',
    pov: '',
    literaryDevices: [],
    structure: ''
  };

  // Extract traits (Layer 2 core reality)
  const traits = { ...(element.fields || {}) };
  // Clean up any internal metadata from traits
  delete traits.guidance;
  delete traits.assetHub;
  delete traits.rpgExtensions;

  // Extract Asset Hub links (Layer 3)
  const rawHub = element.assetHub || element.linkedElements || [];
  const assetHub = Array.isArray(rawHub)
    ? rawHub.map(item => {
        if (typeof item === 'string') {
          return {
            assetId: item,
            importance: 'typical',
            annotation: ''
          };
        }
        return {
          assetId: item.assetId || item.id,
          assetType: item.assetType || item.type || '',
          assetTitle: item.assetTitle || item.title || '',
          importance: item.importance || 'typical',
          annotation: item.annotation || ''
        };
      })
    : [];

  // Extract RPG extension tray mechanics (MCM, DBM, VTT)
  const rpgExtensions = element.rpgExtensions || {
    mcmTier: element.mcmTier || element.fields?.mcmTier || null,
    tacticalRole: element.tacticalRole || element.fields?.tacticalRole || null,
    dbmRef: element.dbmRef || element.fields?.dbmRef || null,
    dbmSyncStatus: element.dbmSyncStatus || null,
    mapId: element.mapId || null
  };

  return {
    $schema: AIME_SCHEMA_URL,
    aimeVersion: AIME_VERSION,
    assetType,
    id: element.id || `elem_${Date.now()}`,
    title: element.title || element.name || `Untitled ${assetType}`,
    fileExtension,
    guidance,
    traits,
    assetHub,
    rpgExtensions,
    content: element.content || '',
    tags: element.tags || [],
    createdAt: element.createdAt || now,
    updatedAt: now
  };
}

/**
 * Parses an imported file (portable JSON or Markdown) into a standard Tangent Element.
 * @param {string} fileContent - Raw content of the file.
 * @param {string} fileName - File name with extension.
 * @returns {Object} Normalized Tangent Element object.
 */
export function parseAimeAssetFile(fileContent, fileName = '') {
  if (!fileContent || typeof fileContent !== 'string') {
    throw new Error('File content must be a non-empty string.');
  }

  const trimmed = fileContent.trim();
  const lowerName = fileName.toLowerCase();

  // 1. Try parsing as JSON (AIME portable asset or standard Tangent JSON)
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const data = JSON.parse(trimmed);

      // Check if it's an AIME portable asset format
      if (data.aimeVersion || data.$schema?.includes('aime-asset') || data.traits || data.assetHub) {
        const assetType = data.assetType || data.type || detectTypeFromExtension(lowerName) || 'Persona';
        const traits = data.traits || data.fields || {};
        const assetHub = Array.isArray(data.assetHub)
          ? data.assetHub
          : Array.isArray(data.linkedElements)
          ? data.linkedElements
          : [];

        return {
          id: data.id || `elem_${Date.now()}`,
          title: data.title || data.name || traits.name || 'Untitled Element',
          name: data.title || data.name || traits.name || 'Untitled Element',
          type: assetType,
          guidance: data.guidance || {},
          fields: {
            ...traits,
            ...(data.rpgExtensions || {})
          },
          assetHub,
          linkedElements: assetHub.map(h => (typeof h === 'string' ? h : h.assetId)).filter(Boolean),
          rpgExtensions: data.rpgExtensions || {},
          content: data.content || '',
          tags: data.tags || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      }

      // Check if standard Tangent JSON export
      if (data.type === 'TangentStoryElement' && data.element) {
        return {
          ...data.element,
          title: data.element.title || data.element.name || 'Imported Element',
          name: data.element.title || data.element.name || 'Imported Element'
        };
      }

      // Fallback generic JSON element
      return {
        id: data.id || `elem_${Date.now()}`,
        title: data.title || data.name || 'Imported Asset',
        name: data.title || data.name || 'Imported Asset',
        type: data.type || detectTypeFromExtension(lowerName) || 'Persona',
        fields: data.fields || data.traits || {},
        content: data.content || '',
        tags: data.tags || []
      };
    } catch (e) {
      // If JSON parsing fails, fall through to Markdown parsing
    }
  }

  // 2. Parse as Markdown adhering to ELEMENTS.md
  try {
    const mdElement = parseElementMarkdown(fileContent, fileName);
    return {
      ...mdElement,
      title: mdElement.name || mdElement.title || 'Imported Element',
      name: mdElement.name || mdElement.title || 'Imported Element'
    };
  } catch (err) {
    throw new Error(`Failed to parse file "${fileName}": ${err.message}`);
  }
}

/**
 * Detect element type from canonical file extension
 */
function detectTypeFromExtension(fileName) {
  for (const [ext, type] of Object.entries(EXTENSION_TO_TYPE_MAP)) {
    if (fileName.endsWith(ext)) return type;
  }
  return null;
}

/**
 * Downloads an individual element as a portable AIME file (.persona, .setting, .tech, etc.).
 * @param {Object} element - The element to export.
 */
export function downloadAimeAssetFile(element) {
  if (typeof window === 'undefined' || !element) return;

  const serialized = serializeAimeAsset(element);
  const dataStr = JSON.stringify(serialized, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const ext = serialized.fileExtension || '.aime';
  const safeName = (element.title || element.name || 'asset')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_+/g, '_');

  const filename = `${safeName}${ext}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads multiple elements as a multi-asset AIME bundle (.aime).
 * @param {Array<Object>} elements - List of elements to bundle.
 * @param {string} bundleTitle - Title of the bundle.
 */
export function downloadAimeAssetBundle(elements, bundleTitle = 'project_lore_bundle') {
  if (typeof window === 'undefined' || !Array.isArray(elements) || elements.length === 0) return;

  const serializedAssets = elements.map(el => serializeAimeAsset(el));
  const bundlePayload = {
    $schema: 'https://tangent-rpg.com/schemas/aime-bundle-v1.json',
    aimeVersion: AIME_VERSION,
    bundleType: 'AimeAssetBundle',
    bundleTitle,
    assetCount: serializedAssets.length,
    exportedAt: new Date().toISOString(),
    assets: serializedAssets
  };

  const dataStr = JSON.stringify(bundlePayload, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const safeName = bundleTitle.toLowerCase().replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
  const filename = `${safeName}.aime`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Batch ingests multiple files (drag & drop or file picker).
 * Supports .persona, .setting, .world, .species, .tech, .philosophy, .scene, .aime, .json, .md.
 * @param {Array<File>|FileList} fileList - List of files to process.
 * @returns {Promise<Array<{ success: boolean, fileName: string, element?: Object, error?: string }>>}
 */
export async function batchIngestAimeFiles(fileList) {
  const results = [];
  const files = Array.from(fileList);

  for (const file of files) {
    try {
      const content = await file.text();

      // Check if it's an AIME multi-asset bundle
      if (file.name.endsWith('.aime') || (content.trim().startsWith('{') && content.includes('"bundleType": "AimeAssetBundle"'))) {
        try {
          const bundle = JSON.parse(content);
          if (Array.isArray(bundle.assets)) {
            for (const asset of bundle.assets) {
              const element = parseAimeAssetFile(JSON.stringify(asset), `${asset.title || 'asset'}${asset.fileExtension || '.json'}`);
              results.push({
                success: true,
                fileName: `${file.name} -> ${element.title}`,
                element
              });
            }
            continue;
          }
        } catch (_) {
          // If bundle parsing fails, try standard parsing
        }
      }

      const element = parseAimeAssetFile(content, file.name);
      results.push({
        success: true,
        fileName: file.name,
        element
      });
    } catch (err) {
      results.push({
        success: false,
        fileName: file.name,
        error: err.message
      });
    }
  }

  return results;
}
