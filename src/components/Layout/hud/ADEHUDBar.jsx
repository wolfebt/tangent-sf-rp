import React from 'react';
import { Swords, BookOpen } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const ADEHUDBar = ({
  location,
  navigate,
  isStage
}) => {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <button
        type="button"
        onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate('/stage'); }}
        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cyan-shadow-thin cursor-pointer ${
          isStage ? 'bg-amber-600 text-white' : 'bg-slate-900/80 text-amber-300 hover:text-amber-200 hover:bg-slate-800 border border-amber-500/40'
        }`}
        title="The Stage Tactical VTT"
      >
        <Swords size={13} className="text-amber-400" />
        <span className="hidden sm:inline">Stage VTT</span>
      </button>

      <button
        type="button"
        onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate('/foundry'); }}
        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cyan-shadow-thin cursor-pointer ${
          !isStage && (location.pathname.startsWith('/foundry') || location.pathname.startsWith('/ade') || location.pathname.startsWith('/story-foundry'))
            ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
            : 'bg-slate-900/80 text-slate-300 hover:text-purple-300 hover:bg-slate-800 border border-slate-700/60'
        }`}
        title="Story Foundry ADE (Story Weaver, Elements Forge, OSR Spread & Interactive Play)"
      >
        <BookOpen size={13} className="text-purple-400" />
        <span className="hidden md:inline">Story Foundry</span>
      </button>
    </div>
  );
};
