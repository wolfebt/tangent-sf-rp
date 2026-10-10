import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Cpu, 
  Plus, 
  X, 
  Compass, 
  Tag, 
  ShieldAlert, 
  Ban, 
  Layers, 
  Zap, 
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
  { level: 0, label: 'TL 0', title: 'Stone Age / Primitive' },
  { level: 1, label: 'TL 1', title: 'Metal Age / Industrial' },
  { level: 2, label: 'TL 2', title: 'Data Age / Digital' },
  { level: 3, label: 'TL 3', title: 'Space Age / Stellar' },
  { level: 4, label: 'TL 4', title: 'Stellar Age / Galactic' },
  { level: 5, label: 'TL 5', title: 'Cosmological / Singularity' }
];

const CANONICAL_ML_QUICK_OPTIONS = [
  { level: 0, label: 'ML 0', title: 'Dormant / Mundane' },
  { level: 1, label: 'ML 1', title: 'Latent / Awakening' },
  { level: 2, label: 'ML 2', title: 'Manifested / Awakened' },
  { level: 3, label: 'ML 3', title: 'Adept / Resonant' },
  { level: 4, label: 'ML 4', title: 'Master / Conduit' },
  { level: 5, label: 'ML 5', title: 'Transcendent / Ascendant' }
];

/**
 * GearArchitectGuidance
 * Renders recommended Tech Level (TL) and Meta Level (ML) operational thresholds,
 * plus guidance keywords (+weight) and negative railguards (-weight / exclusions)
 * in Gear Studio / Equipment Relations page.
 */
