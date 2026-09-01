export const introVolume0Articles = [
  {
    id: "0-01-operator-reference-manual",
    name: "0.01 OPERATOR Reference Manual (Player Guide)",
    category: "compendium",
    entry_type: "System Guide",
    parent: "0.00 SYSTEM & USER MANUALS",
    order: 1,
    perspective: "operator",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-0", "operator", "core-rule"],
    description: `# 0.01 OPERATOR Reference Manual (Player Guide)

The **OPERATOR** is the player who commands and embodies a Hero or Persona in the Tangent Science Fantasy Roleplay universe. As an Operator, you navigate perilous star-systems, ancient alien ruins, neon arcologies, and high-stakes metaphysical confrontations.

---

## 1. System Philosophy & Playstyle
Role-Playing Games in Tangent provide a collaborative narrative experience where science fiction and science fantasy intertwine. You are empowered to craft unique characters whose choices shape the political, tactical, and cosmic landscape.

## 2. Character Creation Pipeline
1. **Concept & Heritage:** Envision background, personality, and role.
2. **150 Build Points (BP):** Allocate points across attributes, skills, features, augmentations, and metaphysics.
3. **Faction, Origin & Occupation:** Foundations granting 60 skill ranks, 4 traits, and 4 features.
4. **Technology & Gear:** Equip weapons, armor, and gear calibrated to campaign Tech Level (TL 0–5).
5. **Secondary Tracks:** Compute Vitality, Health, Structure, Defense, Damage Resistance (DR), and Karma.`,
    mechanic: `Check Formula: d20 + Skill Rank + Attribute Mod + Situational Modifiers vs DC
Degree of Success: Success by 5+ grants Critical Impact; Failure by 5+ incurs Complications`,
    guide: `1. Open your Persona Folio.
2. Track Vitality for stamina/minor hits and Health for lethal trauma.
3. Refresh Karma points at the start of each session.`,
    note: `Operators should balance offensive actions with defensive reserves, as reactive defenses suffer cumulative penalties.`
  },
  {
    id: "0-02-architect-reference-manual",
    name: "0.02 ARCHITECT Reference Manual (Game Master Guide)",
    category: "compendium",
    entry_type: "System Guide",
    parent: "0.00 SYSTEM & USER MANUALS",
    order: 2,
    perspective: "architect",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-0", "architect", "core-rule"],
    description: `# 0.02 ARCHITECT Reference Manual (Game Master Guide)

The **ARCHITECT** is the Game Master, universe designer, referee, and lead storyteller of the Tangent SFF RPG framework. The Architect sets the parameters of worlds, crafts adversaries and factions, adjudicates rules, and maintains dramatic momentum.

---

## 1. Difficulty Class (DC) Benchmark Table
| Task Difficulty | DC | Benchmark Example |
| :--- | :---: | :--- |
| **Trivial** | DC 5 | Operating a standard civilian console; walking a sturdy beam. |
| **Easy** | DC 10 | Driving on a paved road; patching a minor hydraulic leak. |
| **Moderate** | DC 15 | Slicing a corporate terminal; picking a standard magnetic lock. |
| **Hard** | DC 20 | Bypassing military biometric security; stabilizing a fatal arterial wound. |
| **Heroic** | DC 25 | Overriding a starship reactor core during a battle; surviving a lethal vacuum breach. |
| **Legendary** | DC 30 | Re-routing an ancient Progenitor meta-dimensional conduit. |
| **Godlike** | DC 35+ | Reshaping reality across planetary sectors. |`,
    mechanic: `Unopposed DC = 15 + Size Modifier + Range Penalty + Movement Modifier
Design DC = (TL * 2) + (ML * 3) + Base Component Difficulty`,
    guide: `1. Establish planetary TL and ML before designing scenes.
2. Use Base DC 15 for average tasks under pressure; adjust in +/- 5 increments.
3. When resolving opposed checks, award ties to the defending party.`,
    note: `Keep the story moving: if a roll fails by 1-2 points, offer a Success at a Cost rather than a hard roadblock.`
  },
  {
    id: "0-05-glossary-core-metrics-physics",
    name: "0.05 Glossary, Core Metrics & UDU Physics Hierarchy",
    category: "compendium",
    entry_type: "System Glossary",
    parent: "0.00 SYSTEM & USER MANUALS",
    order: 5,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-0", "glossary", "core-rule"],
    description: `# 0.05 Glossary, Core Metrics & UDU Physics Hierarchy

## I. Core Metrics (The Math)
| Term | Domain | Definition | Range / Limit |
| :--- | :--- | :--- | :--- |
| **Rank** | Skills | Numerical training level in a skill. | 0 (Untrained) to 30 (Pinnacle) |
| **Score** | Attributes | Raw modifier of an Attribute (e.g. Strength +2). | -5 to +10 (Caps vary by Species/Tier) |
| **BP** | Creation | **Build Points**. Character creation currency. | Standard: 150 BP |
| **AP** | Progression | **Award Points**. Experience points spent 1-for-1 like BP ($1\\text{ AP} = 1\\text{ BP}$). | Standard: 1-3 AP/session |
| **DC** | Mechanics | **Difficulty Class**. Target number to meet or exceed. | 0 (Simple) to 40+ (Godlike) |
| **Karma** | Resources | Heroic meta-currency pool for rerolls. | Base 3. Refreshes per Session. |
| **Tier** | Scale | Power scale for items, adversaries, and zones. | Tier 0 (Civilian) to Tier 5 (Cosmic) |

---

## II. Physics & Capacity (The UDU System)
Standard Metric: **1 Module = 10 Mounts = 100 Sockets = 1,000 Nodes = 10,000 UDU**

| Unit | Scale Domain | Physical Equivalency | Practical Application |
| :--- | :--- | :--- | :--- |
| **Node** | Augmentations | 10 grams / 0.1 Socket | Cybernetic neural chips, micro-implants, sensor nodes. |
| **Socket** | Gear & Weapons | 1 kilogram / 1 Mod | Weapon scopes, armor plates, battery capacitors, gear modules. |
| **Mount** | Mecha & Vehicles | 100 kilograms / 10 Sockets | Heavy vehicle cannons, jump jets, reinforced shielding. |
| **Module** | Architecture & Ships | 10 metric tons / 10 Mounts | Prefab habitats, starship staterooms, medbays, cargo bays. |

---

## III. Survival & Combat Metrics
| Term | Domain | Definition | Range / Limit |
| :--- | :--- | :--- | :--- |
| **Vitality** | Integrity | Physical stamina, luck, and kinetic shielding. Absorbs initial damage. | Base 30 + (5 × Sta) + (5 per BP). Recovers fast. |
| **Health** | Integrity | Structural biological life force. Damage here is lethal trauma. | Base 30 + (5 × Sta) + (5 per BP). Recovers slow. |
| **Structure** | Integrity | Structural durability equivalent for Synthetics, Mecha, and Objects. | Varies by Chassis / Size. |
| **DR** | Defense | Damage Reduction. Subtracted from incoming damage before Vitality loss. | 0 (Clothing) to 60+ (Capital Ship) |
| **Defense** | Combat | Target number to hit a character (Passive). | 10 + Agility + Defense Skill + Mods |
| **Stigma** | Social | Reaction penalty resulting from prejudice or xenophobia. | Variable penalty to social checks. |`,
    mechanic: `1 Module = 10 Mounts = 100 Sockets = 1,000 Nodes = 10,000 UDU
Essence Pool = (STR + AGI + STA + INT + WIS + CHA) + Attune Rank
Crafting Value Formula: Value = 10 * 4^(DC / 5) Credits`,
    guide: `Reference this glossary for canonical term definitions, formulas, and math ranges.`,
    note: `All modules, apps, and calculators strictly adhere to these UDU capacity and attribute formulas.`
  }
];
