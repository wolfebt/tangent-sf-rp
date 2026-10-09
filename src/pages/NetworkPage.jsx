import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Shield, 
  Users, 
  Plus, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Lock, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Globe
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useSquad } from '../context/SquadContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { AudioService } from '../services/audioService';

import { CommsPage } from './CommsPage';
import { SquadsPage } from './SquadsPage';
import { NetworkRosterView } from '../components/Chat/NetworkRosterView';
import { CommunityNetworkingView } from '../components/Community/CommunityNetworkingView';
import { CreateChannelModal } from '../components/Chat/CreateChannelModal';
import { CreateSquadModal } from '../components/Squads/CreateSquadModal';
import { SquadInviteConfirmationModal } from '../components/Squads/SquadInviteConfirmationModal';
import { ComprehensiveUserGuideModal } from '../components/UI/ComprehensiveUserGuideModal';

/**
 * @file NetworkPage.jsx
 * @description Consolidated primary workstation for Terran Data Network:
 * Unifies Tactical Squads/Teams, CommLink Frequency Channels, Community Networking, and Operator Roster Presence.
 */
export const NetworkPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const confirm = useConfirm();

  // Route & View Management
  const initialViewParam = searchParams.get('view');
  const hasJoinParam = !!searchParams.get('join');
  const hasSquadTabParam = !!searchParams.get('tab') && ['roster', 'directory', 'invites', 'tactical', 'settings'].includes(searchParams.get('tab'));
  
  const defaultView = (hasJoinParam || hasSquadTabParam || initialViewParam === 'squads' || initialViewParam === 'teams')
    ? 'squads'
    : (initialViewParam === 'community' || initialViewParam === 'networking' ? 'community' : (initialViewParam === 'roster' ? 'roster' : 'comms'));

  const [activeView, setActiveView] = useState(defaultView);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [isCreateSquadModalOpen, setIsCreateSquadModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [commsMobileView, setCommsMobileView] = useState('chat'); // 'sidebar' | 'chat'
  const [copiedLink, setCopiedLink] = useState(false);

  // Synchronize view state if URL query param changes
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'squads' || viewParam === 'teams') {
      setActiveView('squads');
    } else if (viewParam === 'community' || viewParam === 'networking') {
      setActiveView('community');
    } else if (viewParam === 'roster') {
      setActiveView('roster');
    } else if (viewParam === 'comms' || viewParam === 'chat') {
      setActiveView('comms');
    }
  }, [searchParams]);

  // Contexts
  const { 
    activeChannel, 
    totalUnreadCount = 0, 
    hasNewOperatorLogins = false, 
    newOperatorLogins = [], 
    clearNewOperatorLogins,
    onlineOperators = []
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

  const { currentUser } = useAuth() || {};

  const handleSelectView = (viewKey) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (viewKey === 'roster' && hasNewOperatorLogins) {
      clearNewOperatorLogins?.();
    }
    const targetKey = viewKey === 'teams' ? 'squads' : viewKey;
    setActiveView(targetKey);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('view', targetKey);
      return next;
    });
  };

  const handleCopySquadLink = () => {
    if (!effectiveActiveSquad?.inviteCode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/network?view=squads&join=${effectiveActiveSquad.inviteCode}`;
    navigator.clipboard.writeText(shareUrl);
    AudioService.playTerminalBeep(1250, 0.03);
    setCopiedLink(true);
    toast?.({ type: 'success', text: 'Squad invite link copied to clipboard.' });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#070b13] text-slate-100 font-sans overflow-hidden select-none">
      {/* ── Master Unified Station Header ── */}
      <header className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-950 border-b border-slate-800/90 flex items-center justify-between gap-1.5 sm:gap-2.5 text-xs font-mono shrink-0 shadow-md z-20">
        {/* Left: Station Identity & Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative flex items-center justify-center">
              <Radio size={14} className="text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-badge-glow" />
            </div>
            <span className="text-white font-bold tracking-wider hidden lg:inline">
              TERRAN DATA NETWORK
            </span>
          </div>

          <div className="hidden lg:block h-4 w-px bg-slate-800" />

          {/* Segmented View Mode Switcher */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/90 p-0.5 sm:p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectView('comms')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                activeView === 'comms'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Radio size={11} className={activeView === 'comms' ? 'text-amber-400' : 'text-slate-400'} />
              <span className="hidden xs:inline">COMMLINK</span>
              <span className="xs:hidden">COMMS</span>
              {totalUnreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black font-extrabold text-[8.5px] sm:text-[9px] animate-soft-badge-glow shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                  {totalUnreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectView('squads')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                activeView === 'squads' || activeView === 'teams'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Shield size={11} className={activeView === 'squads' || activeView === 'teams' ? 'text-emerald-400' : 'text-slate-400'} />
              <span>SQUADS</span>
              {pendingInvites.length > 0 ? (
                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black font-extrabold text-[8.5px] sm:text-[9px] animate-soft-badge-glow shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                  {pendingInvites.length}!
                </span>
              ) : effectiveSquads.length > 0 ? (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[8.5px] sm:text-[9px] font-mono">
                  {effectiveSquads.length}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => handleSelectView('roster')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                activeView === 'roster'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users size={11} className={activeView === 'roster' ? 'text-cyan-400' : 'text-slate-400'} />
              <span className="hidden sm:inline">OPERATORS</span>
              <span className="sm:hidden">ROSTER</span>
              {onlineOperators.length > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[8.5px] sm:text-[9px] font-mono">
                  {onlineOperators.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectView('community')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                activeView === 'community'
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Globe size={11} className={activeView === 'community' ? 'text-purple-400' : 'text-slate-400'} />
              <span className="hidden xs:inline">COMMUNITY</span>
              <span className="xs:hidden">NET</span>
            </button>
          </div>
        </div>

        {/* Right: Contextual Controls & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Active Context Label (large screens only) */}
          {activeView === 'comms' && activeChannel && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
              <span className="text-slate-500">FREQ:</span>
              <span className="text-amber-300 font-bold truncate max-w-[130px]">
                {activeChannel.displayName || `#${activeChannel.name}`}
              </span>
              {activeChannel.isPublic === false && (
                <Lock size={10} className="text-amber-400" />
              )}
            </div>
          )}

          {activeView === 'teams' && activeGroup && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
              <span className="text-slate-500">SQUAD:</span>
              <span className="text-emerald-300 font-bold truncate max-w-[130px]">
                {activeGroup.name}
              </span>
              <button
                type="button"
                onClick={handleCopySquadLink}
                className="text-slate-400 hover:text-emerald-300 p-0.5 transition-colors cursor-pointer"
                title="Copy squad invite link"
              >
                {copiedLink ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              </button>
            </div>
          )}

          {/* Comms Mobile Switcher Toggle (< md screens) */}
          {activeView === 'comms' && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1000, 0.02);
                setCommsMobileView(prev => prev === 'sidebar' ? 'chat' : 'sidebar');
              }}
              className="md:hidden px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-amber-300 font-bold text-[10px] sm:text-[10.5px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Toggle between channels directory and message thread"
            >
              <Radio size={11} />
              <span>{commsMobileView === 'sidebar' ? 'CHAT' : 'FREQS'}</span>
            </button>
          )}

          {/* Quick Creation Triggers */}
          {activeView === 'comms' && (
            <button
              type="button"
              onClick={() => setIsCreateChannelModalOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              title="Create New Channel"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">NEW CHANNEL</span>
            </button>
          )}

          {(activeView === 'squads' || activeView === 'teams') && (
            <button
              type="button"
              onClick={() => setIsCreateSquadModalOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              title="Create New Squad"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">NEW SQUAD</span>
            </button>
          )}

          {/* Station Guide */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.02);
              setIsGuideModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
            title="Open Network Operations Guide"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </header>

      {/* ── High-Visibility Pending Squad Commission Alert Banner ── */}
      {pendingInvites && pendingInvites.length > 0 && (
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-950 via-[#0a1820] to-slate-950 border-b border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono shrink-0 shadow-lg z-10 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
              <Shield size={14} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-emerald-300 uppercase tracking-wide text-[10.5px] sm:text-[11px]">
                  COMMISSION:
                </span>
                <span className="text-white font-bold truncate max-w-[160px] sm:max-w-none">
                  "{pendingInvites[0].groupName || pendingInvites[0].squadName}"
                </span>
                <span className="text-slate-400 text-[10px] hidden xs:inline">
                  from @{pendingInvites[0].fromUserHandle || 'Operator'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => openInviteConfirmation(pendingInvites[0])}
              className="px-2.5 sm:px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] sm:text-xs shadow-sm cursor-pointer transition-colors"
            >
              REVIEW
            </button>
            <button
              type="button"
              onClick={() => declineInvite(pendingInvites[0].id)}
              className="px-2 sm:px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg text-[11px] sm:text-xs cursor-pointer transition-colors"
            >
              DECLINE
            </button>
          </div>
        </div>
      )}

      {/* ── Consolidated Workstation Body ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* VIEW 1: COMMLINK RELAY */}
        {activeView === 'comms' && (
          <div className="flex-1 flex min-h-0 h-full overflow-hidden">
            <CommsPage
              hideHeader={true}
              onSwitchToTeams={() => handleSelectView('squads')}
              mobileViewOverride={commsMobileView}
              setMobileViewOverride={setCommsMobileView}
            />
          </div>
        )}

        {/* VIEW 2: TACTICAL SQUADS & FIRETEAMS */}
        {(activeView === 'squads' || activeView === 'teams') && (
          <div className="flex-1 flex min-h-0 h-full overflow-hidden">
            <SquadsPage
              hideHeader={true}
              onSwitchToComms={() => handleSelectView('comms')}
            />
          </div>
        )}

        {/* VIEW 3: LIVE OPERATOR & PERSONA DIRECTORY */}
        {activeView === 'roster' && (
          <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden bg-[#090d16]">
            <NetworkRosterView />
          </div>
        )}

        {/* VIEW 4: COMMUNITY NETWORKING (LFS & LFP) */}
        {activeView === 'community' && (
          <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden bg-[#070b13]">
            <CommunityNetworkingView
              onNavigateToSquad={(squadId) => {
                (selectSquad || selectGroup)?.(squadId);
                handleSelectView('squads');
              }}
            />
          </div>
        )}
      </div>

      {/* ── Modals & Overlays ── */}
      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={() => setIsCreateChannelModalOpen(false)}
      />

      <CreateSquadModal
        isOpen={isCreateSquadModalOpen}
        onClose={() => setIsCreateSquadModalOpen(false)}
      />

      {reviewingInvite && (
        <SquadInviteConfirmationModal
          isOpen={!!reviewingInvite}
          onClose={closeInviteConfirmation}
          invite={reviewingInvite}
        />
      )}

      <ComprehensiveUserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        initialTab={(activeView === 'squads' || activeView === 'teams') ? 'squads' : 'comms'}
      />
    </div>
  );
};

export default NetworkPage;
