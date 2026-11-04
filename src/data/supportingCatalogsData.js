/**
 * Canonical Supporting & Developer Reference Catalogs for Tangent SF RP
 * Auto-generated from src/data/omnicortex/<category>/*.md by scripts/syncOmnicortexSupportingCatalogs.mjs
 */

import { COMMODITIES_CATALOG } from '../constants/worldbuilding.js';
import { DEFAULT_CONDITIONS } from './conditionsData.js';
import { DEFAULT_DAMAGE_TYPES } from './damageTypesData.js';
import { DEFAULT_DISCIPLINES } from './disciplinesData.js';
import { DEFAULT_MANEUVERS } from './maneuversData.js';
import { DEFAULT_RULES } from './rulesData.js';
import { DEFAULT_MASTER_SOCIETIES } from './societiesMasterData.js';

export const DEFAULT_AUGMENTATION_TYPES = [
  {
    "id": "aug_type-negligible",
    "name": "Negligible (Fashionware & Utilities)",
    "tl": 3,
    "bp": 0,
    "nodes": 0,
    "description": "Baseline low-invasive options, cosmetic fashionware, personal convenience implants, and standard unenhanced prosthetics requiring 0 BP, 0 Nodes, and no augmentation feature.",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Negligible (Fashionware & Utilities)\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nBaseline low-invasive options, cosmetic fashionware, personal convenience implants, and standard unenhanced prosthetics requiring 0 BP, 0 Nodes, and no augmentation feature."
  },
  {
    "id": "aug_type-sensory",
    "name": "Sensory Modifications",
    "tl": 3,
    "bp": 2,
    "nodes": 2,
    "description": "Nightvision, radar/sonar, teleoptics, acoustic enhancers, bug detectors, and multispectral vision suites.",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Sensory Modifications\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nNightvision, radar/sonar, teleoptics, acoustic enhancers, bug detectors, and multispectral vision suites."
  },
  {
    "id": "aug_type-neural",
    "name": "Brain & Neural Mods",
    "tl": 3,
    "bp": 2,
    "nodes": 2,
    "description": "Neural processors, ghost jacks, skill circuitry, reflex co-processors, memory buffers, and cyber-occult links.",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Brain & Neural Mods\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nNeural processors, ghost jacks, skill circuitry, reflex co-processors, memory buffers, and cyber-occult links."
  },
  {
    "id": "aug_type-bioware",
    "name": "TL4 Enhanced (Bioware)",
    "tl": 4,
    "bp": 2,
    "nodes": 5,
    "description": "Seamless biological and cellular enhancement. Immune to Massive Damage disablement; naturally regenerates 1 SP/hour.",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# TL4 Enhanced (Bioware)\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nSeamless biological and cellular enhancement. Immune to Massive Damage disablement; naturally regenerates 1 SP/hour."
  },
  {
    "id": "aug_type-nanotech",
    "name": "TL5 Advanced (Nanotech)",
    "tl": 5,
    "bp": 1,
    "nodes": 3,
    "description": "Half BP cost (min 1). Morphic, weightless reality-warping nanotechnology and sub-atomic cell manipulation.",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# TL5 Advanced (Nanotech)\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nHalf BP cost (min 1). Morphic, weightless reality-warping nanotechnology and sub-atomic cell manipulation."
  },
  {
    "id": "aug_type-fbc",
    "name": "Full Body Conversion (FBC)",
    "tl": 3,
    "bp": 10,
    "nodes": 200,
    "description": "Total synthetic chassis conversion replacing 100% of organic biology (200 Nodes, 260 Structure Points).",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Full Body Conversion (FBC)\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nTotal synthetic chassis conversion replacing 100% of organic biology (200 Nodes, 260 Structure Points)."
  },
  {
    "id": "aug_type-wearable",
    "name": "Pseudo-Cybernetics (Wearable)",
    "tl": 3,
    "bp": 0,
    "nodes": 10,
    "description": "External modular harnesses, gauntlets, and exo-rigs hosting internal node modifications without biological strain.",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Pseudo-Cybernetics (Wearable)\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nExternal modular harnesses, gauntlets, and exo-rigs hosting internal node modifications without biological strain."
  },
  {
    "id": "aug_type-metaphysical",
    "name": "Metaphysical Augmentation",
    "tl": 4,
    "bp": 2,
    "nodes": 10,
    "description": "Imbued occult tattoos, psi-crystal nodes, resonance conduits, and cyber-metaphysical channeling sockets.",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Metaphysical Augmentation\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nImbued occult tattoos, psi-crystal nodes, resonance conduits, and cyber-metaphysical channeling sockets."
  },
  {
    "id": "aug_type-dermal",
    "name": "Dermal Plating & Subdermal Armor",
    "tl": 3,
    "bp": 2,
    "nodes": 4,
    "description": "Subdermal ballistic weaves, kinetic mesh, composite skull plates, and subcutaneous energy absorption grids.",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Dermal Plating & Subdermal Armor\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nSubdermal ballistic weaves, kinetic mesh, composite skull plates, and subcutaneous energy absorption grids."
  },
  {
    "id": "aug_type-musculoskeletal",
    "name": "Musculoskeletal & Cyber-Limbs",
    "tl": 3,
    "bp": 3,
    "nodes": 6,
    "description": "Myomer muscle replacements, reinforced titanium skeleton, hydraulic jump servos, and strength-enhancing servos.",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Musculoskeletal & Cyber-Limbs\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nMyomer muscle replacements, reinforced titanium skeleton, hydraulic jump servos, and strength-enhancing servos."
  },
  {
    "id": "aug_type-internal-organs",
    "name": "Internal Organ Replacements",
    "tl": 3,
    "bp": 2,
    "nodes": 3,
    "description": "Synthetic secondary heart, toxic filtration liver, metabolic regulators, and cybernetic lungs.",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Internal Organ Replacements\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nSynthetic secondary heart, toxic filtration liver, metabolic regulators, and cybernetic lungs."
  },
  {
    "id": "aug_type-weapon-mounts",
    "name": "Concealed Weapon Mounts",
    "tl": 3,
    "bp": 1,
    "nodes": 2,
    "description": "Internal chassis compartments, pop-up forearm blades, palm pulse emitters, and sub-dermal dart launchers.",
    "category": "augmentation_type",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Concealed Weapon Mounts\n\n**Category**: AUGMENTATION TYPE\n\n## Description\nInternal chassis compartments, pop-up forearm blades, palm pulse emitters, and sub-dermal dart launchers."
  }
];

export const DEFAULT_BODY_LOCATIONS = [
  {
    "id": "loc-head",
    "name": "Head / Cranium",
    "maxNodes": 10,
    "maxSockets": 1,
    "baseSP": 20,
    "isHardened": true,
    "description": "Neural processors, sensory optics, hearing suites, cranial armor, and comm-mesh nodes.",
    "category": "body_location",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Head / Cranium\n\n**Category**: BODY LOCATION\n\n## Description\nNeural processors, sensory optics, hearing suites, cranial armor, and comm-mesh nodes."
  },
  {
    "id": "loc-torso",
    "name": "Torso / Core",
    "maxNodes": 50,
    "maxSockets": 5,
    "baseSP": 100,
    "isHardened": true,
    "description": "Core chassis, cardiopulmonary systems, dermal plating, internal power generators, and metabolic regulators.",
    "category": "body_location",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Torso / Core\n\n**Category**: BODY LOCATION\n\n## Description\nCore chassis, cardiopulmonary systems, dermal plating, internal power generators, and metabolic regulators."
  },
  {
    "id": "loc-left-arm",
    "name": "Left Arm",
    "maxNodes": 30,
    "maxSockets": 3,
    "baseSP": 30,
    "isHardened": false,
    "description": "Hand, forearm, shoulder servo, concealed tools, weapon hardpoints, and smart-link interfaces.",
    "category": "body_location",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Left Arm\n\n**Category**: BODY LOCATION\n\n## Description\nHand, forearm, shoulder servo, concealed tools, weapon hardpoints, and smart-link interfaces."
  },
  {
    "id": "loc-right-arm",
    "name": "Right Arm",
    "maxNodes": 30,
    "maxSockets": 3,
    "baseSP": 30,
    "isHardened": false,
    "description": "Hand, forearm, shoulder servo, weapon mounts, recoil compensators, and manipulator tools.",
    "category": "body_location",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Right Arm\n\n**Category**: BODY LOCATION\n\n## Description\nHand, forearm, shoulder servo, weapon mounts, recoil compensators, and manipulator tools."
  },
  {
    "id": "loc-left-leg",
    "name": "Left Leg",
    "maxNodes": 40,
    "maxSockets": 4,
    "baseSP": 40,
    "isHardened": false,
    "description": "Foot, ankle, shin, thigh, hydraulic jump boosters, kinetic dampeners, and speed servomotors.",
    "category": "body_location",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Left Leg\n\n**Category**: BODY LOCATION\n\n## Description\nFoot, ankle, shin, thigh, hydraulic jump boosters, kinetic dampeners, and speed servomotors."
  },
  {
    "id": "loc-right-leg",
    "name": "Right Leg",
    "maxNodes": 40,
    "maxSockets": 4,
    "baseSP": 40,
    "isHardened": false,
    "description": "Foot, ankle, shin, thigh, hydraulic jump boosters, kinetic dampeners, and speed servomotors.",
    "category": "body_location",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Right Leg\n\n**Category**: BODY LOCATION\n\n## Description\nFoot, ankle, shin, thigh, hydraulic jump boosters, kinetic dampeners, and speed servomotors."
  },
  {
    "id": "loc-systemic",
    "name": "Full Body / Systemic",
    "maxNodes": 200,
    "maxSockets": 20,
    "baseSP": 260,
    "isHardened": false,
    "description": "System-wide vascular networks, full-body nano-colonies, and total synthetic chassis replacements.",
    "category": "body_location",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Full Body / Systemic\n\n**Category**: BODY LOCATION\n\n## Description\nSystem-wide vascular networks, full-body nano-colonies, and total synthetic chassis replacements."
  },
  {
    "id": "loc-tail",
    "name": "Tail / Auxiliary Appendage",
    "maxNodes": 20,
    "maxSockets": 2,
    "baseSP": 20,
    "isHardened": false,
    "description": "Prehensile tail, stinger mechanism, balancing gyro, or third manipulator arm.",
    "category": "body_location",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Tail / Auxiliary Appendage\n\n**Category**: BODY LOCATION\n\n## Description\nPrehensile tail, stinger mechanism, balancing gyro, or third manipulator arm."
  },
  {
    "id": "loc-wings",
    "name": "Wings / Flight Assembly",
    "maxNodes": 30,
    "maxSockets": 3,
    "baseSP": 30,
    "isHardened": false,
    "description": "Retractable glider wings, micro-thrusters, anti-grav levitation vanes, and atmospheric repulsors.",
    "category": "body_location",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Wings / Flight Assembly\n\n**Category**: BODY LOCATION\n\n## Description\nRetractable glider wings, micro-thrusters, anti-grav levitation vanes, and atmospheric repulsors."
  },
  {
    "id": "loc-subdermal",
    "name": "Subdermal Sheath / Vascular",
    "maxNodes": 50,
    "maxSockets": 5,
    "baseSP": 50,
    "isHardened": false,
    "description": "Subcutaneous protective sheath, subdermal armor weave, vascular nanites, and pigment shift layers.",
    "category": "body_location",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Subdermal Sheath / Vascular\n\n**Category**: BODY LOCATION\n\n## Description\nSubcutaneous protective sheath, subdermal armor weave, vascular nanites, and pigment shift layers."
  }
];

export const DEFAULT_AREA_PATTERNS = [
  {
    "id": "area-single-target",
    "name": "Single Target (+0 DC)",
    "dcMod": 0,
    "description": "Affects exactly one targeted creature or individual object with pinpoint precision.",
    "category": "area",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Single Target (+0 DC)\n\n**Category**: AREA\n\n## Description\nAffects exactly one targeted creature or individual object with pinpoint precision."
  },
  {
    "id": "area-line-ray",
    "name": "Line / Ray (5ft wide) (+0 DC)",
    "dcMod": 0,
    "description": "Projects a narrow 5-foot-wide linear beam or projectile path along the line of fire.",
    "category": "area",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Line / Ray (5ft wide) (+0 DC)\n\n**Category**: AREA\n\n## Description\nProjects a narrow 5-foot-wide linear beam or projectile path along the line of fire."
  },
  {
    "id": "area-small-burst",
    "name": "Small Burst (10ft Radius) (+2 DC)",
    "dcMod": 2,
    "description": "Expands into a 10-foot radius sphere covering a standard room, doorway, or vehicle interior.",
    "category": "area",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Small Burst (10ft Radius) (+2 DC)\n\n**Category**: AREA\n\n## Description\nExpands into a 10-foot radius sphere covering a standard room, doorway, or vehicle interior."
  },
  {
    "id": "area-medium-burst",
    "name": "Medium Burst (20ft Radius) (+5 DC)",
    "dcMod": 5,
    "description": "Detonates in a 20-foot radius sphere covering an entire hall, street intersection, or squad formation.",
    "category": "area",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Medium Burst (20ft Radius) (+5 DC)\n\n**Category**: AREA\n\n## Description\nDetonates in a 20-foot radius sphere covering an entire hall, street intersection, or squad formation."
  },
  {
    "id": "area-cone",
    "name": "Cone / Emanation (+5 DC)",
    "dcMod": 5,
    "description": "Spreads outward from the caster hands or muzzle in a widening cone equal to range length.",
    "category": "area",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Cone / Emanation (+5 DC)\n\n**Category**: AREA\n\n## Description\nSpreads outward from the caster hands or muzzle in a widening cone equal to range length."
  },
  {
    "id": "area-large-burst",
    "name": "Large Burst (50ft+ Radius) (+10 DC)",
    "dcMod": 10,
    "description": "Massive battlefield detonation blanketing an entire district or facility wing.",
    "category": "area",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Large Burst (50ft+ Radius) (+10 DC)\n\n**Category**: AREA\n\n## Description\nMassive battlefield detonation blanketing an entire district or facility wing."
  },
  {
    "id": "area-wall",
    "name": "Wall / Barrier (+5 DC)",
    "dcMod": 5,
    "description": "Manifests a continuous physical or energy barrier up to 10ft high by 30ft long.",
    "category": "area",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Wall / Barrier (+5 DC)\n\n**Category**: AREA\n\n## Description\nManifests a continuous physical or energy barrier up to 10ft high by 30ft long."
  },
  {
    "id": "area-cylinder",
    "name": "Cylinder / Pillar (+5 DC)",
    "dcMod": 5,
    "description": "Calls down a 10ft radius, 40ft high vertical pillar of energy or gravitational force.",
    "category": "area",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Cylinder / Pillar (+5 DC)\n\n**Category**: AREA\n\n## Description\nCalls down a 10ft radius, 40ft high vertical pillar of energy or gravitational force."
  },
  {
    "id": "area-selective",
    "name": "Selective Shaping (+5 DC)",
    "dcMod": 5,
    "description": "Allows the user to sculpt the area of effect, carving out safe zones for allies.",
    "category": "area",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Selective Shaping (+5 DC)\n\n**Category**: AREA\n\n## Description\nAllows the user to sculpt the area of effect, carving out safe zones for allies."
  },
  {
    "id": "area-aura",
    "name": "Aura / Pulse (+3 DC)",
    "dcMod": 3,
    "description": "Radiates in a continuous 10-foot emanation surrounding the user as they move.",
    "category": "area",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Aura / Pulse (+3 DC)\n\n**Category**: AREA\n\n## Description\nRadiates in a continuous 10-foot emanation surrounding the user as they move."
  },
  {
    "id": "area-chain",
    "name": "Chain / Arcing (+4 DC)",
    "dcMod": 4,
    "description": "Arcs from the primary target to up to 3 secondary targets within 15 feet.",
    "category": "area",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Chain / Arcing (+4 DC)\n\n**Category**: AREA\n\n## Description\nArcs from the primary target to up to 3 secondary targets within 15 feet."
  }
];

