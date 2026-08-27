import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CODEX_MATRICES, getMatrixById } from './codexConfig';
import { CodexSidebar } from './CodexSidebar';
import { CodexMatrixBuilder } from './CodexMatrixBuilder';
import { CodexAiSynthesizerModal } from './CodexAiSynthesizerModal';
import { useDBM } from '../../context/DBMContext';
import { 
  Plus, 
  Sparkles, 
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
  LayoutGrid
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [viewSavedRecords, setViewSavedRecords] = useState(false);

  const { dbData, deleteEntry } = useDBM() || {};
  const currentMatrix = getMatrixById(activeMatrixId);

  const handleSelectMatrix = (matrixId, datasetKey) => {
    setActiveMatrixId(matrixId);
    const params = { matrix: matrixId };
    if (datasetKey) params.dataset = datasetKey;
    setSearchParams(params);
    setSelectedItem(null);
    setIsBuilderOpen(false);
    setPreviewItem(null);
    setSearchTerm('');
    setViewSavedRecords(false);
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
        // If items have a matrix_type or match collection
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

      {/* Left Navigation Sidebar */}
      <CodexSidebar
        activeMatrixId={activeMatrixId}
        onSelectMatrix={handleSelectMatrix}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 p-4 sm:p-6 lg:p-8">
        
        {/* Matrix Header Toolbar */}
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-lg shrink-0 mb-6">
          <div className="flex items-center gap-3.5 min-w-0">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
              style={{ background: `${currentMatrix.color}25`, border: `1px solid ${currentMatrix.color}80`, color: currentMatrix.color }}
            >
              <Icon size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider" style={{ background: `${currentMatrix.color}20`, color: currentMatrix.color }}>
                  {currentMatrix.badge}
                </span>
                <span className="text-slate-600 font-mono text-xs">•</span>
                <span className="text-xs font-mono text-slate-400 truncate">{currentMatrix.category}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold font-mono tracking-wider text-white uppercase mt-0.5 truncate">
                {currentMatrix.name} MATRIX
              </h1>
            </div>
          </div>

          {/* Action Controls & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${currentMatrix.name.toLowerCase()}...`}
                className="pl-8 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono w-44 sm:w-56 shadow-inner"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
            </div>

            {/* Dashboard vs Saved Records Toggle (for dashboard viewType matrices) */}
            {currentMatrix.viewType === 'dashboard' && (
              <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    setViewSavedRecords(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    !viewSavedRecords 
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers size={13} />
                  <span>Interactive Suite</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    setViewSavedRecords(true);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewSavedRecords 
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span>Database Records ({matrixEntries.length})</span>
                </button>
              </div>
            )}

            {/* Ingest Dataset trigger (when not already in ingestion engine) */}
            {activeMatrixId !== 'ingestion-engine' && (
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.03);
                  handleSelectMatrix('ingestion-engine', currentMatrix.ingestionKey || 'species');
                }}
                className="px-3.5 py-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title={`Bulk ingest ${currentMatrix.name} records`}
              >
                <Database size={14} className="text-amber-400" />
                <span className="hidden lg:inline">Ingest Dataset</span>
              </button>
            )}

            {/* BASTION Synthesizer trigger */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                setIsAiModalOpen(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer"
            >
              <Cpu size={14} />
              <span className="hidden sm:inline">BASTION Synthesizer</span>
            </button>

            {/* Create Matrix Item trigger */}
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
            >
              <Plus size={15} />
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
            <>
              {matrixEntries.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-slate-900/20 border border-dashed border-slate-800">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 opacity-60"
                    style={{ background: `${currentMatrix.color}15`, color: currentMatrix.color }}
                  >
                    <Icon size={32} />
                  </div>
                  <h3 className="text-base font-mono font-bold text-slate-300 uppercase tracking-wide">
                    No {currentMatrix.name} Entries Found
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
                    {currentMatrix.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCreateNew}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    >
                      <Plus size={14} />
                      <span>Create Guided Entry</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAiModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      <Cpu size={14} />
                      <span>Synthesize with BASTION</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
                  {matrixEntries.map((item) => {
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
                          <span className="truncate max-w-[120px]">
                            {item.category || item.type || currentMatrix.name}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-700/60 transition-colors"
                              title="Edit Entry"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(item, e)}
                              className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                              title="Delete Entry"
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
            </>
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
    </div>
  );
};

export default CodexApp;
