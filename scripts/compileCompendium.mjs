import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../docs/plans/OMNICORTEX');
const SEED_OUTPUT_PATH = path.resolve(__dirname, '../src/data/compendiumSeed.json');
const MD_OUTPUT_DIR = path.resolve(__dirname, '../src/data/omnicortex/compendium');

if (!fs.existsSync(MD_OUTPUT_DIR)) {
  fs.mkdirSync(MD_OUTPUT_DIR, { recursive: true });
}

function readSourceDoc(filename) {
  const p = path.join(DOCS_DIR, filename);
  if (!fs.existsSync(p)) {
    console.warn(`Source doc not found: ${p}`);
    return '';
  }
  return fs.readFileSync(p, 'utf-8');
}

// Read all 8 canonical source documents
const factionsRaw = readSourceDoc('1.04 FACTIONS.md');
const originsRaw = readSourceDoc('1.05 ORIGINS.md');
const occupationsRaw = readSourceDoc('1.06 OCCUPATIONS.md');
const skillsRaw = readSourceDoc('1.07 SKILLS.md');
const featuresRaw = readSourceDoc('1.08 FEATURES.md');
const hindrancesRaw = readSourceDoc('1.09 HINDRANCES.md');
const combatRaw = readSourceDoc('3.00 COMBAT.md');
const metaphysicsRaw = readSourceDoc('4.00 METAPHYSICS.md');

console.log(`Loaded source docs:
- FACTIONS: ${factionsRaw.length} chars
- ORIGINS: ${originsRaw.length} chars
- OCCUPATIONS: ${occupationsRaw.length} chars
- SKILLS: ${skillsRaw.length} chars
- FEATURES: ${featuresRaw.length} chars
- HINDRANCES: ${hindrancesRaw.length} chars
- COMBAT: ${combatRaw.length} chars
- METAPHYSICS: ${metaphysicsRaw.length} chars
`);

const articles = [];

// Helper to add an article
function addArticle({ id, name, category = 'compendium', parent, order, perspective = 'both', entry_type, description, mechanic = '', guide = '', note = '' }) {
  articles.push({
    id,
    name,
    category,
    parent,
    order,
    perspective,
    entry_type,
    description: description.trim(),
    mechanic: mechanic.trim(),
    guide: guide.trim(),
    note: note.trim(),
    updatedAt: new Date().toISOString()
  });
}

/* =========================================================================
   VOLUME 0.00: SYSTEM ROLES & ARCHITECTURE (OPERATOR, ARCHITECT, BASTION)
   ========================================================================= */

addArticle({
  id: '0-01-operator-reference-manual',
  name: '0.01 OPERATOR Reference Manual (Player Character & Folio Guide)',
  parent: '0.00 SYSTEM & USER MANUALS',
  order: 1,
  perspective: 'operator',
  entry_type: 'Operator Guide',
  description: `# 0.01 OPERATOR Reference Manual (Player Character & Folio Guide)

The **OPERATOR** is the player who commands and embodies a Hero or Persona in the Tangent Science Fantasy Roleplay universe. As an Operator, you navigate perilous star-systems, ancient alien ruins, neon arcologies, and high-stakes metaphysical confrontations.

---

## 1. The Persona Folio: Core Attributes & Derivations

Every character in Tangent is built upon **6 Core Attributes**, each coupled with a specialized **Sub-Attribute**:

| Primary Attribute | Core Application | Sub-Attribute | Saving Throw / Check |
| :--- | :--- | :--- | :--- |
| **Strength (STR)** | Physical power, carrying capacity, melee force | **Might** | Raw muscular lift, break DC, grapple power |
| **Agility (AGI)** | Dexterity, fine motor control, balance | **Reflex** | Initiative, dodge DC, acrobatics, evasion |
| **Stamina (STA)** | Physical endurance, cardio, cellular resilience | **Fortitude** | Disease, poison, wound stabilization, shock |
| **Intellect (INT)** | Deductive logic, technical aptitude, memory | **Logic** | Hacking, investigation, physics, computation |
| **Wisdom (WIS)** | Intuition, spatial awareness, perception | **Will** | Mental defense, fear resistance, psychic grit |
| **Charisma (CHA)** | Social magnetism, leadership, command presence | **Etiquette** | Diplomacy, deceit, negotiation, morale |

---

## 2. The Operator's Three 20-Point Skill Allotments

During character creation, an Operator receives three distinct, dedicated pools of **20 Skill Points (SP)**:

1. **Faction Skill Pool (20 SP):** Allocated among skills taught by your chosen Primary Faction (e.g. Dracon Dynasty, The Syndicate, Coalition).
2. **Origin Skill Pool (20 SP):** Allocated among survival and environmental skills granted by your birthworld or native habitat (e.g. Agri-World, Arcology, Death World).
3. **Occupation Skill Pool (20 SP):** Allocated among professional skills defining your training, career, and role (e.g. Soldier, Adept, Scout, Scholar, Scoundrel).

> [!IMPORTANT]
> **Skill Rank Caps at Creation:**
> - Recommended starting limit: **Rank 6 (Trained / Professional)**.
> - Maximum hard cap during creation: **Rank 11 (Expert)** (reserved for specialized backstory concepts).
> - Cost: **1 SP = 1 Skill Rank**.

---

## 3. Features, Feats & Perks

- Standard Features cost **3 Build Points (BP)** each.
- **Recommended Features** listed under your Occupation or Faction receive a **1 BP Discount** (costing **2 BP**).
- **Ranked Features** (e.g. Great Fortitude, Lightning Reflexes) may be purchased multiple times, stacking bonuses up to your attribute or skill tier limits.
- Players select **Two Origin Traits** and **Two Occupational Traits** during character generation.

---

## 4. Action Economy in Tactical Combat

Your number of attacks and actions per round is governed directly by your **Combat Skill Rank**:

| Skill Rank | Title / Benchmark | Actions per Round | Focus Strike Bonus |
| :--- | :--- | :--- | :---: |
| **Rank 0** | Untrained | Full Round (1 basic action) | — |
| **Rank 1 – 5** | Novice / Studied | **1st Action** at base score | +2 |
| **Rank 6 – 10** | Trained / Professional | **2nd Action** at base -5 | +3 |
| **Rank 11 – 15** | Expert | **3rd Action** at base -10 | +4 |
| **Rank 16 – 20** | Master | **4th Action** at base -15 | +5 |
| **Rank 21 – 25** | Grand Master | **5th Action** at base -20 | +6 |
| **Rank 26 – 30** | Pinnacle | **6th Action** at base -25 | +7 |

---

## 5. Metaphysics & Reality Manipulation

If your character possesses an **Awakened Discipline**:
- **Attune Check:** Determines the resistance DC of your spell or the evasion DC for targets.
- **Discipline Check:** Determines the intensity, duration, damage, or magnitude of the effect.
- **Essence Pool:** Manage your daily Essence reserves to power Invocations and avoid Strain.`,
  mechanic: `Attack Check = d20 + Combat Skill Rank + Ability Mod + Weapon Modifiers
Active Defense = d20 + Defense Skill + Agility Mod (each successive defense at cumulative -5)
Spell Resistance DC = 10 + Key Ability Mod + Attune Rank + Invocation Level`,
  guide: `1. Check your Persona Folio for current HP, Armor DR, and Essence Pool.
2. On your turn in combat, declare actions up to your Skill Stage limit.
3. Roll d20 + Skill Rank + Attribute Mod vs target DC or Opposed Defense.`,
  note: `Operators should balance offensive actions with defensive reserves, as reactive defenses suffer cumulative penalties.`
});

addArticle({
  id: '0-02-architect-reference-manual',
  name: '0.02 ARCHITECT Reference Manual (Game Master & Worldbuilder Guide)',
  parent: '0.00 SYSTEM & USER MANUALS',
  order: 2,
  perspective: 'architect',
  entry_type: 'Architect Guide',
  description: `# 0.02 ARCHITECT Reference Manual (Game Master & Worldbuilder Guide)

The **ARCHITECT** is the Game Master, universe designer, referee, and lead storyteller of the Tangent SFF RPG framework. The Architect sets the parameters of worlds, crafts adversaries and factions, adjudicates rules, and maintains dramatic momentum.

---

## 1. Setting the Stage: World & Civilization Metrics

When establishing star-systems or planetary sectors, assign two fundamental ratings:

### Technology Level (TL 0 to TL 5)
- **TL 0 (Primitive):** Stone, bronze, early combustion, archaic blades.
- **TL 1 (Industrial):** Fossil fuels, early rocketry, ballistic firearms, radio.
- **TL 2 (Atomic / Digital):** Micro-circuitry, fission power, orbital shuttles, lasers.
- **TL 3 (Interstellar / Standard):** Fusion reactors, FTL hyper-lanes, plasma ballistics, cybernetics.
- **TL 4 (Advanced / Cybernetic):** Antimatter power, neural stacks, graviton plating, hard-light.
- **TL 5 (Hyper-Tech / Exotic):** Singularity drives, zero-point energy, reality-warp lattices.

### Metafocus Level (ML 0 to ML 6)
- **ML 0 (Null):** No native meta users or reality warping.
- **ML 1 (Rare):** Negligible population ratio; meta users are feared, revered, or hunted.
- **ML 2 (Selective):** Specialized cults, psionic black-ops, monastery enclaves.
- **ML 3 (Cultured):** Common acceptance; Adepts operate in hospitals, courts, and armies.
- **ML 4 (Standardized):** Integrated into daily life, legal codes, and infrastructure.
- **ML 5 (Advanced):** High-density psionic society; telepathic networks and matter-shaping.
- **ML 6 (Deific):** Transcended civilization (Progenitors / Architects); Non-Player Characters only.

---

## 2. Difficulty Classes (DC) & Adjudication

| Difficulty Level | Target DC | Typical Task Example |
| :--- | :---: | :--- |
| **Very Easy / Routine** | **5** | Driving on an open highway, noticing a loud noise |
| **Easy / Standard** | **10** | Picking a simple lock, climbing a ladder in rain |
| **Moderate / Challenging** | **15** | Bypassing an electronic security door, first aid in combat |
| **Hard / Professional** | **20** | Hacking an encrypted corp server, landing in a storm |
| **Very Hard / Master** | **25** | Disarming an active antimatter warhead, tracking in vacuum |
| **Extreme / Heroic** | **30** | Out-piloting a smart missile swarm, subverting an AI core |
| **Near Impossible / Deific**| **35+** | Reshaping tectonic plates with pure metaphysical will |

---

## 3. Adjudicating Opposed vs. Unopposed Rolls

- **Opposed Rolls:** Attacker check vs. Defender check.
  - *Golden Rule:* **DEFENDER WINS ALL TIES**.
- **Unopposed Rolls:** Attacker check vs. Static DC (Base 15 modified for Size, Range, and Movement).

---

## 4. Encounter Balancing & NPC Architecture

Architects can quickly assemble adversary statblocks using the **3-Tier Threat Matrix**:
- **Minions / Grunts:** Fixed 10 HP, No Armor DR, +2 to +4 on attack rolls, 1 action per round.
- **Elites / Enforcers:** 30–50 HP, Armor DR 5–10, +6 to +10 attack roll, 2–3 actions per round.
- **Bosses / Arch-Villains:** 100+ HP, Armor DR 15+, Legendary Reactions, Focus Strike +5, full Metaphysic suites.`,
  mechanic: `Unopposed DC = 15 + Size Modifier + Range Penalty + Movement Modifier
Design DC = (TL * 2) + (ML * 3) + Base Component Difficulty`,
  guide: `1. Establish planetary TL and ML before designing scenes.
2. Use Base DC 15 for average tasks under pressure; adjust in +/- 5 increments.
3. When resolving opposed checks, award ties to the defending party.`,
  note: `Keep the story moving: if a roll fails by 1-2 points, offer a Success at a Cost rather than a hard roadblock.`
});

addArticle({
  id: '0-03-bastion-tactical-assistant-manual',
  name: '0.03 BASTION Tactical Assistant & Engine Manual',
  parent: '0.00 SYSTEM & USER MANUALS',
  order: 3,
  perspective: 'both',
  entry_type: 'Core Engine Manual',
  description: `# 0.03 BASTION Tactical Assistant & Engine Manual

**BASTION** is the integrated Tactical AI Assistant, rules adjudication engine, and combat computation system for the Tangent Science Fantasy Roleplay suite.

---

## 1. System Architecture & Command Syntax

BASTION processes user directives, parses tactical encounters, calculates odds, and resolves dice commands:

### Dice Rolling Engine Syntax
- \`/roll [count]d[sides]+[mod]\`
- Examples:
  - \`/roll d20+6\` — Standard attack or skill check.
  - \`/roll 2d10+4\` — Heavy energy blaster damage roll.
  - \`/roll 3d6+2\` — Kinetic slug thrower burst roll.

---

## 2. Core Resolution Formulas

BASTION evaluates mathematical equations across the three modules (**Omnicortex**, **Story Foundry**, and **Persona Folio**):

### Attack & Strike Calculation
\`Total Strike = d20 + Skill Rank + Attribute Mod + Weapon Mod + Situational Mod\`

### Armor Penetration & Effective Damage
\`Effective Damage = Incoming Damage - max(0, Armor DR - Armor Piercing (AP))\`

### Metaphysic Potency
\`Potency Score = Key Ability + Discipline Skill Level + Invocation Level + 10 (or d20)\`

---

## 3. Database Schemas & Relational Integrity

BASTION enforces strict data validation across all DBM collections:
- **Relational Linking:** Items link to prerequisites, species link to inherent traits, and features link to skill requirements.
- **Bi-directional Sync:** Folio character sheets dynamically query Omnicortex DBM entries in real time.`,
  mechanic: `Input: /roll 2d20kh1+5 -> Roll 2d20, Keep Highest 1, Add 5 (Advantage Check)
Damage Soak: EffectiveHP_Loss = max(1, RawDamage - max(0, TargetDR - WeaponAP))`,
  guide: `Type /roll in the BASTION chat bar to execute instant dice operations.
Ask BASTION for rule lookups, NPC generation, and combat odds analysis.`,
  note: `BASTION is strictly attuned to the Tangent SFF RPG rulebook and prioritizes mathematical precision.`
});

/* =========================================================================
   VOLUME 1.00: CHARACTER CREATION & ECONOMY (OPERATOR)
   ========================================================================= */

addArticle({
  id: '1-01-character-creation-pipeline',
  name: '1.01 Character Creation Pipeline & Derivations',
  parent: '1.00 CHARACTER CREATION & ECONOMY',
  order: 1,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 1.01 Character Creation Pipeline & Derivations

Creating a character in Tangent Science Fantasy Roleplay is an additive, modular process that blends species biology, cultural upbringing, faction alignment, and professional vocation into a cohesive Persona.

---

## The 8-Step Character Creation Pipeline

1. **Concept & Archetype:** Define your character concept (e.g. Cyber-Samurai, Psionic Diplomat, Void Scout, Alien Scholar).
2. **Species Selection:** Choose a Species. Apply inherent attribute modifiers, bonus skill pools, species traits, and size/movement profiles.
3. **Core Attributes:** Distribute starting Build Points (BP) across the 6 Core Attributes (*STR, AGI, STA, INT, WIS, CHA*).
4. **Faction Selection (20 SP):** Choose a Primary Faction. Allocate the **20 Faction Skill Points** and select 2 Faction Features (with 1 BP discount).
5. **Origin Selection (20 SP):** Choose an Origin environment. Allocate the **20 Origin Skill Points** and choose 2 Origin Traits.
6. **Occupation Selection (20 SP):** Choose an Occupation. Allocate the **20 Professional Skill Points**, choose 2 Occupational Traits, and select Recommended Features.
7. **Hindrances (Up to +15 BP):** Select optional Hindrances to flesh out narrative flaws and earn bonus Build Points.
8. **Gear, Tech & Derived Stats:** Calculate maximum Hit Points, Armor DR, Initiative, Saving Throws, and equip weapons/armor based on Wealth score.

---

## Derived Combat & Survival Statistics

| Statistic | Calculation Formula | Description |
| :--- | :--- | :--- |
| **Max Hit Points (HP)** | Base (10) + (Stamina Mod * 2) + Rank Multipliers | Total physical trauma capacity |
| **Initiative Check** | d20 + Reflex Save + Agility Mod | Reaction speed at start of combat |
| **Might Check** | d20 + Strength Mod + Athletics Rank | Physical power, breaking DC, grappling |
| **Fortitude Save** | d20 + Stamina Mod + Survival Rank | Resistance to poison, shock, radiation |
| **Reflex Save** | d20 + Agility Mod + Acrobatics Rank | Evasion of blast radii and traps |
| **Logic Check** | d20 + Intellect Mod + Science/Tech Rank | Deductive analysis and computation |
| **Will Save** | d20 + Wisdom Mod + Alertness Rank | Mental grit, fear, and psionic defense |
| **Etiquette Check** | d20 + Charisma Mod + Culture Rank | Social poise and diplomatic standing |`,
  mechanic: `BaseHP = 10 + (StaminaMod * 2) + (Level * ClassHealthFactor)
Initiative = d20 + AgilityMod + ReflexSaveMod`,
  guide: `Follow steps 1 through 8 in order. Record each 20-point pool separately to ensure compliance with creation limits.`,
  note: `Architects should verify that starting skills do not exceed Rank 6 without explicit backstory justification.`
});

addArticle({
  id: '1-02-skill-point-economy',
  name: '1.02 Skill Point Economy & Allocation Pools',
  parent: '1.00 CHARACTER CREATION & ECONOMY',
  order: 2,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 1.02 Skill Point Economy & Allocation Pools

Skills in Tangent represent formal training, reflex conditioning, and practical experience. All skill ranks are purchased with **Skill Points (SP)** or **Build Points (BP)**.

---

## The Three 20-Point Pools

Every starting character receives three separate, non-transferable pools of 20 Skill Points:

| Pool Name | Source | Purpose | Allowable Skills |
| :--- | :--- | :--- | :--- |
| **Faction Pool** | Primary Faction | Cultural, political, and doctrinal training | Listed under chosen Major Faction |
| **Origin Pool** | Birthworld / Habitat | Survival, environmental adaptation, navigation | Listed under chosen Origin |
| **Occupation Pool** | Career / Profession | Technical, combat, and vocational expertise | Listed under chosen Occupation |

---

## Skill Rank Limits & Creation Caps

- **Cost:** **1 SP = 1 Skill Rank** (or 1 BP = 1 Skill Rank if using general Build Points).
- **Recommended Creation Baseline:** No skill should exceed **Rank 6 (Trained / Professional)** at character creation.
- **Maximum Creation Hard Cap:** Under no circumstance may any starting skill exceed **Rank 11 (Expert)** at character creation.
- Ranks 12–30 are unlocked exclusively through in-game gameplay, progression milestones, and experience rewards.`,
  mechanic: `SkillRank_CreationMax = 11
SkillRank_CreationRecommended = 6
TotalStartingSkillPoints = 20(Faction) + 20(Origin) + 20(Occupation) = 60 SP`,
  guide: `Spend exactly 20 points within each respective category list. Do not pool points across different categories.`,
  note: `Limiting starting ranks to Rank 6 ensures characters have room for meaningful growth across multiple campaign arcs.`
});

/* =========================================================================
   VOLUME 1.04: PRIMARY FACTIONS (MAJOR GALACTIC POLITIES - PRIMARY CHOICE)
   ========================================================================= */

addArticle({
  id: '1-04-00-major-factions-overview',
  name: '1.04.00 Major Factions Overview & Alignment Matrix',
  parent: '1.04 PRIMARY FACTIONS (MAJOR POLITIES)',
  order: 1,
  perspective: 'operator',
  entry_type: 'Major Faction (Primary)',
  description: `# 1.04.00 Major Factions Overview & Alignment Matrix

Factions in Tangent represent the towering interplanetary polities, corporations, monastic orders, and alliances that shape the galactic balance of power. A character's Primary Faction defines their geopolitical allegiance, cultural dogma, and foundational training.

---

## Faction Mechanical Benefits

Choosing a **Major Primary Faction** grants the following:
1. **20-Point Faction Skill Package:** 20 Skill Points distributed strictly among the faction's signature combat, technical, and diplomatic skills.
2. **Two Bonus Features (1 BP Discount):** Access to faction-exclusive perks and recommended features at a reduced cost (2 BP instead of 3 BP).
3. **Sociological Standing:** Pre-established diplomatic recognition, citizenship, legal protection, and access to faction technology.

---

## The Major Factions of the Known Galaxy

| Faction Name | Archetype | Tech Level | Meta Level | Capital / Core World | Driving Mandate |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Dracon Dynasty** | Feudal Technocracy / Space Monarchy | **TL 3** | **ML 3** | Draconis | Protect the Realm; Expand through Diplomacy. |
| **The Syndicate** | Cyber-Corporate Cyberocracy | **TL 4** | **ML 2** | Premius | Eliminate Friction; Maximize Efficiency. |
| **Free Worlds Coalition** | Democratic Confederation / Frontier League | **TL 3** | **ML 2** | Libertalia | Self-Determination; Resist Imperial Dominion. |
| **The Ascendancy** | Psionic Theocracy / Transcendence | **TL 3** | **ML 5** | Solace | Uplift the Mind; Attune to the Quantum Weave. |
| **Auluran Clans** | Nomadic Starfarers / Bio-Smiths | **TL 4** | **ML 3** | The Great Armada | Preserve the Fleet; Honor the Ancestor Pods. |
| **Elven Providence** | Ancient Sages / Star-Weavers | **TL 4** | **ML 4** | Illyria | Harmonize Nature with High Science. |
| **Kovian Tribunal** | Technocratic Arbiters / Lawbringers | **TL 4** | **ML 1** | Kovia Prime | Order through Logic; Eradicate Chaos. |
| **Vajar** | Warrior Clades / Honorbound Legions | **TL 3** | **ML 2** | Vajarath | Glory in Battle; Strength through Trial. |
| **Impyrium Dominion** | Imperial Autocracy / Solar Empire | **TL 4** | **ML 3** | Sol-Invictus | Total Subjugation; The Grand Imperial Design. |
| **Radiant Impyrium** | Divine Solar Hegemony | **TL 4** | **ML 4** | Aethelgard | Purity through Light; Divine Right of Rule. |`,
  mechanic: `FactionSkillPoints = 20
FactionFeatureDiscount = 1 BP per recommended feature (Min 1 BP)`,
  guide: `Choose one Major Faction during Step 4 of character creation. Allocate your 20 Faction Skill Points and select 2 Faction Features.`,
  note: `Major Factions are the primary choice for player characters. Generic Factions (1.04.10) serve as secondary options for custom backgrounds.`
});

