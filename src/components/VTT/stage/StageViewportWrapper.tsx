/**
 * @file StageViewportWrapper.tsx
 * @description Center Zone Viewport Orchestrator.
 * Combines StageBreadcrumbTabs, the WebGPU StageView canvas engine,
 * and the floating TokenContextualPill action HUD.
 */

import React, { useState, useRef } from 'react';
import { TokenContextualPill } from './TokenContextualPill';
import { StageSplitView } from './StageSplitView';
import StageView from '../StageView';
import type { StageViewProps } from '../StageView';
import { Stage3DViewport } from './Stage3DViewport';
import { useCampaign } from '../../../context/CampaignContext';
import { useEngineStore } from '../../../engine/index';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { AudioService } from '../../../services/audioService';
import { 
  createBlankCanvas, 
  createDerelictStarshipMap, 
  createResearchOutpostMap 
} from './defaultMaps';
import { Grid, Plus, Rocket, Shield } from 'lucide-react';

export interface StageViewportWrapperProps extends StageViewProps {
  onOpenMapMaker?: () => void;
  onOpenUnderlayModal?: () => void;
}

export const StageViewportWrapper: React.FC<StageViewportWrapperProps> = ({
  onOpenMapMaker,
  onOpenUnderlayModal,
  ...stageProps
}) => {
  const { universeState, activeMapId, setActiveMapId, updateMap, addMap } = useCampaign();
  const availableMaps = universeState?.maps || [];
  const currentMap = availableMaps.find((m: any) => m.id === activeMapId) || availableMaps[0] || null;

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const {
    isSplitOpen,
    setSplitOpen,
    activeSplitTab,
    setActiveSplitTab,
    is3DActive,
    toggle3DActive,
    set3DActive
  } = useUILayoutStore();
  const viewportRef = useRef<HTMLDivElement>(null);

  // Global hotkey V to toggle 2D / 3D Stage
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) {
        return;
      }
      if (e.key.toLowerCase() === 'v' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        toggle3DActive();
        AudioService.playTerminalBeep(!is3DActive ? 880 : 440, 0.05);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle3DActive, is3DActive]);

  // Handle Drag & Drop Token Spawning directly onto The Stage
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only deactivate if leaving the container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    try {
      // 1. Check if files were dropped from OS desktop / file explorer
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg)$/i.test(file.name))) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            const dataUrl = loadEvt.target?.result as string;
            if (!dataUrl) return;

            const rect = viewportRef.current?.getBoundingClientRect();
            const dropX = rect ? Math.max(20, Math.round(e.clientX - rect.left)) : 350;
            const dropY = rect ? Math.max(20, Math.round(e.clientY - rect.top)) : 350;

            const isMap = window.confirm(
              `Asset Ingestion: "${file.name}"\n\nClick [OK] to deploy as Battlemap Background.\nClick [Cancel] to spawn as an Actor Token at (${dropX}, ${dropY}).`
            );

            if (isMap) {
              const activeMap = universeState?.maps?.find((m: any) => m.id === activeMapId) || universeState?.maps?.[0];
              if (activeMap && updateMap) {
                updateMap(activeMap.id, {
                  background_url: dataUrl,
                  name: activeMap.name || file.name.replace(/\.[^/.]+$/, '')
                });
                AudioService.playCriticalChime(true);
              } else if (addMap) {
                const newMap = createBlankCanvas({
                  title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                  backgroundUrl: dataUrl
                });
                addMap(newMap);
                if (setActiveMapId) setActiveMapId(newMap.id);
                AudioService.playCriticalChime(true);
              }
            } else {
              const newId = `token-${Date.now()}`;
              const tokenName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
              const staticToken = {
                id: newId,
                name: tokenName,
                image_url: dataUrl,
                base_hp: 30,
                base_vitality: 30,
                base_health: 30,
                tech_level: 3,
                armor_dr: 6,
                stamina_dr: 2,
                speed_ft: 30,
                size_modifier: 0,
                is_persona: false
              };
              useEngineStore.getState().loadStaticEntity(staticToken);
              useEngineStore.getState().updatePosition(newId, dropX, dropY);
              useEngineStore.getState().clearSelection();
              useEngineStore.getState().setSelection(newId, true);

              const activeMap = universeState?.maps?.find((m: any) => m.id === activeMapId) || universeState?.maps?.[0];
              if (activeMap && updateMap) {
                updateMap(activeMap.id, {
                  tokens: [...(activeMap.tokens || []), { ...staticToken, x: dropX, y: dropY }]
                });
              } else if (addMap) {
                const newMap = createBlankCanvas({ title: 'Tactical Sector' });
                newMap.tokens = [{ ...staticToken, x: dropX, y: dropY }];
                addMap(newMap);
                if (setActiveMapId) setActiveMapId(newMap.id);
              }
              AudioService.playCriticalChime(true);
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }

      // 2. Process JSON drag-and-drop from Module Catalog or Folio
      const rawPayload = e.dataTransfer.getData('application/json');
      if (!rawPayload) return;

      const data = JSON.parse(rawPayload);
      const rect = viewportRef.current?.getBoundingClientRect();
      const dropX = rect ? Math.max(20, Math.round(e.clientX - rect.left)) : 350;
      const dropY = rect ? Math.max(20, Math.round(e.clientY - rect.top)) : 350;

      const newId = `${data.id || 'token'}-${Date.now()}`;
      const isSyn = !!data.isSynthetic || String(data.species || '').toLowerCase().includes('synthetic');
      const staticToken = {
        id: newId,
        character_doc_id: data.id || data.heroId || data['character-doc-id'],
        name: data.name || data.title || 'Operative',
        base_hp: data.health || data.hp || 30,
        base_vitality: data.vitality || 30,
        base_health: data.health || data.hp || 30,
        base_structure: data.structure || 60,
        is_synthetic: isSyn,
        tech_level: data.tech_level || 3,
        armor_dr: data.dr || data.armor_dr || 8,
        stamina_dr: data.stamina_dr || 2,
        size_modifier: 0,
        speed_ft: data.speed_ft || 30,
        species: data.species || 'Human',
        archetype: data.archetype || 'Operative',
        is_persona: data.type === 'character' || !!data.isPersona
      };

      // Ingest into VolatileSharder engine state
      useEngineStore.getState().loadStaticEntity(staticToken);
      useEngineStore.getState().updatePosition(newId, dropX, dropY);
      useEngineStore.getState().clearSelection();
      useEngineStore.getState().setSelection(newId, true);

      // Persist into active Campaign map token collection
      const activeMap = universeState?.maps?.find((m: any) => m.id === activeMapId) || universeState?.maps?.[0];
      if (activeMap && updateMap) {
        updateMap(activeMap.id, {
          tokens: [...(activeMap.tokens || []), { ...staticToken, x: dropX, y: dropY }]
        });
      } else if (addMap) {
        const newMap = createBlankCanvas({ title: 'Tactical Sector' });
        newMap.tokens = [{ ...staticToken, x: dropX, y: dropY }];
        addMap(newMap);
        if (setActiveMapId) setActiveMapId(newMap.id);
      }

      AudioService.playCriticalChime(true);
    } catch (err) {
      console.error('[StageViewportWrapper] Drop ingestion failed:', err);
    }
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-[#050811] overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Center WebGPU / Pixi 2D or Three.js 3D Viewport Dropzone inside Split View */}
      <StageSplitView
        isOpen={isSplitOpen}
        onClose={() => setSplitOpen(false)}
        activeTab={activeSplitTab}
        onSelectTab={setActiveSplitTab}
      >
        <div 
          ref={viewportRef}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full h-full overflow-hidden transition-all ${
            isDraggingOver ? 'ring-2 ring-inset ring-cyan-400 bg-cyan-950/10' : ''
          }`}
        >
          {is3DActive ? (
            <Stage3DViewport onSwitchTo2D={() => set3DActive(false)} />
          ) : (
            <StageView {...stageProps} isEmbeddedInTripartite={stageProps.isEmbeddedInTripartite ?? true} />
          )}

          {/* Drop Target HUD Banner */}
          {isDraggingOver && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-cyan-950/20 backdrop-blur-[1px] z-50 animate-pulse">
              <div className="px-5 py-2.5 rounded-xl border border-cyan-400/80 bg-slate-950/90 shadow-[0_0_30px_rgba(34,211,238,0.4)] text-cyan-300 font-mono text-sm tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                DROP TO DEPLOY TOKEN TO STAGE COORDINATES
              </div>
            </div>
          )}

          {/* Floating Contextual Action Pill (Fitts's Law on-canvas token HUD) */}
          <TokenContextualPill />

          {/* Empty Stage Quick-Start Fallback Overlay */}
          {(!currentMap || availableMaps.length === 0) && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#070a12]/90 backdrop-blur-md p-6 select-none">
              <div className="max-w-md w-full bg-[#0d131f] border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.2)] text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  <Grid size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono text-cyan-200 uppercase tracking-wider">
                    NO TACTICAL STAGE ACTIVE
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Initialize a fresh blank canvas or deploy a pre-configured sci-fi encounter scene to begin:
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (addMap) {
                        const newMap = createBlankCanvas({ title: 'Tactical Blank Canvas' });
                        addMap(newMap);
                        if (setActiveMapId) setActiveMapId(newMap.id);
                        AudioService.playCriticalChime(true);
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>CREATE BLANK CANVAS (HEX)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (addMap) {
                        const newMap = createDerelictStarshipMap();
                        addMap(newMap);
                        if (setActiveMapId) setActiveMapId(newMap.id);
                        AudioService.playCriticalChime(true);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Rocket size={14} />
                    <span>DEPLOY STARSHIP CORRIDOR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (addMap) {
                        const newMap = createResearchOutpostMap();
                        addMap(newMap);
                        if (setActiveMapId) setActiveMapId(newMap.id);
                        AudioService.playCriticalChime(true);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Shield size={14} />
                    <span>DEPLOY RESEARCH OUTPOST</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </StageSplitView>
    </div>
  );
};

export default StageViewportWrapper;
