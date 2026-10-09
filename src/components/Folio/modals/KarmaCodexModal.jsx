import React, { useState } from 'react';

const KARMA_ACTIONS = [
  {
    id: 'i-got-this',
    name: '"I Got This"',
    cost: '1 Karma',
    timing: 'Declare BEFORE making the roll',
    scope: 'Any single dice roll (Ability, Skill, Attack, Save, Damage)',
    summary: 'Gain Advantage on the roll (roll twice, take the higher result).',
    description: 'This Karma Point expenditure option allows players to gain an advantage on any single roll. The player must declare they are using "I Got This" before making the roll. It can be used on any dice roll, including ability checks, skill checks, attack rolls, saving throws, and even damage rolls. This versatility makes it a valuable tool in various situations.',
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
    description: 'This option of the Karma mechanic allows a player to reroll an Ability Check or a non-combat Skill Check. The player must declare they are using "Not What I Meant" immediately after the initial roll. It applies to Ability Checks (Strength, Agility, etc.) and non-combat Skill Checks (Technology, Medicine, etc.). This excludes attack rolls, damage rolls, and other combat-specific rolls. The second roll\'s result must be accepted, even if it\'s worse than the first.',
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
    description: 'This Karma Point expenditure option allows characters to reduce the severity of temporary conditions affecting them. Many conditions have severity levels (Minor, Major, Critical). Spending a Karma Point allows the character to reduce the condition\'s severity by one stage. For example, a character suffering from Major Poisoning could reduce it to Minor Poisoning.',
    tag: 'Condition Relief',
    color: 'cyan'
  },
  {
    id: 'second-wind',
    name: '"Second Wind"',
    cost: '1 Karma + 1 Full Minute Focus',
    timing: '1 minute out of immediate combat / quiet focus',
    scope: 'Refreshes limited-use daily abilities, traits, or features without a Light Rest',
    summary: 'Bypasses the need for a Light Rest; instantly refreshes spent daily powers.',
    description: 'This Karma Point expenditure option allows a character to quickly refresh their abilities and resources, bypassing the need for a Light Rest. A Light Rest is a downtime period to recover spent abilities. "Second Wind" allows a character to achieve the same benefits without needing to take a Light Rest. Requires spending 1 full minute focusing on inner reserves and willpower to push through fatigue.',
    tag: 'Instant Recovery',
    color: 'blue'
  },
  {
    id: 'so-mote-it-be',
    name: '"So Mote it Be"',
    cost: '1 Karma',
    timing: 'Declare SIMULTANEOUSLY with metaphysical check',
    scope: 'Metaphysics users (Arcane, Psi, Supernatural forces)',
    summary: 'Boosts metaphysical check potency (range, duration, damage) or activates a Karma Feat.',
    description: 'This Karma Point expenditure option interacts with a character\'s metaphysical abilities, enhancing their power or enabling special feats. Available to characters with access to metaphysical disciplines. Can be spent to activate a specialized discipline Karma Feat or boost the effectiveness/range/duration of a metaphysical skill check. The expenditure must be declared along with the use of the skill or feat, not after the roll is made.',
    tag: 'Metaphysics Boost',
    color: 'purple'
  },
  {
    id: 'by-will-alone',
    name: '"By Will Alone"',
    cost: '1 Karma (spent win/fail)',
    timing: 'Action declaration; requires GM judgment & approval',
    scope: 'Pushing boundaries, rule nudges, emulating basic features for a scene',
    summary: 'Attempt extraordinary or theoretically possible actions beyond normal capabilities.',
    description: 'This is a unique Karma Point expenditure, allowing characters to attempt actions that push the boundaries of their normal capabilities. The core is the GM\'s judgment. The action must be something not explicitly covered by the character\'s skills or abilities, but theoretically achievable with extreme effort, luck, or narrative justification. Could involve a nudge of a rule for one action, emulation of a basic feature for the scene, and similar low-end temporary game tweaks for character agency. Even with Karma spent, success is not guaranteed; GM may call for a check or challenge.',
    tag: 'Cinematic Agency',
    color: 'rose'
  }
];

