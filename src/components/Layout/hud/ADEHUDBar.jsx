import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const ADEHUDBar = ({
  location,
  navigate,
  isStage
}) => {
  const isLiveStudio = location.pathname.startsWith('/foundry/live-studio') || 
                       location.pathname.startsWith('/ade-stage') || 
                       location.pathname === '/live-studio';
  const isStoryFoundry = !isStage && !isLiveStudio && 
                         (location.pathname.startsWith('/foundry') || 
                          location.pathname.startsWith('/ade') || 
                          location.pathname.startsWith('/story-foundry'));

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <button
        type="button"
        onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate('/foundry/live-studio'); }}
        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
          isLiveStudio
            ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(34,211,238,0.5)] border border-cyan-400'
            : 'bg-slate-900/80 text-cyan-300 hover:text-white hover:bg-slate-800 border border-cyan-500/50'
        }`}
        title="Consolidated ADE Live Studio (Unified Live Story & Tactical Stage Platform)"
      >
        <Sparkles size={13} className="text-cyan-400" />
        <span>ADE LIVE STUDIO</span>
      </button>

      <button
        type="button"
        onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate('/foundry'); }}
        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
          isStoryFoundry
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
