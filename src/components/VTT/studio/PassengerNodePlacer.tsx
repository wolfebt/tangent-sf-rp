/**
 * @file PassengerNodePlacer.tsx
 * @description Interactive visual placer for Vehicle passenger seat nodes
 * (pilot, copilot, gunner, passenger, cargo) and UDU hardpoint sockets.
 */

import React, { useState } from 'react';
import { Users, Crosshair, Trash2 } from 'lucide-react';
import type { VehicleHullProperties } from '../../../schemas/assetUnitSchema';

type PassengerRole = VehicleHullProperties['passengerNodes'][number]['role'];
type HardpointTier = VehicleHullProperties['hardpointSockets'][number]['tier'];

export interface PassengerNodePlacerProps {
  imageUrl: string;
  dimensions: [number, number];
  passengerNodes: VehicleHullProperties['passengerNodes'];
  hardpointSockets: VehicleHullProperties['hardpointSockets'];
  onChangePassengers: (nodes: VehicleHullProperties['passengerNodes']) => void;
  onChangeHardpoints: (sockets: VehicleHullProperties['hardpointSockets']) => void;
}

const PASSENGER_ROLES: PassengerRole[] = ['pilot', 'copilot', 'gunner', 'passenger', 'cargo'];
const HARDPOINT_TIERS: HardpointTier[] = ['node', 'socket', 'mount', 'module'];

export const PassengerNodePlacer: React.FC<PassengerNodePlacerProps> = ({
  imageUrl,
  dimensions,
  passengerNodes = [],
  hardpointSockets = [],
  onChangePassengers,
  onChangeHardpoints
}) => {
  const cols = Math.max(1, Math.min(8, Number(dimensions?.[0]) || 2));
  const rows = Math.max(1, Math.min(8, Number(dimensions?.[1]) || 2));
  const [placementMode, setPlacementMode] = useState<'passenger' | 'hardpoint'>('passenger');
  const [activeRole, setActiveRole] = useState<PassengerRole>('pilot');
  const [activeTier, setActiveTier] = useState<HardpointTier>('mount');
  const [arcFacing, setArcFacing] = useState<number>(0);

  const handleCellClick = (col: number, row: number) => {
    if (placementMode === 'passenger') {
      const nextNode = {
        id: `seat_${col}_${row}_${Date.now().toString(36).slice(-4)}`,
        role: activeRole,
        cellOffset: [col, row] as [number, number]
      };
      onChangePassengers([...passengerNodes, nextNode]);
    } else {
      const relX = Number(((col + 0.5) / cols).toFixed(2));
      const relY = Number(((row + 0.5) / rows).toFixed(2));
      const nextSocket = {
        slotId: `hp_${col}_${row}_${Date.now().toString(36).slice(-4)}`,
        tier: activeTier,
        relativeCoords: [relX, relY] as [number, number],
        arcFacingDegrees: arcFacing
      };
      onChangeHardpoints([...hardpointSockets, nextSocket]);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="text-cyan-300 font-semibold">Vehicle Seats &amp; Hardpoint Sockets</span>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setPlacementMode('passenger')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] ${
              placementMode === 'passenger'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Place Seat</span>
          </button>
          <button
            type="button"
            onClick={() => setPlacementMode('hardpoint')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] ${
              placementMode === 'hardpoint'
                ? 'bg-amber-700 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>Place Hardpoint</span>
          </button>
        </div>
      </div>

      {/* Mode Controls */}
      {placementMode === 'passenger' ? (
        <div className="flex items-center space-x-2">
          <label className="text-[11px] text-slate-400">Seat Role:</label>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as PassengerRole)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize"
          >
            {PASSENGER_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-slate-400 mb-0.5">UDU Tier</label>
            <select
              value={activeTier}
              onChange={(e) => setActiveTier(e.target.value as HardpointTier)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize"
            >
              {HARDPOINT_TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-0.5">Arc Facing (°)</label>
            <input
              type="number"
              min="0"
              max="359"
              step="45"
              value={arcFacing}
              onChange={(e) => setArcFacing(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
            />
          </div>
        </div>
      )}

      {/* Interactive Cell Grid Overlay */}
      <div className="relative w-56 h-56 mx-auto bg-slate-900 border border-slate-700 rounded overflow-hidden">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Vehicle Hull"
            className="absolute inset-0 w-full h-full object-contain opacity-75 pointer-events-none p-1"
          />
        )}
        <div
          className="relative z-10 grid w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((__, c) => {
              const seatsHere = passengerNodes.filter(
                (n) => n.cellOffset[0] === c && n.cellOffset[1] === r
              );
              return (
                <button
                  key={`${c}_${r}`}
                  type="button"
                  onClick={() => handleCellClick(c, r)}
                  title={`Cell (${c}, ${r}) — Click to add ${placementMode}`}
                  className="border border-cyan-500/25 hover:bg-cyan-500/20 flex flex-col items-center justify-center text-[9px] text-cyan-200 transition-colors cursor-crosshair"
                >
                  {seatsHere.length > 0 && (
                    <span className="px-1 rounded bg-cyan-900/90 border border-cyan-400/60 font-bold uppercase">
                      {seatsHere[0].role.slice(0, 3)}
                      {seatsHere.length > 1 ? `+${seatsHere.length - 1}` : ''}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
        {/* Hardpoint Markers */}
        {hardpointSockets.map((hp) => (
          <div
            key={hp.slotId}
            style={{
              left: `${hp.relativeCoords[0] * 100}%`,
              top: `${hp.relativeCoords[1] * 100}%`
            }}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 border border-black pointer-events-none"
            title={`${hp.tier} (${hp.arcFacingDegrees}°)`}
          />
        ))}
      </div>

      {/* Node Lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <div className="space-y-1">
          <div className="text-slate-400 font-semibold">Seats ({passengerNodes.length})</div>
          {passengerNodes.map((n) => (
            <div key={n.id} className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span className="capitalize text-cyan-200">{n.role} [{n.cellOffset[0]}, {n.cellOffset[1]}]</span>
              <button
                type="button"
                onClick={() => onChangePassengers(passengerNodes.filter((p) => p.id !== n.id))}
                className="text-slate-500 hover:text-rose-400"
                aria-label={`Remove ${n.role} seat`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <div className="text-slate-400 font-semibold">Hardpoints ({hardpointSockets.length})</div>
          {hardpointSockets.map((hp) => (
            <div key={hp.slotId} className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span className="capitalize text-amber-200">{hp.tier} • {hp.arcFacingDegrees}°</span>
              <button
                type="button"
                onClick={() => onChangeHardpoints(hardpointSockets.filter((h) => h.slotId !== hp.slotId))}
                className="text-slate-500 hover:text-rose-400"
                aria-label={`Remove ${hp.tier} hardpoint`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PassengerNodePlacer;
