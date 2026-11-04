---
id: "doc-architect-99-modular-character-matrix"
name: "MODULAR CHARACTER MATRIX"
fileName: "99. MODULAR CHARACTER MATRIX.md"
relPath: "architect/99. MODULAR CHARACTER MATRIX.md"
isMasterDoc: true
masterDocId: "doc-architect-99-modular-character-matrix"
category: "architect_matrix"
parent: "5.00 ARCHITECT & MODULAR MATRICES (SOURCE OF TRUTH)"
order: 6
perspective: "architect"
entry_type: "Architect Matrix"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","source-of-truth","99. modular character matrix","matrix"]
updatedAt: "2026-11-04T00:33:10.373Z"
costs:
  bp: 0
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
modifiers: []
modifications: []
critical_details:
  score: ''
  effect: []
  success_effect: []
  failure_effect: []
sockets:
  max: 0
  used: 0
  tier: Socket
  allocated: []
---

# **99. MODULAR CHARACTER MATRIX (MCM)**

## **UNIFIED PROTOCOLS FOR NPCS, ALLIES, BOSSES & ADVERSARIES**

## **PHASE I: COMPREHENSIVE CONSTRUCTION PROTOCOL**

### **1. INTRODUCTION: THE MCM PHILOSOPHY**

In the architecture of tabletop role-playing games, the non-player character (NPC) serves as the primary interface between the player and the fictional world. Whether functioning as a monolithic antagonist, a disposable minion, a powerful political neutral, or a cherished ally, the efficacy of a character is determined by the depth of their internal logic and the specificity of their external presentation. The distinction between these roles is not a matter of physics, but of narrative alignment. All characters, regardless of their allegiance to the players, exist within the exact same mechanical reality and utilize the same scaling systems.

To maintain Ludonarrative Consistency, this framework utilizes the Modular Character Matrix (MCM). This schema generates high-fidelity characters across multiple strata by synthesizing archetypes, lifepath methodologies, and motivational psychology into a modular "Stack" approach:

- **TIER CHASSIS (Power Level)** — *[Reference Module A: The Tier Chassis](./characters/99.Character.ModuleA.TierChassis.md)*
- **+ DESIGNATION (Allegiance Rules)** — *[Reference Module B: Competency Roles & Matrices](./characters/99.Character.ModuleB.CompetencyRoles.md)*
- **+ COMPONENTS (Species/Role)** — *[Reference Module C: Species & Biology](./characters/99.Character.ModuleC_E.BiologySoulLifepath.md)*
- **+ NARRATIVE (Soul)** — *[Reference Module D: Narrative Architecture](./characters/99.Character.ModuleC_E.BiologySoulLifepath.md)*, *[Reference Module E: Lifepath Schema](./characters/99.Character.ModuleE.LifepathSchema.md)*, and *[Reference Modules F & G: Genre & Visual Semiotics](./characters/99.Character.ModuleF_G.GenreAndVisuals.md)*
- **= COMPLETE HIGH-FIDELITY NPC STAT BLOCK** *(For a full mechanical stat block, Modules A, B, and C are used with Modules D, E, F, and G supplying the narrative content and visual semiotics of the character).*

### **2. INSTRUCTIONAL WORKFLOW (THE 4-STEP CONSTRUCTION PROTOCOL)**

Follow this rigorous, step-by-step procedure to construct any non-player character, from a backwater scavenger to a Galactic Emperor.

#### **STEP 1: DEFINE CONCEPT & DESIGNATION**

The absolute first step before calculating any numbers or mechanics is determining the narrative allegiance and mechanical function of the character in the game. Undertaken by the Architect or the Operator (if creating a Companion), this choice dictates how the character interacts with the core ruleset, preventing the over-engineering of simple background characters while ensuring major players have robust stats. These decisions are documented on the Character Stat Block. To begin, select one of four core Designations:

- **Designation A: ADVERSARY (Enemy):** Built to actively oppose the players. Utilizes the full combat mechanics of their assigned Tier.
- **Designation B: ALLY (Independent Supporter):** Built to aid the players autonomously. Utilizes the full mechanics of their assigned Tier, but operates independently of player action economy.
- **Designation C: COMPANION (Player-Bound):** A specific sub-set of Ally bound directly to a Player Character via a purchased Feature. Restricted strictly by a Character Point (CP) budget starting at 40 CP.
- **Designation D: NEUTRAL (Civilian/Bystander):** Characters not actively engaged in the central conflict. While they possess a Tier Level dictating their professional competence, they are managed via simplified Narrative Blocks until violence is initiated.

