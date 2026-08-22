import React, { useState } from 'react';
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
  Compass
} from 'lucide-react';
import { 
  ARCHITECTURE_FOOTPRINTS,
  HEIGHT_CLASSES,
  ARCHITECTURE_MATERIALS,
  ENVIRONMENTAL_MODIFIERS,
  SPECIALIZED_MODULE_CATALOG,
  TOOL_TIERS
} from '../../../engines/tangentConstants';
import { 
  calculateArchitectureSP, 
  calculateArchitectureModules, 
  calculateArchitectureDC, 
  calculateCooperativeConstructionDays 
} from '../../../engines/tangentComplexEngines';
import { calculateCreditValue } from '../../../engines/tangentEconEngine';

export const ArchitectureBlueprintConfigurator = ({
  formData = {},
  onChange = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('Footprint');

  const footprint = formData.footprint || formData.scale || 'Large';
  const heightClass = formData.height_class || 'Single';
  const tl = Number(formData.tl ?? 3);
  const environment = formData.environment || 'Standard';
  const specializedModules = Array.isArray(formData.specialized_modules) ? formData.specialized_modules : [];
  const stories = formData.stories !== undefined ? Number(formData.stories) : (HEIGHT_CLASSES[heightClass]?.stories ?? 1);
  const workers = Number(formData.workforce_workers || 10);
  const workerSkill = Number(formData.workforce_skill || 15);
  const toolTier = formData.tool_tier || 'industrial';

  const footprintDef = ARCHITECTURE_FOOTPRINTS[footprint] || ARCHITECTURE_FOOTPRINTS.Large;
  const heightDef = HEIGHT_CLASSES[heightClass] || HEIGHT_CLASSES.Single;
  const matDef = ARCHITECTURE_MATERIALS[tl] || ARCHITECTURE_MATERIALS[3];
  const envDef = ENVIRONMENTAL_MODIFIERS[environment] || ENVIRONMENTAL_MODIFIERS.Standard;

  const totalSP = calculateArchitectureSP({
    footprint,
    heightClass,
    customStories: stories,
    tl,
    bulwarkBonus: formData.bulwark_bonus || 0
  });

  const totalModules = calculateArchitectureModules({
    footprint,
    heightClass,
    customStories: stories,
    mastercraftBonus: formData.mastercraft_bonus || 0
  });

  let usedModules = 0;
  for (const mod of specializedModules) {
    const modId = typeof mod === 'string' ? mod : mod.id;
    const count = typeof mod === 'object' && mod.count ? Number(mod.count) : 1;
    const modDef = SPECIALIZED_MODULE_CATALOG.find(m => m.id === modId || m.name === modId);
    if (modDef) {
      usedModules += modDef.modules * count;
    }
  }

  const finalDC = calculateArchitectureDC({
    footprint,
    heightClass,
    customStories: stories,
    tl,
    environment,
    specializedModules,
    uduCompression: formData.udu_compression,
    isRare: !!formData.is_rare,
    baseDC: formData.base_dc
  });

  const creditValue = Math.round(calculateCreditValue(finalDC) * (envDef.costMult || 1.0));

  const coopTimeline = calculateCooperativeConstructionDays({
    creditValue,
    workforceWorkers: workers,
    avgSkillCheck: workerSkill,
    toolTier
  });

  const isModuleSelected = (modId) => specializedModules.some(m => (typeof m === 'string' ? m : m.id) === modId);

  const handleToggleModule = (modId) => {
    if (isModuleSelected(modId)) {
      onChange('specialized_modules', specializedModules.filter(m => (typeof m === 'string' ? m !== modId : m.id !== modId)));
    } else {
      onChange('specialized_modules', [...specializedModules, modId]);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl font-mono text-xs text-slate-200">
      {/* Header with Live Structural & Module Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-sky-400" />
          <span className="font-bold uppercase tracking-wider text-white">Architectural Blueprint Forge</span>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            usedModules > totalModules 
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' 
              : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
          }`}>
            <Layers size={13} />
            <span>Modules: <strong>{usedModules}</strong> / {totalModules} ({Number((totalModules - usedModules).toFixed(2))} Free)</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 flex items-center gap-1.5">
            <Shield size={13} />
            <span>SP: <strong>{totalSP.toLocaleString()}</strong> (DR {matDef.dr})</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center gap-1.5">
            <Clock size={13} />
            <span>Build Time: <strong>{coopTimeline.formattedTimeline}</strong> ({workers} Workers)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 gap-1 pb-1">
        {['Footprint', 'Height & Stories', 'Materials & Environment', 'Specialized Modules', 'Workforce Timeline'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab 
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: FOOTPRINT & SCALE */}
      {activeTab === 'Footprint' && (
        <div className="space-y-3">
          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
            Ground-Level Footprint & Foundation Scale (14 Size Categories)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[340px] overflow-y-auto pr-1">
            {Object.entries(ARCHITECTURE_FOOTPRINTS).map(([fpKey, fpDef]) => {
              const isSelected = footprint === fpKey;
              return (
                <button
                  key={fpKey}
                  type="button"
                  onClick={() => onChange('footprint', fpKey)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-sky-950/40 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs mb-1">
                    <span>{fpDef.name}</span>
                    <span className="text-[10px] text-amber-400 font-normal">{fpDef.dimensions}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mb-1">{fpDef.example}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 border-t border-slate-800/80 pt-1">
                    <span>Base Mdl: <strong>{fpDef.baseModules}</strong></span>
                    <span>Base SP: <strong>{fpDef.baseSP}</strong></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: HEIGHT & STORIES */}
      {activeTab === 'Height & Stories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {Object.entries(HEIGHT_CLASSES).map(([hcKey, hcDef]) => {
              const isSelected = heightClass === hcKey;
              return (
                <button
                  key={hcKey}
                  type="button"
                  onClick={() => {
                    onChange('height_class', hcKey);
                    onChange('stories', hcDef.stories);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-sky-950/40 border-sky-500 text-sky-300 shadow-sm' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 font-bold text-xs">
                    <span>{hcDef.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">{hcDef.stories} Flrs</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2">{hcDef.description}</div>
                  <div className="text-[10px] text-slate-300 border-t border-slate-800/80 pt-1">
                    Engineering Mod: <strong>+{hcDef.craftMod} DC</strong>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Story Slider */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Custom Verticality: <span className="text-sky-400 font-bold">{stories} Stories</span>
              </label>
              <span className="text-xs text-slate-400">
                Total Modules: <strong className="text-white">{totalModules}</strong> | Total SP: <strong className="text-emerald-400">{totalSP.toLocaleString()}</strong>
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={stories}
              onChange={(e) => onChange('stories', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>
      )}

      {/* TAB 3: MATERIALS & ENVIRONMENT */}
      {activeTab === 'Materials & Environment' && (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 block">
              Material Grade & Era Composition (TL 0–5)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {Object.entries(ARCHITECTURE_MATERIALS).map(([matKey, mDef]) => {
                const isSelected = tl === Number(matKey);
                return (
                  <button
                    key={matKey}
                    type="button"
                    onClick={() => onChange('tl', Number(matKey))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-sky-950/40 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">TL {mDef.tl}: {mDef.name}</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold mb-1">DR {mDef.dr} | x{mDef.spMult} SP Mult</div>
                    <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1">{mDef.passive}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Environmental Conditions */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 block">
              Planetary & Environmental Conditions
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {Object.entries(ENVIRONMENTAL_MODIFIERS).map(([envKey, eDef]) => {
                const isSelected = environment === envKey;
                return (
                  <button
                    key={envKey}
                    type="button"
                    onClick={() => onChange('environment', envKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-amber-950/30 border-amber-500 text-amber-200 shadow-sm' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs mb-0.5">{eDef.name}</div>
                    <div className="text-[10px] text-slate-400">{eDef.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SPECIALIZED MODULES */}
      {activeTab === 'Specialized Modules' && (
        <div className="space-y-3">
          <div className="p-2.5 bg-sky-950/20 border border-sky-800/40 rounded-xl text-[11px] text-sky-200 flex items-center gap-2">
            <AlertTriangle size={14} className="text-sky-400 shrink-0" />
            <span>
              <strong>Highest Complexity Rule:</strong> Installing advanced modules (e.g. Nanoforge DC 35) automatically raises the entire building's base design difficulty to match that module.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
            {SPECIALIZED_MODULE_CATALOG.map((mod) => {
              const isSelected = isModuleSelected(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleToggleModule(mod.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-sky-950/40 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{mod.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">{mod.category}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-1.5">{mod.description}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 border-t border-slate-800/80 pt-1">
                    <span>Occupies: <strong>{mod.modules} Module{mod.modules > 1 ? 's' : ''}</strong></span>
                    <span>Complexity: <strong className="text-purple-300">DC {mod.dc}</strong></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: WORKFORCE TIMELINE */}
      {activeTab === 'Workforce Timeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Workforce size */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Workforce Workers</label>
                <span className="text-xs font-bold text-sky-400">{workers}</span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={workers}
                onChange={(e) => onChange('workforce_workers', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Crafter skill */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Avg Skill Check</label>
                <span className="text-xs font-bold text-amber-400">{workerSkill}</span>
              </div>
              <input
                type="range"
                min="11"
                max="35"
                value={workerSkill}
                onChange={(e) => onChange('workforce_skill', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Tool Tier */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Production Facility</label>
              <select
                value={toolTier}
                onChange={(e) => onChange('tool_tier', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200"
              >
                {TOOL_TIERS.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.multiplier}x)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Construction Timeline Card */}
          <div className="p-4 bg-sky-950/30 border border-sky-500/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-sky-300 uppercase tracking-wider">Estimated Cooperative Construction Timeline</span>
              <span className="text-base font-bold text-emerald-400">{coopTimeline.formattedTimeline}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-2 border-t border-sky-800/40">
              <div>Total Daily PP: <strong className="text-amber-300">{coopTimeline.totalDailyPP.toLocaleString()} PP</strong></div>
              <div>Estimated Days: <strong className="text-white">{coopTimeline.totalDays}</strong></div>
              <div>Estimated Months: <strong className="text-white">{coopTimeline.workMonths}</strong></div>
              <div>Estimated Years: <strong className="text-white">{coopTimeline.workYears}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureBlueprintConfigurator;
