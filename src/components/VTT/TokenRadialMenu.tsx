/**
 * @file TokenRadialMenu.tsx
 * @description Contextual Sci-Fi Radial Action Wheel for The Stage VTT.
 * Floats directly over the canvas centered on an operative token.
 * Features smart proximity detection:
 * - 🎯 Strike (highlights Point-Blank advantage if within reach)
 * - 🏃 Move / Sprint (activates dynamic range rings)
 * - 🛡️ Stance (Guard, Aim, Overwatch, Total Defense)
 * - 🩹 Stabilize (dynamically enabled if adjacent to downed ally in Mortality State at 0 HP)
 * - ⚙️ Interact (dynamically enabled if within 5ft of bulkhead/terminal)
 * - 📋 Folio Sheet (opens operative profile)
 */

import React, { useEffect, useRef } from 'react';
import { 
  Crosshair, 
  Footprints, 
  Shield, 
  HeartPulse, 
  Terminal, 
  FileText, 
  X,
  Target
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

export interface TokenRadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  token: any;
  targetToken?: any;
  isAdjacentToMortalityAlly?: boolean;
  mortalityAllyName?: string;
  isAdjacentToInteractiveObj?: boolean;
  interactiveObjName?: string;
  isPointBlankRange?: boolean;
  onSelectAction: (actionId: string, payload?: any) => void;
}

export const TokenRadialMenu: React.FC<TokenRadialMenuProps> = ({
  isOpen,
  onClose,
  position,
  token,
  targetToken,
  isAdjacentToMortalityAlly = false,
  mortalityAllyName = 'Allied Operative',
  isAdjacentToInteractiveObj = false,
  interactiveObjName = 'Bulkhead / Console',
  isPointBlankRange = false,
  onSelectAction
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !token) return null;

  const actions = [
    {
      id: 'strike',
      label: isPointBlankRange ? 'Point-Blank Strike' : 'Strike (2d10)',
      sub: isPointBlankRange ? '+5 Strike • Advantage' : 'Canonical Opposed Roll',
      icon: isPointBlankRange ? Target : Crosshair,
      activeColor: isPointBlankRange 
        ? 'border-amber-400 bg-amber-950/90 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' 
        : 'border-red-500/70 bg-red-950/80 text-red-400 hover:bg-red-900',
      badge: isPointBlankRange ? 'PB' : null
    },
    {
      id: 'move',
      label: 'Maneuver / Sprint',
      sub: 'Action Range Rings',
      icon: Footprints,
      activeColor: 'border-cyan-500/70 bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900',
      badge: null
    },
    {
      id: 'stance',
      label: 'Tactical Stance',
      sub: 'Guard / Aim / Overwatch',
      icon: Shield,
      activeColor: 'border-purple-500/70 bg-purple-950/80 text-purple-300 hover:bg-purple-900',
      badge: null
    },
    {
      id: 'stabilize',
      label: 'Stabilize Ally',
      sub: isAdjacentToMortalityAlly ? `Save ${mortalityAllyName}` : 'No ally bleeding out',
      icon: HeartPulse,
      disabled: !isAdjacentToMortalityAlly,
      activeColor: isAdjacentToMortalityAlly
        ? 'border-emerald-400 bg-emerald-950/90 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse'
        : 'border-slate-800 bg-slate-950/50 text-slate-600 opacity-40 cursor-not-allowed',
      badge: isAdjacentToMortalityAlly ? 'CR15' : null
    },
    {
      id: 'interact',
      label: 'Access / Breach',
      sub: isAdjacentToInteractiveObj ? interactiveObjName : 'No interactive object',
      icon: Terminal,
      disabled: !isAdjacentToInteractiveObj,
      activeColor: isAdjacentToInteractiveObj
        ? 'border-blue-400 bg-blue-950/90 text-blue-300 shadow-[0_0_15px_rgba(96,165,250,0.5)]'
        : 'border-slate-800 bg-slate-950/50 text-slate-600 opacity-40 cursor-not-allowed',
      badge: isAdjacentToInteractiveObj ? 'USE' : null
    },
    {
      id: 'folio',
      label: 'Operative Sheet',
      sub: 'Folio Vitals & Gear',
      icon: FileText,
      activeColor: 'border-slate-700 bg-slate-900/90 text-slate-300 hover:bg-slate-800',
      badge: null
    }
  ];

  const radius = 95;
  const total = actions.length;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 pointer-events-auto select-none"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Central Token Nameplate Hub */}
      <div className="absolute -top-7 -left-7 w-14 h-14 rounded-full bg-slate-950 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] z-20 backdrop-blur-md">
        <span className="text-[11px] font-mono font-bold text-cyan-300 leading-tight">
          {(token.name || token.label || 'OP').substring(0, 3).toUpperCase()}
        </span>
        <span className="text-[8px] font-mono text-slate-400">
          {token.current_hp ?? token.base_hp ?? 30}HP
        </span>
        {targetToken && (
          <span className="text-[7px] font-mono text-red-400 font-bold max-w-[48px] truncate" title={`Target: ${targetToken.name}`}>
            🎯{targetToken.name}
          </span>
        )}
        
        {/* Close Button */}
        <button
          onClick={() => {
            AudioService.playTerminalBeep(800, 0.02);
            onClose();
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-[10px] shadow cursor-pointer"
          title="Close Menu"
        >
          <X size={12} />
        </button>
      </div>

      {/* Decorative Radial Orbit Rings */}
      <div 
        className="absolute rounded-full border border-cyan-500/20 pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ width: `${radius * 2 + 30}px`, height: `${radius * 2 + 30}px` }}
      />
      <div 
        className="absolute rounded-full border border-dashed border-cyan-500/15 pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-spin"
        style={{ width: `${radius * 2 + 50}px`, height: `${radius * 2 + 50}px`, animationDuration: '60s' }}
      />

      {/* Radial Action Slices */}
      {actions.map((act, index) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        const x = Math.round(Math.cos(angle) * radius);
        const y = Math.round(Math.sin(angle) * radius);
        const IconComponent = act.icon;

        return (
          <div
            key={act.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            <button
              disabled={act.disabled}
              onClick={() => {
                if (act.disabled) return;
                AudioService.playTerminalBeep(1200, 0.03);
                onSelectAction(act.id);
                onClose();
              }}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-xl border backdrop-blur-lg transition-all duration-150 cursor-pointer ${act.activeColor}`}
              title={`${act.label}: ${act.sub}`}
            >
              <IconComponent size={18} />

              {/* Proximity / Priority Badge */}
              {act.badge && (
                <span className="absolute -top-2 -right-2 px-1 py-0.2 bg-amber-500 text-black font-bold font-mono text-[8px] rounded-full border border-amber-300">
                  {act.badge}
                </span>
              )}

              {/* Hover Tooltip Label */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                <div className="bg-slate-950/95 border border-cyan-500/50 px-2 py-1 rounded shadow-xl backdrop-blur-md text-center">
                  <span className="text-[10px] font-bold text-cyan-200 block uppercase tracking-wider">{act.label}</span>
                  <span className="text-[8.5px] text-slate-400 block">{act.sub}</span>
                </div>
                <div className="w-1.5 h-1.5 bg-slate-950 rotate-45 border-r border-b border-cyan-500/50 -mt-1" />
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
};
