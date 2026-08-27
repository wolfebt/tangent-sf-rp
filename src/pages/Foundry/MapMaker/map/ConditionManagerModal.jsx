import React, { useState } from 'react';
import { CANONICAL_CONDITIONS, getConditionDefinition, applyConditionToToken, removeConditionFromToken, evaluateTokenConditionsOnTurnStart } from '../../../../services/conditionService';
import AudioService from '../../../../services/audioService';

const CATEGORY_FILTERS = ['All', 'Trauma', 'Thermal', 'Chemical', 'Impairment', 'Neural', 'Environmental', 'Metaphysics', 'Defense', 'Mortality'];

const ConditionManagerModal = ({
  isOpen,
  onClose,
  selectedToken,
  onUpdateToken,
  onTriggerFloatingText,
  currentRound = 1,
  onBroadcastMessage
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customLabel, setCustomLabel] = useState('');
  const [customDuration, setCustomDuration] = useState(3);
  const [customDamage, setCustomDamage] = useState(0);
  const [customColor, setCustomColor] = useState('#3b82f6');
  const [customIcon, setCustomIcon] = useState('✨');

  if (!isOpen || !selectedToken) return null;

  const activeConds = Array.isArray(selectedToken.conditions) ? selectedToken.conditions : [];
  const conditionDetails = selectedToken.conditionDetails || {};

  const handleToggleOrApply = (cond) => {
    const isAlreadyActive = activeConds.includes(cond.label) || activeConds.includes(cond.id);
    AudioService.playTerminalBeep(isAlreadyActive ? 400 : 780, 0.1);

    if (isAlreadyActive) {
      const updated = removeConditionFromToken(selectedToken, cond.label);
      onUpdateToken?.(selectedToken.id, updated);
      if (onTriggerFloatingText) {
        onTriggerFloatingText(selectedToken.x, selectedToken.y, `Cured: ${cond.label}`, 'heal');
      }
    } else {
      const updated = applyConditionToToken(selectedToken, cond.id, cond.defaultDuration, {
        round: currentRound,
        damage: cond.defaultDamage
      });
      onUpdateToken?.(selectedToken.id, updated);
      if (onTriggerFloatingText) {
        onTriggerFloatingText(selectedToken.x, selectedToken.y, `Afflicted: ${cond.label}`, 'damage');
      }
    }
  };

  const handleAdjustDuration = (condLabel, delta) => {
    const detail = conditionDetails[condLabel] || { duration: 3 };
    const curDur = detail.duration !== null && detail.duration !== undefined ? detail.duration : 3;
    const newDur = Math.max(1, curDur + delta);
    AudioService.playTerminalBeep(550, 0.05);

    const updated = {
      ...selectedToken,
      conditionDetails: {
        ...conditionDetails,
        [condLabel]: { ...detail, duration: newDur }
      }
    };
    onUpdateToken?.(selectedToken.id, updated);
  };

  const handleManualTick = () => {
    AudioService.playCombatHit(true);
    const { updatedToken, triggeredEffects, expiredConditions } = evaluateTokenConditionsOnTurnStart(selectedToken, { round: currentRound });
    onUpdateToken?.(selectedToken.id, updatedToken);

    triggeredEffects.forEach((eff, idx) => {
      setTimeout(() => {
        if (onTriggerFloatingText) {
          onTriggerFloatingText(selectedToken.x, selectedToken.y, eff.message, eff.sfx === 'heal' ? 'heal' : 'damage');
        }
      }, idx * 150);
    });

    if (onBroadcastMessage && triggeredEffects.length > 0) {
      const summary = triggeredEffects.map(e => e.message).join(' | ');
      onBroadcastMessage(`[TACTICAL AFFLICTION TICK]: ${selectedToken.label || 'Unit'} processed turn start: ${summary}`);
    }
  };

  const handleQuickStabilize = () => {
    AudioService.playTerminalBeep(880, 0.2);
    let updated = { ...selectedToken };
    ['Bleeding', 'Burning', 'Poisoned', "Death's Door"].forEach(c => {
      updated = removeConditionFromToken(updated, c);
    });
    updated = applyConditionToToken(updated, 'Stabilized');
    updated.isAtDeathsDoor = false;
    updated.isStabilized = true;
    updated.deathClock = null;

    onUpdateToken?.(selectedToken.id, updated);
    if (onTriggerFloatingText) {
      onTriggerFloatingText(selectedToken.x, selectedToken.y, `🩹 TRAUMA STABILIZED & CLOTTED`, 'heal');
    }
  };

  const handleClearAll = () => {
    AudioService.playTerminalBeep(440, 0.15);
    const updated = {
      ...selectedToken,
      conditions: [],
      conditionDetails: {}
    };
    onUpdateToken?.(selectedToken.id, updated);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customLabel.trim()) return;
    AudioService.playTerminalBeep(800, 0.12);

    const updated = applyConditionToToken(selectedToken, customLabel.trim(), customDuration, {
      damage: customDamage,
      icon: customIcon,
      color: customColor,
      custom: true
    });
    onUpdateToken?.(selectedToken.id, updated);
    setCustomLabel('');
  };

  const filteredConditions = CANONICAL_CONDITIONS.filter(c => {
    if (selectedCategory === 'All') return true;
    return c.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <div className="bg-[#12161f] border border-cyan-500/50 rounded-xl p-5 w-full max-w-2xl shadow-[0_0_40px_rgba(6,182,212,0.25)] text-white flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              {selectedToken.icon || '👤'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-cyan-300">
                  Condition & Affliction State Machine
                </h3>
                <span className="text-[10px] bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 px-2 py-0.5 rounded-full font-mono">
                  RND {currentRound}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target: <span className="text-amber-300 font-semibold">{selectedToken.label || 'Operative'}</span>
                {selectedToken.isSynthetic ? <span className="ml-2 text-cyan-400 font-mono text-[11px]">[🤖 Synthetic Chassis]</span> : <span className="ml-2 text-emerald-400 font-mono text-[11px]">[🧬 Biological Operative]</span>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 text-2xl font-bold leading-none px-2 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Quick Batch Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/60">
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualTick}
              className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/60 rounded text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              ⚡ Trigger Turn Tick Now
            </button>
            <button
              onClick={handleQuickStabilize}
              className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/60 rounded text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              🩹 Quick Stabilize & Clot
            </button>
          </div>

          <button
            onClick={handleClearAll}
            className="px-2.5 py-1 text-slate-400 hover:text-red-300 text-[11px] underline decoration-slate-600"
          >
            Clear All
          </button>
        </div>

        {/* Body Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[480px] pr-1">
          {/* Left Column: Currently Active Afflictions */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs uppercase font-bold text-slate-300 flex items-center justify-between">
              <span>Active Afflictions ({activeConds.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Ticks at Turn Start</span>
            </h4>

            {activeConds.length === 0 ? (
              <div className="p-6 rounded-lg border border-dashed border-slate-700/60 bg-slate-900/40 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1.5 min-h-[140px]">
                <span className="text-2xl opacity-40">🛡️</span>
                <span>Unit is currently clear of all active status afflictions.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {activeConds.map((condLabel) => {
                  const def = getConditionDefinition(condLabel);
                  const detail = conditionDetails[condLabel] || {};
                  const duration = detail.duration !== undefined ? detail.duration : def?.defaultDuration;
                  const damage = detail.damage !== undefined ? detail.damage : def?.defaultDamage;
                  const icon = detail.icon || def?.icon || '⚡';
                  const color = detail.color || def?.color || '#38bdf8';

                  return (
                    <div
                      key={condLabel}
                      className="p-2.5 rounded-lg bg-slate-900/80 border flex flex-col gap-1.5 transition-all"
                      style={{ borderColor: `${color}60` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{icon}</span>
                          <span className="text-xs font-bold" style={{ color }}>{condLabel}</span>
                          {def?.category && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                              {def.category}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleToggleOrApply(def || { label: condLabel, id: condLabel })}
                          className="text-xs text-slate-400 hover:text-red-400 px-1.5 py-0.5 rounded hover:bg-red-950/40"
                          title="Cure Condition"
                        >
                          ✕
                        </button>
                      </div>

                      {def?.description && (
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {def.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-300">
                        {damage > 0 ? (
                          <span className="text-amber-400 font-mono text-[10px]">
                            🔥 -{damage} {def?.targetPool?.toUpperCase() || 'HP'}/rnd
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">No per-turn dmg</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Duration:</span>
                          {duration !== null && duration !== undefined ? (
                            <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                              <button
                                onClick={() => handleAdjustDuration(condLabel, -1)}
                                className="text-slate-400 hover:text-white text-xs font-bold px-1"
                              >
                                -
                              </button>
                              <span className="text-cyan-300 font-mono text-[10px] min-w-[16px] text-center font-bold">
                                {duration}r
                              </span>
                              <button
                                onClick={() => handleAdjustDuration(condLabel, 1)}
                                className="text-slate-400 hover:text-white text-xs font-bold px-1"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px]">Permanent</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Palette & Custom Creator */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs uppercase font-bold text-slate-300">
              Apply New Condition
            </h4>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {CATEGORY_FILTERS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Conditions Grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {filteredConditions.map(cond => {
                const isActive = activeConds.includes(cond.label) || activeConds.includes(cond.id);

                return (
                  <button
                    key={cond.id}
                    onClick={() => handleToggleOrApply(cond)}
                    className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all text-xs ${
                      isActive
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{cond.icon}</span>
                      {isActive && <span className="text-[10px] text-cyan-400 font-bold">ACTIVE</span>}
                    </div>
                    <span className="font-semibold truncate">{cond.label}</span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {cond.defaultDamage > 0 ? `-${cond.defaultDamage} ${cond.targetPool}/r` : (cond.defaultDuration ? `${cond.defaultDuration} rnds` : 'Passive')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Condition Mini-Form */}
            <form onSubmit={handleAddCustom} className="mt-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/60 flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Custom Condition</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Condition Name..."
                  className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(parseInt(e.target.value, 10) || 1)}
                  placeholder="Rnds"
                  title="Duration in Rounds"
                  className="w-14 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-center text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!customLabel.trim()}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-black font-bold text-xs rounded transition-all"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionManagerModal;
