/**
 * @file assetAggregator.js
 * @description Dynamic Asset Selection Catalog normalizer for ADE Pillar 3 (Presets & Scripts).
 * Aggregates, normalizes, and indexes all scriptable assets across the module:
 * - Personas & Units (elementsCatalog + Folio)
 * - Smart Props & Traps (Map objects + Hazard elements)
 * - Tactical Maps & Sectors (universeState.maps + mapsCatalog)
 * - Encounters & Scenes (universeState.scenarios tree)
 * - Items & Technology (elementsCatalog items)
 * - QuickJS Module Macros (universeState.scripts)
 */

import { TRAP_TYPES } from '../../../../services/reactiveVttService.js';

export const CATALOG_CATEGORIES = [
  { id: 'all', label: 'All Assets', icon: '🌐', countKey: 'all' },
  { id: 'personas', label: 'Personas', icon: '🤖', countKey: 'personas' },
  { id: 'props_traps', label: 'Smart Props & Traps', icon: '⚡', countKey: 'props_traps' },
  { id: 'maps', label: 'Maps & Sectors', icon: '🗺️', countKey: 'maps' },
  { id: 'encounters', label: 'Encounters', icon: '⚔️', countKey: 'encounters' },
  { id: 'items', label: 'Items & Tech', icon: '📦', countKey: 'items' },
  { id: 'macros', label: 'QuickJS Macros', icon: '📜', countKey: 'macros' }
];

/**
 * Safely parses JSON strings or returns existing object.
 */
