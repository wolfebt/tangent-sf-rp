---
id: "doc-architect-99-character-moduleb-competencyroles"
name: "Character (Module B): Competency Roles & Matrices"
fileName: "99.Character.ModuleB.CompetencyRoles.md"
relPath: "architect/characters/99.Character.ModuleB.CompetencyRoles.md"
isMasterDoc: false
masterDocId: "doc-architect-99-modular-character-matrix"
category: "architect_matrix"
parent: "doc-architect-99-modular-character-matrix"
order: 8
perspective: "architect"
entry_type: "Character Matrix Module"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","modular-rule","characters","99.character.moduleb.competencyroles","matrix"]
updatedAt: "2026-11-04T00:33:10.395Z"
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

# **99.Character.ModuleB.CompetencyRoles.md**

## **MECHANICAL AUTHORITY & CANONICAL RULES BLOCK**

- **Core Resolution Engine:** `2d10 + Skill Rank + Attribute Modifier + Situational Modifiers vs. Challenge Rating (CR)`. Critical Hit (Natural 20 / double-10s) = `Rolled Dice + 10 (20 -> 30) + 2x Base Weapon Damage Dice + Critical Effect`. Fumble (Natural 2 / double-1s) = `Flat -10 + Complication`. Advantage/Disadvantage rolls `+1d10` per stack and keeps the highest or lowest 2 dice.
- **Character Point (CP) Economy & 80-CP Archetype Chassis:** Starting Operator budget is **150 CP**, partitioned into the **80-CP Archetype Chassis** (`15 CP` Primary Attribute at `+3`, `10 CP` Secondary Attribute at `+2`, `24 CP` for 4 Essential Skills at Rank 6, `18 CP` for 6 Supporting Skills at Rank 3, and `13 CP` for 2 Signature Traits at 1 CP each + 3 Recommended Core Features at 9 CP) plus **70 CP Customization**.
- **60-SP Sociological Background Allocation:** **Faction (20 SP) + Origin (20 SP) + Occupation (20 SP) = 60 Skill Ranks, 4 Features, and 4 Traits at 0 CP** (additional traits cost 1 CP each).
- **Universal Straight CP Pricing:** Attributes cost **5 CP per +1** (and refund **-5 CP per -1 penalty**); Skills cost **1 CP per 1 Skill Rank** (**5 CP per 5 Ranks**) across all character, species, companion, and adversary builds with zero package discounts. Standard Features cost **3 CP** (**2 CP** when listed under **Recommended Features**, minimum 1 CP).
- **Vitality, Health & Structure (Zero Stamina Scaling):** Biological characters begin with **Base 30 Vitality** and **Base 30 Health** (Synthetics/Constructs combine both into **Base 60 Structure Points [SP]**), scaled strictly at **+5 points per 1 CP** spent. **Stamina (STA) never increases Vitality or Health**; Stamina modifier subtracts point-for-point from incoming damage as **Base Toughness** after highest single-domain Armor DR (`Stability Points = STA + 5`).
- **Personal Hindrance Cap:** Maximum **+10 CP** gained from personal Hindrances at character creation; **Species-level disadvantages and Stigmas are exempt** from this cap.

## **MCM REFERENCE MODULE B: COMPETENCY ROLES & MATRICES**

During Step 3 of NPC construction (`99. MODULAR CHARACTER MATRIX.md`), Game Masters and Operators utilize this matrix to assign specific skill suites, attributes, and combat behaviors based on the character's designated job on the battlefield. Rather than generating exhaustive, unfocused lists, skills are strictly categorized by **Narrative Function**. Apply the Tier Chassis's **Primary Skill Rank** to the first listed Key Skill and the **Secondary Skill Rank** to all remaining Key Skills.

## **A. COMBAT ROLES**

### **1. Breaker (Frontline / Heavy Assault)**

These characters are the vanguard of any hostile force, designed to absorb massive amounts of trauma and break enemy lines through overwhelming physical force.

#### **Tank (Impenetrable Vanguard)**

Operating as the impenetrable vanguard, the Tank utilizes massive durability to anchor the front lines and protect fragile allies. Deployed precisely when an immovable object is required to hold a vital chokepoint, they solve battlefield problems by deliberately absorbing catastrophic damage and drawing enemy fire away from high-value targets. They accomplish this by closing the distance steadily, relying almost entirely on heavy armor shielding, immense Stamina, and the Intimidate skill to dominate the physical space of the encounter.

- **Primary Attributes:** Stamina (STA), Strength (STR).
- **Key Skills:** **Defense** *(Primary)*, Intimidate, Athletics, Melee.
- **Role Feature:** **Guard / Loyal Protector / Protective Stance** *(Intercept attacks meant for adjacent allies; stop enemies moving through reach)*.

#### **Brute (Kinetic Hammer)**

