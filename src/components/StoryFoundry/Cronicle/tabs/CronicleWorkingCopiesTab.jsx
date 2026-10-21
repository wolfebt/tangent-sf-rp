import React from 'react';
import { Copy, Plus, Trash2, Search, Check, Boxes } from 'lucide-react';
import { getTypePillStyle } from '../../../../pages/Foundry/ElementForge/elementSchemas';

export default function CronicleWorkingCopiesTab({
  workingCopies,
  elementsCatalog,
  storyPrefix,
  selectedElementToClone,
  setSelectedElementToClone,
  handleCloneSelectedElement,
  handleDeleteWorkingCopy,
  elementsUsed = [],
  elementSearch = '',
  setElementSearch,
  elementTypeFilter = 'ALL',
  setElementTypeFilter,
  availableElementTypes = [],
  filteredElements = [],
  clonedFeedback = {},
  handleCloneAggregatedElement
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* SECTION 1: Working Copy Protocol & Active Working Copies */}
      <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-4 flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
          <Copy size={14} /> The Working Copy Protocol (Source Element Preservation)
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Base lore elements in your compendium and Elements Catalog are immutable templates. When imported into this story, they are cloned as story-prefixed Working Copies (e.g. <code className="text-cyan-300 font-mono">{storyPrefix || 'story'}_element_id</code>). All mutations made during narrative generation modify only the Working Copy, keeping source templates pristine for other campaigns.
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <select
            value={selectedElementToClone || ''}
            onChange={(e) => setSelectedElementToClone(e.target.value)}
            className="flex-1 min-w-[240px] bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none"
          >
            <option value="">-- Select Source Element to Clone --</option>
            {elementsCatalog.map(elem => (
              <option key={elem.id} value={elem.id}>
                {elem.title || 'Untitled'} [{elem.type || 'Element'}]
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCloneSelectedElement}
            disabled={!selectedElementToClone}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>Clone to Story Cronicle</span>
          </button>
        </div>
      </div>

      {/* Cloned Copies Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.values(workingCopies).map(copy => (
          <div key={copy.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-purple-300 truncate">
                {copy.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-slate-950 border border-purple-500/40 text-[9px] font-mono font-bold text-purple-400 rounded uppercase">
                  {copy.type}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteWorkingCopy(copy.id)}
                  className="text-slate-500 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                  title="Discard working copy"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex flex-col gap-0.5">
              <span>Working ID: <strong className="text-cyan-400">{copy.id}</strong></span>
              <span>Source ID: {copy.sourceElementId}</span>
              <span>Cloned: {new Date(copy.clonedAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {Object.keys(workingCopies).length === 0 && (
          <div className="col-span-2 text-center py-6 text-slate-500 italic text-xs font-mono bg-slate-950/40 border border-slate-800/80 rounded-xl">
            No elements have been cloned into this story&apos;s working copy library yet.
          </div>
        )}
      </div>

      {/* SECTION 2: Aggregated Story Elements Referenced Across Scenarios */}
      {setElementSearch && (
        <div className="flex flex-col space-y-4 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Boxes size={15} className="text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
              Aggregated Campaign Elements Referenced in Scenarios
            </h3>
          </div>

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
                All
              </button>
            </div>
          </div>

          {filteredElements.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic text-xs font-mono bg-slate-950/60 border border-slate-800 rounded-xl">
              No referenced story elements matched your current filter criteria.
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
      )}
    </div>
  );
}