#### **STEP 2: SELECT THE CHASSIS (POWER LEVEL)**

Immediately after selecting the Designation, the Architect assigns a Threat Tier (0 to 20) to establish the character's baseline competence, health, skill modifiers, and action economy. This step provides the mathematical skeleton, ensuring that a Tier 6 Allied soldier is mechanically balanced against a Tier 6 Adversary creature. Consult **[Reference Module A: The Tier Chassis](./characters/99.Character.ModuleA.TierChassis.md)** to apply the baseline numbers.

*(Note: Companions do not use arbitrary Architect Tiers; they scale strictly via Operator CP investment).*

#### **STEP 3: APPLY COMPONENT PACKAGES**

After the base numbers of the Chassis are recorded, the Architect layers specific occupational and biological traits onto the base Chassis. This differentiates characters mechanically, ensuring a Tier 4 "Sniper" functions completely differently from a Tier 4 "Tank." Consult **[Reference Module B (Competency Roles)](./characters/99.Character.ModuleB.CompetencyRoles.md)** and **[Reference Module C (Species & Biology)](./characters/99.Character.ModuleC_E.BiologySoulLifepath.md)** to apply these traits:

1. **Apply Role Package:** Choose a specific tactical job (e.g., Brute, Healer, Spy) from Reference Module B. Apply the mandated Primary Attributes, Key Skills, and Tactical Behaviors to the character's stat block.
2. **Apply Species Package:** Add Attribute Modifiers, biological features (e.g., Natural Armor, Flight), and adjust Size Scaling from the Tangent Species Codex.

#### **STEP 4: REFINE NARRATIVE & PSYCHOLOGY**

As the final step to solidify the "Soul" of the character, the Architect establishes their motivations, history, and visual aesthetic. Mechanics without narrative are sterile; this step dictates exactly why the character fights, negotiates, or surrenders.

1. Consult **Reference Module D** to define the character's "Want" (immediate goal), "Lie" (core flaw), "Ghost" (past trauma), and behavioral quirks.
2. Consult **Reference Module E** to roll or select their developmental Lifepath.
3. Consult **Reference Modules F and G** to outfit them with appropriate factional aesthetics, cybernetics, and physical assets.

## **PHASE II: UNIVERSAL CHARACTER PROTOCOLS (THE RULES)**

This phase details the specific mechanics governing how the Designations scale, behave, and engage with the game world based on their Tier.

### **1. THE UNIVERSAL THREAT HIERARCHY (TIERS 0–20)**

All characters (except Companions) use the Tier Chassis to instantly generate high-fidelity statistics. An effective campaign utilizes a tiered hierarchy of characters to pace the narrative scale. A character's complexity scales with their assigned Tier:

- **Tiers 0–2 (Minions & Commoners — The 1 HP Rule):** These characters use the **1 HP Rule**. They do not track Vitality or Health. If they take any damage that bypasses their **Armor Damage Resistance (DR) + Stamina Base Toughness**, they are instantly incapacitated, killed, or forced to flee. They are faceless masses used to drain player resources or provide a sense of scale. In combat, groups of Minions can be clustered to act as a single "Swarm" unit. *(Note: The 1 HP Rule supersedes all biological Size Multipliers).*
- **Tiers 3–9 (Standards & Specialists):** Fully realized characters representing elite units, professional merchants, or skilled mercenaries. They track standard **Vitality** and **Health** pools based on their Tier (Base 30 + Tier Bonus; **Tier 5 = Starting 150 CP Player Character**) and utilize tactical Role Packages (e.g., Flanking, Suppressing Fire). They are dangerous but lack grand, world-altering ambition.
- **Tiers 10–16 (Bosses & High Lords):** Major narrative figures, faction leaders, and lethal commanders. To survive the combined action economy of a player party, any Adversary designated as a Boss automatically multiplies their total Vitality and Health (or Structure) pools by **x2**. They also gain access to advanced action economy mechanics:
  - *Legendary Resilience (1–3/Day):* If the character fails a critical Saving Throw (Fortitude, Reflex, or Willpower), they can choose to succeed instead (usable 1–3 times per day, depending on Tier).
  - *Lair / Command Actions:* On Initiative count 20 (losing ties), the character can trigger a massive environmental effect in their territory (e.g., venting plasma, shifting gravity, summoning guards).
