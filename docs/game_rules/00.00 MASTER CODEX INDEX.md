# **TANGENT SCI-FI FANTASY ROLE-PLAYING SYSTEM (TANGENT SF RP)**

## **MASTER CODEX README & REPOSITORY INDEX**

**Tangent SF RP** is a deterministic, modular science-fantasy tabletop role-playing system and virtual tabletop (VTT) engine. It unifies street-level cyberpunk, high-magic arcane orders, bio-engineered hive collectives, and Dyson-scale cosmic empires under a single **2d10 Resolution Engine**, a **150 Character Point (CP)** creation architecture, the **Universal Displacement Unit (UDU)** capacity hierarchy, and the **Tangent Economic Unified Field Theory (EUFT)**.

---

## **I. CORE SYSTEM AXIOMS & CANONICAL INVARIANTS**

Every document across the **Operator's Manual (Player Compendium)** and the **Architect's Matrix (Game Master Guide)** adheres to these foundational mathematical laws:

```text
Core Resolution Roll      : 2d10 + Skill Rank + Attribute Modifier + Situational Modifiers vs. Challenge Rating (CR)
Advantage / Disadvantage  : Roll an extra d10 per stack and keep highest 2 (Advantage) or lowest 2 (Disadvantage)
Critical Hit (Nat 20)     : Double-10s on 2d10 (or expanded threat) = Rolled Dice + 10 (e.g., 20 -> 30, 19 -> 29) + 2x Base Weapon Damage Dice + Weapon/Elemental Critical Effect
Fumble (Nat 2)            : Double-1s on 2d10 (or expanded fumble) = Rolled Dice becomes flat -10 (Base Score - 10) + Situational Complication
Starting Character Budget : 150 Character Points (CP) [80 CP Archetype Chassis + 70 CP Customization]
Background Allocations    : Faction (20 SP) + Origin (20 SP) + Occupation (20 SP) = 60 Skill Ranks, 4 Features & 4 Traits at 0 CP (Extra Traits = 1 CP)
Attribute & Skill Pricing : Universal Straight Cost (No Package Discount): +5 CP per +1 Attr (-5 CP per -1), 1 CP per 1 Skill Rank (5 CP per 5 Ranks)
Personal Hindrance Cap    : Maximum +10 CP from personal Hindrances (Species-level disadvantages and Stigmas are exempt)
Saving Throws             : Active Save = 2d10 + 2 + (2 * Attribute) + Feature Bonus | Passive Save CR = 12 + (2 * Attribute) + Feature Bonus
Vitality & Health Pools   : Base 30 Vitality / Base 30 Health; increased strictly by +5 points per 1 CP spent (Suggested Max: 60 each; NEVER scaled by Stamina)
Structure Pool (Non-Bio)  : Combined Vitality + Health (Base 60 SP; +5 SP per 1 CP; Suggested Max: 120 SP)
Stamina Damage Reduction  : Stamina Modifier subtracts point-for-point from incoming damage (Base Toughness) after Armor DR
Armor Layering Cap        : DR does not stack across biological, cybernetic, and wearable domains; only the single highest DR applies
Feature Cost              : 3 CP Standard | 2 CP Recommended (1 CP Discount; minimum 1 CP)
UDU Capacity Ratio        : 10 Usable Nodes (Tier 0) = 1 Socket (Tier 1) | 10 Sockets = 1 Mount (Tier 2) | 10 Mounts = 1 Module (Tier 3)
Master Valuation Formula  : Base CR intervals of 5 use Value (Credits) = 10 * 4 ^ (CR / 5)
Micro-Modifier Multipliers: +1 CR = x1.3 (+30%) | +2 CR = x1.75 (+75%) | +3 CR = x2.3 (+130%) | +4 CR = x3.0 (+200%) | -1 CR Flaw = x0.75 (-25%)
Crafting Material Ratio   : Pristine materials = 50% of Credit Value | Scavenged Scrap = 10% value (requires 5x Item Credit Value in unrefined scrap mass)
Golden Rule of Wealth     : Auto-Buy any personal item where Item Crafting CR <= Character Wealth Score (WS)
Liquidity Gap Formula     : Liquid Cost / Financed Debt = Value(Item CR) - Value(Character WS)
Productivity Formula      : Daily Progress (PP) = (Craft Check Result - 10) * Tool Tier Multiplier * Crew Size
Mecha Scale & Garaging    : Vehicle table SP is pre-calculated; apply Scale Multiplier only to damage, speed, and range. Garaging: 1 Mount = 1 Scale Multiplier
```

### **The Six Primary Attributes & Saving Throws**

