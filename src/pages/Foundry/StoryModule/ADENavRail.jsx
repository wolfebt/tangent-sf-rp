/**
 * @file ADENavRail.jsx
 * @description Dedicated vertical navigation rail for ADE Studio (Adventure Development Environment).
 * Replaces the overcrowded horizontal top slider with a sleek, persistent vertical rail.
 * Houses:
 * - Primary Studio Workspaces: Story Weaver, Interactive Play, Tactical Spread, Element Forge
 * - Fast-Access Utilities: Guidance Gems, Cronicle Living Memory, Scratchbook, Print / PDF
 * - Viewport Drawer Controls: Scenario Outliner Tree Toggle ([)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  BookOpen, 
  Play, 
  Target, 
  Box, 
  Printer, 
  PanelLeftClose, 
  PanelLeft,
  Compass,
  Sparkles,
  GitBranch,
  Cpu,
  Map as MapIcon,
  Tv2,
  Pin
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import { ADE_THEMES as THEMES } from '../../../constants/adeThemes';

export const ADENavRail = ({
  activeView = 'scenarios',
  onSwitchView,
  activeScenarioWorkspaceTab = 'weaver',
  onSelectScenarioWorkspaceTab,
  elementsCount = 0,
  mapsCount = 0,
  modifiersCount = 0,
  pendingCronicleCount = 0,
  onOpenCronicle,
  onOpenScratchbook,
  onOpenPrintModal,
  onOpenGuide,
  isTreeExpanded = true,
  onToggleTreeExpanded
}) => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('tangent_ade_nav_pinned') === 'true';
    } catch {
      return false;
    }
  });

  const togglePin = (e) => {
    e?.stopPropagation?.();
    const next = !isPinned;
    AudioService.playTerminalBeep(next ? 1250 : 950, 0.02);
    setIsPinned(next);
    try {
      localStorage.setItem('tangent_ade_nav_pinned', String(next));
    } catch {}
  };

  const isExpanded = isPinned || isHovered;

  const totalGalleryCount = elementsCount + mapsCount + modifiersCount;

  const hubItem = {
    id: 'mission_control',
    aliasIds: ['dashboard', 'mission-control', 'hub'],
    label: 'HUB',
    sublabel: 'Mission Control',
    description: 'Module Dashboard, Readiness Score, Package Import/Export & Telemetry',
    icon: Compass,
    colorTheme: 'cyan',
    onClick: () => {
      if (onSwitchView) onSwitchView('mission_control');
    }
  };

  const workspaceItems = [
    {
      id: 'scenarios',
      aliasIds: ['weaver', 'narrative', 'story'],
      label: 'WEAVER',
      sublabel: 'Story Weaver',
      description: 'Manuscript Drafting, Inline AI Assistant, Elements & Narrative Genesis',
      icon: BookOpen,
      colorTheme: 'cyan',
      onClick: () => {
        if (onSwitchView) onSwitchView('scenarios', 'write');
        else if (onSelectScenarioWorkspaceTab) onSelectScenarioWorkspaceTab('write');
      }
    },
    {
      id: 'map',
      aliasIds: ['map-maker', 'mapmaker'],
      label: 'MAP',
      sublabel: 'Map Architect',
      description: 'Design Tactical Vector Grids, Line-of-Sight Walls & Smart Props',
      icon: MapIcon,
      colorTheme: 'cyan',
      onClick: () => {
        if (onSwitchView) onSwitchView('map');
      }
    },
    {
      id: 'stage',
      aliasIds: ['live-studio', 'ade-stage', 'vtt', 'live_director', 'stage_runtime', 'vtt_runtime'],
      label: 'STAGE',
      sublabel: 'The Stage VTT',
      description: 'Stage Compiler, Map Anchors, Triggers, Flow & Live VTT Session Director',
      icon: Sparkles,
      colorTheme: 'purple',
      onClick: () => {
        if (onSwitchView) onSwitchView('stage', 'setup');
        else if (onSelectScenarioWorkspaceTab) onSelectScenarioWorkspaceTab('stage');
      }
    },
    {
      id: 'elements',
      aliasIds: ['gallery', 'elements'],
      label: 'ELEMENTS',
      sublabel: 'Story Elements',
      description: 'Story Asset & Elements Repository (Personas, Places, Items & Modifiers)',
      icon: Box,
      colorTheme: 'emerald',
      onClick: () => {
        if (onSwitchView) onSwitchView('elements');
      }
    }
  ];

  const utilityItems = [
    {
      id: 'cronicle',
      label: 'CRONICLE',
      sublabel: 'Living Memory',
      description: 'Timeline Deck & Narrative Event Log',
      icon: '📜',
      badgePulse: pendingCronicleCount > 0,
      colorTheme: 'amber',
      onClick: onOpenCronicle
    },
    {
      id: 'scratch',
      label: 'SCRATCH',
      sublabel: 'Scratchbook',
      description: 'Project Notes & Fast Aggregated Elements Document',
      icon: '📓',
      colorTheme: 'emerald',
      onClick: onOpenScratchbook
    },
    {
      id: 'print',
      label: 'PRINT',
      sublabel: 'Publishing Spread',
      description: 'Print & Export Formatted PDF Story Spread',
      icon: Printer,
      colorTheme: 'cyan',
      onClick: onOpenPrintModal
    }
  ];

  const handleSelectWorkspace = (item) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (!isPinned) {
      setIsHovered(false);
      setHoveredItem(null);
    }
    if (item.onClick) {
      item.onClick();
      return;
    }
    if (onSwitchView) onSwitchView(item.id);
  };

  const handleSelectUtility = (item) => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (!isPinned) {
      setIsHovered(false);
      setHoveredItem(null);
    }
    if (item.onClick) item.onClick();
  };

  return (
    <>
      {/* In-Flow Sizing Anchor (prevents center workspace layout shifts while hovering, reserves space when pinned or collapsed) */}
      <div
        className={`shrink-0 h-full pointer-events-none transition-all duration-200 ease-out ${
          isPinned ? 'w-56 sm:w-60' : 'w-14 sm:w-16'
        }`}
        aria-hidden="true"
      />

      <nav
        aria-label="ADE Studio Navigation Rail"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredItem(null);
        }}
        className={`absolute top-0 bottom-0 left-0 h-full bg-[#080c14]/98 backdrop-blur-xl border-r border-slate-800/90 flex flex-col justify-between py-2 px-1 select-none font-sans transition-all duration-200 ease-out ${
          isExpanded 
            ? 'w-56 sm:w-60 shadow-[12px_0_35px_rgba(0,0,0,0.85)] border-slate-700/80 z-40' 
            : 'w-14 sm:w-16 shadow-xl z-30'
        }`}
      >
        {/* Top Section: Workspaces */}
        <div className="flex flex-col items-stretch gap-0.5 sm:gap-1 w-full flex-1 min-h-0 overflow-y-auto no-scrollbar py-0.5">
          {/* Rail Brand Mini-Header with Pin Option */}
          <div
            className={`w-full flex items-center justify-between px-2.5 py-1 mb-1 border-b border-purple-500/20 shrink-0 transition-all duration-200 overflow-hidden ${
              isExpanded ? 'opacity-100 h-7' : 'opacity-0 h-0 p-0 mb-0 border-b-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[10px] font-extrabold text-purple-400 uppercase tracking-widest truncate">
                ADE STUDIO
              </span>
              <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 font-bold">
                FOUNDRY
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
                WORKSPACES
              </span>
              <button
                type="button"
                onClick={togglePin}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  isPinned
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                }`}
                title={isPinned ? "Unpin Rail (Auto-collapse on exit)" : "Pin Rail (Lock open)"}
                aria-label={isPinned ? "Unpin Rail" : "Pin Rail"}
              >
                <Pin size={11} className={`transition-transform duration-200 ${isPinned ? 'rotate-45 text-purple-300' : 'text-slate-400 hover:text-slate-200'}`} />
              </button>
            </div>
          </div>

          {/* Mission Control (Hub) */}
          {(() => {
            const isActive = activeView === hubItem.id || (hubItem.aliasIds && hubItem.aliasIds.includes(activeView));
            const theme = THEMES[hubItem.colorTheme] || THEMES.cyan;
            const Icon = hubItem.icon;
            return (
              <button
                key={hubItem.id}
                type="button"
                onClick={() => handleSelectWorkspace(hubItem)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({ item: hubItem, theme, rect });
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer border shrink-0 ${
                  isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
                } ${
                  isActive
                    ? theme.activeBtn
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
                }`}
                title={isExpanded ? undefined : `${hubItem.label} • ${hubItem.sublabel}`}
              >
                {isActive && (
                  <span className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${theme.bar}`} />
                )}
                <div
                  className={`relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                    isActive ? theme.activeBox : theme.iconBox
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div
                  className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                    isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-bold uppercase tracking-wider truncate leading-tight ${
                      isActive ? theme.activeLabel : 'text-slate-200 group-hover:text-white'
                    }`}
                  >
                    {hubItem.label}
                  </span>
                  <span className="text-[9px] text-slate-400/80 truncate font-mono leading-tight mt-0.5">
                    {hubItem.sublabel}
                  </span>
                </div>
              </button>
            );
          })()}

          {/* Subtle Divider */}
          <div className="w-full h-px bg-slate-800/60 my-0.5 shrink-0" />

          {/* Primary Studio Workspaces aligned with Hub order (WEAVER, MAP, STAGE, ELEMENTS) */}
          {workspaceItems.map((item) => {
            const isDesktopOnly = item.id === 'map' || item.id === 'stage';
            const isActive = (() => {
              if (item.id === 'stage') {
                return activeView === 'stage' || activeView === 'vtt' || (activeView === 'scenarios' && activeScenarioWorkspaceTab === 'stage') || (item.aliasIds && item.aliasIds.includes(activeView));
              }
              if (item.id === 'scenarios') {
                return activeView === 'scenarios' && activeScenarioWorkspaceTab !== 'stage';
              }
              return activeView === item.id || (item.aliasIds && item.aliasIds.includes(activeView));
            })();
            const theme = THEMES[item.colorTheme] || THEMES.cyan;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectWorkspace(item)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({ item, theme, rect });
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative w-full h-8.5 sm:h-9 rounded-xl flex items-center transition-all cursor-pointer border shrink-0 ${
                  isDesktopOnly ? 'hidden md:flex' : ''
                } ${
                  isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
                } ${
                  isActive
                    ? theme.activeBtn
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
                }`}
                title={isExpanded ? undefined : `${item.label} • ${item.sublabel}`}
              >
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <span className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${theme.bar}`} />
                )}

                {/* Icon Container */}
                <div
                  className={`relative w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                    isActive ? theme.activeBox : theme.iconBox
                  }`}
                >
                  {typeof Icon === 'string' ? (
                    <span className="text-sm">{Icon}</span>
                  ) : (
                    <Icon size={16} />
                  )}
                </div>

                {/* Label to the Right */}
                <div
                  className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                    isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`font-mono text-[11px] font-bold uppercase tracking-wider truncate leading-tight ${
                        isActive ? theme.activeLabel : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400/80 truncate font-mono leading-tight mt-0.5">
                    {item.sublabel}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Section Divider */}
          <div className="w-full h-px bg-slate-800/60 my-0.5 shrink-0" />

          {/* Fast-Access Quick Modals Cluster */}
          {utilityItems.map((item) => {
            const theme = THEMES[item.colorTheme] || THEMES.cyan;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectUtility(item)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({ item, theme, rect });
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative w-full h-8 sm:h-8.5 rounded-xl flex items-center transition-all cursor-pointer border border-transparent hover:border-slate-800/80 hover:bg-slate-900/60 text-slate-400 hover:text-slate-100 shrink-0 ${
                  isExpanded ? 'px-2 justify-start' : 'px-1 justify-center'
                }`}
                title={isExpanded ? undefined : `${item.label} • ${item.sublabel}`}
              >
                <div
                  className={`relative w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-all ${theme.iconBox}`}
                >
                  {typeof Icon === 'string' ? (
                    <span className="text-xs">{Icon}</span>
                  ) : (
                    <Icon size={13} />
                  )}

                  {item.badgePulse && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-soft-badge-glow shadow-[0_0_6px_#f59e0b]" />
                  )}
                </div>

                <div
                  className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                    isExpanded ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider truncate leading-tight text-slate-300 group-hover:text-white">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[8.5px] text-slate-500 group-hover:text-slate-400 truncate font-mono leading-tight mt-0.5">
                    {item.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Outliner Toggle & Guide */}
        <div className="w-full flex flex-col items-center gap-1 pt-1.5 border-t border-slate-800/80 shrink-0">
          {/* Outliner Tree Toggle */}
          {onToggleTreeExpanded && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                if (!isPinned) {
                  setIsHovered(false);
                  setHoveredItem(null);
                }
                onToggleTreeExpanded();
              }}
              className={`w-full h-8 sm:h-8.5 rounded-xl flex items-center transition-all cursor-pointer border shrink-0 ${
                isHovered ? 'px-2 justify-start' : 'px-1 justify-center'
              } ${
                isTreeExpanded
                  ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border-transparent'
              }`}
              title={isHovered ? undefined : (isTreeExpanded ? 'Collapse Scenario Outliner ([)' : 'Expand Scenario Outliner ([)')}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-center shrink-0">
                {isTreeExpanded ? (
                  <PanelLeftClose size={14} className="text-cyan-400" />
                ) : (
                  <PanelLeft size={14} className="text-slate-400" />
                )}
              </div>
              <div
                className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                  isPinned || isHovered ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
                }`}
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider truncate leading-tight text-cyan-300">
                  {isTreeExpanded ? 'TREE EXPANDED' : 'TREE COLLAPSED'}
                </span>
                <span className="text-[8.5px] text-slate-500 truncate font-mono leading-tight mt-0.5">
                  Outliner Panel ([)
                </span>
              </div>
            </button>
          )}

          {/* ADE Guide Manual */}
          {onOpenGuide && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                if (!isPinned) {
                  setIsHovered(false);
                  setHoveredItem(null);
                }
                onOpenGuide();
              }}
              className={`w-full h-8 sm:h-8.5 rounded-xl flex items-center transition-all cursor-pointer border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 shrink-0 ${
                isHovered ? 'px-2 justify-start' : 'px-1 justify-center'
              }`}
              title={isHovered ? undefined : "ADE User Guide & Manual"}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-center shrink-0">
                <Compass size={14} className="text-slate-400" />
              </div>
              <div
                className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-200 overflow-hidden ${
                  isPinned || isHovered ? 'opacity-100 ml-2.5 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
                }`}
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider truncate leading-tight text-slate-300">
                  ADE GUIDE
                </span>
                <span className="text-[8.5px] text-slate-500 truncate font-mono leading-tight mt-0.5">
                  Documentation & Manual
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Floating Tooltip Portal */}
        {hoveredItem && (!isPinned && !isHovered || hoveredItem.item.description) && typeof document !== 'undefined' && createPortal(
          <div
            role="tooltip"
            className="fixed pointer-events-none px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-slate-700 text-slate-100 font-mono text-[11px] font-bold whitespace-nowrap shadow-2xl animate-in fade-in duration-100 hidden md:block select-none"
            style={{
              left: `${(isPinned || isHovered) ? Math.max(252, hoveredItem.rect.right + 12) : hoveredItem.rect.right + 10}px`,
              top: `${hoveredItem.rect.top + hoveredItem.rect.height / 2}px`,
              transform: 'translateY(-50%)',
              zIndex: 999999
            }}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{
                  backgroundColor: hoveredItem.theme?.bar
                    ? hoveredItem.theme.bar.split(' ')[0].replace('bg-', '')
                    : '#22d3ee'
                }}
              />
              <span>{hoveredItem.item.sublabel || hoveredItem.item.label}</span>
            </div>
            {hoveredItem.item.description && (
              <div className="text-[9.5px] text-slate-400 font-normal mt-0.5 max-w-[220px] whitespace-normal font-sans">
                {hoveredItem.item.description}
              </div>
            )}
          </div>,
          document.body
        )}
      </nav>
    </>
  );
};

export default ADENavRail;
