import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Trash2, 
  LogOut, 
  Check, 
  Crown, 
  ArrowRightLeft, 
  Radio, 
  Users, 
  Sparkles,
  Plus,
  X
} from 'lucide-react';
import { useGroup } from '../../../context/GroupContext';
import { useAuth } from '../../../context/AuthContext';
import { AudioService } from '../../../services/audioService';

/**
 * @component SquadSettingsTab
 * @description Squad governance and settings tab. Manages squad name, description,
 * recruiting status, linked campaign file, Co-Architect designation, role transfer, and LFP recruitment.
 */
export const SquadSettingsTab = ({
  activeGroup,
  isUserGM,
  updateGroup,
  deleteGroup,
  leaveGroup,
  storyCatalog = [],
  confirm,
  toast
}) => {
  const { currentUser } = useAuth() || {};
  const { transferArchitectRole, setCoArchitect, flagSquadLFP, isUserArchitect } = useGroup() || {};

  const [editName, setEditName] = useState(activeGroup?.name || '');
  const [editDesc, setEditDesc] = useState(activeGroup?.description || '');
  const [editStatus, setEditStatus] = useState(activeGroup?.status || 'Recruiting');
  const [editStoryId, setEditStoryId] = useState(activeGroup?.campaignId || '');
  const [editAllowPlayerOverride, setEditAllowPlayerOverride] = useState(activeGroup?.allowPlayerOverride !== false);
  const [isSaving, setIsSaving] = useState(false);

  // LFP State
  const [editLfpActive, setEditLfpActive] = useState(Boolean(activeGroup?.lfp?.active || activeGroup?.status === 'Recruiting'));
  const [editLfpSlots, setEditLfpSlots] = useState(activeGroup?.lfp?.openSlots || 2);
  const [editLfpPitch, setEditLfpPitch] = useState(activeGroup?.lfp?.pitch || '');
  const [editLfpRoles, setEditLfpRoles] = useState(activeGroup?.lfp?.neededRoles || ['Specialist', 'Combat']);
  const [customRoleInput, setCustomRoleInput] = useState('');

  // Role Transfer State
  const [selectedTransferUserId, setSelectedTransferUserId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Sync inputs when active group changes
  useEffect(() => {
    if (activeGroup) {
      setEditName(activeGroup.name || '');
      setEditDesc(activeGroup.description || '');
      setEditStatus(activeGroup.status || 'Recruiting');
      setEditStoryId(activeGroup.campaignId || '');
      setEditAllowPlayerOverride(activeGroup.allowPlayerOverride !== false);

      setEditLfpActive(Boolean(activeGroup.lfp?.active || activeGroup.status === 'Recruiting'));
      setEditLfpSlots(activeGroup.lfp?.openSlots || 2);
      setEditLfpPitch(activeGroup.lfp?.pitch || '');
      setEditLfpRoles(activeGroup.lfp?.neededRoles || ['Specialist', 'Combat']);
      setSelectedTransferUserId('');
    }
  }, [activeGroup]);

  if (!activeGroup) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="p-6 text-center text-slate-500 font-mono text-xs">
          Select an active squad to configure its policies.
        </div>
      </div>
    );
  }

  // Eligible transfer recipients (all squad members except current Lead Architect)
  const transferEligibleMembers = (
    Array.isArray(activeGroup.members) ? activeGroup.members : Object.keys(activeGroup.memberDetails || {})
  ).map(raw => {
    const uid = typeof raw === 'string' ? raw : (raw?.userId || raw?.uid || raw?.id);
    const detail = activeGroup.memberDetails?.[uid] || (typeof raw === 'object' ? raw : {});
    return {
      uid,
      handle: detail.handle || detail.userHandle || detail.displayName || 'Operator',
      role: detail.role || (uid === activeGroup.creatorId ? 'Architect' : 'Operator')
    };
  }).filter(m => m.uid && m.uid !== activeGroup.creatorId);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!activeGroup || !updateGroup) return;

    setIsSaving(true);
    try {
      await updateGroup(activeGroup.id, {
        name: editName.trim(),
        description: editDesc.trim(),
        status: editStatus,
        campaignId: editStoryId || null,
        campaignTitle: storyCatalog.find(s => s.id === editStoryId)?.title || activeGroup.campaignTitle || '',
        allowPlayerOverride: editAllowPlayerOverride,
        lfp: {
          active: editLfpActive,
          openSlots: Number(editLfpSlots) || 2,
          neededRoles: editLfpRoles,
          pitch: editLfpPitch.trim(),
          updatedAt: new Date().toISOString()
        }
      });

      if (flagSquadLFP) {
        await flagSquadLFP({
          groupId: activeGroup.id,
          neededRoles: editLfpRoles,
          pitch: editLfpPitch.trim(),
          openSlots: Number(editLfpSlots) || 2,
          active: editLfpActive
        });
      }

      AudioService.playTerminalBeep(1400, 0.04);
      toast?.({ type: 'success', text: 'Squad governance & LFP settings updated.' });
    } catch (err) {
      console.error('Update group settings error:', err);
      toast?.({ type: 'error', text: 'Failed to update squad settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteRoleTransfer = async () => {
    if (!selectedTransferUserId || !transferArchitectRole) return;
    const targetMember = transferEligibleMembers.find(m => m.uid === selectedTransferUserId);
    const targetHandle = targetMember ? targetMember.handle : 'this operator';

    const confirmed = await confirm?.({
      title: 'Transfer Lead Architect Role',
      message: `Are you sure you want to transfer primary Lead Architect authority of "${activeGroup.name}" to @${targetHandle}? You will step down to Co-Architect.`,
      danger: true,
      confirmLabel: 'Confirm Transfer'
    });

    if (!confirmed) return;

    setIsTransferring(true);
    try {
      await transferArchitectRole(selectedTransferUserId);
      AudioService.playTerminalBeep(1500, 0.05);
      toast?.({ type: 'success', text: `Lead Architect role transferred to @${targetHandle}.` });
      setSelectedTransferUserId('');
    } catch (err) {
      console.error('Failed to transfer architect role:', err);
      toast?.({ type: 'error', text: err.message || 'Failed to transfer role.' });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleToggleCoArchitect = async (memberUid, currentIsCo) => {
    if (!setCoArchitect) return;
    try {
      await setCoArchitect(memberUid, !currentIsCo);
      toast?.({ 
        type: 'info', 
        text: !currentIsCo ? 'Operator promoted to Co-Architect.' : 'Co-Architect demoted to Operator.' 
      });
    } catch (err) {
      console.error('Toggle co-architect error:', err);
    }
  };

  const addRoleTag = (roleName) => {
    if (!roleName || !roleName.trim()) return;
    const clean = roleName.trim();
    if (!editLfpRoles.includes(clean)) {
      setEditLfpRoles(prev => [...prev, clean]);
    }
    setCustomRoleInput('');
  };

  const removeRoleTag = (tag) => {
    setEditLfpRoles(prev => prev.filter(t => t !== tag));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-5">
        <div className="space-y-1">
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Settings size={16} className="text-slate-400" />
            <span>SQUAD GOVERNANCE & CONFIGURATION</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Manage team identity, linked campaign scenario files, and player access rules.
          </p>
        </div>

        <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Squad Callsign / Title</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={!isUserGM}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Squad Briefing / Description</label>
            <textarea
              rows={3}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              disabled={!isUserGM}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-sans text-slate-100 focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Recruiting Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                disabled={!isUserGM}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-60 cursor-pointer"
              >
                <option value="Recruiting">Recruiting (Open to Inquiries)</option>
                <option value="Active">Active (Full Tactical Roster)</option>
                <option value="Private">Private (Invitation Only)</option>
                <option value="Hiatus">Hiatus (Station Standby)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Linked Story Campaign</label>
              <select
                value={editStoryId}
                onChange={(e) => setEditStoryId(e.target.value)}
                disabled={!isUserGM}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-60 cursor-pointer"
              >
                <option value="">-- No Linked Campaign --</option>
                {storyCatalog.map(story => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editAllowPlayerOverride}
                onChange={(e) => setEditAllowPlayerOverride(e.target.checked)}
                disabled={!isUserGM}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 cursor-pointer disabled:opacity-60"
              />
              <span className="text-xs font-mono text-slate-300">
                Allow squad members to switch their active persona at will
              </span>
            </label>
          </div>

          {isUserGM && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'SAVING...' : 'SAVE SQUAD SETTINGS'}
              </button>
            </div>
          )}
        </div>

        {/* ── LFP (Looking For Persons) Community Recruitment Section ── */}
        <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="space-y-0.5">
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Radio size={14} className="text-cyan-400" />
                <span>COMMUNITY RECRUITMENT (LFP)</span>
              </h4>
              <p className="text-[11px] text-slate-400 font-sans">
                Broadcast this squad to the Community Networking hub for operators to find and apply.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editLfpActive}
                onChange={(e) => setEditLfpActive(e.target.checked)}
                disabled={!isUserGM}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0 cursor-pointer disabled:opacity-60"
              />
              <span className={`text-xs font-mono font-bold ${editLfpActive ? 'text-cyan-300' : 'text-slate-500'}`}>
                {editLfpActive ? 'LFP ACTIVE' : 'LFP OFF'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Open Slots Needed</label>
              <input
                type="number"
                min={1}
                max={activeGroup.maxMembers || 6}
                value={editLfpSlots}
                onChange={(e) => setEditLfpSlots(Math.max(1, parseInt(e.target.value, 10) || 1))}
                disabled={!isUserGM || !editLfpActive}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-slate-300 mb-1">Desired Persona Roles / Specializations</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {editLfpRoles.map(role => (
                  <span
                    key={role}
                    className="px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10.5px] font-mono flex items-center gap-1"
                  >
                    <span>{role}</span>
                    {isUserGM && (
                      <button
                        type="button"
                        onClick={() => removeRoleTag(role)}
                        className="text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isUserGM && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRoleTag(customRoleInput);
                      }
                    }}
                    placeholder="Add tag (e.g. Hacker, Pilot)..."
                    className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => addRoleTag(customRoleInput)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold hover:bg-cyan-900 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Recruitment Pitch / Briefing for Candidates</label>
            <textarea
              rows={2}
              value={editLfpPitch}
              onChange={(e) => setEditLfpPitch(e.target.value)}
              disabled={!isUserGM || !editLfpActive}
              placeholder="e.g. Seeking frontline specialists for high-intensity sector recon missions..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-sans text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* ── Co-Architect Designation Management ── */}
        {isUserArchitect && (
          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="space-y-0.5 border-b border-slate-800/80 pb-2">
              <h4 className="font-mono text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Crown size={14} className="text-teal-400" />
                <span>CO-ARCHITECT ROSTER PRIVILEGES</span>
              </h4>
              <p className="text-[11px] text-slate-400 font-sans">
                Designate trusted squad operators to assist with tactical handouts, member invitations, and stage briefings.
              </p>
            </div>

            <div className="space-y-2">
              {transferEligibleMembers.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono italic">No other operators currently enrolled in squad.</p>
              ) : (
                transferEligibleMembers.map(member => {
                  const isCo = (Array.isArray(activeGroup.coArchitects) && activeGroup.coArchitects.includes(member.uid)) || member.role === 'Co-Architect' || member.role === 'Co-GM';
                  return (
                    <div
                      key={member.uid}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-300">
                          {member.handle.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-white">@{member.handle}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold uppercase ${
                          isCo 
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' 
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {isCo ? 'Co-Architect' : 'Operator'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleCoArchitect(member.uid, isCo)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isCo
                            ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40'
                            : 'bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-500/40'
                        }`}
                      >
                        {isCo ? 'REVOKE CO-ARCHITECT' : 'MAKE CO-ARCHITECT'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── Lead Architect Role Transfer ── */}
        {isUserArchitect && transferEligibleMembers.length > 0 && (
          <div className="space-y-3 p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <div className="space-y-0.5 border-b border-amber-500/30 pb-2">
              <h4 className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRightLeft size={14} className="text-amber-400" />
                <span>TRANSFER LEAD ARCHITECT ROLE</span>
              </h4>
              <p className="text-[11px] text-slate-400 font-sans">
                Transfer permanent primary governance of "{activeGroup.name}" to another enrolled squad operator. You will transition to Co-Architect.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <select
                value={selectedTransferUserId}
                onChange={(e) => setSelectedTransferUserId(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="">-- Select Operator to Transfer Leadership --</option>
                {transferEligibleMembers.map(m => (
                  <option key={m.uid} value={m.uid} className="bg-slate-900 text-slate-100">
                    @{m.handle} ({m.role || 'Operator'})
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!selectedTransferUserId || isTransferring}
                onClick={handleExecuteRoleTransfer}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black font-mono text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <ArrowRightLeft size={13} />
                <span>{isTransferring ? 'TRANSFERRING...' : 'TRANSFER LEAD ROLE'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Danger Zone: Leave or Disband Squad */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider block">
              {isUserGM ? 'DISBAND SQUAD COMMAND' : 'DEPART SQUAD'}
            </span>
            <span className="text-[11px] text-slate-400 font-sans block">
              {isUserGM 
                ? 'Permanently delete this squad and release all tactical comm relays.' 
                : 'Remove yourself from this squad roster and surrender assigned frequency access.'}
            </span>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (isUserGM) {
                const ok = await confirm({
                  title: 'Disband Squad',
                  message: `Are you sure you want to disband squad "${activeGroup.name}"? This action cannot be undone.`,
                  danger: true,
                  confirmLabel: 'Disband'
                });
                if (ok) {
                  deleteGroup?.(activeGroup.id);
                  toast?.({ type: 'warning', text: `Squad "${activeGroup.name}" disbanded.` });
                }
              } else {
                const ok = await confirm({
                  title: 'Leave Squad',
                  message: `Are you sure you want to leave squad "${activeGroup.name}"?`,
                  danger: true,
                  confirmLabel: 'Leave'
                });
                if (ok) {
                  leaveGroup?.(activeGroup.id);
                  toast?.({ type: 'info', text: `You left squad "${activeGroup.name}".` });
                }
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-500/50 text-rose-300 hover:bg-rose-900 text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            {isUserGM ? 'DISBAND' : 'LEAVE'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SquadSettingsTab;
