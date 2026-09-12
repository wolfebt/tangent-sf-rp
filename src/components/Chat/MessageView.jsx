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
  ExternalLink
} from 'lucide-react';
import ChatParser from '../UI/ChatParser';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useGroup } from '../../context/GroupContext';
import { AudioService } from '../../services/audioService';
import { GameGroupModal } from '../Groups/GameGroupModal';
import { ChannelSettingsModal } from './ChannelSettingsModal';

export const MessageView = ({ messages = [], loading = false, activeChannel }) => {
  const { currentUser } = useAuth();
  const { startDirectMessage, pendingCharacterNotes = [], selectChannel } = useChat();
  const { groups, selectGroup } = useGroup();
  
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages?.length, loading]);

  const isSquadChannel = activeChannel?.type === 'group' || !!activeChannel?.groupId;
  const isPersonaLogChannel = activeChannel?.type === 'persona_log' || activeChannel?.id?.startsWith('persona_log_');
  
  const linkedSquad = isSquadChannel 
    ? (groups.find(g => g.id === activeChannel?.groupId || g.channelId === activeChannel?.id) || null)
    : null;

  const handleOpenSquadModal = () => {
    if (linkedSquad) {
      selectGroup(linkedSquad.id);
      setIsSquadModalOpen(true);
    }
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

  // Safe formatting of roll items (prevent [object Object] and render exploded dice)
  const formatDiceRolls = (rolls) => {
    if (!Array.isArray(rolls)) return '';
    return rolls.map((r, i) => {
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
      const isStatus = actionType === 'STATUS_CHANGE';

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
        <div className="mt-1.5 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono shadow-md space-y-1.5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${typeBadgeClass}`}>
                {actionType.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{msg.personaName || 'Operative'}</span>
            </div>
            <span className="text-[9px] text-slate-500">{formatTimestamp(msg)}</span>
          </div>

          <p className="text-slate-200 font-semibold text-[11px] leading-relaxed">
            {msg.summary || msg.text}
          </p>

          {msg.details && (
            <div className="p-1.5 rounded bg-slate-900/80 text-[10px] text-slate-400 font-mono">
              {typeof msg.details === 'object' ? JSON.stringify(msg.details) : msg.details}
            </div>
          )}
        </div>
      );
    }

    // 2. Dice Roll Message Card
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
        <div className={`mt-1.5 p-3 rounded-xl border text-xs font-mono transition-all ${
          isCritical 
            ? 'bg-gradient-to-r from-amber-950/70 to-slate-950/80 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.25)]' 
            : isFumble 
            ? 'bg-gradient-to-r from-red-950/70 to-slate-950/80 border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.25)]' 
            : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/40'
        }`}>
          {/* Header with Label and Advantage Badges */}
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Dices size={14} className={isCritical ? 'text-amber-400 animate-bounce' : 'text-cyan-400'} />
              <span className="text-cyan-300">{label || expression || 'Dice Check'}</span>
              {expression && label && <span className="text-slate-500 text-[10px]">({expression})</span>}
            </div>

            <div className="flex items-center gap-1.5">
              {isAdvantage && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                  ADVANTAGE: I GOT THIS
                </span>
              )}
              {isDisadvantage && (
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-bold">
                  DISADVANTAGE: NEGATIVE KARMA
                </span>
              )}
              {isCritical && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-md text-[10px] font-bold animate-pulse">
                  CRITICAL 30
                </span>
              )}
              {isFumble && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/50 rounded-md text-[10px] font-bold animate-pulse">
                  FUMBLE -10
                </span>
              )}
            </div>
          </div>

          {/* Result and Roll breakdown */}
          <div className="flex items-baseline justify-between gap-3 border-t border-slate-800/80 pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono tracking-tight">
                {finalTotal}
              </span>
              {targetNumber !== undefined && targetNumber !== null && (
                <span className={`text-[11px] font-bold ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
                  vs DC {targetNumber} ({isSuccess ? `SUCCESS +${margin}` : `FAILED ${margin}`})
                </span>
              )}
            </div>

            {formattedRolls && (
              <div className="text-[10.5px] text-slate-400 font-mono">
                Dice: [{formattedRolls}]
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3. System Notification Message
    if (msg.type === 'system') {
      return (
        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
          <Radio size={13} className="shrink-0 text-cyan-400 animate-pulse" />
          <span className="flex-1">{msg.text}</span>
        </div>
      );
    }

    // 4. Standard Text or In-Character Dialogue
    return (
      <div className={`mt-0.5 text-xs sm:text-sm leading-relaxed ${
        msg.isIC ? 'text-slate-100 font-sans font-medium' : 'text-slate-300 font-sans'
      }`}>
        <ChatParser text={msg.text || ''} />
      </div>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#0a0e17]">
      {/* Center Messages Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Channel Header Banner */}
        {activeChannel && (
          <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs font-mono shrink-0 shadow-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5 truncate">
                  <span>{activeChannel.displayName || `#${activeChannel.name}`}</span>
                  {activeChannel.isPublic === false && (
                    <Lock size={12} className="text-amber-400 shrink-0" title="Private Frequency" />
                  )}
                </h3>

                {isSquadChannel && (
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] rounded font-bold uppercase shrink-0">
                    SQUAD
                  </span>
                )}

                {isPersonaLogChannel && (
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] rounded font-bold uppercase shrink-0">
                    TELEMETRY LOG
                  </span>
                )}
              </div>

              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {activeChannel.topic || 'Encrypted quantum transmission channel.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {linkedSquad && (
                <button
                  type="button"
                  onClick={handleOpenSquadModal}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Users size={12} />
                  <span className="hidden sm:inline">SQUAD HUB</span>
                </button>
              )}

              {!isPersonaLogChannel && (
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 text-[10px] font-mono font-bold cursor-pointer"
                  title="Frequency Settings"
                >
                  <Settings size={12} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDossierOpen(prev => !prev)}
                className={`p-1.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isDossierOpen
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-cyan-300'
                }`}
                title="Toggle Channel Dossier & Operatives"
              >
                <Info size={12} />
                <span className="hidden sm:inline">INFO</span>
              </button>
            </div>
          </div>
        )}

        {/* Read-Only Notice for Log Channels */}
        {isPersonaLogChannel && (
          <div className="px-4 py-1.5 bg-amber-950/40 border-b border-amber-500/30 text-[10.5px] font-mono text-amber-300/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-amber-400 animate-pulse" />
              <span>AUTOMATED ENGINE BLACKBOX — Read-only session telemetry for this operative.</span>
            </div>
            <span className="font-bold text-[9px] bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/40">
              IMMUTABLE AUDIT
            </span>
          </div>
        )}

        {/* ── Pending Transmissions Notification Note for other characters/channels ── */}
        {pendingCharacterNotes.some(n => n.channelId !== activeChannel?.id) && (
          <div className="px-4 py-1.5 bg-gradient-to-r from-amber-950/80 via-purple-950/70 to-slate-950 border-b border-amber-500/40 text-[10.5px] font-mono text-amber-200 flex items-center justify-between gap-2 shadow-sm">
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

        {/* Message Stream */}
        <div 
          ref={containerRef} 
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 select-text no-scrollbar bg-gradient-to-b from-transparent to-slate-950/40"
        >
          {loading && (
            <div className="py-8 flex items-center justify-center text-cyan-400 font-mono text-xs gap-2">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span>SYNCHRONIZING RELAY SIGNALS...</span>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="py-20 text-center space-y-2">
              <Radio size={28} className="mx-auto text-slate-600 animate-pulse" />
              <p className="text-xs font-mono text-slate-400">Frequency clear. No transmissions logged yet.</p>
              <p className="text-[11px] font-mono text-slate-600">Transmit a signal or run a skill check to begin.</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isSelf = currentUser && msg.senderId === currentUser.uid;
            const isIC = msg.isIC;
            const persona = msg.personaDetails;

            return (
              <div
                key={msg.id || idx}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                  isSelf 
                    ? 'bg-slate-900/70 border border-cyan-500/30 hover:border-cyan-500/50' 
                    : 'bg-slate-900/40 border border-slate-800 hover:border-slate-700'
                } ${isIC ? 'border-l-4 border-l-purple-500/90' : ''}`}
              >
                {/* Persona Avatar / Sender Glyph */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs border ${
                  isIC 
                    ? 'bg-purple-950/80 border-purple-500/60 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                    : isSelf 
                    ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {isIC ? (
                    (persona?.name || 'O').charAt(0).toUpperCase()
                  ) : msg.type === 'system' ? (
                    <Bot size={15} />
                  ) : (
                    <User size={15} />
                  )}
                </div>

                {/* Message Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Name Header */}
                      <span className={`text-xs font-mono font-bold ${
                        isIC ? 'text-purple-300' : isSelf ? 'text-cyan-300' : 'text-slate-200'
                      }`}>
                        {isIC ? (persona?.name || msg.senderHandle) : (msg.senderHandle || 'Operator')}
                      </span>

                      {/* In-Character Persona Specs */}
                      {isIC && (
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[8.5px] font-mono font-bold uppercase">
                            {persona?.species || 'Operative'} • {persona?.role || 'Infiltrator'}
                          </span>
                          <span className="text-[9.5px] font-mono text-slate-500">
                            (@{msg.senderHandle})
                          </span>
                        </div>
                      )}

                      {/* Addressed to Specific Persona Whisper */}
                      {msg.targetPersona?.name && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[8.5px] font-mono font-bold">
                          ↳ to {msg.targetPersona.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Direct Message Action Buttons (For other senders) */}
                      {!isSelf && msg.senderUid && (
                        <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                          {/* Message Player */}
                          <button
                            type="button"
                            onClick={() => {
                              startDirectMessage({
                                uid: msg.senderUid,
                                userHandle: msg.senderHandle || 'Operator'
                              }, null);
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 text-[8.5px] font-mono font-bold text-slate-300 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-all"
                            title={`Open Direct Comms with Player (@${msg.senderHandle || 'Operator'})`}
                          >
                            <User size={10} className="text-cyan-400" />
                            <span>PLAYER</span>
                          </button>

                          {/* Message Operative (If IC) */}
                          {isIC && persona?.name && (
                            <button
                              type="button"
                              onClick={() => {
                                startDirectMessage({
                                  uid: msg.senderUid,
                                  userHandle: msg.senderHandle || 'Operator'
                                }, persona);
                              }}
                              className="px-1.5 py-0.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 hover:border-purple-400 text-[8.5px] font-mono font-bold text-purple-300 hover:text-purple-100 flex items-center gap-1 cursor-pointer transition-all"
                              title={`Open Direct Comms with Operative ${persona.name}`}
                            >
                              <span>🎭 {persona.name.split(' ')[0]}</span>
                            </button>
                          )}
                        </div>
                      )}

                      <span className="text-[9.5px] font-mono text-slate-500 shrink-0">
                        {formatTimestamp(msg)}
                      </span>
                    </div>
                  </div>

                  {renderMessageContent(msg)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Drawer: Channel Dossier & Operatives */}
      {isDossierOpen && activeChannel && (
        <aside className="w-72 border-l border-slate-800/80 bg-slate-950/95 p-3 flex flex-col gap-3 font-mono text-xs animate-in slide-in-from-right duration-200 overflow-y-auto no-scrollbar select-none shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Info size={13} className="text-cyan-400" />
              FREQUENCY DOSSIER
            </span>
            <button
              onClick={() => setIsDossierOpen(false)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Channel Specs */}
          <div className="space-y-1.5 text-[10.5px]">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[9px] block">TOPIC / DIRECTIVE</span>
              <p className="text-slate-200 font-sans text-xs">{activeChannel.topic || 'No topic assigned.'}</p>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
              <span className="text-slate-400">ENCRYPTION</span>
              <span className="text-emerald-400 font-bold">AES-GCM-256</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
              <span className="text-slate-400">RELAY FREQ ID</span>
              <span className="text-cyan-400 font-bold">{activeChannel.id.substring(0, 12)}</span>
            </div>
          </div>

          {/* Connected Members */}
          {activeChannel.members && activeChannel.members.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                CONNECTED OPERATIVES ({activeChannel.members.length})
              </span>

              <div className="space-y-1">
                {activeChannel.members.map((memberUid) => {
                  const details = activeChannel.memberDetails?.[memberUid] || {};
                  const isUser = currentUser && currentUser.uid === memberUid;
                  const personaName = details.persona?.name;

                  return (
                    <div 
                      key={memberUid}
                      className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span className="text-slate-200 font-bold">{details.handle || 'Operator'}</span>
                          {isUser && <span className="text-[8.5px] text-cyan-400">(YOU)</span>}
                        </div>
                        {personaName && (
                          <span className="text-[9.5px] text-purple-300 block ml-3">
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
                            className="p-1 px-1.5 rounded bg-slate-800 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all text-[9px] flex items-center gap-1 cursor-pointer"
                            title={`Message Player @${details.handle || 'Operator'}`}
                          >
                            <User size={10} className="text-cyan-400" />
                            <span>PLAYER</span>
                          </button>
                          {details.persona && (
                            <button
                              type="button"
                              onClick={() => {
                                startDirectMessage({ uid: memberUid, userHandle: details.handle }, details.persona);
                              }}
                              className="p-1 px-1.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 hover:text-white transition-all text-[9px] flex items-center gap-1 cursor-pointer"
                              title={`Message Operative ${personaName}`}
                            >
                              <span>🎭 OPERATIVE</span>
                            </button>
                          )}
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

      {/* Channel Settings Modal */}
      {isSettingsModalOpen && (
        <ChannelSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          channel={activeChannel}
        />
      )}

      {/* Squad Modal */}
      {isSquadModalOpen && linkedSquad && (
        <GameGroupModal
          isOpen={isSquadModalOpen}
          onClose={() => setIsSquadModalOpen(false)}
          group={linkedSquad}
        />
      )}
    </div>
  );
};

export default MessageView;
