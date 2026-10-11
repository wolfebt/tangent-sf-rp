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
  Wand2,
  Zap,
  Globe,
  Flame,
  Layers,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { DEFAULT_INVOCATIONS } from '../../data/invocationsData.js';

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
 * Canonical Discipline Presets for Invocations & Magic
 */
const DISCIPLINE_PRESETS = {
  entropy: {
    species: ['Tenen (Sha’nor Spectral)', 'Shanor (Base)', 'Rautha Human', 'Eakren (Corrupted Aberration)'],
    factions: ['The Outworlds', 'Religious Cult Faction Template', 'Supernatural Faction Template'],
    origins: ['Hostile', 'Enlightened', 'Spacer'],
    occupations: ['Adept', 'Drifter', 'Criminal', 'Specialist'],
    keywords: 'entropy, cellular-decay, necrosis, dissolution, chaotic-resonance, dark-matter, entropy-surge',
    negative_keywords: 'divine-healing, sterile-cleanroom, municipal-order, corporate-routine'
  },
  dimension: {
    species: ['Whisper', 'Eidolon (Aetherion Specialist)', 'Varen (Gatekeeper)', 'Mobula'],
    factions: ['The Ascendancy', 'The Alterian Enclave', 'Space Exploration Faction Template'],
    origins: ['Enlightened', 'Spacer', 'Research'],
    occupations: ['Adept', 'Scout', 'Specialist', 'Agent'],
    keywords: 'teleportation, spatial-distortion, rift-gate, dimensional-shift, slipstream, fold-space, blink',
    negative_keywords: 'grounded-earth, slow-trench-warfare, heavy-sedentary, crude-machinery'
  },
  energy: {
    species: ['Draconian (Scaled Aeld)', 'Janissary (Gen-E)', 'Cyberform Human', 'Impyrium Regi (Gen-E)'],
    factions: ['Military Faction Template', 'Radiant Impyrium', 'Dracon Dynasty', 'The Ascendancy'],
    origins: ['Militaristic', 'Industrial', 'Enlightened', 'Colony'],
    occupations: ['Soldier', 'Adept', 'Specialist', 'Builder'],
    keywords: 'plasma-blast, kinetic-shield, electro-arc, thermic-lance, coherent-energy, force-barrier, ionized-fire',
    negative_keywords: 'pacifist-retreat, subtle-subconscious, silent-monk, low-energy'
  },
  mental: {
    species: ['Celestine (Alterian)', 'Whisper', 'Sigal', 'Intellect Construct (Pure AI)', 'Doppelganger (Shifter)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Interstellar Diplomats Faction Template'],
    origins: ['Enlightened', 'Research', 'Urban'],
    occupations: ['Adept', 'Scholar', 'Agent', 'Representative'],
    keywords: 'telepathy, psionic-overload, synaptic-jam, mind-probe, psychic-resonance, astral-sight, cognitive-link',
    negative_keywords: 'mindless-brute, crude-mechanics, illiterate-thug, null-magic'
  },
  matter: {
    species: ['Golem (Arcane Construct)', 'Dwerg Human', 'Biomechanical Synthetic', 'Mekan (Assimilation Unit)'],
    factions: ['The Mekan Collective', 'Technological Faction Template', 'Coalition of Independent Worlds'],
    origins: ['Industrial', 'Research', 'Colony'],
    occupations: ['Builder', 'Specialist', 'Adept', 'Scholar'],
    keywords: 'transmutation, molecular-restructuring, density-alteration, construct-fabrication, material-hardening',
    negative_keywords: 'pure-ethereal, non-physical, frivolous-illusion, fragile-glass'
  }
};

/**
 * InvocationArchitectGuidance
 * Renders recommended species, factions, origins, and occupations,
 * plus guidance keywords and negative railguards in Invocation Studio / Relations page.
 */
