import React from 'react';
import { 
  Coins, 
  Hammer, 
  Clock, 
  TrendingUp, 
  Layers, 
  Cpu, 
  Sparkles, 
  ShieldAlert, 
  Zap,
  Activity
} from 'lucide-react';
import { CraftingTimeTable } from './CraftingTimeTable';

const ICON_MAP = {
  Coins,
  Hammer,
  Clock,
  TrendingUp,
  Layers,
  Cpu,
  Zap,
  Activity
};

export const ComputedOutputPanel = ({
  computedOutputs = [],
  computedValues = {},
  matrix = {},
  isLoading = false
}) => {
  const creditValue = computedValues.credit_value ?? computedValues.cost ?? 0;

  return (
    <aside className="w-full lg:w-84 xl:w-96 flex flex-col gap-4 font-mono text-slate-200 shrink-0">
      {/* Top Header Card */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
            <Cpu size={16} className={isLoading ? 'animate-spin' : ''} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Omnicortex</span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[9px] text-slate-400 uppercase">Live Engine</span>
            </div>
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-white truncate">
              Derived Game Metrics
            </h4>
          </div>
        </div>

        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold uppercase">
          {isLoading ? 'Computing...' : 'Synchronized'}
        </span>
      </div>

      {/* Main Computed Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
        {computedOutputs.map((output) => {
          if (output.format === 'time_table') {
            // Rendered separately below
            return null;
          }

          const rawVal = computedValues[output.id];
          const Icon = ICON_MAP[output.icon] || Cpu;
          const displayColor = output.color || '#38bdf8';

          return (
            <div
              key={output.id}
              className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${displayColor}15`, border: `1px solid ${displayColor}40`, color: displayColor }}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-tight truncate">
                    {output.label}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {output.format === 'credits' ? (
                      <span className="text-sm font-extrabold text-amber-300 font-mono tracking-tight">
                        {typeof rawVal === 'number' ? rawVal.toLocaleString() : (rawVal || '0')} <span className="text-[10px] text-amber-500 font-normal">Cr</span>
                      </span>
                    ) : output.format === 'status_badge' ? (
                      <span className="text-xs font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40">
                        {rawVal?.name || rawVal || 'Standard'}
                      </span>
                    ) : output.format === 'badge' ? (
                      <span className="text-xs font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40">
                        {rawVal || 'Standard'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-100">
                        {typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal ?? '—')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded Crafting Time Table Widget */}
      <CraftingTimeTable creditValue={creditValue} defaultSkillCheck={20} />
    </aside>
  );
};

export default ComputedOutputPanel;
