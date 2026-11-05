/**
 * @file Stage2DirectorialLens.jsx
 * @description Stage 2 of Guided Element Forge: Layer 1 Directorial Guidance ("The How").
 * Lets the Architect inherit active Module Gems in 1 click, apply Quick Style Combos,
 * fine-tune canonical AIME Guidance Gems, and configure Positive Resonance & Negative Railguards.
 */

import React from 'react';
import { Sparkles, ShieldAlert, Compass, Zap } from 'lucide-react';
import AimeGuidanceDeck from '../../components/AimeGuidanceDeck';
import {
  QUICK_STYLE_COMBOS,
  inheritGuidanceFromModuleGems,
  parseChipKeywords
} from '../elementPlaybooks';
import { showToast } from '../../../../../context/ToastContext';
import { AudioService } from '../../../../../services/audioService';

export default function Stage2DirectorialLens({
  guidance = {},
  onChangeGuidance,
  fields = {},
  onChangeField,
  moduleGems = [],
  activeScenarioGuidance = null
}) {
  const hasModuleGems =
    (Array.isArray(moduleGems) && moduleGems.length > 0) ||
    (activeScenarioGuidance && Object.keys(activeScenarioGuidance).length > 0);

  const handleInheritModuleGems = () => {
    AudioService.playCriticalChime(true);
    const merged = inheritGuidanceFromModuleGems(
      moduleGems,
      activeScenarioGuidance,
      guidance
    );
    onChangeGuidance?.(merged);
    showToast({
      type: 'success',
      text: 'Inherited active Story Module Directorial Gems!'
    });
  };

  const handleApplyCombo = (combo) => {
    AudioService.playTerminalBeep(1220, 0.03);
    onChangeGuidance?.({
      ...guidance,
      ...combo.guidance
    });
    if (combo.keywords && !fields.keywords) {
      onChangeField?.('keywords', combo.keywords);
    }
    showToast({
      type: 'info',
      text: `Applied "${combo.label}" stylistic lens.`
    });
  };

  const positiveChips = parseChipKeywords(fields.keywords);
  const negativeChips = parseChipKeywords(fields.negative_keywords);

  return (
    <div className="space-y-5">
      {/* ── 1-CLICK ACCELERATOR STRIP: MODULE INHERITANCE & STYLE LENSES ── */}
      <section className="rounded-2xl border border-slate-800 bg-[#0c121e]/95 p-4 space-y-3.5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass size={15} className="text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              Quick Stylistic Presets
            </span>
          </div>

          <button
            type="button"
            disabled={!hasModuleGems}
            onClick={handleInheritModuleGems}
            className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-400/60 text-purple-200 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
            title={
              hasModuleGems
                ? 'Copy Genre, Tone, Pacing & Mood Gems from the active Story Module'
                : 'No Module Gems configured yet in Story Weaver'
            }
          >
            <Zap size={13} className="text-amber-400" />
            <span>Inherit Active Module Gems</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5">
          {QUICK_STYLE_COMBOS.map((combo) => {
            const isMatched =
              guidance.genre === combo.guidance.genre &&
              guidance.tone === combo.guidance.tone &&
              guidance.Mood === combo.guidance.Mood;

            return (
              <button
                key={combo.id}
                type="button"
                onClick={() => handleApplyCombo(combo)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isMatched
                    ? 'bg-cyan-950/85 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/75 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{combo.icon}</span>
                  <span className="text-xs font-mono font-bold truncate">{combo.label}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {combo.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── CANONICAL 6-GEM + EXTENDED GEMS DECK ── */}
      <AimeGuidanceDeck
        guidance={guidance}
        onChangeGuidance={onChangeGuidance}
        isCollapsedByDefault={false}
      />

      {/* ── POSITIVE RESONANCE KEYWORDS & NEGATIVE RAILGUARDS ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positive Resonance */}
        <div className="rounded-2xl border border-emerald-500/30 bg-[#0c121e]/95 p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" />
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              Positive Thematic Keywords
            </label>
          </div>
          <p className="text-[11px] text-slate-400">
            Motifs and sensory anchors AIME should weave into traits and prose (tracked live in the Resonance Rail).
          </p>
          <input
            type="text"
            value={fields.keywords || ''}
            onChange={(e) => onChangeField?.('keywords', e.target.value)}
            placeholder="e.g. rain-slicked, brass telemetry, zero-g, syndicate"
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 text-emerald-100 p-2.5 rounded-xl text-xs outline-none font-mono"
          />
          {positiveChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {positiveChips.map((kw) => (
                <span
                  key={kw}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                >
                  +{kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Negative Railguards */}
        <div className="rounded-2xl border border-rose-500/30 bg-[#0c121e]/95 p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-rose-400" />
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
              Negative Railguards (Banned Tropes)
            </label>
          </div>
          <p className="text-[11px] text-slate-400">
            Strict exclusions enforced during AI drafting and flagged immediately if detected in prose.
          </p>
          <input
            type="text"
            value={fields.negative_keywords || ''}
            onChange={(e) => onChangeField?.('negative_keywords', e.target.value)}
            placeholder="e.g. time travel, comedic slapstick, medieval elves"
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-400 text-rose-100 p-2.5 rounded-xl text-xs outline-none font-mono"
          />
          {negativeChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {negativeChips.map((nk) => (
                <span
                  key={nk}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/40 text-rose-300"
                >
                  −{nk}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
