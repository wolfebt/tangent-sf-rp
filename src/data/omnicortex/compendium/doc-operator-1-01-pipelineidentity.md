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
updatedAt: "2026-11-04T00:33:10.528Z"
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

# 1.01.01 CHARACTER CREATION PIPELINE I: IDENTITY & BACKGROUND

* **Focus Statement:** Step-by-step Operator creation rules for **Ability Scores**, **Species Package**, **Faction (`20 SP`)**, **Origin (`20 SP`)**, and **Occupation (`20 SP`)**, establishing the foundational `60 Background Skill Ranks`, `4 Recommended Features`, and `4 Traits` at `0 CP` alongside the complete Xy'larra identity walkthrough.

## Overview & Mechanical Authority Block

Every rule, formula, and character creation procedure in **Volume I: The Operator's Manual** (`operator/`) is governed by these canonical mechanical invariants:

* **Core Resolution Roll:** `2d10 + Skill Rank + Attribute Modifier + Situational Modifiers vs. Challenge Rating (CR)`.
* **Advantage & Disadvantage:** Roll `+1d10` per stack of Advantage (keep the highest 2 dice) or Disadvantage (keep the lowest 2 dice). Opposing stacks cancel 1-for-1.
* **Critical Hit & Fumble Resolution:**
  * **Critical Hit (`Natural 20` / double-10s on `2d10`, or expanded threat range `19`, `18`):** `2x Base Weapon Damage Dice + 30 to Attack Score + Weapon/Elemental Critical Effect`.
  * **Fumble (`Natural 2` / double-1s on `2d10`, or expanded fumble range `3`, `4`):** `-10 to Attack/Check Score + Situational Complication`.
* **Character Point (CP) Economy (`150 CP` Starting Budget):** Starting Operators receive **150 Character Points (CP)**, structured as an **80-CP Archetype Chassis** plus a **70-CP Customization Budget** (or allocated via full custom point-buy):
  * **Primary Attribute at `+3`:** `15 CP` (`+5 CP` per `+1`)
  * **Secondary Attribute at `+2`:** `10 CP` (`+5 CP` per `+1`)
  * **4 Essential Skills at Rank 6 (Trained):** `24 CP` (`1 CP` per Rank)
  * **6 Supporting Skills at Rank 3 (Novice):** `18 CP` (`1 CP` per Rank)
  * **2 Signature Traits (`1 CP` each) + 3 Recommended Core Features (`9 CP`):** `13 CP`
  * **Customization Budget:** `70 CP`
* **Background Allocations (`60 SP` at `0 CP`):** `20 SP Faction + 20 SP Origin + 20 SP Occupation = 60 Skill Ranks`, `4 Recommended Features`, and `4 Traits` at `0 CP` (`Extra Traits = 1 CP` each).
* **Universal Straight Pricing:** `+5 CP` per `+1` Attribute, `-5 CP` refund per `-1` Attribute penalty, and `1 CP` per `1` Skill Rank (`5 CP` per `5` Skill Ranks) across both Species Packages and post-species customization (zero package discount).
* **Vitality, Health & Structure Pools (Zero Stamina Scaling):** Biological characters start with **Base 30 Vitality** and **Base 30 Health**; Synthetic/Construct characters combine both into **Base 60 Structure Points (SP)**. Pools scale strictly at **`+5 points per 1 CP`** spent (Suggested Max: `60` each / `120 SP`; **NEVER scaled by Stamina**). The **Stamina Modifier** serves as **Base Toughness**, subtracting point-for-point from incoming wound damage after Armor DR.
* **Personal Hindrance Cap (`+10 CP` Maximum):** Personal character Hindrances grant at most **`+10 CP`** during creation. **Species-level hindrances and cybernetic/xeno Stigmas are exempt from this 10-point cap.**

## Part I — Alignment & Summary Matrix Table

