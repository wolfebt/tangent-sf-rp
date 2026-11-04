# 00.00. MASTER CODEX INDEX & REPOSITORY ARCHITECTURE

* **Focus Statement:** The canonical root directory manifest, core mathematical invariant ledger, and cross-volume module index for the **TANGENT Science Fantasy Role-Playing Engine (Tangent SF RP)**.

## Overview & Mechanical Authority Block

**Tangent SF RP** is a deterministic, modular science-fantasy tabletop role-playing system and virtual tabletop (VTT) engine. It unifies street-level cyberpunk, high-magic arcane orders, bio-engineered hive collectives, and Dyson-scale cosmic empires under a single **2d10 Resolution Engine**, a **150 Character Point (CP)** creation architecture, the **Universal Displacement Unit (UDU)** capacity hierarchy, and the **Tangent Economic Unified Field Theory (EUFT)**.

Every document across **Volume I: The Operator's Manual (Player Compendium)** and **Volume II: The Architect's Matrix (Game Master Guide)** is governed by these foundational mathematical laws:

* **Core Resolution Roll:** `2d10 + Skill Rank + Attribute Modifier + Situational Modifiers vs. Challenge Rating (CR)`.

* **Advantage & Disadvantage:** Roll `+1d10` per stack of Advantage (keep highest 2) or Disadvantage (keep lowest 2). Opposing stacks cancel 1-for-1.

* **Critical Hit (Natural 20):** Double-10s on `2d10` (or expanded threat range `19`, `18`) equals `Rolled Dice + 10` (e.g., `20 -> 30`, `19 -> 29`) + `2x Base Weapon Damage Dice` + `Weapon/Elemental Critical Effect`.

* **Fumble (Natural 2):** Double-1s on `2d10` (or expanded fumble range `3`, `4`) converts the rolled dice into a flat `-10` (`Base Score - 10`) + `Situational Complication`.

* **Character Point (CP) Economy:** `150 CP` starting budget divided into an **80-CP Archetype Chassis** and a **70-CP Customization Budget**.

* **80-CP Archetype Chassis Breakdown:**

  * **Primary Attribute at +3:** `15 CP` (`5 CP` per `+1`)

  * **Secondary Attribute at +2:** `10 CP` (`5 CP` per `+1`)

  * **4 Essential Skills at Rank 6 (Trained):** `24 CP` (`1 CP` per Rank)

  * **6 Supporting Skills at Rank 3 (Novice):** `18 CP` (`1 CP` per Rank)

  * **2 Signature Traits (1 CP each) and 3 Recommended Core Features (9 CP):** `13 CP`

* **Background Skill Ranks:** `60 Background Skill Ranks` allocated at `0 CP` as `20 SP Faction` + `20 SP Origin` + `20 SP Occupation`, alongside `4 Features` and `4 Traits` (`Extra Traits = 1 CP` each).

* **Universal Attribute & Skill Pricing:** Straight cost across all creation and customization modules (`+5 CP` per `+1` Attribute, `-5 CP` refund per `-1` Attribute penalty, `1 CP` per `1` Skill Rank / `5 CP` per `5` Skill Ranks).

* **Personal Hindrance Cap:** Standard character hindrances have a `+10 CP` maximum limit; **Species-level hindrances and Stigmas do NOT count toward the 10-point standard hindrance limit**.

* **Saving Throws:** `Active Save = 2d10 + 2 + (2 * Attribute) + Feature Bonus` | `Passive Save CR = 12 + (2 * Attribute) + Feature Bonus`.

* **Vitality & Health Pools (Biological):** Base `30 Vitality` and Base `30 Health`, scaled strictly at `+5 points per 1 CP` spent (Suggested Max: `60` each; **NEVER** scaled by Stamina).

* **Structure Pool (Non-Biological / Construct):** Combined Vitality and Health into Base `60 Structure Points (SP)`, scaled strictly at `+5 SP per 1 CP` spent (Suggested Max: `120 SP`).

* **Stamina Base Toughness:** Stamina Modifier subtracts point-for-point from incoming damage as **Base Toughness** after Armor Damage Reduction (DR).

* **Armor Layering Cap:** DR does not stack across biological, cybernetic, and wearable domains; only the single highest domain DR applies (`Final Damage = max(0, Raw Damage - max(0, Highest Single Domain DR - Weapon Penetration) - Target Stamina Modifier)`).

* **Feature Pricing:** `3 CP` Standard Feature | `2 CP` Recommended Feature (`1 CP` discount; minimum `1 CP`).

* **Feature-Gated Strike Consolidation:** Consolidating an attack into multiplied base weapon damage dice as a Standard Action requires the **Precision Strike** Combat Feature chain (`Precision Strike` at Combat Skill 6 for `2x` base dice, `Improved Precision Strike` at Combat Skill 11 for `3x` base dice, `Greater Precision Strike` at Combat Skill 16 for `4x` base dice).

* **Universal Displacement Unit (UDU) 10:1 Hierarchy:** `10 Usable Nodes (Tier 0, < 10 g) = 1 Socket (Tier 1, < 1 kg)` | `10 Sockets = 1 Mount (Tier 2, < 100 kg)` | `10 Mounts = 1 Module (Tier 3, < 10 Tons / 20x20 ft)`.

* **Economic Unified Field Theory (EUFT) Valuation:** Base CR intervals of 5 follow `Value (Credits) = 10 * 4^(CR / 5)`. Non-multiples of 5 apply Linear Micro-Modifiers to the nearest Base 5-CR value: `+1 CR = x1.30` (+30%), `+2 CR = x1.75` (+75%), `+3 CR = x2.30` (+130%), `+4 CR = x3.00` (+200%), `-1 CR Flaw = x0.75` (-25%).

* **Crafting Material & Salvage Ratios:** Pristine materials cost `50%` of Credit Value; Scavenged Scrap retains `10%` of Credit Value (requiring `5x Item Credit Value` in unrefined scrap mass to satisfy the 50% crafting material threshold).

* **Wealth Score (WS) & Liquidity Gap:** Characters automatically acquire any personal item where `Item Crafting CR <= Character Wealth Score (WS)` at `0` liquid Credit cost. When `Item CR > WS`, `Liquid Cost = Value(Item CR) - Value(Character WS)`.

