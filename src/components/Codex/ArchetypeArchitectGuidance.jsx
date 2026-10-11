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
  Globe,
  BookOpen
} from 'lucide-react';
import { DEFAULT_ARCHETYPES } from '../../data/archetypesData.js';

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
 * ArchetypeArchitectGuidance
 * Renders recommended species, factions, origins, occupations, skills, and features,
 * plus guidance keywords and negative railguards in Archetype Studio / Relations tab.
 */
export const ArchetypeArchitectGuidance = ({
  formData = {},
  handleFieldChange,
  isEditMode = false,
  onOpenPicker,
  dbData = {}
}) => {
  const [newSpeciesInput, setNewSpeciesInput] = useState('');
  const [newFactionInput, setNewFactionInput] = useState('');
  const [newOriginInput, setNewOriginInput] = useState('');
  const [newOccuInput, setNewOccuInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [newNegativeInput, setNewNegativeInput] = useState('');

  // Resilient canonical seed lookup
  const canonicalSeed = useMemo(() => {
    if (!formData.name && !formData.id && !formData.title) return null;
    const matchId = (formData.id || '').toString().toLowerCase().trim();
    const matchName = (formData.name || '').toString().toLowerCase().trim();
    const matchTitle = (formData.title || '').toString().toLowerCase().trim();

    const pool = (Array.isArray(dbData?.archetypes) && dbData.archetypes.length > 0) ? dbData.archetypes : (DEFAULT_ARCHETYPES || []);
    return pool.find(a => {
      const aId = (a.id || '').toString().toLowerCase().trim();
      const aName = (a.name || '').toString().toLowerCase().trim();
      const aTitle = (a.title || '').toString().toLowerCase().trim();
      return (aId && aId === matchId) ||
             (aName && (aName === matchName || aName === matchTitle)) ||
             (aTitle && (aTitle === matchName || aTitle === matchTitle));
    }) || null;
  }, [formData.id, formData.name, formData.title, dbData?.archetypes]);

  const rawRecSpecies = normalizeList(formData.recommended_species);
  const recommendedSpecies = useMemo(() => {
    if (rawRecSpecies.length > 0) return rawRecSpecies;
    return normalizeList(canonicalSeed?.recommended_species);
  }, [rawRecSpecies, canonicalSeed]);

  const rawRecFactions = normalizeList(formData.recommended_factions);
  const recommendedFactions = useMemo(() => {
    if (rawRecFactions.length > 0) return rawRecFactions;
    return normalizeList(canonicalSeed?.recommended_factions);
  }, [rawRecFactions, canonicalSeed]);

  const rawRecOrigins = normalizeList(formData.recommended_origins);
  const recommendedOrigins = useMemo(() => {
    if (rawRecOrigins.length > 0) return rawRecOrigins;
    return normalizeList(canonicalSeed?.recommended_origins);
  }, [rawRecOrigins, canonicalSeed]);

  const rawRecOccupations = normalizeList(formData.recommended_occupations);
  const recommendedOccupations = useMemo(() => {
    if (rawRecOccupations.length > 0) return rawRecOccupations;
    return normalizeList(canonicalSeed?.recommended_occupations);
  }, [rawRecOccupations, canonicalSeed]);

  const rawRecSkills = normalizeList(formData.essential_skills || formData.recommended_skills);
  const recommendedSkills = useMemo(() => {
    if (rawRecSkills.length > 0) return rawRecSkills;
    return normalizeList(canonicalSeed?.essential_skills || canonicalSeed?.recommended_skills);
  }, [rawRecSkills, canonicalSeed]);

  const rawRecFeatures = normalizeList(formData.signature_features || formData.recommended_features);
  const recommendedFeatures = useMemo(() => {
    if (rawRecFeatures.length > 0) return rawRecFeatures;
    return normalizeList(canonicalSeed?.signature_features || canonicalSeed?.recommended_features);
  }, [rawRecFeatures, canonicalSeed]);

  const keywordsList = useMemo(() => {
    const raw = formData.keywords || canonicalSeed?.keywords;
    return normalizeList(raw);
  }, [formData.keywords, canonicalSeed?.keywords]);

  const negativeKeywordsList = useMemo(() => {
    const raw = formData.negative_keywords || canonicalSeed?.negative_keywords;
    return normalizeList(raw);
  }, [formData.negative_keywords, canonicalSeed?.negative_keywords]);

  // Handlers for Species
  const handleAddSpecies = (e) => {
    e.preventDefault();
    const parts = newSpeciesInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = [...recommendedSpecies];
    for (const p of parts) {
      if (!current.includes(p)) current.push(p);
    }
    handleFieldChange('recommended_species', current);
    setNewSpeciesInput('');
  };

  const handleRemoveSpecies = (itemToRemove) => {
    const updated = recommendedSpecies.filter(s => s !== itemToRemove);
    handleFieldChange('recommended_species', updated);
  };

  // Handlers for Factions
  const handleAddFaction = (e) => {
    e.preventDefault();
    const parts = newFactionInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = [...recommendedFactions];
    for (const p of parts) {
      if (!current.includes(p)) current.push(p);
    }
    handleFieldChange('recommended_factions', current);
    setNewFactionInput('');
  };

  const handleRemoveFaction = (itemToRemove) => {
    const updated = recommendedFactions.filter(f => f !== itemToRemove);
    handleFieldChange('recommended_factions', updated);
  };

  // Handlers for Origins
  const handleAddOrigin = (e) => {
    e.preventDefault();
    const parts = newOriginInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = [...recommendedOrigins];
    for (const p of parts) {
      if (!current.includes(p)) current.push(p);
    }
    handleFieldChange('recommended_origins', current);
    setNewOriginInput('');
  };

  const handleRemoveOrigin = (itemToRemove) => {
    const updated = recommendedOrigins.filter(o => o !== itemToRemove);
    handleFieldChange('recommended_origins', updated);
  };

  // Handlers for Occupations
  const handleAddOccu = (e) => {
    e.preventDefault();
    const parts = newOccuInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = [...recommendedOccupations];
    for (const p of parts) {
      if (!current.includes(p)) current.push(p);
    }
    handleFieldChange('recommended_occupations', current);
    setNewOccuInput('');
  };

  const handleRemoveOccu = (itemToRemove) => {
    const updated = recommendedOccupations.filter(o => o !== itemToRemove);
    handleFieldChange('recommended_occupations', updated);
  };

  // Handlers for Skills
  const handleAddSkill = (e) => {
    e.preventDefault();
    const parts = newSkillInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = [...recommendedSkills];
    for (const p of parts) {
      if (!current.includes(p)) current.push(p);
    }
    handleFieldChange('essential_skills', current);
    handleFieldChange('recommended_skills', current);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (itemToRemove) => {
    const updated = recommendedSkills.filter(s => s !== itemToRemove);
    handleFieldChange('essential_skills', updated);
    handleFieldChange('recommended_skills', updated);
  };

  // Handlers for Features
  const handleAddFeature = (e) => {
    e.preventDefault();
    const parts = newFeatureInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const current = [...recommendedFeatures];
    for (const p of parts) {
      if (!current.includes(p)) current.push(p);
    }
    handleFieldChange('signature_features', current);
    handleFieldChange('recommended_features', current);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (itemToRemove) => {
    const updated = recommendedFeatures.filter(f => f !== itemToRemove);
    handleFieldChange('signature_features', updated);
    handleFieldChange('recommended_features', updated);
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
      {/* ── SECTION 1: THEMATIC & BACKGROUND SYNERGIES ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Compass size={14} className="text-purple-400" />
          <span>Thematic & Background Synergies (Cortex Link)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Species lineages whose physiological traits and attribute profiles naturally excel in this archetype role.
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
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
                  <Flag size={13} />
                  <span>Recommended Factions</span>
                </div>
                {isEditMode && onOpenPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'factions', target: 'recommended_factions', label: 'Recommended Factions' })}
                    className="px-2 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Compass size={10} />
                    <span>Cortex Browse</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Major galactic polities, corps, and military divisions actively recruiting or deploying this archetype.
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedFactions.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None specified</span>
              ) : (
                recommendedFactions.map(fa => (
                  <span
                    key={fa}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs font-mono"
                  >
                    <span>{fa}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFaction(fa)}
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

          {/* RECOMMENDED ORIGINS */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
                  <Globe size={13} />
                  <span>Recommended Origins</span>
                </div>
                {isEditMode && onOpenPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'origins', target: 'recommended_origins', label: 'Recommended Origins' })}
                    className="px-2 py-0.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Compass size={10} />
                    <span>Cortex Browse</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Homeworld environments and societal backgrounds that foster the formative skills of this persona.
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedOrigins.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None specified</span>
              ) : (
                recommendedOrigins.map(og => (
                  <span
                    key={og}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 text-xs font-mono"
                  >
                    <span>{og}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOrigin(og)}
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
              <form onSubmit={handleAddOrigin} className="flex gap-1.5">
                <input
                  type="text"
                  value={newOriginInput}
                  onChange={(e) => setNewOriginInput(e.target.value)}
                  placeholder="Add origins (comma-separated)..."
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs font-mono flex items-center justify-center transition-colors"
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
                Career paths providing thematic professional training and matching starting gear allocations.
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

      {/* ── SECTION 2: MECHANICAL & STARTING SYNERGIES ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Zap size={14} className="text-purple-400" />
          <span>Mechanical Allocations & Starting Synergies (Cortex Link)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ESSENTIAL SKILLS */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-400 uppercase">
                  <GraduationCap size={13} />
                  <span>Essential Skills (Priority Allocation)</span>
                </div>
                {isEditMode && onOpenPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'skills', target: 'essential_skills', label: 'Essential Skills' })}
                    className="px-2 py-0.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Compass size={10} />
                    <span>Cortex Browse</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                4 Trained proficiencies and 6 Novice proficiencies prioritized by this archetype chassis.
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/70 border border-blue-500/30 text-blue-200 text-xs font-mono"
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

          {/* SIGNATURE FEATURES */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 uppercase">
                  <Sparkles size={13} />
                  <span>Signature Features (13 BP Allocation)</span>
                </div>
                {isEditMode && onOpenPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'features', target: 'signature_features', label: 'Signature Features' })}
                    className="px-2 py-0.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Compass size={10} />
                    <span>Cortex Browse</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Two 2-BP signature features plus three relative features forming the mechanical core of this archetype.
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedFeatures.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None specified</span>
              ) : (
                recommendedFeatures.map(ft => (
                  <span
                    key={ft}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-200 text-xs font-mono"
                  >
                    <span>{ft}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(ft)}
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
                Searchable descriptive keywords and operational themes (e.g., <em>damage reduction, shield tech, armor repair, frontline tank</em>).
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
                  placeholder="Enter keywords (e.g. logistics, defense, support)..."
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
                Anti-thematic concepts to avoid (e.g., <em>reckless offense, unarmored, pacifism, pure psionics</em>).
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
                  placeholder="Enter negative railguards (e.g. reckless, pacifist)..."
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

export default React.memo(ArchetypeArchitectGuidance);
