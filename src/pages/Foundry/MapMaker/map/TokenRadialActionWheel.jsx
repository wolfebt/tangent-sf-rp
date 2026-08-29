import React, { useEffect, useRef } from 'react';
import { Swords, Shield, Footprints, Zap, Terminal, Eye, Database, X } from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

export const TokenRadialActionWheel = ({
  isOpen = false,
  onClose,
  position = { x: 0, y: 0 },
  token,
  onActionSelect
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !token) return null;

  const hasOmnicortex = !!(token.linkedOmnicortexItem || token.omnicortexId);

  const actions = [
    {
      id: 'attack',
      label: 'Engage (2d10)',
      icon: Swords,
      color: 'text-red-400 border-red-500/60 bg-red-950/80 hover:bg-red-900',
      tooltip: 'Roll instant 2d10 Tactical Weapon Attack'
    },
    {
      id: 'defend',
      label: 'Defensive Stance',
      icon: Shield,
      color: 'text-blue-400 border-blue-500/60 bg-blue-950/80 hover:bg-blue-900',
      tooltip: 'Spend 1 AP for +2 Reflex / Defense boost'
    },
    {
      id: 'move',
      label: 'Waypoint Path',
      icon: Footprints,
      color: 'text-emerald-400 border-emerald-500/60 bg-emerald-950/80 hover:bg-emerald-900',
      tooltip: 'Plot tactical waypoint movement route'
    },
    {
      id: 'stim',
      label: 'Stim / Item',
      icon: Zap,
      color: 'text-amber-400 border-amber-500/60 bg-amber-950/80 hover:bg-amber-900',
      tooltip: 'Use Med-Stim or Karma surge from Folio'
    },
    {
      id: 'cyber',
      label: 'Cyber Slice',
      icon: Terminal,
      color: 'text-cyan-400 border-cyan-500/60 bg-cyan-950/80 hover:bg-cyan-900',
      tooltip: 'Deploy cyberdeck program or slice node'
    },
    {
      id: 'sensor',
      label: 'Sensor Vision',
      icon: Eye,
      color: 'text-purple-400 border-purple-500/60 bg-purple-950/80 hover:bg-purple-900',
      tooltip: 'Toggle Thermal / Cyber Radar / Meta Sensor'
    },
    ...(hasOmnicortex ? [{
      id: 'omnicortex',
      label: 'Codex Sheet',
      icon: Database,
      color: 'text-cyan-300 border-cyan-400 bg-cyan-950/90 hover:bg-cyan-900 shadow-[0_0_10px_rgba(6,182,212,0.4)]',
      tooltip: 'Open full Omnicortex Compendium stats sheet'
    }] : [])
  ];

  const radius = 80;
  const total = actions.length;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 pointer-events-auto select-none"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Central Token Badge */}
      <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)] z-20">
        <span className="text-xs font-mono font-bold text-cyan-300">
          {(token.name || token.label || 'OP').substring(0, 2).toUpperCase()}
        </span>
        <button
          onClick={() => {
            AudioService.playTerminalBeep(800, 0.02);
            onClose?.();
          }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-[10px]"
        >
          <X size={10} />
        </button>
      </div>

      {/* Radial Action Buttons */}
      {actions.map((act, idx) => {
        const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
        const x = Math.round(Math.cos(angle) * radius);
        const y = Math.round(Math.sin(angle) * radius);
        const Icon = act.icon;

        return (
          <div
            key={act.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            <button
              onClick={() => {
                AudioService.playTerminalBeep(1100 + idx * 80, 0.03);
                onActionSelect?.(act.id, token);
                onClose?.();
              }}
              title={act.tooltip}
              className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center transition-all shadow-lg backdrop-blur-md hover:scale-110 active:scale-95 ${act.color}`}
            >
              <Icon size={16} />
              <span className="text-[8px] font-mono font-bold mt-0.5 tracking-tighter uppercase truncate max-w-[38px]">
                {act.id}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default TokenRadialActionWheel;
