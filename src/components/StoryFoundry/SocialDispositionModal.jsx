import React, { useState, useEffect } from 'react';
import {
  DISPOSITION_TIERS,
  SOCIAL_ACTION_TYPES,
  getDispositionDefinition,
  generateNpcSocialProfile,
  evaluateDispositionShift
} from '../../services/socialMatrixService';
import AudioService from '../../services/audioService';

const SocialDispositionModal = ({
  isOpen,
  onClose,
  npcTokens = [],
  heroTokens = [],
  selectedNpcToken = null,
  onUpdateToken,
  onTriggerFloatingText,
  scale = 1,
  position = { x: 0, y: 0 },
  onBroadcastMessage
}) => {
  const [activeNpcId, setActiveNpcId] = useState(selectedNpcToken?.id || npcTokens[0]?.id || null);
  const [activeHeroId, setActiveHeroId] = useState(heroTokens[0]?.id || null);
  const [selectedActionId, setSelectedActionId] = useState('persuasion');
  const [situationalMod, setSituationalMod] = useState(0);
  const [hasLeverage, setHasLeverage] = useState(false);
  const [socialProfiles, setSocialProfiles] = useState({});
  const [lastCheckResult, setLastCheckResult] = useState(null);

  const activeNpc = npcTokens.find(t => t.id === activeNpcId) || selectedNpcToken || npcTokens[0];
  const activeHero = heroTokens.find(t => t.id === activeHeroId) || heroTokens[0];

  useEffect(() => {
    if (activeNpc && !socialProfiles[activeNpc.id]) {
      setSocialProfiles(prev => ({
        ...prev,
        [activeNpc.id]: generateNpcSocialProfile(activeNpc)
      }));
    }
  }, [activeNpc, socialProfiles]);

  if (!isOpen) return null;

  const currentProfile = activeNpc ? (socialProfiles[activeNpc.id] || generateNpcSocialProfile(activeNpc)) : null;
  const currentTier = currentProfile?.dispositionTier ?? 0;
  const currentDef = getDispositionDefinition(currentTier);
  const selectedAction = SOCIAL_ACTION_TYPES.find(a => a.id === selectedActionId) || SOCIAL_ACTION_TYPES[0];

  const handleSetTierManually = (tier) => {
    AudioService.playTerminalBeep(tier > currentTier ? 880 : 440, 0.1);
    const nextDef = getDispositionDefinition(tier);
    setSocialProfiles(prev => ({
      ...prev,
      [activeNpc.id]: {
        ...prev[activeNpc.id],
        dispositionTier: tier
      }
    }));

    if (onTriggerFloatingText && activeNpc) {
      const sx = (activeNpc.x || 0) * scale + position.x;
      const sy = (activeNpc.y || 0) * scale + position.y;
      onTriggerFloatingText(sx, sy, `${nextDef.icon} ${nextDef.label.toUpperCase()}`, tier >= 1 ? 'heal' : 'damage');
    }
  };

  const handleToggleLeverageReveal = () => {
    AudioService.playTerminalBeep(980, 0.1);
    setSocialProfiles(prev => ({
      ...prev,
      [activeNpc.id]: {
        ...prev[activeNpc.id],
        leverageRevealed: !prev[activeNpc.id]?.leverageRevealed
      }
    }));
  };

  const handleRollSocialCheck = () => {
    if (!activeHero || !activeNpc) return;

    AudioService.playDiceRoll();

    // 2d10 Roll
    const d1 = Math.floor(Math.random() * 10) + 1;
    const d2 = Math.floor(Math.random() * 10) + 1;
    const isCritTriumph = d1 === 10 && d2 === 10;
    const isCritFumble = d1 === 1 && d2 === 1;

    // Attributes & Skills (Default to +2/+2 if not on mock token)
    const attrMod = Math.max(0, parseInt(activeHero.charismaMod || activeHero.intellectMod || 2, 10));
    const skillRank = Math.max(0, parseInt(activeHero.skills?.[selectedAction.skill] || 2, 10));
    const leverageBonus = hasLeverage ? 2 : 0;
    const totalMod = attrMod + skillRank + situationalMod + leverageBonus;

    const baseDiceSum = isCritTriumph ? 30 : isCritFumble ? -10 : (d1 + d2);
    const rollTotal = baseDiceSum + totalMod;

    const targetDc = currentDef.baseDc;

    // Shift evaluation
    const shift = evaluateDispositionShift(
      currentTier,
      selectedAction.id,
      rollTotal,
      targetDc,
      isCritTriumph,
      isCritFumble
    );

    // Update state profile
    if (shift.tierChanged) {
      setSocialProfiles(prev => ({
        ...prev,
        [activeNpc.id]: {
          ...prev[activeNpc.id],
          dispositionTier: shift.newTier
        }
      }));
    }

    const resultPayload = {
      d1,
      d2,
      isCritTriumph,
      isCritFumble,
      totalMod,
      rollTotal,
      targetDc,
      shift,
      actionLabel: selectedAction.label,
      heroLabel: activeHero.label || 'Operative',
      npcLabel: activeNpc.label || 'NPC'
    };

    setLastCheckResult(resultPayload);

    if (onTriggerFloatingText) {
      const sx = (activeNpc.x || 0) * scale + position.x;
      const sy = (activeNpc.y || 0) * scale + position.y;
      const outcomeText = shift.marginOfSuccess >= 0 ? `🗣️ SUCCESS (MoS +${shift.marginOfSuccess})` : `⚠️ FAILED (Margin ${shift.marginOfSuccess})`;
      onTriggerFloatingText(sx, sy, outcomeText, shift.marginOfSuccess >= 0 ? 'heal' : 'damage');
    }

    if (onBroadcastMessage) {
      onBroadcastMessage(`[SOCIAL NEGOTIATION]: ${activeHero.label} rolled ${selectedAction.label} vs ${activeNpc.label}: Total ${rollTotal} vs DC ${targetDc} — ${shift.shiftReason}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-fadeIn">
      <div className="bg-[#131722] border border-cyan-500/70 rounded-xl p-5 w-full max-w-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-cyan-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              🎭
            </div>
            <div>
              <h3 className="font-bold text-base uppercase tracking-wider text-cyan-300">
                Scene Director &amp; Social Disposition Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Live NPC Attitude, Leverage Adjudicator &amp; Negotiation Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 text-2xl font-bold leading-none px-2 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Actor Selectors Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Target NPC / Contact</label>
            <select
              value={activeNpcId || ''}
              onChange={(e) => setActiveNpcId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {(npcTokens.length > 0 ? npcTokens : [selectedNpcToken || { id: 'npc_1', label: 'Corporate Liaison' }]).map(npc => (
                <option key={npc.id} value={npc.id}>👤 {npc.label || 'NPC'}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Negotiating Operative</label>
            <select
              value={activeHeroId || ''}
              onChange={(e) => setActiveHeroId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {(heroTokens.length > 0 ? heroTokens : [{ id: 'hero_1', label: 'Party Face / Envoy' }]).map(hero => (
                <option key={hero.id} value={hero.id}>🎖️ {hero.label || 'Hero'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 5-Tier Disposition Ribbon */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-300">
              Current Disposition: <span className="font-bold" style={{ color: currentDef.color }}>{currentDef.icon} {currentDef.label}</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-300">
              Negotiation DC: <span className="font-bold">{currentDef.baseDc}</span> | Market Multiplier: <span className="font-bold">{currentDef.tradeModifier}x</span>
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {DISPOSITION_TIERS.map(tier => {
              const isSelected = tier.tier === currentTier;

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleSetTierManually(tier.tier)}
                  className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    isSelected
                      ? `${tier.bgClass} shadow-[0_0_12px_rgba(255,255,255,0.15)] font-bold scale-[1.02]`
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="text-base">{tier.icon}</span>
                  <span className="text-[10px] uppercase font-mono">{tier.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 pt-1 leading-snug">
            {currentDef.description}
          </p>
        </div>

        {/* Motivation, Fear & Leverage Cards */}
        {currentProfile && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                <span>🎯</span> Core Motivation
              </span>
              <p className="text-[11px] text-slate-300 leading-snug">{currentProfile.motivation}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-rose-400 flex items-center gap-1">
                <span>⚠️</span> Hidden Fear
              </span>
              <p className="text-[11px] text-slate-300 leading-snug">{currentProfile.fear}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-cyan-400 flex items-center gap-1">
                  <span>💎</span> Leverage Chip
                </span>
                <button
                  type="button"
                  onClick={handleToggleLeverageReveal}
                  className="text-[9px] text-cyan-300 hover:underline cursor-pointer"
                >
                  {currentProfile.leverageRevealed ? 'Hide' : 'Reveal'}
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {currentProfile.leverageRevealed ? currentProfile.leverage : '🔒 [Hidden / Roll Insight to Reveal]'}
              </p>
            </div>
          </div>
        )}

        {/* Social Action Checkpad */}
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-bold text-slate-300">
              Execute Social Action Check:
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[10px] text-cyan-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLeverage}
                  onChange={(e) => setHasLeverage(e.target.checked)}
                  className="accent-cyan-500 rounded"
                />
                Apply Leverage (+2)
              </label>
              <label className="text-[10px] text-slate-400">
                Sit. Mod:
                <input
                  type="number"
                  min="-10"
                  max="10"
                  value={situationalMod}
                  onChange={(e) => setSituationalMod(parseInt(e.target.value, 10) || 0)}
                  className="w-10 ml-1 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-cyan-300 text-xs"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {SOCIAL_ACTION_TYPES.map(act => (
              <button
                key={act.id}
                type="button"
                onClick={() => setSelectedActionId(act.id)}
                className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                  selectedActionId === act.id
                    ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)] font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="text-sm">{act.icon}</span>
                <span className="text-[10px] truncate">{act.label.split('/')[0]}</span>
              </button>
            ))}
          </div>

          {/* Roll Action Button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              Formula: <span className="font-mono text-cyan-300">2d10 + {selectedAction.attribute} + {selectedAction.skill} vs DC {currentDef.baseDc}</span>
            </span>

            <button
              type="button"
              onClick={handleRollSocialCheck}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>🎲</span> Roll {selectedAction.label.split('/')[0]} Check
            </button>
          </div>
        </div>

        {/* Last Check Result Banner */}
        {lastCheckResult && (
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex flex-col gap-1 text-xs animate-fadeIn">
            <div className="flex items-center justify-between font-bold">
              <span className="text-cyan-300 flex items-center gap-1">
                <span>🎲</span> {lastCheckResult.heroLabel} ({lastCheckResult.actionLabel}): [{lastCheckResult.d1}, {lastCheckResult.d2}] + {lastCheckResult.totalMod} = <span className="text-amber-300 text-sm">{lastCheckResult.rollTotal}</span>
              </span>
              <span className={lastCheckResult.shift.marginOfSuccess >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                Target DC {lastCheckResult.targetDc} (Margin {lastCheckResult.shift.marginOfSuccess >= 0 ? `+${lastCheckResult.shift.marginOfSuccess}` : lastCheckResult.shift.marginOfSuccess})
              </span>
            </div>
            <p className="text-[11px] text-slate-300">{lastCheckResult.shift.shiftReason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialDispositionModal;