const KarmaCodexModal = ({ isOpen, onClose, charismaScore = 0, currentKarma = 3, maxKarma = 3, plotPoints = 0 }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'actions', 'plot-points', 'debt'
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const maxDebt = Math.max(1, charismaScore + 1);
  const isDebt = currentKarma < 0;

  const filteredActions = KARMA_ACTIONS.filter(act => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return act.name.toLowerCase().includes(q) ||
      act.summary.toLowerCase().includes(q) ||
      act.description.toLowerCase().includes(q) ||
      act.scope.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto select-none font-sans">
      <div className="bg-[#0e1422] border border-cyan-500/40 rounded-xl max-w-3xl w-full p-3.5 sm:p-4 shadow-[0_0_35px_rgba(6,182,212,0.15)] text-slate-100 space-y-2.5 my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center gap-2 border-b border-cyan-900/60 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-cyan-300">
                Karma, Plot Points &amp; Karmic Debt Codex
              </h2>
              <p className="text-[10px] text-slate-400">
                Canonical Tangent Science Fantasy Roleplay Narrative Fate Engine
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Live Vitals Tracker Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 border border-slate-800/90 rounded-lg p-2 text-xs font-mono shrink-0">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Current Karma</span>
            <div className={`text-sm font-bold ${isDebt ? 'text-rose-400' : 'text-cyan-300'}`}>
              {currentKarma} / {maxKarma}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Max Karmic Debt</span>
            <div className="text-sm font-bold text-amber-400">
              -{maxDebt} <span className="text-[9px] text-slate-500 font-normal">(CHA {charismaScore} + 1)</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Plot Points</span>
            <div className="text-sm font-bold text-fuchsia-300">
              {plotPoints}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Restoration Rule</span>
            <div className="text-[10.5px] text-emerald-400 font-sans font-medium">
              Session Reset <span className="text-slate-500 font-mono text-[9px]">(No Rest Regen)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 shrink-0">
          <div className="flex flex-wrap gap-1 bg-slate-950/70 p-0.5 rounded-lg border border-slate-800 text-[11px] font-medium">
            {[
              { id: 'all', label: 'All Rules' },
              { id: 'actions', label: '6 Karma Actions' },
              { id: 'plot-points', label: 'Plot Points' },
              { id: 'debt', label: 'Negative Karma' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Filter actions or mechanics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 rounded-md px-2.5 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Content Area */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[58vh]">

          {/* Section: Pool Basics */}
          {activeTab === 'all' && (
            <div className="bg-slate-900/50 border border-cyan-900/40 rounded-lg p-2.5 space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>💠</span> Karma Pool Basics &amp; Economy
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 leading-snug">
                <div className="bg-slate-950/60 p-2 rounded-md border border-slate-800/80 space-y-0.5">
                  <div className="font-bold text-cyan-300">Default &amp; Starting Pool</div>
                  <p className="text-[10.5px] text-slate-400">Characters have <strong>3 Karma Points</strong> by default as a tactical pool to bend fate, protect allies, or alter rolls.</p>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-md border border-slate-800/80 space-y-0.5">
                  <div className="font-bold text-emerald-300">Session Reset (No Rest Recovery)</div>
                  <p className="text-[10.5px] text-slate-400">Resets to max at start of each session or chapter milestone. <strong>Karma does not recover via rest.</strong></p>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-md border border-slate-800/80 space-y-0.5">
                  <div className="font-bold text-amber-300">Heroic Gain (+1 Immediate)</div>
                  <p className="text-[10.5px] text-slate-400">The GM may award +1 Karma Point during play for exceptional roleplay, teamwork, or heroic feats.</p>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-md border border-slate-800/80 space-y-0.5">
                  <div className="font-bold text-purple-300">Increasing Maximum Pool</div>
                  <p className="text-[10.5px] text-slate-400">The <em>Karmic Blessing</em> feature increases max Karma by <strong>+1 per rank</strong>. Other increases come from story awards.</p>
                </div>
              </div>
            </div>
          )}

          {/* Section: 6 Karma Actions */}
          {(activeTab === 'all' || activeTab === 'actions') && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span>⚡</span> The 6 Core Karma Expenditures
                </h3>
                <span className="text-[9px] text-slate-500 font-mono">
                  Stack with all modifiers; no auto-success
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredActions.map(action => (
                  <div
                    key={action.id}
                    className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 rounded-lg p-2.5 space-y-1.5 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-1.5">
                        <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1">
                          <span className="text-cyan-400">❖</span> {action.name}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80 shrink-0">
                          {action.cost}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold text-cyan-200/90 leading-tight">
                        {action.summary}
                      </p>

                      <div className="space-y-0.5 text-[9.5px] text-slate-400 font-mono border-t border-slate-800/60 pt-1 leading-tight">
                        <div>
                          <strong className="text-slate-300 font-sans">⏱ Timing:</strong> {action.timing}
                        </div>
                        <div>
                          <strong className="text-slate-300 font-sans">🎯 Scope:</strong> {action.scope}
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-snug pt-1 border-t border-slate-800/40">
                      {action.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Plot Points */}
          {(activeTab === 'all' || activeTab === 'plot-points') && (
            <div className="bg-slate-900/60 border border-fuchsia-500/30 rounded-lg p-2.5 space-y-2">
              <div className="flex justify-between items-center border-b border-fuchsia-900/40 pb-1.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-300 flex items-center gap-1.5">
                  <span>🎭</span> Plot Points: Narrative Agency Resource
                </h3>
                <span className="text-[9.5px] font-mono font-bold bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-800 px-1.5 py-0.5 rounded">
                  Current: {plotPoints}
                </span>
              </div>

              <p className="text-[10.5px] text-slate-300 leading-snug">
                <strong>Plot Points</strong> are special narrative tokens awarded by the GM for active engagement, heroic sacrifices, and dramatic roleplay.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-950/70 p-2 rounded-md border border-slate-800 space-y-0.5">
                  <div className="font-bold text-fuchsia-300 text-[11px]">Separate from Karma</div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Independent pool that doesn't count against your Karma cap. Used to influence rolls or alter narrative circumstances.
                  </p>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-md border border-slate-800 space-y-0.5">
                  <div className="font-bold text-fuchsia-300 text-[11px]">Temporary &amp; Specific</div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Must be used within the specific scenario or story arc awarded. Cannot be hoarded indefinitely.
                  </p>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-md border border-slate-800 space-y-0.5">
                  <div className="font-bold text-fuchsia-300 text-[11px]">Compensation &amp; Balance</div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Often granted after severe setbacks beyond player control to rebalance story agency.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Negative Karma (Karmic Debt) */}
          {(activeTab === 'all' || activeTab === 'debt') && (
            <div className="bg-slate-900/60 border border-rose-500/30 rounded-lg p-2.5 space-y-2">
              <div className="flex justify-between items-center border-b border-rose-900/40 pb-1.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <span>⚖️</span> Negative Karma &amp; Karmic Debt
                </h3>
                <span className="text-[9.5px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">
                  Max Debt Limit: -{maxDebt}
                </span>
              </div>

              <div className="bg-rose-950/30 border border-rose-900/50 rounded-md p-2 text-[10.5px] text-rose-200/90 leading-snug">
                Negative Karma allows characters to push luck past 0 into <strong>"Karmic Debt"</strong>. Incurring debt is the player's choice, but applying consequences is at the GM's discretion.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-slate-950/70 p-2 rounded-md border border-slate-800 space-y-0.5">
                  <div className="font-bold text-rose-300 text-[11px] flex items-center gap-1">
                    <span>📉</span> Disadvantage
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    GM may impose Disadvantage on dramatic rolls as cosmic misfortune balances out.
                  </p>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-md border border-slate-800 space-y-0.5">
                  <div className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                    <span>🔄</span> Forced Rerolls
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    GM can force a reroll on a success at a critical juncture, triggering sudden complications.
                  </p>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-md border border-slate-800 space-y-0.5">
                  <div className="font-bold text-emerald-300 text-[11px] flex items-center gap-1">
                    <span>👾</span> NPC Advantage
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Negative Karma can empower opposing NPCs with sudden luck or tactical edge.
                  </p>
                </div>
              </div>

              <div className="p-1.5 px-2.5 rounded-md bg-slate-950 border border-slate-800 flex justify-between items-center text-[10.5px] font-mono">
                <span className="text-slate-400">Debt Boundary Formula:</span>
                <span className="text-rose-300 font-bold">CHA ({charismaScore}) + 1 = Maximum -{maxDebt} Points</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-2 text-[10.5px] text-slate-500 shrink-0">
          <span>Tangent SF RP • Operator Fate System</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 font-bold rounded-md transition-colors text-xs cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default React.memo(KarmaCodexModal);
