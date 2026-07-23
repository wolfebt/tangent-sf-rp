import React, { useState } from 'react';

const EconomyModal = ({ isOpen, onClose, characterData, updateField, economyBreakdown }) => {
  const [activeTab, setActiveTab] = useState('pools'); // 'pools' | 'itemized'

  if (!isOpen || !economyBreakdown) return null;

  const {
    startingCP,
    spentCP,
    remainingCP,
    spPools,
    fpPools,
    bonusCounters,
    itemizedList
  } = economyBreakdown;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#121824] border border-cyan-500/60 rounded-xl max-w-2xl w-full p-6 shadow-[0_0_30px_rgba(34,211,238,0.2)] text-slate-100 space-y-6 my-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold uppercase tracking-wider text-cyan-400">
              Character Point Economy Breakdown
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {/* CP Overview Summary Cards */}
        <div className="grid grid-cols-3 gap-4 text-center bg-slate-900/80 p-4 rounded-lg border border-slate-800">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              Starting CP
            </label>
            <input
              type="number"
              step="50"
              value={startingCP}
              onChange={(e) => updateField('starting-cp', parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded text-center py-1 text-sm font-mono font-bold text-cyan-300 outline-none"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              Spent CP
            </span>
            <span className="text-lg font-bold font-mono text-amber-400 py-0.5">
              {spentCP}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              Remaining CP
            </span>
            <span className={`text-lg font-bold font-mono py-0.5 ${remainingCP >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {remainingCP}
            </span>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('pools')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'pools'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Point Pools & Choice Allowances
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('itemized')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'itemized'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Itemized CP Expenditures ({itemizedList.length})
          </button>
        </div>

        {/* Tab 1: Pools & Choice Allowances */}
        {activeTab === 'pools' && (
          <div className="space-y-5">
            {/* Bonus Choice Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded border border-slate-800 text-center">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400">Skill Choices</span>
                <span className="text-sm font-bold font-mono text-cyan-300">{bonusCounters.skillChoices} Remaining</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400">Feature Choices</span>
                <span className="text-sm font-bold font-mono text-amber-300">{bonusCounters.featureChoices} Remaining</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400">Disciplines</span>
                <span className="text-sm font-bold font-mono text-purple-300">{bonusCounters.disciplines.current} Selected</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400">Special Abilities</span>
                <span className="text-sm font-bold font-mono text-emerald-300">{bonusCounters.specialAbilities.current} Selected</span>
              </div>
            </div>

            {/* Skill Point Pools Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Skill Point Economy Pools (SP)
              </h4>
              <div className="bg-slate-950/60 border border-slate-800 rounded overflow-hidden text-xs">
                <div className="grid grid-cols-4 bg-slate-900 p-2 font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <span>Category</span>
                  <span className="text-center">Awarded</span>
                  <span className="text-center">Used</span>
                  <span className="text-center">Remaining</span>
                </div>
                {Object.entries(spPools).map(([cat, pool]) => (
                  <div key={cat} className="grid grid-cols-4 p-2 border-b border-slate-800/40 text-slate-200 items-center font-mono">
                    <span className="uppercase font-sans font-semibold text-slate-300">{cat}</span>
                    <span className="text-center text-cyan-400">{pool.total} SP</span>
                    <span className="text-center text-amber-400">{pool.used} SP</span>
                    <span className="text-center text-emerald-400">{pool.total - pool.used} SP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Point Pools Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Feature Point Economy Pools (FP)
              </h4>
              <div className="bg-slate-950/60 border border-slate-800 rounded overflow-hidden text-xs">
                <div className="grid grid-cols-4 bg-slate-900 p-2 font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <span>Category</span>
                  <span className="text-center">Awarded</span>
                  <span className="text-center">Used</span>
                  <span className="text-center">Remaining</span>
                </div>
                {Object.entries(fpPools).map(([cat, pool]) => (
                  <div key={cat} className="grid grid-cols-4 p-2 border-b border-slate-800/40 text-slate-200 items-center font-mono">
                    <span className="uppercase font-sans font-semibold text-slate-300">{cat}</span>
                    <span className="text-center text-purple-400">{pool.total} FP</span>
                    <span className="text-center text-amber-400">{pool.used} FP</span>
                    <span className="text-center text-emerald-400">{pool.total - pool.used} FP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Itemized Expenditures */}
        {activeTab === 'itemized' && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Detailed Expenditures List
            </h4>
            <div className="bg-slate-950/80 border border-slate-800 rounded max-h-72 overflow-y-auto text-xs divide-y divide-slate-800/60">
              {itemizedList.length === 0 ? (
                <div className="p-4 text-center text-slate-500 italic">No points spent yet.</div>
              ) : (
                itemizedList.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-900/60 transition-colors">
                    <span className="col-span-3 font-bold uppercase text-[10px] text-cyan-400 tracking-wider">
                      {item.category}
                    </span>
                    <span className="col-span-4 font-medium text-slate-200 truncate">
                      {item.item}
                    </span>
                    <span className="col-span-3 text-slate-400 text-center font-mono text-[11px]">
                      {item.val}
                    </span>
                    <span className={`col-span-2 text-right font-mono font-bold ${item.cost.startsWith('-') ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.cost}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  );
};

export default React.memo(EconomyModal);
