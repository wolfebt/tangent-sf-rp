/**
 * @file AdeMasterControlBar.jsx
 * @description Master Control Bar for the Adventure Development Environment (ADE) Live Studio.
 * Houses project breadcrumbs, studio mode toggle (DEVELOPMENT vs RUNNING LIVE), viewport split controls
 * (Side-by-Side, Stage Only, Story Only), snapshot saving, module import/export, and utility modal triggers.
 */

import React from 'react';
import { 
  Hammer, 
  Play, 
  Columns, 
  Maximize2, 
  BookOpen, 
  Sparkles, 
  Save, 
  Download, 
  Upload, 
  Settings 
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const AdeMasterControlBar = ({
  universeState,
  activeScenario,
  activeMap,
  saveStatusText,
  onOpenCatalog,
  studioMode,
  setStudioMode,
  viewportSplit,
  setViewportSplit,
  onOpenGems,
  onOpenCronicle,
  cronicleCount = 0,
  onOpenCompiler,
  onOpenPrintModal,
  isFloatingAimeOpen,
  onToggleFloatingAime,
  onQuickSaveSnapshot,
  isImportExportMenuOpen,
  setIsImportExportMenuOpen,
  fileInputRef,
  onExportModule,
  onImportFileChange,
  onOpenGuide,
  onOpenSettings,
  onNavigateToClassic
}) => {
  return (
    <div className="h-14 bg-[#090d16] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Left: Brand, Project Name & Active Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="font-mono text-xs font-black tracking-wider text-cyan-400 uppercase">
            ADE LIVE STUDIO
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-800" />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              type="button"
              onClick={onOpenCatalog}
              className="text-slate-200 hover:text-cyan-300 font-bold truncate max-w-[140px] cursor-pointer"
              title="Switch Story Project"
            >
              {universeState?.projectName || 'Tangent Universe'}
            </button>
            <span className="text-slate-500">❯</span>
            <span className="text-purple-300 truncate">
              {activeScenario?.title || 'Scenario'}
            </span>
            <span className="text-slate-500">❯</span>
            <span className="text-amber-300 truncate">
              {activeMap?.title || 'Sector Grid'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
            <span className="text-emerald-400">● {saveStatusText}</span>
            <span>•</span>
            <span>TL {universeState?.techLevel || 3}</span>
          </div>
        </div>
      </div>

      {/* Center: DUAL-MODE TOGGLE (DEVELOPMENT vs RUNNING LIVE) */}
      <div className="flex items-center bg-[#060911] p-1 rounded-xl border border-slate-800 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setStudioMode('development');
            AudioService.playTerminalBeep(1100, 0.03);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
            studioMode === 'development'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Development Mode: Live authoring of prose, waypoints, smart props, and environmental lighting"
        >
          <Hammer size={13} />
          <span>DEVELOPMENT MODE</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStudioMode('live_session');
            AudioService.playCriticalChime(true);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
            studioMode === 'live_session'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Running Live: In-session tactical play, active waypoint arrival triggers, and live token movements"
        >
          <Play size={13} />
          <span>RUNNING LIVE</span>
        </button>
      </div>

      {/* Right: SPLIT VIEWPORT TOGGLE & COMPLETE ADE UTILITY SUITE */}
      <div className="flex items-center gap-2">
        {/* Split Mode Buttons */}
        <div className="flex items-center bg-[#060911] p-0.5 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setViewportSplit('side_by_side');
              AudioService.playTerminalBeep(900, 0.02);
            }}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
              viewportSplit === 'side_by_side'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dual-Pane Side-by-Side View"
          >
            <Columns size={12} />
            <span className="hidden sm:inline">Split</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewportSplit('canvas_only');
              AudioService.playTerminalBeep(900, 0.02);
            }}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
              viewportSplit === 'canvas_only'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Full Stage Canvas Viewport"
          >
            <Maximize2 size={12} />
            <span className="hidden sm:inline">Stage Only</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewportSplit('story_only');
              AudioService.playTerminalBeep(900, 0.02);
            }}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
              viewportSplit === 'story_only'
                ? 'bg-purple-950 text-purple-300 border border-purple-500/50 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Full Story Manuscript Viewport"
          >
            <BookOpen size={12} />
            <span className="hidden sm:inline">Story Only</span>
          </button>
        </div>

        {/* ── STREAMLINED PRIMARY ACTION: CREATIVE SUITE JUMP ── */}
        <button
          type="button"
          onClick={onNavigateToClassic}
          className="px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          title="Return to Story Foundry Creative Suite"
        >
          <BookOpen size={13} className="text-purple-300" />
          <span className="hidden md:inline">Creative Suite</span>
        </button>

        {/* Floating AIME Co-Pilot Toggle */}
        <button
          type="button"
          onClick={onToggleFloatingAime}
          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
            isFloatingAimeOpen
              ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border-slate-700'
          }`}
          title="Toggle Floating AIME Narrative Assistant"
        >
          <Sparkles size={14} />
        </button>

        {/* Quick Snapshot Save */}
        <button
          type="button"
          onClick={onQuickSaveSnapshot}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
          title="Create local snapshot (Ctrl+S)"
        >
          <Save size={13} />
          <span className="hidden lg:inline text-slate-400">Save</span>
        </button>

        {/* Export / Import Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsImportExportMenuOpen(prev => !prev)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
            title="Import or Export Module Package"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Module ▾</span>
          </button>

          {isImportExportMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-slate-900/98 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 font-mono text-xs divide-y divide-slate-800">
              <button
                type="button"
                onClick={onExportModule}
                className="w-full text-left px-3 py-2 hover:bg-cyan-950/60 text-cyan-300 flex items-center gap-2 cursor-pointer"
              >
                <Download size={13} />
                <span>Export .tangent-module</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-3 py-2 hover:bg-cyan-950/60 text-slate-200 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Upload size={13} />
                <span>Import Module JSON</span>
              </button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* User Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          title="User Profile & Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
};
