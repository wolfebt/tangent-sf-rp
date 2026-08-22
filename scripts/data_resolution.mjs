export const resolutionArticles = [
  {
    id: "2-01-d20-universal-resolution-engine",
    name: "2.01 The d20 Universal Resolution Engine",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 CORE RESOLUTION",
    order: 1,
    description: # 2.01 The d20 Universal Resolution Engine

The Tangent Roleplaying System is driven by a unified **twenty-sided die (d20)** mechanic for resolving all uncertain actions, combat strikes, social interactions, and environmental hazards.

---

## The Core Resolution Formula

\\text{Check Result} = d20 + \\text{Skill Rank} + \\text{Linked Attribute Modifier} + \\text{Situational Modifiers}

- **Success:** If the total meets or exceeds the Target Difficulty Class (**DC**) or Opposed Defense score, the action succeeds.
- **Failure:** If the total is less than the DC or Opposed Defense score, the action fails or introduces a narrative complication.

---

## Opposed vs. Unopposed Checks

### 1. Opposed Checks (Contested Actions)
When an action is actively resisted by another conscious entity (e.g. Melee Strike vs. Active Dodge, Bluff vs. Insight, Stealth vs. Perception):
- **Attacker Rolls:**  + \\text{Attacking Skill} + \\text{Attribute Mod}$
- **Defender Rolls:**  + \\text{Defending Skill} + \\text{Attribute Mod}$
- **The Tie-Breaker Rule:** **DEFENDER WINS ALL TIES**.

### 2. Unopposed Checks (Static Environmental Tasks)
When a character interacts with a static object, bypasses security, or targets a stationary or surprised foe:
- Attacker rolls against a fixed **Difficulty Class (DC)** set by the Architect or determined by standard benchmarks.,
    mechanic: Check = d20 + SkillRank + AttrMod + MiscMod
Opposed: AttackerRoll > DefenderRoll (Defender wins on equal scores),
    guide: Roll d20, add your skill rank and attribute modifier, and report the total to the Architect.,
    note: Critical Success (Natural 20) automatically succeeds in combat and adds bonus effect; Natural 1 is a critical complication.
  },
  {
    id: "2-02-difficulty-classes-challenge-ratings",
    name: "2.02 Difficulty Classes & Challenge Ratings",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 CORE RESOLUTION",
    order: 2,
    description: # 2.02 Difficulty Classes & Challenge Ratings

Difficulty Classes (**DCs**) define the difficulty of tasks across the galaxy, ranging from routine maintenance to deific reality-shaping.

---

## Standard Benchmark DC Table

| DC | Difficulty Rating | Required Skill Level | Example Task |
| :---: | :--- | :--- | :--- |
| **5** | Very Easy / Routine | Untrained | Climbing a sturdy ladder, driving in clear weather |
| **10** | Easy / Standard | Novice (Rank 1–5) | Picking a basic padlock, basic computer file search |
| **15** | Moderate / Challenging | Trained (Rank 6–10) | Splicing an energized wire, first aid under fire, base un-opposed shot |
| **20** | Hard / Professional | Expert (Rank 11–15) | Cracking military encryption, field-repairing a hyperdrive core |
| **25** | Very Hard / Master | Master (Rank 16–20) | Disarming an active fusion warhead, piloting blind through an asteroid storm |
| **30** | Extreme / Heroic | Grand Master (Rank 21–25)| Subverting an AI dreadnought core, performing micro-surgery in zero-g |
| **35+**| Near Impossible / Deific| Pinnacle (Rank 26–30) | Tearing open a localized spatial rift with pure metaphysical force |

---

## Challenge Ratings (CR) for Encounters

- **CR equal to Party Level:** Standard, balanced combat encounter.
- **CR = Party Level + 2:** Challenging encounter requiring tactical coordination.
- **CR = Party Level + 4:** Deadly boss encounter; risk of character mortality is high.,
    mechanic: StandardDC = 15 (Base for typical unopposed check)
ModifierScale = +/- 5 for each tier of difficulty,
    guide: Compare your total roll against the DC announced by the Architect.,
    note: Architects can set partial success thresholds (e.g. succeeding at a cost if within 2 points of the DC).
  },
  {
    id: "2-03-advantage-disadvantage-mechanics",
    name: "2.03 Advantage & Disadvantage Mechanics",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 CORE RESOLUTION",
    order: 3,
    description: # 2.03 Advantage & Disadvantage Mechanics

Circumstances in Tangent can grant significant situational leverage (**Advantage**) or severe impairment (**Disadvantage**).

---

## Core Rules of Advantage & Disadvantage

- **Advantage:** Roll **two twenty-sided dice ($)** and take the **higher result**. Add your standard skill and attribute modifiers.
- **Disadvantage:** Roll **two twenty-sided dice ($)** and take the **lower result**. Add your standard skill and attribute modifiers.

---

## Common Sources

### Gaining Advantage:
- Attacking an unsuspecting or blinded target.
- Firing a ballistic/energy weapon at **Point Blank Range** (within melee reach).
- Possessing specialized sensory augmentations in favorable environments.
- Flanking an enemy in close combat alongside an ally.

### Suffering Disadvantage:
- Attacking while prone, restrained, or concussed.
- Firing ranged weapons into extreme darkness or heavy smoke without thermal sensors.
- Attempting delicate technical repairs during severe planetary seismic tremors.

---

## Stacking Rules

Advantage and Disadvantage **do not stack**. If multiple sources grant Advantage, you still roll only two dice. If a character has both Advantage and Disadvantage simultaneously from different sources, they **cancel each other out completely**, resulting in a standard single die roll.,
    mechanic: Advantage = max(d20_1, d20_2) + Modifiers
Disadvantage = min(d20_1, d20_2) + Modifiers
Advantage + Disadvantage = 1d20 + Modifiers,
    guide: When Advantage is declared, roll two d20s simultaneously and choose the higher number before adding modifiers.,
    note: Advantage also applies to damage rolls when specified by special weapon properties (e.g. Point Blank shots).
  },
  {
    id: "2-04-karma-points-fate-modification",
    name: "2.04 Karma Points & Fate Modification",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 CORE RESOLUTION",
    order: 4,
    description: # 2.04 Karma Points & Fate Modification

**Karma** represents heroic momentum, cosmic destiny, and the sheer grit that separates legendary Personas from ordinary citizens.

---

## The Karma Pool

- Every character possesses a maximum **Karma Pool** based on their character tier and karma features (Base: **3 to 5 Karma Points**).
- Hindrances such as *Unlucky* reduce this pool, while features like *Lucky* expand it.

---

## Spending Karma Points

An Operator can spend 1 Karma Point to achieve one of the following heroic feats:

1. **Fate Reroll:** Reroll any single failed d20 check (attack, saving throw, or skill check) and take the new result.
2. **Impose Disadvantage:** Force an enemy targeting you to roll their attack with Disadvantage.
3. **Cheat Death:** When reduced to 0 HP and entering the Mortality state, immediately stabilize and regain 1 HP.
4. **Extra Reaction:** Execute an additional active defense reaction without suffering the cumulative -5 multiple defense penalty.
5. **Flash of Genius:** Declare an immediate tactical insight, finding a hidden exit, power conduit, or weak point in an enemy shield.

---

## Refreshing Karma

- Karma points fully refresh at the end of a **Full Rest** (8 hours of safe downtime).
- Architects may award bonus Karma points during play for exceptional roleplaying, heroic self-sacrifice, or solving complex diplomatic crises.,
    mechanic: BaseKarmaPool = 3 + KarmaFeatures - UnluckyHindrances
Reroll: Discard previous d20, roll fresh d20,
    guide: Declare Karma expenditure immediately after a roll is made, before the Architect describes the narrative outcome.,
    note: Karma cannot be spent to reroll a Natural 1 unless the character possesses the 'Karmic Mastery' feature.
  }
];
