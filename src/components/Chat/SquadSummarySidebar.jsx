import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Radio, 
  ExternalLink, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Clock, 
  Map, 
  Crown,
  UserCheck
} from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { AudioService } from '../../services/audioService';

/**
 * @component SquadSummarySidebar
 * @description Dedicated side-panel for the TEAMS tab in CommsPage and CommLinkDock.
 * Provides active squad telemetry, member roster with status, channel link,
 * squad switcher, and quick navigation to /teams.
 */
export const SquadSummarySidebar = ({ 
  onOpenSquadModal, 
  onOpenCreateModal,
  isCompact = false 
}) => {
  const navigate = useNavigate();
  const { 
    groups = [], 
    activeGroup, 
    selectGroup, 
    pendingInvites = [],
    openInviteConfirmation 
  } = useGroup() || {};
  const { 
    selectChannel, 
    activeChannelId, 
    onlineOperators = [] 
  } = useChat() || {};
  const { currentUser } = useAuth() || {};

  const handleSwitchSquad = (groupId) => {
    AudioService.playTerminalBeep(1200, 0.02);
    selectGroup(groupId);
  };

  const handleTuneToSquadChannel = (channelId) => {
    if (!channelId) return;
    AudioService.playTerminalBeep(1300, 0.03);
    selectChannel(channelId);
  };

  const handleNavigateToTeams = () => {
    AudioService.playTerminalBeep(1150, 0.02);
    navigate('/teams');
  };

  const isCurrentChannelTuned = activeGroup?.channelId && activeChannelId === activeGroup.channelId;

  return (
    <div className="h-full flex flex-col bg-[#070b12] text-slate-100 border-r border-slate-800 font-sans select-none overflow-hidden">
      {/* ── Sub-Panel Header ── */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
            <Shield size={14} />
          </div>
          <div className="min-w-0">
            <h3 className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wider truncate">
              TACTICAL SQUADS
            </h3>
            <span className="text-[10px] font-mono text-slate-500 block truncate">
              {groups.length} Registered Comm Frequencies
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1250, 0.02);
              if (onOpenCreateModal) onOpenCreateModal();
              else navigate('/teams?action=new');
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500/60 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer"
            title="Create New Tactical Squad"
          >
            <Plus size={13} />
          </button>

          <button
            type="button"
            onClick={handleNavigateToTeams}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Open Full Teams Workstation (/teams)"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* ── Inbound Invite Alert (if any) ── */}
      {pendingInvites.length > 0 && (
        <div className="p-2.5 mx-2.5 mt-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs font-mono space-y-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 text-[10.5px] uppercase tracking-wider">
              {pendingInvites.length} PENDING COMMISSION{pendingInvites.length > 1 ? 'S' : ''}
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <p className="text-[10.5px] text-slate-300 truncate">
            "{pendingInvites[0].groupName}"
          </p>
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => openInviteConfirmation ? openInviteConfirmation(pendingInvites[0]) : navigate('/teams?tab=invites')}
              className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] cursor-pointer transition-colors"
            >
              REVIEW
            </button>
            <button
              type="button"
              onClick={() => navigate('/teams?tab=invites')}
              className="text-[10px] text-amber-300 hover:underline cursor-pointer"
            >
              All Invites
            </button>
          </div>
        </div>
      )}

      {/* ── Squad Switcher Dropdown (if multiple squads) ── */}
      {groups.length > 1 && (
        <div className="px-3 pt-2.5 shrink-0">
          <label className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
            ACTIVE DEPLOYMENT SQUAD
          </label>
          <select
            value={activeGroup?.id || ''}
            onChange={(e) => handleSwitchSquad(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {groups.map((grp) => (
              <option key={grp.id} value={grp.id}>
                {grp.name} ({grp.members?.length || 0} Ops)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Active Squad Card ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono">
        {activeGroup ? (
          <div className="space-y-3">
            {/* Squad Dossier Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs truncate">
                  {activeGroup.name}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                  activeGroup.status === 'Recruiting' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}>
                  {activeGroup.status || 'Active'}
                </span>
              </div>

              {activeGroup.description && (
                <p className="text-[11px] text-slate-400 font-sans line-clamp-2">
                  {activeGroup.description}
                </p>
              )}

              {activeGroup.campaignTitle && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <Map size={11} className="text-amber-400 shrink-0" />
                  <span className="truncate">Story: {activeGroup.campaignTitle}</span>
                </div>
              )}

              {/* Direct Frequency Tuning Button */}
              {activeGroup.channelId && (
                <button
                  type="button"
                  onClick={() => handleTuneToSquadChannel(activeGroup.channelId)}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-[10.5px] font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCurrentChannelTuned
                      ? 'bg-cyan-950 border border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300'
                  }`}
                >
                  <Radio size={12} className={isCurrentChannelTuned ? 'animate-pulse text-cyan-400' : ''} />
                  <span>{isCurrentChannelTuned ? 'SQUAD FREQUENCY TUNED' : 'TUNE TO SQUAD CHANNEL'}</span>
                </button>
              )}
            </div>

            {/* Members Roster Mini-Feed */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider px-1">
                <span>OPERATORS ROSTER ({activeGroup.members?.length || 0})</span>
                <span className="text-[9px] text-slate-500">Live Presence</span>
              </div>

              <div className="space-y-1">
                {(activeGroup.members || []).map((m, idx) => {
                  const isOnline = onlineOperators.some(op => op.uid === m.userId || op.userHandle === m.userHandle);
                  const isSelf = m.userId === currentUser?.uid;

                  return (
                    <div
                      key={m.userId || idx}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200">
                            {(m.displayName || m.userHandle || 'OP').substring(0, 2).toUpperCase()}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-black ${
                            isOnline ? 'bg-emerald-400' : 'bg-slate-600'
                          }`} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-200 truncate block text-[11px]">
                              {m.displayName || m.userHandle || 'Operator'}
                            </span>
                            {isSelf && (
                              <span className="text-[8.5px] px-1 rounded bg-slate-800 text-cyan-300 font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                          {m.personaName && (
                            <span className="text-[9.5px] text-emerald-400/90 truncate block">
                              Persona: {m.personaName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 text-[9.5px]">
                        {m.role === 'Leader' || m.role === 'GM' ? (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-0.5">
                            <Crown size={9} />
                            <span>{m.role}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[9px]">
                            {m.role || 'Member'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Jump into Teams workstation button */}
            <button
              type="button"
              onClick={handleNavigateToTeams}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-1.5">
                <Shield size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>OPEN SQUAD DOSSIER</span>
              </div>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 space-y-3">
            <Users size={28} className="mx-auto text-slate-600" />
            <p className="text-xs font-mono">No active tactical squad deployed.</p>
            <button
              type="button"
              onClick={handleNavigateToTeams}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              JOIN OR CREATE SQUAD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SquadSummarySidebar;
