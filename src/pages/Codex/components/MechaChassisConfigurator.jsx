import React, { useState } from 'react';
import { 
  Bot, 
  Check, 
  AlertTriangle, 
  Shield, 
  Crosshair, 
  Wind, 
  Zap, 
  Radio, 
  Layers, 
  Cpu, 
  Users, 
  RotateCcw,
  Sparkles,
  Plane,
  Anchor,
  Compass,
  Gauge
} from 'lucide-react';
import { 
  MECHA_OPERATIONAL_DOMAINS,
  MECHA_SIZES,
  MECHA_FRAMES,
  MECHA_PROPULSION,
  MECHA_ARMOR_TYPES,
  MECHA_MODULES,
  MECHA_COMPONENTS,
  VFT_MODES,
  MANUFACTURER_SKINS 
} from '../../../engines/tangentConstants';
import { 
  calculateMechaDefenseDC, 
  calculateMechaDC, 
  calculateMechaMounts, 
  calculateCrewRequired 
} from '../../../engines/tangentComplexEngines';

export const MechaChassisConfigurator = ({
  formData = {},
  onChange = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('Chassis');

  const domain = formData.domain || 'Military Ground';
  const size = formData.size || 'Medium';
  const frame = formData.frame || formData.frame_type || 'Humanoid';
  const propulsion = formData.propulsion || 'biped_myomer';
  const armor = Array.isArray(formData.armor_plating) ? formData.armor_plating : [];
  const modules = Array.isArray(formData.installed_modules) ? formData.installed_modules : [];
  const components = Array.isArray(formData.components) ? formData.components : [];
  const vftMode = formData.vft_mode || (formData.vft_capable ? 'TL3_HardShift' : 'None');
  const pilotAgility = Number(formData.pilot_agility || 0);

  const sizeDef = MECHA_SIZES[size] || MECHA_SIZES.Medium;
  const frameDef = MECHA_FRAMES[frame] || MECHA_FRAMES.Humanoid;

  const defenseDC = calculateMechaDefenseDC({
    pilotAgility,
    size,
    frame
  });

  const mountBudget = calculateMechaMounts({
    size,
    propulsion,
    armor,
    modules,
    weapons: formData.linked_weapons || []
  });

  const hasAi = modules.some(m => (typeof m === 'string' ? m : m.id) === 'targeting_ai');
  const crewRequired = calculateCrewRequired(size, hasAi);

  const isArmorSelected = (armId) => armor.some(a => (typeof a === 'string' ? a : a.id) === armId);
  const isModuleSelected = (modId) => modules.some(m => (typeof m === 'string' ? m : m.id) === modId);
  const isComponentSelected = (compId) => components.some(c => (typeof c === 'string' ? c : c.id) === compId);

  const handleToggleArmor = (armId) => {
    if (isArmorSelected(armId)) {
      onChange('armor_plating', armor.filter(a => (typeof a === 'string' ? a !== armId : a.id !== armId)));
    } else {
      onChange('armor_plating', [...armor, armId]);
    }
  };

  const handleToggleModule = (modId) => {
    if (isModuleSelected(modId)) {
      onChange('installed_modules', modules.filter(m => (typeof m === 'string' ? m !== modId : m.id !== modId)));
    } else {
      onChange('installed_modules', [...modules, modId]);
    }
  };

  const handleToggleComponent = (compId) => {
    if (isComponentSelected(compId)) {
      onChange('components', components.filter(c => (typeof c === 'string' ? c !== compId : c.id !== compId)));
    } else {
      onChange('components', [...components, compId]);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl font-mono text-xs text-slate-200">
      {/* Header with Live Mecha Combat & Mount Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-red-400" />
          <span className="font-bold uppercase tracking-wider text-white">Mecha & Vehicle Frame Forge</span>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            mountBudget.isOverBudget 
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <Layers size={13} />
            <span>Mounts: <strong>{mountBudget.usedMounts}</strong> / {mountBudget.totalMounts} (x{sizeDef.scaleMult} Scale)</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-300 flex items-center gap-1.5">
            <Shield size={13} />
            <span>Defense DC: <strong>{defenseDC}</strong> (Hnd: {frameDef.handlingMod >= 0 ? `+${frameDef.handlingMod}` : frameDef.handlingMod})</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 flex items-center gap-1.5">
            <Gauge size={13} />
            <span>SP: <strong>{sizeDef.structure}</strong></span>
          </div>

          <div className="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center gap-1.5">
            <Users size={13} />
            <span>Crew: <strong>{crewRequired}</strong> {hasAi ? '(AI Assisted)' : ''}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 gap-1 pb-1">
        {['Chassis', 'Propulsion & Core', 'Armor & Shields', 'Modules & Systems', 'VFT Reconfiguration'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab 
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm shadow-red-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: CHASSIS, DOMAIN & SIZE */}
      {activeTab === 'Chassis' && (
        <div className="space-y-4">
          {/* Domain Selector */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 block">
              Operational Domain
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {MECHA_OPERATIONAL_DOMAINS.map((dom) => (
                <button
                  key={dom}
                  type="button"
                  onClick={() => onChange('domain', dom)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    domain === dom 
                      ? 'bg-red-950/40 border-red-500 text-red-300 font-bold shadow-sm' 
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {dom}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 block">
              Chassis Size & Scale (14 Size Classes)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {Object.entries(MECHA_SIZES).map(([sizeKey, sDef]) => {
                const isSelected = size === sizeKey;
                return (
                  <button
                    key={sizeKey}
                    type="button"
                    onClick={() => {
                      onChange('size', sizeKey);
                      onChange('durability', sDef.structure);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-red-950/40 border-red-500 text-red-300 shadow-md shadow-red-500/10' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs mb-1">
                      <span>{sDef.name}</span>
                      <span className="text-[10px] text-amber-400">{sDef.scale}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mb-1">{sDef.example}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-300 border-t border-slate-800/80 pt-1">
                      <span>SP: <strong>{sDef.structure}</strong></span>
                      <span>Mnts: <strong>{sDef.mounts}</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frame Type Selector */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 block">
              Frame Configuration Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {Object.entries(MECHA_FRAMES).map(([frameKey, fDef]) => {
                const isSelected = frame === frameKey;
                return (
                  <button
                    key={frameKey}
                    type="button"
                    onClick={() => onChange('frame', frameKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-red-950/40 border-red-500 text-red-300 shadow-sm' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs mb-1">{fDef.name}</div>
                    <div className="text-[10px] text-slate-400">{fDef.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROPULSION & CORE */}
      {activeTab === 'Propulsion & Core' && (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 block">
              Locomotion & Propulsion Drive
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {MECHA_PROPULSION.map((prop) => {
                const isSelected = propulsion === prop.id;
                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => onChange('propulsion', prop.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-red-950/40 border-red-500 text-red-300 shadow-md shadow-red-500/10' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">{prop.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">{prop.category}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mb-1.5">{prop.notes}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-300 border-t border-slate-800/80 pt-1">
                      <span>Speed: <strong className="text-cyan-300">{prop.speed}</strong></span>
                      <span>Cost: <strong>{prop.mounts} Mnt</strong> (DC +{prop.dcMod})</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Internal Components */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 block">
              Core Internals & Reactor Power Grid
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {MECHA_COMPONENTS.map((comp) => {
                const isSelected = isComponentSelected(comp.id);
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => handleToggleComponent(comp.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-amber-950/30 border-amber-500 text-amber-200' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{comp.name}</span>
                      {isSelected && <Check size={14} className="text-amber-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400">{comp.notes} (TL{comp.tl}, DC +{comp.dcMod})</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ARMOR & SHIELDS */}
      {activeTab === 'Armor & Shields' && (
        <div className="space-y-3">
          <div className="p-2.5 bg-red-950/20 border border-red-800/40 rounded-xl text-[11px] text-red-200 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400 shrink-0" />
            <span>
              <strong>Scale Multiplier Mounting:</strong> Plating Mount cost automatically scales by the chassis scale modifier (x{sizeDef.scaleMult}).
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
            {MECHA_ARMOR_TYPES.map((arm) => {
              const isSelected = isArmorSelected(arm.id);
              const scaledMounts = arm.baseMountMult * Math.max(1, Math.round(sizeDef.scaleMult));
              return (
                <button
                  key={arm.id}
                  type="button"
                  onClick={() => handleToggleArmor(arm.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-red-950/40 border-red-500 text-red-300 shadow-md shadow-red-500/10' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{arm.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">{arm.category}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mb-1">{arm.effect}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 border-t border-slate-800/80 pt-1">
                    <span>Mounts: <strong className="text-cyan-300">{scaledMounts} Mnts</strong></span>
                    <span>DC: <strong>+{arm.dcMod}</strong> (TL{arm.tl})</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MODULES & SYSTEMS */}
      {activeTab === 'Modules & Systems' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
          {MECHA_MODULES.map((mod) => {
            const isSelected = isModuleSelected(mod.id);
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleToggleModule(mod.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'bg-red-950/40 border-red-500 text-red-300 shadow-md shadow-red-500/10' 
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">{mod.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">{mod.category}</span>
                </div>
                <div className="text-[11px] text-slate-400 mb-1.5">{mod.function}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 border-t border-slate-800/80 pt-1">
                  <span>Capacity: <strong>{mod.mounts} Mounts</strong></span>
                  <span>DC: <strong>+{mod.dcMod}</strong> (TL{mod.tl})</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* TAB 5: VFT RECONFIGURATION */}
      {activeTab === 'VFT Reconfiguration' && (
        <div className="space-y-4">
          <div className="p-3 bg-red-950/20 border border-red-800/40 rounded-xl space-y-2">
            <span className="font-bold text-xs text-red-300">Variable Form Technology (VFT Mode)</span>
            <p className="text-[11px] text-slate-400">
              Allows the mecha or vehicle chassis to dynamically reconfigure between high-mobility vehicle modes, walkers, and static defensive fortresses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {Object.entries(VFT_MODES).map(([vftKey, vftDef]) => {
              const isSelected = vftMode === vftKey;
              return (
                <button
                  key={vftKey}
                  type="button"
                  onClick={() => onChange('vft_mode', vftKey)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-red-950/50 border-red-400 shadow-md shadow-red-500/20' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white mb-1">{vftDef.name}</div>
                  <div className="text-[11px] text-amber-300 mb-1">Shift Cost: {vftDef.actionCost}</div>
                  {vftDef.notes && <div className="text-[10px] text-slate-400 mb-1.5">{vftDef.notes}</div>}
                  <div className="text-[10px] text-slate-300 border-t border-slate-800/80 pt-1">
                    Complexity: <strong>{vftDef.dcMod === 0 ? 'No Penalty' : `+${vftDef.dcMod} DC`}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MechaChassisConfigurator;