export const GearArchitectGuidance = ({
  formData = {},
  handleFieldChange,
  isEditMode = false,
  onOpenPicker,
  dbData = {}
}) => {
  const [newTlInput, setNewTlInput] = useState('');
  const [newMlInput, setNewMlInput] = useState('');

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
      <div className="p-4 bg-slate-900/80 border border-slate-700/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-600/50 flex items-center justify-center text-slate-300 shrink-0 shadow-md">
            <Package size={20} className="text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-600/40">
                BASTION v2.4
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">
                Gear Architect Relations
              </span>
            </div>
            <h3 className="text-sm font-mono font-bold text-white mt-0.5">
              Operational Calibrations & Hardware Guidance
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Define compatible Tech Level (TL) and Meta Level (ML) operational eras, along with AI directives and negative railguards for character equipment loadouts.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-300/80 bg-slate-800/60 border border-slate-600/40 px-3 py-1.5 rounded-xl shrink-0">
          Cortex Dynamic Register
        </div>
      </div>

      {/* ── Operational Era & Resonance Recommendations (TL & ML) ── */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            <Layers size={14} className="text-slate-400" />
            <span>Operational Era & Resonance Recommendations (TL & ML)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Pulls from Cortex Compendium
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Recommended Tech Level (TL) */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-slate-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Recommended Tech Level (TL)
                </span>
              </div>

              {isEditMode && onOpenPicker && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({
                    source: 'technology',
                    target: 'recommended_tl',
                    label: 'Recommended Tech Levels (TL)'
                  })}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-slate-200 rounded text-[11px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                  title="Browse Cortex Technology database"
                >
                  <Compass size={12} />
                  <span>Browse Cortex</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-snug">
              Specifies the technological sophistication eras where this equipment item functions reliably (TL 0 Archaic to TL 5 Cosmological).
            </p>

            {/* Quick Toggle Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CANONICAL_TL_QUICK_OPTIONS.map((opt) => {
                const isSelected = recommendedTl.some(t => t.toLowerCase() === opt.label.toLowerCase() || t === String(opt.level) || t === `TL ${opt.level}`);
                return (
                  <button
                    key={opt.level}
                    type="button"
                    disabled={!isEditMode}
                    onClick={() => handleToggleTlOption(opt.label)}
                    title={opt.title}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all border ${
                      isSelected
                        ? 'bg-slate-800 text-slate-100 border-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.3)]'
                        : isEditMode
                          ? 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200 cursor-pointer'
                          : 'bg-slate-950/40 text-slate-600 border-slate-850 cursor-default'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="ml-1 text-slate-300">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Current Active Tags Display */}
            <div className="flex flex-wrap gap-1.5 pt-1 min-h-[30px]">
              {recommendedTl.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  Universal / Era Agnostic (No strict TL bounds)
                </span>
              ) : (
                recommendedTl.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-600/50 text-slate-200 rounded-lg text-xs font-mono"
                  >
                    <span>{item}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTl(item)}
                        className="text-slate-400 hover:text-slate-100 cursor-pointer"
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
                  placeholder="Add custom TL (e.g. TL 3+, TL 4-5)..."
                  className="flex-1 p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-400"
                />
                <button
                  type="submit"
                  disabled={!newTlInput.trim()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-slate-200 rounded-xl text-xs font-mono font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>

          {/* 2. Recommended Meta Level (ML) */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-slate-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Recommended Meta Level (ML)
                </span>
              </div>

              {isEditMode && onOpenPicker && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({
                    source: 'meta_level',
                    target: 'recommended_ml',
                    label: 'Recommended Meta Levels (ML)'
                  })}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-slate-200 rounded text-[11px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                  title="Browse Cortex Meta Level database"
                >
                  <Compass size={12} />
                  <span>Browse Cortex</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-snug">
              Specifies the psychic, arcane, or reality-warping frequency resonance of this equipment (ML 0 Mundane to ML 5 Transcendent).
            </p>

            {/* Quick Toggle Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CANONICAL_ML_QUICK_OPTIONS.map((opt) => {
                const isSelected = recommendedMl.some(m => m.toLowerCase() === opt.label.toLowerCase() || m === String(opt.level) || m === `ML ${opt.level}`);
                return (
                  <button
                    key={opt.level}
                    type="button"
                    disabled={!isEditMode}
                    onClick={() => handleToggleMlOption(opt.label)}
                    title={opt.title}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all border ${
                      isSelected
                        ? 'bg-slate-800 text-slate-100 border-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.3)]'
                        : isEditMode
                          ? 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200 cursor-pointer'
                          : 'bg-slate-950/40 text-slate-600 border-slate-850 cursor-default'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="ml-1 text-slate-300">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Current Active Tags Display */}
            <div className="flex flex-wrap gap-1.5 pt-1 min-h-[30px]">
              {recommendedMl.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  Non-Resonant / Any ML (Standard Mundane Hardware)
                </span>
              ) : (
                recommendedMl.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-600/50 text-slate-200 rounded-lg text-xs font-mono"
                  >
                    <span>{item}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMl(item)}
                        className="text-slate-400 hover:text-slate-100 cursor-pointer"
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
                  className="flex-1 p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-400"
                />
                <button
                  type="submit"
                  disabled={!newMlInput.trim()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-slate-200 rounded-xl text-xs font-mono font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
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
            <Tag size={14} className="text-slate-400" />
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
              Open terms that reinforce this gear item in character equipment kits, archetype matching, and semantic search.
            </p>

            <div className="flex flex-wrap gap-1.5 min-h-[30px]">
              {keywordsList.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  No keywords assigned. Enter open terms below.
                </span>
              ) : (
                keywordsList.map((tag, idx) => (
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
                  placeholder="Type keywords (e.g. scanner, medical, stealth, infiltration, comms)..."
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
              Railguards preventing the AI or operator from allocating this gear in contradictory concepts, primitives, or incompatible settings.
            </p>

            <div className="flex flex-wrap gap-1.5 min-h-[30px]">
              {negativeKeywordsList.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-500 italic">
                  No negative railguards defined. Enter disfavored terms below.
                </span>
              ) : (
                negativeKeywordsList.map((tag, idx) => (
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
                  placeholder="Type railguards (e.g. primitive, heavy armor, magical focus, brute force)..."
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
