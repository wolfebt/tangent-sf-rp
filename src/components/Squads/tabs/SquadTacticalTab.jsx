import React from 'react';
import { Map, Play } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const SquadTacticalTab = ({
  activeGroup,
  navigate
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-950 border border-amber-500/40 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Map size={14} />
              <span>THE STAGE • TACTICAL DEPLOYMENT VIEWPORT</span>
            </span>
            <h2 className="text-xl font-bold font-mono text-white">
              {activeGroup ? `${activeGroup.name} VTT Operations` : 'Tactical Battlemap Synchronizer'}
            </h2>
            <p className="text-xs text-slate-300 font-sans max-w-xl">
              Synchronize team token coordinates, initiative logs, line-of-sight fog-of-war, and live dice resolution across all active players in this squad.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1400, 0.05);
              navigate('/stage');
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play size={14} />
            <span>LAUNCH THE STAGE</span>
          </button>
        </div>

        {/* Tactical Status Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-500/20 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">BOUND CAMPAIGN</span>
            <span className="text-amber-300 font-bold">
              {activeGroup?.campaignTitle || 'None Selected (Freeform)'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">SYNCHRONIZED OPERATORS</span>
            <span className="text-emerald-300 font-bold">
              {activeGroup?.members?.length || 0} Ready for Combat
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">TACTICAL LATENCY</span>
            <span className="text-cyan-300 font-bold">
              TERRAN-NET QUANTUM MESH (&lt; 24ms)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
