import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Sparkles, 
  ShieldAlert, 
  Plus, 
  X, 
  Ban,
  Cpu,
  BookOpen,
  MapPin,
  Film,
  Compass,
  Award
} from 'lucide-react';

/**
 * WorldElementArchitectGuidance Component
 *
 * Universal guidance component for narrative & worldbuilding categories:
 * - Universe (Cosmology, Scale, Cosmic Laws)
 * - Philosophy & Religion (Beliefs, Tenets, Rituals)
 * - Technology (TL, ML, Crafting DC, Inventions)
 * - Setting (Locations, Atmosphere, Points of Interest)
 * - Scene (AIME Scene types, Dramatic Hooks, Beats)
 *
 * Provides specialized category contextual metrics and universal dual-card
 * positive directives / negative railguards chips.
 */
export const WorldElementArchitectGuidance = ({
  formData = {},
  handleFieldChange = () => {},
  isEditMode = false,
  onOpenPicker = null,
  dbData = {},
  matrix = {}
}) => {
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [newNegativeInput, setNewNegativeInput] = useState('');

  const categoryId = matrix?.id || formData?.category || 'world_element';

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

  // Render contextual summary based on category
  const renderCategoryContext = () => {
    if (categoryId === 'technology') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
            <Cpu size={14} className="text-cyan-400" />
            <span>Technological Classification & Complexity</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Tech Level (TL)</span>
              <div className="text-sm font-mono font-bold text-cyan-400">TL {formData.tech_level ?? 3}</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Meta Level (ML)</span>
              <div className="text-sm font-mono font-bold text-purple-400">ML {formData.meta_level ?? 0}</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Crafting / Complexity DC</span>
              <div className="text-sm font-mono font-bold text-amber-400">DC {formData.craft_dc || formData.craftDc || 15}</div>
            </div>
          </div>
        </div>
      );
    }

    if (categoryId === 'philosophy') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
            <BookOpen size={14} className="text-amber-400" />
            <span>Philosophical Paradigm & Origin</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Founders & Cultural Origin</span>
              <div className="text-xs font-mono text-slate-300 line-clamp-2">{formData.origin || 'Ancient Starfarer Traditions'}</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Key Rituals / Practices</span>
              <div className="text-xs font-mono text-slate-300 line-clamp-2">{formData.practices || 'Meditative Communion & Guild Oaths'}</div>
            </div>
          </div>
        </div>
      );
    }

    if (categoryId === 'universe') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
            <Globe size={14} className="text-purple-400" />
            <span>Cosmological Scope & Physics</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Cosmic Scale</span>
              <div className="text-sm font-mono font-bold text-purple-400">{formData.scale || 'Galaxy'}</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Physical & Metaphysical Laws</span>
              <div className="text-xs font-mono text-slate-300 line-clamp-2">{formData.laws_of_physics || 'Standard Relativistic + Sub-space Warp Resonance'}</div>
            </div>
          </div>
        </div>
      );
    }

    if (categoryId === 'setting') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
            <MapPin size={14} className="text-emerald-400" />
            <span>Regional Setting Context</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Host World / Origin</span>
              <div className="text-sm font-mono font-bold text-emerald-400">{formData.world || 'Orbital Station / Deep Space'}</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Key Inhabitants</span>
              <div className="text-xs font-mono text-slate-300 line-clamp-2">{formData.inhabitants || 'Mixed Cosmopolitan Populous'}</div>
            </div>
          </div>
        </div>
      );
    }

    if (categoryId === 'scene') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
            <Film size={14} className="text-pink-400" />
            <span>Dramatic Scene Construction (AIME)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Scene Archetype</span>
              <div className="text-sm font-mono font-bold text-pink-400">{formData.scene_type || 'Action / Combat'}</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1 col-span-2">
              <span className="text-[10px] font-mono uppercase text-slate-400">Dramatic Hook / Conflict</span>
              <div className="text-xs font-mono text-slate-300 line-clamp-2">{formData.dramatic_hook || 'Ambush at the extraction coordinates'}</div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* ── CONTEXTUAL SECTION ── */}
      {renderCategoryContext()}

      {/* ── GUIDANCE DIRECTIVES & RAILGUARDS ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Compass size={14} className="text-emerald-400" />
          <span>Architectural Directives & Thematic Railguards</span>
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
                Aesthetic anchors, narrative tropes, sensory textures, and technological motifs prioritized when generating content for this entry.
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
                  placeholder="Enter keywords (e.g. cybernetic, occult, grimdark)..."
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
                Concepts, tones, or design choices strictly excluded from this entry to maintain tonal coherence and eliminate anachronisms.
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
                  placeholder="Enter negative railguards (e.g. comedic, low-magic)..."
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

export default React.memo(WorldElementArchitectGuidance);
