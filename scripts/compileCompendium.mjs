import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { metaphysicsArticles } from './data_metaphysics.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../docs/operator');
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
  name: '1.01 Character Creation System & Walkthrough',
  parent: '1.00 CHARACTER CREATION & ECONOMY',
  order: 1,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 1.01 Character Creation System & Walkthrough

Players embark on a thrilling adventure where they hold the power to shape their character's destiny. This customization system grants players the freedom to craft unique and unforgettable characters that resonate with their playstyles and preferences.

A diverse range of species awaits players, each possessing distinct attributes and abilities that influence the course of their journey. From Humans, known for their adaptability and resilience, to mystical Elves with an affinity for magic, the choice of species sets the foundation for a character's strengths and weaknesses.

Furthermore, players can delve into a rich array of origins, uncovering the profound impact of their character's past on their present and guiding their future. Whether raised in a bustling metropolis, a serene village, or a nomadic tribe, each origin bestows unique advantages, disadvantages, features, and skills that shape a character's journey.

The game further immerses players in a vibrant world populated by various factions and occupations. Aligning with a faction grants access to exclusive resources, training, and missions, allowing players to forge alliances and shape the political landscape. Additionally, choosing an occupation provides specialized skills and abilities tailored to specific playstyles. From skilled warriors to cunning rogues and wise scholars, each occupation offers a distinct path towards character development.

Players have the ability to create characters that are not only powerful and effective but also possess intriguing personalities and captivating backstories. Every decision made during character creation has a lasting impact, ensuring that each character is truly unique and memorable. Every character is a reflection of the player's creativity and strategic thinking, making the journey through this immersive world a truly personal and unforgettable experience.

---

## CONCEPT

To start the character creation process, players should first envision a general concept for their character. This involves thinking about several key aspects that will shape their character's identity and role in the game:

### Background
What is the character's background and upbringing? This includes their family, social status, education, and life experiences. Background will shape the character's personality, skills, and worldview.

### Personality
What kind of person is the character? Are they brave, cunning, compassionate, or something else entirely? Personality traits will guide the character's decisions and interactions with others.

### Role
What role will the character play in the game world? Will they be a hero, a villain, a supporting character, or something else? This will influence the character's goals, motivations, and the types of challenges they will face.

> [!TIP]
> **Example (Concept):**  
> *Xy'larra is from a merchant clan of Alterian Elves, she is a seasoned diplomat with a thirst for exploration. She's driven by a deep curiosity about the vastness of the galaxy and a desire to forge connections with new cultures.*

---

## BUILD POINTS

**Build Points (BP):** Players are given **150 Build Points** at the start of character creation. In addition to skill ranks and features gained from the character's Species, Faction, Origin or Occupation. These points are used to purchase various aspects of their character from any section they choose, including:

