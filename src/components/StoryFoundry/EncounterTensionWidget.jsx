import React, { useState, useMemo } from 'react';
import {
  Activity,
  Flame,
  AlertTriangle,
  Zap,
  Sparkles,
  Users,
  Skull,
  Radio,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Send,
  Sliders,
  ShieldAlert,
  Compass,
  Bomb
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

export const COMPLICATION_TEMPLATES = [
  {
    category: 'reinforcements',
    title: 'Reinforcement Incursion',
    icon: Users,
    color: 'rose',
    text: 'A hostile drop-pod breaches the outer perimeter! 2-3 enemy Skirmishers arrive in 1 combat round.'
  },
  {
    category: 'environmental',
    title: 'Environmental Hazard',
    icon: Flame,
    color: 'orange',
    text: 'A primary coolant line ruptures! Superheated vapor vents into the sector, creating low visibility and 2 non-lethal stress damage per round.'
  },
  {
    category: 'tactical',
    title: 'Tactical Curveball',
    icon: CrosshairIcon,
    color: 'amber',
    text: 'An enemy Sniper gains elevated catwalk vantage! All operatives outside of full cover suffer a -2 Defense DC penalty.'
  },
  {
    category: 'morale',
    title: 'Adversary Morale Break',
    icon: Skull,
    color: 'cyan',
    text: 'The enemy squad falters! With their vanguard falling, remaining minions must pass a DC 12 Willpower check or scatter in panic.'
  },
  {
    category: 'parley',
    title: 'Surrender / Parley Offer',
    icon: Radio,
    color: 'emerald',
    text: 'An adversary commander broadcasts an emergency ceasefire, offering an encrypted data-pad in exchange for safe withdrawal.'
  },
  {
    category: 'countdown',
    title: 'Catastrophic Meltdown Countdown',
    icon: Bomb,
    color: 'purple',
    text: 'A reactor failsafe triggers a 3-round self-destruct sequence! An operative must pass a DC 16 Technology check to stabilize the core.'
  }
];

function CrosshairIcon(props) {
  return <AlertTriangle {...props} />;
}

export default function EncounterTensionWidget({
  tokens = [],
  roundNumber = 1,
  onTriggerFloatingText,
  onBroadcastComplication,
  scale = 1,
  position = { x: 0, y: 0 }
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [customComplication, setCustomComplication] = useState('');

  // Calculate Real-Time Encounter Telemetry
  const telemetry = useMemo(() => {
    const heroTokens = tokens.filter(t => Boolean(t.linkedHeroId) || t.type === 'hero' || t.isHero);
    const enemyTokens = tokens.filter(t => !Boolean(t.linkedHeroId) && t.type !== 'hero' && !t.isHero && t.type !== 'link');

    // 1. Party Health & Vitality deficit
    let partyMaxHp = 0;
    let partyCurHp = 0;
    let partyMaxVit = 0;
    let partyCurVit = 0;
    let deathsDoorCount = 0;

    heroTokens.forEach(t => {
      const hMax = t.health?.max || t.hp?.max || 30;
      const hCur = t.health?.current !== undefined ? t.health.current : (t.hp?.current ?? 30);
      const vMax = t.vitality?.max || 30;
      const vCur = t.vitality?.current !== undefined ? t.vitality.current : 30;

      partyMaxHp += hMax;
      partyCurHp += Math.max(0, hCur);
      partyMaxVit += vMax;
      partyCurVit += Math.max(0, vCur);

      if (hCur <= 0) deathsDoorCount++;
    });

    const hpRatio = partyMaxHp > 0 ? partyCurHp / partyMaxHp : 1;
    const vitRatio = partyMaxVit > 0 ? partyCurVit / partyMaxVit : 1;
    const partyInjuryDeficit = 1 - (hpRatio * 0.6 + vitRatio * 0.4); // 0 (healthy) to 1 (dead)

    // 2. Active Combat Round Stress
    const roundStress = Math.min(0.25, (roundNumber - 1) * 0.05);

    // 3. Enemy Threat Presence
    const activeEnemies = enemyTokens.filter(t => !t.isDead && (t.health?.current ?? (t.hp?.current ?? 30)) > 0);
    const enemyWeight = Math.min(0.35, activeEnemies.length * 0.08);

    // 4. Critical Conditions Impact
    const deathsDoorImpact = deathsDoorCount * 0.2;

    // Total Tension Score (0 - 100)
    const rawTension = Math.round(
      (partyInjuryDeficit * 45 + enemyWeight * 30 + roundStress * 15 + deathsDoorImpact * 30) * 100
    ) / 100;

    const tensionScore = Math.max(5, Math.min(100, Math.round(rawTension)));

    // Categorization
    let tier = 'Routine';
    let color = 'text-emerald-400';
    let bgColor = 'bg-emerald-500';
    let borderColor = 'border-emerald-500/40';
    let advice = 'Party holds tactical superiority. Maintain pacing or inject minor environmental flavor.';

    if (tensionScore >= 85) {
      tier = 'Catastrophic Climax';
      color = 'text-rose-400';
      bgColor = 'bg-rose-500';
      borderColor = 'border-rose-500/80';
      advice = 'CRITICAL DANGER: High risk of operative loss. Offer high-stakes heroic gambits, parley, or dramatic retreats.';
    } else if (tensionScore >= 60) {
      tier = 'High Stakes';
      color = 'text-orange-400';
      bgColor = 'bg-orange-500';
      borderColor = 'border-orange-500/70';
      advice = 'Escalating conflict: Party resources are draining. Prime moment for unexpected tactical curveballs or boss phase shifts.';
    } else if (tensionScore >= 35) {
      tier = 'Active Engagement';
      color = 'text-amber-400';
      bgColor = 'bg-amber-500';
      borderColor = 'border-amber-500/60';
      advice = 'Balanced skirmish: Both sides trading blows. Maintain momentum and monitor action economy.';
    }

    return {
      tensionScore,
      tier,
      color,
      bgColor,
      borderColor,
      advice,
      heroCount: heroTokens.length,
      enemyCount: activeEnemies.length,
      deathsDoorCount
    };
  }, [tokens, roundNumber]);

  const handleInjectComplication = (comp) => {
    AudioService.playTerminalBeep(940, 0.1);
    const formatted = `⚠️ **[ENCOUNTER COMPLICATION - ${comp.title.toUpperCase()}]**\n${comp.text}`;

    if (onTriggerFloatingText) {
      onTriggerFloatingText(
        window.innerWidth / 2 - 100,
        120,
        `⚡ ${comp.title.toUpperCase()}`,
        'karma'
      );
    }

    if (onBroadcastComplication) {
      onBroadcastComplication(formatted);
    }
  };

  return (
    <div className={`p-3 rounded-xl bg-[#111620]/95 backdrop-blur-md border ${telemetry.borderColor} shadow-[0_0_25px_rgba(0,0,0,0.4)] flex flex-col gap-2.5 font-sans select-none text-slate-100`}>
      
      {/* Widget Header */}
      <div
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              Encounter Tension &amp; Co-GM Director
            </h3>
            <span className="text-[9px] font-mono text-slate-400">
              Round {roundNumber} · {telemetry.heroCount} Operatives vs. {telemetry.enemyCount} Adversaries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-black font-mono px-2 py-0.5 rounded bg-slate-900 border ${telemetry.borderColor} ${telemetry.color}`}>
            {telemetry.tensionScore}% [{telemetry.tier}]
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Tension Progress Bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full ${telemetry.bgColor} transition-all duration-500`}
          style={{ width: `${telemetry.tensionScore}%` }}
        />
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-3 pt-1 border-t border-slate-800 text-xs">
          
          {/* Pair GM Advisory Banner */}
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start gap-2 text-[11px] leading-relaxed">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <strong className="text-amber-300">🤖 Bastion Tactical Heuristic:</strong>
              <span className="text-slate-300">{telemetry.advice}</span>
            </div>
          </div>

          {/* 1-Click Procedural Narrative Complications */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <span>1-Click Dramatic Complications</span>
              <span className="text-[9px] text-amber-400 lowercase font-mono">click to broadcast</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {COMPLICATION_TEMPLATES.map((comp, idx) => {
                const Icon = comp.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInjectComplication(comp)}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500/60 text-left transition-all cursor-pointer flex flex-col gap-0.5"
                  >
                    <span className="font-bold text-[11px] text-amber-200 flex items-center gap-1 truncate">
                      <Icon className="w-3 h-3 text-amber-400 shrink-0" />
                      {comp.title}
                    </span>
                    <span className="text-[9px] text-slate-400 line-clamp-2 leading-tight">
                      {comp.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
