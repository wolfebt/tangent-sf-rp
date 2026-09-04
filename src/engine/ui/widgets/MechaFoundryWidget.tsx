/**
 * @file MechaFoundryWidget.tsx
 * @description Glass Cockpit Modular Mecha & Sockets Dockable Widget.
 * Manages frame hardpoints, modular component sockets, heat dissipation vs build-up,
 * shield capacitor rerouting, and mecha combat actions.
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  Flame, 
  Shield, 
  RefreshCw
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export interface MechaHardpoint {
  id: string;
  location: 'torso' | 'left_arm' | 'right_arm' | 'shoulder' | 'core';
  equippedItem: string;
  heatCost: number;
  powerDraw: number;
  status: 'nominal' | 'damaged' | 'destroyed';
}

export interface MechaFoundryWidgetProps {
  frameName?: string;
  maxHeat?: number;
  maxShields?: number;
  onFireMechaAction?: (actionName: string, heat: number) => void;
  className?: string;
}

const DEFAULT_HARDPOINTS: MechaHardpoint[] = [
  { id: 'hp-1', location: 'left_arm', equippedItem: 'Twin Autocannon TL3', heatCost: 2, powerDraw: 4, status: 'nominal' },
  { id: 'hp-2', location: 'right_arm', equippedItem: 'Heavy Plasma Lance TL4', heatCost: 5, powerDraw: 8, status: 'nominal' },
  { id: 'hp-3', location: 'shoulder', equippedItem: 'Swarm Missile Pod', heatCost: 3, powerDraw: 3, status: 'nominal' },
  { id: 'hp-4', location: 'core', equippedItem: 'Sub-Atomic Fission Core TL4', heatCost: 0, powerDraw: -20, status: 'nominal' }
];

export const MechaFoundryWidget: React.FC<MechaFoundryWidgetProps> = ({
  frameName = 'Apex Golem Heavy Rig',
  maxHeat = 20,
  maxShields = 45,
  onFireMechaAction,
  className = ''
}) => {
  const [currentHeat, setCurrentHeat] = useState<number>(6);
  const [currentShields] = useState<number>(38);
  const [hardpoints] = useState<MechaHardpoint[]>(DEFAULT_HARDPOINTS);
  const [isVenting, setIsVenting] = useState<boolean>(false);

  const heatPercentage = Math.min(100, Math.round((currentHeat / maxHeat) * 100));
  const isOverheating = currentHeat >= maxHeat * 0.8;

  const handleTriggerAction = (actionName: string, heatGain: number) => {
    if (currentHeat + heatGain > maxHeat) {
      AudioService.playTerminalBeep(300, 0.15);
      return;
    }
    AudioService.playTerminalBeep(1100, 0.06);
    setCurrentHeat(prev => Math.min(maxHeat, prev + heatGain));
    if (onFireMechaAction) {
      onFireMechaAction(actionName, heatGain);
    }
  };

  const handleVentCoolant = () => {
    AudioService.playTerminalBeep(800, 0.1);
    setIsVenting(true);
    setTimeout(() => {
      setCurrentHeat(prev => Math.max(0, prev - 8));
      setIsVenting(false);
    }, 400);
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

      {/* Heat & Shield Gauges */}
      <div className="grid grid-cols-2 gap-2">
        {/* Heat Build-Up */}
        <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Flame size={11} className={isOverheating ? 'text-red-400 animate-pulse' : 'text-amber-400'} />
              HEAT:
            </span>
            <span className={`font-bold ${isOverheating ? 'text-red-400' : 'text-amber-300'}`}>
              {currentHeat}/{maxHeat} ({heatPercentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isOverheating ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${heatPercentage}%` }}
            />
          </div>
        </div>

        {/* Shield Capacitor */}
        <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Shield size={11} className="text-cyan-400" />
              CAPACITOR:
            </span>
            <span className="font-bold text-cyan-300">
              {currentShields}/{maxShields}
            </span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (currentShields / maxShields) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modular Hardpoints Matrix */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          FITTED HARDPOINT SOCKETS
        </span>
        <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
          {hardpoints.map((hp) => (
            <div
              key={hp.id}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[10px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-1 py-0.5 rounded bg-slate-900 text-[9px] text-slate-400 uppercase font-mono">
                  {hp.location.replace('_', ' ')}
                </span>
                <span className="text-slate-200 truncate font-sans">{hp.equippedItem}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                <span>+{hp.heatCost}H</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Nominal" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mecha Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => handleTriggerAction('Missile Salvo', 4)}
          className="p-1.5 bg-slate-950/80 hover:bg-slate-900 border border-amber-500/50 rounded-xl text-[10px] text-amber-200 font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <Flame size={11} className="text-amber-400" />
          <span>Salvo (+4 Heat)</span>
        </button>

        <button
          type="button"
          onClick={handleVentCoolant}
          disabled={isVenting || currentHeat === 0}
          className={`p-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
            currentHeat > 0
              ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 hover:bg-cyan-900'
              : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <RefreshCw size={11} className={isVenting ? 'animate-spin text-cyan-400' : 'text-cyan-400'} />
          <span>Vent Coolant (-8)</span>
        </button>
      </div>
    </div>
  );
};

export default MechaFoundryWidget;
