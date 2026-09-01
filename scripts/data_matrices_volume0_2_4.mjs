export const additionalArchitectMatrices = [
  {
    id: "4-10-meta-tech-focus-matrix",
    name: "4.10 Meta-Tech, Focus Relics & Resonance Engineering Matrix",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "4.00 METAPHYSICS & DISCIPLINES",
    order: 10,
    perspective: "both",
    tl: 4,
    ml: 3,
    cost: 0,
    tags: ["compendium", "volume-4", "meta-tech", "focus", "psionics"],
    description: `# 4.10 Meta-Tech, Focus Relics & Resonance Engineering Matrix

**Meta-Tech** merges physical engineering and cybernetics with metaphysical resonance arrays, allowing Adepts and Tech-Mages to amplify, stabilize, and focus their reality-warping capabilities.

---

## I. Meta-Tech Hardware Classifications
| Device Class | Operational Function | Essence / Focus Bonus | Strain Buffer | Typical Cost |
| :--- | :--- | :---: | :---: | :---: |
| **Psi-Amplifier Headset** | Amplifies telepathic and kinetic potency. | +2 to Attune Checks | 1 Free Strain Soak | 2,500 Cr |
| **Aetheric Focus Crystal** | Stabilizes invocation geometric variance. | +2 Spell DC / Damage | Negates Minor Backlash | 1,200 Cr |
| **Resonance Capacitance Rig**| External storage of metaphysical Essence. | +10 Stored Essence | — | 5,000 Cr |
| **Metashift Null-Cage** | Projects localized null-field suppressing ML. | Suppresses ML by -3 | Forces Will DC 20 | 8,000 Cr |
| **Soul-Forged Weapon Matrix**| Infuses kinetic blade with elemental energy. | Deals +2d6 Energy damage | — | 3,500 Cr |

---

## II. Attunement & Hardware Installation
- Installing Meta-Tech into cybernetic chassis or weapon sockets requires a combined **Engineering (Tech) DC 15** and **Attune Check DC 15**.
- Incompatible resonance frequencies cause hardware overheating, dealing 1d8 Thermal damage to the wielder on a natural 1.`,
    mechanic: `Psi-Amp Bonus: +2 to Attune and Potency checks.
Resonance Overload: Casting on a natural 1 forces a DC 15 Fortitude save to avoid equipment burnout.`,
    guide: `Equip focus relics in weapon or armor sockets to enhance invocation potency.`,
    note: `Meta-Tech requires regular calibration during rest cycles.`
  },
  {
    id: "1-02-modular-character-matrix",
    name: "1.02.02 Modular Persona Assembly & Rapid Adversary Generator",
    category: "compendium",
    entry_type: "Architect Codex",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 12,
    perspective: "architect",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "character-matrix", "modular-builder", "architect"],
    description: `# 1.02.02 Modular Persona Assembly & Rapid Adversary Generator

The Modular Character Matrix provides a streamlined, block-based methodology for rapidly assembling NPCs, adversaries, and replacement player characters in minutes.

---

## I. The 4-Block Modular Assembly Method
1. **Chassis Block (Attributes):** Select one of 4 Primary Arrays (e.g. Combatant [+3 STR, +2 AGI], Specialist [+3 INT, +2 TECH], Socialite [+3 CHA, +2 WIS], Balanced [+1 all]).
2. **Heritage Block (Species):** Apply Species size, DR, movement, and innate features.
3. **Training Block (Occupation):** Add 10 ranks across 2 Core Skills and select 1 Signature Perk.
4. **Gear Block (Loadout):** Equip a standard TL loadout (Weapon + Armor + Gear Kit).

---

## II. Rapid NPC Threat Profiles
- **Corporate Enforcer (Tier 1):** 30 HP, DR 4, +6 Rifle Strike (2d8 Kinetic), Reflex +2.
- **Syndicate Slicer (Tier 1):** 25 HP, DR 2, +8 Hacking (Logic), +4 Pistol (1d10 Energy).
- **Adept Infiltrator (Tier 2):** 45 HP, DR 5, +8 Stealth, +8 Attune, Invocations (Phase Step, Mind Shock).
- **Heavy Shock Juggernaut (Tier 2):** 90 HP, DR 10, +10 Heavy Cannon (3d10 Kinetic, AP 6), Might +6.`,
    mechanic: `Quick Stat Formula: Health = 30 + (Sta * 5); Attack Bonus = Attribute + Skill Rank; Defense = 10 + Agility + Armor.`,
    guide: `Use these modular blocks to instantly spin up encounters during live tabletop sessions.`,
    note: `All modular archetypes adhere to the standard 150 BP math budget.`
  },
  {
    id: "1-03-species-design-matrix",
    name: "1.03.02 Species Design & Morphological Point-Buy Matrix",
    category: "compendium",
    entry_type: "Architect Codex",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 13,
    perspective: "architect",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "species-design", "cp-budget", "architect"],
    description: `# 1.03.02 Species Design & Morphological Point-Buy Matrix

The Species Design Matrix establishes mathematical formulas for pricing custom xenotypes, synthetic chassis, and alien lineages using **Character Points (CP)**.

---

## I. Character Point (CP) Valuation Rules
| Biological Dimension | Formula / CP Rate | Benchmark Example |
| :--- | :--- | :--- |
| **Attribute Bonus** | **+5 CP per +1 Attribute Score** | +2 Strength = 10 CP |
| **Attribute Penalty** | **-5 CP per -1 Attribute Score** | -1 Charisma = -5 CP rebate |
| **Natural Armor (DR)** | **+2 CP per 1 point of Kinetic/Energy DR** | DR 4 / 3 = 14 CP |
| **Natural Weaponry** | **+3 CP** (1d6 damage), **+5 CP** (1d8 damage) | Claws / Fangs / Stingers |
| **Movement Modes** | **+5 CP** (Swim/Climb 30 ft), **+10 CP** (Flight 60 ft) | Wings, aquatic gills, burrowing |
| **Extra Limbs** | **+5 CP per additional pair of functional limbs** | 4-armed physiology = 5 CP |
| **Enhanced Senses** | **+2 CP** (Darkvision), **+3 CP** (Thermal/Scent) | Pheromone / seismic tracking |
| **Social Stigma** | **-3 to -5 CP** | Heavy xenophobic reaction penalty |

---

## II. Standard Species Budget Baseline
- Standard Playable Species CP Budget: **0 to 20 CP** (Net after disadvantages).
- Baseline Human: **0 CP** (Balanced across the board; gains 1 bonus Trait and +5 free Skill Points).`,
    mechanic: `Total Species CP = Attribute CP + Trait CP + Movement CP + Defense CP - Disadvantage CP - Stigma CP.`,
    guide: `Use this matrix when designing custom alien races for homebrew star systems.`,
    note: `Ensure that natural DR does not exceed DR 6 for standard Medium starting species.`
  },
  {
    id: "1-04-faction-influence-matrix",
    name: "1.04.12 Faction Influence Tiers & Interstellar Warfare Matrix",
    category: "compendium",
    entry_type: "Architect Codex",
    parent: "1.04 FACTIONS & GALACTIC POLITIES",
    order: 12,
    perspective: "architect",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "factions", "influence", "warfare"],
    description: `# 1.04.12 Faction Influence Tiers & Interstellar Warfare Matrix

Factions in Tangent range from local criminal syndicates to galaxy-spanning interstellar empires, rated by their **Influence Tier (1 to 5)**:

---

## I. Faction Influence Hierarchy
| Influence Tier | Scope & Territory | Fleet / Military Assets | Financial Liquidity |
| :---: | :--- | :--- | :--- |
| **Tier 1 (Local)** | Single city, space station, or mining colony. | 1-5 light gunships, 50-200 security personnel. | 10,000 – 100,000 Cr |
| **Tier 2 (Planetary)**| Full planetary government or planetary megacorp. | Planetary defense fleet, 10,000+ armed troops. | 1 – 10 MCr |
| **Tier 3 (Sector)** | Star-system cluster (3-10 inhabited worlds). | Battlecruisers, mechanized divisions, logistics lines.| 50 – 500 MCr |
| **Tier 4 (Galactic)**| Major Galactic Hegemony (Dracon Dynasty, Syndicate). | Star dreadnoughts, millions of troops, orbital yards. | 10+ Billion Cr |
| **Tier 5 (Cosmic)** | Progenitors, Transcendents, Trans-dimensional forces.| Reality-warping world-ships, celestial constructs. | Limitless |

---

## II. Faction Disposition & Standing
- **Allied (+3):** Unrestricted access to military bases, intelligence archives, and wholesale equipment discounts.
- **Friendly (+1):** Safe passage, diplomatic immunity, access to standard contracts.
- **Neutral (0):** Standard commercial access; full scrutiny from border patrols.
- **Hostile (-2):** Denied docking; bounty hunters and security forces actively track operative movements.
- **At War (-4):** Shoot-on-sight across all territorial star systems.`,
    mechanic: `Faction Standing Check: d20 + Charisma + Faction Reputation Rank vs DC 15.
Bespoke Requisition: High faction standing grants a 20% discount on military hardware.`,
    guide: `Track faction disposition shifts in the campaign log as operatives complete or botch operations.`,
    note: `Betraying an allied faction instantly shifts standing to Hostile.`
  }
];
