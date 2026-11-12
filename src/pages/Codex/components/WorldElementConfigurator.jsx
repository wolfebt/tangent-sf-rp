import React from 'react';
import { Sparkles, Globe, Compass, Crosshair, ShieldAlert, BookOpen } from 'lucide-react';
import { CortexSmartPicker } from '../../../components/Codex/GuidedStudio/CortexSmartPicker';

const SCENE_TYPES = [
  'Action / Tactical Combat',
  'Social / Diplomatic Intrigue',
  'Investigation / Cyber-Recon',
  'Environmental Hazard / Survival',
  'Exploration / Progenitor Anomaly',
  'Downtime / Crafting & Trade'
];

/**
 * WorldElementConfigurator
 * Adaptive multi-step configurator for `universe`, `setting`, `philosophy`, and `scene`.
 */
export const WorldElementConfigurator = ({
  formData = {},
  onChange,
  isEditMode = true,
  onOpenPicker = null,
  dbData = {},
  domainKey = 'setting',
  stepSection = 'all'
}) => {
  const showAnchor = stepSection === 'all' || stepSection === 'anchor';
  const showMechanics = stepSection === 'all' || stepSection === 'mechanics';

  return (
    <div className="space-y-4 font-mono">
      {/* 1. UNIVERSE COSMOLOGY */}
      {domainKey === 'universe' && (
        <div className="p-4 bg-slate-950/80 border border-purple-500/35 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Cosmological Constants, Tangent FTL & Active Disciplines</span>
          </div>

          {showAnchor && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Cosmological Scale</label>
                <select
                  disabled={!isEditMode}
                  value={formData.scale || 'Galaxy / Sector Arm'}
                  onChange={(e) => onChange('scale', e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                >
                  <option value="Star System">Single Star System</option>
                  <option value="Sub-Sector Cluster">Sub-Sector Cluster</option>
                  <option value="Galaxy / Sector Arm">Galaxy / Sector Arm</option>
                  <option value="Multiverse / Planar Continuum">Multiverse / Planar Continuum</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Max Tech Ceiling (TL 0–5)</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  disabled={!isEditMode}
                  value={formData.tech_level ?? 5}
                  onChange={(e) => onChange('tech_level', Math.max(0, Math.min(5, parseInt(e.target.value, 10) || 0)))}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Max Meta Ceiling (ML 0–5)</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  disabled={!isEditMode}
                  value={formData.meta_level ?? 5}
                  onChange={(e) => onChange('meta_level', Math.max(0, Math.min(5, parseInt(e.target.value, 10) || 0)))}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-purple-200"
                />
              </div>
            </div>
          )}

          {showMechanics && (
            <>
              <CortexSmartPicker
                label="Active Metaphysical Disciplines"
                sourceCollection="disciplines"
                value={formData.active_disciplines}
                valueFormat="array"
                onChange={(val) => onChange('active_disciplines', val)}
                formData={formData}
                dbData={dbData}
                isEditMode={isEditMode}
                onOpenPicker={onOpenPicker}
                accentColor="#a855f7"
                placeholder="Dimension, Energy, Entropy, Illusion, Matter, Mental..."
              />
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">
                  Laws of Physics, FTL Translation & Thematic Tone
                </label>
                <textarea
                  rows={3}
                  disabled={!isEditMode}
                  value={formData.laws_of_physics || formData.thematicTone || ''}
                  onChange={(e) => onChange('laws_of_physics', e.target.value)}
                  placeholder="Relativistic starflight, Tangent Space dimensional translation rules, resonance behavior..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. SETTING / DISTRICT / STATION */}
      {domainKey === 'setting' && (
        <div className="p-4 bg-slate-950/80 border border-cyan-500/35 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
            <Globe size={14} />
            <span>Setting Anchor, Security Law & Points of Interest</span>
          </div>

          {showAnchor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CortexSmartPicker
                label="Parent Planet / World"
                sourceCollection="world"
                value={formData.world}
                valueFormat="csv"
                onChange={(val) => onChange('world', val)}
                formData={formData}
                dbData={dbData}
                isEditMode={isEditMode}
                onOpenPicker={onOpenPicker}
                accentColor="#14b8a6"
                placeholder="Link parent Cortex world (e.g., Auriga Prime)..."
              />
              <CortexSmartPicker
                label="Controlling / Resident Factions"
                sourceCollection="factions"
                value={formData.factions}
                valueFormat="array"
                onChange={(val) => onChange('factions', val)}
                formData={formData}
                dbData={dbData}
                isEditMode={isEditMode}
                onOpenPicker={onOpenPicker}
                accentColor="#10b981"
                placeholder="Link local polities or syndicates..."
              />
            </div>
          )}

          {showMechanics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Key Points of Interest</label>
                <textarea
                  rows={3}
                  disabled={!isEditMode}
                  value={formData.points_of_interest || ''}
                  onChange={(e) => onChange('points_of_interest', e.target.value)}
                  placeholder="Dockyard Sector 7, Null-G Bazaar, Spire Concourse..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-amber-300 uppercase">Local Law, Customs & Hazards</label>
                <textarea
                  rows={3}
                  disabled={!isEditMode}
                  value={formData.localRulesHazards || formData.mechanic || ''}
                  onChange={(e) => {
                    onChange('localRulesHazards', e.target.value);
                    onChange('mechanic', e.target.value);
                  }}
                  placeholder="Law Level 5 customs scans, low-gravity zones, radiation shielding..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PHILOSOPHY / CREED */}
      {domainKey === 'philosophy' && (
        <div className="p-4 bg-slate-950/80 border border-amber-500/35 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <BookOpen size={14} />
            <span>Core Dogma, Practices & Favored Capabilities</span>
          </div>

          {showMechanics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-300 uppercase">Core Dogma & Tenets</label>
                  <textarea
                    rows={3}
                    disabled={!isEditMode}
                    value={formData.coreDogmaTenets || ''}
                    onChange={(e) => onChange('coreDogmaTenets', e.target.value)}
                    placeholder="Foundational truths, ethical imperatives, and taboos..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-300 uppercase">Observances & Ritual Practices</label>
                  <textarea
                    rows={3}
                    disabled={!isEditMode}
                    value={formData.practices || ''}
                    onChange={(e) => onChange('practices', e.target.value)}
                    placeholder="Harmonic meditation, neural communion, pilgrimage rites..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CortexSmartPicker
                  label="Favored Skills"
                  sourceCollection="skills"
                  value={formData.recommended_skills}
                  valueFormat="array"
                  onChange={(val) => onChange('recommended_skills', val)}
                  formData={formData}
                  dbData={dbData}
                  isEditMode={isEditMode}
                  onOpenPicker={onOpenPicker}
                  accentColor="#eab308"
                />
                <CortexSmartPicker
                  label="Associated Pillar Traits"
                  sourceCollection="traits"
                  value={formData.traits}
                  valueFormat="array"
                  onChange={(val) => onChange('traits', val)}
                  formData={formData}
                  dbData={dbData}
                  isEditMode={isEditMode}
                  onOpenPicker={onOpenPicker}
                  accentColor="#10b981"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. DRAMATIC SCENE & AIME ENCOUNTER ASSEMBLER */}
      {(domainKey === 'scene' || domainKey === 'world_design') && (
        <div className="p-4 bg-slate-950/80 border border-rose-500/35 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider">
              <Crosshair size={14} />
              <span>AIME Dramatic Beat & Cortex Encounter Assembler</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-[10px] text-rose-200">
              2d10 CR 15 Baseline
            </span>
          </div>

          {showAnchor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase">Scene Beat Classification</label>
                <select
                  disabled={!isEditMode}
                  value={formData.scene_type || SCENE_TYPES[0]}
                  onChange={(e) => onChange('scene_type', e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-rose-200"
                >
                  {SCENE_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <CortexSmartPicker
                label="Setting / Location Anchor"
                sourceCollection="setting"
                value={formData.setting_location}
                valueFormat="csv"
                onChange={(val) => onChange('setting_location', val)}
                formData={formData}
                dbData={dbData}
                isEditMode={isEditMode}
                onOpenPicker={onOpenPicker}
                accentColor="#06b6d4"
                placeholder="Link Cortex Setting..."
              />
            </div>
          )}

          {showMechanics && (
            <>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-amber-300 uppercase">Dramatic Hook & Immediate Stakes</label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={formData.dramatic_hook || ''}
                  onChange={(e) => onChange('dramatic_hook', e.target.value)}
                  placeholder="E.g., Syndicate breach teams seal the blast doors as the starship finishes fueling..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CortexSmartPicker
                  label="Encounter Adversaries (MCM Threats)"
                  sourceCollection="modular_characters"
                  value={formData.encounter_threats}
                  valueFormat="array"
                  onChange={(val) => onChange('encounter_threats', val)}
                  formData={formData}
                  dbData={dbData}
                  isEditMode={isEditMode}
                  onOpenPicker={onOpenPicker}
                  accentColor="#ef4444"
                  helperText="Attach canonical Modular Character Matrix statblocks."
                  placeholder="Search Cortex MCM threats..."
                />

                <CortexSmartPicker
                  label="Key Challenge Skills"
                  sourceCollection="skills"
                  value={formData.challenge_skills}
                  valueFormat="array"
                  onChange={(val) => onChange('challenge_skills', val)}
                  formData={formData}
                  dbData={dbData}
                  isEditMode={isEditMode}
                  onOpenPicker={onOpenPicker}
                  accentColor="#3b82f6"
                  helperText="Primary skills tested during this scene."
                  placeholder="E.g., Computers, Engineering, Stealth..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <ShieldAlert size={12} className="text-cyan-400" />
                  <span>Tactical Terrain, Cover & 2d10 CR Checks</span>
                </label>
                <textarea
                  rows={3}
                  disabled={!isEditMode}
                  value={formData.mechanic || ''}
                  onChange={(e) => onChange('mechanic', e.target.value)}
                  placeholder="E.g., Computers CR 20 to override mag-clamps; cargo gantries grant Half Cover (+2 Defense)."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(WorldElementConfigurator);
