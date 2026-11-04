---
id: "doc-operator-1-08-features"
name: "1.08 FEATURES"
fileName: "1.08 FEATURES.md"
relPath: "operator/1.08 FEATURES.md"
isMasterDoc: true
masterDocId: "doc-operator-1-08-features"
category: "operator_rule"
parent: "1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)"
order: 205
perspective: "operator"
entry_type: "Core Rulebook"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","source-of-truth","1.08 features","mechanics"]
updatedAt: "2026-11-04T09:33:29.350Z"
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

# **1.08 FEATURES**
## Overview & Mechanical Authority Block

* **Canonical Archive Path:** `/game_rules/operator/1.08 FEATURES.md`
* **Codex Source Reference:** `/_ _ TANGENT RP CODEX _ _/1.08 FEATURES (File ID: 1sSXybfCpspSaGg1DpaYNoBTEeCGvCyEAuIC-EAPSxiM)`
* **Mechanical Authority (`/game_rules` Wins):**
* **Feature Pricing:** **Standard Feature = `3 CP`**; **Recommended Feature = `2 CP`** (`-1 CP` discount for Species, Faction, Origin, or Occupation recommended features; minimum `1 CP`). Replaces all legacy `Recommended Features` / `Suggested Feature` terminology.
* **Feature-Gated Precision Strike Chain:** Replaces legacy `Vital Strike` with `Precision Strike` (`Rank 6`, `2x` base weapon damage dice), `Improved Precision Strike` (`Rank 11`, `3x` base weapon damage dice), and `Greater Precision Strike` (`Rank 16`, `4x` base weapon damage dice).
* **Zero Stamina Pool Scaling:** `Tough` grants `DR 5` vs. Non-Lethal/Stun trauma, and `Rage` (`+2 STA`) increases `Base Toughness` DR by `+2` and Fortitude Saves by `+4` (Stamina never adds Hit Points).
* **Core Resolution & Nomenclature:** Uses `2d10 vs. CR`, `Advantage` (`+1d10` keep highest 2), `Defense` (never `AC` or `CMD`), and canonical skill names (`Alertness`, `Insight`, `Knowledge (Language)`, `Athletics`, `Vocation (Handler)`, `Knowledge (Technology)`, `Computers`).
* **Textual Completeness (`_ _ TANGENT RP CODEX _ _` Wins):** 100% of original lore paragraphs, examples, tables, and rules entries restored verbatim with zero redactions, ellipses, or placeholders.

---

## Part I — Alignment & Summary Matrix Table

### **1. Master Feature Category Summary Matrix (231 Canonical Features)**

| Category | Sub-Files | Feature Count | Pricing & Scaling Rules |
| :--- | :--- | :---: | :--- |
| **I. Ability Features** | `1.08.AbilityFeatures.md` | 16 Features | `3 CP` Standard / `2 CP` Recommended; Ranked up to governing Attribute Score |
| **II. Combat Features** | `1.08.CombatFeatures.md`, `1.08.CombatFeatures.D_W.md` | 45 Features | Includes feature-gated `Precision Strike` chain (`2x`/`3x`/`4x` base weapon dice) |
| **III. Discipline Features** | `1.08.DisciplineFeatures.md` | 16 Features | Includes `Awakened`, `Centering` (Save CRs), `Discipline Focus` (Severity), `Tech Interface` |
| **IV. General Features** | `1.08.GeneralFeatures.md`, `1.08.GeneralFeatures.N_Z.md` | 58 Features | Includes 43 General Features + 15 Superhuman Biological & Neurological Mutations |
| **V. Karma Features** | `1.08.KarmaFeatures.md` | 10 Features | Karma Pool manipulation; `Charmed` rerolls `Natural 2` (`double-1s` on `2d10`) |
| **VI. Skill Features** | `1.08.SkillFeatures.md`, `1.08.SkillFeatures.M_Z.md` | 49 Features | Includes `Skill Focus` (`+2`/stage), `Skill Specialization` (`+10` cap), Pilot & Social chains |
| **VII. Special Features** | `1.08.SpecialFeatures.md` | 37 Features | Includes `Augmented` (`6 CP` credit), `Companion` (`40 CP`), `Non-Lethal Immunity`, `Rage` (`+2 STA` = `+2 Base Toughness`) |

### **2. Master Ability Features Table (16 Features)**

| **FEATURE NAME** | **PREREQUISITE** | **BENEFIT / EFFECT** | **SPECIAL / NOTES** |
| :--- | :--- | :--- | :--- |
| **Great Fortitude** | Stamina 1 | +2 bonus on Fortitude checks | Ranked (Stamina) |
| **Incredible Fortitude** | Great Fortitude, Stamina 2 | Roll Fortitude checks with Advantage (`2d10 + 1d10` keep highest 2) | — |
| **Lightning Reflexes** | Agility 1 | +2 bonus on Reflex checks | Ranked (Agility) |
| **Superb Reflexes** | Lightning Reflexes, Agility 2 | Roll Reflex checks with Advantage (`2d10 + 1d10` keep highest 2) | — |
| **Potent Might** | Strength 1 | +2 bonus on Might checks | Ranked (Strength) |
| **Mighty Surge** | Potent Might, Strength 2 | Roll Might checks with Advantage (`2d10 + 1d10` keep highest 2) | — |
| **Inspiring Personality** | Charisma 1 | +2 bonus on Etiquette checks | Ranked (Charisma) |
| **Motivating Persona** | Inspiring Personality, Charisma 2 | Roll Etiquette checks with Advantage (`2d10 + 1d10` keep highest 2) | — |
| **Iron Will** | Wisdom 1 | +2 bonus on Will checks | Ranked (Wisdom) |
| **Indomitable Will** | Iron Will, Wisdom 2 | Roll Will checks with Advantage (`2d10 + 1d10` keep highest 2) | — |
| **Insightful Reason** | Intellect 1 | +2 bonus on Logic (Reason) checks | Ranked (Intellect) |
| **Inspired Reason** | Insightful Reason, Intellect 2 | Roll Logic (Reason) checks with Advantage (`2d10 + 1d10` keep highest 2) | — |
| **Evasiveness** | Base Save Feature | Successful Resistance Check is full avoidance of an effect if it would be partial | Multiple (Reflex, Fortitude, or Will) |
| **Improved Evasiveness** | Evasiveness | Failed check is still a partial success (resulting in less effect, generally 1/2) | — |
| **Tolerance** | Stamina 1 or Wisdom 1 | Additional Resistance Checks made in 1/2 typical time for most ongoing effects | Multiple (Fortitude or Will) |
| **Improved Tolerance** | Tolerance | Additional Resistance Checks made in 1/4 typical time for most ongoing effects | — |

