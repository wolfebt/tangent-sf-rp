import React, { useState } from 'react';
import { useFolio } from '../../../context/FolioContext';
import KarmaCodexModal from './KarmaCodexModal';
import ExperienceCodexModal from './ExperienceCodexModal';

const KARMA_ACTIONS = [
  {
    id: 'i-got-this',
    name: '"I Got This"',
    cost: '1 Karma',
    timing: 'Declare BEFORE making the roll',
    scope: 'Any single dice roll (Ability, Skill, Attack, Save, Damage)',
    summary: 'Gain Advantage on the roll (roll twice, take higher result).',
    description: 'Allows players to gain an advantage on any single roll. Must declare before making the roll. Can be used on any dice roll (ability checks, skill checks, attack rolls, saving throws, damage rolls).',
    tag: 'Roll Advantage',
    color: 'emerald'
  },
  {
    id: 'not-what-i-meant',
    name: '"Not What I Meant"',
    cost: '1 Karma',
    timing: 'Declare IMMEDIATELY AFTER initial roll',
    scope: 'Ability Checks and non-combat Skill Checks only (excludes combat/attacks/damage)',
    summary: 'Reroll the failed check. Must accept 2nd result even if worse.',
    description: 'Allows a player to reroll an Ability Check or non-combat Skill Check immediately after the initial roll. Excludes combat attacks and damage rolls. The second roll result must be accepted.',
    tag: 'Reroll Check',
    color: 'amber'
  },
  {
    id: 'shake-it-off',
    name: '"Shake it Off"',
    cost: '1 Karma',
    timing: 'Anytime while afflicted with a temporary condition',
    scope: 'Temporary conditions with severity stages (Poisoned, Stunned, Blinded, etc.)',
    summary: 'Reduce condition severity by one stage (e.g., Major to Minor).',
    description: 'Spending a Karma Point allows the character to reduce the condition\'s severity by one stage (e.g., Major Poisoning reduced to Minor Poisoning).',
    tag: 'Condition Relief',
    color: 'cyan'
  },
  {
    id: 'second-wind',
    name: '"Second Wind"',
    cost: '1 Karma + 1 Full Minute of Focus',
    timing: '1 minute out of immediate combat / quiet focus',
    scope: 'Refreshes limited-use daily abilities or traits without taking a Light Rest',
    summary: 'Bypasses the need for a Light Rest; instantly refreshes spent daily powers.',
    description: 'Allows a character to quickly refresh their abilities and resources, bypassing the need for a Light Rest. Requires spending 1 full minute focusing on inner reserves to push through fatigue.',
    tag: 'Instant Recovery',
    color: 'blue'
  },
  {
    id: 'so-mote-it-be',
    name: '"So Mote it Be"',
    cost: '1 Karma',
    timing: 'Declare SIMULTANEOUSLY with metaphysical skill or feat',
    scope: 'Metaphysics users (Arcane, Psi, Supernatural forces)',
    summary: 'Boosts metaphysical check potency (range, duration, damage) or activates a Karma Feat.',
    description: 'Available to characters with access to metaphysical disciplines. Can be spent to activate a specialized discipline Karma Feat or boost the effectiveness/range/duration of a metaphysical skill check.',
    tag: 'Metaphysics Boost',
    color: 'purple'
  },
  {
    id: 'by-will-alone',
    name: '"By Will Alone"',
    cost: '1 Karma (spent regardless of outcome)',
    timing: 'Action declaration; requires GM judgment & approval',
    scope: 'Pushing boundaries, rule nudges, emulating basic features for a scene',
    summary: 'Attempt extraordinary or theoretically possible actions beyond normal capabilities.',
    description: 'Cinematic agency expenditure allowing characters to attempt extraordinary actions beyond normal limits, subject to GM approval. Success is not guaranteed and may require a check.',
    tag: 'Cinematic Agency',
    color: 'rose'
  }
];

