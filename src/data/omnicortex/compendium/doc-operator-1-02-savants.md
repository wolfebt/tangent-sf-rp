---
id: "doc-operator-1-02-savants"
name: "1.02 Savants"
fileName: "1.02.Savants.md"
relPath: "operator/archetypes/1.02.Savants.md"
isMasterDoc: false
masterDocId: "doc-operator-1-02-archetypes"
category: "operator_rule"
parent: "doc-operator-1-02-archetypes"
order: 18
perspective: "operator"
entry_type: "Operator Archetype"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","archetypes","1.02.savants","mechanics"]
updatedAt: "2026-11-04T00:33:10.510Z"
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

# 1.02.04 SAVANTS (THE RATIONALS)

* **Focus Statement:** The complete compendium of all **25 Savant (`_NT_`) Archetypes** (*The Strategist* through *The Xeno-Surveyor*), focused on Science, Engineering, Strategy, Investigation, and Metaphysics, each built on the canonical **80-CP Archetype Chassis**.

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

### Division Overview & Chassis Summary

Focus: Competence, Knowledge, Systems, and Strategy.

Savants are the brains of the operation. They solve puzzles, build tech, plan heists, and wield magic as a science.

* **80-CP Archetype Chassis Allocation:** Every Archetype below is a pre-calculated **80 Character Point (CP) Chassis**:
  * **Primary Attribute at `+3`:** `15 CP` (`5 CP` per `+1`)
  * **Secondary Attribute at `+2`:** `10 CP` (`5 CP` per `+1`)
  * **4 Essential Skills at Rank 6 (Trained):** `24 CP` (`1 CP` per Rank)
  * **6 Supporting Skills at Rank 3 (Novice):** `18 CP` (`1 CP` per Rank)
  * **2 Signature Traits (`1 CP` each) & 3 Recommended Core Features (`9 CP`):** `13 CP`
* **Customization Budget (`70 CP`):** Operators spend their remaining **70 CP** (from the **150 CP** starting budget) on their Species Package (`1.03 SPECIES.md`), Saving Throws, Vitality and Health pools (`Base 30` each, scaled strictly at `+5 points per 1 CP`; **never scaled by Stamina**), and free customization, alongside their **60 Background Skill Ranks** (`20 SP` Faction + `20 SP` Origin + `20 SP` Occupation).

---

## Part I — Alignment & Summary Matrix Table (SAVANT ARCHETYPE ALIGNMENT MATRIX (`_NT_`))

