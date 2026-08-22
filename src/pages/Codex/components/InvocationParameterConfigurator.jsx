import React, { useMemo } from 'react';
import { 
  Sparkles, 
  Clock, 
  Maximize2, 
  Hourglass, 
  Layers, 
  Zap, 
  Flame, 
  Activity, 
  Eye, 
  ShieldCheck, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  INVOCATION_DISCIPLINES, 
  INVOCATION_BASE_DIFFICULTIES, 
  CASTING_TIME_MODIFIERS, 
  INVOCATION_RANGE_MODIFIERS, 
  INVOCATION_AOE_MODIFIERS, 
  INVOCATION_DURATION_MODIFIERS, 
  INVOCATION_OTHER_MODIFIERS, 
  SKILL_STAGES, 
  INVOCATION_SCALING_FORMULAS 
} from '../../../engines/tangentConstants';
import { calculateInvocationDC, getSkillStageFromDC, calculateEssenceCost } from '../../../engines/tangentEntityEngines';

export const InvocationParameterConfigurator = ({ formData = {}, onChange }) => {
  const selectedDiscipline = formData.discipline || 'telekinesis';
  const selectedBaseDifficulty = formData.baseDifficulty || formData.base_dc_key || 'Standard';
  const baseDCVal = Number(formData.baseDifficultyVal ?? formData.base_dc ?? (INVOCATION_BASE_DIFFICULTIES[selectedBaseDifficulty]?.dc || 15));
  const selectedTime = formData.time || formData.casting_time || 'StandardAction';
  const selectedRange = formData.range || 'Medium';
  const selectedAoE = formData.area || formData.aoe || 'SingleTarget';
  const selectedDuration = formData.duration || 'Instant';
  const selectedOtherMods = Array.isArray(formData.otherModifiers) ? formData.otherModifiers : (formData.other_mods || []);
  const selectedScalingType = formData.scalingType || 'energyDamage';

  // Live DC calculation
  const finalDC = useMemo(() => {
    return calculateInvocationDC({
      baseDC: baseDCVal,
      time: selectedTime,
      range: selectedRange,
      aoe: selectedAoE,
      duration: selectedDuration,
      otherMods: selectedOtherMods
    });
  }, [baseDCVal, selectedTime, selectedRange, selectedAoE, selectedDuration, selectedOtherMods]);

  const currentStage = useMemo(() => {
    return getSkillStageFromDC(finalDC);
  }, [finalDC]);

  const essenceData = useMemo(() => {
    return calculateEssenceCost(currentStage.stage, 2, 1);
  }, [currentStage]);

  const toggleOtherMod = (modId) => {
    const exists = selectedOtherMods.includes(modId);
    let updated;
    if (exists) {
      updated = selectedOtherMods.filter(m => m !== modId);
    } else {
      updated = [...selectedOtherMods, modId];
    }
    onChange('otherModifiers', updated);
    onChange('other_mods', updated);
  };

  const handleBaseDifficultyChange = (key) => {
    const def = INVOCATION_BASE_DIFFICULTIES[key] || INVOCATION_BASE_DIFFICULTIES.Standard;
    onChange('baseDifficulty', key);
    onChange('base_dc_key', key);
    onChange('baseDifficultyVal', def.dc);
    onChange('base_dc', def.dc);
    onChange('craft_dc', finalDC);
  };

  return (
    <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-5 text-slate-100 font-mono">
      {/* Top Header: Final Cast DC & Skill Stage Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-purple-200">
              Invocation Pattern & Difficulty Engine
            </h3>
            <p className="text-[11px] text-slate-400">
              Parent Discipline: <span className="text-purple-300 font-bold">{INVOCATION_DISCIPLINES.find(d => d.id === selectedDiscipline)?.name || selectedDiscipline}</span>
            </p>
          </div>
        </div>

        {/* Live Final Cast DC Badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Final Cast DC</span>
            <span className="text-base font-bold text-amber-400 font-mono">
              DC {finalDC}
            </span>
          </div>
          <div className="px-2 py-1 rounded bg-purple-500/20 border border-purple-400/40 text-[10px] font-bold text-purple-300 uppercase">
            {currentStage.name.split(' — ')[1]}
          </div>
        </div>
      </div>

      {/* Discipline & Base Difficulty Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Discipline */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Psionic / Metaphysic Discipline
          </label>
          <select
            value={selectedDiscipline}
            onChange={(e) => onChange('discipline', e.target.value)}
            className="w-full p-2 bg-slate-950 border border-purple-500/40 rounded-xl text-xs text-purple-200 focus:outline-none focus:border-purple-400"
          >
            {INVOCATION_DISCIPLINES.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.parent})</option>
            ))}
          </select>
        </div>

        {/* Base Difficulty */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Base Difficulty Standard
          </label>
          <select
            value={selectedBaseDifficulty}
            onChange={(e) => handleBaseDifficultyChange(e.target.value)}
            className="w-full p-2 bg-slate-950 border border-purple-500/40 rounded-xl text-xs text-purple-200 focus:outline-none focus:border-purple-400"
          >
            {Object.keys(INVOCATION_BASE_DIFFICULTIES).map(key => (
              <option key={key} value={key}>{INVOCATION_BASE_DIFFICULTIES[key].name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Parameter Buttons Grid: Time, Range, AoE, Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Activation Time */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1"><Clock size={12} className="text-purple-400" /> Action Economy (Time)</span>
            <span className="text-amber-400 font-bold font-mono">
              {CASTING_TIME_MODIFIERS[selectedTime]?.dcMod >= 0 ? `+${CASTING_TIME_MODIFIERS[selectedTime]?.dcMod}` : CASTING_TIME_MODIFIERS[selectedTime]?.dcMod} DC
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {Object.keys(CASTING_TIME_MODIFIERS).map(timeKey => {
              const mod = CASTING_TIME_MODIFIERS[timeKey];
              const isSelected = selectedTime === timeKey;
              return (
                <button
                  key={timeKey}
                  type="button"
                  onClick={() => {
                    onChange('time', timeKey);
                    onChange('casting_time', timeKey);
                  }}
                  className={`p-1.5 rounded-lg text-[10px] font-bold border transition-colors text-left ${
                    isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate">{mod.name.split(' (')[0]}</div>
                  <div className="text-[9px] opacity-80">{mod.dcMod >= 0 ? `+${mod.dcMod}` : mod.dcMod} DC</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Range Parameters */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1"><Maximize2 size={12} className="text-purple-400" /> Range Band</span>
            <span className="text-amber-400 font-bold font-mono">
              {INVOCATION_RANGE_MODIFIERS[selectedRange]?.dcMod >= 0 ? `+${INVOCATION_RANGE_MODIFIERS[selectedRange]?.dcMod}` : INVOCATION_RANGE_MODIFIERS[selectedRange]?.dcMod} DC
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {Object.keys(INVOCATION_RANGE_MODIFIERS).map(rangeKey => {
              const mod = INVOCATION_RANGE_MODIFIERS[rangeKey];
              const isSelected = selectedRange === rangeKey;
              return (
                <button
                  key={rangeKey}
                  type="button"
                  onClick={() => onChange('range', rangeKey)}
                  className={`p-1.5 rounded-lg text-[10px] font-bold border transition-colors text-left ${
                    isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate">{mod.name.split(' (')[0]}</div>
                  <div className="text-[9px] opacity-80">{mod.dcMod >= 0 ? `+${mod.dcMod}` : mod.dcMod} DC</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Area of Effect */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1"><Layers size={12} className="text-purple-400" /> Area of Effect (AoE)</span>
            <span className="text-amber-400 font-bold font-mono">
              +{INVOCATION_AOE_MODIFIERS[selectedAoE]?.dcMod || 0} DC
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {Object.keys(INVOCATION_AOE_MODIFIERS).map(aoeKey => {
              const mod = INVOCATION_AOE_MODIFIERS[aoeKey];
              const isSelected = selectedAoE === aoeKey;
              return (
                <button
                  key={aoeKey}
                  type="button"
                  onClick={() => {
                    onChange('area', aoeKey);
                    onChange('aoe', aoeKey);
                  }}
                  className={`p-1.5 rounded-lg text-[10px] font-bold border transition-colors text-left ${
                    isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate">{mod.name.split(' (')[0]}</div>
                  <div className="text-[9px] opacity-80">+{mod.dcMod} DC</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1"><Hourglass size={12} className="text-purple-400" /> Duration & Sustainability</span>
            <span className="text-amber-400 font-bold font-mono">
              +{INVOCATION_DURATION_MODIFIERS[selectedDuration]?.dcMod || 0} DC
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {Object.keys(INVOCATION_DURATION_MODIFIERS).map(durKey => {
              const mod = INVOCATION_DURATION_MODIFIERS[durKey];
              const isSelected = selectedDuration === durKey;
              return (
                <button
                  key={durKey}
                  type="button"
                  onClick={() => onChange('duration', durKey)}
                  className={`p-1.5 rounded-lg text-[10px] font-bold border transition-colors text-left ${
                    isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate">{mod.name.split(' (')[0]}</div>
                  <div className="text-[9px] opacity-80">+{mod.dcMod} DC</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Other Modifiers & Catalysts */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-bold text-slate-400 block">
          Additional Modifiers & Casting Catalysts
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {INVOCATION_OTHER_MODIFIERS.map(mod => {
            const isSelected = selectedOtherMods.includes(mod.id);
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => toggleOtherMod(mod.id)}
                className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-purple-950/60 border-purple-400 shadow-sm' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-purple-500/40'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-100 block">{mod.name.split(' (')[0]}</span>
                  <span className="text-[9px] text-slate-400">{mod.description}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  mod.dcMod > 0 ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {mod.dcMod > 0 ? `+${mod.dcMod}` : mod.dcMod}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skill Stages & Scaling Algorithm Preview */}
      <div className="p-3.5 bg-slate-950/90 rounded-xl border border-purple-500/30 space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Stage Scaling & Essence Resonance
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-slate-400">Formula:</span>
            <select
              value={selectedScalingType}
              onChange={(e) => onChange('scalingType', e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-purple-300"
            >
              {Object.keys(INVOCATION_SCALING_FORMULAS).map(k => (
                <option key={k} value={k}>{INVOCATION_SCALING_FORMULAS[k].name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 5 Stages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center">
          {SKILL_STAGES.map(stg => {
            const isCasterCurrent = currentStage.stage === stg.stage;
            const formulaDef = INVOCATION_SCALING_FORMULAS[selectedScalingType] || INVOCATION_SCALING_FORMULAS.energyDamage;
            return (
              <div 
                key={stg.stage} 
                className={`p-2 rounded-xl border transition-all ${
                  isCasterCurrent 
                    ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)] ring-1 ring-purple-400' 
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <span className="text-[9px] uppercase font-bold text-slate-400 block">{stg.name.split(' — ')[1]}</span>
                <span className="text-[10px] text-slate-500 font-mono">Rank {stg.minRank}–{stg.maxRank}</span>
                <div className="text-sm font-bold text-amber-400 font-mono my-1">
                  {formulaDef.formula(stg.stage)}
                </div>
                <span className="text-[9px] font-mono text-emerald-400 block">
                  {stg.stage <= currentStage.stage ? '0 Essence' : `+${stg.stage - currentStage.stage} Essence`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InvocationParameterConfigurator;
