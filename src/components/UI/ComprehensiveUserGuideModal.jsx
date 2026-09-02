import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  Users, 
  Database, 
  BookOpen, 
  Sparkles, 
  Map, 
  Radio, 
  Dices, 
  Layers, 
  HelpCircle, 
  Search, 
  X, 
  ExternalLink, 
  Shield, 
  Cpu, 
  ChevronRight, 
  Copy, 
  Check, 
  Code, 
  Activity, 
  Flame, 
  Maximize2,
  Terminal,
  Grid,
  Zap
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

export const GUIDE_TABS = [
  { id: 'hub', label: 'Operations Hub & HUD', icon: Compass, badge: 'Command Center', color: '#22d3ee' },
  { id: 'folio', label: 'Persona Folio & Roster', icon: Users, badge: 'Hero Manager', color: '#06b6d4' },
  { id: 'dbm', label: 'Omnicortex DBM', icon: Database, badge: 'Rules Compendium', color: '#10b981' },
  { id: 'codex', label: 'Codex & Economatrix', icon: Sparkles, badge: 'Matrix Suite', color: '#f59e0b' },
  { id: 'story', label: 'Story Foundry & Weaver', icon: Layers, badge: 'Narrative Engine', color: '#a855f7' },
  { id: 'maps', label: 'Tactical Map Maker & VTT', icon: Map, badge: 'Virtual Tabletop', color: '#38bdf8' },
  { id: 'aime', label: 'AIME & Element Forge', icon: Cpu, badge: 'AI & Lore Forge', color: '#ec4899' },
  { id: 'comms', label: 'CommLink Relay', icon: Radio, badge: 'Comms & Dispatch', color: '#3b82f6' },
  { id: 'utilities', label: 'Dice, Hotkeys & Audio', icon: Dices, badge: 'System Tools', color: '#eab308' },
  { id: 'rules', label: 'Core Rules & Mechanics', icon: BookOpen, badge: '2d10 System Reference', color: '#14b8a6' }
];

