import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../../../context/CampaignContext';
import { AudioService } from '../../../services/audioService';
import { Database, X, Plus, Search, Trash2, ChevronRight } from 'lucide-react';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';

export const ElementsDrawer = ({ onClose }) => {
  const navigate = useNavigate();
  const { elementsCatalog, deleteSavedElement } = useStory();

  const [elementSearch, setElementSearch] = useState('');
  const [elementTypeFilter, setElementTypeFilter] = useState('All');

  const rawElements = elementsCatalog || [];
  const elementTypes = ['All', 'Species', 'Faction', 'Origin', 'Occupation', 'Location', 'Item', 'Scenario', 'Rule'];

  const filtered = rawElements.filter(elem => {
    const matchType = elementTypeFilter === 'All' || elem.type === elementTypeFilter;
    if (!matchType) return false;
    if (!elementSearch.trim()) return true;
    const q = elementSearch.toLowerCase();
    return (elem.title || '').toLowerCase().includes(q) || (elem.type || '').toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold uppercase">
              STORY FOUNDRY
            </span>
            <span className="text-slate-600 font-mono">•</span>
            <span className="text-slate-400 font-mono text-xs">DATABASE MANAGER</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-mono uppercase tracking-wide mt-0.5">
            Element Forge Catalog
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              AudioService.playTerminalBeep(1300, 0.03);
              navigate('/foundry/elements');
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg text-xs font-mono font-bold uppercase shadow transition-all flex items-center gap-1.5"
          >
            <Plus size={14} /> Open Forge
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Filter Type Pills & Search */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {elementTypes.map(t => (
            <button
              key={t}
              onClick={() => setElementTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                elementTypeFilter === t
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search elements by title or category..."
            value={elementSearch}
            onChange={(e) => setElementSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Elements Grid */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[calc(100vh-360px)]">
        {filtered.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
            <Database size={28} className="mx-auto text-slate-600 mb-2" />
            <h4 className="text-sm font-mono font-bold text-slate-300 uppercase">No Elements Found</h4>
            <p className="text-xs text-slate-500 font-mono mt-1 mb-4">Design species, factions, gear, and lore elements.</p>
            <button
              onClick={() => navigate('/foundry/elements')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase rounded-lg shadow inline-flex items-center gap-1.5"
            >
              <Plus size={13} /> Forge Elements
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filtered.map(elem => (
              <div
                key={elem.id}
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.03);
                  navigate('/foundry/elements');
                }}
                className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 hover:border-emerald-500/60 hover:bg-slate-900/60 transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-white font-mono uppercase truncate">{elem.title || 'Untitled Element'}</h4>
                    <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-mono uppercase font-bold shrink-0">
                      {elem.type || 'Element'}
                    </span>
                  </div>
                  {elem.parentPath && (
                    <span className="text-[9px] text-slate-500 font-mono block truncate">
                      Path: {elem.parentPath}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const targetName = elem.title || 'Untitled Element';
                      if (confirmTypedDeletion(targetName, (elem.type || 'story element').toLowerCase())) {
                        deleteSavedElement(elem.id);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete Element"
                  >
                    <Trash2 size={12} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      AudioService.playTerminalBeep(1200, 0.03);
                      navigate('/foundry/elements');
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <span>Edit in Forge</span>
                    <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ElementsDrawer;