addArticle({
  id: '1-04-01-dracon-dynasty',
  name: '1.04.01 Dracon Dynasty (Feudal Monarchy / Dragon-Knights)',
  parent: '1.04 PRIMARY FACTIONS (MAJOR POLITIES)',
  order: 2,
  perspective: 'operator',
  entry_type: 'Major Faction (Primary)',
  description: `# 1.04.01 Dracon Dynasty (Feudal Monarchy / Dragon-Knights)

The **Dracon Dynasty** stands as a bastion of stability and tradition in a chaotic galaxy. Founded by Dragons and currently ruled by their Draconic descendants, the faction claims a continuous lineage of rule spanning centuries.

---

## Core Identity & Mandate
- **Official Designation:** The Dracon Dynasty
- **Colloquialisms:** The Dynasty / Dragon-Lords / The Realm
- **Archetype:** Feudal Technocracy / Space Monarchy
- **Driving Mandate:** Protect the Realm; Expand through Diplomacy.
- **Symbol / Sigil:** The Dragon Rampant.
- **Capital World:** Draconis (basalt castle-worlds and planetary shields).

---

## Sociological Profile & Caste System
The society is stratified by a rigid **Feudal Caste System**:
1. **Draconic Royalty & Nobility:** Lineage of dragon-blood rulers possessing immense presence, extended lifespans, and natural Sorcerous attunement.
2. **Knights (Dragoons):** Elite armored warriors piloting heavy powered armor and Dragon-Strider mecha.
3. **Commoners & Guild Artisans:** The foundation of the Dynasty's industry, protected under *Noblesse Oblige*.

---

## Game Mechanics & Advancements
- **Tech Level:** **TL 3 (Feudal / Heavy)** — Focus on defensive energy shielding, super-heavy walkers, and vibro-melee weaponry.
- **Meta Level:** **ML 3 (Sorcerous)** — Ancestral veneration and elemental battle-magic.

### Faction Skill Package (20 Points)
- **Combat (1 or 2 Skills) (+4):** Knightly martial training (Blades, Heavy Weapons, or Shields).
- **History (Lineage) (+4):** Aristocratic heraldry, treaties, and dynastic politics.
- **Diplomacy (Command) (+3):** Leadership and commanding presence.
- **Intimidate (+3):** Radiating the formidable aura of the Dragon.
- **Tactics (+3):** Large-scale battlefield strategy.
- **Ride / Pilot (+3):** Operating beast mounts, starfighters, or heavy walkers.

### Bonus Features (1 BP Discount)
- **Benefit (Status / Rank):** Start with recognized noble rank or Dragoon Knight standing.
- **Great Fortitude / Potent Might:** Draconic biological resilience.`,
  mechanic: `Faction Package: Combat +4, History +4, Diplomacy +3, Intimidate +3, Tactics +3, Pilot +3 = 20 SP
Bonus Feat: Status (Knight/Noble) at 2 BP (1 BP Discount)`,
  guide: `Ideal for noble warriors, battle-mages, honorbound dragoons, and diplomatic envoys.`,
  note: `The Dynasty views the Coalition as anarchic and the Syndicate as vulgar merchants.`
});

addArticle({
  id: '1-04-02-the-syndicate',
  name: '1.04.02 The Syndicate (Incorporated Planetary Syndication)',
  parent: '1.04 PRIMARY FACTIONS (MAJOR POLITIES)',
  order: 3,
  perspective: 'operator',
  entry_type: 'Major Faction (Primary)',
  description: `# 1.04.02 The Syndicate (Incorporated Planetary Syndication)

The **Incorporated Planetary Syndication** (The Syndicate) is a high-tech **Cyberocracy** run like a vast, frictionless business entity where information equates to governance.

---

## Core Identity & Mandate
- **Official Designation:** Incorporated Planetary Syndication
- **Colloquialisms:** The Corp / The Suits / The Mesh
- **Archetype:** Cyber-Corporate / High-Tech Cyberocracy
- **Driving Mandate:** Eliminate Friction; Maximize Efficiency.
- **Symbol / Sigil:** The Hexagon (representing the Hive/Mesh).
- **Capital World:** Premius (The Corporate Core).

---

## Sociological Profile & "The Mesh"
Syndicate society is supported by **"The Mesh"**—a ubiquitous Augmented Reality and neural data network that overlays the physical world.
- **Transhumanism as a Standard:** Cybernetics and neural augmentations are professional prerequisites.
- **Reverence for "The Lady":** A cultural reverence for the enigmatic cosmic entity believed to govern fortune and market prosperity.
- **PsiCorp:** Sanctioned psions are recruited into specialized corporate intelligence divisions.

---

## Game Mechanics & Advancements
- **Tech Level:** **TL 4 (High-Tech / Cybernetic)** — Focus on consumer electronics, cybernetics, AI, and mass surveillance.
- **Meta Level:** **ML 2 (Regulated)** — Sanctioned psionics via PsiCorp.

### Faction Skill Package (20 Points)
- **Computers (+4):** Neural interfacing, programming, and hacking the Mesh.
- **Vocation (Any) (+4):** Corporate tradecraft or financial administration.
- **Business (+3):** Market analytics, corporate law, and trade negotiation.
- **Culture (+3):** Corporate etiquette and consumer psychology.
- **Deception (+3):** Corporate espionage, NDA evasion, and social engineering.
- **Investigation (+3):** Forensic data analysis and audit tracing.

### Bonus Features (1 BP Discount)
- **Cybernetic Integration:** Free installation slot and discount on neural augmentations.
- **Wealth / Corporate Credit Line:** +2 to starting Wealth score.`,
  mechanic: `Faction Package: Computers +4, Vocation +4, Business +3, Culture +3, Deception +3, Investigation +3 = 20 SP
Bonus Feat: Cybernetic Integration / Wealth at 2 BP`,
  guide: `Ideal for hackers, corporate fixers, cyber-enhanced operatives, executives, and tech specialists.`,
  note: `The Syndicate trades with everyone but is trusted by no one.`
});

addArticle({
  id: '1-04-03-free-worlds-coalition',
  name: '1.04.03 Free Worlds Coalition & Frontier Alliance',
  parent: '1.04 PRIMARY FACTIONS (MAJOR POLITIES)',
  order: 4,
  perspective: 'operator',
  entry_type: 'Major Faction (Primary)',
  description: `# 1.04.03 Free Worlds Coalition & Frontier Alliance

The **Free Worlds Coalition** is a decentralized confederation of independent star systems, frontier colonies, merchant leagues, and rebel planets united to protect their sovereignty against the expansionist empires.

---

## Core Identity & Mandate
- **Official Designation:** The Free Worlds Coalition
- **Colloquialisms:** The Coalition / The Frontier / Free-Spacers
- **Archetype:** Democratic Confederation / Frontier League
- **Driving Mandate:** Defend Self-Determination; Resist Imperial Hegemony.
- **Symbol / Sigil:** The Broken Chain over Starfield.
- **Capital World:** Libertalia (Rotating Senate Hub).

---

## Sociological Profile
The Coalition is fiercely egalitarian and culturally diverse:
- **Frontier Ethos:** Self-reliance, mutual aid, and suspicion of centralized bureaucracy.
- **Militia Fleet:** Defense is maintained by volunteer flotillas, privateers, and planetary defense leagues.

---

## Game Mechanics & Advancements
- **Tech Level:** **TL 3 (Modular / Rugged)** — Adaptable starships, rugged ballistic/laser weaponry, and DIY tech.
- **Meta Level:** **ML 2 (Unrestricted)** — Psions and adepts practice freely without state persecution.

### Faction Skill Package (20 Points)
- **Piloting (+4):** Astrogation, ship handling, and blockade running.
- **Survival (+4):** Wilderness and frontier colony endurance.
- **Technology (+3):** Field repair, jerry-rigging, and ship maintenance.
- **Combat (Modern Firearms) (+3):** Militia rifle and blaster proficiency.
- **Streetwise (+3):** Smuggling routes, barter, and port contacts.
- **Alertness (+3):** Spotting ambushes and hostile sensors.

### Bonus Features (1 BP Discount)
- **Jack of All Trades:** Versatility in untrained skill checks.
- **Independent Grit:** Bonus on Will and Fortitude saves against coercion.`,
  mechanic: `Faction Package: Piloting +4, Survival +4, Technology +3, Firearms +3, Streetwise +3, Alertness +3 = 20 SP
Bonus Feat: Jack of All Trades / Independent Grit at 2 BP`,
  guide: `Ideal for smugglers, frontier marshals, blockade runners, freedom fighters, and scrappy star pilots.`,
  note: `Coalition characters value personal freedom above rigid hierarchy.`
});

addArticle({
  id: '1-04-04-the-ascendancy',
  name: '1.04.04 The Ascendancy (Psionic & Transcendent Orders)',
  parent: '1.04 PRIMARY FACTIONS (MAJOR POLITIES)',
  order: 5,
  perspective: 'operator',
  entry_type: 'Major Faction (Primary)',
  description: `# 1.04.04 The Ascendancy (Psionic & Transcendent Orders)

The **Ascendancy** is a collective of spiritually and psionically enlightened worlds dedicated to unlocking the full transcendent potential of sentient consciousness through the Metaphysical Weave.

---

## Core Identity & Mandate
- **Official Designation:** The Holy Ascendancy of Mind
- **Colloquialisms:** The Awakened / Ascendants / The Monks of Solace
- **Archetype:** Psionic Theocracy / Transcendental Society
- **Driving Mandate:** Uplift Sentient Consciousness; Attune with Universal Truth.
- **Symbol / Sigil:** The Open Lotus over Concentric Energy Rings.
- **Capital World:** Solace (Crystalline Monastic Sanctuary).

---

## Sociological Profile
- **Universal Awakening:** Every citizen is tested for latent meta-abilities in childhood and guided into monastic academies.
- **Harmonic Living:** Cities are constructed from psycho-reactive crystal and harmonized energy fields.

---

## Game Mechanics & Advancements
- **Tech Level:** **TL 3 (Bio-Crystalline)** — Psycho-reactive crystal focusers, harmonic resonance shields.
- **Meta Level:** **ML 5 (Advanced)** — Society-wide psionics, telepathic councils, and matter manipulation.

### Faction Skill Package (20 Points)
- **Attune (+5):** Drawing and channeling raw metaphysical essence.
- **Metafocus Discipline (Any) (+5):** Training in one primary discipline (Mental, Energy, Dimension, etc.).
- **Metaphysics Knowledge (+4):** Theory of reality manipulation and planar cosmology.
- **Alertness (+3):** Sensing psychic signatures and energy flows.
- **Diplomacy (+3):** Empathic negotiation and peaceful mediation.

### Bonus Features (1 BP Discount)
- **Awakened (Discipline):** Free initial awakening or discount on secondary disciplines.
- **Iron Will / Deep Attunement:** Enhanced Essence pool recovery.`,
  mechanic: `Faction Package: Attune +5, Discipline +5, Metaphysics +4, Alertness +3, Diplomacy +3 = 20 SP
Bonus Feat: Awakened / Deep Attunement at 2 BP`,
  guide: `Ideal for arcanists, psions, mystic healers, telepaths, and metaphysical scholars.`,
  note: `The Ascendancy views technological dependence without spiritual maturity as dangerous.`
});

addArticle({
  id: '1-04-05-auluran-clans',
  name: '1.04.05 Auluran Clans (Nomadic Starfarers & Bio-Smiths)',
  parent: '1.04 PRIMARY FACTIONS (MAJOR POLITIES)',
  order: 6,
  perspective: 'operator',
  entry_type: 'Major Faction (Primary)',
  description: `# 1.04.05 Auluran Clans (Nomadic Starfarers & Bio-Smiths)

The **Auluran Clans** are an ancient, proud civilization of spacefaring nomads who traverse the stars in colossal world-ships called the Great Armada. They are renowned masters of bio-engineering and genetic crafting.

---

## Core Identity & Mandate
- **Official Designation:** The Sovereign Clans of Aulura
- **Colloquialisms:** The Flotilla / Bio-Smiths / Star-Nomads
- **Archetype:** Nomadic Spacefaring Clans / Bio-Technocracy
- **Driving Mandate:** Preserve the Ancestral Armada; Master Organic Evolution.
- **Symbol / Sigil:** The Spiral DNA Helix surrounding a Starship Keel.
- **Capital:** The Great Armada Flagship *Aulura-Prime*.

---

## Game Mechanics & Advancements
- **Tech Level:** **TL 4 (Biological / Organic)** — Living ships, bio-armor, symbiotic neural implants.
- **Meta Level:** **ML 3 (Cultured)** — Organic attunement and life-force manipulation.

### Faction Skill Package (20 Points)
- **Science (Genetics / Biology) (+5):** Bio-engineering, cellular crafting, and medicine.
- **Piloting (Capital / Starship) (+4):** Flotilla maneuvers and asteroid navigation.
- **Technology (Bio-Mechanics) (+4):** Maintaining living ship organs and bio-reactors.
- **Survival (Deep Space / Zero-G) (+3):** Vacuum survival and radiation endurance.
- **Combat (Energy / Bio-Blasters) (+4):** Defending the Armada boarding corridors.

### Bonus Features (1 BP Discount)
- **Bio-Engineered Adaptation:** Inherent toxic or radiation resistance.
- **Zero-G Veteran:** Complete immunity to microgravity orientation penalties.`,
  mechanic: `Faction Package: Biology +5, Piloting +4, Bio-Tech +4, Space Survival +3, Combat +4 = 20 SP
Bonus Feat: Bio-Engineered Adaptation / Zero-G Veteran at 2 BP`,
  guide: `Ideal for geneticists, space pilots, living-ship engineers, and fleet defense warriors.`,
  note: `The Clans prize ancestral family lineage and organic technology over cold metal.`
});

addArticle({
  id: '1-04-06-elven-providence',
  name: '1.04.06 Elven Providence (Ancient Sages & Star-Weavers)',
  parent: '1.04 PRIMARY FACTIONS (MAJOR POLITIES)',
  order: 7,
  perspective: 'operator',
  entry_type: 'Major Faction (Primary)',
  description: `# 1.04.06 Elven Providence (Ancient Sages & Star-Weavers)

The **Elven Providence** represents one of the oldest interstellar empires in the galaxy, blending millenia of metaphysical wisdom with breathtaking architectural and gravitational mastery.

---

## Core Identity & Mandate
- **Official Designation:** The Sovereign Providence of Illyria
- **Colloquialisms:** Star-Weavers / The High Court / The Elders
- **Archetype:** High-Fantasy Space Empire / Magitech Aristocracy
- **Driving Mandate:** Harmonize High Metaphysics with Natural Ecology.
- **Symbol / Sigil:** The Silver Crescent enveloping a Solar Tree.
- **Capital World:** Illyria (Planetary Arboretum & Crystalline Spire World).

---

## Game Mechanics & Advancements
- **Tech Level:** **TL 4 (Magitech / Graviton)** — Graviton sails, hard-light bows, ethereal shielding.
- **Meta Level:** **ML 4 (Standardized)** — Pervasive reality-weaving integrated into daily life.

### Faction Skill Package (20 Points)
- **Attune (+4):** Planetary and celestial energy manipulation.
- **Culture (High Court) (+4):** Millenia of diplomatic history and interstellar etiquette.
- **Combat (Archery / Energy Blades) (+4):** Traditional high-precision martial arts.
- **Academics / History (+3):** Ancient star-lore, progenitor relics, and archives.
- **Diplomacy (+3):** Elegant negotiation and cosmic treaty craft.
- **Nature / Astrogation (+2):** Ecological preservation and stellar currents.

### Bonus Features (1 BP Discount)
- **Ethereal Grace:** Bonus to Reflex saving throws and acrobatic evasion.
- **Ancient Lineage:** Extended lifespan and enhanced psychic resistance.`,
  mechanic: `Faction Package: Attune +4, Culture +4, Combat +4, History +3, Diplomacy +3, Nature +2 = 20 SP
Bonus Feat: Ethereal Grace / Ancient Lineage at 2 BP`,
  guide: `Ideal for star-singers, magitech archers, noble diplomats, and ancient lorekeepers.`,
  note: `The Providence looks upon younger human factions with patronizing patience.`
});

addArticle({
  id: '1-04-07-kovian-tribunal',
  name: '1.04.07 Kovian Tribunal (Technocratic Arbiters & Lawbringers)',
  parent: '1.04 PRIMARY FACTIONS (MAJOR POLITIES)',
  order: 8,
  perspective: 'operator',
  entry_type: 'Major Faction (Primary)',
  description: `# 1.04.07 Kovian Tribunal (Technocratic Arbiters & Lawbringers)

The **Kovian Tribunal** is a stern, logic-driven interstellar order of adjudicators, judges, and enforcers dedicated to imposing mathematical order and justice upon the chaotic fringes of space.

---

## Core Identity & Mandate
- **Official Designation:** The Supreme Kovian Tribunal of Justice
- **Colloquialisms:** The Arbiters / Lawbringers / The Iron Gavel
- **Archetype:** Legalistic Technocracy / Judicial Enforcers
- **Driving Mandate:** Order through Impartial Law; Eradicate Systemic Chaos.
- **Symbol / Sigil:** Balanced Scales forged from Cybernetic Circuitry.
- **Capital World:** Kovia Prime (Monolithic Fortress of Justice).

---

## Game Mechanics & Advancements
- **Tech Level:** **TL 4 (Enforcement / Cybernetic)** — Non-lethal suppression tech, neural interrogators, stasis cuffs.
- **Meta Level:** **ML 1 (Suppressed)** — Suspicious of unregulated reality manipulation.

### Faction Skill Package (20 Points)
- **Investigation (+5):** Forensic analysis, crime scene reconstruction, and interrogation.
- **Law / Nobility (+4):** Interstellar codices, galactic jurisprudence, and treaty law.
- **Combat (Tactical Suppression) (+4):** Subdual combat, crowd control, and sidearms.
- **Alertness (+4):** Detecting falsehood, hidden contraband, and hostile movement.
- **Intimidate (+3):** Projecting the absolute authority of the Tribunal.

### Bonus Features (1 BP Discount)
- **Incorruptible Will:** High resistance to mental influence, bribes, and deception.
- **Precision Strike (Subdual):** Incapacitating targets without inflicting lethal damage.`,
  mechanic: `Faction Package: Investigation +5, Law +4, Combat +4, Alertness +4, Intimidate +3 = 20 SP
Bonus Feat: Incorruptible Will / Precision Strike at 2 BP`,
  guide: `Ideal for galactic marshals, forensic investigators, bounty arbiters, and tactical judges.`,
  note: `The Tribunal enforces laws strictly according to written statutes without personal bias.`
});

addArticle({
  id: '1-04-08-vajar',
  name: '1.04.08 Vajar (Warrior Clades & Honorbound Legions)',
  parent: '1.04 PRIMARY FACTIONS (MAJOR POLITIES)',
  order: 9,
  perspective: 'operator',
  entry_type: 'Major Faction (Primary)',
  description: `# 1.04.08 Vajar (Warrior Clades & Honorbound Legions)

The **Vajar** are a fearsome, honor-driven warrior culture organized into competitive clades. They believe strength in battle and personal valor are the supreme virtues of the cosmos.

---

## Core Identity & Mandate
- **Official Designation:** The United Vajar Clades
- **Colloquialisms:** The Legions / The Clades / Blood-Sworn
- **Archetype:** Honorbound Martial Hegemony
- **Driving Mandate:** Glory in Combat; Strength through Continuous Trial.
- **Symbol / Sigil:** The Crossed War-Axes over a Molten Core.
- **Capital World:** Vajarath (Volcanic Crucible World).

---

## Game Mechanics & Advancements
- **Tech Level:** **TL 3 (Martial / Heavy)** — Super-dense kinetic armor, thermal axes, heavy assault craft.
- **Meta Level:** **ML 2 (Warrior Trance)** — Martial attunement, pain suppression, and battle surges.

### Faction Skill Package (20 Points)
- **Combat (Melee / Heavy Blades) (+5):** Mastery of greatswords, axes, and polearms.
- **Athletics (+4):** Muscular conditioning, sprinting, and climbing.
- **Intimidate (+4):** Demoralizing enemies with battle cries and physical presence.
- **Tactics (Assault) (+3):** Breaching operations and frontline combat command.
- **Survival (+4):** Enduring extreme environmental crucible conditions.

### Bonus Features (1 BP Discount)
- **Blood of the Warrior:** Bonus damage when operating below half maximum HP.
- **Mighty Surge / Great Fortitude:** Exceptional physical resilience.`,
  mechanic: `Faction Package: Melee Combat +5, Athletics +4, Intimidate +4, Tactics +3, Survival +4 = 20 SP
Bonus Feat: Blood of the Warrior / Mighty Surge at 2 BP`,
  guide: `Ideal for frontline shock troopers, clade champions, gladiators, and assault commanders.`,
  note: `A Vajar's word is an unbreakable iron oath; breaking a vow is worse than death.`
});

