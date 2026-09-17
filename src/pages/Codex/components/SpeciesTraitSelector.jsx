import React, { useState, useMemo, useEffect } from 'react';
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
  Sliders,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  Filter,
  CheckCircle2
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
import { ALL_CANONICAL_TRAITS } from '../../../data/speciesTraitsData';
import { calculateSpeciesBP, calculateSpeciesCombatModifiers } from '../../../engines/tangentEntityEngines';
import { useDBM } from '../../../context/DBMContext';

export const SpeciesTraitSelector = ({ formData = {}, onChange }) => {
  const { dbData } = useDBM() || {};

  const [activeTab, setActiveTab] = useState('traits'); // 'traits', 'attributes', 'movement', 'disadvantages'
  const [traitTier, setTraitTier] = useState('all'); // 'all', 'basic', 'advanced', 'elite'
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullWindowCatalog, setIsFullWindowCatalog] = useState(false);

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

  // Keep parent form's CP in sync with calculated total
  useEffect(() => {
    if (bpData?.totalBPUsed !== undefined && formData.cp !== bpData.totalBPUsed) {
      onChange('cp', bpData.totalBPUsed);
      onChange('cp_cost', bpData.totalBPUsed);
    }
  }, [bpData.totalBPUsed, formData.cp, onChange]);

  // Attribute stepper
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

  // Comprehensive Omnicortex Traits Catalog
  const allAvailableTraits = useMemo(() => {
    const map = new Map();
    const addTrait = (t) => {
      const id = t.id || t.name;
      if (!id) return;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: t.name || id.replace(/^trait-/, '').replace(/-/g, ' '),
          bp: t.bp || t.costs?.bp || (t.tier === 'elite' ? 4 : t.tier === 'advanced' ? 2 : 1),
          tier: (t.trait_tier || t.tier || (t.bp === 4 ? 'elite' : t.bp === 2 ? 'advanced' : 'basic')).toLowerCase(),
          classification: t.classification || t.type || 'Physical',
          description: t.description || t.desc || t.mechanics || t.mechanic || 'Canonical biological trait effect.',
          modifiers: t.modifiers || []
        });
      }
    };

    // 1. Built-in constants
    SPECIES_TRAITS_BASIC.forEach(t => addTrait({ ...t, tier: 'basic', bp: 1 }));
    SPECIES_TRAITS_ADVANCED.forEach(t => addTrait({ ...t, tier: 'advanced', bp: 2 }));
    SPECIES_TRAITS_ELITE.forEach(t => addTrait({ ...t, tier: 'elite', bp: 4 }));

    // 2. Canonical traits dataset
    ALL_CANONICAL_TRAITS.forEach(addTrait);

    // 3. Omnicortex DBM traits
    const dbTraits = dbData?.traits || dbData?.species_traits || [];
    dbTraits.forEach(addTrait);

    return Array.from(map.values());
  }, [dbData]);

  // Unique classifications
  const availableClassifications = useMemo(() => {
    const set = new Set();
    allAvailableTraits.forEach(t => {
      if (t.classification) set.add(t.classification);
    });
    return Array.from(set).sort();
  }, [allAvailableTraits]);

  // Filtered traits
  const filteredTraits = useMemo(() => {
    return allAvailableTraits.filter(trait => {
      // Tier filter
      if (traitTier !== 'all') {
        const tTier = trait.tier.toLowerCase();
        if (traitTier === 'basic' && tTier !== 'basic') return false;
        if (traitTier === 'advanced' && tTier !== 'advanced') return false;
        if (traitTier === 'elite' && tTier !== 'elite') return false;
      }

      // Classification filter
      if (classificationFilter !== 'all') {
        if (trait.classification?.toLowerCase() !== classificationFilter.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = trait.name.toLowerCase().includes(q);
        const matchDesc = trait.description.toLowerCase().includes(q);
        const matchClass = (trait.classification || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchClass) return false;
      }

      return true;
    });
  }, [allAvailableTraits, traitTier, classificationFilter, searchQuery]);

  const bpPercent = Math.min(100, Math.round((bpData.totalBPUsed / bpData.budgetMax) * 100));

  // Resolved list of equipped traits objects
  const activeEquippedTraitsList = useMemo(() => {
    return selectedTraits.map(idOrObj => {
      const id = typeof idOrObj === 'object' && idOrObj !== null ? (idOrObj.id || idOrObj.name) : String(idOrObj);
      const match = allAvailableTraits.find(t => t.id === id || t.name.toLowerCase() === id.toLowerCase());
      return match || {
        id,
        name: id.replace(/^trait-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        bp: 1,
        classification: 'Trait',
        description: 'Equipped species trait.'
      };
    });
  }, [selectedTraits, allAvailableTraits]);

  // Render Trait Card
  const renderTraitCard = (trait) => {
    const isSelected = selectedTraits.some(t => (typeof t === 'string' ? t : t?.id) === trait.id);
    return (
      <button
        key={trait.id}
        type="button"
        onClick={() => toggleTrait(trait.id)}
        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 relative group cursor-pointer ${
          isSelected 
            ? 'bg-purple-950/70 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/50' 
            : 'bg-slate-950/70 border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-900/60'
        }`}
      >
        <div className="flex items-start justify-between gap-2 w-full">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-100 group-hover:text-purple-200 transition-colors">
                {trait.name}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                {trait.classification}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold shrink-0">
            {trait.bp} CP
          </span>
        </div>

        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
          {trait.description}
        </p>

        <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-800/60 text-[9.5px]">
          <span className="text-slate-500 uppercase font-mono tracking-wider">{trait.tier} Tier</span>
          {isSelected ? (
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <Check size={12} /> Active
            </span>
          ) : (
            <span className="text-slate-500 group-hover:text-purple-300 flex items-center gap-0.5">
              <Plus size={11} /> Select
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 text-slate-100 font-mono">
      {/* Top Header & Live CP Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
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

      {/* Tab 1: Racial Traits Catalog (Inline View) */}
      {activeTab === 'traits' && (
        <div className="space-y-3">
          {/* Controls Bar: Tier Pills, Classification, Search & Full-Window Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTraitTier('all')}
                  className={`px-2 py-1 rounded font-bold uppercase ${traitTier === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All ({allAvailableTraits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTraitTier('basic')}
                  className={`px-2 py-1 rounded font-bold uppercase ${traitTier === 'basic' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Basic (1 CP)
                </button>
                <button
                  type="button"
                  onClick={() => setTraitTier('advanced')}
                  className={`px-2 py-1 rounded font-bold uppercase ${traitTier === 'advanced' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Adv (2 CP)
                </button>
                <button
                  type="button"
                  onClick={() => setTraitTier('elite')}
                  className={`px-2 py-1 rounded font-bold uppercase ${traitTier === 'elite' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Elite (4 CP)
                </button>
              </div>

              <select
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                className="p-1 px-2 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-slate-300 font-mono focus:outline-none"
              >
                <option value="all">All Classifications</option>
                {availableClassifications.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search traits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 w-36 sm:w-48"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Full-Window Catalog Launcher */}
              <button
                type="button"
                onClick={() => setIsFullWindowCatalog(true)}
                className="px-2.5 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                title="Expand Traits Catalog to Full Window"
              >
                <Maximize2 size={13} />
                <span className="hidden sm:inline">Full Window</span>
              </button>
            </div>
          </div>

          {/* Traits Grid (Spacious Inline View) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredTraits.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-500">
                No traits found matching current filters.
              </div>
            ) : (
              filteredTraits.map(renderTraitCard)
            )}
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

      {/* Tab 3: Movement Modes & Locomotion */}
      {activeTab === 'movement' && (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
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

          {Object.entries(SPECIES_MOVEMENT_GROUPS).map(([groupKey, group]) => {
            const hasActiveModeInGroup = group.modes.some(m => selectedModes.includes(m.id));
            return (
              <div key={groupKey} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
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
                          className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
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
                            className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto">
          {SPECIES_DISADVANTAGES.map(dis => {
            const isSelected = selectedDisadvantages.some(d => (typeof d === 'string' ? d : d?.id) === dis.id);
            return (
              <button
                key={dis.id}
                type="button"
                onClick={() => toggleDisadvantage(dis.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
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

      {/* ── EXPANDED FULL-WINDOW TRAITS CATALOG MODAL ── */}
      {isFullWindowCatalog && (
        <div className="fixed inset-2 sm:inset-4 md:inset-6 z-[300] bg-[#070a12]/98 border border-purple-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl animate-fade-in font-mono">
          {/* Full Window Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/30 bg-purple-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Dna size={22} />
              </div>
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-purple-100 flex items-center gap-2">
                  <span>Omnicortex Species Traits Catalog</span>
                  <span className="text-xs font-normal text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-500/40">
                    {allAvailableTraits.length} Canonical Traits
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select biological, sensory, combat, and metaphysical genetic traits for this species chassis.
                </p>
              </div>
            </div>

            {/* Live CP Progress & Close */}
            <div className="flex items-center gap-4">
              <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Budget</span>
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

              <button
                type="button"
                onClick={() => setIsFullWindowCatalog(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close Full Window Catalog"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Full Window Filters Bar */}
          <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Filter size={13} /> Tier:
              </span>
              <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-700 text-xs">
                {[
                  { id: 'all', label: `All (${allAvailableTraits.length})` },
                  { id: 'basic', label: 'Basic (1 CP)' },
                  { id: 'advanced', label: 'Advanced (2 CP)' },
                  { id: 'elite', label: 'Elite (4 CP)' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTraitTier(t.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold uppercase cursor-pointer transition-all ${
                      traitTier === t.id ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold text-slate-400 ml-2">Type:</span>
              <select
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                className="p-1.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:border-purple-400 focus:outline-none"
              >
                <option value="all">All Classifications</option>
                {availableClassifications.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, rule, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Full Window Two-Column Body: Catalog Grid + Pinned Active Drawer */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Main Grid Viewport */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredTraits.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-500">
                  <Search size={36} className="mb-3 opacity-40 text-purple-400" />
                  <p className="text-sm font-bold">No traits matching current criteria</p>
                  <p className="text-xs text-slate-600 mt-1">Try resetting the search or filter pills.</p>
                </div>
              ) : (
                filteredTraits.map(renderTraitCard)
              )}
            </div>

            {/* Pinned Active Traits Sidebar */}
            <aside className="w-80 shrink-0 border-l border-slate-800 bg-[#06080e] p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Equipped Traits ({activeEquippedTraitsList.length})
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {bpData.breakdown?.traitsBP || 0} CP Total
                  </span>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {activeEquippedTraitsList.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-xs italic">
                      No traits currently equipped.<br />Click any card on the left to select.
                    </div>
                  ) : (
                    activeEquippedTraitsList.map(t => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 flex items-center justify-between gap-2 group hover:border-purple-400 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-200 block truncate">{t.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{t.classification} • {t.bp} CP</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleTrait(t.id)}
                          className="p-1 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove trait"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Commit Action */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsFullWindowCatalog(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                >
                  Done & Return to Studio
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeciesTraitSelector;
