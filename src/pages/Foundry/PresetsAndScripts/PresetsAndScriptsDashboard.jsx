/**
 * @file PresetsAndScriptsDashboard.jsx
 * @description Pillar 3: Presets & Scripts Studio Dashboard (⌘3 / /foundry/scripts).
 * Master Automation & Scripting Suite for the Adventure Development Environment (ADE).
 * Unifies:
 * 1. Dynamic Asset Selection Catalog Rail (Personas, Smart Props/Traps, Maps, Encounters, Items, Macros)
 * 2. Autonomous Unit Routines Workbench (NpcScriptBuilder, vision cones, patrol loops, barks, AIME)
 * 3. Reactive Traps & Proximity Hazards Matrix (Bulkheads, terminals, pressure plates, saving throws)
 * 4. WebAssembly QuickJS Macro Sandbox Studio (Isolated execution, watchdog timers, pre-built snippets)
 * 5. Atmospheric & Weather Presets Studio (Volumetric fog, lighting tints, ambient loops, map binding)
 * 6. Situational Combat Modifiers Deck (Rules, damage/stat modifiers, asset linkage)
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../../../context/CampaignContext';
import { showToast } from '../../../context/ToastContext';
import { AudioService } from '../../../services/audioService';
import { stepNpcPatrols } from '../../../services/reactiveVttService';
import { VttEventBus } from '../../../utils/vttEventBus';
import { useEngineStore } from '../../../engine/state/VolatileSharder.ts';
import { aggregateModuleAssets } from './utils/assetAggregator';
import { normalizeElementType } from '../ElementForge/elementSchemas';

// Modular Child Components
import { AssetSelectionCatalogRail } from './components/AssetSelectionCatalogRail';
import { ScriptsTelemetryHeader } from './components/ScriptsTelemetryHeader';
import { UnitRoutinesWorkbench } from './components/UnitRoutinesWorkbench';
import { TrapsAndHazardsWorkbench } from './components/TrapsAndHazardsWorkbench';
import { MacroSandboxStudio } from './components/MacroSandboxStudio';
import { AtmosphericsWorkbench } from './components/AtmosphericsWorkbench';
import { CombatModifiersWorkbench } from './components/CombatModifiersWorkbench';

import { ATMOSPHERIC_PRESETS } from './constants/atmosphericPresets.js';
export { ATMOSPHERIC_PRESETS };

export default function PresetsAndScriptsDashboard({ onBackToStory }) {
  const navigate = useNavigate();
  const { 
    elementsCatalog = [], 
    updateSavedElement, 
    mapsCatalog = [], 
    universeState = {},
    updateMap,
    updateStory,
    updateUniverseMetadata,
    galleryModifiers = [],
    addGalleryModifier,
    updateGalleryModifier,
    deleteGalleryModifier,
    toggleGalleryModifier,
    isStoryReadOnly = false
  } = useStory();

  // Active Studio Tab ('routines' | 'traps' | 'macros' | 'atmospherics' | 'modifiers')
  const [activeTab, setActiveTab] = useState('routines');

  // Dynamic Catalog Category ('all' | 'personas' | 'props_traps' | 'maps' | 'encounters' | 'items' | 'macros')
  // Default is 'all', satisfying user requirement 1!
  const [activeCatalogCategory, setActiveCatalogCategory] = useState('all');

  // Selected Asset ID in the Catalog
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  // Custom Local Macros Cache synced per project
  const [customMacros, setCustomMacros] = useState(() => {
    return universeState?.scripts || [];
  });

  useEffect(() => {
    setCustomMacros(Array.isArray(universeState?.scripts) ? universeState.scripts : []);
    setSelectedAssetId(null);
  }, [universeState?.id]);

  // Combine maps from universe and catalog
  const allMaps = useMemo(() => {
    const list = [...(universeState?.maps || []), ...(mapsCatalog || [])];
    const unique = new Map();
    list.forEach(m => {
      if (m && m.id && !unique.has(m.id)) unique.set(m.id, m);
    });
    return Array.from(unique.values());
  }, [universeState?.maps, mapsCatalog]);

  const [selectedMapId, setSelectedMapId] = useState(allMaps[0]?.id || '');

  // Extract Personas for direct persona switcher
  const personaElements = useMemo(() => {
    return elementsCatalog.filter(e => normalizeElementType(e.type) === 'Persona');
  }, [elementsCatalog]);

  // Master Aggregated Module Assets Catalog
  const moduleAssets = useMemo(() => {
    return aggregateModuleAssets({
      elementsCatalog,
      mapsCatalog,
      universeState,
      customMacros
    });
  }, [elementsCatalog, mapsCatalog, universeState, customMacros]);

  // Selected Asset Object
  const selectedAsset = useMemo(() => {
    if (selectedAssetId === '__new_macro__') return null;
    if (!selectedAssetId) return moduleAssets[0] || null;
    return moduleAssets.find(a => a.id === selectedAssetId) || moduleAssets[0] || null;
  }, [moduleAssets, selectedAssetId]);

  // Count scripted assets
  const scriptedAssetsCount = useMemo(() => {
    return moduleAssets.filter(a => a.isScripted).length;
  }, [moduleAssets]);

  // Asset Selection Handler with smart workbench switching
  const handleSelectAsset = useCallback((asset) => {
    setSelectedAssetId(asset.id);

    // Intelligently route to the relevant workbench based on asset category
    if (asset.catalogCategory === 'personas') {
      setActiveTab('routines');
    } else if (asset.catalogCategory === 'props_traps') {
      setActiveTab('traps');
      if (asset.mapId) setSelectedMapId(asset.mapId);
    } else if (asset.catalogCategory === 'maps') {
      setActiveTab('atmospherics');
      setSelectedMapId(asset.rawId);
    } else if (asset.catalogCategory === 'macros') {
      setActiveTab('macros');
    }
  }, []);

  // Update Persona script in elementsCatalog & Firestore
  const handleUpdatePersonaScript = useCallback(async (personaId, updatedFields) => {
    if (isStoryReadOnly) return;
    const target = elementsCatalog.find(e => e.id === personaId);
    if (!target) return;
    const updated = {
      ...target,
      fields: updatedFields
    };
    await updateSavedElement(personaId, updated);
  }, [elementsCatalog, updateSavedElement, isStoryReadOnly]);

  // Update Map Objects (Traps, Hazards, Bulkheads)
  const handleUpdateMapObjects = useCallback((mapId, updatedObjects) => {
    if (isStoryReadOnly || !updateMap) return;
    updateMap(mapId, { objects: updatedObjects });
  }, [updateMap, isStoryReadOnly]);

  // Save new or updated QuickJS Macro to module
  const handleSaveMacroToModule = useCallback((macro) => {
    if (isStoryReadOnly) return;
    const existingIndex = customMacros.findIndex(m => m.id === macro.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...customMacros];
      updated[existingIndex] = macro;
    } else {
      updated = [macro, ...customMacros];
    }
    setCustomMacros(updated);
    if (typeof updateUniverseMetadata === 'function') {
      updateUniverseMetadata({ scripts: updated });
    }
    setSelectedAssetId(`macro-${macro.id}`);
  }, [customMacros, updateUniverseMetadata, isStoryReadOnly]);

  const handleDeleteMacroFromModule = useCallback((macroId) => {
    if (isStoryReadOnly || !macroId) return;
    const updated = customMacros.filter(m => m.id !== macroId);
    setCustomMacros(updated);
    if (typeof updateUniverseMetadata === 'function') {
      updateUniverseMetadata({ scripts: updated });
    }
    setSelectedAssetId('__new_macro__');
    AudioService.playTerminalBeep(550, 0.05);
    showToast?.({ type: 'info', text: 'Macro deleted from module.' });
  }, [customMacros, updateUniverseMetadata, isStoryReadOnly]);

  // Attach QuickJS Macro to specific module asset (elements, maps, scenarios, map objects)
  const handleAttachMacroToAsset = useCallback(async (asset, macroCode) => {
    if (isStoryReadOnly || !asset) return;
    if (asset.source === 'elementsCatalog') {
      const target = elementsCatalog.find(e => e.id === asset.rawId);
      if (!target) return;
      const updated = {
        ...target,
        fields: {
          ...(target.fields || {}),
          macroScript: macroCode
        }
      };
      await updateSavedElement(target.id, updated);
      AudioService.playTerminalBeep(1400, 0.08);
      showToast?.({ type: 'success', text: `Attached macro to "${asset.title}".` });
    } else if (asset.source === 'mapsCatalog' && updateMap) {
      await updateMap(asset.rawId, { macroScript: macroCode, script: macroCode });
      AudioService.playTerminalBeep(1400, 0.08);
      showToast?.({ type: 'success', text: `Attached macro to map "${asset.title}".` });
    } else if (asset.source === 'map_object' && asset.mapId && updateMap) {
      const targetMap = allMaps.find(m => m.id === asset.mapId);
      if (!targetMap) return;
      const updatedObjects = (targetMap.objects || []).map((obj) =>
        obj.id === asset.rawId ? { ...obj, macroScript: macroCode } : obj
      );
      await updateMap(targetMap.id, { objects: updatedObjects });
      AudioService.playTerminalBeep(1400, 0.08);
      showToast?.({ type: 'success', text: `Attached macro to map object "${asset.title}".` });
    } else if (asset.source === 'scenarios' && typeof updateStory === 'function') {
      const patchNodeTree = (nodes) =>
        (nodes || []).map((node) => {
          if (!node) return node;
          const patchedChildren = Array.isArray(node.children) ? patchNodeTree(node.children) : node.children;
          if (node.id === asset.rawId) {
            return { ...node, script: macroCode, onEnterMacro: macroCode, children: patchedChildren };
          }
          return patchedChildren !== node.children ? { ...node, children: patchedChildren } : node;
        });
      await updateStory({ scenarios: patchNodeTree(universeState?.scenarios || []) });
      AudioService.playTerminalBeep(1400, 0.08);
      showToast?.({ type: 'success', text: `Attached macro to scenario "${asset.title}".` });
    }
  }, [elementsCatalog, updateSavedElement, updateMap, allMaps, updateStory, universeState?.scenarios, isStoryReadOnly]);

  // Apply Atmospheric Profile to selected map
  const handleApplyAtmosphereToMap = useCallback((mapId, atmosphereConfig) => {
    if (isStoryReadOnly || !updateMap) return;
    const target = allMaps.find(m => m.id === mapId);
    if (!target) return;

    updateMap(mapId, {
      atmosphericPresetId: atmosphereConfig.presetId,
      weather: atmosphereConfig,
      lighting: {
        ...(target.lighting || {}),
        tint: atmosphereConfig.tint,
        fogDensity: atmosphereConfig.fogDensity
      }
    });
  }, [allMaps, updateMap, isStoryReadOnly]);

  // In-Situ Step Simulation Turn: advances NPC patrols across the active map on the Stage
  const handleStepSimulationTurn = useCallback(() => {
    const activeMap = allMaps.find(m => m.id === selectedMapId) || allMaps[0];
    if (!activeMap || !activeMap.tokens?.length) {
      AudioService.playTerminalBeep(500, 0.08);
      return;
    }

    const updatedTokens = stepNpcPatrols(activeMap.tokens, 25);
    if (updateMap && !isStoryReadOnly) {
      updateMap(activeMap.id, { tokens: updatedTokens });
    }

    // Reflect stepped patrol coordinates immediately in live Stage engineStore if loaded
    const eng = useEngineStore.getState();
    updatedTokens.forEach((tok) => {
      if (eng.ephemeralData?.[tok.id]) {
        eng.updatePosition(tok.id, tok.x, tok.y);
      }
    });

    // Only emit story-waypoint-tripped when a stepped unit genuinely crosses a real untriggered waypoint
    const waypoints = activeMap.waypoints || [];
    updatedTokens.forEach((tok) => {
      waypoints.forEach((wp) => {
        if (wp.isTriggered) return;
        const radius = wp.radius || 60;
        if (Math.hypot((tok.x || 0) - (wp.x || 0), (tok.y || 0) - (wp.y || 0)) <= radius) {
          VttEventBus.emit('story-waypoint-tripped', {
            waypoint: wp,
            token: tok,
            action: wp.triggerAction || 'REVEAL_BEAT',
            targetScenarioId: wp.targetScenarioId,
            beat: wp.readAloudText
          });
        }
      });
    });

    AudioService.playTerminalBeep(1200, 0.04);
  }, [allMaps, selectedMapId, updateMap]);

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#070b13] text-slate-100 font-sans select-none">
      {/* ── TOP TELEMETRY BANNER & WORKBENCH TAB CONTROLS ── */}
      <ScriptsTelemetryHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        totalAssetsCount={moduleAssets.length}
        scriptedCount={scriptedAssetsCount}
        modifiersCount={galleryModifiers.length}
        macrosCount={customMacros.length}
        onStepSimulationTurn={handleStepSimulationTurn}
      />

      {/* ── WORKSPACE BODY: DYNAMIC CATALOG RAIL + WORKBENCH VIEWPORT ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full overflow-hidden">
        {/* Left Column: Dynamic Selection Catalog Rail */}
        <AssetSelectionCatalogRail
          assets={moduleAssets}
          selectedAssetId={selectedAsset?.id}
          onSelectAsset={handleSelectAsset}
          activeCategory={activeCatalogCategory}
          onSelectCategory={setActiveCatalogCategory}
          onCreateNewMacro={() => {
            setSelectedAssetId('__new_macro__');
            setActiveTab('macros');
            setActiveCatalogCategory('macros');
          }}
          onNavigateToForge={() => navigate('/foundry/assets')}
        />

        {/* Right Zone: Active Scripting Workbench Viewport */}
        <main className="flex-1 min-w-0 h-full p-4 sm:p-5 overflow-y-auto bg-[#070b13]">
          {/* TAB 1: UNIT BEHAVIORAL ROUTINES */}
          {activeTab === 'routines' && (
            <UnitRoutinesWorkbench
              selectedAsset={selectedAsset}
              allPersonas={personaElements}
              onSelectPersona={(persona) => setSelectedAssetId(persona.id)}
              onUpdatePersonaScript={handleUpdatePersonaScript}
              onNavigateToForge={() => navigate('/foundry/assets')}
            />
          )}

          {/* TAB 2: REACTIVE TRAPS & SMART PROPS MATRIX */}
          {activeTab === 'traps' && (
            <TrapsAndHazardsWorkbench
              selectedAsset={selectedAsset}
              allMaps={allMaps}
              selectedMapId={selectedMapId}
              onSelectMapId={setSelectedMapId}
              onUpdateMapObjects={handleUpdateMapObjects}
              onUpdateHazardElement={(elemId, updatedFields) => {
                if (isStoryReadOnly) return;
                const target = elementsCatalog.find(e => e.id === elemId);
                if (target) {
                  updateSavedElement(elemId, { ...target, fields: { ...(target.fields || {}), ...updatedFields } });
                }
              }}
            />
          )}

          {/* TAB 3: QUICKJS MACRO SANDBOX STUDIO */}
          {activeTab === 'macros' && (
            <MacroSandboxStudio
              selectedAsset={selectedAsset}
              onSaveMacroToModule={handleSaveMacroToModule}
              onDeleteMacroFromModule={handleDeleteMacroFromModule}
              onAttachMacroToAsset={handleAttachMacroToAsset}
            />
          )}

          {/* TAB 4: ATMOSPHERIC & WEATHER PRESETS */}
          {activeTab === 'atmospherics' && (
            <AtmosphericsWorkbench
              allMaps={allMaps}
              selectedMapId={selectedMapId}
              onSelectMapId={setSelectedMapId}
              onApplyAtmosphereToMap={handleApplyAtmosphereToMap}
            />
          )}

          {/* TAB 5: SITUATIONAL COMBAT MODIFIERS */}
          {activeTab === 'modifiers' && (
            <CombatModifiersWorkbench
              galleryModifiers={galleryModifiers}
              onAddModifier={addGalleryModifier}
              onUpdateModifier={updateGalleryModifier}
              onDeleteModifier={deleteGalleryModifier}
              onToggleModifier={toggleGalleryModifier}
              selectedAsset={selectedAsset}
              isStoryReadOnly={isStoryReadOnly}
            />
          )}
        </main>
      </div>
    </div>
  );
}
