/**
 * @file GuidedForgeShell.jsx
 * @description Reusable ADE Guided Asset Creation Shell ("GuidedForgeShell").
 * Powers Phase 1 (Element Forge 5-Stage Dual-Mode Studio) and is architected to host
 * Phase 2 (Weaver Scenarios & Adventure Modules) with identical layout ergonomics.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  ShieldAlert,
  Activity,
  Link2,
  KeyRound
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';

const STATUS_BADGE = {
  complete: {
    ring: 'border-emerald-400 bg-emerald-950/80 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.25)]',
    dot: 'bg-emerald-400',
    label: 'Ready'
  },
  partial: {
    ring: 'border-amber-400/80 bg-amber-950/70 text-amber-300',
    dot: 'bg-amber-400',
    label: 'In Progress'
  },
  empty: {
    ring: 'border-slate-700 bg-slate-900/80 text-slate-400',
    dot: 'bg-slate-600',
    label: 'Needed'
  },
  optional: {
    ring: 'border-slate-800 bg-slate-950/70 text-slate-500',
    dot: 'bg-slate-700',
    label: 'Optional'
  }
};

export default function GuidedForgeShell({
  stages = [],
  activeStageId,
  onSelectStage,
  readiness = {
    score: 0,
    completedPillars: [],
    suggestions: [],
    resonantKeywords: [],
    railguardConflicts: []
  },
  dossierPreview = {},
  headerAssistBar = null,
  children,
  footerLeft = null,
  footerRight = null
}) {
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(true);

  const activeStage = stages.find((s) => s.id === activeStageId) || stages[0];
  const score = readiness?.score ?? 0;

  const scoreColor =
    score >= 80
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/50'
      : score >= 45
      ? 'text-cyan-300 border-cyan-500/40 bg-cyan-950/50'
      : 'text-amber-300 border-amber-500/40 bg-amber-950/50';

  const barColor =
    score >= 80
      ? 'from-emerald-500 to-cyan-400'
      : score >= 45
      ? 'from-cyan-500 to-blue-500'
      : 'from-amber-500 to-orange-500';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#090d16] text-slate-100 select-none">
      {/* ── 1. NON-BLOCKING INTERACTIVE HORIZONTAL STEPPER ── */}
      <div className="px-4 py-2.5 bg-[#0b101b] border-b border-slate-800/90 flex items-center justify-between gap-2 shrink-0 overflow-x-auto">
        <nav aria-label="Guided Creation Stages" className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {stages.map((stage, idx) => {
            const isActive = stage.id === activeStageId;
            const st = STATUS_BADGE[stage.status] || STATUS_BADGE.optional;

            return (
              <React.Fragment key={stage.id}>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1120 + idx * 45, 0.025);
                    onSelectStage?.(stage.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/90 border-cyan-400 text-cyan-100 shadow-[0_0_16px_rgba(6,182,212,0.28)] ring-1 ring-cyan-400/40'
                      : `${st.ring} hover:border-slate-600 hover:text-slate-200`
                  }`}
                  title={`${stage.num}. ${stage.title} — ${stage.subtitle}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black shrink-0 ${
                      stage.status === 'complete'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/60'
                        : isActive
                        ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-300'
                        : 'bg-slate-900 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {stage.status === 'complete' ? '✓' : stage.num}
                  </span>
                  <div className="leading-tight">
                    <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider whitespace-nowrap">
                      {stage.shortTitle || stage.title}
                    </div>
                  </div>
                </button>

                {idx < stages.length - 1 && (
                  <div
                    className={`w-3 sm:w-5 h-[1px] shrink-0 ${
                      stage.status === 'complete' ? 'bg-emerald-500/60' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Compact Readiness & Rail Toggle */}
        <div className="flex items-center gap-2 shrink-0 pl-2">
          <div
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1.5 ${scoreColor}`}
            title="Live Element Readiness Score (Non-blocking)"
          >
            <Activity size={12} />
            <span>{score}% Ready</span>
          </div>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(980, 0.02);
              setIsTelemetryOpen((prev) => !prev);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title={isTelemetryOpen ? 'Collapse Live Dossier Rail' : 'Expand Live Dossier Rail'}
          >
            {isTelemetryOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
          </button>
        </div>
      </div>

      {/* ── 2. DUAL-ZONE BODY: ACTIVE STAGE WORKBENCH + LIVE DOSSIER RAIL ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left/Center Active Stage Viewport */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Stage Banner + Optional Assist Controls */}
          {activeStage && (
            <div className="px-5 py-3 bg-gradient-to-r from-slate-950 via-[#0e1626] to-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
                    Stage {activeStage.num} of {stages.length}
                  </span>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white font-mono">
                    {activeStage.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{activeStage.subtitle}</p>
              </div>
              {headerAssistBar && <div className="flex items-center gap-2 flex-wrap">{headerAssistBar}</div>}
            </div>
          )}

          {/* Scrollable Stage Form */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
            {children}
          </div>
        </div>

        {/* Right Collapsible Live Dossier & Readiness Telemetry Rail */}
        {isTelemetryOpen && (
          <aside className="hidden lg:flex w-80 xl:w-88 shrink-0 border-l border-slate-800/90 bg-[#0b101b]/95 flex-col overflow-y-auto p-4 space-y-4 font-mono">
            {/* Live Assembling Dossier Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] overflow-hidden shadow-lg">
              {dossierPreview.imageUrl ? (
                <div className="h-32 w-full relative overflow-hidden border-b border-slate-800">
                  <img
                    src={dossierPreview.imageUrl}
                    alt={dossierPreview.title || 'Element Preview'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent" />
                </div>
              ) : null}

              <div className="p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                      dossierPreview.pillStyle || 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                    }`}
                  >
                    {dossierPreview.type || 'Element'}
                  </span>

                  {dossierPreview.syncBadge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full border border-cyan-500/40 bg-cyan-950/70 text-cyan-300 font-bold">
                      {dossierPreview.syncBadge}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-white tracking-wide truncate">
                    {dossierPreview.title?.trim() || `Untitled ${dossierPreview.type || 'Element'}`}
                  </h4>
                  {dossierPreview.familyLabel && (
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {dossierPreview.familyLabel}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3">
                  {dossierPreview.pitch?.trim() || (
                    <span className="italic text-slate-500">
                      Author a high-concept pitch in Stage 1 to anchor this dossier...
                    </span>
                  )}
                </p>

                {dossierPreview.tacticalBadge && (
                  <div className="px-2.5 py-1.5 rounded-lg bg-amber-950/50 border border-amber-500/40 text-[10px] text-amber-200 font-bold truncate">
                    ⚖️ {dossierPreview.tacticalBadge}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Link2 size={11} className="text-emerald-400" />
                    <span>{dossierPreview.linkedCount || 0} Linked</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <KeyRound size={11} className="text-amber-400" />
                    <span>{dossierPreview.triggerCount || 0} Triggers</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Readiness Progress Bar & Pillars */}
            <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                  Preflight Readiness
                </span>
                <span className="text-xs font-black text-white">{score}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className={`h-full bg-gradient-to-r ${barColor} transition-all duration-300`}
                  style={{ width: `${score}%` }}
                />
              </div>

              {readiness.completedPillars?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {readiness.completedPillars.map((pillar) => (
                    <span
                      key={pillar}
                      className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1 font-bold"
                    >
                      <CheckCircle2 size={10} />
                      <span>{pillar}</span>
                    </span>
                  ))}
                </div>
              )}

              {readiness.suggestions?.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Suggested Next Polish
                  </div>
                  {readiness.suggestions.slice(0, 3).map((sug, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-400 font-sans leading-snug">
                      <Circle size={9} className="text-cyan-500 mt-1 shrink-0" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Negative Keyword Railguard Conflicts (Critical Alert) */}
            {readiness.railguardConflicts?.length > 0 && (
              <div className="rounded-2xl border border-rose-500/60 bg-rose-950/30 p-3.5 space-y-2 shadow-[0_0_16px_rgba(244,63,94,0.15)]">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-300">
                  <ShieldAlert size={13} className="text-rose-400 shrink-0" />
                  <span>Railguard Conflict Detected</span>
                </div>
                <p className="text-[11px] text-rose-200/90 font-sans leading-snug">
                  Banned negative keywords appear in your current traits or prose:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {readiness.railguardConflicts.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-400/60 text-rose-200 font-bold"
                    >
                      ✕ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resonant Positive Keywords */}
            {readiness.resonantKeywords?.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  <Sparkles size={12} className="text-emerald-400 shrink-0" />
                  <span>Active Resonance</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {readiness.resonantKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 font-bold"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ── 3. UNIFIED GUIDED FOOTER BAR ── */}
      <div className="px-4 py-3 bg-[#0d1117] border-t border-[#0D5C63]/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">{footerLeft}</div>
        <div className="flex items-center gap-2 flex-wrap">{footerRight}</div>
      </div>
    </div>
  );
}
