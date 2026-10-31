import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Terminal, 
  Radio, 
  Database, 
  Layers, 
  BookOpen,
  Search
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useFolio } from '../../context/FolioContext';
import { useDBM, loadCompendiumCatalog } from '../../context/DBMContext';
import { useStory } from '../../context/CampaignContext';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';

/**
 * @file WelcomeBriefing.jsx
 * @description Compact, tactical briefing bar top-centered on the landing page.
 * The 5 cards act as visual launch tabs, each on a separate row, centered at a default 2/3 width of viewing area.
 */
export const WelcomeBriefing = ({ onDismiss, isMobile = false }) => {
  const navigate = useNavigate();

  // Telemetry for live metrics in card badges
  const { personaRoster = [], roster = [] } = useFolio() || {};
  const dbContext = useDBM() || {};
  const dbData = dbContext.dbData || {};
  const { universeState, mapsCatalog } = useStory() || {};
  const { groups = [], pendingInvites = [] } = useGroup() || {};
  const { totalUnreadCount = 0 } = useChat() || {};

  const heroCount = Array.isArray(personaRoster) && personaRoster.length > 0 
    ? personaRoster.length 
    : (Array.isArray(roster) ? roster.length : 0);
  const dbmTotalItems = Object.keys(dbData).reduce((sum, key) => {
    return sum + (Array.isArray(dbData[key]) ? dbData[key].length : 0);
  }, 0);
  const scenarioCount = universeState?.scenarios?.length || 0;
  const mapsCount = mapsCatalog?.length || universeState?.maps?.length || 0;
  const teamCount = groups?.length || 0;
  const compendiumArticles = dbData?.compendium || [];
  const compendiumCount = Array.isArray(compendiumArticles) ? compendiumArticles.length : 0;

  const handleDeploy = (route, action) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (typeof action === 'function') {
      action();
      onDismiss?.();
      return;
    }
    if (route) {
      onDismiss?.();
      navigate(route);
    }
  };

  const handleOpenCommandPalette = (e) => {
    e?.stopPropagation?.();
    AudioService.playTerminalBeep(1200, 0.02);
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  const primarySections = [
    {
      id: 'folio',
      railIndex: '01',
      title: 'FOLIO',
      subtitle: 'Persona Dossiers & Character Engine',
      badge: heroCount > 0 ? `${heroCount} ${heroCount === 1 ? 'PERSONA' : 'PERSONAS'}` : 'PERSONA ENGINE',
      desc: '150 CP character builder, 95+ skills matrix, augmentations, and live dual 2d10 sheet resolution.',
      primaryRoute: '/folio?tab=catalog',
      icon: Users,
      colorTheme: 'cyan',
      borderColor: 'border-cyan-500/35 hover:border-cyan-400 focus-within:border-cyan-400',
      barColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
      dotColor: 'bg-cyan-400',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
      btnColor: 'bg-cyan-600 hover:bg-cyan-500 text-white',
      iconColor: 'text-cyan-400',
      titleColor: 'text-cyan-300 group-hover:text-cyan-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(34,211,238,0.22)]',
      pillClass: 'border-cyan-500/45 hover:border-cyan-400 bg-slate-950/90 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-200 focus-visible:outline-cyan-400',
      chevronColor: 'text-cyan-400 group-hover/pill:text-cyan-300',
      subSections: [
        { label: 'Roster', route: '/folio?tab=catalog' },
        { label: '150 CP Builder', route: '/folio?tab=identity' },
        { label: '95+ Skills', route: '/folio?tab=skills' },
        { label: 'Dual 2d10', route: '/folio?tab=stats' },
        { label: 'Cyberware', route: '/folio?tab=gear' }
      ]
    },
    {
      id: 'rules',
      railIndex: '02',
      title: 'RULES',
      subtitle: 'BASTION Compendium, Mechanics & Arbiter',
      badge: compendiumCount > 0 ? `${compendiumCount} ARTICLES` : 'RULES COMPENDIUM',
      desc: 'Canonical BASTION dual 2d10 mechanics, action economy, conditions, tactical combat & AI Arbiter.',
      primaryRoute: '/compendium',
      icon: BookOpen,
      colorTheme: 'sky',
      borderColor: 'border-sky-500/35 hover:border-sky-400 focus-within:border-sky-400',
      barColor: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
      dotColor: 'bg-sky-400',
      badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-500/50',
      btnColor: 'bg-sky-600 hover:bg-sky-500 text-white',
      iconColor: 'text-sky-400',
      titleColor: 'text-sky-300 group-hover:text-sky-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(56,189,248,0.22)]',
      pillClass: 'border-sky-500/45 hover:border-sky-400 bg-slate-950/90 hover:bg-sky-950/60 text-slate-200 hover:text-sky-200 focus-visible:outline-sky-400',
      chevronColor: 'text-sky-400 group-hover/pill:text-sky-300',
      onMouseEnter: () => loadCompendiumCatalog(),
      subSections: [
        { label: 'Core Rules', route: '/compendium?tab=rules' },
        { label: 'Combat & DCs', route: '/compendium?tab=rules' },
        { label: 'Conditions', route: '/compendium?tab=rules' },
        { label: 'Omnicortex', route: '/codex' },
        { label: 'Bastion AI', route: '/compendium?tab=rules' }
      ]
    },
    {
      id: 'network',
      railIndex: '03',
      title: 'NETWORK',
      subtitle: 'Tactical Squads, CommLink & Operator Relay',
      badge: totalUnreadCount > 0 
        ? `${totalUnreadCount} UNREAD` 
        : (teamCount > 0 ? `${teamCount} SQUADS` : 'SQUAD & COMMS NET'),
      desc: 'Assemble fireteams with QR invites, chat over encrypted subspace channels, and stream voice net.',
      primaryRoute: '/network',
      icon: Radio,
      colorTheme: 'emerald',
      borderColor: 'border-emerald-500/35 hover:border-emerald-400 focus-within:border-emerald-400',
      barColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
      dotColor: 'bg-emerald-400',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-300 group-hover:text-emerald-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(16,185,129,0.22)]',
      pillClass: 'border-emerald-500/45 hover:border-emerald-400 bg-slate-950/90 hover:bg-emerald-950/60 text-slate-200 hover:text-emerald-200 focus-visible:outline-emerald-400',
      chevronColor: 'text-emerald-400 group-hover/pill:text-emerald-300',
      subSections: [
        { label: 'Tactical Squads', route: '/network?view=teams' },
        { label: 'QR Invites', route: '/network?view=teams' },
        { label: 'CommLink Chat', route: '/network?view=comms' },
        { label: 'Voice Net', route: '/network?view=comms' },
        { label: 'Operators', route: '/network?view=roster' }
      ]
    },
    {
      id: 'ade',
      railIndex: '04',
      title: 'ADE',
      subtitle: 'Consolidated Story, Maps & Stage VTT',
      badge: (scenarioCount + mapsCount) > 0 ? `${scenarioCount + mapsCount} ${(scenarioCount + mapsCount) === 1 ? 'MODULE' : 'MODULES'}` : 'ARCHITECT SUITE',
      desc: 'Author branching narrative scenarios, paint tactical grid maps, and direct live combat on The Stage.',
      primaryRoute: '/foundry',
      icon: Layers,
      colorTheme: 'purple',
      borderColor: 'border-purple-500/35 hover:border-purple-400 focus-within:border-purple-400',
      barColor: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
      dotColor: 'bg-purple-400',
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
      btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
      iconColor: 'text-purple-400',
      titleColor: 'text-purple-300 group-hover:text-purple-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(168,85,247,0.22)]',
      pillClass: 'border-purple-500/45 hover:border-purple-400 bg-slate-950/90 hover:bg-purple-950/60 text-slate-200 hover:text-purple-200 focus-visible:outline-purple-400',
      chevronColor: 'text-purple-400 group-hover/pill:text-purple-300',
      subSections: [
        { label: 'Story Modules', route: '/foundry' },
        { label: 'Elements Codex', route: '/foundry/elements' },
        { label: 'Map Maker', route: '/foundry/map' },
        { label: 'The Stage VTT', route: '/stage' },
        { label: 'AIME Arbiter', route: '/foundry/aime' }
      ]
    },
    {
      id: 'cortex',
      railIndex: '05',
      title: 'CORTEX',
      subtitle: 'Master Database, Catalogs & Galactic Lore',
      badge: dbmTotalItems > 0 ? `${dbmTotalItems} ENTRIES` : 'DATABASE & LORE',
      desc: 'Canonical DBM catalog, 101 playable species, equipment matrix, galactic lore wiki, and homebrew.',
      primaryRoute: '/dbm',
      icon: Database,
      colorTheme: 'amber',
      borderColor: 'border-amber-500/35 hover:border-amber-400 focus-within:border-amber-400',
      barColor: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
      dotColor: 'bg-amber-400',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
      btnColor: 'bg-amber-600 hover:bg-amber-500 text-white',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-300 group-hover:text-amber-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(245,158,11,0.22)]',
      pillClass: 'border-amber-500/45 hover:border-amber-400 bg-slate-950/90 hover:bg-amber-950/60 text-slate-200 hover:text-amber-200 focus-visible:outline-amber-400',
      chevronColor: 'text-amber-400 group-hover/pill:text-amber-300',
      onMouseEnter: () => loadCompendiumCatalog(),
      subSections: [
        { label: '101 Species', route: '/dbm' },
        { label: 'DBM Catalog', route: '/dbm' },
        { label: 'Galactic Lore', route: '/codex' },
        { label: 'Equipment', route: '/dbm' },
        { label: 'Homebrew', route: '/dbm' }
      ]
    }
  ];

  const renderCard = (section) => {
    const Icon = section.icon;
    return (
      <article
        key={section.id}
        onMouseEnter={section.onMouseEnter}
        className={`group relative w-full px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#101520]/95 hover:bg-[#131b29] border ${section.borderColor} transition-all duration-150 flex flex-col gap-1 shadow-sm ${section.glowColor} overflow-hidden`}
      >
        {/* Top Accent Tab Indicator Line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${section.barColor} opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none`} />

        {/* Row 1: Icon, Semantic H2 Stretched-Link Title, Subtitle & Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className={`p-1 rounded-md bg-slate-900/90 ${section.iconColor} border border-slate-700/60 group-hover:scale-105 transition-transform shrink-0`}>
              <Icon size={14} aria-hidden="true" />
            </div>
            <h2 className="m-0 flex items-baseline gap-1.5 min-w-0">
              <button
                type="button"
                onClick={() => handleDeploy(section.primaryRoute, section.action)}
                className="text-left flex items-baseline gap-1.5 min-w-0 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 after:absolute after:inset-0 after:z-0"
                title={`Launch ${section.title} — ${section.subtitle}`}
              >
                <span className={`font-extrabold text-[13px] sm:text-sm font-mono tracking-wider leading-none ${section.titleColor}`}>
                  {section.title}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-medium">
                  /{section.railIndex}
                </span>
                <span className="hidden sm:inline text-slate-400 text-[10px] font-mono" aria-hidden="true">•</span>
                <span className="text-[10px] sm:text-[10.5px] font-mono text-slate-300 uppercase tracking-wider truncate hidden sm:inline font-semibold">
                  {section.subtitle}
                </span>
              </button>
            </h2>
          </div>
          <span className={`relative z-10 pointer-events-none text-[8.5px] sm:text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider shrink-0 whitespace-nowrap ${section.badgeColor}`}>
            {section.badge}
          </span>
        </div>

        {/* Row 2: Full Description (No cutoff, single-line on desktop) */}
        <p className="text-[11px] sm:text-[11.5px] text-slate-200/95 leading-snug font-sans pointer-events-none">
          {section.desc}
        </p>

        {/* Row 3: Interactive Deep-Link Sub-Pills (Sibling buttons elevated above stretched card link) */}
        <div className="relative z-10 flex flex-wrap items-center gap-1.5">
          {section.subSections.map((sub, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleDeploy(sub.route, sub.action)}
              className={`group/pill min-h-[24px] px-2 py-0.5 rounded-md border text-[10px] font-mono font-medium transition-all duration-150 cursor-pointer whitespace-nowrap inline-flex items-center gap-1 hover:-translate-y-[1px] shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${section.pillClass}`}
              title={`Open ${section.title}: ${sub.label}`}
            >
              <span>{sub.label}</span>
              <span className={`text-[11px] leading-none font-bold transition-transform group-hover/pill:translate-x-0.5 ${section.chevronColor}`} aria-hidden="true">
                ›
              </span>
            </button>
          ))}
        </div>
      </article>
    );
  };

  return (
    <section 
      aria-label="Tactical Briefing Operations Hub"
      className="w-full sm:w-[92%] md:w-4/5 lg:w-2/3 max-w-7xl mx-auto p-2 sm:p-3 bg-[#0b1019]/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-[0_0_35px_rgba(0,0,0,0.85),0_0_15px_rgba(34,211,238,0.1)] flex flex-col gap-1.5 sm:gap-2 animate-in fade-in zoom-in-95 duration-200 font-sans text-slate-200 select-none relative overflow-hidden shrink-0"
    >
      {/* Top subtle cyan energy scan line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent pointer-events-none" />

      {/* ── Briefing Header with Global Command / Omni-Search Bar ── */}
      <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/30 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shrink-0">
            <Terminal size={14} aria-hidden="true" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)] shrink-0" aria-hidden="true" />
            <h1 className="m-0 text-xs sm:text-[13px] font-bold font-mono tracking-wider text-cyan-300 uppercase truncate">
              TACTICAL BRIEFING // WELCOME OPERATOR
            </h1>
          </div>
        </div>

        {/* Interactive Global Command / Omni-Search Trigger (Ctrl+K) */}
        <button
          type="button"
          onClick={handleOpenCommandPalette}
          className="min-h-[26px] px-2.5 py-0.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-slate-300 hover:text-cyan-200 font-mono text-[10px] sm:text-[11px] flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-inner focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 group"
          title="Open Global Command Palette & Omni-Search (Ctrl+K)"
          aria-label="Search Cortex entries, rules, personas, or modules (Ctrl+K)"
        >
          <span className="flex items-center gap-1.5 truncate">
            <Search size={12} className="text-cyan-400 group-hover:scale-110 transition-transform shrink-0" aria-hidden="true" />
            <span className="text-cyan-400 font-bold" aria-hidden="true">&gt;_</span>
            <span className="hidden sm:inline truncate">Search Cortex, rules, personas...</span>
            <span className="sm:hidden">Search...</span>
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-cyan-300 font-semibold shrink-0">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* ── 5 Primary Section Cards (1 Card Per Row, Centered, 2/3 Width) ── */}
      <div className="flex flex-col gap-1.5 w-full">
        {primarySections.map(renderCard)}
      </div>
    </section>
  );
};

export default WelcomeBriefing;
