import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Check, 
  AlertTriangle, 
  Shield, 
  Layers, 
  Clock, 
  Users, 
  Hammer, 
  Globe, 
  Sparkles, 
  Activity, 
  HardHat,
  Compass,
  Zap,
  Crosshair,
  Truck,
  TrendingUp,
  Coins,
  ChevronRight,
  Info,
  Sliders,
  Maximize2,
  Lock,
  RefreshCw,
  Box
} from 'lucide-react';
import { 
  ARCHITECTURE_FOOTPRINTS,
  HEIGHT_CLASSES,
  ARCHITECTURE_FRAME_TYPES,
  ARCHITECTURE_MATERIALS,
  ENVIRONMENTAL_MODIFIERS,
  ARCHITECTURE_HARDPOINTS_ARMOR,
  ARCHITECTURE_HARDPOINTS_WEAPONS,
  ARCHITECTURE_HARDPOINTS_SENSORS,
  ARCHITECTURE_FACILITIES,
  ARCHITECTURE_CORE_INTERNALS,
  ARCHITECTURE_PROPULSION,
  FACTION_ARCHITECTURAL_PARADIGMS,
  MECHA_GARAGING_RULES,
  TOOL_TIERS
} from '../../../engines/tangentConstants';
import { 
  calculateArchitectureSP, 
  calculateArchitectureModules, 
  calculateArchitectureMounts,
  calculateArchitectureDC, 
  calculateCooperativeConstructionDays,
  calculateArchitectureCombatMetrics,
  validateArchitectureBlueprint
} from '../../../engines/tangentComplexEngines';
import { 
  calculateCreditValue, 
  calculateMaterialCost,
  calculateLiquidityGap,
  getFinancialStatus,
  getComplexityTier
} from '../../../engines/tangentEconEngine';