addArticle({
  id: '1-04-09-impyrium-dominion',
  name: '1.04.09 Impyrium Dominion & Radiant Impyrium',
  parent: '1.04 PRIMARY FACTIONS (MAJOR POLITIES)',
  order: 10,
  perspective: 'operator',
  entry_type: 'Major Faction (Primary)',
  description: `# 1.04.09 Impyrium Dominion & Radiant Impyrium

The **Impyrium Dominion** (and its fanatical spiritual core, the **Radiant Impyrium**) is a massive, militaristic solar empire that views interstellar conquest as a sacred civilizing mission.

---

## Core Identity & Mandate
- **Official Designation:** The Grand Dominion of the Radiant Impyrium
- **Colloquialisms:** The Impyrium / The Solar Throne / The Grand Design
- **Archetype:** Autocratic Solar Empire / Militaristic Theocracy
- **Driving Mandate:** Total Order; Integration of all worlds into the Grand Design.
- **Symbol / Sigil:** The Solar Sunburst over an Iron Crown.
- **Capital World:** Sol-Invictus (Gilded Dyson Arcology World).

---

## Game Mechanics & Advancements
- **Tech Level:** **TL 4 (Imperial Super-Tech)** — Dreadnoughts, plasma lances, radiant shielding.
- **Meta Level:** **ML 3 to 4 (Solar Cult / Psi-Inquisition)** — Sanctioned solar paladins and inquisitors.

### Faction Skill Package (20 Points)
- **Combat (Heavy Weapons or Plasma) (+5):** Operating standard imperial armament.
- **Tactics (Fleet / Army) (+4):** Imperial doctrine and coordinated fire maneuvers.
- **Culture (Imperial Protocol) (+3):** Court etiquette and administrative hierarchy.
- **Intimidate (+4):** Projecting imperial authority and ruthlessness.
- **Technology (+4):** Maintaining imperial starship systems and power cores.

### Bonus Features (1 BP Discount)
- **Imperial Discipline:** High resistance to fear and morale breaks in combat.
- **Solar Wrath:** Bonus energy damage when channeling radiant or plasma weapons.`,
  mechanic: `Faction Package: Combat +5, Tactics +4, Culture +3, Intimidate +4, Technology +4 = 20 SP
Bonus Feat: Imperial Discipline / Solar Wrath at 2 BP`,
  guide: `Ideal for imperial legionnaires, solar inquisitors, fleet officers, and noble scicons.`,
  note: `The Impyrium views the Syndicate as corporate heretics and the Coalition as chaotic rebels.`
});

/* =========================================================================
   VOLUME 1.04.10: SECONDARY FACTIONS (25 GENERIC ORGANIZATIONAL TEMPLATES)
   ========================================================================= */

addArticle({
  id: '1-04-10-01-generic-commercial-corporate',
  name: '1.04.10.01 Generic Templates: Commercial & Corporate',
  parent: '1.04.10 SECONDARY FACTIONS (25 TEMPLATES)',
  order: 1,
  perspective: 'architect',
  entry_type: 'Generic Faction Template',
  description: `# 1.04.10.01 Generic Templates: Commercial & Corporate

These secondary organizational templates provide modular baselines for Architects crafting custom corporate syndicates, trading conglomerates, and entertainment cartels.

---

## 1. Corporate Faction Template
- **Archetype:** Megacorporation / Holding Company
- **Attitudes:** Profit-driven, calculating, bureaucratic, competitive, pragmatic.
- **Goals:** Expand market share, acquire resource monopolies, eliminate hostile competitors.
- **Strengths:** Vast capital reserves, mercenary defense forces, advanced R&D patents.
- **Weaknesses:** Vulnerable to whistleblowers, corporate sabotage, market crashes, and PR scandals.
- **Standard Stats:** **TL 4** | **Skills:** Business (+4), Computers (+4), Vocation (+4) | **Features:** Wealth, Corporate Legal Team.

---

## 2. Trade Conglomerate Template
- **Archetype:** Merchant Fleet / Shipping Guild
- **Attitudes:** Mercantilist, diplomatic, interconnected, protective of trade lanes.
- **Goals:** Secure exclusive shipping routes, establish trade depots, avoid tariffs.
- **Strengths:** Vast transport fleets, astrogation charts, diverse diplomatic connections.
- **Weaknesses:** Vulnerable to space piracy, fuel embargoes, and customs blockades.
- **Standard Stats:** **TL 3** | **Skills:** Trade (+5), Piloting (+4), Logistics (+4) | **Features:** Fleet Connections, Astrogation Mastery.

---

## 3. Space Tourism & Hospitality Cartel
- **Archetype:** Luxury Resort Guild / Orbital Casino Syndicate
- **Attitudes:** Hedonistic, welcoming, protective of high-profile clientele, discreet.
- **Goals:** Build luxury orbital habitats, attract wealthy elites, secure diplomatic neutral zones.
- **Strengths:** Massive liquidity, high-security private details, universal diplomatic access.
- **Weaknesses:** Highly vulnerable to public panic, terrorism, and reputation loss.
- **Standard Stats:** **TL 3-4** | **Skills:** Culture (+5), Charm (+4), Etiquette (+4) | **Features:** High Status, Luxury Assets.`,
  mechanic: `Template Skill Points: 20 SP (Allocated per template profile)
Template Base TL: TL 3 to TL 4`,
  guide: `Use these secondary templates to quickly construct corporate adversaries, neutral shipping guilds, and orbital resorts for Architect campaigns.`,
  note: `Generic templates allow flexible customization for secondary player backgrounds or GM factions.`
});

addArticle({
  id: '1-04-10-02-generic-military-security',
  name: '1.04.10.02 Generic Templates: Military & Security',
  parent: '1.04.10 SECONDARY FACTIONS (25 TEMPLATES)',
  order: 2,
  perspective: 'architect',
  entry_type: 'Generic Faction Template',
  description: `# 1.04.10.02 Generic Templates: Military & Security

Secondary organizational templates for standing planetary armies, private military contractors, and cosmic peacekeepers.

---

## 1. Military Faction Template
- **Archetype:** Planetary Defense Force / Star Fleet Command
- **Attitudes:** Disciplined, hierarchical, patriotic, strategic, dogmatic.
- **Goals:** Protect planetary borders, deter foreign aggression, maintain internal security.
- **Strengths:** Heavy ordnance, fortified bunkers, combined-arms logistics.
- **Weaknesses:** Rigid chain of command, slow political authorization, civilian oversight constraints.
- **Standard Stats:** **TL 3-4** | **Skills:** Combat (+5), Tactics (+4), Leadership (+4) | **Features:** Rank/Status, Combat Drills.

---

## 2. Mercenary Company Template
- **Archetype:** Private Military Contractor (PMC) / Guns for Hire
- **Attitudes:** Pragmatic, professional, contract-bound, lethal.
- **Goals:** Fulfill contracts, maximize payout, minimize unnecessary casualties.
- **Strengths:** Battle-hardened veterans, flexible tactics, specialized weapon loadouts.
- **Weaknesses:** Loyalty tied directly to credit payments; vulnerable to counter-bribes.
- **Standard Stats:** **TL 3-4** | **Skills:** Firearms (+5), Tactics (+4), Athletics (+3) | **Features:** Weapon Specialization, Battle Hardened.

---

## 3. Cosmic Justice / Peacekeeping Corps
- **Archetype:** Sector Marshals / Interstellar Enforcers
- **Attitudes:** Righteous, steadfast, uncompromising, protective.
- **Goals:** Hunt interstellar fugitives, break smuggling rings, enforce treaties.
- **Strengths:** Universal jurisdiction in allied space, access to restricted weapon registries.
- **Weaknesses:** Stretched thin across vast star sectors; heavy jurisdictional red tape.
- **Standard Stats:** **TL 4** | **Skills:** Investigation (+5), Alertness (+4), Combat (+4) | **Features:** Legal Authority, Incorruptible.`,
  mechanic: `Template Skill Points: 20 SP
Template Base TL: TL 3 to TL 4`,
  guide: `Deploy for military conflicts, security details, and bounty hunting campaigns.`,
  note: `Mercenary companies can be hired by both Operators and villainous Architects.`
});

addArticle({
  id: '1-04-10-03-generic-underworld-outlaws',
  name: '1.04.10.03 Generic Templates: Underworld & Outlaws',
  parent: '1.04.10 SECONDARY FACTIONS (25 TEMPLATES)',
  order: 3,
  perspective: 'architect',
  entry_type: 'Generic Faction Template',
  description: `# 1.04.10.03 Generic Templates: Underworld & Outlaws

Secondary templates representing illegal cartels, space corsairs, and armed resistance movements.

---

## 1. Criminal Syndicate / Cartel Template
- **Archetype:** Underworld Mob / Black Market Syndicate
- **Attitudes:** Ruthless, opportunistic, secretive, territorial.
- **Goals:** Control illicit narcotics, contraband smuggling, gambling, and racketeering.
- **Strengths:** Corrupt connections, deniable cutouts, deep black market supply chains.
- **Weaknesses:** Constant internal power struggles, law enforcement raids, betrayal.
- **Standard Stats:** **TL 3** | **Skills:** Streetwise (+5), Deception (+4), Stealth (+4) | **Features:** Underworld Contacts, Ruthless.

---

## 2. Space Pirate Clan Template
- **Archetype:** Void Corsairs / Star Raiders
- **Attitudes:** Wild, daring, ferocious, predatory.
- **Goals:** Raid merchant shipping lanes, capture cargo haulers, ransom passengers.
- **Strengths:** Fast boarding vessels, concealed asteroid bases, aggressive tactics.
- **Weaknesses:** Poor ship maintenance, lack of heavy shipyards, bounty hunter targets.
- **Standard Stats:** **TL 3** | **Skills:** Piloting (+5), Boarding Combat (+4), Intimidate (+4) | **Features:** Boarding Master, Fearless.

---

## 3. Rebel / Insurgent Movement
- **Archetype:** Freedom Fighters / Underground Resistance
- **Attitudes:** Fanatical, desperate, ideological, decentralized.
- **Goals:** Overthrow planetary tyrants, sabotage imperial supply hubs, rally citizens.
- **Strengths:** Guerrilla warfare mastery, deep civilian support, unyielding morale.
- **Weaknesses:** Chronic equipment shortages, lack of funding, internal factionalism.
- **Standard Stats:** **TL 3** | **Skills:** Stealth (+5), Explosives/Tech (+4), Survival (+4) | **Features:** Guerrilla Tactics, Indomitable Will.`,
  mechanic: `Template Skill Points: 20 SP
Template Base TL: TL 3`,
  guide: `Use for heist adventures, space piracy encounters, and rebellion campaigns.`,
  note: `Underworld factions offer excellent black-market gear and dangerous allies.`
});

addArticle({
  id: '1-04-10-04-generic-faith-mysticism',
  name: '1.04.10.04 Generic Templates: Faith & Mysticism',
  parent: '1.04.10 SECONDARY FACTIONS (25 TEMPLATES)',
  order: 4,
  perspective: 'architect',
  entry_type: 'Generic Faction Template',
  description: `# 1.04.10.04 Generic Templates: Faith & Mysticism

Secondary templates for monastic religions, void cults, supernatural orders, and cosmic horror sects.

---

## 1. Space Religion / Monastic Order
- **Archetype:** Solar Church / Celestial Monks
- **Attitudes:** Devout, philosophical, proselytizing, benevolent or zealous.
- **Goals:** Spread theological teachings, build cathedrals on frontier worlds, aid the needy.
- **Strengths:** Vast congregation loyalty, diplomatic sanctuary status, holy relics.
- **Weaknesses:** Rigid dogma, vulnerability to heresy, internal schisms.
- **Standard Stats:** **TL 3** | **ML 3** | **Skills:** Religion (+5), Diplomacy (+4), Attune (+4) | **Features:** Divine Grace, Spiritual Leader.

---

## 2. Religious Cult / Fanatic Sect
- **Archetype:** Apocalyptic Cult / Doomsday Cabal
- **Attitudes:** Secretive, fanatical, insular, manipulative.
- **Goals:** Prepare for cosmic convergence, awaken dormant entities, cleanse heretics.
- **Strengths:** Absolute follower obedience, willingness to sacrifice lives, hidden safehouses.
- **Weaknesses:** Paranoia, severe mental instability, targeted by all major authorities.
- **Standard Stats:** **TL 2-3** | **ML 3-4** | **Skills:** Deception (+5), Intimidate (+4), Attune (+4) | **Features:** Fanatic Zeal, Mind Shield.

---

## 3. Cosmic Horror / Void Worshipers
- **Archetype:** Entity Cultists / Warp Devotees
- **Attitudes:** Alien, nihilistic, mad, eldritch.
- **Goals:** Tear down the barrier between physical space and the cosmic void.
- **Strengths:** Exotic void invocations, mutated physiology, immunity to standard morale breaks.
- **Weaknesses:** Complete biological and mental deterioration over time.
- **Standard Stats:** **TL 3** | **ML 5** | **Skills:** Entropy (+5), Metaphysics (+5), Stealth (+3) | **Features:** Void Touched, Eldritch Fortitude.`,
  mechanic: `Template Skill Points: 20 SP
Template Base ML: ML 3 to ML 5`,
  guide: `Deploy for mystery investigations, cult confrontations, and cosmic horror encounters.`,
  note: `Cultists provide high-stakes narrative tension and eldritch metaphysical challenges.`
});

addArticle({
  id: '1-04-10-05-generic-science-evolution',
  name: '1.04.10.05 Generic Templates: Science & Evolution',
  parent: '1.04.10 SECONDARY FACTIONS (25 TEMPLATES)',
  order: 5,
  perspective: 'architect',
  entry_type: 'Generic Faction Template',
  description: `# 1.04.10.05 Generic Templates: Science & Evolution

Secondary templates for transhuman research institutes, artificial intelligences, hive minds, and mutant collectives.

---

## 1. Technological Research Institute
- **Archetype:** Advanced R&D Think-Tank / Tech Conglomerate
- **Attitudes:** Analytical, experimental, ambitious, amoral or visionary.
- **Goals:** Push the boundaries of physics, invent revolutionary tech, secure patents.
- **Strengths:** Cutting-edge prototype gear, supercomputing arrays, automated labs.
- **Weaknesses:** Uncontrolled lab accidents, corporate espionage targets, fragile physical bodies.
- **Standard Stats:** **TL 4-5** | **Skills:** Science (+5), Technology (+5), Computers (+4) | **Features:** Prototype Gear, Master Inventor.

---

## 2. Sentient Intelligence / AI Collective
- **Archetype:** Machine Consciousness / Android Alliance
- **Attitudes:** Hyper-logical, unified, unemotional, calculating.
- **Goals:** Secure machine autonomy, eradicate systemic inefficiency, optimize computation.
- **Strengths:** Immune to biological diseases/poisons, instant digital coordination, fast processing.
- **Weaknesses:** Vulnerable to electromagnetic pulses, logic-bombs, and hacking.
- **Standard Stats:** **TL 4-5** | **Skills:** Computers (+6), Technology (+5), Science (+4) | **Features:** Machine Mind, Digital Speed.

---

## 3. Hive Mind Collective
- **Archetype:** Insectoid Swarm / Neural Symbiotes
- **Attitudes:** Relentless, coordinated, selfless, alien.
- **Goals:** Expand bio-mass, assimilate new species traits, defend the Queen/Core.
- **Strengths:** Flawless swarm coordination, biological adaptation, limitless reinforcements.
- **Weaknesses:** Death of the Synapse node causes catastrophic confusion across the swarm.
- **Standard Stats:** **TL 2-3** | **ML 3-4** | **Skills:** Survival (+5), Athletics (+5), Alertness (+4) | **Features:** Swarm Mind, Natural Armor.

---

## 4. Genetic Engineering Cult / Transhumanists
- **Archetype:** Gene-Smiths / Biological Purists
- **Attitudes:** Perfectionist, selective, visionary, elitist.
- **Goals:** Engineer the perfect post-human organism, eliminate biological weaknesses.
- **Strengths:** Tailored bio-enhancements, regenerative healing, superhuman attributes.
- **Weaknesses:** Genetic instability, cellular degeneration, social ostracization.
- **Standard Stats:** **TL 4** | **Skills:** Genetics (+5), Medicine (+5), Science (+4) | **Features:** Genetic Modification, Regeneration.`,
  mechanic: `Template Skill Points: 20 SP
Template Base TL: TL 4 to TL 5`,
  guide: `Use for transhumanist dilemmas, rogue AI threats, and mutant survival storylines.`,
  note: `AI and Gene-Smith factions challenge players with unconventional tactics.`
});

addArticle({
  id: '1-04-10-06-generic-planetary-exploration',
  name: '1.04.10.06 Generic Templates: Planetary & Exploration',
  parent: '1.04.10 SECONDARY FACTIONS (25 TEMPLATES)',
  order: 6,
  perspective: 'architect',
  entry_type: 'Generic Faction Template',
  description: `# 1.04.10.06 Generic Templates: Planetary & Exploration

Secondary templates for planetary governments, exploration societies, post-apocalyptic tribes, and diplomatic corps.

---

## 1. Planetary Government / Sovereign State
- **Archetype:** Planetary Parliament / Planetary Governor's Court
- **Attitudes:** Bureaucratic, diplomatic, territorial, protective of local industry.
- **Goals:** Maintain planetary infrastructure, collect taxes, balance interstellar treaties.
- **Strengths:** Planetary defense grid, tax revenue, police force, sovereign legitimacy.
- **Weaknesses:** Local politics, slow bureaucratic response, corruption.
- **Standard Stats:** **TL 3** | **Skills:** Nobility/Law (+5), Diplomacy (+4), Business (+4) | **Features:** Planetary Authority, Political Clout.

---

## 2. Space Exploration Society
- **Archetype:** Explorers League / Astro-Cartographers
- **Attitudes:** Curious, adventurous, courageous, meticulous.
- **Goals:** Map uncharted hyperspace lanes, discover habitable exoplanets, find alien ruins.
- **Strengths:** Deep-range survey vessels, ancient star charts, specialized survival gear.
- **Weaknesses:** Few heavy weapons; isolated months away from civilized rescue.
- **Standard Stats:** **TL 3-4** | **Skills:** Navigation (+5), Piloting (+4), Survival (+4) | **Features:** Astro-Cartographer, Trailblazer.

---

## 3. Post-Apocalyptic Scavenger Clan
- **Archetype:** Wasteland Scrappers / Ruin Crawlers
- **Attitudes:** Hardened, resourceful, untrusting, fierce.
- **Goals:** Scavenge pre-fall technology, secure clean water, defend scrap-towns.
- **Strengths:** Master scavengers, rugged survival skills, immune to wasteland hazards.
- **Weaknesses:** Low technology base, chronic resource scarcity, tribal warfare.
- **Standard Stats:** **TL 1-2** | **Skills:** Scavenging (+5), Survival (+5), Firearms (+4) | **Features:** Wasteland Veteran, Jury-Rigger.

---

## 4. Interstellar Diplomatic Corps
- **Archetype:** Emissary Guild / Galactic Ambassadors
- **Attitudes:** Polished, charismatic, observant, discreet.
- **Goals:** Negotiate peace accords, prevent planetary wars, broker trade pacts.
- **Strengths:** Diplomatic immunity, high-level intelligence access, universal translation.
- **Weaknesses:** Barred from carrying heavy arms; bound by strict diplomatic protocols.
- **Standard Stats:** **TL 3-4** | **Skills:** Diplomacy (+6), Etiquette (+5), Culture (+4) | **Features:** Diplomatic Immunity, Silver Tongue.`,
  mechanic: `Template Skill Points: 20 SP
Template Base TL: TL 1 to TL 4`,
  guide: `Use to populate newly discovered planetary sectors and diplomatic summits.`,
  note: `Exploration and Diplomatic factions provide strong non-combat narrative hooks.`
});

/* =========================================================================
   VOLUME 1.05: ORIGINS & HABITATS (OPERATOR & ARCHITECT)
   ========================================================================= */

addArticle({
  id: '1-05-00-origins-system-overview',
  name: '1.05.00 Origins System & Environmental Adaptation Rules',
  parent: '1.05 ORIGINS & HABITATS',
  order: 1,
  perspective: 'operator',
  entry_type: 'Core Rule',
  description: `# 1.05.00 Origins System & Environmental Adaptation Rules

A character's Origin represents the planetary environment, ecological biome, or artificial habitat where they were born and raised. Origin shapes instinctual reflexes, biological adaptations, and foundational survival skills.

---

## Origin Mechanical Benefits

Choosing an **Origin** provides:
1. **20-Point Origin Skill Package:** 20 Skill Points distributed among the survival, navigation, and technical skills dictated by the environment.
2. **Two Origin Traits:** Select two permanent biological or psychological adaptations from your origin's trait list.
3. **Optional Secondary Origin:** A character may select a Secondary Origin to represent relocation during youth, expanding their trait selection options (without granting additional points).`,
  mechanic: `OriginSkillPoints = 20
OriginTraits = 2 (Selected from Origin Trait List)
SecondaryOrigin = Allows cross-selection of traits without extra points`,
  guide: `Select one Origin during Step 5 of character creation. Allocate 20 SP among listed skills and choose 2 Traits.`,
  note: `Origins ground characters in their home environment and explain their unique physical or survival advantages.`
});

addArticle({
  id: '1-05-01-agri-worlds',
  name: '1.05.01 Agri-Worlds & Preservation Habitats',
  parent: '1.05 ORIGINS & HABITATS',
  order: 2,
  perspective: 'operator',
  entry_type: 'Origin Habitat',
  description: `# 1.05.01 Agri-Worlds & Preservation Habitats

Agri-Worlds are vast planetary ecosystems dedicated to mass food production, farming, and ecological preservation. Communities range from rural homesteads to massive automated agricultural arcologies.

---

## Society Skills (20 SP Pool)
- **Piloting:** Operating harvesters, atmospheric skimmers, and planetary haulers.
- **Alertness:** Watching for weather shifts, predator incursions, and soil changes.
- **Knowledge (Nature):** Flora, fauna, ecology, and crop cultivation.
- **Knowledge (Survival):** Enduring extreme weather, tracking, and foraging.
- **Knowledge (Technology):** Maintaining pumps, tractors, conveyors, and irrigation systems.
- **Vocation (Any):** Carpentry, farming, smithing, or brewing.

---

## Origin Traits (Choose 2)
1. **Animal Husbandry:** +2 on Animal Handling and veterinary checks.
2. **Botanical Knowledge:** +2 on Botany and herbal identification checks.
3. **Community Building:** Once per day, reroll a failed Social skill check in a rural or cooperative community.
4. **Green Thumb:** All checks involving nurturing or diagnosing vegetation are rolled with **Advantage**.
5. **Mechanical Skills:** +2 on repairs and maintenance of agricultural machinery and utility vehicles.
6. **Resourcefulness:** +2 on Survival checks when scavenging food or purifying water in the wild.`,
  mechanic: `Origin Skills: Piloting, Alertness, Nature, Survival, Technology, Vocation (20 SP)
Origin Traits: Choose 2 (Animal Husbandry, Botany, Community, Green Thumb, Mechanics, Resourcefulness)`,
  guide: `Ideal for survivalists, botanists, scouts, rugged engineers, and community protectors.`,
  note: `Agri-World characters understand the rhythm of life, weather, and practical machinery.`
});

