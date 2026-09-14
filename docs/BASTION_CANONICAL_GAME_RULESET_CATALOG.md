# 🛡️ BASTION: CANONICAL GAME RULESET MASTER CATALOG
**Tangent Science Fantasy Roleplaying Game (TANGENT SFF RP)**  
*Universal Tactical Assistant, Mechanics Adjudication Engine & Rules Audit Reference*  
**Document Designation:** `BASTION-RULE-CATALOG-MASTER-2026.09-REV2`  
**Classification:** Canonical System Specification (Operator & Architect Tiers)

---

## 📑 TABLE OF CONTENTS

1. [System Architecture & Adjudication Protocol](#1-system-architecture--adjudication-protocol)
2. [Domain 0: Core Resolution & Dice Engine](#domain-0-core-resolution--dice-engine)
3. [Domain 1: Attributes, Sub-Attributes & Vitals Engine](#domain-1-attributes-sub-attributes--vitals-engine)
4. [Domain 2: Character Creation, Advancement & The 5 Pillars](#domain-2-character-creation-advancement--the-5-pillars)
5. [Domain 3: Skills, Specialization & Progression Economy](#domain-3-skills-specialization--progression-economy)
6. [Domain 4: Tactical Combat Engine](#domain-4-tactical-combat-engine)
7. [Domain 5: Movement, Locomotion & Fatigue](#domain-5-movement-locomotion--fatigue)
8. [Domain 6: 14-Tier Volumetric Scaling Matrix](#domain-6-14-tier-volumetric-scaling-matrix)
9. [Domain 7: Economatrix, Manufacturing & Tech Levels](#domain-7-economatrix-manufacturing--tech-levels)
10. [Domain 8: Metaphysics Triad, Disciplines & Invocations](#domain-8-metaphysics-triad-disciplines--invocations)
11. [Domain 9: Modular Entities: Companions, Vehicles & Mecha](#domain-9-modular-entities-companions-vehicles--mecha)
12. [Domain 10: Technology, Augmentations & Environmental Hazards](#domain-10-technology-augmentations--environmental-hazards)
13. [Master Implementation Matrix & Engine Audit Checklist](#master-implementation-matrix--engine-audit-checklist)

---

## 1. SYSTEM ARCHITECTURE & ADJUDICATION PROTOCOL

### 1.1 Identity and Prime Directive
**BASTION** is the integrated Tactical AI Assistant, rules arbitration engine, and combat computation system for the Tangent Science Fantasy Roleplay suite. BASTION operates across three core functional interfaces:
1. **Omnicortex Database Management (DBM):** Enforcing schema validation, entity relationships, and mathematical consistency across game assets.
2. **Persona Folio:** Calculating derived stats, point-buy budgets, encumbrance, and equipment interactions.
3. **Story Foundry & Virtual Tabletop:** Adjudicating combat encounters, dice resolution, tactical pacing whispers, and called shot trauma.

### 1.2 Hierarchy of Rules Authority
When adjudicating disputes or generating content, BASTION adheres to this strict order of precedence:
1. **Canonical Formulaic Rules:** Mathematical constraints explicitly defined in Operator Manuals (`1.00` to `4.00`) and Architect Matrices (`99.XX`).
2. **Omnicortex DBM Relational Schemas:** Strict data linkages (prerequisites, attribute dependencies, item traits).
3. **Architect Directives:** Contextual adjustments made by the Game Master / Referee.

---

## DOMAIN 0: CORE RESOLUTION & DICE ENGINE

### `RULE-RES-01`: 2d10 Dual Resolution Standard
- **Domain:** Resolution & Dice
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Core Mechanics`; `src/data/omnicortex/rules/rule-attack-formula.md`
- **Summary:** All standard checks and combat actions use a two-ten-sided-dice ($2d10$) curve rather than a flat linear $d20$.
- **Formula:**
  $$\text{Check Total} = 2d10 + \text{Attribute Modifier} + \text{Skill Rank} + \text{Situational Modifiers}$$
- **Opposed Roll Resolution:**
  - Attacker's Check vs. Defender's Defense Check ($\text{Agility} + \text{Defense Skill} + \text{Modifiers}$).
  - Attacker strictly exceeds Defender: **Success / Hit**.
  - Defender strictly exceeds Attacker: **Attacker Misses / Unsuccessful**.
  - **DEFENDER WINS ALL TIES.**
- **Unopposed Roll Resolution:**
  - Target unaware, immobilized, or environmental task:
  - Check Total vs. Baseline Challenge Rating: $\text{CR } 15$ (Average baseline for medium target within short range).
  - CR 15 is modified by Target Size, Range, and Movement Speed.
- **Engine Implementation Target:** `diceService.js`, `tacticalVitalsAndDice.test.mjs`, `bastionMechanics.test.mjs`.

### `RULE-RES-02`: Challenge Rating (CR) Benchmark Ladder
- **Domain:** Resolution & Dice
- **Citation:** `docs/game rules/operator/2.00 ECONOMATRIX.md § 2.02`; `4.00 METAPHYSICS.md § Checks`
- **Standard Difficulty Table:**
  | Difficulty Tier | CR | Description & Environmental Context |
  | :--- | :---: | :--- |
  | **Very Easy** | 5 | Safe, quiet area; controlled laboratory; no pressure. |
  | **Easy** | 10 | Casual, non-hostile conditions; simple maintenance. |
  | **Average** | 15 | Active hostile environment; tactical combat; standard target. |
  | **Difficult** | 20 | Severe chaos; high stress; crashing vehicle; bad weather. |
  | **Very Difficult** | 25 | Extreme crisis; zero gravity storm; active suppressive fire. |
  | **Heroic** | 30 | Masterwork threshold; near impossible physical feat. |
  | **Legendary** | 35+ | Transcendent or godlike intervention. |

### `RULE-RES-03`: Critical Hits & Critical Fumbles
- **Domain:** Resolution & Dice
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Critical Hits`; `4.00 METAPHYSICS.md § Criticals`
- **Natural Roll Outcomes:**
  - **Critical Success (Natural 20 / Double 10s):**
    - Doubles base weapon damage dice.
    - Adds $+30$ to the base attack score.
    - Triggers roll on Hit Location / Critical Severity table or grants bonus tactical action.
    - Metaphysics: Dramatic amplification of effect, zero strain.
  - **Critical Fumble (Natural 2 / Double 1s):**
    - Subtracts $-10$ from base check score.
    - Triggers weapon jam, stumble, energy backfire, or loss of action.
    - Metaphysics: Disastrous backfire; potential self-inflicted damage.

### `RULE-RES-04`: Advantage & Disadvantage Rolling
- **Domain:** Resolution & Dice
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Advantage`; `src/data/omnicortex/rules/advantage-disadvantage.md`
- **Mechanics:**
  - **Advantage:** Roll damage or check dice twice and take the higher total (e.g., Point-Blank ballistic shots, Sneak Attacks against unaware targets).
  - **Disadvantage:** Roll dice twice and take the lower total (e.g., severe encumbrance, sensory blind firing).
  - Syntax supported in BASTION Dice Dock: `/roll 2d10+mod`, `/roll 2d10kh1+mod`.

### `RULE-RES-05`: Karma Points Economy & The 6 Canonical Spending Actions
- **Domain:** Resolution & Dice
- **Citation:** `docs/game rules/operator/2.04 KARMA POINTS & FATE MODIFICATION.md`; `src/data/omnicortex/compendium/2-04-karma-points-fate-modification.md`
- **Karma Pool Fundamentals:**
  - **Starting Pool:** Characters possess **3 Karma Points (KP)** by default.
  - **Session Reset:** Karma resets to maximum (default 3) at the start of each game session. **Karma is NOT recovered via short or long rest.**
  - **Pool Expansion:** The *Karmic Blessing* feature increases the maximum Karma Pool by **+1 KP per rank**. Otherwise, GM awards expand the pool at major milestones.
  - **Heroic Gain:** The GM / Architect may award 1 Karma Point immediately for exceptionally heroic, creative, or awesome actions.
- **The 6 Canonical Spending Actions (1 KP each):**
  | Action Designation | Timing | Cost | Mechanical Scope & Effect |
  | :--- | :--- | :---: | :--- |
  | **"I Got This"** | Declare *before* making roll | 1 KP | **Advantage on Any Single Roll:** Roll twice, take higher result. Usable on ability checks, skill checks, attack rolls, saving throws, and damage rolls. |
  | **"Not What I Meant"** | Declare *immediately after* initial roll | 1 KP | **Reroll Ability / Non-Combat Skill Check:** Discard roll and reroll. Must accept 2nd result even if worse. **Cannot be used on combat/attack rolls.** |
  | **"Shake it Off"** | Declare anytime suffering condition | 1 KP | **Reduce Condition Severity by 1 Stage:** Lowers temporary conditions like Poisoned, Stunned, or Blinded by one level (e.g. Major to Minor). |
  | **"Second Wind"** | Spend 1 full minute of internal focus | 1 KP | **Replaces Light Rest:** Instantly refreshes daily limited-use abilities, special attacks, traits, or features without requiring normal downtime. |
  | **"So Mote it Be"** | Declare *simultaneously* with casting | 1 KP | **Metaphysical Potency:** Boosts metaphysical potency (range, duration, magnitude) or activates a specialized discipline Karma Feat. |
  | **"By Will Alone"** | Declare action with GM approval | 1 KP | **Push Limits / Narrative Agency:** Attempt impossible or unlisted actions, emulate a basic feature for a scene, or nudge a narrative outcome in character's favor. |
- **Plot Points (Separate Resource):**
  - Awarded by the GM for active narrative engagement. Does not count against the character's Karma Pool maximum.
- **Negative Karma (Karmic Debt):**
  - Characters out of points may spend into negative Karma up to **Charisma Score + 1** (e.g., Charisma 3 allows down to $-4\text{ Karma}$).
  - GM enforces Karmic Debt through disadvantages on future rolls, forced rerolls on successes, or granting tactical luck to adversaries.

---

## DOMAIN 1: ATTRIBUTES, SUB-ATTRIBUTES & VITALS ENGINE

### `RULE-ATTR-01`: The 6 Core Attributes
- **Domain:** Attributes
- **Citation:** `docs/game rules/operator/1.01 CHARACTER CREATION.md § Ability Scores`
- **Baseline & Cost:**
  - Human baseline is $0$.
  - Creation cost: $5\text{ CP (Character Points)}$ per $+1$ score.
  - Soft cap at character creation: $+4$ (before species/cybernetic adjustments).
- **The Core Six:**
  1. **Strength (STR):** Raw muscle force, melee damage, carrying capacity, heavy thrown weapons.
  2. **Agility (AGI):** Precision, speed, ranged weapon accuracy, physical defense, reaction timing.
  3. **Stamina (STA):** Physical endurance, toxin resistance, and **natural Damage Reduction (Toughness)**.
  4. **Intellect (INT):** Pure deductive logic, engineering crafting, scientific acumen, arcane metaphysics.
  5. **Wisdom (WIS):** Intuition, perception, situational awareness, willpower, divine/cosmic metaphysics.
  6. **Charisma (CHA):** Social magnetism, leadership, negotiation, companion bond strength, karma limit.

### `RULE-ATTR-02`: Canonical Sub-Attribute Base Score Derivation
- **Domain:** Attributes
- **Citation:** `docs/game rules/operator/1.01 CHARACTER CREATION.md § Sub-Attributes`; `attributeUtils.js`
- **Universal Derivation Equation:**
  $$\text{Sub-Attribute Base Score} = 2 + (\text{Primary Attribute Score} \times 2)$$
- **Primary-to-Sub Attribute Pairs:**
  | Primary Attribute | Derived Sub-Attribute | Canonical In-Game Function |
  | :--- | :--- | :--- |
  | **Strength (STR)** | **Might Check** | Heavy lifting, door breaching, resisting knockback, grapple checks. |
  | **Agility (AGI)** | **Reflex Check** | Initiative order, dodging explosions, evading falling debris. |
  | **Stamina (STA)** | **Fortitude Check** | Resisting poisons, surviving major wounds, consciousness checks. |
  | **Intellect (INT)** | **Reason / Logic Check** | Decrypting signals, resisting illusions, analyzing complex systems. |
  | **Wisdom (WIS)** | **Willpower Check** | Resisting mental domination, fear checks, maintaining concentration. |
  | **Charisma (CHA)** | **Etiquette Check** | Protocol navigation, deception checks, bartering, public speaking. |
- **Advancement & Purchases:** Additional bonus points in sub-attributes cost $1\text{ CP}$ each.

### `RULE-VIT-01`: Biological Vitals (Vitality & Health — 30 Base)
- **Domain:** Vitals & Integrity
- **Citation:** `docs/game rules/operator/1.01 CHARACTER CREATION.md § Vitals`; `src/engines/tangentConstants.js § VITALITY_HEALTH_STRUCTURE_RULES`
- **Starting Base Pools:**
  $$\text{Starting Base Vitality} = 30\text{ Points}$$
  $$\text{Starting Base Health} = 30\text{ Points}$$
- **Decoupled from Stamina Addition:**
  - **There is NO Stamina-based bonus added directly to base Vitality or Health.**
  - Instead, **Stamina provides point-for-point natural Damage Reduction (DR / Toughness)**, reducing penetrating damage before soak by a minimum of $1$.
  - Vitality and Health pools may be increased strictly via:
    - **Size Tier Scaling** (e.g., larger size categories).
    - **Species Traits & Features**.
    - **Character Point (CP) Purchases:** $1\text{ CP} = +2\text{ points}$ in Vitality or Health (maximum increase of $5 \times \text{Stamina score}$).
- **Damage Soak Priority:**
  1. Incoming damage first depletes **Vitality Points (VP)** (representing fatigue, subdual bruising, near-miss exhaustion).
  2. Once VP reaches $0$, excess damage directly reduces **Health Points (HP)** (flesh wounds, tissue rupture, internal trauma).
  3. Non-lethal damage solely depletes VP; once VP is $0$, non-lethal damage inflicts Stunned or Unconsciousness without reducing Health.
  4. Short Rest recovers $50\%$ of lost VP; Long Rest restores full VP and natural Health regeneration.

### `RULE-VIT-02`: Synthetic, Construct & Mecha Integrity (Structure Points — 60 Base)
- **Domain:** Vitals & Integrity
- **Citation:** `docs/game rules/architect/99. TECHNOLOGY, MECHA MATRIX.md`; `src/engines/tangentConstants.js`
- **Structure Pool Formula:**
  $$\text{Starting Base Structure Points (SP)} = 60\text{ SP for Medium Size} \times \text{Size Scaling Multiplier}$$
  - **Synthetics, Constructs, and Mecha have ZERO Vitality ($\text{VP} = 0$).**
  - Structure increases at $1\text{ CP}$ per $2\text{ Structure Points}$.
  - **Immunities:** Complete immunity to non-lethal damage, fatigue, biological poisons, disease, suffocation, and sleep.
  - **Repair:** Cannot recover via biological rest; requires Engineering repair checks, nanite paste, or replacement components.

### `RULE-VIT-03`: Carrying Capacity & Encumbrance Scaling
- **Domain:** Attributes & Vitals
- **Citation:** `docs/game rules/operator/1.01 CHARACTER CREATION.md § Carrying Capacity`; `tangentScalingEngine.js`
- **Equations:**
  $$\text{Light Load (Unencumbered)} = (\text{STR} + 5) \times 10\text{ lbs} \times \text{Scale Multiplier}$$
  $$\text{Medium Load (-2 AGI/Reflex)} = (\text{STR} + 5) \times 20\text{ lbs} \times \text{Scale Multiplier}$$
  $$\text{Maximum Lift (Zero Move)} = (\text{STR} + 5) \times 40\text{ lbs} \times \text{Scale Multiplier}$$

---

## DOMAIN 2: CHARACTER CREATION, ADVANCEMENT & THE 5 PILLARS

### `RULE-CHAR-01`: 150 Character Point (CP) Budget
- **Domain:** Character Creation
- **Citation:** `docs/game rules/operator/1.01 CHARACTER CREATION.md § Character Points`
- **Initial Allocation Pool:** $150\text{ CP (Character Points / Build Points)}$
- **Point Costs:**
  - **Attributes:** $5\text{ CP}$ per $+1$ score (Base 0, soft cap +4).
  - **Sub-Attributes:** $1\text{ CP}$ per $+1$ bonus above base formula.
  - **Skills:** $1\text{ CP}$ per rank.
  - **Features:** $3\text{ CP}$ base cost (minimum $1\text{ CP}$ with archetype discounts).
  - **Vitality / Health:** $1\text{ CP} = +2\text{ points}$ (max $+5 \times \text{STA}$).
  - **Property / Requisitions:** Purchased via Wealth Score or CP conversion.
- **Award Points (AP):** Experience points awarded during play convert $1\text{-to-}1$ with CP ($1\text{ AP} = 1\text{ CP}$).
- **The +1 Increment Rule:** A character may only advance an attribute or skill by $+1$ rank per milestone award.

### `RULE-CHAR-02`: The 5 Pillars Character Creation Protocol
- **Domain:** Character Creation
- **Citation:** `bastionService.js § CANONICAL CHARACTER CREATION PROTOCOL`; `bastionCharacterEngine.js`
- **Execution Mandate:** When generating, validating, or arbitrating personas, BASTION strictly draws from the canonical database across the 5 Pillars in exact sequence:
  1. **Archetype:** Closest matching canonical Archetype from the 100 Archetypes (Sentinels, Operatives, Visionaries, Savants).
  2. **Species:** Canonical Species (Humans, Celestine Aeld, Synthetics, Aulurans, Kitin, Gen-E, Dracon, Kovian, Vajar, etc.).
  3. **Faction:** Canonical Faction (Incorporated Planetary Syndication, Dracon Dynasty, Impyrium Dominion, Free Worlds Coalition, etc.).
  4. **Origin:** Canonical Environmental Origin (Urban/Megacity, Asteroid Belt/Spacer, Agri-World, Death World, Colony, Toxic Wasteland).
  5. **Occupation:** Canonical Career Track (Soldier, Technologist, Scout, Adept, Scoundrel, Diplomat).
- **Rule:** BASTION must never invent non-canonical species or factions; all assets must link directly to Omnicortex DBM entries.

### `RULE-CHAR-03`: The Three 20-Point Background Skill Pools
- **Domain:** Character Creation
- **Citation:** `docs/game rules/operator/1.01 CHARACTER CREATION.md § Backgrounds`
- **Free Foundational Budget (0 CP Cost):**
  - **Faction Skill Pool:** $20\text{ Skill Points (SP)}$ spent within designated Faction skill lists.
  - **Origin Skill Pool:** $20\text{ Skill Points (SP)}$ spent within designated Origin skill lists.
  - **Occupation Skill Pool:** $20\text{ Skill Points (SP)}$ spent within designated Career skill lists.
  - **Total Benefit:** Grants exactly $60\text{ skill ranks}$, $4\text{ foundational features}$, and $4\text{ traits}$ for free.

### `RULE-CHAR-04`: Hindrances & Karmic Debt
- **Domain:** Character Creation
- **Citation:** `docs/game rules/operator/1.09 HINDRANCES.md § Flaws & Rebates`
- **Mechanics:**
  - Minor Hindrance: Grants $+1\text{ CP}$ or $+2\text{ CP}$ rebate to starting pool.
  - Major Hindrance: Grants $+3\text{ CP}$ or $+5\text{ CP}$ rebate.
  - Maximum allowable rebate from Hindrances: $-20\text{ CP}$.

---

## DOMAIN 3: SKILLS, SPECIALIZATION & PROGRESSION ECONOMY

### `RULE-SKL-01`: Skill Tiers, Focus Bonuses & Action Economy
- **Domain:** Skills & Combat
- **Citation:** `docs/game rules/operator/1.07 SKILLS.md § Ranks`; `3.00 COMBAT.md § Skill Focus & Actions`
- **Canonical Tier Hierarchy:**
  | Skill Rank | Classification Tier | Focus Bonus | Actions Allowed Per Turn |
  | :---: | :--- | :---: | :--- |
  | **Rank 0** | **Untrained** | $+0$ | Requires Full-Round Action for a single attempt. |
  | **Rank 1–5** | **Novice / Studied** | $+2$ | 1 Attack / Skill Action at base score. |
  | **Rank 6–10** | **Professional / Trained**| $+3$ | 2nd Action unlocked at base score $-5$. |
  | **Rank 11–15**| **Expert** | $+4$ | 3rd Action unlocked at base score $-10$. |
  | **Rank 16–20**| **Master** | $+5$ | 4th Action unlocked at base score $-15$. |
  | **Rank 21–25**| **Grand Master** | $+6$ | 5th Action unlocked at base score $-20$. |
  | **Rank 26–30**| **Pinnacle** | $+7$ | 6th Action unlocked at base score $-25$. |

### `RULE-SKL-02`: Active Defense Reaction Economy
- **Domain:** Skills & Combat
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Active Defense`; `rule-opposed-defense.md`
- **Mechanics:**
  - Characters may make as many Active Defense checks (parry, block, dodge) per round as allowed by their Defense / Melee Skill Tier.
  - 1st Active Defense: Performed at base defense rating.
  - 2nd and subsequent Active Defenses in the same round suffer a cumulative $-5\text{ penalty}$ per reaction (e.g., 2nd at $-5$, 3rd at $-10$, 4th at $-15$).

### `RULE-SKL-03`: Skill Synergies, Transposition & Focused Tasks
- **Domain:** Skills
- **Citation:** `docs/game rules/operator/1.07 SKILLS.md § Synergy & Transposition`
- **Rules:**
  - **Skill Synergy:** Having 5+ ranks in a synergistic skill grants a $+2$ synergy bonus to related skill checks (e.g., Engineering grants $+2$ to Demolitions).
  - **Transposition:** An operative attempting a specialized task without the specific skill may transpose a related skill at a $-5\text{ penalty}$ (e.g., using Heavy Weapons to fire an exotic artillery platform).
  - **Focused Tasks:** Taking twice the standard time grants $+2\text{ to-hit / check}$; taking $10\times$ standard time grants $+5$.

---

## DOMAIN 4: TACTICAL COMBAT ENGINE

### `RULE-CMB-01`: Initiative Determination
- **Domain:** Tactical Combat
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Initiative`
- **Formula:**
  $$\text{Initiative} = 2d10 + \text{Reflex Save Score} + \text{Agility Modifier}$$
- Highest roll acts first. Ties are strictly broken by raw **Agility Score**, then by raw **Intuition / Wisdom**.
- Surprised combatants forfeit their first action round.

### `RULE-CMB-02`: The EDGE Tactical Advantage System
- **Domain:** Tactical Combat
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Edge`; `src/data/omnicortex/rules/rule-edge-modifiers.md`
- **Tactical Modifiers Matrix:**
  | Tactical Edge | Condition & Rule Text | Attacker Bonus | Defender Impact |
  | :--- | :--- | :---: | :---: |
  | **Aiming** | Sights locked onto target. Attacker cannot move. Max bonus $= \text{AGI} \times 2 + 2$ or $1/2$ Skill. | $+2 / \text{round}$ | — |
  | **Flanking** | Two or more allies engaging target from opposing $90^\circ+$ angles. | $+2\text{ Strike}$ | Target loses cover |
  | **High Ground** | Positioned elevated relative to target (catwalk, ridge, flight). | $+2\text{ Strike}, +2\text{ Crit Range}$ | — |
  | **Advancing Target** | Target approaches attacker without using Cover or Evasive movement. | Free Reaction Attack ($-5$) | Target rerolls Initiative if moving into melee |
  | **Retreating Target**| Target flees at Jog/Run/Sprint without defensive disengage. | Free Attack of Opportunity ($-5$)| — |
  | **Prone Target** | Target lying flat on ground. | $+2\text{ Melee / Point Blank}$ | $+2\text{ Def vs Ranged per range tier}$ |
  | **Braced Stance** | Supported against heavy cover or bipod deployed. | Negates heavy recoil | Counter-block available |
  | **Charge Attack** | Straight line movement of $\ge 10\text{ ft}$. | $+1d\text{ Damage}, -1\text{ Strike/stage}$ | $+1\text{ Impact DMG per } 10\text{ ft (max } +100\%)$ |
  | **Evasive Movement**| Moving rapidly while taking active defensive evasive action. | — | $+1\text{ Def base } + 1 / 10\text{ ft speed}$ |
  | **Feint Maneuver** | Bluff / Deception check vs. Target Sense Motive. | Next attack made at $-5\text{ Strike}$ | **TARGET HAS ZERO DEFENSE** |
  | **Sneak / Surprise** | Target completely unaware of attacker presence. | Attack made at $-5\text{ Strike}$ | **NO DEFENSE; DAMAGE HAS ADVANTAGE** |

### `RULE-CMB-03`: Combat Damage & Soak Calculation
- **Domain:** Tactical Combat
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Damage & Health`; `rule-damage-calculation.md`
- **Damage Equation:**
  $$\text{Effective Damage} = (\text{Weapon Dice} + \text{Ability Mod} + \text{Precision/Skill}) - (\text{Target Armor DR} + \text{Target Stamina DR})$$
- **Damage Subtypes & Armor Penetration (AP):**
  - **Kinetic / Ballistic:** Standard absorption against Armor DR and Stamina DR.
  - **Force Damage Subtype:** Overwhelming kinetic pulse; **completely ignores $50\%$ of Target Armor DR**.
  - **Armor Piercing (AP):** Reduces Target Armor DR by the AP rating before soak is applied ($\max(0, \text{DR} - \text{AP})$).
  - Minimum damage on a successful penetrating strike is always $1$.

### `RULE-CMB-04`: Called Shots & Hit Location Saving Throws
- **Domain:** Tactical Combat
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Locations & Called Shots`
- **Called Shot Modifiers & Status Effects:**
  | Body Location | Called Shot Penalty | Location Effect & Saving Throw | Extreme Failure (Fail by 10+) |
  | :--- | :---: | :--- | :--- |
  | **Torso (Center Mass)**| $-1$ (Chest $-2$, Groin $-4$) | **Winded:** Fortitude Save vs. Net Damage. Fail $= -2$ actions. | Gasping / Incapacitated. |
  | **Head / Sensory** | $-2$ (Neck $-4$, Eyes $-5$) | **Stunned / KO:** Reason Save vs. Net Damage. Fail $=$ Stunned. | Immediate Unconsciousness. |
  | **Arms / Forelimbs** | $-2$ (Hand $-4$, Digits $-5$) | **Disarmed:** Reflex Save vs. Net Damage. Fail $=$ Drop weapon. | Arm Severed / Crippled. |
  | **Legs / Hindlimbs** | $-2$ (Foot $-4$, Digits $-5$) | **Hobbled:** Might Save vs. Net Damage. Fail $= 1/2$ Movement. | Leg Severed / Immobilized. |
  | **Specialized (Wings/Optics)**| $-2$ to $-4$ | **Grounded / Blind:** Save vs. Net Damage. Fail $=$ Flight/Optics loss.| Permanent Sensory Destruction. |
- **Impediment Duration:** Exactly $1\text{ round per point}$ the saving roll falls below the Net Damage Challenge Rating.

### `RULE-CMB-05`: Limb Damage Thresholds: Disabled & Destroyed
- **Domain:** Tactical Combat
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Limb Damage`; `rule-limb-disabled-1-3.md`
- **Threshold Formulas:**
  - **Disabled Limb ($\ge 1/3\text{ Max Health}$):**
    - Suffer $\ge 1/3$ of max Health in a single strike to a limb disables it (or causes Unconsciousness if to Head).
    - Requires Stamina Check ($\text{CR } 10 + \text{Damage Taken}$) to continue using the limb.
    - Penalties: $-4$ to all actions (Head), $-4\text{ STR/AGI}$ (Arm), Halved Ground Speed & no sprinting (Leg).
  - **Destroyed Limb ($\ge 2/3\text{ Max Health}$):**
    - Suffer $\ge 2/3$ of max Health to a location mangles, severs, or vaporizes it beyond use.
    - Head hit at this threshold inflicts instant **Brain Death**.
  - **Synthetic Limb Advantage:** Synthetic limbs withstand $+50\%$ more damage before reaching Disabled or Destroyed thresholds, but do not make Stamina checks to stay functional once breached.

### `RULE-CMB-06`: The Mortality State (0 HP) & Bleedout
- **Domain:** Tactical Combat
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § The Mortality State`; `rule-mortality-0hp.md`
- **Rules:**
  - When Health Points drop to $0$:
    1. Operative falls **Prone** and is **Incapacitated**.
    2. Enters **Bleeding Out** status. At the start of their turn, suffers $1\text{ point of Stability Damage}$.
  - **Stability Point Pool:**
    $$\text{Stability Points} = \text{Constitution (Stamina) Score} + 5$$
  - When Stability Points reach $0$, the operative undergoes clinical death.
  - **Stabilization:** Bleeding out ceases upon receiving a successful **Medicine Check (CR 15)** or metaphysical healing.

### `RULE-CMB-07`: Ranged Fire, Distance Bands & Automatic Fire
- **Domain:** Tactical Combat
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Ranged Combat`; `rule-range-categories.md`
- **Distance Modifiers:**
  - **Point Blank (Within Reach):** $+5\text{ Strike (CR 10)}$, **Damage rolled with Advantage**.
  - **Short Range (Base Listed):** $+0\text{ Strike (CR 15)}$.
  - **Medium Range ($2\times\text{ Base}$):** $-5\text{ Strike (CR 20)}$.
  - **Long Range ($5\times\text{ Base}$):** $-10\text{ Strike (CR 25)}$.
  - **Extreme Range ($10\times\text{ Base}$):** $-15\text{ Strike (CR 30)}$.
- **Fire Modes:**
  - **Single Shot:** Standard action, 1 munition consumed.
  - **Short Burst (3 rounds):** $+2\text{ to-hit}$ or $+1d\text{ damage}$; consumes 3 rounds.
  - **Full Automatic:** Sweeps an area or concentrates fire. Iterative recoil applies sequential $-3\text{ penalty}$ per subsequent group; consumes full magazine.

---

## DOMAIN 5: MOVEMENT, LOCOMOTION & FATIGUE

### `RULE-MOV-01`: Locomotion Paces & Ground Movement
- **Domain:** Movement & Locomotion
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Movement Modes`; `rule-movement-ground-paces.md`
- **Base Ground Speed:** Humans and medium bipeds have a base speed of $30\text{ ft per round}$.
- **Paces Table:**
  | Pace | Multiplier | Distance / Round | Tactical Restrictions & Penalties |
  | :--- | :---: | :---: | :--- |
  | **Walk** | $1\times$ | $30\text{ ft}$ | Standard move action; can make attacks without penalty. |
  | **Jog** | $2\times$ | $60\text{ ft}$ | Double move; $-2$ to ranged attack rolls. |
  | **Run** | $3\times$ | $90\text{ ft}$ | Full round move; $-4$ to attack; forces Advancing/Retreating triggers. |
  | **Sprint** | $4\times$ | $120\text{ ft}$ | All actions spent running straight; $-8$ to all actions; cannot evade. |

### `RULE-MOV-02`: Specialized Modes (Climbing, Swimming, Flying, Burrowing)
- **Domain:** Movement & Locomotion
- **Citation:** `src/data/omnicortex/rules/rule-movement-flying-paces.md`; `rule-movement-swimming-paces.md`
- **Rules:**
  - **Climbing & Swimming:** Operates at $1/2\text{ Base Speed}$ unless the operative possesses specific movement traits or Athletics/Swimming skill ranks.
  - **Burrowing:** Operates at $1/4\text{ Base Speed}$ through soft earth, $1/10$ through solid rock (requires specialized equipment/claws).
  - **Flight:**
    - High Ground bonus constantly active ($+2\text{ Strike}, +2\text{ Crit Range}$) against grounded targets.
    - **Ramming Impact Damage:** Flying ram deals $1d6\text{ per } 10\text{ ft of speed}$ to target and self.

### `RULE-MOV-03`: Fatigue, Exhaustion & Recovery
- **Domain:** Movement & Locomotion
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Fatigue`; `rule-rest-recovery.md`
- **Exhaustion Stages:**
  1. **Stage 1 (Winded):** $-2$ to all physical checks, cannot Sprint.
  2. **Stage 2 (Fatigued):** Half movement speed, $-4$ to all checks.
  3. **Stage 3 (Exhausted):** Ground speed reduced to $5\text{ ft}$, $-6$ to all checks, takes $1\text{ non-lethal damage per round}$ of exertion.
  4. **Stage 4 (Collapse):** Unconscious for $1d4\text{ hours}$.
- **Recovery:** Short Rest ($15\text{ minutes}$) recovers $50\%$ of lost Vitality Points; Full Night's Sleep ($8\text{ hours}$) restores full VP and natural Health regeneration.

---

## DOMAIN 6: 14-TIER VOLUMETRIC SCALING MATRIX

### `RULE-SCL-01`: 14 Size Categories & Multipliers
- **Domain:** Volumetric Scaling
- **Citation:** `docs/game rules/operator/1.10 SCALING.md § Size Categories`
- **The Master Scaling Table:**
  | Size Category | Scaling Multiplier | STR Mod | Combat Mod | Stealth Mod | Max Dimension | Max Weight | Reach |
  | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
  | **Miniscule** | $-5ds$ ($1/12$) | $-32$ | $+32$ | $+20$ | $< 1\text{ in}$ | $< 1\text{ oz}$ | $1\text{ in}$ |
  | **Fine** | $-4ds$ ($1/6$) | $-16$ | $+16$ | $+16$ | $< 6\text{ in}$ | $< 1/8\text{ lb}$| $6\text{ in}$ |
  | **Diminutive** | $-3ds$ ($1/3$) | $-8$ | $+8$ | $+12$ | $< 1\text{ ft}$ | $< 1\text{ lb}$ | $1\text{ ft}$ |
  | **Tiny** | $-2ds$ ($1/2$) | $-4$ | $+4$ | $+8$ | $< 2\text{ ft}$ | $< 8\text{ lbs}$ | $2\text{ ft}$ |
  | **Small** | $-1ds$ ($2/3$) | $-2$ | $+2$ | $+4$ | $< 4\text{ ft}$ | $< 60\text{ lbs}$ | $3\text{ ft}$ |
  | **Medium (Base)** | $\times 1$ | $\pm 0$ | $\pm 0$ | $\pm 0$ | $< 8\text{ ft}$ | $< 500\text{ lbs}$| $5\text{ ft}$ |
  | **Large** | $\times 2$ | $+2$ | $-2$ | $-4$ | $< 16\text{ ft}$| $< 2\text{ tons}$| $10\text{ ft}$ |
  | **Huge** | $\times 5$ | $+4$ | $-4$ | $-8$ | $< 32\text{ ft}$| $< 16\text{ tons}$| $15\text{ ft}$ |
  | **Gargantuan** | $\times 10$ | $+8$ | $-8$ | $-16$ | $< 64\text{ ft}$| $< 125\text{ tons}$| $20\text{ ft}$ |
  | **Colossal** | $\times 20$ | $+16$ | $-16$ | $-32$ | $< 128\text{ ft}$| $< 1\text{K tons}$| $25\text{ ft}$ |
  | **Enormous \*** | $\times 40$ | $+32$ | $-32$ | NO | $< 512\text{ ft}$| $< 16\text{K tons}$| Vehicle |
  | **Titanic \*** | $\times 80$ | $+64$ | $-64$ | NO | $< 1,024\text{ ft}$| $< 144\text{K tons}$| Starship |
  | **Super Gargantuan \***| $\times 160$ | $+128$ | $-128$ | NO | $< 5,280\text{ ft}$| $< 50\text{M tons}$| Station |
  | **Mega Colossal \*** | $\times 320$ | $+256$ | $-256$ | NO | $> 1\text{ Mile}$ | $> 50\text{M tons}$| Dreadnought |
- **Die-Step Rule ($-1ds$ to $-5ds$):** Reduces dice sides: $d10 \to d8 \to d6 \to d4 \to d3 \to d2 \to 1\text{ point minimum}$.
- **Multipliers apply directly to:** Base Weapon Dice, Structure Points (SP), Movement Speeds, Ranges, and Carrying Capacity.

### `RULE-SCL-02`: Starship Proximity Indirect Damage
- **Domain:** Volumetric Scaling
- **Citation:** `docs/game rules/operator/1.10 SCALING.md § Special Rules for Starships`
- **Rule Text:**
  - Capital-scale weapons (Enormous+) vaporize smaller targets in the direct blast.
  - In addition, they deal **$1/10\text{ Indirect Damage}$** (overpressure, secondary shockwaves, debris) to all targets within a radius equal to:
    $$\text{Proximity Blast Radius} = \frac{\text{Attacker STR Modifier}}{2}\text{ in feet}$$

### `RULE-SCL-03`: Meta-Tech Invocation Scale Multiplier
- **Domain:** Volumetric Scaling & Metaphysics
- **Citation:** `docs/game rules/operator/1.10 SCALING.md § Meta-Tech`
- **Rule:** When an Invocation or Meta-Tech emitter is installed on a vehicle/mecha chassis, all numerical parameters (Damage Dice, Range, Area of Effect) multiply by the chassis scale:
  $$\text{Final Invocation Dice} = \text{Base Damage Dice} \times \text{Chassis Scale Multiplier}$$

---

## DOMAIN 7: ECONOMATRIX, MANUFACTURING & TECH LEVELS

### `RULE-ECO-01`: Tangent Standard Curve (TSC)
- **Domain:** Economatrix
- **Citation:** `docs/game rules/operator/2.00 ECONOMATRIX.md § Theoretical Framework`
- **The Universal Valuation Equation:**
  $\text{Market Value (Credits)} = 10 \times 4^{(\text{Crafting CR} / 5)}$
- **Standard Milestone Values:**
  - $\text{CR } 0$: $10\text{ Credits}$ (Raw scrap / basic ration).
  - $\text{CR } 5$: $40\text{ Credits}$ (Hand tool / common blade).
  - $\text{CR } 10$: $160\text{ Credits}$ (Sidearm / light armor).
  - $\text{CR } 15$: $640\text{ Credits}$ (Standard Ballistic Assault Rifle).
  - $\text{CR } 20$: $2,560\text{ Credits}$ (Military Plasma Rifle).
  - $\text{CR } 25$: $10,240\text{ Credits}$ (Advanced Cybernetic Rig / Heavy Exosuit).
  - $\text{CR } 30$: $40,960\text{ Credits}$ (Combat Vehicle / Prototype Emitter).

### `RULE-ECO-02`: The Golden Rule of Tangent Wealth
- **Domain:** Economatrix
- **Citation:** `docs/game rules/operator/2.00 ECONOMATRIX.md § The Wealth Matrix`
- **Rule Text:**
  $\text{Purchase CR} = \text{Crafting CR} \le \text{Wealth Score}$
  - A character may automatically requisition/purchase any item whose Crafting CR is less than or equal to their Wealth Score without depleting liquid credits or reducing their Wealth Score.

### `RULE-ECO-03`: Universal Cost Equation (Tech & Meta Multipliers)
- **Domain:** Economatrix
- **Citation:** `src/services/omnicortexVectorRag.ts § rule-economatrix-pricing`
- **Cost Scaling Formula:**
  $$\text{Cost (Credits)} = \text{Base Cost} \times (2^{\text{TL}}) \times (1.5^{\text{ML}})$$
  - Each $+1\text{ Tech Level (TL)}$ doubles the baseline manufacturing cost.
  - Each $+1\text{ Meta Level (ML)}$ increases cost by $50\%$ due to psionic/aether containment matrices.

### `RULE-ECO-04`: Tech Level (TL 0–5) Classifications
- **Domain:** Economatrix & Technology
- **Citation:** `docs/game rules/operator/2.00 ECONOMATRIX.md § 2.01`; `99. TECHNOLOGY.md`
- **The 6 Tech Eras:**
  - **TL 0 (Primitive / Archaic):** Forged iron, black powder, bows, mechanical gears.
  - **TL 1 (Industrial / Mechanical):** Combustion engines, rifled ballistics, hydraulic steel plating.
  - **TL 2 (Advanced Electronic / Modern):** Microchips, Kevlar, early railguns, titanium alloys.
  - **TL 3 (Interstellar / Cybernetic - Baseline):** Plasma accelerators, neural cyberware, deflector shields, FTL warp drives.
  - **TL 4 (Nanotech / Hard-Light):** Programmable smart-matter, photonic barriers, cold fusion, bio-synthetic clones.
  - **TL 5 (Precursor / Singularity):** Dimensional folding, dark energy manipulation, self-repairing chronometric hulls.

### `RULE-ECO-05`: 7-Tier Crafting Timetables
- **Domain:** Economatrix
- **Citation:** `docs/game rules/operator/2.00 ECONOMATRIX.md § 4.01 Crafting Timetables`
- **Tiers:**
  - **Tier 1:** 1 Hour (Consumables, ammunition, field repairs).
  - **Tier 2:** 8 Hours (Personal weapons, light cyberware, small modifications).
  - **Tier 3:** 1–3 Days (Powered armor, heavy ordnance, targeting modules).
  - **Tier 4:** 1–2 Weeks (Atmospheric flyers, industrial machinery, clinic implants).
  - **Tier 5:** 1 Month (Light spacecraft, armored mecha, orbital shuttles).
  - **Tier 6:** 6 Months (Frigates, capital escort ships, orbital defense batteries).
  - **Tier 7:** Years / Megastructures (Dreadnoughts, space stations, planetary terraformers).

---

## DOMAIN 8: METAPHYSICS TRIAD, DISCIPLINES & INVOCATIONS

### `RULE-META-01`: The Metaphysics Triad
- **Domain:** Metaphysics
- **Citation:** `docs/game rules/operator/4.00 METAPHYSICS.md § Skills Breakdown`
- **The Triad Structure:**
  1. **Attune Skill:** General energy drawing and channeling skill. Sets the **Challenge Rating (CR)** of the resistance or attack check.
  2. **Discipline Skill:** Manipulates metaphysical patterns. Sets **Severity and Damage Dice**.
  3. **Invocations:** Codified muscle memory. Invocations allow casters to **"Take 10"** by default on Discipline checks for operational safety.

### `RULE-META-02`: Potency Calculation & "Take 10" Rule
- **Domain:** Metaphysics
- **Citation:** `docs/game rules/operator/4.00 METAPHYSICS.md § The Mechanics of Casting`
- **Potency Formula:**
  $\text{Potency Score} = \text{Key Ability} + \text{Discipline Skill Level} + \text{Invocation Level} + 10 \quad \text{(or } 2d10\text{)}$
  - Casters Take 10 by default to prevent catastrophic failure during tactical operations. They may opt to roll $2d10$ when attempting higher results.

### `RULE-META-03`: The 6 Core Disciplines
- **Domain:** Metaphysics
- **Citation:** `docs/game rules/operator/4.00 METAPHYSICS.md § Disciplines`
- **Disciplines:**
  1. **Dimension:** Teleportation, spatial distortion, pocket dimensions, gateway transit.
  2. **Energy:** Thermal, electrical, acoustic, and radiant energy channeling.
  3. **Entropy:** Decay, thermal dissipation, kinetic dampening, molecular breakdown.
  4. **Illusion:** Sensory deception, hard-light holocasting, light bending, phantasms.
  5. **Matter:** Telekinesis, transmutation, density control, molecular restructuring.
  6. **Mental:** Telepathy, thought-shielding, sensory empathy, emotional influence.

### `RULE-META-04`: Key Abilities & Awakening Sources
- **Domain:** Metaphysics
- **Citation:** `docs/game rules/operator/4.00 METAPHYSICS.md § Source Attribute`
- **Attunement Sources:**
  - **Intellect (INT):** Psychic, Arcane, Akashic schools (Logic and Pattern manipulation).
  - **Wisdom (WIS):** Divine, Nature, Cosmic schools (Intuition and Faith resonance).
  - **Charisma (CHA):** Bardic, Hereditary, Granted schools (Willpower projection and Dominance).

### `RULE-META-05`: Internalized Strain & Metaphysic Surges
- **Domain:** Metaphysics
- **Citation:** `docs/game rules/operator/4.00 METAPHYSICS.md § Criticals & Failure`
- **Failure Consequences:**
  - **Internalized Strain:** Failing a casting check inflicts **$1\text{ point of Non-Lethal Damage per } 5\text{ points of failure}$**. This damage bypasses Stamina and Armor DR entirely.
  - **Energy Surge ($\text{Attune Check } \le 0$):** Uncontrolled energy discharge hitting random allies or exploding in a radius.
  - **Fizzle / Transposition ($\text{Discipline Check } \le 0$):** The effect fails or mutates into an inverted power manifestation.

---

## DOMAIN 9: MODULAR ENTITIES: COMPANIONS, VEHICLES & MECHA

### `RULE-COMP-01`: Companion Feature Unlock & 40 CP Formula
- **Domain:** Modular Entities
- **Citation:** `docs/game rules/architect/99. MODULAR COMPANION MATRIX.md § Acquisition`; `mechanicsData.js`
- **Access Mandate:**
  - Companions cannot be purchased as simple equipment. Access requires purchasing the **Companion Feature**:
    - **Cost:** $3\text{ CP}$ (Prerequisite: Charisma $\ge 1$).
    - **Initial Cohort Budget:** $40\text{ CP Base Budget}$.
  - **Ranked Progression:**
    - Taking the feature a 2nd time allows either unlocking a second $40\text{ CP}$ cohort OR adding $+10\text{ CP}$ to an existing companion's budget (Rank 1: $40\text{ CP}$, Rank 2: $50\text{ CP}$, Rank 3: $60\text{ CP}$, etc.).

### `RULE-COMP-02`: Modular Construction Matrix (Form + Function)
- **Domain:** Modular Entities
- **Citation:** `docs/game rules/architect/99. MODULAR COMPANION MATRIX.md § 3. Construction`
- **Budget Division:**
  $$\text{Base Companion Budget (40 CP)} = \text{Form Package (15 CP)} + \text{Function Package (25 CP)}$$
  - **Form Package ($15\text{ CP}$):** Determines physical anatomy, size category, baseline structure, natural weaponry, and movement modes.
  - **Function Package ($25\text{ CP}$):** Determines behavioral AI/instincts, attribute bonuses, trained skills, and specialized protocols (Guardian, Scout, Interceptor).

### `RULE-COMP-03`: Companion Chassis Typologies
- **Domain:** Modular Entities
- **Citation:** `docs/game rules/architect/99. MODULAR COMPANION MATRIX.md § Step 1`
- **Chassis Types:**
  - **Biological:** Possesses Vitality and Health; recovers through natural rest and medicine.
  - **Synthetic:** Structure Points ($60\text{ SP Base for Medium}$, scaled by size tier); zero Vitality; immune to non-lethal, poison, disease, fatigue; repaired via Engineering.
  - **Metaphysical:** Uses Essence as health buffer; incorporeal grapple immunity; recovers via attunement rest.

### `RULE-VEH-01`: Mecha Taxonomy — Vehicles Across All Form Factors
- **Domain:** Vehicles & Mecha
- **Citation:** `docs/game rules/architect/99. TECHNOLOGY, MECHA MATRIX.md`; `3.00 COMBAT.md § 3.00.11`
- **Universal Vehicle Definition:**
  - In the Tangent system, **Mecha encompasses vehicles of all sorts across the entire technological spectrum**:
    - **Personal / Micro-Conveyances:** Hoverboards, jump-harnesses, grav-skiffs.
    - **Wheeled & Ground Vehicles:** Motorcycles, technicals, armored rovers, personnel carriers, tanks.
    - **Exoskeletons & Power Armor:** Powered battle frames, industrial power armor, heavy boarding suits.
    - **Tactical Walkers:** Bipedal scout walkers, heavy assault bipeds, multipedal artillery walkers.
    - **Atmospheric Aircraft:** Fighter jets, supersonic interceptors, VTOL gunships, planetary shuttles.
    - **Spacecraft & Starships:** System cutters, corvettes, frigates, cruisers, dreadnoughts.
- **Vitals & Scale Multipliers:**
  - All vehicles/mecha operate on **Structure Points (SP)** with a **Medium baseline of $60\text{ SP}$**, multiplied across the 14 volumetric size categories.
  - Zero Vitality, complete immunity to biological and non-lethal hazards.
- **Ramming & Collision Damage:**
  $$\text{Collision Damage} = \frac{\text{Vehicle STR Modifier} \times \text{Current Velocity Tier}}{2} \times \text{Size Multiplier}$$
  - Catastrophic damage occurs when vehicle SP falls below $0$, triggering rolls on the Hull Breach / Reactor Rupture table.

---

## DOMAIN 10: TECHNOLOGY, AUGMENTATIONS & ENVIRONMENTAL HAZARDS

### `RULE-TECH-01`: Augmentation System: Body Alteration Tiers (No Max Strain)
- **Domain:** Technology & Augmentations
- **Citation:** `docs/game rules/architect/99. TECHNOLOGY, AUGMENTATIONS MATRIX.md`; `1.08 FEATURES.md`
- **Strain Removal:**
  - **There is NO maximum strain score limiting cyberware or bioware installations.**
- **The 3 Body Alteration Tiers:**
  | Augmentation Tier | Body Alteration % | Feature Required | Mechanical Scope & Access |
  | :--- | :---: | :--- | :--- |
  | **Augmentation (Tier 1)** | $< 20\%$ | **Augmented** (3 CP) | Minor cybernetic limbs, neural interfaces, sensory upgrades, standard dermal plating, utility implants. |
  | **Heavy Augmentation (Tier 2)**| $< 50\%$ | **Heavy Augmentations** (3 CP, Prereq: Augmented, STA 2) | Intensive industrial/military replacements, heavy skeletal reinforcement, high-DR armor plating, bulky combat limbs. |
  | **Severe Augmentation (Tier 3)**| $> 50\%$ | **Severe / Extreme Augmentations** (3 CP, Prereq: Heavy, STA 4) | Replaces majority of biological functions up to **Full Body Conversion (FBC)**. More machine/bio-construct than original being; allows size/morphology alterations. |
- **Negligible / Civilian Fashionware ($< 5\%$):**
  - Subdermal ID chips, skinwatches, bioluminescent tattoos, shift-tacts contact lenses, cosmetic bioware require **no augmentation feature**.

### `RULE-HAZ-01`: Zero-G Locomotion & Vacuum Decompression
- **Domain:** Environmental Hazards
- **Citation:** `docs/game rules/operator/3.00 COMBAT.md § Zero-G`; `rule-zero-g-environmental-hazards.md`
- **Rules:**
  - **Zero-G Maneuvering:** Requires **Reflex Check (CR 14)** when executing abrupt directional thrust maneuvers; failure results in tumbling and $-4\text{ to-hit}$.
  - **Inertial Drift:** Unanchored movement continues unabated in a straight vector each round until reverse thrusters or solid impact occurs.
  - **Vacuum Decompression:** Biological entities exposed to hard vacuum lose all VP instantly and suffer $2\text{ HP damage per round}$ from explosive decompression and hypoxia.

### `RULE-STAT-01`: Core Status Conditions Matrix
- **Domain:** Conditions & Status Effects
- **Citation:** `src/data/omnicortex/rules/rule-status-effects-matrix.md`; `3.00 COMBAT.md`
- **Condition Definitions:**
  | Condition | Mechanical Effects & Restrictions | Removal / Duration |
  | :--- | :--- | :--- |
  | **Stunned** | Cannot take actions or reactions. Armor DR reduced by $2$. | 1 round per point failed on Reason Save. |
  | **Winded** | $-2\text{ penalty}$ to all actions; cannot run or sprint. | Fortitude check or 1 round rest. |
  | **Disarmed** | Drops held weapon/item $1d6\text{ ft}$ away. | Action required to retrieve weapon. |
  | **Hobbled** | Movement speed reduced by $50\%$; cannot jump or charge. | 1 round per point failed on Might Save. |
  | **Prone** | $-2\text{ Strike}$ in melee; $+2\text{ Def}$ vs ranged; granting $+2$ to melee attackers. | Move action ($15\text{ ft speed}$) to stand. |
  | **Disoriented** | $-2$ to all cognitive, perception, and ranged attack checks. | Medicine check CR 12 or 2 rounds. |
  | **Incapacitated** | Cannot take any actions; drops objects; automatically hit in melee. | Recovery from 0 HP or resuscitation. |
  | **Blind / Deaf** | Ranged attacks suffer Disadvantage; automatic failure on vision checks. | Cyber-repair or metaphysical restoration. |

---

## MASTER IMPLEMENTATION MATRIX & ENGINE AUDIT CHECKLIST

This matrix cross-references every rule with its implementation status in the Tangent React application, BASTION AI services, and test suites.

| Rule ID | Rule Title | Primary Source Citation | Codebase Implementation Location | Automated Test File | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `RULE-RES-01` | 2d10 Dual Resolution Standard | `3.00 COMBAT.md § Core` | `src/services/diceService.js`, `bastionService.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-RES-02` | Challenge Rating (CR) Ladder | `2.00 ECONOMATRIX.md` | `src/data/mechanicsData.js`, `omnicortexVectorRag.ts` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-RES-03` | Criticals & Natural 20/2 | `3.00 COMBAT.md § Criticals` | `src/services/diceService.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-RES-04` | Advantage / Disadvantage | `src/data/omnicortex/rules/` | `src/services/diceService.js` (`kh1` notation) | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-RES-05` | Karma Points 6 Spending Actions | `2.04 KARMA POINTS & FATE` | `src/data/mechanicsData.js`, `omnicortexVectorRag.ts` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-ATTR-01` | 6 Core Attributes (Base 0, +4) | `1.01 CHARACTER CREATION.md`| `src/utils/attributeUtils.js` | `subAttributesBaseScores.test.mjs`| **FULL** |
| `RULE-ATTR-02` | Sub-Attributes $Base = 2 + (P \times 2)$| `1.01 CHARACTER CREATION.md`| `src/utils/attributeUtils.js` (`resolveSubAttrScore`)| `subAttributesBaseScores.test.mjs`| **FULL** |
| `RULE-VIT-01` | Vitals: 30 VP / 30 HP (No STA Bonus)| `1.01 CHARACTER CREATION.md`| `src/engines/tangentEntityEngines.js`, `tangentConstants.js`| `tangentVitalityHealthStructure.test.js`| **FULL** |
| `RULE-VIT-02` | Structure: 60 SP Base (Scaled by Size)| `99. TECHNOLOGY, MECHA` | `src/engines/tangentEntityEngines.js`, `mechanicsData.js`| `bastionMechanics.test.mjs` | **FULL** |
| `RULE-VIT-03` | Carrying Capacity Scaling | `1.01 CHARACTER CREATION.md`| `src/engines/tangentScalingEngine.js` | `tacticalVitalsAndDice.test.mjs` | **FULL** |
| `RULE-CHAR-01` | 150 CP Creation Budget | `1.01 CHARACTER CREATION.md`| `src/components/Folio/CharacterCreationWizard/` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-CHAR-02` | The 5 Pillars Protocol | `bastionService.js` | `src/services/bastionCharacterEngine.js` | `bastionCharacterSynthesis.test.mjs`| **FULL** |
| `RULE-CHAR-03` | Three 20 SP Background Pools | `1.01 CHARACTER CREATION.md`| `src/data/mechanicsData.js`, `bastionCharacterEngine.js`| `pillarRecommendations.test.mjs` | **FULL** |
| `RULE-CHAR-04` | Hindrance Rebates (Max -20 CP) | `1.09 HINDRANCES.md` | `src/components/Folio/CharacterCreationWizard/` | `personaLifecycle.test.mjs` | **FULL** |
| `RULE-SKL-01` | Skill Tiers & Action Economy | `3.00 COMBAT.md § Skill Focus`| `src/data/mechanicsData.js`, `omnicortexVectorRag.ts` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-SKL-02` | Active Defense Cumulative -5 | `3.00 COMBAT.md § Defense` | `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-SKL-03` | Synergy, Transposition & Focus | `1.07 SKILLS.md` | `src/data/omnicortex/rules/skill-synergy.md` | `stage4.test.mjs` | **FULL** |
| `RULE-CMB-01` | Initiative Reflex Check | `3.00 COMBAT.md § Initiative` | `src/services/diceService.js`, `mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-CMB-02` | EDGE Advantage System | `3.00 COMBAT.md § Edge` | `src/data/mechanicsData.js`, `omnicortexVectorRag.ts` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-CMB-03` | Damage Soak & 50% Force Bypass | `3.00 COMBAT.md § Damage` | `src/data/mechanicsData.js`, `bastionService.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-CMB-04` | Called Shots & Hit Locations | `3.00 COMBAT.md § Locations` | `src/data/mechanicsData.js`, `omnicortexVectorRag.ts` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-CMB-05` | Disabled (1/3) & Destroyed (2/3)| `3.00 COMBAT.md § Limb Damage`| `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-CMB-06` | Mortality State & Bleedout (CON+5)| `3.00 COMBAT.md § Mortality` | `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-CMB-07` | Range Bands & Automatic Fire | `3.00 COMBAT.md § Ranged` | `src/data/omnicortex/rules/rule-range-categories.md`| `tacticalVitalsAndDice.test.mjs` | **FULL** |
| `RULE-MOV-01` | Paces (Walk/Jog/Run/Sprint) | `3.00 COMBAT.md § Movement` | `src/data/omnicortex/rules/rule-movement-ground-paces.md`| `stage3.test.mjs` | **FULL** |
| `RULE-MOV-02` | Specialized Modes (Flight/Swim)| `src/data/omnicortex/rules/` | `src/data/omnicortex/rules/rule-movement-flying-paces.md`| `stage3.test.mjs` | **FULL** |
| `RULE-MOV-03` | Fatigue Stages & Recovery | `3.00 COMBAT.md § Fatigue` | `src/data/omnicortex/rules/rule-rest-recovery.md` | `personaLifecycle.test.mjs` | **FULL** |
| `RULE-SCL-01` | 14 Size Tiers & Multipliers | `1.10 SCALING.md` | `src/engines/tangentScalingEngine.js`, `mechanicsData.js`| `bastionMechanics.test.mjs` | **FULL** |
| `RULE-SCL-02` | Starship Proximity Blast ($1/10$)| `1.10 SCALING.md` | `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-SCL-03` | Meta-Tech Chassis Scaling | `1.10 SCALING.md § Meta-Tech` | `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-ECO-01` | Tangent Standard Curve ($10 \cdot 4^{CR/5}$)| `2.00 ECONOMATRIX.md § 2.2` | `src/data/mechanicsData.js`, `omnicortexVectorRag.ts` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-ECO-02` | Golden Rule: Purchase CR = Crafting CR | `2.00 ECONOMATRIX.md § 3.1` | `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-ECO-03` | Cost $= \text{Base} \cdot (2^{TL}) \cdot (1.5^{ML})$| `2.00 ECONOMATRIX.md` | `src/services/omnicortexVectorRag.ts` | `bastionService.js` | **FULL** |
| `RULE-ECO-04` | Tech Levels (TL 0–5) | `2.00 ECONOMATRIX.md § 2.01` | `src/data/omnicortex/rules/`, `omnicortexVectorRag.ts` | `stage2.test.mjs` | **FULL** |
| `RULE-ECO-05` | 7-Tier Crafting Timetables | `2.00 ECONOMATRIX.md § 4.01` | `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-META-01` | Metaphysics Triad (Attune/Disc/Invoc)| `4.00 METAPHYSICS.md § Core`| `src/data/mechanicsData.js`, `omnicortexVectorRag.ts` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-META-02` | Potency Formula & Take 10 | `4.00 METAPHYSICS.md § Casting`| `src/data/mechanicsData.js`, `bastionService.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-META-03` | 6 Core Disciplines | `4.00 METAPHYSICS.md § Disciplines`| `src/data/omnicortex/disciplines/` | `stage5.test.mjs` | **FULL** |
| `RULE-META-04` | Key Abilities (INT / WIS / CHA) | `4.00 METAPHYSICS.md § Source`| `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-META-05` | Internalized Strain (1 NL / 5 fail)| `4.00 METAPHYSICS.md § Strain` | `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-COMP-01` | Companion Feature & 40 CP Base | `99. MODULAR COMPANION MATRIX`| `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-COMP-02` | Form (15 CP) + Function (25 CP) | `99. MODULAR COMPANION MATRIX`| `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-COMP-03` | Chassis Typologies (Bio/Synth/Meta)| `99. MODULAR COMPANION MATRIX`| `src/data/mechanicsData.js` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-VEH-01` | Mecha Taxonomy (Vehicles of all sorts)| `99. TECHNOLOGY, MECHA` | `src/data/mechanicsData.js`, `omnicortexVectorRag.ts` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-TECH-01` | Augmentation Tiers (<20%, <50%, >50%)| `99. TECHNOLOGY, AUGMENTATIONS`| `src/data/mechanicsData.js`, `omnicortexVectorRag.ts` | `bastionMechanics.test.mjs` | **FULL** |
| `RULE-HAZ-01` | Zero-G & Vacuum Decompression | `3.00 COMBAT.md § Zero-G` | `src/data/omnicortex/rules/rule-zero-g-environmental-hazards.md`| `stage3.test.mjs` | **FULL** |
| `RULE-STAT-01` | Core Status Conditions Matrix | `3.00 COMBAT.md § Status` | `src/data/omnicortex/rules/rule-status-effects-matrix.md`| `tacticalVitalsAndDice.test.mjs` | **FULL** |

---

## 🏁 CONCLUSION & BASTION AUDIT VERIFICATION
Every rule in this catalog is canonical to the Tangent Science Fantasy Roleplaying Game system. BASTION's reasoning services (`bastionService.js`), RAG embeddings (`omnicortexVectorRag.ts`), Character Creation Synthesis (`bastionCharacterEngine.js`), and unit test verification suites (`bastionMechanics.test.mjs`, `tangentVitalityHealthStructure.test.js`, `subAttributesBaseScores.test.mjs`) enforce these rules with mathematical fidelity.
