import React from 'react';
import { AlertTriangle, CheckCircle2, Layers, Cpu, Shield, Box } from 'lucide-react';

const TIER_ICONS = {
  Node: Cpu,
  Socket: Layers,
  Mount: Shield,
  Module: Box
};

export const UDUCapacityMeter = ({
  label = 'Capacity Budget',
  used = 0,
  max = 10,
  tier = 'Socket',
  color = '#06b6d4'
}) => {
  const numUsed = Math.max(0, Number(used) || 0);
  const numMax = Math.max(0, Number(max) || 0);
  const remaining = numMax - numUsed;
  const isOverBudget = numUsed > numMax;
  const percentUsed = numMax > 0 ? Math.min(100, Math.round((numUsed / numMax) * 100)) : (numUsed > 0 ? 100 : 0);

  const Icon = TIER_ICONS[tier] || Layers;

  // Determine meter color state
  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';

  if (isOverBudget) {
    barColor = 'bg-rose-500 animate-pulse';
    badgeColor = 'text-rose-400 border-rose-500/50 bg-rose-950/80';
  } else if (percentUsed > 80) {
    barColor = 'bg-amber-500';
    badgeColor = 'text-amber-400 border-amber-500/40 bg-amber-950/40';
  } else if (percentUsed > 60) {
    barColor = 'bg-cyan-500';
    badgeColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
  }

  return (
    <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 space-y-2 font-mono text-xs shadow-inner">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon size={14} style={{ color }} className="shrink-0" />
          <span className="font-bold text-slate-300 uppercase tracking-tight text-[11px] truncate">
            {label}
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
            {tier}
          </span>
        </div>

        <div className={`px-2 py-0.5 rounded border text-[10px] font-extrabold flex items-center gap-1 shrink-0 ${badgeColor}`}>
          {isOverBudget ? (
            <>
              <AlertTriangle size={11} />
              <span>OVERFLOW +{numUsed - numMax}</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={11} />
              <span>{numUsed} / {numMax}</span>
            </>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800 flex items-center">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(100, isOverBudget ? 100 : percentUsed)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[9px] text-slate-500">
        <span>Used: {numUsed}</span>
        <span>
          {isOverBudget ? (
            <strong className="text-rose-400">Budget Exceeded</strong>
          ) : (
            <span>Remaining: <strong className="text-slate-300">{remaining}</strong></span>
          )}
        </span>
      </div>
    </div>
  );
};

export default UDUCapacityMeter;
