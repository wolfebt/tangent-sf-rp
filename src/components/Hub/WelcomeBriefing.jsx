import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Tv2, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  X, 
  Terminal, 
  Dices, 
  Radio, 
  Command,
  Shield,
  Database,
  Layers,
  Boxes,
  Compass,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

/**
 * 4 Primary Sections and their sub-sections for the Tangent SF RP Tactical Briefing
 */
const PRIMARY_SECTIONS = [
  {
    id: 'folio',
    title: 'FOLIO',
    category: 'PERSONA FOLIO & ROSTER',
    subtitle: 'Operative Dossiers & Character Engine',
    badge: 'Operative Engine',
    desc: 'Forge, manage, and progress operative personas with 150 CP allocation across 6 attributes, 95+ skills, augmentations, and live dual 2d10 sheet resolution.',
    primaryRoute: '/folio',
    icon: Users,
    colorTheme: 'cyan',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    cardBorderColor: 'border-cyan-500/50',
    badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
    btnColor: 'bg-cyan-600 hover:bg-cyan-500 text-white',
    iconColor: 'text-cyan-400',
    glowColor: 'hover:shadow-[0_0_24px_rgba(34,211,238,0.22)]',
    accentBg: 'bg-cyan-500/10',
    subSectionPills: ['Roster Dossiers', '150 CP Builder', '95+ Skills', 'Dual 2d10 Sheet', 'Cyberware & Gear'],
    subSections: [
      {
        id: 'folio-roster',
        title: 'Persona Roster & Dossiers',
        subtitle: 'Operative Management',
        desc: 'Browse active operatives, switch dossiers, duplicate sheets, and archive or export operative files to JSON.',
        route: '/folio',
        icon: Users,
        badge: 'Roster Engine'
      },
      {
        id: 'folio-builder',
        title: '150 CP Character Builder',
        subtitle: 'Point-Buy Core Attributes',
        desc: 'Distribute 150 Character Points across Body, Agility, Tech, Mind, Charisma, and Luck with 101 species trait integration.',
        route: '/folio',
        icon: Shield,
        badge: '150 CP System'
      },
      {
        id: 'folio-skills',
        title: '95+ Skills Matrix & Specializations',
        subtitle: 'Skills & Proficiencies',
        desc: 'Train specialized combat, technical, medical, scientific, and arcane disciplines with tier bonuses and specialization tags.',
        route: '/folio',
        icon: BookOpen,
        badge: '95+ Skills'
      },
      {
        id: 'folio-tactical',
        title: 'Live Tactical Play & Dual 2d10 Checks',
        subtitle: 'Dice Engine & Status Monitors',
        desc: 'Perform instant dual 2d10 attribute and skill checks with automated DR comparison, wound penalties, and condition tracking.',
        route: '/folio',
        icon: Dices,
        badge: 'Dual 2d10 Live'
      },
      {
        id: 'folio-inventory',
        title: 'Augmentations, Metaphysics & Inventory',
        subtitle: 'Cyberware, Weapons & Credits',
        desc: 'Equip kinetic weapons, reactive armors, implant cybernetics, configure metaphysical talents, and track credits economy.',
        route: '/folio',
        icon: Sparkles,
        badge: 'Loadouts & Augments'
      }
    ]
  },
  {
    id: 'cortex',
    title: 'CORTEX',
    category: 'OMNICORTEX & CODEX',
    subtitle: 'Master Rules, Database & Lore Wiki',
    badge: 'Database & Rules',
    desc: 'Central intelligence repository housing the canonical dual 2d10 rules compendium, 101 playable species, equipment catalogs, galactic lore, and custom homebrew.',
    primaryRoute: '/dbm',
    icon: Database,
    colorTheme: 'amber',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    cardBorderColor: 'border-amber-500/50',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    btnColor: 'bg-amber-600 hover:bg-amber-500 text-white',
    iconColor: 'text-amber-400',
    glowColor: 'hover:shadow-[0_0_24px_rgba(251,191,36,0.22)]',
    accentBg: 'bg-amber-500/10',
    subSectionPills: ['101 Species', 'DBM Catalog', 'Dual 2d10 Rules', 'Galactic Lore', 'Homebrew Injector'],
    subSections: [
      {
        id: 'cortex-dbm',
        title: 'Omnicortex Database Manager (DBM)',
        subtitle: '101 Species & Equipment Master',
        desc: 'Search, filter, and inspect comprehensive databases for all 101 species, weapons, armor, vehicles, cybernetics, and bestiary stat blocks.',
        route: '/dbm',
        icon: Database,
        badge: 'Data Manager'
      },
      {
        id: 'cortex-compendium',
        title: 'Canonical Rules Compendium',
        subtitle: 'Dual 2d10 System Mechanics',
        desc: 'Exhaustive rules reference: dual 2d10 dice resolution mechanics, degrees of success, critical outcomes, combat phases, and conditions.',
        route: '/compendium',
        icon: BookOpen,
        badge: 'Dual 2d10 Wiki'
      },
      {
        id: 'cortex-codex',
        title: 'Item & Galactic Lore Codex',
        subtitle: 'Factions, History & Star Systems',
        desc: 'Deep worldbuilding archives detailing interstellar factions, planetary systems, historical logs, tech schematics, and equipment dossiers.',
        route: '/codex',
        icon: Layers,
        badge: 'Lore Archives'
      },
      {
        id: 'cortex-homebrew',
        title: 'Custom Homebrew & Data Injector',
        subtitle: 'Item Creator & Database Injector',
        desc: 'Author custom weapons, cyberware, species, and skills. Inject custom items directly into your local campaign database.',
        route: '/dbm',
        icon: Command,
        badge: 'Creator Tools'
      }
    ]
  },
  {
    id: 'ade',
    title: 'ADE',
    category: 'STORY FOUNDRY & ADE',
    subtitle: 'Consolidated Story, Maps & Stage VTT',
    badge: 'Architect Suite',
    desc: 'Unified gamemaster and creator suite for authoring branching narrative scenarios, painting tactical grid maps, and running live combat encounters on The Stage.',
    primaryRoute: '/foundry',
    icon: Layers,
    colorTheme: 'purple',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    cardBorderColor: 'border-purple-500/50',
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
    btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
    iconColor: 'text-purple-400',
    glowColor: 'hover:shadow-[0_0_24px_rgba(192,132,252,0.22)]',
    accentBg: 'bg-purple-500/10',
    subSectionPills: ['Story Modules', 'Elements Codex', 'Map Maker Studio', 'The Stage VTT', 'AIME AI Arbiter'],
    subSections: [
      {
        id: 'ade-story',
        title: 'Story Foundry & Scenarios',
        subtitle: 'Branching Narrative Architecture',
        desc: 'Construct interactive story modules with branching scene graphs, clue networks, beat timelines, and mission milestones.',
        route: '/foundry',
        icon: Sparkles,
        badge: 'Narrative Graph'
      },
      {
        id: 'ade-elements',
        title: 'Elements Codex & Worldbuilding',
        subtitle: 'NPCs, Locations & Factions',
        desc: 'Catalog campaign assets: key NPCs, hostile commanders, planets, secret bases, artifacts, and classified intel nodes.',
        route: '/foundry/elements',
        icon: Boxes,
        badge: 'Campaign Codex'
      },
      {
        id: 'ade-mapmaker',
        title: 'Map Maker Studio',
        subtitle: '2D Grid & Battlemap Builder',
        desc: 'Create custom tactical battlemaps with procedural tiles, barriers, dynamic lighting, walls, doors, and token placement.',
        route: '/foundry/map',
        icon: Compass,
        badge: 'Grid Studio'
      },
      {
        id: 'ade-stage',
        title: 'The Stage VTT',
        subtitle: '5ft Encounter Battlemap Simulator',
        desc: 'Direct live tactical combat with real-time Line of Sight, dynamic Fog of War, token initiative, turn automation, and dual 2d10 attacks.',
        route: '/stage',
        icon: Tv2,
        badge: 'Live Combat VTT'
      },
      {
        id: 'ade-aime',
        title: 'AIME AI & BASTION Engine',
        subtitle: 'Procedural Co-Pilot & Arbiter',
        desc: 'Leverage AI assistance to generate procedural encounters, NPC dialogue synthesis, tactical balancing, and BASTION rules arbitration.',
        route: '/foundry/aime',
        icon: Terminal,
        badge: 'AI Co-Pilot'
      }
    ]
  },
  {
    id: 'network',
    title: 'NETWORK',
    category: 'TERRAN DATA NETWORK',
    subtitle: 'Tactical Squads, CommLink & Operator Relay',
    badge: 'Squad & Comms Net',
    desc: 'Multi-operative tactical communications backbone: mobilize squads with QR invites, chat over encrypted subspace comms, and stream tactical voice.',
    primaryRoute: '/network',
    icon: Radio,
    colorTheme: 'emerald',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    cardBorderColor: 'border-emerald-500/50',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
    btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    iconColor: 'text-emerald-400',
    glowColor: 'hover:shadow-[0_0_24px_rgba(52,211,153,0.22)]',
    accentBg: 'bg-emerald-500/10',
    subSectionPills: ['Tactical Squads', 'QR Invites', 'CommLink Chat', 'WebRTC Voice Net', 'Operator Directory'],
    subSections: [
      {
        id: 'network-teams',
        title: 'Tactical Squads & Fireteams',
        subtitle: 'Squad Operations & Rosters',
        desc: 'Assemble operative fireteams, generate instant QR invite codes, sync fireteam vitals, share party inventory, and deploy together.',
        route: '/network?view=teams',
        icon: Shield,
        badge: 'Squad Operations'
      },
      {
        id: 'network-comms',
        title: 'Subspace CommLink Relay',
        subtitle: 'Encrypted Text & Combat Feeds',
        desc: 'Broadcast across frequency channels, private squad whispers, synchronized tactical dice rolls, and operational chatter.',
        route: '/network?view=comms',
        icon: MessageSquare,
        badge: 'Encrypted Chat'
      },
      {
        id: 'network-voice',
        title: 'Live WebRTC Voice Net',
        subtitle: 'Subspace Squad Voice Channels',
        desc: 'Connect to encrypted squad voice frequencies with push-to-talk, operator status monitoring, and persistent global audio bar.',
        route: '/network?view=comms',
        icon: Radio,
        badge: 'Voice Channels'
      },
      {
        id: 'network-roster',
        title: 'Operator Directory & Presence',
        subtitle: 'Live Operatives Online',
        desc: 'Inspect active operators online across the Terran Data Net with status beacons, callsigns, handles, and instant invites.',
        route: '/network?view=roster',
        icon: Users,
        badge: 'Live Presence'
      }
    ]
  }
];

