import React from 'react';

const SyncConflictModal = ({ isOpen, conflictData, onOverwrite, onPull, onCancel }) => {
  if (!isOpen || !conflictData) return null;

  const { cloudData, localData, cloudUpdatedAt, localUpdatedAt, type } = conflictData;

  const formatTime = (ts) => {
    if (!ts) return 'Unknown';
    try {
      return new Date(ts).toLocaleString();
    } catch (e) {
      return String(ts);
    }
  };

  const localScenarioCount = localData?.scenarios?.length || 0;
  const cloudScenarioCount = cloudData?.scenarios?.length || 0;
  const localMapCount = localData?.maps?.length || 0;
  const cloudMapCount = cloudData?.maps?.length || 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-6 sm:pt-10 overflow-y-auto animate-fadeIn">
      <div className="bg-[#121820] border-2 border-red-500/80 rounded-xl max-w-2xl w-full p-6 shadow-[0_0_35px_rgba(239,68,68,0.4)] text-slate-100 flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-500/40 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">⚡</span>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-red-400">
                Story Sync Conflict Detected
              </h2>
              <p className="text-xs text-slate-400">
                {type === 'push_conflict'
                  ? 'The cloud document has been modified since your last sync.'
                  : 'Remote changes were detected while you have unsaved local edits.'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 rounded transition-colors"
            title="Dismiss Modal"
          >
            ✕
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-950/50 border border-red-800/80 rounded-lg p-3 text-xs text-red-200">
          <p className="font-semibold mb-1">
            <strong>Warning:</strong> Overwriting will replace the Cloud DB document with your local version. Pulling will overwrite your unsaved local edits with the Cloud version.
          </p>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local State Card */}
          <div className="bg-[#1a222d] border border-cyan-500/60 rounded-lg p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <span className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                💻 Your Local Version
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono font-bold">
                Active Edit
              </span>
            </div>
            <div className="text-xs space-y-1.5 text-slate-300">
              <p><span className="text-slate-400 font-mono">Project:</span> <strong>{localData?.projectName || 'Untitled'}</strong></p>
              <p><span className="text-slate-400 font-mono">Scenarios/Elements:</span> {localScenarioCount}</p>
              <p><span className="text-slate-400 font-mono">Maps:</span> {localMapCount}</p>
              <p className="text-[11px] text-cyan-300/80 font-mono pt-1">
                Last Modified: {formatTime(localUpdatedAt)}
              </p>
            </div>
          </div>

          {/* Cloud State Card */}
          <div className="bg-[#1a222d] border border-amber-500/60 rounded-lg p-4 flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <span className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                ☁️ Cloud DB Version
              </span>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800 font-mono font-bold">
                Remote Cloud
              </span>
            </div>
            <div className="text-xs space-y-1.5 text-slate-300">
              <p><span className="text-slate-400 font-mono">Project:</span> <strong>{cloudData?.projectName || 'Untitled'}</strong></p>
              <p><span className="text-slate-400 font-mono">Scenarios/Elements:</span> {cloudScenarioCount}</p>
              <p><span className="text-slate-400 font-mono">Maps:</span> {cloudMapCount}</p>
              <p className="text-[11px] text-amber-300/80 font-mono pt-1">
                Last Modified: {formatTime(cloudUpdatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700"
          >
            Keep Working Locally
          </button>
          
          <button
            onClick={onPull}
            className="w-full sm:w-auto px-4 py-2 bg-amber-900/80 hover:bg-amber-800 border border-amber-500 text-amber-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)] flex items-center justify-center gap-1.5"
          >
            <span>📥 Pull Cloud Version</span>
          </button>

          <button
            onClick={onOverwrite}
            className="w-full sm:w-auto px-4 py-2 bg-red-900/80 hover:bg-red-800 border border-red-500 text-red-100 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)] flex items-center justify-center gap-1.5"
          >
            <span>☁️ Overwrite Cloud DB</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SyncConflictModal;
