/**
 * Semantic Rulebook Engine & RAG Index for Tangent SFF RP
 * Indexes core rules across all 44 Operator and Architect rulebooks.
 */

export const RULEBOOK_CORPUS = [
  {
    id: 'combat_resolution',
    topic: '2d10 Dual-Resolution & Critical Rolls',
    category: 'Combat & Resolution',
    source: 'Operator’s Handbook',
    page: 24,
    keywords: ['2d10', 'roll', 'check', 'critical', 'fumble', 'triumph', 'double', 'skill check', 'resolution'],
    summary: 'Roll 2d10 + Skill Level + Linked Attribute + Situational Modifiers vs. Target Defense DC.',
    content: `All checks in Tangent SF RP utilize the 2d10 Dual-Resolution System.
- **Roll Formula:** 2d10 + Skill Rank + Linked Attribute Modifier + Modifiers vs. DC.
- **Critical Triumph (Natural Double 10s):** Counts as an automatic 30 on the dice plus modifiers. Triggers exceptional narrative breakthrough or max weapon damage.
- **Critical Fumble (Natural Double 1s):** Counts as an automatic -10 on the dice plus modifiers. Triggers weapon malfunction, accidental slip, or adverse complication.
- **Margin of Success (MoS):** If Roll exceeds DC by 10 or more (MoS ≥ 10), the strike achieves a Critical Hit (+50% bonus damage).`
  },
  {
    id: 'damage_pools',
    topic: 'Damage Classification: Vitality, Health & Synthetic Structure',
    category: 'Health & Damage',
    source: 'Operator’s Survival Guide',
    page: 38,
    keywords: ['vitality', 'health', 'structure', 'synthetic', 'damage', 'lethal', 'non-lethal', 'nonlethal', 'fatigue', 'stress', 'cuts', 'burns'],
    summary: 'Vitality tracks non-lethal stress/fatigue; Health tracks lethal trauma; Synthetics use Structure and are immune to non-lethal damage.',
    content: `Tangent SF RP strictly differentiates non-lethal wear from lethal trauma:
- **🔵 Vitality Pool (30 + Willpower):** Measures non-lethal damage capacity, environmental stress, sensory shock, and physical/mental fatigue. Overflow beyond 0 spills into Health.
- **🔴 Health Pool (30 + Fortitude):** Measures lethal trauma capacity (bullet wounds, cuts, burns, shrapnel, and penetrating injuries). Reducing Health to 0 initiates the Death Clock.
- **🤖 Structure Pool (Synthetics & Mecha):** Synthetics, androids, and vehicles have no biological nervous system. They possess a single unified Structure Pool (equal to Vitality + Health) and are **completely IMMUNE to non-lethal damage**.`
  },
  {
    id: 'massive_damage_death_clock',
    topic: 'Massive Damage & Death Clock Rules',
    category: 'Health & Damage',
    source: 'Architect’s Field Manual',
    page: 52,
    keywords: ['massive damage', 'death clock', 'death', 'stabilize', 'dying', 'incapacitated', 'stamina', 'unconscious'],
    summary: 'Lethal hits >= Stamina force a DC 15 Fortitude save; Health at 0 begins a Stamina-round death clock.',
    content: `Wound trauma and mortality mechanics:
- **Massive Damage Rule:** If a single lethal strike to Health equals or exceeds the target's Stamina (STA) score, the target must immediately make a **DC 15 Fortitude Save** or suffer instant heart failure/fatal shock (Death's Door).
- **Death Clock:** When an operative's Health drops to 0, they fall unconscious and prone. A countdown begins equal to their **Stamina score in combat rounds**. If not stabilized via Medicine (DC 15) or trauma tech before the clock reaches 0, the operative dies.
- **Revivification Debt:** If resuscitated from death, the operative carries a **-5 AP Experience Debt** until repaid.`
  },
  {
    id: 'action_economy',
    topic: 'Action Economy (Turn Action Budget)',
    category: 'Combat & Tactics',
    source: 'Operator’s Handbook',
    page: 30,
    keywords: ['action', 'economy', 'turn', 'round', 'standard', 'move', 'reaction', 'free action', 'pace'],
    summary: 'Each operative receives 1 Standard Action, 1 Move Action, 1 Reaction, and Free Actions per round.',
    content: `Turn budget in tactical combat:
- **1 Standard Action:** Weapon strike, casting a metaphysical invocation, heavy technical repair, complex item deployment.
- **1 Move Action:** Moving up to Pace, drawing or stowing weapons, reloading magazines/cells, taking cover.
- **1 Reaction (1 / Round):** Active parry, evasive dodge, opportunity attack against exiting enemy, emergency kinetic barrier.
- **Free Actions:** Brief tactical radio call, dropping an item, toggling cybernetic HUD modes.`
  },
  {
    id: 'cover_evasion',
    topic: 'Cover, Evasion & Defense DC Modifiers',
    category: 'Combat & Tactics',
    source: 'Tactical Combat Codex',
    page: 18,
    keywords: ['cover', 'evasion', 'defense', 'dc', 'half cover', 'full cover', 'dodge', 'aim'],
    summary: 'Base Defense DC is 10 + Agility + Defense skill. Half Cover grants +2 DC; Full Cover grants +4 DC.',
    content: `Target Defense calculation:
- **Base Defense DC:** 10 + Agility modifier + Defense/Acrobatics Skill rank.
- **Half Cover:** +2 bonus to Defense DC (low walls, crates, debris).
- **Full Cover:** +4 bonus to Defense DC or total line-of-sight blockage.
- **Evasive Stance:** Spending a Move Action to weave grants +2 Defense DC against ranged attacks until next turn.
- **Aim Action:** Spending a Move Action to steady aim grants +2 on the next Standard attack roll.`
  },
  {
    id: 'essence_burn',
    topic: 'Metaphysical Essence, Channeling & Fatigue Stages',
    category: 'Metaphysics & Psionics',
    source: 'Metaphysical Grimoire',
    page: 64,
    keywords: ['essence', 'burn', 'fatigue', 'psionics', 'magic', 'invocations', 'channeling', 'overburn'],
    summary: 'Channeling past 0 Essence triggers progressive Fatigue Stages and drains Health directly.',
    content: `Channeling metaphysical energies:
- **Essence Pool:** Derived from Intellect + Willpower or Meta Level (ML).
- **Fatigue Stage 1 (Fatigued):** -1 check penalty to all physical actions.
- **Fatigue Stage 2 (Exhausted):** -2 check penalty to all actions; Pace is reduced by 50%.
- **Fatigue Stage 3 (Essence Overburn):** Any essence points spent past 0 inflict direct lethal Health/Vitality trauma per point spent.`
  },
  {
    id: 'karma_system',
    topic: 'Karma Actions & Replenishment',
    category: 'Karma & Fate',
    source: 'Architect’s Master Codex',
    page: 88,
    keywords: ['karma', 'fate', 'luck', 'reroll', 'defy death', 'soak', 'replenish', 'triumph'],
    summary: 'Spend Karma for Advantage, Maximum Damage, Extra Action, or Defying Death; replenished on Critical Triumphs or Rest.',
    content: `Karma is the measure of narrative heroic luck:
- **6 Canonical Karma Actions:**
  1. *Heroic Edge:* Roll with Advantage on any check.
  2. *Maximum Output:* Maximize all weapon damage dice.
  3. *Second Wind:* Take an immediate extra Move or Standard action.
  4. *Fate Soak:* Negate all damage from a single lethal attack.
  5. *Defy Death:* Automatically stabilize and reset Death Clock to max Stamina.
  6. *Plot Surge:* Introduce a favorable narrative complication or escape route.
- **Replenishment:** Karma recharges upon rolling a Critical Triumph (Double 10s) or completing an extended rest.`
  },
  {
    id: 'economatrix_pricing',
    topic: 'Economatrix TSC Valuation Equation & Trade Codes',
    category: 'Economy & Equipment',
    source: 'Economatrix Trade Matrix',
    page: 12,
    keywords: ['economy', 'price', 'credits', 'tsc', 'dc', 'valuation', 'trade', 'margin', 'cost'],
    summary: 'Item base cost follows V = 10 * 4^(DC / 5) with planetary trade code multipliers.',
    content: `Canonical market pricing in the TSC (Terran Standard Credit) system:
- **Core Formula:** Value V = 10 * 4^(DC / 5).
- **Examples:**
  - DC 5 Item = 40 TSC (Basic tool, simple blade)
  - DC 10 Item = 160 TSC (Standard sidearm, light armor)
  - DC 15 Item = 640 TSC (Plasma carbine, cybernetic oculars)
  - DC 20 Item = 2,560 TSC (Military assault mecha hardpoint, starfighter sub-engine)
  - DC 25 Item = 10,240 TSC (Heavy battleship spinal accelerator)
- **Trade Codes:** Agricultural worlds discount food/bioware by 25%; Industrial worlds discount tech/weapons by 20%.`
  },
  {
    id: 'starship_bridge',
    topic: 'Starship Bridge Stations & Subsystem Damage',
    category: 'Vehicles & Starships',
    source: 'Voidfarer’s Operations Manual',
    page: 48,
    keywords: ['starship', 'bridge', 'vehicle', 'helm', 'tactical', 'engineering', 'ewar', 'subsystems', 'shields', 'reactor'],
    summary: '4 bridge stations (Helm, Tactical, Engineering, EWAR) govern shipboard actions with 6 targeted subsystems.',
    content: `Capital and vehicle combat bridge operations:
- **Helm Station:** Evasive maneuvers (+2 Defense DC), Vector Boost (Double Pace), Intercept vectors.
- **Tactical Station:** Spinal weapons volleys, Point-Defense Flak grids, Targeted subsystem strikes.
- **Engineering Station:** Power Unit (PU) routing (Shields +15 SP, Weapons +4 Dmg, Thruster Overcharge) and damage control.
- **Science / EWAR Station:** Active ECM sensor jammers (-2 hostile lock check), Cyber-breach firewall hacks.
- **Subsystem Degradation:** Bridge, Thrusters, Shields, Weapons, Reactor Core, and Life Support degrade across Operational -> Damaged (-2 / 50% capacity) -> Destroyed (Offline).`
  }
];

export function queryRulebook(queryString) {
  if (!queryString || !queryString.trim()) {
    return RULEBOOK_CORPUS;
  }

  const terms = queryString.toLowerCase().trim().split(/\s+/);

  const scored = RULEBOOK_CORPUS.map(entry => {
    let score = 0;
    const text = `${entry.topic} ${entry.category} ${entry.source} ${entry.summary} ${entry.content} ${entry.keywords.join(' ')}`.toLowerCase();

    terms.forEach(term => {
      if (entry.topic.toLowerCase().includes(term)) score += 10;
      if (entry.keywords.some(k => k.includes(term))) score += 8;
      if (entry.summary.toLowerCase().includes(term)) score += 5;
      if (text.includes(term)) score += 2;
    });

    return { ...entry, score };
  });

  return scored
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score);
}
