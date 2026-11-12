import React from 'react';
import { Globe, Sliders } from 'lucide-react';
import { CortexSmartPicker } from '../../../components/Codex/GuidedStudio/CortexSmartPicker';

const STAGE_DEFINITIONS = [
  { value: 0, label: 'Stage 0 — Archaic / Pre-Industrial (TL 0)' },
  { value: 1, label: 'Stage 1 — Industrial / Mechanized (TL 1)' },
  { value: 2, label: 'Stage 2 — Atomic / Information Age (TL 2)' },
  { value: 3, label: 'Stage 3 — Interstellar Baseline (TL 3)' },
  { value: 4, label: 'Stage 4 — Post-Scarcity / Hard-Light (TL 4)' },
  { value: 5, label: 'Stage 5 — Progenitor / Transcendent (TL 5)' }
];

const TOOL_TIERS = [
  'Tier 1: Improvised (x1 PP)',
  'Tier 2: Field Kit (x2 PP)',
  'Tier 3: Workshop (x5 PP)',
  'Tier 4: Industrial Bay (x20 PP)',
  'Tier 5: Automated Foundry (x100 PP)',
  'Tier 6: Orbital Shipyard (x500 PP)',
  'Tier 7: Genesis Nanoforge (x5,000 PP)'
];

/**
 * SocietySphereConfigurator
 * Specialized configurator for Master `societies` and all 18 `society_*` civilizational spheres.
 */
export const SocietySphereConfigurator = ({
  formData = {},
  onChange,
  isEditMode = true,
  onOpenPicker = null,
  dbData = {},
  domainKey = 'societies',
  stepSection = 'all'
}) => {
  const showStage = stepSection === 'all' || stepSection === 'stage';
  const showMechanics = stepSection === 'all' || stepSection === 'mechanics';
  const sphereTitle =
    domainKey === 'societies'
      ? 'Master 18-Sphere Civilization Profile'
      : `Sphere: ${domainKey.replace(/^society_/, '').replace(/_/g, ' ').toUpperCase()}`;

  return (
    <div className="space-y-4 font-mono">
      {showStage && (
        <div className="p-4 bg-slate-950/80 border border-sky-500/35 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300 uppercase tracking-wider">
              <Globe size={14} />
              <span>{sphereTitle}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/40 text-[10px] text-sky-200">
              Stage 0–5 Spectrum
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Development Stage (0–5)</label>
              <select
                disabled={!isEditMode}
                value={Number(formData.level ?? formData.stage ?? formData.tech_level ?? 3)}
                onChange={(e) => {
                  const lvl = Number(e.target.value) || 0;
                  onChange('level', lvl);
                  onChange('stage', lvl);
                  onChange('tech_level', lvl);
                }}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-sky-200"
              >
                {STAGE_DEFINITIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Max Local Crafting Tool Tier</label>
              <select
                disabled={!isEditMode}
                value={formData.max_tool_tier || TOOL_TIERS[3]}
                onChange={(e) => onChange('max_tool_tier', e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-200"
              >
                {TOOL_TIERS.map((tt) => (
                  <option key={tt} value={tt}>
                    {tt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {showMechanics && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Sliders size={14} />
            <span>Infrastructure Modifiers & Exemplar Polities</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CortexSmartPicker
              label="Exemplar Polities / Factions"
              sourceCollection="factions"
              value={formData.exemplar_factions}
              valueFormat="array"
              onChange={(val) => onChange('exemplar_factions', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#10b981"
              placeholder="Link Cortex factions at this stage..."
            />

            <CortexSmartPicker
              label="Exemplar Worlds"
              sourceCollection="world"
              value={formData.exemplar_worlds}
              valueFormat="array"
              onChange={(val) => onChange('exemplar_worlds', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#38bdf8"
              placeholder="Link Cortex worlds..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-slate-300 uppercase">
              Operational & Market Availability Effects
            </label>
            <textarea
              rows={3}
              disabled={!isEditMode}
              value={formData.mechanic || ''}
              onChange={(e) => onChange('mechanic', e.target.value)}
              placeholder="Specify how this infrastructure stage affects equipment availability, medical recovery, communications, or trade..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SocietySphereConfigurator);