### **3. Master Combat Features Table (45 Features)**

| **FEATURE NAME** | **PREREQUISITE** | **BENEFIT / EFFECT** | **SPECIAL / NOTES** |
| :--- | :--- | :--- | :--- |
| **Agile Wrestling** | Agility 1, Unarmed 1 | Use your Agility instead of Strength for Grappling checks | — |
| **Ambidextrous** | Agility 2 | Use both hands equally well; eliminates off-hand penalty | — |
| **Multidextrous** | Ambidextrous or Agility 4 (3+ Arms) | No off-hand penalty when wielding weapons with multiple limbs | — |
| **Blind-Fight** | Alertness 1 | Roll Strike with Advantage (`2d10 + 1d10` keep highest 2) to counter concealment miss chance | — |
| **Blockade** | Strength 2 | Stop enemies from moving past your threatened area via opposed Might check | — |
| **Burst Attack** | Combat Skill 2 | Reduces Auto-Fire penalties by 2 (+2 Strike on Short Burst) | Ballistic, Energy, or Heavy Weapons |
| **Channel Smite** | Awakened (Energy), Attune 1 | Channel touch-range Invocation energy through a melee weapon attack | — |
| **Combat Casting** | Attune 1 | +4 bonus on Defense vs. AoO and +4 to Concentration (Attune) checks | — |
| **Combat Expertise** | Intellect 2 | Trade Strike bonus (up to Combat Skill Rank) for equal Defense bonus | — |
| **Improved Disarm** | Combat Expertise | +2 bonus on Disarm attempts; does not provoke Attack of Opportunity | — |
| **Greater Disarm** | Improved Disarm | Disarmed weapons are knocked 15 feet away from your enemy | — |
| **Improved Feint** | Combat Expertise, Bluff 1 | Feint in combat using Bluff as a Move Action | — |
| **Greater Feint** | Improved Feint | Enemies you feint lose their Agility bonus to Defense for 1 full round | — |
| **Improved Trip** | Combat Expertise | +2 bonus on Trip attempts; does not provoke Attack of Opportunity | — |
| **Greater Trip** | Improved Trip | Enemies you trip provoke an immediate Attack of Opportunity | — |
| **Whirlwind Attack** | Agility 2, Combat Expertise, Blitz Attack | Full-Round Action: make one melee attack against all foes within reach | — |
| **Combat Reflexes** | Agility 1 | Cannot be Flanked from side attacks | — |
| **Combat Skill Focus** | Chosen Combat Skill 1 | +2 bonus to chosen Combat Skill; may be purchased once per Skill Stage | Ranked / Multiple |
| **Combat Specialist** | Chosen Combat Skill 6 | Increase damage die type of one Combat Skill weapon group by one step | Multiple |
| **Crushing Blow** | Strength 2, Power Attack | Standard Action melee hit inflicts -2 Defense on target for 1 round | — |
| **Dead Aim** | Wisdom 3, Ranged 6 | Trade movement for +2 Strike bonus with Ranged weapons | — |
| **Defensive Combat Training** | Combat Skill 1 | +4 bonus to Defense against Combat Maneuvers (Trip, Disarm, Grapple, Bull Rush) | — |
| **Deflect Arrows** | Agility 2, Unarmed 1 | Avoid one ranged projectile attack per round (Reflex Save CR = Attack Roll) | — |
| **Snatch Arrows** | Agility 4, Deflect Arrows | Catch a deflected ranged projectile with a free hand (and throw back if thrown) | — |
| **Dodge** | Agility 1 | +1 Dodge bonus to Defense (stacks with other Dodge bonuses) | — |
| **Mobility** | Agility 2, Dodge | +4 Dodge bonus to Defense against Attacks of Opportunity from movement | — |
| **Two-Weapon Fighting** | Agility 2, Combat Skill 2 | Reduces off-hand weapon Strike penalty to -2 | — |
| **Double Slice** | Two-Weapon Fighting, Strength 1 | Add full Strength modifier to off-hand weapon damage rolls | — |
| **Improved Two-Weapon Fighting** | Agility 3, Combat Skill 6, Two-Weapon Fighting | Gain a second off-hand attack at a -5 penalty | — |
| **Greater Two-Weapon Fighting** | Agility 4, Combat Skill 11, Imp. Two-Weapon Fighting | Gain a third off-hand attack at a -10 penalty | — |
| **Perfect Two-Weapon Fighting** | Agility 5, Combat Skill 16, Grtr. Two-Weapon Fighting | Gain a fourth off-hand attack at a -15 penalty | — |
| **Power Attack** | Strength 2, Unarmed or Melee 6 | Trade melee Strike bonus (up to Combat Skill Rank) for equal Damage bonus | — |
| **Two-Weapon Defense** | Two-Weapon Fighting | +1 Shield bonus to Defense when fighting with two weapons | — |
| **Improved Two-Weapon Defense** | Imp. Two-Weapon Fighting, Two-Weapon Defense | +2 Shield bonus to Defense when fighting with two weapons | — |
| **Greater Two-Weapon Defense** | Grtr. Two-Weapon Fighting, Imp. Two-Weapon Defense | +3 Shield bonus to Defense when fighting with two weapons | — |
| **Perfect Two-Weapon Defense** | Perfect Two-Weapon Fighting, Grtr. Two-Weapon Defense | +4 Shield bonus to Defense when fighting with two weapons | — |
| **Uncanny Dodge** | Agility 4 | Retain Agility bonus to Defense when Flat-Footed or struck by Invisible foes | — |
| **Precision Strike** | Combat Skill 6 | Standard Action: consolidate a single attack to deal twice (`2x`) base weapon damage dice | Feature-gated consolidation |
| **Improved Precision Strike** | Precision Strike, Combat Skill 11 | Standard Action: consolidate a single attack to deal three times (`3x`) base weapon damage dice | Feature-gated consolidation |
| **Greater Precision Strike** | Improved Precision Strike, Combat Skill 16 | Standard Action: consolidate a single attack to deal four times (`4x`) base weapon damage dice | Feature-gated consolidation |
| **Weapon Focus** | Combat Skill 1 | +1 Strike with chosen weapon plus weapon-type effect (Piercing=+1 Pen, Slashing=+1 Bleed, Bludgeoning=+1 Stun CR) | Multiple |
| **Weapon Improvisation** | None | No penalties for using improvised Archaic weapons | — |
| **Weapon Specialization** | Weapon Focus, Combat Skill 6 | +1d damage with one chosen weapon type | Multiple |
| **Imp. Weapon Specialization** | Weapon Specialization, Combat Skill 11 | +2d damage (total) with one chosen weapon type | — |
| **Grtr. Weapon Specialization** | Imp. Weapon Specialization, Combat Skill 16 | +3d damage (total) with one chosen weapon type | — |