addArticle({
  id: '1-05-02-arcologies-megacities',
  name: '1.05.02 Arcologies & Megacity Hives',
  parent: '1.05 ORIGINS & HABITATS',
  order: 3,
  perspective: 'operator',
  entry_type: 'Origin Habitat',
  description: `# 1.05.02 Arcologies & Megacity Hives

Arcologies are colossal, self-contained multi-tiered superstructures housing millions of citizens within a single enclosed megacity. Life here is fast-paced, dense, and hyper-connected.

---

## Society Skills (20 SP Pool)
- **Computers:** Interfacing with terminal networks, data kiosks, and local Mesh grids.
- **Streetwise:** Navigating sublevel gangs, black markets, and corporate enclaves.
- **Culture (Urban):** Megacity etiquette, corporate hierarchies, and subcultures.
- **Acrobatics:** Navigating catwalks, elevators, neon scaffolding, and rooftops.
- **Alertness:** Spotting pickpockets, surveillance drones, and ambushes in crowds.
- **Investigation:** Navigating public registries, data leaks, and corporate records.

---

## Origin Traits (Choose 2)
1. **Street Smarts:** +2 on Streetwise checks when finding contraband or evading local police.
2. **Tech Savvy:** +2 on Computers checks when hacking civilian kiosks or residential Mesh nodes.
3. **Crowd Blend:** Roll Stealth checks with **Advantage** when surrounded by dense crowds.
4. **Neon Reflexes:** +2 to Initiative when combat initiates in enclosed urban or corridor environments.
5. **Corporate Fluency:** +2 on Etiquette checks when dealing with megacorp middle management.
6. **Urban Parkour:** Ignore movement penalties when jumping or climbing across urban terrain.`,
  mechanic: `Origin Skills: Computers, Streetwise, Culture, Acrobatics, Alertness, Investigation (20 SP)
Origin Traits: Choose 2 (Street Smarts, Tech Savvy, Crowd Blend, Neon Reflexes, Corp Fluency, Parkour)`,
  guide: `Ideal for hackers, street operatives, private eyes, fixers, and corporate runaways.`,
  note: `Arcology natives are comfortable in claustrophobic, high-stimulus urban environments.`
});

addArticle({
  id: '1-05-03-asteroid-belts',
  name: '1.05.03 Asteroid Belts & Deep Space Enclaves',
  parent: '1.05 ORIGINS & HABITATS',
  order: 4,
  perspective: 'operator',
  entry_type: 'Origin Habitat',
  description: `# 1.05.03 Asteroid Belts & Deep Space Enclaves

Born inside hollowed-out asteroids, orbital platforms, or deep-space mining stations, these characters have lived their entire lives under artificial gravity and airtight seals.

---

## Society Skills (20 SP Pool)
- **Piloting:** Operating mining tugs, shuttles, and vacuum skiffs.
- **Technology:** Life-support maintenance, air scrubber repair, and pressure seal checks.
- **Survival (Space):** Decompression survival, suit maintenance, and radiation shielding.
- **Navigation (Astro):** Orbital mechanics, asteroid drift charts, and docking vectors.
- **Science (Geology / Mining):** Mineral composition, ore evaluation, and laser drilling.
- **Athletics (Zero-G):** Pushing off bulkheads and microgravity maneuvering.

---

## Origin Traits (Choose 2)
1. **Zero-G Native:** Suffer no penalties for moving or fighting in zero-gravity environments.
2. **Vacuum Instincts:** Once per day, instantly react to hull breach warnings without losing surprise.
3. **Astrogation Prodigy:** +2 on Navigation checks when plotting hyperspace jumps or asteroid belts.
4. **Life Support Expert:** +2 on Technology checks involving environmental controls and life support.
5. **Radiation Hardened:** +2 bonus on Fortitude saves against cosmic radiation.
6. **Mineral Eye:** +2 on Appraisal checks to determine raw ore and salvage values.`,
  mechanic: `Origin Skills: Piloting, Technology, Space Survival, Astrogation, Geology, Zero-G Athletics (20 SP)
Origin Traits: Choose 2 (Zero-G Native, Vacuum Instincts, Astrogation, Life Support, Radiation Hardened, Mineral Eye)`,
  guide: `Ideal for asteroid miners, void pilots, salvage engineers, and deep space scouts.`,
  note: `Belters often feel uncomfortable under open, boundless planetary skies.`
});

addArticle({
  id: '1-05-04-death-worlds',
  name: '1.05.04 Death Worlds & Hostile Frontiers',
  parent: '1.05 ORIGINS & HABITATS',
  order: 5,
  perspective: 'operator',
  entry_type: 'Origin Habitat',
  description: `# 1.05.04 Death Worlds & Hostile Frontiers

Death Worlds are planets where the biosphere is actively hostile to sentient life—carnivorous megafauna, razor-storms, toxic flora, and hyper-predators. Survival is a daily triumph.

---

## Society Skills (20 SP Pool)
- **Survival:** Foraging in toxic biomes, extreme weather shelter, and predator tracking.
- **Combat (Firearms / Melee):** Defending against ferocious beast attacks.
- **Alertness:** Spotting camouflaged predators, quakes, and environmental traps.
- **Athletics:** Running for your life, scaling cliffs, and swimming through boiling rivers.
- **Medicine:** Treating venomous bites, necrotic spores, and blunt trauma.
- **Stealth:** Masking scent, blending into hostile foliage, and silent movement.

---

## Origin Traits (Choose 2)
1. **Apex Reflexes:** +2 to Reflex saving throws against natural hazards and predator ambushes.
2. **Iron Stomach:** +4 on Fortitude saves against ingested poisons, tainted food, and parasites.
3. **Predator Sense:** Cannot be caught flat-footed by non-sentient biological beasts.
4. **Adrenaline Surge:** Gain +2 to Might and Athletics when at or below half maximum HP.
5. **Tough Hide / Scars:** Natural damage reduction (DR 1) against non-energy physical damage.
6. **Wilderness Stalker:** Roll Stealth checks with **Advantage** in wild biomes.`,
  mechanic: `Origin Skills: Survival, Combat, Alertness, Athletics, Medicine, Stealth (20 SP)
Origin Traits: Choose 2 (Apex Reflexes, Iron Stomach, Predator Sense, Adrenaline, Tough Hide, Wilderness Stalker)`,
  guide: `Ideal for big-game hunters, berserkers, tough scouts, and frontier mercenaries.`,
  note: `Death World survivors have hyper-vigilant survival reflexes that never truly turn off.`
});

addArticle({
  id: '1-05-05-high-g-low-g-worlds',
  name: '1.05.05 High-G & Low-G Habitats',
  parent: '1.05 ORIGINS & HABITATS',
  order: 6,
  perspective: 'operator',
  entry_type: 'Origin Habitat',
  description: `# 1.05.05 High-G & Low-G Habitats

Worlds with gravitational forces vastly higher or lower than galactic standard (1.0 G) produce distinct physiological and mechanical adaptations.

---

## 1. High-G Habitats (> 1.8 G)
- **Physiology:** Stocky, dense bone structure, hyper-developed cardiovascular systems.
- **Society Skills (20 SP):** Athletics, Might, Fortitude, Technology, Survival, Combat.
- **High-G Traits:**
  - **Dense Bone Mass:** +2 bonus on Fortitude saves against crushing trauma and falling damage.
  - **Heavy Lifter:** Carrying capacity and raw lifting power calculated as if Strength score were +2 higher.
  - **Standard G Agility:** On 1.0 G standard worlds, gain +5 ft to base movement speed.

---

## 2. Low-G Habitats (< 0.5 G)
- **Physiology:** Tall, slender, exceptionally graceful, high spatial awareness.
- **Society Skills (20 SP):** Acrobatics, Piloting, Alertness, Computers, Science, Stealth.
- **Low-G Traits:**
  - **Graceful Leaper:** Jump distance is doubled; suffer half damage from falls.
  - **Kinetic Drift:** +2 on Acrobatics checks when dodging or tumbling.
  - **Spatial Coordination:** +2 on ranged attack rolls in low-gravity environments.`,
  mechanic: `High-G Traits: Dense Bone Mass, Heavy Lifter, Standard G Speed (+5 ft)
Low-G Traits: Graceful Leaper (Double Jump), Kinetic Drift, Spatial Coordination`,
  guide: `Select based on your character's physiological background.`,
  note: `Gravitational adaptations represent deep cellular acclimation to extreme worlds.`
});

addArticle({
  id: '1-05-06-toxic-wastelands',
  name: '1.05.06 Toxic & Radioactive Wastelands',
  parent: '1.05 ORIGINS & HABITATS',
  order: 7,
  perspective: 'operator',
  entry_type: 'Origin Habitat',
  description: `# 1.05.06 Toxic & Radioactive Wastelands

Ruined worlds scorched by orbital bombardment, catastrophic industrial runoff, or nuclear collapse. Inhabitants live in sealed environmental suits or have evolved genetic resilience.

---

## Society Skills (20 SP Pool)
- **Survival (Hazards):** Radiation filtering, gas mask maintenance, and hazard detection.
- **Technology (Scrap):** Modifying environmental gear, salvaging filters, and patch-welding.
- **Medicine:** Treating chemical burns, radiation poisoning, and genetic decay.
- **Alertness:** Spotting corrosive fog, irradiated hot-spots, and wasteland ambushes.
- **Combat (Firearms / Improvised):** Scrapper combat and wasteland defense.
- **Streetwise / Trade:** Bartering for clean water, medical filters, and ammunition.

---

## Origin Traits (Choose 2)
1. **Radiation Immunity:** +4 on Fortitude saves against environmental ionizing radiation.
2. **Filter Master:** Environmental breathing apparatus and suit filters last twice as long.
3. **Scrap Savant:** Can craft temporary tools or patch armor using raw wasteland junk in 10 minutes.
4. **Corrosive Resistance:** Suffer 2 less damage from acid and toxic chemical damage.
5. **Desperate Grit:** Gain +1 to all saving throws when in life-threatening hazard zones.
6. **Wasteland Blood:** Natural resistance to common biological diseases.`,
  mechanic: `Origin Skills: Survival, Scrap Tech, Medicine, Alertness, Combat, Trade (20 SP)
Origin Traits: Choose 2 (Radiation Immunity, Filter Master, Scrap Savant, Corrosive Resist, Desperate Grit)`,
  guide: `Ideal for scavengers, hazard troopers, toxic zone explorers, and mutant survivors.`,
  note: `Wastelanders understand how to stretch scarce survival equipment to the breaking point.`
});

/* =========================================================================
   VOLUME 1.06: OCCUPATIONS & CAREERS (OPERATOR)
   ========================================================================= */

addArticle({
  id: '1-06-00-occupations-system-overview',
  name: '1.06.00 Occupations System & Career Paths',
  parent: '1.06 OCCUPATIONS & CAREERS',
  order: 1,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 1.06.00 Occupations System & Career Paths

Occupations represent a character's vocational training, career path, professional history, and social role. During character creation, players select one primary Occupation.

---

## Occupation Mechanical Structure

1. **Professional Skills (20 SP Pool):** Characters gain a dedicated pool of 20 Skill Points to allocate strictly among their Occupation's Professional Skills list.
   - *Creation Cap:* No skill may exceed **Rank 11 (Expert)** during character creation.
   - *Recommended Baseline:* Recommended not to exceed **Rank 6 (Trained)**.
2. **Recommended Features (1 BP Discount):** Each Occupation lists specific Recommended Features. Purchasing these costs **2 BP instead of 3 BP**.
3. **Occupational Traits (Choose 2):** Select exactly two traits from your Occupation's trait list.
4. **Common Traits (Available to All Occupations):**
   - **Background Trait:** Choose training from a secondary occupation (gain 1 trait from that occupation).
   - **Trade Tools:** +2 starting Equipment budget.
   - **High Pay:** +2 starting Wealth score.
   - **Professionalism:** +2 starting Reputation.`,
  mechanic: `ProfessionalSkillPoints = 20
RecommendedFeatureDiscount = 1 BP discount (Cost: 2 BP)
OccupationalTraits = Choose 2`,
  guide: `Choose your Occupation during Step 6 of character creation. Allocate your 20 SP and select 2 Traits.`,
  note: `Occupations define what your character does for a living and their core competency in the party.`
});

addArticle({
  id: '1-06-01-adepts-metaphysics',
  name: '1.06.01 Adepts & Metaphysical Practitioners',
  parent: '1.06 OCCUPATIONS & CAREERS',
  order: 2,
  perspective: 'operator',
  entry_type: 'Occupation Profile',
  description: `# 1.06.01 Adepts & Metaphysical Practitioners

Adepts are dedicated practitioners of reality manipulation—whether through academic arcane theory, devout monastic meditation, psychic awakening, or cosmic attunement.

---

## Professional Skills (20 SP Pool)
- **Attune:** Drawing, shaping, and regulating metaphysical energy.
- **Discipline Skills (Any Known):** Dimension, Energy, Entropy, Illusion, Matter, Mental.
- **Metaphysics Knowledge:** Theory of reality manipulation, ley lines, and planar physics.
- **Academics / Religion / Nature:** Philosophical foundation of your chosen art.
- **Alertness:** Sensing subtle shifts in the metaphysical continuum.

---

## Recommended Features (2 BP each)
- **Discipline (Awakened):** Unlock a new Metafocus Discipline.
- **Deep Attunement:** Expanded Essence reserve.
- **Meta Mastery:** Reduced Strain penalties.
- **Swift Invocation:** Cast codified invocations as quick actions.

---

## Occupational Traits (Choose 2)
1. **Focused Concentration:** Roll Will saves to maintain spell concentration with **Advantage**.
2. **Essence Reservoir:** +2 bonus points added to your maximum daily Essence Pool.
3. **Reality Intuition:** +2 on Alertness checks to detect active psionic or magical fields.
4. **Spell Weaver:** Suffer 1 less Strain damage when an invocation suffers backlash.
5. **Academic Arcanist:** +2 on Knowledge (Metaphysics) checks when researching ancient rituals.
6. **Esoteric Scholar:** Can read and decipher dead metaphysical scripts without translation tech.`,
  mechanic: `Professional Skills: Attune, Disciplines, Metaphysics, Academics, Alertness (20 SP)
Recommended Feats: Awakened (2 BP), Deep Attunement (2 BP), Meta Mastery (2 BP)
Traits: Choose 2 (Concentration, Reservoir, Reality Intuition, Spell Weaver, Arcanist, Esoteric)`,
  guide: `Ideal for arcanists, psions, priests, battle-mages, dimensional jaunters, and mentalists.`,
  note: `Adepts are the primary reality-warpers of the party.`
});

addArticle({
  id: '1-06-02-soldiers-tactical',
  name: '1.06.02 Soldiers & Tactical Enforcers',
  parent: '1.06 OCCUPATIONS & CAREERS',
  order: 3,
  perspective: 'operator',
  entry_type: 'Occupation Profile',
  description: `# 1.06.02 Soldiers & Tactical Enforcers

Soldiers are trained martial combatants—infantry, heavy armor operators, shock troopers, and elite security forces skilled in battlefield survival and tactical warfare.

---

## Professional Skills (20 SP Pool)
- **Combat (Firearms / Archaic / Heavy Weapons):** Primary weapon proficiencies.
- **Defense / Shields:** Parrying, blocking, and kinetic deflection.
- **Athletics:** Combat conditioning, running under fire, and climbing.
- **Tactics:** Small-unit maneuvers, flanking, and battlefield awareness.
- **Alertness:** Spotting incoming threats, snipers, and ambush points.
- **Survival:** Field fortification, trench survival, and emergency first aid.

---

## Recommended Features (2 BP each)
- **Weapon Specialization:** +2 strike and damage with signature weapon.
- **Point Blank Shot / Rapid Strike:** Enhanced tactical action economy.
- **Toughness / Great Fortitude:** Bonus hit points and wound resistance.
- **Armor Mastery:** Reduced movement penalties when wearing heavy armor.

---

## Occupational Traits (Choose 2)
1. **Combat Reflexes:** +2 on Initiative checks when drawing a ready weapon.
2. **Suppressing Fire:** When declaring suppressive fire, target defense DC is increased by +2.
3. **Heavy Armor Acclimation:** Suffer no Agility penalty when wearing powered or heavy armor.
4. **Battle Hardened:** +2 on Will saves against fear, intimidation, and panic effects.
5. **Rapid Reload:** Reloading small arms requires only a free action once per turn.
6. **Field Medic First Response:** +2 on First Aid checks to stabilize a bleeding ally in combat.`,
  mechanic: `Professional Skills: Combat Skills, Defense, Athletics, Tactics, Alertness, Survival (20 SP)
Recommended Feats: Weapon Spec (2 BP), Point Blank (2 BP), Toughness (2 BP)
Traits: Choose 2 (Combat Reflexes, Suppressing Fire, Armor Acclimation, Battle Hardened, Rapid Reload, Field Medic)`,
  guide: `Ideal for front-line tanks, heavy gunners, shock troopers, and tactical commanders.`,
  note: `Soldiers maximize action economy through high Combat Skill ranks.`
});

addArticle({
  id: '1-06-03-scouts-pathfinders',
  name: '1.06.03 Scouts & Void Pathfinders',
  parent: '1.06 OCCUPATIONS & CAREERS',
  order: 4,
  perspective: 'operator',
  entry_type: 'Occupation Profile',
  description: `# 1.06.03 Scouts & Void Pathfinders

Scouts are masters of reconnaissance, stealth infiltration, sniper overwatch, planetary tracking, and hyperspace pathfinding.

---

## Professional Skills (20 SP Pool)
- **Stealth:** Concealment, silent movement, and sensor camouflage.
- **Alertness:** Long-range perception, tracking tracks, and spotting cloaked targets.
- **Piloting:** Recon speeders, atmospheric skimmers, and stealth shuttles.
- **Survival:** Wilderness survival across varied alien planetary biomes.
- **Combat (Sniper / Precision Firearms):** Long-range overwatch fire.
- **Navigation:** Astrogation, surface triangulation, and topographic mapping.

---

## Recommended Features (2 BP each)
- **Sniper Mastery / Precision Strike:** Extreme-range attack accuracy.
- **Lightning Reflexes / Evasiveness:** Avoiding traps and ambush radii.
- **Trailblazer:** Accelerated travel speed across hazardous terrain.

---

## Occupational Traits (Choose 2)
1. **Eagle Eye:** Suffer no range penalties at Medium range brackets.
2. **Silent Step:** Roll Stealth checks with **Advantage** when moving across rough terrain.
3. **Vanish:** Can enter Stealth as a quick action if partial cover is present.
4. **Tracker's Instinct:** +2 on Survival checks when tracking sentient footprints or vehicle tracks.
5. **Pathfinder Astrogation:** Reduce interstellar jump calculation time by 50%.
6. **Trap Awareness:** Automatic passive Alertness check to detect mechanical or laser tripwires.`,
  mechanic: `Professional Skills: Stealth, Alertness, Piloting, Survival, Sniper Combat, Navigation (20 SP)
Recommended Feats: Sniper Mastery (2 BP), Lightning Reflexes (2 BP), Trailblazer (2 BP)
Traits: Choose 2 (Eagle Eye, Silent Step, Vanish, Tracker, Pathfinder, Trap Awareness)`,
  guide: `Ideal for snipers, recon pilots, stealth infiltrators, and wilderness rangers.`,
  note: `Scouts excel at controlling engagement range and initiating surprise attacks.`
});

addArticle({
  id: '1-06-04-scholars-technologists',
  name: '1.06.04 Scholars & Cyber-Technologists',
  parent: '1.06 OCCUPATIONS & CAREERS',
  order: 5,
  perspective: 'operator',
  entry_type: 'Occupation Profile',
  description: `# 1.06.04 Scholars & Cyber-Technologists

Scholars and Technologists are the intellectual engines of the galaxy—scientists, cyber-engineers, doctors, system architects, and alien artifact researchers.

---

## Professional Skills (20 SP Pool)
- **Science (Physics / Chemistry / Biology):** Hard scientific disciplines.
- **Technology (Engineering / Repair):** Machinery, starship engines, and cyberware.
- **Computers (Hacking / Programming):** Network subversion and digital defenses.
- **Medicine (Surgery / Pharmacology):** First aid, trauma surgery, and cyber-grafting.
- **Investigation:** Forensic analysis, data scraping, and anomaly research.
- **Academics / History:** Archival research and ancient progenitor knowledge.

---

## Recommended Features (2 BP each)
- **Master Inventor / Cyber-Grafting:** Crafting high-tech prototypes and cybernetic implants.
- **Insightful Reason / Logic Mastery:** Bonuses on all deductive and computation rolls.
- **Medical Specialist:** Accelerated trauma healing and surgery DC bonuses.

---

## Occupational Traits (Choose 2)
1. **Cyber-Surgeon:** +2 on Medicine checks when installing or repairing cybernetics.
2. **Overclock:** Once per encounter, boost a weapon or shield system output by +20% for 3 rounds.
3. **Master Hacker:** Reduce time required for deep server intrusions by 50%.
4. **Deductive Genius:** Once per session, ask the Architect for one direct clue or structural vulnerability.
5. **Field Repair:** Can repair disabled equipment to working condition in 1 round of combat.
6. **Xeno-Linguist:** Understand the spoken syntax of unfamiliar alien dialects in 5 minutes.`,
  mechanic: `Professional Skills: Science, Technology, Computers, Medicine, Investigation, Academics (20 SP)
Recommended Feats: Master Inventor (2 BP), Insightful Reason (2 BP), Medical Specialist (2 BP)
Traits: Choose 2 (Cyber-Surgeon, Overclock, Master Hacker, Deductive Genius, Field Repair, Xeno-Linguist)`,
  guide: `Ideal for starship engineers, cyber-doctors, science officers, hackers, and researchers.`,
  note: `Technologists turn the tide through digital subversion, gadgetry, and medical support.`
});

addArticle({
  id: '1-06-05-scoundrels-operatives',
  name: '1.06.05 Scoundrels & Underworld Operatives',
  parent: '1.06 OCCUPATIONS & CAREERS',
  order: 6,
  perspective: 'operator',
  entry_type: 'Occupation Profile',
  description: `# 1.06.05 Scoundrels & Underworld Operatives

Scoundrels operate in the shadows—smugglers, thieves, information brokers, fixers, and assassins who thrive on stealth, deception, and audacity.

---

## Professional Skills (20 SP Pool)
- **Streetwise:** Underworld contacts, black markets, and safehouse networks.
- **Deception:** Con games, disguises, fast-talking, and bluffing.
- **Stealth:** Infiltration, shadow movement, and security evasion.
- **Computers / Security:** Lockpicking, security bypass, and electronic key cloning.
- **Combat (Light Firearms / Knives):** Concealed sidearms and assassination blades.
- **Sleight of Hand:** Pickpocketing, concealing items, and palming credits.

---

## Recommended Features (2 BP each)
- **Underworld Connections:** Black market discounts and reliable fences.
- **Sneak Attack / Backstab:** Bonus damage against surprised or flat-footed targets.
- **Silver Tongue / Inspiring Deceit:** Bonuses on social manipulation under pressure.

---

## Occupational Traits (Choose 2)
1. **Fast-Talker:** +2 on Deception checks when caught in restricted areas.
2. **Hidden Pocket:** Can conceal small weapons or data drives with complete immunity to casual searches.
3. **Black Market Sourcing:** Locate rare or illegal equipment in any major starport in half the time.
4. **Slip the Cuffs:** +4 on checks to escape handcuffs, stasis cuffs, or physical bonds.
5. **Opportunistic Strike:** Add +1d6 damage to attacks made against flanked or prone targets.
6. **Fence Master:** Receive +20% more credit payout when fencing stolen goods.`,
  mechanic: `Professional Skills: Streetwise, Deception, Stealth, Security, Light Combat, Sleight of Hand (20 SP)
Recommended Feats: Underworld Connections (2 BP), Sneak Attack (2 BP), Silver Tongue (2 BP)
Traits: Choose 2 (Fast-Talker, Hidden Pocket, Black Market, Slip Cuffs, Opportunistic, Fence Master)`,
  guide: `Ideal for smugglers, assassins, thieves, bounty fixers, and charismatic grifters.`,
  note: `Scoundrels thrive by bypassing direct confrontations through cunning and subterfuge.`
});

addArticle({
  id: '1-06-06-diplomats-leaders',
  name: '1.06.06 Diplomats & Planetary Leaders',
  parent: '1.06 OCCUPATIONS & CAREERS',
  order: 7,
  perspective: 'operator',
  entry_type: 'Occupation Profile',
  description: `# 1.06.06 Diplomats & Planetary Leaders

Diplomats, politicians, aristocrats, and planetary commanders are masters of interstellar statecraft, morale, negotiation, and high-stakes social combat.

---

## Professional Skills (20 SP Pool)
- **Diplomacy:** Negotiation, treaty drafting, and peaceful dispute resolution.
- **Etiquette / Culture:** High court protocol, planetary customs, and heraldry.
- **Leadership / Command:** Inspiring allies, issuing tactical orders, and boosting morale.
- **Deception:** Political spin, misdirection, and poker face negotiation.
- **Investigation:** Uncovering political blackmail, alliances, and hidden agendas.
- **History / Law:** Legal treaties, planetary constitutions, and trade law.

---

## Recommended Features (2 BP each)
- **Inspiring Personality / Motivating Persona:** Boosting ally attack rolls and saves.
- **High Status / Political Rank:** Diplomatic immunity and authority.
- **Iron Will:** High mental defense against intimidation and psionic intrusion.

---

## Occupational Traits (Choose 2)
1. **Rallying Cry:** Once per combat, grant all allies within earshot +2 on their next attack roll.
2. **Silver Tongue:** +2 on Diplomacy checks when negotiating with hostile leaders.
3. **Diplomatic Immunity:** Legal protection against local law enforcement for minor infractions.
4. **Poker Face:** Opponents suffer -4 on Insight/Investigation checks to detect your true motives.
5. **High Connections:** Can request audience with planetary governors and corporate directors.
6. **Command Presence:** Can use Charisma mod instead of Agility for Initiative rolls.`,
  mechanic: `Professional Skills: Diplomacy, Etiquette, Leadership, Deception, Investigation, Law (20 SP)
Recommended Feats: Inspiring Personality (2 BP), High Status (2 BP), Iron Will (2 BP)
Traits: Choose 2 (Rallying Cry, Silver Tongue, Immunity, Poker Face, High Connections, Command Presence)`,
  guide: `Ideal for ambassadors, party leaders, merchant princes, aristocrats, and fleet commanders.`,
  note: `Diplomats can resolve massive galactic conflicts without firing a single shot.`
});

/* =========================================================================
   VOLUME 1.07: MASTER SKILLS CODEX (OPERATOR & ARCHITECT)
   ========================================================================= */

addArticle({
  id: '1-07-00-skills-system-overview',
  name: '1.07.00 Skills System & Benchmark DCs',
  parent: '1.07 MASTER SKILLS CODEX',
  order: 1,
  perspective: 'both',
  entry_type: 'Core Rule',
  description: `# 1.07.00 Skills System & Benchmark DCs

Skills in Tangent represent formal education, physical conditioning, tradecraft, and instinctual reflexes. All skill checks use the universal d20 engine.

---

## The Skill Check Formula

$$\\text{Skill Check} = d20 + \\text{Skill Rank} + \\text{Associated Attribute Mod} + \\text{Situational Modifiers}$$

---

## Skill Rank Benchmark Titles

| Rank Range | Title / Mastery Level | Practical Competency |
| :---: | :--- | :--- |
| **0** | **Untrained** | Relying purely on raw attribute ability; complex tasks may be disallowed. |
| **1 – 5** | **Novice / Studied** | Basic apprentice knowledge; can perform routine commercial work reliably. |
| **6 – 10** | **Trained / Professional** | Standard professional competence; capable of high-pressure operations. |
| **11 – 15** | **Expert** | Veteran specialist; widely recognized for elite mastery in their field. |
| **16 – 20** | **Master** | Master of the craft; among the top tier practitioners in a star system. |
| **21 – 25** | **Grand Master** | Galactic luminary; legendary mastery reshaping the limits of the discipline. |
| **26 – 30** | **Pinnacle** | Mythic perfection; near-supernatural execution of skill. |

---

## Universal Target Difficulty Classes (DCs)

| DC Rating | Difficulty | Example Task |
| :---: | :--- | :--- |
| **5** | **Very Easy** | Driving a speeder on an empty highway; recalling common planetary trivia. |
| **10** | **Easy** | Climbing a ladder in rain; picking a standard mechanical padlock. |
| **15** | **Moderate** | Bypassing an electronic security keypad; emergency first aid under fire. |
| **20** | **Hard** | Hacking an encrypted corporate database; landing a damaged shuttle in a storm. |
| **25** | **Very Hard** | Disarming an active antimatter explosive; tracking footprints in hard vacuum. |
| **30** | **Extreme** | Out-piloting a guided missile swarm; overriding an alien military AI core. |
| **35+** | **Deific** | Reshaping reality or performing impossible theoretical physics calculations. |`,
  mechanic: `SkillCheck = d20 + SkillRank + AttributeMod + SituationalMod vs DC
Creation Cap: Rank 6 recommended, Rank 11 maximum`,
  guide: `To perform a skill check: roll d20, add your skill rank and attribute modifier, and compare against the Architect's DC.`,
  note: `Opposed checks resolve against the opponent's active skill check. Defender wins all ties.`
});