Functioning as the overwhelming physical hammer of a squad, the Brute utilizes raw, unadulterated strength to shatter enemy fortifications and break defensive lines. Dispatched when sheer kinetic force is necessary to breach a hardened position, they operate by crashing into the enemy ranks to inflict maximum structural and physical trauma. Relying heavily on the Athletics and Melee Combat skills, they crush their opposition through relentless, close-quarters brute-force maneuvers.

- **Primary Attributes:** Strength (STR), Stamina (STA).
- **Key Skills:** **Melee / Unarmed Combat** *(Primary)*, Athletics, Intimidate.
- **Role Feature:** **Rage / Power Attack** *(Take damage to deal +2 damage; or `+2 STR, +2 STA [Toughness/Fortitude], +2 Willpower, -2 Defense`; or trade Strike for Melee Damage)*.

### **2. Striker (Precision / Damage Dealers)**

Operating on the principle of maximum lethality with minimum exposure, Strikers are the designated executioners of the battlefield, specializing in the rapid neutralization of high-value threats.

#### **Melee DPS (Close-Quarters Executioner)**

Serving as the close-quarters executioner, the Melee DPS is deployed to inflict maximum, targeted lethality with surgical precision directly on the front lines. They are utilized when high-value targets must be rapidly eliminated in hand-to-hand engagements before they can react or cast. By prioritizing Agility and Strength, they leverage fast-striking Melee Combat and Acrobatics to weave through defenses, dealing devastating localized damage while remaining in constant motion.

- **Primary Attributes:** Agility (AGI), Strength (STR).
- **Key Skills:** **Melee Combat** *(Primary)*, Acrobatics, Defense (Evasion).
- **Role Feature:** **Sneak Attack / Precision Strike** *(+1d6 damage per rank + INT against Flat-Footed/Flanked/Advantage targets, or 2x weapon dice on a single strike)*.

#### **Ranged DPS (Sustained Firepower)**

Operating as the primary source of sustained suppressive and lethal fire, the Ranged DPS controls the mid-range battlefield. They are positioned behind the vanguard when a squad needs to lay down a continuous hail of ballistics or energy blasts to keep enemies pinned or eliminate them as they approach. Relying on the Ranged Combat skill, they utilize heavy or rapid-fire weaponry to systematically dismantle enemy ranks from a safe distance.

- **Primary Attributes:** Agility (AGI), Wisdom (WIS).
- **Key Skills:** **Ballistic / Energy / Ranged Combat** *(Primary)*, Alertness, Defense.
- **Role Feature:** **Burst Attack** *(Reduces penalties with Auto-Fire by 2; Short Burst grants +2 Strike)*.

#### **Sniper (Long-Range Eliminator)**

Functioning as the unseen executioner, the Sniper is deployed to surgically eliminate high-value targets from extreme distances. They operate from elevated or deeply obscured vantage points when an enemy commander or heavy weapon operator must be neutralized before an engagement even truly begins. By heavily leveraging the Stealth and Ranged Combat skills, they dictate the terms of engagement from the shadows, ensuring their targets are dead before the sound of the gunshot arrives.

- **Primary Attributes:** Agility (AGI), Wisdom (WIS).
- **Key Skills:** **Ballistic / Energy / Ranged Combat** *(Primary)*, Stealth, Alertness.
- **Role Feature:** **Sniper / Dead Aim & Aiming Mastery** *(+2 Strike when stationary, stacking with +2/action Aiming; ignores light cover penalties)*.

### **3. Skirmisher (Mobility / Asymmetric Warfare)**

Skirmishers are masters of asymmetric warfare and battlefield traversal, engineered to exploit gaps in enemy formations and cause absolute chaos behind the front lines.

#### **Mobility Specialist (Hit-and-Run Harasser)**

Acting as the master of traversal, the Mobility Specialist focuses entirely on movement and positioning. They are dispatched to exploit sudden gaps in enemy formations, divide the enemy's attention, and secure vital objectives across the map. Relying heavily on Agility, Stamina, and Acrobatics, they ensure they control the tempo and location of the engagement, utilizing sheer speed to outmaneuver slower, heavily armored foes.

- **Primary Attributes:** Agility (AGI), Stamina (STA).
- **Key Skills:** **Acrobatics** *(Primary)*, Piloting, Combat *(Any)*, Athletics.
- **Role Feature:** **Mobility & Nimble Moves** *(+4 Defense against movement AoOs; ignore 10–30 ft of difficult terrain penalties)*.

#### **Flank / Infiltrator / Saboteur (Stealth & Breach)**

Operating as the tactical positioning expert, the Flank / Infiltrator is engineered to collapse defensive lines from the sides or rear. Deployed specifically to punish enemies who overcommit to a frontal assault, they operate by circling the main engagement to strike at exposed vulnerabilities. Utilizing Defense (Evasion) and Stealth, they execute devastating hit-and-run tactics, dealing high burst damage before fading away to avoid sustained, direct-fire retaliations.

