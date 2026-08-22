import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Users, 
  Shield, 
  Radio, 
  UserPlus, 
  Share2, 
  Copy, 
  Check, 
  Settings, 
  Play, 
  Heart, 
  Sparkles, 
  Crown, 
  Trash2, 
  LogOut, 
  MessageSquare, 
  Search, 
  Globe, 
  Lock,
  Edit3,
  Dices,
  Send,
  ChevronRight
} from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useFolio } from '../../context/FolioContext';
import { useStory } from '../../context/CampaignContext';
import { AudioService } from '../../services/audioService';
import ChatParser from '../UI/ChatParser';

export const GameGroupModal = ({ isOpen, onClose, initialTab = 'roster' }) => {
  const navigate = useNavigate();
  const { 
    activeGroup, 
    sendInvite, 
    leaveGroup, 
    deleteGroup, 
    updateGroup, 
    updateMemberPersona 
  } = useGroup();
  const { 
    userDirectory, 
    refreshUserDirectory, 
    selectChannel, 
    messages, 
    sendMessage,
    activeChannelId 
  } = useChat();
  const { currentUser, userHandle } = useAuth();
  const { personaRoster, roster, activePersona } = useFolio();
  const { storyCatalog } = useStory();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [inviteStatusMap, setInviteStatusMap] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [speakingMode, setSpeakingMode] = useState('OOC');

  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('Recruiting');
  const [editStoryId, setEditStoryId] = useState('');

  useEffect(() => {
    if (activeGroup) {
      setEditName(activeGroup.name || '');
      setEditDesc(activeGroup.description || '');
      setEditStatus(activeGroup.status || 'Recruiting');
      setEditStoryId(activeGroup.campaignId || '');
    }
  }, [activeGroup]);

  useEffect(() => {
    if (isOpen) {
      refreshUserDirectory();
      if (activeGroup?.channelId && activeChannelId !== activeGroup.channelId) {
        selectChannel(activeGroup.channelId);
      }
    }
  }, [isOpen, activeGroup, activeChannelId, refreshUserDirectory, selectChannel]);

  if (!isOpen || !activeGroup) return null;

  const isGM = activeGroup.creatorId === currentUser?.uid;
  const membersList = Object.values(activeGroup.memberDetails || {});
  const currentMember = activeGroup.memberDetails?.[currentUser?.uid] || null;
  const inviteCode = activeGroup.inviteCode || 'GRP-TANGENT';
  const shareableUrl = `${window.location.origin}/?join=${inviteCode}`;

  const allPersonas = personaRoster || roster || [];

  const handleCopyCode = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(inviteCode).then(() => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      });
    }
  };

  const handleCopyLink = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareableUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    }
  };

  const handleSendDirectInvite = async (targetUser) => {
    try {
      AudioService.playTerminalBeep(1400, 0.04);
      setInviteStatusMap(prev => ({ ...prev, [targetUser.uid]: 'sending' }));
      await sendInvite({
        groupId: activeGroup.id,
        targetUserId: targetUser.uid,
        targetUserHandle: targetUser.userHandle || targetUser.displayName || targetUser.email || 'Operator'
      });
      setInviteStatusMap(prev => ({ ...prev, [targetUser.uid]: 'sent' }));
    } catch (err) {
      console.error('Failed to send invite:', err);
      setInviteStatusMap(prev => ({ ...prev, [targetUser.uid]: 'error' }));
    }
  };

  const handleSelectOperativePersona = async (personaId) => {
    const chosen = allPersonas.find(p => (p['character-doc-id'] || p.id) === personaId) || null;
    AudioService.playTerminalBeep(1300, 0.03);
    await updateMemberPersona(activeGroup.id, chosen);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const selectedStory = (storyCatalog || []).find(s => s.id === editStoryId);
    AudioService.playTerminalBeep(1400, 0.04);
    await updateGroup(activeGroup.id, {
      name: editName.trim(),
      description: editDesc.trim(),
      status: editStatus,
      campaignId: editStoryId || null,
      campaignTitle: selectedStory?.projectName || selectedStory?.title || activeGroup.campaignTitle || ''
    });
    alert('Squad configuration updated successfully.');
  };

  const handleLeave = async () => {
    if (window.confirm(`Are you sure you want to leave squad "${activeGroup.name}"?`)) {
      await leaveGroup(activeGroup.id);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`DISBAND SQUAD: Are you sure you want to permanently disband "${activeGroup.name}" and delete its tied-in channel?`)) {
      await deleteGroup(activeGroup.id);
      onClose();
    }
  };

  const handleQuickChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    await sendMessage(text);
  };

  const handleOpenFullComms = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (activeGroup.channelId) {
      selectChannel(activeGroup.channelId);
    }
    navigate('/comms');
    onClose();
  };

  const existingMemberUids = activeGroup.members || [];
  const inviteableUsers = userDirectory.filter(u => {
    if (existingMemberUids.includes(u.uid)) return false;
    const q = userSearchQuery.toLowerCase();
    const handle = (u.userHandle || u.displayName || u.email || '').toLowerCase();
    return handle.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in select-none">
      <div className="bg-[#0b0f17] border border-cyan-500/40 rounded-2xl w-full max-w-4xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col h-[90vh] max-h-[820px]">
        
        {/* Top Header Banner */}
        <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-mono font-bold tracking-wider text-slate-100 uppercase">
                  {activeGroup.name}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border uppercase ${
                  activeGroup.status === 'In Session'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                    : activeGroup.status === 'Recruiting'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {activeGroup.status || 'Active'}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                <span>GM: <strong className="text-cyan-400">@{activeGroup.creatorHandle || 'Architect'}</strong></span>
                <span>•</span>
                <span>{membersList.length}/{activeGroup.maxMembers || 6} Operatives</span>
                {activeGroup.campaignTitle && (
                  <>
                    <span>•</span>
                    <span className="text-purple-300">Story: {activeGroup.campaignTitle}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/90 px-4 gap-2 text-xs font-mono overflow-x-auto no-scrollbar">
          {[
            { id: 'roster', label: 'OPERATIVES ROSTER', icon: Shield, badge: membersList.length },
            { id: 'invites', label: 'INVITE & RECRUIT', icon: UserPlus },
            { id: 'chat', label: 'TIED-IN SQUAD COMMS', icon: Radio },
            { id: 'settings', label: isGM ? 'SQUAD SETTINGS' : 'SQUAD DETAILS', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  setActiveTab(tab.id);
                }}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-2 font-bold transition-all shrink-0 ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body Tabs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-mono">
          
          {/* TAB 1: OPERATIVES ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <span>DEPLOYED FIRETEAM ROSTER</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Operative sheets representing each player in active combat and holonet logs.
                  </p>
                </div>

                {allPersonas.length > 0 && currentMember && (
                  <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">My Operative:</span>
                    <select
                      value={currentMember.persona?.id || ''}
                      onChange={(e) => handleSelectOperativePersona(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 focus:outline-none"
                    >
                      <option value="">-- Select Operative --</option>
                      {allPersonas.map(p => {
                        const id = p['character-doc-id'] || p.id;
                        const charName = p['char-name'] || p.name || 'Operative';
                        return <option key={id} value={id}>{charName}</option>;
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* Roster Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {membersList.map((m) => {
                  const isLeader = m.role === 'GM' || m.userId === activeGroup.creatorId;
                  const persona = m.persona;
                  const charName = persona?.name || 'Unassigned Operative';
                  const charSpecies = persona?.species || 'Unknown';
                  const charRole = persona?.role || 'Agent';

                  const maxHp = persona?.health || 30;
                  const curHp = persona?.currentHealth !== undefined ? persona.currentHealth : maxHp;
                  const hpPercent = Math.max(0, Math.min(100, Math.round((curHp / Math.max(1, maxHp)) * 100)));

                  const maxVit = persona?.vitality || 30;
                  const curVit = persona?.currentVitality !== undefined ? persona.currentVitality : maxVit;
                  const vitPercent = Math.max(0, Math.min(100, Math.round((curVit / Math.max(1, maxVit)) * 100)));

                  const initial = (charName || m.handle || '?').charAt(0).toUpperCase();

                  return (
                    <div
                      key={m.userId}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-cyan-300 shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-slate-100">{charName}</span>
                              {isLeader && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold flex items-center gap-0.5">
                                  <Crown size={10} /> GM
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block">
                              Operator: <strong className="text-cyan-400">@{m.handle || 'User'}</strong>
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {charSpecies} • {charRole}
                            </span>
                          </div>
                        </div>

                        <span className="text-[9px] font-mono text-slate-600">
                          Joined {new Date(m.joinedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Vitals Gauges */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Heart size={10} className="text-red-400" /> Physical Health
                            </span>
                            <span className="font-bold text-emerald-400">{curHp} / {maxHp}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${hpPercent}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Sparkles size={10} className="text-cyan-400" /> Mental Vitality
                            </span>
                            <span className="font-bold text-cyan-400">{curVit} / {maxVit}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                            <div
                              className="h-full bg-cyan-400 transition-all duration-300"
                              style={{ width: `${vitPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Action Bar */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Tied-in Holonet Relay Active</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('chat')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl border border-slate-700 flex items-center gap-1.5 font-bold transition-all"
                  >
                    <MessageSquare size={13} />
                    <span>Open Squad Comms</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1300, 0.03);
                      navigate('/foundry/map-maker');
                      onClose();
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Launch Tactical VTT</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVITE & RECRUIT */}
          {activeTab === 'invites' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 size={16} className="text-cyan-400" />
                    <span className="font-bold text-slate-100 uppercase tracking-wider">
                      SHAREABLE SQUAD ACCESS CODE
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-bold">1-CLICK JOIN</span>
                </div>
                
                <p className="text-[11px] text-slate-400">
                  Any operative can join this squad instantly by entering this code into the Hub or following the direct CommLink.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">Invite Passcode</span>
                      <span className="text-base font-bold text-cyan-300 tracking-widest">{inviteCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white flex items-center gap-1 font-bold transition-all"
                    >
                      {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="min-w-0 pr-2">
                      <span className="text-[9px] text-slate-500 block uppercase">Direct CommLink</span>
                      <span className="text-xs text-slate-300 truncate block">{shareableUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white flex items-center gap-1 font-bold transition-all shrink-0"
                    >
                      {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct In-App Operator Dispatch */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus size={16} className="text-emerald-400" />
                    <span className="font-bold text-slate-100 uppercase tracking-wider">
                      DIRECT OPERATOR INVITATION
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {inviteableUsers.length} Available in Network
                  </span>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search registered operators by handle..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {inviteableUsers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 space-y-1 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                      <p>No eligible operators found to invite.</p>
                      <p className="text-[10px] text-slate-600">Share the invite code above for open recruitment.</p>
                    </div>
                  ) : (
                    inviteableUsers.map(targetUser => {
                      const handle = targetUser.userHandle || targetUser.displayName || targetUser.email || 'Operator';
                      const status = inviteStatusMap[targetUser.uid];

                      return (
                        <div
                          key={targetUser.uid}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold">
                              @
                            </div>
                            <div>
                              <span className="font-bold text-slate-200">@{handle}</span>
                              {targetUser.role && (
                                <span className="text-[10px] text-slate-500 block">{targetUser.role}</span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={status === 'sending' || status === 'sent'}
                            onClick={() => handleSendDirectInvite(targetUser)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                              status === 'sent'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                            }`}
                          >
                            {status === 'sent' ? (
                              <>
                                <Check size={12} />
                                <span>INVITE SENT</span>
                              </>
                            ) : status === 'sending' ? (
                              <span>SENDING...</span>
                            ) : (
                              <>
                                <UserPlus size={12} />
                                <span>DISPATCH INVITE</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIED-IN SQUAD COMMS */}
          {activeTab === 'chat' && (
            <div className="h-[460px] flex flex-col justify-between bg-slate-950/80 rounded-xl border border-slate-800 p-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <Radio size={14} className="text-cyan-400 animate-pulse" />
                  <span className="font-bold text-slate-200">CHANNEL: 🛡️ {activeGroup.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenFullComms}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                >
                  <span>Open in Full Matrix</span>
                  <ChevronRight size={12} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 select-text">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-1">
                    <Radio size={24} className="text-slate-600" />
                    <p>No squad transmissions yet.</p>
                    <p className="text-[10px]">Send a tactical message or roll dice below.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isSelf = currentUser && msg.senderId === currentUser.uid;
                    const isIC = msg.isIC;
                    return (
                      <div
                        key={msg.id || i}
                        className={`p-2.5 rounded-lg border text-xs ${
                          isSelf ? 'bg-slate-900/90 border-cyan-500/30' : 'bg-slate-900/50 border-slate-800'
                        } ${isIC ? 'border-l-4 border-l-purple-500' : ''}`}
                      >
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className={`font-bold ${isIC ? 'text-purple-300' : 'text-cyan-300'}`}>
                            {msg.senderHandle || 'Operative'}
                            {isIC && ' [IC]'}
                          </span>
                          <span className="text-slate-500">
                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>

                        {msg.type === 'dice_roll' ? (
                          <div className="text-amber-300 font-mono text-[11px] flex items-center gap-1.5">
                            <Dices size={13} />
                            <span>{msg.text}</span>
                          </div>
                        ) : (
                          <div className="text-slate-200 text-xs leading-relaxed">
                            <ChatParser text={msg.text || ''} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleQuickChatSend} className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Transmit into #${activeGroup.name}...`}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white rounded-lg transition-colors"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: SQUAD SETTINGS / MANAGEMENT */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {isGM ? (
                <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                      Squad Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                      Mission Brief / Description
                    </label>
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                        Operational Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Recruiting">Recruiting</option>
                        <option value="In Session">In Session (Active)</option>
                        <option value="Hiatus">On Hiatus</option>
                        <option value="Completed">Mission Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                        Linked Campaign Story
                      </label>
                      <select
                        value={editStoryId}
                        onChange={(e) => setEditStoryId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- None (Standalone) --</option>
                        {(storyCatalog || []).map(s => (
                          <option key={s.id} value={s.id}>{s.projectName || s.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all"
                    >
                      Save Squad Configuration
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-2 bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/50 font-bold rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      <span>Disband Squad</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 max-w-xl">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <span className="text-slate-400 text-xs block">
                      You are an operative member of this squad managed by @{activeGroup.creatorHandle}.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLeave}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/50 font-bold rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <LogOut size={14} />
                    <span>Leave Squad</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GameGroupModal;
