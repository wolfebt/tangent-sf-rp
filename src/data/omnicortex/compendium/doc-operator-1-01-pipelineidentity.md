---
id: "doc-operator-1-01-pipelineidentity"
name: "1.01 Pipeline I: Identity & Background"
fileName: "1.01.PipelineIdentity.md"
relPath: "operator/character_creation/1.01.PipelineIdentity.md"
isMasterDoc: false
masterDocId: "doc-operator-1-01-character-creation"
category: "operator_rule"
parent: "doc-operator-1-01-character-creation"
order: 4
perspective: "operator"
entry_type: "Character Creation Rule"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","character_creation","1.01.pipelineidentity","mechanics"]
updatedAt: "2026-11-03T10:58:48.791Z"
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

# **1.01.01 CHARACTER CREATION PIPELINE I: IDENTITY & BACKGROUND**

## **1. ABILITY SCORES**

Every character is defined by six fundamental attributes. The standard baseline for an ordinary human is **+0**. Both inside a **Species Package** (`1.03 SPECIES.md`) and during post-species character creation customization, each **+1** increase costs **5 Character Points (CP)** and each **-1** reduction refunds **-5 CP** (straight values with no package discount). During character creation, no raw attribute score may exceed **+4** before species adjustments or mechanical augmentations are applied (up to a racial paragon ceiling of `5 + Species Modifier`).

| Attribute | Attribute Check / Save | Core Areas of Mechanical Influence |
| :--- | :--- | :--- |
| **Strength (STR)** | **Might Check** | Carrying/Lifting Capacity, Melee Damage, Raw Physical Force |
| **Agility (AGI)** | **Reflex Save** | Ranged Weapon Accuracy, Evasion/Defense, Balance, Initiative |
| **Stamina (STA)** | **Fortitude Save** | Toxic/Disease/Radiation Resistance, Base Toughness (Point-for-Point Damage Reduction), Mortality Threshold (`Stability = STA + 5` / `-STA`) |
| **Intellect (INT)** | **Reason Check** | Pure Logic, Technical Crafting, Scientific & Academic Knowledge, Arcane/Psychic Metafocus |
| **Wisdom (WIS)** | **Willpower Save** | Deception Detection (`Insight`), Focus, Fear Resistance, Intuition, Divine/Primal Metafocus |
| **Charisma (CHA)** | **Etiquette Check** | Leadership, Complex Negotiation, Social Magnetism, Karma Bounds, Hereditary/Bardic Metafocus |

**Critical Rule — Vitality & Health Independence (Zero Stamina Scaling):** The **Stamina (STA)** score does **not** increase a character's Vitality or Health pools in any way. All biological characters begin with a flat base of **30 Vitality** and **30 Health** (Synthetics/Constructs combine both into **Base 60 Structure Points [SP]**), which are increased strictly by spending Character Points at a rate of **+5 points per 1 CP** (Suggested Max: 60 each / 120 SP). Stamina instead provides **Base Toughness**, subtracting point-for-point from incoming wound damage after Armor DR.

---

## **2. SPECIES**

The first step in character identity for the Tangent SF RP system is to choose a **Species** (`1.03 SPECIES.md`):

