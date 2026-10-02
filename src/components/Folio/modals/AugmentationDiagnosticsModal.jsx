import React, { useState } from 'react';
import {
  X,
  Activity,
  Shield,
  Zap,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Info,
  Cpu
} from 'lucide-react';
import { AUGMENTATION_STAGES } from '../../../engines/tangentConstants';

const BODY_SLOT_KEYS = [
  { id: 'Head', label: 'Head', max: 10, icon: Zap },
  { id: 'Torso', label: 'Torso', max: 50, icon: Shield },
  { id: 'LeftArm', label: 'Left Arm', max: 30, icon: Activity },
  { id: 'RightArm', label: 'Right Arm', max: 30, icon: Activity },
  { id: 'LeftLeg', label: 'Left Leg', max: 40, icon: Layers },
  { id: 'RightLeg', label: 'Right Leg', max: 40, icon: Layers }
];

export const AugmentationDiagnosticsModal = ({
  isOpen,
  onClose,
  characterData,
  stageInfo,
  bpStats,
  bodyBreakdown,
  campaignTL,
  staminaScore,
  handleSelectStage,
  incompatibleAugs = []
}) => {
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-950 border border-cyan-500/50 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_30px_rgba(6,182,212,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cyan-900/60 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2 font-mono">
                <span>Anatomical Diagnostics &amp; Cybernetic Stages</span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage 4-tier augmentation stages, free BP credit allocations, and biological body slot tolerances.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close diagnostics window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* SECTION 1: 4-TIER STAGES SELECTOR */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="bg-slate-900/90 border border-amber-900/50 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-950/80 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>4-Tier Augmentation Stages</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select operative stage to grant free BP allowances and unlock higher grade hardware.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRulesExpanded(!isRulesExpanded)}
                className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-850 border border-amber-900/60 text-amber-300 text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{isRulesExpanded ? 'Hide Mechanics' : 'View Stage Mechanics'}</span>
              </button>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AUGMENTATION_STAGES.map((stage) => {
                const isActive = stageInfo.stageId === stage.id;
                const isAugmented = stage.id === 'augmented';
                const isHeavy = stage.id === 'heavy';
                const isExtreme = stage.id === 'extreme';

                let prereqMet = true;
                let prereqLabel = 'None';
                if (isAugmented) {
                  prereqMet = campaignTL >= 3;
                  prereqLabel = `TL 3+ (Campaign TL: ${campaignTL})`;
                } else if (isHeavy) {
                  prereqMet = stageInfo.meetsHeavyPrereq;
                  prereqLabel = `Augmented & Stamina 2+ (STA: ${staminaScore})`;
                } else if (isExtreme) {
                  prereqMet = stageInfo.meetsExtremePrereq;
                  prereqLabel = `Heavy & Stamina 4+ (STA: ${staminaScore})`;
                }

                return (
                  <div
                    key={stage.id}
                    className={`rounded-xl p-3.5 border transition-all relative flex flex-col justify-between ${
                      isActive
                        ? 'bg-slate-950/90 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                          Tier {stage.tier}
                        </span>
                        {isActive && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </div>

                      <h4 className={`text-sm font-bold leading-tight mb-1 ${
                        isActive ? 'text-amber-300' : 'text-slate-200'
                      }`}>
                        {stage.name}
                      </h4>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/80 text-amber-300 text-[10px] font-mono font-bold">
                          +{stage.bpCredit} BP Credit
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-2">
                        {stage.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-900 mt-auto">
                      <div className="text-[10px] font-mono flex items-center justify-between gap-1">
                        <span className="text-slate-500">Prereq:</span>
                        <span className={`text-right truncate ${prereqMet ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {prereqLabel}
                        </span>
                      </div>

                      {isActive ? (
                        <div className="w-full py-1 text-center bg-amber-950/60 border border-amber-800/60 rounded text-[11px] font-mono font-bold text-amber-300 cursor-default">
                          Current Stage
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectStage(stage.id)}
                          className="w-full py-1 rounded text-[11px] font-mono font-bold bg-slate-900 hover:bg-amber-950/80 border border-slate-700 hover:border-amber-600 text-slate-300 hover:text-amber-200 transition-all cursor-pointer"
                        >
                          {stage.id === 'negligible' ? 'Set Baseline' : `Acquire ${stage.name}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expandable Rules Drawer */}
            {isRulesExpanded && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  <Info className="w-4 h-4" />
                  <span>Active Stage Mechanics: {stageInfo.stage.name}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
                  <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Prerequisites</span>
                    <p className="text-slate-300 font-mono text-[11px]">{stageInfo.stage.prerequisites}</p>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Benefit</span>
                    <p className="text-slate-300 text-[11px]">{stageInfo.stage.benefit}</p>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Special &amp; BP Credit</span>
                    <p className="text-slate-300 text-[11px]">{stageInfo.stage.special}</p>
                  </div>
                </div>

                {stageInfo.prerequisiteWarnings.length > 0 && (
                  <div className="p-2.5 rounded bg-amber-950/40 border border-amber-800/80 text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <div className="text-[11px]">
                      {stageInfo.prerequisiteWarnings.map((warn, i) => (
                        <span key={i} className="block">{warn}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BP Credit Tracker Bar */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">Augmentation BP Credit:</span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {bpStats.totalBPSpent} / {bpStats.bpCredit} BP
                  </span>
                  {bpStats.remainingCredit > 0 && (
                    <span className="text-[11px] font-mono text-emerald-400">
                      ({bpStats.remainingCredit} BP Credit Available)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {bpStats.isOverCredit
                    ? `Exceeded credit allowance by ${bpStats.overflowBP} BP. Overflow must be paid with BP or ${bpStats.overflowCreditsEquivalent.toLocaleString()} Credits.`
                    : `Fully covered by the ${stageInfo.stage.name} initial augmentation credit suite.`}
                </p>
              </div>

              <div className="w-full sm:w-48 space-y-1">
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      bpStats.isOverCredit ? 'bg-rose-500' : 'bg-amber-400'
                    }`}
                    style={{
                      width: `${Math.min(100, bpStats.bpCredit > 0 ? (bpStats.totalBPSpent / bpStats.bpCredit) * 100 : (bpStats.totalBPSpent > 0 ? 100 : 0))}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0 BP</span>
                  <span>{bpStats.bpCredit} BP Free Credit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Incompatibility Alert if applicable */}
          {incompatibleAugs.length > 0 && (
            <div className="p-4 bg-rose-950/70 border border-rose-600/90 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-[0_0_15px_rgba(244,63,94,0.15)]">
              <div className="flex items-start sm:items-center gap-3 text-rose-200">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 animate-pulse mt-0.5 sm:mt-0" />
                <div>
                  <p className="font-bold tracking-wide text-rose-100">
                    Stage Warning: {incompatibleAugs.length} installed {incompatibleAugs.length === 1 ? 'augmentation requires' : 'augmentations require'} a higher stage!
                  </p>
                  <p className="text-[11px] text-rose-300/90 mt-0.5">
                    Your operative stage is <strong className="text-white">{stageInfo.stage.name}</strong>. Hardware beyond your stage causes structural rejection until the prerequisite feature is acquired.
                  </p>
                </div>
              </div>
              {stageInfo.stageId !== 'extreme' && (
                <button
                  type="button"
                  onClick={() => {
                    const hasExtreme = incompatibleAugs.some(a => a.stage === 'Extreme');
                    const hasHeavy = incompatibleAugs.some(a => a.stage === 'Heavy');
                    handleSelectStage(hasExtreme ? 'extreme' : (hasHeavy ? 'heavy' : 'augmented'));
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 border border-rose-500 text-rose-100 text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
                >
                  Resolve Stage Feature
                </button>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* SECTION 2: ANATOMICAL BODY CHART (CAPACITY BREAKDOWN) */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="bg-slate-900/90 border border-cyan-900/50 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-cyan-950/80 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Anatomical Body Chart &amp; Capacity Limits</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Each anatomical sector has maximum capacity tolerances. Exceeding limits induces structural failures.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Total Body Nodes:</span>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                  bodyBreakdown.totalNodes > bodyBreakdown.maxNodes
                    ? 'bg-rose-950 border-rose-500 text-rose-300'
                    : 'bg-cyan-950 border-cyan-500/50 text-cyan-300'
                }`}>
                  {bodyBreakdown.totalNodes} / {bodyBreakdown.maxNodes} Nodes
                </span>
              </div>
            </div>

            {/* 6 Anatomical Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BODY_SLOT_KEYS.map((slot) => {
                const IconComponent = slot.icon;
                const slotData = bodyBreakdown.slots[slot.id] || { nodes: 0, items: [] };
                const isOver = slotData.nodes > slot.max;
                const pct = Math.min(100, Math.round((slotData.nodes / slot.max) * 100));

                return (
                  <div
                    key={slot.id}
                    className={`rounded-xl p-3.5 border transition-all ${
                      isOver
                        ? 'bg-rose-950/30 border-rose-600/80 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`w-4 h-4 ${isOver ? 'text-rose-400' : 'text-cyan-400'}`} />
                        <h4 className="font-bold text-slate-200 text-xs">{slot.label}</h4>
                      </div>
                      <span className={`font-mono text-[11px] font-bold ${isOver ? 'text-rose-400' : 'text-slate-300'}`}>
                        {slotData.nodes} / {slot.max} Nodes
                      </span>
                    </div>

                    {/* Progress Meter */}
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800 mb-2">
                      <div
                        className={`h-full transition-all duration-300 ${isOver ? 'bg-rose-500' : 'bg-cyan-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Installed in this slot */}
                    <div className="space-y-1">
                      {slotData.items.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {slotData.items.map((item, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
                            >
                              {item.name || 'Aug'} ({item.calculatedNodes || 1}N)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic font-mono">No hardware installed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AugmentationDiagnosticsModal;
