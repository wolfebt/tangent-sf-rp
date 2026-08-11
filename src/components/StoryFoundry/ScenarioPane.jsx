import React, { useState, useEffect, useRef } from 'react';
import { useStory, formatExportFilename } from '../../context/CampaignContext';
import Split from 'react-split';
import { v4 as uuidv4 } from 'uuid';
import { ELEMENT_TYPES, ELEMENT_SCHEMAS } from './elementSchemas';
import { isHalfPageElement } from './exportUtils';
import { UnifiedRelationalSelectorModal } from '../DBM/UnifiedRelationalSelectorModal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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

const TreeNode = ({ node, activeId, onSelect, onDelete, onMove, onReorderRelative, onAddChild, onExport, onExportMD, onExportPDF, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dropPosition, setDropPosition] = useState(null); // 'above' | 'inside' | 'below' | null
  const hasChildren = node.children && node.children.length > 0;
  
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
    <div className="flex flex-col min-w-max group select-none relative">
      <div 
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex items-center py-1.5 px-2 cursor-pointer transition-all justify-between rounded-sm relative ${
          dropPosition === 'inside'
            ? 'bg-cyan-950/90 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.5)]' 
            : activeId === node.id 
            ? 'bg-amber-600/30 border-l-2 border-amber-500 text-white font-semibold' 
            : 'hover:bg-slate-700/50 border-l-2 border-transparent text-slate-300'
        }`}
        style={{ paddingLeft: `${depth * 0.85 + 0.5}rem` }}
        onClick={() => onSelect(node.id)}
      >
        {/* Top Drop Indicator Line Element */}
        {dropPosition === 'above' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee] z-10" />
        )}
        {/* Bottom Drop Indicator Line Element */}
        {dropPosition === 'below' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee] z-10" />
        )}

        <div className="flex items-center gap-1 min-w-0 pr-2">
          <span 
            className={`w-4 text-center text-xs text-slate-400 shrink-0 ${hasChildren ? 'hover:text-white' : 'opacity-0'}`}
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          >
            {isExpanded ? '▼' : '▶'}
          </span>
          <span className="text-slate-500 hover:text-cyan-400 text-[10px] cursor-grab active:cursor-grabbing shrink-0" title="Drag to reorder sibling or drop in middle to nest inside">
            ⣿
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-amber-500/90 uppercase tracking-wider leading-none mb-0.5">{node.type}</span>
            <span className="text-xs font-medium whitespace-nowrap truncate">{node.title || 'Untitled'}</span>
          </div>
        </div>

        {/* Tree Node Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
          {onAddChild && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              title="Add Sub-Element inside this element"
              className="px-1.5 py-0.5 text-[10px] bg-amber-950/80 hover:bg-amber-700 border border-amber-500/50 text-amber-300 rounded leading-none transition-colors font-bold"
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
              className="px-1.5 py-0.5 text-[10px] bg-red-950/80 hover:bg-red-800 border border-red-500/60 text-red-300 hover:text-red-200 rounded leading-none transition-colors font-bold"
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AddElementModal = ({ isOpen, onClose, onAdd, defaultParentId = null }) => {
  const { elementsCatalog } = useStory();
  const [selectedSavedId, setSelectedSavedId] = useState('');
  const [type, setType] = useState('Story Arc');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [customFields, setCustomFields] = useState([{ id: uuidv4(), label: '', value: '' }]);

  if (!isOpen) return null;

  const handleSelectSaved = (e) => {
    const val = e.target.value;
    setSelectedSavedId(val);
    if (!val) return;

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

  const lastField = customFields[customFields.length - 1];
  const canAddField = lastField && (lastField.label.trim() !== '' || lastField.value.trim() !== '');

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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 w-[26rem] max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Add Story Element</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1">
          
          {elementsCatalog && elementsCatalog.length > 0 && (
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-cyan-500/40">
              <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                Pull-down List of Our Elements
              </label>
              <select 
                value={selectedSavedId} 
                onChange={handleSelectSaved}
                className="w-full bg-slate-950 border border-slate-700 text-cyan-300 p-2 rounded focus:border-cyan-400 outline-none text-xs font-semibold cursor-pointer"
              >
                <option value="">-- Select Saved Element Template --</option>
                {elementsCatalog.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.title || 'Untitled'} ({e.type || 'Element'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-400 uppercase mb-1 font-semibold">Element Type</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white p-2 rounded focus:border-amber-500 outline-none text-xs"
            >
              {ELEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase mb-1 font-semibold font-mono">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="E.g. Derelict Outpost Alpha"
              autoFocus
              className="w-full bg-slate-700 border border-slate-600 text-white p-2 rounded focus:border-amber-500 outline-none text-xs"
              required
            />
          </div>

          {/* Dynamic Custom Fields Setup for Custom Element */}
          {type === 'Custom' && (
            <div className="border-t border-slate-700 pt-3 mt-1 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Custom Fields & Labels</label>
                <span className="text-[10px] text-slate-400 italic">User-set labels & fields</span>
              </div>
              
              {customFields.map((cf, idx) => (
                <div key={cf.id} className="flex flex-col gap-1.5 p-2 bg-slate-900/80 border border-slate-700 rounded-md">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={cf.label}
                      onChange={(e) => handleCustomFieldChange(cf.id, 'label', e.target.value)}
                      placeholder={`Field Label ${idx + 1} (e.g. Threat Class)`}
                      className="w-full bg-slate-800 border border-slate-600 text-cyan-300 p-1.5 rounded text-xs outline-none focus:border-cyan-400"
                    />
                    {customFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomFieldRow(cf.id)}
                        className="text-slate-400 hover:text-red-400 text-xs px-1.5 py-0.5 rounded font-bold"
                        title="Remove Field"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={cf.value}
                    onChange={(e) => handleCustomFieldChange(cf.id, 'value', e.target.value)}
                    placeholder="Field value / description..."
                    className="w-full bg-slate-800 border border-slate-600 text-white p-1.5 rounded text-xs outline-none focus:border-cyan-400 resize-none"
                  />
                </div>
              ))}

              {canAddField && (
                <button
                  type="button"
                  onClick={handleAddCustomFieldRow}
                  className="self-start px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold rounded uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>➕</span> Add Field
                </button>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded uppercase"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded uppercase shadow"
            >
              Add Element
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AutoResizingTextarea = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(38, textareaRef.current.scrollHeight)}px`;
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

const ElementFieldsEditor = ({ activeNode, updateStory }) => {
  const schema = ELEMENT_SCHEMAS[activeNode.type] || [];
  const fields = activeNode.fields || {};
  const customFields = activeNode.customFields || [];

  const [selectorState, setSelectorState] = useState(null); // { key, label, dbSource }
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

  const canAddEditorField = newLabel.trim() !== '';

  const schemaTabs = Array.from(new Set(schema.map(f => f.tab || 'General')));
  const allTabs = [...schemaTabs, 'Custom Fields'];
  const currentTab = allTabs[activeTabIdx] || allTabs[0];

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-slate-900 font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <span>📋</span> {activeNode.type} Focused Fields
        </span>
        <span className="text-[10px] text-slate-400 italic">
          Link Cloud DBM items or type custom content
        </span>
      </div>

      <div className="flex flex-wrap border-b border-slate-700 mb-4 gap-1">
        {allTabs.map((tab, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveTabIdx(idx)}
            className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap flex-1 sm:flex-none text-center ${activeTabIdx === idx ? 'border-b-2 border-cyan-500 text-cyan-400 bg-cyan-950/20' : 'text-slate-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard Schema Fields for Current Tab */}
        {schemaTabs.includes(currentTab) && (
          <div className="md:col-span-2 mb-2 bg-slate-800/30 p-3 rounded border border-slate-800">
            <h4 className="text-cyan-500 text-xs font-bold border-b border-cyan-900/50 pb-1.5 mb-3 uppercase tracking-wider flex items-center gap-2">
              <span className="text-[10px] text-cyan-700">▶</span> {currentTab}
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {schema.filter(f => (f.tab || 'General') === currentTab).map(f => {
                const val = fields[f.key] || '';
                const isRelational = f.type === 'relational' || f.dbSource;

                return (
                  <div key={f.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider">
                        {f.label}
                      </label>
                      {f.dbSource && (
                        <button
                          onClick={() => handleOpenSelector(f)}
                          className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <span>☁️</span> {val ? 'Change Cloud DB Link' : 'Select Cloud DB Item'}
                        </button>
                      )}
                    </div>

                    {isRelational && val && (
                      <div className="mb-2 flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1.5 rounded-md text-xs">
                        <span className="text-cyan-400 font-bold uppercase text-[10px]">☁️ Linked Cloud Record:</span>
                        <span className="text-white font-semibold flex-1 truncate">{val}</span>
                        <button
                          onClick={() => handleChange(f.key, '')}
                          className="text-slate-400 hover:text-red-400 font-bold px-1"
                          title="Unlink Cloud Record"
                        >
                          &times;
                        </button>
                      </div>
                    )}

                    <AutoResizingTextarea
                      value={val}
                      onChange={e => {
                        handleChange(f.key, e.target.value);
                      }}
                      placeholder={f.placeholder}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2.5 rounded-lg text-xs outline-none transition-all leading-relaxed shadow-inner"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Custom Fields */}
        {currentTab === 'Custom Fields' && (
          <>
            {customFields.map(cf => (
              <div key={cf.id} className="md:col-span-2 bg-slate-950/70 border border-cyan-900/50 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={cf.label}
                    onChange={(e) => handleCustomLabelChange(cf.id, e.target.value)}
                    className="bg-transparent text-xs font-bold text-cyan-300 uppercase tracking-wider outline-none border-b border-dashed border-cyan-800/60 focus:border-cyan-400 px-1 py-0.5"
                    placeholder="Custom Field Label..."
                    title="Click to rename field label"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomField(cf.id)}
                    className="text-slate-500 hover:text-red-400 text-xs font-bold px-2 py-0.5 rounded hover:bg-red-950/40"
                    title="Delete custom field"
                  >
                    Delete Field ✕
                  </button>
                </div>
                <AutoResizingTextarea
                  value={cf.value || ''}
                  onChange={e => handleCustomFieldChange(cf.id, e.target.value)}
                  placeholder={`Enter content for ${cf.label || 'custom field'}...`}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-slate-100 p-2.5 rounded-lg text-xs outline-none transition-all leading-relaxed shadow-inner"
                />
              </div>
            ))}

            {/* Add Additional Custom Field Section */}
            <div className="mt-4 p-3 bg-slate-950/90 border border-slate-800 rounded-lg space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>➕</span> Add Additional Custom Field
                </span>
                <span className="text-[10px] text-slate-500 italic">Define user label and field content</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Field Label (e.g. Codename, Threat Rating)"
                  className="bg-slate-900 border border-slate-700 text-cyan-300 p-2 rounded text-xs outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Field Value / Description"
                  className="bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded text-xs outline-none focus:border-cyan-400"
                />
              </div>
              {canAddEditorField && (
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold rounded uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                >
                  <span>➕</span> Add Field
                </button>
              )}
            </div>
          </>
        )}
      </div>

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
    <div className="p-3 bg-[#0d1117]/90 border-b border-slate-800 font-sans space-y-2 shrink-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">🖼️</span>
          <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
            Element Image Asset
          </span>
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wide ${
            isHalfPage 
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' 
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            {isHalfPage ? '80% Width (Half-Page)' : '40% Width (Quarter-Page)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 text-xs font-bold rounded uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm"
          >
            <span>📥</span> {activeNode.imageUrl ? 'Replace Image' : 'Import Image'}
          </button>
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-bold rounded uppercase tracking-wider transition-colors"
          >
            🔗 URL
          </button>
          {activeNode.imageUrl && (
            <button
              onClick={handleClearImage}
              className="px-2 py-1 bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-300 text-xs font-bold rounded uppercase tracking-wider transition-colors"
              title="Remove image from element"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* URL Input Form */}
      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="flex gap-2 mt-2">
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="Paste image web URL (e.g. https://...)"
            className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded uppercase tracking-wider shadow"
          >
            Attach
          </button>
        </form>
      )}

      {/* Image Preview Container with Half-Page (80%) / Quarter-Page (40%) Constraints */}
      {activeNode.imageUrl && (
        <div className="mt-2 flex justify-start">
          <div className={`relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-950 p-1 shadow-md ${
            isHalfPage 
              ? 'w-[80%] max-h-[450px]' 
              : 'w-[40%] max-h-[250px]'
          }`}>
            <img
              src={activeNode.imageUrl}
              alt={activeNode.title || 'Element Image'}
              className="w-full h-full object-contain rounded"
            />
            <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
              {isHalfPage ? '80% Width' : '40% Width'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ScenarioPane = ({ onOpenBastion, onSwitchTab }) => {
  const { universeState, activeScenarioId, setActiveScenarioId, addStory, updateStory, deleteStory, moveStory, reorderStory, reorderRelativeScenario, triggerStorySave, handleSaveStory, handleLoadStory, addMap, setActiveMapId, updateProjectName, isStoryReadOnly, clonePublicStory } = useStory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalParentId, setModalParentId] = useState(null);
  const [localContent, setLocalContent] = useState('');
  const scenarioFileInputRef = useRef(null);
  const mapFileInputRef = useRef(null);
  const elementFileInputRef = useRef(null);

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
  if (activeScenarioId) findNode(universeState.scenarios);

  const locationPath = activeNode ? getBreadcrumbPath(universeState.scenarios, activeNode.id) : null;
  const linkedMap = activeNode?.mapId ? universeState.maps.find(m => m.id === activeNode.mapId) : null;

  const debounceTimerRef = useRef(null);

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

  const handleAddElement = ({ type, title, parentId, customFields }) => {
    const newNode = {
      id: uuidv4(),
      type,
      title,
      content: '',
      fields: {},
      customFields: customFields || [],
      children: []
    };
    addStory(newNode, parentId);
  };

  const handleDeleteElement = (id, title) => {
    let nodeToDelete = null;
    const findNodeById = (nodes) => {
      for (let n of nodes) {
        if (n.id === id) return n;
        if (n.children && n.children.length > 0) {
          const found = findNodeById(n.children);
          if (found) return found;
        }
      }
      return null;
    };
    nodeToDelete = findNodeById(universeState.scenarios);

    const name = title ? `"${title}"` : 'this element';
    const childCount = nodeToDelete && nodeToDelete.children ? nodeToDelete.children.length : 0;
    const childWarning = childCount > 0
      ? ` and its ${childCount} sub-element(s)`
      : '';

    if (window.confirm(`Are you sure you want to delete ${name}${childWarning}? This action cannot be undone.`)) {
      deleteStory(id);
    }
  };

  const handleExportElement = (targetNode = activeNode) => {
    if (!targetNode) return;
    const linkedMapObj = targetNode.mapId ? universeState.maps.find(m => m.id === targetNode.mapId) : null;

    const exportPayload = {
      type: "TangentStoryElement",
      version: "2.0",
      element: targetNode,
      linkedMap: linkedMapObj || null
    };

    const dataStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatExportFilename(targetNode.title, targetNode.type, 'json');
    a.click();
    URL.revokeObjectURL(url);
  };

  const htmlToMarkdown = (htmlStr) => {
    if (!htmlStr) return '';
    return htmlStr
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<ul>(.*?)<\/ul>/gi, (m, p1) => p1.replace(/<li>(.*?)<\/li>/gi, '- $1\n') + '\n')
      .replace(/<ol>(.*?)<\/ol>/gi, (m, p1) => {
        let idx = 1;
        return p1.replace(/<li>(.*?)<\/li>/gi, () => `${idx++}. $1\n`) + '\n';
      })
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '*$1*')
      .replace(/<s>(.*?)<\/s>/gi, '~~$1~~')
      .replace(/<strike>(.*?)<\/strike>/gi, '~~$1~~')
      .replace(/<u>(.*?)<\/u>/gi, '__$1__')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleExportMarkdown = (targetNode = activeNode) => {
    if (!targetNode) return;

    const buildNodeMD = (node, depth = 1) => {
      const headingPrefix = '#'.repeat(Math.min(depth, 6));
      let md = `${headingPrefix} [${node.type || 'Element'}] ${node.title || 'Untitled'}\n\n`;

      const schema = ELEMENT_SCHEMAS[node.type];
      if (schema && node.fields) {
        let fieldsMd = '';
        schema.forEach(fieldDef => {
          const val = node.fields[fieldDef.key];
          if (val && val.trim()) {
            fieldsMd += `- **${fieldDef.label}:** ${val.trim()}\n`;
          }
        });
        if (fieldsMd) {
          md += `${fieldsMd}\n`;
        }
      }

      if (node.content) {
        md += `${htmlToMarkdown(node.content)}\n\n`;
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          md += buildNodeMD(child, depth + 1);
        });
      }
      return md;
    };

    const fullMD = `# TANGENT SFF RPG — Story Module: ${universeState.projectName || 'Campaign'}\n\n` + buildNodeMD(targetNode, 2);

    const blob = new Blob([fullMD], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatExportFilename(targetNode.title || 'story', targetNode.type || 'module', 'md');
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = (targetNode = activeNode) => {
    if (!targetNode) return;
    const locationPath = getBreadcrumbPath(universeState.scenarios, targetNode.id);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Please allow popups to export printable PDF.");

    const buildNodeHTML = (node, depth = 2) => {
      const headingTag = `h${Math.min(depth, 6)}`;
      let html = `<div style="margin-bottom: 24px; page-break-inside: avoid;">`;
      html += `<${headingTag} style="color: #0284c7; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">`;
      html += `<span style="font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; margin-right: 8px;">${node.type || 'Element'}</span>`;
      html += `${node.title || 'Untitled'}</${headingTag}>`;

      const schema = ELEMENT_SCHEMAS[node.type];
      if (schema && node.fields) {
        let fieldsHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-bottom: 12px; font-size: 12px;">';
        let hasFields = false;
        schema.forEach(fieldDef => {
          const val = node.fields[fieldDef.key];
          if (val && val.trim()) {
            hasFields = true;
            fieldsHTML += `<div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 4px;">`;
            fieldsHTML += `<strong style="color: #0369a1; display: block; font-size: 10px; text-transform: uppercase;">${fieldDef.label}</strong>`;
            fieldsHTML += `<span style="color: #0f172a;">${val.trim()}</span></div>`;
          }
        });
        fieldsHTML += '</div>';
        if (hasFields) html += fieldsHTML;
      }

      if (node.content) {
        html += `<div style="font-family: inherit; font-size: 14px; line-height: 1.6; color: #334155;">${node.content}</div>`;
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          html += buildNodeHTML(child, depth + 1);
        });
      }
      html += `</div>`;
      return html;
    };

    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tangent SFF RPG - ${targetNode.title}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; background: #fff; }
            .header { border-bottom: 3px solid #0284c7; padding-bottom: 12px; margin-bottom: 24px; }
            .title { font-size: 26px; font-weight: bold; color: #0369a1; text-transform: uppercase; letter-spacing: 1px; }
            .subtitle { font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; }
            .path { font-size: 11px; font-family: monospace; color: #475569; margin-top: 6px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="subtitle">Tangent Science Fantasy Roleplay — Story Module</div>
            <div class="title">${targetNode.title}</div>
            <div class="path">Location Path: ${locationPath ? locationPath.join(' ❯ ') : 'Root'}</div>
          </div>
          ${buildNodeHTML(targetNode)}
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(fullHTML);
    printWindow.document.close();
  };

  const handleImportElementFile = (e, parentId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        let rawElement = null;
        let linkedMapData = data.linkedMap || null;

        if ((data.type === "TangentStoryElement" || data.type === "TangentStoryComponent") && (data.element || data.component)) {
          rawElement = data.element || data.component;
        } else if (data.id && data.title && data.type) {
          rawElement = data;
        }

        if (!rawElement) {
          alert("Invalid story element file format.");
          return;
        }

        const mapIdRemap = {};
        if (linkedMapData) {
          const newMapId = uuidv4();
          mapIdRemap[linkedMapData.id] = newMapId;
          const newMap = { ...linkedMapData, id: newMapId };
          addMap(newMap);
        }

        const cloneWithNewIds = (node) => {
          const newId = uuidv4();
          return {
            ...node,
            id: newId,
            mapId: mapIdRemap[node.mapId] || node.mapId || null,
            children: node.children ? node.children.map(child => cloneWithNewIds(child)) : []
          };
        };

        const importedElement = cloneWithNewIds(rawElement);
        addStory(importedElement, parentId);
        setActiveScenarioId(importedElement.id);
      } catch (err) {
        console.error("Element import error:", err);
        alert("Failed to parse element file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
            updateStory(activeNode.id, { mapId: mapId });
            setActiveMapId(mapId);
          } else {
            alert("Invalid map JSON file format.");
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
      title: `${activeNode.title || 'Untitled'} Map`,
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

  return (
    <div className="h-full bg-slate-900 flex flex-col relative overflow-hidden" onBlur={triggerStorySave}>
      <style>{`
        .quill-dark-wrapper .ql-toolbar.ql-snow {
          position: relative;
          z-index: 20;
          background-color: #0f172a;
          border-color: #334155;
          border-top: none;
          border-left: none;
          border-right: none;
          padding: 6px 12px;
        }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-stroke {
          stroke: #94a3b8;
        }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-fill {
          fill: #94a3b8;
        }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-picker {
          color: #94a3b8;
        }
        .quill-dark-wrapper .ql-toolbar.ql-snow .ql-picker-options {
          background-color: #1e293b;
          border-color: #334155;
          color: #f1f5f9;
          z-index: 100 !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
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
          padding: 1.25rem;
        }
        .quill-dark-wrapper .ql-editor.ql-blank::before {
          color: #64748b;
          font-style: italic;
        }
      `}</style>

      {isStoryReadOnly && (
        <div className="bg-amber-950/90 border-b border-amber-500/50 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-amber-200 shrink-0 shadow-lg z-20">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">🌐</span>
            <span>
              <strong>PUBLIC READ-ONLY STORY:</strong> "{universeState.projectName || 'Untitled'}" by <strong className="text-amber-400">{universeState.authorEmail || universeState.authorHandle || 'Community Creator'}</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => clonePublicStory(universeState)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded uppercase shadow text-[11px] transition-colors flex items-center gap-1"
            >
              <span>➕</span> Clone to My Foundry
            </button>
          </div>
        </div>
      )}

      <AddElementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddElement} 
        defaultParentId={modalParentId}
      />

      <Split
        sizes={[35, 65]}
        minSize={[280, 250]}
        expandToMin={false}
        gutterSize={8}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
        className="flex-1 flex w-full h-full split-horizontal"
      >
        {/* Left Sidebar: Contents Tree */}
        <div className="h-full flex flex-col bg-slate-900 border-r border-slate-800 min-w-0">
          <div className="p-2.5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60 shrink-0 gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none mb-0.5">Story Module</span>
              <input 
                type="text" 
                value={universeState.projectName || ''}
                onChange={(e) => updateProjectName(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 hover:text-white focus:bg-slate-900 px-1 rounded outline-none truncate w-32 sm:w-36 transition-colors border-b border-transparent focus:border-amber-500"
                placeholder="Story Module Name..."
                title="Click to rename Story Module"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <input 
                type="file" 
                accept=".json" 
                ref={elementFileInputRef} 
                className="hidden" 
                onChange={(e) => handleImportElementFile(e, null)}
              />
              <button 
                onClick={() => elementFileInputRef.current?.click()}
                title="Import Individual Element JSON File"
                className="px-2 py-0.5 bg-[#22d3ee]/20 hover:bg-[#22d3ee]/30 border border-[#22d3ee]/50 text-[#22d3ee] text-[10px] font-bold rounded uppercase transition-colors"
              >
                📥 Import
              </button>
              <button 
                onClick={() => handleOpenAddModal(activeScenarioId)}
                className="px-2 py-0.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-400 hover:text-amber-300 text-[10px] font-bold rounded uppercase transition-colors"
              >
                + Add Element
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto py-2 px-1">
            {universeState.scenarios.length === 0 ? (
              <div className="text-slate-500 text-xs text-center italic mt-10 p-4">
                No elements yet.<br/>Click "+ Add" or "📥 Import" to start building your story module.
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
                    onReorder={reorderStory}
                    onReorderRelative={reorderRelativeScenario}
                    onAddChild={handleOpenAddModal}
                    onExport={handleExportElement}
                    onExportMD={handleExportMarkdown}
                    onExportPDF={handleExportPDF}
                  />
                ))}
                <div 
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData('text/plain');
                    if (draggedId) moveStory(draggedId, null);
                  }}
                  className="mt-6 p-2.5 border border-dashed border-slate-800 hover:border-amber-500/60 rounded text-center text-[10px] text-slate-500 uppercase tracking-wider hover:text-amber-400 transition-colors"
                >
                  📥 Drop here to move element to Top Level (Root)
                </div>
              </>
            )}
          </div>
          {/* Bastion AI Button at bottom of Left Sidebar */}
          <div className="mt-auto pt-3 pb-2 px-3 border-t border-slate-800 bg-slate-950/80 shrink-0">
            <button
              type="button"
              onClick={() => onOpenBastion('chat')}
              className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 rounded-lg text-xs font-bold uppercase tracking-wider text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)] transition-all flex items-center justify-center gap-2"
            >
              <span>🤖</span> BASTION AI
            </button>
            <div className="pt-2 text-[10px] text-slate-500 font-mono text-center">
              WOLFE.BT@TANGENTLLC
            </div>
          </div>
        </div>

        {/* Right Area: Dark Mode Editor */}
        <div className="h-full flex flex-col bg-slate-900 quill-dark-wrapper overflow-hidden">
          {!activeNode ? (
            <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-500 italic text-sm">
              Select an element from Contents to edit
            </div>
          ) : (
            <>
              {/* Header Title Bar */}
              <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-[220px]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded shrink-0">
                    {activeNode.type}
                  </span>
                  <input 
                    type="text" 
                    value={activeNode.title}
                    onChange={handleTitleChange}
                    className="flex-1 text-base font-bold bg-transparent border-none outline-none text-white placeholder-slate-500 min-w-[150px]"
                    placeholder="Element Title..."
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal(activeNode.id)}
                    title="Add Sub-Element inside this element"
                    className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-300 text-xs font-bold rounded uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <span>➕</span> Sub-Element
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteElement(activeNode.id, activeNode.title)}
                    title="Delete this element"
                    className="px-2.5 py-1 bg-red-950/70 hover:bg-red-900 border border-red-700/70 text-red-300 hover:text-red-200 text-xs font-bold rounded uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>🗑️</span> Delete Element
                  </button>
                </div>
              </div>

              {/* Location Path Bar */}
              <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs gap-3 flex-wrap shrink-0">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] truncate">
                  <span className="text-amber-500 font-bold">📍 Path:</span>
                  <span className="text-slate-200 font-sans font-medium">
                    {locationPath ? locationPath.join(' ❯ ') : 'Top Level'}
                  </span>
                  <span className="text-slate-500 italic text-[10px] ml-1 shrink-0 hidden sm:inline">
                    (Drag & drop in Contents sidebar to change location)
                  </span>
                </div>
              </div>

              {/* Universal Element Image Asset Uploader */}
              <ElementImageUploader activeNode={activeNode} updateStory={updateStory} />

              {/* Type-Specific Structured Input Fields Editor */}
              <ElementFieldsEditor activeNode={activeNode} updateStory={updateStory} />

              {/* Prose Drafting Canvas (ReactQuill) - Only for Scenario (folder/story root) types */}
              {activeNode.type === 'Scenario' && (
                <div className="flex-1 flex flex-col min-h-0 bg-[#090d16] border-y border-slate-800 relative z-10">
                  <ReactQuill 
                    theme="snow"
                    value={activeNode.content || ''}
                    onChange={(val) => updateStory(activeNode.id, { content: val })}
                    modules={modules}
                    className="h-full flex flex-col"
                    placeholder="Draft your story prose, scene description, or element details here..."
                  />
                </div>
              )}

              {/* Connected Map Asset Integration Box for Map Elements */}
              {activeNode.type === 'Map' && (
                <div className="p-3 bg-[#0d1117]/90 border-b border-cyan-500/40 font-sans space-y-3 shrink-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🗺️</span>
                      <span className="text-xs font-bold uppercase text-cyan-300 tracking-wider">
                        Connected Map Asset
                      </span>
                    </div>
                    {linkedMap && (
                      <button
                        onClick={() => {
                          setActiveMapId(linkedMap.id);
                          if (onSwitchTab) onSwitchTab('map');
                        }}
                        className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-200 text-xs font-bold rounded uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(34,211,238,0.3)] flex items-center gap-1.5"
                      >
                        <span>🚀</span> Open in Map Maker
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    {/* Select Existing Map Dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">
                        Link Existing Project Map:
                      </label>
                      <select
                        value={activeNode.mapId || ''}
                        onChange={(e) => updateStory(activeNode.id, { mapId: e.target.value || null })}
                        className="bg-slate-950 border border-slate-700 text-slate-200 text-xs p-2 rounded outline-none focus:border-cyan-400 relative z-10"
                      >
                        <option value="">-- No Map Linked --</option>
                        {universeState.maps.map(m => (
                          <option key={m.id} value={m.id}>
                            🗺️ {m.title} ({m.gridMode || 'Square'} grid)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Import / Load Map Options */}
                    <div className="flex items-end gap-2">
                      <input
                        type="file"
                        accept=".json,image/*"
                        ref={mapFileInputRef}
                        className="hidden"
                        onChange={handleMapFileImport}
                      />
                      <button
                        onClick={() => mapFileInputRef.current?.click()}
                        title="Import JSON Map File or Image Map into Element"
                        className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>📥</span> Import Map / Image File
                      </button>
                      <button
                        onClick={handleCreateNewMapForElement}
                        title="Create New Map in Map Maker"
                        className="py-2 px-3 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/60 text-amber-300 text-xs font-bold rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                      >
                        <span>➕</span> New Map
                      </button>
                    </div>
                  </div>

                  {/* Linked Map Summary Card */}
                  {linkedMap ? (
                    <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400 font-bold text-xs">📍 Linked Map: {linkedMap.title}</span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                          Grid: {linkedMap.gridMode || 'Square'}
                        </span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                          Objects: {(linkedMap.objects?.length || 0) + (linkedMap.tokens?.length || 0)}
                        </span>
                      </div>
                      <button
                        onClick={() => updateStory(activeNode.id, { mapId: null })}
                        className="text-slate-500 hover:text-red-400 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-red-950/40"
                        title="Unlink Map from Element"
                      >
                        Unlink ✕
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-950/60 border border-dashed border-slate-800 rounded text-center text-xs text-slate-500 italic">
                      No map linked to this Map element. Link an existing map from Map Maker above, import a Map JSON/image file, or click + New Map.
                    </div>
                  )}
                </div>
              )}

            </>
          )}
        </div>
      </Split>
    </div>
  );
};

export default ScenarioPane;

