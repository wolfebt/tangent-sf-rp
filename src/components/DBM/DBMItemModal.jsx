import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UnifiedRelationalSelectorModal } from './UnifiedRelationalSelectorModal';

export const DBMItemModal = ({
  isOpen,
  onClose,
  isEditMode,
  setIsEditMode,
  selectedItem,
  editFormData,
  setEditFormData,
  currentConfig,
  currentKey,
  onSave,
  onDelete
}) => {
  const [relationalData, setRelationalData] = useState({});
  const [activeSelectorField, setActiveSelectorField] = useState(null);

  useEffect(() => {
    if (!isOpen || !isEditMode) return;
    
    const fetchRelations = async () => {
      const newRelData = { ...relationalData };
      let updated = false;

      const promises = Object.keys(currentConfig.fields || {}).map(async (fieldKey) => {
        const fieldDef = currentConfig.fields[fieldKey];
        if (fieldDef.source && !newRelData[fieldDef.source]) {
          try {
             const colRef = collection(db, fieldDef.source);
             const snapshot = await getDocs(colRef);
             newRelData[fieldDef.source] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             updated = true;
          } catch (err) {
             console.warn(`Failed to fetch relational data for ${fieldDef.source}:`, err);
          }
        }
      });

      await Promise.all(promises);
      if (updated) {
        setRelationalData(newRelData);
      }
    };
    fetchRelations();
  }, [isOpen, isEditMode, currentConfig]);

  // Recalculate Design DC whenever relevant form fields change
  useEffect(() => {
    if (!isEditMode) return;
    if (['invocations', 'special_abilities', 'augmentations', 'weaponry', 'armoring', 'mecha'].includes(currentKey)) {
      let dc = 0;
      dc += (Number(editFormData.tl) || 0) * 2;
      dc += (Number(editFormData.ml) || 0) * 3;

      ['area', 'effect', 'range', 'target', 'component', 'modes'].forEach(relKey => {
        const selected = editFormData[relKey];
        if (Array.isArray(selected)) {
          selected.forEach(val => {
            const items = relationalData[relKey] || [];
            const match = items.find(i => (i.name || i.id) === val);
            if (match && match.dc) dc += Number(match.dc);
          });
        }
      });

      if (editFormData.design_dc !== dc) {
        setEditFormData(prev => ({ ...prev, design_dc: dc }));
      }
    }
  }, [editFormData.tl, editFormData.ml, editFormData.area, editFormData.effect, editFormData.range, editFormData.target, editFormData.component, editFormData.modes, isEditMode, currentKey, relationalData]);

  if (!isOpen) return null;

  // Aspect Subtype Dynamic Options Resolver
  const getAspectSubtypeOptions = (aspect) => {
    if (aspect === 'attribute') {
      return ['Strength', 'Agility', 'Constitution', 'Intellect', 'Wisdom', 'Charisma', 'Might', 'Reflex', 'Fortitude', 'Logic', 'Will', 'Etiquette'];
    } else if (aspect === 'skill') {
      return (relationalData['skills'] || []).map(s => s.name || s.id);
    } else if (aspect === 'combat') {
      return ['Attack', 'Defense', 'Initiative', 'Movement', 'Range', 'Armor Piercing', 'Critical Score', 'Damage'];
    } else if (aspect === 'feature') {
      return (relationalData['features'] || []).map(f => f.name || f.id);
    }
    return [];
  };

  // Helper for field conditional visibility
  const isFieldVisible = (fieldKey) => {
    if (fieldKey === 'base_skill') {
      return currentKey === 'skills' && Boolean(editFormData.is_specialization);
    }
    if (fieldKey === 'bonus_scope') {
      return editFormData.aspect === 'feature' || editFormData.aspect === 'skill' || editFormData.aspect === 'attribute';
    }
    if (fieldKey === 'bonus_feature_categories') {
      return editFormData.aspect === 'feature' && editFormData.bonus_scope === 'any';
    }
    if (fieldKey === 'bonus_skill_categories') {
      return editFormData.aspect === 'skill' && editFormData.bonus_scope === 'any';
    }
    if (fieldKey === 'bonus_attribute_options') {
      return editFormData.aspect === 'attribute' && editFormData.bonus_scope === 'any';
    }
    if (fieldKey === 'skill_bonus_type') {
      return editFormData.aspect === 'skill';
    }
    if (fieldKey === 'granted_skill_id') {
      return editFormData.aspect === 'skill' && editFormData.skill_bonus_type === 'grant';
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              {isEditMode ? (selectedItem ? 'Edit Entry' : 'Create New Entry') : selectedItem?.name}
            </h3>
            <span className="text-xs text-amber-400 font-mono">
              Collection: {currentConfig?.label || currentKey}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/50 rounded text-xs font-bold uppercase"
              >
                Edit
              </button>
            )}
            {selectedItem && (
              <button
                onClick={() => onDelete(selectedItem.id)}
                className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/50 rounded text-xs font-bold uppercase"
              >
                Delete
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white font-bold ml-2">
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(currentConfig.fields || { name: {}, description: {} }).map(fieldKey => {
                if (!isFieldVisible(fieldKey)) return null;

                const fieldDef = currentConfig.fields[fieldKey];
                const label = fieldDef.label || fieldKey.replace(/_/g, ' ').toUpperCase();
                const isFullWidth = fieldDef.type === 'textarea' || fieldDef.type === 'json_list' || fieldDef.type === 'multiselect' || fieldDef.manageable;

                return (
                  <div key={fieldKey} className={isFullWidth ? 'md:col-span-2' : ''}>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      {label} {fieldDef.required && '*'}
                    </label>

                    {/* MANAGEABLE / MULTISELECT RELATIONAL FIELD TRIGGER */}
                    {(fieldDef.manageable || fieldDef.type === 'multiselect') && fieldDef.source ? (
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-3">
                        <div className="flex-1 flex flex-wrap gap-1.5 min-h-[28px] items-center">
                          {Array.isArray(editFormData[fieldKey]) && editFormData[fieldKey].length > 0 ? (
                            editFormData[fieldKey].map(val => (
                              <span key={val} className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded text-xs font-mono flex items-center gap-1">
                                {val}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = editFormData[fieldKey].filter(v => v !== val);
                                    setEditFormData({ ...editFormData, [fieldKey]: updated });
                                  }}
                                  className="text-cyan-400 hover:text-white font-bold ml-1"
                                >✕</button>
                              </span>
                            ))
                          ) : typeof editFormData[fieldKey] === 'string' && editFormData[fieldKey] ? (
                            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded text-xs font-mono">
                              {editFormData[fieldKey]}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600 italic">No {label.toLowerCase()} selected</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSelectorField(fieldKey)}
                          className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-xs font-bold uppercase transition-colors shrink-0"
                        >
                          📋 Select {label}
                        </button>
                      </div>
                    ) : fieldDef.type === 'textarea' ? (
                      <textarea
                        value={editFormData[fieldKey] || ''}
                        onChange={e => setEditFormData({ ...editFormData, [fieldKey]: e.target.value })}
                        rows={4}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                      />
                    ) : fieldDef.type === 'select' ? (
                      <select
                        value={editFormData[fieldKey] || ''}
                        onChange={e => setEditFormData({ ...editFormData, [fieldKey]: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                      >
                        <option value="">-- Select --</option>
                        {(fieldKey === 'aspect_subtype'
                          ? getAspectSubtypeOptions(editFormData.aspect)
                          : fieldDef.source
                          ? (relationalData[fieldDef.source] || [])
                          : (fieldDef.options || [])
                        ).map(opt => {
                          const val = typeof opt === 'string' || typeof opt === 'number' ? opt : (opt.name || opt.id);
                          return <option key={val} value={val}>{val}</option>;
                        })}
                      </select>
                    ) : fieldDef.type === 'multiselect' ? (
                      <select
                        multiple
                        value={editFormData[fieldKey] || []}
                        onChange={e => {
                          const vals = Array.from(e.target.selectedOptions, option => option.value);
                          setEditFormData({ ...editFormData, [fieldKey]: vals });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500 min-h-[90px]"
                      >
                        {(fieldDef.options || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : fieldDef.type === 'radio' || fieldDef.type === 'boolean' ? (
                      <div className="flex flex-wrap gap-4 mt-2">
                        {fieldDef.type === 'boolean' ? (
                          <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editFormData[fieldKey])}
                              onChange={e => setEditFormData({ ...editFormData, [fieldKey]: e.target.checked })}
                              className="accent-amber-500 w-4 h-4"
                            />
                            Enable {label}
                          </label>
                        ) : (
                          (fieldDef.options || []).map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 text-slate-300 text-sm cursor-pointer">
                              <input 
                                type="radio" 
                                name={fieldKey}
                                value={opt} 
                                checked={editFormData[fieldKey] === opt}
                                onChange={e => setEditFormData({ ...editFormData, [fieldKey]: e.target.value })}
                                className="accent-amber-500 w-4 h-4"
                              />
                              {opt}
                            </label>
                          ))
                        )}
                      </div>
                    ) : fieldDef.type === 'json_list' ? (
                      /* STRUCTURED JSON LIST EDITOR FOR BONUS SKILLS */
                      <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                        {(Array.isArray(editFormData[fieldKey]) ? editFormData[fieldKey] : []).map((item, idx) => {
                          const skillName = typeof item === 'object' ? item.skill : (item.split(' ')[0] || '');
                          const skillVal = typeof item === 'object' ? item.value : (parseInt(item.match(/\+?(-?\d+)/)?.[1]) || 1);

                          return (
                            <div key={idx} className="flex gap-2 items-center">
                              <select
                                value={skillName}
                                onChange={e => {
                                  const newList = [...(Array.isArray(editFormData[fieldKey]) ? editFormData[fieldKey] : [])];
                                  newList[idx] = { skill: e.target.value, value: skillVal };
                                  setEditFormData({ ...editFormData, [fieldKey]: newList });
                                }}
                                className="flex-1 bg-slate-900 border border-slate-700 text-white p-1.5 rounded text-xs outline-none focus:border-amber-500"
                              >
                                <option value="">-- Select Skill --</option>
                                {(relationalData['skills'] || []).map(s => (
                                  <option key={s.id || s.name} value={s.name || s.id}>{s.name || s.id}</option>
                                ))}
                              </select>
                              <input 
                                type="number" 
                                placeholder="Bonus"
                                value={skillVal} 
                                onChange={e => {
                                  const newList = [...(Array.isArray(editFormData[fieldKey]) ? editFormData[fieldKey] : [])];
                                  newList[idx] = { skill: skillName, value: Number(e.target.value) };
                                  setEditFormData({ ...editFormData, [fieldKey]: newList });
                                }}
                                className="w-20 bg-slate-900 border border-slate-700 text-white p-1.5 rounded text-xs outline-none focus:border-amber-500"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newList = (Array.isArray(editFormData[fieldKey]) ? editFormData[fieldKey] : []).filter((_, i) => i !== idx);
                                  setEditFormData({ ...editFormData, [fieldKey]: newList });
                                }}
                                className="p-1 px-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded text-xs font-bold"
                              >✕</button>
                            </div>
                          );
                        })}
                        <button 
                          type="button"
                          onClick={() => {
                            const currentList = Array.isArray(editFormData[fieldKey]) ? editFormData[fieldKey] : [];
                            setEditFormData({ ...editFormData, [fieldKey]: [...currentList, { skill: '', value: 1 }] });
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-xs font-bold w-full uppercase mt-1"
                        >+ Add Bonus Skill Entry</button>
                      </div>
                    ) : (
                      <input
                        type={fieldDef.type === 'number' ? 'number' : 'text'}
                        value={editFormData[fieldKey] ?? ''}
                        onChange={e => setEditFormData({ ...editFormData, [fieldKey]: fieldDef.type === 'number' ? Number(e.target.value) : e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                        disabled={fieldDef.type === 'readonlytext'}
                        readOnly={fieldDef.type === 'readonlytext'}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* READ ONLY VIEW */
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase">Description</h4>
                <p className="text-sm text-slate-200 mt-1 whitespace-pre-line bg-slate-950 p-4 rounded border border-slate-800">
                  {selectedItem?.description || 'No description available.'}
                </p>
              </div>

              {selectedItem?.mechanic && (
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase">Game Mechanic</h4>
                  <p className="text-xs text-amber-300 font-mono mt-1 bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-line">
                    {selectedItem.mechanic}
                  </p>
                </div>
              )}

              {selectedItem?.note && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Notes</h4>
                  <p className="text-xs text-slate-400 mt-1 italic whitespace-pre-line">{selectedItem.note}</p>
                </div>
              )}

              {/* READ ONLY METADATA BADGES */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {Object.keys(selectedItem || {}).map(k => {
                  if (['id', 'name', 'description', 'mechanic', 'note', 'updatedAt'].includes(k)) return null;
                  const val = selectedItem[k];
                  if (!val || (Array.isArray(val) && val.length === 0)) return null;

                  return (
                    <div key={k} className="bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">{k.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-cyan-300 font-mono truncate block mt-0.5">
                        {Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs uppercase"
          >
            Close
          </button>
          {isEditMode && (
            <button
              onClick={onSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs uppercase shadow-md"
            >
              Save Entry
            </button>
          )}
        </div>
      </div>

      {/* Unified Relational Selector Sub-Modal */}
      {activeSelectorField && currentConfig.fields[activeSelectorField] && (
        <UnifiedRelationalSelectorModal
          isOpen={Boolean(activeSelectorField)}
          onClose={() => setActiveSelectorField(null)}
          sourceCollection={currentConfig.fields[activeSelectorField].source}
          isMulti={currentConfig.fields[activeSelectorField].type === 'multiselect' || currentConfig.fields[activeSelectorField].manageable}
          selectedValues={editFormData[activeSelectorField]}
          fieldLabel={currentConfig.fields[activeSelectorField].label || activeSelectorField.replace(/_/g, ' ').toUpperCase()}
          onSelect={(newValues) => {
            setEditFormData({ ...editFormData, [activeSelectorField]: newValues });
          }}
        />
      )}
    </div>
  );
};
