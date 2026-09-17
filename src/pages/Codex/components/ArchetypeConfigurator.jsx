import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Compass, 
  Sparkles, 
  BookOpen, 
  Plus, 
  X, 
  Users, 
  Award, 
  Shield, 
  Zap, 
  Target, 
  Tag, 
  Globe, 
  Flag,
  Briefcase
} from 'lucide-react';
import { CodexTooltip } from '../../../components/UI/CodexTooltip';

const SPHERES = [
  { id: 'sentinels', name: 'Sentinels (The Stabilizers)', focus: 'Logistics, Protection, Tradition, and Economy' },
  { id: 'operatives', name: 'Operatives (The Artisans)', focus: 'Action, Adaptability, Performance, and Risk' },
  { id: 'visionaries', name: 'Visionaries (The Idealists)', focus: 'Identity, Meaning, Connection, and Influence' },
  { id: 'savants', name: 'Savants (The Rationals)', focus: 'Competence, Knowledge, Systems, and Strategy' }
];

const ATTRIBUTES = [
  'Strength',
  'Agility',
  'Constitution',
  'Intellect',
  'Perception',
  'Charisma',
  'Willpower',
  'Wisdom'
];

/**
 * ArchetypeConfigurator
 * Specialized Studio configurator for the Archetypes Matrix in OmniCortex / Codex Suite.
 * Aligns with 1.02 ARCHETYPES.md canonical rules:
 * - 80 BP Chassis Allocation Formula (+3 Primary, +2 Secondary, 4 Trained + 6 Novice skills, Signature Features)
 * - Decoupled from modular NPC adversary chassis (no threat tier, no adversary designation, no boss multiplier, no TL/ML)
 * - Sphere / Focus (Sentinels, Operatives, Visionaries, Savants)
 * - Essential Skills (Priority 4 Trained @ 6 + 6 Novice @ 3)
 * - Signature Features (2 discounted @ 2 BP + 3 relative @ 3 BP)
 * - Recommended Occupations, Origins, and Factions
 * - Tactical Role, Mantra / Quote, and Full Rules Text
 */