export const DiscreetFateOverrideModal = ({
  isOpen,
  onClose,
  characterData = {},
  updateField,
  economyBreakdown = {},
  derivedStats = {},
  charismaScore = 10
}) => {
  const [activeTab, setActiveTab] = useState('karma'); // 'karma' | 'experience' | 'codex'
  const [overrideKarmaInput, setOverrideKarmaInput] = useState('');
  const [overrideApInput, setOverrideApInput] = useState('');
  const [overridePlotPointsInput, setOverridePlotPointsInput] = useState('');
  const [lastActionSpent, setLastActionSpent] = useState(null);
  const [isKarmaCodexOpen, setIsKarmaCodexOpen] = useState(false);
  const [isExperienceCodexOpen, setIsExperienceCodexOpen] = useState(false);

  const {
    updateCharacterKarma,
    awardCharacterKarma,
    resetCharacterKarma,
    spendKarma,
    gainKarma,
    resetKarmaToMax,
    spendPlotPoint,
    gainPlotPoint,
    awardExperience,
    payExperienceDebt
  } = useFolio();

  if (!isOpen) return null;

  const currentKarma = parseInt(characterData.karma !== undefined ? characterData.karma : (derivedStats?.maxKarma ?? 3), 10) || 0;
  const maxKarma = derivedStats?.maxKarma ?? 3;
  const maxKarmaDebt = derivedStats?.maxKarmaDebt ?? Math.max(1, charismaScore + 1);
  const isDebt = currentKarma < 0;

  const plotPoints = Math.max(0, parseInt(characterData['plot-points'] || 0, 10));

  const earnedAP = Number(characterData?.earned_ap || 0);
  const availableAP = economyBreakdown?.availableAP ?? earnedAP;
  const experienceDebt = Math.max(0, parseInt(characterData?.experience_debt || 0, 10));
  const recentAwards = Array.isArray(characterData?.experience_awards) ? characterData.experience_awards : [];

  const heroId = characterData['character-doc-id'] || characterData.id;

  const handleSetExactKarma = async (e) => {
    e.preventDefault();
    const val = parseInt(overrideKarmaInput, 10);
    if (!isNaN(val)) {
      if (updateCharacterKarma && heroId) {
        await updateCharacterKarma(heroId, val);
      } else {
        updateField?.('karma', val);
      }
      setOverrideKarmaInput('');
    }
  };

  const handleSetExactPlotPoints = (e) => {
    e.preventDefault();
    const val = parseInt(overridePlotPointsInput, 10);
    if (!isNaN(val)) {
      updateField?.('plot-points', Math.max(0, val));
      setOverridePlotPointsInput('');
    }
  };

  const handleApplyKarmaAction = async (action) => {
    if (currentKarma <= -maxKarmaDebt) {
      alert(`Cannot spend Karma: You have reached maximum Karmic Debt (-${maxKarmaDebt}).`);
      return;
    }
    if (updateCharacterKarma && heroId) {
      await updateCharacterKarma(heroId, currentKarma - 1);
    } else if (spendKarma) {
      spendKarma(1);
    }
    setLastActionSpent(action.name);
    setTimeout(() => setLastActionSpent(null), 3000);
  };

  const handleAdjustAP = async (e) => {
    e.preventDefault();
    const delta = parseInt(overrideApInput, 10);
    if (!isNaN(delta) && delta !== 0) {
      if (delta > 0 && awardExperience) {
        await awardExperience(heroId, {
          amount: delta,
          category: 'manual_override',
          reason: 'Manual GM/Player Override',
          autoPayDebt: true
        });
      } else {
        const nextAP = Math.max(0, earnedAP + delta);
        updateField?.('earned_ap', nextAP);
      }
      setOverrideApInput('');
    }
  };

  const handleClearDebt = async () => {
    if (experienceDebt <= 0) return;
    if (payExperienceDebt && heroId) {
      await payExperienceDebt(heroId, experienceDebt);
    } else {
      updateField?.('experience_debt', 0);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#0e1422] border border-cyan-500/50 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-[0_0_40px_rgba(6,182,212,0.18)] text-slate-100 space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-cyan-900/60 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-cyan-300">
                Discreet Fate &amp; Experience Overrides
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              Manual adjustments, Karmic debt tracking &amp; optional rule codex for {characterData['char-name'] || 'Operative'}
            </p>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Quick Status Bar */}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs font-mono">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase text-slate-400">Karma Pool</span>
            <div className={`text-base font-bold ${isDebt ? 'text-rose-400' : 'text-cyan-300'}`}>
              {currentKarma} / {maxKarma}
              {isDebt && <span className="text-[9px] ml-1 text-rose-400 font-sans font-bold">(Debt)</span>}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase text-slate-400">Plot Points</span>
            <div className="text-base font-bold text-fuchsia-300">
              {plotPoints}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase text-slate-400">Award Points (AP)</span>
            <div className="text-base font-bold text-emerald-400">
              +{earnedAP} <span className="text-[10px] text-slate-400 font-sans">({availableAP} avail)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('karma')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'karma'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            💠 Karma &amp; Actions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'experience'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            🎖️ Experience &amp; AP
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('codex')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'codex'
                ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            📖 Rules Codex
          </button>
        </div>

        {/* Tab 1: Karma & Fate Overrides */}
        {activeTab === 'karma' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900/60 border border-cyan-900/40 px-3 py-2 rounded-lg text-xs">
              <span className="text-slate-400">Quickly spend, adjust, or override Karma for this persona.</span>
              <button
                type="button"
                onClick={() => setIsKarmaCodexOpen(true)}
                className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>📖</span> Complete Karma Codex
              </button>
            </div>

            {lastActionSpent && (
              <div className="bg-cyan-950/80 border border-cyan-500/70 p-2.5 rounded-lg text-xs text-cyan-200 font-bold flex items-center justify-between animate-fadeIn">
                <span>✨ 1 Karma spent on <strong>{lastActionSpent}</strong>.</span>
                <span className="text-[10px] font-mono text-cyan-400">Pool: {currentKarma} / {maxKarma}</span>
              </div>
            )}

            {isDebt && (
              <div className="bg-rose-950/50 border border-rose-600/70 p-3 rounded-lg text-xs text-rose-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <span>⚠️</span> Karmic Debt Active ({currentKarma} / -{maxKarmaDebt} Limit)
                </div>
                <div className="text-[11px] text-rose-300/80">
                  Your character is borrowing against future fate. The GM may impose Disadvantage on critical checks or introduce karmic setbacks until your debt is resolved.
                </div>
              </div>
            )}

            {/* Quick Adjustment Buttons */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Quick Karma Adjustments</span>
                <span className="text-[10px] font-mono text-slate-500">Max Debt Limit: -{maxKarmaDebt}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (updateCharacterKarma && heroId) await updateCharacterKarma(heroId, currentKarma - 1);
                    else spendKarma?.(1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
                >
                  - Spend 1 Karma
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (updateCharacterKarma && heroId) await updateCharacterKarma(heroId, currentKarma + 1);
                    else gainKarma?.(1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
                >
                  + Regain 1 Karma
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (awardCharacterKarma && heroId) await awardCharacterKarma(heroId, 1, 'Heroic Action');
                    else gainKarma?.(1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-xs font-bold text-amber-300 border border-amber-600/50 transition-colors"
                >
                  ★ Heroic Award (+1)
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (resetCharacterKarma && heroId) await resetCharacterKarma(heroId);
                    else resetKarmaToMax?.();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-xs font-bold text-cyan-300 border border-cyan-600/50 transition-colors ml-auto"
                >
                  ↻ Session Reset ({maxKarma})
                </button>
              </div>

              {/* Exact Override Form */}
              <form onSubmit={handleSetExactKarma} className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 whitespace-nowrap font-mono">Exact Override:</span>
                <input
                  type="number"
                  value={overrideKarmaInput}
                  onChange={(e) => setOverrideKarmaInput(e.target.value)}
                  placeholder={String(currentKarma)}
                  className="w-20 bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-center rounded text-white focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-600/60 text-cyan-200 text-xs font-bold rounded transition-colors"
                >
                  Set Karma
                </button>
              </form>
            </div>

            {/* Plot Points Section */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span>🎭</span> Plot Points ({plotPoints})
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Separate from session Karma</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => spendPlotPoint?.(1)}
                  disabled={plotPoints <= 0}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
                >
                  - Spend Point
                </button>
                <button
                  type="button"
                  onClick={() => gainPlotPoint?.(1)}
                  className="px-3 py-1.5 rounded-lg bg-fuchsia-950 hover:bg-fuchsia-900 text-xs font-bold text-fuchsia-300 border border-fuchsia-600/50 transition-colors"
                >
                  + Award Point
                </button>
                <form onSubmit={handleSetExactPlotPoints} className="flex items-center gap-2 ml-auto">
                  <span className="text-[11px] text-slate-400 whitespace-nowrap font-mono">Override:</span>
                  <input
                    type="number"
                    min="0"
                    value={overridePlotPointsInput}
                    onChange={(e) => setOverridePlotPointsInput(e.target.value)}
                    placeholder={String(plotPoints)}
                    className="w-16 bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-center rounded text-white focus:border-fuchsia-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-fuchsia-900/60 hover:bg-fuchsia-800 border border-fuchsia-600/60 text-fuchsia-200 text-xs font-bold rounded transition-colors"
                  >
                    Set
                  </button>
                </form>
              </div>
            </div>

            {/* The 6 Karma Actions List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 px-1">
                <span>The 6 Canonical Karma Actions</span>
                <span className="text-[10px] text-slate-500">Spend 1 Karma to invoke</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {KARMA_ACTIONS.map(action => (
                  <div key={action.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1.5 hover:border-slate-700 transition-colors">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-200">{action.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                          {action.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{action.summary}</p>
                      <div className="text-[9px] text-amber-400/90 font-mono mt-1">
                        ⏰ {action.timing}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyKarmaAction(action)}
                      className="w-full py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-600/60 border border-slate-700 text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
                    >
                      Spend 1 Karma: {action.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Experience & AP Overrides */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900/60 border border-emerald-900/40 px-3 py-2 rounded-lg text-xs">
              <span className="text-slate-400">View campaign award totals, manual AP adjustments, and debt.</span>
              <button
                type="button"
                onClick={() => setIsExperienceCodexOpen(true)}
                className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>📖</span> Complete Experience Codex
              </button>
            </div>

            {experienceDebt > 0 && (
              <div className="bg-rose-950/60 border border-rose-600/80 p-3 rounded-lg text-xs text-rose-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="font-bold flex items-center gap-1.5 text-rose-300">
                    <span>⚠️</span> Experience Debt: -{experienceDebt} XP
                  </div>
                  <div className="text-[11px] text-rose-300/80">
                    Mortality / Revivification trauma incurred from Death's Door survival.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearDebt}
                  className="px-3 py-1 bg-rose-900 hover:bg-rose-800 border border-rose-500 text-xs font-bold text-rose-100 rounded transition-colors cursor-pointer"
                >
                  Clear / Pay Debt
                </button>
              </div>
            )}

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Award Points (AP) &amp; Campaign Budget</span>
                <span className="text-[10px] font-mono text-emerald-400">1 AP = 1 Character Point</span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Total Earned AP</div>
                  <div className="text-base font-bold text-emerald-400">+{earnedAP} AP</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Available / Unspent AP</div>
                  <div className="text-base font-bold text-cyan-300">{availableAP} AP</div>
                </div>
              </div>

              {/* Manual AP Adjustment */}
              <form onSubmit={handleAdjustAP} className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 whitespace-nowrap font-mono">Adjust AP:</span>
                <input
                  type="number"
                  value={overrideApInput}
                  onChange={(e) => setOverrideApInput(e.target.value)}
                  placeholder="e.g. +1 or -1"
                  className="w-24 bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-center rounded text-white focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-600/60 text-emerald-200 text-xs font-bold rounded transition-colors cursor-pointer"
                >
                  Apply AP Adjustment
                </button>
              </form>
            </div>

            {/* Recent Awards Log */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-bold text-slate-300">
                Recent Experience Awards Log
              </div>
              {recentAwards.length === 0 ? (
                <div className="text-[11px] text-slate-500 italic py-2">
                  No experience awards recorded yet. Awards granted by the GM in the VTT will appear here.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {recentAwards.map((award, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-emerald-300">+{award.amount} AP</span>
                        <span className="text-slate-400 ml-2 font-sans text-[11px]">{award.reason || award.category}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {award.timestamp ? new Date(award.timestamp).toLocaleDateString() : 'Logged'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Canonical Rules Codex */}
        {activeTab === 'codex' && (
          <div className="space-y-3 text-xs text-slate-300 max-h-[55vh] overflow-y-auto pr-1">
            {/* Quick Codex Modal Launchers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
              <button
                type="button"
                onClick={() => setIsKarmaCodexOpen(true)}
                className="p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/50 hover:border-cyan-400 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                    <span>✨</span> Karma &amp; Fate Codex
                  </span>
                  <span className="text-xs text-cyan-400 group-hover:translate-x-0.5 transition-transform">↗</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Full reference for the 6 Karma Actions, timing triggers, Karmic Debt rules, and Plot Points.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsExperienceCodexOpen(true)}
                className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                    <span>🎖️</span> Experience &amp; AP Codex
                  </span>
                  <span className="text-xs text-emerald-400 group-hover:translate-x-0.5 transition-transform">↗</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Full reference for the Increment Rule, GM award pacing, advancement cost tables, and debt.
                </p>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-cyan-300 text-sm">Karma Points &amp; Fate Modification</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Karma represents luck, heroic destiny, and narrative momentum. Every character begins with a pool of 3 Karma Points (modified by features like Karmic Blessing or hindrances like Unlucky). Karma resets to maximum at the start of each session and does not regenerate through standard rests.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-amber-300 text-sm">Karmic Debt &amp; Consequences</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When reduced to 0 Karma, characters may continue to spend into <strong>Karmic Debt</strong> up to their Charisma score + 1 (minimum -1). Karmic debt represents borrowing against future fortune. While in debt, the GM gains narrative license to enforce disadvantage, introduce environmental hazards, or turn near-misses into complications.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-fuchsia-300 text-sm">Plot Points vs Karma</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Plot Points are distinct from Karma. While Karma is a renewable session-based fate pool, Plot Points are rare narrative currencies awarded by the GM for overcoming monumental story climaxes, exceptional roleplay, or dramatic sacrifices. They can be spent to alter active scene dynamics or introduce vital plot elements.
              </p>
            </div>
          </div>
        )}

        {/* Dedicated Karma Codex Modal */}
        <KarmaCodexModal
          isOpen={isKarmaCodexOpen}
          onClose={() => setIsKarmaCodexOpen(false)}
          charismaScore={charismaScore}
          currentKarma={currentKarma}
          maxKarma={maxKarma}
          plotPoints={plotPoints}
        />

        {/* Dedicated Experience Codex Modal */}
        <ExperienceCodexModal
          isOpen={isExperienceCodexOpen}
          onClose={() => setIsExperienceCodexOpen(false)}
          earnedAP={earnedAP}
          availableAP={availableAP}
          experienceDebt={experienceDebt}
        />

      </div>
    </div>
  );
};

export default DiscreetFateOverrideModal;
