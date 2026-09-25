import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Crown, 
  Eye, 
  Settings, 
  BookOpen, 
  Bot, 
  Sparkles, 
  Dna, 
  Library, 
  HardDrive, 
  FolderOpen 
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const DBMHUDBar = ({
  setIsSidebarOpen,
  handleBack,
  handleForward,
  historyIndex,
  history,
  activeCategory,
  adminOverride,
  toggleAdminOverride,
  isBastionOpen,
  setIsBastionOpen,
  handleOpenGuide,
  handleClearDbmCache,
  syncMasterSpeciesMatrix,
  syncCanonicalCompendium,
  handleExportMasterJSON,
  handleImportMasterJSON,
  triggerMasterImport,
  isAdmin
}) => {
  const navigate = useNavigate();
  const [isDbmMenuOpen, setIsDbmMenuOpen] = useState(false);
  const dbmMenuRef = useRef(null);
  const dbmFileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dbmMenuRef.current && !dbmMenuRef.current.contains(event.target)) {
        setIsDbmMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Mobile Navigation Rail Toggle Button */}
      <button
        type="button"
        onClick={() => setIsSidebarOpen && setIsSidebarOpen(prev => !prev)}
        className="md:hidden px-2 py-1 bg-slate-900 border border-cyan-900/60 rounded text-cyan-400 text-xs font-bold cursor-pointer"
        title="Toggle Omnicortex Navigation Rail"
      >
        <Menu size={14} />
      </button>

      {/* DBM Undo / Redo controls */}
      {handleBack && handleForward && (
        <div className="flex items-center gap-1 bg-[#161b22] p-0.5 rounded-md border border-[#0D5C63]/40 shrink-0 cyan-shadow-thin">
          <button
            type="button"
            onClick={handleBack}
            disabled={!historyIndex || historyIndex === 0}
            className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-[11px] font-bold text-slate-300 transition-colors cursor-pointer"
            title="Back"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={!history || historyIndex >= history.length - 1}
            className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-[11px] font-bold text-slate-300 transition-colors cursor-pointer"
            title="Forward"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* Active Category Indicator (Amber Database Access) */}
      <div className="px-2 py-0.5 bg-amber-950/60 border border-amber-500/50 rounded-md text-[11px] font-mono text-amber-300 font-bold uppercase hidden sm:block cyan-shadow-thin">
        {activeCategory ? activeCategory.toUpperCase() : 'DATABASE'}
      </div>

      {/* Master Developer Access Quick Indicator & Toggle */}
      <button
        type="button"
        onClick={() => toggleAdminOverride && toggleAdminOverride()}
        className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer cyan-shadow-thin ${
          adminOverride
            ? 'bg-amber-950/70 border-amber-500/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
        }`}
        title={adminOverride ? "Master Developer Access Active (Full CRUD: Add, Edit, Clone, Delete). Click to toggle." : "Player View (Read-Only). Click to enable Master Developer Access."}
      >
        {adminOverride ? <Crown size={13} className="text-amber-400" /> : <Eye size={13} className="text-slate-400" />}
        <span className="hidden lg:inline">{adminOverride ? 'MASTER ACCESS: ON' : 'PLAYER VIEW'}</span>
      </button>

      {/* System Actions Dropdown Menu */}
      <div className="relative shrink-0" ref={dbmMenuRef}>
        <button
          type="button"
          onClick={() => setIsDbmMenuOpen(prev => !prev)}
          className="px-2 sm:px-2.5 py-1 bg-[#12161f] hover:bg-slate-800 border border-amber-500/50 text-amber-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cyan-shadow-thin cursor-pointer"
          title="System Tools & Actions Menu"
        >
          <Settings size={13} className="text-amber-400" />
          <span className="hidden md:inline">Tools</span>
          <ChevronDown size={11} className="text-amber-400" />
        </button>

        {isDbmMenuOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-[#12161f] border border-cyan-500/40 rounded-lg shadow-2xl p-2 z-50 flex flex-col gap-1.5 backdrop-blur-md">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-0.5">
              Omnicortex Options
            </div>

            {/* Switch to Rules Codex */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.03);
                setIsDbmMenuOpen(false);
                navigate('/codex');
              }}
              className="w-full text-left px-3 py-2 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 rounded text-xs font-bold uppercase transition-colors flex items-center justify-between cursor-pointer"
              title="Switch from Omnicortex DB to Rules Codex Matrices"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={13} className="text-purple-400" />
                <span>Rules Codex</span>
              </div>
              <span className="text-[10px] text-purple-400 font-mono">Codex</span>
            </button>

            {/* Bastion AI Assistant Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsBastionOpen && setIsBastionOpen(prev => !prev);
                setIsDbmMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded text-xs font-bold uppercase transition-colors flex items-center justify-between cursor-pointer"
              title="Toggle BASTION AI (Rules assistant & entry generator)"
            >
              <div className="flex items-center gap-2">
                <Bot size={13} className="text-emerald-400" />
                <span>Bastion AI</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isBastionOpen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                {isBastionOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </button>

            {/* User Guide */}
            <button
              type="button"
              onClick={() => {
                handleOpenGuide('dbm');
                setIsDbmMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 bg-amber-950/30 hover:bg-amber-900/50 border border-amber-500/30 text-amber-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer"
              title="User Guide & System Documentation"
            >
              <BookOpen size={13} className="text-amber-400" />
              <span>User Guide</span>
            </button>

            {/* Key Developer Master Access Toggle */}
            <button
              type="button"
              onClick={() => {
                toggleAdminOverride && toggleAdminOverride();
                setIsDbmMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 bg-slate-800/60 hover:bg-slate-800 text-cyan-300 rounded text-xs font-bold uppercase transition-colors flex items-center justify-between cursor-pointer"
              title="Toggle Key Developer Master Access (Full CRUD)"
            >
              <div className="flex items-center gap-2">
                <Crown size={13} className="text-amber-400" />
                <span>Master Access</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${adminOverride ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-700 text-slate-400'}`}>
                {adminOverride ? 'ACTIVE' : 'OFF'}
              </span>
            </button>

            {/* Clear Local Cache */}
            <button
              type="button"
              onClick={() => {
                handleClearDbmCache();
                setIsDbmMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer"
              title="Clear local search filter and Omnicortex cache"
            >
              <Sparkles size={13} className="text-slate-400" />
              <span>Clear Cache</span>
            </button>

            <div className="border-t border-slate-800 my-1"></div>

            {/* Sync Species Matrix to Cloud */}
            <button
              type="button"
              onClick={() => {
                syncMasterSpeciesMatrix && syncMasterSpeciesMatrix();
                setIsDbmMenuOpen(false);
              }}
              disabled={!isAdmin}
              className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 ${
                isAdmin
                  ? 'bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 cursor-pointer'
                  : 'bg-slate-800/30 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
              title={isAdmin ? "Sync Canonical Species Matrix (Types, Sizes, Speeds, Traits, Disadvantages, Species) to Cloud" : "Requires Admin privileges"}
            >
              <Dna size={13} className="text-blue-400" />
              <span>Sync Species Matrix</span>
            </button>

            {/* Sync Compendium to Cloud */}
            <button
              type="button"
              onClick={() => {
                syncCanonicalCompendium && syncCanonicalCompendium();
                setIsDbmMenuOpen(false);
              }}
              disabled={!isAdmin}
              className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 ${
                isAdmin
                  ? 'bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 cursor-pointer'
                  : 'bg-slate-800/30 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
              title={isAdmin ? "Sync Canonical Compendium Articles to Cloud" : "Requires Admin privileges"}
            >
              <Library size={13} className="text-purple-400" />
              <span>Sync Compendium</span>
            </button>

            <div className="border-t border-slate-800 my-1"></div>

            {/* Master Export */}
            <button
              type="button"
              onClick={() => {
                handleExportMasterJSON && handleExportMasterJSON();
                setIsDbmMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer"
              title="Download full Omnicortex Master Database Backup JSON"
            >
              <HardDrive size={13} className="text-emerald-400" />
              <span>Master Export</span>
            </button>

            {/* Master Import */}
            <button
              type="button"
              onClick={() => {
                if (triggerMasterImport) triggerMasterImport();
                else if (dbmFileInputRef.current) dbmFileInputRef.current.click();
                setIsDbmMenuOpen(false);
              }}
              disabled={!isAdmin}
              className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 ${
                isAdmin
                  ? 'bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 cursor-pointer'
                  : 'bg-slate-800/30 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
              title={isAdmin ? "Import Master Database Backup" : "Requires GM/Admin access to import data"}
            >
              <FolderOpen size={13} className="text-cyan-400" />
              <span>Master Import</span>
            </button>
          </div>
        )}

        <input
          type="file"
          ref={dbmFileInputRef}
          onChange={handleImportMasterJSON}
          accept=".json"
          className="hidden"
        />
      </div>
    </div>
  );
};
