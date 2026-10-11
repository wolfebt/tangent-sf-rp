import React, { useState, useMemo } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle,
  Sparkles, 
  Plus, 
  X, 
  Compass, 
  Tag,
  ShieldAlert,
  Ban,
  Zap,
  Coins,
  HeartCrack
} from 'lucide-react';
import { SPECIES_DISADVANTAGES } from '../../data/speciesDisadvantagesData.js';

/**
 * Normalizes input list into an array of clean string labels.
 */
const normalizeList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(item => (typeof item === 'object' && item !== null ? (item.name || item.title || item.id) : String(item))).filter(Boolean);
  }
  if (typeof val === 'string') {
    return val.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
};

/**
 * DisadvantageArchitectGuidance
 * Renders hindrances, condition associations, penalties, and dual-card keyword chip blocks
 * in Disadvantage Studio / Relations tab.
 */
export const DisadvantageArchitectGuidance = ({
  formData = {},
  handleFieldChange,
  isEditMode = false,
  onOpenPicker,
  dbData = {}
}) => {
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [newNegativeInput, setNewNegativeInput] = useState('');

  // Resilient canonical seed lookup
  const canonicalSeed = useMemo(() => {
    if (!formData.name && !formData.id && !formData.code) return null;
    const matchId = (formData.id || '').toString().toLowerCase().trim();
    const matchCode = (formData.code || '').toString().toLowerCase().trim();
    const matchName = (formData.name || '').toString().toLowerCase().trim();

    const pool = (Array.isArray(dbData?.disadvantages) && dbData.disadvantages.length > 0) ? dbData.disadvantages : (SPECIES_DISADVANTAGES || []);
    return pool.find(d => {
      const dId = (d.id || '').toString().toLowerCase().trim();
      const dCode = (d.code || '').toString().toLowerCase().trim();
      const dName = (d.name || '').toString().toLowerCase().trim();
      return (dId && dId === matchId) ||
             (dCode && dCode === matchCode) ||
             (dName && dName === matchName);
    }) || null;
  }, [formData.id, formData.code, formData.name, dbData?.disadvantages]);

  const keywordsList = useMemo(() => {
    const raw = formData.keywords || canonicalSeed?.keywords;
    return normalizeList(raw);
  }, [formData.keywords, canonicalSeed?.keywords]);

  const negativeKeywordsList = useMemo(() => {
    const raw = formData.negative_keywords || canonicalSeed?.negative_keywords;
    return normalizeList(raw);
  }, [formData.negative_keywords, canonicalSeed?.negative_keywords]);

  // Handlers for Positive Keywords
  const handleAddKeyword = (e) => {
    e.preventDefault();
    const parts = newKeywordInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = [...keywordsList];
    for (const p of parts) {
      if (!current.some(c => c.toLowerCase() === p.toLowerCase())) {
        current.push(p);
      }
    }
    handleFieldChange('keywords', current.join(', '));
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (tagToRemove) => {
    const updated = keywordsList.filter(k => k.toLowerCase() !== tagToRemove.toLowerCase());
    handleFieldChange('keywords', updated.join(', '));
  };

  // Handlers for Negative Railguards
  const handleAddNegativeKeyword = (e) => {
    e.preventDefault();
    const parts = newNegativeInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = [...negativeKeywordsList];
    for (const p of parts) {
      if (!current.some(c => c.toLowerCase() === p.toLowerCase())) {
        current.push(p);
      }
    }
    handleFieldChange('negative_keywords', current.join(', '));
    setNewNegativeInput('');
  };

  const handleRemoveNegativeKeyword = (tagToRemove) => {
    const updated = negativeKeywordsList.filter(k => k.toLowerCase() !== tagToRemove.toLowerCase());
    handleFieldChange('negative_keywords', updated.join(', '));
  };

  const modifiersList = useMemo(() => {
    return Array.isArray(formData.modifiers) ? formData.modifiers : (canonicalSeed?.modifiers || []);
  }, [formData.modifiers, canonicalSeed?.modifiers]);

  return (
    <div className="space-y-6">
      {/* ── SECTION 1: MANIFESTATION & SEVERITY PROFILE ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <AlertOctagon size={14} className="text-rose-400" />
          <span>Biological & Psychological Manifestation (BASTION Rules)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* BP REBATE TIER */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase">
              <Coins size={13} />
              <span>BP Rebate / Severity Tier</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-lg text-xs font-mono text-amber-200">
              {formData.bp_granted || canonicalSeed?.bp_granted || '3 / 6 / 9 BP'}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Character Points refunded to allocate toward additional features or attribute upgrades.
            </p>
          </div>

          {/* HINDRANCE CLASSIFICATION */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400 uppercase">
              <AlertTriangle size={13} />
              <span>Classification & Origin</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-lg text-xs font-mono text-sky-200">
              {formData.disadvantage_type || formData.hindrance_type || canonicalSeed?.hindrance_type || 'Psychological / Physical'}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Determines whether medical surgery, neural reprogramming, or therapy can alleviate this condition.
            </p>
          </div>

          {/* PREREQUISITE & SOCIAL STIGMA */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400 uppercase">
              <HeartCrack size={13} />
              <span>Prerequisites & Stigmas</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-lg text-xs font-mono text-rose-200">
              {formData.prerequisite || canonicalSeed?.prerequisite || 'None'}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Specific species chassis or campaign restrictions required for this flaw.
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: MECHANICAL PENALTIES & CONDITIONS ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Zap size={14} className="text-amber-400" />
          <span>Active Game Penalties & Linked Conditions</span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
          <div className="flex flex-wrap gap-2">
            {modifiersList.length === 0 ? (
              <span className="text-xs text-slate-500 font-mono italic">No automated modifier penalties attached. See rules text below.</span>
            ) : (
              modifiersList.map((m, idx) => (
                <div key={idx} className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-200 font-mono text-xs flex items-center gap-2">
                  <span className="font-bold text-rose-400">{m.target || m.name}:</span>
                  <span>{m.description || (m.value !== undefined ? `${m.value > 0 ? '+' : ''}${m.value}` : m.mode)}</span>
                </div>
              ))
            )}
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
            {formData.mechanic || formData.mechanics || canonicalSeed?.mechanic || 'Refer to BASTION Chapter 3 for detailed hindrance triggers and recovery protocols.'}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: AI REFERENCE & OPERATOR DIRECTIVES ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Tag size={14} className="text-emerald-400" />
          <span>AI Guidance Directives & Railguards (Operator & Engine Weights)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* POSITIVE DIRECTIVES / KEYWORDS */}
          <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
                  <Tag size={13} />
                  <span>Positive Directives / Keywords</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  +Weight in BASTION AI & RAG
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Searchable descriptive keywords and psychological traits (e.g., <em>chemical dependency, withdrawal, debilitating, sensory loss, behavioral flaw</em>).
                These instruct the AI to incorporate authentic roleplay hindrances and complications into narrative play.
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs font-mono"
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
                  placeholder="Enter keywords (e.g. addiction, penalty, tremor)..."
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-mono flex items-center justify-center transition-colors"
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
                Concepts that strictly conflict with this disadvantage (e.g., <em>superhuman discipline, perfect composure, stimulant immunity</em>).
                BASTION AI suppresses contradictory buffs or invalid synergies.
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
                  placeholder="Enter negative railguards (e.g. fearless, immune)..."
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

export default React.memo(DisadvantageArchitectGuidance);
