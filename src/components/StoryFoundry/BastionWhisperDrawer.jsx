import React, { useState, useMemo } from 'react';
import { analyzeCombatPacing, CANONICAL_WHISPER_CARDS } from '../../services/bastionWhisperService';
import AudioService from '../../services/audioService';

const BastionWhisperDrawer = ({
  isOpen,
  onClose,
  tokens = [],
  roundNumber = 1,
  onTriggerFloatingText,
  scale = 1,
  position = { x: 0, y: 0 },
  onBroadcastMessage
}) => {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [injectedLogs, setInjectedLogs] = useState([]);

  const telemetry = useMemo(() => {
    return analyzeCombatPacing(tokens, roundNumber);
  }, [tokens, roundNumber]);

  if (!isOpen) return null;

  const handleInjectCard = (card) => {
    AudioService.playTerminalBeep(920, 0.2);

    const logEntry = `[BASTION CO-GM INJECTION]: ${card.title} — ${card.description}`;
    setInjectedLogs(prev => [logEntry, ...prev]);

    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight / 3, `⚠️ ${card.title.toUpperCase()}`, 'karma');
    }

    if (onBroadcastMessage) {
      onBroadcastMessage(logEntry);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="bg-[#121622] border border-amber-500/70 rounded-xl p-5 w-full max-w-2xl shadow-[0_0_50px_rgba(245,158,11,0.3)] text-white flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-amber-300">
                  BASTION Proactive Pacing &amp; Tactical Whisper AI
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-950 border border-amber-500/60 text-amber-200">
                  RND {roundNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous Encounter Pacing, Drag Detection &amp; GM Advisory Stream
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

        {/* Real-Time Telemetry Dashboard */}
        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-300">Pacing State:</span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded border" style={{ color: telemetry.pacingColor, borderColor: `${telemetry.pacingColor}60` }}>
                {telemetry.pacingLabel}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              Tension: {telemetry.tensionScore}%
            </span>
          </div>

          {/* Tension Progress Bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${telemetry.tensionScore}%`,
                backgroundColor: telemetry.pacingColor
              }}
            />
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono text-center">
            <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block">Party Health:</span>
              <span className="text-emerald-400 font-bold text-xs">{telemetry.heroHealthRatio}%</span>
            </div>
            <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block">Death's Door:</span>
              <span className={telemetry.heroesAtDeathsDoor > 0 ? 'text-rose-400 font-bold text-xs' : 'text-slate-400 font-bold text-xs'}>
                {telemetry.heroesAtDeathsDoor}
              </span>
            </div>
            <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block">Active Enemies:</span>
              <span className="text-amber-400 font-bold text-xs">{telemetry.enemyCount}</span>
            </div>
            <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block">Combat Round:</span>
              <span className="text-cyan-400 font-bold text-xs">#{roundNumber}</span>
            </div>
          </div>
        </div>

        {/* BASTION Advisory Callout */}
        <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/50 flex items-start gap-2.5 text-xs text-slate-200">
          <span className="text-lg shrink-0">🛰️</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-cyan-300 font-mono tracking-wider">
              BASTION Tactical Cognition Advisory:
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed italic">
              "{telemetry.advice}"
            </p>
          </div>
        </div>

        {/* Proactive Complication Cards */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[260px] pr-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">
            Recommended Narrative Complications &amp; Pacing Cards:
          </label>

          <div className="grid grid-cols-1 gap-2">
            {(telemetry.suggestedCards.length > 0 ? telemetry.suggestedCards : CANONICAL_WHISPER_CARDS).map(card => (
              <div
                key={card.id}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 hover:border-amber-500/50 transition-all text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-xl shrink-0 mt-0.5">{card.icon}</span>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300">{card.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded font-mono">
                        {card.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {card.description}
                    </p>
                    <span className="text-[10px] text-cyan-400 font-mono mt-0.5">
                      ⚡ Action: {card.actionEffect}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleInjectCard(card)}
                  className="px-3 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-black font-bold text-[10px] uppercase tracking-wider rounded shrink-0 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Inject Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-[10px] text-slate-500 font-mono">
            {injectedLogs.length > 0 ? `Injected ${injectedLogs.length} events this session` : 'No events injected yet'}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Close Whisper Drawer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BastionWhisperDrawer;
