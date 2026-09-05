/**
 * @file MechaFoundryWidget.tsx
 * @description Glass Cockpit Modular Mecha & Sockets Dockable Widget.
 * Manages frame hardpoints, modular component sockets, heat dissipation vs build-up,
 * shield capacitor rerouting, and mecha combat actions.
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  Shield, 
  RefreshCw
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export interface MechaHardpoint {
  id: string;
  tier: 'mount' | 'socket';
  location: 'torso' | 'left_arm' | 'right_arm' | 'shoulder' | 'core';
  equippedItem: string;
  capacityUDU: number;
  techLevel: number;
  status: 'nominal' | 'damaged' | 'destroyed';
}

export interface MechaFoundryWidgetProps {
  frameName?: string;
  maxStructure?: number;
  kineticDR?: number;
  energyDR?: number;
  onFireMechaAction?: (actionName: string) => void;
  className?: string;
}

const DEFAULT_HARDPOINTS: MechaHardpoint[] = [
  { id: 'hp-1', tier: 'mount', location: 'left_arm', equippedItem: 'Twin Autocannon TL3', capacityUDU: 10, techLevel: 3, status: 'nominal' },
  { id: 'hp-2', tier: 'mount', location: 'right_arm', equippedItem: 'Heavy Plasma Lance TL4', capacityUDU: 10, techLevel: 4, status: 'nominal' },
  { id: 'hp-3', tier: 'mount', location: 'shoulder', equippedItem: 'Swarm Missile Pod TL3', capacityUDU: 10, techLevel: 3, status: 'nominal' },
  { id: 'hp-4', tier: 'socket', location: 'core', equippedItem: 'Micro-Reactor TL4', capacityUDU: 1, techLevel: 4, status: 'nominal' }
];

export const MechaFoundryWidget: React.FC<MechaFoundryWidgetProps> = ({
  frameName = 'Apex Golem Heavy Rig',
  maxStructure = 60,
  kineticDR = 12,
  energyDR = 10,
  onFireMechaAction,
  className = ''
}) => {
  const [currentStructure, setCurrentStructure] = useState<number>(55);
  const [hardpoints] = useState<MechaHardpoint[]>(DEFAULT_HARDPOINTS);

  const structurePercentage = Math.min(100, Math.round((currentStructure / maxStructure) * 100));
  const isCritical = currentStructure <= maxStructure * 0.25;

  const handleTriggerAction = (actionName: string) => {
    AudioService.playTerminalBeep(1100, 0.06);
    if (onFireMechaAction) {
      onFireMechaAction(actionName);
    }
  };

  const handlePatchStructure = (amount: number) => {
    AudioService.playTerminalBeep(900, 0.08);
    setCurrentStructure(prev => Math.min(maxStructure, prev + amount));
  };

  return (
    <div className={`p-3 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 rounded-2xl shadow-2xl font-mono text-xs text-slate-200 flex flex-col gap-2.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Cpu size={15} className="text-amber-400" />
          <span className="font-bold uppercase tracking-wider text-amber-300 text-[11px]">
            {frameName}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase font-mono">
          CHASSIS: ACTIVE
        </span>
      </div>

      {/* Structure SP & Armor DR Gauges */}
      <div className="grid grid-cols-2 gap-2">
        {/* Structure Integrity */}
        <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 flex items-center gap-1 font-bold">
              <Cpu size={11} className={isCritical ? 'text-red-400 animate-pulse' : 'text-amber-400'} />
              STRUCTURE:
            </span>
            <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-amber-300'}`}>
              {currentStructure}/{maxStructure} SP
            </span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isCritical ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
              }`}
              style={{ width: `${structurePercentage}%` }}
            />
          </div>
        </div>

        {/* Armor DR Status */}
        <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 flex items-center gap-1 font-bold">
              <Shield size={11} className="text-cyan-400" />
              ARMOR DR:
            </span>
            <span className="font-bold text-cyan-300">
              K:{kineticDR} / E:{energyDR}
            </span>
          </div>
          <div className="text-[9px] text-slate-500 flex items-center justify-between pt-0.5">
            <span>TL3 Modular Chassis</span>
            <span className="text-emerald-400">Nominal</span>
          </div>
        </div>
      </div>

      {/* Modular Hardpoints Matrix (UDU Mounts & Sockets) */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          UDU HARDPOINTS &amp; MOUNTS
        </span>
        <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
          {hardpoints.map((hp) => (
            <div
              key={hp.id}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[10px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`px-1 py-0.5 rounded text-[8.5px] uppercase font-mono font-bold ${
                  hp.tier === 'mount' ? 'bg-amber-950 text-amber-300' : 'bg-cyan-950 text-cyan-300'
                }`}>
                  {hp.tier === 'mount' ? 'Mount' : 'Socket'}
                </span>
                <span className="text-slate-200 truncate font-sans">{hp.equippedItem}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                <span>{hp.capacityUDU} UDU</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Nominal" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mecha Action & Repair Buttons */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => handleTriggerAction('Missile Salvo')}
          className="p-1.5 bg-slate-950/80 hover:bg-slate-900 border border-amber-500/50 rounded-xl text-[10px] text-amber-200 font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <Cpu size={11} className="text-amber-400" />
          <span>Fire Hardpoints</span>
        </button>

        <button
          type="button"
          onClick={() => handlePatchStructure(10)}
          disabled={currentStructure >= maxStructure}
          className={`p-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
            currentStructure < maxStructure
              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 hover:bg-emerald-900'
              : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <RefreshCw size={11} className="text-emerald-400" />
          <span>Patch Structure (+10)</span>
        </button>
      </div>
    </div>
  );
};

export default MechaFoundryWidget;
