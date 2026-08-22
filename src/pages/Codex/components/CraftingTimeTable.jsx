import React, { useState, useMemo } from 'react';
import { calculateAllCraftingTiers, formatCraftingDuration } from '../../../engines/tangentEconEngine';
import { Clock, Sliders, Wrench, Sparkles } from 'lucide-react';

export const CraftingTimeTable = ({
  creditValue = 2560,
  defaultSkillCheck = 20
}) => {
  const [skillCheck, setSkillCheck] = useState(defaultSkillCheck);

  const tiersData = useMemo(() => {
    const val = Math.max(0, Number(creditValue) || 0);
    return calculateAllCraftingTiers(val, skillCheck);
  }, [creditValue, skillCheck]);

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
          <Clock size={14} className="text-cyan-400" />
          <span>Production & Fabrication Times</span>
        </div>
        <span className="text-[10px] text-slate-400">
          Target: <strong className="text-amber-400 font-bold">{Number(creditValue || 0).toLocaleString()} PP</strong>
        </span>
      </div>

      {/* Skill Check Slider */}
      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Sliders size={12} className="text-amber-400" />
            <span>Crafter Skill Check:</span>
          </span>
          <span className="text-amber-300 font-extrabold text-xs">
            {skillCheck} <span className="text-[9px] text-slate-500 font-normal">(Daily PP base: {Math.max(1, skillCheck - 10)})</span>
          </span>
        </div>
        <input
          type="range"
          min="11"
          max="40"
          value={skillCheck}
          onChange={(e) => setSkillCheck(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
          <span>11 (Novice)</span>
          <span>20 (Journeyman)</span>
          <span>30 (Master)</span>
          <span>40 (Transcendent)</span>
        </div>
      </div>

      {/* 7-Tier Fabrication Timeline Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800/80">
        <table className="w-full text-left text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase tracking-tight text-[9px]">
              <th className="py-1.5 px-2">Tool Tier</th>
              <th className="py-1.5 px-1.5 text-center">Mult</th>
              <th className="py-1.5 px-1.5 text-right">Daily PP</th>
              <th className="py-1.5 px-2 text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {tiersData.map((tier) => {
              const isBasicOrAdv = tier.id === 'basic' || tier.id === 'advanced';
              return (
                <tr
                  key={tier.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isBasicOrAdv ? 'bg-cyan-950/20 text-slate-200' : 'text-slate-400'
                  }`}
                >
                  <td className="py-1.5 px-2 font-medium truncate max-w-[130px] flex items-center gap-1.5">
                    {isBasicOrAdv && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
                    <span>{tier.name}</span>
                  </td>
                  <td className="py-1.5 px-1.5 text-center text-slate-500">
                    {tier.multiplier}×
                  </td>
                  <td className="py-1.5 px-1.5 text-right font-bold text-slate-300">
                    {tier.dailyPP.toLocaleString()}
                  </td>
                  <td className="py-1.5 px-2 text-right font-bold text-amber-300">
                    {tier.formatted}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CraftingTimeTable;