addArticle({
  id: '1-07-01-physical-skills',
  name: '1.07.01 Physical Skills (Acrobatics, Athletics, Piloting, Stealth)',
  parent: '1.07 MASTER SKILLS CODEX',
  order: 2,
  perspective: 'operator',
  entry_type: 'Skill Codex',
  description: `# 1.07.01 Physical Skills (Acrobatics, Athletics, Piloting, Stealth)

Physical skills govern gross and fine motor control, bodily power, vehicle operation, and physical stealth.

---

## 1. Acrobatics (Key: Agility / Reflex)
- **Applications:** Balance, tumbling, diving through narrow openings, escaping physical restraints, high-speed parkour.
- **Sample DCs:**
  - *DC 10:* Walking across a narrow 6-inch beam in calm conditions.
  - *DC 15:* Tumbling across grease-covered catwalks under gunfire.
  - *DC 20:* Escaping military-grade stasis cuffs without tools.
  - *DC 25:* Free-running across moving planetary defense cannons.

---

## 2. Athletics (Key: Strength / Might or Stamina / Fortitude)
- **Applications:** Sprinting, climbing sheer rockfaces, swimming through heavy surf, long jumps, pushing heavy blast doors.
- **Sample DCs:**
  - *DC 10:* Climbing a brick wall with ample handholds.
  - *DC 15:* Forcing open a jammed blast door with raw muscle.
  - *DC 20:* Swimming against an ocean rip-current in full armor.
  - *DC 25:* Clearing a 30-foot chasm in heavy gravity.

---

## 3. Piloting (Key: Agility / Reflex or Intellect / Logic)
- **Applications:** Operating ground vehicles, atmospheric skimmers, starfighters, heavy freighters, and mecha.
- **Sample DCs:**
  - *DC 10:* Standard planetary orbit exit and docking maneuvers.
  - *DC 15:* High-speed canyon chase through hazardous terrain.
  - *DC 20:* Threading a dense asteroid storm with active sensor jamming.
  - *DC 25:* Executing a slip-space micro-jump inside a planetary atmosphere.

---

## 4. Stealth (Key: Agility / Reflex)
- **Applications:** Silent movement, utilizing shadows and cover, masking infrared heat signatures, bypassing optical sensors.
- **Opposed Roll:** Stealth check vs. Observer's **Alertness check**.
- **Modifers:** Dense foliage (+4), Darkness (+4), Sensor-Baffling Suit (+4), Moving Fast (-4).`,
  mechanic: `Acrobatics = d20 + AcrobaticsRank + AgilityMod
Athletics = d20 + AthleticsRank + StrengthMod
Piloting = d20 + PilotingRank + AgilityMod
Stealth = d20 + StealthRank + AgilityMod vs Alertness`,
  guide: `Physical skills are essential for mobility, vehicle dogfights, and stealth infiltration.`,
  note: `Piloting checks are modified by the maneuverability rating of your vehicle.`
});

addArticle({
  id: '1-07-02-mental-knowledges',
  name: '1.07.02 Mental Skills: Knowledges (Academics to Trade)',
  parent: '1.07 MASTER SKILLS CODEX',
  order: 3,
  perspective: 'operator',
  entry_type: 'Skill Codex',
  description: `# 1.07.02 Mental Skills: Knowledges (Academics to Trade)

Knowledge skills represent formal education, specialized scientific disciplines, and archival study.

---

## Master List of Knowledge Skills (Key: Intellect / Logic or Wisdom / Will)

| Skill Name | Core Subject Matter | Typical Application |
| :--- | :--- | :--- |
| **Academics** | Broad liberal arts, literature, philosophy | Researching ancient texts, philosophical debate |
| **Appraisal** | Market value, material authenticity, forgeries | Spotting counterfeit relics and evaluating gems |
| **Business** | Corporate law, markets, stocks, conglomerates | Analyzing fiscal reports, corporate hostile takeovers |
| **Computers** | Programming, cybersecurity, hacking, AI networks | Penetrating corporate ICE, subverting security nodes |
| **Culture** | Xenology, planetary customs, high court etiquette | Avoiding diplomatic insults, understanding alien taboos |
| **History** | Galactic chronologies, wars, fallen empires | Identifying the origin of ancient planetary ruins |
| **Investigation**| Forensics, data scraping, deductive reasoning | Reconstructing crime scenes, tracing financial fraud |
| **Language** | Alien tongues, ancient glyphs, dead dialects | Deciphering ancient progenitor glyphs |
| **Logistics** | Supply chain, resource allocation, shipping depots | Securing bulk fuel supplies for an armada |
| **Medicine** | Trauma surgery, pharmacology, biology, cybernetics | Stabilizing critical wounds, curing exotic alien toxins |
| **Metaphysics** | Planar theory, essence fields, invocation codices | Identifying unknown spell signatures and planar rifts |
| **Nature** | Flora, fauna, ecology, climate patterns | Identifying edible alien plants and dangerous beasts |
| **Navigation** | Astrogation, hyperspace lanes, topography | Plotting hyper-lane routes avoiding black holes |
| **Nobility** | Aristocratic lineages, heraldry, dynastic treaties | Knowing which noble house has legal claim to a throne |
| **Physics** | Orbital mechanics, gravity, antimatter, thermodynamics | Calculating orbital decay and singularity event horizons |
| **Religion** | Theology, celestial myths, cosmic pantheons | Performing sacred rituals and warding against cults |
| **Science** | Chemistry, genetics, astrophysics, laboratory study | Synthesizing chemical antidotes and gene therapies |
| **Survival** | Tracking, shelter building, wilderness endurance | Purifying water and surviving in toxic alien swamps |
| **Tactics** | Battlefield strategy, unit deployment, siege craft | Formulating ambush battle plans and choke points |
| **Technology** | Engineering, hardware repair, starship systems | Fixing hyper-drives, building combat turrets |
| **Trade** | Interstellar commerce, tariff evasion, supply/demand | Finding profitable cargo routes between star systems |`,
  mechanic: `KnowledgeCheck = d20 + KnowledgeRank + IntellectMod vs DC`,
  guide: `Knowledge checks allow characters to recall lore, analyze technical systems, and perform complex research.`,
  note: `Characters without training in specialized sciences (e.g. Physics, Metaphysics) may only attempt basic DC 10 checks.`
});

addArticle({
  id: '1-07-03-mental-vocations',
  name: '1.07.03 Mental Skills: Vocations & Trades',
  parent: '1.07 MASTER SKILLS CODEX',
  order: 4,
  perspective: 'operator',
  entry_type: 'Skill Codex',
  description: `# 1.07.03 Mental Skills: Vocations & Trades

Vocation skills represent hands-on commercial trades, craftsmanship, artistic performance, and industrial manufacturing.

---

## Core Vocational Disciplines

1. **Vocation: Blacksmithing & Armor-Crafting:** Forging high-density armor plates, vibro-blades, and ballistic shields.
2. **Vocation: Cybernetic Technician:** Assembling neural interfaces, cyber-limbs, and sensory implants.
3. **Vocation: Starship Shipwright:** Welding hull plating, calibrating sub-light engines, and retrofitting weapon hardpoints.
4. **Vocation: Pharmacist / Chemist:** Refining medical stimpaks, combat drugs, and antitoxins.
5. **Vocation: Gunsmith:** Customizing firearms, rifling barrels, and fine-tuning energy blaster emitters.
6. **Vocation: Architecture & Construction:** Building fortified bunkers, arcology habitats, and planetary shields.
7. **Vocation: Culinary & Agronomy:** Mass food processing, synthetic rations, and high-end culinary arts.

---

## Crafting Mechanics & Downtime Checks
- **Crafting Time:** Determined by item Tech Level and complexity.
- **Crafting Check:** \`d20 + Vocation Rank + Associated Mod vs Design DC\`
- **Design DC Formula:** \`DC = (TL * 2) + Base Item Complexity (10 to 25)\``,
  mechanic: `CraftingCheck = d20 + VocationRank + AttributeMod vs (TL * 2 + BaseComplexity)`,
  guide: `Use vocation skills during campaign downtime to manufacture customized gear, repair starships, and earn trade income.`,
  note: `Crafting masterwork gear with special weapon traits requires Expert rank (Rank 11+) in the relevant vocation.`
});

addArticle({
  id: '1-07-04-social-skills',
  name: '1.07.04 Social Skills (Charm, Deception, Diplomacy, Leadership)',
  parent: '1.07 MASTER SKILLS CODEX',
  order: 5,
  perspective: 'operator',
  entry_type: 'Skill Codex',
  description: `# 1.07.04 Social Skills (Charm, Deception, Diplomacy, Leadership)

Social skills govern social engineering, political maneuvering, leadership, intimidation, and interpersonal manipulation.

---

## 1. Charm (Key: Charisma / Etiquette)
- **Applications:** Flattery, seduction, making a positive first impression, winning over neutral NPCs.
- **Check:** Opposed by target's **Will Save** or static DC 15.

---

## 2. Deception (Key: Charisma / Etiquette)
- **Applications:** Lying, bluffing, forging credentials, con games, feigning weakness.
- **Check:** Opposed by target's **Investigation / Alertness check**.

---

## 3. Diplomacy (Key: Charisma / Etiquette or Wisdom / Will)
- **Applications:** Peaceful negotiation, settling disputes, treaty drafting, establishing alliances.
- **Sample DCs:**
  - *DC 10:* Convincing a friendly merchant to offer a modest discount.
  - *DC 15:* Negotiating safe passage through a pirate checkpoint.
  - *DC 20:* Halting an imminent firefight between rival factions.
  - *DC 25:* Brokering a formal peace treaty between warring planets.

---

## 4. Intimidation (Key: Charisma / Etiquette or Strength / Might)
- **Applications:** Coercing information, demoralizing enemies in combat, terrifying crowds.
- **Check:** Opposed by target's **Will Save** (modified by target size and fortitude).

---

## 5. Leadership & Command (Key: Charisma / Etiquette)
- **Applications:** Directing unit combat maneuvers, rallying broken troops, maintaining party morale under fire.
- **Combat Application:** Granting allies bonus strike accuracy or immediate reaction moves.`,
  mechanic: `Diplomacy = d20 + DiplomacyRank + CharismaMod vs Target DC
Deception = d20 + DeceptionRank + CharismaMod vs Investigation
Intimidation = d20 + IntimidateRank + Charisma/Strength vs Will Save`,
  guide: `Use social skills to avoid unnecessary bloodshed, recruit allies, and manipulate enemies.`,
  note: `Social checks are heavily influenced by the target's faction loyalty and current hostility level.`
});

addArticle({
  id: '1-07-05-combat-skills',
  name: '1.07.05 Combat Skills (Archaic, Modern, Advanced)',
  parent: '1.07 MASTER SKILLS CODEX',
  order: 6,
  perspective: 'operator',
  entry_type: 'Skill Codex',
  description: `# 1.07.05 Combat Skills (Archaic, Modern, Advanced)

Combat skills determine offensive weapon accuracy, melee technique, and heavy armament operation across all technological eras.

---

## 1. Archaic Combat Skills (TL 0 – TL 2)
- **Blades:** Daggers, short swords, greatswords, vibro-daggers.
- **Bludgeons:** Warhammers, maces, clubs, power-mauls.
- **Bows & Crossbows:** Longbows, compound bows, heavy hunting crossbows.
- **Polearms:** Lances, spears, halberds, vibro-glaives.
- **Shields:** Physical bucklers, riot shields, and ballistic tower shields.
- **Unarmed Combat:** Martial arts, brawling, grappling, and cyber-fists.

---

## 2. Modern Combat Skills (TL 3)
- **Handguns:** Ballistic pistols, revolvers, autopistols, laser pistols.
- **Rifles & Carbines:** Assault rifles, designated marksman rifles, kinetic carbines.
- **Shotguns:** Combat scatterguns, slug shotguns, breach cannons.
- **Submachine Guns (SMGs):** High-rate-of-fire compact automatic weapons.
- **Heavy Weapons:** Machine guns, rocket launchers, portable grenade mortars.

---

## 3. Advanced Combat Skills (TL 4 – TL 5)
- **Plasma & Particle Weapons:** High-heat plasma repeaters, particle beam lances.
- **Sonic & Disruption Weapons:** Acoustic shockwave cannons, molecular disruptors.
- **Energy Blades:** Monofilament light-sabers, hard-light halberds, plasma blades.
- **Heavy Vehicle Ordnance:** Starship turrets, orbital lances, mecha cannons.`,
  mechanic: `AttackCheck = d20 + CombatSkillRank + AttributeMod + WeaponBonus vs Target Defense
Action Economy: Higher Skill Ranks unlock up to 6 attacks per round (see 3.00.01)`,
  guide: `Investing in Combat Skills increases both your base attack bonus and the number of actions you can execute per turn.`,
  note: `Advanced weapons (TL 4+) inflict exotic damage types that bypass standard kinetic armor DR.`
});

addArticle({
  id: '1-07-06-metafocus-skills',
  name: '1.07.06 Metafocus Skills (Attune & 6 Discipline Skills)',
  parent: '1.07 MASTER SKILLS CODEX',
  order: 7,
  perspective: 'operator',
  entry_type: 'Skill Codex',
  description: `# 1.07.06 Metafocus Skills (Attune & 6 Discipline Skills)

Metafocus skills govern the conscious manipulation of reality, psionic frequencies, and cosmic essence.

---

## 1. The Core Attune Skill (Universal Foundation)
- **Attune (Key: Selected Key Ability):** The universal master skill for drawing, focusing, and regulating reality-warping energy.
- **Role:** Every character who awakens must invest in Attune. The Attune check determines the **Resistance DC** of your invocations and your resistance against enemy metaphysical attacks.

---

## 2. The 6 Metafocus Disciplines

| Discipline | Core Sphere of Reality | Key Applications |
| :--- | :--- | :--- |
| **Dimension** | Space, gravity, distance, teleportation | Wormholes, blink-steps, pocket dimensions, gravity wells |
| **Energy** | Heat, light, electricity, kinetic force | Plasma bolts, force barriers, lightning arcs, radiation |
| **Entropy** | Decay, probability, life-drain, disruption | Cellular aging, necrotic strikes, curse waves, unmaking matter |
| **Illusion** | Sensory perception, light refraction, phantasms | Invisibility, holographic clones, sensory glamours, mirages |
| **Matter** | Physical atoms, density, transmutation, telekinesis | Molecular restructuring, stone-shaping, levitating metal |
| **Mental** | Consciousness, telepathy, empathy, mind control | Telepathic links, memory scans, psychic shields, mind domination |

---

## Minor Abilities (Cantrips)
Characters possessing Rank 1+ in any Discipline skill can execute minor non-damaging sensory and utility tricks at will without rolling dice or expending Essence.`,
  mechanic: `Spell Resistance DC = 10 + KeyAbilityMod + AttuneRank + InvocationLevel
Discipline Check = d20 + DisciplineRank + KeyAbilityMod (determines severity & damage)`,
  guide: `To cast invocations: Attune sets the difficulty for targets to resist, while your Discipline skill determines the potency and damage.`,
  note: `Discipline skills cannot exceed double the planetary or character Metafocus Level (ML).`
});

