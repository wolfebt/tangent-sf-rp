import React, { useState } from 'react';

const SECTIONS = [
  { id: 'overview', label: '📋 Overview' },
  { id: 'launcher', label: '🚀 Launcher & Catalog' },
  { id: 'story-module', label: '📖 Story Module' },
  { id: 'map-maker', label: '🗺️ Map Maker' },
  { id: 'aime', label: '✨ AIME' },
  { id: 'elements', label: '🧩 Story Elements' },
  { id: 'cloud', label: '☁️ Cloud & Saving' },
  { id: 'bastion', label: '🤖 Bastion AI' },
];

const CONTENT = {
  overview: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Story Foundry</strong> is an integrated tabletop narrative workspace for creating, 
        running, and archiving stories in the Tangent Science Fantasy Roleplay universe.
      </p>
      <div className="bg-slate-800/60 border border-cyan-500/20 rounded-lg p-4 space-y-2">
        <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-wider">Three Core Modules</h4>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { icon: '📖', label: 'Story Module', desc: 'Write and organize your narrative elements — characters, locations, factions, events, and more.' },
            { icon: '🗺️', label: 'Map Maker', desc: 'Build interactive campaign maps with layered nodes, pins, and connected regions.' },
            { icon: '✨', label: 'AIME', desc: 'AI-assisted creative writing suite for generating narrative content powered by Bastion AI.' },
          ].map(m => (
            <div key={m.label} className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-amber-300 font-bold text-xs uppercase mb-1">{m.label}</div>
              <div className="text-slate-400 text-[11px]">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-800/60 border border-amber-500/20 rounded-lg p-4 space-y-2">
        <h4 className="text-amber-400 font-bold uppercase text-xs tracking-wider">Quick Start</h4>
        <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 text-sm">
          <li>Click <strong className="text-cyan-300">📚 Catalog &amp; Launcher</strong> to open or create a story project.</li>
          <li>In the <strong className="text-cyan-300">Story Module</strong>, add narrative elements via the sidebar tree.</li>
          <li>Switch to <strong className="text-cyan-300">Map Maker</strong> to build your campaign map.</li>
          <li>Use <strong className="text-cyan-300">AIME</strong> for AI-generated creative content.</li>
          <li>Save to Cloud using <strong className="text-cyan-300">📁 FILE → Push to Cloud</strong>.</li>
        </ol>
      </div>
    </div>
  ),
  launcher: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Launcher &amp; Catalog</strong> is the entry point for all Story Foundry sessions. 
        It opens automatically on first load and can be re-opened any time.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Stories Tab', desc: 'Lists all saved story projects in your universe. Click any story to load it as the active workspace.' },
          { label: 'New Story', desc: 'Creates a blank story project with a title and optional description. The previous story is auto-saved before switching.' },
          { label: 'Element Catalog', desc: 'Browse all story elements saved to the cloud database — characters, locations, lore entries, and more — for import into your active story.' },
          { label: 'Close Story', desc: 'Saves the current working state and returns you to the Launcher to select a different story.' },
          { label: 'Maps', desc: 'Saved campaign maps appear in the Launcher under the Maps tab for quick-loading.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[140px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  'story-module': (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Story Module</strong> is a hierarchical narrative editor. 
        Stories are organized as a tree of elements — each element has a type, title, content, and optional child elements.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Scenario Pane', desc: 'The left panel shows your story\'s element tree. Click any node to open it in the editor. Drag nodes to reorder.' },
          { label: 'Adding Elements', desc: 'Use the + button to add child elements. Choose a type from the element schema (Character, Location, Event, Faction, etc.).' },
          { label: 'Editing Elements', desc: 'Click the ✏️ edit icon on any element to open the full-featured element editor modal.' },
          { label: 'Rich Content', desc: 'Elements support multi-field structured content — title, description, notes, status, and type-specific fields.' },
          { label: 'Story Name', desc: 'The active story name is shown in the header breadcrumb bar and can be renamed inline.' },
          { label: 'Active Element', desc: 'The currently selected element is shown in the header breadcrumb (type badge + title).' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[140px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  'map-maker': (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Map Maker</strong> is an interactive visual canvas for building campaign maps. 
        Place nodes, draw connections, and layer geography to create immersive world maps.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Map Canvas', desc: 'A pan-and-zoom canvas. Click-drag empty space to pan; scroll to zoom in/out.' },
          { label: 'Adding Nodes', desc: 'Double-click the canvas to create a new location node. Name it and assign a type (City, Outpost, Wilderness, etc.).' },
          { label: 'Connections', desc: 'Drag from one node\'s edge to another to create a directional or bidirectional route line.' },
          { label: 'Node Details', desc: 'Click any node to view and edit its details — description, status, linked story elements, and more.' },
          { label: 'Map Name', desc: 'The active map name is shown in the header breadcrumb and can be renamed inline.' },
          { label: 'Multiple Maps', desc: 'Each story project can have multiple maps (world map, region map, dungeon floor, etc.).' },
          { label: 'Export Map', desc: 'Export the current map as a PNG image for printing or sharing.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[140px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  aime: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">AIME</strong> (AI-Integrated Manuscript Engine) is the creative writing module 
        powered by Bastion AI. Use it to draft narrative prose, generate story content, and expand your world-building.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Free Writing', desc: 'An open creative canvas for drafting long-form narrative prose, session recaps, or lore entries.' },
          { label: 'AI Generation', desc: 'Use Bastion AI to generate character descriptions, location details, plot hooks, or dialogue. Context-aware to your active story.' },
          { label: 'Templates', desc: 'Pre-built prompts for common narrative tasks — session prep, NPC creation, encounter hooks, world-building.' },
          { label: 'Export', desc: 'Export AIME content to Markdown or PDF for session use or archiving.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[140px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-3 text-xs text-slate-300">
        ⚡ AIME requires a Gemini API key to activate AI features. Enter your key via <strong className="text-amber-300">Bastion AI → Settings</strong>.
      </div>
    </div>
  ),
  elements: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">Story Elements</strong> are the core building blocks of your narrative — every significant person, place, group, or event in your universe.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { type: 'Character', icon: '👤', desc: 'NPCs, PCs, and named individuals with personality, role, and status.' },
          { type: 'Location', icon: '📍', desc: 'Places — cities, bases, planets, rooms. Linkable to map nodes.' },
          { type: 'Faction', icon: '⚔️', desc: 'Organizations, gangs, corporations, governments, and religions.' },
          { type: 'Event', icon: '⚡', desc: 'Significant story moments, battles, revelations, and encounters.' },
          { type: 'Item', icon: '📦', desc: 'Significant artifacts, weapons, or relics with narrative weight.' },
          { type: 'Lore', icon: '📜', desc: 'World-building entries — history, cosmology, technology, culture.' },
          { type: 'Session', icon: '🎲', desc: 'Session notes, prep documents, and post-session recaps.' },
          { type: 'Custom', icon: '✏️', desc: 'Freeform element type for anything that doesn\'t fit the above.' },
        ].map(e => (
          <div key={e.type} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex gap-2 items-start">
            <span className="text-lg shrink-0">{e.icon}</span>
            <div>
              <div className="text-amber-300 font-bold text-xs uppercase">{e.type}</div>
              <div className="text-slate-400 text-xs mt-0.5">{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  cloud: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        Story Foundry supports <strong className="text-cyan-300">real-time cloud sync</strong> for active story projects. 
        All changes are stored both locally and in your authenticated cloud account.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Cloud Sync Status', desc: 'The header badge shows real-time sync state: ☁️ Saved, 🔄 Syncing, ⚠️ Error, ⚡ Conflict, 📡 Local Mode.' },
          { label: 'Push to Cloud', desc: 'FILE → Push to Cloud saves your full universe to Firestore under your account.' },
          { label: 'Pull from Cloud', desc: 'FILE → Pull from Cloud loads the latest cloud version. Warning: overwrites local changes.' },
          { label: 'Sync Conflicts', desc: 'If local and cloud differ, a Conflict modal appears. Choose to keep Local or accept Cloud version.' },
          { label: 'Local File Backup', desc: 'FILE → Save to File exports the full universe as JSON. Restore with FILE → Load from File.' },
          { label: 'Element Cloud Library', desc: 'Individual elements (characters, locations, etc.) can be saved to a shared cloud library and imported into any story.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[160px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  bastion: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">Bastion AI</strong> is your integrated creative intelligence assistant. 
        Accessible from any module in Story Foundry via the <strong>🤖 BASTION</strong> button in the sidebar.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Chat Mode', desc: 'Conversational interface. Ask Bastion anything about your story — it\'s context-aware of your active project.' },
          { label: 'Generate Content', desc: 'Ask Bastion to create characters, describe locations, write encounter hooks, or expand any element.' },
          { label: 'Story Analysis', desc: 'Bastion can review your story structure, identify plot holes, and suggest narrative directions.' },
          { label: 'Session Prep', desc: 'Generate session outlines, NPC motivations, encounter tables, and reward schemes.' },
          { label: 'API Key', desc: 'Bastion uses the Gemini API. Enter your key in the Bastion panel settings. Keys are stored locally in your browser.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[140px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
      <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-3 text-xs text-slate-300">
        🤖 Bastion's responses are suggestions, not rules. Always apply your own creative judgment as GM or player.
      </div>
    </div>
  ),
};

export const StoryFoundryGuideModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/70 backdrop-blur-sm pt-6 sm:pt-10 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d1117] border border-[#0D5C63]/60 rounded-2xl shadow-2xl shadow-black/60 w-full max-w-4xl mx-4 flex overflow-hidden"
        style={{ height: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <div className="w-52 bg-[#090d16] border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <div>
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Story Foundry</div>
                <div className="text-xs font-bold text-white">User Guide</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase tracking-wide transition-all ${
                  activeSection === s.id
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-slate-800">
            <div className="text-[9px] text-slate-600 font-mono uppercase tracking-widest text-center">
              Tangent SFF RPG v2.0
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs font-bold uppercase transition-colors border border-slate-700"
            >
              ✕ Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {CONTENT[activeSection]}
          </div>
        </div>
      </div>
    </div>
  );
};
