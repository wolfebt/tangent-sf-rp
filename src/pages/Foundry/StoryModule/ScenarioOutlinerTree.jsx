/**
 * @file ScenarioOutlinerTree.jsx
 * @description Outliner tree hierarchy and modal components for ADE Scenario Workspace.
 * Handles drag-and-drop hierarchy reordering, relative reordering, expansion toggling,
 * element creation modals, and breadcrumb path resolution.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Layers, Box, Undo2, Redo2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getTypePillStyle, ELEMENT_TYPES } from '../ElementForge/elementSchemas';
import { useStory } from '../../../context/CampaignContext';
import { AudioService } from '../../../services/audioService';
import { getBreadcrumbPath } from '../../../utils/scenarioTreeEngine.js';

export { getBreadcrumbPath };

// ── OUTLINER TREE NODE ──
export const TreeNode = ({ 
  node, 
  activeId, 
  onSelect, 
  onDelete, 
  onMove, 
  onReorderRelative, 
  onAddChild, 
  onExport, 
  onExportMD, 
  onExportPDF, 
  depth = 0,
  filterQuery = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dropPosition, setDropPosition] = useState(null); // 'above' | 'inside' | 'below' | null
  const hasChildren = node.children && node.children.length > 0;
  
  // Filter matching
  const matchesSelf = !filterQuery || 
    (node.title || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (node.type || '').toLowerCase().includes(filterQuery.toLowerCase());

  const checkHasMatchingDescendants = (n) => {
    if (!filterQuery) return true;
    if ((n.title || '').toLowerCase().includes(filterQuery.toLowerCase())) return true;
    if ((n.type || '').toLowerCase().includes(filterQuery.toLowerCase())) return true;
    if (n.children && n.children.length > 0) {
      return n.children.some(checkHasMatchingDescendants);
    }
    return false;
  };

  const hasMatchingDescendants = checkHasMatchingDescendants(node);

  if (!matchesSelf && !hasMatchingDescendants) return null;

  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const ratio = offsetY / rect.height;

    if (ratio < 0.25) {
      setDropPosition('above');
    } else if (ratio > 0.75) {
      setDropPosition('below');
    } else {
      setDropPosition('inside');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropPosition(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = dropPosition;
    setDropPosition(null);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== node.id) {
      if (onReorderRelative && (pos === 'above' || pos === 'below')) {
        onReorderRelative(draggedId, node.id, pos);
      } else if (onMove) {
        onMove(draggedId, node.id);
      }
    }
  };

  return (
    <div className="flex flex-col min-w-max group select-none relative font-mono">
      <div 
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex items-center py-1.5 px-2 cursor-pointer transition-all justify-between rounded-lg relative my-0.5 ${
          dropPosition === 'inside'
            ? 'bg-cyan-950/90 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.5)]' 
            : activeId === node.id 
            ? 'bg-cyan-950/80 border-l-2 border-cyan-400 text-white font-semibold shadow-sm' 
            : 'hover:bg-slate-800/60 border-l-2 border-transparent text-slate-300'
        }`}
        style={{ paddingLeft: `${depth * 0.85 + 0.5}rem` }}
        onClick={() => onSelect(node.id)}
      >
        {/* Drop Indicators */}
        {dropPosition === 'above' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee] z-10" />
        )}
        {dropPosition === 'below' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee] z-10" />
        )}

        <div className="flex items-center gap-1.5 min-w-0 pr-2">
          <span 
            className={`w-3.5 text-center text-[11px] text-slate-400 shrink-0 ${hasChildren ? 'hover:text-cyan-300' : 'opacity-0'}`}
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          >
            {isExpanded ? '▼' : '▶'}
          </span>
          <span className="text-slate-600 hover:text-cyan-400 text-[10px] cursor-grab active:cursor-grabbing shrink-0" title="Drag to reorder">
            ⣿
          </span>
          <div className="flex flex-col min-w-0 items-start">
            <span className={`inline-block px-1.5 py-0.2 text-[8px] font-extrabold uppercase tracking-wider rounded border leading-tight mb-0.5 shadow-sm ${getTypePillStyle(node.type)}`}>
              {node.type || 'Element'}
            </span>
            <span className="text-xs font-medium whitespace-nowrap truncate max-w-[170px] text-slate-200">
              {node.title || 'Untitled'}
            </span>
          </div>
        </div>

        {/* Tree Node Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
          {onAddChild && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              title="Add Sub-Element"
              className="p-1 text-[10px] bg-cyan-950/80 hover:bg-cyan-800 border border-cyan-500/50 text-cyan-300 rounded leading-none transition-colors"
            >
              +
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id, node.title);
              }}
              title="Delete this element"
              className="p-1 text-[10px] bg-red-950/80 hover:bg-red-800 border border-red-500/60 text-red-300 rounded leading-none transition-colors"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col">
          {node.children.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              activeId={activeId} 
              onSelect={onSelect} 
              onDelete={onDelete} 
              onMove={onMove} 
              onReorderRelative={onReorderRelative} 
              onAddChild={onAddChild} 
              onExport={onExport} 
              onExportMD={onExportMD} 
              onExportPDF={onExportPDF} 
              depth={depth + 1} 
              filterQuery={filterQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── ADD ELEMENT MODAL ──
export const AddElementModal = ({ isOpen, onClose, onAdd, defaultParentId, onImport }) => {
  const { elementsCatalog } = useStory();
  const [type, setType] = useState('Story Arc');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSavedId, setSelectedSavedId] = useState('');
  const [customFields, setCustomFields] = useState([{ id: uuidv4(), label: '', value: '' }]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSelectSaved = (val) => {
    setSelectedSavedId(val);
    if (!val) {
      setTitle('');
      setContent('');
      return;
    }

    const savedElem = elementsCatalog?.find(item => item.id === val);
    if (savedElem) {
      setType(savedElem.type || 'Custom');
      setTitle(savedElem.title || '');
      setContent(savedElem.content || '');
      if (Array.isArray(savedElem.customFields) && savedElem.customFields.length > 0) {
        setCustomFields(savedElem.customFields);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validCustomFields = customFields
      .filter(f => f.label.trim() !== '')
      .map(f => ({ id: f.id || uuidv4(), label: f.label.trim(), value: f.value }));

    let baseFields = {};
    let imageUrl = '';
    if (selectedSavedId) {
      const savedElem = elementsCatalog?.find(item => item.id === selectedSavedId);
      if (savedElem) {
        baseFields = { ...(savedElem.fields || {}) };
        imageUrl = savedElem.imageUrl || '';
      }
    }

    onAdd({ 
      type, 
      title, 
      content,
      imageUrl,
      fields: baseFields,
      parentId: defaultParentId || null,
      customFields: validCustomFields
    });
    setTitle('');
    setContent('');
    setSelectedSavedId('');
    setCustomFields([{ id: uuidv4(), label: '', value: '' }]);
    setType('Story Arc');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto font-mono">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <Plus size={15} className="text-cyan-400" />
            Add Story Element
          </h3>
          {onImport && (
            <div>
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => { onImport(e, defaultParentId); onClose(); }}
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Import Element JSON"
                className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-bold rounded-lg uppercase transition-colors flex items-center gap-1 cursor-pointer"
              >
                📥 Import JSON
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Element Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-cyan-400 font-mono font-bold cursor-pointer"
            >
              {[...ELEMENT_TYPES].sort((a, b) => a.localeCompare(b)).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Element Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Infiltration of Sub-Level 4..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
            >
              Create Element
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── ZONE 1: DUAL-MODE OUTLINER RAIL (Left Column: Scenarios & World Elements) ──
export const ScenarioOutlinerRail = ({
  isTreeExpanded,
  outlinerTab,
  setOutlinerTab,
  elementsCatalog = [],
  activeScenarioId,
  setActiveScenarioId,
  handleOpenAddModal,
  setEditingModalElement,
  setIsEditElementModalOpen,
  outlinerElementTypeFilter,
  setOutlinerElementTypeFilter,
  searchFilter,
  setSearchFilter,
  scenarios = [],
  handleDeleteElement,
  moveStory,
  reorderRelativeScenario,
  filteredOutlinerElements = [],
  activeNode,
  handleInsertMention,
  handleToggleLinkElement,
  onSwitchView
}) => {
  const { undoScenarioTree, redoScenarioTree } = useStory();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redoScenarioTree?.();
        } else {
          e.preventDefault();
          undoScenarioTree?.();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoScenarioTree?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoScenarioTree, redoScenarioTree]);

  if (!isTreeExpanded) return null;

  return (
    <div className="h-full flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 z-10 shrink-0 w-64 xl:w-72">
      {/* Outliner Dual-Tab Header */}
      <div className="p-2 border-b border-slate-800 flex justify-between items-center bg-slate-950/90 shrink-0 gap-1 font-mono">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setOutlinerTab('scenarios');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              outlinerTab === 'scenarios'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Story Outliner: Acts, chapters, scenes, and narrative hierarchy"
          >
            <Layers size={11} />
            <span>Scenarios</span>
          </button>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setOutlinerTab('elements');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              outlinerTab === 'elements'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="World Elements: Personas, factions, items, locations, tech, and lore"
          >
            <Box size={11} />
            <span>Elements</span>
            <span className="text-[8px] px-1 py-0.1 rounded-full bg-slate-950/60 text-emerald-300 font-mono">
              {elementsCatalog?.length || 0}
            </span>
          </button>
        </div>

        {outlinerTab === 'scenarios' ? (
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={() => undoScenarioTree?.()}
              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Undo Scenario Hierarchy (Ctrl+Z)"
            >
              <Undo2 size={12} />
            </button>
            <button 
              type="button"
              onClick={() => redoScenarioTree?.()}
              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Redo Scenario Hierarchy (Ctrl+Y)"
            >
              <Redo2 size={12} />
            </button>
            <button 
              type="button"
              onClick={() => handleOpenAddModal(activeScenarioId)}
              className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold rounded-lg uppercase transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Add Root or Sub-Scenario Node"
            >
              <Plus size={11} />
              <span>Add</span>
            </button>
          </div>
        ) : (
          <button 
            type="button"
            onClick={() => {
              setEditingModalElement({
                id: uuidv4(),
                type: outlinerElementTypeFilter !== 'All' ? outlinerElementTypeFilter : 'Persona',
                title: 'New World Element',
                fields: {},
                content: ''
              });
              setIsEditElementModalOpen(true);
            }}
            className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold rounded-lg uppercase transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            title="Create New World Element"
          >
            <Plus size={11} />
            <span>New</span>
          </button>
        )}
      </div>

      {/* Filter Input & Element Type Pills */}
      <div className="px-2 py-1.5 border-b border-slate-800 bg-slate-950/40 shrink-0 space-y-1.5 font-mono">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
          <Search size={12} className="text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={outlinerTab === 'scenarios' ? "Filter scenarios..." : "Filter elements..."}
            className="bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none w-full font-mono"
          />
          {searchFilter && (
            <button onClick={() => setSearchFilter('')} className="text-slate-500 hover:text-slate-300 text-[10px] cursor-pointer">
              ✕
            </button>
          )}
        </div>

        {outlinerTab === 'elements' && (
          <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
            {['All', 'Persona', 'Faction', 'Location', 'Item', 'Lore', 'Clue', 'Tech', 'Species'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setOutlinerElementTypeFilter(t)}
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                  outlinerElementTypeFilter === t
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Outliner Body */}
      {outlinerTab === 'scenarios' ? (
        /* Scenario Tree Feed */
        <div className="flex-1 overflow-auto py-2 px-1.5 scrollbar-thin">
          {(!scenarios || scenarios.length === 0) ? (
            <div className="text-slate-500 text-xs text-center italic mt-10 p-4 font-mono">
              No scenarios yet.<br/>Click "+ Add" to begin your campaign outline.
            </div>
          ) : (
            <>
              {scenarios.map(node => (
                <TreeNode 
                  key={node.id} 
                  node={node} 
                  activeId={activeScenarioId} 
                  onSelect={setActiveScenarioId} 
                  onDelete={handleDeleteElement}
                  onMove={moveStory}
                  onReorderRelative={reorderRelativeScenario}
                  onAddChild={handleOpenAddModal}
                  filterQuery={searchFilter}
                />
              ))}

              {/* Drop to Root Area */}
              <div 
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={(e) => {
                  e.preventDefault();
                  const draggedId = e.dataTransfer.getData('text/plain');
                  if (draggedId) moveStory(draggedId, null);
                }}
                className="mt-6 p-2.5 border border-dashed border-slate-800/80 hover:border-cyan-500/60 rounded-xl text-center text-[10px] text-slate-500 uppercase tracking-wider hover:text-cyan-400 transition-colors font-mono"
              >
                📥 Drop here to move to Root
              </div>
            </>
          )}
        </div>
      ) : (
        /* World Elements Feed */
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin flex flex-col font-mono">
          {(!filteredOutlinerElements || filteredOutlinerElements.length === 0) ? (
            <div className="text-slate-500 text-xs text-center italic mt-10 p-4">
              No world elements found.<br/>Click "+ New" to forge one.
            </div>
          ) : (
            filteredOutlinerElements.map(elem => {
              const isLinked = (activeNode?.linkedElements || []).includes(elem.id);

              return (
                <div
                  key={elem.id}
                  className={`p-2 rounded-xl border transition-all space-y-1 group ${
                    isLinked 
                      ? 'bg-cyan-950/40 border-cyan-500/50' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border shrink-0 ${getTypePillStyle(elem.type)}`}>
                      {elem.type || 'Custom'}
                    </span>
                    <span 
                      className="text-xs font-bold text-slate-200 truncate flex-1 ml-1 cursor-pointer hover:text-cyan-300"
                      title="Click to edit element details"
                      onClick={() => {
                        setEditingModalElement(elem);
                        setIsEditElementModalOpen(true);
                      }}
                    >
                      {elem.title || 'Untitled'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModalElement(elem);
                        setIsEditElementModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-[9px] text-slate-400 hover:text-cyan-300 transition-opacity cursor-pointer shrink-0"
                      title="Edit Element"
                    >
                      ✏️
                    </button>
                  </div>

                  {elem.content && (
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                      {elem.content.replace(/<[^>]+>/g, '')}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-850 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleInsertMention(elem)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer text-[9px]"
                      title="Insert @Mention chip into active scenario prose"
                    >
                      @Mention
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleLinkElement(elem.id)}
                      className={`font-bold transition-colors cursor-pointer text-[9px] ${
                        isLinked ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-white'
                      }`}
                      title={isLinked ? 'Unlink from active scenario node' : 'Link to active scenario node'}
                    >
                      {isLinked ? '✓ Linked' : '+ Link'}
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Bottom Open Full Forge Launcher */}
          {onSwitchView && (
            <div className="mt-auto pt-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  onSwitchView('elements');
                }}
                className="w-full py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 hover:text-white text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                title="Open full Element Forge database studio workspace"
              >
                <Box size={12} />
                <span>Open Full Element Forge ↗</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