* **CP Cost:** Each species package has a defined Character Point (CP) cost deducted from the starting pool of **150 CP**.
* **Ability Modifiers (`5 CP` per `+1` / `-5 CP` per `-1`):** Each species has specific innate ability modifiers (positive or negative) that adjust a character's base attributes at straight CP value.
* **Species Skill Ranks (`5 CP` per `5 Ranks` / `1 CP` per `1 Rank`):** A species may be granted ranks in specific skills or skills chosen from a category at straight CP value (no package discount), indicating the lineage's biological instincts or foundational cultural training.
* **Species Traits & Special Features:** Biological or cultural capabilities such as *Low-Light Vision*, *Darksight*, *Natural Armor*, *Flight*, or *Awakened*. *(Note: Any species-level disadvantages or Xeno Stigmas are baked into the Species Package CP calculation and are **exempt** from the character's 10 CP personal Hindrance limit).*
* **Recommended Features (`-1 CP` Discount):** Players can select from the species' curated list of Recommended Features with a **1 CP reduction** in cost (2 CP instead of 3 CP; minimum cost of 1 CP for any feature).

### **Walkthrough Example: Xy'larra (Species Selection)**

*Xy'larra is an **Alterian (Celestine Elf)** (**24 CP** Species Package with +10 Discipline Skills; or **34 CP** with the +20 Skill Rank variant — covering all innate traits of the species), and she receives the following modifiers:*
* *Gains **+1 Agility** and **+1 Intellect** (Elven lineages are naturally quick and analytical).*
* *Gains **Low-Light Vision** and **Awakened** (her species studies the Arcane with an Intellect basis, unlocking **Attune** plus one Metaphysic Discipline and its two focus skills), and also gains **+10 Species Skill Points** for discipline-related skills.*
* *Alterians are Humanoid with a **Minor Xeno Stigma** (insular human populations hold a different cultural view, imposing a `-2` penalty on certain social interactions; as a species-level stigma, this does not count toward her 10 CP personal Hindrance cap).*
* ***Allocation:** She selects the **Mental Discipline** for her innate Awakening and allocates her 10 Species Skill Points into **Attune 5** and **Mental (Sense) 5** (for meta-enhanced perception and awareness).*

---

## **3. FACTION**

The **Faction** stage (`1.04 FACTIONS.md`) involves choosing a political, cultural, or ideological polity with which your character is affiliated. Each faction represents a distinct organization within the galaxy, with its own culture, goals, aesthetic, and resources:

* **Faction Skill Points (`20 Skill Ranks` at `0 CP`):** Each faction provides **20 Faction Skill Ranks** that can be allocated to specific skills relevant to that faction, allowing players to specialize their character's training.
* **Faction Features (`2 Free Features` & `-1 CP` Recommended Discounts):** Together with Origin and Occupation, background packages grant **60 Skill Ranks, 4 Features, and 4 Traits at 0 CP**. Each faction also offers a curated list of Recommended Features representing training or privileges prominent within that society (purchased at a 1 CP discount).
* **Faction Affiliation Benefits & Wealth Modifier:** Aligning with a faction provides access to exclusive resources, social standing, and opportunities for advancement, and modifies the character's starting **Wealth Score (WS)** (`+0` Coalition/Outworlds, `+2` Dynasty/Auluran/Kitin, `+3` Alterian/Entari/Impyrium, `+4` Syndicate/Ascendancy, `+5` Radiant Impyrium, `+6` Mekan).
* **Faction Affiliation Drawbacks:** Faction membership also brings political rivals, obligations to leadership, and ideological expectations.

### **Walkthrough Example: Xy'larra (Faction Selection)**

*The **Alterian Enclave**, typical for most Alterians, is focused on diplomacy, arcane scholarship, and exploration. Xy'larra gains the following options:*
* *Technology is Spacefaring (**Tech Level 3**) with a **Meta Level of 4** (Focus of Arcane Enhancements) and a **+3 Faction Wealth Modifier**.*
* *Her recommended skills (**20 Skill Points** allotment) are drawn from **Academics** and the categories of **Knowledges**, **Vocations**, and **Disciplines**. She also gains **2 Foundational Features** from the Discipline category.*
* ***Allocation:** She allocates her 20 Faction Skill Points to **Academics 5**, **Knowledge (Culture) 5**, **Vocation (Ambassador) 5**, and another **+5 to Mental (Sense)** (raising her Mental [Sense] Focus skill to Rank 10).*
* *With the **2 Features** gained in the Discipline category, she selects **Awakened** twice more (unlocking both the **Dimension** and **Entropy** Disciplines alongside her innate Mental Discipline).*

---

## **4. ORIGIN**

The **Origin** stage (`1.05 ORIGINS.md`) involves selecting the planetary environment or habitat that reflects the character's upbringing and background, influencing their skills, traits, and worldview:

* **Planetary & Habitat Options:** Players choose from 11 canonical origins (*Agricultural, Aquatic, Colony, Enlightened, Hostile, Industrial, Leisure, Militaristic, Research, Spacer,* or *Urban*), each with its own Wealth Modifier and cultural profile.
* **Origin Skill Points (`20 Skill Ranks` at `0 CP`):** Each origin grants **20 Origin Skill Ranks** to distribute among the skills associated with that environment.
* **Origin Traits (`2 Free Traits` at `0 CP`):** Players choose **2 Origin Traits** from the options associated with their selected origin, representing formative characteristics or habits gained from their upbringing. *(Traits from Origin and Occupation are interchangeable if befitting the character concept).*
* **Secondary Origin (Optional):** A character may designate a secondary Origin when supported by their backstory; this does not grant extra free skill points or traits, but expands the combined list of eligible skills and traits they may choose from.
* **Additional Traits (`1 CP` Each):** Players may select additional traits beyond the initial two free Origin Traits at a cost of **1 Character Point (CP) each**.

### **Walkthrough Example: Xy'larra (Origin Selection)**

*Xy'larra comes from a family of merchants and has traveled the stars since childhood. **Spacer** (`+1 WS`) is her primary Origin, and because she was raised within an Alterian Clan with traditional philosophical teachings, she designates **Enlightened** as a secondary Origin (granting no extra points, but unlocking the combined skill and trait lists of both).*
* *She receives **20 Origin Skill Points** and **2 Free Origin Traits** from her combined Spacer/Enlightened options (Combat Training, Independence, Leadership Skills, Pilot Skills, Resourcefulness, Smooth Talking, Technical Skills, Toughness, Empathy, Intellectual Curiosity, Mentorship, Open-Mindedness, Peaceful Nature, Problem-Solving Skills, Shared Wisdom, and Spiritual Awareness).*
* ***Allocation:** Wanting mobility and self-defense, she invests her 20 Origin Skill Points into **Piloting 5**, **Knowledge (Navigation) 5**, **Defense 5**, and **Melee 5**.*
* ***Traits:** She chooses **Open-Mindedness** and **Empathy** as her 2 free Origin Traits. Any additional Origin Traits desired cost 1 CP each.*

---

## **5. OCCUPATION**

The **Occupation** stage (`1.06 OCCUPATIONS.md`) defines your character's profession and operational role, granting career skills, traits, foundational features, and base wealth:

* **Occupational Skill Points (`20 Skill Ranks` at `0 CP`):** Each occupation provides **20 Occupational Skill Ranks** to allocate across the skills relevant to that career (*Adept, Agent, Builder, Citizen, Criminal, Drifter, Entertainer, Merchant, Representative, Scholar, Scout, Soldier,* or *Specialist*).
* **Occupational Traits (`2 Free Traits` at `0 CP`):** Players choose **2 Occupational Traits** from their profession's trait list. *(Traits from Origin and Occupation are interchangeable if befitting the character).*
* **Foundational & Recommended Features (`2 Free Features` & `-1 CP` Discount):** Completes the foundational background allocation (**60 Skill Ranks, 4 Features, and 4 Traits at 0 CP** across Faction, Origin, and Occupation) and designates a Recommended Feature category (`-1 CP` discount, minimum 1 CP).
* **Additional Traits (`1 CP` Each):** Extra Occupational Traits beyond the two free selections may be purchased for **1 CP each**.
* **Occupation Wealth Base:** Establishes the base value (`1` to `6`) for the character's starting **Wealth Score (WS)**.

### **Walkthrough Example: Xy'larra (Occupation Selection)**

*Xy'larra fits naturally into the **Representative** Occupation (**Wealth Base 6**), focusing on her diplomatic endeavors. She receives **20 Occupational Skill Ranks**, **2 Free Occupational Traits**, and **2 Foundational Features**.*
* *Representatives may choose from any **Manipulation** skills, and their available traits include Analytical, Conflict Resolution, Creativity, Emotional Empathy/Intelligence, Flexibility, Integrity, Languages, Negotiation, Networking, and Time Management. The **Skill Feature** category is recommended for Representatives (reducing the cost of all Skill Features by 1 CP, to 2 CP).*
* ***Skills:** She allocates her 20 Occupational Skill Points into **Insight 10** (making her near-expert at reading people), **Bluff 5**, and **Diplomacy 5**.*
* ***Traits:** She selects **Conflict Resolution** (`+2` training bonus to Diplomacy) and **Emotional Empathy** (`+2` training bonus to Insight). Any additional occupational traits cost 1 CP each.*
* ***Features:** From her occupational training, she acquires the **Attractive** (`+2` appearance bonus to social checks) and **Educated** (`+2` trained bonus to Academics and `+1` trained bonus to all Knowledge checks) features. Any additional features chosen from the Skill Feature category cost her 1 CP less.*

