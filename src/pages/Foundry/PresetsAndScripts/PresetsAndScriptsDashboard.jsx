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

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../../../context/CampaignContext';
import { AudioService } from '../../../services/audioService';
import { stepNpcPatrols } from '../../../services/reactiveVttService';
import { VttEventBus } from '../../../utils/vttEventBus';
import { aggregateModuleAssets } from './utils/assetAggregator';

// Modular Child Components
import { AssetSelectionCatalogRail } from './components/AssetSelectionCatalogRail';
import { ScriptsTelemetryHeader } from './components/ScriptsTelemetryHeader';
import { UnitRoutinesWorkbench } from './components/UnitRoutinesWorkbench';
import { TrapsAndHazardsWorkbench } from './components/TrapsAndHazardsWorkbench';
import { MacroSandboxStudio } from './components/MacroSandboxStudio';
import { AtmosphericsWorkbench } from './components/AtmosphericsWorkbench';
import { CombatModifiersWorkbench } from './components/CombatModifiersWorkbench';

// Master Atmospheric & Weather Presets
export const ATMOSPHERIC_PRESETS = [
  {
    id: 'deep_space_vacuum',
    name: 'Deep Space Vacuum',
    icon: '🌌',
    category: 'Orbital',
    tint: '#020617',
    fogDensity: 0.05,
    audioProfile: 'vacuum_drone',
    description: 'Zero atmosphere, total silence outside suit audio, micro-gravity drift.',
    modifiers: { attackMod: -1, defenseMod: 1, speedMod: -5, techMod: 0 },
    rule: 'Unsealed suits take 10 Void damage/round. Sound-based perception checks fail.'
  },
  {
    id: 'reactor_amber_alert',
    name: 'Reactor Amber Alert',
    icon: '⚠️',
    category: 'Industrial',
    tint: '#d97706',
    fogDensity: 0.35,
    audioProfile: 'amber_klaxon',
    description: 'Emergency containment breach, strobing amber beacons, coolant steam venting.',
    modifiers: { attackMod: 0, defenseMod: 0, speedMod: 0, techMod: -2 },
    rule: 'Radiation buildup: CON DC 13 every 3 rounds or gain 1 Rad Condition.'
  },
  {
    id: 'corrosive_acid_rain',
    name: 'Corrosive Acid Rain',
    icon: '🌧️',
    category: 'Exo-Planet',
    tint: '#84cc16',
    fogDensity: 0.5,
    audioProfile: 'heavy_hissing_rain',
    description: 'Atmospheric acid precipitation dissolves exterior armor and obscures optic sensors.',
    modifiers: { attackMod: -2, defenseMod: -1, speedMod: -5, techMod: -1 },
    rule: 'Optic range capped at 60ft. Non-hardened armor loses 1 Armor point per 5 rounds exposed.'
  },
  {
    id: 'cyberpunk_neon_rain',
    name: 'Cyberpunk Neon Rain',
    icon: '🏙️',
    category: 'Megacity',
    tint: '#06b6d4',
    fogDensity: 0.25,
    audioProfile: 'city_hum_rain',
    description: 'Damp asphalt reflections, holographic advertisements bleeding through mist.',
    modifiers: { attackMod: 0, defenseMod: 1, speedMod: 0, techMod: 1 },
    rule: 'High electronic density: +1 to Cyber and Hacking checks. Stealth +2 in shadow pockets.'
  },
  {
    id: 'geothermal_inferno',
    name: 'Geothermal Sub-Vent',
    icon: '🌋',
    category: 'Planetary',
    tint: '#e11d48',
    fogDensity: 0.4,
    audioProfile: 'volcanic_rumble',
    description: 'Superheated magma trenches, seismic tremors, thermal distortion plumes.',
    modifiers: { attackMod: -1, defenseMod: 0, speedMod: -10, techMod: -2 },
    rule: 'Extreme heat: STAMINA check DC 14 every round or suffer Heat Exhaustion.'
  }
];

export default function PresetsAndScriptsDashboard({ onBackToStory }) {
  const navigate = useNavigate();
  const { 
    elementsCatalog = [], 
    updateSavedElement, 
    mapsCatalog = [], 
    universeState = {},
    updateMap,
    updateStory,
    galleryModifiers = [],
    addGalleryModifier,
    updateGalleryModifier,
    deleteGalleryModifier,
    toggleGalleryModifier
  } = useStory();

  // Active Studio Tab ('routines' | 'traps' | 'macros' | 'atmospherics' | 'modifiers')
  const [activeTab, setActiveTab] = useState('routines');

  // Dynamic Catalog Category ('all' | 'personas' | 'props_traps' | 'maps' | 'encounters' | 'items' | 'macros')
  // Default is 'all', satisfying user requirement 1!
  const [activeCatalogCategory, setActiveCatalogCategory] = useState('all');

  // Selected Asset ID in the Catalog
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  // Custom Local Macros Cache
  const [customMacros, setCustomMacros] = useState(() => {
    return universeState?.scripts || [];
  });

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
    return elementsCatalog.filter(e => e.type === 'Persona');
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
    const target = elementsCatalog.find(e => e.id === personaId);
    if (!target) return;
    const updated = {
      ...target,
      fields: updatedFields
    };
    await updateSavedElement(personaId, updated);
  }, [elementsCatalog, updateSavedElement]);

  // Update Map Objects (Traps, Hazards, Bulkheads)
  const handleUpdateMapObjects = useCallback((mapId, updatedObjects) => {
    if (!updateMap) return;
    updateMap(mapId, { objects: updatedObjects });
  }, [updateMap]);

  // Save new or updated QuickJS Macro to module
  const handleSaveMacroToModule = useCallback((macro) => {
    const existingIndex = customMacros.findIndex(m => m.id === macro.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...customMacros];
      updated[existingIndex] = macro;
    } else {
      updated = [macro, ...customMacros];
    }
    setCustomMacros(updated);
    if (updateStory && universeState?.id) {
      updateStory(universeState.id, { scripts: updated });
    }
  }, [customMacros, updateStory, universeState?.id]);

  // Attach QuickJS Macro to specific module asset
  const handleAttachMacroToAsset = useCallback(async (asset, macroCode) => {
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
    }
  }, [elementsCatalog, updateSavedElement]);

  // Apply Atmospheric Profile to selected map
  const handleApplyAtmosphereToMap = useCallback((mapId, atmosphereConfig) => {
    if (!updateMap) return;
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
  }, [allMaps, updateMap]);

  // In-Situ Step Simulation Turn: advances NPC patrols across the active map on the Stage
  // Satisfies user decision 2: "in situ"!
  const handleStepSimulationTurn = useCallback(() => {
    const activeMap = allMaps.find(m => m.id === selectedMapId) || allMaps[0];
    if (!activeMap || !activeMap.tokens?.length) {
      AudioService.playTerminalBeep(500, 0.08);
      return;
    }

    const updatedTokens = stepNpcPatrols(activeMap.tokens, 25);
    if (updateMap) {
      updateMap(activeMap.id, { tokens: updatedTokens });
    }

    // Trigger in-situ alert signal on VTT Stage
    VttEventBus.emit('story-waypoint-tripped', {
      waypoint: { name: 'Simulation Advance' },
      action: 'ADVANCE_SCENARIO'
    });
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
            />
          )}

          {/* TAB 3: QUICKJS MACRO SANDBOX STUDIO */}
          {activeTab === 'macros' && (
            <MacroSandboxStudio
              selectedAsset={selectedAsset}
              onSaveMacroToModule={handleSaveMacroToModule}
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
            />
          )}
        </main>
      </div>
    </div>
  );
}
