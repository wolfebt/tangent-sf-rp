import React, { useState, useMemo } from 'react';
import { 
  Dna, 
  Sparkles, 
  ShieldAlert, 
  Search, 
  Plus, 
  Minus, 
  Check, 
  Info, 
  Zap, 
  Flame, 
  Activity, 
  Sliders
} from 'lucide-react';
import { 
  SPECIES_BUDGET_LEVELS, 
  SPECIES_TYPES, 
  SPECIES_SIZES, 
  SPECIES_MOVEMENT_MODES, 
  SPECIES_MOVEMENT_BASE_MODES,
  SPECIES_MOVEMENT_ADJUSTERS,
  SPECIES_MOVEMENT_GROUPS,
  SPECIES_MOVEMENT_MODIFICATIONS,
  SPECIES_TRAITS_BASIC, 
  SPECIES_TRAITS_ADVANCED, 
  SPECIES_TRAITS_ELITE, 
  SPECIES_DISADVANTAGES 
} from '../../../engines/tangentConstants';
import { calculateSpeciesBP, calculateSpeciesCombatModifiers } from '../../../engines/tangentEntityEngines';

export const SpeciesTraitSelector = ({ formData = {}, onChange }) => {
  const [activeTab, setActiveTab] = useState('traits'); // 'traits', 'attributes', 'movement', 'disadvantages'
  const [traitTier, setTraitTier] = useState('basic'); // 'basic', 'advanced', 'elite'
  const [searchQuery, setSearchQuery] = useState('');

  const selectedType = formData.species_type || formData.type || 'Humanoid';
  const selectedSize = formData.size || 'Medium';
  const selectedBudget = formData.budget_level || 'Standard';
  const selectedModes = Array.isArray(formData.movement_modes) ? formData.movement_modes : (formData.movement ? [formData.movement] : ['normal']);
  const selectedTraits = Array.isArray(formData.traits) ? formData.traits : [];
  const selectedDisadvantages = Array.isArray(formData.disadvantages) ? formData.disadvantages : [];
  const attributes = formData.attributes || {
    str: formData.bonus_str || 0,
    agi: formData.bonus_agi || 0,
    sta: formData.bonus_sta || 0,
    int: formData.bonus_int || 0,
    wis: formData.bonus_wis || 0,
    cha: formData.bonus_cha || 0
  };
  const skillBundles = formData.skill_bundles || 0;

  // Real-time calculation
  const bpData = useMemo(() => {
    return calculateSpeciesBP({
      type: selectedType,
      size: selectedSize,
      movementModes: selectedModes,
      attributes,
      skillBundles,
      traits: selectedTraits,
      disadvantages: selectedDisadvantages,
      budgetLevel: selectedBudget
    });
  }, [selectedType, selectedSize, selectedModes, attributes, skillBundles, selectedTraits, selectedDisadvantages, selectedBudget]);

  const combatMods = useMemo(() => {
    return calculateSpeciesCombatModifiers(selectedSize);
  }, [selectedSize]);

  // Keep parent form in sync with BP calculations
  const updateAttribute = (attr, delta) => {
    const current = Number(attributes[attr] || 0);
    const updated = {
      ...attributes,
      [attr]: current + delta
    };
    onChange('attributes', updated);
    onChange(`bonus_${attr}`, updated[attr]);
  };

  const toggleTrait = (traitId) => {
    const exists = selectedTraits.some(t => (typeof t === 'string' ? t : t?.id) === traitId);
    let updated;
    if (exists) {
      updated = selectedTraits.filter(t => (typeof t === 'string' ? t : t?.id) !== traitId);
    } else {
      updated = [...selectedTraits, traitId];
    }
    onChange('traits', updated);
  };

  const toggleDisadvantage = (disId) => {
    const exists = selectedDisadvantages.some(d => (typeof d === 'string' ? d : d?.id) === disId);
    let updated;
    if (exists) {
      updated = selectedDisadvantages.filter(d => (typeof d === 'string' ? d : d?.id) !== disId);
    } else {
      updated = [...selectedDisadvantages, disId];
    }
    onChange('disadvantages', updated);
  };

  const toggleMovementMode = (modeId) => {
    const exists = selectedModes.some(m => (typeof m === 'string' ? m : m?.id) === modeId);
    let updated;
    if (exists) {
      updated = selectedModes.filter(m => (typeof m === 'string' ? m : m?.id) !== modeId);
      if (updated.length === 0) updated = ['species_movement-bipedal'];
    } else {
      const isExclusiveGround = ['fast', 'very_fast', 'slow', 'ponderous', 'movement-fast', 'movement-very-fast', 'movement-slow', 'movement-ponderous'].includes(modeId);
      if (isExclusiveGround) {
        const exclusiveIds = new Set(['fast', 'very_fast', 'slow', 'ponderous', 'movement-fast', 'movement-very-fast', 'movement-slow', 'movement-ponderous']);
        updated = selectedModes.filter(m => !exclusiveIds.has(typeof m === 'string' ? m : m?.id));
        updated.push(modeId);
      } else {
        updated = [...selectedModes, modeId];
      }
    }
    onChange('movement_modes', updated);
    onChange('movement', updated[0] || 'species_movement-bipedal');
  };

  // Trait list based on tier
  const currentTraitsList = useMemo(() => {
    let list = SPECIES_TRAITS_BASIC;
    if (traitTier === 'advanced') list = SPECIES_TRAITS_ADVANCED;
    if (traitTier === 'elite') list = SPECIES_TRAITS_ELITE;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.type.toLowerCase().includes(q));
  }, [traitTier, searchQuery]);

  const bpPercent = Math.min(100, Math.round((bpData.totalBPUsed / bpData.budgetMax) * 100));

  return (
    <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 text-slate-100 font-mono">
      {/* Top Header & Live CP Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400">
            <Dna size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-purple-200">
              Species Genetics & CP Configurator
            </h3>
            <p className="text-[11px] text-slate-400">
              Character Point Budget: <span className="text-purple-300 font-bold">{bpData.budgetMin}–{bpData.budgetMax} CP</span> ({selectedBudget})
            </p>
          </div>
        </div>

        {/* Live CP Progress Meter */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Character Points</span>
            <span className={`text-sm font-bold ${bpData.isOverBudget ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {bpData.totalBPUsed} / {bpData.budgetMax} CP
            </span>
          </div>
          <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${
                bpData.isOverBudget ? 'bg-red-500' : (bpPercent > 80 ? 'bg-amber-400' : 'bg-purple-500')
              }`}
              style={{ width: `${Math.min(100, bpPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Budget Level & Species Type Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Budget Level */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Budget Tier
          </label>
          <select
            value={selectedBudget}
            onChange={(e) => onChange('budget_level', e.target.value)}
            className="w-full p-2 bg-slate-950 border border-purple-500/40 rounded-xl text-xs text-purple-200 focus:outline-none focus:border-purple-400"
          >
            {Object.keys(SPECIES_BUDGET_LEVELS).map(lvl => (
              <option key={lvl} value={lvl}>{SPECIES_BUDGET_LEVELS[lvl].name}</option>
            ))}
          </select>
        </div>

        {/* Species Type (Chassis) */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Species Type Chassis ({SPECIES_TYPES[selectedType]?.bp || 0} CP)
          </label>
          <select
            value={selectedType}
            onChange={(e) => {
              onChange('species_type', e.target.value);
              onChange('type', e.target.value);
            }}
            className="w-full p-2 bg-slate-950 border border-purple-500/40 rounded-xl text-xs text-purple-200 focus:outline-none focus:border-purple-400"
          >
            {Object.keys(SPECIES_TYPES).map(t => (
              <option key={t} value={t}>
                {SPECIES_TYPES[t].name} ({SPECIES_TYPES[t].bp} CP)
              </option>
            ))}
          </select>
        </div>

        {/* Size Category */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Size Category ({SPECIES_SIZES[selectedSize]?.bp || 0} CP)
          </label>
          <select
            value={selectedSize}
            onChange={(e) => onChange('size', e.target.value)}
            className="w-full p-2 bg-slate-950 border border-purple-500/40 rounded-xl text-xs text-purple-200 focus:outline-none focus:border-purple-400"
          >
            {Object.keys(SPECIES_SIZES).map(s => (
              <option key={s} value={s}>
                {SPECIES_SIZES[s].name} ({SPECIES_SIZES[s].bp} CP)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Combat & Physical Modifiers Bar */}
      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px] grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <div>
          <span className="text-slate-500 block text-[9px] uppercase">Attack Mod</span>
          <span className={`font-bold ${combatMods.combatMod > 0 ? 'text-emerald-400' : (combatMods.combatMod < 0 ? 'text-red-400' : 'text-slate-300')}`}>
            {combatMods.combatMod >= 0 ? `+${combatMods.combatMod}` : combatMods.combatMod}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] uppercase">Defense Mod</span>
          <span className={`font-bold ${combatMods.defMod > 0 ? 'text-emerald-400' : (combatMods.defMod < 0 ? 'text-red-400' : 'text-slate-300')}`}>
            {combatMods.defMod >= 0 ? `+${combatMods.defMod}` : combatMods.defMod}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] uppercase">Stealth Mod</span>
          <span className={`font-bold ${combatMods.stealthMod > 0 ? 'text-emerald-400' : (combatMods.stealthMod < 0 ? 'text-red-400' : 'text-slate-300')}`}>
            {combatMods.stealthMod >= 0 ? `+${combatMods.stealthMod}` : combatMods.stealthMod}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] uppercase">Stability</span>
          <span className={`font-bold ${combatMods.stabilityMod > 0 ? 'text-emerald-400' : (combatMods.stabilityMod < 0 ? 'text-red-400' : 'text-slate-300')}`}>
            {combatMods.stabilityMod >= 0 ? `+${combatMods.stabilityMod}` : combatMods.stabilityMod}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] uppercase">Str / Agi Stat</span>
          <span className="font-bold text-slate-300">
            {combatMods.strMod >= 0 ? `+${combatMods.strMod}` : combatMods.strMod} Str / {combatMods.agiMod >= 0 ? `+${combatMods.agiMod}` : combatMods.agiMod} Agi
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] uppercase">Speed Mod</span>
          <span className="font-bold text-purple-300">
            {combatMods.speedMult > 1 ? `x${combatMods.speedMult}` : `${combatMods.speedMod >= 0 ? '+' : ''}${combatMods.speedMod} ft`}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('traits')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'traits' 
              ? 'border-purple-400 text-purple-300 bg-purple-950/20' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={13} />
          <span>Racial Traits ({selectedTraits.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attributes')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'attributes' 
              ? 'border-purple-400 text-purple-300 bg-purple-950/20' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={13} />
          <span>Attributes & Skills</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('movement')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'movement' 
              ? 'border-purple-400 text-purple-300 bg-purple-950/20' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap size={13} />
          <span>Movement Modes ({selectedModes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disadvantages')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'disadvantages' 
              ? 'border-purple-400 text-purple-300 bg-purple-950/20' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert size={13} />
          <span>Disadvantages ({selectedDisadvantages.length})</span>
        </button>
      </div>

      {/* Tab 1: Racial Traits Catalog */}
      {activeTab === 'traits' && (
        <div className="space-y-3">
          {/* Sub-tier tabs & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setTraitTier('basic')}
                className={`px-2.5 py-1 rounded font-bold uppercase ${traitTier === 'basic' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Basic (1 CP)
              </button>
              <button
                type="button"
                onClick={() => setTraitTier('advanced')}
                className={`px-2.5 py-1 rounded font-bold uppercase ${traitTier === 'advanced' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Advanced (2 CP)
              </button>
              <button
                type="button"
                onClick={() => setTraitTier('elite')}
                className={`px-2.5 py-1 rounded font-bold uppercase ${traitTier === 'elite' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Elite (4 CP)
              </button>
            </div>

            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search traits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Traits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {currentTraitsList.map(trait => {
              const isSelected = selectedTraits.some(t => (typeof t === 'string' ? t : t?.id) === trait.id);
              return (
                <button
                  key={trait.id}
                  type="button"
                  onClick={() => toggleTrait(trait.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    isSelected 
                      ? 'bg-purple-950/60 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]' 
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-100">{trait.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                      {trait.bp} CP
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    {trait.description}
                  </p>
                  <div className="flex items-center justify-between w-full pt-1 border-t border-slate-800/60 text-[9px]">
                    <span className="text-slate-500 uppercase">{trait.type}</span>
                    {isSelected && <span className="text-emerald-400 flex items-center gap-0.5 font-bold"><Check size={10} /> Active</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Attributes & Skills */}
      {activeTab === 'attributes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'str', name: 'Strength (STR)', desc: 'Physical power and melee damage' },
              { id: 'agi', name: 'Agility (AGI)', desc: 'Reflexes, speed, and evasion' },
              { id: 'sta', name: 'Stamina (STA)', desc: 'Durability, health, and fortitude' },
              { id: 'int', name: 'Intellect (INT)', desc: 'Reasoning, tech, and memory' },
              { id: 'wis', name: 'Wisdom (WIS)', desc: 'Awareness, willpower, and intuition' },
              { id: 'cha', name: 'Charisma (CHA)', desc: 'Presence, leadership, and social influence' }
            ].map(attr => {
              const val = Number(attributes[attr.id] || 0);
              const cost = val * 4;
              return (
                <div key={attr.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{attr.name}</span>
                    <span className={`text-[10px] font-bold ${cost > 0 ? 'text-purple-400' : (cost < 0 ? 'text-emerald-400' : 'text-slate-500')}`}>
                      {cost >= 0 ? `+${cost}` : cost} CP
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => updateAttribute(attr.id, -1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Minus size={13} />
                    </button>
                    <span className={`text-base font-bold font-mono ${val > 0 ? 'text-emerald-400' : (val < 0 ? 'text-red-400' : 'text-slate-300')}`}>
                      {val >= 0 ? `+${val}` : val}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateAttribute(attr.id, 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skill Point Bundles */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">+5 Skill Points Bundle (4 CP)</span>
              <span className="text-[10px] text-slate-400">Add bundles of 5 racial skill points for custom proficiencies</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onChange('skill_bundles', Math.max(0, skillBundles - 1))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <Minus size={13} />
              </button>
              <span className="text-sm font-bold text-purple-300 font-mono">
                {skillBundles * 5} pts ({skillBundles * 4} CP)
              </span>
              <button
                type="button"
                onClick={() => onChange('skill_bundles', skillBundles + 1)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Movement Modes & Additive Speed Adjusters */}
      {activeTab === 'movement' && (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {/* Active Speed Calculation Summary Banner */}
          <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-purple-400" />
              <div>
                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">
                  Active Calculated Speeds (Additive)
                </span>
                <span className="text-xs font-bold text-slate-100 font-mono">
                  {bpData.speedsFormatted || 'Ground 30 ft'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Total Movement CP</span>
              <span className="text-xs font-bold text-purple-300 font-mono">
                {bpData.breakdown.movementBP > 0 ? `+${bpData.breakdown.movementBP}` : bpData.breakdown.movementBP} CP
              </span>
            </div>
          </div>

          {/* Grouped Locomotion Families (Modes + Associated Adjusters) */}
          {Object.entries(SPECIES_MOVEMENT_GROUPS).map(([groupKey, group]) => {
            const hasActiveModeInGroup = group.modes.some(m => selectedModes.includes(m.id));
            return (
              <div key={groupKey} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                {/* Family Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      {group.label}
                    </span>
                    {hasActiveModeInGroup && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {group.modes.length} Modes • {group.adjusters.length} Adjusters
                  </span>
                </div>

                {/* Base Modes for this family */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                    Base Modes
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.modes.map(mode => {
                      const isSelected = selectedModes.includes(mode.id);
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => toggleMovementMode(mode.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                              : 'bg-slate-900/60 border-slate-800 hover:border-purple-500/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-100">{mode.name}</span>
                              <span className="text-[9px] px-1 py-0.2 bg-purple-500/20 text-purple-300 rounded font-mono">
                                {mode.base_speed || mode.speed || 30} ft
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{mode.description}</span>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                              mode.bp > 0 ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {mode.bp > 0 ? `+${mode.bp} CP` : '0 CP'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Associated Speed & Mobility Adjusters for this family */}
                {group.adjusters.length > 0 && (
                  <div>
                    <span className="text-[10px] text-amber-300 font-bold uppercase block mb-1.5">
                      Associated Speed Adjusters (Additive to {groupKey})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.adjusters.map(adj => {
                        const isSelected = selectedModes.includes(adj.id);
                        return (
                          <button
                            key={adj.id}
                            type="button"
                            onClick={() => toggleMovementMode(adj.id)}
                            className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between ${
                              isSelected 
                                ? (adj.bp < 0 ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-amber-950/50 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]')
                                : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-100">{adj.name}</span>
                                {adj.speed_modifier !== undefined && adj.speed_modifier !== 0 && (
                                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                                    adj.speed_modifier > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                                  }`}>
                                    {adj.speed_modifier > 0 ? `+${adj.speed_modifier} ft` : `${adj.speed_modifier} ft`}
                                  </span>
                                )}
                                {adj.isExclusive && (
                                  <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">*Exclusive</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{adj.description}</span>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                                adj.bp > 0 ? 'bg-purple-500/20 text-purple-300' : (adj.bp < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400')
                              }`}>
                                {adj.bp > 0 ? `+${adj.bp} CP` : (adj.bp < 0 ? `${adj.bp} CP` : '0 CP')}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Disadvantages */}
      {activeTab === 'disadvantages' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto">
          {SPECIES_DISADVANTAGES.map(dis => {
            const isSelected = selectedDisadvantages.some(d => (typeof d === 'string' ? d : d?.id) === dis.id);
            return (
              <button
                key={dis.id}
                type="button"
                onClick={() => toggleDisadvantage(dis.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-red-950/40 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-red-500/40'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-100 block">{dis.name}</span>
                  <span className="text-[10px] text-slate-400">{dis.description}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    -{dis.refundBP} CP
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SpeciesTraitSelector;
