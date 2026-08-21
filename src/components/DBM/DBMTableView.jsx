import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VirtualizedList } from './VirtualizedList';
import { useItemInteractions } from '../../utils/interactionUtils';

/**
 * Format any field value for display in table rows
 */
const formatCellValue = (val) => {
  if (val === undefined || val === null || val === '') return '-';
  if (typeof val === 'boolean') {
    return val ? (
      <span className="text-emerald-400 font-bold">✓</span>
    ) : (
      <span className="text-slate-600 font-bold">✕</span>
    );
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return '-';
    return val.map(item => {
      if (typeof item === 'object' && item !== null) {
        return item.name || item.skill || item.title || item.id || JSON.stringify(item);
      }
      return String(item);
    }).join(', ');
  }
  if (typeof val === 'object') {
    return val.name || val.title || val.id || JSON.stringify(val);
  }
  return String(val);
};

const CatalogVirtualRow = ({ item, visibleColumns, handleOpenItem, isAdmin }) => {
  const interactions = useItemInteractions({
    onSelect: () => handleOpenItem(item, false),
    onOpenEdit: () => isAdmin && handleOpenItem(item, true),
    delay: 1500
  });

  const creatorTag = Array.isArray(item.tags)
    ? item.tags.find(t => typeof t === 'string' && t.startsWith('@'))
    : (typeof item.tags === 'string' && item.tags.split(',').map(t => t.trim()).find(t => t.startsWith('@')));

  const otherCols = visibleColumns.filter(col => col !== 'name');

  return (
    <div
      key={item.id || item.name}
      {...interactions}
      className="hover:bg-slate-800/60 cursor-pointer transition-colors border-b border-slate-800/60 flex items-center px-3 text-xs text-slate-300 h-[44px] box-border select-none gap-3"
      title="Single click to view. Double-click (or long press 1.5s+ on mobile) to edit."
    >
      <div className="w-1/3 min-w-[160px] font-bold text-white truncate flex items-center gap-1.5 shrink-0">
        <span className="truncate">{item.name || 'Unnamed'}</span>
        {creatorTag && (
          <span className="px-1.5 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-mono shrink-0">
            {creatorTag}
          </span>
        )}
      </div>
      {otherCols.map(col => (
        <div
          key={col}
          className="flex-1 min-w-[110px] text-slate-400 truncate text-xs"
          title={typeof item[col] === 'string' ? item[col] : undefined}
        >
          {formatCellValue(item[col])}
        </div>
      ))}
    </div>
  );
};

const CatalogTableRow = ({ item, visibleColumns, handleOpenItem, isAdmin }) => {
  const interactions = useItemInteractions({
    onSelect: () => handleOpenItem(item, false),
    onOpenEdit: () => isAdmin && handleOpenItem(item, true),
    delay: 1500
  });

  const creatorTag = Array.isArray(item.tags)
    ? item.tags.find(t => typeof t === 'string' && t.startsWith('@'))
    : (typeof item.tags === 'string' && item.tags.split(',').map(t => t.trim()).find(t => t.startsWith('@')));

  const otherCols = visibleColumns.filter(col => col !== 'name');

  return (
    <tr
      key={item.id || item.name}
      {...interactions}
      className="hover:bg-slate-800/60 cursor-pointer transition-colors h-[44px] select-none"
      title="Single click to view. Double-click (or long press 1.5s+ on mobile) to edit."
    >
      <td className="p-3 font-bold text-white w-1/3 min-w-[160px] truncate">
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate">{item.name || 'Unnamed'}</span>
          {creatorTag && (
            <span className="px-1.5 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-mono shrink-0">
              {creatorTag}
            </span>
          )}
        </div>
      </td>
      {otherCols.map(col => (
        <td
          key={col}
          className="p-3 text-slate-400 truncate max-w-xs"
          title={typeof item[col] === 'string' ? item[col] : undefined}
        >
          {formatCellValue(item[col])}
        </td>
      ))}
    </tr>
  );
};

