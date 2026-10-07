import React from 'react';
import { Search, Users, Layers, Shield, Crown } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const SquadDirectoryTab = ({
  directorySearch,
  setDirectorySearch,
  directoryFilter,
  setDirectoryFilter,
  joinCodeInput,
  setJoinCodeInput,
  handleJoinByCodeSubmit,
  joinLoading,
  joinError,
  filteredDirectory,
  currentUser,
  activeGroup,
  selectGroup,
  setActiveTab,
  joinByCode,
  toast
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Directory Filter Bar & Join Code Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search & Filters */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              placeholder="Search squad title, campaign, or keywords..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 shrink-0 text-xs font-mono">
            <button
              type="button"
              onClick={() => setDirectoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                directoryFilter === 'all'
                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() => setDirectoryFilter('recruiting')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                directoryFilter === 'recruiting'
                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RECRUITING
            </button>
            <button
              type="button"
              onClick={() => setDirectoryFilter('mine')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                directoryFilter === 'mine'
                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MY TEAMS
            </button>
          </div>
        </div>

        {/* Direct Join with Code Bar */}
        <form onSubmit={handleJoinByCodeSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            placeholder="ENTER CODE: GRP-XXXXXX"
            className="flex-1 px-3 py-2 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-300 placeholder-slate-600 uppercase tracking-wider focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            disabled={joinLoading || !joinCodeInput.trim()}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
          >
            {joinLoading ? 'JOINING...' : 'JOIN'}
          </button>
        </form>
      </div>

      {joinError && (
        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono">
          {joinError}
        </div>
      )}

      {/* Squads Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDirectory.map((group) => {
          const isEnrolled = (group.members || []).some(m => (typeof m === 'string' ? m === currentUser?.uid : (m?.userId || m?.uid || m?.id) === currentUser?.uid)) || group.creatorId === currentUser?.uid;
          const isSelected = activeGroup?.id === group.id;

          return (
            <div
              key={group.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-emerald-950/25 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-mono text-sm font-bold text-white truncate">
                      {group.name}
                    </h4>
                    {group.campaignTitle && (
                      <span className="text-[10px] font-mono text-purple-300 flex items-center gap-1 mt-0.5">
                        <Layers size={10} />
                        <span className="truncate">{group.campaignTitle}</span>
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border shrink-0 ${
                    group.status === 'Recruiting'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {group.status || 'Active'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-sans line-clamp-2">
                  {group.description || 'Terran-net tactical fireteam.'}
                </p>
              </div>

              {/* Members Roster in Squad Card */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono px-0.5">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={11} className="text-emerald-400" />
                    <span>MEMBERS ROSTER</span>
                  </span>
                  <span className="text-slate-500 text-[9px] font-mono">
                    {group.members?.length || 0} / {group.maxMembers || 6} OPERATORS
                  </span>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
                  {(
                    Array.isArray(group.members) && group.members.length > 0
                      ? group.members
                      : Object.keys(group.memberDetails || {})
                  ).map((rawMember, idx) => {
                    const memberId = typeof rawMember === 'string'
                      ? rawMember
                      : (rawMember?.userId || rawMember?.uid || rawMember?.id || `squad-op-${idx}`);
                    const details = (typeof rawMember === 'object' && rawMember !== null)
                      ? rawMember
                      : (group.memberDetails?.[memberId] || {});
                    const handle = details.handle || details.displayName || details.userHandle || (memberId === currentUser?.uid ? (currentUser?.displayName || currentUser?.email?.split('@')[0]) : null) || 'Operator';
                    const isSelf = memberId === currentUser?.uid;
                    const persona = details.persona;
                    const role = details.role || (memberId === group.creatorId ? 'GM' : 'Operator');

                    return (
                      <div
                        key={`${memberId}-${idx}`}
                        className={`px-2 py-1.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                          isSelf 
                            ? 'bg-emerald-950/30 border-emerald-500/40' 
                            : 'bg-slate-950/70 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5 h-5 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-emerald-300 font-mono shrink-0">
                            {handle.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] font-mono font-bold text-slate-200 truncate">
                                {persona?.name || handle}
                              </span>
                              {isSelf && (
                                <span className="text-[7.5px] px-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            {persona?.name ? (
                              <span className="text-[9px] font-mono text-slate-400 truncate block">
                                {persona.species ? `${persona.species} • ` : ''}{persona.role || 'Specialist'} (@{handle})
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-slate-500 truncate block">
                                Operator @{handle}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-[8.5px] font-mono ml-1">
                          {role === 'GM' || role === 'Leader' ? (
                            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-0.5">
                              <Crown size={8} />
                              <span>{role}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">{role}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(!group.members || group.members.length === 0) && (!group.memberDetails || Object.keys(group.memberDetails).length === 0) && (
                    <div className="text-[9.5px] font-mono text-slate-500 italic text-center py-1">
                      No operators enrolled yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Members and Select Action */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Users size={12} className="text-slate-400" />
                  <span>{group.members?.length || 0} / {group.maxMembers || 6}</span>
                </span>

                <div className="flex items-center gap-2">
                  {isEnrolled ? (
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(1100, 0.02);
                        selectGroup(group.id);
                        setActiveTab('roster');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10.5px] font-mono font-bold transition-all cursor-pointer"
                    >
                      {isSelected ? 'ACTIVE SQUAD' : 'ACTIVATE'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await joinByCode(group.inviteCode);
                          selectGroup(group.id);
                          setActiveTab('roster');
                        } catch (e) {
                          toast({ type: 'error', text: e.message || 'Failed to join squad.' });
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-mono font-bold transition-all cursor-pointer"
                    >
                      JOIN SQUAD
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
