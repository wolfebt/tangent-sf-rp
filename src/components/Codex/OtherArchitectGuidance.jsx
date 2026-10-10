import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Cpu, 
  Plus, 
  X, 
  Compass, 
  Tag, 
  Ban, 
  Layers, 
  Zap, 
  Search,
  CheckCircle2,
  Sliders,
  Shield,
  HelpCircle,
  Boxes,
  Sparkles
} from 'lucide-react';

/**
 * Normalizes input list into an array of clean string labels.
 */
const normalizeList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(item => (typeof item === 'object' && item !== null ? (item.name || item.title || item.id || `Level ${item.level}`) : String(item))).filter(Boolean);
  }
  if (typeof val === 'number') {
    return [`Level ${val}`];
  }
  if (typeof val === 'string') {
    return val.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const CANONICAL_TL_QUICK_OPTIONS = [
  { level: 0, label: 'TL 0', title: 'Stone Age / Raw Hides, Flint Tools, Bound Bundles & Primitive Trade Bars' },
  { level: 1, label: 'TL 1', title: 'Metal Age / Cast Bronze Ingots, Preserved Rations, Linen & Coinage' },
  { level: 2, label: 'TL 2', title: 'Industrial & Atomic / Standardized Dry Rations, Battery Cells, Synthetic Fabric & Chemical Drums' },
  { level: 3, label: 'TL 3', title: 'Information & Space / Nutrient Pastes, Nanotube Wire, Universal Cartridges & Cryo-Packs' },
  { level: 4, label: 'TL 4', title: 'Fusion & Stellar / Smart-Matter Canisters, Stasis Flasks, Hyper-Density Cells & Quantum Keys' },
  { level: 5, label: 'TL 5', title: 'Cosmological / Metamaterial Filaments, Singularity Vials & Chrono-Stabilized Containers' }
];

const CANONICAL_ML_QUICK_OPTIONS = [
  { level: 0, label: 'ML 0', title: 'Mundane / Inert Physical Matter, Non-Resonant Commodities & Conventional Goods' },
  { level: 1, label: 'ML 1', title: 'Latent / Aether-Infused Minerals, Dowsing Salts & Minor Talismans' },
  { level: 2, label: 'ML 2', title: 'Awakened / Resonant Crystals, Psychic Focusing Charms & Essence Reagents' },
  { level: 3, label: 'ML 3', title: 'Adept / Spatial Distortion Pouches, Ley-Charged Batteries & Phase Silk' },
  { level: 4, label: 'ML 4', title: 'Master / Void-Stabilized Core Material, Reality Anchors & Ethereal Glass' },
  { level: 5, label: 'ML 5', title: 'Transcendent / Genesis Sparks, Chrono-Fluid & Cosmic Thread' }
];

/**
 * OtherArchitectGuidance
 * Renders recommended Tech Level (TL) and Meta Level (ML) operational thresholds,
 * plus searchable guidance keywords (+weight) and negative railguards (-weight / exclusions)
 * in Other Property / Personal Property Relations page.
 */
export const OtherArchitectGuidance = ({
  formData = {},
  handleFieldChange,
  isEditMode = false,
  onOpenPicker,
  dbData = {}
}) => {
  const [newTlInput, setNewTlInput] = useState('');
  const [newMlInput, setNewMlInput] = useState('');
  const [keywordSearch, setKeywordSearch] = useState('');
  const [negativeKeywordSearch, setNegativeKeywordSearch] = useState('');

  const recommendedTl = useMemo(() => normalizeList(formData.recommended_tl), [formData.recommended_tl]);
  const recommendedMl = useMemo(() => normalizeList(formData.recommended_ml), [formData.recommended_ml]);

  // Tech Level handlers
  const handleToggleTlOption = (optionLabel) => {
    if (!isEditMode) return;
    const exists = recommendedTl.some(t => t.toLowerCase() === optionLabel.toLowerCase() || t === optionLabel.replace('TL ', ''));
    if (exists) {
      handleFieldChange('recommended_tl', recommendedTl.filter(t => t.toLowerCase() !== optionLabel.toLowerCase() && t !== optionLabel.replace('TL ', '')));
    } else {
      handleFieldChange('recommended_tl', [...recommendedTl, optionLabel]);
    }
  };

  const handleAddTl = (e) => {
    if (e) e.preventDefault();
    const parts = newTlInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...recommendedTl];
    for (const part of parts) {
      if (!next.some(t => t.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_tl', next);
    setNewTlInput('');
  };

  const handleRemoveTl = (val) => {
    handleFieldChange('recommended_tl', recommendedTl.filter(t => t !== val));
  };

  // Meta Level handlers
  const handleToggleMlOption = (optionLabel) => {
    if (!isEditMode) return;
    const exists = recommendedMl.some(m => m.toLowerCase() === optionLabel.toLowerCase() || m === optionLabel.replace('ML ', ''));
    if (exists) {
      handleFieldChange('recommended_ml', recommendedMl.filter(m => m.toLowerCase() !== optionLabel.toLowerCase() && m !== optionLabel.replace('ML ', '')));
    } else {
      handleFieldChange('recommended_ml', [...recommendedMl, optionLabel]);
    }
  };

  const handleAddMl = (e) => {
    if (e) e.preventDefault();
    const parts = newMlInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...recommendedMl];
    for (const part of parts) {
      if (!next.some(m => m.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_ml', next);
    setNewMlInput('');
  };

  const handleRemoveMl = (val) => {
    handleFieldChange('recommended_ml', recommendedMl.filter(m => m !== val));
  };

  // Parse keyword string into array of tags
  const keywordsList = useMemo(() => {
    const raw = formData.keywords || '';
    if (Array.isArray(raw)) return raw;
    return String(raw).split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  }, [formData.keywords]);

  // Parse negative keywords string into array of tags
  const negativeKeywordsList = useMemo(() => {
    const raw = formData.negative_keywords || '';
    if (Array.isArray(raw)) return raw;
    return String(raw).split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  }, [formData.negative_keywords]);

  // Keyword additions / removals (serialized as comma-separated string)
  const handleAddKeyword = (kw) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    if (!keywordsList.some(k => k.toLowerCase() === trimmed.toLowerCase())) {
      const next = [...keywordsList, trimmed];
      handleFieldChange('keywords', next.join(', '));
    }
  };

  const handleRemoveKeyword = (kw) => {
    const next = keywordsList.filter(k => k.toLowerCase() !== kw.toLowerCase());
    handleFieldChange('keywords', next.join(', '));
  };

  const handleAddNegativeKeyword = (kw) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    if (!negativeKeywordsList.some(k => k.toLowerCase() === trimmed.toLowerCase())) {
      const next = [...negativeKeywordsList, trimmed];
      handleFieldChange('negative_keywords', next.join(', '));
    }
  };

  const handleRemoveNegativeKeyword = (kw) => {
    const next = negativeKeywordsList.filter(k => k.toLowerCase() !== kw.toLowerCase());
    handleFieldChange('negative_keywords', next.join(', '));
  };

  // Filtered keywords for searchable display
  const filteredKeywords = useMemo(() => {
    if (!keywordSearch.trim()) return keywordsList;
    return keywordsList.filter(k => k.toLowerCase().includes(keywordSearch.toLowerCase().trim()));
  }, [keywordsList, keywordSearch]);

  const filteredNegativeKeywords = useMemo(() => {
    if (!negativeKeywordSearch.trim()) return negativeKeywordsList;
    return negativeKeywordsList.filter(k => k.toLowerCase().includes(negativeKeywordSearch.toLowerCase().trim()));
  }, [negativeKeywordsList, negativeKeywordSearch]);

  return (
    <div className="space-y-6">
      {/* ── Header Banner ── */}
      <div className="p-4 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-950 border border-slate-700/60 rounded-xl relative overflow-hidden shadow-lg shadow-black/40">
        <div className="absolute right-0 top-0 w-64 h-full bg-slate-400/5 blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 mb-1">
              <Boxes size={16} className="text-slate-300" />
              <span>Omnicortex Personal Property & Other Asset Guidance</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Specify recommended Tech Level (TL) and Meta Level (ML) operational tiers for miscellaneous personal property, trade commodities, field sundries, and consumable items.
              Supply search-indexed positive directives and negative railguards to guide human operators, supply quartermasters, and BASTION AI synthesis.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-600/50 rounded-lg text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest shrink-0">
            <Package size={12} />
            <span>Property Protocol</span>
          </div>
        </div>
      </div>

      {/* ── Grid: TL & ML Guidance ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Column 1: Recommended Tech Level (TL) ── */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-500/10 border border-slate-500/30 flex items-center justify-center text-slate-300">
                  <Cpu size={14} />
                </div>
                <div>
                  <h5 className="text-xs font-mono font-bold uppercase text-slate-200">Recommended Tech Level (TL)</h5>
                  <span className="text-[10px] font-mono text-slate-400">Material grade, industrial synthesis & fabrication standards</span>
                </div>
              </div>
              {onOpenPicker && isEditMode && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({ source: 'technology', target: 'recommended_tl', label: 'Cortex Technology Picker' })}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-200 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  title="Browse Cortex Technology Datasets"
                >
                  <Compass size={11} />
                  <span>Cortex</span>
                </button>
              )}
            </div>

            {/* Quick Toggle Pills */}
            <div className="mb-3">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                <Sliders size={10} />
                <span>Canonical TL Thresholds</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {CANONICAL_TL_QUICK_OPTIONS.map(opt => {
                  const isSelected = recommendedTl.some(t => t.toLowerCase() === opt.label.toLowerCase() || t === String(opt.level));
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      disabled={!isEditMode}
                      onClick={() => handleToggleTlOption(opt.label)}
                      title={opt.title}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all text-left flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-700/60 border border-slate-400 text-slate-100 shadow-sm shadow-slate-500/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700'
                      } ${!isEditMode ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <CheckCircle2 size={10} className="text-slate-300" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active TL Tags */}
            <div className="min-h-[50px] p-2.5 bg-slate-950/90 border border-slate-800/80 rounded-lg flex flex-wrap gap-1.5 items-center">
              {recommendedTl.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-400 italic">No specific TL constraints defined (Universal Property).</span>
              ) : (
                recommendedTl.map((tlVal, idx) => (
                  <span
                    key={`${tlVal}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-600 text-slate-200 text-xs font-mono"
                  >
                    <span>{tlVal}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTl(tlVal)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove requirement"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Add Custom TL input */}
          {isEditMode && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
              <input
                type="text"
                value={newTlInput}
                onChange={(e) => setNewTlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTl(e); }}
                placeholder="Custom TL (e.g., TL 2+, Frontier Grade)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:border-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={handleAddTl}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded text-xs font-mono font-bold flex items-center gap-1 transition-colors"
              >
                <Plus size={12} />
                <span>Add</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Column 2: Recommended Meta Level (ML) ── */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Zap size={14} />
                </div>
                <div>
                  <h5 className="text-xs font-mono font-bold uppercase text-slate-200">Recommended Meta Level (ML)</h5>
                  <span className="text-[10px] font-mono text-slate-400">Aetheric resonance, psychic conductivity & esoteric purity</span>
                </div>
              </div>
              {onOpenPicker && isEditMode && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({ source: 'meta_level', target: 'recommended_ml', label: 'Cortex Meta Level Picker' })}
                  className="px-2 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  title="Browse Cortex Meta Level Datasets"
                >
                  <Compass size={11} />
                  <span>Cortex</span>
                </button>
              )}
            </div>

            {/* Quick Toggle Pills */}
            <div className="mb-3">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                <Sliders size={10} />
                <span>Canonical ML Thresholds</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {CANONICAL_ML_QUICK_OPTIONS.map(opt => {
                  const isSelected = recommendedMl.some(m => m.toLowerCase() === opt.label.toLowerCase() || m === String(opt.level));
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      disabled={!isEditMode}
                      onClick={() => handleToggleMlOption(opt.label)}
                      title={opt.title}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all text-left flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-500/20 border border-purple-500 text-purple-200 shadow-sm shadow-purple-500/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700'
                      } ${!isEditMode ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <CheckCircle2 size={10} className="text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active ML Tags */}
            <div className="min-h-[50px] p-2.5 bg-slate-950/90 border border-slate-800/80 rounded-lg flex flex-wrap gap-1.5 items-center">
              {recommendedMl.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-400 italic">No specific ML constraints defined (Mundane ML 0).</span>
              ) : (
                recommendedMl.map((mlVal, idx) => (
                  <span
                    key={`${mlVal}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs font-mono"
                  >
                    <span>{mlVal}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMl(mlVal)}
                        className="text-purple-400 hover:text-red-400 transition-colors"
                        title="Remove requirement"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Add Custom ML input */}
          {isEditMode && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
              <input
                type="text"
                value={newMlInput}
                onChange={(e) => setNewMlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddMl(e); }}
                placeholder="Custom ML (e.g., ML 1+, Ley-Infused)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:border-purple-400 outline-none"
              />
              <button
                type="button"
                onClick={handleAddMl}
                className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 rounded text-xs font-mono font-bold flex items-center gap-1 transition-colors"
              >
                <Plus size={12} />
                <span>Add</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Searchable Keywords & Railguards Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Section A: Positive Guidance Keywords (+Weight) ── */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Tag size={14} />
                </div>
                <div>
                  <h5 className="text-xs font-mono font-bold uppercase text-slate-200">Positive Guidance Keywords</h5>
                  <span className="text-[10px] font-mono text-emerald-400/90 font-semibold">+Weight in BASTION AI & Personal Property Matching</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{keywordsList.length} defined</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Searchable thematic tags and practical applications (e.g., survival ration, trade bar, luxury good, salvage, raw mineral, field consumable, electronic component, fuel cell). Elevates item resonance during character outfitting and logistics sourcing.
            </p>

            {/* Keyword Search Filter */}
            <div className="relative mb-2.5">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                placeholder="Search positive keywords..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 font-mono placeholder:text-slate-400 focus:border-emerald-500/60 outline-none"
              />
              {keywordSearch && (
                <button
                  type="button"
                  onClick={() => setKeywordSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Rendered Chips */}
            <div className="min-h-[60px] max-h-[140px] overflow-y-auto p-2.5 bg-slate-950/90 border border-slate-800/80 rounded-lg flex flex-wrap gap-1.5 items-center content-start">
              {filteredKeywords.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-400 italic">
                  {keywordsList.length === 0 ? 'No positive keywords defined yet.' : 'No keywords matching search.'}
                </span>
              ) : (
                filteredKeywords.map((kw, idx) => (
                  <span
                    key={`${kw}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-mono"
                  >
                    <span>{kw}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-emerald-400 hover:text-red-400 transition-colors"
                        title="Remove keyword"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Quick-add keyword input */}
          {isEditMode && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
              <input
                type="text"
                placeholder="Add positive keyword (comma separated)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.value.split(',').forEach(handleAddKeyword);
                    e.target.value = '';
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:border-emerald-400 outline-none"
              />
              <span className="text-[10px] font-mono text-slate-400 uppercase">Press Enter</span>
            </div>
          )}
        </div>

        {/* ── Section B: Negative Railguards (-Weight / Exclusions) ── */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Ban size={14} />
                </div>
                <div>
                  <h5 className="text-xs font-mono font-bold uppercase text-slate-200">Negative Railguards & Exclusions</h5>
                  <span className="text-[10px] font-mono text-rose-400/90 font-semibold">-Weight / Strict Exclusions in BASTION AI & Logistics</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{negativeKeywordsList.length} defined</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Searchable contraindications and prohibited traits (e.g., weaponized, motorized, cybernetic implant, hazardous waste, fragile glassware, heavy vehicle, permanent fixture). Flags incompatibilities during autonomous kit assignment and loadout synthesis.
            </p>

            {/* Negative Keyword Search Filter */}
            <div className="relative mb-2.5">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={negativeKeywordSearch}
                onChange={(e) => setNegativeKeywordSearch(e.target.value)}
                placeholder="Search negative railguards..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 font-mono placeholder:text-slate-400 focus:border-rose-500/60 outline-none"
              />
              {negativeKeywordSearch && (
                <button
                  type="button"
                  onClick={() => setNegativeKeywordSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Rendered Chips */}
            <div className="min-h-[60px] max-h-[140px] overflow-y-auto p-2.5 bg-slate-950/90 border border-slate-800/80 rounded-lg flex flex-wrap gap-1.5 items-center content-start">
              {filteredNegativeKeywords.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-400 italic">
                  {negativeKeywordsList.length === 0 ? 'No negative railguards defined.' : 'No railguards matching search.'}
                </span>
              ) : (
                filteredNegativeKeywords.map((kw, idx) => (
                  <span
                    key={`${kw}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-mono"
                  >
                    <span>{kw}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNegativeKeyword(kw)}
                        className="text-rose-400 hover:text-red-300 transition-colors"
                        title="Remove railguard"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Quick-add negative keyword input */}
          {isEditMode && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
              <input
                type="text"
                placeholder="Add negative railguard (comma separated)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.value.split(',').forEach(handleAddNegativeKeyword);
                    e.target.value = '';
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:border-rose-400 outline-none"
              />
              <span className="text-[10px] font-mono text-slate-400 uppercase">Press Enter</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Guidance Reference Footer ── */}
      <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={15} className="text-slate-400 shrink-0" />
          <span className="text-[11px] font-mono text-slate-300">
            <strong>Operator & BASTION AI Guidance:</strong> Recommended TL & ML govern supply tier availability in the Reach, while keywords and negative railguards dynamically bias autonomous inventory allocation and trade cargo generation.
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
          <Sparkles size={12} className="text-slate-400" />
          <span>Omnicortex Synced</span>
        </div>
      </div>
    </div>
  );
};
