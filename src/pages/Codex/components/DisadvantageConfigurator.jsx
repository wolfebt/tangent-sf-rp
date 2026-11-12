import React from 'react';
import { ShieldAlert, Cpu } from 'lucide-react';
import { CortexSmartPicker } from '../../../components/Codex/GuidedStudio/CortexSmartPicker';

const FLAW_SCOPES = [
  'Personal Hindrance (Counts toward +10 CP Max Creation Rebate)',
  'Innate Species Disadvantage (Exempt from +10 CP Cap)',
  'Social / Jurisdictional Stigma (Exempt from +10 CP Cap)',
  'Cybernetic / Metaphysical Trauma'
];

const SAVE_TYPES = [
  'Willpower Save (CR 15 Baseline)',
  'Fortitude Save (CR 15 Baseline)',
  'Reflex Save (CR 15 Baseline)',
  'Always Active (No Save)',
  'Custom CR Check'
];

/**
 * DisadvantageConfigurator
 * Specialized configurator for Hindrances, Flaws & Species Disadvantages (Operator Guide 1.09).
 */
export const DisadvantageConfigurator = ({
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
        <div className="p-4 bg-slate-950/80 border border-rose-500/35 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider">
              <ShieldAlert size={14} />
              <span>Hindrance Scope & Character Point Rebate</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-[10px] text-rose-200">
              Max +10 CP Personal Rebate Cap
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Rebate Scope</label>
              <select
                disabled={!isEditMode}
                value={formData.flaw_scope || formData.category || FLAW_SCOPES[0]}
                onChange={(e) => {
                  onChange('flaw_scope', e.target.value);
                  onChange('category', e.target.value);
                }}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              >
                {FLAW_SCOPES.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-rose-300 uppercase">CP Rebate (+1 to +6 CP)</label>
              <input
                type="number"
                min={1}
                max={6}
                disabled={!isEditMode}
                value={Math.abs(Number(formData.cp_rebate ?? formData.cp ?? formData.costs?.cp ?? 2)) || 2}
                onChange={(e) => {
                  const rebate = Math.max(1, Math.min(6, parseInt(e.target.value, 10) || 2));
                  onChange('cp_rebate', rebate);
                  onChange('cp', -rebate);
                  onChange('costs', { ...(formData.costs || {}), cp: -rebate, bp: -rebate });
                }}
                className="w-full p-2.5 bg-slate-900 border border-rose-500/40 rounded-xl text-xs text-rose-200"
              />
            </div>
          </div>
        </div>
      )}

      {showMechanics && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Resistance / Save Check</label>
              <select
                disabled={!isEditMode}
                value={formData.save_type || SAVE_TYPES[0]}
                onChange={(e) => onChange('save_type', e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-200"
              >
                {SAVE_TYPES.map((sv) => (
                  <option key={sv} value={sv}>
                    {sv}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Save Target CR</label>
              <input
                type="number"
                min={5}
                max={35}
                disabled={!isEditMode}
                value={formData.save_cr ?? 15}
                onChange={(e) => onChange('save_cr', parseInt(e.target.value, 10) || 15)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CortexSmartPicker
              label="Inflicted Status Conditions"
              sourceCollection="conditions"
              value={formData.inflicted_conditions}
              valueFormat="array"
              onChange={(val) => onChange('inflicted_conditions', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#f43f5e"
              placeholder="Search Cortex conditions (e.g., Disoriented, Blind)..."
            />

            <CortexSmartPicker
              label="Prosthetic / Augmentation Counterplay"
              sourceCollection="augmentations"
              value={formData.mitigation_augmentations}
              valueFormat="array"
              onChange={(val) => onChange('mitigation_augmentations', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#ec4899"
              placeholder="Implants or gear that suppress this flaw..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Cpu size={12} className="text-rose-400" />
              <span>Trigger Stimulus, Penalty & Buy-Off Rule</span>
            </label>
            <textarea
              rows={3}
              disabled={!isEditMode}
              value={formData.mechanic || ''}
              onChange={(e) => onChange('mechanic', e.target.value)}
              placeholder="Specify exact trigger frequency, roll penalty, and CP buy-off or medical remediation rules..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(DisadvantageConfigurator);