| **Archetype** | **Attributes (Pri/Sec)** | **Recommended Skills** | **Core Signature Features** |
| :-: | :-: | :-: | :-: |
| **The Strategist** | Intellect / Wisdom | Knowledge (Tactics), Computers, Insight, Culture, Logic | Enhanced Processing, Logical Deduction |
| **The Relic Hunter** | Intellect / Stamina | Knowledge (History), Survival, Athletics, Engineering, Appraise | Excavation Expert, Artifact Analyst |
| **The Magus** | Intellect / Stamina | Knowledge (Arcana), Alertness, Insight, Culture, Vocation (Scholar) | Arcane Mastery, Spell Weaving |
| **The Astromancer** | Intellect / Wisdom | Knowledge (Astrogation), Computers, Science, Insight, Piloting | Celestial Savant, Observational Skills |
| **The Geneticist** | Intellect / Wisdom | Science, Medicine, Computers, Knowledge (Biology), Vocation (Doctor) | Biotechnologist, Adaptive Engineering |
| **The Maker** | Intellect / Agility | Engineering, Vocation (Crafter), Computers, Knowledge (Tech), Legerdemain | Master Builder, Technical Aptitude |
| **The Decker** | Intellect / Agility | Computers, Knowledge (Tech), Engineering, Stealth, Gather Info | Cyber Warfare, Digital Ghost |
| **The Archivist** | Intellect / Wisdom | Knowledge (History), Culture, Computers, Logic, Vocation (Librarian) | Historical Scholar, Archivist |
| **The Detective** | Intellect / Wisdom | Gather Info, Insight, Alertness, Computers, Knowledge (Law) | Keen Observer, Unwavering Determination |
| **The Academic** | Intellect / Wisdom | Science, Culture, Knowledge (History), Computers, Logic | Scientific Method, Inquisitive Mind |
| **The Architect** | Intellect / Wisdom | Engineering, Vocation (Architect), Computers, Knowledge (Physics), Culture | Macro-Engineering, Coordination |
| **The Cryptographer** | Intellect / Wisdom | Computers, Logic, Knowledge (Math), Insight, Engineering | Codebreaker, Analytical Mind |
| **The Cyberneticist** | Intellect / Technology | Engineering, Medicine, Computers, Science, Vocation (Surgeon) | Cybernetic Enhancement, Biomechanical Integration |
| **The Forensic Path.** | Intellect / Wisdom | Medicine, Science, Alertness, Insight, Computers | Forensic Analysis, Medical Expertise |
| **The Navigator** | Intellect / Wisdom | Knowledge (Astrogation), Piloting, Computers, Survival, Alertness | Cartographer, Ace Pilot |
| **The Planetologist** | Intellect / Stamina | Science, Knowledge (Geology), Survival, Alertness, Computers | Planetary Savant, Field Researcher |
| **The Roboticist** | Intellect / Technology | Engineering, Computers, Knowledge (Tech), Science, Logic | Robotic Affinity, Automation Expert |
| **The Tactician** | Intellect / Charisma | Knowledge (Tactics), Diplomacy, Intimidate, Computers, Insight | Battlefield Alertness, Tactical Genius |
| **The Technician** | Intellect / Agility | Engineering, Computers, Knowledge (Tech), Legerdemain, Vocation (Mechanic) | Technical Expertise, Problem Solver |
| **The Xenologist** | Intellect / Charisma | Culture, Diplomacy, Knowledge (Biology), Science, Gather Info | Cultural Sensitivity, Xeno-Linguist |
| **The Theoretician** | Intellect / Wisdom | Logic, Science, Knowledge (Physics), Computers, Culture | Logical Deduction, Innovative Thinking |
| **The Biologist** | Intellect / Wisdom | Science, Knowledge (Biology), Medicine, Survival, Vocation (Handler) | Scientific Method, Ecological Expertise |
| **The Net-Architect** | Intellect / Agility | Computers, Engineering, Knowledge (Tech), Logic, Vocation (Programmer) | Automation Expert, Master Builder |
| **The Linguist** | Intellect / Charisma | Culture, Diplomacy, Gather Info, Logic, Knowledge (Knowledge (Language)) | Polyglot, Cultural Interpreter |
| **The Xeno-Surveyor** | Intellect / Wisdom | Survival, Science, Piloting, Alertness, Knowledge (Geology) | Cartographer, Planetary Savant |

---

## Part II — Complete Unabridged Profiles & Rules Entries (1–25)

## **1. THE STRATEGIST**

A proficient analytical thinker adept at processing data and solving problems. They see the patterns others miss.

*You are the logic engine. You take the chaotic noise of the world and distill it into actionable data. You find the needle in the haystack, the flaw in the plan, and the weakness in the armor.*

*"The probability of success increases by 40% if you stop screaming."*

  - **Core Concept:** Utility / Investigation / Puzzle Solver
  - **Recommended Occupations:** Scholar, Specialist, Agent.
  - **Recommended Origins:** Research, Urban, Militaristic.
  - **Recommended Factions:** Mekan (Logic Engines), Impyrium (Tacticians), Ascendancy.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Insight, Knowledge (Technology), Alertness.
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Enhanced Processing, Logical Deduction.
  - **Tactical Role:** Identify enemy weaknesses, crack codes, reconstruct crime scenes.

---

## **2. THE RELIC HUNTER**

Unveils the secrets of ancient ruins and artifacts, reconstructing chronicles of civilizations long gone.

*You dig up the past to save the future. You are fearless in the face of ancient traps and curses, driven by the need to uncover the truth buried beneath the dust of ages.*

