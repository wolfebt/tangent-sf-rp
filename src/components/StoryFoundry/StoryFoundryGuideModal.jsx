import React, { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'overview', label: '📋 Overview' },
  { id: 'launcher', label: '🚀 Launcher & Catalog' },
  { id: 'story-module', label: '📖 Story Module' },
  { id: 'map-maker', label: '🗺️ Map Maker' },
  { id: 'aime', label: '✨ AIME Creative Suite' },
  { id: 'element-forge', label: '🧩 Element Forge' },
  { id: 'aime-copilot', label: '🤖 AIME & BASTION' },
  { id: 'cloud', label: '☁️ Cloud & Saving' },
];

const CONTENT = {
  overview: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Story Foundry</strong> is an integrated tabletop narrative workspace for creating, 
        running, and archiving campaigns in the Tangent Science Fantasy Roleplay universe.
      </p>
      <div className="bg-slate-800/60 border border-cyan-500/20 rounded-lg p-4 space-y-2">
        <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-wider">Five Integrated Modules</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {[
            { icon: '📖', label: 'Story Module', desc: 'Hierarchical tree editor with header bar, File Menu (Push/Pull, JSON Save/Load), and rich element editing.' },
            { icon: '🗺️', label: 'Map Maker', desc: 'Interactive pan/zoom visual map builder with nodes, connections, node details, and image export.' },
            { icon: '✨', label: 'AIME Suite', desc: '3-stage AI-assisted manuscript weaver (Brainstorm, Outline, Draft) with floating toolbar.' },
            { icon: '🧩', label: 'Element Forge', desc: 'Schema-driven story element architect for defining lore, characters, locations, factions, and items.' },
            { icon: '🚀', label: 'Launcher & Catalog', desc: 'Story campaign launcher, map picker, and cloud-synced element library catalog.' },
          ].map(m => (
            <div key={m.label} className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-amber-300 font-bold text-xs uppercase mb-1">{m.label}</div>
              <div className="text-slate-400 text-[11px] leading-snug">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-800/60 border border-amber-500/20 rounded-lg p-4 space-y-2">
        <h4 className="text-amber-400 font-bold uppercase text-xs tracking-wider">Quick Start Workflow</h4>
        <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 text-sm">
          <li>Click <strong className="text-cyan-300">📚 Catalog &amp; Launcher</strong> to open an existing campaign or create a new story.</li>
          <li>In the <strong className="text-cyan-300">Story Module</strong>, add narrative elements via the Scenario sidebar tree.</li>
          <li>Use <strong className="text-cyan-300">FILE → Push to Cloud</strong> or <strong className="text-cyan-300">Save to File</strong> to persist your universe.</li>
          <li>Switch to <strong className="text-cyan-300">Map Maker</strong> to place locations and draw travel routes.</li>
          <li>Click <strong className="text-cyan-300">✨ AIME CO-PILOT</strong> to summon the movable floating AI window to brainstorm lore, expand scenes, or check Omnicortex rules.</li>
        </ol>
      </div>
    </div>
  ),
  launcher: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Launcher &amp; Catalog</strong> modal is the command center for your story sessions. 
        It opens on application startup and can be accessed at any time via the <strong className="text-amber-300">Catalog &amp; Launcher</strong> button.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Stories Tab', desc: 'Lists all local and cloud story projects. Click any story card to set it as your active workspace. Shows node count and last modified time.' },
          { label: 'New Story Project', desc: 'Creates a blank campaign with custom title and summary. Your active story state is automatically saved before switching.' },
          { label: 'Element Catalog', desc: 'Browse the cloud element database. Import pre-built characters, locations, factions, and lore entries directly into your active story tree.' },
          { label: 'Map Library', desc: 'Quick-load saved tactical and regional campaign maps into the Map Maker workspace.' },
          { label: 'Close & Save', desc: 'Saves all active changes locally and returns to the project catalog view.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[150px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  'story-module': (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Story Module</strong> provides a full-featured hierarchical editor for your campaign.
      </p>
      
      <div className="bg-slate-800/70 border border-cyan-500/30 rounded-lg p-4 space-y-3">
        <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-wider">Top Header &amp; File Menu</h4>
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            The top header displays story title breadcrumbs, active node indicator, cloud sync status, and the main <strong className="text-amber-300">📁 FILE Menu</strong>:
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { cmd: '☁️ Push to Cloud', detail: 'Saves your entire campaign to Firestore under your user account.' },
              { cmd: '📥 Pull from Cloud', detail: 'Loads the latest remote version from cloud (with overwrite prompt).' },
              { cmd: '💾 Save to File', detail: 'Exports full story universe as a standalone portable .JSON file.' },
              { cmd: '📂 Load from File', detail: 'Restores story state from a local .JSON backup file.' },
              { cmd: '📤 Export Options', detail: 'Export campaign or active sub-tree as Markdown (.md), HTML, or PDF document.' },
              { cmd: '🔄 Reset Story', detail: 'Clears the active workspace back to a default clean template (requires confirmation).' },
            ].map(item => (
              <div key={item.cmd} className="bg-slate-900/70 border border-slate-700/50 rounded p-2">
                <div className="font-bold text-cyan-300">{item.cmd}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Scenario Pane Tree', desc: 'Drag-and-drop nodes to reorder siblings (line above/below) or nest inside a parent element (box highlight). Click ▶ to expand/collapse.' },
          { label: '+ Add Sub-Element', desc: 'Click + on any node to insert a child element. Select type from Character, Location, Faction, Event, Item, Lore, Session, or Custom.' },
          { label: 'Rich Text Editor', desc: 'Click any element to edit in the main pane. Supports Quill rich text formatting (bold, headers, lists, code blocks) and type-specific schema fields.' },
          { label: 'Relational Links', desc: 'Link story elements to one another (e.g. Character to Location or Faction) for instant cross-referencing.' },
          { label: 'Typed Deletion Safety', desc: 'Deleting nodes requires typing the element title to prevent accidental data loss.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[150px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  'map-maker': (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        The <strong className="text-cyan-300">Map Maker</strong> is an interactive visual canvas for spatial world-building.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Pan & Zoom Canvas', desc: 'Drag empty canvas space to pan across the world map. Scroll mouse wheel to zoom in and out smoothly.' },
          { label: 'Creating Nodes', desc: 'Double-click anywhere on the canvas to place a location node. Choose icon, color, and assign node type (City, Outpost, Wilderness, Ruin, Base).' },
          { label: 'Connecting Nodes', desc: 'Drag vector connectors between node anchors to map out roads, jump routes, or travel paths (directional or bidirectional).' },
          { label: 'Node Details Panel', desc: 'Click any node to open its sidebar panel. Edit node description, threat level, environmental hazards, and link to Story Elements.' },
          { label: 'Image Export', desc: 'Export high-resolution map renders directly to PNG image files for printing or virtual tabletop (VTT) use.' },
          { label: 'Multi-Map Hierarchy', desc: 'Create and switch between multiple maps per story (e.g. World Map, Sector Map, Dungeon Floor).' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[150px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  aime: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">AIME</strong> (AI-Integrated Manuscript Engine) is a 3-stage narrative prose generator powered by Bastion AI.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Stage 1: Brainstorm', desc: 'Select active world lore elements & Guidance Gems to generate high-level story concepts and premise outlines.' },
          { label: 'Stage 2: Outline', desc: 'Structure scene flow, plot beats, and character arcs before drafting. Re-order beats with drag handles.' },
          { label: 'Stage 3: Draft', desc: 'Generate complete manuscript prose in a rich editor canvas with auto-completion and context injection.' },
          { label: 'Floating Edit Toolbar', desc: 'Highlight any drafted text snippet to trigger floating tools: Rephrase, Expand, Shorten, Polish, and Transform Tone.' },
          { label: 'Prose Export', desc: 'Export finished manuscript prose directly to Markdown (.md) or printable PDF files.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[150px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-3 text-xs text-slate-300">
        ⚡ AIME AI features require a Gemini API key. Configure your key via <strong className="text-amber-300">Bastion AI → Settings</strong>.
      </div>
    </div>
  ),
  'element-forge': (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">Element Forge</strong> is the schema-driven story element architect for building structured lore bibles.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          { type: 'Character', icon: '👤', desc: 'NPCs, PCs, and key figures with motivations, species, and status.' },
          { type: 'Location', icon: '📍', desc: 'Planets, cities, bases, and rooms linkable to Map Maker nodes.' },
          { type: 'Faction', icon: '⚔️', desc: 'Corporations, religions, military forces, and political syndicates.' },
          { type: 'Event', icon: '⚡', desc: 'Historical turning points, battles, revelations, and campaign scenes.' },
          { type: 'Item', icon: '📦', desc: 'Key artifacts, relic weapons, cybernetics, and quest objects.' },
          { type: 'Lore', icon: '📜', desc: 'World-building entries: cosmology, history, technology, and culture.' },
          { type: 'Session', icon: '🎲', desc: 'Game session prep documents, recaps, and operational logs.' },
          { type: 'Custom Schema', icon: '✏️', desc: 'User-defined fields for specialized world mechanics.' },
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
  'aime-copilot': (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        <strong className="text-cyan-300">AIME Co-Pilot</strong> is your context-aware storytelling and worldbuilding assistant in Story Foundry, with direct access to check with <strong className="text-amber-300">BASTION</strong> and the <strong className="text-cyan-300">OMNICORTEX</strong> for game mechanics and rules.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Floating Chat Window', desc: 'Summon AIME anytime via the ✨ AIME CO-PILOT button. The window is movable and can be dragged anywhere on your canvas.' },
          { label: 'Context-Aware Assistance', desc: 'AIME automatically reads your active Story element (type, title, description, custom fields) and universe Guidance Gems.' },
          { label: 'BASTION Rules Synergy', desc: 'Ask AIME for game mechanics, stats, Tech Levels, or dice check guidelines—it seamlessly checks with BASTION and Omnicortex data.' },
          { label: 'Interactive Dice Rolling', desc: 'Type /roll [dice] (e.g. /roll 2d10+4) directly into AIME chat to resolve tactical checks without leaving your workspace.' },
          { label: 'API Key Configuration', desc: 'Enter your Gemini API key in Settings. Keys are securely stored in your browser\'s local storage with offline simulation fallback.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[150px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  cloud: (
    <div className="space-y-4">
      <p className="text-slate-300 leading-relaxed">
        Story Foundry features <strong className="text-cyan-300">real-time cloud synchronization</strong> with offline local fallback.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Sync Status Badge', desc: 'Header badge indicates state: ☁️ Saved (synced to cloud), 🔄 Syncing, ⚠️ Error, ⚡ Conflict, 📡 Local Mode (unauthenticated).' },
          { label: 'Push & Pull', desc: 'Use FILE → Push to Cloud to manually overwrite cloud state, or Pull from Cloud to sync down remote changes.' },
          { label: 'Conflict Modal', desc: 'If local edits and cloud data diverge, a Sync Conflict modal appears allowing you to compare timestamps and select Local or Remote version.' },
          { label: 'JSON File Backups', desc: 'Use FILE → Save to File to export an offline .JSON snapshot of your entire campaign. Restore anytime via FILE → Load from File.' },
        ].map(f => (
          <div key={f.label} className="flex gap-3 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
            <div className="min-w-[150px] text-amber-300 font-bold text-xs uppercase tracking-wide pt-0.5">{f.label}</div>
            <div className="text-slate-300 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
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

