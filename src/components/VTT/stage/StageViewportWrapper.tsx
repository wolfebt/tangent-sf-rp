/**
 * @file StageViewportWrapper.tsx
 * @description Center Zone Viewport Orchestrator.
 * Combines StageBreadcrumbTabs, the WebGPU StageView canvas engine,
 * and the floating TokenContextualPill action HUD.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenContextualPill } from './TokenContextualPill';
import { StageSplitView } from './StageSplitView';
import StageView from '../StageView';
import type { StageViewProps } from '../StageView';
import { Stage3DViewport } from './Stage3DViewport';
import { useCampaign } from '../../../context/CampaignContext';
import { useEngineStore } from '../../../engine/index';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { useConfirm } from '../../../context/ConfirmContext';
import { AudioService } from '../../../services/audioService';
import { VttEventBus } from '../../../utils/vttEventBus';
import { 
  createBlankCanvas, 
  createDerelictStarshipMap, 
  createResearchOutpostMap 
} from './defaultMaps';
import { Grid, Plus, Rocket, Shield, Hammer, ExternalLink, Columns } from 'lucide-react';

export interface StageViewportWrapperProps extends StageViewProps {
  onOpenMapMaker?: () => void;
  onOpenUnderlayModal?: () => void;
  sceneId?: string;
  showFloatingBar?: boolean;
}

export const StageViewportWrapper: React.FC<StageViewportWrapperProps> = ({
  onOpenMapMaker,
  onOpenUnderlayModal,
  sceneId,
  showFloatingBar = false,
  ...stageProps
}) => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { universeState, activeMapId, setActiveMapId, updateMap, addMap, mapsCatalog } = useCampaign();

  const availableMaps = React.useMemo(() => {
    const catalog = ((mapsCatalog || []) as any[]);
    const projectMaps = (((universeState?.maps || []) as any[])).filter(m => !catalog.some(cm => cm.id === m.id));
    return [...catalog, ...projectMaps];
  }, [mapsCatalog, universeState?.maps]);

  const targetMapId = sceneId || activeMapId || availableMaps[0]?.id || null;
  const currentMap = availableMaps.find((m: any) => m.id === targetMapId) || availableMaps[0] || null;

  useEffect(() => {
    if (sceneId && activeMapId !== sceneId && setActiveMapId) {
      setActiveMapId(sceneId);
    }
  }, [sceneId, activeMapId, setActiveMapId]);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isArchitectActive, setIsArchitectActive] = useState(false);
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

  // Sync with Architect Design Mode events
  useEffect(() => {
    const unsub = VttEventBus.on('toggle-stage-design-mode', (payload) => {
      if (payload?.active !== undefined) setIsArchitectActive(Boolean(payload.active));
      else setIsArchitectActive(prev => !prev);
    });
    const unsubArm = VttEventBus.on('arm-stage-tool', () => {
      setIsArchitectActive(true);
    });
    return () => {
      unsub();
      unsubArm();
    };
  }, []);

  const handleToggleArchitectMode = () => {
    const next = !isArchitectActive;
    setIsArchitectActive(next);
    VttEventBus.emit('toggle-stage-design-mode', { active: next });
    AudioService.playTerminalBeep(next ? 1500 : 900, 0.04);
  };

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
          reader.onload = async (loadEvt) => {
            const dataUrl = loadEvt.target?.result as string;
            if (!dataUrl) return;

            const rect = viewportRef.current?.getBoundingClientRect();
            const dropX = rect ? Math.max(20, Math.round(e.clientX - rect.left)) : 350;
            const dropY = rect ? Math.max(20, Math.round(e.clientY - rect.top)) : 350;

            const isMap = await confirm({
              title: `Asset Ingestion: "${file.name}"`,
              message: `Deploy as Battlemap Background or spawn as Actor Token at (${dropX}, ${dropY})?`,
              confirmLabel: 'Deploy Battlemap',
              cancelLabel: 'Spawn Token'
            });

            if (isMap) {
              const activeMap = availableMaps.find((m: any) => m.id === (targetMapId || activeMapId)) || availableMaps[0];
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

              const activeMap = availableMaps.find((m: any) => m.id === (targetMapId || activeMapId)) || availableMaps[0];
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

      const isPersona = data.type === 'character' || !!data.isPersona || data.elementType === 'Persona' || data.element?.type === 'Persona';

      if (isPersona) {
        const charData = data.element || data;
        const newId = `${charData.id || 'token'}-${Date.now()}`;
        const isSyn = !!charData.isSynthetic || String(charData.species || '').toLowerCase().includes('synthetic');
        const staticToken = {
          id: newId,
          character_doc_id: charData.id || charData.heroId || charData['character-doc-id'],
          name: charData.name || charData.title || 'Operative',
          base_hp: charData.health || charData.hp || 30,
          base_vitality: charData.vitality || 30,
          base_health: charData.health || charData.hp || 30,
          base_structure: charData.structure || 60,
          is_synthetic: isSyn,
          tech_level: charData.tech_level || 3,
          armor_dr: charData.dr || charData.armor_dr || 8,
          stamina_dr: charData.stamina_dr || 2,
          size_modifier: 0,
          speed_ft: charData.speed_ft || 30,
          species: charData.species || 'Human',
          archetype: charData.archetype || 'Operative',
          is_persona: true
        };

        // Ingest into VolatileSharder engine state
        useEngineStore.getState().loadStaticEntity(staticToken);
        useEngineStore.getState().updatePosition(newId, dropX, dropY);
        useEngineStore.getState().clearSelection();
        useEngineStore.getState().setSelection(newId, true);

        // Persist into active Campaign map token collection
        const activeMap = availableMaps.find((m: any) => m.id === (targetMapId || activeMapId)) || availableMaps[0];
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
      } else {
        // Story Element / Interactive Tactical Object (Items, Hazards, Terminals, Clues, Objectives)
        const elem = data.element || data;
        const rawType = elem.type || elem.elementType || data.elementType || 'Custom';

        let objType: 'terminal' | 'bulkhead' | 'hazard_emitter' | 'loot_container' | 'sensor_beacon' = 'sensor_beacon';
        if (rawType === 'Item') objType = 'loot_container';
        else if (rawType === 'Hazard') objType = 'hazard_emitter';
        else if (rawType === 'Technology') objType = 'terminal';
        else if (rawType === 'bulkhead' || rawType === 'Door') objType = 'bulkhead';

        const newMapObj = {
          id: `obj-${elem.id || Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: objType,
          name: elem.title || elem.name || `Story ${rawType}`,
          storyElementId: elem.id,
          storyElementType: rawType,
          x: dropX,
          y: dropY,
          isOpen: false,
          omnicortexGearId: elem.fields?.gearId || elem.id,
          readAloudText: elem.content || elem.fields?.summary || ''
        };

        const activeMap = availableMaps.find((m: any) => m.id === (targetMapId || activeMapId)) || availableMaps[0];
        if (activeMap && updateMap) {
          updateMap(activeMap.id, {
            objects: [...(activeMap.objects || []), newMapObj]
          });
        } else if (addMap) {
          const newMap = createBlankCanvas({ title: 'Tactical Sector' });
          newMap.objects = [newMapObj];
          addMap(newMap);
          if (setActiveMapId) setActiveMapId(newMap.id);
        }

        AudioService.playCriticalChime(true);
      }
    } catch (err) {
      console.error('[StageViewportWrapper] Drop ingestion failed:', err);
    }
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-[#050811] overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── OVERHEAD FLOATING STAGE ACTION & ARCHITECT BAR (Only shown when showFloatingBar is explicitly true) ── */}
      {showFloatingBar && (
        <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between gap-2 pointer-events-none select-none font-mono">
          {/* Left: Active Sector Pill & Grid Scale */}
          <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="truncate max-w-[150px]">{currentMap?.title || currentMap?.name || 'Sector Canvas'}</span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
              {currentMap?.gridType || currentMap?.gridMode || 'Hex'} {currentMap?.gridSize || 70}px
            </span>
            <span className="text-[10px] text-slate-400">
              {currentMap?.tokens?.length || 0} tokens • {currentMap?.objects?.length || 0} objects
            </span>
          </div>

          {/* Center: In-Situ Architect & Map Studio Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg">
            <button
              type="button"
              onClick={handleToggleArchitectMode}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isArchitectActive
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/40'
              }`}
              title="Toggle In-Situ Architect Mode: Draw walls, doors, terrains, and lights directly on this stage"
            >
              <Hammer size={12} />
              <span>{isArchitectActive ? 'ARCHITECT ACTIVE' : 'MAP ARCHITECT'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const targetId = currentMap?.id || activeMapId;
                navigate(targetId ? `/foundry/map-maker?mapId=${targetId}` : '/foundry/map-maker');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Launch Full Map Maker Studio in dedicated workspace"
            >
              <ExternalLink size={11} />
              <span className="hidden sm:inline">FULL STUDIO</span>
            </button>

            <button
              type="button"
              onClick={() => {
                toggle3DActive();
                AudioService.playTerminalBeep(!is3DActive ? 880 : 440, 0.05);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                is3DActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
              title="Toggle 2D / 3D Stage (Hotkey: V)"
            >
              <span>{is3DActive ? '3D' : '2D'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSplitOpen(!isSplitOpen)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                isSplitOpen
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
              title="Toggle Split View Inspector"
            >
              <Columns size={12} />
            </button>
          </div>

          {/* Right: Map Switcher & Quick New Canvas */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl px-2 py-1 shadow-lg">
            <select
              value={currentMap?.id || activeMapId || ''}
              onChange={(e) => {
                if (setActiveMapId) setActiveMapId(e.target.value);
                AudioService.playTerminalBeep(1100, 0.02);
              }}
              className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer max-w-[120px] truncate"
            >
              {availableMaps.map((m: any) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.title || 'Untitled Map'}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                if (addMap) {
                  const newMap = createBlankCanvas({ title: `Tactical Sector ${availableMaps.length + 1}` });
                  addMap(newMap);
                  if (setActiveMapId) setActiveMapId(newMap.id);
                  AudioService.playCriticalChime(true);
                }
              }}
              className="p-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 cursor-pointer"
              title="Spawn fresh blank tactical canvas"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}

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
            <StageView
              {...stageProps}
              sceneId={targetMapId || undefined}
              isEmbeddedInTripartite={stageProps.isEmbeddedInTripartite ?? true}
            />
          )}

          {/* Drop Target HUD Banner */}
          {isDraggingOver && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-cyan-950/20 backdrop-blur-[1px] z-50 animate-pulse">
              <div className="px-5 py-2.5 rounded-xl border border-cyan-400/80 bg-slate-950/90 shadow-[0_0_30px_rgba(34,211,238,0.4)] text-cyan-300 font-mono text-sm tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                DROP TO DEPLOY COMPONENT TO STAGE COORDINATES
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