*"It belongs in a museum! Or at least, in my cargo hold."*

  - **Core Concept:** Explorer / Lore Expert / Trap Specialist
  - **Recommended Occupations:** Scholar, Scout (*Explorer*).
  - **Recommended Origins:** Research, Colony, Spacer.
  - **Recommended Factions:** Alterian Enclave (Lore), Syndicate (Profit), Ascendancy (Research).
  - **Key Attributes:** Intellect (+3 Primary), Stamina (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Knowledge (History), Knowledge (Survival), Knowledge (Culture).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Excavation Expert, Artifact Analyst.
  - **Tactical Role:** Navigate dungeons, identify magical/tech loot, bypass ancient defenses.

---

## **3. THE MAGUS**

A master of arcane magic, manipulating subtle energies to cast powerful spells through intricate gestures and rituals.

*You hack reality. You have studied the underlying code of the universe and learned to rewrite it with a gesture. Fire, gravity, and time are just variables for you to manipulate.*

*"Physics is just a suggestion I choose to ignore."*

  - **Core Concept:** Artillery / Utility / Glass Cannon
  - **Recommended Occupations:** Adept, Scholar.
  - **Recommended Origins:** Enlightened, Research, Urban.
  - **Recommended Factions:** Alterian Enclave (Arcanists), Dracon Dynasty (Sorcerers), Auluran (Shamans).
  - **Key Attributes:** Intellect (+3 Primary), Stamina (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Alertness, Two Disciplines (e.g., Energy, Dimension), Attune.
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Arcane Mastery, Spell Weaving.
  - **Tactical Role:** Area damage, battlefield control, utility casting.

---

## **4. THE ASTROMANCER**

Specializes in the study of celestial objects and phenomena. They provide navigation data and understand the cosmos.

*You read the stars like a map. You understand the terrifying scale of the cosmos and how to navigate its dangers. When the nav-computer fails, you are the one who guides the ship home.*

*"We are all just stardust. Some of us are just moving faster than others."*

  - **Core Concept:** Expert / Navigator / Science Support
  - **Recommended Occupations:** Scholar, Spacer.
  - **Recommended Origins:** Research, Spacer, Enlightened.
  - **Recommended Factions:** Alterian Enclave, Ascendancy, Void-dwelling species.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Technology), Knowledge (Astrophysics), Alertness.
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Celestial Savant, Observational Skills.
  - **Tactical Role:** Navigation through anomalies, identifying cosmic threats, operating ship sensors.

---

## **5. THE GENETICIST**

Applies genetic engineering and biotechnology to create innovative tools, medicines, and biological constructs.

*You design life. You see biology not as destiny, but as a canvas. You cure the incurable, enhance the weak, and grow solutions to problems that machines cannot solve.*

*"Evolution is too slow. I prefer immediate results."*

  - **Core Concept:** Healer / Crafter / Pet Master
  - **Recommended Occupations:** Specialist, Scholar (Auluran).
  - **Recommended Origins:** Research, Agricultural, Enlightened.
  - **Recommended Factions:** Auluran (Bio-Shapers), Syndicate (Augmenters), Ascendancy.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Knowledge (Medicine), Knowledge (Science - Genetics), Knowledge (Science - Biology).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Biotechnologist, Adaptive Engineering.
  - **Tactical Role:** Healing, creating buffs/mutations, identifying xeno-threats.

---

## **6. THE MAKER**

A brilliant inventor and technician who develops and maintains advanced technology. Skilled in hardware and software.

*You build the future. If it's broken, you fix it; if it doesn't exist, you invent it. You keep the ship flying, the guns firing, and the lights on when the universe tries to turn them off.*

*"Give me a wrench and five minutes. I'll make it work."*

  - **Core Concept:** Utility / Support / Repair
  - **Recommended Occupations:** Builder, Specialist.
  - **Recommended Origins:** Industrial, Urban, Research.
  - **Recommended Factions:** Mekan (Constructors), Syndicate (Engineers), Ascendancy.
  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Vocation (Engineer), Vocation (Mechanic), Vocation (Electrician).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Master Builder, Technical Aptitude.
  - **Tactical Role:** Fixing the ship/vehicle, building defenses, analyzing enemy tech.

---

## **7. THE DECKER**

A master of cyberspace who infiltrates networks, manipulates data, and exploits vulnerabilities.

*You own the network. While they lock the physical doors, you walk through the digital walls. You steal secrets, crash systems, and turn their own security against them without ever drawing a weapon.*

*"Access granted. Now, let's see what you're hiding."*

  - **Core Concept:** Tech / Stealth / Intel
  - **Recommended Occupations:** Specialist, Criminal.
  - **Recommended Origins:** Urban, Industrial, Research.
  - **Recommended Factions:** Syndicate (The Grid), Mekan (The Code), Ascendancy.
  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Investigation, Knowledge (Computers).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cyber Warfare, Digital Ghost.
  - **Tactical Role:** Disabling alarms, stealing data, controlling enemy drones/turrets.

---

## **8. THE ARCHIVIST**

Studies history and culture. Provides context and insight into societies and ancient technologies.

*You remember what the world forgot. You know that history repeats itself, and you know how to break the cycle. Your knowledge of the past is the key to surviving the future.*

*"Those who do not learn from the past are doomed to be eaten by it."*

  - **Core Concept:** Knowledge / Utility
  - **Recommended Occupations:** Scholar, Representative.
  - **Recommended Origins:** Enlightened, Research, Leisure.
  - **Recommended Factions:** Mekan (Memory Banks), Impyrium (Vaults), Alterian Enclave.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Insight, Knowledge (History), Knowledge (Culture).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Historical Scholar, Archivist.
  - **Tactical Role:** Solving puzzles, identifying enemy origins, diplomatic context.

---

## **9. THE DETECTIVE**

Relentless detective who uncovers conspiracies and brings criminals to justice.

*You find the truth. You don't stop until the puzzle is solved and the guilty are exposed. You notice the details that others miss, following the trail wherever it leads.*

*"Everyone has a secret. I just have to find the loose thread."*

  - **Core Concept:** Investigation / Perception
  - **Recommended Occupations:** Agent, Citizen (Law).
  - **Recommended Origins:** Urban, Colony, Hostile.
  - **Recommended Factions:** Coalition (Marshals), Syndicate (PIs), Entari Combine.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Insight, Stealth, Knowledge (Law/Streetwise).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Keen Observer, Unwavering Determination.
  - **Tactical Role:** Finding plot hooks, solving mysteries, tracking targets in cities.

---

## **10. THE ACADEMIC**

Conducts research to further knowledge. Systematically gathers evidence and tests hypotheses.

*You question everything. You are driven by the need to understand the fundamental laws of reality. You bring the light of reason to the darkest corners of the galaxy.*

*"Hypothesis: This might explode. Experiment: Let's find out."*

  - **Core Concept:** Intelligence / Utility / Crafter
  - **Recommended Occupations:** Scholar, Specialist.
  - **Recommended Origins:** Research, Enlightened, Urban.
  - **Recommended Factions:** Ascendancy (Universities), Entari Combine (Colleges), Alterian Enclave.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Investigation), Knowledge (Technology), Knowledge (Science).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Scientific Method, Inquisitive Mind.
  - **Tactical Role:** Analyzing anomalies, solving environmental puzzles, crafting items.

