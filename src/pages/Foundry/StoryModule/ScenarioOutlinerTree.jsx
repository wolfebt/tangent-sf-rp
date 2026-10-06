/**
 * @file ScenarioOutlinerTree.jsx
 * @description Outliner tree hierarchy and modal components for ADE Scenario Workspace.
 * Handles drag-and-drop hierarchy reordering, relative reordering, expansion toggling,
 * element creation modals, and breadcrumb path resolution.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Layers, 
  Box, 
  Undo2, 
  Redo2, 
  Upload, 
  GripVertical, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  FolderTree, 
  List, 
  Link2, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getTypePillStyle, ELEMENT_TYPES } from '../ElementForge/elementSchemas';
import { useStory } from '../../../context/CampaignContext';
import { showToast } from '../../../context/ToastContext';
import { parseAimeAssetFile } from '../../../services/aimeAssetFileService';
import { batchIngestElementFiles } from '../../../services/elementIngestionService';
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
    e.dataTransfer.setData('tangent-scenario-id', node.id);
    e.dataTransfer.setData('application/x-tangent-scenario', JSON.stringify({
      id: node.id,
      title: node.title,
      type: node.type,
      content: node.content
    }));
    e.dataTransfer.effectAllowed = 'copyMove';
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
    const draggedId = e.dataTransfer.getData('tangent-scenario-id') || e.dataTransfer.getData('text/plain');
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

/// ── CANONICAL WIKI CATEGORIES ──
const WIKI_CATEGORIES = [
  { id: 'Persona', label: 'Personas & NPCs', icon: '👤', types: ['Persona'] },
  { id: 'Location', label: 'Locations & Worlds', icon: '🏰', types: ['Location', 'Setting', 'World'] },
  { id: 'Faction', label: 'Factions & Orgs', icon: '⚔️', types: ['Faction'] },
  { id: 'Item', label: 'Items & Artifacts', icon: '🔮', types: ['Item'] },
  { id: 'Lore', label: 'Lore & Philosophy', icon: '📜', types: ['Lore', 'Philosophy', 'Clue', 'Handout'] },
  { id: 'Tech', label: 'Technology & Cyber', icon: '🚀', types: ['Tech', 'Technology'] },
  { id: 'Species', label: 'Species & Xenology', icon: '🌿', types: ['Species'] },
  { id: 'Custom', label: 'Custom Elements', icon: '🧩', types: ['Custom', 'Scene', 'Encounter', 'Adventure', 'Story Arc'] }
];

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
  onSwitchView,
  updateSavedElement: propUpdateSavedElement,
  addStory: propAddStory
}) => {
  const { undoScenarioTree, redoScenarioTree, deleteSavedElement, updateSavedElement: contextUpdateSavedElement, addStory: contextAddStory } = useStory();
  const updateSavedElement = propUpdateSavedElement || contextUpdateSavedElement;
  const addStory = propAddStory || contextAddStory;

  const [elementsViewMode, setElementsViewMode] = useState(() => {
    try {
      return localStorage.getItem('tangent_ade_elements_view_mode') || 'wiki_tree';
    } catch (_) {
      return 'wiki_tree';
    }
  });

  const [expandedCategories, setExpandedCategories] = useState(() => ({
    Persona: true,
    Location: true,
    Faction: true,
    Item: true,
    Lore: true,
    Tech: true,
    Species: true,
    Custom: true
  }));

  const [previewElementId, setPreviewElementId] = useState(null);
  const [isDraggingFilesOverRail, setIsDraggingFilesOverRail] = useState(false);
  const fileInputRef = useRef(null);

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleViewModeChange = (mode) => {
    setElementsViewMode(mode);
    try {
      localStorage.setItem('tangent_ade_elements_view_mode', mode);
    } catch (_) {}
  };

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

  // File import processor for .aime, .json, .md files
  const processImportFiles = async (files) => {
    if (!files || files.length === 0) return;
    let elementCount = 0;
    let scenarioCount = 0;

    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const parsed = parseAimeAssetFile(text, file.name);
        if (parsed) {
          if (parsed.type === 'Scenario' || parsed.type === 'Adventure') {
            if (typeof addStory === 'function') {
              addStory(parsed);
              scenarioCount++;
            }
          } else {
            if (typeof updateSavedElement === 'function') {
              updateSavedElement(parsed.id, parsed);
              elementCount++;
            }
          }
        }
      } catch (err) {
        console.warn('Direct file parse failed for', file.name, err);
        try {
          const batch = await batchIngestElementFiles([file]);
          if (batch[0]?.success && batch[0]?.element) {
            if (typeof updateSavedElement === 'function') {
              updateSavedElement(batch[0].element.id, batch[0].element);
              elementCount++;
            }
          }
        } catch (e2) {
          console.error('Batch ingest fallback failed:', e2);
        }
      }
    }

    if (elementCount > 0 || scenarioCount > 0) {
      AudioService.playCriticalChime(true);
      showToast({
        type: 'success',
        text: `✓ Imported ${elementCount} element(s)${scenarioCount > 0 ? ` and ${scenarioCount} scenario(s)` : ''} into Story Module!`
      });
    } else {
      showToast({
        type: 'warning',
        text: 'No compatible elements or scenarios were found in the selected files.'
      });
    }
  };

  const handleRailDragOver = (e) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDraggingFilesOverRail(true);
    }
  };

  const handleRailDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDraggingFilesOverRail(false);
    }
  };

  const handleRailDrop = (e) => {
    if (e.dataTransfer.files?.length > 0) {
      e.preventDefault();
      setIsDraggingFilesOverRail(false);
      processImportFiles(e.dataTransfer.files);
    }
  };

  const handleElementDragStart = (e, elem) => {
    e.stopPropagation();
    const payload = {
      id: elem.id,
      title: elem.title || 'Untitled',
      type: elem.type || 'Custom',
      content: elem.content || '',
      fields: elem.fields || {},
      customFields: elem.customFields || [],
      tags: elem.tags || []
    };
    e.dataTransfer.setData('text/plain', `[[${elem.title || 'Element'}]]`);
    e.dataTransfer.setData('application/x-tangent-wiki-element', JSON.stringify(payload));
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.setData('text/html', `<span class="tangent-wiki-chip font-bold text-cyan-300" data-element-id="${elem.id}" data-element-type="${elem.type}">[[${elem.title || 'Element'}]]</span>`);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  // Reusable Element Card Renderer
  const renderElementCard = (elem) => {
    const isLinked = (activeNode?.linkedElements || []).includes(elem.id);
    const isPreviewing = previewElementId === elem.id;

    return (
      <div
        key={elem.id}
        draggable
        onDragStart={(e) => handleElementDragStart(e, elem)}
        className={`p-2 rounded-xl border transition-all space-y-1.5 group select-none ${
          isLinked 
            ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm' 
            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-slate-600 hover:text-cyan-400 cursor-grab active:cursor-grabbing text-xs shrink-0" title="Drag onto Story Canvas to link">
              <GripVertical size={13} />
            </span>
            <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border shrink-0 ${getTypePillStyle(elem.type)}`}>
              {elem.type || 'Custom'}
            </span>
            <span 
              className="text-xs font-bold text-slate-200 truncate cursor-pointer hover:text-cyan-300 flex-1"
              title="Click to edit element details in-situ"
              onClick={() => {
                setEditingModalElement(elem);
                setIsEditElementModalOpen(true);
              }}
            >
              {elem.title || 'Untitled'}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              type="button"
              onClick={() => setPreviewElementId(prev => prev === elem.id ? null : elem.id)}
              className="p-1 text-[10px] text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              title={isPreviewing ? "Hide preview" : "Quick peek preview"}
            >
              {isPreviewing ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingModalElement(elem);
                setIsEditElementModalOpen(true);
              }}
              className="p-1 text-[10px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Edit Element In-Situ"
            >
              <Edit3 size={11} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (handleDeleteElement) {
                  handleDeleteElement(elem.id, elem.title);
                } else if (deleteSavedElement) {
                  deleteSavedElement(elem.id);
                }
              }}
              className="p-1 text-[10px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              title="Delete Element"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Inline Quick Peek Preview */}
        {isPreviewing && (
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-750 text-[10px] space-y-1 font-sans animate-in fade-in duration-150">
            {elem.fields?.oneLinePitch && (
              <p className="font-semibold text-cyan-300 italic">{elem.fields.oneLinePitch}</p>
            )}
            <p className="text-slate-300 line-clamp-4 leading-relaxed">
              {elem.fields?.description || elem.content?.replace(/<[^>]+>/g, ' ') || 'No description recorded.'}
            </p>
            {elem.tags && elem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {elem.tags.map(tag => (
                  <span key={tag} className="px-1 py-0.2 rounded bg-slate-800 text-slate-400 text-[8px] font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {!isPreviewing && (elem.fields?.oneLinePitch || elem.content) && (
          <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug pl-4">
            {elem.fields?.oneLinePitch || elem.content.replace(/<[^>]+>/g, '')}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/80 text-[10px] pl-4">
          <button
            type="button"
            onClick={() => handleInsertMention(elem)}
            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer text-[9px] flex items-center gap-1"
            title="Insert @Mention / [[Wiki Link]] into active scenario prose"
          >
            <Link2 size={10} />
            <span>@Mention</span>
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
  };

  if (!isTreeExpanded) return null;

  return (
    <div 
      onDragOver={handleRailDragOver}
      onDragLeave={handleRailDragLeave}
      onDrop={handleRailDrop}
      className="h-full flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 z-10 shrink-0 w-64 xl:w-72 relative"
    >
      {/* Hidden File Input for Element & Scenario Imports */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept=".aime,.json,.world,.persona,.setting,.species,.tech,.philosophy,.scene,.faction,.item,.lore,.md,.txt"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            processImportFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Drag & Drop File Hover Overlay */}
      {isDraggingFilesOverRail && (
        <div className="absolute inset-0 z-50 bg-cyan-950/95 border-2 border-dashed border-cyan-400 rounded-lg flex flex-col items-center justify-center p-4 text-center backdrop-blur-sm animate-in fade-in duration-150 select-none">
          <Upload size={32} className="text-cyan-400 mb-2 animate-bounce" />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Drop Files to Import
          </span>
          <span className="text-[10px] text-cyan-300 mt-1 font-mono">
            .aime, .json, .md elements &amp; scenarios
          </span>
        </div>
      )}

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

        {/* Global Import Action */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1 px-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          title="Import Elements or Scenarios (.aime, .json, .md files)"
        >
          <Upload size={10} className="text-cyan-400" />
          <span className="hidden sm:inline">Import</span>
        </button>

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

      {/* Filter & Wiki Structure Controls */}
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
          <div className="flex items-center justify-between gap-1 pt-0.5">
            {/* Wiki Tree vs List Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 text-[9px] font-bold">
              <button
                type="button"
                onClick={() => handleViewModeChange('wiki_tree')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${
                  elementsViewMode === 'wiki_tree' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Wiki Category Folders View"
              >
                <FolderTree size={10} />
                <span>Wiki Tree</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('flat_list')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${
                  elementsViewMode === 'flat_list' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Filterable Flat List View"
              >
                <List size={10} />
                <span>List</span>
              </button>
            </div>

            <span className="text-[9px] text-slate-500 truncate">
              {filteredOutlinerElements.length} element(s)
            </span>
          </div>
        )}

        {/* Flat List Filter Pills */}
        {outlinerTab === 'elements' && elementsViewMode === 'flat_list' && (
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
              No scenarios yet.<br/>Click "+ Add" or "Import" to begin your campaign outline.
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
                  const draggedId = e.dataTransfer.getData('tangent-scenario-id') || e.dataTransfer.getData('text/plain');
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
        /* World Elements Feed (Wiki Categories Tree or Flat List) */
        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin flex flex-col font-mono">
          {(!filteredOutlinerElements || filteredOutlinerElements.length === 0) ? (
            <div className="text-slate-500 text-xs text-center italic mt-10 p-4">
              No world elements found.<br/>Click "+ New" or "Import" to add elements.
            </div>
          ) : elementsViewMode === 'wiki_tree' ? (
            /* WIKI CATEGORIES TREE VIEW */
            WIKI_CATEGORIES.map(cat => {
              const catElements = filteredOutlinerElements.filter(elem => 
                cat.types.some(t => t.toLowerCase() === (elem.type || 'Custom').toLowerCase())
              );

              if (catElements.length === 0 && searchFilter) return null;

              return (
                <div key={cat.id} className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
                  {/* Category Header */}
                  <div 
                    onClick={() => toggleCategory(cat.id)}
                    className="px-2.5 py-1.5 flex items-center justify-between bg-slate-900/80 hover:bg-slate-850 cursor-pointer transition-colors text-xs select-none"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-slate-400 text-[10px]">
                        {expandedCategories[cat.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </span>
                      <span className="text-xs">{cat.icon}</span>
                      <span className="font-bold text-slate-200 text-[11px] truncate">{cat.label}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {catElements.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingModalElement({
                          id: uuidv4(),
                          type: cat.types[0],
                          title: `New ${cat.label.split('&')[0].trim()}`,
                          fields: {},
                          content: ''
                        });
                        setIsEditElementModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded text-[10px] transition-colors"
                      title={`Add new ${cat.label.split('&')[0].trim()}`}
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  {/* Category Elements Body */}
                  {expandedCategories[cat.id] && (
                    <div className="p-1.5 space-y-1.5 bg-slate-950/20">
                      {catElements.length === 0 ? (
                        <div className="text-[10px] text-slate-600 italic px-2 py-1">
                          No elements in this category.
                        </div>
                      ) : (
                        catElements.map(elem => renderElementCard(elem))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            /* FLAT LIST VIEW */
            filteredOutlinerElements.map(elem => renderElementCard(elem))
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
