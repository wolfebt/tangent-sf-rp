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
  const creatureSize = formData.creature_size || 'Medium';
  const extraLimbPairs = Number(formData.extra_limb_pairs ?? 0);
  const additionalLayers = Array.isArray(formData.additional_armor_layers)
    ? formData.additional_armor_layers
    : [];
  const [newLayerName, setNewLayerName] = useState('');
  const [newLayerDR, setNewLayerDR] = useState(4);
  const bodyLocations = Array.isArray(formData.body_locations) 
    ? formData.body_locations 
    : ['Torso', 'Head', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg'];

  const computedSP = calculateArmorSP({
    baseSP: formData.durability,
    size,
    coverage,
    tl,
    skin,
    creatureSize
  });

  const computedDR = calculateArmorDR({
    baseDR: formData.dr_rating,
    tl,
    skin,
    additionalLayers
  });

  // Diminishing Returns Armor Stacking Rule:
  // Highest DR + sum of Math.ceil(layerDR / 5) for each additional layer separately (0=+0, 1-5=+1, 6-10=+2, 11-15=+3)
  const stackingBreakdown = (() => {
    const baseSuitDR = Number(computedDR?.baseDR ?? computedDR?.totalDR ?? formData.dr_rating ?? 0);
    const allLayerDRs = [
      { id: 'primary', name: formData.name || 'Primary Armor Suit', dr: baseSuitDR, isPrimary: true },
      ...additionalLayers.map((l, i) => ({
        id: l.id || `layer-${i}`,
        name: l.name || `Layer ${i + 2}`,
        dr: Math.max(0, Number(l.dr ?? 0)),
        isPrimary: false
      }))
    ];
    const sorted = [...allLayerDRs].sort((a, b) => b.dr - a.dr);
    const highest = sorted[0] || { dr: 0, name: 'None' };
    const secondaryLayers = sorted.slice(1).map(l => ({
      ...l,
      stageBonus: l.dr <= 0 ? 0 : Math.ceil(l.dr / 5)
    }));
    const diminishingBonus = secondaryLayers.reduce((sum, l) => sum + l.stageBonus, 0);
    const totalStackedDR = highest.dr + diminishingBonus;
    return { highest, secondaryLayers, diminishingBonus, totalStackedDR };
  })();

  const handleAddArmorLayer = () => {
    const drNum = Math.max(0, Number(newLayerDR) || 0);
    const nextLayers = [
      ...additionalLayers,
      {
        id: `layer-${Date.now()}`,
        name: newLayerName.trim() || `Underlayer / Sub-dermal (DR ${drNum})`,
        dr: drNum
      }
    ];
    onChange('additional_armor_layers', nextLayers);
    setNewLayerName('');
    setNewLayerDR(4);
  };

  const handleRemoveArmorLayer = (layerId) => {
    const nextLayers = additionalLayers.filter((l, idx) => (l.id || `layer-${idx}`) !== layerId);
    onChange('additional_armor_layers', nextLayers);
  };

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
            <span>{stackingBreakdown.totalStackedDR} DR {stackingBreakdown.diminishingBonus > 0 ? `(Base ${stackingBreakdown.highest.dr} +${stackingBreakdown.diminishingBonus} Stacked)` : `(${computedDR.drPercent}%)`}</span>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300 font-bold flex items-center gap-1">
            <Wind size={11} className="text-purple-400" />
            <span>Max Agi +{mobilityStats.maxDex}</span>
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

          {/* Non-Humanoid Creature Scale & Extra Limb Pairs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                Creature Size Scaling (Diminutive/Tiny to Gargantuan/Colossal)
              </label>
              <select
                value={creatureSize}
                onChange={(e) => onChange('creature_size', e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              >
                {[
                  { id: 'Diminutive/Tiny', label: 'Diminutive / Tiny (-2 CR, 0.25x SP & Mass)' },
                  { id: 'Small', label: 'Small (-1 CR, 0.5x SP & Mass)' },
                  { id: 'Medium', label: 'Medium (Baseline 1x SP & Mass)' },
                  { id: 'Large', label: 'Large (+2 CR, 2x SP & Mass)' },
                  { id: 'Huge', label: 'Huge (+4 CR, 4x SP & Mass)' },
                  { id: 'Gargantuan/Colossal', label: 'Gargantuan / Colossal (+8 CR, 8x SP & Mass)' }
                ].map(cs => (
                  <option key={cs.id} value={cs.id}>{cs.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Extra Limb Pairs (+1 CR / +20% Mass per Pair)
              </label>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4].map(pairCount => (
                  <button
                    key={pairCount}
                    type="button"
                    onClick={() => onChange('extra_limb_pairs', pairCount)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      extraLimbPairs === pairCount
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pairCount === 0 ? 'Standard (2 Pairs)' : `+${pairCount} Pair${pairCount > 1 ? 's' : ''} (+${pairCount} CR / +${pairCount * 20}%)`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Armor Layers (Diminishing Returns Stacking) */}
          <div className="space-y-2.5 p-3.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Layers size={13} className="text-cyan-400" />
                  <span>Additional Armor Layers (Diminishing Returns Stacking)</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Rule: Highest DR + <code className="text-cyan-300">Math.ceil(layerDR / 5)</code> for each additional layer separately (0=+0, 1-5=+1, 6-10=+2, 11-15=+3).
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-cyan-500/40 text-cyan-200 text-xs font-bold">
                Stacked DR: {stackingBreakdown.highest.dr} + {stackingBreakdown.diminishingBonus} = <span className="text-emerald-300">{stackingBreakdown.totalStackedDR} DR</span>
              </div>
            </div>

            {additionalLayers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {additionalLayers.map((layer, idx) => {
                  const lId = layer.id || `layer-${idx}`;
                  const lDr = Math.max(0, Number(layer.dr ?? 0));
                  const stageBonus = lDr <= 0 ? 0 : Math.ceil(lDr / 5);
                  return (
                    <div key={lId} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-200">{layer.name || `Layer ${idx + 2}`}</span>
                        <span className="text-[10px] text-cyan-300 ml-2">
                          Raw DR {lDr} → +{stageBonus} Stacked Bonus
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveArmorLayer(lId)}
                        className="text-slate-500 hover:text-red-400 px-1.5 py-0.5 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="text"
                value={newLayerName}
                onChange={(e) => setNewLayerName(e.target.value)}
                placeholder="Additional layer (e.g. Sub-dermal Weave, Under-Suit)..."
                className="flex-1 min-w-[180px] p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase">Layer DR:</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={newLayerDR}
                  onChange={(e) => setNewLayerDR(Math.max(0, Number(e.target.value) || 0))}
                  className="w-16 p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-cyan-300 font-bold text-center"
                />
              </div>
              <button
                type="button"
                onClick={handleAddArmorLayer}
                className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-bold cursor-pointer"
              >
                + Add Armor Layer (+{newLayerDR <= 0 ? 0 : Math.ceil(newLayerDR / 5)} DR)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Defensive Socket Modules */}
      {activeTab === 'Modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