* **Productivity Engine:** `Daily Progress (PP) = (Craft Check Result - 10) * Tool Tier Multiplier * Crew Size` against `Target PP = Item Credit Value`.

* **Mecha Scale & Garaging:** Vehicle/Mecha size table SP is pre-calculated (never multiply table SP a second time by the Scale Multiplier). Apply the Scale Multiplier strictly to weapon damage, movement speed, and weapon range. Garaging conversion: `1 Mount = 1 Scale Multiplier`.

### The Six Primary Attributes & Saving Throws

| Attribute | Associated Check / Save | Core Mechanical Governance | 
| ----- | ----- | ----- | 
| **Strength (STR)** | **Might Check** | Melee damage, carrying capacity, grappling, physical force. | 
| **Agility (AGI)** | **Reflex Save** | Ranged accuracy, Defense, Initiative, balance, area-of-effect evasion. | 
| **Stamina (STA)** | **Fortitude Save** | Base Toughness (point-for-point damage reduction after Armor DR), toxin/disease/radiation resistance, and Mortality threshold (`Stability = STA + 5`). *(Does not increase Vitality or Health pools).* | 
| **Intellect (INT)** | **Reason Check** | Logic, engineering, computers, scientific analysis, Arcane/Psychic Metafocus. | 
| **Wisdom (WIS)** | **Willpower Save** | Intuition, Insight, mental/psionic resistance, Divine/Primal Metafocus. | 
| **Charisma (CHA)** | **Etiquette Check** | Leadership, Diplomacy, Bluff, social presence, Hereditary/Bardic Metafocus. | 

* **Derived Perception Base:** `Perception Base = Intellect Score + Wisdom Score`, combined with **Alertness** (General), **Attune** (Metaphysical), **Insight** (Social), or **Knowledge (Technology)** (Technical).

## Part I — Alignment & Summary Matrix Table

| Module Code | Canonical Hub Document | Subfolder Path | Sub-Module File Count | Primary Domain & Mechanical Scope | 
| ----- | ----- | ----- | ----- | ----- | 
| **00.00** | `00.00 MASTER CODEX INDEX.md` / `README.md` | `./` (Root) | 2 | Master repository index, system axioms, directory manifest, and audit ledger. | 
| **00.01** | `00.01 BASTION SYSTEM PROMPT & ROUTING MANIFEST.md` | `./` (Root) | 1 | Deterministic arbiter system directives, telemetry headers, and file routing tables. | 
| **00.02** | `00.02 BASTION CORE FORMULAS & ERRATA ENGINE.md` | `./` (Root) | 1 | 12 Mandatory Normalization Rules, EUFT valuation table, UDU hierarchy, and combat formulas. | 
| **1.00** | `operator/1.00 INTRODUCTION.md` | `operator/introduction/` | 1 | Core engine introduction, 2d10 bell-curve probabilities, CR benchmarks, and system glossary. | 
| **1.01** | `operator/1.01 CHARACTER CREATION.md` | `operator/character_creation/` | 10 | 150 CP creation pipeline, Attributes, Perception, Vitality/Health/SP, Karma, Movement, Dying, XP. | 
| **1.02** | `operator/1.02 ARCHETYPES.md` | `operator/archetypes/` | 5 | 80-CP Playable Archetype Chassis across Operatives, Savants, Sentinels, Visionaries, and Signature Features. | 
| **1.03** | `operator/1.03 SPECIES.md` | `operator/species/` | 93 | Playable Species and Sub-Species packages across 9 major taxonomic families and independent Xenos. | 
| **1.04** | `operator/1.04 FACTIONS.md` | `operator/factions/` | 42 | 20-SP Faction Background packages covering Major Polities, Aeld Schisms, Impyrium, and 25 Archetypal Factions. | 
| **1.05** | `operator/1.05 ORIGINS.md` | `operator/origins/` | 11 | 20-SP Planetary and Habitat Upbringing Background packages. | 
| **1.06** | `operator/1.06 OCCUPATIONS.md` | `operator/occupations/` | 13 | 20-SP Career and Vocational Background packages with Wealth Score modifiers. | 
| **1.07** | `operator/1.07 SKILLS.md` | `operator/skills/` | 20 | Skill check resolution mechanics, Specialization/Synergy rules, and 5 domain Skill Compendiums. | 
| **1.08** | `operator/1.08 FEATURES.md` | `operator/features/` | 10 | Standard (3 CP) and Recommended (2 CP) Features across Ability, Combat, Discipline, General, Karma, Skill, and Special. | 
| **1.09** | `operator/1.09 HINDRANCES.md` | `operator/hindrances/` | 3 | Personal Hindrances (+10 CP cap) and Species-exempt disadvantages across Physical, Mental, and Social domains. | 
| **1.10** | `operator/1.10 SCALING.md` | `operator/` | 0 | Universal Size Categories (Miniscule to Mega-Colossal), Scale Multipliers (`x1` to `x80+`), and combat modifiers. | 
| **2.00** | `operator/2.00 ECONOMATRIX.md` | `operator/economatrix/` | 12 | Player Wealth Score, Auto-Buy, Liquidity Gap, Crafting Engine, Trade, Weapons, Armor, Augs, Mecha, and Architecture. | 
| **3.00** | `operator/3.00 COMBAT.md` | `operator/combat/` | 5 | 2d10 Tactical Combat engine, Action Economy, Edge, Hit Locations, Damage Types, Status Effects, and Vehicular Combat. | 
| **4.00** | `operator/4.00 METAPHYSICS.md` | `operator/metaphysics/` | 7 | Awakening, Free-Casting, Sensory Manifestations, and the 6 Metaphysical Discipline Invocation Compendiums. | 
| **A-00** | `architect/00.00 GM GUIDELINES.md` | `architect/` | 0 | Architect adjudication principles, Pacing, Dual AI Pair-GM operational protocols, and Session Zero safety tools. | 
| **A-02** | `architect/02 ECONOMY AND WEALTH.md` | `architect/economy/` | 2 | Macro-economic EUFT design protocol, Liquidity Drag, Fence Rates, and interstellar trade/smuggling frameworks. | 
| **A-99.1** | `architect/99. ARCHETYPES.md` | `architect/archetypes/` | 5 | 220 NPC and Role Archetype chassis (A–Z) harmonized to 80 CP plus 16-type MBTI personality mapping. | 
| **A-99.2** | `architect/99. METAPHYSICS.md` | `architect/metaphysics/` | 3 | Unified Field Theory of the Resonance, 20 Galactic Theologies, Invocation design matrix, and UDU Meta-Tech forging. | 
| **A-99.3** | `architect/99. MODULAR CHARACTER MATRIX.md` | `architect/characters/` | 6 | Modules A–G rapid NPC/Adversary generation (Tiers 0–20), Lifepath schema, CRISP visuals, and Bestiary stat blocks. | 
| **A-99.4** | `architect/99. MODULAR COMPANION MATRIX.md` | `architect/companions/` | 2 | 15-CP Companion Form Packages, 25-CP Function Packages, and 10 Tiny "Thralls" Battle Companions. | 
| **A-99.5** | `architect/99. MODULAR FACTION MATRIX.md` | `architect/` | 0 | 4-Phase Faction Construction Protocol, organizational scaling, and Master Faction Template. | 
| **A-99.6** | `architect/99. MODULAR PLANETARY MATRIX.md` | `architect/planetary/` | 4 | Procedural star system and world generation, Civilization/Economy tags, d10 encounters, and Star Atlas Gazetteer. | 
| **A-99.7** | `architect/99. MODULAR SPECIES MATRIX.md` | `architect/species/` | 3 | Custom Species engineering (straight 5 CP Attribute / 1 CP Skill pricing), chassis movement, traits, and Dragons Codex. | 
| **A-99.8** | `architect/99. TECHNOLOGY.md` | `architect/technology/` | 20 | Tech Levels 0–5, Kardashev Domains, Aetherium, Poly-Matter, and 6 UDU Engineering Forge Matrices. | 
| **A-99.9** | `architect/schemas/` (Validation Suite) | `architect/schemas/` | 5 | Machine-readable JSON validation schemas and `bastion_validator.py` automated regression suite. | 

