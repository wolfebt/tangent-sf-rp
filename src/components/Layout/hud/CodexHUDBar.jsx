import React from 'react';
import { Globe, BookOpen } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const CodexHUDBar = ({ navigate }) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="px-2 py-0.5 bg-purple-950/60 border border-purple-500/40 rounded-md text-[11px] font-mono text-purple-300 font-bold uppercase hidden sm:flex items-center gap-1.5 cyan-shadow-thin">
        <BookOpen size={12} className="text-purple-400" />
        <span>RULES CODEX</span>
      </div>
      <button
        type="button"
        onClick={() => {
          AudioService.playTerminalBeep(1100, 0.03);
          navigate('/dbm');
        }}
        className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/60 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 cyan-shadow-thin"
        title="Switch from Rules Codex to Omnicortex Database"
      >
        <Globe size={13} className="text-cyan-400" />
        <span className="hidden sm:inline">Omnicortex DB</span>
      </button>
    </div>
  );
};