### **4. Master Discipline Features Table (16 Features)**

| **FEATURE NAME** | **PREREQUISITE** | **BENEFIT / EFFECT** | **SPECIAL / NOTES** |
| :--- | :--- | :--- | :--- |
| **Aptitude** | Key Ability 1+ | +2 bonus to 2 chosen Metafocus Discipline Skills | Multiple (Key Ability) |
| **Awakened** | None | Access Attune and 2 Discipline Skills of a chosen Metafocus Discipline | Multiple (unlocks 2 Discipline skills each) |
| **Centering** | Attune 6, Key Ability 2 | +2 bonus to Attune Checks (increasing Save CRs) | — |
| **Centering Expert** | Centering, Attune 11, Key Ability 4 | +4 bonus to Attune Checks (increasing Save CRs) | Replaces Centering |
| **Centering Master** | Centering Expert, Attune 16, Key Ability 6 | +6 bonus to Attune Checks (increasing Save CRs) | Replaces Centering Expert |
| **Discipline Focus** | Discipline Skill 6 | +2 bonus with chosen Discipline Skill (increasing Severity/Potency) | Multiple |
| **Discipline Expertise** | Discipline Focus, Discipline Skill 11 | +4 bonus with chosen Discipline Skill (increasing Severity/Potency) | — |
| **Discipline Mastery** | Discipline Expertise, Discipline Skill 16 | +6 bonus with chosen Discipline Skill (increasing Severity/Potency) | — |
| **Discipline Empower** | Discipline Focus, Attune 6 | Channel for Full Rounds to add +1 Effect Die (+5 check) per round (up to STA or WIS mod) | — |
| **Empowered Strike** | Attune 6 | +1 to Strike and Damage; attack counts as Enhanced (Magical/Psionic) vs. DR | Ranked (Attune) |
| **Focused Center** | Centering, Discipline Focus (all used) | May Take 10 on Attune Checks even in combat when all used Disciplines have Focus | — |
| **Balanced Center** | Centering Expert, Discipline Expertise (all used) | May Take 10 on Discipline Checks even in combat when all used Disciplines have Expertise | — |
| **Harmonious Center** | Centering Master, Discipline Mastery (all used) | Roll all Attune and Discipline Checks with Advantage (`2d10 + 1d10` keep highest 2) | — |
| **Special Ability** | Special (Species/Origin) | Use one specific Invocation at Level 1 as a standalone skill without Awakened | Multiple |
| **Tech Interface** | Special (Meta-Tech/Psi-Tech access) | Pilot vehicles or operate computers using Intellect instead of Agility via neural/meta link | Multiple |
| **Versatile Source** | Attune 6 | Use a secondary Ability Score modifier for Attune Checks | — |

### **5. Master General & Superhuman Features Table (58 Features)**

