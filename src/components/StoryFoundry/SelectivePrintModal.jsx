/**
 * @file SelectivePrintModal.jsx
 * @description Selective Print & Publishing Studio for Tangent SFF RP Adventure Modules.
 * Enables granular component selection (Cover, Synopsis, Beats, Prose, OSR Spread, Maps,
 * Waypoints, Read-Aloud Cards, Adversary Stat Blocks, and Player Handouts) with multiple
 * layout modes (OSR 2-Column, Novel, GM Card Deck) and clean @media print CSS styling.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Printer, 
  BookOpen, 
  LayoutGrid, 
  X, 
  CheckSquare, 
  Square, 
  Layers, 
  Sliders,
  Download,
  Shield
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { PagedPdfCompiler } from '../../engine/compilers/PagedPdfCompiler';
import {
  compileToEpubBlob,
  compileToWordHtmlBlob,
  compileToRtfBlob
} from '../../engine/compilers/DocumentExporters';
import {
  sanitizeScenarioForOperator,
  stripGmSecretHtmlBlocks
} from '../../utils/gmSecretSanitizer';

export const SelectivePrintModal = ({
  isOpen,
  onClose,
  universeState = {},
  elementsCatalog = [],
  activeScenario = null,
  activeMap = null,
  defaultOperatorSafeMode = false
}) => {
  // Selected Component Flags
  const [selectedSections, setSelectedSections] = useState({
    cover: true,
    synopsis: true,
    beats: true,
    prose: true,
    osrSpread: true,
    mapKeys: true,
    waypoints: true,
    readAloud: true,
    statBlocks: true,
    props: true,
    handouts: true
  });

  const [printLayout, setPrintLayout] = useState('osr_module'); // 'osr_module' | 'novel' | 'cards'
  const [operatorSafeMode, setOperatorSafeMode] = useState(Boolean(defaultOperatorSafeMode));
  const [includeToc, setIncludeToc] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setOperatorSafeMode(Boolean(defaultOperatorSafeMode));
    }
  }, [isOpen, defaultOperatorSafeMode]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSection = (key) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setSelectedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = (select) => {
    AudioService.playTerminalBeep(1000, 0.03);
    setSelectedSections({
      cover: select,
      synopsis: select,
      beats: select,
      prose: select,
      osrSpread: select,
      mapKeys: select,
      waypoints: select,
      readAloud: select,
      statBlocks: select,
      props: select,
      handouts: select
    });
  };

  const handleExecutePrint = () => {
    AudioService.playCriticalChime(true);
    window.print();
  };

  // Resolved Data
  const title = universeState?.projectName || universeState?.title || activeScenario?.title || 'Tactical Sector Adventure';
  const author = universeState?.author || 'ADE Studio Architect';
  const techLevel = universeState?.techLevel || activeScenario?.fields?.['tech-level'] || 3;
  const rawScenarios = universeState?.scenarios || (activeScenario ? [activeScenario] : []);
  const scenarios = operatorSafeMode
    ? rawScenarios.filter((s) => s && !s.isHidden && !s.isGmOnly).map((s) => sanitizeScenarioForOperator(s))
    : rawScenarios;
  const maps = universeState?.maps || (activeMap ? [activeMap] : []);
  const activeTargetMap = activeMap || maps[0] || null;

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    AudioService.playCriticalChime(true);
  };

  const buildExportOptions = () => ({
    adventureTitle: title,
    authorName: author,
    includeCoverPage: selectedSections.cover,
    includeToc,
    includeGmSecrets: !operatorSafeMode,
    includeProps: selectedSections.props,
    includeOsrSpread: selectedSections.osrSpread
  });

  const handleDownloadEpub = () => {
    const blob = compileToEpubBlob(scenarios, buildExportOptions());
    const slug = String(title).toLowerCase().replace(/[^a-z0-9_-]+/g, '_');
    triggerDownload(blob, `${slug}${operatorSafeMode ? '_operator' : ''}.epub`);
  };

  const handleDownloadWord = () => {
    const blob = compileToWordHtmlBlob(scenarios, buildExportOptions());
    const slug = String(title).toLowerCase().replace(/[^a-z0-9_-]+/g, '_');
    triggerDownload(blob, `${slug}${operatorSafeMode ? '_operator' : ''}.doc`);
  };

  const handleDownloadPagedHtml = () => {
    const { html } = PagedPdfCompiler.compileToPagedHtml(scenarios, buildExportOptions());
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const slug = String(title).toLowerCase().replace(/[^a-z0-9_-]+/g, '_');
    triggerDownload(blob, `${slug}${operatorSafeMode ? '_operator' : ''}.print.html`);
  };

  const handleDownloadRtf = () => {
    const blob = compileToRtfBlob(scenarios, buildExportOptions());
    const slug = String(title).toLowerCase().replace(/[^a-z0-9_-]+/g, '_');
    triggerDownload(blob, `${slug}${operatorSafeMode ? '_operator' : ''}.rtf`);
  };

  // Resolved scene beats
  const beatsRaw = activeScenario?.fields?.sceneBeats || universeState?.creativeState?.sceneBeats || '';
  const beatsList = beatsRaw.split('\n').map(b => b.trim()).filter(Boolean);

  // Resolved manuscript prose
  const rawProseText = activeScenario?.content || universeState?.creativeState?.storyDraft || '';
  const proseText = operatorSafeMode ? stripGmSecretHtmlBlocks(rawProseText) : rawProseText;
  const readAloudSource = operatorSafeMode
    ? stripGmSecretHtmlBlocks(activeScenario?.content || '')
    : (activeScenario?.content || '');
  const rawSynopsis = activeScenario?.fields?.summary || activeScenario?.fields?.goal || universeState?.creativeState?.storyOutline || '';
  const synopsisText = operatorSafeMode ? stripGmSecretHtmlBlocks(rawSynopsis) : rawSynopsis;

  // Personas & Adversaries (Operator Safe hides hidden/GM-only tokens and traps)
  const rawPersonas = elementsCatalog.filter(e => e.type === 'Persona');
  const personas = operatorSafeMode
    ? rawPersonas.filter((e) => !e.isHidden && !e.isGmOnly && e.fields?.playerVisible !== false)
    : rawPersonas;
  const rawTokensOnMap = activeTargetMap?.tokens || [];
  const tokensOnMap = operatorSafeMode
    ? rawTokensOnMap.filter((t) => t && !t.isHidden && !t.isGmOnly && t.type !== 'enemy' && (t.type === 'hero' || t.isPlayerVisible || t.visibleToPlayers))
    : rawTokensOnMap;

  // Props & Clues
  const rawPropsOnMap = activeTargetMap?.objects || [];
  const propsOnMap = operatorSafeMode
    ? rawPropsOnMap.filter((o) => o && !o.isHidden && !o.isGmOnly && !o.isTrap && !o.secret && !o.isSecret)
    : rawPropsOnMap;
  const rawClues = elementsCatalog.filter(e => e.type === 'Clue' || e.type === 'Handout');
  const clues = operatorSafeMode
    ? rawClues.filter((c) => c && !c.isHidden && !c.isGmOnly && c.fields?.playerVisible !== false)
    : rawClues;

  // Waypoints
  const rawWaypoints = activeTargetMap?.waypoints || [];
  const waypoints = operatorSafeMode ? rawWaypoints.filter((w) => w && w.isPlayerVisible) : rawWaypoints;

  const modalContent = (
    <div
      id="ade-print-portal-root"
      className="fixed inset-0 z-[230] bg-black/90 backdrop-blur-md flex items-start justify-center p-2 sm:p-5 pt-6 pb-8 overflow-y-auto font-sans select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="ade-print-shell bg-[#0b0f19] border border-cyan-500/60 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col text-slate-200">
        
        {/* ── TOP CONTROL HEADER ── */}
        <div className="px-5 py-3 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-purple-950/80 border-b border-cyan-500/40 flex items-center justify-between no-print flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-300">
              <Printer size={16} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-cyan-300 font-mono uppercase tracking-wider">
                ADE Selective Print & Publishing Studio
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Selectively compose fiction manuscripts, tactical adventure modules, or Architect reference cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Layout Style Toggle */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setPrintLayout('osr_module')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  printLayout === 'osr_module'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Black and white OSR 2-Column Adventure Module"
              >
                <LayoutGrid size={11} />
                <span>OSR Module</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintLayout('novel')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  printLayout === 'novel'
                    ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Indented Book Fiction Manuscript"
              >
                <BookOpen size={11} />
                <span>Fiction Book</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintLayout('cards')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  printLayout === 'cards'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Index Card Deck for Architect Tabletop"
              >
                <Layers size={11} />
                <span>Architect Cards</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setOperatorSafeMode((v) => !v)}
              className={`px-2 py-1 rounded-xl font-mono font-bold text-[10.5px] flex items-center gap-1 cursor-pointer border transition-colors ${
                operatorSafeMode
                  ? 'bg-amber-950/80 border-amber-400 text-amber-200'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Strip GM Secrets & Threat Stats for Player-Safe Distribution"
            >
              <Shield size={11} />
              <span>{operatorSafeMode ? 'Operator Safe' : 'Architect Full'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIncludeToc((v) => !v)}
              className={`px-2 py-1 rounded-xl font-mono font-bold text-[10.5px] cursor-pointer border transition-colors ${
                includeToc
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
              title="Include Auto Table of Contents"
            >
              TOC {includeToc ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={handleDownloadEpub}
              className="px-2.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-mono font-bold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer"
              title="Download Valid EPUB 3 E-Book"
            >
              <Download size={12} />
              <span>EPUB</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadWord}
              className="px-2.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/50 font-mono font-bold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer"
              title="Download Word-Compatible Manuscript (.doc)"
            >
              <Download size={12} />
              <span>WORD</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPagedHtml}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono font-bold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer"
              title="Download Paged Media Print HTML"
            >
              <Download size={12} />
              <span>HTML</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadRtf}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-500/40 font-mono font-bold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer"
              title="Download Universal Rich Text Format (.rtf)"
            >
              <Download size={12} />
              <span>RTF</span>
            </button>

            <button
              type="button"
              onClick={handleExecutePrint}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── SELECTIVE FILTER BAR (CHECKBOXES) ── */}
        <div className="p-3 bg-slate-950/95 border-b border-slate-800 no-print flex items-center justify-between gap-2 overflow-x-auto text-[10.5px] font-mono scrollbar-thin">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-400 font-bold uppercase tracking-wider pr-1 border-r border-slate-800 flex items-center gap-1">
              <Sliders size={12} className="text-cyan-400" />
              <span>Components:</span>
            </span>
            <button
              type="button"
              onClick={() => handleSelectAll(true)}
              className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700 cursor-pointer"
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleSelectAll(false)}
              className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-700 cursor-pointer"
            >
              None
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {[
              { id: 'cover', label: 'Cover' },
              { id: 'synopsis', label: 'Synopsis' },
              { id: 'beats', label: 'Beats' },
              { id: 'prose', label: 'Prose' },
              { id: 'osrSpread', label: 'Tactical Spread' },
              { id: 'mapKeys', label: 'Map Key' },
              { id: 'waypoints', label: 'Waypoints' },
              { id: 'readAloud', label: 'Read-Aloud' },
              { id: 'statBlocks', label: 'NPC Stats' },
              { id: 'props', label: 'Props & Traps' },
              { id: 'handouts', label: 'Handouts' }
            ].map(item => (
              <label
                key={item.id}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border cursor-pointer transition-colors ${
                  selectedSections[item.id]
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!selectedSections[item.id]}
                  onChange={() => toggleSection(item.id)}
                  className="hidden"
                />
                {selectedSections[item.id] ? <CheckSquare size={11} className="text-cyan-400" /> : <Square size={11} />}
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── PRINT PREVIEW CANVAS ── */}
        <div className="ade-print-scroll flex-1 overflow-y-auto p-4 md:p-10 bg-slate-950/90 scrollbar-thin">
          <div
            id="ade-selective-printable-document"
            className={`mx-auto bg-white text-black p-6 md:p-12 shadow-2xl rounded-sm max-w-4xl min-h-[800px] select-text ${
              printLayout === 'novel' ? 'font-serif' : 'font-sans'
            }`}
          >
            {/* 1. COVER & TITLE SHEET */}
            {selectedSections.cover && (
              <div className="border-b-2 border-black pb-6 mb-8 text-center space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 font-bold">
                  TANGENT SCIENCE FANTASY ROLEPLAY • ADVENTURE COMPILATION
                </div>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-sans text-black">
                  {title}
                </h1>
                <div className="text-xs font-mono text-slate-700 flex items-center justify-center gap-4 pt-1">
                  <span>Author: <strong>{author}</strong></span>
                  <span>•</span>
                  <span>Tech Level: <strong>{techLevel}</strong></span>
                  <span>•</span>
                  <span>Engine: <strong>Tangent 2d10 Dual Resolution</strong></span>
                </div>
              </div>
            )}

            {/* 2. SYNOPSIS & PREMISE */}
            {selectedSections.synopsis && (
              <div className="mb-6 pb-6 border-b border-slate-300 space-y-2">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  Mission Synopsis &amp; Operational Brief
                </h3>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {synopsisText || 'Tactical mission parameters established. Operatives infiltrate sector to resolve primary objective.'}
                </p>
              </div>
            )}

            {/* 3. SCENE BEATS PROGRESSION */}
            {selectedSections.beats && beatsList.length > 0 && (
              <div className="mb-6 pb-6 border-b border-slate-300 space-y-3">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  Sequential Scene Beats ({beatsList.length})
                </h3>
                <div className="space-y-1.5">
                  {beatsList.map((beat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-sans">
                      <span className="font-mono font-bold text-slate-900 min-w-[20px]">{idx + 1}.</span>
                      <span className="text-slate-800">{beat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. ARCHITECT READ-ALOUD BOXED CARDS */}
            {selectedSections.readAloud && (
              <div className="mb-6 pb-6 border-b border-slate-300 space-y-3">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  Architect Sensory Read-Aloud Boxed Text
                </h3>
                <div className="border-2 border-slate-800 bg-slate-50 p-4 rounded text-xs italic font-serif leading-relaxed text-slate-900">
                  <strong className="block font-sans not-italic font-bold uppercase tracking-wider text-[10px] text-slate-800 mb-1">
                    📢 Boxed Read-Aloud Description (To Be Read to Operators upon Sector Arrival):
                  </strong>
                  "{readAloudSource
                    ? readAloudSource.replace(/<[^>]+>/g, ' ').slice(0, 500)
                    : 'The air hums with electromagnetic discharge. Shadows stretch long across reinforced bulkheads as warning klaxons pulse in distant corridors.'}"
                </div>
              </div>
            )}

            {/* 4.5 TACTICAL SPREAD SUMMARY (OSR Reference Layout) */}
            {selectedSections.osrSpread && (
              <div className="mb-6 pb-6 border-b border-slate-300 space-y-2">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  Tactical Encounter Spread
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono bg-slate-50 border border-slate-300 rounded p-2.5">
                  <div><span className="text-slate-500 block text-[9px] uppercase">Scene</span><strong>{activeScenario?.title || title}</strong></div>
                  <div><span className="text-slate-500 block text-[9px] uppercase">Linked Sector</span><strong>{activeTargetMap?.title || 'Theater / No Grid'}</strong></div>
                  <div><span className="text-slate-500 block text-[9px] uppercase">Combatants</span><strong>{personas.length + tokensOnMap.length}</strong></div>
                  <div><span className="text-slate-500 block text-[9px] uppercase">Interactables</span><strong>{selectedSections.props ? propsOnMap.length : 0}</strong></div>
                </div>
                {!operatorSafeMode && activeScenario?.fields?.gmSecrets && (
                  <div className="text-[11px] text-slate-800 bg-rose-50 border border-rose-300 rounded p-2">
                    <strong className="uppercase text-[10px] text-rose-900">GM Secret Hook: </strong>
                    <span>{String(activeScenario.fields.gmSecrets).replace(/<[^>]+>/g, ' ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* 5. TACTICAL MAP KEY & FLOOR PLAN TABLE */}
            {selectedSections.mapKeys && activeTargetMap && (
              <div className="mb-6 pb-6 border-b border-slate-300 space-y-3">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  Tactical Map Overview: {activeTargetMap.title || 'Sector Grid'}
                </h3>
                <div className="text-[11px] font-mono text-slate-700 flex items-center justify-between pb-1">
                  <span>Grid Scale: <strong>{activeTargetMap.gridMode || 'Hex'}</strong></span>
                  <span>Dimensions: <strong>{activeTargetMap.width || 2800} × {activeTargetMap.height || 2100} px</strong></span>
                  <span>Environment: <strong>{activeTargetMap.environmental?.weatherPreset || 'Clear Industrial'}</strong></span>
                </div>
                {selectedSections.props && (
                  <div className="border border-slate-400 rounded overflow-hidden text-[10.5px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-150 border-b border-slate-300 font-mono font-bold">
                          <th className="p-1.5 border-r border-slate-300">Feature</th>
                          <th className="p-1.5 border-r border-slate-300">Type</th>
                          <th className="p-1.5">Tactical Properties &amp; Interaction DC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(propsOnMap || []).slice(0, 8).map((obj, i) => (
                          <tr key={obj.id || i} className="border-b border-slate-200">
                            <td className="p-1.5 border-r border-slate-200 font-bold">{obj.name || obj.label || `Object ${i+1}`}</td>
                            <td className="p-1.5 border-r border-slate-200">{obj.type}</td>
                            <td className="p-1.5">Structure: {obj.structure || 20} • Hack DC: {obj.hackDc || 13}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 6. SPATIAL WAYPOINTS & ROUTE GUIDE */}
            {selectedSections.waypoints && waypoints.length > 0 && (
              <div className="mb-6 pb-6 border-b border-slate-300 space-y-3">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  Spatial Mission Waypoints &amp; Routes ({waypoints.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {waypoints.map((wp, idx) => (
                    <div key={wp.id || idx} className="p-2.5 border border-slate-300 bg-slate-50 rounded space-y-1">
                      <div className="font-bold text-slate-900 flex justify-between">
                        <span>🚩 {wp.name || `Waypoint ${idx + 1}`}</span>
                        <span className="font-mono text-[10px] text-slate-600">Radius: {wp.radius || 60}px</span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        <strong>Type:</strong> {wp.type || 'Objective'} {wp.linkedBeatIndex !== undefined && `• Linked Beat: #${wp.linkedBeatIndex + 1}`}
                      </div>
                      {wp.readAloudText && (
                        <div className="text-[10px] italic text-slate-800 bg-white p-1.5 rounded border border-slate-200">
                          "{wp.readAloudText}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. ADVERSARY & NPC STAT BLOCKS */}
            {selectedSections.statBlocks && (tokensOnMap.length > 0 || personas.length > 0) && (
              <div className="mb-6 pb-6 border-b border-slate-300 space-y-3">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  Adversary &amp; NPC Stat Blocks (Canonical v6)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(tokensOnMap.length > 0 ? tokensOnMap : personas).slice(0, 8).map((tok, idx) => {
                    const isSynth = Boolean(tok.is_synthetic || tok.isSynthetic || tok.fields?.isSynthetic);
                    const hpVal = tok.current_health ?? tok.health?.current ?? tok.base_hp ?? tok.fields?.health ?? 30;
                    const vitVal = tok.current_vitality ?? tok.vitality?.current ?? tok.base_vitality ?? tok.fields?.vitality ?? 30;
                    const spVal = tok.current_structure ?? tok.structure?.current ?? tok.base_structure ?? tok.fields?.structurePoints ?? 60;
                    const drVal = tok.armor_dr ?? tok.armorDr ?? tok.fields?.armorDR ?? 0;
                    const defCr = tok.defense_dc ?? tok.defense ?? tok.fields?.defense_dc ?? 15;
                    const spdFt = tok.speed_ft ?? tok.fields?.speed ?? 30;
                    const skillActions = tok.actions_per_round ?? tok.fields?.actions ?? 1;
                    return (
                      <div key={tok.id || idx} className="p-3 border-2 border-slate-800 bg-slate-50 rounded font-mono text-[10px] space-y-1 break-inside-avoid">
                        <div className="font-bold text-xs text-black flex justify-between border-b border-slate-400 pb-1">
                          <span>{tok.name || tok.label || tok.title || 'Unit'}</span>
                          <span>{tok.role || tok.fields?.mcmRole || 'Combatant'}</span>
                        </div>
                        <div className="text-slate-800">
                          {isSynth ? (
                            <>SP (Synthetic): <strong>{spVal}</strong> • Armor DR: <strong>{drVal}</strong></>
                          ) : (
                            <>HP: <strong>{hpVal}</strong> • Vitality: <strong>{vitVal}</strong> • Armor DR: <strong>{drVal}</strong></>
                          )}
                        </div>
                        <div className="text-slate-800">
                          Defense CR: <strong>{defCr}</strong> • Speed: <strong>{spdFt} ft</strong> • Actions: <strong>{skillActions}</strong>
                        </div>
                        <div className="text-slate-700 pt-1">
                          <strong>Weapons:</strong> {tok.weapon || tok.fields?.weapons || 'Standard Plasma Carbine (2d8+2, 30 ft)'}
                        </div>
                        {tok.script && (
                          <div className="text-slate-600 pt-0.5">
                            <strong>AI Script:</strong> {tok.script.type} ({tok.script.behaviorProfile || 'tactical'})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. PROSE MANUSCRIPT */}
            {selectedSections.prose && (proseText || scenarios.length > 0) && (
              <div className={`mb-6 pb-6 border-b border-slate-300 space-y-4 ${printLayout === 'osr_module' ? 'md:columns-2 print:columns-2 gap-6' : ''}`}>
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  {printLayout === 'novel' ? 'Manuscript Text' : 'Adventure Prose Manuscript'}
                </h3>
                {proseText ? (
                  <div className={`${printLayout === 'novel' ? 'text-sm leading-7 font-serif' : 'text-xs leading-relaxed'} space-y-3 text-slate-900 text-justify`}>
                    {proseText.replace(/<[^>]+>/g, '\n\n').split('\n\n').filter(Boolean).map((para, i) => (
                      <p key={i} className={printLayout === 'novel' ? 'indent-6' : 'indent-3'}>{para}</p>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scenarios.filter((s) => s?.content).map((sc, sIdx) => (
                      <div key={sc.id || sIdx} className="space-y-2 break-inside-avoid">
                        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800">{sc.title}</h4>
                        <div className={`${printLayout === 'novel' ? 'text-sm leading-7 font-serif' : 'text-xs leading-relaxed'} space-y-2 text-slate-900 text-justify`}>
                          {String(sc.content).replace(/<[^>]+>/g, '\n\n').split('\n\n').filter(Boolean).map((p, i) => (
                            <p key={i} className={printLayout === 'novel' ? 'indent-6' : 'indent-3'}>{p}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ARCHITECT COMPENDIUM REFERENCE CARDS VIEW WHEN CARDS LAYOUT IS ACTIVE */}
            {printLayout === 'cards' && ((selectedSections.props && propsOnMap.length > 0) || scenarios.length > 0) && (
              <div className="mb-6 pb-6 border-b border-slate-300 space-y-3">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  Compendium Reference Cut-Out Cards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[10px]">
                  {scenarios.slice(0, 6).map((sc, idx) => (
                    <div key={sc.id || idx} className="p-3 border-2 border-dashed border-slate-700 rounded bg-slate-50 break-inside-avoid">
                      <div className="font-bold text-black uppercase border-b border-slate-300 pb-1 mb-1">
                        [{sc.type || 'Scene'}] {sc.title || `Scene ${idx + 1}`}
                      </div>
                      <div className="text-slate-800 line-clamp-4">
                        {sc.fields?.summary || sc.content?.replace(/<[^>]+>/g, ' ').slice(0, 220) || 'Encounter summary.'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. PLAYER HANDOUTS & CLUES */}
            {selectedSections.handouts && clues.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  Operator Handouts &amp; Intelligence Logs ({clues.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clues.map((clue, idx) => (
                    <div key={clue.id || idx} className="p-3 border-2 border-dashed border-slate-600 bg-slate-100 rounded space-y-1.5 font-mono break-inside-avoid">
                      <div className="text-[11px] font-bold text-slate-900 uppercase">
                        📜 {clue.title || 'Field Log Clue'}
                      </div>
                      <p className="text-[10px] text-slate-800 leading-normal italic">
                        "{clue.content || clue.fields?.information || 'Encrypted tactical transmission recovered from sector terminal.'}"
                      </p>
                      <div className="text-[9px] text-slate-500 text-right">
                        ✂️ Operator Handout Cut-Out
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── PRINT CSS STYLES (Portal-isolated for clean multi-page pagination) ── */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body > *:not(#ade-print-portal-root) {
              display: none !important;
            }
            #ade-print-portal-root {
              position: static !important;
              inset: auto !important;
              display: block !important;
              padding: 0 !important;
              background: white !important;
              overflow: visible !important;
            }
            .ade-print-shell,
            .ade-print-scroll {
              max-height: none !important;
              height: auto !important;
              overflow: visible !important;
              display: block !important;
              border: none !important;
              box-shadow: none !important;
              background: white !important;
            }
            #ade-selective-printable-document {
              position: static !important;
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              color: black !important;
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default SelectivePrintModal;
