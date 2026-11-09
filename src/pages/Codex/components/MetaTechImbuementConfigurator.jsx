import React, { useMemo } from 'react';
import { 
  Zap, 
  Sparkles, 
  Hammer, 
  Coins, 
  Maximize2, 
  Layers, 
  Check, 
  Sliders, 
  ShieldCheck, 
  Activity, 
  AlertTriangle 
} from 'lucide-react';
import { 
  META_TECH_ENHANCEMENT_TYPES, 
  META_TECH_PASSIVE_CATALOG, 
  META_TECH_SCALE_AMPLIFICATION, 
  META_TECH_SOCKET_LIMITS 
} from '../../../engines/tangentConstants';
import { calculateMetaTechDC, calculateMetaTechCapacity } from '../../../engines/tangentEntityEngines';
import { calculateCreditValue, calculateMaterialCost } from '../../../engines/tangentEconEngine';

export const MetaTechImbuementConfigurator = ({ formData = {}, onChange }) => {
  const selectedType = formData.enhancement_type || formData.enhancementType || 'Active';
  const baseItemDC = Number(formData.base_item_dc ?? formData.baseItemDC ?? 15);
  const invocationRank = Number(formData.invocation_rank ?? formData.invocationRank ?? 10);
  const techLevel = Number(formData.tech_level ?? formData.tl ?? 3);
  const socketsUsed = Number(formData.sockets_used ?? formData.socketsUsed ?? (invocationRank > 20 ? 3 : (invocationRank > 10 ? 2 : 1)));
  const dailyCharges = formData.daily_charges ?? null;
  const selectedScale = formData.scale_tier || 'Personal';
  const selectedPassives = Array.isArray(formData.passive_mods) ? formData.passive_mods : [];

  // DC & Capacity Calculation
  const finalDC = useMemo(() => {
    return calculateMetaTechDC({
      enhancementType: selectedType,
      baseItemDC,
      invocationRank,
      tl: techLevel,
      socketsUsed,
      dailyCharges
    });
  }, [selectedType, baseItemDC, invocationRank, techLevel, socketsUsed, dailyCharges]);

  const capacityData = useMemo(() => {
    return calculateMetaTechCapacity({
      socketsUsed,
      invocationRank,
      scaleTier: selectedScale
    });
  }, [socketsUsed, invocationRank, selectedScale]);

  const creditValue = useMemo(() => calculateCreditValue(finalDC), [finalDC]);
  const materialCost = useMemo(() => calculateMaterialCost(creditValue), [creditValue]);

  const togglePassiveMod = (modId) => {
    const exists = selectedPassives.includes(modId);
    let updated;
    if (exists) {
      updated = selectedPassives.filter(m => m !== modId);
    } else {
      updated = [...selectedPassives, modId];
    }
    const totalSockets = updated.reduce((sum, id) => {
      const modDef = META_TECH_PASSIVE_CATALOG.find(m => m.id === id);
      const skt = modDef?.sockets ?? ((id === 'ghost_strike' || id === 'vampiric' || String(id).toLowerCase().includes('ghost') || String(id).toLowerCase().includes('vampiric')) ? 2 : 1);
      return sum + Number(skt);
    }, 0);
    onChange('passive_mods', updated);
    onChange('sockets_used', Math.max(1, totalSockets));
    onChange('socketsUsed', Math.max(1, totalSockets));
  };

  const handleEnhancementTypeChange = (type) => {
    onChange('enhancement_type', type);
    onChange('enhancementType', type);
    onChange('craft_dc', finalDC);
  };

  return (
    <div className="bg-slate-900/90 border border-yellow-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-5 text-slate-100 font-mono">
      {/* Top Header: Meta-Tech Classification & Live DC */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-yellow-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-yellow-200">
              Meta-Tech & Imbuement Synthesis Engine
            </h3>
            <p className="text-[11px] text-slate-400">
              Mode: <span className="text-yellow-300 font-bold">{META_TECH_ENHANCEMENT_TYPES[selectedType]?.name || selectedType}</span>
            </p>
          </div>
        </div>

        {/* Live Market Value & Final DC */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Synthesis DC</span>
            <span className="text-sm font-bold text-amber-400 font-mono">
              DC {finalDC}
            </span>
          </div>
          <div className="text-right border-l border-slate-700 pl-3">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Credit Value</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {creditValue.toLocaleString()} Cr
            </span>
          </div>
        </div>
      </div>

      {/* Enhancement Type Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.keys(META_TECH_ENHANCEMENT_TYPES).map(typeKey => {
          const typeDef = META_TECH_ENHANCEMENT_TYPES[typeKey];
          const isSelected = selectedType === typeKey;
          return (
            <button
              key={typeKey}
              type="button"
              onClick={() => handleEnhancementTypeChange(typeKey)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected 
                  ? 'bg-yellow-950/70 border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.2)]' 
                  : 'bg-slate-950/60 border-slate-800 hover:border-yellow-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100">{typeDef.name.split(' (')[0]}</span>
                {isSelected && <Check size={12} className="text-yellow-400" />}
              </div>
              <p className="text-[9px] text-slate-400 line-clamp-2 mt-1">
                {typeDef.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Capacity & Sockets Tracker */}
      <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase flex items-center gap-1.5">
            <Layers size={13} className="text-yellow-400" />
            <span>UDU Capacity System ({capacityData.capacityUnit} Scale)</span>
          </span>
          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
            capacityData.isOverloaded 
              ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' 
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
          }`}>
            {capacityData.capacityStatus}: {socketsUsed} {capacityData.capacityUnit}s (Max Rank {capacityData.maxAllowedRank})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
          <div>1 Socket: <span className="text-slate-200">Up to Rank 10 (Trained)</span></div>
          <div>2 Sockets: <span className="text-slate-200">Up to Rank 20 (Master)</span></div>
          <div>3 Sockets / Mount: <span className="text-slate-200">Up to Rank 30 (Pinnacle)</span></div>
        </div>
      </div>

      {/* Base Item DC & Daily Charges / Usage Mode Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-bold text-slate-400">
              Host Item Base Craft DC (base_item_dc)
            </label>
            <span className="text-xs font-bold text-yellow-300">DC {baseItemDC}</span>
          </div>
          <input
            type="number"
            min="5"
            max="60"
            value={baseItemDC}
            onChange={(e) => {
              const nextDc = Math.max(5, Number(e.target.value) || 5);
              onChange('base_item_dc', nextDc);
              onChange('baseItemDC', nextDc);
            }}
            className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
          />
        </div>

        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">
            Charge / Usage Mode (daily_charges)
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'Unlimited', val: null, label: 'Unlimited (At-Will)' },
              { id: '3/day', val: 3, label: '3/day Limited (-5 DC)' },
              { id: 'Consumable', val: 1, label: 'Consumable Single-Use (-50%)' }
            ].map(chOpt => {
              const isSelected = (dailyCharges ?? null) === chOpt.val;
              return (
                <button
                  key={chOpt.id}
                  type="button"
                  onClick={() => onChange('daily_charges', chOpt.val)}
                  className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {chOpt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Type Specific Fields */}
      {selectedType === 'Passive' && (
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">
            Passive Matter & Force Enhancements (+5 DC per Socket)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {META_TECH_PASSIVE_CATALOG.map(mod => {
              const isSelected = selectedPassives.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => togglePassiveMod(mod.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                    isSelected 
                      ? 'bg-yellow-950/60 border-yellow-400 shadow-sm' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-yellow-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{mod.name}</span>
                    <span className="text-[9px] font-mono font-bold text-yellow-300">+{mod.dcMod} DC</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{mod.effect}</p>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-800/60 pt-1">
                    <span>{mod.discipline}</span>
                    <span className="text-yellow-400">{mod.targetType}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedType !== 'Passive' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Installed Invocation Rank */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
              <span>Installed Invocation Rank</span>
              <span className="text-yellow-300 font-bold font-mono">Rank {invocationRank}</span>
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={invocationRank}
              onChange={(e) => {
                const r = Number(e.target.value);
                onChange('invocation_rank', r);
                onChange('invocationRank', r);
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>Rank 1 (Novice)</span>
              <span>Rank 15 (Expert)</span>
              <span>Rank 30 (Pinnacle)</span>
            </div>
          </div>

          {/* Scale Amplification */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Scale Multiplier ({META_TECH_SCALE_AMPLIFICATION[selectedScale]?.multiplier}x)
            </label>
            <select
              value={selectedScale}
              onChange={(e) => onChange('scale_tier', e.target.value)}
              className="w-full p-2 bg-slate-900 border border-yellow-500/40 rounded-lg text-xs text-yellow-200 focus:outline-none focus:border-yellow-400"
            >
              {Object.keys(META_TECH_SCALE_AMPLIFICATION).map(s => (
                <option key={s} value={s}>{META_TECH_SCALE_AMPLIFICATION[s].name}</option>
              ))}
            </select>
          </div>

          {/* Device Save CR & Target Save */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 flex flex-col justify-between">
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Device Power Rating (10 + Rank/2 + Device Tier)
            </label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Device Save CR:</span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                DC {10 + Math.floor(invocationRank / 2) + techLevel}
              </span>
            </div>
            <div className="text-[9px] text-slate-500">
              Save CR = 10 + ⌊Rank {invocationRank} / 2⌋ + Device Tier {techLevel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaTechImbuementConfigurator;