| Pipeline Step | Canonical Reference | Core CP / SP Allocation | Key Mechanical Outputs |
| :--- | :--- | :--- | :--- |
| **1. Ability Scores** | `1.01.Attributes.md` | `+5 CP` per `+1` \| `-5 CP` per `-1` (Straight Cost) | Sets `STR`, `AGI`, `STA`, `INT`, `WIS`, `CHA` (`+0` human average; `+4` raw starting cap; `5 + Species Mod` paragon ceiling). |
| **2. Species** | `1.03 SPECIES.md` | Variable CP (`+5 CP/+1` Attr, `1 CP/Rank` Skills) | Grants biological traits, innate senses, species skill ranks, and Species Hindrances (exempt from `+10 CP` personal cap). |
| **3. Faction** | `1.04 FACTIONS.md` | `20 Faction Skill Ranks` (`0 CP`) + `2 Recommended Features` | Establishes political allegiance, Tech Level (`TL`), Metafocus Level (`ML`), and Faction Wealth Modifier (`+0` to `+6 WS`). |
| **4. Origin** | `1.05 ORIGINS.md` | `20 Origin Skill Ranks` (`0 CP`) + `2 Origin Traits` (`0 CP`) | Reflects childhood environment across 11 canonical habitats, Origin Wealth Modifier, and optional Secondary Origin access. |
| **5. Occupation** | `1.06 OCCUPATIONS.md` | `20 Occupational Skill Ranks` (`0 CP`) + `2 Traits` + `2 Features` | Defines career proficiency across 13 professions, Recommended Feature category (`-1 CP` discount), and Occupation Wealth Base (`1–6`). |

## Part II — Complete Unabridged Profiles & Rules Entries

### 1. Ability Scores

Every character is defined by six fundamental attributes. The standard baseline for an ordinary human is **+0**. Both inside a **Species Package** (`1.03 SPECIES.md`) and during post-species character creation customization, each **+1** increase costs **5 Character Points (CP)** and each **-1** reduction refunds **-5 CP** (straight values with zero package discount). During character creation, no raw attribute score may exceed **+4** before species adjustments or mechanical augmentations are applied (up to a racial paragon ceiling of `5 + Species Modifier`).

| Attribute | Attribute Check / Save | Core Areas of Mechanical Influence |
| :--- | :--- | :--- |
| **Strength (STR)** | **Might Check** | Carrying/Lifting Capacity, Melee Damage, Raw Physical Force |
| **Agility (AGI)** | **Reflex Save** | Ranged Weapon Accuracy, Evasion/Defense, Balance, Initiative |
| **Stamina (STA)** | **Fortitude Save** | Toxic/Disease/Radiation Resistance, Base Toughness (Point-for-Point Damage Reduction), Mortality Threshold (`Stability = STA + 5` / `-STA`) |
| **Intellect (INT)** | **Reason Check** | Pure Logic, Technical Crafting, Scientific & Academic Knowledge, Arcane/Psychic Metafocus |
| **Wisdom (WIS)** | **Willpower Save** | Deception Detection (`Insight`), Focus, Fear Resistance, Intuition, Divine/Primal Metafocus |
| **Charisma (CHA)** | **Etiquette Check** | Leadership, Complex Negotiation, Social Magnetism, Karma Bounds (`CHA + 1`), Hereditary/Bardic Metafocus |

* **Critical Rule — Vitality & Health Independence (Zero Stamina Scaling):** The **Stamina (STA)** score does **not** increase a character's Vitality or Health pools in any way. All biological characters begin with a flat base of **30 Vitality** and **30 Health** (Synthetics/Constructs combine both into **Base 60 Structure Points [SP]**), which are increased strictly by spending Character Points at a rate of **+5 points per 1 CP** (Suggested Max: `60` each / `120 SP`). Stamina instead provides **Base Toughness**, subtracting point-for-point from incoming wound damage after Armor DR.

### 2. Species

