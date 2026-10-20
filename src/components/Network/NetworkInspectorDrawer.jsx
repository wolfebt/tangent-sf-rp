import React, { useState, useMemo } from 'react';
import {
  Users,
  BookOpen,
  Map,
  Activity,
  X,
  Search,
  Shield,
  MessageSquare,
  UserPlus,
  Crown,
  ChevronDown,
  ChevronRight,
  Info,
  Lock,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { ArchitectDocketBlock } from '../Chat/ArchitectDocketBlock';
import { CommsVttPanel } from '../Chat/CommsVttPanel';
import { PersonaAuditLogSidebar } from '../Chat/PersonaAuditLogSidebar';
import { AudioService } from '../../services/audioService';

/**
 * @component NetworkInspectorDrawer
 * @description Zone 4 (320px-384px Collapsible Right Inspector) of the 4-Zone SOTA Gaming Comm Center.
 * Consolidates 4 previously competing drawers into ONE single slot so two right sidebars can never collide:
 *  - 'roster': Channel / Squad Participants & Operator Roster
 *  - 'docket': Architect Tactical Docket (Objectives, Intel, Handouts, Checklists)
 *  - 'vtt':    Stage VTT Live Telemetry & Map Synchronizer
 *  - 'audit':  Channel Dossier & Persona Telemetry Audit Log
 */
export const NetworkInspectorDrawer = ({
  activeTab = null, // 'roster' | 'docket' | 'vtt' | 'audit' | null
  onSelectTab,
  onClose,
  activeChannel,
  matchedGroup,
  docketBlocks = [],
  uncheckedDocketCount = 0,
  onInviteUser
}) => {
  const { currentUser } = useAuth() || {};
  const {
    isTeamChannel: checkIsTeam,
    activeChannelUsers,
    onlineOperators = [],
    offlineOperators = [],
    startDirectMessage
  } = useChat() || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [offlineCollapsed, setOfflineCollapsed] = useState(true);

  const isTeam = useMemo(() => {
    if (!activeChannel) return false;
    return checkIsTeam
      ? checkIsTeam(activeChannel)
      : activeChannel.type === 'group' || Boolean(activeChannel.groupId);
  }, [activeChannel, checkIsTeam]);

  const filteredTeamPersonas = useMemo(() => {
    const list = activeChannelUsers?.personas || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.role?.toLowerCase().includes(q) ||
        p.species?.toLowerCase().includes(q) ||
        p.ownerHandle?.toLowerCase().includes(q)
    );
  }, [activeChannelUsers?.personas, searchQuery]);

  const activeTeamPersonas = useMemo(
    () => filteredTeamPersonas.filter((p) => p.characterPresence !== 'offline'),
    [filteredTeamPersonas]
  );

  const offlineTeamPersonas = useMemo(
    () => filteredTeamPersonas.filter((p) => p.characterPresence === 'offline'),
    [filteredTeamPersonas]
  );

  const filteredOnlineOps = useMemo(() => {
    if (!searchQuery.trim()) return onlineOperators;
    const q = searchQuery.toLowerCase().trim();
    return onlineOperators.filter(
      (u) =>
        u.userHandle?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q) ||
        u.statusMessage?.toLowerCase().includes(q) ||
        (Array.isArray(u.characters) &&
          u.characters.some((c) => c.name?.toLowerCase().includes(q)))
    );
  }, [onlineOperators, searchQuery]);

  const filteredOfflineOps = useMemo(() => {
    if (!searchQuery.trim()) return offlineOperators;
    const q = searchQuery.toLowerCase().trim();
    return offlineOperators.filter(
      (u) =>
        u.userHandle?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q)
    );
  }, [offlineOperators, searchQuery]);

  if (!activeTab) return null;

  const TABS = [
    {
      id: 'roster',
      label: 'ROSTER',
      icon: Users,
      badge: isTeam
        ? activeChannelUsers?.personas?.length || 0
        : onlineOperators.length || 0
    },
    {
      id: 'docket',
      label: 'DOCKET',
      icon: BookOpen,
      badge:
        uncheckedDocketCount > 0
          ? `${uncheckedDocketCount}!`
          : docketBlocks.length > 0
          ? docketBlocks.length
          : null,
      isAlert: uncheckedDocketCount > 0
    },
    {
      id: 'vtt',
      label: 'STAGE',
      icon: Map
    },
    {
      id: 'audit',
      label: 'AUDIT',
      icon: Activity
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 xl:hidden"
        onClick={onClose}
      />

      <aside
        aria-label="Contextual Inspector Drawer"
        className="fixed inset-y-0 right-0 z-50 xl:static w-80 sm:w-88 lg:w-96 h-full bg-[#080c14] border-l border-slate-800/90 flex flex-col font-mono text-xs select-none shrink-0 shadow-2xl xl:shadow-none animate-in slide-in-from-right duration-200"
      >
        {/* ── Unified 4-Tab Inspector Header ── */}
        <div className="px-2.5 py-2 bg-slate-950 border-b border-slate-800/90 flex items-center justify-between gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 flex-1 min-w-0">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1150, 0.02);
                    onSelectTab?.(t.id);
                  }}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={t.label}
                >
                  <Icon
                    size={11}
                    className={
                      t.isAlert
                        ? 'text-amber-400 animate-pulse'
                        : isSelected
                        ? 'text-cyan-400'
                        : 'text-slate-400'
                    }
                  />
                  <span className="truncate">{t.label}</span>
                  {t.badge !== null && t.badge !== undefined && (
                    <span
                      className={`px-1 py-0.1 rounded-full text-[8.5px] font-extrabold shrink-0 ${
                        t.isAlert
                          ? 'bg-amber-400 text-black animate-soft-badge-glow'
                          : 'bg-slate-800 text-cyan-300'
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              onClose?.();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Collapse Inspector Drawer"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── TAB 1: CONTEXTUAL ROSTER (Squad Characters OR Network Operators) ── */}
        {activeTab === 'roster' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Search Filter */}
            <div className="p-2.5 border-b border-slate-800/80 bg-slate-950/50 shrink-0">
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isTeam
                      ? 'Filter squad characters...'
                      : 'Filter network operators...'
                  }
                  className="w-full pl-7 pr-6 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-[11px] focus:outline-none focus:border-cyan-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 no-scrollbar">
              {isTeam ? (
                <>
                  {/* Architect Command */}
                  {Array.isArray(activeChannelUsers?.architectCommand) &&
                    activeChannelUsers.architectCommand.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold uppercase tracking-wider px-1">
                          <span>
                            ARCHITECT COMMAND (
                            {activeChannelUsers.architectCommand.length})
                          </span>
                          <span className="text-[8.5px] text-slate-500">
                            GM / Lead
                          </span>
                        </div>
                        {activeChannelUsers.architectCommand.map((arch) => {
                          const isSelf =
                            currentUser && arch.uid === currentUser.uid;
                          return (
                            <div
                              key={arch.uid}
                              className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/40 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-300 font-bold text-xs shrink-0">
                                  <Crown size={13} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-amber-200 text-xs truncate">
                                      @{arch.userHandle}
                                    </span>
                                    <span className="px-1.5 py-0.1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] font-bold uppercase">
                                      {arch.commandTitle}
                                    </span>
                                  </div>
                                  <span className="text-[9.5px] text-slate-400 block truncate">
                                    {arch.isOnline
                                      ? arch.activity?.label || 'Command Online'
                                      : 'Offline'}
                                  </span>
                                </div>
                              </div>
                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    startDirectMessage?.(arch.user, null)
                                  }
                                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-[9px] font-bold cursor-pointer shrink-0"
                                >
                                  DM
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* Active Squad Characters */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-1">
                      <span className="flex items-center gap-1.5">
                        <Shield size={11} />
                        <span>
                          ACTIVE FIRETEAM ({activeTeamPersonas.length})
                        </span>
                      </span>
                    </div>

                    {activeTeamPersonas.length === 0 ? (
                      <div className="p-3 text-center text-slate-500 text-[11px] italic bg-slate-900/30 rounded-lg border border-slate-800/50">
                        No squad characters currently deployed.
                      </div>
                    ) : (
                      activeTeamPersonas.map((p) => {
                        const isSelf =
                          currentUser && p.ownerUid === currentUser.uid;
                        const maxHp = Number(p.health) || 30;
                        const curHp = Number(p.current_health ?? maxHp);
                        const hpPct = Math.max(
                          0,
                          Math.min(100, Math.round((curHp / maxHp) * 100))
                        );

                        return (
                          <div
                            key={p.id}
                            className="p-2 rounded-xl bg-slate-900/75 border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="relative shrink-0">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-bold text-[11px]">
                                    {(p.name || 'P').slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-100 text-xs truncate">
                                    {p.name}
                                  </div>
                                  <div className="text-[9.5px] text-slate-400 truncate">
                                    {p.species} • {p.role} (@{p.ownerHandle})
                                  </div>
                                </div>
                              </div>

                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    startDirectMessage?.(
                                      p.targetUser || {
                                        uid: p.ownerUid,
                                        userHandle: p.ownerHandle
                                      },
                                      p
                                    )
                                  }
                                  className="px-2 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-[9px] font-bold cursor-pointer shrink-0"
                                  title={`Whisper ${p.name}`}
                                >
                                  🎭 WHISPER
                                </button>
                              )}
                            </div>

                            {/* Compact HP Bar */}
                            <div className="flex items-center gap-2 text-[9px] text-slate-400">
                              <span className="text-emerald-400 font-bold">
                                HP {curHp}/{maxHp}
                              </span>
                              <div className="flex-1 h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                  style={{ width: `${hpPct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Stasis / Offline Squad Characters */}
                  {offlineTeamPersonas.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setOfflineCollapsed((prev) => !prev)}
                        className="w-full flex items-center justify-between text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider px-1 cursor-pointer"
                      >
                        <span>
                          STASIS // OFFLINE ({offlineTeamPersonas.length})
                        </span>
                        {offlineCollapsed ? (
                          <ChevronRight size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )}
                      </button>
                      {!offlineCollapsed &&
                        offlineTeamPersonas.map((p) => (
                          <div
                            key={p.id}
                            className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between gap-2 opacity-75"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-slate-300 text-xs truncate">
                                {p.name}
                              </div>
                              <div className="text-[9.5px] text-slate-500 truncate">
                                {p.species} • @{p.ownerHandle}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Online Network Operators */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold uppercase tracking-wider px-1">
                      <span>ONLINE OPERATORS ({filteredOnlineOps.length})</span>
                    </div>

                    {filteredOnlineOps.map((op) => {
                      const isSelf = currentUser && op.uid === currentUser.uid;
                      const activeChar =
                        op.currentPersona || op.characters?.[0] || null;
                      return (
                        <div
                          key={op.uid}
                          className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative shrink-0">
                                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-[10px]">
                                  {(op.userHandle || 'OP')
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-slate-100 text-xs truncate">
                                    @{op.userHandle}
                                  </span>
                                  {isSelf && (
                                    <span className="px-1 py-0.1 rounded bg-cyan-500/20 text-cyan-300 text-[8px] font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                {activeChar ? (
                                  <div className="text-[9.5px] text-emerald-400 truncate">
                                    🎭 {activeChar.name} ({activeChar.role || activeChar.species})
                                  </div>
                                ) : (
                                  <div className="text-[9.5px] text-slate-400 truncate">
                                    {op.statusMessage ||
                                      op.activity?.label ||
                                      'Connected to Terran Net'}
                                  </div>
                                )}
                              </div>
                            </div>

                            {!isSelf && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => startDirectMessage?.(op, null)}
                                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 cursor-pointer"
                                  title={`Direct Message @${op.userHandle}`}
                                >
                                  <MessageSquare size={11} />
                                </button>
                                {onInviteUser && (
                                  <button
                                    type="button"
                                    onClick={() => onInviteUser(op)}
                                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-500/50 text-emerald-300 cursor-pointer"
                                    title={`Invite @${op.userHandle} to Squad`}
                                  >
                                    <UserPlus size={11} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Offline Operators */}
                  {filteredOfflineOps.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setOfflineCollapsed((prev) => !prev)}
                        className="w-full flex items-center justify-between text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider px-1 cursor-pointer"
                      >
                        <span>OFFLINE ({filteredOfflineOps.length})</span>
                        {offlineCollapsed ? (
                          <ChevronRight size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )}
                      </button>

                      {!offlineCollapsed &&
                        filteredOfflineOps.map((op) => (
                          <div
                            key={op.uid}
                            className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-2 opacity-70"
                          >
                            <span className="font-bold text-slate-400 text-xs truncate">
                              @{op.userHandle}
                            </span>
                            <button
                              type="button"
                              onClick={() => startDirectMessage?.(op, null)}
                              className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800 text-[9px] font-bold cursor-pointer"
                            >
                              MESSAGE
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: ARCHITECT TACTICAL DOCKET ── */}
        {activeTab === 'docket' && (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <ArchitectDocketBlock
              channel={activeChannel}
              group={matchedGroup}
              blocks={docketBlocks}
              onClose={onClose}
            />
          </div>
        )}

        {/* ── TAB 3: VTT STAGE TELEMETRY ── */}
        {activeTab === 'vtt' && (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <CommsVttPanel />
          </div>
        )}

        {/* ── TAB 4: CHANNEL DOSSIER & PERSONA AUDIT LOG ── */}
        {activeTab === 'audit' && (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {activeChannel && (
              <div className="p-3 bg-slate-950/80 border-b border-slate-800 space-y-1.5 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info size={12} />
                    <span>FREQUENCY DOSSIER</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {activeChannel.isPublic === false ? 'ENCRYPTED' : 'PUBLIC'}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {activeChannel.displayName || `#${activeChannel.name}`}
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  {activeChannel.topic || 'Standard quantum relay channel.'}
                </div>
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-hidden">
              <PersonaAuditLogSidebar isCompact={true} />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default NetworkInspectorDrawer;
