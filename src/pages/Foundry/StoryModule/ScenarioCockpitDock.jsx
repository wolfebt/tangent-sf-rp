/**
 * @file ScenarioCockpitDock.jsx
 * @description Inspector and Schema Field Editors for the ADE Scenario Cockpit Dock.
 * Houses the auto-resizing textareas, image uploaders/previews, type-specific schema
 * tabs, custom field ledgers, relational database selectors, and AIME co-pilot guidance.
 */

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ELEMENT_SCHEMAS, getTypePillStyle } from '../ElementForge/elementSchemas';
import { isHalfPageElement } from './exportUtils';
import { showToast } from '../../../context/ToastContext';
import { ElementSelectorModal as UnifiedRelationalSelectorModal } from '../ElementForge/ElementSelectorModal';
import { ModularCharacterAssembler } from '../ElementForge/components/ModularCharacterAssembler';
import { NpcScriptBuilder } from '../ElementForge/components/NpcScriptBuilder';
import { AimeGuidanceButton } from '../../../components/StoryFoundry/AimeGuidanceButton';
import { AimeGuidanceFlyout } from '../../../components/StoryFoundry/AimeGuidanceFlyout';
import { AudioService } from '../../../services/audioService';
import AIMEChatBox from '../AIME/AIMEChatBox';
import { 
  FileText, 
  Swords, 
  Box, 
  Sparkles, 
  X, 
  Search, 
  Plus, 
  ExternalLink, 
  PanelRightClose 
} from 'lucide-react';

