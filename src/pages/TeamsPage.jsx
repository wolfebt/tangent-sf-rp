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
import { AudioService } from '../services/audioService';
import { TeamsNavRail } from '../components/Groups/TeamsNavRail';
import { CreateGroupModal } from '../components/Groups/CreateGroupModal';
import { ComprehensiveUserGuideModal } from '../components/UI/ComprehensiveUserGuideModal';
import ChatParser from '../components/UI/ChatParser';

/**
 * @file TeamsPage.jsx
 * @description Dedicated primary workstation for Game Teams & Tactical Squads.
 * Features a persistent TeamsNavRail, real-time squad roster, public directory,
 * invite command center with QR codes, tied-in encrypted tactical comms,
 * and direct one-click deployment into The Stage VTT.
 */
export const TeamsPage = () => {
  const navigate = useNavigate();
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

  // Squad Comms Feed State
  const [chatInput, setChatInput] = useState('');
  const [speakingMode, setSpeakingMode] = useState('OOC');

  // Contexts
  const { 
    groups = [], 
    activeGroup, 
    selectGroup, 
    joinByCode,
    sendInvite,
    pendingInvites = [],
    outgoingInvites = [],
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

  // Settings Edit State
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('Recruiting');
  const [editStoryId, setEditStoryId] = useState('');
  const [editAllowPlayerOverride, setEditAllowPlayerOverride] = useState(true);

  // Sync settings inputs when active group changes
  useEffect(() => {
    if (activeGroup) {
      setEditName(activeGroup.name || '');
      setEditDesc(activeGroup.description || '');
      setEditStatus(activeGroup.status || 'Recruiting');
      setEditStoryId(activeGroup.campaignId || '');
      setEditAllowPlayerOverride(activeGroup.allowPlayerOverride !== false);
    }
  }, [activeGroup]);

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

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeGroup?.channelId) return;

    const currentChannel = activeGroup.channelId;
    const text = chatInput.trim();
    setChatInput('');

    try {
      await sendMessage({
        channelId: currentChannel,
        content: text,
        senderType: speakingMode === 'IC' ? 'character' : (speakingMode === 'GM' ? 'gm' : 'player'),
        personaName: speakingMode === 'IC' ? (activePersona?.name || 'Operative') : undefined
      });
      AudioService.playTerminalBeep(1100, 0.02);
    } catch (err) {
      console.error('Failed to send team message:', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!activeGroup) return;

    try {
      await updateGroup(activeGroup.id, {
        name: editName.trim(),
        description: editDesc.trim(),
        status: editStatus,
        campaignId: editStoryId || null,
        campaignTitle: storyCatalog.find(s => s.id === editStoryId)?.title || activeGroup.campaignTitle || '',
        allowPlayerOverride: editAllowPlayerOverride
      });
      AudioService.playTerminalBeep(1400, 0.04);
      alert('Squad settings updated successfully.');
    } catch (err) {
      console.error('Update group settings error:', err);
      alert('Failed to update squad settings.');
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
                      {g.name} ({g.members?.length || 0} Operatives)
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeGroup ? (
                <>
                  {/* Active Squad Overview Header Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950/80 border border-emerald-500/30 backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-bold font-mono text-white tracking-wide">
                          {activeGroup.name}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                          {activeGroup.members?.length || 0} OPERATIVES
                        </span>
                        {activeGroup.campaignTitle && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                            <Layers size={10} />
                            <span>{activeGroup.campaignTitle}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 max-w-2xl font-sans">
                        {activeGroup.description || 'Dedicated tactical operative squad coordinating on Terran-net communications.'}
                      </p>
                    </div>

                    {/* Quick Code & Share Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        title="Copy direct invite link to clipboard"
                      >
                        {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedLink ? 'LINK COPIED' : 'SHARE LINK'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowEnlargedQr(prev => !prev)}
                        className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 transition-all cursor-pointer"
                        title="Display Squad QR Code"
                      >
                        <QrCode size={16} />
                      </button>
                    </div>
                  </div>

                  {/* QR Code Expansion Card */}
                  {showEnlargedQr && activeGroup?.inviteCode && (
                    <div className="p-4 rounded-2xl bg-[#0b0f17] border border-emerald-500/40 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                      <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                            `${typeof window !== 'undefined' ? window.location.origin : ''}/teams?join=${activeGroup.inviteCode}`
                          )}`}
                          alt="Squad Join QR"
                          className="w-28 h-28"
                        />
                      </div>
                      <div className="space-y-2 text-center sm:text-left">
                        <span className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                          FAST MOBILE SQUAD RECRUITMENT
                        </span>
                        <p className="text-xs text-slate-400 max-w-md">
                          Have fellow players scan this QR code with their mobile device to instantly bind to <strong className="text-white">{activeGroup.name}</strong> and sync their persona roster.
                        </p>
                        <span className="inline-block px-2.5 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-emerald-400 font-bold">
                          INVITE CODE: {activeGroup.inviteCode}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Operatives Roster Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Users size={14} className="text-emerald-400" />
                        <span>SQUAD OPERATIVES & PERSONAS</span>
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500">
                        {activeGroup.members?.length || 0} / {activeGroup.maxMembers || 6} SLOTS
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {(activeGroup.members || []).map((member) => {
                        const isSelf = member.userId === currentUser?.uid;
                        const persona = member.persona;
                        const isLeader = member.role === 'GM' || member.role === 'Leader';

                        return (
                          <div
                            key={member.userId}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                              isSelf
                                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {/* Member Top Bar: Handle & Role */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                                  {isLeader ? (
                                    <Crown size={15} className="text-amber-400" />
                                  ) : (
                                    <Shield size={15} className="text-emerald-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-mono font-bold text-white truncate">
                                      {member.handle || 'Operative'}
                                    </span>
                                    {isSelf && (
                                      <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-300 rounded font-mono">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono block truncate">
                                    {member.role || 'Operative'}
                                  </span>
                                </div>
                              </div>

                              {/* Leader Actions */}
                              {isUserGM && !isSelf && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Remove ${member.handle} from ${activeGroup.name}?`)) {
                                      kickMember(activeGroup.id, member.userId);
                                    }
                                  }}
                                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                                  title="Remove operative from squad"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>

                            {/* Persona Dossier Attachment */}
                            {persona ? (
                              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="font-bold text-cyan-300 truncate">
                                    {persona.name}
                                  </span>
                                  <span className="text-slate-400 text-[10px] shrink-0">
                                    {persona.species} • {persona.role}
                                  </span>
                                </div>

                                {/* Health & Vitality Status Gauges */}
                                <div className="grid grid-cols-2 gap-2 text-[9.5px] font-mono pt-1">
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-rose-300">
                                      <span>HP</span>
                                      <span>{persona.currentHealth ?? persona.health ?? 30}/{persona.health ?? 30}</span>
                                    </div>
                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-rose-500 rounded-full" 
                                        style={{ width: `${Math.min(100, Math.max(0, ((persona.currentHealth ?? 30) / (persona.health ?? 30)) * 100))}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-cyan-300">
                                      <span>VIT</span>
                                      <span>{persona.currentVitality ?? persona.vitality ?? 30}/{persona.vitality ?? 30}</span>
                                    </div>
                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-cyan-500 rounded-full" 
                                        style={{ width: `${Math.min(100, Math.max(0, ((persona.currentVitality ?? 30) / (persona.vitality ?? 30)) * 100))}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-dashed border-slate-800 text-center">
                                <span className="text-[10px] font-mono text-slate-500">
                                  NO PERSONA BOUND YET
                                </span>
                              </div>
                            )}

                            {/* Role Assignment Switcher (GM Only) */}
                            {isUserGM && (
                              <div className="pt-1 flex items-center justify-between text-[10px] font-mono border-t border-slate-800/80">
                                <span className="text-slate-500">TACTICAL ROLE:</span>
                                <select
                                  value={member.role || 'Operative'}
                                  onChange={(e) => updateMemberRole(activeGroup.id, member.userId, e.target.value)}
                                  className="bg-slate-950 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-emerald-400"
                                >
                                  <option value="GM">Lead Architect (GM)</option>
                                  <option value="Co-GM">Co-Architect</option>
                                  <option value="Leader">Squad Leader</option>
                                  <option value="Operative">Operative</option>
                                  <option value="Spectator">Observer</option>
                                </select>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                /* No Squad Selected Empty State */
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Shield size={32} />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                      NO ACTIVE TACTICAL SQUAD
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      You are not currently synchronized with an active team. Form a new squad or browse existing public campaigns.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      + CREATE SQUAD
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('directory')}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 font-mono text-xs font-bold transition-all cursor-pointer"
                    >
                      BROWSE DIRECTORY
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEAMS DIRECTORY & JOIN */}
          {activeTab === 'directory' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Directory Filter Bar & Join Code Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Search & Filters */}
                <div className="lg:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={directorySearch}
                      onChange={(e) => setDirectorySearch(e.target.value)}
                      placeholder="Search squad title, campaign, or keywords..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 shrink-0 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setDirectoryFilter('all')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        directoryFilter === 'all'
                          ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ALL
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectoryFilter('recruiting')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        directoryFilter === 'recruiting'
                          ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      RECRUITING
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectoryFilter('mine')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        directoryFilter === 'mine'
                          ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      MY TEAMS
                    </button>
                  </div>
                </div>

                {/* Direct Join with Code Bar */}
                <form onSubmit={handleJoinByCodeSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE: GRP-XXXXXX"
                    className="flex-1 px-3 py-2 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-300 placeholder-slate-600 uppercase tracking-wider focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    disabled={joinLoading || !joinCodeInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
                  >
                    {joinLoading ? 'JOINING...' : 'JOIN'}
                  </button>
                </form>
              </div>

              {joinError && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono">
                  {joinError}
                </div>
              )}

              {/* Squads Directory Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDirectory.map((group) => {
                  const isEnrolled = group.members?.some(m => m.userId === currentUser?.uid);
                  const isSelected = activeGroup?.id === group.id;

                  return (
                    <div
                      key={group.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? 'bg-emerald-950/25 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-mono text-sm font-bold text-white truncate">
                              {group.name}
                            </h4>
                            {group.campaignTitle && (
                              <span className="text-[10px] font-mono text-purple-300 flex items-center gap-1 mt-0.5">
                                <Layers size={10} />
                                <span className="truncate">{group.campaignTitle}</span>
                              </span>
                            )}
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border shrink-0 ${
                            group.status === 'Recruiting'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {group.status || 'Active'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 font-sans line-clamp-2">
                          {group.description || 'Terran-net operative fireteam.'}
                        </p>
                      </div>

                      {/* Card Footer: Members and Select Action */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Users size={12} className="text-slate-400" />
                          <span>{group.members?.length || 0} / {group.maxMembers || 6}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {isEnrolled ? (
                            <button
                              type="button"
                              onClick={() => {
                                AudioService.playTerminalBeep(1100, 0.02);
                                selectGroup(group.id);
                                setActiveTab('roster');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10.5px] font-mono font-bold transition-all cursor-pointer"
                            >
                              {isSelected ? 'ACTIVE SQUAD' : 'ACTIVATE'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await joinByCode(group.inviteCode);
                                  selectGroup(group.id);
                                  setActiveTab('roster');
                                } catch (e) {
                                  alert(e.message);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-mono font-bold transition-all cursor-pointer"
                            >
                              JOIN SQUAD
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: INVITE COMMAND CENTER */}
          {activeTab === 'invites' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Shareable Invite Codes & Links */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <UserPlus size={16} className="text-emerald-400" />
                      <span>SHAREABLE INVITE CREDENTIALS</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      Distribute instant join access to fellow operatives via alphanumeric codes or direct links.
                    </p>
                  </div>

                  {activeGroup ? (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-slate-500">ALPHANUMERIC JOIN CODE</span>
                          <div className="text-sm font-mono font-bold text-emerald-300">
                            {activeGroup.inviteCode}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-emerald-900 transition-colors cursor-pointer"
                        >
                          {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedCode ? 'COPIED' : 'COPY'}</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <span className="text-[10px] font-mono text-slate-500">DIRECT WEB DEEP-LINK</span>
                          <div className="text-xs font-mono text-slate-300 truncate">
                            {`${typeof window !== 'undefined' ? window.location.origin : ''}/teams?join=${activeGroup.inviteCode}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5 hover:border-emerald-500/40 transition-colors shrink-0 cursor-pointer"
                        >
                          {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedLink ? 'COPIED' : 'COPY'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-xs text-slate-500 font-mono">
                      Select or create a squad first to provision invite credentials.
                    </div>
                  )}
                </div>

                {/* 2. Direct Operative Directory Dispatch */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Search size={16} className="text-cyan-400" />
                      <span>DISPATCH OPERATIVE INVITATIONS</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      Search online player directory and dispatch direct squad membership transmissions.
                    </p>
                  </div>

                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Search operator handle or email..."
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredUserDirectory.map(user => {
                      if (user.uid === currentUser?.uid) return null;
                      const status = inviteStatusMap[user.uid];

                      return (
                        <div 
                          key={user.uid}
                          className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-slate-200 truncate block">
                              {user.displayName || user.email || 'Operative'}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                              @{user.handle || 'operator'}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={status === 'sending' || status === 'sent'}
                            onClick={() => handleSendInvite(user)}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                              status === 'sent'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300'
                            }`}
                          >
                            {status === 'sent' ? 'INVITED' : status === 'sending' ? 'TRANSMITTING...' : 'DISPATCH'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Pending Inbound & Outbound Invites Cards */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                  PENDING INVITATION TELEMETRY ({pendingInvites.length} Inbound • {outgoingInvites.length} Outbound)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Incoming Invites */}
                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                    <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                      INCOMING SQUAD CALLS
                    </span>
                    {pendingInvites.length > 0 ? (
                      pendingInvites.map(inv => (
                        <div key={inv.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                          <div>
                            <span className="font-bold text-white block">{inv.groupName}</span>
                            <span className="text-[10px] text-slate-400">Invited by @{inv.senderHandle}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => acceptInvite(inv.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                            >
                              ACCEPT
                            </button>
                            <button
                              type="button"
                              onClick={() => declineInvite(inv.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              DECLINE
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 font-mono">No incoming pending invitations.</p>
                    )}
                  </div>

                  {/* Outgoing Invites */}
                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                    <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider block">
                      DISPATCHED OUTGOING INVITATIONS
                    </span>
                    {outgoingInvites.length > 0 ? (
                      outgoingInvites.map(inv => (
                        <div key={inv.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                          <div>
                            <span className="font-bold text-white block">@{inv.recipientHandle}</span>
                            <span className="text-[10px] text-slate-500">Status: {inv.status}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => revokeInvite(inv.id)}
                            className="text-rose-400 hover:text-rose-300 text-[11px]"
                          >
                            REVOKE
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 font-mono">No outgoing invites currently awaiting response.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SQUAD COMMS FREQUENCY FEED */}
          {activeTab === 'comms' && (
            <div className="flex-1 flex flex-col h-full min-h-0 bg-[#070b12]">
              {/* Comms Feed Top Sub-Header */}
              <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
                <div className="flex items-center gap-2">
                  <Radio size={14} className="text-cyan-400 animate-pulse" />
                  <span className="font-bold text-cyan-300 uppercase tracking-wider">
                    {activeGroup ? `${activeGroup.name} TACTICAL FEED` : 'ENCRYPTED RELAY'}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-[10.5px] text-slate-400">
                    FREQ: {activeGroup?.channelId || 'tangent_freq_default'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1150, 0.02);
                    navigate('/comms');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors"
                  title="Open in full HoloNet CommLink matrix"
                >
                  <span>FULL COMMS STATION</span>
                  <ExternalLink size={11} />
                </button>
              </div>

              {/* Chat Transmissions History List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`p-3 rounded-xl border max-w-2xl font-mono text-xs ${
                        msg.senderId === currentUser?.uid
                          ? 'ml-auto bg-emerald-950/30 border-emerald-500/30 text-emerald-100'
                          : 'bg-slate-900/60 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 pb-1 mb-1 border-b border-slate-800/60">
                        <span className="font-bold text-cyan-300">
                          {msg.senderName || msg.senderHandle || 'Operative'}
                        </span>
                        <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString()}</span>
                      </div>
                      <ChatParser content={msg.content} />
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-slate-500 font-mono text-xs">
                    <Radio size={28} className="text-slate-600" />
                    <span>ENCRYPTED SQUAD FREQUENCY IS SILENT</span>
                    <span className="text-[10.5px] text-slate-600">Send a tactical order or broadcast to initialize transmission logs.</span>
                  </div>
                )}
              </div>

              {/* Chat Message Input Composer */}
              <form onSubmit={handleSendChatMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSpeakingMode(prev => prev === 'OOC' ? 'IC' : prev === 'IC' ? 'GM' : 'OOC')}
                  className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[10.5px] font-mono font-bold text-cyan-300 shrink-0"
                  title="Toggle Speaking Mode (IC / OOC / GM)"
                >
                  {speakingMode}
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Broadcast to ${activeGroup?.name || 'squad'}...`}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-all shrink-0 cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: TACTICAL VTT DEPLOYMENT */}
          {activeTab === 'tactical' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-950 border border-amber-500/40 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Map size={14} />
                      <span>THE STAGE • TACTICAL DEPLOYMENT VIEWPORT</span>
                    </span>
                    <h2 className="text-xl font-bold font-mono text-white">
                      {activeGroup ? `${activeGroup.name} VTT Operations` : 'Tactical Battlemap Synchronizer'}
                    </h2>
                    <p className="text-xs text-slate-300 font-sans max-w-xl">
                      Synchronize team token coordinates, initiative logs, line-of-sight fog-of-war, and live dice resolution across all active players in this squad.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1400, 0.05);
                      navigate('/stage');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play size={14} />
                    <span>LAUNCH THE STAGE</span>
                  </button>
                </div>

                {/* Tactical Status Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-500/20 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">BOUND CAMPAIGN</span>
                    <span className="text-amber-300 font-bold">
                      {activeGroup?.campaignTitle || 'None Selected (Freeform)'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">SYNCHRONIZED OPERATIVES</span>
                    <span className="text-emerald-300 font-bold">
                      {activeGroup?.members?.length || 0} Ready for Combat
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TACTICAL LATENCY</span>
                    <span className="text-cyan-300 font-bold">
                      TERRAN-NET QUANTUM MESH (&lt; 24ms)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SQUAD SETTINGS & POLICIES */}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeGroup ? (
                <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Settings size={16} className="text-slate-400" />
                      <span>SQUAD GOVERNANCE & CONFIGURATION</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      Manage team identity, linked campaign scenario files, and player access rules.
                    </p>
                  </div>

                  <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Squad Callsign / Title</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={!isUserGM}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Squad Briefing / Description</label>
                      <textarea
                        rows={3}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        disabled={!isUserGM}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-sans text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">Recruiting Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          disabled={!isUserGM}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Recruiting">Recruiting (Publicly Listed)</option>
                          <option value="Active">Active (Invite Only)</option>
                          <option value="On Mission">On Mission (Locked)</option>
                          <option value="Hiatus">Hiatus (Inactive)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">Linked ADE Campaign</label>
                        <select
                          value={editStoryId}
                          onChange={(e) => setEditStoryId(e.target.value)}
                          disabled={!isUserGM}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">No Campaign Linked</option>
                          {storyCatalog.map(story => (
                            <option key={story.id} value={story.id}>
                              {story.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Permissions Toggle */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono text-slate-200 block">Allow Player Overrides</span>
                        <span className="text-[10px] text-slate-500 block">Permit players to freely edit attached persona stats during gameplay</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editAllowPlayerOverride}
                        onChange={(e) => setEditAllowPlayerOverride(e.target.checked)}
                        disabled={!isUserGM}
                        className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                      />
                    </div>

                    {isUserGM && (
                      <div className="pt-3">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-md"
                        >
                          SAVE SQUAD SETTINGS
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Danger Zone: Leave / Disband */}
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-rose-300 block">
                        {isUserGM ? 'DISBAND SQUAD' : 'LEAVE SQUAD'}
                      </span>
                      <span className="text-[10.5px] text-slate-400 block">
                        {isUserGM ? 'Permanently disband this tactical squad and close tied-in comms.' : 'Revoke your persona attachment and exit this squad.'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isUserGM) {
                          if (window.confirm(`Disband squad "${activeGroup.name}"? This action cannot be undone.`)) {
                            deleteGroup(activeGroup.id);
                          }
                        } else {
                          if (window.confirm(`Leave squad "${activeGroup.name}"?`)) {
                            leaveGroup(activeGroup.id);
                          }
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-500/50 text-rose-300 hover:bg-rose-900 text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      {isUserGM ? 'DISBAND' : 'LEAVE'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 text-center text-slate-500 font-mono text-xs">
                  Select an active squad to configure its policies.
                </div>
              )}
            </div>
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
    </div>
  );
};

export default TeamsPage;
