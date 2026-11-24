/**
 * @file modulePackageService.js
 * @description Master Import, Export, and Snapshot Service for Consolidated ADE Live Studio.
 * Handles full-fidelity serialization and hydration of complete Tangent SFF RP adventure modules:
 * - Scenarios, narrative acts, and scene beats
 * - Maps with full vector geometry, walls, lights, objects, tokens, and waypoints
 * - Environmental atmospheric profiles and weather presets
 * - Story Elements (Personas, NPCs, Items, Clues, Hazards, Factions)
 * - Gallery situational modifiers and Cronicle living memory logs
 */

import { v4 as uuidv4 } from 'uuid';
import { AudioService } from './audioService.js';
import { sanitizeMapForSpectator } from '../utils/spectatorSanitizer.js';
import { stripGmSecretHtmlBlocks, sanitizeScenarioForOperator } from '../utils/gmSecretSanitizer.js';

export { stripGmSecretHtmlBlocks };

const formatExportFilename = (name, type, ext) => {
  const cleanName = (name || 'untitled')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_');
  const cleanType = (type || 'file')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_');
  const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
  return `${cleanName}-${cleanType}${cleanExt}`;
};

export const MODULE_PACKAGE_SCHEMA_VERSION = '2.0.0';

/**
 * Builds a complete standalone module package payload.
 */
export function buildModulePackagePayload(universeState = {}, elementsCatalog = [], options = {}) {
  const timestamp = new Date().toISOString();
  const title = universeState?.projectName || universeState?.title || 'Tangent Adventure Module';
  const author = universeState?.author || 'ADE Studio Architect';
  const scenarios = universeState?.scenarios || [];
  const maps = universeState?.maps || [];
  const modifiers = universeState?.galleryModifiers || [];
  const creativeState = universeState?.creativeState || {};
  const cronicle = universeState?.cronicle || {};

  return {
    $schema: 'https://tangentsff.app/schemas/module-package-v2.json',
    format: 'tangent-adventure-module',
    version: MODULE_PACKAGE_SCHEMA_VERSION,
    exportedAt: timestamp,
    manifest: {
      id: universeState?.id || `module_${uuidv4()}`,
      title,
      author,
      description: universeState?.description || creativeState?.storyOutline || '',
      techLevel: parseInt(universeState?.techLevel || 3, 10),
      magicLevel: parseInt(universeState?.magicLevel || 0, 10),
      rulesSystem: 'Tangent SFF RP (2d10 Dual Resolution)',
      stats: {
        totalScenarios: scenarios.length,
        totalMaps: maps.length,
        totalElements: elementsCatalog.length,
        totalModifiers: modifiers.length,
        totalTokens: maps.reduce((sum, m) => sum + (m.tokens?.length || 0), 0),
        totalWaypoints: maps.reduce((sum, m) => sum + (m.waypoints?.length || 0), 0),
        totalObjects: maps.reduce((sum, m) => sum + (m.objects?.length || 0), 0),
        totalWalls: maps.reduce((sum, m) => sum + (m.walls?.length || 0), 0)
      }
    },
    scenarios,
    creativeState,
    maps,
    elements: elementsCatalog,
    galleryModifiers: modifiers,
    cronicle
  };
}

/**
 * Builds a sanitized, player-safe module package payload for Operator Mode.
 * Strips developer secrets, GM-only notes, hidden trap coordinates, and monster mechanics.
 */
