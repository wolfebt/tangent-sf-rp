/**
 * Semantic Rulebook Engine & RAG Index for Tangent SF RP
 * Indexes canonical core rules across all Operator and Architect rulebooks.
 */

import { getOpfsWorkerManager } from './opfsWorkerManager.ts';
import { queryOmnicortexRAG } from './omnicortexVectorRag.ts';

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
- **Opposed Rolls:** Attacker's Check vs. Defender's Defense Check (2d10 + Agility + Defense Skill). Attacker wins on higher roll. DEFENDER WINS ALL TIES.
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
    keywords: ['vitality', 'health', 'structure', 'synthetic', 'damage', 'lethal', 'non-lethal', 'nonlethal', 'fatigue', 'stamina', 'toughness', 'cuts', 'burns'],
    summary: 'Base 30 Vitality (VP) absorbs non-lethal fatigue; Base 30 Health (HP) tracks lethal trauma; Synthetics use a unified 60 SP Structure Pool. Stamina provides Toughness DR, not flat VP/HP.',
    content: `Tangent SF RP strictly differentiates non-lethal wear from lethal trauma:
- **🔵 Vitality Pool (Base 30 VP):** Physical resilience, luck, and stamina. Absorbs non-lethal damage, fatigue, sensory shock, and initial combat strain. Stamina does NOT add a flat bonus to base Vitality or Health; pools are increased solely through Size tier, traits, features, or CP purchases (1 CP = +2 pts). Overflow beyond 0 spills directly into Health as lethal damage.
- **🔴 Health Pool (Base 30 HP):** Structural biological integrity and life force. Damage here is lethal trauma (bullet wounds, cuts, burns, penetrating injuries). Recovers slowly. Reducing Health to 0 enters the Mortality State.
- **🤖 Structure Pool (Synthetics & Mecha, Base 60 SP for Medium):** Synthetics, androids, vehicles, and mecha possess a unified Structure Pool (replacing Vitality and Health). Synthetics are completely IMMUNE to non-lethal damage, biological toxins, vacuum, and suffocation. Synthetic limbs possess 50% more durability/damage threshold before being Disabled or Destroyed.
- **🛡️ Armor DR & Toughness (Stamina):** Incoming damage is reduced by Target Armor DR + Target Stamina/Toughness (CON) natural Damage Reduction before penetrating into Vitality or Structure.
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
- **Limb Damage & Critical Injuries:** Called shots (-1 to -3 Strike) apply direct trauma to specific limbs (Disabled at >= 1/3 Max HP, Destroyed at >= 2/3 Max HP). Synthetic limbs have 50% higher damage thresholds.`
  },
  {
    id: 'action_economy',
    topic: 'Skill Tier Action Economy & Combat Turn Budget',
    category: 'Combat & Tactics',
    source: 'docs/game rules/operator/3.00 COMBAT.md',
    page: 41,
    keywords: ['action', 'economy', 'turn', 'round', 'skill tier', 'standard', 'movement', 'reaction', 'active defense', 'focus'],
    summary: 'Turn actions are unlocked by Skill Tier (Rank 0: Full Round, 1–5: 1 action, 6–10: 2nd at -5, 11–15: 3rd at -10...). Active Defense has cumulative -5 subsequent penalties.',
    content: `Combat capability and action budget are determined by Skill Tier (NO Action Points / AP):
- **Skill Tier Actions:**
  - **Rank 0 (Untrained):** Full Round Action required for a single check.
  - **Rank 1–5 (Novice / Studied):** 1st action at base score (+2 Focus Bonus).
  - **Rank 6–10 (Professional / Trained):** 2nd action at base score -5 (+3 Focus Bonus).
  - **Rank 11–15 (Expert):** 3rd action at base score -10 (+4 Focus Bonus).
  - **Rank 16–20 (Master):** 4th action at base score -15 (+5 Focus Bonus).
  - **Rank 21–25 (Grand Master):** 5th action at base score -20 (+6 Focus Bonus).
  - **Rank 26–30 (Pinnacle):** 6th action at base score -25 (+7 Focus Bonus).
- **Active Defense Reactions:** An operative may make as many Active Defense checks as allowed by their Defense Skill Rank, with a cumulative -5 penalty after the first reaction.
- **Standard Actions:** Attack, Active Defense, Aiming (+2 Strike per round, up to 1/2 Skill Rank), Called Shot (-2 Head/Arms, -1 Legs, -3 Optics), Feint (Bluff vs Insight).
- **Movement Actions:** Evasive Movement (+1 base Defense, +1 per 10ft speed used), Subtle movement (stealth), Bracing (negates heavy recoil, advantage vs trip/shove).`
  },
  {
    id: 'cover_evasion',
    topic: 'Cover, Evasion, EDGE & Defense Modifiers',
    category: 'Combat & Tactics',
    source: 'docs/game rules/operator/3.00 COMBAT.md',
    page: 75,
    keywords: ['cover', 'evasion', 'defense', 'dc', 'cr', 'edge', 'half cover', 'full cover', 'aiming', 'flanking'],
    summary: 'Opposed Defense is 2d10 + Agility + Defense Skill (Defender wins ties); Unopposed baseline is CR 15. Half Cover grants +2; Full Cover grants +4; Aiming grants +2/round.',
    content: `Target Defense and tactical EDGE modifiers:
- **Active Opposed Defense:** 2d10 + Agility modifier + Defense Skill Rank + Situational Modifiers (Defender wins all ties).
- **Unopposed Static Baseline:** CR 15 for a Medium target at Short range (modified by Size, Range, Movement, and Cover).
- **Cover Modifiers:**
  - **Half Cover:** +2 bonus to Defense / CR (low walls, crates, dense foliage).
  - **Full Cover:** +4 bonus to Defense / CR or total line-of-sight blockage.
- **Moving Target Modifiers:**
  - Running: -2 attack penalty for ranged fire.
  - Moving 20+ ft in a round: +2 Defense / CR.
  - Moving 40+ ft in a round: +4 Defense / CR.
  - Total Defense / Dodge: +4 Defense (spends action to focus on evasion).
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
- **Metafocus Level (ML):** Scales from ML 0 (Null/Mundane) to ML 5 (Cosmic / Deific Ascendant).`
  },
  {
    id: 'karma_system',
    topic: 'Karma System, Heroic Luck & Karmic Debt',
    category: 'Karma & Fate',
    source: 'docs/game rules/operator/1.00 INTRODUCTION.md & 1.09 HINDRANCES.md',
    page: 58,
    keywords: ['karma', 'fate', 'luck', 'reroll', 'i got this', 'not what i meant', 'shake it off', 'second wind', 'so mote it be', 'by will alone', 'triumph', 'debt', 'hindrance'],
    summary: 'Operatives start with Base 3 Karma points, refreshing per session (not rest). 6 canonical spending actions (1 KP each). Karmic Debt caps at Charisma + 1.',
    content: `Karma represents the flow of destiny and heroic luck in Tangent SF RP:
- **Pool Size:** Base 3 Karma points for all operatives. Refreshes at the start of each game session (does NOT recover via short or long rest).
- **The 6 Canonical Karma Spending Actions (1 KP each):**
  1. *"I Got This" (Advantage):* Declare before rolling to gain Advantage on any single roll (attacks, saves, skills, or damage).
  2. *"Not What I Meant" (Reroll):* Declare immediately after a roll to discard and reroll an ability or non-combat skill check (must accept 2nd roll).
  3. *"Shake it Off" (Condition Mitigation):* Declare anytime afflicted to reduce a condition's severity by 1 stage (e.g., Major to Minor for Poisoned, Stunned, Blinded).
  4. *"Second Wind" (Rapid Focus):* 1 full minute of focus replaces a Light Rest, refreshing daily limited-use abilities, special attacks, and traits.
  5. *"So Mote it Be" (Metaphysical Potency):* Declare simultaneously with a metaphysical skill or feat to boost potency (range, duration, magnitude) or activate a discipline Karma Feat.
  6. *"By Will Alone" (Narrative Agency):* Declare with Architect approval to push limits, attempt an impossible action, or emulate a feature for a scene.
- **Critical Triumph Replenishment:** Rolling a natural Critical Triumph (Double 10s) awards +1 Karma (up to maximum pool).
- **Karmic Debt:** In desperate moments, an operative can spend into negative Karma up to Charisma score + 1, triggering Architect-imposed complications.`
  },
  {
    id: 'economatrix_pricing',
    topic: 'Economatrix TSC Valuation Equation & Wealth Mechanics',
    category: 'Economy & Equipment',
    source: 'docs/game rules/operator/2.00 ECONOMATRIX.md & architect/02 ECONOMY AND WEALTH.md',
    page: 1,
    keywords: ['economy', 'price', 'credits', 'tsc', 'dc', 'cr', 'valuation', 'wealth score', 'liquidity gap', 'financial status', 'tech level', 'meta level'],
    summary: 'Universal Cost = Base * (2^TL) * (1.5^ML) and TSC Valuation V = 10 * 4^(CR/5). Golden Rule: Purchase CR <= Wealth Score.',
    content: `Canonical Economatrix and Wealth System:
- **Universal Equipment Cost Equation:** Cost = Base * (2^TL) * (1.5^ML) Credits (every +1 TL doubles cost; every +1 ML multiplies cost by 1.5x).
- **TSC Valuation Equation:** Value V = 10 * 4^(CR / 5) Terran Standard Credits (TSC), where Purchase CR = Crafting CR.
  - CR 0 = 10 TSC (Pauper ration, basic battery)
  - CR 5 = 40 TSC (Basic tool, simple blade)
  - CR 10 = 160 TSC (Standard sidearm, light ballistic armor)
  - CR 15 = 640 TSC (Plasma carbine, cybernetic oculars)
  - CR 20 = 2,560 TSC (Assault mecha hardpoint, starfighter thruster)
  - CR 25 = 10,240 TSC (Heavy combat vehicle, planetary sensor)
  - CR 30 = 40,960 TSC (Light starship hull, industrial refinery module)
- **The Golden Rule:** Any requisition with Purchase CR ≤ operative's Wealth Score (WS) succeeds automatically without rolling or reducing WS.
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
    summary: '14-Tier Scaling matrix (Miniscule to Mega Colossal). 4 Bridge Stations (Helm, Tactical, Engineering, Science/EWAR) manage shipboard operations.',
    content: `Vehicle and capital starship combat operations in Tangent SF RP:
- **14-Tier Scaling Matrix:** Ranges from Tier 0 (Miniscule / Micro-Drone) through Medium (60 SP base) up to Mega Colossal (x320 multiplier). Scale multipliers apply to weapon damage dice, structure points, speed, and proximity blast damage.
- **Bridge Stations:**
  - **Helm Station:** Evasive maneuvers (+Defense), vector propulsion, intercept courses.
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
  }).filter(e => e.score > 0);

  // Bridge with Omnicortex Vector RAG for broader rulebook recall while preserving top corpus priority
  try {
    const ragMatches = queryOmnicortexRAG(queryString, 4);
    const seenIds = new Set(scored.map(s => s.id));
    for (const { chunk, score: ragScore } of ragMatches) {
      if (!seenIds.has(chunk.id)) {
        seenIds.add(chunk.id);
        scored.push({
          id: chunk.id,
          topic: chunk.title,
          category: chunk.category,
          source: chunk.citation || 'Omnicortex Compendium',
          page: 1,
          keywords: chunk.tags || [],
          summary: chunk.formula || chunk.title,
          content: chunk.text,
          score: Math.round(ragScore * 5)
        });
      }
    }
  } catch {
    // Graceful fallback if vector store is initializing
  }

  return scored.sort((a, b) => b.score - a.score);
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
