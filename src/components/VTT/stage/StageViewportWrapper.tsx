/**
 * @file StageViewportWrapper.tsx
 * @description Center Zone Viewport Orchestrator.
 * Combines StageBreadcrumbTabs, the WebGPU StageView canvas engine,
 * and the floating TokenContextualPill action HUD.
 */

import React, { useState, useRef } from 'react';
import { StageBreadcrumbTabs } from './StageBreadcrumbTabs';
import { TokenContextualPill } from './TokenContextualPill';
import { StageSplitView, type SplitTabType } from './StageSplitView';
import StageView from '../StageView';
import type { StageViewProps } from '../StageView';
import { useCampaign } from '../../../context/CampaignContext';
import { useEngineStore } from '../../../engine/index';
import { AudioService } from '../../../services/audioService';

export interface StageViewportWrapperProps extends StageViewProps {
  onOpenMapMaker?: () => void;
  onOpenUnderlayModal?: () => void;
}

export const StageViewportWrapper: React.FC<StageViewportWrapperProps> = ({
  onOpenMapMaker,
  onOpenUnderlayModal,
  ...stageProps
}) => {
  const { universeState, activeMapId, setActiveMapId, updateMap } = useCampaign();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [activeSplitTab, setActiveSplitTab] = useState<SplitTabType>('folio');
  const viewportRef = useRef<HTMLDivElement>(null);

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
      const rawPayload = e.dataTransfer.getData('application/json');
      if (!rawPayload) return;

      const data = JSON.parse(rawPayload);
      const rect = viewportRef.current?.getBoundingClientRect();
      const dropX = rect ? Math.max(20, Math.round(e.clientX - rect.left)) : 350;
      const dropY = rect ? Math.max(20, Math.round(e.clientY - rect.top)) : 350;

      const newId = `${data.id || 'token'}-${Date.now()}`;
      const staticToken = {
        id: newId,
        character_doc_id: data.id || data.heroId || data['character-doc-id'],
        name: data.name || data.title || 'Operative',
        base_hp: data.hp || 35,
        tech_level: data.tech_level || 3,
        armor_dr: data.dr || 8,
        size_modifier: 0,
        speed_ft: 30,
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
      const currentMap = universeState?.maps?.find((m: any) => m.id === activeMapId);
      if (currentMap && updateMap) {
        updateMap(currentMap.id, {
          tokens: [...(currentMap.tokens || []), { ...staticToken, x: dropX, y: dropY }]
        });
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
      {/* Two-Tiered Breadcrumb & Scene Tab Bar */}
      <StageBreadcrumbTabs
        currentMapId={activeMapId || ''}
        onSelectMap={(id) => {
          if (setActiveMapId) setActiveMapId(id);
        }}
        onOpenMapMaker={onOpenMapMaker}
        onOpenUnderlayModal={onOpenUnderlayModal}
        isSplitOpen={isSplitOpen}
        onToggleSplit={() => {
          setIsSplitOpen(prev => !prev);
          AudioService.playTerminalBeep(!isSplitOpen ? 1100 : 700, 0.04);
        }}
      />

      {/* Center WebGPU / Pixi Stage Canvas Viewport Dropzone inside Split View */}
      <StageSplitView
        isOpen={isSplitOpen}
        onClose={() => setIsSplitOpen(false)}
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
          <StageView {...stageProps} />

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
        </div>
      </StageSplitView>
    </div>
  );
};

export default StageViewportWrapper;
