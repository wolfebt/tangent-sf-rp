import React from 'react';
import { Package, Coins, Wrench } from 'lucide-react';
import { CortexSmartPicker } from '../../../components/Codex/GuidedStudio/CortexSmartPicker';

const OTHER_PROPERTY_CLASSES = [
  'Pristine Crafting Material (50% Market Value Input)',
  'Unrefined Salvage / Scrap Mass (5x Mass Synthesis Rule)',
  'Bulk Trade Commodity',
  'Luxury / Diplomatic Curio',
  'Rations, Medical & Consumables',
  'Data Core / Encrypted Ledger',
  'Title Deed / Corporate Charter',
  'Currency / Bullion Scrip'
];

const LEGALITY_RATINGS = [
  'Open Commercial (Unrestricted)',
  'Licensed Guild / Corporate',
  'Restricted Military / Regulated',
  'Black Market Contraband',
  'Progenitor Quarantine (Omega)'
];

/**
 * OtherPropertyConfigurator
 * Dedicated configurator for Miscellaneous Personal Property, Commodities,
 * Pristine Crafting Materials, and Unrefined Scrap (`other` / `other_property`).
 */
export const OtherPropertyConfigurator = ({
  formData = {},
  onChange,
  isEditMode = true,
  onOpenPicker = null,
  dbData = {},
  stepSection = 'all'
}) => {
  const showChassis = stepSection === 'all' || stepSection === 'chassis';
  const showMechanics = stepSection === 'all' || stepSection === 'mechanics';

  return (
    <div className="space-y-4 font-mono">
      {showChassis && (
        <div className="p-4 bg-slate-950/80 border border-slate-700 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <Package size={14} />
              <span>Commodity Class, UDU Cargo Volume & Legality</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-amber-300">
              Pocket = 0.2 UDU • Crate = 10 UDU
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Property Classification</label>
              <select
                disabled={!isEditMode}
                value={formData.commodity_class || formData.classification || OTHER_PROPERTY_CLASSES[2]}
                onChange={(e) => {
                  onChange('commodity_class', e.target.value);
                  onChange('classification', e.target.value);
                }}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              >
                {OTHER_PROPERTY_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Unit Displacement (UDU)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                disabled={!isEditMode}
                value={formData.udu ?? formData.weight ?? 1}
                onChange={(e) => {
                  const uduVal = Math.max(0, parseFloat(e.target.value) || 0);
                  onChange('udu', uduVal);
                  onChange('weight', uduVal);
                }}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Customs / Legality</label>
              <select
                disabled={!isEditMode}
                value={formData.availability || LEGALITY_RATINGS[0]}
                onChange={(e) => onChange('availability', e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-200"
              >
                {LEGALITY_RATINGS.map((leg) => (
                  <option key={leg} value={leg}>
                    {leg}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {showMechanics && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Coins size={14} />
              <span>Trade Margins, Synthesis Feedstock & Utility</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Fence Resale = 10% Base • Pristine Input = 50%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CortexSmartPicker
              label="Material Composition / Properties"
              sourceCollection="material"
              value={formData.materials}
              valueFormat="array"
              onChange={(val) => onChange('materials', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#f59e0b"
              placeholder="Search Cortex materials (e.g., Durasteel, Aetherite)..."
            />

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Wrench size={12} className="text-emerald-400" />
                <span>Preferred Planetary Trade Codes</span>
              </label>
              <input
                type="text"
                disabled={!isEditMode}
                value={formData.trade_codes || ''}
                onChange={(e) => onChange('trade_codes', e.target.value)}
                placeholder="E.g., In (Industrial), Ag (Agricultural), Hi (High Pop), Ri (Rich)"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-slate-300 uppercase">
              Synthesis Application & Field Handling Rules
            </label>
            <textarea
              rows={3}
              disabled={!isEditMode}
              value={formData.mechanic || ''}
              onChange={(e) => onChange('mechanic', e.target.value)}
              placeholder="Describe crafting feedstock bonuses, spoilage/containment hazards, or trade margin modifiers..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(OtherPropertyConfigurator);
