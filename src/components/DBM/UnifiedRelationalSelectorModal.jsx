import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { categoryConfig } from './categoryConfig';
import { VirtualizedList } from './VirtualizedList';
import { attachCreatorTag } from '../../utils/creatorUtils';
import { useDBM } from '../../context/DBMContext';

const EMPTY_CONFIG = {};
const DEFAULT_SCHEMA_FIELDS = {
  name: { type: 'text', required: true },
  description: { type: 'textarea' }
};

const getCollectionConfig = (colKey) => {
  if (!colKey) return null;
  if (categoryConfig[colKey]) return categoryConfig[colKey];
  for (const parentKey of Object.keys(categoryConfig)) {
    const parent = categoryConfig[parentKey];
    if (parent?.subcategories?.[colKey]) {
      return parent.subcategories[colKey];
    }
  }
  return null;
};

const getAspectSubtypeOptions = (aspect, itemsMap = {}) => {
  if (aspect === 'attribute') {
    return ['Strength', 'Agility', 'Constitution', 'Intellect', 'Wisdom', 'Charisma', 'Might', 'Reflex', 'Fortitude', 'Logic', 'Will', 'Etiquette'];
  } else if (aspect === 'skill') {
    return (itemsMap['skills'] || []).map(s => s.name || s.id);
  } else if (aspect === 'combat') {
    return ['Attack', 'Defense', 'Initiative', 'Movement', 'Range', 'Armor Piercing', 'Critical Score', 'Damage'];
  } else if (aspect === 'feature') {
    return (itemsMap['features'] || []).map(f => f.name || f.id);
  }
  return [];
};