function safeParseJson(val) {
  if (!val) return null;
  if (typeof val === 'object') return val;
  if (typeof val === 'string' && val.trim().startsWith('{')) {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Recursively flattens scenario nodes into an array of scenes/encounters.
 */
function flattenScenarioNodes(nodes = []) {
  const result = [];
  function recurse(list, parentTitle = '') {
    list.forEach(node => {
      result.push({ ...node, parentTitle });
      if (Array.isArray(node.children) && node.children.length > 0) {
        recurse(node.children, node.title || parentTitle);
      }
    });
  }
  recurse(nodes);
  return result;
}

/**
 * Master aggregation function for all module assets.
 */
export function aggregateModuleAssets({
  elementsCatalog = [],
  mapsCatalog = [],
  universeState = {},
  customMacros = []
}) {
  const assets = [];

  // 1. PERSONAS (elementsCatalog)
  elementsCatalog.forEach(elem => {
    if (elem.type === 'Persona') {
      const scriptObj = safeParseJson(elem.fields?.vttScript);
      const isScripted = Boolean(
        scriptObj ||
        elem.fields?.vttScriptActive === 'true' ||
        elem.fields?.vttScriptActive === true
      );

      assets.push({
        id: elem.id,
        rawId: elem.id,
        title: elem.title || elem.name || 'Unnamed Persona',
        type: 'Persona',
        catalogCategory: 'personas',
        role: elem.fields?.mcmRole || elem.fields?.role || 'Tactical',
        tier: elem.fields?.mcmTier || '1',
        description: elem.fields?.summary || elem.content || 'Operative unit capable of autonomous routines.',
        isScripted,
        scriptType: scriptObj?.type || (isScripted ? 'patrol' : null),
        scriptSummary: isScripted
          ? `${scriptObj?.type ? scriptObj.type.toUpperCase() : 'ROUTINE'} (${scriptObj?.behaviorProfile || elem.fields?.mcmRole || 'Tactical'})`
          : 'Idle (No Script)',
        scriptData: scriptObj,
        source: 'elementsCatalog',
        raw: elem,
        fields: elem.fields || {},
        updatedAt: elem.updatedAt
      });
    }
  });

  // 2. SMART PROPS & TRAPS (From Maps and Hazard Elements)
  const combinedMaps = [
    ...(universeState?.maps || []),
    ...(mapsCatalog || [])
  ];
  const uniqueMapsMap = new Map();
  combinedMaps.forEach(m => {
    if (m && m.id && !uniqueMapsMap.has(m.id)) uniqueMapsMap.set(m.id, m);
  });
  const allUniqueMaps = Array.from(uniqueMapsMap.values());

  // Extract map objects that are traps, hazards, terminals, or bulkheads
  allUniqueMaps.forEach(map => {
    (map.objects || []).forEach(obj => {
      const isTrap = obj.isTrap || obj.type === 'hazard' || obj.category === 'hazard' || Boolean(TRAP_TYPES[obj.trapType || obj.type]);
      const isTerminal = obj.objectType === 'security_terminal' || obj.type === 'security_terminal';
      const isBulkhead = obj.objectType === 'blast_door' || obj.type === 'blast_door';

      if (isTrap || isTerminal || isBulkhead) {
        assets.push({
          id: `map-obj-${map.id}-${obj.id}`,
          rawId: obj.id,
          mapId: map.id,
          mapTitle: map.title || map.name || 'Tactical Sector',
          title: obj.label || obj.name || (isTrap ? 'Proximity Hazard' : isTerminal ? 'Security Terminal' : 'Blast Bulkhead'),
          type: isTrap ? 'Trap' : isTerminal ? 'Terminal' : 'Bulkhead',
          catalogCategory: 'props_traps',
          role: obj.trapType || obj.objectType || 'Smart Prop',
          tier: null,
          description: obj.description || (isTrap ? `Save DC ${obj.saveCr || 14}` : `Hack DC ${obj.hackDc || 13}`),
          isScripted: Boolean(obj.trapState || obj.isTrap || obj.hackDc),
          scriptType: isTrap ? (obj.trapType || 'proximity_plasma_mine') : (obj.objectType || 'prop'),
          scriptSummary: isTrap
            ? `${obj.trapType || 'Hazard'} (DC ${obj.saveCr || 14})`
            : isTerminal
            ? `ICE Hack (DC ${obj.hackDc || 13})`
            : `Bulkhead (${obj.doorState || 'closed'})`,
          scriptData: obj,
          source: 'map_object',
          raw: obj
        });
      }
    });
  });

  // Also include Hazard elements from elementsCatalog
  elementsCatalog.forEach(elem => {
    if (elem.type === 'Hazard' || elem.fields?.isTrap) {
      assets.push({
        id: elem.id,
        rawId: elem.id,
        title: elem.title || elem.name || 'Hazard Asset',
        type: 'Hazard',
        catalogCategory: 'props_traps',
        role: elem.fields?.trapType || 'hazard',
        tier: null,
        description: elem.content || elem.fields?.description || 'Environmental hazard emitter.',
        isScripted: true,
        scriptType: elem.fields?.trapType || 'proximity_plasma_mine',
        scriptSummary: `${elem.fields?.trapType || 'Hazard'} (DC ${elem.fields?.saveCr || 14})`,
        scriptData: elem.fields,
        source: 'elementsCatalog',
        raw: elem,
        fields: elem.fields || {}
      });
    }
  });

  // 3. TACTICAL MAPS & SECTORS
  allUniqueMaps.forEach(map => {
    const hasWeather = Boolean(map.weather || map.lighting?.tint || map.atmosphericPresetId);
    assets.push({
      id: map.id,
      rawId: map.id,
      title: map.title || map.name || 'Untitled Sector',
      type: 'Map',
      catalogCategory: 'maps',
      role: `${map.gridMode || 'Square'} · ${map.width || 40}x${map.height || 30}`,
      tier: null,
      description: map.description || 'Tactical combat sector with vector grid & lighting.',
      isScripted: hasWeather,
      scriptType: map.atmosphericPresetId || (hasWeather ? 'custom_weather' : null),
      scriptSummary: hasWeather
        ? `Atmosphere: ${map.atmosphericPresetId || 'Custom Tint/Fog'}`
        : 'Default Vacuum (Unset)',
      scriptData: { weather: map.weather, lighting: map.lighting },
      source: 'mapsCatalog',
      raw: map
    });
  });

  // 4. SCENARIOS & ENCOUNTERS
  const scenarioNodes = flattenScenarioNodes(universeState?.scenarios || []);
  scenarioNodes.forEach(node => {
    const isEncounter = node.type === 'Encounter' || Boolean(node.encounters?.length);
    const hasScript = Boolean(node.script || node.onEnterMacro || node.readAloud);

    assets.push({
      id: node.id,
      rawId: node.id,
      title: node.title || 'Untitled Node',
      type: node.type || 'Scenario',
      catalogCategory: 'encounters',
      role: isEncounter ? 'Combat Encounter' : 'Narrative Beat',
      tier: null,
      description: node.summary || node.content || 'Narrative scene gate or tactical encounter.',
      isScripted: hasScript,
      scriptType: hasScript ? 'scene_trigger' : null,
      scriptSummary: hasScript ? 'Has Trigger / Read-Aloud' : 'Unscripted Beat',
      scriptData: { script: node.script, onEnterMacro: node.onEnterMacro },
      source: 'scenarios',
      raw: node
    });
  });

  // 5. ITEMS & TECHNOLOGY
  elementsCatalog.forEach(elem => {
    if (elem.type === 'Item') {
      const hasMacro = Boolean(elem.fields?.macroScript || elem.fields?.onUseScript || elem.fields?.activationEffect);
      assets.push({
        id: elem.id,
        rawId: elem.id,
        title: elem.title || elem.name || 'Gear Asset',
        type: 'Item',
        catalogCategory: 'items',
        role: elem.fields?.itemCategory || elem.fields?.category || 'Gear',
        tier: elem.fields?.techLevel ? `TL ${elem.fields.techLevel}` : 'TL 3',
        description: elem.content || elem.fields?.summary || 'Interactive equipment or weaponry.',
        isScripted: hasMacro,
        scriptType: hasMacro ? 'item_macro' : null,
        scriptSummary: hasMacro ? 'Has Activation Macro' : 'Passive Equipment',
        scriptData: { macroScript: elem.fields?.macroScript },
        source: 'elementsCatalog',
        raw: elem,
        fields: elem.fields || {}
      });
    }
  });

  // 6. MODULE QUICKJS MACROS
  const moduleMacros = [
    ...(universeState?.scripts || []),
    ...customMacros
  ];
  moduleMacros.forEach(macro => {
    assets.push({
      id: macro.id || `macro-${macro.name}`,
      rawId: macro.id,
      title: macro.name || 'Custom Macro',
      type: 'Macro',
      catalogCategory: 'macros',
      role: macro.category || 'Game Logic',
      tier: null,
      description: macro.description || 'Isolated WebAssembly QuickJS executable routine.',
      isScripted: true,
      scriptType: 'quickjs_sandbox',
      scriptSummary: 'Executable QuickJS',
      scriptData: macro,
      source: 'scripts',
      raw: macro
    });
  });

  return assets;
}
