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
import { formatExportFilename } from '../context/CampaignContext';
import { AudioService } from './audioService';

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
  
  // 1. Sanitize Scenarios
  const sanitizedScenarios = (basePayload.scenarios || []).map(sc => {
    const fields = { ...(sc.fields || {}) };
    delete fields.secrets;
    delete fields.gmNotes;
    delete fields.threatMatrix;
    delete fields.trapsSummary;
    delete fields.complications;
    return {
      ...sc,
      fields,
      gmNotes: undefined
    };
  });

  // 2. Sanitize Maps (hide traps, invisible walls, and inactive enemy tokens)
  const sanitizedMaps = (basePayload.maps || []).map(m => {
    const visibleTokens = (m.tokens || []).filter(t => t.type === 'hero' || t.isPlayerVisible || t.visibleToPlayers);
    const visibleObjects = (m.objects || []).filter(o => !o.isTrap && o.type !== 'hazard' && !o.secret);
    return {
      ...m,
      tokens: visibleTokens,
      objects: visibleObjects,
      waypoints: (m.waypoints || []).filter(w => w.isPlayerVisible)
    };
  });

  // 3. Sanitize Elements (preserve public lore, handouts, portraits, remove secret stat blocks)
  const sanitizedElements = (basePayload.elements || []).map(elem => {
    if (elem.type === 'Handout' || elem.type === 'Clue') {
      return elem;
    }
    const fields = { ...(elem.fields || {}) };
    delete fields.vttScript;
    delete fields.attacks;
    delete fields.stats;
    delete fields.theSecret;
    delete fields.definingTrauma;
    return {
      ...elem,
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
      description: `${basePayload.manifest.description || ''} [Sanitized for Player/Operator Use]`
    },
    scenarios: sanitizedScenarios,
    maps: sanitizedMaps,
    elements: sanitizedElements
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
    setGalleryModifiers
  } = handlers;

  const results = {
    mapsImported: 0,
    scenariosImported: 0,
    elementsImported: 0
  };

  // 1. Ingest Maps
  const incomingMaps = parsedData.maps || (parsedData.map ? [parsedData.map] : []);
  incomingMaps.forEach(m => {
    if (!m) return;
    const newId = m.id || uuidv4();
    const mapWithId = {
      ...m,
      id: newId,
      waypoints: m.waypoints || [],
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

  if (incomingMaps[0] && typeof setActiveMapId === 'function') {
    setActiveMapId(incomingMaps[0].id);
  }

  // 2. Ingest Scenarios
  const incomingScenarios = parsedData.scenarios || [];
  incomingScenarios.forEach(s => {
    if (!s) return;
    if (typeof addStory === 'function') {
      addStory(s, s.parentId || null);
      results.scenariosImported++;
    }
  });

  if (incomingScenarios[0] && typeof setActiveScenarioId === 'function') {
    setActiveScenarioId(incomingScenarios[0].id);
  }

  // 3. Ingest Elements
  const incomingElements = parsedData.elements || [];
  incomingElements.forEach(el => {
    if (!el) return;
    if (typeof addSavedElement === 'function') {
      addSavedElement(el);
      results.elementsImported++;
    }
  });

  // 4. Ingest Gallery Modifiers
  if (Array.isArray(parsedData.galleryModifiers) && typeof setGalleryModifiers === 'function') {
    setGalleryModifiers(parsedData.galleryModifiers);
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
