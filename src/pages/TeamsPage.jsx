import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Crown, 
  Radio, 
  Map, 
  Plus, 
  Copy, 
  Check, 
  Search, 
  UserPlus, 
  Trash2, 
  LogOut, 
  ExternalLink, 
  QrCode, 
  Lock, 
  Globe, 
  Play, 
  Layers,
  Heart,
  Activity,
  Send,
  Sparkles,
  Settings,
  HelpCircle,
  Clock,
  ChevronRight,
  Compass
} from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useFolio } from '../context/FolioContext';
import { useStory } from '../context/CampaignContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { AudioService } from '../services/audioService';
import { TeamsNavRail } from '../components/Groups/TeamsNavRail';
import { CreateGroupModal } from '../components/Groups/CreateGroupModal';
import { ComprehensiveUserGuideModal } from '../components/UI/ComprehensiveUserGuideModal';
import ChatParser from '../components/UI/ChatParser';
import { SquadRosterTab } from '../components/Groups/tabs/SquadRosterTab';
import { SquadDirectoryTab } from '../components/Groups/tabs/SquadDirectoryTab';
import { SquadInvitesTab } from '../components/Groups/tabs/SquadInvitesTab';
import { SquadCommsTab } from '../components/Groups/tabs/SquadCommsTab';
import { SquadTacticalTab } from '../components/Groups/tabs/SquadTacticalTab';
import { SquadSettingsTab } from '../components/Groups/tabs/SquadSettingsTab';
import { TeamInviteConfirmationModal } from '../components/Groups/TeamInviteConfirmationModal';

/**
 * @file TeamsPage.jsx
 * @description Dedicated primary workstation for Game Teams & Tactical Squads.
 * Features a persistent TeamsNavRail, real-time squad roster, public directory,
 * invite command center with QR codes, tied-in encrypted tactical comms,
 * and direct one-click deployment into The Stage VTT.
 */
