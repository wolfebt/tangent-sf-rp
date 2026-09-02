import React, { useState, useMemo } from 'react';
import { categoryConfig, DEVELOPMENT_FIELDS_GROUPS, DEVELOPMENT_FIELDS_REGISTRY } from './categoryConfig';
import { DBMItemModal } from './DBMItemModal';
import { confirmTypedDeletion } from '../../utils/confirmationUtils';

export const ArchitectDevFieldsModal = ({
  isOpen,
  onClose,
  dbData = {},
  saveEntry,
  deleteEntry,
  currentUser,
  isAdmin
}) => {
  const [selectedFieldKey, setSelectedFieldKey] = useState(null);
  const [searchFieldTerm, setSearchFieldTerm] = useState('');
  const [searchEntryTerm, setSearchEntryTerm] = useState('');
  const [activeGroupFilter, setActiveGroupFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'alphabetical'

  // Entry Modal States
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Reset inner navigation when modal closes or opens
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFieldKey(null);
      setSearchFieldTerm('');
      setSearchEntryTerm('');
      setSelectedEntry(null);
      setIsEntryModalOpen(false);
    }
  }, [isOpen]);

  // Active Field Config
  const activeFieldRegistry = useMemo(() => {
    if (!selectedFieldKey) return null;
    return DEVELOPMENT_FIELDS_REGISTRY.find(f => f.key === selectedFieldKey) || {
      key: selectedFieldKey,
      label: categoryConfig[selectedFieldKey]?.label || selectedFieldKey.toUpperCase(),
      icon: '📁',
      desc: 'Development reference table'
    };
  }, [selectedFieldKey]);

  const activeFieldConfig = useMemo(() => {
    if (!selectedFieldKey) return null;
    return categoryConfig[selectedFieldKey] || {
      label: activeFieldRegistry?.label || selectedFieldKey.toUpperCase(),
      fields: {
        name: { type: 'text', required: true },
        description: { type: 'textarea' }
      }
    };
  }, [selectedFieldKey, activeFieldRegistry]);

  // Entries for the active selected field
  const activeFieldEntries = useMemo(() => {
    if (!selectedFieldKey) return [];
    return dbData[selectedFieldKey] || [];
  }, [selectedFieldKey, dbData]);

  // Filtered Entries inside active field
  const filteredEntries = useMemo(() => {
    if (!searchEntryTerm.trim()) return activeFieldEntries;
    const term = searchEntryTerm.toLowerCase().trim();
    return activeFieldEntries.filter(item => {
      const name = String(item.name || item.title || '').toLowerCase();
      const desc = String(item.description || item.mechanic || '').toLowerCase();
      const aspect = String(item.aspect || item.type || item.category || '').toLowerCase();
      const note = String(item.note || '').toLowerCase();
      return name.includes(term) || desc.includes(term) || aspect.includes(term) || note.includes(term);
    });
  }, [activeFieldEntries, searchEntryTerm]);

  // Filtered Field Registry list for Fields Overview
  const filteredFields = useMemo(() => {
    return DEVELOPMENT_FIELDS_REGISTRY.filter(field => {
      // Group filter
      if (activeGroupFilter !== 'all' && field.group !== activeGroupFilter) {
        return false;
      }
      // Search term filter
      if (searchFieldTerm.trim()) {
        const term = searchFieldTerm.toLowerCase().trim();
        const matchesName = field.label.toLowerCase().includes(term);
        const matchesKey = field.key.toLowerCase().includes(term);
        const matchesDesc = field.desc.toLowerCase().includes(term);
        if (!matchesName && !matchesKey && !matchesDesc) return false;
      }
      return true;
    });
  }, [searchFieldTerm, activeGroupFilter]);

  // Handle Opening an Entry for Edit / View
  const handleOpenEntry = (entry, edit = true) => {
    setSelectedEntry(entry);
    setEditFormData(entry ? { ...entry } : { name: '', description: '' });
    setIsEditMode(isAdmin ? edit : false);
    setIsEntryModalOpen(true);
  };

  // Handle Creating a New Entry in the active field
  const handleCreateNewEntry = async () => {
    if (!isAdmin) {
      alert('Administrator or Architect privileges are required to create development entries.');
      return;
    }

    const fieldLabel = activeFieldRegistry?.label || activeFieldConfig?.label || 'Entry';
    const newName = window.prompt(`Enter a name for the new ${fieldLabel}:`, '');
    if (!newName || !newName.trim()) return;

    const initialData = { name: newName.trim(), description: '' };
    if (activeFieldConfig?.fields) {
      Object.keys(activeFieldConfig.fields).forEach(fKey => {
        const fDef = activeFieldConfig.fields[fKey];
        if (fDef.default !== undefined) {
          initialData[fKey] = fDef.default;
        } else if (fDef.type === 'number') {
          initialData[fKey] = 0;
        } else if (fDef.type === 'boolean') {
          initialData[fKey] = false;
        } else if (fDef.type === 'multiselect' || fDef.type === 'json_list') {
          initialData[fKey] = [];
        }
      });
    }

    const docId = `entry_${Date.now()}`;
    const payload = {
      ...initialData,
      name: newName.trim(),
      id: docId,
      updatedAt: new Date().toISOString()
    };

    if (saveEntry) {
      const success = await saveEntry(payload, selectedFieldKey);
      if (success) {
        setSelectedEntry(payload);
        setEditFormData(payload);
        setIsEditMode(true);
        setIsEntryModalOpen(true);
      } else {
        alert('Failed to create new entry.');
      }
    }
  };

  // Handle Saving Entry from DBMItemModal
  const handleSaveItemModal = async (closeOnSuccess = false) => {
    if (!currentUser) {
      alert('You must be logged in to save entries.');
      return;
    }
    if (!isAdmin) {
      alert('Administrator or Architect privileges are required to save development entries.');
      return;
    }
    if (!editFormData.name || !editFormData.name.trim()) {
      alert('Entry name is required!');
      return;
    }
    const docId = selectedEntry?.id || editFormData.id || `entry_${Date.now()}`;
    const payload = {
      ...editFormData,
      name: editFormData.name.trim(),
      id: docId,
      updatedAt: new Date().toISOString()
    };

    if (saveEntry) {
      const success = await saveEntry(payload, selectedFieldKey);
      if (success) {
        if (closeOnSuccess) {
          setIsEntryModalOpen(false);
        }
      } else {
        alert('Save failed. Check browser console.');
      }
    }
  };

  // Handle Deleting Entry
  const handleDeleteEntry = async (itemToDelete = selectedEntry) => {
    const target = itemToDelete || selectedEntry;
    if (!target) return;
    if (!isAdmin) {
      alert('Administrator or Architect privileges are required to delete development entries.');
      return;
    }
    const entryName = target.name || target.title || 'this entry';
    const fieldLabel = activeFieldRegistry?.label || activeFieldConfig?.label || 'development entry';
    if (!confirmTypedDeletion(entryName, fieldLabel)) return;

    setIsEntryModalOpen(false);
    setSelectedEntry(null);

    if (deleteEntry) {
      const success = await deleteEntry(target.id, selectedFieldKey);
      if (!success) {
        alert('Delete failed. Check console for details.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#090d16] border border-amber-500/40 rounded-2xl w-full max-w-6xl max-h-[88vh] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="bg-[#0e1422] px-6 py-4 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-lg text-amber-300 shadow-sm">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-extrabold text-amber-300 tracking-wider uppercase flex items-center gap-2">
                  <span>Architect Development Fields</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-purple-950/90 text-purple-200 border border-purple-500/40">
                    DEV MODE
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                {selectedFieldKey ? (
                  <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
                    <button
                      type="button"
                      onClick={() => setSelectedFieldKey(null)}
                      className="hover:underline text-slate-400 hover:text-white"
                    >
                      Fields Registry
                    </button>
                    <span>/</span>
                    <span className="text-amber-300 font-bold">{activeFieldRegistry?.label}</span>
                  </span>
                ) : (
                  "Master relational schemas, auxiliary lookup tables, and user-entered field taxonomies."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedFieldKey && (
              <button
                type="button"
                onClick={() => setSelectedFieldKey(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-bold text-slate-200 uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>◄</span>
                <span>All Fields</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              title="Close Modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* MODAL MAIN BODY */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0a0f1d]/90 p-4 sm:p-6">
          
          {/* ========================================================================= */}
          {/* VIEW 1: FIELDS OVERVIEW (BROWSE & SEARCH ALL 36 DEVELOPMENT FIELDS) */}
          {/* ========================================================================= */}
          {!selectedFieldKey ? (
            <div className="flex-1 flex flex-col min-h-0 gap-4">
              
              {/* Controls Bar: Search, Group Filters & Sorting Toggle */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111827]/80 p-3 rounded-xl border border-slate-800">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
                  <input
                    type="text"
                    value={searchFieldTerm}
                    onChange={(e) => setSearchFieldTerm(e.target.value)}
                    placeholder="Search development fields (e.g. traits, materials, modifiers)..."
                    className="w-full pl-8 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  {searchFieldTerm && (
                    <button
                      onClick={() => setSearchFieldTerm('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* View Mode Toggle & Total Count */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setViewMode('grouped')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                        viewMode === 'grouped'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🗂️ Grouped
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('alphabetical')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                        viewMode === 'alphabetical'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🔤 A-Z (Alphabetical)
                    </button>
                  </div>

                  <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-slate-900 border border-slate-800 rounded-md">
                    {filteredFields.length} / {DEVELOPMENT_FIELDS_REGISTRY.length} Fields
                  </span>
                </div>
              </div>

              {/* Group Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveGroupFilter('all')}
                  className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all shrink-0 ${
                    activeGroupFilter === 'all'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  🌐 All Groups ({DEVELOPMENT_FIELDS_REGISTRY.length})
                </button>
                {DEVELOPMENT_FIELDS_GROUPS.map(group => {
                  const count = DEVELOPMENT_FIELDS_REGISTRY.filter(f => f.group === group.id).length;
                  const isActive = activeGroupFilter === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setActiveGroupFilter(group.id)}
                      className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{group.icon}</span>
                      <span>{group.label}</span>
                      <span className="text-[10px] opacity-75 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Fields List / Grid */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-6">
                {viewMode === 'grouped' && activeGroupFilter === 'all' ? (
                  /* GROUPED SECTIONS */
                  DEVELOPMENT_FIELDS_GROUPS.map(group => {
                    const groupFields = filteredFields.filter(f => f.group === group.id);
                    if (groupFields.length === 0) return null;

                    return (
                      <div key={group.id} className="space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{group.icon}</span>
                            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                              {group.label}
                            </h3>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {groupFields.length} fields
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {groupFields.map(field => {
                            const entryCount = dbData[field.key]?.length || 0;
                            return (
                              <div
                                key={field.key}
                                onClick={() => {
                                  setSelectedFieldKey(field.key);
                                  setSearchEntryTerm('');
                                }}
                                className="group bg-[#111624] hover:bg-[#161d30] border border-slate-800 hover:border-amber-500/50 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base group-hover:scale-110 transition-transform">
                                        {field.icon}
                                      </span>
                                      <h4 className="text-xs font-extrabold text-white group-hover:text-amber-300 uppercase tracking-wide transition-colors">
                                        {field.label}
                                      </h4>
                                    </div>
                                    <span
                                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                                        entryCount > 0
                                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                          : 'bg-slate-900 text-slate-500 border-slate-800'
                                      }`}
                                    >
                                      {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                                    {field.desc}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-bold text-amber-400/90 uppercase tracking-wider group-hover:text-amber-300">
                                  <span>Manage Entries</span>
                                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* ALPHABETICAL OR FILTERED FLAT GRID */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...filteredFields]
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map(field => {
                        const entryCount = dbData[field.key]?.length || 0;
                        const groupDef = DEVELOPMENT_FIELDS_GROUPS.find(g => g.id === field.group);
                        return (
                          <div
                            key={field.key}
                            onClick={() => {
                              setSelectedFieldKey(field.key);
                              setSearchEntryTerm('');
                            }}
                            className="group bg-[#111624] hover:bg-[#161d30] border border-slate-800 hover:border-amber-500/50 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-base group-hover:scale-110 transition-transform">
                                    {field.icon}
                                  </span>
                                  <h4 className="text-xs font-extrabold text-white group-hover:text-amber-300 uppercase tracking-wide transition-colors">
                                    {field.label}
                                  </h4>
                                </div>
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                                    entryCount > 0
                                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                      : 'bg-slate-900 text-slate-500 border-slate-800'
                                  }`}
                                >
                                  {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-2">
                                {field.desc}
                              </p>
                              {groupDef && (
                                <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800">
                                  {groupDef.label}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-bold text-amber-400/90 uppercase tracking-wider group-hover:text-amber-300">
                              <span>Manage Entries</span>
                              <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {filteredFields.length === 0 && (
                  <div className="text-center py-16 bg-[#111624]/60 border border-slate-800 rounded-xl">
                    <p className="text-slate-400 text-sm mb-2">No development fields match your search or filter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchFieldTerm('');
                        setActiveGroupFilter('all');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold uppercase transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW 2: ENTRIES LIST VIEW FOR SELECTED DEVELOPMENT FIELD */
            /* ========================================================================= */
            <div className="flex-1 flex flex-col min-h-0 gap-3">
              
              {/* Field Banner & Controls */}
              <div className="bg-[#111827] p-4 rounded-xl border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-500/50 flex items-center justify-center text-xl text-amber-300 shrink-0">
                    {activeFieldRegistry?.icon || '📁'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wide">
                        {activeFieldRegistry?.label}
                      </h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                        {activeFieldEntries.length} {activeFieldEntries.length === 1 ? 'Entry' : 'Entries'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeFieldRegistry?.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCreateNewEntry}
                    disabled={!isAdmin}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>+</span>
                    <span>Add New {activeFieldRegistry?.label?.replace(/s$/, '') || 'Entry'}</span>
                  </button>
                </div>
              </div>

              {/* Search Bar for Entries inside Field */}
              <div className="flex items-center justify-between gap-3 bg-[#111624] p-2.5 rounded-lg border border-slate-800 shrink-0">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-slate-500 text-xs">🔍</span>
                  <input
                    type="text"
                    value={searchEntryTerm}
                    onChange={(e) => setSearchEntryTerm(e.target.value)}
                    placeholder={`Search within ${activeFieldRegistry?.label || 'entries'}...`}
                    className="w-full pl-8 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  {searchEntryTerm && (
                    <button
                      onClick={() => setSearchEntryTerm('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className="text-xs font-mono text-slate-400 shrink-0 pr-1">
                  Showing {filteredEntries.length} of {activeFieldEntries.length}
                </span>
              </div>

              {/* Entries Grid / Table */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                {filteredEntries.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredEntries.map(entry => {
                      const entryName = entry.name || entry.title || 'Untitled Entry';
                      const entryDesc = entry.description || entry.mechanic || entry.note || '';
                      
                      return (
                        <div
                          key={entry.id}
                          className="bg-[#111624] hover:bg-[#161d30] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 transition-all shadow-sm group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-xs font-extrabold text-cyan-300 group-hover:text-cyan-200 uppercase tracking-wide">
                                {entryName}
                              </h4>
                              {entry.level !== undefined && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 shrink-0">
                                  Lvl {entry.level}
                                </span>
                              )}
                              {entry.cp !== undefined && entry.cp !== '' && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 shrink-0">
                                  {entry.cp} CP
                                </span>
                              )}
                              {entry.aspect && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 shrink-0">
                                  {entry.aspect}
                                </span>
                              )}
                            </div>

                            {entryDesc ? (
                              <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                                {entryDesc}
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-600 italic">No description provided</p>
                            )}

                            {/* Additional metadata pills */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.aspect_subtype && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                  {entry.aspect_subtype}
                                </span>
                              )}
                              {entry.type && typeof entry.type === 'string' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                  {entry.type}
                                </span>
                              )}
                              {entry.dc !== undefined && entry.dc !== 0 && entry.dc !== '' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950/70 text-red-300 border border-red-500/30">
                                  DC {entry.dc}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEntry(entry, true)}
                              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-[11px] font-bold uppercase transition-colors flex-1 text-center cursor-pointer"
                            >
                              ✏️ Manage / Edit
                            </button>

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(entry)}
                                className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded text-[11px] font-bold uppercase transition-colors shrink-0 cursor-pointer"
                                title="Delete Entry"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-[#111624]/60 border border-slate-800 rounded-xl flex flex-col items-center justify-center">
                    <p className="text-slate-400 text-sm mb-3">
                      {searchEntryTerm
                        ? `No entries match "${searchEntryTerm}".`
                        : `No entries recorded in ${activeFieldRegistry?.label || 'this field'} yet.`}
                    </p>
                    <button
                      type="button"
                      onClick={handleCreateNewEntry}
                      disabled={!isAdmin}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
                    >
                      + Create First Entry
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded DBMItemModal for deep entry management */}
      {selectedFieldKey && (
        <DBMItemModal
          isOpen={isEntryModalOpen}
          onClose={() => setIsEntryModalOpen(false)}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          selectedItem={selectedEntry}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          currentConfig={activeFieldConfig}
          currentKey={selectedFieldKey}
          onSave={handleSaveItemModal}
          onDelete={handleDeleteEntry}
          dbData={dbData}
          saveEntry={saveEntry}
          devMode={true}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default ArchitectDevFieldsModal;
