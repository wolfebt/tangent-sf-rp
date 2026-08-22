export const combatArticles = [
  {
    id: "3-01-combat-action-economy",
    name: "3.01 Combat Action Economy & Skill Tier Progression",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 1,
    description: # 3.01 Combat Action Economy & Skill Tier Progression

Combat in Tangent is fast-paced and tactical. The number of actions a character can perform in a single 6-second round is governed by their **Skill Tier** in the relevant combat discipline.

---

## Action Unlocks by Skill Tier

| Rank Range | Title / Benchmark | Actions per Round | Focus Strike Bonus | Cumulative Penalty |
| :--- | :--- | :--- | :---: | :--- |
| **0** | Untrained | Full Round Action (1 basic move/attack) | — | Base score |
| **1 – 5** | Novice / Studied | **1st Action** | **+2** | Base score |
| **6 – 10** | Trained / Professional | **2nd Action** | **+3** | 2nd attack at base **-5** |
| **11 – 15** | Expert | **3rd Action** | **+4** | 3rd attack at base **-10** |
| **16 – 20** | Master | **4th Action** | **+5** | 4th attack at base **-15** |
| **21 – 25** | Grand Master | **5th Action** | **+6** | 5th attack at base **-20** |
| **26 – 30** | Pinnacle | **6th Action** | **+7** | 6th attack at base **-25** |

---

## Multiple Active Defenses

Characters may execute multiple active defense reactions (Dodge, Parry, Kinetic Block) in response to incoming attacks within a single round. Each consecutive defense roll after the first suffers a cumulative **-5 penalty** (1st defense: base; 2nd defense: -5; 3rd defense: -10; 4th defense: -15).,
    mechanic: ActionCount = floor((SkillRank - 1) / 5) + 1 (for Rank >= 1)
ActionPenalty = (ActionIndex - 1) * -5
ActiveDefensePenalty = (DefenseCount - 1) * -5,
    guide: Declare all actions at the start of your turn. Apply the cumulative -5 modifier to subsequent attacks.,
    note: Focus bonus is added to all strike rolls made with the dedicated weapon category.
  },
  {
    id: "3-02-initiative-turn-sequence",
    name: "3.02 Initiative & Turn Sequence",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 2,
    description: # 3.02 Initiative & Turn Sequence

At the onset of combat, all combatants roll for **Initiative** to establish the chronological turn order.

---

## The Initiative Formula

\\text{Initiative Roll} = d20 + \\text{Reflex Save} + \\text{Agility Modifier} + \\text{Situational Modifiers}

- **High Roll Goes First:** Combatants act in descending order of initiative totals.
- **Ties:** Broken first by higher Agility score, then by higher Alertness skill rank.

---

## Ambushes & Surprise Rounds

- If an attacking group successfully ambushes unaware targets (via Stealth vs. Alertness check):
  - The attackers gain a **Surprise Round**, during which they may take a full turn of actions.
  - Unaware targets cannot take active defense actions during the surprise round and are treated as having an **Unopposed Defense DC (Base 15)**.,
    mechanic: Initiative = d20 + ReflexMod + AgilityMod + SensoryAugmentBonus
Surprise = Defender Flatfooted (Defense = 15 modified by size/cover),
    guide: Roll initiative once at the beginning of an encounter. Turn order remains fixed until combat concludes.,
    note: Characters with the 'Lightning Reflexes' feature add +2 to all initiative rolls.
  },
  {
    id: "3-03-attack-defense-resolution",
    name: "3.03 Attack & Defense Resolution (Opposed & Unopposed)",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 3,
    description: # 3.03 Attack & Defense Resolution (Opposed & Unopposed)

Combat interactions are categorized into two core resolutions:

---

## 1. Opposed Resolution (Active Defense)

When targeting an active, aware opponent:
- **Attacker Rolls:**  + \\text{Weapon Skill Rank} + \\text{Attribute Mod} + \\text{Weapon Accuracy} + \\text{Focus Bonus}$
- **Defender Rolls:**  + \\text{Defense Skill Rank} + \\text{Agility Mod} + \\text{Shield/Dodge Mod}$
- **Outcome:**
  - Attacker > Defender: **Hit / Strike Success**.
  - Defender $\\ge$ Attacker: **Miss / Evaded**. *(Defender wins all ties)*.

---

## 2. Unopposed Resolution (Stationary / Surprised Target)

When targeting an inanimate object, a disabled vehicle, or a surprised foe:
- Attacker rolls vs. a static **Base DC 15 (Average Medium Target at Short Range)**.
- Modified by Target Size, Range Brackets, and Movement penalties.,
    mechanic: Opposed: AttackCheck vs DefenseCheck (Defender wins tie)
Unopposed: AttackCheck vs (15 + SizeMod + RangeMod + MoveMod),
    guide: Declare your target, roll attack check, and compare against opposed defense roll or target DC.,
    note: Point blank shots against unopposed targets deal Advantage damage automatically.
  },
  {
    id: "3-04-size-range-modifiers-matrix",
    name: "3.04 Size & Range Modifiers Matrix",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 4,
    description: # 3.04 Size & Range Modifiers Matrix

Target scale and physical distance substantially modify attack rolls and un-opposed target DCs.

---

## Target Size Modifiers Matrix

| Size Category | Scale Example | Attack / DC Modifier | Melee Reach |
| :--- | :--- | :---: | :---: |
| **Miniscule** | Micro-drone, cyber-insect | **-32** | 0 ft |
| **Fine** | Small rodent, tracking beacon | **-16** | 0.5 ft |
| **Diminutive** | Cat, sidearm drone | **-8** | 1 ft |
| **Tiny** | Small pet, recon turret | **-4** | 2 ft |
| **Small** | Halfling, combat dog, goblin | **-2** | 5 ft |
| **Medium (Standard)**| Human, Elf, Cyber-Trooper | **0** | **5 ft** |
| **Large** | War horse, light speeder, ogre | **+2** | 10 ft |
| **Huge** | Heavy combat mecha, APC | **+4** | 15 ft |
| **Gargantuan** | Dropship, titan walker | **+8** | 20 ft |
| **Colossal** | Star cruiser, orbital station | **+16** | 30+ ft |

---

## Range Brackets Matrix

| Range Category | Distance Modifier | Effective Range Bracket | Special Combat Rule |
| :--- | :---: | :--- | :--- |
| **Point Blank** | **+5 (DC 10)** | Within Melee Reach (5 ft) | **Roll Damage with Advantage** |
| **Short** | **0 (DC 15)** | Listed Base Range | Standard strike |
| **Medium** | **-5 (DC 20)** | Up to \\times$ Base Range | Long-range aim required |
| **Long** | **-10 (DC 25)**| Up to \\times$ Base Range | Severe trajectory drop |
| **Extreme** | **-15 (DC 30)**| Up to \\times$ Base Range | Requires sniper optics |,
    mechanic: EffectiveDC = 15 + SizeModifier + RangeModifier
PointBlankDamage = max(DamageRoll1, DamageRoll2) + Bonus,
    guide: Check weapon base range and target size to determine applicable modifiers to your attack roll.,
    note: Point blank shots with long rifles in melee reach provoke attacks of opportunity unless the user has Point Blank Mastery.
  },
  {
    id: "3-05-movement-target-modifiers",
    name: "3.05 Movement & Target Situational Modifiers",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 5,
    description: # 3.05 Movement & Target Situational Modifiers

Physical motion and battlefield positioning dynamically affect targeting accuracy and defensive evasion.

---

## Movement Modifiers Matrix

| Movement Context | Scenario / Rule | Defender Bonus | Attacker Penalty | Tactical Notes |
| :--- | :--- | :---: | :---: | :--- |
| **Moving Targets** | Target Running | — | **-2 Attack** | Target is sprinting across terrain |
| | Distance Moved (20+ ft) | **+2 Defense** | — | Evasive zig-zag movement |
| | Distance Moved (40+ ft) | **+4 Defense** | — | High-speed dash |
| | Total Defense / Full Dodge | **+4 Defense** | — | Dedicates entire turn to evasion |
| | Opportunity Attacks | Provokes AoO | Free Attack | Moving out of melee reach |
| **Moving Attackers** | Ranged Shot while Running | — | **-2 Attack** | Fire on the move |
| | Mounted / Vehicle (Double Move)| — | **-4 Attack** | Firing from moving platform |
| | Mounted / Vehicle (Quad Speed) | — | **-8 Attack** | Firing from high-speed pursuit |,
    mechanic: TargetMoveBonus = (MovedFeet >= 40) ? 4 : ((MovedFeet >= 20) ? 2 : 0)
RunningShooterPenalty = -2,
    guide: Keep track of your movement distance each round to apply the +2 or +4 defense bonus.,
    note: The Total Defense action prevents all offensive actions for that turn.
  },
  {
    id: "3-06-cover-concealment-modifiers",
    name: "3.06 Cover, Concealment & Environmental Modifiers",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 6,
    description: # 3.06 Cover, Concealment & Environmental Modifiers

Cover physically stops incoming kinetic and energy projectiles, while concealment obscures the target's visual profile.

---

## Cover & Concealment Rules

| Protection Type | Environmental Example | Defense / DC Bonus | Special Effect |
| :--- | :--- | :---: | :--- |
| **Light Cover (1/4)** | Low barricade, tree trunk | **+2 Defense** | Protects legs and lower torso |
| **Medium Cover (1/2)** | Sandbags, steel barrier, vehicle hull | **+4 Defense** | Protects 50% of body profile |
| **Heavy Cover (3/4)** | Bunker slit, fortified firing port | **+6 Defense** | Protects 75% of body; grant Fortitude bonus |
| **Full / Total Cover** | Solid reinforced blast door | **Cannot Target** | Requires indirect or penetrative fire |
| **Light Concealment** | Light fog, haze, dim lighting | **-2 to Attacker** | Obscures fine detail |
| **Heavy Concealment** | Dense smoke, total darkness, active camo | **-4 to Attacker** | Attacker must guess grid square without thermal optics |,
    mechanic: CoverBonus = +2 (Light), +4 (Medium), +6 (Heavy)
ConcealmentPenalty = -2 (Light), -4 (Heavy),
    guide: Position your character behind barriers at the end of movement to gain defensive cover bonuses.,
    note: Weapons with high Armor Piercing (AP) ratings can shoot directly through light and medium cover.
  },
  {
    id: "3-07-armor-dr-damage-calculation",
    name: "3.07 Armor DR, AP Rating & Damage Calculation",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 7,
    description: # 3.07 Armor DR, AP Rating & Damage Calculation

Damage in Tangent is resolved through a realistic **Damage Reduction (DR)** and **Armor Piercing (AP)** penetration model.

---

## The Damage Resolution Formula

\\text{Effective Armor DR} = \\max(0, \\text{Target Armor DR} - \\text{Weapon AP Rating})

\\text{Hit Points Lost} = \\max(1, \\text{Incoming Damage} - \\text{Effective Armor DR})

---

## Armor & Damage Interactions

- **Damage Reduction (DR):** The static number of damage points absorbed by physical armor, energy shields, or natural carapace.
- **Armor Piercing (AP):** The rating of the ammunition or energy beam that bypasses an equivalent amount of target Armor DR.
- **Minimum Damage Rule:** A successful hit that penetrates or glances always inflicts at least **1 point of damage**, representing kinetic concussive transfer.

---

## Example Calculation
- A heavy battle rifle fires an AP-4 slug dealing **16 Kinetic Damage**.
- The target wears Combat Plate with **DR 10**.
- **Effective DR:**  - 4 = 6$.
- **Final HP Lost:**  - 6 = 10 \\text{ HP}$.,
    mechanic: EffectiveDR = max(0, ArmorDR - WeaponAP)
DamageTaken = max(1, RawDamage - EffectiveDR),
    guide: Subtract weapon AP from target Armor DR before subtracting the result from total rolled damage.,
    note: Energy shields absorb energy damage before physical armor DR applies.
  },
  {
    id: "3-08-damage-types-energy-resistances",
    name: "3.08 Damage Types & Energy Resistances",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 8,
    description: # 3.08 Damage Types & Energy Resistances

Weapons and metaphysical invocations channel distinct energy signatures and physical vectors.

---

## Master Damage Types Directory

| Damage Type | Visual & Physical Vector | Secondary Status Effect | Common Defense / Counter |
| :--- | :--- | :--- | :--- |
| **Kinetic / Ballistic** | High-velocity slugs, blades, shrapnel | Knockdown, limb trauma | Ballistic weave, composite plates |
| **Thermal / Plasma** | Superheated gas, laser beams, fire | **Burning** (continuous damage) | Ablative ceramics, heat sinks |
| **Cryo / Cold** | Liquid nitrogen, endothermic rays | **Slowed / Frozen** (movement halved) | Thermal insulated suits |
| **Electrical / EMP** | Arc lightning, ion pulse, taser charge | **Stunned / System Glitch** | Faraday mesh, grounded insulation |
| **Acid / Corrosion** | Molecular dissolvers, toxic bile | **Armor Degradation** (reduces DR) | Hazmat plating, Teflon coating |
| **Sonic / Concussive** | Harmonic shockwaves, sonic cannons | **Deafened / Disoriented** | Acoustic dampeners, heavy mass |
| **Radiation / Bio** | Gamma rays, mutagenic pathogens | **Sickness / Cellular Decay** | Lead shielding, rad-purgatives |
| **Meta / Psionic** | Pure astral will, reality distortion | **Bypasses physical Armor DR** | Metaphysic Ward, Iron Will |,
    mechanic: Burning: Deals 1d6 thermal damage per round until extinguished
EMP: Disables electronic gear and cybernetics for 1d4 rounds on failed Fortitude save,
    guide: Match damage types to target vulnerabilities (e.g. EMP against cyborgs, Plasma against beasts).,
    note: Metaphysic damage completely ignores physical armor DR unless target possesses an active energy ward.
  },
  {
    id: "3-09-health-vitality-mortality-trauma",
    name: "3.09 Health, Vitality, Mortality & Trauma (0 HP Rules)",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 9,
    description: # 3.09 Health, Vitality, Mortality & Trauma (0 HP Rules)

When a character's Hit Points drop to zero, they enter the critical **Mortality State**.

---

## The Mortality State (0 Hit Points)

When reduced to **0 HP**:
1. The character immediately falls **Unconscious** and **Prone**.
2. The character begins **Bleeding Out**.
3. At the start of each of their turns, the character must roll a **Fortitude Saving Throw (DC 15)**:
   - **Success:** The character stabilizes. Bleeding stops, but they remain unconscious at 0 HP.
   - **Failure:** The character suffers 1 point of permanent mortality trauma. After 3 failed saves, the character **Perishes**.
   - **Critical Success (Natural 20):** The character regains consciousness with 1 HP.

---

## Massive Damage & Instant Death

If a single attack reduces a character to 0 HP and the leftover damage meets or exceeds their **Maximum HP total**, the character suffers catastrophic trauma and dies instantly.

---

## Medical Stabilization

An ally within reach may use a **Medicine Skill Check (DC 15)** or apply a trauma stim-pack to immediately stabilize a dying comrade.,
    mechanic: DeathSaves: DC 15 Fortitude (3 Failures = Death, 3 Successes = Stabilized, Nat 20 = Revive 1 HP)
MassiveDamageDeath: LeftoverDamage >= MaxHP,
    guide: When at 0 HP, roll DC 15 Fortitude save at the start of each turn. Allies should apply first aid immediately.,
    note: Spending 1 Karma Point immediately stabilizes a dying character and restores 1 HP.
  },
  {
    id: "3-10-hit-locations-called-shots-matrix",
    name: "3.10 Hit Locations & Called Shots Matrix",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 10,
    description: # 3.10 Hit Locations & Called Shots Matrix

Combatants can attempt precise **Called Shots** against specific anatomy, optic clusters, or power cores.

---

## Called Shots Targeting Matrix

| Targeted Location | Called Shot Penalty | Damage Multiplier | Critical Trauma Effect |
| :--- | :---: | :---: | :--- |
| **Head / Sensory Pod** | **-6 Attack** | **$\\times 2.0$** | **Blinded / Concussed / Instant KO** on critical |
| **Torso / Center Mass**| **0 (Standard)** | **$\\times 1.0$** | Standard damage |
| **Arms / Weapon Hand** | **-4 Attack** | **$\\times 0.75$** | **Disarm / Weapon Dropped / Broken Arm** |
| **Legs / Locomotion** | **-3 Attack** | **$\\times 0.75$** | **Movement Halved / Knocked Prone** |
| **Power Core / Fuel Tank**| **-8 Attack** | **$\\times 2.5$** | **Catastrophic Explosion / System Shutdown** |
| **Optic Sensors / Eye** | **-10 Attack** | **$\\times 2.0$** | **Permanent Sensory Loss / Total Blindness** |,
    mechanic: CalledShotPenalty: Applied directly to attack roll
DamageMult: Multiplies damage that bypasses Armor DR,
    guide: Declare your called shot target before rolling your attack die. Apply the penalty to the roll.,
    note: Snipers using optical scopes reduce Called Shot penalties by 2 to 4 points depending on scope quality.
  },
  {
    id: "3-11-combat-maneuvers-guide",
    name: "3.11 Combat Maneuvers Guide (7 Tactical Maneuvers)",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 11,
    description: # 3.11 Combat Maneuvers Guide (7 Tactical Maneuvers)

Tactical maneuvers allow combatants to control the battlefield, disarm adversaries, and protect allies without relying solely on raw weapon damage.

---

## The 7 Core Combat Maneuvers

### 1. Bull Rush (Knockback)
- **Check:** Opposed Might vs. Target Might/Fortitude.
- **Success:** Pushes the target back 5 feet (+5 feet per 5 points exceeding target check).

### 2. Disarm (Weapon Strip)
- **Check:** Opposed Melee Skill vs. Target Weapon Skill (-4 penalty if unarmed).
- **Success:** Knocks the target's weapon 10 feet away in a random direction.

### 3. Feint (Misdirection)
- **Check:** Deceit / Combat Skill vs. Target Alertness / Defense.
- **Success:** The target loses their active defense against your next attack in the same round.

### 4. Grapple (Pin & Restrain)
- **Check:** Opposed Might / Unarmed vs. Target Might / Acrobatics.
- **Success:** Target gains the **Restrained** condition and cannot move until escaping.

### 5. Overrun (Trample / Push Through)
- **Check:** Athletics / Might vs. Target Reflex / Acrobatics.
- **Success:** Move directly through an enemy's space and knock them **Prone**.

### 6. Sunder (Equipment Destruction)
- **Check:** Weapon Strike vs. Target Weapon/Shield Durability DC.
- **Success:** Deals damage directly to enemy weapon or armor DR.

### 7. Trip (Leg Sweep)
- **Check:** Melee Strike / Agility vs. Target Reflex / Acrobatics.
- **Success:** Target falls **Prone**. Attacks against prone targets gain +2 bonus.,
    mechanic: ManeuverCheck = Opposed roll (Defender wins ties unless attacker exceeds score),
    guide: Choose a maneuver as an action on your turn to manipulate enemy positioning.,
    note: Executing a maneuver without weapon proficiency provokes an Attack of Opportunity.
  },
  {
    id: "3-12-status-conditions-effects",
    name: "3.12 Status Conditions & Effects",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 12,
    description: # 3.12 Status Conditions & Effects

Conditions represent tactical impairments, sensory loss, and physical trauma suffered during encounters.

---

## Master Conditions Directory

- **Blinded:** Automatic failure on vision-based checks; attacks against the blinded target gain **Advantage**; blinded character attacks suffer **Disadvantage**.
- **Burning:** Suffers $ thermal damage at the start of each turn until spending an action to extinguish flames.
- **Deafened:** Automatic failure on sound-based checks; -2 penalty on Initiative rolls.
- **Immobilized / Restrained:** Speed is 0; suffers Disadvantage on Dexterity/Reflex saves; attacks against target gain Advantage.
- **Prone:** Character is on the ground; melee attacks against prone target gain **+2 Advantage**; ranged attacks from >20 ft suffer **-2 penalty**. Costs half movement speed to stand up.
- **Stunned:** Cannot take actions or reactions; drops held items; fails Reflex and Might checks automatically.
- **Suppressed:** Forced to remain behind cover; suffers -4 penalty on all attack rolls until suppression fire ceases.,
    mechanic: Prone: StandUp = 50% BaseMovement
Stunned: Actions = 0, Reactions = 0,
    guide: Track active conditions on character tokens and folios to apply correct situational modifiers.,
    note: Conditions expire at the end of their listed duration or upon passing a recovery saving throw.
  },
  {
    id: "3-13-ranged-burst-automatic-fire",
    name: "3.13 Ranged, Burst & Automatic Fire",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 13,
    description: # 3.13 Ranged, Burst & Automatic Fire

Modern ballistic and energy firearms feature selective firing modes with distinct tactical tradeoffs.

---

## Fire Modes & Ballistics Matrix

| Firing Mode | Ammo Expended | Attack Modifier | Damage / Area Effect |
| :--- | :---: | :---: | :--- |
| **Single Shot (Semi-Auto)**| 1 Round | Base Strike Score | Standard weapon damage |
| **3-Round Burst** | 3 Rounds | **+2 Strike** | Deals **+1d6 bonus damage** on hit |
| **Full Auto (Concentrated)**| 10 Rounds | **-2 Strike** | Deals **+2d6 bonus damage** and forces knockdown check |
| **Full Auto (Suppressive Cone)**| 20 Rounds | Targets 15-ft Cone | All targets in cone must roll Reflex save vs Attack DC or suffer damage |,
    mechanic: BurstFire: +2 Attack, +1d6 Damage
SuppressionFire: DC = 10 + ShooterSkillRank + AgilityMod,
    guide: Declare your weapon's firing mode before rolling your attack. Check your ammo counter.,
    note: Firing burst or full-auto without high Strength or a weapon bipod increases recoil penalties by -2.
  },
  {
    id: "3-14-scale-multipliers-vehicle-mecha",
    name: "3.14 Scale Multipliers & Vehicle/Mecha Combat",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 14,
    description: # 3.14 Scale Multipliers & Vehicle/Mecha Combat

When personnel-scale firearms interact with armored mecha or starships, **Scale Multipliers** ensure realistic armor protection and destructive force.

---

## Combat Scale Hierarchy

| Scale Tier | Typical Entity | Scale Multiplier vs Personnel | Damage Resistance Multiplier |
| :--- | :--- | :---: | :---: |
| **Personnel (1x)** | Humans, cyborgs, beasts, light drones | **$\\times 1$** | **$\\times 1$** |
| **Vehicle / Light Mecha (5x)**| APCs, gunships, combat walkers | **$\\times 5$** | **$\\times 5$** |
| **Heavy Mecha / Tank (10x)**| Battle tanks, siege titans | **$\\times 10$** | **$\\times 10$** |
| **Starship / Dropship (50x)**| Corvettes, frigates, shuttles | **$\\times 50$** | **$\\times 50$** |
| **Capital / Orbital (100x)**| Dreadnoughts, orbital battle stations| **$\\times 100$** | **$\\times 100$** |

---

## Scale Damage Calculation Rules
- When a personnel weapon strikes a **Vehicle-Scale (5x)** target: Personnel damage is divided by 5 before applying vehicle Armor DR.
- When a **Vehicle-Scale (5x)** weapon strikes a Personnel target: Damage is multiplied by 5, almost always resulting in instant vaporization.,
    mechanic: DamageToHigherScale = RawDamage / ScaleRatio
DamageToLowerScale = RawDamage * ScaleRatio,
    guide: Use heavy anti-armor ordnance (missiles, railguns) when engaging higher-scale military targets.,
    note: Energy shields protect against all scales equally up to their rated capacity.
  },
  {
    id: "3-15-vehicle-chases-dogfights",
    name: "3.15 Vehicle Chases & Dogfights",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 15,
    description: # 3.15 Vehicle Chases & Dogfights

High-speed vehicular pursuits and atmospheric dogfights are resolved through structured **Chase Rounds**.

---

## The Chase Track Mechanics

Chases occur on a relative **Chase Track (Distance Brackets 0 to 5)**:
- **Bracket 0 (Boarding Range):** Vehicles are touching or side-by-side.
- **Bracket 1 (Point Blank):** Close range (<50 meters).
- **Bracket 2 (Medium Range):** Standard pursuit distance (100–300 meters).
- **Bracket 3 (Long Range):** Trailing distance (500 meters).
- **Bracket 4 (Extreme Radar Range):** Visual contact slipping.
- **Bracket 5 (Escape):** The quarry successfully escapes into hyperspace or deep canyons.

---

## Round-by-Round Chase Checks
1. Both pilots roll an **Opposed Piloting Check** at the start of each round.
2. If the **Pursuer wins**: The distance bracket decreases by 1 (moving closer).
3. If the **Quarry wins**: The distance bracket increases by 1 (opening distance).
4. **Hazard Maneuvers:** Pilots can risk flying through narrow tunnels or debris fields to force a high-DC crash check on the pursuer.,
    mechanic: ChaseCheck = d20 + PilotingRank + AgilityMod + VehicleManeuverabilityRating,
    guide: Roll Piloting checks each chase round. Announce stunts (bootleg turns, evasive rolls) for bonus modifiers.,
    note: Passengers can fire personal weapons at vehicles within Brackets 0 and 1.
  },
  {
    id: "3-16-zero-g-vacuum-combat-rules",
    name: "3.16 Zero-G & Vacuum Combat Rules",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "3.00 COMBAT",
    order: 16,
    description: # 3.16 Zero-G & Vacuum Combat Rules

Fighting in the cold silence of outer space introduces recoil inertia, 3D vector movement, and explosive decompression hazards.

---

## Core Zero-G Rules

1. **Recoil Inertia (Newton's Third Law):** Firing a ballistic or heavy weapon without magnetic boot locks or micro-thruster anchors pushes the shooter backward 10 feet in the opposite direction.
2. **3D Tactical Movement:** Combatants can move in all three dimensions. Cover can be attacked from above or below.
3. **Suit Breaches:** Any penetrating kinetic or energy hit on a pressurized environment suit forces an immediate **Suit Seal Check (DC 15)**:
   - **Failure:** Rapid decompression; character suffers $ cold/hypoxia damage per round until patched.
4. **Silent Battlefield:** Sound does not propagate in vacuum. All verbal communication requires encrypted radio frequencies or laser-comms.,
    mechanic: ZeroGRecoilDrift = 10 ft backward on ballistic fire (unless anchored)
SuitBreachDC = 15 (Medicine or Technology check to patch),
    guide: Equip mag-boots or maneuvering thrusters before entering depressurized hull breaches.,
    note: Laser and energy weapons generate zero recoil drift in microgravity.
  }
];
