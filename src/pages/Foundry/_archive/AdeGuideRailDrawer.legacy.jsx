/**
 * @file AdeGuideRailDrawer.jsx
 * @description Slim navigation rail (52px) and expandable component drawer (288px) for the ADE Live Studio.
 * Houses 8 specialized sub-views:
 *   1. Scenarios / Outline (Acts, beats, prose extraction)
 *   2. Tactical Maps / Sectors (Grid canvases, dimensions, tokens)
 *   3. Spatial Waypoints (Bi-directional trigger engine, auto-routing, perimeters)
 *   4. Bestiary & Personas (MCM Tier/Role catalog, Stage drag-and-drop)
 *   5. Smart Props & Map Objects (Bulkheads, Terminals, Supply Crates, Hazard Vents)
 *   6. Weather & Atmosphere (Lighting presets, Lagrangian particle emitters)
 *   7. Cronicle Living Memory (Event stream preview, living memory deck)
 *   8. Inline AIME Co-Pilot (Quick prompts, prose streaming, 1-click prose insertion)
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Plus, 
  Sparkles, 
  RefreshCw, 
  Crosshair, 
  Play, 
  Edit3, 
  Trash2, 
  DoorOpen, 
  Terminal, 
  Package, 
  Flame, 
  ExternalLink, 
  Loader2, 
  Send, 
  Scroll,
  Printer,
  Cpu,
  HelpCircle,
  BookOpen,
  Box,
  Search,
  Hammer
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import { VttEventBus } from '../../../utils/vttEventBus';
import { ATMOSPHERIC_PRESETS } from '../../../engine/vision/LightSourceManager';
import { getTypePillStyle } from '../ElementForge/elementSchemas';

export const AdeGuideRailDrawer = ({
  guideRailItems,
  activeGuideSection,
  setActiveGuideSection,
  isDrawerOpen,
  setIsDrawerOpen,
  onDeployElementToMap,

  // Fast-Access Guide Rail Utilities
  onOpenGems,
  gemsCount = 0,
  onOpenPrintModal,
  onOpenCompiler,
  onOpenGuide,
  onNavigateToStoryFoundry,

  // 1. Scenarios
  scenarios = [],
  activeScenario,
  setActiveScenarioId,
  onExtractProse,
  onAddScenario,

  // 2. Maps
  availableMaps = [],
  activeMap,
  setActiveMapId,
  onAddMap,

  // 3. Waypoints
  updateMap,
  flatScenarios = [],
  editingWaypointId,
  setEditingWaypointId,
  onResetAllWaypoints,
  onArmWaypointTool,
  onAddWaypoint,
  onAutoRouteFromBeats,
  onPanToWaypoint,
  onSimulateWaypointTrigger,
  onDeleteWaypoint,

  // 4. Story Elements & Foundations
  elementsCatalog = [],
  onNewElement,
  onEditElement,
  onNewPersona,
  onEditPersona,

  // 5. Smart Props
  onCreateSmartProp,
  onToggleSmartProp,
  onPanToProp,
  onDeleteSmartProp,

  // 6. Weather & Atmosphere
  onApplyWeatherPreset,
  onClearHazards,
  onSpawnHazardField,

  // 7. Cronicle Memory
  storyContext,
  onOpenCronicleDeck,

  // 8. Inline AIME
  onUndockAime,
  aimePromptInput,
  setAimePromptInput,
  isAimeGenerating,
  aimeGeneratedProse,
  onRunAimePrompt,
  onInsertAimeIntoScenario
}) => {
  const navigate = useNavigate();
  const [elementTypeFilter, setElementTypeFilter] = useState('All');
  const [elementSearch, setElementSearch] = useState('');

  const filteredElements = useMemo(() => {
    return (elementsCatalog || []).filter(elem => {
      if (elementTypeFilter === 'Other') {
        const standardTypes = ['Persona', 'Item', 'Faction', 'Clue', 'Encounter', 'Technology'];
        if (standardTypes.includes(elem.type)) return false;
      } else if (elementTypeFilter !== 'All' && elem.type !== elementTypeFilter) {
        return false;
      }
      if (elementSearch && !elem.title?.toLowerCase().includes(elementSearch.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [elementsCatalog, elementTypeFilter, elementSearch]);
  return (
    <>
      {/* ── LAYER 1: STRUCTURAL SLIM NAVIGATION RAIL (52px) ── */}
      <div className="w-13 shrink-0 bg-[#080c15] border-r border-slate-800/80 flex flex-col items-center py-2 z-20 select-none justify-between h-full">
        {/* Top items: Scenarios, Sectors, Waypoints, Bestiary, Props, Weather, Memory, AIME */}
        <div className="flex-1 flex flex-col items-center gap-1.5 w-full overflow-y-auto scrollbar-none">
          {guideRailItems.map(item => {
            const Icon = item.icon;
            const isActive = activeGuideSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  if (activeGuideSection === item.id) {
                    setIsDrawerOpen(prev => !prev);
                  } else {
                    setActiveGuideSection(item.id);
                    setIsDrawerOpen(true);
                  }
                }}
                className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                  isActive && isDrawerOpen
                    ? 'bg-slate-800/90 border border-cyan-500/60 shadow-[0_0_12px_rgba(34,211,238,0.25)] text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
                title={item.label}
              >
                <Icon size={16} className={item.color} />
                <span className="text-[8.5px] font-mono font-bold uppercase tracking-tighter leading-none mt-1">
                  {item.label.slice(0, 4)}
                </span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 rounded-full bg-slate-900 text-slate-300 text-[8px] font-mono border border-slate-700">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Fast-Access Utility Triggers */}
        <div className="shrink-0 flex flex-col items-center gap-1.5 pt-2 border-t border-slate-800/80 w-full">
          {/* Jump to Creative Suite / Story Foundry */}
          {onNavigateToStoryFoundry && (
            <button
              type="button"
              onClick={onNavigateToStoryFoundry}
              className="w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group text-purple-400 hover:text-purple-200 hover:bg-purple-950/50 border border-purple-500/30"
              title="Return to Story Foundry Creative Suite"
            >
              <BookOpen size={15} />
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-tighter leading-none mt-1">STORY</span>
            </button>
          )}

          {/* Guidance Gems */}
          {onOpenGems && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                onOpenGems();
              }}
              className="w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group text-amber-300 hover:text-amber-200 hover:bg-amber-950/50 border border-amber-500/30"
              title="Guidance Gems (Genre, Tone, Themes)"
            >
              <span className="text-xs">💎</span>
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-tighter leading-none mt-0.5">GEMS</span>
              {gemsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1 rounded-full bg-amber-500 text-black text-[8px] font-mono font-bold">
                  {gemsCount}
                </span>
              )}
            </button>
          )}

          {/* Selective Print Studio */}
          {onOpenPrintModal && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                onOpenPrintModal();
              }}
              className="w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group text-purple-400 hover:text-purple-200 hover:bg-purple-950/50 border border-purple-500/30"
              title="Selective Print & Publishing Studio"
            >
              <Printer size={15} />
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-tighter leading-none mt-1">PRINT</span>
            </button>
          )}

          {/* VTT Module Compiler */}
          {onOpenCompiler && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                onOpenCompiler();
              }}
              className="w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/50 border border-cyan-500/30"
              title="VTT Module Compiler & Packaging"
            >
              <Cpu size={15} />
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-tighter leading-none mt-1">BUILD</span>
            </button>
          )}

          {/* Guide Modal */}
          {onOpenGuide && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                onOpenGuide();
              }}
              className="w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-slate-700/50"
              title="Story Foundry Guide & Reference"
            >
              <HelpCircle size={15} />
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-tighter leading-none mt-1">HELP</span>
            </button>
          )}
        </div>
      </div>

      {/* ── LAYER 2: EXPANDABLE COMPONENT DRAWER (288px) ── */}
      {isDrawerOpen && (
        <div className="w-72 shrink-0 bg-[#0a0e18] border-r border-slate-800/90 flex flex-col min-h-0 z-10 animate-in slide-in-from-left-2 duration-150">
          {/* Drawer Header */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>📁</span>
              <span>{guideRailItems.find(g => g.id === activeGuideSection)?.label}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 rounded text-slate-500 hover:text-white cursor-pointer"
              title="Collapse Drawer ([)"
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          {/* Drawer Content Views */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs scrollbar-thin">
            
            {/* 1. SCENARIOS LIST */}
            {activeGuideSection === 'scenarios' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Acts &amp; Scenarios:</span>
                  <button
                    type="button"
                    onClick={onAddScenario}
                    className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={10} />
                    <span>Add</span>
                  </button>
                </div>

                {scenarios.map(sc => {
                  const isSelected = sc.id === activeScenario?.id;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => {
                        setActiveScenarioId(sc.id);
                        AudioService.playTerminalBeep(1100, 0.02);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500/60 text-purple-200 shadow-xs'
                          : 'bg-slate-950/60 border-slate-850 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="font-bold truncate text-xs">{sc.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {sc.fields?.summary || sc.content?.slice(0, 50) || 'Authoring scenario beats...'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. TACTICAL MAPS / SECTORS */}
            {activeGuideSection === 'maps' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Tactical Sectors:</span>
                  <button
                    type="button"
                    onClick={onAddMap}
                    className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={10} />
                    <span>New Grid</span>
                  </button>
                </div>

                {availableMaps.map(m => {
                  const isSelected = m.id === activeMap?.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        if (setActiveMapId) setActiveMapId(m.id);
                        AudioService.playTerminalBeep(1100, 0.02);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-950/60 border-slate-850 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-bold truncate text-xs flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                          <span className="truncate">{m.title || 'Untitled Map'}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              if (setActiveMapId) setActiveMapId(m.id);
                              VttEventBus.emit('arm-stage-tool', { tool: 'wall' });
                              AudioService.playTerminalBeep(1350, 0.03);
                            }}
                            className="px-1.5 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-[9.5px] font-bold flex items-center gap-1 cursor-pointer"
                            title="Edit Map in In-Situ Architect Mode"
                          >
                            <Hammer size={10} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigate(`/foundry/map-maker?mapId=${m.id}`);
                            }}
                            className="px-1.5 py-0.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 text-[9.5px] font-bold flex items-center gap-1 cursor-pointer"
                            title="Open in Full Map Maker Studio"
                          >
                            <ExternalLink size={10} />
                            <span>Studio</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>{m.gridMode || m.gridType || 'Hex'} ({m.gridSize || 70}px)</span>
                        <span>{m.tokens?.length || 0} units • {m.objects?.length || 0} objects</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. WAYPOINTS & MISSION ROUTES (Phase 2 Bi-Directional Trigger Hub) */}
            {activeGuideSection === 'waypoints' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Spatial Waypoints:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={onResetAllWaypoints}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Re-arm all waypoints for testing"
                    >
                      <RefreshCw size={9} />
                      <span>Reset All</span>
                    </button>
                    <button
                      type="button"
                      onClick={onArmWaypointTool}
                      className="px-2 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      title="Arm click-to-place dropper on Stage canvas"
                    >
                      <Crosshair size={10} />
                      <span>Place Tool</span>
                    </button>
                    <button
                      type="button"
                      onClick={onAddWaypoint}
                      className="px-2 py-0.5 rounded bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Add instant waypoint"
                    >
                      <Plus size={10} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* 1-Click Auto Route from Scenario Beats */}
                <button
                  type="button"
                  onClick={onAutoRouteFromBeats}
                  className="w-full py-1.5 px-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Generate waypoint chain across the tactical map from active scenario beats"
                >
                  <Sparkles size={11} className="text-purple-400" />
                  <span>Auto-Route from Scenario Beats</span>
                </button>

                {(!activeMap?.waypoints || activeMap.waypoints.length === 0) ? (
                  <div className="p-3 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-[11px] italic">
                    No waypoints placed on this sector yet. Click Place Tool to click anywhere on the canvas or Auto-Route from Scenario Beats.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeMap.waypoints.map((wp, idx) => {
                      const wpKey = wp.id || idx;
                      const isExpanded = editingWaypointId === wpKey;
                      const isTriggered = !!wp.isTriggered;
                      const action = wp.triggerAction || 'REVEAL_BEAT';
                      const targetScenario = wp.targetScenarioId ? flatScenarios.find(s => s.id === wp.targetScenarioId) : null;

                      const rawBeats = activeScenario?.fields?.sceneBeats || '';
                      const beatsArr = rawBeats.split('\n').map(b => b.trim()).filter(Boolean);

                      const updateWpField = (updates) => {
                        if (!activeMap || !updateMap) return;
                        const updated = (activeMap.waypoints || []).map((w, wIdx) => 
                          (w.id === wp.id || (wIdx === idx && !w.id)) ? { ...w, ...updates } : w
                        );
                        updateMap(activeMap.id, { waypoints: updated });
                      };

                      return (
                        <div 
                          key={wpKey} 
                          className={`p-2.5 rounded-xl border transition-all space-y-2 ${
                            isTriggered 
                              ? 'bg-emerald-950/20 border-emerald-900/60 hover:border-emerald-500/40' 
                              : 'bg-slate-950/80 border-amber-950/60 hover:border-amber-500/50'
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`w-4 h-4 rounded-full text-[9px] font-mono flex items-center justify-center shrink-0 border ${
                                isTriggered 
                                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300' 
                                  : 'bg-amber-950 border-amber-500/70 text-amber-300'
                              }`}>
                                {isTriggered ? '✓' : String.fromCharCode(65 + (idx % 26))}
                              </span>
                              <span className="font-bold text-slate-200 text-xs truncate">
                                {wp.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* State Badge */}
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border ${
                                isTriggered
                                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                                  : 'bg-amber-950/90 text-amber-300 border-amber-700'
                              }`}>
                                {isTriggered ? 'Tripped' : 'Armed'}
                              </span>

                              {/* Action Type Badge */}
                              <span className="text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300">
                                {action === 'ADVANCE_SCENARIO' ? 'Scenario' : action === 'TRIGGER_AIME' ? 'AIME' : action === 'ALERT_GM' ? 'Alert' : 'Beat'}
                              </span>

                              {/* Quick Pan */}
                              <button
                                type="button"
                                onClick={() => onPanToWaypoint(wp)}
                                className="p-1 rounded bg-slate-900 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                                title="Pan Stage to waypoint"
                              >
                                <Crosshair size={10} />
                              </button>

                              {/* Simulate Trigger */}
                              <button
                                type="button"
                                onClick={() => onSimulateWaypointTrigger(wp)}
                                className="p-1 rounded bg-slate-900 hover:bg-amber-950 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                                title="Simulate token trigger"
                              >
                                <Play size={10} />
                              </button>

                              {/* Edit Accordion Toggle */}
                              <button
                                type="button"
                                onClick={() => setEditingWaypointId(isExpanded ? null : wpKey)}
                                className={`p-1 rounded transition-colors cursor-pointer ${
                                  isExpanded 
                                    ? 'bg-purple-950 text-purple-300 border border-purple-500/50' 
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                                title="Configure Waypoint Trigger"
                              >
                                <Edit3 size={10} />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => onDeleteWaypoint(wp.id)}
                                className="p-1 rounded bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete waypoint"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>

                          {/* Brief Telemetry Strip */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>Radius: {wp.radius || 60}px</span>
                            {wp.autoTrigger ? (
                              <span className="text-cyan-400">⚡ Auto-Fires</span>
                            ) : (
                              <span className="text-amber-400">✋ GM Confirm</span>
                            )}
                            {action === 'ADVANCE_SCENARIO' && targetScenario && (
                              <span className="text-cyan-300 truncate max-w-[120px]">➔ {targetScenario.title}</span>
                            )}
                          </div>

                          {/* Expandable Configuration Drawer */}
                          {isExpanded && (
                            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg">
                              {/* Name Input */}
                              <div>
                                <label className="text-[9.5px] uppercase font-bold text-slate-400 block mb-1">Waypoint Name:</label>
                                <input
                                  type="text"
                                  value={wp.name || ''}
                                  onChange={(e) => updateWpField({ name: e.target.value })}
                                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:border-amber-400 outline-none"
                                />
                              </div>

                              {/* Trigger Action Selector */}
                              <div>
                                <label className="text-[9.5px] uppercase font-bold text-slate-400 block mb-1">Trigger Action:</label>
                                <select
                                  value={action}
                                  onChange={(e) => updateWpField({ triggerAction: e.target.value })}
                                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-amber-300 text-xs focus:border-amber-400 outline-none"
                                >
                                  <option value="REVEAL_BEAT">🎯 Advance Scene Beat</option>
                                  <option value="ADVANCE_SCENARIO">🔀 Shift Active Scenario</option>
                                  <option value="TRIGGER_AIME">✨ Stream AIME Atmosphere</option>
                                  <option value="ALERT_GM">⚠️ Tactical GM Alert</option>
                                </select>
                              </div>

                              {/* Target Scenario (if ADVANCE_SCENARIO) */}
                              {action === 'ADVANCE_SCENARIO' && (
                                <div>
                                  <label className="text-[9.5px] uppercase font-bold text-cyan-300 block mb-1">Target Scenario Node:</label>
                                  <select
                                    value={wp.targetScenarioId || ''}
                                    onChange={(e) => updateWpField({ targetScenarioId: e.target.value })}
                                    className="w-full px-2 py-1 bg-slate-950 border border-cyan-500/50 rounded text-cyan-200 text-xs focus:border-cyan-400 outline-none"
                                  >
                                    <option value="">-- Select Scenario Destination --</option>
                                    {flatScenarios.map(s => (
                                      <option key={s.id} value={s.id}>{s.title || 'Untitled Scenario'}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Linked Beat Index (if REVEAL_BEAT) */}
                              {action === 'REVEAL_BEAT' && (
                                <div>
                                  <label className="text-[9.5px] uppercase font-bold text-slate-400 block mb-1">Linked Scene Beat:</label>
                                  <select
                                    value={wp.linkedBeatIndex ?? 0}
                                    onChange={(e) => updateWpField({ linkedBeatIndex: parseInt(e.target.value, 10) })}
                                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:border-amber-400 outline-none"
                                  >
                                    {beatsArr.length === 0 && (
                                      <option value={0}>Beat #1 (Default)</option>
                                    )}
                                    {beatsArr.map((b, bIdx) => (
                                      <option key={bIdx} value={bIdx}>
                                        #{bIdx + 1}: {b.slice(0, 32)}...
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Trigger Radius Slider */}
                              <div>
                                <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-bold mb-1">
                                  <span>Trigger Radius:</span>
                                  <span className="text-amber-300">{wp.radius || 60} px</span>
                                </div>
                                <input
                                  type="range"
                                  min={30}
                                  max={250}
                                  step={5}
                                  value={wp.radius || 60}
                                  onChange={(e) => updateWpField({ radius: parseInt(e.target.value, 10) })}
                                  className="w-full accent-amber-500 cursor-pointer"
                                />
                              </div>

                              {/* Auto-Trigger Toggle */}
                              <label className="flex items-center gap-2 text-[10.5px] text-slate-300 cursor-pointer pt-1">
                                <input
                                  type="checkbox"
                                  checked={wp.autoTrigger ?? false}
                                  onChange={(e) => updateWpField({ autoTrigger: e.target.checked })}
                                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                                />
                                <span>Instant Auto-Trigger (Bypasses GM confirm chip)</span>
                              </label>

                              {/* Sensory Read-Aloud / Notes */}
                              <div>
                                <label className="text-[9.5px] uppercase font-bold text-slate-400 block mb-1">Read-Aloud / Atmosphere Text:</label>
                                <textarea
                                  rows={2}
                                  value={wp.readAloudText || ''}
                                  onChange={(e) => updateWpField({ readAloudText: e.target.value })}
                                  placeholder="Sensory description when operatives enter this perimeter..."
                                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-300 text-[11px] font-sans focus:border-amber-400 outline-none leading-relaxed"
                                />
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                {isTriggered && (
                                  <button
                                    type="button"
                                    onClick={() => updateWpField({ isTriggered: false })}
                                    className="px-2 py-1 rounded bg-amber-950/70 hover:bg-amber-900 border border-amber-700 text-amber-300 text-[10px] font-bold cursor-pointer"
                                  >
                                    Re-Arm Waypoint
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setEditingWaypointId(null)}
                                  className="ml-auto px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold cursor-pointer"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. STORY ELEMENTS & FOUNDATIONS */}
            {(activeGuideSection === 'elements' || activeGuideSection === 'bestiary') && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider block">
                      Foundational Elements:
                    </span>
                    <span className="text-[9px] text-slate-500">
                      Story &amp; Module Foundations ({filteredElements.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => (onNewElement || onNewPersona)('Persona')}
                    className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Forge New Foundational Story Element"
                  >
                    <Plus size={10} />
                    <span>New Element</span>
                  </button>
                </div>

                {/* Search & Category Filter Pills */}
                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      value={elementSearch}
                      onChange={(e) => setElementSearch(e.target.value)}
                      placeholder="Search foundations..."
                      className="w-full pl-7 pr-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px] placeholder:text-slate-600 focus:border-emerald-500/60 outline-none font-mono"
                    />
                    <Search size={11} className="absolute left-2 top-2 text-slate-500" />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {['All', 'Persona', 'Item', 'Faction', 'Clue', 'Encounter', 'Technology', 'Other'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setElementTypeFilter(cat)}
                        className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold transition-all cursor-pointer font-mono ${
                          elementTypeFilter === cat
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60'
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Elements List */}
                <div className="space-y-1.5">
                  {filteredElements.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-[11px] italic">
                      No foundational elements found.
                    </div>
                  ) : (
                    filteredElements.map(elem => {
                      const isPersona = elem.type === 'Persona';
                      return (
                        <div
                          key={elem.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify({
                              type: 'story_element',
                              element: elem,
                              id: elem.id,
                              title: elem.title,
                              elementType: elem.type || 'Custom'
                            }));
                            e.dataTransfer.effectAllowed = 'copy';
                          }}
                          className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 hover:border-cyan-500/50 transition-colors group cursor-grab active:cursor-grabbing"
                          title={`Drag onto The Stage or click Deploy to place ${elem.title}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`text-[7.5px] font-extrabold uppercase px-1 py-0.2 rounded border font-mono ${getTypePillStyle(elem.type)}`}>
                                {elem.type || 'Element'}
                              </span>
                              <div className="font-bold text-slate-200 truncate text-xs">
                                {elem.title}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {/* Deploy to Sector button */}
                              <button
                                type="button"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  onDeployElementToMap?.(elem);
                                }}
                                className="px-1.5 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[9.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Deploy this story element directly onto the active tactical grid"
                              >
                                <span>📍 Deploy</span>
                              </button>
                              <button
                                type="button"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  (onEditElement || onEditPersona)(elem);
                                }}
                                className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                                title="Edit Element in Element Forge"
                              >
                                <Edit3 size={11} />
                              </button>
                            </div>
                          </div>

                          {(elem.fields?.summary || elem.fields?.role || elem.content) && (
                            <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                              {elem.fields?.role ? `Role: ${elem.fields.role}` : (elem.fields?.summary || elem.content?.replace(/<[^>]+>/g, '').slice(0, 60))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* 5. SMART PROPS & MAP OBJECTS */}
            {activeGuideSection === 'props' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Interactive Props:</span>
                  <span className="text-[10px] text-slate-500">{(activeMap?.objects || []).length} active</span>
                </div>

                {/* Add Smart Prop Quick Actions */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onCreateSmartProp('bulkhead')}
                    className="p-1.5 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <DoorOpen size={11} />
                    <span>+ Bulkhead</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onCreateSmartProp('terminal')}
                    className="p-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Terminal size={11} />
                    <span>+ Terminal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onCreateSmartProp('crate')}
                    className="p-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Package size={11} />
                    <span>+ Supply Crate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onCreateSmartProp('hazard')}
                    className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Flame size={11} />
                    <span>+ Gas Vent</span>
                  </button>
                </div>

                {(!activeMap?.objects || activeMap.objects.length === 0) ? (
                  <div className="p-3 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-[11px] italic">
                    No smart objects placed on this sector yet. Click any button above to spawn a smart prop.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeMap.objects.map((obj) => (
                      <div key={obj.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-blue-950/60 space-y-1.5 group hover:border-blue-500/50 transition-colors">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-blue-300 text-xs truncate flex items-center gap-1.5">
                            {obj.type === 'bulkhead' && <DoorOpen size={12} className="text-blue-400 shrink-0" />}
                            {obj.type === 'terminal' && <Terminal size={12} className="text-cyan-400 shrink-0" />}
                            {obj.type === 'crate' && <Package size={12} className="text-amber-400 shrink-0" />}
                            {obj.type === 'hazard' && <Flame size={12} className="text-red-400 shrink-0" />}
                            <span className="truncate">{obj.name || obj.label || 'Map Prop'}</span>
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onToggleSmartProp(obj)}
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                                obj.isOpen
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                              }`}
                              title="Toggle Prop State"
                            >
                              {obj.isOpen ? 'OPEN' : 'LOCKED'}
                            </button>
                            <button
                              type="button"
                              onClick={() => onPanToProp(obj)}
                              className="p-1 rounded bg-slate-900 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                              title="Center Stage canvas on this object"
                            >
                              <Crosshair size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteSmartProp(obj.id)}
                              className="p-1 rounded bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete object"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Pos: ({Math.round(obj.x)}, {Math.round(obj.y)})</span>
                          <span className="px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 capitalize">
                            {obj.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. WEATHER & ATMOSPHERIC PROFILES */}
            {activeGuideSection === 'environment' && (
              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Atmosphere &amp; Weather Presets:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.keys(ATMOSPHERIC_PRESETS).map(key => {
                      const isCurrent = (activeMap?.environmental?.weatherPreset || activeMap?.atmosphericWeather || 'clear') === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => onApplyWeatherPreset(key)}
                          className={`p-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-teal-950 text-teal-300 border-teal-500/60 shadow-xs'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {key.replace(/_/g, ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Atmosphere Details Card */}
                {(() => {
                  const currKey = activeMap?.environmental?.weatherPreset || activeMap?.atmosphericWeather || 'clear';
                  const currPreset = ATMOSPHERIC_PRESETS[currKey];
                  if (!currPreset) return null;
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-teal-300 uppercase">{currPreset.label || currKey}</span>
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: currPreset.ambientColor }} />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        {currPreset.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[9.5px] font-mono text-slate-500">
                        <span>Fog: {Math.round((currPreset.fogDensity || 0) * 100)}%</span>
                        <span>•</span>
                        <span>Alpha: {Math.round((currPreset.tintAlpha || 0) * 100)}%</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Dynamic Hazard Particle Emitters */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Lagrangian Particle Physics:
                    </span>
                    <button
                      type="button"
                      onClick={onClearHazards}
                      className="text-[9px] text-red-400 hover:text-red-300 uppercase font-bold cursor-pointer transition-colors"
                      title="Purge active particles"
                    >
                      Purge
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => onSpawnHazardField('plasma_fire')}
                      className="py-1 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold transition-all cursor-pointer text-left"
                    >
                      🔥 Plasma Fire
                    </button>
                    <button
                      type="button"
                      onClick={() => onSpawnHazardField('corrosive_gas')}
                      className="py-1 px-2 rounded-lg bg-lime-950/40 hover:bg-lime-900/60 border border-lime-500/40 text-lime-300 font-bold transition-all cursor-pointer text-left"
                    >
                      ☣️ Corrosive Gas
                    </button>
                    <button
                      type="button"
                      onClick={() => onSpawnHazardField('void_mist')}
                      className="py-1 px-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 font-bold transition-all cursor-pointer text-left"
                    >
                      🌌 Void Mist
                    </button>
                    <button
                      type="button"
                      onClick={() => onSpawnHazardField('smoke')}
                      className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition-all cursor-pointer text-left"
                    >
                      💨 Dust / Smoke
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. CRONICLE LIVING MEMORY */}
            {activeGuideSection === 'cronicle' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Living Memory Stream:</span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    {storyContext?.cronicle?.history?.length || 0} events
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onOpenCronicleDeck}
                  className="w-full py-2 px-3 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Scroll size={13} className="text-amber-400" />
                  <span>Open Living Memory Deck</span>
                </button>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[10.5px] text-slate-400 leading-relaxed italic">
                  All combat hits, bulkhead toggles, terminal slices, and waypoint arrivals are synchronized into living campaign memory in real-time.
                </div>

                {/* Recent History Preview */}
                {(storyContext?.cronicle?.history || []).slice(-4).reverse().map((delta, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-950/80 border border-slate-850 text-[10px] space-y-0.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold text-amber-300 uppercase">{delta.type || 'Event'}</span>
                      <span>{delta.timestamp ? new Date(delta.timestamp).toLocaleTimeString() : 'Recent'}</span>
                    </div>
                    <div className="text-slate-300 truncate">{delta.description || delta.title || 'Campaign state delta recorded'}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 8. INLINE AIME NARRATIVE CO-PILOT */}
            {activeGuideSection === 'aime' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">AIME Co-Pilot:</span>
                  <button
                    type="button"
                    onClick={onUndockAime}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    title="Open Undocked Floating AIME Window"
                  >
                    <span>Undock</span>
                    <ExternalLink size={10} />
                  </button>
                </div>

                {/* Quick Action Chips */}
                <div className="space-y-1">
                  <span className="text-[9.5px] text-slate-500 uppercase font-bold block">Quick Prompts:</span>
                  <div className="grid grid-cols-1 gap-1 text-[10px]">
                    {[
                      { label: '💡 Generate Complication', text: 'Generate a sudden tactical or environmental complication for this scene.' },
                      { label: '📖 Sensory Read-Aloud', text: 'Write a punchy 2-sentence boxed sensory read-aloud describing this sector and atmosphere.' },
                      { label: '⚔️ Combat Incident', text: 'Describe a tactical ambush or breach incident suitable for this map.' },
                      { label: '🎯 Next Objective Beat', text: 'Suggest the next narrative beat that connects this waypoint to the campaign climax.' }
                    ].map(qp => (
                      <button
                        key={qp.label}
                        type="button"
                        onClick={() => {
                          setAimePromptInput(qp.text);
                          onRunAimePrompt(qp.text);
                        }}
                        className="py-1 px-2 rounded-lg bg-slate-950 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 text-left transition-colors cursor-pointer truncate"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Textarea */}
                <div className="space-y-1.5 pt-1">
                  <textarea
                    rows={2}
                    value={aimePromptInput}
                    onChange={(e) => setAimePromptInput(e.target.value)}
                    placeholder="Ask AIME for dialogue, tactics, lore..."
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-hidden focus:border-cyan-500/60 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => onRunAimePrompt()}
                    disabled={isAimeGenerating || !aimePromptInput.trim()}
                    className="w-full py-1.5 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAimeGenerating ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Weaving Prose...</span>
                      </>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Generate Prose</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Generated Prose Output Card */}
                {aimeGeneratedProse && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2 animate-in fade-in duration-200">
                    <div className="text-[10px] text-cyan-300 font-bold uppercase flex items-center justify-between">
                      <span>AIME Response:</span>
                      <button
                        type="button"
                        onClick={onInsertAimeIntoScenario}
                        className="text-[9.5px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-bold"
                        title="Append this prose to active scenario"
                      >
                        <span>Insert into Prose ❯</span>
                      </button>
                    </div>
                    <div className="text-slate-300 text-[11px] leading-relaxed max-h-40 overflow-y-auto scrollbar-thin select-text">
                      {aimeGeneratedProse}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default AdeGuideRailDrawer;