export const UnifiedRelationalSelectorModal = ({
  isOpen,
  onClose,
  sourceCollection,
  isMulti = true,
  selectedValues = [],
  onSelect,
  fieldLabel = 'Items',
  onItemCreated,
  dbData = {},
  saveEntry,
  devMode = false
}) => {
  const dbContext = useDBM() || {};
  const activeDbData = Object.keys(activeDbData).length > 0 ? activeDbData : (dbContext.activeDbData || {});
  const activeSaveEntry = activeSaveEntry || dbContext.activeSaveEntry;

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSelected, setCurrentSelected] = useState([]);

  // Quick / Granular Create State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isFullForm, setIsFullForm] = useState(false);
  const [newFormData, setNewFormData] = useState({ name: '', description: '' });
  const [savingNew, setSavingNew] = useState(false);

  const selectorFetchedRef = useRef({});

  const colConfig = getCollectionConfig(sourceCollection) || EMPTY_CONFIG;
  const schemaFields = colConfig.fields || DEFAULT_SCHEMA_FIELDS;

  // Reset modal state on open or sourceCollection change
  useEffect(() => {
    if (!isOpen) {
      selectorFetchedRef.current = {};
      return;
    }
    setCurrentSelected(Array.isArray(selectedValues) ? selectedValues : (selectedValues ? [selectedValues] : []));
    setSearchTerm('');
    setIsCreatingNew(false);
    setIsFullForm(false);
    setNewFormData({ name: '', description: '' });
  }, [isOpen, sourceCollection]);

  // Non-blocking background Firestore fetch (never replaces UI body with loading screen)
  useEffect(() => {
    if (!isOpen || !sourceCollection) return;
    if (selectorFetchedRef.current[sourceCollection]) return;
    selectorFetchedRef.current[sourceCollection] = true;

    let isMounted = true;
    setLoading(true);

    const fetchCollection = async () => {
      try {
        const colRef = collection(db, sourceCollection);
        const fetchPromise = getDocs(colRef);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firestore timeout')), 1200)
        );
        
        const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        if (isMounted && fetched.length > 0) {
          setItems(fetched);
        }
      } catch (err) {
        // Silently fallback to local state without disrupting UI
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCollection();

    return () => {
      isMounted = false;
    };
  }, [isOpen, sourceCollection]);

  const handleExplicitCloudSearch = async () => {
    setLoading(true);
    try {
      const colRef = collection(db, sourceCollection);
      const snapshot = await getDocs(colRef);
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(fetched);
    } catch (err) {
      console.warn("Explicit cloud search query warning:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Use local fallback if cloud snapshot is empty
  const localFallback = activeDbData[sourceCollection] || [];
  const allAvailableItems = items.length > 0 ? items : localFallback;

  const filteredItems = allAvailableItems.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.type && item.type.toLowerCase().includes(term))
    );
  });

  const toggleItem = (val) => {
    if (isMulti) {
      if (currentSelected.includes(val)) {
        setCurrentSelected(currentSelected.filter(v => v !== val));
      } else {
        setCurrentSelected([...currentSelected, val]);
      }
    } else {
      setCurrentSelected([val]);
    }
  };

  const handleConfirm = () => {
    if (isMulti) {
      onSelect(currentSelected);
    } else {
      onSelect(currentSelected[0] || '');
    }
    onClose();
  };

  const handleSaveNewItem = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const itemName = (newFormData.name || '').trim();
    if (!itemName) {
      alert("Item name is required!");
      return;
    }

    setSavingNew(true);
    try {
      const newId = `${sourceCollection}_${Date.now()}`;
      const payload = attachCreatorTag({
        id: newId,
        ...newFormData,
        name: itemName,
        description: (newFormData.description || '').trim(),
        createdAt: new Date().toISOString()
      }, localStorage.getItem('userHandle'), auth.currentUser);

      // 1. Update local items list
      setItems(prev => [...prev, payload]);

      // 2. Update global activeDbData state & local storage
      if (activeSaveEntry) {
        await activeSaveEntry(payload, sourceCollection);
      }

      // 3. Notify parent DBMItemModal
      if (onItemCreated) {
        onItemCreated(sourceCollection, payload);
      }

      // 4. Update selection array & confirm to parent form
      const selectVal = payload.name || payload.id;
      let updatedSelected = [...currentSelected];
      if (isMulti) {
        if (!updatedSelected.includes(selectVal)) {
          updatedSelected.push(selectVal);
        }
      } else {
        updatedSelected = [selectVal];
      }

      setCurrentSelected(updatedSelected);

      if (isMulti) {
        onSelect(updatedSelected);
      } else {
        onSelect(updatedSelected[0] || '');
      }

      // 5. Reset internal form state and close modal immediately (0ms delay)
      setNewFormData({ name: '', description: '' });
      setIsCreatingNew(false);
      onClose();

      // 6. Non-blocking background Firestore sync
      setDoc(doc(db, sourceCollection, newId), payload).catch(err => {
        console.warn("Background cloud sync note:", err.message);
      });
    } catch (err) {
      console.error("Error saving new relational item:", err);
      alert("Failed to save item: " + err.message);
    } finally {
      setSavingNew(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>📋</span> Select {fieldLabel}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Collection: {colConfig.label || sourceCollection}</span>
          </div>
          <div className="flex items-center gap-2">
            {devMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCreatingNew(!isCreatingNew);
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase transition-colors shadow flex items-center gap-1 cursor-pointer z-10"
              >
                {isCreatingNew ? '✕ Cancel New' : '✨ + Create New'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white font-bold ml-2 text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {isCreatingNew ? (
          /* CREATE NEW ITEM DEDICATED FORM VIEW */
          <div className="flex-1 overflow-y-auto p-5 bg-slate-950/80 space-y-4">
            <div className="bg-slate-900 border border-amber-500/40 p-4 rounded-lg space-y-4 shadow-lg">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span>✨</span> Create New Record in {colConfig.label || sourceCollection}
                </h4>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsFullForm(!isFullForm);
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer"
                >
                  {isFullForm ? '⚡ Switch to Quick Create' : '⚙️ Toggle Full Schema Fields'}
                </button>
              </div>

              {/* Core Name & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Item Name *</label>
                  <input
                    type="text"
                    placeholder="Enter Record Name *"
                    value={newFormData.name || ''}
                    onChange={e => setNewFormData({ ...newFormData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded text-xs outline-none focus:border-amber-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Description</label>
                  <textarea
                    placeholder="Enter Record Description..."
                    value={newFormData.description || ''}
                    onChange={e => setNewFormData({ ...newFormData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Dynamic Granular Schema Fields */}
              {isFullForm && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                  {Object.keys(schemaFields).map(fKey => {
                    if (fKey === 'name' || fKey === 'description') return null;
                    const fDef = schemaFields[fKey];
                    const label = fDef.label || fKey.replace(/_/g, ' ').toUpperCase();

                    let selectOptions = fDef.options || [];
                    if (fKey === 'aspect_subtype' && newFormData.aspect) {
                      selectOptions = getAspectSubtypeOptions(newFormData.aspect, activeDbData);
                    }

                    return (
                      <div key={fKey} className={fDef.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          {label}
                        </label>
                        {fDef.type === 'textarea' ? (
                          <textarea
                            value={newFormData[fKey] || ''}
                            onChange={e => setNewFormData({ ...newFormData, [fKey]: e.target.value })}
                            rows={2}
                            className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                          />
                        ) : fDef.type === 'select' ? (
                          <select
                            value={newFormData[fKey] || ''}
                            onChange={e => setNewFormData({ ...newFormData, [fKey]: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                          >
                            <option value="">-- Select {label} --</option>
                            {selectOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : fDef.type === 'boolean' ? (
                          <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer mt-1">
                            <input
                              type="checkbox"
                              checked={Boolean(newFormData[fKey])}
                              onChange={e => setNewFormData({ ...newFormData, [fKey]: e.target.checked })}
                              className="accent-amber-500 w-4 h-4"
                            />
                            Enable {label}
                          </label>
                        ) : (
                          <input
                            type={fDef.type === 'number' ? 'number' : 'text'}
                            value={newFormData[fKey] ?? ''}
                            onChange={e => setNewFormData({
                              ...newFormData,
                              [fKey]: fDef.type === 'number' ? Number(e.target.value) : e.target.value
                            })}
                            className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewItem}
                  disabled={savingNew || !(newFormData.name || '').trim()}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded uppercase shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>💾</span> {savingNew ? 'Saving...' : 'Save & Select Item'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ITEM LIST SELECTION VIEW */
          <>
            {/* Search Bar */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3 shrink-0">
              <input
                type="text"
                placeholder={`Search ${colConfig.label || sourceCollection}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleExplicitCloudSearch();
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-xs outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleExplicitCloudSearch}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded text-xs font-bold uppercase transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                title="Execute Database Search"
              >
                <span>🔍</span> Search DB
              </button>
              {loading && <span className="text-[10px] text-cyan-400 font-mono animate-pulse">Syncing cloud...</span>}
              <span className="text-xs text-slate-400 font-mono">
                {currentSelected.length} Selected
              </span>
            </div>

            {/* Items List */}
            {filteredItems.length === 0 ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-950/40">
                <div className="p-8 text-center bg-slate-900/60 border border-slate-800/80 rounded-xl my-4 space-y-3">
                  <div className="text-2xl">📂</div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    No Records Found in {colConfig.label || sourceCollection}
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    This database collection in Omnicortex is currently empty. You can create the very first record right now.
                  </p>
                  {devMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsCreatingNew(true);
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase rounded shadow transition-all inline-flex items-center gap-1.5 mt-1 cursor-pointer"
                    >
                      <span>✨</span> Create First {colConfig.label || sourceCollection} Record
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <VirtualizedList
                items={filteredItems}
                itemHeight={72}
                resetScrollDeps={[searchTerm, sourceCollection, items.length]}
                getKey={(item, index) => item.id || item.name || index}
                containerClassName="flex-1 overflow-y-auto p-4 bg-slate-950/40"
                renderItem={(item) => {
                  const val = item.name || item.id;
                  const itemKey = item.id || item.name;
                  const isChecked = currentSelected.includes(val) || currentSelected.includes(item.id);

                  return (
                    <div className="pb-2 box-border">
                      <div
                        key={itemKey}
                        onClick={() => toggleItem(val)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 h-[64px] box-border ${
                          isChecked
                            ? 'bg-cyan-950/70 border-cyan-500/80 text-white shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                            : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                        }`}
                      >
                        <input
                          type={isMulti ? 'checkbox' : 'radio'}
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 accent-cyan-500 w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                            <span className="truncate pr-2">{item.name || item.id}</span>
                            {item.type && <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono shrink-0">{item.type}</span>}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            )}

            {/* Footer Actions */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setCurrentSelected([])}
                className="text-xs text-slate-400 hover:text-slate-200 underline uppercase cursor-pointer"
              >
                Clear Selection
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs uppercase shadow-md transition-colors cursor-pointer"
                >
                  Confirm Selection ({currentSelected.length})
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
