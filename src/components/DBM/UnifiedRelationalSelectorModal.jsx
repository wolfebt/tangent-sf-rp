import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { categoryConfig } from './categoryConfig';
import { VirtualizedList } from './VirtualizedList';
import { useDBM } from '../../context/DBMContext';
import { ALL_CANONICAL_SKILLS } from '../../data/skillsData';

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

export const FEATURE_CATEGORY_ITEMS = [
  { id: 'cat_any_feature', name: 'Any Feature', type: 'Category Group', description: 'Player may choose any feature from the full feature database.' },
  { id: 'cat_general_features', name: 'General Features', type: 'Category Group', description: 'Player may choose any feature classified under General features.' },
  { id: 'cat_combat_features', name: 'Combat Features', type: 'Category Group', description: 'Player may choose any feature classified under Combat features.' },
  { id: 'cat_ability_features', name: 'Ability Features', type: 'Category Group', description: 'Player may choose any feature classified under Ability features.' },
  { id: 'cat_meta_features', name: 'Meta Features', type: 'Category Group', description: 'Player may choose any feature classified under Meta features.' },
  { id: 'cat_karma_features', name: 'Karma Features', type: 'Category Group', description: 'Player may choose any feature classified under Karma features.' },
  { id: 'cat_skill_features', name: 'Skill Features', type: 'Category Group', description: 'Player may choose any feature classified under Skill features.' },
  { id: 'cat_exotic_features', name: 'Exotic Features', type: 'Category Group', description: 'Player may choose any feature classified under Exotic features.' },
  { id: 'cat_special_abilities', name: 'Special Abilities', type: 'Category Group', description: 'Player may choose any feature classified under Special Abilities.' }
];

export const SKILL_GROUP_ITEMS = [
  { id: 'grp_any_skill', name: 'Any Skill', type: 'Skill Group', description: 'Player may choose any skill from the full skill database.' },
  { id: 'grp_physical_skills', name: 'Physical Skills', type: 'Skill Group', description: 'Player may choose any skill belonging to the Physical skill group.' },
  { id: 'grp_mental_skills', name: 'Mental Skills', type: 'Skill Group', description: 'Player may choose any skill belonging to the Mental skill group.' },
  { id: 'grp_social_skills', name: 'Social Skills', type: 'Skill Group', description: 'Player may choose any skill belonging to the Social skill group.' },
  { id: 'grp_combat_skills', name: 'Combat Skills', type: 'Skill Group', description: 'Player may choose any skill belonging to the Combat skill group.' },
  { id: 'grp_meta_skills', name: 'Meta Skills', type: 'Skill Group', description: 'Player may choose any skill belonging to the Meta skill group.' }
];

