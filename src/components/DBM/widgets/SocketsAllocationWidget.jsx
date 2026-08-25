import React from 'react';
import { Cpu, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SocketsAllocationWidget = ({
  sockets = {},
  onChange = () => {},
  isEditMode = true
}) => {
  const current = {
    max: Number(sockets?.max ?? 0),
    used: Number(sockets?.used ?? 0),
    tier: sockets?.tier || 'Socket',
    allocated: Array.isArray(sockets?.allocated) ? sockets.allocated : []
  };

  const handleFieldChange = (field, val) => {
    onChange({
      ...current,
      [field]: val
    });
  };

  const isOverCapacity = current.max > 0 && current.used > current.max;
  const isAtCapacity = current.max > 0 && current.used === current.max;
  const percent = current.max > 0 ? Math.min(100, Math.round((current.used / current.max) * 100)) : 0;

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Node':
        return 'text-indigo-400 border-indigo-500/40 bg-indigo-950/80';
      case 'Module':
        return 'text-purple-400 border-purple-500/40 bg-purple-950/80';
      case 'Mount':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/80';
      default:
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/80';
    }
  };

  if (!isEditMode) {
    if (current.max === 0 && current.used === 0) {
      return (
        <div className="text-xs text-slate-500 italic p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
          No socket capacity or UDU displacement configured.
        </div>
      );
    }

    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold ${getTierColor(current.tier)}`}>
              {current.tier} Tier
            </span>
            <span className="text-white font-bold">
              {current.used} / {current.max} {current.tier}s Allocated
            </span>
          </div>
          {isOverCapacity ? (
            <span className="text-rose-400 font-bold flex items-center gap-1 text-[10px]">
              <AlertCircle size={12} /> Over Capacity
            </span>
          ) : isAtCapacity ? (
            <span className="text-amber-400 font-bold flex items-center gap-1 text-[10px]">
              <CheckCircle2 size={12} /> Max Capacity
            </span>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
              <CheckCircle2 size={12} /> {current.max - current.used} Available
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {current.max > 0 && (
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all ${
                isOverCapacity
                  ? 'bg-rose-500'
                  : isAtCapacity
                  ? 'bg-amber-400'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu size={14} />
          <span>Sockets & UDU Allocation Object</span>
        </span>
        <span className="text-[10px] text-slate-500">Hardware & Capacity Budget</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Maximum Sockets */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase">
            Total Sockets / Capacity
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={current.max}
            onChange={e => handleFieldChange('max', Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full bg-slate-900 border border-slate-700 text-purple-300 font-bold p-2 rounded text-xs outline-none focus:border-purple-400"
            placeholder="0"
          />
        </div>

        {/* Sockets Used */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase">
            Sockets Used / Occupied
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={current.used}
            onChange={e => handleFieldChange('used', Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full bg-slate-900 border border-slate-700 text-white font-bold p-2 rounded text-xs outline-none focus:border-purple-400"
            placeholder="0"
          />
        </div>

        {/* Displacement Tier */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase">
            UDU Displacement Tier
          </label>
          <select
            value={current.tier}
            onChange={e => handleFieldChange('tier', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-cyan-300 font-bold p-2 rounded text-xs outline-none focus:border-cyan-400"
          >
            <option value="Node">Node (Micro-Chip / Tool Tier)</option>
            <option value="Socket">Socket (Standard Gear / Weapon Tier)</option>
            <option value="Module">Module (Vehicle / Armor Section Tier)</option>
            <option value="Mount">Mount (Mecha / Starship / Station Tier)</option>
          </select>
        </div>
      </div>

      {/* Visual Capacity Meter */}
      {current.max > 0 && (
        <div className="pt-2 space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-slate-400">
              Capacity: {current.used} / {current.max} ({percent}%)
            </span>
            <span className={isOverCapacity ? 'text-rose-400 font-extrabold' : isAtCapacity ? 'text-amber-400' : 'text-emerald-400'}>
              {isOverCapacity
                ? `⚠️ OVERBUDGET by ${current.used - current.max} ${current.tier}(s)`
                : `${current.max - current.used} Available`}
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all ${
                isOverCapacity
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : isAtCapacity
                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
