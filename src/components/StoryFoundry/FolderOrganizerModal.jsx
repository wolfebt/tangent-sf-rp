/**
 * @file FolderOrganizerModal.jsx
 * @description Modal dialog allowing users to create, edit, delete custom folders,
 * assign personas and story projects to folders, and manage custom manual sorting order.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Check, 
  BookOpen, 
  User, 
  Layers, 
  Sliders, 
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { 
  getFolders, 
  createFolder, 
  updateFolder, 
  deleteFolder, 
  getItemFolderAssignments, 
  assignItemToFolder, 
  moveItemInFolder, 
  sortContentItems,
  FOLDER_COLORS, 
  FOLDERS_UPDATE_EVENT 
} from '../../services/customFolderService';
import { AudioService } from '../../services/audioService';

export const FolderOrganizerModal = ({
  isOpen,
  onClose,
  stories = [],
  personas = [],
  initialFolderId = null
}) => {
  const [folders, setFolders] = useState(() => getFolders());
  const [assignments, setAssignments] = useState(() => getItemFolderAssignments());
  const [selectedFolderId, setSelectedFolderId] = useState(initialFolderId || 'all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all'); // 'all' | 'stories' | 'personas'
  const [searchQuery, setSearchQuery] = useState('');

  // Folder creation / edit state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [folderColorInput, setFolderColorInput] = useState('#22d3ee');
  const [folderTypeInput, setFolderTypeInput] = useState('all');

  // Reload folders and assignments when window event triggers
  useEffect(() => {
    const handleUpdate = () => {
      setFolders(getFolders());
      setAssignments(getItemFolderAssignments());
    };
    window.addEventListener(FOLDERS_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(FOLDERS_UPDATE_EVENT, handleUpdate);
  }, []);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    AudioService.playTerminalBeep(900, 0.02);
    setFolderNameInput('');
    setFolderColorInput('#22d3ee');
    setFolderTypeInput('all');
    setEditingFolderId(null);
    setIsCreatingFolder(true);
  };

  const handleStartEdit = (f, e) => {
    e?.stopPropagation();
    AudioService.playTerminalBeep(900, 0.02);
    setEditingFolderId(f.id);
    setFolderNameInput(f.name);
    setFolderColorInput(f.color || '#22d3ee');
    setFolderTypeInput(f.targetType || 'all');
    setIsCreatingFolder(false);
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (!folderNameInput.trim()) return;

    if (editingFolderId) {
      updateFolder(editingFolderId, {
        name: folderNameInput.trim(),
        color: folderColorInput,
        targetType: folderTypeInput
      });
      setEditingFolderId(null);
    } else {
      const created = createFolder(folderNameInput.trim(), folderTypeInput, folderColorInput);
      setSelectedFolderId(created.id);
      setIsCreatingFolder(false);
    }
    AudioService.playTerminalBeep(1200, 0.03);
    setFolders(getFolders());
    setAssignments(getItemFolderAssignments());
  };

  const handleDeleteFolder = (folderId, e) => {
    e?.stopPropagation();
    if (window.confirm('Delete this folder? All contained personas and stories will remain safe in Unfiled.')) {
      AudioService.playTerminalBeep(700, 0.03);
      deleteFolder(folderId);
      if (selectedFolderId === folderId) {
        setSelectedFolderId('all');
      }
      setFolders(getFolders());
      setAssignments(getItemFolderAssignments());
    }
  };

  // Compile unified items with assigned folder
  const allItems = useMemo(() => {
    const storyItems = (stories || []).map(s => ({
      raw: s,
      id: s.id,
      title: s.projectName || 'Untitled Story',
      subtitle: `${s.scenarios?.length || 0} scenarios • ${s.maps?.length || 0} maps`,
      type: 'story',
      folderId: assignments[s.id] || null,
      updatedAt: s.updatedAt
    }));

    const personaItems = (personas || []).map(p => ({
      raw: p,
      id: p['character-doc-id'] || p.id,
      title: p['char-name'] || 'Unnamed Operative',
      subtitle: `${p['char-species'] || 'Species'} • ${p['char-archetype'] || p['char-occu'] || 'Operative'}`,
      type: 'persona',
      folderId: assignments[p['character-doc-id'] || p.id] || null,
      updatedAt: p.updatedAt
    }));

    let combined = [];
    if (contentTypeFilter === 'all') combined = [...storyItems, ...personaItems];
    else if (contentTypeFilter === 'stories') combined = storyItems;
    else if (contentTypeFilter === 'personas') combined = personaItems;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      combined = combined.filter(i => 
        i.title.toLowerCase().includes(q) || 
        (i.subtitle && i.subtitle.toLowerCase().includes(q))
      );
    }

    return combined;
  }, [stories, personas, assignments, contentTypeFilter, searchQuery]);

  // Filter items based on selected folder
  const filteredItems = useMemo(() => {
    let items;
    if (selectedFolderId === 'all') {
      items = allItems;
    } else if (selectedFolderId === 'unfiled') {
      items = allItems.filter(i => !i.folderId);
    } else {
      items = allItems.filter(i => i.folderId === selectedFolderId);
    }

    // Apply custom manual sorting for this view
    return sortContentItems(items, 'custom', selectedFolderId, 'id');
  }, [allItems, selectedFolderId]);

  const handleMove = (itemId, direction) => {
    AudioService.playTerminalBeep(1100, 0.02);
    moveItemInFolder(selectedFolderId, itemId, direction, filteredItems);
    setAssignments(getItemFolderAssignments());
  };

  const handleAssignFolder = (itemId, newFolderId) => {
    AudioService.playTerminalBeep(1000, 0.02);
    assignItemToFolder(itemId, newFolderId);
    setAssignments(getItemFolderAssignments());
  };

  // Folder item count helper
  const getFolderItemCount = (fId) => {
    if (fId === 'all') return (stories.length + personas.length);
    if (fId === 'unfiled') {
      return (stories.filter(s => !assignments[s.id]).length + 
              personas.filter(p => !assignments[p['character-doc-id'] || p.id]).length);
    }
    return (stories.filter(s => assignments[s.id] === fId).length + 
            personas.filter(p => assignments[p['character-doc-id'] || p.id] === fId).length);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden select-none font-sans">
      <div className="bg-[#0f141c] border border-cyan-500/40 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0a0d14] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <FolderOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100 tracking-wide uppercase font-mono">
                  Content Organizer & Custom Folders
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 font-bold">
                  {folders.length} FOLDERS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Organize Personas & Stories into custom lists with custom manual ordering
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2-Column Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: Folders List & Creation */}
          <aside className="w-full md:w-72 bg-[#0c1017] border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800/60 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Folders & Lists
              </span>
              <button
                onClick={handleStartCreate}
                className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-lg text-xs font-bold font-mono uppercase flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] cursor-pointer"
              >
                <FolderPlus size={13} /> + New Folder
              </button>
            </div>

            {/* Folder Editor / Creator Form */}
            {(isCreatingFolder || editingFolderId) && (
              <form onSubmit={handleSaveSubmit} className="p-3 bg-slate-900/90 border-b border-cyan-500/30 space-y-2.5 animate-fade-in">
                <div className="text-[11px] font-bold text-cyan-300 uppercase font-mono flex items-center justify-between">
                  <span>{editingFolderId ? 'Edit Folder' : 'Create New Folder'}</span>
                  <button 
                    type="button" 
                    onClick={() => { setIsCreatingFolder(false); setEditingFolderId(null); }}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Folder Name (e.g. Sector Campaign)"
                  value={folderNameInput}
                  onChange={(e) => setFolderNameInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  autoFocus
                />

                {/* Color Palette Selection */}
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
                    Color Accent
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {FOLDER_COLORS.map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setFolderColorInput(c.hex)}
                        className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                          folderColorInput === c.hex ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {editingFolderId ? 'Update Folder' : 'Create Folder'}
                  </button>
                </div>
              </form>
            )}

            {/* Folders List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {/* Virtual "All Items" Filter */}
              <button
                onClick={() => {
                  AudioService.playTerminalBeep(850, 0.02);
                  setSelectedFolderId('all');
                }}
                className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                  selectedFolderId === 'all'
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Layers size={14} className="text-cyan-400 shrink-0" />
                  <span className="truncate">All Content</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-400">
                  {getFolderItemCount('all')}
                </span>
              </button>

              {/* Virtual "Unfiled" Filter */}
              <button
                onClick={() => {
                  AudioService.playTerminalBeep(850, 0.02);
                  setSelectedFolderId('unfiled');
                }}
                className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                  selectedFolderId === 'unfiled'
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'text-slate-400 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder size={14} className="text-amber-400/80 shrink-0" />
                  <span className="truncate">Unfiled / Root</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-400">
                  {getFolderItemCount('unfiled')}
                </span>
              </button>

              <div className="pt-2 pb-1 px-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-t border-slate-800/60 my-1">
                Custom Lists ({folders.length})
              </div>

              {folders.length === 0 ? (
                <div className="py-6 px-3 text-center text-slate-500 text-xs">
                  No custom folders yet. Click <strong className="text-cyan-400">+ New Folder</strong> above to create your first organized list.
                </div>
              ) : (
                folders.map(f => {
                  const isSelected = selectedFolderId === f.id;
                  const count = getFolderItemCount(f.id);

                  return (
                    <div
                      key={f.id}
                      onClick={() => {
                        AudioService.playTerminalBeep(850, 0.02);
                        setSelectedFolderId(f.id);
                      }}
                      className={`group w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 text-white border shadow-md'
                          : 'text-slate-300 hover:bg-slate-800/40 border border-transparent'
                      }`}
                      style={{
                        borderColor: isSelected ? (f.color || '#22d3ee') : 'transparent',
                        boxShadow: isSelected ? `0 0 12px ${f.color}33` : 'none'
                      }}
                    >
                      <div className="flex items-center gap-2.5 truncate min-w-0">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: f.color || '#22d3ee' }}
                        />
                        <span className="truncate font-medium">{f.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-400">
                          {count}
                        </span>
                        
                        <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity ml-1">
                          <button
                            onClick={(e) => handleStartEdit(f, e)}
                            className="p-1 hover:text-cyan-300 text-slate-400 transition-colors"
                            title="Rename / Edit color"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteFolder(f.id, e)}
                            className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                            title="Delete folder"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Column: Items in Folder with Custom Sorting & Folder Assignment */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
            
            {/* Top Toolbar inside folder view */}
            <div className="p-3 bg-[#0a0d14] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {selectedFolderId === 'all' && 'All Content Items'}
                  {selectedFolderId === 'unfiled' && 'Unfiled Content (No Folder Assigned)'}
                  {selectedFolderId !== 'all' && selectedFolderId !== 'unfiled' && (
                    <span className="flex items-center gap-1.5">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: folders.find(f => f.id === selectedFolderId)?.color || '#22d3ee' }} 
                      />
                      {folders.find(f => f.id === selectedFolderId)?.name || 'Custom Folder'}
                    </span>
                  )}
                </span>
                <span className="text-slate-500 font-mono">•</span>
                <span className="text-xs text-cyan-400 font-mono">
                  {filteredItems.length} items
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Content Type Filter */}
                <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-mono">
                  <button
                    onClick={() => setContentTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                      contentTypeFilter === 'all' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setContentTypeFilter('stories')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors flex items-center gap-1 ${
                      contentTypeFilter === 'stories' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen size={11} /> Stories
                  </button>
                  <button
                    onClick={() => setContentTypeFilter('personas')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors flex items-center gap-1 ${
                      contentTypeFilter === 'personas' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <User size={11} /> Personas
                  </button>
                </div>

                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Filter items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-36 sm:w-48"
                />
              </div>
            </div>

            {/* Instruction Banner for Custom Manual Order */}
            <div className="px-4 py-1.5 bg-cyan-950/20 border-b border-cyan-500/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Sliders size={12} className="text-cyan-400" />
                <span>Use the <strong className="text-cyan-300">▲ ▼ arrows</strong> to custom sort items inside this folder.</span>
              </span>
              <span className="text-slate-500 text-[10px]">Order persists automatically</span>
            </div>

            {/* Content Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
              {filteredItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500 border-2 border-dashed border-slate-800/80 rounded-xl">
                  <Layers size={36} className="text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-400">No items found in this folder</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">
                    {searchQuery 
                      ? 'No items match your search filter.' 
                      : 'Assign stories and personas to this folder using the folder dropdown on any item.'}
                  </p>
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const assignedFolder = folders.find(f => f.id === item.folderId);

                  return (
                    <div
                      key={item.id}
                      className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3 flex items-center justify-between gap-3 transition-all shadow-sm"
                    >
                      {/* Left: Reorder Controls + Type Badge + Title */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Custom Reorder Buttons */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            onClick={() => handleMove(item.id, 'up')}
                            disabled={index === 0}
                            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                              index === 0 ? 'opacity-20 cursor-not-allowed text-slate-600' : 'text-slate-400 hover:text-cyan-300 cursor-pointer'
                            }`}
                            title="Move Up in Custom Order"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => handleMove(item.id, 'down')}
                            disabled={index === filteredItems.length - 1}
                            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                              index === filteredItems.length - 1 ? 'opacity-20 cursor-not-allowed text-slate-600' : 'text-slate-400 hover:text-cyan-300 cursor-pointer'
                            }`}
                            title="Move Down in Custom Order"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        {/* Type Icon Badge */}
                        <div 
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            item.type === 'story'
                              ? 'bg-purple-950/70 border-purple-500/40 text-purple-300'
                              : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                          }`}
                        >
                          {item.type === 'story' ? <BookOpen size={14} /> : <User size={14} />}
                        </div>

                        {/* Title & Subtitle */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                              {item.title}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-slate-400 uppercase">
                              {item.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      {/* Right: Folder Assignment Selector */}
                      <div className="flex items-center gap-3 shrink-0">
                        {assignedFolder && (
                          <div 
                            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border"
                            style={{
                              borderColor: `${assignedFolder.color}66`,
                              backgroundColor: `${assignedFolder.color}15`,
                              color: assignedFolder.color
                            }}
                          >
                            <span 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ backgroundColor: assignedFolder.color }} 
                            />
                            <span className="truncate max-w-[100px]">{assignedFolder.name}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 font-mono hidden md:inline">Folder:</span>
                          <select
                            value={item.folderId || ''}
                            onChange={(e) => handleAssignFolder(item.id, e.target.value || null)}
                            className="bg-slate-950 border border-slate-700 text-[11px] font-mono text-cyan-300 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer max-w-[140px] truncate"
                          >
                            <option value="">(Unfiled)</option>
                            {folders.map(f => (
                              <option key={f.id} value={f.id}>
                                📁 {f.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0a0d14] border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            Custom sorting and folder assignments are preserved across sessions
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default FolderOrganizerModal;
