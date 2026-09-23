import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Zap,
  Layers,
  ShieldAlert,
  Boxes,
  Compass,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Sliders,
  Battery,
  FileCode,
  RotateCcw
} from 'lucide-react';
import {
  getTechLevelDef,
  getSubStrataDetails,
  calculateTechPenalty,
  getSchematicCost,
  getReconfigTime,
  getDomainCapability,
  getAvailableTechAtTL
} from '../../../../engines/tangentTechEngine';
import {
  TECH_LEVELS,
  SUB_STRATA,
  ADAPTIVE_TECH_TYPES,
  ADAPTIVE_TECH_RECONFIG_TIMES,
  SYNTHETIC_INTELLIGENCE_CONTINUUM,
  SCHEMATIC_RARITY
} from '../../../../engines/tangentConstants';
import { AudioService } from '../../../../services/audioService';

/**
 * TechnologyStudioWorkflow
 * Integrates canonical Domain 10 Technology Codex mechanics directly into the Asset Studio:
 * - Tech Level (TL 0-5+) & Sub-Strata (Nascent, Standard, Advanced) calibration
 * - Interactive Operator Tech Penalty Adjudicator (character TL vs item TL, weapon vs general tool)
 * - Power Plant & Energy Storage specifications
 * - Blueprint Schematics Rarity, acquisition cost & reverse-engineering DC
 * - Adaptive matter reconfiguration action economy
 * - Synthetic Intelligence (SI) Continuum rating
 * - One-click commitment to blueprint formData
 */