export const ComprehensiveUserGuideModal = ({ isOpen, onClose, initialTab = 'hub' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    AudioService.playTerminalBeep(1400, 0.02);
    setTimeout(() => setCopiedSnippet(null), 1500);
  };

  const activeTabMeta = useMemo(() => {
    return GUIDE_TABS.find(t => t.id === activeTab) || GUIDE_TABS[0];
  }, [activeTab]);

  if (!isOpen) return null;

  const TabIcon = activeTabMeta.icon;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 pt-6 sm:pt-10 md:pt-12 pb-8 overflow-y-auto select-none font-sans animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#0b0f17] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(34,211,238,0.2)] w-full max-w-7xl max-h-[88vh] sm:max-h-[90vh] flex flex-col font-sans overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <header className="px-5 py-3.5 bg-slate-950/90 border-b border-cyan-900/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  TANGENT SFF RP v2.0
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">OFFICIAL OPERATOR MANUAL</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-wider text-white uppercase font-mono truncate">
                Comprehensive System User Guide
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter guide topics..."
                className="w-48 lg:w-64 bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 py-1.5 pl-8 text-xs text-slate-200 placeholder-slate-500 outline-none font-mono transition-all shadow-inner"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              )}
            </div>

            <button
              onClick={() => {
                AudioService.playTerminalBeep(900, 0.02);
                onClose();
              }}
              className="p-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5"
              title="Close Guide (Esc)"
            >
              <span>✕</span>
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </header>

        {/* Main Body: Left App Selector Tabs + Right Content Reader */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Navigation Sidebar */}
          <aside className="w-56 sm:w-64 md:w-72 bg-[#080c13] border-r border-slate-800/90 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800/80 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <span>Application Modules</span>
              <span className="text-cyan-400 font-mono">10 APPS</span>
            </div>

            <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {GUIDE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      setActiveTab(tab.id);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wide transition-all flex items-center gap-2.5 group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/90 to-slate-900 text-cyan-200 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <div 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{tab.label}</div>
                      <div className="text-[9px] text-slate-500 font-normal tracking-tight truncate">
                        {tab.badge}
                      </div>
                    </div>
                    {isActive && (
                      <ChevronRight size={14} className="text-cyan-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer Info */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-[10px] font-mono text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Spotlight Omni-Search:</span>
                <kbd className="px-1 bg-slate-800 text-cyan-300 rounded">Ctrl+K</kbd>
              </div>
              <div className="flex justify-between">
                <span>Polyhedral Dice Dock:</span>
                <kbd className="px-1 bg-slate-800 text-amber-300 rounded">Alt+D</kbd>
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 flex flex-col h-full min-w-0 bg-[#090d16]/90 overflow-hidden">
            {/* Tab Header Banner */}
            <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                  style={{ background: `${activeTabMeta.color}20`, border: `1px solid ${activeTabMeta.color}60`, color: activeTabMeta.color }}
                >
                  <TabIcon size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ background: `${activeTabMeta.color}15`, color: activeTabMeta.color }}
                    >
                      {activeTabMeta.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Documentation & Function Breakdown</span>
                  </div>
                  <h1 className="text-xl font-extrabold font-mono uppercase tracking-wider text-white mt-0.5">
                    {activeTabMeta.label}
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(window.location.origin + '#' + activeTab, 'share-link')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold transition-colors"
                title="Copy Reference Link"
              >
                {copiedSnippet === 'share-link' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedSnippet === 'share-link' ? 'Copied' : 'Share Link'}</span>
              </button>
            </div>

            {/* Scrollable Documentation Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar text-slate-300 text-sm leading-relaxed">
              {activeTab === 'hub' && <HubGuideSection onCopy={handleCopy} copiedSnippet={copiedSnippet} />}
              {activeTab === 'folio' && <FolioGuideSection onCopy={handleCopy} copiedSnippet={copiedSnippet} />}
              {activeTab === 'dbm' && <DbmGuideSection onCopy={handleCopy} copiedSnippet={copiedSnippet} />}
              {activeTab === 'codex' && <CodexGuideSection onCopy={handleCopy} copiedSnippet={copiedSnippet} />}
              {activeTab === 'story' && <StoryFoundryGuideSection onCopy={handleCopy} copiedSnippet={copiedSnippet} />}
              {activeTab === 'maps' && <MapMakerGuideSection onCopy={handleCopy} copiedSnippet={copiedSnippet} />}
              {activeTab === 'aime' && <AimeGuideSection onCopy={handleCopy} copiedSnippet={copiedSnippet} />}
              {activeTab === 'comms' && <CommsGuideSection onCopy={handleCopy} copiedSnippet={copiedSnippet} />}
              {activeTab === 'utilities' && <UtilitiesGuideSection onCopy={handleCopy} copiedSnippet={copiedSnippet} />}
              {activeTab === 'rules' && <RulesGuideSection onCopy={handleCopy} copiedSnippet={copiedSnippet} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   1. OPERATIONS HUB & GLOBAL HUD GUIDE
   ========================================================================= */
const HubGuideSection = ({ onCopy, copiedSnippet }) => (
  <div className="space-y-6">
    <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
      <h3 className="text-base font-bold text-cyan-300 uppercase tracking-wide font-mono flex items-center gap-2">
        <Compass size={18} />
        1. Operations Hub Overview
      </h3>
      <p>
        The <strong className="text-white">Command Operations Hub (`/`)</strong> is the primary launchpad and operational nerve center of Tangent SFF RP. It integrates active campaign states, party telemetry, real-time group collaboration, transmission dispatches, and provides fast one-click navigation to every specialized app in the ecosystem.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
        <h4 className="text-cyan-400 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Activity size={15} /> Active Campaign & Squad Operations
        </h4>
        <p className="text-xs text-slate-300">
          The <strong className="text-white">CampaignOpsWidget</strong> displays the active campaign title, scenario hierarchy count, sector map count, and direct link to Story Foundry. The <strong className="text-white">GameSquadsWidget</strong> tracks multiplayer parties, active squads, invite join codes (<code className="text-amber-300 font-mono">?join=GRP-XXXXXX</code>), and squad roster synchronization.
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
        <h4 className="text-emerald-400 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Users size={15} /> Party at a Glance Carousel
        </h4>
        <p className="text-xs text-slate-300">
          The <strong className="text-white">PartyStatusWidget</strong> dynamically reads characters from your active Persona Folio roster, displaying hero portraits, species, archetype origin, Tech Level, Health/Vitality meters, and CP legality status with one-click sheet loading.
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
        <h4 className="text-amber-400 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Radio size={15} /> CommCenter & Transmission Feed
        </h4>
        <p className="text-xs text-slate-300">
          Streams real-time Quantum Relay channel messages, private operative frequencies, mission dispatches, and party dice rolls. Allows direct messaging and immediate dispatch to Comms page.
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
        <h4 className="text-purple-400 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Maximize2 size={15} /> Collapsible Drawers &amp; Gem Lists
        </h4>
        <p className="text-xs text-slate-300">
          Clicking any module launcher card unfolds interactive preview drawers (Persona Folio roster cards, Story scenarios tree, Element Forge lore elements, Tactical map selector, AIME manuscript cards) with compact gem-like list views, card borders, and transparent backdrops directly on the home canvas without route transitions.
        </p>
      </div>
    </div>

    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
      <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono flex items-center gap-2">
        <Zap size={16} className="text-amber-400" />
        Persistent Global HUD Features
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="text-cyan-300 font-bold font-mono uppercase mb-1">Omni-Search (`Ctrl+K`)</div>
          <p className="text-slate-400 text-[11px]">Instant spotlight palette indexing species, weapons, scenarios, maps, heroes, and `/roll` commands.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="text-amber-300 font-bold font-mono uppercase mb-1">Dice Tray Dock (`Alt+D`)</div>
          <p className="text-slate-400 text-[11px]">Collapsible polyhedral dice roller dock supporting complex expressions and in-chat broadcast.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="text-emerald-300 font-bold font-mono uppercase mb-1">Sci-Fi Audio Synthesizer</div>
          <p className="text-slate-400 text-[11px]">Procedural Web Audio API sound effects for button clicks, dice tumbles, and critical fanfares with mute toggle.</p>
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================================
   2. PERSONA FOLIO & ROSTER GUIDE
   ========================================================================= */
const FolioGuideSection = () => (
  <div className="space-y-6">
    <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
      <h3 className="text-base font-bold text-cyan-300 uppercase tracking-wide font-mono flex items-center gap-2">
        <Users size={18} />
        2. Persona Folio & Operative Sheet Architecture
      </h3>
      <p>
        The <strong className="text-white">Persona Folio (`/folio`)</strong> is the official digital character manager and sheet engine for Tangent Science Fantasy. It implements the rigid <strong className="text-cyan-300">150 Character Point (CP)</strong> economy, automated derived vitals, 7 detailed tabs, a 31-field deep Narrative writer powered by Bastion AI, and cloud-synced roster management.
      </p>
    </div>

    <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 space-y-2">
      <h4 className="text-amber-300 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
        💎 Character Point (CP/BP) Economy & Background Pools
      </h4>
      <ul className="list-disc pl-5 text-xs space-y-1 text-slate-300">
        <li><strong>Starting Budget:</strong> Default <strong className="text-cyan-300 font-mono">150 BP/CP</strong>. GMs can adjust the budget limit in campaign settings.</li>
        <li><strong>Three Dedicated 20 SP Pools:</strong> In addition to the 150 BP starting budget, characters receive <strong>20 Faction SP</strong>, <strong>20 Origin SP</strong>, and <strong>20 Occupation SP</strong> to assign to their background proficiencies.</li>
        <li><strong>Legality Enforcement:</strong> When total expenditures exceed budget, the header displays a pulsating red <strong className="text-red-400 font-mono">ILLEGAL BUILD</strong> badge. Clicking the CP bar opens the complete line-item breakdown.</li>
        <li><strong>CP Allocations:</strong> Core stats (5 BP / +1), check bonuses (1 BP / +1), skills, positive features, and augmentations cost CP. Flaws grant CP rebates.</li>
      </ul>
    </div>

    <div className="space-y-3">
      <h4 className="text-white font-bold text-sm font-mono uppercase tracking-wider">
        The 7 Folio Tabs Explained
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="font-bold text-cyan-300 font-mono flex items-center gap-1.5">
            <span>🪪</span> 1. IDENTITY TAB
          </div>
          <p className="text-slate-300 text-[11px]">
            Operative name, species selection (with automated biological trait modifiers), origin archetype, background occupation, physical metrics (age, height, weight), portrait image URL/upload, and augmentation slots.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="font-bold text-emerald-300 font-mono flex items-center gap-1.5">
            <span>📊</span> 2. CORE STATS & DERIVED VITALS
          </div>
          <p className="text-slate-300 text-[11px]">
            The 6 primary attributes (STR, AGI, STA, INT, WIS, CHA) and sub-attributes (Might, Reflex, Fortitude, Logic, Will, Etiquette). Automatically computes <strong className="text-white">Health (30 + Fortitude)</strong>, <strong className="text-white">Vitality (30 + Will)</strong>, Toughness (STA score), Defense value, and STR-based carry capacity.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="font-bold text-amber-300 font-mono flex items-center gap-1.5">
            <span>🎯</span> 3. SKILLS & SPECIALIZATIONS
          </div>
          <p className="text-slate-300 text-[11px]">
            Trained proficiencies categorized across Combat, Tech, Social, Psionic, and Science. Tracks Ranks (<span className="text-slate-400 font-mono">Novice → Expert → Master → Legend</span>), linked attribute modifiers, and precision Specialization bonuses.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="font-bold text-purple-300 font-mono flex items-center gap-1.5">
            <span>⚡</span> 4. ABILITIES, FEATURES & FLAWS
          </div>
          <p className="text-slate-300 text-[11px]">
            Positive traits, species gifts, meta-tech powers, psychic disciplines, and hindrances. Includes custom ability builder and rulebook reference lookup.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="font-bold text-red-300 font-mono flex items-center gap-1.5">
            <span>⚔️</span> 5. COMBAT LOADOUT & GEAR
          </div>
          <p className="text-slate-300 text-[11px]">
            Offensive weaponry (Damage formula, Rate of Fire, Range, Skill type, Ammo), defensive suits (Armor Resistance, Coverage areas), equipment inventory, and encumbrance tracking.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="font-bold text-blue-300 font-mono flex items-center gap-1.5">
            <span>📝</span> 6. 31-FIELD NARRATIVE STORY WRITER
          </div>
          <p className="text-slate-300 text-[11px]">
            Four sub-tabs (<strong className="text-white">Biography, Psychology, Factions, Logistics</strong>) with 31 distinct character fields and <strong>🤖 BASTION AI Auto-Writer</strong> to generate or refine rich backstory snippets in real-time.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-2">
      <h4 className="text-cyan-400 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
        🚀 Guided Creator Wizard, Persona Bridge & Roster Management
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="font-bold text-white mb-1">🧙 Guided Creator Wizard</div>
          <p className="text-slate-400 text-[11px]">An 8-step walkthrough taking players from concept, species lineage, origin, occupation, attributes, and starting gear to a fully validated character sheet.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="font-bold text-cyan-300 mb-1">🌉 Persona Bridge Sync</div>
          <p className="text-slate-400 text-[11px]">Real-time synchronization utility linking Folio operative stats directly to Map Maker battlemap tokens and CommLink chat identities.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="font-bold text-emerald-300 mb-1">📇 Roster & Cloud Sync</div>
          <p className="text-slate-400 text-[11px]">Store unlimited characters in your authenticated Google Cloud account, clone operatives, generate public read-only share links, or export standalone JSON files.</p>
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================================
   3. OMNICORTEX DBM GUIDE
   ========================================================================= */
const DbmGuideSection = () => (
  <div className="space-y-6">
    <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
      <h3 className="text-base font-bold text-emerald-300 uppercase tracking-wide font-mono flex items-center gap-2">
        <Database size={18} />
        3. Omnicortex Master Compendium & DBM Operations
      </h3>
      <p>
        The <strong className="text-white">Omnicortex (`/dbm`)</strong> is the central relational rules codex and compendium of Tangent SFF RP. Organized into distinct architectural subdomains, it indexes all canon items, biological lineages, occupational backgrounds, combat arms, powers, and modifier tables with live search, relational selectors, and JSON portability.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
      {[
        { cat: 'Architecture', icon: '🏛️', desc: 'Facility scales, modular rooms, life support & defense grids.' },
        { cat: 'Armoring & Shields', icon: '🛡️', desc: 'Protective weave, powered suits, coverage zones & DR ratings.' },
        { cat: 'Augmentations', icon: '🦾', desc: 'Cybernetics, bioware, neural co-processors & sensory shunts.' },
        { cat: 'Mecha & Vehicles', icon: '🤖', desc: 'Frame weight classes, propulsion, hardpoints & combat walkers.' },
        { cat: 'Weaponry Matrix', icon: '🔫', desc: 'Melee, slugthrowers, lasers, plasma arms & heavy artillery.' },
        { cat: 'Gear & Tools', icon: '🧰', desc: 'Field equipment, scanners, medical injectors & utility rigs.' },
        { cat: 'Invocations', icon: '✨', desc: 'Disciplines (Energy, Entropy, Matter, Mental, Dimension, Illusion).' },
        { cat: 'Occupations & Origins', icon: '💼', desc: 'Career backgrounds, homeworld habitats & starting packages.' },
        { cat: 'Species & Lineages', icon: '🧬', desc: 'Biological species profiles, synthetic chassis & alien types.' },
        { cat: 'Traits & Disadvantages', icon: '⚡', desc: 'Granular species traits (Basic, Advanced, Elite) & flaw rebates.' },
        { cat: 'Rules & Compendium', icon: '📜', desc: 'Core mechanics, combat systems, movement & advancement manuals.' },
        { cat: 'Prerequisites & Modifiers', icon: '🔑', desc: 'Requirement ladders and global combat condition modifiers.' },
      ].map(c => (
        <div key={c.cat} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div className="font-bold text-amber-300 font-mono flex items-center gap-1.5 mb-1">
            <span>{c.icon}</span> {c.cat}
          </div>
          <p className="text-slate-400 text-[11px]">{c.desc}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
      <div className="bg-slate-900/60 border border-cyan-500/30 rounded-xl p-4 space-y-2">
        <h4 className="text-cyan-300 font-bold uppercase font-mono tracking-wider">
          🛡️ Game Mode vs. ⚙️ Architect Dev Mode
        </h4>
        <p className="text-slate-300 text-[11px]">
          <strong>Game Mode (Read-Only):</strong> Streamlined view for fast reference during live game sessions. Prevents accidental record modifications.<br />
          <strong>Architect Dev Mode:</strong> Unlocks direct item editing, schema customization, field additions, and entry creation for Game Masters and Administrators.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-4 space-y-2">
        <h4 className="text-emerald-300 font-bold uppercase font-mono tracking-wider">
          💾 Cloud Sync & Automated Ingestion Pipelines
        </h4>
        <p className="text-slate-300 text-[11px]">
          Synchronizes local markdown files with Firestore using automated 450-op batch scripts (<code className="text-cyan-300 font-mono">syncOmnicortexSpecies.mjs</code>, <code className="text-cyan-300 font-mono">syncOmnicortexEquipment.mjs</code>) to prevent quota throttling, paired with offline IndexedDB caching for instant search.
        </p>
      </div>
    </div>
  </div>
);

/* =========================================================================
   4. CODEX MATRIX SUITE & ECONOMATRIX GUIDE
   ========================================================================= */
const CodexGuideSection = ({ onCopy, copiedSnippet }) => (
  <div className="space-y-6">
    <div className="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold text-amber-300 uppercase tracking-wide font-mono flex items-center gap-2">
          <Sparkles size={18} />
          4. Codex Simulation Engine, Matrices & Data Ingestion
        </h3>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 uppercase">
          17 Matrices • 5 Suites • 6 Pure Engines
        </span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">
        The <strong className="text-white">Codex (`/codex`)</strong> is the definitive mathematical simulation engine and asset forge for Tangent SFF RP. It governs all equipment crafting, structure construction, vehicle fabrication, biological species synthesis, world generation, and automated multi-format data ingestion directly into active memory and Firestore.
      </p>
    </div>

    {/* The 5 Thematic Suites Accordion Summary */}
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
        <span>📂</span> The 5 Thematic Sidebar Suites & 17 Matrices
      </h4>

      {/* 1. Hardware & Structures (Amber) */}
      <div className="bg-slate-900/50 border border-amber-500/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-amber-300 font-mono text-xs uppercase flex items-center gap-1.5">
            <span>📦</span> 1. Hardware & Structures Suite
          </div>
          <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            6 Matrices
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-amber-200 block mb-0.5">🏛️ Architecture Blueprint</strong>
            <p className="text-slate-400 text-[11px]">Sheds (0.1 Mod) to Spires (800+ Mods), 10:1 UDU mount conversion, Highest Complexity DC rule, Workforce PP calendar & Liquidity Gap.</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-amber-200 block mb-0.5">🛡️ Armor Coverage Matrix</strong>
            <p className="text-slate-400 text-[11px]">7 hit-location slots (Head, Torso, Arms, Legs, Full Suit), composite DR, Max Dex caps, and hardware socket allocation.</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-amber-200 block mb-0.5">🦾 Augmentations & FBC</strong>
            <p className="text-slate-400 text-[11px]">Cranial, Ocular, Thoracic & Dermal nodes, Full Body Conversion (FBC) synthetic packages, and social stigma stepper.</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-amber-200 block mb-0.5">🎒 Equipment & Workshop</strong>
            <p className="text-slate-400 text-[11px]">Fine to Structure sizing, workshop toolkits (+0 to +8 Check bonus), Processor Ratings (PR 0–4), and Hazard Sealing (EPR 0–3).</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-amber-200 block mb-0.5">🤖 Mecha & Vehicles</strong>
            <p className="text-slate-400 text-[11px]">Humanoid/Quad/Tracked frames, mount bays, Defense DC, variable thrusters & Megacredit ($M) conversion.</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-amber-200 block mb-0.5">⚔️ Weapon Mod Stacker</strong>
            <p className="text-slate-400 text-[11px]">Attachment rails, damage dice overcharge upgrades, reliability downgrades, and corporate manufacturer skins.</p>
          </div>
        </div>
      </div>

      {/* 2. Characters & Companions (Blue) */}
      <div className="bg-slate-900/50 border border-blue-500/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-blue-300 font-mono text-xs uppercase flex items-center gap-1.5">
            <span>👥</span> 2. Characters & Companions Suite
          </div>
          <span className="text-[10px] font-mono text-blue-400/80 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
            2 Matrices
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-blue-200 block mb-0.5">👤 Modular NPC Stat Blocks</strong>
            <p className="text-slate-400 text-[11px]">Threat Tiers 1–20, Competency roles (Minion, Skirmisher, Bruiser, Sniper, Elite, Boss), and tactical AI behaviors (Swarm, Flank, Suppress, Protect).</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-blue-200 block mb-0.5">🌟 Features & Perks Matrix</strong>
            <p className="text-slate-400 text-[11px]">Master compendium of general perks, combat feats, biological mutations, and racial features with BP balance validation.</p>
          </div>
        </div>
      </div>

      {/* 3. Planetary, Species & Factions (Emerald) */}
      <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-emerald-300 font-mono text-xs uppercase flex items-center gap-1.5">
            <span>🌍</span> 3. Planetary, Species & Factions Suite
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            3 Matrices
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-emerald-200 block mb-0.5">🧬 Species Forge Matrix</strong>
            <p className="text-slate-400 text-[11px]">150 BP character budget, movement modes (Ground, Burrow, Swim, Glide, Fly), and genetic biotechnology synthesis DC.</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-emerald-200 block mb-0.5">🪐 Planetary Design Matrix</strong>
            <p className="text-slate-400 text-[11px]">Universal World Profile (UWP/TWP), 16-domain civilization radar, Trade codes (Ag, In, Hi, Ri), and speculative commodity market margins.</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-emerald-200 block mb-0.5">🚩 Factions & Polities</strong>
            <p className="text-slate-400 text-[11px]">26 canonical attributes covering driving mandates, government types, naval assets, sigils, and economic models.</p>
          </div>
        </div>
      </div>

      {/* 4. Metaphysics (Purple) */}
      <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-purple-300 font-mono text-xs uppercase flex items-center gap-1.5">
            <span>✨</span> 4. Metaphysics Suite
          </div>
          <span className="text-[10px] font-mono text-purple-400/80 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
            2 Matrices
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-purple-200 block mb-0.5">⚡ Invocation Matrix</strong>
            <p className="text-slate-400 text-[11px]">6 disciplines (Telekinesis, Telepathy, Pyrokinesis, Chronomancy, Biokinesis, Voidcraft), range/target/area/duration formulas, and essence drain strain costs.</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-purple-200 block mb-0.5">🔮 Meta-Tech Matrix</strong>
            <p className="text-slate-400 text-[11px]">Metamaterial resonance bonding, artifact crafting formulas, and passive imbuements into weapons, armor, and cyberware.</p>
          </div>
        </div>
      </div>

      {/* 5. System Suites (Slate) */}
      <div className="bg-slate-900/50 border border-slate-500/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-200 font-mono text-xs uppercase flex items-center gap-1.5">
            <span>⚡</span> 5. System Suites
          </div>
          <span className="text-[10px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-600/40">
            4 Suites
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-0.5">💰 Economatrix Dashboard</strong>
            <p className="text-slate-400 text-[11px]">TSC calculator, 7-tier crafting timetable, speculative trade simulator, and Wealth Score status table.</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-0.5">🔬 Technology Codex</strong>
            <p className="text-slate-400 text-[11px]">TL0–TL5 Domain Grid across 16 domains, adaptive tech reconfiguration action economy, and AI continuum.</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-0.5">📐 Scaling Codex</strong>
            <p className="text-slate-400 text-[11px]">14 size tiers, die degradation ladder (-1ds to -5ds), cross-scale combat matchups, and starship overblast.</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-0.5">📥 Ingestion Engine</strong>
            <p className="text-slate-400 text-[11px]">Multimodal BASTION AI, Universal Delimiter CSV/TSV/Markdown parser, and Side-by-Side Record Diff Inspector.</p>
          </div>
        </div>
      </div>
    </div>

    {/* Core Mathematical Formulations */}
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Code size={14} /> Core Mathematical Formulations
        </h4>
        <button
          type="button"
          onClick={() => onCopy('V = 10 * 4^(DC / 5); MaterialCost = V * 0.50; DailyPP = max(1, (Check - 10) * TierMult);', 'tsc-formula')}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 transition-all"
        >
          {copiedSnippet === 'tsc-formula' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copiedSnippet === 'tsc-formula' ? 'Copied' : 'Copy Formulas'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
          <div className="text-amber-300 font-bold">Tangent Standard Curve (TSC)</div>
          <div className="text-slate-300 bg-slate-900 px-2 py-1 rounded">Market Value = 10 * 4^(DC / 5)</div>
          <div className="text-slate-300 bg-slate-900 px-2 py-1 rounded">Material Cost = floor(Market Value * 0.50)</div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
          <div className="text-emerald-300 font-bold">Fabrication & Workforce (PP)</div>
          <div className="text-slate-300 bg-slate-900 px-2 py-1 rounded">Daily PP = max(1, (SkillCheck - 10) * ToolTierMult)</div>
          <div className="text-slate-300 bg-slate-900 px-2 py-1 rounded">Coop Daily PP = Crew * (SkillCheck - 10) * ToolTierMult</div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
          <div className="text-cyan-300 font-bold">Liquidity Gap & Wealth Score</div>
          <div className="text-slate-300 bg-slate-900 px-2 py-1 rounded">Liquid Cost = max(0, ItemValue - BuyerAutoBuyLimit)</div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
          <div className="text-purple-300 font-bold">10:1 UDU Capacity Hierarchy</div>
          <div className="text-slate-300 bg-slate-900 px-2 py-1 rounded">1 Mod = 10 Mounts = 100 Sockets = 1,000 Nodes = 10,000 Sub-Nodes</div>
        </div>
      </div>
    </div>

    {/* Data Ingestion Engine & Revision Pipeline */}
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
      <h4 className="text-cyan-400 font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
        📥 Codex Ingestion Engine & Diff Revision Workbench
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
          <div className="text-cyan-300 font-bold font-mono uppercase">1. Multi-Modal Intake</div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            <strong>BASTION AI Studio:</strong> Multimodal extraction from PDFs/TXTs with automatic multi-chunk section splitting (&gt;10k chars) and real-time synthesis progress.<br />
            <strong>Universal Delimiter Parser:</strong> Auto-detects Markdown pipes, TSV (Excel paste), RFC 4180 CSV, and Semicolon tables with header aliasing and drag-and-drop file upload.
          </p>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
          <div className="text-amber-300 font-bold font-mono uppercase">2. Side-by-Side Diff Modal</div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Compares incoming staged records against existing database items. Visual status badges highlight <strong className="text-amber-300">MODIFIED</strong> fields, <strong className="text-emerald-300">NEW FIELDS</strong>, and <strong className="text-slate-400">MATCHES</strong> with one-click transition into the In-Place Revision Workbench.
          </p>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
          <div className="text-emerald-300 font-bold font-mono uppercase">3. Conflict Strategies & Sanitization</div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Choose between <strong>Merge</strong> (preserves existing document IDs), <strong>Overwrite</strong>, or <strong>Skip</strong>. All incoming strings are automatically sanitized to strip LaTeX math delimiters and unescaped markdown to ensure 100% Folio and DBM compendium compatibility.
          </p>
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================================
   5. STORY FOUNDRY & STORY WEAVER GUIDE
   ========================================================================= */
const StoryFoundryGuideSection = () => (
  <div className="space-y-6">
    <div className="bg-slate-900/60 border border-purple-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
      <h3 className="text-base font-bold text-purple-300 uppercase tracking-wide font-mono flex items-center gap-2">
        <Layers size={18} />
        5. Story Foundry & Story Weaver Scenario Engine
      </h3>
      <p>
        The <strong className="text-white">Story Foundry (`/foundry`)</strong> is an integrated campaign builder combining hierarchical tree scenario management, rich text element editing, relational links, and offline-first cloud syncing with automatic conflict resolution.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
        <h4 className="text-purple-300 font-bold uppercase font-mono tracking-wider">
          🌳 Hierarchical Scenario Tree Editor
        </h4>
        <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
          <li><strong>Drag-and-Drop Organization:</strong> Reorder sibling nodes or nest elements into parent acts and chapters with real-time visual drop highlights.</li>
          <li><strong>8 Element Types:</strong> Character, Location, Faction, Event, Item, Lore, Session Prep, and Custom Schema.</li>
          <li><strong>Relational Cross-Links:</strong> Link story characters to specific location nodes or factions with bi-directional references.</li>
          <li><strong>Safety Deletion:</strong> Requires typing the node name before destructive removal to prevent accidental loss.</li>
        </ul>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
        <h4 className="text-cyan-300 font-bold uppercase font-mono tracking-wider">
          ☁️ Cloud Push/Pull & Export Options
        </h4>
        <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
          <li><strong>Debounced Cloud Sync:</strong> Automatically batches changes with 1.5s write throttling to protect Firestore quotas.</li>
          <li><strong>Conflict Detection:</strong> If local and remote timestamps diverge, a visual Sync Conflict Modal lets you choose or merge branches.</li>
          <li><strong>Multi-Format Export:</strong> Export your full campaign or single acts to <strong className="text-amber-300">Markdown (.md)</strong>, <strong className="text-cyan-300">HTML</strong>, <strong className="text-emerald-300">PDF</strong>, or <strong className="text-purple-300">JSON</strong>.</li>
        </ul>
      </div>
    </div>
  </div>
);

/* =========================================================================
   6. TACTICAL MAP MAKER & VTT GUIDE
   ========================================================================= */
const MapMakerGuideSection = () => (
  <div className="space-y-6">
    <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
      <h3 className="text-base font-bold text-cyan-300 uppercase tracking-wide font-mono flex items-center gap-2">
        <Map size={18} />
        6. Tactical Map Maker & Virtual Tabletop (VTT)
      </h3>
      <p>
        The <strong className="text-white">Tactical Map Maker (`/foundry/map-maker`)</strong> is a high-performance battlemap canvas powered by React Konva for spatial tactical combat, regional overland maps, token summoning, fog-of-war, initiative tracking, and real-time player spectator broadcasting.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-cyan-300 font-mono uppercase">🎯 Multi-Grid Canvas</div>
        <p className="text-slate-400 text-[11px]">Supports Square (5ft/1.5m), Hexagonal (pointy/flat topped), and Isometric grids with smooth pan/zoom and snapping.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-emerald-300 font-mono uppercase">🎨 Terrain & Biome Painting</div>
        <p className="text-slate-400 text-[11px]">Paint textured biomes (sci-fi metallic decks, wasteland sands, toxic marshes, neon cities) or generate random procedural landmasses.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-amber-300 font-mono uppercase">👥 Folio Token Drawer</div>
        <p className="text-slate-400 text-[11px]">Collapsible side drawer providing one-click drag-and-drop summoning of operative tokens directly from your Persona Folio roster with live vitals.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-purple-300 font-mono uppercase">⚔️ Initiative Tracker & Combat Log</div>
        <p className="text-slate-400 text-[11px]">Manage round sequences, initiative order, active engagement ranges, and synchronized combat turns across players and NPCs.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-red-300 font-mono uppercase">💥 Floating Combat Text</div>
        <p className="text-slate-400 text-[11px]">Animated scrolling combat numbers displaying damage dealt, armor absorption, health recovered, and critical hits directly over tokens.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-pink-300 font-mono uppercase">💎 Status Gems & Fog of War</div>
        <p className="text-slate-400 text-[11px]">Attach visual condition gems (Stunned, Burning, Concealed, Exhausted) to token bases, with paintable fog-of-war to shroud unexplored rooms.</p>
      </div>
    </div>
  </div>
);

/* =========================================================================
   7. AIME CREATIVE SUITE & ELEMENT FORGE GUIDE
   ========================================================================= */
const AimeGuideSection = () => (
  <div className="space-y-6">
    <div className="bg-slate-900/60 border border-pink-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
      <h3 className="text-base font-bold text-pink-300 uppercase tracking-wide font-mono flex items-center gap-2">
        <Cpu size={18} />
        7. AIME Creative Suite & Element Forge Lore Architect
      </h3>
      <p>
        The <strong className="text-white">AIME Creative Suite (`/foundry/aime`)</strong> (Artificial Intellect Master Entity) and <strong className="text-white">Element Forge (`/foundry/elements`)</strong> provide AI-assisted prose drafting and structured worldbuilding databases.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
        <h4 className="text-pink-300 font-bold uppercase font-mono tracking-wider">
          ✨ 3-Stage AIME Manuscript Engine
        </h4>
        <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 text-[11px]">
          <li><strong>Stage 1 — Brainstorm:</strong> Select active lore elements & Guidance Gems to brainstorm scene premises and unexpected narrative twists.</li>
          <li><strong>Stage 2 — Outline:</strong> Structure scene beats, character arcs, and pacing before generating long-form prose.</li>
          <li><strong>Stage 3 — Draft & Floating Toolbar:</strong> Write in a rich manuscript canvas with floating tools to <em>Expand, Rephrase, Shorten, Polish,</em> or <em>Transform Tone</em>.</li>
        </ol>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
        <h4 className="text-cyan-300 font-bold uppercase font-mono tracking-wider">
          🧩 Element Forge & Floating AI Co-Pilot
        </h4>
        <p className="text-slate-300 text-[11px] mb-2">
          Create schema-driven world lore for Characters, Locations, Factions, Relics, and Historical Events with custom attributes and automated Omnicortex rules cross-referencing.
        </p>
        <p className="text-slate-400 text-[11px]">
          <strong>Movable AIME Co-Pilot:</strong> Click ✨ AIME Co-Pilot in Story Foundry to open a floating, draggable chat assistant that checks rules with Bastion AI and executes <code className="text-amber-300 font-mono">/roll 2d10+4</code> directly.
        </p>
      </div>
    </div>
  </div>
);

/* =========================================================================
   8. COMMLINK RELAY GUIDE
   ========================================================================= */
const CommsGuideSection = () => (
  <div className="space-y-6">
    <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
      <h3 className="text-base font-bold text-blue-300 uppercase tracking-wide font-mono flex items-center gap-2">
        <Radio size={18} />
        8. CommLink Quantum Relay & In-Chat Dice System
      </h3>
      <p>
        The <strong className="text-white">CommLink Relay (`/comms`)</strong> is a real-time multiplayer communications and dispatch matrix for roleplay dialogue, GM announcements, private operative frequencies, and instant dice check resolution.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-cyan-300 font-mono uppercase">📡 Public & Faction Channels</div>
        <p className="text-slate-400 text-[11px]">Broadcast on open channels (Holonet) or join encrypted channels accessible only to authorized squad members.</p>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-emerald-300 font-mono uppercase">🔒 Direct Operative Comms</div>
        <p className="text-slate-400 text-[11px]">Establish secure 1-on-1 private frequencies between operatives or between a player and the GM for secret checks.</p>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-amber-300 font-mono uppercase">🎲 Slash Command Rolls</div>
        <p className="text-slate-400 text-[11px]">Type <code className="text-amber-300 font-mono">/roll 2d10+4</code> or <code className="text-amber-300 font-mono">/roll d100</code> directly in message input to broadcast verified rolls.</p>
      </div>
    </div>
  </div>
);

/* =========================================================================
   9. UTILITIES, HOTKEYS & AUDIO GUIDE
   ========================================================================= */
const UtilitiesGuideSection = () => (
  <div className="space-y-6">
    <div className="bg-slate-900/60 border border-yellow-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
      <h3 className="text-base font-bold text-yellow-300 uppercase tracking-wide font-mono flex items-center gap-2">
        <Dices size={18} />
        9. Global Utilities, Hotkeys & Audio Synthesizer
      </h3>
      <p>
        Tangent SFF RP is engineered with global ergonomic docks, zero-dependency procedural audio synthesis, spotlight omni-search, and high-speed keyboard shortcuts accessible on all routes.
      </p>
    </div>

    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
      <h4 className="text-white font-bold text-xs uppercase font-mono tracking-wider">
        Global Keyboard Shortcuts Cheatsheet
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
              <th className="pb-2">Keybinding</th>
              <th className="pb-2">Action Description</th>
              <th className="pb-2">Availability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
            <tr>
              <td className="py-2"><kbd className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">Ctrl + K</kbd> or <kbd className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">Cmd + K</kbd></td>
              <td>Toggle Spotlight Omni-Search &amp; Command Palette</td>
              <td>Global</td>
            </tr>
            <tr>
              <td className="py-2"><kbd className="px-2 py-0.5 bg-slate-800 text-amber-300 rounded border border-slate-700">Alt + D</kbd></td>
              <td>Toggle Floating Polyhedral Dice Roller Dock</td>
              <td>Global</td>
            </tr>
            <tr>
              <td className="py-2"><kbd className="px-2 py-0.5 bg-slate-800 text-blue-300 rounded border border-slate-700">Alt + C</kbd></td>
              <td>Toggle CommLink Dock Quick Chat</td>
              <td>Global</td>
            </tr>
            <tr>
              <td className="py-2"><kbd className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">Esc</kbd></td>
              <td>Close active modal, drawer, or palette</td>
              <td>Global</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

/* =========================================================================
   10. TANGENT CORE RULES & RESOLUTION MECHANICS
   ========================================================================= */
const RulesGuideSection = () => (
  <div className="space-y-6">
    <div className="bg-slate-900/60 border border-teal-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
      <h3 className="text-base font-bold text-teal-300 uppercase tracking-wide font-mono flex items-center gap-2">
        <BookOpen size={18} />
        10. Tangent Core Mechanics, Attributes &amp; Resolution Engine
      </h3>
      <p className="text-slate-300 text-sm">
        Tangent Science Fantasy uses a dual resolution architecture: <strong className="text-cyan-300 font-mono">2d10 + Attribute + Skill Rank vs TN</strong> for trained skill tests, and <strong className="text-amber-300 font-mono">d20 + Base Check Score + Modifiers vs CR</strong> for Attribute Checks &amp; Saving Throws.
      </p>
    </div>

    {/* Section 1: Trained Skills Resolution */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
        <h4 className="text-teal-300 font-bold uppercase font-mono tracking-wider">
          🎲 Trained Skill Formula &amp; Target Numbers (TN)
        </h4>
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-cyan-300 text-center font-bold text-sm">
          Roll = 2d10 + Linked Attribute + Skill Rank + Mods
        </div>
        <div className="space-y-1 text-slate-300 text-[11px]">
          <div className="flex justify-between py-0.5 border-b border-slate-800"><span>TN 10 — Routine / Simple</span> <span className="text-emerald-400 font-bold">Standard Task</span></div>
          <div className="flex justify-between py-0.5 border-b border-slate-800"><span>TN 15 — Challenging / Trained</span> <span className="text-cyan-400 font-bold">Combat Stress</span></div>
          <div className="flex justify-between py-0.5 border-b border-slate-800"><span>TN 20 — Formidable / Expert</span> <span className="text-amber-400 font-bold">Specialist Feat</span></div>
          <div className="flex justify-between py-0.5"><span>TN 25+ — Heroic / Legendary</span> <span className="text-purple-400 font-bold">Universe-Altering</span></div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
        <h4 className="text-amber-300 font-bold uppercase font-mono tracking-wider">
          ⚡ Critical Success &amp; Critical Fumbles (Numeric Adjustments)
        </h4>
        <p className="text-slate-300 text-[11px]">
          <strong>Critical Success (Double 10s on 2d10):</strong> The rolled value is treated as <strong className="text-amber-300 font-mono">30</strong> (<code className="text-cyan-300 font-mono">Total = 30 + Modifiers</code>), guaranteeing an extraordinary triumph and maximum margin of success.
        </p>
        <p className="text-slate-300 text-[11px]">
          <strong>Critical Fumble (Double 1s on 2d10):</strong> The rolled value is treated as <strong className="text-red-400 font-mono">-10</strong> (<code className="text-red-300 font-mono">Total = -10 + Modifiers</code>), resulting in catastrophic failure, weapon malfunctions, or severe tactical complications.
        </p>
      </div>
    </div>

    {/* Section 2: Core Attributes & Checks System */}
    <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-cyan-300 font-bold uppercase font-mono tracking-wider text-xs flex items-center gap-2">
          <span>🧬</span> The Six Core Attributes &amp; Attribute Checks
        </h4>
        <span className="text-[10px] font-mono text-amber-300 font-semibold">
          Attr Cost: 5 BP / +1 • Check Cost: 1 BP / +1
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {[
          { name: 'Strength (STR)', check: 'Might Check', formula: '2 + (STR × 2)', desc: 'Carrying/lifting weight, melee damage, grappling, bending prison bars, smashing gates.' },
          { name: 'Agility (AGI)', check: 'Reflex Check', formula: '2 + (AGI × 2)', desc: 'Dodging attacks, ranged accuracy, initiative, acrobatic feats, diving from explosions.' },
          { name: 'Stamina (STA)', check: 'Fortitude Check', formula: '2 + (STA × 2)', desc: 'Endurance, toxic/disease immunity, harsh climates, base Toughness, Health buffer.' },
          { name: 'Intellect (INT)', check: 'Reason Check', formula: '2 + (INT × 2)', desc: 'Pure logic, problem-solving, deduction, decoding languages/ciphers, technical analysis.' },
          { name: 'Wisdom (WIS)', check: 'Willpower Check', formula: '2 + (WIS × 2)', desc: 'Sensing deception, mental fortitude, resisting terror/fear, breaking mind control, focus.' },
          { name: 'Charisma (CHA)', check: 'Etiquette Check', formula: '2 + (CHA × 2)', desc: 'Persuasion, leadership, inspiring morale, bartering, diplomacy, peaceful conflict resolution.' },
        ].map(item => (
          <div key={item.name} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white font-mono">{item.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                {item.check}
              </span>
            </div>
            <div className="text-[10px] font-mono text-amber-300">Base: {item.formula}</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Mechanics Breakdown: General Checks, Saving Throws, Challenges & Synergy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="font-bold text-emerald-300 font-mono text-xs uppercase">
            🛡️ General Checks vs Saving Throws
          </div>
          <p className="text-slate-300 text-[11px]">
            <strong>General Checks:</strong> Tests for actions not covered by specific skills (e.g., Strength to force a door, Dexterity to catch a falling glass).
          </p>
          <p className="text-slate-300 text-[11px]">
            <strong>Saving Throws:</strong> Reactive checks to resist or mitigate harmful effects (Fortitude vs neurotoxin, Willpower vs psionic charm, Reflex vs explosive traps).
          </p>
          <p className="text-amber-400 text-[10px] font-mono">
            ⚠️ Rule: Attribute checks never replace trained skill checks; if an action is covered by a skill, use the skill roll.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="font-bold text-purple-300 font-mono text-xs uppercase">
            ⚔️ Challenge Types &amp; Skill Synergy
          </div>
          <p className="text-slate-300 text-[11px]">
            <strong>Targeted Challenge:</strong> Compare <code className="text-cyan-300 font-mono">d20 + Base Score + Mods</code> against the GM's Challenge Rating (CR).
          </p>
          <p className="text-slate-300 text-[11px]">
            <strong>Opposed Challenge:</strong> Direct contest between two characters (e.g. arm wrestling, battle of wills, social debate). Highest total wins.
          </p>
          <p className="text-teal-300 text-[11px]">
            <strong>Skill Synergy:</strong> Relevant skills aid saves (e.g., Medicine aids Fortitude vs poison; Athletics aids Reflex vs hazards; Perception aids Willpower vs illusions; Linguistics aids Reason vs ancient inscriptions).
          </p>
        </div>
      </div>
    </div>

    {/* Section 3: Perception Sub-Ability & Detection Checks */}
    <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-cyan-300 font-bold uppercase font-mono tracking-wider text-xs flex items-center gap-2">
          <span>👁️</span> Sub-Ability: Perception &amp; Detection Checks
        </h4>
        <span className="text-[10px] font-mono text-cyan-300 font-semibold">
          Formula: Intellect + Wisdom
        </span>
      </div>

      <p className="text-slate-300 text-xs leading-relaxed">
        <strong>Perception</strong> is a sub-ability derived from a character's <strong>Intellect</strong> and <strong>Wisdom</strong> scores. It reflects overall sensory acuity, mental focus, and intuitive awareness. Perception is combined with specific skills to determine success across different detection scenarios.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-cyan-300 font-mono text-xs flex items-center gap-1.5">
            <span>🎯</span> Default Check (Alertness)
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            <code>Perception Base + Alertness (Rank + Mod)</code>
          </div>
          <p className="text-slate-300 text-[11px]">
            Standard environmental awareness: spotting visual/auditory cues, noticing hidden traps, concealed doors, and detecting ambushes.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-amber-300 font-mono text-xs flex items-center gap-1.5">
            <span>✨</span> Meta Perception (Attune)
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            <code>Perception Base + Attune (Rank + Mod)</code>
          </div>
          <p className="text-slate-300 text-[11px]">
            Supernatural sensing: detecting and analyzing magic, psychic powers, subtle planar energies, and Metafocus aura signatures.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-emerald-300 font-mono text-xs flex items-center gap-1.5">
            <span>💬</span> Social Perception (Insight)
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            <code>Perception Base + Insight (Rank + Mod)</code>
          </div>
          <p className="text-slate-300 text-[11px]">
            Interpersonal reading: picking up on subtle social cues, micro-expressions, vocal tone shifts, motivations, and lie detection.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-blue-300 font-mono text-xs flex items-center gap-1.5">
            <span>⚙️</span> Technical Perception (Technology)
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            <code>Perception Base + Technology (Rank + Mod)</code>
          </div>
          <p className="text-slate-300 text-[11px]">
            Hardware analysis: interpreting electronic sensors, detecting hardware vulnerabilities, electronic counter-measures, and tech devices.
          </p>
        </div>
      </div>

      <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-900/40 space-y-1">
        <div className="text-[11px] font-bold text-slate-200 uppercase font-mono">
          Example &amp; GM Modifiers
        </div>
        <p className="text-[11px] text-slate-400">
          A character with <strong className="text-slate-200">INT +2</strong> and <strong className="text-slate-200">WIS +1</strong> has a <strong className="text-cyan-300">Base Perception of +3</strong>. Spotting a hidden tripwire uses Alertness + 3; sensing a magic rune uses Attune + 3; reading a suspect uses Insight + 3; analyzing computer hardware uses Technology + 3. The GM applies situational modifiers based on lighting, distance, interference, or camouflage.
        </p>
      </div>
    </div>

    {/* Section 4: Experience & Advancement System */}
    <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-emerald-300 font-bold uppercase font-mono tracking-wider text-xs flex items-center gap-2">
          <span>🎖️</span> Experience &amp; Advancement (Award Points &amp; The Increment Rule)
        </h4>
        <span className="text-[10px] font-mono text-emerald-400 font-bold">
          1 AP = 1 BP • Standard Pacing: 1-3 AP / session
        </span>
      </div>

      <p className="text-slate-300 text-xs leading-relaxed">
        Character progression in Tangent is organic, non-linear, and based on real narrative achievements. <strong>Award Points (AP)</strong> are awarded for outstanding gameplay, strategic competence, and immersive roleplaying.
      </p>

      {/* The Increment Rule */}
      <div className="bg-amber-950/40 border border-amber-500/50 rounded-lg p-3 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
          <span>⚠️</span> The Increment Rule (CRITICAL)
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Award Points are spent in the exact same manner as Build Points in character creation, on a 1-for-1 basis, except that <strong className="text-amber-200">abilities, skills, or other traits may ONLY HAVE A 1 POINT INCREMENT OF ANY SCORE PER EXPERIENCE AWARD</strong>. A player cannot dump 10 AP into a single skill instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Story Awards */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
          <div>
            <div className="font-bold text-cyan-300 font-mono text-xs uppercase flex items-center gap-1.5">
              <span>📖</span> Story Awards
            </div>
            <p className="text-slate-400 text-[10.5px] mt-1 leading-relaxed">
              Awarded upon concluding story milestones, chapters, and during downtime reflection.
            </p>
          </div>
          <div className="space-y-1 text-[11px] border-t border-slate-800/80 pt-1.5">
            <div className="flex justify-between"><span className="text-slate-300">Chapter Completion</span> <strong className="text-cyan-300 font-mono">5 to 10 AP</strong></div>
            <div className="flex justify-between"><span className="text-slate-300">Overcoming Villain/Plot</span> <strong className="text-cyan-300 font-mono">1, 2, or 3 AP</strong></div>
          </div>
        </div>

        {/* Session Awards */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
          <div>
            <div className="font-bold text-emerald-300 font-mono text-xs uppercase flex items-center gap-1.5">
              <span>🎲</span> Session Awards
            </div>
            <p className="text-slate-400 text-[10.5px] mt-1 leading-relaxed">
              Evaluated post-session regardless of narrative milestone completion.
            </p>
          </div>
          <div className="space-y-1 text-[11px] border-t border-slate-800/80 pt-1.5">
            <div className="flex justify-between"><span className="text-slate-300">Proper Game / Mechanics</span> <strong className="text-emerald-300 font-mono">0, 1, or 2 AP</strong></div>
            <div className="flex justify-between"><span className="text-slate-300">Roleplaying in Character</span> <strong className="text-emerald-300 font-mono">0, 1, or 2 AP</strong></div>
          </div>
        </div>

        {/* Epic Awards */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
          <div>
            <div className="font-bold text-purple-300 font-mono text-xs uppercase flex items-center gap-1.5">
              <span>⚡</span> Epic &amp; Ad Hoc
            </div>
            <p className="text-slate-400 text-[10.5px] mt-1 leading-relaxed">
              Granted immediately for turns of the tide, brilliant ideas, and stumping the Architect.
            </p>
          </div>
          <div className="space-y-1 text-[11px] border-t border-slate-800/80 pt-1.5">
            <div className="flex justify-between"><span className="text-slate-300">Stumping the Architect</span> <strong className="text-purple-300 font-mono">1 to 5 AP</strong></div>
            <div className="flex justify-between"><span className="text-slate-300">Revivification Trauma</span> <strong className="text-rose-400 font-mono">-5 AP Debt</strong></div>
          </div>
        </div>
      </div>
    </div>

    {/* Section 5: Vitality, Health, Toughness & Damage Resolution */}
    <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-rose-400 font-bold uppercase font-mono tracking-wider text-xs flex items-center gap-2">
          <span>❤️</span> Vitality, Health, Toughness &amp; Damage Resolution
        </h4>
        <span className="text-[10px] font-mono text-cyan-300 font-semibold">
          Vitality: 30 + Will • Health: 30 + Fortitude
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="font-bold text-amber-300 font-mono uppercase text-xs">
            🛡️ Vitality vs. Physical Health
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            <strong className="text-cyan-300">Vitality</strong> represents stamina, reflex avoidance, minor bruising, and luck. It is depleted first. <strong className="text-rose-400">Health</strong> represents deep physical tissue, structural integrity, and organ function. Health is damaged only when Vitality reaches 0, or directly via Critical Hits and Armor-Piercing weapons.
          </p>
          <div className="text-[10.5px] font-mono text-emerald-300 border-t border-slate-800/80 pt-1.5">
            Base Toughness: Stamina Score (direct damage soak from physical hits)
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="font-bold text-cyan-300 font-mono uppercase text-xs">
            💥 Concussive Split &amp; Armor DR
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Blunt concussive blasts and explosive shocks split incoming damage between the Vitality and Health pools based on impact energy. Armor Damage Reduction (DR) deflects damage prior to pool subtraction based on the hit location struck.
          </p>
          <div className="text-[10.5px] font-mono text-amber-300 border-t border-slate-800/80 pt-1.5">
            Called Shots: Specific limb targeting with situational DR penalties
          </div>
        </div>
      </div>
    </div>

    {/* Section 6: The Death Clock, Massive Damage & Revivification */}
    <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-rose-500 font-bold uppercase font-mono tracking-wider text-xs flex items-center gap-2">
          <span>💀</span> The Death Clock, Massive Damage &amp; Revivification
        </h4>
        <span className="text-[10px] font-mono text-rose-400 font-semibold">
          Clock = Stamina Score in Rounds
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="font-bold text-rose-400 font-mono text-xs uppercase">
            ⏳ The Death Clock
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            When Health hits 0, the character collapses unconscious and initiates the Death Clock, equal to their Stamina score in rounds (minimum 1 round). Each un-stabilized round ticks the clock down by 1. At 0, permanent clinical death occurs.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="font-bold text-amber-400 font-mono text-xs uppercase">
            ⚡ Massive Damage &amp; Stabs
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Taking damage in a single hit equal to or exceeding your Stamina score directly to Health triggers an immediate DC 15 Fortitude check. Failure causes instant death or instantaneous coma. A successful DC 15 Medicine check stops the Death Clock.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="font-bold text-purple-400 font-mono text-xs uppercase">
            🌌 The High Cost of Dying
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Revivification via TL5 medical resurrection or rare metaphysics incurs devastating existential trauma: the character loses ALL remaining Karma Points and suffers a <strong className="text-rose-400 font-mono">-5 AP Experience Debt</strong> paid 1-for-1 before new advancements.
          </p>
        </div>
      </div>
    </div>

    {/* Section 7: Rest & Recovery Engine & Movement Fatigue */}
    <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-blue-400 font-bold uppercase font-mono tracking-wider text-xs flex items-center gap-2">
          <span>🌙</span> Rest Cycles, Recovery &amp; Movement Fatigue
        </h4>
        <span className="text-[10px] font-mono text-cyan-400 font-semibold">
          Full Rest: 6-8h • Light Rest: up to 4×/day
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="font-bold text-blue-300 font-mono uppercase text-xs">
            🛌 Full Rest vs. Light Rest Tiers
          </div>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div><strong>Full Rest (6-8 Hours):</strong> Completely removes exhaustion and restores full vitality. Synthetics, Fae, and Insects need only a brief Light Rest; Alterians/Mondi meditate.</div>
            <div><strong>Nap / Meditation (1 Hour):</strong> Optimal Light Rest resetting single-encounter features.</div>
            <div><strong>Lounging (2 Hours) / Light Duty (3 Hours):</strong> Passive guard/reading. Strenuous action worsens rest tier.</div>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="font-bold text-amber-300 font-mono uppercase text-xs">
            🏃 Movement Fatigue Triggers
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Sprinting for <strong>5 consecutive combat rounds</strong> or maintaining hurried forced march for <strong>10 minutes</strong> triggers a mandatory <strong>DC 15 Stamina Fortitude Check</strong>.
          </p>
          <div className="text-[10.5px] text-slate-400 border-t border-slate-800/80 pt-1.5">
            Failure: Suffer 5 points of non-lethal Vitality damage. If Vitality is 0, take 2 Health damage and become <strong className="text-amber-300">Exhausted</strong> (-2 to active checks, half movement speed) until receiving a Light Rest.
          </div>
        </div>
      </div>
    </div>

    {/* Section 8: Movement Rules, Locomotion Modes & Tactical Paces */}
    <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-emerald-400 font-bold uppercase font-mono tracking-wider text-xs flex items-center gap-2">
          <span>👟</span> Movement Rules, Locomotion Modes &amp; Tactical Paces
        </h4>
        <span className="text-[10px] font-mono text-emerald-300 font-semibold">
          Base: 30 ft (6 hexes/squares)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-cyan-300 font-mono">Walk (1× Base)</div>
          <p className="text-slate-400 text-[10.5px]">Standard movement; perform normal combat actions with zero tactical penalty.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-emerald-300 font-mono">Hustle (2× Base)</div>
          <p className="text-slate-400 text-[10.5px]">Double-time movement; consumes standard action during the tactical round.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-amber-300 font-mono">Run (3× Base)</div>
          <p className="text-slate-400 text-[10.5px]">High-speed advance; imposes -2 penalty to passive perception checks.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-rose-400 font-mono">Sprint (4× Base)</div>
          <p className="text-slate-400 text-[10.5px]">Straight-line surge; imposes -4 to defense and triggers fatigue checks after 5 rounds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-sky-300 font-mono uppercase text-xs">🦅 Aerial Flight &amp; Ramming</div>
          <p className="text-slate-400 text-[10.5px]">
            Hovering requires DC 15 Acrobatics. Soaring grants <strong className="text-cyan-300">High Ground (+2 Strike/+2 Crit)</strong>. Aerial rams deal +1d damage per flight stage and +1 impact per 10ft of speed to both flyer and target.
          </p>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-teal-300 font-mono uppercase text-xs">🧗 Climbing &amp; Descents</div>
          <p className="text-slate-400 text-[10.5px]">
            Base climbing is 1/2 speed. Scaling (2×, DC 15), Fast Ascent (3×, DC 18), and Fast Descent (6×, DC 20 Athletics) permit rapid vertical maneuvers across sheer cliff faces.
          </p>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-purple-300 font-mono uppercase text-xs">🚀 Zero-G &amp; Locomotion Modes</div>
          <p className="text-slate-400 text-[10.5px]">
            Zero-G requires reaction thrusters or mag-boots. Quadruped, Slithering, Swimming, Hexapedal, and Treads locomotion modes provide specialized terrain bonuses.
          </p>
        </div>
      </div>
    </div>

    {/* Section 9: Unified Scaling Multipliers (Personal to Planetary) */}
    <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-amber-400 font-bold uppercase font-mono tracking-wider text-xs flex items-center gap-2">
          <span>📐</span> Unified Scaling Multipliers (Personal to Planetary)
        </h4>
        <span className="text-[10px] font-mono text-amber-300 font-semibold">
          8 Distinct Scale Tiers
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10.5px]">
              <th className="pb-2">Tier</th>
              <th className="pb-2">Multiplier</th>
              <th className="pb-2">Typical Archetypes</th>
              <th className="pb-2">Damage / DR Scale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
            <tr>
              <td className="py-1.5 font-bold text-white">Personal</td>
              <td className="py-1.5 text-cyan-300">1×</td>
              <td>Humanoids, biological species, infantry rifles</td>
              <td>1× Kinetic / 1× DR</td>
            </tr>
            <tr>
              <td className="py-1.5 font-bold text-white">Heavy Exo</td>
              <td className="py-1.5 text-cyan-300">2×</td>
              <td>Powered exoskeleton rigs, crew-served autocannons</td>
              <td>2× Kinetic / 2× DR</td>
            </tr>
            <tr>
              <td className="py-1.5 font-bold text-white">Light Vehicle</td>
              <td className="py-1.5 text-emerald-300">5×</td>
              <td>Hoverbikes, light buggies, scout walkers</td>
              <td>5× Kinetic / 5× DR</td>
            </tr>
            <tr>
              <td className="py-1.5 font-bold text-white">Medium Mecha</td>
              <td className="py-1.5 text-emerald-300">10×</td>
              <td>Combat walkers, armored personnel carriers</td>
              <td>10× Kinetic / 10× DR</td>
            </tr>
            <tr>
              <td className="py-1.5 font-bold text-white">Heavy MBT</td>
              <td className="py-1.5 text-amber-300">20×</td>
              <td>Main battle tanks, heavy siege platforms</td>
              <td>20× Kinetic / 20× DR</td>
            </tr>
            <tr>
              <td className="py-1.5 font-bold text-white">Super Heavy</td>
              <td className="py-1.5 text-amber-300">50×</td>
              <td>Titan combat chassis, super-heavy assault mecha</td>
              <td>50× Kinetic / 50× DR</td>
            </tr>
            <tr>
              <td className="py-1.5 font-bold text-white">Capital Ship</td>
              <td className="py-1.5 text-purple-300">100×</td>
              <td>Starship corvettes, frigates, orbital stations</td>
              <td>100× Kinetic / 100× DR</td>
            </tr>
            <tr>
              <td className="py-1.5 font-bold text-white">Planetary</td>
              <td className="py-1.5 text-rose-400">1000×</td>
              <td>Orbital bombardment arrays, world-cracker lasers</td>
              <td>1000× Kinetic / 1000× DR</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default ComprehensiveUserGuideModal;