- **Primary Attributes:** Agility (AGI), Wisdom (WIS) or Intellect (INT).
- **Key Skills:** **Stealth** *(Primary)*, Melee/Ranged Combat, Defense (Evasion), Vocation *(Demolitionist / Mechanic)*, Bluff.
- **Role Feature:** **Hit & Run / Silent Killer** *(Move after attacking without provoking reactions; attacks from complete concealment score automatic Critical Hits and bypass Armor DR)*.

### **4. Caster (Metaphysics / Reality Warping)**

Harnessing the fundamental metaphysical forces of the Tangent universe, Casters bend reality to serve their tactical needs.

#### **Combative Meta-User / Artillery Adept**

Operating as esoteric artillery and a reality-warping specialist, the Combative Meta-User is brought onto the battlefield when conventional ballistics fail. Required to provide area denial, bypass physical armor, or manipulate the environment via Psionics, Arcane magic, or Primal forces, they rely on deep Intellect, Wisdom, or Charisma. They use the Attune skill and specific Disciplines to manifest powerful offensive Invocations, fundamentally altering the physics of the encounter.

- **Primary Attributes:** Key Mental Attribute (INT, WIS, or CHA), Stamina (STA).
- **Key Skills:** **Attune** *(Primary)*, **2 Metaphysic Discipline Focus Skills** *(Primary/Secondary)*, Alertness.
- **Role Feature:** **Awakened, Centering & Discipline Focus** *(Access to Metaphysical Invocations; +2 to +6 to Attune Save CRs and Discipline Potency)*.

## **B. SUPPORT & UTILITY ROLES**

### **5. Commander (Leadership / Force Multiplication)**

The linchpins of any organized squad, Commanders act as the tactical brain and morale anchor for their subordinates.

#### **Buffer**

Serving as the morale and enhancement center of a unit, the Buffer elevates the operational effectiveness and resilience of everyone around them. Positioned safely in the mid-line during large-scale skirmishes, they are necessary to grant substantial defensive cohesion and offensive boosts to their frontline allies. Utilizing Charisma and specific support features, they actively project auras or targeted metaphysical enhancements that ensure their squad survives overwhelming odds.

- **Primary Attributes:** Charisma (CHA), Wisdom (WIS).
- **Key Skills:** **Diplomacy** *(Primary)*, Attune *(Entropy-Order)*.
- **Role Feature:** **Aura of Command** *(Allies within 30 ft gain +1 to Hit/Save)*.

#### **Leader / Tactician**

Functioning as the tactical brain of an operation, the Leader dictates the flow of battle and prevents squad routing under heavy fire. They are deployed at the helm of military or corporate strike teams where coordination is the defining difference between victory and slaughter. Relying on the Tactics and Leadership skills, they survey the battlefield to issue precise, calculated commands, orchestrating complex maneuvers that turn chaotic skirmishes into methodical victories.

- **Primary Attributes:** Intellect (INT), Charisma (CHA).
- **Key Skills:** **Leadership** *(Primary)*, Knowledge *(Tactics)*, Insight, Combat *(Any)*.
- **Role Feature:** **Coordinated Assist & Master Plan** *(Create bonus pools through pre-planning and grant +2 to +4 Aid Another bonuses to squadmates)*.

### **6. Controller (Sabotage / Environmental Manipulation)**

Controllers manipulate the operational environment, neutralizing enemy advantages through technological or metaphysical suppression.

#### **Debuffer**

Operating as a battlefield saboteur, the Debuffer systematically neutralizes enemy advantages through targeted suppressive effects. They are deployed when confronting heavily fortified or physically superior foes, stepping in to inflict status conditions, blind sensors, or cripple movement. Utilizing specific weaponry or metaphysical curses, their mastery of disruptive tactics allows them to turn formidable adversaries into helpless, compromised targets.

- **Primary Attributes:** Wisdom (WIS), Intellect (INT).
- **Key Skills:** **Intimidate** *(Primary)*, Discipline *(Entropy-Chaos)*.
- **Role Feature:** **Suppressing Fire** or **Analyze Weakness**.

#### **Technician / Hacker / Engineer**

Serving as the environmental manipulator and electronic warfare expert, the Technician controls the digital and mechanical battlefield. They are dispatched against technologically advanced factions to jam communications, hack cybernetics, or lock down automated defenses. Utilizing high Intellect and their mastery of Computers and Engineering, they rewrite the operational environment, turning the enemy's own security systems and hardware against them.

