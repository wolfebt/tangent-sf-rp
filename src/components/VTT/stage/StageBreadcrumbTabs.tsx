/**
 * @file StageBreadcrumbTabs.tsx
 * @description Two-tiered Breadcrumb & Scene Tab Bar for the Center Stage Viewport.
 * Tier 1 (Macro): Tracks campaign hierarchy depth (Universe > Sector/Campaign > Active Map).
 * Tier 2 (Micro Scene Tabs): Interactive map tabs with double-click inline renaming,
 * tab close confirmation, PartyPin, CombatPulse, and cache preload badges.
 */

import React, { useState } from 'react';
import { 
  Map, 
  ChevronRight, 
  Users, 
  Swords, 
  Layers,
  Settings,
  Plus,
  X
} from 'lucide-react';
import { useCampaign } from '../../../context/CampaignContext';
import { v4 as uuidv4 } from 'uuid';

export interface StageBreadcrumbTabsProps {
  currentMapId: string;
  onSelectMap: (mapId: string) => void;
  onOpenMapMaker?: () => void;
  onOpenUnderlayModal?: () => void;
}

export const StageBreadcrumbTabs: React.FC<StageBreadcrumbTabsProps> = ({
  currentMapId,
  onSelectMap,
  onOpenMapMaker,
  onOpenUnderlayModal
}) => {
  const { universeState, setActiveMapId, addMap, updateMap, deleteMap } = useCampaign();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const availableMaps = universeState?.maps || [];
  const activeMap = availableMaps.find((m: any) => m.id === currentMapId) || availableMaps[0] || null;
  const campaignName = universeState?.projectName || 'Tangent Campaign';

  // Handle Double-Click Inline Rename
  const handleStartRename = (map: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(map.id);
    setEditingTitle(map.name || map.title || 'Untitled Sector');
  };

  const handleCommitRename = (mapId: string) => {
    if (!editingTitle.trim() || !updateMap) {
      setEditingTabId(null);
      return;
    }
    updateMap(mapId, { name: editingTitle.trim(), title: editingTitle.trim() });
    setEditingTabId(null);
  };

  const handleKeyDownRename = (e: React.KeyboardEvent, mapId: string) => {
    if (e.key === 'Enter') {
      handleCommitRename(mapId);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  // Handle Tab Close
  const handleCloseTab = (mapId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (availableMaps.length <= 1) {
      alert('Cannot close the last remaining scene in the module.');
      return;
    }
    if (window.confirm('Remove this tactical scene from the active campaign tabs?')) {
      if (deleteMap) deleteMap(mapId);
      const remaining = availableMaps.filter((m: any) => m.id !== mapId);
      if (remaining.length > 0 && mapId === currentMapId) {
        onSelectMap(remaining[0].id);
        if (setActiveMapId) setActiveMapId(remaining[0].id);
      }
    }
  };

  // Handle Create New Map Tab
  const handleCreateNewScene = () => {
    if (!addMap) return;
    const newId = uuidv4();
    const newMap = {
      id: newId,
      name: `Sector ${availableMaps.length + 1}`,
      title: `Sector ${availableMaps.length + 1}`,
      gridType: 'square',
      gridSize: 70,
      tokens: [],
      walls: [],
      objects: [],
      terrains: [],
      lights: []
    };
    addMap(newMap);
    onSelectMap(newId);
    if (setActiveMapId) setActiveMapId(newId);
  };

  return (
    <div className="w-full flex flex-col bg-[#0b0f14] border-b border-slate-800 select-none font-sans">
      {/* ========================================================================= */}
      {/* TIER 1: MACRO CAMPAIGN HIERARCHY BREADCRUMBS                              */}
      {/* ========================================================================= */}
      <div className="h-7 px-3 flex items-center justify-between gap-2 bg-[#090d12] border-b border-slate-900 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
          <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            UNIVERSE
          </span>
          <ChevronRight size={11} className="text-slate-600 shrink-0" />
          <span className="text-slate-300 font-bold hover:text-cyan-300 transition-colors cursor-pointer truncate">
            {campaignName}
          </span>
          <ChevronRight size={11} className="text-slate-600 shrink-0" />
          <span className="text-amber-400 font-semibold truncate">
            {activeMap ? (activeMap.name || activeMap.title || 'Tactical Sector') : 'No Map Loaded'}
          </span>
        </div>

        {/* Tactical Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenUnderlayModal && (
            <button
              type="button"
              onClick={onOpenUnderlayModal}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[10.5px] transition-colors flex items-center gap-1 cursor-pointer"
              title="Calibrate Map Underlay Image & Grid Scale"
            >
              <Settings size={10} />
              <span>Underlay</span>
            </button>
          )}

          {onOpenMapMaker && (
            <button
              type="button"
              onClick={onOpenMapMaker}
              className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-[10.5px] transition-colors flex items-center gap-1 cursor-pointer"
              title="Open In-Situ Map Maker Palette"
            >
              <Layers size={10} />
              <span>Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: MICRO SCENE TABS (Currently Active / Loaded Maps)                 */}
      {/* ========================================================================= */}
      <div className="h-9 px-2 flex items-center gap-1 overflow-x-auto scrollbar-none bg-[#0e131b]">
        {availableMaps.length === 0 ? (
          <div className="text-[11px] font-mono text-slate-500 px-2 flex items-center gap-2">
            <span>NO ACTIVE SCENES IN REPOSITORY.</span>
            <button
              type="button"
              onClick={handleCreateNewScene}
              className="text-cyan-400 hover:underline font-bold"
            >
              + Create Scene
            </button>
          </div>
        ) : (
          <>
            {availableMaps.map((map: any, idx: number) => {
              const isCurrent = map.id === currentMapId;
              const hasParty = isCurrent || idx === 0;
              const isCombat = !!map.isCombatActive;
              const isEditing = editingTabId === map.id;

              return (
                <div
                  key={map.id || idx}
                  onClick={() => {
                    onSelectMap(map.id);
                    if (setActiveMapId) setActiveMapId(map.id);
                  }}
                  onDoubleClick={(e) => handleStartRename(map, e)}
                  className={`group relative h-7 px-2.5 rounded-t-md border-t border-x text-xs font-mono font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer shrink-0 max-w-[240px] ${
                    isCurrent
                      ? 'bg-[#141b26] border-cyan-500/50 text-cyan-200 shadow-[0_-2px_10px_rgba(34,211,238,0.15)] z-10'
                      : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Double-click to rename tab"
                >
                  {/* Active Indicator Top Line */}
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-amber-400 rounded-t-sm" />
                  )}

                  {/* Preload Ready Dot */}
                  <span 
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" 
                    title="WebGL GPU Texture Preloaded" 
                  />

                  <Map size={11} className={isCurrent ? 'text-cyan-400 shrink-0' : 'text-slate-500 group-hover:text-slate-400 shrink-0'} />

                  {/* Title / Inline Rename Input */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingTitle}
                      autoFocus
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleCommitRename(map.id)}
                      onKeyDown={(e) => handleKeyDownRename(e, map.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-slate-950 border border-cyan-400 text-cyan-200 px-1 py-0.5 rounded text-[11px] font-mono outline-none w-28"
                    />
                  ) : (
                    <span className="truncate max-w-[110px]">
                      {map.name || map.title || `Sector ${idx + 1}`}
                    </span>
                  )}

                  {/* Badges: Party Pin & Combat Pulse */}
                  <div className="flex items-center gap-1 ml-auto shrink-0">
                    {hasParty && (
                      <span 
                        className="p-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                        title="Player Party Present"
                      >
                        <Users size={9} />
                      </span>
                    )}
                    {isCombat && (
                      <span 
                        className="p-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse"
                        title="Tactical Combat Active"
                      >
                        <Swords size={9} />
                      </span>
                    )}

                    {/* Close Tab Button (Hover) */}
                    <button
                      type="button"
                      onClick={(e) => handleCloseTab(map.id, e)}
                      className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Close Scene Tab"
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick Add New Map Tab Button */}
            <button
              type="button"
              onClick={handleCreateNewScene}
              className="h-6 px-1.5 rounded bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-center shrink-0 ml-1"
              title="Add New Tactical Scene Tab"
            >
              <Plus size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StageBreadcrumbTabs;
