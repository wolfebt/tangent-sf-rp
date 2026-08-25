import React, { useState, useMemo, useEffect } from 'react';
import { useDBM } from '../../context/DBMContext';
import { categoryConfig } from '../../components/DBM/categoryConfig';
import { 
  OMNICORTEX_DATASETS, 
  getDatasetByKey, 
  validateDatasetPayload, 
  sanitizePayloadStrings 
} from './codexPromptRegistry';
import { adaptSparkItemToFirestore, sanitizeDocumentId } from '../../utils/codexIngestionAdapters';
import { fetchGeminiContent, getGeminiApiKey } from '../../services/bastionService';
import { AudioService } from '../../services/audioService';
import { 
  Database, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Code, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  Table, 
  Bot, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  Trash2, 
  Eye, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';

export const CodexIngestionEngine = ({ initialDatasetKey = 'species' }) => {
  const { dbData, saveEntry } = useDBM() || {};

  // State
  const [selectedDatasetKey, setSelectedDatasetKey] = useState(initialDatasetKey);
  const [activeTab, setActiveTab] = useState('json'); // 'json' | 'ai' | 'table' | 'prompt'
  const [conflictStrategy, setConflictStrategy] = useState('merge'); // 'merge' | 'overwrite' | 'skip'
  
  // Inputs
  const [rawJsonText, setRawJsonText] = useState('');
  const [rawAiText, setRawAiText] = useState('');
  const [rawTableText, setRawTableText] = useState('');
  const [defaultTL, setDefaultTL] = useState(3);
  const [defaultCategory, setDefaultCategory] = useState('');
  
  // Processing & Results
  const [parsedItems, setParsedItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [validationReport, setValidationReport] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectionProgress, setInjectionProgress] = useState({ current: 0, total: 0 });
  const [injectionResults, setInjectionResults] = useState(null);
  
  // UI state
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedJsonIds, setExpandedJsonIds] = useState(new Set());

  const currentDataset = useMemo(() => getDatasetByKey(selectedDatasetKey), [selectedDatasetKey]);
  const targetCollection = currentDataset.targetCollection;

  // Existing items in Omnicortex for duplicate detection
  const existingCollectionItems = useMemo(() => {
    if (!dbData || !targetCollection) return [];
    return dbData[targetCollection] || [];
  }, [dbData, targetCollection]);

  const existingIdsMap = useMemo(() => {
    const map = new Map();
    existingCollectionItems.forEach(item => {
      if (item.id) map.set(item.id.toLowerCase(), item);
      if (item.name) map.set(item.name.toLowerCase(), item);
    });
    return map;
  }, [existingCollectionItems]);

  // Sync selectedDatasetKey if prop changes
  useEffect(() => {
    if (initialDatasetKey && initialDatasetKey !== selectedDatasetKey) {
      setSelectedDatasetKey(initialDatasetKey);
    }
  }, [initialDatasetKey]);

  // Clear preview when switching datasets
  const handleSelectDataset = (key) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setSelectedDatasetKey(key);
    setParsedItems([]);
    setSelectedItemIds(new Set());
    setValidationReport(null);
    setInjectionResults(null);
    setAiError('');
  };

  // Load Sample Data
  const handleLoadSample = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    const sample = [currentDataset.sampleItem];
    const jsonString = JSON.stringify(sample, null, 2);
    setRawJsonText(jsonString);
    handleParseJson(jsonString);
  };

  // Parse Raw JSON Array Mode
  const handleParseJson = (textToParse = rawJsonText) => {
    if (!textToParse.trim()) {
      setValidationReport({ isValid: false, errors: ['Please paste a JSON array payload.'], warnings: [], validCount: 0 });
      return;
    }

    try {
      // Clean JSON text (strip code blocks if user pasted with ```json ... ```)
      let cleaned = textToParse.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '');
      }

      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        setValidationReport({
          isValid: false,
          errors: ['Root JSON element must be an Array [...] of objects.'],
          warnings: [],
          validCount: 0
        });
        return;
      }

      const report = validateDatasetPayload(selectedDatasetKey, parsed);
      setValidationReport(report);

      // Adapt each item into Firestore normalized format
      const adapted = parsed.map(item => adaptSparkItemToFirestore(selectedDatasetKey, item)).filter(Boolean);
      setParsedItems(adapted);
      setSelectedItemIds(new Set(adapted.map(i => i.id)));
      setInjectionResults(null);
      AudioService.playTerminalBeep(1400, 0.04);
    } catch (err) {
      setValidationReport({
        isValid: false,
        errors: [`JSON Syntax Error: ${err.message}`],
        warnings: [],
        validCount: 0
      });
      setParsedItems([]);
    }
  };

  // Parse Markdown Table Mode
  const handleParseTable = () => {
    if (!rawTableText.trim()) return;
    AudioService.playTerminalBeep(1200, 0.03);

    const lines = rawTableText.split('\n');
    let items = [];
    let headers = [];
    let isParsingTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|')) {
        const rowData = line.split('|').map(x => x.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (rowData.length > 0 && rowData[0].startsWith('---')) continue;

        if (!isParsingTable) {
          headers = rowData.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
          isParsingTable = true;
        } else {
          if (rowData.length < headers.length) continue;

          let rawObj = {
            name: rowData[0],
            category: defaultCategory || targetCollection,
            techLevel: defaultTL
          };

          for (let j = 1; j < headers.length; j++) {
            const h = headers[j];
            const val = rowData[j].replace(/[#*]/g, '');
            if (h.includes('dmg') || h.includes('damage')) rawObj.damage = val;
            else if (h.includes('range')) rawObj.range = val;
            else if (h.includes('ammo') || h.includes('capacity')) rawObj.ammunitionCapacity = val;
            else if (h.includes('cost') || h.includes('credit')) rawObj.cost = val;
            else if (h.includes('dc') || h.includes('craft')) rawObj.craftingDC = val;
            else if (h.includes('sp') || h.includes('durability')) rawObj.structurePoints = val;
            else if (h.includes('dr')) rawObj.damageResist = val;
            else if (h.includes('desc')) rawObj.description = val;
            else if (h.includes('mech') || h.includes('rule')) rawObj.gameMechanics = val;
            else rawObj[h] = val;
          }

          const adapted = adaptSparkItemToFirestore(selectedDatasetKey, rawObj);
          if (adapted) items.push(adapted);
        }
      } else {
        isParsingTable = false;
      }
    }

    setParsedItems(items);
    setSelectedItemIds(new Set(items.map(i => i.id)));
    setValidationReport({
      isValid: items.length > 0,
      errors: items.length === 0 ? ['No table rows found. Ensure rows start and end with "|" pipes.'] : [],
      warnings: [],
      validCount: items.length
    });
    setInjectionResults(null);
  };

  // Run BASTION Live Text Synthesizer
  const handleRunBastionAi = async () => {
    if (!rawAiText.trim()) return;
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      setAiError('Gemini API key is required. Please set VITE_GEMINI_API_KEY or configure it in Settings.');
      return;
    }

    setIsAiProcessing(true);
    setAiError('');
    AudioService.playTerminalBeep(1200, 0.04);

    try {
      const fullPrompt = `${currentDataset.promptText.replace('[INSERT RAW ' + currentDataset.label.toUpperCase() + ' TEXT HERE]', rawAiText)}\n\nRAW INPUT TEXT TO PARSE:\n${rawAiText}`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json'
        }
      };

      const result = await fetchGeminiContent(apiKey, requestBody);
      const textOutput = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        throw new Error('No response returned from BASTION model.');
      }

      setRawJsonText(textOutput);
      setActiveTab('json');
      handleParseJson(textOutput);
      AudioService.playTerminalBeep(1400, 0.06);
    } catch (err) {
      setAiError(`BASTION Parsing Error: ${err.message}`);
      AudioService.playErrorSound();
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Copy Prompt to Clipboard
  const handleCopyPrompt = () => {
    AudioService.playTerminalBeep(1300, 0.02);
    navigator.clipboard.writeText(currentDataset.promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  // Copy Sample to Clipboard
  const handleCopySample = () => {
    AudioService.playTerminalBeep(1300, 0.02);
    const sampleStr = JSON.stringify([currentDataset.sampleItem], null, 2);
    navigator.clipboard.writeText(sampleStr);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2500);
  };

  // Selection toggles
  const handleToggleItemSelect = (id) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedItemIds(new Set(parsedItems.map(i => i.id)));
  };

  const handleDeselectAll = () => {
    setSelectedItemIds(new Set());
  };

  const toggleJsonExpand = (id) => {
    setExpandedJsonIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Batch Injection into Omnicortex Firestore
  const handleInject = async () => {
    if (!saveEntry || parsedItems.length === 0) return;

    const itemsToInject = parsedItems.filter(item => selectedItemIds.has(item.id));
    if (itemsToInject.length === 0) {
      alert('Please select at least one item to inject.');
      return;
    }

    setIsInjecting(true);
    setInjectionProgress({ current: 0, total: itemsToInject.length });
    AudioService.playTerminalBeep(1100, 0.05);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let errors = [];

    for (let i = 0; i < itemsToInject.length; i++) {
      const item = itemsToInject[i];
      const existing = existingIdsMap.get(item.id.toLowerCase()) || existingIdsMap.get((item.name || '').toLowerCase());

      if (existing && conflictStrategy === 'skip') {
        skippedCount++;
        setInjectionProgress({ current: i + 1, total: itemsToInject.length });
        continue;
      }

      let payloadToSave = { ...item };
      if (existing && conflictStrategy === 'merge') {
        payloadToSave = { ...existing, ...item, id: existing.id || item.id };
      }

      try {
        await saveEntry(targetCollection, payloadToSave);
        if (existing) updatedCount++;
        else createdCount++;
      } catch (err) {
        errors.push(`Failed to save ${item.name} (${item.id}): ${err.message}`);
      }

      setInjectionProgress({ current: i + 1, total: itemsToInject.length });
    }

    setInjectionResults({
      total: itemsToInject.length,
      createdCount,
      updatedCount,
      skippedCount,
      errors
    });

    setIsInjecting(false);
    AudioService.playTerminalBeep(1500, 0.08);
  };

  // Single Item Direct Inject
  const handleSingleInject = async (item) => {
    try {
      AudioService.playTerminalBeep(1200, 0.03);
      await saveEntry(targetCollection, item);
      alert(`Successfully saved "${item.name}" into "${targetCollection}"!`);
    } catch (err) {
      alert(`Error saving item: ${err.message}`);
    }
  };

  // Download JSON
  const handleDownloadJson = () => {
    AudioService.playTerminalBeep(1200, 0.02);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parsedItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `omnicortex_${selectedDatasetKey}_ingestion.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!searchFilter.trim()) return parsedItems;
    const term = searchFilter.toLowerCase();
    return parsedItems.filter(item => {
      const name = (item.name || '').toLowerCase();
      const desc = (item.description || item.mechanic || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      return name.includes(term) || desc.includes(term) || id.includes(term);
    });
  }, [parsedItems, searchFilter]);

  const DatasetIcon = currentDataset.icon;

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto font-sans select-none text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
            style={{ background: `${currentDataset.color}25`, border: `1px solid ${currentDataset.color}80`, color: currentDataset.color }}
          >
            <DatasetIcon size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider" style={{ background: `${currentDataset.color}20`, color: currentDataset.color }}>
                {currentDataset.code}
              </span>
              <span className="text-slate-600 font-mono text-xs">•</span>
              <span className="text-xs font-mono text-slate-400">Target Collection: <strong className="text-amber-400 font-mono">{targetCollection}</strong></span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-mono tracking-wider text-white uppercase mt-0.5 truncate">
              OMNICORTEX INGESTION ENGINE
            </h1>
          </div>
        </div>

        {/* Dataset Quick Switcher Ribbon */}
        <div className="flex items-center gap-2 max-w-full overflow-x-auto pb-1 sm:pb-0">
          <label className="text-xs font-mono text-slate-400 font-bold uppercase mr-1 hidden md:inline">Dataset:</label>
          <select
            value={selectedDatasetKey}
            onChange={(e) => handleSelectDataset(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400 shadow-inner cursor-pointer"
          >
            {OMNICORTEX_DATASETS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.code}: {d.label} ({d.targetCollection})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 14-Dataset Selector Grid (Collapsible/Visual Pills) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {OMNICORTEX_DATASETS.map((d) => {
          const isSelected = d.key === selectedDatasetKey;
          const Icon = d.icon;
          const count = (dbData?.[d.targetCollection] || []).length;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => handleSelectDataset(d.key)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/40 text-white'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon size={14} style={{ color: isSelected ? d.color : undefined }} />
                <span className="text-[9px] font-mono font-bold px-1 rounded bg-slate-800/80 text-slate-400">
                  {count}
                </span>
              </div>
              <div className="text-[11px] font-mono font-bold uppercase truncate leading-tight">
                {d.label.split(' ')[0]}
              </div>
              <div className="text-[9px] font-mono text-slate-500 truncate">
                {d.code}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Ingestion Workbench */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Multi-Mode Ingestion Input */}
        <div className="col-span-12 xl:col-span-5 flex flex-col space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col h-full shadow-lg overflow-hidden">
            
            {/* Ingestion Mode Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 p-2 bg-slate-950/50">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { AudioService.playTerminalBeep(1100, 0.02); setActiveTab('json'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'json'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code size={13} />
                  <span>Structured JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => { AudioService.playTerminalBeep(1100, 0.02); setActiveTab('ai'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'ai'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot size={13} />
                  <span>BASTION AI Parser</span>
                </button>

                <button
                  type="button"
                  onClick={() => { AudioService.playTerminalBeep(1100, 0.02); setActiveTab('table'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'table'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Table size={13} />
                  <span>Markdown Table</span>
                </button>

                <button
                  type="button"
                  onClick={() => { AudioService.playTerminalBeep(1100, 0.02); setActiveTab('prompt'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'prompt'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText size={13} />
                  <span>Prompt & Schema</span>
                </button>
              </div>

              {activeTab === 'json' && (
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-amber-300 border border-slate-700 transition-colors"
                  title="Load sample schema-compliant item"
                >
                  Load Sample
                </button>
              )}
            </div>

            {/* Ingestion Configuration Controls */}
            <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto">
              
              {/* Conflict Strategy Selector */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    Duplicate Strategy
                  </label>
                  <select
                    value={conflictStrategy}
                    onChange={(e) => setConflictStrategy(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs font-mono text-slate-200"
                  >
                    <option value="merge">Merge & Update Fields (Recommended)</option>
                    <option value="overwrite">Overwrite Entire Document</option>
                    <option value="skip">Skip Existing Records</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    Formatting Standard
                  </label>
                  <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1.5 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>Plain Text (No LaTeX $)</span>
                  </div>
                </div>
              </div>

              {/* TAB 1: STRUCTURED JSON INPUT */}
              {activeTab === 'json' && (
                <div className="flex-1 flex flex-col space-y-3 min-h-[360px]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Paste Spark JSON Array:</span>
                    <span className="text-[10px] font-mono text-slate-500">Expects: [...]</span>
                  </div>

                  <textarea
                    value={rawJsonText}
                    onChange={(e) => setRawJsonText(e.target.value)}
                    placeholder={`[\n  {\n    "name": "Example ${currentDataset.label}",\n    ...\n  }\n]`}
                    className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:border-amber-500/60 shadow-inner"
                  />

                  <button
                    type="button"
                    onClick={() => handleParseJson()}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
                  >
                    <Play size={15} />
                    <span>Validate & Prepare Ingestion</span>
                  </button>
                </div>
              )}

              {/* TAB 2: BASTION AI LIVE TEXT PARSER */}
              {activeTab === 'ai' && (
                <div className="flex-1 flex flex-col space-y-3 min-h-[360px]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                      <Cpu size={13} /> Paste Unformatted Rulebook / Lore Text:
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">BASTION Tactical Cognition</span>
                  </div>

                  {aiError && (
                    <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs font-mono flex items-center gap-2">
                      <AlertTriangle size={15} className="shrink-0 text-red-400" />
                      <span>{aiError}</span>
                    </div>
                  )}

                  <textarea
                    value={rawAiText}
                    onChange={(e) => setRawAiText(e.target.value)}
                    placeholder={`Paste raw ${currentDataset.label.toLowerCase()} text from the PDF, rulebook, or lore document here...`}
                    className="flex-1 w-full bg-slate-950 border border-cyan-500/30 rounded-xl p-4 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:border-cyan-400 shadow-inner"
                  />

                  <button
                    type="button"
                    disabled={isAiProcessing || !rawAiText.trim()}
                    onClick={handleRunBastionAi}
                    className="w-full py-3 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/50 text-cyan-200 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAiProcessing ? (
                      <>
                        <RefreshCw size={15} className="animate-spin text-cyan-400" />
                        <span>Synthesizing Schema with BASTION...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} className="text-cyan-400" />
                        <span>Run {currentDataset.code} via BASTION</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 3: MARKDOWN TABLE PARSER */}
              {activeTab === 'table' && (
                <div className="flex-1 flex flex-col space-y-3 min-h-[360px]">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                        Default Sub-Category
                      </label>
                      <input
                        type="text"
                        value={defaultCategory}
                        onChange={(e) => setDefaultCategory(e.target.value)}
                        placeholder="E.g., Heavy Ballistics"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                        Default Tech Level (TL)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={defaultTL}
                        onChange={(e) => setDefaultTL(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200"
                      />
                    </div>
                  </div>

                  <textarea
                    value={rawTableText}
                    onChange={(e) => setRawTableText(e.target.value)}
                    placeholder="| Name | Damage | Range | Cost | DC | Special |\n| --- | --- | --- | --- | --- | --- |\n| Viper Carbine | 3d8 | 60ft | 1280 | 18 | Thermal Melt |"
                    className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:border-amber-500/60 shadow-inner"
                  />

                  <button
                    type="button"
                    onClick={handleParseTable}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                  >
                    <Table size={15} className="text-amber-400" />
                    <span>Parse Markdown Table</span>
                  </button>
                </div>
              )}

              {/* TAB 4: PROMPT & SCHEMA REFERENCE HUB */}
              {activeTab === 'prompt' && (
                <div className="flex-1 flex flex-col space-y-3 min-h-[360px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-purple-300 font-bold">
                      {currentDataset.code}: Copy-Paste Instructions
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopySample}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 border border-slate-700 flex items-center gap-1"
                      >
                        {copiedSample ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedSample ? 'Sample Copied!' : 'Copy Sample'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyPrompt}
                        className="px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-[10px] font-mono text-purple-300 font-bold flex items-center gap-1 shadow-sm"
                      >
                        {copiedPrompt ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy System Prompt'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-y-auto max-h-[400px]">
                    <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {currentDataset.promptText}
                    </pre>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Column: Ingestion Validation Diff & Live Omnicortex Preview */}
        <div className="col-span-12 xl:col-span-7 flex flex-col space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col h-full shadow-lg overflow-hidden">
            
            {/* Preview Toolbar */}
            <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-mono font-bold text-slate-200 flex items-center gap-2">
                  <Search size={15} className="text-amber-400" />
                  <span>PREPARED RECORDS ({parsedItems.length})</span>
                </h2>
                {parsedItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[10px] font-mono text-slate-400 hover:text-amber-300 underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-[10px] font-mono text-slate-400 hover:text-amber-300 underline"
                    >
                      Deselect All
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {parsedItems.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadJson}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                      title="Download parsed JSON file"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">Export JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInject}
                      disabled={isInjecting || selectedItemIds.size === 0}
                      className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isInjecting ? (
                        <>
                          <RefreshCw size={13} className="animate-spin text-white" />
                          <span>Injecting ({injectionProgress.current}/{injectionProgress.total})...</span>
                        </>
                      ) : (
                        <>
                          <Database size={13} />
                          <span>Inject ({selectedItemIds.size}) into Omnicortex</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Main Preview Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[700px]">
              
              {/* Validation Status Banner */}
              {validationReport && (
                <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 text-xs font-mono ${
                  validationReport.isValid 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  <div className="flex items-center font-bold gap-2">
                    {validationReport.isValid ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>
                      {validationReport.isValid ? `Schema Validation Passed: ${validationReport.validCount} valid items` : 'Validation Errors Detected'}
                    </span>
                  </div>
                  {validationReport.errors.length > 0 && (
                    <ul className="list-disc pl-5 opacity-90 space-y-0.5">
                      {validationReport.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  )}
                  {validationReport.warnings.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-emerald-500/20 text-[11px] text-amber-300 opacity-90">
                      <strong>Notices:</strong>
                      <ul className="list-disc pl-5">
                        {validationReport.warnings.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Injection Completion Banner */}
              {injectionResults && (
                <div className={`p-4 rounded-xl border ${
                  injectionResults.errors.length > 0 
                    ? 'bg-red-950/50 border-red-500/50 text-red-300' 
                    : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                }`}>
                  <div className="flex items-center font-bold text-sm mb-1 gap-2 font-mono">
                    {injectionResults.errors.length > 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                    <span>OMNICORTEX DATABASE INGESTION COMPLETE</span>
                  </div>
                  <div className="text-xs font-mono opacity-90 space-y-1">
                    <p>
                      • <strong>{injectionResults.createdCount}</strong> new entries created in <code className="text-amber-300">{targetCollection}</code>.<br />
                      • <strong>{injectionResults.updatedCount}</strong> existing entries merged/updated.<br />
                      {injectionResults.skippedCount > 0 && (
                        <span>• <strong>{injectionResults.skippedCount}</strong> duplicates skipped.</span>
                      )}
                    </p>
                    {injectionResults.errors.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-red-500/30">
                        <span className="font-bold text-red-400">Failed Items:</span>
                        <ul className="list-disc pl-5 mt-1 space-y-0.5">
                          {injectionResults.errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Search Filter input */}
              {parsedItems.length > 3 && (
                <div className="relative">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter prepared records by name, ID, or keywords..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                </div>
              )}

              {/* Empty State */}
              {parsedItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
                  <Database size={40} className="text-slate-600 mb-3" />
                  <h3 className="text-sm font-mono font-bold text-slate-400 uppercase">
                    No Records Prepared for Ingestion
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Select an ingestion mode on the left, paste your Spark JSON payload or raw text, and click Validate to preview the Firestore documents.
                  </p>
                </div>
              ) : (
                /* Item Cards Grid */
                <div className="space-y-3">
                  {filteredItems.map((item, idx) => {
                    const isSelected = selectedItemIds.has(item.id);
                    const isExpanded = expandedJsonIds.has(item.id);
                    const existing = existingIdsMap.get(item.id.toLowerCase()) || existingIdsMap.get((item.name || '').toLowerCase());
                    const tl = item.tech_level ?? item.tl ?? 0;
                    const ml = item.meta_level ?? item.ml ?? 0;

                    return (
                      <div
                        key={item.id || idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-slate-950/90 border-slate-700/80 shadow-md'
                            : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleItemSelect(item.id)}
                              className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <h3 className="font-mono font-bold text-sm text-amber-300 truncate">
                                {item.name || 'Unnamed'}
                              </h3>
                              <span className="text-[10px] font-mono text-slate-500">
                                ID: <code className="text-slate-400">{item.id}</code>
                              </span>
                            </div>
                          </div>

                          {/* Status & Stat Badges */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {existing ? (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 font-bold border border-blue-500/40">
                                EXISTING (MERGE)
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40">
                                NEW RECORD
                              </span>
                            )}

                            {item.costs?.credits > 0 && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-500/30">
                                {item.costs.credits.toLocaleString()} Cr
                              </span>
                            )}
                            {item.costs?.bp > 0 && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 font-bold border border-purple-500/30">
                                {item.costs.bp} BP
                              </span>
                            )}
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                              TL{tl}
                            </span>
                            {ml > 0 && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">
                                ML{ml}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description / Summary */}
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {item.description || item.summary || item.mechanic || 'No narrative overview.'}
                        </p>

                        {/* Attribute & Modifiers tags */}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {item.modifiers.slice(0, 4).map((m, mi) => (
                              <span key={mi} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                                {m.mode ? `${m.mode}: ` : ''}{m.target} ({m.value > 0 ? `+${m.value}` : m.value})
                              </span>
                            ))}
                            {item.modifiers.length > 4 && (
                              <span className="text-[10px] font-mono text-slate-500 self-center">
                                +{item.modifiers.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                          <button
                            type="button"
                            onClick={() => toggleJsonExpand(item.id)}
                            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
                          >
                            <Code size={12} />
                            <span>{isExpanded ? 'Hide Raw Schema' : 'Inspect Firestore Document'}</span>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSingleInject(item)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1 transition-colors"
                          >
                            <ArrowRight size={11} />
                            <span>Inject Single</span>
                          </button>
                        </div>

                        {/* Expandable JSON Inspector */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-800 bg-slate-950 p-3 rounded-xl">
                            <pre className="text-[10px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap max-h-60">
                              {JSON.stringify(item, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CodexIngestionEngine;