| **FEATURE NAME** | **PREREQUISITE** | **BENEFIT / EFFECT** | **SPECIAL / NOTES** |
| :--- | :--- | :--- | :--- |
| **Assessment** | Alertness 6, Insight 6 | Observe 1 round to determine target's relative threat level and highest Skill Stage | — |
| **Analyze Weakness** | Assessment | Standard Action (Assessment vs. Bluff): +1 Strike and Damage vs. target per 5 points of success | — |
| **Benefit (Authority)** | Special (Occupation) | Law Enforcement or Military position (Rank 1 Deputy to Rank 4 Interstellar Agent; +2 Intimidate/Diplomacy) | Ranked |
| **Benefit (Clearance)** | Special (Faction/Vocation) | Security Clearance (Rank 1 Classified to Rank 4 Black Badge) | Ranked |
| **Benefit (Equipment)** | Special (Faction/Corp) | Issued organizational gear (+4 effective Wealth Score per rank for issued kit, up to Starship/Base) | Ranked |
| **Benefit (Identity)** | None | Complete, verifiable legal Alternate Identity (checks to uncover rolled with Disadvantage) | Ranked |
| **Benefit (Immunity)** | Special | Legal shield against prosecution (Rank 1 Order Immunity to Rank 4 License to Kill) | Ranked |
| **Benefit (Status)** | Special | Recognized Rank/Title of influence and +2 bonus to Wealth checks | Ranked, Multiple |
| **Benefit (Wealth)** | None | Increase starting Wealth Score (WS) by +3 | Ranked |
| **Born Leader / Natural Leader** | Charisma 3, Diplomacy 6 (Special) | Gain loyal Followers and Cohort; +2 to Organization/Administration checks | — |
| **Connected** | Charisma 1 | Call on favors from network contacts (Rank 1 Street/Soldier to Rank 4 Boss/Director) | Ranked |
| **Contacts** | Charisma 1 | Gather Information in 1/2 time and roll with Advantage via reliable field contact | — |
| **Coordinated Assist** | Intellect 1 | +1 additional bonus to an ally's check when using Aid Another (Skill Synergy) | Ranked (Intellect) |
| **Climber** | Athletics 1 | Gain Climb Speed (1/2 base speed), Take 10 on Climb checks, retain Agility to Defense | — |
| **Distract** | Intellect 1 or Charisma 1 | Standard Action (Bluff or Engineering vs. Will): target is Flat-Footed vs. allies for 1 round | — |
| **Double Jointed** | Agility 1 | +4 bonus on Acrobatics (Escapology) and checks involving flexibility/tight spaces | — |
| **Eidetic Memory** | Intellect 2 | +4 Memory checks and attempt Knowledge skills Untrained | — |
| **Photographic Memory** | Eidetic Memory, Intellect 4 | Perfect visual/textual recall; learning study time for new skills reduced by 50% | — |
| **Endurance** | Stamina 1 | +4 on checks vs. non-lethal exhaustion, starvation, thirst, marches; hold breath 2x | — |
| **Diehard** | Endurance | Automatically stabilize at 0 Health (Mortality State); may take partial actions while downed | — |
| **Fast Heal** | Stamina 2 | Double natural Vitality and Health recovery rate during rest | Ranked |
| **Regeneration** | Fast Heal, Stamina 4 | Recover 1 Health per hour automatically; regrow severed limbs/organs in 1d4 weeks | — |
| **Favored Enemy** | Alertness 1 | +2 Strike, Damage, Bluff, Insight, and Survival against chosen creature type | Ranked, Multiple |
| **Fearless** | Willpower 3+ | Immune to Fear effects (mundane, psionic, or magical) | — |
| **Jack-of-all-trades** | Intellect 2 | Attempt any Skill check Untrained (even Trained-Only skills) | — |
| **Lightning Calculator** | Intellect 1 | Perform complex mathematical calculations at 2x speed | — |
| **Mental Alacrity** | Lightning Calculator, Trance, Intellect 2 | Gain 1 additional Mental Action per round when taking no Physical actions | — |
| **Multiplexing** | Mental Alacrity, Intellect 3 | +1 additional Mental Action per round added to Mental Alacrity | Ranked (Intellect) |
| **Master Plan** | Logic (Reason) 6, Intellect 3 | Prepare 1 hour (Logic check vs. CR 10): each point over CR 10 enters a shared ally Bonus Pool | — |
| **Nimble Moves** | Agility 2 | Ignore 10 feet of difficult terrain per round when moving | — |
| **Acrobatic Steps** | Agility 3, Nimble Moves | Ignore 30 feet of difficult terrain per round; move full speed on narrow surfaces | — |
| **Perfect Balance** | Agility 4, Acrobatic Steps | Ignore all difficult terrain; Immune to the Prone condition unless voluntary | — |
| **Tough** | Stamina 1 | Gain Damage Resistance (DR 5) against Non-Lethal and Stun damage | — |
| **Pain Tolerance** | Tough, Stamina 2 | Roll Stun Resistance Checks with Advantage; ignore wound/fatigue check penalties | — |
| **Runner** | Strength 1, Agility 1, Stamina 1 | Run at 5x base speed, Sprint at 7x base speed; +2 Athletics for running endurance | — |
| **Trance** | Wisdom 1 | Slow metabolism (1/10th oxygen/food) and feign clinical death (Medicine CR 20) | — |
| **Swimmer** | Athletics 1 | Gain Swim Speed (1/2 base), Take 10 on Swim in stormy water, hold breath 3x STA rounds | — |
| **Tracker** | Wisdom 1 | Follow tracks using Survival or Alertness at full movement speed without penalty | — |
| **Well Informed** | None | Free immediate Gather Information check upon entering a new settlement or region | — |
| **Quick** | Agility 1 | +10 feet to Base Movement Speed and +1 to Initiative | — |
| **Quicker** | Quick, Agility 2 | +20 feet (total) to Base Movement Speed and +2 to Initiative | — |
| **Quickest** | Quicker, Agility 3 | +30 feet (total) to Base Movement Speed and +3 to Initiative | — |
| **Zero G Training** | Agility 1 | No Disadvantage in Zero-G operations; +2 Acrobatics in microgravity | — |
| **Absolute Pitch** | Alertness 1, Expression 1 | +4 bonus on auditory matching, vocal mimicry, and acoustic security bypass | Superhuman Mutation |
| **Algorithmic Cognition** | Lightning Calculator, Intellect 4 | Math/cryptanalysis as Free Action; Advantage on Logic (Reason) math/code checks | Superhuman Mutation |
| **Dual-Hemispheric Processing** | Intellect 3, Special (Congenital) | Read/scan at 10x speed; perform two mental tasks simultaneously without penalty | Superhuman Mutation |
| **Echolocation** | Alertness 3, Blindness Flaw | Gain Blindsight 60 ft via clicks; ignore darkness/invisibility and Flanking in 60 ft | Superhuman Mutation |
| **Eidetic Constructor** | Eidetic Memory, Alertness 2 | Observe 1 round to memorize structure; +4 Navigation, Architect, and Tactics in area | Superhuman Mutation |
| **Extreme Endurance** | Stamina 3 | +4 Stamina/Fortitude for breath/suffocation/aerobic exertion; no Fatigue speed loss | Superhuman Mutation |
| **Hyperthymesia** | Eidetic Memory, Wisdom 2 | Auto-succeed personal memory recall; Immune to Memory Edit and gaslighting | Superhuman Mutation |
| **Hypoxia Tolerance** | Stamina 1 | Ignore thin-atmosphere/high-altitude penalties; require 50% less oxygen | Superhuman Mutation |
| **Lactate Immunity** | Endurance, Stamina 4 | Immune to aerobic fatigue from running/swimming; run continuously if fueled | Superhuman Mutation |
| **Myostatin Hypertrophy** | Strength 3, Stamina 2 | +2 Might and Athletics; treated as 1 Size Category larger for grapple/lifting/breaking | Superhuman Mutation |
| **Nociceptor Dampening** | Pain Tolerance, Stamina 2 | Immune to non-lethal Stun/pain torture; requires Alertness check to notice burn/hazard | Superhuman Mutation |
| **Short Sleeper** | Stamina 1 | Full Rest in 4 hours; Advantage on saves vs. magical or chemical sleep | Superhuman Mutation |
| **Synesthetic Savant** | Intellect 2 | Advantage on Memory, Knowledge retrieval, and cryptography; +2 vs. visual illusions | Superhuman Mutation |
| **Tetrachromacy** | Alertness 2, Special | +4 visual Alertness, Investigation, and Survival tracking; spot metameric camouflage | Superhuman Mutation |
| **Unbreakable Skeleton** | Tough, Stamina 3 | DR 5 vs. Bludgeoning/Crushing/Falling; immune to bone fracture (*Cripple*); +1 Unarmed dmg | Superhuman Mutation |

