import React from 'react';
import { BookOpen, Zap, Sliders } from 'lucide-react';
import { CortexSmartPicker } from '../../../components/Codex/GuidedStudio/CortexSmartPicker';

const GOVERNING_ATTRIBUTES = [
  'Strength (STR)',
  'Agility (AGI)',
  'Stamina (STA)',
  'Intellect (INT)',
  'Wisdom (WIS)',
  'Charisma (CHA)'
];

const SKILL_CATEGORIES = [
  'Combat & Weaponry',
  'Technical & Engineering',
  'Physical & Athletics',
  'Social & Influence',
  'Metaphysical & Psionics',
  'Pilot & Vehicular',
  'Subterfuge & Recon',
  'Academic & Medical'
];

/**
 * SkillConfigurator
 * Specialized configurator for Canonical Skills (Operator Guide 1.07).
 */
export const SkillConfigurator = ({
  formData = {},
  onChange,
  isEditMode = true,
  onOpenPicker = null,
  dbData = {},
  stepSection = 'all'
}) => {
  const showClassification = stepSection === 'all' || stepSection === 'classification';
  const showMechanics = stepSection === 'all' || stepSection === 'mechanics';

  const crBenchmarks =
    typeof formData.cr_benchmarks === 'object' && formData.cr_benchmarks !== null
      ? formData.cr_benchmarks
      : {};

  return (
    <div className="space-y-4 font-mono">
      {showClassification && (
        <div className="p-4 bg-slate-950/80 border border-blue-500/35 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
              <BookOpen size={14} />
              <span>Skill Domain, Governing Attribute & Training Gate</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-[10px] text-blue-200">
              1 CP / Rank • Creation Cap Rank 11
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Governing Attribute</label>
              <select
                disabled={!isEditMode}
                value={formData.governing_attribute || formData.attribute || GOVERNING_ATTRIBUTES[3]}
                onChange={(e) => {
                  onChange('governing_attribute', e.target.value);
                  onChange('attribute', e.target.value);
                }}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-blue-200"
              >
                {GOVERNING_ATTRIBUTES.map((attr) => (
                  <option key={attr} value={attr}>
                    {attr}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Skill Category</label>
              <select
                disabled={!isEditMode}
                value={formData.category || SKILL_CATEGORIES[1]}
                onChange={(e) => onChange('category', e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              >
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Untrained Usage (Rank 0)</label>
              <select
                disabled={!isEditMode}
                value={formData.trained_only ? 'trained' : 'untrained_allowed'}
                onChange={(e) => onChange('trained_only', e.target.value === 'trained')}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              >
                <option value="untrained_allowed">Allowed (Rank 0 = Full Round Action)</option>
                <option value="trained">Trained Only (Requires Rank 1+)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {showMechanics && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Zap size={14} />
              <span>2d10 Challenge Rating (CR) Benchmarks & Specializations</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Rank 6 = 2nd Action (-5) • Rank 11 = 3rd Action (-10)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'cr10', label: 'CR 10 (Routine)', placeholder: 'Routine civilian/field check...' },
              { key: 'cr15', label: 'CR 15 (Standard Baseline)', placeholder: 'Standard combat/operational check...' },
              { key: 'cr20', label: 'CR 20 (Challenging)', placeholder: 'Encrypted, hazardous, or time-pressured task...' },
              { key: 'cr25', label: 'CR 25 (Formidable / Master)', placeholder: 'Military-grade or extreme anomaly check...' }
            ].map((tier) => (
              <div key={tier.key} className="space-y-1">
                <label className="text-[10.5px] font-bold text-cyan-300 uppercase">{tier.label}</label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={crBenchmarks[tier.key] || ''}
                  onChange={(e) =>
                    onChange('cr_benchmarks', {
                      ...crBenchmarks,
                      [tier.key]: e.target.value
                    })
                  }
                  placeholder={tier.placeholder}
                  className="w-full p-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <CortexSmartPicker
              label="Opposed / Counter Check Skills"
              sourceCollection="skills"
              value={formData.opposed_skills}
              valueFormat="array"
              onChange={(val) => onChange('opposed_skills', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#3b82f6"
              helperText="Skills rolled in Active Opposed checks (Defender wins ties)."
              placeholder="E.g., Perception, Insight, Defense..."
            />

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Sliders size={12} className="text-amber-400" />
                <span>Sub-Specializations (Comma-Separated)</span>
              </label>
              <input
                type="text"
                disabled={!isEditMode}
                value={Array.isArray(formData.specializations) ? formData.specializations.join(', ') : (formData.specializations || '')}
                onChange={(e) =>
                  onChange(
                    'specializations',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="E.g., Cyber-Forensics, Starship Reactors, Zero-G Maneuvers..."
                className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-slate-300 uppercase">
              Resolution Procedure & Action Economy Summary
            </label>
            <textarea
              rows={3}
              disabled={!isEditMode}
              value={formData.mechanic || ''}
              onChange={(e) => onChange('mechanic', e.target.value)}
              placeholder="Roll 2d10 + Governing Attribute + Skill Rank vs. CR 15 (or opposed check)..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SkillConfigurator);
