import React, { useState, useMemo } from 'react';
import { Sparkles, X, Check, Plus, Trash2, Search, Sliders } from 'lucide-react';
import { GUIDANCE_GEMS, getMergedGems } from './guidanceGemsConfig';
import { useStory } from '../../../context/CampaignContext';
import { AudioService } from '../../../services/audioService';

export default function GuidanceGemsModal({ isOpen, onClose }) {
  const { universeState, updateGems, updateCreativeState } = useStory();

  const creativeState = universeState?.creativeState || { gems: [], customGems: {} };
  const activeGems = creativeState?.gems || [];
  const customGems = creativeState?.customGems || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [customInputText, setCustomInputText] = useState('');
  const [customInputCategory, setCustomInputCategory] = useState('Mood');

  const mergedGems = useMemo(() => {
    return getMergedGems(customGems);
  }, [customGems]);

  const allCategories = useMemo(() => {
    return Object.keys(mergedGems);
  }, [mergedGems]);

  if (!isOpen) return null;

  const handleToggleGem = (gem) => {
    AudioService.playTerminalBeep(920, 0.03);
    if (activeGems.includes(gem)) {
      updateGems(activeGems.filter(g => g !== gem));
    } else {
      updateGems([...activeGems, gem]);
    }
  };

  const handleAddCustomGem = (e) => {
    if (e) e.preventDefault();
    const val = customInputText.trim();
    if (!val) return;

    const currentCategoryCustom = customGems[customInputCategory] || [];
    if (!currentCategoryCustom.includes(val)) {
      const updatedCustom = {
        ...customGems,
        [customInputCategory]: [...currentCategoryCustom, val]
      };
      if (updateCreativeState) {
        updateCreativeState({ customGems: updatedCustom });
      }
    }

    if (!activeGems.includes(val)) {
      updateGems([...activeGems, val]);
    }

    AudioService.playTerminalBeep(1250, 0.05);
    setCustomInputText('');
  };

  const handleRemoveCustomGem = (category, gemToRemove) => {
    AudioService.playTerminalBeep(600, 0.05);
    const currentCategoryCustom = customGems[category] || [];
    const updatedCustom = {
      ...customGems,
      [category]: currentCategoryCustom.filter(g => g !== gemToRemove)
    };
    if (updateCreativeState) {
      updateCreativeState({ customGems: updatedCustom });
    }
    if (activeGems.includes(gemToRemove)) {
      updateGems(activeGems.filter(g => g !== gemToRemove));
    }
  };

  const handleClearAllGems = () => {
    if (window.confirm('Deselect all active guidance gems?')) {
      AudioService.playTerminalBeep(500, 0.08);
      updateGems([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e131f] border border-cyan-500/40 w-full max-w-4xl h-[85vh] rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Modal Header */}
        <div className="p-4 px-6 bg-[#0a0d15] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-amber-400">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-cyan-300 uppercase tracking-wider font-mono">
                  Guidance Gems
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                  {activeGems.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Select narrative style, mood, genre, and worldbuilding modifiers to steer AIME & BASTION storytelling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeGems.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllGems}
                className="text-xs text-slate-400 hover:text-red-300 underline cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-3 px-6 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gems (e.g. Gritty, Cyberpunk, First Person)..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              All ({allCategories.length})
            </button>
            {allCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Gems Quick Strip (if any selected) */}
        {activeGems.length > 0 && (
          <div className="px-6 py-2 bg-cyan-950/30 border-b border-cyan-900/40 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono shrink-0">
              Active:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeGems.map(gem => (
                <span
                  key={gem}
                  className="px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-200 border border-cyan-500/50 text-[11px] font-mono flex items-center gap-1 shadow-sm"
                >
                  <span>{gem}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleGem(gem)}
                    className="hover:text-red-400 cursor-pointer ml-0.5 text-xs leading-none"
                    title="Remove gem"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Main Gems Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {allCategories
            .filter(cat => selectedCategory === 'ALL' || selectedCategory === cat)
            .map(category => {
              const categoryGems = mergedGems[category] || [];
              const filteredGems = categoryGems.filter(g => 
                !searchQuery || g.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredGems.length === 0) return null;

              return (
                <div key={category} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{category}</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">
                      {categoryGems.length} options
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {filteredGems.map(gem => {
                      const isSelected = activeGems.includes(gem);
                      const isCustom = (customGems[category] || []).includes(gem);

                      return (
                        <div key={gem} className="inline-flex items-center">
                          <button
                            type="button"
                            onClick={() => handleToggleGem(gem)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-950 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-semibold'
                                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80'
                            }`}
                          >
                            {isSelected && <Check size={12} className="text-cyan-400 shrink-0" />}
                            <span>{gem}</span>
                          </button>

                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomGem(category, gem)}
                              className="ml-1 p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                              title={`Delete custom gem "${gem}"`}
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer: Custom Gem Creator & Done Button */}
        <div className="p-4 px-6 bg-[#0a0d15] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <form onSubmit={handleAddCustomGem} className="flex items-center gap-2 flex-1 max-w-xl">
            <select
              value={customInputCategory}
              onChange={(e) => setCustomInputCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs py-1.5 px-2.5 rounded-xl outline-none font-mono focus:border-cyan-400"
            >
              {allCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="text"
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              placeholder={`Add custom ${customInputCategory} gem...`}
              className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs py-1.5 px-3 rounded-xl outline-none placeholder-slate-500 font-mono focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={!customInputText.trim()}
              className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-300 rounded-xl text-xs font-mono font-bold uppercase transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Gem</span>
            </button>
          </form>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
