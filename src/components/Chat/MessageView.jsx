import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Dices, 
  Sparkles, 
  Shield, 
  User, 
  Bot, 
  Radio, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Settings, 
  Edit3,
  Heart,
  Activity,
  Package,
  Moon,
  Crosshair,
  Zap,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  MessageSquare,
  Flame,
  Info,
  ExternalLink,
  Mic,
  MicOff,
  UserPlus,
  Copy,
  Check,
  CornerDownRight,
  Search,
  X
} from 'lucide-react';
import ChatParser from '../UI/ChatParser';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useVoiceChat } from '../../context/VoiceChatContext';
import { useGroup } from '../../context/GroupContext';
import { useToast } from '../../context/ToastContext';
import { AudioService } from '../../services/audioService';
import { TwoD10Icon } from '../UI/TwoD10Icon';
import { GameGroupModal } from '../Groups/GameGroupModal';
import { ChannelSettingsModal } from './ChannelSettingsModal';
import { QuickTeamInviteModal } from './QuickTeamInviteModal';

/**
 * @component MessageView
 * @description Clear, high-contrast, compact tactical sci-fi ledger for chat messages.
 * Features smart message grouping, crisp typography, clean left accent borders,
 * inline team invite actions, channel context indicators, and accessible users roster menu.
 */
