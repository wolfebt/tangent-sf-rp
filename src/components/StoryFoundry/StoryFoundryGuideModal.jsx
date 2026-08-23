import React, { useState, useEffect } from 'react';
import { Layers, Map, Sparkles, Cpu, BookOpen, ExternalLink } from 'lucide-react';
import { AudioService } from '../../services/audioService';

const SECTIONS = [
  { id: 'overview', label: '📋 Overview & Workflow' },
  { id: 'launcher', label: '🚀 Launcher & Catalog' },
  { id: 'story-module', label: '📖 Story Weaver Module' },
  { id: 'map-maker', label: '🗺️ Tactical Map Maker & VTT' },
  { id: 'aime', label: '✨ AIME Manuscript Suite' },
  { id: 'element-forge', label: '🧩 Element Forge Lore' },
  { id: 'aime-copilot', label: '🤖 AIME Co-Pilot & Bastion' },
  { id: 'cloud', label: '☁️ Cloud Sync & Export' },
];

const CONTENT = {
  overview: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-purple-300 font-mono">Story Foundry</strong> is the unified narrative development suite and Virtual Tabletop for Tangent Science Fantasy Roleplay.
      </p>
      <div className="bg-slate-800/60 border border-purple-500/30 rounded-xl p-4 space-y-2">
        <h4 className="text-purple-400 font-bold uppercase text-xs font-mono tracking-wider">Five Integrated Sub-Modules</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2 text-xs">
          {[
            { icon: '📖', label: 'Story Weaver', desc: 'Hierarchical scenario tree with rich element editing and push/pull sync.' },
            { icon: '🗺️', label: 'Tactical Map Maker', desc: 'Konva grid canvas, terrain painting, token summoning & combat tracker.' },
            { icon: '✨', label: 'AIME Manuscript Suite', desc: '3-stage AI prose weaver (Brainstorm, Outline, Draft) with floating toolbar.' },
            { icon: '🧩', label: 'Element Forge', desc: 'Schema-driven lore database for characters, planets, factions & relics.' },
            { icon: '🚀', label: 'Launcher & Catalog', desc: 'Project switcher, map library, and cloud-synced element asset catalog.' },
          ].map(m => (
            <div key={m.label} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-center space-y-1">
              <div className="text-2xl">{m.icon}</div>
              <div className="text-amber-300 font-bold font-mono uppercase text-xs">{m.label}</div>
              <div className="text-slate-400 text-[11px] leading-snug">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  launcher: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-cyan-300 font-mono">Launcher &amp; Catalog</strong> is your story workspace command center:
      </p>
      <div className="space-y-2.5 text-xs">
        {[
          { label: 'Campaign Projects Tab', desc: 'Switch between campaigns, create blank story templates, and inspect node counts.' },
          { label: 'Element Catalog', desc: 'Browse the cloud database of pre-built NPCs, planets, factions, and relics for 1-click scenario import.' },
          { label: 'Tactical Map Library', desc: 'Load saved regional or tactical grid maps directly into your active workspace.' },
        ].map(f => (
          <div key={f.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
            <div className="font-bold text-amber-300 font-mono uppercase mb-0.5">{f.label}</div>
            <div className="text-slate-300 text-xs">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),

  'story-module': (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-purple-300 font-mono">Story Weaver</strong> provides a drag-and-drop scenario tree editor:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-1">
          <div className="font-bold text-cyan-300 font-mono uppercase">🌳 Drag-and-Drop Tree</div>
          <p className="text-slate-400 text-[11px]">Reorder sibling acts or nest sub-elements into parent scenes with visual drop indicators.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-1">
          <div className="font-bold text-emerald-300 font-mono uppercase">✍️ Rich Text &amp; Relational Links</div>
          <p className="text-slate-400 text-[11px]">Quill editor with formatting and bi-directional links connecting characters to locations and factions.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-1">
          <div className="font-bold text-amber-300 font-mono uppercase">🛡️ Typed Deletion Safety</div>
          <p className="text-slate-400 text-[11px]">Destructive node deletions require typing the exact element title to prevent data loss.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-1">
          <div className="font-bold text-purple-300 font-mono uppercase">📤 Multi-Format Export</div>
          <p className="text-slate-400 text-[11px]">Export campaigns to Markdown (.md), clean HTML, formatted PDF, or standalone JSON.</p>
        </div>
      </div>
    </div>
  ),

  'map-maker': (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-cyan-300 font-mono">Tactical Map Maker &amp; VTT</strong> is a high-performance 2D canvas for tabletop tactical combat:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
          <div className="font-bold text-cyan-300 font-mono uppercase mb-1">🎯 Square / Hex / Isometric Grids</div>
          <p className="text-slate-400 text-[11px]">Snapping grid canvas with pan/zoom, coordinate rulers, measurement tools, and ping markers.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
          <div className="font-bold text-emerald-300 font-mono uppercase mb-1">👥 Folio Token Summoning</div>
          <p className="text-slate-400 text-[11px]">Summon hero tokens from your Persona Folio roster with live Health and Vitality bars.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
          <div className="font-bold text-amber-300 font-mono uppercase mb-1">⚔️ Initiative &amp; Combat Tracker</div>
          <p className="text-slate-400 text-[11px]">Manage turn order, round counters, status effect gems, and floating animated damage text.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
          <div className="font-bold text-pink-300 font-mono uppercase mb-1">📺 Player Spectator Stream</div>
          <p className="text-slate-400 text-[11px]">Stream <code className="text-cyan-300 font-mono">/spectator/:mapId</code> to players with GM secrets and fog-of-war hidden.</p>
        </div>
      </div>
    </div>
  ),

  aime: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        <strong className="text-pink-300 font-mono">AIME</strong> (AI-Integrated Manuscript Engine) helps authors draft narrative fiction:
      </p>
      <div className="space-y-2 text-xs">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
          <div className="font-bold text-pink-300 font-mono uppercase mb-0.5">1. Brainstorm with Guidance Gems</div>
          <p className="text-slate-400 text-[11px]">Select active world lore elements and premise catalysts to generate high-level story concepts.</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
          <div className="font-bold text-cyan-300 font-mono uppercase mb-0.5">2. Outline Scene Beats</div>
          <p className="text-slate-400 text-[11px]">Structure dramatic arcs and scene goals before generating prose.</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
          <div className="font-bold text-amber-300 font-mono uppercase mb-0.5">3. Draft &amp; Floating Selection Toolbar</div>
          <p className="text-slate-400 text-[11px]">Highlight drafted text snippets to trigger floating tools: Expand, Rephrase, Shorten, Polish, and Tone Transform.</p>
        </div>
      </div>
    </div>
  ),

  'element-forge': (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        The <strong className="text-cyan-300 font-mono">Element Forge</strong> is a schema-driven story element architect:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
        {['Character', 'Location', 'Faction', 'Event', 'Item', 'Lore', 'Session', 'Custom'].map(t => (
          <div key={t} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2 font-mono font-bold text-slate-200">
            {t}
          </div>
        ))}
      </div>
    </div>
  ),

  'aime-copilot': (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        <strong className="text-pink-300 font-mono">AIME Co-Pilot</strong> is a draggable, movable AI assistant that checks rules with Bastion AI and rolls dice via <code className="text-amber-300 font-mono">/roll 2d10+4</code> directly from any view in Story Foundry.
      </p>
    </div>
  ),

  cloud: (
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
      <p>
        Story Foundry includes <strong className="text-cyan-300 font-mono">debounced 1.5s Firestore syncing</strong> with timestamp conflict detection to protect story data.
      </p>
    </div>
  ),
};

export const StoryFoundryGuideModal = ({ isOpen, onClose, initialTab = 'overview' }) => {
  const [activeSection, setActiveSection] = useState(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveSection(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d1117] border border-purple-500/50 rounded-2xl shadow-2xl shadow-black/80 w-full max-w-5xl h-[88vh] flex flex-col font-sans overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-purple-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-400">
              <Layers size={18} />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                STORY FOUNDRY
              </div>
              <div className="text-sm font-bold text-white uppercase font-mono">
                Campaign &amp; VTT User Guide
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                window.dispatchEvent(new CustomEvent('open-user-guide', { detail: { tab: 'story' } }));
                onClose();
              }}
              className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5"
              title="Open in Comprehensive Master Guide"
            >
              <span>Full System Guide</span>
              <ExternalLink size={12} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono font-bold uppercase transition-colors border border-slate-700"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* 2-Pane Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-56 sm:w-64 bg-[#090d16] border-r border-slate-800 flex flex-col shrink-0">
            <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    setActiveSection(s.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wide transition-all ${
                    activeSection === s.id
                      ? 'bg-purple-950/90 text-purple-300 border border-purple-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0e17]">
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
              <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider">
                {SECTIONS.find(s => s.id === activeSection)?.label}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {CONTENT[activeSection]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryFoundryGuideModal;
