import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DBMHeader = ({
  historyIndex,
  historyLength,
  handleBack,
  handleForward,
  setIsBastionOpen,
  handleExportMasterJSON,
  handleImportMasterJSON,
  navigateToCategory,
  isSidebarOpen,
  setIsSidebarOpen,
  setIsSettingsOpen
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
    <header className="bg-[#0d1117] border-b border-[#0D5C63]/50 px-4 sm:px-6 py-2.5 flex items-center justify-between backdrop-blur-md shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-3 sm:gap-4">
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
        <div 
          onClick={() => navigate('/')}
          className="flex flex-col uppercase text-[#22d3ee] tangent-title-pulse cursor-pointer hover:opacity-80 transition-opacity"
          title="Return to Home"
        >
          <span className="text-[2rem] font-bold leading-none">TANGENT</span>
          <span className="text-[1rem] leading-none">SCIENCE FANTASY ROLEPLAY</span>
          <span className="text-[1.5rem] font-bold leading-none">OMNICORTEX</span>
        </div>

        <div className="flex items-center gap-1 ml-4 bg-[#161b22] p-1 rounded-md border border-[#0D5C63]/40">
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

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* RBAC Role Indicator Badge */}
        {currentUser && (
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border uppercase tracking-wide ${
              isAdmin 
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-sm' 
                : 'bg-slate-800/80 border-slate-600 text-slate-400'
            }`}
            title={isAdmin ? "Full write privileges active" : "Read-only access mode"}
          >
            <span>{isAdmin ? '🛡️' : '👁️'}</span>
            <span>{userRole || (isAdmin ? 'GM / Admin' : 'Player')}</span>
          </div>
        )}

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
                    toggleAdminOverride();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center justify-between border ${
                    adminOverride
                      ? 'bg-purple-950/80 border-purple-500/50 text-purple-300 hover:bg-purple-900'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Toggle Dev Admin Override mode for testing RBAC"
                >
                  <span className="flex items-center gap-1.5">
                    <span>🛠️</span>
                    <span>Dev Mode</span>
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${adminOverride ? 'bg-purple-900 text-purple-200' : 'bg-slate-900 text-slate-400'}`}>
                    {adminOverride ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              {/* Clear Cache */}
              <button
                onClick={() => {
                  handleClearCache();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2"
                title="Clear temporary database cache"
              >
                <span>🗑️</span>
                <span>Clear Cache</span>
              </button>

              {/* Master Export */}
              <button
                onClick={() => {
                  handleExportMasterJSON();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2"
                title="Export Master Database Backup"
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
                className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2 border ${
                  isAdmin 
                    ? 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-500/40 text-amber-300' 
                    : 'bg-slate-800/30 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
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

        {/* User Auth Indicator / ID Tag */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded border border-emerald-700/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Authenticated" />
              <span className="text-xs text-emerald-300 font-mono font-bold" title={currentUser.email || ''}>
                {userHandle ? `@${userHandle}` : (currentUser.displayName || currentUser.email)}
              </span>
              <button
                onClick={() => setIsSettingsOpen && setIsSettingsOpen(true)}
                className="ml-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                title="User Settings & Identity"
              >
                ⚙️
              </button>
              <button
                onClick={() => confirmLogout()}
                className="ml-1 text-[10px] text-slate-500 hover:text-red-400 font-bold uppercase tracking-wider transition-colors"
                title="Sign out"
              >
                ⏻
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-300 rounded text-xs font-bold uppercase tracking-wider transition-colors"
              title="Sign in to access Omnicortex"
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
