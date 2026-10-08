import React from 'react';
import { 
  Map, 
  FolderTree, 
  Cpu, 
  Download,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MAP_STUDIO_TABS = [
  { id: 'canvas', label: 'Tactical Canvas', icon: Map, badge: 'Live' },
  { id: 'assets', label: 'Asset Studio & Forge', icon: FolderTree, badge: 'Catalog' },
  { id: 'pcg', label: 'PCG & AI Co-Pilot', icon: Cpu, badge: 'Procedural' },
  { id: 'export', label: 'Universal VTT Export', icon: Download, badge: '.dd2vtt' }
];

export const MapMakerTabBar = ({ activeTab, onSelectTab, onOpenInStage }) => {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-cyan-900/50 shadow-inner select-none overflow-x-auto">
      <div className="flex items-center space-x-1.5 min-w-max">
        {MAP_STUDIO_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-cyan-600/90 text-white shadow-md shadow-cyan-950/60 border border-cyan-400/40 ring-1 ring-cyan-400/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-200' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] uppercase px-1 py-0.2 rounded font-mono ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/40'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400/80 px-2 shrink-0">
        {onOpenInStage && (
          <button
            type="button"
            onClick={onOpenInStage}
            className="px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="Open active map in STAGE Compiler (Scenarios, Triggers, Encounters & VTT)"
          >
            <Sparkles size={12} className="text-purple-400" />
            <span>Stage Compiler</span>
            <ArrowRight size={11} className="text-purple-400" />
          </button>
        )}
        <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="hidden sm:inline">CARTOGRAPHY STUDIO</span>
      </div>
    </div>
  );
};
