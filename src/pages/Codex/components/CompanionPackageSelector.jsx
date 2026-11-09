import React, { useMemo, useState } from 'react';
import { 
  HeartHandshake, 
  Shield, 
  Crosshair, 
  Activity, 
  Radio, 
  Cpu, 
  Sparkles, 
  Zap, 
  Check, 
  Plus, 
  Minus, 
  Sliders
} from 'lucide-react';
import { 
  COMPANION_TYPES, 
  COMPANION_FORM_PACKAGES, 
  COMPANION_FUNCTION_PACKAGES, 
  COMPANION_CONTROL_INTERFACES, 
  COMPANION_BOND_FEATURES, 
  THREAT_TIER_CHASSIS,
  SPECIES_SIZES 
} from '../../../engines/tangentConstants';
import { calculateCompanionBP, calculateCompanionStats } from '../../../engines/tangentEntityEngines';

const CANONICAL_BOND_OPTIONS = [
  { id: 'familiar', alias: 'familiar_link', name: 'Familiar (Empathic Link)', bonusCP: 20, cpCost: 0, effect: 'Grants +20 CP to Companion Budget; know companion distance, direction, and status anywhere on planet' },
  { id: 'mind_link', name: 'Mind Link (Telepathic)', bonusCP: 10, cpCost: 0, effect: 'Grants +10 CP to Companion Budget; silent telepathic communication and Free Action commands' },
  { id: 'shared_senses', name: 'Shared Senses', bonusCP: 10, cpCost: 0, effect: 'Grants +10 CP to Companion Budget; see and hear through companion senses' },
  { id: 'loyal_protector', name: 'Loyal Protector (Interception)', bonusCP: 0, cpCost: 3, effect: 'Costs 3 CP from Companion Budget; adjacent companion takes hits meant for master as a reaction' }
];

const CANONICAL_5_FUNCTION_PACKAGES = COMPANION_FUNCTION_PACKAGES.slice(0, 5);

