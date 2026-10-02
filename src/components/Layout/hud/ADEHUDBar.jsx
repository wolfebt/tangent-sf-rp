import React from 'react';
import { Compass, BookOpen, Sparkles } from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import { ROUTES, isAdeLiveStudioRoute, isAdeHubRoute, isStoryFoundryRoute } from '../../../constants/routes';

export const ADEHUDBar = ({
  location,
  navigate,
  isStage
}) => {
  const pathname = location?.pathname || '';
  const isLiveStudio = isAdeLiveStudioRoute(pathname);
  const isHub = isAdeHubRoute(pathname, isStage);
  const isStoryFoundry = isStoryFoundryRoute(pathname, isStage);

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 font-mono select-none">
      <button
        type="button"
        onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate(ROUTES.FOUNDRY); }}
        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
          isHub
            ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(34,211,238,0.5)] border border-cyan-400'
            : 'bg-slate-900/80 text-cyan-300 hover:text-white hover:bg-slate-800 border border-cyan-500/50'
        }`}
        title="ADE Hub (Mission Control, Module Roster & Configuration)"
      >
        <Compass size={13} className="text-cyan-400" />
        <span>ADE HUB</span>
      </button>

      <button
        type="button"
        onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate(`${ROUTES.FOUNDRY}?view=scenarios`); }}
        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
          isStoryFoundry
            ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)] border border-purple-400'
            : 'bg-slate-900/80 text-slate-300 hover:text-purple-300 hover:bg-slate-800 border border-slate-700/60'
        }`}
        title="Story Weaver ADE (Manuscript Drafting, Beats & Outlines)"
      >
        <BookOpen size={13} className="text-purple-400" />
        <span className="hidden md:inline">WEAVER</span>
      </button>

      <button
        type="button"
        onClick={() => { AudioService.playTerminalBeep(1100, 0.02); navigate(ROUTES.FOUNDRY_LIVE_STUDIO); }}
        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
          isLiveStudio
            ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(34,211,238,0.5)] border border-cyan-400'
            : 'bg-slate-900/80 text-cyan-300 hover:text-white hover:bg-slate-800 border border-cyan-500/50'
        }`}
        title="Consolidated ADE Live Studio (Unified Live Story & Tactical Stage Platform)"
      >
        <Sparkles size={13} className="text-cyan-400" />
        <span className="hidden sm:inline">LIVE STUDIO</span>
      </button>
    </div>
  );
};
