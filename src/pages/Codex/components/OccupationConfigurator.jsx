import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Briefcase, 
  Sparkles, 
  BookOpen, 
  Plus, 
  X, 
  Users, 
  Award, 
  Coins,
  Shield,
  Zap,
  TrendingUp,
  Tag
} from 'lucide-react';
import { CodexTooltip } from '../../../components/UI/CodexTooltip';

/**
 * Common Traits available to all Occupations per 1.06 OCCUPATIONS.md
 */
const COMMON_OCCUPATIONAL_TRAITS = [
  {
    name: 'Background',
    summary: 'Gain one Trait from a secondary chosen Occupation.',
    rule: 'Gain one Trait from a secondary Occupation fitting character backstory (no additional skill points or recommended features).'
  },
  {
    name: 'Trade Tools',
    summary: 'Covers essential vocational tools and gear.',
    rule: '+2 Equipment bonus to relevant vocational gear.'
  },
  {
    name: 'High Pay',
    summary: 'Financial reward for doing their job well.',
    rule: '+2 Wealth bonus from professional earnings.'
  },
  {
    name: 'Professionalism',
    summary: 'Standing and renown within their field.',
    rule: '+2 Reputation bonus in professional circles.'
  }
];

/**
 * OccupationConfigurator
 * Specialized Studio configurator for the Occupations Matrix in OmniCortex / Codex Suite.
 * Aligns with 1.06 OCCUPATIONS.md canonical rules:
 * - Professional training, career history, and social role
 * - Decoupled from adversary chassis, combat competency roles, boss types, TL, and ML
 * - 20 Skill Points pool for listed Professional Skills (creation cap: Rank 11 Expert, recommended Rank 6)
 * - Recommended Features discount (-1 BP / CP)
 * - Occupational Traits: Select 2 Free initially, additional traits cost 2 BP each
 * - Common Traits available to all Occupations (Background, Trade Tools, High Pay, Professionalism)
 * - Associated Archetypes and Full Rules Text
 */
