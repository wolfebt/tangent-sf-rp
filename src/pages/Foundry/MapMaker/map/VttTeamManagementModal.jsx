import React, { useState } from 'react';
import {
  VTT_ROLES,
  CANONICAL_TEAMS,
  bindCharactersToUser,
  setUserRole
} from '../../../../services/vttTeamService';
import AudioService from '../../../../services/audioService';

const VttTeamManagementModal = ({
  isOpen,
  onClose,
  tokens = [],
  teamRoster,
  onUpdateTeamRoster,
  onBroadcastMessage
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState('team_alpha');
  const [selectedUserId, setSelectedUserId] = useState('player_1');
  const [newTeamName, setNewTeamName] = useState('');

  if (!isOpen) return null;

  const currentRoster = teamRoster || {
    teams: CANONICAL_TEAMS,
    userAssignments: {
      player_1: {
        role: VTT_ROLES.OPERATIVE,
        teamId: 'team_alpha',
        assignedTokenIds: tokens.slice(0, 2).map(t => t.id)
      },
      player_2: {
        role: VTT_ROLES.CO_ARCHITECT,
        teamId: 'team_alpha',
        assignedTokenIds: tokens.slice(2, 4).map(t => t.id)
      }
    }
  };

  const activeUserAssignment = currentRoster.userAssignments[selectedUserId] || {
    role: VTT_ROLES.OPERATIVE,
    teamId: 'team_alpha',
    assignedTokenIds: []
  };

  const handleToggleTokenBinding = (tokenId) => {
    AudioService.playTerminalBeep(980, 0.05);
    const isBound = activeUserAssignment.assignedTokenIds.includes(tokenId);
    const updatedIds = isBound
      ? activeUserAssignment.assignedTokenIds.filter(id => id !== tokenId)
      : [...activeUserAssignment.assignedTokenIds, tokenId];

    const updated = {
      ...currentRoster,
      userAssignments: {
        ...currentRoster.userAssignments,
        [selectedUserId]: {
          ...activeUserAssignment,
          assignedTokenIds: updatedIds
        }
      }
    };

    if (onUpdateTeamRoster) onUpdateTeamRoster(updated);
  };

  const handleSetRole = (role) => {
    AudioService.playTerminalBeep(1100, 0.1);
    const updated = setUserRole(currentRoster, selectedUserId, role);
    if (onUpdateTeamRoster) onUpdateTeamRoster(updated);

    if (onBroadcastMessage) {
      onBroadcastMessage(`[VTT PERMISSION]: User ${selectedUserId} assigned role: ${role.toUpperCase()}`);
    }
  };

  const handleBroadcastRoster = () => {
    AudioService.playTerminalBeep(1200, 0.15);
    if (onBroadcastMessage) {
      onBroadcastMessage(`[VTT ROSTER]: Squad roster synchronized across all ${currentRoster.teams.length} teams.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="bg-[#0b121d] border border-cyan-500/70 rounded-xl p-5 w-full max-w-4xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white flex flex-col gap-4 max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-cyan-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              👥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-cyan-300">
                  VTT Team, Co-Architect &amp; Roster Console
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950 border border-cyan-500/60 text-cyan-200">
                  SQUAD PROTOCOL v4.1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure Teams, Co-Architect Permissions &amp; Multi-Character Bindings per Player
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 text-2xl font-bold leading-none px-2 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* 2-Column Layout: Teams & Roles (Left) + Multi-Character Binding (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
          {/* Left Column: Teams & Roles */}
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Squads &amp; Factions:</span>
              <div className="grid grid-cols-2 gap-2">
                {currentRoster.teams.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTeamId(t.id)}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      selectedTeamId === t.id
                        ? 'bg-cyan-950/80 border-cyan-400 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">{t.badge}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-xs" style={{ color: t.color }}>{t.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{t.type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Player Selection & Role Grant */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Player &amp; Architect Permissions:</span>
              
              <div className="flex gap-2">
                {['player_1', 'player_2', 'player_3'].map(uid => (
                  <button
                    key={uid}
                    type="button"
                    onClick={() => setSelectedUserId(uid)}
                    className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                      selectedUserId === uid
                        ? 'bg-cyan-600 text-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {uid === 'player_1' ? '👤 Operative 1' : uid === 'player_2' ? '🤝 Co-Architect' : '👤 Operative 3'}
                  </button>
                ))}
              </div>

              {/* Role Dispatcher */}
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-mono">Assigned Role:</span>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleSetRole(VTT_ROLES.OPERATIVE)}
                    className={`py-1 rounded border text-center font-bold cursor-pointer transition-all ${
                      activeUserAssignment.role === VTT_ROLES.OPERATIVE
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🎯 Operative
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetRole(VTT_ROLES.CO_ARCHITECT)}
                    className={`py-1 rounded border text-center font-bold cursor-pointer transition-all ${
                      activeUserAssignment.role === VTT_ROLES.CO_ARCHITECT
                        ? 'bg-purple-950 text-purple-300 border-purple-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🤝 Co-Architect
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetRole(VTT_ROLES.ARCHITECT_LEAD)}
                    className={`py-1 rounded border text-center font-bold cursor-pointer transition-all ${
                      activeUserAssignment.role === VTT_ROLES.ARCHITECT_LEAD
                        ? 'bg-amber-950 text-amber-300 border-amber-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    👑 Lead GM
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Character Binding Checklist */}
          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2 text-xs h-full">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-[10px] uppercase font-bold text-cyan-300">
                  Multi-Character Units Assigned to {selectedUserId}:
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {activeUserAssignment.assignedTokenIds.length} Bound
                </span>
              </div>

              {tokens.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-6 text-center">
                  No unit tokens found on the current battlemap.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[260px] pr-1">
                  {tokens.map(token => {
                    const isBound = activeUserAssignment.assignedTokenIds.includes(token.id);

                    return (
                      <button
                        key={token.id}
                        type="button"
                        onClick={() => handleToggleTokenBinding(token.id)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isBound
                            ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-sm'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{token.type === 'hero' ? '🧙‍♂️' : token.type === 'vehicle' ? '🚀' : '🤖'}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs truncate text-cyan-200">{token.label || token.name || 'Unit'}</span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              HP: {token.hp || 30} | {token.type || 'Token'}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isBound ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isBound ? '✓ Bound' : '+ Assign'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleBroadcastRoster}
            className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-mono font-bold rounded transition-colors cursor-pointer"
          >
            📡 Broadcast Squad Roster
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Close Roster Console
          </button>
        </div>
      </div>
    </div>
  );
};

export default VttTeamManagementModal;