export const DEFAULT_EFFECT_TYPES = [
  {
    "id": "effect-kinetic-bludgeon",
    "name": "Kinetic (Bludgeoning)",
    "type": "Physical",
    "description": "Crushing impact trauma. Subject to standard physical Armor Damage Resistance (DR).",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Kinetic (Bludgeoning)\n\n**Category**: EFFECT\n\n## Description\nCrushing impact trauma. Subject to standard physical Armor Damage Resistance (DR)."
  },
  {
    "id": "effect-kinetic-pierce",
    "name": "Kinetic (Piercing)",
    "type": "Physical",
    "description": "High-velocity puncturing force optimized for armor penetration.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Kinetic (Piercing)\n\n**Category**: EFFECT\n\n## Description\nHigh-velocity puncturing force optimized for armor penetration."
  },
  {
    "id": "effect-kinetic-slash",
    "name": "Kinetic (Slashing)",
    "type": "Physical",
    "description": "Severing and lacerating physical edge damage capable of inflicting deep bleeding wounds.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Kinetic (Slashing)\n\n**Category**: EFFECT\n\n## Description\nSevering and lacerating physical edge damage capable of inflicting deep bleeding wounds."
  },
  {
    "id": "effect-force",
    "name": "Force / Aether",
    "type": "Metaphysical",
    "description": "Pure condensed kinetic pressure that bypasses 50% of target physical Armor DR.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Force / Aether\n\n**Category**: EFFECT\n\n## Description\nPure condensed kinetic pressure that bypasses 50% of target physical Armor DR."
  },
  {
    "id": "effect-pyro",
    "name": "Thermal (Pyro / Fire)",
    "type": "Energy",
    "description": "Superheated plasma and combustion. Triggers secondary burning status effects.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Thermal (Pyro / Fire)\n\n**Category**: EFFECT\n\n## Description\nSuperheated plasma and combustion. Triggers secondary burning status effects."
  },
  {
    "id": "effect-cryo",
    "name": "Thermal (Cryo / Cold)",
    "type": "Energy",
    "description": "Sub-zero thermal drain. Triggers frostbite, slow, and brittle structure effects.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Thermal (Cryo / Cold)\n\n**Category**: EFFECT\n\n## Description\nSub-zero thermal drain. Triggers frostbite, slow, and brittle structure effects."
  },
  {
    "id": "effect-voltic",
    "name": "Voltic (Electrical / EMP)",
    "type": "Energy",
    "description": "High-voltage ionization. Deals extra damage to synthetic chassis and disrupts electronics.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Voltic (Electrical / EMP)\n\n**Category**: EFFECT\n\n## Description\nHigh-voltage ionization. Deals extra damage to synthetic chassis and disrupts electronics."
  },
  {
    "id": "effect-sonic",
    "name": "Sonic / Resonant",
    "type": "Energy",
    "description": "Harmonic vibrational trauma that bypasses rigid armor plates to shatter internal organs.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Sonic / Resonant\n\n**Category**: EFFECT\n\n## Description\nHarmonic vibrational trauma that bypasses rigid armor plates to shatter internal organs."
  },
  {
    "id": "effect-corrosive",
    "name": "Corrosive (Acid / Chemical)",
    "type": "Chemical",
    "description": "Degrades armor Structure Points and inflicts lingering damage over time.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Corrosive (Acid / Chemical)\n\n**Category**: EFFECT\n\n## Description\nDegrades armor Structure Points and inflicts lingering damage over time."
  },
  {
    "id": "effect-radiant",
    "name": "Radiant (Light / Solar)",
    "type": "Energy",
    "description": "Coherent photons and holy solar energy capable of blinding targets and purging corruptions.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Radiant (Light / Solar)\n\n**Category**: EFFECT\n\n## Description\nCoherent photons and holy solar energy capable of blinding targets and purging corruptions."
  },
  {
    "id": "effect-void",
    "name": "Void (Graviton / Entropy)",
    "type": "Metaphysical",
    "description": "Dark energy and spatial compression that pulls targets and crushes matter.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Void (Graviton / Entropy)\n\n**Category**: EFFECT\n\n## Description\nDark energy and spatial compression that pulls targets and crushes matter."
  },
  {
    "id": "effect-psychic",
    "name": "Psychic / Psionic",
    "type": "Metaphysical",
    "description": "Direct mental shockwave attacking neural pathways, bypassing all physical armor.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Psychic / Psionic\n\n**Category**: EFFECT\n\n## Description\nDirect mental shockwave attacking neural pathways, bypassing all physical armor."
  },
  {
    "id": "effect-disintegration",
    "name": "Disintegration",
    "type": "Exotic",
    "description": "Breaks atomic bonds directly, dissolving matter into ash upon reaching 0 SP.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Disintegration\n\n**Category**: EFFECT\n\n## Description\nBreaks atomic bonds directly, dissolving matter into ash upon reaching 0 SP."
  },
  {
    "id": "effect-temporal",
    "name": "Temporal / Chrono",
    "type": "Metaphysical",
    "description": "Alters local time-flow, inflicting stasis, slowing reactions, or rapid cellular aging.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Temporal / Chrono\n\n**Category**: EFFECT\n\n## Description\nAlters local time-flow, inflicting stasis, slowing reactions, or rapid cellular aging."
  },
  {
    "id": "effect-spatial",
    "name": "Spatial / Warp",
    "type": "Metaphysical",
    "description": "Rips local dimensional geometry to teleport, displace, or shear physical objects.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Spatial / Warp\n\n**Category**: EFFECT\n\n## Description\nRips local dimensional geometry to teleport, displace, or shear physical objects."
  },
  {
    "id": "effect-biological",
    "name": "Biological (Toxin / Disease)",
    "type": "Biological",
    "description": "Neurotoxins, hemotoxins, and cellular mutagens requiring Fortitude saves.",
    "category": "effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Biological (Toxin / Disease)\n\n**Category**: EFFECT\n\n## Description\nNeurotoxins, hemotoxins, and cellular mutagens requiring Fortitude saves."
  }
];

export const DEFAULT_RANGES = [
  {
    "id": "range-self-touch",
    "name": "Self / Touch (-2 DC)",
    "dcMod": -2,
    "distance": "Touch / 0 ft",
    "description": "Requires physical direct contact with the target or applies internally to the user.",
    "category": "range",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Self / Touch (-2 DC)\n\n**Category**: RANGE\n\n## Description\nRequires physical direct contact with the target or applies internally to the user."
  },
  {
    "id": "range-close",
    "name": "Close (25ft) (+0 DC)",
    "dcMod": 0,
    "distance": "25 ft + 5ft/2 Ranks",
    "description": "Short tactical distance; ideal for standard room clearing and close combat.",
    "category": "range",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Close (25ft) (+0 DC)\n\n**Category**: RANGE\n\n## Description\nShort tactical distance; ideal for standard room clearing and close combat."
  },
  {
    "id": "range-medium",
    "name": "Medium (100ft) (+2 DC)",
    "dcMod": 2,
    "distance": "100 ft + 10ft/Rank",
    "description": "Standard mid-range engagement distance across streets and open fields.",
    "category": "range",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Medium (100ft) (+2 DC)\n\n**Category**: RANGE\n\n## Description\nStandard mid-range engagement distance across streets and open fields."
  },
  {
    "id": "range-long",
    "name": "Long (400ft) (+5 DC)",
    "dcMod": 5,
    "distance": "400 ft + 40ft/Rank",
    "description": "Long-range engagement distance across large battlefields and perimeter zones.",
    "category": "range",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Long (400ft) (+5 DC)\n\n**Category**: RANGE\n\n## Description\nLong-range engagement distance across large battlefields and perimeter zones."
  },
  {
    "id": "range-extreme",
    "name": "Extreme / Sniper (1,000ft+) (+8 DC)",
    "dcMod": 8,
    "distance": "1,000+ ft",
    "description": "Extreme long-range fire requiring dedicated optics or stabilized targeting mounts.",
    "category": "range",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Extreme / Sniper (1,000ft+) (+8 DC)\n\n**Category**: RANGE\n\n## Description\nExtreme long-range fire requiring dedicated optics or stabilized targeting mounts."
  },
  {
    "id": "range-line-of-sight",
    "name": "Line of Sight (+10 DC)",
    "dcMod": 10,
    "distance": "Visual Horizon",
    "description": "Any visible target within uninterrupted visual line of sight.",
    "category": "range",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Line of Sight (+10 DC)\n\n**Category**: RANGE\n\n## Description\nAny visible target within uninterrupted visual line of sight."
  },
  {
    "id": "range-planetary",
    "name": "Planetary / Global (+15 DC)",
    "dcMod": 15,
    "distance": "Planetary Surface",
    "description": "Reaches anywhere across the curvature of the planetary body via orbital relays.",
    "category": "range",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Planetary / Global (+15 DC)\n\n**Category**: RANGE\n\n## Description\nReaches anywhere across the curvature of the planetary body via orbital relays."
  },
  {
    "id": "range-interplanetary",
    "name": "Interplanetary / System (+20 DC)",
    "dcMod": 20,
    "distance": "Star System",
    "description": "Transmits across astronomical units within a local star system.",
    "category": "range",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Interplanetary / System (+20 DC)\n\n**Category**: RANGE\n\n## Description\nTransmits across astronomical units within a local star system."
  },
  {
    "id": "range-planar",
    "name": "Planar / Dimensional (+25 DC)",
    "dcMod": 25,
    "distance": "Multiverse / Aether",
    "description": "Crosses dimensional rifts and connects between parallel reality planes.",
    "category": "range",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Planar / Dimensional (+25 DC)\n\n**Category**: RANGE\n\n## Description\nCrosses dimensional rifts and connects between parallel reality planes."
  }
];

export const DEFAULT_TARGET_SPECIFICATIONS = [
  {
    "id": "target-self",
    "name": "Self Only",
    "description": "The power or module functions exclusively on the user chassis.",
    "category": "target",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Self Only\n\n**Category**: TARGET\n\n## Description\nThe power or module functions exclusively on the user chassis."
  },
  {
    "id": "target-single-creature",
    "name": "Single Creature",
    "description": "Targets any single biological or synthetic entity within range.",
    "category": "target",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Single Creature\n\n**Category**: TARGET\n\n## Description\nTargets any single biological or synthetic entity within range."
  },
  {
    "id": "target-willing",
    "name": "Willing Creature",
    "description": "Requires the target voluntary consent; fails automatically against resistant minds.",
    "category": "target",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Willing Creature\n\n**Category**: TARGET\n\n## Description\nRequires the target voluntary consent; fails automatically against resistant minds."
  },
  {
    "id": "target-hostile",
    "name": "Unwilling / Hostile Creature",
    "description": "Direct offensive targeting requiring defense check vs Attune/Skill DC.",
    "category": "target",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Unwilling / Hostile Creature\n\n**Category**: TARGET\n\n## Description\nDirect offensive targeting requiring defense check vs Attune/Skill DC."
  },
  {
    "id": "target-point-in-space",
    "name": "Point in Space",
    "description": "A designated coordinate in three-dimensional space for area origins or portals.",
    "category": "target",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Point in Space\n\n**Category**: TARGET\n\n## Description\nA designated coordinate in three-dimensional space for area origins or portals."
  },
  {
    "id": "target-object",
    "name": "Object / Construct",
    "description": "Targets inanimate hardware, structural modules, weapons, or vehicles.",
    "category": "target",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Object / Construct\n\n**Category**: TARGET\n\n## Description\nTargets inanimate hardware, structural modules, weapons, or vehicles."
  },
  {
    "id": "target-area-surface",
    "name": "Area / Surface",
    "description": "Covers a physical wall, floor, bulkhead, or planetary terrain zone.",
    "category": "target",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Area / Surface\n\n**Category**: TARGET\n\n## Description\nCovers a physical wall, floor, bulkhead, or planetary terrain zone."
  },
  {
    "id": "target-mind",
    "name": "Mind / Consciousness",
    "description": "Targets neural architecture, ego matrices, or organic brains directly.",
    "category": "target",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Mind / Consciousness\n\n**Category**: TARGET\n\n## Description\nTargets neural architecture, ego matrices, or organic brains directly."
  },
  {
    "id": "target-spirit",
    "name": "Spirit / Soul",
    "description": "Targets the metaphysical lodestar, aura, or essence signature of a creature.",
    "category": "target",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Spirit / Soul\n\n**Category**: TARGET\n\n## Description\nTargets the metaphysical lodestar, aura, or essence signature of a creature."
  },
  {
    "id": "target-electronic",
    "name": "Electronic Device / AI Core",
    "description": "Targets computer systems, comms relays, cyberdecks, or synthetic logic circuits.",
    "category": "target",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Electronic Device / AI Core\n\n**Category**: TARGET\n\n## Description\nTargets computer systems, comms relays, cyberdecks, or synthetic logic circuits."
  }
];

export const DEFAULT_CRITICAL_EFFECTS = [
  {
    "id": "crit-stunned",
    "name": "Stunned (1 Round)",
    "description": "Target loses their next turn of actions and suffers -4 to all defenses.",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Stunned (1 Round)\n\n**Category**: CRITICAL EFFECT\n\n## Description\nTarget loses their next turn of actions and suffers -4 to all defenses."
  },
  {
    "id": "crit-bleed",
    "name": "Bleed (1d6 / round)",
    "description": "Inflicts persistent bleeding damage at the start of each turn until treated with Medical CR 15.",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Bleed (1d6 / round)\n\n**Category**: CRITICAL EFFECT\n\n## Description\nInflicts persistent bleeding damage at the start of each turn until treated with Medical CR 15."
  },
  {
    "id": "crit-disarmed",
    "name": "Disarmed",
    "description": "Target held weapon or item is knocked 15 feet away into an adjacent hex.",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Disarmed\n\n**Category**: CRITICAL EFFECT\n\n## Description\nTarget held weapon or item is knocked 15 feet away into an adjacent hex."
  },
  {
    "id": "crit-knockdown",
    "name": "Knocked Prone",
    "description": "Target is slammed into the ground, must spend movement to stand up.",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Knocked Prone\n\n**Category**: CRITICAL EFFECT\n\n## Description\nTarget is slammed into the ground, must spend movement to stand up."
  },
  {
    "id": "crit-armor-sunder",
    "name": "Armor Sundered (-2 DR)",
    "description": "Permanently reduces the target equipped armor DR by 2 points until repaired.",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Armor Sundered (-2 DR)\n\n**Category**: CRITICAL EFFECT\n\n## Description\nPermanently reduces the target equipped armor DR by 2 points until repaired."
  },
  {
    "id": "crit-severe-fracture",
    "name": "Severe Fracture (-2 Checks)",
    "description": "Broken bone or shattered joint; target suffers -2 to all physical attribute checks.",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Severe Fracture (-2 Checks)\n\n**Category**: CRITICAL EFFECT\n\n## Description\nBroken bone or shattered joint; target suffers -2 to all physical attribute checks."
  },
  {
    "id": "crit-blinding",
    "name": "Blinding Flash",
    "description": "Target is completely blinded for 1d4 rounds, suffering 50% miss chance on all attacks.",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Blinding Flash\n\n**Category**: CRITICAL EFFECT\n\n## Description\nTarget is completely blinded for 1d4 rounds, suffering 50% miss chance on all attacks."
  },
  {
    "id": "crit-amputation",
    "name": "Amputation / Dismemberment",
    "description": "A targeted limb is severed or mangled beyond function (requires cybernetic replacement).",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Amputation / Dismemberment\n\n**Category**: CRITICAL EFFECT\n\n## Description\nA targeted limb is severed or mangled beyond function (requires cybernetic replacement)."
  },
  {
    "id": "crit-weapon-destroyed",
    "name": "Weapon Destroyed",
    "description": "The opponent parrying weapon or tool suffers immediate structural catastrophic failure.",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Weapon Destroyed\n\n**Category**: CRITICAL EFFECT\n\n## Description\nThe opponent parrying weapon or tool suffers immediate structural catastrophic failure."
  },
  {
    "id": "crit-internal-hemorrhage",
    "name": "Internal Hemorrhage",
    "description": "Internal organ damage; target suffers -2 Stamina and 1d8 ongoing damage.",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Internal Hemorrhage\n\n**Category**: CRITICAL EFFECT\n\n## Description\nInternal organ damage; target suffers -2 Stamina and 1d8 ongoing damage."
  },
  {
    "id": "crit-system-shutdown",
    "name": "System Shutdown / EMP Lock",
    "description": "Synthetic chassis or cybernetics freeze for 1 round, immobilizing the target.",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# System Shutdown / EMP Lock\n\n**Category**: CRITICAL EFFECT\n\n## Description\nSynthetic chassis or cybernetics freeze for 1 round, immobilizing the target."
  },
  {
    "id": "crit-vulnerable",
    "name": "Vulnerable (+4 Incoming Attacks)",
    "description": "Target defenses are completely compromised; next attack against them gains +4 to hit.",
    "category": "critical_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Vulnerable (+4 Incoming Attacks)\n\n**Category**: CRITICAL EFFECT\n\n## Description\nTarget defenses are completely compromised; next attack against them gains +4 to hit."
  }
];

export const DEFAULT_CRITICAL_SUCCESS_EFFECTS = [
  {
    "id": "crit_succ-double-damage",
    "name": "Double Base Damage",
    "description": "All base weapon damage dice are doubled before applying bonuses.",
    "category": "critical_success_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Double Base Damage\n\n**Category**: CRITICAL SUCCESS EFFECT\n\n## Description\nAll base weapon damage dice are doubled before applying bonuses."
  },
  {
    "id": "crit_succ-max-damage",
    "name": "Maximum Variable Damage",
    "description": "All damage dice roll their maximum possible numeric values automatically.",
    "category": "critical_success_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Maximum Variable Damage\n\n**Category**: CRITICAL SUCCESS EFFECT\n\n## Description\nAll damage dice roll their maximum possible numeric values automatically."
  },
  {
    "id": "crit_succ-free-action",
    "name": "Free Action Refund",
    "description": "The action cost of this invocation or attack is fully refunded, granting an immediate bonus action.",
    "category": "critical_success_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Free Action Refund\n\n**Category**: CRITICAL SUCCESS EFFECT\n\n## Description\nThe action cost of this invocation or attack is fully refunded, granting an immediate bonus action."
  },
  {
    "id": "crit_succ-elemental-surge",
    "name": "Lingering Elemental Surge",
    "description": "Ignites a lingering elemental hazard dealing 1d6 damage in the target hex for 3 rounds.",
    "category": "critical_success_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Lingering Elemental Surge\n\n**Category**: CRITICAL SUCCESS EFFECT\n\n## Description\nIgnites a lingering elemental hazard dealing 1d6 damage in the target hex for 3 rounds."
  },
  {
    "id": "crit_succ-instant-pin",
    "name": "Instant Pin / Grapple",
    "description": "Target is immediately restrained and pinned without requiring a secondary grapple roll.",
    "category": "critical_success_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Instant Pin / Grapple\n\n**Category**: CRITICAL SUCCESS EFFECT\n\n## Description\nTarget is immediately restrained and pinned without requiring a secondary grapple roll."
  },
  {
    "id": "crit_succ-overwhelming-ap",
    "name": "Overwhelming Penetration (Ignore All DR)",
    "description": "The attack completely punches through all armor, ignoring 100% of the target DR.",
    "category": "critical_success_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Overwhelming Penetration (Ignore All DR)\n\n**Category**: CRITICAL SUCCESS EFFECT\n\n## Description\nThe attack completely punches through all armor, ignoring 100% of the target DR."
  },
  {
    "id": "crit_succ-extended-duration",
    "name": "Extended Duration (x2)",
    "description": "The duration of the buff or hazard is doubled without additional resource cost.",
    "category": "critical_success_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Extended Duration (x2)\n\n**Category**: CRITICAL SUCCESS EFFECT\n\n## Description\nThe duration of the buff or hazard is doubled without additional resource cost."
  },
  {
    "id": "crit_succ-resource-refund",
    "name": "Resource / Focus Refund",
    "description": "Refunds all spent Essence, Focus, or ammunition expended during the action.",
    "category": "critical_success_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Resource / Focus Refund\n\n**Category**: CRITICAL SUCCESS EFFECT\n\n## Description\nRefunds all spent Essence, Focus, or ammunition expended during the action."
  }
];

