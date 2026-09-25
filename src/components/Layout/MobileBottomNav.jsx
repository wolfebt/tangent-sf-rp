import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Users, 
  BookOpen, 
  Database, 
  Layers, 
  MapPin, 
  Radio 
} from 'lucide-react';
import { useFolio } from '../../context/FolioContext';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { AudioService } from '../../services/audioService';

const NAV_ITEMS = [
  { id: 'hub',    icon: Compass,  label: 'HUB',    path: '/',           color: 'cyan'    },
  { id: 'folio',  icon: Users,    label: 'FOLIO',  path: '/folio',      color: 'cyan'    },
  { id: 'rules',  icon: BookOpen, label: 'RULES',  path: '/compendium', color: 'sky'     },
  { id: 'cortex', icon: Database, label: 'CORTEX', path: '/dbm',        color: 'amber'   },
  { id: 'ade',    icon: Layers,   label: 'ADE',    path: '/foundry',    color: 'purple'  },
  { id: 'vtt',    icon: MapPin,   label: 'VTT',    path: '/stage',      color: 'cyan'    },
  { id: 'comms',  icon: Radio,    label: 'COMMS',  path: '/comms',      color: 'emerald' },
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
 * Enables full navigation capability across all sub-workspaces without relying on browser back.
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

  // Telemetry contexts for real-time badges
  const { personaRoster = [], roster = [] } = useFolio() || {};
  const { totalUnreadCount = 0 } = useChat() || {};
  const { pendingInvites = [] } = useGroup() || {};

  const getActiveId = () => {
    const p = location.pathname;
    if (p === '/' || p === '/dashboard') return 'hub';
    if (p.startsWith('/folio') || p.startsWith('/roster')) return 'folio';
    if (p.startsWith('/compendium')) return 'rules';
    if (p.startsWith('/dbm') || p.startsWith('/codex')) return 'cortex';
    if (p.startsWith('/foundry') || p.startsWith('/ade') || p.startsWith('/campaign-builder')) return 'ade';
    if (p.startsWith('/stage') || p === '/vtt' || p.startsWith('/vtt-ops')) return 'vtt';
    if (p.startsWith('/comms') || p.startsWith('/chat') || p.startsWith('/teams') || p.startsWith('/groups')) return 'comms';
    return null;
  };

  const activeId = getActiveId();

  const getBadge = (id) => {
    if (id === 'folio') {
      const count = (personaRoster && personaRoster.length > 0) ? personaRoster.length : (roster?.length || 0);
      return count > 0 ? count : null;
    }
    if (id === 'comms') {
      return totalUnreadCount > 0 ? totalUnreadCount : null;
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
        const isActive = activeId === item.id;
        const badge = getBadge(item.id);
        const Icon = item.icon;
        const activeStyle = COLOR_ACTIVE[item.color] || COLOR_ACTIVE.cyan;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              navigate(item.path);
            }}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-1 py-1 rounded-lg border transition-all flex-1 mx-0.5 cursor-pointer active:scale-95 ${
              isActive
                ? `${activeStyle}`
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {/* Active top indicator accent */}
            {isActive && (
              <span className="absolute -top-[1px] left-2 right-2 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            )}

            {/* Icon + Badge */}
            <div className="relative flex items-center justify-center">
              <Icon size={16} className={`transition-transform ${isActive ? 'scale-110' : ''}`} />
              {badge !== null && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] px-1 rounded-full bg-cyan-400 text-slate-950 text-[8px] font-bold font-mono flex items-center justify-center shadow-[0_0_6px_rgba(34,211,238,0.6)]">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider leading-none mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
