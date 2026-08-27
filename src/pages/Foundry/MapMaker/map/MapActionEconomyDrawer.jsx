import React, { useState } from 'react';
import {
  Zap,
  Footprints,
  Shield,
  RotateCcw,
  Battery,
  Flame,
  Radio,
  Sparkles,
  AlertOctagon,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

/**
 * Action Economy, Ammo & Essence Burn Component for Active Combatants
 */
export default function MapActionEconomyDrawer({
  token,
  onUpdateToken,
  onTriggerFloatingText,
  scale = 1,
  position = { x: 0, y: 0 }
}) {
  if (!token) return null;

  const [isExpanded, setIsExpanded] = useState(true);

  // 1. Action Economy State (Standard, Move, Reaction, Free)
  const actions = token.actions || {
    standard: true, // true = available, false = spent
    move: true,
    reaction: true
  };

  // 2. Ammo & Battery State
  const ammo = token.ammo || {
    current: 12,
    max: 12,
    magazines: 3,
    weaponName: 'Heavy Sidearm'
  };

  // 3. Essence & Fatigue State (for Invocations / Psionics)
  const essence = token.essence || {
    current: 10,
    max: 10,
    fatigueStage: 0 // 0 = Normal, 1 = Fatigued (-1 check), 2 = Exhausted (-2, 0.5 Pace), 3 = Burn
  };

  const isSynthetic = Boolean(token.isSynthetic || token.structure);

  // Action Toggles
  const handleToggleAction = (actionType) => {
    const nextActions = {
      ...actions,
      [actionType]: !actions[actionType]
    };
    onUpdateToken?.(token.id, { actions: nextActions });

    AudioService.playTerminalBeep(actions[actionType] ? 520 : 880, 0.04);

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      const stateLabel = nextActions[actionType] ? 'READY' : 'SPENT';
      const colorType = nextActions[actionType] ? 'heal' : 'miss';
      onTriggerFloatingText(screenX, screenY, `${actionType.toUpperCase()} ACTION: ${stateLabel}`, colorType);
    }
  };

  const handleResetActions = () => {
    onUpdateToken?.(token.id, {
      actions: { standard: true, move: true, reaction: true }
    });
    AudioService.playTerminalBeep(920, 0.08);

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(screenX, screenY, `⚡ ACTIONS REFRESHED`, 'heal');
    }
  };

  // Ammo Consumption & Reload
  const handleExpendAmmo = (count, modeName = 'Shot') => {
    if (ammo.current <= 0) {
      AudioService.playTerminalBeep(220, 0.12);
      if (onTriggerFloatingText) {
        const screenX = (token.x || 0) * scale + position.x;
        const screenY = (token.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `⚠️ CLICK! OUT OF AMMO (RELOAD NEEDED)`, 'miss');
      }
      return;
    }

    const nextCurrent = Math.max(0, ammo.current - count);
    const nextActions = { ...actions, standard: false }; // Consumes standard action

    onUpdateToken?.(token.id, {
      ammo: { ...ammo, current: nextCurrent },
      actions: nextActions
    });

    AudioService.playCombatHit(false);

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(screenX, screenY, `💥 ${modeName.toUpperCase()} (-${count} RDS, ${nextCurrent}/${ammo.max})`, 'damage');
    }
  };

  const handleReload = () => {
    if (ammo.magazines <= 0 && ammo.current === ammo.max) return;
    if (ammo.magazines <= 0) {
      AudioService.playTerminalBeep(220, 0.12);
      if (onTriggerFloatingText) {
        const screenX = (token.x || 0) * scale + position.x;
        const screenY = (token.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `🚫 NO SPARE MAGAZINES!`, 'miss');
      }
      return;
    }

    const nextMagazines = Math.max(0, ammo.magazines - 1);
    const nextActions = { ...actions, move: false }; // Reload consumes Move Action

    onUpdateToken?.(token.id, {
      ammo: { ...ammo, current: ammo.max, magazines: nextMagazines },
      actions: nextActions
    });

    AudioService.playTerminalBeep(780, 0.1);

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(screenX, screenY, `🔄 RELOADED (${ammo.max}/${ammo.max}, ${nextMagazines} MAGS REMAINING)`, 'heal');
    }
  };

  // Essence Channeling & Fatigue
  const handleChannelEssence = (cost) => {
    const currentEssence = essence.current;
    let nextEssence = currentEssence - cost;
    let nextFatigue = essence.fatigueStage;
    let drainHealth = 0;

    if (nextEssence < 0) {
      // Overchanneling burn: Drain vitality/health directly & increase fatigue stage
      drainHealth = Math.abs(nextEssence);
      nextEssence = 0;
      nextFatigue = Math.min(3, nextFatigue + 1);
    }

    const nextActions = { ...actions, standard: false };

    onUpdateToken?.(token.id, {
      essence: { ...essence, current: nextEssence, fatigueStage: nextFatigue },
      actions: nextActions
    });

    AudioService.playCriticalChime(true);

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      if (drainHealth > 0) {
        onTriggerFloatingText(screenX, screenY, `🔮 ESSENCE OVERCHANNEL (-${drainHealth} OVERBURN, FATIGUE STAGE ${nextFatigue})`, 'damage');
      } else {
        onTriggerFloatingText(screenX, screenY, `🔮 CHANNELED INVOCATION (-${cost} ESSENCE, ${nextEssence}/${essence.max})`, 'karma');
      }
    }
  };

  const handleMeditate = () => {
    const nextEssence = essence.max;
    const nextFatigue = Math.max(0, essence.fatigueStage - 1);

    onUpdateToken?.(token.id, {
      essence: { ...essence, current: nextEssence, fatigueStage: nextFatigue }
    });

    AudioService.playTerminalBeep(980, 0.12);

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(screenX, screenY, `🧘 MEDITATED: ESSENCE RESTORED (${nextEssence}/${essence.max})`, 'heal');
    }
  };

  return (
    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 shadow-md flex flex-col gap-2 font-sans select-none animate-in fade-in duration-150">
      
      {/* Header Toggle */}
      <div
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex items-center justify-between cursor-pointer text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-amber-200 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Action Economy &amp; Resource Deck</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleResetActions();
            }}
            className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-[9px] font-mono lowercase flex items-center gap-0.5"
            title="Reset All Actions for this Round"
          >
            <RotateCcw className="w-2.5 h-2.5" /> reset
          </button>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-2.5 pt-1 border-t border-slate-800/80 text-xs">
          
          {/* Row 1: Action Slots (Standard, Move, Reaction) */}
          <div className="grid grid-cols-3 gap-1.5">
            {/* Standard Action */}
            <button
              type="button"
              onClick={() => handleToggleAction('standard')}
              className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                actions.standard
                  ? 'bg-amber-950/70 border-amber-500/80 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 line-through opacity-60'
              }`}
              title="Standard Action: Strike, Skill, Cast, Use Item (1 / Turn)"
            >
              <div className="flex items-center gap-1 font-bold text-[10px]">
                <Zap className="w-3 h-3 text-amber-400" /> Standard
              </div>
              <span className="text-[8px] font-mono">{actions.standard ? 'READY' : 'SPENT'}</span>
            </button>

            {/* Move Action */}
            <button
              type="button"
              onClick={() => handleToggleAction('move')}
              className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                actions.move
                  ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 line-through opacity-60'
              }`}
              title="Move Action: Tactical Pace, Draw/Stow, Reload, Cover (1 / Turn)"
            >
              <div className="flex items-center gap-1 font-bold text-[10px]">
                <Footprints className="w-3 h-3 text-cyan-400" /> Move
              </div>
              <span className="text-[8px] font-mono">{actions.move ? 'READY' : 'SPENT'}</span>
            </button>

            {/* Reaction */}
            <button
              type="button"
              onClick={() => handleToggleAction('reaction')}
              className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                actions.reaction
                  ? 'bg-indigo-950/70 border-indigo-500/80 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 line-through opacity-60'
              }`}
              title="Reaction: Parry, Dodge/Evasion, Opportunity Strike (1 / Round)"
            >
              <div className="flex items-center gap-1 font-bold text-[10px]">
                <Shield className="w-3 h-3 text-indigo-400" /> Reaction
              </div>
              <span className="text-[8px] font-mono">{actions.reaction ? 'READY' : 'SPENT'}</span>
            </button>
          </div>

          {/* Row 2: Weapon Magazine & Ammo Counter */}
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-300 font-bold flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-amber-400" /> Ammo / Battery:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-bold">{ammo.current}/{ammo.max} rds</span>
                <span className="text-slate-500">|</span>
                <span className="text-cyan-400">{ammo.magazines} Mags</span>
              </div>
            </div>

            {/* Ammo Progress Bar */}
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  ammo.current / ammo.max > 0.5 ? 'bg-amber-400' : ammo.current / ammo.max > 0.2 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (ammo.current / ammo.max) * 100))}%` }}
              />
            </div>

            {/* Quick Fire & Reload Action Buttons */}
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              <button
                type="button"
                onClick={() => handleExpendAmmo(1, 'Single Shot')}
                disabled={ammo.current < 1}
                className="py-1 rounded bg-slate-950 hover:bg-amber-950 text-amber-300 border border-slate-800 hover:border-amber-500/50 font-bold text-[9px] transition-colors disabled:opacity-40 cursor-pointer"
                title="Single Shot (-1 rd, Standard Action)"
              >
                1x Shot
              </button>
              <button
                type="button"
                onClick={() => handleExpendAmmo(3, '3-Rd Burst')}
                disabled={ammo.current < 3}
                className="py-1 rounded bg-slate-950 hover:bg-orange-950 text-orange-300 border border-slate-800 hover:border-orange-500/50 font-bold text-[9px] transition-colors disabled:opacity-40 cursor-pointer"
                title="3-Round Burst (-3 rds, Standard Action)"
              >
                3x Burst
              </button>
              <button
                type="button"
                onClick={() => handleExpendAmmo(6, 'Full Auto')}
                disabled={ammo.current < 6}
                className="py-1 rounded bg-slate-950 hover:bg-red-950 text-red-300 border border-slate-800 hover:border-red-500/50 font-bold text-[9px] transition-colors disabled:opacity-40 cursor-pointer"
                title="Full Auto Suppression (-6 rds, Standard Action)"
              >
                6x Auto
              </button>
              <button
                type="button"
                onClick={handleReload}
                disabled={ammo.magazines <= 0 && ammo.current === ammo.max}
                className="py-1 rounded bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 font-bold text-[9px] transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-0.5"
                title="Reload Magazine (Consumes Move Action)"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Reload
              </button>
            </div>
          </div>

          {/* Row 3: Metaphysical Essence & Fatigue (Psionics / Non-Synthetics) */}
          {!isSynthetic && (
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-purple-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Metaphysical Essence:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-purple-300 font-bold">{essence.current}/{essence.max} EP</span>
                  <span className="text-slate-500">|</span>
                  <span className={essence.fatigueStage === 0 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                    {essence.fatigueStage === 0 ? 'Fresh' : `Fatigue Stage ${essence.fatigueStage}`}
                  </span>
                </div>
              </div>

              {/* Essence Progress Bar */}
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (essence.current / essence.max) * 100))}%` }}
                />
              </div>

              {/* Essence Actions */}
              <div className="grid grid-cols-3 gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleChannelEssence(2)}
                  className="py-1 rounded bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-bold text-[9px] transition-colors cursor-pointer"
                  title="Channel Tier 1 Invocation (-2 EP)"
                >
                  -2 EP Cast
                </button>
                <button
                  type="button"
                  onClick={() => handleChannelEssence(4)}
                  className="py-1 rounded bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-bold text-[9px] transition-colors cursor-pointer"
                  title="Channel Tier 2 Invocation (-4 EP)"
                >
                  -4 EP Cast
                </button>
                <button
                  type="button"
                  onClick={handleMeditate}
                  className="py-1 rounded bg-slate-950 hover:bg-indigo-950 text-indigo-300 border border-slate-800 hover:border-indigo-500/50 font-bold text-[9px] transition-colors cursor-pointer flex items-center justify-center gap-0.5"
                  title="Meditate / Catch Breath (Restore EP & clear fatigue)"
                >
                  <Sparkles className="w-2.5 h-2.5" /> Meditate
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
