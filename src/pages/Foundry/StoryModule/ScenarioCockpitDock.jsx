/**
 * @file ScenarioCockpitDock.jsx
 * @description Inspector and Schema Field Editors for the ADE Scenario Cockpit Dock.
 * Houses the auto-resizing textareas, image uploaders/previews, type-specific schema
 * tabs, custom field ledgers, relational database selectors, and AIME co-pilot guidance.
 */

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ELEMENT_SCHEMAS } from '../ElementForge/elementSchemas';
import { isHalfPageElement } from './exportUtils';
import { showToast } from '../../../context/ToastContext';
import { ElementSelectorModal as UnifiedRelationalSelectorModal } from '../ElementForge/ElementSelectorModal';
import { ModularCharacterAssembler } from '../ElementForge/components/ModularCharacterAssembler';
import { NpcScriptBuilder } from '../ElementForge/components/NpcScriptBuilder';
import { AimeGuidanceButton } from '../../../components/StoryFoundry/AimeGuidanceButton';
import { AimeGuidanceFlyout } from '../../../components/StoryFoundry/AimeGuidanceFlyout';

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
