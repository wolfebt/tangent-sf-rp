import React, { useState, useMemo } from 'react';
import {
  CANONICAL_CHASSIS,
  CANONICAL_HARDPOINTS,
  CANONICAL_SUBSYSTEMS,
  computeVesselStats
} from '../../services/modularStarshipService';
import AudioService from '../../services/audioService';

const ModularStarshipForgeModal = ({
  isOpen,
  onClose,
  onBroadcastMessage
}) => {
  const [selectedChassisId, setSelectedChassisId] = useState('strike_corvette_200');
  const [installedHardpointIds, setInstalledHardpointIds] = useState(['twin_turbo_laser', 'pd_rotary_railgun']);
  const [installedSubsystemIds, setInstalledSubsystemIds] = useState(['deflector_shields', 'hyperdrive_core_mk3']);

  const vessel = useMemo(() => {
    return computeVesselStats(selectedChassisId, installedHardpointIds, installedSubsystemIds);
  }, [selectedChassisId, installedHardpointIds, installedSubsystemIds]);

  if (!isOpen) return null;

  const handleSelectChassis = (chassisId) => {
    AudioService.playTerminalBeep(780, 0.1);
    setSelectedChassisId(chassisId);
    // Trim hardpoints if new chassis has lower max
    const newChassis = CANONICAL_CHASSIS.find(c => c.id === chassisId) || CANONICAL_CHASSIS[0];
    setInstalledHardpointIds(prev => prev.slice(0, newChassis.maxHardpoints));
  };

  const handleToggleHardpoint = (weaponId) => {
    AudioService.playTerminalBeep(920, 0.1);
    if (installedHardpointIds.includes(weaponId)) {
      setInstalledHardpointIds(prev => prev.filter(id => id !== weaponId));
    } else {
      if (installedHardpointIds.length < vessel.chassis.maxHardpoints) {
        setInstalledHardpointIds(prev => [...prev, weaponId]);
      } else {
        AudioService.playTerminalBeep(320, 0.2); // Reject over-slot
      }
    }
  };

  const handleToggleSubsystem = (subsystemId) => {
    AudioService.playTerminalBeep(840, 0.1);
    if (installedSubsystemIds.includes(subsystemId)) {
      setInstalledSubsystemIds(prev => prev.filter(id => id !== subsystemId));
    } else {
      setInstalledSubsystemIds(prev => [...prev, subsystemId]);
    }
  };

  const handleDeployVessel = () => {
    AudioService.playTerminalBeep(1200, 0.2);
    if (onBroadcastMessage) {
      onBroadcastMessage(`[STARSHIP FORGE]: Deployed ${vessel.chassis.name} — Hull: ${vessel.totalHullSp} SP | Shields: ${vessel.totalShieldSp} SP | Armor DR: ${vessel.totalArmorDr} | Power: ${vessel.totalEnergyUsedMw}/${vessel.maxReactorOutputMw} MW | Valuation: ${vessel.totalCostCredits.toLocaleString()} TSC`);
    }
  };

  const energyPercent = Math.min(100, Math.round((vessel.totalEnergyUsedMw / vessel.maxReactorOutputMw) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="bg-[#0c121d] border border-cyan-500/70 rounded-xl p-5 w-full max-w-4xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white flex flex-col gap-4 max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-cyan-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-cyan-300">
                  Modular Starship &amp; Mecha Hardpoint Forge
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950 border border-cyan-500/60 text-cyan-200">
                  SHIPYARD v5.4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hull Assembly, Reactor Energy Balancing, Hardpoint Loadouts &amp; Subsystems
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 text-2xl font-bold leading-none px-2 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Chassis Selector Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CANONICAL_CHASSIS.map(ch => (
            <button
              key={ch.id}
              type="button"
              onClick={() => handleSelectChassis(ch.id)}
              className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                selectedChassisId === ch.id
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-300">{ch.name.split('(')[0]}</span>
                <span className="text-[9px] font-mono text-slate-500">{ch.tonnage}t</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Hardpoints: {ch.maxHardpoints} | {ch.reactorOutputMw} MW
              </span>
            </button>
          ))}
        </div>

        {/* Main Grid: Hardpoint & Subsystem Modules (Left) + Vessel Telemetry (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
          {/* Left Column: Modular Weapon Hardpoints & Subsystems */}
          <div className="md:col-span-2 flex flex-col gap-3 overflow-y-auto max-h-[360px] pr-1">
            {/* Reactor Power Bar */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                  <span>⚡</span> Reactor Power Budget
                </span>
                <span className={`text-xs font-mono font-bold ${vessel.isPowerDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {vessel.totalEnergyUsedMw} / {vessel.maxReactorOutputMw} MW ({vessel.powerMarginMw >= 0 ? `+${vessel.powerMarginMw} MW Surplus` : `${vessel.powerMarginMw} MW DEFICIT`})
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${vessel.isPowerDeficit ? 'bg-rose-500' : 'bg-cyan-500'}`}
                  style={{ width: `${energyPercent}%` }}
                />
              </div>
            </div>

            {/* Weapon Hardpoints */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Weapon Hardpoint Slots ({vessel.hardpointSlotsUsed} / {vessel.maxHardpoints} Installed):
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {CANONICAL_HARDPOINTS.map(wpn => {
                  const isInstalled = installedHardpointIds.includes(wpn.id);
                  const isSlotFull = !isInstalled && installedHardpointIds.length >= vessel.maxHardpoints;

                  return (
                    <button
                      key={wpn.id}
                      type="button"
                      onClick={() => handleToggleHardpoint(wpn.id)}
                      disabled={isSlotFull}
                      className={`p-2 rounded-lg border text-left flex items-start justify-between gap-2 transition-all cursor-pointer ${
                        isInstalled
                          ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-sm'
                          : isSlotFull
                          ? 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-base shrink-0">{wpn.icon}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs truncate">{wpn.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {wpn.damageDice} ({wpn.range})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 shrink-0 font-bold">
                        {wpn.energyMw} MW
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subsystem Modulators */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">
                Subsystem Modulator Modules:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {CANONICAL_SUBSYSTEMS.map(sub => {
                  const isInstalled = installedSubsystemIds.includes(sub.id);

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleToggleSubsystem(sub.id)}
                      className={`p-2 rounded-lg border text-left flex items-start justify-between gap-2 transition-all cursor-pointer ${
                        isInstalled
                          ? 'bg-purple-950/80 border-purple-400 text-white shadow-sm'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-base shrink-0">{sub.icon}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs truncate">{sub.name}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">
                            {sub.description}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-purple-400 shrink-0 font-bold">
                        {sub.energyMw} MW
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Computed Vessel Telemetry & Deployment */}
          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5 text-xs">
              <div className="border-b border-slate-800 pb-1.5">
                <h4 className="font-bold text-sm text-cyan-300">{vessel.chassis.name}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{vessel.chassis.description}</p>
              </div>

              {/* Combat Telemetry Stats */}
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Hull Integrity:</span>
                  <span className="text-emerald-400 font-bold text-xs">{vessel.totalHullSp} SP</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Shield Capacity:</span>
                  <span className="text-cyan-400 font-bold text-xs">{vessel.totalShieldSp} SP</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Armor DR:</span>
                  <span className="text-amber-400 font-bold text-xs">{vessel.totalArmorDr} DR</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Defense DC:</span>
                  <span className="text-purple-400 font-bold text-xs">DC {vessel.effectiveDefenseDc}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Sub-Light Speed:</span>
                  <span className="text-white font-bold text-xs">{vessel.chassis.baseSpeed} AU</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Hyperdrive:</span>
                  <span className="text-cyan-300 font-bold text-xs">Jump-{vessel.jumpRating}</span>
                </div>
              </div>

              {/* Valuation */}
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono text-[10px]">Total Valuation:</span>
                <span className="text-amber-400 font-mono font-bold text-sm">
                  {vessel.totalCostCredits.toLocaleString()} TSC
                </span>
              </div>

              {/* Deploy Button */}
              <button
                type="button"
                onClick={handleDeployVessel}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 cursor-pointer mt-1"
              >
                🚀 Deploy Vessel to VTT &amp; CommLink
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Close Starship Forge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModularStarshipForgeModal;
