import React, { useState, useMemo } from 'react';
import {
  Maximize2,
  Scale,
  Shield,
  Zap,
  Flame,
  Crosshair,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Sliders,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  getScalingCategory,
  stepDieSide,
  scaleDamageDice,
  calculateFluidCombatModifier,
  calculateProximityDamage,
  scaleMetaTechInvocation,
  scaleMovementSpeed,
  scaleRange,
  scaleStructurePoints,
  scaleCarryingCapacity,
  validateAssetScaling
} from '../../../../engines/tangentScalingEngine';
import {
  SIZE_CATEGORIES_LIST,
  DIE_STEP_LADDER
} from '../../../../engines/tangentConstants';
import { CodexTooltip } from '../../../../components/UI/CodexTooltip';
import { AudioService } from '../../../../services/audioService';

/**
 * ScalingStudioWorkflow
 * Integrates canonical Domain 6 14-Tier Volumetric Scaling Matrix into the Asset Studio:
 * - 14-Tier scale category selector (Fine to Cosmic)
 * - Scaled combat damage dice ladder (stepping down submedium, multiplying large+)
 * - Scaled physical metrics (Structure Points / HP, carrying capacity, speed, range)
 * - Fluid combat opposed matchup simulator (attacker vs defender size checks)
 * - Heavy vehicle / Starship proximity damage & splash radius
 * - Meta-Tech & Invocation chassis scaling across host sizes
 * - One-click commitment to blueprint formData
 */
