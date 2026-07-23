import React, { useState } from 'react';

const EconomyModal = ({ isOpen, onClose, characterData, updateField, economyBreakdown }) => {
  const [activeTab, setActiveTab] = useState('pools'); // 'pools' | 'itemized'

  if (!isOpen || !economyBreakdown) return null;

  const {
    startingCP,
    spentCP,
    remainingCP,
    identityPools = {},
    itemizedList = []
  } = economyBreakdown;

  // Identity pool categories to render
  const identityCategories = [
    { key: 'occupation', label: 'Occupation', data: identityPools.occupation },
    { key: 'origin', label: 'Origin', data: identityPools.origin },
    { key: 'faction', label: 'Faction', data: identityPools.faction },
    { key: 'species', label: 'Species', data: identityPools.species }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#121824] border border-cyan-500/60 rounded-xl max-w-2xl w-full p-6 shadow-[0_0_30px_rgba(34,211,238,0.2)] text-slate-100 space-y-6 my-6 flex flex-col max-h-[90vh]">
        
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
            className="text-slate-400 hover:text-white text-xl font-bold leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* CP Overview Summary Cards (Counters) */}
        <div className="grid grid-cols-3 gap-4 text-center bg-slate-900/90 p-4 rounded-lg border border-slate-800">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              Starting CP
            </label>
            <input
              type="number"
              step="5"
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
              {spentCP} CP
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              Remaining CP
            </span>
            <span className={`text-lg font-bold font-mono py-0.5 ${remainingCP >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {remainingCP} CP
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('pools')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'pools'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Identity Point Pools
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('itemized')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'itemized'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Itemized CP Expenditures ({itemizedList.length})
          </button>
        </div>

        {/* Tab 1: Identity Point Pools */}
        {activeTab === 'pools' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {identityCategories.map(({ key, label, data }) => {
                const name = data?.name || 'Not Selected';
                const pools = data?.pools || [];
                const isSelected = name && name !== 'Not Selected';

                return (
                  <div key={key} className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
                    <div className="flex justify-between items-start border-b border-slate-800/80 pb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                        {label}
                      </span>
                      <span className={`text-xs font-semibold truncate max-w-[140px] ${isSelected ? 'text-amber-300' : 'text-slate-500 italic'}`}>
                        {name}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1 pt-1">
                      {pools.length > 0 ? (
                        pools.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded text-xs">
                            <span className="text-slate-300 font-medium">{p.name || 'Granted Pool'}</span>
                            <span className="font-mono font-bold text-emerald-400">
                              +{p.awarded} {p.type || 'Points'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-center text-[11px] text-slate-500 italic bg-slate-900/40 rounded border border-slate-800/50">
                          {isSelected ? 'No custom point pools allotted.' : 'Select an entry to view allotted pools.'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Itemized Expenditures */}
        {activeTab === 'itemized' && (
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Detailed Expenditures List
            </h4>
            <div className="bg-slate-950/80 border border-slate-800 rounded flex-1 overflow-y-auto text-xs divide-y divide-slate-800/60 max-h-72">
              {itemizedList.length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic">No point expenditures recorded.</div>
              ) : (
                itemizedList.map((item, idx) => {
                  const costVal = item.costVal !== undefined ? item.costVal : parseInt(item.cost, 10);
                  
                  // Color coding for cost
                  let costColor = 'text-amber-400'; // Default positive cost
                  if (costVal < 0) {
                    costColor = 'text-emerald-400'; // Refund
                  } else if (costVal === 0) {
                    costColor = 'text-cyan-300/80'; // 0 CP
                  }

                  return (
                    <div key={idx} className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-900/60 transition-colors">
                      <span className="col-span-3 font-bold uppercase text-[10px] text-cyan-400 tracking-wider truncate">
                        {item.category}
                      </span>
                      <span className="col-span-4 font-medium text-slate-200 truncate pr-2">
                        {item.item}
                      </span>
                      <span className="col-span-3 text-slate-400 text-center font-mono text-[11px] truncate">
                        {item.val}
                      </span>
                      <span className={`col-span-2 text-right font-mono font-bold ${costColor}`}>
                        {item.cost}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  );
};

export default React.memo(EconomyModal);