export const ArchitectureBlueprintConfigurator = ({
  formData = {},
  onChange = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('Foundation');
  const [buyerWS, setBuyerWS] = useState(15);
  const [selectedMechaScale, setSelectedMechaScale] = useState('Medium');
  const [mechaCount, setMechaCount] = useState(4);

  // Form Field Extractions with sensible defaults
  const footprint = formData.footprint || formData.scale || 'Large';
  const heightClass = formData.height_class || 'Single';
  const frame = formData.frame_type || formData.frame || 'Standard';
  const tl = Number(formData.tl ?? 3);
  const ml = Number(formData.ml ?? 0);
  const environment = formData.environment || 'Standard';
  const factionSkin = formData.faction_skin || 'Coalition';
  const stories = formData.stories !== undefined ? Number(formData.stories) : (HEIGHT_CLASSES[heightClass]?.stories ?? 1);
  const isMobile = !!formData.is_mobile;
  const propulsion = formData.propulsion_type || formData.propulsion || 'ground_crawler';
  const uduCompression = formData.udu_compression || null;
  const isRare = !!formData.is_rare;
  const mastercraftBonus = Number(formData.mastercraft_bonus || 0);
  const bulwarkBonus = Number(formData.bulwark_bonus || 0);

  // Installed collections
  const specializedModules = Array.isArray(formData.specialized_modules) ? formData.specialized_modules : [];
  const armorPlating = Array.isArray(formData.armor_plating) ? formData.armor_plating : [];
  const energyShields = Array.isArray(formData.energy_shields) ? formData.energy_shields : [];
  const structuralWeapons = Array.isArray(formData.structural_weapons) ? formData.structural_weapons : [];
  const sensorsAndAux = Array.isArray(formData.sensors_and_aux) ? formData.sensors_and_aux : [];
  const generators = Array.isArray(formData.generators) ? formData.generators : [];

  // Workforce
  const workers = Number(formData.workforce_workers || 10);
  const workerSkill = Number(formData.workforce_skill || 15);
  const toolTier = formData.tool_tier || 'industrial';

  // Definitions
  const footprintDef = ARCHITECTURE_FOOTPRINTS[footprint] || ARCHITECTURE_FOOTPRINTS.Large;
  const heightDef = HEIGHT_CLASSES[heightClass] || HEIGHT_CLASSES.Single;
  const frameDef = ARCHITECTURE_FRAME_TYPES[frame] || ARCHITECTURE_FRAME_TYPES.Standard;
  const matDef = ARCHITECTURE_MATERIALS[tl] || ARCHITECTURE_MATERIALS[3];
  const envDef = ENVIRONMENTAL_MODIFIERS[environment] || ENVIRONMENTAL_MODIFIERS.Standard;
  const factionDef = FACTION_ARCHITECTURAL_PARADIGMS[factionSkin] || FACTION_ARCHITECTURAL_PARADIGMS.Coalition;

  // Pure calculations from engines
  const totalSP = useMemo(() => calculateArchitectureSP({
    footprint,
    heightClass,
    customStories: stories,
    tl,
    frame,
    bulwarkBonus
  }), [footprint, heightClass, stories, tl, frame, bulwarkBonus]);

  const moduleCalc = useMemo(() => calculateArchitectureModules({
    footprint,
    heightClass,
    customStories: stories,
    frame,
    isMobile,
    mastercraftBonus
  }), [footprint, heightClass, stories, frame, isMobile, mastercraftBonus]);

  const totalModules = moduleCalc.totalModules;

  // Compute used modules from facilities
  const usedModules = useMemo(() => {
    let sum = 0;
    for (const mod of specializedModules) {
      const modId = typeof mod === 'string' ? mod : mod.id;
      const count = typeof mod === 'object' && mod.count ? Number(mod.count) : 1;
      const modDef = ARCHITECTURE_FACILITIES.find(m => m.id === modId || m.name === modId);
      if (modDef) {
        sum += modDef.modules * count;
      }
    }
    return Number(sum.toFixed(3));
  }, [specializedModules]);

  const remainingModules = Number((totalModules - usedModules).toFixed(3));

  // Mounts calculation (UDU 10:1 conversion)
  const mountCalc = useMemo(() => calculateArchitectureMounts({
    footprint,
    totalModules,
    usedModules,
    armorPlating,
    energyShields,
    structuralWeapons,
    sensorsAndAux
  }), [footprint, totalModules, usedModules, armorPlating, energyShields, structuralWeapons, sensorsAndAux]);

  // Craft DC calculation with Highest Complexity Rule
  const dcResult = useMemo(() => calculateArchitectureDC({
    footprint,
    heightClass,
    customStories: stories,
    frame,
    tl,
    environment,
    specializedModules,
    armorPlating,
    energyShields,
    structuralWeapons,
    sensorsAndAux,
    propulsion: isMobile ? propulsion : null,
    generators,
    uduCompression,
    isRare,
    baseDC: formData.base_dc
  }), [footprint, heightClass, stories, frame, tl, environment, specializedModules, armorPlating, energyShields, structuralWeapons, sensorsAndAux, isMobile, propulsion, generators, uduCompression, isRare, formData.base_dc]);

  const finalDC = dcResult.finalDC;

  // Credit Value and 50% Material Cost
  let costMult = envDef.costMult || 1.0;
  if (environment === 'VacuumToxic' && tl >= 3) costMult = 1.0;
  const baseCreditValue = calculateCreditValue(finalDC);
  const creditValue = Math.round(baseCreditValue * costMult);
  const materialCost = calculateMaterialCost(creditValue);

  // Cooperative Workforce Timeline
  const coopTimeline = useMemo(() => calculateCooperativeConstructionDays({
    creditValue,
    workforceWorkers: workers,
    avgSkillCheck: workerSkill,
    toolTier
  }), [creditValue, workers, workerSkill, toolTier]);

  // Combat & Integrity metrics
  const combatMetrics = useMemo(() => calculateArchitectureCombatMetrics({
    totalSP,
    baseSP: footprintDef.baseSP,
    tl,
    armorPlating,
    creditValue
  }), [totalSP, footprintDef.baseSP, tl, armorPlating, creditValue]);

  // Validation
  const validation = useMemo(() => validateArchitectureBlueprint(formData), [formData]);

  // Liquidity Gap
  const liquidityGap = useMemo(() => calculateLiquidityGap(buyerWS, finalDC), [buyerWS, finalDC]);

  // Mecha Garaging calculation helper
  const garagingReq = useMemo(() => {
    const rule = MECHA_GARAGING_RULES[selectedMechaScale] || MECHA_GARAGING_RULES.Medium;
    const requiredModules = Number((rule.modulesPerUnit * mechaCount).toFixed(3));
    return {
      rule,
      requiredModules,
      canFit: requiredModules <= remainingModules
    };
  }, [selectedMechaScale, mechaCount, remainingModules]);

  // Handlers for toggles
  const handleToggleItem = (arrayField, itemId) => {
    const currentList = Array.isArray(formData[arrayField]) ? formData[arrayField] : [];
    const isSelected = currentList.some(item => (typeof item === 'string' ? item : item.id) === itemId);
    if (isSelected) {
      onChange(arrayField, currentList.filter(item => (typeof item === 'string' ? item !== itemId : item.id !== itemId)));
    } else {
      onChange(arrayField, [...currentList, itemId]);
    }
  };

  const isItemSelected = (arrayField, itemId) => {
    const currentList = Array.isArray(formData[arrayField]) ? formData[arrayField] : [];
    return currentList.some(item => (typeof item === 'string' ? item : item.id) === itemId);
  };

  const tabs = [
    { id: 'Foundation', label: 'Chassis & Frame', icon: Building2 },
    { id: 'UDU', label: 'UDU & Mounts (10:1)', icon: Layers },
    { id: 'Facilities', label: 'Facilities Catalog', icon: Box },
    { id: 'Defenses', label: 'Hardpoints & Defenses', icon: Shield },
    { id: 'Mobility', label: 'Mobility & VFT', icon: Truck },
    { id: 'Labor', label: 'Workforce & TSC', icon: Coins },
    { id: 'Combat', label: 'Integrity & Combat', icon: Activity }
  ];

  return (
    <div className="space-y-4 p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl font-mono text-xs text-slate-200 shadow-2xl backdrop-blur-md">
      {/* ── Top Header Metrics & Highest Complexity Banner ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Building2 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                99 — Architectural Forge
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[10px] text-slate-400 uppercase">{footprintDef.name} ({stories} Story)</span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {formData.name || 'Unnamed Structural Chassis'}
            </h3>
          </div>
        </div>

        {/* Live Metrics Header Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-emerald-300 font-bold flex items-center gap-1.5 shadow-inner">
            <Shield size={12} className="text-emerald-400" />
            <span>{totalSP.toLocaleString()} SP (DR {combatMetrics.total_dr})</span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 shadow-inner ${
            usedModules > totalModules 
              ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse' 
              : 'bg-slate-900 border-slate-700/80 text-amber-300'
          }`}>
            <Layers size={12} className="text-amber-400" />
            <span>{usedModules} / {totalModules} Modules</span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 shadow-inner ${
            mountCalc.isOverBudget
              ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
              : 'bg-slate-900 border-slate-700/80 text-cyan-300'
          }`}>
            <Crosshair size={12} className="text-cyan-400" />
            <span>{mountCalc.usedMounts} / {mountCalc.totalMounts} Mounts</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 font-extrabold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Coins size={12} className="text-amber-400" />
            <span>DC {finalDC} • {creditValue.toLocaleString()} Cr</span>
          </div>
        </div>
      </div>

      {/* Highest Complexity Rule Notice */}
      {dcResult.highestRuleApplied && (
        <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/50 text-purple-200 text-xs flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={14} className="text-purple-400 shrink-0" />
            <span className="truncate">
              <strong>Highest Complexity Rule Active:</strong> Base DC raised to <strong>DC {dcResult.highestComponentDC}</strong> by <em>{dcResult.highestComponentSource}</em>.
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/80 text-purple-300 font-bold border border-purple-400/40 shrink-0">
            Auto-Scaled
          </span>
        </div>
      )}

      {/* Validation Warnings / Overrun Alerts */}
      {(!validation.valid || validation.warnings.length > 0) && (
        <div className="space-y-1.5">
          {validation.errors.map((err, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 text-[11px] flex items-center gap-2">
              <AlertTriangle size={13} className="shrink-0 text-red-400" />
              <span>{err}</span>
            </div>
          ))}
          {validation.warnings.map((warn, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 text-[11px] flex items-center gap-2">
              <Info size={13} className="shrink-0 text-amber-400" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon size={13} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: FOUNDATION & CHASSIS ── */}
      {activeTab === 'Foundation' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Scale & Footprint */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="block text-[10px] uppercase font-bold text-amber-400">
                1. Footprint & Scale (Size Category)
              </label>
              <select
                value={footprint}
                onChange={(e) => onChange('footprint', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {Object.keys(ARCHITECTURE_FOOTPRINTS).map(k => (
                  <option key={k} value={k}>
                    {ARCHITECTURE_FOOTPRINTS[k].name} ({ARCHITECTURE_FOOTPRINTS[k].dimensions} • {ARCHITECTURE_FOOTPRINTS[k].baseModules} Mod • DC {ARCHITECTURE_FOOTPRINTS[k].baseDC})
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800">
                <div>Dimensions: <strong className="text-white">{footprintDef.dimensions}</strong> ({footprintDef.sqFt.toLocaleString()} sq ft)</div>
                <div>Ground Base SP: <strong className="text-emerald-300">{footprintDef.baseSP} SP</strong> • Scale Mult: <strong className="text-cyan-300">x{footprintDef.scaleMod}</strong></div>
              </div>
            </div>

            {/* Verticality & Stories */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="block text-[10px] uppercase font-bold text-amber-400">
                2. Verticality (Height Class & Stories)
              </label>
              <select
                value={heightClass}
                onChange={(e) => {
                  const newClass = e.target.value;
                  onChange('height_class', newClass);
                  onChange('stories', HEIGHT_CLASSES[newClass]?.stories || 1);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {Object.keys(HEIGHT_CLASSES).map(k => (
                  <option key={k} value={k}>
                    {HEIGHT_CLASSES[k].label} (+{HEIGHT_CLASSES[k].craftMod} DC)
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Exact Stories:</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={stories}
                  onChange={(e) => onChange('stories', Math.max(1, Number(e.target.value)))}
                  className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-right text-white font-bold"
                />
              </div>
            </div>

            {/* Frame Configuration */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="block text-[10px] uppercase font-bold text-amber-400">
                3. Frame Type & Structural Form
              </label>
              <select
                value={frame}
                onChange={(e) => onChange('frame_type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {Object.keys(ARCHITECTURE_FRAME_TYPES).map(k => (
                  <option key={k} value={k}>
                    {ARCHITECTURE_FRAME_TYPES[k].name} ({ARCHITECTURE_FRAME_TYPES[k].dcMod >= 0 ? `+${ARCHITECTURE_FRAME_TYPES[k].dcMod}` : ARCHITECTURE_FRAME_TYPES[k].dcMod} DC)
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 leading-tight">
                {frameDef.description}
              </p>
            </div>

            {/* Tech Level & Materials */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="block text-[10px] uppercase font-bold text-amber-400">
                4. Tech Level & Materials Sub-Strata
              </label>
              <select
                value={tl}
                onChange={(e) => onChange('tl', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {Object.keys(ARCHITECTURE_MATERIALS).map(k => (
                  <option key={k} value={k}>
                    {ARCHITECTURE_MATERIALS[k].name} (DR {ARCHITECTURE_MATERIALS[k].dr})
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <span className="text-emerald-300 font-bold">DR {matDef.dr}</span> • <span className="text-cyan-300 font-bold">x{matDef.spMult} SP</span> • <span>{matDef.passive}</span>
              </div>
            </div>

            {/* Environmental Conditions */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="block text-[10px] uppercase font-bold text-amber-400">
                5. Planetary & Environmental Conditions
              </label>
              <select
                value={environment}
                onChange={(e) => onChange('environment', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {Object.keys(ENVIRONMENTAL_MODIFIERS).map(k => (
                  <option key={k} value={k}>
                    {ENVIRONMENTAL_MODIFIERS[k].name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 leading-tight">
                {envDef.description}
              </p>
            </div>

            {/* Cultural Skin / Faction Paradigm */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="block text-[10px] uppercase font-bold text-amber-400">
                6. Cultural Skin (Faction Paradigm)
              </label>
              <select
                value={factionSkin}
                onChange={(e) => onChange('faction_skin', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {Object.keys(FACTION_ARCHITECTURAL_PARADIGMS).map(k => (
                  <option key={k} value={k}>
                    {FACTION_ARCHITECTURAL_PARADIGMS[k].name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-amber-300/90 pt-1 border-t border-slate-800 leading-tight">
                {factionDef.bonusTrait}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: UDU & MOUNT BUDGETS (10:1 RULE) ── */}
      {activeTab === 'UDU' && (
        <div className="space-y-4 animate-fade-in">
          {/* UDU 10:1 Visual Allocation Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-amber-400" />
                  <span>The Universal Scale: 10:1 Integration Rule</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  1 Module = 10 Usable Mounts = 100 Sockets. Dedicate Modules to rooms, or partition unspent volume into Mounts for defenses.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase">Usable Module Pool</span>
                <div className="text-sm font-extrabold text-amber-300">
                  {remainingModules} / {totalModules} Modules Left
                </div>
              </div>
            </div>

            {/* Progress Bar Meter */}
            <div className="space-y-1">
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, totalModules > 0 ? (usedModules / totalModules) * 100 : 0)}%` }}
                  title={`Facilities: ${usedModules} Modules`}
                />
                <div 
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, mountCalc.totalMounts > 0 ? (mountCalc.usedMounts / mountCalc.totalMounts) * ((remainingModules / (totalModules || 1)) * 100) : 0)}%` }}
                  title={`Mounts: ${mountCalc.usedMounts} / ${mountCalc.totalMounts} Mounts`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/> Facilities: {usedModules} Modules</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block"/> Defense Mounts: {mountCalc.usedMounts} / {mountCalc.totalMounts}</span>
                <span className="text-emerald-400">Available: {remainingModules} Modules ({Number((remainingModules * 10).toFixed(2))} Mounts)</span>
              </div>
            </div>
          </div>

          {/* Mastercrafting & UDU Compression Modifiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="block text-[10px] uppercase font-bold text-amber-400">
                Mastercrafting Bonus Capacity (+1 UDU per 5 over DC)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max={tl}
                  value={mastercraftBonus}
                  onChange={(e) => onChange('mastercraft_bonus', Number(e.target.value))}
                  className="w-24 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
                <span className="text-[10px] text-slate-400">
                  Adds bonus Modules (max +{tl} for TL{tl}).
                </span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="block text-[10px] uppercase font-bold text-amber-400">
                Spatial Engineering (UDU Compression)
              </label>
              <select
                value={uduCompression || 'None'}
                onChange={(e) => onChange('udu_compression', e.target.value === 'None' ? null : e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-500"
              >
                <option value="None">None (Standard Physical Volume)</option>
                <option value="Efficient">Efficient Design (-25% UDU Capacity cost, +5 DC)</option>
                <option value="Miniaturized">Miniaturized (-50% UDU Capacity cost, TL+1, +10 DC)</option>
                <option value="Integrated">Integrated (0 UDU Capacity, Permanent Chassis Fuse, +5 DC)</option>
              </select>
            </div>
          </div>

          {/* Mecha Garaging Simulator */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={14} />
                <span>Mecha & Vehicle Garaging Calculator</span>
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                garagingReq.canFit ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-red-950 text-red-300 border border-red-500/40'
              }`}>
                {garagingReq.canFit ? 'Sufficient Capacity' : 'Insufficient Modules'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase">Mecha Scale</label>
                <select
                  value={selectedMechaScale}
                  onChange={(e) => setSelectedMechaScale(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white mt-1"
                >
                  {Object.keys(MECHA_GARAGING_RULES).map(k => (
                    <option key={k} value={k}>
                      {k} ({MECHA_GARAGING_RULES[k].scale})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase">Unit Count</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={mechaCount}
                  onChange={(e) => setMechaCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white mt-1"
                />
              </div>

              <div className="flex flex-col justify-end">
                <span className="text-[10px] text-slate-400">Required Modules:</span>
                <span className="text-sm font-bold text-cyan-300">
                  {garagingReq.requiredModules} Modules ({garagingReq.rule.unitsPerModule} units / mod)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: FACILITIES CATALOG (MODULES) ── */}
      {activeTab === 'Facilities' && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-[11px] text-slate-400">
            Select rooms and major facilities to install. Standard facilities are absorbed by the Footprint DC. High-complexity facilities trigger the <strong>Highest Complexity Rule</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
            {ARCHITECTURE_FACILITIES.map(fac => {
              const selected = isItemSelected('specialized_modules', fac.id);
              return (
                <div
                  key={fac.id}
                  onClick={() => handleToggleItem('specialized_modules', fac.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    selected 
                      ? 'bg-amber-950/60 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-white' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/80'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <span className="font-bold text-xs">{fac.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold shrink-0">
                        DC {fac.dc} • {fac.modules} Mod
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-tight block mb-1">
                      {fac.category} • TL{fac.tl}
                    </span>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {fac.function}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                    <span className={selected ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                      {selected ? 'Installed' : 'Click to Install'}
                    </span>
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                      selected ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700'
                    }`}>
                      {selected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: DEFENSES & HARDPOINTS (MOUNTS) ── */}
      {activeTab === 'Defenses' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between bg-slate-900/70 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Hardpoint Mount Budget (Scale x{footprintDef.scaleMod})</span>
              <div className="text-xs font-bold text-cyan-300">
                {mountCalc.usedMounts} / {mountCalc.totalMounts} Mounts Allocated
              </div>
            </div>
            {mountCalc.isOverBudget && (
              <span className="text-[10px] px-2 py-1 rounded bg-red-950 text-red-300 border border-red-500 font-bold">
                Over Mount Budget!
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Armor & Energy Shields */}
            <div>
              <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Shield size={13} />
                <span>Physical Plating & Energy Shield Emitters</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {ARCHITECTURE_HARDPOINTS_ARMOR.map(arm => {
                  const isPlating = arm.category === 'Physical Plating';
                  const fieldKey = isPlating ? 'armor_plating' : 'energy_shields';
                  const selected = isItemSelected(fieldKey, arm.id);
                  const scaledMountCost = Number((arm.mountBaseMult * (footprintDef.scaleMod || 1.0)).toFixed(2));

                  return (
                    <div
                      key={arm.id}
                      onClick={() => handleToggleItem(fieldKey, arm.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selected 
                          ? 'bg-cyan-950/60 border-cyan-500 text-white' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-[11px]">{arm.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                          DC {arm.dc}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <div>Effect: <strong className="text-emerald-300">{arm.effect}</strong></div>
                        <div>Mount Cost: <strong className="text-cyan-300">{scaledMountCost} Mounts</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Structural Weapon Emplacements */}
            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Crosshair size={13} />
                <span>Structural Weaponry & Base Defenses</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {ARCHITECTURE_HARDPOINTS_WEAPONS.map(wpn => {
                  const selected = isItemSelected('structural_weapons', wpn.id);
                  return (
                    <div
                      key={wpn.id}
                      onClick={() => handleToggleItem('structural_weapons', wpn.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selected 
                          ? 'bg-amber-950/60 border-amber-500 text-white' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-[11px]">{wpn.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                          DC {wpn.dc} • {wpn.mounts} Mnt
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <div>Damage: <strong className="text-red-300">{wpn.baseDamage} ({wpn.damageType})</strong></div>
                        <div>Range: <strong className="text-white">{wpn.baseRange}</strong> • {wpn.notes}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sensors & Aux Arrays */}
            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Compass size={13} />
                <span>Sensors & Auxiliary Arrays</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {ARCHITECTURE_HARDPOINTS_SENSORS.map(sens => {
                  const selected = isItemSelected('sensors_and_aux', sens.id);
                  return (
                    <div
                      key={sens.id}
                      onClick={() => handleToggleItem('sensors_and_aux', sens.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selected 
                          ? 'bg-cyan-950/60 border-cyan-500 text-white' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-[11px]">{sens.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                          DC {sens.dc} • {sens.mounts} Mnt
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {sens.function}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: MOBILITY & VARIABLE FORM (VFT) ── */}
      {activeTab === 'Mobility' && (
        <div className="space-y-4 animate-fade-in">
          {/* Mobile Platform Switch */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Mobile Platform Configuration (20% Chassis Tax)
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Converts static building into a mobile fortress or crawler. Automatically dedicates 20% of Module capacity to propulsion.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isMobile}
                onChange={(e) => onChange('is_mobile', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {isMobile && (
            <div className="space-y-3 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Propulsion Engine Selection (Highest Complexity Rule Applied)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {ARCHITECTURE_PROPULSION.map(p => {
                  const isSelected = propulsion === p.id;
                  const scaledSpeed = Math.round(p.baseSpeed * (footprintDef.scaleMod || 1.0));

                  return (
                    <div
                      key={p.id}
                      onClick={() => onChange('propulsion_type', p.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-amber-950/70 border-amber-500 text-white shadow-md' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-bold text-xs">{p.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                            DC {p.dc}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 space-y-0.5">
                          <div>Tactical Speed: <strong className="text-cyan-300">{scaledSpeed} ft/rnd</strong></div>
                          <div>Handling: <strong className="text-white">{p.handling}</strong></div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 mt-2">
                        {p.notes}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 6: WORKFORCE & TSC ECONOMICS ── */}
      {activeTab === 'Labor' && (
        <div className="space-y-4 animate-fade-in">
          {/* Tangent Standard Curve (TSC) Summary */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">TSC Market Value</span>
              <div className="text-lg font-extrabold text-amber-300 mt-0.5">
                {creditValue.toLocaleString()} <span className="text-xs text-amber-500 font-normal">Cr</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Raw Material Cost (50%)</span>
              <div className="text-lg font-extrabold text-emerald-300 mt-0.5">
                {materialCost.toLocaleString()} <span className="text-xs text-emerald-500 font-normal">Cr</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Required Wealth Score</span>
              <div className="text-lg font-extrabold text-cyan-300 mt-0.5">
                WS {finalDC}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Complexity Tier</span>
              <div className="text-lg font-extrabold text-purple-300 mt-0.5">
                {getComplexityTier(finalDC)}
              </div>
            </div>
          </div>

          {/* Liquidity Gap Calculator */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} />
              <span>Liquidity Constraint & Gap Analysis</span>
            </h4>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase">Buyer Wealth Score:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={buyerWS}
                  onChange={(e) => setBuyerWS(Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold"
                />
              </div>
              <div className="text-xs font-mono">
                {liquidityGap.autoBuy ? (
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/40">
                    ✓ Full Auto-Buy (0 Liquid Credits Needed)
                  </span>
                ) : (
                  <span className="text-amber-300 font-bold bg-amber-950/80 px-2 py-1 rounded border border-amber-500/40">
                    Required Liquid Cash: {liquidityGap.liquidCost.toLocaleString()} Cr
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Workforce Productivity Engine (PP) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-cyan-400" />
              <span>Workforce Productivity Engine (Cooperative Build Time)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase">Labor Pool Size (Crew)</label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={workers}
                  onChange={(e) => onChange('workforce_workers', Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-bold mt-1"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase">Average Craft Check</label>
                <input
                  type="number"
                  min="11"
                  max="50"
                  value={workerSkill}
                  onChange={(e) => onChange('workforce_skill', Math.max(11, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-bold mt-1"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase">Tool Tier Multiplier</label>
                <select
                  value={toolTier}
                  onChange={(e) => onChange('tool_tier', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-bold mt-1"
                >
                  {TOOL_TIERS.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (x{t.multiplier})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Daily Productivity (PP)</span>
                <div className="text-sm font-bold text-cyan-300">
                  {coopTimeline.totalDailyPP.toLocaleString()} PP / Day
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase">Projected Build Time</span>
                <div className="text-sm font-bold text-amber-300">
                  {coopTimeline.formattedTimeline}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: INTEGRITY & COMBAT METRICS ── */}
      {activeTab === 'Combat' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase">Total Structure Points</span>
              <div className="text-lg font-bold text-emerald-300 mt-0.5">
                {combatMetrics.total_sp.toLocaleString()} SP
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Catastrophic collapse occurs if reduced to 0 SP.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase">Damage Resistance (DR)</span>
              <div className="text-lg font-bold text-cyan-300 mt-0.5">
                DR {combatMetrics.total_dr}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Base DR {matDef.dr} ({matDef.name}) + Armor Plating.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase">10x10 Section Breach Threshold</span>
              <div className="text-lg font-bold text-amber-300 mt-0.5">
                {combatMetrics.section_integrity} SP
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Damage &gt; Section SP creates a hole for Medium units.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase">Annual Upkeep (2%)</span>
              <div className="text-lg font-bold text-purple-300 mt-0.5">
                {combatMetrics.annual_upkeep.toLocaleString()} Cr / yr
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Non-payment causes Dilapidated status (-5 DR, -10% SP).
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase">Field Repair Check</span>
              <div className="text-lg font-bold text-white mt-0.5">
                DC 15 (Engineering)
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Restores {combatMetrics.field_repair_rate}.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase">Field Repair Material Cost</span>
              <div className="text-lg font-bold text-amber-400 mt-0.5">
                {combatMetrics.field_repair_material_cost.toLocaleString()} Cr
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                10% of total structure value in materials.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureBlueprintConfigurator;
