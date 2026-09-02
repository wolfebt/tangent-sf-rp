import React, { useState, useMemo } from 'react';
import { useCampaign, useStory } from '../../../context/CampaignContext';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState('az'); // 'az' | 'za' | 'type'
  const [isBuildingNew, setIsBuildingNew] = useState(false);

  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('tangent_catalog_view_mode') || 'cards';
    } catch {
      return 'cards';
    }
  });

  const handleToggleViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('tangent_catalog_view_mode', mode);
    } catch {}
  };

  // Map legacy dbSource keys to standard Element Types
  const typeMap = {
    'species': 'Species',
    'factions': 'Faction',
    'origins': 'Custom',
    'occupations': 'Custom',
    'weaponry': 'Item',
    'armoring': 'Item',
    'gear': 'Item',
    'rules_codex': 'Custom',
    'compendium': 'Custom'
  };

  const targetType = typeMap[sourceType] || (sourceType ? String(sourceType).charAt(0).toUpperCase() + String(sourceType).slice(1) : 'Custom');

  // Compute available type pills
  const typePills = useMemo(() => {
    const types = new Set(['ALL']);
    (elementsCatalog || []).forEach(el => {
      if (el.type) types.add(el.type);
    });
    return Array.from(types);
  }, [elementsCatalog]);

  // Filtered and sorted elements
  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    let list = (elementsCatalog || []).filter(el => {
      // Type matching
      if (activeTypeFilter !== 'ALL' && el.type !== activeTypeFilter) {
        return false;
      }
      if (targetType && targetType !== 'Custom' && activeTypeFilter === 'ALL' && el.type !== targetType) {
        // Soft match: prioritize targetType unless custom
      }

      // Search matching
      if (query) {
        const title = String(el.title || '').toLowerCase();
        const summary = String(el.fields?.summary || el.content || '').toLowerCase();
        const elType = String(el.type || '').toLowerCase();
        if (!title.includes(query) && !summary.includes(query) && !elType.includes(query)) {
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
  }, [elementsCatalog, searchTerm, activeTypeFilter, sortOption, targetType]);

  const handleSelectItem = (item) => {
    if (onSelect) {
      onSelect(isMulti ? [item] : item);
    }
    onClose();
  };

  const handleSaveCreatedElement = async (newElement) => {
    if (storyContext?.saveElementToCloud) {
      try {
        await storyContext.saveElementToCloud(newElement);
      } catch (err) {
        console.warn('Cloud save warning for element:', err);
      }
    }
    if (onSelect) {
      onSelect(isMulti ? [newElement] : newElement);
    }
    setIsBuildingNew(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 md:pt-16 pb-12 overflow-y-auto select-none font-sans">
        <div className="bg-[#0d131f] border border-cyan-500/50 rounded-2xl w-full max-w-4xl shadow-[0_0_30px_rgba(34,211,238,0.2)] text-slate-100 flex flex-col max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
          
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
                onClick={() => setIsBuildingNew(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Build New Element</span>
              </button>

              <button
                type="button"
                onClick={onClose}
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
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
                  onClick={() => setIsBuildingNew(true)}
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
                    {filteredItems.map(item => (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="hover:bg-cyan-950/30 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-bold text-slate-100 group-hover:text-cyan-300">
                          {item.title || 'Untitled'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getTypePillStyle ? getTypePillStyle(item.type) : 'bg-slate-900 border border-slate-700 text-slate-300'}`}>
                            {item.type || 'Custom'}
                          </span>
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
                            className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* SHARP HIGH-TECH CARDS */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/90 hover:border-cyan-500/70 p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-[0_0_16px_rgba(34,211,238,0.2)]"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getTypePillStyle ? getTypePillStyle(item.type) : 'bg-slate-900 text-cyan-300'}`}>
                          {item.type || 'Custom'}
                        </span>
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
                        className="px-3 py-1.5 bg-cyan-950/90 group-hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Select</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex justify-end gap-2 shrink-0">
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
      {isBuildingNew && (
        <EditElementModal
          isOpen={isBuildingNew}
          onClose={() => setIsBuildingNew(false)}
          element={{ type: targetType || 'Custom' }}
          onSave={handleSaveCreatedElement}
        />
      )}
    </>
  );
};

export default ElementSelectorModal;
