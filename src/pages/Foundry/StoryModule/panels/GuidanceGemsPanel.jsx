/**
 * @file GuidanceGemsPanel.jsx
 * @description In-Situ Guidance Gems Panel for ADE Stage and Story Workspaces.
 * Allows instant tuning of narrative style, mood, genre, and worldbuilding modifiers
 * directly within the active canvas without leaving or reloading the WebGPU stage.
 */

import React, { useState, useMemo } from 'react';
import { Sparkles, X, Check, Plus, Trash2, Search, Sliders, ChevronRight } from 'lucide-react';
import { GUIDANCE_GEMS, getMergedGems } from '../guidanceGemsConfig';
import { useStory } from '../../../../context/CampaignContext';
import { useConfirm } from '../../../../context/ConfirmContext';
import { AudioService } from '../../../../services/audioService';

export default function GuidanceGemsPanel({ onClose, isInline = false }) {
  const { universeState, updateGems, updateCreativeState } = useStory();

  const creativeState = universeState?.creativeState || { gems: [], customGems: {} };
  const activeGems = creativeState?.gems || [];
  const customGems = creativeState?.customGems || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Genre');
  const [customInputText, setCustomInputText] = useState('');
  const [customInputCategory, setCustomInputCategory] = useState('Tone');

  const mergedGems = useMemo(() => {
    return getMergedGems(customGems);
  }, [customGems]);

  const allCategories = useMemo(() => {
    return Object.keys(mergedGems);
  }, [mergedGems]);

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

  const confirm = useConfirm();

  const handleClearAllGems = async () => {
    const ok = await confirm({
      title: 'Deselect Guidance Gems',
      message: 'Are you sure you want to deselect all active guidance gems?',
      danger: true,
      confirmLabel: 'Deselect All'
    });
    if (ok) {
      AudioService.playTerminalBeep(500, 0.08);
      updateGems([]);
    }
  };

  const currentCategoryGems = useMemo(() => {
    const list = mergedGems[selectedCategory] || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(g => g.toLowerCase().includes(q));
  }, [mergedGems, selectedCategory, searchQuery]);

  return (
    <div className={`flex flex-col h-full bg-[#0a0e17] border-l border-cyan-500/30 text-slate-100 font-sans shadow-2xl z-40 select-none ${
      isInline ? 'w-full' : 'w-80 sm:w-96'
    }`}>
      {/* Header */}
      <div className="p-3 px-4 bg-[#070a10] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sparkles size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                Guidance Gems
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                {activeGems.length} Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Narrative style & world modifiers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeGems.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllGems}
              className="text-[10px] text-slate-400 hover:text-red-300 underline cursor-pointer"
            >
              Clear
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Active Gems Chips Bar */}
      {activeGems.length > 0 && (
        <div className="p-2.5 px-3 bg-slate-950/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[9px] font-mono uppercase text-amber-400 font-bold shrink-0">
            Active:
          </span>
          {activeGems.map(gem => (
            <span
              key={gem}
              onClick={() => handleToggleGem(gem)}
              className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300 text-[10px] font-mono flex items-center gap-1 shrink-0 cursor-pointer hover:bg-red-950 hover:border-red-500 hover:text-red-200 transition-colors"
              title="Click to remove"
            >
              <span>{gem}</span>
              <X size={9} />
            </span>
          ))}
        </div>
      )}

      {/* Search & Category Tabs */}
      <div className="p-2.5 border-b border-slate-800 bg-[#090d15] space-y-2 shrink-0">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gems..."
            className="w-full pl-7 pr-2 py-1 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-lg text-xs text-slate-200 placeholder-slate-600 font-mono outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {allCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1000, 0.02);
                setSelectedCategory(cat);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gems Pills Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        <div className="flex flex-wrap gap-1.5">
          {currentCategoryGems.map(gem => {
            const isActive = activeGems.includes(gem);
            const isCustom = (customGems[selectedCategory] || []).includes(gem);

            return (
              <div
                key={gem}
                onClick={() => handleToggleGem(gem)}
                className={`group px-2.5 py-1 rounded-xl text-xs font-mono cursor-pointer transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>{gem}</span>
                {isActive && <Check size={11} className="text-amber-400 shrink-0" />}
                {isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCustomGem(selectedCategory, gem);
                    }}
                    className="p-0.5 text-slate-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete custom gem"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Gem Input Footer */}
      <form onSubmit={handleAddCustomGem} className="p-3 bg-[#070a10] border-t border-slate-800 flex items-center gap-1.5 shrink-0">
        <input
          type="text"
          value={customInputText}
          onChange={(e) => setCustomInputText(e.target.value)}
          placeholder={`Add custom ${selectedCategory} gem...`}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 font-mono outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!customInputText.trim()}
          className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-300 rounded-lg text-xs font-mono font-bold uppercase transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
        >
          <Plus size={12} />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
}
