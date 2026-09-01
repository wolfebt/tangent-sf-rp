export const creationVolume1Articles = [
  {
    id: "1-00-character-creation-system-overview",
    name: "1.00 Character Creation System & 150 BP Economy",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 1,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "character-creation", "core-rule"],
    description: `# 1.00 Character Creation System & 150 BP Economy

Every hero in Tangent starts with **150 Build Points (BP)** to shape their attributes, skills, and special capabilities, supplemented by foundation packages from Species, Faction, Origin, and Occupation.

---

## The Creation Point Economy
| Character Dimension | Cost in BP / CP | Starting Limit | Rule Specification |
| :--- | :---: | :---: | :--- |
| **Ability Score** | **5 BP** per +1 Score | Max +4 (pre-species) | Base is +0. Negative scores rebate +5 BP. |
| **Skill Rank** | **1 BP** per +1 Rank | Max Rank 6 (Max 11 with Architect approval) | Direct 1:1 rank increase. |
| **Feature / Perk** | **3 BP** (2 BP if recommended) | Varies | 1 BP discount if on Faction, Origin, or Occupation list. |
| **Vitality Buffer** | **1 BP** per +5 Vitality | Max +20 Vitality bonus | Adds directly to base 30 Vitality. |
| **Health Buffer** | **1 BP** per +5 Health | Max +15 Health bonus | Adds directly to base 30 Health. |
| **Augmentation** | **1 BP** + Augmented Feature | Tech Level Dependent | Requires Augmented / Heavy / Severe feature. |
| **Meta Discipline** | **5 BP** + Awakened Feature | ML Dependent | Unlocks Invocation casting tree. |
| **Hindrance / Flaw** | **Rebates BP** (+1 to +5 BP) | Max +10 BP total rebates | Enforces roleplay and mechanical vulnerabilities. |

---

## Foundation Packages (60 Free Ranks, 4 Traits, 4 Features)
During creation, characters receive three dedicated 20-Point skill allotments:
1. **Faction Skills (20 SP):** Taught by your allegiance.
2. **Origin Skills (20 SP):** Inherent to your native homeworld.
3. **Occupation Skills (20 SP):** Professional competencies from your career.
Additionally, choose **Two Origin Traits**, **Two Occupational Traits**, and **4 Recommended Features**.`,
    mechanic: `Starting Budget: 150 BP
Foundation Packages: Faction (20 SP), Origin (20 SP), Occupation (20 SP) = 60 Free Skill Ranks + 4 Traits + 4 Features.
Base Attributes: STR +0, AGI +0, STA +0, INT +0, WIS +0, CHA +0`,
    guide: `Follow the 6-step creation pipeline in the Persona Folio to assemble your operative.`,
    note: `Attributes cost 5 BP per +1; Skills cost 1 BP per rank; Features cost 3 BP (2 BP discounted).`
  },
  {
    id: "1-01-01-core-attributes-checks",
    name: "1.01.01 Core Attributes, Sub-Attributes & Saving Throws",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 2,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "attributes", "core-rule"],
    description: `# 1.01.01 Core Attributes, Sub-Attributes & Saving Throws

Characters are defined by **6 Primary Attributes**, each paired with a dedicated **Sub-Attribute** used for passive resistances and raw physical/mental checks:

| Primary Attribute | Primary Scope | Sub-Attribute | Saving Throw / Active Check Application |
| :--- | :--- | :--- | :--- |
| **Strength (STR)** | Physical power, muscle mass, melee damage | **Might** | Forcing bulkheads, breaking grapples, heavy lifting. |
| **Agility (AGI)** | Coordination, reflex, balance, evasion | **Reflex** | Dodging explosives, balancing on girders, initiative rolls. |
| **Stamina (STA)** | Cardio endurance, toxin resistance, cellular integrity | **Fortitude** | Resisting poison, radiation, shock, disease, suffocation. |
| **Intellect (INT)** | Deductive logic, technical reasoning, memory | **Logic** | Slicing data cores, calculating trajectories, physics checks. |
| **Wisdom (WIS)** | Intuition, situational awareness, willpower | **Will** | Mental defense, resisting psionic domination, fear checks. |
| **Charisma (CHA)** | Social presence, leadership, voice timbre | **Etiquette** | Diplomatic negotiation, deceit detection, command morale. |`,
    mechanic: `Attribute Modifier Range: -5 to +10
Sub-Attribute Check = d20 + Sub-Attribute Bonus + Relevant Skill Rank`,
    guide: `Sub-attributes serve as saving throw modifiers against hazards and spells.`,
    note: `Raising a Primary Attribute by +1 score automatically increases linked Sub-Attribute checks by +2.`
  },
  {
    id: "1-01-02-vitality-health-structure",
    name: "1.01.02 Vitality, Health, Structure & Damage Buffers",
    category: "compendium",
    entry_type: "Game Mechanic",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 3,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "vitality-health", "mechanics"],
    description: `# 1.01.02 Vitality, Health, Structure & Damage Buffers

Tangent divides damage into two primary layers to represent the difference between fatigue/close calls and lethal physical trauma:

---

## 1. Vitality Pool (Stamina & Surface Resilience)
- **Base Formula:** **30 + (5 × Stamina Score) + (5 per BP invested)**.
- Absorbs incoming kinetic, energy, and environmental damage after Damage Reduction (DR).
- Represents dodging by millimeters, kinetic shielding absorbing impacts, and tactical fatigue.
- Recovers rapidly through Short Rests (Respite).

## 2. Health Pool (Structural Flesh & Vital Organs)
- **Base Formula:** **30 + (5 × Stamina Score) + (5 per BP invested)**.
- Damage overflows to Health only when Vitality is reduced to 0, or from direct critical bypass attacks.
- Represents broken bones, severe lacerations, internal bleeding, and organ failure.
- Requires medical surgery, trauma kits, or biomancy to heal.

## 3. Structure (Synthetics, Cyberforms & Objects)
- Synthetics and vehicles possess **Structure** in place of biological Health.
- Immune to biological toxins, bleeding, and organic disease.
- Requires mechanical repair kits, nano-lathes, and Engineering checks to restore.`,
    mechanic: `Damage Flow: Incoming Damage - Armor DR -> Vitality -> Health (overflow).
At 0 Health: Character falls Unconscious and makes Mortal Wound Fortitude checks (DC 15).`,
    guide: `Track Vitality as your active combat cushion; preserve Health points at all costs.`,
    note: `Critical hits by default deal double damage to Vitality, or may bypass directly to Health with specialized features.`
  },
  {
    id: "1-01-03-karma-fate-economy",
    name: "1.01.03 Karma, Fate & Heroic Rerolls",
    category: "compendium",
    entry_type: "Game Mechanic",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 4,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "karma", "mechanics"],
    description: `# 1.01.03 Karma, Fate & Heroic Rerolls

**Karma** represents luck, destiny, and the narrative spark that allows heroes to defy impossible odds.

---

## Karma Economy Rules
- **Base Pool:** Every character starts with **3 Karma Points** (can be augmented by Luck attributes and features).
- **Session Refresh:** Karma fully refreshes to its maximum pool at the beginning of each game session.
- **Spending Karma:**
  - **Heroic Reroll (1 Karma):** Reroll any failed d20 check (must keep the second result).
  - **Defy Death (2 Karma):** Automatically succeed on a fatal Mortal Wound stabilization check.
  - **Surge Action (1 Karma):** Gain +1 bonus Action in a tactical combat round.
  - **Narrative Twist (1 Karma):** Introduce a plausible favorable detail to the immediate scene with Architect consent.`,
    mechanic: `Base Karma: 3 Points
Refresh: 100% at start of each session or after Epic Story Climax`,
    guide: `Use Karma strategically to overturn disastrous failures or pull off critical team maneuvers.`,
    note: `Unspent Karma does not accumulate across sessions; spend it proactively.`
  },
  {
    id: "1-01-04-rest-recovery-cycles",
    name: "1.01.04 Rest Cycles, Respite, Sleep & Healing",
    category: "compendium",
    entry_type: "Game Mechanic",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 5,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "rest-recovery", "mechanics"],
    description: `# 1.01.04 Rest Cycles, Respite, Sleep & Healing

Tangent features three distinct rest cycles to balance tactical recovery and extended medical convalescence:

---

## 1. Quick Respite (10 Minutes)
- **Time Required:** 10 minutes of calm, non-strenuous breathing and hydration.
- **Recovery:** Spend 1 Recovery Die (d10 + Stamina) to restore lost **Vitality**.
- Can be taken up to 2 times per operational mission before requiring a Full Rest.

## 2. Light Rest / Nap (2 Hours)
- **Time Required:** 2 hours of sleep or low-power diagnostic mode.
- **Recovery:** Restores **100% of Vitality Pool** and clears Mild Fatigue/Exhaustion conditions.

## 3. Full Rest & Sleep (8 Hours)
- **Time Required:** 8 hours of uninterrupted rest in a safe habitat or starship cabin.
- **Recovery:** Restores **100% of Vitality Pool**, restores **Stamina Score + 5 Health Points**, and clears all standard fatigue levels.
- Medical attention (Physician DC 15 check) during a Full Rest doubles Health recovery.`,
    mechanic: `Respite: d10 + Stamina Vitality
Light Rest (2h): 100% Vitality
Full Rest (8h): 100% Vitality + (Stamina + 5) Health`,
    guide: `Plan tactical respites between security checkpoints and dungeon corridors.`,
    note: `Severe trauma or fractured limbs require surgical downtime and cannot be healed by simple rests.`
  },
  {
    id: "1-01-05-death-dying-revivification",
    name: "1.01.05 Death, Dying, Mortal Wounds & Revivification",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 6,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "death-dying", "core-rule"],
    description: `# 1.01.05 Death, Dying, Mortal Wounds & Revivification

When a character's Health reaches **0**, they collapse into a critical state where every second determines their survival.

---

## Dying State & Mortal Checks
- At 0 Health, the character falls **Incapacitated** and gains the **Dying condition**.
- At the start of each combat round, make a **Fortitude Check (DC 15)**:
  - **Success:** Stabilizes; character remains unconscious but is no longer bleeding out.
  - **Failure:** Suffers **1 Mortal Wound mark**.
  - **Critical Failure (Fail by 5+):** Suffers **2 Mortal Wound marks**.
- **Three Marks = True Death:** Accumulating 3 Mortal Wound marks results in biological death.

---

## The High Cost of Dying: Revivification & Experience Debt
If a deceased character is brought back to life via ultra-advanced TL5 cyber-surgery or 6th-order Metaphysical Revivification:
1. **Karma Reset:** Immediate loss of all current Karma points (resets to 0).
2. **-5 Experience Debt:** The existential trauma imposes a **-5 AP Debt**.
3. Future AP awards must pay down this debt 1-for-1 before normal advancement resumes, or by reducing existing traits.`,
    mechanic: `Bleed Out DC: Fortitude DC 15 per round
Revivification Penalty: Reset Karma to 0, incur -5 AP Experience Debt`,
    guide: `Allies should use First Aid or Trauma Kits immediately to stabilize dying squadmates.`,
    note: `Stabilization removes the Dying condition, leaving the character unconscious at 0 Health.`
  },
  {
    id: "1-02-archetypes-codex",
    name: "1.02 Archetypes & Modular Roles Master Codex",
    category: "compendium",
    entry_type: "Archetype Codex",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 2,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "archetypes", "codex"],
    description: `# 1.02 Archetypes & Modular Roles Master Codex

Archetypes serve as foundational templates and tactical roles for rapid character creation and modular persona design.

---

## The Four Great Spheres
1. **Sentinels (The Stabilizers):** Frontline defenders, peacekeepers, heavily armored shock troopers, and guardians.
2. **Operatives (The Artisans):** Infiltrators, marksmen, combat saboteurs, pilots, and assassins.
3. **Visionaries (The Idealists):** Diplomats, planetary envoys, mystics, chroniclers, and commanders.
4. **Savants (The Rationals):** Cyberneticists, geneticists, cryptographers, physicians, and forensic scholars.

---

## Archetype Template Structure
Every archetype provides:
- **Primary Attribute (+3 / 15 BP):** Core favored trait.
- **Secondary Attribute (+2 / 10 BP):** Supporting attribute.
- **Essential Skills:** 4 key competencies defining the tactical role.
- **Signature Features:** 2 synergized perks providing mechanical edges.
- **Recommended Factions & Origins:** Optimal lore alignments.`,
    mechanic: `Archetype Base Array: +3 Primary Attribute, +2 Secondary Attribute, +1 Tertiary Attribute.
Pre-allocated Skill Package: 10 Ranks in Essential Skills.`,
    guide: `Select an Archetype in the Folio builder to instantly populate your recommended attributes and skill allocations.`,
    note: `Archetypes can be customized freely by swapping secondary skills.`
  },
  {
    id: "1-03-species-lineages-codex",
    name: "1.03 Species Lineages & Morphological Taxonomy Codex",
    category: "compendium",
    entry_type: "Species Codex",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 3,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "species", "codex"],
    description: `# 1.03 Species Lineages & Morphological Taxonomy Codex

The galaxy is populated by hundreds of distinct lineages, classified across major ancestral taxons:

---

## Major Lineages
1. **Aeld (Ancient Fey & High Elves):** High ML sensitivity, graceful morphology, extended lifespans.
2. **Humans (Core & Variants):** Supreme adaptability, rapid skill acquisition, baseline diplomacy.
3. **Engineered Humans (Gen-E):** Specialized genetic strains engineered for heavy gravity, vacuum, or aquatic biomes.
4. **Aulurans:** Feline and lupine xenotypes with enhanced sensory perception, predatory agility, and natural claws.
5. **Kitin (Chitinous Arthropods):** Exoskeletal DR, multi-limb coordination, subterranean burrowing.
6. **Synthetics & Cyberforms:** Structural chassis, immune to biological disease and poison, high technical aptitude.
7. **Sha'nor & Void Lineages:** Zero-G adapted xenotypes with psionic resonant matrices.
8. **Independent Xenotypes:** Unique evolutionary strains from across uncharted sectors.

---

## Species Balance & Character Points (CP)
Each species is balanced around a **Character Point (CP)** budget:
- **Attribute Modifiers:** +1 to +3 racial modifiers cost CP.
- **Inherent Traits & Defenses:** Natural armor DR, darkvision, claws, environmental resistance.
- **Biological Hindrances & Stigma:** Impose CP rebates to offset high racial powers.`,
    mechanic: `Species Cost Formula: Total CP = Attribute Mods + Innate Traits + Movement Modes - Disadvantages - Stigma.
Base Pace: 30 ft (Medium), adjusted by Size and Movement traits.`,
    guide: `Review the Species table in DBM to inspect detailed stats, CP values, and lore profiles.`,
    note: `All species adhere to standard size categories from Fine to Colossal.`
  },
  {
    id: "1-10-movement-locomotion-codex",
    name: "1.10 Movement Rules, Tactical Paces & Fatigue",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 10,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "movement", "core-rule"],
    description: `# 1.10 Movement Rules, Tactical Paces & Fatigue

Locomotion in Tangent encompasses five primary modes: **Ground, Flying, Swimming, Climbing, and Burrowing**.

---

## 1. Ground Movement Paces (Medium Baseline: 30 ft / Round [6 kph])
| Pace | Multiplier | Medium Speed | Subtlety / Action Mod | Check & Fatigue Trigger |
| :--- | :---: | :---: | :---: | :--- |
| **Walk** | **1x** | 30 ft / rd | Baseline | None |
| **Jog** | **2x** | 60 ft / rd | **-2 penalty** | None |
| **Running** | **4x** *(5x with Runner)* | 120 ft *(150 ft)* | **-4 penalty** | Athletics DC 10+ (every min, cum. -1) |
| **Sprinting** | **6x** *(7x with Runner)* | 180 ft *(210 ft)* | **-8 penalty** | Athletics DC 15+ (every min, cum. -1) |
| **Crawl** | **1/2x** | 15 ft / rd | **+2 stealth**; Prone | None |
| **Slow Crawl** | **1/4x** | 7.5 ft / rd | **+4 stealth**; Prone | None |

---

## 2. Flying Movement (Medium Baseline: 60 ft / Round)
| Maneuver | Multiplier | Medium Speed | Subtlety Mod | Check & Fatigue |
| :--- | :---: | :---: | :---: | :--- |
| **Flight** | **1x Fly (2x Walk)** | 60 ft / rd | Baseline | None |
| **Sail** | **2x Fly (4x Walk)** | 120 ft / rd | **-2 penalty** | None |
| **Surge / Soar** | **4x Fly (8x Walk)** | 240 ft *(300 ft with Soar)* | **-4 penalty** | Acrobatics DC 10+ (cum. -1/min) |
| **Diving** | **2x Current** | Up to 480+ ft | **-4 penalty** | Acrobatics DC 15+ |
| **Gliding** | Maintains speed, drops 1ft / 5ft horiz | 60 ft / rd | **+2 bonus** | Acrobatics DC 10+ |
| **Hover / Descent** | **1/2 Fly or less** | 30 ft or static | Baseline | Acrobatics DC 15+ |

- **High Ground Tactical Advantage:** Flying above ground targets grants **+2 Strike / +2 Crit**.
- **Aerial Rams:** Deal **+1d per Flight Stage + 1 Impact Damage per 10 ft of speed** to all colliding entities.

---

## 3. Swimming, Climbing & Burrowing Paces
- **Swimming:** Standard 15 ft / rd (1/2 walk). Glide (30 ft), Stroke (60 ft), Treading (7.5 ft).
- **Climbing:** Scaling (30 ft at -5 check), Fast Ascent (60 ft at -10 check), Fast Descent (120 ft, DC 20).
- **Burrowing:** Standard 7.5 ft / rd (1/4 walk). Tunneling (15 ft, -2 mod), Excavation (3.75 ft).

---

## 4. Movement Fatigue Rules
- **Sprint Trigger:** 5 consecutive combat rounds of sprinting forces a **Stamina Fortitude Check (DC 15)**.
- **Hurried Travel Trigger:** 10 minutes of hurried pace forces a **Stamina Fortitude Check (DC 15)**.
- **Failure:** Incurs **5 points of non-lethal Vitality damage** (+1 pt per 5 points missed below DC).
- **Depletion to Exhaustion:** At 0 Vitality, takes **2 Health damage** and gains the **Exhausted condition** (-2 to all active checks, half speed) until taking a Light Rest.`,
    mechanic: `Base Pace: 30 ft / 6-sec round.
Sprint: 6x base pace.
Fatigue Check: Fortitude DC 15 after 5 rounds of sprint or 10 min of hurried march.`,
    guide: `Track tactical movement speeds on grid hexes (1 square = 5 ft).`,
    note: `Encumbrance reduces base pace by 5 to 15 ft depending on armor weight.`
  },
  {
    id: "1-11-experience-advancement-codex",
    name: "1.11 Experience Awards, AP Spending & The Increment Rule",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "1.00 CHARACTER CREATION & PROFILES",
    order: 11,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-1", "advancement", "core-rule"],
    description: `# 1.11 Experience Awards, AP Spending & The Increment Rule

Character advancement in Tangent is organic and milestone-driven via **Award Points (AP)** ($1\\text{ AP} = 1\\text{ BP}$).

---

## The Increment Rule (CRITICAL)
> [!IMPORTANT]
> **The Increment Rule:**
> Abilities, skills, or traits may **ONLY HAVE A 1 POINT INCREMENT OF ANY SCORE PER EXPERIENCE AWARD EVENT**.
> Players cannot dump a 10 AP award into a single skill or trait instantly. Growth requires balanced focus and training across scenes and chapters.

---

## Award Categories & Values
| Award Category | Timing & Trigger | Typical AP Yield | Evaluation Criteria |
| :--- | :--- | :---: | :--- |
| **Story: Chapter Climax** | Narrative transition / major downtime | **5 to 10 AP** | Scale and complexity of chapter resolution. |
| **Story: Overcoming Plot/Villain** | Defeating major adversary or goal | **1 to 3 AP** | 1 AP minor goal, 2 AP major villain, 3 AP mastermind. |
| **Session: Game Focus** | End of session wrap-up | **0 to 2 AP** | 0 AP distracted, 1 AP active teamwork, 2 AP brilliant tactics. |
| **Session: Roleplaying** | End of session wrap-up | **0 to 2 AP** | 0 AP pure meta, 1 AP solid character play, 2 AP transcendent RP. |
| **Epic Ad Hoc Award** | In-the-moment genius | **1 to 5 AP** | Unforeseen plans, epic heroism, stumping the Architect. |

---

## Spending Award Points Table
| Progression Path | Cost in AP | Increment Limit | Requirements |
| :--- | :---: | :---: | :--- |
| **Skill Rank** | **1 AP per +1 Rank** | Max +1 Rank per award | Subject to max skill tier limits. |
| **Attribute Check** | **1 AP per +1 Score** | Max +1 Score per award | Directly improves Might, Reflex, Fortitude, Logic, Will, Etiquette. |
| **Primary Attribute** | **5 AP per +1 Score** | Max +1 Score per award | Increases STR, AGI, STA, INT, WIS, CHA (and boosts linked checks +2). |
| **Feature / Perk** | **3 AP** (2 AP if recommended) | 1 Feature per award | Must satisfy prerequisites. |
| **Vitality Buffer** | **1 AP per +5 Vitality** | Max +5 Vitality per award | Increases stamina cushion. |
| **Health Buffer** | **1 AP per +5 Health** | Max +5 Health per award | Increases physical structural threshold. |
| **Awakened Discipline** | **5 AP** | Max 1 Discipline per award | Unlocks new Metafocus school. |
| **Invocation / Spell** | **1 to 3 AP** | 1 Invocation per award | Unlocks specific technique within Awakened discipline. |`,
    mechanic: `1 AP = 1 BP
The Increment Rule: Maximum +1 to any single score per award event.
Revivification Debt: 1-for-1 AP repayment to settle trauma debt.`,
    guide: `Record all AP awards in the Persona Folio Experience Ledger.`,
    note: `Unspent AP is stored in the Available AP pool for future downtime training.`
  }
];
