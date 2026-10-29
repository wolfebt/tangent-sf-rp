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
import { ChannelSidebar } from '../components/Chat/ChannelSidebar';
import { MessageView } from '../components/Chat/MessageView';
import { MessageInput } from '../components/Chat/MessageInput';
import { NetworkInspectorDrawer } from '../components/Network/NetworkInspectorDrawer';
import { CreateChannelModal } from '../components/Chat/CreateChannelModal';
import { GameGroupModal } from '../components/Squads/SquadModal';
import { QuickTeamInviteModal } from '../components/Chat/QuickTeamInviteModal';
import { AudioService } from '../services/audioService';

export const CommsPage = ({
  hideHeader = false,
  hideLeftRail = false,
  serverContext = 'holonet',
  activeStageMode = 'comms',
  activeSquadTab = 'roster',
  activeSquadNavTab,
  onSelectSquadCommandTab,
  onSelectSquadNavTab,
  onReturnToCommsStream,
  onSwitchToTeams,
  onOpenCreateSquad,
  mobileViewOverride,
  setMobileViewOverride,
  renderStageOverride = null
}) => {
  const effectiveSquadTab = activeSquadNavTab || activeSquadTab || 'roster';
  const effectiveOnSelectSquadTab = onSelectSquadNavTab || onSelectSquadCommandTab;
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

  // Route STAGE ('vtt') and AUDIT ('logs') rail buttons directly to Zone 4 NetworkInspectorDrawer
  // instead of unmounting ChannelSidebar and TransceiverDeck in Zone 2
  useEffect(() => {
    if (activeNavTab === 'vtt') {
      setInspectorTab('vtt');
    } else if (activeNavTab === 'logs') {
      setInspectorTab('audit');
    } else if (activeNavTab === 'matrix') {
      setInspectorTab(prev => (prev === 'vtt' || prev === 'audit' ? null : prev));
    }
  }, [activeNavTab]);

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
      if (next === 'vtt') {
        setActiveNavTab?.('vtt');
      } else if (next === 'audit') {
        setActiveNavTab?.('logs');
      } else if (activeNavTab === 'vtt' || activeNavTab === 'logs') {
        setActiveNavTab?.('matrix');
      }
      return next;
    });
  }, [markDocketChecked, activeNavTab, setActiveNavTab]);

  const handleCloseInspector = useCallback(() => {
    setInspectorTab(null);
    if (activeNavTab === 'vtt' || activeNavTab === 'logs') {
      setActiveNavTab?.('matrix');
    }
  }, [activeNavTab, setActiveNavTab]);

  return (
    <div className="h-full w-full flex flex-col bg-[#080c14] text-slate-100 font-sans overflow-hidden select-none">
      {/* ── Main Console Workstation (Zone 2 + Zone 3 + Zone 4) ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* ZONE 2: Left Contextual Command & Frequency Tree Sidebar (Always preserves ChannelSidebar + TransceiverDeck) */}
        <div className={`w-full md:w-72 lg:w-80 shrink-0 h-full flex flex-col min-w-0 ${
          mobileView === 'sidebar' ? 'flex' : 'hidden md:flex'
        }`}>
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <ChannelSidebar
              serverContext={serverContext}
              activeStageMode={activeStageMode}
              activeSquadTab={effectiveSquadTab}
              onSelectSquadCommandTab={(tabId) => {
                effectiveOnSelectSquadTab?.(tabId);
                setMobileView('chat');
              }}
              onReturnToCommsStream={() => {
                onReturnToCommsStream?.();
                setMobileView('chat');
              }}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenCreateSquad={onOpenCreateSquad || (() => setIsTeamModalOpen(true))}
              onOpenSquadModal={() => (onOpenCreateSquad ? onOpenCreateSquad() : (onSwitchToTeams ? onSwitchToTeams() : setIsTeamModalOpen(true)))}
              onOpenTeamModal={() => (onOpenCreateSquad ? onOpenCreateSquad() : (onSwitchToTeams ? onSwitchToTeams() : setIsTeamModalOpen(true)))}
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
          onClose={handleCloseInspector}
          activeChannel={activeChannel}
          matchedGroup={matchedGroup}
          docketBlocks={docketBlocks}
          uncheckedDocketCount={uncheckedCount}
          onInviteUser={(op) => setInviteTargetUser(op)}
        />
      </div>

      {/* Creation & DM Modal */}
      {isCreateModalOpen && (
        <CreateChannelModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

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
    </div>
  );
};

export default CommsPage;
