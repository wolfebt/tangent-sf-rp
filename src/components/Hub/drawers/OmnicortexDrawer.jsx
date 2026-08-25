import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Maximize2, X, BookOpen, Layers } from 'lucide-react';
import DBMContainer from '../../DBM/DBMContainer';
import { AudioService } from '../../../services/audioService';

export const OmnicortexDrawer = ({ onClose }) => {
  const navigate = useNavigate();

  const handleOpenFullBrowser = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    navigate('/dbm');
  };

  return (
    <div className="flex flex-col h-full w-full space-y-2 select-none">
      {/* Top Banner Control Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 rounded-xl border border-emerald-500/50 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Database size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                OMNICORTEX DATABASE MANAGER
              </h2>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                ACTIVE CODEX
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Directory of species, cyberware, disciplines, and core rules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenFullBrowser}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1 transition-colors shadow-[0_0_10px_rgba(52,211,153,0.2)]"
            title="Open Omnicortex in Full Browser View (/dbm)"
          >
            <Maximize2 size={12} />
            <span className="hidden sm:inline">FULL BROWSER VIEW</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close Omnicortex Drawer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Embedded DBM Container Workspace */}
      <div className="flex-1 min-h-[520px] max-h-[calc(100vh-280px)] rounded-xl border border-slate-800/90 overflow-hidden bg-[#0d1117]/95 shadow-inner">
        <DBMContainer />
      </div>
    </div>
  );
};

export default OmnicortexDrawer;