export const DEFAULT_CRITICAL_FAILURE_EFFECTS = [
  {
    "id": "crit_fail-jammed",
    "name": "Weapon Jammed",
    "description": "The firearm mechanism or actuator jams; requires 1 full Action to clear.",
    "category": "critical_failure_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Weapon Jammed\n\n**Category**: CRITICAL FAILURE EFFECT\n\n## Description\nThe firearm mechanism or actuator jams; requires 1 full Action to clear."
  },
  {
    "id": "crit_fail-misfire",
    "name": "Weapon Misfire / Self Damage",
    "description": "The weapon backfires, dealing half base damage directly to the user.",
    "category": "critical_failure_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Weapon Misfire / Self Damage\n\n**Category**: CRITICAL FAILURE EFFECT\n\n## Description\nThe weapon backfires, dealing half base damage directly to the user."
  },
  {
    "id": "crit_fail-overheat",
    "name": "Energy Overheat / Venting",
    "description": "Energy cell or barrel vents superheated gas; weapon cannot fire for 1 round.",
    "category": "critical_failure_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Energy Overheat / Venting\n\n**Category**: CRITICAL FAILURE EFFECT\n\n## Description\nEnergy cell or barrel vents superheated gas; weapon cannot fire for 1 round."
  },
  {
    "id": "crit_fail-prone",
    "name": "Loss of Balance / Prone",
    "description": "User trips or overextends, falling prone in their current hex.",
    "category": "critical_failure_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Loss of Balance / Prone\n\n**Category**: CRITICAL FAILURE EFFECT\n\n## Description\nUser trips or overextends, falling prone in their current hex."
  },
  {
    "id": "crit_fail-fumble",
    "name": "Fumble / Drop Weapon",
    "description": "User loses their grip, dropping the weapon 5 feet away.",
    "category": "critical_failure_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Fumble / Drop Weapon\n\n**Category**: CRITICAL FAILURE EFFECT\n\n## Description\nUser loses their grip, dropping the weapon 5 feet away."
  },
  {
    "id": "crit_fail-meta-backlash",
    "name": "Meta Backlash (The Burn)",
    "description": "Metaphysical feedback inflicts 1d6 unpreventable damage directly to user Health.",
    "category": "critical_failure_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Meta Backlash (The Burn)\n\n**Category**: CRITICAL FAILURE EFFECT\n\n## Description\nMetaphysical feedback inflicts 1d6 unpreventable damage directly to user Health."
  },
  {
    "id": "crit_fail-power-depleted",
    "name": "Power Cell Depleted",
    "description": "Battery or capacitor burns out instantly, requiring a fresh reload.",
    "category": "critical_failure_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Power Cell Depleted\n\n**Category**: CRITICAL FAILURE EFFECT\n\n## Description\nBattery or capacitor burns out instantly, requiring a fresh reload."
  },
  {
    "id": "crit_fail-disoriented",
    "name": "Disoriented (-2 to Next Roll)",
    "description": "Sudden sensory disorientation imposes -2 on the user next turn action.",
    "category": "critical_failure_effect",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Disoriented (-2 to Next Roll)\n\n**Category**: CRITICAL FAILURE EFFECT\n\n## Description\nSudden sensory disorientation imposes -2 on the user next turn action."
  }
];

export const DEFAULT_MATERIALS = [
  {
    "id": "mat-hide-bone",
    "name": "Hide & Bone (TL 0)",
    "tl": 0,
    "drPercent": 25,
    "spMult": 0.25,
    "description": "Primitive natural hides, cured sinew, and carved bone plating. Degrades under sustained impact.",
    "category": "material",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Hide & Bone (TL 0)\n\n**Category**: MATERIAL\n\n## Description\nPrimitive natural hides, cured sinew, and carved bone plating. Degrades under sustained impact."
  },
  {
    "id": "mat-steel",
    "name": "Iron & Steel Plate (TL 1)",
    "tl": 1,
    "drPercent": 50,
    "spMult": 0.5,
    "description": "Forged high-carbon steel plates. Heavy mass imposes minor agility check penalties.",
    "category": "material",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Iron & Steel Plate (TL 1)\n\n**Category**: MATERIAL\n\n## Description\nForged high-carbon steel plates. Heavy mass imposes minor agility check penalties."
  },
  {
    "id": "mat-kevlar-ceramic",
    "name": "Kevlar & Ceramic Alloy (TL 2)",
    "tl": 2,
    "drPercent": 75,
    "spMult": 1,
    "description": "Modern ballistic synthetic weave with strike-face ceramic tiles. Standard kinetic resistance.",
    "category": "material",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Kevlar & Ceramic Alloy (TL 2)\n\n**Category**: MATERIAL\n\n## Description\nModern ballistic synthetic weave with strike-face ceramic tiles. Standard kinetic resistance."
  },
  {
    "id": "mat-plasteel",
    "name": "Plasteel & Impact Gel (TL 3)",
    "tl": 3,
    "drPercent": 100,
    "spMult": 1.5,
    "description": "Standard space-age composite. Lightweight, hermetically sealed, with non-Newtonian impact gel buffers.",
    "category": "material",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Plasteel & Impact Gel (TL 3)\n\n**Category**: MATERIAL\n\n## Description\nStandard space-age composite. Lightweight, hermetically sealed, with non-Newtonian impact gel buffers."
  },
  {
    "id": "mat-nanocarbon",
    "name": "Nanocarbon & Phase-Shift (TL 4)",
    "tl": 4,
    "drPercent": 125,
    "spMult": 2,
    "description": "Molecularly aligned carbon nanotubes with self-repairing lattice (regenerates 1 SP/hour).",
    "category": "material",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Nanocarbon & Phase-Shift (TL 4)\n\n**Category**: MATERIAL\n\n## Description\nMolecularly aligned carbon nanotubes with self-repairing lattice (regenerates 1 SP/hour)."
  },
  {
    "id": "mat-polymatter",
    "name": "Polymatter & Hard-Light (TL 5)",
    "tl": 5,
    "drPercent": 150,
    "spMult": 2.5,
    "description": "Precursor programmable matter and solid photonic lattices. Weightless and morphic.",
    "category": "material",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Polymatter & Hard-Light (TL 5)\n\n**Category**: MATERIAL\n\n## Description\nPrecursor programmable matter and solid photonic lattices. Weightless and morphic."
  },
  {
    "id": "mat-aether-glass",
    "name": "Aether-Infused Glass",
    "tl": 4,
    "drPercent": 110,
    "spMult": 1.8,
    "description": "Resonant crystalline silica that conducts metaphysical energies and deflects psychic trauma.",
    "category": "material",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Aether-Infused Glass\n\n**Category**: MATERIAL\n\n## Description\nResonant crystalline silica that conducts metaphysical energies and deflects psychic trauma."
  },
  {
    "id": "mat-chitin-composite",
    "name": "Chitin Composite",
    "tl": 3,
    "drPercent": 105,
    "spMult": 1.6,
    "description": "Kitin-inspired bio-ceramic exoskeleton plating with self-knitting biological fibers.",
    "category": "material",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Chitin Composite\n\n**Category**: MATERIAL\n\n## Description\nKitin-inspired bio-ceramic exoskeleton plating with self-knitting biological fibers."
  },
  {
    "id": "mat-void-titanium",
    "name": "Void-Toughened Titanium",
    "tl": 4,
    "drPercent": 135,
    "spMult": 2.2,
    "description": "Tempered in the high-gravity vacuum of deep space void rifts, highly resistant to radiation.",
    "category": "material",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Void-Toughened Titanium\n\n**Category**: MATERIAL\n\n## Description\nTempered in the high-gravity vacuum of deep space void rifts, highly resistant to radiation."
  },
  {
    "id": "mat-adamantine",
    "name": "Adamantine Alloy",
    "tl": 5,
    "drPercent": 160,
    "spMult": 3,
    "description": "Ultra-dense celestial metal that renders armor impervious to critical sundering.",
    "category": "material",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Adamantine Alloy\n\n**Category**: MATERIAL\n\n## Description\nUltra-dense celestial metal that renders armor impervious to critical sundering."
  }
];

export const DEFAULT_RESISTANCES = [
  {
    "id": "res-kinetic",
    "name": "Kinetic Resistance",
    "description": "Reduces damage from ballistic bullets, slashing blades, and crushing bludgeons.",
    "category": "resistance",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Kinetic Resistance\n\n**Category**: RESISTANCE\n\n## Description\nReduces damage from ballistic bullets, slashing blades, and crushing bludgeons."
  },
  {
    "id": "res-energy",
    "name": "Energy / Laser Resistance",
    "description": "Deflects and dissipates coherent light, blasters, and directed-energy beams.",
    "category": "resistance",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Energy / Laser Resistance\n\n**Category**: RESISTANCE\n\n## Description\nDeflects and dissipates coherent light, blasters, and directed-energy beams."
  },
  {
    "id": "res-thermal",
    "name": "Thermal / Fire Resistance",
    "description": "Insulates against superheated plasma, incendiary munitions, and open flame.",
    "category": "resistance",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Thermal / Fire Resistance\n\n**Category**: RESISTANCE\n\n## Description\nInsulates against superheated plasma, incendiary munitions, and open flame."
  },
  {
    "id": "res-cryo",
    "name": "Cryo / Cold Resistance",
    "description": "Thermal barriers preventing freeze damage, hypothermia, and brittle fracture.",
    "category": "resistance",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Cryo / Cold Resistance\n\n**Category**: RESISTANCE\n\n## Description\nThermal barriers preventing freeze damage, hypothermia, and brittle fracture."
  },
  {
    "id": "res-voltic",
    "name": "Voltic / EMP Resistance",
    "description": "Faraday lining that insulates synthetic chassis and cybernetics from electrical shock.",
    "category": "resistance",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Voltic / EMP Resistance\n\n**Category**: RESISTANCE\n\n## Description\nFaraday lining that insulates synthetic chassis and cybernetics from electrical shock."
  },
  {
    "id": "res-corrosive",
    "name": "Corrosive / Acid Resistance",
    "description": "Chemically inert coating preventing chemical dissolution and lingering burn.",
    "category": "resistance",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Corrosive / Acid Resistance\n\n**Category**: RESISTANCE\n\n## Description\nChemically inert coating preventing chemical dissolution and lingering burn."
  },
  {
    "id": "res-sonic",
    "name": "Sonic Resistance",
    "description": "Dampening foam and acoustic baffles that neutralize vibrational frequencies.",
    "category": "resistance",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Sonic Resistance\n\n**Category**: RESISTANCE\n\n## Description\nDampening foam and acoustic baffles that neutralize vibrational frequencies."
  },
  {
    "id": "res-psychic",
    "name": "Metaphysical / Psychic Resistance",
    "description": "Psi-shielding and lead-crystal lattice that protects the mind from mental attacks.",
    "category": "resistance",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Metaphysical / Psychic Resistance\n\n**Category**: RESISTANCE\n\n## Description\nPsi-shielding and lead-crystal lattice that protects the mind from mental attacks."
  },
  {
    "id": "res-environmental",
    "name": "Environmental Seal (Vacuum/Toxin)",
    "description": "Full hermetic life-support seal protecting against vacuum, zero pressure, and bio-hazards.",
    "category": "resistance",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Environmental Seal (Vacuum/Toxin)\n\n**Category**: RESISTANCE\n\n## Description\nFull hermetic life-support seal protecting against vacuum, zero pressure, and bio-hazards."
  },
  {
    "id": "res-radiation",
    "name": "Radiation Shielding",
    "description": "Dense lead and magnetic shielding protecting against cosmic rays and fallout.",
    "category": "resistance",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Radiation Shielding\n\n**Category**: RESISTANCE\n\n## Description\nDense lead and magnetic shielding protecting against cosmic rays and fallout."
  }
];

export const DEFAULT_MODES = [
  {
    "id": "mode-semi-auto",
    "name": "Semi-Automatic (1 Shot)",
    "description": "Fires one precise projectile per attack action, maximizing accuracy.",
    "category": "mode",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Semi-Automatic (1 Shot)\n\n**Category**: MODE\n\n## Description\nFires one precise projectile per attack action, maximizing accuracy."
  },
  {
    "id": "mode-burst",
    "name": "3-Round Burst",
    "description": "Fires a rapid 3-round burst, granting +2 to strike against a single target.",
    "category": "mode",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# 3-Round Burst\n\n**Category**: MODE\n\n## Description\nFires a rapid 3-round burst, granting +2 to strike against a single target."
  },
  {
    "id": "mode-full-auto",
    "name": "Full Automatic",
    "description": "Continuous automatic fire capable of laying down area suppression or multi-target sweeps.",
    "category": "mode",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Full Automatic\n\n**Category**: MODE\n\n## Description\nContinuous automatic fire capable of laying down area suppression or multi-target sweeps."
  },
  {
    "id": "mode-overcharge",
    "name": "Overcharge Mode",
    "description": "Draws double power to add +1d8 extra damage, generating heat.",
    "category": "mode",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Overcharge Mode\n\n**Category**: MODE\n\n## Description\nDraws double power to add +1d8 extra damage, generating heat."
  },
  {
    "id": "mode-stun",
    "name": "Stun / Non-Lethal Setting",
    "description": "Toggles weapon output to electrical non-lethal subdual damage.",
    "category": "mode",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Stun / Non-Lethal Setting\n\n**Category**: MODE\n\n## Description\nToggles weapon output to electrical non-lethal subdual damage."
  },
  {
    "id": "mode-precision",
    "name": "Precision Aim Mode",
    "description": "Requires a steady stance; grants +4 accuracy and +1 Penetration on next shot.",
    "category": "mode",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Precision Aim Mode\n\n**Category**: MODE\n\n## Description\nRequires a steady stance; grants +4 accuracy and +1 Penetration on next shot."
  },
  {
    "id": "mode-scatter",
    "name": "Scatter / Wide Spread",
    "description": "Toggles muzzle choke to hit all targets in a 10ft frontal cone.",
    "category": "mode",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Scatter / Wide Spread\n\n**Category**: MODE\n\n## Description\nToggles muzzle choke to hit all targets in a 10ft frontal cone."
  },
  {
    "id": "mode-brace",
    "name": "Defensive Brace",
    "description": "Armor locks joints in place, granting +4 DR and immunity to knockdown at the cost of movement.",
    "category": "mode",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Defensive Brace\n\n**Category**: MODE\n\n## Description\nArmor locks joints in place, granting +4 DR and immunity to knockdown at the cost of movement."
  }
];

export const DEFAULT_SPECIALS = [
  {
    "id": "spec-armor-piercing",
    "name": "Armor Piercing (AP)",
    "description": "Weapon projectiles or edges bypass a designated amount of target Armor DR.",
    "category": "special",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Armor Piercing (AP)\n\n**Category**: SPECIAL\n\n## Description\nWeapon projectiles or edges bypass a designated amount of target Armor DR."
  },
  {
    "id": "spec-concealable",
    "name": "Concealable",
    "description": "Compact frame grants +4 to Stealth checks when concealing on a person.",
    "category": "special",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Concealable\n\n**Category**: SPECIAL\n\n## Description\nCompact frame grants +4 to Stealth checks when concealing on a person."
  },
  {
    "id": "spec-silent",
    "name": "Silent",
    "description": "Fires with zero acoustic or flash signature; requires CR 20 Perception to pinpoint.",
    "category": "special",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Silent\n\n**Category**: SPECIAL\n\n## Description\nFires with zero acoustic or flash signature; requires CR 20 Perception to pinpoint."
  },
  {
    "id": "spec-high-recoil",
    "name": "High Recoil",
    "description": "Requires Strength 2+ to wield without suffering -2 penalties on follow-up shots.",
    "category": "special",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# High Recoil\n\n**Category**: SPECIAL\n\n## Description\nRequires Strength 2+ to wield without suffering -2 penalties on follow-up shots."
  },
  {
    "id": "spec-reach",
    "name": "Reach (10ft)",
    "description": "Melee weapon allows attacks against opponents 10 feet away without provoking.",
    "category": "special",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Reach (10ft)\n\n**Category**: SPECIAL\n\n## Description\nMelee weapon allows attacks against opponents 10 feet away without provoking."
  },
  {
    "id": "spec-entangling",
    "name": "Entangling",
    "description": "On a successful hit, target is entangled and must pass Agility CR 15 to break free.",
    "category": "special",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Entangling\n\n**Category**: SPECIAL\n\n## Description\nOn a successful hit, target is entangled and must pass Agility CR 15 to break free."
  },
  {
    "id": "spec-tripping",
    "name": "Tripping",
    "description": "Can be used to execute trip maneuvers to knock opponents prone.",
    "category": "special",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Tripping\n\n**Category**: SPECIAL\n\n## Description\nCan be used to execute trip maneuvers to knock opponents prone."
  },
  {
    "id": "spec-guided",
    "name": "Guided / Tracking",
    "description": "Smart telemetry micro-thrusters track designated targets around light cover.",
    "category": "special",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Guided / Tracking\n\n**Category**: SPECIAL\n\n## Description\nSmart telemetry micro-thrusters track designated targets around light cover."
  },
  {
    "id": "spec-unreliable",
    "name": "Unreliable",
    "description": "Jury-rigged or unstable mechanism; misfires on a natural roll of 1 or 2.",
    "category": "special",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Unreliable\n\n**Category**: SPECIAL\n\n## Description\nJury-rigged or unstable mechanism; misfires on a natural roll of 1 or 2."
  },
  {
    "id": "spec-quick-swap",
    "name": "Modular Quick-Swap",
    "description": "Can swap barrels, scopes, or ammo types as a Free Action.",
    "category": "special",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Modular Quick-Swap\n\n**Category**: SPECIAL\n\n## Description\nCan swap barrels, scopes, or ammo types as a Free Action."
  }
];

export const DEFAULT_AVAILABILITY = [
  {
    "id": "avail-common",
    "name": "Common",
    "description": "Widely available in any standard civilian shop or colony outpost without restriction.",
    "category": "availability",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Common\n\n**Category**: AVAILABILITY\n\n## Description\nWidely available in any standard civilian shop or colony outpost without restriction."
  },
  {
    "id": "avail-standard",
    "name": "Standard",
    "description": "Standard commercial equipment available across all major ports and trade hubs.",
    "category": "availability",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Standard\n\n**Category**: AVAILABILITY\n\n## Description\nStandard commercial equipment available across all major ports and trade hubs."
  },
  {
    "id": "avail-restricted",
    "name": "Restricted",
    "description": "Requires an operator license, corporate charter, or security clearance to purchase.",
    "category": "availability",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Restricted\n\n**Category**: AVAILABILITY\n\n## Description\nRequires an operator license, corporate charter, or security clearance to purchase."
  },
  {
    "id": "avail-military",
    "name": "Military Requisition",
    "description": "Issued exclusively to government military branches and state security forces.",
    "category": "availability",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Military Requisition\n\n**Category**: AVAILABILITY\n\n## Description\nIssued exclusively to government military branches and state security forces."
  },
  {
    "id": "avail-rare",
    "name": "Rare",
    "description": "Limited production runs or artisan crafted; found only in specialized boutique markets.",
    "category": "availability",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Rare\n\n**Category**: AVAILABILITY\n\n## Description\nLimited production runs or artisan crafted; found only in specialized boutique markets."
  },
  {
    "id": "avail-black-market",
    "name": "Black Market",
    "description": "Illegal contraband and shadow syndicate tech procured via underworld connections.",
    "category": "availability",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Black Market\n\n**Category**: AVAILABILITY\n\n## Description\nIllegal contraband and shadow syndicate tech procured via underworld connections."
  },
  {
    "id": "avail-prototype",
    "name": "Prototype / Experimental",
    "description": "One-of-a-kind classified laboratory test items not in mass production.",
    "category": "availability",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Prototype / Experimental\n\n**Category**: AVAILABILITY\n\n## Description\nOne-of-a-kind classified laboratory test items not in mass production."
  },
  {
    "id": "avail-artifact",
    "name": "Artifact / Relic",
    "description": "Ancient precursor deific relic or unique historical treasure of immense power.",
    "category": "availability",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Artifact / Relic\n\n**Category**: AVAILABILITY\n\n## Description\nAncient precursor deific relic or unique historical treasure of immense power."
  }
];

