import React from 'react';
import { Globe, BookOpen, Cloud, Columns } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const CompendiumHUDBar = ({
  location,
  navigate,
  isAdmin,
  syncCanonicalCompendium,
  handleOpenGuide
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-sky-500/40 text-[10px] font-mono cyan-shadow-thin">
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            navigate('/compendium?tab=rules');
          }}
          className={`px-2 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
            !location.search.includes('tab=omnicortex') && !location.search.includes('tab=split')
              ? 'bg-sky-950 text-sky-300 border border-sky-500/60'
              : 'text-slate-400 hover:text-sky-300'
          }`}
          title="Switch to Game Rules"
        >
          <BookOpen size={11} />
          <span>Rules</span>
        </button>
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            navigate('/compendium?tab=omnicortex');
          }}
          className={`px-2 py-0.5 rounded font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer ${
            location.search.includes('tab=omnicortex')
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
          title="Switch to Omnicortex Asset Catalog"
        >
          <Globe size={11} />
          <span>Omnicortex</span>
        </button>
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            navigate('/compendium?tab=split');
          }}
          className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer ${
            location.search.includes('tab=split')
              ? 'bg-purple-950 text-purple-300 border border-purple-500/60'
              : 'text-slate-400 hover:text-purple-300'
          }`}
          title="Switch to Side-by-Side Split Reference"
        >
          <Columns size={11} />
          <span>Split</span>
        </button>
      </div>

      {/* User Guide */}
      <button
        type="button"
        onClick={() => handleOpenGuide?.('dbm')}
        className="px-2 sm:px-2.5 py-1 bg-[#161b22] hover:bg-slate-800 border border-sky-500/40 text-sky-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer cyan-shadow-thin"
        title="Compendium User Guide"
      >
        <BookOpen size={13} className="text-sky-400" />
        <span className="hidden sm:inline">Guide</span>
      </button>

      {/* Sync Compendium to Cloud (Admin) */}
      {isAdmin && syncCanonicalCompendium && (
        <button
          type="button"
          onClick={syncCanonicalCompendium}
          className="px-2 sm:px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-400 text-sky-200 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer cyan-shadow-thin"
          title="Sync Canonical Compendium to Cloud"
        >
          <Cloud size={13} className="text-sky-400" />
          <span className="hidden sm:inline">Sync Cloud</span>
        </button>
      )}
    </div>
  );
};
