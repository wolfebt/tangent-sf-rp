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
  Sparkles
} from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AudioService } from '../../services/audioService';
import { getEffectiveUserHandle } from '../../utils/personaValidationUtils';

/**
 * @component QuickTeamInviteModal
 * @description Fast, frictionless modal to invite operators to a tactical team.
 * Allows 1-click link/code copying and direct dispatch to online operators from anywhere in Chat.
 */
export const QuickTeamInviteModal = ({ 
  isOpen, 
  onClose, 
  defaultGroupId = null, 
  preselectedUser = null 
}) => {
  const { groups = [], activeGroup, sendInvite } = useGroup() || {};
  const { userDirectory = [], onlineOperators = [] } = useChat() || {};
  const { currentUser } = useAuth() || {};
  const { toast } = useToast() || { toast: () => {} };

  // Determine selected group (defaults to defaultGroupId, or activeGroup, or first group)
  const [selectedGroupId, setSelectedGroupId] = useState(
    defaultGroupId || activeGroup?.id || (groups[0]?.id || '')
  );

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState({}); // { [uid]: 'sending' | 'sent' | 'error' }

  // Sync selected group if defaultGroupId changes when opened
  React.useEffect(() => {
    if (isOpen) {
      const targetId = defaultGroupId || activeGroup?.id || (groups[0]?.id || '');
      setSelectedGroupId(targetId);
      setDispatchStatus({});
      setSearchQuery('');
    }
  }, [isOpen, defaultGroupId, activeGroup?.id, groups]);

  if (!isOpen) return null;

  const currentSelectedGroup = groups.find(g => g.id === selectedGroupId) || activeGroup || groups[0];

  const handleCopyCode = () => {
    if (!currentSelectedGroup?.inviteCode) return;
    navigator.clipboard.writeText(currentSelectedGroup.inviteCode);
    AudioService.playTerminalBeep(1250, 0.03);
    setCopiedCode(true);
    toast({
      type: 'success',
      title: 'INVITE CODE COPIED',
      text: `Join code "${currentSelectedGroup.inviteCode}" copied to clipboard.`
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!currentSelectedGroup?.inviteCode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/teams?join=${currentSelectedGroup.inviteCode}`;
    navigator.clipboard.writeText(shareUrl);
    AudioService.playTerminalBeep(1250, 0.03);
    setCopiedLink(true);
    toast({
      type: 'success',
      title: 'INVITE LINK COPIED',
      text: `Direct join link for "${currentSelectedGroup.name}" copied to clipboard.`
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDispatchInvite = async (targetUser) => {
    if (!currentSelectedGroup || !currentUser) return;
    const targetUid = targetUser.uid;
    const targetHandle = getEffectiveUserHandle(targetUser);

    try {
      setDispatchStatus(prev => ({ ...prev, [targetUid]: 'sending' }));
      AudioService.playTerminalBeep(1300, 0.03);

      await sendInvite({
        groupId: currentSelectedGroup.id,
        targetUserId: targetUid,
        targetUserHandle: targetHandle
      });

      setDispatchStatus(prev => ({ ...prev, [targetUid]: 'sent' }));
      toast({
        type: 'success',
        title: 'COMMISSION DISPATCHED',
        text: `Team invite dispatched to @${targetHandle} for ${currentSelectedGroup.name}.`
      });
    } catch (err) {
      console.error('Dispatch invite error:', err);
      setDispatchStatus(prev => ({ ...prev, [targetUid]: 'error' }));
      toast({
        type: 'error',
        title: 'DISPATCH FAILED',
        text: err.message || 'Could not send team invite.'
      });
    }
  };

  // Filter available users to invite (excluding current user and already joined members)
  const candidateUsers = (userDirectory || []).filter(u => {
    if (!u || u.uid === currentUser?.uid) return false;
    if (currentSelectedGroup?.members?.includes(u.uid)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const handle = getEffectiveUserHandle(u).toLowerCase();
    const displayName = (u.displayName || '').toLowerCase();
    const hasPersonaMatch = Array.isArray(u.characters) && u.characters.some(c => 
      (c.name && c.name.toLowerCase().includes(q)) || (c.role && c.role.toLowerCase().includes(q))
    );
    return handle.includes(q) || displayName.includes(q) || hasPersonaMatch;
  });

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
                  DISPATCH TEAM INVITATION
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
          {/* Group Selector (if user belongs to multiple teams) */}
          {groups.length > 1 && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TARGET SQUAD / FIRETEAM:
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id} className="bg-slate-900 text-slate-100">
                    🛡️ {g.name} ({g.members?.length || 1} members)
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentSelectedGroup ? (
            <>
              {/* 1. Shareable Instant Credentials Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <Shield size={13} />
                    <span>{currentSelectedGroup.name}</span>
                  </div>
                  <span className="text-[9.5px] text-slate-500">
                    {currentSelectedGroup.members?.length || 1} / {currentSelectedGroup.maxMembers || 6} Operators
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                    title="Copy direct join link to clipboard"
                  >
                    <div className="text-left min-w-0">
                      <span className="text-[9px] text-emerald-400/80 block uppercase font-bold">1-Click Join Link</span>
                      <span className="text-[11px] font-bold truncate block">
                        {copiedLink ? 'LINK COPIED!' : 'COPY JOIN LINK'}
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
                      <span className="text-[9px] text-cyan-400/80 block uppercase font-bold">Alphanumeric Code</span>
                      <span className="text-[11px] font-bold font-mono tracking-wider truncate block text-cyan-300">
                        {copiedCode ? 'CODE COPIED!' : currentSelectedGroup.inviteCode}
                      </span>
                    </div>
                    {copiedCode ? <Check size={14} className="text-cyan-300" /> : <Copy size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />}
                  </button>
                </div>
              </div>

              {/* 2. Direct Dispatch to Online Operators */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio size={12} className="text-cyan-400" />
                    <span>DIRECT DISPATCH TO OPERATORS</span>
                  </span>
                  <span className="text-[9.5px] text-slate-500">
                    {candidateUsers.length} Available
                  </span>
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
                      {searchQuery ? 'No matching operators found.' : 'All online operators are already members of this team.'}
                    </div>
                  ) : (
                    candidateUsers.map(user => {
                      const handle = getEffectiveUserHandle(user);
                      const status = dispatchStatus[user.uid];
                      const isOnline = user.isOnline || onlineOperators.some(o => o.uid === user.uid);
                      const characters = Array.isArray(user.characters) ? user.characters : [];

                      return (
                        <div
                          key={user.uid}
                          className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-2 transition-colors hover:border-slate-700"
                        >
                          <div className="min-w-0 flex items-center gap-2">
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
              </div>
            </>
          ) : (
            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900 text-center space-y-2">
              <Shield size={24} className="mx-auto text-slate-600" />
              <p className="text-slate-400 text-xs font-bold">No Tactical Fireteams Found</p>
              <p className="text-slate-500 text-[10px]">
                Create a squad in the Teams module to generate invite credentials.
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

export default QuickTeamInviteModal;
