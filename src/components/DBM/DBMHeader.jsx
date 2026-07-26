import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DBMHeader = ({
  historyIndex,
  historyLength,
  handleBack,
  handleForward,
  setIsBastionOpen,
  handleExportMasterJSON,
  handleImportMasterJSON
}) => {
  const navigate = useNavigate();
  const { currentUser, userHandle, confirmLogout, loginWithGoogle } = useAuth();
  const fileInputRef = useRef(null);

  const triggerImport = () => {
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
    <header className="bg-[#0d1117] border-b border-[#0D5C63]/50 px-6 py-2.5 flex items-center justify-between backdrop-blur-md shrink-0">
      <div className="flex items-center gap-4">
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

      <div className="flex items-center gap-3">
        {/* Master Database Actions & Clear Cache */}
        <>
          <button
            onClick={handleClearCache}
            className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 rounded text-[11px] font-bold uppercase transition-colors"
            title="Clear temporary database cache"
          >
            🗑️ Clear Cache
          </button>
          <div className="flex items-center gap-1.5 bg-[#161b22] p-1 px-2 rounded-md border border-cyan-500/30">
            <button
              onClick={handleExportMasterJSON}
              className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[11px] font-bold uppercase transition-colors flex items-center gap-1"
              title="Export Master Database Backup"
            >
              <span>💾</span> Master Export
            </button>
            <button
              onClick={triggerImport}
              className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-amber-300 rounded text-[11px] font-bold uppercase transition-colors flex items-center gap-1"
              title="Import Master Database Backup"
            >
              <span>📂</span> Master Import
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportMasterJSON}
              accept=".json"
              className="hidden"
            />
          </div>
        </>

        {/* User Auth Indicator / ID Tag */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded border border-emerald-700/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Authenticated" />
              <span className="text-xs text-emerald-300 font-mono font-bold" title={currentUser.email || ''}>
                {userHandle ? `@${userHandle}` : (currentUser.displayName || currentUser.email)}
              </span>
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
              title="Sign in to enable saving"
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
              Sign In to Save
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