export function buildSanitizedOperatorPackagePayload(universeState = {}, elementsCatalog = [], options = {}) {
  const basePayload = buildModulePackagePayload(universeState, elementsCatalog, options);

  // 1. Sanitize Scenarios recursively
  const sanitizedScenarios = (basePayload.scenarios || [])
    .filter((s) => s && !s.isHidden && !s.isGmOnly)
    .map(sanitizeScenarioForOperator);

  // 2. Sanitize Maps (walls/secret doors, texts, terrains, fog, traps, hidden enemy tokens, waypoints)
  const sanitizedMaps = (basePayload.maps || []).map((m) => {
    const preFilteredTokens = (m?.tokens || []).filter(
      (t) => t && (t.type === 'hero' || t.isPlayerVisible || t.visibleToPlayers)
    );
    const specSafe = sanitizeMapForSpectator({ ...m, tokens: preFilteredTokens }) || {};
    return {
      ...specSafe,
      waypoints: (m?.waypoints || []).filter((w) => w && w.isPlayerVisible)
    };
  });

  // 3. Sanitize Elements (preserve public lore & handouts, strip GM secrets/scripts/mechanics)
  const sanitizedElements = (basePayload.elements || []).map((elem) => {
    const cleanElem = { ...elem };
    delete cleanElem.gmNotes;
    delete cleanElem.gmSecrets;
    delete cleanElem.gmSecretNotes;
    delete cleanElem.secrets;
    delete cleanElem.authorEmail;

    const fields = { ...(elem.fields || {}) };
    delete fields.gmNotes;
    delete fields.gmSecrets;
    delete fields.gmSecretNotes;
    delete fields.secrets;
    delete fields.vttScript;
    delete fields.macroScript;
    delete fields.quickJsMacro;
    delete fields.script;
    delete fields.authorEmail;

    if (elem.type === 'Handout' || elem.type === 'Clue') {
      return {
        ...cleanElem,
        fields
      };
    }

    delete fields.attacks;
    delete fields.stats;
    delete fields.theSecret;
    delete fields.definingTrauma;
    delete fields['narrative-secrets'];
    delete fields.theLie;
    delete fields.theTruth;
    delete fields.deepestFear;
    delete fields.plotHooks;
    delete fields.hiddenAgenda;
    return {
      ...cleanElem,
      fields
    };
  });

  return {
    ...basePayload,
    format: 'tangent-player-module',
    manifest: {
      ...basePayload.manifest,
      perspective: 'operator',
      isSanitizedForPlayers: true,
      description: `${basePayload.manifest.description || ''} [Sanitized for Player/Operator Use]`,
      stats: {
        totalScenarios: sanitizedScenarios.length,
        totalMaps: sanitizedMaps.length,
        totalElements: sanitizedElements.length,
        totalModifiers: 0,
        totalTokens: sanitizedMaps.reduce((sum, m) => sum + (m.tokens?.length || 0), 0),
        totalWaypoints: sanitizedMaps.reduce((sum, m) => sum + (m.waypoints?.length || 0), 0),
        totalObjects: sanitizedMaps.reduce((sum, m) => sum + (m.objects?.length || 0), 0),
        totalWalls: sanitizedMaps.reduce((sum, m) => sum + (m.walls?.length || 0), 0)
      }
    },
    scenarios: sanitizedScenarios,
    creativeState: {},
    maps: sanitizedMaps,
    elements: sanitizedElements,
    galleryModifiers: [],
    scripts: [],
    cronicle: null
  };
}

/**
 * Triggers a browser download of the module package as a formatted JSON file.
 */