// ── AUTO-RESIZING TEXTAREA ──
export const AutoResizingTextarea = ({ value, onChange, placeholder, className }) => {
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
export const ElementImageUploader = ({ activeNode, updateStory }) => {
  const fileInputRef = useRef(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  const isHalfPage = isHalfPageElement(activeNode.type);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({ type: 'warning', text: 'Please select a valid image file.' });
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
export const ElementFieldsEditor = ({ activeNode, updateStory }) => {
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

  const [isAimeOpen, setIsAimeOpen] = useState(false);
  const schemaTabs = Array.from(new Set(schema.map(f => f.tab || 'General')));
  const allTabs = [...schemaTabs, 'Custom Fields'];
  const currentTab = allTabs[activeTabIdx] || allTabs[0];

  return (
    <div className="p-3 font-mono space-y-3">
      {/* Category Pills & AIME */}
      <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-800 flex-wrap">
        <div className="flex flex-wrap gap-1">
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
        <AimeGuidanceButton size="xs" onClick={() => setIsAimeOpen(true)} label="AIME" />
      </div>

      {/* Schema Fields & Interactive Modules */}
      {schemaTabs.includes(currentTab) && (
        <div className="space-y-3">
          {/* Modular Character Matrix (MCM) Interactive Assembler */}
          {activeNode.type === 'Persona' && currentTab === 'Modular Assembly (MCM)' && (
            <ModularCharacterAssembler
              fields={fields}
              onFieldChange={handleChange}
              elementTitle={activeNode.title}
              onOpenAimeGuidance={() => setIsAimeOpen(true)}
            />
          )}

          {/* Autonomous VTT Script & Relations Builder */}
          {activeNode.type === 'Persona' && currentTab === 'Relations & Scripting' && (
            <NpcScriptBuilder
              fields={fields}
              onFieldChange={handleChange}
              elementTitle={activeNode.title}
              onOpenAimeGuidance={() => setIsAimeOpen(true)}
            />
          )}
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

      {isAimeOpen && (
        <AimeGuidanceFlyout
          isOpen={isAimeOpen}
          onClose={() => setIsAimeOpen(false)}
          targetType={currentTab.includes('Script') ? 'VttScript' : (currentTab.includes('Relations') ? 'Relations' : (activeNode.type === 'Persona' ? 'Persona' : 'Story'))}
          contextData={activeNode}
          onApplyGuidance={(sug) => {
            if (!activeNode.content) {
              updateStory(activeNode.id, { content: sug });
            } else if (!fields.summary) {
              handleChange('summary', sug.slice(0, 180));
            }
          }}
        />
      )}
    </div>
  );
};

// ── MASTER COCKPIT DOCK PANEL (Right Column) ──
export const ScenarioCockpitDockPanel = ({
  isRightDockOpen,
  onToggleRightDock,
  dockTab,
  setDockTab,
  activeNode,
  updateStory,
  elementsCatalog = [],
  handleToggleLinkElement,
  linkedMap,
  allAvailableMaps = [],
  setActiveMapId,
  setScenarioWorkspaceTab,
  mapFileInputRef,
  handleCreateNewMapForElement,
  elementSearch,
  setElementSearch,
  selectedElementTypeFilter,
  setSelectedElementTypeFilter,
  filteredCatalog = [],
  handleInsertMention,
  setEditingModalElement,
  setIsEditElementModalOpen,
  onSwitchView,
  universeState
}) => {
  if (!isRightDockOpen) return null;

  return (
    <aside className="w-80 xl:w-96 flex-shrink-0 bg-slate-900/98 border-l border-slate-800 flex flex-row h-full z-20 backdrop-blur-xl shadow-2xl transition-all">
      {/* Main Content Column of Right Dock */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-slate-900/90">
        {/* Dock Content Header */}
        <div className="p-2 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-1 shrink-0 font-mono">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            {dockTab === 'inspector' && (
              <span className="text-cyan-300 flex items-center gap-1">
                <FileText size={13} className="text-cyan-400" />
                <span>Inspector &amp; Fields</span>
              </span>
            )}
            {dockTab === 'tactical' && (
              <span className="text-amber-300 flex items-center gap-1">
                <Swords size={13} className="text-amber-400" />
                <span>Tactical Encounter</span>
              </span>
            )}
            {dockTab === 'elements' && (
              <span className="text-purple-300 flex items-center gap-1">
                <Box size={13} className="text-purple-400" />
                <span>World Elements</span>
              </span>
            )}
            {dockTab === 'aime' && (
              <span className="text-amber-300 flex items-center gap-1">
                <Sparkles size={13} className="text-amber-400" />
                <span>AIME Co-Pilot</span>
              </span>
            )}
          </div>
          {onToggleRightDock && (
            <button
              type="button"
              onClick={onToggleRightDock}
              className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-850 rounded transition-colors cursor-pointer"
              title="Close Cockpit Dock (])"
            >
              <X size={13} />
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

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setActiveMapId(linkedMap.id);
                        setScenarioWorkspaceTab('weaver');
                      }}
                      className="w-full p-2.5 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/60 text-cyan-200 text-xs font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      title="Open tactical map and events in Story Weaver"
                    >
                      <span>🌟</span> Open in Story Weaver
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

                  {allAvailableMaps && allAvailableMaps.length > 0 && (
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                        Link Map from Catalog:
                      </label>
                      <select
                        value={activeNode?.mapId || ''}
                        onChange={(e) => updateStory(activeNode.id, { mapId: e.target.value || null })}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs p-2 rounded-xl outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="">-- Select Map from Catalog ({allAvailableMaps.length}) --</option>
                        {allAvailableMaps.map(m => (
                          <option key={m.id} value={m.id}>
                            🗺️ {m.title || 'Untitled Map'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => mapFileInputRef?.current?.click()}
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
                    onClick={() => setScenarioWorkspaceTab('tactical')}
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
      </div>

      {/* Dedicated Right-Side Cockpit Navigation Rail */}
      <div className="w-14 shrink-0 bg-slate-950 border-l border-slate-800 flex flex-col items-center py-2 gap-2 select-none z-10">
        {/* Top Close / Collapse Indicator */}
        {onToggleRightDock && (
          <button
            type="button"
            onClick={onToggleRightDock}
            className="w-10 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-850 transition-colors cursor-pointer mb-1"
            title="Collapse Cockpit Dock (])"
          >
            <PanelRightClose size={14} />
          </button>
        )}

        {/* TAB 1: Inspector */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            setDockTab('inspector');
          }}
          className={`w-11 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative cursor-pointer ${
            dockTab === 'inspector'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
          title="Element Fields & Image Inspector"
        >
          {dockTab === 'inspector' && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-l shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          )}
          <FileText size={16} className={dockTab === 'inspector' ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-300'} />
          <span className="text-[9px] font-bold tracking-tight uppercase leading-none font-mono">
            Inspect
          </span>
        </button>

        {/* TAB 2: Tactical */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            setDockTab('tactical');
          }}
          className={`w-11 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative cursor-pointer ${
            dockTab === 'tactical'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
          title="Tactical Map & Encounter Integration"
        >
          {dockTab === 'tactical' && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-400 rounded-l shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          )}
          <Swords size={16} className={dockTab === 'tactical' ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-300'} />
          <span className="text-[9px] font-bold tracking-tight uppercase leading-none font-mono">
            Tactical
          </span>
        </button>

        {/* TAB 3: World Elements */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            setDockTab('elements');
          }}
          className={`w-11 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative cursor-pointer ${
            dockTab === 'elements'
              ? 'bg-purple-950/80 text-purple-300 border border-purple-500/80 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
          title="In-Situ Worldbuilding Elements"
        >
          {dockTab === 'elements' && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-purple-400 rounded-l shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          )}
          <Box size={16} className={dockTab === 'elements' ? 'text-purple-300' : 'text-slate-400 group-hover:text-purple-300'} />
          <span className="text-[9px] font-bold tracking-tight uppercase leading-none font-mono">
            World
          </span>
        </button>

        {/* TAB 4: AIME Assistant */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.02);
            setDockTab('aime');
          }}
          className={`w-11 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative cursor-pointer ${
            dockTab === 'aime'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
          title="AI Story Assistant & Overseer"
        >
          {dockTab === 'aime' && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-400 rounded-l shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          )}
          <Sparkles size={16} className={dockTab === 'aime' ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-300'} />
          <span className="text-[9px] font-bold tracking-tight uppercase leading-none font-mono">
            AIME
          </span>
        </button>
      </div>
    </aside>
  );
};

