import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Crown, 
  Radio, 
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
import { useSquad } from '../context/SquadContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useFolio } from '../context/FolioContext';
import { useStory } from '../context/CampaignContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { AudioService } from '../services/audioService';
import { SquadsNavRail } from '../components/Squads/SquadsNavRail';
import { CreateSquadModal } from '../components/Squads/CreateSquadModal';
import { ComprehensiveUserGuideModal } from '../components/UI/ComprehensiveUserGuideModal';
import ChatParser from '../components/UI/ChatParser';
import { SquadRosterTab } from '../components/Squads/tabs/SquadRosterTab';
import { SquadDirectoryTab } from '../components/Squads/tabs/SquadDirectoryTab';
import { SquadInvitesTab } from '../components/Squads/tabs/SquadInvitesTab';
import { SquadCommsTab } from '../components/Squads/tabs/SquadCommsTab';
import { SquadSettingsTab } from '../components/Squads/tabs/SquadSettingsTab';
import { SquadInviteConfirmationModal } from '../components/Squads/SquadInviteConfirmationModal';

/**
 * @file SquadsPage.jsx
 * @description Dedicated primary workstation for Game Squads & Tactical Fireteams.
 * Features a persistent SquadsNavRail, real-time squad roster, public directory,
 * invite command center with QR codes, tied-in encrypted tactical comms,
 * and direct one-click deployment into The Stage VTT.
 */
