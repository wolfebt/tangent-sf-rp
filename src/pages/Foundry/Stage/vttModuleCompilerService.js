/**
 * @file vttModuleCompilerService.js
 * @description Master compilation service for ADE STAGE.
 * Compiles a StageManifest, associated Map, Scenarios, and Elements into an executable VTT bundle.
 * Enforces manifest-only architecture: map assets remain pristine and untouched.
 */

import { v4 as uuidv4 } from 'uuid';
import { adeElementToStageToken } from '../../../utils/storyAssetAdapter.js';

/**
 * Validates a StageManifest for integrity before compilation.
 */
export function validateStageManifest(manifest, mapAsset, storyAsset) {
  const errors = [];
  const warnings = [];

  if (!manifest) {
    errors.push('No StageManifest provided for compilation.');
    return { valid: false, errors, warnings };
  }

  if (!manifest.mapId) {
    errors.push('Stage is missing a bound Map Asset.');
  } else if (!mapAsset) {
    warnings.push(`Referenced map "${manifest.mapId}" was not found in catalog; fallback map will be used.`);
  }

  if (!manifest.storyId && (!manifest.scenarioIds || manifest.scenarioIds.length === 0)) {
    warnings.push('Stage has no bound Story scenario; runtime will operate in free tactical mode.');
  }

  // Check for orphan triggers
  const anchorIds = new Set((manifest.anchors || []).map(a => a.id));
  for (const trigger of manifest.triggers || []) {
    if (!anchorIds.has(trigger.anchorId)) {
      warnings.push(`Trigger "${trigger.name || trigger.id}" refers to missing anchor "${trigger.anchorId}".`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Compiles a StageManifest and external assets into an executable runtime bundle.
 * @param {Object} options
 * @param {import('./stageTypes').StageManifest} options.manifest
 * @param {Object} options.mapAsset - Raw pristine map asset
 * @param {Object} options.storyAsset - Active scenario or story object
 * @param {Array} options.elementsCatalog - All available world elements
 * @param {Object} options.universeState - Current campaign/universe state
 * @returns {Object} Compiled stage execution payload
 */
export function compileStage({ manifest, mapAsset, storyAsset, elementsCatalog = [], universeState = {} }) {
  const validation = validateStageManifest(manifest, mapAsset, storyAsset);

  // 1. Prepare pristine map clone
  const baseMap = mapAsset ? JSON.parse(JSON.stringify(mapAsset)) : {
    id: manifest.mapId || uuidv4(),
    title: manifest.title || 'Compiled Stage Map',
    gridType: 'hex',
    lines: [],
    tokens: [],
    objects: [],
    terrains: [],
    fog: []
  };

  // 2. Synthesize runtime tokens from manifest anchors and encounters
  const synthesizedTokens = [...(baseMap.tokens || [])];
  const elementsMap = new Map(elementsCatalog.map(e => [e.id, e]));

  // Inject anchor-linked elements as tokens onto the map
  for (const anchor of manifest.anchors || []) {
    const x = anchor.pos?.x ?? 400;
    const y = anchor.pos?.y ?? 300;

    for (const elemId of anchor.elementIds || []) {
      const elem = elementsMap.get(elemId);
      if (elem) {
        const token = adeElementToStageToken(elem, { x, y });
        token.anchorId = anchor.id;
        token.stageManaged = true;
        synthesizedTokens.push(token);
      }
    }
  }

  // Inject encounter tokens
  for (const encounter of manifest.encounters || []) {
    if (!encounter.active) continue;
    const anchor = (manifest.anchors || []).find(a => a.id === encounter.anchorId);
    const x = anchor?.pos?.x ?? 500;
    const y = anchor?.pos?.y ?? 350;

    for (const elemId of encounter.tokenElementIds || []) {
      const elem = elementsMap.get(elemId);
      if (elem) {
        const token = adeElementToStageToken(elem, { x: x + (Math.random() * 60 - 30), y: y + (Math.random() * 60 - 30) });
        token.encounterId = encounter.id;
        token.stageManaged = true;
        synthesizedTokens.push(token);
      }
    }
  }

  // 3. Compile Waypoints and Trigger zones (injected as interactive objects without dirtying the source map)
  const synthesizedObjects = [...(baseMap.objects || [])];
  for (const anchor of manifest.anchors || []) {
    if (anchor.kind === 'waypoint' || anchor.kind === 'region') {
      const triggers = (manifest.triggers || []).filter(t => t.anchorId === anchor.id);
      synthesizedObjects.push({
        id: `anchor-obj-${anchor.id}`,
        anchorId: anchor.id,
        shape: anchor.kind === 'region' ? 'rect' : 'circle',
        x: anchor.pos?.x ?? 400,
        y: anchor.pos?.y ?? 300,
        width: anchor.pos?.w ?? 80,
        height: anchor.pos?.h ?? 80,
        radius: (anchor.pos?.w ?? 80) / 2,
        color: '#a855f7',
        label: anchor.name || 'Waypoint Anchor',
        isTriggerZone: true,
        triggerCount: triggers.length,
        triggers: triggers,
        note: anchor.note || ''
      });
    }
  }

  // 4. Assemble the compiled runtime state
  const compiledState = {
    stageId: manifest.id,
    title: manifest.title,
    compiledAt: Date.now(),
    map: {
      ...baseMap,
      tokens: synthesizedTokens,
      objects: synthesizedObjects
    },
    environment: {
      ...manifest.environment,
      lighting: manifest.environment?.lighting || { mode: 'normal' },
      weather: manifest.environment?.weather || 'clear',
      activeModifiers: manifest.environment?.modifierIds || []
    },
    triggers: manifest.triggers || [],
    variables: manifest.variables || {},
    macros: manifest.macros || [],
    scenario: storyAsset ? {
      id: storyAsset.id,
      title: storyAsset.title,
      beats: storyAsset.fields?.sceneBeats || storyAsset.fields?.beats || '',
      readAloud: storyAsset.content || ''
    } : null,
    validation
  };

  return compiledState;
}
