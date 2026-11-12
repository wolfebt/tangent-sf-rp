import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GuidanceRail } from '../UI/GuidanceRail';
import { WelcomeBriefing } from '../Hub/WelcomeBriefing';
import { useFolio } from '../../context/FolioContext';
import { useDBM, loadCompendiumCatalog } from '../../context/DBMContext';
import { useStory } from '../../context/CampaignContext';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { AudioService } from '../../services/audioService';
import {
  Users,
  BookOpen,
  Database,
  Radio,
  Layers
} from 'lucide-react';

/**
 * @file GlobalSideRail.jsx
 * @description Unified left-side guide rail for wider views (sm+):
 * - On the Landing Page (/ or /dashboard): Renders as an expanded drawer docked on the left side showing the Tactical Briefing.
 * - On App Pages (folio, rules, cortex, network, ade): Renders as a compact guide rail with icons and labels.
 */
export const GlobalSideRail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Telemetry Contexts
  const folio = useFolio() || {};
  const { groups = [], pendingInvites = [] } = useGroup() || {};
  const { 
    totalUnreadCount = 0, 
    hasNewOperatorLogins = false, 
    newOperatorLogins = [], 
    clearNewOperatorLogins 
  } = useChat() || {};

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
    if (path.startsWith('/compendium') || path.startsWith('/rules')) return 'rules';
    if (path.startsWith('/dbm') || path.startsWith('/codex')) return 'cortex';
    if (path.startsWith('/foundry') || path.startsWith('/ade') || path.startsWith('/campaign-builder') || path.startsWith('/live-studio') || path.startsWith('/ade-stage') || path.startsWith('/stage') || path === '/vtt' || path.startsWith('/vtt-ops')) return 'ade';
    if (path === '/' || path === '/dashboard') return 'hub';
    return null;
  };

  const activeId = getActiveId();
  const isHubActive = activeId === 'hub';
  const isFolio = activeId === 'folio';

  // On the landing page, render the expanded Tactical Briefing drawer docked on the left side
  if (isHubActive) {
    return (
      <aside
        aria-label="Tactical Briefing Left Drawer"
        className="hidden sm:flex w-[420px] md:w-[480px] lg:w-[540px] xl:w-[580px] h-full shrink-0 z-30 select-none overflow-hidden"
      >
        <WelcomeBriefing docked />
      </aside>
    );
  }

  // Persistent navigation items for app pages (Folio, Rules, Cortex, Network, ADE)
  const globalNavItems = [
    {
      id: 'folio',
      label: 'FOLIO',
      sublabel: isFolio && folio?.characterData?.['char-name']
        ? `${folio.characterData['char-name']} (Click to toggle Catalog / Folio)`
        : 'Persona Roster & Folios',
      icon: Users,
      colorTheme: 'cyan',
      onClick: () => {
        if (isFolio) {
          if (folio?.activeTab === 'catalog') {
            const charId = folio?.characterData?.['character-doc-id'] || folio?.characterData?.id;
            navigate(charId ? `/folio?tab=identity&char=${encodeURIComponent(charId)}` : '/folio?tab=identity');
            folio.setActiveTab?.('identity');
          } else {
            folio.triggerSave?.();
            window.dispatchEvent(new CustomEvent('open-folio-catalog'));
          }
        } else {
          navigate('/folio');
        }
      }
    },
    {
      id: 'rules',
      label: 'RULES',
      sublabel: 'System Compendium & Core Mechanics',
      icon: BookOpen,
      colorTheme: 'sky',
      onMouseEnter: () => {
        loadCompendiumCatalog();
      },
      onClick: () => {
        navigate('/compendium');
      }
    },
    {
      id: 'cortex',
      label: 'CORTEX',
      sublabel: 'Master Database, Catalogs & Galactic Lore',
      icon: Database,
      colorTheme: 'amber',
      onMouseEnter: () => {
        loadCompendiumCatalog();
      },
      onClick: () => {
        navigate('/dbm');
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
        ? `${inviteCount} Pending Team Invite${inviteCount > 1 ? 's' : ''}`
        : 'Tactical Squads, CommLink & Operator Relay',
      icon: Radio,
      colorTheme: 'emerald',
      badge: totalUnreadCount > 0 ? `${totalUnreadCount}` : undefined,
      pulse: totalUnreadCount > 0,
      pulseClass: 'animate-nav-pulse-amber',
      onClick: () => {
        if (hasNewOperatorLogins && totalUnreadCount === 0) {
          clearNewOperatorLogins?.();
        }
        navigate('/network');
      }
    },
    {
      id: 'ade',
      label: 'ADE',
      sublabel: 'Consolidated Story, Maps & Stage VTT',
      icon: Layers,
      colorTheme: 'purple',
      onClick: () => {
        navigate('/foundry');
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
