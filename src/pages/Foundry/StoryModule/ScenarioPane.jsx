/**
 * @file ScenarioPane.jsx
 * @description Master 3-Zone Glass-Cockpit Scenario Workspace for the Adventure Development Environment (ADE).
 * Features:
 *   - Zone 1 (Left): Collapsible, searchable scenario hierarchy tree with depth drag-and-drop.
 *   - Zone 2 (Center Stage): Focused, full-height creative canvas switching seamlessly between
 *     Prose Drafting (ReactQuill), OSR 2-Page Tactical Spread (OsrControlPanelDeck), and Connected Manuscript.
 *   - Zone 3 (Right Cockpit Dock): Resizable, collapsible master inspector housing 4 tabbed decks:
 *     1. 📋 Inspector: Compact Image Uploader/Preview, Type-Specific Schema Fields, Custom Fields.
 *     2. ⚔️ Tactical: Connected Map Asset Card (Map Maker & VTT launch) & Encounter Stats Glance.
 *     3. 🧩 World Elements: In-Situ searchable worldbuilding catalog with 1-click mention insertion.
 *     4. ✨ AIME Co-Pilot: Embedded conversational AI narrative assistant & dice roller.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory, formatExportFilename } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { extractCreatorInfo } from '../../../utils/creatorUtils';
import Split from 'react-split';
import { v4 as uuidv4 } from 'uuid';
import { ELEMENT_TYPES, ELEMENT_SCHEMAS, getTypePillStyle } from '../ElementForge/elementSchemas';
import { isHalfPageElement } from './exportUtils';
import { ElementSelectorModal as UnifiedRelationalSelectorModal } from '../ElementForge/ElementSelectorModal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import EditElementModal from '../ElementForge/EditElementModal';
import OsrControlPanelDeck from './workspaces/OsrControlPanelDeck';
import StoryWeaver from './workspaces/StoryWeaver';
import InteractiveStoryStudio from './workspaces/InteractiveStoryStudio';
import AIMEChatBox from '../AIME/AIMEChatBox';
import { 
  Search, 
  Plus, 
  Trash2, 
  X, 
  ExternalLink, 
  Sliders, 
  Play, 
  ChevronRight, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Target, 
  Compass, 
  Box,
  MapPin,
  FileText,
  Upload,
  Link,
  ChevronDown
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

// Helper to get breadcrumb location path for an element
const getBreadcrumbPath = (nodes, targetId, currentPath = []) => {
  for (let n of nodes) {
    const newPath = [...currentPath, n.title || 'Untitled'];
    if (n.id === targetId) return newPath;
    if (n.children && n.children.length > 0) {
      const found = getBreadcrumbPath(n.children, targetId, newPath);
      if (found) return found;
    }
  }
  return null;
};

// ── OUTLINER TREE NODE ──
const TreeNode = ({ 
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
const AddElementModal = ({ isOpen, onClose, onAdd, defaultParentId, onImport }) => {
  const { elementsCatalog } = useStory();
  const [type, setType] = useState('Story Arc');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSavedId, setSelectedSavedId] = useState('');
  const [customFields, setCustomFields] = useState([{ id: uuidv4(), label: '', value: '' }]);
  const [templateFilterType, setTemplateFilterType] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSelectSaved = (val) => {
    setSelectedSavedId(val);
    if (!val) {
      setTitle('');
      setContent('');
      return;
    }

    const savedElem = elementsCatalog.find(item => item.id === val);
    if (savedElem) {
      setType(savedElem.type || 'Custom');
      setTitle(savedElem.title || '');
      setContent(savedElem.content || '');
      if (Array.isArray(savedElem.customFields) && savedElem.customFields.length > 0) {
        setCustomFields(savedElem.customFields);
      }
    }
  };

  const handleCustomFieldChange = (id, key, val) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  const handleAddCustomFieldRow = () => {
    setCustomFields(prev => [...prev, { id: uuidv4(), label: '', value: '' }]);
  };

  const handleRemoveCustomFieldRow = (id) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validCustomFields = customFields
      .filter(f => f.label.trim() !== '')
      .map(f => ({ id: f.id || uuidv4(), label: f.label.trim(), value: f.value }));

    let baseFields = {};
    let imageUrl = '';
    if (selectedSavedId) {
      const savedElem = elementsCatalog.find(item => item.id === selectedSavedId);
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

// ── AUTO-RESIZING TEXTAREA ──
const AutoResizingTextarea = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(34, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      style={{ resize: 'none', overflowY: 'hidden' }}
    />
  );
};

// ── COMPACT ELEMENT IMAGE UPLOADER (For Right Cockpit Dock) ──
const ElementImageUploader = ({ activeNode, updateStory }) => {
  const fileInputRef = useRef(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  const isHalfPage = isHalfPageElement(activeNode.type);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      updateStory(activeNode.id, { imageUrl: event.target.result });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInputValue.trim()) {
      updateStory(activeNode.id, { imageUrl: urlInputValue.trim() });
      setUrlInputValue('');
      setShowUrlInput(false);
    }
  };

  const handleClearImage = () => {
    updateStory(activeNode.id, { imageUrl: null });
  };

  return (
    <div className="p-3 bg-slate-950/60 border-b border-slate-800 space-y-2 font-mono">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
          <span>🖼️</span> Element Image
        </span>
        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
          {isHalfPage ? 'Half-Page' : 'Quarter-Page'}
        </span>
      </div>

      {activeNode.imageUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <img
            src={activeNode.imageUrl}
            alt={activeNode.title || 'Element Image'}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500 text-cyan-200 text-[10px] font-bold rounded uppercase cursor-pointer"
            >
              Replace
            </button>
            <button
              onClick={handleClearImage}
              className="px-2 py-1 bg-red-950/90 hover:bg-red-900 border border-red-500 text-red-200 text-[10px] font-bold rounded uppercase cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>📥</span> Upload
          </button>
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
          >
            🔗 URL
          </button>
        </div>
      )}

      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="flex gap-1 pt-1">
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="Paste image URL..."
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] px-2 py-1 rounded-lg outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold rounded-lg uppercase cursor-pointer"
          >
            Set
          </button>
        </form>
      )}
    </div>
  );
};

// ── ELEMENT FIELDS EDITOR (For Right Cockpit Dock) ──
const ElementFieldsEditor = ({ activeNode, updateStory }) => {
  const schema = ELEMENT_SCHEMAS[activeNode.type] || [];
  const fields = activeNode.fields || {};
  const customFields = activeNode.customFields || [];

  const [selectorState, setSelectorState] = useState(null);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  useEffect(() => {
    setActiveTabIdx(0);
  }, [activeNode.type, activeNode.id]);

  const handleChange = (key, value) => {
    updateStory(activeNode.id, {
      fields: {
        ...(activeNode.fields || {}),
        [key]: value
      }
    });
  };

  const handleCustomFieldChange = (id, val) => {
    const updated = customFields.map(f => f.id === id ? { ...f, value: val } : f);
    updateStory(activeNode.id, { customFields: updated });
  };

  const handleCustomLabelChange = (id, newLabelStr) => {
    const updated = customFields.map(f => f.id === id ? { ...f, label: newLabelStr } : f);
    updateStory(activeNode.id, { customFields: updated });
  };

  const handleDeleteCustomField = (id) => {
    const updated = customFields.filter(f => f.id !== id);
    updateStory(activeNode.id, { customFields: updated });
  };

  const handleAddCustomField = () => {
    if (!newLabel.trim()) return;
    const newField = {
      id: uuidv4(),
      label: newLabel.trim(),
      value: newValue
    };
    const updated = [...customFields, newField];
    updateStory(activeNode.id, { customFields: updated });
    setNewLabel('');
    setNewValue('');
  };

  const handleOpenSelector = (fieldDef) => {
    setSelectorState({
      key: fieldDef.key,
      label: fieldDef.label,
      dbSource: fieldDef.dbSource || 'species'
    });
  };

  const schemaTabs = Array.from(new Set(schema.map(f => f.tab || 'General')));
  const allTabs = [...schemaTabs, 'Custom Fields'];
  const currentTab = allTabs[activeTabIdx] || allTabs[0];

  return (
    <div className="p-3 font-mono space-y-3">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-1 pb-2 border-b border-slate-800">
        {allTabs.map((tab, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveTabIdx(idx)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
              activeTabIdx === idx 
                ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/80 shadow-sm' 
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Schema Fields */}
      {schemaTabs.includes(currentTab) && (
        <div className="space-y-3">
          {schema.filter(f => (f.tab || 'General') === currentTab).map(f => {
            const val = fields[f.key] || '';
            const isRelational = f.type === 'relational' || f.dbSource;

            return (
              <div key={f.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                    {f.label}
                  </label>
                  {f.dbSource && (
                    <button
                      onClick={() => handleOpenSelector(f)}
                      className="px-1.5 py-0.2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[9px] font-bold uppercase transition-colors"
                    >
                      ☁️ DB
                    </button>
                  )}
                </div>

                {isRelational && val && (
                  <div className="flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/40 px-2 py-1 rounded text-[10px]">
                    <span className="text-cyan-400 font-bold">☁️</span>
                    <span className="text-white font-semibold flex-1 truncate">{val}</span>
                    <button
                      onClick={() => handleChange(f.key, '')}
                      className="text-slate-400 hover:text-red-400 font-bold px-0.5"
                    >
                      &times;
                    </button>
                  </div>
                )}

                <AutoResizingTextarea
                  value={val}
                  onChange={e => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-100 p-2 rounded-lg text-xs outline-none leading-relaxed"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Fields */}
      {currentTab === 'Custom Fields' && (
        <div className="space-y-3">
          {customFields.map(cf => (
            <div key={cf.id} className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <input
                  type="text"
                  value={cf.label}
                  onChange={(e) => handleCustomLabelChange(cf.id, e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-cyan-300 uppercase tracking-wider outline-none border-b border-dashed border-cyan-800/60 px-1 py-0.5 flex-1"
                  placeholder="Field Name..."
                />
                <button
                  type="button"
                  onClick={() => handleDeleteCustomField(cf.id)}
                  className="text-slate-500 hover:text-red-400 text-[10px] font-bold px-1"
                >
                  ✕
                </button>
              </div>
              <AutoResizingTextarea
                value={cf.value || ''}
                onChange={e => handleCustomFieldChange(cf.id, e.target.value)}
                placeholder="Field value..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-slate-100 p-2 rounded-lg text-xs outline-none"
              />
            </div>
          ))}

          {/* Add custom field */}
          <div className="p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              + New Custom Field
            </span>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label (e.g. Danger Level)"
              className="w-full bg-slate-900 border border-slate-800 text-cyan-300 p-1.5 rounded-lg text-xs outline-none focus:border-cyan-400"
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value"
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-1.5 rounded-lg text-xs outline-none focus:border-cyan-400"
            />
            {newLabel.trim() && (
              <button
                type="button"
                onClick={handleAddCustomField}
                className="w-full py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
              >
                Add Field
              </button>
            )}
          </div>
        </div>
      )}

      {selectorState && (
        <UnifiedRelationalSelectorModal
          isOpen={Boolean(selectorState)}
          onClose={() => setSelectorState(null)}
          sourceCollection={selectorState.dbSource}
          fieldLabel={selectorState.label}
          isMulti={false}
          selectedValues={fields[selectorState.key] ? [fields[selectorState.key]] : []}
          onSelect={(selectedArr) => {
            const chosen = Array.isArray(selectedArr) ? selectedArr[0] : selectedArr;
            handleChange(selectorState.key, chosen || '');
            setSelectorState(null);
          }}
        />
      )}
    </div>
  );
};

// ── MAIN SCENARIO PANE WORKSPACE ──
export default function ScenarioPane({ 
  onSwitchTab, 
  onSwitchView, 
  onOpenCatalog,
  scenarioWorkspaceTab: propWorkspaceTab,
  onSelectScenarioWorkspaceTab: propSetWorkspaceTab,
  isTreeExpanded = true,
  onToggleTreeExpanded,
  // Right Cockpit Dock props
  isRightDockOpen = true,
  onToggleRightDock,
  activeCockpitDeck = 'inspector',
  onSelectCockpitDeck,
  onOpenGems,
  onOpenScratchbook,
  onOpenPrintModal
}) {
  const navigate = useNavigate();
  const { 
    universeState, 
    setUniverseState, 
    activeScenarioId, 
    setActiveScenarioId, 
    addStory, 
    updateStory, 
    deleteStory, 
    moveStory, 
    reorderStory, 
    reorderRelativeScenario, 
    triggerStorySave, 
    handleSaveStory, 
    handleLoadStory, 
    addMap, 
    setActiveMapId, 
    updateProjectName, 
    isStoryReadOnly, 
    clonePublicStory,
    createNewStory,
    deleteStoryProject,
    elementsCatalog,
    updateSavedElement,
    deleteSavedElement
  } = useStory();

  const { currentUser, userHandle } = useAuth();

  // Internal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalParentId, setModalParentId] = useState(null);
  const [localContent, setLocalContent] = useState('');
  const [isEditElementModalOpen, setIsEditElementModalOpen] = useState(false);
  const [editingModalElement, setEditingModalElement] = useState(null);
  const [localWorkspaceTab, setLocalWorkspaceTab] = useState('weaver'); // 'weaver' | 'tactical' | 'interactive'
  const [searchFilter, setSearchFilter] = useState('');

  // Outliner left-column dual-mode tab: 'scenarios' | 'elements'
  const [outlinerTab, setOutlinerTab] = useState('scenarios');
  const [outlinerElementTypeFilter, setOutlinerElementTypeFilter] = useState('All');

  // Right Dock Tab state: 'inspector' | 'tactical' | 'elements' | 'aime'
  const [localDockTab, setLocalDockTab] = useState(activeCockpitDeck || 'inspector');
  const dockTab = activeCockpitDeck || localDockTab;
  const setDockTab = (tab) => {
    setLocalDockTab(tab);
    if (onSelectCockpitDeck) onSelectCockpitDeck(tab);
  };

  // World Elements search in Cockpit Dock
  const [elementSearch, setElementSearch] = useState('');
  const [selectedElementTypeFilter, setSelectedElementTypeFilter] = useState('Persona');

  const rawWorkspaceTab = propWorkspaceTab || localWorkspaceTab;
  const scenarioWorkspaceTab = (rawWorkspaceTab === 'canvas' || rawWorkspaceTab === 'manuscript')
    ? 'weaver'
    : (rawWorkspaceTab === 'control-panel' ? 'tactical' : rawWorkspaceTab);
  const setScenarioWorkspaceTab = propSetWorkspaceTab || setLocalWorkspaceTab;

  const mapFileInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Locate active node
  let activeNode = null;
  const findNode = (nodes) => {
    for (let n of nodes) {
      if (n.id === activeScenarioId) {
        activeNode = n;
        return;
      }
      if (n.children) findNode(n.children);
    }
  };
  if (activeScenarioId && universeState?.scenarios) findNode(universeState.scenarios);

  useEffect(() => {
    if (!activeScenarioId && universeState?.scenarios?.length > 0) {
      setActiveScenarioId(universeState.scenarios[0].id);
    }
  }, [activeScenarioId, universeState?.scenarios, setActiveScenarioId]);

  const locationPath = activeNode ? getBreadcrumbPath(universeState.scenarios, activeNode.id) : null;
  const linkedMap = activeNode?.mapId ? universeState?.maps?.find(m => m.id === activeNode.mapId) : null;

  useEffect(() => {
    if (activeNode && activeNode.content !== localContent) {
      setLocalContent(activeNode.content || '');
    } else if (!activeNode) {
      setLocalContent('');
    }
  }, [activeScenarioId, activeNode?.content]);

  const handleContentChange = (val) => {
    setLocalContent(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (activeScenarioId) {
        updateStory(activeScenarioId, { content: val });
      }
    }, 300);
  };

  const handleTitleChange = (e) => {
    if (activeScenarioId) {
      updateStory(activeScenarioId, { title: e.target.value });
    }
  };

  const handleOpenAddModal = (targetParentId = null) => {
    setModalParentId(targetParentId);
    setIsModalOpen(true);
  };

  const handleAddElement = ({ type, title, parentId, customFields, fields, imageUrl }) => {
    const newNode = {
      id: uuidv4(),
      type,
      title,
      content: '',
      fields: fields || {},
      imageUrl: imageUrl || '',
      customFields: customFields || [],
      children: []
    };
    addStory(newNode, parentId);
    setActiveScenarioId(newNode.id);
  };

  const handleDeleteElement = (id, title) => {
    if (confirmTypedDeletion(title || 'story element', 'story element')) {
      deleteStory(id);
    }
  };

  const handleInsertMention = (elem) => {
    if (!elem) return;
    const cleanTitle = (elem.title || 'Untitled').replace(/["'<>]/g, '');
    const chipHtml = `<span class="tangent-entity-chip bg-cyan-900/60 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40 font-semibold" data-entity-id="${elem.id}" data-entity-type="${elem.type || 'Custom'}">@${cleanTitle}</span>&nbsp;`;
    const updatedContent = localContent ? `${localContent} ${chipHtml}` : chipHtml;
    setLocalContent(updatedContent);
    if (activeScenarioId) {
      const currentLinked = Array.isArray(activeNode?.linkedElements) ? activeNode.linkedElements : [];
      updateStory(activeScenarioId, { 
        content: updatedContent,
        linkedElements: Array.from(new Set([...currentLinked, elem.id]))
      });
    }
  };

  const handleToggleLinkElement = (elemId) => {
    if (!activeScenarioId) return;
    const currentLinked = Array.isArray(activeNode?.linkedElements) ? activeNode.linkedElements : [];
    const updated = currentLinked.includes(elemId)
      ? currentLinked.filter(id => id !== elemId)
      : [...currentLinked, elemId];
    updateStory(activeScenarioId, { linkedElements: updated });
  };

  // Map file handlers
  const handleMapFileImport = (e) => {
    const file = e.target.files[0];
    if (!file || !activeNode) return;

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          let mapToLoad = data.type === "TangentMap" && data.map ? data.map : (data.id && data.title ? data : null);
          if (mapToLoad) {
            const mapId = mapToLoad.id || uuidv4();
            const newMap = { ...mapToLoad, id: mapId };
            addMap(newMap);
            updateStory(activeNode.id, { mapId });
            setActiveMapId(mapId);
          }
        } catch (err) {
          console.error(err);
          alert("Failed to parse map JSON file.");
        }
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        const newMap = {
          id: uuidv4(),
          title: `${activeNode.title || 'Map'} (Image)`,
          gridMode: 'square',
          lines: [],
          tokens: [],
          terrains: [],
          objects: [
            {
              id: uuidv4(),
              shape: 'rect',
              color: '#3b82f6',
              label: file.name,
              x: 400,
              y: 300,
              width: 800,
              height: 600,
              imageUrl: imageUrl
            }
          ],
          texts: [],
          fog: []
        };
        addMap(newMap);
        updateStory(activeNode.id, { mapId: newMap.id });
        setActiveMapId(newMap.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateNewMapForElement = () => {
    if (!activeNode) return;
    const newMap = {
      id: uuidv4(),
      title: `${activeNode.title || 'Untitled'} Encounter Map`,
      gridMode: 'square',
      lines: [],
      tokens: [],
      terrains: [],
      objects: [],
      texts: [],
      fog: []
    };
    addMap(newMap);
    updateStory(activeNode.id, { mapId: newMap.id });
    setActiveMapId(newMap.id);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  };

  // Filtered elements catalog for In-Situ dock
  const filteredCatalog = useMemo(() => {
    return (elementsCatalog || []).filter(elem => {
      const matchesSearch = !elementSearch ||
        (elem.title || '').toLowerCase().includes(elementSearch.toLowerCase()) ||
        (elem.type || '').toLowerCase().includes(elementSearch.toLowerCase());
      const matchesType = selectedElementTypeFilter === 'All' || elem.type === selectedElementTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [elementsCatalog, elementSearch, selectedElementTypeFilter]);

  // Filtered elements for Left Outliner Rail
  const filteredOutlinerElements = useMemo(() => {
    return (elementsCatalog || []).filter(elem => {
      const matchesSearch = !searchFilter ||
        (elem.title || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
        (elem.type || '').toLowerCase().includes(searchFilter.toLowerCase());
      const matchesType = outlinerElementTypeFilter === 'All' || elem.type === outlinerElementTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [elementsCatalog, searchFilter, outlinerElementTypeFilter]);

  return (
    <div className="h-full w-full bg-slate-950 flex overflow-hidden relative font-mono" onBlur={triggerStorySave}>
      <style>{`
        .quill-dark-wrapper .ql-toolbar.ql-snow {
          position: relative;
          z-index: 10;
          background-color: #0c1017;
          border-color: #1e293b;
          border-top: none;
          border-left: none;
          border-right: none;
          padding: 6px 12px;
        }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-stroke { stroke: #94a3b8; }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-fill { fill: #94a3b8; }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-picker { color: #94a3b8; font-family: inherit; font-size: 11px; }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-picker-options {
          background-color: #1e293b;
          border-color: #334155;
          color: #f1f5f9;
          z-index: 100 !important;
        }
        .quill-dark-wrapper .ql-container.ql-snow {
          border: none;
          background-color: #090d16;
          color: #e2e8f0;
          font-size: 0.95rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .quill-dark-wrapper .ql-editor {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          line-height: 1.7;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        }
        .quill-dark-wrapper .ql-editor.ql-blank::before {
          color: #475569;
          font-style: italic;
        }
      `}</style>

      {/* Hidden Map File Input */}
      <input
        type="file"
        accept=".json,image/*"
        ref={mapFileInputRef}
        className="hidden"
        onChange={handleMapFileImport}
      />

      <AddElementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddElement} 
        defaultParentId={modalParentId}
      />

      {/* ── ZONE 1: DUAL-MODE OUTLINER RAIL (Left Column: Scenarios & World Elements) ── */}
      <div className={`h-full flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 z-10 shrink-0 ${
        isTreeExpanded ? 'w-64 xl:w-72' : 'w-0 hidden'
      }`}>
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
            <button 
              type="button"
              onClick={() => handleOpenAddModal(activeScenarioId)}
              className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold rounded-lg uppercase transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Add Root or Sub-Scenario Node"
            >
              <Plus size={11} />
              <span>Add</span>
            </button>
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
            {universeState.scenarios.length === 0 ? (
              <div className="text-slate-500 text-xs text-center italic mt-10 p-4 font-mono">
                No scenarios yet.<br/>Click "+ Add" to begin your campaign outline.
              </div>
            ) : (
              <>
                {universeState.scenarios.map(node => (
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
            {filteredOutlinerElements.length === 0 ? (
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

      {/* ── ZONE 2: PRIMARY CREATIVE STAGE (Center Column) ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16] relative min-w-0">
        {!activeNode && scenarioWorkspaceTab !== 'interactive' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 select-none">
            <BookOpen size={36} className="text-slate-700" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              No Element Selected
            </h3>
            <p className="text-xs text-slate-600 max-w-sm">
              Select an element from the left Outliner tree, or create a new one to begin drafting your story.
            </p>
            <button
              onClick={() => handleOpenAddModal(null)}
              className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold rounded-xl uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              + Create Element
            </button>
          </div>
        ) : !activeNode && scenarioWorkspaceTab === 'interactive' ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#080c14]">
            <InteractiveStoryStudio
              activeNode={null}
              onSelectScenario={(id) => setActiveScenarioId(id)}
            />
          </div>
        ) : (
          <>
            {/* Top Stage Control Header */}
            <div className="p-2.5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${getTypePillStyle(activeNode.type)}`}>
                  {activeNode.type}
                </span>
                <input 
                  type="text" 
                  value={activeNode.title || ''}
                  onChange={handleTitleChange}
                  className="text-sm md:text-base font-bold bg-transparent border-none outline-none text-white placeholder-slate-500 flex-1 truncate focus:bg-slate-900/60 rounded px-1 transition-colors"
                  placeholder="Element Title..."
                />
                <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-slate-500 truncate shrink-0">
                  <span className="text-amber-400">📍</span>
                  <span className="truncate max-w-[200px]">{locationPath ? locationPath.join(' ❯ ') : 'Root'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Format switcher tabs */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
                  <button
                    onClick={() => setScenarioWorkspaceTab('weaver')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      scenarioWorkspaceTab === 'weaver'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Story Weaver: Consolidated Prose, Manuscript, Outline, Beats & Genesis"
                  >
                    <span>🌟</span>
                    <span className="hidden sm:inline">Story Weaver</span>
                  </button>

                  <button
                    onClick={() => setScenarioWorkspaceTab('tactical')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      scenarioWorkspaceTab === 'tactical'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="OSR 2-Page Tactical Spread (Read-Aloud, Threats, DCs, Secrets)"
                  >
                    <span>🎛️</span>
                    <span className="hidden sm:inline">Tactical Spread</span>
                  </button>

                  <button
                    onClick={() => setScenarioWorkspaceTab('interactive')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      scenarioWorkspaceTab === 'interactive'
                        ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Interactive Play: Play through this scenario with Folio Persona, Presets, or Narrative Script"
                  >
                    <span>⚡</span>
                    <span className="hidden sm:inline">Interactive Play</span>
                  </button>
                </div>

                {/* Sub-Element & Delete Actions */}
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(activeNode.id)}
                  title="Add Sub-Element inside this element"
                  className="p-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span className="hidden xl:inline text-[11px] font-bold">Sub-Element</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteElement(activeNode.id, activeNode.title)}
                  title="Delete this element"
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* FORMAT VIEW 1: STORY WEAVER */}
            {scenarioWorkspaceTab === 'weaver' && (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#090d16]">
                <StoryWeaver
                  activeNode={activeNode}
                  updateStory={updateStory}
                  guidanceGems={universeState?.creativeState?.gems?.join(', ') || ''}
                />
              </div>
            )}

            {/* FORMAT VIEW 2: OSR TACTICAL SPREAD */}
            {scenarioWorkspaceTab === 'tactical' && (
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0f18] scrollbar-thin">
                <OsrControlPanelDeck
                  activeNode={activeNode}
                  updateStory={updateStory}
                  guidanceGems={universeState?.creativeState?.gems || []}
                />
              </div>
            )}

            {/* FORMAT VIEW 3: INTERACTIVE PLAY STUDIO */}
            {scenarioWorkspaceTab === 'interactive' && (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#080c14]">
                <InteractiveStoryStudio
                  activeNode={activeNode}
                  onSelectScenario={(id) => setActiveScenarioId(id)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── ZONE 3: MASTER COCKPIT DOCK (Right Column) ── */}
      {isRightDockOpen && (
        <aside className="w-80 xl:w-96 flex-shrink-0 bg-slate-900/98 border-l border-slate-800 flex flex-col h-full z-20 backdrop-blur-xl shadow-2xl transition-all">
          {/* Cockpit Dock Tab Selector Header */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-1 shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none font-mono text-xs">
              <button
                type="button"
                onClick={() => setDockTab('inspector')}
                className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  dockTab === 'inspector'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                }`}
                title="Element Fields & Image Inspector"
              >
                <span>📋</span>
                <span>Inspector</span>
              </button>

              <button
                type="button"
                onClick={() => setDockTab('tactical')}
                className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  dockTab === 'tactical'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                }`}
                title="Tactical Map & Encounter Integration"
              >
                <span>⚔️</span>
                <span>Tactical</span>
              </button>

              <button
                type="button"
                onClick={() => setDockTab('elements')}
                className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  dockTab === 'elements'
                    ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                }`}
                title="In-Situ Worldbuilding Elements"
              >
                <span>🧩</span>
                <span>World</span>
              </button>

              <button
                type="button"
                onClick={() => setDockTab('aime')}
                className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  dockTab === 'aime'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                }`}
                title="AI Story Assistant & Overseer"
              >
                <span>✨</span>
                <span>AI Assistant</span>
              </button>
            </div>

            {onToggleRightDock && (
              <button
                type="button"
                onClick={onToggleRightDock}
                className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Close Cockpit Dock (])"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* DOCK TAB 1: INSPECTOR & FIELDS */}
          {dockTab === 'inspector' && (
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {activeNode ? (
                <>
                  {/* Image Uploader Card */}
                  <ElementImageUploader activeNode={activeNode} updateStory={updateStory} />

                  {/* Linked Entities Pill Bar */}
                  <div className="p-3 bg-slate-950/40 border-b border-slate-800 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <span>🧩</span> Linked Entities:
                      </span>
                      <button
                        type="button"
                        onClick={() => setDockTab('elements')}
                        className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        + Link from Catalog
                      </button>
                    </div>

                    {(!activeNode.linkedElements || activeNode.linkedElements.length === 0) ? (
                      <p className="text-[10px] text-slate-500 italic">No entities linked to this scene yet</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {activeNode.linkedElements.map(elemId => {
                          const elem = (elementsCatalog || []).find(e => e.id === elemId);
                          if (!elem) return null;
                          return (
                            <span
                              key={elem.id}
                              className={`text-[9px] px-2 py-0.5 rounded border font-medium flex items-center gap-1 ${getTypePillStyle(elem.type)}`}
                            >
                              <span>{elem.title || 'Untitled'}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleLinkElement(elem.id)}
                                className="text-slate-400 hover:text-red-400 font-bold ml-1 cursor-pointer"
                                title="Unlink element"
                              >
                                &times;
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Type-Specific Structured Fields */}
                  <ElementFieldsEditor activeNode={activeNode} updateStory={updateStory} />
                </>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  Select an element to inspect its fields
                </div>
              )}
            </div>
          )}

          {/* DOCK TAB 2: TACTICAL & MAP DECK */}
          {dockTab === 'tactical' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 font-mono scrollbar-thin">
              {/* Linked Tactical Map Asset Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🗺️</span> Tactical Map Asset
                  </span>
                  {linkedMap && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                      Linked
                    </span>
                  )}
                </div>

                {linkedMap ? (
                  <div className="space-y-2.5">
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-xs font-bold text-cyan-300 truncate">{linkedMap.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>Grid: <strong>{linkedMap.gridMode || 'Square'}</strong></span>
                        <span>•</span>
                        <span>Objects: <strong>{(linkedMap.objects?.length || 0) + (linkedMap.tokens?.length || 0)}</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setActiveMapId(linkedMap.id);
                          if (onSwitchTab) onSwitchTab('map');
                          else navigate(`/foundry/map-maker?mapId=${linkedMap.id}`);
                        }}
                        className="p-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>🚀</span> Map Maker
                      </button>

                      <button
                        onClick={() => navigate('/stage')}
                        className="p-2 bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/60 text-purple-200 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>⚡</span> Stage VTT
                      </button>
                    </div>

                    <button
                      onClick={() => updateStory(activeNode.id, { mapId: null })}
                      className="w-full py-1 text-slate-500 hover:text-red-400 text-[10px] font-bold uppercase transition-colors"
                    >
                      Unlink Map ✕
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="p-2.5 bg-slate-950 border border-dashed border-slate-800 rounded-xl text-center text-[10px] text-slate-500 italic">
                      No tactical map linked to this scenario.
                    </div>

                    {/* Select existing map */}
                    {universeState?.maps && universeState.maps.length > 0 && (
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                          Link Existing Map:
                        </label>
                        <select
                          value={activeNode?.mapId || ''}
                          onChange={(e) => updateStory(activeNode.id, { mapId: e.target.value || null })}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs p-2 rounded-xl outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="">-- Select Project Map --</option>
                          {universeState.maps.map(m => (
                            <option key={m.id} value={m.id}>
                              🗺️ {m.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => mapFileInputRef.current?.click()}
                        className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>📥</span> Import
                      </button>

                      <button
                        onClick={handleCreateNewMapForElement}
                        className="p-2 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/60 text-amber-300 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>➕</span> New Map
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* OSR Tactical Quick Glance */}
              {activeNode && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎛️</span> Tactical Overview
                    </span>
                    <button
                      onClick={() => setScenarioWorkspaceTab('control-panel')}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Open Spread ❯
                    </button>
                  </div>

                  {/* Read-Aloud Preview */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sensory Read-Aloud:</span>
                    <p className="p-2 bg-slate-900/90 border border-slate-800 rounded-lg text-[11px] text-amber-100 italic leading-relaxed">
                      {activeNode.fields?.readAloud || 'No read-aloud GM script drafted yet.'}
                    </p>
                  </div>

                  {/* Threat Count */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Encounter Threats:</span>
                    <span className="font-bold text-cyan-300 font-mono">
                      {(activeNode.fields?.threats || []).length} Entities
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DOCK TAB 3: IN-SITU WORLD ELEMENTS DECK */}
          {dockTab === 'elements' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden font-mono">
              {/* Search & Actions Header */}
              <div className="p-2.5 border-b border-slate-800 bg-slate-950/60 space-y-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
                  <Search size={12} className="text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={elementSearch}
                    onChange={(e) => setElementSearch(e.target.value)}
                    placeholder="Search world elements..."
                    className="bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none w-full font-mono"
                  />
                  {elementSearch && (
                    <button onClick={() => setElementSearch('')} className="text-slate-500 hover:text-slate-300 text-[10px]">
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
                  {['Persona', 'Faction', 'Item', 'Location', 'Lore', 'All'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedElementTypeFilter(t)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
                        selectedElementTypeFilter === t
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Elements List Feed */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                {filteredCatalog.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 italic">
                    No matching world elements found.
                  </div>
                ) : (
                  filteredCatalog.map(elem => {
                    const isLinked = (activeNode?.linkedElements || []).includes(elem.id);

                    return (
                      <div
                        key={elem.id}
                        className={`p-2 rounded-xl border transition-all space-y-1.5 ${
                          isLinked 
                            ? 'bg-cyan-950/40 border-cyan-500/50' 
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border ${getTypePillStyle(elem.type)}`}>
                            {elem.type || 'Custom'}
                          </span>
                          <span className="text-xs font-bold text-slate-200 truncate flex-1 ml-1.5">
                            {elem.title || 'Untitled'}
                          </span>
                        </div>

                        {elem.content && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                            {elem.content.replace(/<[^>]+>/g, '')}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-850 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleInsertMention(elem)}
                            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
                            title="Insert @Mention into active story prose"
                          >
                            @Mention
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleLinkElement(elem.id)}
                            className={`font-bold transition-colors cursor-pointer ${
                              isLinked ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {isLinked ? '✓ Linked' : '+ Link'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom New Element Button */}
              <div className="p-2 border-t border-slate-800 bg-slate-950/80 flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingModalElement({
                      id: uuidv4(),
                      type: 'Persona',
                      title: 'New World Element',
                      fields: {},
                      content: ''
                    });
                    setIsEditElementModalOpen(true);
                  }}
                  className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow cursor-pointer"
                >
                  <Plus size={13} />
                  <span>New Element</span>
                </button>

                {onSwitchView && (
                  <button
                    type="button"
                    onClick={() => onSwitchView('elements')}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs transition-colors cursor-pointer"
                    title="Open Full Element Forge Database"
                  >
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DOCK TAB 4: AIME CO-PILOT DECK */}
          {dockTab === 'aime' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0d14]">
              <AIMEChatBox
                onClose={() => setDockTab('inspector')}
                activeNode={activeNode}
                contextData={{
                  projectName: universeState?.projectName || 'Tangent Universe',
                  activeNode: activeNode ? {
                    id: activeNode.id,
                    title: activeNode.title,
                    type: activeNode.type,
                    content: activeNode.content,
                    fields: activeNode.fields
                  } : null,
                  customCatalog: elementsCatalog || []
                }}
              />
            </div>
          )}
        </aside>
      )}

      {/* Full Element Forge Modal inside Story Module */}
      {isEditElementModalOpen && (
        <EditElementModal
          isOpen={isEditElementModalOpen}
          onClose={() => {
            setIsEditElementModalOpen(false);
            setEditingModalElement(null);
          }}
          element={editingModalElement}
          onSave={(savedElem) => {
            if (typeof updateSavedElement === 'function' && savedElem?.id) {
              updateSavedElement(savedElem.id, savedElem);
            }
            setIsEditElementModalOpen(false);
            setEditingModalElement(null);
          }}
          onDelete={(elementId) => {
            if (typeof deleteSavedElement === 'function' && elementId) {
              deleteSavedElement(elementId);
            }
            setIsEditElementModalOpen(false);
            setEditingModalElement(null);
          }}
        />
      )}
    </div>
  );
}