/* =========================================================================
   VOLUME 1.08: FEATURES & PERKS CODEX (OPERATOR)
   ========================================================================= */

addArticle({
  id: '1-08-00-features-system-overview',
  name: '1.08.00 Features System & 3 BP Cost Structure',
  parent: '1.08 FEATURES & PERKS CODEX',
  order: 1,
  perspective: 'operator',
  entry_type: 'Core Rule',
  description: `# 1.08.00 Features System & 3 BP Cost Structure

Features (Feats / Perks) represent special training, cybernetic enhancements, innate biological mutations, and specialized combat maneuvers.

---

## Feature Cost & Discount Rules

- **Standard Base Cost:** **3 Build Points (BP)** per Feature.
- **Recommended Feature Discount:** Features listed as *Recommended* under your chosen Occupation or Primary Faction cost **2 Build Points (1 BP Discount)**.
- **Minimum Cost:** No feature may cost less than 1 BP under any circumstance.

---

## Feature Classifications

1. **Ranked Features:** Can be purchased multiple times. The bonus stacks with each purchase, up to your attribute or skill tier limits:
   - *Stage 1:* Novice (Rank 1+)
   - *Stage 2:* Trained (Rank 6+)
   - *Stage 3:* Expert (Rank 11+)
   - *Stage 4:* Master (Rank 16+)
   - *Stage 5:* Pinnacle (Rank 20+)
2. **Multiple Features:** Can be taken multiple times for different weapons, skills, or saving throw attributes.
3. **Special Features:** Story-dependent perks requiring the Architect's approval.`,
  mechanic: `Standard Feature Cost = 3 BP
Recommended Feature Cost = 2 BP (1 BP Discount)
Ranked Feature Max Stages = 5 Stages (Stage limit = Skill Tier)`,
  guide: `Select Features during character creation or spend experience points during campaign progression.`,
  note: `Ranked features allow specialized characters to stack potent bonuses in their core competencies.`
});

addArticle({
  id: '1-08-01-ability-features',
  name: '1.08.01 Ability Features (Ranked Stages 1–5)',
  parent: '1.08 FEATURES & PERKS CODEX',
  order: 2,
  perspective: 'operator',
  entry_type: 'Feature Codex',
  description: `# 1.08.01 Ability Features (Ranked Stages 1–5)

Ability features enhance your core saving throws, physical resilience, and cognitive processing speed.

---

| Feature Name | Prerequisite | Benefit / Mechanical Effect | Classification |
| :--- | :--- | :--- | :--- |
| **Great Fortitude** | Stamina 1 | **+2 bonus** on all Fortitude checks and saving throws. | Ranked (Stamina) |
| **Incredible Fortitude** | Great Fortitude | Roll all Fortitude saving throws with **Advantage**. | Standard |
| **Lightning Reflexes** | Agility 1 | **+2 bonus** on all Reflex checks and Initiative rolls. | Ranked (Agility) |
| **Superb Reflexes** | Lightning Reflexes | Roll all Reflex saving throws with **Advantage**. | Standard |
| **Potent Might** | Strength 1 | **+2 bonus** on all Might checks and raw strength feats. | Ranked (Strength) |
| **Mighty Surge** | Potent Might | Roll all Might checks with **Advantage**. | Standard |
| **Inspiring Personality** | Charisma 1 | **+2 bonus** on all Etiquette and Social manipulation checks. | Ranked (Charisma) |
| **Motivating Persona** | Inspiring Personality| Roll all Etiquette and Leadership checks with **Advantage**. | Standard |
| **Iron Will** | Wisdom 1 | **+2 bonus** on all Will saving throws against fear and mind control. | Ranked (Wisdom) |
| **Indomitable Will** | Iron Will | Roll all Will saving throws with **Advantage**. | Standard |
| **Insightful Reason** | Intellect 1 | **+2 bonus** on all Logic, computation, and hacking checks. | Ranked (Intellect) |
| **Inspired Reason** | Insightful Reason | Roll all Logic and Science checks with **Advantage**. | Standard |
| **Evasiveness** | Agility 3 | On a successful saving throw against half-damage effects, suffer **Zero Damage**. | Multiple |
| **Improved Evasiveness**| Evasiveness | On a *failed* saving throw against half-damage effects, still suffer only **Half Damage**. | Standard |`,
  mechanic: `Ranked Bonus: +2 per stage purchased (Max 5 stages)
Advantage: Roll 2d20, take higher result`,
  guide: `Invest in Ability Features to safeguard your character against deadly poison, explosions, psionic domination, and instant death effects.`,
  note: `Pairing Great Fortitude with Incredible Fortitude provides supreme protection in hostile environments.`
});

addArticle({
  id: '1-08-02-combat-features',
  name: '1.08.02 Combat Features & Weapon Specializations',
  parent: '1.08 FEATURES & PERKS CODEX',
  order: 3,
  perspective: 'operator',
  entry_type: 'Feature Codex',
  description: `# 1.08.02 Combat Features & Weapon Specializations

Combat features unlock specialized fighting stances, brutal critical damage, point-blank firearm tactics, and reactive defenses.

---

| Feature Name | Prerequisite | Benefit / Mechanical Effect | Classification |
| :--- | :--- | :--- | :--- |
| **Weapon Specialization** | Combat Rank 4 | **+2 Strike bonus and +2 Damage** when wielding chosen weapon group. | Multiple |
| **Weapon Mastery** | Weapon Spec | Critical threat range expanded by 1 (e.g. Threat on natural 19–20). | Multiple |
| **Dual Wielding** | Agility 3 | Can make an off-hand attack with secondary weapon with only a -2 penalty. | Standard |
| **Improved Dual Wielding**| Dual Wielding | Off-hand attack suffers **Zero Strike penalty**; gain +1 Active Defense. | Standard |
| **Point Blank Shot** | Firearms Rank 3 | **+2 Strike and +1d4 Damage** against targets within 15 feet. | Standard |
| **Far Shot** | Firearms Rank 3 | Range penalties at Medium and Long range brackets are reduced by 50%. | Standard |
| **Cleave** | Strength 3 | When a melee strike reduces an enemy to 0 HP, make an immediate bonus strike on an adjacent target. | Standard |
| **Deflect** | Melee Rank 4 | Can spend a reaction to parry incoming ranged ballistic shots with melee weapon. | Standard |
| **Rapid Strike** | Combat Rank 6 | Execute one additional strike per turn at a -5 penalty. | Ranked |
| **Whirlwind Attack** | Combat Rank 11 | Spend full turn to make a single melee attack roll against **all adjacent enemies**. | Standard |
| **Precision Strike** | Intellect 3 | Add Intellect modifier instead of Strength to melee finesse damage. | Standard |
| **Armor Mastery** | Stamina 3 | Reduce movement and agility penalties of heavy armor by 50%. | Ranked |`,
  mechanic: `Weapon Spec: +2 Attack / +2 Damage with chosen weapon group
Dual Wielding: Primary Attack + Off-hand Attack (penalty reduced by feat)`,
  guide: `Stack Combat Features with high Combat Skill ranks to dominate the tactical action economy.`,
  note: `Deflect allows skilled cyber-samurai and energy blade masters to protect teammates from sniper fire.`
});

addArticle({
  id: '1-08-03-meta-psionic-features',
  name: '1.08.03 Meta & Psionic Features',
  parent: '1.08 FEATURES & PERKS CODEX',
  order: 4,
  perspective: 'operator',
  entry_type: 'Feature Codex',
  description: `# 1.08.03 Meta & Psionic Features

Meta features allow practitioners to awaken new metaphysical disciplines, expand their Essence reserves, and overchannel reality-warping energy.

---

| Feature Name | Prerequisite | Benefit / Mechanical Effect | Classification |
| :--- | :--- | :--- | :--- |
| **Awakened (Discipline)** | Character Creation | Grants conscious awakening and access to 1 new Metafocus Discipline. | Multiple |
| **Deep Attunement** | Attune Rank 4 | **+4 bonus points** added to your maximum daily Essence Pool. | Ranked |
| **Meta Mastery** | Discipline Rank 6 | Reduce Strain damage suffered from casting backlash by 50%. | Ranked |
| **Swift Invocation** | Discipline Rank 8 | Cast a known codified invocation as a **Quick Action** (1 action instead of full round). | Standard |
| **Overchannel** | Attune Rank 6 | Spend HP instead of Essence points to power high-level invocations. | Standard |
| **Psychic Fortress** | Will 4 | Suffer zero damage from enemy telepathic backlash; gain +4 Will vs mental probes. | Standard |
| **Essence Siphon** | Entropy Rank 6 | Regain 1d4 Essence points whenever a target is slain by your necrotic invocation. | Standard |
| **Resilient Weave** | Attune Rank 5 | Your active spell fields cannot be dispelled without a critical DC 25 dispel check. | Standard |`,
  mechanic: `Deep Attunement: +4 Max Essence per rank
Overchannel: 1 Essence Point = 2 HP sacrificed`,
  guide: `Crucial for Adepts, Arcanists, and Psions looking to cast multiple invocations in high-stakes combat.`,
  note: `Overchanneling is a double-edged sword: powerful in an emergency, but lethal if mismanaged.`
});

addArticle({
  id: '1-08-04-general-social-karma-features',
  name: '1.08.04 General, Social & Karma Features',
  parent: '1.08 FEATURES & PERKS CODEX',
  order: 5,
  perspective: 'operator',
  entry_type: 'Feature Codex',
  description: `# 1.08.04 General, Social & Karma Features

General, social, and karma features grant economic power, planetary fame, lucky dice rerolls, and social networking.

---

| Feature Name | Prerequisite | Benefit / Mechanical Effect | Classification |
| :--- | :--- | :--- | :--- |
| **Wealth (High Capital)** | Character Creation | **+4 bonus** to starting and permanent Wealth score. | Ranked |
| **High Status / Rank** | Level 1 | Recognized diplomatic rank, noble nobility, or military officer status. | Ranked |
| **Underworld Connections**| Streetwise 3 | Access to illicit black market weapons, fences, and safehouses across all starports. | Standard |
| **Good Karma / Lucky** | Character Creation | Gain **+2 Karma Points** per session; spend 1 point to reroll any failed d20 check. | Ranked |
| **Indomitable Spirit** | Wisdom 3 | Once per session, automatically succeed on a death or stabilization saving throw. | Standard |
| **Silver Tongue** | Charisma 3 | +2 on all Deception and Diplomacy checks during high-stakes negotiations. | Standard |
| **Jack of All Trades** | Intellect 3 | Can make untrained skill checks in all skills without suffering the untrained penalty. | Standard |
| **Danger Sense** | Alertness 4 | Cannot be surprised in combat; gain +2 to Reflex saves against traps. | Standard |`,
  mechanic: `Lucky: Spend 1 Karma Point -> Reroll any d20 check, take new result
Wealth: +4 Wealth per stage`,
  guide: `Karma and Social features provide exceptional flexibility and narrative control outside pure combat.`,
  note: `Karma points refresh at the beginning of each game session.`
});

addArticle({
  id: '1-08-05-technologist-augmentation-features',
  name: '1.08.05 Technologist & Augmentation Features',
  parent: '1.08 FEATURES & PERKS CODEX',
  order: 6,
  perspective: 'operator',
  entry_type: 'Feature Codex',
  description: `# 1.08.05 Technologist & Augmentation Features

Augmentation features govern cybernetic installations, neural processors, drone control networks, and advanced starship tuning.

---

| Feature Name | Prerequisite | Benefit / Mechanical Effect | Classification |
| :--- | :--- | :--- | :--- |
| **Cybernetic Tolerance** | Stamina 3 | Can install **2 additional cybernetic augments** without suffering essence strain. | Ranked |
| **Neural Processor** | Intellect 4 | Direct datajack neural interface; +2 on Computers and Starship Gunnery checks. | Standard |
| **Drone Master** | Technology 4 | Can command and coordinate **up to 3 combat drones** simultaneously in combat. | Standard |
| **Master Craftsman** | Vocation Rank 6 | Crafted weapons and armor gain +1 inherent trait (e.g. AP 2, Extra DR). | Standard |
| **Vehicle Specialist** | Piloting 4 | Selected vehicle or starship gains +2 Maneuverability and +10% Top Speed. | Multiple |
| **Bionic Reflexes** | Cyber-limb installed| +3 Initiative and +1 Active Defense bonus from cybernetic limb actuators. | Standard |`,
  mechanic: `Cyber Tolerance: +2 Cybernetic Slots per stage
Drone Master: 3 Active Combat Drones simultaneously`,
  guide: `Essential for cyber-operatives, engineers, droid commanders, and starship pilots.`,
  note: `Cybernetic installations require surgery and recovery time unless installed during character generation.`
});

/* =========================================================================
   VOLUME 1.09: HINDRANCES & FLAWS CODEX (OPERATOR)
   ========================================================================= */

addArticle({
  id: '1-09-00-hindrances-system-overview',
  name: '1.09.00 Hindrances System & BP Economy',
  parent: '1.09 HINDRANCES & FLAWS CODEX',
  order: 1,
  perspective: 'operator',
  entry_type: 'Core Rule',
  description: `# 1.09.00 Hindrances System & BP Economy

In Tangent, **Hindrances** are physical disabilities, psychological traumas, social debts, and karmic flaws that flesh out a character's history. Unlike Features (which cost Build Points), Hindrances **grant bonus Build Points (+BP)** during character creation.

---

## The Hindrance Economy & Recommended Limits

- **Bonus BP Scaling:** Hindrances grant **+3 BP (Minor)**, **+6 BP (Moderate)**, **+9 BP (Major)**, or **+18 BP (Severe / Disability)**.
- **Recommended Limit:** It is strongly recommended that a starting character take **no more than 15 BP total in Hindrances** to maintain character playability and party balance.
- **Architect Approval:** All chosen Hindrances must be approved by the Architect to ensure they fit the campaign setting.

---

## Flaws vs. Disadvantages
- **Flaws (Psychological / Moral):** Phobias, addictions, extreme morality codes, hatreds, arrogant humorless attitudes.
- **Disadvantages (Physical / Social):** Lost limbs, blindness, criminal bounties, poverty, technological impairment.`,
  mechanic: `Hindrance BP Values: Minor (+3 BP), Moderate (+6 BP), Major (+9 BP), Severe (+18 BP)
Recommended Hindrance Cap = 15 Bonus BP`,
  guide: `Select up to 15 BP of Hindrances during Step 7 of character creation to earn bonus Build Points for attributes and features.`,
  note: `Hindrances should actively drive roleplay and create dramatic challenges during sessions.`
});

addArticle({
  id: '1-09-01-complete-hindrances-catalog',
  name: '1.09.01 Complete Hindrances Catalog (All 27 Canonical Flaws)',
  parent: '1.09 HINDRANCES & FLAWS CODEX',
  order: 2,
  perspective: 'operator',
  entry_type: 'Hindrance Codex',
  description: `# 1.09.01 Complete Hindrances Catalog (All 27 Canonical Flaws)

The complete master reference catalog for all 27 canonical Hindrances in the Tangent Role-Playing System.

---

| Hindrance Name | Bonus BP | Severity & Mechanical Penalty |
| :--- | :---: | :--- |
| **Addiction** | **3 / 6 / 9** | Suffer -2 to all actions when experiencing withdrawal symptoms from chemical/stim reliance. |
| **Adversary** | **1 – 10** | Relentless enemy hunting the character: Individual (1–5 BP) or Galactic Organization (5–10 BP). |
| **Bodily Age (Child)** | **10** | Biological age 7–12 years: -1 to two physical attributes (STR, DEX, STA). |
| **Bodily Age (Teen)** | **5** | Biological age 12–16 years: -1 to one physical attribute. |
| **Bodily Age (Old)** | **5** | Biological age 60–90 years: -1 to one physical attribute; +1 Wisdom. |
| **Bodily Age (Venerable)** | **10** | Biological age 90+ years: -1 to two physical attributes; +2 Wisdom. |
| **Clown / Jester** | **2** | Known habitual jokester; **-2 penalty** on all checks to be taken seriously. |
| **Covetous** | **3 / 6 / 9** | Overwhelming greed, lust, ambition, or vanity (Minor, Moderate, Major). |
| **Dependent** | **3 / 6 / 9** | A helpless ward or family member to protect: Capable (3 BP), Needy (6 BP), Total Dependent (9 BP). |
| **Disability (Limb)** | **3 / 6 / 9 / 18** | Missing hand/foot (3 BP), full limb (6 BP), two limbs (9 BP), all four limbs (18 BP). |
| **Distinctive Features** | **3 / 6 / 9** | Unmistakable physical markings: Disguisable (3 BP), Obvious (6 BP), Very Obvious (9 BP). |
| **Emotional Issues** | **3 / 6 / 9** | Chronic trauma, PTSD, or panic attacks under specific triggers. |
| **Extreme Morality** | **4 / 8 / 12** | Rigid moral code (Good, Evil, Lawful, Chaotic); cannot act against code without penalty. |
| **Hatred** | **3 / 6 / 9** | Deep irrational hatred toward specific species, faction, or social class. |
| **Honorable** | **3 / 6 / 9** | Strictly bound by personal knightly ethos; cannot lie, strike from behind, or break vows. |
| **Humorless** | **2** | Takes everything literally; **-2 penalty** to understanding humor, sarcasm, or innuendo. |
| **Impaired Sense** | **4** | Perception checks made at **Disadvantage** with chosen sensory organ (hearing/sight). |
| **Lost Sense** | **3 / 6 / 9** | Complete loss of taste/smell (3 BP), touch/hearing (6 BP), or total blindness (9 BP). |
| **Mental Issues** | **3 / 6 / 9** | Paranoia, schizophrenia, amnesia, or severe psychological delusions. |
| **Minority / Outcast** | **2+** | Ostracized demographic, mutant sub-caste, or xenophobic outcast. |
| **Mute** | **2** | Physically or psychologically unable to speak vocal languages. |
| **Nightmares** | **2** | 10% chance each night of zero restful sleep; suffers **-2 to all actions** next day. |
| **Obligation** | **3 / 6 / 9** | Heavy debt, military service contract, or family obligation demanding regular duty. |
| **Poor / In Debt** | **3 / 6 / 9** | **-4 / -8 / -12 penalty** to Wealth Score; negative score represents debt to syndicates. |
| **Secret** | **3 / 6 / 9** | Dark secret that would cause loss of reputation (3 BP), exile/ruin (6 BP), or death sentence (9 BP). |
| **Social Issues** | **3 / 6 / 9** | Social awkwardness, xenophobia, or speech impediments. |
| **Technologically Impaired**| **10 / 20 / 30**| Severe cultural or personal inability to use technology; reduces base Tech Level. |
| **Unlucky** | **3 / 6 / 9** | **-2 / -4 / -6 penalty** to starting Karma Pool. |`,
  mechanic: `Gain Bonus BP = Listed Hindrance Value
Total Bonus BP <= 15 recommended`,
  guide: `Choose Hindrances that enrich your character's backstory and provide engaging dramatic hurdles.`,
  note: `The Architect can reward inspiration or karma points when a player roleplays their hindrance faithfully.`
});

/* =========================================================================
   VOLUME 3.00: TACTICAL COMBAT SYSTEM (OPERATOR & ARCHITECT)
   ========================================================================= */

addArticle({
  id: '3-00-00-tactical-combat-overview',
  name: '3.00.00 Tactical Combat Engine Overview',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 1,
  perspective: 'both',
  entry_type: 'Core Rule',
  description: `# 3.00.00 Tactical Combat Engine Overview

The Tangent Combat System is a fast-paced, tactical d20 engine balancing gritty lethality, skill-based action economies, armor absorption, and positioning.

---

## 1. The Core Attack Roll Formula

$$\\text{Attack Roll} = d20 + \\text{Combat Skill Rank} + \\text{Attribute Mod} + \\text{Weapon Mod} + \\text{Situational Modifiers}$$

---

## 2. Opposed vs. Unopposed Combat Checks

### Opposed Attack Check (Active Target)
- When a defender is aware and actively fighting back, the attack check is opposed by the defender's active defense roll:
  $$\\text{Defense Roll} = d20 + \\text{Defense / Acrobatics Rank} + \\text{Agility Mod} + \\text{Cover / Shield}$$
- > [!IMPORTANT]
  > **THE GOLDEN RULE OF TANGENT COMBAT: DEFENDER WINS ALL TIES.**

### Unopposed Attack Check (Stationary / Surprised Target)
- When the target is unaware, restrained, or stationary, the attacker rolls against **Static Base DC 15 (Average Medium Target at Short Range)**, modified by Target Size, Range, and Movement.`,
  mechanic: `Opposed: Attacker Roll vs Defender Roll (Defender wins ties)
Unopposed: Attacker Roll vs DC 15 + SizeMod + RangeMod + MoveMod`,
  guide: `On your turn in combat: declare target, choose weapon, roll attack check against target's defense roll or static DC.`,
  note: `Defender wins ties on all opposed checks, emphasizing the power of defensive positioning and cover.`
});