### **6. Master Karma Features Table (10 Features)**

| **FEATURE NAME** | **PREREQUISITE** | **BENEFIT / EFFECT** | **SPECIAL / NOTES** |
| :--- | :--- | :--- | :--- |
| **Beginner's Luck** | Target Skill Rank < 6 | Spend 1 KP to gain +5 Temporary Skill Ranks in a Novice/Untrained skill for the scene | — |
| **Believer** | Wisdom 1 | Call upon Faith to reroll 1 failed Skill Check per day (0 KP cost) | Ranked (Wisdom) |
| **Devout** | Believer, Charisma 1 | Call upon Faith to reroll 1 failed Ability Check per day (0 KP cost) | Ranked (Charisma) |
| **True Faith** | Believer, Devout | Double numeric effects from Karma Points spent on behalf of your Faith/ethos | — |
| **Charmed** | Max Karma Pool 4+ | Reroll 1 Fumble (Natural 2 / double-1s on `2d10`) per day without spending a Karma Point | — |
| **Inspiration** | Charisma 2 | Spend Karma Points to grant a Karma Benefit to an ally (Cost: 1 KP transfer + effect cost) | — |
| **Karmic Blessing** | None | +2 to Maximum Karma Pool (cannot exceed sum of Ability Scores) | Multiple |
| **Seize Initiative** | None | Spend 1 KP before Initiative roll to automatically act first in combat | — |
| **Surge** | None | Spend 1 KP on your turn to gain 1 additional Standard Action in the round | — |
| **Ultimate Effort** | None (Chosen Trait) | Spend 1 KP to treat a non-combat check with chosen trait as a Natural 20 (`20 + Modifiers`) | Multiple |

### **7. Master Skill Features Table (49 Features)**