- **Ability Scores:** The six basic ability scores, averages of 0. Ability Scores cost **5 BP** per +1.
- **Species Package:** This includes the base species and any associated abilities or traits. BP Cost of Species package is variable.
- **Faction, Origin and Profession:** These do not cost build points but will grant skills, features and traits. In total granting **60 skill ranks, 4 features and 4 traits** to ground the character with baseline traits, these are not ‘bonus’ but are foundational traits the character will likely need or have gained from being established.
- **Technology:** No BP cost at Tech 3, costs to be more advanced (+10 BP for TL4, +20 BP for TL5 or -10 per TL under 3).
- **Skills:** These represent a character's learned abilities and expertise. Skills cost **1 BP per rank**.
- **Features:** These are special abilities or enhancements that can be acquired through various means. Features have a base cost of **3 BP** and adjusted by recommendations (minimum cost of 1 BP per feature).
- **Hindrances:** Flaws and Drawbacks of a character to gain BP.
- **Augmentations:** Enhanced with permanent cybernetic or bio-modifications. The Augmented feature (Augmented, Heavy, Severe) is required depending on stage of augmentation AND each augmentation costs **1 BP** as well.
- **Meta Discipline:** Developing metaphysical capabilities, such as magic or psychic powers. The Awakened feature is required to access the metafocus disciplines and the special ability feature is to use specific evocation effects without deep training (regardless of the source).
- **Property:** Equipped with essential tools and belongings. Property is obtained via the WEALTH score (secured transaction against the character's worth), CREDIT/cash/markers/etc in-game liquid currency for specific transactions, CRAFTING the items with the character or allies' skills and materials, CONJURATION is using metafocus arts to create a temporary or permanent item (difference being if it is temporary there is no cost and it fades away after the scene or sooner. Permanent items will require BP purchase to be kept on the folio with other gear).

> [!TIP]
> **Example (Build Points):**  
> *Xy'larra will have 150 BP to spend throughout the character creation.*

---

## ABILITY SCORES

Every character is defined by six fundamental attributes. The standard baseline for an ordinary human is **+0**. During character creation, no raw attribute score may exceed **+4** before species adjustments or mechanical augmentations are applied.

| Attribute | Attribute Check | Core Areas of Mechanical Influence |
| :--- | :--- | :--- |
| **Strength (STR)** | Might Check | Carrying/Lifting Capacity, Melee Damage, Raw Physical Force |
| **Agility (AGI)** | Reflex Check | Ranged Weapon Accuracy, Evasion, Balance, Initiative |
| **Stamina (STA)** | Fortitude Check | Toxic/Disease Resistance, Base Toughness, Vitality Buffer |
| **Intellect (INT)** | Reason Check | Pure Logic, Technical Crafting, Scientific / Academic Knowledge |
| **Wisdom (WIS)** | Willpower Check | Deception Detection, Focus, Fear Resistance, Intuition |
| **Charisma (CHA)** | Etiquette Check | Leadership, Complex Negotiation, Social Magnetism, Karma Bounds |

---

## SPECIES

The first step in character creation for the Tangent SFF RPG is to choose a **Species**.

- **BP Cost:** Each species has a BP cost deducted from the starting pool of 150 BP.
- **Ability Modifiers:** Each species has specific ability modifiers (positive or negative) that affect a character's base stats.
- **Skill Ranks:** A species may be granted ranks in certain specific skills or skills chosen from a category. Indicating the species focus in certain training.
- **Racial Traits & Special Features:** Certain species may have access to unique racial traits or special features.
- **Recommended Features:** Players can select from this list of features with a 1 BP reduction in cost (minimum of 1 BP for any feature).

> [!TIP]
> **Example (Species):**  
> *Xy'larra is an Alterian (17 BP package - covering all traits of the species) and she will have the following modifiers:*  
> *Gain +1 Agility and +1 Intellect (Elven types are typically quite quick and intelligent). She is Awakened (her species specifically studies the Arcane with an Intellect basis and will gain a discipline and its skills) and also gains +10 Skill points for discipline related skills. Alterians are Humanoid with a Minor Xeno Stigma (humans will comparatively have a slightly different cultural view, -2 penalty on certain social interactions).*  
> - *Awakened in Mental with 5 points to Focus and 5 points to the Sensory Discipline (for meta enhanced perception and awareness).*

---

## FACTION

The **Faction stage** of character creation in Tangent involves choosing a faction with which your character is affiliated. Each faction represents a distinct group or organization within the game world, with its own unique culture, goals, and resources.

- **Faction Skill Points:** Each faction provides **20 Faction Skill Ranks** that can be allocated to specific skills relevant to that faction. This allows players to further specialize their character's abilities and tailor them to the faction's focus.
- **Faction Features:** Factions can also offer a selection of **2 Recommended Features** that characters can choose from. These features represent special abilities, training, or equipment that are prominent to that faction.
- **Faction Affiliation Benefits:** Aligning with a particular faction can provide various benefits, such as access to exclusive resources, support from other faction members, and opportunities for advancement within the faction's hierarchy.
- **Faction Affiliation Drawbacks:** However, faction affiliation can also have drawbacks, such as conflicts with rival factions, obligations to the faction's leadership, and restrictions on certain actions or choices.

> [!TIP]
> **Example (Faction):**  
> *The Alterian Enclave, typical for most Alterians, is focused on diplomacy and exploration. Xy'larra will gain the following options:*  
> *Technology is Spacefaring (Tech Level 3) with a Meta Level of 4 (focus of Arcane Enhancements). Her recommended skills (20 points allotment) are from Academics and the categories of Knowledges, Vocations and Disciplines. She will also gain 2 Features from the Discipline Category.*  
> - *She gains the skills of Academics 5, Culture 5 (Know), Ambassador 5 (Voc) and another 5 to her Sensory Discipline skill raising it to 10.*  
> - *She will also gain Awakened (for Both Dimensional and Entropy) with the 2 features gained in the Discipline category.*

---

## ORIGIN

The **Origin stage** of character creation in Tangent involves selecting an origin that reflects the character's upbringing and background. This choice will influence their skills, traits, and overall worldview. Players can choose from a variety of origins, such as Colony, Leisure, or Militant, each with its own unique set of benefits and drawbacks.

- **Skill Points:** Each origin comes with **20 Origin Skill Ranks** that can be distributed among a specific set of skills relevant to that origin. This allows players to tailor their character's abilities to their chosen background.
- **Origin Traits:** Additionally, players can choose **2 Origin Traits** from a list of options associated with their selected origin. These traits represent specific characteristics or abilities that reflect the character's upbringing and experiences. (Traits from Origin and Occupation are interchangeable if befitting the character.)
- **Additional Traits:** Players have the option to select additional traits beyond the initial two, but these come at a cost of **1 Build Point (BP) each**. This allows for further customization but requires careful consideration of the character's overall build and BP budget.

> [!TIP]
> **Example (Origin):**  
> *Xy'larra is from a family of merchants and has been travelling the stars since she was young. Spacer origins fitting but due to the fact that she was raised in an Alterian Clan with traditional teachings she will gain Enlightened as a secondary origin (she will not gain any extra points but will gain access to the secondary list of suggested skills and traits to choose from).*  
> *She will gain 20 Skill Points to spend on any skills (with her Spacer origin having a better selection of skills than her Enlightened origin).*  
> *She will also gain 2 Traits total to choose from either origin (with her combined list of options being Combat Training, Independence, Leadership Skills, Pilot Skills, Resourcefulness, Smooth Talking, Technical Skills, Toughness, Empathy, Intellectual Curiosity, Mentorship, Open-Mindedness, Peaceful Nature, Problem-Solving Skills, Shared Wisdom and Spiritual Awareness).*  
> - *Wanting to be mobile she takes skills in Piloting 5, Navigation 5 (Know) and wanting to take care of herself she learns Defense 5 and Melee 5.*  
> - *The Traits of Open-Mindedness and Empathy are fitting traits from her compiled list. Any additional Origin traits desired will cost 1 BP each.*

---

## OCCUPATION

The **Occupation stage** of character creation in Tangent involves selecting an occupation that reflects your character's profession and area of expertise. This choice not only adds flavor and depth to their identity but also grants them specific skills and abilities that reflect their training and experience.

- **Skill Points:** Each occupation comes with **20 Occupational Skill Ranks** that can be allocated to a specific set of skills relevant to that occupation. This allows players to further customize their character's capabilities and specialize in their chosen profession.
- **Occupational Traits:** Players can choose **2 Occupational Traits** from a list of options associated with their selected occupation. These traits represent specific characteristics or abilities that are common among members of that profession. (Traits from Origin and Occupation are interchangeable if befitting the character.)
- **Recommended Features:** Occupations may also suggest certain features that complement the character's skills and abilities. These features can provide additional benefits or open up new opportunities for roleplaying and advancement.
- **Additional Traits:** Players have the option to select additional traits and features beyond the free ones provided by their occupation, but these come at a cost of **1 Build Point (BP) each**. This allows for further customization but requires careful consideration of the character's overall build and BP budget.

> [!TIP]
> **Example (Occupation):**  
> *Xy'larra will fit well in the Representative Occupation, focusing on her diplomatic endeavors. Again gaining 20 Skill ranks and 2 features, now chosen from the Representative Occupation - May choose from any Manipulation Skills and traits available are Analytical, Conflict Resolution, Creativity, Emotional Intelligence, Flexibility, Integrity, Languages, Negotiation, Networking, and Time Management. The Skill Feature category is recommended for Representatives (reducing the cost of such Features by 1 BP, to 1 BP minimum cost of any feature).*  
> - *Her skills gained will be Insight 10 (near expert at reading other people), Bluff 5 and Diplomacy 5.*  
> - *Traits chosen are Conflict Resolution (+2 training bonus to Diplomacy) and Emotional Empathy (+2 training bonus to Insight). Any additional occupational traits she would like will have a cost 1 BP each.*  
> - *During her training for her occupation she developed the Attractive (+2 appearance bonus to certain social checks) and Educated features (+2 trained bonus to Academics skill and +1 trained bonus to all Knowledge checks). Any additional features chosen from the Skill category will cost her 1 BP less.*

---

## TECHNOLOGY

The **Technology Level stage** of character creation in Tangent involves determining your character's access to and understanding of technology. This is influenced by their species and faction and has significant impacts on their skills, wealth, and available equipment.

- **Skill Bonuses:** Characters gain specific bonuses to certain skills based on their technology level, reflecting the knowledge and expertise associated with that level of technological advancement.
- **Wealth Bonus:** Technology level also provides a wealth bonus, representing the increased access to resources and opportunities that come with advanced technology.
- **Equipment and Improvements:** The availability of equipment, augmentations, and other technological enhancements is directly tied to a character's technology level. Higher technology levels unlock more advanced and powerful options.
- **Skill Access:** The character's technology level may also limit their access to certain skills that require specific technological knowledge or training.

> [!TIP]
> **Example (Technology):**  
> *Being an Alterian from the Alterian Combine Xy'larra is both tech-savvy and magic-adept, seamlessly blending futuristic tools with arcane arts. Alterians are known for grace, agility, and magical talent, living in a Space Age society that values both innovation and tradition. She gains a +25 Skills Points for skills of choice and has access to a full range of Meta training from her people due to its widespread use in Elven society.*  
> - *Good time to pick up some other skills such as Alertness 5 and Unarmed 5, and she’ll add another 5 to Academics, Bluff and Diplomacy.*

---

## HINDRANCES

Players have the option to select **Hindrances** for their characters, such as quirks, flaws, or disabilities. These Hindrances add depth and realism to the character, making them more relatable and nuanced. However, they also come with drawbacks that can hinder the character's abilities or create challenges in certain situations. In exchange for taking on these Hindrances, players are rewarded with **additional Build Points (BP)** that can be used to purchase other aspects of their character, such as skills, features, or equipment.

> [!TIP]
> **Example (Hindrances):**  
> *Although she didn’t have tedious background but during her travels Xy'larra has gained a Dependent - Marla a young cousin who she is responsible for but who happens to be somewhat capable so gains 3 BP to add to the characters total (less capable dependent would garner more points) - The Marla dependent may evolve into the companion feature or an entirely separate character in time, but for now she’s an Elven teenager running around with all the possible implications of such.*

---

## FEATURES

The **Features stage** of character creation in Tangent allows you to further customize your character by selecting features that enhance their capabilities. These features can represent a wide range of abilities, from innate talents and learned techniques to technological or magical enhancements.

- **BP Cost:** The default cost for a feature is **3 Build Points (BP)**, but this cost can be reduced if the feature is recommended by the character's species, origin, faction, or occupation. This encourages players to consider features that complement their character's background and role in the game world.
- **Variety of Options:** Features can provide a variety of options, such as increased resilience; improved skills or proficiencies; or even unique abilities that set the character apart from others.
- **Strategic Choices:** Choosing features requires careful consideration, as players must balance the benefits of each feature against its BP cost and its relevance to the character's overall concept and playstyle.

> [!TIP]
> **Example (Features):**  
> *In addition to the Attractive and Educated features gained from her occupation package Xy'larra will want more features to focus and expand on her concept. Features cost 3 BP each unless recommended from a character’s aspect (such as occupation and at a minimum cost of 1 BP after all reductions). In Xy'larra’s case Skill Features are recommended, reducing the costs of all Skill Features to 2 BP - guiding her to be more skill intensive coupling with many of the features granting bonuses and modifiers to skill checks.*  
> *Currently she has the following Features:*  
> - *Attractive*  
> - *Educated*  
> - *Awakened x3 to open the skills for the Mental, Entropy and Dimensional Disciplines*

---

## SKILLS

The **Skills stage** of character creation in Tangent involves allocating Build Points (BP) to enhance your character's various skills. Each rank of a skill costs **1 BP**, allowing you to improve your character's competencies in different areas. Skills are categorized into five groups:

1. **Physical:** These skills govern physical actions and attributes, such as athletics, acrobatics, and stealth.
2. **Mental:** These skills pertain to intellectual pursuits and knowledge, including technology, medicine, and science.
3. **Social:** These skills focus on interaction and communication with others, encompassing skills like persuasion, deception, and leadership.
4. **Discipline:** These skills represent specialized training and focus often associated with specific professions or various Metaphysical practices.
5. **Combat:** These skills determine a character's effectiveness in combat situations, including melee combat, ranged combat, and tactics.

> [!TIP]
> **Example (Skills):**  
> *Xy'larra wants to be capable in a wide range of skills with a focus on being an Explorative Ambassador. She currently has the following from her character aspects so far:*  
> - *Piloting 5*  
> - *Alertness 5*  
> - *Academics 10*  
> - *Culture 5 (Know)*  
> - *Navigation 5 (Know)*  
> - *Ambassador 5 (Voc)*  
> - *Insight 10*  
> - *Bluff 10*  
> - *Diplomacy 10*  
> - *Defense 5*  
> - *Melee 5*  
> - *Unarmed 5*  
> - *Attune 5 (Metaphysic Skill)*  
> - *Sensory 10 (Mental Discipline - Metaphysic Skill)*

---

## AUGMENTATIONS

The **Augmentations stage** of character creation in Tangent is optional and allows players to enhance their characters with permanent augmentations, such as cybernetics or bio-modifications. These augmentations can offer significant advantages, such as increased strength, enhanced senses, or unique abilities. However, they may also come with drawbacks or limitations, and they require Build Points (BP) to acquire.

> [!TIP]
> **Example (Augmentations):**  
> *Not feeling a lot of Augmentations she ends up with a subdermal Comm Implant and ID Chip (for convenience wise and negligible invasiveness).*

---

## PROPERTY

The **Property stage** of character creation in Tangent involves equipping your character with the necessary tools and belongings for their adventures. This includes:

- **Weapons:** Choose weapons that suit your character's combat style and preferences, considering factors such as their skill proficiencies, available funds, and the technology level of the setting.
- **Armor:** Select armor that provides adequate protection without hindering your character's movement or abilities. Consider the character's occupation and the types of threats they are likely to face.
- **Gear:** Acquire gear that supports your character's occupation and lifestyle. This could include tools, supplies, communication devices, or other equipment that aids them in their endeavors.
- **Mecha or Mounts:** Depending on the setting and your character's background, they may have access to vehicles or mounts that facilitate travel and exploration.

Characters begin with simple possessions appropriate for their skills, abilities, background, and tech level. This includes basic personal items and tools needed for any applicable skills. A character's access to and the quality of their possessions is affected by their technology level. For example, a character from a low-tech background may only have access to simple tools and weapons, while a character from a high-tech faction could have advanced weaponry and equipment.

If a character wants additional or special equipment, weapons, armor, mecha, or mounts, there are two options:
1. **Increase their Wealth score** to buy the items.
2. **Acquire the Benefit Feature** - This will give them access to replaceable equipment, which can range from enhanced gear to a starship.

> [!TIP]
> **Example (Property):**  
> *As a diplomat and explorer, Xy'larra carries equipment tailored to her professional needs and nomadic lifestyle. She utilizes a secure, long-range Diplomatic Comm-Link, wears a stylish, light-weave armored garment that provides subtle protection, and carries a versatile morphic multi-device used for data analysis and field repairs (personal Wealth used for typical needs). Additionally, she has been granted access to a sleek, scout-class star yacht for her diplomatic missions and explorations (Benefit Feature).*

---

## META

The **Meta stage** of character creation in Tangent focuses on developing the metaphysical capabilities of characters who have access to magic, psychic powers, or other supernatural abilities.

- **Awakened Feature:** This feature is a prerequisite for accessing Discipline skills, which govern the use of metaphysical abilities.
- **Discipline Skills:** These skills represent specific areas of expertise within the metaphysical realm, such as Alteration, Conjuration, or Divination.
- **Invocations:** These are specific skills or abilities within a chosen Discipline, representing spells, psychic techniques, or other supernatural manifestations. Invocations are treated as separate skills and can be improved independently.
- **Specialization or Special Ability:** Invocations can be learned either as a Specialization within a Discipline skill or separate as a Special Ability Feature, with each rank costing 1 Character Point (CP).

> [!TIP]
> **Example (Meta):**  
> *Meta Features and Discipline Skills already known as listed above:*  
> - *Discipline Feature of Awakened taken 3 times (for the Mental, Entropy and Dimensional Disciplines)*  
> - *Has access to the Discipline skills of Summoning, Teleport (Dimensional); Projection, Sense (Mental); Chaos, Order (Entropy) and Attune (the activation skill for Meta Disciplines).*  
> - *Current skills of Attune 5 and Sensory 10 (Mental Discipline)*

---

## DERIVED COMBAT & SURVIVAL STATISTICS

| Statistic | Calculation Formula | Description |
| :--- | :--- | :--- |
| **Max Hit Points (HP)** | Base (10) + (Stamina Mod * 2) + Rank Multipliers | Total physical trauma capacity |
| **Initiative Check** | 2d10 + Reflex Save + Agility Mod | Reaction speed at start of combat |
| **Might Check** | d20 + Strength Mod + Athletics Rank | Physical power, breaking DC, grappling |
| **Fortitude Save** | d20 + Stamina Mod + Survival Rank | Resistance to poison, shock, radiation |
| **Reflex Save** | d20 + Agility Mod + Acrobatics Rank | Evasion of blast radii and traps |
| **Logic Check** | d20 + Intellect Mod + Science/Tech Rank | Deductive analysis and computation |
| **Will Save** | d20 + Wisdom Mod + Alertness Rank | Mental grit, fear, and psionic defense |
| **Etiquette Check** | d20 + Charisma Mod + Culture Rank | Social poise and diplomatic standing |`,
  mechanic: `BaseBP = 150
AttributeCost = 5 BP per +1 (Max +4 raw at creation)
SkillRankCost = 1 BP per rank
FeatureBaseCost = 3 BP (2 BP if Recommended, 1 BP Minimum)
TotalFoundationalGrants = 60 Skill Ranks + 4 Features + 4 Traits (From Faction, Origin, Occupation)`,
  guide: `1. Define concept, background, and persona goals.
2. Deduct Species BP cost from the 150 BP pool; apply species ability modifiers and inherent traits.
3. Allocate remaining BP to Attributes (5 BP each, max +4), Skills (1 BP each), and Features (3 BP / 2 BP).
4. Allocate 20 Faction SP, 20 Origin SP, and 20 Occupation SP from background pools.
5. Select 2 Origin Traits and 2 Occupation Traits.
6. Calculate derived Hit Points, Toughness, Initiative, and Saving Throws.`,
  note: `Remember, character creation in Tangent is designed to be highly flexible, and these steps can be adapted to fit your preferences and the GM's guidelines.`
});