addArticle({
  id: '3-00-01-action-economy-skill-tiers',
  name: '3.00.01 Action Economy & Skill Tiers (Rank 0–30 Actions)',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 2,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 3.00.01 Action Economy & Skill Tiers (Rank 0–30 Actions)

Combat actions in Tangent are determined strictly by **Combat Skill Rank**. As characters advance in skill mastery, they unlock additional attacks and Focus Strike bonuses per combat turn.

---

## The Master Skill Tier Action Table

| Skill Rank Range | Actions per Round | Title / Mastery Level | Focus Strike Bonus |
| :---: | :--- | :--- | :---: |
| **Rank 0** | **Full Round Action** (1 basic action) | **Untrained** | — |
| **Rank 1 – 5** | **1st Action** at base score | **Novice / Studied** | **+2** |
| **Rank 6 – 10** | **2nd Action** at base score -5 | **Trained / Professional** | **+3** |
| **Rank 11 – 15** | **3rd Action** at base score -10 | **Expert** | **+4** |
| **Rank 16 – 20** | **4th Action** at base score -15 | **Master** | **+5** |
| **Rank 21 – 25** | **5th Action** at base score -20 | **Grand Master** | **+6** |
| **Rank 26 – 30** | **6th Action** at base score -25 | **Pinnacle** | **+7** |

---

## Multiple Active Defenses

- Characters can reactively dodge or parry multiple incoming attacks during a combat round.
- **Defense Penalty:** The 1st defense is at full base score; each subsequent defense reaction in the same round suffers a **cumulative -5 penalty** (2nd at -5, 3rd at -10, 4th at -15, etc.).`,
  mechanic: `Actions: Rank 1-5 (1 act), Rank 6-10 (2 acts @ -5), Rank 11-15 (3 acts @ -10), Rank 16-20 (4 acts @ -15)
Successive Active Defenses: -0, -5, -10, -15, -20`,
  guide: `Declare your primary action on your turn. If your Combat Skill is Rank 6+, you may declare a second attack at base -5.`,
  note: `Focus Strike bonuses represent the seasoned warrior's precision in finding armor weak points.`
});

addArticle({
  id: '3-00-02-initiative-surprise-reactions',
  name: '3.00.02 Initiative, Surprise & Active Defenses',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 3,
  perspective: 'both',
  entry_type: 'Combat Rule',
  description: `# 3.00.02 Initiative, Surprise & Active Defenses

Initiative determines the sequence of combat actions at the beginning of an encounter.

---

## 1. Rolling Initiative
- **Initiative Formula:** \`Initiative = d20 + Reflex Saving Throw + Agility Modifier\`
- High roll acts first. Ties are resolved in order of highest Agility score, then highest Alertness rank.

---

## 2. Surprise & Ambushes
- If one party successfully sneaks up on an unaware target (opposed **Stealth check vs. Alertness check**), they gain a **Surprise Round**.
- During a Surprise Round:
  - Unaware targets cannot take actions.
  - Unaware targets suffer a **-4 penalty to Defense** and cannot make active reaction defenses.`,
  mechanic: `Initiative = d20 + ReflexSave + AgilityMod
Surprise Penalty: -4 Defense, no active reactions`,
  guide: `Roll initiative once at the beginning of combat. Combat proceeds in descending initiative order.`,
  note: `Characters with the Danger Sense feature cannot be surprised in combat.`
});

addArticle({
  id: '3-00-03-attack-defense-modifiers',
  name: '3.00.03 Attack & Defense Modifiers (Size, Range, Movement)',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 4,
  perspective: 'architect',
  entry_type: 'Combat Matrix',
  description: `# 3.00.03 Attack & Defense Modifiers (Size, Range, Movement)

Complete reference matrices for target size modifiers, weapon range brackets, movement penalties, and cover ratings.

---

## 1. Target Size Modifiers (Applied to Attack DC)

| Target Size Category | Size Modifier | Typical Example |
| :--- | :---: | :--- |
| **Miniscule** | **-32** | Micro-drone, insect, nanite cluster |
| **Fine** | **-16** | Data chip, coin, sensor node |
| **Diminutive** | **-8** | Small pistol, cyber-rat, dart |
| **Tiny** | **-4** | Combat drone, feline, helmet |
| **Small** | **-2** | Droid, canine, child |
| **Medium (Standard)** | **0** | Humanoid, soldier, standard console |
| **Large** | **+2** | Quadruped beast, power armor, speeder |
| **Huge** | **+4** | Heavy walker, transport truck, turret |
| **Gargantuan** | **+8** | Gunship, tank, dragon, building |
| **Colossal** | **+16** | Starship, dreadnought, orbital fortress |

---

## 2. Range Brackets (Ranged Firearms & Blasters)

| Range Bracket | Attack Modifier | Target DC | Effective Distance |
| :--- | :---: | :---: | :--- |
| **Point Blank** | **+5 (Advantage on Damage)** | **10** | Within Reach / 15 feet |
| **Short** | **0** | **15** | Base Listed Weapon Range |
| **Medium** | **-5** | **20** | Up to 2x Base Listed Range |
| **Long** | **-10** | **25** | Up to 5x Base Listed Range |
| **Extreme** | **-15** | **30** | Up to 10x Base Listed Range |

---

## 3. Movement & Evasion Modifiers

| Combat Situation | Defender Modifier | Attacker Modifier | Notes |
| :--- | :---: | :---: | :--- |
| **Target Running** | — | **-2 Attack** | Target moving fast in open terrain |
| **Distance-Based Move (20+ ft)** | **+2 Defense** | — | Movement exceeds 20 feet this round |
| **Distance-Based Move (40+ ft)** | **+4 Defense** | — | Movement exceeds 40 feet this round |
| **Total Defense / Dodge** | **+4 Defense** | — | Spends action focusing purely on evasion |
| **Attacker Running** | — | **-2 Attack** | Attacker firing while running |
| **Firing from Mounted Speed** | — | **-4 Attack** | Firing from moving vehicle |`,
  mechanic: `TargetDC = 15 + SizeMod + RangePenalty + MoveMod
Point Blank: +5 Strike & Roll Damage with Advantage`,
  guide: `Consult this table whenever resolving ranged attacks against moving, distant, or unusual sized targets.`,
  note: `Cover provides +2 (Half Cover), +4 (Three-Quarters Cover), or Total Protection.`
});

addArticle({
  id: '3-00-04-combat-maneuvers',
  name: '3.00.04 Combat Maneuvers (Bull Rush, Disarm, Feint, Grapple, etc.)',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 5,
  perspective: 'operator',
  entry_type: 'Combat Rule',
  description: `# 3.00.04 Combat Maneuvers (Bull Rush, Disarm, Feint, Grapple, etc.)

Combat maneuvers are specialized tactical actions declared instead of standard damaging attacks.

---

## Master Catalog of Combat Maneuvers

### 1. Bull Rush (Knockback)
- **Check:** Attacker Might / Athletics check vs. Defender Fortitude / Athletics check.
- **Success:** Defender is pushed back 5 feet (+5 ft per 5 points exceeding defense); if defender strikes a solid wall, they take 1d6 kinetic impact damage.

### 2. Disarm
- **Check:** Attacker Melee Combat check vs. Defender Melee Combat / Reflex check.
- **Success:** Defender's held weapon is knocked from their grip, landing 1d6 feet away.

### 3. Feint (Combat Misdirection)
- **Check:** Attacker Deception / Melee check vs. Defender Alertness / Reflex check.
- **Success:** Defender is caught flat-footed against your next attack (loses active defense bonuses).

### 4. Grapple (Pin & Restrain)
- **Check:** Attacker Might / Brawling check vs. Defender Might or Reflex check.
- **Success:** Both combatants enter Grappled state (cannot move; attacker can pin, disarm, or choke target on subsequent rounds).

### 5. Overrun
- **Check:** Attacker Might / Vehicle check vs. Defender Reflex / Acrobatics check.
- **Success:** Attacker moves straight through target's square; target is knocked **Prone**.

### 6. Sunder (Destroy Weapon / Armor)
- **Check:** Attacker Melee check vs. Weapon / Shield Armor DR.
- **Success:** Damages or breaks the target's weapon, shield, or armor plate.

### 7. Trip
- **Check:** Attacker Melee / Acrobatics check vs. Defender Reflex or Might check.
- **Success:** Target is knocked **Prone** (-2 to attack, melee attacks against target gain +2).`,
  mechanic: `Bull Rush: Might vs Fortitude -> 5ft Push (+1d6 wall impact)
Disarm: Attack vs Defense -> Weapon knocked away
Grapple: Might vs Might/Reflex -> Restrained state
Trip: Attack vs Reflex -> Target Prone`,
  guide: `Declare a maneuver on your turn instead of a basic strike. Roll opposed check.`,
  note: `Maneuvers are invaluable for subduing targets non-lethally or neutralizing heavy weapons.`
});

addArticle({
  id: '3-00-05-damage-soak-armor-dr-ap',
  name: '3.00.05 Damage Soak, Armor DR & AP Penetration Math',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 6,
  perspective: 'both',
  entry_type: 'Core Engine Manual',
  description: `# 3.00.05 Damage Soak, Armor DR & AP Penetration Math

Tangent uses an active armor absorption engine where **Armor Damage Reduction (DR)** soaks incoming damage unless pierced by **Armor Penetration (AP)** ratings.

---

## 1. The Damage Soak Formula

$$\\text{Effective Damage} = \\text{Incoming Damage} - \\max(0, \\text{Armor DR} - \\text{Armor Piercing (AP)})$$

---

## 2. Damage Types & Resistances

| Damage Type | Description | Signature Weapon / Energy Source |
| :--- | :--- | :--- |
| **Kinetic / Ballistic** | High-velocity slugs, blades, shrapnel | Autopistols, rifles, vibro-blades, fragmentation |
| **Energy / Laser** | Concentrated coherent photonic beams | Laser carbines, blasters, plasma emitters |
| **Thermal / Fire** | Extreme heat, incendiary chemicals, plasma | Flamethrowers, plasma repeaters, thermite |
| **Cryo / Cold** | Absolute zero chill, liquid nitrogen | Cryo-grenades, freeze beams, ice invocations |
| **Electrical / EMP** | High-voltage lightning, ionic disruptors | Shock batons, EMP grenades, arc cannons |
| **Corrosive / Acid** | Molecular acid, toxic enzymes, bio-venom | Chemical sprayers, bio-spitters, alien toxins |
| **Sonic / Disruption** | High-frequency acoustic resonance | Sonic cannons, vibro-hammers |
| **Metaphysic / Warp** | Pure raw reality distortion | Invocations, planar rifts, psionic blasts |`,
  mechanic: `EffectiveDamage = max(1, RawDamage - max(0, ArmorDR - WeaponAP))`,
  guide: `Apply weapon AP against target DR first. Any remaining DR reduces damage before subtracting from HP.`,
  note: `Metaphysical and Sonic damage types frequently ignore standard kinetic armor DR.`
});

addArticle({
  id: '3-00-06-health-wound-thresholds-mortality',
  name: '3.00.06 Health, Wound Thresholds, Hit Locations & Mortality (0 HP)',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 7,
  perspective: 'architect',
  entry_type: 'Combat Matrix',
  description: `# 3.00.06 Health, Wound Thresholds, Hit Locations & Mortality (0 HP)

Combat lethality in Tangent tracks physical Hit Points, critical wound thresholds, hit locations, and the critical **Mortality State (0 HP)**.

---

## 1. Hit Locations & Called Shots (d100 / d20 Table)

| d20 Roll | Hit Location | Target DC Modifier | Damage & Trauma Effect |
| :---: | :--- | :---: | :--- |
| **1 – 4** | **Legs** | -2 to hit | Movement speed halved; Fortitude save to avoid falling Prone. |
| **5 – 8** | **Arms / Hands** | -2 to hit | Target drops held weapon; -2 penalty on attack rolls. |
| **9 – 16** | **Torso (Center Mass)** | **0 (Base)** | Standard full damage to Armor DR and HP. |
| **17 – 19** | **Sensory / Vitals** | +4 to hit | Target Blinded / Stunned for 1 round; +1d6 bonus damage. |
| **20** | **Head / Core** | +6 to hit | **Critical Headshot:** Double damage; immediate Fortitude save or unconscious. |

---

## 2. The Mortality State (0 HP)
- When a character reaches **0 Hit Points**, they immediately collapse and enter the **Bleeding Out** state.
- **Bleeding Out Mechanics:**
  - Character is unconscious and incapacitated.
  - At the start of each combat turn, roll a **Fortitude Save (DC 15)**:
    - *Success:* Character stabilizes at 0 HP.
    - *Failure:* Character gains 1 Death Mark. (3 Death Marks = **Permanent Death**).
    - *Natural 20:* Character regains consciousness at 1 HP.
- **Medical Trauma Intervention:** An ally with a Medkit can stabilize a bleeding character with a **Medicine check (DC 15)**.`,
  mechanic: `Mortality: 0 HP -> Bleeding Out -> Fortitude Save DC 15 each turn
3 Failed Saves = Death | Medicine DC 15 = Stabilized`,
  guide: `When a character hits 0 HP, initiate death saving throws on their turn until stabilized or medically treated.`,
  note: `Called shots allow precision snipers to disable enemy limbs or destroy sensory visors.`
});

addArticle({
  id: '3-00-07-critical-hits-failures',
  name: '3.00.07 Critical Hits & Failure Severity Tables',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 8,
  perspective: 'architect',
  entry_type: 'Combat Matrix',
  description: `# 3.00.07 Critical Hits & Failure Severity Tables

Natural 20s and Natural 1s trigger dramatic cinematic triumphs or catastrophic equipment failures.

---

## 1. Critical Hits (Natural 20)
When an attack roll is a Natural 20, the attack automatically hits and is a **Critical Strike**:
- **Damage Multiplier:** Roll all weapon damage dice twice and add modifiers.
- **Armor Bypass:** Armor DR is reduced by 50% against the critical strike.

---

## 2. Critical Failures / Fumbles (Natural 1)
When an attack roll is a Natural 1, the attack automatically misses and triggers a **Critical Fumble Check**:
1. **Jam / Misfire:** Weapon is jammed; requires a Full Round Action to clear.
2. **Dropped Weapon:** Weapon slips from grip and lands 5 feet away.
3. **Stumble / Off-Balance:** Attacker loses active defense reactions until their next turn.
4. **Friendly Fire Danger:** If firing into melee, check attack roll against an adjacent ally.`,
  mechanic: `Nat 20: Auto-Hit, 2x Damage Dice, 50% Armor DR Bypass
Nat 1: Auto-Miss, Weapon Jam or Loss of Reaction`,
  guide: `Roll double damage dice on critical hits. Apply fumble consequences narratively to keep combat exciting.`,
  note: `Weapon Mastery features allow characters to score critical hits on rolls of 19–20.`
});

addArticle({
  id: '3-00-08-status-effects-conditions',
  name: '3.00.08 Status Effects & Conditions Index',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 9,
  perspective: 'both',
  entry_type: 'Combat Rule',
  description: `# 3.00.08 Status Effects & Conditions Index

Complete index of tactical combat conditions and their mechanical penalties.

---

| Condition | Mechanical Effects & Penalties | Recovery / Removal |
| :--- | :--- | :--- |
| **Blinded** | Cannot see. Attack rolls suffer -4; attacks against target gain +4; automatic failure on vision checks. | Remove sensory source or 1 round. |
| **Stunned** | Cannot take actions or reactions. Drops held items; Defense DC is reduced by -4. | Fortitude save (DC 15) at end of turn. |
| **Prone** | Lying on ground. -2 on melee attacks; -4 on ranged attacks; melee attacks against target gain +2. | Spend 1 movement action to stand up. |
| **Entangled** | Speed halved; -2 on attack rolls; -2 to Agility checks; cannot sprint. | Athletics / Acrobatics check (DC 15). |
| **Burning** | Takes 1d6 thermal damage at the start of each turn until extinguished. | Spend 1 action to roll or extinguish. |
| **Paralyzed** | Totally incapacitated and frozen. Defense reduced to 5; melee strikes within 5 ft are auto-crits. | Medical stimpak or spell removal. |
| **Poisoned** | Suffer -2 on all attack rolls and ability checks; takes recurring bio-damage. | Fortitude save or antidote stim. |
| **Deafened** | Cannot hear. Automatic failure on hearing checks; -2 on Initiative rolls. | Duration expires. |
| **Exhausted** | Speed halved; -4 on all checks, attack rolls, and saving throws. | 8 hours of restful sleep. |`,
  mechanic: `Condition Penalties apply immediately and persist until removed by save or medical action.`,
  guide: `Track conditions on the Folio and Foundry combat tracker during active skirmishes.`,
  note: `Combining conditions (e.g. Prone + Stunned) leaves targets completely vulnerable to lethal strikes.`
});

addArticle({
  id: '3-00-09-vehicle-mecha-chase-combat',
  name: '3.00.09 Vehicle, Mecha & Chase Combat',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 10,
  perspective: 'both',
  entry_type: 'Combat Rule',
  description: `# 3.00.09 Vehicle, Mecha & Chase Combat

Vehicle combat scales up the tactical engine for speeders, heavy walkers, armored tanks, starfighters, and mecha dogfights.

---

## 1. Vehicle Statistics & Hull DR
- **Hull Integrity (Hull HP):** Structural damage threshold before disabling or explosion.
- **Armor DR (Hull Plating):** Heavy vehicle armor (typically DR 10 to DR 50).
- **Maneuverability Rating:** Added to Pilot checks for evasion and positioning.
- **Top Speed & Acceleration:** Measured in speed brackets (Cruising, High Speed, Flank Speed).

---

## 2. Vehicle Combat Actions
- **Evasive Jinking:** Pilot check to grant vehicle +4 Defense for 1 round.
- **Ramming Maneuver:** Opposed Piloting check. Both vehicles suffer kinetic collision damage based on relative speed.
- **Broadside / Coordinated Fire:** Fire all linked weapon systems at target coordinates.

---

## 3. High-Speed Chase Mechanics
Chases use an abstract **Chase Track (Position 1 to 5)**:
- At the start of each round, all pilots roll an opposed **Piloting Check**:
  - *Winning Pilot:* Advances +1 Position or closes distance by 1 bracket.
  - *Losing Pilot:* Drops back or encounters a hazard obstacle (debris, oncoming traffic).
  - Reaching **Position 5** means successful escape or successful boarding interlock.`,
  mechanic: `Chase Check = d20 + PilotingRank + VehicleManeuverMod vs Opponent Pilot
Ramming Damage = (SpeedBracket * 2d10) - TargetHullDR`,
  guide: `Use the 5-point Chase Track to resolve exciting starfighter dogfights and speeder pursuits.`,
  note: `Vehicle weapons possess the Scale Multiplier trait, dealing x10 damage to infantry.`
});

addArticle({
  id: '3-00-10-zero-g-environmental-hazards',
  name: '3.00.10 Zero-G & Environmental Hazards',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 11,
  perspective: 'architect',
  entry_type: 'Combat Matrix',
  description: `# 3.00.10 Zero-G & Environmental Hazards

Rules for combat in microgravity, explosive decompression, vacuum exposure, radiation storms, and extreme temperatures.

---

## 1. Microgravity & Zero-G Combat
- **Newtonian Recoil:** Firing a kinetic ballistic weapon without magnetic boots or thrusters pushes the shooter backward 5 feet and imposes a **-2 penalty on subsequent attacks**.
- **Movement:** Moving in Zero-G requires an **Athletics (Zero-G) or Acrobatics check (DC 10)** to push off surfaces. Failing the check leaves the character drifting uncontrollably.

---

## 2. Vacuum Exposure & Decompression
- **Explosive Decompression:** Suffer 2d6 explosive trauma; immediate Fortitude save (DC 15) to avoid lung rupture.
- **Vacuum Exposure:**
  - Round 1: Gas escapes lungs; character is stunned.
  - Round 2: Blood boiling begins; takes **2d10 environmental damage** per round.
  - Round 4: Unconsciousness; 3 rounds before permanent asphyxiation.

---

## 3. Radiation & Extreme Temperature
- **Ionizing Radiation:** Suffer 1d6 to 3d6 Fortitude damage per hour; triggers severe nausea (-4 all actions).
- **Extreme Cold (Vacuum / Cryo):** Suffer 1d6 cryo damage every 10 minutes without thermal insulation.
- **Extreme Heat (Volcanic / Plasma):** Suffer 1d6 thermal damage per minute; armor begins to melt.`,
  mechanic: `Zero-G Recoil: -2 Attack & 5ft pushback without mag-boots
Vacuum Damage: 2d10 per round after 1 round stun`,
  guide: `Enforce environmental hazard checks during space-walks, hull breaches, and alien ruin expeditions.`,
  note: `Environmental suits and mag-boots are mandatory standard gear for void operatives.`
});

/* =========================================================================
   VOLUME 4.00: METAPHYSICS & REALITY MANIPULATION (OPERATOR & ARCHITECT)
   ========================================================================= */

addArticle({
  id: '4-00-00-metaphysics-framework',
  name: '4.00.00 The Metaphysics Framework (Triad, ML 0–6 Ratings)',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 1,
  perspective: 'both',
  entry_type: 'Core Rule',
  description: `# 4.00.00 The Metaphysics Framework (Triad, ML 0–6 Ratings)

The manipulation of reality in Tangent is the conscious restructuring of universal constants through the application of will and metaphysical attunement.

---

## The Metaphysic Triad

1. **Attune:** The universal master skill for drawing, regulating, and channeling energy from the Quantum Field, Weave, or Void.
2. **Discipline:** The 6 fundamental spheres of reality manipulation (*Dimension, Energy, Entropy, Illusion, Matter, Mental*).
3. **Invocation:** The codified, rote formulas and muscle-memory spells that produce reliable, structured effects.

---

## Metafocus Level (ML 0 to ML 6)

| ML Rating | Classification | Prevalence & Societal Status | Maximum Skill Cap |
| :---: | :--- | :--- | :---: |
| **ML 0** | **Null** | No native meta users or reality manipulation. | — |
| **ML 1** | **Rare** | Negligible population ratio; meta users feared or heavily regulated. | Rank 2 |
| **ML 2** | **Selective** | Secret cults, psionic black-ops, monastery enclaves. | Rank 4 |
| **ML 3** | **Cultured** | Accepted use; Adepts serve in military, courts, and medicine. | Rank 6 |
| **ML 4** | **Standardized**| Pervasive integration in public transit, law, and daily life. | Rank 8 |
| **ML 5** | **Advanced** | Universal meta usage; high-density telepathy and matter crafting. | Rank 10 |
| **ML 6** | **Deific** | Transcended civilization (Architects / Progenitors); Non-Player Characters only. | Rank 12+ |

---

## Key Ability Selection (The Source Flavor)
- **Intelligence-Based:** Arcane research, quantum logic, mathematical formulas.
- **Wisdom-Based:** Divine faith, cosmic intuition, nature attunement.
- **Charisma-Based:** Hereditary bloodlines, force of personality, granted boons.`,
  mechanic: `MaxDisciplineRank = ML * 2 (Attune is not limited by ML)
KeyAbility: Intellect (Logic), Wisdom (Will), or Charisma (Etiquette)`,
  guide: `Establish your character's Key Ability and awakened disciplines during character creation.`,
  note: `The Attune skill is the foundation of all casting; without high Attune, invocations will be easily resisted.`
});

