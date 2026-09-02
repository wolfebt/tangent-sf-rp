import React, { useState, useMemo } from 'react';
import { CANONICAL_AOE_PRESETS, getAoEPreset, getTokensInCircle, getTokensInCone, getTokensInLine, resolveAoEImpact } from '../../../../services/aoeHazardService';
import { applyConditionToToken } from '../../../../services/conditionService';
import AudioService from '../../../../services/audioService';

const AoEResolutionModal = ({
  isOpen,
  onClose,
  tokens = [],
  activeTokenId = null,
  onApplyAoEImpact,
  onUpdateToken,
  onTriggerFloatingText,
  scale = 1,
  position = { x: 0, y: 0 },
  onBroadcastMessage
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState('frag_grenade');
  const [originTokenId, setOriginTokenId] = useState(activeTokenId || (tokens[0]?.id || null));
  const [customRadius, setCustomRadius] = useState(null);
  const [coneDirectionAngle, setConeDirectionAngle] = useState(0); // degrees
  const [saveRolls, setSaveRolls] = useState({}); // { [tokenId]: number }
  const [isDetonating, setIsDetonating] = useState(false);

  const preset = useMemo(() => getAoEPreset(selectedPresetId), [selectedPresetId]);
  const originToken = useMemo(() => tokens.find(t => t.id === originTokenId) || tokens[0], [tokens, originTokenId]);

  // Compute affected tokens in geometric blast zone
  const affectedResults = useMemo(() => {
    if (!originToken) return [];
    const originPoint = { x: originToken.x || 0, y: originToken.y || 0 };

    if (preset.shape === 'circle') {
      const radius = customRadius !== null ? customRadius : preset.radiusPx;
      return getTokensInCircle(originPoint, radius, tokens);
    } else if (preset.shape === 'cone') {
      const range = customRadius !== null ? customRadius : preset.rangePx;
      return getTokensInCone(originPoint, coneDirectionAngle, preset.coneAngleDeg || 60, range, tokens);
    } else if (preset.shape === 'line') {
      const length = customRadius !== null ? customRadius : preset.lengthPx;
      const rad = (coneDirectionAngle * Math.PI) / 180;
      const endPoint = {
        x: originPoint.x + Math.cos(rad) * length,
        y: originPoint.y + Math.sin(rad) * length
      };
      return getTokensInLine(originPoint, endPoint, preset.widthPx || 30, tokens);
    }
    return [];
  }, [preset, originToken, customRadius, coneDirectionAngle, tokens]);

  // Compute calculated damage outcomes
  const resolvedOutcomes = useMemo(() => {
    return resolveAoEImpact(preset, affectedResults, { saveRolls });
  }, [preset, affectedResults, saveRolls]);

  if (!isOpen) return null;

  const handleRollAllSaves = () => {
    AudioService.playDiceRoll();
    const newRolls = {};
    affectedResults.forEach(({ token }) => {
      const saveBonus = Math.max(0, parseInt(token.reflex || token.saves?.reflex || token.agilityMod || 2, 10));
      const roll = (Math.floor(Math.random() * 10) + 1) + (Math.floor(Math.random() * 10) + 1) + saveBonus;
      newRolls[token.id] = roll;
    });
    setSaveRolls(newRolls);
  };

  const handleDetonate = () => {
    if (resolvedOutcomes.length === 0) {
      alert('No combatant tokens detected within the selected blast area.');
      return;
    }

    setIsDetonating(true);
    AudioService.playCombatHit(true);

    resolvedOutcomes.forEach((outcome, idx) => {
      const targetToken = tokens.find(t => t.id === outcome.tokenId);
      if (!targetToken) return;

      let updatedToken = { ...targetToken };

      // 1. Apply Damage
      if (outcome.structureDamage > 0) {
        const curS = targetToken.structure?.current ?? 60;
        const newS = Math.max(0, curS - outcome.structureDamage);
        updatedToken.structure = { ...(targetToken.structure || { max: 60 }), current: newS };
      } else {
        if (outcome.vitalityDamage > 0) {
          const curV = targetToken.vitality?.current ?? 30;
          const newV = Math.max(0, curV - outcome.vitalityDamage);
          updatedToken.vitality = { ...(targetToken.vitality || { max: 30 }), current: newV };
        }
        if (outcome.healthDamage > 0) {
          const curH = targetToken.health?.current ?? 30;
          const newH = Math.max(0, curH - outcome.healthDamage);
          updatedToken.health = { ...(targetToken.health || { max: 30 }), current: newH };
        }
      }

      // 2. Apply Conditions on failed save
      if (outcome.appliedCondition) {
        updatedToken = applyConditionToToken(updatedToken, outcome.appliedCondition, 3);
      }

      onUpdateToken?.(targetToken.id, updatedToken);

      // 3. Floating Combat Text
      if (onTriggerFloatingText) {
        setTimeout(() => {
          const sx = (targetToken.x || 0) * scale + position.x;
          const sy = (targetToken.y || 0) * scale + position.y;
          const saveStr = outcome.saved ? ' (SAVED 1/2)' : '';
          const condStr = outcome.appliedCondition ? ` + ${outcome.appliedCondition.toUpperCase()}` : '';
          onTriggerFloatingText(sx, sy, `💥 -${outcome.finalDamage} DMG${saveStr}${condStr}`, 'damage');
        }, idx * 120);
      }
    });

    if (onBroadcastMessage) {
      const hitCount = resolvedOutcomes.length;
      onBroadcastMessage(`[AOE DETONATION]: ${preset.label} detonated by ${originToken?.label || 'Unit'}! Caught ${hitCount} combatants in ${preset.shape.toUpperCase()} blast.`);
    }

    setTimeout(() => {
      setIsDetonating(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-fadeIn">
      <div className="bg-[#121622] border border-orange-500/70 rounded-xl p-5 w-full max-w-2xl shadow-[0_0_50px_rgba(249,115,22,0.3)] text-white flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-orange-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-orange-950/80 border border-orange-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              💥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-orange-300">
                  Multi-Target AoE &amp; Environmental Hazard Engine
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Epicenter Origin: <span className="text-cyan-300 font-bold">{originToken?.label || 'Center'}</span>
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

        {/* Controls Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Preset Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Blast Preset</label>
            <select
              value={selectedPresetId}
              onChange={(e) => {
                setSelectedPresetId(e.target.value);
                setCustomRadius(null);
                setSaveRolls({});
              }}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {CANONICAL_AOE_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
              ))}
            </select>
          </div>

          {/* Epicenter Origin */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Epicenter Origin</label>
            <select
              value={originTokenId || ''}
              onChange={(e) => {
                setOriginTokenId(e.target.value);
                setSaveRolls({});
              }}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {tokens.filter(t => !t.isDead).map(t => (
                <option key={t.id} value={t.id}>{t.label || 'Unit'} ({t.x}, {t.y})</option>
              ))}
            </select>
          </div>

          {/* Cone / Line Angle Slider if applicable */}
          {(preset.shape === 'cone' || preset.shape === 'line') && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">
                Direction Angle: {coneDirectionAngle}°
              </label>
              <input
                type="range"
                min="0"
                max="359"
                value={coneDirectionAngle}
                onChange={(e) => setConeDirectionAngle(parseInt(e.target.value, 10))}
                className="accent-orange-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Preset Description & Parameters Banner */}
        <div className="p-2.5 rounded-lg bg-orange-950/30 border border-orange-600/40 text-xs text-slate-300 flex flex-col gap-1">
          <div className="flex items-center justify-between text-orange-300 font-bold">
            <span className="flex items-center gap-1.5">
              <span>{preset.icon}</span> {preset.label}
            </span>
            <span className="font-mono text-[11px] text-cyan-300">
              Base: {preset.baseDamage} Dmg | Save: {preset.saveType} DC {preset.saveDc} | Shape: {preset.shape.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{preset.description}</p>
        </div>

        {/* Detected Targets List */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[280px] pr-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-bold text-slate-300">
              Detected Targets in Blast Area ({affectedResults.length})
            </label>

            <button
              type="button"
              onClick={handleRollAllSaves}
              className="px-2 py-0.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-600/70 text-indigo-200 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              🎲 Roll All {preset.saveType} Saves (2d10)
            </button>
          </div>

          {affectedResults.length === 0 ? (
            <div className="p-6 rounded-lg border border-dashed border-slate-700/60 bg-slate-900/40 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1 min-h-[120px]">
              <span className="text-2xl opacity-40">🎯</span>
              <span>No other units detected inside the {preset.shape} perimeter.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {resolvedOutcomes.map(outcome => (
                <div
                  key={outcome.tokenId}
                  className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">🎯</span>
                    <div>
                      <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                        <span>{outcome.tokenLabel}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          outcome.zone === 'core' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {outcome.zone.toUpperCase()} ({outcome.distancePx}px)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Save Roll: <span className={outcome.saved ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{outcome.saveRoll} vs DC {outcome.saveDc}</span>
                        {outcome.saved ? ' (Passed -50%)' : ' (Failed Full Dmg)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right font-mono">
                      <div className="text-orange-400 font-bold text-xs">
                        -{outcome.finalDamage} Final Dmg
                      </div>
                      <div className="text-[9px] text-slate-500">
                        (Raw {outcome.rawDamage} - Soak {outcome.totalSoak})
                      </div>
                    </div>

                    {outcome.appliedCondition && (
                      <span className="text-[10px] px-2 py-0.5 bg-rose-950/80 border border-rose-600/70 text-rose-300 rounded font-bold">
                        +{outcome.appliedCondition}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDetonate}
            disabled={affectedResults.length === 0 || isDetonating}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-black font-bold text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>💥</span> Detonate &amp; Apply AoE Damage ({resolvedOutcomes.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AoEResolutionModal;
