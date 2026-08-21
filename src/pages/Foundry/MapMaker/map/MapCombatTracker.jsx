import React, { useState } from 'react';
import DraggablePanel from './DraggablePanel';
import { useFolio } from '../../../../context/FolioContext';
import { AudioService } from '../../../../services/audioService';

const MapCombatTracker = ({
  tokens = [],
  activeTurnTokenId = null,
  setActiveTurnTokenId,
  onNextTurn,
  showTracker,
  setShowTracker,
  onSelectToken,
  onUpdateTokenHp,
  onTriggerFloatingText,
  scale = 1,
  position = { x: 0, y: 0 }
}) => {
  const { updateCharacterHp } = useFolio();
  const [customAmounts, setCustomAmounts] = useState({});

  if (!showTracker) return null;

  // Filter tokens that are units (exclude portal links) and sort by initiative descending
  const sortedTokens = [...tokens]
    .filter(t => t.type !== 'link')
    .sort((a, b) => {
      const initA = a.initiative !== undefined && a.initiative !== null ? a.initiative : -99;
      const initB = b.initiative !== undefined && b.initiative !== null ? b.initiative : -99;
      return initB - initA;
    });

  const handleApplyDamageOrHeal = (token, amount, isDamage = true) => {
    if (!token || !token.hp) return;
    const numAmount = Math.max(1, parseInt(amount, 10) || 1);
    const delta = isDamage ? -numAmount : numAmount;
    const currentHp = token.hp.current !== undefined ? token.hp.current : (token.hp.max || 30);
    const maxHp = token.hp.max || 30;
    const newHp = Math.max(0, Math.min(maxHp, currentHp + delta));

    if (onUpdateTokenHp) {
      onUpdateTokenHp(token.id, newHp, isDamage, numAmount);
    } else {
      // Direct fallback if not passed as dedicated handler
      AudioService.playCombatHit(numAmount >= 15);
      if (token.linkedHeroId && updateCharacterHp) {
        updateCharacterHp(token.linkedHeroId, newHp);
      }
    }

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(
        screenX,
        screenY,
        isDamage ? `-${numAmount} HP` : `+${numAmount} HP`,
        isDamage ? 'damage' : 'heal'
      );
    }
  };

  return (
    <DraggablePanel
      id="combat_tracker"
      className="absolute bottom-4 left-4 z-30 w-80 bg-[#161b22]/95 backdrop-blur-md border border-amber-500/60 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.25)] p-3 flex flex-col gap-2 font-sans select-none"
    >
      {/* Header */}
      <div className="drag-handle cursor-grab active:cursor-grabbing flex justify-between items-center pb-1.5 border-b border-amber-500/40">
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
      <div className="max-h-60 overflow-y-auto space-y-1.5 pr-0.5">
        {sortedTokens.length === 0 ? (
          <div className="text-[11px] text-slate-400 italic text-center py-4">
            No active combat units placed.<br />Drag heroes from Folio or add tokens to track initiative and damage.
          </div>
        ) : (
          sortedTokens.map((token) => {
            const isActive = token.id === activeTurnTokenId;
            const hp = token.hp || null;
            const hpRatio = hp && hp.max > 0 ? Math.max(0, Math.min(1, hp.current / hp.max)) : 1;
            const hpColor = hpRatio <= 0.25 ? 'bg-red-500' : (hpRatio <= 0.5 ? 'bg-amber-500' : 'bg-emerald-500');
            const isHero = token.type === 'hero' || !!token.linkedHeroId;

            return (
              <div
                key={token.id}
                onClick={() => {
                  setActiveTurnTokenId(token.id);
                  if (onSelectToken) onSelectToken(token.id);
                }}
                className={`p-2 rounded-lg flex flex-col gap-1.5 cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                    : 'bg-[#0d1117]/80 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                {/* Unit Row Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span className="w-6 text-center font-mono text-[10px] bg-slate-800 text-amber-400 px-1 py-0.5 rounded font-bold shrink-0 border border-amber-500/30">
                      {token.initiative !== undefined && token.initiative !== null ? `#${token.initiative}` : '--'}
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {token.avatarUrl ? (
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-cyan-400 shrink-0">
                          <img src={token.avatarUrl} alt={token.label} className="w-full h-full object-cover" />
                        </div>
                      ) : isHero ? (
                        <span className="text-[11px]">🛡️</span>
                      ) : null}
                      <span className="text-xs truncate font-bold text-slate-200">
                        {token.label || 'Unit'}
                      </span>
                      {isHero && (
                        <span className="text-[8px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-1 py-0.2 rounded font-mono uppercase shrink-0">
                          Hero
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conditions & Defense Badges */}
                  <div className="flex items-center gap-1 shrink-0">
                    {token.defense && (
                      <span className="text-[9px] font-mono px-1 bg-slate-900 border border-slate-700 rounded text-slate-400" title="Armor Defense">
                        🛡️{token.defense}
                      </span>
                    )}
                    {token.conditions?.length > 0 && (
                      <div className="flex gap-0.5">
                        {token.conditions.map(c => (
                          <span key={c} className="text-[8px] px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-slate-300">
                            {c[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* HP Gauge & Quick Actions */}
                {hp && hp.max > 0 && (
                  <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700">
                        <div className={`h-full ${hpColor} transition-all duration-300`} style={{ width: `${hpRatio * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-300 shrink-0">
                        {hp.current}/{hp.max}
                      </span>
                    </div>

                    {/* Quick HP Adjustment Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyDamageOrHeal(token, 5, true);
                        }}
                        className="px-1.5 py-0.5 bg-red-950/90 hover:bg-red-800 text-red-300 border border-red-700/60 rounded text-[9px] font-bold font-mono transition-colors"
                        title="Deal 5 Damage"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyDamageOrHeal(token, 1, true);
                        }}
                        className="px-1.5 py-0.5 bg-red-950/90 hover:bg-red-800 text-red-300 border border-red-700/60 rounded text-[9px] font-bold font-mono transition-colors"
                        title="Deal 1 Damage"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyDamageOrHeal(token, 1, false);
                        }}
                        className="px-1.5 py-0.5 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded text-[9px] font-bold font-mono transition-colors"
                        title="Heal 1 HP"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyDamageOrHeal(token, 5, false);
                        }}
                        className="px-1.5 py-0.5 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded text-[9px] font-bold font-mono transition-colors"
                        title="Heal 5 HP"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </DraggablePanel>
  );
};

export default MapCombatTracker;