export const WelcomeBriefing = ({ onDismiss, isMobile = false }) => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState(null);
  const briefingCardRef = useRef(null);

  // Return to primary 4-cards view on Escape or Backspace key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Escape' || e.key === 'Backspace') && selectedSection) {
        setSelectedSection(null);
      }
    };
    if (selectedSection) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedSection]);

  // Click-out / click-outside handler: clicking anywhere outside the card returns to the briefing
  useEffect(() => {
    if (!selectedSection) return;

    const handleClickOutside = (event) => {
      if (briefingCardRef.current && !briefingCardRef.current.contains(event.target)) {
        AudioService.playTerminalBeep(1000, 0.02);
        setSelectedSection(null);
      }
    };

    // Attach after current event dispatch cycle to avoid immediately closing on the opening click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [selectedSection]);

  const handleCardClick = (section) => {
    AudioService.playTerminalBeep(1150, 0.02);
    setSelectedSection(section);
  };

  const handleNavigate = (route) => {
    AudioService.playTerminalBeep(1200, 0.03);
    onDismiss?.();
    navigate(route);
  };

  const handleDismiss = () => {
    AudioService.playTerminalBeep(900, 0.03);
    onDismiss?.();
  };

  return (
    <div 
      ref={briefingCardRef}
      className={`w-full max-w-5xl mx-auto p-4 sm:p-5 bg-[#0e131d]/95 backdrop-blur-xl border ${selectedSection ? (selectedSection.cardBorderColor || 'border-cyan-500/50') : 'border-cyan-500/40'} rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.85)] flex flex-col gap-3.5 sm:gap-4 animate-in fade-in zoom-in-95 duration-200 font-sans text-slate-200 relative select-none`}
    >
      {/* ── MODE A: PRIMARY 4-SECTIONS VIEW ── */}
      {!selectedSection ? (
        <>
          {/* Main Briefing Header */}
          <div className="flex items-start justify-between pb-3 border-b border-cyan-500/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
                <Terminal size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                  <h2 className="text-sm sm:text-base font-bold font-mono tracking-wider text-cyan-300 uppercase">
                    TACTICAL BRIEFING // WELCOME OPERATIVE
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Tangent SF Engine initialized. Select a primary tactical section below to explore its sub-modules:
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              title="Dismiss Briefing (Stays closed until page refresh)"
            >
              <X size={16} />
            </button>
          </div>

          {/* 4 Primary Section Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {PRIMARY_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  onClick={() => handleCardClick(section)}
                  className={`p-4 sm:p-5 rounded-xl bg-[#121722]/85 border ${section.borderColor} hover:bg-[#151c2a] transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group shadow-sm ${section.glowColor}`}
                >
                  <div className="space-y-2">
                    {/* Card Title & Icon Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg bg-slate-900/90 ${section.iconColor} border border-slate-700/60 group-hover:scale-105 transition-transform shadow-inner`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-cyan-300 transition-colors font-mono tracking-wide">
                            {section.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            {section.subtitle}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${section.badgeColor}`}>
                        {section.badge}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {section.desc}
                    </p>

                    {/* Preview Pills of Sub-Sections */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {section.subSectionPills.map((pill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-300/90 group-hover:border-slate-700 transition-colors"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer / Action Prompt */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 mt-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
                      <span>{section.subSections.length} Sub-Sections Available</span>
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${section.btnColor} shadow-md group-hover:translate-x-0.5 transition-transform`}>
                      <span>Explore Sub-Sections</span>
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Tactical Shortcuts Banner */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#080d16] border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-amber-400 font-bold text-[11px] uppercase tracking-wider">Tactical Keys:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] flex items-center gap-1">
                  <Dices size={11} className="text-amber-400" />
                  <span>Alt+D Dice Dock</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] flex items-center gap-1">
                  <Radio size={11} className="text-rose-400" />
                  <span>Alt+C Comms</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] flex items-center gap-1">
                  <Command size={11} className="text-cyan-400" />
                  <span>Ctrl+K Command</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-user-guide'))}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <HelpCircle size={12} />
              <span>Full Manual</span>
            </button>
          </div>

          {/* Briefing Footer / Dismissal */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
            <span>You can reopen this briefing anytime from the Home page.</span>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white uppercase font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Got It, Close Briefing</span>
              <X size={12} />
            </button>
          </div>
        </>
      ) : (
        /* ── MODE B: EXPANDED SUB-SECTIONS VIEW (Fits View Area, Not Another Window) ── */
        <div className="flex flex-col gap-3.5 sm:gap-4 animate-in fade-in duration-150">
          {/* Sub-Section Active Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1000, 0.02);
                  setSelectedSection(null);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer group"
                title="Return to primary tactical sections (Esc)"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform text-cyan-400" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl bg-slate-900 border border-slate-700/80 ${selectedSection.iconColor} shadow-inner`}>
                  {React.createElement(selectedSection.icon, { size: 18 })}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <h2 className="text-sm sm:text-base font-bold font-mono tracking-wider text-slate-100 uppercase">
                      {selectedSection.title} // {selectedSection.category}
                    </h2>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${selectedSection.badgeColor}`}>
                      {selectedSection.badge}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5">
                    {selectedSection.subtitle}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer shrink-0 ml-2"
              title="Dismiss Briefing (Stays closed until page refresh)"
            >
              <X size={16} />
            </button>
          </div>

          {/* Section Overview Bar */}
          <div className={`p-3 sm:p-3.5 rounded-xl ${selectedSection.accentBg} border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs`}>
            <p className="text-slate-300 leading-relaxed font-sans max-w-2xl text-[12px] sm:text-[13px]">
              {selectedSection.desc}
            </p>
            <button
              type="button"
              onClick={() => handleNavigate(selectedSection.primaryRoute)}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 ${selectedSection.btnColor} shadow cursor-pointer transition-all hover:scale-102`}
            >
              <span>Deploy to {selectedSection.title}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Sub-Sections Grid - Adjusted for best display without truncation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
                Select a Sub-Section to Launch:
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {selectedSection.subSections.length} Available Modules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedSection.subSections.map((sub, idx) => {
                const SubIcon = sub.icon;
                const isFifthItem = selectedSection.subSections.length === 5 && idx === 4;

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleNavigate(sub.route)}
                    className={`p-3.5 sm:p-4 rounded-xl bg-[#121622]/90 border border-slate-800 hover:border-slate-700 hover:bg-[#161d2d] transition-all cursor-pointer flex flex-col justify-between gap-2.5 group shadow-sm hover:shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                      isFifthItem ? 'md:col-span-2' : ''
                    }`}
                  >
                    <div className={`space-y-1.5 ${isFifthItem ? 'md:flex md:items-center md:justify-between md:gap-4 md:space-y-0' : ''}`}>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`p-1.5 rounded-lg bg-slate-900/90 ${selectedSection.iconColor} border border-slate-700/60 shrink-0 group-hover:scale-105 transition-transform`}>
                              <SubIcon size={16} />
                            </div>
                            <span className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                              {sub.title}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-slate-400 uppercase shrink-0 font-bold tracking-wider">
                            {sub.badge}
                          </span>
                        </div>

                        <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans pr-1">
                          {sub.desc}
                        </p>
                      </div>

                      {/* Desktop horizontal right side for 5th item */}
                      {isFifthItem && (
                        <div className="hidden md:flex items-center gap-4 shrink-0 pl-4 border-l border-slate-800/80">
                          <span className="text-[10px] font-mono text-slate-500 uppercase whitespace-nowrap">
                            {sub.subtitle}
                          </span>
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${selectedSection.btnColor} shadow-sm group-hover:translate-x-0.5 transition-transform`}>
                            <span>Deploy</span>
                            <ChevronRight size={11} />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Standard bottom footer for items 1-4 and mobile 5th item */}
                    <div className={`flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1 ${isFifthItem ? 'md:hidden' : ''}`}>
                      <span className="text-[10px] font-mono text-slate-500 uppercase truncate">
                        {sub.subtitle}
                      </span>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${selectedSection.btnColor} shadow-sm group-hover:translate-x-0.5 transition-transform`}>
                        <span>Deploy</span>
                        <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-Section Active Footer Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1000, 0.02);
                setSelectedSection(null);
              }}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold cursor-pointer transition-colors"
            >
              <ChevronLeft size={14} />
              <span>Return to All Sections</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 hidden md:inline">Click outside or press Esc to return</span>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white uppercase font-bold text-[10px] transition-colors cursor-pointer"
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeBriefing;
