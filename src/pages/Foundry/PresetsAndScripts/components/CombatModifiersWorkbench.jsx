/**
 * @file CombatModifiersWorkbench.jsx
 * @description Pillar 3: Situational Combat Modifiers Workbench.
 * Manages tactical combat modifiers, environmental condition overlays, and stat penalties/bonuses
 * active on the VTT stage, with support for asset source linking and 1-click preset deployment.
 */

import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Shield, 
  Swords, 
  Flame, 
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { MODIFIER_PRESETS } from '../../../../services/modifierService';
import { AudioService } from '../../../../services/audioService';

export const CombatModifiersWorkbench = ({
  galleryModifiers = [],
  onAddModifier,
  onUpdateModifier,
  onDeleteModifier,
  onToggleModifier,
  selectedAsset = null
}) => {
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredModifiers = useMemo(() => {
    if (filterCategory === 'all') return galleryModifiers;
    return galleryModifiers.filter(m => m.category === filterCategory);
  }, [galleryModifiers, filterCategory]);

  const handleApplyPreset = (preset) => {
    AudioService.playTerminalBeep(1200, 0.03);
    onAddModifier?.({
      ...preset,
      isActive: true,
      appliedAt: new Date().toISOString(),
      sourceAssetId: selectedAsset?.id || null,
      sourceAssetName: selectedAsset?.title || null
    });
  };

  return (
    <div className="h-full flex flex-col gap-4 font-sans select-none text-slate-100 overflow-y-auto pr-1">
      {/* ── TOP ACTION & CATEGORY BAR ── */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sliders size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Situational Combat Modifiers
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
                {galleryModifiers.length} Deployed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Stat modifications and tactical conditions active during live combat rounds on the Stage.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center flex-wrap gap-1.5">
          {['all', 'metaphysic', 'tech', 'environmental', 'tactical'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setFilterCategory(cat);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── CANONICAL PRESETS TILES (Click to Deploy) ── */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-md space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Canonical Presets Catalog (Click to Deploy)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODIFIER_PRESETS.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                    {preset.name}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {preset.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{preset.description}</p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                <span>{preset.effects?.customRuleText || 'Stat modifier'}</span>
                <span className="text-amber-400 text-[9px] uppercase font-bold">+ Deploy</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CURRENTLY DEPLOYED MODIFIERS DECK ── */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <Sparkles size={14} />
            <span>Active Module Modifiers ({filteredModifiers.length})</span>
          </h3>
        </div>

        {filteredModifiers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono bg-slate-950/40 rounded-xl border border-slate-800/60">
            No modifiers currently deployed for this category. Click any preset above to deploy into this module.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredModifiers.map(mod => (
              <div
                key={mod.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-amber-200">{mod.name}</span>
                    <button
                      type="button"
                      onClick={() => onToggleModifier?.(mod.id)}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full border cursor-pointer ${
                        mod.isActive 
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' 
                          : 'bg-slate-900 text-slate-500 border-slate-700'
                      }`}
                    >
                      {mod.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{mod.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono">
                  <span className="text-cyan-400">{mod.effects?.customRuleText || ''}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteModifier?.(mod.id)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Remove modifier"
                  >
                    <Trash2 size={13} />
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

export default CombatModifiersWorkbench;
