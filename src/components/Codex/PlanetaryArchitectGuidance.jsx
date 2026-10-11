import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Compass, 
  Sparkles, 
  ShieldAlert, 
  Plus, 
  X, 
  Ban,
  Anchor,
  Layers,
  Flag,
  Radio,
  AlertTriangle
} from 'lucide-react';

/**
 * PlanetaryArchitectGuidance Component
 *
 * Dedicated guidance tab for Planetary Design & World building assets.
 * Displays UWP classification metrics, trade codes, quirks, and universal
 * positive directives / negative railguards chips.
 */
export const PlanetaryArchitectGuidance = ({
  formData = {},
  handleFieldChange = () => {},
  isEditMode = false,
  onOpenPicker = null,
  dbData = {}
}) => {
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [newNegativeInput, setNewNegativeInput] = useState('');

  // Parse Positive Directives
  const keywordsList = useMemo(() => {
    if (!formData.keywords) return [];
    if (Array.isArray(formData.keywords)) return formData.keywords.filter(Boolean);
    return String(formData.keywords)
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(Boolean);
  }, [formData.keywords]);

  // Parse Negative Railguards
  const negativeKeywordsList = useMemo(() => {
    if (!formData.negative_keywords) return [];
    if (Array.isArray(formData.negative_keywords)) return formData.negative_keywords.filter(Boolean);
    return String(formData.negative_keywords)
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(Boolean);
  }, [formData.negative_keywords]);

  // Trade Codes / Traits
  const tradeCodesList = useMemo(() => {
    const raw = formData.tradeCodes || formData.traits || [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    return String(raw).split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  }, [formData.tradeCodes, formData.traits]);

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

  const handleRemoveTradeCode = (codeToRemove) => {
    const updated = tradeCodesList.filter(c => c !== codeToRemove);
    handleFieldChange('tradeCodes', updated);
  };

  return (
    <div className="space-y-6">
      {/* ── SECTION 1: UWP & GEOPHYSICAL METRICS ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Globe size={14} className="text-teal-400" />
          <span>Universal World Profile (UWP) & Geophysics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Starport</span>
            <div className="text-sm font-mono font-bold text-amber-400">Class {formData.starport || 'C'}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Size (Dia)</span>
            <div className="text-sm font-mono font-bold text-cyan-400">Code {formData.size ?? 6}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Atmosphere</span>
            <div className="text-sm font-mono font-bold text-sky-400">Code {formData.atmosphere ?? 6}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Hydrographics</span>
            <div className="text-sm font-mono font-bold text-blue-400">Code {formData.hydrography ?? 5}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Population</span>
            <div className="text-sm font-mono font-bold text-purple-400">Code {formData.population ?? 7}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Tech Level</span>
            <div className="text-sm font-mono font-bold text-emerald-400">TL {formData.tech_level ?? 3}</div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: TRADE CLASSIFICATIONS & SOCIO-POLITICAL CULTURE ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Anchor size={14} className="text-cyan-400" />
          <span>Trade Classifications & Cultural Aesthetics</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase">Trade Classifications</span>
            {isEditMode && onOpenPicker && (
              <button
                type="button"
                onClick={() => onOpenPicker({ source: 'traits', target: 'tradeCodes', label: 'Trade Classifications' })}
                className="px-2 py-0.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
              >
                <Plus size={12} />
                <span>Assign Codes</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
            {tradeCodesList.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic font-mono self-center">No trade codes classified (e.g. In, Hi, Na, Ri)</span>
            ) : (
              tradeCodesList.map(code => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 text-xs font-mono"
                >
                  <Anchor size={10} className="text-cyan-400" />
                  <span>{code}</span>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTradeCode(code)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  )}
                </span>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Cultural & Faction Aesthetic</span>
              {isEditMode ? (
                <input
                  type="text"
                  value={formData.factionArchetype || ''}
                  onChange={(e) => handleFieldChange('factionArchetype', e.target.value)}
                  placeholder="e.g. Corporate Oligarchy, Frontier Mining Syndicate..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                />
              ) : (
                <div className="text-xs font-mono text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                  {formData.factionArchetype || 'Standard Frontier Settlement'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Wealth Modifier / Tariff Rate</span>
              {isEditMode ? (
                <input
                  type="number"
                  value={formData.wealthModifier ?? ''}
                  onChange={(e) => handleFieldChange('wealthModifier', Number(e.target.value))}
                  placeholder="e.g. 0, +1, -2..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                />
              ) : (
                <div className="text-xs font-mono text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                  {Number(formData.wealthModifier ?? 0) >= 0 ? `+${formData.wealthModifier ?? 0}` : formData.wealthModifier} Economy Delta
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: PLANETARY DIRECTIVES & RAILGUARDS ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Compass size={14} className="text-emerald-400" />
          <span>Biophilic Directives & Astrometric Railguards</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* POSITIVE DIRECTIVES */}
          <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
                  <Sparkles size={13} />
                  <span>Guidance Keywords & Directives</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  +Weight / Thematic Pillars
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Ecosystem descriptors, geologic anomalies, trade specialties, and orbital features prioritized during procedural world generation (e.g. <em>oceanic, storm-wracked, crystalline mantle, orbital elevator</em>).
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
                  placeholder="Enter keywords (e.g. tidally-locked, ringed, ecumenopolis)..."
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
                Concepts incompatible with this world's ecosystem or astrometric conditions (e.g., <em>verdant forest on toxic rock, zero-gravity on super-earth, primitive tribe on high-tech forge world</em>).
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
                  placeholder="Enter negative railguards (e.g. vacuum, paradise, arid)..."
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

export default React.memo(PlanetaryArchitectGuidance);