export const ArchetypeConfigurator = ({
  formData = {},
  onChange,
  isEditMode = false,
  dbData = {}
}) => {
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newOccuInput, setNewOccuInput] = useState('');
  const [newOriginInput, setNewOriginInput] = useState('');
  const [newFactionInput, setNewFactionInput] = useState('');

  const essentialSkills = useMemo(() => {
    if (Array.isArray(formData.essential_skills)) return formData.essential_skills;
    if (typeof formData.essential_skills === 'string') {
      return formData.essential_skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }, [formData.essential_skills]);

  const signatureFeatures = useMemo(() => {
    if (Array.isArray(formData.signature_features)) return formData.signature_features;
    if (typeof formData.signature_features === 'string') {
      return formData.signature_features.split(',').map(f => f.trim()).filter(Boolean);
    }
    return [];
  }, [formData.signature_features]);

  const recommendedOccupations = useMemo(() => {
    if (Array.isArray(formData.recommended_occupations)) return formData.recommended_occupations;
    if (typeof formData.recommended_occupations === 'string') {
      return formData.recommended_occupations.split(',').map(o => o.trim()).filter(Boolean);
    }
    return [];
  }, [formData.recommended_occupations]);

  const recommendedOrigins = useMemo(() => {
    if (Array.isArray(formData.recommended_origins)) return formData.recommended_origins;
    if (typeof formData.recommended_origins === 'string') {
      return formData.recommended_origins.split(',').map(o => o.trim()).filter(Boolean);
    }
    return [];
  }, [formData.recommended_origins]);

  const recommendedFactions = useMemo(() => {
    if (Array.isArray(formData.recommended_factions)) return formData.recommended_factions;
    if (typeof formData.recommended_factions === 'string') {
      return formData.recommended_factions.split(',').map(f => f.trim()).filter(Boolean);
    }
    return [];
  }, [formData.recommended_factions]);

  // Handlers for adding/removing items
  const handleAddSkill = () => {
    const val = newSkillInput.trim();
    if (!val || essentialSkills.includes(val)) return;
    const updated = [...essentialSkills, val];
    onChange('essential_skills', updated);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = essentialSkills.filter(s => s !== skillToRemove);
    onChange('essential_skills', updated);
  };

  const handleAddFeature = () => {
    const val = newFeatureInput.trim();
    if (!val || signatureFeatures.includes(val)) return;
    const updated = [...signatureFeatures, val];
    onChange('signature_features', updated);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (featToRemove) => {
    const updated = signatureFeatures.filter(f => f !== featToRemove);
    onChange('signature_features', updated);
  };

  const handleAddOccupation = () => {
    const val = newOccuInput.trim();
    if (!val || recommendedOccupations.includes(val)) return;
    const updated = [...recommendedOccupations, val];
    onChange('recommended_occupations', updated);
    setNewOccuInput('');
  };

  const handleRemoveOccupation = (item) => {
    const updated = recommendedOccupations.filter(o => o !== item);
    onChange('recommended_occupations', updated);
  };

  const handleAddOrigin = () => {
    const val = newOriginInput.trim();
    if (!val || recommendedOrigins.includes(val)) return;
    const updated = [...recommendedOrigins, val];
    onChange('recommended_origins', updated);
    setNewOriginInput('');
  };

  const handleRemoveOrigin = (item) => {
    const updated = recommendedOrigins.filter(o => o !== item);
    onChange('recommended_origins', updated);
  };

  const handleAddFaction = () => {
    const val = newFactionInput.trim();
    if (!val || recommendedFactions.includes(val)) return;
    const updated = [...recommendedFactions, val];
    onChange('recommended_factions', updated);
    setNewFactionInput('');
  };

  const handleRemoveFaction = (item) => {
    const updated = recommendedFactions.filter(f => f !== item);
    onChange('recommended_factions', updated);
  };

  return (
    <div className="space-y-6 text-slate-200 font-sans">

      {/* ── Rulebook Alignment Banner (1.02 ARCHETYPES.MD) ── */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-300">
              BASTION 1.02 Canonical Archetype Profile
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/80 border border-indigo-500/50 text-indigo-200 font-bold uppercase">
            {formData.sphere || 'Thematic Sphere'}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Archetypes bridge the gap between abstract Build Points (BP) and a functional narrative role. 
          Each entry defines a thematic <strong>80 BP Chassis</strong>—a set of prioritized attributes, essential skills, and signature features. 
          Archetypes are <strong>not adversary chassis</strong> and have no threat tiers, boss multipliers, or adversary designations.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-indigo-400 font-bold">+3 Primary (15 BP)</span>
            <span className="text-slate-400 text-[10px]">{formData.primary_attribute || 'Intellect'}</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-indigo-400 font-bold">+2 Secondary (10 BP)</span>
            <span className="text-slate-400 text-[10px]">{formData.secondary_attribute || 'Charisma'}</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-purple-400 font-bold">Skills Package (42 BP)</span>
            <span className="text-slate-400 text-[10px]">4 Trained (24) + 6 Novice (18)</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-emerald-400 font-bold">Features (13 BP)</span>
            <span className="text-slate-400 text-[10px]">2 Signature (4) + 3 Relative (9)</span>
          </div>
        </div>
      </div>

      {/* ── Section 1: Sphere, Concept & Mantra ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Core Concept & Sphere Alignment
            </h4>
          </div>
          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/30">
            80 BP Chassis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Sphere Selection */}
          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Sphere / Thematic Focus
            </label>
            {isEditMode ? (
              <select
                value={formData.sphere || 'Sentinels (The Stabilizers)'}
                onChange={(e) => onChange('sphere', e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-400"
              >
                {SPHERES.map(s => (
                  <option key={s.id} value={s.name}>{s.name} — {s.focus}</option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-mono text-indigo-300 font-bold">
                {formData.sphere || 'Sentinels (The Stabilizers)'}
              </div>
            )}
          </div>

          {/* Core Concept */}
          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Core Concept
            </label>
            {isEditMode ? (
              <input
                type="text"
                value={formData.core_concept || ''}
                onChange={(e) => onChange('core_concept', e.target.value)}
                placeholder="E.g., Logistics / Support / Social Tank"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
              >
              </input>
            ) : (
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-200">
                {formData.core_concept || 'None specified.'}
              </div>
            )}
          </div>
        </div>

        {/* Mantra / Quote */}
        <div className="space-y-1">
          <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Mantra / Archetype Quote
          </label>
          {isEditMode ? (
            <input
              type="text"
              value={formData.quote || ''}
              onChange={(e) => onChange('quote', e.target.value)}
              placeholder='E.g., "Amateurs talk strategy. Professionals talk logistics. Now sign here."'
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-200 italic focus:outline-none focus:border-indigo-400"
            />
          ) : (
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-mono text-amber-300/90 italic">
              {formData.quote ? `"${formData.quote.replace(/^["']|["']$/g, '')}"` : 'No mantra recorded.'}
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Key Attributes (Chassis Allocation) ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Key Attributes (+3 Primary / +2 Secondary)
            </h4>
            <CodexTooltip
              title="Key Attributes (25 BP Total)"
              description="Part of the 80 BP Chassis Allocation Formula: +3 to Primary Attribute (15 BP) and +2 to Secondary Attribute (10 BP)."
              rule="1.02 ARCHETYPES.md"
              color="#f59e0b"
            />
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300">
            25 BP Allocated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Primary Attribute (+3 Bonus / 15 BP)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300">
                +3 Score
              </span>
            </div>
            {isEditMode ? (
              <select
                value={formData.primary_attribute || 'Intellect'}
                onChange={(e) => onChange('primary_attribute', e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
              >
                {ATTRIBUTES.map(attr => (
                  <option key={attr} value={attr}>{attr}</option>
                ))}
              </select>
            ) : (
              <div className="text-sm font-mono font-bold text-white">
                {formData.primary_attribute || 'Intellect'}
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-sans">
              Highest natural attribute governing essential skills and dual-resolution attack rolls.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                Secondary Attribute (+2 Bonus / 10 BP)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-purple-950 border border-purple-500/40 text-purple-300">
                +2 Score
              </span>
            </div>
            {isEditMode ? (
              <select
                value={formData.secondary_attribute || 'Charisma'}
                onChange={(e) => onChange('secondary_attribute', e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-400"
              >
                {ATTRIBUTES.map(attr => (
                  <option key={attr} value={attr}>{attr}</option>
                ))}
              </select>
            ) : (
              <div className="text-sm font-mono font-bold text-white">
                {formData.secondary_attribute || 'Charisma'}
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-sans">
              Complementary attribute governing secondary checks, vitality defenses, and tactical saves.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 3: Essential Skills (4 Trained + 6 Novice) ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Essential Skills (4 Trained @ 6 + 6 Novice @ 3 Priority)
            </h4>
            <CodexTooltip
              title="Essential Skills (42 BP)"
              description="4 Skills at Trained Tier (level 6 for 24 BP) & 6 Skills at Novice Tier (level 3 for 18 BP) — Essential Skills prioritized first."
              rule="1.02 ARCHETYPES.md"
              color="#6366f1"
            />
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300">
            42 BP Package
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Core proficiencies prioritized by this archetype chassis. During Folio instantiation, essential skills receive priority allocation:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {essentialSkills.length === 0 ? (
            <span className="text-xs text-slate-500 italic font-mono">No essential skills defined.</span>
          ) : (
            essentialSkills.map(skill => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 flex items-center gap-1.5 shadow-sm"
              >
                <span>{skill}</span>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                    title="Remove skill"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))
          )}
        </div>

        {isEditMode && (
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              placeholder="Add essential skill (e.g. Diplomacy, Insight, Combat)..."
              className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Skill</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 4: Signature Features (13 BP Total) ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Signature Features (2 Recommended @ 2 BP + 3 Relative @ 3 BP)
            </h4>
            <CodexTooltip
              title="Signature Features (13 BP)"
              description="Two recommended Signature Features (discounted to 2 BP each) plus three other relative Features (9 BP)."
              rule="1.02 ARCHETYPES.md"
              color="#8b5cf6"
            />
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300">
            13 BP Allocated
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Iconic abilities defining this archetype's narrative momentum and tactical flair:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {signatureFeatures.length === 0 ? (
            <span className="text-xs text-slate-500 italic font-mono">No signature features listed.</span>
          ) : (
            signatureFeatures.map(feat => (
              <span
                key={feat}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-950/60 border border-purple-500/40 text-purple-200 flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles size={11} className="text-purple-400" />
                <span>{feat}</span>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(feat)}
                    className="text-slate-400 hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                    title="Remove feature"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))
          )}
        </div>

        {isEditMode && (
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={newFeatureInput}
              onChange={(e) => setNewFeatureInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
              placeholder="Add signature feature name..."
              className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-400"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-3 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Feature</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 5: Recommended Interconnections (Occupations, Origins, Factions) ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <Users className="w-4 h-4 text-indigo-400" />
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Recommended Narrative Interconnections (Tripartite Identity)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Recommended Occupations */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
              <Briefcase size={12} className="text-amber-400" />
              <span>Recommended Occupations</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recommendedOccupations.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono">None specified</span>
              ) : (
                recommendedOccupations.map(occ => (
                  <span key={occ} className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-200 text-[10px] font-mono flex items-center gap-1">
                    <span>{occ}</span>
                    {isEditMode && (
                      <button type="button" onClick={() => handleRemoveOccupation(occ)} className="hover:text-red-400">
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
            {isEditMode && (
              <div className="flex items-center gap-1 pt-1">
                <input
                  type="text"
                  value={newOccuInput}
                  onChange={(e) => setNewOccuInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOccupation(); } }}
                  placeholder="Add occupation..."
                  className="flex-1 p-1 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-white"
                />
                <button type="button" onClick={handleAddOccupation} className="p-1 bg-amber-950 text-amber-300 rounded border border-amber-500/40">
                  <Plus size={10} />
                </button>
              </div>
            )}
          </div>

          {/* Recommended Origins */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
              <Globe size={12} className="text-emerald-400" />
              <span>Recommended Origins</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recommendedOrigins.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono">None specified</span>
              ) : (
                recommendedOrigins.map(orig => (
                  <span key={orig} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-[10px] font-mono flex items-center gap-1">
                    <span>{orig}</span>
                    {isEditMode && (
                      <button type="button" onClick={() => handleRemoveOrigin(orig)} className="hover:text-red-400">
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
            {isEditMode && (
              <div className="flex items-center gap-1 pt-1">
                <input
                  type="text"
                  value={newOriginInput}
                  onChange={(e) => setNewOriginInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOrigin(); } }}
                  placeholder="Add origin..."
                  className="flex-1 p-1 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-white"
                />
                <button type="button" onClick={handleAddOrigin} className="p-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-500/40">
                  <Plus size={10} />
                </button>
              </div>
            )}
          </div>

          {/* Recommended Factions */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
              <Flag size={12} className="text-sky-400" />
              <span>Recommended Factions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recommendedFactions.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-mono">None specified</span>
              ) : (
                recommendedFactions.map(fac => (
                  <span key={fac} className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-500/30 text-sky-200 text-[10px] font-mono flex items-center gap-1">
                    <span>{fac}</span>
                    {isEditMode && (
                      <button type="button" onClick={() => handleRemoveFaction(fac)} className="hover:text-red-400">
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
            {isEditMode && (
              <div className="flex items-center gap-1 pt-1">
                <input
                  type="text"
                  value={newFactionInput}
                  onChange={(e) => setNewFactionInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFaction(); } }}
                  placeholder="Add faction..."
                  className="flex-1 p-1 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-white"
                />
                <button type="button" onClick={handleAddFaction} className="p-1 bg-sky-950 text-sky-300 rounded border border-sky-500/40">
                  <Plus size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 6: Tactical Role & Operational Guidance ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Tactical Role & Field Operations
          </h4>
        </div>
        {isEditMode ? (
          <textarea
            rows={3}
            value={formData.tactical_role || ''}
            onChange={(e) => onChange('tactical_role', e.target.value)}
            placeholder="Describe tactical combat role, party utility, and field responsibilities..."
            className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-400 leading-relaxed font-sans"
          />
        ) : (
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-sans">
            {formData.tactical_role || 'No tactical role defined.'}
          </div>
        )}
      </div>

      {/* ── Section 7: Full Rules Text & Narrative Lore (1.02 ARCHETYPES.MD) ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Full Rules Text & Archetype Dossier (1.02 Archetypes.md Alignment)
          </h4>
        </div>

        {isEditMode ? (
          <div className="space-y-1">
            <textarea
              rows={10}
              value={formData.full_text || ''}
              onChange={(e) => onChange('full_text', e.target.value)}
              placeholder="Enter canonical 1.02 ARCHETYPES.md text and narrative flavor (Markdown supported)..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-400 leading-relaxed font-sans"
            />
            <span className="text-[10px] font-mono text-slate-500">Supports Markdown formatting (#, ##, bullet points, bold, quotes)</span>
          </div>
        ) : (
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-sans prose prose-invert max-w-none">
            {formData.full_text ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {formData.full_text}
              </ReactMarkdown>
            ) : (
              <span className="italic text-slate-500 font-mono">No full canonical text recorded for this archetype.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ArchetypeConfigurator);