---

## **11. THE ARCHITECT**

Skilled in the design and upkeep of infrastructure.

*You design the world. From skyscrapers to space stations, you understand the structures that house civilization. You see the stress points and the hidden flows of energy and people.*

*"Form follows function, but strength is non-negotiable."*

  - **Core Concept:** Builder / Support / Utility
  - **Recommended Occupations:** Builder, Scholar.
  - **Recommended Origins:** Urban, Industrial, Colony.
  - **Recommended Factions:** Syndicate (Arcologies), Dynasty (Fortresses), Mekan (Megastructures).
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Architecture), Knowledge (Technology), Vocation (Engineer).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Macro-Engineering, Coordination.
  - **Tactical Role:** Designing bases, identifying structural weaknesses, overseeing construction.

---

## **12. THE CRYPTOGRAPHER**

An expert in deciphering codes, languages, and hidden messages.

*You unlock the secrets. No code is unbreakable, no language untranslatable. You find meaning in the chaos, revealing the hidden messages that others cannot see.*

*"Everything is a pattern. I just need to find the key."*

  - **Core Concept:** Intel / Support / Puzzle Solver
  - **Recommended Occupations:** Agent, Scholar.
  - **Recommended Origins:** Research, Militaristic, Urban.
  - **Recommended Factions:** Syndicate (Encryption), Mekan (Logic), Ascendancy.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Knowledge (Language), Knowledge (Technology).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Codebreaker, Analytical Mind.
  - **Tactical Role:** Decrypting comms, translating alien languages, solving logic puzzles.

