import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UnifiedRelationalSelectorModal } from './UnifiedRelationalSelectorModal';

const DEFAULT_FIELDS = {
  name: { type: 'text', required: true },
  description: { type: 'textarea' }
};

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
  onDelete,
  dbData = {},
  saveEntry,
  devMode = true
}) => {
  const [relationalData, setRelationalData] = useState({});
  const [activeSelectorField, setActiveSelectorField] = useState(null);
  const fetchedRef = useRef({});

  // Custom freeform entry state per field
  const [customInputModes, setCustomInputModes] = useState({});
  const [customInputValues, setCustomInputValues] = useState({});

  // Tab state must be declared before any early returns (Rules of Hooks)
  const [activeModalTab, setActiveModalTab] = useState('general');

  const toggleCustomInputMode = (fieldKey) => {
    setCustomInputModes(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleAddCustomValue = (fieldKey, isMulti = false) => {
    const rawVal = (customInputValues[fieldKey] || '').trim();
    if (!rawVal) return;

    if (isMulti) {
      const currentArr = Array.isArray(editFormData[fieldKey]) ? editFormData[fieldKey] : [];
      if (!currentArr.includes(rawVal)) {
        setEditFormData(prev => ({ ...prev, [fieldKey]: [...currentArr, rawVal] }));
      }
    } else {
      setEditFormData(prev => ({ ...prev, [fieldKey]: rawVal }));
    }

    setCustomInputValues(prev => ({ ...prev, [fieldKey]: '' }));
    setCustomInputModes(prev => ({ ...prev, [fieldKey]: false }));
  };

  useEffect(() => {
    if (!isOpen || !isEditMode) {
      fetchedRef.current = {};
      return;
    }
    
    const fetchRelations = async () => {
      const fields = currentConfig.fields || DEFAULT_FIELDS;
      let updated = false;
      const newRelData = {};

      const promises = Object.keys(fields).map(async (fieldKey) => {
        const fieldDef = fields[fieldKey];
        if (fieldDef.source && !fetchedRef.current[fieldDef.source]) {
          fetchedRef.current[fieldDef.source] = true;
          try {
             const colRef = collection(db, fieldDef.source);
             const snapshot = await getDocs(colRef);
             newRelData[fieldDef.source] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             updated = true;
          } catch (err) {
             console.warn(`Failed to fetch relational data for ${fieldDef.source}:`, err);
             if (dbData[fieldDef.source]) {
               newRelData[fieldDef.source] = dbData[fieldDef.source];
               updated = true;
             }
          }
        }
      });

      await Promise.all(promises);
      if (updated) {
        setRelationalData(prev => ({ ...prev, ...newRelData }));
      }
    };
    fetchRelations();
  }, [isOpen, isEditMode, currentConfig]);

  // Normalize editFormData so all multiselect / manageable fields default to arrays
  useEffect(() => {
    const fields = currentConfig?.fields || DEFAULT_FIELDS;
    if (!isOpen || !fields) return;

    setEditFormData(prev => {
      let needsUpdate = false;
      const normalized = { ...prev };

      Object.keys(fields).forEach(fKey => {
        const fDef = fields[fKey];
        if (fDef.type === 'multiselect' || fDef.manageable) {
          if (!Array.isArray(normalized[fKey])) {
            normalized[fKey] = normalized[fKey] ? [normalized[fKey]] : [];
            needsUpdate = true;
          }
        }
      });

      return needsUpdate ? normalized : prev;
    });
  }, [isOpen, currentConfig]);

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
  }, [editFormData.tl, editFormData.ml, editFormData.area, editFormData.effect, editFormData.range, editFormData.target, editFormData.component, editFormData.modes, editFormData.design_dc, isEditMode, currentKey, relationalData]);

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
    if (fieldKey === 'aspect_subtype') {
      return editFormData.aspect === 'feature' || editFormData.aspect === 'skill' || editFormData.aspect === 'attribute' || editFormData.aspect === 'combat';
    }
    return true;
  };


  const fieldsObj = currentConfig.fields || DEFAULT_FIELDS;
  const fieldKeys = Object.keys(fieldsObj);
  const isDenseForm = fieldKeys.length > 8;

  const getFieldTabGroup = (fKey) => {
    const k = fKey.toLowerCase();
    if (['name', 'description', 'type', 'tl', 'ml', 'availability', 'rarity', 'category', 'price', 'cost_credits', 'tech_level', 'magic_level'].includes(k)) {
      return 'general';
    }
    if (k.includes('attr') || k.includes('skill') || k.includes('bonus') || k.includes('dc') || k.includes('damage') || k.includes('range') || k.includes('defense') || k.includes('armor') || k.includes('points') || k.includes('cost') || k.includes('cp') || k.includes('health') || k.includes('vitality') || k.includes('karma')) {
      return 'mechanics';
    }
    return 'features';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-cyan-400 uppercase tracking-wider">
              {isEditMode ? `MANAGE ${currentConfig.label}` : `VIEW ${currentConfig.label}`}
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              ID: {selectedItem?.id || editFormData.id || 'NEW_ENTRY'}
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

        {/* Dense Form Category Sub-Tab Navigation Bar */}
        {isDenseForm && (
          <div className="bg-slate-950 px-6 py-2 border-b border-slate-800 flex gap-2 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveModalTab('general')}
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                activeModalTab === 'general'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              📋 General Info
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('mechanics')}
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                activeModalTab === 'mechanics'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ Attributes & Mechanics
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('features')}
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                activeModalTab === 'features'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              🧬 Features & Relational
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('all')}
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                activeModalTab === 'all'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              🔍 View All Fields ({fieldKeys.length})
            </button>
          </div>
        )}

        {/* Modal Body Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldKeys.map(fieldKey => {
                if (!isFieldVisible(fieldKey)) return null;
                if (isDenseForm && activeModalTab !== 'all' && getFieldTabGroup(fieldKey) !== activeModalTab) {
                  return null;
                }

                const fieldDef = currentConfig.fields[fieldKey];
                const label = fieldDef.label || fieldKey.replace(/_/g, ' ').toUpperCase();
                const isFullWidth = fieldDef.type === 'textarea' || fieldDef.type === 'json_list' || fieldDef.type === 'multiselect' || fieldDef.manageable;
                const isCustomActive = Boolean(customInputModes[fieldKey]);

                return (
                  <div key={fieldKey} className={isFullWidth ? 'md:col-span-2' : ''}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase">
                        {label} {fieldDef.required && '*'}
                      </label>
                        <button
                          type="button"
                          onClick={() => toggleCustomInputMode(fieldKey)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-mono underline cursor-pointer"
                        >
                          {isCustomActive ? '✕ Cancel Custom' : '✍️ Custom Entry'}
                        </button>
                    </div>

                    {/* INLINE CUSTOM ENTRY MODE FOR ALL FIELDS */}
                    {isCustomActive ? (
                      <div className="flex gap-2 items-center bg-slate-950 p-2 border border-amber-500/50 rounded-lg">
                        <input
                          type="text"
                          placeholder={`Enter custom ${label}...`}
                          value={customInputValues[fieldKey] || ''}
                          onChange={e => setCustomInputValues({ ...customInputValues, [fieldKey]: e.target.value })}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomValue(fieldKey, fieldDef.type === 'multiselect' || fieldDef.manageable);
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-400"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomValue(fieldKey, fieldDef.type === 'multiselect' || fieldDef.manageable)}
                          className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs uppercase shrink-0 cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    ) : (fieldDef.manageable || fieldDef.type === 'multiselect') && fieldDef.source ? (
                      /* MANAGEABLE / MULTISELECT RELATIONAL FIELD TRIGGER */
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
                                  className="text-cyan-400 hover:text-white font-bold ml-1 cursor-pointer"
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
                          className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer"
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
                      <div className="flex gap-2 items-center">
                        <select
                          value={editFormData[fieldKey] || ''}
                          onChange={e => setEditFormData({ ...editFormData, [fieldKey]: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500 flex-1"
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
                        {fieldDef.source && (
                          <button
                            type="button"
                            onClick={() => setActiveSelectorField(fieldKey)}
                            className="px-2.5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-xs font-bold uppercase transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                            title={`Select or Create ${label}`}
                          >
                            📋
                          </button>
                        )}
                      </div>
                    ) : fieldDef.type === 'multiselect' ? (
                      <select
                        multiple
                        value={editFormData[fieldKey] || []}
                        onChange={e => {
                          const vals = Array.from(e.target.selectedOptions, option => option.value);
                          setEditFormData({ ...editFormData, [fieldKey]: vals });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500 min-h-[80px]"
                      >
                        {(fieldDef.options || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : fieldDef.type === 'boolean' ? (
                      <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={Boolean(editFormData[fieldKey])}
                          onChange={e => setEditFormData({ ...editFormData, [fieldKey]: e.target.checked })}
                          className="accent-amber-500 w-4 h-4"
                        />
                        Enable {label}
                      </label>
                    ) : (
                      <input
                        type={fieldDef.type === 'number' ? 'number' : 'text'}
                        value={editFormData[fieldKey] ?? ''}
                        onChange={e => setEditFormData({
                          ...editFormData,
                          [fieldKey]: fieldDef.type === 'number' ? Number(e.target.value) : e.target.value
                        })}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-2">{selectedItem?.name}</h3>
              <p className="text-sm text-slate-300 whitespace-pre-line">{selectedItem?.description || 'No description available.'}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                {Object.keys(currentConfig.fields || {}).map(fKey => {
                  if (fKey === 'name' || fKey === 'description') return null;
                  const val = selectedItem?.[fKey];
                  if (val === undefined || val === null || val === '') return null;
                  const fDef = currentConfig.fields[fKey];
                  const label = fDef.label || fKey.replace(/_/g, ' ').toUpperCase();

                  return (
                    <div key={fKey} className="bg-slate-950 p-3 rounded border border-slate-800">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">{label}</span>
                      <span className="text-xs text-cyan-300 font-mono">
                        {Array.isArray(val) ? val.join(', ') : val.toString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase"
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
      {activeSelectorField && (
        <UnifiedRelationalSelectorModal
          isOpen={Boolean(activeSelectorField)}
          onClose={() => setActiveSelectorField(null)}
          sourceCollection={currentConfig.fields?.[activeSelectorField]?.source || activeSelectorField}
          isMulti={currentConfig.fields?.[activeSelectorField]?.type === 'multiselect' || currentConfig.fields?.[activeSelectorField]?.manageable}
          selectedValues={Array.isArray(editFormData[activeSelectorField]) ? editFormData[activeSelectorField] : (editFormData[activeSelectorField] ? [editFormData[activeSelectorField]] : [])}
          fieldLabel={currentConfig.fields?.[activeSelectorField]?.label || activeSelectorField.replace(/_/g, ' ').toUpperCase()}
          onSelect={(newValues) => {
            setEditFormData(prev => ({ ...prev, [activeSelectorField]: newValues }));
          }}
          onItemCreated={(sourceCol, newItem) => {
            setRelationalData(prev => ({
              ...prev,
              [sourceCol]: [...(prev[sourceCol] || []), newItem]
            }));
          }}
          dbData={dbData}
          saveEntry={saveEntry}
          devMode={true}
        />
      )}
    </div>
  );
};
