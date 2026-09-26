import React, { useState, useEffect } from 'react';
import { Settings, Shield, Trash2, LogOut, Check } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

/**
 * @component SquadSettingsTab
 * @description Squad governance and settings tab. Manages squad name, description,
 * recruiting status, linked campaign file, and player override permissions.
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
  const [editName, setEditName] = useState(activeGroup?.name || '');
  const [editDesc, setEditDesc] = useState(activeGroup?.description || '');
  const [editStatus, setEditStatus] = useState(activeGroup?.status || 'Recruiting');
  const [editStoryId, setEditStoryId] = useState(activeGroup?.campaignId || '');
  const [editAllowPlayerOverride, setEditAllowPlayerOverride] = useState(activeGroup?.allowPlayerOverride !== false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync inputs when active group changes
  useEffect(() => {
    if (activeGroup) {
      setEditName(activeGroup.name || '');
      setEditDesc(activeGroup.description || '');
      setEditStatus(activeGroup.status || 'Recruiting');
      setEditStoryId(activeGroup.campaignId || '');
      setEditAllowPlayerOverride(activeGroup.allowPlayerOverride !== false);
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
        allowPlayerOverride: editAllowPlayerOverride
      });
      AudioService.playTerminalBeep(1400, 0.04);
      toast?.({ type: 'success', text: 'Squad settings updated successfully.' });
    } catch (err) {
      console.error('Update group settings error:', err);
      toast?.({ type: 'error', text: 'Failed to update squad settings.' });
    } finally {
      setIsSaving(false);
    }
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