addArticle({
  id: '1-01-01-core-attributes-checks',
  name: '1.01.01 Core Attributes, Checks & Derived Perception',
  parent: '1.00 CHARACTER CREATION & ECONOMY',
  order: 2,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 1.01.01 Core Attributes, Checks & Derived Perception

Attributes are a crucial aspect of character creation and gameplay. They represent a character's natural aptitudes and talents, influencing their success in various tasks and challenges. The six core attributes are **Strength, Agility, Stamina, Intellect, Wisdom, and Charisma**.

---

## 1. Cost & Starting Maximums

- **Cost:** **5 BP per +1 increase** in an attribute score.
- **Baseline:** The average score for an ordinary human is **+0**.
- **Creation Maximum:** During Character Creation, no raw attribute score may exceed **+4** before species adjustments or mechanical augmentations are applied.
- **Paragon Tier (+5):** A score of +5 indicates exceptional mastery and peak genetic or species capability.
- **Non-Attribute Flaw (-25 BP):** A character lacking an attribute completely (e.g. an AI construct lacking physical attributes) automatically fails all checks with it.

---

## 2. Attribute Checks & Saving Throws

Attribute checks act as a fallback for actions not covered by specific skills and serve as saving throws against hazards.

### How Attribute Checks are Calculated
\`Base Check Score = 2 + (Attribute Score * 2)\`  
\`Roll = d20 + Base Check Score + Modifiers\`

| Attribute | Derived Check | Core Mechanical Influence |
| :--- | :--- | :--- |
| **Strength (STR)** | **Might Check** | Carrying/lifting capacity, melee weapon damage, breaking doors and bending bars |
| **Agility (AGI)** | **Reflex Check** | Dodging attacks, acrobatics, ranged weapon accuracy, initiative |
| **Stamina (STA)** | **Fortitude Check** | Toxic/disease resistance, base toughness, enduring extreme weather |
| **Intellect (INT)** | **Reason Check** | Deductive logic, technical crafting, decoding ciphers, forensic knowledge |
| **Wisdom (WIS)** | **Willpower Check** | Sensing deception, resisting fear, mental defenses against psionics |
| **Charisma (CHA)** | **Etiquette Check** | Leadership, complex negotiation, social navigation, bartering |

---

## 3. Derived Perception

**Perception** is a sub-ability derived by combining Intellect and Wisdom scores:
\`Perception Base = Intellect + Wisdom\`

### Focused Perception Types
- **Default Awareness (Alertness):** Perception Base + Alertness skill (spotting hazards, ambushes, visual cues).
- **Meta Sensory (Attune):** Perception Base + Attune skill (detecting subtle magical or psionic aura signatures).
- **Social Insight (Insight):** Perception Base + Insight skill (reading facial cues, body language, emotional deception).
- **Technical Analysis (Technology):** Perception Base + Technology skill (evaluating hardware vulnerabilities, sensor scans).`,
  mechanic: `BaseAttributeScore = 0 (Standard Human)
AttributeCheck_Base = 2 + (AttributeScore * 2)
PerceptionBase = Intellect + Wisdom
AttributeCheck_Roll = d20 + AttributeCheck_Base + Modifiers`,
  guide: `Use Attribute Checks primarily for saving throws and fallback situations not covered by specific learned skills.`,
  note: `Attribute checks are not a replacement for trained skills; unassisted raw checks lack focus strike and specialization bonuses.`
});

addArticle({
  id: '1-01-02-vitality-health-structure',
  name: '1.01.02 Vitality, Health, Structure & Toughness',
  parent: '1.00 CHARACTER CREATION & ECONOMY',
  order: 3,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 1.01.02 Vitality, Health, Structure & Toughness

In Tangent, a character's ability to endure and recover from damage is represented by **Vitality**, **Health**, and **Structure** (for Synthetics and non-biological entities).

---

## 1. Vitality vs. Health Breakdown

- **Vitality (Starting Base: 30):** Represents energy, stamina, physical resilience, and luck. Non-lethal damage, fatigue, and minor scrapes deplete Vitality first.
- **Health (Starting Base: 30):** Represents biological life force and anatomical integrity. Severe weapon trauma, critical hits, and deep wounds damage Health after Vitality is exhausted.
- **Structure (Combined Pool):** For Synthetics, Golems, Mecha, and Undead lacking biological buffers, Vitality and Health are combined into a single unified **Structure** pool.

---

## 2. Increasing Pools with Build Points

- **Cost:** **1 BP = +5 Vitality** or **+5 Health** during character creation.
- **Suggested Soft Cap:** 60 points in each pool at character creation.

---

## 3. Toughness & Damage Reduction

- **Toughness:** A character's Stamina score provides base **Toughness**, reducing incoming kinetic and physical trauma on a point-for-point basis before Armor DR.

---

## 4. Concussive Damage, Explosions & Falls

Concussive and blast damage is dispersed over the entire body:
- If a character attempts a defensive reaction (Reflex save), blast damage is **divided equally between Vitality and Health**.`,
  mechanic: `StartingVitality = 30 + (PurchasedBP * 5)
StartingHealth = 30 + (PurchasedBP * 5)
Structure = Vitality + Health (for Synthetics/Objects)
DamageSoak = IncomingDamage - Toughness - ArmorDR`,
  guide: `Deplete Vitality first when taking damage from standard attacks; apply damage to Health once Vitality reaches 0.`,
  note: `Critical hits bypass the Vitality buffer and inflict direct Health damage.`
});

addArticle({
  id: '1-01-03-karma-fate-economy',
  name: '1.01.03 Karma, Fate Points & Narrative Powers',
  parent: '1.00 CHARACTER CREATION & ECONOMY',
  order: 4,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 1.01.03 Karma, Fate Points & Narrative Powers

**Karma** is an essential aspect of the Tangent RPG system that provides players with a limited resource they can strategically use to influence various aspects of the game. It serves as a pool of points that can be spent to affect dice rolls, modify character actions, and even shape narrative outcomes.

---

## 1. Karma Pool Basics

Characters have **3 Karma Points** by default.

- **Session Reset:** Karma resets to max (Default 3) at the start of every session. It does not regenerate via rest.
- **Heroic Gain:** The GM / Architect may award 1 Karma Point immediately for "Heroic" or "Awesome" actions.
- **Restoration:** All Karma Points are fully restored at the start of each game session, or regained through significant story moments (chapters) or by performing 'heroic' or awesome actions. Karma Points are **not recovered by rest**.
- **Increasing the Pool:** The *Karmic Blessing* feature allows characters to increase their maximum Karma Pool by **+1 point per rank** of the feature. Otherwise, the pool will be increased by possible storyline milestones and GM prerogative.

---

## 2. Using Karma Points

Karma Points can be spent to activate various effects, but they will not guarantee a success. These effects are in addition to any other modifiers and will stack accordingly. Critical failures and successes may be adjusted as any other rolls following the listed mechanics.

| Expenditure Option | Timing | Cost | Scope & Effect |
| :--- | :--- | :---: | :--- |
| **"I Got This"** | Declare *before* making the roll | 1 KP | **Advantage on Any Single Roll:** Roll twice, keep higher result. Usable on ability checks, skill checks, attacks, saves, and damage rolls. |
| **"Not What I Meant"** | Declare *immediately after* initial roll | 1 KP | **Reroll Ability / Non-Combat Skill Check:** Discard roll and reroll. Must accept 2nd result even if worse. Cannot be used on combat/attack rolls. |
| **"Shake it Off"** | Declare anytime suffering temporary condition | 1 KP | **Reduce Condition Severity by 1 Stage:** Lowers conditions like Poisoned, Stunned, or Blinded by one level (e.g. Major to Minor). |
| **"Second Wind"** | Spend 1 full minute of internal focus | 1 KP | **Replaces Light Rest:** Bypasses downtime to instantly refresh daily limited-use abilities, special attacks, traits, or features. |
| **"So Mote it Be"** | Declare *simultaneously* with metaphysical skill/feat | 1 KP | **Metaphysical Potency:** Boosts metaphysical check potency (range, duration, magnitude) or activates a specialized discipline Karma Feat. |
| **"By Will Alone"** | Declare action with GM approval | 1 KP | **Push Limits / Narrative Agency:** Attempt impossible or unlisted actions, emulate a basic feature for a scene, or nudge a rule in character's favor. |

### The 6 Core Karma Actions Explained

#### "I Got This"
This Karma Point expenditure option allows players to gain an advantage on any single roll.
- **Declaration:** The player must declare they are using "I Got This" before making the roll.
- **Any Single Roll:** It can be used on any dice roll, including ability checks, skill checks, attack rolls, saving throws, and even damage rolls. This versatility makes it a valuable tool in various situations.
- **Advantage:** Gaining advantage means rolling the die twice and taking the higher result. This significantly increases the character's chance of success.

#### "Not What I Meant"
This option of the Karma mechanic allows a player to reroll an Ability Check or a non-combat Skill Check.
- **Timing:** The player must declare they are using "Not What I Meant" immediately after the initial roll.
- **Scope:** It applies to Ability Checks (Strength, Agility, etc.) and non-combat Skill Checks (Technology, Medicine, etc.). This excludes attack rolls, damage rolls, and other combat-specific rolls.
- **Acceptance:** The second roll's result must be accepted, even if it's worse than the first.

#### "Shake it Off"
This Karma Point expenditure option allows characters to reduce the severity of temporary conditions affecting them.
- **Temporary Conditions:** These are short-term effects that hinder a character's abilities or actions. Examples include being Poisoned, Stunned, or Blinded.
- **Severity Stages:** Many conditions have severity levels, such as Poisoned (Minor, Major, Critical).
- **One Stage Reduction:** Spending a Karma Point allows the character to reduce the condition's severity by one stage. For example, a character suffering from Major Poisoning could reduce it to Minor Poisoning.
- **Timing:** This can be used anytime the character is suffering from a temporary condition.

#### "Second Wind"
This Karma Point expenditure option allows a character to quickly refresh their abilities and resources, bypassing the need for a Light Rest.
- **Replaces Light Rest:** A Light Rest is a short period of downtime during which characters can recover some spent abilities or regain limited uses of certain features. "Second Wind" allows a character to achieve the same benefits without needing to take a Light Rest.
- **1 Full Minute:** Using "Second Wind" requires the character to spend 1 full minute focusing on themselves and their inner reserves. This represents the character drawing upon their willpower and determination to push through fatigue and replenish their energy.
- **Specific Benefits:** The exact benefits of using "Second Wind" depend on the character's traits, abilities, and features. Generally, it can be used to refresh abilities that have a limited number of uses per day, such as special attacks, traits or features.

#### "So Mote it Be"
This Karma Point expenditure option interacts with a character's metaphysical abilities, enhancing their power or enabling special feats.
- **Metaphysics Users:** This option is available to characters who have access to metaphysical abilities, such as magic, psychic powers, or other supernatural forces.
- **Karma Feat Activation:** A Karma Point can be spent to activate a Karma Feat, which is a special ability or enhancement tied to the character's metaphysical disciplines. These feats might grant temporary bonuses, unique effects, or powerful attacks.
- **Skill Boost:** Alternatively, a Karma Point can be used to boost the effectiveness of a metaphysical skill check. This could increase the power of a spell, the range of a psychic ability, or the duration of a supernatural effect.
- **Simultaneous Use:** The Karma Point expenditure must be declared along with the use of the metaphysical skill or feat. This means the player decides to use "So Mote it Be" at the same time they declare they are using the skill or feat, not after the roll is made.

#### "By Will Alone"
This is a unique Karma Point expenditure, allowing characters to attempt actions that push the boundaries of their normal capabilities.
- **GM Discretion:** The core of "By Will Alone" is the GM's judgment. Players propose an action, and the GM decides if it's possible within the game world and the character's potential.
- **Possible but Challenging:** The action must be something that's not explicitly covered by the character's skills or abilities, but is theoretically achievable with extreme effort, luck, or a narrative justification. The effect could involve a nudge of a rule for one action or event in the character’s favor, the emulation of a basic feature for the event or scene and similar low-end temporary game tweaks for character agency (within GM’s approval for the ongoing story).
- **Karma Point Cost:** Attempting the action requires spending a Karma Point, regardless of success or failure. This represents the character tapping into their inner reserves or pushing their luck.
- **No Guarantee:** Even with a Karma Point spent, success is not guaranteed. The GM may call for an ability check, a skill check, or a unique challenge to resolve the action's outcome.

---

## 3. Plot Points

Plot Points are a special resource in Tangent RPG, awarded by the GM to players who actively engage with the story and its challenges.

- **Separate from Karma Pool:** Plot Points function similarly to Karma Points, allowing players to influence rolls and actions. However, they are a separate resource and do not count towards the character's Karma Pool maximum.
- **Temporary and Specific:** Plot Points are temporary and must be used within the specific scenario or story arc they were awarded in. This encourages players to use them strategically and think about how they can best contribute to the unfolding narrative.
- **Compensation and Balance:** Plot Points are often granted to characters who find themselves in situations beyond their control, as a form of compensation or to help balance the challenges they face. This can help ensure that all players have a meaningful impact on the story, even if their characters are not the most powerful or skilled.

---

## 4. Negative Karma (Karmic Debt)

Negative Karma allows characters to push their luck and potentially face consequences for their actions.

- **GM's Discretion:** The allowance of Negative Karma is entirely at the GM's discretion who will decide when and how to apply its effects, tailoring it to the specific situation and the character's actions. Incurring Negative Karma points are up to the players themselves.
- **Spending Karma into the Negatives:** Characters can choose to spend Karma Points even when they have none left, effectively going into "Karmic debt." This debt is limited to the character's **Charisma score + 1** (e.g. Charisma 3 permits spending down to -4 Karma).
- **Karmic Effects:** Negative Karma Points allow the GM to introduce various effects that hinder the character or benefit their opponents. These effects are typically narrative in nature, reflecting the character's misfortune or the universe balancing the scales:
  - **Disadvantage on Rolls:** A common Karmic effect is imposing disadvantage on the character's rolls. This means they roll twice and take the lower result, significantly reducing their chances of success.
  - **Forced Rerolls:** The GM might also force the character to reroll successful rolls, introducing uncertainty and potentially turning a victory into a failure.
  - **NPC Benefits:** Negative Karma can also positively affect NPCs who are directly opposing the character. This could manifest as increased luck, improved skills, or unexpected advantages that help them overcome the character's efforts.`,
  mechanic: `BaseKarma = 3
MaxKarmaDebt = Charisma + 1
Advantage = Roll 2d20, Take Highest Result
Disadvantage = Roll 2d20, Take Lowest Result
ConditionReduction = -1 Severity Stage (Major -> Minor -> Cleared)
SecondWind = 1 Min Focus, Replaces Light Rest`,
  guide: `Spend Karma points during critical encounters to gain Advantage, reroll non-combat failures, reduce debuffs, or bend reality. Track Plot Points separately for arc-specific narrative boosts.`,
  note: `Negative Karma must never exceed Charisma + 1 and grants the GM narrative complication triggers until resolved.`
});

