import React from 'react';
import { Settings } from 'lucide-react';

export const SquadSettingsTab = ({
  activeGroup,
  isUserGM,
  handleSaveSettings,
  editName,
  setEditName,
  editDesc,
  setEditDesc,
  editStatus,
  setEditStatus,
  editStoryId,
  setEditStoryId,
  storyCatalog = [],
  editAllowPlayerOverride,
  setEditAllowPlayerOverride,
  confirm,
  deleteGroup,
  leaveGroup,
  toast
}) => {
  if (!activeGroup) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="p-6 text-center text-slate-500 font-mono text-xs">
          Select an active squad to configure its policies.
        </div>
      </div>
    );
  }

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
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
              >
                <option value="Recruiting">Recruiting (Publicly Listed)</option>
                <option value="Active">Active (Invite Only)</option>
                <option value="On Mission">On Mission (Locked)</option>
                <option value="Hiatus">Hiatus (Inactive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Linked ADE Campaign</label>
              <select
                value={editStoryId}
                onChange={(e) => setEditStoryId(e.target.value)}
                disabled={!isUserGM}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
              >
                <option value="">No Campaign Linked</option>
                {storyCatalog.map(story => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Permissions Toggle */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-mono text-slate-200 block">Allow Player Overrides</span>
              <span className="text-[10px] text-slate-500 block">Permit players to freely edit attached persona stats during gameplay</span>
            </div>
            <input
              type="checkbox"
              checked={editAllowPlayerOverride}
              onChange={(e) => setEditAllowPlayerOverride(e.target.checked)}
              disabled={!isUserGM}
              className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
            />
          </div>

          {isUserGM && (
            <div className="pt-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                SAVE SQUAD SETTINGS
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone: Leave / Disband */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-rose-300 block">
              {isUserGM ? 'DISBAND SQUAD' : 'LEAVE SQUAD'}
            </span>
            <span className="text-[10.5px] text-slate-400 block">
              {isUserGM ? 'Permanently disband this tactical squad and close tied-in comms.' : 'Revoke your persona attachment and exit this squad.'}
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
                  deleteGroup(activeGroup.id);
                  toast({ type: 'warning', text: `Squad "${activeGroup.name}" disbanded.` });
                }
              } else {
                const ok = await confirm({
                  title: 'Leave Squad',
                  message: `Are you sure you want to leave squad "${activeGroup.name}"?`,
                  danger: true,
                  confirmLabel: 'Leave'
                });
                if (ok) {
                  leaveGroup(activeGroup.id);
                  toast({ type: 'info', text: `You left squad "${activeGroup.name}".` });
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
