import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Radio, 
  Lock, 
  Plus, 
  Activity,
  Map,
  Shield,
  Settings
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
import { NetworkInspectorDrawer } from '../components/Network/NetworkInspectorDrawer';
import { CreateChannelModal } from '../components/Chat/CreateChannelModal';
import { GameGroupModal } from '../components/Groups/GameGroupModal';
import { TeamInviteConfirmationModal } from '../components/Groups/TeamInviteConfirmationModal';
import { QuickTeamInviteModal } from '../components/Chat/QuickTeamInviteModal';
import { AudioService } from '../services/audioService';

export const CommsPage = ({
  hideHeader = false,
  hideLeftRail = false,
  serverContext = 'holonet',
  activeStageMode = 'comms',
  activeSquadTab = 'roster',
  onSelectSquadCommandTab,
  onReturnToCommsStream,
  onSwitchToTeams,
  mobileViewOverride,
  setMobileViewOverride,
  renderStageOverride = null
}) => {
  const { 
    activeChannel, 
    messages, 
    loadingMessages, 
    activeNavTab, 
    setActiveNavTab,
    onlineOperators = [],
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
  const [inviteTargetUser, setInviteTargetUser] = useState(null);

  // Unified Zone 4 Contextual Inspector Tab ('roster' | 'docket' | 'vtt' | 'audit' | null)
  const [inspectorTab, setInspectorTab] = useState(null);

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

  const { uncheckedCount } = useMemo(() => {
    if (!docketBlocks || docketBlocks.length === 0 || inspectorTab === 'docket') {
      return { uncheckedCount: 0 };
    }
    if (!lastCheckedTime) {
      return { uncheckedCount: docketBlocks.length };
    }
    const unviewed = docketBlocks.filter(b => {
      if (!b?.createdAt) return false;
      const blockTime = new Date(b.createdAt).getTime();
      return blockTime > lastCheckedTime;
    });

    return { uncheckedCount: unviewed.length };
  }, [docketBlocks, inspectorTab, lastCheckedTime]);

  const markDocketChecked = useCallback(() => {
    const now = Date.now();
    setLastCheckedTime(now);
    if (docketStorageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(docketStorageKey, String(now));
      } catch (e) {}
    }
  }, [docketStorageKey]);

  const handleToggleInspectorTab = useCallback((tabId) => {
    setInspectorTab(prev => {
      const next = prev === tabId ? null : tabId;
      if (next === 'docket') {
        markDocketChecked();
      }
      return next;
    });
  }, [markDocketChecked]);

  return (
    <div className="h-full w-full flex flex-col bg-[#080c14] text-slate-100 font-sans overflow-hidden select-none">
      {/* ── Standalone Top Station Header (Only shown when mounted directly outside NetworkPage) ── */}
      {!hideHeader && (
        <header className="px-3 sm:px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2 min-w-0">
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
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-soft-badge-glow shadow-[0_0_6px_#10b981]" />
                <span className="text-emerald-300 font-bold hidden sm:inline">RELAY ONLINE</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal?.()}
                className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold cursor-pointer transition-colors"
              >
                SIGN IN
              </button>
            )}
          </div>
        </header>
      )}

      {/* ── Main Console Workstation (Zone 2 + Zone 3 + Zone 4) ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Optional Standalone CommsNavRail (Hidden when unified NetworkServerRail is active) */}
        {!hideLeftRail && (
          <div className="hidden md:flex h-full shrink-0">
            <CommsNavRail
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenSquadModal={() => (onSwitchToTeams ? onSwitchToTeams() : setIsTeamModalOpen(true))}
              onOpenTeamModal={() => (onSwitchToTeams ? onSwitchToTeams() : setIsTeamModalOpen(true))}
            />
          </div>
        )}

        {/* ZONE 2: Left Contextual Command & Frequency Tree Sidebar */}
        <div className={`w-full md:w-72 lg:w-80 shrink-0 h-full flex flex-col min-w-0 ${
          mobileView === 'sidebar' ? 'flex' : 'hidden md:flex'
        }`}>
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <ChannelSidebar
              serverContext={serverContext}
              activeStageMode={activeStageMode}
              activeSquadTab={activeSquadTab}
              onSelectSquadCommandTab={(tabId) => {
                onSelectSquadCommandTab?.(tabId);
                setMobileView('chat');
              }}
              onReturnToCommsStream={() => {
                onReturnToCommsStream?.();
                setMobileView('chat');
              }}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenSquadModal={() => (onSwitchToTeams ? onSwitchToTeams() : setIsTeamModalOpen(true))}
              onOpenTeamModal={() => (onSwitchToTeams ? onSwitchToTeams() : setIsTeamModalOpen(true))}
              onSwitchToTeams={onSwitchToTeams}
              onSelectChannel={() => {
                onReturnToCommsStream?.();
                setMobileView('chat');
              }}
            />
          </div>
        </div>

        {/* ZONE 3: Primary Stage Viewport (Center Message Stream OR Active Squad Command View) */}
        <div className={`flex-1 flex flex-col h-full min-w-0 bg-[#0a0e17] ${
          mobileView === 'chat' ? 'flex' : 'hidden md:flex'
        }`}>
          {renderStageOverride ? (
            renderStageOverride
          ) : (
            <>
              <MessageView
                messages={messages}
                loading={loadingMessages}
                activeChannel={activeChannel}
                activeInspectorTab={inspectorTab}
                onToggleInspectorTab={handleToggleInspectorTab}
                docketBlocksCount={docketBlocks.length}
                uncheckedDocketCount={uncheckedCount}
                onBackToSidebar={() => setMobileView('sidebar')}
              />
              <MessageInput />
            </>
          )}
        </div>

        {/* ZONE 4: Single Unified Right Contextual Inspector Drawer */}
        <NetworkInspectorDrawer
          activeTab={inspectorTab}
          onSelectTab={handleToggleInspectorTab}
          onClose={() => setInspectorTab(null)}
          activeChannel={activeChannel}
          matchedGroup={matchedGroup}
          docketBlocks={docketBlocks}
          uncheckedDocketCount={uncheckedCount}
          onInviteUser={(op) => setInviteTargetUser(op)}
        />
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

      {/* Quick Squad Invite Modal from Inspector */}
      {inviteTargetUser && (
        <QuickTeamInviteModal
          isOpen={!!inviteTargetUser}
          onClose={() => setInviteTargetUser(null)}
          defaultGroupId={matchedGroup?.id}
          preselectedUser={inviteTargetUser}
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
