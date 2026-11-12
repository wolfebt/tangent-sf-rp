import React from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { CortexSmartPicker } from '../../../components/Codex/GuidedStudio/CortexSmartPicker';

const PILLAR_DOMAINS = [
  'Origin Trait',
  'Occupation Trait',
  'Faction Trait',
  'Archetype Signature Trait',
  'General Background Trait'
];

/**
 * TraitConfigurator
 * Specialized configurator for Pillar & Background Traits (Operator Guide 1.04–1.06).
 */
export const TraitConfigurator = ({
  formData = {},
  onChange,
  isEditMode = true,
  onOpenPicker = null,
  dbData = {},
  stepSection = 'all'
}) => {
  const showClassification = stepSection === 'all' || stepSection === 'classification';
  const showMechanics = stepSection === 'all' || stepSection === 'mechanics';

  return (
    <div className="space-y-4 font-mono">
      {showClassification && (
        <div className="p-4 bg-slate-950/80 border border-emerald-500/35 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Pillar Trait Domain & CP Tier</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-200">
              Origins Grant 2 Free • +1 CP Extra
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Pillar Domain</label>
              <select
                disabled={!isEditMode}
                value={formData.classification || formData.category || PILLAR_DOMAINS[0]}
                onChange={(e) => {
                  onChange('classification', e.target.value);
                  onChange('category', e.target.value);
                }}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              >
                {PILLAR_DOMAINS.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Trait Tier / CP Cost</label>
              <select
                disabled={!isEditMode}
                value={Number(formData.cp ?? formData.costs?.cp ?? 1)}
                onChange={(e) => {
                  const cp = Number(e.target.value) || 1;
                  onChange('cp', cp);
                  onChange('costs', { ...(formData.costs || {}), cp, bp: cp });
                  onChange('tier', cp >= 4 ? 'Apex' : cp >= 2 ? 'Major' : 'Basic');
                }}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-200"
              >
                <option value={1}>Basic (1 CP)</option>
                <option value={2}>Major (2 CP)</option>
                <option value={4}>Apex (4 CP)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Headline Bonus Badge</label>
              <input
                type="text"
                disabled={!isEditMode}
                value={formData.bonus || ''}
                onChange={(e) => onChange('bonus', e.target.value)}
                placeholder="E.g., +2 Zero-G Checks"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-200"
              />
            </div>
          </div>
        </div>
      )}

      {showMechanics && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
            <Compass size={14} />
            <span>Associated Skills, Parent Pillars & Mechanical Rule</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CortexSmartPicker
              label="Enhanced / Linked Skills"
              sourceCollection="skills"
              value={formData.recommended_skills}
              valueFormat="array"
              onChange={(val) => onChange('recommended_skills', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#10b981"
              placeholder="Search Cortex skills..."
            />

            <CortexSmartPicker
              label="Parent Origins / Occupations"
              sourceCollection="origins"
              value={formData.recommended_origins}
              valueFormat="array"
              onChange={(val) => onChange('recommended_origins', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#38bdf8"
              placeholder="Search Cortex origins..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-slate-300 uppercase">
              Situational Bonus & Mechanical Rule
            </label>
            <textarea
              rows={3}
              disabled={!isEditMode}
              value={formData.mechanic || ''}
              onChange={(e) => onChange('mechanic', e.target.value)}
              placeholder="E.g., Gain +2 on Survival and Mechanics checks aboard orbital habitats or voidships."
              className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(TraitConfigurator);
