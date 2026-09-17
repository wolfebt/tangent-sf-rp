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
import { createPortal } from 'react-dom';
import { 
  BookOpen, 
  Play, 
  Target, 
  Box, 
  Printer, 
  PanelLeftClose, 
  PanelLeft,
  Compass
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

const THEMES = {
  cyan: {
    iconBox: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400 group-hover:text-cyan-300',
    activeBox: 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.4)]',
    activeBtn: 'bg-cyan-950/70 border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.25)]',
    activeLabel: 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.7)]',
    idleLabel: 'text-slate-400 group-hover:text-cyan-300',
    bar: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    badge: 'bg-cyan-500 text-black'
  },
  purple: {
    iconBox: 'bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-400 group-hover:text-purple-300',
    activeBox: 'bg-purple-500/25 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
    activeBtn: 'bg-purple-950/70 border-purple-400/80 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    activeLabel: 'text-purple-300 font-extrabold [text-shadow:0_0_8px_rgba(168,85,247,0.7)]',
    idleLabel: 'text-slate-400 group-hover:text-purple-300',
    bar: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    badge: 'bg-purple-500 text-white'
  },
  amber: {
    iconBox: 'bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-400 group-hover:text-amber-300',
    activeBox: 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    activeBtn: 'bg-amber-950/70 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    activeLabel: 'text-amber-300 font-extrabold [text-shadow:0_0_8px_rgba(245,158,11,0.7)]',
    idleLabel: 'text-slate-400 group-hover:text-amber-300',
    bar: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    badge: 'bg-amber-500 text-black'
  },
  emerald: {
    iconBox: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-400 group-hover:text-emerald-300',
    activeBox: 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    activeBtn: 'bg-emerald-950/70 border-emerald-400/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    activeLabel: 'text-emerald-300 font-extrabold [text-shadow:0_0_8px_rgba(16,185,129,0.7)]',
    idleLabel: 'text-slate-400 group-hover:text-emerald-300',
    bar: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    badge: 'bg-emerald-500 text-black'
  }
};

