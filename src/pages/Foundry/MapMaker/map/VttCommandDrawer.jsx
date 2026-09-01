import React, { useState } from 'react';
import {
  VTT_ROLES,
  CANONICAL_TEAMS,
  setUserRole
} from '../../../../services/vttTeamService';
import { CANONICAL_PING_TYPES } from '../../../../services/mapPingService';
import AudioService from '../../../../services/audioService';
import { 
  Sliders, Users, Flame, Radio, X, Copy, Check, Tv, 
  Volume2, Shield, Eye, Compass, Grid, Sparkles, Swords
} from 'lucide-react';

const VttCommandDrawer = ({
  isOpen,
  onClose,
  vttRole = 'architect',
  onChangeVttRole,
  activeMapId,
  allMaps = [],
  tokens = [],
  teamRoster,
  onUpdateTeamRoster,
  gridSnap = true,
  onToggleGridSnap,
  gridSize = 40,
  onChangeGridSize,
  gridMode = 'hex',
  onChangeGridMode,
  measurementUnit = 'meters',
  onChangeMeasurementUnit,
  fogEnabled = true,
  onToggleFog,
  onDropPing,
  onApplyEnvironmentPreset,
  onBatchTokenAction,
  onBroadcastMessage
}) => {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'teams' | 'environment' | 'pings'
  const [selectedUserId, setSelectedUserId] = useState('player_1');
  const [copiedLink, setCopiedLink] = useState(false);
  const [audioVolume, setAudioVolume] = useState(() => {
    return typeof window !== 'undefined' ? parseFloat(localStorage.getItem('tangent_audio_volume') || '0.35') : 0.35;
  });

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

  const spectatorUrl = typeof window !== 'undefined' ? `${window.location.origin}/spectator/${activeMapId || 'tactical-zone'}` : '';

  const handleCopySpectatorLink = () => {
    AudioService.playTerminalBeep(1200, 0.05);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(spectatorUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setAudioVolume(val);
    AudioService.setVolume(val);
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

  const ENV_PRESETS = [
    { id: 'zero_g', label: 'Zero-G Drift', icon: '🌌', desc: 'Floating inertia / Acrobatics DC 12' },
    { id: 'smoke_fog', label: 'Dense Smoke', icon: '💨', desc: 'Heavy obscurement / +4 Cover DC' },
    { id: 'radiation_leak', label: 'High Radiation', icon: '☢️', desc: '1d6 Lethal tick per turn' },
    { id: 'vacuum_decomp', label: 'Vacuum Breach', icon: '🕳️', desc: 'Requires sealed EVA suits' }
  ];

  return (
    <div className="fixed top-12 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-[#090d16]/95 border-l border-cyan-500/60 shadow-[-10px_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col text-white select-none animate-slideLeft">
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-3.5 bg-[#121826] border-b border-cyan-500/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <Sliders size={16} />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-300 font-mono">
              Tactical VTT Command Console
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Role: <strong className="text-cyan-400 uppercase">{vttRole}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Mode Switcher Banner */}
      <div className="p-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-1 text-[11px] font-mono">
        <span className="text-[9px] uppercase font-bold text-slate-500 pl-1">Perspective:</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(900, 0.04);
              if (onChangeVttRole) onChangeVttRole('architect');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              vttRole === 'architect' ? 'bg-cyan-600 text-black shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            📐 Architect
          </button>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(900, 0.04);
              if (onChangeVttRole) onChangeVttRole('co_architect');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              vttRole === 'co_architect' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            🤝 Co-GM
          </button>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(900, 0.04);
              if (onChangeVttRole) onChangeVttRole('operative');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              vttRole === 'operative' ? 'bg-emerald-600 text-black shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            🎯 Operative
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="grid grid-cols-4 border-b border-slate-800 bg-[#0c121e] text-[10px] font-mono font-bold shrink-0">
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(850, 0.03);
            setActiveTab('settings');
          }}
          className={`py-2.5 flex items-center justify-center gap-1 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid size={13} /> Grid &amp; Opts
        </button>
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(850, 0.03);
            setActiveTab('teams');
          }}
          className={`py-2.5 flex items-center justify-center gap-1 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'teams'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={13} /> Squads
        </button>
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(850, 0.03);
            setActiveTab('environment');
          }}
          className={`py-2.5 flex items-center justify-center gap-1 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'environment'
              ? 'border-purple-400 text-purple-300 bg-purple-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame size={13} /> Hazards
        </button>
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(850, 0.03);
            setActiveTab('pings');
          }}
          className={`py-2.5 flex items-center justify-center gap-1 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'pings'
              ? 'border-amber-400 text-amber-300 bg-amber-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio size={13} /> Pings
        </button>
      </div>

      {/* Drawer Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* TAB 1: Grid & System Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-3.5">
            {/* Grid Snap & Mode */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                <Grid size={13} /> Tactical Grid Alignment
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-mono text-[10px]">Snap to Grid:</span>
                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(900, 0.04);
                      if (onToggleGridSnap) onToggleGridSnap();
                    }}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      gridSnap ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {gridSnap ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-mono text-[10px]">Grid Type:</span>
                  <div className="flex gap-1">
                    {['hex', 'square'].map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(850, 0.04);
                          if (onChangeGridMode) onChangeGridMode(mode);
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold transition-all cursor-pointer ${
                          gridMode === mode ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Measurement Scale */}
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-mono text-[10px]">Measurement Unit:</span>
                <div className="flex gap-1">
                  {['meters', 'feet', 'hexes'].map(unit => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(850, 0.04);
                        if (onChangeMeasurementUnit) onChangeMeasurementUnit(unit);
                      }}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold transition-all cursor-pointer ${
                        measurementUnit === unit ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fog of War */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
                <Eye size={13} /> Fog of War &amp; Recon
              </span>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-mono text-[10px]">Dynamic Player Fog:</span>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(900, 0.04);
                    if (onToggleFog) onToggleFog();
                  }}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    fogEnabled ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {fogEnabled ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Audio Synthesis */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                <Volume2 size={13} /> Audio Synthesis &amp; Ambience
              </span>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                <span className="text-slate-300 font-mono text-[10px] shrink-0">Master SFX:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioVolume}
                  onChange={handleVolumeChange}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <span className="text-xs font-mono text-cyan-300 font-bold w-8 text-right">
                  {Math.round(audioVolume * 100)}%
                </span>
              </div>
            </div>

            {/* Spectator Broadcast Link */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                <Tv size={13} /> Player 2nd Screen Broadcast
              </span>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={spectatorUrl}
                  className="bg-transparent text-slate-300 font-mono text-[10px] flex-1 outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopySpectatorLink}
                  className="px-2.5 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold font-mono rounded transition-colors cursor-pointer shrink-0"
                >
                  {copiedLink ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Squads & Team Permissions */}
        {activeTab === 'teams' && (
          <div className="space-y-3.5">
            {/* Quick Link to Full Team & Squad Management via Comms */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                window.dispatchEvent(new CustomEvent('open-team-management'));
              }}
              className="w-full p-2.5 bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all group shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Users size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Open Full Squad &amp; Team Hub</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-normal">Comms Hub →</span>
            </button>

            {/* Squads List */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tactical Squads:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {currentRoster.teams.map(t => (
                  <div
                    key={t.id}
                    className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center gap-2"
                  >
                    <span className="text-base">{t.badge}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-[11px] truncate" style={{ color: t.color }}>{t.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{t.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Player Role & Multi-Character Binding */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-cyan-400">Player &amp; Co-Architect Permissions:</span>
              
              <div className="flex gap-1">
                {['player_1', 'player_2', 'player_3'].map(uid => (
                  <button
                    key={uid}
                    type="button"
                    onClick={() => setSelectedUserId(uid)}
                    className={`flex-1 py-1 rounded font-mono text-[10px] font-bold transition-all cursor-pointer ${
                      selectedUserId === uid ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {uid === 'player_1' ? 'Operative 1' : uid === 'player_2' ? 'Co-GM' : 'Operative 3'}
                  </button>
                ))}
              </div>

              {/* Role Stepper */}
              <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => handleSetRole(VTT_ROLES.OPERATIVE)}
                  className={`py-1 rounded border text-center font-bold cursor-pointer transition-all ${
                    activeUserAssignment.role === VTT_ROLES.OPERATIVE ? 'bg-cyan-950 text-cyan-300 border-cyan-500' : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  🎯 Operative
                </button>
                <button
                  type="button"
                  onClick={() => handleSetRole(VTT_ROLES.CO_ARCHITECT)}
                  className={`py-1 rounded border text-center font-bold cursor-pointer transition-all ${
                    activeUserAssignment.role === VTT_ROLES.CO_ARCHITECT ? 'bg-purple-950 text-purple-300 border-purple-500' : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  🤝 Co-GM
                </button>
                <button
                  type="button"
                  onClick={() => handleSetRole(VTT_ROLES.ARCHITECT_LEAD)}
                  className={`py-1 rounded border text-center font-bold cursor-pointer transition-all ${
                    activeUserAssignment.role === VTT_ROLES.ARCHITECT_LEAD ? 'bg-amber-950 text-amber-300 border-amber-500' : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  👑 Lead GM
                </button>
              </div>

              {/* Multi-Character Units Checklist */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Bound Units ({activeUserAssignment.assignedTokenIds.length}):
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {tokens.map(token => {
                    const isBound = activeUserAssignment.assignedTokenIds.includes(token.id);

                    return (
                      <button
                        key={token.id}
                        type="button"
                        onClick={() => handleToggleTokenBinding(token.id)}
                        className={`w-full p-1.5 rounded border text-left flex items-center justify-between text-[10px] font-mono transition-all cursor-pointer ${
                          isBound ? 'bg-cyan-950/80 border-cyan-400 text-white' : 'bg-slate-950/50 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="truncate">{token.label || token.name || 'Unit'}</span>
                        <span className={`px-1.5 py-0.2 rounded font-bold ${isBound ? 'bg-cyan-600 text-black' : 'bg-slate-800'}`}>
                          {isBound ? 'Bound' : '+ Add'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Hazards & Batch Directives */}
        {activeTab === 'environment' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-400">Environmental Hazard Presets:</span>
              <div className="grid grid-cols-2 gap-2">
                {ENV_PRESETS.map(env => (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(980, 0.1);
                      if (onApplyEnvironmentPreset) onApplyEnvironmentPreset(env.id);
                    }}
                    className="p-2 rounded-lg bg-slate-950/80 hover:bg-purple-950/50 border border-purple-900/50 text-left flex items-center gap-2 transition-all cursor-pointer group"
                  >
                    <span className="text-lg shrink-0">{env.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-[11px] text-slate-200 group-hover:text-purple-300 truncate">
                        {env.label}
                      </span>
                      <span className="text-[9px] text-slate-500 line-clamp-1">{env.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Directives */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400">Batch Token Controls:</span>
              <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.1);
                    if (onBatchTokenAction) onBatchTokenAction('reveal_all');
                  }}
                  className="py-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition-all cursor-pointer text-center"
                >
                  👁️ Reveal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.1);
                    if (onBatchTokenAction) onBatchTokenAction('stealth_all');
                  }}
                  className="py-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition-all cursor-pointer text-center"
                >
                  🕶️ Stealth
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.1);
                    if (onBatchTokenAction) onBatchTokenAction('heal_party');
                  }}
                  className="py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold transition-all cursor-pointer text-center"
                >
                  💖 Rest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Tactical Radar Pings */}
        {activeTab === 'pings' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-amber-400">Deploy Tactical Radar Pings:</span>
              <p className="text-[11px] text-slate-400">
                Click any beacon below to drop a tactical ping at current map center coordinates:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {CANONICAL_PING_TYPES.map(p => (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(p.soundFreq, 0.1);
                      if (onDropPing) onDropPing(p.type);
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-left flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs" style={{ color: p.defaultColor }}>{p.label}</span>
                      <span className="text-[9px] text-slate-500 font-mono">Auto-decays (5s)</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#121826] border-t border-slate-800 flex justify-end shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Close Console
        </button>
      </div>
    </div>
  );
};

export default VttCommandDrawer;
