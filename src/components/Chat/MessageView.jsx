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
  MessageSquare,
  Flame,
  Info,
  ExternalLink,
  Mic,
  MicOff,
  UserPlus,
  Copy,
  Check,
  CornerDownRight
} from 'lucide-react';
import ChatParser from '../UI/ChatParser';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useVoiceChat } from '../../context/VoiceChatContext';
import { useGroup } from '../../context/GroupContext';
import { useToast } from '../../context/ToastContext';
import { AudioService } from '../../services/audioService';
import { GameGroupModal } from '../Groups/GameGroupModal';
import { ChannelSettingsModal } from './ChannelSettingsModal';
import { QuickTeamInviteModal } from './QuickTeamInviteModal';

/**
 * @component MessageView
 * @description Clear, high-contrast, compact tactical sci-fi ledger for chat messages.
 * Features smart message grouping, crisp typography, clean left accent borders,
 * inline team invite actions, and floating action toolbars.
 */
export const MessageView = ({ messages = [], loading = false, activeChannel }) => {
  const { currentUser } = useAuth();
  const { startDirectMessage, pendingCharacterNotes = [], selectChannel } = useChat();
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
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages?.length, loading]);

  const isTeamChannel = activeChannel?.type === 'group' || !!activeChannel?.groupId;
  const isPersonaLogChannel = activeChannel?.type === 'persona_log' || activeChannel?.id?.startsWith('persona_log_');
  const isDirectChannel = activeChannel?.type === 'direct' || activeChannel?.id?.startsWith('dm_');
  
  const linkedTeam = isTeamChannel 
    ? (groups.find(g => g.id === activeChannel?.groupId || g.channelId === activeChannel?.id) || null)
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
        rolls = [], 
        isCritical, 
        isFumble, 
        isAdvantage, 
        isDisadvantage, 
        label, 
        targetNumber, 
        isSuccess, 
        margin 
      } = msg.metadata;

      const finalTotal = total ?? result;
      const formattedRolls = formatDiceRolls(rolls);

      return (
        <div className={`mt-1 p-3 rounded-lg border text-xs font-mono transition-all ${
          isCritical 
            ? 'bg-gradient-to-r from-amber-950/80 via-slate-950/90 to-slate-950 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
            : isFumble 
            ? 'bg-gradient-to-r from-rose-950/80 via-slate-950/90 to-slate-950 border-rose-500/70 shadow-[0_0_20px_rgba(244,63,94,0.2)]' 
            : 'bg-slate-950/90 border-slate-800'
        }`}>
          {/* Header with Label and Badges */}
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold">
              <Dices size={15} className={isCritical ? 'text-amber-400' : 'text-cyan-400'} />
              <span className="text-cyan-300 text-xs">{label || expression || 'Dice Check'}</span>
              {expression && label && <span className="text-slate-500 text-[10.5px]">({expression})</span>}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(msg.broadcastToVtt || msg.metadata?.broadcastToVtt) && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                  STAGE VTT
                </span>
              )}
              {isAdvantage && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                  ADVANTAGE
                </span>
              )}
              {isDisadvantage && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold">
                  DISADVANTAGE
                </span>
              )}
              {isCritical && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded text-[9.5px] font-bold">
                  CRITICAL 30
                </span>
              )}
              {isFumble && (
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/50 rounded text-[9.5px] font-bold">
                  FUMBLE -10
                </span>
              )}
            </div>
          </div>

          {/* Result and Roll breakdown */}
          <div className="flex items-baseline justify-between gap-3 border-t border-slate-800/80 pt-2">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-white font-mono tracking-tight">
                {finalTotal}
              </span>
              {targetNumber !== undefined && targetNumber !== null && (
                <span className={`text-xs font-bold ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                  vs DC {targetNumber} ({isSuccess ? `SUCCESS +${margin}` : `FAILED ${margin}`})
                </span>
              )}
            </div>

            {formattedRolls && (
              <div className="text-[11px] text-slate-400 font-mono">
                [{formattedRolls}]
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3. Narrative RPG Action / Emote (/me, /act)
    if (msg.type === 'narrative_action') {
      return (
        <div className="mt-1 p-2 rounded-lg bg-purple-950/25 border-l-2 border-purple-500/60 text-purple-200 text-xs sm:text-sm font-serif italic">
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
        <div className="mt-0.5 text-xs sm:text-sm text-slate-400 font-mono italic">
          <span className="text-slate-500 font-bold not-italic mr-1">(( OOC:</span>
          <ChatParser text={msg.text || ''} />
          <span className="text-slate-500 font-bold not-italic ml-1">))</span>
        </div>
      );
    }

    // 5. System Notification Message
    if (msg.type === 'system') {
      return (
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
          <Radio size={13} className="shrink-0 text-cyan-400 animate-pulse" />
          <span className="flex-1">{msg.text}</span>
        </div>
      );
    }

    // 6. Standard Text or In-Character Dialogue (High-contrast, crisp 13.5px text)
    return (
      <div className={`mt-0.5 text-xs sm:text-sm leading-relaxed ${
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
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse'
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

              <button
                type="button"
                onClick={() => setIsDossierOpen(prev => !prev)}
                className={`p-1.5 rounded-lg border text-[10.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isDossierOpen
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-cyan-300'
                }`}
                title="Toggle Frequency Dossier & Connected Operators"
              >
                <Info size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Read-Only Notice for Log Channels */}
        {isPersonaLogChannel && (
          <div className="px-4 py-1.5 bg-amber-950/40 border-b border-amber-500/30 text-[10.5px] font-mono text-amber-300/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-amber-400 animate-pulse" />
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
              <Radio size={12} className="text-amber-400 animate-pulse shrink-0" />
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
              <Radio size={28} className="mx-auto text-slate-600 animate-pulse" />
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
                className={`group relative rounded-r-lg border-y border-r border-slate-800/60 p-2 sm:p-2.5 transition-all hover:border-slate-700 hover:bg-slate-900/60 ${borderAccentClass} ${
                  isGrouped ? 'mt-0.5 pt-1 border-t-transparent' : 'mt-2'
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
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {/* Avatar Glyph */}
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 font-mono font-bold text-[10px] border ${
                        isIC 
                          ? 'bg-purple-950 border-purple-500/60 text-purple-300' 
                          : isSelf 
                          ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {isIC ? (
                          (persona?.name || 'O').charAt(0).toUpperCase()
                        ) : msg.type === 'system' ? (
                          <Bot size={11} />
                        ) : (
                          <User size={11} />
                        )}
                      </div>

                      {/* Sender Name */}
                      <span className={`text-xs font-mono font-bold truncate ${
                        isIC ? 'text-purple-300' : isSelf ? 'text-cyan-300' : 'text-slate-100'
                      }`}>
                        {isIC ? (persona?.name || msg.senderHandle) : (msg.senderHandle || 'Operator')}
                      </span>

                      {/* In-Character Persona Specs */}
                      {isIC && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-mono font-bold uppercase truncate max-w-[200px]">
                          {persona?.role || persona?.species || 'Persona'} • @{msg.senderHandle}
                        </span>
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

      {/* ── Right Drawer: Channel Dossier & Connected Operators ── */}
      {isDossierOpen && activeChannel && (
        <aside className="w-72 border-l border-slate-800 bg-[#080c14] p-3 flex flex-col gap-3 font-mono text-xs animate-in slide-in-from-right duration-200 overflow-y-auto no-scrollbar select-none shrink-0 z-20">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Info size={13} className="text-cyan-400" />
              <span>FREQUENCY DOSSIER</span>
            </span>
            <button
              onClick={() => setIsDossierOpen(false)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>

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
              <span className="text-slate-400">ENCRYPTION</span>
              <span className="text-emerald-400 font-bold">AES-GCM-256</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
              <span className="text-slate-400">RELAY FREQ ID</span>
              <span className="text-cyan-400 font-bold">{activeChannel.id.substring(0, 14)}</span>
            </div>
          </div>

          {/* Connected Members */}
          {activeChannel.members && activeChannel.members.length > 0 && (
            <div className="space-y-1.5 mt-1">
              <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider block">
                CONNECTED OPERATORS ({activeChannel.members.length})
              </span>

              <div className="space-y-1">
                {activeChannel.members.map((memberUid) => {
                  const details = activeChannel.memberDetails?.[memberUid] || {};
                  const isUser = currentUser && currentUser.uid === memberUid;
                  const personaName = details.persona?.name;

                  return (
                    <div 
                      key={memberUid}
                      className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span className="text-slate-200 font-bold truncate">@{details.handle || 'Operator'}</span>
                          {isUser && <span className="text-[9px] text-cyan-400">(YOU)</span>}
                        </div>
                        {personaName && (
                          <span className="text-[10px] text-purple-300 block ml-3 truncate">
                            🎭 {personaName}
                          </span>
                        )}
                      </div>

                      {!isUser && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              startDirectMessage({ uid: memberUid, userHandle: details.handle }, null);
                            }}
                            className="p-1 px-1.5 rounded bg-slate-800 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all text-[9.5px] flex items-center gap-1 cursor-pointer"
                            title={`Message Player @${details.handle || 'Operator'}`}
                          >
                            <User size={10} className="text-cyan-400" />
                            <span>DM</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
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
