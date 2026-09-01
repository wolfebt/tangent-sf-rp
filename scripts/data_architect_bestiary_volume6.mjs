export const architectBestiaryVolume6Articles = [
  {
    id: "6-01-entity-npc-architecture",
    name: "6.01 Universal Entity & NPC Adversary Architecture",
    category: "compendium",
    entry_type: "Architect Codex",
    parent: "6.00 BESTIARY & ADVERSARY MATRICES",
    order: 1,
    perspective: "architect",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-6", "bestiary", "npc", "entities"],
    description: `# 6.01 Universal Entity & NPC Adversary Architecture

Architects can assemble balanced NPC adversaries and tactical threats using the **3-Tier Threat Matrix**:

---

## The 3-Tier Threat Matrix
| Threat Classification | Hit Points / Structure | Armor DR | Attack Bonus | Actions / Round | Tactical Role |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Minion / Grunt** | **10 – 15 HP** | 0 – 2 DR | +2 to +4 | **1 Action** | Swarm units, corporate security guards, pirates. Defeated by 1 solid hit. |
| **Elite / Enforcer** | **35 – 60 HP** | 4 – 8 DR | +6 to +10 | **2 – 3 Actions** | Squad leaders, veteran shock troopers, bounty hunters, alpha predators. |
| **Boss / Arch-Nemesis**| **120 – 300+ HP** | 10 – 20 DR | +12 to +18 | **3 – 4 Actions** | Planetary warlords, ancient bio-horrors, dread cyber-titans. Focus Strike +6. |

---

## Universal Entity Statblock Template
Every entity record in Tangent specifies:
- **Identity & Tier:** Name, Threat Tier (Minion/Elite/Boss), Size Category.
- **Attributes Array:** STR, AGI, STA, INT, WIS, CHA (+0 to +10).
- **Combat Stats:** Vitality, Health, Armor DR, Passive Defense, Initiative Mod.
- **Offensive Actions:** Weapons, strike bonuses, damage dice, special conditions (Stun, Burn, Bleed).
- **Special Features:** Legendary reactions, resistance traits, psionic auras, damage immunities.`,
    mechanic: `Minion Overkill Rule: Excess damage dealt beyond a minion's max HP carries over to an adjacent minion in reach.
Boss Legendary Action: Bosses receive 1 out-of-turn Legendary Reaction at the end of any player's turn.`,
    guide: `Use minion squads to provide tactical pressure while elites and bosses command the objective.`,
    note: `NPC stats should be simplified for quick table tracking—omit unneeded skills.`
  },
  {
    id: "6-02-bestiary-xenofauna-matrix",
    name: "6.02 Xenofauna & Alien Beast Taxonomy Matrix",
    category: "compendium",
    entry_type: "Architect Codex",
    parent: "6.00 BESTIARY & ADVERSARY MATRICES",
    order: 2,
    perspective: "architect",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-6", "bestiary", "xenofauna", "creatures"],
    description: `# 6.02 Xenofauna & Alien Beast Taxonomy Matrix

Xenobiology classifies alien life across distinct ecological niches, behavioral patterns, and predatory adaptations:

---

## I. Ecological Niche Classifications
| Niche | Morphological Traits | Senses & Scent | Threat Profile |
| :--- | :--- | :--- | :--- |
| **Apex Predator** | Natural armor (DR 4+), rending claws, stealth hunting. | Thermal, low-light vision, scent DC 10. | Solitary ambusher; deals double crit damage. |
| **Swarm Beast** | Chitinous carapace, toxic stinger, hive synchronization. | Pheromonal tracking, vibrations. | Attacks in packs of 6-20; gains +1 strike per adjacent ally. |
| **Gargantuan Grazer**| Thick hide (DR 10+), massive structure (200+ HP), trample. | Broad ground vibration detection. | Passive until startled; crushes barricades and vehicles. |
| **Aetheric Aberration**| Phase-shifting, telepathic shrieks, energy drain. | Detects meta-energy and lifeforce. | Attacks bypass physical armor DR to deal Psychic/Entropy damage. |

---

## II. Creature Special Attack Matrices
- **Venomous Sting:** Target makes Fortitude Save (DC 15) or suffers **2d6 Poison damage** and the **Poisoned condition** for 1 minute.
- **Constrict / Swallow Whole:** Following a successful grapple, deal **3d8 Crushing damage** each round until target breaks free (Might DC 18).
- **Aura of Dread:** Entities within 30 ft must make a Will Save (DC 14) or suffer the **Frightened condition** (-2 on all checks).`,
    mechanic: `Pack Tactics: +1 to attack rolls for each allied creature within 5 ft of the target (max +5).
Camouflage: +5 bonus to Stealth checks in native planetary biome.`,
    guide: `Reference creature entries in the Omnicortex DBM Bestiary table when spawning random encounters.`,
    note: `Alien beasts do not use Credits; their salvage value comes from rare pelts, organs, and biomaterial glands.`
  },
  {
    id: "0-06-system-scaling-matrix",
    name: "0.06 System Scaling & Scale Tiers Matrix (Tier 0 to Tier 5)",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "0.00 SYSTEM & USER MANUALS",
    order: 6,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-0", "scaling", "tiers", "core-rule"],
    description: `# 0.06 System Scaling & Scale Tiers Matrix (Tier 0 to Tier 5)

Tangent scales combat, armor hardness, and weapon devastation across 6 distinct Scale Tiers:

---

## Scale Tier Classification Table
| Tier | Scale Domain | Benchmark Entities | Damage Multiplier vs Sub-Tier | Armor Hardness Multiplier |
| :---: | :--- | :--- | :---: | :---: |
| **Tier 0** | **Personal / Micro** | Operatives, civilian drones, cyber-pets, personal handguns. | **1x** (Baseline) | **1x** (Standard DR) |
| **Tier 1** | **Tactical / Light Vehicle**| Combat buggies, light support walkers, mounted heavy machine guns. | **2x** vs Tier 0 | **2x** Hardness |
| **Tier 2** | **Heavy Mecha / Armor** | Heavy combat mecha, main battle tanks, heavy defense turrets. | **5x** vs Tier 0 | **5x** Hardness |
| **Tier 3** | **Gunship / Small Vessel** | Dropships, corvettes, gunboats, planetary bunker emplacements. | **10x** vs Tier 0 | **10x** Hardness |
| **Tier 4** | **Capital Starship** | Cruisers, star destroyers, orbital defense stations. | **50x** vs Tier 0 | **50x** Hardness |
| **Tier 5** | **Super-Dreadnought / Cosmic**| World-ships, planetary battlestations, deific entities. | **250x** vs Tier 0 | **250x** Hardness |

---

## Cross-Tier Damage & Defense Rules
- **Attacking Downwards (Macro vs Micro):** Attacks deal massive scaling splash damage; personal targets hit by Tier 2+ weapons make Reflex saves to avoid instant vaporization.
- **Attacking Upwards (Micro vs Macro):** Small arms fire (Tier 0) cannot penetrate Tier 2+ Armor Hardness unless targeting dedicated weak points (Optics, exhaust vents, exposed cables) at **-10 penalty to strike**.`,
    mechanic: `Cross-Tier Attack Formula: Effective Damage = (Raw Damage * Scale Multiplier) - Target Scale DR.
Weakpoint Strike: Called shot at -10 Strike ignores Scale Hardness.`,
    guide: `Do not pit foot operatives directly against capital starships without specialized anti-materiel heavy artillery.`,
    note: `Mecha combat operates primarily at Tier 2 scale.`
  },
  {
    id: "0-07-experience-advancement-architect-guide",
    name: "0.07 Architect Guide to Experience Awards, Pacing & Downtime",
    category: "compendium",
    entry_type: "Architect Guide",
    parent: "0.00 SYSTEM & USER MANUALS",
    order: 7,
    perspective: "architect",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-0", "experience", "pacing", "architect"],
    description: `# 0.07 Architect Guide to Experience Awards, Pacing & Downtime

This guide assists Architects in pacing session awards, calculating story milestone bonuses, and adjudicating downtime training.

---

## I. Pacing Guidelines
- **Fast-Paced Heroic Campaign:** 3 – 5 AP per session + 10 AP chapter milestones. Characters advance every 2 sessions.
- **Standard Narrative Campaign:** 1 – 3 AP per session + 5 – 7 AP chapter milestones. Balanced progression.
- **Gritty / Survival Campaign:** 1 AP per session + 3 – 5 AP chapter milestones. Slow, hard-earned mastery.

---

## II. Enforcing The Increment Rule
Always verify that players increase individual traits by at most **+1 point per award event**. If a player receives a 10 AP milestone award, they must distribute points broadly across attributes, skills, and features, or bank points in their Available AP reserve for downtime training.

---

## III. Downtime Activities Matrix
- **Skill Training:** 1 week of downtime with a qualified tutor reduces training cost or satisfies increment prerequisites.
- **Crafting Projects:** Spend downtime hours assembling equipment ($Time = DC \\times 2\\text{ hours}$).
- **Faction Infiltration / Networking:** Make Etiquette or Streetwise checks to gather sector intel or forge alliances.`,
    mechanic: `Standard Award Rate: 1-3 AP/session.
Crafting Time = Crafting_DC * 2 Hours (Reduced by 50% in a fully equipped laboratory).`,
    guide: `Award AP at the end of each session after players summarize their character highlights and goals.`,
    note: `Experience debt from dying should be tracked visibly on the character folio.`
  }
];
