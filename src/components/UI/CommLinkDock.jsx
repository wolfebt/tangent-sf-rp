import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Plus, Maximize2, Radio, Users, Lock, Shield, Hash, Settings, UserPlus } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { CommsNavRail } from '../Chat/CommsNavRail';
import { ChannelSidebar } from '../Chat/ChannelSidebar';
import { NetworkRosterView } from '../Chat/NetworkRosterView';
import { SquadSummarySidebar } from '../Chat/SquadSummarySidebar';
import { PersonaAuditLogSidebar } from '../Chat/PersonaAuditLogSidebar';
import { CommsVttPanel } from '../Chat/CommsVttPanel';
import { MessageView } from '../Chat/MessageView';
import { MessageInput } from '../Chat/MessageInput';
import { CreateChannelModal } from '../Chat/CreateChannelModal';
import { GameGroupModal } from '../Groups/GameGroupModal';
import { QuickTeamInviteModal } from '../Chat/QuickTeamInviteModal';
import { useNavigate } from 'react-router-dom';
import { AudioService } from '../../services/audioService';

export const CommLinkDock = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { 
    activeChannel, 
    messages, 
    loadingMessages, 
    activeNavTab, 
    setActiveNavTab 
  } = useChat();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState('chat'); // 'channels' | 'chat'

  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isCreateModalOpen && !isTeamModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCreateModalOpen, isTeamModalOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Centered Modal Backdrop */}
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
        onClick={onClose}
      >
        {/* Main Modal Card Container */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl h-[92vh] sm:h-[86vh] max-h-[880px] bg-[#0b0f17] border border-cyan-500/50 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative font-sans"
        >
          {/* Top Modal Header */}
          <div className="px-3 sm:px-4 py-2 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            {/* Left: Brand / Frequency Status */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shrink-0">
                <Radio className="animate-pulse" size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-100 uppercase truncate">
                    COMMLINK RELAY MATRIX
                  </h2>
                  <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold truncate">
                    {activeChannel?.displayName || `#${activeChannel?.name || 'holonet'}`}
                  </span>
                  {activeChannel?.isPublic === false && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold flex items-center gap-1">
                      <Lock size={10} />
                      <span>ENCRYPTED</span>
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-mono hidden sm:block truncate">
                  {activeChannel?.topic || 'Encrypted tactical frequencies, team comms, and HoloNet relays.'}
                </p>
              </div>
            </div>

            {/* Right: Controls (Mobile toggle, Teams, Maximize, Close) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Mobile Channels / Chat Toggle */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1000, 0.02);
                  setMobilePane(prev => prev === 'channels' ? 'chat' : 'channels');
                }}
                className="md:hidden px-2 py-1 rounded text-[11px] font-mono font-bold border transition-colors bg-slate-900 border-slate-700 text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Hash size={12} />
                <span>{mobilePane === 'channels' ? 'CHAT' : 'CHANNELS'}</span>
              </button>

              {/* Quick Team Invite Button */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1150, 0.02);
                  setIsQuickInviteOpen(true);
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/50 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
                title="Dispatch Team Invite / Copy Join Credentials"
              >
                <UserPlus size={13} />
                <span>INVITE</span>
              </button>

              {/* Direct Team Management Button */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  setIsTeamModalOpen(true);
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-emerald-500/40 text-xs font-mono font-bold transition-all cursor-pointer"
                title="Team Management"
              >
                <Shield size={13} />
                <span>TEAMS</span>
              </button>

              {/* Create Channel */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.02);
                  setIsCreateModalOpen(true);
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                title="Create Custom Channel or DM"
              >
                <Plus size={13} />
                <span>CHANNEL</span>
              </button>

              {/* Full Screen Matrix View */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.02);
                  onClose();
                  navigate('/comms');
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Expand to Full Comms Matrix (/comms)"
              >
                <Maximize2 size={14} />
              </button>

              {/* Close Modal */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(900, 0.02);
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Close Comms Modal (ESC / Alt+C)"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Main Comms Workspace with Navigation Rail */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* Left Nav Rail */}
            <CommsNavRail
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenSquadModal={() => setIsTeamModalOpen(true)}
              onOpenTeamModal={() => setIsTeamModalOpen(true)}
              isCompact
            />

            {/* Sub-Panel: Channels / Network Roster / VTT */}
            <div className={`w-full md:w-72 lg:w-80 shrink-0 h-full border-r border-slate-800 bg-slate-950/80 overflow-hidden ${
              mobilePane === 'channels' ? 'block' : 'hidden md:block'
            }`}>
              {activeNavTab === 'matrix' && (
                <ChannelSidebar
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onOpenSquadModal={() => setIsTeamModalOpen(true)}
                  onOpenTeamModal={() => setIsTeamModalOpen(true)}
                  isCompact
                />
              )}

              {activeNavTab === 'roster' && (
                <NetworkRosterView isCompact />
              )}

              {activeNavTab === 'teams' && (
                <SquadSummarySidebar
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onOpenSquadModal={() => setIsTeamModalOpen(true)}
                  isCompact={true}
                />
              )}

              {activeNavTab === 'vtt' && (
                <CommsVttPanel />
              )}

              {activeNavTab === 'logs' && (
                <PersonaAuditLogSidebar isCompact={true} />
              )}

              {activeNavTab === 'settings' && (
                <div className="p-4 text-xs font-mono text-slate-300 space-y-3">
                  <div className="font-bold text-cyan-400 border-b border-slate-800 pb-1 uppercase">
                    Terminal Audio
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Subtle tactile audio alerts sound on new incoming whispers and dice rolls.
                  </p>
                  <button
                    type="button"
                    onClick={() => AudioService.playTerminalBeep(1450, 0.03)}
                    className="px-2.5 py-1 bg-cyan-950 border border-cyan-500/40 text-cyan-300 rounded font-bold"
                  >
                    Test Audio Feedback
                  </button>
                </div>
              )}
            </div>

            {/* Right Pane: Active Message Thread & Input Form */}
            <div className={`flex-1 flex flex-col h-full min-w-0 bg-[#0a0e17] ${
              mobilePane === 'chat' ? 'flex' : 'hidden md:flex'
            }`}>
              <MessageView
                messages={messages}
                loading={loadingMessages}
                activeChannel={activeChannel}
              />
              <MessageInput isCompact />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for creating custom channels & starting DMs */}
      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Game Teams & Parties Builder Modal */}
      {isTeamModalOpen && (
        <GameGroupModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          initialTab="roster"
        />
      )}

      {/* Quick Team Invite Modal */}
      {isQuickInviteOpen && (
        <QuickTeamInviteModal
          isOpen={isQuickInviteOpen}
          onClose={() => setIsQuickInviteOpen(false)}
          defaultGroupId={activeChannel?.groupId}
        />
      )}
    </>
  );
};

export default CommLinkDock;