export const DEFAULT_GEAR_CATEGORIES = [
  {
    "id": "gear_cat-electronics",
    "name": "Electronics & Computing",
    "description": "Cyberdecks, data pads, scanners, holocams, neural interfaces, and hacking tools.",
    "category": "gear_category",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Electronics & Computing\n\n**Category**: GEAR CATEGORY\n\n## Description\nCyberdecks, data pads, scanners, holocams, neural interfaces, and hacking tools."
  },
  {
    "id": "gear_cat-survival",
    "name": "Survival & Environmental",
    "description": "Rations, water scrubbers, respirators, tents, flares, climbing gear, and hazard suits.",
    "category": "gear_category",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Survival & Environmental\n\n**Category**: GEAR CATEGORY\n\n## Description\nRations, water scrubbers, respirators, tents, flares, climbing gear, and hazard suits."
  },
  {
    "id": "gear_cat-medical",
    "name": "Medical & Pharmaceuticals",
    "description": "Medkits, trauma stims, antitoxins, cellular regenerators, biogel, and surgical kits.",
    "category": "gear_category",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Medical & Pharmaceuticals\n\n**Category**: GEAR CATEGORY\n\n## Description\nMedkits, trauma stims, antitoxins, cellular regenerators, biogel, and surgical kits."
  },
  {
    "id": "gear_cat-tools",
    "name": "Tools & Engineering",
    "description": "Plasma torches, multi-wrenches, diagnostic pads, repair nano-paste, and work benches.",
    "category": "gear_category",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Tools & Engineering\n\n**Category**: GEAR CATEGORY\n\n## Description\nPlasma torches, multi-wrenches, diagnostic pads, repair nano-paste, and work benches."
  },
  {
    "id": "gear_cat-comms",
    "name": "Communications & Sensor",
    "description": "Sub-space transceivers, comm-chips, radar dishes, acoustic probes, and beacon buoys.",
    "category": "gear_category",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Communications & Sensor\n\n**Category**: GEAR CATEGORY\n\n## Description\nSub-space transceivers, comm-chips, radar dishes, acoustic probes, and beacon buoys."
  },
  {
    "id": "gear_cat-power",
    "name": "Power & Energy Cells",
    "description": "Micro-cells, standard power packs, fusion batteries, solar blankets, and generators.",
    "category": "gear_category",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Power & Energy Cells\n\n**Category**: GEAR CATEGORY\n\n## Description\nMicro-cells, standard power packs, fusion batteries, solar blankets, and generators."
  },
  {
    "id": "gear_cat-tactical",
    "name": "Tactical & Field Gear",
    "description": "Holsters, ammo pouches, grappling hooks, tactical webbing, and night-vision goggles.",
    "category": "gear_category",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Tactical & Field Gear\n\n**Category**: GEAR CATEGORY\n\n## Description\nHolsters, ammo pouches, grappling hooks, tactical webbing, and night-vision goggles."
  },
  {
    "id": "gear_cat-explosives",
    "name": "Explosives & Demolitions",
    "description": "Frag grenades, breach charges, thermal detonators, EMP mines, and detonator cords.",
    "category": "gear_category",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Explosives & Demolitions\n\n**Category**: GEAR CATEGORY\n\n## Description\nFrag grenades, breach charges, thermal detonators, EMP mines, and detonator cords."
  },
  {
    "id": "gear_cat-meta-tech",
    "name": "Meta-Tech Devices",
    "description": "Aetheric resonators, psi-focus crystals, warding seals, and metaphysical conduits.",
    "category": "gear_category",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Meta-Tech Devices\n\n**Category**: GEAR CATEGORY\n\n## Description\nAetheric resonators, psi-focus crystals, warding seals, and metaphysical conduits."
  },
  {
    "id": "gear_cat-containers",
    "name": "Containers & Storage",
    "description": "Lockboxes, tactical backpacks, magnetized crates, and vacuum-sealed cargo pods.",
    "category": "gear_category",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Containers & Storage\n\n**Category**: GEAR CATEGORY\n\n## Description\nLockboxes, tactical backpacks, magnetized crates, and vacuum-sealed cargo pods."
  }
];

export const DEFAULT_CLASSIFICATIONS = [
  {
    "id": "class-melee-slash",
    "name": "Melee (Slashing)",
    "description": "Edged hand-to-hand weapons including swords, combat knives, axes, and energy blades.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Melee (Slashing)\n\n**Category**: CLASSIFICATION\n\n## Description\nEdged hand-to-hand weapons including swords, combat knives, axes, and energy blades."
  },
  {
    "id": "class-melee-blunt",
    "name": "Melee (Blunt)",
    "description": "Impact hand-to-hand weapons including warhammers, batons, maces, and shock clubs.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Melee (Blunt)\n\n**Category**: CLASSIFICATION\n\n## Description\nImpact hand-to-hand weapons including warhammers, batons, maces, and shock clubs."
  },
  {
    "id": "class-melee-pierce",
    "name": "Melee (Piercing)",
    "description": "Thrusting hand-to-hand weapons including spears, rapiers, daggers, and lances.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Melee (Piercing)\n\n**Category**: CLASSIFICATION\n\n## Description\nThrusting hand-to-hand weapons including spears, rapiers, daggers, and lances."
  },
  {
    "id": "class-ranged-ballistic",
    "name": "Ranged (Ballistic)",
    "description": "Firearms utilizing chemical propellant or magnetic acceleration to launch physical slugs.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Ranged (Ballistic)\n\n**Category**: CLASSIFICATION\n\n## Description\nFirearms utilizing chemical propellant or magnetic acceleration to launch physical slugs."
  },
  {
    "id": "class-heavy-ballistic",
    "name": "Heavy (Ballistic)",
    "description": "Crew-served or mounted projectile weapons including heavy machine guns and auto-cannons.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Heavy (Ballistic)\n\n**Category**: CLASSIFICATION\n\n## Description\nCrew-served or mounted projectile weapons including heavy machine guns and auto-cannons."
  },
  {
    "id": "class-ranged-energy",
    "name": "Ranged (Energy)",
    "description": "Direct-fire laser carbines, plasma pistols, particle blasters, and arc throwers.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Ranged (Energy)\n\n**Category**: CLASSIFICATION\n\n## Description\nDirect-fire laser carbines, plasma pistols, particle blasters, and arc throwers."
  },
  {
    "id": "class-heavy-energy",
    "name": "Heavy (Energy)",
    "description": "Vehicle or platform mounted plasma cannons, siege lasers, and singularity projectors.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Heavy (Energy)\n\n**Category**: CLASSIFICATION\n\n## Description\nVehicle or platform mounted plasma cannons, siege lasers, and singularity projectors."
  },
  {
    "id": "class-armor-light",
    "name": "Light Armor",
    "description": "Flexible ballistic vests and light armoring offering mobility without agility penalties.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Light Armor\n\n**Category**: CLASSIFICATION\n\n## Description\nFlexible ballistic vests and light armoring offering mobility without agility penalties."
  },
  {
    "id": "class-armor-medium",
    "name": "Medium Armor",
    "description": "Reinforced carapace plates and composite suits offering balanced battlefield defense.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Medium Armor\n\n**Category**: CLASSIFICATION\n\n## Description\nReinforced carapace plates and composite suits offering balanced battlefield defense."
  },
  {
    "id": "class-armor-heavy",
    "name": "Heavy Armor",
    "description": "Full-body powered plate and exosuits offering maximum physical and energy DR.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Heavy Armor\n\n**Category**: CLASSIFICATION\n\n## Description\nFull-body powered plate and exosuits offering maximum physical and energy DR."
  },
  {
    "id": "class-armor-void",
    "name": "Sealed Void Suit",
    "description": "Hermetically pressurized atmospheric suit designed for space walks and toxic planets.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Sealed Void Suit\n\n**Category**: CLASSIFICATION\n\n## Description\nHermetically pressurized atmospheric suit designed for space walks and toxic planets."
  },
  {
    "id": "class-armor-hazard",
    "name": "Hazard Suit",
    "description": "Specialized chemical, radiation, and biological isolation suit for industrial disaster zones.",
    "category": "classification",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Hazard Suit\n\n**Category**: CLASSIFICATION\n\n## Description\nSpecialized chemical, radiation, and biological isolation suit for industrial disaster zones."
  }
];

export const DEFAULT_CREATORS = [
  {
    "id": "creator-syndicate",
    "name": "The Syndicate (Corporate Futurism)",
    "faction": "The Syndicate",
    "trait": "Integrated System",
    "description": "Apple Store Cathedral aesthetic using matte white composites, brushed aluminum, and cyan holographic data-streams. Tethered to the Mesh (+2 Knowledge checks on local networks; subject to subscription Penance Mode).",
    "category": "creator",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# The Syndicate (Corporate Futurism)\n\n**Category**: CREATOR\n\n## Description\nApple Store Cathedral aesthetic using matte white composites, brushed aluminum, and cyan holographic data-streams. Tethered to the Mesh (+2 Knowledge checks on local networks; subject to subscription Penance Mode)."
  },
  {
    "id": "creator-impyrium",
    "name": "The Impyrium (Heirloom Industrial)",
    "faction": "The Impyrium",
    "trait": "Archeotech",
    "description": "Celestial Neo-Sumerian aesthetic clad in gold filigree, white marble, and purity seals. Grants +2 DR and +2 Hardness, but uses Relic Sockets that reject modern or alien modifications.",
    "category": "creator",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# The Impyrium (Heirloom Industrial)\n\n**Category**: CREATOR\n\n## Description\nCelestial Neo-Sumerian aesthetic clad in gold filigree, white marble, and purity seals. Grants +2 DR and +2 Hardness, but uses Relic Sockets that reject modern or alien modifications."
  },
  {
    "id": "creator-dracon-dynasty",
    "name": "The Dracon Dynasty (Feudal Protection)",
    "faction": "Dracon Dynasty",
    "trait": "Bulwark",
    "description": "High-Fantasy Industrial aesthetic with dragon-scale motifs, heraldic crests, and warm gold lighting. Prioritizes structural integrity (+20% SP and +1 DR) over speed.",
    "category": "creator",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# The Dracon Dynasty (Feudal Protection)\n\n**Category**: CREATOR\n\n## Description\nHigh-Fantasy Industrial aesthetic with dragon-scale motifs, heraldic crests, and warm gold lighting. Prioritizes structural integrity (+20% SP and +1 DR) over speed."
  },
  {
    "id": "creator-ascendancy",
    "name": "The Ascendancy (Enlightened Innovation)",
    "faction": "The Ascendancy",
    "trait": "Adaptive Progress",
    "description": "Smart City Solarpunk aesthetic with clean curves, glass canopies, and blue energy accents. Heavily shielded, agile, and integrates non-lethal options alongside lethal armaments.",
    "category": "creator",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# The Ascendancy (Enlightened Innovation)\n\n**Category**: CREATOR\n\n## Description\nSmart City Solarpunk aesthetic with clean curves, glass canopies, and blue energy accents. Heavily shielded, agile, and integrates non-lethal options alongside lethal armaments."
  },
  {
    "id": "creator-coalition",
    "name": "The Coalition & Outworlds (Scrappy Industrial)",
    "faction": "Coalition / Outworlds",
    "trait": "Jury-Rigged",
    "description": "Space Western Noir aesthetic of scavenged parts, exposed wiring, and hazard stripes. Reduces acquisition/crafting CR by -5, but glitches or disables a Socket on a Natural 1.",
    "category": "creator",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# The Coalition & Outworlds (Scrappy Industrial)\n\n**Category**: CREATOR\n\n## Description\nSpace Western Noir aesthetic of scavenged parts, exposed wiring, and hazard stripes. Reduces acquisition/crafting CR by -5, but glitches or disables a Socket on a Natural 1."
  },
  {
    "id": "creator-alterian-enclave",
    "name": "The Alterian Enclave (Botanical Engineering)",
    "faction": "Alterian Enclave",
    "trait": "Photosynthesis & Naturalist",
    "description": "Interstellar Art Nouveau aesthetic fusing white ceramic with living wood and solar sails. Recharges energy cells in direct sunlight and grants +2 to Nature and Survival checks.",
    "category": "creator",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# The Alterian Enclave (Botanical Engineering)\n\n**Category**: CREATOR\n\n## Description\nInterstellar Art Nouveau aesthetic fusing white ceramic with living wood and solar sails. Recharges energy cells in direct sunlight and grants +2 to Nature and Survival checks."
  },
  {
    "id": "creator-auluran",
    "name": "The Auluran (Symbiotic Growth)",
    "faction": "Auluran Clans",
    "trait": "Regeneration & Symbiosis",
    "description": "Bioluminescent Jungle aesthetic of vat-grown chitinous hulls and vascular corridors. Passively regenerates 2 SP/round and can spend 1 Karma to adapt to environmental hazards.",
    "category": "creator",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# The Auluran (Symbiotic Growth)\n\n**Category**: CREATOR\n\n## Description\nBioluminescent Jungle aesthetic of vat-grown chitinous hulls and vascular corridors. Passively regenerates 2 SP/round and can spend 1 Karma to adapt to environmental hazards."
  },
  {
    "id": "creator-mekan",
    "name": "The Mekan (Mechanical Perfection)",
    "faction": "Mekan",
    "trait": "Integrated Tools",
    "description": "Fractal Perfection aesthetic of geometric spheres, magnetic suspension, and TL 5 Polymatter. Autonomously shifts physical form to grant +2 to Vocation checks.",
    "category": "creator",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# The Mekan (Mechanical Perfection)\n\n**Category**: CREATOR\n\n## Description\nFractal Perfection aesthetic of geometric spheres, magnetic suspension, and TL 5 Polymatter. Autonomously shifts physical form to grant +2 to Vocation checks."
  },
  {
    "id": "creator-entari-combine",
    "name": "The Entari Combine (Cosmopolitan Trade)",
    "faction": "Entari Combine",
    "trait": "Ethical Efficiency",
    "description": "Galactic Senate eco-luxury aesthetic using silent nanoweaves, universal docking rings, advanced translation suites, and concealed defensive weaponry.",
    "category": "creator",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# The Entari Combine (Cosmopolitan Trade)\n\n**Category**: CREATOR\n\n## Description\nGalactic Senate eco-luxury aesthetic using silent nanoweaves, universal docking rings, advanced translation suites, and concealed defensive weaponry."
  },
  {
    "id": "creator-thorn",
    "name": "The Thorn (Primal Growth)",
    "faction": "Thorn",
    "trait": "Rooted & Camouflage",
    "description": "Primal bark-plate, vine-wrapped tech, and glowing chlorophyll veins. Grants +2 to resist Trip/Bull Rush attempts and +2 Stealth in wilderness environments.",
    "category": "creator",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# The Thorn (Primal Growth)\n\n**Category**: CREATOR\n\n## Description\nPrimal bark-plate, vine-wrapped tech, and glowing chlorophyll veins. Grants +2 to resist Trip/Bull Rush attempts and +2 Stealth in wilderness environments."
  },
  {
    "id": "creator-kitin",
    "name": "The Kitin (Hive-Resin)",
    "faction": "Kitin Collective",
    "trait": "Hive-Link & Lightweight",
    "description": "Secreted hive-resin composites with green vein-piping. Integrates with telepathic hive-mind communications and counts as one category lighter for movement penalties.",
    "category": "creator",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# The Kitin (Hive-Resin)\n\n**Category**: CREATOR\n\n## Description\nSecreted hive-resin composites with green vein-piping. Integrates with telepathic hive-mind communications and counts as one category lighter for movement penalties."
  }
];

export const DEFAULT_DESIGNS = [
  {
    "id": "design-bullpup",
    "name": "Bullpup Configuration",
    "description": "Action behind trigger; maintains full barrel length in a compact, CQB-ready profile.",
    "category": "design",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Bullpup Configuration\n\n**Category**: DESIGN\n\n## Description\nAction behind trigger; maintains full barrel length in a compact, CQB-ready profile."
  },
  {
    "id": "design-heavy-frame",
    "name": "Heavy Frame",
    "description": "Reinforced receiver with integrated thermal heat sinks and recoil buffers.",
    "category": "design",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Heavy Frame\n\n**Category**: DESIGN\n\n## Description\nReinforced receiver with integrated thermal heat sinks and recoil buffers."
  },
  {
    "id": "design-compact",
    "name": "Compact / Concealed",
    "description": "Miniaturized frame with folding stock designed for covert personal defense.",
    "category": "design",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Compact / Concealed\n\n**Category**: DESIGN\n\n## Description\nMiniaturized frame with folding stock designed for covert personal defense."
  },
  {
    "id": "design-modular-chassis",
    "name": "Modular Chassis",
    "description": "Standardized rail system allowing rapid swapping of barrels, calibers, and optics.",
    "category": "design",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Modular Chassis\n\n**Category**: DESIGN\n\n## Description\nStandardized rail system allowing rapid swapping of barrels, calibers, and optics."
  },
  {
    "id": "design-reinforced-exo",
    "name": "Reinforced Exoskeleton",
    "description": "External hydraulic articulation frame that augments physical carrying capacity.",
    "category": "design",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Reinforced Exoskeleton\n\n**Category**: DESIGN\n\n## Description\nExternal hydraulic articulation frame that augments physical carrying capacity."
  },
  {
    "id": "design-micro-platform",
    "name": "Micro-Platform",
    "description": "Sub-compact form factor optimized for tiny drones or wrist-mounted modules.",
    "category": "design",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Micro-Platform\n\n**Category**: DESIGN\n\n## Description\nSub-compact form factor optimized for tiny drones or wrist-mounted modules."
  },
  {
    "id": "design-precursor-matrix",
    "name": "Precursor Matrix",
    "description": "Ancient architectural geometry that channels ambient metaphysical energy.",
    "category": "design",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Precursor Matrix\n\n**Category**: DESIGN\n\n## Description\nAncient architectural geometry that channels ambient metaphysical energy."
  },
  {
    "id": "design-biomechanical",
    "name": "Bio-Mechanical Hybrid",
    "description": "Chassis integrating synthetic titanium servos with living organic muscle fibers.",
    "category": "design",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Bio-Mechanical Hybrid\n\n**Category**: DESIGN\n\n## Description\nChassis integrating synthetic titanium servos with living organic muscle fibers."
  }
];