addArticle({
  id: '1-01-04-rest-recovery-cycles',
  name: '1.01.04 Rest, Recovery & Biological Cycles',
  parent: '1.00 CHARACTER CREATION & ECONOMY',
  order: 5,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 1.01.04 Rest, Recovery & Biological Cycles

Rest mechanics govern how characters recover spent abilities, heal Vitality, and reset traits between hazardous encounters.

---

## 1. Full Rest (6 to 8 Hours)

- **Standard Species:** 6 to 8 hours of uninterrupted sleep restores all lost Vitality and resets daily features.
- **Synthetic & Insectoid Races:** Do not sleep in the traditional biological sense; require only a brief diagnostic cycle or Light Rest.
- **Alterians & Mondi:** Engage in deep contemplative meditations (counted as Light Rest) rather than biological unconsciousness.

---

## 2. Light Rest (Naps & Meditation)

A Light Rest is a short rest period (up to **4 times per day**) that resets minor features and recharges stamina:

- **Nap or Meditation (1 Hour):** The most restful period; complete downtime with zero activity.
- **Lounging (2 Hours):** Casual conversation, reading, and light observation.
- **Light Duty (3 Hours):** Minimal labor, weapon maintenance, or monitoring starship sensors.
- *Interruption:* Any strenuous activity during a rest period degrades the rest tier by one stage.`,
  mechanic: `FullRest_Duration = 6-8 Hours (Restores 100% Vitality, Resets Daily Traits)
LightRest_MaxPerDay = 4
NapDuration = 1 Hour`,
  guide: `Declare Light Rests during transit or post-combat triage to reset short-rest abilities.`,
  note: `Architects should enforce environmental threats if characters attempt to rest in unsecured hostile zones.`
});

addArticle({
  id: '1-01-05-death-dying-revivification',
  name: '1.01.05 Death, Dying & Revivification',
  parent: '1.00 CHARACTER CREATION & ECONOMY',
  order: 6,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 1.01.05 Death, Dying & Revivification

In Tangent, characters are protected by a two-tiered health buffer, but lethal trauma requires swift medical intervention.

---

## 1. The Threshold of Death

When a character's Health drops to **0 HP**:
1. **Incapacitation:** The character immediately falls unconscious, drops held items, and gains the **Prone** condition.
2. **Death's Door:** If both Health and Vitality are at 0, the character is dying and enters a comatose state.
3. **The Death Clock:** The character has a number of rounds equal to their **Stamina Score** (Minimum 1 round) to receive medical aid.
4. **Stabilization:** A successful **Medicine check (DC 15)** or trauma nanite injection halts the death clock.
5. **Massive Damage:** Taking damage equal to or exceeding their Stamina score in a single hit while at Death's Door causes instant death.

---

## 2. Revivification ("The High Cost of Dying")

Returning a character from the dead requires advanced TL5 medical clone synthesis or high-tier ML5 Metaphysics:
- **Penalties:** The revived character loses all remaining Karma Points and incurs a **-5 Experience Debt** until repaid through heroic gameplay.`,
  mechanic: `DeathClock_Rounds = max(1, StaminaScore)
Stabilization_DC = Medicine DC 15
Revive_Penalty = Lose All Karma + 5 XP Debt`,
  guide: `Allies should prioritize stabilizing downed teammates within their Stamina round window.`,
  note: `Revivification should be a rare, momentous narrative arc rather than a routine transaction.`
});

addArticle({
  id: '1-01-06-experience-award-points',
  name: '1.01.06 Experience, Award Points (AP) & Advancement',
  parent: '1.00 CHARACTER CREATION & ECONOMY',
  order: 7,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 1.01.06 Experience, Award Points (AP) & Advancement

Character advancement in Tangent is measured through **Award Points (AP)** granted for completing story chapters, overcoming formidable adversaries, and immersive roleplay.

---

## 1. Spending Award Points

- **Conversion:** **1 AP = 1 BP** for purchasing new skills, attributes, features, or augmentations.
- **Advancement Pacing:** Abilities and skills may only be increased by **+1 rank per experience award**, representing progressive natural training.

---

## 2. Story & Session Awards

| Award Type | AP Granted | Criteria & Trigger |
| :--- | :---: | :--- |
| **Chapter Completion** | **5 – 10 AP** | Awarded upon completing a major narrative storyline or planetary arc. |
| **Defeating Major Villain / Goal**| **1 – 3 AP** | Awarded for overcoming critical campaign obstacles or arch-villains. |
| **Session Participation** | **0 – 2 AP** | Awarded for tactical focus, mission engagement, and teamwork. |
| **In-Character Roleplaying** | **0 – 2 AP** | Awarded for dramatic dialogue, embodying flaws, and creative solutions. |`,
  mechanic: `1 AP = 1 BP for Character Folio Advancements
MaxSingleStatIncrease_PerAward = +1 Rank`,
  guide: `Spend AP between gaming sessions to advance your Persona Folio capabilities.`,
  note: `Architects should distribute AP at the end of each session or chapter downtime.`
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

The Tangent Combat System uses a **2d10 dice system** that factors in character skills, abilities, and situational modifiers. Combat actions are determined by Skill Rank, with higher Ranks unlocking additional actions per turn.

---

## 1. The Core Attack Roll Formula

$$\\text{Attack Roll} = 2d10 + \\text{Skill Rank} + \\text{Attribute Mod} + \\text{Situational Modifiers} \\quad \\text{vs.} \\quad \\text{Target Defense (DC)}$$

- **Dual 10s (Natural 20)**: Critical Success (evaluated as 30).
- **Dual 1s (Natural 2)**: Critical Fumble (evaluated as -10).

---

## 2. Opposed vs. Unopposed Combat Checks

### Opposed Attack Check (Active Target)
- When targeting an active, aware opponent:
  $$\\text{Defender\'s Agility} + \\text{Defense Skill} + \\text{Situational Mods} \\quad \\text{vs.} \\quad \\text{Attacker\'s Ability} + \\text{Combat Skill} + \\text{Bonuses}$$
- **Attacker wins**: A strike or success.
- **Defender wins**: The attacker misses or an unsuccessful action.
- > [!IMPORTANT]
  > **THE GOLDEN RULE OF TANGENT COMBAT: DEFENDER WINS ALL TIES.**

### Unopposed Attack Check (Stationary / Surprised Target)
- Target is not defending, surprised, or stationary.
- Attacker rolls: $\\text{Attacker\'s Ability} + \\text{Combat Skill} + \\text{Bonuses}$ vs. **CR 15 (Average)** for a typical medium-size target within short range (modified for target\'s Size, Range, and Movement).`,
  mechanic: `Opposed: Attacker (2d10 + Skill + Attr + Mod) vs Defender (Agility + Defense Skill + Mod) [Defender wins ties]
Unopposed: Attacker Roll vs CR 15 + SizeMod + RangeMod + MoveMod`,
  guide: `On your turn in combat: declare target, choose weapon, roll 2d10 attack check against target's defense roll or static DC.`,
  note: `Defender wins ties on all opposed checks, emphasizing defensive positioning and reactive cover.`
});

