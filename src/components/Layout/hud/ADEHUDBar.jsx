import React from 'react';
import { Sparkles, Brain } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const ADEHUDBar = ({
  location,
  navigate
}) => {
  const pathname = location?.pathname || '';
  const isAimeActive = pathname.includes('/aime');

  return (
    <div className="flex items-center gap-1.5 font-mono select-none">
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1200, 0.03);
          navigate('/foundry/aime');
        }}
        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
          isAimeActive
            ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_14px_rgba(168,85,247,0.5)] border border-cyan-300'
            : 'bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/70 hover:from-purple-900/90 hover:to-cyan-900/90 text-purple-200 hover:text-white border border-purple-500/50 hover:border-cyan-400 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
        }`}
        title="AIME Creative Engine (AI Prose Weaver, World Architect & Co-Pilot)"
      >
        <Sparkles size={14} className={isAimeActive ? 'text-cyan-200 animate-spin' : 'text-purple-400'} />
        <span className="font-extrabold tracking-widest">AIME</span>
        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/50 text-cyan-300 border border-cyan-500/40 font-mono hidden sm:inline">
          AI ENGINE
        </span>
      </button>
    </div>
  );
};

export default ADEHUDBar;
