import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Globe, 
  Sparkles, 
  BookOpen, 
  Plus, 
  X, 
  Layers, 
  Users, 
  Award, 
  CheckCircle,
  HelpCircle,
  Shield,
  Coins
} from 'lucide-react';
import { CodexTooltip } from '../../../components/UI/CodexTooltip';

/**
 * OriginConfigurator
 * Specialized Studio configurator for the Origins Matrix in OmniCortex / Codex Suite.
 * Aligns with 1.05 ORIGINS.md canonical rules:
 * - Homeworld / Habitat environment (no combat competency roles, no NPC chassis, no TL/ML)
 * - 20 Society Skill Points pool for Persona Folio allocation
 * - Selectable homeworld traits (2 free initially, +1 CP each for additional)
 * - Typical native archetypes / vocations
 * - Full text lore and CRISP visual synthesis tokens
 */
export const OriginConfigurator = ({
  formData = {},
  onChange,
  isEditMode = false,
  dbData = {}
}) => {
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newArchetypeInput, setNewArchetypeInput] = useState('');
  const [newTraitInput, setNewTraitInput] = useState('');

  const societySkills = useMemo(() => {
    if (Array.isArray(formData.society_skills)) return formData.society_skills;
    if (typeof formData.society_skills === 'string') {
      return formData.society_skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }, [formData.society_skills]);

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

  // Resolve detailed trait objects from dbData or traits_detail
  const resolvedTraits = useMemo(() => {
    const catalogTraits = dbData?.traits || [];
    const traitsDetail = Array.isArray(formData.traits_detail) ? formData.traits_detail : [];

    return traits.map(traitItem => {
      if (typeof traitItem === 'object' && traitItem !== null) {
        return traitItem;
      }
      const rawName = String(traitItem);
      const cleanName = rawName.replace(/^trait-/, '').replace(/-/g, ' ').toLowerCase();

      // Check traits_detail first
      const fromDetail = traitsDetail.find(td => {
        const tdName = (td.name || td.id || '').toLowerCase();
        return tdName === cleanName || tdName === rawName.toLowerCase();
      });
      if (fromDetail) return fromDetail;

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
        tier: 'Basic',
        classification: 'Origin Trait',
        description: 'Associated homeworld trait reflecting character upbringing in this environment.',
        mechanic: '+2 to relevant skill or Advantage on specific environmental checks',
        bonus: '+2 Environmental Bonus'
      };
    });
  }, [traits, formData.traits_detail, dbData?.traits]);

  // Handlers for adding/removing items
  const handleAddSkill = () => {
    const val = newSkillInput.trim();
    if (!val || societySkills.includes(val)) return;
    const updated = [...societySkills, val];
    onChange('society_skills', updated);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = societySkills.filter(s => s !== skillToRemove);
    onChange('society_skills', updated);
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

      {/* ── Rulebook Alignment Banner ── */}
      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">
              BASTION 1.05 Canonical Origin Profile
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 font-bold uppercase">
            {formData.habitat || 'Homeworld Biome'}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          A character's origin represents the type of environment they come from, shaping their skills, traits, and worldview. 
          Origins are <strong>not combat adversary chassis</strong> and have no competency combat roles.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span><strong>20 Skill Points</strong> granted for listed Society Skills in Folio</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span><strong>2 Free Traits</strong> selected initially (+1 CP for each additional)</span>
          </div>
        </div>
      </div>

      {/* ── Section 1: Society Skills (20 SP Pool) ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Society Skills Package (20 SP Pool)
            </h4>
            <CodexTooltip
              title="Society Skills (20 SP)"
              description="Choosing this origin grants characters 20 Points to allocate across these listed skills in their Persona Folio."
              rule="1.05 ORIGINS.md"
              color="#10b981"
            />
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
            20 SP Pool
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Skills typically acquired from upbringing and vocation within this environment. When brought into the Persona Folio, 
          the operative receives 20 points specifically allotted to develop expertise in these areas:
        </p>

        {/* Skill Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {societySkills.length === 0 ? (
            <span className="text-xs text-slate-500 italic font-mono">No society skills defined yet.</span>
          ) : (
            societySkills.map(skill => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex items-center gap-1.5 shadow-sm"
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
              placeholder="Add society skill (e.g. Piloting, Alertness)..."
              className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Skill</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 2: Origin Homeworld Traits Showcase ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Origin Homeworld Traits ({resolvedTraits.length} Available)
            </h4>
            <CodexTooltip
              title="Origin Traits"
              description="Players select 2 traits from this list initially for free. Additional traits from this origin can be purchased for 1 CP each in the Persona Folio."
              rule="1.05 ORIGINS.md"
              color="#10b981"
            />
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
            2 Free Selections (Additional: 1 CP each)
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          These traits reflect the character's native experiences and upbringing. Operatives select two free traits initially, 
          with the option to pay 1 CP for each additional trait selected from this list:
        </p>

        {/* Traits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {resolvedTraits.map((trait, idx) => {
            const name = trait.name || trait.title || 'Unnamed Trait';
            const desc = trait.description || trait.desc || '';
            const bonus = trait.bonus || trait.mechanic || trait.mechanics || trait.rules || '+2 Environmental Bonus';

            return (
              <div
                key={trait.id || name || idx}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-2 group shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-emerald-400" />
                      {name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-semibold">
                        Basic Trait
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
                    <span>⚡</span>
                    <span>{bonus}</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    1 CP Tier
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
              placeholder="Add origin trait name..."
              className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={handleAddTrait}
              className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Trait</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 3: Typical Archetypes & Background Roles ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Typical Native Archetypes & Vocations
            </h4>
            <CodexTooltip
              title="Native Archetypes"
              description="These are representative vocational roles and community profiles commonly native to this environment, not combat NPC chassis."
              rule="1.05 ORIGINS.md"
              color="#10b981"
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Community Roles
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Typical roles and vocations commonly found among inhabitants of this origin. These provide roleplay inspiration 
          and thematic career anchors:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {archetypes.length === 0 ? (
            <span className="text-xs text-slate-500 italic font-mono">No typical archetypes listed.</span>
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
              placeholder="Add typical vocation (e.g. Farmer, Pilot, Technician)..."
              className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={handleAddArchetype}
              className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Role</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 4: Full Rules Text & Extended Lore (1.05 ORIGINS.md) ── */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Full Rules Text & Lore (1.05 Origins.md Alignment)
          </h4>
        </div>

        {isEditMode ? (
          <div className="space-y-1">
            <textarea
              rows={10}
              value={formData.full_text || ''}
              onChange={(e) => onChange('full_text', e.target.value)}
              placeholder="Enter canonical 1.05 ORIGINS.md rules text and lore (Markdown supported)..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-400 leading-relaxed font-sans"
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
              <span className="italic text-slate-500 font-mono">No full canonical text recorded for this origin.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(OriginConfigurator);
