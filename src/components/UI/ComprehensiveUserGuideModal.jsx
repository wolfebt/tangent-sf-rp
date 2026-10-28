/**
 * @file ComprehensiveUserGuideModal.jsx
 * Fullscreen Interactive User Guide Modal for Tangent Science Fantasy Roleplaying Game.
 * Features Ringed Planet logo branding, 11 comprehensive modules, 6W operational context answers,
 * and unified rendering via UserGuideView.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  Users, 
  Database, 
  Sparkles, 
  Layers, 
  Map, 
  Cpu, 
  Radio, 
  Dices, 
  Terminal, 
  Search, 
  ChevronRight
} from 'lucide-react';
import { RingedPlanetLogo } from './RingedPlanetLogo';
import { UserGuideView } from '../Guide/UserGuideView';
import { USER_GUIDE_SECTIONS } from '../Guide/userGuideData';
import { AudioService } from '../../services/audioService';

export const GUIDE_TABS = [
  { id: 'intro', label: 'Intro & Architecture', icon: RingedPlanetLogo, badge: 'System Blueprint', color: '#22d3ee' },
  { id: 'hub', label: 'Operations Hub & HUD', icon: Compass, badge: 'Command Center', color: '#06b6d4' },
  { id: 'folio', label: 'Persona Folio & Roster', icon: Users, badge: 'Hero Manager', color: '#0ea5e9' },
  { id: 'dbm', label: 'Omnicortex DBM', icon: Database, badge: 'Rules Compendium', color: '#10b981' },
  { id: 'codex', label: 'Codex & Economatrix', icon: Sparkles, badge: 'Matrix Suite', color: '#f59e0b' },
  { id: 'story', label: 'ADE Story Foundry', icon: Layers, badge: 'Adventure Engine', color: '#a855f7' },
  { id: 'maps', label: 'Tactical Map Maker & VTT', icon: Map, badge: 'Virtual Tabletop', color: '#38bdf8' },
  { id: 'aime', label: 'AIME & Element Forge', icon: Cpu, badge: 'AI & Lore Forge', color: '#ec4899' },
  { id: 'comms', label: 'CommLink Relay', icon: Radio, badge: 'Comms & Dispatch', color: '#3b82f6' },
  { id: 'dice', label: '2d10 Dice & Arbitration', icon: Dices, badge: 'Arbitration Engine', color: '#eab308' },
  { id: 'shortcuts', label: 'Hotkeys & Preferences', icon: Terminal, badge: 'System Tools', color: '#6366f1' }
];

export const ComprehensiveUserGuideModal = ({ isOpen, onClose, initialTab = 'intro' }) => {
  // Normalize legacy tab IDs (e.g. 'rules' -> 'dbm', 'utilities' -> 'dice')
  const normalizeTab = (t) => {
    if (t === 'rules') return 'dbm';
    if (t === 'utilities') return 'dice';
    return t || 'intro';
  };

  const [activeTab, setActiveTab] = useState(() => normalizeTab(initialTab));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(normalizeTab(initialTab));
    }
  }, [isOpen, initialTab]);

  // Keyboard navigation: Escape to close, Alt+Left / Alt+Right to cycle guide sections
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        AudioService?.playTerminalBeep?.(900, 0.02);
        onClose?.();
        return;
      }
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const idx = GUIDE_TABS.findIndex(t => t.id === activeTab);
        if (e.key === 'ArrowLeft' && idx > 0) {
          AudioService?.playTerminalBeep?.(1100, 0.02);
          setActiveTab(GUIDE_TABS[idx - 1].id);
        } else if (e.key === 'ArrowRight' && idx >= 0 && idx < GUIDE_TABS.length - 1) {
          AudioService?.playTerminalBeep?.(1100, 0.02);
          setActiveTab(GUIDE_TABS[idx + 1].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, activeTab]);

  const activeTabMeta = useMemo(() => {
    return GUIDE_TABS.find(t => t.id === activeTab) || GUIDE_TABS[0];
  }, [activeTab]);

  const filteredTabs = useMemo(() => {
    if (!searchTerm.trim()) return GUIDE_TABS;
    const q = searchTerm.toLowerCase().trim();
    return GUIDE_TABS.filter(t => 
      t.label.toLowerCase().includes(q) || 
      t.badge.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center sm:items-start justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 pt-3 sm:pt-8 md:pt-10 pb-3 sm:pb-6 overflow-y-auto select-none font-sans animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#0b0f17] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(34,211,238,0.2)] w-full max-w-7xl h-[94vh] sm:h-auto max-h-[96vh] sm:max-h-[92vh] flex flex-col font-sans overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <header className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 bg-slate-950/90 border-b border-cyan-900/60 flex items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)] shrink-0">
              <RingedPlanetLogo size={20} glow={true} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 shrink-0">
                  v2.5+
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden sm:inline">OFFICIAL PLATFORM USER GUIDE</span>
              </div>
              <h2 className="text-xs sm:text-base md:text-lg font-extrabold tracking-wider text-white uppercase font-mono truncate">
                Comprehensive User Guide
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter guide modules..."
                className="w-48 lg:w-64 bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 py-1.5 pl-8 text-xs text-slate-200 placeholder-slate-500 outline-none font-mono transition-all shadow-inner"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              )}
            </div>

            <button
              onClick={() => {
                AudioService?.playTerminalBeep?.(900, 0.02);
                onClose();
              }}
              className="p-1 sm:p-1.5 px-2.5 sm:px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Close Guide (Esc)"
            >
              <span>✕</span>
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </header>

        {/* Mobile Horizontal Module Tabs Strip */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto p-2 bg-[#080c13] border-b border-slate-800/90 shrink-0 custom-scrollbar scrollbar-thin">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  AudioService?.playTerminalBeep?.(1100, 0.02);
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-sm'
                    : 'text-slate-400 bg-slate-900/60 hover:text-white border border-slate-800'
                }`}
              >
                {tab.id === 'intro' ? <RingedPlanetLogo size={13} /> : <Icon size={13} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Body: Left App Selector Tabs (Desktop) + Right Content Reader */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Navigation Sidebar - Hidden on mobile, visible on md+ */}
          <aside className="hidden md:flex md:w-64 lg:w-72 bg-[#080c13] border-r border-slate-800/90 flex-col shrink-0">
            <div className="p-3 border-b border-slate-800/80 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <span>Application Modules</span>
              <span className="text-cyan-400 font-mono">{filteredTabs.length} MODULES</span>
            </div>

            <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      AudioService?.playTerminalBeep?.(1100, 0.02);
                      setActiveTab(tab.id);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wide transition-all flex items-center gap-2.5 group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/90 to-slate-900 text-cyan-200 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <div 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.id === 'intro' ? <RingedPlanetLogo size={15} /> : <Icon size={15} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{tab.label}</div>
                      <div className="text-[9px] text-slate-500 font-normal tracking-tight truncate">
                        {tab.badge}
                      </div>
                    </div>
                    {isActive && (
                      <ChevronRight size={14} className="text-cyan-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer Info */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-[10px] font-mono text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Spotlight Omni-Search:</span>
                <kbd className="px-1 bg-slate-800 text-cyan-300 rounded">Ctrl+K</kbd>
              </div>
              <div className="flex justify-between">
                <span>Polyhedral Dice Dock:</span>
                <kbd className="px-1 bg-slate-800 text-amber-300 rounded">Alt+D</kbd>
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 flex flex-col h-full min-w-0 bg-[#090d16]/90 overflow-hidden">
            <UserGuideView
              activeSectionId={activeTab}
              onSelectSection={(id) => {
                AudioService?.playTerminalBeep?.(1100, 0.02);
                setActiveTab(id);
              }}
              onNavigate={(target) => {
                if (target?.id) {
                  setActiveTab(target.id);
                }
              }}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveUserGuideModal;
