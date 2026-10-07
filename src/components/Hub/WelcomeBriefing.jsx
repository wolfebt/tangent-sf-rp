import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  X, 
  Terminal, 
  Dices, 
  Radio, 
  Command, 
  Database, 
  Layers, 
  ChevronRight, 
  HelpCircle 
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useFolio } from '../../context/FolioContext';
import { useDBM, loadCompendiumCatalog } from '../../context/DBMContext';
import { useStory } from '../../context/CampaignContext';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';

/**
 * @file WelcomeBriefing.jsx
 * @description Compact, wide tactical briefing bar top-centered justified on the landing page.
 * The 4 cards directly act as visual launch tabs corresponding to the 4 guidance rail sections
 * (FOLIO, CORTEX, ADE, NETWORK) with direct deployment and zero modal popups.
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

  const handleDeploy = (route) => {
    AudioService.playTerminalBeep(1150, 0.02);
    onDismiss?.();
    navigate(route);
  };

  const handleDismiss = (e) => {
    e?.stopPropagation?.();
    AudioService.playTerminalBeep(900, 0.02);
    onDismiss?.();
  };

  const primarySections = [
    {
      id: 'folio',
      railIndex: '01',
      title: 'FOLIO',
      subtitle: 'Operative Dossiers & Character Engine',
      badge: heroCount > 0 ? `${heroCount} OPERATIVES` : 'OPERATIVE ENGINE',
      desc: '150 CP character builder, 95+ skills matrix, augmentations, and live dual 2d10 sheet resolution.',
      primaryRoute: '/folio',
      icon: Users,
      colorTheme: 'cyan',
      borderColor: 'border-cyan-500/35 hover:border-cyan-400',
      barColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
      dotColor: 'bg-cyan-400',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
      btnColor: 'bg-cyan-600 hover:bg-cyan-500 text-white',
      iconColor: 'text-cyan-400',
      titleColor: 'text-cyan-300 group-hover:text-cyan-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(34,211,238,0.22)]',
      subSections: [
        { label: 'Roster', route: '/folio' },
        { label: '150 CP Builder', route: '/folio' },
        { label: '95+ Skills', route: '/folio' },
        { label: 'Dual 2d10', route: '/folio' },
        { label: 'Cyberware', route: '/folio' }
      ]
    },
    {
      id: 'cortex',
      railIndex: '02',
      title: 'CORTEX',
      subtitle: 'Master Rules, Database & Lore Wiki',
      badge: dbmTotalItems > 0 ? `${dbmTotalItems} ENTRIES` : 'DATABASE & RULES',
      desc: 'Canonical dual 2d10 rules compendium, 101 playable species, equipment catalogs, and galactic lore.',
      primaryRoute: '/dbm',
      icon: Database,
      colorTheme: 'amber',
      borderColor: 'border-amber-500/35 hover:border-amber-400',
      barColor: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
      dotColor: 'bg-amber-400',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
      btnColor: 'bg-amber-600 hover:bg-amber-500 text-white',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-300 group-hover:text-amber-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(245,158,11,0.22)]',
      onMouseEnter: () => loadCompendiumCatalog(),
      subSections: [
        { label: '101 Species', route: '/dbm' },
        { label: 'DBM Catalog', route: '/dbm' },
        { label: 'Rules Wiki', route: '/compendium' },
        { label: 'Galactic Lore', route: '/codex' },
        { label: 'Homebrew', route: '/dbm' }
      ]
    },
    {
      id: 'ade',
      railIndex: '03',
      title: 'ADE',
      subtitle: 'Consolidated Story, Maps & Stage VTT',
      badge: (scenarioCount + mapsCount) > 0 ? `${scenarioCount + mapsCount} MODULES` : 'ARCHITECT SUITE',
      desc: 'Author branching narrative scenarios, paint tactical grid maps, and direct live combat on The Stage.',
      primaryRoute: '/foundry',
      icon: Layers,
      colorTheme: 'purple',
      borderColor: 'border-purple-500/35 hover:border-purple-400',
      barColor: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
      dotColor: 'bg-purple-400',
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
      btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
      iconColor: 'text-purple-400',
      titleColor: 'text-purple-300 group-hover:text-purple-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(168,85,247,0.22)]',
      subSections: [
        { label: 'Story Modules', route: '/foundry' },
        { label: 'Elements Codex', route: '/foundry/elements' },
        { label: 'Map Maker', route: '/foundry/map' },
        { label: 'The Stage VTT', route: '/stage' },
        { label: 'AIME Arbiter', route: '/foundry/aime' }
      ]
    },
    {
      id: 'network',
      railIndex: '04',
      title: 'NETWORK',
      subtitle: 'Tactical Squads, CommLink & Operator Relay',
      badge: totalUnreadCount > 0 
        ? `${totalUnreadCount} UNREAD` 
        : (teamCount > 0 ? `${teamCount} SQUADS` : 'SQUAD & COMMS NET'),
      desc: 'Assemble fireteams with QR invites, chat over encrypted subspace channels, and stream tactical voice.',
      primaryRoute: '/network',
      icon: Radio,
      colorTheme: 'emerald',
      borderColor: 'border-emerald-500/35 hover:border-emerald-400',
      barColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
      dotColor: 'bg-emerald-400',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-300 group-hover:text-emerald-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(16,185,129,0.22)]',
      subSections: [
        { label: 'Tactical Squads', route: '/network?view=teams' },
        { label: 'QR Invites', route: '/network?view=teams' },
        { label: 'CommLink Chat', route: '/network?view=comms' },
        { label: 'Voice Net', route: '/network?view=comms' },
        { label: 'Operators', route: '/network?view=roster' }
      ]
    }
  ];

  return (
    <div 
      className="w-full max-w-6xl xl:max-w-7xl mx-auto p-3 sm:p-3.5 bg-[#0b1019]/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-[0_0_35px_rgba(0,0,0,0.85),0_0_15px_rgba(34,211,238,0.1)] flex flex-col gap-2.5 sm:gap-3 animate-in fade-in zoom-in-95 duration-200 font-sans text-slate-200 select-none relative overflow-hidden"
    >
      {/* Top subtle cyan energy scan line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent pointer-events-none" />

      {/* ── Briefing Header (Compact Single Row) ── */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/30 gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shrink-0">
            <Terminal size={17} />
          </div>
          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              <h2 className="text-xs sm:text-sm font-bold font-mono tracking-wider text-cyan-300 uppercase">
                TACTICAL BRIEFING // WELCOME OPERATIVE
              </h2>
            </div>
            <span className="hidden md:inline text-slate-500 text-xs font-mono">•</span>
            <span className="text-[10.5px] sm:text-[11px] text-slate-400 font-mono truncate">
              Select any tactical card below to deploy directly into that module:
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 sm:p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer shrink-0 ml-1"
          title="Dismiss Briefing (Stays closed until page refresh)"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── 4 Primary Section Cards Grid (Single Row on Desktop: Wide & Compact) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {primarySections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              onClick={() => handleDeploy(section.primaryRoute)}
              onMouseEnter={section.onMouseEnter}
              className={`group relative p-3 sm:p-3.5 rounded-xl bg-[#101520]/90 hover:bg-[#131b29] border ${section.borderColor} transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 shadow-sm ${section.glowColor} overflow-hidden`}
            >
              {/* Top Accent Tab Indicator Line */}
              <div className={`absolute top-0 left-0 right-0 h-[2.5px] ${section.barColor} opacity-75 group-hover:opacity-100 transition-opacity`} />

              <div className="space-y-1.5">
                {/* Card Title & Icon Bar */}
                <div className="flex items-start justify-between gap-1.5 pt-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 rounded-lg bg-slate-900/90 ${section.iconColor} border border-slate-700/60 group-hover:scale-105 transition-transform shrink-0`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm sm:text-[15px] font-mono tracking-wide flex items-center gap-1">
                        <span className={section.titleColor}>{section.title}</span>
                        <span className="text-[9.5px] font-mono text-slate-500 font-normal">/{section.railIndex}</span>
                      </div>
                      <div className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider truncate">
                        {section.subtitle}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider shrink-0 whitespace-nowrap ${section.badgeColor}`}>
                    {section.badge}
                  </span>
                </div>

                {/* Description: Compact 2 lines */}
                <p className="text-[11px] sm:text-[11.5px] text-slate-300/90 leading-snug font-sans line-clamp-2 min-h-[30px]">
                  {section.desc}
                </p>

                {/* Sub-feature Pills: Direct jump shortcuts */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {section.subSections.map((sub, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeploy(sub.route);
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-[9.5px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title={`Jump directly to ${sub.label}`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Footer: Guide Rail Tab Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
                <span className="text-[9.5px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${section.dotColor}`} />
                  <span>GUIDE RAIL TAB</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${section.btnColor} shadow-sm group-hover:translate-x-0.5 transition-transform`}>
                  <span>Deploy</span>
                  <ChevronRight size={11} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Compact Tactical Keys & Footer Bar ── */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-[#080c14] border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400 flex-wrap">
          <span className="text-amber-400 font-bold text-[10.5px] uppercase tracking-wider">Tactical Keys:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[9.5px] flex items-center gap-1">
              <Dices size={10.5} className="text-amber-400" />
              <span>Alt+D Dice</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[9.5px] flex items-center gap-1">
              <Radio size={10.5} className="text-rose-400" />
              <span>Alt+C Comms</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[9.5px] flex items-center gap-1">
              <Command size={10.5} className="text-cyan-400" />
              <span>Ctrl+K Command</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-user-guide'))}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10.5px] font-bold cursor-pointer ml-1"
          >
            <HelpCircle size={11} />
            <span>Full Manual</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            You can reopen this briefing anytime from the Home page.
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white uppercase font-bold text-[9.5px] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Got It, Close</span>
            <X size={11} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBriefing;
