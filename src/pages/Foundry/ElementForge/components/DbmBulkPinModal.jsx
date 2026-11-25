import React from 'react';
import { CheckSquare, Database, Search, Square, X } from 'lucide-react';

/**
 * Bulk-pin modal that copies selected canonical OmniCortex entries into Campaign-local
 * Story Module storage (elementsCatalog) without mutating OmniCortex.
 */
export function DbmBulkPinModal({
  isOpen,
  onClose,
  activeType,
  matchingDbmItems = [],
  elementsCatalog = [],
  searchTerm = '',
  onChangeSearchTerm,
  selectedIds = new Set(),
  onChangeSelectedIds,
  isStoryReadOnly = false,
  onImportSelected
}) {
  if (!isOpen) return null;

  const q = String(searchTerm || '').toLowerCase();
  const filteredItems = matchingDbmItems.filter(
    (item) => !q || String(item.title || item.name || '').toLowerCase().includes(q)
  );

  const handleToggleSelectAll = () => {
    const visibleIds = filteredItems.map((i) => i.id);
    if (selectedIds.size === visibleIds.length && visibleIds.length > 0) {
      onChangeSelectedIds?.(new Set());
    } else {
      onChangeSelectedIds?.(new Set(visibleIds));
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto font-sans"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Sync ${activeType}s from Omnicortex DBM`}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0d1117] border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Pin {activeType}s from Omnicortex DBM
              </h3>
              <p className="text-xs text-slate-400">
                Pin read-only canonical compendium entries into your Story Module catalog (OmniCortex stays untouched).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close OmniCortex sync modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Selection Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Search ${matchingDbmItems.length} available DBM entries...`}
              value={searchTerm}
              onChange={(e) => onChangeSearchTerm?.(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <Search size={14} className="absolute left-3 top-2 text-slate-500" />
          </div>

          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors shrink-0 cursor-pointer"
          >
            {selectedIds.size > 0 ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin max-h-[50vh]">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const alreadyPinned = (elementsCatalog || []).some(
              (el) => el.fields?.dbmRef === item.id || el.id === `elem_dbm_${item.id}` || el.id === `elem_dbm_${item.dbmCategory}_${item.id}`
            );

            return (
              <div
                key={`${item.dbmCategory || 'dbm'}_${item.id}`}
                onClick={() => {
                  onChangeSelectedIds?.((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    return next;
                  });
                }}
                className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.15)] text-cyan-100'
                    : alreadyPinned
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-400 opacity-75'
                    : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 text-cyan-400">
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold truncate text-sm">{item.title || item.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-400 uppercase font-mono">
                        {item.dbmCategory || activeType}
                      </span>
                      {alreadyPinned && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono">
                          In Module
                        </span>
                      )}
                    </div>
                    {(item.description || item.concept || item.notes || item.summary) && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 pt-0.5">
                        {item.description || item.concept || item.notes || item.summary}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-400">
            {selectedIds.size} of {matchingDbmItems.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedIds.size === 0 || isStoryReadOnly}
              onClick={onImportSelected}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <Database size={13} />
              <span>Pin {selectedIds.size} Elements</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DbmBulkPinModal;
