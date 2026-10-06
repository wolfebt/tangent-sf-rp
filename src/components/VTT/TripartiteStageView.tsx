/**
 * @file TripartiteStageView.tsx
 * @description ADE STAGE — Architect Design Engine & Tabletop Stage Master Viewport.
 * Unifies the Tactical VTT and Cartographic Map Maker into a single live-action environment.
 * Houses:
 * - Left Navigation Rail: Operative Cockpit (Vitals, AP Budget, Locomotion Stances, BASTION Strikes)
 *   with integrated Module Catalog & Compendium tab.
 * - Center Zone: WebGPU Stage Viewport (Infinite Frustum, BVH Raycast LoS, Dynamic Lighting, Tokens).
 * - Right Navigation Rail: Architect Console (Wall Builder, Biomes, Object Stamps, Dynamic Lights, Compositor Layers).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Crosshair, 
  FolderTree, 
  Hammer,
  BookOpen,
  Sliders
} from 'lucide-react';
import { TripartiteLayout } from './TripartiteLayout';
import { StageBreadcrumbTabs } from './stage/StageBreadcrumbTabs';
import { StageViewportWrapper } from './stage/StageViewportWrapper';
import { ModuleCatalogPanel } from './catalog/ModuleCatalogPanel';
import { ADEScenarioStageDrawer } from './stage/ADEScenarioStageDrawer';
import VttModuleIngestionModal from './VttModuleIngestionModal';
import { StageSettingsModal } from './stage/StageSettingsModal';
import { OperativeCockpitRail } from '../../pages/Foundry/MapMaker/map/OperativeCockpitRail';
import { ArchitectConsoleRail } from '../../pages/Foundry/MapMaker/map/ArchitectConsoleRail';
import { DEFAULT_LAYERS } from '../../pages/Foundry/MapMaker/map/MapConstants';
import { adeElementToStageToken, adeElementToInteractiveObject } from '../../utils/storyAssetAdapter';
import { getStarterMapsCollection } from './stage/defaultMaps';

const OperativeCockpit = OperativeCockpitRail as unknown as React.ComponentType<any>;
const ArchitectConsole = ArchitectConsoleRail as unknown as React.ComponentType<any>;
import GuidanceGemsPanel from '../../pages/Foundry/StoryModule/panels/GuidanceGemsPanel';
import type { StageViewProps } from './StageView';
import { useCampaign } from '../../context/CampaignContext';
import { useEngineStore, selectAllFusedTokens } from '../../engine/index';
import { useUILayoutStore, type UserVttRole } from './store/uiLayoutStore';
import { AudioService } from '../../services/audioService';
import { VttEventBus } from '../../utils/vttEventBus';

export interface TripartiteStageViewProps extends StageViewProps {
  defaultRole?: UserVttRole;
  onSwitchToWeaver?: () => void;
}

export const TripartiteStageView: React.FC<TripartiteStageViewProps> = ({
  defaultRole,
  ...props
}) => {
  const [searchParams] = useSearchParams();
  const scenarioIdParam = searchParams.get('scenarioId') || undefined;
  const mapIdParam = searchParams.get('mapId') || undefined;


  // Layout & Tool Reactive State
  const {
    userRole,
    setUserRole,
    isLeftCollapsed,
    isRightCollapsed,
    toggleLeftCollapse,
    setLeftCollapsed,
    toggleRightCollapse,
    setRightCollapsed,
    activeLeftTab,
    setActiveLeftTab,
    selectedTokenId,
    setSelectedTokenId,
    targetTokenId,
    setTargetTokenId,
    activeArchitectTool,
    setActiveArchitectTool,
    selectedTerrain,
    setSelectedTerrain,
    terrainBrushWidth,
    setTerrainBrushWidth,
    selectedWallType,
    setSelectedWallType,
    doorLockDc,
    setDoorLockDc,
    selectedLightColor,
    setSelectedLightColor,
    selectedLightRadius,
    setSelectedLightRadius,
    selectedLightAnimation,
    setSelectedLightAnimation,
    pencilColor,
    setPencilColor,
    pencilWidth,
    setPencilWidth,
    selectedObjectType,
    setSelectedObjectType
  } = useUILayoutStore();

  const [tokenLabelInput, setTokenLabelInput] = useState('Tactical Operative');
  const [isModuleIngestionOpen, setIsModuleIngestionOpen] = useState(false);
  const [isStageSettingsOpen, setIsStageSettingsOpen] = useState(false);
  const [activeStageTab, setActiveStageTab] = useState<'map' | 'tree' | 'architect' | 'gems'>('map');

  const handleSelectStageTab = (tab: 'map' | 'tree' | 'architect' | 'gems') => {
    setActiveStageTab(tab);
    if (tab === 'map') {
      setLeftCollapsed(true);
      setRightCollapsed(true);
      VttEventBus.emit('toggle-stage-design-mode', { active: false });
    } else if (tab === 'tree') {
      setActiveLeftTab('catalog');
      setLeftCollapsed(false);
      setRightCollapsed(true);
      VttEventBus.emit('toggle-stage-design-mode', { active: false });
    } else if (tab === 'architect') {
      setUserRole('architect');
      setRightCollapsed(false);
      setLeftCollapsed(true);
      VttEventBus.emit('toggle-stage-design-mode', { active: true });
    } else if (tab === 'gems') {
      setLeftCollapsed(true);
      setRightCollapsed(true);
      VttEventBus.emit('toggle-stage-design-mode', { active: false });
    }
  };

  // Ensure clean, uncluttered Stage on initial mount (default to Map tab with rails closed)
  useEffect(() => {
    setActiveStageTab('map');
    setLeftCollapsed(true);
    setRightCollapsed(true);
    VttEventBus.emit('toggle-stage-design-mode', { active: false });
  }, []);

  // Check URL query parameters for ?options=true to auto-open settings
  useEffect(() => {
    if (searchParams.get('options') === 'true') {
      setIsStageSettingsOpen(true);
    }
  }, [searchParams]);

  // Listen for open-module-ingestion-modal and open-stage-options from top bar, menus, or hotkeys
  useEffect(() => {
    const offIngest = VttEventBus.on('open-module-ingestion-modal', () => {
      AudioService.playTerminalBeep(1200, 0.03);
      setIsModuleIngestionOpen(true);
    });
    const offOptions = VttEventBus.on('open-stage-options', () => {
      AudioService.playTerminalBeep(1200, 0.03);
      setIsStageSettingsOpen(true);
    });
    return () => {
      offIngest();
      offOptions();
    };
  }, []);

  const { universeState, activeMapId, setActiveMapId, updateMap, addMap } = useCampaign();
  const availableMaps = universeState?.maps || [];
  const currentMap = availableMaps.find((m: any) => m.id === activeMapId) || availableMaps[0];

  // Auto-bootstrap starter maps collection if universe is empty
  useEffect(() => {
    if (availableMaps.length === 0 && addMap) {
      const starters = getStarterMapsCollection();
      starters.forEach((m) => addMap(m));
      if (starters[0]) {
        if (setActiveMapId) setActiveMapId(starters[0].id);
      }
    }
  }, [availableMaps.length, addMap, setActiveMapId]);

  useEffect(() => {
    if (scenarioIdParam && setActiveLeftTab) {
      setActiveLeftTab('scenario');
    }
  }, [scenarioIdParam, setActiveLeftTab]);

  useEffect(() => {
    if (mapIdParam && mapIdParam !== activeMapId && setActiveMapId) {
      setActiveMapId(mapIdParam);
    }
  }, [mapIdParam, activeMapId, setActiveMapId]);

  const handleDeployElementFromDrawer = (element: any, customPos?: { x: number; y: number }) => {
    if (!element) return;
    const pos = customPos || { x: 350 + (Math.random() - 0.5) * 60, y: 350 + (Math.random() - 0.5) * 60 };
    if (element.type === 'Persona') {
      const token = adeElementToStageToken(element, pos);
      if (token) {
        useEngineStore.getState().loadStaticEntity(token as any);
        useEngineStore.getState().updatePosition(token.id, pos.x, pos.y);
        useEngineStore.getState().clearSelection();
        useEngineStore.getState().setSelection(token.id, true);
        if (currentMap && updateMap) {
          updateMap(currentMap.id, {
            tokens: [...(currentMap.tokens || []), { ...token, x: pos.x, y: pos.y }]
          });
        }
      }
    } else {
      const obj = adeElementToInteractiveObject(element, pos);
      if (obj && currentMap && updateMap) {
        updateMap(currentMap.id, {
          objects: [...(currentMap.objects || []), obj]
        });
      }
    }
    AudioService.playCriticalChime(true);
  };

  const handleDeployAllElementsFromDrawer = (elements: any[]) => {
    elements.forEach((elem, idx) => {
      const angle = (idx / Math.max(1, elements.length)) * Math.PI * 2;
      const radius = 110;
      const x = Math.round(380 + Math.cos(angle) * radius);
      const y = Math.round(350 + Math.sin(angle) * radius);
      handleDeployElementFromDrawer(elem, { x, y });
    });
  };

  // Initialize Role if defaultRole specified
  useEffect(() => {
    if (defaultRole && userRole !== defaultRole) {
      setUserRole(defaultRole);
      if (defaultRole === 'architect' || defaultRole === 'gm') {
        setRightCollapsed(false);
      }
    }
  }, [defaultRole, userRole, setUserRole, setRightCollapsed]);

  // Live tokens from engine store
  const tokens = useEngineStore(selectAllFusedTokens);

  const targetToken = useMemo(() => {
    return tokens.find((t) => t.id === targetTokenId) || null;
  }, [tokens, targetTokenId]);

  // Handle layer toggles
  const handleToggleLayerVisibility = (layerId: string) => {
    if (!currentMap || !updateMap) return;
    const existing = currentMap.layers || DEFAULT_LAYERS;
    const updated = existing.map((l: any) =>
      l.id === layerId ? { ...l, visible: !l.visible } : l
    );
    updateMap(currentMap.id, { layers: updated });
    AudioService.playTerminalBeep(1050, 0.02);
  };

  const handleToggleLayerLock = (layerId: string) => {
    if (!currentMap || !updateMap) return;
    const existing = currentMap.layers || DEFAULT_LAYERS;
    const updated = existing.map((l: any) =>
      l.id === layerId ? { ...l, locked: !l.locked } : l
    );
    updateMap(currentMap.id, { layers: updated });
    AudioService.playTerminalBeep(950, 0.02);
  };

  // Left Panel: Dual Mode (Tactical Cockpit vs Module Catalog)
  const renderLeftPanel = () => (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#0c1017]">
      {/* Tab Switcher Header */}
      <div className="h-9 shrink-0 flex items-center border-b border-slate-800/80 bg-[#090d14] px-1.5 gap-1 z-10 select-none">
        <button
          type="button"
          onClick={() => {
            setActiveLeftTab('cockpit');
            AudioService.playTerminalBeep(1100, 0.02);
          }}
          className={`flex-1 h-7 rounded text-[10px] font-mono font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeLeftTab === 'cockpit'
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
          }`}
          title="Tactical Operative Cockpit (Token Vitals, AP, Strikes)"
        >
          <Crosshair size={12} className={activeLeftTab === 'cockpit' ? 'text-cyan-400' : 'text-slate-500'} />
          <span>COCKPIT</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveLeftTab('catalog');
            AudioService.playTerminalBeep(900, 0.02);
          }}
          className={`flex-1 h-7 rounded text-[10px] font-mono font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeLeftTab === 'catalog'
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
          }`}
          title="Module Catalog & Campaign Outliner (Scenes, Armory, Bestiary)"
        >
          <FolderTree size={12} className={activeLeftTab === 'catalog' ? 'text-amber-400' : 'text-slate-500'} />
          <span>CATALOG</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveLeftTab('scenario');
            AudioService.playTerminalBeep(1250, 0.02);
          }}
          className={`flex-1 h-7 rounded text-[10px] font-mono font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeLeftTab === 'scenario'
              ? 'bg-purple-950/60 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
          }`}
          title="ADE Story & Scenario Stage Drawer (Live Beats & Element Deployer)"
        >
          <BookOpen size={12} className={activeLeftTab === 'scenario' ? 'text-purple-400' : 'text-slate-500'} />
          <span>SCENARIO</span>
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeLeftTab === 'cockpit' && (
          <div className="w-full h-full overflow-hidden">
            <OperativeCockpit
              isCollapsed={isLeftCollapsed}
              onToggleCollapse={toggleLeftCollapse}
              tokens={tokens}
              activeTokenId={selectedTokenId || tokens[0]?.id}
              onSelectActiveToken={(id: string) => {
                setSelectedTokenId(id);
                useEngineStore.getState().clearSelection();
                useEngineStore.getState().setSelection(id, true);
              }}
              targetToken={targetToken}
              onSelectTargetToken={(id: string) => setTargetTokenId(id)}
              vttRole={userRole}
              onUpdateTokenHealth={(id: string, hp: number) => {
                useEngineStore.getState().healHealth(id, hp);
              }}
              onUpdateTokenVitality={(id: string, vit: number) => {
                useEngineStore.getState().healVitality(id, vit);
              }}
              onUpdateTokenStructure={(id: string, struct: number) => {
                useEngineStore.getState().healHealth(id, struct);
              }}
              objects={currentMap?.objects || []}
              currentMap={currentMap}
              onUpdateToken={(id: string, updates: any) => {
                if (currentMap && updateMap) {
                  const nextTokens = (currentMap.tokens || []).map((t: any) => t.id === id ? { ...t, ...updates } : t);
                  updateMap(currentMap.id, { tokens: nextTokens });
                }
                if (updates.current_hp !== undefined) {
                  useEngineStore.getState().healHealth(id, updates.current_hp);
                }
              }}
              onUpdateObject={(id: string, updates: any) => {
                if (currentMap && updateMap) {
                  const nextObjs = (currentMap.objects || []).map((o: any) => o.id === id ? { ...o, ...updates } : o);
                  updateMap(currentMap.id, { objects: nextObjs });
                }
              }}
              onDeleteToken={(id: string) => {
                if (currentMap && updateMap) {
                  const nextTokens = (currentMap.tokens || []).filter((t: any) => t.id !== id);
                  updateMap(currentMap.id, { tokens: nextTokens });
                }
                useEngineStore.getState().clearSelection();
                if (selectedTokenId === id) setSelectedTokenId(null);
              }}
              onDeleteObject={(id: string) => {
                if (currentMap && updateMap) {
                  const nextObjs = (currentMap.objects || []).filter((o: any) => o.id !== id);
                  updateMap(currentMap.id, { objects: nextObjs });
                }
              }}
              onDuplicateToken={(id: string) => {
                const tok = (currentMap?.tokens || []).find((t: any) => t.id === id);
                if (!tok || !currentMap || !updateMap) return;
                const clone = {
                  ...tok,
                  id: `token-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  name: `${tok.name || tok.label || 'Unit'} (Copy)`,
                  label: `${tok.label || tok.name || 'Unit'} (Copy)`,
                  x: (tok.x || 300) + 40,
                  y: (tok.y || 300) + 40
                };
                updateMap(currentMap.id, { tokens: [...(currentMap.tokens || []), clone] });
                useEngineStore.getState().loadStaticEntity(clone as any);
                setSelectedTokenId(clone.id);
              }}
              onDuplicateObject={(id: string) => {
                const obj = (currentMap?.objects || []).find((o: any) => o.id === id);
                if (!obj || !currentMap || !updateMap) return;
                const clone = {
                  ...obj,
                  id: `obj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  name: `${obj.name || obj.label || 'Object'} (Copy)`,
                  label: `${obj.label || obj.name || 'Object'} (Copy)`,
                  x: (obj.x || 300) + 40,
                  y: (obj.y || 300) + 40
                };
                updateMap(currentMap.id, { objects: [...(currentMap.objects || []), clone] });
              }}
              onDeployAsset={(asset: any, pos?: { x: number; y: number }) => {
                handleDeployElementFromDrawer(asset, pos);
              }}
              onOpenTacticalModal={(token: any) => {
                VttEventBus.emit('open-tactical-play-modal', { token });
              }}
            />
          </div>
        )}

        {activeLeftTab === 'catalog' && (
          <ModuleCatalogPanel
            onSelectMap={(id) => {
              if (setActiveMapId) setActiveMapId(id);
            }}
          />
        )}

        {activeLeftTab === 'scenario' && (
          <ADEScenarioStageDrawer
            isOpen={true}
            isInline={true}
            onClose={() => setActiveLeftTab('catalog')}
            activeScenarioId={scenarioIdParam}
            onDeployElement={handleDeployElementFromDrawer}
            onDeployAllElements={handleDeployAllElementsFromDrawer}
          />
        )}
      </div>
    </div>
  );

  // Right Panel: Architect Console (Cartography & World-Building)
  const isArchitectRole = userRole === 'architect' || userRole === 'gm';
  const renderRightPanel = () => {
    if (!isArchitectRole) return null;

    return (
      <div className="w-full h-full flex flex-col overflow-hidden bg-[#0c1017]">
        {/* Architect Rail Sub-Header */}
        <div className="h-9 shrink-0 flex items-center justify-between border-b border-slate-800/80 bg-[#090d14] px-3 z-10 select-none">
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-amber-400 tracking-wider">
            <Hammer size={12} className="text-amber-400" />
            <span>ARCHITECT CONSOLE</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/50">
            IN-SITU WEBGPU
          </span>
        </div>

        {/* Architect Tools & Layers */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ArchitectConsole
            isCollapsed={isRightCollapsed}
            onToggleCollapse={toggleRightCollapse}
            activeTool={activeArchitectTool}
            setActiveTool={setActiveArchitectTool}
            selectedTerrain={selectedTerrain}
            setSelectedTerrain={setSelectedTerrain}
            terrainWidth={terrainBrushWidth}
            setTerrainWidth={setTerrainBrushWidth}
            selectedWallType={selectedWallType}
            setSelectedWallType={setSelectedWallType}
            doorLockDc={doorLockDc}
            setDoorLockDc={setDoorLockDc}
            pencilColor={pencilColor}
            setPencilColor={setPencilColor}
            pencilWidth={pencilWidth}
            setPencilWidth={setPencilWidth}
            selectedLightColor={selectedLightColor}
            setSelectedLightColor={setSelectedLightColor}
            selectedLightRadius={selectedLightRadius}
            setSelectedLightRadius={setSelectedLightRadius}
            selectedLightAnimation={selectedLightAnimation}
            setSelectedLightAnimation={setSelectedLightAnimation}
            selectedObjectType={selectedObjectType}
            setSelectedObjectType={(obj: any) => {
              setSelectedObjectType(obj);
              setActiveArchitectTool('object');
              AudioService.playTerminalBeep(1200, 0.02);
            }}
            tokenLabelInput={tokenLabelInput}
            setTokenLabelInput={setTokenLabelInput}
            currentMapScale={currentMap?.scale || currentMap?.type || 'Encounter'}
            mapLayers={currentMap?.layers || DEFAULT_LAYERS}
            onToggleLayerVisibility={handleToggleLayerVisibility}
            onToggleLayerLock={handleToggleLayerLock}
            customAssets={universeState?.customAssets || { terrains: [], objects: [] }}
            onOpenLandmassGenerator={() => VttEventBus.emit('open-landmass-modal')}
            onOpenUvttImport={() => VttEventBus.emit('open-uvtt-modal')}
            onOpenAssetManager={() => VttEventBus.emit('open-asset-manager')}
            onOpenHeroDrawer={() => VttEventBus.emit('open-hero-drawer')}
            onOpenOmnicortexDrawer={() => VttEventBus.emit('open-omnicortex-drawer')}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <TripartiteLayout
        topBar={
          <StageBreadcrumbTabs
            currentMapId={activeMapId || ''}
            onSelectMap={(id) => {
              if (setActiveMapId) setActiveMapId(id);
            }}
            onOpenMapMaker={() => {
              setUserRole('architect');
              setRightCollapsed(false);
              AudioService.playTerminalBeep(1200, 0.04);
            }}
            onOpenUnderlayModal={() => {
              VttEventBus.emit('open-underlay-modal');
            }}
            onOpenStageOptions={() => {
              setIsStageSettingsOpen(true);
            }}
            activeStageTab={activeStageTab}
            onSelectStageTab={handleSelectStageTab}
            onSwitchToWeaver={props.onSwitchToWeaver}
          />
        }
        leftPanel={renderLeftPanel()}
        centerStage={
          <StageViewportWrapper
            {...props}
            onOpenMapMaker={() => {
              setUserRole('architect');
              setRightCollapsed(false);
              AudioService.playTerminalBeep(1200, 0.04);
            }}
          />
        }
        rightPanel={renderRightPanel()}
        className="w-full h-full"
      />

      {/* In-Situ Guidance Gems Slide-Over Panel (WebGPU canvas stays alive underneath) */}
      {activeStageTab === 'gems' && (
        <div className="absolute top-10 right-0 bottom-0 w-96 max-w-[90vw] z-40 bg-[#0c1017]/98 border-l border-rose-500/40 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-200">
          <GuidanceGemsPanel onClose={() => setActiveStageTab('map')} />
        </div>
      )}

      {/* Active Situational & Temporary Modifiers HUD Strip */}
      {universeState?.galleryModifiers && universeState.galleryModifiers.filter((m: any) => m.isActive).length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[#080d18]/92 backdrop-blur-md border border-purple-500/40 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-2xl font-mono text-xs select-none max-w-[90vw] overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-1.5 text-purple-400 font-bold uppercase text-[10px] shrink-0 pr-1.5 border-r border-slate-700/80">
            <Sliders size={12} />
            <span>Active Mods:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {universeState.galleryModifiers.filter((m: any) => m.isActive).map((mod: any) => (
              <div
                key={mod.id}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-slate-200 text-[10px] hover:border-purple-400 transition-colors"
                title={`${mod.name}: ${mod.description || 'Active situational modifier.'}`}
              >
                <span className="font-bold text-purple-300">{mod.name}</span>
                {mod.effects?.metaphysicMod !== 0 && (
                  <span className="text-purple-400 font-bold">
                    {mod.effects.metaphysicMod > 0 ? `+${mod.effects.metaphysicMod}` : mod.effects.metaphysicMod} Meta
                  </span>
                )}
                {mod.effects?.techMod !== 0 && (
                  <span className="text-cyan-400 font-bold">
                    {mod.effects.techMod > 0 ? `+${mod.effects.techMod}` : mod.effects.techMod} Tech
                  </span>
                )}
                {mod.effects?.attackMod !== 0 && (
                  <span className={mod.effects.attackMod > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {mod.effects.attackMod > 0 ? `+${mod.effects.attackMod}` : mod.effects.attackMod} ATK
                  </span>
                )}
                {mod.isTemporary && (
                  <span className="text-amber-400 font-mono text-[9px]">
                    ({mod.remainingRounds}r)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VTT Story Module Ingestion Modal */}
      <VttModuleIngestionModal
        isOpen={isModuleIngestionOpen}
        onClose={() => setIsModuleIngestionOpen(false)}
      />

      {/* VTT Stage Settings & Tactical Operations Console */}
      <StageSettingsModal
        isOpen={isStageSettingsOpen}
        onClose={() => setIsStageSettingsOpen(false)}
        activeMapId={activeMapId || ''}
        onSelectMap={(id) => {
          if (setActiveMapId) setActiveMapId(id);
        }}
        onDeployElement={handleDeployElementFromDrawer}
      />

    </div>
  );
};

export default TripartiteStageView;