## Part II — Complete Unabridged Profiles & Rules Entries

### 00. Root Governance & Arbiter Architecture (`./`)

* *You stand at the central nexus of the Tangent Science Fantasy Role-Playing Engine, where every probability curve, point-buy ledger, displacement unit, and credit valuation converges into a single deterministic architecture.*

* *"A rule system without mathematical symmetry is merely a collection of rumors. In the Tangent Codex, a street-level cyber-blade and a stellar dreadnought obey the exact same physics."* — **BASTION Archival Core, Directive 00.00**

* **Root Governance Files:**

  * `00.00 MASTER CODEX INDEX.md` & `README.md` — Master repository directory index, canonical mathematical invariants, primary attribute table, and restoration ledger.

  * `00.01 BASTION SYSTEM PROMPT & ROUTING MANIFEST.md` — Operational persona instructions, mandatory telemetry headers (`ACCESSING ARCHIVE`, `CALCULATING CR & EUFT MATH`, `VISUALIZING OUTPUT: CRISP MATRIX`), Socratic co-design rules, and intent-to-file routing manifests.

  * `00.02 BASTION CORE FORMULAS & ERRATA ENGINE.md` — Pinned memory reference containing the 12 Mandatory Mechanical Normalization Rules, the EUFT Base 5-CR valuation table (`CR 0` to `CR 50`), Linear Micro-Modifiers, Liquidity Gap equations, Productivity Engine formulas, UDU 10:1 conversion hierarchy, and combat mitigation order.

### 1.00. Introduction & Core Engine Glossary (`./operator/`)

* *Before stepping onto the shattered ring-cities of the Syndicate or the psionicspire worlds of the Radiant Impyrium, an Operator must master the fundamental language of risk, resolve, and cosmic scale.*

* *"Two ten-sided dice. One Challenge Rating. Everything else is preparation."* — **Vanguard Instructor Kaelen Voss**

* **Hub Document:** `operator/1.00 INTRODUCTION.md` — Narrative and mechanical introduction to the Tangent SF RP setting, the core `2d10 + Skill Rank + Attribute Modifier vs. CR` resolution curve, Difficulty benchmarks (`CR 5` Simple to `CR 50` Transcendent), Advantage/Disadvantage dice pooling, and Critical/Fumble thresholds.

* **Sub-Module Files (`operator/introduction/`):**

  * `1.00.Glossary.md` — Complete alphabetical lexicon of canonical game terms, abbreviations (`CP`, `SP`, `CR`, `DR`, `WS`, `PP`, `UDU`), and mechanical definitions.

### 1.01. Character Creation (`./operator/`)

* *Every Operator begins as a 150-Character-Point convergence of genetic heritage, factional allegiance, planetary upbringing, professional training, and personal ambition.*

* *"Identity defines where you started. Capabilities determine whether you survive the first contract."* — **Operative Registration Protocol**

* **Hub Document:** `operator/1.01 CHARACTER CREATION.md` — Master overview of the two-stage Operator creation pipeline (`80 CP` Archetype Chassis + `70 CP` Customization Budget + `60 SP` free Background Skill Ranks).

