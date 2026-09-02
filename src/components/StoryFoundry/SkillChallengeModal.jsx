import React, { useState, useMemo } from 'react';
import {
  CANONICAL_CHALLENGE_PRESETS,
  createSkillChallenge,
  evaluateSkillChallengeRoll
} from '../../services/skillChallengeService';
import AudioService from '../../services/audioService';

const SkillChallengeModal = ({
  isOpen,
  onClose,
  heroTokens = [],
  onTriggerFloatingText,
  onBroadcastMessage
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState('heist_vault_incursion');
  const [activeChallenge, setActiveChallenge] = useState(() => createSkillChallenge('heist_vault_incursion'));
  const [selectedHeroId, setSelectedHeroId] = useState(heroTokens[0]?.id || null);
  const [selectedSkill, setSelectedSkill] = useState(activeChallenge.suggestedSkills[0] || 'Stealth');
  const [situationalMod, setSituationalMod] = useState(0);
  const [isSuccessAtCost, setIsSuccessAtCost] = useState(false);

  const selectedHero = useMemo(() => {
    return heroTokens.find(h => h.id === selectedHeroId) || heroTokens[0] || { label: 'Operative', id: 'hero_default' };
  }, [heroTokens, selectedHeroId]);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId) => {
    AudioService.playTerminalBeep(780, 0.1);
    setSelectedPresetId(presetId);
    const newChallenge = createSkillChallenge(presetId);
    setActiveChallenge(newChallenge);
    setSelectedSkill(newChallenge.suggestedSkills[0] || 'Stealth');
  };

  const handleResetChallenge = () => {
    AudioService.playTerminalBeep(520, 0.1);
    const reset = createSkillChallenge(selectedPresetId);
    setActiveChallenge(reset);
  };

  const handleRollContribution = () => {
    if (activeChallenge.isCompleted) return;

    AudioService.playDiceRoll();

    // 2d10 Roll
    const d1 = Math.floor(Math.random() * 10) + 1;
    const d2 = Math.floor(Math.random() * 10) + 1;
    const isCritTriumph = d1 === 10 && d2 === 10;
    const isCritFumble = d1 === 1 && d2 === 1;

    // Check repeated skill penalty (-2)
    const isRepeated = activeChallenge.lastUsedSkill === selectedSkill;
    const repeatPenalty = isRepeated ? -2 : 0;

    const skillBonus = Math.max(0, parseInt(selectedHero.skills?.[selectedSkill] || 3, 10));
    const attrBonus = 2; // Standard average modifier
    const totalMod = skillBonus + attrBonus + situationalMod + repeatPenalty;

    const baseDiceSum = isCritTriumph ? 30 : isCritFumble ? -10 : (d1 + d2);
    const rollTotal = baseDiceSum + totalMod;

    const updated = evaluateSkillChallengeRoll(
      activeChallenge,
      selectedHero.label || 'Operative',
      selectedSkill,
      rollTotal,
      activeChallenge.baseDc,
      isCritTriumph,
      isCritFumble,
      isSuccessAtCost
    );

    setActiveChallenge(updated);

    // Audio SFX & Floating text
    if (updated.outcome === 'victory') {
      AudioService.playCombatHit(true);
      if (onTriggerFloatingText) {
        onTriggerFloatingText(window.innerWidth / 2, window.innerHeight / 3, `🏆 CHALLENGE VICTORY!`, 'heal');
      }
    } else if (updated.outcome === 'defeat') {
      AudioService.playCombatHit(true);
      if (onTriggerFloatingText) {
        onTriggerFloatingText(window.innerWidth / 2, window.innerHeight / 3, `🚨 SECURITY LOCKDOWN / DEFEAT!`, 'damage');
      }
    } else {
      AudioService.playTerminalBeep(rollTotal >= activeChallenge.baseDc ? 880 : 440, 0.12);
    }

    if (onBroadcastMessage) {
      onBroadcastMessage(`[SKILL CHALLENGE]: ${selectedHero.label} rolled ${selectedSkill} (${rollTotal} vs DC ${activeChallenge.baseDc}): Progress [${updated.currentSuccesses}/${updated.requiredSuccesses}] | Alert [${updated.currentFailures}/${updated.maxFailures}]`);
    }

    setIsSuccessAtCost(false);
  };

  const successPercent = Math.round((activeChallenge.currentSuccesses / activeChallenge.requiredSuccesses) * 100);
  const failurePercent = Math.round((activeChallenge.currentFailures / activeChallenge.maxFailures) * 100);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-fadeIn">
      <div className="bg-[#121622] border border-emerald-500/70 rounded-xl p-5 w-full max-w-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] text-white flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-emerald-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {activeChallenge.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-emerald-300">
                  Complex Skill Challenge &amp; Heist Clocks
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-950 border border-emerald-500/60 text-emerald-200">
                  DC {activeChallenge.baseDc}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {activeChallenge.title} ({activeChallenge.category})
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

        {/* Preset Selector & Reset */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Preset Scenario:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 flex-1 cursor-pointer"
            >
              {CANONICAL_CHALLENGE_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.title}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleResetChallenge}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition-colors cursor-pointer"
          >
            ↻ Reset Clocks
          </button>
        </div>

        {/* Dual Progress Clocks Bar */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          {/* Objective Goal Clock */}
          <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-950/70 border border-emerald-900/60">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                <span>🎯</span> Objective Progress Clock
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {activeChallenge.currentSuccesses} / {activeChallenge.requiredSuccesses}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${successPercent}%` }}
              />
            </div>
          </div>

          {/* Alert / Failure Clock */}
          <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-950/70 border border-rose-900/60">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                <span>🚨</span> Security Alert Clock
              </span>
              <span className="text-xs font-mono font-bold text-rose-300">
                {activeChallenge.currentFailures} / {activeChallenge.maxFailures}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-rose-500 transition-all duration-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                style={{ width: `${failurePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Outcome Alert Banner if Completed */}
        {activeChallenge.isCompleted && (
          <div className={`p-3 rounded-lg border text-center font-bold text-sm flex items-center justify-center gap-2 animate-fadeIn ${
            activeChallenge.outcome === 'victory'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
          }`}>
            <span>{activeChallenge.outcome === 'victory' ? '🏆' : '🚨'}</span>
            <span>
              {activeChallenge.outcome === 'victory'
                ? 'MISSION SUCCESS: Objective successfully breached & secured!'
                : 'SECURITY LOCKDOWN: Alert threshold breached! Hostile countermeasures engaged.'}
            </span>
          </div>
        )}

        {/* Action Input Section */}
        {!activeChallenge.isCompleted && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Operative Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Contributing Operative</label>
                <select
                  value={selectedHeroId || ''}
                  onChange={(e) => setSelectedHeroId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
                >
                  {(heroTokens.length > 0 ? heroTokens : [{ id: 'hero_1', label: 'Operative' }]).map(h => (
                    <option key={h.id} value={h.id}>🎖️ {h.label || 'Hero'}</option>
                  ))}
                </select>
              </div>

              {/* Skill Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Applied Skill</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 focus:outline-none cursor-pointer"
                >
                  {activeChallenge.suggestedSkills.map(sk => (
                    <option key={sk} value={sk}>⚡ {sk} {activeChallenge.lastUsedSkill === sk ? '(Repeated -2)' : ''}</option>
                  ))}
                  <option value="Perception">Perception</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Acrobatics">Acrobatics</option>
                </select>
              </div>
            </div>

            {/* Modifiers & Success at a Cost */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <label className="flex items-center gap-1.5 text-[10px] text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSuccessAtCost}
                  onChange={(e) => setIsSuccessAtCost(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>Success at a Cost (+1 Success / +1 Alert Tick)</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="text-[10px] text-slate-400">
                  Mod:
                  <input
                    type="number"
                    min="-10"
                    max="10"
                    value={situationalMod}
                    onChange={(e) => setSituationalMod(parseInt(e.target.value, 10) || 0)}
                    className="w-10 ml-1 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-cyan-300 text-xs"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleRollContribution}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🎲</span> Roll {selectedSkill} (2d10)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Stream */}
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[180px] pr-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Challenge History Feed</label>
          {activeChallenge.history.length === 0 ? (
            <span className="text-slate-500 text-[11px] italic p-2 text-center">No skill contributions recorded yet.</span>
          ) : (
            activeChallenge.history.map(item => (
              <div
                key={item.roundIndex}
                className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold">#{item.roundIndex}</span>
                  <span className="font-semibold text-slate-200">{item.operativeName} ({item.skillName}):</span>
                  <span className="text-slate-400">{item.eventText}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">{item.timestamp}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Close Challenge Console
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillChallengeModal;
