import React, { useMemo } from 'react';
import { BookOpen, Zap, Layers } from 'lucide-react';
import { findReverseCortexDependencies } from '../../../components/Codex/GuidedStudio/intelligence/cortexExemplarService';

/**
 * RuleAndConditionConfigurator
 * Specialized configurator for `rules`, `compendium`, `user_guide`, `conditions`,
 * `damage_types`, `maneuvers`, and `synthesis`.
 */
export const RuleAndConditionConfigurator = ({
  formData = {},
  onChange,
  isEditMode = true,
  dbData = {},
  domainKey = 'rules',
  stepSection = 'all'
}) => {
  const showCitation = stepSection === 'all' || stepSection === 'citation';
  const showMechanics = stepSection === 'all' || stepSection === 'mechanics';

  const reverseDeps = useMemo(
    () => findReverseCortexDependencies(formData, domainKey, dbData, 10),
    [formData, domainKey, dbData]
  );

  return (
    <div className="space-y-4 font-mono">
      {showCitation && (
        <div className="p-4 bg-slate-950/80 border border-sky-500/35 rounded-2xl space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300 uppercase tracking-wider">
              <BookOpen size={14} />
              <span>Rulebook Citation & BASTION RAG Indexing</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/40 text-[10px] text-sky-200 uppercase">
              {domainKey.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Rulebook Citation Code</label>
              <input
                type="text"
                disabled={!isEditMode}
                value={formData.citation || formData.code || ''}
                onChange={(e) => onChange('citation', e.target.value)}
                placeholder="E.g., Operator Guide 3.02"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-200"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">RAG Retrieval Tags (Comma-Separated)</label>
              <input
                type="text"
                disabled={!isEditMode}
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : (formData.tags || formData.keywords || '')}
                onChange={(e) =>
                  onChange(
                    'tags',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="E.g., 2d10, called shot, trauma, armor DR..."
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {showMechanics && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Zap size={14} />
            <span>Domain-Specific Resolution & Formula Parameters</span>
          </div>

          {domainKey === 'conditions' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Severity / Stacking</label>
                <select
                  disabled={!isEditMode}
                  value={formData.severity || 'Minor Debuff'}
                  onChange={(e) => onChange('severity', e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-rose-200"
                >
                  <option value="Minor Debuff">Minor Debuff (-1 to -2)</option>
                  <option value="Major Trauma">Major Trauma (-4 / Halved Speed)</option>
                  <option value="Incapacitating">Incapacitating / Mortality</option>
                  <option value="Stacking Strain">Stacking Strain</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Recovery / Save CR</label>
                <input
                  type="number"
                  disabled={!isEditMode}
                  value={formData.save_cr ?? 15}
                  onChange={(e) => onChange('save_cr', parseInt(e.target.value, 10) || 15)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Default Duration</label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={formData.duration || 'Until Stabilized (Medicine CR 15)'}
                  onChange={(e) => onChange('duration', e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {domainKey === 'damage_types' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Damage Vector Family</label>
                <select
                  disabled={!isEditMode}
                  value={formData.damage_family || 'Kinetic'}
                  onChange={(e) => onChange('damage_family', e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-red-200"
                >
                  <option value="Kinetic">Kinetic (Blunt, Slashing, Piercing)</option>
                  <option value="Force">Force (Ignores 1/2 Armor DR)</option>
                  <option value="Energy">Energy (Fire, Cold, Sonic, Voltic, Corrosive, Disruptor)</option>
                  <option value="Radiation (Ra-D)">Radiation (Ra-D)</option>
                  <option value="Mental / Psychic">Mental (Ignores Physical Armor DR)</option>
                  <option value="Direct Health (Bleed / Burn)">Direct Health (Bypasses Vitality & DR)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Armor DR Mitigation Rule</label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={formData.dr_interaction || 'Reduced by Max Armor DR + Stamina Toughness'}
                  onChange={(e) => onChange('dr_interaction', e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {domainKey === 'maneuvers' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Action Economy Cost</label>
                <select
                  disabled={!isEditMode}
                  value={formData.action_cost || 'Standard Action'}
                  onChange={(e) => onChange('action_cost', e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-200"
                >
                  <option value="Stance (Start of Turn)">Stance (Start of Turn)</option>
                  <option value="Standard Action">Standard Action</option>
                  <option value="Movement Action">Movement Action</option>
                  <option value="Active Defense Reaction">Active Defense Reaction (-5 cumulative)</option>
                  <option value="Full Round Action">Full Round Action</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Strike / Defense Offset</label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={formData.roll_offset || '+0 Strike / +0 Defense'}
                  onChange={(e) => onChange('roll_offset', e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Min Skill Rank</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  disabled={!isEditMode}
                  value={formData.min_skill_rank ?? 0}
                  onChange={(e) => onChange('min_skill_rank', parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-200"
                />
              </div>
            </div>
          )}

          {domainKey === 'synthesis' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Craft / Purchase CR</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  disabled={!isEditMode}
                  value={formData.craft_dc ?? 15}
                  onChange={(e) => onChange('craft_dc', parseInt(e.target.value, 10) || 15)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Required Tool Tier</label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={formData.tool_tier || 'Tier 3: Workshop (x5 PP)'}
                  onChange={(e) => onChange('tool_tier', e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Required Skill</label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={formData.crafting_skill || 'Mechanics / Engineering'}
                  onChange={(e) => onChange('crafting_skill', e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-slate-300 uppercase">
              Canonical Formula & Mechanical Summary
            </label>
            <textarea
              rows={3}
              disabled={!isEditMode}
              value={formData.formula || formData.mechanic || ''}
              onChange={(e) => {
                onChange('formula', e.target.value);
                onChange('mechanic', e.target.value);
              }}
              placeholder="Enter canonical mathematical formula and step-by-step resolution rule..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
            />
          </div>
        </div>
      )}

      {reverseDeps.totalCount > 0 && (
        <div className="p-3 bg-slate-900/75 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Layers size={13} />
            <span>
              Referenced across <strong>{reverseDeps.totalCount}</strong> Omnicortex entries
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {reverseDeps.sampleMatches.slice(0, 5).map((m) => (
              <span key={`${m.collection}-${m.id}`} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                {m.name} ({m.collection})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(RuleAndConditionConfigurator);