- **Primary Attributes:** Intellect (INT), Agility (AGI).
- **Key Skills:** **Knowledge (Computers)** or **Vocation (Engineer / Mechanic)** *(Primary)*, Knowledge *(Technology)*, Knowledge *(Investigation)*, Piloting.
- **Role Feature:** **Jamming / Cyber Warfare & Gearhead** *(Disable enemy tech; slice networks)*.

### **7. Face (Social / Subterfuge)**

Because not all battles are fought with kinetic weapons, Face variants specialize in the warfare of information, deception, and infiltration.

#### **Socialite / Envoy / Broker**

Engaging in the subtle warfare of high society and negotiation, the Socialite operates in environments where drawn weapons would guarantee immediate failure. They are dispatched into corporate galas, diplomatic summits, and affluent urban centers to secure objectives purely through charm, blackmail, and misdirection. Relying heavily on Charisma, they utilize the Bluff, Diplomacy, and Etiquette skills to bypass security, extract secrets, and negotiate favorable outcomes without ever throwing a punch.

- **Primary Attributes:** Charisma (CHA), Intellect (INT).
- **Key Skills:** **Diplomacy** or **Bluff** *(Primary)*, Insight, Knowledge *(Culture / Nobility / Appraisal)*, Streetwise.
- **Role Feature:** **Connected / Silver Tongue / Black Market Connections** *(Call in favors; shift attitudes)*.

#### **Spy**

Functioning as the covert infiltrator and intelligence gatherer, the Spy exists to uncover that which is deeply hidden. Deployed deep behind enemy lines or within rival corporate structures, they operate to extract highly classified data or sabotage operations unnoticed. Utilizing exceptional Wisdom and Agility, they leverage Insight, Stealth, and Streetwise to effortlessly blend into hostile environments, ensuring they are entirely forgotten the moment they leave a room.

- **Primary Attributes:** Wisdom (WIS), Agility (AGI).
- **Key Skills:** **Stealth** *(Primary)*, Insight, Disguise / Acting *(Expression)*, Streetwise.
- **Role Feature:** **Veiled Threat** or **Assessment**.

### **8. Medic & Scholar (Restoration, Triage & Field Science)**

Dedicated restorative and analytical anchors engineered or trained specifically to keep their allies alive and solve environmental mysteries under extreme duress.

#### **Healer (Metaphysical Restoration)**

Serving as the metaphysical restorative anchor for any active squad, the Healer is dedicated to preserving life under catastrophic duress through the Resonance. Positioned safely behind the primary combatants, they respond instantly to knit shattered bone and flesh when allies suffer critical trauma. Utilizing high Wisdom and the Attune skill, they channel Life and Entropic energies to deploy powerful healing Invocations, miraculously pulling their team back from the brink of death.

- **Primary Attributes:** Wisdom (WIS), Charisma (CHA).
- **Key Skills:** **Attune** *(Primary)*, Discipline *(Entropy-Order)*.
- **Role Feature:** **Life-Weaver** *(Access to Metaphysical Healing Invocations)*.

#### **Biochemist / Combat Medic / Scholar / Pathfinder**

Operating as the conventional medical expert and tactical anatomist, the Biochemist / Combat Medic keeps allies combat-effective using high-tech science and stimulants. Utilizing high Intellect and Wisdom, they apply Knowledge (Medicine) and Knowledge (Biology) to deploy combat stims, auto-sutures, and antivenoms, while simultaneously identifying the physiological weaknesses of their enemies.

- **Primary Attributes:** Intellect (INT), Wisdom (WIS).
- **Key Skills:** **Knowledge (Medicine)** *(Primary — Medic)*, **Academics** *(Primary — Scholar)*, or **Knowledge (Survival)** *(Primary — Pathfinder)*, Knowledge *(Biology / Science / Nature)*, Alertness.
- **Role Feature:** **Medic & Field Surgeon** *(First Aid as a Standard Action without provoking reactions; restores `5 * WIS` Vitality and stabilizes at CR 15)*.

## **DISCREPANCY & RESTORATION LEDGER (DISC-515)**

- **File Target:** `architect/characters/99.Character.ModuleB.CompetencyRoles.md`
- **Restoration Pass (Three-Way Merge):**
  - Restored 100% of the full narrative role descriptions (Tank, Brute, Melee DPS, Ranged DPS, Sniper, Mobility Specialist, Flank, Combative Meta-User, Buffer, Leader, Debuffer, Technician, Socialite, Spy, Healer, Biochemist) from `/game rules/architect/characters/99.Character.ModuleB.CompetencyRoles.md`.
  - Merged with the 16 canonical role mechanics and Primary/Secondary skill mappings from the Nov 2 revision.
- **Mechanical Normalization Pass (12 Global Rules):**
  - Normalized all skill references (`Knowledge (Computers)`, `Knowledge (Medicine)`, `Knowledge (Survival)`, `Alertness`, `Insight`) and `CR 15` stabilization target.