| Attribute | Associated Check / Save | Core Mechanical Governance |
| :--- | :--- | :--- |
| **Strength (STR)** | **Might Check** | Melee damage, carrying capacity, grappling, physical force. |
| **Agility (AGI)** | **Reflex Save** | Ranged accuracy, Defense, Initiative, balance, area-of-effect evasion. |
| **Stamina (STA)** | **Fortitude Save** | Base Toughness (point-for-point damage reduction after Armor DR), toxin/disease/radiation resistance, and Mortality threshold (-STA / Stability = STA + 5). *(Does not increase Vitality or Health pools).* |
| **Intellect (INT)** | **Reason Check** | Logic, engineering, computers, scientific analysis, Arcane/Psychic Metafocus. |
| **Wisdom (WIS)** | **Willpower Save** | Intuition, Insight, mental/psionic resistance, Divine/Primal Metafocus. |
| **Charisma (CHA)** | **Etiquette Check** | Leadership, Diplomacy, Bluff, social presence, Hereditary/Bardic Metafocus. |

* **Derived Perception Base:** `Perception Base = Intellect Score + Wisdom Score`, combined with **Alertness** (General), **Attune** (Meta), **Insight** (Social), or **Knowledge (Technology)** (Technical).

---

## **II. REPOSITORY DIRECTORY ARCHITECTURE**

```text
tangent-sf-rp/
├── 00.00 MASTER CODEX INDEX.md (README.md)
│
├── operator/                        # VOLUME I: OPERATOR'S MANUAL (PLAYER COMPENDIUM)
│   ├── 1.01 CHARACTER CREATION.md
│   │   └── character_creation/           # Creation Pipeline, Attributes, Perception, Vit/Hea/SP, Karma, Movement, Rest, XP
│   ├── 1.02 ARCHETYPES.md
│   │   └── archetypes/                   # 80-CP Playable Archetype Templates (Savants, Visionaries, Sentinels, Operatives)
│   ├── 1.03 SPECIES.md
│   │   └── species/                      # Playable Species & Sub-Species (Aeld, Asi, Auluran, Human, Kitin, Orll, Progenitor, ShaNor, Synthetic, Xeno)
│   ├── 1.04 FACTIONS.md
│   │   └── factions/                     # 16 Major/Schism Polities + 25 Minor/Archetypal Factions
│   ├── 1.05 ORIGINS.md
│   │   └── origins/                      # 11 Planetary & Habitat Upbringing Packages
│   ├── 1.06 OCCUPATIONS.md
│   │   └── occupations/                  # 13 Career & Vocational Packages
│   ├── 1.07 SKILLS.md
│   │   └── skills/                       # Skill Mechanics + Physical, Mental (Knowledge/Vocation), Social, Combat & Meta Skills
│   ├── 1.08 FEATURES.md
│   │   └── features/                     # Ability, Combat, Discipline, General, Karma, Skill & Special Features
│   ├── 1.09 HINDRANCES.md
│   │   └── hindrances/                   # Physical, Mental/Psychological & Social/Resource Hindrances
│   ├── 1.10 SCALING.md                   # Universal Size & Scale Multipliers (Miniscule to Mega-Colossal)
│   ├── 2.00 ECONOMATRIX.md
│   │   └── economatrix/                  # Wealth Score, Liquidity Gap, Crafting Engine, Trade & Equipment Catalogs
│   ├── 3.00 COMBAT.md
│   │   └── combat/                       # 2d10 Combat Engine, Actions, Damage, Hit Locations, Conditions & Vehicular Combat
│   └── 4.00 METAPHYSICS.md
│       └── metaphysics/                  # Awakening, Free-Casting, Sensory Manifestations & 6 Discipline Invocation Compendiums
│
└── architect/                            # VOLUME II: ARCHITECT'S MATRIX (GAME MASTER GUIDE)
    ├── 00.00 GM GUIDELINES.md            # Architect Philosophy, Pacing, Adjudication, Dual AI Pair-GM & Safety Protocols
    ├── 02 ECONOMY AND WEALTH.md
    │   └── economy/                      # EUFT Design Protocol & Interstellar Trade / Smuggling Framework
    ├── 99. ARCHETYPES.md
    │   └── archetypes/                   # 220 NPC/Role Archetypes (A–Z) + MBTI Personality & Temperament Mapping Appendix
    ├── 99. METAPHYSICS.md
    │   └── metaphysics/                  # 04. The Resonance (Unified Field Theory & 20 Theologies), Invocation & Meta-Tech Matrices
    ├── 99. MODULAR CHARACTER MATRIX.md
    │   └── characters/                   # Modules A–G (Tier Chassis 0–20, Roles, Biology, Soul, Lifepath, Genre) + 04.03 Bestiary
    ├── 99. MODULAR COMPANION MATRIX.md
    │   └── companions/                   # 15-CP Form Packages, 25-CP Function Packages & 10 Tiny "Thralls" Battle Companions
    ├── 99. MODULAR FACTION MATRIX.md     # 4-Phase Faction Construction Protocol & Master Faction Template
    ├── 99. MODULAR PLANETARY MATRIX.md
    │   └── planetary/                    # Astrophysics, Geophysics, Civilization, Hazards, Hooks, d10 Encounters & 04.00 Star Atlas
    ├── 99. MODULAR SPECIES MATRIX.md
    │   └── species/                      # Species Chassis Types, Size/Movement, Traits Catalog, Disadvantages & 04.03.01 Dragons
    └── 99. TECHNOLOGY.md
        └── technology/                   # Core Tech Levels, Aetherium/Aetherite, Poly-Matter, Architecture, Mecha, Weaponry, Augs, Armor, Gear
```