- **Tiers 17–20 (Masterminds & Cosmic Entities):** Overarching threats or god-like allies with high agency and high resources. They multiply their total Vitality and Health (or Structure) pools by **x3 to x5**. Rarely encountered directly until major narrative climaxes, they possess "Plot Armor" (guaranteed narrative escape mechanisms until their final confrontation) and influence the setting at a macro-scale.

### **2. ALLIES VS. COMPANIONS**

While both support the players, they function under entirely different mechanical constraints:

- **The Ally (Independent):** A heavily armed mercenary or a powerful planetary governor. They are controlled by the Architect. They possess a full Tier scaling (e.g., a Tier 12 Commander) and operate on their own initiative count. They will leave, betray, or demand payment based on their personal motivations.
- **The Companion (Player-Bound):** A loyal pet, familiar, or customized drone purchased via the Companion Feature (40 CP Base). They are controlled by the Player. To ensure survivability, Companions automatically gain the Base Actions, Vit/Health Bonus, and Expected DR of the Tier Chassis that their total CP budget equates to (e.g., a 100 CP Companion automatically gains the Tier 3 baseline stats). Their CP is then spent exclusively on customizing Attributes, Skills, and Features. They act on the Player's initiative count and possess unique bond mechanics (Empathic Link, Telepathic Mind Link, Symbiosis). *Note: Companions are completely dependent on their Player for gear and do not automatically generate a Wealth Score.*

### **3. THE NEUTRAL PROTOCOL**

Neutrals (merchants, bureaucrats, civilians) can exist at any power level. A bartender might be Tier 0, while a Corporate CEO might be a Tier 15 Administrator.

- **The Narrative Block:** To save Architect prep time, Neutrals do not require full combat stat blocks. They are tracked using only three metrics: Concept, Key Skill (e.g., Administration Rank 22), and Disposition (Friendly, Indifferent, Hostile).
- **Combat Trigger & Desperate Evasion:** If forced into violence, a Neutral utilizes the full Health and Vitality pools of their assigned Tier Chassis, making high-level politicians and scholars extremely durable. However, because they lack combat training, they must roll all attacks using the Untrained (Rank 0) mechanics (`Attack Roll = 2d10 + Attribute Mod` only). While their attacks are Untrained, they retain their full Tier Action Economy exclusively for Movement, Evasion, and activating defenses. A High-Tier Neutral taking the *Total Defense (+4 Defense)* or *Flee* action may substitute their highest Vocation or Knowledge Skill Rank for their Defense Rank. This represents their ability to intuitively trigger automated defenses, utilize advanced personal shielding, or expertly navigate their home terrain to avoid strikes.

### **4. TACTICAL BEHAVIOR PROTOCOLS**

To translate a character's narrative motivations into actionable gameplay, the Architect must define their tactical behavior on the battlefield. During the final encounter design phase, this profile dictates exactly how they engage players, utilize their environment, and when they choose to retreat:

- **The Mastermind (Tiers 17–20):** Rarely fights alone. Uses the environment, elaborate traps, and loyal minions as shields. Flees well before their life is truly threatened. Attacks from extreme range, manipulates reality, or uses proxies (drones/mind-controlled thralls).
- **The Boss / Officer (Tiers 10–16):** Coordinates others. Actively buffs allies (shouting orders, projecting auras). Engages the strongest hero or leader directly (The Lancer). Uses high-end tactical equipment and consumables immediately, saving nothing for later.
- **The Specialist / Henchman (Tiers 3–9):** Focuses relentlessly on specific vulnerabilities or soft targets (The Healer, The Mage). Uses specialized attacks (sniping from cover, backstabbing). Will strategically retreat if the tide turns against them to fight another day.
- **The Minion / Swarm (Tiers 0–2):** Attacks the absolute nearest target without tactical foresight. Uses "Pack Tactics" to flank for bonuses. Morale breaks easily when their numbers dwindle or their leader falls. Dangerous only through sheer action economy.

## **PHASE III: SUMMARY TIER CHASSIS TABLE & STAT DERIVATION**

