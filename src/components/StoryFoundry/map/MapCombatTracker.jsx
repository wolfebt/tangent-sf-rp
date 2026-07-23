import React from 'react';

const MapCombatTracker = ({
  tokens = [],
  activeTurnTokenId = null,
  setActiveTurnTokenId,
  onNextTurn,
  showTracker,
  setShowTracker,
  onSelectToken
}) => {
  if (!showTracker) return null;

  // Filter tokens that are units (exclude portal links) and sort by initiative descending
  const sortedTokens = [...tokens]
    .filter(t => t.type !== 'link')
    .sort((a, b) => {
      const initA = a.initiative !== undefined && a.initiative !== null ? a.initiative : -99;
      const initB = b.initiative !== undefined && b.initiative !== null ? b.initiative : -99;
      return initB - initA;
    });

  return (
    <div className="absolute bottom-4 left-4 z-30 w-72 bg-[#161b22]/95 backdrop-blur-md border border-amber-500/60 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.25)] p-3 flex flex-col gap-2 font-sans select-none">
      {/* Header */}
      <div className="flex justify-between items-center pb-1.5 border-b border-amber-500/40">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⚔️</span>
          <h3 className="font-bold text-xs uppercase tracking-wider text-amber-300">
            Tactical Combat Tracker
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onNextTurn}
            disabled={sortedTokens.length === 0}
            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded uppercase transition-colors disabled:opacity-50"
            title="Advance to Next Unit Turn"
          >
            Next ⏭️
          </button>
          <button
            onClick={() => setShowTracker(false)}
            className="text-slate-400 hover:text-red-400 text-sm font-bold leading-none px-1"
            title="Close Combat Tracker"
          >
            ×
          </button>
        </div>
      </div>

      {/* Turn Order List */}
      <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
        {sortedTokens.length === 0 ? (
          <div className="text-[11px] text-slate-400 italic text-center py-3">
            No active combat units placed.<br />Add tokens and set Initiative to track turns.
          </div>
        ) : (
          sortedTokens.map((token) => {
            const isActive = token.id === activeTurnTokenId;
            const hp = token.hp || null;
            const hpRatio = hp && hp.max > 0 ? Math.max(0, Math.min(1, hp.current / hp.max)) : 1;
            const hpColor = hpRatio <= 0.25 ? 'bg-red-500' : (hpRatio <= 0.5 ? 'bg-amber-500' : 'bg-emerald-500');

            return (
              <div
                key={token.id}
                onClick={() => {
                  setActiveTurnTokenId(token.id);
                  if (onSelectToken) onSelectToken(token.id);
                }}
                className={`p-2 rounded flex items-center justify-between cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)] font-bold'
                    : 'bg-[#0d1117]/80 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <span className="w-5 text-center font-mono text-[10px] bg-slate-800 text-amber-400 px-1 py-0.5 rounded font-bold shrink-0">
                    {token.initiative !== undefined && token.initiative !== null ? `#${token.initiative}` : '--'}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs truncate font-semibold">{token.label || 'Unit'}</span>
                    {hp && hp.max > 0 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                          <div className={`h-full ${hpColor}`} style={{ width: `${hpRatio * 100}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">
                          {hp.current}/{hp.max}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Condition Markers Count */}
                {token.conditions?.length > 0 && (
                  <div className="flex gap-1 shrink-0">
                    {token.conditions.map(c => (
                      <span key={c} className="text-[9px] px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-slate-300">
                        {c[0]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MapCombatTracker;
