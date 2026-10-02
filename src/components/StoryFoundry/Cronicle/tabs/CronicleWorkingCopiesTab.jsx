import React from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';

export default function CronicleWorkingCopiesTab({
  workingCopies,
  elementsCatalog,
  storyPrefix,
  selectedElementToClone,
  setSelectedElementToClone,
  handleCloneSelectedElement,
  handleDeleteWorkingCopy
}) {
  return (
    <div className="flex flex-col gap-5">
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
          <div className="col-span-2 text-center py-10 text-slate-500 italic">
            No elements have been cloned into this story's working copy library yet.
          </div>
        )}
      </div>
    </div>
  );
}
