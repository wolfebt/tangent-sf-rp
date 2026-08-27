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
    cost: '1 Karma + 1 Full Minute of Focus',
    timing: '1 minute out of immediate combat / quiet focus',
    scope: 'Refreshes limited-use daily abilities, traits, or features without taking a Light Rest',
    summary: 'Bypasses the need for a Light Rest; instantly refreshes spent daily powers.',
    description: 'This Karma Point expenditure option allows a character to quickly refresh their abilities and resources, bypassing the need for a Light Rest. A Light Rest is a downtime period to recover spent abilities. "Second Wind" allows a character to achieve the same benefits without needing to take a Light Rest. Requires spending 1 full minute focusing on inner reserves and willpower to push through fatigue.',
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
    description: 'This Karma Point expenditure option interacts with a character\'s metaphysical abilities, enhancing their power or enabling special feats. Available to characters with access to metaphysical disciplines. Can be spent to activate a specialized discipline Karma Feat or boost the effectiveness/range/duration of a metaphysical skill check. The expenditure must be declared along with the use of the skill or feat, not after the roll is made.',
    tag: 'Metaphysics Boost',
    color: 'purple'
  },
  {
    id: 'by-will-alone',
    name: '"By Will Alone"',
    cost: '1 Karma (spent regardless of success/failure)',
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0e1422] border border-cyan-500/40 rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-[0_0_40px_rgba(6,182,212,0.15)] text-slate-100 space-y-6 my-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-cyan-900/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-cyan-300">
                Karma, Plot Points &amp; Karmic Debt Codex
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Canonical Tangent Science Fantasy Roleplay Narrative Fate Engine
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="self-end sm:self-center px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-bold border border-slate-700 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Live Vitals Tracker Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs font-mono">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Current Karma</span>
            <div className={`text-base font-bold ${isDebt ? 'text-rose-400' : 'text-cyan-300'}`}>
              {currentKarma} / {maxKarma}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Max Karmic Debt</span>
            <div className="text-base font-bold text-amber-400">
              -{maxDebt} <span className="text-[10px] text-slate-500">(CHA {charismaScore} + 1)</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Plot Points</span>
            <div className="text-base font-bold text-fuchsia-300">
              {plotPoints}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Restoration Rule</span>
            <div className="text-[11px] text-emerald-400 font-sans font-medium">
              Start of Session Reset <span className="text-slate-500 font-mono text-[9px]">(No Rest Regen)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="flex flex-wrap gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            {[
              { id: 'all', label: 'All Rules' },
              { id: 'actions', label: '6 Karma Actions' },
              { id: 'plot-points', label: 'Plot Points' },
              { id: 'debt', label: 'Negative Karma' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
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
            className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Content Area */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">

          {/* Section: Pool Basics */}
          {(activeTab === 'all') && (
            <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>💠</span> Karma Pool Basics &amp; Economy
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 leading-relaxed">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-cyan-300">Default &amp; Starting Pool</div>
                  <p>Characters have <strong>3 Karma Points</strong> by default. It serves as a tactical pool to bend fate, protect allies, or alter rolls.</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-emerald-300">Session Reset (No Rest Recovery)</div>
                  <p>Karma fully resets to max at the start of each session, or through major chapter milestones. <strong>Karma does not recover via rest.</strong></p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-amber-300">Heroic Gain (+1 Immediate)</div>
                  <p>The Architect / GM may award 1 Karma Point immediately during play for exceptional roleplay, teamwork, or "Heroic/Awesome" actions.</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-purple-300">Increasing Maximum Pool</div>
                  <p>The <em>Karmic Blessing</em> feature increases maximum Karma Pool by <strong>+1 point per rank</strong>. Otherwise, increases come from GM story awards.</p>
                </div>
              </div>
            </div>
          )}

          {/* Section: 6 Karma Actions */}
          {(activeTab === 'all' || activeTab === 'actions') && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <span>⚡</span> The 6 Core Karma Expenditures
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Stack with all other modifiers; do not guarantee automatic success
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredActions.map(action => (
                  <div
                    key={action.id}
                    className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 space-y-2.5 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        <span className="text-cyan-400">❖</span> {action.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {action.cost}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-cyan-200/90 leading-snug">
                      {action.summary}
                    </p>

                    <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 font-mono">
                      <div>
                        <strong className="text-slate-300 font-sans">⏱ Timing:</strong> {action.timing}
                      </div>
                      <div>
                        <strong className="text-slate-300 font-sans">🎯 Scope:</strong> {action.scope}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300/80 leading-relaxed pt-1 border-t border-slate-800/40">
                      {action.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Plot Points */}
          {(activeTab === 'all' || activeTab === 'plot-points') && (
            <div className="bg-slate-900/60 border border-fuchsia-500/30 rounded-xl p-4 sm:p-5 space-y-3.5">
              <div className="flex justify-between items-center border-b border-fuchsia-900/40 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 flex items-center gap-2">
                  <span>🎭</span> Plot Points: Narrative Agency Resource
                </h3>
                <span className="text-[10px] font-mono font-bold bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-800 px-2 py-0.5 rounded">
                  Current: {plotPoints}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Plot Points</strong> are a special resource in Tangent RPG, awarded by the GM to players who actively engage with the story and its dramatic challenges.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-fuchsia-300">Separate from Karma Pool</div>
                  <p className="text-[11px] text-slate-400">
                    Plot Points function similarly to Karma Points to influence rolls and actions, but exist in an independent pool and do not count toward your maximum Karma cap.
                  </p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-fuchsia-300">Temporary &amp; Specific</div>
                  <p className="text-[11px] text-slate-400">
                    Plot Points must be used within the specific scenario or story arc they were awarded in. They cannot be hoarded across long campaign campaigns.
                  </p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-fuchsia-300">Compensation &amp; Balance</div>
                  <p className="text-[11px] text-slate-400">
                    Often granted to characters who suffer severe setbacks beyond their control, balancing challenges and ensuring all players have a meaningful impact on the story.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Negative Karma (Karmic Debt) */}
          {(activeTab === 'all' || activeTab === 'debt') && (
            <div className="bg-slate-900/60 border border-rose-500/30 rounded-xl p-4 sm:p-5 space-y-3.5">
              <div className="flex justify-between items-center border-b border-rose-900/40 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <span>⚖️</span> Negative Karma &amp; Karmic Debt
                </h3>
                <span className="text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800 px-2 py-0.5 rounded">
                  Max Debt Limit: -{maxDebt}
                </span>
              </div>

              <div className="bg-rose-950/30 border border-rose-900/50 rounded-lg p-3 text-xs text-rose-200/90 leading-relaxed">
                Negative Karma allows characters to push their luck when out of points, going into <strong>"Karmic Debt"</strong>. Incurring debt is the player's choice, but allowing it and applying its consequences is entirely at the GM's discretion.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <span>📉</span> Disadvantage on Rolls
                  </div>
                  <p className="text-[11px] text-slate-400">
                    A common Karmic effect is the GM imposing Disadvantage (roll 2d20, take lower result) on dramatic rolls to reflect misfortune balancing cosmic scales.
                  </p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🔄</span> Forced Rerolls
                  </div>
                  <p className="text-[11px] text-slate-400">
                    The GM might force the character to reroll a successful roll at a critical moment, introducing sudden uncertainty or unexpected mechanical failures.
                  </p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <span>👾</span> NPC Tactical Benefits
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Negative Karma can positively empower NPCs directly opposing the character, granting enemies sudden luck, boosted skills, or surprising tactical advantages.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Debt Boundary Formula:</span>
                <span className="text-rose-300 font-bold">Charisma Score ({charismaScore}) + 1 = Maximum -{maxDebt} Points</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-3 text-xs text-slate-500">
          <span>Tangent SF RP • Operator Fate System</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 font-bold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default React.memo(KarmaCodexModal);
