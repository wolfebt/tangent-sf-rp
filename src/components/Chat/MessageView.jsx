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
  X,
  BookOpen,
  Map,
  Crown
} from 'lucide-react';
import ChatParser from '../UI/ChatParser';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useVoiceChat } from '../../context/VoiceChatContext';
import { useGroup } from '../../context/GroupContext';
import { useToast } from '../../context/ToastContext';
import { AudioService } from '../../services/audioService';
import { TwoD10Icon } from '../UI/TwoD10Icon';
import { GameGroupModal } from '../Squads/SquadModal';
import { ChannelSettingsModal } from './ChannelSettingsModal';
import { QuickTeamInviteModal } from './QuickTeamInviteModal';

/**
 * @component MessageView
 * @description Clear, high-contrast, compact tactical sci-fi ledger for chat messages.
 * Features a single consolidated 48px Context Header (saving ~170px vertical space),
 * smart message grouping, interactive Operator/Persona Dossier Popover cards,
 * and unified Zone 4 Right Inspector Drawer toggles.
 */
export const MessageView = ({
  messages = [],
  loading = false,
  activeChannel,
  activeInspectorTab = null,
  onToggleInspectorTab = null,
  docketBlocksCount = 0,
  uncheckedDocketCount = 0,
  onBackToSidebar = null,
  onOpenSquadHub = null
}) => {
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
    userDirectory = [],
    selectedPersona,
    speakingMode,
    replyingToMessage,
    setReplyingToMessage,
    toggleMessageReaction
  } = useChat();
  const { 
    isConnected: isVoiceConnected, 
    currentRoomName, 
    connectToVoiceRoom, 
    disconnectVoiceRoom 
  } = useVoiceChat();
  const { 
    groups = [], 
    selectGroup, 
    openInviteConfirmation, 
    declineInvite,
    toggleArchitectBlockAck
  } = useGroup() || {};
  const { toast } = useToast() || { toast: () => {} };
  
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false);
  const [preselectedInviteUser, setPreselectedInviteUser] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [inspectedSender, setInspectedSender] = useState(null);
  
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
    ? (groups.find(g => g.id === activeChannel?.groupId || g.channelId === activeChannel?.id || `group_chan_${g.id}` === activeChannel?.id) || null)
    : null;

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

  const parseMessageDate = (msg) => {
    if (!msg) return null;
    if (msg.createdAt?.toDate) {
      return msg.createdAt.toDate();
    }
    if (typeof msg.createdAt?.seconds === 'number') {
      return new Date(msg.createdAt.seconds * 1000);
    }
    if (msg.createdLocalAt) {
      return new Date(msg.createdLocalAt);
    }
    if (msg.createdAt) {
      return new Date(msg.createdAt);
    }
    if (msg.timestamp?.toDate) {
      return msg.timestamp.toDate();
    }
    if (typeof msg.timestamp?.seconds === 'number') {
      return new Date(msg.timestamp.seconds * 1000);
    }
    if (msg.timestamp) {
      return new Date(msg.timestamp);
    }
    return null;
  };

  const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const formatTimestamp = (msg) => {
    const d = parseMessageDate(msg);
    if (!d || isNaN(d.getTime())) return '';
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTHS_SHORT[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${hours}:${minutes} - ${day}${month}${year}`;
  };

  const getMessageTimeMs = (msg) => {
    const d = parseMessageDate(msg);
    return d && !isNaN(d.getTime()) ? d.getTime() : 0;
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
    const isSelf = Boolean(currentUser?.uid && (msg.senderId === currentUser.uid || msg.senderUid === currentUser.uid));
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

    // 5. Interactive Squad Invite Card
    if (msg.type === 'squad_invite') {
      const inviteId = msg.inviteId || msg.metadata?.inviteId;
      const groupId = msg.groupId || msg.metadata?.groupId;
      const groupName = msg.groupName || msg.metadata?.groupName || 'Tactical Team';
      const faction = msg.faction || msg.metadata?.faction || 'Independent';
      const joinCode = msg.joinCode || msg.metadata?.joinCode;
      const matchedGrp = groups.find(g => g.id === groupId);
      const isAlreadyMember = Boolean(currentUser?.uid && matchedGrp?.members?.includes(currentUser.uid));
      const inviteStatus = msg.inviteStatus || 'pending';

      return (
        <div className="mt-1 p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-950 to-slate-950 border border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] font-mono text-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Shield size={14} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  TACTICAL TEAM COMMISSION
                </span>
                <span className="text-sm font-bold text-white">{groupName}</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[9.5px] font-bold">
              {faction}
            </span>
          </div>

          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            {msg.text || `You have been invited to join "${groupName}". Select a character persona from your Folio to deploy into this team.`}
          </p>

          {joinCode && (
            <div className="text-[10px] text-slate-400">
              JOIN CODE: <strong className="text-cyan-300 tracking-widest">{joinCode}</strong>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            {isAlreadyMember || inviteStatus === 'accepted' ? (
              <button
                type="button"
                onClick={() => {
                  const targetChanId = matchedGrp?.channelId || (groupId ? `group_chan_${groupId}` : null);
                  if (targetChanId) selectChannel(targetChanId);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/60 text-emerald-200 font-bold text-[10.5px] flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={12} />
                <span>ENROLLED IN TEAM — OPEN FREQUENCY</span>
              </button>
            ) : inviteStatus === 'declined' ? (
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-bold">
                COMMISSION DECLINED
              </span>
            ) : !isSelf ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1400, 0.03);
                    openInviteConfirmation?.({
                      id: inviteId || `direct_join_${groupId}`,
                      groupId,
                      groupName,
                      fromUserId: msg.senderUid || msg.senderId,
                      fromUserHandle: msg.operatorHandle || msg.senderHandle || 'Architect'
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10.5px] shadow-md transition-all cursor-pointer"
                >
                  REVIEW & ACCEPT COMMISSION
                </button>
                {inviteId && (
                  <button
                    type="button"
                    onClick={() => declineInvite?.(inviteId)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10.5px] font-bold transition-colors cursor-pointer"
                  >
                    DECLINE
                  </button>
                )}
              </>
            ) : (
              <span className="text-[10px] text-emerald-400/80 italic">
                Commission transmitted to recipient.
              </span>
            )}
          </div>
        </div>
      );
    }

    // 6. Tactical Docket Directive Pulse Card
    if (msg.type === 'docket_directive' && msg.metadata) {
      const meta = msg.metadata;
      const checklist = Array.isArray(meta.checklist) ? meta.checklist : [];
      const acks = Array.isArray(meta.acknowledgedBy) ? meta.acknowledgedBy : [];

      return (
        <div className="mt-1 p-3 rounded-xl bg-gradient-to-r from-rose-950/70 via-slate-950 to-slate-950 border border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)] font-mono text-xs space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold uppercase">
                TACTICAL DOCKET // {(meta.category || 'INTEL').toUpperCase()}
              </span>
              {meta.status && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold uppercase">
                  {meta.status.toUpperCase()}
                </span>
              )}
            </div>
            {meta.checklistSummary && (
              <span className="text-[10px] text-amber-300 font-bold">
                CHECKLIST: {meta.checklistSummary}
              </span>
            )}
          </div>

          <div className="font-bold text-white text-xs sm:text-sm">
            {meta.title}
          </div>

          {meta.content && (
            <div className="text-slate-200 font-sans text-xs leading-relaxed bg-slate-900/70 p-2 rounded-lg border border-slate-800">
              <ChatParser text={meta.content} />
            </div>
          )}

          {checklist.length > 0 && (
            <div className="space-y-1 pt-0.5">
              {checklist.map((item, i) => {
                const isDone = Boolean(item.completed ?? item.done);
                return (
                  <div key={item.id || i} className="flex items-center gap-1.5 text-[11px] font-sans">
                    <span className={isDone ? 'text-emerald-400' : 'text-slate-500'}>
                      {isDone ? '☑' : '☐'}
                    </span>
                    <span className={isDone ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {meta.blockId && toggleArchitectBlockAck && currentUser && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-[9.5px] text-slate-400">
                {acks.length > 0 ? `Acknowledged by ${acks.length} operative(s)` : 'Awaiting team acknowledgment'}
              </span>
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1500, 0.025);
                  toggleArchitectBlockAck({
                    channelId: activeChannel?.id,
                    groupId: meta.groupId || linkedTeam?.id,
                    blockId: meta.blockId,
                    ackEntry: {
                      uid: currentUser.uid,
                      operatorHandle: userHandle || currentUser.displayName || 'Operative',
                      personaId: selectedPersona?.id || selectedPersona?.['character-doc-id'] || null,
                      personaName: selectedPersona?.name || selectedPersona?.['char-name'] || userHandle || 'Operative'
                    }
                  });
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Check size={10} />
                <span>ACK DIRECTIVE</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    // 7. System Notification Message
    if (msg.type === 'system') {
      return (
        <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
          <Radio size={13} className="shrink-0 text-cyan-400 animate-soft-back-glow" />
          <span className="flex-1">{msg.text}</span>
        </div>
      );
    }

    // 8. Standard Text, Architect Directive, or In-Character Dialogue (High-contrast, crisp 13.5px text)
    return (
      <div className={`text-xs sm:text-sm leading-snug ${
        msg.isArchitect || msg.senderType === 'architect' || msg.type === 'architect_transmission'
          ? 'text-amber-100 font-sans font-medium'
          : msg.isIC
          ? 'text-slate-100 font-sans font-medium'
          : 'text-slate-200 font-sans'
      }`}>
        <ChatParser text={msg.text || ''} />
      </div>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#090d16]">
      {/* Center Messages Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Single Consolidated 48px Channel Header Banner (Replaces 4 Stacked Headers) ── */}
        {activeChannel && (
          <div className="px-3 sm:px-4 h-12 bg-slate-950/95 border-b border-slate-800/90 flex items-center justify-between gap-2 shrink-0 shadow-sm z-10">
            <div className="min-w-0 flex items-center gap-2 sm:gap-2.5 flex-1">
              {/* Mobile Back Button to Channels */}
              {onBackToSidebar && (
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1000, 0.02);
                    onBackToSidebar();
                  }}
                  className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 font-bold text-[10px] font-mono shrink-0 transition-colors cursor-pointer"
                  title="Back to Channels list"
                >
                  <ChevronLeft size={13} />
                  <span>FREQS</span>
                </button>
              )}

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
                  <Shield size={14} />
                ) : isDirectChannel ? (
                  <User size={14} />
                ) : isPersonaLogChannel ? (
                  <Activity size={14} />
                ) : (
                  <Radio size={14} />
                )}
              </div>

              <div className="min-w-0 flex items-center gap-2 flex-1">
                <h3 className="text-xs sm:text-sm font-bold font-mono text-slate-100 flex items-center gap-1.5 truncate shrink-0">
                  <span className="truncate max-w-[160px] sm:max-w-[240px]">
                    {activeChannel.displayName || `#${activeChannel.name}`}
                  </span>
                  {activeChannel.isPublic === false && (
                    <Lock size={11} className="text-amber-400 shrink-0" title="Private Encrypted Frequency" />
                  )}
                </h3>

                {/* Addressing Mode Pill */}
                <span className={`hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border shrink-0 ${
                  isTeamChannel
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : isDirectChannel && isCharacterDirect
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : isPersonaLogChannel
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                }`}>
                  <span>
                    {isTeamChannel
                      ? '🎭 TEAM IC'
                      : isDirectChannel && isCharacterDirect
                      ? '🎭 PERSONA DM'
                      : isPersonaLogChannel
                      ? 'TELEMETRY'
                      : '👤 OPERATORS'}
                  </span>
                </span>

                {activeChannel.topic && (
                  <span className="hidden xl:inline text-[11px] font-mono text-slate-500 truncate border-l border-slate-800 pl-2">
                    {activeChannel.topic}
                  </span>
                )}
              </div>
            </div>

            {/* Header Actions & Zone 4 Contextual Inspector Toggles */}
            <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs">
              {/* Invite Operator Button (Team Channels Only) */}
              {isTeamChannel && (
                <button
                  type="button"
                  onClick={() => {
                    setPreselectedInviteUser(null);
                    setIsQuickInviteOpen(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Invite Operators to Team / Copy Join Link"
                >
                  <UserPlus size={12} className="text-emerald-400" />
                  <span className="hidden lg:inline">INVITE</span>
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
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
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
                  <span className="hidden md:inline">
                    {isVoiceConnected && currentRoomName === `tangent_freq_${activeChannel.id}`
                      ? 'VOICE LIVE'
                      : 'VOICE'}
                  </span>
                </button>
              )}

              {!isPersonaLogChannel && (
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Edit Frequency Details & Name"
                >
                  <Edit3 size={12} className="text-cyan-400" />
                </button>
              )}

              <div className="h-4 w-px bg-slate-800 mx-0.5" />

              {/* Zone 4 Unified Inspector Toggles */}
              {onToggleInspectorTab && (
                <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800">
                  {/* 1. Roster Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1150, 0.02);
                      onToggleInspectorTab('roster');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      activeInspectorTab === 'roster'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Toggle Channel / Team Roster Inspector"
                  >
                    <Users size={12} />
                    <span className="hidden md:inline">ROSTER</span>
                    <span className="px-1 py-0.1 rounded-full text-[8.5px] bg-slate-800 text-cyan-300">
                      {isTeamChannel ? (activeChannelUsers?.personas?.length || 0) : (onlineOperators?.length || 0)}
                    </span>
                  </button>

                  {/* 2. Tactical Docket Toggle (with Unchecked Alert Pulse!) */}
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1150, 0.02);
                      onToggleInspectorTab('docket');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      uncheckedDocketCount > 0
                        ? 'bg-amber-950/80 text-amber-200 border border-amber-500/80 animate-nav-pulse-amber'
                        : activeInspectorTab === 'docket'
                        ? 'bg-rose-950/90 text-rose-200 border border-rose-500/60 shadow-sm'
                        : 'text-slate-400 hover:text-rose-300'
                    }`}
                    title="Toggle Architect Tactical Docket"
                  >
                    <BookOpen size={12} className={uncheckedDocketCount > 0 ? 'text-amber-300' : 'text-rose-400'} />
                    <span className="hidden sm:inline">DOCKET</span>
                    {uncheckedDocketCount > 0 ? (
                      <span className="px-1 py-0.1 rounded-full bg-amber-400 text-black text-[8.5px] font-black">
                        {uncheckedDocketCount}!
                      </span>
                    ) : docketBlocksCount > 0 ? (
                      <span className="px-1 py-0.1 rounded-full bg-slate-800 text-rose-300 text-[8.5px]">
                        {docketBlocksCount}
                      </span>
                    ) : null}
                  </button>

                  {/* 3. VTT Stage Telemetry Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1150, 0.02);
                      onToggleInspectorTab('vtt');
                    }}
                    className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      activeInspectorTab === 'vtt'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-sm'
                        : 'text-slate-400 hover:text-amber-300'
                    }`}
                    title="Toggle Stage VTT Telemetry Panel"
                  >
                    <Map size={12} />
                  </button>

                  {/* 4. Audit / Channel Info Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1150, 0.02);
                      onToggleInspectorTab('audit');
                    }}
                    className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      activeInspectorTab === 'audit'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-sm'
                        : 'text-slate-400 hover:text-cyan-300'
                    }`}
                    title="Toggle Channel Dossier & Persona Audit Log"
                  >
                    <Info size={12} />
                  </button>
                </div>
              )}
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
            const isArchitect = Boolean(msg.isArchitect || msg.senderType === 'architect' || msg.type === 'architect_transmission');
            const isDice = msg.type === 'dice_roll';
            const isNarrative = msg.type === 'narrative_action';
            const isSystem = msg.type === 'system' || msg.type === 'squad_invite' || msg.type === 'docket_directive';
            const persona = msg.personaDetails;

            // Check if this message should be grouped with the previous message
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const prevIsArchitect = Boolean(prevMsg && (prevMsg.isArchitect || prevMsg.senderType === 'architect' || prevMsg.type === 'architect_transmission'));
            const isSameSender = prevMsg && (
              prevMsg.senderId === msg.senderId &&
              prevIsArchitect === isArchitect &&
              prevMsg.isIC === msg.isIC &&
              (prevMsg.personaDetails?.id || prevMsg.personaDetails?.name) === (persona?.id || persona?.name)
            );
            const timeDiffMs = prevMsg ? Math.abs(getMessageTimeMs(msg) - getMessageTimeMs(prevMsg)) : Infinity;
            const isGrouped = isSameSender && timeDiffMs < 5 * 60 * 1000 && !isDice && !isSystem && !msg.replyTo && prevMsg.type !== 'system' && prevMsg.type !== 'squad_invite' && prevMsg.type !== 'docket_directive';

            // Style B: Sharp left accent border styling
            const borderAccentClass = isDice
              ? 'border-l-4 border-l-amber-500/80 bg-slate-900/50'
              : isArchitect
              ? 'border-l-4 border-l-amber-400/90 bg-amber-950/20'
              : isIC
              ? 'border-l-4 border-l-purple-500/80 bg-purple-950/15'
              : isTeamChannel
              ? 'border-l-4 border-l-emerald-500/70 bg-slate-900/40'
              : isSelf
              ? 'border-l-4 border-l-cyan-500/80 bg-cyan-950/10'
              : 'border-l-4 border-l-slate-700 bg-slate-900/30';

            const reactionEntries = msg.reactions && typeof msg.reactions === 'object'
              ? Object.entries(msg.reactions).filter(([, data]) => Array.isArray(data?.uids) && data.uids.length > 0)
              : [];

            return (
              <div
                key={msg.id || idx}
                className={`group relative rounded-r-lg border-y border-r border-slate-800/60 px-2.5 pt-1.5 pb-1 sm:px-3 sm:pt-1.5 sm:pb-1 transition-all hover:border-slate-700 hover:bg-slate-900/60 ${borderAccentClass} ${
                  isGrouped ? 'mt-0.5 pt-0.5 pb-1 border-t-transparent' : 'mt-1.5'
                }`}
              >
                {/* Floating Hover Action Bar (Clean, uncluttered, revealed on hover/focus) */}
                <div className="absolute right-2 -top-3 hidden group-hover:flex items-center gap-1 bg-slate-900/95 border border-slate-700/80 rounded-lg p-0.5 shadow-lg z-20 backdrop-blur-sm select-none">
                  {/* Quick Emoji Reactions */}
                  {msg.id && toggleMessageReaction && (
                    <div className="flex items-center gap-0.5 border-r border-slate-800 pr-1 mr-0.5">
                      {['👍', '🎯', '⚡', '🎲', '🔥'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => toggleMessageReaction(msg.id, emoji)}
                          className="p-0.5 px-1 rounded hover:bg-slate-800 text-[10px] transition-transform hover:scale-110 cursor-pointer"
                          title={`React ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quote Reply */}
                  {setReplyingToMessage && (
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(1150, 0.015);
                        setReplyingToMessage(msg);
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-[9px] font-mono font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                      title="Quote-Reply to this transmission"
                    >
                      <CornerDownRight size={10} />
                      <span>REPLY</span>
                    </button>
                  )}

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
                          userHandle: msg.operatorHandle || msg.senderHandle || 'Operator'
                        }, null);
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 text-[9px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title={`Open Direct Comms with @${msg.operatorHandle || msg.senderHandle}`}
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
                          userHandle: msg.operatorHandle || msg.senderHandle || 'Operator'
                        }, persona);
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-purple-950 text-purple-300 hover:text-purple-100 text-[9px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title={`Whisper to persona ${persona.name}`}
                    >
                      <span>🎭 WHISPER</span>
                    </button>
                  )}

                  {/* Invite to Team (passes sender as preselectedInviteUser!) */}
                  {!isSelf && msg.senderUid && groups.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreselectedInviteUser({
                          uid: msg.senderUid,
                          userHandle: msg.operatorHandle || msg.senderHandle || 'Operator',
                          displayName: msg.operatorHandle || msg.senderHandle || 'Operator'
                        });
                        setIsQuickInviteOpen(true);
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-emerald-950 text-emerald-400 hover:text-emerald-200 text-[9px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title={`Invite @${msg.operatorHandle || msg.senderHandle} to Tactical Team`}
                    >
                      <UserPlus size={10} />
                      <span>INVITE</span>
                    </button>
                  )}
                </div>

                {/* Quote-Reply Reference Header */}
                {msg.replyTo && (
                  <div className="mb-1 pl-7 flex items-center gap-1.5 text-[10px] font-mono text-slate-400 truncate">
                    <CornerDownRight size={11} className="text-cyan-400 shrink-0" />
                    <span className="font-bold text-cyan-300 shrink-0">@{msg.replyTo.senderHandle}:</span>
                    <span className="truncate italic text-slate-400 bg-slate-900/70 px-1.5 py-0.2 rounded border border-slate-800">
                      "{msg.replyTo.snippet}"
                    </span>
                  </div>
                )}

                {/* Message Header (Shown only if NOT grouped consecutively) */}
                {!isGrouped && (
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div
                      onClick={() => {
                        if (msg.type === 'system') return;
                        AudioService.playTerminalBeep(1200, 0.015);
                        const opUser = userDirectory.find(u => u.uid === msg.senderUid || u.uid === msg.senderId) || null;
                        setInspectedSender({
                          uid: msg.senderUid || msg.senderId,
                          operatorHandle: msg.operatorHandle || msg.senderHandle || 'Operator',
                          persona: persona || opUser?.currentPersona || opUser?.characters?.[0] || null,
                          isIC: Boolean(isIC || isTeamChannel),
                          isOnline: Boolean(opUser?.isOnline || isSelf),
                          activityLabel: opUser?.activity?.label || opUser?.statusMessage || 'Active on Terran Net',
                          userObj: opUser
                        });
                      }}
                      className="flex items-center gap-2 flex-wrap min-w-0 cursor-pointer hover:opacity-90"
                      title="Click to inspect Operator & Persona Tactical Card"
                    >
                      {/* Avatar Glyph */}
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 font-mono font-bold text-[10px] border ${
                        isArchitect
                          ? 'bg-amber-950/90 border-amber-500/70 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                          : isTeamChannel
                          ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                          : isIC 
                          ? 'bg-purple-950 border-purple-500/60 text-purple-300' 
                          : isSelf 
                          ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {isArchitect ? (
                          <Crown size={11} className="text-amber-400" />
                        ) : isTeamChannel ? (
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
                      {isArchitect ? (
                        /* Architect / Gamemaster / Referee Authority Header */
                        <>
                          <span className="text-xs font-mono font-bold text-amber-300 hover:underline truncate">
                            ARCHITECT
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold uppercase truncate">
                            {msg.architectDetails?.role || 'GM // REFEREE'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            (@{msg.operatorHandle || msg.senderHandle || 'Operator'})
                          </span>
                        </>
                      ) : isTeamChannel ? (
                        /* Team Channel: Address Persona (Character) */
                        <>
                          <span className="text-xs font-mono font-bold text-emerald-300 hover:underline truncate">
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
                          <span className={`text-xs font-mono font-bold hover:underline truncate ${
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
                <div className="pl-7 min-w-0">
                  {renderMessageContent(msg)}

                  {/* Emoji Reactions Bar */}
                  {reactionEntries.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mt-1.5 select-none">
                      {reactionEntries.map(([emoji, data]) => {
                        const myReaction = Boolean(currentUser?.uid && data.uids.includes(currentUser.uid));
                        const handles = Array.isArray(data.handles) ? data.handles.join(', ') : '';
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => toggleMessageReaction?.(msg.id, emoji)}
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                              myReaction
                                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/60 shadow-sm'
                                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                            title={handles ? `Reacted by: ${handles}` : 'Toggle reaction'}
                          >
                            <span>{emoji}</span>
                            <span>{data.uids.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Tactical Operator & Persona Popover Card Overlay ── */}
        {inspectedSender && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setInspectedSender(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-slate-950 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] p-4 font-mono text-xs space-y-3 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-950 via-slate-900 to-emerald-950 border border-cyan-500/50 flex items-center justify-center font-extrabold text-sm text-cyan-300">
                      {(inspectedSender.persona?.name || inspectedSender.operatorHandle || 'OP').slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                        inspectedSender.isOnline ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm text-white truncate">
                      @{inspectedSender.operatorHandle}
                    </div>
                    <div className="text-[10px] text-cyan-400 truncate">
                      {inspectedSender.activityLabel}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedSender(null)}
                  className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Bound Folio Persona Card */}
              {inspectedSender.persona && (
                <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider">
                      🎭 ACTIVE FOLIO PERSONA
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                      {inspectedSender.persona.species || 'Human'}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-emerald-200">
                    {inspectedSender.persona.name || inspectedSender.persona['char-name']}
                  </div>
                  <div className="text-[10.5px] text-slate-300">
                    Archetype: {inspectedSender.persona.role || inspectedSender.persona['char-concept'] || 'Specialist'}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {currentUser?.uid !== inspectedSender.uid && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      startDirectMessage(
                        inspectedSender.userObj || {
                          uid: inspectedSender.uid,
                          userHandle: inspectedSender.operatorHandle
                        },
                        null
                      );
                      setInspectedSender(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 font-bold text-[10.5px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <User size={12} />
                    <span>DM OPERATOR</span>
                  </button>

                  {inspectedSender.persona && (
                    <button
                      type="button"
                      onClick={() => {
                        startDirectMessage(
                          inspectedSender.userObj || {
                            uid: inspectedSender.uid,
                            userHandle: inspectedSender.operatorHandle
                          },
                          inspectedSender.persona
                        );
                        setInspectedSender(null);
                      }}
                      className="px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-bold text-[10.5px] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>🎭 WHISPER IC</span>
                    </button>
                  )}

                  {groups.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreselectedInviteUser({
                          uid: inspectedSender.uid,
                          userHandle: inspectedSender.operatorHandle,
                          displayName: inspectedSender.operatorHandle
                        });
                        setInspectedSender(null);
                        setIsQuickInviteOpen(true);
                      }}
                      className="col-span-2 px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 font-bold text-[10.5px] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus size={12} />
                      <span>INVITE TO TACTICAL TEAM</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Team Invite Modal */}
      {isQuickInviteOpen && (
        <QuickTeamInviteModal
          isOpen={isQuickInviteOpen}
          onClose={() => {
            setIsQuickInviteOpen(false);
            setPreselectedInviteUser(null);
          }}
          defaultGroupId={activeChannel?.groupId || linkedTeam?.id}
          preselectedUser={preselectedInviteUser}
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