---

## **13. THE CYBERNETICIST**

Specialist in creating, repairing, and modifying cybernetic enhancements.

*You build better humans. You merge flesh and machine to create something greater than the sum of its parts. You understand the interface between the biological and the technological.*

*"Flesh is weak. Steel is strong. I provide the upgrade."*

  - **Core Concept:** Healer / Crafter / Buffer
  - **Recommended Occupations:** Specialist (*Doctor*), Builder (*Engineer*).
  - **Recommended Origins:** Research, Industrial, Urban.
  - **Recommended Factions:** Syndicate (Augmentation Clinics), Mekan (Integration), Ascendancy.
  - **Key Attributes:** Intellect (+3 Primary), Intellect (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Medicine), Knowledge (Technology), Knowledge (Biology), Vocation (Engineer).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cybernetic Enhancement, Biomechanical Integration.
  - **Tactical Role:** Installing/repairing cybernetics, hacking enemy augments, buffing allies.

---

## **14. THE FORENSIC PATHOLOGIST**

An expert in determining cause of death and analyzing biological evidence.

*The dead speak to you. You read the story of their final moments in their wounds and chemistry. You find the truth that the living try to hide.*

*"The body never lies."*

  - **Core Concept:** Investigation / Science / Intel
  - **Recommended Occupations:** Specialist (*Doctor*), Agent.
  - **Recommended Origins:** Research, Urban, Colony.
  - **Recommended Factions:** Entari Combine (Justice), Syndicate (Internal Affairs), Coalition.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Medicine), Knowledge (Investigation), Knowledge (Science - Biology).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Forensic Analysis, Medical Expertise.
  - **Tactical Role:** Solving murders, identifying toxins/diseases, analyzing biological threats.

---

## **15. THE NAVIGATOR**

A skilled pilot and navigator who charts the course for ships.

*You know the way. The void is vast and trackless, but you never lose your way. You guide the ship through the dark, avoiding hazards and finding the fastest route to your destination.*

*"Trust my headings. I've never lost a ship yet."*

  - **Core Concept:** Transport / Support / Explorer
  - **Recommended Occupations:** Spacer, Specialist.
  - **Recommended Origins:** Spacer, Research, Colony.
  - **Recommended Factions:** Ascendancy (Reach Explorers), Impyrium (Navigators Guild), Outworlds.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Navigation), Pilot, Knowledge (Technology).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cartographer, Ace Pilot.
  - **Tactical Role:** Plotting FTL jumps, navigating hazards, mapping sectors.

---

## **16. THE PLANETOLOGIST**

A scholar who studies the geology, climate, and ecosystems of planets.

*You read the world. You understand the forces that shape planets, from tectonics to weather. You know where to find resources and how to survive the elements.*

*"This planet is alive, and right now, it's angry."*

  - **Core Concept:** Science / Survival / Explorer
  - **Recommended Occupations:** Scholar, Scout (*Explorer*).
  - **Recommended Origins:** Research, Colony, Hostile.
  - **Recommended Factions:** Auluran (Terraformers), Ascendancy, Entari Combine.
  - **Key Attributes:** Intellect (+3 Primary), Stamina (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Survival), Knowledge (Science - Geology), Knowledge (Science - Biology).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Planetary Savant, Field Researcher.
  - **Tactical Role:** Identifying environmental hazards, finding resources, surviving planetary conditions.

---

## **17. THE ROBOTICIST**