| **FEATURE NAME** | **PREREQUISITE** | **BENEFIT / EFFECT** | **SPECIAL / NOTES** |
| :--- | :--- | :--- | :--- |
| **Aeronaut** | Piloting (Unpowered) 1 | Make Unpowered Piloting checks with Advantage (`2d10 + 1d10` keep highest 2) | — |
| **Animal Affinity** | None | +2 Survival and Vocation (Handler) checks to handle, ride, or tame animals | — |
| **Artificer** | Attune 11, Discipline 11, Craft 11 | Metacrafting and Prototyping checks made with Advantage | — |
| **Artistic** | None | +2 bonus to 2 chosen Expression (Performance) or Vocation (Art/Craft) skills | — |
| **Attractive** | Charisma 2 | +2 bonus to Social checks where physical appeal is a factor | Ranked (Charisma) |
| **Biotechnologist** | Science/Nature/Medicine 11 | Biotechnology Prototyping and Grafting checks made with Advantage | — |
| **Computer Specialist** | Computers 1 | +2 bonus to all Computers tasks (Hacking, Programming, Operation) | — |
| **Digital Expert** | Computer Specialist | Perform all Computers tasks in 1/2 the typical time | — |
| **Coding Master** | Computer Specialist | Perform all Computers tasks with Advantage (`2d10 + 1d10` keep highest 2) | — |
| **Deceitful** | None | +2 bonus to Manipulation Skills (Bluff, Disguise) and +1 to Etiquette checks | — |
| **Educated** | Academics 5, Knowledge 5 | +2 bonus to Academics and +1 to all Knowledge Skills | — |
| **Entertaining** | Charisma 1 | +1 bonus to any Expression (Performance) check | Ranked (Charisma) |
| **Gearhead** | Vocation (Engineer/Mechanic) 1 | +2 bonus to all mechanical Knowledge (Technology), Operation, and Repair checks | — |
| **Gifted Pilot** | Piloting 6 | +2 Piloting checks and +10% to Maximum Vehicle Speed | — |
| **Crack Pilot** | Gifted Pilot, Piloting 11 | +4 Piloting checks and +20% to Maximum Vehicle Speed | — |
| **Ace Pilot** | Crack Pilot, Piloting 16 | +6 Piloting checks and +30% to Maximum Vehicle Speed | — |
| **Graceful** | None | +1 to all Agility-based non-attack skill checks and +1 to Reflex checks | — |
| **Headstrong** | None | +2 to Bluff and Intimidate checks and +1 to Will checks | — |
| **Influence** | Charisma 2 | +4 to Reputation and Favor checks (Diplomacy) | — |
| **Investigator** | None | +2 to Knowledge (Investigation) and Gather Information (Streetwise/Diplomacy) checks | — |
| **Linguist** | Knowledge (Language) 1 | +2 to Knowledge (Language) checks; may Take 10 on Language checks under stress | — |
| **Logical** | None | +2 to Logic (Reason) checks; may Take 10 on Logic checks under stress | — |
| **Magical Aptitude** | None | +2 to Attune checks and +1 to Knowledge (Metaphysics) checks | — |
| **Master Craftsman** | Vocation (Craft) 6 | +2 to Crafting checks and +2 to Mastercrafting CR limit | — |
| **Medic** | Knowledge (Medicine) 1 | +2 to Knowledge (Medicine) checks; First Aid is a Standard Action | — |
| **Meticulous** | None | Meticulous skill time bonuses increase by +1 per stage (+3/+6/+9) | — |
| **Naturalist** | None | +2 to Knowledge (Nature) and Knowledge (Survival) checks | — |
| **Nimble Fingers** | None | +2 to Expression (Legerdemain) and Knowledge (Technology — Security) checks | — |
| **Persuasive** | None | +2 to Diplomacy and Intimidate checks | — |
| **Perceptive** | None | +2 to Alertness (Perception) checks and +1 to Insight checks | — |
| **Researcher** | None | +2 to Academics and Academics (Archivist / Research) checks | — |
| **Scholar** | None | +2 bonus to all Knowledge Skills | — |
| **Self Sufficient** | None | +2 to Knowledge (Survival) checks and +1 to Fortitude checks | — |
| **Silver Tongue** | Charisma 1, Diplomacy 1 | Shift NPC attitude by one additional step on successful Diplomacy checks | — |
| **Golden Smile** | Silver Tongue, Charisma 2, Dip/Bluff 6 | Take 10 or roll `2d10` with Advantage (or +1d10) on Bluff and Diplomacy checks | — |
| **Platinum Personality** | Golden Smile, Charisma 4, Dip/Bluff 11 | Make all Bluff and Diplomacy checks with Advantage (`2d10 + 1d10` keep highest 2) | — |
| **Skill Focus** | Chosen Skill 1 | +2 bonus to chosen skill; may be purchased once per Skill Stage | Ranked / Multiple |
| **Skill Mastery** | Skill Focus (2), Rank 11+ | May Take 10 with all Focused skills at Rank 11+ even under stress/combat | — |
| **Skill Specialization** | Chosen Skill 6 | Unlock specialized sub-path adding up to +10 Specialization Ranks to base skill | Multiple |
| **Social** | None | +1 to all Charisma Skills and +1 to Etiquette checks | — |
| **Spacer** | None | +2 to all Starship Operation and Space Survival checks | — |
| **Steady** | None | +2 to Acrobatics and Athletics checks and +1 to Reflex checks | — |
| **Stealthy** | Agility 2 | +2 to Acrobatics (Escapology) and Legerdemain checks, and +4 to Stealth checks | — |
| **Stout** | None | +1 to all Stamina checks, Stamina-based skills, Might checks, and Fortitude checks | — |
| **Trustworthy** | None | +2 to Manipulation Skills (Bluff/Diplomacy) and +1 to Knowledge (Culture) checks | — |
| **Veiled Threat** | Intimidate 6 | Target does not become Hostile after Intimidation; bystanders roll Insight vs. Intimidate | — |
| **Versatile Curator** | Knowledge 6, Intellect 2 | Gain Virtual Knowledge skills equal to Intellect score above 1 | — |
| **Versatile Performer** | Expression 6, Intellect 2 | Gain Virtual Expression (Performance) skills equal to Intellect score above 1 | — |
| **Versatile Professional** | Vocation 6, Intellect 2 | Gain Virtual Vocation skills equal to Intellect score above 1 | — |

### **8. Master Special Features Table (37 Features)**

