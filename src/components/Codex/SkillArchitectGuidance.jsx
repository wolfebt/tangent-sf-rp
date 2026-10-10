import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Cpu, 
  Sparkles, 
  Plus, 
  X, 
  Compass, 
  Tag,
  ShieldAlert,
  Ban,
  Layers,
  Zap,
  CheckCircle2
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
 * SkillArchitectGuidance
 * Renders recommended Tech Level (TL) and Meta Level (ML) operational thresholds,
 * plus guidance keywords (+weight) and negative railguards (-weight / exclusions)
 * in Skill Studio / Relations page.
 */
export const SkillArchitectGuidance = ({
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
    const next = keywordsList.filter(k => k !== tagToRemove);
    handleFieldChange('keywords', next.join(', '));
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
    const next = negativeKeywordsList.filter(k => k !== tagToRemove);
    handleFieldChange('negative_keywords', next.join(', '));
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="p-4 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 border border-blue-500/30 rounded-2xl shadow-xl space-y-1.5">
        <div className="flex items-center gap-2 text-blue-400 font-mono font-bold uppercase tracking-wider text-xs">
          <BookOpen size={15} className="text-blue-400 animate-pulse" />
          <span>Skill Relations & Architect Guidance</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 ml-auto font-mono">
            TL / ML Resonance & AI Directives
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Configure recommended operational Tech Levels (TL) and Meta Levels (ML) to anchor skill applicability across civilization tiers.
          Define searchable guidance keywords (+weight) and negative railguards (-weight / exclusions) to steer character synthesis and BASTION RAG matching.
        </p>
      </div>

      {/* ── SECTION 1: OPERATIONAL ERA & METAPHYSICAL RESONANCE ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Layers size={14} className="text-blue-400" />
          <span>Technological & Metaphysical Recommendations (Cortex Link)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* RECOMMENDED TECH LEVEL (TL) */}
          <div className="bg-slate-950/60 border border-blue-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400 uppercase">
                  <Cpu size={13} />
                  <span>Recommended Tech Levels (TL)</span>
                </div>
                {isEditMode && onOpenPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'technology', target: 'recommended_tl', label: 'Recommended Tech Levels' })}
                    className="px-2 py-0.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Compass size={10} />
                    <span>Cortex Browse</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Civilization technological tiers (TL 0-5) where this skill is prevalent, standardized, or required for tool operation.
              </p>
            </div>

            {/* Quick-Select Buttons */}
            {isEditMode && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Quick Toggle TL Tiers:</span>
                <div className="grid grid-cols-6 gap-1">
                  {CANONICAL_TL_QUICK_OPTIONS.map(opt => {
                    const isSelected = recommendedTl.some(t => t.toLowerCase() === opt.label.toLowerCase() || t === String(opt.level));
                    return (
                      <button
                        key={opt.level}
                        type="button"
                        onClick={() => handleToggleTlOption(opt.label)}
                        title={opt.title}
                        className={`py-1 text-center rounded text-[10px] font-mono font-bold transition-all border ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:border-sky-500 hover:text-sky-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedTl.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">Universal (All TLs)</span>
              ) : (
                recommendedTl.map(tl => (
                  <span
                    key={tl}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30 text-sky-200 text-xs font-mono"
                  >
                    <Cpu size={10} className="text-sky-400" />
                    <span>{tl}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTl(tl)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {/* Input Form */}
            {isEditMode && (
              <form onSubmit={handleAddTl} className="flex gap-1.5">
                <input
                  type="text"
                  value={newTlInput}
                  onChange={(e) => setNewTlInput(e.target.value)}
                  placeholder="Custom TL (e.g. TL 3+, TL 2-4)..."
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white rounded text-xs font-mono flex items-center justify-center transition-colors"
                >
                  <Plus size={13} />
                </button>
              </form>
            )}
          </div>

          {/* RECOMMENDED META LEVEL (ML) */}
          <div className="bg-slate-950/60 border border-purple-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 uppercase">
                  <Sparkles size={13} />
                  <span>Recommended Meta Levels (ML)</span>
                </div>
                {isEditMode && onOpenPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'meta_level', target: 'recommended_ml', label: 'Recommended Meta Levels' })}
                    className="px-2 py-0.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Compass size={10} />
                    <span>Cortex Browse</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Metaphysical or psionic resonance thresholds (ML 0-5) required for or synergistic with this discipline.
              </p>
            </div>

            {/* Quick-Select Buttons */}
            {isEditMode && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Quick Toggle ML Tiers:</span>
                <div className="grid grid-cols-6 gap-1">
                  {CANONICAL_ML_QUICK_OPTIONS.map(opt => {
                    const isSelected = recommendedMl.some(m => m.toLowerCase() === opt.label.toLowerCase() || m === String(opt.level));
                    return (
                      <button
                        key={opt.level}
                        type="button"
                        onClick={() => handleToggleMlOption(opt.label)}
                        title={opt.title}
                        className={`py-1 text-center rounded text-[10px] font-mono font-bold transition-all border ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:border-purple-500 hover:text-purple-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedMl.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">Universal (All MLs)</span>
              ) : (
                recommendedMl.map(ml => (
                  <span
                    key={ml}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-200 text-xs font-mono"
                  >
                    <Sparkles size={10} className="text-purple-400" />
                    <span>{ml}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMl(ml)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {/* Input Form */}
            {isEditMode && (
              <form onSubmit={handleAddMl} className="flex gap-1.5">
                <input
                  type="text"
                  value={newMlInput}
                  onChange={(e) => setNewMlInput(e.target.value)}
                  placeholder="Custom ML (e.g. ML 1+, ML 2-3)..."
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-xs font-mono flex items-center justify-center transition-colors"
                >
                  <Plus size={13} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: AI REFERENCE & OPERATOR DIRECTIVES ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Tag size={14} className="text-blue-400" />
          <span>AI Guidance Directives & Railguards (Operator & Engine Weights)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* POSITIVE DIRECTIVES / KEYWORDS */}
          <div className="bg-slate-950/60 border border-blue-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-400 uppercase">
                  <Tag size={13} />
                  <span>Positive Directives / Keywords</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-950/80 border border-blue-500/30 px-1.5 py-0.5 rounded">
                  +Weight in BASTION AI & RAG
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Searchable descriptive keywords and vocational concepts (e.g., <em>computation, navigation, stealth, cybernetics, piloting</em>).
                These instruct BASTION AI to prioritize this skill for operatives and gear matching these thematic concepts.
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {keywordsList.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None entered</span>
              ) : (
                keywordsList.map(kw => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/70 border border-blue-500/30 text-blue-200 text-xs font-mono"
                  >
                    <span>{kw}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {/* Input Form */}
            {isEditMode && (
              <form onSubmit={handleAddKeyword} className="flex gap-1.5">
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  placeholder="Enter keywords (e.g. computation, piloting, stealth)..."
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs font-mono flex items-center justify-center transition-colors"
                >
                  <Plus size={13} />
                </button>
              </form>
            )}
          </div>

          {/* NEGATIVE RAILGUARDS / EXCLUSIONS */}
          <div className="bg-slate-950/60 border border-rose-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400 uppercase">
                  <ShieldAlert size={13} />
                  <span>Negative Railguards / Exclusions</span>
                </div>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 border border-rose-500/30 px-1.5 py-0.5 rounded">
                  -Weight / Strict Exclusions
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Searchable concepts to avoid (e.g., <em>primitive, brute force, heavy armor, reckless</em>).
                BASTION AI applies penalty weights or strict railguards against pairing this skill when these themes are present.
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {negativeKeywordsList.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None entered</span>
              ) : (
                negativeKeywordsList.map(nkw => (
                  <span
                    key={nkw}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/30 text-rose-200 text-xs font-mono"
                  >
                    <Ban size={10} className="text-rose-400" />
                    <span>{nkw}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNegativeKeyword(nkw)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {/* Input Form */}
            {isEditMode && (
              <form onSubmit={handleAddNegativeKeyword} className="flex gap-1.5">
                <input
                  type="text"
                  value={newNegativeInput}
                  onChange={(e) => setNewNegativeInput(e.target.value)}
                  placeholder="Enter negative railguards (e.g. primitive, brute force)..."
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-rose-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded text-xs font-mono flex items-center justify-center transition-colors"
                >
                  <Plus size={13} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