export const TechnologyStudioWorkflow = ({
  matrix,
  formData = {},
  onChange,
  isEditMode = true,
  computedValues = {}
}) => {
  const isWeapon = matrix.id === 'weaponry';
  const isMechaOrShip = matrix.id === 'mecha';
  const isStructure = matrix.id === 'architecture';
  const isAugmentation = matrix.id === 'augmentations';

  // 1. Tech Level State
  const initialTL = Number(formData.tl ?? formData.tech_level ?? 3) || 3;
  const [selectedTL, setSelectedTL] = useState(initialTL);
  const [selectedStratum, setSelectedStratum] = useState(formData.sub_stratum || 'Standard');

  const tlDef = useMemo(() => getTechLevelDef(selectedTL), [selectedTL]);
  const strataDetails = useMemo(() => getSubStrataDetails(selectedTL, selectedStratum), [selectedTL, selectedStratum]);
  const unlockedTech = useMemo(() => getAvailableTechAtTL(selectedTL), [selectedTL]);

  // 2. Operator Tech Penalty Simulation
  const [operatorTL, setOperatorTL] = useState(2);
  const [isWeaponPenalty, setIsWeaponPenalty] = useState(isWeapon);

  const penaltyScore = useMemo(() => {
    return calculateTechPenalty(selectedTL, operatorTL, isWeaponPenalty);
  }, [selectedTL, operatorTL, isWeaponPenalty]);

  // 3. Power Systems & Storage
  const [powerSource, setPowerSource] = useState(
    formData.power_source || formData.power_grid || (selectedTL >= 3 ? 'Compact Fusion Core' : 'Chemical Micro-Cell')
  );
  const [powerDrawKW, setPowerDrawKW] = useState(Number(formData.power_draw || formData.power_consumption || 10) || 10);
  const [batteryHours, setBatteryHours] = useState(formData.battery_life || '120 Hours Continuous');

  // 4. Schematic Rarity & Cost
  const [schematicRarity, setSchematicRarity] = useState(
    formData.schematic_rarity || (selectedTL >= 4 ? 'Rare/Restricted' : 'Common')
  );
  const baseCreditVal = Number(formData.cost ?? computedValues.credit_value ?? 1000) || 1000;
  const schematicData = useMemo(() => {
    return getSchematicCost(baseCreditVal, schematicRarity);
  }, [baseCreditVal, schematicRarity]);

  // 5. Adaptive Reconfiguration Action Economy
  const [adaptiveType, setAdaptiveType] = useState('Programmable Matter (Picotech)');
  const adaptiveReconfig = useMemo(() => {
    const timeEntry = ADAPTIVE_TECH_RECONFIG_TIMES[selectedTL];
    if (timeEntry) return timeEntry;
    return getReconfigTime(adaptiveType);
  }, [selectedTL, adaptiveType]);

  // 6. Synthetic Intelligence Continuum (for Mecha, Structures, Drones)
  const [siRating, setSiRating] = useState(Number(formData.si_stage || formData.si_rating || 0) || 0);
  const activeSI = useMemo(() => {
    return SYNTHETIC_INTELLIGENCE_CONTINUUM.find(s => s.stage === siRating) || SYNTHETIC_INTELLIGENCE_CONTINUUM[0];
  }, [siRating]);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState('tech_level');

  // Commit handler
  const handleApplyTechProfile = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    if (!onChange) return;
    onChange('tl', selectedTL);
    onChange('tech_level', selectedTL);
    onChange('sub_stratum', selectedStratum);
    onChange('power_source', powerSource);
    onChange('power_grid', powerSource);
    onChange('power_draw', powerDrawKW);
    onChange('battery_life', batteryHours);
    onChange('schematic_rarity', schematicRarity);
    onChange('schematic_cost', schematicData.schematicCost);
    onChange('integration_dc', schematicData.integrationDC);
    if (isMechaOrShip || isStructure) {
      onChange('si_stage', siRating);
      onChange('si_name', activeSI.name);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans select-none animate-fade-in">
      {/* Technology Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-slate-950/80 border border-blue-500/40 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-300 shadow-md">
            <Cpu size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                BASTION Domain 10
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs font-mono text-slate-400">Technology & Sub-Strata Engine</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold font-mono uppercase text-white mt-0.5">
              {matrix.name} Tech Level & Systems Calibration
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isEditMode && (
            <button
              type="button"
              onClick={handleApplyTechProfile}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              title="Apply tech level and specs to asset"
            >
              <Sparkles size={13} />
              <span>Apply Tech Profile</span>
            </button>
          )}

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('tech_level')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'tech_level' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-blue-200'
              }`}
            >
              TL & Era
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('penalties')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'penalties' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-blue-200'
              }`}
            >
              Tech Penalties
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('power')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'power' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-blue-200'
              }`}
            >
              Power & Grid
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schematics')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'schematics' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-blue-200'
              }`}
            >
              Schematics
            </button>
            {(isMechaOrShip || isStructure) && (
              <button
                type="button"
                onClick={() => setActiveTab('si')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  activeTab === 'si' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-blue-200'
                }`}
              >
                SI Continuum
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── TAB 1: TL & ERA SELECTION ── */}
      {activeTab === 'tech_level' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TL Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  Canonical Tech Level (TL):
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((tl) => (
                    <button
                      key={tl}
                      type="button"
                      onClick={() => setSelectedTL(tl)}
                      className={`p-2.5 rounded-xl border text-center font-mono font-bold transition-all ${
                        selectedTL === tl
                          ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-sm">TL {tl}</div>
                      <div className="text-[9px] uppercase opacity-80 truncate">
                        {tl === 0 ? 'Prim' : tl === 1 ? 'Ind' : tl === 2 ? 'Dig' : tl === 3 ? 'Fus' : tl === 4 ? 'Pic' : 'Fem'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Stratum Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  Sub-Strata Refinement Phase:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SUB_STRATA.map((stratum) => (
                    <button
                      key={stratum}
                      type="button"
                      onClick={() => setSelectedStratum(stratum)}
                      className={`p-2.5 rounded-xl border text-center font-mono font-bold transition-all text-xs ${
                        selectedStratum === stratum
                          ? 'bg-blue-950 text-blue-200 border-blue-500 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>{stratum}</div>
                      <div className="text-[9px] text-slate-500 font-normal mt-0.5">
                        {stratum === 'Nascent' ? 'TL- (Prototype)' : stratum === 'Standard' ? 'TL (Mature)' : 'TL+ (Pinnacle)'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active TL Dossier Card */}
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-blue-300 uppercase">
                    TL {tlDef.id}: {tlDef.name} ({tlDef.era})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40">
                    {strataDetails.label}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Sub-Strata Effect: {strataDetails.desc}
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                {tlDef.description || 'Standard technological epoch benchmark defining energy systems, manufacturing fidelity, and computation scales.'}
              </p>

              {/* Technologies Unlocked */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Representative Technologies at TL {selectedTL}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {unlockedTech.map((tech, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-950 text-cyan-300 border border-cyan-500/30 rounded text-[11px]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: OPERATOR TECH PENALTIES ── */}
      {activeTab === 'penalties' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-blue-300 flex items-center gap-1.5">
              <ShieldAlert size={14} />
              <span>Operator Tech Penalty Adjudicator (Domain 10.3)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Characters using technology above their native TL suffer an unfamiliarity penalty: <span className="font-mono text-blue-300">-1 per TL gap</span> for weapons/simple interfaces, or <span className="font-mono text-blue-300">-5 per TL gap</span> for technical systems, vehicles, cyberware, and armor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase">Operative Native TL:</span>
                <span className="text-cyan-400 font-bold px-2 py-0.5 bg-cyan-950 rounded border border-cyan-500/40">
                  TL {operatorTL}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={operatorTL}
                onChange={(e) => setOperatorTL(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="text-[10px] font-mono text-slate-500">
                Asset TL {selectedTL} vs Operator TL {operatorTL} (Gap: {Math.max(0, selectedTL - operatorTL)} TLs)
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Penalty Category Rule:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setIsWeaponPenalty(true)}
                  className={`p-2 rounded-lg border text-center font-bold ${
                    isWeaponPenalty
                      ? 'bg-blue-950 text-blue-200 border-blue-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Weapon / Simple (-1/TL)
                </button>
                <button
                  type="button"
                  onClick={() => setIsWeaponPenalty(false)}
                  className={`p-2 rounded-lg border text-center font-bold ${
                    !isWeaponPenalty
                      ? 'bg-blue-950 text-blue-200 border-blue-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Technical System (-5/TL)
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Result Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 font-mono ${
            penaltyScore === 0
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                {penaltyScore === 0 ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-amber-400" />}
                <span>{penaltyScore === 0 ? 'Full Compatibility (Zero Penalty)' : `Active Unfamiliarity Penalty: ${penaltyScore} on Checks`}</span>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                {penaltyScore === 0
                  ? 'Operator TL meets or exceeds asset requirements. Full efficiency.'
                  : `Operator is ${selectedTL - operatorTL} Tech Level(s) below asset requirements. Suffers ${penaltyScore} penalty to attack or operating rolls.`}
              </p>
            </div>

            <div className="text-right text-lg font-extrabold">
              {penaltyScore === 0 ? '+0' : penaltyScore}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: POWER & GRID ── */}
      {activeTab === 'power' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-blue-300 flex items-center gap-1.5">
              <Zap size={14} />
              <span>Power System & Energy Management</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Governs internal generators, power grid loads, and battery endurance cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Power Plant / Generator:
              </label>
              <select
                value={powerSource}
                onChange={(e) => setPowerSource(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-400"
              >
                <option value="Chemical Micro-Cell">Chemical Micro-Cell (TL 2)</option>
                <option value="Thorium Fuel Pellet">Thorium Fuel Pellet (TL 2.5)</option>
                <option value="Compact Fusion Core">Compact Fusion Core (TL 3)</option>
                <option value="Heavy Fusion Matrix">Heavy Fusion Matrix (TL 3.5)</option>
                <option value="Antimatter Bottle">Antimatter Bottle (TL 4)</option>
                <option value="Zero-Point Vacuum Tap">Zero-Point Vacuum Tap (TL 5)</option>
                <option value="Biological Caloric Metasome">Biological Caloric Metasome (Bio)</option>
              </select>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Power Draw / Demand:
              </label>
              <input
                type="number"
                min="0"
                max="50000"
                value={powerDrawKW}
                onChange={(e) => setPowerDrawKW(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-400"
              />
              <span className="text-[10px] font-mono text-slate-500">Continuous kW energy draw</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Battery Storage Cycle:
              </label>
              <input
                type="text"
                value={batteryHours}
                onChange={(e) => setBatteryHours(e.target.value)}
                placeholder="E.g., 120 Hours Continuous"
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-400"
              />
              <span className="text-[10px] font-mono text-slate-500">Autonomous operational endurance</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: SCHEMATICS & BLUEPRINTS ── */}
      {activeTab === 'schematics' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-blue-300 flex items-center gap-1.5">
              <FileCode size={14} />
              <span>Schematics Rarity & Reverse-Engineering</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Fabricating this asset requires an Omnicortex schematic license. Reverse engineering requires meeting the Integration DC.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Blueprint Rarity Tier:
              </label>
              <select
                value={schematicRarity}
                onChange={(e) => setSchematicRarity(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-400"
              >
                {Object.keys(SCHEMATIC_RARITY || {}).map((rarityKey) => (
                  <option key={rarityKey} value={rarityKey}>
                    {rarityKey} (x{SCHEMATIC_RARITY[rarityKey].multiplier} Cost, DC {SCHEMATIC_RARITY[rarityKey].integrationDC})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-blue-500/40 grid grid-cols-2 gap-3 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Schematic License Cost</span>
                <span className="text-base font-extrabold text-amber-300">{schematicData.schematicCost.toLocaleString()} Cr</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Reverse-Engineering DC</span>
                <span className="text-base font-extrabold text-cyan-300">DC {schematicData.integrationDC}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: SYNTHETIC INTELLIGENCE (SI) CONTINUUM ── */}
      {activeTab === 'si' && (isMechaOrShip || isStructure) && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-blue-300 flex items-center gap-1.5">
              <Brain size={14} />
              <span>Synthetic Intelligence (SI) Continuum Rating</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous frames, neural link interfaces, and facility central computers scale along the 6-stage SI Continuum.
            </p>
          </div>

          <div className="space-y-2">
            {SYNTHETIC_INTELLIGENCE_CONTINUUM.map((si) => {
              const isSelected = si.stage === siRating;
              return (
                <div
                  key={si.stage}
                  onClick={() => setSiRating(si.stage)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-500 text-blue-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {si.stage}
                    </span>
                    <div>
                      <div className="font-mono text-xs font-bold uppercase text-slate-200">
                        SI-{si.stage}: {si.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                        {si.description}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-blue-400 border border-slate-800 shrink-0">
                    Min TL {si.tl}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(TechnologyStudioWorkflow);
