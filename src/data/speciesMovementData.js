/**
 * Canonical Movement Types, Modes, Paces, and Rules for Tangent SF RP
 * Auto-generated and consolidated from src/data/omnicortex/species_movement/
 * Total Movements: 55
 */

export const DEFAULT_SPECIES_MOVEMENT = [
  {
    "id": "species_movement-swimming",
    "name": "Aquatic Swimming",
    "category": "species_movement",
    "type": "Swimming",
    "speed": 30,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Hydrodynamic body form with fins or aquatic propulsion, granting an innate 30 ft swim speed in liquid environments.",
    "modifiers": [],
    "body": "# Aquatic Swimming\n\n**Mode Type**: Swimming  \n**Base Speed**: 30 ft / round  \n\n## Description\nHydrodynamic body form with fins or aquatic propulsion, granting an innate 30 ft swim speed in liquid environments."
  },
  {
    "id": "movement-flight-basic",
    "name": "Basic Flight",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 2,
    "costs": {
      "bp": 2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Base Fly Speed 30 (Poor Maneuverability).",
    "modifiers": [],
    "body": "# Basic Flight\n\n**Category**: Species Movement (Mode)  \n**Cost**: 2 BP  \n**Classification**: Mode  \n\n## Effect\nBase Fly Speed 30 (Poor Maneuverability).\n\n## Mechanics & Rules\nGrants an innate Fly speed of 30 feet per round with Poor maneuverability. Eligible for Improved Flight Speed and Improved Maneuverability."
  },
  {
    "id": "species_movement-bipedal",
    "name": "Bipedal Locomotion",
    "category": "species_movement",
    "type": "Ground",
    "speed": 30,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Standard upright two-legged locomotion. Baseline walking speed of 30 ft per combat round (6 seconds).",
    "modifiers": [],
    "body": "# Bipedal Locomotion\n\n**Mode Type**: Ground  \n**Base Speed**: 30 ft / round  \n\n## Description\nStandard upright two-legged locomotion. Baseline walking speed of 30 ft per combat round (6 seconds)."
  },
  {
    "id": "movement-burrow-trait",
    "name": "Burrow",
    "category": "species_movement",
    "type": "Mode",
    "speed": 20,
    "bp": 2,
    "costs": {
      "bp": 2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Base Burrow Speed 20.",
    "modifiers": [],
    "body": "# Burrow\n\n**Category**: Species Movement (Mode)  \n**Cost**: 2 BP  \n**Classification**: Mode  \n\n## Effect\nBase Burrow Speed 20.\n\n## Mechanics & Rules\nGrants an innate Base Burrow Speed of 20 feet per round through loose soil, sand, and unworked earth."
  },
  {
    "id": "movement-burrowing",
    "name": "Burrowing Movement",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 2,
    "costs": {
      "bp": 2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Burrowing movement allows characters to move through solid matter like soil, sand, or rock.",
    "modifiers": [],
    "body": "# Burrowing Movement\n\n**Category**: Movement Modes & Paces  \n**Base Burrowing Speed**: Typically 1/4 base walking speed (7.5 ft per 6-second round [20 ft/round baseline for dedicated burrowers])  \n\n## Overview\nBurrowing movement allows characters to move through solid matter like soil, sand, or even rock. It is a slower and more specialized form of movement with unique mechanics reflecting the effort required to displace surrounding material.\n\n## Burrowing Movement Paces\n\n| Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Practical Applications |\n| :--- | :---: | :---: | :--- | :--- |\n| **Burrowing** | **1/4x Base Walk** | 7.5 ft / rd | Standard pace through soil/sand; displacement effort | Subterranean traversal |\n| **Tunneling** | **2x Burrow (1/2x Walk)** | 15 ft / rd | **-2 penalty** to subtlety, stealth, or precision | Creating tunnels, escaping pursuers |\n| **Excavation** | **1/8x Base Walk** | 3.75 ft / rd | Halves typical burrow speed due to shoring up walls | Pit traps, underground chambers, fort construction |\n\n## Burrowing Mechanics & Adaptations\n- **Adaptations Required**: Burrowing typically requires specific biological adaptations (excavator claws, hardened carapaces, powerful digging limbs), mining technology (plasma drills, molecular disintegrators), or metaphysical abilities (Matter discipline Earth-Molding).\n- **Subterranean Skill Checks**: Characters make **Athletics** or **Mining / Engineering** checks to navigate dense substrates, breach bedrock, or avoid cave-ins and pocket gas hazards."
  },
  {
    "id": "movement-excavation",
    "name": "Burrowing: Excavation Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 3.75,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Reinforced excavation for pit traps, underground bunkers, and permanent subterranean structures.",
    "modifiers": [],
    "body": "# Burrowing: Excavation Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Burrowing  \n**Speed Multiplier**: 1/8x Base Walk  \n**Medium Speed Baseline**: 3.75 ft / round  \n\n## Description\nReinforced excavation for pit traps, underground bunkers, and permanent subterranean structures.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: Half burrow speed\n- **Required Check**: Engineering / Mining check"
  },
  {
    "id": "movement-burrow",
    "name": "Burrowing: Standard Burrow Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 7.5,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Standard subterranean displacement pace through soil or sand.",
    "modifiers": [],
    "body": "# Burrowing: Standard Burrow Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Burrowing  \n**Speed Multiplier**: 1/4x Base Walk  \n**Medium Speed Baseline**: 7.5 ft / round  \n\n## Description\nStandard subterranean displacement pace through soil or sand.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: None\n- **Required Check**: None / Substrate check"
  },
  {
    "id": "movement-tunneling",
    "name": "Burrowing: Tunneling Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 15,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Rapid tunnel excavation with -2 penalty to subtle actions.",
    "modifiers": [],
    "body": "# Burrowing: Tunneling Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Burrowing  \n**Speed Multiplier**: 2x Burrow (1/2x Walk)  \n**Medium Speed Baseline**: 15 ft / round  \n\n## Description\nRapid tunnel excavation with -2 penalty to subtle actions.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -2 to subtlety/stealth/precision\n- **Required Check**: Athletics / Mining check"
  },
  {
    "id": "movement-climber",
    "name": "Climber",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 2,
    "costs": {
      "bp": 2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Base Climb Speed 30, and gain the +5 racial bonus on climbing checks.",
    "modifiers": [],
    "body": "# Climber\n\n**Category**: Species Movement (Mode)  \n**Cost**: 2 BP  \n**Classification**: Mode  \n\n## Effect\nBase Climb Speed 30, and gain the +5 racial bonus on climbing checks.\n\n## Mechanics & Rules\nGrants an innate Base Climb Speed of 30 ft per round and a permanent +5 racial bonus on all Athletics (Climbing) checks."
  },
  {
    "id": "movement-climbing",
    "name": "Climbing Movement",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 2,
    "costs": {
      "bp": 2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Climbing movement involves ascending or descending vertical surfaces, influenced by base speed and climb difficulty.",
    "modifiers": [],
    "body": "# Climbing Movement\n\n**Category**: Movement Modes & Paces  \n**Base Climbing Speed**: Half walking speed on Easy surfaces (15 ft / round for Medium humanoid)  \n\n## Overview\nClimbing movement in Tangent involves ascending or descending vertical surfaces, and is influenced by a character's base speed which in turn is affected by the difficulty of the climb. Different climbing speeds are available, each with its own mechanics and effects.\n\n## Surface Difficulty & Base Speed\n- **Easy Climb (DC 10+)**: Half base walking speed (15 ft / rd).\n- **Moderate Climb (DC 15+)**: Quarter base walking speed (7.5 ft / rd).\n- **Difficult Climb (DC 20+)**: Tenth base walking speed (3 ft / rd).\n*Difficulties may be modified by climbing gear, harness systems, and environmental conditions (ice, rain, slime).*\n\n## Climbing Movement Paces\n\n| Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Climbing & Skill Check |\n| :--- | :---: | :---: | :--- | :--- |\n| **Climbing** | Standard Surface Pace | 15 / 7.5 / 3 ft | Standard climb; requires check to avoid falling | **Athletics (Climbing)** vs Surface DC |\n| **Scaling** | **1x Base Walk Speed** | 30 ft / rd | **-2 penalty** to subtle actions | **Athletics (Climbing)** at **-5 penalty** |\n| **Fast Ascent** | **2x Base Walk Speed** | 60 ft / rd | **-4 penalty** to subtle actions | **Athletics (Climbing)** at **-10 penalty** |\n| **Fast Descent** | **4x Base Walk Speed** | 120 ft / rd | Descends without injury; **-4 penalty** to actions | **DC 20 Athletics (Climbing)** or **-10 to check** |\n\n## Fatigue, Falling & Holding On\n- **Fatigue Checks**: Athletics (Climbing) checks ward off fatigue and muscle strain. On a failure, take **1 point of non-lethal damage per 5 points missed**, followed by a **Will check** of the same difficulty.\n- **Holding On**: Failing a check requires an immediate check to hold on; failure begins a descent or fall (hopefully controlled via descent gear).\n- **Check Frequency**: Checks are made each minute with a **cumulative -1 penalty** per check.\n- **Climbing Feature**: Increases all Climbing Speeds without affecting penalties (Climbing at full Base Speed [1x], Scaling at **2x**, Fast Ascent at **3x**, and Fast Descent at **6x**)."
  },
  {
    "id": "movement-fast-ascent",
    "name": "Climbing: Fast Ascent Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 60,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "High-speed vertical ascent at double walking speed with -10 penalty to check.",
    "modifiers": [],
    "body": "# Climbing: Fast Ascent Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Climbing  \n**Speed Multiplier**: 2x Base Walk  \n**Medium Speed Baseline**: 60 ft / round  \n\n## Description\nHigh-speed vertical ascent at double walking speed with -10 penalty to check.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -4 to subtle actions\n- **Required Check**: Athletics (Climbing) at -10 penalty"
  },
  {
    "id": "movement-fast-descent",
    "name": "Climbing: Fast Descent Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 120,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Rapid controlled vertical descent without injury.",
    "modifiers": [],
    "body": "# Climbing: Fast Descent Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Climbing  \n**Speed Multiplier**: 4x Base Walk  \n**Medium Speed Baseline**: 120 ft / round  \n\n## Description\nRapid controlled vertical descent without injury.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -4 to actions\n- **Required Check**: DC 20 Athletics (Climbing) or -10 penalty"
  },
  {
    "id": "movement-scaling",
    "name": "Climbing: Scaling Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Rapid surface scaling at full base walking speed with -5 penalty to check.",
    "modifiers": [],
    "body": "# Climbing: Scaling Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Climbing  \n**Speed Multiplier**: 1x Base Walk  \n**Medium Speed Baseline**: 30 ft / round  \n\n## Description\nRapid surface scaling at full base walking speed with -5 penalty to check.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -2 to subtle actions\n- **Required Check**: Athletics (Climbing) at -5 penalty"
  },
  {
    "id": "movement-climb",
    "name": "Climbing: Standard Climb Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 15,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Standard vertical ascent/descent across Easy (DC 10), Moderate (DC 15), or Difficult (DC 20) surfaces.",
    "modifiers": [],
    "body": "# Climbing: Standard Climb Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Climbing  \n**Speed Multiplier**: Surface Dependent (1/2, 1/4, 1/10 Walk)  \n**Medium Speed Baseline**: 15 ft / round  \n\n## Description\nStandard vertical ascent/descent across Easy (DC 10), Moderate (DC 15), or Difficult (DC 20) surfaces.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: Risk of falling\n- **Required Check**: Athletics (Climbing) vs Surface DC"
  },
  {
    "id": "movement-fast",
    "name": "Fast",
    "category": "species_movement",
    "type": "Mode",
    "speed": 10,
    "bp": 2,
    "costs": {
      "bp": 2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Base Speed +10 feet. *",
    "modifiers": [],
    "body": "# Fast\n\n**Category**: Species Movement (Modification)  \n**Cost**: 2 BP  \n**Classification**: Modification (* Mutually Exclusive Speed Trait)  \n\n## Effect\nBase Speed +10 feet. *\n\n## Mechanics & Rules\nIncreases Base Speed by +10 feet (to 40 ft for Medium species). Mutually exclusive with other base speed modifier traits (*)."
  },
  {
    "id": "movement-flying",
    "name": "Flying Movement",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 2,
    "costs": {
      "bp": 2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Flying movement in Tangent offers a variety of speeds and maneuvers, each with its own tactical benefits and drawbacks.",
    "modifiers": [],
    "body": "# Flying Movement\n\n**Category**: Movement Modes & Paces  \n**Base Flight Speed**: Typically double walking speed (60 ft per 6-second round for Medium creatures)  \n\n## Overview\nFlying movement in Tangent offers characters a variety of speeds and maneuvers, each with its own benefits and drawbacks. Flight is enabled by species traits (wings, levitation organs), technological thrusters/repulsors, or metaphysical invocations.\n\n## Flying Movement Paces & Maneuvers\n\n| Maneuver / Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Fatigue & Skill Check |\n| :--- | :---: | :---: | :--- | :--- |\n| **Flight** | **1x Flight (2x Walk)** | 60 ft / rd | Standard flying speed; default for flyers | None |\n| **Sail** | **2x Flight (4x Walk)** | 120 ft / rd | **-2 penalty** to subtlety, stealth, or precision | None |\n| **Surge / Soar** | **4x Flight (8x Walk)** *(5x with Soar)* | 240 ft / rd *(300 ft)* | **-4 penalty** to subtle actions | **Acrobatics (DC 10+)** each minute |\n| **Diving** | **2x Current Speed** *(9x with Soar)* | Variable (up to 480+ ft) | **-4 penalty** to actions | **Acrobatics (DC 15+)** |\n| **Gliding** | Maintains speed, loses altitude | 60 ft horiz / 12 ft fall | **+2 bonus** to actions | **Acrobatics (DC 10+)** |\n| **Hover / Controlled Descent** | **1/2 Flight or less** | 30 ft / rd or static | Enables precise positioning & observation | **Acrobatics (DC 15+)** |\n\n## Flying Rules & Combat Interactions\n- **High Ground Bonus**: ANY Flying will likely grant the **High Ground bonus (+2 Strike / +2 Crit)** against grounded opponents.\n- **Fatigue & Muscle Strain**: Acrobatics checks ward off fatigue. On a failure, take **1 point of non-lethal damage per 5 points missed** below the DC, then must make a **Will check** of the same difficulty.\n- **Controlled Descent Requirement**: Controlled Descent is required if Flight cannot be maintained, or the creature begins a plummet from its current altitude.\n- **Check Frequency**: Checks are made each minute (more or less depending on situation) with a **cumulative -1 penalty** per check.\n- **Soar Feature**: Increases the multiple of Surge/Soar and Diving by 1 (to **5x / 9x**) without affecting the penalty.\n- **Aerial Rams**: Rams made from Flyers cause **+1d additional damage per flight stage** (Flight, Sail, Surge/Soar, Dive) and **+1 Impact Damage per 10 ft of Speed** to ALL involved (Attacker and Target(s); Crash rules also apply)."
  },
  {
    "id": "movement-diving",
    "name": "Flying: Diving Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 480,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "High-speed descent maneuver for tactical engagement.",
    "modifiers": [],
    "body": "# Flying: Diving Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Flying  \n**Speed Multiplier**: 2x Current Speed (9x with Soar)  \n**Medium Speed Baseline**: 480 ft / round  \n\n## Description\nHigh-speed descent maneuver for tactical engagement.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -4 to actions\n- **Required Check**: Acrobatics DC 15+"
  },
  {
    "id": "movement-flight",
    "name": "Flying: Flight Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 60,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Standard flying speed. Default pace for winged, thruster-equipped, or levitating creatures.",
    "modifiers": [],
    "body": "# Flying: Flight Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Flying  \n**Speed Multiplier**: 1x Flight (2x Walk)  \n**Medium Speed Baseline**: 60 ft / round  \n\n## Description\nStandard flying speed. Default pace for winged, thruster-equipped, or levitating creatures.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: None\n- **Required Check**: None"
  },
  {
    "id": "movement-gliding",
    "name": "Flying: Gliding Maneuver",
    "category": "species_movement",
    "type": "Mode",
    "speed": 60,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Controlled descent using aerodynamic lift. Grants +2 bonus to actions.",
    "modifiers": [],
    "body": "# Flying: Gliding Maneuver\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Flying  \n**Speed Multiplier**: 1x Flight (drops 1ft per 5ft horiz)  \n**Medium Speed Baseline**: 60 ft / round  \n\n## Description\nControlled descent using aerodynamic lift. Grants +2 bonus to actions.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: None (+2 to actions)\n- **Required Check**: Acrobatics DC 10+"
  },
  {
    "id": "movement-hover-descent",
    "name": "Flying: Hover & Controlled Descent",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Stationary or slow descent enabling precise observation and stable targeting.",
    "modifiers": [],
    "body": "# Flying: Hover & Controlled Descent\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Flying  \n**Speed Multiplier**: 1/2x Flight or less  \n**Medium Speed Baseline**: 30 ft / round  \n\n## Description\nStationary or slow descent enabling precise observation and stable targeting.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: None\n- **Required Check**: Acrobatics DC 15+"
  },
  {
    "id": "movement-sail",
    "name": "Flying: Sail Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 120,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Hurried aerial cruise pace with a -2 penalty to subtle actions.",
    "modifiers": [],
    "body": "# Flying: Sail Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Flying  \n**Speed Multiplier**: 2x Flight (4x Walk)  \n**Medium Speed Baseline**: 120 ft / round  \n\n## Description\nHurried aerial cruise pace with a -2 penalty to subtle actions.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -2 to subtlety/stealth/precision\n- **Required Check**: None"
  },
  {
    "id": "movement-surge",
    "name": "Flying: Surge / Soar Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 240,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Maximum aerial surge requiring Acrobatics check (DC 10+) each minute to avoid fatigue.",
    "modifiers": [],
    "body": "# Flying: Surge / Soar Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Flying  \n**Speed Multiplier**: 4x Flight (8x Walk, 5x with Soar)  \n**Medium Speed Baseline**: 240 ft / round  \n\n## Description\nMaximum aerial surge requiring Acrobatics check (DC 10+) each minute to avoid fatigue.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -4 to subtle actions\n- **Required Check**: Acrobatics DC 10+"
  },
  {
    "id": "species_movement-glide",
    "name": "Gliding",
    "category": "species_movement",
    "type": "Flying",
    "speed": 60,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Patagial membranes or gliding sails. Moves 5 ft horizontally for every 1 ft of descent.",
    "modifiers": [],
    "body": "# Gliding\n\n**Mode Type**: Flying  \n**Base Speed**: 60 ft / round  \n\n## Description\nPatagial membranes or gliding sails. Moves 5 ft horizontally for every 1 ft of descent."
  },
  {
    "id": "movement-gliding-wings",
    "name": "Gliding Wings",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 1,
    "costs": {
      "bp": 1,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "While in midair, move 5ft horizontal for every 1ft fall. Speed 30ft/rnd (60 diving).",
    "modifiers": [],
    "body": "# Gliding Wings\n\n**Category**: Species Movement (Mode)  \n**Cost**: 1 BP  \n**Classification**: Mode  \n\n## Effect\nWhile in midair, move 5ft horizontal for every 1ft fall. Speed 30ft/rnd (60 diving).\n\n## Mechanics & Rules\nWhile in midair, move 5 feet horizontally for every 1 foot of descent. Standard glide speed 30 ft/round (60 ft/round when diving)."
  },
  {
    "id": "movement-ground",
    "name": "Ground Movement",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Ground movement in Tangent is based on a character's base walking speed (30 ft / 6 sec round for Medium biped humanoids).",
    "modifiers": [],
    "body": "# Ground Movement\n\n**Category**: Movement Modes & Paces  \n**Base Speed**: 30 ft per 6-second round (3.72 mph / 6 kph for Medium humanoid)  \n\n## Overview\nThe character’s typical movement type (usually ground) and how fast they move is determined by species, modifiers such as features, traits, and other abilities can further alter speed as well as the terrain itself and any armor that may be worn.\n\n## Ground Movement Paces\n\n| Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Fatigue & Skill Check |\n| :--- | :---: | :---: | :--- | :--- |\n| **Walk** | **1x (Base)** | 30 ft / rd | Default pace; no penalties | None |\n| **Jog** | **2x** | 60 ft / rd | **-2 penalty** to subtlety, stealth, or precision | None |\n| **Running** | **4x** *(5x with Runner)* | 120 ft / rd *(150 ft)* | **-4 penalty** to subtle actions | **Athletics (DC 10+)** each minute |\n| **Sprinting** | **6x** *(7x with Runner)* | 180 ft / rd *(210 ft)* | **-8 penalty** to subtle actions | **Athletics (DC 15+)** each minute |\n| **Crawl** | **1/2x** | 15 ft / rd | **+2 bonus** to stealth; gains **Prone** condition | None |\n| **Slow Crawl** | **1/4x** | 7.5 ft / rd | **+4 bonus** to stealth; gains **Prone** condition | None |\n\n## Fatigue & Muscle Strain Mechanics\n- **Check Trigger & Frequency**: Athletics checks are made every minute (or less depending on the situation) with a **cumulative -1 penalty** per consecutive check.\n- **Failure Penalty**: On a failed check, take **1 point of non-lethal damage per 5 points missed** below the DC.\n- **Continuing**: May continue movement on a successful **Will check** of the same difficulty.\n- **Action Modifiers**: Modifiers apply to anything involving subtlety, stealth, precision, or similar actions.\n- **Running Feature**: Increases the multiple of Running and Sprinting by 1 (to **5x / 7x**) without affecting the penalty."
  },
  {
    "id": "movement-crawl",
    "name": "Ground: Crawl Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 15,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Low-profile crawling pace. Grants +2 bonus to stealth and inflicts Prone condition.",
    "modifiers": [],
    "body": "# Ground: Crawl Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Ground  \n**Speed Multiplier**: 1/2x Base  \n**Medium Speed Baseline**: 15 ft / round  \n\n## Description\nLow-profile crawling pace. Grants +2 bonus to stealth and inflicts Prone condition.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: Prone condition\n- **Required Check**: None (+2 Stealth)"
  },
  {
    "id": "movement-jog",
    "name": "Ground: Jog Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 60,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Hurried pace with a -2 penalty to actions requiring subtlety, stealth, or precision.",
    "modifiers": [],
    "body": "# Ground: Jog Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Ground  \n**Speed Multiplier**: 2x Base  \n**Medium Speed Baseline**: 60 ft / round  \n\n## Description\nHurried pace with a -2 penalty to actions requiring subtlety, stealth, or precision.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -2 to subtlety/stealth/precision\n- **Required Check**: None"
  },
  {
    "id": "movement-running",
    "name": "Ground: Running Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 120,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Fast running pace requiring Athletics check (DC 10+) each minute to avoid fatigue.",
    "modifiers": [],
    "body": "# Ground: Running Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Ground  \n**Speed Multiplier**: 4x Base (5x with Runner)  \n**Medium Speed Baseline**: 120 ft / round  \n\n## Description\nFast running pace requiring Athletics check (DC 10+) each minute to avoid fatigue.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -4 to subtle actions\n- **Required Check**: Athletics DC 10+"
  },
  {
    "id": "movement-slow-crawl",
    "name": "Ground: Slow Crawl Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 7.5,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Deliberate stealth crawling pace. Grants +4 bonus to stealth and inflicts Prone condition.",
    "modifiers": [],
    "body": "# Ground: Slow Crawl Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Ground  \n**Speed Multiplier**: 1/4x Base  \n**Medium Speed Baseline**: 7.5 ft / round  \n\n## Description\nDeliberate stealth crawling pace. Grants +4 bonus to stealth and inflicts Prone condition.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: Prone condition\n- **Required Check**: None (+4 Stealth)"
  },
  {
    "id": "movement-sprinting",
    "name": "Ground: Sprinting Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 180,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Maximum land sprint requiring demanding Athletics check (DC 15+) each minute to avoid fatigue.",
    "modifiers": [],
    "body": "# Ground: Sprinting Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Ground  \n**Speed Multiplier**: 6x Base (7x with Runner)  \n**Medium Speed Baseline**: 180 ft / round  \n\n## Description\nMaximum land sprint requiring demanding Athletics check (DC 15+) each minute to avoid fatigue.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -8 to subtle actions\n- **Required Check**: Athletics DC 15+"
  },
  {
    "id": "movement-walk",
    "name": "Ground: Walk Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Default baseline movement pace for all ground locomotion.",
    "modifiers": [],
    "body": "# Ground: Walk Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Ground  \n**Speed Multiplier**: 1x Base  \n**Medium Speed Baseline**: 30 ft / round  \n\n## Description\nDefault baseline movement pace for all ground locomotion.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: None\n- **Required Check**: None"
  },
  {
    "id": "movement-hauler",
    "name": "Hauler",
    "category": "species_movement",
    "type": "Mode",
    "speed": 0,
    "bp": 1,
    "costs": {
      "bp": 1,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Not encumbered by carrying a Heavy Load.",
    "modifiers": [],
    "body": "# Hauler\n\n**Category**: Species Movement (Modification)  \n**Cost**: 1 BP  \n**Classification**: Modification  \n\n## Effect\nNot encumbered by carrying a Heavy Load.\n\n## Mechanics & Rules\nThe character ignores encumbrance movement speed penalties and Agility check debuffs when carrying a Heavy Load."
  },
  {
    "id": "movement-flight-improved",
    "name": "Improved Flight Speed",
    "category": "species_movement",
    "type": "Mode",
    "speed": 10,
    "bp": 1,
    "costs": {
      "bp": 1,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Increases base flight speed by 10 feet. Ranked.",
    "modifiers": [],
    "body": "# Improved Flight Speed\n\n**Category**: Species Movement (Modification)  \n**Cost**: 1 BP  \n**Classification**: Modification (Ranked)  \n\n## Effect\nIncreases base flight speed by 10 feet. Ranked.\n\n## Mechanics & Rules\nIncreases base flight speed by +10 feet per rank taken. May be purchased multiple times."
  },
  {
    "id": "movement-flight-maneuver",
    "name": "Improved Maneuverability",
    "category": "species_movement",
    "type": "Mode",
    "speed": 0,
    "bp": 1,
    "costs": {
      "bp": 1,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Maneuverability improves by 1 step (Clumsy > Poor > Average > Good > Perfect). Ranked.",
    "modifiers": [],
    "body": "# Improved Maneuverability\n\n**Category**: Species Movement (Modification)  \n**Cost**: 1 BP  \n**Classification**: Modification (Ranked)  \n\n## Effect\nManeuverability improves by 1 step (Clumsy > Poor > Average > Good > Perfect). Ranked.\n\n## Mechanics & Rules\nImproves aerial maneuverability by 1 tier step (Clumsy > Poor > Average > Good > Perfect). May be purchased multiple times."
  },
  {
    "id": "species_movement-climbing",
    "name": "Innate Climbing",
    "category": "species_movement",
    "type": "Climb",
    "speed": 30,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Specialized anatomy (claws, micro-suckers, or prehensile limbs) granting an innate 30 ft climb speed without check penalties on standard surfaces.",
    "modifiers": [],
    "body": "# Innate Climbing\n\n**Mode Type**: Climb  \n**Base Speed**: 30 ft / round  \n\n## Description\nSpecialized anatomy (claws, micro-suckers, or prehensile limbs) granting an innate 30 ft climb speed without check penalties on standard surfaces."
  },
  {
    "id": "movement-leaper",
    "name": "Leaper",
    "category": "species_movement",
    "type": "Mode",
    "speed": 0,
    "bp": 1,
    "costs": {
      "bp": 1,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Always considered to have a running start when making Jump checks.",
    "modifiers": [],
    "body": "# Leaper\n\n**Category**: Species Movement (Modification)  \n**Cost**: 1 BP  \n**Classification**: Modification  \n\n## Effect\nAlways considered to have a running start when making Jump checks.\n\n## Mechanics & Rules\nThe character is always treated as having a running start for all Athletics Jump checks, even when jumping from a standstill."
  },
  {
    "id": "movement-marcher",
    "name": "Marcher",
    "category": "species_movement",
    "type": "Mode",
    "speed": 0,
    "bp": 1,
    "costs": {
      "bp": 1,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Fatigued ½ when moving at a regular pace.",
    "modifiers": [],
    "body": "# Marcher\n\n**Category**: Species Movement (Modification)  \n**Cost**: 1 BP  \n**Classification**: Modification  \n\n## Effect\nFatigued ½ when moving at a regular pace.\n\n## Mechanics & Rules\nReduces fatigue check frequency by half (50%) when traveling at standard overland marching pace."
  },
  {
    "id": "movement-mountaineer",
    "name": "Mountaineer",
    "category": "species_movement",
    "type": "Mode",
    "speed": 0,
    "bp": 1,
    "costs": {
      "bp": 1,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Immune to altitude sickness, no defense loss on narrow/slippery surfaces.",
    "modifiers": [],
    "body": "# Mountaineer\n\n**Category**: Species Movement (Modification)  \n**Cost**: 1 BP  \n**Classification**: Modification  \n\n## Effect\nImmune to altitude sickness, no defense loss on narrow/slippery surfaces.\n\n## Mechanics & Rules\nComplete immunity to high-altitude hypoxia/sickness and suffers no Defense or Reflex penalties when balancing on narrow, icy, or precarious vertical surfaces."
  },
  {
    "id": "movement-normal-speed",
    "name": "Normal Speed",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Base speed of 30 feet. Determines speed of other modes.",
    "modifiers": [],
    "body": "# Normal Speed\n\n**Category**: Species Movement (Mode)  \n**Cost**: 0 BP  \n**Classification**: Mode  \n\n## Effect\nBase speed of 30 feet. Determines speed of other modes.\n\n## Mechanics & Rules\nProvides the standard medium humanoid walking baseline (30 ft / round). All secondary modes (fly, swim, climb, burrow) derive base rates from this score."
  },
  {
    "id": "movement-ponderous",
    "name": "Ponderous (Disadvantage)",
    "category": "species_movement",
    "type": "Mode",
    "speed": -20,
    "bp": -4,
    "costs": {
      "bp": -4,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Base Speed -20 feet. (BP Gain) *",
    "modifiers": [],
    "body": "# Ponderous (Disadvantage)\n\n**Category**: Species Movement (Modification)  \n**Cost**: +4 BP Gain (-4 BP)  \n**Classification**: Modification (* Mutually Exclusive Speed Trait) (Disadvantage)  \n\n## Effect\nBase Speed -20 feet. (BP Gain) *\n\n## Mechanics & Rules\nDecreases Base Speed by -20 feet (to 10 ft for Medium species) and refunds +4 Build Points (+4 BP Gain). Mutually exclusive with other base speed modifier traits (*)."
  },
  {
    "id": "species_movement-quadruped",
    "name": "Quadrupedal Locomotion",
    "category": "species_movement",
    "type": "Ground",
    "speed": 40,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Four-legged locomotion providing stability and enhanced ground speed (+10 ft bonus over humanoid baseline).",
    "modifiers": [],
    "body": "# Quadrupedal Locomotion\n\n**Mode Type**: Ground  \n**Base Speed**: 40 ft / round  \n\n## Description\nFour-legged locomotion providing stability and enhanced ground speed (+10 ft bonus over humanoid baseline)."
  },
  {
    "id": "species_movement-slithering",
    "name": "Serpentine Slithering",
    "category": "species_movement",
    "type": "Ground",
    "speed": 25,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Limbless serpentine or slug locomotion. Resilient against trip checks and traverses difficult rubble at normal speed.",
    "modifiers": [],
    "body": "# Serpentine Slithering\n\n**Mode Type**: Ground  \n**Base Speed**: 25 ft / round  \n\n## Description\nLimbless serpentine or slug locomotion. Resilient against trip checks and traverses difficult rubble at normal speed."
  },
  {
    "id": "movement-slow",
    "name": "Slow (Disadvantage)",
    "category": "species_movement",
    "type": "Mode",
    "speed": -10,
    "bp": -2,
    "costs": {
      "bp": -2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Base Speed -10 feet. (BP Gain) *",
    "modifiers": [],
    "body": "# Slow (Disadvantage)\n\n**Category**: Species Movement (Modification)  \n**Cost**: +2 BP Gain (-2 BP)  \n**Classification**: Modification (* Mutually Exclusive Speed Trait) (Disadvantage)  \n\n## Effect\nBase Speed -10 feet. (BP Gain) *\n\n## Mechanics & Rules\nDecreases Base Speed by -10 feet (to 20 ft for Medium species) and refunds +2 Build Points (+2 BP Gain). Mutually exclusive with other base speed modifier traits (*)."
  },
  {
    "id": "movement-sprinter",
    "name": "Sprinter",
    "category": "species_movement",
    "type": "Mode",
    "speed": 10,
    "bp": 1,
    "costs": {
      "bp": 1,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Gain +10 foot racial bonus to speed when running. Ranked.",
    "modifiers": [],
    "body": "# Sprinter\n\n**Category**: Species Movement (Modification)  \n**Cost**: 1 BP  \n**Classification**: Modification (Ranked)  \n\n## Effect\nGain +10 foot racial bonus to speed when running. Ranked.\n\n## Mechanics & Rules\nGain a +10 foot racial bonus to movement speed when executing Running or Sprinting paces. May be purchased multiple times (Ranked)."
  },
  {
    "id": "movement-strong-flyer",
    "name": "Strong Flyer",
    "category": "species_movement",
    "type": "Mode",
    "speed": 0,
    "bp": 2,
    "costs": {
      "bp": 2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Increase the Size category multiplier by 1 for Flying Speed.",
    "modifiers": [],
    "body": "# Strong Flyer\n\n**Category**: Species Movement (Modification)  \n**Cost**: 2 BP  \n**Classification**: Modification  \n\n## Effect\nIncrease the Size category multiplier by 1 for Flying Speed.\n\n## Mechanics & Rules\nIncreases the creature size category multiplier by +1 when calculating total aerial flying velocity."
  },
  {
    "id": "movement-swim-trait",
    "name": "Swim",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 2,
    "costs": {
      "bp": 2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Swim speed 30 feet. Gain +5 racial bonus on Swim checks.",
    "modifiers": [],
    "body": "# Swim\n\n**Category**: Species Movement (Mode)  \n**Cost**: 2 BP  \n**Classification**: Mode  \n\n## Effect\nSwim speed 30 feet. Gain +5 racial bonus on Swim checks.\n\n## Mechanics & Rules\nGrants an innate Swim speed of 30 feet per round and a permanent +5 racial bonus on all Athletics (Swimming) checks."
  },
  {
    "id": "movement-swimming",
    "name": "Swimming Movement",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 2,
    "costs": {
      "bp": 2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Swimming movement in Tangent is typically half base walking speed (15 ft / round for Medium humanoids).",
    "modifiers": [],
    "body": "# Swimming Movement\n\n**Category**: Movement Modes & Paces  \n**Base Swimming Speed**: Typically half walking speed (15 ft per 6-second round [1.83 mph / 3 kph] for Medium humanoid)  \n\n## Overview\nSwimming movement in Tangent is determined by a character's base speed, typically half their walking speed. It features different paces with varying speeds and tactical effects.\n\n## Swimming Movement Paces\n\n| Pace | Speed Multiplier | Medium Speed | Tactical & Action Modifiers | Fatigue & Skill Check |\n| :--- | :---: | :---: | :--- | :--- |\n| **Swimming** | **1x Swim (1/2 Walk)** | 15 ft / rd | Standard pace; no modifiers apply | None |\n| **Glide** | **2x Swim (1x Walk)** | 30 ft / rd | **-2 penalty** to subtlety, stealth, or precision | **Athletics (Swimming) DC 10+** |\n| **Stroke** | **4x Swim (2x Walk)** | 60 ft / rd | **-4 penalty** to subtle actions | **Athletics (Swimming) DC 15+** |\n| **Treading** | **1/2 Swim or less** | 7.5 ft / rd | Possible **+2 bonus** to actions | **Athletics (Swimming) DC 5+** |\n\n## Fatigue & Aquatic Hazards\n- **Fatigue Checks**: Athletics (Swimming) checks ward off fatigue and muscle strain. On a failure, take **1 point of non-lethal damage per 5 points missed**, followed by a **Will check** of the same difficulty.\n- **Treading Water Requirement**: Treading water is required if Swimming cannot be maintained; otherwise, the character begins to submerge and risk drowning.\n- **Check Frequency**: Checks are made each minute (or less depending on current/turbulence) with a **cumulative -1 penalty** per check.\n- **Swimming Feature**: Increases all Swimming Speeds without affecting penalties (Swimming at full Base Speed [1x walk = 30 ft], Glide at **2x** [60 ft], and Stroke at **3x** [90 ft])."
  },
  {
    "id": "movement-glide-swim",
    "name": "Swimming: Glide Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Hurried swimming pace with a -2 penalty to subtle actions.",
    "modifiers": [],
    "body": "# Swimming: Glide Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Swimming  \n**Speed Multiplier**: 2x Swim (1x Walk)  \n**Medium Speed Baseline**: 30 ft / round  \n\n## Description\nHurried swimming pace with a -2 penalty to subtle actions.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -2 to subtle actions\n- **Required Check**: Athletics (Swimming) DC 10+"
  },
  {
    "id": "movement-stroke",
    "name": "Swimming: Stroke Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 60,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Fast power-stroke swimming pace requiring Athletics (Swimming) check (DC 15+) each minute.",
    "modifiers": [],
    "body": "# Swimming: Stroke Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Swimming  \n**Speed Multiplier**: 4x Swim (2x Walk)  \n**Medium Speed Baseline**: 60 ft / round  \n\n## Description\nFast power-stroke swimming pace requiring Athletics (Swimming) check (DC 15+) each minute.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: -4 to subtle actions\n- **Required Check**: Athletics (Swimming) DC 15+"
  },
  {
    "id": "movement-swim",
    "name": "Swimming: Swim Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 15,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Standard aquatic swimming speed.",
    "modifiers": [],
    "body": "# Swimming: Swim Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Swimming  \n**Speed Multiplier**: 1x Swim (1/2x Walk)  \n**Medium Speed Baseline**: 15 ft / round  \n\n## Description\nStandard aquatic swimming speed.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: None\n- **Required Check**: None"
  },
  {
    "id": "movement-treading",
    "name": "Swimming: Treading Pace",
    "category": "species_movement",
    "type": "Mode",
    "speed": 7.5,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Stationary or slow treading water to conserve stamina. Possible +2 bonus to actions.",
    "modifiers": [],
    "body": "# Swimming: Treading Pace\n\n**Category**: Movement Modes & Paces  \n**Movement Mode**: Swimming  \n**Speed Multiplier**: 1/2x Swim or less  \n**Medium Speed Baseline**: 7.5 ft / round  \n\n## Description\nStationary or slow treading water to conserve stamina. Possible +2 bonus to actions.\n\n## Tactical Modifiers & Checks\n- **Action Penalty / Modifier**: None (+2 to actions)\n- **Required Check**: Athletics (Swimming) DC 5+"
  },
  {
    "id": "movement-terrain-movement",
    "name": "Terrain Movement",
    "category": "species_movement",
    "type": "Mode",
    "speed": 0,
    "bp": 1,
    "costs": {
      "bp": 1,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Move through naturally difficult terrain (specific type) at normal speed.",
    "modifiers": [],
    "body": "# Terrain Movement\n\n**Category**: Species Movement (Modification)  \n**Cost**: 1 BP  \n**Classification**: Modification  \n\n## Effect\nMove through naturally difficult terrain (specific type) at normal speed.\n\n## Mechanics & Rules\nChoose one natural terrain type (swamp, arctic, desert, dense forest, rubble). Move through that terrain at full speed without penalty."
  },
  {
    "id": "species_movement-treads",
    "name": "Treads & Tracks",
    "category": "species_movement",
    "type": "Mechanical",
    "speed": 30,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Continuous caterpillar tracks or rolling hub treads for synthetic chassis. Immune to standard knockdowns.",
    "modifiers": [],
    "body": "# Treads & Tracks\n\n**Mode Type**: Mechanical  \n**Base Speed**: 30 ft / round  \n\n## Description\nContinuous caterpillar tracks or rolling hub treads for synthetic chassis. Immune to standard knockdowns."
  },
  {
    "id": "species_movement-flight",
    "name": "True Flight",
    "category": "species_movement",
    "type": "Flying",
    "speed": 60,
    "bp": 0,
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Aerial wings, antigrav impellers, or metaphysical levitation. Base flight speed 60 ft/round (double walking speed).",
    "modifiers": [],
    "body": "# True Flight\n\n**Mode Type**: Flying  \n**Base Speed**: 60 ft / round  \n\n## Description\nAerial wings, antigrav impellers, or metaphysical levitation. Base flight speed 60 ft/round (double walking speed)."
  },
  {
    "id": "movement-very-fast",
    "name": "Very Fast",
    "category": "species_movement",
    "type": "Mode",
    "speed": 20,
    "bp": 4,
    "costs": {
      "bp": 4,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "description": "Base Speed +20 feet. *",
    "modifiers": [],
    "body": "# Very Fast\n\n**Category**: Species Movement (Modification)  \n**Cost**: 4 BP  \n**Classification**: Modification (* Mutually Exclusive Speed Trait)  \n\n## Effect\nBase Speed +20 feet. *\n\n## Mechanics & Rules\nIncreases Base Speed by +20 feet (to 50 ft for Medium species). Mutually exclusive with other base speed modifier traits (*)."
  }
];

export const SPECIES_MOVEMENT_MODES = DEFAULT_SPECIES_MOVEMENT;

export const getMovementById = (id) => DEFAULT_SPECIES_MOVEMENT.find(m => m.id === id);