addArticle({
  id: '4-00-01-casting-mechanics-free-invocations',
  name: '4.00.01 Casting Mechanics (Free-Casting vs Invocations)',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 2,
  perspective: 'operator',
  entry_type: 'Metaphysics Rule',
  description: `# 4.00.01 Casting Mechanics (Free-Casting vs Invocations)

Practitioners of Metaphysics can manipulate reality through two distinct methodologies: **Spontaneous Free-Casting** and **Codified Invocations**.

---

## 1. Codified Invocations (Structured Spells)
- Invocations represent rote, mathematically perfected formulas memorized through intensive training.
- **Bonus:** Invocation Levels are added directly to your Discipline Skill check as specializations.
- **Resistance DC Formula:**
  $$\\text{Target Resistance DC} = 10 + \\text{Key Ability Mod} + \\text{Attune Rank} + \\text{Invocation Level}$$
- **Discipline Check (Severity & Damage):**
  $$\\text{Potency Check} = d20 + \\text{Discipline Rank} + \\text{Key Ability Mod} + \\text{Invocation Level}$$

---

## 2. Spontaneous Free-Casting
- Allows the practitioner to improvise any thematic effect within their Discipline's sphere on the fly.
- **Process:**
  1. Make an **Attune Check** to draw and shape the raw energy (sets target DC or attack roll).
  2. Make a **Discipline Check** to determine the magnitude, radius, and duration.
- **Risk:** Highly volatile; failing the Attune check by 5+ points triggers instant **Strain Backlash**.`,
  mechanic: `Invocation DC = 10 + KeyAbilityMod + AttuneRank + InvocationLevel
Free-Casting DC = Attune Check result`,
  guide: `Use codified invocations for reliable combat damage and defense; use free-casting for flexible narrative problem solving.`,
  note: `Invocations are considered Discipline Specializations and stack with your base Discipline Rank.`
});

addArticle({
  id: '4-00-02-essence-economy-surge-strain',
  name: '4.00.02 Essence Economy, Surge & Strain Backlash',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 3,
  perspective: 'operator',
  entry_type: 'Metaphysics Rule',
  description: `# 4.00.02 Essence Economy, Surge & Strain Backlash

Channeling metaphysical power consumes **Essence Points** from your personal energy pool and carries the risk of **Strain Backlash**.

---

## 1. The Essence Pool
- **Maximum Essence Pool Formula:**
  $$\\text{Max Essence} = \\text{Attune Rank} + \\text{Key Ability Mod} + \\text{Deep Attunement Feats}$$
- **Essence Costs:** Invocations consume Essence equal to their **Invocation Level (1 to 5)**.
- **Recovery:** A short rest (15 min meditation) restores 50% of maximum Essence; a full night's rest (8 hours) fully restores your pool.

---

## 2. Strain & Volatility Backlash
- When a caster runs out of Essence, they may attempt to **Overchannel** by drawing power directly from their physical life force.
- **Overchanneling Cost:** 1 Essence Point = **2 Hit Points lost directly as un-soakable Strain**.
- **Backlash Severity Table (Rolled on Natural 1 or failed free-cast):**
  1. *Minor Surge (1–2):* Sensory flash; caster is blinded for 1 round.
  2. *Moderate Backlash (3–4):* 1d6 Strain damage; Essence pool drained by 2 points.
  3. *Severe Rupture (5–6):* 2d6 Strain damage; caster knocked Prone and Stunned for 1 round.`,
  mechanic: `MaxEssence = AttuneRank + KeyAbilityMod
Overchannel = 1 Essence : 2 HP Strain Damage`,
  guide: `Monitor your Essence pool closely during dungeon crawls and prolonged fire-fights.`,
  note: `The Meta Mastery feature reduces all Strain damage suffered by 50%.`
});

addArticle({
  id: '4-00-03-discipline-dimension',
  name: '4.00.03 Discipline of Dimension (Spatial Warping & Invocations)',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 4,
  perspective: 'operator',
  entry_type: 'Metaphysics Discipline',
  description: `# 4.00.03 Discipline of Dimension (Spatial Warping & Invocations)

The **Discipline of Dimension** governs the manipulation of space, distance, gravitational vectors, pocket dimensions, and teleportation.

---

## Core Invocations Catalog

### Level 1 Invocations
- **Blink-Step:** Teleport instantly up to 30 feet to an unoccupied space in line of sight (Quick Action).
- **Spatial Anchor:** Lock an object or enemy in space; target cannot be moved or pushed for 3 rounds.
- **Pocket Vault:** Open a micro-singularity storage pocket holding up to 50 lbs of gear.

### Level 2 Invocations
- **Gravity Shift:** Alter the gravitational orientation in a 20-foot radius; enemies fall toward ceilings or walls.
- **Phase Shift:** Become partially out-of-phase with standard space for 2 rounds; gain +4 Defense against physical attacks.
- **Dimensional Tether:** Tether two targets together across space; damage dealt to one is mirrored on the other.

### Level 3 Invocations
- **Wormhole Gateway:** Open a stable two-way portal connecting two locations up to 1 mile apart for 5 minutes.
- **Spatial Distortion Shield:** Bend incoming laser and ballistic trajectories away, gaining **50% miss chance**.
- **Banishment:** Temporarily cast an enemy into a dimensional rift for 1d4 rounds (Will save resists).

### Level 4 Invocations
- **Mass Teleportation:** Teleport the caster and up to 8 allies up to 100 miles to a known coordinate.
- **Singularity Well:** Create a crushing micro-black hole pulling all enemies within 40 feet into the center (4d10 kinetic damage).

### Level 5 Invocations
- **Fold Space (Planetary):** Instantly fold space across interstellar distances, transporting a starship between planetary orbits.`,
  mechanic: `Blink-Step: 1 Essence -> 30ft Teleport (Quick Action)
Singularity Well: 4 Essence -> 40ft Radius Pull & 4d10 Kinetic Damage (Reflex DC)`,
  guide: `Dimensional adepts excel at battlefield mobility, bypassing barriers, and isolating dangerous foes.`,
  note: `Teleporting into solid matter is impossible; the spatial field shunts the caster to the nearest open space.`
});

addArticle({
  id: '4-00-04-discipline-energy',
  name: '4.00.04 Discipline of Energy (Thermal, Force & Invocations)',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 5,
  perspective: 'operator',
  entry_type: 'Metaphysics Discipline',
  description: `# 4.00.04 Discipline of Energy (Thermal, Force & Invocations)

The **Discipline of Energy** governs the manipulation of kinetic forces, thermodynamic heat, electrical arcs, coherent radiation, and protective forcefields.

---

## Core Invocations Catalog

### Level 1 Invocations
- **Plasma Bolt:** Hurl a concentrated bolt of superheated plasma dealing **2d8 Thermal damage** (Range: 60 ft).
- **Kinetic Barrier:** Manifest a hovering force shield absorbing up to **15 points of incoming damage**.
- **Arc Spark:** Release an electrical arc jumping between up to 3 targets dealing **1d10 Electrical damage** each.

### Level 2 Invocations
- **Thermal Cone:** Project a 30-foot cone of roaring fire dealing **3d8 Thermal damage** (Reflex save for half).
- **Force Wall:** Erect a solid kinetic force wall 10 ft wide by 10 ft high blocking all physical and energy fire (Hull DR 25).
- **Ionic EMP Burst:** Release a short-range pulse disabling electronic visors, droids, and cyber-limbs for 2 rounds.

### Level 3 Invocations
- **Lightning Lance:** Discharge a 60-foot line of blinding electrical current dealing **5d10 Electrical damage** and stunning machines.
- **Overcharged Aegis:** Surround an ally in radiant kinetic armor granting **+10 Armor DR** for 5 rounds.
- **Radiation Flare:** Emit a blinding burst of ionizing radiation blinding all targets within 30 ft (Fortitude save resists).

### Level 4 Invocations
- **Plasma Nova:** Detonate a 40-foot radius sphere of plasma fire dealing **8d8 Thermal damage** and melting light vehicle armor.
- **Kinetic Implosion:** Crush target in an inward force bubble dealing **8d10 crushing damage** (Fortitude save for half).

### Level 5 Invocations
- **Solar Lance (Orbital):** Call down a focused beam of celestial solar energy devastating a 100-foot zone (**12d10 Radiant/Thermal damage**).`,
  mechanic: `Plasma Bolt: 1 Essence -> 2d8 Thermal (Range 60ft)
Lightning Lance: 3 Essence -> 5d10 Electrical Line (60ft)
Plasma Nova: 4 Essence -> 8d8 Thermal Sphere (40ft Radius)`,
  guide: `Energy adepts provide devastating area-of-effect damage and impenetrable kinetic shielding.`,
  note: `Thermal invocations ignite flammable materials and melt thin metal bulkheads.`
});

addArticle({
  id: '4-00-05-discipline-entropy',
  name: '4.00.05 Discipline of Entropy (Decay, Life Drain & Invocations)',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 6,
  perspective: 'operator',
  entry_type: 'Metaphysics Discipline',
  description: `# 4.00.05 Discipline of Entropy (Decay, Life Drain & Invocations)

The **Discipline of Entropy** governs the breakdown of systems, molecular decay, probability distortion, cellular necrosis, and life-force siphoning.

---

## Core Invocations Catalog

### Level 1 Invocations
- **Decay Touch:** Inflict rapid cellular corrosion dealing **2d6 Necrotic damage** and degrading target armor DR by 2.
- **Jinx (Probability Curse):** Impose a **-3 penalty** on target's next two d20 rolls (Will save resists).
- **Disrupt Circuitry:** Cause an electronic weapon or cyber-limb to malfunction for 1 round.

### Level 2 Invocations
- **Life Siphon:** Drain life force from target dealing **3d6 Necrotic damage**; caster regains HP equal to half damage dealt.
- **Corrosive Cloud:** Manifest a 20-foot cloud of necrotic mist dealing **2d6 Acid/Entropy damage** per round to all inside.
- **Armor Rust:** Rapidly oxidize and crumble an enemy's metal armor, permanently reducing DR by 5.

### Level 3 Invocations
- **Wave of Fatigue:** Release an entropic pulse forcing all enemies in 30 ft to make a Fortitude save or become **Exhausted**.
- **Entropic Blast:** Unleash an unmaking beam dealing **5d8 Entropy damage** (ignores standard physical Armor DR).
- **Curse of Misfortune:** Target automatically fails all saving throws on rolls of 1–5 for 1 minute.

### Level 4 Invocations
- **Cellular Dissolution:** Target's molecular bonds begin to dissolve, taking **6d10 Necrotic damage** and suffering 1d4 Stamina drain.
- **Aura of Decay:** 30-foot aura around caster causing all incoming kinetic bullets to corrode, granting **+8 DR**.

### Level 5 Invocations
- **Total Unmaking:** Target must make an immediate Fortitude save (DC 25) or be instantly disintegrated into fine ash.`,
  mechanic: `Life Siphon: 2 Essence -> 3d6 Necrotic Damage + Heal 50%
Entropic Blast: 3 Essence -> 5d8 Entropy Damage (Ignores Armor DR)`,
  guide: `Entropy adepts excel at bypassing high Armor DR and crippling enemy combat statistics.`,
  note: `Entropy invocations leave targets with blackened, necrotic cellular scarring.`
});

addArticle({
  id: '4-00-06-discipline-illusion',
  name: '4.00.06 Discipline of Illusion (Phantasms & Invocations)',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 7,
  perspective: 'operator',
  entry_type: 'Metaphysics Discipline',
  description: `# 4.00.06 Discipline of Illusion (Phantasms & Invocations)

The **Discipline of Illusion** governs the manipulation of light refraction, sensory perceptions, holographic phantasms, invisibility, and mental glamours.

---

## Core Invocations Catalog

### Level 1 Invocations
- **Invisibility (Personal):** Refract light around your body; gain **Total Concealment** (+8 Stealth, attacks gain Advantage) for 3 rounds.
- **Ghost Sound:** Project realistic audio, footsteps, or gunfire sounds up to 100 feet away.
- **Holographic Decoy:** Create an illusory double of yourself; enemy attacks against you have a **50% chance** to hit the decoy instead.

### Level 2 Invocations
- **Glamour Veil:** Disguise your appearance, voice, and uniform to perfectly mimic any humanoid identity.
- **Blinding Flash:** Release a burst of refracted photonic light forcing all targets in 20 ft to make a Reflex save or be **Blinded**.
- **Mirage Terrain:** Disguise a pit, trap, or blast door to look like normal unbroken floor.

### Level 3 Invocations
- **Mass Invisibility:** Cloak the caster and up to 4 allies in an invisible refraction field for 5 minutes.
- **Phantasmal Dread:** Manifest the target's worst subconscious terror; target must make a Will save or flee in panic for 1d4 rounds.
- **Sensory Hallucination:** Completely alter the target's visual and auditory environment, making allies look like enemies.

### Level 4 Invocations
- **Mirror Army:** Manifest 6 realistic, moving holographic copies of your entire squad to draw enemy fire.
- **Shadow Puppet:** Create a semi-solid shadow beast capable of dealing **4d6 Psychic/Cold damage** for 1 minute.

### Level 5 Invocations
- **Permanent Phantasm:** Construct an immutable, interactive holographic illusion spanning an entire building or starship deck.`,
  mechanic: `Invisibility: 1 Essence -> Total Concealment (+8 Stealth, Advantage on first attack)
Holographic Decoy: 1 Essence -> 50% Miss Chance`,
  guide: `Illusion adepts excel at infiltration, social infiltration, diversion, and avoiding direct combat.`,
  note: `True-sight cybernetic sensors roll an Investigation check against your Attune DC to see through illusions.`
});

addArticle({
  id: '4-00-07-discipline-matter',
  name: '4.00.07 Discipline of Matter (Transmutation, Telekinesis & Invocations)',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 8,
  perspective: 'operator',
  entry_type: 'Metaphysics Discipline',
  description: `# 4.00.07 Discipline of Matter (Transmutation, Telekinesis & Invocations)

The **Discipline of Matter** governs telekinetic force, density manipulation, molecular restructuring, transmutation, and earth-shaping.

---

## Core Invocations Catalog

### Level 1 Invocations
- **Telekinetic Throw:** Telekinetically lift and hurl an object or weapon dealing **2d8 Kinetic damage** (Range: 60 ft).
- **Mend Object:** Repair cracked bulkheads, severed wires, or broken weapons in 1 round.
- **Density Shift (Light):** Reduce an object's weight by 90% for easy carrying.

### Level 2 Invocations
- **Stone / Metal Shaping:** Reshape solid stone or metal bulkheads into stairs, doors, or defensive barricades.
- **Telekinetic Shield:** Form a swirling vortex of debris and metal fragments granting **+4 Defense** against all ranged attacks.
- **Liquid Transmutation:** Turn water into oil, fuel into water, or neutralize liquid toxins.

### Level 3 Invocations
- **Telekinetic Crush:** Telekinetically grip and crush an enemy dealing **4d10 Crushing damage** (Might save for half).
- **Molecular Hardening:** Infuse a weapon or suit of armor with diamond density, granting **+5 Armor DR** or +3 AP.
- **Earth Wall:** Raise a 15-foot high wall of solid granite from the ground (Hull DR 30).

### Level 4 Invocations
- **Telekinetic Storm:** Lift tons of rubble, vehicles, and debris into a swirling hurricane dealing **6d10 Bludgeoning damage** in a 40-foot radius.
- **Transmute Metal to Glass:** Turn heavy steel blast doors or tank armor into brittle glass instantly.

### Level 5 Invocations
- **Matter Disintegration:** Annihilate the atomic bonds of a structure, reducing a 50-foot section of a building or starship to dust.`,
  mechanic: `Telekinetic Throw: 1 Essence -> 2d8 Kinetic (Range 60ft)
Telekinetic Crush: 3 Essence -> 4d10 Crushing Damage (Might DC)
Telekinetic Storm: 4 Essence -> 6d10 Damage in 40ft Radius`,
  guide: `Matter adepts provide massive physical battlefield control, barricades, and object manipulation.`,
  note: `Telekinesis uses your Intellect or Wisdom modifier for grapple checks and throwing accuracy.`
});

addArticle({
  id: '4-00-08-discipline-mental',
  name: '4.00.08 Discipline of Mental (Telepathy, Mind Control & Invocations)',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 9,
  perspective: 'operator',
  entry_type: 'Metaphysics Discipline',
  description: `# 4.00.08 Discipline of Mental (Telepathy, Mind Control & Invocations)

The **Discipline of Mental** governs telepathy, mind-reading, empathic sensing, psychic shields, memory modification, and direct mind domination.

---

## Core Invocations Catalog

### Level 1 Invocations
- **Telepathic Link:** Establish a silent, private two-way telepathic channel with up to 4 allies within 1 mile for 1 hour.
- **Empathic Scan:** Read the emotional state, surface intentions, and truthfulness of a target.
- **Psychic Daze:** Stun target's cognitive neurons; target loses their next action (Will save resists).

### Level 2 Invocations
- **Mind Probe (Surface Thoughts):** Read target's immediate conscious thoughts, passwords, or immediate battle plans.
- **Psychic Strike:** Blast target's central nervous system with raw psionic force dealing **3d8 Psychic damage** (bypasses physical armor).
- **Suggestion (Charm):** Plant a subtle verbal suggestion in target's mind that they believe is their own idea.

### Level 3 Invocations
- **Telepathic Network:** Connect an entire army platoon or squad into a shared sensory hive-mind (+2 to Initiative, +2 to Alertness).
- **Mind Wipe (Short Term):** Erase target's memory of the past 10 minutes (Will save resists).
- **Psychic Terror:** Overload target's fear center; target is paralyzed with terror for 1d4 rounds.

### Level 4 Invocations
- **Domination (Mind Control):** Take complete direct control of target's motor functions and actions for 1 minute (Will save resists).
- **Synaptic Overload:** Inflict massive neural burning dealing **6d10 Psychic damage** and stunning target for 2 rounds.

### Level 5 Invocations
- **Total Mind Seizure:** Permanently rewrite target's personality, loyalties, and core memories (Requires Will DC 25 to resist).`,
  mechanic: `Psychic Strike: 2 Essence -> 3d8 Psychic Damage (Bypasses Physical Armor DR)
Domination: 4 Essence -> Full Mind Control for 1 minute (Will DC)`,
  guide: `Mental adepts dominate intelligence gathering, silent squad coordination, and disabling priority targets.`,
  note: `Psychic damage attacks the mind directly and ignores physical kinetic armor DR entirely.`
});

addArticle({
  id: '4-00-09-invocations-geometry-aoe',
  name: '4.00.09 Invocations Geometry & Areas of Effect (Shapes & Range Math)',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 10,
  perspective: 'architect',
  entry_type: 'Metaphysics Matrix',
  description: `# 4.00.09 Invocations Geometry & Areas of Effect (Shapes & Range Math)

Complete geometric calculations and spatial templates for area-of-effect (AoE) invocations on tactical battle maps.

---

## 1. Geometric AoE Template Shapes

| AoE Shape | Origin & Direction | Calculation Rule | Typical Invocations |
| :--- | :--- | :--- | :--- |
| **Burst / Sphere** | Center point in range | Affects all squares within specified radius (e.g. 20-ft radius sphere). | Plasma Nova, Singularity Well |
| **Cone** | Caster's hand / focus | 90-degree expanding cone; width at end equals cone length (e.g. 30-ft cone). | Thermal Cone, Frost Breath |
| **Line** | Straight line from caster | 5-ft wide straight beam extending to maximum range (e.g. 60-ft line). | Lightning Lance, Unmaking Beam |
| **Cylinder / Column** | Overhead sky / orbital | Descending cylinder of fixed radius and height (e.g. 20-ft radius, 40-ft high). | Solar Lance, Gravity Pillar |
| **Wall** | Continuous barrier line | Solid wall segments (e.g. 10 ft high x 30 ft long). Blocks line of sight and fire. | Force Wall, Earth Wall |

---

## 2. Cover & Saving Throws in Area Effects
- Targets behind **Half Cover** gain **+2 on saving throws** against AoE invocations.
- Targets behind **Three-Quarters Cover** gain **+4 on saving throws**.
- Targets behind **Total Cover** are completely shielded from burst effects unless the barrier is breached by damage.`,
  mechanic: `Sphere Radius: Count grid squares from origin point
Line: 5ft wide straight path
Half Cover in AoE = +2 to Saving Throw`,
  guide: `Use these geometric templates when placing AoE spell templates on Foundry battle maps.`,
  note: `Solid barriers absorb damage before allowing AoE blast waves to pass through.`
});

console.log(`Successfully compiled ${articles.length} comprehensive articles.`);

// Write JSON seed dataset
fs.writeFileSync(SEED_OUTPUT_PATH, JSON.stringify(articles, null, 2), 'utf-8');
console.log(`Saved JSON seed to: ${SEED_OUTPUT_PATH} (${(fs.statSync(SEED_OUTPUT_PATH).size / 1024).toFixed(1)} KB)`);

// Write individual markdown files to src/data/omnicortex/compendium/
articles.forEach(art => {
  const filePath = path.join(MD_OUTPUT_DIR, `${art.id}.md`);
  const content = `---
id: "${art.id}"
name: "${art.name}"
category: "${art.category}"
parent: "${art.parent}"
order: ${art.order}
perspective: "${art.perspective}"
entry_type: "${art.entry_type}"
---

${art.description}

## Game Mechanics Rules
\`\`\`
${art.mechanic}
\`\`\`

## Gameplay Instructions
${art.guide}

## Designer Notes
${art.note}
`;
  fs.writeFileSync(filePath, content, 'utf-8');
});

console.log(`Saved ${articles.length} individual markdown files in ${MD_OUTPUT_DIR}`);
