import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../../../context/CampaignContext';
import { useFolio } from '../../../context/FolioContext';
import { Users, BookOpen, Database, Map, Shield, Play, ArrowUpRight, X } from 'lucide-react';

export const CommandOverview = ({ onOpenDrawer, onClose }) => {
  const navigate = useNavigate();
  const { universeState, elementsCatalog, mapsCatalog } = useStory();
  const { personaRoster, roster } = useFolio();

  const operativeCount = (personaRoster || roster || []).length;
  const scenarioCount = universeState?.scenarios?.length || 0;
  const mapCount = (mapsCatalog?.length || 0) + (universeState?.maps?.length || 0);
  const elementCount = elementsCatalog?.length || 0;

  return (
    <div className="flex flex-col justify-between h-full space-y-4 select-none">
      <div>
        {/* Status Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-cyan-950/30 border border-slate-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
              SYSTEM TELEMETRY • OPERATIONAL
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-mono text-white">
              TACTICAL COMMAND OVERVIEW
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Select a module or sub-catalog on the left navigation to inspect operatives, campaign trees, or battlemaps in-place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Shield size={20} />
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Close Overview"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div 
            onClick={() => onOpenDrawer('persona-folio')}
            className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-400/60 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <Users size={16} className="text-cyan-400" />
              <ArrowUpRight size={12} className="text-slate-500 group-hover:text-cyan-300 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-xl font-black font-mono text-white mt-2">
              {operativeCount}
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Operatives
            </span>
          </div>

          <div 
            onClick={() => onOpenDrawer('foundry-scenarios')}
            className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-purple-400/60 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <BookOpen size={16} className="text-purple-400" />
              <ArrowUpRight size={12} className="text-slate-500 group-hover:text-purple-300 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-xl font-black font-mono text-white mt-2">
              {scenarioCount}
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Scenarios
            </span>
          </div>

          <div 
            onClick={() => onOpenDrawer('foundry-maps')}
            className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-400/60 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <Map size={16} className="text-cyan-400" />
              <ArrowUpRight size={12} className="text-slate-500 group-hover:text-cyan-300 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-xl font-black font-mono text-white mt-2">
              {mapCount}
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Battlemaps
            </span>
          </div>

          <div 
            onClick={() => onOpenDrawer('foundry-elements')}
            className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-emerald-400/60 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <Database size={16} className="text-emerald-400" />
              <ArrowUpRight size={12} className="text-slate-500 group-hover:text-emerald-300 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-xl font-black font-mono text-white mt-2">
              {elementCount}
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Elements
            </span>
          </div>
        </div>

        {/* Active Campaign Deployment Summary */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
              Active Tactical Briefing
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {universeState?.projectName || 'Tangent Universe'}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-sans mt-2.5 leading-relaxed">
            {universeState?.description || 'Build your roleplay universe using interactive scenarios, tactical combat grids, and persona folios.'}
          </p>
        </div>
      </div>

      {/* Quick Launch Action Bar */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Core Engines Ready</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDrawer('persona-folio')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold uppercase rounded-lg border border-slate-700 transition-colors"
          >
            Browse Operatives
          </button>
          <button
            onClick={() => navigate('/foundry/map-maker')}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold uppercase rounded-lg shadow transition-colors flex items-center gap-1.5"
          >
            <Play size={12} fill="currentColor" /> Enter VTT
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommandOverview;
