import React from 'react';
import { Flag, Shield, Globe, Compass } from 'lucide-react';
import { CortexSmartPicker } from '../../../components/Codex/GuidedStudio/CortexSmartPicker';

const IDEOLOGY_AXES = [
  {
    key: 'economic',
    field: 'ideology_economic',
    label: 'Economic Axis',
    options: [
      'Balanced / Mixed',
      'Collectivist / Communal',
      'Syndicalist / Guild',
      'Mercantilist / State',
      'Corporatist / Laissez-Faire',
      'Post-Scarcity'
    ]
  },
  {
    key: 'authority',
    field: 'ideology_authority',
    label: 'Authority Axis',
    options: [
      'Constitutional / Federal',
      'Anarcho-Frontier',
      'Libertarian / Decentralized',
      'Oligarchic / Plutocratic',
      'Authoritarian / Martial',
      'Totalitarian / Hive'
    ]
  },
  {
    key: 'technocratic',
    field: 'ideology_technocratic',
    label: 'Technocratic Axis',
    options: [
      'Pragmatic / Standard',
      'Bioconservative / Luddite',
      'Industrial / Utilitarian',
      'Cyber-Integrated',
      'Transhumanist / Synthetic',
      'Singularity / AI-Led'
    ]
  },
  {
    key: 'metaphysical',
    field: 'ideology_metaphysical',
    label: 'Metaphysical Axis',
    options: [
      'Secular / Agnostic',
      'Strict Materialist / Null',
      'Regulated Psionics',
      'Esoteric / Scholastic',
      'Resonant / Awakened',
      'Theocratic / Cultic'
    ]
  },
  {
    key: 'diplomatic',
    field: 'ideology_diplomatic',
    label: 'Diplomatic Axis',
    options: [
      'Pragmatic / Neutral',
      'Isolationist / Xenophobic',
      'Defensive / Protectionist',
      'Coalition / Multilateral',
      'Mercantile / Cosmopolitan',
      'Hegemonic / Expansionist'
    ]
  }
];