* **Sub-Module Files (`operator/character_creation/`):**

  * `1.01.PipelineIdentity.md` — Stage 1 Identity Pipeline covering Character Concept, Archetype Selection (`80 CP`), Species Selection, Faction (`20 SP`), Origin (`20 SP`), and Occupation (`20 SP`).

  * `1.01.PipelineCapabilities.md` — Stage 2 Capabilities Pipeline governing the `70 CP` customization budget across Attributes, Skills, Features, Personal Hindrances (`+10 CP` cap), and starting equipment acquisition.

  * `1.01.Attributes.md` — Detailed profiles and mechanical governance for **Strength (STR / Might)**, **Agility (AGI / Reflex)**, **Stamina (STA / Fortitude)**, **Intellect (INT / Reason)**, **Wisdom (WIS / Willpower)**, and **Charisma (CHA / Etiquette)**, priced at `5 CP` per `+1` (`-5 CP` per `-1`) with Active (`2d10 + 2 + 2*Attr + Feature`) and Passive (`12 + 2*Attr + Feature`) Saving Throw formulas.

  * `1.01.Perception.md` — Derived Perception Base (`Intellect Score + Wisdom Score`) and situational sensory checks across **Alertness**, **Attune**, **Insight**, and **Knowledge (Technology)**.

  * `1.01.VitalityHealthStructure.md` — Biological **Vitality** (`Base 30`) and **Health** (`Base 30`) pools and non-biological **Structure Points** (`Base 60 SP`), scaled strictly at `+5 points per 1 CP` spent with zero Stamina pool scaling and Stamina Modifier applied as point-for-point **Base Toughness**.

  * `1.01.Karma.md` — Karma pool calculation, dramatic editing, dice boosts, and narrative recovery mechanics.

  * `1.01.Movement.md` — Tactical combat movement, overland travel paces, jumping, climbing, swimming, zero-G maneuvering, and Strength-based carrying capacity.

  * `1.01.RestAndDying.md` — Short and extended rest recovery, wound treatment, the **Mortality State** at `0 Health` (`Stability Points = Stamina Score + 5`), stabilization (`CR 15 Medicine`), and the High Cost of Dying (`-5 Experience Debt` and `0 Karma` upon revivification).

  * `1.01.StartingWealthAndMeta.md` — Starting **Wealth Score (WS)** calculation, Auto-Buy equipment rules, Liquidity Gap financing, and initial Metaphysical Awakening parameters.

  * `1.01.Experience.md` — Experience Point (XP) awards, CP conversion milestones, and Power Scale Tiers: Tier 1 Operative (`150–199 CP`), Tier 2 Tactical (`200–299 CP`), Tier 3 Strategic (`300–449 CP`), and Tier 4 Mythic (`450+ CP`).

### 1.02. Archetypes (`./operator/`)

* *An Archetype is a battle-tested 80-CP operational chassis—pre-configured with primary and secondary attributes, trained core skills, signature traits, and recommended features so an Operator can deploy immediately or customize with their remaining 70 CP.*

* *"Specialists win firefights; balanced chassis survive campaigns."* — **Syndicate Tactical Doctrine**

* **Hub Document:** `operator/1.02 ARCHETYPES.md` — Master index and mathematical proof of the **80-CP Archetype Chassis** (`15 CP` Primary Attribute at `+3`, `10 CP` Secondary Attribute at `+2`, `24 CP` for 4 Essential Skills at Rank 6, `18 CP` for 6 Supporting Skills at Rank 3, and `13 CP` for 2 Signature Traits at `1 CP` each plus 3 Recommended Core Features at `9 CP`).

* **Sub-Module Files (`operator/archetypes/`):**

  * `1.02.Operatives.md` — Agile, tactical, and covert 80-CP Archetype templates (reflexes, infiltration, precision combat, and field operations).

  * `1.02.Savants.md` — Intellectual, technical, medical, and analytical 80-CP Archetype templates (engineering, computers, science, and tactical synthesis).

  * `1.02.Sentinels.md` — Frontline, endurance, heavy-ordinance, and protective 80-CP Archetype templates (close combat, heavy armor, fortification, and command resilience).

  * `1.02.Visionaries.md` — Social, diplomatic, leadership, and metaphysical 80-CP Archetype templates (persuasion, command, psionics, and Resonance invocation).

  * `1.02.SignatureFeatures.md` — Complete mechanical catalog of Archetype Signature Traits and Recommended Core Features.

### 1.03. Species (`./operator/`)

* *From baseline Terran stock and genetically tailored offshoots to chitinous hive-castes, crystalline psions, and sentient machine consciousnesses, an Operator's species establishes their biological or synthetic foundation.*

* *"Count the limbs, scan the neural density, and check whether it breathes oxygen or vacuum before you offer it a chair."* — **Outworlds Customs Manual**

* **Hub Document:** `operator/1.03 SPECIES.md` — Master species taxonomy, straight CP package pricing (`+5 CP` per `+1` Attribute, `-5 CP` per `-1` Attribute penalty, `1 CP` per `1` Skill Rank), Recommended Features, and the **Species Hindrance Exemption Rule** (species-level disadvantages do not count against the `+10 CP` personal hindrance cap).

* **Consolidated Compendium Files (`operator/species/`):**

  * `1.03.AeldAndAsi.md` — Consolidated profiles for all Aeld and Asi lineages.

  * `1.03.HumansAuluransKitin.md` — Consolidated profiles for all Human, Auluran, and Kitin lineages.

  * `1.03.SyntheticsAndXeno.md` — Consolidated profiles for all Synthetic constructs, Orll, Progenitors, Sha'Nor, and independent Xeno species.

* **Independent Xeno Species Files (`operator/species/`):**

  * `1.03.AwakenedAnimal.md`, `1.03.Caprian.md`, `1.03.Jorni.md`, `1.03.Kannid.md`, `1.03.Kizin.md`, `1.03.Kongi.md`, `1.03.Mobula.md`, `1.03.Mondi.md`, `1.03.Plasm.md`, `1.03.Praeti.md`, `1.03.Qeric.md`, `1.03.Sefalin.md`, `1.03.Thorn.md`, `1.03.Truldan.md`, `1.03.Vassoth.md`, `1.03.Weti.md`.

