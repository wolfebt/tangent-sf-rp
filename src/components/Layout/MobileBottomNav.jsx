import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Users, 
  Database, 
  Layers, 
  Radio,
  BookOpen
} from 'lucide-react';
import { TwoD10Icon } from '../UI/TwoD10Icon';
import { useFolio } from '../../context/FolioContext';
import { useStory } from '../../context/CampaignContext';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { useDice } from '../../context/DiceContext';
import { useDBM, loadCompendiumCatalog } from '../../context/DBMContext';
import { AudioService } from '../../services/audioService';

const NAV_ITEMS = [
  { id: 'hub',     icon: Compass,    label: 'HUB',     path: '/',           color: 'cyan'    },
  { id: 'folio',   icon: Users,      label: 'FOLIO',   path: '/folio',      color: 'cyan'    },
  { id: 'network', icon: Radio,      label: 'NETWORK', path: '/network',    color: 'emerald' },
  { id: 'cortex',  icon: Database,   label: 'CORTEX',  path: '/dbm',        color: 'amber'   },
  { id: 'ade',     icon: Layers,     label: 'ADE',     path: '/foundry',    color: 'purple'  },
  { id: 'rules',   icon: BookOpen,   label: 'RULES',   path: '/compendium', color: 'sky'     },
  { id: 'dice',    icon: TwoD10Icon, label: 'DICE',    isAction: true,      color: 'amber'   },
];

const COLOR_ACTIVE = {
  cyan:    'text-cyan-300 bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]',
  sky:     'text-sky-300 bg-sky-500/15 border-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]',
  amber:   'text-amber-300 bg-amber-500/15 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
  purple:  'text-purple-300 bg-purple-500/15 border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
  emerald: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
};

/**
 * MobileBottomNav
 * Fixed bottom navigation bar visible only on < sm (mobile) screens.
 * Provides primary navigation (Hub, Folio, Network, Cortex, ADE, Rules)
 * and direct action access (Dice Tray) without crowding top-level headers.
 */
