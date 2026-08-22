import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Hash, 
  MessageSquare, 
  Users, 
  Plus, 
  Maximize2, 
  Lock, 
  Globe, 
  X, 
  Sparkles,
  Shield,
  Layers,
  Target,
  Settings
} from 'lucide-react';
import { useChat } from '../../../context/ChatContext';
import { ChannelSidebar } from '../../Chat/ChannelSidebar';
import { MessageView } from '../../Chat/MessageView';
import { MessageInput } from '../../Chat/MessageInput';
import { CreateChannelModal } from '../../Chat/CreateChannelModal';
import { ChannelSettingsModal } from '../../Chat/ChannelSettingsModal';
import { AudioService } from '../../../services/audioService';

export const CommsCenterDrawer = ({ onClose, onOpenDrawer }) => {
  const navigate = useNavigate();
  const { activeChannel, messages, loadingMessages, channels, customChannels, selectChannel } = useChat();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showChannelsList, setShowChannelsList] = useState(false);

  return (
    <div className="flex flex-col justify-between h-full space-y-3 select-none">
      {/* Top Banner & Fast Navigation */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-cyan-950/40 border border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shrink-0">
            <Radio size={18} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider truncate">
                COMM CENTER MATRIX
              </h2>
              <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                {activeChannel?.displayName || '#holonet'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
              {activeChannel?.topic || 'Encrypted tactical frequencies, squad comms, and custom channels.'}
            </p>
          </div>
        </div>

        {/* Action Controls & Fast Switchers to Campaign Ops / Squads */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick jump to Squad Cards */}
          {onOpenDrawer && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                onOpenDrawer('game-groups');
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-purple-300 text-[11px] font-mono font-bold transition-all"
              title="Open Squad Cards"
            >
              <Users size={12} className="text-purple-400" />
              <span>SQUADS</span>
            </button>
          )}

          {/* Quick jump to Campaign Ops */}
          {onOpenDrawer && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                onOpenDrawer('overview');
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-300 text-[11px] font-mono font-bold transition-all"
              title="Open Campaign Ops Overview"
            >
              <Target size={12} className="text-cyan-400" />
              <span>OPS</span>
            </button>
          )}

          {/* Create Custom Channel */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1300, 0.03);
              setIsCreateModalOpen(true);
            }}
            className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-mono font-bold text-xs rounded-lg shadow flex items-center gap-1 transition-all"
            title="Create Custom Channel or DM"
          >
            <Plus size={13} />
            <span>+ CHANNEL</span>
          </button>

          {/* Frequency Settings & Rename */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setIsSettingsModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Frequency Settings, Rename & Operatives"
          >
            <Settings size={14} />
          </button>

          {/* Full Screen Matrix */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.02);
              navigate('/comms');
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Open Full Screen Matrix (/comms)"
          >
            <Maximize2 size={15} />
          </button>

          {/* Dismiss */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Dismiss View"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Area: Sidebar + Chat Feed inside center drawer */}
      <div className="flex-1 flex min-h-[380px] max-h-[460px] rounded-xl border border-slate-800 overflow-hidden bg-[#0d1117]/90 shadow-inner">
        {/* Left Side: Channel Selector (width: ~200px) */}
        <div className="w-52 border-r border-slate-800 hidden md:block h-full">
          <ChannelSidebar
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            isCompact={true}
          />
        </div>

        {/* Right Side: Message Feed & Rich Input */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          <MessageView
            messages={messages}
            loading={loadingMessages}
            activeChannel={activeChannel}
          />
          <MessageInput isCompact={true} />
        </div>
      </div>

      {/* Create Custom Channel / DM Modal */}
      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Channel Settings & Rename Modal */}
      <ChannelSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        channel={activeChannel}
      />
    </div>
  );
};

export default CommsCenterDrawer;