export const InvocationArchitectGuidance = ({
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
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [newNegativeInput, setNewNegativeInput] = useState('');

  // Resilient canonical seed lookup
  const canonicalSeed = useMemo(() => {
    if (!formData.name && !formData.id && !formData.title) return null;
    const matchId = (formData.id || '').toString().toLowerCase().trim();
    const matchName = (formData.name || '').toString().toLowerCase().trim();
    const matchTitle = (formData.title || '').toString().toLowerCase().trim();

    const pool = (Array.isArray(dbData?.invocations) && dbData.invocations.length > 0) ? dbData.invocations : DEFAULT_INVOCATIONS;
    const found = pool.find(i => {
      const iId = (i.id || '').toString().toLowerCase().trim();
      const iName = (i.name || '').toString().toLowerCase().trim();
      const iTitle = (i.title || '').toString().toLowerCase().trim();
      return (iId && iId === matchId) ||
             (iName && (iName === matchName || iName === matchTitle)) ||
             (iTitle && (iTitle === matchName || iTitle === matchTitle));
    });
    if (found) return found;
    return DEFAULT_INVOCATIONS.find(i => {
      const iId = (i.id || '').toString().toLowerCase().trim();
      const iName = (i.name || '').toString().toLowerCase().trim();
      const iTitle = (i.title || '').toString().toLowerCase().trim();
      return (iId && iId === matchId) ||
             (iName && (iName === matchName || iName === matchTitle)) ||
             (iTitle && (iTitle === matchName || iTitle === matchTitle));
    }) || null;
  }, [formData.id, formData.name, formData.title, dbData?.invocations]);

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

  const keywordsList = useMemo(() => {
    const raw = (formData.keywords && ((typeof formData.keywords === 'string' && formData.keywords.trim()) || Array.isArray(formData.keywords)))
      ? formData.keywords
      : (canonicalSeed?.keywords || []);
    return normalizeList(raw);
  }, [formData.keywords, canonicalSeed]);

  const negativeKeywordsList = useMemo(() => {
    const raw = (formData.negative_keywords && ((typeof formData.negative_keywords === 'string' && formData.negative_keywords.trim()) || Array.isArray(formData.negative_keywords)))
      ? formData.negative_keywords
      : (canonicalSeed?.negative_keywords || []);
    return normalizeList(raw);
  }, [formData.negative_keywords, canonicalSeed]);

  // Detected discipline
  const detectedDiscipline = useMemo(() => {
    const raw = String(formData.discipline || '').toLowerCase();
    if (raw.includes('entropy') || raw.includes('decay') || raw.includes('necro')) return 'entropy';
    if (raw.includes('dimen') || raw.includes('teleport') || raw.includes('spatial') || raw.includes('rift')) return 'dimension';
    if (raw.includes('energy') || raw.includes('plasma') || raw.includes('force') || raw.includes('fire') || raw.includes('pyro')) return 'energy';
    if (raw.includes('matter') || raw.includes('transmut') || raw.includes('creation') || raw.includes('construct')) return 'matter';
    return 'mental';
  }, [formData.discipline]);

  // Apply discipline preset
  const handleApplyPreset = (discKey) => {
    if (!isEditMode) return;
    const preset = DISCIPLINE_PRESETS[discKey] || DISCIPLINE_PRESETS.mental;
    
    // Merge unique species
    const nextSpecies = Array.from(new Set([...recommendedSpecies, ...preset.species]));
    handleFieldChange('recommended_species', nextSpecies);

    // Merge unique factions
    const nextFactions = Array.from(new Set([...recommendedFactions, ...preset.factions]));
    handleFieldChange('recommended_factions', nextFactions);

    // Merge unique origins
    const nextOrigins = Array.from(new Set([...recommendedOrigins, ...preset.origins]));
    handleFieldChange('recommended_origins', nextOrigins);

    // Merge unique occupations
    const nextOccs = Array.from(new Set([...recommendedOccupations, ...preset.occupations]));
    handleFieldChange('recommended_occupations', nextOccs);

    // Append keywords
    const currKws = formData.keywords ? formData.keywords.trim() : '';
    const newKws = currKws ? `${currKws}, ${preset.keywords}` : preset.keywords;
    handleFieldChange('keywords', newKws);

    // Append negative keywords
    const currNeg = formData.negative_keywords ? formData.negative_keywords.trim() : '';
    const newNeg = currNeg ? `${currNeg}, ${preset.negative_keywords}` : preset.negative_keywords;
    handleFieldChange('negative_keywords', newNeg);
  };

  // Species handlers
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

  // Factions handlers
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

  // Origins handlers
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

  // Occupations handlers
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

  // Keyword handlers
  const handleAddKeyword = (e) => {
    if (e) e.preventDefault();
    const parts = newKeywordInput.split(',').map(s => s.trim()).filter(Boolean);
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

  // Negative keyword handlers
  const handleAddNegativeKeyword = (e) => {
    if (e) e.preventDefault();
    const parts = newNegativeInput.split(',').map(s => s.trim()).filter(Boolean);
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
    <div className="space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="p-4 bg-slate-950/80 border border-purple-500/40 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Wand2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-purple-300">
                Invocation Relational Cross-Linkage &amp; Directives
              </h3>
              <p className="text-xs text-slate-400">
                Establish 4-pillar cultural affinities and AI steering directives for this metaphysical power.
              </p>
            </div>
          </div>

          {isEditMode && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset(detectedDiscipline)}
                className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title={`Autofill baseline recommendations for ${detectedDiscipline} discipline`}
              >
                <Sparkles size={12} className="text-purple-400" />
                <span>Apply {detectedDiscipline.toUpperCase()} Preset</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 1: CULTURAL CROSS-LINKAGE (4 PILLARS) ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Compass size={14} className="text-purple-400" />
          <span>Cultural &amp; Identity Cross-Linkage (Four Pillars)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. RECOMMENDED SPECIES */}
          <div className="bg-slate-950/60 border border-cyan-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
                  <Users size={13} />
                  <span>Recommended Species</span>
                </div>
                {onOpenPicker && isEditMode && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'species', target: 'recommended_species', label: 'Recommended Species' })}
                    className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 transition-colors"
                  >
                    + Browse Cortex
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Species with biological, psionic, or cultural affinity for this power (e.g. <em>Celestine, Whisper, Sigal, Draconian</em>).
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedSpecies.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None linked</span>
              ) : (
                recommendedSpecies.map(sp => (
                  <span
                    key={sp}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 text-xs font-mono"
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

          {/* 2. RECOMMENDED FACTIONS */}
          <div className="bg-slate-950/60 border border-purple-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 uppercase">
                  <Flag size={13} />
                  <span>Recommended Factions</span>
                </div>
                {onOpenPicker && isEditMode && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'factions', target: 'recommended_factions', label: 'Recommended Factions' })}
                    className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:bg-purple-900 transition-colors"
                  >
                    + Browse Cortex
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Factions that actively train, deploy, or hold traditions associated with this power (e.g. <em>The Alterian Enclave, The Ascendancy</em>).
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedFactions.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None linked</span>
              ) : (
                recommendedFactions.map(f => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-200 text-xs font-mono"
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

          {/* 3. RECOMMENDED ORIGINS */}
          <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
                  <Globe size={13} />
                  <span>Recommended Origins</span>
                </div>
                {onOpenPicker && isEditMode && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'origins', target: 'recommended_origins', label: 'Recommended Origins' })}
                    className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 transition-colors"
                  >
                    + Browse Cortex
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Planetary or spatial environments where this reality manipulation flourishes (e.g. <em>Enlightened, Research, Hostile, Spacer</em>).
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedOrigins.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None linked</span>
              ) : (
                recommendedOrigins.map(o => (
                  <span
                    key={o}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs font-mono"
                  >
                    <span>{o}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOrigin(o)}
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

          {/* 4. RECOMMENDED OCCUPATIONS */}
          <div className="bg-slate-950/60 border border-sky-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400 uppercase">
                  <Briefcase size={13} />
                  <span>Recommended Occupations</span>
                </div>
                {onOpenPicker && isEditMode && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ source: 'occupations', target: 'recommended_occupations', label: 'Recommended Occupations' })}
                    className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/40 text-sky-300 hover:bg-sky-900 transition-colors"
                  >
                    + Browse Cortex
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Vocation careers with professional training suited to this power (e.g. <em>Adept, Scholar, Specialist, Agent, Soldier</em>).
              </p>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg">
              {recommendedOccupations.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono self-center">None linked</span>
              ) : (
                recommendedOccupations.map(oc => (
                  <span
                    key={oc}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30 text-sky-200 text-xs font-mono"
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
        </div>
      </div>

      {/* ── SECTION 2: AI REFERENCE & OPERATOR DIRECTIVES ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2">
          <Tag size={14} className="text-purple-400" />
          <span>AI Guidance Directives &amp; Railguards (Operator &amp; Engine Weights)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* POSITIVE DIRECTIVES / KEYWORDS */}
          <div className="bg-slate-950/60 border border-purple-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 uppercase">
                  <Tag size={13} />
                  <span>Positive Directives / Keywords</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-950/80 border border-purple-500/30 px-1.5 py-0.5 rounded">
                  +Weight in BASTION AI &amp; RAG
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Searchable descriptive keywords, sensory effects, and ritual components (e.g., <em>psionic, telekinesis, mind-blast, aetheric</em>).
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-200 text-xs font-mono"
                  >
                    <span>#{kw}</span>
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
                  placeholder="Enter keywords (e.g. psionic, telekinesis)..."
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
                Searchable concepts to avoid (e.g., <em>mundane-bureaucracy, anti-magic, crude-industrial, brute-force-only</em>).
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
                    <span>#{nkw}</span>
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
                  placeholder="Enter negative railguards (e.g. mundane, anti-magic)..."
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

export default InvocationArchitectGuidance;
