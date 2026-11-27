import React, { useState, useMemo, useEffect } from 'react';
import { useCampaign, useStory } from '../../../context/CampaignContext';
import { useDBM } from '../../../context/DBMContext';
import { useFolio } from '../../../context/FolioContext';
import { useAuth } from '../../../context/AuthContext';
import { buildUnifiedAdeCatalog } from '../../../utils/cortexAdeAssetBridge';
import { 
  Search, 
  X, 
  Plus, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  Sparkles, 
  Check, 
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import EditElementModal from './EditElementModal';
import { getTypePillStyle } from './elementSchemas';
import { STORAGE_KEYS } from '../../../constants/storageKeys';
import { persistAdeElement } from '../../../utils/adeElementPersistence.js';
import { showToast } from '../../../context/ToastContext';

export const ElementSelectorModal = ({ 
  isOpen, 
  onClose, 
  sourceType, 
  fieldLabel, 
  onSelect, 
  isMulti = false 
}) => {
  const { elementsCatalog } = useCampaign();
  const storyContext = useStory();
  const { dbData, saveEntry } = useDBM() || { dbData: {} };
  const { personaRoster = [], publicCatalog = [], saveCurrentToRoster } = useFolio() || {};
  const { isAdmin = false } = useAuth() || {};
  const [searchTerm, setSearchTerm] = useState('');

  // Unified catalog composing Story Elements + Persona Folio Roster + Omnicortex MCM & Codex
  const unifiedCatalog = useMemo(() => {
    return buildUnifiedAdeCatalog({
      elementsCatalog,
      dbData,
      folioRoster: personaRoster,
      publicPersonas: publicCatalog
    });
  }, [elementsCatalog, dbData, personaRoster, publicCatalog]);

  // Map legacy & OmniCortex dbSource keys to standard Element Types
  const typeMap = {
    species: 'Species',
    species_type: 'Species',
    factions: 'Faction',
    origins: 'Custom',
    occupations: 'Custom',
    archetypes: 'Custom',
    traits: 'Custom',
    features: 'Custom',
    disadvantages: 'Custom',
    weaponry: 'Property',
    armoring: 'Property',
    augmentations: 'Property',
    gear: 'Property',
    mecha: 'Property',
    architecture: 'Property',
    technology: 'Property',
    other_property: 'Property',
    invocations: 'Metaphysics',
    disciplines: 'Metaphysics',
    special_abilities: 'Metaphysics',
    world: 'World',
    planetary_design: 'World',
    setting: 'Setting',
    scene: 'Scene',
    philosophy: 'Philosophy',
    universe: 'Universe',
    personas: 'Persona',
    npcs: 'Persona',
    modular_characters: 'Persona',
    rules_codex: 'Custom',
    compendium: 'Custom'
  };

  const targetType = typeMap[sourceType] || (sourceType ? String(sourceType).charAt(0).toUpperCase() + String(sourceType).slice(1) : 'Custom');

  const [activeTypeFilter, setActiveTypeFilter] = useState(targetType && targetType !== 'Custom' ? targetType : null);
  const [sortOption, setSortOption] = useState('az'); // 'az' | 'za' | 'type'
  const [draftNewElement, setDraftNewElement] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [visibleLimit, setVisibleLimit] = useState(48);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set());
      setVisibleLimit(48);
      setActiveTypeFilter(targetType && targetType !== 'Custom' ? targetType : null);
    }
  }, [isOpen, sourceType, targetType]);

  const effectiveCatalog = useMemo(() => {
    const base = Array.isArray(unifiedCatalog) ? unifiedCatalog : [];
    if (!sourceType || !Array.isArray(dbData?.[sourceType]) || dbData[sourceType].length === 0) {
      return base;
    }
    const existingIds = new Set(base.map((item) => item.id));
    const fallbackEntries = dbData[sourceType]
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry, idx) => {
        const id = entry.id || `${sourceType}_${idx}`;
        return {
          id,
          title: entry.name || entry.title || entry.label || String(id),
          type: targetType || 'Custom',
          sourceLabel: sourceType,
          fields: { ...entry, dbmCategory: sourceType, dbmId: id },
          content: entry.description || entry.summary || ''
        };
      })
      .filter((entry) => !existingIds.has(entry.id));
    return [...base, ...fallbackEntries];
  }, [unifiedCatalog, dbData, sourceType, targetType]);

  const handleStartBuildNew = () => {
    setDraftNewElement({
      id: `elem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: targetType || 'Custom'
    });
  };

  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CATALOG_VIEW_MODE) || 'cards';
    } catch {
      return 'cards';
    }
  });

  const handleToggleViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.CATALOG_VIEW_MODE, mode);
    } catch {}
  };

  // Compute available type pills
  const typePills = useMemo(() => {
    const types = new Set();
    (effectiveCatalog || []).forEach(el => {
      if (el.type) types.add(el.type);
    });
    return [...Array.from(types).sort(), 'ALL'];
  }, [effectiveCatalog]);

  // Sync default type filter if unselected
  useEffect(() => {
    if (!activeTypeFilter) {
      if (targetType && targetType !== 'Custom') {
        setActiveTypeFilter(targetType);
      } else if (typePills.length > 0) {
        setActiveTypeFilter(typePills[0]);
      }
    }
  }, [targetType, typePills, activeTypeFilter]);

  // Filtered and sorted elements
  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    let list = (effectiveCatalog || []).filter(el => {
      // Type matching
      if (activeTypeFilter !== 'ALL' && el.type !== activeTypeFilter) {
        return false;
      }

      // Search matching
      if (query) {
        const title = String(el.title || '').toLowerCase();
        const summary = String(el.fields?.summary || el.content || '').toLowerCase();
        const elType = String(el.type || '').toLowerCase();
        const haystack = String(el.searchHaystack || '').toLowerCase();
        const tags = String(el.fields?.tags || el.fields?.keywords || el.fields?.archetype || '').toLowerCase();
        if (
          !title.includes(query) &&
          !summary.includes(query) &&
          !elType.includes(query) &&
          !haystack.includes(query) &&
          !tags.includes(query)
        ) {
          return false;
        }
      }
      return true;
    });

    return list.sort((a, b) => {
      const titleA = String(a.title || '');
      const titleB = String(b.title || '');
      if (sortOption === 'az') return titleA.localeCompare(titleB);
      if (sortOption === 'za') return titleB.localeCompare(titleA);
      if (sortOption === 'type') return String(a.type || '').localeCompare(String(b.type || ''));
      return titleA.localeCompare(titleB);
    });
  }, [effectiveCatalog, searchTerm, activeTypeFilter, sortOption]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleLimit),
    [filteredItems, visibleLimit]
  );

  const handleSelectItem = (item) => {
    if (isMulti) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) next.delete(item.id);
        else next.add(item.id);
        return next;
      });
      return;
    }
    if (onSelect) {
      onSelect(item);
    }
    onClose();
  };

  const handleConfirmMultiSelect = () => {
    const selectedItems = (effectiveCatalog || []).filter((item) => selectedIds.has(item.id));
    if (selectedItems.length === 0) return;
    if (onSelect) {
      onSelect(selectedItems);
    }
    onClose();
  };

  const handleSaveCreatedElement = async (newElement) => {
    const ensured = {
      ...newElement,
      id: newElement?.id || `elem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    };
    const res = await persistAdeElement({
      element: ensured,
      elementsCatalog: storyContext?.elementsCatalog || elementsCatalog || [],
      updateSavedElement: storyContext?.updateSavedElement,
      saveEntry,
      saveCurrentToRoster,
      showToast,
      isStoryReadOnly: Boolean(storyContext?.isStoryReadOnly),
      fromEditModal: true,
      isAdmin: Boolean(isAdmin)
    });
    if (!res) return null;
    if (onSelect) {
      onSelect(isMulti ? [res] : res);
    }
    setDraftNewElement(null);
    onClose();
    return res;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 md:pt-16 pb-12 overflow-y-auto font-sans">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Select ${fieldLabel || targetType}`}
          className="bg-[#0d131f] border-2 border-cyan-400/80 rounded-2xl w-full max-w-4xl shadow-[0_0_40px_rgba(6,182,212,0.3)] text-slate-100 flex flex-col max-h-[85vh] sm:max-h-[88vh] overflow-hidden"
        >
          
          {/* HEADER */}
          <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-cyan-400 uppercase tracking-wider">
                  Select {fieldLabel || targetType}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {filteredItems.length} {filteredItems.length === 1 ? 'element' : 'elements'} available
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleStartBuildNew}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Build New Element</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close element selector"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CONTROLS BAR */}
          <div className="p-4 bg-slate-900/60 border-b border-slate-800 space-y-3 shrink-0">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
              
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search elements by title or summary..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-2 font-medium"
                >
                  <option value="az" className="bg-slate-950 text-slate-200">Title (A → Z)</option>
                  <option value="za" className="bg-slate-950 text-slate-200">Title (Z → A)</option>
                  <option value="type" className="bg-slate-950 text-slate-200">Element Type</option>
                </select>
              </div>

              {/* View Mode Switcher: Clean Table vs Cards */}
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleViewMode('table')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Clean Table Listing View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleViewMode('cards')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Sharp High-Tech Selection Cards View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>

            {/* Type Filter Pills */}
            {typePills.length > 2 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {typePills.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                      activeTypeFilter === type
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                        : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-950/50 min-h-[260px]">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">No matching elements found</h4>
                  <p className="text-xs text-slate-400">
                    {searchTerm
                      ? `No elements match "${searchTerm}". Build a new element now.`
                      : 'No elements exist for this criteria yet.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartBuildNew}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Build New Element</span>
                </button>
              </div>
            ) : viewMode === 'table' ? (
              /* CLEAN TABLE LISTING */
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80 shadow-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                      <th className="py-3 px-4">Title / Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 hidden md:table-cell">Summary</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {visibleItems.map(item => {
                      const isSelected = isMulti && selectedIds.has(item.id);
                      return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className={`hover:bg-cyan-950/30 transition-colors cursor-pointer group ${isSelected ? 'bg-cyan-950/40' : ''}`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-100 group-hover:text-cyan-300 flex items-center gap-2">
                          {isMulti && (
                            <span className={`w-4 h-4 rounded border inline-flex items-center justify-center shrink-0 ${isSelected ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-600'}`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </span>
                          )}
                          <span>{item.title || 'Untitled'}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getTypePillStyle ? getTypePillStyle(item.type) : 'bg-slate-900 border border-slate-700 text-slate-300'}`}>
                              {item.type || 'Custom'}
                            </span>
                            {item.sourceLabel && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono">
                                {item.sourceLabel}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-sm truncate hidden md:table-cell">
                          {item.fields?.summary || item.content || '—'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectItem(item);
                            }}
                            className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-cyan-600 border-cyan-400 text-white'
                                : 'bg-cyan-950 hover:bg-cyan-900 border-cyan-500/60 text-cyan-300'
                            }`}
                          >
                            {isMulti ? (isSelected ? 'Selected' : 'Add') : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* SHARP HIGH-TECH CARDS */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleItems.map(item => {
                  const isSelected = isMulti && selectedIds.has(item.id);
                  return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-[0_0_16px_rgba(34,211,238,0.2)] ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40'
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/90 hover:border-cyan-500/70'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getTypePillStyle ? getTypePillStyle(item.type) : 'bg-slate-900 text-cyan-300'}`}>
                          {item.type || 'Custom'}
                        </span>
                        {item.sourceLabel && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300 font-mono font-bold uppercase">
                            {item.sourceLabel}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1.5">
                        {item.title || 'Untitled'}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {item.fields?.summary || item.content || 'No narrative overview available.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">
                        #{String(item.id).slice(-6)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(item);
                        }}
                        className={`px-3 py-1.5 border rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-600 border-cyan-400 text-white'
                            : 'bg-cyan-950/90 group-hover:bg-cyan-900 border-cyan-500/60 text-cyan-300'
                        }`}
                      >
                        {isMulti && isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{isMulti ? (isSelected ? 'Selected' : 'Add') : 'Select'}</span>
                        {!isMulti && <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
                })}
              </div>
            )}
            {filteredItems.length > visibleLimit && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleLimit((prev) => prev + 48)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase cursor-pointer"
                >
                  Load More ({filteredItems.length - visibleLimit} remaining)
                </button>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex justify-end gap-2 shrink-0">
            {isMulti && (
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={handleConfirmMultiSelect}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Selected ({selectedIds.size})</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Build / Edit Element Modal */}
      {draftNewElement && (
        <EditElementModal
          isOpen={true}
          onClose={() => setDraftNewElement(null)}
          element={draftNewElement}
          onSave={handleSaveCreatedElement}
          zIndexClass="z-[260]"
        />
      )}
    </>
  );
};

export default ElementSelectorModal;
