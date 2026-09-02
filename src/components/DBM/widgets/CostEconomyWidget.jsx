import React from 'react';
import { Coins, Zap, Shield, Cpu, Sparkles, Activity } from 'lucide-react';

export const CostEconomyWidget = ({
  costs = {},
  onChange = () => {},
  isEditMode = true
}) => {
  const currentCosts = {
    bp: Number(costs.bp ?? costs.cp ?? 0),
    cp: Number(costs.cp ?? costs.bp ?? 0),
    credits: Number(costs.credits ?? 0),
    nodes: Number(costs.nodes ?? 0),
    sockets: Number(costs.sockets ?? 0),
    strain: Number(costs.strain ?? 0),
    focus: Number(costs.focus ?? 0),
    ap: Number(costs.ap ?? 0)
  };

  const handleFieldChange = (field, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = {
      ...currentCosts,
      [field]: num
    };
    if (field === 'cp' || field === 'bp') {
      updated.cp = num;
      updated.bp = num;
    }
    onChange(updated);
  };

  if (!isEditMode) {
    const hasAnyCost = Object.values(currentCosts).some(v => v > 0);
    if (!hasAnyCost) {
      return (
        <div className="text-xs text-slate-500 italic p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
          No resource expenditures or costs defined.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        {currentCosts.credits > 0 && (
          <div className="bg-slate-950 p-2 rounded-lg border border-amber-500/30 flex items-center gap-2">
            <Coins size={14} className="text-amber-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-500 uppercase">Credits</span>
              <span className="text-amber-300 font-bold">{currentCosts.credits.toLocaleString()} Cr</span>
            </div>
          </div>
        )}
        {(currentCosts.cp > 0 || currentCosts.bp > 0) && (
          <div className="bg-slate-950 p-2 rounded-lg border border-cyan-500/30 flex items-center gap-2">
            <Zap size={14} className="text-cyan-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-500 uppercase">Character Points</span>
              <span className="text-cyan-300 font-bold">{currentCosts.cp || currentCosts.bp} CP</span>
            </div>
          </div>
        )}
        {currentCosts.ap > 0 && (
          <div className="bg-slate-950 p-2 rounded-lg border border-emerald-500/30 flex items-center gap-2">
            <Activity size={14} className="text-emerald-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-500 uppercase">Action Points</span>
              <span className="text-emerald-300 font-bold">{currentCosts.ap} AP</span>
            </div>
          </div>
        )}
        {currentCosts.sockets > 0 && (
          <div className="bg-slate-950 p-2 rounded-lg border border-purple-500/30 flex items-center gap-2">
            <Cpu size={14} className="text-purple-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-500 uppercase">Sockets</span>
              <span className="text-purple-300 font-bold">{currentCosts.sockets}</span>
            </div>
          </div>
        )}
        {currentCosts.nodes > 0 && (
          <div className="bg-slate-950 p-2 rounded-lg border border-indigo-500/30 flex items-center gap-2">
            <Cpu size={14} className="text-indigo-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-500 uppercase">Nodes</span>
              <span className="text-indigo-300 font-bold">{currentCosts.nodes}</span>
            </div>
          </div>
        )}
        {currentCosts.strain > 0 && (
          <div className="bg-slate-950 p-2 rounded-lg border border-rose-500/30 flex items-center gap-2">
            <Shield size={14} className="text-rose-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-500 uppercase">Strain</span>
              <span className="text-rose-300 font-bold">{currentCosts.strain}</span>
            </div>
          </div>
        )}
        {currentCosts.focus > 0 && (
          <div className="bg-slate-950 p-2 rounded-lg border border-sky-500/30 flex items-center gap-2">
            <Sparkles size={14} className="text-sky-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-500 uppercase">Focus</span>
              <span className="text-sky-300 font-bold">{currentCosts.focus}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Coins size={14} />
          <span>Unified Costs & Economy Map</span>
        </span>
        <span className="text-[10px] text-slate-500">Structured Resource Expenditures</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Credits */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Coins size={11} className="text-amber-400" />
            <span>Credits (Cr)</span>
          </label>
          <input
            type="number"
            min="0"
            step="10"
            value={currentCosts.credits}
            onChange={e => handleFieldChange('credits', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold p-1.5 rounded text-xs outline-none focus:border-amber-400"
            placeholder="0"
          />
        </div>

        {/* CP */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Zap size={11} className="text-cyan-400" />
            <span>Character Points (CP)</span>
          </label>
          <input
            type="number"
            min="0"
            value={currentCosts.cp || currentCosts.bp}
            onChange={e => handleFieldChange('cp', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-cyan-300 font-bold p-1.5 rounded text-xs outline-none focus:border-cyan-400"
            placeholder="0"
          />
        </div>

        {/* AP */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Activity size={11} className="text-emerald-400" />
            <span>Action Points (AP)</span>
          </label>
          <input
            type="number"
            min="0"
            value={currentCosts.ap}
            onChange={e => handleFieldChange('ap', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-emerald-300 font-bold p-1.5 rounded text-xs outline-none focus:border-emerald-400"
            placeholder="0"
          />
        </div>

        {/* Sockets */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Cpu size={11} className="text-purple-400" />
            <span>Socket Cost</span>
          </label>
          <input
            type="number"
            min="0"
            value={currentCosts.sockets}
            onChange={e => handleFieldChange('sockets', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-purple-300 font-bold p-1.5 rounded text-xs outline-none focus:border-purple-400"
            placeholder="0"
          />
        </div>

        {/* Nodes */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Cpu size={11} className="text-indigo-400" />
            <span>Node Cost</span>
          </label>
          <input
            type="number"
            min="0"
            value={currentCosts.nodes}
            onChange={e => handleFieldChange('nodes', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-indigo-300 font-bold p-1.5 rounded text-xs outline-none focus:border-indigo-400"
            placeholder="0"
          />
        </div>

        {/* Strain */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Shield size={11} className="text-rose-400" />
            <span>Strain Cost</span>
          </label>
          <input
            type="number"
            min="0"
            value={currentCosts.strain}
            onChange={e => handleFieldChange('strain', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-rose-300 font-bold p-1.5 rounded text-xs outline-none focus:border-rose-400"
            placeholder="0"
          />
        </div>

        {/* Focus */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Sparkles size={11} className="text-sky-400" />
            <span>Focus Cost</span>
          </label>
          <input
            type="number"
            min="0"
            value={currentCosts.focus}
            onChange={e => handleFieldChange('focus', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-sky-300 font-bold p-1.5 rounded text-xs outline-none focus:border-sky-400"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
};
