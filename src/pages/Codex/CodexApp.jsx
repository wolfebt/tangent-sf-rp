import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CODEX_MATRICES, getMatrixById } from './codexConfig';
import { CodexSidebar } from './CodexSidebar';
import { CodexMatrixBuilder } from './CodexMatrixBuilder';
import { CodexAiSynthesizerModal } from './CodexAiSynthesizerModal';
import { CodexIngestionModal } from './CodexIngestionModal';
import { OMNICORTEX_DATASETS } from './codexPromptRegistry';
import { useDBM } from '../../context/DBMContext';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Database, 
  ExternalLink, 
  BookOpen,
  Eye,
  Sliders,
  Cpu,
  Bot,
  Layers,
  LayoutGrid,
  PanelLeftOpen,
  FileText,
  ChevronDown,
  Copy,
  Table
} from 'lucide-react';
import { EconomatrixDashboard } from './EconomatrixDashboard';
import { TechnologyCodex } from './TechnologyCodex';
import { ScalingCodex } from './ScalingCodex';
import { CodexIngestionEngine } from './CodexIngestionEngine';
import { CodexDatasetDashboard } from './CodexDatasetDashboard';
import { AudioService } from '../../services/audioService';
import { confirmTypedDeletion } from '../../utils/confirmationUtils';