| **FEATURE NAME** | **PREREQUISITE** | **BENEFIT / EFFECT** | **SPECIAL / NOTES** |
| :--- | :--- | :--- | :--- |
| **Acute Sense** | Alertness 1 | +2 to Alertness checks with one chosen sense (Vision, Hearing, Smell, Taste, Touch) | Multiple |
| **Analytical Sense** | Acute Sense, Intellect 2 | Gain detailed forensic/scientific data from chosen Acute Sense | — |
| **Uncanny Sense** | Acute Sense | Roll Alertness checks with chosen sense with Advantage (`2d10 + 1d10` keep highest 2) | — |
| **Augmented** | Tech Level 3+ | Compatible with Standard Augmentations; grants 6 CP of initial Augmentations | — |
| **Heavy Augmentations** | Augmented, Stamina 2 | Compatible with Heavy Augmentations; grants an additional 6 CP of Augmentations | — |
| **Extreme Augmentations** | Heavy Augmentations, Stamina 4 | Compatible with Full Body Conversion; grants an additional 6 CP of Augmentations | — |
| **Biotechnology** | Awakened or Tech Level 4+ | Imprint, operate, and manipulate Living Technology | — |
| **Bonded** | Charisma 2 | Tele-Empathic connection with another bonded individual across any distance | — |
| **Companion** | Charisma 1+ | Gain a loyal biological, synthetic, or tech Companion built on 40 CP | Ranked, Multiple |
| **Familiar** | Bonded, Companion, Awakened | Empathically linked Companion (+20 CP to Companion); know exact direction/distance | — |
| **Mind Link** | Familiar or Bonded | Telepathic link with Companion (+10 CP to Companion); share Knowledge skills/languages | — |
| **Shared Senses** | Familiar or Bonded | Perceive through Companion's senses as a Standard Action (+10 CP to Companion) | — |
| **Danger Sense** | Wisdom 1 | Roll Surprise Checks and trap-avoidance checks with Advantage; act in Surprise round | — |
| **Dwarfism** | Species Trait or Flaw | One Size Category smaller (+1 Defense, +1 Strike, +4 Stealth, -10 ft speed, reduced lift) | — |
| **Eldritch Heritage** | None (Background) | Gain a minor innate Bloodline Power (Sorcerer/Metaphysical ancestry) | — |
| **Energy Resistance** | None | Resistance 5 against one chosen Energy Type (Fire, Cold, Electric, Acid, Sonic) | Ranked (up to Immunity) |
| **Giant** | Species Trait | One Size Category larger (+2 Strength, increased Reach/lift, -1 Defense, -4 Stealth) | — |
| **Life Support** | None | Breathe and function in a non-native environment (Aquatic, Exotic Gas, Vacuum) | Multiple |
| **Low Light Vision** | None | See in dim light (starlight/moonlight) as clearly as bright daylight | — |
| **Darksight** | None | See in total darkness up to 60 feet (monochromatic / thermal spectrum) | — |
| **Natural Weapons** | None | Armed with Claws, Fangs, Horns, or Tail (1d4/1d6 Small/Medium, 1d8 Large Lethal Unarmed) | Ranked |
| **Non-Lethal Immunity** | None (or Synthetic/Construct) | Completely immune to Non-Lethal and Stun damage (`0` damage taken) | — |
| **Rage** | None | Free Action: +2 STR, +2 STA (+2 Base Toughness DR & +4 Fortitude), +2 Will, -2 Defense | Ranked |
| **Resistance** | Stamina 1 | +2 bonus on saves against Disease, Poison, Radiation, or Magic | Multiple |
| **Scent** | Wisdom 1 | Detect opponents within 30 feet by smell and track by scent using Knowledge (Survival) | — |
| **Self-Sustaining** | Synthetic, Plant, or Undead | Do not need to eat or drink; immune to starvation and dehydration | — |
| **Sleepless** | Synthetic, Elf, or Special | Do not need to sleep; immune to magical sleep effects (light activity for Full Rest) | — |
| **Sense** | Awakened or Species Trait | Detect chosen aura (Evil, Magic, Life, Tech, Heat) in 20 ft Radius or 40 ft Cone | Multiple |
| **Sense, Uncontrolled** | Special | Always-on Sense in 30 ft Radius or 60 ft Cone; subject to sensory overload penalties | Multiple |
| **Sneak Attack** | Agility 2, Stealth 1 | Deal +Intellect Modifier + 1d6 extra damage against Flat-Footed or Flanked targets | Ranked (+1d6/rank) |
| **Bleed** | Sneak Attack | Sneak Attacks inflict 1 point of ongoing Bleed damage per Sneak Attack die | — |
| **Blind** | Sneak Attack | Trade Sneak Attack dice to inflict the Blinded condition for 1d4 rounds | — |
| **Cripple** | Sneak Attack | Trade Sneak Attack dice to force weapon drop or disable target limb/manipulator | — |
| **Hobble** | Sneak Attack | Sneak Attack reduces target Movement Speed by 50% (immobilizes on 2nd hit) | — |
| **Technologist** | Intellect 3, Knowledge (Tech) 11 | Treat personal Tech Level as +1 higher in a chosen field (5+ fields advances full TL) | Multiple (17 Fields) |
| **Telepathy** | Awakened (Mental) or Species Trait | Mental communication with any intelligent lifeform within 100 ft+ range | — |
| **Wild Speech** | Nature Affinity / Fey / Special | Communicate with Beast-type animals as if sharing a language | — |

---

## Part II — Complete Unabridged Profiles & Rules Entries

### **Overview & Feature Acquisition Rules**

