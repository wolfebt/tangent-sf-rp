import React, { useState, useEffect, useMemo } from 'react';
import { runMonteCarloEncounterSim } from '../../services/encounterSimService';
import AudioService from '../../services/audioService';

const EncounterSimModal = ({
  isOpen,
  onClose,
  tokens = []
}) => {
  const [iterations, setIterations] = useState(500);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState(null);

  const heroTokens = useMemo(() => tokens.filter(t => Boolean(t.linkedHeroId) && !t.isDead), [tokens]);
  const enemyTokens = useMemo(() => tokens.filter(t => (t.isEnemy || t.type === 'adversary' || t.type === 'enemy') && !t.isDead), [tokens]);

  const handleRunSim = () => {
    setIsSimulating(true);
    AudioService.playTerminalBeep(1100, 0.15);

    setTimeout(() => {
      const results = runMonteCarloEncounterSim(heroTokens, enemyTokens, iterations);
      setSimResults(results);
      setIsSimulating(false);
      AudioService.playDiceRoll();
    }, 200);
  };

  useEffect(() => {
    if (isOpen && heroTokens.length > 0 && enemyTokens.length > 0 && !simResults) {
      handleRunSim();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="bg-[#121622] border border-cyan-500/70 rounded-xl p-5 w-full max-w-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-cyan-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              🎲
            </div>
            <div>
              <h3 className="font-bold text-base uppercase tracking-wider text-cyan-300">
                Predictive Monte Carlo Encounter Balancer
              </h3>
              <p className="text-xs text-slate-400">
                500-Run Rapid Combat Engine Simulator &amp; Casualty Forecaster
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

        {/* Combatant Roster Bar */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400">
              Operatives ({heroTokens.length})
            </span>
            <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto pr-1">
              {heroTokens.length === 0 ? (
                <span className="text-slate-500 text-[11px]">No active hero tokens on map</span>
              ) : (
                heroTokens.map(h => (
                  <span key={h.id} className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 text-[10px] font-mono">
                    {h.label || 'Hero'} (HP: {h.health?.current ?? 30}, DEF: {h.defense || 12})
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-rose-400">
              Adversaries ({enemyTokens.length})
            </span>
            <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto pr-1">
              {enemyTokens.length === 0 ? (
                <span className="text-slate-500 text-[11px]">No active adversary tokens on map</span>
              ) : (
                enemyTokens.map(e => (
                  <span key={e.id} className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-700/60 text-rose-200 text-[10px] font-mono">
                    {e.label || 'Enemy'} (HP: {e.health?.current ?? 25}, DEF: {e.defense || 11})
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Run Simulator Button */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Sample Runs:</span>
            <select
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value, 10))}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 focus:outline-none"
            >
              <option value={100}>100 Iterations</option>
              <option value={500}>500 Iterations (Recommended)</option>
              <option value={1000}>1,000 Iterations (Deep)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleRunSim}
            disabled={heroTokens.length === 0 || enemyTokens.length === 0 || isSimulating}
            className="px-5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-black font-bold text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡</span> {isSimulating ? 'Simulating...' : 'Run Monte Carlo Forecast'}
          </button>
        </div>

        {/* Simulation Results Dashboard */}
        {simResults && (
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm uppercase font-bold text-slate-300">Predicted Threat Tier:</span>
                <span
                  className="px-2.5 py-0.5 rounded-full font-bold font-mono text-xs border"
                  style={{ color: simResults.threatColor, borderColor: `${simResults.threatColor}70` }}
                >
                  {simResults.threatTier.toUpperCase()}
                </span>
              </div>

              <span className="font-mono text-cyan-300 text-xs">
                {simResults.iterations} Iterations Completed
              </span>
            </div>

            {/* Win Probability Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-emerald-400">Party Victory: {simResults.winRate}%</span>
                <span className="text-rose-400">Casualty / Defeat Risk: {simResults.lossRate}%</span>
              </div>
              <div className="w-full bg-rose-950 h-3 rounded-full overflow-hidden border border-slate-700 flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-700"
                  style={{ width: `${simResults.winRate}%` }}
                />
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center font-mono">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Avg Duration:</span>
                <span className="text-cyan-300 font-bold text-sm">{simResults.avgRounds} Rounds</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Expected Casualties:</span>
                <span className={simResults.avgCasualties > 0.5 ? 'text-rose-400 font-bold text-sm' : 'text-emerald-400 font-bold text-sm'}>
                  {simResults.avgCasualties} Downed
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Turn Velocity:</span>
                <span className="text-amber-300 font-bold text-sm">~{Math.round(simResults.avgRounds * (heroTokens.length + enemyTokens.length))} Turns</span>
              </div>
            </div>

            {/* Balancing Advisory Callout */}
            <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-600/40 text-[11px] text-slate-300 flex items-start gap-2">
              <span className="text-base shrink-0">💡</span>
              <div>
                <span className="font-bold text-cyan-300 block mb-0.5">Encounter Tuning Guidance:</span>
                {simResults.winRate >= 95 ? (
                  <span>The encounter is currently trivial for the party. Consider adding 1 Minion or giving the adversary squad leader +2 Defense DC to create tactical tension.</span>
                ) : simResults.winRate >= 75 ? (
                  <span>The encounter is well calibrated for standard heroic tactical engagement. Expect 1-2 operatives to take significant Vitality damage.</span>
                ) : simResults.winRate >= 50 ? (
                  <span>High stakes engagement. Operatives will need to coordinate focus fire, use cover, and spend Karma to avoid casualties.</span>
                ) : (
                  <span>Extreme lethal threat! Party is favored to suffer severe casualties or a potential TPK. Consider lowering enemy numbers or providing environmental cover advantage.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncounterSimModal;
