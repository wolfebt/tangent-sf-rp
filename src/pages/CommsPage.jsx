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
  Sparkles,
  Map,
  Shield,
  Settings,
  UserPlus
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useGroup } from '../context/GroupContext';
import { CommsNavRail } from '../components/Chat/CommsNavRail';
import { ChannelSidebar } from '../components/Chat/ChannelSidebar';
import { NetworkRosterView } from '../components/Chat/NetworkRosterView';
import { SquadSummarySidebar } from '../components/Chat/SquadSummarySidebar';
import { PersonaAuditLogSidebar } from '../components/Chat/PersonaAuditLogSidebar';
import { CommsVttPanel } from '../components/Chat/CommsVttPanel';
import { MessageView } from '../components/Chat/MessageView';
import { MessageInput } from '../components/Chat/MessageInput';
import { CreateChannelModal } from '../components/Chat/CreateChannelModal';
import { GameGroupModal } from '../components/Groups/GameGroupModal';
import { TeamInviteConfirmationModal } from '../components/Groups/TeamInviteConfirmationModal';
import { AudioService } from '../services/audioService';

export const CommsPage = () => {
  const { 
    activeChannel, 
    messages, 
    loadingMessages, 
    activeNavTab, 
    setActiveNavTab,
    onlineOperators
  } = useChat();

  const {
    pendingInvites = [],
    reviewingInvite,
    openInviteConfirmation,
    closeInviteConfirmation,
    declineInvite
  } = useGroup() || {};

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState('chat'); // 'sidebar' | 'chat'

  return (
    <div className="h-full w-full flex flex-col bg-[#080c14] text-slate-100 font-sans overflow-hidden select-none">
      {/* ── Top Station Status & Breadcrumb Header ── */}
      <header className="px-3 sm:px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile View Toggle */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setMobileView(prev => prev === 'sidebar' ? 'chat' : 'sidebar');
            }}
            className="md:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 flex items-center gap-1.5 text-[11px] font-bold"
          >
            <Radio size={13} />
            <span>{mobileView === 'sidebar' ? 'VIEW CHAT' : 'FREQUENCIES'}</span>
          </button>

          <div className="flex items-center gap-2 text-slate-400 min-w-0">
            <span className="text-cyan-400 font-bold uppercase tracking-wider hidden sm:inline">
              COMMLINK RELAY
            </span>
            <span className="hidden sm:inline text-slate-600">/</span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold truncate">
              {activeChannel?.displayName || `#${activeChannel?.name || 'holonet'}`}
            </span>
            {activeChannel?.isPublic === false && (
              <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                <Lock size={9} />
                <span>SECURE</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Status Indicators */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-bold hidden sm:inline">RELAY ONLINE</span>
            <span className="text-slate-500 text-[10px] hidden lg:inline">({onlineOperators.length} Active Operators)</span>
          </div>
          <span className="hidden md:inline text-slate-700">|</span>
          <span className="hidden md:inline text-slate-500 text-[10px]">ENCRYPTION: AES-256</span>
        </div>
      </header>

      {/* ── High-Visibility Pending Squad Commission Alert Banner ── */}
      {pendingInvites && pendingInvites.length > 0 && (
        <div className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-950 via-[#0a161f] to-slate-950 border-b border-emerald-500/50 flex items-center justify-between gap-3 text-xs font-mono shrink-0 shadow-lg z-10 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
              <Shield size={14} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-300 uppercase tracking-wide text-[11px]">
                  TACTICAL SQUAD COMMISSION:
                </span>
                <span className="text-white font-bold truncate">
                  "{pendingInvites[0].groupName}"
                </span>
                <span className="text-slate-400 text-[10.5px] hidden sm:inline">
                  from @{pendingInvites[0].fromUserHandle || 'Operator'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openInviteConfirmation(pendingInvites[0])}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer transition-colors"
            >
              REVIEW & ACCEPT
            </button>
            <button
              type="button"
              onClick={() => declineInvite(pendingInvites[0].id)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg text-xs cursor-pointer transition-colors"
            >
              DECLINE
            </button>
          </div>
        </div>
      )}

      {/* ── Main Console Workstation ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* 1. Left Navigation Rail (Width: ~72px) */}
        <CommsNavRail
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenSquadModal={() => setIsTeamModalOpen(true)}
          onOpenTeamModal={() => setIsTeamModalOpen(true)}
        />

        {/* 2. Secondary Sub-Panel based on Active Nav Rail Tab */}
        <div className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
          mobileView === 'sidebar' ? 'block' : 'hidden md:block'
        }`}>
          {activeNavTab === 'matrix' && (
            <ChannelSidebar
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenSquadModal={() => setIsTeamModalOpen(true)}
              onOpenTeamModal={() => setIsTeamModalOpen(true)}
            />
          )}

          {activeNavTab === 'roster' && (
            <NetworkRosterView />
          )}

          {activeNavTab === 'teams' && (
            <SquadSummarySidebar
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenSquadModal={() => setIsTeamModalOpen(true)}
            />
          )}

          {activeNavTab === 'vtt' && (
            <CommsVttPanel />
          )}

          {activeNavTab === 'logs' && (
            <PersonaAuditLogSidebar />
          )}

          {activeNavTab === 'settings' && (
            <div className="h-full flex flex-col bg-[#0b1019] text-slate-100 p-4 space-y-4 font-mono text-xs border-r border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings size={14} className="text-cyan-400" />
                  <span>STATION PREFERENCES</span>
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-200 block">AUDIO SYNTHESIS FEEDBACK</span>
                  <p className="text-slate-400 text-[10.5px]">
                    Terminal keyclicks, transmission alerts, and tactical dice roll chimes.
                  </p>
                  <button
                    type="button"
                    onClick={() => AudioService.playTerminalBeep(1400, 0.05)}
                    className="px-2.5 py-1 bg-cyan-950 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 rounded text-[10px] font-bold"
                  >
                    TEST TERMINAL CHIRP
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-200 block">VTT STAGE STREAMING</span>
                  <p className="text-slate-400 text-[10.5px]">
                    Real-time synchronization between HoloNet chat messages, dice rolls, and the VTT Master Viewport.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-200 block">PRESENCE HEARTBEAT</span>
                  <p className="text-slate-400 text-[10.5px]">
                    Automatic telemetry beacon updates your status and active persona across the network.
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9.5px] font-bold">
                    HEARTBEAT ACTIVE
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Center & Right Message Thread & Composer */}
        <div className={`flex-1 flex flex-col h-full min-w-0 bg-[#0a0e17] ${
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

      {/* Game Teams & Parties Builder Modal */}
      {isTeamModalOpen && (
        <GameGroupModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          initialTab="roster"
        />
      )}

      {/* Review & Accept Pending Team Invite Modal */}
      {reviewingInvite && (
        <TeamInviteConfirmationModal
          isOpen={!!reviewingInvite}
          onClose={closeInviteConfirmation}
          invite={reviewingInvite}
        />
      )}
    </div>
  );
};

export default CommsPage;
