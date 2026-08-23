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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#0b0f17] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(34,211,238,0.2)] w-full max-w-7xl h-[92vh] flex flex-col font-sans overflow-hidden text-slate-200"
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
          <Maximize2 size={15} /> Center View Dynamic Drawers
        </h4>
        <p className="text-xs text-slate-300">
          Clicking any module launcher card unfolds interactive preview drawers (Persona Folio roster cards, Story scenarios tree, Element Forge lore elements, Tactical map selector, AIME manuscript cards) right on the home canvas without route transitions.
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
        💎 Character Point (CP) Economy Rules & Validation
      </h4>
      <ul className="list-disc pl-5 text-xs space-y-1 text-slate-300">
        <li><strong>Starting Budget:</strong> Default <strong className="text-cyan-300 font-mono">150 CP</strong>. GMs can adjust the budget limit in campaign settings.</li>
        <li><strong>Legality Enforcement:</strong> When total expenditures exceed budget, the header displays a pulsating red <strong className="text-red-400 font-mono">ILLEGAL BUILD</strong> badge. Clicking the CP bar opens the complete line-item breakdown.</li>
        <li><strong>CP Allocations:</strong> Core stats, skill ranks, specializations, positive features, and augmentations cost CP. Flaws and hindrances grant CP rebates.</li>
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
            The 6 primary attributes (STR, AGI, STA, INT, WIS, CHA) and sub-attributes (Might, Reflex, Fortitude, Logic, Will, Etiquette). Automatically computes <strong className="text-white">Health (30 + Fortitude)</strong>, <strong className="text-white">Vitality (30 + Will)</strong>, Karma pool, Defense value, and STR-based carry capacity.
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
        🚀 Guided Character Creator & Roster Management
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="font-bold text-white mb-1">🧙 Guided Creator Wizard</div>
          <p className="text-slate-400 text-[11px]">An 8-step walkthrough taking players from concept, species lineage, origin, occupation, attributes, and starting gear to a fully validated character sheet.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="font-bold text-white mb-1">📇 Roster & Cloud Sync</div>
          <p className="text-slate-400 text-[11px]">Store unlimited characters in your authenticated Google Cloud account, clone/duplicate operatives, generate public read-only share links, or export standalone JSON files.</p>
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
        The <strong className="text-white">Omnicortex (`/dbm`)</strong> is the central relational rules codex and compendium of Tangent SFF RP. It indexes all canon items, biological lineages, occupational backgrounds, combat arms, powers, and modifier tables with live search, relational selectors, and JSON portability.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
      {[
        { cat: 'Rules Codex', icon: '📜', desc: 'Core mechanics, combat systems & resolution rules.' },
        { cat: 'Species Matrix', icon: '🧬', desc: 'Biological species profiles, multi-trait selection & stat mods.' },
        { cat: 'Factions & Cartels', icon: '⚔️', desc: 'Corporate empires, syndicates & political groups.' },
        { cat: 'Occupations & Origins', icon: '💼', desc: 'Career backgrounds, starting proficiencies & bonuses.' },
        { cat: 'Skills Compendium', icon: '🎯', desc: 'Proficiency ranks, attribute links & specializations.' },
        { cat: 'Features & Hindrances', icon: '⚡', desc: 'Positive talents, species gifts & flaw point rebates.' },
        { cat: 'Weaponry Matrix', icon: '🔫', desc: 'Melee, ballistic, laser & plasma combat arms.' },
        { cat: 'Armor & Defenses', icon: '🛡️', desc: 'Protective weave, powered suits, coverage & shields.' },
        { cat: 'Mecha & Frames', icon: '🤖', desc: 'Heavy exoskeleton chassis, hardpoints & vehicle systems.' },
        { cat: 'Powers & Psionics', icon: '✨', desc: 'Meta-tech imbuements, psychic talents & invocations.' },
        { cat: 'Prerequisites', icon: '🔑', desc: 'Requirement ladders for high-tier abilities.' },
        { cat: 'Modifiers & Buffs', icon: '📊', desc: 'Global stat modifiers, conditions & mechanical buffs.' },
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
          💾 Master JSON Backup & Cloud Synchronization
        </h4>
        <p className="text-slate-300 text-[11px]">
          Export the entire Omnicortex database to a single standalone <code className="text-cyan-300 font-mono">.json</code> file with 450-op chunked batch import to prevent quota throttling. Includes automatic local caching for instant search response.
        </p>
      </div>
    </div>
  </div>
);

/* =========================================================================
   4. CODEX MATRIX SUITE & ECONOMATRIX GUIDE
   ========================================================================= */
const CodexGuideSection = () => (
  <div className="space-y-6">
    <div className="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
      <h3 className="text-base font-bold text-amber-300 uppercase tracking-wide font-mono flex items-center gap-2">
        <Sparkles size={18} />
        4. Codex Matrix Suite, Economatrix & Technology Codex
      </h3>
      <p>
        The <strong className="text-white">Codex (`/codex`)</strong> contains 14 specialized engineering matrices and economic models designed to compute exact balance, credit costs, crafting times, Unified Difficulty Units (UDU), and Tech Level formulas for custom sci-fi content.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
      {[
        { name: 'Architecture Blueprint', icon: '🏛️', desc: 'Facility scales, room modules, defensive hardpoints & energy budgets.' },
        { name: 'Armor Coverage Matrix', icon: '🛡️', desc: 'Coverage zones (Head, Torso, Limbs), material hardness & resistance.' },
        { name: 'Augmentation Nodes', icon: '🦾', desc: 'Cybernetic implants, biological grafts & essence/karma footprint.' },
        { name: 'Companion Package', icon: '🐾', desc: 'Drones, synthetic pets, combat beasts & loyalist AI modules.' },
        { name: 'Invocation Matrix', icon: '🔮', desc: 'Psionic spell parameters, area effects, channeling costs & limits.' },
        { name: 'Mecha Chassis Builder', icon: '🤖', desc: 'Frame weight classes, propulsion modules, armor plates & mount bays.' },
        { name: 'Meta-Tech Imbuement', icon: '✨', desc: 'Artifact crafting, metamaterial bonding & supernatural enhancements.' },
        { name: 'Modular Stat Blocks', icon: '📐', desc: 'Automated NPC and monster generator with scalable difficulty tiers.' },
        { name: 'Planetary Design Matrix', icon: '🪐', desc: 'Planetary biomes, atmospheric pressure, gravity & settlement tiers.' },
        { name: 'Species Trait Selector', icon: '🧬', desc: 'Custom lineage builder with balanced biological point accounting.' },
        { name: 'UDU Capacity Meter', icon: '📏', desc: 'Unified Difficulty Units meter measuring scenario hazard scaling.' },
        { name: 'Weapon Mod Stacker', icon: '🔫', desc: 'Optics, muzzle devices, receivers, elemental coils & balance points.' },
      ].map(m => (
        <div key={m.name} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
          <div className="font-bold text-amber-300 font-mono flex items-center gap-1.5 mb-1">
            <span>{m.icon}</span> {m.name}
          </div>
          <p className="text-slate-400 text-[11px]">{m.desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
      <h4 className="text-cyan-400 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
        📈 Economatrix Dashboard & Technology Codex (TL0–TL9)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-amber-300 font-bold font-mono uppercase">Universal Economic Theory (EUT)</div>
          <p className="text-slate-300 text-[11px]">
            Simulates Galactic Standard Credits (Cr), planetary market indices, supply-demand scarcity multipliers, black market markups, and barter exchange equations.
          </p>
        </div>
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-cyan-300 font-bold font-mono uppercase">Technology Codex & Ingestion</div>
          <p className="text-slate-300 text-[11px]">
            Defines Technology Levels from TL0 (Primitive) to TL9 (Singularity / Trans-Dimensional) with research trees, power consumption, and direct Markdown rulebook ingestion.
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
        The <strong className="text-white">Tactical Map Maker (`/foundry/map-maker`)</strong> is a canvas powered by React Konva for spatial battlemaps, regional overland maps, token summoning, fog-of-war, initiative tracking, and real-time player spectator broadcasting.
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
        <div className="font-bold text-amber-300 font-mono uppercase">👥 Folio Token Summoning</div>
        <p className="text-slate-400 text-[11px]">Drag hero tokens directly from your Persona Folio roster onto the map. Tokens maintain live Health and Vitality bars.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-purple-300 font-mono uppercase">⚔️ Initiative Combat Tracker</div>
        <p className="text-slate-400 text-[11px]">Track round count, turn order, initiative rolls, status gems, and floating animated combat damage numbers.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-blue-300 font-mono uppercase">🌫️ Dynamic Fog of War</div>
        <p className="text-slate-400 text-[11px]">Reveal or shroud map sectors in real time to conceal enemy ambushes and uncharted dungeon corridors from players.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
        <div className="font-bold text-pink-300 font-mono uppercase">📺 Player Spectator View</div>
        <p className="text-slate-400 text-[11px]">Open or project <code className="text-cyan-300 font-mono">/spectator/:mapId</code> on a secondary monitor or player stream for clean, GM-hidden gameplay.</p>
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
        10. Tangent Core 2d10 Resolution Engine & Combat Reference
      </h3>
      <p>
        Tangent Science Fantasy uses a probability-curve <strong className="text-cyan-300 font-mono">2d10 + Attribute + Skill Rank vs Target Number (TN)</strong> mechanic.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
        <h4 className="text-teal-300 font-bold uppercase font-mono tracking-wider">
          🎲 Core Formula & Target Numbers (TN)
        </h4>
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-cyan-300 text-center font-bold text-sm">
          Roll = 2d10 + Stat Modifier + Skill Modifier
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
          ⚡ Critical Success & Critical Fumbles (Numeric Value Adjustments)
        </h4>
        <p className="text-slate-300 text-[11px]">
          <strong>Critical Success (Double 10s on 2d10):</strong> The rolled value is treated as <strong className="text-amber-300 font-mono">30</strong> (<code className="text-cyan-300 font-mono">Total = 30 + Modifiers</code>), guaranteeing an extraordinary triumph and maximum margin of success.
        </p>
        <p className="text-slate-300 text-[11px]">
          <strong>Critical Fumble (Double 1s on 2d10):</strong> The rolled value is treated as <strong className="text-red-400 font-mono">-10</strong> (<code className="text-red-300 font-mono">Total = -10 + Modifiers</code>), resulting in catastrophic failure, weapon malfunctions, or severe tactical complications.
        </p>
      </div>
    </div>
  </div>
);

export default ComprehensiveUserGuideModal;
