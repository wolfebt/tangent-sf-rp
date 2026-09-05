/**
 * @file MechaCompanionDeck.tsx
 * @description Tangent SF RP Mecha & Chassis Modular Socket Matrix.
 * Built strictly on docs/game rules/architect/99. MECHA MATRIX.md and 99. EQUIPMENT MATRIX.md:
 * - Universal Displacement Unit (UDU) Hierarchy: Node (<10g) -> Socket (<1kg) -> Mount (<100kg) -> Module (<10t)
 * - Chassis Structure Points (SP) & Armor DR (Kinetic / Energy)
 * - Tech Level traits (TL3 Modular, TL4 Self-Repairing, TL5 Morphic/Weightless)
 * - EMP susceptibility checks via 2d10 saves (TL4 Bioware/Shielded is immune)
 * - Hardpoint Mounts and Personal-Scale Gear Sockets
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  Activity, 
  Wrench,
  Layers,
  Sparkles
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import { TechLevel } from '../../../engine/rules/MechaSocketManager';

export interface UDUSlot {
  id: string;
  name: string;
  tier: 'socket' | 'mount' | 'module';
  capacitySockets: number; // 1 Socket = 1, 1 Mount = 10, 1 Module = 100
  equippedItem: string;
  techLevel: number;
  bonus: string;
  integrity: number; // 0 - 100%
}

const DEFAULT_UDU_SLOTS: UDUSlot[] = [
  {
    id: 'udu-mount-1',
    name: 'Right Hardpoint Mount',
    tier: 'mount',
    capacitySockets: 10,
    equippedItem: 'Twin 30mm Gauss Autocannon (TL3)',
    techLevel: 3,
    bonus: '2d10+10 Kinetic Piercing &bull; AP 4',
    integrity: 100
  },
  {
    id: 'udu-mount-2',
    name: 'Left Hardpoint Mount',
    tier: 'mount',
    capacitySockets: 10,
    equippedItem: 'Hardlight Aegis Deflector Screen (TL4)',
    techLevel: 4,
    bonus: '+12 Energy DR & Deflect Blast (Self-Repairing)',
    integrity: 95
  },
  {
    id: 'udu-mount-3',
    name: 'Locomotion / Propulsion Mount',
    tier: 'mount',
    capacitySockets: 10,
    equippedItem: 'Vectored Mag-Lev Hover Thrusters (TL3)',
    techLevel: 3,
    bonus: 'Speed 50 ft & All-Terrain Hover',
    integrity: 85
  },
  {
    id: 'udu-sock-optics',
    name: 'Sensors / Avionics Socket',
    tier: 'socket',
    capacitySockets: 1,
    equippedItem: 'Tachyon Multi-Spectral Array Mk III (TL3)',
    techLevel: 3,
    bonus: '+4 LoS Detection & Thermal Vision',
    integrity: 100
  },
  {
    id: 'udu-sock-nanite',
    name: 'Internal Sub-System Socket',
    tier: 'socket',
    capacitySockets: 1,
    equippedItem: 'Localized Auto-Repair Nanite Core (TL4)',
    techLevel: 4,
    bonus: 'Regenerates 1 SP / hour (EMP Immune)',
    integrity: 100
  }
];

export const MechaCompanionDeck: React.FC = () => {
  const [slots, setSlots] = useState<UDUSlot[]>(DEFAULT_UDU_SLOTS);
  const [chassisSP, setChassisSP] = useState<number>(115);
  const maxChassisSP = 120;
  const techLevel = TechLevel.TL3_Cybernetic;
  const kineticDR = 14;
  const energyDR = 10;

  // Field Repair Subsystem
  const handleRepairSlot = (slotId: string) => {
    setSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        return { ...s, integrity: 100 };
      }
      return s;
    }));
    AudioService.playCriticalChime(true);
  };

  // Field Structure patch
  const handleRepairStructure = (amount: number) => {
    setChassisSP(prev => Math.min(maxChassisSP, prev + amount));
    AudioService.playTerminalBeep(1200, 0.08);
  };

  return (
    <div className="space-y-2.5 font-mono select-none">
      {/* ===================================================================== */}
      {/* MECHA CHASSIS HEADER & STRUCTURE / UDU TELEMETRY                      */}
      {/* ===================================================================== */}
      <div className="p-2.5 rounded-lg bg-[#0d121c] border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Cpu size={14} />
            CHASSIS: APEX GOLEM CHASSIS
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
            TL{techLevel} MODULAR
          </span>
        </div>

        {/* Structure Points Gauge */}
        <div>
          <div className="flex justify-between text-[10.5px] mb-0.5">
            <span className="text-slate-400 flex items-center gap-1 font-bold">
              <Activity size={11} className="text-amber-400" />
              CHASSIS STRUCTURE (SP):
            </span>
            <span className="font-bold text-amber-300">
              {chassisSP} / {maxChassisSP} SP
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${(chassisSP / maxChassisSP) * 100}%` }}
            />
          </div>
        </div>

        {/* Chassis DR & Tech Level Traits */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
          <div className="p-1 rounded bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500">KIN DR</span>
            <span className="font-bold text-cyan-300">{kineticDR}</span>
          </div>
          <div className="p-1 rounded bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500">ENG DR</span>
            <span className="font-bold text-sky-300">{energyDR}</span>
          </div>
          <div className="p-1 rounded bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500">EMP STATUS</span>
            <span className="font-bold text-emerald-400">DC 15 Save</span>
          </div>
        </div>

        {/* Field Maintenance & Patch Controls */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-xs">
          <button
            type="button"
            onClick={() => handleRepairStructure(10)}
            disabled={chassisSP >= maxChassisSP}
            className="py-1 px-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 text-amber-300 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
          >
            <Wrench size={11} />
            <span>Patch Frame (+10 SP)</span>
          </button>

          <button
            type="button"
            onClick={() => handleRepairStructure(25)}
            disabled={chassisSP >= maxChassisSP}
            className="py-1 px-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/50 text-emerald-300 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
          >
            <Sparkles size={11} />
            <span>Field Re-weld (+25 SP)</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* UDU HIERARCHY & MODULAR SOCKET MATRIX                                 */}
      {/* ===================================================================== */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-0.5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-400 font-bold">
            <Layers size={11} className="text-cyan-400" />
            UDU MOUNTS &amp; SOCKETS ({slots.length})
          </span>
          <span className="text-[9px] text-slate-500">1 Mount = 10 Sockets</span>
        </div>

        {slots.map((slot) => {
          const isDamaged = slot.integrity < 100;
          return (
            <div
              key={slot.id}
              className={`p-2 rounded-lg border transition-all ${
                isDamaged
                  ? 'bg-amber-950/15 border-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-[9.5px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                    slot.tier === 'mount' 
                      ? 'bg-amber-950 text-amber-300 border-amber-500/40' 
                      : 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {slot.tier === 'mount' ? 'MOUNT (10 UDU)' : 'SOCKET (1 UDU)'}
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {slot.equippedItem}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-[10px]">
                  <span className={`font-bold ${slot.integrity >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {slot.integrity}%
                  </span>
                  {isDamaged && (
                    <button
                      type="button"
                      onClick={() => handleRepairSlot(slot.id)}
                      className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 transition-colors cursor-pointer"
                      title="Field repair subsystem integrity"
                    >
                      <Wrench size={10} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate">{slot.bonus}</span>
                <span className="text-slate-500 shrink-0 text-[9px] font-mono">
                  TL{slot.techLevel} &bull; {slot.capacitySockets} Sockets Eq
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