export const TeamsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'roster';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [showEnlargedQr, setShowEnlargedQr] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);

  // Directory & Search State
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState('all'); // 'all' | 'recruiting' | 'mine'

  // Invite Dispatch State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [inviteStatusMap, setInviteStatusMap] = useState({});

  // Contexts
  const { 
    groups = [], 
    activeGroup, 
    selectGroup, 
    joinByCode,
    sendInvite,
    pendingInvites = [],
    outgoingInvites = [],
    reviewingInvite,
    openInviteConfirmation,
    closeInviteConfirmation,
    acceptInvite,
    declineInvite,
    revokeInvite,
    kickMember,
    updateMemberRole,
    leaveGroup,
    deleteGroup,
    updateGroup
  } = useGroup() || {};

  const { 
    userDirectory = [], 
    refreshUserDirectory, 
    selectChannel, 
    messages = [], 
    sendMessage,
    activeChannelId 
  } = useChat() || {};

  const { currentUser, userHandle } = useAuth() || {};
  const { personaRoster = [], roster = [], activePersona } = useFolio() || {};
  const { storyCatalog = [] } = useStory() || {};

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['roster', 'directory', 'invites', 'comms', 'tactical', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Auto-connect tied-in group channel when comms tab is selected
  useEffect(() => {
    if (activeTab === 'comms' && activeGroup?.channelId && activeChannelId !== activeGroup.channelId) {
      selectChannel(activeGroup.channelId);
    }
  }, [activeTab, activeGroup?.channelId, activeChannelId, selectChannel]);

  // Check URL parameters for join code
  useEffect(() => {
    try {
      const code = searchParams.get('join');
      if (code) {
        setJoinCodeInput(code.toUpperCase());
        setActiveTab('invites');
      }
    } catch (e) {
      // Ignored
    }
  }, [searchParams]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleCopyCode = () => {
    if (!activeGroup?.inviteCode) return;
    navigator.clipboard.writeText(activeGroup.inviteCode);
    AudioService.playTerminalBeep(1250, 0.03);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!activeGroup?.inviteCode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/teams?join=${activeGroup.inviteCode}`;
    navigator.clipboard.writeText(shareUrl);
    AudioService.playTerminalBeep(1250, 0.03);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleJoinByCodeSubmit = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setJoinLoading(true);
    setJoinError(null);
    try {
      const joined = await joinByCode(joinCodeInput.trim());
      AudioService.playTerminalBeep(1500, 0.04);
      setJoinCodeInput('');
      if (joined) {
        selectGroup(joined.id);
        setActiveTab('roster');
      }
    } catch (err) {
      console.error('Join group failed:', err);
      setJoinError(err.message || 'Failed to join group with provided code.');
    } finally {
      setJoinLoading(false);
    }
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

  const isUserGM = activeGroup?.creatorId === currentUser?.uid || 
    activeGroup?.members?.find(m => m.userId === currentUser?.uid)?.role === 'GM' ||
    activeGroup?.members?.find(m => m.userId === currentUser?.uid)?.role === 'Leader';

  // Filter directory list
  const filteredDirectory = useMemo(() => {
    return groups.filter(g => {
      const matchesSearch = !directorySearch.trim() || 
        g.name?.toLowerCase().includes(directorySearch.toLowerCase()) ||
        g.description?.toLowerCase().includes(directorySearch.toLowerCase()) ||
        g.campaignTitle?.toLowerCase().includes(directorySearch.toLowerCase());

      if (!matchesSearch) return false;

      if (directoryFilter === 'recruiting') return g.status === 'Recruiting';
      if (directoryFilter === 'mine') return g.members?.some(m => m.userId === currentUser?.uid);
      return true;
    });
  }, [groups, directorySearch, directoryFilter, currentUser?.uid]);

  const filteredUserDirectory = useMemo(() => {
    if (!userSearchQuery.trim()) return userDirectory.slice(0, 8);
    const q = userSearchQuery.toLowerCase();
    return userDirectory.filter(u => 
      u.displayName?.toLowerCase().includes(q) || 
      u.email?.toLowerCase().includes(q) ||
      u.handle?.toLowerCase().includes(q)
    );
  }, [userDirectory, userSearchQuery]);

  return (
    <div className="h-full w-full flex flex-col bg-[#080c14] text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Station Status & Breadcrumb Header */}
      <header className="px-3 sm:px-4 py-2 bg-slate-950/95 border-b border-slate-800/90 flex items-center justify-between text-xs font-mono shrink-0 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 text-slate-400 min-w-0">
            <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">GAME TEAMS & SQUADS</span>
            </span>
            <span className="text-slate-600">/</span>

            {/* Active Squad Selector Dropdown */}
            {groups.length > 0 ? (
              <div className="relative group">
                <select
                  value={activeGroup?.id || ''}
                  onChange={(e) => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    selectGroup(e.target.value);
                  }}
                  className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold px-2 py-0.5 rounded-md appearance-none pr-6 cursor-pointer focus:outline-none focus:border-emerald-400 text-xs truncate max-w-[180px] sm:max-w-[240px]"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id} className="bg-slate-900 text-slate-100">
                      {g.name} ({g.members?.length || 0} Operators)
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400 text-[10px]">
                  ▼
                </div>
              </div>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-400 font-bold">
                NO ACTIVE SQUAD
              </span>
            )}

            {/* Active Squad Status Badge */}
            {activeGroup?.status && (
              <span className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                activeGroup.status === 'Recruiting'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : activeGroup.status === 'On Mission'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>{activeGroup.status.toUpperCase()}</span>
              </span>
            )}

            {/* Quick Join Code Badge */}
            {activeGroup?.inviteCode && (
              <button
                type="button"
                onClick={handleCopyCode}
                className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 hover:border-emerald-500/40 text-[9.5px] font-mono text-slate-300 hover:text-emerald-300 transition-colors"
                title="Click to copy Squad Invite Code"
              >
                <span className="text-slate-500">CODE:</span>
                <span className="font-bold text-emerald-300">{activeGroup.inviteCode}</span>
                {copiedCode ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
              </button>
            )}
          </div>
        </div>

        {/* Right Station Fast Action Buttons */}
        <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
          {/* Deploy to Stage (VTT) */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              navigate('/stage');
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-500 hover:to-amber-600 text-white font-bold shadow-sm transition-all cursor-pointer"
            title="Deploy Squad to the Stage Tactical Viewport"
          >
            <Map size={13} />
            <span>DEPLOY TO STAGE</span>
          </button>

          {/* Create Squad Button */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1300, 0.03);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-sm transition-all cursor-pointer"
            title="Create a New Tactical Squad"
          >
            <Plus size={13} />
            <span className="hidden xs:inline">NEW SQUAD</span>
          </button>
        </div>
      </header>

      {/* Main Workstation Container */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Navigation Rail (Width: ~60px) */}
        <TeamsNavRail
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenGuideModal={() => setIsGuideModalOpen(true)}
        />

        {/* Main Routed Content Panel */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#090d16] relative">
          {/* TAB 1: SQUAD ROSTER */}
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
              setIsCreateModalOpen={setIsCreateModalOpen}
              setActiveTab={setActiveTab}
            />
          )}

          {/* TAB 2: TEAMS DIRECTORY & JOIN */}
          {activeTab === 'directory' && (
            <SquadDirectoryTab
              directorySearch={directorySearch}
              setDirectorySearch={setDirectorySearch}
              directoryFilter={directoryFilter}
              setDirectoryFilter={setDirectoryFilter}
              joinCodeInput={joinCodeInput}
              setJoinCodeInput={setJoinCodeInput}
              handleJoinByCodeSubmit={handleJoinByCodeSubmit}
              joinLoading={joinLoading}
              joinError={joinError}
              filteredDirectory={filteredDirectory}
              currentUser={currentUser}
              activeGroup={activeGroup}
              selectGroup={selectGroup}
              setActiveTab={setActiveTab}
              joinByCode={joinByCode}
              toast={toast}
            />
          )}

          {/* TAB 3: INVITE COMMAND CENTER */}
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
              acceptInvite={acceptInvite}
              declineInvite={declineInvite}
              revokeInvite={revokeInvite}
            />
          )}

          {/* TAB 4: SQUAD COMMS FREQUENCY FEED */}
          {activeTab === 'comms' && (
            <SquadCommsTab
              activeGroup={activeGroup}
              navigate={navigate}
            />
          )}

          {/* TAB 5: TACTICAL VTT DEPLOYMENT */}
          {activeTab === 'tactical' && (
            <SquadTacticalTab
              activeGroup={activeGroup}
              navigate={navigate}
            />
          )}

          {/* TAB 6: SQUAD SETTINGS & POLICIES */}
          {activeTab === 'settings' && (
            <SquadSettingsTab
              activeGroup={activeGroup}
              isUserGM={isUserGM}
              updateGroup={updateGroup}
              deleteGroup={deleteGroup}
              leaveGroup={leaveGroup}
              storyCatalog={storyCatalog}
              confirm={confirm}
              toast={toast}
            />
          )}
        </main>
      </div>

      {/* Creation Modal */}
      {isCreateModalOpen && (
        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Guide Modal */}
      {isGuideModalOpen && (
        <ComprehensiveUserGuideModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
          initialTab="squads"
        />
      )}

      {/* Review & Accept Pending Team Invite Modal with Persona Selection */}
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

export default TeamsPage;
