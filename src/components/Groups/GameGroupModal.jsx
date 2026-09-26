import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Users, 
  Shield, 
  Radio, 
  UserPlus, 
  Settings, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useStory } from '../../context/CampaignContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { AudioService } from '../../services/audioService';

import { SquadRosterTab } from './tabs/SquadRosterTab';
import { SquadInvitesTab } from './tabs/SquadInvitesTab';
import { SquadCommsTab } from './tabs/SquadCommsTab';
import { SquadSettingsTab } from './tabs/SquadSettingsTab';

/**
 * @component GameGroupModal
 * @description In-situ modal workstation for tactical squad management.
 * Primarily utilized during active VTT sessions, Hub navigation, or docked overlays.
 * Composed from the modular Squad tabs to ensure parity with /teams.
 */
export const GameGroupModal = ({ isOpen, onClose, initialTab = 'roster' }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useConfirm();

  const { 
    activeGroup, 
    sendInvite, 
    pendingInvites = [],
    outgoingInvites = [],
    revokeInvite,
    kickMember,
    updateMemberRole,
    leaveGroup, 
    deleteGroup, 
    updateGroup,
    openInviteConfirmation
  } = useGroup() || {};

  const { 
    userDirectory = [], 
    refreshUserDirectory, 
    selectChannel, 
    activeChannelId 
  } = useChat() || {};

  const { currentUser } = useAuth() || {};
  const { storyCatalog = [] } = useStory() || {};

  const [activeTab, setActiveTab] = useState(initialTab);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showEnlargedQr, setShowEnlargedQr] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [inviteStatusMap, setInviteStatusMap] = useState({});

  useEffect(() => {
    if (isOpen) {
      refreshUserDirectory?.();
      if (activeGroup?.channelId && activeChannelId !== activeGroup.channelId && activeTab === 'comms') {
        selectChannel(activeGroup.channelId);
      }
    }
  }, [isOpen, activeGroup, activeChannelId, activeTab, refreshUserDirectory, selectChannel]);

  if (!isOpen) return null;

  const isUserGM = activeGroup?.creatorId === currentUser?.uid || 
    activeGroup?.members?.find(m => m.userId === currentUser?.uid)?.role === 'GM' ||
    activeGroup?.members?.find(m => m.userId === currentUser?.uid)?.role === 'Leader';

  const handleCopyLink = () => {
    if (!activeGroup?.inviteCode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/teams?join=${activeGroup.inviteCode}`;
    navigator.clipboard.writeText(shareUrl);
    AudioService.playTerminalBeep(1250, 0.03);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!activeGroup?.inviteCode) return;
    navigator.clipboard.writeText(activeGroup.inviteCode);
    AudioService.playTerminalBeep(1250, 0.03);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendInvite = async (targetUser) => {
    if (!activeGroup || !currentUser) return;
    try {
      setInviteStatusMap(prev => ({ ...prev, [targetUser.uid]: 'sending' }));
      await sendInvite(activeGroup.id, targetUser);
      AudioService.playTerminalBeep(1300, 0.03);
      setInviteStatusMap(prev => ({ ...prev, [targetUser.uid]: 'sent' }));
    } catch (err) {
      console.error('Send invite error:', err);
      setInviteStatusMap(prev => ({ ...prev, [targetUser.uid]: 'error' }));
    }
  };

  const filteredUserDirectory = userDirectory.filter(u => {
    if (!userSearchQuery.trim()) return true;
    const query = userSearchQuery.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(query)) ||
      (u.handle && u.handle.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query))
    );
  });

  const tabs = [
    { id: 'roster', label: 'ROSTER', icon: Users },
    { id: 'invites', label: 'INVITES', icon: UserPlus },
    { id: 'comms', label: 'COMMS', icon: Radio },
    { id: 'settings', label: 'SETTINGS', icon: Settings }
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fade-in select-none font-sans">
      <div className="bg-[#0b0f17] border border-cyan-500/40 rounded-2xl w-full max-w-4xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col h-[85vh] max-h-[85vh]">
        
        {/* Top Header Banner */}
        <div className="px-4 py-3 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shrink-0">
              <Shield size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-mono font-bold tracking-wider text-slate-100 uppercase truncate">
                  {activeGroup ? activeGroup.name : 'TACTICAL SQUADS'}
                </h2>
                {activeGroup && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold border uppercase bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shrink-0">
                    {activeGroup.status || 'Active'}
                  </span>
                )}
              </div>
              <span className="text-[10.5px] font-mono text-slate-400 block truncate">
                {activeGroup ? `${activeGroup.members?.length || 0} Operators Commissioned` : 'No Active Squad Selected'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1150, 0.02);
                onClose();
                navigate('/teams');
              }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Open full dedicated workstation (/teams)"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">FULL PAGE</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-800 bg-[#070a12] shrink-0 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.015);
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#090d16]">
          {activeTab === 'roster' && (
            <SquadRosterTab
              activeGroup={activeGroup}
              currentUser={currentUser}
              isUserGM={isUserGM}
              copiedLink={copiedLink}
              handleCopyLink={handleCopyLink}
              showEnlargedQr={showEnlargedQr}
              setShowEnlargedQr={setShowEnlargedQr}
              confirm={confirm}
              toast={toast}
              kickMember={kickMember}
              updateMemberRole={updateMemberRole}
              setIsCreateModalOpen={() => {
                onClose();
                navigate('/teams?action=new');
              }}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'invites' && (
            <SquadInvitesTab
              activeGroup={activeGroup}
              copiedCode={copiedCode}
              handleCopyCode={handleCopyCode}
              copiedLink={copiedLink}
              handleCopyLink={handleCopyLink}
              userSearchQuery={userSearchQuery}
              setUserSearchQuery={setUserSearchQuery}
              filteredUserDirectory={filteredUserDirectory}
              currentUser={currentUser}
              inviteStatusMap={inviteStatusMap}
              handleSendInvite={handleSendInvite}
              pendingInvites={pendingInvites}
              outgoingInvites={outgoingInvites}
              openInviteConfirmation={openInviteConfirmation}
              acceptInvite={useGroup()?.acceptInvite}
              declineInvite={useGroup()?.declineInvite}
              revokeInvite={revokeInvite}
            />
          )}

          {activeTab === 'comms' && (
            <SquadCommsTab
              activeGroup={activeGroup}
              navigate={(path) => {
                onClose();
                navigate(path);
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SquadSettingsTab
              activeGroup={activeGroup}
              isUserGM={isUserGM}
              updateGroup={updateGroup}
              deleteGroup={async (id) => {
                await deleteGroup(id);
                onClose();
              }}
              leaveGroup={async (id) => {
                await leaveGroup(id);
                onClose();
              }}
              storyCatalog={storyCatalog}
              confirm={confirm}
              toast={toast}
            />
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default GameGroupModal;