addArticle({
  id: '3-00-01-action-economy-skill-tiers',
  name: '3.00.01 Action Economy & Skill Tiers (Rank 0–30 Actions)',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 2,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: `# 3.00.01 Action Economy & Skill Tiers (Rank 0–30 Actions)

Combat capability is defined by the **Skill Tier**. As a character gains Ranks, they gain additional actions and Focus Strike bonuses per turn.

---

## Master Skill Tier Action Table

| Rank Range | Actions | Benchmark / Title | Focus Bonus |
| :--- | :--- | :--- | :---: |
| **0** | **Full Round Action** | Untrained | — |
| **1 – 5** | **1st action** at base score | Novice / Studied | **+2** |
| **6 – 10** | **2nd action** at base score -5 | Professional / Trained | **+3** |
| **11 – 15** | **3rd action** at base score -10 | Expert | **+4** |
| **16 – 20** | **4th action** at base score -15 | Master | **+5** |
| **21 – 25** | **5th action** at base score -20 | Grand Master | **+6** |
| **26 – 30** | **6th action** at base score -25 | Pinnacle | **+7** |

---

## Multiple Active Defenses

- A character may attack with as many actions as the used skill allows.
- They may also make as many **Active Defense** checks as allowed based on their Defense Skill Rank.
- **Subsequent Defense Penalty**: All consecutive active defense checks after the first reaction suffer a cumulative **-5 penalty** (1st defense: base; 2nd defense: -5; 3rd defense: -10; 4th defense: -15, etc.).`,
  mechanic: `Actions: Rank 1-5 (1 act @ +0), Rank 6-10 (2 acts @ -5), Rank 11-15 (3 acts @ -10), Rank 16-20 (4 acts @ -15), Rank 21-25 (5 acts @ -20), Rank 26-30 (6 acts @ -25)
Active Defense Penalty: (DefenseReactionIndex - 1) * -5`,
  guide: `Declare your primary action on your turn. Higher ranks allow additional strikes with cumulative -5 penalties.`,
  note: `Focus Strike bonus adds directly to all attack rolls made with dedicated weapons in that skill.`
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

$$\\text{Initiative} = 2d10 + \\text{Reflex Save} + \\text{Agility Mod}$$

- **High Roll Goes First:** Combatants act in descending order of initiative totals.
- **Ties:** Broken first by higher Agility score, then by higher Alertness skill rank.
- **Situational Modifiers:** Ambush, environment, and surprise affect initiative checks.

---

## 2. Surprise & Sneak Attacks

- **Unaware Target:** The target is unaware of an incoming attack and **will be unable to make any Defense check** to evade the attack and subsequently reduce damage if not evaded.
- **Attack Roll:** Made at **-5 to hit** but with **NO DEFENSE** from the target.
- **Damage:** Damage is rolled at **Advantage** in addition to other precision/sneak effects.
- **Danger Sense:** The Danger Sense Feature allows an Advantageous check to be aware of an impending attack regardless of the source.`,
  mechanic: `Initiative = 2d10 + ReflexSave + AgilityMod
Surprise Attack: Attacker at -5 to hit vs NO Target Defense; Damage rolled with Advantage`,
  guide: `Roll 2d10 initiative once at encounter start. Ambushes deny defender reaction defense.`,
  note: `Danger Sense prevents surprise and grants advantage on awareness tests.`
});

addArticle({
  id: '3-00-03-attack-defense-modifiers',
  name: '3.00.03 Attack & Defense Modifiers (Size, Range, Movement)',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 4,
  perspective: 'architect',
  entry_type: 'Combat Matrix',
  description: `# 3.00.03 Attack & Defense Modifiers (Size, Range, Movement)

Complete reference matrices for target size modifiers, weapon range brackets, moving targets, and moving attackers.

---

## 1. Target Size Modifiers Matrix

| Size | Modifier (Target DC) |
| :--- | :---: |
| **Miniscule** | **-32** |
| **Fine** | **-16** |
| **Diminutive** | **-8** |
| **Tiny** | **-4** |
| **Small** | **-2** |
| **Medium** | **0** |
| **Large** | **+2** |
| **Huge** | **+4** |
| **Gargantuan** | **+8** |
| **Colossal** | **+16** |

---

## 2. Range Brackets & Reach Matrix

| Category | Modifier (DC) | Range Bracket |
| :--- | :---: | :--- |
| **Melee** * | **0 (15)** | WITHIN REACH |
| **Point Blank** ** | **+5 (10)** | WITHIN REACH |
| **Short** | **0 (15)** | Base Range Listed |
| **Medium** | **-5 (20)** | 2x Base Range |
| **Long** | **-10 (25)** | Up to 5x Base Range |
| **Extreme** | **-15 (30)** | Up to 10x Base Range |

\\* **Melee Reach by Size**: Tiny and Smaller 2 ft, Small and Medium 5 ft, Large and Huge 10 ft.  
\\*\\* **Point Blank Rule**: For Ballistic and Energy Weapons, shots striking at Point Blank inflict **Damage with Advantage** (rolling damage dice twice and taking highest result) in addition to the listed **+5 Strike bonus**.

---

## 3. Moving Targets & Attackers Tactical Matrix

| Category | Rule | Defender | Attacker | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **MOVING TARGETS** | Running Penalty | — | -2 Attack | Applies to ranged attacks. |
| | Distance-Based (20+ ft) | +2 Defense | — | For movement 20+ feet in a round. |
| | Distance-Based (40+ ft) | +4 Defense | — | For movement 40+ feet in a round. |
| | Total Defense / Dodge | +4 Defense | — | Requires an action to focus on evasion (moving at base speed). |
| | Opportunity Attacks | Provoke AoO | Attack of Opportunity | Defender\'s movement triggers the attack. |
| **MOVING ATTACKERS** | Ranged Attack Penalty (Running) | — | -2 Attack | For attackers moving quickly (running). |
| | Mounted Movement (Double Move) | — | -4 Attack | Firing ranged weapon from mount moving double speed. |
| | Mounted Movement (Running/Quad) | — | -8 Attack | Firing ranged weapon from mount moving quadruple speed. |
| | Aiming Bonus | — | +2 per round up to AGIx2 + 2 | Requires 'Aim' move action; cannot move before shooting. |
| | Charging | -2 Defense | -2 Attack | Must move at least 10 feet in straight line toward an enemy. |
| **MOVEMENT & ACTION** | Iterative Attacks | — | 1 Attack Action | If moving more than a 5-foot step. |
| | Difficult Terrain | x1/2 Movement | x1/2 Speed, -2 Attacks | -4 to Attacks if Movement reduced to 1/4. Jarring motion. |
| | Range Increments | — | -2 cumulative per category | Common ranged combat modifier. |`,
  mechanic: `TargetDC = 15 + SizeMod + RangePenalty + MoveMod
Point Blank: +5 Strike & Roll Damage with Advantage
Iterative limit: Moving > 5ft restricts to 1 attack action`,
  guide: `Consult this table whenever resolving ranged attacks against moving, distant, or unusual sized targets.`,
  note: `All Range Penalties are Doubled during automatic fire.`
});

addArticle({
  id: '3-00-04-combat-maneuvers',
  name: '3.00.04 Combat Maneuvers & EDGE Tactical Modifiers',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 5,
  perspective: 'operator',
  entry_type: 'Combat Rule',
  description: `# 3.00.04 Combat Maneuvers & EDGE Tactical Modifiers

**Edge** refers to tactical advantage modifiers that characters can gain or lose based on their movements, positions, and the environment during combat.

---

## Standard & Movement Combat Actions

- **Attack:** Make a melee or ranged attack against a target.
- **Active Defense:** Roll a Defense check to replace static Defense or negate maneuvers (Reaction; -5 subsequent penalty).
- **Aiming:** Spend an action to steady a shot. Gain **+2 Strike per round of Aiming** (Max bonus = 1/2 Skill Rank, up to AGIx2 + 2). Attacker cannot move before shooting.
- **Called Shot:** Attack a specific location (Limb/Head/Component) at a **-1 to -5 Strike Penalty**. If successful, damage is applied directly to disable/destroy that location.
- **Feint:** Opposed **Bluff check vs. Sense Motive (Insight)**. Success leads target into a False Defense, allowing a **Sneak Attack at -5 Strike** (Target has **NO Defense**).
- **Evasive Movement:** Moving quickly while defensive. Gain **+1 Defense base**, plus **+1 Defense per 10 ft** of Movement Speed used.
- **Subtle:** Moving quietly to avoid attention. Required for stealth-based Skill Actions.
- **Braced:** Set to receive a charge or fire heavy weapons. Block usable as counter attack on hit (or readied weapon), bonus gained for Advancing Target, negates heavy recoil, grants Advantage vs trip/shove.

---

## EDGE Tactical Modifiers Catalog

- **Flanking:** +2 bonus to hit when allies positioned on multiple sides of target.
- **Advancing Target:** Target approaching without Cover or Evasion. Extra attack on target at **-5 to Strike** and re-roll Initiative if successfully moved into Melee.
- **Retreating Target:** Target quickly leaving area without evasion/cover at Jog/Run/Sprint. Extra attack on target at **-5 to Strike** and reroll Initiative.
- **High Ground:** **+2 to Strike** and **+2 to Critical Damage Range**.
- **Prone:** On the ground:
  - Vs. opponent in Melee/Point Blank Range: Opponent gains **High Ground Bonus**.
  - Vs. Ranged opponent: Receive **+2 Defense Bonus** for each Range Category after Point Blank for ground cover (High Ground at Range reduces accordingly).
  - Successful Defense check allows taking **full cover** from ranged attacks.
- **Charge:** Move 10+ ft straight toward enemy (-2 Def, -2 Atk); on successful strike add **+1d to Attack Damage**, **-1 to strike per stage of speed** (walk, jog, run, sprint), plus **+1 Point of Impact Damage per 10 ft of Speed** (up to max +100% damage increase).
- **Close In:** Guarded approach, defensive advancement at base speed. **NO Modifiers** and not counted as an Advancing Target.
- **Withdraw:** Pulling back defensively at base speed. **NO Modifiers** and not counted as a Retreating Target.
- **Surprise / Sneak Attack:** Target is unaware and has **NO Defense**. Attack made at **-5 to hit**, Damage rolled at **Advantage**. Danger Sense allows Advantage check to detect.`,
  mechanic: `Aiming: +2 Strike/rnd (up to 1/2 Skill Rank)
Flanking: +2 to Hit
High Ground: +2 Strike, +2 Crit Range
Feint: Bluff vs Sense Motive -> Sneak Attack at -5 vs 0 Defense
Charge: -2 Def/-2 Atk, +1d Dmg, -1 Atk/speed stage, +1 Impact/10ft (max +100%)`,
  guide: `Declare tactical maneuvers or stance adjustments at the start of your movement or attack sequence.`,
  note: `Close In and Withdraw prevent provoking defensive Advancing/Retreating counter-attacks.`
});

addArticle({
  id: '3-00-05-damage-soak-armor-dr-ap',
  name: '3.00.05 Master Damage Resolution, Metafocus & Damage Types Directory',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 6,
  perspective: 'both',
  entry_type: 'Core Engine Manual',
  description: `# 3.00.05 Master Damage Resolution, Metafocus & Damage Types Directory

Tangent calculates damage by resolving weapon energy, relevant abilities, precision bonuses, target armor protection, and natural physical resilience.

---

## 1. The Master Damage Calculation Formula

$$\\text{Total Damage} = (\\text{Weapon Dice} + \\text{Relevant Ability Mod} + \\text{Precision Damage}) - (\\text{Target Armor DR} + \\text{Target CON Mod})$$

### Core Mechanics
- **Weapon Die Damage:** Rolled from weapon profile or invocation tier.
- **Relevant Ability:** Applied based on attack nature:
  - **Strength:** Most melee attacks, brawling strikes, and throwing heavy objects.
  - **Agility:** Finesse of light or natural weapons and most ranged physical attacks.
  - **Intelligence:** Directly weaving and calculating magical and technological effects.
  - **Charisma:** Subtle, emotional, and controlling metaphysical factors.
  - **Stamina & Wisdom (Defensive):** Guard the body (**Fortitude**) and mind (**Willpower**) defensively. *Wisdom may substitute for Int/Cha in Metaphysic Skill checks for faith-based casters.*
- **Precision Damage:** Bonus directly from the attacker's skill level (relative Combat or Focus Skill Rank).
  - *Active Defense Counter:* A defender actively defending reduces incoming damage by their **Defense score** (directly countering Precision Damage).
- **Target's Armor DR:** Subtracted based on armor resistance against the specific damage type.
- **Target's CON Mod:** Innate physiological resilience mitigating harm.
- **Sneak Attack Activation:** Sneak attack bonus damage is added **only if at least 1 point of damage penetrates target Armor DR** (determined after Armor DR but before Stamina/CON modifier).

---

## 2. Metafocus (Metaphysical Combat)
- **Invocation as Weapon:** An Invocation is treated as the weapon with damage dice and type determined accordingly.
- **Attack Roll:** Rolled with the **Attune Skill** (Strike roll, opposed by target Defense score or setting the saving throw CR).
- **Damage & Effect:** Potency is determined by the **Invocation Tier and Discipline Skill Level**.
- **Spontaneous Casting:** Supported using the relevant **Discipline's Skill Rank**.

---

## 3. Concussive & Impact Damage
Traumatic physical impact from vectors generally larger than the target's body (smashing, crashing, crushing, falls, explosions).
- **Whole-Body Dispersion:** Traumatic energy is dispersed across the entire target.
- **Vitality / Health Split:** Damage can be **divided equally between Vitality and Health** if the character attempts an active defense or soak.
- **Crashing & Siege:** Half DR if Hard Armor (without Crash Suit); Force Field DR is half effective.
- **Falling Damage:** **Ignores DR of physical protection and force fields**.
- **Explosives:** Half DR of Hard Armor (without Blast Suit); Force Field DR is half effective.

---

## 4. Master Damage Types Directory

### Kinetic Damage Types
- **Blunt (Crushing):** Impact force; excels against rigid armor plates and machinery.
- **Slashing (Cutting):** Razor blades tearing tissue; crits inflict the **Bleeding** status effect (1d4/turn, ignores DR).
- **Piercing (Puncturing):** Needle/bullet penetration exploiting seams; crits inflict **Bleeding**.
- **Force:** Kinetic subtype consisting of concentrated kinetic fields that **ignores 1/2 of Target Armor DR**.
- **Concussive / Impact:** Traumatic whole-body damage split equally between Vitality and Health; halves or ignores DR.

### Energy Damage Types
- **Pyro / Fire:** Burns and incinerates; crits inflict the **Burning** status effect (1d6 Fire/round + Will DC 12 panic).
- **Cryo / Cold:** Endothermic chill slowing movement; crits inflict the **Freeze** status effect (Speed 0, vulnerable).
- **Spectral / Phase:** Incorporeal energy that **ignores physical Armor DR entirely** to disrupt life essence.
- **Sonic / Sound:** Vibrational acoustic resonance that **ignores most physical armor** and deafens foes.
- **Voltic / Electrical:** High-voltage arcs stunning nervous systems and overloading robotics/electronics.
- **Corrosive / Disintegration:** Caustic acid that permanently degrades Armor DR and dissolves materials.
- **Ra-D / Radiation:** Ionizing gamma rays inducing radiation sickness, cellular necrosis, and mutation.
- **Force Pulse / Disruption:** Destabilizes molecular bonds, crumbling targets and disintegrating matter on crits.

### Variative & Elemental Damage Types
- **Air Elemental:** Concussive atmospheric gales knocking foes **Prone** and disrupting flight.
- **Fire Elemental:** Primal volcanic flame scorching terrain and applying Burning.
- **Earth Elemental:** Massive lithic crushing weight and seismic tremors knocking foes Prone.
- **Water Elemental:** High-pressure hydraulic torrents causing concussive trauma and drowning.
- **Radiant / Light:** Pure solar photons blinding darkness entities with the **Blinded** condition (-5 Attack/Defense).
- **Umbral / Shadow:** Primal void darkness leeching vitality and inflicting Exhaustion.
- **Celestial:** Sacred transcendent power smiting fiends and undead with radiant fury.
- **Infernal:** Corrupting hellfire and Stygian damnation eroding mind and soul.
- **Dimensional:** Spacetime tearing and spatial shearing that **completely bypasses Armor DR**.
- **Psyche / Mental:** Direct psionic and neural trauma **ignoring physical armor entirely**; resisted by Willpower.`,
  mechanic: `TotalDamage = (WeaponDice + AbilityMod + PrecisionDamage) - (ArmorDR + TargetCONMod)
ActiveDefense: Reduces incoming damage by Defender Defense Score (countering Precision)
SneakAttack: Adds bonus only if >= 1 pt penetrates Armor DR (evaluated before CON Mod)
Concussive: Split 50/50 between Vitality and Health on attempted reduction; 1/2 Hard Armor DR
Force: Ignores 1/2 Armor DR; Phase & Mental: Ignore physical Armor DR`,
  guide: `Calculate base strike with 2d10 + Ability + Skill. If hit, resolve damage formula. Deduct active defense score from precision damage if defending.`,
  note: `Dual 10s (Natural 20) doubles weapon damage dice and adds +30 to base attack score. Dual 1s (Natural 2) subtracts 10 from attack score.`
});

addArticle({
  id: '3-00-06-health-wound-thresholds-mortality',
  name: '3.00.06 Hit Locations, Limb Trauma & Mortality State (0 HP)',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 7,
  perspective: 'architect',
  entry_type: 'Combat Matrix',
  description: `# 3.00.06 Hit Locations, Limb Trauma & Mortality State (0 HP)

Combat lethality in Tangent tracks targeted body locations, specific trauma saving throws, limb disabling/destruction thresholds, and the **Mortality State (0 HP)**.

---

## 1. Hit Locations & Called Shots (d10 Table)

Roll **1d10** on a critical hit or when random location is required. In Melee and Unarmed combat, roll **1d6** unless a Leg Attack or specific maneuver is declared.

### Called Shot Modifiers
- **Torso or Leg:** **-2 Strike Penalty**
- **Head or Arm:** **-4 Strike Penalty**

### Locations & Trauma Saves Table

| Roll (d10) | Location | Trauma Effect | Save & Failure Severity |
| :---: | :--- | :--- | :--- |
| **1** | **HEAD** | **KO** | **Reason Save** or Stunned for 1+ rounds*; failure by 10+ = **Unconscious**. |
| **2, 3, 4** | **TORSO** | **Winded** | **Fortitude Save** or cumulative -2 on actions for 1+ rounds*; failure by 10+ = **Gasping / Incapacitated**. |
| **5 (R) or 6 (L)** | **ARM** | **Disarmed** | **Reflex Save** or drop held item; failure by 10+ = **Arm Crippled / Non-Functional**. |
| **7, 8 (R) or 9, 0 (L)**| **LEG** | **Hobbled** | **Might Save** or half speed for 1+ rounds*; failure by 10+ = **Leg Crippled / Non-Functional**. |

\\* **Duration of Impediment:** 1 round per point rolled under the save CR (where CR is based directly on the damage dealt).

---

## 2. Limb Damage Thresholds: Disabled vs. Destroyed

### Disabled (1/3rd Health in Damage)
- Taking **1/3rd of Health Score** in damage to a limb disables it (or causes Unconsciousness if dealt to the Head).
- **Stamina Check:** Pass a **Stamina Check with CR = 10 + Damage Taken** to keep using the limb.
- **Penalties:**
  - **Head:** **-4 on all actions**.
  - **Arm:** **-4 Strength and Agility** for actions using that arm.
  - **Leg:** **Half Ground Speed** and **no Rush Maneuver**.
- Requires medical attention or Metaphysics to restore.

### Destroyed (2/3rds Health in Damage)
- Taking **2/3rds of Health Score** in damage to an area damages it **beyond ANY further use** (Brain Death** if Head).
- **NO Check:** It is mangled beyond use. Traumatic Damage Control is immediately required for shock, blood loss, and vital collapse.
- \\*\\* *Brain death is at the GM's discretion. If the character survives, they remain disabled and require intense recovery and surgery.*

---

## 3. Technology Level 3+ Limb Replacements & Cybernetics

- **Surgery & Recovery:** Requires **1 day of surgery and recovery** whether Biological or Synthetic.
  - **Biological Limb:** Must be tissue-matched (**+1 day**) or lab-grown (**+2d4 days**).
  - **Synthetic Cyber-Limb:** Available stock can be prepped for installation during surgery time.
- **Body Replacement:** Tech 4 Tran-Cerebral Venture; Tech 5 Consciousness Transfer.
- **Bio vs. Synthetic Durability:**
  - **Bio / Natural Limbs:** Baseline damage capacity for Disabled and Destroyed.
  - **Synthetic Limbs:** Can take **50% more damage** before reaching Disabled or Destroyed, but **may NOT get the Stamina check** to remain functional once reaching Disabled.

---

## 4. The Mortality State (0 Hit Points)

When a character's Health Points reach 0, they enter the **Mortality State**:
1. **Unconscious and Incapacitated:** The character immediately falls Prone and is Incapacitated.
2. **Bleeding Out:** At the beginning of the character's turn, they suffer **1 point of Stability Damage**.
3. **Stability Threshold:** A character has a Stability Points total equal to their **Constitution Score + 5**.
4. **Death:** If Stability Points reach 0, the character expires.
5. **Stabilization:** First aid via Medicine Check (DC 15) or metaphysical healing stabilizes the character.`,
  mechanic: `HitLocation: 1d10 (1 Head, 2-4 Torso, 5-6 Arm, 7-0 Leg; 1d6 melee)
CalledShots: -2 Torso/Leg, -4 Head/Arm
TraumaSaves: Head (Reason), Torso (Fort), Arm (Ref), Leg (Might); duration = points under CR
Disabled: 1/3 Health -> Sta check CR 10+dmg to keep using (-4 actions head, -4 Str/Agi arm, 1/2 speed leg)
Destroyed: 2/3 Health -> Mangled, no check, brain death GM discretion
SynthLimbs: +50% damage threshold before Disabled/Destroyed (no Sta check)
Mortality: 0 HP -> Bleeding out (1 Stability Dmg/rnd), Stability Pool = CON + 5`,
  guide: `Roll 1d10 for critical hit location or declare called shot (-2 or -4). Track limb damage at 1/3 and 2/3 Health thresholds.`,
});

addArticle({
  id: '3-00-07-critical-hits-failures',
  name: '3.00.07 Critical Hits & Failure Severity Tables',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 8,
  perspective: 'architect',
  entry_type: 'Combat Matrix',
  description: `# 3.00.07 Critical Hits & Failure Severity Tables

Dual 10s and Dual 1s on the 2d10 dice engine trigger dramatic cinematic triumphs or catastrophic equipment failures.

---

## 1. Critical Hits (Dual 10s on 2d10)
When an attack roll shows dual 10s (total 20):
- **Base Score Evaluation:** Rolled value is treated as **30** before adding modifiers.
- **Damage Multiplier:** Roll all weapon damage dice twice and add modifiers.
- **Armor Bypass:** Armor DR is reduced by 50% against the critical strike.

---

## 2. Critical Failures / Fumbles (Dual 1s on 2d10)
When an attack roll shows dual 1s (total 2):
- **Base Score Evaluation:** Rolled value is treated as **-10** before adding modifiers.
- **Automatic Miss:** The action fails automatically.
- **Fumble Complications:**
  1. *Weapon Jam / Misfire:* Requires a Full Action to clear.
  2. *Dropped Weapon:* Weapon slips from grip and lands 5 feet away.
  3. *Loss of Stance:* Attacker loses active defense reactions until their next turn.`,
  mechanic: `Dual 10s (Nat 20): Auto-Hit, Subtotal = 30, 2x Damage Dice, 50% Armor DR Bypass
Dual 1s (Nat 2): Auto-Miss, Subtotal = -10, Weapon Jam / Fumble Check`,
  guide: `Roll double damage dice on critical hits. Apply fumble complications narratively.`,
  note: `High Ground adds +2 to the critical hit threshold window.`
});

addArticle({
  id: '3-00-08-status-effects-conditions',
  name: '3.00.08 Canonical Status Effects & Conditions Matrix',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 9,
  perspective: 'both',
  entry_type: 'Combat Rule',
  description: `# 3.00.08 Canonical Status Effects & Conditions Matrix

Complete reference matrix of the 10 tactical combat status effects, mechanical penalties, and cures/removals.

---

## Master Status Effects Table

| Status | Mechanical Effect | Cure / Removal |
| :--- | :--- | :--- |
| **Bleeding** | Target takes 1d4 Damage at start of their turn. Ignores Armor/DR. | Medicine Check (DC 10) or any Healing ability/item. |
| **Blinded** | -5 Penalty to Attack/Defense. Visual Perception fails automatically. | Medical intervention or Time (Temporary: 1d4 rounds). |
| **Burning** | Takes 1d6 Fire Damage per round. Panic Check (Will DC 12) or flail/flee. | Full Action to extinguish (Stop, Drop, Roll). |
| **Dazed** | Mentally reeling. Only 1 Action per turn (Move OR Standard). No Reactions. | Ends automatically at the end of the creature\'s next turn. |
| **Entangled** | Movement = 0. -2 Penalty to Attack/Defense. No Dodge/Evasion. | Strength Check (DC 15) or Cutting free (Structure damage). |
| **Exhausted** | -2 Penalty to Physical Checks (Str/Agi/Sta). Speed -50%. No Run/Charge. | Requires 8 Hours of Rest with food/water. |
| **Freeze** | Target is encased/chilled. Speed = 0. Target gains Vulnerability to Physical & Sonic Dmg. | Strength Check (DC 20) to shatter ice or Fire Dmg to melt. |
| **Prone** | Lying on ground. Ranged Attacks vs. Target: Disadvantage. Melee vs. Target: Advantage. | Move Action to stand up. |
| **Stunned** | Incapacitated. Lose all Actions. Drop items. Defense = Base (No Dex/Skill). | Constitution Save (DC 15) at end of turn to recover. |
| **Suppressed** | Pinned by fire. Leaving cover triggers immediate Attack of Opportunity. | Enemy stops firing, reloads, or is neutralized. |`,
  mechanic: `Bleeding: 1d4 dmg/turn ignores DR (Medicine DC 10)
Burning: 1d6 fire/rnd + Will DC 12 panic (Full Action Stop/Drop/Roll)
Freeze: Speed 0, Vulnerable Phys/Sonic (Str DC 20 or Fire)
Stunned: 0 Actions, Drop items, Base Defense (Con DC 15)`,
  guide: `Track conditions on the Folio and Foundry combat tracker during active skirmishes.`,
  note: `Prone provides +2 Defense per range category after Point Blank vs. ranged attacks.`
});

addArticle({
  id: '3-00-10-movement-modes-paces-fatigue',
  name: '3.00.10 Movement Modes, Tactical Paces & Fatigue Rules',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 10,
  perspective: 'both',
  entry_type: 'Core Rule',
  description: `# 3.00.10 Movement Modes, Tactical Paces & Fatigue Rules

Locomotion across planetary battlefields, void stations, and alien biospheres is categorized into **5 Primary Movement Modes**: Ground, Flying, Swimming, Climbing, and Burrowing.

---

## 1. Ground Movement Matrix

| Pace | Speed Multiplier | Medium Speed (30 ft base) | Action Modifiers (Stealth/Subtlety/Precision) | Fatigue & Skill Check |
| :--- | :---: | :---: | :---: | :--- |
| **Walk** | **1x (Base)** | 30 ft / 6s (6 kph) | Standard baseline | None |
| **Jog** | **2x** | 60 ft / 6s | **-2 penalty** | None |
| **Running** | **4x** *(5x with Runner)* | 120 ft *(150 ft)* | **-4 penalty** | **Athletics DC 10+** (every min, cum. -1) |
| **Sprinting** | **6x** *(7x with Runner)* | 180 ft *(210 ft)* | **-8 penalty** | **Athletics DC 15+** (every min, cum. -1) |
| **Crawl** | **1/2x** | 15 ft / 6s | **+2 stealth**; gains **Prone** | None |
| **Slow Crawl** | **1/4x** | 7.5 ft / 6s | **+4 stealth**; gains **Prone** | None |

---

## 2. Flying Movement Matrix

| Maneuver | Speed Multiplier | Medium Speed (60 ft fly) | Action Modifiers | Skill Check / Maneuver DC |
| :--- | :---: | :---: | :---: | :--- |
| **Flight** | **1x Fly (2x Walk)** | 60 ft / 6s | Standard flyer baseline | None |
| **Sail** | **2x Fly (4x Walk)** | 120 ft / 6s | **-2 penalty** | None |
| **Surge / Soar** | **4x Fly (8x Walk)** *(5x with Soar)* | 240 ft *(300 ft)* | **-4 penalty** | **Acrobatics DC 10+** (every min, cum. -1) |
| **Diving** | **2x Current Speed** *(9x with Soar)* | Up to 480+ ft | **-4 penalty** | **Acrobatics DC 15+** |
| **Gliding** | Maintains speed, drops 1ft per 5ft horiz | 60 ft horiz / 12 ft fall | **+2 bonus** | **Acrobatics DC 10+** |
| **Hover / Controlled Descent** | **1/2 Fly or less** | 30 ft or static | Observation ready | **Acrobatics DC 15+** |

### Aerial Combat Rules
- **High Ground Bonus**: Airborne combatants above grounded foes gain **+2 Strike** and **+2 Critical Threat Range**.
- **Aerial Ram Formula**: $\\text{Ram Damage} = +1d \\text{ per Stage} + 1 \\text{ Impact Damage per 10 ft Speed}$ to all involved parties.

---

## 3. Swimming Movement Matrix

| Pace | Speed Multiplier | Medium Speed (15 ft base) | Action Modifiers | Skill Check |
| :--- | :---: | :---: | :---: | :--- |
| **Swimming** | **1x Swim (1/2 Walk)** | 15 ft / 6s (3 kph) | Standard swim | None |
| **Glide** | **2x Swim (1x Walk)** | 30 ft / 6s | **-2 penalty** | **Athletics (Swim) DC 10+** |
| **Stroke** | **4x Swim (2x Walk)** | 60 ft / 6s | **-4 penalty** | **Athletics (Swim) DC 15+** |
| **Treading** | **1/2 Swim or less** | 7.5 ft / 6s | **+2 bonus** | **Athletics (Swim) DC 5+** |
*(Swimming Feature elevates rates to: 1x Walk [30 ft] Swim, 2x Walk [60 ft] Glide, 3x Walk [90 ft] Stroke).*

---

## 4. Climbing Movement Matrix

| Pace | Base Speed Ratio | Medium Speed | Action Modifiers | Skill Check |
| :--- | :---: | :---: | :---: | :--- |
| **Easy Climb (DC 10+)** | **1/2 Walk** | 15 ft / 6s | Standard climb | **Athletics (Climb)** vs DC 10 |
| **Moderate Climb (DC 15+)**| **1/4 Walk** | 7.5 ft / 6s | Challenging surface | **Athletics (Climb)** vs DC 15 |
| **Difficult Climb (DC 20+)** | **1/10 Walk** | 3 ft / 6s | Sheer wall / ice | **Athletics (Climb)** vs DC 20 |
| **Scaling** | **1x Walk** | 30 ft / 6s | **-2 penalty** | Athletics (Climb) at **-5** |
| **Fast Ascent** | **2x Walk** | 60 ft / 6s | **-4 penalty** | Athletics (Climb) at **-10** |
| **Fast Descent** | **4x Walk** | 120 ft / 6s | **-4 penalty** | **DC 20** or Athletics at **-10** |
*(Climbing Feature elevates rates to: 1x Walk Climb, 2x Scale, 3x Fast Ascent, 6x Fast Descent).*

---

## 5. Burrowing Movement Matrix

| Pace | Speed Ratio | Medium Speed | Action Modifiers | Practical Application |
| :--- | :---: | :---: | :---: | :--- |
| **Burrowing** | **1/4x Walk** | 7.5 ft / 6s | Displaces earth/sand | Standard underground movement |
| **Tunneling** | **2x Burrow (1/2 Walk)** | 15 ft / 6s | **-2 penalty** | Escape tunnels, offensive breaching |
| **Excavation** | **1/8x Walk** | 3.75 ft / 6s | Shoring & reinforcement | Pit traps, bunker construction |

---

## 6. Movement Fatigue & Exhaustion Rules

- **Trigger**: Sprinting for **5 consecutive combat rounds** or **10 minutes of hurried travel** triggers a **Stamina-based Fortitude Check (DC 15)**.
- **Check Progression**: Checked every minute with a **cumulative -1 penalty** per successive roll.
- **Failure Penalty**: On failure, take **1 point of non-lethal damage per 5 points missed** below the DC (or 5 flat points on standard failure).
- **Exhaustion State**: If Vitality is reduced to 0, take **2 physical Health damage** and gain the **Exhausted** condition (**-2 to all active checks and half movement speed**) until taking a **Light Rest (Nap)**.`,
  mechanic: `GroundPaces: Walk(1x), Jog(2x), Run(4x/5x), Sprint(6x/7x)
AerialRam: +1d per FlightStage + 1 Impact per 10ft Speed
Exhausted: -2 to all checks, Movement Speed halved`,
  guide: `Track pace multiples during movement actions and prompt Fortitude DC 15 checks upon sustained sprint triggers.`,
  note: `Running, Swimming, Climbing, and Soar features augment speed multiples without increasing subtlety penalties.`
});

addArticle({
  id: '3-00-11-vehicle-mecha-chase-combat',
  name: '3.00.11 Vehicular Combat & Mechanical Warfare',
  parent: '3.00 TACTICAL COMBAT SYSTEM',
  order: 11,
  perspective: 'both',
  entry_type: 'Combat Rule',
  description: `# 3.00.11 Vehicular Combat & Mechanical Warfare

In the Tangent universe, vehicular combat is an escalation of core 2d10 mechanics across all scales, from hover-bikes to gargantuan void-cruisers. The operational loop remains: **Action, Reaction, Consequence.**

---

## 1. Operational Fundamentals & The Tactical Round
Vehicular combat operates on the standard 6-second Combat Round:
- **Initiative Formula:**
  $$\\text{Vehicle Initiative} = 2\\text{d}10 + \\text{Agility Mod} + \\text{Alertness} + \\text{Handling Modifier}$$
  *(Handling Modifier is chassis-intrinsic, e.g. Fighter Jet +4, Capital Ship -4).*
- **The Crew Turn:**
  - **Pilot:** Controls Movement, Evasion (Defense), and Fixed Forward Weapons (45° arc).
  - **Gunner(s):** Control Turrets and Pintle mounts (360° arc); act on Pilot count but track independent actions.
  - **Engineer / System Operator:** Manages Shields, Sensors, EW, and Field Repairs.
- **Scale & Size Modifiers:** Governed by *01.01.09 Scaling*. Small targets shooting Large get to-hit bonuses but struggle to penetrate DR; Large weapons suffer tracking penalties against nimble targets.

---

## 2. Domains of War
- **Land (Terrestrial & Walker):**
  - *Cover:* Terrain provides +4 to +10 Defense. **Hull Down** grants **+4 Defense**.
  - *Ramming:* Pilot melee attack. Damage: **1d10 per 10ft of Speed** to both; heavier vehicle takes half.
  - *Walkers:* Stomp infantry (Standard Melee Attack) and stride over low obstacles.
- **Nautical (Surface & Submerged):**
  - *Sensors:* System Ops (Sensors) checks to acquire **Target Lock**. Without lock, attacks suffer **Disadvantage**.
  - *Depth Bands:* Surface (standard), Periscope Depth (concealment), Deep (breaches are catastrophic).
- **Atmospheric (Aerial):**
  - *Dogfight:* Opposed Pilot checks at start of round. Winner gains **Advantage** on attacks and chooses positioning (Tail/Flank); loser is **Flat-Footed** against winner.
  - *Stalling:* Flying below Stall Speed requires **DC 20 Pilot check** or craft enters terminal fall.
- **Interstellar (Space):**
  - *Newtonian Drift:* Maintains velocity in zero-G; cut engines to drift silently (Stealth).
  - *Heat Signatures:* Firing energy weapons or thrusters flares signature (passive detection). Active ping required for "Cold" ships.
  - *Proximity Damage:* Capital near-misses still inflict concussive shockwave damage to smaller craft.

---

## 3. Combat Interactions & Siege Warfare
- **Pilot vs. Pilot:**
  - *Evasive Maneuvers (Action):* Forfeit attack to impose **Disadvantage on all incoming fire**.
  - *Jinking (Reaction):* Roll Pilot Skill vs Attack Roll to negate hit; costs movement on next turn.
- **Gunner vs. Mecha (Infantry vs. Vehicle):**
  - *Armor Threshold:* If Weapon Damage $\\le$ Armor DR, **the shot bounces (ping!)** with zero effect.
  - *Called Shots (Weak Points):* Attack at **-5 Penalty**; on hit, **ignore 50% DR** or disable specific system.
  - *Boarding:* Athletics Check vs Vehicle Speed/Defense to climb aboard and bypass Scale penalties.
- **Gunner vs. Structure (Siege Warfare):**
  - *Static Defense:* Structures have 0 Agility, effective **Defense 5** (auto-hit).
  - *Siege Weapons:* Heavy explosive and energy ordnance deal **Double Damage** to stationary structures.
  - *Breaching:* 0 SP creates an infantry-sized Breach. -50% SP causes catastrophic structural Collapse.

---

## 4. Damage & Catastrophe
- **Glancing Blow:** Damage $\\le$ Armor DR. No effect.
- **Penetrating Hit:** Damage $>$ Armor DR. Excess damage subtracted from **Structure Points (SP)**.
- **Critical Hit:** Natural 20 or exceeding Defense by 10+. Roll on **System Failure Table**.

### System Failure Table (d6)
*(Rolled on Critical Hit or when reaching 50% SP)*
1. **Motive System:** Speed reduced by **50%** (treads thrown, wing clipped).
2. **Weapon System:** One random weapon disabled or jammed.
3. **Sensor / Comms:** Blinded or silenced; **Disadvantage on all targeting**.
4. **Crew Compartment:** Cockpit breached; crew takes **half the damage** dealt to vehicle.
5. **Power Plant:** Smoke and internal fire; vehicle takes **1d6 Burn damage/turn**.
6. **Catastrophic Leak:** Fuel/reactor unstable; **explodes in 1d4 rounds** unless repaired.

### Destruction
- **0 SP (Disabled):** Vehicle stops, systems offline, repairable.
- **Negative SP > 50% Max (Destroyed):** Total loss, scrap wreck.
- **Catastrophic Explosion:** Detonates if destroyed by Fire/Explosive damage. Radius: **10ft per Size Category**. Damage: **1d6 per 10 SP of vehicle max structure**.`,
  mechanic: `VehicleInitiative = 2d10 + AgilityMod + Alertness + HandlingMod
Ramming = 1d10 / 10ft Speed (heavier takes 1/2)
Dogfight = Opposed Pilot Check (Winner: Advantage + Tail/Flank; Loser: Flat-Footed)
ArmorThreshold = Damage <= DR bounces
InfantryCalledShot = -5 Attack -> Ignore 50% DR or disable system
StructureSiege = Heavy weapons deal 2x damage against Defense 5 structures
CatastrophicExplosion = 10ft/Size Cat radius, 1d6 per 10 max SP`,
  guide: `Track Pilot, Gunner, and Engineer turns independently. Roll on System Failure Table (d6) at 50% SP or on critical hits.`,
  note: `Capital ship spinal mounts inflict proximity concussive damage to fighters on near-misses.`
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

The manipulation of reality within the Tangent framework is not merely the recitation of arcane words, but the deliberate restructuring of universal constants through the application of will. This system operates on a distinct triad of mechanics—**Attune**, **Discipline**, and **Invocation**—which collectively allow for the harnessing of powers that defy standard physics.

Unlike "Vancian" magic systems where spells are distinct, immutable memory packets that vanish upon use, the Metaphysic system implies a fluid, skill-based manipulation of energy sources, whether they be the **Void**, the **Weave**, or the **Quantum Field**.

---

## 1. The Metaphysic Triad

1. **Attune (The Conduit)**: The universal master skill for drawing, regulating, and channeling energy. Required for all Disciplines. Sets target Resistance DCs, Evasion DCs, and Attack Rolls.
2. **Discipline (The Shape)**: The 6 fundamental spheres of reality manipulation (*Dimension, Energy, Entropy, Illusion, Matter, Mental*), each split into 2 Metafocus Skills. Determines efficiency, severity, and damage.
3. **Invocation (The Codified)**: Specific rote muscle-memory formulas. Provides **Operational Safety ("Take 10")** and adds Invocation Level directly to Discipline checks.

---

## 2. Metafocus Level (ML 0 to ML 6)

| ML | Classification | Description | Typical Examples | Max Discipline Rank |
| :---: | :--- | :--- | :--- | :---: |
| **0** | **Null** | No native Meta users. Physical laws strictly rigid. | None | **Rank 0** |
| **1** | **Rare** | Negligible ratio of Meta Users; likely to be harshly judged or highly expected of. | Skeptical societies / Most races | **Rank 2** |
| **2** | **Selective** | More ‘in tune’ people but in minorities or reclusive. Early stage of Enlightenment. | Special Ops, Esoteric Cults | **Rank 4** |
| **3** | **Cultured** | Uncommon but accepted Meta Usage (Adepts of various types). Awakened as recommended feature. | Aulurans, Dracon Dynasty, Impyrium | **Rank 6** |
| **4** | **Standardized**| Common Meta Usage; used by many and evident in society. Awakened as granted feature. | Alterians, Impyrium Regi, Psion | **Rank 8** |
| **5** | **Advanced** | Very Common Meta Usage; prominent usage by everyone in infrastructure and daily life. | Mondi, Shar Knor | **Rank 10** |
| **6** | **Deific** | Transcended; casually affecting reality. **NOT AVAILABLE TO PCs**. | Progenitor types / Architects | **Unlimited (NPC Only)** |

---

## 3. Key Ability Selection (The Source Flavor)
- **Intelligence Based (Reason and Logic)**: Psychic, Arcane, Akashic.
- **Wisdom Based (Willpower and Intuition)**: Divine, Nature, Cosmic.
- **Charisma Based (Confidence and Dominance)**: Bardic, Hereditary, Granted.`,
  mechanic: `MaxDisciplineRank = ML * 2 (Attune is not limited by ML)
Potency = KeyAbilityMod + DisciplineSkillRank + InvocationLevel + 10 (or d20)
EssencePool = Sum(6 Abilities) + AttuneRank + Sum(DisciplineSkillRanks)`,
  guide: `Establish your character's Key Ability, awakened disciplines, and starting ML caps during character creation.`,
  note: `Attune is the foundation of all reality manipulation and is exempt from planetary ML restrictions.`
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

## 1. The Potency Calculation Formula

$$\\text{Potency Score} = [\\text{Key Ability} + \\text{Discipline Skill Level} + \\text{Invocation Level} + 10 \\text{ (or } d20 \\text{)}]$$

- **Attune Check**: Used to determine the Difficulty of the Resistance of an Effect or the Evasion of an Attack.
- **Discipline Check**: Used to determine the severity of Effects and/or Damage.

---

## 2. Codified Invocations (Operational Safety)
- Invocations represent rote muscle memory etched into neural pathways.
- **Bonus**: Invocation Levels are added directly to the Discipline Skill checks they are based on *(Invocations are considered Discipline Specializations)*.
- **Operational Safety**: The user effectively **"Takes 10"** by default on the Discipline check:
  $$\\text{Default Potency} = \\text{Key Ability Mod} + \\text{Discipline Skill Level} + \\text{Invocation Level} + 10$$
  *(A roll using d20 may still be attempted if a better result is desired).*

---

## 3. Spontaneous Free-Casting
- Involves a narrative of the effect within the confines of the Discipline’s level.
- **Process**: Make an Attune check to draw/channel energy (sets DC/Attack), followed by a Discipline Skill check for severity.
- **Risks**: High volatility; Essence is spent upfront, and failure inflicts Internalized Strain.

---

## 4. Criticals, Surges & Failures
- **Critical Success**: **+30 bonus to the check** and dramatic improvement of the effect.
- **Critical Mistake**: **-10 to the check** and disastrous backfire (Architect's call).
- **Energy Surge (Attune $\\le 0$)**: Uncontrolled energy surge (wrong target, collateral area); **Essence cost is doubled**.
- **Fizzle / Transposition (Discipline $\\le 0$)**: Dramatic fizzle to transposed energy.
- **Internalized Strain (Failure)**: Failing a check deals **1 point of Non-Lethal Damage per 5 points of failure** (1d6 per 5 in free-casting). Cannot be soaked by Stamina or Armor.
- **Fumble**: Requires a check to see if the caster suffers the effect themselves.`,
  mechanic: `CodifiedPotency = KeyMod + DisciplineRank + InvocationLevel + 10 (or d20)
InternalizedStrain = floor(FailureMargin / 5) * 1 NonLethal HP
EnergySurge = Attune <= 0 -> EssenceCost * 2`,
  guide: `Use codified invocations for reliable Take 10 operational safety in combat; use free-casting for flexible narrative problem solving.`,
  note: `Internalized Strain cannot be absorbed by Stamina or Armor DR, representing direct biological strain.`
});

addArticle({
  id: '4-00-02-essence-economy-surge-strain',
  name: '4.00.02 Essence Economy, Surge & Strain Backlash',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 3,
  perspective: 'operator',
  entry_type: 'Metaphysics Rule',
  description: `# 4.00.02 Essence Economy, Surge & Strain Backlash

Channeling metaphysical power consumes **Essence** from your personal reservoir. Your total Essence capacity represents your comprehensive "lodestar"—the intersection of biological/synthetic substrate, channeling precision, and breadth of metaphysical study.

---

## 1. The Essence Pool Calculation Formula

$$\\text{Essence Pool} = (\\text{Sum of all 6 Ability Scores}) + (\\text{Attune Skill Rank}) + (\\text{Total Ranks in all known Discipline Skills})$$

- **Ability Substrate**: Sum of all 6 Ability Scores (physical attributes contain energy; mental attributes determine flavor and depth). Permanent modifications affect the pool; temporary adjustments do not.
- **The Conduit (Attune)**: Permanent Attune ranks expand the capacity to hold and regulate energy.
- **The Breadth (Disciplines)**: Total ranks from skills across all known Disciplines represent cumulative understanding of reality's "Code". **Ranks in Invocations do NOT count towards the Essence total**.

---

## 2. The Essence Cost Scale by Base DC

The metabolic or spiritual cost of an invocation is determined by the Base DC required to activate the effect based on the environment and stress:

| Difficulty | Base DC | Essence Cost | Environmental Context |
| :--- | :---: | :---: | :--- |
| **Very Easy** | **DC 5** | **0** | Safe areas, Sanctums, Libraries, Laboratories. |
| **Easy** | **DC 10** | **0** | Casual travel, walking, non-hostile environments. |
| **Average** | **DC 15** | **1** | Combat, vigorous movement, active hostility. |
| **Difficult** | **DC 20** | **2** | Extreme activity, uncontrolled falls, crashing. |
| **Very Difficult** | **DC 25** | **3** | High-intensity chaos, environmental catastrophes. |
| **Nearly Impossible** | **DC 30** | **4** | Legendary feats, global reality shifts. |
| **Miraculous** | **DC 35** | **5** | Progenitor-tier interactions (rarely for PCs). |

---

## 3. Strategic Economy & Volatility
- **The "Sanctum" Bonus**: Learned rituals performed in a laboratory (DC 5) cost **0 Essence**.
- **The Combat Tax**: The same invocation in a firefight (DC 15) imposes an immediate **1 Essence** cost.
- **Free-Casting Upfront**: Spontaneous effects in a Difficult environment (DC 20) require **2 Essence upfront**.
- **Energy Surges**: If an Attune check is 0 or less, the Essence cost is **doubled**.

---

## 4. Essence Recovery & The Burn
- **Light Rest**: Recovers Essence equal to the character's **Key Ability Modifier (minimum 1)** per hour.
- **Full Rest (6–8 Hours)**: Fully restores the entire Essence Pool.
- **The Burn (Life-Force Channeling)**: If an operative's Essence Pool is empty, each point of Essence needed deals **2 points of direct Health damage** (cannot be absorbed by Armor DR or Stamina).`,
  mechanic: `EssencePool = Sum(6 Abilities) + AttuneRank + Sum(DisciplineSkillRanks)
TheBurn = 1 Essence : 2 Direct Health Damage (Bypasses DR & Stamina)
BaseDCCosts = { DC5: 0, DC10: 0, DC15: 1, DC20: 2, DC25: 3, DC30: 4, DC35: 5 }`,
  guide: `Monitor your Essence pool closely during dungeon crawls and prolonged firefights. When empty, beware The Burn.`,
  note: `The Burn inflicts non-soakable Health trauma, representing physical breakdown from channeling unshielded power.`
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

// Also integrate all canonical 16 Metaphysics Volume articles
metaphysicsArticles.forEach(art => {
  if (!articles.some(a => a.id === art.id)) {
    articles.push({
      ...art,
      perspective: 'both',
      updatedAt: new Date().toISOString()
    });
  }
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
name: "${art.name.replace(/"/g, '\\"')}"
category: "${art.category || 'compendium'}"
parent: "${(art.parent || '').replace(/"/g, '\\"')}"
order: ${art.order || 0}
perspective: "${art.perspective || 'both'}"
entry_type: "${art.entry_type || 'Core Rule'}"
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

