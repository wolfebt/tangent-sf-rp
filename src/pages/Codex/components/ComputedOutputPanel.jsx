import React, { useMemo } from 'react';
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
  Activity,
  Maximize2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { CraftingTimeTable } from './CraftingTimeTable';
import { validateAssetScaling, validateAssetValuation, getScalingCategory } from '../../../engines/tangentScalingEngine';

const ICON_MAP = {
  Coins,
  Hammer,
  Clock,
  TrendingUp,
  Layers,
  Cpu,
  Zap,
  Activity,
  Maximize2
};

export const ComputedOutputPanel = ({
  computedOutputs = [],
  computedValues = {},
  formData = {},
  matrix = {},
  isLoading = false
}) => {
  const effectiveDC = Number(
    formData.craft_dc ?? formData.design_dc ?? formData.dc ?? formData.tier_dc ?? computedValues.craft_dc ?? 0
  ) || 0;
  
  const enteredCost = formData.cost !== undefined && formData.cost !== null && formData.cost !== '' 
    ? Number(formData.cost) 
    : (computedValues.credit_value ?? computedValues.cost ?? 0);

  const creditValue = computedValues.credit_value ?? computedValues.cost ?? enteredCost ?? 0;

  // Real-time scaling and valuation diagnostics
  const diagnostics = useMemo(() => {
    const sizeVal = formData.size || formData.sizeCategory || formData.footprint || 'Medium';
    const scale = validateAssetScaling({
      ...formData,
      size: sizeVal
    });
    const valuation = validateAssetValuation(effectiveDC, enteredCost);
    return { scale, valuation, sizeVal };
  }, [formData, effectiveDC, enteredCost]);

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

      {/* Real-time Scaling & Valuation Diagnostics Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-1.5">
            <Maximize2 size={13} className="text-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
              Scale & Valuation Checker
            </span>
          </div>
          <span className="text-[10px] text-cyan-300 font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30">
            {diagnostics.scale.scaleCategory} ({diagnostics.scale.scaleDisplay})
          </span>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 text-center">
            <span className="text-slate-500 block">STR Mod</span>
            <span className="text-amber-400 font-bold">
              {diagnostics.scale.strMod >= 0 ? `+${diagnostics.scale.strMod}` : diagnostics.scale.strMod}
            </span>
          </div>
          <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 text-center">
            <span className="text-slate-500 block">Combat Mod</span>
            <span className="text-blue-400 font-bold">
              {diagnostics.scale.combatMod >= 0 ? `+${diagnostics.scale.combatMod}` : diagnostics.scale.combatMod}
            </span>
          </div>
          <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 text-center">
            <span className="text-slate-500 block">Reach</span>
            <span className="text-slate-300 font-bold">{diagnostics.scale.reach}</span>
          </div>
        </div>

        {/* Valuation badge */}
        <div 
          className="p-2 rounded-lg border text-[11px] font-bold flex items-center justify-between"
          style={{ 
            borderColor: diagnostics.valuation.color, 
            background: `${diagnostics.valuation.color}15`,
            color: diagnostics.valuation.color 
          }}
        >
          <span className="truncate">{diagnostics.valuation.status}</span>
          <span className="text-[10px] opacity-80 shrink-0">
            {diagnostics.valuation.ratio}x TSC
          </span>
        </div>

        {/* Warnings if any */}
        {diagnostics.scale.warnings.length > 0 && (
          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[10px] space-y-1">
            <div className="flex items-center gap-1 font-bold">
              <AlertTriangle size={11} />
              <span>Scaling Rule Notice</span>
            </div>
            {diagnostics.scale.warnings.map((w, idx) => (
              <div key={idx} className="text-amber-200/90">{w}</div>
            ))}
          </div>
        )}
      </div>

      {/* Embedded Crafting Time Table Widget */}
      <CraftingTimeTable creditValue={creditValue} defaultSkillCheck={20} />
    </aside>
  );
};

export default ComputedOutputPanel;

