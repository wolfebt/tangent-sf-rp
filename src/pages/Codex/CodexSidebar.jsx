import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CODEX_MATRICES } from './codexConfig';
import { useDBM } from '../../context/DBMContext';
import { Search, Sparkles, BookOpen } from 'lucide-react';
import { AudioService } from '../../services/audioService';

export const CodexSidebar = ({ activeMatrixId, onSelectMatrix }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { dbData } = useDBM() || {};

  // Filter matrices by user search query
  const filteredMatrices = CODEX_MATRICES.filter(m => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.label.toLowerCase().includes(term) ||
      m.description.toLowerCase().includes(term) ||
      m.category.toLowerCase().includes(term)
    );
  });

  return (
    <aside className="w-64 sm:w-72 h-full bg-[#0a0d14]/90 backdrop-blur-xl border-r border-[#0D5C63]/50 flex flex-col shrink-0 p-3 gap-2 overflow-hidden select-none relative z-20 font-sans shadow-xl">
      {/* Header Banner Subtitle */}
      <div className="px-1 py-1 shrink-0 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={12} className="text-amber-400" />
            CODEX MATRICES
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
            12 Matrices
          </span>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative shrink-0 my-1">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter matrices..."
          className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/70 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors shadow-inner"
        />
        <Search size={13} className="absolute left-2.5 top-2 text-slate-500" />
      </div>

      {/* Matrix List Menu */}
      <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto pr-1">
        {filteredMatrices.map((matrix) => {
          const isActive = matrix.id === activeMatrixId;
          const Icon = matrix.icon;
          
          // Compute item count from Omnicortex database collections
          const primaryCollection = dbData?.[matrix.targetCollection] || [];
          const altCollection = matrix.altCollection ? (dbData?.[matrix.altCollection] || []) : [];
          const count = primaryCollection.length + (matrix.id === 'modular-characters' || matrix.id === 'planetary-design' ? 0 : 0);

          return (
            <button
              key={matrix.id}
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                onSelectMatrix(matrix.id);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-200 flex items-center justify-between group border ${
                isActive
                  ? 'bg-amber-950/40 text-amber-200 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30'
                  : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/70 hover:border-slate-700'
              }`}
              title={matrix.description}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800/60 text-slate-400 group-hover:text-amber-300'
                  }`}
                  style={{ color: isActive ? matrix.color : undefined }}
                >
                  <Icon size={14} />
                </div>
                <span className="truncate uppercase text-[11px] font-semibold">{matrix.name}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold transition-colors ${
                    isActive 
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-cyan-300'
                  }`}>
                    {count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          OMNICORTEX SYNC
        </span>
        <span className="text-slate-600">v2.0</span>
      </div>
    </aside>
  );
};

export default CodexSidebar;
