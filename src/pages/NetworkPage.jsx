import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Shield, 
  Users, 
  Plus, 
  HelpCircle,
  Compass
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useSquad } from '../context/SquadContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AudioService } from '../services/audioService';

import { CommsPage } from './CommsPage';
import { SquadsPage } from './SquadsPage';
import { NetworkServerRail } from '../components/Network/NetworkServerRail';
import { NetworkRosterView } from '../components/Chat/NetworkRosterView';
import { CreateChannelModal } from '../components/Chat/CreateChannelModal';
import { CreateSquadModal } from '../components/Squads/CreateSquadModal';
import { SquadInviteConfirmationModal } from '../components/Squads/SquadInviteConfirmationModal';
import { ComprehensiveUserGuideModal } from '../components/UI/ComprehensiveUserGuideModal';

/**
 * @file NetworkPage.jsx
 * @description SOTA 4-Zone Gaming Comm Center Workstation for Terran Data Network:
 * - Zone 1 (64px): NetworkServerRail (HoloNet Home, Enrolled Squad Crests, Recruitment LFG, Operators)
 * - Zone 2 (260px): Dual-Context Channel & Squad Command Tree + Bottom Transceiver Deck
 * - Zone 3 (Flex-1): Primary Active Stage (Message Stream, Squad Roster/VTT Briefing, LFG Hub, or Operator Directory)
 * - Zone 4 (300px): Collapsible Context Inspector Drawer (Roster, Docket, Stage, Audit)
 */
