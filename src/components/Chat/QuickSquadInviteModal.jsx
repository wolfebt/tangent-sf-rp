import React, { useState, useMemo } from 'react';
import { 
  X, 
  Shield, 
  UserPlus, 
  Copy, 
  Check, 
  Search, 
  Users, 
  ExternalLink, 
  Send,
  Radio,
  Sparkles,
  QrCode,
  CheckSquare,
  Square
} from 'lucide-react';
import { useSquad } from '../../context/SquadContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AudioService } from '../../services/audioService';
import { getEffectiveUserHandle } from '../../utils/personaValidationUtils';

/**
 * @component QuickSquadInviteModal
 * @description Fast, frictionless modal to invite operators to a tactical squad.
 * Allows 1-click link/code copying, mobile QR code display, individual dispatch,
 * and multiselect batch dispatch to registered operators.
 */
export const QuickSquadInviteModal = ({ 
  isOpen, 
  onClose, 
  defaultSquadId = null,
  defaultGroupId = null, 
  preselectedUser = null 
}) => {
  const { 
    squads = [], 
    groups = [], 
    activeSquad, 
    activeGroup, 
    sendInvite 
  } = useSquad() || {};
  const effectiveSquads = squads.length > 0 ? squads : groups;
  const effectiveActiveSquad = activeSquad || activeGroup;

  const { userDirectory = [], onlineOperators = [] } = useChat() || {};
  const { currentUser } = useAuth() || {};
  const { toast } = useToast() || { toast: () => {} };

  const targetInitialId = defaultSquadId || defaultGroupId || effectiveActiveSquad?.id || (effectiveSquads[0]?.id || '');
  const [selectedSquadId, setSelectedSquadId] = useState(targetInitialId);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserUids, setSelectedUserUids] = useState(new Set());
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState({}); // { [uid]: 'sending' | 'sent' | 'error' }

  // Sync selected squad if default ID changes when opened
  React.useEffect(() => {
    if (isOpen) {
      const targetId = defaultSquadId || defaultGroupId || effectiveActiveSquad?.id || (effectiveSquads[0]?.id || '');
      setSelectedSquadId(targetId);
      setDispatchStatus({});
      setSelectedUserUids(new Set());
      setSearchQuery('');
      setShowQr(false);
    }
  }, [isOpen, defaultSquadId, defaultGroupId, effectiveActiveSquad?.id, effectiveSquads]);

  if (!isOpen) return null;

  const currentSelectedSquad = effectiveSquads.find(s => s.id === selectedSquadId) || effectiveActiveSquad || effectiveSquads[0];

  const handleCopyCode = () => {
    if (!currentSelectedSquad?.inviteCode) return;
    navigator.clipboard.writeText(currentSelectedSquad.inviteCode);
    AudioService.playTerminalBeep(1250, 0.03);
    setCopiedCode(true);
    toast({
      type: 'success',
      title: 'INVITE CODE COPIED',
      text: `Join code "${currentSelectedSquad.inviteCode}" copied to clipboard.`
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!currentSelectedSquad?.inviteCode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/network?view=squads&join=${currentSelectedSquad.inviteCode}`;
    navigator.clipboard.writeText(shareUrl);
    AudioService.playTerminalBeep(1250, 0.03);
    setCopiedLink(true);
    toast({
      type: 'success',
      title: 'INVITE LINK COPIED',
      text: `Direct join link for "${currentSelectedSquad.name}" copied to clipboard.`
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDispatchInvite = async (targetUser) => {
    if (!currentSelectedSquad || !currentUser) return;
    const targetUid = targetUser.uid;
    const targetHandle = getEffectiveUserHandle(targetUser);

    try {
      setDispatchStatus(prev => ({ ...prev, [targetUid]: 'sending' }));
      AudioService.playTerminalBeep(1300, 0.03);

      await sendInvite({
        squadId: currentSelectedSquad.id,
        groupId: currentSelectedSquad.id,
        targetUserId: targetUid,
        targetUserHandle: targetHandle
      });

      setDispatchStatus(prev => ({ ...prev, [targetUid]: 'sent' }));
      toast({
        type: 'success',
        title: 'COMMISSION DISPATCHED',
        text: `Squad invite dispatched to @${targetHandle} for ${currentSelectedSquad.name}.`
      });
    } catch (err) {
      console.error('Dispatch invite error:', err);
      setDispatchStatus(prev => ({ ...prev, [targetUid]: 'error' }));
      toast({
        type: 'error',
        title: 'DISPATCH FAILED',
        text: err.message || 'Could not send squad invite.'
      });
    }
  };

  // Filter available users to invite (excluding current user and already joined members)
  const candidateUsers = (userDirectory || []).filter(u => {
    if (!u || u.uid === currentUser?.uid) return false;
    const isAlreadyMember = (currentSelectedSquad?.members || []).some(m => (typeof m === 'string' ? m === u.uid : (m?.userId || m?.uid || m?.id) === u.uid));
    if (isAlreadyMember) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const handle = getEffectiveUserHandle(u).toLowerCase();
    const displayName = (u.displayName || '').toLowerCase();
    const hasPersonaMatch = Array.isArray(u.characters) && u.characters.some(c => 
      (c.name && c.name.toLowerCase().includes(q)) || (c.role && c.role.toLowerCase().includes(q))
    );
    return handle.includes(q) || displayName.includes(q) || hasPersonaMatch;
  });

  const handleBatchDispatch = async () => {
    if (!currentSelectedSquad || selectedUserUids.size === 0) return;
    setIsBatchSending(true);
    AudioService.playTerminalBeep(1350, 0.04);
    const uids = Array.from(selectedUserUids);

    for (const uid of uids) {
      const targetUser = candidateUsers.find(u => u.uid === uid);
      if (targetUser && dispatchStatus[uid] !== 'sent') {
        await handleDispatchInvite(targetUser);
      }
    }
    setIsBatchSending(false);
    setSelectedUserUids(new Set());
    toast({
      type: 'success',
      title: 'BATCH TRANSMISSION COMPLETE',
      text: `Dispatched invitations to ${uids.length} operators.`
    });
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 select-none font-sans animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b121d] border border-cyan-500/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.3)] flex flex-col max-h-[90vh] text-slate-100"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <UserPlus size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
                  DISPATCH SQUAD INVITATION
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                  FAST SQUAD LINK
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 mt-0.5">
                Share invite credentials or dispatch directly to online operators.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Squad Selector (if user belongs to multiple squads) */}
          {effectiveSquads.length > 1 && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TARGET SQUAD / FIRETEAM:
              </label>
              <select
                value={selectedSquadId}
                onChange={(e) => setSelectedSquadId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                {effectiveSquads.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                    🛡️ {s.name} ({s.members?.length || 1} members)
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentSelectedSquad ? (
            <>
              {/* 1. Shareable Instant Credentials Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <Shield size={13} />
                    <span>{currentSelectedSquad.name}</span>
                  </div>
                  <span className="text-[9.5px] text-slate-500">
                    {currentSelectedSquad.members?.length || 1} / {currentSelectedSquad.maxMembers || 6} Operators
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                    title="Copy direct join link to clipboard"
                  >
                    <div className="text-left min-w-0">
                      <span className="text-[9px] text-emerald-400/80 block uppercase font-bold">1-Click Join</span>
                      <span className="text-[11px] font-bold truncate block">
                        {copiedLink ? 'COPIED!' : 'COPY LINK'}
                      </span>
                    </div>
                    {copiedLink ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />}
                  </button>

                  {/* Copy Join Code */}
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                    title="Copy join code to clipboard"
                  >
                    <div className="text-left min-w-0">
                      <span className="text-[9px] text-cyan-400/80 block uppercase font-bold">Join Code</span>
                      <span className="text-[11px] font-bold font-mono tracking-wider truncate block text-cyan-300">
                        {copiedCode ? 'COPIED!' : currentSelectedSquad.inviteCode}
                      </span>
                    </div>
                    {copiedCode ? <Check size={14} className="text-cyan-300" /> : <Copy size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />}
                  </button>

                  {/* Toggle Mobile QR Code */}
                  <button
                    type="button"
                    onClick={() => setShowQr(prev => !prev)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                      showQr 
                        ? 'bg-purple-900/70 border-purple-400 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.3)]' 
                        : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/40 text-purple-200'
                    }`}
                    title="Display Mobile Scan QR Code"
                  >
                    <div className="text-left min-w-0">
                      <span className="text-[9px] text-purple-400/80 block uppercase font-bold">Mobile QR</span>
                      <span className="text-[11px] font-bold truncate block">
                        {showQr ? 'HIDE QR' : 'VIEW QR'}
                      </span>
                    </div>
                    <QrCode size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* QR Code Expansion Card */}
                {showQr && currentSelectedSquad?.inviteCode && (
                  <div className="p-3 bg-slate-900/90 border border-purple-500/40 rounded-xl flex items-center gap-3 animate-in fade-in">
                    <div className="p-1.5 bg-white rounded-lg shrink-0">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(
                          `${typeof window !== 'undefined' ? window.location.origin : ''}/network?view=squads&join=${currentSelectedSquad.inviteCode}`
                        )}`}
                        alt="Join QR"
                        className="w-20 h-20"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-purple-300 block">SCAN TO JOIN SQUAD</span>
                      <p className="text-[10px] text-slate-400">
                        Scan from mobile camera to instantly open and bind to <strong className="text-white">{currentSelectedSquad.name}</strong>.
                      </p>
                      <span className="text-[9px] font-mono text-purple-400 font-bold block">
                        CODE: {currentSelectedSquad.inviteCode}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Direct Dispatch & Multiselect to Online Operators */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio size={12} className="text-cyan-400" />
                    <span>DIRECT DISPATCH TO OPERATORS</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
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
                        className="text-[9.5px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 font-mono cursor-pointer transition-colors"
                      >
                        {selectedUserUids.size === candidateUsers.length ? 'CLEAR ALL' : `SELECT ALL (${candidateUsers.length})`}
                      </button>
                    )}
                    <span className="text-[9.5px] text-slate-500">
                      {candidateUsers.length} Available
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search player handle or character persona..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                  {candidateUsers.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 text-center text-slate-500 text-[11px] font-mono">
                      {searchQuery ? 'No matching operators found.' : 'All online operators are already members of this squad.'}
                    </div>
                  ) : (
                    candidateUsers.map(user => {
                      const handle = getEffectiveUserHandle(user);
                      const status = dispatchStatus[user.uid];
                      const isOnline = user.isOnline || onlineOperators.some(o => o.uid === user.uid);
                      const characters = Array.isArray(user.characters) ? user.characters : [];
                      const isSelected = selectedUserUids.has(user.uid);

                      return (
                        <div
                          key={user.uid}
                          className={`p-2 rounded-xl bg-slate-950/70 border flex items-center justify-between gap-2 transition-colors ${
                            isSelected ? 'border-cyan-500/70 bg-cyan-950/20' : 'border-slate-800/90 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0 flex items-center gap-2">
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

                            <div className="relative shrink-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 font-mono">
                                {handle.substring(0, 2).toUpperCase()}
                              </div>
                              <span 
                                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                                  isOnline ? 'bg-emerald-400' : 'bg-slate-600'
                                }`} 
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-200 truncate block text-[11px]">
                                  @{handle}
                                </span>
                                {isOnline && (
                                  <span className="text-[8.5px] px-1 py-0.1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold">
                                    ONLINE
                                  </span>
                                )}
                              </div>
                              {characters.length > 0 && (
                                <p className="text-[9.5px] text-purple-300 truncate">
                                  🎭 {characters.map(c => c.name).slice(0, 2).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={status === 'sending' || status === 'sent'}
                            onClick={() => handleDispatchInvite(user)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                              status === 'sent'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : status === 'sending'
                                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-wait'
                                : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 hover:border-cyan-400'
                            }`}
                          >
                            {status === 'sent' ? (
                              <>
                                <Check size={11} />
                                <span>INVITED</span>
                              </>
                            ) : status === 'sending' ? (
                              <span>SENDING...</span>
                            ) : (
                              <>
                                <Send size={11} />
                                <span>DISPATCH</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Batch Dispatch Action Bar */}
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
            </>
          ) : (
            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900 text-center space-y-2">
              <Shield size={24} className="mx-auto text-slate-600" />
              <p className="text-slate-400 text-xs font-bold">No Tactical Squads Found</p>
              <p className="text-slate-500 text-[10px]">
                Create a squad in the Squads module to generate invite credentials.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Instant telemetry sync via Tangent Relay</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};

export { QuickSquadInviteModal as QuickTeamInviteModal };
export default QuickSquadInviteModal;
