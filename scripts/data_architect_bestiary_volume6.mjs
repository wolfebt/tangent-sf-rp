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
| **Apex Predator** | Natural armor (DR 4+), rending claws, stealth hunting. | Thermal, low-light vision, scent CR 10. | Solitary ambusher; deals double crit damage. |
| **Swarm Beast** | Chitinous carapace, toxic stinger, hive synchronization. | Pheromonal tracking, vibrations. | Attacks in packs of 6-20; gains +1 strike per adjacent ally. |
| **Gargantuan Grazer**| Thick hide (DR 10+), massive structure (200+ HP), trample. | Broad ground vibration detection. | Passive until startled; crushes barricades and vehicles. |
| **Aetheric Aberration**| Phase-shifting, telepathic shrieks, energy drain. | Detects meta-energy and lifeforce. | Attacks bypass physical armor DR to deal Psychic/Entropy damage. |

---

## II. Creature Special Attack Matrices
- **Venomous Sting:** Target makes Fortitude Save (CR 15) or suffers **2d6 Poison damage** and the **Poisoned condition** for 1 minute.
- **Constrict / Swallow Whole:** Following a successful grapple, deal **3d8 Crushing damage** each round until target breaks free (Might CR 18).
- **Aura of Dread:** Entities within 30 ft must make a Will Save (CR 14) or suffer the **Frightened condition** (-2 on all checks).`,
    mechanic: `Pack Tactics: +1 to attack rolls for each allied creature within 5 ft of the target (max +5).
Camouflage: +5 bonus to Stealth checks in native planetary biome.`,
    guide: `Reference creature entries in the Omnicortex DBM Bestiary table when spawning random encounters.`,
    note: `Alien beasts do not use Credits; their salvage value comes from rare pelts, organs, and biomaterial glands.`
  },
  {
    id: "0-06-system-scaling-matrix",
    name: "0.06 System Scaling & 14-Tier Size Categories Matrix",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "0.00 SYSTEM & USER MANUALS",
    order: 6,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-0", "scaling", "size-categories", "core-rule", "1.10-scaling"],
    description: `# 0.06 System Scaling & 14-Tier Size Categories Matrix

This scaling system determines how a creature or object's size affects its attributes, weapon damage dice, speed, ranges, stealth, and defense abilities.

---

## 1. The Master 14-Tier Size Matrix

| SIZE CATEGORY | SCALING MODIFIER* | STRENGTH MODIFIER | COMBAT MODIFIER | STEALTH MODIFIER | HEIGHT / LENGTH | WEIGHT | REACH |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Miniscule** | -5ds (1/12) | -32 | +32 | +20 | < 1 in | < 1 oz | 1 in |
| **Fine** | -4ds (1/6) | -16 | +16 | +16 | < 6 in | < ⅛ lb | 6 in |
| **Diminutive** | -3ds (1/3) | -8 | +8 | +12 | < 1 ft | < 1 lb | 1 ft |
| **Tiny** | -2ds (1/2) | -4 | +4 | +8 | < 2 ft | < 8 lbs | 2 ft |
| **Small** | -1ds (2/3) | -2 | +2 | +4 | < 4 ft | < 60 lbs | 3 ft |
| **Medium** | **(Base)** | **+/-0** | **+/-0** | **+/-0** | **< 8 ft** | **< 500 lbs** | **5 ft** |
| **Large** | x2 | +2 | -2 | -4 | < 16 ft | < 2 tons | 10 ft |
| **Huge** | x5 | +4 | -4 | -8 | < 32 ft | < 16 tons | 15 ft |
| **Gargantuan** | x10 | +8 | -8 | -16 | < 64 ft | < 125 tons | 20 ft |
| **Colossal** | x20 | +16 | -16 | -32 | < 128 ft | < 1K tons | 25 ft |
| **Enormous \*\*** | x40 | +32 | -32 | NO | < 512 ft | < 16K tons | — |
| **Titanic \*\*** | x80 | +64 | -64 | NO | < 1,024 ft | < 144K tons | — |
| **Super Gargantuan \*\*** | x160 | +128 | -128 | NO | < 5,280 ft | < 50M tons | — |
| **Mega Colossal \*\*** | x320 | +256 | -256 | NO | 1 Mile+ | 50M tons+ | — |

