import React, { useState } from 'react';
import { 
  Radio, 
  Hash, 
  MessageSquare, 
  Users, 
  Lock, 
  Globe, 
  ChevronLeft, 
  Plus, 
  ShieldAlert, 
  Activity,
  Sparkles
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { ChannelSidebar } from '../components/Chat/ChannelSidebar';
import { MessageView } from '../components/Chat/MessageView';
import { MessageInput } from '../components/Chat/MessageInput';
import { CreateChannelModal } from '../components/Chat/CreateChannelModal';
import { AudioService } from '../services/audioService';

export const CommsPage = () => {
  const { activeChannel, messages, loadingMessages } = useChat();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState('chat'); // 'sidebar' | 'chat'

  return (
    <div className="h-full w-full flex flex-col bg-[#0b0f17] text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Breadcrumb & Status Bar */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2">
          {/* Mobile toggle button */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setMobileView(prev => prev === 'sidebar' ? 'chat' : 'sidebar');
            }}
            className="md:hidden p-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 flex items-center gap-1 text-[11px]"
          >
            <Radio size={12} />
            <span>{mobileView === 'sidebar' ? 'VIEW CHAT' : 'CHANNELS'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">COMMLINK MATRIX</span>
            <span>/</span>
            <span className="text-slate-200 font-bold">
              {activeChannel?.displayName || `#${activeChannel?.name || 'holonet'}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-300 font-bold">QUANTUM RELAY ONLINE</span>
          </div>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-slate-500">ENCRYPTION: AES-GCM-256</span>
        </div>
      </div>

      {/* Main 2-Pane Comms Grid */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Pane: Channel Navigation Sidebar (Width: ~300px) */}
        <div className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
          mobileView === 'sidebar' ? 'block' : 'hidden md:block'
        }`}>
          <ChannelSidebar
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        </div>

        {/* Right Pane: Active Message Thread & Input Form */}
        <div className={`flex-1 flex flex-col h-full min-w-0 bg-[#0d1117]/90 ${
          mobileView === 'chat' ? 'flex' : 'hidden md:flex'
        }`}>
          <MessageView
            messages={messages}
            loading={loadingMessages}
            activeChannel={activeChannel}
          />
          <MessageInput />
        </div>
      </div>

      {/* Creation & DM Modal */}
      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default CommsPage;