export const DEFAULT_COMPONENTS = [
  {
    "id": "comp-optical-sight",
    "name": "Optical Sight / Reflex Scope",
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "description": "Red-dot holographic sight providing +1 to strike at close engagement ranges.",
    "category": "component",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "body": "# Optical Sight / Reflex Scope\n\n**Category**: COMPONENT\n\n## Description\nRed-dot holographic sight providing +1 to strike at close engagement ranges."
  },
  {
    "id": "comp-high-capacity-mag",
    "name": "High-Capacity Magazine",
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "description": "Expanded magazine well increasing total ammunition capacity by 50%.",
    "category": "component",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "body": "# High-Capacity Magazine\n\n**Category**: COMPONENT\n\n## Description\nExpanded magazine well increasing total ammunition capacity by 50%."
  },
  {
    "id": "comp-suppressor",
    "name": "Suppressor / Muzzle Brake",
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "description": "Dampens muzzle blast, adding +10 Stealth DC to detect firearm discharges.",
    "category": "component",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "body": "# Suppressor / Muzzle Brake\n\n**Category**: COMPONENT\n\n## Description\nDampens muzzle blast, adding +10 Stealth DC to detect firearm discharges."
  },
  {
    "id": "comp-reinforced-barrel",
    "name": "Reinforced Heavy Barrel",
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "description": "Heavy-profile barrel with +20% effective range and increased heat tolerance.",
    "category": "component",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "body": "# Reinforced Heavy Barrel\n\n**Category**: COMPONENT\n\n## Description\nHeavy-profile barrel with +20% effective range and increased heat tolerance."
  },
  {
    "id": "comp-gyro-stabilizer",
    "name": "Gyro-Stabilizer",
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "description": "Internal counter-weight gyros that eliminate movement penalties when firing heavy weapons.",
    "category": "component",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "body": "# Gyro-Stabilizer\n\n**Category**: COMPONENT\n\n## Description\nInternal counter-weight gyros that eliminate movement penalties when firing heavy weapons."
  },
  {
    "id": "comp-kinetic-buffer",
    "name": "Kinetic Recoil Buffer",
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "description": "Hydraulic stock buffer reducing automatic fire penalties by 2 points.",
    "category": "component",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "body": "# Kinetic Recoil Buffer\n\n**Category**: COMPONENT\n\n## Description\nHydraulic stock buffer reducing automatic fire penalties by 2 points."
  },
  {
    "id": "comp-heat-sink",
    "name": "Extended Heat Sinks",
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "description": "Thermal dissipation fins allowing energy weapons to sustain continuous fire.",
    "category": "component",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "body": "# Extended Heat Sinks\n\n**Category**: COMPONENT\n\n## Description\nThermal dissipation fins allowing energy weapons to sustain continuous fire."
  },
  {
    "id": "comp-neural-jack",
    "name": "Neural Interface Ghost-Jack",
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "description": "Direct neural interface providing +2 to strike and weapon telemetry in HUD.",
    "category": "component",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "body": "# Neural Interface Ghost-Jack\n\n**Category**: COMPONENT\n\n## Description\nDirect neural interface providing +2 to strike and weapon telemetry in HUD."
  },
  {
    "id": "comp-smart-link",
    "name": "Smart-Link Sensor",
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "description": "Wireless data-feed to smart eyewear enabling accurate blind-fire around corners.",
    "category": "component",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "body": "# Smart-Link Sensor\n\n**Category**: COMPONENT\n\n## Description\nWireless data-feed to smart eyewear enabling accurate blind-fire around corners."
  },
  {
    "id": "comp-overcharge-cap",
    "name": "Overcharge Capacitor",
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "description": "Allows weapon to supercharge single shots for +1 bonus damage die.",
    "category": "component",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "body": "# Overcharge Capacitor\n\n**Category**: COMPONENT\n\n## Description\nAllows weapon to supercharge single shots for +1 bonus damage die."
  }
];

export const DEFAULT_PREREQUISITES = [
  {
    "id": "prereq-might-2",
    "name": "Might 2+ (STR)",
    "type": "Attribute",
    "value": "STR >= 2",
    "description": "Requires physical Strength attribute score of 2 or higher.",
    "category": "prerequisite",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Might 2+ (STR)\n\n**Category**: PREREQUISITE\n\n## Description\nRequires physical Strength attribute score of 2 or higher."
  },
  {
    "id": "prereq-reflex-2",
    "name": "Reflex 2+ (AGI)",
    "type": "Attribute",
    "value": "AGI >= 2",
    "description": "Requires Agility attribute score of 2 or higher.",
    "category": "prerequisite",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Reflex 2+ (AGI)\n\n**Category**: PREREQUISITE\n\n## Description\nRequires Agility attribute score of 2 or higher."
  },
  {
    "id": "prereq-fortitude-2",
    "name": "Fortitude 2+ (STA)",
    "type": "Attribute",
    "value": "STA >= 2",
    "description": "Requires Stamina attribute score of 2 or higher.",
    "category": "prerequisite",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Fortitude 2+ (STA)\n\n**Category**: PREREQUISITE\n\n## Description\nRequires Stamina attribute score of 2 or higher."
  },
  {
    "id": "prereq-reason-2",
    "name": "Reason 2+ (INT)",
    "type": "Attribute",
    "value": "INT >= 2",
    "description": "Requires Intellect attribute score of 2 or higher.",
    "category": "prerequisite",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Reason 2+ (INT)\n\n**Category**: PREREQUISITE\n\n## Description\nRequires Intellect attribute score of 2 or higher."
  },
  {
    "id": "prereq-willpower-2",
    "name": "Willpower 2+ (WIS)",
    "type": "Attribute",
    "value": "WIS >= 2",
    "description": "Requires Wisdom attribute score of 2 or higher.",
    "category": "prerequisite",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Willpower 2+ (WIS)\n\n**Category**: PREREQUISITE\n\n## Description\nRequires Wisdom attribute score of 2 or higher."
  },
  {
    "id": "prereq-presence-2",
    "name": "Presence 2+ (CHA)",
    "type": "Attribute",
    "value": "CHA >= 2",
    "description": "Requires Charisma attribute score of 2 or higher.",
    "category": "prerequisite",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Presence 2+ (CHA)\n\n**Category**: PREREQUISITE\n\n## Description\nRequires Charisma attribute score of 2 or higher."
  },
  {
    "id": "prereq-attune-2",
    "name": "Attune 2+ (Meta)",
    "type": "Skill",
    "value": "Attune >= 2",
    "description": "Requires Attune skill rank of 2 or higher to channel metaphysics.",
    "category": "prerequisite",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Attune 2+ (Meta)\n\n**Category**: PREREQUISITE\n\n## Description\nRequires Attune skill rank of 2 or higher to channel metaphysics."
  },
  {
    "id": "prereq-firearms-3",
    "name": "Firearms 3+ (Combat)",
    "type": "Skill",
    "value": "Firearms >= 3",
    "description": "Requires Firearms skill rank of 3 or higher.",
    "category": "prerequisite",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Firearms 3+ (Combat)\n\n**Category**: PREREQUISITE\n\n## Description\nRequires Firearms skill rank of 3 or higher."
  },
  {
    "id": "prereq-cybernetic-chassis",
    "name": "Cybernetic Chassis",
    "type": "Feature",
    "value": "Chassis == Synthetic/Augmented",
    "description": "Requires the character to possess synthetic chassis or augmented body parts.",
    "category": "prerequisite",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Cybernetic Chassis\n\n**Category**: PREREQUISITE\n\n## Description\nRequires the character to possess synthetic chassis or augmented body parts."
  },
  {
    "id": "prereq-awakened",
    "name": "Awakened Feature",
    "type": "Feature",
    "value": "HasFeature(Awakened)",
    "description": "Requires the Awakened feature to manifest supernatural abilities.",
    "category": "prerequisite",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Awakened Feature\n\n**Category**: PREREQUISITE\n\n## Description\nRequires the Awakened feature to manifest supernatural abilities."
  }
];

export const DEFAULT_MODIFIERS = [
  {
    "id": "mod-attack-plus-1",
    "name": "+1 Attack Roll",
    "target": "Attack",
    "value": 1,
    "type": "combat",
    "description": "Grants +1 bonus on combat attack rolls.",
    "category": "modifier",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# +1 Attack Roll\n\n**Category**: MODIFIER\n\n## Description\nGrants +1 bonus on combat attack rolls."
  },
  {
    "id": "mod-attack-plus-2",
    "name": "+2 Attack Roll",
    "target": "Attack",
    "value": 2,
    "type": "combat",
    "description": "Grants +2 bonus on combat attack rolls.",
    "category": "modifier",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# +2 Attack Roll\n\n**Category**: MODIFIER\n\n## Description\nGrants +2 bonus on combat attack rolls."
  },
  {
    "id": "mod-defense-plus-1",
    "name": "+1 Defense Roll",
    "target": "Defense",
    "value": 1,
    "type": "combat",
    "description": "Grants +1 bonus on combat defense checks.",
    "category": "modifier",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# +1 Defense Roll\n\n**Category**: MODIFIER\n\n## Description\nGrants +1 bonus on combat defense checks."
  },
  {
    "id": "mod-defense-plus-2",
    "name": "+2 Defense Roll",
    "target": "Defense",
    "value": 2,
    "type": "combat",
    "description": "Grants +2 bonus on combat defense checks.",
    "category": "modifier",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# +2 Defense Roll\n\n**Category**: MODIFIER\n\n## Description\nGrants +2 bonus on combat defense checks."
  },
  {
    "id": "mod-speed-plus-10",
    "name": "+10 ft Speed",
    "target": "Movement Speed",
    "value": 10,
    "type": "speed",
    "description": "Increases ground movement speed by 10 feet per round.",
    "category": "modifier",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# +10 ft Speed\n\n**Category**: MODIFIER\n\n## Description\nIncreases ground movement speed by 10 feet per round."
  },
  {
    "id": "mod-reach-plus-5",
    "name": "+5 ft Reach",
    "target": "Reach",
    "value": 5,
    "type": "combat",
    "description": "Extends melee combat reach by 5 feet.",
    "category": "modifier",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# +5 ft Reach\n\n**Category**: MODIFIER\n\n## Description\nExtends melee combat reach by 5 feet."
  },
  {
    "id": "mod-dr-plus-2",
    "name": "+2 Damage Resistance (DR)",
    "target": "Damage Resistance",
    "value": 2,
    "type": "armor",
    "description": "Absorbs 2 points of incoming physical/energy damage.",
    "category": "modifier",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# +2 Damage Resistance (DR)\n\n**Category**: MODIFIER\n\n## Description\nAbsorbs 2 points of incoming physical/energy damage."
  },
  {
    "id": "mod-sp-plus-5",
    "name": "+5 Structure Points (SP)",
    "target": "Structure Points",
    "value": 5,
    "type": "health",
    "description": "Adds 5 bonus Structure Points to the chassis or module.",
    "category": "modifier",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# +5 Structure Points (SP)\n\n**Category**: MODIFIER\n\n## Description\nAdds 5 bonus Structure Points to the chassis or module."
  },
  {
    "id": "mod-init-plus-2",
    "name": "+2 Initiative",
    "target": "Initiative",
    "value": 2,
    "type": "combat",
    "description": "Grants +2 bonus on combat initiative reaction checks.",
    "category": "modifier",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# +2 Initiative\n\n**Category**: MODIFIER\n\n## Description\nGrants +2 bonus on combat initiative reaction checks."
  },
  {
    "id": "mod-ap-minus-1",
    "name": "-1 Action Point (AP) Cost",
    "target": "Action Cost",
    "value": -1,
    "type": "action",
    "description": "Reduces action point cost of specialized actions by 1.",
    "category": "modifier",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# -1 Action Point (AP) Cost\n\n**Category**: MODIFIER\n\n## Description\nReduces action point cost of specialized actions by 1."
  }
];

