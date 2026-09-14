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

            {/* Matrix HUD Selector Pill with Quick-Jump Dropdown */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-wider" style={{ background: `${currentMatrix.color}20`, color: currentMatrix.color }}>
                  {currentMatrix.badge}
                </span>
                <span className="text-slate-600 font-mono text-[10px]">•</span>
                <span className="text-[10px] font-mono text-slate-400 truncate hidden sm:inline">{currentMatrix.category}</span>
              </div>

              <div className="relative inline-flex items-center mt-0.5 group">
                <select
                  value={activeMatrixId}
                  onChange={(e) => handleSelectMatrix(e.target.value)}
                  className="appearance-none bg-transparent hover:bg-slate-800/60 pr-6 py-0.5 rounded text-sm sm:text-base font-extrabold font-mono tracking-wide text-white uppercase cursor-pointer outline-none transition-colors border-b border-transparent hover:border-amber-400"
                  title="Click to Quick-Jump to another Matrix"
                >
                  {CODEX_MATRICES.map((m) => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                      {m.name} MATRIX ({m.category})
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-0 text-amber-400 pointer-events-none group-hover:translate-y-0.5 transition-transform" />
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
              title={`Open ${currentMatrix.name} Cockpit Studio`}
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
            <div className="space-y-4">
              {/* Records Filter & Control HUD */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={`Filter ${currentMatrix.name.toLowerCase()}...`}
                      className="pl-8 pr-3 py-1.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono w-44 sm:w-60 shadow-inner"
                    />
                    <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
                  </div>

                  {/* Tech Level (TL) Filter Chips */}
                  <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-0.5 text-[10px] font-mono">
                    {['ALL', '0', '1', '2', '3', '4', '5'].map((tl) => (
                      <button
                        key={tl}
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(950, 0.02);
                          setTlFilter(tl);
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-all font-bold uppercase cursor-pointer ${
                          tlFilter === tl
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tl === 'ALL' ? 'All TL' : `TL${tl}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    Showing <strong className="text-slate-200">{filteredEntries.length}</strong> of {matrixEntries.length}
                  </span>

                  {/* Cards vs High-Density Table View Toggle */}
                  <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(900, 0.02);
                        setRecordsViewMode('cards');
                      }}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        recordsViewMode === 'cards'
                          ? 'bg-slate-800 text-amber-300 shadow-sm'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title="Card Grid View"
                    >
                      <LayoutGrid size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(900, 0.02);
                        setRecordsViewMode('table');
                      }}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        recordsViewMode === 'table'
                          ? 'bg-slate-800 text-cyan-300 shadow-sm'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title="Tactical Table View"
                    >
                      <Table size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Records Content */}
              {filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-10 rounded-2xl bg-slate-900/20 border border-dashed border-slate-800 min-h-[320px]">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 opacity-60"
                    style={{ background: `${currentMatrix.color}15`, color: currentMatrix.color }}
                  >
                    <Icon size={28} />
                  </div>
                  <h3 className="text-base font-mono font-bold text-slate-300 uppercase tracking-wide">
                    {matrixEntries.length === 0
                      ? `No ${currentMatrix.name} Entries In Omnicortex`
                      : `No Entries Matching Filter (TL ${tlFilter})`}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1 mb-5 font-mono">
                    {matrixEntries.length === 0
                      ? currentMatrix.description
                      : 'Try selecting All TL or clearing your search filter.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {matrixEntries.length > 0 && tlFilter !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => {
                          setTlFilter('ALL');
                          setSearchTerm('');
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold uppercase transition-all"
                      >
                        Clear Filters
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCreateNew}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>New Blueprint</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAiModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Cpu size={14} />
                      <span>Synthesize with BASTION</span>
                    </button>
                  </div>
                </div>
              ) : recordsViewMode === 'table' ? (
                /* High-Density Tactical Table View */
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md overflow-hidden shadow-lg">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-4 font-bold">Designation / Title</th>
                        <th className="py-2.5 px-2 text-center w-16">TL</th>
                        <th className="py-2.5 px-2 text-center w-16">ML</th>
                        <th className="py-2.5 px-3 text-right w-28">Value (Cr)</th>
                        <th className="py-2.5 px-3 w-36">Category / Type</th>
                        <th className="py-2.5 px-4">Summary / Mechanics</th>
                        <th className="py-2.5 px-4 text-right w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {filteredEntries.map((item) => {
                        const itemName = item.name || item.title || 'Untitled';
                        const tl = item.tl ?? item.tech_level ?? 0;
                        const ml = item.ml ?? item.meta_level ?? 0;
                        const cr = item._computed?.credit_value || item.cost || item.price || 0;

                        return (
                          <tr
                            key={item.id}
                            onClick={() => handleEdit(item)}
                            className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                          >
                            <td className="py-2 px-4 font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                              {itemName}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-cyan-300">
                                TL{tl}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              {ml > 0 ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 border border-purple-800 text-purple-300">
                                  ML{ml}
                                </span>
                              ) : (
                                <span className="text-slate-600 text-[10px]">—</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-amber-300">
                              {cr ? `${Number(cr).toLocaleString()} Cr` : '—'}
                            </td>
                            <td className="py-2 px-3 text-[11px] text-slate-400 truncate max-w-[140px]">
                              {item.category || item.type || currentMatrix.name}
                            </td>
                            <td className="py-2 px-4 text-[11px] text-slate-400 line-clamp-1">
                              {item.description || item.fields?.summary || item.mechanic || '—'}
                            </td>
                            <td className="py-2 px-4 text-right">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleEdit(item)}
                                  className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-700/60 transition-colors"
                                  title="Open in Cockpit Studio"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDuplicate(item, e)}
                                  className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-700/60 transition-colors"
                                  title="Duplicate / Clone Blueprint"
                                >
                                  <Copy size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(item, e)}
                                  className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                                  title="Delete Blueprint"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Cards Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
                  {filteredEntries.map((item) => {
                    const itemName = item.name || item.title || 'Untitled';
                    const tl = item.tl ?? item.tech_level ?? 0;
                    const ml = item.ml ?? item.meta_level ?? 0;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleEdit(item)}
                        className="bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3 group cursor-pointer hover:bg-slate-800/60 hover:shadow-[0_8px_25px_rgba(245,158,11,0.12)] transition-all transform hover:-translate-y-0.5"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="font-mono font-bold text-sm text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-1">
                              {itemName}
                            </h3>
                            <div className="flex items-center gap-1 shrink-0">
                              {item._computed?.credit_value ? (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-500/40">
                                  {Number(item._computed.credit_value).toLocaleString()} Cr
                                </span>
                              ) : null}
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                                TL{tl}
                              </span>
                              {ml > 0 && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">
                                  ML{ml}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description || item.fields?.summary || item.mechanic || 'No description provided.'}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 mt-auto">
                          <span className="truncate max-w-[110px]">
                            {item.category || item.type || currentMatrix.name}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-700/60 transition-colors"
                              title="Open in Cockpit Studio"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDuplicate(item, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700/60 transition-colors"
                              title="Duplicate Blueprint"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(item, e)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                              title="Delete Blueprint"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
