import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Globe, 
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
  Flag
} from 'lucide-react';
import { DEFAULT_FACTIONS } from '../../data/factionsData.js';

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
 * FactionArchitectGuidance
 * Renders recommended species, origins, occupations, skills, and features (discounted),
 * plus guidance keywords and negative railguards in Faction Studio / Relations page.
 */
export const FactionArchitectGuidance = ({
  formData = {},
  handleFieldChange,
  isEditMode = false,
  onOpenPicker,
  dbData = {}
}) => {
  const [newSpeciesInput, setNewSpeciesInput] = useState('');
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

    const pool = (Array.isArray(dbData?.factions) && dbData.factions.length > 0) ? dbData.factions : DEFAULT_FACTIONS;
    const found = pool.find(f => {
      const fId = (f.id || '').toString().toLowerCase().trim();
      const fName = (f.name || '').toString().toLowerCase().trim();
      const fTitle = (f.title || '').toString().toLowerCase().trim();
      return (fId && fId === matchId) ||
             (fName && (fName === matchName || fName === matchTitle)) ||
             (fTitle && (fTitle === matchName || fTitle === matchTitle));
    });
    if (found) return found;
    return DEFAULT_FACTIONS.find(f => {
      const fId = (f.id || '').toString().toLowerCase().trim();
      const fName = (f.name || '').toString().toLowerCase().trim();
      const fTitle = (f.title || '').toString().toLowerCase().trim();
      return (fId && fId === matchId) ||
             (fName && (fName === matchName || fName === matchTitle)) ||
             (fTitle && (fTitle === matchName || fTitle === matchTitle));
    }) || null;
  }, [formData.id, formData.name, formData.title, dbData?.factions]);

  const rawRecSpecies = normalizeList(formData.recommended_species);
  const recommendedSpecies = useMemo(() => {
    if (rawRecSpecies.length > 0) return rawRecSpecies;
    return normalizeList(canonicalSeed?.recommended_species);
  }, [rawRecSpecies, canonicalSeed]);

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

  const rawRecSkills = normalizeList(formData.recommended_skills);
  const recommendedSkills = useMemo(() => {
    if (rawRecSkills.length > 0) return rawRecSkills;
    return normalizeList(canonicalSeed?.recommended_skills);
  }, [rawRecSkills, canonicalSeed]);

  const rawRecFeatures = normalizeList(formData.recommended_features);
  const recommendedFeatures = useMemo(() => {
    if (rawRecFeatures.length > 0) return rawRecFeatures;
    return normalizeList(canonicalSeed?.recommended_features);
  }, [rawRecFeatures, canonicalSeed]);

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

  const handleAddOrigin = (e) => {
    if (e) e.preventDefault();
    const parts = newOriginInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...recommendedOrigins];
    for (const part of parts) {
      if (!next.some(o => o.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_origins', next);
    setNewOriginInput('');
  };

  const handleRemoveOrigin = (val) => {
    handleFieldChange('recommended_origins', recommendedOrigins.filter(o => o !== val));
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
      if (!next.some(s => s.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_skills', next);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (val) => {
    handleFieldChange('recommended_skills', recommendedSkills.filter(s => s !== val));
  };

  const handleAddFeature = (e) => {
    if (e) e.preventDefault();
    const parts = newFeatureInput.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...recommendedFeatures];
    for (const part of parts) {
      if (!next.some(f => f.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('recommended_features', next);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (val) => {
    handleFieldChange('recommended_features', recommendedFeatures.filter(f => f !== val));
  };

  const keywordsList = useMemo(() => {
    const raw = (formData.keywords && ((typeof formData.keywords === 'string' && formData.keywords.trim()) || Array.isArray(formData.keywords)))
      ? formData.keywords
      : (canonicalSeed?.keywords || []);
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(k => String(k).trim().replace(/^#+/, '')).filter(Boolean);
    return String(raw).split(/[,;\n]+/).map(k => k.trim().replace(/^#+/, '')).filter(Boolean);
  }, [formData.keywords, canonicalSeed]);

  const negativeKeywordsList = useMemo(() => {
    const raw = (formData.negative_keywords && ((typeof formData.negative_keywords === 'string' && formData.negative_keywords.trim()) || Array.isArray(formData.negative_keywords)))
      ? formData.negative_keywords
      : (canonicalSeed?.negative_keywords || []);
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(k => String(k).trim().replace(/^#+/, '')).filter(Boolean);
    return String(raw).split(/[,;\n]+/).map(k => k.trim().replace(/^#+/, '')).filter(Boolean);
  }, [formData.negative_keywords, canonicalSeed]);

  // Backward compatibility aliases
  const parsedKeywords = keywordsList;
  const parsedNegativeKeywords = negativeKeywordsList;

  const handleAddKeyword = (e) => {
    if (e) e.preventDefault();
    const parts = newKeywordInput.split(',').map(s => s.trim().replace(/^#+/, '')).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...keywordsList];
    for (const part of parts) {
      if (!next.some(k => k.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('keywords', next.join(', '));
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (val) => {
    const next = keywordsList.filter(k => k !== val);
    handleFieldChange('keywords', next.join(', '));
  };

  const handleAddNegativeKeyword = (e) => {
    if (e) e.preventDefault();
    const parts = newNegativeInput.split(',').map(s => s.trim().replace(/^#+/, '')).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...negativeKeywordsList];
    for (const part of parts) {
      if (!next.some(k => k.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    handleFieldChange('negative_keywords', next.join(', '));
    setNewNegativeInput('');
  };

  const handleRemoveNegativeKeyword = (val) => {
    const next = negativeKeywordsList.filter(k => k !== val);
    handleFieldChange('negative_keywords', next.join(', '));
  };

  return (
    <div className="space-y-4 animate-fade-in" data-testid="faction-architect-guidance">
      {/* Header Bar */}
      <div className="p-4 bg-slate-950/70 border border-emerald-500/30 rounded-2xl space-y-1.5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Flag size={14} className="text-emerald-400" />
            <span>Faction Relations, Demographic Alignments & AI Directives</span>
          </label>
          <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest hidden sm:inline">
            Operator & BASTION AI Reference
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Define canonical demographic affinities, key planetary origins, typical professions, cultural skills, and discounted features (-1 CP) for members of this faction, along with AI guidance directives and railguards.
        </p>
      </div>

      {/* Row 1: Foundational Demographic Triplet (Species, Origins, Occupations) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Recommended Species */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Users size={12} className="text-sky-400" />
                <span>Recommended Species</span>
              </span>
              {isEditMode && onOpenPicker && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({ source: 'species', target: 'recommended_species', label: 'Recommended Species' })}
                  className="px-2 py-0.5 bg-sky-950/70 hover:bg-sky-900 border border-sky-500/40 text-sky-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                  title="Browse cortex species"
                >
                  <Compass size={10} />
                  <span>Browse</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {recommendedSpecies.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono py-0.5">None specified</span>
              ) : (
                recommendedSpecies.map(sp => (
                  <span
                    key={sp}
                    className="px-2 py-0.5 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-200 text-[10px] font-mono flex items-center gap-1 shadow-sm"
                  >
                    <span>{sp}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecies(sp)}
                        className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title={`Remove ${sp}`}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
          {isEditMode && (
            <div className="flex items-center gap-1 pt-1 border-t border-slate-800/60">
              <input
                type="text"
                value={newSpeciesInput}
                onChange={(e) => setNewSpeciesInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSpecies(); } }}
                placeholder="Add species..."
                className="flex-1 p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-[10px] font-mono text-white focus:outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={handleAddSpecies}
                className="p-1.5 bg-sky-950 hover:bg-sky-900 text-sky-300 rounded-lg border border-sky-500/40 transition-colors cursor-pointer"
                title="Add species"
              >
                <Plus size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Recommended Origins */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Globe size={12} className="text-emerald-400" />
                <span>Recommended Origins</span>
              </span>
              {isEditMode && onOpenPicker && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({ source: 'origins', target: 'recommended_origins', label: 'Recommended Origins' })}
                  className="px-2 py-0.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                  title="Browse cortex origins"
                >
                  <Compass size={10} />
                  <span>Browse</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {recommendedOrigins.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono py-0.5">None specified</span>
              ) : (
                recommendedOrigins.map(orig => (
                  <span
                    key={orig}
                    className="px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-[10px] font-mono flex items-center gap-1 shadow-sm"
                  >
                    <span>{orig}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOrigin(orig)}
                        className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title={`Remove ${orig}`}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
          {isEditMode && (
            <div className="flex items-center gap-1 pt-1 border-t border-slate-800/60">
              <input
                type="text"
                value={newOriginInput}
                onChange={(e) => setNewOriginInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOrigin(); } }}
                placeholder="Add origin..."
                className="flex-1 p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-[10px] font-mono text-white focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={handleAddOrigin}
                className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-500/40 transition-colors cursor-pointer"
                title="Add origin"
              >
                <Plus size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Recommended Occupations */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Briefcase size={12} className="text-amber-400" />
                <span>Recommended Occupations</span>
              </span>
              {isEditMode && onOpenPicker && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({ source: 'occupations', target: 'recommended_occupations', label: 'Recommended Occupations' })}
                  className="px-2 py-0.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                  title="Browse cortex occupations"
                >
                  <Compass size={10} />
                  <span>Browse</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {recommendedOccupations.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono py-0.5">None specified</span>
              ) : (
                recommendedOccupations.map(occ => (
                  <span
                    key={occ}
                    className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-200 text-[10px] font-mono flex items-center gap-1 shadow-sm"
                  >
                    <span>{occ}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOccu(occ)}
                        className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title={`Remove ${occ}`}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
          {isEditMode && (
            <div className="flex items-center gap-1 pt-1 border-t border-slate-800/60">
              <input
                type="text"
                value={newOccuInput}
                onChange={(e) => setNewOccuInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOccu(); } }}
                placeholder="Add occupation..."
                className="flex-1 p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-[10px] font-mono text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddOccu}
                className="p-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 rounded-lg border border-amber-500/40 transition-colors cursor-pointer"
                title="Add occupation"
              >
                <Plus size={11} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Skills & Discounted Features (Cortex Entity Selectors) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="faction-recommended-skills-features">
        {/* Recommended Skills */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <GraduationCap size={13} className="text-cyan-400" />
                <span>Recommended Skills</span>
              </span>
              {isEditMode && onOpenPicker && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({ source: 'skills', target: 'recommended_skills', label: 'Recommended Skills' })}
                  className="px-2 py-0.5 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                  title="Browse cortex skills"
                >
                  <Compass size={10} />
                  <span>Browse</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {recommendedSkills.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono py-0.5">None specified</span>
              ) : (
                recommendedSkills.map(sk => (
                  <span
                    key={sk}
                    className="px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 text-[10px] font-mono flex items-center gap-1 shadow-sm"
                  >
                    <span>{sk}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk)}
                        className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title={`Remove ${sk}`}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
          {isEditMode && (
            <div className="flex items-center gap-1 pt-1 border-t border-slate-800/60">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                placeholder="Add skill..."
                className="flex-1 p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-[10px] font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="p-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 rounded-lg border border-cyan-500/40 transition-colors cursor-pointer"
                title="Add skill"
              >
                <Plus size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Recommended Features (for Discount) */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-violet-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Zap size={13} className="text-violet-400" />
                <span>Recommended Features</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-950 border border-violet-500/50 text-violet-300 font-mono">
                  -1 CP Discount
                </span>
              </span>
              {isEditMode && onOpenPicker && (
                <button
                  type="button"
                  onClick={() => onOpenPicker({ source: 'features', target: 'recommended_features', label: 'Recommended Features' })}
                  className="px-2 py-0.5 bg-violet-950/70 hover:bg-violet-900 border border-violet-500/40 text-violet-300 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                  title="Browse cortex features"
                >
                  <Compass size={10} />
                  <span>Browse</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {recommendedFeatures.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono py-0.5">None specified</span>
              ) : (
                recommendedFeatures.map(feat => (
                  <span
                    key={feat}
                    className="px-2 py-0.5 rounded-lg bg-violet-950/60 border border-violet-500/30 text-violet-200 text-[10px] font-mono flex items-center gap-1 shadow-sm"
                  >
                    <span>{feat}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feat)}
                        className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title={`Remove ${feat}`}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
          {isEditMode && (
            <div className="flex items-center gap-1 pt-1 border-t border-slate-800/60">
              <input
                type="text"
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                placeholder="Add feature..."
                className="flex-1 p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-[10px] font-mono text-white focus:outline-none focus:border-violet-400"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="p-1.5 bg-violet-950 hover:bg-violet-900 text-violet-300 rounded-lg border border-violet-500/40 transition-colors cursor-pointer"
                title="Add feature"
              >
                <Plus size={11} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Guidance Directives & Railguard Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Positive Guidance Keywords */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Tag size={12} className="text-purple-400" />
                <span>Guidance Keywords (Directives)</span>
              </span>
              <span className="text-[10px] font-mono text-purple-400/70 font-normal">
                Recommended / Thematic
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-500">
              Searchable keywords adding weight to AI persona creation & vector RAG retrieval.
            </p>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {keywordsList.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono py-0.5">None specified</span>
              ) : (
                keywordsList.map(kw => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[10px] font-mono flex items-center gap-1 shadow-sm"
                  >
                    <span>#{kw}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title={`Remove #${kw}`}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
          {isEditMode && (
            <div className="flex items-center gap-1 pt-1 border-t border-slate-800/60">
              <input
                type="text"
                value={newKeywordInput}
                onChange={(e) => setNewKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword(e);
                  }
                }}
                placeholder="Add keyword..."
                className="flex-1 p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-[10px] font-mono text-white focus:outline-none focus:border-purple-400"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="p-1.5 bg-purple-950 hover:bg-purple-900 text-purple-300 rounded-lg border border-purple-500/40 transition-colors cursor-pointer"
                title="Add keyword"
              >
                <Plus size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Negative Railguards & Constraints */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/40 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-rose-400" />
                <span>Negative Keywords (Railguards)</span>
              </span>
              <span className="text-[10px] font-mono text-rose-400/80 font-normal">
                Not Recommended / Avoided
              </span>
            </div>
            <p className="text-[10px] font-mono text-rose-400/70">
              Searchable railguards reducing weight/penalizing conflicting AI character synthesis and guiding GM filters.
            </p>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {negativeKeywordsList.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono py-0.5">None specified</span>
              ) : (
                negativeKeywordsList.map(kw => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-200 text-[10px] font-mono flex items-center gap-1 shadow-sm"
                  >
                    <Ban size={9} className="text-rose-400" />
                    <span>#{kw}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNegativeKeyword(kw)}
                        className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title={`Remove #${kw}`}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
          {isEditMode && (
            <div className="flex items-center gap-1 pt-1 border-t border-slate-800/60">
              <input
                type="text"
                value={newNegativeInput}
                onChange={(e) => setNewNegativeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNegativeKeyword(e);
                  }
                }}
                placeholder="Add negative railguard..."
                className="flex-1 p-1.5 bg-slate-900/90 border border-rose-800/60 rounded-lg text-[10px] font-mono text-white focus:outline-none focus:border-rose-400"
              />
              <button
                type="button"
                onClick={handleAddNegativeKeyword}
                className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-500/40 transition-colors cursor-pointer"
                title="Add negative keyword"
              >
                <Plus size={11} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FactionArchitectGuidance;