* **Taxonomic Lineage Subfolders (`operator/species/`):**

  * `species/Aeld/` (6 files): `1.03.Aeld.md`, `1.03.Aeld.Alterian.md`, `1.03.Aeld.Doppelganger.md`, `1.03.Aeld.Draconian.md`, `1.03.Aeld.Kovian.md`, `1.03.Aeld.Vajar.md`.

  * `species/Asi/` (9 files): `1.03.Asi.md`, `1.03.Asi.Ferren.md`, `1.03.Asi.Fey.md`, `1.03.Asi.Frellin.md`, `1.03.Asi.Koban.md`, `1.03.Asi.Sigal.md`, `1.03.Asi.Tozen.md`, `1.03.Asi.Whisper.md`, `1.03.Asi.Wildling.md`.

  * `species/Aulurans/` (5 files): `1.03.Aulurans.md`, `1.03.Aulurans.Dar.md`, `1.03.Aulurans.Graa.md`, `1.03.Aulurans.Koda.md`, `1.03.Aulurans.Prokos.md`.

  * `species/Humans/` (26 files): `1.03.Humans.md`, `1.03.Humans.Base.md`, `1.03.Humans.Aquarian.md`, `1.03.Humans.Aquatican.md`, `1.03.Humans.Argynt.md`, `1.03.Humans.BDren.md`, `1.03.Humans.Brae.md`, `1.03.Humans.Changeling.md`, `1.03.Humans.Chimera.md`, `1.03.Humans.Cyberform.md`, `1.03.Humans.Danai.md`, `1.03.Humans.Davae.md`, `1.03.Humans.Digon.md`, `1.03.Humans.Draconic.md`, `1.03.Humans.Dwerg.md`, `1.03.Humans.GenE.md`, `1.03.Humans.ImpyriumPsion.md`, `1.03.Humans.ImpyriumRegi.md`, `1.03.Humans.Janissary.md`, `1.03.Humans.Kheen.md`, `1.03.Humans.Lin.md`, `1.03.Humans.Nian.md`, `1.03.Humans.Premian.md`, `1.03.Humans.Rautha.md`, `1.03.Humans.Risakin.md`, `1.03.Humans.Varen.md`.

  * `species/Kitin/` (7 files): `1.03.Kitin.md`, `1.03.Kitin.Maantene.md`, `1.03.Kitin.Manelli.md`, `1.03.Kitin.Murex.md`, `1.03.Kitin.Rakne.md`, `1.03.Kitin.Riezen.md`, `1.03.Kitin.Syndess.md`.

  * `species/Orll/` (3 files): `1.03.Orll.md`, `1.03.Orll.Base.md`, `1.03.Orll.GraOr.md`.

  * `species/Progenitors/` (3 files): `1.03.Progenitors.md`, `1.03.Progenitors.Ila.md`, `1.03.Progenitors.UNonn.md`.

  * `species/ShaNor/` (4 files): `1.03.ShaNor.md`, `1.03.ShaNor.Base.md`, `1.03.ShaNor.Eakren.md`, `1.03.ShaNor.Tenen.md`.

  * `species/Synthetics/` (14 files): `1.03.Synthetics.md`, `1.03.Synthetics.Aetherion.md`, `1.03.Synthetics.Android.md`, `1.03.Synthetics.Biomechanical.md`, `1.03.Synthetics.Eidolon.md`, `1.03.Synthetics.Golem.md`, `1.03.Synthetics.IntellectConstruct.md`, `1.03.Synthetics.Mekan.md`, `1.03.Synthetics.Protocol.md`, `1.03.Synthetics.Scraps.md`, `1.03.Synthetics.SentientMachine.md`, `1.03.Synthetics.Shell.md`, `1.03.Synthetics.Skins.md`, `1.03.Synthetics.Swarm.md`.

### 1.04. Factions (`./operator/`)

* *Allegiance in the Tangent galaxy grants an Operator 20 Background Skill Ranks, cultural doctrines, factional equipment access, and ancient political rivalries.*

* *"A flag is just a target you agree to wear on your shoulder in exchange for ammunition."* — **Mercenary Guild proverb**

* **Hub Document:** `operator/1.04 FACTIONS.md` — Master index of galactic polities and the `20 SP` Faction Background allocation rules (`0 CP` baseline cost, cultural traits, Wealth Score modifiers, and Recommended Features).

* **Aeld Providence & Schism Polities (`operator/factions/` — 6 files):**

  * `1.04.AeldProvidence.md`, `1.04.AeldProvidence.AlterianEnclave.md`, `1.04.AeldProvidence.DraconianOrder.md`, `1.04.AeldProvidence.KovianTribunal.md` (standardized at `+3 WS`), `1.04.AeldProvidence.SilvermoonVanguard.md`, `1.04.AeldProvidence.VajarTribes.md`.

* **The Impyrium (`operator/factions/` — 2 files):**

  * `1.04.Impyrium.Dominion.md`, `1.04.Impyrium.Radiant.md` (including the canonical *Psycholith* mineral codex).

* **Major Galactic Powers (`operator/factions/` — 9 files):**

  * `1.04.Major.Ascendancy.md`, `1.04.Major.AuluranClans.md`, `1.04.Major.Coalition.md`, `1.04.Major.DraconDynasty.md`, `1.04.Major.EntariCombine.md`, `1.04.Major.KitinCollective.md`, `1.04.Major.MekanCollective.md`, `1.04.Major.Outworlds.md`, `1.04.Major.Syndicate.md`.

* **Minor & Archetypal Factions (`operator/factions/` — 25 files):**

  * `1.04.Archetypal.Alien.md`, `1.04.Archetypal.ArtificialLife.md`, `1.04.Archetypal.Corporate.md`, `1.04.Archetypal.CosmicHorror.md`, `1.04.Archetypal.CosmicJustice.md`, `1.04.Archetypal.Criminal.md`, `1.04.Archetypal.Environmental.md`, `1.04.Archetypal.GeneticEngineering.md`, `1.04.Archetypal.HiveMind.md`, `1.04.Archetypal.InterstellarDiplomats.md`, `1.04.Archetypal.Mercenary.md`, `1.04.Archetypal.Military.md`, `1.04.Archetypal.Mutant.md`, `1.04.Archetypal.Planetary.md`, `1.04.Archetypal.Political.md`, `1.04.Archetypal.PostApocalyptic.md`, `1.04.Archetypal.Rebel.md`, `1.04.Archetypal.ReligiousCult.md`, `1.04.Archetypal.SentientIntelligence.md`, `1.04.Archetypal.SpaceExploration.md`, `1.04.Archetypal.SpacePirate.md`, `1.04.Archetypal.SpaceReligion.md`, `1.04.Archetypal.SpaceTourism.md`, `1.04.Archetypal.Supernatural.md`, `1.04.Archetypal.Technological.md`.

### 1.05. Origins (`./operator/`)

* *The gravity well, orbital spindle, or radiation-scoured frontier where you spent your formative years leaves a permanent imprint on your instincts and survival skills.*

