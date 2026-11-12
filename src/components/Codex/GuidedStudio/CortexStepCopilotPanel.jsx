import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Calculator,
  Sparkles,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Loader2,
  Send
} from 'lucide-react';
import { queryStudioStepContext } from '../../../services/omnicortexVectorRag';
import {
  findComparableCortexExemplars,
  computeCortexStepBenchmarks,
  resolveCatalogForDomain
} from './intelligence/cortexExemplarService';
import {
  computeDeterministicCalibrationDiffs,
  requestUserCuedStepSynthesis
} from './intelligence/studioStepAiService';
import { StepAiDiffPreview } from './StepAiDiffPreview';

/**
 * CortexStepCopilotPanel
 * Contextual per-step Cortex Intelligence bar providing:
 *  - Step objective & granular sub-step pills
 *  - Live Omnicortex statistical peer benchmarks (zero latency)
 *  - Step-scoped Canonical Rulebook RAG citations (zero latency)
 *  - Instant offline BASTION math calibration (`Calibrate Math`)
 *  - Strictly USER-CUED BASTION step drafting (`Cue BASTION...` — never runs proactively)
 */
export const CortexStepCopilotPanel = ({
  playbook,
  step,
  activeSubStepId,
  onSelectSubStep,
  domainKey,
  formData = {},
  dbData = {},
  computedValues = {},
  liveBuildCheck = null,
  isEditMode = true,
  onApplyFieldUpdates
}) => {
  const [showRulesDrawer, setShowRulesDrawer] = useState(false);
  const [showCueBar, setShowCueBar] = useState(false);
  const [userCueText, setUserCueText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingDiffState, setPendingDiffState] = useState({
    isOpen: false,
    mode: 'calibration',
    title: '',
    diffs: []
  });

  const fullCatalog = useMemo(
    () => resolveCatalogForDomain(domainKey, dbData),
    [domainKey, dbData]
  );

  const exemplars = useMemo(
    () => findComparableCortexExemplars(formData, domainKey, dbData, 10),
    [formData, domainKey, dbData]
  );

  const benchmarks = useMemo(
    () => computeCortexStepBenchmarks(exemplars, domainKey, fullCatalog.length),
    [exemplars, domainKey, fullCatalog.length]
  );

  const ragContext = useMemo(() => {
    try {
      return queryStudioStepContext({
        query: step?.ragQuery || `${domainKey} ${step?.label || ''}`,
        domainKey,
        tags: step?.ragTags || [],
        dbData,
        topK: 3
      });
    } catch {
      return { ruleCitations: [], entityCitations: [] };
    }
  }, [step?.ragQuery, step?.label, step?.ragTags, domainKey, dbData]);

  const calibrationDiffs = useMemo(
    () => computeDeterministicCalibrationDiffs(formData, domainKey, computedValues, liveBuildCheck),
    [formData, domainKey, computedValues, liveBuildCheck]
  );

  const handleTriggerCalibration = () => {
    if (calibrationDiffs.length === 0) return;
    setPendingDiffState({
      isOpen: true,
      mode: 'calibration',
      title: 'BASTION Deterministic Formula Calibration',
      diffs: calibrationDiffs
    });
  };

  const handleRunUserCuedSynthesis = async (e) => {
    if (e) e.preventDefault();
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const diffs = await requestUserCuedStepSynthesis({
        step,
        playbook,
        formData,
        domainKey,
        exemplars,
        ragCitations: ragContext.ruleCitations,
        userCuePrompt: userCueText.trim()
      });
      if (diffs.length > 0) {
        setPendingDiffState({
          isOpen: true,
          mode: 'ai_draft',
          title: `Cued BASTION Suggestions — ${step?.label || 'Active Step'}`,
          diffs
        });
        setShowCueBar(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!step) return null;

  return (
    <div className="space-y-3">
      <div className="p-4 bg-slate-950/85 border border-slate-800/90 rounded-2xl shadow-lg space-y-3">
        {/* Top Row: Step Title + User-Cued Cortex Actions */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase tracking-wider"
                style={{
                  backgroundColor: `${step.color || playbook?.accentColor || '#06b6d4'}22`,
                  color: step.color || playbook?.accentColor || '#06b6d4',
                  border: `1px solid ${step.color || playbook?.accentColor || '#06b6d4'}55`
                }}
              >
                STEP {step.stepNumber} OF {playbook?.steps?.length || 1}
              </span>
              <h3 className="text-sm sm:text-base font-mono font-bold text-white">
                {step.label}
              </h3>
            </div>
            {step.description && (
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {step.description}
              </p>
            )}
          </div>

          {/* Action Pills: Rules RAG Toggle + Deterministic Calibrate + User-Cued BASTION */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {ragContext.ruleCitations.length > 0 && (
              <button
                type="button"
                onClick={() => setShowRulesDrawer((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showRulesDrawer
                    ? 'bg-cyan-950 border-cyan-400/70 text-cyan-200'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title="Toggle canonical Omnicortex rules & formulas for this step"
              >
                <BookOpen size={12} className="text-cyan-400" />
                <span>Cortex Rules ({ragContext.ruleCitations.length})</span>
                {showRulesDrawer ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </button>
            )}

            {isEditMode && calibrationDiffs.length > 0 && (
              <button
                type="button"
                onClick={handleTriggerCalibration}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Synchronize derived CR, TSC Credits, Essence, or CP math with canonical BASTION formulas"
              >
                <Calculator size={12} className="text-emerald-400" />
                <span>Calibrate Math ({calibrationDiffs.length})</span>
              </button>
            )}

            {isEditMode && (
              <button
                type="button"
                onClick={() => setShowCueBar((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showCueBar
                    ? 'bg-purple-950 border-purple-400/70 text-purple-200'
                    : 'bg-slate-900 hover:bg-slate-800 border-purple-500/40 text-purple-300'
                }`}
                title="Explicitly cue BASTION for step suggestions (runs only on your command)"
              >
                <Sparkles size={12} className="text-purple-400" />
                <span>Cue BASTION...</span>
              </button>
            )}
          </div>
        </div>

        {/* Granular Sub-Step Switcher Tabs (if step defines subSteps) */}
        {Array.isArray(step.subSteps) && step.subSteps.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mr-1">
              Sub-Modules:
            </span>
            {step.subSteps.map((sub, idx) => {
              const isActive = (activeSubStepId || step.subSteps[0].id) === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSelectSubStep && onSelectSubStep(sub)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/90 border-cyan-400/70 text-cyan-200 shadow-sm'
                      : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {idx + 1}. {sub.shortLabel || sub.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Live Omnicortex Statistical Benchmarks Bar */}
        {benchmarks.metrics.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 mr-1">
              <BarChart3 size={12} />
              <span>Cortex Peer Benchmarks ({benchmarks.peerCount} matched):</span>
            </div>
            {benchmarks.metrics.map((m) => (
              <div
                key={m.key}
                className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-1.5 text-[10.5px] font-mono"
                title={m.sub}
              >
                <span className="text-slate-400">{m.label}:</span>
                <span className="text-cyan-300 font-bold">{m.value}</span>
                <span className="text-slate-500 text-[9.5px] hidden xl:inline">({m.sub})</span>
              </div>
            ))}
          </div>
        )}

        {/* Strictly User-Cued BASTION Input Bar */}
        {isEditMode && showCueBar && (
          <form
            onSubmit={handleRunUserCuedSynthesis}
            className="pt-2.5 border-t border-purple-500/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-fade-in"
          >
            <input
              type="text"
              value={userCueText}
              onChange={(e) => setUserCueText(e.target.value)}
              placeholder={`Cue BASTION for "${step.label}" (e.g., "TL 4 covert Aeld sniper variant" or leave blank for balanced defaults)...`}
              className="flex-1 px-3 py-2 bg-slate-900 border border-purple-500/40 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Diff Preview'}</span>
            </button>
          </form>
        )}

        {/* Collapsible Canonical Rulebook RAG Drawer */}
        {showRulesDrawer && ragContext.ruleCitations.length > 0 && (
          <div className="pt-2.5 border-t border-cyan-500/30 grid grid-cols-1 md:grid-cols-3 gap-2.5 animate-fade-in">
            {ragContext.ruleCitations.map(({ chunk }) => (
              <div
                key={chunk.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10.5px] font-mono font-bold text-cyan-300 truncate">
                    {chunk.title}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 shrink-0">
                    {chunk.citation}
                  </span>
                </div>
                {chunk.formula && (
                  <div className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-[10px] font-mono text-amber-200">
                    {chunk.formula}
                  </div>
                )}
                <p className="text-[11px] text-slate-300 leading-snug line-clamp-4 font-sans">
                  {chunk.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Non-Destructive Field Diff Preview */}
      <StepAiDiffPreview
        isOpen={pendingDiffState.isOpen}
        mode={pendingDiffState.mode}
        title={pendingDiffState.title}
        diffs={pendingDiffState.diffs}
        onCancel={() => setPendingDiffState((prev) => ({ ...prev, isOpen: false }))}
        onApply={(chosenDiffs) => {
          if (onApplyFieldUpdates) {
            onApplyFieldUpdates(chosenDiffs);
          }
          setPendingDiffState((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
};

export default React.memo(CortexStepCopilotPanel);
