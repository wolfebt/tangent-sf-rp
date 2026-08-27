import React, { useState, useEffect, useRef, Suspense } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { categoryConfig } from './categoryConfig';
import { VirtualizedList } from './VirtualizedList';
import { useDBM } from '../../context/DBMContext';
import { ALL_CANONICAL_SKILLS } from '../../data/skillsData';

// Dynamically import DBMItemModal to enable full manage modal build flow without circular bundling
const DBMItemModal = React.lazy(() => import('./DBMItemModal').then(m => ({ default: m.DBMItemModal })));

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
  onChange,
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
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('tangent_catalog_view_mode') || 'cards';
    } catch {
      return 'cards';
    }
  });

  // Dedicated Manage Modal State for building/editing a record
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [manageSelectedItem, setManageSelectedItem] = useState(null);
  const [manageFormData, setManageFormData] = useState({});

  const selectorFetchedRef = useRef({});

  const colConfig = getCollectionConfig(sourceCollection) || EMPTY_CONFIG;

  // Reset modal state on open or sourceCollection change
  useEffect(() => {
    if (!isOpen) {
      selectorFetchedRef.current = {};
      return;
    }
    setCurrentSelected(Array.isArray(selectedValues) ? selectedValues : (selectedValues ? [selectedValues] : []));
    setSearchTerm('');
    setCategoryFilter('all');
    setIsManageModalOpen(false);
    setManageSelectedItem(null);
    setManageFormData({});
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
    if (onSelect) {
      if (isMulti) {
        onSelect(currentSelected);
      } else {
        onSelect(currentSelected[0] || '');
      }
    }
    if (onChange) {
      const selectedObjects = currentSelected.map(sel => {
        const found = allAvailableItems.find(i => (i.name || i.id) === sel || i.id === sel);
        return found || { name: sel, id: sel };
      });
      onChange(isMulti ? selectedObjects : (selectedObjects.length > 0 ? selectedObjects : []));
    }
    onClose();
  };

  const handleOpenBuildManage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setManageSelectedItem(null);
    setManageFormData({
      name: searchTerm.trim() || '',
      category: categoryFilter !== 'all' && categoryFilter !== 'groups' ? categoryFilter : ''
    });
    setIsManageModalOpen(true);
  };

  const handleOpenEditManage = (item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setManageSelectedItem(item);
    setManageFormData({ ...item });
    setIsManageModalOpen(true);
  };

  const handleManageSave = async (savedItem) => {
    const itemToSave = {
      ...savedItem,
      id: savedItem.id || manageSelectedItem?.id || `custom_${Date.now()}`
    };

    // 1. Update local items list
    setItems(prev => {
      const idx = prev.findIndex(i => (i.id && i.id === itemToSave.id) || (i.name && i.name === itemToSave.name));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = itemToSave;
        return next;
      }
      return [...prev, itemToSave];
    });

    // 2. Update global activeDbData state & local storage
    if (activeSaveEntry) {
      await activeSaveEntry(itemToSave, sourceCollection);
    }

    // 3. Notify parent DBMItemModal
    if (onItemCreated) {
      onItemCreated(sourceCollection, itemToSave);
    }

    // 4. Update selection array & confirm to parent form
    const selectVal = itemToSave.name || itemToSave.id;
    let updatedSelected = [...currentSelected];
    if (isMulti) {
      if (!updatedSelected.includes(selectVal)) {
        updatedSelected.push(selectVal);
      }
    } else {
      updatedSelected = [selectVal];
    }

    setCurrentSelected(updatedSelected);

    if (onSelect) {
      if (isMulti) {
        onSelect(updatedSelected);
      } else {
        onSelect(updatedSelected[0] || '');
      }
    }
    if (onChange) {
      onChange([itemToSave]);
    }

    // 5. Close manage modal and selector modal
    setIsManageModalOpen(false);
    onClose();

    // 6. Non-blocking background Firestore sync
    setDoc(doc(db, sourceCollection, itemToSave.id), itemToSave).catch(err => {
      console.warn("Background cloud sync note:", err.message);
    });
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
            <button
              type="button"
              onClick={handleOpenBuildManage}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase transition-colors shadow flex items-center gap-1 cursor-pointer z-10"
            >
              ✨ + Build Record
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white font-bold ml-2 text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body: Always directly presents the sorted catalog */}
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
              {/* View Mode Toggle: Clean Table vs Cards */}
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('table');
                    try { localStorage.setItem('tangent_catalog_view_mode', 'table'); } catch {}
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Clean Table Listing View"
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('cards');
                    try { localStorage.setItem('tangent_catalog_view_mode', 'cards'); } catch {}
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Sharp High-Tech Cards View"
                >
                  Cards
                </button>
              </div>
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
                  <button
                    type="button"
                    onClick={handleOpenBuildManage}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase rounded shadow transition-all inline-flex items-center gap-1.5 mt-1 cursor-pointer"
                  >
                    <span>✨</span> + Build New {colConfig.label || sourceCollection} Record
                  </button>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              <div className="flex-1 overflow-y-auto p-4 bg-slate-950/40">
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/80 shadow-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                        <th className="py-2.5 px-3 w-10 text-center">Sel</th>
                        <th className="py-2.5 px-3">Designation / Record</th>
                        <th className="py-2.5 px-3">Type / Category</th>
                        <th className="py-2.5 px-3 hidden md:table-cell">Overview</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredItems.map((item, idx) => {
                        const val = item.name || item.id;
                        const isChecked = currentSelected.includes(val) || currentSelected.includes(item.id);
                        return (
                          <tr
                            key={item.id || idx}
                            onClick={() => toggleItem(val)}
                            className={`transition-colors cursor-pointer ${
                              isChecked ? 'bg-cyan-950/60 border-l-2 border-l-cyan-400' : 'hover:bg-cyan-950/20'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                              <input
                                type={isMulti ? 'checkbox' : 'radio'}
                                checked={isChecked}
                                onChange={() => toggleItem(val)}
                                className="accent-cyan-500 w-3.5 h-3.5 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-200">
                              {item.name || item.id}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-[10px] font-mono text-cyan-300">
                                {item.type || item.category || 'Standard'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate hidden md:table-cell">
                              {item.description || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditManage(item, e)}
                                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/70 text-slate-400 hover:text-amber-300 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                                title={`Edit ${item.name || item.id} in database`}
                              >
                                <span>✏️</span>
                                <span>Edit</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                            <div className="flex items-center gap-1 shrink-0">
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
                              {!isCategoryGroup && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleOpenEditManage(item, e); }}
                                  className="p-1 rounded text-[10px] bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/70 text-slate-400 hover:text-amber-300 transition-all cursor-pointer"
                                  title={`Edit ${item.name || item.id} in database`}
                                >
                                  <span>✏️</span>
                                </button>
                              )}
                            </div>
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
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentSelected([])}
              className="text-xs text-slate-400 hover:text-slate-200 underline uppercase cursor-pointer"
            >
              Clear Selection
            </button>
            <span className="text-[11px] text-slate-500 font-mono">
              ({filteredItems.length} records available)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenBuildManage}
              className="px-3.5 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-500/60 text-amber-300 rounded text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <span>✨</span> + Build Record
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase cursor-pointer transition-colors"
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

        {/* Dedicated DBM Manage Modal for Building New Record */}
        <Suspense fallback={null}>
          {isManageModalOpen && (
            <DBMItemModal
              isOpen={isManageModalOpen}
              onClose={() => setIsManageModalOpen(false)}
              isEditMode={true}
              setIsEditMode={() => {}}
              selectedItem={manageSelectedItem}
              editFormData={manageFormData}
              setEditFormData={setManageFormData}
              currentConfig={colConfig}
              currentKey={sourceCollection}
              onSave={handleManageSave}
              onDelete={() => setIsManageModalOpen(false)}
              dbData={activeDbData}
              saveEntry={activeSaveEntry}
              devMode={true}
              isAdmin={true}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};
