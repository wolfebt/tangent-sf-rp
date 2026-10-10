import React, { useState, useMemo } from 'react';
import { 
  Bot, 
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
  Sliders
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
  { level: 0, label: 'TL 0', title: 'Stone Age / Beast-Drawn Carts & Muscle-Powered Frames' },
  { level: 1, label: 'TL 1', title: 'Metal Age / Steam Walkers, Ironclads & Clockwork Carriages' },
  { level: 2, label: 'TL 2', title: 'Data Age / Internal Combustion Tanks & Motorized APCs' },
  { level: 3, label: 'TL 3', title: 'Space Age / Standard Bipedal Combat Walkers & Hovercraft' },
  { level: 4, label: 'TL 4', title: 'Stellar Age / Advanced Jump-Jet Frames & Grav-Tanks' },
  { level: 5, label: 'TL 5', title: 'Cosmological / Nanite War-Titans & Interdimensional Chassis' }
];

const CANONICAL_ML_QUICK_OPTIONS = [
  { level: 0, label: 'ML 0', title: 'Dormant / Purely Mechanical & Fusion-Powered Chassis' },
  { level: 1, label: 'ML 1', title: 'Latent / Attuned Control Cocoon / Psi-Resonant Plating' },
  { level: 2, label: 'ML 2', title: 'Manifested / Aether-Drive Propulsion & Kinetic Shields' },
  { level: 3, label: 'ML 3', title: 'Adept / Metaphysical Grav-Loom Warping' },
  { level: 4, label: 'ML 4', title: 'Master / Conduit / Warp-Phasing Battle Frame' },
  { level: 5, label: 'ML 5', title: 'Transcendent / Ascendant Conceptual Colossus' }
];

/**
 * MechaArchitectGuidance
 * Renders recommended Tech Level (TL) and Meta Level (ML) operational thresholds,
 * plus searchable guidance keywords (+weight) and negative railguards (-weight / exclusions)
 * in Mecha Studio / Heavy Frame Relations page.
 */
