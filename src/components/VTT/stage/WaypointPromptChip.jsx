/**
 * @file WaypointPromptChip.jsx
 * @description Tactical Objective Waypoint Prompt Chip for ADE Live Studio & VTT.
 * Implements the GM confirmation prompt protocol when an operative token crosses a waypoint zone:
 * Displays waypoint arrival details, linked scene beat, and sensory text preview with 1-click
 * [Confirm & Trigger] or [Dismiss] controls, avoiding disruptive automatic takeovers.
 */

import React from 'react';
import { Flag, Sparkles, Check, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export const WaypointPromptChip = ({
  promptData,
  onConfirm,
  onDismiss,
  onToggleAutoTrigger
}) => {
  if (!promptData) return null;

  const {
    waypoint,
    token,
    linkedBeat,
    readAloudText,
    action = 'REVEAL_BEAT',
    targetScenarioTitle,
    targetScenarioId
  } = promptData;

  const handleConfirm = () => {
    AudioService.playCriticalChime(true);
    if (onConfirm) onConfirm(promptData);
  };

  const handleDismiss = () => {
    AudioService.playTerminalBeep(900, 0.03);
    if (onDismiss) onDismiss();
  };

  // Action theme mapping
  const actionConfig = {
    ADVANCE_SCENARIO: {
      badge: 'SCENARIO SHIFT',
      border: 'border-cyan-500/80 shadow-[0_0_35px_rgba(6,182,212,0.35)]',
      glow: 'bg-cyan-400',
      text: 'text-cyan-300',
      btn: 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]',
      btnLabel: targetScenarioTitle ? `Switch to "${targetScenarioTitle}"` : 'Advance Scenario'
    },
    TRIGGER_AIME: {
      badge: 'AIME NARRATION',
      border: 'border-purple-500/80 shadow-[0_0_35px_rgba(168,85,247,0.35)]',
      glow: 'bg-purple-400',
      text: 'text-purple-300',
      btn: 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]',
      btnLabel: 'Generate AIME Narrative'
    },
    ALERT_GM: {
      badge: 'TACTICAL ALERT',
      border: 'border-rose-500/80 shadow-[0_0_35px_rgba(244,63,94,0.35)]',
      glow: 'bg-rose-400',
      text: 'text-rose-300',
      btn: 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]',
      btnLabel: 'Acknowledge Alert'
    },
    REVEAL_BEAT: {
      badge: 'BEAT REACHED',
      border: 'border-amber-500/70 shadow-[0_0_35px_rgba(245,158,11,0.35)]',
      glow: 'bg-amber-400',
      text: 'text-amber-300',
      btn: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      btnLabel: 'Confirm & Advance Beat'
    }
  };

  const theme = actionConfig[action] || actionConfig.REVEAL_BEAT;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[140] w-full max-w-lg px-4 pointer-events-auto animate-in slide-in-from-top-3 fade-in duration-200 select-none">
      <div className={`bg-[#090e1a]/95 border-2 ${theme.border} rounded-2xl backdrop-blur-xl p-3.5 text-slate-100 font-mono text-xs space-y-2.5`}>
        
        {/* Header Alert Strip */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className={`flex items-center gap-2 ${theme.text} font-bold uppercase tracking-wider text-[11px]`}>
            <span className={`w-2.5 h-2.5 rounded-full ${theme.glow} animate-ping`} />
            <Flag size={14} className={theme.text} />
            <span>Waypoint Arrival Detected</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[9.5px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 ${theme.text} font-bold uppercase tracking-wider`}>
              {theme.badge}
            </span>
            <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
              GM LIVE
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-1.5 font-sans">
          <div className="text-xs text-slate-200 flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-cyan-300 font-mono">{token?.label || token?.name || 'Operative'}</span>
            <span className="text-slate-400 text-xs">reached trigger zone of</span>
            <span className={`font-bold ${theme.text} bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 font-mono`}>
              🚩 {waypoint?.name || 'Objective Waypoint'}
            </span>
          </div>

          {/* Target Scenario Destination (if ADVANCE_SCENARIO) */}
          {action === 'ADVANCE_SCENARIO' && targetScenarioTitle && (
            <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-[11px] text-cyan-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold font-mono">
                <ArrowRight size={13} className="text-cyan-400 shrink-0" />
                <span>Next Scenario:</span>
                <span className="text-white underline decoration-cyan-400">{targetScenarioTitle}</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                AUTO-LOAD
              </span>
            </div>
          )}

          {/* Linked Scene Beat Info */}
          {linkedBeat && (
            <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200 space-y-0.5">
              <div className="font-bold font-mono text-[10px] text-purple-300 uppercase flex items-center gap-1">
                <span>🎯</span> Linked Scene Beat:
              </div>
              <div className="line-clamp-2 italic">{linkedBeat}</div>
            </div>
          )}

          {/* Sensory Read-Aloud Preview */}
          {readAloudText && (
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10.5px] text-slate-300 italic line-clamp-2">
              "{readAloudText}"
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80">
          <label className="flex items-center gap-1.5 text-[10.5px] text-slate-400 hover:text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              defaultChecked={waypoint?.autoTrigger ?? false}
              onChange={(e) => {
                if (onToggleAutoTrigger) onToggleAutoTrigger(waypoint.id, e.target.checked);
              }}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
            />
            <span>Auto-trigger next time</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1"
            >
              <X size={12} />
              <span>Dismiss</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className={`px-4 py-1.5 rounded-xl ${theme.btn} font-mono font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5`}
            >
              <Check size={13} className="stroke-[3]" />
              <span>{theme.btnLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaypointPromptChip;
