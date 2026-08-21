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
  onUpdateTokenHealth,
  onUpdateTokenVitality,
  onUpdateTokenHp,
  onTriggerFloatingText,
  scale = 1,
  position = { x: 0, y: 0 }
}) => {
  const { updateCharacterHealth, updateCharacterVitality, updateCharacterHp } = useFolio();

  if (!showTracker) return null;

  // Filter tokens that are units (exclude portal links) and sort by initiative descending
  const sortedTokens = [...tokens]
    .filter(t => t.type !== 'link')
    .sort((a, b) => {
      const initA = a.initiative !== undefined && a.initiative !== null ? a.initiative : -99;
      const initB = b.initiative !== undefined && b.initiative !== null ? b.initiative : -99;
      return initB - initA;
    });

  const handleApplyHealthChange = (token, amount, isDamage = true) => {
    const numAmount = Math.max(1, parseInt(amount, 10) || 1);
    const health = token.health || token.hp || { current: 30, max: 30 };
    const currentHealth = health.current !== undefined ? health.current : 30;
    const maxHealth = health.max || 30;
    const delta = isDamage ? -numAmount : numAmount;
    const newHealth = Math.max(0, Math.min(maxHealth, currentHealth + delta));

    if (onUpdateTokenHealth) {
      onUpdateTokenHealth(token.id, newHealth, isDamage, numAmount);
    } else if (onUpdateTokenHp) {
      onUpdateTokenHp(token.id, newHealth, isDamage, numAmount);
    } else {
      AudioService.playCombatHit(numAmount >= 15);
      if (token.linkedHeroId) {
        if (updateCharacterHealth) updateCharacterHealth(token.linkedHeroId, newHealth);
        else if (updateCharacterHp) updateCharacterHp(token.linkedHeroId, newHealth);
      }
    }

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(
        screenX,
        screenY,
        isDamage ? `-${numAmount} HEALTH` : `+${numAmount} HEALTH`,
        isDamage ? 'damage' : 'heal'
      );
    }
  };

  const handleApplyVitalityChange = (token, amount, isDamage = true) => {
    const numAmount = Math.max(1, parseInt(amount, 10) || 1);
    const vitality = token.vitality || { current: 30, max: 30 };
    const currentVitality = vitality.current !== undefined ? vitality.current : 30;
    const maxVitality = vitality.max || 30;
    const delta = isDamage ? -numAmount : numAmount;
    const newVitality = Math.max(0, Math.min(maxVitality, currentVitality + delta));

    if (onUpdateTokenVitality) {
      onUpdateTokenVitality(token.id, newVitality, isDamage, numAmount);
    } else {
      AudioService.playCombatHit(false);
      if (token.linkedHeroId && updateCharacterVitality) {
        updateCharacterVitality(token.linkedHeroId, newVitality);
      }
    }

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(
        screenX,
        screenY,
        isDamage ? `-${numAmount} VIT` : `+${numAmount} VIT`,
        isDamage ? 'vitality_damage' : 'vitality_heal'
      );
    }
  };

  return (
    <DraggablePanel
      id="combat_tracker"
      className="absolute bottom-4 left-4 z-30 w-84 bg-[#161b22]/95 backdrop-blur-md border border-amber-500/60 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.25)] p-3 flex flex-col gap-2 font-sans select-none"
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
      <div className="max-h-68 overflow-y-auto space-y-2 pr-0.5">
        {sortedTokens.length === 0 ? (
          <div className="text-[11px] text-slate-400 italic text-center py-4">
            No active combat units placed.<br />Drag heroes from Folio or add tokens to track initiative, Health & Vitality.
          </div>
        ) : (
          sortedTokens.map((token) => {
            const isActive = token.id === activeTurnTokenId;
            const health = token.health || token.hp || null;
            const vitality = token.vitality || null;
            
            const healthRatio = health && health.max > 0 ? Math.max(0, Math.min(1, health.current / health.max)) : 1;
            const healthColor = healthRatio <= 0.25 ? 'bg-red-500' : (healthRatio <= 0.5 ? 'bg-amber-500' : 'bg-emerald-500');

            const vitalityRatio = vitality && vitality.max > 0 ? Math.max(0, Math.min(1, vitality.current / vitality.max)) : 1;
            const vitalityColor = vitalityRatio <= 0.25 ? 'bg-purple-600' : 'bg-cyan-400';

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

                {/* Health Gauge & Controls (Physical) */}
                {health && health.max > 0 && (
                  <div className="flex items-center justify-between gap-1.5 pt-0.5 border-t border-slate-800/80">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase w-7">HLTH:</span>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700">
                        <div className={`h-full ${healthColor} transition-all duration-300`} style={{ width: `${healthRatio * 100}%` }} />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-300 shrink-0">
                        {health.current}/{health.max}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyHealthChange(token, 5, true);
                        }}
                        className="px-1 py-0.5 bg-red-950/90 hover:bg-red-800 text-red-300 border border-red-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                        title="Deal 5 Physical Damage"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyHealthChange(token, 1, true);
                        }}
                        className="px-1 py-0.5 bg-red-950/90 hover:bg-red-800 text-red-300 border border-red-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                        title="Deal 1 Physical Damage"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyHealthChange(token, 1, false);
                        }}
                        className="px-1 py-0.5 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                        title="Heal 1 Health"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyHealthChange(token, 5, false);
                        }}
                        className="px-1 py-0.5 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                        title="Heal 5 Health"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                )}

                {/* Vitality Gauge & Controls (Mental / Energy) */}
                {vitality && vitality.max > 0 && (
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <span className="text-[8px] font-mono font-bold text-cyan-400 uppercase w-7">VIT:</span>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700">
                        <div className={`h-full ${vitalityColor} transition-all duration-300`} style={{ width: `${vitalityRatio * 100}%` }} />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-cyan-300 shrink-0">
                        {vitality.current}/{vitality.max}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyVitalityChange(token, 5, true);
                        }}
                        className="px-1 py-0.5 bg-purple-950/90 hover:bg-purple-800 text-purple-300 border border-purple-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                        title="Drain 5 Vitality"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyVitalityChange(token, 1, true);
                        }}
                        className="px-1 py-0.5 bg-purple-950/90 hover:bg-purple-800 text-purple-300 border border-purple-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                        title="Drain 1 Vitality"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyVitalityChange(token, 1, false);
                        }}
                        className="px-1 py-0.5 bg-cyan-950/90 hover:bg-cyan-800 text-cyan-300 border border-cyan-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                        title="Restore 1 Vitality"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyVitalityChange(token, 5, false);
                        }}
                        className="px-1 py-0.5 bg-cyan-950/90 hover:bg-cyan-800 text-cyan-300 border border-cyan-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                        title="Restore 5 Vitality"
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