export const MechaArchitectGuidance = ({
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

  // Keywords & Negative Keywords (Directives / Railguards)
  const keywordsList = useMemo(() => {
    if (!formData.keywords) return [];
    if (Array.isArray(formData.keywords)) return formData.keywords;
    return String(formData.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean);
  }, [formData.keywords]);

  const negativeKeywordsList = useMemo(() => {
    if (!formData.negative_keywords) return [];
    if (Array.isArray(formData.negative_keywords)) return formData.negative_keywords;
    return String(formData.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean);
  }, [formData.negative_keywords]);

  // Search filtered keywords
  const filteredKeywords = useMemo(() => {
    if (!keywordSearch.trim()) return keywordsList;
    const q = keywordSearch.toLowerCase();
    return keywordsList.filter(k => k.toLowerCase().includes(q));
  }, [keywordsList, keywordSearch]);

  const filteredNegativeKeywords = useMemo(() => {
    if (!negativeKeywordSearch.trim()) return negativeKeywordsList;
    const q = negativeKeywordSearch.toLowerCase();
    return negativeKeywordsList.filter(k => k.toLowerCase().includes(q));
  }, [negativeKeywordsList, negativeKeywordSearch]);

  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [newNegativeInput, setNewNegativeInput] = useState('');

  const handleAddKeyword = (e) => {
    if (e) e.preventDefault();
    const parts = newKeywordInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = keywordsList;
    const updated = [...current];
    for (const p of parts) {
      if (!updated.some(k => k.toLowerCase() === p.toLowerCase())) {
        updated.push(p);
      }
    }
    handleFieldChange('keywords', updated.join(', '));
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (tagToRemove) => {
    const updated = keywordsList.filter(k => k.toLowerCase() !== tagToRemove.toLowerCase());
    handleFieldChange('keywords', updated.join(', '));
  };

  const handleAddNegativeKeyword = (e) => {
    if (e) e.preventDefault();
    const parts = newNegativeInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = negativeKeywordsList;
    const updated = [...current];
    for (const p of parts) {
      if (!updated.some(k => k.toLowerCase() === p.toLowerCase())) {
        updated.push(p);
      }
    }
    handleFieldChange('negative_keywords', updated.join(', '));
    setNewNegativeInput('');
  };

  const handleRemoveNegativeKeyword = (tagToRemove) => {
    const updated = negativeKeywordsList.filter(k => k.toLowerCase() !== tagToRemove.toLowerCase());
    handleFieldChange('negative_keywords', updated.join(', '));
  };

  return (
    <div className="space-y-6 pt-2 animate-fade-in">
      {/* ── Guidance Header Banner ── */}
      <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-900/60 border border-amber-500/50 flex items-center justify-center text-amber-300 shrink-0 shadow-md">
            <Bot size={20} className="text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-amber-900/80 text-amber-200 border border-amber-500/40">
                BASTION v2.4
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                Mecha Architect Relations
              </span>
            </div>
            <h3 className="text-sm font-mono font-bold text-white mt-0.5">
              Chassis, Frame & Operational Environment Guidance
            </h3>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Define compatible Tech Level (TL) and Meta Level (ML) operational eras, along with tactical AI directives and negative railguards for combat walkers, vehicles, and mobile armors.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-amber-300/90 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-xl shrink-0">
          Cortex Dynamic Register
        </div>
      </div>

      {/* ── Operational Era & Resonance Recommendations (TL & ML) ── */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            <Layers size={14} className="text-amber-400" />
            <span>Operational Era & Metaphysical Resonance</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Cortex Tech Level (TL) & Meta Level (ML) Integration
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recommended Tech Level (TL) */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
                <Bot size={14} />
                <span>Recommended Tech Level (TL)</span>
              </label>
              {onOpenPicker && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({ source: 'technology', target: 'recommended_tl', label: 'Recommended Tech Level' })}
                  className="px-2 py-0.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Compass size={10} />
                  <span>Cortex Picker</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-snug">
              Select or assign the era classifications where this chassis operates (e.g. TL 3 Combat Walkers, TL 4 Grav-Tanks, TL 5 Nanite War-Titans).
            </p>

            {/* Quick Toggle Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CANONICAL_TL_QUICK_OPTIONS.map(opt => {
                const isSelected = recommendedTl.some(t => t.toLowerCase() === opt.label.toLowerCase() || t === String(opt.level));
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleToggleTlOption(opt.label)}
                    title={opt.title}
                    disabled={!isEditMode}
                    className={`px-2 py-1 rounded-lg text-xs font-mono border transition-all ${
                      isSelected
                        ? 'bg-amber-950 text-amber-200 border-amber-400 shadow-sm'
                        : isEditMode
                          ? 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-amber-500/50 hover:text-amber-200 cursor-pointer'
                          : 'bg-slate-950/40 text-slate-600 border-slate-850 cursor-default'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="ml-1 text-amber-300">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Current Active Tags Display */}
            <div className="flex flex-wrap gap-1.5 pt-1 min-h-[30px]">
              {recommendedTl.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  Non-Restricted / Any TL (Universal Chassis Calibration)
                </span>
              ) : (
                recommendedTl.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 border border-amber-500/40 text-amber-200 rounded-lg text-xs font-mono"
                  >
                    <span>{item}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTl(item)}
                        className="text-amber-400 hover:text-amber-100 cursor-pointer"
                        title={`Remove ${item}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {/* Custom Input */}
            {isEditMode && (
              <form onSubmit={handleAddTl} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newTlInput}
                  onChange={(e) => setNewTlInput(e.target.value)}
                  placeholder="Add custom TL (e.g. TL 3-4, TL 5+)..."
                  className="flex-1 p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!newTlInput.trim()}
                  className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-mono font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Recommended Meta Level (ML) */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase">
                <Zap size={14} />
                <span>Recommended Meta Level (ML)</span>
              </label>
              {onOpenPicker && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({ source: 'meta_level', target: 'recommended_ml', label: 'Recommended Meta Level' })}
                  className="px-2 py-0.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Compass size={10} />
                  <span>Cortex Picker</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-snug">
              Set psionic and metaphysical attunement tiers (ML 0 for purely secular fusion engines; ML 1+ for aether-drives, resonant hulls, or warp-shifters).
            </p>

            {/* Quick Toggle Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CANONICAL_ML_QUICK_OPTIONS.map(opt => {
                const isSelected = recommendedMl.some(m => m.toLowerCase() === opt.label.toLowerCase() || m === String(opt.level));
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleToggleMlOption(opt.label)}
                    title={opt.title}
                    disabled={!isEditMode}
                    className={`px-2 py-1 rounded-lg text-xs font-mono border transition-all ${
                      isSelected
                        ? 'bg-purple-950 text-purple-200 border-purple-400 shadow-sm'
                        : isEditMode
                          ? 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-purple-500/50 hover:text-purple-200 cursor-pointer'
                          : 'bg-slate-950/40 text-slate-600 border-slate-850 cursor-default'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="ml-1 text-purple-300">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Current Active Tags Display */}
            <div className="flex flex-wrap gap-1.5 pt-1 min-h-[30px]">
              {recommendedMl.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  Non-Resonant / Any ML (Standard Secular Chassis)
                </span>
              ) : (
                recommendedMl.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/60 border border-purple-500/40 text-purple-200 rounded-lg text-xs font-mono"
                  >
                    <span>{item}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMl(item)}
                        className="text-purple-400 hover:text-purple-100 cursor-pointer"
                        title={`Remove ${item}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {/* Custom Input */}
            {isEditMode && (
              <form onSubmit={handleAddMl} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newMlInput}
                  onChange={(e) => setNewMlInput(e.target.value)}
                  placeholder="Add custom ML (e.g. ML 0-1, ML 2+)..."
                  className="flex-1 p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={!newMlInput.trim()}
                  className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-mono font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── AI Directives & Negative Railguards ── */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            <Tag size={14} className="text-amber-400" />
            <span>AI Guidance Directives & Negative Railguards</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Open User Entry • Fully Searchable in Cortex & Vector RAG
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive Keywords */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                <Tag size={14} />
                <span>Search Keywords & Positive Directives</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                +Weight in BASTION AI & RAG
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-snug">
              Open terms that reinforce this chassis in tactical unit rosters, squad support roles (scout walker, siege platform, assault frame), and semantic search.
            </p>

            {/* Keyword Search / Filter Bar */}
            {keywordsList.length > 0 && (
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  placeholder="Search existing keywords..."
                  className="w-full pl-7 pr-7 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
                />
                {keywordSearch && (
                  <button
                    type="button"
                    onClick={() => setKeywordSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 min-h-[30px]">
              {keywordsList.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  No keywords assigned. Enter open terms below.
                </span>
              ) : filteredKeywords.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  No keywords match "{keywordSearch}".
                </span>
              ) : (
                filteredKeywords.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 rounded-lg text-xs font-mono"
                  >
                    <span>{tag}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(tag)}
                        className="text-emerald-400 hover:text-emerald-100 cursor-pointer"
                        title={`Remove ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {isEditMode && (
              <form onSubmit={handleAddKeyword} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  placeholder="Type keywords (e.g. bipedal, heavy armor, jump thrusters, siege tank, assault frame)..."
                  className="flex-1 p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!newKeywordInput.trim()}
                  className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-mono font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Negative Keywords & Railguards */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase">
                <Ban size={14} />
                <span>Negative Railguards & Disfavored Contexts</span>
              </label>
              <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-950/80 border border-rose-500/30 px-2 py-0.5 rounded">
                -Weight / Strict Exclusions
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-snug">
              Railguards preventing the AI or operator from allocating this chassis in stealth infantry, indoor/cramped missions, or incompatible operational doctrines.
            </p>

            {/* Negative Keyword Search / Filter Bar */}
            {negativeKeywordsList.length > 0 && (
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={negativeKeywordSearch}
                  onChange={(e) => setNegativeKeywordSearch(e.target.value)}
                  placeholder="Search existing railguards..."
                  className="w-full pl-7 pr-7 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono focus:outline-none focus:border-rose-500"
                />
                {negativeKeywordSearch && (
                  <button
                    type="button"
                    onClick={() => setNegativeKeywordSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 min-h-[30px]">
              {negativeKeywordsList.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  No negative railguards defined. Enter disfavored terms below.
                </span>
              ) : filteredNegativeKeywords.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  No railguards match "{negativeKeywordSearch}".
                </span>
              ) : (
                filteredNegativeKeywords.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-lg text-xs font-mono"
                  >
                    <span>{tag}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNegativeKeyword(tag)}
                        className="text-rose-400 hover:text-rose-100 cursor-pointer"
                        title={`Remove ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {isEditMode && (
              <form onSubmit={handleAddNegativeKeyword} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newNegativeInput}
                  onChange={(e) => setNewNegativeInput(e.target.value)}
                  placeholder="Type railguards (e.g. stealth infiltration, cramped interior, unarmored, primitive, unpiloted)..."
                  className="flex-1 p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  disabled={!newNegativeInput.trim()}
                  className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-mono font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