**Features (also called Feats) offer a powerful way to customize your character and make them stand out. Think of Features as special abilities or training that go beyond your character's basic attributes (like Strength or Intellect) and skills (like Stealth or Medicine). They represent the unique qualities that make your character who they are, whether it's an innate talent, a learned technique, or a modification gained through technology or magic.**

#### **Cost (`3 CP` Standard / `2 CP` Recommended)**

Features are special abilities or training that cost **3 Character Points (CP)** each (**Standard Feature = 3 CP**). However, if you choose a **Recommended Feature** from the list recommended for your character's species, faction, origin, or occupation, the cost is reduced by **1 CP** (**Recommended Feature = 2 CP**). Keep in mind that even with discounts, Features cannot cost less than **1 CP**. You must decide how to spend your CP to acquire the Features most important to your character's concept. *(Note: During foundational Background creation, characters also receive 4 baseline Background Features at 0 CP).*

#### **Advanced Features**

As your character grows and develops, you might unlock access to more advanced Features. These often have prerequisites, meaning you'll need to meet certain requirements before you can take them. This could involve having a specific skill rank, possessing another Feature, or fulfilling a particular condition set by the game's rules.

#### **Recommended Features**

To help you choose Features that fit your character's concept, the game provides lists of **Recommended Features** for different species, factions, origins, and occupations. If you choose a Recommended Feature, its cost is reduced by **1 CP** (from `3 CP` to `2 CP`), making it a more affordable option. However, even with this discount, the minimum cost for any Feature is always **1 CP**.

#### **Examples of Features**

* **Lightning Reflexes:** Your character reacts faster than most, granting them a `+2` bonus to Reflex saving throws (Ranked by Agility).
* **Tough:** Your character is more resilient, gaining Damage Resistance (`DR 5`) against non-lethal and stun trauma.
* **Weapon Specialization:** Your character is particularly skilled with a specific type of weapon, gaining `+1d` bonus damage dice with that weapon (following `Weapon Focus` for `+1 Strike`).
* **Low Light Vision / Darksight:** Your character can see in dim light or total darkness, giving them a decisive advantage in low-light conditions.

These are just a few examples of the many Features available in Tangent. By carefully selecting Features that complement your character's abilities and skills, you can create a truly unique and memorable hero for your adventures.

### **Feature Classification Tags**

* ***Ranked:*** *Features are available for multiple purchases with effects stacking (limited by the governing Ability Score or the associated Skill Stage: `1` at Novice [`1+`], `2` at Trained [`6+`], `3` at Expert [`11+`], `4` at Master [`16+`], and `5` at Pinnacle [`20+`]).*
* ***Multiple:*** *Features have different options and can be taken separately for a different effect, skill, weapon, or ability.*
* ***Special:*** *Features are dependent on Storyline, Species, or Technology Level and require the Architect's approval.*

---

### **Features Directory Index**

Detailed feature rules, prerequisites, and mechanical descriptions are organized by category in the `./features/` sub-directory:

* **[Ability Features](./features/1.08.AbilityFeatures.md)** — *Enhancements to base attributes, saving throws, Evasiveness, and Tolerance (16 Features)*
* **[Combat Features (Part I: A – S)](./features/1.08.CombatFeatures.md)** & **[Combat Features (Part II: D – W)](./features/1.08.CombatFeatures.D_W.md)** — *Tactical maneuvers, weapon mastery, two-weapon fighting, Precision Strike chain, and defensive techniques (45 Features)*
* **[Discipline Features](./features/1.08.DisciplineFeatures.md)** — *Awakening, centering, metaphysical empowerment, focus mastery, and Tech Interface (16 Features)*
* **[General Features (Part I: A – M)](./features/1.08.GeneralFeatures.md)** & **[General Features (Part II: N – Z & Superhuman Mutations)](./features/1.08.GeneralFeatures.N_Z.md)** — *Social benefits, physical conditioning, cognitive traits, and 15 rare genetic/neurological mutations (58 Features)*
* **[Karma Features](./features/1.08.KarmaFeatures.md)** — *Luck manipulation, faith-based blessings, initiative seizing, and heroic surges (10 Features)*
* **[Skill Features (Part I: A – M)](./features/1.08.SkillFeatures.md)** & **[Skill Features (Part II: M – Z)](./features/1.08.SkillFeatures.M_Z.md)** — *Vocational aptitudes, specialized training, piloting mastery, and multi-skill bonuses (49 Features)*
* **[Special Features](./features/1.08.SpecialFeatures.md)** — *Sensory enhancements, cybernetic/biotech augmentations, companions/familiars, size traits, and sneak attack modifications (37 Features)*

---

## Part III — Discrepancy & Restoration Ledger

* **DISC-315A (Master Feature Tables & Prerequisite Rank Restoration):** Restored 100% of the prerequisite rank numbers (`Stamina 1`, `Agility 2`, `Combat Skill 6`, `Skill Rank < 6`, `Karma 4`, `Pilot 6/11/16`, etc.) across all 7 Master Feature Tables that had been stripped during prior footnote cleanup, while keeping all legacy footnote digits (`22`–`213`) removed.
* **DISC-315B (Mechanical Authority & Terminology Normalization):** Replaced `Suggested Features` / `Recommended Features` with `Recommended Features` (`3 CP` Standard / `2 CP` Recommended), replaced `Vital Strike` with the feature-gated `Precision Strike` chain (`2x`/`3x`/`4x` base weapon damage dice), normalized `Defensive Combat Training` (`+4 Defense vs. Combat Maneuvers`), integrated all 15 Superhuman Mutations, and normalized `BP -> CP`, `DC -> CR`, `AC -> Defense`, and `d20 -> 2d10`.