The first step in character identity for the Tangent SF RP system is to choose a **Species** (`1.03 SPECIES.md`):

* **CP Cost:** Each species has a defined Character Point (CP) cost deducted from the starting pool of **150 CP**.
* **Ability Modifiers (`+5 CP` per `+1` / `-5 CP` per `-1`):** Each species has specific ability modifiers (positive or negative) that affect a character's base stats at straight CP value.
* **Skill Ranks (`1 CP` per `1 Rank` / `5 CP` per `5 Ranks`):** A species may be granted ranks in certain specific skills or skills chosen from a category at straight CP value, indicating the species' biological instincts or foundational cultural training.
* **Racial Traits & Special Features:** Certain species have access to unique biological or cultural traits and special features, such as *Low-Light Vision*, *Darksight*, *Natural Armor*, *Flight*, or *Awakened*. *(Note: Any species-level disadvantages or Xeno Stigmas are baked into the Species Package CP calculation and are **exempt** from the character's `+10 CP` personal Hindrance limit).*
* **Recommended Features (`-1 CP` Discount):** Players can select from the species' curated list of **Recommended Features** with a **1 CP reduction** in cost (`2 CP` instead of `3 CP`; minimum of `1 CP` for any feature).

#### Walkthrough Example: Xy'larra (Species Selection)

> *Xy'larra is an **Alterian (Celestine Elf)** (**24 CP** Species Package with `+10` Discipline Skills, or **34 CP** with the `+20` Skill Rank variant; `17 CP` in legacy pre-straight-pricing drafts — covering all innate traits of the species), and she receives the following modifiers:*
> * *Gains **+1 Agility** and **+1 Intellect** (Elven types are typically quite quick and intelligent).*
> * *Gains **Low-Light Vision** and is **Awakened** (her species specifically studies the Arcane with an Intellect basis and gains a Discipline and its focus skills) and also gains **+10 Species Skill Points** for discipline-related skills.*
> * *Alterians are Humanoid with a **Minor Xeno Stigma** (insular human populations comparatively hold a slightly different cultural view, imposing a `-2` penalty on certain social interactions; as a species-level hindrance, this is exempt from her `+10 CP` personal Hindrance cap).*
> * ***Allocation:** She is Awakened in the **Mental Discipline**, allocating `5` points to **Attune** (Focus/Activation) and `5` points to **Mental (Sense)** (for meta-enhanced perception and alertness).*

### 3. Faction

The **Faction** stage of character creation in Tangent (`1.04 FACTIONS.md`) involves choosing a faction with which your character is affiliated. Each faction represents a distinct group or organization within the game world, with its own unique culture, goals, aesthetic, and resources:

* **Faction Skill Points (`20 Skill Ranks` at `0 CP`):** Each faction provides **20 Faction Skill Ranks** that can be allocated to specific skills relevant to that faction. This allows players to further specialize their character's abilities and tailor them to the faction's focus.
* **Faction Features (`2 Foundational Features` & `-1 CP` Recommended Features):** Factions offer a selection of **2 Foundational/Recommended Features** that characters choose from, completing part of the `60 Skill Ranks, 4 Features, and 4 Traits at 0 CP` background baseline. These features represent special abilities, training, or privileges that are prominent within that faction, and unlock `-1 CP` discounts on additional Recommended Features.
* **Faction Affiliation Benefits & Wealth Modifier:** Aligning with a particular faction provides various benefits, such as access to exclusive resources, support from other faction members, opportunities for advancement within the faction's hierarchy, and a Faction **Wealth Score (WS)** modifier (`+0` Coalition/Outworlds, `+2` Dynasty/Auluran/Kitin, `+3` Alterian/Entari/Impyrium, `+4` Syndicate/Ascendancy, `+5` Radiant Impyrium, `+6` Mekan).
* **Faction Affiliation Drawbacks:** However, faction affiliation can also have drawbacks, such as conflicts with rival factions, obligations to the faction's leadership, and restrictions on certain actions or choices.

#### Walkthrough Example: Xy'larra (Faction Selection)

> *The **Alterian Enclave**, typical for most Alterians, is focused on diplomacy and exploration. Xy'larra gains the following options:*
> * *Technology is Spacefaring (**Tech Level 3**) with a **Meta Level of 4** (Focus of Arcane Enhancements) and a **+3 Faction Wealth Modifier**.*
> * *Her recommended skills (**20 Skill Points** allotment) are drawn from **Academics** and the categories of **Knowledges**, **Vocations**, and **Disciplines**. She also gains **2 Features** from the Discipline category.*
> * ***Allocation:** She gains the skills of **Academics 5**, **Knowledge (Culture) 5**, **Vocation (Ambassador) 5**, and another **+5 to her Mental (Sense)** Discipline skill, raising it to **Rank 10**.*
> * *She also gains **Awakened** twice more (for both the **Dimension** and **Entropy** Disciplines) with the **2 Features** gained in the Discipline category.*

### 4. Origin

The **Origin** stage of character creation in Tangent (`1.05 ORIGINS.md`) involves selecting an origin that reflects the character's upbringing and background. This choice will influence their skills, traits, and overall worldview:

* **Planetary & Habitat Options:** Players can choose from a variety of 11 canonical origins (*Agricultural, Aquatic, Colony, Enlightened, Hostile, Industrial, Leisure, Militaristic, Research, Spacer,* or *Urban*), each with its own unique set of benefits, Wealth Modifier, and cultural profile.
* **Skill Points (`20 Skill Ranks` at `0 CP`):** Each origin comes with **20 Origin Skill Ranks** that can be distributed among a specific set of skills relevant to that origin. This allows players to tailor their character's abilities to their chosen background.
* **Origin Traits (`2 Free Traits` at `0 CP`):** Additionally, players choose **2 Origin Traits** from a list of options associated with their selected origin. These traits represent specific characteristics or abilities that reflect the character's upbringing and experiences. *(Traits from Origin and Occupation are interchangeable if befitting the character).*
* **Secondary Origin (Optional):** When justified by backstory, a character may designate a secondary Origin; this does not grant extra free skill points or traits, but unlocks the secondary origin's list of suggested skills and traits to choose from.
* **Additional Traits (`1 CP` Each):** Players have the option to select additional traits beyond the initial two free Origin Traits, but these come at a cost of **1 Character Point (CP) each**. This allows for further customization while requiring careful consideration of the character's overall build and CP budget.

#### Walkthrough Example: Xy'larra (Origin Selection)

> *Xy'larra is from a family of merchants and has been traveling the stars since she was young. **Spacer** (`+1 WS`) is a fitting primary origin, and due to the fact that she was raised in an Alterian Clan with traditional teachings, she gains **Enlightened** as a secondary origin (she does not gain any extra points, but gains access to the secondary list of suggested skills and traits to choose from).*
> * *She gains **20 Origin Skill Points** to spend on eligible skills (with her Spacer origin having a broader selection of technical/piloting skills than her Enlightened origin).*
> * *She also gains **2 Traits** total to choose from either origin (with her combined list of options being Combat Training, Independence, Leadership Skills, Pilot Skills, Resourcefulness, Smooth Talking, Technical Skills, Toughness, Empathy, Intellectual Curiosity, Mentorship, Open-Mindedness, Peaceful Nature, Problem-Solving Skills, Shared Wisdom, and Spiritual Attunement).*
> * ***Allocation:** Wanting to be mobile, she takes skills in **Piloting 5** and **Knowledge (Navigation) 5**, and wanting to take care of herself, she learns **Defense 5** and **Melee 5**.*
> * ***Traits:** The traits of **Open-Mindedness** and **Empathy** are fitting choices from her compiled list. Any additional Origin traits desired cost **1 CP each**.*

### 5. Occupation

The **Occupation** stage of character creation in Tangent (`1.06 OCCUPATIONS.md`) involves selecting an occupation that reflects your character's profession and area of expertise. This choice not only adds flavor and depth to their identity, but also grants them specific skills, traits, foundational features, and base wealth that reflect their training and experience:

* **Skill Points (`20 Skill Ranks` at `0 CP`):** Each occupation comes with **20 Occupational Skill Ranks** that can be allocated to a specific set of skills relevant to that occupation (*Adept, Agent, Builder, Citizen, Criminal, Drifter, Entertainer, Merchant, Representative, Scholar, Scout, Soldier,* or *Specialist*). This allows players to further customize their character's capabilities and specialize in their chosen profession.
* **Occupational Traits (`2 Free Traits` at `0 CP`):** Players choose **2 Occupational Traits** from a list of options associated with their selected occupation. These traits represent specific characteristics or abilities that are common among members of that profession. *(Traits from Origin and Occupation are interchangeable if befitting the character).*
* **Recommended Features (`2 Foundational Features` & `-1 CP` Discount):** Occupations grant **2 Foundational Features** (completing the `60 Skill Ranks, 4 Features, and 4 Traits at 0 CP` background package) and suggest a **Recommended Feature** category that complements the character's skills and abilities, reducing the cost of features in that category by `1 CP` (to `2 CP`, minimum `1 CP`).
* **Additional Traits (`1 CP` Each):** Players have the option to select additional traits beyond the free ones provided by their occupation at a cost of **1 Character Point (CP) each**.
* **Occupation Wealth Base:** Establishes the base value (`1` to `6`) for the character's starting **Wealth Score (WS)**.

#### Walkthrough Example: Xy'larra (Occupation Selection)

> *Xy'larra fits well in the **Representative** Occupation (**Wealth Base 6**), focusing on her diplomatic endeavors. Again gaining **20 Skill Ranks**, **2 Traits**, and **2 Features**, now chosen from the Representative Occupation—she may choose from any **Manipulation** skills, and her available traits are Analytical, Conflict Resolution, Creativity, Emotional Intelligence/Empathy, Flexibility, Integrity, Languages, Negotiation, Networking, and Time Management. The **Skill Feature** category is recommended for Representatives (reducing the cost of such Features by `1 CP`, to `2 CP`, with a `1 CP` minimum cost of any feature).*
> * ***Skills:** Her skills gained are **Insight 10** (near-expert at reading other people), **Bluff 5**, and **Diplomacy 5**.*
> * ***Traits:** Traits chosen are **Conflict Resolution** (`+2` training bonus to Diplomacy) and **Emotional Empathy** (`+2` training bonus to Insight). Any additional occupational traits she would like cost **1 CP each**.*
> * ***Features:** During her training for her occupation, she developed the **Attractive** (`+2` appearance bonus to certain social checks) and **Educated** (`+2` trained bonus to Academics skill and `+1` trained bonus to all Knowledge checks) features. Any additional features chosen from the Skill Feature category cost her **1 CP less**.*

## DISCREPANCY & RESTORATION LEDGER

* **DISC-101A (Pipeline I Unabridged Codex Prose & Walkthrough Restoration):** Restored all narrative descriptions, bulleted definitions, and Xy'larra walkthrough examples for Ability Scores, Species, Faction, Origin, and Occupation from Codex `1.01 CHARACTER CREATION`.
* **DISC-101B (Straight Pricing, Zero Stamina Scaling & Nomenclature Normalization):** Applied straight `+5 CP` per `+1` Attribute and `1 CP` per `1` Skill Rank pricing across Species and Customization stages, enforced Zero Stamina Scaling on Vitality/Health pools (`Stamina Mod = Base Toughness`), verified `20 + 20 + 20 = 60 SP` background allocations, and normalized trait nomenclature so `bastion_validator.py` passes with `0` violations.