export const ScalingStudioWorkflow = ({
  matrix,
  formData = {},
  onChange,
  isEditMode = true,
  computedValues = {}
}) => {
  const isWeapon = matrix.id === 'weaponry';
  const isMechaOrShip = matrix.id === 'mecha';
  const isStructure = matrix.id === 'architecture';
  const isInvocation = ['invocation', 'meta-tech'].includes(matrix.id);
  const isSpeciesOrChar = ['species', 'modular-characters', 'archetypes'].includes(matrix.id);

  // 1. Current Asset Size Category
  const initialSizeKey = formData.size || formData.sizeCategory || formData.footprint || (isMechaOrShip ? 'Large' : 'Medium');
  const [selectedSizeKey, setSelectedSizeKey] = useState(initialSizeKey);
  const currentCategory = useMemo(() => getScalingCategory(selectedSizeKey), [selectedSizeKey]);

  // 2. Damage Dice Scaling
  const baseDamageNotation = formData.damage || (isWeapon ? '2d10' : (isInvocation ? '5d6' : '1d6'));
  const [baseDamage, setBaseDamage] = useState(baseDamageNotation);

  const scaledDamageDice = useMemo(() => {
    return scaleDamageDice(baseDamage, selectedSizeKey);
  }, [baseDamage, selectedSizeKey]);

  // 3. Scaled Structure Points (SP) & Capacity
  const baseSP = Number(formData.durability ?? formData.sp ?? formData.hp ?? 50) || 50;
  const scaledSP = useMemo(() => {
    return scaleStructurePoints(baseSP, selectedSizeKey);
  }, [baseSP, selectedSizeKey]);

  const scaledCapacity = useMemo(() => {
    return scaleCarryingCapacity(500, selectedSizeKey);
  }, [selectedSizeKey]);

  const scaledSpeed = useMemo(() => {
    const baseSpeed = Number(formData.speed ?? formData.tactical_speed ?? 30) || 30;
    return scaleMovementSpeed(baseSpeed, selectedSizeKey);
  }, [formData.speed, formData.tactical_speed, selectedSizeKey]);

  const scaledWeaponRange = useMemo(() => {
    const baseRange = Number(formData.range ?? formData.range_ft ?? 60) || 60;
    return scaleRange(baseRange, selectedSizeKey);
  }, [formData.range, formData.range_ft, selectedSizeKey]);

  // 4. Fluid Combat Opposed Matchup Simulator
  const [targetSizeKey, setTargetSizeKey] = useState('Medium');
  const combatMatchup = useMemo(() => {
    return calculateFluidCombatModifier(selectedSizeKey, targetSizeKey);
  }, [selectedSizeKey, targetSizeKey]);

  // 5. Starship / Heavy Chassis Proximity Damage
  const proximityResults = useMemo(() => {
    return calculateProximityDamage(selectedSizeKey, scaledDamageDice, currentCategory.strMod);
  }, [selectedSizeKey, scaledDamageDice, currentCategory.strMod]);

  // 6. Meta-Tech / Invocation Chassis Scaling
  const [invocBaseRange, setInvocBaseRange] = useState(Number(formData.range || 100) || 100);
  const [invocBaseArea, setInvocBaseArea] = useState(Number(formData.area || 20) || 20);
  const [invocBaseDC, setInvocBaseDC] = useState(Number(formData.dc || 15) || 15);

  const scaledInvocation = useMemo(() => {
    return scaleMetaTechInvocation({
      name: formData.name || 'Invocation',
      baseDamage,
      baseRange: invocBaseRange,
      baseArea: invocBaseArea,
      saveDC: invocBaseDC
    }, selectedSizeKey);
  }, [formData.name, baseDamage, invocBaseRange, invocBaseArea, invocBaseDC, selectedSizeKey]);

  // Active sub-tab inside scaling workflow
  const [activeTab, setActiveTab] = useState(
    isInvocation ? 'invocation' : 'matrix'
  );

  // Commit handler
  const handleApplyScaling = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    if (!onChange) return;
    onChange('size', currentCategory.name);
    onChange('sizeCategory', currentCategory.name);
    onChange('scale_multiplier', currentCategory.scaleMultiplier);
    onChange('str_mod', currentCategory.strMod);
    onChange('combat_mod', currentCategory.combatMod);

    if (isWeapon) {
      onChange('damage', scaledDamageDice);
      onChange('scaled_damage', scaledDamageDice);
    }
    if (isMechaOrShip || isStructure) {
      onChange('durability', scaledSP);
      onChange('sp', scaledSP);
    }
    if (isInvocation) {
      onChange('scaled_damage', scaledInvocation.scaledDamage);
      onChange('scaled_range', scaledInvocation.scaledRange);
      onChange('scaled_area', scaledInvocation.scaledArea);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans select-none animate-fade-in">
      {/* Scaling Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-950/80 border border-emerald-500/40 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shadow-md">
            <Maximize2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                BASTION Domain 6
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs font-mono text-slate-400">14-Tier Volumetric Scaling Matrix</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold font-mono uppercase text-white mt-0.5">
              {matrix.name} Size Class & Tactical Scaling
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isEditMode && (
            <button
              type="button"
              onClick={handleApplyScaling}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              title="Apply scaling metrics to blueprint"
            >
              <Sparkles size={13} />
              <span>Apply Scaling to Asset</span>
            </button>
          )}

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'matrix' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-emerald-200'
              }`}
            >
              Scale Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('combat')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'combat' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-emerald-200'
              }`}
            >
              Fluid Matchup
            </button>
            {isInvocation && (
              <button
                type="button"
                onClick={() => setActiveTab('invocation')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  activeTab === 'invocation' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-emerald-200'
                }`}
              >
                Chassis Amplification
              </button>
            )}
            {(currentCategory.isStarship || isMechaOrShip || isStructure) && (
              <button
                type="button"
                onClick={() => setActiveTab('proximity')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  activeTab === 'proximity' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-emerald-200'
                }`}
              >
                Proximity Blast
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── TAB 1: 14-TIER VOLUMETRIC SCALING MATRIX ── */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                Select Asset Volumetric Scale Category:
              </label>

              {/* 14-Tier Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 font-mono">
                {SIZE_CATEGORIES_LIST.map((cat) => {
                  const isSelected = cat.id === currentCategory.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedSizeKey(cat.id)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950 text-emerald-200 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{cat.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{cat.scaleDisplay}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Scale Category Card */}
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-emerald-300 uppercase">
                    {currentCategory.name} Scale Tier ({currentCategory.scaleDisplay})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    Multiplier: x{currentCategory.scaleMultiplier}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Footprint: {currentCategory.footprint} • Height: {currentCategory.height}
                </div>
              </div>

              {/* Live Physical & Tactical Modifiers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">STR Mod</span>
                  <span className="text-sm font-bold text-amber-400">
                    {currentCategory.strMod >= 0 ? `+${currentCategory.strMod}` : currentCategory.strMod}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Combat Mod</span>
                  <span className="text-sm font-bold text-blue-400">
                    {currentCategory.combatMod >= 0 ? `+${currentCategory.combatMod}` : currentCategory.combatMod}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Melee Reach</span>
                  <span className="text-sm font-bold text-slate-200">{currentCategory.reach}</span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Mass / Weight</span>
                  <span className="text-sm font-bold text-slate-200 truncate">{currentCategory.weight}</span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Scaled Durability (SP)</span>
                  <span className="text-sm font-bold text-emerald-400">{scaledSP} SP</span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Carrying Capacity</span>
                  <span className="text-sm font-bold text-cyan-300">{scaledCapacity.toLocaleString()} lbs</span>
                </div>
              </div>

              {/* Damage Stepper Section */}
              <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-2 mt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                    <Crosshair size={13} />
                    <span>Combat Damage Dice Ladder Stepping</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Die Ladder: d10 → d8 → d6 → d4 → d3 → d2 → 1 pt min
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="text-[11px] text-slate-400 uppercase block mb-1">Base Medium Damage:</label>
                    <input
                      type="text"
                      value={baseDamage}
                      onChange={(e) => setBaseDamage(e.target.value)}
                      placeholder="E.g., 2d10, 1d8+2, 5d6"
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">Scaled Damage Output</span>
                    <span className="text-base font-extrabold text-amber-400 font-mono">
                      {scaledDamageDice}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {currentCategory.scaleMultiplier > 1 ? `Multiplied x${currentCategory.scaleMultiplier}` : `Stepped down ${Math.abs(currentCategory.dieStep)} steps`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: FLUID COMBAT MATCHUP SIMULATOR ── */}
      {activeTab === 'combat' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4 font-mono text-xs">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-1.5">
              <Crosshair size={14} />
              <span>Fluid Combat Opposed Matchup Adjudicator (Domain 6.2)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Calculates relative size attack modifiers. Large entities suffer attack penalties against agile small targets, while small snipers gain massive bonuses targeting colossal frames.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-300 font-bold uppercase block">This Asset (Attacker / Defender):</span>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-emerald-500/40 text-emerald-300 font-extrabold text-sm">
                {currentCategory.name} Scale ({currentCategory.scaleDisplay})
              </div>
              <span className="text-[10px] text-slate-500">Fixed to active asset scale</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-300 font-bold uppercase block">Opposing Entity Scale Category:</span>
              <select
                value={targetSizeKey}
                onChange={(e) => setTargetSizeKey(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400 font-bold"
              >
                {SIZE_CATEGORIES_LIST.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.scaleDisplay}) — Combat Mod: {cat.combatMod >= 0 ? `+${cat.combatMod}` : cat.combatMod}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500">Pick adversary size to evaluate fluid roll</span>
            </div>
          </div>

          {/* Opposed Check Result Banner */}
          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <span>Opposed Tactical Attack Modifier:</span>
                <span className="text-lg text-amber-400 font-extrabold">
                  {combatMatchup.modifier >= 0 ? `+${combatMatchup.modifier}` : combatMatchup.modifier}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {combatMatchup.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: META-TECH / INVOCATION CHASSIS SCALING ── */}
      {activeTab === 'invocation' && isInvocation && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4 font-mono text-xs">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-purple-300 flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Chassis Invocation Parameter Amplification</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              When an Invocation or Meta-Tech matrix is installed in a host chassis (e.g., Mecha, Starship, Defense Emplacement), damage, range, and blast area scale by the host's Scale Multiplier while preserving Save DCs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <label className="text-[10px] text-slate-400 uppercase">Base Range (ft)</label>
              <input
                type="number"
                value={invocBaseRange}
                onChange={(e) => setInvocBaseRange(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
              />
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <label className="text-[10px] text-slate-400 uppercase">Base AoE Radius (ft)</label>
              <input
                type="number"
                value={invocBaseArea}
                onChange={(e) => setInvocBaseArea(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
              />
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <label className="text-[10px] text-slate-400 uppercase">Base Save DC</label>
              <input
                type="number"
                value={invocBaseDC}
                onChange={(e) => setInvocBaseDC(parseInt(e.target.value) || 15)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-purple-500/40 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Amplified Damage</span>
                <span className="text-base font-extrabold text-amber-400">{scaledInvocation.scaledDamage}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Amplified Range</span>
                <span className="text-base font-extrabold text-cyan-300">{scaledInvocation.scaledRange}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Amplified Blast Radius</span>
                <span className="text-base font-extrabold text-purple-300">{scaledInvocation.scaledArea}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Save DC (Preserved)</span>
                <span className="text-base font-extrabold text-emerald-300">DC {scaledInvocation.saveDC}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-sans pt-2 border-t border-slate-800">
              {scaledInvocation.summary}
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 4: STARSHIP & PROXIMITY OVERBLAST ── */}
      {activeTab === 'proximity' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4 font-mono text-xs">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-red-300 flex items-center gap-1.5">
              <Flame size={14} />
              <span>Heavy Asset Proximity Blast & Overblast (Domain 6.4)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Capital ships and heavy siege engines deal 1/10th indirect damage across a splash radius equal to STR Mod / 2 in feet.
            </p>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-red-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-red-300 uppercase">Splash Radius</span>
              <span className="text-base font-extrabold text-amber-400">{proximityResults.splashRadiusFt} ft radius</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-red-300 uppercase">Indirect Damage Ratio</span>
              <span className="text-base font-extrabold text-slate-200">10% (1/10th direct damage)</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {proximityResults.overblastDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ScalingStudioWorkflow);
