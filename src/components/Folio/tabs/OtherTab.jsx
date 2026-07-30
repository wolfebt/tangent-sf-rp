import React from 'react';
import { useFolio } from '../../../context/FolioContext';

const OtherTab = () => {
  const { characterData, updateField } = useFolio();
  const getNotes = () => {
    const val = characterData.notes;
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        return JSON.parse(val);
      } catch {
        return [{ text: val }];
      }
    }
    return [{ text: '' }];
  };

  const notes = getNotes();

  const updateNote = (index, text) => {
    const updated = [...notes];
    updated[index] = { text };
    updateField('notes', updated);
  };

  const addNote = () => {
    const updated = [...notes, { text: '' }];
    updateField('notes', updated);
  };

  const removeNote = (index) => {
    if (!window.confirm(`Are you sure you want to delete note entry #${index + 1}?`)) return;
    const updated = notes.filter((_, i) => i !== index);
    updateField('notes', updated.length > 0 ? updated : [{ text: '' }]);
  };

  return (
    <div className="tab-panel active p-4 space-y-6">
      <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Character Log & Miscellaneous Notes
          </h3>
          <button
            type="button"
            onClick={addNote}
            className="px-4 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            + Add Note Entry
          </button>
        </div>

        <div className="space-y-3">
          {notes.map((note, index) => (
            <div key={index} className="flex gap-2 items-start bg-slate-950/60 p-2.5 rounded border border-slate-800">
              <span className="text-xs font-mono text-cyan-500 font-bold mt-1.5">
                #{index + 1}
              </span>
              <textarea
                rows={2}
                value={note.text || ''}
                onChange={(e) => updateNote(index, e.target.value)}
                placeholder="Enter story notes, contacts, secrets, or quest logs..."
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-xs text-slate-100 outline-none resize-y"
              />
              <button
                type="button"
                onClick={() => removeNote(index)}
                className="text-slate-400 hover:text-red-400 text-lg font-bold px-2 py-1 leading-none transition-colors"
                title="Delete note"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(OtherTab);
