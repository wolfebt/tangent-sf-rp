import React from 'react';
import { Award, ShieldAlert, Zap } from 'lucide-react';
import { CortexSmartPicker } from '../../../components/Codex/GuidedStudio/CortexSmartPicker';

const FEATURE_CATEGORIES = [
  'Combat & Tactical',
  'Technical & Crafting',
  'Social & Command',
  'Metaphysical & Resonance',
  'Mobility & Survival',
  'Cybernetic & Synthetic',
  'General Operator'
];

const ACTION_TRIGGERS = [
  'Passive / Always Active',
  'Standard Action',
  'Move Action',
  'Reaction (Interrupt)',
  'Free Action (1/Turn)',
  'Full Round Action'
];

/**
 * FeatureConfigurator
 * Specialized configurator for Operator Features & Feats (Operator Guide 1.08 — 3 CP Canonical Base).
 */
export const FeatureConfigurator = ({
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
        <div className="p-4 bg-slate-950/80 border border-purple-500/35 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <Award size={14} />
              <span>Feature Taxonomy, CP Cost & Repeatability</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[10px] text-purple-200">
              Canonical Feat = 3 CP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Feature Category</label>
              <select
                disabled={!isEditMode}
                value={formData.category || FEATURE_CATEGORIES[0]}
                onChange={(e) => onChange('category', e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              >
                {FEATURE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Character Point (CP) Cost</label>
              <input
                type="number"
                min={1}
                max={15}
                disabled={!isEditMode}
                value={formData.cp ?? formData.costs?.cp ?? 3}
                onChange={(e) => {
                  const cp = Math.max(1, parseInt(e.target.value, 10) || 3);
                  onChange('cp', cp);
                  onChange('costs', { ...(formData.costs || {}), cp, bp: cp });
                }}
                className="w-full p-2.5 bg-slate-900 border border-purple-500/40 rounded-xl text-xs text-purple-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Stacking / Ranked</label>
              <select
                disabled={!isEditMode}
                value={formData.repeatable ? 'repeatable' : 'single'}
                onChange={(e) => onChange('repeatable', e.target.value === 'repeatable')}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              >
                <option value="single">Single Acquisition</option>
                <option value="repeatable">Ranked / Repeatable (Stacks)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {showMechanics && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <ShieldAlert size={14} />
            <span>Structured Prerequisites & Action Trigger</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CortexSmartPicker
              label="Prerequisite Skills / Prior Features"
              sourceCollection="skills"
              value={formData.prerequisite}
              valueFormat="array"
              onChange={(val) => onChange('prerequisite', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#f59e0b"
              helperText="Type requirements (e.g., 'Agility 2+', 'Firearms 6+') or select Cortex skills."
              placeholder="Add prerequisite (e.g., Firearms 6+, Agility 2+)..."
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Zap size={12} className="text-cyan-400" />
                  <span>Action Economy Trigger</span>
                </label>
                <select
                  disabled={!isEditMode}
                  value={formData.action_type || ACTION_TRIGGERS[0]}
                  onChange={(e) => onChange('action_type', e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-200"
                >
                  {ACTION_TRIGGERS.map((trig) => (
                    <option key={trig} value={trig}>
                      {trig}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-slate-300 uppercase">
              Canonical Tactical Benefit & Mechanical Rule
            </label>
            <textarea
              rows={3}
              disabled={!isEditMode}
              value={formData.mechanic || ''}
              onChange={(e) => onChange('mechanic', e.target.value)}
              placeholder="Specify exact check bonuses, stance enhancements, reaction triggers, or DR/damage adjustments..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(FeatureConfigurator);