const getAspectSubtypeOptions = (aspect, itemsMap = {}) => {
  if (aspect === 'attribute') {
    return [
      'Any Attribute',
      'Any Primary Attribute',
      'Any Sub-Attribute',
      'Strength',
      'Might',
      'Agility',
      'Reflex',
      'Stamina',
      'Fortitude',
      'Constitution',
      'Intellect',
      'Logic',
      'Wisdom',
      'Will',
      'Charisma',
      'Etiquette'
    ];
  } else if (aspect === 'skill') {
    const baseSkillNames = ALL_CANONICAL_SKILLS.map(s => s.name);
    const dbSkillNames = (itemsMap['skills'] || []).map(s => s.name || s.id);
    const allUniqueSkillNames = Array.from(new Set([...baseSkillNames, ...dbSkillNames]));
    return [
      'Any Skill',
      'Any Mental Skill',
      'Any Physical Skill',
      'Any Social Skill',
      'Any Combat Skill',
      'Any Meta Skill',
      ...allUniqueSkillNames
    ];
  } else if (aspect === 'combat') {
    return [
      'Any Combat Stat',
      'Attack',
      'Defense',
      'Initiative',
      'Movement',
      'Range',
      'Armor Piercing',
      'Critical Score',
      'Damage'
    ];
  } else if (aspect === 'feature') {
    const features = (itemsMap['features'] || []).map(f => f.name || f.id);
    return [
      'Any Feature',
      'Any Ability',
      'Any Combat Feature',
      'Any Meta Feature',
      'Any General Feature',
      'Any Karma Feature',
      'Any Skill Feature',
      'Any Exotic Feature',
      ...features
    ];
  } else if (aspect === 'other') {
    return [
      'Any',
      'Health',
      'Vitality',
      'Karma',
      'Plot Points',
      'Essence',
      'Tech Level',
      'Meta Level'
    ];
  }
  return ['Any'];
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
  const activeDbData = (dbData && Object.keys(dbData).length > 0) ? dbData : (dbContext.activeDbData || {});
  const activeSaveEntry = saveEntry || dbContext.activeSaveEntry;

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
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
    setCategoryFilter('all');
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
        const fetched = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
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
      const fetched = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
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
  const rawItems = items.length > 0 ? items : localFallback;

  // Prepend Category / Group Options if source is features or skills
  let categoryOptions = [];
  if (sourceCollection === 'features') {
    categoryOptions = FEATURE_CATEGORY_ITEMS;
  } else if (sourceCollection === 'skills') {
    categoryOptions = SKILL_GROUP_ITEMS;
  }

  // Combine category options with database items and canonical base skills, ensuring no duplicates by name
  const existingNames = new Set(categoryOptions.map(c => c.name.toLowerCase()));
  const nonDuplicateItems = [];

  // First include database / cloud items
  for (const item of rawItems) {
    const key = (item.name || item.id || '').toLowerCase();
    if (key && !existingNames.has(key)) {
      existingNames.add(key);
      nonDuplicateItems.push(item);
    }
  }

  // Include canonical skills if source is skills
  if (sourceCollection === 'skills') {
    for (const cItem of ALL_CANONICAL_SKILLS) {
      const key = (cItem.name || cItem.id || '').toLowerCase();
      if (key && !existingNames.has(key)) {
        existingNames.add(key);
        nonDuplicateItems.push(cItem);
      }
    }
  }

  const allAvailableItems = [...categoryOptions, ...nonDuplicateItems];

  const filteredItems = allAvailableItems.filter(item => {
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'groups') {
        if (item.type !== 'Category Group' && item.type !== 'Skill Group') return false;
      } else if (item.group !== categoryFilter) {
        return false;
      }
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.type && item.type.toLowerCase().includes(term)) ||
      (item.categoryLabel && item.categoryLabel.toLowerCase().includes(term))
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
      const payload = {
        id: newId,
        ...newFormData,
        name: itemName,
        description: (newFormData.description || '').trim(),
        createdAt: new Date().toISOString()
      };

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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-4 sm:pt-6 overflow-y-auto">
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

            {/* Category Sub-Filter Header Bar for Skills */}
            {sourceCollection === 'skills' && (
              <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors shrink-0 ${
                    categoryFilter === 'all'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All ({allAvailableItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('groups')}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors shrink-0 ${
                    categoryFilter === 'groups'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900 text-amber-400/80 hover:text-amber-300 border border-slate-800'
                  }`}
                >
                  📂 Skill Groups (6)
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('physical')}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors shrink-0 ${
                    categoryFilter === 'physical'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  🏃 Physical (5)
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('mental')}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors shrink-0 ${
                    categoryFilter === 'mental'
                      ? 'bg-blue-950 text-blue-300 border border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  🧠 Mental (49)
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('social')}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors shrink-0 ${
                    categoryFilter === 'social'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  💬 Social (19)
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('combat')}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors shrink-0 ${
                    categoryFilter === 'combat'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  ⚔️ Combat (8)
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('meta')}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors shrink-0 ${
                    categoryFilter === 'meta'
                      ? 'bg-purple-950 text-purple-300 border border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  🔮 Metafocus (7)
                </button>
              </div>
            )}

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
                resetScrollDeps={[searchTerm, categoryFilter, sourceCollection, items.length]}
                getKey={(item, index) => item.id || item.name || index}
                containerClassName="flex-1 overflow-y-auto p-4 bg-slate-950/40"
                renderItem={(item) => {
                  const val = item.name || item.id;
                  const itemKey = item.id || item.name;
                  const isChecked = currentSelected.includes(val) || currentSelected.includes(item.id);
                  const isCategoryGroup = item.type === 'Category Group' || item.type === 'Skill Group';

                  return (
                    <div className="pb-2 box-border">
                      <div
                        key={itemKey}
                        onClick={() => toggleItem(val)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 h-[64px] box-border ${
                          isChecked
                            ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                            : isCategoryGroup
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 hover:border-amber-500/70 hover:bg-amber-950/50'
                            : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                        }`}
                      >
                        <input
                          type={isMulti ? 'checkbox' : 'radio'}
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 accent-cyan-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                            <span className={`truncate pr-2 flex items-center gap-1.5 ${isCategoryGroup ? 'text-amber-300 font-semibold' : ''}`}>
                              {isCategoryGroup && <span>📂</span>}
                              {item.name || item.id}
                            </span>
                            {item.type && (
                              <span className={`text-[10px] px-2 py-0.5 rounded font-mono shrink-0 ${
                                isCategoryGroup
                                  ? 'bg-amber-950/90 text-amber-300 border border-amber-500/50 font-bold'
                                  : item.group === 'physical'
                                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 font-bold'
                                  : item.group === 'mental'
                                  ? 'bg-blue-950/90 text-blue-300 border border-blue-500/50 font-bold'
                                  : item.group === 'social'
                                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 font-bold'
                                  : item.group === 'combat'
                                  ? 'bg-amber-950/90 text-amber-300 border border-amber-500/50 font-bold'
                                  : item.group === 'meta'
                                  ? 'bg-purple-950/90 text-purple-300 border border-purple-500/50 font-bold'
                                  : 'bg-slate-800 text-cyan-300'
                              }`}>
                                {item.type}
                              </span>
                            )}
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
