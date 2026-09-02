import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DBMHeader = ({
  historyIndex,
  historyLength,
  handleBack,
  handleForward,
  isBastionOpen,
  setIsBastionOpen,
  handleExportMasterJSON,
  handleImportMasterJSON,
  navigateToCategory,
  isSidebarOpen,
  setIsSidebarOpen,
  setIsSettingsOpen,
  onOpenArchitectModal
}) => {
  const navigate = useNavigate();
  const { currentUser, userHandle, confirmLogout, loginWithGoogle, isAdmin, userRole, adminOverride, toggleAdminOverride } = useAuth();
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerImport = () => {
    if (!isAdmin) {
      alert('Administrator or GM access required to import Master Database backups.');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear your local Omnicortex temporary cache and search filters?')) {
      localStorage.removeItem('tangent_dbm_cache');
      window.location.reload();
    }
  };

  return (
    <header className="bg-[#0d1117] border-b border-[#0D5C63]/50 px-4 sm:px-6 py-2 flex items-center justify-between backdrop-blur-md shrink-0 relative z-40">
      {/* Left section: Mobile Menu & Undo/Redo */}
      <div className="flex items-center gap-3">
        {/* Mobile 3bar Menu Toggle Button */}
        <button
          type="button"
          id="dbm-mobile-menu-btn"
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden px-2.5 py-1.5 bg-slate-900 border border-cyan-900/60 rounded text-cyan-400 text-sm font-bold"
          title="Toggle Navigation Menu"
        >
          &#9776;
        </button>

        {/* Desktop Undo/Redo Controls */}
        <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-md border border-[#0D5C63]/40">
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-xs font-bold text-slate-300 transition-colors"
            title="Back"
          >
            ◄
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= historyLength - 1}
            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-xs font-bold text-slate-300 transition-colors"
            title="Forward"
          >
            ►
          </button>
        </div>
      </div>

      {/* Right section: System Tools Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* System Actions Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-3 py-1.5 bg-[#161b22] hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 shadow-sm"
            title="System Tools & Actions Menu"
          >
            <span>⚙️</span>
            <span>System Tools</span>
            <span className="text-[10px] text-cyan-400">▼</span>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#161b22] border border-cyan-500/40 rounded-lg shadow-2xl p-2 z-50 flex flex-col gap-1.5 backdrop-blur-md">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-0.5">
                System Options
              </div>

              {/* Switch to Rules Codex */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/codex');
                }}
                className="w-full text-left px-3 py-2 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 rounded text-xs font-bold uppercase transition-colors flex items-center justify-between"
                title="Switch from Omnicortex DB to Rules Codex Matrices"
              >
                <div className="flex items-center gap-2">
                  <span>📖</span>
                  <span>Rules Codex</span>
                </div>
                <span className="text-[10px] text-purple-400 font-mono">Codex</span>
              </button>

              {/* Bastion AI Assistant Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsBastionOpen && setIsBastionOpen(!isBastionOpen);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 rounded text-xs font-bold uppercase transition-colors flex items-center justify-between"
                title="Toggle BASTION AI (Rules assistant & entry generator)"
              >
                <div className="flex items-center gap-2">
                  <span>🤖</span>
                  <span>Bastion AI</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isBastionOpen ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-400'}`}>
                  {isBastionOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </button>

              {/* User Guide */}
              <button
                onClick={() => {
                  navigateToCategory && navigateToCategory('user_guide');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 bg-amber-950/30 hover:bg-amber-900/50 border border-amber-500/30 text-amber-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2"
                title="User Guide & System Documentation"
              >
                <span>📖</span>
                <span>User Guide</span>
              </button>

              {/* Dev Mode Toggle */}
              {currentUser && (
                <button
                  onClick={() => {
                    toggleAdminOverride && toggleAdminOverride();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 bg-slate-800/60 hover:bg-slate-800 text-cyan-300 rounded text-xs font-bold uppercase transition-colors flex items-center justify-between"
                  title="Toggle Local Admin / Architect Override"
                >
                  <div className="flex items-center gap-2">
                    <span>⚡</span>
                    <span>Admin Override</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${adminOverride ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-400'}`}>
                    {adminOverride ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              {/* Clear Local Cache */}
              <button
                onClick={handleClearCache}
                className="w-full text-left px-3 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2"
                title="Clear local search filter and Omnicortex cache"
              >
                <span>🧹</span>
                <span>Clear Cache</span>
              </button>

              <div className="border-t border-slate-800 my-1"></div>

              {/* Sync Species Matrix to Cloud */}
              <button
                onClick={() => {
                  syncMasterSpeciesMatrix && syncMasterSpeciesMatrix();
                  setIsMenuOpen(false);
                }}
                disabled={!isAdmin}
                className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 ${
                  isAdmin
                    ? 'bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300'
                    : 'bg-slate-800/30 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
                title={isAdmin ? "Sync Canonical Species Matrix (Types, Sizes, Speeds, Traits, Disadvantages, Species) to Cloud" : "Requires Admin privileges"}
              >
                <span>🧬</span>
                <span>Sync Species Matrix</span>
              </button>

              {/* Sync Compendium to Cloud */}
              <button
                onClick={() => {
                  syncCanonicalCompendium && syncCanonicalCompendium();
                  setIsMenuOpen(false);
                }}
                disabled={!isAdmin}
                className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 ${
                  isAdmin
                    ? 'bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300'
                    : 'bg-slate-800/30 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
                title={isAdmin ? "Sync Canonical Compendium Articles to Cloud" : "Requires Admin privileges"}
              >
                <span>📚</span>
                <span>Sync Compendium</span>
              </button>

              <div className="border-t border-slate-800 my-1"></div>

              {/* Master Export */}
              <button
                onClick={() => {
                  handleExportMasterJSON && handleExportMasterJSON();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2"
                title="Download full Omnicortex Master Database Backup JSON"
              >
                <span>💾</span>
                <span>Master Export</span>
              </button>

              {/* Master Import */}
              <button
                onClick={() => {
                  triggerImport();
                  setIsMenuOpen(false);
                }}
                disabled={!isAdmin}
                className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 ${
                  isAdmin
                    ? 'bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800/30 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
                title={isAdmin ? "Import Master Database Backup" : "Requires GM/Admin access to import data"}
              >
                <span>📂</span>
                <span>Master Import</span>
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportMasterJSON}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
};
