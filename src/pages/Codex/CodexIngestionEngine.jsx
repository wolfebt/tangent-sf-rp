import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDBM } from '../../context/DBMContext';
import { categoryConfig } from '../../components/DBM/categoryConfig';
import { 
  OMNICORTEX_DATASETS, 
  getDatasetByKey, 
  validateDatasetPayload, 
  sanitizePayloadStrings 
} from './codexPromptRegistry';
import { adaptSparkItemToFirestore, sanitizeDocumentId } from '../../utils/codexIngestionAdapters';
import { normalizeOmnicortexItem } from '../../utils/tangentSchemaAdapters';
import { 
  getGeminiApiKey, 
  synthesizeDatasetIngestionWithBastion,
  verifyFolioAssetHealth 
} from '../../services/bastionService';
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
  Table, 
  Bot, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Cpu,
  Upload,
  FileText,
  File,
  FileSpreadsheet,
  X,
  Edit3,
  Plus,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
  GitCompare,
  Layers,
  ArrowRight
} from 'lucide-react';

export const CodexIngestionEngine = ({ initialDatasetKey = 'species' }) => {
  const { dbData, saveEntry } = useDBM() || {};

  // State: Dataset & Intake Modes
  const [selectedDatasetKey, setSelectedDatasetKey] = useState(initialDatasetKey);
  const [activeTab, setActiveTab] = useState('bastion'); // 'bastion' (default) | 'json' | 'table'
  const [conflictStrategy, setConflictStrategy] = useState('merge'); // 'merge' | 'overwrite' | 'skip'
  
  // BASTION Intake Inputs
  const [rawAiText, setRawAiText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null); // { name, size, type, mimeType, text, base64 }
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Manual Fallback Inputs
  const [rawJsonText, setRawJsonText] = useState('');
  const [rawTableText, setRawTableText] = useState('');
  const [defaultTL, setDefaultTL] = useState(3);
  const [defaultCategory, setDefaultCategory] = useState('');
  const tableFileInputRef = useRef(null);
  
  // Staged Records & Validation
  const [parsedItems, setParsedItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [validationReport, setValidationReport] = useState(null);
  const [folioHealthReport, setFolioHealthReport] = useState(null);
  
  // Processing States
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [synthesisStatus, setSynthesisStatus] = useState('');
  const [aiError, setAiError] = useState('');
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectionProgress, setInjectionProgress] = useState({ current: 0, total: 0 });
  const [injectionResults, setInjectionResults] = useState(null);
  
  // In-Place Revision Modal State
  const [revisingItem, setRevisingItem] = useState(null);
  const [revisionForm, setRevisionForm] = useState(null);

  // Side-by-Side Diff Modal State
  const [diffModalItem, setDiffModalItem] = useState(null);

  // UI helpers
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
    setFolioHealthReport(null);
    setInjectionResults(null);
    setAiError('');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FILE / DOCUMENT HANDLING (PDF, TXT, MD, JSON)
  // ─────────────────────────────────────────────────────────────────────────────
  const processUploadedFile = (file) => {
    if (!file) return;
    AudioService.playTerminalBeep(1200, 0.03);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isJson = file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');

    if (isPdf) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        // Strip data:application/pdf;base64, prefix for Gemini inlineData
        const base64Data = result.split(',')[1] || result;
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: 'pdf',
          mimeType: 'application/pdf',
          base64: base64Data
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = e.target.result;
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: isJson ? 'json' : 'text',
          mimeType: file.type || 'text/plain',
          text: textContent
        });

        // If JSON file uploaded, also populate JSON box for user convenience
        if (isJson) {
          setRawJsonText(textContent);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    AudioService.playTerminalBeep(1000, 0.02);
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // BASTION AUTONOMOUS PARSER EXECUTION
  // ─────────────────────────────────────────────────────────────────────────────
  const handleRunBastionAi = async () => {
    const hasText = rawAiText && rawAiText.trim().length > 0;
    const hasFile = uploadedFile && (uploadedFile.text || uploadedFile.base64);

    if (!hasText && !hasFile) {
      setAiError('Please provide raw text or upload a document to parse.');
      return;
    }

    setIsAiProcessing(true);
    setSynthesisStatus('Synthesizing Omnicortex Schema...');
    setAiError('');
    AudioService.playTerminalBeep(1200, 0.04);

    try {
      const result = await synthesizeDatasetIngestionWithBastion({
        categoryKey: selectedDatasetKey,
        rawText: rawAiText,
        fileData: uploadedFile,
        conflictStrategy,
        onProgress: ({ current, total, status }) => {
          setSynthesisStatus(status || `Synthesizing Part ${current}/${total}...`);
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to synthesize dataset entry with BASTION.');
      }

      setRawJsonText(JSON.stringify(result.rawItems, null, 2));
      setParsedItems(result.adaptedItems);
      setSelectedItemIds(new Set(result.adaptedItems.map(i => i.id)));
      setValidationReport(result.validationReport);
      setFolioHealthReport(result.folioHealthReport);
      setInjectionResults(null);
      AudioService.playTerminalBeep(1400, 0.06);
    } catch (err) {
      setAiError('BASTION Ingestion Error: ' + err.message);
      AudioService.playErrorSound();
    } finally {
      setIsAiProcessing(false);
      setSynthesisStatus('');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // MANUAL JSON / UNIVERSAL TABULAR PARSING (CSV, TSV, MARKDOWN)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleParseJson = (textToParse = rawJsonText) => {
    if (!textToParse.trim()) {
      setValidationReport({ isValid: false, errors: ['Please paste a JSON array payload.'], warnings: [], validCount: 0 });
      return;
    }

    try {
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

      const adapted = parsed.map(item => {
        const ad = adaptSparkItemToFirestore(selectedDatasetKey, item);
        if (ad) ad._folioHealth = verifyFolioAssetHealth(ad, selectedDatasetKey);
        return ad;
      }).filter(Boolean);

      setParsedItems(adapted);
      setSelectedItemIds(new Set(adapted.map(i => i.id)));
      setFolioHealthReport({
        allReady: adapted.every(i => i._folioHealth?.isFolioReady),
        failedCount: adapted.filter(i => !i._folioHealth?.isFolioReady).length
      });
      setInjectionResults(null);
      AudioService.playTerminalBeep(1400, 0.04);
    } catch (err) {
      setValidationReport({
        isValid: false,
        errors: ['JSON Syntax Error: ' + err.message],
        warnings: [],
        validCount: 0
      });
      setParsedItems([]);
    }
  };

  // Universal CSV/TSV/Markdown delimiter parser
  const parseDelimitedRow = (line, delimiter) => {
    if (delimiter === '|') {
      return line.split('|').map(x => x.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    }
    if (delimiter === '\t') {
      return line.split('\t').map(x => x.trim());
    }
    if (delimiter === ';') {
      return line.split(';').map(x => x.trim());
    }
    
    // RFC 4180 quotation-aware CSV tokenizer
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleParseTable = (overrideText = null) => {
    const textToParse = overrideText !== null ? overrideText : rawTableText;
    if (!textToParse.trim()) return;
    AudioService.playTerminalBeep(1200, 0.03);

    const lines = textToParse.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // Auto-detect delimiter from the first line
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.startsWith('|') || (firstLine.includes('|') && firstLine.endsWith('|'))) {
      delimiter = '|';
    } else if (firstLine.includes('\t')) {
      delimiter = '\t';
    } else if (firstLine.includes(';') && !firstLine.includes(',')) {
      delimiter = ';';
    }

    let items = [];
    let headers = [];
    let isParsingHeader = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip Markdown separator line |---|---|
      if (delimiter === '|' && /^\|?[\s\-:|]+\|?$/.test(line)) {
        continue;
      }

      const rowData = parseDelimitedRow(line, delimiter);
      if (rowData.length === 0) continue;

      if (isParsingHeader) {
        headers = rowData.map(h => {
          const raw = h.toLowerCase().replace(/[^a-z0-9_]/g, '');
          // Common header normalizations
          if (['title', 'itemname', 'item_name', 'designation'].includes(raw)) return 'name';
          if (['tl', 'techlevel'].includes(raw)) return 'tech_level';
          if (['ml', 'metalevel'].includes(raw)) return 'meta_level';
          if (['craftdc', 'craft_dc', 'designdc', 'design_dc', 'dc'].includes(raw)) return 'craft_dc';
          if (['cost', 'price', 'credits', 'credit'].includes(raw)) return 'credits';
          if (['bp', 'cp', 'bpcost', 'cpcost'].includes(raw)) return 'bp';
          if (['sp', 'structurepoints', 'hp'].includes(raw)) return 'sp';
          if (['dr', 'damageresist', 'armor'].includes(raw)) return 'dr';
          if (['desc', 'lore', 'summary'].includes(raw)) return 'description';
          if (['rules', 'special', 'effects'].includes(raw)) return 'mechanic';
          return raw;
        });
        isParsingHeader = false;
      } else {
        if (rowData.length < Math.min(2, headers.length)) continue;
        let rowObj = { 
          tech_level: defaultTL, 
          category: defaultCategory || currentDataset.label 
        };
        headers.forEach((h, idx) => {
          if (h && rowData[idx] !== undefined) {
            rowObj[h] = rowData[idx];
          }
        });
        items.push(rowObj);
      }
    }

    if (items.length > 0) {
      const adapted = items.map(item => {
        const ad = adaptSparkItemToFirestore(selectedDatasetKey, item);
        if (ad) ad._folioHealth = verifyFolioAssetHealth(ad, selectedDatasetKey);
        return ad;
      }).filter(Boolean);

      setParsedItems(adapted);
      setSelectedItemIds(new Set(adapted.map(i => i.id)));
      setValidationReport({ isValid: true, errors: [], warnings: [], validCount: adapted.length });
      setFolioHealthReport({
        allReady: adapted.every(i => i._folioHealth?.isFolioReady),
        failedCount: adapted.filter(i => !i._folioHealth?.isFolioReady).length
      });
      setInjectionResults(null);
      AudioService.playTerminalBeep(1400, 0.04);
    }
  };

  const handleTableFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setRawTableText(content);
      handleParseTable(content);
    };
    reader.readAsText(file);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // IN-PLACE REVISION WORKBENCH & DIFF INSPECTOR
  // ─────────────────────────────────────────────────────────────────────────────
  const handleOpenRevision = (item) => {
    AudioService.playTerminalBeep(1300, 0.03);
    setRevisingItem(item);
    setRevisionForm({
      ...item,
      costs: { bp: 0, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0, ...(item.costs || {}) },
      modifiers: Array.isArray(item.modifiers) ? item.modifiers.map(m => ({ ...m })) : []
    });
  };

  const handleCloseRevision = () => {
    AudioService.playTerminalBeep(1000, 0.02);
    setRevisingItem(null);
    setRevisionForm(null);
  };

  const handleOpenDiff = (item) => {
    AudioService.playTerminalBeep(1200, 0.03);
    setDiffModalItem(item);
  };

  const handleCloseDiff = () => {
    AudioService.playTerminalBeep(1000, 0.02);
    setDiffModalItem(null);
  };

  const handleSaveRevision = () => {
    if (!revisionForm || !revisingItem) return;
    AudioService.playTerminalBeep(1400, 0.05);

    const normalized = normalizeOmnicortexItem(revisionForm);
    normalized._folioHealth = verifyFolioAssetHealth(normalized, selectedDatasetKey);

    setParsedItems(prev => prev.map(p => p.id === revisingItem.id ? normalized : p));
    handleCloseRevision();
  };

  const handleAddModifier = () => {
    setRevisionForm(prev => ({
      ...prev,
      modifiers: [
        ...prev.modifiers,
        { target: 'Agility', type: 'attribute', value: 1, mode: 'inherent' }
      ]
    }));
  };

  const handleRemoveModifier = (index) => {
    setRevisionForm(prev => ({
      ...prev,
      modifiers: prev.modifiers.filter((_, i) => i !== index)
    }));
  };

  const handleModifierChange = (index, field, value) => {
    setRevisionForm(prev => {
      const nextMods = [...prev.modifiers];
      nextMods[index] = { ...nextMods[index], [field]: value };
      return { ...prev, modifiers: nextMods };
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // BATCH & SINGLE DATABASE INJECTION
  // ─────────────────────────────────────────────────────────────────────────────
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

      // Strip internal health metadata before persisting
      delete payloadToSave._folioHealth;

      try {
        await saveEntry(targetCollection, payloadToSave);
        if (existing) updatedCount++;
        else createdCount++;
      } catch (err) {
        errors.push('Failed to save ' + item.name + ' (' + item.id + '): ' + err.message);
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

  const handleDownloadJson = () => {
    AudioService.playTerminalBeep(1200, 0.02);
    const cleanList = parsedItems.map(p => {
      const c = { ...p };
      delete c._folioHealth;
      return c;
    });
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cleanList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", 'omnicortex_' + selectedDatasetKey + '_ingestion.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 space-y-6 overflow-y-auto">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
                <span>BASTION OMNICORTEX INGESTION STUDIO</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  AI COGNITION V3
                </span>
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Autonomous text & document ingestion pipeline parsing into schema-enforced Omnicortex game assets with pre-flight verification.
              </p>
            </div>
          </div>
        </div>

        {/* Global Dataset Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-3">
            <DatasetIcon size={18} style={{ color: currentDataset.color }} />
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase leading-none">Target Collection</div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                {currentDataset.label} ({existingCollectionItems.length} stored)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Selection Ribbons (14 Omnicortex Datasets) */}
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
              style={{ borderColor: isSelected ? d.color : undefined }}
              className={`flex flex-col items-start p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-slate-900 border-2 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon size={14} style={{ color: isSelected ? d.color : undefined }} />
                <span className="text-[9px] font-mono font-bold px-1 rounded bg-slate-800/80 text-slate-400">
                  {count}
                </span>
              </div>
              <div className="text-[11px] font-mono font-bold uppercase truncate leading-tight mt-1">
                {d.label.split(' ')[0]}
              </div>
              <div className="text-[9px] font-mono text-slate-500 truncate">
                {d.code}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Ingestion Workbench */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Intake Workbench */}
        <div className="col-span-12 xl:col-span-5 flex flex-col space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col h-full shadow-lg overflow-hidden">
            
            {/* Mode Switcher */}
            <div className="flex items-center justify-between border-b border-slate-800 p-2 bg-slate-950/50">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { AudioService.playTerminalBeep(1100, 0.02); setActiveTab('bastion'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'bastion'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot size={13} />
                  <span>BASTION AI Studio</span>
                </button>

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
                  <span>Direct JSON</span>
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
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400/80 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20">
                  {currentDataset.code}
                </span>
              </div>
            </div>

            {/* Ingestion Options Bar */}
            <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    Duplicate Resolution
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
                    Compliance Verification
                  </label>
                  <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1.5 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>Plain Text (No LaTeX $)</span>
                  </div>
                </div>
              </div>

              {/* TAB 1: BASTION DOCUMENT & TEXT INGESTION (PRIMARY) */}
              {activeTab === 'bastion' && (
                <div className="flex-1 flex flex-col space-y-4">
                  
                  {/* File / Document Upload & Drop Area */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className={`border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                      isDraggingFile 
                        ? 'border-cyan-400 bg-cyan-950/40' 
                        : uploadedFile 
                          ? 'border-emerald-500/60 bg-emerald-950/20' 
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.md,.markdown,.json,.csv"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {uploadedFile ? (
                      <div className="flex items-center justify-between w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                            {uploadedFile.type === 'pdf' ? <FileText size={20} /> : <File size={20} />}
                          </div>
                          <div className="text-left min-w-0">
                            <div className="text-xs font-mono font-bold text-emerald-300 truncate">
                              {uploadedFile.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type.toUpperCase()}
                              {uploadedFile.type === 'pdf' && ' (Multimodal Document Parsing)'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleClearFile}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-cyan-400 mb-2" />
                        <span className="text-xs font-mono font-bold text-slate-200">
                          Upload Document or Drag & Drop File
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Supports .PDF, .TXT, .MD, .JSON, .CSV
                        </span>
                      </>
                    )}
                  </div>

                  {/* Text / Directives Input */}
                  <div className="flex-1 flex flex-col space-y-2 min-h-[220px]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5 font-bold">
                        <Cpu size={13} className="text-cyan-400" />
                        Raw Text / Lore / Directives:
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {rawAiText.length} characters
                      </span>
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
                      placeholder={`Paste raw ${currentDataset.label.toLowerCase()} text from your rulebook, notes, or supplemental document here...`}
                      className="flex-1 w-full bg-slate-950 border border-slate-800 focus:border-cyan-400/60 rounded-xl p-3 font-mono text-xs text-slate-200 resize-none shadow-inner"
                    />
                  </div>

                  {/* Execution Trigger */}
                  <button
                    type="button"
                    disabled={isAiProcessing || (!rawAiText.trim() && !uploadedFile)}
                    onClick={handleRunBastionAi}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/50 text-cyan-200 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAiProcessing ? (
                      <>
                        <RefreshCw size={16} className="animate-spin text-cyan-400" />
                        <span>{synthesisStatus || 'BASTION Synthesizing Schema...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="text-cyan-400" />
                        <span>Parse & Ingest with BASTION ({currentDataset.code})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 2: DIRECT JSON INPUT */}
              {activeTab === 'json' && (
                <div className="flex-1 flex flex-col space-y-3 min-h-[360px]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Paste JSON Array:</span>
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

              {/* TAB 3: UNIVERSAL TABULAR PARSER (CSV, TSV, MARKDOWN, SEMICOLON) */}
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

                  {/* CSV / TSV File Drop / Selector */}
                  <div
                    onClick={() => tableFileInputRef.current && tableFileInputRef.current.click()}
                    className="border border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950/40 hover:bg-slate-950/80 rounded-xl p-2.5 flex items-center justify-center gap-2 cursor-pointer transition-all text-slate-400 hover:text-slate-200"
                  >
                    <input
                      ref={tableFileInputRef}
                      type="file"
                      accept=".csv,.tsv,.txt"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleTableFileUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <FileSpreadsheet size={15} className="text-emerald-400" />
                    <span className="text-xs font-mono">Upload or drop .CSV, .TSV, or .TXT tabular file</span>
                  </div>

                  <textarea
                    value={rawTableText}
                    onChange={(e) => setRawTableText(e.target.value)}
                    placeholder="Auto-detects Markdown pipes (|), CSV (comma), TSV (tab/Excel copy-paste), or semicolon (;)...&#10;&#10;Name,Damage,Range,Cost,DC,Special&#10;Viper Carbine,3d8,60ft,1280,18,Thermal Melt"
                    className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:border-emerald-500/60 shadow-inner"
                  />

                  <button
                    type="button"
                    onClick={() => handleParseTable()}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
                  >
                    <Table size={15} />
                    <span>Auto-Detect Delimiter & Parse Table</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Column: Staged Records & In-Place Verification */}
        <div className="col-span-12 xl:col-span-7 flex flex-col space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col h-full shadow-lg overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-mono font-bold text-slate-200 flex items-center gap-2">
                  <Search size={15} className="text-cyan-400" />
                  <span>STAGED OMNICORTEX RECORDS ({parsedItems.length})</span>
                </h2>
                {parsedItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 underline cursor-pointer"
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
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                      title="Download parsed JSON file"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">Export JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInject}
                      disabled={isInjecting || selectedItemIds.size === 0}
                      className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
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

            {/* Main Staging List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[720px]">
              
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
                      {validationReport.isValid ? `Omnicortex Schema Validation: ${validationReport.validCount} valid entries` : 'Validation Errors Detected'}
                    </span>
                  </div>
                  {validationReport.errors.length > 0 && (
                    <ul className="list-disc pl-5 opacity-90 space-y-0.5">
                      {validationReport.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  )}
                  {validationReport.warnings.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-emerald-500/20 text-[11px] text-amber-300 opacity-90">
                      <strong>Schema Notices:</strong>
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
                      • <strong>{injectionResults.createdCount}</strong> new entries created in <code className="text-cyan-300">{targetCollection}</code>.<br />
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

              {/* Search Filter */}
              {parsedItems.length > 3 && (
                <div className="relative">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter staged records by name, ID, or keywords..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                </div>
              )}

              {/* Empty State */}
              {parsedItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
                  <Database size={40} className="text-slate-600 mb-3" />
                  <h3 className="text-sm font-mono font-bold text-slate-400 uppercase">
                    No Records Staged for Ingestion
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Upload a document or paste raw text on the left, then click Parse with BASTION to stage entries for verification and revision.
                  </p>
                </div>
              ) : (
                /* Staged Item Cards Grid */
                <div className="space-y-3">
                  {filteredItems.map((item, idx) => {
                    const isSelected = selectedItemIds.has(item.id);
                    const isExpanded = expandedJsonIds.has(item.id);
                    const existing = existingIdsMap.get(item.id.toLowerCase()) || existingIdsMap.get((item.name || '').toLowerCase());
                    const tl = item.tech_level ?? item.tl ?? 0;
                    const ml = item.meta_level ?? item.ml ?? 0;
                    const isFolioReady = item._folioHealth?.isFolioReady ?? true;

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
                              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <h3 className="font-mono font-bold text-sm text-cyan-300 truncate flex items-center gap-2">
                                <span>{item.name || 'Unnamed'}</span>
                                {item.title && item.title !== item.name && (
                                  <span className="text-[10px] font-mono text-slate-400 font-normal truncate">
                                    ({item.title})
                                  </span>
                                )}
                              </h3>
                              <span className="text-[10px] font-mono text-slate-500">
                                ID: <code className="text-slate-400">{item.id}</code>
                              </span>
                            </div>
                          </div>

                          {/* Status & Verification Badges */}
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

                            {isFolioReady ? (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 font-bold border border-teal-500/30 flex items-center gap-1">
                                <Check size={10} /> FOLIO READY
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                                <AlertTriangle size={10} /> FOLIO NOTICE
                              </span>
                            )}

                            {item.costs?.bp !== undefined && item.costs.bp !== 0 && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 font-bold border border-purple-500/30">
                                {item.costs.bp > 0 ? `+${item.costs.bp}` : item.costs.bp} BP
                              </span>
                            )}
                            {item.costs?.credits > 0 && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-500/30">
                                {item.costs.credits.toLocaleString()} Cr
                              </span>
                            )}
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                              TL {tl} • ML {ml}
                            </span>
                          </div>
                        </div>

                        {/* Description & Core Mechanics Preview */}
                        <p className="text-xs font-sans text-slate-300 line-clamp-2 mb-2 leading-relaxed">
                          {item.description || item.body || 'No description provided.'}
                        </p>

                        {item.mechanic && (
                          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 mb-2">
                            <span className="text-slate-500 uppercase font-bold mr-1">Mechanic:</span>
                            <span>{item.mechanic}</span>
                          </div>
                        )}

                        {/* Modifiers List Preview */}
                        {Array.isArray(item.modifiers) && item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.modifiers.map((m, mIdx) => (
                              <span key={mIdx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                                {m.target}: {m.value > 0 ? `+${m.value}` : m.value} ({m.mode})
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card Footer: Revision & Inspection Actions */}
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] font-mono text-slate-500">
                          <div className="flex items-center gap-2">
                            {item.parent_species && (
                              <span>Lineage: <strong className="text-slate-400">{item.parent_species}</strong></span>
                            )}
                            {item.classification && (
                              <span>Classification: <strong className="text-slate-400">{Array.isArray(item.classification) ? item.classification.join(', ') : item.classification}</strong></span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {existing && (
                              <button
                                type="button"
                                onClick={() => handleOpenDiff(item)}
                                className="px-2 py-1 rounded bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/40 flex items-center gap-1 transition-all cursor-pointer text-[10px]"
                                title="Compare changes against existing Omnicortex record"
                              >
                                <GitCompare size={11} />
                                <span>Diff</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenRevision(item)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Edit3 size={11} />
                              <span>Revise / Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleJsonExpand(item.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Code size={11} />
                              <span>{isExpanded ? 'Hide JSON' : 'JSON'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Expanded JSON Inspector */}
                        {isExpanded && (
                          <div className="mt-3 p-3 rounded-xl bg-black border border-slate-800 overflow-x-auto text-[10px] font-mono text-cyan-400/90 max-h-60">
                            <pre>{JSON.stringify(item, null, 2)}</pre>
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

      {/* ─────────────────────────────────────────────────────────────────────────
          IN-PLACE REVISION MODAL
      ───────────────────────────────────────────────────────────────────────── */}
      {revisingItem && revisionForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-100 uppercase">
                    Revise Omnicortex Entry: {revisingItem.name}
                  </h3>
                  <div className="text-[10px] font-mono text-slate-400">
                    Collection: <code className="text-cyan-400">{targetCollection}</code> • ID: <code className="text-slate-400">{revisingItem.id}</code>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseRevision}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
              
              {/* Row 1: Name & Formal Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Designation / Name</label>
                  <input
                    type="text"
                    value={revisionForm.name || ''}
                    onChange={(e) => setRevisionForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Formal Title</label>
                  <input
                    type="text"
                    value={revisionForm.title || ''}
                    onChange={(e) => setRevisionForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              {/* Row 2: Parent Species & Tech Level */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Parent Species / Lineage</label>
                  <input
                    type="text"
                    value={revisionForm.parent_species || ''}
                    onChange={(e) => setRevisionForm(prev => ({ ...prev, parent_species: e.target.value }))}
                    placeholder="E.g., Aulurans"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Tech Level (TL)</label>
                  <input
                    type="number"
                    value={revisionForm.tech_level ?? 3}
                    onChange={(e) => setRevisionForm(prev => ({ ...prev, tech_level: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Meta Level (ML)</label>
                  <input
                    type="number"
                    value={revisionForm.meta_level ?? 0}
                    onChange={(e) => setRevisionForm(prev => ({ ...prev, meta_level: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              {/* Row 3: Costs Grid */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-[10px] uppercase text-cyan-400 font-bold block mb-2">Resource Costs Map</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase">BP</span>
                    <input
                      type="number"
                      value={revisionForm.costs?.bp ?? 0}
                      onChange={(e) => setRevisionForm(prev => ({ ...prev, costs: { ...prev.costs, bp: parseInt(e.target.value) || 0 } }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-center text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase">Credits</span>
                    <input
                      type="number"
                      value={revisionForm.costs?.credits ?? 0}
                      onChange={(e) => setRevisionForm(prev => ({ ...prev, costs: { ...prev.costs, credits: parseInt(e.target.value) || 0 } }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-center text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase">Nodes</span>
                    <input
                      type="number"
                      value={revisionForm.costs?.nodes ?? 0}
                      onChange={(e) => setRevisionForm(prev => ({ ...prev, costs: { ...prev.costs, nodes: parseInt(e.target.value) || 0 } }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-center text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase">Sockets</span>
                    <input
                      type="number"
                      value={revisionForm.costs?.sockets ?? 0}
                      onChange={(e) => setRevisionForm(prev => ({ ...prev, costs: { ...prev.costs, sockets: parseInt(e.target.value) || 0 } }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-center text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase">Strain</span>
                    <input
                      type="number"
                      value={revisionForm.costs?.strain ?? 0}
                      onChange={(e) => setRevisionForm(prev => ({ ...prev, costs: { ...prev.costs, strain: parseInt(e.target.value) || 0 } }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-center text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase">Focus</span>
                    <input
                      type="number"
                      value={revisionForm.costs?.focus ?? 0}
                      onChange={(e) => setRevisionForm(prev => ({ ...prev, costs: { ...prev.costs, focus: parseInt(e.target.value) || 0 } }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-center text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase">AP</span>
                    <input
                      type="number"
                      value={revisionForm.costs?.ap ?? 0}
                      onChange={(e) => setRevisionForm(prev => ({ ...prev, costs: { ...prev.costs, ap: parseInt(e.target.value) || 0 } }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-center text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Modifiers List Editor */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase text-cyan-400 font-bold">Modifiers List</label>
                  <button
                    type="button"
                    onClick={handleAddModifier}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    <Plus size={12} /> Add Modifier
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {revisionForm.modifiers.map((mod, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-900 p-1.5 rounded border border-slate-800">
                      <input
                        type="text"
                        value={mod.target || ''}
                        onChange={(e) => handleModifierChange(idx, 'target', e.target.value)}
                        placeholder="Target Stat"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-slate-100 text-xs"
                      />
                      <select
                        value={mod.type || 'attribute'}
                        onChange={(e) => handleModifierChange(idx, 'type', e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded p-1 text-slate-100 text-xs"
                      >
                        <option value="attribute">attribute</option>
                        <option value="skill">skill</option>
                        <option value="feature">feature</option>
                        <option value="combat">combat</option>
                        <option value="discipline">discipline</option>
                      </select>
                      <input
                        type="number"
                        value={mod.value || 0}
                        onChange={(e) => handleModifierChange(idx, 'value', parseInt(e.target.value) || 0)}
                        className="w-14 bg-slate-950 border border-slate-700 rounded p-1 text-center text-slate-100 text-xs"
                      />
                      <select
                        value={mod.mode || 'inherent'}
                        onChange={(e) => handleModifierChange(idx, 'mode', e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded p-1 text-slate-100 text-xs"
                      >
                        <option value="inherent">inherent</option>
                        <option value="bonus_pool">bonus_pool</option>
                        <option value="choice_pool">choice_pool</option>
                        <option value="recommended">recommended</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveModifier(idx)}
                        className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Mechanics & Description */}
              <div>
                <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Game Mechanics / Rules</label>
                <textarea
                  value={revisionForm.mechanic || ''}
                  onChange={(e) => setRevisionForm(prev => ({ ...prev, mechanic: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 resize-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Lore / Description</label>
                <textarea
                  value={revisionForm.description || revisionForm.body || ''}
                  onChange={(e) => setRevisionForm(prev => ({ ...prev, description: e.target.value, body: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 resize-none font-sans text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Architect / GM Note</label>
                <input
                  type="text"
                  value={revisionForm.note || ''}
                  onChange={(e) => setRevisionForm(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
              <button
                type="button"
                onClick={handleCloseRevision}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveRevision}
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              >
                <Check size={14} />
                <span>Save Revision to Staging</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SIDE-BY-SIDE RECORD DIFF INSPECTOR MODAL
      ───────────────────────────────────────────────────────────────────────── */}
      {diffModalItem && (() => {
        const existingItem = existingIdsMap.get((diffModalItem.id || '').toLowerCase()) || 
                             existingIdsMap.get(((diffModalItem.name || '').toLowerCase()));
        
        // Helper to format values for diff comparison
        const formatValue = (val) => {
          if (val === null || val === undefined) return '<empty>';
          if (typeof val === 'object') return JSON.stringify(val, null, 1);
          return String(val);
        };

        const fieldsToCompare = [
          { key: 'name', label: 'Designation / Name' },
          { key: 'title', label: 'Formal Title' },
          { key: 'parent_species', label: 'Parent Lineage' },
          { key: 'tech_level', label: 'Tech Level (TL)' },
          { key: 'meta_level', label: 'Meta Level (ML)' },
          { key: 'craft_dc', label: 'Craft / Design DC' },
          { key: 'costs', label: 'Resource Costs Map', isJson: true },
          { key: 'modifiers', label: 'Modifiers Array', isJson: true },
          { key: 'mechanic', label: 'Game Mechanics' },
          { key: 'description', label: 'Lore / Description' },
          { key: 'note', label: 'Architect / GM Notes' },
          { key: 'stigma', label: 'Social Stigma' },
          { key: 'homeworld', label: 'Homeworld' },
          { key: 'category', label: 'Category' },
          { key: 'sp', label: 'Structure Points (SP)' },
          { key: 'dr', label: 'Damage Resistance (DR)' }
        ];

        const diffRows = fieldsToCompare.map(f => {
          const existVal = existingItem ? existingItem[f.key] : undefined;
          const stagedVal = diffModalItem[f.key];

          const existStr = formatValue(existVal);
          const stagedStr = formatValue(stagedVal);

          let status = 'unchanged';
          if (existVal === undefined || existVal === null || existVal === '') {
            if (stagedVal !== undefined && stagedVal !== null && stagedVal !== '') {
              status = 'added';
            }
          } else if (existStr !== stagedStr) {
            status = 'modified';
          }

          return {
            ...f,
            existVal,
            stagedVal,
            existStr,
            stagedStr,
            status
          };
        }).filter(row => row.existVal !== undefined || row.stagedVal !== undefined);

        const modifiedCount = diffRows.filter(r => r.status === 'modified').length;
        const addedCount = diffRows.filter(r => r.status === 'added').length;

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Diff Modal Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-500/40">
                    <GitCompare size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-slate-100 uppercase flex items-center gap-2">
                      <span>Diff Comparison: {diffModalItem.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                        {modifiedCount} Modified • {addedCount} Added
                      </span>
                    </h3>
                    <div className="text-[10px] font-mono text-slate-400">
                      Collection: <code className="text-cyan-400">{targetCollection}</code> • ID: <code className="text-slate-400">{diffModalItem.id}</code>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDiff}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Diff Content Body */}
              <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
                
                {/* Visual Legend */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      <span>Modified Value</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Newly Added Field</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                      <span>Unchanged</span>
                    </span>
                  </div>
                  <span className="text-slate-500">
                    Conflict Strategy: <strong className="text-cyan-400 uppercase">{conflictStrategy}</strong>
                  </span>
                </div>

                {/* Diff Comparison Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase text-slate-400 font-bold">
                        <th className="p-3 w-1/4">Field Attribute</th>
                        <th className="p-3 w-3/8 border-l border-slate-800 bg-slate-950/80">Existing Omnicortex</th>
                        <th className="p-3 w-3/8 border-l border-slate-800 bg-cyan-950/20 text-cyan-300">Incoming Staged</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-xs">
                      {diffRows.map((row) => {
                        const isModified = row.status === 'modified';
                        const isAdded = row.status === 'added';

                        return (
                          <tr 
                            key={row.key}
                            className={`transition-colors ${
                              isModified 
                                ? 'bg-amber-950/20' 
                                : isAdded 
                                  ? 'bg-emerald-950/20' 
                                  : 'hover:bg-slate-800/30'
                            }`}
                          >
                            <td className="p-3 align-top">
                              <div className="font-bold text-slate-200">{row.label}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <code>{row.key}</code>
                                {isModified && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-500/40">
                                    MOD
                                  </span>
                                )}
                                {isAdded && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                                    NEW
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Existing Record Column */}
                            <td className="p-3 align-top border-l border-slate-800 text-slate-400">
                              {row.existVal !== undefined && row.existVal !== null ? (
                                row.isJson ? (
                                  <pre className="text-[10px] max-h-36 overflow-y-auto p-2 bg-slate-950/70 rounded border border-slate-800 text-slate-300 whitespace-pre-wrap">
                                    {row.existStr}
                                  </pre>
                                ) : (
                                  <div className="whitespace-pre-wrap break-words">{row.existStr}</div>
                                )
                              ) : (
                                <span className="text-slate-600 italic">None / Not Set</span>
                              )}
                            </td>

                            {/* Staged Record Column */}
                            <td className={`p-3 align-top border-l border-slate-800 ${
                              isModified 
                                ? 'text-amber-200 font-medium' 
                                : isAdded 
                                  ? 'text-emerald-300 font-medium' 
                                  : 'text-slate-300'
                            }`}>
                              {row.stagedVal !== undefined && row.stagedVal !== null ? (
                                row.isJson ? (
                                  <pre className="text-[10px] max-h-36 overflow-y-auto p-2 bg-slate-950/90 rounded border border-slate-800 text-cyan-300 whitespace-pre-wrap">
                                    {row.stagedStr}
                                  </pre>
                                ) : (
                                  <div className="whitespace-pre-wrap break-words">{row.stagedStr}</div>
                                )
                              ) : (
                                <span className="text-slate-600 italic">None</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Diff Modal Footer */}
              <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
                <button
                  type="button"
                  onClick={handleCloseDiff}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Close Diff Inspector
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseDiff();
                      handleOpenRevision(diffModalItem);
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                  >
                    <Edit3 size={14} />
                    <span>Open in Revision Workbench</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

