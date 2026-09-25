import React from 'react';
import { UserPlus, Search, Copy, Check } from 'lucide-react';

export const SquadInvitesTab = ({
  activeGroup,
  copiedCode,
  handleCopyCode,
  copiedLink,
  handleCopyLink,
  userSearchQuery,
  setUserSearchQuery,
  filteredUserDirectory,
  currentUser,
  inviteStatusMap,
  handleSendInvite,
  pendingInvites = [],
  outgoingInvites = [],
  acceptInvite,
  declineInvite,
  revokeInvite
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Shareable Invite Codes & Links */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus size={16} className="text-emerald-400" />
              <span>SHAREABLE INVITE CREDENTIALS</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Distribute instant join access to fellow operatives via alphanumeric codes or direct links.
            </p>
          </div>

          {activeGroup ? (
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500">ALPHANUMERIC JOIN CODE</span>
                  <div className="text-sm font-mono font-bold text-emerald-300">
                    {activeGroup.inviteCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-emerald-900 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCode ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <span className="text-[10px] font-mono text-slate-500">DIRECT WEB DEEP-LINK</span>
                  <div className="text-xs font-mono text-slate-300 truncate">
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/teams?join=${activeGroup.inviteCode}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5 hover:border-emerald-500/40 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedLink ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-xs text-slate-500 font-mono">
              Select or create a squad first to provision invite credentials.
            </div>
          )}
        </div>

        {/* 2. Direct Operative Directory Dispatch */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search size={16} className="text-cyan-400" />
              <span>DISPATCH OPERATIVE INVITATIONS</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Search online player directory and dispatch direct squad membership transmissions.
            </p>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search operator handle or email..."
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {filteredUserDirectory.map(user => {
              if (user.uid === currentUser?.uid) return null;
              const status = inviteStatusMap[user.uid];

              return (
                <div 
                  key={user.uid}
                  className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-200 truncate block">
                      {user.displayName || user.email || 'Operative'}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      @{user.handle || 'operator'}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={status === 'sending' || status === 'sent'}
                    onClick={() => handleSendInvite(user)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                      status === 'sent'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300'
                    }`}
                  >
                    {status === 'sent' ? 'INVITED' : status === 'sending' ? 'TRANSMITTING...' : 'DISPATCH'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Pending Inbound & Outbound Invites Cards */}
      <div className="space-y-3">
        <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
          PENDING INVITATION TELEMETRY ({pendingInvites.length} Inbound • {outgoingInvites.length} Outbound)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Incoming Invites */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
              INCOMING SQUAD CALLS
            </span>
            {pendingInvites.length > 0 ? (
              pendingInvites.map(inv => (
                <div key={inv.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-white block">{inv.groupName}</span>
                    <span className="text-[10px] text-slate-400">Invited by @{inv.senderHandle}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => acceptInvite(inv.id)}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      ACCEPT
                    </button>
                    <button
                      type="button"
                      onClick={() => declineInvite(inv.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      DECLINE
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-mono">No incoming pending invitations.</p>
            )}
          </div>

          {/* Outgoing Invites */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider block">
              DISPATCHED OUTGOING INVITATIONS
            </span>
            {outgoingInvites.length > 0 ? (
              outgoingInvites.map(inv => (
                <div key={inv.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-white block">@{inv.recipientHandle}</span>
                    <span className="text-[10px] text-slate-500">Status: {inv.status}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => revokeInvite(inv.id)}
                    className="text-rose-400 hover:text-rose-300 text-[11px] cursor-pointer"
                  >
                    REVOKE
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-mono">No outgoing invites currently awaiting response.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
