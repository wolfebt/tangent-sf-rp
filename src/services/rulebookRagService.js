/**
 * Semantic Rulebook Engine & RAG Index for Tangent SF RP
 * Indexes canonical core rules across all Operator and Architect rulebooks.
 */

import { getOpfsWorkerManager } from './opfsWorkerManager.ts';

export const RULEBOOK_CORPUS = [
  {
    id: 'combat_resolution',
    topic: '2d10 Dual-Resolution & Critical Rolls',
    category: 'Combat & Resolution',
    source: 'docs/game rules/operator/3.00 COMBAT.md',
    page: 27,
    keywords: ['2d10', 'dual', 'resolution', 'roll', 'check', 'critical', 'fumble', 'triumph', 'double', 'skill check', 'combat'],
    summary: 'Roll 2d10 + Skill Rank + Linked Attribute Modifier + Modifiers vs. Target Defense or Challenge Rating (CR). Defender wins all ties.',
    content: `All checks in Tangent SF RP utilize the 2d10 Dual-Resolution System.
- **Roll Formula:** 2d10 + Skill Rank + Attribute Modifier + Situational Modifiers vs. Target Defense / CR.
- **Opposed Rolls:** Attacker's Check vs. Defender's Defense Check (Agility + Defense Skill). Attacker wins on higher roll. DEFENDER WINS ALL TIES.
- **Unopposed Baseline:** Standard static difficulty baseline is CR 15 (Average difficulty for a typical medium target at short range, modified for target's Size, Range, and Movement).
- **Critical Triumph (Natural Double 10s):** Automatic success / triumph, achieving exceptional narrative breakthrough, maximum weapon damage dice, or maximum effect.
- **Critical Fumble (Natural Double 1s):** Automatic failure / setback, triggering weapon malfunction, accidental slip, or adverse narrative complication.
- **Margin of Success (MoS):** Exceeding the Target Defense by significant margins triggers amplified effects (e.g. automatic weapon hit accumulation, called shot direct penetration).`
  },
  {
    id: 'damage_pools',
    topic: 'Damage Classification: Vitality, Health & Synthetic Structure',
    category: 'Health & Damage',
    source: 'docs/game rules/operator/1.00 INTRODUCTION.md & 3.00 COMBAT.md',
    page: 83,
    keywords: ['vitality', 'health', 'structure', 'synthetic', 'damage', 'lethal', 'non-lethal', 'nonlethal', 'fatigue', 'stamina', 'cuts', 'burns'],
    summary: 'Vitality absorbs non-lethal fatigue; Health tracks lethal trauma; Synthetics use a unified Structure Pool and are immune to non-lethal damage.',
    content: `Tangent SF RP strictly differentiates non-lethal wear from lethal trauma:
- **🔵 Vitality Pool (Base 30 + 5/BP, max +5×STA):** Physical resilience, luck, and stamina. Absorbs non-lethal damage, fatigue, sensory shock, and initial combat strain. Recovers quickly. Overflow beyond 0 spills directly into Health as lethal damage.
- **🔴 Health Pool (Base 30 + 5/BP):** Structural biological integrity and life force. Damage here is lethal trauma (bullet wounds, cuts, burns, penetrating injuries). Recovers slowly. Reducing Health to 0 enters the Mortality State.
- **🤖 Structure Pool (Synthetics & Mecha):** Synthetics, androids, vehicles, and mecha possess a unified Structure Pool (replacing Vitality and Health). Synthetics are completely IMMUNE to non-lethal damage, biological toxins, vacuum, and suffocation. Synthetic limbs possess 50% more durability/damage threshold before being Disabled or Destroyed.
- **🛡️ Armor DR & Constitution:** Incoming damage is reduced by Target Armor DR + Target Constitution (CON) Modifier before penetrating into Vitality or Structure.
- **⚡ Damage Types:** Kinetic (Blunt, Slashing, Piercing; Force ignores 1/2 DR), Energy (Fire, Cold, Sonic, Voltic, Corrosive, Disruptor), Radiation (Ra-D), and Mental (ignores physical armor).`
  },
  {
    id: 'massive_damage_death_clock',
    topic: 'The Mortality State, Bleeding Out & Stabilization',
    category: 'Health & Damage',
    source: 'docs/game rules/operator/3.00 COMBAT.md',
    page: 255,
    keywords: ['mortality state', 'death clock', 'bleeding out', 'stability', 'stabilize', 'dying', 'incapacitated', 'constitution', 'unconscious', 'massive damage'],
    summary: 'When Health reaches 0, the operative enters the Mortality State: prone, incapacitated, bleeding out 1 Stability/turn until stabilized (CR 15 Medicine).',
    content: `Wound trauma and mortality mechanics in Tangent SF RP:
- **The Mortality State (0 Health):** When a character's Health Points reach 0, they immediately collapse:
  - **Prone & Incapacitated:** The operative falls prone and cannot take actions.
  - **Bleeding Out:** At the beginning of each of the character's turns, they suffer 1 point of Stability Damage.
  - **Stability Threshold:** A character possesses Stability Points equal to Constitution (CON) Score + 5.
  - **Death:** If Stability Points are reduced to 0, the character is permanently dead.
- **Stabilization & Recovery:** The character stops Bleeding Out and stabilizes if they receive metaphysical healing or a successful Medicine Check (CR 15) is made to aid them.
- **Limb Damage & Critical Injuries:** Called shots (-2 to -5 Strike) apply direct trauma to specific limbs. Biological limbs become Disabled or Destroyed; Synthetic limbs have 50% higher damage thresholds.`
  },
  {
    id: 'action_economy',
    topic: 'Skill Tier Action Economy & Combat Turn Budget',
    category: 'Combat & Tactics',
    source: 'docs/game rules/operator/3.00 COMBAT.md',
    page: 41,
    keywords: ['action', 'economy', 'turn', 'round', 'skill tier', 'standard', 'movement', 'reaction', 'active defense', 'focus'],
    summary: 'Turn actions are unlocked by Skill Tier (Rank 0: Full Round, 1–5: 1 action, 6–10: 2nd at -5, 11–15: 3rd at -10...). Active Defense has cumulative -5 subsequent penalties.',
    content: `Combat capability and action budget are determined by Skill Tier:
- **Skill Tier Actions:**
  - **Rank 0 (Untrained):** Full Round Action required for a single check.
  - **Rank 1–5 (Novice / Studied):** 1st action at base score (+2 Focus Bonus).
  - **Rank 6–10 (Professional / Trained):** 2nd action at base score -5 (+3 Focus Bonus).
  - **Rank 11–15 (Expert):** 3rd action at base score -10 (+4 Focus Bonus).
  - **Rank 16–20 (Master):** 4th action at base score -15 (+5 Focus Bonus).
  - **Rank 21–25 (Grand Master):** 5th action at base score -20 (+6 Focus Bonus).
  - **Rank 26–30 (Pinnacle):** 6th action at base score -25 (+7 Focus Bonus).
- **Active Defense Reactions:** An operative may make as many Active Defense checks as allowed by their Defense Skill Rank, with a cumulative -5 penalty after the first reaction.
- **Standard Actions:** Attack, Active Defense, Aiming (+2 Strike per round, up to 1/2 Skill Rank), Called Shot (-5 Strike penalty), Feint (Bluff vs Insight).
- **Movement Actions:** Evasive Movement (+1 base Defense, +1 per 10ft speed used), Subtle movement (stealth), Bracing (negates heavy recoil, advantage vs trip/shove).`
  },
  {
    id: 'cover_evasion',
    topic: 'Cover, Evasion, EDGE & Defense Modifiers',
    category: 'Combat & Tactics',
    source: 'docs/game rules/operator/3.00 COMBAT.md',
    page: 75,
    keywords: ['cover', 'evasion', 'defense', 'dc', 'cr', 'edge', 'half cover', 'full cover', 'aiming', 'flanking'],
    summary: 'Base Defense DC is 10 + Agility + Defense Skill. Half Cover grants +2; Full Cover grants +4; Aiming grants +2/round.',
    content: `Target Defense and tactical EDGE modifiers:
- **Passive Defense DC:** 10 + Agility modifier + Defense Skill Rank + Situational Modifiers.
- **Cover Modifiers:**
  - **Half Cover:** +2 bonus to Defense DC (low walls, crates, dense foliage).
  - **Full Cover:** +4 bonus to Defense DC or total line-of-sight blockage.
- **Moving Target Modifiers:**
  - Running: -2 attack penalty for ranged fire.
  - Moving 20+ ft in a round: +2 Defense DC.
  - Moving 40+ ft in a round: +4 Defense DC.
  - Total Defense / Dodge: +4 Defense DC (spends action to focus on evasion).
- **Tactical EDGE Modifiers:**
  - **Aiming:** +2 Strike per round of steadying aim (up to 1/2 Skill Rank).
  - **Flanking:** +2 Strike bonus when allies position on opposing sides of target.
  - **Advancing Target:** Target approaching without cover grants extra attack at -5 Strike.
  - **Retreating Target:** Target fleeing area without evasion grants extra attack at -5 Strike.`
  },
  {
    id: 'essence_burn',
    topic: 'Metaphysics Triad, Essence Pool, Surge & Strain',
    category: 'Metaphysics & Psionics',
    source: 'docs/game rules/operator/4.00 METAPHYSICS.md',
    page: 1,
    keywords: ['essence', 'burn', 'strain', 'surge', 'triad', 'attune', 'discipline', 'invocation', 'metaphysics', 'potency'],
    summary: 'The Triad governs casting: Attune (Accuracy), Discipline (Domain), Invocation (Form). Overspending causes Strain and direct damage.',
    content: `The Metaphysics framework operates on the Triad system:
- **The Triad:**
  - **Attune (Accuracy/Channeling):** Governing attribute/skill for channeling metaphysical energy.
  - **Discipline (Domain):** The 6 metaphysical disciplines: Dimension, Energy, Entropy, Illusion, Matter, and Mental.
  - **Invocation (Expression):** The specific geometric form, ray, blast, aura, construct, or weave manifested.
- **Free Casting vs. Codified Invocations:** Free casting calculates Potency from ML and Discipline rank; codified invocations provide stable, reliable parameters.
- **Essence Pool, Surge & Strain:**
  - Essence points fuel invocations.
  - Channeling past safe limits incurs Strain penalties to physical and mental checks.
  - Severe essence overburn inflicts unmitigated direct trauma to Health and Vitality.
- **Metafocus Level (ML):** Scales from ML 0 (Null/Mundane) to ML 6 (Deific Ascendant).`
  },
  {
    id: 'karma_system',
    topic: 'Karma System, Heroic Luck & Karmic Debt',
    category: 'Karma & Fate',
    source: 'docs/game rules/operator/1.00 INTRODUCTION.md & 1.09 HINDRANCES.md',
    page: 58,
    keywords: ['karma', 'fate', 'luck', 'reroll', 'defy death', 'soak', 'replenish', 'triumph', 'debt', 'hindrance'],
    summary: 'Operatives start with Base 3 Karma points, refreshing per session. 6 canonical actions. Karmic Debt allows emergency draws.',
    content: `Karma represents the flow of destiny and heroic luck in Tangent SF RP:
- **Pool Size:** Base 3 Karma points for all operatives. Refreshes each game session (not per rest).
- **6 Canonical Karma Actions:**
  1. *Heroic Edge:* Roll with Advantage on any check (roll 3d10, take highest two).
  2. *Maximum Output:* Maximize all weapon damage dice for an attack.
  3. *Second Wind:* Take an immediate extra action on your turn.
  4. *Fate Soak:* Negate all damage from a single lethal attack.
  5. *Defy Death:* Automatically stabilize when entering the Mortality State.
  6. *Plot Surge:* Introduce a favorable narrative twist, escape route, or serendipitous contact.
- **Critical Triumph Replenishment:** Rolling a natural Critical Triumph (Double 10s) awards +1 Karma (up to maximum pool).
- **Karmic Debt:** In desperate moments, an operative can spend past 0 Karma into Karmic Debt (up to Charisma + 1). The Architect triggers compensatory complications equal to the debt accrued.`
  },
  {
    id: 'economatrix_pricing',
    topic: 'Economatrix TSC Valuation Equation & Wealth Mechanics',
    category: 'Economy & Equipment',
    source: 'docs/game rules/operator/2.00 ECONOMATRIX.md & architect/02 ECONOMY AND WEALTH.md',
    page: 1,
    keywords: ['economy', 'price', 'credits', 'tsc', 'dc', 'valuation', 'wealth score', 'liquidity gap', 'financial status'],
    summary: 'Valuation equation V = 10 * 4^(DC/5). Golden Rule: Purchase DC <= Wealth Score. 12-Tier Status Hierarchy.',
    content: `Canonical Economatrix and Wealth System:
- **TSC Valuation Equation:** Value V = 10 * 4^(DC / 5) Terran Standard Credits (TSC).
  - DC 0 = 10 TSC (Pauper ration, basic battery)
  - DC 5 = 40 TSC (Basic tool, simple blade)
  - DC 10 = 160 TSC (Standard sidearm, light ballistic armor)
  - DC 15 = 640 TSC (Plasma carbine, cybernetic oculars)
  - DC 20 = 2,560 TSC (Assault mecha hardpoint, starfighter thruster)
  - DC 25 = 10,240 TSC (Heavy combat vehicle, planetary sensor)
  - DC 30 = 40,960 TSC (Light starship hull, industrial refinery module)
- **The Golden Rule:** Any requisition with Purchase DC ≤ operative's Wealth Score (WS) succeeds automatically without rolling or reducing WS.
- **Liquidity Gap & Friction:** Purchasing above WS requires Wealth checks or burning liquidity. Illiquid assets liquidated in haste suffer Liquidity Drag (selling at 25%–50% book value).
- **12-Tier Financial Status Hierarchy:** From Tier 0 (Indebted, WS 0) to Tier 11 (Faction Ruler, WS 50+).`
  },
  {
    id: 'starship_bridge',
    topic: 'Starship Bridge Stations, Subsystem Targeting & 14-Tier Scaling',
    category: 'Vehicles & Starships',
    source: 'docs/game rules/operator/1.10 SCALING.md & 3.00 COMBAT.md',
    page: 1,
    keywords: ['starship', 'bridge', 'vehicle', 'helm', 'tactical', 'engineering', 'ewar', 'subsystems', 'shields', 'scaling'],
    summary: '14-Tier Scaling matrix (Tier 0 to 13). 4 Bridge Stations (Helm, Tactical, Engineering, Science/EWAR) manage shipboard operations.',
    content: `Vehicle and capital starship combat operations in Tangent SF RP:
- **14-Tier Scaling Matrix:** Ranges from Tier 0 (Miniscule / Micro-Drone) to Tier 5 (Medium / Operative) up to Tier 13 (Cosmic Mega-Structure). Scale multipliers apply to weapon damage dice and structural integrity.
- **Bridge Stations:**
  - **Helm Station:** Evasive maneuvers (+Defense DC), vector propulsion, intercept courses.
  - **Tactical Station:** Primary energy volleys, point-defense interceptors, called subsystem targeting.
  - **Engineering Station:** Power routing between Shields, Thrusters, and Weapons; emergency damage control.
  - **Science / EWAR Station:** Electronic counter-measures (ECM), sensor locks, cyber-warfare firewall intrusion.
- **Subsystem Degradation:** Bridge, Thrusters, Shields, Weapons, Reactor Core, and Life Support degrade from Operational -> Damaged (-2 check penalty, 50% capacity) -> Destroyed (Offline).`
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

/**
 * Indexes the canonical rulebook corpus into an active OPFS SQLite worker via FTS5
 */
export async function indexRulesInOpfsWorker(worker) {
  if (!worker || typeof worker.postMessage !== 'function') return false;

  return new Promise((resolve) => {
    const queryId = `fts_idx_${Date.now()}`;
    const handler = (e) => {
      if (e.data?.queryId === queryId) {
        worker.removeEventListener('message', handler);
        resolve(e.data?.rows?.[0] || true);
      }
    };
    worker.addEventListener('message', handler);
    worker.postMessage({
      type: 'FTS_INDEX_RULES',
      queryId,
      rules: RULEBOOK_CORPUS.map(r => ({
        id: r.id,
        title: r.topic,
        category: r.category,
        content: `${r.summary}\n${r.content}`
      }))
    });
  });
}

/**
 * Asynchronously searches rules using OPFS SQLite FTS5 if a worker is provided,
 * with seamless fallback to in-memory term scoring.
 */
export async function searchRulesFtsAsync(queryString, worker = null, limit = 10) {
  if (!queryString || !queryString.trim()) {
    return RULEBOOK_CORPUS.slice(0, limit);
  }

  const activeWorker = worker || getOpfsWorkerManager().getWorker();

  if (activeWorker && typeof activeWorker.postMessage === 'function') {
    try {
      const results = await new Promise((resolve, reject) => {
        const queryId = `fts_q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const timer = setTimeout(() => {
          activeWorker.removeEventListener('message', handler);
          reject(new Error('FTS query timeout'));
        }, 1500);

        const handler = (e) => {
          if (e.data?.queryId === queryId) {
            clearTimeout(timer);
            activeWorker.removeEventListener('message', handler);
            resolve(e.data?.rows || []);
          }
        };
        activeWorker.addEventListener('message', handler);
        activeWorker.postMessage({
          type: 'FTS_SEARCH',
          queryId,
          query: queryString,
          limit
        });
      });

      if (Array.isArray(results) && results.length > 0) {
        return results;
      }
    } catch {
      // Fallback on timeout or worker error
    }
  }

  // Fallback to in-memory queryRulebook
  return queryRulebook(queryString).slice(0, limit);
}
