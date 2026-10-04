/**
 * @file GraphPlaySimulator.jsx
 * @description Interactive Story Playhead Walkthrough Simulator for ADE Story Graph.
 * Allows architects to test-drive their scenario decisions, perform 2d10 dice checks,
 * trace animated flow wires, and review progression breadcrumbs directly on the canvas.
 */

import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  X, 
  Dices, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ChevronRight, 
  ShieldAlert, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { rollDice } from '../../../../../services/diceService';
import { AudioService } from '../../../../../services/audioService';

export const GraphPlaySimulator = ({
  isActive = false,
  currentNode = null,
  allNodes = [],
  historyTrail = [],
  onSelectNode,
  onAdvanceNode,
  onRewindToStep,
  onResetSimulation,
  onClose
}) => {
  const [activeCheckResult, setActiveCheckResult] = useState(null);

  if (!isActive || !currentNode) return null;

  // Extract choices & outgoing branch options from current node
  const choices = currentNode.fields?.choices || [];
  const connections = currentNode.fields?.connections || [];

  // Deduplicate options
  const availableOptions = [];
  choices.forEach(c => {
    const tgt = allNodes.find(n => n.id === c.targetScenarioId);
    if (tgt) {
      availableOptions.push({
        id: c.id,
        label: c.text || 'Choice',
        targetId: c.targetScenarioId,
        targetTitle: tgt.title,
        checkDc: c.checkDc,
        attribute: c.attribute,
        type: 'choice'
      });
    }
  });

  connections.forEach(conn => {
    const tgt = allNodes.find(n => n.id === conn.targetId);
    if (tgt && !availableOptions.some(o => o.targetId === conn.targetId)) {
      availableOptions.push({
        id: conn.id,
        label: conn.label || 'Advance ❯',
        targetId: conn.targetId,
        targetTitle: tgt.title,
        checkDc: conn.checkDc,
        attribute: conn.attribute,
        type: 'branch'
      });
    }
  });

  const handleExecuteOption = (opt) => {
    if (opt.checkDc) {
      // Perform 2d10 dice check
      const rollRes = rollDice('2d10');
      const baseAttr = 2; // Default operative base modifier
      const finalScore = rollRes.total + baseAttr;
      const isSuccess = finalScore >= opt.checkDc;

      const result = {
        option: opt,
        roll: rollRes.total,
        finalScore,
        dc: opt.checkDc,
        isSuccess,
        attribute: opt.attribute || 'check'
      };

      setActiveCheckResult(result);
      if (isSuccess) {
        AudioService.playCriticalChime(true);
      } else {
        AudioService.playTerminalBeep(400, 0.1);
      }
      return;
    }

    // Direct progression
    AudioService.playTerminalBeep(1300, 0.03);
    setActiveCheckResult(null);
    if (onAdvanceNode) onAdvanceNode(opt.targetId);
  };

  const handleConfirmCheckOutcome = (proceed) => {
    if (proceed && activeCheckResult) {
      onAdvanceNode(activeCheckResult.option.targetId);
    }
    setActiveCheckResult(null);
  };

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-[94%] bg-[#080d18]/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.25)] p-3 px-4 font-mono select-none flex flex-col gap-2.5 animate-in slide-in-from-bottom duration-200">
      
      {/* Top Strip: Current Head & History Trail */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px]">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 min-w-0 pr-2">
          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40 shrink-0 flex items-center gap-1">
            <Play size={10} />
            <span>PLAYHEAD</span>
          </span>

          {historyTrail.map((hId, idx) => {
            const hNode = allNodes.find(n => n.id === hId);
            const isLast = idx === historyTrail.length - 1;
            return (
              <React.Fragment key={idx}>
                <button
                  type="button"
                  onClick={() => onRewindToStep && onRewindToStep(idx)}
                  className={`truncate max-w-[110px] transition-colors cursor-pointer ${
                    isLast ? 'text-emerald-300 font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={`Rewind to: ${hNode?.title}`}
                >
                  {hNode?.title || 'Scene'}
                </button>
                {!isLast && <ChevronRight size={10} className="text-slate-600 shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Controls: Reset & Exit */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onResetSimulation}
            className="p-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-750 flex items-center gap-1 text-[9px] cursor-pointer"
            title="Reset to Root Scene"
          >
            <RotateCcw size={10} />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-750 cursor-pointer"
            title="Exit Simulator Mode"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Middle: Active Scene Title & Prose snippet */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-100 uppercase tracking-wide truncate flex items-center gap-1.5">
            <span className="text-emerald-400">●</span>
            <span>{currentNode.title || 'Untitled Scenario'}</span>
          </div>
          <p className="text-[10.5px] font-sans text-slate-300 italic line-clamp-1 mt-0.5">
            {currentNode.content?.replace(/<[^>]*>/g, '').slice(0, 140) || 'Sensory narrative briefing commencement...'}
          </p>
        </div>

        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9.5px] text-slate-400 shrink-0 uppercase">
          {currentNode.type || 'Scene'}
        </span>
      </div>

      {/* Check Result Banner (When dice check is active) */}
      {activeCheckResult && (
        <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs animate-in zoom-in-95 duration-150 ${
          activeCheckResult.isSuccess
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
            : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <Dices size={16} className={activeCheckResult.isSuccess ? 'text-emerald-400' : 'text-rose-400'} />
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <span>{activeCheckResult.isSuccess ? 'CHECK SUCCESS' : 'CHECK FAILED'}</span>
                <span>•</span>
                <span className="text-[10px] opacity-80">
                  Rolled {activeCheckResult.roll} + 2 = {activeCheckResult.finalScore} vs CR {activeCheckResult.dc}
                </span>
              </div>
              <div className="text-[10px] opacity-75 font-sans">
                {activeCheckResult.option.label}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleConfirmCheckOutcome(true)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] cursor-pointer"
            >
              Advance ➔
            </button>
            <button
              type="button"
              onClick={() => handleConfirmCheckOutcome(false)}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-lg text-[10px] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bottom: Available Branch Decisions */}
      {!activeCheckResult && (
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          {availableOptions.length > 0 ? (
            availableOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleExecuteOption(opt)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950 border border-slate-750 hover:border-cyan-500/60 text-slate-200 hover:text-cyan-200 text-[11px] font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all shadow-md group"
              >
                <span>{opt.label}</span>
                {opt.checkDc ? (
                  <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[9px]">
                    CR {opt.checkDc}
                  </span>
                ) : (
                  <ArrowRight size={11} className="text-slate-500 group-hover:text-cyan-300 transition-colors" />
                )}
              </button>
            ))
          ) : (
            <div className="text-[10.5px] text-slate-500 italic py-1">
              End of Branch Path: No further choices or scenario exits defined.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(GraphPlaySimulator);
