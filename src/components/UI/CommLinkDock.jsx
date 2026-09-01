import React, { useState } from 'react';
import { X, MessageSquare, Plus, Maximize2, Radio, Users } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { ChannelSidebar } from '../Chat/ChannelSidebar';
import { MessageView } from '../Chat/MessageView';
import { MessageInput } from '../Chat/MessageInput';
import { CreateChannelModal } from '../Chat/CreateChannelModal';
import { GameGroupModal } from '../Groups/GameGroupModal';
import { useNavigate } from 'react-router-dom';
import { AudioService } from '../../services/audioService';

export const CommLinkDock = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { activeChannel, messages, loadingMessages } = useChat();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [showChannelList, setShowChannelList] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <aside
        className="fixed bottom-0 right-0 top-0 sm:top-14 w-full sm:w-[480px] lg:w-[540px] z-50 bg-[#0d1117]/98 backdrop-blur-2xl border-l border-cyan-500/40 shadow-[-10px_0_40px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300 select-none animate-slide-left"
      >
        {/* Dock Top Bar */}
        <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="text-cyan-400 animate-pulse" size={16} />
            <div>
              <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
                COMMLINK RELAY DOCK
              </h2>
              <span className="text-[10px] font-mono text-cyan-400">
                {activeChannel?.displayName || '#general-holonet'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Direct Squads & Team Management Button */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setIsSquadModalOpen(true);
              }}
              className="px-2 py-1 rounded text-[11px] font-mono font-bold border transition-colors bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40 flex items-center gap-1 cursor-pointer"
              title="Team & Squad Management"
            >
              <Users size={12} />
              <span>SQUADS</span>
            </button>

            {/* Toggle Channels List view on mobile/compact */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1000, 0.02);
                setShowChannelList(prev => !prev);
              }}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-colors ${
                showChannelList
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Channels List"
            >
              CHANNELS
            </button>

            {/* Full Matrix View */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.02);
                onClose();
                navigate('/comms');
              }}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Expand to Full Comms Matrix"
            >
              <Maximize2 size={14} />
            </button>

            {/* Close Dock */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(900, 0.02);
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
              title="Close Dock (Alt+C)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body: Either Channel Sidebar (if toggled) or Message Feed + Input */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {showChannelList ? (
            <div className="flex-1 overflow-hidden">
              <ChannelSidebar
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onOpenSquadModal={() => setIsSquadModalOpen(true)}
              />
            </div>
          ) : (
            <>
              <MessageView
                messages={messages}
                loading={loadingMessages}
                activeChannel={activeChannel}
              />
              <MessageInput />
            </>
          )}
        </div>
      </aside>

      {/* Modal for creating custom channels & starting DMs */}
      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Game Squads & Parties Builder Modal */}
      <GameGroupModal
        isOpen={isSquadModalOpen}
        onClose={() => setIsSquadModalOpen(false)}
        initialTab="roster"
      />
    </>
  );
};

export default CommLinkDock;