export const CodexApp = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const matrixParam = searchParams.get('matrix') || 'architecture';
  const datasetParam = searchParams.get('dataset') || '';

  const [activeMatrixId, setActiveMatrixId] = useState(matrixParam);
  const [searchTerm, setSearchTerm] = useState('');
  const [tlFilter, setTlFilter] = useState('ALL');
  const [recordsViewMode, setRecordsViewMode] = useState('cards'); // 'cards' | 'table'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [viewSavedRecords, setViewSavedRecords] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { dbData, deleteEntry } = useDBM() || {};
  const currentMatrix = getMatrixById(activeMatrixId);
  const [parsingDatasetKey, setParsingDatasetKey] = useState(currentMatrix.ingestionKey || 'species');

  // Active matrix mode: 'guided' | 'records' | 'suite'
  const activeMode = useMemo(() => {
    if (isBuilderOpen) return 'guided';
    if (currentMatrix.viewType === 'dashboard') {
      return viewSavedRecords ? 'records' : 'suite';
    }
    return 'records';
  }, [isBuilderOpen, currentMatrix.viewType, viewSavedRecords]);

  // Keep parsing dataset synchronized with the current active matrix
  useEffect(() => {
    if (currentMatrix.ingestionKey) {
      setParsingDatasetKey(currentMatrix.ingestionKey);
    }
  }, [currentMatrix]);

  const handleSelectMatrix = (matrixId, datasetKey) => {
    setActiveMatrixId(matrixId);
    const params = { matrix: matrixId };
    if (datasetKey) params.dataset = datasetKey;
    setSearchParams(params);
    setSelectedItem(null);
    setIsBuilderOpen(false);
    setPreviewItem(null);
    setSearchTerm('');
    setTlFilter('ALL');
    setViewSavedRecords(false);
  };

  const handleSwitchMode = (mode) => {
    AudioService.playTerminalBeep(1100, 0.02);
    if (mode === 'guided') {
      setIsBuilderOpen(true);
    } else if (mode === 'records') {
      setIsBuilderOpen(false);
      setViewSavedRecords(true);
    } else if (mode === 'suite') {
      setIsBuilderOpen(false);
      setViewSavedRecords(false);
    }
  };

  // Collect items belonging to this matrix from Omnicortex collections
  const matrixEntries = useMemo(() => {
    if (!dbData) return [];
    const primary = dbData[currentMatrix.targetCollection] || [];
    const alt = currentMatrix.altCollection ? (dbData[currentMatrix.altCollection] || []) : [];
    
    // Combine and deduplicate
    const combined = [...primary, ...alt];
    const unique = [];
    const seenIds = new Set();

    combined.forEach(item => {
      if (item && item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        unique.push(item);
      }
    });

    if (!searchTerm.trim()) return unique;
    const term = searchTerm.toLowerCase();
    return unique.filter(i => {
      const name = (i.name || i.title || '').toLowerCase();
      const desc = (i.description || i.mechanic || '').toLowerCase();
      const cat = (i.category || i.type || '').toString().toLowerCase();
      return name.includes(term) || desc.includes(term) || cat.includes(term);
    });
  }, [dbData, currentMatrix, searchTerm]);

  // Filter entries by Tech Level (TL)
  const filteredEntries = useMemo(() => {
    return matrixEntries.filter(item => {
      if (tlFilter !== 'ALL') {
        const itemTl = String(item.tl ?? item.tech_level ?? 0);
        if (itemTl !== tlFilter) return false;
      }
      return true;
    });
  }, [matrixEntries, tlFilter]);

  const handleCreateNew = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    setSelectedItem(null);
    setIsBuilderOpen(true);
    setPreviewItem(null);
  };

  const handleEdit = (item) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setSelectedItem(item);
    setIsBuilderOpen(true);
    setPreviewItem(null);
  };

  const handleDuplicate = (item, e) => {
    if (e) e.stopPropagation();
    AudioService.playTerminalBeep(1250, 0.03);
    const baseName = item.name || item.title || 'Untitled';
    const cloned = {
      ...item,
      id: `codex_${currentMatrix.id}_${Date.now()}`,
      name: `${baseName} (Variant)`,
      title: `${baseName} (Variant)`,
      updatedAt: new Date().toISOString()
    };
    setSelectedItem(cloned);
    setIsBuilderOpen(true);
    setPreviewItem(null);
  };

  const handleDelete = async (item, e) => {
    e.stopPropagation();
    const itemName = item.name || item.title || 'this entry';
    const confirmed = await confirmTypedDeletion(
      itemName,
      `delete the ${currentMatrix.name} entry "${itemName}" from Omnicortex`
    );

    if (confirmed) {
      AudioService.playTerminalBeep(700, 0.04);
      const targetCol = currentMatrix.targetCollection || 'compendium';
      await deleteEntry(item.id, targetCol);
      if (selectedItem?.id === item.id) {
        setIsBuilderOpen(false);
        setSelectedItem(null);
      }
      if (previewItem?.id === item.id) {
        setPreviewItem(null);
      }
    }
  };

  const handleSaveComplete = () => {
    setIsBuilderOpen(false);
    setSelectedItem(null);
  };

  const handleApplyAiData = (synthesizedData) => {
    setSelectedItem(synthesizedData);
    setIsBuilderOpen(true);
  };

  const Icon = currentMatrix.icon;

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#070a10] text-slate-100 font-sans select-none relative">
      {/* Background Ambience Glow */}
      <div 
        className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ background: currentMatrix.color }}
      />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Expand Tab (When Codex Sidebar Drawer is Collapsed) */}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1100, 0.03);
            setIsSidebarOpen(true);
          }}
          className="fixed left-2 top-1/2 -translate-y-1/2 z-40 px-2 py-4 bg-slate-950/95 hover:bg-slate-900 border-2 border-amber-500/70 hover:border-amber-400 text-amber-300 rounded-r-xl shadow-[0_0_25px_rgba(245,158,11,0.35)] flex flex-col items-center gap-2 transition-all group backdrop-blur-md cursor-pointer"
          title="Expand Codex Matrix Menu (▶)"
        >
          <PanelLeftOpen size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-mono font-bold uppercase [writing-mode:vertical-lr] tracking-widest text-slate-300 group-hover:text-amber-200">
            CODEX MATRICES
          </span>
        </button>
      )}

      {/* Left Navigation Collapsible Sidebar Drawer (Open by default) */}
      <div className={`fixed lg:relative z-40 h-full transition-all duration-300 shrink-0 ${
        isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:-ml-72 lg:opacity-0 pointer-events-none'
      }`}>
        <CodexSidebar
          activeMatrixId={activeMatrixId}
          onSelectMatrix={(matrixId, datasetKey) => {
            handleSelectMatrix(matrixId, datasetKey);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          onCloseMenu={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 p-4 sm:p-6 lg:p-8">
        
        {/* Cockpit Command Bar (HUD) */}
        <header className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-lg shrink-0 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(900, 0.02);
                setIsSidebarOpen(prev => !prev);
              }}
              className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-amber-300 transition-all cursor-pointer shrink-0"
              title={isSidebarOpen ? "Collapse Codex Sidebar" : "Expand Codex Sidebar"}
            >
              <PanelLeftOpen size={16} className={`transition-transform duration-200 ${isSidebarOpen ? 'text-amber-400' : 'rotate-180 text-slate-400'}`} />
            </button>

            {/* Matrix Icon & Glowing Badge */}
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0"
              style={{ background: `${currentMatrix.color}25`, border: `1px solid ${currentMatrix.color}80`, color: currentMatrix.color }}
            >
              <Icon size={20} />
            </div>

            {/* Dedicated Matrix HUD Title */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-wider" style={{ background: `${currentMatrix.color}20`, color: currentMatrix.color }}>
                  {currentMatrix.badge}
                </span>
                <span className="text-slate-600 font-mono text-[10px]">•</span>
                <span className="text-[10px] font-mono text-slate-400 truncate hidden sm:inline">{currentMatrix.category}</span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <h1 className="text-sm sm:text-base font-extrabold font-mono tracking-wide text-white uppercase truncate">
                  {currentMatrix.name} MATRIX
                </h1>
              </div>
            </div>
          </div>

          {/* Center Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => handleSwitchMode('guided')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'guided'
                  ? 'bg-amber-600/90 text-white shadow-sm border border-amber-500/60'
                  : 'text-slate-400 hover:text-amber-200 hover:bg-slate-900/60'
              }`}
              title={`Open ${currentMatrix.name} STUDIO`}
            >
              <Sliders size={13} className={activeMode === 'guided' ? 'text-amber-200' : 'text-slate-400'} />
              <span>Studio</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('records')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'records'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={`Browse Omnicortex records for ${currentMatrix.name}`}
            >
              <LayoutGrid size={13} className={activeMode === 'records' ? 'text-cyan-400' : 'text-slate-400'} />
              <span>Records ({matrixEntries.length})</span>
            </button>

            {currentMatrix.viewType === 'dashboard' && (
              <button
                type="button"
                onClick={() => handleSwitchMode('suite')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'suite'
                    ? 'bg-cyan-900/80 text-cyan-200 shadow-sm border border-cyan-500/50'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
                }`}
                title={`Open ${currentMatrix.name} Interactive Suite`}
              >
                <Layers size={13} className={activeMode === 'suite' ? 'text-cyan-300' : 'text-slate-400'} />
                <span>Suite</span>
              </button>
            )}
          </div>

          {/* Action Dock */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Focused Ingestion Button */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                setIsIngestionModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Ingest external markdown or raw rules into Omnicortex"
            >
              <Bot size={13} className="text-cyan-400" />
              <span className="hidden sm:inline">Ingest</span>
            </button>

            {/* BASTION Synthesizer Trigger */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                setIsAiModalOpen(true);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer"
              title="Synthesize blueprint with BASTION tactical AI"
            >
              <Cpu size={13} />
              <span>BASTION</span>
            </button>

            {/* New Entry Trigger */}
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
              title="Create new blank blueprint"
            >
              <Plus size={14} />
              <span>New Entry</span>
            </button>
          </div>
        </header>

        {/* Content View: Builder vs. Dashboard vs. Matrix Database Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-6">
          {isBuilderOpen ? (
            <CodexMatrixBuilder
              matrix={currentMatrix}
              initialData={selectedItem}
              onSaveComplete={handleSaveComplete}
              onCancel={() => {
                setIsBuilderOpen(false);
                setSelectedItem(null);
              }}
              onOpenAiSynthesizer={() => setIsAiModalOpen(true)}
              onDelete={(item) => handleDelete(item)}
            />
          ) : currentMatrix.viewType === 'dashboard' && !viewSavedRecords ? (
            activeMatrixId === 'scaling' ? (
              <ScalingCodex onOpenBuilder={handleCreateNew} />
            ) : activeMatrixId === 'economatrix' ? (
              <EconomatrixDashboard onOpenBuilder={handleCreateNew} />
            ) : activeMatrixId === 'technology' ? (
              <TechnologyCodex onOpenBuilder={handleCreateNew} />
            ) : activeMatrixId === 'ingestion-engine' ? (
              <CodexIngestionEngine initialDatasetKey={datasetParam || currentMatrix.ingestionKey || 'species'} />
            ) : null
          ) : (
            <CodexDatasetDashboard
              matrix={currentMatrix}
              records={matrixEntries}
              onOpenBuilder={handleCreateNew}
              onEditItem={handleEdit}
              onDuplicateItem={handleDuplicate}
              onDeleteItem={handleDelete}
              onOpenAiSynthesizer={() => setIsAiModalOpen(true)}
              onOpenIngestion={() => setIsIngestionModalOpen(true)}
            />
          )}
        </div>

      </main>

      {/* AIME AI Synthesizer Modal */}
      <CodexAiSynthesizerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        matrix={currentMatrix}
        onApplyGeneratedData={handleApplyAiData}
      />

      {/* Omnicortex Focused Ingestion Studio Modal */}
      <CodexIngestionModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        initialDatasetKey={parsingDatasetKey}
        focusedMode={true}
        onApplyEntry={(item) => {
          handleApplyAiData(item);
        }}
      />
    </div>
  );
};

export default CodexApp;