export const DEFAULT_SOCIETAL_ENTRIES = [
  {
    "id": "society_agriculture_lvl_0",
    "category": "society_agriculture",
    "name": "Agriculture & Biosphere (Level 0: Hunting and Gathering)",
    "level": 0,
    "sphere_key": "society_agriculture",
    "description": "Level 0 (Hunting and Gathering) in Agriculture & Biosphere: Early societies rely on hunting animals and gathering wild plants for sustenance.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Agriculture & Biosphere (Level 0: Hunting and Gathering)\n\n**Category**: SOCIETY AGRICULTURE\n\n## Description\nLevel 0 (Hunting and Gathering) in Agriculture & Biosphere: Early societies rely on hunting animals and gathering wild plants for sustenance."
  },
  {
    "id": "society_agriculture_lvl_1",
    "category": "society_agriculture",
    "name": "Agriculture & Biosphere (Level 1: Farming)",
    "level": 1,
    "sphere_key": "society_agriculture",
    "description": "Level 1 (Farming) in Agriculture & Biosphere: Domestication of plants and animals, leading to settled agriculture.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Agriculture & Biosphere (Level 1: Farming)\n\n**Category**: SOCIETY AGRICULTURE\n\n## Description\nLevel 1 (Farming) in Agriculture & Biosphere: Domestication of plants and animals, leading to settled agriculture."
  },
  {
    "id": "society_agriculture_lvl_2",
    "category": "society_agriculture",
    "name": "Agriculture & Biosphere (Level 2: Advanced Farming)",
    "level": 2,
    "sphere_key": "society_agriculture",
    "description": "Level 2 (Advanced Farming) in Agriculture & Biosphere: Modern farming techniques, including mechanization, irrigation, and fertilization.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Agriculture & Biosphere (Level 2: Advanced Farming)\n\n**Category**: SOCIETY AGRICULTURE\n\n## Description\nLevel 2 (Advanced Farming) in Agriculture & Biosphere: Modern farming techniques, including mechanization, irrigation, and fertilization."
  },
  {
    "id": "society_agriculture_lvl_3",
    "category": "society_agriculture",
    "name": "Agriculture & Biosphere (Level 3: Terraforming)",
    "level": 3,
    "sphere_key": "society_agriculture",
    "description": "Level 3 (Terraforming) in Agriculture & Biosphere: Manipulation of planetary environments to create suitable conditions for agriculture.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Agriculture & Biosphere (Level 3: Terraforming)\n\n**Category**: SOCIETY AGRICULTURE\n\n## Description\nLevel 3 (Terraforming) in Agriculture & Biosphere: Manipulation of planetary environments to create suitable conditions for agriculture."
  },
  {
    "id": "society_agriculture_lvl_4",
    "category": "society_agriculture",
    "name": "Agriculture & Biosphere (Level 4: Planetary Engineering)",
    "level": 4,
    "sphere_key": "society_agriculture",
    "description": "Level 4 (Planetary Engineering) in Agriculture & Biosphere: Large-scale manipulation of entire planetary biospheres for agricultural output.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Agriculture & Biosphere (Level 4: Planetary Engineering)\n\n**Category**: SOCIETY AGRICULTURE\n\n## Description\nLevel 4 (Planetary Engineering) in Agriculture & Biosphere: Large-scale manipulation of entire planetary biospheres for agricultural output."
  },
  {
    "id": "society_agriculture_lvl_5",
    "category": "society_agriculture",
    "name": "Agriculture & Biosphere (Level 5: Matter Synthesis)",
    "level": 5,
    "sphere_key": "society_agriculture",
    "description": "Level 5 (Matter Synthesis) in Agriculture & Biosphere: Direct conversion of energy into food and organic matter (Post-Scarcity Replicators).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Agriculture & Biosphere (Level 5: Matter Synthesis)\n\n**Category**: SOCIETY AGRICULTURE\n\n## Description\nLevel 5 (Matter Synthesis) in Agriculture & Biosphere: Direct conversion of energy into food and organic matter (Post-Scarcity Replicators)."
  },
  {
    "id": "society_architecture_lvl_0",
    "category": "society_architecture",
    "name": "Architecture & Habitats (Level 0: Simple Structures)",
    "level": 0,
    "sphere_key": "society_architecture",
    "description": "Level 0 (Simple Structures) in Architecture & Habitats: Huts, tents, and basic masonry structures.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Architecture & Habitats (Level 0: Simple Structures)\n\n**Category**: SOCIETY ARCHITECTURE\n\n## Description\nLevel 0 (Simple Structures) in Architecture & Habitats: Huts, tents, and basic masonry structures."
  },
  {
    "id": "society_architecture_lvl_1",
    "category": "society_architecture",
    "name": "Architecture & Habitats (Level 1: Advanced Masonry)",
    "level": 1,
    "sphere_key": "society_architecture",
    "description": "Level 1 (Advanced Masonry) in Architecture & Habitats: Early steel structures, foundries, and basic urban planning.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Architecture & Habitats (Level 1: Advanced Masonry)\n\n**Category**: SOCIETY ARCHITECTURE\n\n## Description\nLevel 1 (Advanced Masonry) in Architecture & Habitats: Early steel structures, foundries, and basic urban planning."
  },
  {
    "id": "society_architecture_lvl_2",
    "category": "society_architecture",
    "name": "Architecture & Habitats (Level 2: Skyscrapers)",
    "level": 2,
    "sphere_key": "society_architecture",
    "description": "Level 2 (Skyscrapers) in Architecture & Habitats: Advanced urban planning, reinforced high-rises, and sustainable architecture.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Architecture & Habitats (Level 2: Skyscrapers)\n\n**Category**: SOCIETY ARCHITECTURE\n\n## Description\nLevel 2 (Skyscrapers) in Architecture & Habitats: Advanced urban planning, reinforced high-rises, and sustainable architecture."
  },
  {
    "id": "society_architecture_lvl_3",
    "category": "society_architecture",
    "name": "Architecture & Habitats (Level 3: Smart Cities)",
    "level": 3,
    "sphere_key": "society_architecture",
    "description": "Level 3 (Smart Cities) in Architecture & Habitats: Advanced building materials, arcologies, and energy-efficient pressurized designs.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Architecture & Habitats (Level 3: Smart Cities)\n\n**Category**: SOCIETY ARCHITECTURE\n\n## Description\nLevel 3 (Smart Cities) in Architecture & Habitats: Advanced building materials, arcologies, and energy-efficient pressurized designs."
  },
  {
    "id": "society_architecture_lvl_4",
    "category": "society_architecture",
    "name": "Architecture & Habitats (Level 4: Advanced Space Habitats)",
    "level": 4,
    "sphere_key": "society_architecture",
    "description": "Level 4 (Advanced Space Habitats) in Architecture & Habitats: Self-assembling orbital structures, grav-plated stations, and terraforming domes.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Architecture & Habitats (Level 4: Advanced Space Habitats)\n\n**Category**: SOCIETY ARCHITECTURE\n\n## Description\nLevel 4 (Advanced Space Habitats) in Architecture & Habitats: Self-assembling orbital structures, grav-plated stations, and terraforming domes."
  },
  {
    "id": "society_architecture_lvl_5",
    "category": "society_architecture",
    "name": "Architecture & Habitats (Level 5: Megastructures)",
    "level": 5,
    "sphere_key": "society_architecture",
    "description": "Level 5 (Megastructures) in Architecture & Habitats: Dyson Spheres, Ring Worlds (such as Mekan Prime), and Stellar Engineering.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Architecture & Habitats (Level 5: Megastructures)\n\n**Category**: SOCIETY ARCHITECTURE\n\n## Description\nLevel 5 (Megastructures) in Architecture & Habitats: Dyson Spheres, Ring Worlds (such as Mekan Prime), and Stellar Engineering."
  },
  {
    "id": "society_biotechnology_lvl_0",
    "category": "society_biotechnology",
    "name": "Biotechnology & Genetics (Level 0: Herbalism)",
    "level": 0,
    "sphere_key": "society_biotechnology",
    "description": "Level 0 (Herbalism) in Biotechnology & Genetics: Use of simple medicine, wild herbs, and natural remedies.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Biotechnology & Genetics (Level 0: Herbalism)\n\n**Category**: SOCIETY BIOTECHNOLOGY\n\n## Description\nLevel 0 (Herbalism) in Biotechnology & Genetics: Use of simple medicine, wild herbs, and natural remedies."
  },
  {
    "id": "society_biotechnology_lvl_1",
    "category": "society_biotechnology",
    "name": "Biotechnology & Genetics (Level 1: Pharmacology)",
    "level": 1,
    "sphere_key": "society_biotechnology",
    "description": "Level 1 (Pharmacology) in Biotechnology & Genetics: Improvements in medical knowledge, effective chemical treatments, and early pharmacology.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Biotechnology & Genetics (Level 1: Pharmacology)\n\n**Category**: SOCIETY BIOTECHNOLOGY\n\n## Description\nLevel 1 (Pharmacology) in Biotechnology & Genetics: Improvements in medical knowledge, effective chemical treatments, and early pharmacology."
  },
  {
    "id": "society_biotechnology_lvl_2",
    "category": "society_biotechnology",
    "name": "Biotechnology & Genetics (Level 2: Early Biotech)",
    "level": 2,
    "sphere_key": "society_biotechnology",
    "description": "Level 2 (Early Biotech) in Biotechnology & Genetics: 3D printable biological materials, genetic sequencing, and early nanotechnology.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Biotechnology & Genetics (Level 2: Early Biotech)\n\n**Category**: SOCIETY BIOTECHNOLOGY\n\n## Description\nLevel 2 (Early Biotech) in Biotechnology & Genetics: 3D printable biological materials, genetic sequencing, and early nanotechnology."
  },
  {
    "id": "society_biotechnology_lvl_3",
    "category": "society_biotechnology",
    "name": "Biotechnology & Genetics (Level 3: Genetic Engineering)",
    "level": 3,
    "sphere_key": "society_biotechnology",
    "description": "Level 3 (Genetic Engineering) in Biotechnology & Genetics: Living machinery, self-healing grafts, cloning, and morphic functionality.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Biotechnology & Genetics (Level 3: Genetic Engineering)\n\n**Category**: SOCIETY BIOTECHNOLOGY\n\n## Description\nLevel 3 (Genetic Engineering) in Biotechnology & Genetics: Living machinery, self-healing grafts, cloning, and morphic functionality."
  },
  {
    "id": "society_biotechnology_lvl_4",
    "category": "society_biotechnology",
    "name": "Biotechnology & Genetics (Level 4: Gene Editing)",
    "level": 4,
    "sphere_key": "society_biotechnology",
    "description": "Level 4 (Gene Editing) in Biotechnology & Genetics: Programmable biological materials, advanced living machinery, and seamless bio-integration.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Biotechnology & Genetics (Level 4: Gene Editing)\n\n**Category**: SOCIETY BIOTECHNOLOGY\n\n## Description\nLevel 4 (Gene Editing) in Biotechnology & Genetics: Programmable biological materials, advanced living machinery, and seamless bio-integration."
  },
  {
    "id": "society_biotechnology_lvl_5",
    "category": "society_biotechnology",
    "name": "Biotechnology & Genetics (Level 5: Advanced Nanobiotechnology)",
    "level": 5,
    "sphere_key": "society_biotechnology",
    "description": "Level 5 (Advanced Nanobiotechnology) in Biotechnology & Genetics: Advanced morphic equipment, enhanced genetic tailoring, digital consciousness, and retro-genetic reengineering.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Biotechnology & Genetics (Level 5: Advanced Nanobiotechnology)\n\n**Category**: SOCIETY BIOTECHNOLOGY\n\n## Description\nLevel 5 (Advanced Nanobiotechnology) in Biotechnology & Genetics: Advanced morphic equipment, enhanced genetic tailoring, digital consciousness, and retro-genetic reengineering."
  },
  {
    "id": "society_commerce_lvl_0",
    "category": "society_commerce",
    "name": "Commerce & Economy (Level 0: Barter Systems)",
    "level": 0,
    "sphere_key": "society_commerce",
    "description": "Level 0 (Barter Systems) in Commerce & Economy: Simple trade networks and direct commodity barter.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Commerce & Economy (Level 0: Barter Systems)\n\n**Category**: SOCIETY COMMERCE\n\n## Description\nLevel 0 (Barter Systems) in Commerce & Economy: Simple trade networks and direct commodity barter."
  },
  {
    "id": "society_commerce_lvl_1",
    "category": "society_commerce",
    "name": "Commerce & Economy (Level 1: Currency Systems)",
    "level": 1,
    "sphere_key": "society_commerce",
    "description": "Level 1 (Currency Systems) in Commerce & Economy: Precious metal coinage, early financial institutions, and basic market economies.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Commerce & Economy (Level 1: Currency Systems)\n\n**Category**: SOCIETY COMMERCE\n\n## Description\nLevel 1 (Currency Systems) in Commerce & Economy: Precious metal coinage, early financial institutions, and basic market economies."
  },
  {
    "id": "society_commerce_lvl_2",
    "category": "society_commerce",
    "name": "Commerce & Economy (Level 2: Modern Financial Systems)",
    "level": 2,
    "sphere_key": "society_commerce",
    "description": "Level 2 (Modern Financial Systems) in Commerce & Economy: Global trade networks, fiat banking, and advanced planetary market economies.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Commerce & Economy (Level 2: Modern Financial Systems)\n\n**Category**: SOCIETY COMMERCE\n\n## Description\nLevel 2 (Modern Financial Systems) in Commerce & Economy: Global trade networks, fiat banking, and advanced planetary market economies."
  },
  {
    "id": "society_commerce_lvl_3",
    "category": "society_commerce",
    "name": "Commerce & Economy (Level 3: Digital Currencies)",
    "level": 3,
    "sphere_key": "society_commerce",
    "description": "Level 3 (Digital Currencies) in Commerce & Economy: Interstellar credit networks, Cold Credit bearer chits, and system-wide economic integration.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Commerce & Economy (Level 3: Digital Currencies)\n\n**Category**: SOCIETY COMMERCE\n\n## Description\nLevel 3 (Digital Currencies) in Commerce & Economy: Interstellar credit networks, Cold Credit bearer chits, and system-wide economic integration."
  },
  {
    "id": "society_commerce_lvl_4",
    "category": "society_commerce",
    "name": "Commerce & Economy (Level 4: Advanced Economies)",
    "level": 4,
    "sphere_key": "society_commerce",
    "description": "Level 4 (Advanced Economies) in Commerce & Economy: Decentralized Mesh financial systems, Wealth Score leverage, and high-liquidity stellar markets.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Commerce & Economy (Level 4: Advanced Economies)\n\n**Category**: SOCIETY COMMERCE\n\n## Description\nLevel 4 (Advanced Economies) in Commerce & Economy: Decentralized Mesh financial systems, Wealth Score leverage, and high-liquidity stellar markets."
  },
  {
    "id": "society_commerce_lvl_5",
    "category": "society_commerce",
    "name": "Commerce & Economy (Level 5: Post-Scarcity)",
    "level": 5,
    "sphere_key": "society_commerce",
    "description": "Level 5 (Post-Scarcity) in Commerce & Economy: Base Substance Interchange renders traditional currency obsolete; economy is based on energy allocation and prestige.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Commerce & Economy (Level 5: Post-Scarcity)\n\n**Category**: SOCIETY COMMERCE\n\n## Description\nLevel 5 (Post-Scarcity) in Commerce & Economy: Base Substance Interchange renders traditional currency obsolete; economy is based on energy allocation and prestige."
  },
  {
    "id": "society_communication_lvl_0",
    "category": "society_communication",
    "name": "Communication & Data (Level 0: Verbal & Pictograms)",
    "level": 0,
    "sphere_key": "society_communication",
    "description": "Level 0 (Verbal & Pictograms) in Communication & Data: Spoken language and simple pictographic drawings.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Communication & Data (Level 0: Verbal & Pictograms)\n\n**Category**: SOCIETY COMMUNICATION\n\n## Description\nLevel 0 (Verbal & Pictograms) in Communication & Data: Spoken language and simple pictographic drawings."
  },
  {
    "id": "society_communication_lvl_1",
    "category": "society_communication",
    "name": "Communication & Data (Level 1: Published Text & Signaling)",
    "level": 1,
    "sphere_key": "society_communication",
    "description": "Level 1 (Published Text & Signaling) in Communication & Data: Written language, printing presses, and optical/telegraphic signaling.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Communication & Data (Level 1: Published Text & Signaling)\n\n**Category**: SOCIETY COMMUNICATION\n\n## Description\nLevel 1 (Published Text & Signaling) in Communication & Data: Written language, printing presses, and optical/telegraphic signaling."
  },
  {
    "id": "society_communication_lvl_2",
    "category": "society_communication",
    "name": "Communication & Data (Level 2: Digital Networks)",
    "level": 2,
    "sphere_key": "society_communication",
    "description": "Level 2 (Digital Networks) in Communication & Data: Audio/video broadcast, radio, flatvid television, and planetary internet.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Communication & Data (Level 2: Digital Networks)\n\n**Category**: SOCIETY COMMUNICATION\n\n## Description\nLevel 2 (Digital Networks) in Communication & Data: Audio/video broadcast, radio, flatvid television, and planetary internet."
  },
  {
    "id": "society_communication_lvl_3",
    "category": "society_communication",
    "name": "Communication & Data (Level 3: Holographic & FTL)",
    "level": 3,
    "sphere_key": "society_communication",
    "description": "Level 3 (Holographic & FTL) in Communication & Data: Volumetric holographic transceivers and faster-than-light relay communication.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Communication & Data (Level 3: Holographic & FTL)\n\n**Category**: SOCIETY COMMUNICATION\n\n## Description\nLevel 3 (Holographic & FTL) in Communication & Data: Volumetric holographic transceivers and faster-than-light relay communication."
  },
  {
    "id": "society_communication_lvl_4",
    "category": "society_communication",
    "name": "Communication & Data (Level 4: Mnemonic Transceivers)",
    "level": 4,
    "sphere_key": "society_communication",
    "description": "Level 4 (Mnemonic Transceivers) in Communication & Data: Direct thought-based trans-neural communication across stellar networks.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Communication & Data (Level 4: Mnemonic Transceivers)\n\n**Category**: SOCIETY COMMUNICATION\n\n## Description\nLevel 4 (Mnemonic Transceivers) in Communication & Data: Direct thought-based trans-neural communication across stellar networks."
  },
  {
    "id": "society_communication_lvl_5",
    "category": "society_communication",
    "name": "Communication & Data (Level 5: Quantum Signaler)",
    "level": 5,
    "sphere_key": "society_communication",
    "description": "Level 5 (Quantum Signaler) in Communication & Data: Real-time instantaneous FTL communication using quantum entanglement with zero latency.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Communication & Data (Level 5: Quantum Signaler)\n\n**Category**: SOCIETY COMMUNICATION\n\n## Description\nLevel 5 (Quantum Signaler) in Communication & Data: Real-time instantaneous FTL communication using quantum entanglement with zero latency."
  },
  {
    "id": "society_devices_lvl_0",
    "category": "society_devices",
    "name": "Devices & Apparatus (Level 0: Simple Mechanical)",
    "level": 0,
    "sphere_key": "society_devices",
    "description": "Level 0 (Simple Mechanical) in Devices & Apparatus: Levers, pulleys, wedges, and wheels.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Devices & Apparatus (Level 0: Simple Mechanical)\n\n**Category**: SOCIETY DEVICES\n\n## Description\nLevel 0 (Simple Mechanical) in Devices & Apparatus: Levers, pulleys, wedges, and wheels."
  },
  {
    "id": "society_devices_lvl_1",
    "category": "society_devices",
    "name": "Devices & Apparatus (Level 1: Steam & Electric)",
    "level": 1,
    "sphere_key": "society_devices",
    "description": "Level 1 (Steam & Electric) in Devices & Apparatus: Steam-powered machines, early DC electrical devices, and clockwork mechanisms.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Devices & Apparatus (Level 1: Steam & Electric)\n\n**Category**: SOCIETY DEVICES\n\n## Description\nLevel 1 (Steam & Electric) in Devices & Apparatus: Steam-powered machines, early DC electrical devices, and clockwork mechanisms."
  },
  {
    "id": "society_devices_lvl_2",
    "category": "society_devices",
    "name": "Devices & Apparatus (Level 2: Integrated Circuits)",
    "level": 2,
    "sphere_key": "society_devices",
    "description": "Level 2 (Integrated Circuits) in Devices & Apparatus: Personal computers, smartphones, passive sensors, and modern silicon electronics.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Devices & Apparatus (Level 2: Integrated Circuits)\n\n**Category**: SOCIETY DEVICES\n\n## Description\nLevel 2 (Integrated Circuits) in Devices & Apparatus: Personal computers, smartphones, passive sensors, and modern silicon electronics."
  },
  {
    "id": "society_devices_lvl_3",
    "category": "society_devices",
    "name": "Devices & Apparatus (Level 3: Robotics & AI)",
    "level": 3,
    "sphere_key": "society_devices",
    "description": "Level 3 (Robotics & AI) in Devices & Apparatus: Modular digital devices, advanced robotics, self-aware automata, and quantum computing.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Devices & Apparatus (Level 3: Robotics & AI)\n\n**Category**: SOCIETY DEVICES\n\n## Description\nLevel 3 (Robotics & AI) in Devices & Apparatus: Modular digital devices, advanced robotics, self-aware automata, and quantum computing."
  },
  {
    "id": "society_devices_lvl_4",
    "category": "society_devices",
    "name": "Devices & Apparatus (Level 4: Brain-Computer Interfaces)",
    "level": 4,
    "sphere_key": "society_devices",
    "description": "Level 4 (Brain-Computer Interfaces) in Devices & Apparatus: Trans-neural interfaces, nanocarbon smart-devices, and molecular machines.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Devices & Apparatus (Level 4: Brain-Computer Interfaces)\n\n**Category**: SOCIETY DEVICES\n\n## Description\nLevel 4 (Brain-Computer Interfaces) in Devices & Apparatus: Trans-neural interfaces, nanocarbon smart-devices, and molecular machines."
  },
  {
    "id": "society_devices_lvl_5",
    "category": "society_devices",
    "name": "Devices & Apparatus (Level 5: Holophotonic Projected)",
    "level": 5,
    "sphere_key": "society_devices",
    "description": "Level 5 (Holophotonic Projected) in Devices & Apparatus: Weightless solid-light devices projected on demand from a Fine-sized emitter library.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Devices & Apparatus (Level 5: Holophotonic Projected)\n\n**Category**: SOCIETY DEVICES\n\n## Description\nLevel 5 (Holophotonic Projected) in Devices & Apparatus: Weightless solid-light devices projected on demand from a Fine-sized emitter library."
  },
  {
    "id": "society_education_lvl_0",
    "category": "society_education",
    "name": "Education & Archives (Level 0: Oral Tradition)",
    "level": 0,
    "sphere_key": "society_education",
    "description": "Level 0 (Oral Tradition) in Education & Archives: Apprenticeships, elders, and oral transmission of survival and tribal lore (+2 Alertness, +2 Survival, 1 Skill +2).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Education & Archives (Level 0: Oral Tradition)\n\n**Category**: SOCIETY EDUCATION\n\n## Description\nLevel 0 (Oral Tradition) in Education & Archives: Apprenticeships, elders, and oral transmission of survival and tribal lore (+2 Alertness, +2 Survival, 1 Skill +2)."
  },
  {
    "id": "society_education_lvl_1",
    "category": "society_education",
    "name": "Education & Archives (Level 1: Guilds & Print)",
    "level": 1,
    "sphere_key": "society_education",
    "description": "Level 1 (Guilds & Print) in Education & Archives: Written archives, universities, and vocational guild apprenticeships (2 Vocation skills +2, 4 Skills +2).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Education & Archives (Level 1: Guilds & Print)\n\n**Category**: SOCIETY EDUCATION\n\n## Description\nLevel 1 (Guilds & Print) in Education & Archives: Written archives, universities, and vocational guild apprenticeships (2 Vocation skills +2, 4 Skills +2)."
  },
  {
    "id": "society_education_lvl_2",
    "category": "society_education",
    "name": "Education & Archives (Level 2: Modern Education)",
    "level": 2,
    "sphere_key": "society_education",
    "description": "Level 2 (Modern Education) in Education & Archives: Standardized public and higher education supported by digital databases (+20 Skill Points).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Education & Archives (Level 2: Modern Education)\n\n**Category**: SOCIETY EDUCATION\n\n## Description\nLevel 2 (Modern Education) in Education & Archives: Standardized public and higher education supported by digital databases (+20 Skill Points)."
  },
  {
    "id": "society_education_lvl_3",
    "category": "society_education",
    "name": "Education & Archives (Level 3: Advanced Stellar Education)",
    "level": 3,
    "sphere_key": "society_education",
    "description": "Level 3 (Advanced Stellar Education) in Education & Archives: Immersive AR/VR training academies and system-wide knowledge archives (+30 Skill Points).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Education & Archives (Level 3: Advanced Stellar Education)\n\n**Category**: SOCIETY EDUCATION\n\n## Description\nLevel 3 (Advanced Stellar Education) in Education & Archives: Immersive AR/VR training academies and system-wide knowledge archives (+30 Skill Points)."
  },
  {
    "id": "society_education_lvl_4",
    "category": "society_education",
    "name": "Education & Archives (Level 4: Trans-Neural Education)",
    "level": 4,
    "sphere_key": "society_education",
    "description": "Level 4 (Trans-Neural Education) in Education & Archives: Direct neural skill-circuitry conditioning and AI-guided instruction (+40 Skill Points).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Education & Archives (Level 4: Trans-Neural Education)\n\n**Category**: SOCIETY EDUCATION\n\n## Description\nLevel 4 (Trans-Neural Education) in Education & Archives: Direct neural skill-circuitry conditioning and AI-guided instruction (+40 Skill Points)."
  },
  {
    "id": "society_education_lvl_5",
    "category": "society_education",
    "name": "Education & Archives (Level 5: Cutting-Edge Bastion Archives)",
    "level": 5,
    "sphere_key": "society_education",
    "description": "Level 5 (Cutting-Edge Bastion Archives) in Education & Archives: Instantaneous cognitive synthesis and gestational super-intellect complexes (+50 Skill Points).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Education & Archives (Level 5: Cutting-Edge Bastion Archives)\n\n**Category**: SOCIETY EDUCATION\n\n## Description\nLevel 5 (Cutting-Edge Bastion Archives) in Education & Archives: Instantaneous cognitive synthesis and gestational super-intellect complexes (+50 Skill Points)."
  },
  {
    "id": "society_energy_lvl_0",
    "category": "society_energy",
    "name": "Energy & Power Generation (Level 0: Biomass)",
    "level": 0,
    "sphere_key": "society_energy",
    "description": "Level 0 (Biomass) in Energy & Power Generation: Muscle power, fire, wind, water wheels, and organic fuels.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Energy & Power Generation (Level 0: Biomass)\n\n**Category**: SOCIETY ENERGY\n\n## Description\nLevel 0 (Biomass) in Energy & Power Generation: Muscle power, fire, wind, water wheels, and organic fuels."
  },
  {
    "id": "society_energy_lvl_1",
    "category": "society_energy",
    "name": "Energy & Power Generation (Level 1: Fossil Fuels)",
    "level": 1,
    "sphere_key": "society_energy",
    "description": "Level 1 (Fossil Fuels) in Energy & Power Generation: Coal, steam boilers, oil, and early internal combustion.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Energy & Power Generation (Level 1: Fossil Fuels)\n\n**Category**: SOCIETY ENERGY\n\n## Description\nLevel 1 (Fossil Fuels) in Energy & Power Generation: Coal, steam boilers, oil, and early internal combustion."
  },
  {
    "id": "society_energy_lvl_2",
    "category": "society_energy",
    "name": "Energy & Power Generation (Level 2: Nuclear & Renewables)",
    "level": 2,
    "sphere_key": "society_energy",
    "description": "Level 2 (Nuclear & Renewables) in Energy & Power Generation: Advanced hydrocarbons, atomic fission reactors, solar arrays, and wind turbines.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Energy & Power Generation (Level 2: Nuclear & Renewables)\n\n**Category**: SOCIETY ENERGY\n\n## Description\nLevel 2 (Nuclear & Renewables) in Energy & Power Generation: Advanced hydrocarbons, atomic fission reactors, solar arrays, and wind turbines."
  },
  {
    "id": "society_energy_lvl_3",
    "category": "society_energy",
    "name": "Energy & Power Generation (Level 3: Fusion Power)",
    "level": 3,
    "sphere_key": "society_energy",
    "description": "Level 3 (Fusion Power) in Energy & Power Generation: Compact thorium reactors, hydrogen fuel cells, and helium-3 fusion cores.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Energy & Power Generation (Level 3: Fusion Power)\n\n**Category**: SOCIETY ENERGY\n\n## Description\nLevel 3 (Fusion Power) in Energy & Power Generation: Compact thorium reactors, hydrogen fuel cells, and helium-3 fusion cores."
  },
  {
    "id": "society_energy_lvl_4",
    "category": "society_energy",
    "name": "Energy & Power Generation (Level 4: Antimatter)",
    "level": 4,
    "sphere_key": "society_energy",
    "description": "Level 4 (Antimatter) in Energy & Power Generation: Antimatter containment pods, cold fusion, kinetic reactors, and Aetherium integration.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Energy & Power Generation (Level 4: Antimatter)\n\n**Category**: SOCIETY ENERGY\n\n## Description\nLevel 4 (Antimatter) in Energy & Power Generation: Antimatter containment pods, cold fusion, kinetic reactors, and Aetherium integration."
  },
  {
    "id": "society_energy_lvl_5",
    "category": "society_energy",
    "name": "Energy & Power Generation (Level 5: Zero-Point & Quantum)",
    "level": 5,
    "sphere_key": "society_energy",
    "description": "Level 5 (Zero-Point & Quantum) in Energy & Power Generation: Dimensional siphons, dark energy conduits, and matter-energy conversion harvesting reality itself.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Energy & Power Generation (Level 5: Zero-Point & Quantum)\n\n**Category**: SOCIETY ENERGY\n\n## Description\nLevel 5 (Zero-Point & Quantum) in Energy & Power Generation: Dimensional siphons, dark energy conduits, and matter-energy conversion harvesting reality itself."
  },
  {
    "id": "society_manufacturing_lvl_0",
    "category": "society_manufacturing",
    "name": "Manufacturing & Industry (Level 0: Handmade (Tier 0: x1))",
    "level": 0,
    "sphere_key": "society_manufacturing",
    "description": "Level 0 (Handmade (Tier 0: x1)) in Manufacturing & Industry: Basic goods produced by hand using stone, bone, or wood tools.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Manufacturing & Industry (Level 0: Handmade (Tier 0: x1))\n\n**Category**: SOCIETY MANUFACTURING\n\n## Description\nLevel 0 (Handmade (Tier 0: x1)) in Manufacturing & Industry: Basic goods produced by hand using stone, bone, or wood tools."
  },
  {
    "id": "society_manufacturing_lvl_1",
    "category": "society_manufacturing",
    "name": "Manufacturing & Industry (Level 1: Crafted & Foundry (Tier 1: x10))",
    "level": 1,
    "sphere_key": "society_manufacturing",
    "description": "Level 1 (Crafted & Foundry (Tier 1: x10)) in Manufacturing & Industry: Fire harnessed for metalworking, foundries, and early mechanized assembly.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Manufacturing & Industry (Level 1: Crafted & Foundry (Tier 1: x10))\n\n**Category**: SOCIETY MANUFACTURING\n\n## Description\nLevel 1 (Crafted & Foundry (Tier 1: x10)) in Manufacturing & Industry: Fire harnessed for metalworking, foundries, and early mechanized assembly."
  },
  {
    "id": "society_manufacturing_lvl_2",
    "category": "society_manufacturing",
    "name": "Manufacturing & Industry (Level 2: Mass Industrialization (Tier 2: x50))",
    "level": 2,
    "sphere_key": "society_manufacturing",
    "description": "Level 2 (Mass Industrialization (Tier 2: x50)) in Manufacturing & Industry: Large-scale factory lines, precision machining, and additive 3D printing.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Manufacturing & Industry (Level 2: Mass Industrialization (Tier 2: x50))\n\n**Category**: SOCIETY MANUFACTURING\n\n## Description\nLevel 2 (Mass Industrialization (Tier 2: x50)) in Manufacturing & Industry: Large-scale factory lines, precision machining, and additive 3D printing."
  },
  {
    "id": "society_manufacturing_lvl_3",
    "category": "society_manufacturing",
    "name": "Manufacturing & Industry (Level 3: Memory Materials (Tier 3: x200))",
    "level": 3,
    "sphere_key": "society_manufacturing",
    "description": "Level 3 (Memory Materials (Tier 3: x200)) in Manufacturing & Industry: Automated orbital yards, molecular nanotechnology, and shape-memory fabrication.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Manufacturing & Industry (Level 3: Memory Materials (Tier 3: x200))\n\n**Category**: SOCIETY MANUFACTURING\n\n## Description\nLevel 3 (Memory Materials (Tier 3: x200)) in Manufacturing & Industry: Automated orbital yards, molecular nanotechnology, and shape-memory fabrication."
  },
  {
    "id": "society_manufacturing_lvl_4",
    "category": "society_manufacturing",
    "name": "Manufacturing & Industry (Level 4: Nanoforge & Bio-Vats (Tier 4: x1,000))",
    "level": 4,
    "sphere_key": "society_manufacturing",
    "description": "Level 4 (Nanoforge & Bio-Vats (Tier 4: x1,000)) in Manufacturing & Industry: Molecular assembly swarms and Auluran/Kitin hyper-growth cultivation vats.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Manufacturing & Industry (Level 4: Nanoforge & Bio-Vats (Tier 4: x1,000))\n\n**Category**: SOCIETY MANUFACTURING\n\n## Description\nLevel 4 (Nanoforge & Bio-Vats (Tier 4: x1,000)) in Manufacturing & Industry: Molecular assembly swarms and Auluran/Kitin hyper-growth cultivation vats."
  },
  {
    "id": "society_manufacturing_lvl_5",
    "category": "society_manufacturing",
    "name": "Manufacturing & Industry (Level 5: Polymatter Genesis (Tier 5: x5,000))",
    "level": 5,
    "sphere_key": "society_manufacturing",
    "description": "Level 5 (Polymatter Genesis (Tier 5: x5,000)) in Manufacturing & Industry: Thought-responsive Polymatter looms and Base Substance Interchange replicators.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Manufacturing & Industry (Level 5: Polymatter Genesis (Tier 5: x5,000))\n\n**Category**: SOCIETY MANUFACTURING\n\n## Description\nLevel 5 (Polymatter Genesis (Tier 5: x5,000)) in Manufacturing & Industry: Thought-responsive Polymatter looms and Base Substance Interchange replicators."
  },
  {
    "id": "society_materials_lvl_0",
    "category": "society_materials",
    "name": "Materials & Metallurgy (Level 0: Natural Materials)",
    "level": 0,
    "sphere_key": "society_materials",
    "description": "Level 0 (Natural Materials) in Materials & Metallurgy: Unworked stone, bone, wood, animal hides, and early bronze/iron (25% DR, x0.25 SP).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Materials & Metallurgy (Level 0: Natural Materials)\n\n**Category**: SOCIETY MATERIALS\n\n## Description\nLevel 0 (Natural Materials) in Materials & Metallurgy: Unworked stone, bone, wood, animal hides, and early bronze/iron (25% DR, x0.25 SP)."
  },
  {
    "id": "society_materials_lvl_1",
    "category": "society_materials",
    "name": "Materials & Metallurgy (Level 1: Synthetic & Steel Alloys)",
    "level": 1,
    "sphere_key": "society_materials",
    "description": "Level 1 (Synthetic & Steel Alloys) in Materials & Metallurgy: High-carbon steel, wrought iron, and early industrial plastics (50% DR, x0.5 SP).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Materials & Metallurgy (Level 1: Synthetic & Steel Alloys)\n\n**Category**: SOCIETY MATERIALS\n\n## Description\nLevel 1 (Synthetic & Steel Alloys) in Materials & Metallurgy: High-carbon steel, wrought iron, and early industrial plastics (50% DR, x0.5 SP)."
  },
  {
    "id": "society_materials_lvl_2",
    "category": "society_materials",
    "name": "Materials & Metallurgy (Level 2: Advanced Composites)",
    "level": 2,
    "sphere_key": "society_materials",
    "description": "Level 2 (Advanced Composites) in Materials & Metallurgy: Ballistic kevlar weaves, strike-face ceramics, and titanium alloys (75% DR, x1.0 SP).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Materials & Metallurgy (Level 2: Advanced Composites)\n\n**Category**: SOCIETY MATERIALS\n\n## Description\nLevel 2 (Advanced Composites) in Materials & Metallurgy: Ballistic kevlar weaves, strike-face ceramics, and titanium alloys (75% DR, x1.0 SP)."
  },
  {
    "id": "society_materials_lvl_3",
    "category": "society_materials",
    "name": "Materials & Metallurgy (Level 3: Metamaterials & Plasteel)",
    "level": 3,
    "sphere_key": "society_materials",
    "description": "Level 3 (Metamaterials & Plasteel) in Materials & Metallurgy: Space-age plasteel, impact gel, Kitin hive-resin, and biomaterials (100% DR, x1.5 SP).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Materials & Metallurgy (Level 3: Metamaterials & Plasteel)\n\n**Category**: SOCIETY MATERIALS\n\n## Description\nLevel 3 (Metamaterials & Plasteel) in Materials & Metallurgy: Space-age plasteel, impact gel, Kitin hive-resin, and biomaterials (100% DR, x1.5 SP)."
  },
  {
    "id": "society_materials_lvl_4",
    "category": "society_materials",
    "name": "Materials & Metallurgy (Level 4: Nanotechnology)",
    "level": 4,
    "sphere_key": "society_materials",
    "description": "Level 4 (Nanotechnology) in Materials & Metallurgy: Self-repairing nanocarbon, phase-shift alloys, and Alterian sunglass laminates (125% DR, x2.0 SP).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Materials & Metallurgy (Level 4: Nanotechnology)\n\n**Category**: SOCIETY MATERIALS\n\n## Description\nLevel 4 (Nanotechnology) in Materials & Metallurgy: Self-repairing nanocarbon, phase-shift alloys, and Alterian sunglass laminates (125% DR, x2.0 SP)."
  },
  {
    "id": "society_materials_lvl_5",
    "category": "society_materials",
    "name": "Materials & Metallurgy (Level 5: Polymatter & Hard-Light)",
    "level": 5,
    "sphere_key": "society_materials",
    "description": "Level 5 (Polymatter & Hard-Light) in Materials & Metallurgy: Morphic liquid-metal Polymatter and weightless Holophotonic lattices (150% DR, x2.5 SP).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Materials & Metallurgy (Level 5: Polymatter & Hard-Light)\n\n**Category**: SOCIETY MATERIALS\n\n## Description\nLevel 5 (Polymatter & Hard-Light) in Materials & Metallurgy: Morphic liquid-metal Polymatter and weightless Holophotonic lattices (150% DR, x2.5 SP)."
  },
  {
    "id": "society_medicine_lvl_0",
    "category": "society_medicine",
    "name": "Medicine & Healthcare (Level 0: Simple Medicine)",
    "level": 0,
    "sphere_key": "society_medicine",
    "description": "Level 0 (Simple Medicine) in Medicine & Healthcare: Natural remedies, poultices, and herbalism; high mortality for surgery.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Medicine & Healthcare (Level 0: Simple Medicine)\n\n**Category**: SOCIETY MEDICINE\n\n## Description\nLevel 0 (Simple Medicine) in Medicine & Healthcare: Natural remedies, poultices, and herbalism; high mortality for surgery."
  },
  {
    "id": "society_medicine_lvl_1",
    "category": "society_medicine",
    "name": "Medicine & Healthcare (Level 1: Basic Medicine)",
    "level": 1,
    "sphere_key": "society_medicine",
    "description": "Level 1 (Basic Medicine) in Medicine & Healthcare: Germ theory, vaccines, early pharmacology, and X-ray diagnostics.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Medicine & Healthcare (Level 1: Basic Medicine)\n\n**Category**: SOCIETY MEDICINE\n\n## Description\nLevel 1 (Basic Medicine) in Medicine & Healthcare: Germ theory, vaccines, early pharmacology, and X-ray diagnostics."
  },
  {
    "id": "society_medicine_lvl_2",
    "category": "society_medicine",
    "name": "Medicine & Healthcare (Level 2: Focused Medical Sciences)",
    "level": 2,
    "sphere_key": "society_medicine",
    "description": "Level 2 (Focused Medical Sciences) in Medicine & Healthcare: Antibiotics, MRI imaging, precision surgery, and early genetic diagnostics.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Medicine & Healthcare (Level 2: Focused Medical Sciences)\n\n**Category**: SOCIETY MEDICINE\n\n## Description\nLevel 2 (Focused Medical Sciences) in Medicine & Healthcare: Antibiotics, MRI imaging, precision surgery, and early genetic diagnostics."
  },
  {
    "id": "society_medicine_lvl_3",
    "category": "society_medicine",
    "name": "Medicine & Healthcare (Level 3: Augmentations & Cloning)",
    "level": 3,
    "sphere_key": "society_medicine",
    "description": "Level 3 (Augmentations & Cloning) in Medicine & Healthcare: Cybernetic prosthetics, cloned replacement organs, med-gel, and century-plus longevity.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Medicine & Healthcare (Level 3: Augmentations & Cloning)\n\n**Category**: SOCIETY MEDICINE\n\n## Description\nLevel 3 (Augmentations & Cloning) in Medicine & Healthcare: Cybernetic prosthetics, cloned replacement organs, med-gel, and century-plus longevity."
  },
  {
    "id": "society_medicine_lvl_4",
    "category": "society_medicine",
    "name": "Medicine & Healthcare (Level 4: Clinical Immortality)",
    "level": 4,
    "sphere_key": "society_medicine",
    "description": "Level 4 (Clinical Immortality) in Medicine & Healthcare: Cellular reversal, regen-tanks, bioware grafts, and cortical stack re-sleeving.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Medicine & Healthcare (Level 4: Clinical Immortality)\n\n**Category**: SOCIETY MEDICINE\n\n## Description\nLevel 4 (Clinical Immortality) in Medicine & Healthcare: Cellular reversal, regen-tanks, bioware grafts, and cortical stack re-sleeving."
  },
  {
    "id": "society_medicine_lvl_5",
    "category": "society_medicine",
    "name": "Medicine & Healthcare (Level 5: Retro-Genetic Engineering)",
    "level": 5,
    "sphere_key": "society_medicine",
    "description": "Level 5 (Retro-Genetic Engineering) in Medicine & Healthcare: Instantaneous genetic rewriting, Matter Reconstruction Forges, and full digital immortality.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Medicine & Healthcare (Level 5: Retro-Genetic Engineering)\n\n**Category**: SOCIETY MEDICINE\n\n## Description\nLevel 5 (Retro-Genetic Engineering) in Medicine & Healthcare: Instantaneous genetic rewriting, Matter Reconstruction Forges, and full digital immortality."
  },
  {
    "id": "society_society_lvl_0",
    "category": "society_society",
    "name": "Structure & Governance (Level 0: Tribal)",
    "level": 0,
    "sphere_key": "society_society",
    "description": "Level 0 (Tribal) in Structure & Governance: Small nomadic families, clans, and animistic social structures.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Structure & Governance (Level 0: Tribal)\n\n**Category**: SOCIETY SOCIETY\n\n## Description\nLevel 0 (Tribal) in Structure & Governance: Small nomadic families, clans, and animistic social structures."
  },
  {
    "id": "society_society_lvl_1",
    "category": "society_society",
    "name": "Structure & Governance (Level 1: Early Civilizations)",
    "level": 1,
    "sphere_key": "society_society",
    "description": "Level 1 (Early Civilizations) in Structure & Governance: Urbanized nation-states, feudal dynasties, and codified legal hierarchies.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Structure & Governance (Level 1: Early Civilizations)\n\n**Category**: SOCIETY SOCIETY\n\n## Description\nLevel 1 (Early Civilizations) in Structure & Governance: Urbanized nation-states, feudal dynasties, and codified legal hierarchies."
  },
  {
    "id": "society_society_lvl_2",
    "category": "society_society",
    "name": "Structure & Governance (Level 2: Modern Societies)",
    "level": 2,
    "sphere_key": "society_society",
    "description": "Level 2 (Modern Societies) in Structure & Governance: Globalized planetary governments, international treaties, and connected media.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Structure & Governance (Level 2: Modern Societies)\n\n**Category**: SOCIETY SOCIETY\n\n## Description\nLevel 2 (Modern Societies) in Structure & Governance: Globalized planetary governments, international treaties, and connected media."
  },
  {
    "id": "society_society_lvl_3",
    "category": "society_society",
    "name": "Structure & Governance (Level 3: Advanced Societies)",
    "level": 3,
    "sphere_key": "society_society",
    "description": "Level 3 (Advanced Societies) in Structure & Governance: System-wide governance, corporate syndicates, and interstellar jump-gate coalitions.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Structure & Governance (Level 3: Advanced Societies)\n\n**Category**: SOCIETY SOCIETY\n\n## Description\nLevel 3 (Advanced Societies) in Structure & Governance: System-wide governance, corporate syndicates, and interstellar jump-gate coalitions."
  },
  {
    "id": "society_society_lvl_4",
    "category": "society_society",
    "name": "Structure & Governance (Level 4: Highly Interconnected)",
    "level": 4,
    "sphere_key": "society_society",
    "description": "Level 4 (Highly Interconnected) in Structure & Governance: Multi-sector empires, Mesh-integrated meritocracies, and cosmopolitan trade combines.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Structure & Governance (Level 4: Highly Interconnected)\n\n**Category**: SOCIETY SOCIETY\n\n## Description\nLevel 4 (Highly Interconnected) in Structure & Governance: Multi-sector empires, Mesh-integrated meritocracies, and cosmopolitan trade combines."
  },
  {
    "id": "society_society_lvl_5",
    "category": "society_society",
    "name": "Structure & Governance (Level 5: Post-Scarcity)",
    "level": 5,
    "sphere_key": "society_society",
    "description": "Level 5 (Post-Scarcity) in Structure & Governance: Gestalted super-intellect governance and post-scarcity societal harmony without resource need.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Structure & Governance (Level 5: Post-Scarcity)\n\n**Category**: SOCIETY SOCIETY\n\n## Description\nLevel 5 (Post-Scarcity) in Structure & Governance: Gestalted super-intellect governance and post-scarcity societal harmony without resource need."
  },
  {
    "id": "society_synthetics_lvl_0",
    "category": "society_synthetics",
    "name": "Synthetics & AI Rights (Level 0: Non-Existent)",
    "level": 0,
    "sphere_key": "society_synthetics",
    "description": "Level 0 (Non-Existent) in Synthetics & AI Rights: No mechanical computation or artificial intelligence.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Synthetics & AI Rights (Level 0: Non-Existent)\n\n**Category**: SOCIETY SYNTHETICS\n\n## Description\nLevel 0 (Non-Existent) in Synthetics & AI Rights: No mechanical computation or artificial intelligence."
  },
  {
    "id": "society_synthetics_lvl_1",
    "category": "society_synthetics",
    "name": "Synthetics & AI Rights (Level 1: Clockwork Automata)",
    "level": 1,
    "sphere_key": "society_synthetics",
    "description": "Level 1 (Clockwork Automata) in Synthetics & AI Rights: Purely mechanical gear-driven automata and punch-card looms without cognition.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Synthetics & AI Rights (Level 1: Clockwork Automata)\n\n**Category**: SOCIETY SYNTHETICS\n\n## Description\nLevel 1 (Clockwork Automata) in Synthetics & AI Rights: Purely mechanical gear-driven automata and punch-card looms without cognition."
  },
  {
    "id": "society_synthetics_lvl_2",
    "category": "society_synthetics",
    "name": "Synthetics & AI Rights (Level 2: Reactive & Limited Memory)",
    "level": 2,
    "sphere_key": "society_synthetics",
    "description": "Level 2 (Reactive & Limited Memory) in Synthetics & AI Rights: Smart devices, virtual assistants, and simple programmed industrial robots.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Synthetics & AI Rights (Level 2: Reactive & Limited Memory)\n\n**Category**: SOCIETY SYNTHETICS\n\n## Description\nLevel 2 (Reactive & Limited Memory) in Synthetics & AI Rights: Smart devices, virtual assistants, and simple programmed industrial robots."
  },
  {
    "id": "society_synthetics_lvl_3",
    "category": "society_synthetics",
    "name": "Synthetics & AI Rights (Level 3: Self-Aware Algorithm (Theory of Mind))",
    "level": 3,
    "sphere_key": "society_synthetics",
    "description": "Level 3 (Self-Aware Algorithm (Theory of Mind)) in Synthetics & AI Rights: Conscious self-aware AI and advanced automata capable of understanding emotions.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Synthetics & AI Rights (Level 3: Self-Aware Algorithm (Theory of Mind))\n\n**Category**: SOCIETY SYNTHETICS\n\n## Description\nLevel 3 (Self-Aware Algorithm (Theory of Mind)) in Synthetics & AI Rights: Conscious self-aware AI and advanced automata capable of understanding emotions."
  },
  {
    "id": "society_synthetics_lvl_4",
    "category": "society_synthetics",
    "name": "Synthetics & AI Rights (Level 4: Artificial General Intelligence (AGI))",
    "level": 4,
    "sphere_key": "society_synthetics",
    "description": "Level 4 (Artificial General Intelligence (AGI)) in Synthetics & AI Rights: Androids, Sentient Machines, and Intellect Constructs indistinguishable from organic sapience.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Synthetics & AI Rights (Level 4: Artificial General Intelligence (AGI))\n\n**Category**: SOCIETY SYNTHETICS\n\n## Description\nLevel 4 (Artificial General Intelligence (AGI)) in Synthetics & AI Rights: Androids, Sentient Machines, and Intellect Constructs indistinguishable from organic sapience."
  },
  {
    "id": "society_synthetics_lvl_5",
    "category": "society_synthetics",
    "name": "Synthetics & AI Rights (Level 5: Hyper Intellect (ASI))",
    "level": 5,
    "sphere_key": "society_synthetics",
    "description": "Level 5 (Hyper Intellect (ASI)) in Synthetics & AI Rights: Gestalted superintelligences surpassing organic wisdom (such as Mekan Prime and Bastion).",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Synthetics & AI Rights (Level 5: Hyper Intellect (ASI))\n\n**Category**: SOCIETY SYNTHETICS\n\n## Description\nLevel 5 (Hyper Intellect (ASI)) in Synthetics & AI Rights: Gestalted superintelligences surpassing organic wisdom (such as Mekan Prime and Bastion)."
  },
  {
    "id": "society_weaponry_lvl_0",
    "category": "society_weaponry",
    "name": "Weaponry & Defense Grids (Level 0: Melee & Archaic)",
    "level": 0,
    "sphere_key": "society_weaponry",
    "description": "Level 0 (Melee & Archaic) in Weaponry & Defense Grids: Unarmed strikes, stone/metal blades, bows, crossbows, and slings.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Weaponry & Defense Grids (Level 0: Melee & Archaic)\n\n**Category**: SOCIETY WEAPONRY\n\n## Description\nLevel 0 (Melee & Archaic) in Weaponry & Defense Grids: Unarmed strikes, stone/metal blades, bows, crossbows, and slings."
  },
  {
    "id": "society_weaponry_lvl_1",
    "category": "society_weaponry",
    "name": "Weaponry & Defense Grids (Level 1: Gunpowder & Industrial)",
    "level": 1,
    "sphere_key": "society_weaponry",
    "description": "Level 1 (Gunpowder & Industrial) in Weaponry & Defense Grids: Black-powder muskets, rifled firearms, steam cannons, and early chemical explosives.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Weaponry & Defense Grids (Level 1: Gunpowder & Industrial)\n\n**Category**: SOCIETY WEAPONRY\n\n## Description\nLevel 1 (Gunpowder & Industrial) in Weaponry & Defense Grids: Black-powder muskets, rifled firearms, steam cannons, and early chemical explosives."
  },
  {
    "id": "society_weaponry_lvl_2",
    "category": "society_weaponry",
    "name": "Weaponry & Defense Grids (Level 2: Modern Firearms)",
    "level": 2,
    "sphere_key": "society_weaponry",
    "description": "Level 2 (Modern Firearms) in Weaponry & Defense Grids: Caseless automatic ballistics, guided missiles, anti-materiel rifles, and early railgun prototypes.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Weaponry & Defense Grids (Level 2: Modern Firearms)\n\n**Category**: SOCIETY WEAPONRY\n\n## Description\nLevel 2 (Modern Firearms) in Weaponry & Defense Grids: Caseless automatic ballistics, guided missiles, anti-materiel rifles, and early railgun prototypes."
  },
  {
    "id": "society_weaponry_lvl_3",
    "category": "society_weaponry",
    "name": "Weaponry & Defense Grids (Level 3: Directed-Energy & Mag-Rail)",
    "level": 3,
    "sphere_key": "society_weaponry",
    "description": "Level 3 (Directed-Energy & Mag-Rail) in Weaponry & Defense Grids: Laser, ion, plasma, and magnetic coilgun weaponry alongside high-drain energy shields.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Weaponry & Defense Grids (Level 3: Directed-Energy & Mag-Rail)\n\n**Category**: SOCIETY WEAPONRY\n\n## Description\nLevel 3 (Directed-Energy & Mag-Rail) in Weaponry & Defense Grids: Laser, ion, plasma, and magnetic coilgun weaponry alongside high-drain energy shields."
  },
  {
    "id": "society_weaponry_lvl_4",
    "category": "society_weaponry",
    "name": "Weaponry & Defense Grids (Level 4: Nanotech & Force Weaponry)",
    "level": 4,
    "sphere_key": "society_weaponry",
    "description": "Level 4 (Nanotech & Force Weaponry) in Weaponry & Defense Grids: Particle projection cannons, phase-weapons, personal force fields, and tactical singularity warheads.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Weaponry & Defense Grids (Level 4: Nanotech & Force Weaponry)\n\n**Category**: SOCIETY WEAPONRY\n\n## Description\nLevel 4 (Nanotech & Force Weaponry) in Weaponry & Defense Grids: Particle projection cannons, phase-weapons, personal force fields, and tactical singularity warheads."
  },
  {
    "id": "society_weaponry_lvl_5",
    "category": "society_weaponry",
    "name": "Weaponry & Defense Grids (Level 5: Gravitonic & Disintegration)",
    "level": 5,
    "sphere_key": "society_weaponry",
    "description": "Level 5 (Gravitonic & Disintegration) in Weaponry & Defense Grids: Weaponized gravity, disintegration beams, Polymatter morph-weapons, and planetary shield grids.",
    "costs": {
      "bp": 0,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "modifiers": [],
    "modifications": [],
    "critical_details": {
      "score": "",
      "effect": [],
      "success_effect": [],
      "failure_effect": []
    },
    "sockets": {
      "max": 0,
      "used": 0,
      "tier": "Socket",
      "allocated": []
    },
    "body": "# Weaponry & Defense Grids (Level 5: Gravitonic & Disintegration)\n\n**Category**: SOCIETY WEAPONRY\n\n## Description\nLevel 5 (Gravitonic & Disintegration) in Weaponry & Defense Grids: Weaponized gravity, disintegration beams, Polymatter morph-weapons, and planetary shield grids."
  }
];

export {
  DEFAULT_CONDITIONS,
  DEFAULT_DAMAGE_TYPES,
  DEFAULT_DISCIPLINES,
  DEFAULT_MANEUVERS,
  DEFAULT_RULES,
  DEFAULT_MASTER_SOCIETIES
};

export const DEFAULT_TECHNOLOGY = [
  {
    "id": "technology_tl_0",
    "name": "TL 0: Stone Age (Primitive / Pre-Industrial)",
    "tech_level": 0,
    "meta_level": 0,
    "craft_dc": 0,
    "era": "The Stone, Bronze, and Iron Ages",
    "subtitle": "Primitive / Pre-Industrial",
    "wealth_mod": -4,
    "power_sources": [
      "Muscle",
      "Fire",
      "Wind",
      "Water"
    ],
    "species": [
      "Fae",
      "Koban",
      "Thorns"
    ],
    "restricted_skills": [
      "Piloting",
      "Engineering",
      "Computer"
    ],
    "description": "TL 0 describes cultures operating outside complex mechanical technology, relying on organic strength, survival strategies, or inherent metaphysics. Spans Nascent (stone/bone), Standard (bronze/iron/wheel), and Advanced (steel/clockwork/alchemy).",
    "mechanic": "Education Bonus: Alertness +2, Survival +2, 1 Skill +2 (Limited Selection). Cannot select Piloting, Engineering, or Computer skills at character creation. Equipment has the Degrading trait.",
    "note": "Associated Species: Fae, Koban, Thorns."
  },
  {
    "id": "technology_tl_1",
    "name": "TL 1: Metal Age (Industrial / Mechanical)",
    "tech_level": 1,
    "meta_level": 0,
    "craft_dc": 10,
    "era": "The Age of Steam and Combustion",
    "subtitle": "Industrial / Mechanical",
    "wealth_mod": -2,
    "power_sources": [
      "Coal",
      "Steam",
      "Early Fossil Fuels"
    ],
    "species": [
      "Caprians",
      "Orlls",
      "Truldan",
      "Vassoth",
      "Weti"
    ],
    "restricted_skills": [
      "Piloting",
      "Computer"
    ],
    "description": "TL 1 marks the transition from the Iron Age to the Industrial Revolution. Foundries enable mass metallurgy, steam engines, locomotives, rifled firearms, and early DC electricity and biplanes.",
    "mechanic": "Education Bonus: 2 Vocation skills +2, 4 Skills +2 (Limited Selection). Base Cost Modifier: -5 CR. No advanced electronics or energy shielding.",
    "note": "Associated Species: Caprians, Orlls, Truldan, Vassoth, Weti."
  },
  {
    "id": "technology_tl_2",
    "name": "TL 2: Data Age (Digital / Information)",
    "tech_level": 2,
    "meta_level": 0,
    "craft_dc": 20,
    "era": "The Silicon and Plastic Age",
    "subtitle": "Digital / Information",
    "wealth_mod": 0,
    "power_sources": [
      "Advanced Hydrocarbons",
      "Fission",
      "Renewables"
    ],
    "species": [
      "Brei",
      "Dwergs",
      "Prokoss",
      "Qerics",
      "Terran Humans"
    ],
    "description": "TL 2 is comparable to Modern Earth through early solar system colonization. Defined by global digital networks, silicon micro-processing, roller vehicles, orbital rocketry, genetic sequencing, and ballistic kevlar/ceramic armor.",
    "mechanic": "Education Bonus: +20 Skill Points (Modern Education System). Base Cost Modifier: -5 CR. Protective gear features the Ballistic Weave trait.",
    "note": "Associated Species: Brei, Dwergs, Prokoss, Qerics, Terran Humans."
  },
  {
    "id": "technology_tl_3",
    "name": "TL 3: Space Age (Stellar / The Gate Era)",
    "tech_level": 3,
    "meta_level": 0,
    "craft_dc": 30,
    "era": "The Age of Fusion and Expansion",
    "subtitle": "Stellar / The Gate Era",
    "wealth_mod": 2,
    "power_sources": [
      "Thorium",
      "Hydrogen Fuel Cells",
      "Fusion"
    ],
    "species": [
      "Alterians",
      "Dracon Dynasty",
      "Coalition",
      "Outworlds"
    ],
    "description": "TL 3 is the galactic baseline for interstellar expansion via stationary Precursor Jump Gates and early Tangent Space discovery. Features fusion torch ships, GEV hovercraft, myomer walkers, industrial cybernetics, and holographic transceivers. Gravity is spin or thrust only.",
    "mechanic": "Education Bonus: +30 Skill Points (Advanced Education System). Base Cost Modifier: +0 CR. Equipment features the Modular trait (universal ports and batteries).",
    "note": "Associated Species & Factions: Alterians, Dynasty, most Independent factions, Outworlds."
  },
  {
    "id": "technology_tl_4",
    "name": "TL 4: Stellar Age (Galactic / The Warp Era)",
    "tech_level": 4,
    "meta_level": 0,
    "craft_dc": 40,
    "era": "The Age of Antimatter and Field Manipulation",
    "subtitle": "Galactic / The Warp Era",
    "wealth_mod": 4,
    "power_sources": [
      "Antimatter",
      "Cold Fusion",
      "Aetherium Integration"
    ],
    "species": [
      "Impyrium",
      "Aulurans",
      "Manelli",
      "Davae",
      "Sefalin",
      "Syndicate"
    ],
    "description": "TL 4 masters matter and force: artificial grav-plating, inertial dampeners, independent Tangent Drives (Warp), clinical immortality, trans-neural interfaces, nanocarbon smart-matter, and directed-energy/plasma dominance.",
    "mechanic": "Education Bonus: +40 Skill Points (Highly Advanced Education System). Base Cost Modifier: +5 CR. Equipment inherently possesses the Self-Repairing trait (regenerates 1 SP/hour).",
    "note": "Associated Species & Factions: Impyrium, Aulurans, Manelli, Davae, Sefalin, Syndicate."
  },
  {
    "id": "technology_tl_5",
    "name": "TL 5: Galactic Age (Cosmic / The Singularity)",
    "tech_level": 5,
    "meta_level": 0,
    "craft_dc": 50,
    "era": "The Age of Reality Manipulation",
    "subtitle": "Cosmic / The Singularity",
    "wealth_mod": 6,
    "power_sources": [
      "Dimensional Siphons",
      "Matter-Energy Conversion",
      "Zero-Point Energy"
    ],
    "species": [
      "Mekan",
      "Mondi",
      "Sha’Nor"
    ],
    "description": "TL 5 is the apex of material science where hardware and software merge. Defined by thought-responsive Polymatter, solid-light Holophotonics, Dyson megastructures (Mekan Prime, Bastion), dimensional compression, and digital immortality.",
    "mechanic": "Education Bonus: +50 Skill Points (Cutting-Edge Education System). Base Cost Modifier: +10 CR. Equipment features the Morphic (Polymatter) or Weightless (Holophotonic) traits.",
    "note": "Associated Species: Mekan, Mondi, Sha’Nor. (Above TL 5 lies TL X: Transgalactic, the non-player domain of the Progenitors / The Makers)."
  }
];

export const DEFAULT_ECONOMATRIX = COMMODITIES_CATALOG.map(c => ({
  id: `commodity_${c.id}`,
  name: c.name,
  category: 'economatrix',
  economic_type: 'Commodity',
  base_cost: c.baseCostPerTon,
  trade_code_modifiers: `Sources: ${(c.sources || []).join(', ')}; Demands: ${(c.demands || []).join(', ')}`,
  description: `Commodity standard lot: ${c.name}. ${c.notes || 'Standard planetary cargo commodity.'}`,
  mechanic: `Base Cost: ${c.baseCostPerTon} Cr per ton. Source worlds produce with high supply; demand worlds purchase at premium.`,
  note: `Trade codes: Sources [${(c.sources || []).join(', ')}], Demands [${(c.demands || []).join(', ')}]`
}));
