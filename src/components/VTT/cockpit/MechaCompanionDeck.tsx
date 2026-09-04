/**
 * @file MechaCompanionDeck.tsx
 * @description Tangent SF RP Mecha & Cyberware Modular Socket Matrix.
 * Features customizable chassis sockets (Head/Optics, Core Reactor, Arms, Legs),
 * live Heat & Capacitor telemetry gauges, and Subsystem Integrity damage trackers.
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  Flame, 
  BatteryCharging, 
  Activity, 
  RotateCcw, 
  Wrench
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

interface ChassisSocket {
  id: string;
  name: string;
  slot: 'head' | 'core' | 'arm_r' | 'arm_l' | 'legs';
  equippedItem: string;
  heatGen: number;
  energyDrain: number;
  bonus: string;
  integrity: number; // 0 - 100%
}

const DEFAULT_SOCKETS: ChassisSocket[] = [
  {
    id: 'sock-head',
    name: 'Sensor Mast & Optics',
    slot: 'head',
    equippedItem: 'Tachyon Multi-Spectral Array Mk III',
    heatGen: 5,
    energyDrain: 10,
    bonus: '+20% LoS Detection & Thermal Vision',
    integrity: 100
  },
  {
    id: 'sock-core',
    name: 'Micro-Fusion Reactor',
    slot: 'core',
    equippedItem: 'Hyperion V-Cell Micro-Core (150kW)',
    heatGen: 15,
    energyDrain: 0,
    bonus: 'Provides 150 kW Continuous Power',
    integrity: 95
  },
  {
    id: 'sock-arm-r',
    name: 'Right Hardpoint',
    slot: 'arm_r',
    equippedItem: 'Twin 30mm Gauss Autocannon',
    heatGen: 20,
    energyDrain: 25,
    bonus: '3 AP &bull; 3d12+10 Kinetic Piercing',
    integrity: 90
  },
  {
    id: 'sock-arm-l',
    name: 'Left Hardpoint',
    slot: 'arm_l',
    equippedItem: 'Hardlight Aegis Deflector Screen',
    heatGen: 10,
    energyDrain: 20,
    bonus: '+12 Energy DR & Deflect Blast',
    integrity: 100
  },
  {
    id: 'sock-legs',
    name: 'Locomotion / Mobility',
    slot: 'legs',
    equippedItem: 'Vectored Mag-Lev Hover Thrusters',
    heatGen: 10,
    energyDrain: 15,
    bonus: 'Speed 50 ft & All-Terrain Hover',
    integrity: 80
  }
];

export const MechaCompanionDeck: React.FC = () => {
  const [sockets, setSockets] = useState<ChassisSocket[]>(DEFAULT_SOCKETS);
  const [currentHeat, setCurrentHeat] = useState<number>(35);
  const maxHeat = 100;
  const [capacitorLevel, setCapacitorLevel] = useState<number>(85);
  const maxCapacitor = 100;
  const [isEmergencyVenting, setIsEmergencyVenting] = useState(false);

  const isOverheating = currentHeat >= 80;

  // Vent Coolant / Radiators
  const handleVentHeat = () => {
    setIsEmergencyVenting(true);
    AudioService.playTerminalBeep();
    setTimeout(() => {
      setCurrentHeat(prev => Math.max(0, prev - 40));
      setIsEmergencyVenting(false);
    }, 400);
  };

  // Re-charge capacitor
  const handleChargeCapacitor = () => {
    setCapacitorLevel(prev => Math.min(maxCapacitor, prev + 25));
    setCurrentHeat(prev => Math.min(maxHeat, prev + 10));
    AudioService.playTerminalBeep();
  };

  // Field Repair Subsystem
  const handleRepairSocket = (socketId: string) => {
    setSockets(prev => prev.map(s => {
      if (s.id === socketId) {
        return { ...s, integrity: 100 };
      }
      return s;
    }));
    AudioService.playCriticalChime(true);
  };

  return (
    <div className="space-y-2.5 font-mono select-none">
      {/* ===================================================================== */}
      {/* MECHA CHASSIS HEADER & HEAT / CAPACITOR TELEMETRY                     */}
      {/* ===================================================================== */}
      <div className="p-2.5 rounded-lg bg-[#0d121c] border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Cpu size={14} />
            CHASSIS: TITAN-VII EXOSUIT
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
            SOCKETED
          </span>
        </div>

        {/* Heat Gauge */}
        <div>
          <div className="flex justify-between text-[10.5px] mb-0.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Flame size={11} className={isOverheating ? 'text-red-400 animate-pulse' : 'text-amber-400'} />
              THERMAL CORE HEAT:
            </span>
            <span className={`font-bold ${isOverheating ? 'text-red-400' : 'text-amber-300'}`}>
              {currentHeat} / {maxHeat} HU {isOverheating && '(WARNING)'}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-300 ${
                isOverheating
                  ? 'bg-gradient-to-r from-amber-500 to-red-600 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 via-amber-500 to-red-500'
              }`}
              style={{ width: `${(currentHeat / maxHeat) * 100}%` }}
            />
          </div>
        </div>

        {/* Capacitor Gauge */}
        <div>
          <div className="flex justify-between text-[10.5px] mb-0.5">
            <span className="text-slate-400 flex items-center gap-1">
              <BatteryCharging size={11} className="text-cyan-400" />
              CAPACITOR RESERVE:
            </span>
            <span className="text-cyan-300 font-bold">{capacitorLevel} / {maxCapacitor} kW</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 transition-all duration-300"
              style={{ width: `${(capacitorLevel / maxCapacitor) * 100}%` }}
            />
          </div>
        </div>

        {/* Heat Controls */}
        <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
          <button
            type="button"
            onClick={handleVentHeat}
            disabled={isEmergencyVenting || currentHeat <= 0}
            className="py-1 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/50 text-red-300 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={11} />
            <span>{isEmergencyVenting ? 'Venting...' : 'Vent Radiators (-40 HU)'}</span>
          </button>

          <button
            type="button"
            onClick={handleChargeCapacitor}
            disabled={capacitorLevel >= maxCapacitor}
            className="py-1 px-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/50 text-cyan-300 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Activity size={11} />
            <span>Aux Charge (+25 kW)</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODULAR SOCKET MATRIX                                                 */}
      {/* ===================================================================== */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-0.5 flex items-center justify-between">
          <span>Modular Hardware Sockets ({sockets.length})</span>
          <span className="text-slate-600">Integrity Matrix</span>
        </div>

        {sockets.map((socket) => {
          const isDamaged = socket.integrity < 100;
          return (
            <div
              key={socket.id}
              className={`p-2 rounded-lg border transition-all ${
                isDamaged
                  ? 'bg-amber-950/15 border-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {socket.slot.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {socket.equippedItem}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-[10px]">
                  <span className={`font-bold ${socket.integrity >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {socket.integrity}%
                  </span>
                  {isDamaged && (
                    <button
                      type="button"
                      onClick={() => handleRepairSocket(socket.id)}
                      className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 transition-colors cursor-pointer"
                      title="Field repair socket integrity"
                    >
                      <Wrench size={10} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate">{socket.bonus}</span>
                <span className="text-slate-500 shrink-0">
                  +{socket.heatGen} HU &bull; {socket.energyDrain} kW
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MechaCompanionDeck;