A scholar who specializes in the study, design, and development of robots.

*You breathe life into metal. You design and build the machines that serve, fight, and explore. You understand the artificial mind better than the organic one.*

*"It's not just a machine. It's a masterpiece."*

  - **Core Concept:** Crafter / Minion Master / Tech
  - **Recommended Occupations:** Builder (*Engineer*), Scholar.
  - **Recommended Origins:** Research, Industrial, Urban.
  - **Recommended Factions:** Mekan (Self-Study), Syndicate (Drone Works), Ascendancy.
  - **Key Attributes:** Intellect (+3 Primary), Intellect (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Vocation (Engineer), Knowledge (Computers).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Robotic Affinity, Automation Expert.
  - **Tactical Role:** Building/repairing drones, commanding robot minions, hacking enemy bots.

---

## **18. THE TACTICIAN**

A strategic mastermind who analyzes the battlefield and coordinates actions.

*You win the battle before it starts. You see the flow of combat, anticipating enemy moves and positioning your allies for maximum effect. You turn chaos into order.*

*"They are moving to flank. Suppress the left and advance on my signal."*

  - **Core Concept:** Leader / Support / Buffer
  - **Recommended Occupations:** Soldier, Representative (*Officer*).
  - **Recommended Origins:** Militaristic, Urban, Spacer.
  - **Recommended Factions:** Impyrium (High Command), Dracon Dynasty, Mekan (War Minds).
  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Tactics), Leadership, Combat (Any), Insight.
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Battlefield Alertness, Tactical Genius.
  - **Tactical Role:** Boosting ally initiative/attacks, countering enemy tactics, controlling the battlefield.

---

## **19. THE TECHNICIAN**

A skilled worker who maintains and repairs complex machinery.

*You keep the lights on. You are the hands-on expert who keeps the complex systems of the future running. You fix the engines, the power grids, and the life support.*

*"It's a bypass of the bypass. It'll hold— probably."*

  - **Core Concept:** Support / Utility / Repair
  - **Recommended Occupations:** Builder, Spacer.
  - **Recommended Origins:** Industrial, Spacer, Colony.
  - **Recommended Factions:** Outworlds (Mechanics), Coalition (Techs), Syndicate.
  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Vocation (Mechanic), Vocation (Electrician), Investigation.
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Technical Expertise, Problem Solver.
  - **Tactical Role:** Rapid repair of gear/vehicles, bypassing locks/panels, technical support.

---

## **20. THE XENOLOGIST**

An expert in alien cultures, biology, and languages.

*You bridge the gap between worlds. You understand the strange and the alien, decoding their languages and customs to foster understanding or gain an advantage.*

*"They aren't monsters. They're just— different."*

  - **Core Concept:** Face / Knowledge / Science
  - **Recommended Occupations:** Scholar, Representative (*Diplomat*).
  - **Recommended Origins:** Research, Spacer, Enlightened.
  - **Recommended Factions:** Entari Combine (First Contact), Alterian Enclave, Ascendancy.
  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Xenology), Diplomacy, Insight, Knowledge (Language).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cultural Sensitivity, Xeno-Linguist.
  - **Tactical Role:** Communicating with aliens, identifying xeno-threats, cultural navigation.

---

## **21. THE THEORETICIAN**

THE visionary scientist who pushes the boundaries of standard physics to unlock the secrets of the multiverse.

*You explore the "why" behind the "how." While others use Knowledge (Technology), you define the laws that make it possible. You see the universe as a series of equations waiting to be balanced.*

*"The math doesn't lie. It just tells truths we aren't ready to hear."*

  - **Core Concept:** Research / Utility / Lore
  - **Recommended Occupations:** Scholar, Specialist.
  - **Recommended Origins:** Research, Enlightened, Spacer.
  - **Recommended Factions:** Mekan (Code Researchers), Ascendancy (Theorists), Alterian Enclave.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Science - Physics), Knowledge (Technology), Knowledge (Science - Mathematics).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Logical Deduction, Innovative Thinking.
  - **Tactical Role:** Solving complex puzzles, predicting dimensional anomalies, theoretical tech analysis.