export const NetworkPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Route & View Management
  const initialViewParam = searchParams.get('view');
  const initialTabParam = searchParams.get('tab');
  const hasJoinParam = !!searchParams.get('join');
  const validSquadTabs = ['roster', 'directory', 'lfg', 'invites', 'tactical', 'comms', 'settings'];
  const hasSquadTabParam = !!initialTabParam && validSquadTabs.includes(initialTabParam);
  const isInitialLfgView = initialViewParam === 'community' || initialViewParam === 'networking';

  const defaultView = (hasJoinParam || hasSquadTabParam || isInitialLfgView || initialViewParam === 'squads' || initialViewParam === 'teams')
    ? 'squads'
    : (initialViewParam === 'roster' ? 'roster' : 'comms');

  const [activeView, setActiveView] = useState(defaultView);
  const [activeSquadNavTab, setActiveSquadNavTab] = useState(
    hasJoinParam ? 'invites' : (isInitialLfgView ? 'lfg' : (hasSquadTabParam ? initialTabParam : 'roster'))
  );
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [isCreateSquadModalOpen, setIsCreateSquadModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [commsMobileView, setCommsMobileView] = useState('chat'); // 'sidebar' | 'chat'

  // Contexts
  const { 
    totalUnreadCount = 0, 
    hasNewOperatorLogins = false, 
    clearNewOperatorLogins,
    onlineOperators = [],
    publicChannels = [],
    activeChannel,
    selectChannel,
    activeChannelId
  } = useChat() || {};

  const {
    squads = [],
    groups = [],
    activeSquad,
    activeGroup,
    selectSquad,
    selectGroup,
    pendingInvites = [],
    reviewingInvite,
    openInviteConfirmation,
    closeInviteConfirmation,
    declineInvite
  } = useSquad() || {};

  const effectiveSquads = squads.length > 0 ? squads : groups;
  const effectiveActiveSquad = activeSquad || activeGroup;
  const effectiveSelectSquad = selectSquad || selectGroup;

  // Synchronize view & squad tab state if URL query param changes
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const tabParam = searchParams.get('tab');
    const joinParam = searchParams.get('join');

    if (joinParam) {
      setActiveView('squads');
      setActiveSquadNavTab('invites');
      return;
    }

    if (viewParam === 'squads' || viewParam === 'teams') {
      setActiveView('squads');
      if (tabParam && validSquadTabs.includes(tabParam)) {
        setActiveSquadNavTab(tabParam);
      }
    } else if (viewParam === 'community' || viewParam === 'networking') {
      setActiveView('squads');
      setActiveSquadNavTab('lfg');
    } else if (viewParam === 'roster') {
      setActiveView('roster');
    } else if (viewParam === 'comms' || viewParam === 'chat') {
      setActiveView('comms');
    }
  }, [searchParams]);

  // When a Team channel is selected (e.g., via notification banner or SquadsDrawer),
  // automatically route to its Squad Comms view instead of overwriting it back to #general
  useEffect(() => {
    const isTeamChan =
      activeChannel?.type === 'group' ||
      Boolean(activeChannel?.groupId) ||
      String(activeChannelId || '').startsWith('group_chan_');
    if (isTeamChan && activeView === 'comms') {
      const matchedSquad = effectiveSquads.find(
        s => s.id === activeChannel?.groupId || s.channelId === activeChannelId || `group_chan_${s.id}` === activeChannelId
      );
      if (matchedSquad && effectiveActiveSquad?.id !== matchedSquad.id) {
        effectiveSelectSquad?.(matchedSquad.id);
      }
      setActiveView('squads');
      setActiveSquadNavTab('comms');
    }
  }, [activeChannelId, activeChannel?.type, activeChannel?.groupId, activeView, effectiveSquads, effectiveActiveSquad?.id, effectiveSelectSquad]);

  // Derived 4-Zone Server Context
  const serverContext = activeView === 'squads' || activeView === 'teams'
    ? 'squad'
    : activeView === 'roster'
    ? 'directory'
    : 'holonet';

  const handleSelectView = useCallback((viewKey, optionalTab) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (viewKey === 'roster' && hasNewOperatorLogins) {
      clearNewOperatorLogins?.();
    }
    const isLfg = viewKey === 'community' || viewKey === 'networking';
    const targetKey = (viewKey === 'teams' || isLfg) ? 'squads' : viewKey;
    const resolvedTab = isLfg ? 'lfg' : optionalTab;

    // If explicitly switching to HoloNet ('comms') while a Team channel is active, switch to general frequency
    if (targetKey === 'comms') {
      const isTeamChan =
        activeChannel?.type === 'group' ||
        Boolean(activeChannel?.groupId) ||
        String(activeChannelId || '').startsWith('group_chan_');
      if (isTeamChan && selectChannel) {
        const fallbackId = publicChannels[0]?.id || 'public_general';
        selectChannel(fallbackId);
      }
    }

    setActiveView(targetKey);
    if (resolvedTab) {
      setActiveSquadNavTab(resolvedTab);
    }
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('view', targetKey);
      if (targetKey === 'squads' && (resolvedTab || activeSquadNavTab)) {
        next.set('tab', resolvedTab || activeSquadNavTab);
      } else if (targetKey !== 'squads') {
        next.delete('tab');
      }
      return next;
    });
  }, [hasNewOperatorLogins, clearNewOperatorLogins, activeSquadNavTab, setSearchParams, activeChannel?.type, activeChannel?.groupId, activeChannelId, publicChannels, selectChannel]);

  // Zone 1 Rail Context Switch Handler
  const handleSelectRailContext = useCallback((ctxKey) => {
    if (ctxKey === 'holonet') {
      handleSelectView('comms');
    } else if (ctxKey === 'stage' || ctxKey === 'audit') {
      // Keep current 'holonet' or 'squad' CommsPage mounted so Zone 4 Inspector opens in-place;
      // only switch away if currently in 'roster' directory view
      if (activeView === 'roster') {
        handleSelectView('comms');
      }
    } else if (ctxKey === 'squad') {
      handleSelectView('squads', activeSquadNavTab || 'roster');
    } else if (ctxKey === 'discovery') {
      handleSelectView('community');
    } else if (ctxKey === 'directory') {
      handleSelectView('roster');
    }
  }, [handleSelectView, activeSquadNavTab, activeView]);

  // 1-Click Squad Crest Selection from Zone 1 Rail
  const handleSelectSquadFromRail = useCallback((squad) => {
    if (squad?.id) {
      effectiveSelectSquad?.(squad.id);
      // If squad has a dedicated comm channel and user is switching squads, sync channel
      if (squad.channelId && activeSquadNavTab === 'comms' && activeChannelId !== squad.channelId) {
        selectChannel?.(squad.channelId);
      }
    }
    handleSelectView('squads', activeSquadNavTab || 'roster');
  }, [effectiveSelectSquad, activeSquadNavTab, activeChannelId, selectChannel, handleSelectView]);

  // Zone 2 Squad Command Tree Navigation Handler
  const handleSelectSquadNavTab = useCallback((tabId) => {
    setActiveSquadNavTab(tabId);
    if (tabId === 'comms' && effectiveActiveSquad?.channelId && activeChannelId !== effectiveActiveSquad.channelId) {
      selectChannel?.(effectiveActiveSquad.channelId);
    }
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('view', 'squads');
      next.set('tab', tabId);
      return next;
    });
  }, [effectiveActiveSquad?.channelId, activeChannelId, selectChannel, setSearchParams]);

  return (
    <div className="h-full w-full flex flex-col bg-[#070b13] text-slate-100 font-sans overflow-hidden select-none">
      {/* ── Mobile-Only Compact Navigation Header (< md screens) ──
          On desktop (>= 768px), Zone 1 (NetworkServerRail) + Zone 3's single 48px Context Header
          replace this bar so 100% of vertical height goes to the 4-Zone Comm Center. */}
      <header className="md:hidden px-2.5 py-1.5 bg-slate-950 border-b border-slate-800/90 flex items-center justify-between gap-1.5 text-xs font-mono shrink-0 shadow-md z-20">
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleSelectView('comms')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeView === 'comms'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio size={11} className={activeView === 'comms' ? 'text-amber-400' : 'text-slate-400'} />
            <span>FREQS</span>
            {totalUnreadCount > 0 && (
              <span className="px-1 rounded bg-amber-500 text-black font-extrabold text-[8.5px]">
                {totalUnreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectView('squads')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeView === 'squads' || activeView === 'teams'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={11} className={activeView === 'squads' || activeView === 'teams' ? 'text-emerald-400' : 'text-slate-400'} />
            <span>TEAMS</span>
            {pendingInvites.length > 0 && (
              <span className="px-1 rounded bg-amber-400 text-black font-extrabold text-[8.5px]">
                {pendingInvites.length}!
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectView('roster')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeView === 'roster'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={11} className={activeView === 'roster' ? 'text-cyan-400' : 'text-slate-400'} />
            <span>ROSTER</span>
            {onlineOperators.length > 0 && (
              <span className="px-1 rounded bg-cyan-500/20 text-cyan-300 text-[8.5px] font-mono">
                {onlineOperators.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {activeView === 'comms' && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1000, 0.02);
                setCommsMobileView(prev => prev === 'sidebar' ? 'chat' : 'sidebar');
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
            >
              <Radio size={11} />
              <span>{commsMobileView === 'sidebar' ? 'CHAT' : 'FREQS'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 cursor-pointer"
            title="Operations Guide"
          >
            <HelpCircle size={13} />
          </button>
        </div>
      </header>

      {/* ── High-Visibility Pending Squad Commission Alert Banner ── */}
      {pendingInvites && pendingInvites.length > 0 && (
        <div className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-emerald-950 via-[#0a1820] to-slate-950 border-b border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono shrink-0 shadow-lg z-10 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
              <Shield size={14} className="animate-pulse" />
            </div>
            <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-emerald-300 uppercase tracking-wide text-[10.5px] sm:text-[11px]">
                COMMISSION DISPATCH:
              </span>
              <span className="text-white font-bold truncate max-w-[180px] sm:max-w-none">
                "{pendingInvites[0].groupName || pendingInvites[0].squadName}"
              </span>
              <span className="text-slate-400 text-[10px] hidden xs:inline">
                from @{pendingInvites[0].fromUserHandle || 'Operator'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => openInviteConfirmation(pendingInvites[0])}
              className="px-2.5 sm:px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow-sm cursor-pointer transition-colors"
            >
              REVIEW
            </button>
            <button
              type="button"
              onClick={() => declineInvite(pendingInvites[0].id)}
              className="px-2 sm:px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg text-[11px] cursor-pointer transition-colors"
            >
              DECLINE
            </button>
          </div>
        </div>
      )}

      {/* ── SOTA 4-Zone Comm Center Workstation Body ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* ZONE 1: Far-Left Server & Hub Switcher Rail (64px on Desktop) */}
        <div className="hidden md:flex h-full shrink-0 relative z-40">
          <NetworkServerRail
            activeContext={serverContext}
            serverContext={serverContext}
            squads={effectiveSquads}
            onSelectContext={handleSelectRailContext}
            onSelectHolonet={() => handleSelectRailContext('holonet')}
            onSelectDiscovery={() => handleSelectRailContext('discovery')}
            onSelectDirectory={() => handleSelectRailContext('directory')}
            activeSquadId={effectiveActiveSquad?.id}
            onSelectSquad={handleSelectSquadFromRail}
            onOpenCreateChannel={() => setIsCreateChannelModalOpen(true)}
            onOpenCreateSquad={() => setIsCreateSquadModalOpen(true)}
            onOpenGuide={() => setIsGuideModalOpen(true)}
          />
        </div>

        {/* ZONES 2, 3 & 4: Active Context Stage */}
        <div className="flex-1 flex min-w-0 min-h-0 h-full overflow-hidden relative">
          {/* MODE A: HOLONET COMMS RELAY (Zone 2 Channel Tree + Zone 3 Stream + Zone 4 Inspector) */}
          {serverContext === 'holonet' && (
            <div className="flex-1 flex min-h-0 h-full overflow-hidden">
              <CommsPage
                hideHeader={true}
                hideLeftRail={true}
                serverContext="holonet"
                onSwitchToTeams={() => handleSelectView('squads', 'roster')}
                mobileViewOverride={commsMobileView}
                setMobileViewOverride={setCommsMobileView}
              />
            </div>
          )}

          {/* MODE B: TACTICAL SQUAD SERVER (Zone 2 Squad Command Tree + Zone 3 Squad Stage / Comms + Zone 4 Inspector) */}
          {serverContext === 'squad' && (
            <>
              {/* Desktop 4-Zone Unified Squad Workstation */}
              <div className="hidden md:flex flex-1 min-h-0 h-full overflow-hidden">
                <CommsPage
                  hideHeader={true}
                  hideLeftRail={true}
                  serverContext="squad"
                  activeStageMode={activeSquadNavTab === 'comms' ? 'comms' : 'squad_command'}
                  activeSquadTab={activeSquadNavTab}
                  activeSquadNavTab={activeSquadNavTab}
                  onSelectSquadCommandTab={handleSelectSquadNavTab}
                  onSelectSquadNavTab={handleSelectSquadNavTab}
                  onReturnToCommsStream={() => handleSelectSquadNavTab('comms')}
                  onSwitchToTeams={() => handleSelectSquadNavTab('roster')}
                  onOpenCreateSquad={() => setIsCreateSquadModalOpen(true)}
                  renderStageOverride={
                    activeSquadNavTab !== 'comms' ? (
                      <SquadsPage
                        hideHeader={true}
                        hideLeftRail={true}
                        controlledTab={activeSquadNavTab}
                        onTabChange={handleSelectSquadNavTab}
                        onSwitchToComms={() => handleSelectSquadNavTab('comms')}
                      />
                    ) : null
                  }
                />
              </div>

              {/* Mobile Squads View (< md screens) */}
              <div className="md:hidden flex-1 flex min-h-0 h-full overflow-hidden">
                <SquadsPage
                  hideHeader={true}
                  controlledTab={activeSquadNavTab}
                  onTabChange={handleSelectSquadNavTab}
                  onSwitchToComms={() => handleSelectView('comms')}
                />
              </div>
            </>
          )}

          {/* MODE D: LIVE OPERATOR & PERSONA DIRECTORY */}
          {serverContext === 'directory' && (
            <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden bg-[#090d16]">
              <NetworkRosterView
                fullStageMode={true}
                onSelectChannel={() => handleSelectView('comms')}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Modals & Overlays ── */}
      {isCreateChannelModalOpen && (
        <CreateChannelModal
          isOpen={isCreateChannelModalOpen}
          onClose={() => {
            setIsCreateChannelModalOpen(false);
            if (activeView !== 'comms') {
              handleSelectView('comms');
            }
          }}
        />
      )}

      {isCreateSquadModalOpen && (
        <CreateSquadModal
          isOpen={isCreateSquadModalOpen}
          onClose={() => setIsCreateSquadModalOpen(false)}
        />
      )}

      {reviewingInvite && (
        <SquadInviteConfirmationModal
          isOpen={!!reviewingInvite}
          onClose={closeInviteConfirmation}
          invite={reviewingInvite}
        />
      )}

      {isGuideModalOpen && (
        <ComprehensiveUserGuideModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
          initialTab={(activeView === 'squads' || activeView === 'teams') ? 'squads' : 'comms'}
        />
      )}
    </div>
  );
};

export default NetworkPage;