export const DBMTableView = ({
  currentConfig = {},
  currentKey = '',
  searchTerm = '',
  setSearchTerm = () => {},
  handleImportJSON = () => {},
  handleExportJSON = () => {},
  handleCreateNew = () => {},
  sortField = 'name',
  setSortField = () => {},
  sortAsc = true,
  setSortAsc = () => {},
  filteredItems = [],
  handleOpenItem = () => {},
  filterTypes = [],
  setFilterTypes = () => {},
  filterSubtypes = [],
  setFilterSubtypes = () => {},
  filterTLs = [],
  setFilterTLs = () => {},
  filterMLs = [],
  setFilterMLs = () => {},
  filterTags = [],
  setFilterTags = () => {},
  currentItems = [],
  isAdmin = true,
  handleDeleteEntry
}) => {
  const fileInputRef = useRef(null);
  const columnsDropdownRef = useRef(null);
  const filtersDropdownRef = useRef(null);

  // Dropdown states
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [isFiltersMenuOpen, setIsFiltersMenuOpen] = useState(false);
  const [columnSearchTerm, setColumnSearchTerm] = useState('');
  const [filterSearchTerm, setFilterSearchTerm] = useState('');

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(e.target)) {
        setIsColumnsMenuOpen(false);
      }
      if (filtersDropdownRef.current && !filtersDropdownRef.current.contains(e.target)) {
        setIsFiltersMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsColumnsMenuOpen(false);
        setIsFiltersMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Compute all available schema and entry fields for the current category
  const allAvailableFields = useMemo(() => {
    const fieldMap = new Map();
    // Primary field
    fieldMap.set('name', { key: 'name', label: 'Name', type: 'text' });

    // Fields defined in currentConfig.fields
    if (currentConfig.fields) {
      Object.entries(currentConfig.fields).forEach(([fKey, fDef]) => {
        if (!fieldMap.has(fKey)) {
          fieldMap.set(fKey, {
            key: fKey,
            label: fDef?.label || fKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            type: fDef?.type || 'text'
          });
        }
      });
    }

    // Default directory columns from config
    if (Array.isArray(currentConfig.directory_columns)) {
      currentConfig.directory_columns.forEach(col => {
        if (!fieldMap.has(col)) {
          fieldMap.set(col, {
            key: col,
            label: col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            type: 'text'
          });
        }
      });
    }

    // Common standard fields
    ['tags', 'updatedAt', 'creator'].forEach(f => {
      if (!fieldMap.has(f)) {
        fieldMap.set(f, {
          key: f,
          label: f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          type: 'text'
        });
      }
    });

    return Array.from(fieldMap.values());
  }, [currentConfig]);

  // Manage Visible Columns (persisted to localStorage per category key)
  const defaultColumns = useMemo(() => {
    return currentConfig.directory_columns && currentConfig.directory_columns.length > 0
      ? currentConfig.directory_columns
      : ['name', 'description'];
  }, [currentConfig]);

  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(`dbm_cols_${currentKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultColumns;
  });

  // Re-sync visible columns when switching category
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`dbm_cols_${currentKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVisibleColumns(parsed);
          return;
        }
      }
    } catch (e) {}
    setVisibleColumns(defaultColumns);
  }, [currentKey, defaultColumns]);

  const updateVisibleColumns = (newCols) => {
    const safeCols = newCols.includes('name') ? newCols : ['name', ...newCols];
    setVisibleColumns(safeCols);
    try {
      localStorage.setItem(`dbm_cols_${currentKey}`, JSON.stringify(safeCols));
    } catch (e) {}
  };

  const toggleColumn = (colKey) => {
    if (colKey === 'name') return; // 'name' is primary and cannot be removed
    if (visibleColumns.includes(colKey)) {
      updateVisibleColumns(visibleColumns.filter(c => c !== colKey));
    } else {
      updateVisibleColumns([...visibleColumns, colKey]);
    }
  };

  const resetDefaultColumns = () => {
    setVisibleColumns(defaultColumns);
    try {
      localStorage.removeItem(`dbm_cols_${currentKey}`);
    } catch (e) {}
  };

  const selectAllColumns = () => {
    const allKeys = allAvailableFields.map(f => f.key);
    updateVisibleColumns(allKeys);
  };

  const deselectExtraColumns = () => {
    updateVisibleColumns(['name']);
  };

  // --- Dynamic Facet Extraction for Multi-Select Filters ---
  const availableTypes = useMemo(() => {
    const types = new Set();
    currentItems.forEach(item => {
      if (Array.isArray(item.type)) {
        item.type.forEach(t => t && types.add(String(t).trim()));
      } else if (item.type) {
        types.add(String(item.type).trim());
      }
      if (item.category) {
        types.add(String(item.category).trim());
      }
    });
    return Array.from(types).sort();
  }, [currentItems]);

  const availableSubtypes = useMemo(() => {
    const subs = new Set();
    currentItems.forEach(item => {
      ['subtype', 'discipline', 'society', 'aspect', 'aspect_subtype'].forEach(k => {
        const val = item[k];
        if (Array.isArray(val)) {
          val.forEach(v => v && subs.add(String(v).trim()));
        } else if (val) {
          subs.add(String(val).trim());
        }
      });
    });
    return Array.from(subs).sort();
  }, [currentItems]);

  const availableTLs = useMemo(() => {
    const tls = new Set();
    currentItems.forEach(item => {
      const val = item.tl !== undefined ? item.tl : item.tech_level;
      if (val !== undefined && val !== null && val !== '') {
        tls.add(val);
      }
    });
    return Array.from(tls).sort((a, b) => Number(a) - Number(b));
  }, [currentItems]);

  const availableMLs = useMemo(() => {
    const mls = new Set();
    currentItems.forEach(item => {
      const val = item.ml !== undefined ? item.ml : item.meta_level;
      if (val !== undefined && val !== null && val !== '') {
        mls.add(val);
      }
    });
    return Array.from(mls).sort((a, b) => Number(a) - Number(b));
  }, [currentItems]);

  const availableTags = useMemo(() => {
    const tags = new Set();
    currentItems.forEach(item => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach(t => t && tags.add(String(t).trim()));
      } else if (typeof item.tags === 'string' && item.tags.trim()) {
        item.tags.split(',').forEach(t => t.trim() && tags.add(t.trim()));
      }
    });
    return Array.from(tags).sort();
  }, [currentItems]);

  // Filter toggles
  const toggleFilterType = (typeVal) => {
    if (filterTypes.includes(typeVal)) {
      setFilterTypes(filterTypes.filter(t => t !== typeVal));
    } else {
      setFilterTypes([...filterTypes, typeVal]);
    }
  };

  const toggleFilterSubtype = (subVal) => {
    if (filterSubtypes.includes(subVal)) {
      setFilterSubtypes(filterSubtypes.filter(s => s !== subVal));
    } else {
      setFilterSubtypes([...filterSubtypes, subVal]);
    }
  };

  const toggleFilterTL = (tlVal) => {
    if (filterTLs.includes(tlVal)) {
      setFilterTLs(filterTLs.filter(t => t !== tlVal));
    } else {
      setFilterTLs([...filterTLs, tlVal]);
    }
  };

  const toggleFilterML = (mlVal) => {
    if (filterMLs.includes(mlVal)) {
      setFilterMLs(filterMLs.filter(m => m !== mlVal));
    } else {
      setFilterMLs([...filterMLs, mlVal]);
    }
  };

  const toggleFilterTag = (tagVal) => {
    if (filterTags.includes(tagVal)) {
      setFilterTags(filterTags.filter(t => t !== tagVal));
    } else {
      setFilterTags([...filterTags, tagVal]);
    }
  };

  const clearAllFilters = () => {
    setFilterTypes([]);
    setFilterSubtypes([]);
    setFilterTLs([]);
    setFilterMLs([]);
    setFilterTags([]);
    setSearchTerm('');
  };

  const totalActiveFilterCount = filterTypes.length + filterSubtypes.length + filterTLs.length + filterMLs.length + filterTags.length;
  const isAnyFilterActive = totalActiveFilterCount > 0 || (searchTerm && searchTerm.trim().length > 0);

  const onImport = (e) => {
    handleImportJSON(e);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Filtered fields for column search
  const filteredAvailableFields = allAvailableFields.filter(f => {
    if (!columnSearchTerm) return true;
    const q = columnSearchTerm.toLowerCase();
    return f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5 overflow-hidden">
      {/* Header Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Database Table</span>
            {!isAdmin && (
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded tracking-wider uppercase">
                👁️ Player View
              </span>
            )}
            <span className="text-[10px] text-slate-400 italic hidden sm:inline">
              (Double-click or long-press 1.5s+ to edit)
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
            {currentConfig.label || currentKey}
          </h2>
        </div>

        {/* Toolbar controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white pl-8 pr-7 py-1.5 rounded text-xs outline-none focus:border-cyan-500 w-48 sm:w-56"
            />
            <span className="absolute left-2.5 top-2 text-slate-500 text-xs pointer-events-none">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1.5 text-slate-500 hover:text-white text-xs px-1"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Multi-Select Pulldown: Columns & Sorting Configuration */}
          <div className="relative" ref={columnsDropdownRef}>
            <button
              onClick={() => {
                setIsColumnsMenuOpen(!isColumnsMenuOpen);
                setIsFiltersMenuOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                isColumnsMenuOpen
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Configure visible columns and field sorting options"
            >
              <span>⚙️ Columns & Sorting</span>
              <span className="px-1.5 py-0.2 bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 rounded-full text-[10px] font-mono">
                {visibleColumns.length}
              </span>
              <span className="text-[10px] opacity-70">{isColumnsMenuOpen ? '▲' : '▼'}</span>
            </button>

            {/* Columns & Sorting Popover Menu */}
            {isColumnsMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border-2 border-cyan-500/60 rounded-lg shadow-2xl z-50 p-3 flex flex-col gap-2.5 backdrop-blur-xl animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Columns & Sorting Fields
                  </span>
                  <button
                    onClick={() => setIsColumnsMenuOpen(false)}
                    className="text-slate-400 hover:text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Search within fields */}
                <input
                  type="text"
                  placeholder="Filter fields..."
                  value={columnSearchTerm}
                  onChange={e => setColumnSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white px-2.5 py-1 rounded text-xs outline-none focus:border-cyan-500"
                />

                {/* Quick actions */}
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-1 border-b border-slate-800/80">
                  <button
                    onClick={resetDefaultColumns}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    ↺ Reset Defaults
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllColumns}
                      className="hover:text-amber-400 transition-colors"
                    >
                      Select All
                    </button>
                    <span>|</span>
                    <button
                      onClick={deselectExtraColumns}
                      className="hover:text-amber-400 transition-colors"
                    >
                      Clear Extra
                    </button>
                  </div>
                </div>

                {/* Fields Checkbox List */}
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredAvailableFields.map(f => {
                    const isVisible = visibleColumns.includes(f.key);
                    const isCurrentSort = sortField === f.key;

                    return (
                      <div
                        key={f.key}
                        className={`flex items-center justify-between px-2 py-1.5 rounded transition-colors text-xs ${
                          isVisible ? 'bg-slate-800/70 text-slate-200' : 'bg-slate-950/40 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer flex-1 truncate select-none">
                          <input
                            type="checkbox"
                            checked={isVisible}
                            disabled={f.key === 'name'}
                            onChange={() => toggleColumn(f.key)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                          />
                          <span className="truncate font-medium">{f.label}</span>
                          {f.key === 'name' && (
                            <span className="text-[9px] text-slate-500 font-mono">(required)</span>
                          )}
                        </label>

                        {/* Quick Sort Button for this field */}
                        <button
                          onClick={() => {
                            if (sortField === f.key) {
                              setSortAsc(!sortAsc);
                            } else {
                              setSortField(f.key);
                              setSortAsc(true);
                              if (!isVisible) toggleColumn(f.key);
                            }
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors shrink-0 ml-1.5 ${
                            isCurrentSort
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-500/70'
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                          }`}
                          title={`Sort by ${f.label} (${isCurrentSort ? (sortAsc ? 'Ascending' : 'Descending') : 'Click to Sort'})`}
                        >
                          {isCurrentSort ? (sortAsc ? '▲ ASC' : '▼ DESC') : '⇅ SORT'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Active Sort Selector in Dropdown Footer */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1 truncate">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
                    <select
                      value={sortField}
                      onChange={e => setSortField(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-cyan-300 px-2 py-1 rounded text-xs outline-none focus:border-cyan-500 flex-1 truncate"
                    >
                      {allAvailableFields.map(f => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setSortAsc(!sortAsc)}
                    className="px-2 py-1 bg-slate-950 border border-slate-700 hover:border-cyan-500 text-cyan-400 font-bold rounded text-xs shrink-0"
                    title="Toggle Sort Direction"
                  >
                    {sortAsc ? '▲ ASC' : '▼ DESC'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Local JSON Controls */}
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            className="hidden"
            onChange={onImport}
          />
          {isAdmin && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Import JSON
            </button>
          )}
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Export JSON
          </button>

          {isAdmin ? (
            <button
              onClick={handleCreateNew}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
            >
              + ADD NEW ENTRY
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-1.5 bg-slate-800 text-slate-500 border border-slate-700/50 rounded text-xs font-bold uppercase tracking-wider cursor-not-allowed opacity-60"
              title="Administrator or GM privileges required to add entries"
            >
              🔒 READ-ONLY
            </button>
          )}
        </div>
      </div>

      {/* --- Filter / Filter Type Bar --- */}
      <div className="flex flex-wrap items-center gap-2 mb-2 pb-2 border-b border-slate-800/80 shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter Type:</span>

        {/* 'All' button */}
        <button
          onClick={() => setFilterTypes([])}
          className={`px-3 py-1 text-xs font-bold uppercase rounded tracking-wider transition-all ${
            filterTypes.length === 0
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All ({currentItems.length})
        </button>

        {/* Quick Autogenerated Type Buttons with Multi-Select Toggle */}
        {availableTypes.map(t => {
          const count = currentItems.filter(i => {
            const types = Array.isArray(i.type) ? i.type : (i.type ? [i.type] : []);
            if (i.category && !types.includes(i.category)) types.push(i.category);
            return types.includes(t);
          }).length;
          const isActive = filterTypes.includes(t);

          return (
            <button
              key={t}
              onClick={() => toggleFilterType(t)}
              className={`px-3 py-1 text-xs font-bold uppercase rounded tracking-wider transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
              title={`Toggle filter for "${t}"`}
            >
              <span>{t}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isActive ? 'bg-cyan-900/60 text-cyan-200' : 'bg-slate-800 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}

        {/* Multi-Select Filters Pulldown Button (Facet Filter Dropdown) */}
        <div className="relative ml-auto" ref={filtersDropdownRef}>
          <button
            onClick={() => {
              setIsFiltersMenuOpen(!isFiltersMenuOpen);
              setIsColumnsMenuOpen(false);
            }}
            className={`px-3 py-1 text-xs font-bold uppercase rounded tracking-wider border transition-all flex items-center gap-1.5 ${
              totalActiveFilterCount > 0
                ? 'bg-amber-950 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>🔍 Filter Options</span>
            {totalActiveFilterCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-900/80 text-amber-200 border border-amber-500/50 rounded-full text-[10px] font-mono">
                {totalActiveFilterCount}
              </span>
            )}
            <span className="text-[10px] opacity-70">{isFiltersMenuOpen ? '▲' : '▼'}</span>
          </button>

          {/* Filter Options Multi-Select Popover Menu */}
          {isFiltersMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border-2 border-amber-500/60 rounded-lg shadow-2xl z-50 p-3 flex flex-col gap-3 backdrop-blur-xl animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Multi-Select Filter Options
                </span>
                <button
                  onClick={() => setIsFiltersMenuOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>

              {/* Search within filter values */}
              <input
                type="text"
                placeholder="Search filter options..."
                value={filterSearchTerm}
                onChange={e => setFilterSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white px-2.5 py-1 rounded text-xs outline-none focus:border-amber-500"
              />

              <div className="max-h-72 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {/* 1. Types / Categories */}
                {availableTypes.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex justify-between items-center">
                      <span>Type / Category</span>
                      {filterTypes.length > 0 && (
                        <button
                          onClick={() => setFilterTypes([])}
                          className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                        >
                          clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {availableTypes
                        .filter(t => !filterSearchTerm || t.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                        .map(t => {
                          const count = currentItems.filter(i => {
                            const types = Array.isArray(i.type) ? i.type : (i.type ? [i.type] : []);
                            if (i.category && !types.includes(i.category)) types.push(i.category);
                            return types.includes(t);
                          }).length;
                          const checked = filterTypes.includes(t);

                          return (
                            <label
                              key={t}
                              className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
                                checked ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40' : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleFilterType(t)}
                                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                                />
                                <span className="truncate">{t}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono ml-2">({count})</span>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* 2. Subtypes / Disciplines / Society */}
                {availableSubtypes.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex justify-between items-center">
                      <span>Subtype / Discipline / Aspect</span>
                      {filterSubtypes.length > 0 && (
                        <button
                          onClick={() => setFilterSubtypes([])}
                          className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                        >
                          clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {availableSubtypes
                        .filter(s => !filterSearchTerm || s.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                        .map(s => {
                          const count = currentItems.filter(i => {
                            const val = i.subtype || i.discipline || i.society || i.aspect || i.aspect_subtype;
                            const subs = Array.isArray(val) ? val : (val ? [val] : []);
                            return subs.includes(s);
                          }).length;
                          const checked = filterSubtypes.includes(s);

                          return (
                            <label
                              key={s}
                              className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
                                checked ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40' : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleFilterSubtype(s)}
                                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                                />
                                <span className="truncate">{s}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono ml-2">({count})</span>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* 3. Tech Level (TL) */}
                {availableTLs.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex justify-between items-center">
                      <span>Tech Level (TL)</span>
                      {filterTLs.length > 0 && (
                        <button
                          onClick={() => setFilterTLs([])}
                          className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                        >
                          clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {availableTLs.map(tl => {
                        const checked = filterTLs.includes(tl);
                        const count = currentItems.filter(i => (i.tl !== undefined ? i.tl : i.tech_level) === tl).length;
                        return (
                          <button
                            key={tl}
                            onClick={() => toggleFilterTL(tl)}
                            className={`px-2 py-0.5 rounded text-xs font-mono font-bold border transition-colors ${
                              checked
                                ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            TL {tl} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Meta Level (ML) */}
                {availableMLs.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex justify-between items-center">
                      <span>Meta Level (ML)</span>
                      {filterMLs.length > 0 && (
                        <button
                          onClick={() => setFilterMLs([])}
                          className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                        >
                          clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {availableMLs.map(ml => {
                        const checked = filterMLs.includes(ml);
                        const count = currentItems.filter(i => (i.ml !== undefined ? i.ml : i.meta_level) === ml).length;
                        return (
                          <button
                            key={ml}
                            onClick={() => toggleFilterML(ml)}
                            className={`px-2 py-0.5 rounded text-xs font-mono font-bold border transition-colors ${
                              checked
                                ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            ML {ml} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Tags & Creators */}
                {availableTags.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex justify-between items-center">
                      <span>Tags & Creators</span>
                      {filterTags.length > 0 && (
                        <button
                          onClick={() => setFilterTags([])}
                          className="text-[10px] text-slate-500 hover:text-slate-300 lowercase"
                        >
                          clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {availableTags
                        .filter(tag => !filterSearchTerm || tag.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                        .map(tag => {
                          const checked = filterTags.includes(tag);
                          const count = currentItems.filter(i => {
                            const tags = Array.isArray(i.tags) ? i.tags : (typeof i.tags === 'string' ? i.tags.split(',').map(t => t.trim()) : []);
                            return tags.includes(tag);
                          }).length;

                          return (
                            <label
                              key={tag}
                              className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
                                checked ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40' : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleFilterTag(tag)}
                                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                                />
                                <span className={`truncate ${tag.startsWith('@') ? 'font-mono text-cyan-400' : ''}`}>{tag}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono ml-2">({count})</span>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Popover Footer */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  ✕ Clear All Filters
                </button>
                <button
                  onClick={() => setIsFiltersMenuOpen(false)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Active Filter Chips Bar --- */}
      {isAnyFilterActive && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 px-1 py-1 bg-slate-950/60 border border-slate-800/80 rounded shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1">Active:</span>

          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded text-[11px]">
              <span>Search: "{searchTerm}"</span>
              <button onClick={() => setSearchTerm('')} className="hover:text-white ml-0.5">✕</button>
            </span>
          )}

          {filterTypes.map(t => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded text-[11px]">
              <span>Type: {t}</span>
              <button onClick={() => toggleFilterType(t)} className="hover:text-white ml-0.5">✕</button>
            </span>
          ))}

          {filterSubtypes.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded text-[11px]">
              <span>Subtype: {s}</span>
              <button onClick={() => toggleFilterSubtype(s)} className="hover:text-white ml-0.5">✕</button>
            </span>
          ))}

          {filterTLs.map(tl => (
            <span key={tl} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-500/40 rounded text-[11px]">
              <span>TL: {tl}</span>
              <button onClick={() => toggleFilterTL(tl)} className="hover:text-white ml-0.5">✕</button>
            </span>
          ))}

          {filterMLs.map(ml => (
            <span key={ml} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-500/40 rounded text-[11px]">
              <span>ML: {ml}</span>
              <button onClick={() => toggleFilterML(ml)} className="hover:text-white ml-0.5">✕</button>
            </span>
          ))}

          {filterTags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded text-[11px]">
              <span>Tag: {tag}</span>
              <button onClick={() => toggleFilterTag(tag)} className="hover:text-white ml-0.5">✕</button>
            </span>
          ))}

          <button
            onClick={clearAllFilters}
            className="text-[10px] font-bold text-rose-400 hover:text-rose-300 underline ml-2 cursor-pointer"
          >
            Clear All
          </button>

          <span className="text-[10px] text-slate-500 ml-auto font-mono">
            Showing {filteredItems.length} of {currentItems.length} entries
          </span>
        </div>
      )}

      {/* --- Data Table --- */}
      <div className="flex-1 overflow-hidden rounded border border-slate-800 bg-slate-950 flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-300 table-fixed">
            <thead className="bg-slate-900 border-b border-slate-800 text-cyan-400 uppercase font-bold sticky top-0 z-10 select-none">
              <tr>
                {visibleColumns.map(col => {
                  const isSorted = sortField === col;
                  const fieldDef = allAvailableFields.find(f => f.key === col);
                  const label = fieldDef ? fieldDef.label : col.replace(/_/g, ' ');
                  const isPrimary = col === 'name';

                  return (
                    <th
                      key={col}
                      onClick={() => {
                        if (sortField === col) {
                          setSortAsc(!sortAsc);
                        } else {
                          setSortField(col);
                          setSortAsc(true);
                        }
                      }}
                      className={`p-3 cursor-pointer hover:text-white transition-colors group ${
                        isPrimary ? 'w-1/3 min-w-[160px]' : 'min-w-[110px]'
                      }`}
                      title={`Click to sort by ${label}`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        <span className="truncate">{label}</span>
                        <span className={`text-[10px] transition-opacity ${
                          isSorted ? 'text-amber-400 opacity-100 font-bold' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                        }`}>
                          {isSorted ? (sortAsc ? '▲' : '▼') : '↕'}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
          </table>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic flex flex-col items-center justify-center gap-2">
              <span>No matching records found in {currentConfig.label || currentKey}.</span>
              {isAnyFilterActive && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold underline"
                >
                  Reset Active Filters
                </button>
              )}
            </div>
          ) : filteredItems.length > 50 ? (
            <VirtualizedList
              items={filteredItems}
              itemHeight={44}
              resetScrollDeps={[searchTerm, sortField, sortAsc, currentKey, visibleColumns.join(',')]}
              getKey={(item, index) => item.id || item.name || index}
              containerClassName="h-full overflow-y-auto bg-slate-950"
              renderItem={(item) => (
                <CatalogVirtualRow
                  key={item.id || item.name}
                  item={item}
                  visibleColumns={visibleColumns}
                  handleOpenItem={handleOpenItem}
                  isAdmin={isAdmin}
                />
              )}
            />
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs text-slate-300 table-fixed">
                <tbody className="divide-y divide-slate-800/60">
                  {filteredItems.map(item => (
                    <CatalogTableRow
                      key={item.id || item.name}
                      item={item}
                      visibleColumns={visibleColumns}
                      handleOpenItem={handleOpenItem}
                      isAdmin={isAdmin}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