---

## **22. THE BIOLOGIST**

The expert on living systems who studies the interaction between species and their environments.

*You understand the spark of life. You see the connections between the smallest microbe and the largest apex predator. You find solutions where nature provides the blueprint.*

*"Life always finds a way. I'm just here to watch it happen."*

  - **Core Concept:** Science / Utility / Support
  - **Recommended Occupations:** Scholar, Specialist.
  - **Recommended Origins:** Agricultural, Research, Aquatic.
  - **Recommended Factions:** Auluran (Life-Shapers), Entari Combine (Botanists), Ascendancy.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Medicine, Knowledge (Science - Biology),  Knowledge (Nature), Investigation.
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Scientific Method, Ecological Expertise.
  - **Tactical Role:** Identifying alien fauna/flora, treating organic toxins, analyzing biological samples.

---

## **23. THE NET-ARCHITECT**

The high-level systems engineer who designs and manages the data infrastructures that link civilizations.

*You build the digital world. You don't just hack systems; you create the foundations they sit on. You understand the flow of information as a physical force that must be harnessed.*

*"The Grid is my masterpiece. Every packet of data is where I intended it to be."*

  - **Core Concept:** Tech / Logistics / Support
  - **Recommended Occupations:** Specialist, Builder.
  - **Recommended Origins:** Urban, Industrial, Research.
  - **Recommended Factions:** Syndicate (Mesh Architects), Mekan (Grid Weavers), Ascendancy.
  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Computers), Vocation (Engineer), Knowledge (Technology).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Automation Expert, Master Builder.
  - **Tactical Role:** Hardening party networks, creating tactical data-links, identifying digital infrastructure weaknesses.

---

## **24. THE LINGUIST**

The master of communication who deciphers the languages of the galaxy to enable cooperation or manipulation.

*You are the key to understanding. You translate the inscrutable and find the meaning hidden in alien noise. You know that the right word is often more powerful than the largest railgun.*

*"Language is the first weapon. And the first shield."*

  - **Core Concept:** Intel / Face / Support
  - **Recommended Occupations:** Scholar, Representative.
  - **Recommended Origins:** Urban, Research, Spacer.
  - **Recommended Factions:** Entari Combine (Translators), Alterian Enclave, Ascendancy.
  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Languages), Diplomacy, Insight, Knowledge (History).
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Polyglot, Cultural Interpreter.
  - **Tactical Role:** Translating alien documents/comms, mediating first contact, deciphering codes.

---

## **25. THE XENO-SURVEYOR**

The meticulous researcher who maps the biological and geological variables of alien worlds to assess their value and danger.

*You read the planet's history in its soil and its future in its atmosphere. You are the vanguard of colonization, ensuring that those who follow know exactly what they are walking into.*

*"This world has potential. And at least three ways to kill you by sunset."*

  - **Core Concept:** Exploration / Science / Survival
  - **Recommended Occupations:** Scout, Scholar.
  - **Recommended Origins:** Colony, Spacer, Research.
  - **Recommended Factions:** Ascendancy (Reach Surveyors), Outworlds, Auluran.
  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).
  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Survival), Navigation, Knowledge (Geology), Alertness.
  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cartographer, Planetary Savant.
  - **Tactical Role:** Identifying environmental resources, plotting safe paths, planetary analysis.

  
**  
**

---

## DISCREPANCY & RESTORATION LEDGER

* **DISC-305 (1.02.Savants.md Full Narrative & Quote Restoration):** Restored 100% of the omitted narrative descriptions, second-person roleplay paragraphs, and iconic quotes for all 25 `_NT_` Archetypes from `/_ _ TANGENT RP CODEX _ _/1.02 ARCHETYPES` and `/game rules/operator/archetypes/1.02.Savants.md`, integrated the `Savant Archetype Alignment Matrix` from `TANGENT RP Signature Features Alignment`, and applied all canonical Attribute (`Stamina`, `Agility`, `Wisdom`), Skill (`Alertness`, `Insight`, `Vocation [Handler]`, `Knowledge [Language]`), and `80-CP Chassis` normalizations.

