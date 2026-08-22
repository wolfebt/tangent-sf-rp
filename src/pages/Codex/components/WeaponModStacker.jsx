import React, { useState } from 'react';
import { 
  Crosshair, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Check, 
  Zap, 
  ShieldAlert, 
  Maximize2, 
  Flame, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  WEAPON_SIZES,
  WEAPON_MODIFICATIONS, 
  WEAPON_CAPACITY_UPGRADES, 
  WEAPON_DOWNGRADES,
  MANUFACTURER_SKINS 
} from '../../../engines/tangentConstants';
import { calculateWeaponSockets } from '../../../engines/tangentItemEngines';

export const WeaponModStacker = ({
  formData = {},
  onChange = () => {}
}) => {
  const [activeCategory, setActiveCategory] = useState('Optics');

  const size = formData.size || 'Medium';
  const modifications = Array.isArray(formData.modifications) ? formData.modifications : [];
  const downgrades = Array.isArray(formData.downgrades) ? formData.downgrades : [];
  const capacityUpgrade = formData.capacity_upgrade || 'typical';
  const skin = formData.faction_skin || formData.skin || 'Syndicate';
  const metaRanks = formData.meta_ranks || 0;

  const socketStats = calculateWeaponSockets(size, modifications);

  const categories = ['Optics', 'Muzzle', 'Frame', 'Payload', 'Capacity', 'Flaws', 'Meta-Tech'];

  const isModSelected = (modId) => {
    return modifications.some(m => (typeof m === 'object' ? m.id === modId : m === modId));
  };

  const isDowngradeSelected = (dwId) => {
    return downgrades.some(d => (typeof d === 'object' ? d.id === dwId : d === dwId));
  };

  const handleToggleMod = (mod) => {
    if (isModSelected(mod.id)) {
      const updated = modifications.filter(m => (typeof m === 'object' ? m.id !== mod.id : m !== mod.id));
      onChange('modifications', updated);
    } else {
      onChange('modifications', [...modifications, mod.id]);
    }
  };

  const handleToggleDowngrade = (dw) => {
    if (isDowngradeSelected(dw.id)) {
      const updated = downgrades.filter(d => (typeof d === 'object' ? d.id !== dw.id : d !== dw.id));
      onChange('downgrades', updated);
    } else {
      onChange('downgrades', [...downgrades, dw.id]);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl font-mono text-xs text-slate-200">
      {/* Header with Socket Capacity Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Crosshair size={16} className="text-orange-400" />
          <span className="font-bold uppercase tracking-wider text-white">Weapon Chassis & Mod Stacker</span>
        </div>

        {/* Live Socket Meter Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase">UDU Sockets:</span>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-bold ${
            socketStats.isOverBudget 
              ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
              : socketStats.remainingSockets === 0
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
          }`}>
            <span>{socketStats.usedSockets} / {socketStats.baseSockets} Used</span>
            {socketStats.isOverBudget && <AlertTriangle size={12} className="text-red-400" />}
          </div>
        </div>
      </div>

      {/* Weapon Frame Size & Handedness Selector */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
          Chassis Size Category & Base Sockets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.values(WEAPON_SIZES).map((ws) => {
            const isSelected = size === ws.id;
            return (
              <button
                key={ws.id}
                type="button"
                onClick={() => {
                  onChange('size', ws.id);
                  onChange('component_slots', ws.sockets);
                  if (formData.base_dc === undefined || formData.base_dc === null) {
                    onChange('base_dc', ws.defaultDC);
                  }
                }}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-950/80 border-orange-500 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.25)] font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{ws.name}</div>
                <div className="text-[10px] text-orange-400 mt-0.5">{ws.sockets} Socket{ws.sockets !== 1 ? 's' : ''}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Base DC {ws.defaultDC} • {ws.handedness}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/80 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-orange-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Category Content: Standard Mods */}
      {['Optics', 'Muzzle', 'Frame', 'Payload'].includes(activeCategory) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
          {WEAPON_MODIFICATIONS.filter(m => m.category === activeCategory).map((mod) => {
            const selected = isModSelected(mod.id);
            return (
              <div
                key={mod.id}
                onClick={() => handleToggleMod(mod)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  selected
                    ? 'bg-orange-950/70 border-orange-500 text-orange-200 shadow-sm'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{mod.name}</span>
                    <span className="text-[10px] text-orange-400 font-bold">+{mod.dcMod} DC</span>
                    <span className="text-[9px] text-slate-500">TL{mod.tl}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{mod.effect}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {mod.sockets} Skt
                  </span>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                    selected ? 'bg-orange-500 border-orange-400 text-white' : 'border-slate-700 bg-slate-950 text-transparent'
                  }`}>
                    <Check size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Content: Capacity Upgrades */}
      {activeCategory === 'Capacity' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {WEAPON_CAPACITY_UPGRADES.map((cap) => {
            const isSelected = capacityUpgrade === cap.id;
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => onChange('capacity_upgrade', cap.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-950/80 border-orange-500 text-orange-200 shadow-sm font-bold'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{cap.name}</span>
                  <span className="text-orange-400 font-bold">+{cap.dcMod} DC</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Capacity Multiplier: {cap.multiplier}x</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Category Content: Flaws / Downgrades */}
      {activeCategory === 'Flaws' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {WEAPON_DOWNGRADES.map((dw) => {
            const selected = isDowngradeSelected(dw.id);
            return (
              <div
                key={dw.id}
                onClick={() => handleToggleDowngrade(dw)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  selected
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{dw.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">{dw.dcMod} DC</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{dw.effect}</p>
                </div>

                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                  selected ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700 bg-slate-950 text-transparent'
                }`}>
                  <Check size={12} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Content: Meta-Tech Imbuements */}
      {activeCategory === 'Meta-Tech' && (
        <div className="space-y-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <Sparkles size={15} />
              <span>Metaphysical Invocation Imbuement</span>
            </div>
            <span className="text-[10px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/40">
              Rank {metaRanks}
            </span>
          </div>

          <p className="text-[10px] text-slate-400">
            Hard-codes a metaphysical Invocation into the weapon chassis (15 + Rank + TL Mod DC).
          </p>

          <div className="flex items-center gap-4 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
            <input
              type="range"
              min="0"
              max="30"
              value={metaRanks}
              onChange={(e) => onChange('meta_ranks', Number(e.target.value))}
              className="flex-1 accent-purple-400 cursor-pointer"
            />
            <span className="w-12 text-center text-xs font-bold text-purple-300 bg-purple-950 px-2 py-1 rounded border border-purple-500/40 font-mono">
              R{metaRanks}
            </span>
          </div>
        </div>
      )}

      {/* Cultural Manufacturer Skin Footer */}
      <div className="p-3 bg-slate-900/40 border border-slate-800/90 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-purple-400 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-slate-300 uppercase">Manufacturer Paradigm:</span>
            <div className="text-xs font-bold text-purple-300 mt-0.5">
              {MANUFACTURER_SKINS[skin]?.name || skin}
            </div>
          </div>
        </div>

        <select
          value={skin}
          onChange={(e) => {
            onChange('faction_skin', e.target.value);
            onChange('skin', e.target.value);
          }}
          className="p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-400 transition-colors cursor-pointer w-full sm:w-auto"
        >
          {Object.values(MANUFACTURER_SKINS).map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.dcMod !== 0 ? `${m.dcMod} DC` : '0 DC'})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default WeaponModStacker;