* *"You can take the spacer out of the bulkhead, but they'll still check the pressure seals before they check the menu."* — **Deep-Void Navigator's Saying**

* **Hub Document:** `operator/1.05 ORIGINS.md` — Master index of planetary and habitat upbringings and the `20 SP` Origin Background allocation rules (`0 CP` baseline cost, upbringing traits, and Recommended Features).

* **Sub-Module Files (`operator/origins/` — 11 files):**

  * `1.05.Agricultural.md`, `1.05.Aquatic.md`, `1.05.Colony.md`, `1.05.Enlightened.md`, `1.05.Hostile.md`, `1.05.Industrial.md`, `1.05.Leisure.md`, `1.05.Militaristic.md`, `1.05.Research.md`, `1.05.Spacer.md`, `1.05.Urban.md`.

### 1.06. Occupations (`./operator/`)

* *Your Occupation represents your adult vocation, guild certification, or underworld trade prior to becoming an active Operator, providing 20 Background Skill Ranks and your baseline Wealth Score modifier.*

* *"Everyone has a past. Some of us got paid for ours."* — **Syndicate Fixer**

* **Hub Document:** `operator/1.06 OCCUPATIONS.md` — Master index of career packages, `20 SP` Occupation Background allocation rules (`0 CP` baseline cost), starting Wealth Score modifiers, and Recommended Features.

* **Sub-Module Files (`operator/occupations/` — 13 files):**

  * `1.06.Adept.md`, `1.06.Agent.md`, `1.06.Builder.md`, `1.06.Citizen.md`, `1.06.Criminal.md`, `1.06.Drifter.md`, `1.06.Entertainer.md`, `1.06.Merchant.md`, `1.06.Representative.md`, `1.06.Scholar.md`, `1.06.Scout.md`, `1.06.Soldier.md`, `1.06.Specialist.md`.

### 1.07. Skills (`./operator/`)

* *Skills quantify an Operator's learned training from Rank 1 (Novice) to Rank 30 (Pinnacle), adding directly to every 2d10 check alongside the governing Attribute modifier.*

* *"Luck is a bell curve. Training is how you shift the center of gravity."* — **Alterian War-Scholar**

* **Hub Document:** `operator/1.07 SKILLS.md` — Master skill index, `1 CP per 1 Skill Rank` straight pricing, rank mastery tiers, and canonical skill name enforcement (`Alertness`, `Insight`, `Knowledge (Language)`, `Athletics`, `Vocation (Handler)`, `Knowledge (Technology)`, `Computers`).

* **Skill Mechanics Sub-Modules (`operator/skills/` — 7 files):**

  * `1.07.Mechanics.Learning.md`, `1.07.Mechanics.SkillChecks.md`, `1.07.Mechanics.SkillGroups.md`, `1.07.Mechanics.SkillUse.md`, `1.07.Mechanics.Specialization.md`, `1.07.Mechanics.SynergyAndAdvantage.md`, `1.07.Mechanics.TimeAndFocus.md`.

* **Skill Compendium Sub-Modules (`operator/skills/` — 13 files):**

  * `1.07.Combat.md`, `1.07.Mental.Core.md`, `1.07.Mental.Knowledge.md`, `1.07.Mental.Knowledge.N_T.md`, `1.07.Mental.Vocation.md`, `1.07.Mental.Vocation.A_C.md`, `1.07.Mental.Vocation.C_G.md`, `1.07.Mental.Vocation.H_W.md`, `1.07.Metaphysics.md`, `1.07.Physical.md`, `1.07.Social.Expression.md`, `1.07.Social.Expression.O_W.md`, `1.07.Social.Manipulation.md`.

### 1.08. Features (`./operator/`)

* *Features grant specialized tactical maneuvers, innate talents, metaphysical awakenings, and rule-bending capabilities beyond raw Skill Ranks.*

* *"Any grunt can pull a trigger. A master knows how to put three rounds through the same seam in the armor."* — **Drop Marine Gunnery Sergeant**

