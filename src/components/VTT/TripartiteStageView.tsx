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

import React, { useEffect, useMemo } from 'react';
import { 
  Crosshair, 
  FolderTree, 
  Hammer
} from 'lucide-react';
import { TripartiteLayout } from './TripartiteLayout';
import { StageViewportWrapper } from './stage/StageViewportWrapper';
import { ModuleCatalogPanel } from './catalog/ModuleCatalogPanel';
import { OperativeCockpitRail } from '../../pages/Foundry/MapMaker/map/OperativeCockpitRail';
import { ArchitectConsoleRail } from '../../pages/Foundry/MapMaker/map/ArchitectConsoleRail';
import { DEFAULT_LAYERS } from '../../pages/Foundry/MapMaker/map/MapConstants';

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
  const { universeState, activeMapId, setActiveMapId, updateMap } = useCampaign();
  const currentMap = universeState?.maps?.find((m: any) => m.id === activeMapId) || universeState?.maps?.[0];

  // Layout & Tool Reactive State
  const {
    userRole,
    setUserRole,
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
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeLeftTab === 'cockpit' ? (
          <div className="w-full h-full overflow-y-auto overflow-x-hidden">
            <OperativeCockpit
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
        ) : (
          <ModuleCatalogPanel
            onSelectMap={(id) => {
              if (setActiveMapId) setActiveMapId(id);
            }}
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <ArchitectConsole
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
  );
};

export default TripartiteStageView;