export const ADENavRail = ({
  activeView = 'scenarios',
  onSwitchView,
  elementsCount = 0,
  gemsCount = 0,
  pendingCronicleCount = 0,
  onOpenGems,
  onOpenCronicle,
  onOpenScratchbook,
  onOpenPrintModal,
  onOpenGuide,
  isTreeExpanded = true,
  onToggleTreeExpanded
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const workspaceItems = [
    {
      id: 'scenarios',
      label: 'WEAVER',
      sublabel: 'Story Weaver',
      description: 'Manuscript Drafting, Story Beats & Live Tactical Feed',
      icon: BookOpen,
      colorTheme: 'cyan'
    },
    {
      id: 'interactive',
      label: 'PLAY',
      sublabel: 'Interactive Play',
      description: 'Branching Story Sequences & Decision Gates',
      icon: Play,
      colorTheme: 'purple'
    },
    {
      id: 'control-panel',
      label: 'TACTICAL',
      sublabel: 'Tactical Spread',
      description: 'OSR 2-Page Control Spread (Read-Aloud, DCs, Secrets)',
      icon: Target,
      colorTheme: 'amber'
    },
    {
      id: 'elements',
      label: 'FORGE',
      sublabel: 'Element Forge',
      description: 'Worldbuilding Catalog (Personas, Factions, Items, Lore)',
      icon: Box,
      colorTheme: 'emerald',
      badge: elementsCount > 0 ? `${elementsCount}` : null
    }
  ];

  const utilityItems = [
    {
      id: 'gems',
      label: 'GEMS',
      sublabel: 'Guidance Gems',
      description: 'Select narrative style, mood & worldbuilding modifiers',
      icon: '💎',
      badge: gemsCount > 0 ? `${gemsCount}` : null,
      colorTheme: 'amber',
      onClick: onOpenGems
    },
    {
      id: 'cronicle',
      label: 'CRONICLE',
      sublabel: 'Living Memory',
      description: 'Timeline Deck & Narrative Event Log',
      icon: '📜',
      badge: pendingCronicleCount > 0 ? `${pendingCronicleCount}` : null,
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

  const handleSelectWorkspace = (id) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (onSwitchView) onSwitchView(id);
  };

  const handleSelectUtility = (item) => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (item.onClick) item.onClick();
  };

  return (
    <nav
      aria-label="ADE Studio Navigation Rail"
      className="w-14 sm:w-16 shrink-0 h-full bg-[#080c14]/98 backdrop-blur-md border-r border-slate-800/90 flex flex-col items-center justify-between py-2 px-1 select-none z-20 font-sans shadow-xl"
    >
      {/* Top Section: Workspaces */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Rail Brand Mini-Header */}
        <div className="flex flex-col items-center justify-center py-1 mb-0.5">
          <div className="text-[9px] font-mono font-bold tracking-widest text-purple-400 uppercase">
            ADE
          </div>
          <div className="w-6 h-px bg-purple-500/30 mt-1" />
        </div>

        {/* 1. Primary Studio Workspaces */}
        {workspaceItems.map((item) => {
          const isActive = activeView === item.id;
          const theme = THEMES[item.colorTheme] || THEMES.cyan;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectWorkspace(item.id)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({ item, theme, rect });
              }}
              onMouseLeave={() => setHoveredItem(null)}
              className={`group relative w-full py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                isActive
                  ? theme.activeBtn
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
              }`}
            >
              {/* Active Left Indicator Bar */}
              {isActive && (
                <span className={`absolute -left-1 top-2 bottom-2 w-1 rounded-r-full ${theme.bar}`} />
              )}

              {/* Icon Container */}
              <div
                className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                  isActive ? theme.activeBox : theme.iconBox
                }`}
              >
                {typeof Icon === 'string' ? (
                  <span className="text-sm">{Icon}</span>
                ) : (
                  <Icon size={16} />
                )}

                {/* Badge */}
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 px-1 py-0.2 min-w-[15px] h-[15px] rounded-full font-mono text-[8.5px] font-bold flex items-center justify-center shadow-md ${theme.badge}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Monospace Label */}
              <span
                className={`font-mono text-[8.5px] uppercase tracking-wider text-center mt-1 truncate max-w-full px-0.5 leading-tight transition-colors ${
                  isActive ? theme.activeLabel : theme.idleLabel
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Section Divider */}
        <div className="w-8 h-px bg-slate-800/80 my-1.5" />

        {/* 2. Fast-Access Quick Modals Cluster */}
        <div className="flex flex-col items-center gap-1 w-full">
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
                className="group relative w-full py-1 px-0.5 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent hover:border-slate-800/80 transition-all cursor-pointer"
              >
                <div
                  className={`relative w-7 h-7 rounded-md flex items-center justify-center shrink-0 border transition-all ${theme.iconBox}`}
                >
                  {typeof Icon === 'string' ? (
                    <span className="text-xs">{Icon}</span>
                  ) : (
                    <Icon size={13} />
                  )}

                  {item.badge && (
                    <span
                      className={`absolute -top-1 -right-1 px-1 min-w-[13px] h-[13px] rounded-full font-mono text-[8px] font-bold flex items-center justify-center shadow-md ${theme.badge} ${
                        item.badgePulse ? 'animate-pulse' : ''
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <span className="font-mono text-[8px] uppercase tracking-wider text-center mt-0.5 truncate max-w-full text-slate-500 group-hover:text-slate-300">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Outliner Toggle & Guide */}
      <div className="w-full flex flex-col items-center gap-1 pt-1.5 border-t border-slate-800/80 mt-auto">
        {/* Outliner Tree Toggle */}
        {onToggleTreeExpanded && (
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              onToggleTreeExpanded();
            }}
            className={`w-full py-1 px-0.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer border ${
              isTreeExpanded
                ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900/50 border-transparent'
            }`}
            title={isTreeExpanded ? 'Collapse Scenario Outliner ([)' : 'Expand Scenario Outliner ([)'}
          >
            <div className="w-7 h-7 rounded-md bg-slate-900/90 border border-slate-800 flex items-center justify-center">
              {isTreeExpanded ? (
                <PanelLeftClose size={14} className="text-cyan-400" />
              ) : (
                <PanelLeft size={14} className="text-slate-400" />
              )}
            </div>
            <span className="font-mono text-[8px] uppercase tracking-wider mt-0.5 text-slate-400">
              {isTreeExpanded ? 'TREE' : 'OPEN'}
            </span>
          </button>
        )}

        {/* ADE Guide Manual */}
        {onOpenGuide && (
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              onOpenGuide();
            }}
            className="w-full py-1 px-0.5 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 transition-all cursor-pointer border border-transparent"
            title="ADE User Guide & Manual"
          >
            <div className="w-7 h-7 rounded-md bg-slate-900/90 border border-slate-800 flex items-center justify-center">
              <Compass size={14} className="text-slate-400" />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-wider mt-0.5 text-slate-500">
              GUIDE
            </span>
          </button>
        )}
      </div>

      {/* Floating Tooltip Portal */}
      {hoveredItem && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          className="fixed z-[999999] pointer-events-none px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-slate-700 text-slate-100 font-mono text-[11px] font-bold whitespace-nowrap shadow-2xl animate-in fade-in duration-100 hidden md:block"
          style={{
            left: `${hoveredItem.rect.right + 10}px`,
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
            <div className="text-[9.5px] text-slate-400 font-normal mt-0.5 max-w-[220px] whitespace-normal">
              {hoveredItem.item.description}
            </div>
          )}
        </div>,
        document.body
      )}
    </nav>
  );
};

export default ADENavRail;
