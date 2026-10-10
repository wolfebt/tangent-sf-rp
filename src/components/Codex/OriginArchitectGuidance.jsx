import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Flag, 
  Briefcase, 
  Sparkles, 
  Plus, 
  X, 
  Compass, 
  Tag,
  ShieldAlert,
  Ban,
  GraduationCap,
  Zap,
  Globe
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
 * OriginArchitectGuidance
 * Renders recommended species, factions, occupations, skills, and features (discounted),
 * plus guidance keywords and negative railguards in Origin Studio / Relations page.
 */
export const OriginArchitectGuidance = ({
  formData = {},
  handleFieldChange,
  isEditMode = false,
  onOpenPicker,
  dbData = {}
}) => {
  const [newSpeciesInput, setNewSpeciesInput] = useState('');
  const [newFactionInput, setNewFactionInput] = useState('');
  const [newOccuInput, setNewOccuInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newFeatureInput, setNewFeatureInput] = useState('');

  const recommendedSpecies = useMemo(() => normalizeList(formData.recommended_species), [formData.recommended_species]);
  const recommendedFactions = useMemo(() => normalizeList(formData.recommended_factions), [formData.recommended_factions]);
  const recommendedOccupations = useMemo(() => normalizeList(formData.recommended_occupations), [formData.recommended_occupations]);
  const recommendedSkills = useMemo(() => normalizeList(formData.recommended_skills), [formData.recommended_skills]);
  const recommendedFeatures = useMemo(() => normalizeList(formData.recommended_features), [formData.recommended_features]);

  const handleAddSpecies = (e) => {
    if (e) e.preventDefault();
    const parts = newSpeciesInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...recommendedSpecies];
    for (const part of parts) {
      if (!next.some(sp => sp.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_species', next);
    setNewSpeciesInput('');
  };

  const handleRemoveSpecies = (val) => {
    handleFieldChange('recommended_species', recommendedSpecies.filter(sp => sp !== val));
  };

  const handleAddFaction = (e) => {
    if (e) e.preventDefault();
    const parts = newFactionInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...recommendedFactions];
    for (const part of parts) {
      if (!next.some(f => f.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_factions', next);
    setNewFactionInput('');
  };

  const handleRemoveFaction = (val) => {
    handleFieldChange('recommended_factions', recommendedFactions.filter(f => f !== val));
  };

  const handleAddOccu = (e) => {
    if (e) e.preventDefault();
    const parts = newOccuInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...recommendedOccupations];
    for (const part of parts) {
      if (!next.some(oc => oc.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_occupations', next);
    setNewOccuInput('');
  };

  const handleRemoveOccu = (val) => {
    handleFieldChange('recommended_occupations', recommendedOccupations.filter(oc => oc !== val));
  };

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const parts = newSkillInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...recommendedSkills];
    for (const part of parts) {
      if (!next.some(sk => sk.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_skills', next);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (val) => {
    handleFieldChange('recommended_skills', recommendedSkills.filter(sk => sk !== val));
  };

  const handleAddFeature = (e) => {
    if (e) e.preventDefault();
    const parts = newFeatureInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...recommendedFeatures];
    for (const part of parts) {
      if (!next.some(ft => ft.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_features', next);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (val) => {
    handleFieldChange('recommended_features', recommendedFeatures.filter(ft => ft !== val));
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
      <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl shadow-xl space-y-1.5">
        <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider text-xs">
          <Globe size={15} className="text-emerald-400 animate-pulse" />
          <span>Origin Relations & Architect Guidance</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 ml-auto font-mono">
            Homeworld & AI Directives
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Configure canonical homeworld synergies, recommended demographic species, affiliated factions, and occupational vocations.
          Define recommended society skills and discounted features (-1 BP) to anchor character creation and instruct BASTION AI synthesis.
        </p>
      </div>

      {/* ── SECTION 1: DEMOGRAPHIC SYNERGIES ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Users size={14} className="text-emerald-400" />
          <span>Demographic & Cultural Synergies (Cortex Link)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* RECOMMENDED SPECIES */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400 uppercase">
                  <Users size={13} />
                  <span>Recommended Species</span>
                </div>
                {isEditMode && onOpenPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'species', target: 'recommended_species', label: 'Recommended Species' })}
                    className="px-2 py-0.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Compass size={10} />
                    <span>Cortex Browse</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Species commonly native to or inhabiting this homeworld or habitat.
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedSpecies.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None specified</span>
              ) : (
                recommendedSpecies.map(sp => (
                  <span
                    key={sp}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30 text-sky-200 text-xs font-mono"
                  >
                    <span>{sp}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecies(sp)}
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
              <form onSubmit={handleAddSpecies} className="flex gap-1.5">
                <input
                  type="text"
                  value={newSpeciesInput}
                  onChange={(e) => setNewSpeciesInput(e.target.value)}
                  placeholder="Add species (comma-separated)..."
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

          {/* RECOMMENDED FACTIONS */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400 uppercase">
                  <Flag size={13} />
                  <span>Recommended Factions</span>
                </div>
                {isEditMode && onOpenPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'factions', target: 'recommended_factions', label: 'Recommended Factions' })}
                    className="px-2 py-0.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Compass size={10} />
                    <span>Cortex Browse</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Factions holding sovereign jurisdiction, orbital presence, or trade treaties here.
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedFactions.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None specified</span>
              ) : (
                recommendedFactions.map(f => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30 text-sky-200 text-xs font-mono"
                  >
                    <span>{f}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFaction(f)}
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
              <form onSubmit={handleAddFaction} className="flex gap-1.5">
                <input
                  type="text"
                  value={newFactionInput}
                  onChange={(e) => setNewFactionInput(e.target.value)}
                  placeholder="Add factions (comma-separated)..."
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

          {/* RECOMMENDED OCCUPATIONS */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase">
                  <Briefcase size={13} />
                  <span>Recommended Occupations</span>
                </div>
                {isEditMode && onOpenPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'occupations', target: 'recommended_occupations', label: 'Recommended Occupations' })}
                    className="px-2 py-0.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Compass size={10} />
                    <span>Cortex Browse</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Common professions, vocations, and roles emerging from this habitat.
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedOccupations.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None specified</span>
              ) : (
                recommendedOccupations.map(oc => (
                  <span
                    key={oc}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-200 text-xs font-mono"
                  >
                    <span>{oc}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOccu(oc)}
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
              <form onSubmit={handleAddOccu} className="flex gap-1.5">
                <input
                  type="text"
                  value={newOccuInput}
                  onChange={(e) => setNewOccuInput(e.target.value)}
                  placeholder="Add occupations (comma-separated)..."
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
      </div>

      {/* ── SECTION 2: MECHANICS & DISCOUNT ALLOCATIONS ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Zap size={14} className="text-emerald-400" />
          <span>Mechanics & Starting Synergies (Cortex Link)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* RECOMMENDED SKILLS */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
                  <GraduationCap size={13} />
                  <span>Recommended Society Skills</span>
                </div>
                {isEditMode && onOpenPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'skills', target: 'recommended_skills', label: 'Recommended Skills' })}
                    className="px-2 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Compass size={10} />
                    <span>Cortex Browse</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Society and survival skills granted or prioritized for operatives raised in this environment.
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedSkills.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None specified</span>
              ) : (
                recommendedSkills.map(sk => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs font-mono"
                  >
                    <span>{sk}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk)}
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
              <form onSubmit={handleAddSkill} className="flex gap-1.5">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="Add skills (comma-separated)..."
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

          {/* RECOMMENDED FEATURES (-1 BP DISCOUNT) */}
          <div className="bg-slate-950/60 border border-purple-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 uppercase">
                  <Sparkles size={13} />
                  <span>Recommended Features</span>
                  <span className="px-1.5 py-0.2 bg-purple-900/60 border border-purple-500/40 text-purple-300 text-[10px] rounded font-mono font-bold">
                    -1 BP Discount
                  </span>
                </div>
                {isEditMode && onOpenPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'features', target: 'recommended_features', label: 'Recommended Features' })}
                    className="px-2 py-0.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Compass size={10} />
                    <span>Cortex Browse</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Signature traits and physiological adaptations that characters purchase at a -1 BP discount when hailing from this origin.
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedFeatures.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None specified</span>
              ) : (
                recommendedFeatures.map(feat => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-200 text-xs font-mono"
                  >
                    <span>{feat}</span>
                    <span className="text-[9px] text-purple-400 font-bold font-mono">(-1 BP)</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feat)}
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
              <form onSubmit={handleAddFeature} className="flex gap-1.5">
                <input
                  type="text"
                  value={newFeatureInput}
                  onChange={(e) => setNewFeatureInput(e.target.value)}
                  placeholder="Add features (comma-separated)..."
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
                Searchable descriptive keywords and environmental themes (e.g., <em>subterranean, high-gravity, mining, arcology</em>).
                These instruct the AI to prioritize aligned equipment, tactical choices, and narrative flavor.
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
                  placeholder="Enter keywords (e.g. mining, subterranean)..."
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
                Searchable concepts to avoid (e.g., <em>aquatic, zero-g, stealth, palatial</em>).
                BASTION AI applies score penalties or strict railguards against these traits during synthesis.
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
                  placeholder="Enter negative railguards (e.g. aquatic, zero-g)..."
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
