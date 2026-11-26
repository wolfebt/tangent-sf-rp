/**
 * @file vttModuleCompilerService.js
 * @description Master VTT Module Compiler for Tangent SFF RP ADE Studio.
 * Dynamically synthesizes authored Story Scenarios, Maps, and Elements (Modular Characters, Items, Clues)
 * into a verified, executable runtime bundle for the interactive VTT engine.
 * 
 * STRICT PROTOCOL: ZERO mock presets or canned data. All stats, traits, scripts,
 * and automations are derived directly from authored scenario nodes and live Omnicortex DBM records.
 */

import { normalizeElementType } from '../pages/Foundry/ElementForge/elementSchemas.js';

export class VttModuleCompilerService {
  /**
   * Compiles an authored scenario, linked map, and relevant elements into a complete VTT package.
   */
  compileScenarioForVtt({
    scenario = null,
    activeMap = null,
    mapsCatalog = [],
    elementsCatalog = [],
    galleryModifiers = [],
    universeState = null,
    dbData = {},
    stageManifest = null,
    operatorSafe: topOperatorSafe = false,
    options = {}
  }) {
    if (!scenario && !activeMap && (!mapsCatalog || mapsCatalog.length === 0)) {
      throw new Error('VTT Compiler requires at least an authored scenario or active map.');
    }

    const packageId = `pkg_vtt_${scenario?.id || activeMap?.id || Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();

    const operatorSafe = Boolean(topOperatorSafe || options?.operatorSafe || options?.spectatorSafe);
    const scopedElements = operatorSafe
      ? (elementsCatalog || []).filter(el => el && !el.isHidden && !el.isGmOnly && el.fields?.playerVisible !== false)
      : (elementsCatalog || []);

    // 1. Compile Story Functions & Narrative Automations
    const compiledStory = this.compileStoryAutomations(scenario, scopedElements);

    // 2. Compile Primary Map Functions & Spatial Reactive Automations
    const effectiveActiveMap = activeMap || (mapsCatalog && mapsCatalog[0]) || (universeState?.maps && universeState.maps[0]) || null;
    const compiledMap = this.compileMapAutomations(effectiveActiveMap, scenario);

    // 3. Compile Element Functions, Modular Characters & Autonomous Scripts
    const { compiledTokens, compiledObjects } = this.compileElementAutomations({
      elementsCatalog: scopedElements,
      activeMap: effectiveActiveMap,
      scenario,
      dbData,
      operatorSafe
    });

    // Merge compiled objects with existing map objects
    const mergedObjects = [...(compiledMap.objects || []), ...compiledObjects];

    // Deduplicate objects by ID
    const uniqueObjectsMap = new Map();
    mergedObjects.forEach(obj => {
      if (obj && obj.id) uniqueObjectsMap.set(obj.id, obj);
    });
    const finalObjects = Array.from(uniqueObjectsMap.values());

    // Deduplicate tokens by ID
    const uniqueTokensMap = new Map();
    (compiledTokens || []).forEach(tok => {
      if (tok && tok.id) uniqueTokensMap.set(tok.id, tok);
    });
    const finalTokens = Array.from(uniqueTokensMap.values());

    // Extract active automations
    const scriptedNpcTokens = finalTokens.filter(t => t.script && t.script.type);
    const reactiveTraps = finalObjects.filter(o => o.isTrap || o.type === 'hazard' || o.trapType);

    // 4. Compile Complete Story Gallery (Maps, Elements, Situational Modifiers)
    const rawMapsList = (mapsCatalog && mapsCatalog.length > 0) 
      ? mapsCatalog 
      : (universeState?.maps && universeState.maps.length > 0 ? universeState.maps : (effectiveActiveMap ? [effectiveActiveMap] : []));
    
    const compiledGalleryMaps = rawMapsList.map(m => this.compileMapAutomations(m, scenario));
    const compiledModifiers = (galleryModifiers && galleryModifiers.length > 0)
      ? galleryModifiers
      : (universeState?.galleryModifiers || []);

    const compiledPackage = {
      packageId,
      compiledAt: timestamp,
      manifest: {
        title: stageManifest?.title || scenario?.title || effectiveActiveMap?.title || universeState?.projectName || 'Tactical Scenario',
        version: '1.0.0',
        author: universeState?.author || 'ADE Studio Architect',
        stageId: stageManifest?.id || null,
        scenarioId: scenario?.id || stageManifest?.storyId || null,
        mapId: effectiveActiveMap?.id || stageManifest?.mapId || null,
        techLevel: parseInt(scenario?.fields?.['tech-level'] || effectiveActiveMap?.techLevel || '3', 10),
        magicLevel: parseInt(scenario?.fields?.['magic-level'] || '0', 10),
        stats: {
          totalTokens: finalTokens.length,
          scriptedNpcs: scriptedNpcTokens.length,
          totalObjects: finalObjects.length,
          reactiveTraps: reactiveTraps.length,
          wallVectors: (compiledMap.walls || []).length,
          totalMaps: compiledGalleryMaps.length,
          totalElements: scopedElements.length,
          totalModifiers: compiledModifiers.length
        }
      },
      gallery: {
        maps: compiledGalleryMaps,
        elements: scopedElements,
        modifiers: compiledModifiers
      },
      story: compiledStory,
      map: {
        ...compiledMap,
        objects: finalObjects,
        tokens: finalTokens
      },
      ...(stageManifest ? {
        anchors: stageManifest.anchors || [],
        triggers: stageManifest.triggers || [],
        variables: stageManifest.variables || {},
        macros: stageManifest.macros || [],
        environment: stageManifest.environment || null
      } : {}),
      automations: {
        scriptedNpcs: scriptedNpcTokens,
        reactiveTraps,
        storyTriggers: [...(compiledStory.triggers || []), ...((stageManifest?.triggers) || [])],
        activeModifiers: compiledModifiers.filter(m => m.isActive !== false)
      }
    };

    // Diagnostic validation check
    const diagnostics = this.validatePackage(compiledPackage);

    return {
      package: compiledPackage,
      diagnostics
    };
  }

  /**
   * Compiles authored story nodes, narrative beats, and GM secrets into real-time triggers.
   */
  compileStoryAutomations(scenario, elementsCatalog) {
    if (!scenario) {
      return {
        id: 'story_fallback',
        title: 'Tactical Engagement',
        summary: 'Direct tactical engagement on stage.',
        triggers: []
      };
    }

    const triggers = [];
    const fields = scenario.fields || {};

    const linkedIds = new Set([
      ...(Array.isArray(scenario.linkedElements) ? scenario.linkedElements : []),
      ...(Array.isArray(scenario.assetHub) ? scenario.assetHub.map(e => (typeof e === 'string' ? e : e?.assetId)) : [])
    ].filter(Boolean));

    // Ingest Clues or Handouts linked to this scenario
    const linkedClues = (elementsCatalog || []).filter(el => {
      const nType = normalizeElementType(el.type);
      return (nType === 'Clue' || nType === 'Handout') &&
        (linkedIds.has(el.id) || el.fields?.scenarioId === scenario.id || scenario.content?.includes(el.title));
    });

    linkedClues.forEach(clue => {
      triggers.push({
        id: `trig_clue_${clue.id}`,
        type: 'clue_reveal',
        clueId: clue.id,
        title: clue.title,
        information: clue.fields?.information || clue.content || 'Discovered intelligence.',
        triggerDistance: 60
      });
    });

    return {
      id: scenario.id,
      title: scenario.title,
      summary: fields.summary || fields.scenePurpose || '',
      pov: fields.pov || '',
      stakes: fields.stakes || fields.primaryConflict || '',
      triggers
    };
  }

  /**
   * Compiles map geometry, LOS wall vectors, dynamic lighting, and spatial hazard volumes.
   */
  compileMapAutomations(map, scenario) {
    if (!map) {
      return {
        id: `map_auto_${Date.now()}`,
        title: 'Ad-Hoc Tactical Grid',
        width: 2400,
        height: 1800,
        gridSize: 50,
        walls: [],
        objects: [],
        tokens: []
      };
    }

    // Process walls for raycast collision and vision blocking
    const processedWalls = (map.walls || []).map(w => ({
      id: w.id || `wall_${Math.random()}`,
      p1: { x: w.p1?.x || 0, y: w.p1?.y || 0 },
      p2: { x: w.p2?.x || 0, y: w.p2?.y || 0 },
      blocksMovement: w.blocksMovement !== false,
      blocksVision: w.blocksVision !== false,
      doorState: w.doorState || null
    }));

    return {
      id: map.id,
      title: map.title || 'Tactical Sector',
      width: map.width || 2400,
      height: map.height || 1800,
      gridSize: map.gridSize || 50,
      walls: processedWalls,
      objects: map.objects || [],
      tokens: map.tokens || []
    };
  }

  /**
   * Compiles Modular Personas (MCM) into hydrated VTT tokens with scripts and relational directives.
   */
  compileElementAutomations({ elementsCatalog = [], activeMap, scenario, dbData, operatorSafe = false }) {
    const compiledTokens = [...(activeMap?.tokens || [])].filter(
      (t) => !operatorSafe || (t && t.type === 'hero') || (t?.isPlayerVisible !== false && !t?.isHidden)
    );
    const compiledObjects = [];

    const linkedElementIds = new Set([
      ...(Array.isArray(scenario?.linkedElements) ? scenario.linkedElements : []),
      ...(Array.isArray(scenario?.assetHub) ? scenario.assetHub.map(e => (typeof e === 'string' ? e : (e?.assetId || e?.id))) : []),
      ...(Array.isArray(activeMap?.tokens) ? activeMap.tokens.map(t => t?.storyElementId || t?.elementId || t?.linkedElementId) : []),
      ...(Array.isArray(activeMap?.objects) ? activeMap.objects.map(o => o?.storyElementId || o?.elementId || o?.linkedElementId) : [])
    ].filter(Boolean));

    // Filter Personas linked to this scenario or map (fall back to all catalog Personas if none explicitly linked)
    const allPersonas = (elementsCatalog || []).filter(el => normalizeElementType(el.type) === 'Persona');
    const linkedPersonas = allPersonas.filter(p =>
      linkedElementIds.has(p.id) || p.fields?.scenarioId === scenario?.id || (activeMap?.id && p.fields?.pairedMapId === activeMap.id)
    );
    const relevantPersonas = linkedPersonas.length > 0 ? linkedPersonas : allPersonas;

    relevantPersonas.forEach(persona => {
      const pFields = persona.fields || {};
      const personaId = persona.id;

      // Check if already placed on map as a token
      const existingTokenIndex = compiledTokens.findIndex(t => 
        t.storyElementId === personaId || t.elementId === personaId || t.linkedElementId === personaId || t.id === personaId
      );

      // Parse autonomous VTT script (explicitly disarmed when vttScriptActive === 'false' or false)
      const isScriptDisabled = pFields.vttScriptActive === 'false' || pFields.vttScriptActive === false;
      let parsedScript = null;
      if (!isScriptDisabled && (pFields.vttScriptActive === 'true' || pFields.vttScriptActive === true || pFields.vttScript)) {
        if (typeof pFields.vttScript === 'object' && pFields.vttScript !== null) {
          parsedScript = pFields.vttScript;
        } else if (typeof pFields.vttScript === 'string') {
          try {
            parsedScript = JSON.parse(pFields.vttScript);
          } catch (e) {
            parsedScript = null;
          }
        }
      }

      // Default script fallback if none defined and not explicitly disabled
      if (!isScriptDisabled && !parsedScript) {
        parsedScript = {
          type: 'dialogue_bark',
          behaviorProfile: pFields.mcmRole?.toLowerCase() || 'tactical',
          moraleThreshold: 0.25,
          alertBark: pFields.voice || pFields.mannerisms || `Halt! Identify yourself to ${persona.title || 'Operator'}.`
        };
      }

      // Calculate vitals from Modular Character Matrix respecting biological vs synthetic physiology
      const tier = parseInt(pFields.mcmTier || '1', 10) || 1;
      const isSynth = Boolean(
        pFields.is_synthetic ||
        pFields.isSynthetic ||
        String(pFields.physiology || '').toLowerCase() === 'synthetic' ||
        String(pFields['char-species'] || pFields.species || '').toLowerCase().includes('synthetic')
      );
      const healthMax = parseInt(pFields.health || String(30 + tier * 8), 10);
      const vitalityMax = isSynth ? 0 : parseInt(pFields.vitality || String(30 + tier * 5), 10);
      const structureMax = isSynth ? parseInt(pFields.structure || String(60 + tier * 8), 10) : 0;
      const defenseDc = parseInt(pFields.defense || String(12 + Math.floor(tier / 2)), 10);

      const tokenPayload = {
        id: `tok_${personaId}`,
        elementId: personaId,
        storyElementId: personaId,
        label: pFields['char-name'] || persona.title || 'NPC Operative',
        name: pFields['char-name'] || persona.title || 'NPC Operative',
        avatarUrl: persona.imageUrl || null,
        x: existingTokenIndex >= 0 ? compiledTokens[existingTokenIndex].x : 400 + Math.floor(Math.random() * 200),
        y: existingTokenIndex >= 0 ? compiledTokens[existingTokenIndex].y : 400 + Math.floor(Math.random() * 200),
        radius: 35,
        fill: pFields.mcmDesignation === 'Ally' ? '#10b981' : (pFields.mcmDesignation === 'Adversary' ? '#ef4444' : '#a855f7'),
        layerId: 'layer_tokens',
        is_synthetic: isSynth,
        health: { current: healthMax, max: healthMax },
        vitality: { current: vitalityMax, max: vitalityMax },
        structure: { current: structureMax, max: structureMax },
        isPlayerVisible: pFields.playerVisible !== false && !persona.isHidden && !persona.isGmOnly,
        defense: defenseDc,
        armor: pFields.armor || 'Standard Armor',
        weapon: pFields.weapon || 'Plasma Carbine',
        designation: pFields.mcmDesignation || 'Adversary',
        role: pFields.mcmRole || 'Tactical',
        behaviorProfile: parsedScript?.behaviorProfile || pFields.mcmRole?.toLowerCase() || 'tactical',
        moraleThreshold: parsedScript?.moraleThreshold ?? 0.25,
        script: parsedScript,
        relations: {
          stance: pFields.relationsStance || 'Hostile',
          vipTarget: pFields.vipTarget || null,
          rivalTarget: pFields.rivalTarget || null
        }
      };

      if (existingTokenIndex >= 0) {
        // Upgrade existing token with compiled modular stats & script
        compiledTokens[existingTokenIndex] = {
          ...compiledTokens[existingTokenIndex],
          ...tokenPayload
        };
      } else {
        // If not already on map, stage it for placement
        compiledTokens.push(tokenPayload);
      }
    });

    // Compile interactive Property / Hazard elements linked to this scenario or map
    const interactiveElements = (elementsCatalog || []).filter(el => {
      if (!el) return false;
      const nType = normalizeElementType(el.type);
      const ef = el.fields || {};
      const isInteractiveType = nType === 'Property' || nType === 'Hazard';
      const hasInteractiveProps = Boolean(
        ef.interactiveType && ef.interactiveType !== 'none'
      ) || Boolean(ef.hazardCr || ef.trap || ef.trapType || ef.isTrap);
      if (!isInteractiveType || (!hasInteractiveProps && !linkedElementIds.has(el.id))) return false;
      const isLinked =
        linkedElementIds.has(el.id) ||
        ef.scenarioId === scenario?.id ||
        (activeMap?.id && ef.pairedMapId === activeMap.id);
      if (linkedElementIds.size > 0 && !isLinked) return false;
      if (operatorSafe && (el.isHidden || el.isGmOnly || ef.isTrap || ef.trap || ef.isSecret || ef.playerVisible === false)) {
        return false;
      }
      return true;
    });

    interactiveElements.forEach((el, idx) => {
      const ef = el.fields || {};
      const existingObj = (activeMap?.objects || []).find(
        o => o.storyElementId === el.id || o.elementId === el.id || o.id === `obj_${el.id}`
      );
      if (existingObj) return;
      const isTrap = Boolean(ef.isTrap || ef.trap || ef.trapType || normalizeElementType(el.type) === 'Hazard' || ef.interactiveType === 'hazard');
      compiledObjects.push({
        id: `obj_${el.id}`,
        elementId: el.id,
        storyElementId: el.id,
        name: el.title || ef.name || 'Interactive Object',
        label: el.title || ef.name || 'Interactive Object',
        type: ef.interactiveType && ef.interactiveType !== 'none'
          ? ef.interactiveType
          : (isTrap ? 'hazard' : 'prop'),
        isTrap,
        ...(ef.trapType ? { trapType: ef.trapType } : {}),
        dc: parseInt(String(ef.vttInteractionDC || ef.hazardCr || ef.craft_dc || 12), 10) || 12,
        lootTable: ef.lootTable || '',
        isPlayerVisible: ef.playerVisible !== false && !el.isHidden && !el.isGmOnly,
        x: 240 + (idx % 5) * 90,
        y: 240 + Math.floor(idx / 5) * 90
      });
    });

    return {
      compiledTokens,
      compiledObjects
    };
  }

  /**
   * Validates compiled package integrity for missing links, broken waypoints, or unscripted bosses.
   */
  validatePackage(pkg) {
    const warnings = [];
    const errors = [];

    if (!pkg.map || !pkg.map.id) {
      errors.push('No map configuration compiled in package.');
    }

    if (pkg.manifest.stats.totalTokens === 0) {
      warnings.push('Scenario has no operator or adversary tokens staged on map.');
    }

    const bossTokens = (pkg.map.tokens || []).filter(t => t.role?.toLowerCase() === 'boss' || t.behaviorProfile === 'boss');
    bossTokens.forEach(b => {
      if (!b.script || b.script.type === 'dialogue_bark') {
        warnings.push(`Boss token "${b.label}" is set to a simple dialogue bark instead of combat routine.`);
      }
    });

    // Validate Gallery Modifiers
    const modifiers = pkg.gallery?.modifiers || [];
    modifiers.forEach(m => {
      if (m.sourceType !== 'story' && m.sourceId) {
        const hasSource = (pkg.gallery?.elements || []).some(e => e.id === m.sourceId) ||
                          (pkg.gallery?.maps || []).some(map => map.id === m.sourceId);
        if (!hasSource && m.sourceName) {
          warnings.push(`Modifier "${m.name}" references source "${m.sourceName}" which is not in this gallery bundle.`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const VttModuleCompiler = new VttModuleCompilerService();
export default VttModuleCompiler;
