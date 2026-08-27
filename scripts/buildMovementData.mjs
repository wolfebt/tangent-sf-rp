import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const movementDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species_movement');
const rulesDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'rules');
const conditionsDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'conditions');
const featuresDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'features');
const compendiumDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'compendium');
const docsOperatorDir = path.join(projectRoot, 'docs', 'operator');
const dataDir = path.join(projectRoot, 'src', 'data');

[movementDir, rulesDir, conditionsDir, featuresDir, compendiumDir, docsOperatorDir, dataDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function writeFile(targetPath, content) {
  fs.writeFileSync(targetPath, content.trim() + '\n', 'utf8');
  console.log('Wrote:', path.relative(projectRoot, targetPath));
}

// ----------------------------------------------------
// 1. SPECIES_MOVEMENT DATASET (MARKDOWN ENTRIES)
// ----------------------------------------------------

// 1.1 Ground Movement
writeFile(path.join(movementDir, 'movement-ground.md'), `---
id: movement-ground
name: Ground Movement
category: species_movement
description: Ground movement in Tangent is based on a character's base walking speed (30 ft / 6 sec round for Medium biped humanoids).
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

# Ground Movement

**Category**: Movement Modes & Paces  
**Base Speed**: 30 ft per 6-second round (3.72 mph / 6 kph for Medium humanoid)  

## Overview
The character’s typical movement type (usually ground) and how fast they move is determined by species, modifiers such as features, traits, and other abilities can further alter speed as well as the terrain itself and any armor that may be worn.

## Ground Movement Paces

| Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Fatigue & Skill Check |
| :--- | :---: | :---: | :--- | :--- |
| **Walk** | **1x (Base)** | 30 ft / rd | Default pace; no penalties | None |
| **Jog** | **2x** | 60 ft / rd | **-2 penalty** to subtlety, stealth, or precision | None |
| **Running** | **4x** *(5x with Runner)* | 120 ft / rd *(150 ft)* | **-4 penalty** to subtle actions | **Athletics (DC 10+)** each minute |
| **Sprinting** | **6x** *(7x with Runner)* | 180 ft / rd *(210 ft)* | **-8 penalty** to subtle actions | **Athletics (DC 15+)** each minute |
| **Crawl** | **1/2x** | 15 ft / rd | **+2 bonus** to stealth; gains **Prone** condition | None |
| **Slow Crawl** | **1/4x** | 7.5 ft / rd | **+4 bonus** to stealth; gains **Prone** condition | None |

## Fatigue & Muscle Strain Mechanics
- **Check Trigger & Frequency**: Athletics checks are made every minute (or less depending on the situation) with a **cumulative -1 penalty** per consecutive check.
- **Failure Penalty**: On a failed check, take **1 point of non-lethal damage per 5 points missed** below the DC.
- **Continuing**: May continue movement on a successful **Will check** of the same difficulty.
- **Action Modifiers**: Modifiers apply to anything involving subtlety, stealth, precision, or similar actions.
- **Running Feature**: Increases the multiple of Running and Sprinting by 1 (to **5x / 7x**) without affecting the penalty.
`);

// 1.2 Flying Movement
writeFile(path.join(movementDir, 'movement-flying.md'), `---
id: movement-flying
name: Flying Movement
category: species_movement
description: Flying movement in Tangent offers a variety of speeds and maneuvers, each with its own tactical benefits and drawbacks.
costs:
  bp: 2
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

# Flying Movement

**Category**: Movement Modes & Paces  
**Base Flight Speed**: Typically double walking speed (60 ft per 6-second round for Medium creatures)  

## Overview
Flying movement in Tangent offers characters a variety of speeds and maneuvers, each with its own benefits and drawbacks. Flight is enabled by species traits (wings, levitation organs), technological thrusters/repulsors, or metaphysical invocations.

## Flying Movement Paces & Maneuvers

| Maneuver / Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Fatigue & Skill Check |
| :--- | :---: | :---: | :--- | :--- |
| **Flight** | **1x Flight (2x Walk)** | 60 ft / rd | Standard flying speed; default for flyers | None |
| **Sail** | **2x Flight (4x Walk)** | 120 ft / rd | **-2 penalty** to subtlety, stealth, or precision | None |
| **Surge / Soar** | **4x Flight (8x Walk)** *(5x with Soar)* | 240 ft / rd *(300 ft)* | **-4 penalty** to subtle actions | **Acrobatics (DC 10+)** each minute |
| **Diving** | **2x Current Speed** *(9x with Soar)* | Variable (up to 480+ ft) | **-4 penalty** to actions | **Acrobatics (DC 15+)** |
| **Gliding** | Maintains speed, loses altitude | 60 ft horiz / 12 ft fall | **+2 bonus** to actions | **Acrobatics (DC 10+)** |
| **Hover / Controlled Descent** | **1/2 Flight or less** | 30 ft / rd or static | Enables precise positioning & observation | **Acrobatics (DC 15+)** |

## Flying Rules & Combat Interactions
- **High Ground Bonus**: ANY Flying will likely grant the **High Ground bonus (+2 Strike / +2 Crit)** against grounded opponents.
- **Fatigue & Muscle Strain**: Acrobatics checks ward off fatigue. On a failure, take **1 point of non-lethal damage per 5 points missed** below the DC, then must make a **Will check** of the same difficulty.
- **Controlled Descent Requirement**: Controlled Descent is required if Flight cannot be maintained, or the creature begins a plummet from its current altitude.
- **Check Frequency**: Checks are made each minute (more or less depending on situation) with a **cumulative -1 penalty** per check.
- **Soar Feature**: Increases the multiple of Surge/Soar and Diving by 1 (to **5x / 9x**) without affecting the penalty.
- **Aerial Rams**: Rams made from Flyers cause **+1d additional damage per flight stage** (Flight, Sail, Surge/Soar, Dive) and **+1 Impact Damage per 10 ft of Speed** to ALL involved (Attacker and Target(s); Crash rules also apply).
`);

// 1.3 Swimming Movement
writeFile(path.join(movementDir, 'movement-swimming.md'), `---
id: movement-swimming
name: Swimming Movement
category: species_movement
description: Swimming movement in Tangent is typically half base walking speed (15 ft / round for Medium humanoids).
costs:
  bp: 2
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

# Swimming Movement

**Category**: Movement Modes & Paces  
**Base Swimming Speed**: Typically half walking speed (15 ft per 6-second round [1.83 mph / 3 kph] for Medium humanoid)  

## Overview
Swimming movement in Tangent is determined by a character's base speed, typically half their walking speed. It features different paces with varying speeds and tactical effects.

## Swimming Movement Paces

| Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Fatigue & Skill Check |
| :--- | :---: | :---: | :--- | :--- |
| **Swimming** | **1x Swim (1/2 Walk)** | 15 ft / rd | Standard pace; no modifiers apply | None |
| **Glide** | **2x Swim (1x Walk)** | 30 ft / rd | **-2 penalty** to subtlety, stealth, or precision | **Athletics (Swimming) DC 10+** |
| **Stroke** | **4x Swim (2x Walk)** | 60 ft / rd | **-4 penalty** to subtle actions | **Athletics (Swimming) DC 15+** |
| **Treading** | **1/2 Swim or less** | 7.5 ft / rd | Possible **+2 bonus** to actions | **Athletics (Swimming) DC 5+** |

## Fatigue & Aquatic Hazards
- **Fatigue Checks**: Athletics (Swimming) checks ward off fatigue and muscle strain. On a failure, take **1 point of non-lethal damage per 5 points missed**, followed by a **Will check** of the same difficulty.
- **Treading Water Requirement**: Treading water is required if Swimming cannot be maintained; otherwise, the character begins to submerge and risk drowning.
- **Check Frequency**: Checks are made each minute (or less depending on current/turbulence) with a **cumulative -1 penalty** per check.
- **Swimming Feature**: Increases all Swimming Speeds without affecting penalties (Swimming at full Base Speed [1x walk = 30 ft], Glide at **2x** [60 ft], and Stroke at **3x** [90 ft]).
`);

// 1.4 Climbing Movement
writeFile(path.join(movementDir, 'movement-climbing.md'), `---
id: movement-climbing
name: Climbing Movement
category: species_movement
description: Climbing movement involves ascending or descending vertical surfaces, influenced by base speed and climb difficulty.
costs:
  bp: 2
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

# Climbing Movement

**Category**: Movement Modes & Paces  
**Base Climbing Speed**: Half walking speed on Easy surfaces (15 ft / round for Medium humanoid)  

## Overview
Climbing movement in Tangent involves ascending or descending vertical surfaces, and is influenced by a character's base speed which in turn is affected by the difficulty of the climb. Different climbing speeds are available, each with its own mechanics and effects.

## Surface Difficulty & Base Speed
- **Easy Climb (DC 10+)**: Half base walking speed (15 ft / rd).
- **Moderate Climb (DC 15+)**: Quarter base walking speed (7.5 ft / rd).
- **Difficult Climb (DC 20+)**: Tenth base walking speed (3 ft / rd).
*Difficulties may be modified by climbing gear, harness systems, and environmental conditions (ice, rain, slime).*

## Climbing Movement Paces

| Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Climbing & Skill Check |
| :--- | :---: | :---: | :--- | :--- |
| **Climbing** | Standard Surface Pace | 15 / 7.5 / 3 ft | Standard climb; requires check to avoid falling | **Athletics (Climbing)** vs Surface DC |
| **Scaling** | **1x Base Walk Speed** | 30 ft / rd | **-2 penalty** to subtle actions | **Athletics (Climbing)** at **-5 penalty** |
| **Fast Ascent** | **2x Base Walk Speed** | 60 ft / rd | **-4 penalty** to subtle actions | **Athletics (Climbing)** at **-10 penalty** |
| **Fast Descent** | **4x Base Walk Speed** | 120 ft / rd | Descends without injury; **-4 penalty** to actions | **DC 20 Athletics (Climbing)** or **-10 to check** |

## Fatigue, Falling & Holding On
- **Fatigue Checks**: Athletics (Climbing) checks ward off fatigue and muscle strain. On a failure, take **1 point of non-lethal damage per 5 points missed**, followed by a **Will check** of the same difficulty.
- **Holding On**: Failing a check requires an immediate check to hold on; failure begins a descent or fall (hopefully controlled via descent gear).
- **Check Frequency**: Checks are made each minute with a **cumulative -1 penalty** per check.
- **Climbing Feature**: Increases all Climbing Speeds without affecting penalties (Climbing at full Base Speed [1x], Scaling at **2x**, Fast Ascent at **3x**, and Fast Descent at **6x**).
`);

// 1.5 Burrowing Movement
writeFile(path.join(movementDir, 'movement-burrowing.md'), `---
id: movement-burrowing
name: Burrowing Movement
category: species_movement
description: Burrowing movement allows characters to move through solid matter like soil, sand, or rock.
costs:
  bp: 2
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

# Burrowing Movement

**Category**: Movement Modes & Paces  
**Base Burrowing Speed**: Typically 1/4 base walking speed (7.5 ft per 6-second round [20 ft/round baseline for dedicated burrowers])  

## Overview
Burrowing movement allows characters to move through solid matter like soil, sand, or even rock. It is a slower and more specialized form of movement with unique mechanics reflecting the effort required to displace surrounding material.

## Burrowing Movement Paces

| Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Practical Applications |
| :--- | :---: | :---: | :--- | :--- |
| **Burrowing** | **1/4x Base Walk** | 7.5 ft / rd | Standard pace through soil/sand; displacement effort | Subterranean traversal |
| **Tunneling** | **2x Burrow (1/2x Walk)** | 15 ft / rd | **-2 penalty** to subtlety, stealth, or precision | Creating tunnels, escaping pursuers |
| **Excavation** | **1/8x Base Walk** | 3.75 ft / rd | Halves typical burrow speed due to shoring up walls | Pit traps, underground chambers, fort construction |

## Burrowing Mechanics & Adaptations
- **Adaptations Required**: Burrowing typically requires specific biological adaptations (excavator claws, hardened carapaces, powerful digging limbs), mining technology (plasma drills, molecular disintegrators), or metaphysical abilities (Matter discipline Earth-Molding).
- **Subterranean Skill Checks**: Characters make **Athletics** or **Mining / Engineering** checks to navigate dense substrates, breach bedrock, or avoid cave-ins and pocket gas hazards.
`);

// ----------------------------------------------------
// 2. SPECIES MOVEMENT TRAITS (SPECIES MATRIX SECTION 3)
// ----------------------------------------------------
const speciesTraits = [
  { id: 'movement-normal-speed', name: 'Normal Speed', bp: 0, speed: 30, desc: 'Base speed of 30 feet. Determines speed of other modes.' },
  { id: 'movement-fast', name: 'Fast', bp: 2, speed: 40, desc: 'Base Speed +10 feet. Mutually exclusive with other base speed traits.' },
  { id: 'movement-very-fast', name: 'Very Fast', bp: 4, speed: 50, desc: 'Base Speed +20 feet. Mutually exclusive with other base speed traits.' },
  { id: 'movement-slow', name: 'Slow', bp: -2, speed: 20, desc: 'Base Speed -10 feet (+2 BP gain). Mutually exclusive with other base speed traits.' },
  { id: 'movement-ponderous', name: 'Ponderous', bp: -4, speed: 10, desc: 'Base Speed -20 feet (+4 BP gain). Mutually exclusive with other base speed traits.' },
  { id: 'movement-climber', name: 'Climber', bp: 2, speed: 30, desc: 'Base Climb Speed 30 ft, and gain the +5 racial bonus on climbing checks.' },
  { id: 'movement-gliding-wings', name: 'Gliding Wings', bp: 1, speed: 30, desc: 'While in midair, move 5ft horizontal for every 1ft fall. Speed 30ft/rnd (60 diving).' },
  { id: 'movement-leaper', name: 'Leaper', bp: 1, speed: 0, desc: 'Always considered to have a running start when making Jump checks.' },
  { id: 'movement-mountaineer', name: 'Mountaineer', bp: 1, speed: 0, desc: 'Immune to altitude sickness, no defense loss on narrow/slippery surfaces.' },
  { id: 'movement-sprinter', name: 'Sprinter', bp: 1, speed: 10, desc: 'Gain +10 foot racial bonus to speed when running. Ranked.' },
  { id: 'movement-swim-trait', name: 'Swim', bp: 2, speed: 30, desc: 'Swim speed 30 feet. Gain +5 racial bonus on Swim checks.' },
  { id: 'movement-terrain-movement', name: 'Terrain Movement', bp: 1, speed: 0, desc: 'Move through naturally difficult terrain (specific type) at normal speed.' },
  { id: 'movement-burrow-trait', name: 'Burrow', bp: 2, speed: 20, desc: 'Base Burrow Speed 20 feet.' },
  { id: 'movement-flight-basic', name: 'Basic Flight', bp: 2, speed: 30, desc: 'Base Fly Speed 30 feet (Poor Maneuverability).' },
  { id: 'movement-flight-improved', name: 'Improved Flight Speed', bp: 1, speed: 10, desc: 'Increases base flight speed by 10 feet. Ranked.' },
  { id: 'movement-flight-maneuver', name: 'Improved Maneuverability', bp: 1, speed: 0, desc: 'Maneuverability improves by 1 step (Clumsy > Poor > Average > Good > Perfect). Ranked.' },
  { id: 'movement-strong-flyer', name: 'Strong Flyer', bp: 2, speed: 0, desc: 'Increase the Size category multiplier by 1 for Flying Speed.' },
  { id: 'movement-hauler', name: 'Hauler', bp: 1, speed: 0, desc: 'Not encumbered by carrying a Heavy Load.' },
  { id: 'movement-marcher', name: 'Marcher', bp: 1, speed: 0, desc: 'Fatigued 1/2 when moving at a regular pace.' }
];

speciesTraits.forEach(t => {
  writeFile(path.join(movementDir, `${t.id}.md`), `---
id: ${t.id}
name: ${t.name}
category: species_movement
description: ${t.desc}
costs:
  bp: ${t.bp}
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
speed: ${t.speed}
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

# ${t.name}

**Category**: Species Movement Traits  
**Build Point Cost**: ${t.bp >= 0 ? `${t.bp} BP` : `${Math.abs(t.bp)} BP Gain`}  
**Base Mode Speed**: ${t.speed > 0 ? `${t.speed} ft` : 'N/A'}  

## Description
${t.desc}

## Mechanics & Rules
- Cost: ${t.bp} BP
- Effect: ${t.desc}
`);
});

// ----------------------------------------------------
// 3. CONDITIONS: EXHAUSTED
// ----------------------------------------------------
writeFile(path.join(conditionsDir, 'condition-exhausted.md'), `---
id: condition-exhausted
name: Exhausted
category: conditions
description: Extreme physical fatigue; -2 penalty to all active checks and half movement speed until taking a Light Rest (Nap).
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

# Exhausted

**Category**: Tactical Conditions & Status Effects  

## Trigger
- Occurs when a character fails a Stamina-based Fortitude check (DC 15) from sustained sprinting (5 consecutive rounds) or hurried travel (10+ minutes) and exhausts their non-lethal Vitality pool, taking subsequent Health damage.
- Also triggered by metaphysical strain, prolonged starvation, or extreme environmental exposure.

## Mechanics & Debuffs
- **Check Penalty**: **-2 penalty** to all active skill checks, attack rolls, and active defense checks.
- **Movement Reduction**: All movement speeds are **reduced by half (50%)**.
- **Recovery**: Persists until the character completes a **Light Rest (Nap)** of at least 1–2 hours in a safe environment.
`);

// ----------------------------------------------------
// 4. RULES CODEX: MOVEMENT RULES
// ----------------------------------------------------
writeFile(path.join(rulesDir, 'rule-movement-ground-paces.md'), `---
id: rule-movement-ground-paces
name: Ground Movement Paces & Mechanics
category: rules
description: Rules governing ground movement paces (Walk, Jog, Run, Sprint, Crawl, Slow Crawl) and stealth/subtlety penalties.
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

# Ground Movement Paces & Mechanics

**Category**: Core Movement Rules  

## Movement Paces Table
- **Walk (1x)**: 30 ft/rd (Medium humanoid baseline). Standard pace, no penalties.
- **Jog (2x)**: 60 ft/rd. -2 penalty to subtle/stealth/precision actions.
- **Running (4x / 5x with Runner)**: 120 ft/rd. -4 penalty to subtle actions. Athletics DC 10+ each minute.
- **Sprinting (6x / 7x with Runner)**: 180 ft/rd. -8 penalty to subtle actions. Athletics DC 15+ each minute.
- **Crawl (1/2x)**: 15 ft/rd. +2 bonus to stealth; gains Prone condition.
- **Slow Crawl (1/4x)**: 7.5 ft/rd. +4 bonus to stealth; gains Prone condition.
`);

writeFile(path.join(rulesDir, 'rule-movement-flying-paces.md'), `---
id: rule-movement-flying-paces
name: Flying Movement Paces & Aerial Rules
category: rules
description: Rules for flight speeds (Flight, Sail, Surge/Soar, Dive, Glide, Hover) and aerial fatigue.
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

# Flying Movement Paces & Aerial Rules

**Category**: Core Movement Rules  

## Aerial Paces
- **Flight (1x Fly / 2x Walk)**: 60 ft/rd. Default pace.
- **Sail (2x Fly / 4x Walk)**: 120 ft/rd. -2 penalty to subtle actions.
- **Surge / Soar (4x Fly / 8x Walk, 5x Fly with Soar)**: 240 ft/rd (300 ft). -4 penalty. Acrobatics DC 10+ each minute.
- **Diving (2x current speed, 9x Fly with Soar)**: High-speed descent. -4 penalty. Acrobatics DC 15+.
- **Gliding**: Maintains speed, loses altitude (5ft horiz / 1ft fall). +2 bonus to actions. Acrobatics DC 10+.
- **Hover / Controlled Descent (1/2 Fly or less)**: 30 ft/rd or stationary. Acrobatics DC 15+.
`);

writeFile(path.join(rulesDir, 'rule-flying-ram-impact-damage.md'), `---
id: rule-flying-ram-impact-damage
name: Aerial Ramming & Kinetic Impact Rules
category: rules
description: Damage calculations for aerial collisions and flyer ram attacks.
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

# Aerial Ramming & Kinetic Impact Rules

**Category**: Tactical Combat & Movement  

## Ramming Formula
\\text{Aerial Ram Damage} = +1d \\text{ per Flight Stage} + 1 \\text{ Impact Damage per 10 ft of Movement Speed}

- **Flight Stages**:
  - Flight (Stage 1): +1d damage
  - Sail (Stage 2): +2d damage
  - Surge / Soar (Stage 3): +3d damage
  - Dive (Stage 4): +4d damage
- **Mutual Damage**: Damage applies to ALL involved parties (Attacker and Target(s)).
- **Crash Rules**: Standard crash, structural damage, and stability checks also apply.
`);

writeFile(path.join(rulesDir, 'rule-flying-high-ground-bonus.md'), `---
id: rule-flying-high-ground-bonus
name: Aerial High Ground Bonus
category: rules
description: Combat bonuses gained by airborne combatants engaging grounded targets.
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

# Aerial High Ground Bonus

**Category**: Tactical Combat & Movement  

## High Ground Mechanics
- Any flying combatant operating with an elevation advantage over grounded targets gains the **High Ground Bonus**:
  - **+2 Strike Bonus** to attack rolls.
  - **+2 Critical Threat Bonus** (expanding critical strike threshold).
`);

writeFile(path.join(rulesDir, 'rule-movement-fatigue-exhaustion.md'), `---
id: rule-movement-fatigue-exhaustion
name: Movement Fatigue & Exhaustion System
category: rules
description: Fatigue check triggers, non-lethal vitality loss, and progression to exhaustion.
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

# Movement Fatigue & Exhaustion System

**Category**: Core Resolution & Survival Rules  

## Trigger & Saving Throw
- **Combat Sprint Trigger**: Sprinting for **5 consecutive rounds** in tactical combat forces a **Stamina-based Fortitude Check (DC 15)**.
- **Hurried Travel Trigger**: Hurried or forced-march travel for **10 minutes** forces a **Stamina-based Fortitude Check (DC 15)**.

## Failure Consequences
- **Vitality Damage**: On a failure, take **5 points of non-lethal Vitality damage**.
- **Exhaustion Trigger**: If Vitality is fully depleted, the character takes **2 points of physical Health damage** and immediately gains the **Exhausted** condition (-2 to all active checks and half movement speed).
- **Recovery**: The Exhausted condition persists until the character takes a **Light Rest (Nap)**.
`);

// ----------------------------------------------------
// 5. FEATURES: RUNNER, SWIMMER, CLIMBER, SOAR
// ----------------------------------------------------
writeFile(path.join(featuresDir, 'general-runner.md'), `---
id: general-runner
name: Runner
category: features
feature_category: General
cost_bp: 3
is_ranked: false
is_multiple: false
prerequisites: 'Strength 1, Agility 1, Stamina 1'
description: The character is trained for exceptional land speed and endurance.
costs:
  bp: 3
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

# Runner

**Category**: General Features  
**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  
**Prerequisites**: Strength 1, Agility 1, Stamina 1  

## Description
The character is trained for exceptional land speed, endurance pacing, and swift tactical relocation.

## Mechanics & Benefit
- **Pace Multiplier Increase**: Increases the movement speed multiple of **Running** to **5x** (instead of 4x) and **Sprinting** to **7x** (instead of 6x) base walking speed without increasing action penalties.
- **Endurance Bonus**: Gain a **+2 bonus** to Athletics checks made to avoid fatigue from running and sprinting.
`);

writeFile(path.join(featuresDir, 'general-swimmer.md'), `---
id: general-swimmer
name: Swimmer
category: features
feature_category: General
cost_bp: 3
is_ranked: false
is_multiple: false
prerequisites: 'Athletics 1'
description: The character is an adept aquatic swimmer capable of high sustained speeds.
costs:
  bp: 3
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

# Swimmer

**Category**: General Features  
**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  
**Prerequisites**: Athletics 1  

## Description
The character is an adept aquatic swimmer capable of high sustained speeds and extended submersion.

## Mechanics & Benefit
- **Speed Multiplier Boost**: Increases all Swimming speeds without affecting action penalties:
  - **Standard Swimming**: Moves at full **Base Walking Speed (1x = 30 ft/rd)** instead of half speed.
  - **Glide Pace**: Moves at **2x Base Speed (60 ft/rd)**.
  - **Stroke Pace**: Moves at **3x Base Speed (90 ft/rd)**.
- **Aquatic Focus**: Gain **+2 bonus** to Athletics (Swimming) checks and double breath-holding capacity.
`);

writeFile(path.join(featuresDir, 'general-climber.md'), `---
id: general-climber
name: Climber
category: features
feature_category: General
cost_bp: 3
is_ranked: false
is_multiple: false
prerequisites: 'Agility 1, Athletics 1'
description: The character is a master mountaineer and vertical surface scaler.
costs:
  bp: 3
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

# Climber

**Category**: General Features  
**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  
**Prerequisites**: Agility 1, Athletics 1  

## Description
The character is an expert climber capable of rapid ascent, surface scaling, and controlled vertical descent.

## Mechanics & Benefit
- **Speed Multiplier Boost**: Increases all Climbing speeds without affecting action penalties:
  - **Standard Climbing**: Moves at full **Base Walking Speed (1x = 30 ft/rd)** on standard surfaces.
  - **Scaling Pace**: Moves at **2x Base Speed (60 ft/rd)**.
  - **Fast Ascent Pace**: Moves at **3x Base Speed (90 ft/rd)**.
  - **Fast Descent Pace**: Moves at **6x Base Speed (180 ft/rd)**.
- **Grip & Balance**: Gain **+2 bonus** to Athletics (Climbing) checks and avoid fall damage on successful descent checks.
`);

writeFile(path.join(featuresDir, 'general-soar.md'), `---
id: general-soar
name: Soar
category: features
feature_category: General
cost_bp: 3
is_ranked: false
is_multiple: false
prerequisites: 'Flight capability (Species trait, cybernetic thrusters, or invocation), Acrobatics 1'
description: The character has mastered aerial dynamics, thermals, and high-velocity flight maneuvers.
costs:
  bp: 3
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

# Soar

**Category**: General Features  
**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  
**Prerequisites**: Flight capability, Acrobatics 1  

## Description
The character has mastered aerial dynamics, thermals, and high-velocity flight maneuvers.

## Mechanics & Benefit
- **Aerial Multiplier Boost**: Increases the speed multiplier of **Surge / Soar** to **5x Flight Speed (10x Walk = 300 ft/rd)** and **Diving** to **9x Flight Speed (18x Walk = 540+ ft/rd)** without increasing action penalties.
- **Aerobatic Mastery**: Gain **+2 bonus** on Acrobatics checks made to maintain flight maneuvers, execute dives, and perform controlled landings.
`);

// ----------------------------------------------------
// 6. COMPENDIUM ARTICLE: 3.17 MOVEMENT RULES, PACES & FATIGUE
// ----------------------------------------------------
writeFile(path.join(compendiumDir, '3-17-movement-rules-paces-fatigue.md'), `---
id: 3-17-movement-rules-paces-fatigue
name: 3.17 Movement Modes, Tactical Paces & Fatigue Rules
category: compendium
entry_type: Core Rule
parent: 3.00 COMBAT
order: 17
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
# 3.17 Movement Modes, Tactical Paces & Fatigue Rules

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
- **Exhaustion State**: If Vitality is reduced to 0, take **2 physical Health damage** and gain the **Exhausted** condition (**-2 to all active checks and half movement speed**) until taking a **Light Rest (Nap)**.
`);

// ----------------------------------------------------
// 7. JAVASCRIPT CANONICAL DATASET: speciesMovementData.js
// ----------------------------------------------------
const speciesMovementDataJS = [
  '/**',
  ' * Canonical Movement Types, Modes, Paces, and Rules for Tangent SF RP',
  ' * Sourced from Omnicortex Movement Codex & Tactical Combat System',
  ' */',
  '',
  'export const MOVEMENT_MODES = {',
  '  ground: {',
  '    id: "ground",',
  '    name: "Ground Movement",',
  '    baseMultiplier: 1.0,',
  '    mediumBaseSpeed: 30,',
  '    description: "The baseline mode of locomotion across terrestrial surfaces.",',
  '    paces: {',
  '      walk: { id: "walk", name: "Walk", multiplier: 1.0, speed: 30, actionMod: 0, checkDC: 0, checkSkill: "None", stealthBonus: 0, description: "Default baseline walking pace." },',
  '      jog: { id: "jog", name: "Jog", multiplier: 2.0, speed: 60, actionMod: -2, checkDC: 0, checkSkill: "None", stealthBonus: 0, description: "Hurried pace with minor subtlety penalty." },',
  '      running: { id: "running", name: "Running", multiplier: 4.0, featureMultiplier: 5.0, speed: 120, actionMod: -4, checkDC: 10, checkSkill: "Athletics", stealthBonus: 0, description: "Fast pace requiring Athletics checks to avoid fatigue." },',
  '      sprinting: { id: "sprinting", name: "Sprinting", multiplier: 6.0, featureMultiplier: 7.0, speed: 180, actionMod: -8, checkDC: 15, checkSkill: "Athletics", stealthBonus: 0, description: "Maximum sprint requiring demanding Athletics checks." },',
  '      crawl: { id: "crawl", name: "Crawl", multiplier: 0.5, speed: 15, actionMod: 0, checkDC: 0, checkSkill: "None", stealthBonus: 2, condition: "Prone", description: "Low-profile crawling with +2 stealth bonus." },',
  '      slow_crawl: { id: "slow_crawl", name: "Slow Crawl", multiplier: 0.25, speed: 7.5, actionMod: 0, checkDC: 0, checkSkill: "None", stealthBonus: 4, condition: "Prone", description: "Very slow crawl with +4 stealth bonus." }',
  '    }',
  '  },',
  '  flying: {',
  '    id: "flying",',
  '    name: "Flying Movement",',
  '    baseMultiplier: 2.0,',
  '    mediumBaseSpeed: 60,',
  '    description: "Three-dimensional aerial locomotion offering variable tactical maneuvers.",',
  '    paces: {',
  '      flight: { id: "flight", name: "Flight", multiplier: 1.0, speed: 60, actionMod: 0, checkDC: 0, checkSkill: "None", description: "Standard flying speed (double walking speed)." },',
  '      sail: { id: "sail", name: "Sail", multiplier: 2.0, speed: 120, actionMod: -2, checkDC: 0, checkSkill: "None", description: "Fast cruising speed for closing distances." },',
  '      surge: { id: "surge", name: "Surge / Soar", multiplier: 4.0, featureMultiplier: 5.0, speed: 240, actionMod: -4, checkDC: 10, checkSkill: "Acrobatics", description: "Rapid chase speed requiring Acrobatics checks." },',
  '      diving: { id: "diving", name: "Diving", multiplier: 2.0, featureMultiplier: 9.0, speed: 480, actionMod: -4, checkDC: 15, checkSkill: "Acrobatics", description: "High-speed descent maneuver for surprise strikes." },',
  '      gliding: { id: "gliding", name: "Gliding", multiplier: 1.0, speed: 60, actionMod: 2, checkDC: 10, checkSkill: "Acrobatics", dropRate: "1ft fall per 5ft horiz", description: "Controlled descent gaining +2 bonus to actions." },',
  '      hover: { id: "hover", name: "Hover / Controlled Descent", multiplier: 0.5, speed: 30, actionMod: 0, checkDC: 15, checkSkill: "Acrobatics", description: "Stationary or slow flight enabling precise observation." }',
  '    }',
  '  },',
  '  swimming: {',
  '    id: "swimming",',
  '    name: "Swimming Movement",',
  '    baseMultiplier: 0.5,',
  '    mediumBaseSpeed: 15,',
  '    description: "Aquatic propulsion through liquid environments.",',
  '    paces: {',
  '      swimming: { id: "swimming", name: "Swimming", multiplier: 1.0, featureMultiplier: 2.0, speed: 15, actionMod: 0, checkDC: 0, checkSkill: "None", description: "Standard swim pace (half walking speed)." },',
  '      glide: { id: "glide", name: "Glide", multiplier: 2.0, featureMultiplier: 4.0, speed: 30, actionMod: -2, checkDC: 10, checkSkill: "Athletics (Swimming)", description: "Hurried swim pace." },',
  '      stroke: { id: "stroke", name: "Stroke", multiplier: 4.0, featureMultiplier: 6.0, speed: 60, actionMod: -4, checkDC: 15, checkSkill: "Athletics (Swimming)", description: "Fast power stroke swim pace." },',
  '      treading: { id: "treading", name: "Treading", multiplier: 0.5, speed: 7.5, actionMod: 2, checkDC: 5, checkSkill: "Athletics (Swimming)", description: "Surface treading conserving energy." }',
  '    }',
  '  },',
  '  climbing: {',
  '    id: "climbing",',
  '    name: "Climbing Movement",',
  '    baseMultiplier: 0.5,',
  '    mediumBaseSpeed: 15,',
  '    description: "Vertical ascent and descent across scalable terrain.",',
  '    paces: {',
  '      easy: { id: "easy", name: "Easy Climb (DC 10+)", multiplier: 0.5, speed: 15, checkDC: 10, checkSkill: "Athletics (Climbing)", description: "Half walking speed." },',
  '      moderate: { id: "moderate", name: "Moderate Climb (DC 15+)", multiplier: 0.25, speed: 7.5, checkDC: 15, checkSkill: "Athletics (Climbing)", description: "Quarter walking speed." },',
  '      difficult: { id: "difficult", name: "Difficult Climb (DC 20+)", multiplier: 0.1, speed: 3, checkDC: 20, checkSkill: "Athletics (Climbing)", description: "Tenth walking speed." },',
  '      scaling: { id: "scaling", name: "Scaling", multiplier: 1.0, featureMultiplier: 2.0, speed: 30, actionMod: -2, checkDC: 5, checkSkill: "Athletics (Climbing)", checkPenalty: -5, description: "Ascending at full base walking speed." },',
  '      fast_ascent: { id: "fast_ascent", name: "Fast Ascent", multiplier: 2.0, featureMultiplier: 3.0, speed: 60, actionMod: -4, checkDC: 10, checkSkill: "Athletics (Climbing)", checkPenalty: -10, description: "Ascending at double speed." },',
  '      fast_descent: { id: "fast_descent", name: "Fast Descent", multiplier: 4.0, featureMultiplier: 6.0, speed: 120, actionMod: -4, checkDC: 20, checkSkill: "Athletics (Climbing)", checkPenalty: -10, description: "Rapid uninjured vertical descent." }',
  '    }',
  '  },',
  '  burrowing: {',
  '    id: "burrowing",',
  '    name: "Burrowing Movement",',
  '    baseMultiplier: 0.25,',
  '    mediumBaseSpeed: 7.5,',
  '    description: "Subterranean displacement through soil, sand, or mineral substrate.",',
  '    paces: {',
  '      burrowing: { id: "burrowing", name: "Burrowing", multiplier: 1.0, speed: 7.5, actionMod: 0, description: "Standard burrowing speed (quarter walking speed)." },',
  '      tunneling: { id: "tunneling", name: "Tunneling", multiplier: 2.0, speed: 15, actionMod: -2, description: "Rapid tunnel excavation." },',
  '      excavation: { id: "excavation", name: "Excavation", multiplier: 0.5, speed: 3.75, actionMod: 0, description: "Creating chambers and reinforced subterranean spaces." }',
  '    }',
  '  }',
  '};',
  '',
  'export const MOVEMENT_FATIGUE_CONFIG = {',
  '  combatSprintRoundsTrigger: 5,',
  '  hurriedTravelMinutesTrigger: 10,',
  '  fortitudeCheckDC: 15,',
  '  vitalityDamageOnFailure: 5,',
  '  damagePerMissOfFive: 1,',
  '  exhaustionHealthDamage: 2,',
  '  exhaustionDebuff: {',
  '    checkPenalty: -2,',
  '    speedMultiplier: 0.5,',
  '    recovery: "Light Rest (Nap)"',
  '  }',
  '};',
  '',
  'export const FLYING_COMBAT_CONFIG = {',
  '  highGroundStrikeBonus: 2,',
  '  highGroundCritBonus: 2,',
  '  flightStages: ["Flight", "Sail", "Surge", "Dive"],',
  '  ramDicePerStage: 1,',
  '  ramImpactDamagePer10Ft: 1',
  '};',
  ''
].join('\n');

writeFile(path.join(dataDir, 'speciesMovementData.js'), speciesMovementDataJS);

// ----------------------------------------------------
// 8. DOCUMENTATION: docs/operator/1.10 MOVEMENT.md
// ----------------------------------------------------
writeFile(path.join(docsOperatorDir, '1.10 MOVEMENT.md'), `# 1.10 MOVEMENT RULES & TACTICAL PACES

Locomotion in Tangent Science Fantasy Roleplay encompasses five primary movement modes: **Ground, Flying, Swimming, Climbing, and Burrowing**.

---

## 1. Ground Movement
Ground movement is based on a character's base speed, typically represented by walking speed (**30 ft per 6-second round [3.72 mph / 6 kph]** for a Medium humanoid).

| Pace | Multiplier | Medium Speed | Subtlety / Action Mod | Check & Fatigue |
| :--- | :---: | :---: | :---: | :--- |
| **Walk** | **1x** | 30 ft / rd | Baseline | None |
| **Jog** | **2x** | 60 ft / rd | **-2 penalty** | None |
| **Running** | **4x** *(5x with Runner)* | 120 ft *(150 ft)* | **-4 penalty** | Athletics DC 10+ (every min, cum. -1) |
| **Sprinting** | **6x** *(7x with Runner)* | 180 ft *(210 ft)* | **-8 penalty** | Athletics DC 15+ (every min, cum. -1) |
| **Crawl** | **1/2x** | 15 ft / rd | **+2 stealth**; Prone | None |
| **Slow Crawl** | **1/4x** | 7.5 ft / rd | **+4 stealth**; Prone | None |

---

## 2. Flying Movement
Standard Flying Speed is double base walking speed (**60 ft / round** for Medium flyers).

| Maneuver | Multiplier | Medium Speed | Subtlety Mod | Check & Fatigue |
| :--- | :---: | :---: | :---: | :--- |
| **Flight** | **1x Fly (2x Walk)** | 60 ft / rd | Baseline | None |
| **Sail** | **2x Fly (4x Walk)** | 120 ft / rd | **-2 penalty** | None |
| **Surge / Soar** | **4x Fly (8x Walk)** *(5x with Soar)* | 240 ft *(300 ft)* | **-4 penalty** | Acrobatics DC 10+ (every min, cum. -1) |
| **Diving** | **2x Current** *(9x with Soar)* | Up to 480+ ft | **-4 penalty** | Acrobatics DC 15+ |
| **Gliding** | Maintains speed, drops 1ft / 5ft horiz | 60 ft / rd | **+2 bonus** | Acrobatics DC 10+ |
| **Hover / Controlled Descent** | **1/2 Fly or less** | 30 ft or static | Baseline | Acrobatics DC 15+ |

- **High Ground**: Flyers above ground targets gain **+2 Strike / +2 Crit**.
- **Aerial Rams**: Deal **+1d per Flight Stage + 1 Impact Damage per 10 ft of speed** to all involved.

---

## 3. Swimming Movement
Standard Swimming Speed is half base walking speed (**15 ft / round [1.83 mph / 3 kph]** for Medium humanoids).

| Pace | Multiplier | Medium Speed | Subtlety Mod | Check & Fatigue |
| :--- | :---: | :---: | :---: | :--- |
| **Swimming** | **1x Swim (1/2 Walk)** | 15 ft / rd | Baseline | None |
| **Glide** | **2x Swim (1x Walk)** | 30 ft / rd | **-2 penalty** | Athletics (Swim) DC 10+ |
| **Stroke** | **4x Swim (2x Walk)** | 60 ft / rd | **-4 penalty** | Athletics (Swim) DC 15+ |
| **Treading** | **1/2 Swim or less** | 7.5 ft / rd | **+2 bonus** | Athletics (Swim) DC 5+ |
*(Swimming Feature: Swimming 30 ft, Glide 60 ft, Stroke 90 ft).*

---

## 4. Climbing Movement
Climbing speed depends on surface difficulty:
- **Easy (DC 10+)**: 15 ft / rd (1/2 walk).
- **Moderate (DC 15+)**: 7.5 ft / rd (1/4 walk).
- **Difficult (DC 20+)**: 3 ft / rd (1/10 walk).

| Pace | Speed Ratio | Medium Speed | Subtlety Mod | Check & Fatigue |
| :--- | :---: | :---: | :---: | :--- |
| **Scaling** | **1x Walk** | 30 ft / rd | **-2 penalty** | Athletics (Climb) at **-5 penalty** |
| **Fast Ascent** | **2x Walk** | 60 ft / rd | **-4 penalty** | Athletics (Climb) at **-10 penalty** |
| **Fast Descent** | **4x Walk** | 120 ft / rd | **-4 penalty** | DC 20 Athletics (Climb) or **-10 penalty** |
*(Climbing Feature: Climbing 30 ft, Scaling 60 ft, Fast Ascent 90 ft, Fast Descent 180 ft).*

---

## 5. Burrowing Movement
Standard Burrowing Speed is 1/4 walking speed (**7.5 ft / rd** for Medium humanoids, 20 ft for dedicated burrowing species).

| Pace | Speed Ratio | Medium Speed | Subtlety Mod | Practical Use |
| :--- | :---: | :---: | :---: | :--- |
| **Burrowing** | **1/4x Walk** | 7.5 ft / rd | Baseline | Traversal through soil/sand |
| **Tunneling** | **2x Burrow (1/2 Walk)** | 15 ft / rd | **-2 penalty** | Breaching and hasty tunnels |
| **Excavation** | **1/8x Walk** | 3.75 ft / rd | Baseline | Fortified chambers & pit traps |

---

## 6. Movement Fatigue Rules
- **Sprint Trigger**: 5 consecutive combat rounds of sprinting forces a **Stamina-based Fortitude Check (DC 15)**.
- **Hurried Travel Trigger**: 10 minutes of hurried travel forces a **Stamina-based Fortitude Check (DC 15)**.
- **Failure**: Takes **5 points of non-lethal Vitality damage** (1 pt per 5 points missed below DC).
- **Depletion to Exhaustion**: When Vitality reaches 0, takes **2 physical Health damage** and suffers the **Exhausted condition** (**-2 to all active checks and half movement speed**) until taking a **Light Rest (Nap)**.
`);

console.log('Successfully built all Movement datasets, rules, features, compendium, and documentation files!');
