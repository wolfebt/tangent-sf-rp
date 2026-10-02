import React from 'react';
import { Search, Check, Copy } from 'lucide-react';
import { getTypePillStyle } from '../../../../pages/Foundry/ElementForge/elementSchemas';

export default function CronicleAggregatedElementsTab({
  elementsUsed,
  elementSearch,
  setElementSearch,
  elementTypeFilter,
  setElementTypeFilter,
  availableElementTypes,
  filteredElements,
  workingCopies,
  clonedFeedback,
  handleCloneAggregatedElement
}) {
  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Search & Type Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={elementSearch}
            onChange={(e) => setElementSearch(e.target.value)}
            placeholder="Search elements used by title, type, scenario, or content..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {availableElementTypes.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setElementTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer shrink-0 ${
                elementTypeFilter === t
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/80'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setElementTypeFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer shrink-0 ${
              elementTypeFilter === 'ALL'
                ? 'bg-purple-950 text-purple-300 border border-purple-500/80'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            All ({elementsUsed.length})
          </button>
        </div>
      </div>

      {/* Elements Grid */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
        {filteredElements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic text-xs font-mono bg-slate-950/60 border border-slate-800 rounded-xl">
            No elements matched your current filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredElements.map(el => {
              const matchingCopy = Object.values(workingCopies).find(
                c => c.sourceElementId === el.id || c.id === el.id
              );
              const isCloned = !!matchingCopy;
              const isCloningJustNow = clonedFeedback[el.id];

              return (
                <div
                  key={el.id}
                  className="p-4 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between gap-3 shadow-sm transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-100 text-sm">
                          {el.title || el.name || 'Untitled Element'}
                        </h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${getTypePillStyle(el.type || 'Custom')}`}>
                          {el.type || 'Custom'}
                        </span>
                      </div>

                      {isCloned ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/50 uppercase font-bold flex items-center gap-1 shrink-0">
                          <Check size={10} className="text-emerald-400" />
                          Working Copy Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCloneAggregatedElement(el)}
                          className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 hover:text-white text-[10px] font-mono font-bold uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                          title="Clone this lore element into a story-prefixed mutable Working Copy for this campaign"
                        >
                          {isCloningJustNow ? (
                            <>
                              <Check size={11} className="text-emerald-400" />
                              <span>Cloned!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Clone as Working Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {el.summary && (
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {el.summary}
                      </p>
                    )}
                  </div>

                  {/* Footer: Referenced Scenarios and IDs */}
                  <div className="pt-2 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                    <div className="flex items-center gap-1 text-slate-400 flex-wrap">
                      <span className="text-slate-500 font-bold">Referenced in:</span>
                      {(el.usedIn && el.usedIn.length > 0) ? (
                        el.usedIn.map((scene, idx) => (
                          <span key={idx} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                            {scene}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic">General Lore</span>
                      )}
                    </div>
                    <span className="text-slate-500">
                      ID: <code className="text-cyan-400">{el.id}</code>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
