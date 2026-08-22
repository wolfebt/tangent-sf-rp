import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Shield, 
  Radio, 
  Crown, 
  X, 
  ChevronRight, 
  Sparkles, 
  Key, 
  Check, 
  UserPlus, 
  MessageSquare, 
  Play, 
  AlertCircle 
} from 'lucide-react';
import { useGroup } from '../../../context/GroupContext';
import { useChat } from '../../../context/ChatContext';
import { useAuth } from '../../../context/AuthContext';
import { useFolio } from '../../../context/FolioContext';
import { AudioService } from '../../../services/audioService';
import { CreateGroupModal } from '../../Groups/CreateGroupModal';
import { GameGroupModal } from '../../Groups/GameGroupModal';

export const GameGroupsDrawer = ({ onClose }) => {
  const navigate = useNavigate();
  const { 
    groups, 
    activeGroup, 
    selectGroup, 
    pendingInvites, 
    acceptInvite, 
    declineInvite, 
    joinByCode 
  } = useGroup();
  const { selectChannel } = useChat();
  const { currentUser } = useAuth();
  const { personaRoster, roster, activePersona } = useFolio();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupModalTab, setGroupModalTab] = useState('roster');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);

  const allPersonas = personaRoster || roster || [];

  const handleOpenGroupDetails = (group, tab = 'roster') => {
    AudioService.playTerminalBeep(1100, 0.02);
    selectGroup(group.id);
    setGroupModalTab(tab);
    setIsGroupModalOpen(true);
  };

  const handleOpenTiedInComms = (group, e) => {
    if (e) e.stopPropagation();
    AudioService.playTerminalBeep(1200, 0.03);
    if (group.channelId) {
      selectChannel(group.channelId);
    }
    navigate('/comms');
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    setJoinLoading(true);
    setJoinError(null);
    try {
      const joined = await joinByCode(inviteCodeInput.trim());
      AudioService.playTerminalBeep(1500, 0.04);
      setInviteCodeInput('');
      if (joined) {
        selectGroup(joined.id);
        setIsGroupModalOpen(true);
      }
    } catch (err) {
      console.error('Join group failed:', err);
      setJoinError(err.message || 'Failed to join group with provided code.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleAcceptInvite = async (invite) => {
    try {
      await acceptInvite(invite.id, invite.groupId);
    } catch (err) {
      console.error('Accept invite error:', err);
    }
  };

  const handleDeclineInvite = async (invite) => {
    try {
      await declineInvite(invite.id);
    } catch (err) {
      console.error('Decline invite error:', err);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-3.5 select-none">
      <div className="space-y-3.5">
        {/* Header */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/40 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Users size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
                  GAME SQUADS & PARTIES
                </h2>
                <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                  {groups.length} Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Fireteams, tabletop campaigns, and tied-in encrypted comm frequencies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1300, 0.03);
                setIsCreateOpen(true);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-mono font-bold text-xs rounded-lg shadow flex items-center gap-1.5 transition-all"
            >
              <Plus size={14} />
              <span>NEW SQUAD</span>
            </button>
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

        {/* Quick Join via Code Form */}
        <form onSubmit={handleJoinByCode} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs font-mono">
          <Key size={14} className="text-cyan-400 shrink-0 ml-1" />
          <input
            type="text"
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
            placeholder="Enter Squad Invite Code (e.g. GRP-XXXXXX)..."
            className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase tracking-widest text-[11px]"
          />
          <button
            type="submit"
            disabled={joinLoading || !inviteCodeInput.trim()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 disabled:opacity-30 text-cyan-300 hover:text-white font-bold rounded-lg transition-colors shrink-0 flex items-center gap-1"
          >
            <Check size={13} />
            <span>{joinLoading ? 'Joining...' : 'JOIN'}</span>
          </button>
        </form>

        {joinError && (
          <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{joinError}</span>
          </div>
        )}

        {/* Pending Invites Alert Banner */}
        {pendingInvites.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span className="flex items-center gap-1.5">
                <UserPlus size={14} />
                <span>INCOMING SQUAD INVITATIONS ({pendingInvites.length})</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            </div>

            <div className="space-y-2 pt-1">
              {pendingInvites.map(inv => (
                <div
                  key={inv.id}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">{inv.groupName}</span>
                    <span className="text-[10px] text-slate-400">
                      Invited by <strong className="text-amber-400">@{inv.fromUserHandle}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAcceptInvite(inv)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px] transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineInvite(inv)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-red-900 text-slate-300 hover:text-white rounded text-[11px] transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Squads List */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {groups.length === 0 ? (
            <div className="py-12 px-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2 font-mono">
              <Users size={28} className="mx-auto text-slate-600" />
              <p className="text-xs text-slate-400">NO ACTIVE SQUADS OR PARTIES</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Create a tactical squad to organize your tabletop group, assign operatives, share invite codes, and tune into tied-in holonet channels.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="mt-2 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider inline-flex items-center gap-1.5 shadow"
              >
                <Plus size={13} />
                <span>Establish Fireteam</span>
              </button>
            </div>
          ) : (
            groups.map(group => {
              const isLeader = group.creatorId === currentUser?.uid;
              const membersCount = group.members?.length || 1;
              const maxCount = group.maxMembers || 6;
              const status = group.status || 'Recruiting';

              return (
                <div
                  key={group.id}
                  onClick={() => handleOpenGroupDetails(group)}
                  className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-cyan-300 shrink-0 group-hover:border-cyan-500/40 transition-colors">
                      <Shield size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-cyan-200 transition-colors truncate">
                          {group.name}
                        </span>
                        {isLeader && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold flex items-center gap-0.5">
                            <Crown size={9} /> GM
                          </span>
                        )}
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono border ${
                          status === 'In Session' 
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' 
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {status}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        <span>GM: @{group.creatorHandle || 'Architect'}</span>
                        <span className="mx-1.5">•</span>
                        <span>{membersCount}/{maxCount} Operatives</span>
                        {group.campaignTitle && (
                          <>
                            <span className="mx-1.5">•</span>
                            <span className="text-purple-300">Story: {group.campaignTitle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => handleOpenTiedInComms(group, e)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-cyan-600/30 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-[11px] font-mono font-bold transition-all flex items-center gap-1"
                      title="Open Tied-in Squad Channel"
                    >
                      <Radio size={12} />
                      <span>Comms</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenGroupDetails(group, 'invites');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-emerald-600/30 text-emerald-300 border border-slate-700 hover:border-emerald-500/40 text-[11px] font-mono font-bold transition-all flex items-center gap-1"
                      title="Invite Operatives"
                    >
                      <UserPlus size={12} />
                      <span>Invite</span>
                    </button>

                    <div className="p-1 text-slate-500 group-hover:text-cyan-300 transition-colors">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newGroup) => {
          if (newGroup) {
            selectGroup(newGroup.id);
            setIsGroupModalOpen(true);
          }
        }}
      />

      <GameGroupModal
        isOpen={isGroupModalOpen}
        initialTab={groupModalTab}
        onClose={() => setIsGroupModalOpen(false)}
      />
    </div>
  );
};

export default GameGroupsDrawer;