export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on spectator / projector routes
  if (
    location.pathname.includes('/spectator') ||
    location.pathname.startsWith('/foundry/view/')
  ) {
    return null;
  }

  // Telemetry contexts for real-time badges & actions
  const { personaRoster = [], roster = [] } = useFolio() || {};
  const { universeState, mapsCatalog } = useStory() || {};
  const { 
    totalUnreadCount = 0, 
    hasNewOperatorLogins = false, 
    newOperatorLogins = [], 
    clearNewOperatorLogins 
  } = useChat() || {};
  const { groups = [], pendingInvites = [] } = useGroup() || {};
  const { isDiceOpen, toggleDiceRoller } = useDice() || {};

  const getActiveId = () => {
    const p = location.pathname;
    if (p === '/' || p === '/dashboard') return 'hub';
    if (p.startsWith('/folio') || p.startsWith('/roster')) return 'folio';
    if (p.startsWith('/compendium') || p.startsWith('/rules')) return 'rules';
    if (p.startsWith('/dbm') || p.startsWith('/codex')) return 'cortex';
    if (p.startsWith('/foundry') || p.startsWith('/ade') || p.startsWith('/campaign-builder') || p.startsWith('/live-studio') || p.startsWith('/ade-stage') || p.startsWith('/stage') || p === '/vtt' || p.startsWith('/vtt-ops')) return 'ade';
    if (p.startsWith('/network') || p.startsWith('/teams') || p.startsWith('/groups') || p.startsWith('/squads') || p.startsWith('/comms') || p.startsWith('/chat')) return 'network';
    return null;
  };

  const activeId = getActiveId();

  const getBadge = (id) => {
    if (id === 'folio') {
      const count = (personaRoster && personaRoster.length > 0) ? personaRoster.length : (roster?.length || 0);
      return count > 0 ? count : null;
    }
    if (id === 'ade') {
      const total = (universeState?.scenarios?.length || 0) + (mapsCatalog?.length || universeState?.maps?.length || 0);
      return total > 0 ? total : null;
    }
    if (id === 'network') {
      if (totalUnreadCount > 0) return totalUnreadCount;
      if (pendingInvites?.length > 0) return `${pendingInvites.length}!`;
      if (hasNewOperatorLogins) return newOperatorLogins.length > 0 ? `+${newOperatorLogins.length}` : 'NEW';
      return (groups && groups.length > 0) ? groups.length : null;
    }
    if (id === 'hub') {
      return pendingInvites.length > 0 ? pendingInvites.length : null;
    }
    return null;
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-[90] h-14 bg-[#070a12]/95 backdrop-blur-md border-t border-cyan-500/20 flex items-center justify-around px-0.5 pb-[env(safe-area-inset-bottom,0px)] select-none shadow-[0_-4px_20px_rgba(0,0,0,0.7)]"
    >
      {NAV_ITEMS.map((item) => {
        const isDice = item.id === 'dice';
        const isDiceActive = isDice && !!isDiceOpen;
        const isActive = isDice ? isDiceActive : activeId === item.id;
        const badge = getBadge(item.id);
        const Icon = item.icon;
        const activeStyle = COLOR_ACTIVE[item.color] || COLOR_ACTIVE.cyan;
        const isNetworkItem = item.id === 'network';
        const isNetworkPulsing = isNetworkItem && (totalUnreadCount > 0 || hasNewOperatorLogins);
        const networkPulseClass = (totalUnreadCount > 0 && hasNewOperatorLogins)
          ? 'animate-nav-pulse-hybrid'
          : hasNewOperatorLogins
          ? 'animate-nav-pulse-emerald'
          : 'animate-nav-pulse-amber';

        return (
          <button
            key={item.id}
            type="button"
            onMouseEnter={() => {
              if (item.id === 'rules' || item.id === 'cortex') {
                loadCompendiumCatalog();
              }
            }}
            onTouchStart={() => {
              if (item.id === 'rules' || item.id === 'cortex') {
                loadCompendiumCatalog();
              }
            }}
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              if (item.id === 'dice') {
                if (toggleDiceRoller) {
                  toggleDiceRoller();
                } else {
                  window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
                }
                return;
              }
              if (isNetworkItem && hasNewOperatorLogins && totalUnreadCount === 0) {
                clearNewOperatorLogins?.();
              }
              navigate(item.path);
            }}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-0.5 py-1 rounded-lg border transition-all flex-1 min-w-0 min-h-[44px] touch-manipulation cursor-pointer active:scale-95 ${
              isActive
                ? `${activeStyle}`
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {/* Active top indicator accent */}
            {isActive && (
              <span className={`absolute -top-[1px] left-1.5 right-1.5 h-0.5 rounded-full ${
                item.color === 'sky'
                  ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]'
                  : item.color === 'amber'
                  ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                  : item.color === 'purple'
                  ? 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]'
                  : item.color === 'emerald'
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                  : 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]'
              }`} />
            )}

            {/* Icon + Badge */}
            <div className={`relative flex items-center justify-center p-0.5 rounded-md ${
              isNetworkPulsing ? `transition-none ${networkPulseClass}` : 'transition-all'
            }`}>
              <Icon size={16} className={`transition-transform ${isActive ? 'scale-110' : ''} ${isNetworkPulsing ? 'text-current' : ''}`} />
              {badge !== null && (
                <span className={`absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] px-1 rounded-full text-[8px] font-bold font-mono flex items-center justify-center shadow-[0_0_6px_rgba(34,211,238,0.6)] ${
                  isNetworkItem && hasNewOperatorLogins && totalUnreadCount === 0
                    ? 'bg-emerald-400 text-black'
                    : 'bg-cyan-400 text-slate-950'
                } ${isNetworkPulsing ? 'animate-soft-badge-glow' : ''}`}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span className={`text-[8px] font-mono font-bold uppercase tracking-wider leading-none mt-0.5 truncate max-w-full ${
              isNetworkPulsing ? 'text-cyan-300 font-extrabold' : ''
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
