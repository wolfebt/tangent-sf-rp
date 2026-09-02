import React, { useEffect, useRef, useState } from 'react';
import { Dices, Sparkles, Shield, User, Bot, Radio, Lock, AlertTriangle, CheckCircle2, Users, Settings, Edit3 } from 'lucide-react';
import ChatParser from '../UI/ChatParser';
import { useAuth } from '../../context/AuthContext';
import { useGroup } from '../../context/GroupContext';
import { GameGroupModal } from '../Groups/GameGroupModal';
import { ChannelSettingsModal } from './ChannelSettingsModal';

export const MessageView = ({ messages = [], loading = false, activeChannel }) => {
  const { currentUser } = useAuth();
  const { groups, selectGroup } = useGroup();
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages?.length, loading]);

  const isSquadChannel = activeChannel?.type === 'group' || !!activeChannel?.groupId;
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

  const renderMessageContent = (msg) => {
    // 1. Dice Roll Message Card
    if (msg.type === 'dice_roll' && msg.metadata) {
      const { expression, result, rolls = [], isCritical, isFumble } = msg.metadata;
      return (
        <div className={`mt-1 p-3 rounded-lg border text-xs font-mono transition-all ${
          isCritical 
            ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
            : isFumble 
            ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
            : 'bg-slate-900/80 border-slate-700/80'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Dices size={14} className={isCritical ? 'text-amber-400 animate-spin' : 'text-cyan-400'} />
              <span>{expression}</span>
            </div>
            {isCritical && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
                CRITICAL HIT
              </span>
            )}
            {isFumble && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-[10px] font-bold">
                CRITICAL FUMBLE
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-xl font-bold text-cyan-300 font-mono">
              {result}
            </div>
            {rolls.length > 0 && (
              <div className="text-[11px] text-slate-400 font-mono">
                Rolls: [{rolls.join(', ')}]
              </div>
            )}
          </div>
        </div>
      );
    }

    // 2. System Notification Message
    if (msg.type === 'system') {
      return (
        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-cyan-400/90 flex items-center gap-2">
          <Radio size={13} className="shrink-0" />
          <span>{msg.text}</span>
        </div>
      );
    }

    // 3. Standard Text or In-Character Dialogue (parsed with Codex Tooltips)
    return (
      <div className={`mt-0.5 text-xs sm:text-sm leading-relaxed ${
        msg.isIC ? 'text-slate-100 font-sans' : 'text-slate-300 font-sans'
      }`}>
        <ChatParser text={msg.text || ''} />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#0d1117]/80 backdrop-blur-sm select-text no-scrollbar">
      {/* Channel Header Banner */}
      {activeChannel && (
        <div className="pb-3 mb-2 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div>
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
              <span>{activeChannel.displayName || `#${activeChannel.name}`}</span>
              {activeChannel.isPublic === false && (
                <Lock size={12} className="text-amber-400" title="Private Encrypted Frequency" />
              )}
              {isSquadChannel && (
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] rounded font-bold uppercase">
                  GAME SQUAD
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeChannel.topic || 'Frequency online and encrypted.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {linkedSquad && (
              <button
                type="button"
                onClick={handleOpenSquadModal}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[10px] font-mono font-bold transition-all flex items-center gap-1 shadow-sm"
              >
                <Users size={12} />
                <span>SQUAD ROSTER & OPS</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 text-[10px] font-mono font-bold"
              title="Frequency Settings, Rename & Operative Management"
            >
              <Settings size={13} />
              <span className="hidden sm:inline">SETTINGS</span>
            </button>

            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
              <span>FREQ: {activeChannel.id.substring(0, 14)}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-6 flex items-center justify-center text-cyan-400 font-mono text-xs gap-2">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span>SYNCHRONIZING COMM TRANSMISSIONS...</span>
        </div>
      )}

      {/* Empty messages state */}
      {!loading && messages.length === 0 && (
        <div className="py-16 text-center space-y-2">
          <Radio size={28} className="mx-auto text-slate-600 animate-pulse" />
          <p className="text-xs font-mono text-slate-400">No active transmissions on this frequency.</p>
          <p className="text-[11px] font-mono text-slate-600">Transmit a signal to begin the log.</p>
        </div>
      )}

      {/* Message List */}
      {messages.map((msg, idx) => {
        const isSelf = currentUser && msg.senderId === currentUser.uid;
        const isIC = msg.isIC;

        return (
          <div
            key={msg.id || idx}
            className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
              isSelf 
                ? 'bg-slate-900/60 border border-cyan-500/20 hover:border-cyan-500/40' 
                : 'bg-slate-900/40 border border-slate-800 hover:border-slate-700'
            } ${isIC ? 'border-l-4 border-l-purple-500' : ''}`}
          >
            {/* Avatar / Identity Glyph */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              isIC 
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' 
                : isSelf 
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              {isIC ? (
                <Shield size={16} />
              ) : msg.type === 'system' ? (
                <Bot size={16} />
              ) : (
                <User size={16} />
              )}
            </div>

            {/* Content Body */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-mono font-bold ${
                    isIC ? 'text-purple-300' : isSelf ? 'text-cyan-300' : 'text-slate-200'
                  }`}>
                    {msg.senderHandle || 'Unknown'}
                  </span>

                  {isIC && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-mono uppercase font-bold">
                      IN-CHARACTER (IC)
                    </span>
                  )}

                  {msg.personaDetails?.role && (
                    <span className="text-[10px] font-mono text-slate-500">
                      [{msg.personaDetails.role}]
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {formatTimestamp(msg)}
                </span>
              </div>

              {renderMessageContent(msg)}
            </div>
          </div>
        );
      })}

      {/* Channel Configuration & Rename Modal */}
      <ChannelSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        channel={activeChannel}
      />

      {/* Game Squad Management Modal */}
      {linkedSquad && (
        <GameGroupModal
          isOpen={isSquadModalOpen}
          onClose={() => setIsSquadModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MessageView;
