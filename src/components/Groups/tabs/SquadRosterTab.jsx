import React from 'react';
import { 
  Users, 
  Crown, 
  Shield, 
  Trash2, 
  Copy, 
  Check, 
  QrCode, 
  Layers 
} from 'lucide-react';

export const SquadRosterTab = ({
  activeGroup,
  currentUser,
  isUserGM,
  copiedLink,
  handleCopyLink,
  showEnlargedQr,
  setShowEnlargedQr,
  confirm,
  toast,
  kickMember,
  updateMemberRole,
  setIsCreateModalOpen,
  setActiveTab
}) => {
  if (!activeGroup) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Shield size={32} />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
              NO ACTIVE TACTICAL SQUAD
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              You are not currently synchronized with an active team. Form a new squad or browse existing public campaigns.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              + CREATE SQUAD
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 font-mono text-xs font-bold transition-all cursor-pointer"
            >
              BROWSE DIRECTORY
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Active Squad Overview Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950/80 border border-emerald-500/30 backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold font-mono text-white tracking-wide">
              {activeGroup.name}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
              {activeGroup.members?.length || 0} OPERATORS
            </span>
            {activeGroup.campaignTitle && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                <Layers size={10} />
                <span>{activeGroup.campaignTitle}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 max-w-2xl font-sans">
            {activeGroup.description || 'Dedicated tactical squad coordinating on Terran-net communications.'}
          </p>
        </div>

        {/* Quick Code & Share Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Copy direct invite link to clipboard"
          >
            {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedLink ? 'LINK COPIED' : 'SHARE LINK'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEnlargedQr(prev => !prev)}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 transition-all cursor-pointer"
            title="Display Squad QR Code"
          >
            <QrCode size={16} />
          </button>
        </div>
      </div>

      {/* QR Code Expansion Card */}
      {showEnlargedQr && activeGroup?.inviteCode && (
        <div className="p-4 rounded-2xl bg-[#0b0f17] border border-emerald-500/40 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
          <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                `${typeof window !== 'undefined' ? window.location.origin : ''}/teams?join=${activeGroup.inviteCode}`
              )}`}
              alt="Squad Join QR"
              className="w-28 h-28"
            />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <span className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              FAST MOBILE SQUAD RECRUITMENT
            </span>
            <p className="text-xs text-slate-400 max-w-md">
              Have fellow players scan this QR code with their mobile device to instantly bind to <strong className="text-white">{activeGroup.name}</strong> and sync their persona roster.
            </p>
            <span className="inline-block px-2.5 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-emerald-400 font-bold">
              INVITE CODE: {activeGroup.inviteCode}
            </span>
          </div>
        </div>
      )}

      {/* Operators Roster Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Users size={14} className="text-emerald-400" />
            <span>SQUAD OPERATORS & PERSONAS</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            {activeGroup.members?.length || 0} / {activeGroup.maxMembers || 6} SLOTS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {(activeGroup.members || []).map((member) => {
            const isSelf = member.userId === currentUser?.uid;
            const persona = member.persona;
            const isLeader = member.role === 'GM' || member.role === 'Leader';
            const displayRole = (member.role === 'Operative' ? 'Operator' : member.role) || 'Operator';

            return (
              <div
                key={member.userId}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  isSelf
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Member Top Bar: Handle & Role */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                      {isLeader ? (
                        <Crown size={15} className="text-amber-400" />
                      ) : (
                        <Shield size={15} className="text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-white truncate">
                          {member.handle || 'Operator'}
                        </span>
                        {isSelf && (
                          <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-300 rounded font-mono">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        {displayRole}
                      </span>
                    </div>
                  </div>

                  {/* Leader Actions */}
                  {isUserGM && !isSelf && (
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await confirm({
                          title: 'Remove Operator',
                          message: `Are you sure you want to remove ${member.handle} from ${activeGroup.name}?`,
                          danger: true,
                          confirmLabel: 'Remove'
                        });
                        if (ok) {
                          kickMember(activeGroup.id, member.userId);
                          toast({ type: 'info', text: `${member.handle} removed from squad.` });
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="Remove operator from squad"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Persona Dossier Attachment */}
                {persona ? (
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-cyan-300 truncate">
                        {persona.name}
                      </span>
                      <span className="text-slate-400 text-[10px] shrink-0">
                        {persona.species} • {persona.role}
                      </span>
                    </div>

                    {/* Health & Vitality Status Gauges */}
                    <div className="grid grid-cols-2 gap-2 text-[9.5px] font-mono pt-1">
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-rose-300">
                          <span>HP</span>
                          <span>{persona.currentHealth ?? persona.health ?? 30}/{persona.health ?? 30}</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full" 
                            style={{ width: `${Math.min(100, Math.max(0, ((persona.currentHealth ?? 30) / (persona.health ?? 30)) * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex justify-between text-cyan-300">
                          <span>VIT</span>
                          <span>{persona.currentVitality ?? persona.vitality ?? 30}/{persona.vitality ?? 30}</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 rounded-full" 
                            style={{ width: `${Math.min(100, Math.max(0, ((persona.currentVitality ?? 30) / (persona.vitality ?? 30)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-950/40 border border-dashed border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-500">
                      NO PERSONA BOUND YET
                    </span>
                  </div>
                )}

                {/* Role Assignment Switcher (GM Only) */}
                {isUserGM && (
                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono border-t border-slate-800/80">
                    <span className="text-slate-500">TACTICAL ROLE:</span>
                    <select
                      value={member.role === 'Operative' ? 'Operator' : (member.role || 'Operator')}
                      onChange={(e) => updateMemberRole(activeGroup.id, member.userId, e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-emerald-400"
                    >
                      <option value="GM">Lead Architect (GM)</option>
                      <option value="Co-GM">Co-Architect</option>
                      <option value="Leader">Squad Leader</option>
                      <option value="Operator">Operator</option>
                      <option value="Spectator">Observer</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
