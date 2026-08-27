import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  UserPlus, 
  Radio, 
  ChevronRight, 
  Crown, 
  Key, 
  Heart, 
  Sparkles,
  Plus
} from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { AudioService } from '../../services/audioService';
import { GameGroupModal } from '../Groups/GameGroupModal';
import { CreateGroupModal } from '../Groups/CreateGroupModal';

export const GameSquadsWidget = ({ onOpenSquadsDrawer }) => {
  const navigate = useNavigate();
  const { groups, activeGroup, selectGroup, pendingInvites } = useGroup();
  const { selectChannel } = useChat();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('roster');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const squadCount = groups.length;
  const inviteCount = pendingInvites.length;
  const targetGroup = activeGroup || (groups.length > 0 ? groups[0] : null);
  const membersList = Object.values(targetGroup?.memberDetails || {});

  const handleOpenModal = (tab = 'roster', e) => {
    if (e) e.stopPropagation();
    AudioService.playTerminalBeep(1200, 0.03);
    if (targetGroup) {
      selectGroup(targetGroup.id);
      setModalTab(tab);
      setIsModalOpen(true);
    } else if (onOpenSquadsDrawer) {
      onOpenSquadsDrawer();
    }
  };

  const handleOpenTiedInComms = (e) => {
    if (e) e.stopPropagation();
    AudioService.playTerminalBeep(1200, 0.03);
    if (targetGroup?.channelId) {
      selectChannel(targetGroup.channelId);
    }
    navigate('/comms');
  };

  const handleWidgetClick = () => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (onOpenSquadsDrawer) {
      onOpenSquadsDrawer();
    } else if (targetGroup) {
      handleOpenModal('roster');
    }
  };

  return (
    <div 
      onClick={handleWidgetClick}
      className="bg-slate-900/15 hover:bg-slate-900/85 backdrop-blur-md p-2.5 sm:p-3 rounded-xl border-2 border-emerald-500/70 hover:border-emerald-400 flex flex-col justify-between relative overflow-hidden group transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] cursor-pointer select-none"
    >
      {/* Ambient Glow */}
      <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Shield className="text-emerald-400 animate-pulse" size={14} />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-300 font-bold">
              GAME SQUADS & PARTIES
            </span>
          </div>
          {inviteCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[8px] font-bold flex items-center gap-1 animate-pulse">
              <UserPlus size={9} />
              <span>{inviteCount} INVITES</span>
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[8px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{squadCount} {squadCount === 1 ? 'SQUAD' : 'SQUADS'}</span>
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="mt-1.5 space-y-1">
          {targetGroup ? (
            <>
              <div>
                <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500">Active Fireteam</span>
                <div className="flex items-center justify-between mt-0">
                  <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate font-mono">
                    {targetGroup.name}
                  </h2>
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono border uppercase ${
                    targetGroup.status === 'In Session'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {targetGroup.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Members At A Glance */}
              <div className="space-y-0.5 text-xs pt-0.5">
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <span className="flex items-center gap-1 truncate text-slate-400">
                    <Crown size={10} className="text-amber-400 shrink-0" />
                    <span>GM: @{targetGroup.creatorHandle || 'Architect'}</span>
                  </span>
                  <span className="text-slate-400 font-mono text-[9px]">
                    {membersList.length}/{targetGroup.maxMembers || 6} Operatives
                  </span>
                </div>

                {/* Operative Mini Avatars */}
                <div className="flex items-center gap-1 pt-0.5">
                  {membersList.slice(0, 5).map((m, idx) => {
                    const charName = m.persona?.name || m.handle || 'Agent';
                    const initial = charName.charAt(0).toUpperCase();
                    return (
                      <div
                        key={m.userId || idx}
                        title={`${charName} (@${m.handle})`}
                        className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-cyan-300 font-mono"
                      >
                        {initial}
                      </div>
                    );
                  })}
                  {membersList.length > 5 && (
                    <span className="text-[8.5px] font-mono text-slate-500">
                      +{membersList.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-1 text-center space-y-0.5">
              <p className="text-[11px] text-slate-400 font-mono font-bold">NO ACTIVE SQUAD</p>
              <p className="text-[9.5px] text-slate-500 max-w-[220px] mx-auto leading-tight">
                Form a fireteam or join with an invite passcode.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 pt-1.5 border-t border-slate-800/80 space-y-1">
        <button
          type="button"
          onClick={(e) => {
            if (targetGroup) {
              handleOpenModal('roster', e);
            } else if (onOpenSquadsDrawer) {
              onOpenSquadsDrawer();
            } else {
              setIsCreateOpen(true);
            }
          }}
          className="w-full py-1.5 px-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10px] font-mono uppercase tracking-wider rounded-md flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-98"
        >
          <Users size={11} />
          <span>{targetGroup ? 'Manage Squad & Roster' : 'Establish Fireteam'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {targetGroup ? (
            <button
              type="button"
              onClick={handleOpenTiedInComms}
              className="flex-1 py-1 px-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-[9px] font-mono uppercase tracking-wider rounded-md border border-slate-700 hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-1"
            >
              <Radio size={10} className="text-cyan-400" />
              <span>Squad Comms</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenSquadsDrawer) onOpenSquadsDrawer();
              }}
              className="flex-1 py-1 px-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-[9px] font-mono uppercase tracking-wider rounded-md border border-slate-700 hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-1"
            >
              <Key size={10} className="text-cyan-400" />
              <span>Join By Code</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              if (targetGroup) {
                handleOpenModal('invites', e);
              } else {
                e.stopPropagation();
                setIsCreateOpen(true);
              }
            }}
            title="Invite Operatives"
            className="py-1 px-2 bg-slate-800/90 hover:bg-slate-700 text-emerald-300 font-bold text-[9px] font-mono uppercase tracking-wider rounded-md border border-slate-700 hover:border-emerald-500/50 transition-colors flex items-center gap-1"
          >
            <UserPlus size={10} className="text-emerald-400" />
            <span>Invite</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {targetGroup && (
        <GameGroupModal
          isOpen={isModalOpen}
          initialTab={modalTab}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newGroup) => {
          if (newGroup) {
            selectGroup(newGroup.id);
            setModalTab('roster');
            setIsModalOpen(true);
          }
        }}
      />
    </div>
  );
};

export default GameSquadsWidget;
