import React, { useMemo } from 'react';
import { Dna, Shield, Maximize2, Activity, Sparkles, Users } from 'lucide-react';
import { findReverseCortexDependencies } from '../../../components/Codex/GuidedStudio/intelligence/cortexExemplarService';

/**
 * SpeciesSubcomponentConfigurator
 * Dedicated modular configurator for the 5 Genetics sub-schemas:
 *  - `trait` (Species Traits: 1 / 2 / 4 CP, Bio/Synth compatibility, selectable choices)
 *  - `species_lineage` (10 Macro-Lineages)
 *  - `species_type` (Biological 30/30 VP/HP vs. Synthetic 60 SP Structure)
 *  - `species_size` (Fine -> Colossal Defense/Reach/Garaging)
 *  - `species_movement` (Locomotion modes & tactical paces)
 */
export const SpeciesSubcomponentConfigurator = ({
  formData = {},
  onChange,
  isEditMode = true,
  dbData = {},
  domainKey = 'trait',
  stepSection = 'all'
}) => {
  const showIdentity = stepSection === 'all' || stepSection === 'identity';
  const showMechanics = stepSection === 'all' || stepSection === 'mechanics';

  const reverseDeps = useMemo(
    () => findReverseCortexDependencies(formData, domainKey, dbData, 12),
    [formData, domainKey, dbData]
  );

  return (
    <div className="space-y-4 font-mono">
      {/* 1. TRAIT SUB-STUDIO */}
      {domainKey === 'trait' && (
        <div className="p-4 bg-slate-950/80 border border-purple-500/35 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Species Physiological / Synthetic Trait Parameters</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[10px] text-purple-200">
              1 / 2 / 4 CP Canonical Scale
            </span>
          </div>

          {showIdentity && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">CP Cost Tier</label>
                <select
                  disabled={!isEditMode}
                  value={Number(formData.cp ?? formData.cost ?? formData.costs?.cp ?? 2)}
                  onChange={(e) => {
                    const cp = Number(e.target.value) || 1;
                    onChange('cp', cp);
                    onChange('costs', { ...(formData.costs || {}), cp, bp: cp });
                    onChange('tier', cp >= 4 ? 'Apex (4 CP)' : cp >= 2 ? 'Major (2 CP)' : 'Minor (1 CP)');
                  }}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-purple-200"
                >
                  <option value={1}>1 CP — Minor Adaptation</option>
                  <option value={2}>2 CP — Major Physiology</option>
                  <option value={4}>4 CP — Apex / Defining Trait</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Chassis Compatibility</label>
                <select
                  disabled={!isEditMode}
                  value={formData.chassis_scope || formData.classification || 'Universal'}
                  onChange={(e) => {
                    onChange('chassis_scope', e.target.value);
                    onChange('classification', e.target.value);
                  }}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                >
                  <option value="Universal">Universal (Bio & Synthetic)</option>
                  <option value="Biological Only">Biological Only</option>
                  <option value="Synthetic / Construct Only">Synthetic / Construct Only</option>
                  <option value="Awakened / Resonant">Awakened / Resonant</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Selectable Sub-Choice?</label>
                <select
                  disabled={!isEditMode}
                  value={formData.requires_choice ? 'yes' : 'no'}
                  onChange={(e) => onChange('requires_choice', e.target.value === 'yes')}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                >
                  <option value="no">Fixed Effect (No Sub-Choice)</option>
                  <option value="yes">Parameterized Choice (e.g., Element / Sense)</option>
                </select>
              </div>
            </div>
          )}

          {showMechanics && (
            <div className="space-y-3">
              {formData.requires_choice && (
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-cyan-300 uppercase">
                    Selectable Choice Options (Comma-Separated)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={Array.isArray(formData.choice_options) ? formData.choice_options.join(', ') : (formData.choice_options || '')}
                    onChange={(e) =>
                      onChange(
                        'choice_options',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="E.g., Thermal Vision, Low-Light Optics, Electro-Reception"
                    className="w-full p-2.5 bg-slate-900 border border-cyan-500/40 rounded-xl text-xs text-slate-200"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">
                  Canonical Mechanical Rule
                </label>
                <textarea
                  rows={3}
                  disabled={!isEditMode}
                  value={formData.mechanic || ''}
                  onChange={(e) => onChange('mechanic', e.target.value)}
                  placeholder="E.g., Grants +2 to Perception checks in darkness and ignores concealment from dim light."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SPECIES LINEAGE SUB-STUDIO */}
      {domainKey === 'species_lineage' && (
        <div className="p-4 bg-slate-950/80 border border-emerald-500/35 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase">
            <Dna size={14} />
            <span>Macro-Lineage Ancestral Parameters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Ancestral Cradle / Sector</label>
              <input
                type="text"
                disabled={!isEditMode}
                value={formData.homeworld || formData.origin_sector || ''}
                onChange={(e) => onChange('homeworld', e.target.value)}
                placeholder="E.g., Aulura Prime, Sol Continuum, Deep Void..."
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Signature Physiology</label>
              <input
                type="text"
                disabled={!isEditMode}
                value={formData.mechanic || ''}
                onChange={(e) => onChange('mechanic', e.target.value)}
                placeholder="Shared biological/synthetic hallmarks across child sub-species..."
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. SPECIES TYPE (BIO VS SYNTHETIC CHASSIS) */}
      {domainKey === 'species_type' && (
        <div className="p-4 bg-slate-950/80 border border-sky-500/35 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-300 uppercase">
            <Shield size={14} />
            <span>Chassis Integrity Model (30 VP / 30 HP vs. 60 SP Structure)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Vitality / Structure Model</label>
              <select
                disabled={!isEditMode}
                value={formData.is_synthetic ? 'synthetic' : 'biological'}
                onChange={(e) => onChange('is_synthetic', e.target.value === 'synthetic')}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-sky-200"
              >
                <option value="biological">Biological (Base 30 VP + 30 HP)</option>
                <option value="synthetic">Synthetic / Construct (Unified 60 SP)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Innate Immunities</label>
              <input
                type="text"
                disabled={!isEditMode}
                value={formData.immunities || ''}
                onChange={(e) => onChange('immunities', e.target.value)}
                placeholder="E.g., Non-lethal, Vacuum, Toxins, Suffocation"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Chassis CP Offset</label>
              <input
                type="number"
                disabled={!isEditMode}
                value={formData.cp ?? formData.costs?.cp ?? 0}
                onChange={(e) => onChange('cp', parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. SPECIES SIZE */}
      {domainKey === 'species_size' && (
        <div className="p-4 bg-slate-950/80 border border-amber-500/35 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
            <Maximize2 size={14} />
            <span>Volumetric Size Tier Modifiers</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase">Defense Mod</label>
              <input
                type="number"
                disabled={!isEditMode}
                value={formData.defense_mod ?? 0}
                onChange={(e) => onChange('defense_mod', parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase">Stealth Mod</label>
              <input
                type="number"
                disabled={!isEditMode}
                value={formData.stealth_mod ?? 0}
                onChange={(e) => onChange('stealth_mod', parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase">Melee Reach (ft)</label>
              <input
                type="number"
                disabled={!isEditMode}
                value={formData.reach_ft ?? 5}
                onChange={(e) => onChange('reach_ft', parseInt(e.target.value, 10) || 5)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase">Carry / Pool Mult</label>
              <input
                type="number"
                step="0.25"
                disabled={!isEditMode}
                value={formData.scale_multiplier ?? 1}
                onChange={(e) => onChange('scale_multiplier', parseFloat(e.target.value) || 1)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. SPECIES MOVEMENT */}
      {domainKey === 'species_movement' && (
        <div className="p-4 bg-slate-950/80 border border-cyan-500/35 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase">
            <Activity size={14} />
            <span>Locomotion Kinematics & Tactical Pace</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Base Speed (ft / round)</label>
              <input
                type="number"
                step={5}
                disabled={!isEditMode}
                value={formData.base_speed ?? formData.speed ?? 30}
                onChange={(e) => onChange('base_speed', parseInt(e.target.value, 10) || 30)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Maneuverability</label>
              <select
                disabled={!isEditMode}
                value={formData.maneuverability || 'Standard'}
                onChange={(e) => onChange('maneuverability', e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              >
                <option value="Clumsy">Clumsy (-4 Pilot/Acrobatics)</option>
                <option value="Standard">Standard (+0 Baseline)</option>
                <option value="Agile">Agile (+2 Evasive Maneuvers)</option>
                <option value="Perfect / Hover">Perfect / Zero-G Hover</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">CP Cost Delta</label>
              <input
                type="number"
                disabled={!isEditMode}
                value={formData.cp ?? formData.costs?.cp ?? 0}
                onChange={(e) => onChange('cp', parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reverse Cortex Impact Badge */}
      {reverseDeps.totalCount > 0 && (
        <div className="p-3 bg-slate-900/75 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Users size={13} />
            <span>
              Referenced by <strong>{reverseDeps.totalCount}</strong> canonical Omnicortex record{reverseDeps.totalCount === 1 ? '' : 's'}:
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {reverseDeps.sampleMatches.slice(0, 5).map((m) => (
              <span key={`${m.collection}-${m.id}`} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                {m.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SpeciesSubcomponentConfigurator);
