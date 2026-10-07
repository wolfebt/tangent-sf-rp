import React, { useState } from 'react';
import { UserPlus, Search, Copy, Check, QrCode, Send, Radio } from 'lucide-react';

export const SquadInvitesTab = ({
  activeGroup,
  copiedCode,
  handleCopyCode,
  copiedLink,
  handleCopyLink,
  userSearchQuery,
  setUserSearchQuery,
  filteredUserDirectory = [],
  currentUser,
  inviteStatusMap = {},
  handleSendInvite,
  pendingInvites = [],
  outgoingInvites = [],
  openInviteConfirmation,
  acceptInvite,
  declineInvite,
  revokeInvite
}) => {
  const [showQr, setShowQr] = useState(false);
  const [selectedUserUids, setSelectedUserUids] = useState(new Set());
  const [isBatchSending, setIsBatchSending] = useState(false);

  const candidateUsers = (filteredUserDirectory || []).filter(u => {
    if (!u || u.uid === currentUser?.uid) return false;
    const isAlreadyMember = (activeGroup?.members || []).some(m => 
      (typeof m === 'string' ? m === u.uid : (m?.userId || m?.uid || m?.id) === u.uid)
    );
    return !isAlreadyMember;
  });

  const handleBatchDispatch = async () => {
    if (!handleSendInvite || selectedUserUids.size === 0) return;
    setIsBatchSending(true);
    const uids = Array.from(selectedUserUids);

    for (const uid of uids) {
      const targetUser = candidateUsers.find(u => u.uid === uid);
      if (targetUser && inviteStatusMap[uid] !== 'sent') {
        try {
          await handleSendInvite(targetUser);
        } catch (err) {
          console.error('Batch invite dispatch error for user:', uid, err);
        }
      }
    }
    setIsBatchSending(false);
    setSelectedUserUids(new Set());
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Shareable Invite Codes & Links */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus size={16} className="text-emerald-400" />
              <span>SHAREABLE SQUAD CREDENTIALS</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Distribute instant join access to fellow operators via alphanumeric codes, direct links, or mobile QR code.
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
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/network?view=teams&join=${activeGroup.inviteCode}`}
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

              {/* Mobile QR Code Toggle & Preview */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowQr(prev => !prev)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    showQr 
                      ? 'bg-purple-900/60 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]' 
                      : 'bg-slate-950 hover:bg-purple-950/40 border-slate-800 hover:border-purple-500/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono font-bold">
                    <QrCode size={15} className="text-purple-400" />
                    <span>MOBILE SCAN QR CODE</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-300">
                    {showQr ? 'HIDE QR' : 'EXPAND QR'}
                  </span>
                </button>

                {showQr && (
                  <div className="mt-2.5 p-3.5 bg-slate-950 border border-purple-500/40 rounded-xl flex items-center gap-3 animate-in fade-in">
                    <div className="p-1.5 bg-white rounded-lg shrink-0 shadow-md">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                          `${typeof window !== 'undefined' ? window.location.origin : ''}/network?view=teams&join=${activeGroup.inviteCode}`
                        )}`}
                        alt="Join Squad QR"
                        className="w-20 h-20"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono font-bold text-purple-300 block">
                        INSTANT HUD SCAN
                      </span>
                      <p className="text-[10.5px] text-slate-400">
                        Scan from a mobile device or optical scanner to direct-link into <strong className="text-white">{activeGroup.name}</strong>.
                      </p>
                      <span className="text-[9.5px] font-mono text-purple-400 font-bold block">
                        INVITE FREQ: {activeGroup.inviteCode}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-xs text-slate-500 font-mono">
              Select or create a squad first to provision invite credentials.
            </div>
          )}
        </div>

        {/* 2. Direct Operator Directory Dispatch */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Radio size={16} className="text-cyan-400" />
                <span>DISPATCH OPERATOR INVITATIONS</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Search network operator registry and dispatch direct squad membership transmissions.
              </p>
            </div>

            {candidateUsers.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (selectedUserUids.size === candidateUsers.length) {
                    setSelectedUserUids(new Set());
                  } else {
                    setSelectedUserUids(new Set(candidateUsers.map(u => u.uid)));
                  }
                }}
                className="text-[10px] px-2.5 py-1 rounded bg-slate-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 font-mono cursor-pointer transition-colors shrink-0"
              >
                {selectedUserUids.size === candidateUsers.length ? 'CLEAR' : `SELECT ALL (${candidateUsers.length})`}
              </button>
            )}
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

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1 no-scrollbar">
            {candidateUsers.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 text-center text-slate-500 text-[11px] font-mono">
                {userSearchQuery ? 'No matching operators found.' : 'No candidates available to invite.'}
              </div>
            ) : (
              candidateUsers.map(user => {
                const status = inviteStatusMap[user.uid];
                const isSelected = selectedUserUids.has(user.uid);

                return (
                  <div 
                    key={user.uid}
                    className={`p-2 rounded-xl bg-slate-950/80 border flex items-center justify-between text-xs font-mono transition-colors ${
                      isSelected ? 'border-cyan-500/70 bg-cyan-950/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedUserUids(prev => {
                            const next = new Set(prev);
                            if (next.has(user.uid)) next.delete(user.uid);
                            else next.add(user.uid);
                            return next;
                          });
                        }}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500 shrink-0"
                        title="Select for batch dispatch"
                      />

                      <div className="min-w-0">
                        <span className="font-bold text-slate-200 truncate block">
                          {user.displayName || user.email || 'Operator'}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          @{user.handle || 'operator'}
                        </span>
                      </div>
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
                      title={status === 'sent' ? 'Invitation transmitted' : 'Send squad invitation to this operator'}
                    >
                      {status === 'sent' ? 'INVITED' : status === 'sending' ? 'TRANSMITTING...' : 'DISPATCH'}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Batch Dispatch Bar */}
          {selectedUserUids.size > 0 && (
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-between gap-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                  {selectedUserUids.size}
                </span>
                <span className="text-[11px] font-bold text-cyan-200">
                  OPERATORS SELECTED
                </span>
              </div>
              <button
                type="button"
                disabled={isBatchSending}
                onClick={handleBatchDispatch}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 cursor-pointer"
              >
                <Send size={12} />
                <span>{isBatchSending ? 'TRANSMITTING...' : `DISPATCH INVITES (${selectedUserUids.size})`}</span>
              </button>
            </div>
          )}
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
                      onClick={() => {
                        if (openInviteConfirmation) {
                          openInviteConfirmation(inv);
                        } else {
                          acceptInvite(inv.id, inv.groupId);
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors shadow-sm"
                    >
                      ACCEPT
                    </button>
                    <button
                      type="button"
                      onClick={() => declineInvite(inv.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
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
