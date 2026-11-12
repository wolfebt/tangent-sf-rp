import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Wrench
} from 'lucide-react';

/**
 * StepFooterBar
 * Sticky guided progression bar providing Back / Next step navigation,
 * quick Save at any stage, and Switch-to-Workbench shortcut.
 */
export const StepFooterBar = ({
  steps = [],
  activeStepIndex = 0,
  onPrevStep,
  onNextStep,
  onSwitchToWorkbench,
  onReset,
  onDelete,
  onSave,
  isEditMode = true,
  isAdmin = false,
  canDelete = false,
  isSaving = false,
  errorMessage = '',
  saveSuccess = false
}) => {
  const isFirst = activeStepIndex <= 0;
  const isLast = activeStepIndex >= steps.length - 1;
  const nextStep = !isLast ? steps[activeStepIndex + 1] : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 shrink-0">
      {/* Left Controls: Back + Reset/Delete */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isFirst}
          onClick={onPrevStep}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-slate-200 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        {isEditMode && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset draft to blank defaults"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        {canDelete && isAdmin && (
          <button
            type="button"
            onClick={onDelete}
            className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-300 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>

      {/* Center Status / Workbench Escape Hatch */}
      <div className="flex items-center gap-2">
        {errorMessage && (
          <span className="text-xs font-mono text-red-400 flex items-center gap-1">
            <AlertTriangle size={13} />
            <span>{errorMessage}</span>
          </span>
        )}

        {saveSuccess && (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle size={13} />
            <span>Committed to Omnicortex</span>
          </span>
        )}

        {onSwitchToWorkbench && (
          <button
            type="button"
            onClick={onSwitchToWorkbench}
            className="hidden xl:flex px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10.5px] font-mono text-slate-400 hover:text-cyan-300 items-center gap-1.5 cursor-pointer"
            title="Switch to Expert Workbench Mode for all-tabs access"
          >
            <Wrench size={11} />
            <span>Open Workbench</span>
          </button>
        )}
      </div>

      {/* Right Controls: Quick Commit + Next Step */}
      <div className="flex items-center gap-2">
        {isEditMode && !isLast && (
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Commit current progress to Omnicortex immediately"
          >
            <Save size={13} />
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Now'}</span>
          </button>
        )}

        {!isLast ? (
          <button
            type="button"
            onClick={onNextStep}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_18px_rgba(6,182,212,0.28)] transition-all cursor-pointer"
          >
            <span>Next: {nextStep?.shortLabel || 'Continue'}</span>
            <ChevronRight size={14} />
          </button>
        ) : (
          isEditMode && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onSave}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={14} className={isSaving ? 'animate-spin' : ''} />
              <span>{isSaving ? 'Committing...' : 'Commit to Omnicortex'}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default React.memo(StepFooterBar);
