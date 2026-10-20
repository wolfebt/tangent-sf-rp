import React from 'react';
import {
  Radio,
  Shield,
  Users,
  Compass,
  Plus,
  HelpCircle,
  Volume2,
  Sparkles,
  Globe
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

/**
 * @component NetworkServerRail
 * @description Zone 1 (64px Far-Left Column) of the 4-Zone SOTA Gaming Comm Center.
 * Provides 1-click switching between:
 *  - HoloNet Home (Global Relays, Direct Whispers, Custom Frequencies)
 *  - Enrolled Tactical Squads (Server-style Squad Crests with live unread & voice badges)
 *  - Unified Recruitment & LFG Hub (Squad Directory + LFP/LFS + Invites)
 *  - Operators & Personas Master Directory
 */
export const NetworkServerRail = ({
  serverContext = 'holonet', // 'holonet' | 'squad' | 'discovery' | 'directory'
  activeSquadId = null,
  squads = [],
  unreadCounts = {},
  holonetUnreadCount = 0,
  pendingInvitesCount = 0,
  onlineOperatorsCount = 0,
  hasNewOperatorLogins = false,
  isVoiceConnected = false,
  currentVoiceRoom = '',
  onSelectHolonet,
  onSelectSquad,
  onSelectDiscovery,
  onSelectDirectory,
  onOpenCreateSquad,
  onOpenGuide
}) => {
  const getSquadMonogram = (name = '') => {
    const clean = String(name || '').trim();
    if (!clean) return 'SQ';
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const getSquadUnreadCount = (squad) => {
    if (!squad) return 0;
    const chanId = squad.channelId || `group_chan_${squad.id}`;
    return unreadCounts[chanId] || 0;
  };

  const isSquadVoiceActive = (squad) => {
    if (!isVoiceConnected || !currentVoiceRoom || !squad) return false;
    const chanId = squad.channelId || `group_chan_${squad.id}`;
    return (
      currentVoiceRoom === `tangent_freq_${chanId}` ||
      currentVoiceRoom === `tangent_squad_${squad.id}`
    );
  };

  return (
    <aside
      aria-label="Network Server and Hub Rail"
      className="w-16 bg-[#05080f] border-r border-slate-800/90 flex flex-col items-center py-2.5 gap-2 shrink-0 select-none z-30 shadow-xl"
    >
      {/* 1. HOLONET HOME (Global Relays & Direct Whispers) */}
      <div className="relative group flex items-center justify-center w-full">
        {/* Left Active Pill Indicator */}
        <span
          className={`absolute left-0 w-1 rounded-r-full transition-all duration-200 ${
            serverContext === 'holonet'
              ? 'h-8 bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
              : holonetUnreadCount > 0
              ? 'h-2.5 bg-amber-400'
              : 'h-0 group-hover:h-4 bg-slate-500'
          }`}
        />

        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1150, 0.02);
            onSelectHolonet?.();
          }}
          className={`relative w-11 h-11 flex items-center justify-center transition-all duration-200 cursor-pointer border ${
            serverContext === 'holonet'
              ? 'rounded-xl bg-gradient-to-br from-cyan-600/35 via-cyan-950 to-slate-950 border-cyan-400/80 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.3)]'
              : 'rounded-2xl hover:rounded-xl bg-slate-900/90 hover:bg-cyan-950/60 border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300'
          }`}
          title="HoloNet Relay & Direct Whispers (Home)"
        >
          <Radio
            size={19}
            className={serverContext === 'holonet' ? 'text-cyan-300' : ''}
          />

          {/* Unread Badge */}
          {holonetUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-black font-mono font-black text-[9px] flex items-center justify-center border-2 border-[#05080f] shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-soft-badge-glow">
              {holonetUnreadCount > 99 ? '99+' : holonetUnreadCount}
            </span>
          )}
        </button>

        {/* Tooltip */}
        <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-full ml-2.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/40 text-xs font-mono text-white whitespace-nowrap shadow-2xl z-50">
          <div className="font-bold text-cyan-300">HOLONET RELAY & WHISPERS</div>
          <div className="text-[10px] text-slate-400">Public Channels & Direct Comms</div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-800/90 my-0.5 shrink-0" />

      {/* 2. ENROLLED SQUAD CRESTS (Scrollable Middle Stack) */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center gap-2 py-0.5">
        <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-500">
          SQUADS
        </span>

        {squads.map((squad) => {
          const isSelected =
            serverContext === 'squad' && activeSquadId === squad.id;
          const unread = getSquadUnreadCount(squad);
          const voiceLive = isSquadVoiceActive(squad);
          const monogram = getSquadMonogram(squad.name);
          const isOnMission = squad.status === 'On Mission';

          return (
            <div
              key={squad.id}
              className="relative group flex items-center justify-center w-full shrink-0"
            >
              {/* Left Active / Unread Pill Indicator */}
              <span
                className={`absolute left-0 w-1 rounded-r-full transition-all duration-200 ${
                  isSelected
                    ? 'h-8 bg-emerald-400 shadow-[0_0_10px_#10b981]'
                    : unread > 0
                    ? 'h-2.5 bg-amber-400'
                    : 'h-0 group-hover:h-4 bg-emerald-500/60'
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.02);
                  onSelectSquad?.(squad);
                }}
                className={`relative w-11 h-11 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer border font-mono ${
                  isSelected
                    ? 'rounded-xl bg-gradient-to-br from-emerald-600/35 via-emerald-950 to-slate-950 border-emerald-400/80 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                    : unread > 0
                    ? 'rounded-2xl hover:rounded-xl bg-amber-950/30 border-amber-500/60 text-amber-200'
                    : 'rounded-2xl hover:rounded-xl bg-slate-900/85 hover:bg-emerald-950/50 border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-200'
                }`}
                title={`${squad.name} (${squad.members?.length || 1} Operatives)`}
              >
                <span className="text-xs font-extrabold tracking-tight leading-none">
                  {monogram}
                </span>
                <span className="text-[7.5px] text-emerald-400/80 font-bold mt-0.5 flex items-center gap-0.5">
                  <Shield size={7} />
                  <span>{squad.members?.length || 1}</span>
                </span>

                {/* Unread Pip */}
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-amber-400 text-black font-mono font-black text-[9px] flex items-center justify-center border-2 border-[#05080f] shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                    {unread}
                  </span>
                )}

                {/* Active Voice Indicator */}
                {voiceLive && (
                  <span
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center border-2 border-[#05080f] shadow-[0_0_8px_#10b981]"
                    title="Voice Comms Active"
                  >
                    <Volume2 size={9} />
                  </span>
                )}

                {/* On-Mission VTT Indicator */}
                {!voiceLive && isOnMission && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-[#05080f] animate-pulse"
                    title="Squad On Mission"
                  />
                )}
              </button>

              {/* Rich Squad Tooltip */}
              <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-full ml-2.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-emerald-500/40 text-xs font-mono text-white whitespace-nowrap shadow-2xl z-50">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Shield size={11} />
                  <span>{squad.name}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {squad.members?.length || 1} Operatives •{' '}
                  {squad.status || 'Active'}
                  {squad.campaignTitle ? ` • ${squad.campaignTitle}` : ''}
                </div>
              </div>
            </div>
          );
        })}

        {/* + Create / Commission New Squad Button */}
        <div className="relative group flex items-center justify-center w-full shrink-0 pt-0.5">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1300, 0.02);
              onOpenCreateSquad?.();
            }}
            className="w-11 h-11 rounded-2xl hover:rounded-xl bg-slate-900/60 hover:bg-emerald-950/60 border border-dashed border-slate-700 hover:border-emerald-500/60 text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Commission New Tactical Squad"
          >
            <Plus size={18} />
          </button>

          <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-full ml-2.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-emerald-500/40 text-xs font-mono text-emerald-300 font-bold whitespace-nowrap shadow-2xl z-50">
            + COMMISSION NEW SQUAD
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-800/90 my-0.5 shrink-0" />

      {/* 3. BOTTOM DISCOVERY & DIRECTORY DOCK */}
      <div className="flex flex-col items-center gap-2 w-full shrink-0">
        {/* Recruitment & LFG Hub (Squad Directory + LFP/LFS + Invites) */}
        <div className="relative group flex items-center justify-center w-full">
          <span
            className={`absolute left-0 w-1 rounded-r-full transition-all duration-200 ${
              serverContext === 'discovery'
                ? 'h-8 bg-purple-400 shadow-[0_0_10px_#c084fc]'
                : pendingInvitesCount > 0
                ? 'h-2.5 bg-amber-400'
                : 'h-0 group-hover:h-4 bg-purple-500/60'
            }`}
          />

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              onSelectDiscovery?.();
            }}
            className={`relative w-11 h-11 flex items-center justify-center transition-all duration-200 cursor-pointer border ${
              serverContext === 'discovery'
                ? 'rounded-xl bg-gradient-to-br from-purple-600/35 via-purple-950 to-slate-950 border-purple-400/80 text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.3)]'
                : 'rounded-2xl hover:rounded-xl bg-slate-900/90 hover:bg-purple-950/60 border-slate-800 hover:border-purple-500/50 text-slate-400 hover:text-purple-300'
            }`}
            title="Recruitment & LFG Hub (Find Squads, LFP Beacons & Invites)"
          >
            <Compass size={19} />

            {pendingInvitesCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-black font-mono font-black text-[9px] flex items-center justify-center border-2 border-[#05080f] shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-soft-badge-glow">
                {pendingInvitesCount}!
              </span>
            )}
          </button>

          <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-full ml-2.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-purple-500/40 text-xs font-mono text-white whitespace-nowrap shadow-2xl z-50">
            <div className="font-bold text-purple-300">RECRUITMENT & LFG HUB</div>
            <div className="text-[10px] text-slate-400">
              Squad Directory, LFP Beacons & Invites
            </div>
          </div>
        </div>

        {/* Operators & Personas Directory */}
        <div className="relative group flex items-center justify-center w-full">
          <span
            className={`absolute left-0 w-1 rounded-r-full transition-all duration-200 ${
              serverContext === 'directory'
                ? 'h-8 bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                : hasNewOperatorLogins
                ? 'h-2.5 bg-emerald-400'
                : 'h-0 group-hover:h-4 bg-cyan-500/60'
            }`}
          />

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              onSelectDirectory?.();
            }}
            className={`relative w-11 h-11 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer border ${
              serverContext === 'directory'
                ? 'rounded-xl bg-gradient-to-br from-cyan-600/35 via-cyan-950 to-slate-950 border-cyan-400/80 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.3)]'
                : 'rounded-2xl hover:rounded-xl bg-slate-900/90 hover:bg-cyan-950/60 border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300'
            }`}
            title="Operators & Personas Roster Directory"
          >
            <Users size={16} />
            <span className="text-[8px] font-mono font-bold text-cyan-400 leading-none mt-0.5">
              {onlineOperatorsCount}
            </span>

            {hasNewOperatorLogins && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#05080f] animate-ping" />
            )}
          </button>

          <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-full ml-2.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/40 text-xs font-mono text-white whitespace-nowrap shadow-2xl z-50">
            <div className="font-bold text-cyan-300">OPERATORS & PERSONAS</div>
            <div className="text-[10px] text-slate-400">
              {onlineOperatorsCount} Active on Terran Net
            </div>
          </div>
        </div>

        {/* Operations Guide */}
        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1200, 0.02);
            onOpenGuide?.();
          }}
          className="w-9 h-9 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-slate-500 hover:text-cyan-300 flex items-center justify-center transition-colors cursor-pointer"
          title="Network Operations Manual"
        >
          <HelpCircle size={15} />
        </button>
      </div>
    </aside>
  );
};

export default NetworkServerRail;
