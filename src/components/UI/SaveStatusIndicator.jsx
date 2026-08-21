import React from 'react';
import { Cloud, CloudOff, Check, RefreshCw, AlertCircle } from 'lucide-react';

export const SaveStatusIndicator = ({ status, lastSaved, error, onRetry }) => {
  const formattedTime = lastSaved 
    ? (typeof lastSaved === 'number' ? new Date(lastSaved).toLocaleTimeString() : lastSaved)
    : '';

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800 text-xs font-mono select-none">
      {status === 'saving' && (
        <span className="flex items-center gap-1.5 text-cyan-400 animate-pulse">
          <RefreshCw size={13} className="animate-spin" /> Saving...
        </span>
      )}
      {status === 'saved' && (
        <span className="flex items-center gap-1.5 text-emerald-400" title={formattedTime ? `Synced at ${formattedTime}` : 'Synced'}>
          <Check size={13} /> Cloud Synced
        </span>
      )}
      {status === 'unsaved' && (
        <span className="flex items-center gap-1.5 text-amber-400">
          <Cloud size={13} /> Changes Unsaved
        </span>
      )}
      {status === 'offline' && (
        <span className="flex items-center gap-1.5 text-slate-400">
          <CloudOff size={13} /> Local Only
        </span>
      )}
      {status === 'error' && (
        <button type="button" onClick={onRetry} className="flex items-center gap-1.5 text-red-400 hover:underline cursor-pointer" title={error || 'Sync Error'}>
          <AlertCircle size={13} /> Sync Error (Retry)
        </button>
      )}
      {(status === 'idle' || !status) && (
        <span className="flex items-center gap-1.5 text-slate-500">
          <Check size={13} /> Ready
        </span>
      )}
    </div>
  );
};

export default SaveStatusIndicator;
