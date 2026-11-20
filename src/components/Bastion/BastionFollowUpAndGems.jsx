import React, { useState } from 'react';

/**
 * Compact per-turn Follow-Up Appends toggle & Continuation Gems bar for BASTION messages.
 *  - `followUps` are generated with every turn's content, but stay hidden until "Follow up"
 *    is clicked so the main chat UI stays compact and scannable.
 *  - `gems` provide one-click continuation chips anchored to the specific points of the reply
 *    (or an explicit "Extrapolate via Modular Matrix" opt-in when BASTION halts on missing data).
 */
export const BastionFollowUpAndGems = ({
  followUps = [],
  gems = [],
  isHalted = false,
  disabled = false,
  compact = false,
  onSelectPrompt,
}) => {
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);

  const validFollowUps = Array.isArray(followUps) ? followUps.filter(Boolean) : [];
  const validGems = Array.isArray(gems)
    ? gems.filter((g) => g && (g.label || g.point) && g.prompt)
    : [];

  if (validFollowUps.length === 0 && validGems.length === 0) {
    return null;
  }

  const handleTrigger = (promptText) => {
    if (disabled || !promptText || typeof onSelectPrompt !== 'function') return;
    onSelectPrompt(promptText);
  };

  return (
    <div
      className={`${
        compact ? 'mt-1.5 pt-1.5' : 'mt-2.5 pt-2'
      } border-t border-slate-800/80 space-y-1.5 font-sans`}
    >
      {/* Compact Row: Collapsible "Follow up" Trigger + Content Continuation Gems */}
      <div className="flex flex-wrap items-center gap-1">
        {validFollowUps.length > 0 && (
          <button
            type="button"
            onClick={() => setIsFollowUpOpen((prev) => !prev)}
            aria-expanded={isFollowUpOpen}
            className={`px-2 py-0.5 rounded border font-mono font-semibold tracking-tight transition-colors flex items-center gap-1 cursor-pointer ${
              compact ? 'text-[9px]' : 'text-[10px]'
            } ${
              isFollowUpOpen
                ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200'
                : 'bg-slate-950/90 hover:bg-indigo-950/60 border-slate-700/80 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-200'
            }`}
            title="Show pre-generated follow-up questions & trade-offs for this turn"
          >
            <span>{isFollowUpOpen ? '▾' : '▸'}</span>
            <span>Follow up ({validFollowUps.length})</span>
          </button>
        )}

        {validGems.map((gem, idx) => {
          const isExtrapolateGem =
            isHalted && /extrapolate/i.test(`${gem.label} ${gem.prompt}`);
          return (
            <button
              key={`${gem.label}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => handleTrigger(gem.prompt)}
              className={`px-1.5 py-0.5 rounded border font-mono transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                compact ? 'text-[9px]' : 'text-[10px]'
              } ${
                isExtrapolateGem
                  ? 'bg-amber-950/80 hover:bg-amber-900/80 border-amber-500/60 text-amber-200 font-semibold'
                  : 'bg-slate-950/90 hover:bg-cyan-950/80 border-slate-700/80 hover:border-cyan-500/50 text-cyan-300'
              }`}
              title={gem.prompt}
            >
              <span className={isExtrapolateGem ? 'text-amber-400' : 'text-cyan-400'}>◆</span>
              <span className="truncate max-w-[190px]">{gem.label}</span>
            </button>
          );
        })}
      </div>

      {/* Collapsible Follow-Up Appends Panel (Rendered ONLY when "Follow up" is clicked) */}
      {isFollowUpOpen && validFollowUps.length > 0 && (
        <div className="p-2 rounded bg-slate-950/95 border border-indigo-900/60 space-y-1.5">
          {validFollowUps.map((q, qIdx) => (
            <div
              key={qIdx}
              className="flex items-start justify-between gap-2 text-[10.5px] text-slate-300 leading-snug"
            >
              <span className="flex-1">• {q}</span>
              {typeof onSelectPrompt === 'function' && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTrigger(q)}
                  className="px-1.5 py-0.5 rounded bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 font-mono text-[9px] shrink-0 cursor-pointer disabled:opacity-50"
                  title="Explore this follow-up in chat"
                >
                  Explore →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BastionFollowUpAndGems;
