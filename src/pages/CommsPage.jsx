import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Radio, 
  Hash, 
  MessageSquare, 
  Users, 
  Lock, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Plus, 
  ShieldAlert, 
  Activity,
  Sparkles,
  Map,
  Shield,
  Settings,
  UserPlus,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useGroup } from '../context/GroupContext';
import { CommsNavRail } from '../components/Chat/CommsNavRail';
import { ChannelSidebar } from '../components/Chat/ChannelSidebar';
import { NetworkRosterView } from '../components/Chat/NetworkRosterView';
import { SquadSummarySidebar } from '../components/Chat/SquadSummarySidebar';
import { PersonaAuditLogSidebar } from '../components/Chat/PersonaAuditLogSidebar';
import { CommsVttPanel } from '../components/Chat/CommsVttPanel';
import { MessageView } from '../components/Chat/MessageView';
import { MessageInput } from '../components/Chat/MessageInput';
import { ArchitectDocketBlock } from '../components/Chat/ArchitectDocketBlock';
import { CreateChannelModal } from '../components/Chat/CreateChannelModal';
import { GameGroupModal } from '../components/Groups/GameGroupModal';
import { TeamInviteConfirmationModal } from '../components/Groups/TeamInviteConfirmationModal';
import { AudioService } from '../services/audioService';

