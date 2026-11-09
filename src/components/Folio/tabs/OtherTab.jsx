import React, { useRef, useLayoutEffect, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useFolio } from '../../../context/FolioContext';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import ChatParser from '../../UI/ChatParser';
import { Link2, Plus, Trash2 } from 'lucide-react';

const AutoExpandingNoteTextarea = ({ value, onChange, placeholder, className, emptyShadowStyle }) => {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(48, el.scrollHeight)}px`;
    }
  }, []);

  useLayoutEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      rows={2}
      value={value || ''}
      onChange={(e) => {
        onChange(e.target.value);
        adjustHeight();
      }}
      placeholder={placeholder}
      className={`${className} resize-none overflow-hidden ${emptyShadowStyle}`}
      style={{ fieldSizing: 'content' }}
    />
  );
};

const OtherTab = () => {
  const { characterData, updateField, isLocked, isPlayerOverride } = useFolio();
  const isSheetLocked = Boolean(isLocked && !isPlayerOverride);

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

  const removeNote = async (index) => {
    const targetNote = notes[index];
    const noteLabel = targetNote?.text ? targetNote.text.substring(0, 20) : `Note #${index + 1}`;
    if (!(await confirmTypedDeletion(noteLabel, 'note entry'))) return;
    const updated = notes.filter((_, i) => i !== index);
    updateField('notes', updated.length > 0 ? updated : [{ text: '' }]);
  };

  // Custom Fields (Synced with Story Persona Element & MCM)
  const customFields = useMemo(() => {
    const raw = characterData?.customFields;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.trim().startsWith('[')) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  }, [characterData?.customFields]);

  const handleAddCustomField = () => {
    const next = [...customFields, { id: uuidv4(), label: '', value: '' }];
    updateField('customFields', next);
  };

  const handleUpdateCustomField = (id, key, val) => {
    const next = customFields.map((cf) => (cf.id === id ? { ...cf, [key]: val } : cf));
    updateField('customFields', next);
  };

  const handleRemoveCustomField = (id) => {
    const next = customFields.filter((cf) => cf.id !== id);
    updateField('customFields', next);
  };

  const hasAnyNotes = notes.some(n => n.text && n.text.trim());

  return (
    <div className="tab-panel active p-4 space-y-6 pb-20 w-full">
      {/* 1. Custom Fields & Key-Value Attributes (Synced with Persona Element & MCM) */}
      <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              Custom Fields &amp; Key-Value Attributes
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Custom key-value metadata shared across Persona Folio, MCM, and Story Persona Elements.
            </p>
          </div>
          {!isSheetLocked && (
            <button
              type="button"
              onClick={handleAddCustomField}
              className="px-4 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Custom Field</span>
            </button>
          )}
        </div>

        {customFields.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-4 text-center bg-slate-950/50 rounded border border-dashed border-slate-800">
            No custom fields defined yet. Click &quot;+ Add Custom Field&quot; to attach custom attributes.
          </div>
        ) : (
          <div className="space-y-3">
            {customFields.map((cf, idx) => (
              <div
                key={cf.id || idx}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  {isSheetLocked ? (
                    <span className="text-xs font-bold font-mono text-cyan-300 uppercase">
                      {cf.label || `Field #${idx + 1}`}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={cf.label || ''}
                      onChange={(e) => handleUpdateCustomField(cf.id, 'label', e.target.value)}
                      placeholder="Field Label (e.g. Danger Rating, Clearance Level)"
                      className="bg-slate-900 border border-slate-700 text-cyan-300 p-1.5 rounded text-xs font-bold outline-none focus:border-cyan-400 flex-1"
                    />
                  )}
                  {!isSheetLocked && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(cf.id)}
                      className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 rounded font-bold flex items-center gap-1 cursor-pointer"
                      title="Remove Custom Field"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                {isSheetLocked ? (
                  <div className="text-xs text-slate-200 whitespace-pre-wrap font-sans px-1">
                    {cf.value || <span className="text-slate-600 italic">Empty</span>}
                  </div>
                ) : (
                  <AutoExpandingNoteTextarea
                    value={cf.value || ''}
                    onChange={(val) => handleUpdateCustomField(cf.id, 'value', val)}
                    placeholder="Field value / description..."
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-xs text-slate-100 outline-none transition-all"
                    emptyShadowStyle="border-slate-700"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Persona Log & Miscellaneous Notes */}
      <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Persona Log &amp; Miscellaneous Notes
          </h3>
          {!isSheetLocked && (
            <button
              type="button"
              onClick={addNote}
              className="px-4 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              + Add Note Entry
            </button>
          )}
        </div>

        <div className="space-y-3">
          {isSheetLocked && !hasAnyNotes ? (
            <div className="text-xs text-slate-500 italic py-2">
              No notes logged.
            </div>
          ) : (
            notes.map((note, index) => {
              if (isSheetLocked && (!note.text || !note.text.trim())) return null;
              const isEmpty = !note.text || !note.text.trim();
              const emptyShadowStyle = isEmpty
                ? 'shadow-[inset_0_2px_6px_rgba(0,0,0,0.6),0_0_10px_rgba(6,182,212,0.18)] border-cyan-700/60 focus:shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                : 'border-slate-700';

              const hasBracketLinks = typeof note.text === 'string' && /\[[^\]\r\n]+\]/.test(note.text);

              return (
                <div key={index} className="flex gap-2 items-start bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                  <span className="text-xs font-mono text-cyan-500 font-bold mt-1">
                    #{index + 1}
                  </span>
                  {isSheetLocked ? (
                    <div className="flex-1 px-2 py-1 text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                      <ChatParser text={note.text} />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <AutoExpandingNoteTextarea
                        value={note.text || ''}
                        onChange={(val) => updateNote(index, val)}
                        placeholder="Enter story notes, contacts, secrets, or quest logs... Use [Entity] to link to Sections, Codex, or Catalog."
                        className="w-full bg-slate-900 border focus:border-cyan-400 rounded px-3 py-2 text-xs text-slate-100 outline-none transition-all"
                        emptyShadowStyle={emptyShadowStyle}
                      />
                      {hasBracketLinks && (
                        <div className="p-1.5 rounded-lg bg-slate-950/90 border border-cyan-900/40 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="text-[9.5px] font-mono font-bold text-cyan-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <Link2 size={10} /> Active Links:
                          </span>
                          <div className="flex-1 overflow-x-auto no-scrollbar py-0.5">
                            <ChatParser text={note.text} inline />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {!isSheetLocked && (
                    <button
                      type="button"
                      onClick={() => removeNote(index)}
                      className="text-slate-400 hover:text-red-400 text-lg font-bold px-2 py-1 leading-none transition-colors"
                      title="Delete note"
                    >
                      &times;
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(OtherTab);