export const CompanionPackageSelector = ({ formData = {}, onChange }) => {
  const [activeTab, setActiveTab] = useState('form'); // 'form', 'functions', 'bonds'

  const companionRank = Number(formData.companion_rank || formData.companionRank || 1);
  const ownerTier = Number(formData.owner_tier || formData.ownerTier || 1);
  const selectedType = formData.companion_type || formData.type || 'Biological';
  const selectedForm = formData.form_package || formData.form || 'canine';
  const selectedFunctions = Array.isArray(formData.function_packages) ? formData.function_packages : (formData.functions || ['guardian_attack']);
  const selectedBonds = Array.isArray(formData.bonds) ? formData.bonds : (formData.extra_features || []);
  const selectedSize = formData.size || 'Medium';
  const selectedControl = formData.control_interface || formData.control_method || 'voice_gesture';

  // Canonical 40 CP Base Budget + Bond Bonuses (+20 Familiar, +10 Mind Link, +10 Shared Senses)
  const bpData = useMemo(() => {
    const rawEngine = calculateCompanionBP({
      form: selectedForm,
      functions: selectedFunctions,
      extraFeatures: selectedBonds,
      size: selectedSize,
      companionRank
    });

    const rank = Math.max(1, Number(companionRank || 1));
    const baseBudget = 40 + (rank - 1) * 10;

    const hasFamiliar = selectedBonds.includes('familiar') || selectedBonds.includes('familiar_link');
    const hasMindLink = selectedBonds.includes('mind_link');
    const hasSharedSenses = selectedBonds.includes('shared_senses');
    const bondBonusCP = (hasFamiliar ? 20 : 0) + (hasMindLink ? 10 : 0) + (hasSharedSenses ? 10 : 0);

    const maxBudget = baseBudget + bondBonusCP;

    const formDef = COMPANION_FORM_PACKAGES.find(f => f.id === selectedForm) || COMPANION_FORM_PACKAGES[0];
    const formCP = Number(formDef?.cpCost ?? formDef?.baseBP ?? 15);

    const functionsCP = selectedFunctions.reduce((sum, fId) => {
      const funcDef = COMPANION_FUNCTION_PACKAGES.find(f => f.id === fId);
      return sum + Number(funcDef?.cpCost ?? funcDef?.bpCost ?? 10);
    }, 0);

    const extraFeatureCP = selectedBonds.reduce((sum, bId) => {
      if (bId === 'familiar' || bId === 'familiar_link' || bId === 'mind_link' || bId === 'shared_senses') {
        return sum;
      }
      const bondDef = COMPANION_BOND_FEATURES.find(b => b.id === bId);
      const cost = Number(bondDef?.cpCost ?? bondDef?.bpCost ?? 0);
      return sum + (cost > 0 ? cost : 0);
    }, 0);

    const totalBPUsed = formCP + functionsCP + extraFeatureCP;
    const bpRemaining = maxBudget - totalBPUsed;

    return {
      ...rawEngine,
      baseBudget,
      bondBonusCP,
      maxBudget,
      formCP,
      functionsCP,
      extraFeatureCP,
      totalBPUsed,
      bpRemaining,
      isOverBudget: totalBPUsed > maxBudget
    };
  }, [selectedForm, selectedFunctions, selectedBonds, selectedSize, companionRank]);

  // Canonical 30 Vitality / 30 Health (60 SP Synthetic) base pools + Owner Tier scaling
  const stats = useMemo(() => {
    const rawStats = calculateCompanionStats({
      ownerTier,
      type: selectedType,
      form: selectedForm,
      functions: selectedFunctions,
      size: selectedSize,
      companionRank
    });
    const oTier = Math.min(20, Math.max(1, Math.round(Number(ownerTier || 1))));
    const tierChassis = THREAT_TIER_CHASSIS?.[oTier] || { vitHeaBonus: 0 };
    const canonicalBasePool = 30 + Number(tierChassis.vitHeaBonus || 0);

    return {
      ...rawStats,
      vitality: selectedType === 'Biological' ? canonicalBasePool : 0,
      health: selectedType === 'Synthetic' ? 0 : canonicalBasePool,
      structurePoints: selectedType === 'Synthetic' ? canonicalBasePool * 2 : 0,
      essence: selectedType === 'Metaphysical' ? canonicalBasePool : 0
    };
  }, [ownerTier, selectedType, selectedForm, selectedFunctions, selectedSize, companionRank]);

  const toggleFunction = (funcId) => {
    const exists = selectedFunctions.includes(funcId);
    let updated;
    if (exists) {
      updated = selectedFunctions.filter(f => f !== funcId);
      if (updated.length === 0) updated = ['guardian_attack'];
    } else {
      updated = [...selectedFunctions, funcId];
    }
    onChange('function_packages', updated);
    onChange('functions', updated);
  };

  const toggleBond = (bondId) => {
    const isFamiliar = bondId === 'familiar' || bondId === 'familiar_link';
    const exists = isFamiliar
      ? (selectedBonds.includes('familiar') || selectedBonds.includes('familiar_link'))
      : selectedBonds.includes(bondId);
    let updated;
    if (exists) {
      updated = selectedBonds.filter(b => (isFamiliar ? (b !== 'familiar' && b !== 'familiar_link') : b !== bondId));
    } else {
      updated = [...selectedBonds, isFamiliar ? 'familiar' : bondId];
    }
    onChange('bonds', updated);
    onChange('extra_features', updated);
  };

  const bpPercent = Math.min(100, Math.round((bpData.totalBPUsed / bpData.maxBudget) * 100));

  return (
    <div className="bg-slate-900/90 border border-pink-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-5 text-slate-100 font-mono">
      {/* Top Header & Live BP Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-pink-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/50 flex items-center justify-center text-pink-400">
            <HeartHandshake size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-pink-200">
              Companion Forge & Entity Chassis
            </h3>
            <p className="text-[11px] text-slate-400">
              Rank <span className="text-pink-300 font-bold">{companionRank}</span> Cohort • Owner Threat Tier <span className="text-amber-400 font-bold">Tier {ownerTier}</span>
            </p>
          </div>
        </div>

        {/* Live CP Progress Meter */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Companion CP ({bpData.baseBudget} Base{bpData.bondBonusCP > 0 ? ` + ${bpData.bondBonusCP} Bond` : ''})
            </span>
            <span className={`text-sm font-bold ${bpData.isOverBudget ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {bpData.totalBPUsed} / {bpData.maxBudget} CP
            </span>
          </div>
          <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${
                bpData.isOverBudget ? 'bg-red-500' : (bpPercent > 80 ? 'bg-amber-400' : 'bg-pink-500')
              }`}
              style={{ width: `${Math.min(100, bpPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Owner Tier & Companion Rank Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Companion Rank */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Companion Feature Rank</span>
            <span className="text-pink-400 font-bold">Rank {companionRank} ({bpData.maxBudget} CP)</span>
          </label>
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => onChange('companion_rank', Math.max(1, companionRank - 1))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <Minus size={13} />
            </button>
            <span className="text-base font-bold font-mono text-pink-300">{companionRank}</span>
            <button
              type="button"
              onClick={() => onChange('companion_rank', companionRank + 1)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Owner Character Tier */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Owner's Threat Tier</span>
            <span className="text-amber-400 font-bold">Tier {ownerTier}</span>
          </label>
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                const newTier = Math.max(1, ownerTier - 1);
                onChange('owner_tier', newTier);
                onChange('ownerTier', newTier);
              }}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <Minus size={13} />
            </button>
            <span className="text-base font-bold font-mono text-amber-300">{ownerTier}</span>
            <button
              type="button"
              onClick={() => {
                const newTier = Math.min(20, ownerTier + 1);
                onChange('owner_tier', newTier);
                onChange('ownerTier', newTier);
              }}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Chassis Type */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">
            Chassis Nature
          </label>
          <select
            value={selectedType}
            onChange={(e) => {
              onChange('companion_type', e.target.value);
              onChange('type', e.target.value);
            }}
            className="w-full p-1.5 bg-slate-900 border border-pink-500/40 rounded-lg text-xs text-pink-200 focus:outline-none focus:border-pink-400 mt-1"
          >
            {Object.keys(COMPANION_TYPES).map(t => (
              <option key={t} value={t}>{COMPANION_TYPES[t].name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'form' 
              ? 'border-pink-400 text-pink-300 bg-pink-950/20' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap size={13} />
          <span>Form Packages</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('functions')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'functions' 
              ? 'border-pink-400 text-pink-300 bg-pink-950/20' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={13} />
          <span>Function Packages ({selectedFunctions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bonds')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'bonds' 
              ? 'border-pink-400 text-pink-300 bg-pink-950/20' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={13} />
          <span>Bond Features ({selectedBonds.length})</span>
        </button>
      </div>

        {/* Tab 1: 12 Canonical Form Packages (15 CP each) */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {COMPANION_FORM_PACKAGES.slice(0, 12).map(form => {
            const isSelected = selectedForm === form.id;
            const formCost = form.cpCost ?? form.baseBP ?? 15;
            return (
              <button
                key={form.id}
                type="button"
                onClick={() => {
                  onChange('form_package', form.id);
                  onChange('form', form.id);
                  onChange('size', form.size);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected 
                    ? 'bg-pink-950/60 border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.2)]' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-pink-500/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-100">{form.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">
                    {formCost} CP
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5">
                  <div>Type: <span className="text-slate-200">{form.type}</span> • Size: <span className="text-slate-200">{form.size}</span></div>
                  <div className="text-[9px] text-pink-300/80">{form.bonusFeatures?.join(' • ')}</div>
                </div>
                <div className="flex items-center justify-between w-full pt-1 border-t border-slate-800/60 text-[9px]">
                  <span className="text-slate-500">Str +{form.stats?.str} / Agi +{form.stats?.agi} / Sta +{form.stats?.sta}</span>
                  {isSelected && <span className="text-emerald-400 flex items-center gap-0.5 font-bold"><Check size={10} /> Active</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab 2: 5 Canonical Function Packages (10 CP each) */}
      {activeTab === 'functions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CANONICAL_5_FUNCTION_PACKAGES.map(func => {
            const isSelected = selectedFunctions.includes(func.id);
            const funcCost = func.cpCost ?? func.bpCost ?? 10;
            return (
              <button
                key={func.id}
                type="button"
                onClick={() => toggleFunction(func.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-pink-950/60 border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.2)]' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-pink-500/40'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-100 block">{func.name}</span>
                  <span className="text-[10px] text-slate-400">{func.keySkills?.join(' • ')}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300">
                    {funcCost} CP
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab 3: Bond Features (Add to 40 CP Base Budget) */}
      {activeTab === 'bonds' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CANONICAL_BOND_OPTIONS.map(bond => {
            const isSelected = bond.id === 'familiar'
              ? (selectedBonds.includes('familiar') || selectedBonds.includes('familiar_link'))
              : selectedBonds.includes(bond.id);
            return (
              <button
                key={bond.id}
                type="button"
                onClick={() => toggleBond(bond.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-pink-950/60 border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.2)]' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-pink-500/40'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-100 block">{bond.name}</span>
                  <span className="text-[10px] text-slate-400">{bond.effect}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  {bond.bonusCP > 0 ? (
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      +{bond.bonusCP} CP Budget
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300">
                      {bond.cpCost} CP Cost
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Live Calculated Companion Combat Stat Block */}
      <div className="p-4 bg-slate-950/90 rounded-xl border border-pink-500/30 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-pink-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-pink-200">
              Live Companion Stat Block (Owner Tier {ownerTier} Scaling)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Hardpoints: <span className="text-pink-300 font-bold">{stats.hardpoints.count} {stats.hardpoints.tier}</span>
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
          {/* Integrity */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">{stats.integrityType.split(' ')[0]}</span>
            <span className="text-sm font-bold text-pink-400 font-mono">
              {selectedType === 'Synthetic' ? `${stats.structurePoints} SP` : (selectedType === 'Metaphysical' ? `${stats.essence} Essence` : `${stats.vitality} Vit / ${stats.health} HP`)}
            </span>
          </div>

          {/* Defense */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Defense DC</span>
            <span className="text-sm font-bold text-sky-300 font-mono">{stats.defenseDC}</span>
          </div>

          {/* Attack */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Attack Bonus</span>
            <span className="text-sm font-bold text-amber-400 font-mono">+{stats.attackBonus}</span>
          </div>

          {/* DR */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Expected DR</span>
            <span className="text-sm font-bold text-slate-200 font-mono">DR {stats.dr}</span>
          </div>

          {/* Speed */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Movement</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{stats.speed}</span>
          </div>

          {/* Actions */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Actions</span>
            <span className="text-sm font-bold text-pink-300 font-mono">{stats.actionsPerRound} / rnd</span>
          </div>
        </div>

        {/* Recovery Method */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span>Recovery: <span className="text-slate-200">{stats.recoveryMethod}</span></span>
          <span>Fuel / Fuel Source: <span className="text-slate-200">{COMPANION_TYPES[selectedType]?.fuel}</span></span>
        </div>
      </div>
    </div>
  );
};

export default CompanionPackageSelector;
