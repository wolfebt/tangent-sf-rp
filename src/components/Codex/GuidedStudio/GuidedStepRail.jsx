import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Dna,
  Layers,
  Sparkles,
  Award,
  ShieldAlert,
  BookOpen,
  Flag,
  Shield,
  Compass,
  Globe,
  Briefcase,
  Coins,
  Sliders,
  Zap,
  Flame,
  Cpu,
  Wand2,
  Crosshair,
  Package,
  Bot,
  Building2,
  Maximize2,
  Wrench,
  Users,
  Activity,
  Calculator,
  Code,
  FileText
} from 'lucide-react';
import { evaluateStepReadiness } from './studioPlaybooks';

const STEP_ICON_MAP = {
  Dna,
  Layers,
  Sparkles,
  Award,
  ShieldAlert,
  BookOpen,
  Flag,
  Shield,
  Compass,
  Globe,
  Briefcase,
  Coins,
  Sliders,
  Zap,
  Flame,
  Cpu,
  Wand2,
  Crosshair,
  Package,
  Bot,
  Building2,
  Maximize2,
  Wrench,
  Users,
  Activity,
  Calculator,
  Code,
  FileText,
  CheckCircle
};

/**
 * GuidedStepRail
 * Progressive multi-step & sub-step navigation rail for Guided Walkthrough Mode.
 */
export const GuidedStepRail = ({
  playbook,
  matrix,
  activeStepIndex = 0,
  activeSubStepId = null,
  onSelectStep,
  onSelectSubStep,
  formData = {},
  liveBuildCheck = null,
  speciesSummary = null,
  isSpeciesStudio = false,
  isProperty = false
}) => {
  const steps = playbook?.steps || [];
  const MatrixIcon = matrix?.icon || Sparkles;

  return (
    <nav
      aria-label="Guided Creation Steps"
      className="w-full md:w-52 shrink-0 bg-[#070a12]/95 backdrop-blur-md border-b md:border-b-0 md:border-r border-slate-800/90 flex flex-col justify-between py-2.5 px-2 select-none z-20 font-sans shadow-lg"
    >
      <div className="flex flex-row md:flex-col flex-wrap md:flex-nowrap gap-1.5 w-full overflow-y-auto no-scrollbar min-h-0 items-center md:items-stretch">
        {/* Matrix Header Crest */}
        <div className="hidden md:flex items-center gap-2.5 px-1.5 py-1 mb-1 border-b border-slate-800/80 pb-2">
          <div
            className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-lg"
            style={{
              background: `${playbook?.accentColor || matrix?.color || '#06b6d4'}18`,
              borderColor: `${playbook?.accentColor || matrix?.color || '#06b6d4'}55`,
              color: playbook?.accentColor || matrix?.color || '#06b6d4'
            }}
          >
            <MatrixIcon size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300 truncate">
              GUIDED STUDIO
            </div>
            <div className="font-mono text-[8.5px] text-slate-400 uppercase truncate">
              {steps.length} Creation Stages
            </div>
          </div>
        </div>

        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const readiness = evaluateStepReadiness(step, formData, liveBuildCheck);
          const StepIcon = STEP_ICON_MAP[step.iconName] || Sparkles;
          const hasSubSteps = Array.isArray(step.subSteps) && step.subSteps.length > 0;

          return (
            <div key={step.id} className="flex flex-col gap-0.5 flex-1 md:flex-none min-w-[130px] md:w-full">
              <button
                type="button"
                onClick={() => onSelectStep(index)}
                title={`${step.label} • ${step.sublabel}`}
                className={`group relative w-full px-2 py-2 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer border text-left ${
                  isActive
                    ? 'bg-slate-900/95 border-cyan-400/70 shadow-[0_0_14px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border-transparent hover:border-slate-800'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute -left-1 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ backgroundColor: step.color || playbook?.accentColor || '#06b6d4' }}
                  />
                )}

                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border text-[10px] font-mono font-bold ${
                      isActive ? 'border-cyan-400/80' : 'border-slate-800 bg-slate-950/70'
                    }`}
                    style={
                      isActive
                        ? { background: `${step.color || '#06b6d4'}25`, color: step.color || '#06b6d4' }
                        : {}
                    }
                  >
                    <StepIcon size={12} />
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`font-mono text-[10px] uppercase tracking-wider truncate leading-tight ${
                        isActive ? 'font-extrabold text-white' : 'font-semibold text-slate-300'
                      }`}
                    >
                      {step.shortLabel || `${step.stepNumber}. ${step.label}`}
                    </div>
                    <div className="font-mono text-[8.5px] text-slate-500 truncate hidden md:block">
                      {readiness.summary}
                    </div>
                  </div>
                </div>

                {/* Readiness Status Indicator */}
                <div className="flex items-center gap-1 shrink-0">
                  {readiness.status === 'valid' ? (
                    <CheckCircle size={12} className="text-emerald-400" />
                  ) : readiness.status === 'warning' ? (
                    <AlertTriangle size={12} className="text-amber-400" />
                  ) : readiness.status === 'partial' ? (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full border border-slate-600" />
                  )}
                  {hasSubSteps && (
                    <ChevronDown
                      size={11}
                      className={`transition-transform ${isActive ? 'rotate-180 text-cyan-300' : 'text-slate-600'}`}
                    />
                  )}
                </div>
              </button>

              {/* Expanding Granular Sub-Steps */}
              {hasSubSteps && isActive && (
                <div className="relative pl-2.5 ml-3 my-1 flex flex-col gap-1 border-l-2 border-cyan-500/40 animate-fade-in">
                  {step.subSteps.map((sub) => {
                    const currentSub = activeSubStepId || step.subSteps[0].id;
                    const isSubActive = currentSub === sub.id;
                    const SubIcon = STEP_ICON_MAP[sub.iconName] || Layers;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => onSelectSubStep(sub)}
                        className={`relative w-full px-2 py-1.5 rounded-lg text-left font-mono text-[9.5px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isSubActive
                            ? 'bg-cyan-950/85 text-cyan-200 border-cyan-400/70'
                            : 'bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-slate-200 hover:bg-slate-800/70'
                        }`}
                      >
                        <SubIcon size={10} className={isSubActive ? 'text-cyan-300 shrink-0' : 'text-slate-500 shrink-0'} />
                        <span className="truncate">{sub.shortLabel || sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Live Budget Summary */}
      <div className="hidden md:flex w-full flex-col gap-1.5 pt-2 border-t border-slate-800/80 mt-auto shrink-0">
        {((isSpeciesStudio && speciesSummary) || (isProperty && liveBuildCheck) || liveBuildCheck?.primaryCostLabel) && (
          <div className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[9.5px] font-mono">
            <span className="text-slate-400 uppercase font-bold">
              {isSpeciesStudio ? 'Package CP' : 'Live Cost'}
            </span>
            <span className="text-emerald-400 font-bold">
              {isSpeciesStudio
                ? `${speciesSummary?.bpData?.totalBPUsed ?? 0} CP`
                : (liveBuildCheck?.primaryCostLabel || 'Calibrated')}
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default React.memo(GuidedStepRail);