export const CommsPage = ({
  hideHeader = false,
  onSwitchToTeams,
  mobileViewOverride,
  setMobileViewOverride
}) => {
  const { 
    activeChannel, 
    messages, 
    loadingMessages, 
    activeNavTab, 
    setActiveNavTab,
    onlineOperators,
    totalUnreadCount = 0
  } = useChat() || {};

  const { currentUser, openAuthModal } = useAuth() || {};
  const currentUserId = currentUser?.uid || 'guest';

  const {
    groups = [],
    pendingInvites = [],
    reviewingInvite,
    openInviteConfirmation,
    closeInviteConfirmation,
    declineInvite,
    subscribeToArchitectBlocks
  } = useGroup() || {};

  const matchedGroup = useMemo(() => {
    return (groups || []).find(g => 
      (g.id && activeChannel?.groupId && g.id === activeChannel.groupId) || 
      (g.channelId && g.channelId === activeChannel?.id) ||
      (g.name && activeChannel?.name && g.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') === activeChannel.name.toLowerCase()) ||
      (g.name && activeChannel?.displayName && activeChannel.displayName.toLowerCase().includes(g.name.toLowerCase()))
    );
  }, [groups, activeChannel]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Tactical Docket is collapsed by default across all frequencies and devices
  const [showDocket, setShowDocket] = useState(false);
  const [internalMobileView, setInternalMobileView] = useState('chat'); // 'sidebar' | 'chat'
  const mobileView = mobileViewOverride !== undefined ? mobileViewOverride : internalMobileView;
  const setMobileView = setMobileViewOverride || setInternalMobileView;

  // Unchecked Docket Intel tracking per operative & frequency
  const targetDocketId = activeChannel?.id || (matchedGroup?.id ? `group_chan_${matchedGroup.id}` : null);
  const docketStorageKey = targetDocketId ? `tangent_docket_checked_${currentUserId}_${targetDocketId}` : null;

  const [docketBlocks, setDocketBlocks] = useState([]);
  const [lastCheckedTime, setLastCheckedTime] = useState(() => {
    if (typeof window === 'undefined' || !docketStorageKey) return 0;
    try {
      const stored = localStorage.getItem(docketStorageKey);
      return stored ? Number(stored) || 0 : 0;
    } catch (e) {
      return 0;
    }
  });

  // Sync lastCheckedTime whenever active frequency or operative changes
  useEffect(() => {
    if (!docketStorageKey || typeof window === 'undefined') {
      setLastCheckedTime(0);
      return;
    }
    try {
      const stored = localStorage.getItem(docketStorageKey);
      setLastCheckedTime(stored ? Number(stored) || 0 : 0);
    } catch (e) {
      setLastCheckedTime(0);
    }
  }, [docketStorageKey]);

  // Subscribe to real-time architect directives & image handouts
  useEffect(() => {
    if (!targetDocketId || !subscribeToArchitectBlocks) {
      setDocketBlocks([]);
      return;
    }

    const unsub = subscribeToArchitectBlocks(
      { channelId: activeChannel?.id, groupId: matchedGroup?.id || activeChannel?.groupId },
      (blockList) => {
        setDocketBlocks(Array.isArray(blockList) ? blockList : []);
      }
    );

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [targetDocketId, activeChannel?.id, activeChannel?.groupId, matchedGroup?.id, subscribeToArchitectBlocks]);

  // Determine unchecked items and pulsing alert status
  const { uncheckedCount, hasUncheckedDocket } = useMemo(() => {
    if (!docketBlocks || docketBlocks.length === 0) {
      return { uncheckedCount: 0, hasUncheckedDocket: false };
    }
    if (showDocket) {
      return { uncheckedCount: 0, hasUncheckedDocket: false };
    }
    // If the operative has never opened the docket on this frequency
    if (!lastCheckedTime) {
      return { uncheckedCount: docketBlocks.length, hasUncheckedDocket: true };
    }
    // Any block created after the operative's last checked timestamp
    const unviewed = docketBlocks.filter(b => {
      if (!b?.createdAt) return false;
      const blockTime = new Date(b.createdAt).getTime();
      return blockTime > lastCheckedTime;
    });

    return {
      uncheckedCount: unviewed.length,
      hasUncheckedDocket: unviewed.length > 0
    };
  }, [docketBlocks, showDocket, lastCheckedTime]);

  const markDocketChecked = useCallback(() => {
    const now = Date.now();
    setLastCheckedTime(now);
    if (docketStorageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(docketStorageKey, String(now));
      } catch (e) {}
    }
  }, [docketStorageKey]);

  const handleToggleDocket = useCallback(() => {
    AudioService.playTerminalBeep(1100, 0.02);
    setShowDocket(prev => {
      const next = !prev;
      if (next) {
        markDocketChecked();
      }
      return next;
    });
  }, [markDocketChecked]);

  // Automatically mark checked if docket opens
  useEffect(() => {
    if (showDocket && hasUncheckedDocket) {
      markDocketChecked();
    }
  }, [showDocket, hasUncheckedDocket, markDocketChecked]);

  return (
    <div className="h-full w-full flex flex-col bg-[#080c14] text-slate-100 font-sans overflow-hidden select-none">
      {/* ── Top Station Status & Breadcrumb Header ── */}
      {!hideHeader && (
        <header className="px-3 sm:px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile View Toggle */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setMobileView(prev => prev === 'sidebar' ? 'chat' : 'sidebar');
            }}
            className="md:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 flex items-center gap-1.5 text-[11px] font-bold"
          >
            <Radio size={13} />
            <span>{mobileView === 'sidebar' ? 'VIEW CHAT' : 'FREQUENCIES'}</span>
          </button>

          <div className="flex items-center gap-2 text-slate-400 min-w-0">
            <span className="text-cyan-400 font-bold uppercase tracking-wider hidden sm:inline">
              COMMLINK RELAY
            </span>
            <span className="hidden sm:inline text-slate-600">/</span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold truncate">
              {activeChannel?.displayName || `#${activeChannel?.name || 'holonet'}`}
            </span>
            {activeChannel?.isPublic === false && (
              <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                <Lock size={9} />
                <span>SECURE</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Status Indicators */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono shrink-0">
          <div className="flex items-center gap-1.5">
            {currentUser ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-soft-badge-glow shadow-[0_0_6px_#10b981]" />
                <span className="text-emerald-300 font-bold hidden sm:inline">RELAY ONLINE</span>
                <span className="text-slate-500 text-[10px] hidden lg:inline">({onlineOperators.length} Active Operators)</span>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                <span className="text-amber-300 font-bold hidden sm:inline">GUEST (READ-ONLY)</span>
                <button
                  type="button"
                  onClick={() => openAuthModal?.()}
                  className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold cursor-pointer transition-colors"
                >
                  SIGN IN
                </button>
              </div>
            )}
          </div>
          <span className="hidden md:inline text-slate-700">|</span>
          <span className="hidden md:inline text-slate-500 text-[10px]">ENCRYPTION: AES-256</span>
        </div>
      </header>
      )}

      {/* ── High-Visibility Pending Squad Commission Alert Banner ── */}
      {!hideHeader && pendingInvites && pendingInvites.length > 0 && (
        <div className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-950 via-[#0a161f] to-slate-950 border-b border-emerald-500/50 flex items-center justify-between gap-3 text-xs font-mono shrink-0 shadow-lg z-10 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
              <Shield size={14} className="animate-soft-badge-glow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-300 uppercase tracking-wide text-[11px]">
                  TACTICAL SQUAD COMMISSION:
                </span>
                <span className="text-white font-bold truncate">
                  "{pendingInvites[0].groupName}"
                </span>
                <span className="text-slate-400 text-[10.5px] hidden sm:inline">
                  from @{pendingInvites[0].fromUserHandle || 'Operator'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openInviteConfirmation(pendingInvites[0])}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer transition-colors"
            >
              REVIEW & ACCEPT
            </button>
            <button
              type="button"
              onClick={() => declineInvite(pendingInvites[0].id)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg text-xs cursor-pointer transition-colors"
            >
              DECLINE
            </button>
          </div>
        </div>
      )}

      {/* ── Main Console Workstation ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* 1. Left Navigation Rail (Hidden on mobile to eliminate page crunch) */}
        <div className="hidden md:flex h-full shrink-0">
          <CommsNavRail
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenSquadModal={() => (onSwitchToTeams ? onSwitchToTeams() : setIsTeamModalOpen(true))}
            onOpenTeamModal={() => (onSwitchToTeams ? onSwitchToTeams() : setIsTeamModalOpen(true))}
          />
        </div>

        {/* 2. Secondary Sub-Panel based on Active Nav Rail Tab */}
        <div className={`w-full md:w-80 lg:w-96 shrink-0 h-full flex flex-col min-w-0 ${
          mobileView === 'sidebar' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Mobile Secondary Switcher Strip (< md screens) */}
          <div className="md:hidden bg-slate-950/95 border-b border-slate-800/90 px-2 py-1.5 flex items-center justify-between gap-1.5 shrink-0 font-mono text-xs z-10">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0">
              {[
                { id: 'matrix', label: 'CHANNELS', icon: Radio, count: totalUnreadCount },
                { id: 'vtt', label: 'STAGE', icon: Map, badge: 'VTT' },
                { id: 'logs', label: 'AUDIT', icon: Activity },
                { id: 'settings', label: 'CONFIG', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeNavTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1150, 0.02);
                      setActiveNavTab(tab.id);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon size={12} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="px-1 py-0.2 rounded-full bg-amber-400 text-black text-[8.5px] font-extrabold animate-soft-badge-glow">
                        {tab.count}
                      </span>
                    )}
                    {tab.badge && !tab.count && (
                      <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900 transition-colors cursor-pointer"
                title="Create New Channel"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Panel Body */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {activeNavTab === 'matrix' && (
              <ChannelSidebar
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onOpenSquadModal={() => (onSwitchToTeams ? onSwitchToTeams() : setIsTeamModalOpen(true))}
                onOpenTeamModal={() => (onSwitchToTeams ? onSwitchToTeams() : setIsTeamModalOpen(true))}
                onSwitchToTeams={onSwitchToTeams}
                onSelectChannel={() => setMobileView('chat')}
              />
            )}

            {activeNavTab === 'roster' && (
              <NetworkRosterView />
            )}

            {activeNavTab === 'teams' && (
              <SquadSummarySidebar
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onOpenSquadModal={() => setIsTeamModalOpen(true)}
                onSwitchToTeams={onSwitchToTeams}
              />
            )}

            {activeNavTab === 'vtt' && (
              <CommsVttPanel />
            )}

            {activeNavTab === 'logs' && (
              <PersonaAuditLogSidebar />
            )}

            {activeNavTab === 'settings' && (
              <div className="h-full flex flex-col bg-[#0b1019] text-slate-100 p-4 space-y-4 font-mono text-xs border-r border-slate-800 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings size={14} className="text-cyan-400" />
                    <span>STATION PREFERENCES</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-200 block">AUDIO SYNTHESIS FEEDBACK</span>
                    <p className="text-slate-400 text-[10.5px]">
                      Terminal keyclicks, transmission alerts, and tactical dice roll chimes.
                    </p>
                    <button
                      type="button"
                      onClick={() => AudioService.playTerminalBeep(1400, 0.05)}
                      className="px-2.5 py-1 bg-cyan-950 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 rounded text-[10px] font-bold cursor-pointer"
                    >
                      TEST TERMINAL CHIRP
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-200 block">VTT STAGE STREAMING</span>
                    <p className="text-slate-400 text-[10.5px]">
                      Real-time synchronization between HoloNet chat messages, dice rolls, and the VTT Master Viewport.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-200 block">PRESENCE HEARTBEAT</span>
                    <p className="text-slate-400 text-[10.5px]">
                      Automatic telemetry beacon updates your status and active persona across the network.
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9.5px] font-bold">
                      HEARTBEAT ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Center Message Thread & Composer */}
        <div className={`flex-1 flex flex-col h-full min-w-0 bg-[#0a0e17] ${
          mobileView === 'chat' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Top Bar with Docket Toggle Button & Mobile Back to Channels */}
          <div className="px-3 sm:px-4 py-2 bg-slate-950/85 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono shrink-0 gap-2.5 min-h-[46px]">
            <div className="flex items-center gap-2 text-slate-400 min-w-0 flex-1">
              {/* Mobile Back Button to Channels */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1000, 0.02);
                  setMobileView('sidebar');
                }}
                className="md:hidden flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 font-bold text-[10.5px] shrink-0 transition-colors cursor-pointer"
                title="Back to Channels list"
              >
                <ChevronLeft size={13} />
                <span>FREQS</span>
              </button>

              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide truncate">
                {activeChannel?.displayName || `#${activeChannel?.name || 'holonet'}`}
              </span>
              {activeChannel?.topic && (
                <span className="text-[10px] text-slate-500 truncate hidden lg:inline">
                  • {activeChannel.topic}
                </span>
              )}
              {activeChannel?.isPublic === false && (
                <Lock size={10} className="text-amber-400 shrink-0" />
              )}
            </div>

            {/* Larger Architect Tactical Docket Expand/Collapse Button with Unchecked Pulse */}
            <button
              type="button"
              onClick={handleToggleDocket}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 border select-none active:scale-[0.98] ${
                hasUncheckedDocket
                  ? 'animate-nav-pulse-amber bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 border-amber-500/80 shadow-[0_0_18px_rgba(245,158,11,0.45)]'
                  : showDocket
                  ? 'bg-rose-950/90 hover:bg-rose-900/80 text-rose-200 border-rose-400/80 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                  : 'bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 hover:text-rose-100 border-rose-500/50 hover:border-rose-400/80 hover:shadow-[0_0_12px_rgba(244,63,94,0.25)]'
              }`}
              title={
                hasUncheckedDocket
                  ? `Tactical Docket has ${uncheckedCount} unchecked item(s). Click to expand.`
                  : showDocket
                  ? "Collapse Architect Tactical Docket"
                  : "Expand Architect Tactical Docket"
              }
            >
              {hasUncheckedDocket ? (
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                </span>
              ) : null}

              <BookOpen
                size={16}
                className={`shrink-0 transition-colors ${
                  hasUncheckedDocket
                    ? 'text-amber-300'
                    : showDocket
                    ? 'text-rose-300'
                    : 'text-rose-400'
                }`}
              />

              <span className="tracking-wider uppercase">
                <span className="hidden sm:inline">
                  {showDocket ? 'COLLAPSE DOCKET' : 'TACTICAL DOCKET'}
                </span>
                <span className="sm:hidden">
                  {showDocket ? 'COLLAPSE' : 'DOCKET'}
                </span>
              </span>

              {hasUncheckedDocket ? (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[9.5px] font-black tracking-normal shadow-sm animate-soft-badge-glow shrink-0">
                  <span className="hidden sm:inline">{uncheckedCount} NEW</span>
                  <span className="sm:hidden">{uncheckedCount}</span>
                </span>
              ) : docketBlocks.length > 0 ? (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold border shrink-0 ${
                    showDocket
                      ? 'bg-rose-900/80 text-rose-200 border-rose-500/50'
                      : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {docketBlocks.length}
                </span>
              ) : null}

              {showDocket ? (
                <ChevronDown size={15} className="text-rose-300 shrink-0" />
              ) : (
                <ChevronRight
                  size={15}
                  className={`shrink-0 ${hasUncheckedDocket ? 'text-amber-300' : 'text-rose-400'}`}
                />
              )}
            </button>
          </div>

          <MessageView
            messages={messages}
            loading={loadingMessages}
            activeChannel={activeChannel}
          />
          <MessageInput />
        </div>

        {/* 4. Architect Tactical Docket Block (Beside Main Chat Area on Desktop, Drawer on Mobile) */}
        {showDocket && (
          <>
            {/* Mobile Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => setShowDocket(false)}
            />
            <div className="fixed inset-y-0 right-0 z-50 lg:static flex h-full max-w-[90vw] sm:max-w-sm w-full lg:w-auto shrink-0 shadow-2xl lg:shadow-none animate-in slide-in-from-right duration-200">
              <ArchitectDocketBlock
                channel={activeChannel}
                group={matchedGroup}
                blocks={docketBlocks}
                onClose={() => setShowDocket(false)}
              />
            </div>
          </>
        )}
      </div>

      {/* Creation & DM Modal */}
      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Game Teams & Parties Builder Modal */}
      {isTeamModalOpen && (
        <GameGroupModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          initialTab="roster"
        />
      )}

      {/* Review & Accept Pending Team Invite Modal */}
      {reviewingInvite && (
        <TeamInviteConfirmationModal
          isOpen={!!reviewingInvite}
          onClose={closeInviteConfirmation}
          invite={reviewingInvite}
        />
      )}
    </div>
  );
};

export default CommsPage;
