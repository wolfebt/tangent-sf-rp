import React, { useState, useEffect } from 'react';
import { Check, X, Sparkles, Calculator, ArrowRight } from 'lucide-react';

/**
 * StepAiDiffPreview
 * Non-destructive field-by-field diff confirmation panel for both deterministic
 * BASTION math calibration and user-cued step synthesis.
 */
export const StepAiDiffPreview = ({
  isOpen,
  title = 'Review Proposed Cortex Calibration',
  mode = 'calibration', // 'calibration' | 'ai_draft'
  diffs = [],
  onApply,
  onCancel
}) => {
  const [selectedFields, setSelectedFields] = useState(() => new Set());

  useEffect(() => {
    setSelectedFields(new Set(diffs.map((d) => d.field)));
  }, [diffs]);

  if (!isOpen || !Array.isArray(diffs) || diffs.length === 0) return null;

  const toggleField = (field) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const formatPreview = (val) => {
    if (val === undefined || val === null || val === '') return '— (Empty)';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const handleConfirm = () => {
    const chosen = diffs.filter((d) => selectedFields.has(d.field));
    onApply(chosen);
  };

  return (
    <div className="p-4 bg-slate-950/95 border border-cyan-500/50 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.18)] space-y-3 animate-fade-in font-mono">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {mode === 'calibration' ? (
            <Calculator size={15} className="text-emerald-400" />
          ) : (
            <Sparkles size={15} className="text-cyan-400" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
            {title}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-cyan-300">
            {selectedFields.size}/{diffs.length} selected
          </span>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          title="Dismiss preview"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {diffs.map((diff) => {
          const checked = selectedFields.has(diff.field);
          return (
            <label
              key={diff.field}
              className={`block p-2.5 rounded-xl border transition-colors cursor-pointer ${
                checked
                  ? 'bg-slate-900/90 border-cyan-500/45'
                  : 'bg-slate-950/60 border-slate-800 opacity-65'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleField(diff.field)}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-slate-700 text-cyan-500 bg-slate-950"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-cyan-300 uppercase">
                      {diff.label} <span className="text-slate-500 font-normal">({diff.field})</span>
                    </span>
                    {diff.reason && (
                      <span className="text-[10px] text-emerald-400/90">{diff.reason}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 text-[11px]">
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 truncate">
                      {formatPreview(diff.currentValue)}
                    </div>
                    <ArrowRight size={12} className="text-cyan-400 hidden sm:block" />
                    <div className="p-1.5 rounded bg-emerald-950/35 border border-emerald-500/35 text-emerald-200 break-words">
                      {formatPreview(diff.proposedValue)}
                    </div>
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-bold uppercase cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={selectedFields.size === 0}
          onClick={handleConfirm}
          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
        >
          <Check size={13} />
          <span>Apply {selectedFields.size} Update{selectedFields.size === 1 ? '' : 's'}</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(StepAiDiffPreview);
