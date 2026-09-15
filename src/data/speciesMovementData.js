/**
 * Canonical Movement Types, Modes, Paces, and Rules for Tangent SF RP
 * Auto-generated and consolidated from src/data/omnicortex/species_movement/
 * Total Movements: 58
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
    "body": "# Aquatic Swimming\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Swimming  \n**Cost**: +0 BP  \n**Base Speed**: 30 ft / round  \n\n## Description\nHydrodynamic body form with fins or aquatic propulsion, granting an innate 30 ft swim speed in liquid environments."
  },
  {
    "id": "movement-climbing",
    "name": "Basic Climbing",
    "category": "species_movement",
    "type": "Climbing",
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
    "description": "Baseline climbing speed for standard humanoids, ascending at 15 ft/round (1/2 ground walking speed).",
    "modifiers": [],
    "body": "# Basic Climbing\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Climbing  \n**Cost**: +0 BP  \n**Base Speed**: 15 ft / round  \n\n## Description\nBaseline climbing speed for standard humanoids, ascending at 15 ft/round (1/2 ground walking speed)."
  },
  {
    "id": "movement-flight-basic",
    "name": "Basic Flight",
    "category": "species_movement",
    "type": "Flying",
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
    "description": "Rudimentary flight apparatus or heavy wings granting base Fly Speed 30 ft/round (Poor Maneuverability).",
    "modifiers": [],
    "body": "# Basic Flight\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Flying  \n**Cost**: +2 BP  \n**Base Speed**: 30 ft / round  \n\n## Description\nRudimentary flight apparatus or heavy wings granting base Fly Speed 30 ft/round (Poor Maneuverability)."
  },
  {
    "id": "movement-swimming",
    "name": "Basic Swimming",
    "category": "species_movement",
    "type": "Swimming",
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
    "description": "Baseline swimming speed for non-aquatic species, moving at 15 ft/round (1/2 ground walking speed).",
    "modifiers": [],
    "body": "# Basic Swimming\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Swimming  \n**Cost**: +0 BP  \n**Base Speed**: 15 ft / round  \n\n## Description\nBaseline swimming speed for non-aquatic species, moving at 15 ft/round (1/2 ground walking speed)."
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
    "body": "# Bipedal Locomotion\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n**Base Speed**: 30 ft / round  \n\n## Description\nStandard upright two-legged locomotion. Baseline walking speed of 30 ft per combat round (6 seconds)."
  },
  {
    "id": "movement-burrowing",
    "name": "Burrowing Movement",
    "category": "species_movement",
    "type": "Burrowing",
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
    "description": "Specialized subterranean locomotion displacing soil and sand at 20 ft/round.",
    "modifiers": [],
    "body": "# Burrowing Movement\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Burrowing  \n**Cost**: +2 BP  \n**Base Speed**: 20 ft / round  \n\n## Description\nSpecialized subterranean locomotion displacing soil and sand at 20 ft/round."
  },
  {
    "id": "movement-excavation",
    "name": "Burrowing: Excavation Pace (0.1875x Walk)",
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
    "description": "Careful reinforced excavation for permanent subterranean bunkers or fortresses.",
    "modifiers": [],
    "body": "# Burrowing: Excavation Pace (0.1875x Walk)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Burrowing  \n**Cost**: +0 BP  \n\n## Description\nCareful reinforced excavation for permanent subterranean bunkers or fortresses."
  },
  {
    "id": "movement-burrow",
    "name": "Burrowing: Standard Burrow Pace (0.375x Walk)",
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
    "body": "# Burrowing: Standard Burrow Pace (0.375x Walk)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Burrowing  \n**Cost**: +0 BP  \n\n## Description\nStandard subterranean displacement pace through soil or sand."
  },
  {
    "id": "movement-tunneling",
    "name": "Burrowing: Tunneling Pace (0.75x Walk)",
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
    "description": "Rapid subterranean tunnel excavation (3/4 Base Walk) with -2 penalty to subtlety.",
    "modifiers": [],
    "body": "# Burrowing: Tunneling Pace (0.75x Walk)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Burrowing  \n**Cost**: +0 BP  \n\n## Description\nRapid subterranean tunnel excavation (3/4 Base Walk) with -2 penalty to subtlety."
  },
  {
    "id": "movement-climber",
    "name": "Climber",
    "category": "species_movement",
    "type": "Climbing",
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
    "description": "Innate climbing adaptations granting Base Climb Speed 30 ft and +5 racial bonus on climbing checks.",
    "modifiers": [],
    "body": "# Climber\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Climbing  \n**Cost**: +2 BP  \n**Base Speed**: 30 ft / round  \n\n## Description\nInnate climbing adaptations granting Base Climb Speed 30 ft and +5 racial bonus on climbing checks."
  },
  {
    "id": "movement-fast-ascent",
    "name": "Climbing: Fast Ascent Pace (2x Walk)",
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
    "description": "High-speed vertical sprint (2x Walk) with -10 penalty to check.",
    "modifiers": [],
    "body": "# Climbing: Fast Ascent Pace (2x Walk)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Climbing  \n**Cost**: +0 BP  \n\n## Description\nHigh-speed vertical sprint (2x Walk) with -10 penalty to check."
  },
  {
    "id": "movement-fast-descent",
    "name": "Climbing: Fast Descent Pace (4x Walk)",
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
    "description": "Rapid controlled vertical slide or abseil descent (4x Walk).",
    "modifiers": [],
    "body": "# Climbing: Fast Descent Pace (4x Walk)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Climbing  \n**Cost**: +0 BP  \n\n## Description\nRapid controlled vertical slide or abseil descent (4x Walk)."
  },
  {
    "id": "movement-scaling",
    "name": "Climbing: Scaling Pace (1x Walk)",
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
    "description": "Rapid surface scaling at full walking speed with -5 penalty to check.",
    "modifiers": [],
    "body": "# Climbing: Scaling Pace (1x Walk)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Climbing  \n**Cost**: +0 BP  \n\n## Description\nRapid surface scaling at full walking speed with -5 penalty to check."
  },
  {
    "id": "movement-climb",
    "name": "Climbing: Standard Climb Pace (0.5x Walk)",
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
    "description": "Standard vertical ascent/descent pace (1/2 Base Walk).",
    "modifiers": [],
    "body": "# Climbing: Standard Climb Pace (0.5x Walk)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Climbing  \n**Cost**: +0 BP  \n\n## Description\nStandard vertical ascent/descent pace (1/2 Base Walk)."
  },
  {
    "id": "movement-burrow-improved",
    "name": "Enhanced Burrow Speed (+10 ft Burrow)",
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
    "description": "Increases base burrowing speed by +10 feet (Additive). Ranked.",
    "modifiers": [],
    "body": "# Enhanced Burrow Speed (+10 ft Burrow)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Burrowing  \n**Cost**: +1 BP  \n**Speed Modifier**: +10 ft (Additive)  \n\n## Description\nIncreases base burrowing speed by +10 feet (Additive). Ranked."
  },
  {
    "id": "movement-climb-improved",
    "name": "Enhanced Climb Speed (+10 ft Climb)",
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
    "description": "Increases base climbing speed by +10 feet (Additive). Ranked.",
    "modifiers": [],
    "body": "# Enhanced Climb Speed (+10 ft Climb)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Climbing  \n**Cost**: +1 BP  \n**Speed Modifier**: +10 ft (Additive)  \n\n## Description\nIncreases base climbing speed by +10 feet (Additive). Ranked."
  },
  {
    "id": "movement-swim-improved",
    "name": "Enhanced Swim Speed (+10 ft Swim)",
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
    "description": "Increases base swimming speed by +10 feet (Additive). Ranked.",
    "modifiers": [],
    "body": "# Enhanced Swim Speed (+10 ft Swim)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Swimming  \n**Cost**: +1 BP  \n**Speed Modifier**: +10 ft (Additive)  \n\n## Description\nIncreases base swimming speed by +10 feet (Additive). Ranked."
  },
  {
    "id": "movement-fast",
    "name": "Fast (+10 ft Ground)",
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
    "description": "Increases base Ground locomotion speed by +10 feet (Additive). Mutually exclusive with other ground speed adjusters.",
    "modifiers": [],
    "body": "# Fast (+10 ft Ground)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Ground  \n**Cost**: +2 BP  \n**Speed Modifier**: +10 ft (Additive)  \n\n## Description\nIncreases base Ground locomotion speed by +10 feet (Additive). Mutually exclusive with other ground speed adjusters."
  },
  {
    "id": "movement-flying",
    "name": "Flying Movement (System Rule)",
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
    "description": "Flying movement rules and tactical maneuver overview.",
    "modifiers": [],
    "body": "# Flying Movement (System Rule)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Flying  \n**Cost**: +0 BP  \n\n## Description\nFlying movement rules and tactical maneuver overview."
  },
  {
    "id": "movement-diving",
    "name": "Flying: Diving Pace (8x Fly)",
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
    "description": "High-speed tactical descent (8x Fly) for precision dive attacks.",
    "modifiers": [],
    "body": "# Flying: Diving Pace (8x Fly)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Flying  \n**Cost**: +0 BP  \n\n## Description\nHigh-speed tactical descent (8x Fly) for precision dive attacks."
  },
  {
    "id": "movement-flight",
    "name": "Flying: Flight Pace (1x Fly)",
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
    "description": "Standard flying cruise pace (1x Fly).",
    "modifiers": [],
    "body": "# Flying: Flight Pace (1x Fly)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Flying  \n**Cost**: +0 BP  \n\n## Description\nStandard flying cruise pace (1x Fly)."
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
    "description": "Controlled unpowered aerodynamic glide granting +2 bonus to aerial actions.",
    "modifiers": [],
    "body": "# Flying: Gliding Maneuver\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Flying  \n**Cost**: +0 BP  \n\n## Description\nControlled unpowered aerodynamic glide granting +2 bonus to aerial actions."
  },
  {
    "id": "movement-hover-descent",
    "name": "Flying: Hover & Controlled Descent (0.5x Fly)",
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
    "description": "Stationary hover or slow vertical descent enabling stable targeting.",
    "modifiers": [],
    "body": "# Flying: Hover & Controlled Descent (0.5x Fly)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Flying  \n**Cost**: +0 BP  \n\n## Description\nStationary hover or slow vertical descent enabling stable targeting."
  },
  {
    "id": "movement-sail",
    "name": "Flying: Sail Pace (2x Fly)",
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
    "description": "Hurried aerial cruise pace (2x Fly) with a -2 penalty to subtle actions.",
    "modifiers": [],
    "body": "# Flying: Sail Pace (2x Fly)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Flying  \n**Cost**: +0 BP  \n\n## Description\nHurried aerial cruise pace (2x Fly) with a -2 penalty to subtle actions."
  },
  {
    "id": "movement-surge",
    "name": "Flying: Surge / Soar Pace (4x Fly)",
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
    "description": "Maximum aerial sprint (4x Fly) requiring Acrobatics check (DC 10+) each minute.",
    "modifiers": [],
    "body": "# Flying: Surge / Soar Pace (4x Fly)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Flying  \n**Cost**: +0 BP  \n\n## Description\nMaximum aerial sprint (4x Fly) requiring Acrobatics check (DC 10+) each minute."
  },
  {
    "id": "species_movement-glide",
    "name": "Gliding",
    "category": "species_movement",
    "type": "Flying",
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
    "description": "Patagial membranes or gliding sails. Moves 30 ft/round horizontally while descending 1 ft for every 5 ft traveled.",
    "modifiers": [],
    "body": "# Gliding\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Flying  \n**Cost**: +0 BP  \n**Base Speed**: 30 ft / round  \n\n## Description\nPatagial membranes or gliding sails. Moves 30 ft/round horizontally while descending 1 ft for every 5 ft traveled."
  },
  {
    "id": "movement-gliding-wings",
    "name": "Gliding Wings",
    "category": "species_movement",
    "type": "Flying",
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
    "description": "Deployable aerodynamic wing membranes. While airborne, glides at 30 ft/round (60 ft/round when diving).",
    "modifiers": [],
    "body": "# Gliding Wings\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Flying  \n**Cost**: +1 BP  \n**Base Speed**: 30 ft / round  \n\n## Description\nDeployable aerodynamic wing membranes. While airborne, glides at 30 ft/round (60 ft/round when diving)."
  },
  {
    "id": "movement-ground",
    "name": "Ground Movement (System Rule)",
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
    "description": "Ground movement rules overview based on base walking speed.",
    "modifiers": [],
    "body": "# Ground Movement (System Rule)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n\n## Description\nGround movement rules overview based on base walking speed."
  },
  {
    "id": "movement-crawl",
    "name": "Ground: Crawl Pace (0.5x Base)",
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
    "description": "Low-profile crawling pace (1/2 Base Walk). Grants +2 to stealth; inflicts Prone.",
    "modifiers": [],
    "body": "# Ground: Crawl Pace (0.5x Base)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n\n## Description\nLow-profile crawling pace (1/2 Base Walk). Grants +2 to stealth; inflicts Prone."
  },
  {
    "id": "movement-jog",
    "name": "Ground: Jog Pace (2x Base)",
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
    "description": "Hurried pace (2x Base Walk) with a -2 penalty to subtlety, stealth, or precision.",
    "modifiers": [],
    "body": "# Ground: Jog Pace (2x Base)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n\n## Description\nHurried pace (2x Base Walk) with a -2 penalty to subtlety, stealth, or precision."
  },
  {
    "id": "movement-running",
    "name": "Ground: Running Pace (4x Base)",
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
    "description": "Fast running pace (4x Base Walk) requiring Athletics check (DC 10+) each minute.",
    "modifiers": [],
    "body": "# Ground: Running Pace (4x Base)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n\n## Description\nFast running pace (4x Base Walk) requiring Athletics check (DC 10+) each minute."
  },
  {
    "id": "movement-slow-crawl",
    "name": "Ground: Slow Crawl Pace (0.25x Base)",
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
    "description": "Deliberate stealth crawl (1/4 Base Walk). Grants +4 to stealth; inflicts Prone.",
    "modifiers": [],
    "body": "# Ground: Slow Crawl Pace (0.25x Base)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n\n## Description\nDeliberate stealth crawl (1/4 Base Walk). Grants +4 to stealth; inflicts Prone."
  },
  {
    "id": "movement-sprinting",
    "name": "Ground: Sprinting Pace (6x Base)",
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
    "description": "Maximum land sprint (6x Base Walk) requiring demanding Athletics check (DC 15+) each minute.",
    "modifiers": [],
    "body": "# Ground: Sprinting Pace (6x Base)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n\n## Description\nMaximum land sprint (6x Base Walk) requiring demanding Athletics check (DC 15+) each minute."
  },
  {
    "id": "movement-walk",
    "name": "Ground: Walk Pace (1x Base)",
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
    "description": "Default baseline movement pace for all ground locomotion (1x Base Walk).",
    "modifiers": [],
    "body": "# Ground: Walk Pace (1x Base)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n\n## Description\nDefault baseline movement pace for all ground locomotion (1x Base Walk)."
  },
  {
    "id": "movement-hauler",
    "name": "Hauler (Heavy Load Mobility)",
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
    "description": "Not encumbered or slowed by carrying a Heavy Load.",
    "modifiers": [],
    "body": "# Hauler (Heavy Load Mobility)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Ground  \n**Cost**: +1 BP  \n\n## Description\nNot encumbered or slowed by carrying a Heavy Load."
  },
  {
    "id": "movement-flight-improved",
    "name": "Improved Flight Speed (+10 ft Flight)",
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
    "description": "Increases base flight speed by +10 feet (Additive). Ranked.",
    "modifiers": [],
    "body": "# Improved Flight Speed (+10 ft Flight)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Flying  \n**Cost**: +1 BP  \n**Speed Modifier**: +10 ft (Additive)  \n\n## Description\nIncreases base flight speed by +10 feet (Additive). Ranked."
  },
  {
    "id": "movement-flight-maneuver",
    "name": "Improved Maneuverability",
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
    "description": "Flight maneuverability improves by 1 step (Clumsy > Poor > Average > Good > Perfect). Ranked.",
    "modifiers": [],
    "body": "# Improved Maneuverability\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Flying  \n**Cost**: +1 BP  \n\n## Description\nFlight maneuverability improves by 1 step (Clumsy > Poor > Average > Good > Perfect). Ranked."
  },
  {
    "id": "movement-burrow-trait",
    "name": "Innate Burrowing",
    "category": "species_movement",
    "type": "Burrowing",
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
    "description": "Excavator claws or subterranean body shape granting Base Burrow Speed 20 ft through soil, sand, and unworked earth.",
    "modifiers": [],
    "body": "# Innate Burrowing\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Burrowing  \n**Cost**: +2 BP  \n**Base Speed**: 20 ft / round  \n\n## Description\nExcavator claws or subterranean body shape granting Base Burrow Speed 20 ft through soil, sand, and unworked earth."
  },
  {
    "id": "species_movement-climbing",
    "name": "Innate Climbing",
    "category": "species_movement",
    "type": "Climbing",
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
    "description": "Specialized anatomy (claws, micro-suckers, or prehensile limbs) granting an innate 30 ft climb speed without checks on standard surfaces.",
    "modifiers": [],
    "body": "# Innate Climbing\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Climbing  \n**Cost**: +0 BP  \n**Base Speed**: 30 ft / round  \n\n## Description\nSpecialized anatomy (claws, micro-suckers, or prehensile limbs) granting an innate 30 ft climb speed without checks on standard surfaces."
  },
  {
    "id": "movement-leaper",
    "name": "Leaper (Jump Mastery)",
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
    "description": "Always considered to have a running start when making Jump and Athletics checks.",
    "modifiers": [],
    "body": "# Leaper (Jump Mastery)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Ground  \n**Cost**: +1 BP  \n\n## Description\nAlways considered to have a running start when making Jump and Athletics checks."
  },
  {
    "id": "movement-marcher",
    "name": "Marcher (Long-Distance Efficiency)",
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
    "description": "Fatigued at 1/2 normal rate when moving at a regular travel pace over overland distances.",
    "modifiers": [],
    "body": "# Marcher (Long-Distance Efficiency)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Ground  \n**Cost**: +1 BP  \n\n## Description\nFatigued at 1/2 normal rate when moving at a regular travel pace over overland distances."
  },
  {
    "id": "movement-mountaineer",
    "name": "Mountaineer (Slope Stability)",
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
    "description": "Immune to altitude sickness and suffers no defense penalties on narrow or slippery vertical surfaces.",
    "modifiers": [],
    "body": "# Mountaineer (Slope Stability)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Climbing  \n**Cost**: +1 BP  \n\n## Description\nImmune to altitude sickness and suffers no defense penalties on narrow or slippery vertical surfaces."
  },
  {
    "id": "movement-normal-speed",
    "name": "Normal Speed (Baseline 30 ft)",
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
    "description": "Standard baseline speed of 30 feet. Determines derived speed of all other locomotion modes.",
    "modifiers": [],
    "body": "# Normal Speed (Baseline 30 ft)\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n**Base Speed**: 30 ft / round  \n\n## Description\nStandard baseline speed of 30 feet. Determines derived speed of all other locomotion modes."
  },
  {
    "id": "movement-ponderous",
    "name": "Ponderous (-20 ft Ground)",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
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
    "description": "Reduces base Ground locomotion speed by -20 feet (Additive). Grants +4 BP refund. Mutually exclusive with other ground speed adjusters.",
    "modifiers": [],
    "body": "# Ponderous (-20 ft Ground)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Ground  \n**Cost**: -4 BP  \n**Speed Modifier**: -20 ft (Additive)  \n\n## Description\nReduces base Ground locomotion speed by -20 feet (Additive). Grants +4 BP refund. Mutually exclusive with other ground speed adjusters."
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
    "description": "Four-legged locomotion providing natural stability (+4 vs trip/knockdown) and enhanced baseline ground speed of 40 ft/round.",
    "modifiers": [],
    "body": "# Quadrupedal Locomotion\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n**Base Speed**: 40 ft / round  \n\n## Description\nFour-legged locomotion providing natural stability (+4 vs trip/knockdown) and enhanced baseline ground speed of 40 ft/round."
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
    "description": "Limbless serpentine or slug locomotion. Baseline speed of 25 ft/round; resilient against trip checks and traverses narrow gaps easily.",
    "modifiers": [],
    "body": "# Serpentine Slithering\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n**Base Speed**: 25 ft / round  \n\n## Description\nLimbless serpentine or slug locomotion. Baseline speed of 25 ft/round; resilient against trip checks and traverses narrow gaps easily."
  },
  {
    "id": "movement-slow",
    "name": "Slow (-10 ft Ground)",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
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
    "description": "Reduces base Ground locomotion speed by -10 feet (Additive). Grants +2 BP refund. Mutually exclusive with other ground speed adjusters.",
    "modifiers": [],
    "body": "# Slow (-10 ft Ground)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Ground  \n**Cost**: -2 BP  \n**Speed Modifier**: -10 ft (Additive)  \n\n## Description\nReduces base Ground locomotion speed by -10 feet (Additive). Grants +2 BP refund. Mutually exclusive with other ground speed adjusters."
  },
  {
    "id": "movement-sprinter",
    "name": "Sprinter (+10 ft Run Speed)",
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
    "description": "Gains a +10 foot bonus to speed when executing running or sprinting actions. Ranked.",
    "modifiers": [],
    "body": "# Sprinter (+10 ft Run Speed)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Ground  \n**Cost**: +1 BP  \n**Speed Modifier**: +10 ft (Additive)  \n\n## Description\nGains a +10 foot bonus to speed when executing running or sprinting actions. Ranked."
  },
  {
    "id": "movement-strong-flyer",
    "name": "Strong Flyer",
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
    "description": "Increases the Size category multiplier by +1 for Flying Speed and load capacity.",
    "modifiers": [],
    "body": "# Strong Flyer\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Flying  \n**Cost**: +2 BP  \n\n## Description\nIncreases the Size category multiplier by +1 for Flying Speed and load capacity."
  },
  {
    "id": "movement-swim-trait",
    "name": "Swim (Innate)",
    "category": "species_movement",
    "type": "Swimming",
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
    "description": "Innate biological swim adaptations granting Swim speed 30 ft and +5 racial bonus on Athletics (Swim) checks.",
    "modifiers": [],
    "body": "# Swim (Innate)\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Swimming  \n**Cost**: +2 BP  \n**Base Speed**: 30 ft / round  \n\n## Description\nInnate biological swim adaptations granting Swim speed 30 ft and +5 racial bonus on Athletics (Swim) checks."
  },
  {
    "id": "movement-glide-swim",
    "name": "Swimming: Glide Pace (2x Swim)",
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
    "description": "Hurried swim stroke (2x Swim) with -2 penalty to stealth.",
    "modifiers": [],
    "body": "# Swimming: Glide Pace (2x Swim)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Swimming  \n**Cost**: +0 BP  \n\n## Description\nHurried swim stroke (2x Swim) with -2 penalty to stealth."
  },
  {
    "id": "movement-stroke",
    "name": "Swimming: Stroke Pace (4x Swim)",
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
    "description": "Maximum aquatic power-stroke sprint (4x Swim) requiring Athletics DC 15+.",
    "modifiers": [],
    "body": "# Swimming: Stroke Pace (4x Swim)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Swimming  \n**Cost**: +0 BP  \n\n## Description\nMaximum aquatic power-stroke sprint (4x Swim) requiring Athletics DC 15+."
  },
  {
    "id": "movement-swim",
    "name": "Swimming: Swim Pace (1x Swim)",
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
    "description": "Standard aquatic swimming cruise pace.",
    "modifiers": [],
    "body": "# Swimming: Swim Pace (1x Swim)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Swimming  \n**Cost**: +0 BP  \n\n## Description\nStandard aquatic swimming cruise pace."
  },
  {
    "id": "movement-treading",
    "name": "Swimming: Treading Pace (0.25x Swim)",
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
    "description": "Stationary or slow treading water to conserve stamina (+2 to concentration).",
    "modifiers": [],
    "body": "# Swimming: Treading Pace (0.25x Swim)\n\n**Category**: Species Movement (PACE)  \n**Target Mode**: Swimming  \n**Cost**: +0 BP  \n\n## Description\nStationary or slow treading water to conserve stamina (+2 to concentration)."
  },
  {
    "id": "movement-terrain-movement",
    "name": "Terrain Movement (Difficult Terrain)",
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
    "description": "Move through naturally difficult terrain (rubble, ice, mud, underbrush) at full normal speed without penalty.",
    "modifiers": [],
    "body": "# Terrain Movement (Difficult Terrain)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Ground  \n**Cost**: +1 BP  \n\n## Description\nMove through naturally difficult terrain (rubble, ice, mud, underbrush) at full normal speed without penalty."
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
    "description": "Continuous caterpillar tracks or rolling hub treads for synthetic chassis. Immune to difficult rough terrain; base speed 30 ft/round.",
    "modifiers": [],
    "body": "# Treads & Tracks\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Ground  \n**Cost**: +0 BP  \n**Base Speed**: 30 ft / round  \n\n## Description\nContinuous caterpillar tracks or rolling hub treads for synthetic chassis. Immune to difficult rough terrain; base speed 30 ft/round."
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
    "description": "Aerial wings, antigrav impellers, or metaphysical levitation. Base flight speed of 60 ft/round with standard maneuverability.",
    "modifiers": [],
    "body": "# True Flight\n\n**Category**: Species Movement (MODE)  \n**Target Mode**: Flying  \n**Cost**: +0 BP  \n**Base Speed**: 60 ft / round  \n\n## Description\nAerial wings, antigrav impellers, or metaphysical levitation. Base flight speed of 60 ft/round with standard maneuverability."
  },
  {
    "id": "movement-very-fast",
    "name": "Very Fast (+20 ft Ground)",
    "category": "species_movement",
    "type": "Mode",
    "speed": 30,
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
    "description": "Increases base Ground locomotion speed by +20 feet (Additive). Mutually exclusive with other ground speed adjusters.",
    "modifiers": [],
    "body": "# Very Fast (+20 ft Ground)\n\n**Category**: Species Movement (ADJUSTER)  \n**Target Mode**: Ground  \n**Cost**: +4 BP  \n**Speed Modifier**: +20 ft (Additive)  \n\n## Description\nIncreases base Ground locomotion speed by +20 feet (Additive). Mutually exclusive with other ground speed adjusters."
  }
];

export const SPECIES_MOVEMENT_MODES = DEFAULT_SPECIES_MOVEMENT;

export const getMovementById = (id) => DEFAULT_SPECIES_MOVEMENT.find(m => m.id === id);