---

## **III. VOLUME I: PLAYER'S HANDBOOK (`./operator/`)**

* **[1.01 CHARACTER CREATION.md](./operator/1.01%20CHARACTER%20CREATION.md)** & `./character_creation/` — *150 CP point-buy pipeline, Attributes, Perception, Vitality/Health/Structure, Karma, Movement, Rest/Dying, and Experience*
* **[1.02 ARCHETYPES.md](./operator/1.02%20ARCHETYPES.md)** & `./archetypes/` — *80-CP Playable Archetype Templates across Savants, Visionaries, Sentinels, and Operatives*
* **[1.03 SPECIES.md](./operator/1.03%20SPECIES.md)** & `./species/` — *Playable Species and Sub-Species (Aeld, Asi, Auluran, Human, Kitin, Orll, Progenitor, Sha'Nor, Synthetic, Xeno)*
* **[1.04 FACTIONS.md](./operator/1.04%20FACTIONS.md)** & `./factions/` — *Major Galactic Powers, Aeld Providence Schisms, The Impyrium, and 25 Minor/Archetypal Factions*
* **[1.05 ORIGINS.md](./operator/1.05%20ORIGINS.md)** & `./origins/` — *11 Planetary and Habitat Origins*
* **[1.06 OCCUPATIONS.md](./operator/1.06%20OCCUPATIONS.md)** & `./occupations/` — *13 Career and Vocational Packages*
* **[1.07 SKILLS.md](./operator/1.07%20SKILLS.md)** & `./skills/` — *Skill Check Mechanics and Master Compendiums (Physical, Mental, Social, Combat, Metaphysics)*
* **[1.08 FEATURES.md](./operator/1.08%20FEATURES.md)** & `./features/` — *Ability, Combat, Discipline, General, Karma, Skill, and Special Features*
* **[1.09 HINDRANCES.md](./operator/1.09%20HINDRANCES.md)** & `./hindrances/` — *Physical, Mental/Psychological, and Social/Resource Hindrances*
* **[1.10 SCALING.md](./operator/1.10%20SCALING.md)** — *Universal Size and Scale Multipliers*
* **[2.00 ECONOMATRIX.md](./operator/2.00%20ECONOMATRIX.md)** & `./economatrix/` — *Wealth Score, Liquidity Gap, Crafting Engine, Trade, and Player Gear Catalogs*
* **[3.00 COMBAT.md](./operator/3.00%20COMBAT.md)** & `./combat/` — *2d10 Combat Engine, Action Economy, Damage, Locations, Criticals, and Conditions*
* **[4.00 METAPHYSICS.md](./operator/4.00%20METAPHYSICS.md)** & `./metaphysics/` — *Awakening, Free-Casting, Sensory Manifestations, and the 6 Discipline Invocation Catalogs*

---

## **IV. VOLUME II: ARCHITECT'S MATRIX (`./architect/`)**

* **[00.00 GM GUIDELINES.md](./architect/00.00%20GM%20GUIDELINES.md)** — *Architect Philosophy, Pacing, Adjudication, BASTION Operational Protocols, and Session Zero Safety*
* **[02 ECONOMY AND WEALTH.md](./architect/02%20ECONOMY%20AND%20WEALTH.md)** & `./economy/` — *`02.Economy.InterstellarTrade.md` and `02.Economy.UnifiedFieldTheory.md`*
* **[99. ARCHETYPES.md](./architect/99.%20ARCHETYPES.md)** & `./archetypes/` — *220 NPC/Role Archetypes (A–Z) and `99.Archetypes.MBTIMapping.md`*
* **[99. METAPHYSICS.md](./architect/99.%20METAPHYSICS.md)** & `./metaphysics/` — *`04.TheResonance.md`, `99.Metaphysics.InvocationMatrix.md`, and `99.Metaphysics.MetaTechMatrix.md`*
* **[99. MODULAR CHARACTER MATRIX.md](./architect/99.%20MODULAR%20CHARACTER%20MATRIX.md)** & `./characters/` — *Modules A–G (`99.Character.ModuleA.TierChassis.md`, `99.Character.ModuleB.CompetencyRoles.md`, `99.Character.ModuleC_E.BiologySoulLifepath.md`, `99.Character.ModuleF_G.GenreAndVisuals.md`) and `04.03.BestiaryAndXenofauna.md`*
* **[99. MODULAR COMPANION MATRIX.md](./architect/99.%20MODULAR%20COMPANION%20MATRIX.md)** & `./companions/` — *15-CP Form Packages, 25-CP Function Packages, and 10 Tiny "Thralls" Battle Companions*
* **[99. MODULAR FACTION MATRIX.md](./architect/99.%20MODULAR%20FACTION%20MATRIX.md)** — *4-Phase Faction Construction Protocol and Master Template*
* **[99. MODULAR PLANETARY MATRIX.md](./architect/99.%20MODULAR%20PLANETARY%20MATRIX.md)** & `./planetary/` — *`99.Planetary.AstrophysicsAndGeophysics.md`, `99.Planetary.CivilizationAndEconomy.md`, `99.Planetary.HazardsAndEncounters.md`, and `04.00.StarAtlas.md`*
* **[99. MODULAR SPECIES MATRIX.md](./architect/99.%20MODULAR%20SPECIES%20MATRIX.md)** & `./species/` — *`99.Species.ChassisAndMovement.md`, `99.Species.TraitsAndDisadvantages.md`, and `04.03.01.DragonsCodex.md`*
* **[99. TECHNOLOGY.md](./architect/99.%20TECHNOLOGY.md)** & `./technology/` — *Core Tech Levels, Aetherium/Aetherite, Poly-Matter, `99.Technology.ArchitecturalMatrix.md`, `99.Technology.MechaMatrix.md`, `99.Technology.WeaponryMatrix.md`, `99.Technology.AugmentationsMatrix.md`, `99.Technology.ArmorMatrix.md`, and `99.Technology.GearMatrix.md`*

---

## **V. DISCREPANCY & RESTORATION LEDGER (BATCH 1 — ROOT INDEX)**

* **DISC-001 (Stamina Scaling Purge):** Replaced the legacy `30 + [5 * STA]` Vitality and Health formula in `README.md` with canonical CP-scaled pools (`Base 30 Vitality / Base 30 Health; +5 per 1 CP; NEVER scaled by Stamina`) and Stamina Base Toughness (`point-for-point damage reduction after Armor DR`).
* **DISC-002 (2d10 Fumble Normalization):** Normalized `Fumble (Nat 1)` to `Fumble (Nat 2 / Double-1s on 2d10)` to reflect the minimum possible result on a 2d10 bell curve.
* **DISC-003 (EUFT & Matrix Audit Axioms):** Added the canonical Micro-Modifier Linear Multipliers (`+1 CR = x1.3`, `+2 CR = x1.75`, `+3 CR = x2.3`, `+4 CR = x3.0`, `-1 CR = x0.75`), Crafting Material Ratio (`50% Pristine vs. 10% Scrap`), Armor Layering Cap, and Mecha Scale/Garaging rules to Section I.
* **DISC-004 (Volume III & IV Index Restoration):** Restored Sections III and IV (Player's Handbook and Architect's Matrix module indexes) into `00.00 MASTER CODEX INDEX.md` and synchronized `README.md` as an exact mirror.
* **DISC-005 (Unredacted Catalog Reconciliation & Rules Audit):** Verified 80 CP Archetype Chassis, enforced +10 CP Personal Hindrance Cap with explicit Species-Level Hindrance Exemption across all 1.09 files, replaced all remaining 'Bonus Features' instances with 'Recommended Features', integrated the Radiant Impyrium Psycholith mineral codex into `1.04.Impyrium.Radiant.md`, standardized Kovian Tribunal at +3 WS, restored `Con Artist` in `99.Archetypes.A_D.md`, and enforced plain-text math across `00.02 BASTION CORE FORMULAS & ERRATA ENGINE.md`.