export const SquadsPage = ({
  hideHeader = false,
  onSwitchToComms,
  initialTab: propInitialTab
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = propInitialTab || searchParams.get('tab') || 'roster';

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
    squads = [],
    groups = [], 
    activeSquad,
    activeGroup, 
    selectSquad,
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
    leaveSquad,
    leaveGroup,
    deleteSquad,
    deleteGroup,
    updateSquad,
    updateGroup
  } = useSquad() || {};

  const effectiveSquads = squads.length > 0 ? squads : groups;
  const effectiveActiveSquad = activeSquad || activeGroup;
  const effectiveSelectSquad = selectSquad || selectGroup;
  const effectiveLeaveSquad = leaveSquad || leaveGroup;
  const effectiveDeleteSquad = deleteSquad || deleteGroup;
  const effectiveUpdateSquad = updateSquad || updateGroup;

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
    if (tabParam && ['roster', 'directory', 'invites', 'comms', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Auto-connect tied-in squad channel when comms tab is selected
  useEffect(() => {
    if (activeTab === 'comms' && effectiveActiveSquad?.channelId && activeChannelId !== effectiveActiveSquad.channelId) {
      selectChannel(effectiveActiveSquad.channelId);
    }
  }, [activeTab, effectiveActiveSquad?.channelId, activeChannelId, selectChannel]);

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
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tabId);
      return next;
    });
  };

  const handleCopyCode = () => {
    if (!effectiveActiveSquad?.inviteCode) return;
    navigator.clipboard.writeText(effectiveActiveSquad.inviteCode);
    AudioService.playTerminalBeep(1250, 0.03);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!effectiveActiveSquad?.inviteCode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/network?view=squads&join=${effectiveActiveSquad.inviteCode}`;
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
        effectiveSelectSquad(joined.id);
        setActiveTab('roster');
      }
    } catch (err) {
      console.error('Join squad failed:', err);
      setJoinError(err.message || 'Failed to join squad with provided code.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleSendInvite = async (targetUser) => {
    if (!effectiveActiveSquad || !currentUser) return;
    try {
      setInviteStatusMap(prev => ({ ...prev, [targetUser.uid]: 'sending' }));
      await sendInvite(effectiveActiveSquad.id, targetUser);
      AudioService.playTerminalBeep(1300, 0.03);
      setInviteStatusMap(prev => ({ ...prev, [targetUser.uid]: 'sent' }));
    } catch (err) {
      console.error('Send invite error:', err);
      setInviteStatusMap(prev => ({ ...prev, [targetUser.uid]: 'error' }));
    }
  };

  const currentMemberDetail = effectiveActiveSquad?.memberDetails?.[currentUser?.uid] || 
    (Array.isArray(effectiveActiveSquad?.members) 
      ? effectiveActiveSquad.members.find(m => (typeof m === 'object' && (m?.userId === currentUser?.uid || m?.uid === currentUser?.uid || m?.id === currentUser?.uid)))
      : null);

  const isUserGM = effectiveActiveSquad?.creatorId === currentUser?.uid || 
    effectiveActiveSquad?.architectId === currentUser?.uid ||
    currentMemberDetail?.role === 'Architect' ||
    currentMemberDetail?.role === 'Co-Architect' ||
    currentMemberDetail?.role === 'GM' ||
    currentMemberDetail?.role === 'Leader';

  // Filter directory list
  const filteredDirectory = useMemo(() => {
    return effectiveSquads.filter(g => {
      const matchesSearch = !directorySearch.trim() || 
        g.name?.toLowerCase().includes(directorySearch.toLowerCase()) ||
        g.description?.toLowerCase().includes(directorySearch.toLowerCase()) ||
        g.campaignTitle?.toLowerCase().includes(directorySearch.toLowerCase());

      if (!matchesSearch) return false;

      if (directoryFilter === 'recruiting') return g.status === 'Recruiting';
      if (directoryFilter === 'mine') {
        const isMember = (g.members || []).some(m => (typeof m === 'string' ? m === currentUser?.uid : (m?.userId || m?.uid || m?.id) === currentUser?.uid));
        return isMember || g.creatorId === currentUser?.uid || g.architectId === currentUser?.uid;
      }
      return true;
    });
  }, [effectiveSquads, directorySearch, directoryFilter, currentUser?.uid]);

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
      {!hideHeader && (
        <header className="px-3 sm:px-4 py-2 bg-slate-950/95 border-b border-slate-800/90 flex items-center justify-between text-xs font-mono shrink-0 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-2 text-slate-400 min-w-0">
              <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-400" />
                <span className="hidden sm:inline">GAME SQUADS & FIRETEAMS</span>
              </span>
              <span className="text-slate-600">/</span>

              {/* Active Squad Selector Dropdown */}
              {effectiveSquads.length > 0 ? (
                <div className="relative group">
                  <select
                    value={effectiveActiveSquad?.id || ''}
                    onChange={(e) => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      effectiveSelectSquad(e.target.value);
                    }}
                    className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold px-2 py-0.5 rounded-md appearance-none pr-6 cursor-pointer focus:outline-none focus:border-emerald-400 text-xs truncate max-w-[180px] sm:max-w-[240px]"
                  >
                    {effectiveSquads.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                        {s.name} ({s.members?.length || 0} Operators)
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
              {effectiveActiveSquad?.status && (
                <span className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                  effectiveActiveSquad.status === 'Recruiting'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : effectiveActiveSquad.status === 'On Mission'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  <span>{effectiveActiveSquad.status.toUpperCase()}</span>
                </span>
              )}

              {/* Quick Join Code Badge */}
              {effectiveActiveSquad?.inviteCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 hover:border-emerald-500/40 text-[9.5px] font-mono text-slate-300 hover:text-emerald-300 transition-colors"
                  title="Click to copy Squad Invite Code"
                >
                  <span className="text-slate-500">CODE:</span>
                  <span className="font-bold text-emerald-300">{effectiveActiveSquad.inviteCode}</span>
                  {copiedCode ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                </button>
              )}
            </div>
          </div>

          {/* Right Station Fast Action Buttons */}
          <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
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
      )}

      {/* Main Workstation Container */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        {/* Left Navigation Rail (Hidden on mobile to eliminate page crunch) */}
        <div className="hidden md:flex h-full shrink-0">
          <SquadsNavRail
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenGuideModal={() => setIsGuideModalOpen(true)}
          />
        </div>

        {/* Mobile Horizontal Sub-Tab Strip (< md screens) */}
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800/90 px-2.5 py-1.5 flex items-center justify-between gap-1.5 shrink-0 z-10 font-mono text-xs">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0">
            {[
              { id: 'roster', label: 'ROSTER', icon: Users, badge: effectiveActiveSquad?.members?.length },
              { id: 'directory', label: 'SQUADS', icon: Globe, badge: effectiveSquads.length > 0 ? effectiveSquads.length : null },
              { id: 'invites', label: 'INVITES', icon: UserPlus, badge: pendingInvites.length > 0 ? `${pendingInvites.length}!` : null, isAlert: pendingInvites.length > 0 },
              { id: 'comms', label: 'COMMS', icon: Radio },
              { id: 'settings', label: 'CONFIG', icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1150, 0.02);
                    handleSelectTab(item.id);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1 py-0.2 rounded-full text-[8.5px] font-bold ${
                      item.isAlert
                        ? 'bg-amber-400 text-black animate-soft-badge-glow shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                        : item.badge === 'VTT'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[7.5px]'
                        : 'bg-emerald-500/20 text-emerald-400 font-mono'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1300, 0.03);
                setIsCreateModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 transition-colors cursor-pointer"
              title="Create New Squad"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Main Routed Content Panel */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#090d16] relative">
          {/* TAB 1: SQUAD ROSTER */}
          {activeTab === 'roster' && (
            <SquadRosterTab
              activeGroup={effectiveActiveSquad}
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

          {/* TAB 2: SQUADS DIRECTORY & JOIN */}
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
              activeGroup={effectiveActiveSquad}
              selectGroup={effectiveSelectSquad}
              setActiveTab={setActiveTab}
              joinByCode={joinByCode}
              toast={toast}
            />
          )}

          {/* TAB 3: INVITE COMMAND CENTER */}
          {activeTab === 'invites' && (
            <SquadInvitesTab
              activeGroup={effectiveActiveSquad}
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
              activeGroup={effectiveActiveSquad}
              navigate={navigate}
              onSwitchToComms={onSwitchToComms}
            />
          )}

          {/* TAB 5: SQUAD SETTINGS & POLICIES */}
          {activeTab === 'settings' && (
            <SquadSettingsTab
              activeGroup={effectiveActiveSquad}
              isUserGM={isUserGM}
              updateGroup={effectiveUpdateSquad}
              deleteGroup={effectiveDeleteSquad}
              leaveGroup={effectiveLeaveSquad}
              storyCatalog={storyCatalog}
              confirm={confirm}
              toast={toast}
            />
          )}
        </main>
      </div>

      {/* Creation Modal */}
      {isCreateModalOpen && (
        <CreateSquadModal
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

      {/* Review & Accept Pending Squad Invite Modal with Persona Selection */}
      {reviewingInvite && (
        <SquadInviteConfirmationModal
          isOpen={!!reviewingInvite}
          onClose={closeInviteConfirmation}
          invite={reviewingInvite}
        />
      )}
    </div>
  );
};

export { SquadsPage as TeamsPage };
export default SquadsPage;