export const MessageView = ({ messages = [], loading = false, activeChannel }) => {
  const { currentUser, userHandle } = useAuth();
  const { 
    startDirectMessage, 
    pendingCharacterNotes = [], 
    selectChannel,
    isTeamChannel: checkIsTeam,
    isStandardChannel: checkIsStandard,
    getChannelAddressingMode,
    channelAddressingMode,
    activeChannelUsers,
    onlineOperators = [],
    offlineOperators = [],
    selectedPersona,
    speakingMode
  } = useChat();
  const { 
    isConnected: isVoiceConnected, 
    currentRoomName, 
    connectToVoiceRoom, 
    disconnectVoiceRoom 
  } = useVoiceChat();
  const { groups = [], selectGroup } = useGroup();
  const { toast } = useToast() || { toast: () => {} };
  
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUsersDrawerOpen, setIsUsersDrawerOpen] = useState(false);
  const [usersDrawerTab, setUsersDrawerTab] = useState('users'); // 'users' | 'dossier'
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isOfflineCollapsed, setIsOfflineCollapsed] = useState(true);
  const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages?.length, loading]);

  const isTeamChannel = checkIsTeam 
    ? checkIsTeam(activeChannel) 
    : (activeChannel?.type === 'group' || !!activeChannel?.groupId || (Array.isArray(activeChannel?.characterMembers) && activeChannel.characterMembers.length > 0));
  const isStandardChannel = checkIsStandard 
    ? checkIsStandard(activeChannel) 
    : (activeChannel?.type === 'public' || activeChannel?.id?.startsWith('public_'));
  const isPersonaLogChannel = activeChannel?.type === 'persona_log' || activeChannel?.id?.startsWith('persona_log_');
  const isDirectChannel = activeChannel?.type === 'direct' || activeChannel?.id?.startsWith('dm_');
  const isCharacterDirect = isDirectChannel && (activeChannel?.recipientType === 'character' || Boolean(activeChannel?.targetPersona) || activeChannel?.id?.startsWith('dm_char_'));
  
  const linkedTeam = isTeamChannel 
    ? (groups.find(g => g.id === activeChannel?.groupId || g.channelId === activeChannel?.id) || null)
    : null;

  // Filtered Roster lists for accessible users menu
  const filteredTeamPersonas = useMemo(() => {
    const list = activeChannelUsers?.personas || [];
    if (!userSearchQuery.trim()) return list;
    const q = userSearchQuery.toLowerCase().trim();
    return list.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.role && p.role.toLowerCase().includes(q)) ||
      (p.species && p.species.toLowerCase().includes(q)) ||
      (p.ownerHandle && p.ownerHandle.toLowerCase().includes(q))
    );
  }, [activeChannelUsers?.personas, userSearchQuery]);

  const filteredOnlineOps = useMemo(() => {
    const list = onlineOperators || [];
    if (!userSearchQuery.trim()) return list;
    const q = userSearchQuery.toLowerCase().trim();
    return list.filter(u => 
      (u.userHandle && u.userHandle.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (Array.isArray(u.characters) && u.characters.some(c => (c.name && c.name.toLowerCase().includes(q)) || (c.role && c.role.toLowerCase().includes(q))))
    );
  }, [onlineOperators, userSearchQuery]);

  const filteredOfflineOps = useMemo(() => {
    const list = offlineOperators || [];
    if (!userSearchQuery.trim()) return list;
    const q = userSearchQuery.toLowerCase().trim();
    return list.filter(u => 
      (u.userHandle && u.userHandle.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q))
    );
  }, [offlineOperators, userSearchQuery]);

  const handleOpenTeamModal = () => {
    if (linkedTeam) {
      selectGroup(linkedTeam.id);
      setIsTeamModalOpen(true);
    }
  };

  const handleCopyMessage = (msgId, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    AudioService.playTerminalBeep(1200, 0.02);
    setCopiedMessageId(msgId);
    toast({
      type: 'info',
      title: 'TRANSMISSION COPIED',
      text: 'Message content copied to clipboard.'
    });
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const formatTimestamp = (msg) => {
    if (msg.createdAt?.toDate) {
      return msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (msg.createdLocalAt) {
      return new Date(msg.createdLocalAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  };

  const getMessageTimeMs = (msg) => {
    if (msg.createdAt?.toDate) return msg.createdAt.toDate().getTime();
    if (msg.createdLocalAt) return new Date(msg.createdLocalAt).getTime();
    if (msg.timestamp) return new Date(msg.timestamp).getTime();
    return 0;
  };

  // Safe formatting of roll items
  const formatDiceRolls = (rolls) => {
    if (!Array.isArray(rolls)) return '';
    return rolls.map((r) => {
      if (typeof r === 'object' && r !== null) {
        if (r.exploded) {
          return `${r.value}! (+${r.explodeValue || 0})`;
        }
        return String(r.value ?? r.total ?? JSON.stringify(r));
      }
      return String(r);
    }).join(', ');
  };

  const renderMessageContent = (msg) => {
    // 1. Persona Action Telemetry Log Entry
    if (msg.type === 'persona_log_entry' || msg.isReadOnlyLog) {
      const actionType = msg.actionType || 'TELEMETRY';
      const isVitals = actionType === 'VITALS_CHANGE';
      const isSkill = actionType === 'SKILL_CHECK' || actionType === 'ATTR_CHECK';
      const isAttack = actionType === 'ATTACK_ROLL';
      const isGear = actionType === 'GEAR_CHANGE';
      const isRest = actionType === 'REST_CYCLE';

      const typeBadgeClass = isVitals 
        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
        : isSkill 
        ? 'bg-blue-950/80 text-blue-300 border-blue-500/50'
        : isAttack 
        ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
        : isGear 
        ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
        : isRest 
        ? 'bg-teal-950/80 text-teal-300 border-teal-500/50'
        : 'bg-slate-900 text-cyan-300 border-cyan-500/40';

      return (
        <div className="mt-1 p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs font-mono shadow-md space-y-1.5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-1">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${typeBadgeClass}`}>
                {actionType.replace('_', ' ')}
              </span>
              <span className="text-[10.5px] text-slate-400 font-bold">{msg.personaName || 'Persona'}</span>
            </div>
            <span className="text-[9.5px] text-slate-500">{formatTimestamp(msg)}</span>
          </div>

          <p className="text-slate-200 font-semibold text-xs leading-relaxed">
            {msg.summary || msg.text}
          </p>

          {msg.details && (
            <div className="p-1.5 rounded bg-slate-900/80 text-[10.5px] text-slate-400 font-mono">
              {typeof msg.details === 'object' ? JSON.stringify(msg.details) : msg.details}
            </div>
          )}
        </div>
      );
    }

    // 2. Tactical Dice Roll Message Card
    if (msg.type === 'dice_roll' && msg.metadata) {
      const { 
        expression, 
        result, 
        total, 
        finalTotal: metaFinalTotal,
        naturalTotal,
        rolls = [], 
        dicePool = [],
        keptDice = [],
        appliedModifier,
        modifier,
        flatModifier,
        critThreshold,
        fumbleThreshold,
        advantageDice = 0,
        isCritical, 
        isFumble, 
        isCrit,
        isAdvantage, 
        isDisadvantage, 
        label, 
        targetNumber, 
        targetDC,
        outcome,
        isSuccess, 
        margin 
      } = msg.metadata;

      const finalTotalVal = metaFinalTotal ?? total ?? result;
      const isCritActive = Boolean(isCritical || isCrit || (outcome && outcome.toLowerCase().includes('critical success')));
      const isFumbleActive = Boolean(isFumble || (outcome && outcome.toLowerCase().includes('critical failure')));
      const targetDCVal = targetDC ?? targetNumber;

      // Extract full pool array: array of raw numbers
      const rawPool = Array.isArray(dicePool) && dicePool.length > 0 
        ? dicePool 
        : (Array.isArray(rolls) ? rolls : []);
      const poolValues = rawPool.map(r => typeof r === 'object' && r !== null ? (r.value ?? r.total ?? 0) : Number(r) || 0);

      // Determine kept dice list
      let keptList = Array.isArray(keptDice) && keptDice.length > 0 ? [...keptDice] : [];
      if (keptList.length === 0 && poolValues.length >= 2) {
        if (advantageDice > 0 || isAdvantage) {
          keptList = [...poolValues].sort((a, b) => b - a).slice(0, 2);
        } else if (advantageDice < 0 || isDisadvantage) {
          keptList = [...poolValues].sort((a, b) => a - b).slice(0, 2);
        } else {
          keptList = poolValues.slice(0, 2);
        }
      }

      // Track kept dice counts so duplicate values are matched correctly
      const keptCounts = {};
      keptList.forEach(k => { keptCounts[k] = (keptCounts[k] || 0) + 1; });

      const activeAppliedMod = appliedModifier !== undefined ? appliedModifier : (flatModifier !== undefined ? flatModifier : (modifier || 0));
      const activeCritThresh = critThreshold !== undefined ? critThreshold : 20;
      const activeFumbleThresh = fumbleThreshold !== undefined ? fumbleThreshold : 2;
      const activeNatTotal = naturalTotal !== undefined ? naturalTotal : (keptList[0] !== undefined && keptList[1] !== undefined ? keptList[0] + keptList[1] : null);

      return (
        <div className={`mt-1 p-3 rounded-lg border text-xs font-mono transition-all ${
          isCritActive 
            ? 'bg-gradient-to-r from-amber-950/80 via-slate-950/90 to-slate-950 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
            : isFumbleActive 
            ? 'bg-gradient-to-r from-rose-950/80 via-slate-950/90 to-slate-950 border-rose-500/70 shadow-[0_0_20px_rgba(244,63,94,0.2)]' 
            : outcome === 'Overwhelming Success'
            ? 'bg-gradient-to-r from-cyan-950/80 via-slate-950/90 to-slate-950 border-cyan-500/70 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
            : outcome === 'Catastrophic Failure'
            ? 'bg-gradient-to-r from-red-950/80 via-slate-950/90 to-slate-950 border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            : 'bg-slate-950/90 border-slate-800'
        }`}>
          {/* Header with Label and Status Badges */}
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold">
              <TwoD10Icon size={15} className={isCritActive ? 'text-amber-400' : 'text-cyan-400'} />
              <span className="text-cyan-300 text-xs">{label || expression || 'Dice Check'}</span>
              {expression && label && <span className="text-slate-500 text-[10.5px]">({expression})</span>}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(msg.broadcastToVtt || msg.metadata?.broadcastToVtt) && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                  STAGE VTT
                </span>
              )}
              {advantageDice !== 0 && (
                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${
                  advantageDice > 0 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {advantageDice > 0 ? `+${advantageDice} ADV POOL` : `${advantageDice} DISADV POOL`}
                </span>
              )}
              {advantageDice === 0 && isAdvantage && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                  ADVANTAGE
                </span>
              )}
              {advantageDice === 0 && isDisadvantage && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold">
                  DISADVANTAGE
                </span>
              )}
              {outcome ? (
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                  outcome === 'Critical Success'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse'
                    : outcome === 'Critical Failure'
                    ? 'bg-red-500/20 text-red-300 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse'
                    : outcome === 'Overwhelming Success'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                    : outcome === 'Catastrophic Failure'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400'
                    : outcome === 'Success'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {outcome.toUpperCase()}
                </span>
              ) : (
                <>
                  {isCritActive && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded text-[9.5px] font-bold">
                      CRITICAL
                    </span>
                  )}
                  {isFumbleActive && (
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/50 rounded text-[9.5px] font-bold">
                      FUMBLE
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Result and Dice Pool Breakdown */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 pt-2 flex-wrap">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-white font-mono tracking-tight">
                {finalTotalVal}
              </span>
              {targetDCVal !== undefined && targetDCVal !== null && targetDCVal !== '' && (
                <span className={`text-xs font-bold ${
                  (outcome ? (outcome === 'Critical Success' || outcome === 'Overwhelming Success' || outcome === 'Success') : isSuccess)
                    ? 'text-emerald-400' 
                    : 'text-rose-400'
                }`}>
                  vs DC {targetDCVal} {margin !== null && margin !== undefined ? `(${margin >= 0 ? `+${margin}` : margin})` : ''}
                </span>
              )}
            </div>

            {/* VTT Transparency: Full dicePool array visually distinguishing keptDice */}
            {poolValues.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pool:</span>
                {poolValues.map((val, idx) => {
                  let isKept = false;
                  if (keptCounts[val] && keptCounts[val] > 0) {
                    isKept = true;
                    keptCounts[val]--;
                  }
                  return (
                    <span
                      key={idx}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono transition-all border ${
                        isKept
                          ? 'bg-amber-500/20 border-amber-400/80 text-amber-200 shadow-[0_0_6px_rgba(245,158,11,0.25)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500 line-through opacity-50'
                      }`}
                      title={isKept ? `Kept Die (${val})` : `Dropped Die (${val})`}
                    >
                      {val}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Telemetry Strip: Applied Modifiers and Dynamic Threat Thresholds */}
          <div className="flex items-center justify-between gap-2 border-t border-slate-800/40 mt-2 pt-1.5 text-[10px] text-slate-400 flex-wrap">
            <div className="flex items-center gap-2">
              {activeNatTotal !== null && (
                <span>Natural: <strong className="text-slate-200">{activeNatTotal}</strong></span>
              )}
              <span>Mod: <strong className="text-amber-300">{activeAppliedMod >= 0 ? `+${activeAppliedMod}` : activeAppliedMod}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[9.5px]">
              <span className="text-amber-400/90 font-bold">Crit &ge; {activeCritThresh}</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400/90 font-bold">Fumble &le; {activeFumbleThresh}</span>
            </div>
          </div>
        </div>
      );
    }

    // 3. Narrative RPG Action / Emote (/me, /act)
    if (msg.type === 'narrative_action') {
      return (
        <div className="mt-0.5 px-2 py-1 rounded-lg bg-purple-950/25 border-l-2 border-purple-500/60 text-purple-200 text-xs sm:text-sm font-serif italic leading-snug">
          <span className="font-sans font-bold text-purple-300 not-italic mr-1.5 font-mono text-xs">
            * {msg.senderHandle}
          </span>
          <ChatParser text={msg.text || ''} />
        </div>
      );
    }

    // 4. OOC Remark (/ooc)
    if (msg.type === 'ooc_remark') {
      return (
        <div className="text-xs sm:text-sm leading-snug text-slate-400 font-mono italic">
          <span className="text-slate-500 font-bold not-italic mr-1">(( OOC:</span>
          <ChatParser text={msg.text || ''} />
          <span className="text-slate-500 font-bold not-italic ml-1">))</span>
        </div>
      );
    }

    // 5. System Notification Message
    if (msg.type === 'system') {
      return (
        <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
          <Radio size={13} className="shrink-0 text-cyan-400 animate-soft-back-glow" />
          <span className="flex-1">{msg.text}</span>
        </div>
      );
    }

    // 6. Standard Text or In-Character Dialogue (High-contrast, crisp 13.5px text)
    return (
      <div className={`text-xs sm:text-sm leading-snug ${
        msg.isIC ? 'text-slate-100 font-sans font-medium' : 'text-slate-200 font-sans'
      }`}>
        <ChatParser text={msg.text || ''} />
      </div>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#090d16]">
      {/* Center Messages Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Channel Header Banner ── */}
        {activeChannel && (
          <div className="px-3.5 sm:px-4 py-2 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 shadow-sm z-10">
            <div className="min-w-0 flex items-center gap-2.5">
              {/* Channel Glyph Icon */}
              <div className={`p-1.5 rounded-lg border shrink-0 ${
                isTeamChannel 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : isDirectChannel 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : isPersonaLogChannel
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}>
                {isTeamChannel ? (
                  <Shield size={15} />
                ) : isDirectChannel ? (
                  <User size={15} />
                ) : isPersonaLogChannel ? (
                  <Activity size={15} />
                ) : (
                  <Radio size={15} />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold font-mono text-slate-100 flex items-center gap-1.5 truncate">
                    <span>{activeChannel.displayName || `#${activeChannel.name}`}</span>
                    {activeChannel.isPublic === false && (
                      <Lock size={12} className="text-amber-400 shrink-0" title="Private Encrypted Frequency" />
                    )}
                  </h3>

                  {isTeamChannel && (
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] rounded font-mono font-bold uppercase shrink-0">
                      SQUAD
                    </span>
                  )}

                  {isPersonaLogChannel && (
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] rounded font-mono font-bold uppercase shrink-0">
                      TELEMETRY
                    </span>
                  )}
                </div>

                <p className="text-[10px] sm:text-[10.5px] font-mono text-slate-400 truncate">
                  {activeChannel.topic || (isDirectChannel ? 'Direct encrypted point-to-point frequency' : 'Quantum transmission frequency')}
                </p>
              </div>
            </div>

            {/* Header Actions (Prominent Team Invite, Voice, Settings, Info) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 font-mono text-xs">
              {/* Prominent Invite Operator Button (Always visible on Team Channels & DMs) */}
              {(isTeamChannel || isDirectChannel || groups.length > 0) && (
                <button
                  type="button"
                  onClick={() => setIsQuickInviteOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 text-[10.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Invite Operators to Team / Copy Shareable Join Link"
                >
                  <UserPlus size={12} className="text-emerald-400" />
                  <span className="hidden sm:inline">INVITE TO SQUAD</span>
                  <span className="sm:hidden">INVITE</span>
                </button>
              )}

              {linkedTeam && (
                <button
                  type="button"
                  onClick={handleOpenTeamModal}
                  className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-[10.5px] font-bold transition-colors cursor-pointer"
                  title="Open Squad Management Hub"
                >
                  <Users size={12} />
                  <span>HUB</span>
                </button>
              )}

              {/* Live Voice Comms Action Button */}
              {!isPersonaLogChannel && (
                <button
                  type="button"
                  onClick={() => {
                    const targetRoom = `tangent_freq_${activeChannel.id}`;
                    if (isVoiceConnected && currentRoomName === targetRoom) {
                      disconnectVoiceRoom();
                    } else {
                      connectToVoiceRoom(targetRoom, activeChannel.displayName || activeChannel.name);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isVoiceConnected && currentRoomName === `tangent_freq_${activeChannel.id}`
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-soft-back-glow'
                      : 'bg-slate-900 hover:bg-cyan-950 text-cyan-300 hover:text-cyan-200 border-slate-700 hover:border-cyan-500/40'
                  }`}
                  title={
                    isVoiceConnected && currentRoomName === `tangent_freq_${activeChannel.id}`
                      ? 'Leave Voice Frequency'
                      : 'Connect Live Voice Transmission'
                  }
                >
                  <Radio size={12} className={isVoiceConnected && currentRoomName === `tangent_freq_${activeChannel.id}` ? 'animate-spin text-emerald-400' : 'text-cyan-400'} />
                  <span className="hidden sm:inline">
                    {isVoiceConnected && currentRoomName === `tangent_freq_${activeChannel.id}`
                      ? 'VOICE ACTIVE'
                      : 'VOICE COMMS'}
                  </span>
                </button>
              )}

              {!isPersonaLogChannel && (
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Frequency Settings"
                >
                  <Settings size={13} />
                </button>
              )}

              {/* Accessible Users & Roster Button */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1150, 0.02);
                  setIsUsersDrawerOpen(prev => !prev || usersDrawerTab !== 'users');
                  setUsersDrawerTab('users');
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  isUsersDrawerOpen && usersDrawerTab === 'users'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-cyan-300 hover:border-cyan-500/40'
                }`}
                title="Toggle Accessible Users & Roster Menu"
              >
                <Users size={13} className={isUsersDrawerOpen && usersDrawerTab === 'users' ? 'text-cyan-400' : 'text-slate-400'} />
                <span className="hidden sm:inline">USERS</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-800 text-cyan-300 border border-slate-700 font-bold">
                  {isTeamChannel ? (activeChannelUsers?.personas?.length || 0) : (onlineOperators?.length || 0)}
                </span>
              </button>

              {/* Channel Dossier & Technical Specs Button */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1150, 0.02);
                  if (isUsersDrawerOpen && usersDrawerTab === 'dossier') {
                    setIsUsersDrawerOpen(false);
                  } else {
                    setIsUsersDrawerOpen(true);
                    setUsersDrawerTab('dossier');
                  }
                }}
                className={`p-1.5 rounded-lg border text-[10.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isUsersDrawerOpen && usersDrawerTab === 'dossier'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-cyan-300'
                }`}
                title="Toggle Frequency Dossier & Technical Specs"
              >
                <Info size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ── Active Chat Context Banner ── */}
        {activeChannel && (
          <div className="px-3.5 sm:px-4 py-1.5 bg-[#090e18] border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs font-mono shrink-0 shadow-inner">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider border shrink-0 flex items-center gap-1.5 ${
                isTeamChannel
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                  : isDirectChannel
                  ? 'bg-purple-950/90 text-purple-300 border-purple-500/60'
                  : isPersonaLogChannel
                  ? 'bg-amber-950/90 text-amber-300 border-amber-500/60'
                  : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isTeamChannel ? 'bg-emerald-400 animate-soft-badge-glow shadow-[0_0_6px_#10b981]' : isDirectChannel ? 'bg-purple-400' : isPersonaLogChannel ? 'bg-amber-400' : 'bg-cyan-400 animate-soft-badge-glow shadow-[0_0_6px_#22d3ee]'
                }`} />
                <span>
                  {isTeamChannel 
                    ? 'TEAM FREQUENCY • ADDRESSING PERSONAS' 
                    : isDirectChannel 
                    ? (isCharacterDirect ? 'DIRECT COMMS • ADDRESSING PERSONA' : 'DIRECT COMMS • ADDRESSING OPERATOR')
                    : isPersonaLogChannel 
                    ? 'AUDIT TELEMETRY • READ ONLY' 
                    : 'STANDARD RELAY • ADDRESSING OPERATORS'}
                </span>
              </span>

              <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-[11px] truncate">
                <span className="text-slate-600">|</span>
                <span className="text-slate-500">Addressing Context:</span>
                {isTeamChannel ? (
                  <span className="text-emerald-300 font-semibold flex items-center gap-1 truncate">
                    <span>🎭 Persona (In-Character)</span>
                    <span className="text-slate-500 text-[10px] truncate">
                      (Transmitting as: {selectedPersona?.['char-name'] || selectedPersona?.name || 'Active Character'})
                    </span>
                  </span>
                ) : (
                  <span className="text-cyan-300 font-semibold flex items-center gap-1 truncate">
                    <span>👤 Operator (Out-of-Character)</span>
                    <span className="text-slate-500 text-[10px] truncate">
                      (Transmitting as: @{userHandle || currentUser?.displayName || 'Operator'})
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Link to Users Menu Drawer */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  setIsUsersDrawerOpen(true);
                  setUsersDrawerTab('users');
                }}
                className="text-[10.5px] text-cyan-400 hover:text-cyan-200 underline decoration-cyan-500/50 flex items-center gap-1.5 cursor-pointer font-bold"
                title="Open Accessible Users & Participants Menu"
              >
                <Users size={12} />
                <span>
                  {isTeamChannel 
                    ? `${activeChannelUsers?.personas?.length || 0} Team Personas` 
                    : `${onlineOperators?.length || 0} Active Operators`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Read-Only Notice for Log Channels */}
        {isPersonaLogChannel && (
          <div className="px-4 py-1.5 bg-amber-950/40 border-b border-amber-500/30 text-[10.5px] font-mono text-amber-300/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-amber-400 animate-soft-back-glow" />
              <span>AUTOMATED ENGINE BLACKBOX — Read-only session telemetry for this persona.</span>
            </div>
            <span className="font-bold text-[9px] bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/40">
              IMMUTABLE AUDIT
            </span>
          </div>
        )}

        {/* ── Pending Transmissions Notification Note for other channels ── */}
        {pendingCharacterNotes.some(n => n.channelId !== activeChannel?.id) && (
          <div className="px-4 py-1.5 bg-slate-950 border-b border-amber-500/30 text-[10.5px] font-mono text-amber-200 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-1.5 truncate">
              <Radio size={12} className="text-amber-400 animate-soft-back-glow shrink-0" />
              <span className="font-bold text-amber-300">PENDING TRANSMISSIONS:</span>
              <span className="truncate text-slate-300">
                {pendingCharacterNotes.filter(n => n.channelId !== activeChannel?.id).map(n => `${n.name} (${n.count})`).join(' • ')}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {pendingCharacterNotes.filter(n => n.channelId !== activeChannel?.id).slice(0, 3).map(n => (
                <button
                  key={n.channelId}
                  type="button"
                  onClick={() => selectChannel(n.channelId)}
                  className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-black font-bold text-[9px] border border-amber-500/40 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span>{n.type === 'character' ? '🎭' : '👤'}</span>
                  <span>{n.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main Message Stream (Style B: Tactical Sci-Fi Ledger) ── */}
        <div 
          ref={containerRef} 
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 select-text no-scrollbar bg-gradient-to-b from-[#080c14] to-[#0a0f1a]"
        >
          {loading && (
            <div className="py-12 flex items-center justify-center text-cyan-400 font-mono text-xs gap-2">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span>SYNCHRONIZING RELAY SIGNALS...</span>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="py-24 text-center space-y-2 select-none">
              <Radio size={28} className="mx-auto text-slate-600 animate-soft-back-glow" />
              <p className="text-xs font-mono font-bold text-slate-400">Frequency Clear. No transmissions logged.</p>
              <p className="text-[11px] font-mono text-slate-600">Transmit a signal or execute a tactical check to begin.</p>
            </div>
          )}

          {/* Render Messages with Consecutive Grouping */}
          {messages.map((msg, idx) => {
            const isSelf = currentUser && msg.senderId === currentUser.uid;
            const isIC = Boolean(msg.isIC);
            const isDice = msg.type === 'dice_roll';
            const isNarrative = msg.type === 'narrative_action';
            const isSystem = msg.type === 'system';
            const persona = msg.personaDetails;

            // Check if this message should be grouped with the previous message
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const isSameSender = prevMsg && (
              prevMsg.senderId === msg.senderId &&
              prevMsg.isIC === msg.isIC &&
              (prevMsg.personaDetails?.id || prevMsg.personaDetails?.name) === (persona?.id || persona?.name)
            );
            const timeDiffMs = prevMsg ? Math.abs(getMessageTimeMs(msg) - getMessageTimeMs(prevMsg)) : Infinity;
            const isGrouped = isSameSender && timeDiffMs < 5 * 60 * 1000 && !isDice && !isSystem && prevMsg.type !== 'system';

            // Style B: Sharp left accent border styling
            const borderAccentClass = isDice
              ? 'border-l-4 border-l-amber-500/80 bg-slate-900/50'
              : isIC
              ? 'border-l-4 border-l-purple-500/80 bg-purple-950/15'
              : isTeamChannel
              ? 'border-l-4 border-l-emerald-500/70 bg-slate-900/40'
              : isSelf
              ? 'border-l-4 border-l-cyan-500/80 bg-cyan-950/10'
              : 'border-l-4 border-l-slate-700 bg-slate-900/30';

            return (
              <div
                key={msg.id || idx}
                className={`group relative rounded-r-lg border-y border-r border-slate-800/60 px-2.5 pt-1.5 pb-1 sm:px-3 sm:pt-1.5 sm:pb-1 transition-all hover:border-slate-700 hover:bg-slate-900/60 ${borderAccentClass} ${
                  isGrouped ? 'mt-0.5 pt-0.5 pb-1 border-t-transparent' : 'mt-1.5'
                }`}
              >
                {/* Floating Hover Action Bar (Clean, uncluttered, revealed on hover/focus) */}
                <div className="absolute right-2 -top-3 hidden group-hover:flex items-center gap-1 bg-slate-900/95 border border-slate-700/80 rounded-lg p-0.5 shadow-lg z-20 backdrop-blur-sm select-none">
                  {/* Copy Text */}
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(msg.id, msg.text || msg.summary)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Copy transmission text"
                  >
                    {copiedMessageId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>

                  {/* Message Sender directly (Player DM) */}
                  {!isSelf && msg.senderUid && (
                    <button
                      type="button"
                      onClick={() => {
                        startDirectMessage({
                          uid: msg.senderUid,
                          userHandle: msg.senderHandle || 'Operator'
                        }, null);
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 text-[9px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title={`Open Direct Comms with @${msg.senderHandle}`}
                    >
                      <User size={10} />
                      <span>DM</span>
                    </button>
                  )}

                  {/* Message Persona directly (Character Whisper) */}
                  {!isSelf && isIC && persona?.name && msg.senderUid && (
                    <button
                      type="button"
                      onClick={() => {
                        startDirectMessage({
                          uid: msg.senderUid,
                          userHandle: msg.senderHandle || 'Operator'
                        }, persona);
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-purple-950 text-purple-300 hover:text-purple-100 text-[9px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title={`Whisper to persona ${persona.name}`}
                    >
                      <span>🎭 WHISPER</span>
                    </button>
                  )}

                  {/* Invite to Team */}
                  {!isSelf && msg.senderUid && groups.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsQuickInviteOpen(true)}
                      className="px-1.5 py-0.5 rounded hover:bg-emerald-950 text-emerald-400 hover:text-emerald-200 text-[9px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Invite to Tactical Squad"
                    >
                      <UserPlus size={10} />
                      <span>INVITE</span>
                    </button>
                  )}
                </div>

                {/* Message Header (Shown only if NOT grouped consecutively) */}
                {!isGrouped && (
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {/* Avatar Glyph */}
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 font-mono font-bold text-[10px] border ${
                        isTeamChannel
                          ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                          : isIC 
                          ? 'bg-purple-950 border-purple-500/60 text-purple-300' 
                          : isSelf 
                          ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {isTeamChannel ? (
                          (persona?.name || msg.senderHandle || 'P').charAt(0).toUpperCase()
                        ) : isIC ? (
                          (persona?.name || 'O').charAt(0).toUpperCase()
                        ) : msg.type === 'system' ? (
                          <Bot size={11} />
                        ) : (
                          <User size={11} />
                        )}
                      </div>

                      {/* Sender Name & Badges */}
                      {isTeamChannel ? (
                        /* Team Channel: Address Persona (Character) */
                        <>
                          <span className="text-xs font-mono font-bold text-emerald-300 truncate">
                            {persona?.name || msg.senderHandle || 'Persona'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase truncate max-w-[200px]">
                            {persona?.role || persona?.species || 'Character'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            (@{msg.operatorHandle || msg.senderHandle || 'Operator'})
                          </span>
                        </>
                      ) : (
                        /* Standard Channel: Address Operator (Player) */
                        <>
                          <span className={`text-xs font-mono font-bold truncate ${
                            isSelf ? 'text-cyan-300' : 'text-slate-100'
                          }`}>
                            @{msg.operatorHandle || msg.senderHandle || 'Operator'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold uppercase">
                            OPERATOR
                          </span>
                          {isIC && persona?.name && (
                            <span className="text-[9.5px] font-mono text-purple-300/80 truncate">
                              (acting as 🎭 {persona.name})
                            </span>
                          )}
                        </>
                      )}

                      {/* Addressed whisper label */}
                      {msg.targetPersona?.name && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold flex items-center gap-1">
                          <CornerDownRight size={9} />
                          <span>to {msg.targetPersona.name}</span>
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {formatTimestamp(msg)}
                    </span>
                  </div>
                )}

                {/* Body Content */}
                <div className={`${isGrouped ? 'pl-7' : 'pl-7'} min-w-0`}>
                  {renderMessageContent(msg)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Accessible Right Drawer: Users Roster Menu & Channel Dossier ── */}
      {isUsersDrawerOpen && activeChannel && (
        <aside className="w-80 sm:w-88 md:w-96 border-l border-slate-800 bg-[#080c14]/95 backdrop-blur-md flex flex-col font-mono text-xs animate-in slide-in-from-right duration-200 overflow-hidden select-none shrink-0 z-20 shadow-2xl">
          {/* Top Tabs: USERS vs DOSSIER */}
          <div className="p-2.5 pb-2 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/90 shrink-0">
            <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  setUsersDrawerTab('users');
                }}
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  usersDrawerTab === 'users'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users size={12} className={usersDrawerTab === 'users' ? 'text-cyan-400' : 'text-slate-500'} />
                <span>ROSTER ({isTeamChannel ? (activeChannelUsers?.personas?.length || 0) : (onlineOperators?.length || 0)})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  setUsersDrawerTab('dossier');
                }}
                className={`px-2 py-1 rounded-md text-[10.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  usersDrawerTab === 'dossier'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Info size={12} className={usersDrawerTab === 'dossier' ? 'text-cyan-400' : 'text-slate-500'} />
                <span>DOSSIER</span>
              </button>
            </div>

            <button
              onClick={() => setIsUsersDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Users Menu"
            >
              <X size={15} />
            </button>
          </div>

          {/* TAB 1: USERS & PERSONAS ROSTER */}
          {usersDrawerTab === 'users' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Search input */}
              <div className="p-2.5 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder={isTeamChannel ? "Filter squad personas..." : "Filter network operators..."}
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 text-[11px] focus:outline-none focus:border-cyan-500/60"
                  />
                  {userSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Roster List Scroll Area */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-3 no-scrollbar">
                {/* ── If Team Channel: Display Enrolled Personas as primary ── */}
                {isTeamChannel ? (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-1">
                        <span className="flex items-center gap-1.5">
                          <Shield size={11} />
                          <span>TEAM PERSONAS ({filteredTeamPersonas.length})</span>
                        </span>
                        <span className="text-[9px] text-slate-500">Addressing</span>
                      </div>

                      {filteredTeamPersonas.length === 0 ? (
                        <div className="p-3 text-center text-slate-500 text-[11px] italic bg-slate-900/30 rounded-lg border border-slate-800/50">
                          {userSearchQuery ? 'No matching personas found.' : 'No character personas enrolled in this team.'}
                        </div>
                      ) : (
                        filteredTeamPersonas.map((p) => {
                          const isSelf = currentUser && p.ownerUid === currentUser.uid;
                          return (
                            <div
                              key={p.id || p.name}
                              className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex items-center justify-between gap-2 shadow-sm group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">
                                  {p.avatar ? (
                                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                                  ) : (
                                    <span>🎭</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-100 text-xs truncate">{p.name}</span>
                                    {isSelf && <span className="text-[9px] text-emerald-400 font-bold">(YOU)</span>}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                                    <span className="text-emerald-400/90">{p.role || p.species || 'Specialist'}</span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-slate-400 truncate">@{p.ownerHandle || 'Operator'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons */}
                              {!isSelf && p.ownerUid && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      AudioService.playTerminalBeep(1200, 0.02);
                                      startDirectMessage({ uid: p.ownerUid, userHandle: p.ownerHandle }, p);
                                    }}
                                    className="p-1 px-1.5 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-[9.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                    title={`Whisper directly to persona ${p.name}`}
                                  >
                                    <span>WHISPER</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      AudioService.playTerminalBeep(1200, 0.02);
                                      startDirectMessage({ uid: p.ownerUid, userHandle: p.ownerHandle }, null);
                                    }}
                                    className="p-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                    title={`DM Player @${p.ownerHandle}`}
                                  >
                                    <span>DM</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Team Operators Section */}
                    {activeChannelUsers.operators.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1 block">
                          SQUAD OPERATORS ({activeChannelUsers.operators.length})
                        </span>
                        <div className="space-y-1">
                          {activeChannelUsers.operators.map((u) => {
                            const isSelf = currentUser && u.uid === currentUser.uid;
                            return (
                              <div
                                key={u.uid}
                                className="px-2 py-1.5 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between text-[11px]"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={`w-1.5 h-1.5 rounded-full ${u.isOnline ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-slate-600'}`} />
                                  <span className="text-slate-300 font-bold truncate">@{u.userHandle || u.displayName}</span>
                                  {isSelf && <span className="text-[9px] text-cyan-400">(YOU)</span>}
                                </div>
                                {!isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => startDirectMessage(u, null)}
                                    className="text-[9.5px] text-cyan-400 hover:text-cyan-200"
                                  >
                                    DM
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quick Invite to Squad Action */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setIsQuickInviteOpen(true)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <UserPlus size={13} />
                        <span>INVITE OPERATOR TO SQUAD</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── If Standard Channel: Display Online & Network Operators ── */
                  <>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold uppercase tracking-wider px-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-soft-badge-glow shadow-[0_0_6px_#10b981]" />
                          <span>ACTIVE OPERATORS ({filteredOnlineOps.length})</span>
                        </span>
                        <span className="text-[9px] text-slate-500">HoloNet</span>
                      </div>

                      {filteredOnlineOps.length === 0 ? (
                        <div className="p-3 text-center text-slate-500 text-[11px] italic bg-slate-900/30 rounded-lg border border-slate-800/50">
                          No matching active operators.
                        </div>
                      ) : (
                        filteredOnlineOps.map((user) => {
                          const isSelf = currentUser && user.uid === currentUser.uid;
                          const primaryPersona = Array.isArray(user.characters) && user.characters.length > 0 ? user.characters[0] : null;
                          return (
                            <div
                              key={user.uid}
                              className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-2 shadow-sm"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">
                                  <User size={13} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-100 text-xs truncate">@{user.userHandle || user.displayName}</span>
                                    {isSelf && <span className="text-[9px] text-cyan-400 font-bold">(YOU)</span>}
                                  </div>
                                  {primaryPersona ? (
                                    <span className="text-[10px] text-purple-300/90 block truncate">
                                      🎭 {primaryPersona.name || primaryPersona['char-name']} ({primaryPersona.role || primaryPersona.species || 'Persona'})
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-emerald-400 block">Operator Active</span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              {!isSelf && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      AudioService.playTerminalBeep(1200, 0.02);
                                      startDirectMessage(user, null);
                                    }}
                                    className="p-1 px-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[9.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                    title={`DM Player @${user.userHandle}`}
                                  >
                                    <span>DM</span>
                                  </button>
                                  {primaryPersona && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        AudioService.playTerminalBeep(1200, 0.02);
                                        startDirectMessage(user, primaryPersona);
                                      }}
                                      className="p-1 px-1.5 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-[9.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                      title={`Whisper to ${primaryPersona.name}`}
                                    >
                                      <span>WHISPER</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Offline Operators Collapsible */}
                    {filteredOfflineOps.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => setIsOfflineCollapsed(prev => !prev)}
                          className="w-full flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1 hover:text-slate-300 cursor-pointer"
                        >
                          <span>OFFLINE OPERATORS ({filteredOfflineOps.length})</span>
                          <ChevronDown size={12} className={`transition-transform ${isOfflineCollapsed ? '-rotate-90' : ''}`} />
                        </button>

                        {!isOfflineCollapsed && (
                          <div className="space-y-1 pt-1">
                            {filteredOfflineOps.map((user) => (
                              <div
                                key={user.uid}
                                className="px-2 py-1.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center justify-between text-[11px] text-slate-400"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                  <span className="truncate">@{user.userHandle || user.displayName}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => startDirectMessage(user, null)}
                                  className="text-[9.5px] text-slate-400 hover:text-cyan-300"
                                >
                                  DM
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CHANNEL DOSSIER */}
          {usersDrawerTab === 'dossier' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
              {/* Quick Invite Button inside Dossier */}
              {(isTeamChannel || isDirectChannel || groups.length > 0) && (
                <button
                  type="button"
                  onClick={() => setIsQuickInviteOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <UserPlus size={13} />
                  <span>INVITE OPERATOR TO SQUAD</span>
                </button>
              )}

              {/* Channel Specs */}
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[9.5px] block font-bold uppercase">DIRECTIVE / TOPIC</span>
                  <p className="text-slate-200 font-sans text-xs leading-relaxed">{activeChannel.topic || 'No topic assigned.'}</p>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">ADDRESSING CONVENTION</span>
                  <span className={`font-bold ${isTeamChannel ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {isTeamChannel ? 'PERSONAS (CHARACTERS)' : 'OPERATORS (PLAYERS)'}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">ENCRYPTION PROTOCOL</span>
                  <span className="text-emerald-400 font-bold">AES-GCM-256</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">RELAY FREQ ID</span>
                  <span className="text-cyan-400 font-bold">{activeChannel.id.substring(0, 16)}</span>
                </div>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Quick Team Invite Modal */}
      {isQuickInviteOpen && (
        <QuickTeamInviteModal
          isOpen={isQuickInviteOpen}
          onClose={() => setIsQuickInviteOpen(false)}
          defaultGroupId={activeChannel?.groupId || linkedTeam?.id}
        />
      )}

      {/* Channel Settings Modal */}
      {isSettingsModalOpen && (
        <ChannelSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          channel={activeChannel}
          messages={messages}
        />
      )}

      {/* Team Modal */}
      {isTeamModalOpen && linkedTeam && (
        <GameGroupModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          group={linkedTeam}
        />
      )}
    </div>
  );
};

export default MessageView;
