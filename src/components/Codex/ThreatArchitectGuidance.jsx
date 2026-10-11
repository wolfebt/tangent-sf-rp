import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  ShieldAlert, 
  Crosshair, 
  Sparkles, 
  Plus, 
  X, 
  Compass, 
  Tag,
  Ban,
  Zap,
  Flame,
  Swords
} from 'lucide-react';

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
 * ThreatArchitectGuidance
 * Renders MCM Threat Tier, Competency Role, Behaviors, and dual-card keyword chip blocks
 * in Modular Characters & Threats Studio / Relations tab.
 */
export const ThreatArchitectGuidance = ({
  formData = {},
  handleFieldChange,
  isEditMode = false,
  onOpenPicker,
  dbData = {}
}) => {
  const [newBehaviorInput, setNewBehaviorInput] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [newNegativeInput, setNewNegativeInput] = useState('');

  const behaviorsList = useMemo(() => {
    return normalizeList(formData.tacticalBehaviors || formData.tactical_behaviors);
  }, [formData.tacticalBehaviors, formData.tactical_behaviors]);

  const keywordsList = useMemo(() => {
    return normalizeList(formData.keywords);
  }, [formData.keywords]);

  const negativeKeywordsList = useMemo(() => {
    return normalizeList(formData.negative_keywords);
  }, [formData.negative_keywords]);

  // Handlers for Behaviors
  const handleAddBehavior = (e) => {
    e.preventDefault();
    const parts = newBehaviorInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = [...behaviorsList];
    for (const p of parts) {
      if (!current.includes(p)) current.push(p);
    }
    handleFieldChange('tacticalBehaviors', current);
    setNewBehaviorInput('');
  };

  const handleRemoveBehavior = (itemToRemove) => {
    const updated = behaviorsList.filter(b => b !== itemToRemove);
    handleFieldChange('tacticalBehaviors', updated);
  };

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

  return (
    <div className="space-y-6">
      {/* ── SECTION 1: MCM THREAT DESIGNATION & CHASSIS ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Bot size={14} className="text-red-400" />
          <span>Modular Character Matrix (MCM) Threat Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Threat Tier</span>
            <div className="text-sm font-mono font-bold text-red-400">Tier {formData.threatTier ?? formData.threat_tier ?? 3}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Tactical Role</span>
            <div className="text-sm font-mono font-bold text-amber-400">{formData.competencyRole || formData.role || 'Tank'}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Designation</span>
            <div className="text-sm font-mono font-bold text-purple-400">{formData.designation || 'Adversary'}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Chassis Multiplier</span>
            <div className="text-sm font-mono font-bold text-sky-400">{formData.bossType || formData.boss_type || 'Standard'}</div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: TACTICAL BEHAVIORS & AI ROUTINES ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Swords size={14} className="text-amber-400" />
          <span>Tactical Behaviors & Combat AI Routines</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase">Behaviors & Attack Routines</span>
            {isEditMode && onOpenPicker && (
              <button
                type="button"
                onClick={() => onOpenPicker({ source: 'traits', target: 'tacticalBehaviors', label: 'Tactical Behaviors' })}
                className="px-2 py-0.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
              >
                <Compass size={10} />
                <span>Cortex Browse</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
            {behaviorsList.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic font-mono self-center">None assigned (Standard tactical aggression)</span>
            ) : (
              behaviorsList.map(bh => (
                <span
                  key={bh}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-200 text-xs font-mono"
                >
                  <span>{bh}</span>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBehavior(bh)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  )}
                </span>
              ))
            )}
          </div>

          {isEditMode && (
            <form onSubmit={handleAddBehavior} className="flex gap-1.5">
              <input
                type="text"
                value={newBehaviorInput}
                onChange={(e) => setNewBehaviorInput(e.target.value)}
                placeholder="Add behaviors (e.g. Flank, Suppressive Fire, Pounce)..."
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded text-xs font-mono flex items-center justify-center transition-colors"
              >
                <Plus size={13} />
              </button>
            </form>
          )}
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
                Searchable descriptive keywords and operational traits (e.g., <em>heavy armor, frontline tank, ambush predator, suppressive fire, psionic shrieker</em>).
                These instruct the AI to prioritize fitting tactics, encounter tables, and combat routines.
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
                  placeholder="Enter keywords (e.g. boss, predator, sniper)..."
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
                Concepts that strictly conflict with this threat's role (e.g., <em>surrender, diplomatic compromise, civilian bystander, fragile</em>).
                BASTION AI applies score penalties or strict railguards against these traits during tactical generation.
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
                  placeholder="Enter negative railguards (e.g. pacifist, unarmed)..."
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

export default React.memo(ThreatArchitectGuidance);
