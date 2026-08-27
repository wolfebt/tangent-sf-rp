import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Send, 
  MessageSquare, 
  Dices, 
  Maximize2, 
  ChevronRight, 
  Shield, 
  User, 
  Hash, 
  Lock,
  Plus,
  Users,
  Target,
  Layers,
  Sparkles
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { AudioService } from '../../services/audioService';
import ChatParser from '../UI/ChatParser';
import { CreateChannelModal } from '../Chat/CreateChannelModal';

export const CommCenterWidget = ({
  onOpenCommsDrawer,
  onOpenSquadsDrawer,
  onOpenCampaignOps
}) => {
  const navigate = useNavigate();
  const { 
    activeChannel, 
    messages, 
    sendMessage, 
    channels, 
    customChannels,
    directChannels,
    publicChannels,
    selectChannel,
    unreadCounts,
    speakingMode,
    selectedPersona
  } = useChat();
  const { currentUser } = useAuth();

  const [inputVal, setInputVal] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [channelCategory, setChannelCategory] = useState('all'); // 'all' | 'public' | 'custom' | 'dm'

  const handleQuickSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const textToSend = inputVal.trim();
    setInputVal('');
    await sendMessage(textToSend);
  };

  const handleActivateCenter = (drawerType, e) => {
    if (e) e.stopPropagation();
    AudioService.playTerminalBeep(1150, 0.02);
    if (drawerType === 'squads' && onOpenSquadsDrawer) {
      onOpenSquadsDrawer();
    } else if (drawerType === 'ops' && onOpenCampaignOps) {
      onOpenCampaignOps();
    } else if (onOpenCommsDrawer) {
      onOpenCommsDrawer();
    }
  };

  const displayedChannels = (() => {
    if (channelCategory === 'public') return publicChannels;
    if (channelCategory === 'custom') return customChannels;
    if (channelCategory === 'dm') return directChannels;
    return channels;
  })();

  const recentMessages = messages.slice(-4);

  return (
    <>
      <div 
        onClick={() => handleActivateCenter('comms')}
        className="bg-slate-900/15 hover:bg-slate-900/85 backdrop-blur-md p-2.5 sm:p-3 rounded-xl border-2 border-cyan-500/70 hover:border-cyan-400 flex flex-col justify-between transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_24px_rgba(34,211,238,0.35)] group cursor-pointer select-none"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Radio className="text-cyan-400 animate-pulse" size={14} />
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300 font-bold">
                COMM CENTER
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Activate Center Block as Squads */}
              {onOpenSquadsDrawer && (
                <button
                  type="button"
                  onClick={(e) => handleActivateCenter('squads', e)}
                  className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 text-[9px] font-mono font-bold transition-all flex items-center gap-1"
                  title="Activate Center Block: Squad Cards"
                >
                  <Users size={10} className="text-purple-400" />
                  <span>SQUADS</span>
                </button>
              )}

              {/* Activate Center Block as Campaign Ops */}
              {onOpenCampaignOps && (
                <button
                  type="button"
                  onClick={(e) => handleActivateCenter('ops', e)}
                  className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-cyan-900/40 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-[9px] font-mono font-bold transition-all flex items-center gap-1"
                  title="Activate Center Block: Campaign Ops"
                >
                  <Target size={10} className="text-cyan-400" />
                  <span>OPS</span>
                </button>
              )}

              {/* Launch Full Screen Matrix */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  AudioService.playTerminalBeep(1200, 0.03);
                  navigate('/comms');
                }}
                className="p-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-colors flex items-center gap-1 text-[9px] font-mono font-bold ml-0.5"
                title="Full Screen Matrix View"
              >
                <Maximize2 size={11} />
              </button>
            </div>
          </div>

          {/* Sub-header Controls: Category Filter & Create Custom Channel Button */}
          <div className="mt-1.5 flex items-center justify-between gap-1 text-[9px] font-mono">
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'ALL' },
                { id: 'public', label: 'PUB' },
                { id: 'custom', label: 'CUSTOM' },
                { id: 'dm', label: 'DMs' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChannelCategory(cat.id);
                  }}
                  className={`px-1.5 py-0.2 rounded transition-colors ${
                    channelCategory === cat.id 
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Create Custom Channel Trigger */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                AudioService.playTerminalBeep(1300, 0.03);
                setIsCreateModalOpen(true);
              }}
              className="px-1.5 py-0.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded font-bold flex items-center gap-0.5 transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] text-[8.5px]"
              title="Create Custom Channel / Squad Relay"
            >
              <Plus size={10} />
              <span>+ CHANNEL</span>
            </button>
          </div>

          {/* Channel Switcher Pills */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="mt-1 flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[9px] font-mono"
          >
            {displayedChannels.length === 0 ? (
              <span className="text-slate-500 italic py-0.5 px-1 text-[8.5px]">No channels in this category.</span>
            ) : (
              displayedChannels.slice(0, 6).map(ch => {
                const isSel = activeChannel?.id === ch.id;
                const unread = unreadCounts[ch.id] || 0;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectChannel(ch.id);
                    }}
                    className={`px-1.5 py-0.5 rounded border shrink-0 transition-all flex items-center gap-1 ${
                      isSel 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-[0_0_10px_rgba(34,211,238,0.15)]' 
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {ch.isPublic === false && <Lock size={8} className="text-amber-400" />}
                    <span>{ch.displayName || `#${ch.name}`}</span>
                    {unread > 0 && (
                      <span className="px-1 rounded-full bg-cyan-500 text-black text-[7.5px] font-bold">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Live Messages Stream */}
          <div className="mt-1 space-y-1 max-h-[100px] overflow-y-auto pr-1 no-scrollbar">
            {recentMessages.length === 0 ? (
              <div className="py-2.5 text-center text-slate-500 text-[10px] font-mono">
                <span>No transmissions on {activeChannel?.displayName || '#frequency'}</span>
              </div>
            ) : (
              recentMessages.map((msg, i) => {
                const isSelf = currentUser && msg.senderId === currentUser.uid;
                const isIC = msg.isIC;

                return (
                  <div
                    key={msg.id || i}
                    className={`p-1.5 rounded-md border text-[11px] transition-colors ${
                      isSelf
                        ? 'bg-slate-900/80 border-cyan-500/30'
                        : 'bg-slate-950/60 border-slate-800/80'
                    } ${isIC ? 'border-l-2 border-l-purple-400' : ''}`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono mb-0.5">
                      <span className={`font-bold ${isIC ? 'text-purple-300' : 'text-cyan-300'}`}>
                        {msg.senderHandle || 'Operator'}
                        {isIC && ' [IC]'}
                      </span>
                      <span className="text-slate-500">
                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    {msg.type === 'dice_roll' ? (
                      <div className="text-amber-300 font-mono text-[10px] flex items-center gap-1">
                        <Dices size={11} />
                        <span>{msg.text}</span>
                      </div>
                    ) : (
                      <div className="text-slate-200 text-[10.5px] leading-snug line-clamp-2">
                        <ChatParser text={msg.text || ''} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Input Form & Footer */}
        <div className="pt-1.5 border-t border-slate-800/80 mt-1.5" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleQuickSend} className="flex items-center gap-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                speakingMode === 'IC'
                  ? `Transmit as [${selectedPersona?.name || 'Operative'}]...`
                  : `Quick transmit into ${activeChannel?.displayName || '#comms'}...`
              }
              className="flex-1 px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-[10.5px] font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white rounded-md transition-colors shrink-0"
              title="Transmit message"
            >
              <Send size={12} />
            </button>
          </form>

          <div className="pt-1 flex items-center justify-between text-[8.5px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>RELAY CONNECTED</span>
            </span>
            <button
              type="button"
              onClick={() => handleActivateCenter('comms')}
              className="text-cyan-400/90 hover:text-cyan-300 flex items-center gap-0.5 font-bold"
            >
              <span>CENTER MATRIX</span>
              <ChevronRight size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for creating custom channels & starting DMs */}
      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
};

export default CommCenterWidget;
