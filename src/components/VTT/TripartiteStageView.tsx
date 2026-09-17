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
  BookOpen
} from 'lucide-react';
import { TripartiteLayout } from './TripartiteLayout';
import { StageViewportWrapper } from './stage/StageViewportWrapper';
import { ModuleCatalogPanel } from './catalog/ModuleCatalogPanel';
import { ADEScenarioStageDrawer } from './stage/ADEScenarioStageDrawer';
import { OperativeCockpitRail } from '../../pages/Foundry/MapMaker/map/OperativeCockpitRail';
import { ArchitectConsoleRail } from '../../pages/Foundry/MapMaker/map/ArchitectConsoleRail';
import { DEFAULT_LAYERS } from '../../pages/Foundry/MapMaker/map/MapConstants';
import { adeElementToStageToken, adeElementToInteractiveObject } from '../../utils/storyAssetAdapter';

const OperativeCockpit = OperativeCockpitRail as unknown as React.ComponentType<any>;
const ArchitectConsole = ArchitectConsoleRail as unknown as React.ComponentType<any>;
import type { StageViewProps } from './StageView';
import { useCampaign } from '../../context/CampaignContext';
import { useEngineStore, selectAllFusedTokens } from '../../engine/index';
import { useUILayoutStore, type UserVttRole } from './store/uiLayoutStore';
import { AudioService } from '../../services/audioService';

export interface TripartiteStageViewProps extends StageViewProps {
  defaultRole?: UserVttRole;
}

export const TripartiteStageView: React.FC<TripartiteStageViewProps> = ({
  defaultRole,
  ...props
}) => {
  const [searchParams] = useSearchParams();
  const scenarioIdParam = searchParams.get('scenarioId') || undefined;
  const mapIdParam = searchParams.get('mapId') || undefined;

  const [isScenarioDrawerOpen, setIsScenarioDrawerOpen] = useState(false);

  // Layout & Tool Reactive State
  const {
    userRole,
    setUserRole,
    isLeftCollapsed,
    isRightCollapsed,
    toggleLeftCollapse,
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
    setPencilWidth
  } = useUILayoutStore();

  const { universeState, activeMapId, setActiveMapId, updateMap } = useCampaign();
  const currentMap = universeState?.maps?.find((m: any) => m.id === activeMapId) || universeState?.maps?.[0];

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
            currentMapScale={currentMap?.scale || currentMap?.type || 'Encounter'}
            mapLayers={currentMap?.layers || DEFAULT_LAYERS}
            onToggleLayerVisibility={handleToggleLayerVisibility}
            onToggleLayerLock={handleToggleLayerLock}
            customAssets={universeState?.customAssets || { terrains: [], objects: [] }}
            onOpenLandmassGenerator={() => window.dispatchEvent(new CustomEvent('open-landmass-modal'))}
            onOpenUvttImport={() => window.dispatchEvent(new CustomEvent('open-uvtt-modal'))}
            onOpenAssetManager={() => window.dispatchEvent(new CustomEvent('open-asset-manager'))}
            onOpenHeroDrawer={() => window.dispatchEvent(new CustomEvent('open-hero-drawer'))}
            onOpenOmnicortexDrawer={() => window.dispatchEvent(new CustomEvent('open-omnicortex-drawer'))}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <TripartiteLayout
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

      {/* In-Situ ADE Scenario Drawer */}
      <ADEScenarioStageDrawer
        isOpen={isScenarioDrawerOpen}
        onClose={() => setIsScenarioDrawerOpen(false)}
        activeScenarioId={scenarioIdParam}
        onDeployElement={handleDeployElementFromDrawer}
        onDeployAllElements={handleDeployAllElementsFromDrawer}
      />
    </div>
  );
};

export default TripartiteStageView;