export function exportModuleToFile(universeState, elementsCatalog, options = {}) {
  try {
    const payload = buildModulePackagePayload(universeState, elementsCatalog, options);
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const title = universeState?.projectName || 'adventure_module';
    const filename = formatExportFilename(title, 'module', 'json');

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    AudioService.playCriticalChime(true);
    return { success: true, filename, payload };
  } catch (err) {
    console.error('[modulePackageService] Export failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Exports full Architect Master Module Package (.tangent-module.json)
 */
export function exportArchitectModuleToFile(universeState, elementsCatalog, options = {}) {
  return exportModuleToFile(universeState, elementsCatalog, { ...options, perspective: 'architect' });
}

/**
 * Exports sanitized Operator Module Package (.tangent-player.json) safe for players.
 */
export function exportOperatorModuleToFile(universeState, elementsCatalog, options = {}) {
  try {
    const payload = buildSanitizedOperatorPackagePayload(universeState, elementsCatalog, options);
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const title = `${universeState?.projectName || 'adventure_module'}_player_edition`;
    const filename = formatExportFilename(title, 'player-module', 'json');

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    AudioService.playCriticalChime(true);
    return { success: true, filename, payload };
  } catch (err) {
    console.error('[modulePackageService] Operator export failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Parses and validates an uploaded module JSON file.
 */
export function parseAndValidateModuleFile(fileContent) {
  try {
    const parsed = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
    if (!parsed) throw new Error('File content is empty or null.');

    // Support both format v2 and legacy tangent map / scenario exports
    const isV2 = parsed.format === 'tangent-adventure-module' || parsed.version === MODULE_PACKAGE_SCHEMA_VERSION;
    const isLegacyMap = parsed.type === 'TangentMap' && parsed.map;
    const isLegacyScenario = parsed.type === 'TangentScenario';

    if (!isV2 && !isLegacyMap && !isLegacyScenario && !parsed.scenarios && !parsed.maps) {
      throw new Error('Unrecognized module format. Expected Tangent Adventure Module JSON.');
    }

    return {
      isValid: true,
      data: parsed,
      isV2,
      manifest: parsed.manifest || {
        title: parsed.title || parsed.map?.title || 'Imported Adventure',
        author: parsed.author || 'Imported'
      }
    };
  } catch (err) {
    return {
      isValid: false,
      error: err.message
    };
  }
}

/**
 * Hydrates an imported module package into CampaignContext state handlers.
 * Restores creativeState (Guidance Gems, outline, beats, draft), cronicle memory,
 * scenarios, maps, elements, and gallery modifiers, with optional collision remapping.
 */
export function hydrateModuleIntoCampaign(parsedData, handlers = {}) {
  const {
    addMap,
    updateMap,
    addStory,
    updateStory,
    addSavedElement,
    setActiveMapId,
    setActiveScenarioId,
    setGalleryModifiers,
    updateCreativeState,
    updateCronicle,
    existingMaps = [],
    existingScenarios = [],
    existingElements = [],
    remapCollisions = false
  } = handlers;

  const results = {
    mapsImported: 0,
    scenariosImported: 0,
    elementsImported: 0,
    creativeStateRestored: false,
    cronicleRestored: false
  };

  if (!parsedData || typeof parsedData !== 'object') {
    return results;
  }

  const existingMapIds = new Set((existingMaps || []).map((m) => m?.id).filter(Boolean));
  const collectScenarioIds = (nodes = [], out = new Set()) => {
    (nodes || []).forEach((n) => {
      if (n?.id) out.add(n.id);
      if (Array.isArray(n?.children)) collectScenarioIds(n.children, out);
    });
    return out;
  };
  const existingScenarioIds = collectScenarioIds(existingScenarios);
  const existingElementIds = new Set((existingElements || []).map((e) => e?.id).filter(Boolean));

  const mapIdRemap = new Map();
  const scenarioIdRemap = new Map();

  // 1. Ingest Maps
  const incomingMaps = Array.isArray(parsedData.maps)
    ? parsedData.maps
    : (parsedData.map ? [parsedData.map] : []);
  let firstImportedMapId = null;

  incomingMaps.forEach((m) => {
    if (!m || typeof m !== 'object') return;
    const origId = m.id || uuidv4();
    const resolvedId = remapCollisions && existingMapIds.has(origId) ? `${origId}_${uuidv4().slice(0, 6)}` : origId;
    mapIdRemap.set(origId, resolvedId);
    if (!firstImportedMapId) firstImportedMapId = resolvedId;

    const mapWithId = {
      ...m,
      id: resolvedId,
      waypoints: Array.isArray(m.waypoints) ? m.waypoints : [],
      environmental: m.environmental || {
        weatherPreset: 'clear',
        ambientLightColor: '#090d16',
        ambientLightIntensity: 0.8,
        fogDensity: 0
      }
    };
    if (typeof addMap === 'function') {
      addMap(mapWithId);
      results.mapsImported++;
    }
  });

  if (firstImportedMapId && typeof setActiveMapId === 'function') {
    setActiveMapId(firstImportedMapId);
  }

  // 2. Ingest Scenarios (recursively handling nested children and remapped mapId/parentId if needed)
  const incomingScenarios = Array.isArray(parsedData.scenarios) ? parsedData.scenarios : [];
  let firstImportedScenarioId = null;

  const preAllocateScenarioIds = (nodes = []) => {
    nodes.forEach((s) => {
      if (!s || typeof s !== 'object') return;
      const origId = s.id || uuidv4();
      const nextId = remapCollisions && existingScenarioIds.has(origId) ? `${origId}_${uuidv4().slice(0, 6)}` : origId;
      scenarioIdRemap.set(origId, nextId);
      if (!firstImportedScenarioId) firstImportedScenarioId = nextId;
      if (Array.isArray(s.children)) preAllocateScenarioIds(s.children);
    });
  };
  preAllocateScenarioIds(incomingScenarios);

  const normalizeScenarioTree = (s) => {
    const resolvedId = scenarioIdRemap.get(s.id) || s.id || uuidv4();
    const remappedMapId = s.mapId && mapIdRemap.has(s.mapId) ? mapIdRemap.get(s.mapId) : s.mapId;
    const remappedParent = s.parentId && scenarioIdRemap.has(s.parentId) ? scenarioIdRemap.get(s.parentId) : (s.parentId || null);
    return {
      ...s,
      id: resolvedId,
      ...(remappedMapId ? { mapId: remappedMapId } : {}),
      ...(remappedParent ? { parentId: remappedParent } : {}),
      ...(Array.isArray(s.children) ? { children: s.children.filter(Boolean).map(normalizeScenarioTree) } : {})
    };
  };

  incomingScenarios.forEach((s) => {
    if (!s || typeof s !== 'object') return;
    const normalizedScenario = normalizeScenarioTree(s);
    if (typeof addStory === 'function') {
      addStory(normalizedScenario, normalizedScenario.parentId || null);
      results.scenariosImported++;
    }
  });

  if (firstImportedScenarioId && typeof setActiveScenarioId === 'function') {
    setActiveScenarioId(firstImportedScenarioId);
  }

  // 3. Ingest Elements
  const incomingElements = Array.isArray(parsedData.elements) ? parsedData.elements : [];
  incomingElements.forEach((el) => {
    if (!el || typeof el !== 'object') return;
    const origId = el.id || `elem_${uuidv4().slice(0, 8)}`;
    const resolvedId = remapCollisions && existingElementIds.has(origId) ? `${origId}_${uuidv4().slice(0, 6)}` : origId;
    const nextEl = {
      ...el,
      id: resolvedId,
      ...(el.mapId && mapIdRemap.has(el.mapId) ? { mapId: mapIdRemap.get(el.mapId) } : {})
    };
    if (typeof addSavedElement === 'function') {
      addSavedElement(nextEl);
      results.elementsImported++;
    }
  });

  // 4. Ingest Gallery Modifiers
  if (Array.isArray(parsedData.galleryModifiers) && typeof setGalleryModifiers === 'function') {
    setGalleryModifiers(parsedData.galleryModifiers);
  }

  // 5. Restore Creative State (Guidance Gems, Story Outline, Beats, Draft, Lorebook config)
  if (
    parsedData.creativeState &&
    typeof parsedData.creativeState === 'object' &&
    Object.keys(parsedData.creativeState).length > 0 &&
    typeof updateCreativeState === 'function'
  ) {
    updateCreativeState(parsedData.creativeState);
    results.creativeStateRestored = true;
  }

  // 6. Restore CRONICLE Living Memory if included (null when sanitized Operator edition)
  if (
    parsedData.cronicle &&
    typeof parsedData.cronicle === 'object' &&
    typeof updateCronicle === 'function'
  ) {
    updateCronicle(parsedData.cronicle);
    results.cronicleRestored = true;
  }

  AudioService.playCriticalChime(true);
  return results;
}

/**
 * Saves a local storage snapshot of the active module.
 */
export function saveLocalModuleSnapshot(universeState, elementsCatalog) {
  try {
    const payload = buildModulePackagePayload(universeState, elementsCatalog);
    const key = `tangent_module_snapshot_${universeState?.id || 'active'}`;
    localStorage.setItem(key, JSON.stringify(payload));
    localStorage.setItem('tangent_module_last_snapshot_time', new Date().toISOString());
    return { success: true, timestamp: new Date().toLocaleTimeString() };
  } catch (e) {
    console.warn('[modulePackageService] Failed to create local snapshot:', e);
    return { success: false, error: e.message };
  }
}

export default {
  MODULE_PACKAGE_SCHEMA_VERSION,
  buildModulePackagePayload,
  exportModuleToFile,
  parseAndValidateModuleFile,
  hydrateModuleIntoCampaign,
  saveLocalModuleSnapshot
};
