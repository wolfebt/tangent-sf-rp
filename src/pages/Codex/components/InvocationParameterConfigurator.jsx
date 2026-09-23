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
  INVOCATION_SCALING_FORMULAS,
  SPECIAL_ABILITY_FOUNDATION_ATTRIBUTES
} from '../../../engines/tangentConstants';
import { calculateInvocationDC, getSkillStageFromDC, calculateEssenceCost } from '../../../engines/tangentEntityEngines';

export const InvocationParameterConfigurator = ({ formData = {}, onChange }) => {
  const isSpecialAbility = Boolean(formData.isSpecialAbility ?? formData.is_special_ability ?? formData.powerType === 'special_ability' ?? false);
  const selectedFoundationAttr = formData.foundationAttribute || formData.foundation_attribute || formData.baseAttr || 'attr-intellect';
  const foundAttrObj = SPECIAL_ABILITY_FOUNDATION_ATTRIBUTES.find(a => a.id === selectedFoundationAttr) || SPECIAL_ABILITY_FOUNDATION_ATTRIBUTES[0];

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

  const handleToggleSpecialAbility = (val) => {
    onChange('isSpecialAbility', val);
    onChange('is_special_ability', val);
    onChange('powerType', val ? 'special_ability' : 'invocation');
    if (val && !formData.foundationAttribute) {
      onChange('foundationAttribute', 'attr-intellect');
      onChange('foundation_attribute', 'attr-intellect');
      onChange('baseAttr', 'attr-intellect');
    }
  };

  const handleFoundationAttrChange = (attrId) => {
    onChange('foundationAttribute', attrId);
    onChange('foundation_attribute', attrId);
    onChange('baseAttr', attrId);
  };

  return (
    <div className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 shadow-2xl space-y-5 text-slate-100 font-mono transition-colors ${
      isSpecialAbility ? 'border-cyan-500/50' : 'border-purple-500/40'
    }`}>
      {/* Top Header: Final Cast DC & Skill Stage Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
            isSpecialAbility 
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
              : 'bg-purple-500/20 border-purple-500/50 text-purple-400'
          }`}>
            {isSpecialAbility ? <Zap size={18} /> : <Sparkles size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-bold tracking-wider uppercase ${
                isSpecialAbility ? 'text-cyan-200' : 'text-purple-200'
              }`}>
                {isSpecialAbility ? 'Special Ability Parameter Matrix' : 'Invocation Pattern & Difficulty Engine'}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                isSpecialAbility 
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]' 
                  : 'bg-purple-950 text-purple-300 border-purple-500/50'
              }`}>
                {isSpecialAbility ? 'Stand-Alone Trait' : 'Discipline Specialization'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isSpecialAbility ? (
                <span>
                  Foundation: <strong className="text-cyan-300">{foundAttrObj.name} ({foundAttrObj.check})</strong> + Ranks <span className="text-slate-500">(No Awakened Discipline or Meta Focus Skill required)</span>
                </span>
              ) : (
                <span>
                  Parent Discipline: <span className="text-purple-300 font-bold">{INVOCATION_DISCIPLINES.find(d => d.id === selectedDiscipline)?.name || selectedDiscipline}</span> <span className="text-slate-500">(Specialization to Meta-Focus skill)</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Live Final Cast DC Badge */}
        <div className={`flex items-center gap-3 bg-slate-950/80 px-3.5 py-2 rounded-xl border shadow-lg ${
          isSpecialAbility ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
        }`}>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Final Cast DC</span>
            <span className="text-base font-bold text-amber-400 font-mono">
              DC {finalDC}
            </span>
          </div>
          <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
            isSpecialAbility 
              ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300' 
              : 'bg-purple-500/20 border-purple-400/40 text-purple-300'
          }`}>
            {currentStage.name.split(' — ')[1]}
          </div>
        </div>
      </div>

      {/* CLASSIFICATION INDICATOR TOGGLE: Specialization Invocation vs Stand-Alone Special Ability */}
      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1.5">
            <span>⚙️</span> Trait Foundation & Classification Indicator
          </label>
          <span className="text-[10px] text-slate-400 font-normal">
            Shift foundation from Awakened discipline specialization to stand-alone attribute
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Option 1: Standard Invocation */}
          <button
            type="button"
            onClick={() => handleToggleSpecialAbility(false)}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              !isSpecialAbility 
                ? 'bg-purple-950/70 border-purple-400 shadow-md ring-1 ring-purple-400/40' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className={!isSpecialAbility ? 'text-purple-300' : 'text-slate-500'} />
              <span className={`text-xs font-bold ${!isSpecialAbility ? 'text-purple-100' : 'text-slate-300'}`}>
                Discipline Invocation (Specialization)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Functions as a specialization to an Awakened Discipline's Meta-Focus skill. Requires the Awakened feature and paired discipline focus training.
            </p>
          </button>

          {/* Option 2: Special Ability */}
          <button
            type="button"
            onClick={() => handleToggleSpecialAbility(true)}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              isSpecialAbility 
                ? 'bg-cyan-950/70 border-cyan-400 shadow-md ring-1 ring-cyan-400/40' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap size={14} className={isSpecialAbility ? 'text-cyan-300' : 'text-slate-500'} />
              <span className={`text-xs font-bold ${isSpecialAbility ? 'text-cyan-100' : 'text-slate-300'}`}>
                ⚡ Stand-Alone Special Ability
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Designed as a stand-alone trait requiring no Awakened Disciplines or Meta-Focus skills. Foundation is simply an Attribute + ranks in the ability.
            </p>
          </button>
        </div>
      </div>

      {/* Trait Foundation Parameters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Foundational Attribute (Visible & active if Special Ability, or Discipline Selector) */}
        {isSpecialAbility ? (
          <div>
            <label className="text-[10px] uppercase font-bold text-cyan-300 block mb-1 flex items-center justify-between">
              <span>Foundational Core Attribute</span>
              <span className="text-[9px] text-cyan-400 font-mono">Governs Check &amp; Potency</span>
            </label>
            <select
              value={selectedFoundationAttr}
              onChange={(e) => handleFoundationAttrChange(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-cyan-500/50 rounded-xl text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
            >
              {SPECIAL_ABILITY_FOUNDATION_ATTRIBUTES.map(attr => (
                <option key={attr.id} value={attr.id}>
                  {attr.name} ({attr.code}) — {attr.check} Check
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              {foundAttrObj.description}
            </p>
          </div>
        ) : (
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
            <p className="text-[10px] text-slate-400 mt-1">
              Requires character to awaken this discipline to manifest.
            </p>
          </div>
        )}

        {/* Base Difficulty */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Base Difficulty Standard
          </label>
          <select
            value={selectedBaseDifficulty}
            onChange={(e) => handleBaseDifficultyChange(e.target.value)}
            className={`w-full p-2 bg-slate-950 border rounded-xl text-xs focus:outline-none ${
              isSpecialAbility ? 'border-cyan-500/40 text-cyan-200 focus:border-cyan-400' : 'border-purple-500/40 text-purple-200 focus:border-purple-400'
            }`}
          >
            {Object.keys(INVOCATION_BASE_DIFFICULTIES).map(key => (
              <option key={key} value={key}>{INVOCATION_BASE_DIFFICULTIES[key].name}</option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 mt-1">
            {INVOCATION_BASE_DIFFICULTIES[selectedBaseDifficulty]?.example}
          </p>
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
