import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Maximize2, X, Cpu, Layers } from 'lucide-react';
import CodexApp from '../../../pages/Codex/CodexApp';
import { AudioService } from '../../../services/audioService';

export const CodexDrawer = ({ onClose }) => {
  const navigate = useNavigate();

  const handleOpenFullBrowser = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    navigate('/codex');
  };

  return (
    <div className="flex flex-col h-full w-full space-y-2 select-none">
      {/* Top Banner Control Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 rounded-xl border border-amber-500/50 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <BookOpen size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                CODEX MATRIX SUITE
              </h2>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold">
                14 MATRICES
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Development tools, builders, synthesizer, and matrix mechanics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenFullBrowser}
            className="px-2.5 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            title="Open Codex Matrix Suite in Full Browser View (/codex)"
          >
            <Maximize2 size={12} />
            <span className="hidden sm:inline">FULL BROWSER VIEW</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close Codex Drawer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Embedded Codex Workspace */}
      <div className="flex-1 min-h-[520px] max-h-[calc(100vh-280px)] rounded-xl border border-slate-800/90 overflow-hidden bg-[#0d1117]/95 shadow-inner">
        <CodexApp />
      </div>
    </div>
  );
};

export default CodexDrawer;
