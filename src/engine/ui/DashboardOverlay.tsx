/**
 * @file DashboardOverlay.tsx
 * @description Stage 6.1: Glass-Cockpit HUD overlay and React Portal.
 * Uses pointer-events: none on the root viewport container to allow panning/zooming
 * and interaction with the underlying WebGPU Stage canvas, while restoring
 * pointer-events: auto on interactive dockable widgets, vitals, and action bars.
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEngineStore, selectAllFusedTokens } from '../state/VolatileSharder.ts';

export interface DashboardOverlayProps {
  campaignName?: string;
  onOpenOmnicortex?: () => void;
  onOpenFolio?: () => void;
  onOpenStoryFoundry?: () => void;
  onToggleTacticalGrid?: () => void;
  onPingStage?: (x: number, y: number) => void;
}

export const DashboardOverlay: React.FC<DashboardOverlayProps> = ({
  campaignName = 'TANGENT SECTOR COMMAND',
  onOpenOmnicortex,
  onOpenFolio,
  onOpenStoryFoundry,
  onToggleTacticalGrid
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const tokens = useEngineStore(selectAllFusedTokens);
  const activeToken = tokens.find(t => t.id === selectedTokenId) || tokens[0] || null;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  const overlayRoot = document.getElementById('ui-overlay-root') || document.body;

  return createPortal(
    <div 
      className="absolute inset-0 w-full h-full z-[100] overflow-hidden select-none"
      style={{ pointerEvents: 'none' }}
    >
      {/* Top Header Glass Banner */}
      <header 
        className="absolute top-4 left-4 right-4 flex items-center justify-between px-6 py-3 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-2xl"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-mono text-sm tracking-wider font-bold">
            {campaignName}
          </span>
          <span className="text-slate-500 font-mono text-xs">| THE STAGE HUD</span>
        </div>

        <nav className="flex items-center gap-2">
          <button 
            onClick={onOpenFolio}
            className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-all"
          >
            FOLIO (PERSONA)
          </button>
          <button 
            onClick={onOpenOmnicortex}
            className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-emerald-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-emerald-500/50 rounded-lg transition-all"
          >
            OMNICORTEX (GEAR & MECHA)
          </button>
          <button 
            onClick={onOpenStoryFoundry}
            className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-amber-500/50 rounded-lg transition-all"
          >
            STORY FOUNDRY
          </button>
          <button 
            onClick={onToggleTacticalGrid}
            className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-purple-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-purple-500/50 rounded-lg transition-all"
          >
            GRID / SCALE
          </button>
        </nav>
      </header>

      {/* Operative Vitals Cockpit Panel (Left) */}
      {activeToken && (
        <aside 
          className="absolute top-24 left-4 w-72 p-4 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl text-slate-200"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div>
              <h3 className="font-bold text-sm text-cyan-300">{activeToken.name}</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {activeToken.species || 'Human'} | {activeToken.archetype || 'Operative'}
              </p>
            </div>
            <select
              value={activeToken.id}
              onChange={(e) => setSelectedTokenId(e.target.value)}
              className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 focus:outline-none"
            >
              {tokens.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Vitals Progress Bar */}
          <div className="space-y-2 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">VITALITY / HP</span>
                <span className="text-emerald-400 font-bold">{activeToken.current_hp} / {activeToken.base_hp}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (activeToken.current_hp / activeToken.base_hp) * 100))}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/40">
                <span className="text-slate-400 block">ARMOR DR</span>
                <span className="text-amber-400 font-bold">{activeToken.armor_dr}</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/40">
                <span className="text-slate-400 block">SIZE MOD</span>
                <span className="text-purple-400 font-bold">{activeToken.size_modifier >= 0 ? `+${activeToken.size_modifier}` : activeToken.size_modifier}</span>
              </div>
            </div>

            {/* Conditions */}
            {activeToken.active_conditions.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 block mb-1">ACTIVE CONDITIONS</span>
                <div className="flex flex-wrap gap-1">
                  {activeToken.active_conditions.map(cond => (
                    <span key={cond} className="px-1.5 py-0.5 bg-red-950/60 text-red-300 border border-red-800/50 rounded text-[10px]">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Floating Tactical Action Bar (Bottom Center) */}
      <footer 
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 p-3 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-2xl shadow-2xl"
        style={{ pointerEvents: 'auto' }}
      >
        <button 
          onClick={() => console.log('Strike action initiated')}
          className="px-4 py-2 text-xs font-mono font-bold text-white bg-red-600/80 hover:bg-red-500 border border-red-400/50 rounded-xl transition-all shadow-lg shadow-red-900/40"
        >
          ATTACK / STRIKE
        </button>
        <button 
          onClick={() => console.log('Movement action initiated')}
          className="px-4 py-2 text-xs font-mono font-bold text-cyan-200 bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-500/50 rounded-xl transition-all"
        >
          MOVE (30 FT / 6 CELLS)
        </button>
        <button 
          onClick={() => console.log('Tactical scan')}
          className="px-4 py-2 text-xs font-mono font-bold text-amber-200 bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/50 rounded-xl transition-all"
        >
          SCAN / LOOS
        </button>
        <div className="h-6 w-px bg-slate-700" />
        <span className="text-slate-400 font-mono text-xs px-2">STAGE READY</span>
      </footer>
    </div>,
    overlayRoot
  );
};
