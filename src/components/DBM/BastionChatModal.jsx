import React, { useState } from 'react';
import { generateSelectiveFields } from '../../services/bastionService';

const PRESETS = [
  { label: 'Alien Species', prompt: 'Biological alien species originating from an extreme gravity environment with specialized natural armor and environmental adaptions.' },
  { label: 'High-Tech Weapon', prompt: 'TL-4 directed energy plasma rifle with armor-piercing capabilities, overcharge mode, and modular rail attachment slots.' },
  { label: 'Shadow Syndicate', prompt: 'Covert faction operating in the outer rim specializing in cybernetics smuggling, black-market data trades, and info warfare.' },
  { label: 'Meta-Psi Invocation', prompt: 'ML-3 psionic invocation that projects kinetic force barriers and telekinetically deflects incoming projectile fire.' },
  { label: 'Subterranean Outpost', prompt: 'Fortified subterranean research facility guarded by automated defense turrets, sensor grids, and biometric security doors.' }
];

export const BastionChatModal = ({
  isOpen,
  onClose,
  messages,
  input,
  setInput,
  onSend,
  currentKey = 'rules_codex',
  currentConfig = {},
  selectedItem = null,
  isEntryModalOpen = false,
  editFormData = {},
  setEditFormData,
  handleCreateNew
}) => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'generator'
  const [genPrompt, setGenPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState(null);
  const [overwriteMode, setOverwriteMode] = useState(false);

  // Safe fallbacks
  const safeConfig = currentConfig || {};
  const safeFormData = editFormData || {};
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Structural, ID, ordering, or calculated fields that MUST NOT be generative options
  const NON_GENERATIVE_FIELDS = [
    'order', 'parent', 'parententry', 'parentid', 'parentcategory', 
    'id', '_id', 'uuid', 'created_at', 'updated_at', 'createdat', 'updatedat', 
    'system', 'isparent', 'subitems', 'directory_columns'
  ];

  // Available generative fields for current schema
  const schemaFields = safeConfig.fields
    ? Object.keys(safeConfig.fields).filter(fKey => {
        const fieldDef = safeConfig.fields[fKey];
        if (!fieldDef) return false;
        if (fieldDef.manageable === false) return false;
        if (fieldDef.type === 'readonlytext') return false;
        if (fieldDef.aiEnabled === false) return false;
        if (NON_GENERATIVE_FIELDS.includes(fKey.toLowerCase())) return false;
        return true;
      })
    : [];

  const availableFields = Array.from(
    new Set(['name', 'description', ...schemaFields])
  ).filter(fKey => !NON_GENERATIVE_FIELDS.includes(fKey.toLowerCase()));

  // Default selected fields
  const [selectedFields, setSelectedFields] = useState({
    name: true,
    description: true,
    type: true
  });

  if (!isOpen) return null;

  const toggleField = (fieldKey) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  // Helper to check if a database field currently has non-empty text
  const hasFieldContent = (key) => {
    const val = safeFormData[key];
    if (val === undefined || val === null) return false;
    if (typeof val === 'string') return Boolean(val.trim());
    if (typeof val === 'number') return true;
    if (Array.isArray(val)) return val.length > 0;
    return Boolean(val);
  };

  // Select all blank fields helper
  const selectBlankOnly = () => {
    const newSelected = {};
    availableFields.forEach(fKey => {
      newSelected[fKey] = !hasFieldContent(fKey);
    });
    setSelectedFields(newSelected);
  };

  // Clear all selections
  const clearAllFields = () => {
    setSelectedFields({});
  };

  const handleGenerate = async () => {
    let fieldsToGen = Object.keys(selectedFields).filter(k => selectedFields[k]);
    if (fieldsToGen.length === 0) {
      setGenStatus({ error: 'Please select at least one database field to generate.' });
      return;
    }

    if (!genPrompt.trim()) {
      setGenStatus({ error: 'Please enter a prompt or select a quick preset before generating.' });
      return;
    }

    // Overwrite Protection Filter: If overwriteMode is false, filter out fields that already have content
    if (!overwriteMode) {
      const emptyFieldsOnly = fieldsToGen.filter(k => !hasFieldContent(k));
      if (emptyFieldsOnly.length === 0) {
        setGenStatus({ error: 'All selected database fields already contain content! Enable "⚡ Allow Overwrite" mode to replace existing content, or select blank fields.' });
        return;
      }
      fieldsToGen = emptyFieldsOnly;
    }

    setIsGenerating(true);
    setGenStatus(null);

    const currentValues = {
      ...(editFormData || {})
    };

    const categoryLabel = safeConfig.label || currentKey || 'Database Entry';

    const result = await generateSelectiveFields({
      selectedFields: fieldsToGen,
      currentValues,
      userPrompt: genPrompt,
      elementType: categoryLabel
    });

    setIsGenerating(false);

    if (result.success) {
      // If modal is not open, open modal as a new item first
      if (!isEntryModalOpen && handleCreateNew) {
        handleCreateNew();
      }

      // Update form data in DBMItemModal
      if (setEditFormData) {
        setEditFormData(prev => ({
          ...prev,
          ...result.generated
        }));
      }

      setGenStatus({
        success: `BASTION generated database content for: [${Object.keys(result.generated).join(', ')}]. Form fields populated!`
      });
    } else {
      setGenStatus({ error: result.error || 'Generation failed.' });
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 left-0 z-50 w-80 sm:w-[440px] bg-[#0d1117] border-r border-cyan-500/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col font-sans backdrop-blur-md">
        {/* Header */}
        <div className="p-3.5 bg-slate-950 border-b border-cyan-900/60 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
              <span>🤖</span> BASTION Tactical AI
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-red-400 text-xl font-bold leading-none px-2 transition-colors"
            title="Close BASTION Panel"
          >
            &times;
          </button>
        </div>

        {/* Mode Selection Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 p-1 gap-1 shrink-0">
          <button
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              activeTab === 'chat'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chatbot
          </button>
          <button
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              activeTab === 'generator'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab('generator')}
          >
            ⚡ Generator
          </button>
        </div>

        {/* Tab 1: Chatbot */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d1117]/90 text-xs font-mono">
              {safeMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">
                    {msg.role === 'user' ? 'ARCHITECT' : 'BASTION System'}
                  </span>
                  <div className={`max-w-[85%] rounded-lg p-3 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 rounded-br-none font-sans'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none font-sans'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 shrink-0">
              <input
                type="text"
                value={input || ''}
                onChange={e => setInput && setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSend && onSend()}
                placeholder="Ask Bastion about rules or lore..."
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded text-xs outline-none focus:border-cyan-400 font-mono"
              />
              <button 
                onClick={() => onSend && onSend()} 
                className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold rounded text-xs uppercase tracking-wider transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Generator */}
        {activeTab === 'generator' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 text-xs">
            {/* Category & Item Context */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                  Target Category
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold uppercase">
                  {safeConfig.label || currentKey || 'Database Entry'}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-300 truncate">
                {isEntryModalOpen ? `Editing: ${safeFormData.name || 'Untitled Entry'}` : 'Creating New Entry'}
              </div>
            </div>

            {/* Overwrite Protection Setting */}
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">
                  Overwrite Protection
                </span>
                <span className="text-[9px] text-slate-400">
                  {overwriteMode ? 'Will replace existing field text' : 'Safely fills blank fields only'}
                </span>
              </div>
              <button
                onClick={() => setOverwriteMode(!overwriteMode)}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 ${
                  overwriteMode 
                    ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                    : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                }`}
              >
                <span>{overwriteMode ? '⚡ Overwrite Allowed' : '🛡️ Fill Blank Only'}</span>
              </button>
            </div>

            {/* Field Checkboxes */}
            <div className="bg-slate-900/90 border border-cyan-900/50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                  Select Fields to Generate:
                </span>
                <div className="flex gap-2">
                  <button onClick={selectBlankOnly} className="text-[9px] text-cyan-400 hover:text-cyan-300 underline font-bold uppercase">
                    + Blank Only
                  </button>
                  <span className="text-slate-600">|</span>
                  <button onClick={clearAllFields} className="text-[9px] text-slate-400 hover:text-slate-200 underline font-bold uppercase">
                    Clear
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[170px] overflow-y-auto pr-1">
                {availableFields.map(fKey => {
                  const label = safeConfig.fields?.[fKey]?.label || fKey;
                  return (
                    <label key={fKey} className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={!!selectedFields[fKey]}
                          onChange={() => toggleField(fKey)}
                          className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 shrink-0"
                        />
                        <span className="font-semibold text-xs truncate capitalize">{label}</span>
                      </div>
                      {hasFieldContent(fKey) ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono shrink-0">Has Content</span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono shrink-0">Blank</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Presets */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                Quick Category Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGenPrompt(preset.prompt)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                BASTION Entry Prompt:
              </label>
              <textarea
                rows={3}
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                placeholder="Describe desired entry traits, mechanics, lore, tech level, or rules parameters..."
                className="bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2.5 rounded text-xs outline-none font-sans"
              />
            </div>

            {/* Status Message */}
            {genStatus && (
              <div className={`p-2.5 rounded border text-xs leading-relaxed ${
                genStatus.error 
                  ? 'bg-red-950/60 border-red-800 text-red-300' 
                  : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              }`}>
                {genStatus.error || genStatus.success}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold uppercase text-xs rounded tracking-widest transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>BASTION Generating Entry Fields...</span>
                </>
              ) : (
                <span>⚡ Generate Database Entry</span>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
