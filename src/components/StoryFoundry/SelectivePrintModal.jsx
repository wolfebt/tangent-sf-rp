/**
 * @file SelectivePrintModal.jsx
 * @description Selective Print & Publishing Studio for Tangent SFF RP Adventure Modules.
 * Enables granular component selection (Cover, Synopsis, Beats, Prose, OSR Spread, Maps,
 * Waypoints, Read-Aloud Cards, Adversary Stat Blocks, and Player Handouts) with multiple
 * layout modes (OSR 2-Column, Novel, GM Card Deck) and clean @media print CSS styling.
 */

import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  BookOpen, 
  LayoutGrid, 
  X, 
  CheckSquare, 
  Square, 
  Layers, 
  MapPin, 
  Users, 
  Box, 
  Sparkles,
  FileText,
  Sliders,
  Check
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

export const SelectivePrintModal = ({
  isOpen,
  onClose,
  universeState = {},
  elementsCatalog = [],
  activeScenario = null,
  activeMap = null
}) => {
  if (!isOpen) return null;

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
  const scenarios = universeState?.scenarios || (activeScenario ? [activeScenario] : []);
  const maps = universeState?.maps || (activeMap ? [activeMap] : []);
  const activeTargetMap = activeMap || maps[0] || null;

  // Resolved scene beats
  const beatsRaw = activeScenario?.fields?.sceneBeats || universeState?.creativeState?.sceneBeats || '';
  const beatsList = beatsRaw.split('\n').map(b => b.trim()).filter(Boolean);

  // Resolved manuscript prose
  const proseText = activeScenario?.content || universeState?.creativeState?.storyDraft || '';

  // Personas & Adversaries
  const personas = elementsCatalog.filter(e => e.type === 'Persona');
  const tokensOnMap = activeTargetMap?.tokens || [];

  // Props & Clues
  const propsOnMap = activeTargetMap?.objects || [];
  const clues = elementsCatalog.filter(e => e.type === 'Clue' || e.type === 'Handout');

  // Waypoints
  const waypoints = activeTargetMap?.waypoints || [];

  return (
    <div className="fixed inset-0 z-[230] bg-black/90 backdrop-blur-md flex items-start justify-center p-2 sm:p-5 pt-6 pb-8 overflow-y-auto font-sans select-none">
      <div className="bg-[#0b0f19] border border-cyan-500/60 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col text-slate-200">
        
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
                Selectively compose fiction manuscripts, tactical adventure modules, or GM cheat cards
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
                title="Index Card Deck for GM Tabletop"
              >
                <Layers size={11} />
                <span>GM Cards</span>
              </button>
            </div>

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
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-950/90 scrollbar-thin">
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
                  {activeScenario?.fields?.summary || activeScenario?.fields?.goal || universeState?.creativeState?.storyOutline || 'Tactical mission parameters established. Operatives infiltrate sector to resolve primary objective.'}
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

            {/* 4. GM READ-ALOUD BOXED CARDS */}
            {selectedSections.readAloud && (
              <div className="mb-6 pb-6 border-b border-slate-300 space-y-3">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  GM Sensory Read-Aloud Boxed Text
                </h3>
                <div className="border-2 border-slate-800 bg-slate-50 p-4 rounded text-xs italic font-serif leading-relaxed text-slate-900">
                  <strong className="block font-sans not-italic font-bold uppercase tracking-wider text-[10px] text-slate-800 mb-1">
                    📢 Boxed Read-Aloud Description (To Be Read to Players upon Sector Arrival):
                  </strong>
                  "{activeScenario?.content 
                    ? activeScenario.content.replace(/<[^>]+>/g, ' ').slice(0, 500)
                    : 'The air hums with electromagnetic discharge. Shadows stretch long across reinforced bulkheads as warning klaxons pulse in distant corridors.'}"
                </div>
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
                      {(activeTargetMap.objects || []).slice(0, 8).map((obj, i) => (
                        <tr key={obj.id || i} className="border-b border-slate-200">
                          <td className="p-1.5 border-r border-slate-200 font-bold">{obj.name || obj.label || `Object ${i+1}`}</td>
                          <td className="p-1.5 border-r border-slate-200">{obj.type}</td>
                          <td className="p-1.5">Structure: {obj.structure || 20} • Hack DC: {obj.hackDc || 13}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  Adversary &amp; NPC Stat Blocks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(tokensOnMap.length > 0 ? tokensOnMap : personas).slice(0, 6).map((tok, idx) => (
                    <div key={tok.id || idx} className="p-3 border-2 border-slate-800 bg-slate-50 rounded font-mono text-[10px] space-y-1">
                      <div className="font-bold text-xs text-black flex justify-between border-b border-slate-400 pb-1">
                        <span>{tok.name || tok.label || tok.title || 'Unit'}</span>
                        <span>{tok.role || 'Combatant'}</span>
                      </div>
                      <div className="text-slate-800">
                        HP: <strong>{tok.health?.current || tok.base_hp || 30}</strong> • Vitality: <strong>{tok.vitality?.current || 30}</strong> • Armor DR: <strong>{tok.armor_dr || 6}</strong>
                      </div>
                      <div className="text-slate-800">
                        Defense: <strong>{tok.defense || 12}</strong> • Speed: <strong>{tok.speed_ft || 30} ft</strong> • AP: <strong>3</strong>
                      </div>
                      <div className="text-slate-700 pt-1">
                        <strong>Weapons:</strong> {tok.weapon || 'Standard Plasma Carbine (2d10+2, 15m)'}
                      </div>
                      {tok.script && (
                        <div className="text-slate-600 pt-0.5">
                          <strong>AI Script:</strong> {tok.script.type} ({tok.script.behaviorProfile || 'tactical'})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. PROSE MANUSCRIPT */}
            {selectedSections.prose && proseText && (
              <div className="mb-6 pb-6 border-b border-slate-300 space-y-3">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  Adventure Prose Manuscript
                </h3>
                <div className="text-xs leading-relaxed space-y-3 text-slate-900 text-justify">
                  {proseText.replace(/<[^>]+>/g, '\n\n').split('\n\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="indent-4">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* 9. PLAYER HANDOUTS & CLUES */}
            {selectedSections.handouts && clues.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold font-sans uppercase tracking-wider text-xs border-b border-black pb-1 text-slate-900">
                  Player Handouts &amp; Intelligence Logs ({clues.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clues.map((clue, idx) => (
                    <div key={clue.id || idx} className="p-3 border-2 border-dashed border-slate-600 bg-slate-100 rounded space-y-1.5 font-mono">
                      <div className="text-[11px] font-bold text-slate-900 uppercase">
                        📜 {clue.title || 'Field Log Clue'}
                      </div>
                      <p className="text-[10px] text-slate-800 leading-normal italic">
                        "{clue.content || clue.fields?.information || 'Encrypted tactical transmission recovered from sector terminal.'}"
                      </p>
                      <div className="text-[9px] text-slate-500 text-right">
                        ✂️ Player Handout Cut-Out
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── PRINT CSS STYLES ── */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #ade-selective-printable-document, #ade-selective-printable-document * {
              visibility: visible;
            }
            #ade-selective-printable-document {
              position: absolute;
              left: 0;
              top: 0;
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
};

export default SelectivePrintModal;