* **Hub Document:** `operator/1.08 FEATURES.md` — Master Features index and CP pricing rules (`3 CP` Standard Feature; `2 CP` when listed under a character's Archetype, Species, Faction, Origin, or Occupation **Recommended Features**; minimum `1 CP`).

* **Sub-Module Files (`operator/features/` — 10 files):**

  * `1.08.AbilityFeatures.md`, `1.08.CombatFeatures.md` (including the **Precision Strike** damage consolidation chain), `1.08.CombatFeatures.D_W.md`, `1.08.DisciplineFeatures.md`, `1.08.GeneralFeatures.md`, `1.08.GeneralFeatures.N_Z.md`, `1.08.KarmaFeatures.md`, `1.08.SkillFeatures.md`, `1.08.SkillFeatures.M_Z.md`, `1.08.SpecialFeatures.md`.

### 1.09. Hindrances (`./operator/`)

* *Scars, psychological compulsions, sworn vows, and underworld debts complicate an Operator's life while granting up to +10 Character Points during character creation.*

* *"Everyone carries weight. The smart ones make sure their burdens pay interest."* — **Nocturne Confessor**

* **Hub Document:** `operator/1.09 HINDRANCES.md` — Master Hindrances index, severity tiers, and the **Personal Hindrance Cap Rule** (maximum `+10 CP` gained from personal Hindrances; Species-level hindrances and cybernetic Stigmas are strictly exempt from this cap).

* **Sub-Module Files (`operator/hindrances/` — 3 files):**

  * `1.09.Physical.md`, `1.09.MentalAndPsychological.md`, `1.09.SocialAndBackground.md`.

### 1.10. Scaling (`./operator/`)

* *From microscopic picotech swarms to continent-spanning titan-walkers, the Universal Size and Scale Matrix ensures seamless interaction between personal and vehicular combat.*

* *"Mass has a quality all its own."* — **Entari Siege Engineer**

* **Standalone Module:** `operator/1.10 SCALING.md` — Complete size table from Miniscule to Mega-Colossal, relative size Attack/Defense/Stealth modifiers, pre-calculated Structure Point baselines, and active Scale Multipliers (`x1` Medium to `x80+` Titanic) applied to weapon damage, speed, and range.

### 2.00. Economatrix (`./operator/`)

* *The Economatrix unifies abstract character Wealth Scores, liquid Credit transactions, salvage mass, and the Universal Displacement Unit (UDU) equipment catalogs under a single exponential curve.*

* *"If its Crafting CR is below your Wealth Score, you don't buy it—your people already requisitioned it."* — **Corporate Quartermaster**

* **Hub Document:** `operator/2.00 ECONOMATRIX.md` — Master player economy and equipment hub governing `Value (Credits) = 10 * 4^(CR / 5)`, Linear Micro-Modifiers, Auto-Buy thresholds, and Liquidity Gap financing.

* **Sub-Module Files (`operator/economatrix/` — 12 files):**

  * `2.00.WealthAndLiquidity.md`, `2.00.CraftingAndValuation.md`, `2.00.InterstellarTrade.md`, `2.00.Equipment.md`, `2.00.WeaponModifications.md`, `2.00.Armor.md`, `2.00.Augmentations.md`, `2.00.Augmentations.AdvancedAndFBC.md`, `2.00.Mecha.md`, `2.00.Mecha.NauticalAndWalkers.md`, `2.00.Mecha.MilitaryAndAerospace.md`, `2.00.Architecture.md`.

### 3.00. Combat (`./operator/`)

* *Tactical combat in Tangent SF RP is fast, lethal, and deterministic—resolving every strike, dodge, suppression cone, and armor breach on the 2d10 bell curve.*

* *"Vitality is just sweat and luck. When the plasma hits Health, start praying to whatever Resonance you believe in."* — **Coalition Medic**

* **Hub Document:** `operator/3.00 COMBAT.md` — Master tactical combat engine covering Initiative, Action Economy (Standard, Move, Swift, Free, Reaction), Ranged and Melee attack resolution, Critical Hits (`Rolled Dice + 10` + `2x Base Weapon Damage Dice` + Critical Effect), Fumbles (`-10` + Complication), Armor Layering Cap, Weapon Penetration, and Stamina Base Toughness.

* **Sub-Module Files (`operator/combat/` — 5 files):**

  * `3.00.Edge.md`, `3.00.DamageAndLocations.md`, `3.00.DamageTypes.md`, `3.00.StatusEffects.md`, `3.00.VehicularCombat.md`.

### 4.00. Metaphysics (`./operator/`)

* *Those who awaken to the Resonance can bend energy, matter, entropy, space-time, perception, and consciousness itself—provided their mind and body can withstand the strain.*

* *"Science is what we call the Resonance once we've built a cage around it."* — **Magister of the Silvermoon Vanguard**

* **Hub Document:** `operator/4.00 METAPHYSICS.md` — Master player metaphysics hub detailing Awakening requirements, Metafocus attributes, Attune checks vs. Invocation CR, Free-Casting, and Vitality channeling.

* **Sub-Module Files (`operator/metaphysics/` — 7 files):**

  * `4.00.SensoryManifestations.md`, `4.00.Dimension.md`, `4.00.Energy.md`, `4.00.Entropy.md`, `4.00.Illusion.md`, `4.00.Matter.md`, `4.00.Mental.md`.

### Volume II: The Architect's Matrix (`./architect/`)

* *Behind the player-facing compendiums lies the Architect's Matrix—a deterministic suite of procedural generation engines, economic unified field equations, and modular construction protocols for Game Masters and the BASTION AI Arbiter.*

* *"The Architect does not guess what a starship costs or how a dragon breathes plasma; the Matrix calculates both from first principles."* — **Architect's Matrix, Protocol 00.00**

* **00.00 GM Guidelines (`architect/00.00 GM GUIDELINES.md`):**

  * Architect adjudication philosophy, deterministic Challenge Rating assignment, encounter pacing, Dual AI Pair-GM (BASTION + Narrative GM) operational protocols, and Session Zero safety tools.

* **02 Economy and Wealth (`architect/02 ECONOMY AND WEALTH.md` & `architect/economy/` — 2 sub-modules):**

  * `02.Economy.UnifiedFieldTheory.md` — Complete Economic Unified Field Theory (EUFT) design protocol, Base 5-CR exponential equation, Linear Micro-Modifiers (`+1` to `+4 CR` and `-1 CR` Flaw), Pristine (`50%`) vs. Scrap (`10%` / `5x` mass) material ratios, Liquidity Drag (Fence Rates), and the Productivity Engine.

  * `02.Economy.InterstellarTrade.md` — Macroeconomic trade routes, cargo lots, speculative market modifiers, customs inspections, and smuggling mechanics.

* **99. Archetypes (`architect/99. ARCHETYPES.md` & `architect/archetypes/` — 5 sub-modules):**

  * `99.Archetypes.A_D.md` (including `Con Artist`), `99.Archetypes.E_L.md`, `99.Archetypes.M_R.md`, `99.Archetypes.S_Z.md`, and `99.Archetypes.MBTIMapping.md` — Complete catalog of 220 NPC and Role Archetype templates harmonized to the 80-CP chassis plus the 16-type MBTI personality and temperament mapping appendix.

* **99. Metaphysics (`architect/99. METAPHYSICS.md` & `architect/metaphysics/` — 3 sub-modules):**

  * `04.TheResonance.md` — Cosmological Unified Field Theory of the Resonance and the 20 Galactic Theologies.

  * `99.Metaphysics.InvocationMatrix.md` — Custom Invocation engineering protocol (Range, Area, Duration, Damage, and CR scaling).

  * `99.Metaphysics.MetaTechMatrix.md` — Meta-Tech hardware forging (`1 Socket = Rank 10`, `2 Sockets = Rank 20`, `3 Sockets / 1 Mount / 1 Module = Rank 30`).

* **99. Modular Character Matrix (`architect/99. MODULAR CHARACTER MATRIX.md` & `architect/characters/` — 6 sub-modules):**

  * `99.Character.ModuleA.TierChassis.md` (Tier 0–20 NPC/Adversary baselines), `99.Character.ModuleB.CompetencyRoles.md`, `99.Character.ModuleC_E.BiologySoulLifepath.md`, `99.Character.ModuleE.LifepathSchema.md`, `99.Character.ModuleF_G.GenreAndVisuals.md` (10-Faction CRISP Visual Matrix), and `04.03.BestiaryAndXenofauna.md`.

* **99. Modular Companion Matrix (`architect/99. MODULAR COMPANION MATRIX.md` & `architect/companions/` — 2 sub-modules):**

  * `99.Companion.FormPackages.md` (`15 CP` biological, synthetic, and metaphysical chassis forms) and `99.Companion.FunctionAndExamples.md` (`25 CP` role packages and 10 Tiny "Thralls" Battle Companions).

* **99. Modular Faction Matrix (`architect/99. MODULAR FACTION MATRIX.md`):**

  * 4-Phase custom Faction construction protocol, geopolitical asset scaling, inter-faction conflict resolution, and Master Faction Template.

* **99. Modular Planetary Matrix (`architect/99. MODULAR PLANETARY MATRIX.md` & `architect/planetary/` — 4 sub-modules):**

  * `99.Planetary.AstrophysicsAndGeophysics.md`, `99.Planetary.CivilizationAndEconomy.md`, `99.Planetary.HazardsAndEncounters.md`, and `04.00.StarAtlasAndGazetteer.md` (complete sector gazetteer and star atlas).

* **99. Modular Species Matrix (`architect/99. MODULAR SPECIES MATRIX.md` & `architect/species/` — 3 sub-modules):**

  * `99.Species.ChassisAndMovement.md`, `99.Species.TraitsAndDisadvantages.md` (universal straight `5 CP` Attribute and `1 CP` Skill Rank pricing), and `04.03.01.DragonsCodex.md`.

* **99. Technology (`architect/99. TECHNOLOGY.md` & `architect/technology/` — 20 sub-modules across 7 nested folders):**

  * `technology/core/` (4 files): `99.Tech.Levels.md`, `99.Tech.CivilizationDomains.md`, `06.AetheriumAndAetherite.md`, `06.PolyMatterAndPicotech.md`.

  * `technology/architecture/` (4 files): `99.Tech.Architecture.ForgeProtocol.md`, `99.Tech.Architecture.ComponentCatalog.md`, `99.Tech.Architecture.MobileAndVFT.md`, `99.Tech.Architecture.ExamplesAndSkins.md`.

  * `technology/armor/` (2 files): `99.Tech.Armor.DesignAndCatalog.md`, `99.Tech.Armor.EconomyAndExemplars.md`.

  * `technology/augmentations/` (3 files): `99.Tech.Augmentations.Biological.md`, `99.Tech.Augmentations.Cybernetic.md`, `99.Tech.Augmentations.Metaphysical.md`.

  * `technology/equipment/` (2 files): `99.Tech.Equipment.Framework.md`, `99.Tech.Equipment.SystemsAndMastercrafting.md`.

  * `technology/mecha/` (3 files): `99.Tech.Mecha.ForgeProtocol.md`, `99.Tech.Mecha.ComponentsAndWeapons.md`, `99.Tech.Mecha.AutomataAndGear.md`.

  * `technology/weaponry/` (2 files): `99.Tech.Weaponry.ForgeProtocol.md`, `99.Tech.Weaponry.Catalog.md`.

* **99. JSON Validation Schemas (`architect/schemas/` — 5 sub-modules):**

  * `99.Schema.ArchitectureAndBase.md`, `99.Schema.BastionLinterAndValidator.md`, `99.Schema.MechaAndAutomata.md`, `99.Schema.OperatorCharacter.md`, `99.Schema.PlanetarySystem.md`.

## Part III — Discrepancy & Restoration Ledger

* **DISC-001 (Stamina Scaling Purge):** Replaced legacy `30 + [5 * STA]` Vitality and Health formulas with canonical CP-scaled pools (`Base 30 Vitality / Base 30 Health; +5 per 1 CP; NEVER scaled by Stamina`) and Stamina Base Toughness (`point-for-point damage reduction after Armor DR`).

* **DISC-002 (2d10 Fumble Normalization):** Normalized `Fumble (Nat 1)` to `Fumble (Nat 2 / Double-1s on 2d10)` to reflect the minimum possible result on a 2d10 bell curve.

* **DISC-003 (EUFT & Matrix Audit Axioms):** Added canonical Micro-Modifier Linear Multipliers (`+1 CR = x1.30`, `+2 CR = x1.75`, `+3 CR = x2.30`, `+4 CR = x3.00`, `-1 CR = x0.75`), Crafting Material Ratio (`50% Pristine vs. 10% Scrap`), Armor Layering Cap, and Mecha Scale/Garaging rules to the Mechanical Authority Block.

* **DISC-004 (Volume I & II Index Restoration):** Restored full Player's Handbook (`operator/`) and Architect's Matrix (`architect/`) module indexes into `00.00 MASTER CODEX INDEX.md` and synchronized `README.md` as an exact mirror.

* **DISC-005 (Unredacted Catalog Reconciliation & Rules Audit):** Verified 80-CP Archetype Chassis breakdown (`15 + 10 + 24 + 18 + 13 = 80 CP`), enforced `+10 CP` Personal Hindrance Cap with explicit Species-Level Hindrance Exemption, enforced canonical `"Recommended Features"` terminology across all background, species, and archetype modules, integrated the Radiant Impyrium *Psycholith* mineral codex into `1.04.Impyrium.Radiant.md`, standardized Kovian Tribunal at `+3 WS`, restored `Con Artist` in `99.Archetypes.A_D.md`, and enforced plain-text math across `00.02 BASTION CORE FORMULAS & ERRATA ENGINE.md`.

* **DISC-006 (Full Subfolder & Schema Topology Restoration):** Restored missing root manifests (`00.01`, `00.02`), `operator/1.00 INTRODUCTION.md` (`1.00.Glossary.md`), all 93 `operator/species/` taxonomic files, `99.Character.ModuleE.LifepathSchema.md`, `04.00.StarAtlasAndGazetteer.md`, all 20 modular `architect/technology/` files across 7 subfolders, and all 5 `architect/schemas/` files, while purging ASCII tree characters in compliance with the 100% Plain-Text Markdown Law.
