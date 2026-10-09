import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  X, 
  Terminal, 
  Dices, 
  Radio, 
  Database, 
  Layers, 
  ChevronRight, 
  BookOpen
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useFolio } from '../../context/FolioContext';
import { useDBM, loadCompendiumCatalog } from '../../context/DBMContext';
import { useStory } from '../../context/CampaignContext';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { useDice } from '../../context/DiceContext';

/**
 * @file WelcomeBriefing.jsx
 * @description Compact, wide tactical briefing bar top-centered justified on the landing page.
 * The 6 cards directly act as visual launch tabs corresponding to the 6 primary operations sections
 * (FOLIO, NETWORK, CORTEX, ADE, RULES, DICE) in 2 rows of 3 with direct deployment and zero modal popups.
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
  const { openDiceRoller } = useDice() || {};

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
      id: 'network',
      railIndex: '02',
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
    },
    {
      id: 'cortex',
      railIndex: '03',
      title: 'CORTEX',
      subtitle: 'Master Database, Catalogs & Galactic Lore',
      badge: dbmTotalItems > 0 ? `${dbmTotalItems} ENTRIES` : 'DATABASE & LORE',
      desc: 'Canonical DBM catalog, 101 playable species, equipment matrix, galactic lore wiki, and homebrew.',
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
        { label: 'Galactic Lore', route: '/codex' },
        { label: 'Equipment', route: '/dbm' },
        { label: 'Homebrew', route: '/dbm' }
      ]
    },
    {
      id: 'ade',
      railIndex: '04',
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
      id: 'rules',
      railIndex: '05',
      title: 'RULES',
      subtitle: 'BASTION Compendium, Mechanics & Arbiter',
      badge: compendiumCount > 0 ? `${compendiumCount} ARTICLES` : 'RULES COMPENDIUM',
      desc: 'Canonical BASTION dual 2d10 system mechanics, action economy, conditions, tactical combat, and AI Arbiter.',
      primaryRoute: '/compendium',
      icon: BookOpen,
      colorTheme: 'sky',
      borderColor: 'border-sky-500/35 hover:border-sky-400',
      barColor: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
      dotColor: 'bg-sky-400',
      badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-500/50',
      btnColor: 'bg-sky-600 hover:bg-sky-500 text-white',
      iconColor: 'text-sky-400',
      titleColor: 'text-sky-300 group-hover:text-sky-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(56,189,248,0.22)]',
      onMouseEnter: () => loadCompendiumCatalog(),
      subSections: [
        { label: 'Core Rules', route: '/compendium?tab=rules' },
        { label: 'Combat & DCs', route: '/compendium?tab=rules' },
        { label: 'Conditions', route: '/compendium?tab=rules' },
        { label: 'Omnicortex', route: '/compendium?tab=omnicortex' },
        { label: 'Bastion AI', route: '/compendium?tab=rules' }
      ]
    },
    {
      id: 'dice',
      railIndex: '06',
      title: 'DICE',
      subtitle: 'Holographic Tray & Dual 2d10 Engine',
      badge: 'DUAL 2d10 TRAY',
      desc: 'Interactive 2d10 resolution dock with advantage pools, target DC thresholds, crits/fumbles, polyhedrals, and comms broadcast.',
      primaryRoute: null,
      action: () => {
        if (openDiceRoller) {
          openDiceRoller({ label: 'Tactical Action Check', expression: '2d10' });
        } else {
          window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
        }
      },
      icon: Dices,
      colorTheme: 'orange',
      borderColor: 'border-orange-500/35 hover:border-orange-400',
      barColor: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]',
      dotColor: 'bg-orange-400',
      badgeColor: 'bg-orange-950/80 text-orange-300 border-orange-500/50',
      btnColor: 'bg-orange-600 hover:bg-orange-500 text-white',
      iconColor: 'text-orange-400',
      titleColor: 'text-orange-300 group-hover:text-orange-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(251,146,60,0.22)]',
      subSections: [
        {
          label: 'Dual 2d10',
          action: () => {
            if (openDiceRoller) {
              openDiceRoller({ label: 'Dual 2d10 Check', expression: '2d10' });
            } else {
              window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
            }
          }
        },
        {
          label: 'Advantage',
          action: () => {
            if (openDiceRoller) {
              openDiceRoller({ label: 'Advantage Check', expression: '2d10', advantageDice: 1 });
            } else {
              window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
            }
          }
        },
        {
          label: 'Target DCs',
          action: () => {
            if (openDiceRoller) {
              openDiceRoller({ label: 'Standard DC 12 Check', expression: '2d10', targetDC: '12' });
            } else {
              window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
            }
          }
        },
        {
          label: 'Polyhedrals',
          action: () => {
            if (openDiceRoller) {
              openDiceRoller({ label: 'Polyhedral D20', expression: '1d20' });
            } else {
              window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
            }
          }
        },
        {
          label: 'Dice Tray',
          action: () => {
            if (openDiceRoller) {
              openDiceRoller();
            } else {
              window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
            }
          }
        }
      ]
    }
  ];

  return (
    <div 
      className="w-full max-w-6xl xl:max-w-7xl mx-auto p-3 sm:p-3.5 bg-[#0b1019]/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-[0_0_35px_rgba(0,0,0,0.85),0_0_15px_rgba(34,211,238,0.1)] flex flex-col gap-2.5 sm:gap-3 animate-in fade-in zoom-in-95 duration-200 font-sans text-slate-200 select-none relative overflow-hidden shrink-0"
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

      {/* ── 6 Primary Section Cards Grid (2 rows of 3: FOLIO, NETWORK, CORTEX, ADE, RULES, DICE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {primarySections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              onClick={() => handleDeploy(section.primaryRoute, section.action)}
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
                        handleDeploy(sub.route, sub.action);
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
    </div>
  );
};

export default WelcomeBriefing;