| Tier | Narrative Rank | Primary / Sec Attributes | Primary / Secondary Skill Ranks | Actions / Round | Vit / Hea Bonus* | Base Armor DR | Equiv. CP Budget |
| :---: | :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| **0** | **Civilian / Minion** | +0 / +0 | Rank 5 (Novice) / Rank 3 | 1 | +0 *(1 HP Rule)* | 0 | < 50 CP |
| **1** | **Adept** | +0 / +0 | Rank 6 (Trained) / Rank 3 | 2 | +5 (35 / 35) | 2 | 50 CP |
| **2** | **Militia** | +1 / +0 | Rank 7 (Trained) / Rank 4 | 2 | +10 (40 / 40) | 5 | 75 CP |
| **3** | **Trooper** | +1 / +1 | Rank 8 (Trained) / Rank 4 | 2 | +15 (45 / 45) | 8 | 100 CP |
| **4** | **Standard** | +2 / +1 | Rank 9 (Trained) / Rank 5 | 2 | +20 (50 / 50) | 10 | 125 CP |
| **5** | **Professional (PC Base)** | **+2 / +2** | **Rank 10 (Trained) / Rank 5** | **2** | **+25 (55 / 55)** | **12** | **150 CP** |
| **6** | **Veteran** | +3 / +2 | Rank 11 (Expert) / Rank 6 | 3 | +30 (60 / 60) | 15 | 175 CP |
| **7** | **Specialist** | +3 / +2 | Rank 12 (Expert) / Rank 7 | 3 | +35 (65 / 65) | 18 | 200 CP |
| **8** | **Elite** | +4 / +3 | Rank 13 (Expert) / Rank 8 | 3 | +40 (70 / 70) | 20 | 225 CP |
| **9** | **Operative** | +4 / +3 | Rank 14 (Expert) / Rank 9 | 3 | +45 (75 / 75) | 22 | 250 CP |
| **10** | **Champion** | +5 / +4 | Rank 16 (Master) / Rank 11 | 4 | +50 (80 / 80) | 25 | 275 CP |
| **11** | **Warlord** | +5 / +4 | Rank 17 (Master) / Rank 12 | 4 | +55 (85 / 85) | 28 | 300 CP |
| **12** | **Commander** | +6 / +4 | Rank 18 (Master) / Rank 13 | 4 | +60 (90 / 90) | 30 | 325 CP |
| **13** | **General** | +6 / +5 | Rank 19 (Master) / Rank 14 | 4 | +65 (95 / 95) | 32 | 350 CP |
| **14** | **Paragon** | +7 / +5 | Rank 21 (Grand Master) / Rank 16 | 5 | +70 (100 / 100) | 35 | 375 CP |
| **15** | **High Lord** | +7 / +6 | Rank 22 (Grand Master) / Rank 17 | 5 | +75 (105 / 105) | 38 | 400 CP |
| **16** | **Heroic** | +8 / +6 | Rank 23 (Grand Master) / Rank 18 | 5 | +80 (110 / 110) | 40 | 425 CP |
| **17** | **Legend** | +8 / +7 | Rank 24 (Grand Master) / Rank 19 | 5 | +85 (115 / 115) | 42 | 450 CP |
| **18** | **Ascendant** | +9 / +7 | Rank 26 (Pinnacle) / Rank 21 | 6 | +90 (120 / 120) | 45 | 475 CP |
| **19** | **Demigod** | +9 / +8 | Rank 28 (Pinnacle) / Rank 23 | 6 | +95 (125 / 125) | 48 | 500 CP |
| **20** | **Cosmic / Mythic** | +10 / +8 | Rank 30+ (Pinnacle) / Rank 26 | 6 | +100 (130 / 130) | 50+ | 525+ CP |

### **Deriving Canonical Stats from the Base Chassis**

- **Skill Allocation:** Assign the **Primary Skill Rank** to the first Key Skill listed in the character's Role Package (Module B), and the **Secondary Skill Rank** to all remaining Key Skills.
- **Initiative:** `2d10 + Agility Mod + Alertness Rank`.
- **Attack (Strike) Bonus:** `2d10 + Primary Offensive Attribute Mod + Key Combat/Attune Skill Rank`.
- **Defense Score:** `10 + Agility Mod + Defense Skill Rank + Armor/Shield/Size Modifiers`.
- **Saving Throws (Fortitude, Reflex, Willpower):**
  - **Active Save Roll:** `2d10 + 2 + (2 * Attribute Score) + Feature Bonus`
  - **Passive Save CR (Take 10):** `12 + (2 * Attribute Score) + Feature Bonus`