export const OccupationConfigurator = ({
  formData = {},
  onChange,
  isEditMode = false,
  dbData = {}
}) => {
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newArchetypeInput, setNewArchetypeInput] = useState('');
  const [newTraitInput, setNewTraitInput] = useState('');

  const professionalSkills = useMemo(() => {
    if (Array.isArray(formData.professional_skills)) return formData.professional_skills;
    if (typeof formData.professional_skills === 'string') {
      return formData.professional_skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }, [formData.professional_skills]);

  const recommendedFeatures = useMemo(() => {
    const list = formData.recommended_features || formData.features || [];
    if (Array.isArray(list)) return list;
    if (typeof list === 'string') {
      return list.split(',').map(f => f.trim()).filter(Boolean);
    }
    return [];
  }, [formData.recommended_features, formData.features]);

  const archetypes = useMemo(() => {
    if (Array.isArray(formData.archetypes)) return formData.archetypes;
    if (typeof formData.archetypes === 'string') {
      return formData.archetypes.split(',').map(a => a.trim()).filter(Boolean);
    }
    return [];
  }, [formData.archetypes]);

  const traits = useMemo(() => {
    if (Array.isArray(formData.traits)) return formData.traits;
    if (typeof formData.traits === 'string') {
      return formData.traits.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
  }, [formData.traits]);

  // Resolve detailed trait objects from dbData or catalog
  const resolvedTraits = useMemo(() => {
    const catalogTraits = dbData?.traits || dbData?.trait || [];

    return traits.map(traitItem => {
      if (typeof traitItem === 'object' && traitItem !== null) {
        return traitItem;
      }
      const rawName = String(traitItem);
      const cleanName = rawName.replace(/^trait-/, '').replace(/-/g, ' ').toLowerCase();

      // Check global traits catalog
      const fromCatalog = catalogTraits.find(ct => {
        const ctName = (ct.name || ct.id || '').toLowerCase();
        const ctClean = ctName.replace(/^trait-/, '').replace(/-/g, ' ');
        return ctName === rawName.toLowerCase() || ctClean === cleanName || ctName.includes(cleanName);
      });
      if (fromCatalog) return fromCatalog;

      // Fallback
      return {
        id: `trait-${cleanName.replace(/\s+/g, '-')}`,
        name: rawName.replace(/^trait-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        tier: 'Occupational',
        classification: 'Occupational Trait',
        description: 'Vocational trait gained from formal training and service in this career field.',
        mechanic: '+2 to relevant occupational skill checks or specialized vocational advantage',
        bonus: '+2 Vocational Bonus'
      };
    });
  }, [traits, dbData?.traits, dbData?.trait]);

  // Handlers for adding/removing items
  const handleAddSkill = () => {
    const val = newSkillInput.trim();
    if (!val || professionalSkills.includes(val)) return;
    const updated = [...professionalSkills, val];
    onChange('professional_skills', updated);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = professionalSkills.filter(s => s !== skillToRemove);
    onChange('professional_skills', updated);
  };

  const handleAddFeature = () => {
    const val = newFeatureInput.trim();
    if (!val || recommendedFeatures.includes(val)) return;
    const updated = [...recommendedFeatures, val];
    onChange('recommended_features', updated);
    onChange('features', updated);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (featToRemove) => {
    const updated = recommendedFeatures.filter(f => f !== featToRemove);
    onChange('recommended_features', updated);
    onChange('features', updated);
  };

  const handleAddArchetype = () => {
    const val = newArchetypeInput.trim();
    if (!val || archetypes.includes(val)) return;
    const updated = [...archetypes, val];
    onChange('archetypes', updated);
    setNewArchetypeInput('');
  };

  const handleRemoveArchetype = (archToRemove) => {
    const updated = archetypes.filter(a => a !== archToRemove);
    onChange('archetypes', updated);
  };

  const handleAddTrait = () => {
    const val = newTraitInput.trim();
    if (!val || traits.includes(val)) return;
    const updated = [...traits, val];
    onChange('traits', updated);
    setNewTraitInput('');
  };

  const handleRemoveTrait = (traitToRemove) => {
    const tName = typeof traitToRemove === 'object' ? (traitToRemove.name || traitToRemove.id) : String(traitToRemove);
    const updated = traits.filter(t => {
      const curr = typeof t === 'object' ? (t.name || t.id) : String(t);
      return curr !== tName;
    });
    onChange('traits', updated);
  };

  return (
    <div className="space-y-6 text-slate-200 font-sans">

      {/* ── Rulebook Alignment Banner (1.06 OCCUPATIONS.MD) ── */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
              BASTION 1.06 Canonical Occupation Profile
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/80 border border-amber-500/50 text-amber-200 font-bold uppercase">
            {formData.field || 'Vocational Field'}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Occupations represent a character's formal training, career history, and social role. 
          Occupations are <strong>not combat adversary templates</strong> and have no competency combat roles, boss types, or threat ratings.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span><strong>20 Skill Points</strong> granted for listed Professional Skills</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span><strong>-1 BP Discount</strong> on Recommended Features</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span><strong>2 Free Traits</strong> selected initially (+2 BP each for extra)</span>
          </div>
        </div>
      </div>

      {/* ── Section 1: Professional Skills (20 SP Pool) ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Professional Skills Package (20 SP Pool)
            </h4>
            <CodexTooltip
              title="Professional Skills (20 SP)"
              description="Characters gain a pool of 20 Skill Points (SP) to distribute among skills listed under their Occupation. Creation Cap: No skill may exceed Rank 11 (Expert). Recommended cap: Rank 6 (Trained)."
              rule="1.06 OCCUPATIONS.md"
              color="#f59e0b"
            />
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300">
            20 SP Pool (Cap: Rank 11)
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Formal disciplines mastered through professional career experience. When brought into the Persona Folio, 
          the operative allocates 20 points across these skills (1 SP = 1 Skill Rank, maximum starting cap of Rank 11):
        </p>

        {/* Skill Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {professionalSkills.length === 0 ? (
            <span className="text-xs text-slate-500 italic font-mono">No professional skills defined yet.</span>
          ) : (
            professionalSkills.map(skill => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/40 text-amber-200 flex items-center gap-1.5 shadow-sm"
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

        {/* Quick Add Skill Input in Edit Mode */}
        {isEditMode && (
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              placeholder="Add professional skill (e.g. Stealth, Insight, Medicine)..."
              className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-amber-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Skill</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 2: Recommended Features (The Discount: -1 BP) ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Recommended Features (Discounted -1 BP / CP)
            </h4>
            <CodexTooltip
              title="Recommended Features Discount"
              description="Each Occupation lists specific Recommended Features. When purchasing these features during character creation or progression, their cost is reduced by 1 BP (standard cost is 3 BP; Recommended Features cost 2 BP)."
              rule="1.06 OCCUPATIONS.md"
              color="#10b981"
            />
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
            -1 BP Cost Discount
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Features aligned with this profession cost 1 less Build Point (2 BP instead of standard 3 BP). 
          These represent natural career talents developed through vocational practice:
        </p>

        {/* Feature Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {recommendedFeatures.length === 0 ? (
            <span className="text-xs text-slate-500 italic font-mono">No recommended features defined yet.</span>
          ) : (
            recommendedFeatures.map(feat => (
              <span
                key={feat}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex items-center gap-1.5 shadow-sm"
              >
                <Tag size={11} className="text-emerald-400" />
                <span>{feat}</span>
                <span className="text-[10px] text-emerald-400 ml-1 font-mono">(-1 BP)</span>
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

        {/* Quick Add Feature Input in Edit Mode */}
        {isEditMode && (
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={newFeatureInput}
              onChange={(e) => setNewFeatureInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
              placeholder="Add recommended feature name..."
              className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Feature</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 3: Occupational Traits Showcase ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Occupational Traits ({resolvedTraits.length} Available)
            </h4>
            <CodexTooltip
              title="Occupational Traits"
              description="Players choose exactly two Traits from their Occupation list initially. Additional traits from this occupation may be purchased for 2 BP each."
              rule="1.06 OCCUPATIONS.md"
              color="#f59e0b"
            />
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300">
            2 Free Selections (Additional: 2 BP each)
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Specialized vocational traits reflecting career background and professional competence. Operatives select two free traits initially:
        </p>

        {/* Traits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {resolvedTraits.map((trait, idx) => {
            const name = trait.name || trait.title || 'Unnamed Trait';
            const desc = trait.description || trait.desc || '';
            const bonus = trait.bonus || trait.mechanic || trait.mechanics || trait.rules || '+2 Vocational Bonus';

            return (
              <div
                key={trait.id || name || idx}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-2 group shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-400" />
                      {name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 font-semibold">
                        Career Trait
                      </span>
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTrait(name)}
                          className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove trait"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-3">
                    {desc}
                  </p>
                </div>

                {/* Mechanic Bonus Badge */}
                <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Zap size={11} className="text-amber-400" />
                    <span>{bonus}</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    Tier 1
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Add Trait in Edit Mode */}
        {isEditMode && (
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={newTraitInput}
              onChange={(e) => setNewTraitInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTrait(); } }}
              placeholder="Add occupational trait name..."
              className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleAddTrait}
              className="px-3 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-amber-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Trait</span>
            </button>
          </div>
        )}

        {/* ── Universal Common Traits Banner ── */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 mt-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
            <Shield size={13} className="text-amber-400" />
            <span>Universal Common Traits (Available to All Occupations)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] font-mono">
            {COMMON_OCCUPATIONAL_TRAITS.map(ct => (
              <div key={ct.name} className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                <div className="text-amber-400 font-bold">{ct.name}</div>
                <div className="text-slate-400 text-[10px] leading-tight">{ct.summary}</div>
                <div className="text-emerald-400 text-[9px]">{ct.rule}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 4: Associated Archetypes & Career Progression ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Associated Archetypes & Vocations
            </h4>
            <CodexTooltip
              title="Associated Archetypes"
              description="Typical character archetypes and career paths frequently associated with or transitioning from this occupation."
              rule="1.06 OCCUPATIONS.md"
              color="#f59e0b"
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Career Pairings
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Typical character archetypes and roles frequently associated with this occupation:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {archetypes.length === 0 ? (
            <span className="text-xs text-slate-500 italic font-mono">No associated archetypes listed.</span>
          ) : (
            archetypes.map(arch => (
              <span
                key={arch}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-950 border border-slate-700 text-slate-200 flex items-center gap-1.5 shadow-sm"
              >
                <span>{arch}</span>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleRemoveArchetype(arch)}
                    className="text-slate-400 hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                    title="Remove archetype"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))
          )}
        </div>

        {/* Quick Add Archetype in Edit Mode */}
        {isEditMode && (
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={newArchetypeInput}
              onChange={(e) => setNewArchetypeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddArchetype(); } }}
              placeholder="Add associated archetype (e.g. Spy, Combatant, Merchant)..."
              className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleAddArchetype}
              className="px-3 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-amber-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Archetype</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 5: Full Rules Text & Extended Lore (1.06 OCCUPATIONS.MD) ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Full Rules Text & Career Lore (1.06 Occupations.md Alignment)
          </h4>
        </div>

        {isEditMode ? (
          <div className="space-y-1">
            <textarea
              rows={10}
              value={formData.full_text || ''}
              onChange={(e) => onChange('full_text', e.target.value)}
              placeholder="Enter canonical 1.06 OCCUPATIONS.md rules text and career lore (Markdown supported)..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
            />
            <span className="text-[10px] font-mono text-slate-500">Supports Markdown formatting (#, ##, bullet points, bold)</span>
          </div>
        ) : (
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-sans prose prose-invert max-w-none">
            {formData.full_text ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {formData.full_text}
              </ReactMarkdown>
            ) : (
              <span className="italic text-slate-500 font-mono">No full canonical text recorded for this occupation.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(OccupationConfigurator);
