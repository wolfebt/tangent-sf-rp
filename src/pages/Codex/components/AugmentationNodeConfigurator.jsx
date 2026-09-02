import React, { useState } from 'react';
import { 
  Cpu, 
  Check, 
  AlertTriangle, 
  Activity, 
  Layers, 
  Sparkles, 
  Heart, 
  Shield, 
  Zap,
  Radio,
  Eye,
  Brain,
  Crosshair,
  UserCheck,
  Flame
} from 'lucide-react';
import { 
  ANATOMICAL_BODY_SLOTS, 
  AUGMENTATION_CATEGORIES, 
  FBC_PACKAGES, 
  STIGMA_LEVELS_DETAILED, 
  MANUFACTURER_SKINS 
} from '../../../engines/tangentConstants';
import { 
  calculateAugmentationDC, 
  calculateAugmentationNodes, 
  calculateAugmentationBP, 
  calculateAugmentationSP, 
  calculateStigmaLevel 
} from '../../../engines/tangentComplexEngines';

export const AugmentationNodeConfigurator = ({
  formData = {},
  onChange = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('Anatomy');

  const category = formData.category || 'body_mod';
  const location = formData.location || 'Torso';
  const tl = Number(formData.tech_level ?? formData.tl ?? 3);
  const ml = Number(formData.meta_level ?? formData.ml ?? 0);
  const skin = formData.faction_skin || formData.skin || 'Syndicate';
  const isFBC = !!(formData.is_fbc || category === 'fbc');
  const fbcPackage = formData.fbc_package || 'Civilian';
  const isPseudo = !!(formData.is_pseudo || category === 'pseudo');
  const nodeCost = formData.nodes_consumed !== undefined ? Number(formData.nodes_consumed) : (AUGMENTATION_CATEGORIES[category]?.defaultNodes ?? 5);
  const modCount = Number(formData.installed_mods_count || 1);

  const nodeStats = calculateAugmentationNodes({
    location,
    category,
    nodeCost,
    isPseudo,
    isFBC
  });

  const bpCost = calculateAugmentationBP({
    category,
    customBP: formData.cp ?? formData.bp_cost,
    tl,
    isFBC,
    fbcPackage
  });

  const computedSP = calculateAugmentationSP({
    location,
    nodes: nodeStats.nodesConsumed,
    isHardened: nodeStats.isHardened,
    isFBC,
    fbcPackage
  });

  const stigma = calculateStigmaLevel(modCount, isFBC);

  const handleSelectSlot = (slotKey) => {
    onChange('location', slotKey);
    const slotDef = ANATOMICAL_BODY_SLOTS[slotKey];
    if (slotDef && !formData.nodes_consumed) {
      onChange('nodes_consumed', Math.min(slotDef.maxNodes, 10));
    }
  };

  const handleSelectCategory = (catKey) => {
    onChange('category', catKey);
    const catDef = AUGMENTATION_CATEGORIES[catKey];
    if (catDef) {
      if (catKey === 'fbc') {
        onChange('is_fbc', true);
        onChange('nodes_consumed', 200);
        onChange('location', 'Systemic');
      } else {
        onChange('is_fbc', false);
        if (catKey === 'pseudo') {
          onChange('is_pseudo', true);
        } else {
          onChange('is_pseudo', false);
        }
        onChange('nodes_consumed', catDef.defaultNodes);
      }
    }
  };

  const handleSelectFBCPackage = (pkgKey) => {
    onChange('fbc_package', pkgKey);
    const pkg = FBC_PACKAGES[pkgKey];
    if (pkg) {
      onChange('craft_dc', pkg.baseDC);
      onChange('cost', pkg.credits);
      onChange('cp', pkg.bpCost);
      onChange('durability', pkg.totalSP);
      onChange('dr_rating', pkg.dr);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl font-mono text-xs text-slate-200">
      {/* Header with Live Biological & Node Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-white">Augmentation & Node Forge</span>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            nodeStats.isOverBudget 
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' 
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
          }`}>
            <Layers size={13} />
            <span>Nodes: <strong>{nodeStats.nodesConsumed}</strong> / {nodeStats.maxCapacity}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 flex items-center gap-1.5">
            <Brain size={13} />
            <span>CP Cost: <strong>{bpCost} CP</strong></span>
          </div>

          <div className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 flex items-center gap-1.5">
            <Heart size={13} />
            <span>SP: <strong>{computedSP}</strong> {nodeStats.isHardened ? '(x2 Hardened)' : ''}</span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            stigma.penalty < -4 
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : stigma.penalty < 0 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-300'
          }`}>
            <AlertTriangle size={13} />
            <span>Stigma: <strong>{stigma.level}</strong> ({stigma.penalty === 0 ? '0' : `${stigma.penalty} Social`})</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 gap-1 pb-1">
        {['Anatomy', 'Categories', 'FBC & Wearables', 'Stigma Profile'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: ANATOMICAL BODY SLOTS & NODE BUDGET */}
      {activeTab === 'Anatomy' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {Object.entries(ANATOMICAL_BODY_SLOTS).map(([slotKey, slotDef]) => {
              const isSelected = location === slotKey;
              return (
                <button
                  key={slotKey}
                  type="button"
                  onClick={() => handleSelectSlot(slotKey)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected 
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-bold text-xs ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {slotDef.name}
                    </span>
                    {isSelected && <Check size={14} className="text-cyan-400" />}
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2">{slotDef.description}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 border-t border-slate-800/80 pt-1.5">
                    <span>Capacity: <strong>{slotDef.maxNodes} Nodes</strong></span>
                    <span>Sockets: <strong>{slotDef.maxSockets}</strong></span>
                    {slotDef.isHardened && (
                      <span className="text-emerald-400 font-semibold">x2 Hardened</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Node Consumption Slider */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Custom Node Displacement: <span className="text-cyan-400 font-bold">{nodeStats.nodesConsumed} Nodes</span>
              </label>
              <span className={`text-[11px] font-bold ${nodeStats.isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                {nodeStats.isOverBudget ? 'OVER CAPACITY!' : `${nodeStats.remainingNodes} Nodes Remaining`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={nodeStats.maxCapacity * 1.5}
              value={nodeStats.nodesConsumed}
              onChange={(e) => onChange('nodes_consumed', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-300 ${
                  nodeStats.isOverBudget ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (nodeStats.nodesConsumed / nodeStats.maxCapacity) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUGMENTATION CATEGORIES */}
      {activeTab === 'Categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {Object.entries(AUGMENTATION_CATEGORIES).map(([catKey, catDef]) => {
            const isSelected = category === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => handleSelectCategory(catKey)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10' 
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-xs ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {catDef.name}
                  </span>
                  {isSelected && <Check size={14} className="text-cyan-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mb-2">{catDef.description}</div>
                <div className="flex items-center gap-3 text-[10px] text-slate-300 border-t border-slate-800/80 pt-1.5">
                  <span>Base CP: <strong>{catDef.defaultBP} CP</strong></span>
                  <span>Base Nodes: <strong>{catDef.defaultNodes}</strong></span>
                  <span>TL: <strong>TL{catDef.tl}</strong></span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* TAB 3: FBC & WEARABLES */}
      {activeTab === 'FBC & Wearables' && (
        <div className="space-y-4">
          <div className="p-3 bg-cyan-950/20 border border-cyan-800/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-300">Full Body Conversion (FBC) Chassis</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFBC}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onChange('is_fbc', checked);
                    if (checked) {
                      handleSelectCategory('fbc');
                    } else {
                      onChange('category', 'body_mod');
                    }
                  }}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-xs text-slate-200">Enable FBC Mode</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              Total consciousness migration into a synthetic humanoid frame. Grants 200 Nodes, 20 Sockets, and 260 Structure Points.
            </p>
          </div>

          {isFBC && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {Object.entries(FBC_PACKAGES).map(([pkgKey, pkgDef]) => {
                const isSelected = fbcPackage === pkgKey;
                return (
                  <button
                    key={pkgKey}
                    type="button"
                    onClick={() => handleSelectFBCPackage(pkgKey)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-md shadow-cyan-500/20' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-white mb-1">{pkgDef.name}</div>
                    <div className="text-[11px] text-slate-400 mb-2">{pkgDef.description}</div>
                    <div className="space-y-1 text-[10px] text-slate-300 border-t border-slate-800/80 pt-1.5">
                      <div>Cost: <strong className="text-amber-300">{pkgDef.credits.toLocaleString()} Cr</strong></div>
                      <div>Tolerance: <strong className="text-purple-300">{pkgDef.bpCost} CP</strong> | DR: <strong className="text-emerald-300">DR {pkgDef.dr}</strong></div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pseudo-Cybernetics Wearable Section */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-200">Pseudo-Cybernetics (Wearable Frames)</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPseudo}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onChange('is_pseudo', checked);
                    if (checked) {
                      onChange('category', 'pseudo');
                    } else {
                      onChange('category', 'body_mod');
                    }
                  }}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-xs text-slate-200">Wearable External Frame</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              External harnesses, battle gauntlets, and sabatons that host internal nodes without surgery (0 CP, half node capacity, requires Neural Interface Port).
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: STIGMA PROFILE */}
      {activeTab === 'Stigma Profile' && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Total Installed Visible Modifications: <span className="text-cyan-400 font-bold">{modCount} Mods</span>
              </label>
              <span className="text-xs font-bold text-amber-400">{stigma.label}</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              value={modCount}
              onChange={(e) => onChange('installed_mods_count', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {Object.entries(STIGMA_LEVELS_DETAILED).map(([stigmaKey, stigmaDef]) => {
              const isActive = stigma.level === stigmaDef.level;
              return (
                <div
                  key={stigmaKey}
                  className={`p-3 rounded-xl border ${
                    isActive 
                      ? 'bg-amber-950/30 border-amber-500/60 text-amber-200' 
                      : 'bg-slate-900/30 border-slate-800/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 font-bold text-xs">
                    <span>{stigmaDef.level} ({stigmaDef.minMods}-{stigmaDef.maxMods === Infinity ? '7+' : stigmaDef.maxMods} Mods)</span>
                    <span>{stigmaDef.penalty === 0 ? 'No Penalty' : `${stigmaDef.penalty} Social`}</span>
                  </div>
                  <div className="text-[11px] leading-relaxed">{stigmaDef.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AugmentationNodeConfigurator;