**\* Die Steps (-1 to -5 ds):** Lowers the die side value accordingly:  
d10 &rarr; d8, d8 &rarr; d6, d6 &rarr; d4, d4 &rarr; d3, d3 &rarr; d2, d2 &rarr; 1 point minimum.  
Scaling Multipliers are applied to **Weapon Dice, Speed, Area, Ranges, and Carrying Capacity**.

**\*\* Starship Scale (Enormous+):** Modifiers are extreme vs. Medium targets.  
- **Proximity Damage:** Overwhelming attacks from capital ships often simply vaporize small targets in the direct blast and **ALSO deal 1/10 Indirect Damage** (splash effect, debris, etc.) to targets not directly hit (within a radius equal to half the Strength Modifier in feet).  
*(Example: A Titanic capital ship fires on a colony—the blast vaporizes small targets with an x80 damage multiplier and deals one-tenth of that damage to a 32-ft radius for overblast and debris).*

---

## 2. Scaling in Tactical Combat

Damage is **NOT** reduced due to a target being a larger size. Larger targets possess proportionally increased Structure Points (SP) and Damage Reduction (DR) from heavier frames and armor plating:

1. **Attack Rolls:** The attacker's size does not directly modify attack rolls, but larger creatures gain reach advantages.
2. **Damage & Structure:** Weapon Dice, Structure Points, Speeds, and Ranges are multiplied by the Scaling Modifier.
3. **Defense:** The Combat Modifier adjusts Defense based on relative size.
4. **Distance:** Speed and weapon ranges scale directly with size.

---

## 3. Relative Size Combat Calculations

Shown Combat Modifiers are calibrated against Medium targets; relative modifiers are fluid:

### Larger Attacker vs Smaller Target
- **Target is Smaller than Medium:** Subtract target's Combat Modifier from attacker's Combat Modifier:  
  $$\\text{Actual Modifier} = \\text{Attacker Mod} - \\text{Target Mod}$$  
  *(Example: Large [-2] attacks Small [+2]: $-2 - 2 = -4$, granting Small significant advantage).*
- **Target is Larger than Medium (but smaller than attacker):** Divide attacker's Combat Modifier by defender's:  
  $$\\text{Actual Modifier} = \\text{Attacker Mod} / \\text{Defender Mod}$$  
  *(Example: Huge [-4] attacks Large [-2]: $-4 / -2 = -2$, granting Large moderate advantage).*

### Smaller Attacker vs Larger Target
- **Target is Larger than Medium:** Subtract target's Combat Modifier from attacker's Combat Modifier:  
  $$\\text{Actual Modifier} = \\text{Attacker Mod} - \\text{Target Mod}$$  
  *(Example: Small [+2] attacks Large [-2]: $2 - (-2) = +4$, granting Small a +4 attack advantage).*
- **Target is Smaller than Medium (but larger than attacker):** Divide attacker's Combat Modifier by defender's:  
  $$\\text{Actual Modifier} = \\text{Attacker Mod} / \\text{Defender Mod}$$  
  *(Example: Tiny [+4] attacks Small [+2]: $4 / 2 = +2$, granting Tiny moderate advantage).*

---

## 4. Meta-Tech & Invocation Chassis Scaling

When a Meta-Tech device is installed into a vehicle Mount or Module, it draws power from the host vehicle's reactor core:
$$\\text{Final Invocation Parameter} = \\text{Base Value} \\times \\text{Chassis Scale Multiplier}$$
*(Applies to Damage Dice, Range, and Area. Save DCs remain unaffected).*`,
    mechanic: `Scaling Multiplier: Weapon Dice, Speed, Range, Area * Multiplier.
Proximity Splash: Capital Ship blast deals 1/10 damage in radius of (Strength Mod / 2) feet.
Relative Combat Mod: Fluid opposed modifier based on relative Attacker and Defender size tiers.
Meta-Tech Scaling: Final Damage Dice = Base Damage Dice * Chassis Scale Multiplier.`,
    guide: `Refer to 1.10 SCALING.md in docs/game rules/operator/ for complete sizing tables and starship proximity parameters.`,
    note: `Canonical Tangent SF RP 14-Tier Size Scaling System verbatim from 1.10 SCALING.md.`
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