- **Damage Mitigation (Armor DR + Base Toughness):** Subtract **Effective Armor DR** first, then subtract the character's **Stamina (STA) Modifier** point-for-point (**Base Toughness**).
- **Vitality, Health & Structure Pools (Zero Stamina Scaling):**
  - **Biological Entities:** Begin with **30 Base Vitality** and **30 Base Health**, adding the **Vit/Hea Bonus** from the Tier Chassis table directly to each pool (representing +5 points per 1 CP invested). **Stamina never increases Vitality or Health.**
  - **Synthetics, Constructs & Mecha:** Combine total Vitality and Health into a single **Structure Points (`SP = Vitality + Health`)** pool (`Base 60 SP + [2 * Tier Bonus]`).
- **Size & Designation Multiplier Stacking:**
  1. First, multiply Base Vitality and Health (or Structure) by the creature's **Size Scaling Multiplier** (*Small x2/3, Medium x1, Large x2, Huge x5, Gargantuan x10, Colossal x20*).
  2. Second, if the NPC is a **Boss (`x2`)** or **Mastermind (`x3` to `x5`)**, multiply the size-scaled pool by the Designation Multiplier.
- **Wealth Score (WS):** `Base WS = 2 * Threat Tier` (Companions, feral beasts, and mindless constructs have no independent WS).
- **Invocation Stages:** Convert total Discipline Focus Skill Rank + Invocation Rank to Stages:
  - **Stage 1 (Novice):** Ranks 1–5
  - **Stage 2 (Trained):** Ranks 6–10
  - **Stage 3 (Expert):** Ranks 11–15
  - **Stage 4 (Master):** Ranks 16–20
  - **Stage 5 (Grand Master):** Ranks 21–25
  - **Stage 6 (Pinnacle):** Ranks 26–30+

# **MODULAR CHARACTER MATRIX (MCM) DIRECTORY INDEX**

Phase III Reference Modules (The Database) for constructing NPCs, Bestiary Xenofauna, and Progenitors across Tiers 0–20 are organized in the `./characters/` directory:

- **[Reference Module A: The Tier Chassis](./characters/99.Character.ModuleA.TierChassis.md)** — *Baseline CP, Attribute caps, Skill ceilings, Vitality/Health pools, and Defense/Attack benchmarks across Tiers 0–20*
- **[Reference Module B: Competency Roles & Matrices](./characters/99.Character.ModuleB.CompetencyRoles.md)** — *Combat, Technical, Social, and Metaphysical role templates and stat distributions*
- **[Reference Modules C & D: Biology & Narrative Architecture](./characters/99.Character.ModuleC_E.BiologySoulLifepath.md)** — *Species & Biology modifiers, Narrative Architecture (The Soul), Physicality/Attire/Voice, and Psychological Lie/Ghost Engine*
- **[Reference Module E: Lifepath Backstory Schema](./characters/99.Character.ModuleE.LifepathSchema.md)** — *Childhood (0–12), Adolescence (13–18), and Adulthood/Career (19+) d10 Lifepath Tables*
- **[Reference Modules F & G: Genre & Visual Semiotics](./characters/99.Character.ModuleF_G.GenreAndVisuals.md)** — *Genre & Setting Modules, Mystery Suspect Triangle, Equipment/Cybernetic Loadouts, and Faction Visual Semiotics*
- **[Bestiary, Xenofauna & Progenitor Compendium](./characters/04.03.BestiaryAndXenofauna.md)** — *Scaled Xenofauna & Adversary Stat Blocks, 20 Canonical Bestiary Profiles, and Progenitor Entities (The Entity, The Ila, The U'Nonn) with CRISP Visual Matrices*

## **MECHANICAL AUTHORITY & CANONICAL RULES BLOCK**

- **Core Resolution Engine:** `2d10 + Skill Rank + Attribute Modifier + Situational Modifiers vs. Challenge Rating (CR)`. Critical Hit (Natural 20 / double-10s) = `Rolled Dice + 10 (20 -> 30) + 2x Base Weapon Damage Dice + Critical Effect`. Fumble (Natural 2 / double-1s) = `Flat -10 + Complication`. Advantage/Disadvantage rolls `+1d10` per stack and keeps the highest or lowest 2 dice.
- **Character Point (CP) Economy & 80-CP Archetype Chassis:** Starting Operator budget is **150 CP**, partitioned into the **80-CP Archetype Chassis** (`15 CP` Primary Attribute at `+3`, `10 CP` Secondary Attribute at `+2`, `24 CP` for 4 Essential Skills at Rank 6, `18 CP` for 6 Supporting Skills at Rank 3, and `13 CP` for 2 Signature Traits at 1 CP each + 3 Recommended Core Features at 9 CP) plus **70 CP Customization**.
- **60-SP Sociological Background Allocation:** **Faction (20 SP) + Origin (20 SP) + Occupation (20 SP) = 60 Skill Ranks, 4 Features, and 4 Traits at 0 CP** (additional traits cost 1 CP each).
- **Universal Straight CP Pricing:** Attributes cost **5 CP per +1** (and refund **-5 CP per -1 penalty**); Skills cost **1 CP per 1 Skill Rank** (**5 CP per 5 Ranks**) across all character, species, companion, and adversary builds with zero package discounts. Standard Features cost **3 CP** (**2 CP** when listed under **Recommended Features**, minimum 1 CP).
- **Vitality, Health & Structure (Zero Stamina Scaling):** Biological characters begin with **Base 30 Vitality** and **Base 30 Health** (Synthetics/Constructs combine both into **Base 60 Structure Points [SP]**), scaled strictly at **+5 points per 1 CP** spent. **Stamina (STA) never increases Vitality or Health**; Stamina modifier subtracts point-for-point from incoming damage as **Base Toughness** after highest single-domain Armor DR (`Stability Points = STA + 5`).
- **Personal Hindrance Cap:** Maximum **+10 CP** gained from personal Hindrances at character creation; **Species-level disadvantages and Stigmas are exempt** from this cap.

## **PHASE III: STANDARDIZED PERSONA TEMPLATE & QUICK START BUILD RULES**

### **1. Canonical Persona Sheet Schema**

- **Core Identity:** Name, Concept, Archetype (80 CP Chassis), Species, Faction (20 SP), Origin (20 SP), Occupation (20 SP).
- **Biometrics & Background:** Age, Gender, Height, Weight, Personality / Motive, Description / Style.
- **Attributes & Saves (Base Human Score = 0; +1 Attribute = 5 CP; -1 Penalty = -5 CP):**
  - **Strength (STR):** Might Save (`Active = 2d10 + 2 + [2 * STR] + Feature Bonus` | `Passive CR = 12 + [2 * STR] + Feature Bonus`)
  - **Agility (AGI):** Reflex Save (`Active = 2d10 + 2 + [2 * AGI] + Feature Bonus` | `Passive CR = 12 + [2 * AGI] + Feature Bonus`)
  - **Stamina (STA):** Fortitude Save (`Active = 2d10 + 2 + [2 * STA] + Feature Bonus` | `Passive CR = 12 + [2 * STA] + Feature Bonus`; provides point-for-point Base Toughness after Armor DR)
  - **Intellect (INT):** Reason / Logic Save (`Active = 2d10 + 2 + [2 * INT] + Feature Bonus` | `Passive CR = 12 + [2 * INT] + Feature Bonus`)
  - **Wisdom (WIS):** Willpower Save (`Active = 2d10 + 2 + [2 * WIS] + Feature Bonus` | `Passive CR = 12 + [2 * WIS] + Feature Bonus`)
  - **Charisma (CHA):** Etiquette Save (`Active = 2d10 + 2 + [2 * CHA] + Feature Bonus` | `Passive CR = 12 + [2 * CHA] + Feature Bonus`)
- **Derived Statistics:**
  - **Initiative:** `2d10 + Agility + Alertness Rank` (or Reflex Base)
  - **Vitality & Health (Biological):** **Base 30 Vitality / Base 30 Health** (increased by `+5 points per 1 CP` spent separately; zero Stamina scaling)
  - **Structure Points (Synthetic / Construct):** **Base 60 SP** (`Vitality + Health` combined; `+5 SP per 1 CP`)
  - **Stability Points (Mortality State):** `Stamina Score + 5`
  - **Karma:** `3` (Base) | **Plot Points:** Architect discretion per story
  - **Tech Level (TL) & Meta Level (ML):** World/Faction baseline (`0` to `5`)
  - **Essence Pool:** `Sum of All Six Attributes + Attune Rank + Discipline Skill Ranks`
  - **Wealth Score (WS):** Starting Occupation Base + Faction Modifier + Benefit Features
  - **Movement Speeds:** Walk (`30 ft` base), Swim (`1/2 Walk`), Climb (`1/2 Walk`), Fly (`2x Walk`)
- **Canonical Skill Tree (`1 CP` per Rank; `60 SP` free from Faction `20 SP` + Origin `20 SP` + Occupation `20 SP`):**
  - **Physical:** Acrobatics, Athletics, Piloting, Stealth.
  - **Mental (Core, Knowledges & Vocations):** Alertness, Academics; **Knowledge** (*Appraisal, Computers, Culture, History, Investigation, Language, Medicine, Nature, Navigation, Nobility, Physics, Religion, Science, Survival, Social, Tactics, Technology*); **Vocation** (*Administrator, Alchemist, Ambassador, Architect, Archivist, Armorer, Artist, Artificer, Broker, Celebrity, Constable, Courtesan, Culinarian, Demolitionist, Electrician, Engineer, Groundskeeper, Handler, Laborer, Mechanic, Researcher, Salvager, Soldier, Tailor, Transporter, Weaponsmith*).
  - **Social (Manipulation & Expression):** Insight, Bluff, Diplomacy, Intimidate, Streetwise; **Expression** (*Acting, Comedy, Dancing, Disguise, Keyboard, Legerdemain, Oratory, Percussion, Singing, String, Style, Wind*).
  - **Combat (Archaic, Modern & Advanced):** Archaic (*Defense, Melee, Ranged, Unarmed*), Modern (*Ballistics, Heavy Weapons*), Advanced (*Energy Weapons, Heavy Energy*).
  - **Metafocus (Requires Awakened Feature per Discipline):** Attune; **Dimension** (*Summoning, Teleport*), **Energy** (*Elemental, Force*), **Entropy** (*Chaos, Order*), **Illusion** (*Phantasmal, Shadow*), **Matter** (*Enhancement, Transmutation*), **Mental** (*Telekinesis, Telepathy*), plus learned **Invocations** and **Special Abilities**.
- **Hindrances & Disadvantages:** Personal Hindrances grant up to a **+10 CP maximum cap** at creation (Species Disadvantages and Stigmas are exempt from this cap).
- **Traits & Recommended Features:** **4 Free Background Traits** (2 Origin + 2 Occupation; extra traits cost `1 CP` each) and **4 Free Background Features**. Standard Features cost **3 CP**; **Recommended Features** (listed by Archetype, Species, Faction, Origin, or Occupation) cost **2 CP** (`1 CP` discount, minimum `1 CP`).
- **Combat, Armor Location DR & Assets:** Weapons (`Attack Score`, `Damage`, `Notes`), Hit Location DR (`Head, Torso, Right Arm, Left Arm, Right Leg, Left Leg` — single highest domain DR applies), Gear, Mecha, Meta-Tech, and Property.
- **Character Point (CP) Expenditure Tracker:** Starting Budget (`150 CP` = `80 CP` Archetype Chassis + `70 CP` Customization) + Personal Hindrances (`+10 CP` max) + Species Disadvantage Refunds = Total CP Available minus Attributes (`5 CP` per `+1`), Skills (`1 CP` per Rank), Features (`3 CP` Standard / `2 CP` Recommended), Vitality/Health (`1 CP` per `+5`), and Extra Traits (`1 CP`).

## **DISCREPANCY & RESTORATION LEDGER (DISC-503)**

- **File Target:** `architect/99. MODULAR CHARACTER MATRIX.md`
- **Restoration Pass (Three-Way Merge):**
  - Merged 100% of the comprehensive Phase I & II narrative prose from `/game rules/architect/99. MODULAR CHARACTER MATRIX.md` with the canonical Tier 0–20 summary table and derivation formulas from the Nov 2 revision.
  - Added complete 6-file `./characters/` directory index including `99.Character.ModuleE.LifepathSchema.md` and `04.03.BestiaryAndXenofauna.md`.
- **Mechanical Normalization Pass (12 Global Rules):**
  - Normalized Saving Throws to `Active Save = 2d10 + 2 + (2 * Attribute) + Feature Bonus` and `Passive Save CR = 12 + (2 * Attribute) + Feature Bonus`.
  - Enforced Zero Stamina Scaling on Vitality/Health (Base 30/30 + Tier Bonus; Stamina provides point-for-point Base Toughness after Armor DR).

