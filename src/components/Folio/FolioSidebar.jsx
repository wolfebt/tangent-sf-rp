import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Activity, Award, Sparkles, Shield, BookOpen, Layers } from 'lucide-react';
import { AudioService } from '../../services/audioService';

const TABS = [
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'core-stats', label: 'Core Stats', icon: Activity },
  { id: 'skills', label: 'Skills', icon: Award },
  { id: 'abilities', label: 'Abilities', icon: Sparkles },
  { id: 'combat-gear', label: 'Combat & Gear', icon: Shield },
  { id: 'narrative', label: 'Narrative', icon: BookOpen },
  { id: 'other', label: 'Other', icon: Layers }
];

const FolioSidebar = ({ activeTab, setActiveTab, charName, onOpenRoster }) => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 sm:w-72 bg-[#0a0d14]/90 backdrop-blur-xl border-r border-[#0D5C63]/50 p-3 flex flex-col h-full shrink-0 gap-2 overflow-hidden select-none relative z-20 font-sans shadow-xl">
      {/* Operative Dossier Header Banner */}
      <div className="px-2 py-1.5 border-b border-slate-800/80 shrink-0 flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={13} className="text-cyan-400" />
          FOLIO DOSSIER
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
          {TABS.length} SECTIONS
        </span>
      </div>

      {/* Tabs List */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setActiveTab(tab.id);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-200 flex items-center justify-between group border ${
                isActive
                  ? 'bg-cyan-950/40 text-cyan-200 border-cyan-500/60 shadow-[0_0_15px_rgba(34,211,238,0.2)] ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/60 text-slate-400 group-hover:text-cyan-300'
                  }`}
                >
                  <Icon size={14} />
                </div>
                <span className="truncate uppercase text-[11px] font-semibold">{tab.label}</span>
              </div>

              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          FOLIO ENGINE
        </span>
        <span className="text-slate-600">v2.0</span>
      </div>
    </aside>
  );
};

export default React.memo(FolioSidebar);