const formatVal = (v) => {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

/**
 * FactionConfigurator
 * Modular configurator for Interstellar Factions & Polities (Operator Guide 1.04).
 * Supports granular Guided Studio `stepSection` slicing ('all' | 'operator_package' | 'military_economy' | 'ideology')
 * and replaces free-text lists with Omnicortex-backed `CortexSmartPicker` selectors.
 */
export const FactionConfigurator = ({
  formData = {},
  onChange,
  isEditMode = true,
  onOpenPicker = null,
  dbData = {},
  stepSection = 'all'
}) => {
  const showOperatorPackage = stepSection === 'all' || stepSection === 'operator_package';
  const showMilitaryEconomy = stepSection === 'all' || stepSection === 'military_economy';
  const showIdeology = stepSection === 'all' || stepSection === 'ideology';

  const profileObj =
    typeof formData.ideological_profile === 'object' && formData.ideological_profile !== null
      ? formData.ideological_profile
      : {};

  return (
    <div className="space-y-4">
      {/* 1. Operator Induction Package (Fixed 20 SP Pool & Cortex Perks) */}
      {showOperatorPackage && (
        <div className="p-4 bg-slate-950/70 border border-emerald-500/35 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              <Flag size={14} />
              <span>Faction Operator Induction Package (Fixed 20-SP Pool & Perks)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/35 text-[10px] font-mono text-emerald-300">
              Operator Guide 1.04 • Fixed 20 SP Pool (Non-Adjustable) • -1 CP Feature Discount
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CortexSmartPicker
              label="Skill Catalog — Faction Skill Package (Fixed 20 SP Pool)"
              sourceCollection="skills"
              targetField="skill_package"
              alsoSyncFields={['recommended_skills']}
              value={formData.skill_package || formData.recommended_skills}
              valueFormat="csv"
              onChange={(val) => {
                onChange('skill_package', val);
                const list = typeof val === 'string'
                  ? val.split(',').map((s) => s.trim()).filter(Boolean)
                  : (Array.isArray(val) ? val : []);
                onChange('recommended_skills', list);
              }}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#10b981"
              helperText="Browse the canonical Skill Catalog to select skills eligible for the fixed 20 Faction Skill Points."
              placeholder="Search Skill Catalog (e.g., Streetwise, Pilot, Bluff)..."
            />

            <CortexSmartPicker
              label="Feature Catalog — Recommended Features (-1 CP Discount)"
              sourceCollection="features"
              targetField="recommended_features"
              value={formData.recommended_features}
              valueFormat="array"
              onChange={(val) => onChange('recommended_features', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              isDiscountedFeaturePool={true}
              accentColor="#10b981"
              helperText="Browse the canonical Feature Catalog for Faction features receiving the -1 CP Folio discount."
              placeholder="Search Feature Catalog (e.g., Tough, Gearhead, Connected)..."
            />

            <CortexSmartPicker
              label="Bonus Features & Faction Traits"
              sourceCollection="traits"
              targetField="bonus_features"
              value={formData.bonus_features}
              valueFormat="csv"
              onChange={(val) => onChange('bonus_features', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#34d399"
              helperText="Cultural or allegiance traits granted or unlocked by Faction standing."
              placeholder="Search Cortex traits..."
            />

            <CortexSmartPicker
              label="Typical Operator Archetypes"
              sourceCollection="archetypes"
              targetField="typical_archetypes"
              value={formData.typical_archetypes}
              valueFormat="csv"
              onChange={(val) => onChange('typical_archetypes', val)}
              formData={formData}
              dbData={dbData}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              accentColor="#8b5cf6"
              helperText="Canonical 80-CP Archetypes commonly fielded by this polity."
              placeholder="Search Cortex archetypes..."
            />
          </div>

          <div className="space-y-1 pt-1">
            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
              Faction-Specific Rules & Mechanical Perks
            </label>
            {isEditMode ? (
              <textarea
                rows={3}
                value={formatVal(formData.mechanic)}
                onChange={(e) => onChange('mechanic', e.target.value)}
                placeholder="Standing perks, requisition privileges, diplomatic immunities, or jurisdictional bonuses..."
                className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
              />
            ) : (
              <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                {formatVal(formData.mechanic) || 'None defined.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Military Doctrine, Fleet, Trade, WS & Law */}
      {showMilitaryEconomy && (
        <>
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
              <Shield size={14} />
              <span>Military Doctrine, Elite Formations & Void Fleet</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  field: 'military_doctrine',
                  label: 'Military Doctrine & Combat Strategy',
                  rows: 3,
                  placeholder: 'E.g., Combined-arms orbital drop assaults backed by electronic warfare...'
                },
                {
                  field: 'key_units',
                  label: 'Key Military Formations & Elite Units',
                  rows: 3,
                  placeholder: 'E.g., Colonial Rangers, Aegis Shock Lancers...'
                },
                {
                  field: 'naval_assets',
                  label: 'Naval & Void Fleet Assets',
                  rows: 2,
                  placeholder: 'E.g., Goliath Siege-Haulers, Strike Cruisers...'
                },
                {
                  field: 'unique_tech_materials',
                  label: 'Signature Tech, Relics & Materials',
                  rows: 2,
                  placeholder: 'E.g., Aetherite Capacitors, Hard-Light Lattice Plating...'
                }
              ].map((item) => (
                <div key={item.field} className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                    {item.label}
                  </label>
                  {isEditMode ? (
                    <textarea
                      rows={item.rows}
                      value={formatVal(formData[item.field])}
                      onChange={(e) => onChange(item.field, e.target.value)}
                      placeholder={item.placeholder}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                    />
                  ) : (
                    <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                      {formatVal(formData[item.field]) || 'None specified.'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <Globe size={14} />
              <span>Trade Economy, Wealth Score Modifier (-4 to +8 WS) & Law Level</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                  Wealth Modifier (-4 to +8 WS)
                </label>
                {isEditMode ? (
                  <div className="flex gap-2">
                    <select
                      value={(() => {
                        const m = String(formData.wealth_modifier ?? '0').match(/([+-]?\d+)/);
                        if (!m) return '0';
                        const n = Math.max(-4, Math.min(8, parseInt(m[1], 10)));
                        return n > 0 ? `+${n}` : String(n);
                      })()}
                      onChange={(e) => onChange('wealth_modifier', e.target.value)}
                      className="w-28 p-2.5 bg-slate-900 border border-amber-500/40 rounded-xl text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-400"
                    >
                      {[-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map((ws) => {
                        const valStr = ws > 0 ? `+${ws}` : String(ws);
                        return (
                          <option key={ws} value={valStr}>
                            {valStr} WS
                          </option>
                        );
                      })}
                    </select>
                    <input
                      type="text"
                      value={formatVal(formData.wealth_modifier)}
                      onChange={(e) => onChange('wealth_modifier', e.target.value)}
                      placeholder="E.g., +2 (Corporate Stipend)"
                      className="flex-1 p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-amber-200">
                    {formatVal(formData.wealth_modifier) || '0 WS (Baseline)'}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  Law Level (0–15) & Enforcement Bodies
                </label>
                {isEditMode ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={formData.law_level ?? formData.lawLevel ?? 4}
                      onChange={(e) => {
                        const v = e.target.value === '' ? '' : Math.max(0, Math.min(15, parseInt(e.target.value, 10) || 0));
                        onChange('law_level', v);
                        onChange('lawLevel', v);
                      }}
                      className="w-20 p-2.5 bg-slate-900 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 font-mono focus:outline-none focus:border-cyan-400"
                    />
                    <input
                      type="text"
                      value={formatVal(formData.law_order)}
                      onChange={(e) => onChange('law_order', e.target.value)}
                      placeholder="E.g., Federal Marshals, Guild Arbiters..."
                      className="flex-1 p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                    {formData.law_level !== undefined ? `Law Level ${formData.law_level} — ` : ''}
                    {formatVal(formData.law_order) || 'Standard'}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Polity Trade & Resource System
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formatVal(formData.economic_model)}
                    onChange={(e) => onChange('economic_model', e.target.value)}
                    placeholder="E.g., Guild Syndicalism, Free-Port Mercantilism"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300">
                    {formatVal(formData.economic_model) || 'Standard'}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Primary Exports & Strategic Commodities
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formatVal(formData.primary_exports)}
                    onChange={(e) => onChange('primary_exports', e.target.value)}
                    placeholder="E.g., Refined Aetherite, Cyber-Optics, Heavy Alloys"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300">
                    {formatVal(formData.primary_exports) || 'None specified.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. 5-Axis Ideological Profile */}
      {showIdeology && (
        <div className="p-4 bg-slate-950/70 border border-purple-500/35 rounded-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
              <Compass size={14} />
              <span>5-Axis Sociological & Ideological Matrix</span>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded">
              Economic • Authority • Technocratic • Metaphysical • Diplomatic
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {IDEOLOGY_AXES.map((axis) => {
              const currentVal = formData[axis.field] || profileObj[axis.key] || axis.options[0];
              return (
                <div key={axis.key} className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">
                    {axis.label}
                  </label>
                  {isEditMode ? (
                    <select
                      value={currentVal}
                      onChange={(e) => {
                        const nextVal = e.target.value;
                        onChange(axis.field, nextVal);
                        onChange('ideological_profile', {
                          ...profileObj,
                          [axis.key]: nextVal
                        });
                      }}
                      className="w-full p-2 bg-slate-900 border border-purple-500/40 rounded-xl text-[11px] text-slate-200 font-mono focus:outline-none focus:border-purple-400"
                    >
                      {axis.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] font-mono text-purple-200">
                      {currentVal}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(FactionConfigurator);
