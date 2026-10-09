import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GuidanceRail } from '../UI/GuidanceRail';
import { useFolio } from '../../context/FolioContext';
import { useDBM, loadCompendiumCatalog } from '../../context/DBMContext';
import { useStory } from '../../context/CampaignContext';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { AudioService } from '../../services/audioService';
import {
  Users,
  Database,
  Layers,
  Radio
} from 'lucide-react';

/**
 * @file GlobalSideRail.jsx
 * @description Persistent primary navigation guidance rail rendered across all app pages.
 * Displays color-coded items with labels and icons matching former top buttons.
 */
export const GlobalSideRail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Telemetry Contexts
  const { personaRoster = [], roster = [] } = useFolio() || {};
  const dbContext = useDBM() || {};
  const dbData = dbContext.dbData || {};
  const { universeState, mapsCatalog } = useStory() || {};
  const { groups = [], pendingInvites = [] } = useGroup() || {};
  const { 
    totalUnreadCount = 0, 
    hasUnseenMessages = false,
    hasNewOperatorLogins = false, 
    newOperatorLogins = [], 
    clearNewOperatorLogins 
  } = useChat() || {};

  // Badge calculations
  const heroCount = Array.isArray(personaRoster) && personaRoster.length > 0 
    ? personaRoster.length 
    : (Array.isArray(roster) ? roster.length : 0);
  const dbmTotalItems = Object.keys(dbData).reduce((sum, key) => {
    return sum + (Array.isArray(dbData[key]) ? dbData[key].length : 0);
  }, 0);
  const scenarioCount = universeState?.scenarios?.length || 0;
  const mapsCount = mapsCatalog?.length || universeState?.maps?.length || 0;
  const teamCount = groups?.length || 0;
  const inviteCount = pendingInvites?.length || 0;



  // Do not render side rail on pure spectator / projector displays
  if (
    location.pathname.includes('/spectator') || 
    location.pathname.startsWith('/foundry/view/')
  ) {
    return null;
  }

  // Determine active item from current route
  const getActiveId = () => {
    const path = location.pathname;
    if (path.startsWith('/network') || path.startsWith('/teams') || path.startsWith('/groups') || path.startsWith('/squads') || path.startsWith('/comms') || path.startsWith('/chat')) return 'network';
    if (path.startsWith('/folio') || path.startsWith('/roster')) return 'folio';
    if (path.startsWith('/compendium')) return 'rules';
    if (path.startsWith('/dbm') || path.startsWith('/codex')) return 'cortex';
    if (path.startsWith('/foundry') || path.startsWith('/ade') || path.startsWith('/campaign-builder') || path.startsWith('/live-studio') || path.startsWith('/ade-stage') || path.startsWith('/stage') || path === '/vtt' || path.startsWith('/vtt-ops')) return 'ade';
    if (path === '/' || path === '/dashboard') return 'hub';
    return null;
  };

  const activeId = getActiveId();
  const isHubActive = activeId === 'hub';

  // Persistent navigation items with color themes matching top buttons
  const globalNavItems = [
    {
      id: 'folio',
      label: 'FOLIO',
      sublabel: 'Persona Roster & Dossiers',
      icon: Users,
      colorTheme: 'cyan',
      badge: heroCount > 0 ? `${heroCount}` : null,
      onClick: () => {
        AudioService.playTerminalBeep(1150, 0.02);
        navigate('/folio');
      }
    },
    {
      id: 'cortex',
      label: 'CORTEX',
      sublabel: 'Omnicortex Master Database',
      icon: Database,
      colorTheme: 'amber',
      badge: dbmTotalItems > 0 ? `${dbmTotalItems}` : null,
      onMouseEnter: () => {
        loadCompendiumCatalog();
      },
      onClick: () => {
        AudioService.playTerminalBeep(1150, 0.02);
        navigate('/dbm');
      }
    },
    {
      id: 'ade',
      label: 'ADE',
      sublabel: 'Consolidated Story, Maps & Stage',
      icon: Layers,
      colorTheme: 'purple',
      badge: (scenarioCount + mapsCount) > 0 ? `${scenarioCount + mapsCount}` : null,
      onClick: () => {
        AudioService.playTerminalBeep(1150, 0.02);
        navigate('/foundry');
      }
    },
    {
      id: 'network',
      label: 'NETWORK',
      sublabel: hasNewOperatorLogins
        ? `Operator Online: ${newOperatorLogins.map(o => o.userHandle || o.displayName).slice(0, 2).join(', ')}`
        : totalUnreadCount > 0
        ? `${totalUnreadCount} Unseen Messages`
        : inviteCount > 0
        ? `${inviteCount} Pending Squad Invite${inviteCount > 1 ? 's' : ''}`
        : 'Tactical Squads, CommLink & Operator Relay',
      icon: Radio,
      colorTheme: 'emerald',
      badge: totalUnreadCount > 0 
        ? `${totalUnreadCount}` 
        : (inviteCount > 0 
          ? `${inviteCount}!` 
          : (hasNewOperatorLogins 
            ? (newOperatorLogins.length > 0 ? `+${newOperatorLogins.length}` : 'NEW') 
            : (teamCount > 0 ? `${teamCount}` : null))),
      badgeColor: (totalUnreadCount > 0 || inviteCount > 0)
        ? 'bg-amber-500 text-black font-extrabold animate-soft-badge-glow shadow-[0_0_8px_rgba(245,158,11,0.7)]'
        : (hasNewOperatorLogins ? 'bg-emerald-400 text-black animate-soft-badge-glow shadow-[0_0_8px_rgba(16,185,129,0.7)]' : undefined),
      pulse: totalUnreadCount > 0 || inviteCount > 0 || hasNewOperatorLogins,
      pulseClass: (totalUnreadCount > 0 || inviteCount > 0)
        ? 'animate-nav-pulse-amber'
        : 'animate-nav-pulse-emerald',
      onClick: () => {
        AudioService.playTerminalBeep(1150, 0.02);
        if (hasNewOperatorLogins && totalUnreadCount === 0) {
          clearNewOperatorLogins?.();
        }
        navigate('/network');
      }
    }
  ];

  return (
    <div className="hidden sm:flex h-full shrink-0 z-30 select-none">
      <GuidanceRail
        items={globalNavItems}
        activeId={activeId}
      />
    </div>
  );
};
