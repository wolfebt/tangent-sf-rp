import React, { useMemo } from 'react';
import { 
  Users, 
  Shield, 
  Crosshair, 
  Zap, 
  Crown, 
  Heart, 
  Activity, 
  Sparkles, 
  Sliders, 
  Award, 
  Skull, 
  Radio
} from 'lucide-react';
import { 
  THREAT_TIER_CHASSIS, 
  COMPETENCY_ROLES, 
  DESIGNATIONS, 
  BOSS_TYPES, 
  TACTICAL_BEHAVIORS, 
  SPECIES_SIZES 
} from '../../../engines/tangentConstants';
import { calculateNPCCombatBlock } from '../../../engines/tangentEntityEngines';

export const ModularStatBlockConfigurator = ({ formData = {}, onChange }) => {
  const threatTier = Number(formData.threatTier ?? formData.threat_tier ?? formData.craft_dc ?? 3);
  const selectedRole = formData.competencyRole ?? formData.role ?? 'Tank';
  const selectedDesignation = formData.designation || 'Adversary';
  const selectedBossType = formData.bossType ?? formData.boss_type ?? 'Standard';
  const selectedSize = formData.sizeCategory ?? formData.size ?? 'Medium';
  const isSynthetic = !!(formData.isSynthetic || formData.species === 'Synthetic');
  const selectedBehaviors = Array.isArray(formData.tacticalBehaviors) ? formData.tacticalBehaviors : (formData.tactical_behaviors || ['Defensive Anchor']);

  // Compute live stat block
  const combatBlock = useMemo(() => {
    return calculateNPCCombatBlock({
      tier: threatTier,
      role: selectedRole,
      bossType: selectedBossType,
      size: selectedSize,
      designation: selectedDesignation,
      isSynthetic
    });
  }, [threatTier, selectedRole, selectedBossType, selectedSize, selectedDesignation, isSynthetic]);

  const toggleBehavior = (behavior) => {
    const exists = selectedBehaviors.includes(behavior);
    let updated;
    if (exists) {
      updated = selectedBehaviors.filter(b => b !== behavior);
    } else {
      updated = [...selectedBehaviors, behavior];
    }
    onChange('tacticalBehaviors', updated);
    onChange('tactical_behaviors', updated);
  };

  const handleTierChange = (val) => {
    const t = Math.max(0, Math.min(20, Number(val)));
    onChange('threatTier', t);
    onChange('threat_tier', t);
    onChange('craft_dc', t);
  };

  return (
    <div className="bg-slate-900/90 border border-sky-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-5 text-slate-100 font-mono">
      {/* Top Header: Threat Hierarchy & Chassis */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-sky-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/50 flex items-center justify-center text-sky-400">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-sky-200">
              Modular Character Tier & Combat Chassis
            </h3>
            <p className="text-[11px] text-slate-400">
              Threat Tier <span className="text-sky-300 font-bold">{threatTier}</span>: <span className="text-amber-400 font-bold">{combatBlock.narrativeRank}</span> ({THREAT_TIER_CHASSIS[threatTier]?.bp})
            </p>
          </div>
        </div>

        {/* Boss Type & Designation Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-sky-950 border border-sky-500/40 text-sky-300">
            {selectedDesignation}
          </span>
          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
            combatBlock.isBoss ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' :
            combatBlock.isMastermind ? 'bg-purple-950/80 border-purple-500/60 text-purple-300' :
            combatBlock.isMinion ? 'bg-red-950/80 border-red-500/60 text-red-300' :
            'bg-slate-950 border-slate-700 text-slate-400'
          }`}>
            {selectedBossType}
          </span>
        </div>
      </div>

      {/* Threat Tier Interactive Slider */}
      <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders size={13} className="text-sky-400" />
            <span>Threat Tier Level (Tiers 0–20)</span>
          </label>
          <span className="text-sm font-bold text-sky-400 font-mono">
            Tier {threatTier} — {combatBlock.narrativeRank}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={threatTier}
          onChange={(e) => handleTierChange(e.target.value)}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />
        <div className="flex justify-between text-[9px] text-slate-500 uppercase">
          <span>Tier 0 (Civilian)</span>
          <span>Tier 5 (Professional)</span>
          <span>Tier 10 (Champion / Boss)</span>
          <span>Tier 15 (High Lord)</span>
          <span>Tier 20 (Cosmic)</span>
        </div>
      </div>

      {/* Designation, Boss Type, Size & Synthetic Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Designation */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Designation
          </label>
          <select
            value={selectedDesignation}
            onChange={(e) => onChange('designation', e.target.value)}
            className="w-full p-2 bg-slate-950 border border-sky-500/40 rounded-xl text-xs text-sky-200 focus:outline-none focus:border-sky-400"
          >
            {Object.keys(DESIGNATIONS).map(d => (
              <option key={d} value={d}>{DESIGNATIONS[d].name}</option>
            ))}
          </select>
        </div>

        {/* Boss Type */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Chassis Multiplier
          </label>
          <select
            value={selectedBossType}
            onChange={(e) => {
              onChange('bossType', e.target.value);
              onChange('boss_type', e.target.value);
            }}
            className="w-full p-2 bg-slate-950 border border-sky-500/40 rounded-xl text-xs text-sky-200 focus:outline-none focus:border-sky-400"
          >
            {Object.keys(BOSS_TYPES).map(b => (
              <option key={b} value={b}>{BOSS_TYPES[b].name}</option>
            ))}
          </select>
        </div>

        {/* Size Category */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Size Scale
          </label>
          <select
            value={selectedSize}
            onChange={(e) => {
              onChange('sizeCategory', e.target.value);
              onChange('size', e.target.value);
            }}
            className="w-full p-2 bg-slate-950 border border-sky-500/40 rounded-xl text-xs text-sky-200 focus:outline-none focus:border-sky-400"
          >
            {Object.keys(SPECIES_SIZES).map(s => (
              <option key={s} value={s}>{SPECIES_SIZES[s].name}</option>
            ))}
          </select>
        </div>

        {/* Synthetic Toggle */}
        <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl">
          <input
            type="checkbox"
            id="isSynthetic"
            checked={isSynthetic}
            onChange={(e) => onChange('isSynthetic', e.target.checked)}
            className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
          />
          <label htmlFor="isSynthetic" className="text-xs font-bold text-slate-300 uppercase cursor-pointer">
            Synthetic / Construct (SP Only)
          </label>
        </div>
      </div>

      {/* Competency Role Grid */}
      <div>
        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
          Competency Role ({combatBlock.role})
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.keys(COMPETENCY_ROLES).map(roleKey => {
            const role = COMPETENCY_ROLES[roleKey];
            const isSelected = selectedRole === roleKey || selectedRole === role.name;
            return (
              <button
                key={roleKey}
                type="button"
                onClick={() => {
                  onChange('competencyRole', roleKey);
                  onChange('role', roleKey);
                }}
                className={`p-2 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'bg-sky-950/70 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-sky-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{role.name.split(' (')[0]}</span>
                  <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-400">{role.group}</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {role.feature}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Calculated NPC Combat Stat Block Preview */}
      <div className="p-4 bg-slate-950/90 rounded-xl border border-sky-500/30 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
              Live Tactical Combat Stat Block
            </span>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">
            Wealth Score: WS {combatBlock.wealthScore}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center">
          {/* Health / SP */}
          {isSynthetic ? (
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[9px] uppercase text-slate-500 block">Structure</span>
              <span className="text-sm font-bold text-sky-400 font-mono">{combatBlock.structurePoints} SP</span>
            </div>
          ) : (
            <>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">Vitality</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{combatBlock.vitality}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">Health</span>
                <span className="text-sm font-bold text-red-400 font-mono">{combatBlock.health}</span>
              </div>
            </>
          )}

          {/* Defense DC */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Defense DC</span>
            <span className="text-sm font-bold text-sky-300 font-mono">{combatBlock.defenseDC}</span>
          </div>

          {/* Attack Bonus */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Attack Bonus</span>
            <span className="text-sm font-bold text-amber-400 font-mono">+{combatBlock.attackBonus}</span>
          </div>

          {/* DR */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Expected DR</span>
            <span className="text-sm font-bold text-slate-200 font-mono">DR {combatBlock.expectedDR}</span>
          </div>

          {/* Initiative */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Initiative</span>
            <span className="text-sm font-bold text-purple-400 font-mono">+{combatBlock.initiative}</span>
          </div>

          {/* Actions */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Actions</span>
            <span className="text-sm font-bold text-sky-400 font-mono">{combatBlock.actionsPerRound} / rnd</span>
          </div>

          {/* Speed */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Speed</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{combatBlock.speed} ft</span>
          </div>
        </div>

        {/* Saves & Role Skills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
          <div>
            <span className="text-slate-400 font-bold">Saving Throws: </span>
            <span className="text-slate-300">Fort +{combatBlock.saves.fortitude} / Ref +{combatBlock.saves.reflex} / Will +{combatBlock.saves.will}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold">Primary Skills: </span>
            <span className="text-sky-300">{combatBlock.keySkills.join(', ')} (Rank {combatBlock.primarySkillRank})</span>
          </div>
        </div>
      </div>

      {/* Tactical Behaviors Pill Multi-Select */}
      <div>
        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
          Tactical Behaviors ({selectedBehaviors.length} selected)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TACTICAL_BEHAVIORS.map(beh => {
            const isSelected = selectedBehaviors.includes(beh);
            return (
              <button
                key={beh}
                type="button"
                onClick={() => toggleBehavior(beh)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  isSelected 
                    ? 'bg-sky-600 text-white shadow-sm' 
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {beh}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModularStatBlockConfigurator;
