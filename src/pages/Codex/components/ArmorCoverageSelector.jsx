import React, { useState } from 'react';
import { 
  Shield, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Layers, 
  Sparkles, 
  Heart, 
  Wind, 
  Zap 
} from 'lucide-react';
import { 
  ARMOR_COVERAGE, 
  ARMOR_MATERIALS, 
  ARMOR_MODULES, 
  CARRIED_SHIELDS,
  MANUFACTURER_SKINS 
} from '../../../engines/tangentConstants';
import { 
  calculateArmorSP, 
  calculateArmorDR, 
  calculateArmorMobility, 
  calculateArmorSockets 
} from '../../../engines/tangentItemEngines';

export const ArmorCoverageSelector = ({
  formData = {},
  onChange = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('Coverage');

  const size = formData.size || formData.category || 'Mediumweight';
  const coverage = formData.coverage || 'Standard';
  const tl = Number(formData.tl ?? 3);
  const skin = formData.faction_skin || formData.skin || 'Syndicate';
  const modules = Array.isArray(formData.modules) ? formData.modules : [];
  const carriedShield = formData.carried_shield || 'None';
  const bodyLocations = Array.isArray(formData.body_locations) 
    ? formData.body_locations 
    : ['Torso', 'Head', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg'];

  const computedSP = calculateArmorSP({
    baseSP: formData.durability,
    size,
    coverage,
    tl,
    skin
  });

  const computedDR = calculateArmorDR({
    baseDR: formData.dr_rating,
    tl,
    skin
  });

  const mobilityStats = calculateArmorMobility({
    size,
    coverage,
    skin
  });

  const socketStats = calculateArmorSockets({
    size,
    coverage,
    modules
  });

  const isModuleSelected = (modId) => {
    return modules.some(m => (typeof m === 'object' ? m.id === modId : m === modId));
  };

  const handleToggleModule = (mod) => {
    if (isModuleSelected(mod.id)) {
      const updated = modules.filter(m => (typeof m === 'object' ? m.id !== mod.id : m !== mod.id));
      onChange('modules', updated);
    } else {
      onChange('modules', [...modules, mod.id]);
    }
  };

  const handleToggleLocation = (loc) => {
    if (bodyLocations.includes(loc)) {
      onChange('body_locations', bodyLocations.filter(l => l !== loc));
    } else {
      onChange('body_locations', [...bodyLocations, loc]);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl font-mono text-xs text-slate-200">
      {/* Header with Live Defense Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-emerald-400" />
          <span className="font-bold uppercase tracking-wider text-white">Armor Chassis & Coverage Forge</span>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1">
            <Heart size={11} className="text-emerald-400" />
            <span>{computedSP} SP</span>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold flex items-center gap-1">
            <ShieldAlert size={11} className="text-cyan-400" />
            <span>{computedDR.totalDR} DR ({computedDR.drPercent}%)</span>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300 font-bold flex items-center gap-1">
            <Wind size={11} className="text-purple-400" />
            <span>Max Dex +{mobilityStats.maxDex}</span>
          </span>
          <div className={`px-2.5 py-1 rounded-xl border font-bold ${
            socketStats.isOverBudget 
              ? 'bg-red-950 border-red-500 text-red-300 animate-pulse' 
              : 'bg-slate-900 border-slate-700 text-slate-300'
          }`}>
            <span>{socketStats.usedSockets} / {socketStats.baseSockets} Sockets</span>
          </div>
        </div>
      </div>

      {/* Armor Weight Tier Selector */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
          Armor Weight Tier / Chassis Class
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
          {[
            { id: 'Jewelry', name: 'Jewelry', mass: '<0.1kg', sockets: 0, sp: 2, dc: 5 },
            { id: 'Device', name: 'Device', mass: '<1kg', sockets: 1, sp: 5, dc: 5 },
            { id: 'Lightweight', name: 'Light (Vest)', mass: '<5kg', sockets: 2, sp: 10, dc: 10 },
            { id: 'Mediumweight', name: 'Medium (Suit)', mass: '<10kg', sockets: 4, sp: 20, dc: 15 },
            { id: 'Heavyweight', name: 'Heavy (Plate)', mass: '<25kg', sockets: 8, sp: 40, dc: 20 },
            { id: 'Mecha', name: 'Powered (Exo)', mass: '<100kg', sockets: 10, sp: 100, dc: 30 }
          ].map((t) => {
            const isSelected = size === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onChange('size', t.id);
                  onChange('category', t.id);
                  if (formData.base_dc === undefined || formData.base_dc === null) {
                    onChange('base_dc', t.dc);
                  }
                }}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{t.name}</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">{t.sp} Base SP</div>
                <div className="text-[9px] text-slate-500">{t.sockets} Sockets</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs for Coverage vs Modules vs Shields */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {['Coverage', 'Modules', 'Shields'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: Coverage Mode & Anatomical Toggles */}
      {activeTab === 'Coverage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
            {Object.values(ARMOR_COVERAGE).map((cov) => {
              const isSelected = coverage === cov.id;
              return (
                <button
                  key={cov.id}
                  type="button"
                  onClick={() => onChange('coverage', cov.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm font-bold'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{cov.name}</span>
                    <span className="text-emerald-400 font-bold">{cov.dcMod >= 0 ? `+${cov.dcMod}` : cov.dcMod} DC</span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-1">SP Mult: {cov.spMult}x</div>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{cov.description}</p>
                </button>
              );
            })}
          </div>

          {/* Anatomical Locations */}
          <div className="space-y-1.5 p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Protected Body Regions
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {['Head', 'Torso', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg'].map((loc) => {
                const isSelected = bodyLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleToggleLocation(loc)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <Check size={11} className={isSelected ? 'text-emerald-400' : 'opacity-0'} />
                    <span>{loc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Defensive Socket Modules */}
      {activeTab === 'Modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
          {ARMOR_MODULES.map((mod) => {
            const selected = isModuleSelected(mod.id);
            return (
              <div
                key={mod.id}
                onClick={() => handleToggleModule(mod)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  selected
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{mod.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">+{mod.dcMod} DC</span>
                    <span className="text-[9px] text-slate-500">TL{mod.tl}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{mod.effect}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {mod.sockets} Skt
                  </span>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                    selected ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700 bg-slate-950 text-transparent'
                  }`}>
                    <Check size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Carried Shields */}
      {activeTab === 'Shields' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {Object.values(CARRIED_SHIELDS).map((sh) => {
            const isSelected = carriedShield === sh.id;
            return (
              <button
                key={sh.id}
                type="button"
                onClick={() => onChange('carried_shield', isSelected ? 'None' : sh.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm font-bold'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{sh.name}</span>
                  <span className="text-emerald-400 font-bold">+{sh.blockBonus} Block</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">DC +{sh.dcMod} • {sh.sockets} Sockets</div>
                <p className="text-[9px] text-slate-500 mt-0.5">{sh.note}</p>
              </button>
            );
          })}
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

export default ArmorCoverageSelector;
