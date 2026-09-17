/**
 * Canonical Traits Database for Tangent SF RP (Species, Occupational, and Origin Traits)
 * Auto-generated from src/data/omnicortex/traits/
 * Total Traits: 286
 *  - Species Basic: 54
 *  - Species Advanced: 57
 *  - Species Elite: 24
 *  - Occupational Traits: 88
 *  - Origin Traits: 63
 */

export const SPECIES_TRAITS_BASIC = [
  {
    "id": "trait-adapted",
    "name": "Adapted",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "No penalties or Damage from one set environment type. Multiple.",
    "description": "No penalties or Damage from one set environment type. Multiple.",
    "mechanics": "No penalties or Damage from one set environment type. Multiple.",
    "mechanic": "No penalties or Damage from one set environment type. Multiple.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Adapted\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nNo penalties or Damage from one set environment type. Multiple.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-aggressiveness",
    "name": "Aggressiveness",
    "category": "traits",
    "trait_type": "Combat",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Decisive tactical aggression in combat, granting +1 bonus to intimidation and breach actions.",
    "description": "Decisive tactical aggression in combat, granting +1 bonus to intimidation and breach actions.",
    "mechanics": "Decisive tactical aggression in combat, granting +1 bonus to intimidation and breach actions.",
    "mechanic": "Decisive tactical aggression in combat, granting +1 bonus to intimidation and breach actions.",
    "rules": "Basic Combat (1 BP).",
    "special_rules": "Basic Combat (1 BP).",
    "modifiers": [
      {
        "target": "Intimidation",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Intimidation"
      },
      {
        "target": "Breach",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Breach"
      }
    ],
    "body": "# Aggressiveness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Combat\n**BP Cost**: 1\n\n## Description\nDecisive tactical aggression in combat, granting +1 bonus to intimidation and breach actions.",
    "notes": "[Modifier] +1 to Intimidation\n[Modifier] +1 to Breach\n[Rule] Basic Combat (1 BP).",
    "notesList": [
      "[Modifier] +1 to Intimidation",
      "[Modifier] +1 to Breach",
      "[Rule] Basic Combat (1 BP)."
    ]
  },
  {
    "id": "trait-alter-form-basic",
    "name": "Alter Form (Basic)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Base Category, Change Appearance only (+5 to Disguise).",
    "description": "Base Category, Change Appearance only (+5 to Disguise).",
    "mechanics": "Base Category, Change Appearance only (+5 to Disguise).",
    "mechanic": "Base Category, Change Appearance only (+5 to Disguise).",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Disguise",
        "type": "skill",
        "value": 5,
        "mode": "inherent",
        "description": "+5 to Disguise"
      }
    ],
    "body": "# Alter Form (Basic)\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nBase Category, Change Appearance only (+5 to Disguise).",
    "notes": "[Modifier] +5 to Disguise\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +5 to Disguise",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-amphibious",
    "name": "Amphibious",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Breathe Air and Water equally well, +10 to Swim Speed.",
    "description": "Breathe Air and Water equally well, +10 to Swim Speed.",
    "mechanics": "Breathe Air and Water equally well, +10 to Swim Speed.",
    "mechanic": "Breathe Air and Water equally well, +10 to Swim Speed.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Swim Speed",
        "type": "skill",
        "value": 10,
        "mode": "inherent",
        "description": "+10 to Swim Speed"
      }
    ],
    "body": "# Amphibious\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nBreathe Air and Water equally well, +10 to Swim Speed.",
    "notes": "[Modifier] +10 to Swim Speed\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +10 to Swim Speed",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-bonded-terrain",
    "name": "Bonded Terrain",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 dodge bonus to AC when in a specific terrain type.",
    "description": "+2 dodge bonus to AC when in a specific terrain type.",
    "mechanics": "+2 dodge bonus to AC when in a specific terrain type.",
    "mechanic": "+2 dodge bonus to AC when in a specific terrain type.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Bonded Terrain\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 dodge bonus to AC when in a specific terrain type.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-bonus-feature",
    "name": "Bonus Feature",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Members of this race select one extra feature of their choice.",
    "description": "Members of this race select one extra feature of their choice.",
    "mechanics": "Members of this race select one extra feature of their choice.",
    "mechanic": "Members of this race select one extra feature of their choice.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Bonus Feature\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nMembers of this race select one extra feature of their choice.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-business-acumen",
    "name": "Business Acumen",
    "category": "traits",
    "trait_type": "Mental",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Keen understanding of market dynamics, trade valuation, credit arbitration, and contract law.",
    "description": "Keen understanding of market dynamics, trade valuation, credit arbitration, and contract law.",
    "mechanics": "Keen understanding of market dynamics, trade valuation, credit arbitration, and contract law.",
    "mechanic": "Keen understanding of market dynamics, trade valuation, credit arbitration, and contract law.",
    "rules": "Basic Mental (1 BP).",
    "special_rules": "Basic Mental (1 BP).",
    "modifiers": [],
    "body": "# Business Acumen\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Mental\n**BP Cost**: 1\n\n## Description\nKeen understanding of market dynamics, trade valuation, credit arbitration, and contract law.",
    "notes": "[Rule] Basic Mental (1 BP).",
    "notesList": [
      "[Rule] Basic Mental (1 BP)."
    ]
  },
  {
    "id": "trait-camouflage",
    "name": "Camouflage",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Choose a favored terrain type. +4 bonus on Stealth checks within that terrain.",
    "description": "Choose a favored terrain type. +4 bonus on Stealth checks within that terrain.",
    "mechanics": "Choose a favored terrain type. +4 bonus on Stealth checks within that terrain.",
    "mechanic": "Choose a favored terrain type. +4 bonus on Stealth checks within that terrain.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Stealth",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Stealth"
      }
    ],
    "body": "# Camouflage\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nChoose a favored terrain type. +4 bonus on Stealth checks within that terrain.",
    "notes": "[Modifier] +4 to Stealth\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +4 to Stealth",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-cat-s-luck",
    "name": "Cat's Luck",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Once per Long Rest make a Reflex Check at Advantage.",
    "description": "Once per Long Rest make a Reflex Check at Advantage.",
    "mechanics": "Once per Long Rest make a Reflex Check at Advantage.",
    "mechanic": "Once per Long Rest make a Reflex Check at Advantage.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Cat's Luck\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nOnce per Long Rest make a Reflex Check at Advantage.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-cave-dweller",
    "name": "Cave Dweller",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+4 bonus on Survival checks made underground.",
    "description": "+4 bonus on Survival checks made underground.",
    "mechanics": "+4 bonus on Survival checks made underground.",
    "mechanic": "+4 bonus on Survival checks made underground.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Survival",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Survival"
      }
    ],
    "body": "# Cave Dweller\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+4 bonus on Survival checks made underground.",
    "notes": "[Modifier] +4 to Survival\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +4 to Survival",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-charismatic",
    "name": "Charismatic",
    "category": "traits",
    "trait_type": "Social",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Natural charm and magnetism that puts strangers at ease and bolsters leadership checks.",
    "description": "Natural charm and magnetism that puts strangers at ease and bolsters leadership checks.",
    "mechanics": "Natural charm and magnetism that puts strangers at ease and bolsters leadership checks.",
    "mechanic": "Natural charm and magnetism that puts strangers at ease and bolsters leadership checks.",
    "rules": "Basic Social (1 BP).",
    "special_rules": "Basic Social (1 BP).",
    "modifiers": [],
    "body": "# Charismatic\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Social\n**BP Cost**: 1\n\n## Description\nNatural charm and magnetism that puts strangers at ease and bolsters leadership checks.",
    "notes": "[Rule] Basic Social (1 BP).",
    "notesList": [
      "[Rule] Basic Social (1 BP)."
    ]
  },
  {
    "id": "trait-combat-training",
    "name": "Combat Training",
    "category": "traits",
    "trait_type": "Combat",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Extensive formal training in tactical firearms, CQB weapon drills, and battlefield maneuvering.",
    "description": "Extensive formal training in tactical firearms, CQB weapon drills, and battlefield maneuvering.",
    "mechanics": "Extensive formal training in tactical firearms, CQB weapon drills, and battlefield maneuvering.",
    "mechanic": "Extensive formal training in tactical firearms, CQB weapon drills, and battlefield maneuvering.",
    "rules": "Basic Combat (2 BP).",
    "special_rules": "Basic Combat (2 BP).",
    "modifiers": [],
    "body": "# Combat Training\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Combat\n**BP Cost**: 2\n\n## Description\nExtensive formal training in tactical firearms, CQB weapon drills, and battlefield maneuvering.",
    "notes": "[Rule] Basic Combat (2 BP).",
    "notesList": [
      "[Rule] Basic Combat (2 BP)."
    ]
  },
  {
    "id": "trait-craftsman",
    "name": "Craftsman",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 to Specific Vocation.",
    "description": "+2 to Specific Vocation.",
    "mechanics": "+2 to Specific Vocation.",
    "mechanic": "+2 to Specific Vocation.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Specific Vocation",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Specific Vocation"
      }
    ],
    "body": "# Craftsman\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 to Specific Vocation.",
    "notes": "[Modifier] +2 to Specific Vocation\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Specific Vocation",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-creativity",
    "name": "Creativity",
    "category": "traits",
    "trait_type": "Mental",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ingenious problem solving and out-of-the-box thinking when crafting, engineering, or improvising solutions.",
    "description": "Ingenious problem solving and out-of-the-box thinking when crafting, engineering, or improvising solutions.",
    "mechanics": "Ingenious problem solving and out-of-the-box thinking when crafting, engineering, or improvising solutions.",
    "mechanic": "Ingenious problem solving and out-of-the-box thinking when crafting, engineering, or improvising solutions.",
    "rules": "Basic Mental (1 BP).",
    "special_rules": "Basic Mental (1 BP).",
    "modifiers": [],
    "body": "# Creativity\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Mental\n**BP Cost**: 1\n\n## Description\nIngenious problem solving and out-of-the-box thinking when crafting, engineering, or improvising solutions.",
    "notes": "[Rule] Basic Mental (1 BP).",
    "notesList": [
      "[Rule] Basic Mental (1 BP)."
    ]
  },
  {
    "id": "trait-digitigrade-ungulated",
    "name": "Digitigrade / Ungulated",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+10 Movement Speed and +4 Stability, Special pants and Boots needed.",
    "description": "+10 Movement Speed and +4 Stability, Special pants and Boots needed.",
    "mechanics": "+10 Movement Speed and +4 Stability, Special pants and Boots needed.",
    "mechanic": "+10 Movement Speed and +4 Stability, Special pants and Boots needed.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "move-walk",
        "type": "combat",
        "value": 10,
        "mode": "inherent",
        "description": "+10 Movement"
      }
    ],
    "body": "# Digitigrade / Ungulated\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+10 Movement Speed and +4 Stability, Special pants and Boots needed.",
    "notes": "[Modifier] +10 Movement\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +10 Movement",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-draconic",
    "name": "Draconic",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Access to purchase various Dragon Traits",
    "description": "Access to purchase various Dragon Traits",
    "mechanics": "Access to purchase various Dragon Traits",
    "mechanic": "Access to purchase various Dragon Traits",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Draconic\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nAccess to purchase various Dragon Traits",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-emissary",
    "name": "Emissary",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Once per day make a check at advantage for Bluff or Diplomacy.",
    "description": "Once per day make a check at advantage for Bluff or Diplomacy.",
    "mechanics": "Once per day make a check at advantage for Bluff or Diplomacy.",
    "mechanic": "Once per day make a check at advantage for Bluff or Diplomacy.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Emissary\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nOnce per day make a check at advantage for Bluff or Diplomacy.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-exoskeleton-partial",
    "name": "Exoskeleton (Partial)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "DR (Strength +2) x2: Str 2, Concealable - Leathery or Scaled.",
    "description": "DR (Strength +2) x2: Str 2, Concealable - Leathery or Scaled.",
    "mechanics": "DR (Strength +2) x2: Str 2, Concealable - Leathery or Scaled.",
    "mechanic": "DR (Strength +2) x2: Str 2, Concealable - Leathery or Scaled.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Exoskeleton (Partial)\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nDR (Strength +2) x2: Str 2, Concealable - Leathery or Scaled.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-focused-study",
    "name": "Focused Study",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gain Skill Focus in a skill of their choice.",
    "description": "Gain Skill Focus in a skill of their choice.",
    "mechanics": "Gain Skill Focus in a skill of their choice.",
    "mechanic": "Gain Skill Focus in a skill of their choice.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Focused Study\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nGain Skill Focus in a skill of their choice.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-frenzy",
    "name": "Frenzy",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).",
    "description": "1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).",
    "mechanics": "1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).",
    "mechanic": "1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Frenzy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-greedy-eye",
    "name": "Greedy Eye",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+4 bonus on all Appraise checks.",
    "description": "+4 bonus on all Appraise checks.",
    "mechanics": "+4 bonus on all Appraise checks.",
    "mechanic": "+4 bonus on all Appraise checks.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Appraise",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Appraise"
      }
    ],
    "body": "# Greedy Eye\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+4 bonus on all Appraise checks.",
    "notes": "[Modifier] +4 to Appraise\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +4 to Appraise",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-hardy",
    "name": "Hardy",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 racial bonus on saving throws against poison, spells, and spell-like abilities.",
    "description": "+2 racial bonus on saving throws against poison, spells, and spell-like abilities.",
    "mechanics": "+2 racial bonus on saving throws against poison, spells, and spell-like abilities.",
    "mechanic": "+2 racial bonus on saving throws against poison, spells, and spell-like abilities.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Hardy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 racial bonus on saving throws against poison, spells, and spell-like abilities.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-healthy",
    "name": "Healthy",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+4 bonus on Fortitude saves against disease and poison",
    "description": "+4 bonus on Fortitude saves against disease and poison",
    "mechanics": "+4 bonus on Fortitude saves against disease and poison",
    "mechanic": "+4 bonus on Fortitude saves against disease and poison",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Fortitude",
        "type": "save",
        "value": 4,
        "mode": "inherent",
        "description": "+4 on Fortitude Checks"
      }
    ],
    "body": "# Healthy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+4 bonus on Fortitude saves against disease and poison",
    "notes": "[Modifier] +4 on Fortitude Checks\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +4 on Fortitude Checks",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-integrated",
    "name": "Integrated",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+1 bonus on Bluff, Disguise, and Knowledge (local) checks.",
    "description": "+1 bonus on Bluff, Disguise, and Knowledge (local) checks.",
    "mechanics": "+1 bonus on Bluff, Disguise, and Knowledge (local) checks.",
    "mechanic": "+1 bonus on Bluff, Disguise, and Knowledge (local) checks.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Bluff",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Bluff"
      }
    ],
    "body": "# Integrated\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+1 bonus on Bluff, Disguise, and Knowledge (local) checks.",
    "notes": "[Modifier] +1 to Bluff\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +1 to Bluff",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-low-light-vision",
    "name": "Low Light Vision",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "See twice as well in low light, Improved Spectrum Vision (lower IR and UV).",
    "description": "See twice as well in low light, Improved Spectrum Vision (lower IR and UV).",
    "mechanics": "See twice as well in low light, Improved Spectrum Vision (lower IR and UV).",
    "mechanic": "See twice as well in low light, Improved Spectrum Vision (lower IR and UV).",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Low Light Vision\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nSee twice as well in low light, Improved Spectrum Vision (lower IR and UV).",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-lucky-lesser",
    "name": "Lucky, Lesser",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+1 racial bonus on all saving throws.",
    "description": "+1 racial bonus on all saving throws.",
    "mechanics": "+1 racial bonus on all saving throws.",
    "mechanic": "+1 racial bonus on all saving throws.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Lucky, Lesser\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+1 racial bonus on all saving throws.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-natural-armor",
    "name": "Natural Armor",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 natural armor bonus.",
    "description": "+2 natural armor bonus.",
    "mechanics": "+2 natural armor bonus.",
    "mechanic": "+2 natural armor bonus.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Natural Armor\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 natural armor bonus.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-negotiation",
    "name": "Negotiation",
    "category": "traits",
    "trait_type": "Social",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adept at bargaining, contract dispute resolution, diplomacy, and finding mutually agreeable compromise.",
    "description": "Adept at bargaining, contract dispute resolution, diplomacy, and finding mutually agreeable compromise.",
    "mechanics": "Adept at bargaining, contract dispute resolution, diplomacy, and finding mutually agreeable compromise.",
    "mechanic": "Adept at bargaining, contract dispute resolution, diplomacy, and finding mutually agreeable compromise.",
    "rules": "Basic Social (1 BP).",
    "special_rules": "Basic Social (1 BP).",
    "modifiers": [],
    "body": "# Negotiation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Social\n**BP Cost**: 1\n\n## Description\nAdept at bargaining, contract dispute resolution, diplomacy, and finding mutually agreeable compromise.",
    "notes": "[Rule] Basic Social (1 BP).",
    "notesList": [
      "[Rule] Basic Social (1 BP)."
    ]
  },
  {
    "id": "trait-networking",
    "name": "Networking",
    "category": "traits",
    "trait_type": "Social",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "A wide network of professional and informal contacts across industries, syndicates, and governments for information and resource gathering.",
    "description": "A wide network of professional and informal contacts across industries, syndicates, and governments for information and resource gathering.",
    "mechanics": "A wide network of professional and informal contacts across industries, syndicates, and governments for information and resource gathering.",
    "mechanic": "A wide network of professional and informal contacts across industries, syndicates, and governments for information and resource gathering.",
    "rules": "Basic Social (2 BP).",
    "special_rules": "Basic Social (2 BP).",
    "modifiers": [],
    "body": "# Networking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Social\n**BP Cost**: 2\n\n## Description\nA wide network of professional and informal contacts across industries, syndicates, and governments for information and resource gathering.",
    "notes": "[Rule] Basic Social (2 BP).",
    "notesList": [
      "[Rule] Basic Social (2 BP)."
    ]
  },
  {
    "id": "trait-patagia",
    "name": "Patagia",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gliding speed of 2x Ground speed, uses Acrobatics skill. Special Top Clothing.",
    "description": "Gliding speed of 2x Ground speed, uses Acrobatics skill. Special Top Clothing.",
    "mechanics": "Gliding speed of 2x Ground speed, uses Acrobatics skill. Special Top Clothing.",
    "mechanic": "Gliding speed of 2x Ground speed, uses Acrobatics skill. Special Top Clothing.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Patagia\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nGliding speed of 2x Ground speed, uses Acrobatics skill. Special Top Clothing.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-patience",
    "name": "Patience",
    "category": "traits",
    "trait_type": "Mental",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Methodical and disciplined mental focus that excels during extended research, stakeouts, and precision crafting.",
    "description": "Methodical and disciplined mental focus that excels during extended research, stakeouts, and precision crafting.",
    "mechanics": "Methodical and disciplined mental focus that excels during extended research, stakeouts, and precision crafting.",
    "mechanic": "Methodical and disciplined mental focus that excels during extended research, stakeouts, and precision crafting.",
    "rules": "Basic Mental (1 BP).",
    "special_rules": "Basic Mental (1 BP).",
    "modifiers": [],
    "body": "# Patience\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Mental\n**BP Cost**: 1\n\n## Description\nMethodical and disciplined mental focus that excels during extended research, stakeouts, and precision crafting.",
    "notes": "[Rule] Basic Mental (1 BP).",
    "notesList": [
      "[Rule] Basic Mental (1 BP)."
    ]
  },
  {
    "id": "trait-physical-fitness",
    "name": "Physical Fitness",
    "category": "traits",
    "trait_type": "Physical",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Superior cardiovascular endurance, stamina, and physical conditioning, granting bonuses on long-distance athletics checks.",
    "description": "Superior cardiovascular endurance, stamina, and physical conditioning, granting bonuses on long-distance athletics checks.",
    "mechanics": "Superior cardiovascular endurance, stamina, and physical conditioning, granting bonuses on long-distance athletics checks.",
    "mechanic": "Superior cardiovascular endurance, stamina, and physical conditioning, granting bonuses on long-distance athletics checks.",
    "rules": "Basic Physical (1 BP).",
    "special_rules": "Basic Physical (1 BP).",
    "modifiers": [],
    "body": "# Physical Fitness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Physical\n**BP Cost**: 1\n\n## Description\nSuperior cardiovascular endurance, stamina, and physical conditioning, granting bonuses on long-distance athletics checks.",
    "notes": "[Rule] Basic Physical (1 BP).",
    "notesList": [
      "[Rule] Basic Physical (1 BP)."
    ]
  },
  {
    "id": "trait-reach",
    "name": "Reach",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Reach of 10 feet.",
    "description": "Reach of 10 feet.",
    "mechanics": "Reach of 10 feet.",
    "mechanic": "Reach of 10 feet.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Reach\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nReach of 10 feet.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-reduced-sustenance",
    "name": "Reduced Sustenance",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Eat and drink half typical.",
    "description": "Eat and drink half typical.",
    "mechanics": "Eat and drink half typical.",
    "mechanic": "Eat and drink half typical.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Reduced Sustenance\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nEat and drink half typical.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-relentless",
    "name": "Relentless",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 bonus on combat maneuver checks made to bull rush or overrun an opponent.",
    "description": "+2 bonus on combat maneuver checks made to bull rush or overrun an opponent.",
    "mechanics": "+2 bonus on combat maneuver checks made to bull rush or overrun an opponent.",
    "mechanic": "+2 bonus on combat maneuver checks made to bull rush or overrun an opponent.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Combat maneuver",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Combat maneuver"
      }
    ],
    "body": "# Relentless\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 bonus on combat maneuver checks made to bull rush or overrun an opponent.",
    "notes": "[Modifier] +2 to Combat maneuver\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Combat maneuver",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-runner",
    "name": "Runner",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+4 racial bonus on saves to avoid fatigue/exhaustion/ill effects from running",
    "description": "+4 racial bonus on saves to avoid fatigue/exhaustion/ill effects from running",
    "mechanics": "+4 racial bonus on saves to avoid fatigue/exhaustion/ill effects from running",
    "mechanic": "+4 racial bonus on saves to avoid fatigue/exhaustion/ill effects from running",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Athletics",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Athletics"
      }
    ],
    "body": "# Runner\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+4 racial bonus on saves to avoid fatigue/exhaustion/ill effects from running",
    "notes": "[Modifier] +2 to Athletics\n[Rule] Basic Species Trait (1 BP).\n[Prerequisite] Strength 1, Agility 1, Stamina 1",
    "notesList": [
      "[Modifier] +2 to Athletics",
      "[Rule] Basic Species Trait (1 BP).",
      "[Prerequisite] Strength 1, Agility 1, Stamina 1"
    ]
  },
  {
    "id": "trait-scent",
    "name": "Scent",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Identify by smell, +4 to Track and Medical Diagnosis (as Analytical Sense of Smell).",
    "description": "Identify by smell, +4 to Track and Medical Diagnosis (as Analytical Sense of Smell).",
    "mechanics": "Identify by smell, +4 to Track and Medical Diagnosis (as Analytical Sense of Smell).",
    "mechanic": "Identify by smell, +4 to Track and Medical Diagnosis (as Analytical Sense of Smell).",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Scent\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nIdentify by smell, +4 to Track and Medical Diagnosis (as Analytical Sense of Smell).",
    "notes": "[Rule] Basic Species Trait (1 BP).\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP).",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "trait-shadow-affinity",
    "name": "Shadow Affinity",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gain +5 to Stealth when in Shadowy or Dim area.",
    "description": "Gain +5 to Stealth when in Shadowy or Dim area.",
    "mechanics": "Gain +5 to Stealth when in Shadowy or Dim area.",
    "mechanic": "Gain +5 to Stealth when in Shadowy or Dim area.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Stealth when in Shadowy or Dim area",
        "type": "skill",
        "value": 5,
        "mode": "inherent",
        "description": "+5 to Stealth when in Shadowy or Dim area"
      }
    ],
    "body": "# Shadow Affinity\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nGain +5 to Stealth when in Shadowy or Dim area.",
    "notes": "[Modifier] +5 to Stealth when in Shadowy or Dim area\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +5 to Stealth when in Shadowy or Dim area",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-shadow-blending",
    "name": "Shadow Blending",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Attacks made against members in dim light have 30% miss chance.",
    "description": "Attacks made against members in dim light have 30% miss chance.",
    "mechanics": "Attacks made against members in dim light have 30% miss chance.",
    "mechanic": "Attacks made against members in dim light have 30% miss chance.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Shadow Blending\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nAttacks made against members in dim light have 30% miss chance.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-shards-of-the-past",
    "name": "Shards of the Past",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Pick two skills. Gain +2 racial bonus on both. Represents past lives.",
    "description": "Pick two skills. Gain +2 racial bonus on both. Represents past lives.",
    "mechanics": "Pick two skills. Gain +2 racial bonus on both. Represents past lives.",
    "mechanic": "Pick two skills. Gain +2 racial bonus on both. Represents past lives.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Shards of the Past\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nPick two skills. Gain +2 racial bonus on both. Represents past lives.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-silent-hunter",
    "name": "Silent Hunter",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Reduce Stealth penalty for moving by 5 / Stealth checks while running at –20",
    "description": "Reduce Stealth penalty for moving by 5 / Stealth checks while running at –20",
    "mechanics": "Reduce Stealth penalty for moving by 5 / Stealth checks while running at –20",
    "mechanic": "Reduce Stealth penalty for moving by 5 / Stealth checks while running at –20",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Silent Hunter\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nReduce Stealth penalty for moving by 5 / Stealth checks while running at –20",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-silver-tongued",
    "name": "Silver Tongued",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 bonus on Diplomacy and Bluff. Can shift attitude up to three steps.",
    "description": "+2 bonus on Diplomacy and Bluff. Can shift attitude up to three steps.",
    "mechanics": "+2 bonus on Diplomacy and Bluff. Can shift attitude up to three steps.",
    "mechanic": "+2 bonus on Diplomacy and Bluff. Can shift attitude up to three steps.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Diplomacy",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Diplomacy"
      },
      {
        "target": "Bluff",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Bluff"
      }
    ],
    "body": "# Silver Tongued\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 bonus on Diplomacy and Bluff. Can shift attitude up to three steps.",
    "notes": "[Modifier] +2 to Diplomacy\n[Modifier] +2 to Bluff\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Diplomacy",
      "[Modifier] +2 to Bluff",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-skill-bonus",
    "name": "Skill Bonus",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gain +2 racial bonus to divide amongst noted skills.",
    "description": "Gain +2 racial bonus to divide amongst noted skills.",
    "mechanics": "Gain +2 racial bonus to divide amongst noted skills.",
    "mechanic": "Gain +2 racial bonus to divide amongst noted skills.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Skill Bonus\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nGain +2 racial bonus to divide amongst noted skills.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-sneaky",
    "name": "Sneaky",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 racial bonus on Stealth checks.",
    "description": "+2 racial bonus on Stealth checks.",
    "mechanics": "+2 racial bonus on Stealth checks.",
    "mechanic": "+2 racial bonus on Stealth checks.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Sneaky\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 racial bonus on Stealth checks.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-sociable",
    "name": "Sociable",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Diplomacy check to change attitude fails by 5 or more, try again within 24 hours.",
    "description": "Diplomacy check to change attitude fails by 5 or more, try again within 24 hours.",
    "mechanics": "Diplomacy check to change attitude fails by 5 or more, try again within 24 hours.",
    "mechanic": "Diplomacy check to change attitude fails by 5 or more, try again within 24 hours.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Sociable\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nDiplomacy check to change attitude fails by 5 or more, try again within 24 hours.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-stable-footed",
    "name": "Stable Footed",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+4 racial Stability bonus while standing on the ground.",
    "description": "+4 racial Stability bonus while standing on the ground.",
    "mechanics": "+4 racial Stability bonus while standing on the ground.",
    "mechanic": "+4 racial Stability bonus while standing on the ground.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Stable Footed\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+4 racial Stability bonus while standing on the ground.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-stalker",
    "name": "Stalker",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gain +2 bonus to Perception and Stealth checks versus one target.",
    "description": "Gain +2 bonus to Perception and Stealth checks versus one target.",
    "mechanics": "Gain +2 bonus to Perception and Stealth checks versus one target.",
    "mechanic": "Gain +2 bonus to Perception and Stealth checks versus one target.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Perception",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Perception"
      },
      {
        "target": "Stealth",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Stealth"
      }
    ],
    "body": "# Stalker\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nGain +2 bonus to Perception and Stealth checks versus one target.",
    "notes": "[Modifier] +2 to Perception\n[Modifier] +2 to Stealth\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Perception",
      "[Modifier] +2 to Stealth",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-static-bonus-feat",
    "name": "Static Bonus Feat",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Choose one feat with no prerequisites. All members gain this feat as a bonus feat.",
    "description": "Choose one feat with no prerequisites. All members gain this feat as a bonus feat.",
    "mechanics": "Choose one feat with no prerequisites. All members gain this feat as a bonus feat.",
    "mechanic": "Choose one feat with no prerequisites. All members gain this feat as a bonus feat.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Static Bonus Feat\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nChoose one feat with no prerequisites. All members gain this feat as a bonus feat.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-street-smarts",
    "name": "Street Smarts",
    "category": "traits",
    "trait_type": "Social",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Familiarity with underworld hierarchy, shadow markets, slang, and avoiding law enforcement radar.",
    "description": "Familiarity with underworld hierarchy, shadow markets, slang, and avoiding law enforcement radar.",
    "mechanics": "Familiarity with underworld hierarchy, shadow markets, slang, and avoiding law enforcement radar.",
    "mechanic": "Familiarity with underworld hierarchy, shadow markets, slang, and avoiding law enforcement radar.",
    "rules": "Basic Social (1 BP).",
    "special_rules": "Basic Social (1 BP).",
    "modifiers": [],
    "body": "# Street Smarts\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Social\n**BP Cost**: 1\n\n## Description\nFamiliarity with underworld hierarchy, shadow markets, slang, and avoiding law enforcement radar.",
    "notes": "[Rule] Basic Social (1 BP).",
    "notesList": [
      "[Rule] Basic Social (1 BP)."
    ]
  },
  {
    "id": "trait-tail",
    "name": "Tail",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 to Trip and Balance Checks and usable as a Club.",
    "description": "+2 to Trip and Balance Checks and usable as a Club.",
    "mechanics": "+2 to Trip and Balance Checks and usable as a Club.",
    "mechanic": "+2 to Trip and Balance Checks and usable as a Club.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Trip",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Trip"
      },
      {
        "target": "Balance",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Balance"
      }
    ],
    "body": "# Tail\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 to Trip and Balance Checks and usable as a Club.",
    "notes": "[Modifier] +2 to Trip\n[Modifier] +2 to Balance\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Trip",
      "[Modifier] +2 to Balance",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-time-management",
    "name": "Time Management",
    "category": "traits",
    "trait_type": "Mental",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Mastery of operational logistics, prioritizing tasks, and maximizing productivity during downtime.",
    "description": "Mastery of operational logistics, prioritizing tasks, and maximizing productivity during downtime.",
    "mechanics": "Mastery of operational logistics, prioritizing tasks, and maximizing productivity during downtime.",
    "mechanic": "Mastery of operational logistics, prioritizing tasks, and maximizing productivity during downtime.",
    "rules": "Basic Mental (1 BP).",
    "special_rules": "Basic Mental (1 BP).",
    "modifiers": [],
    "body": "# Time Management\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Mental\n**BP Cost**: 1\n\n## Description\nMastery of operational logistics, prioritizing tasks, and maximizing productivity during downtime.",
    "notes": "[Rule] Basic Mental (1 BP).",
    "notesList": [
      "[Rule] Basic Mental (1 BP)."
    ]
  },
  {
    "id": "trait-urbanite",
    "name": "Urbanite",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 racial bonus on Diplomacy and Sense Motive checks.",
    "description": "+2 racial bonus on Diplomacy and Sense Motive checks.",
    "mechanics": "+2 racial bonus on Diplomacy and Sense Motive checks.",
    "mechanic": "+2 racial bonus on Diplomacy and Sense Motive checks.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Urbanite\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 racial bonus on Diplomacy and Sense Motive checks.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-versatility",
    "name": "Versatility",
    "category": "traits",
    "trait_type": "General",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Adaptable skill set allowing the character to perform a wide variety of tasks without specialized tools or preparation.",
    "description": "Adaptable skill set allowing the character to perform a wide variety of tasks without specialized tools or preparation.",
    "mechanics": "Adaptable skill set allowing the character to perform a wide variety of tasks without specialized tools or preparation.",
    "mechanic": "Adaptable skill set allowing the character to perform a wide variety of tasks without specialized tools or preparation.",
    "rules": "Basic General (2 BP).",
    "special_rules": "Basic General (2 BP).",
    "modifiers": [],
    "body": "# Versatility\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: General\n**BP Cost**: 2\n\n## Description\nAdaptable skill set allowing the character to perform a wide variety of tasks without specialized tools or preparation.",
    "notes": "[Rule] Basic General (2 BP).",
    "notesList": [
      "[Rule] Basic General (2 BP)."
    ]
  },
  {
    "id": "trait-water-sense",
    "name": "Water-Sense",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Blindsense 30 feet against creatures touching the same body of water.",
    "description": "Blindsense 30 feet against creatures touching the same body of water.",
    "mechanics": "Blindsense 30 feet against creatures touching the same body of water.",
    "mechanic": "Blindsense 30 feet against creatures touching the same body of water.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Water-Sense\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nBlindsense 30 feet against creatures touching the same body of water.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  }
];
export const SPECIES_TRAITS_ADVANCED = [
  {
    "id": "trait-adaptive-features",
    "name": "Adaptive Features",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "May change between specific features during a Light Rest. Ranked.",
    "description": "May change between specific features during a Light Rest. Ranked.",
    "mechanics": "May change between specific features during a Light Rest. Ranked.",
    "mechanic": "May change between specific features during a Light Rest. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Adaptive Features\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nMay change between specific features during a Light Rest. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-adaptive-skill-set",
    "name": "Adaptive Skill Set",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "4 point bonus allotted in a pool. Ranked.",
    "description": "4 point bonus allotted in a pool. Ranked.",
    "mechanics": "4 point bonus allotted in a pool. Ranked.",
    "mechanic": "4 point bonus allotted in a pool. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Adaptive Skill Set\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n4 point bonus allotted in a pool. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-additional-limbs",
    "name": "Additional Limbs",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Another pair of prehensile limbs; Arms, Tentacles or other.",
    "description": "Another pair of prehensile limbs; Arms, Tentacles or other.",
    "mechanics": "Another pair of prehensile limbs; Arms, Tentacles or other.",
    "mechanic": "Another pair of prehensile limbs; Arms, Tentacles or other.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Additional Limbs\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAnother pair of prehensile limbs; Arms, Tentacles or other.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-ageless",
    "name": "Ageless",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Does not suffer penalties nor show any signs of aging.",
    "description": "Does not suffer penalties nor show any signs of aging.",
    "mechanics": "Does not suffer penalties nor show any signs of aging.",
    "mechanic": "Does not suffer penalties nor show any signs of aging.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Ageless\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDoes not suffer penalties nor show any signs of aging.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-all-around-vision",
    "name": "All-Around Vision",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+4 racial bonus on Perception checks and immune to flanking.",
    "description": "+4 racial bonus on Perception checks and immune to flanking.",
    "mechanics": "+4 racial bonus on Perception checks and immune to flanking.",
    "mechanic": "+4 racial bonus on Perception checks and immune to flanking.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# All-Around Vision\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+4 racial bonus on Perception checks and immune to flanking.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-alter-form-adv",
    "name": "Alter Form (Adv)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Base Category, Change Appearance (+5 Disguise)/gender/adjust minor traits.",
    "description": "Base Category, Change Appearance (+5 Disguise)/gender/adjust minor traits.",
    "mechanics": "Base Category, Change Appearance (+5 Disguise)/gender/adjust minor traits.",
    "mechanic": "Base Category, Change Appearance (+5 Disguise)/gender/adjust minor traits.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Alter Form (Adv)\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nBase Category, Change Appearance (+5 Disguise)/gender/adjust minor traits.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-alternate-form",
    "name": "Alternate Form",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "An additional ‘Natural’ Form.",
    "description": "An additional ‘Natural’ Form.",
    "mechanics": "An additional ‘Natural’ Form.",
    "mechanic": "An additional ‘Natural’ Form.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Alternate Form\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAn additional ‘Natural’ Form.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-aquatic-strength",
    "name": "Aquatic Strength",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+1 size category for Combat, Strength or other checks while in water.",
    "description": "+1 size category for Combat, Strength or other checks while in water.",
    "mechanics": "+1 size category for Combat, Strength or other checks while in water.",
    "mechanic": "+1 size category for Combat, Strength or other checks while in water.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Aquatic Strength\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+1 size category for Combat, Strength or other checks while in water.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-aquatic",
    "name": "Aquatic",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+4 racial bonus on Swim checks and may take 10 on swimming checks.",
    "description": "+4 racial bonus on Swim checks and may take 10 on swimming checks.",
    "mechanics": "+4 racial bonus on Swim checks and may take 10 on swimming checks.",
    "mechanic": "+4 racial bonus on Swim checks and may take 10 on swimming checks.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Aquatic\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+4 racial bonus on Swim checks and may take 10 on swimming checks.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-autotroph",
    "name": "Autotroph",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Does not require food/drink, may eat/digest elixirs for effects.",
    "description": "Does not require food/drink, may eat/digest elixirs for effects.",
    "mechanics": "Does not require food/drink, may eat/digest elixirs for effects.",
    "mechanic": "Does not require food/drink, may eat/digest elixirs for effects.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Autotroph\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDoes not require food/drink, may eat/digest elixirs for effects.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-blind-sense",
    "name": "Blind Sense",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Sense unseen objects in a 30 ft Radius or Cone of 60 ft.",
    "description": "Sense unseen objects in a 30 ft Radius or Cone of 60 ft.",
    "mechanics": "Sense unseen objects in a 30 ft Radius or Cone of 60 ft.",
    "mechanic": "Sense unseen objects in a 30 ft Radius or Cone of 60 ft.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Blind Sense\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nSense unseen objects in a 30 ft Radius or Cone of 60 ft.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-adaptation",
    "name": "Bodyform Adaptation",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Physiology shifts to be compatible with the new environment.",
    "description": "Physiology shifts to be compatible with the new environment.",
    "mechanics": "Physiology shifts to be compatible with the new environment.",
    "mechanic": "Physiology shifts to be compatible with the new environment.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Adaptation\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nPhysiology shifts to be compatible with the new environment.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-appendages",
    "name": "Bodyform Appendages",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Shapechange to gain additional limbs (2 arms, legs, tentacles, wings, or fins).",
    "description": "Shapechange to gain additional limbs (2 arms, legs, tentacles, wings, or fins).",
    "mechanics": "Shapechange to gain additional limbs (2 arms, legs, tentacles, wings, or fins).",
    "mechanic": "Shapechange to gain additional limbs (2 arms, legs, tentacles, wings, or fins).",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Appendages\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nShapechange to gain additional limbs (2 arms, legs, tentacles, wings, or fins).",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-armor-options",
    "name": "Bodyform Armor Options",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Upgraded Bodyform Armor, +1 option slot. Ranked.",
    "description": "Upgraded Bodyform Armor, +1 option slot. Ranked.",
    "mechanics": "Upgraded Bodyform Armor, +1 option slot. Ranked.",
    "mechanic": "Upgraded Bodyform Armor, +1 option slot. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Armor Options\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nUpgraded Bodyform Armor, +1 option slot. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-armor",
    "name": "Bodyform Armor",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Shapechange to gain a protective layer.",
    "description": "Shapechange to gain a protective layer.",
    "mechanics": "Shapechange to gain a protective layer.",
    "mechanic": "Shapechange to gain a protective layer.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Armor\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nShapechange to gain a protective layer.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-mutation",
    "name": "Bodyform Mutation",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Adjust to a Racial Trait of which prerequisites are possessed. Ranked.",
    "description": "Adjust to a Racial Trait of which prerequisites are possessed. Ranked.",
    "mechanics": "Adjust to a Racial Trait of which prerequisites are possessed. Ranked.",
    "mechanic": "Adjust to a Racial Trait of which prerequisites are possessed. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Mutation\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAdjust to a Racial Trait of which prerequisites are possessed. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-sizing",
    "name": "Bodyform Sizing",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Shapechange to alter size category 1 step up or down.",
    "description": "Shapechange to alter size category 1 step up or down.",
    "mechanics": "Shapechange to alter size category 1 step up or down.",
    "mechanic": "Shapechange to alter size category 1 step up or down.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Sizing\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nShapechange to alter size category 1 step up or down.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-structure",
    "name": "Bodyform Structure",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Adjust Physical Abilities in equal trade. Once per day for the entire day. Ranked.",
    "description": "Adjust Physical Abilities in equal trade. Once per day for the entire day. Ranked.",
    "mechanics": "Adjust Physical Abilities in equal trade. Once per day for the entire day. Ranked.",
    "mechanic": "Adjust Physical Abilities in equal trade. Once per day for the entire day. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Structure\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAdjust Physical Abilities in equal trade. Once per day for the entire day. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-weapon-options",
    "name": "Bodyform Weapon Options",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Upgraded Bodyform Weapons, +1 option slot. Ranked.",
    "description": "Upgraded Bodyform Weapons, +1 option slot. Ranked.",
    "mechanics": "Upgraded Bodyform Weapons, +1 option slot. Ranked.",
    "mechanic": "Upgraded Bodyform Weapons, +1 option slot. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Weapon Options\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nUpgraded Bodyform Weapons, +1 option slot. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-weapons",
    "name": "Bodyform Weapons",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Shapechange to gain ‘Natural Weaponry’ based on Size",
    "description": "Shapechange to gain ‘Natural Weaponry’ based on Size",
    "mechanics": "Shapechange to gain ‘Natural Weaponry’ based on Size",
    "mechanic": "Shapechange to gain ‘Natural Weaponry’ based on Size",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Weapons\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nShapechange to gain ‘Natural Weaponry’ based on Size",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-brutal",
    "name": "Brutal",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Growths/Spurs doubling Str damage bonus to natural damage (Lethal).",
    "description": "Growths/Spurs doubling Str damage bonus to natural damage (Lethal).",
    "mechanics": "Growths/Spurs doubling Str damage bonus to natural damage (Lethal).",
    "mechanic": "Growths/Spurs doubling Str damage bonus to natural damage (Lethal).",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Brutal\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nGrowths/Spurs doubling Str damage bonus to natural damage (Lethal).",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-chameleon",
    "name": "Chameleon",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Changes color, +5 Stealth or may take 10 on Stealth checks.",
    "description": "Changes color, +5 Stealth or may take 10 on Stealth checks.",
    "mechanics": "Changes color, +5 Stealth or may take 10 on Stealth checks.",
    "mechanic": "Changes color, +5 Stealth or may take 10 on Stealth checks.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Chameleon\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nChanges color, +5 Stealth or may take 10 on Stealth checks.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-chloroplast",
    "name": "Chloroplast",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Gain sustenance from and Double Healing rate while in daylight equivalent light.",
    "description": "Gain sustenance from and Double Healing rate while in daylight equivalent light.",
    "mechanics": "Gain sustenance from and Double Healing rate while in daylight equivalent light.",
    "mechanic": "Gain sustenance from and Double Healing rate while in daylight equivalent light.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Chloroplast\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nGain sustenance from and Double Healing rate while in daylight equivalent light.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-constriction",
    "name": "Constriction",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Grants Improved and Greater Grapple, Crushing damage is 2x Unarmed.",
    "description": "Grants Improved and Greater Grapple, Crushing damage is 2x Unarmed.",
    "mechanics": "Grants Improved and Greater Grapple, Crushing damage is 2x Unarmed.",
    "mechanic": "Grants Improved and Greater Grapple, Crushing damage is 2x Unarmed.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Constriction\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nGrants Improved and Greater Grapple, Crushing damage is 2x Unarmed.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-dark-sight",
    "name": "Dark Sight",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Clear vision in all levels of Light or Darkness (UV, seeing luminescence).",
    "description": "Clear vision in all levels of Light or Darkness (UV, seeing luminescence).",
    "mechanics": "Clear vision in all levels of Light or Darkness (UV, seeing luminescence).",
    "mechanic": "Clear vision in all levels of Light or Darkness (UV, seeing luminescence).",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dark Sight\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nClear vision in all levels of Light or Darkness (UV, seeing luminescence).",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-defensive-training",
    "name": "Defensive Training",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+2 dodge bonus to Defense.",
    "description": "+2 dodge bonus to Defense.",
    "mechanics": "+2 dodge bonus to Defense.",
    "mechanic": "+2 dodge bonus to Defense.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Defensive Training\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+2 dodge bonus to Defense.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-dragon-eyes",
    "name": "Dragon Eyes",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Choose from Low-Light Vision line (Dark, Ether, Thermal). Multiple.",
    "description": "Choose from Low-Light Vision line (Dark, Ether, Thermal). Multiple.",
    "mechanics": "Choose from Low-Light Vision line (Dark, Ether, Thermal). Multiple.",
    "mechanic": "Choose from Low-Light Vision line (Dark, Ether, Thermal). Multiple.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dragon Eyes\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nChoose from Low-Light Vision line (Dark, Ether, Thermal). Multiple.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-dragon-form",
    "name": "Dragon Form",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Alternate Form of a Large size Dragon",
    "description": "Alternate Form of a Large size Dragon",
    "mechanics": "Alternate Form of a Large size Dragon",
    "mechanic": "Alternate Form of a Large size Dragon",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dragon Form\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAlternate Form of a Large size Dragon",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-dragon-might",
    "name": "Dragon Might",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Lift Objects and Grapple as if 1 size category larger. Req: Dragonkin, Str 4.",
    "description": "Lift Objects and Grapple as if 1 size category larger. Req: Dragonkin, Str 4.",
    "mechanics": "Lift Objects and Grapple as if 1 size category larger. Req: Dragonkin, Str 4.",
    "mechanic": "Lift Objects and Grapple as if 1 size category larger. Req: Dragonkin, Str 4.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dragon Might\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nLift Objects and Grapple as if 1 size category larger. Req: Dragonkin, Str 4.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-dragon-mind",
    "name": "Dragon Mind",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Make any Mental Resistance checks with Advantage. Req: Dragonkin, Wis 2.",
    "description": "Make any Mental Resistance checks with Advantage. Req: Dragonkin, Wis 2.",
    "mechanics": "Make any Mental Resistance checks with Advantage. Req: Dragonkin, Wis 2.",
    "mechanic": "Make any Mental Resistance checks with Advantage. Req: Dragonkin, Wis 2.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dragon Mind\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nMake any Mental Resistance checks with Advantage. Req: Dragonkin, Wis 2.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-dragon-senses",
    "name": "Dragon Senses",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Make Awareness Checks with Advantage. Req: Dragonkin, Awareness 11.",
    "description": "Make Awareness Checks with Advantage. Req: Dragonkin, Awareness 11.",
    "mechanics": "Make Awareness Checks with Advantage. Req: Dragonkin, Awareness 11.",
    "mechanic": "Make Awareness Checks with Advantage. Req: Dragonkin, Awareness 11.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dragon Senses\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nMake Awareness Checks with Advantage. Req: Dragonkin, Awareness 11.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-energy-resist",
    "name": "Energy Resist",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "DR 10 vs Chosen Type (Pyro, Cryo, Sonic, Voltic, Corrosive). Multiple/Ranked.",
    "description": "DR 10 vs Chosen Type (Pyro, Cryo, Sonic, Voltic, Corrosive). Multiple/Ranked.",
    "mechanics": "DR 10 vs Chosen Type (Pyro, Cryo, Sonic, Voltic, Corrosive). Multiple/Ranked.",
    "mechanic": "DR 10 vs Chosen Type (Pyro, Cryo, Sonic, Voltic, Corrosive). Multiple/Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Energy Resist\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDR 10 vs Chosen Type (Pyro, Cryo, Sonic, Voltic, Corrosive). Multiple/Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-exoskeleton-light",
    "name": "Exoskeleton (Light)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "DR (Strength +2) x3: Str 3, Noticeable, Special Clothing - Heavy Scales or Plating.",
    "description": "DR (Strength +2) x3: Str 3, Noticeable, Special Clothing - Heavy Scales or Plating.",
    "mechanics": "DR (Strength +2) x3: Str 3, Noticeable, Special Clothing - Heavy Scales or Plating.",
    "mechanic": "DR (Strength +2) x3: Str 3, Noticeable, Special Clothing - Heavy Scales or Plating.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Exoskeleton (Light)\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDR (Strength +2) x3: Str 3, Noticeable, Special Clothing - Heavy Scales or Plating.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-fast-heal",
    "name": "Fast Heal",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Daily Recovery of Health and Vitality during a Light Rest (repeatable).",
    "description": "Daily Recovery of Health and Vitality during a Light Rest (repeatable).",
    "mechanics": "Daily Recovery of Health and Vitality during a Light Rest (repeatable).",
    "mechanic": "Daily Recovery of Health and Vitality during a Light Rest (repeatable).",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Fast Heal\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDaily Recovery of Health and Vitality during a Light Rest (repeatable).",
    "notes": "[Rule] Advanced Species Trait (2 BP).\n[Prerequisite] Stamina 2",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP).",
      "[Prerequisite] Stamina 2"
    ]
  },
  {
    "id": "trait-fey-affinity",
    "name": "Fey Affinity",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Animals treat character as Trusting & Neutral, Friendly.",
    "description": "Animals treat character as Trusting & Neutral, Friendly.",
    "mechanics": "Animals treat character as Trusting & Neutral, Friendly.",
    "mechanic": "Animals treat character as Trusting & Neutral, Friendly.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Fey Affinity\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAnimals treat character as Trusting & Neutral, Friendly.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-fiend-affinity",
    "name": "Fiend Affinity",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Animals treat character as a Predator & Dangerous, Wary.",
    "description": "Animals treat character as a Predator & Dangerous, Wary.",
    "mechanics": "Animals treat character as a Predator & Dangerous, Wary.",
    "mechanic": "Animals treat character as a Predator & Dangerous, Wary.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Fiend Affinity\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAnimals treat character as a Predator & Dangerous, Wary.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-gifted-linguist",
    "name": "Gifted Linguist",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+4 racial bonus on Linguistics checks.",
    "description": "+4 racial bonus on Linguistics checks.",
    "mechanics": "+4 racial bonus on Linguistics checks.",
    "mechanic": "+4 racial bonus on Linguistics checks.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Gifted Linguist\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+4 racial bonus on Linguistics checks.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-hive-connection",
    "name": "Hive Connection",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Allows members to mentally share information on different levels (Special).",
    "description": "Allows members to mentally share information on different levels (Special).",
    "mechanics": "Allows members to mentally share information on different levels (Special).",
    "mechanic": "Allows members to mentally share information on different levels (Special).",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Hive Connection\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAllows members to mentally share information on different levels (Special).",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-longevity",
    "name": "Longevity",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Effectively doubles age categories.",
    "description": "Effectively doubles age categories.",
    "mechanics": "Effectively doubles age categories.",
    "mechanic": "Effectively doubles age categories.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Longevity\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nEffectively doubles age categories.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-lucky-greater",
    "name": "Lucky, Greater",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+2 racial bonus on all saving throws.",
    "description": "+2 racial bonus on all saving throws.",
    "mechanics": "+2 racial bonus on all saving throws.",
    "mechanic": "+2 racial bonus on all saving throws.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Lucky, Greater\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+2 racial bonus on all saving throws.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-master-tinker",
    "name": "Master Tinker",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+2 bonus on Disable Device and Engineering.",
    "description": "+2 bonus on Disable Device and Engineering.",
    "mechanics": "+2 bonus on Disable Device and Engineering.",
    "mechanic": "+2 bonus on Disable Device and Engineering.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [
      {
        "target": "Disable Device",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Disable Device"
      },
      {
        "target": "Engineering",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Engineering"
      }
    ],
    "body": "# Master Tinker\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+2 bonus on Disable Device and Engineering.",
    "notes": "[Modifier] +2 to Disable Device\n[Modifier] +2 to Engineering\n[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Modifier] +2 to Disable Device",
      "[Modifier] +2 to Engineering",
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-mind-speech",
    "name": "Mind Speech",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Telepathic Communication to one subject within 500 ft. Ranked.",
    "description": "Telepathic Communication to one subject within 500 ft. Ranked.",
    "mechanics": "Telepathic Communication to one subject within 500 ft. Ranked.",
    "mechanic": "Telepathic Communication to one subject within 500 ft. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Mind Speech\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nTelepathic Communication to one subject within 500 ft. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-natural-weapons",
    "name": "Natural Weapons",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "A Claw, Fang, Horn or other attack form.",
    "description": "A Claw, Fang, Horn or other attack form.",
    "mechanics": "A Claw, Fang, Horn or other attack form.",
    "mechanic": "A Claw, Fang, Horn or other attack form.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Natural Weapons\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nA Claw, Fang, Horn or other attack form.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-powerful-charge",
    "name": "Powerful Charge",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Charge deals twice the number of damage dice plus 1-1/2 times Str bonus.",
    "description": "Charge deals twice the number of damage dice plus 1-1/2 times Str bonus.",
    "mechanics": "Charge deals twice the number of damage dice plus 1-1/2 times Str bonus.",
    "mechanic": "Charge deals twice the number of damage dice plus 1-1/2 times Str bonus.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Powerful Charge\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nCharge deals twice the number of damage dice plus 1-1/2 times Str bonus.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-prehensile-limbs",
    "name": "Prehensile Limbs",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Fully Prehensile tentacles/off-hands/limbs, make certain checks with Advantage.",
    "description": "Fully Prehensile tentacles/off-hands/limbs, make certain checks with Advantage.",
    "mechanics": "Fully Prehensile tentacles/off-hands/limbs, make certain checks with Advantage.",
    "mechanic": "Fully Prehensile tentacles/off-hands/limbs, make certain checks with Advantage.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Prehensile Limbs\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nFully Prehensile tentacles/off-hands/limbs, make certain checks with Advantage.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-prehensile-tail",
    "name": "Prehensile Tail",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+2 to Climbing and Balance checks and usable as an off-hand. Special Pants.",
    "description": "+2 to Climbing and Balance checks and usable as an off-hand. Special Pants.",
    "mechanics": "+2 to Climbing and Balance checks and usable as an off-hand. Special Pants.",
    "mechanic": "+2 to Climbing and Balance checks and usable as an off-hand. Special Pants.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [
      {
        "target": "Climbing",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Climbing"
      },
      {
        "target": "Balance",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Balance"
      }
    ],
    "body": "# Prehensile Tail\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+2 to Climbing and Balance checks and usable as an off-hand. Special Pants.",
    "notes": "[Modifier] +2 to Climbing\n[Modifier] +2 to Balance\n[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Modifier] +2 to Climbing",
      "[Modifier] +2 to Balance",
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-quadruped",
    "name": "Quadruped",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Four legged, +4 Stability, +10 movement speed. Special Accommodations.",
    "description": "Four legged, +4 Stability, +10 movement speed. Special Accommodations.",
    "mechanics": "Four legged, +4 Stability, +10 movement speed. Special Accommodations.",
    "mechanic": "Four legged, +4 Stability, +10 movement speed. Special Accommodations.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [
      {
        "target": "move-walk",
        "type": "combat",
        "value": 10,
        "mode": "inherent",
        "description": "+10 movement"
      }
    ],
    "body": "# Quadruped\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nFour legged, +4 Stability, +10 movement speed. Special Accommodations.",
    "notes": "[Modifier] +10 movement\n[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Modifier] +10 movement",
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-quick-reactions",
    "name": "Quick Reactions",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Use double Agility score to calculate base Initiative. Req: Racial Agility +1.",
    "description": "Use double Agility score to calculate base Initiative. Req: Racial Agility +1.",
    "mechanics": "Use double Agility score to calculate base Initiative. Req: Racial Agility +1.",
    "mechanic": "Use double Agility score to calculate base Initiative. Req: Racial Agility +1.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Quick Reactions\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nUse double Agility score to calculate base Initiative. Req: Racial Agility +1.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-resistant",
    "name": "Resistant",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+2 racial bonus on saving throws against mind-affecting effects and poison.",
    "description": "+2 racial bonus on saving throws against mind-affecting effects and poison.",
    "mechanics": "+2 racial bonus on saving throws against mind-affecting effects and poison.",
    "mechanic": "+2 racial bonus on saving throws against mind-affecting effects and poison.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Resistant\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+2 racial bonus on saving throws against mind-affecting effects and poison.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-rock-throwing",
    "name": "Rock Throwing",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Range increment 60ft. Damage 2d6 + 1.5 Str. Req: Large.",
    "description": "Range increment 60ft. Damage 2d6 + 1.5 Str. Req: Large.",
    "mechanics": "Range increment 60ft. Damage 2d6 + 1.5 Str. Req: Large.",
    "mechanic": "Range increment 60ft. Damage 2d6 + 1.5 Str. Req: Large.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Rock Throwing\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nRange increment 60ft. Damage 2d6 + 1.5 Str. Req: Large.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-sleepless",
    "name": "Sleepless",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Does not require sleep, may rest to regain metaphysical energy.",
    "description": "Does not require sleep, may rest to regain metaphysical energy.",
    "mechanics": "Does not require sleep, may rest to regain metaphysical energy.",
    "mechanic": "Does not require sleep, may rest to regain metaphysical energy.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Sleepless\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDoes not require sleep, may rest to regain metaphysical energy.",
    "notes": "[Rule] Advanced Species Trait (2 BP).\n[Prerequisite] Synthetic, Elf, or Special",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP).",
      "[Prerequisite] Synthetic, Elf, or Special"
    ]
  },
  {
    "id": "trait-swarming",
    "name": "Swarming",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Two members can share same square. If attacking same foe, considered flanking.",
    "description": "Two members can share same square. If attacking same foe, considered flanking.",
    "mechanics": "Two members can share same square. If attacking same foe, considered flanking.",
    "mechanic": "Two members can share same square. If attacking same foe, considered flanking.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Swarming\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nTwo members can share same square. If attacking same foe, considered flanking.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-synthetic-armor-options",
    "name": "Synthetic Armor Options",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Armor and Armor Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "description": "Armor and Armor Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "mechanics": "Armor and Armor Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "mechanic": "Armor and Armor Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Synthetic Armor Options\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nArmor and Armor Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-synthetic-weapon-options",
    "name": "Synthetic Weapon Options",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Weapons and Weapon Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "description": "Weapons and Weapon Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "mechanics": "Weapons and Weapon Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "mechanic": "Weapons and Weapon Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Synthetic Weapon Options\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nWeapons and Weapon Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-thermal-sight",
    "name": "Thermal Sight",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "See Infra-Red/heat patterns, track passage of a warm target without light.",
    "description": "See Infra-Red/heat patterns, track passage of a warm target without light.",
    "mechanics": "See Infra-Red/heat patterns, track passage of a warm target without light.",
    "mechanic": "See Infra-Red/heat patterns, track passage of a warm target without light.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Thermal Sight\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nSee Infra-Red/heat patterns, track passage of a warm target without light.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-treespeech",
    "name": "Treespeech",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Ability to converse with plants.",
    "description": "Ability to converse with plants.",
    "mechanics": "Ability to converse with plants.",
    "mechanic": "Ability to converse with plants.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Treespeech\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAbility to converse with plants.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-venom",
    "name": "Venom",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Hemotoxic (Str/Sta) / Neurotoxic (Agility/Sensory) / Cytotoxic (Tissue Corrosive)",
    "description": "Hemotoxic (Str/Sta) / Neurotoxic (Agility/Sensory) / Cytotoxic (Tissue Corrosive)",
    "mechanics": "Hemotoxic (Str/Sta) / Neurotoxic (Agility/Sensory) / Cytotoxic (Tissue Corrosive)",
    "mechanic": "Hemotoxic (Str/Sta) / Neurotoxic (Agility/Sensory) / Cytotoxic (Tissue Corrosive)",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Venom\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nHemotoxic (Str/Sta) / Neurotoxic (Agility/Sensory) / Cytotoxic (Tissue Corrosive)",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  }
];
export const SPECIES_TRAITS_ELITE = [
  {
    "id": "trait-alter-form-elite",
    "name": "Alter Form (Elite)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Base Category, Change Appearance (+10 Disguise)/gender/adjust minor traits.",
    "description": "Base Category, Change Appearance (+10 Disguise)/gender/adjust minor traits.",
    "mechanics": "Base Category, Change Appearance (+10 Disguise)/gender/adjust minor traits.",
    "mechanic": "Base Category, Change Appearance (+10 Disguise)/gender/adjust minor traits.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Alter Form (Elite)\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nBase Category, Change Appearance (+10 Disguise)/gender/adjust minor traits.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-blind-sight",
    "name": "Blind Sight",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Accurately target unseen objects in a 30 ft Radius or 60 ft Cone.",
    "description": "Accurately target unseen objects in a 30 ft Radius or 60 ft Cone.",
    "mechanics": "Accurately target unseen objects in a 30 ft Radius or 60 ft Cone.",
    "mechanic": "Accurately target unseen objects in a 30 ft Radius or 60 ft Cone.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Blind Sight\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nAccurately target unseen objects in a 30 ft Radius or 60 ft Cone.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-bodyform-heavy-armor",
    "name": "Bodyform Heavy Armor",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Shapechange to gain a heavy protective layer (Doubles Bodyform Armor bonus to DR).",
    "description": "Shapechange to gain a heavy protective layer (Doubles Bodyform Armor bonus to DR).",
    "mechanics": "Shapechange to gain a heavy protective layer (Doubles Bodyform Armor bonus to DR).",
    "mechanic": "Shapechange to gain a heavy protective layer (Doubles Bodyform Armor bonus to DR).",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Bodyform Heavy Armor\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nShapechange to gain a heavy protective layer (Doubles Bodyform Armor bonus to DR).",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-dragon-apotheosis",
    "name": "Dragon Apotheosis",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Gain Type Specific Ability and access to Advanced Dragon Abilities. Req: Dragon Form.",
    "description": "Gain Type Specific Ability and access to Advanced Dragon Abilities. Req: Dragon Form.",
    "mechanics": "Gain Type Specific Ability and access to Advanced Dragon Abilities. Req: Dragon Form.",
    "mechanic": "Gain Type Specific Ability and access to Advanced Dragon Abilities. Req: Dragon Form.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Dragon Apotheosis\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nGain Type Specific Ability and access to Advanced Dragon Abilities. Req: Dragon Form.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-dragon-breath",
    "name": "Dragon Breath",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Breath Weapon - 30 ft Cone or 60 ft Line of Energy [Str x d8 in Dmg].",
    "description": "Breath Weapon - 30 ft Cone or 60 ft Line of Energy [Str x d8 in Dmg].",
    "mechanics": "Breath Weapon - 30 ft Cone or 60 ft Line of Energy [Str x d8 in Dmg].",
    "mechanic": "Breath Weapon - 30 ft Cone or 60 ft Line of Energy [Str x d8 in Dmg].",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Dragon Breath\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nBreath Weapon - 30 ft Cone or 60 ft Line of Energy [Str x d8 in Dmg].",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-dragon-wings",
    "name": "Dragon Wings",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Grow Leathery Wings - Fly Speed of 3x Ground Speed. Req: Dragonkin, Exoskeleton.",
    "description": "Grow Leathery Wings - Fly Speed of 3x Ground Speed. Req: Dragonkin, Exoskeleton.",
    "mechanics": "Grow Leathery Wings - Fly Speed of 3x Ground Speed. Req: Dragonkin, Exoskeleton.",
    "mechanic": "Grow Leathery Wings - Fly Speed of 3x Ground Speed. Req: Dragonkin, Exoskeleton.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Dragon Wings\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nGrow Leathery Wings - Fly Speed of 3x Ground Speed. Req: Dragonkin, Exoskeleton.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-energized-breath",
    "name": "Energized Breath",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Focus energy into breath weapon to roll damage at advantage, 1/2 damage is magic.",
    "description": "Focus energy into breath weapon to roll damage at advantage, 1/2 damage is magic.",
    "mechanics": "Focus energy into breath weapon to roll damage at advantage, 1/2 damage is magic.",
    "mechanic": "Focus energy into breath weapon to roll damage at advantage, 1/2 damage is magic.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Energized Breath\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nFocus energy into breath weapon to roll damage at advantage, 1/2 damage is magic.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-energy-absorption",
    "name": "Energy Absorption",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Heals 20% of damage ignored. Ranked. Req: Energy Immunity.",
    "description": "Heals 20% of damage ignored. Ranked. Req: Energy Immunity.",
    "mechanics": "Heals 20% of damage ignored. Ranked. Req: Energy Immunity.",
    "mechanic": "Heals 20% of damage ignored. Ranked. Req: Energy Immunity.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Energy Absorption\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nHeals 20% of damage ignored. Ranked. Req: Energy Immunity.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-energy-immunity",
    "name": "Energy Immunity",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Completely Immune to specific Energy Damage. Req: Sta 2, DR 20 vs specific Energy.",
    "description": "Completely Immune to specific Energy Damage. Req: Sta 2, DR 20 vs specific Energy.",
    "mechanics": "Completely Immune to specific Energy Damage. Req: Sta 2, DR 20 vs specific Energy.",
    "mechanic": "Completely Immune to specific Energy Damage. Req: Sta 2, DR 20 vs specific Energy.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Energy Immunity\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nCompletely Immune to specific Energy Damage. Req: Sta 2, DR 20 vs specific Energy.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-ether-sight",
    "name": "Ether Sight",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "See the Invisible, Phased (other-dimensional energies) and Bioluminescence Auras.",
    "description": "See the Invisible, Phased (other-dimensional energies) and Bioluminescence Auras.",
    "mechanics": "See the Invisible, Phased (other-dimensional energies) and Bioluminescence Auras.",
    "mechanic": "See the Invisible, Phased (other-dimensional energies) and Bioluminescence Auras.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Ether Sight\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nSee the Invisible, Phased (other-dimensional energies) and Bioluminescence Auras.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-exoskeleton-heavy",
    "name": "Exoskeleton (Heavy)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "DR (Strength +2) x4: Str 4, Obvious, Special Clothing - Heavy Plating or Shell.",
    "description": "DR (Strength +2) x4: Str 4, Obvious, Special Clothing - Heavy Plating or Shell.",
    "mechanics": "DR (Strength +2) x4: Str 4, Obvious, Special Clothing - Heavy Plating or Shell.",
    "mechanic": "DR (Strength +2) x4: Str 4, Obvious, Special Clothing - Heavy Plating or Shell.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Exoskeleton (Heavy)\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nDR (Strength +2) x4: Str 4, Obvious, Special Clothing - Heavy Plating or Shell.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-flight",
    "name": "Flight",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Flight Speed of 2x Ground Speed and Average Maneuverability, uses Acrobatics skill.",
    "description": "Flight Speed of 2x Ground Speed and Average Maneuverability, uses Acrobatics skill.",
    "mechanics": "Flight Speed of 2x Ground Speed and Average Maneuverability, uses Acrobatics skill.",
    "mechanic": "Flight Speed of 2x Ground Speed and Average Maneuverability, uses Acrobatics skill.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Flight\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nFlight Speed of 2x Ground Speed and Average Maneuverability, uses Acrobatics skill.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-hexapedal",
    "name": "Hexapedal",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Six legged, +8 Stability, +20 movement speed. Special Accommodations.",
    "description": "Six legged, +8 Stability, +20 movement speed. Special Accommodations.",
    "mechanics": "Six legged, +8 Stability, +20 movement speed. Special Accommodations.",
    "mechanic": "Six legged, +8 Stability, +20 movement speed. Special Accommodations.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [
      {
        "target": "move-walk",
        "type": "combat",
        "value": 20,
        "mode": "inherent",
        "description": "+20 movement"
      }
    ],
    "body": "# Hexapedal\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nSix legged, +8 Stability, +20 movement speed. Special Accommodations.",
    "notes": "[Modifier] +20 movement\n[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Modifier] +20 movement",
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-immortal",
    "name": "Immortal",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Cannot die of Natural Causes, nor suffer damage from Poisons/Diseases. Req: Ageless.",
    "description": "Cannot die of Natural Causes, nor suffer damage from Poisons/Diseases. Req: Ageless.",
    "mechanics": "Cannot die of Natural Causes, nor suffer damage from Poisons/Diseases. Req: Ageless.",
    "mechanic": "Cannot die of Natural Causes, nor suffer damage from Poisons/Diseases. Req: Ageless.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Immortal\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nCannot die of Natural Causes, nor suffer damage from Poisons/Diseases. Req: Ageless.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-nimble-appendages",
    "name": "Nimble Appendages",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Usable as ‘main-hand’ with no penalties. Req: Additional Limbs/Tail.",
    "description": "Usable as ‘main-hand’ with no penalties. Req: Additional Limbs/Tail.",
    "mechanics": "Usable as ‘main-hand’ with no penalties. Req: Additional Limbs/Tail.",
    "mechanic": "Usable as ‘main-hand’ with no penalties. Req: Additional Limbs/Tail.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Nimble Appendages\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nUsable as ‘main-hand’ with no penalties. Req: Additional Limbs/Tail.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-non-living",
    "name": "Non-Living",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Undead, Elementals and others not classified as Living by normal standards.",
    "description": "Undead, Elementals and others not classified as Living by normal standards.",
    "mechanics": "Undead, Elementals and others not classified as Living by normal standards.",
    "mechanic": "Undead, Elementals and others not classified as Living by normal standards.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Non-Living\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nUndead, Elementals and others not classified as Living by normal standards.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-regeneration",
    "name": "Regeneration",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Will regrow lost Limbs and Organs with recovery of Health.",
    "description": "Will regrow lost Limbs and Organs with recovery of Health.",
    "mechanics": "Will regrow lost Limbs and Organs with recovery of Health.",
    "mechanic": "Will regrow lost Limbs and Organs with recovery of Health.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Regeneration\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nWill regrow lost Limbs and Organs with recovery of Health.",
    "notes": "[Rule] Elite Species Trait (4 BP).\n[Prerequisite] Fast Heal, Sta 4",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP).",
      "[Prerequisite] Fast Heal, Sta 4"
    ]
  },
  {
    "id": "trait-self-revivifying",
    "name": "Self Revivifying",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "1/day attempt to resurrect. Cost: 1 Karma, Con Check Diff 20. Req: Immortal.",
    "description": "1/day attempt to resurrect. Cost: 1 Karma, Con Check Diff 20. Req: Immortal.",
    "mechanics": "1/day attempt to resurrect. Cost: 1 Karma, Con Check Diff 20. Req: Immortal.",
    "mechanic": "1/day attempt to resurrect. Cost: 1 Karma, Con Check Diff 20. Req: Immortal.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [
      {
        "target": "Karma",
        "type": "karma",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Karma Pool"
      }
    ],
    "body": "# Self Revivifying\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\n1/day attempt to resurrect. Cost: 1 Karma, Con Check Diff 20. Req: Immortal.",
    "notes": "[Modifier] +1 to Karma Pool\n[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Modifier] +1 to Karma Pool",
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-semi-corporeal",
    "name": "Semi-Corporeal",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "DR30 vs physical, able to Phase through solid matter, Solidify at will.",
    "description": "DR30 vs physical, able to Phase through solid matter, Solidify at will.",
    "mechanics": "DR30 vs physical, able to Phase through solid matter, Solidify at will.",
    "mechanic": "DR30 vs physical, able to Phase through solid matter, Solidify at will.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Semi-Corporeal\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nDR30 vs physical, able to Phase through solid matter, Solidify at will.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-synthetic-aux-core",
    "name": "Synthetic Aux Core",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Revivification without loss of Karma/Exp. Not traumatic. Req: Synthetic, TL4.",
    "description": "Revivification without loss of Karma/Exp. Not traumatic. Req: Synthetic, TL4.",
    "mechanics": "Revivification without loss of Karma/Exp. Not traumatic. Req: Synthetic, TL4.",
    "mechanic": "Revivification without loss of Karma/Exp. Not traumatic. Req: Synthetic, TL4.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Synthetic Aux Core\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nRevivification without loss of Karma/Exp. Not traumatic. Req: Synthetic, TL4.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-synthetic-exotic-opt",
    "name": "Synthetic Exotic Opt",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Synthetic version of a Racial Trait or Special Feature. Req: Synthetic, Multiple.",
    "description": "Synthetic version of a Racial Trait or Special Feature. Req: Synthetic, Multiple.",
    "mechanics": "Synthetic version of a Racial Trait or Special Feature. Req: Synthetic, Multiple.",
    "mechanic": "Synthetic version of a Racial Trait or Special Feature. Req: Synthetic, Multiple.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Synthetic Exotic Opt\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nSynthetic version of a Racial Trait or Special Feature. Req: Synthetic, Multiple.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-synthetic-tech-assim",
    "name": "Synthetic Tech Assim",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Able to absorb, power and use technological devices. Req: Synthetic, TL5.",
    "description": "Able to absorb, power and use technological devices. Req: Synthetic, TL5.",
    "mechanics": "Able to absorb, power and use technological devices. Req: Synthetic, TL5.",
    "mechanic": "Able to absorb, power and use technological devices. Req: Synthetic, TL5.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Synthetic Tech Assim\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nAble to absorb, power and use technological devices. Req: Synthetic, TL5.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-vampiric-power",
    "name": "Vampiric Power",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Gain point in Physical Ability per 2 points of Sta drained (Lethal at 3+Sta).",
    "description": "Gain point in Physical Ability per 2 points of Sta drained (Lethal at 3+Sta).",
    "mechanics": "Gain point in Physical Ability per 2 points of Sta drained (Lethal at 3+Sta).",
    "mechanic": "Gain point in Physical Ability per 2 points of Sta drained (Lethal at 3+Sta).",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Vampiric Power\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nGain point in Physical Ability per 2 points of Sta drained (Lethal at 3+Sta).",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-wyrm-senses",
    "name": "Wyrm Senses",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Take Features from any Acute Sense Line. Req: Dragon Apotheosis.",
    "description": "Take Features from any Acute Sense Line. Req: Dragon Apotheosis.",
    "mechanics": "Take Features from any Acute Sense Line. Req: Dragon Apotheosis.",
    "mechanic": "Take Features from any Acute Sense Line. Req: Dragon Apotheosis.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Wyrm Senses\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nTake Features from any Acute Sense Line. Req: Dragon Apotheosis.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  }
];
export const OCCUPATIONAL_TRAITS = [
  {
    "id": "trait-analytical",
    "name": "Analytical",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to analyze data and information to make informed decisions",
    "description": "Ability to analyze data and information to make informed decisions",
    "mechanics": "Ability to analyze data and information to make informed decisions",
    "mechanic": "Ability to analyze data and information to make informed decisions",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Analytical\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to analyze data and information to make informed decisions",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-appraisal",
    "name": "Appraisal",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants have the ability to accurately assess the value of items, whether it's rare artifacts, technology, or resources. They can quickly determine the worth of goods and negotiate fair prices.",
    "description": "Merchants have the ability to accurately assess the value of items, whether it's rare artifacts, technology, or resources. They can quickly determine the worth of goods and negotiate fair prices.",
    "mechanics": "Merchants have the ability to accurately assess the value of items, whether it's rare artifacts, technology, or resources. They can quickly determine the worth of goods and negotiate fair prices.",
    "mechanic": "Merchants have the ability to accurately assess the value of items, whether it's rare artifacts, technology, or resources. They can quickly determine the worth of goods and negotiate fair prices.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Appraisal\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants have the ability to accurately assess the value of items, whether it's rare artifacts, technology, or resources. They can quickly determine the worth of goods and negotiate fair prices.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-attention-to-safety",
    "name": "Attention to Safety",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Awareness of safety protocols and ensuring that their creations are safe to use",
    "description": "Awareness of safety protocols and ensuring that their creations are safe to use",
    "mechanics": "Awareness of safety protocols and ensuring that their creations are safe to use",
    "mechanic": "Awareness of safety protocols and ensuring that their creations are safe to use",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Attention to Safety\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAwareness of safety protocols and ensuring that their creations are safe to use",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-b-e",
    "name": "B&E",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Experience with breaking and entering into secure locations",
    "description": "Experience with breaking and entering into secure locations",
    "mechanics": "Experience with breaking and entering into secure locations",
    "mechanic": "Experience with breaking and entering into secure locations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# B&E\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nExperience with breaking and entering into secure locations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-background",
    "name": "Background",
    "category": "traits",
    "trait_type": "Common Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Select additional training from another secondary Occupation fitting backstory.",
    "description": "Select additional training from another secondary Occupation fitting backstory.",
    "mechanics": "Select additional training from another secondary Occupation fitting backstory.",
    "mechanic": "Select additional training from another secondary Occupation fitting backstory.",
    "rules": "Basic Common Occupational Trait (1 BP).",
    "special_rules": "Basic Common Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Background\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Common Occupational Trait\n**BP Cost**: 1\n\n## Description\nSelect additional training from another secondary Occupation fitting backstory.",
    "notes": "[Rule] Basic Common Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Common Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-caution",
    "name": "Caution",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Cautious and prefer to avoid unnecessary risks, especially when dealing with others",
    "description": "Cautious and prefer to avoid unnecessary risks, especially when dealing with others",
    "mechanics": "Cautious and prefer to avoid unnecessary risks, especially when dealing with others",
    "mechanic": "Cautious and prefer to avoid unnecessary risks, especially when dealing with others",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Caution\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nCautious and prefer to avoid unnecessary risks, especially when dealing with others",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-communication",
    "name": "Communication",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Effective communicators, able to convey complex ideas and information clearly and persuasively.",
    "description": "Effective communicators, able to convey complex ideas and information clearly and persuasively.",
    "mechanics": "Effective communicators, able to convey complex ideas and information clearly and persuasively.",
    "mechanic": "Effective communicators, able to convey complex ideas and information clearly and persuasively.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Communication\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nEffective communicators, able to convey complex ideas and information clearly and persuasively.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-confident",
    "name": "Confident",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Comfortable in the spotlight",
    "description": "Comfortable in the spotlight",
    "mechanics": "Comfortable in the spotlight",
    "mechanic": "Comfortable in the spotlight",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Confident\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nComfortable in the spotlight",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-conflict-resolution",
    "name": "Conflict resolution",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to resolve conflicts effectively and find solutions that satisfy all parties involved",
    "description": "Ability to resolve conflicts effectively and find solutions that satisfy all parties involved",
    "mechanics": "Ability to resolve conflicts effectively and find solutions that satisfy all parties involved",
    "mechanic": "Ability to resolve conflicts effectively and find solutions that satisfy all parties involved",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Conflict resolution\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to resolve conflicts effectively and find solutions that satisfy all parties involved",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-continuous-learning",
    "name": "Continuous Learning",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Has a thirst for knowledge and is committed to lifelong learning.",
    "description": "Has a thirst for knowledge and is committed to lifelong learning.",
    "mechanics": "Has a thirst for knowledge and is committed to lifelong learning.",
    "mechanic": "Has a thirst for knowledge and is committed to lifelong learning.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Continuous Learning\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHas a thirst for knowledge and is committed to lifelong learning.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-cool",
    "name": "Cool",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to remain calm and focused even in high-pressure situations",
    "description": "Able to remain calm and focused even in high-pressure situations",
    "mechanics": "Able to remain calm and focused even in high-pressure situations",
    "mechanic": "Able to remain calm and focused even in high-pressure situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Cool\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to remain calm and focused even in high-pressure situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-creative",
    "name": "Creative",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Skilled at coming up with new ideas",
    "description": "Skilled at coming up with new ideas",
    "mechanics": "Skilled at coming up with new ideas",
    "mechanic": "Skilled at coming up with new ideas",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Creative\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nSkilled at coming up with new ideas",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-critical-thinking",
    "name": "Critical thinking",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Possess strong critical thinking skills.",
    "description": "Possess strong critical thinking skills.",
    "mechanics": "Possess strong critical thinking skills.",
    "mechanic": "Possess strong critical thinking skills.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Critical thinking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nPossess strong critical thinking skills.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-cultural-awareness",
    "name": "Cultural Awareness",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants are culturally aware and sensitive. They understand different customs, traditions, and etiquette, allowing them to navigate diverse markets and build relationships with customers from various backgrounds.",
    "description": "Merchants are culturally aware and sensitive. They understand different customs, traditions, and etiquette, allowing them to navigate diverse markets and build relationships with customers from various backgrounds.",
    "mechanics": "Merchants are culturally aware and sensitive. They understand different customs, traditions, and etiquette, allowing them to navigate diverse markets and build relationships with customers from various backgrounds.",
    "mechanic": "Merchants are culturally aware and sensitive. They understand different customs, traditions, and etiquette, allowing them to navigate diverse markets and build relationships with customers from various backgrounds.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Cultural Awareness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants are culturally aware and sensitive. They understand different customs, traditions, and etiquette, allowing them to navigate diverse markets and build relationships with customers from various backgrounds.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-cunning",
    "name": "Cunning",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Rely on their wits and cunning to achieve their objectives, often using deception and misdirection to outsmart their enemies",
    "description": "Rely on their wits and cunning to achieve their objectives, often using deception and misdirection to outsmart their enemies",
    "mechanics": "Rely on their wits and cunning to achieve their objectives, often using deception and misdirection to outsmart their enemies",
    "mechanic": "Rely on their wits and cunning to achieve their objectives, often using deception and misdirection to outsmart their enemies",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Cunning\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nRely on their wits and cunning to achieve their objectives, often using deception and misdirection to outsmart their enemies",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-deception",
    "name": "Deception",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Disguise, impersonation, and deception",
    "description": "Disguise, impersonation, and deception",
    "mechanics": "Disguise, impersonation, and deception",
    "mechanic": "Disguise, impersonation, and deception",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Deception\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nDisguise, impersonation, and deception",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-discipline",
    "name": "Discipline",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Disciplined and able to follow orders without question, even in high-pressure situations",
    "description": "Disciplined and able to follow orders without question, even in high-pressure situations",
    "mechanics": "Disciplined and able to follow orders without question, even in high-pressure situations",
    "mechanic": "Disciplined and able to follow orders without question, even in high-pressure situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Discipline\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nDisciplined and able to follow orders without question, even in high-pressure situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-emotional-intelligence",
    "name": "Emotional intelligence",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to understand and manage their own emotions effectively, and read the emotions of others and respond appropriately to different emotional states",
    "description": "Ability to understand and manage their own emotions effectively, and read the emotions of others and respond appropriately to different emotional states",
    "mechanics": "Ability to understand and manage their own emotions effectively, and read the emotions of others and respond appropriately to different emotional states",
    "mechanic": "Ability to understand and manage their own emotions effectively, and read the emotions of others and respond appropriately to different emotional states",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Emotional intelligence\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to understand and manage their own emotions effectively, and read the emotions of others and respond appropriately to different emotional states",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-energetic",
    "name": "Energetic",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "High levels of energy and enthusiasm",
    "description": "High levels of energy and enthusiasm",
    "mechanics": "High levels of energy and enthusiasm",
    "mechanic": "High levels of energy and enthusiasm",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Energetic\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHigh levels of energy and enthusiasm",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-enhanced-abilities",
    "name": "Enhanced Abilities",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may be able to temporarily enhance their physical or mental abilities to go beyond what is considered normal for their species or race.",
    "description": "Adepts may be able to temporarily enhance their physical or mental abilities to go beyond what is considered normal for their species or race.",
    "mechanics": "Adepts may be able to temporarily enhance their physical or mental abilities to go beyond what is considered normal for their species or race.",
    "mechanic": "Adepts may be able to temporarily enhance their physical or mental abilities to go beyond what is considered normal for their species or race.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Enhanced Abilities\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may be able to temporarily enhance their physical or mental abilities to go beyond what is considered normal for their species or race.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-ethical-awareness",
    "name": "Ethical awareness",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "May have a strong sense of ethics and corporate responsibility.",
    "description": "May have a strong sense of ethics and corporate responsibility.",
    "mechanics": "May have a strong sense of ethics and corporate responsibility.",
    "mechanic": "May have a strong sense of ethics and corporate responsibility.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Ethical awareness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMay have a strong sense of ethics and corporate responsibility.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-ethical-conduct",
    "name": "Ethical conduct",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adheres to ethical standards in research and work.",
    "description": "Adheres to ethical standards in research and work.",
    "mechanics": "Adheres to ethical standards in research and work.",
    "mechanic": "Adheres to ethical standards in research and work.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Ethical conduct\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdheres to ethical standards in research and work.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-expertise",
    "name": "Expertise",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "In-depth knowledge and experience in a particular area",
    "description": "In-depth knowledge and experience in a particular area",
    "mechanics": "In-depth knowledge and experience in a particular area",
    "mechanic": "In-depth knowledge and experience in a particular area",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Expertise\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nIn-depth knowledge and experience in a particular area",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-fans",
    "name": "Fans",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Has a loyal following of fans",
    "description": "Has a loyal following of fans",
    "mechanics": "Has a loyal following of fans",
    "mechanic": "Has a loyal following of fans",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Fans\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHas a loyal following of fans",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-fearlessness",
    "name": "Fearlessness",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Seem fearless and willing to take risks in order to achieve their goals",
    "description": "Seem fearless and willing to take risks in order to achieve their goals",
    "mechanics": "Seem fearless and willing to take risks in order to achieve their goals",
    "mechanic": "Seem fearless and willing to take risks in order to achieve their goals",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Fearlessness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nSeem fearless and willing to take risks in order to achieve their goals",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-fellow-artists",
    "name": "Fellow Artists",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Has close relationships with other performers",
    "description": "Has close relationships with other performers",
    "mechanics": "Has close relationships with other performers",
    "mechanic": "Has close relationships with other performers",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Fellow Artists\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHas close relationships with other performers",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-financial-expertise",
    "name": "Financial expertise",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Strong understanding of financial management, budgeting, and investment strategies.",
    "description": "Strong understanding of financial management, budgeting, and investment strategies.",
    "mechanics": "Strong understanding of financial management, budgeting, and investment strategies.",
    "mechanic": "Strong understanding of financial management, budgeting, and investment strategies.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Financial expertise\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nStrong understanding of financial management, budgeting, and investment strategies.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-flexibility",
    "name": "Flexibility",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to adapt to changing circumstances and adjust plans and strategies as needed",
    "description": "Ability to adapt to changing circumstances and adjust plans and strategies as needed",
    "mechanics": "Ability to adapt to changing circumstances and adjust plans and strategies as needed",
    "mechanic": "Ability to adapt to changing circumstances and adjust plans and strategies as needed",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Flexibility\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to adapt to changing circumstances and adjust plans and strategies as needed",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-freedom",
    "name": "Freedom",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Values independence and self-expression",
    "description": "Values independence and self-expression",
    "mechanics": "Values independence and self-expression",
    "mechanic": "Values independence and self-expression",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Freedom\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nValues independence and self-expression",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-fun",
    "name": "Fun",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Values having a good time and making others happy",
    "description": "Values having a good time and making others happy",
    "mechanics": "Values having a good time and making others happy",
    "mechanic": "Values having a good time and making others happy",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Fun\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nValues having a good time and making others happy",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-guile",
    "name": "Guile",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Good at devising clever solutions",
    "description": "Good at devising clever solutions",
    "mechanics": "Good at devising clever solutions",
    "mechanic": "Good at devising clever solutions",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Guile\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nGood at devising clever solutions",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-hacking",
    "name": "Hacking",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Experience with hacking into computer systems and stealing information",
    "description": "Experience with hacking into computer systems and stealing information",
    "mechanics": "Experience with hacking into computer systems and stealing information",
    "mechanic": "Experience with hacking into computer systems and stealing information",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Hacking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nExperience with hacking into computer systems and stealing information",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-heightened-senses",
    "name": "Heightened Senses",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may have enhanced senses, allowing them to perceive the world in ways that others cannot. This could include heightened vision, hearing, smell, or even the ability to sense energy or auras.",
    "description": "Adepts may have enhanced senses, allowing them to perceive the world in ways that others cannot. This could include heightened vision, hearing, smell, or even the ability to sense energy or auras.",
    "mechanics": "Adepts may have enhanced senses, allowing them to perceive the world in ways that others cannot. This could include heightened vision, hearing, smell, or even the ability to sense energy or auras.",
    "mechanic": "Adepts may have enhanced senses, allowing them to perceive the world in ways that others cannot. This could include heightened vision, hearing, smell, or even the ability to sense energy or auras.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Heightened Senses\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may have enhanced senses, allowing them to perceive the world in ways that others cannot. This could include heightened vision, hearing, smell, or even the ability to sense energy or auras.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-high-pay",
    "name": "High Pay",
    "category": "traits",
    "trait_type": "Common Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Higher compensation and retainer fees for elite vocational service.",
    "description": "Higher compensation and retainer fees for elite vocational service.",
    "mechanics": "Higher compensation and retainer fees for elite vocational service.",
    "mechanic": "Higher compensation and retainer fees for elite vocational service.",
    "rules": "Basic Common Occupational Trait (1 BP).",
    "special_rules": "Basic Common Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# High Pay\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Common Occupational Trait\n**BP Cost**: 1\n\n## Description\nHigher compensation and retainer fees for elite vocational service.",
    "notes": "[Rule] Basic Common Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Common Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-high-social-standing",
    "name": "High social standing",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Often have a high social standing, which grants them access to better resources, connections, and opportunities.",
    "description": "Often have a high social standing, which grants them access to better resources, connections, and opportunities.",
    "mechanics": "Often have a high social standing, which grants them access to better resources, connections, and opportunities.",
    "mechanic": "Often have a high social standing, which grants them access to better resources, connections, and opportunities.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# High social standing\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nOften have a high social standing, which grants them access to better resources, connections, and opportunities.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-integrity",
    "name": "Integrity",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Honest and trustworthy, able to maintain a high level of integrity in their work",
    "description": "Honest and trustworthy, able to maintain a high level of integrity in their work",
    "mechanics": "Honest and trustworthy, able to maintain a high level of integrity in their work",
    "mechanic": "Honest and trustworthy, able to maintain a high level of integrity in their work",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Integrity\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHonest and trustworthy, able to maintain a high level of integrity in their work",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-investigation",
    "name": "Investigation",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gathering information, analyzing data, and conducting surveillance",
    "description": "Gathering information, analyzing data, and conducting surveillance",
    "mechanics": "Gathering information, analyzing data, and conducting surveillance",
    "mechanic": "Gathering information, analyzing data, and conducting surveillance",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Investigation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nGathering information, analyzing data, and conducting surveillance",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-jack-of-all-trades",
    "name": "Jack-of-All-Trades",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Possess a wide range of skills and knowledge, allowing them to adapt to various situations and fill multiple roles within a group",
    "description": "Possess a wide range of skills and knowledge, allowing them to adapt to various situations and fill multiple roles within a group",
    "mechanics": "Possess a wide range of skills and knowledge, allowing them to adapt to various situations and fill multiple roles within a group",
    "mechanic": "Possess a wide range of skills and knowledge, allowing them to adapt to various situations and fill multiple roles within a group",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Jack-of-All-Trades\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nPossess a wide range of skills and knowledge, allowing them to adapt to various situations and fill multiple roles within a group",
    "notes": "[Rule] Basic Occupational Trait (1 BP).\n[Prerequisite] Intellect 2",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP).",
      "[Prerequisite] Intellect 2"
    ]
  },
  {
    "id": "trait-keen-observation",
    "name": "Keen Observation",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Scouts have a keen eye and sharp mind, allowing them to solve mysteries, observe new species, and recognize important details in their surroundings.",
    "description": "Scouts have a keen eye and sharp mind, allowing them to solve mysteries, observe new species, and recognize important details in their surroundings.",
    "mechanics": "Scouts have a keen eye and sharp mind, allowing them to solve mysteries, observe new species, and recognize important details in their surroundings.",
    "mechanic": "Scouts have a keen eye and sharp mind, allowing them to solve mysteries, observe new species, and recognize important details in their surroundings.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Keen Observation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nScouts have a keen eye and sharp mind, allowing them to solve mysteries, observe new species, and recognize important details in their surroundings.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-languages",
    "name": "Languages",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Fluency in multiple languages",
    "description": "Fluency in multiple languages",
    "mechanics": "Fluency in multiple languages",
    "mechanic": "Fluency in multiple languages",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Languages\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nFluency in multiple languages",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-linguistics",
    "name": "Linguistics",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants often possess linguistic skills, enabling them to communicate with customers and suppliers who speak different languages. This skill can help them expand their reach and negotiate better deals.",
    "description": "Merchants often possess linguistic skills, enabling them to communicate with customers and suppliers who speak different languages. This skill can help them expand their reach and negotiate better deals.",
    "mechanics": "Merchants often possess linguistic skills, enabling them to communicate with customers and suppliers who speak different languages. This skill can help them expand their reach and negotiate better deals.",
    "mechanic": "Merchants often possess linguistic skills, enabling them to communicate with customers and suppliers who speak different languages. This skill can help them expand their reach and negotiate better deals.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Linguistics\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants often possess linguistic skills, enabling them to communicate with customers and suppliers who speak different languages. This skill can help them expand their reach and negotiate better deals.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-logistics",
    "name": "Logistics",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants have a strong understanding of logistics and supply chain management. They can efficiently transport goods, manage inventory, and optimize distribution to maximize efficiency and minimize costs.",
    "description": "Merchants have a strong understanding of logistics and supply chain management. They can efficiently transport goods, manage inventory, and optimize distribution to maximize efficiency and minimize costs.",
    "mechanics": "Merchants have a strong understanding of logistics and supply chain management. They can efficiently transport goods, manage inventory, and optimize distribution to maximize efficiency and minimize costs.",
    "mechanic": "Merchants have a strong understanding of logistics and supply chain management. They can efficiently transport goods, manage inventory, and optimize distribution to maximize efficiency and minimize costs.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Logistics\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants have a strong understanding of logistics and supply chain management. They can efficiently transport goods, manage inventory, and optimize distribution to maximize efficiency and minimize costs.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-loyalty",
    "name": "Loyalty",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "While they may appear to be loners, drifters/vagabonds can develop strong bonds of loyalty with a select few individuals or groups",
    "description": "While they may appear to be loners, drifters/vagabonds can develop strong bonds of loyalty with a select few individuals or groups",
    "mechanics": "While they may appear to be loners, drifters/vagabonds can develop strong bonds of loyalty with a select few individuals or groups",
    "mechanic": "While they may appear to be loners, drifters/vagabonds can develop strong bonds of loyalty with a select few individuals or groups",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Loyalty\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nWhile they may appear to be loners, drifters/vagabonds can develop strong bonds of loyalty with a select few individuals or groups",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-machine-affinity",
    "name": "Machine Affinity",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Natural aptitude for working with machinery and tools",
    "description": "Natural aptitude for working with machinery and tools",
    "mechanics": "Natural aptitude for working with machinery and tools",
    "mechanic": "Natural aptitude for working with machinery and tools",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Machine Affinity\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nNatural aptitude for working with machinery and tools",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-martial-arts-mastery",
    "name": "Martial Arts Mastery",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Many adepts are highly skilled in martial arts, using their physical prowess and combat techniques to overcome opponents. They may have trained in various styles and have a deep understanding of the body's mechanics.",
    "description": "Many adepts are highly skilled in martial arts, using their physical prowess and combat techniques to overcome opponents. They may have trained in various styles and have a deep understanding of the body's mechanics.",
    "mechanics": "Many adepts are highly skilled in martial arts, using their physical prowess and combat techniques to overcome opponents. They may have trained in various styles and have a deep understanding of the body's mechanics.",
    "mechanic": "Many adepts are highly skilled in martial arts, using their physical prowess and combat techniques to overcome opponents. They may have trained in various styles and have a deep understanding of the body's mechanics.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Martial Arts Mastery\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMany adepts are highly skilled in martial arts, using their physical prowess and combat techniques to overcome opponents. They may have trained in various styles and have a deep understanding of the body's mechanics.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mastery-of-a-discipline",
    "name": "Mastery of a Discipline",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may specialize in a specific discipline or school of thought. They have honed their abilities within this discipline and can utilize them more effectively.",
    "description": "Adepts may specialize in a specific discipline or school of thought. They have honed their abilities within this discipline and can utilize them more effectively.",
    "mechanics": "Adepts may specialize in a specific discipline or school of thought. They have honed their abilities within this discipline and can utilize them more effectively.",
    "mechanic": "Adepts may specialize in a specific discipline or school of thought. They have honed their abilities within this discipline and can utilize them more effectively.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Mastery of a Discipline\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may specialize in a specific discipline or school of thought. They have honed their abilities within this discipline and can utilize them more effectively.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mecha-physics",
    "name": "Mecha-Physics",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Comprehensive understanding of physics",
    "description": "Comprehensive understanding of physics",
    "mechanics": "Comprehensive understanding of physics",
    "mechanic": "Comprehensive understanding of physics",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Mecha-Physics\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nComprehensive understanding of physics",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mental-resilience",
    "name": "Mental Resilience",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Withstand psychological challenges",
    "description": "Withstand psychological challenges",
    "mechanics": "Withstand psychological challenges",
    "mechanic": "Withstand psychological challenges",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Mental Resilience\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nWithstand psychological challenges",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-metacognition",
    "name": "Metacognition",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Aware of own cognitive abilities and strategies.",
    "description": "Aware of own cognitive abilities and strategies.",
    "mechanics": "Aware of own cognitive abilities and strategies.",
    "mechanic": "Aware of own cognitive abilities and strategies.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Metacognition\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAware of own cognitive abilities and strategies.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mobility",
    "name": "Mobility",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Often on the move, traveling from place to place and exploring new territories",
    "description": "Often on the move, traveling from place to place and exploring new territories",
    "mechanics": "Often on the move, traveling from place to place and exploring new territories",
    "mechanic": "Often on the move, traveling from place to place and exploring new territories",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 4,
        "mode": "inherent",
        "description": "+4 defense"
      }
    ],
    "body": "# Mobility\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nOften on the move, traveling from place to place and exploring new territories",
    "notes": "[Modifier] +4 defense\n[Rule] Basic Occupational Trait (1 BP).\n[Prerequisite] Agi 2, Dodge",
    "notesList": [
      "[Modifier] +4 defense",
      "[Rule] Basic Occupational Trait (1 BP).",
      "[Prerequisite] Agi 2, Dodge"
    ]
  },
  {
    "id": "trait-mystical-or-spiritual-connection",
    "name": "Mystical or Spiritual Connection",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may have a deep connection to mystical or spiritual forces. They may draw power from these sources having a heightened awareness of the unseen world.",
    "description": "Adepts may have a deep connection to mystical or spiritual forces. They may draw power from these sources having a heightened awareness of the unseen world.",
    "mechanics": "Adepts may have a deep connection to mystical or spiritual forces. They may draw power from these sources having a heightened awareness of the unseen world.",
    "mechanic": "Adepts may have a deep connection to mystical or spiritual forces. They may draw power from these sources having a heightened awareness of the unseen world.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Mystical or Spiritual Connection\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may have a deep connection to mystical or spiritual forces. They may draw power from these sources having a heightened awareness of the unseen world.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-navigation",
    "name": "Navigation",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Scouts have excellent navigational skills, both in space and on planetary surfaces. They can plot courses, read maps, and use navigational tools effectively.",
    "description": "Scouts have excellent navigational skills, both in space and on planetary surfaces. They can plot courses, read maps, and use navigational tools effectively.",
    "mechanics": "Scouts have excellent navigational skills, both in space and on planetary surfaces. They can plot courses, read maps, and use navigational tools effectively.",
    "mechanic": "Scouts have excellent navigational skills, both in space and on planetary surfaces. They can plot courses, read maps, and use navigational tools effectively.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Navigation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nScouts have excellent navigational skills, both in space and on planetary surfaces. They can plot courses, read maps, and use navigational tools effectively.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-observant",
    "name": "Observant",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Alert and observant, constantly scanning the area for potential threats",
    "description": "Alert and observant, constantly scanning the area for potential threats",
    "mechanics": "Alert and observant, constantly scanning the area for potential threats",
    "mechanic": "Alert and observant, constantly scanning the area for potential threats",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Observant\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAlert and observant, constantly scanning the area for potential threats",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-persuasion",
    "name": "Persuasion",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Convincing others to cooperate, negotiation, deception, and diplomacy",
    "description": "Convincing others to cooperate, negotiation, deception, and diplomacy",
    "mechanics": "Convincing others to cooperate, negotiation, deception, and diplomacy",
    "mechanic": "Convincing others to cooperate, negotiation, deception, and diplomacy",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Persuasion\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nConvincing others to cooperate, negotiation, deception, and diplomacy",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-physical-and-mental-resilience",
    "name": "Physical and mental resilience",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to endure harsh conditions or high-stress situations",
    "description": "Ability to endure harsh conditions or high-stress situations",
    "mechanics": "Ability to endure harsh conditions or high-stress situations",
    "mechanic": "Ability to endure harsh conditions or high-stress situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Physical and mental resilience\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to endure harsh conditions or high-stress situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-physical-prowess",
    "name": "Physical Prowess",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Physically fit and strong, can endure long periods of physical activity and combat",
    "description": "Physically fit and strong, can endure long periods of physical activity and combat",
    "mechanics": "Physically fit and strong, can endure long periods of physical activity and combat",
    "mechanic": "Physically fit and strong, can endure long periods of physical activity and combat",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Physical Prowess\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nPhysically fit and strong, can endure long periods of physical activity and combat",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-pilot",
    "name": "Pilot",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Most field scouts are pilots, as they need to navigate and operate spacecraft or other vehicles during their explorations.",
    "description": "Most field scouts are pilots, as they need to navigate and operate spacecraft or other vehicles during their explorations.",
    "mechanics": "Most field scouts are pilots, as they need to navigate and operate spacecraft or other vehicles during their explorations.",
    "mechanic": "Most field scouts are pilots, as they need to navigate and operate spacecraft or other vehicles during their explorations.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Pilot\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMost field scouts are pilots, as they need to navigate and operate spacecraft or other vehicles during their explorations.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-problem-solving-skills",
    "name": "Problem-Solving Skills",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Strong analytical and problem-solving skills",
    "description": "Strong analytical and problem-solving skills",
    "mechanics": "Strong analytical and problem-solving skills",
    "mechanic": "Strong analytical and problem-solving skills",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Problem-Solving Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nStrong analytical and problem-solving skills",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-product-knowledge",
    "name": "Product Knowledge",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants have in-depth knowledge about the products they sell. They understand their features, benefits, and potential uses, allowing them to effectively market and sell their goods.",
    "description": "Merchants have in-depth knowledge about the products they sell. They understand their features, benefits, and potential uses, allowing them to effectively market and sell their goods.",
    "mechanics": "Merchants have in-depth knowledge about the products they sell. They understand their features, benefits, and potential uses, allowing them to effectively market and sell their goods.",
    "mechanic": "Merchants have in-depth knowledge about the products they sell. They understand their features, benefits, and potential uses, allowing them to effectively market and sell their goods.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Product Knowledge\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants have in-depth knowledge about the products they sell. They understand their features, benefits, and potential uses, allowing them to effectively market and sell their goods.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-professionalism",
    "name": "Professionalism",
    "category": "traits",
    "trait_type": "Common Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Recognized industry standing and professional reliability.",
    "description": "Recognized industry standing and professional reliability.",
    "mechanics": "Recognized industry standing and professional reliability.",
    "mechanic": "Recognized industry standing and professional reliability.",
    "rules": "Basic Common Occupational Trait (1 BP).",
    "special_rules": "Basic Common Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Professionalism\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Common Occupational Trait\n**BP Cost**: 1\n\n## Description\nRecognized industry standing and professional reliability.",
    "notes": "[Rule] Basic Common Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Common Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-quick-thinking",
    "name": "Quick Thinking",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Think on their feet, make split-second decisions, and adapt to rapidly changing situations",
    "description": "Think on their feet, make split-second decisions, and adapt to rapidly changing situations",
    "mechanics": "Think on their feet, make split-second decisions, and adapt to rapidly changing situations",
    "mechanic": "Think on their feet, make split-second decisions, and adapt to rapidly changing situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Quick Thinking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nThink on their feet, make split-second decisions, and adapt to rapidly changing situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-rapid-response",
    "name": "Rapid Response",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to respond quickly to threats and can act decisively in high-pressure situations",
    "description": "Able to respond quickly to threats and can act decisively in high-pressure situations",
    "mechanics": "Able to respond quickly to threats and can act decisively in high-pressure situations",
    "mechanic": "Able to respond quickly to threats and can act decisively in high-pressure situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Rapid Response\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to respond quickly to threats and can act decisively in high-pressure situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-resourceful",
    "name": "Resourceful",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to make weapons out of anything and can adapt to new situations quickly",
    "description": "Able to make weapons out of anything and can adapt to new situations quickly",
    "mechanics": "Able to make weapons out of anything and can adapt to new situations quickly",
    "mechanic": "Able to make weapons out of anything and can adapt to new situations quickly",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Resourceful\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to make weapons out of anything and can adapt to new situations quickly",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-risk-management",
    "name": "Risk Management",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants are skilled at assessing and managing risks. They can anticipate potential challenges and develop contingency plans to mitigate losses.   *+1 Karma Point* #",
    "description": "Merchants are skilled at assessing and managing risks. They can anticipate potential challenges and develop contingency plans to mitigate losses.   *+1 Karma Point* #",
    "mechanics": "Merchants are skilled at assessing and managing risks. They can anticipate potential challenges and develop contingency plans to mitigate losses.   *+1 Karma Point* #",
    "mechanic": "Merchants are skilled at assessing and managing risks. They can anticipate potential challenges and develop contingency plans to mitigate losses.   *+1 Karma Point* #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [
      {
        "target": "Karma",
        "type": "karma",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Karma Pool"
      }
    ],
    "body": "# Risk Management\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants are skilled at assessing and managing risks. They can anticipate potential challenges and develop contingency plans to mitigate losses.   *+1 Karma Point* #",
    "notes": "[Modifier] +1 to Karma Pool\n[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Modifier] +1 to Karma Pool",
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-scavenging",
    "name": "Scavenging",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Excel at scavenging and salvaging useful items from abandoned places or wreckage, making the most out of limited resources",
    "description": "Excel at scavenging and salvaging useful items from abandoned places or wreckage, making the most out of limited resources",
    "mechanics": "Excel at scavenging and salvaging useful items from abandoned places or wreckage, making the most out of limited resources",
    "mechanic": "Excel at scavenging and salvaging useful items from abandoned places or wreckage, making the most out of limited resources",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Scavenging\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nExcel at scavenging and salvaging useful items from abandoned places or wreckage, making the most out of limited resources",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-self-preservation",
    "name": "Self-preservation",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Criminals may be skilled at protecting themselves and avoiding capture by law enforcement",
    "description": "Criminals may be skilled at protecting themselves and avoiding capture by law enforcement",
    "mechanics": "Criminals may be skilled at protecting themselves and avoiding capture by law enforcement",
    "mechanic": "Criminals may be skilled at protecting themselves and avoiding capture by law enforcement",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Self-preservation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nCriminals may be skilled at protecting themselves and avoiding capture by law enforcement",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-self-sufficiency",
    "name": "Self-sufficiency",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Often self-sufficient and able to take care of themselves without relying on others",
    "description": "Often self-sufficient and able to take care of themselves without relying on others",
    "mechanics": "Often self-sufficient and able to take care of themselves without relying on others",
    "mechanic": "Often self-sufficient and able to take care of themselves without relying on others",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Self-sufficiency\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nOften self-sufficient and able to take care of themselves without relying on others",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-smooth",
    "name": "Smooth",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Criminals may be charming and persuasive, able to talk their way out of difficult situations",
    "description": "Criminals may be charming and persuasive, able to talk their way out of difficult situations",
    "mechanics": "Criminals may be charming and persuasive, able to talk their way out of difficult situations",
    "mechanic": "Criminals may be charming and persuasive, able to talk their way out of difficult situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Smooth\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nCriminals may be charming and persuasive, able to talk their way out of difficult situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-special-ability",
    "name": "Special Ability",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may have access to unique powers or techniques that set them apart from other characters. These could include energy manipulation, telekinesis, elemental control, or advanced hacking abilities.   May be taken multiple times for a different Special Ability.",
    "description": "Adepts may have access to unique powers or techniques that set them apart from other characters. These could include energy manipulation, telekinesis, elemental control, or advanced hacking abilities.   May be taken multiple times for a different Special Ability.",
    "mechanics": "Adepts may have access to unique powers or techniques that set them apart from other characters. These could include energy manipulation, telekinesis, elemental control, or advanced hacking abilities.   May be taken multiple times for a different Special Ability.",
    "mechanic": "Adepts may have access to unique powers or techniques that set them apart from other characters. These could include energy manipulation, telekinesis, elemental control, or advanced hacking abilities.   May be taken multiple times for a different Special Ability.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Special Ability\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may have access to unique powers or techniques that set them apart from other characters. These could include energy manipulation, telekinesis, elemental control, or advanced hacking abilities.   May be taken multiple times for a different Special Ability.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Basic Occupational Trait (1 BP).\n[Prerequisite] None (though usually tied to Species or Origin).",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Basic Occupational Trait (1 BP).",
      "[Prerequisite] None (though usually tied to Species or Origin)."
    ]
  },
  {
    "id": "trait-special-equipment",
    "name": "Special Equipment",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may have access to specialized equipment or tools that enhance their abilities. This could include advanced weapons, cybernetic enhancements, or artifacts with unique properties.",
    "description": "Adepts may have access to specialized equipment or tools that enhance their abilities. This could include advanced weapons, cybernetic enhancements, or artifacts with unique properties.",
    "mechanics": "Adepts may have access to specialized equipment or tools that enhance their abilities. This could include advanced weapons, cybernetic enhancements, or artifacts with unique properties.",
    "mechanic": "Adepts may have access to specialized equipment or tools that enhance their abilities. This could include advanced weapons, cybernetic enhancements, or artifacts with unique properties.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Special Equipment\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may have access to specialized equipment or tools that enhance their abilities. This could include advanced weapons, cybernetic enhancements, or artifacts with unique properties.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-specialized-skills",
    "name": "Specialized Skills",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts are often highly skilled in specific areas, such as combat, technology, or mystical arts. They may have extensive training and knowledge in their chosen field, allowing them to excel in their profession.",
    "description": "Adepts are often highly skilled in specific areas, such as combat, technology, or mystical arts. They may have extensive training and knowledge in their chosen field, allowing them to excel in their profession.",
    "mechanics": "Adepts are often highly skilled in specific areas, such as combat, technology, or mystical arts. They may have extensive training and knowledge in their chosen field, allowing them to excel in their profession.",
    "mechanic": "Adepts are often highly skilled in specific areas, such as combat, technology, or mystical arts. They may have extensive training and knowledge in their chosen field, allowing them to excel in their profession.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Specialized Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts are often highly skilled in specific areas, such as combat, technology, or mystical arts. They may have extensive training and knowledge in their chosen field, allowing them to excel in their profession.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-stealth",
    "name": "Stealth",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Operating covertly, sneaking, hiding, and remaining undetected",
    "description": "Operating covertly, sneaking, hiding, and remaining undetected",
    "mechanics": "Operating covertly, sneaking, hiding, and remaining undetected",
    "mechanic": "Operating covertly, sneaking, hiding, and remaining undetected",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Stealth\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nOperating covertly, sneaking, hiding, and remaining undetected",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-strategic-thinking",
    "name": "Strategic thinking",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Skilled at developing long-term plans and strategies to achieve their goals.",
    "description": "Skilled at developing long-term plans and strategies to achieve their goals.",
    "mechanics": "Skilled at developing long-term plans and strategies to achieve their goals.",
    "mechanic": "Skilled at developing long-term plans and strategies to achieve their goals.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Strategic thinking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nSkilled at developing long-term plans and strategies to achieve their goals.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-survival",
    "name": "Survival",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to survive in harsh environments, such as deserts or post-apocalyptic wastelands, by finding food, water, and shelter",
    "description": "Ability to survive in harsh environments, such as deserts or post-apocalyptic wastelands, by finding food, water, and shelter",
    "mechanics": "Ability to survive in harsh environments, such as deserts or post-apocalyptic wastelands, by finding food, water, and shelter",
    "mechanic": "Ability to survive in harsh environments, such as deserts or post-apocalyptic wastelands, by finding food, water, and shelter",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Survival\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to survive in harsh environments, such as deserts or post-apocalyptic wastelands, by finding food, water, and shelter",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-team-oriented",
    "name": "Team-Oriented",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to work in teams and coordinate their efforts to achieve their objectives",
    "description": "Able to work in teams and coordinate their efforts to achieve their objectives",
    "mechanics": "Able to work in teams and coordinate their efforts to achieve their objectives",
    "mechanic": "Able to work in teams and coordinate their efforts to achieve their objectives",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Team-Oriented\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to work in teams and coordinate their efforts to achieve their objectives",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-team-player",
    "name": "Team Player",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to communicate effectively and collaborate with others",
    "description": "Ability to communicate effectively and collaborate with others",
    "mechanics": "Ability to communicate effectively and collaborate with others",
    "mechanic": "Ability to communicate effectively and collaborate with others",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Team Player\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to communicate effectively and collaborate with others",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technical-knowledge",
    "name": "Technical Knowledge",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Deep understanding of the technical aspects of their craft, including knowledge of materials, tools, and techniques",
    "description": "Deep understanding of the technical aspects of their craft, including knowledge of materials, tools, and techniques",
    "mechanics": "Deep understanding of the technical aspects of their craft, including knowledge of materials, tools, and techniques",
    "mechanic": "Deep understanding of the technical aspects of their craft, including knowledge of materials, tools, and techniques",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Technical Knowledge\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nDeep understanding of the technical aspects of their craft, including knowledge of materials, tools, and techniques",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technological-aptitude",
    "name": "Technological Aptitude",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Natural aptitude for understanding and operating advanced technology",
    "description": "Natural aptitude for understanding and operating advanced technology",
    "mechanics": "Natural aptitude for understanding and operating advanced technology",
    "mechanic": "Natural aptitude for understanding and operating advanced technology",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Technological Aptitude\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nNatural aptitude for understanding and operating advanced technology",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technological-innovation",
    "name": "Technological innovation",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to create, adapt, and improve technology in novel ways.",
    "description": "Able to create, adapt, and improve technology in novel ways.",
    "mechanics": "Able to create, adapt, and improve technology in novel ways.",
    "mechanic": "Able to create, adapt, and improve technology in novel ways.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Technological innovation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to create, adapt, and improve technology in novel ways.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technological-proficiency",
    "name": "Technological proficiency",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Proficiency in advanced technology",
    "description": "Proficiency in advanced technology",
    "mechanics": "Proficiency in advanced technology",
    "mechanic": "Proficiency in advanced technology",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Technological proficiency\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nProficiency in advanced technology",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technology",
    "name": "Technology",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Familiarity with advanced technologies, including hacking, surveillance equipment, and advanced weapons",
    "description": "Familiarity with advanced technologies, including hacking, surveillance equipment, and advanced weapons",
    "mechanics": "Familiarity with advanced technologies, including hacking, surveillance equipment, and advanced weapons",
    "mechanic": "Familiarity with advanced technologies, including hacking, surveillance equipment, and advanced weapons",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Technology\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nFamiliarity with advanced technologies, including hacking, surveillance equipment, and advanced weapons",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-terrain-expert",
    "name": "Terrain Expert",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Scouts have knacks that allow them to improve their efficiency in specific terrains, which may be taken multiple times for different terrain types.   *+2 to Stealth, Survival and Defense in chosen Terrain* #",
    "description": "Scouts have knacks that allow them to improve their efficiency in specific terrains, which may be taken multiple times for different terrain types.   *+2 to Stealth, Survival and Defense in chosen Terrain* #",
    "mechanics": "Scouts have knacks that allow them to improve their efficiency in specific terrains, which may be taken multiple times for different terrain types.   *+2 to Stealth, Survival and Defense in chosen Terrain* #",
    "mechanic": "Scouts have knacks that allow them to improve their efficiency in specific terrains, which may be taken multiple times for different terrain types.   *+2 to Stealth, Survival and Defense in chosen Terrain* #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [
      {
        "target": "Stealth",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Stealth"
      }
    ],
    "body": "# Terrain Expert\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nScouts have knacks that allow them to improve their efficiency in specific terrains, which may be taken multiple times for different terrain types.   *+2 to Stealth, Survival and Defense in chosen Terrain* #",
    "notes": "[Modifier] +2 to Stealth\n[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Stealth",
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-trade-tools",
    "name": "Trade Tools",
    "category": "traits",
    "trait_type": "Common Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Standard occupational gear, specialized toolkits, and field equipment.",
    "description": "Standard occupational gear, specialized toolkits, and field equipment.",
    "mechanics": "Standard occupational gear, specialized toolkits, and field equipment.",
    "mechanic": "Standard occupational gear, specialized toolkits, and field equipment.",
    "rules": "Basic Common Occupational Trait (1 BP).",
    "special_rules": "Basic Common Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Trade Tools\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Common Occupational Trait\n**BP Cost**: 1\n\n## Description\nStandard occupational gear, specialized toolkits, and field equipment.",
    "notes": "[Rule] Basic Common Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Common Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-travel",
    "name": "Travel",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Piloting spacecraft, driving ground vehicles, and navigating through unfamiliar terrain   *+2 Piloting and Navigation*  #",
    "description": "Piloting spacecraft, driving ground vehicles, and navigating through unfamiliar terrain   *+2 Piloting and Navigation*  #",
    "mechanics": "Piloting spacecraft, driving ground vehicles, and navigating through unfamiliar terrain   *+2 Piloting and Navigation*  #",
    "mechanic": "Piloting spacecraft, driving ground vehicles, and navigating through unfamiliar terrain   *+2 Piloting and Navigation*  #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Travel\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nPiloting spacecraft, driving ground vehicles, and navigating through unfamiliar terrain   *+2 Piloting and Navigation*  #",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-unpredictability",
    "name": "Unpredictability",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Unpredictable in their actions and decisions, making them both intriguing allies and formidable adversaries   *+2 Initiative* #",
    "description": "Unpredictable in their actions and decisions, making them both intriguing allies and formidable adversaries   *+2 Initiative* #",
    "mechanics": "Unpredictable in their actions and decisions, making them both intriguing allies and formidable adversaries   *+2 Initiative* #",
    "mechanic": "Unpredictable in their actions and decisions, making them both intriguing allies and formidable adversaries   *+2 Initiative* #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [
      {
        "target": "initiative-mod",
        "type": "combat",
        "value": 2,
        "mode": "inherent",
        "description": "+2 Initiative"
      }
    ],
    "body": "# Unpredictability\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nUnpredictable in their actions and decisions, making them both intriguing allies and formidable adversaries   *+2 Initiative* #",
    "notes": "[Modifier] +2 Initiative\n[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 Initiative",
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-venues",
    "name": "Venues",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Has strong ties to certain performance venues   *+2 Equipment (Hideout) and +1 Wealth* #",
    "description": "Has strong ties to certain performance venues   *+2 Equipment (Hideout) and +1 Wealth* #",
    "mechanics": "Has strong ties to certain performance venues   *+2 Equipment (Hideout) and +1 Wealth* #",
    "mechanic": "Has strong ties to certain performance venues   *+2 Equipment (Hideout) and +1 Wealth* #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [
      {
        "target": "Wealth",
        "type": "wealth",
        "value": 1,
        "mode": "inherent",
        "description": "+1 Wealth Score"
      }
    ],
    "body": "# Venues\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHas strong ties to certain performance venues   *+2 Equipment (Hideout) and +1 Wealth* #",
    "notes": "[Modifier] +1 Wealth Score\n[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Modifier] +1 Wealth Score",
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-versatile",
    "name": "Versatile",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to operate in a variety of environments, including underwater and in zero-gravity",
    "description": "Able to operate in a variety of environments, including underwater and in zero-gravity",
    "mechanics": "Able to operate in a variety of environments, including underwater and in zero-gravity",
    "mechanic": "Able to operate in a variety of environments, including underwater and in zero-gravity",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Versatile\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to operate in a variety of environments, including underwater and in zero-gravity",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-well-equipped",
    "name": "Well-Equipped",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Equipped with the latest technology and weaponry   *+2 Equipment* #",
    "description": "Equipped with the latest technology and weaponry   *+2 Equipment* #",
    "mechanics": "Equipped with the latest technology and weaponry   *+2 Equipment* #",
    "mechanic": "Equipped with the latest technology and weaponry   *+2 Equipment* #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Well-Equipped\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nEquipped with the latest technology and weaponry   *+2 Equipment* #",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  }
];
export const ORIGIN_TRAITS = [
  {
    "id": "trait-adaptability",
    "name": "Adaptability",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Quickly adjusts to new environments, changing protocols, and unexpected physical conditions.",
    "description": "Quickly adjusts to new environments, changing protocols, and unexpected physical conditions.",
    "mechanics": "Quickly adjusts to new environments, changing protocols, and unexpected physical conditions.",
    "mechanic": "Quickly adjusts to new environments, changing protocols, and unexpected physical conditions.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Adaptability\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nQuickly adjusts to new environments, changing protocols, and unexpected physical conditions.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-adventurous-spirit",
    "name": "Adventurous Spirit",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Fearless enthusiasm for venturing beyond established perimeter fences into uncharted wilds.",
    "description": "Fearless enthusiasm for venturing beyond established perimeter fences into uncharted wilds.",
    "mechanics": "Fearless enthusiasm for venturing beyond established perimeter fences into uncharted wilds.",
    "mechanic": "Fearless enthusiasm for venturing beyond established perimeter fences into uncharted wilds.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Adventurous Spirit\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nFearless enthusiasm for venturing beyond established perimeter fences into uncharted wilds.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-analytical-thinking",
    "name": "Analytical Thinking",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Systematic data deconstruction, statistical pattern recognition, and logical analysis.",
    "description": "Systematic data deconstruction, statistical pattern recognition, and logical analysis.",
    "mechanics": "Systematic data deconstruction, statistical pattern recognition, and logical analysis.",
    "mechanic": "Systematic data deconstruction, statistical pattern recognition, and logical analysis.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Analytical Thinking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nSystematic data deconstruction, statistical pattern recognition, and logical analysis.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-animal-husbandry",
    "name": "Animal Husbandry",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Expertise in raising and caring for livestock, understanding animal behavior and nutrition.",
    "description": "Expertise in raising and caring for livestock, understanding animal behavior and nutrition.",
    "mechanics": "Expertise in raising and caring for livestock, understanding animal behavior and nutrition.",
    "mechanic": "Expertise in raising and caring for livestock, understanding animal behavior and nutrition.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Animal Husbandry\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nExpertise in raising and caring for livestock, understanding animal behavior and nutrition.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-aquatic-construction",
    "name": "Aquatic Construction",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Skilled in engineering watertight hulls, flotilla moorings, and submerged habitats.",
    "description": "Skilled in engineering watertight hulls, flotilla moorings, and submerged habitats.",
    "mechanics": "Skilled in engineering watertight hulls, flotilla moorings, and submerged habitats.",
    "mechanic": "Skilled in engineering watertight hulls, flotilla moorings, and submerged habitats.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Aquatic Construction\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nSkilled in engineering watertight hulls, flotilla moorings, and submerged habitats.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-attention-to-detail",
    "name": "Attention to Detail",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Meticulous observation that spots minute anomalies, data flaws, and sensory inconsistencies.",
    "description": "Meticulous observation that spots minute anomalies, data flaws, and sensory inconsistencies.",
    "mechanics": "Meticulous observation that spots minute anomalies, data flaws, and sensory inconsistencies.",
    "mechanic": "Meticulous observation that spots minute anomalies, data flaws, and sensory inconsistencies.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Attention to Detail\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nMeticulous observation that spots minute anomalies, data flaws, and sensory inconsistencies.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-botanical-knowledge",
    "name": "Botanical Knowledge",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Extensive knowledge of plants, crops, and agricultural cultivation techniques.",
    "description": "Extensive knowledge of plants, crops, and agricultural cultivation techniques.",
    "mechanics": "Extensive knowledge of plants, crops, and agricultural cultivation techniques.",
    "mechanic": "Extensive knowledge of plants, crops, and agricultural cultivation techniques.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Botanical Knowledge\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nExtensive knowledge of plants, crops, and agricultural cultivation techniques.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-collaboration",
    "name": "Collaboration",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Peer-review synergy and interdisciplinary communication across research teams.",
    "description": "Peer-review synergy and interdisciplinary communication across research teams.",
    "mechanics": "Peer-review synergy and interdisciplinary communication across research teams.",
    "mechanic": "Peer-review synergy and interdisciplinary communication across research teams.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Collaboration\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPeer-review synergy and interdisciplinary communication across research teams.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-combat-skills",
    "name": "Combat Skills",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Brutal self-defense instincts developed against predatory wildlife and raiders.",
    "description": "Brutal self-defense instincts developed against predatory wildlife and raiders.",
    "mechanics": "Brutal self-defense instincts developed against predatory wildlife and raiders.",
    "mechanic": "Brutal self-defense instincts developed against predatory wildlife and raiders.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Combat Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nBrutal self-defense instincts developed against predatory wildlife and raiders.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-combat-trained",
    "name": "Combat Trained",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Standard military drills covering marksmanship, close-quarters combat, and fireteam movement.",
    "description": "Standard military drills covering marksmanship, close-quarters combat, and fireteam movement.",
    "mechanics": "Standard military drills covering marksmanship, close-quarters combat, and fireteam movement.",
    "mechanic": "Standard military drills covering marksmanship, close-quarters combat, and fireteam movement.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Combat Trained\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nStandard military drills covering marksmanship, close-quarters combat, and fireteam movement.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-community-building",
    "name": "Community Building",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Values community solidarity and possesses skills in building and maintaining relationships among local groups.",
    "description": "Values community solidarity and possesses skills in building and maintaining relationships among local groups.",
    "mechanics": "Values community solidarity and possesses skills in building and maintaining relationships among local groups.",
    "mechanic": "Values community solidarity and possesses skills in building and maintaining relationships among local groups.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Community Building\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nValues community solidarity and possesses skills in building and maintaining relationships among local groups.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-contacts",
    "name": "Contacts",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Extensive rolodex of street informants, corporate fixers, bar owners, and dockworkers.",
    "description": "Extensive rolodex of street informants, corporate fixers, bar owners, and dockworkers.",
    "mechanics": "Extensive rolodex of street informants, corporate fixers, bar owners, and dockworkers.",
    "mechanic": "Extensive rolodex of street informants, corporate fixers, bar owners, and dockworkers.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Contacts\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nExtensive rolodex of street informants, corporate fixers, bar owners, and dockworkers.",
    "notes": "[Rule] Basic Origin Trait (1 BP).\n[Prerequisite] Charisma 1",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP).",
      "[Prerequisite] Charisma 1"
    ]
  },
  {
    "id": "trait-curiosity",
    "name": "Curiosity",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "An insatiable drive to explore the unknown, analyze anomalous phenomena, and investigate new discoveries.",
    "description": "An insatiable drive to explore the unknown, analyze anomalous phenomena, and investigate new discoveries.",
    "mechanics": "An insatiable drive to explore the unknown, analyze anomalous phenomena, and investigate new discoveries.",
    "mechanic": "An insatiable drive to explore the unknown, analyze anomalous phenomena, and investigate new discoveries.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Curiosity\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nAn insatiable drive to explore the unknown, analyze anomalous phenomena, and investigate new discoveries.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-diplomacy",
    "name": "Diplomacy",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Skill in negotiation, de-escalating tensions, and maintaining formal alliances.",
    "description": "Skill in negotiation, de-escalating tensions, and maintaining formal alliances.",
    "mechanics": "Skill in negotiation, de-escalating tensions, and maintaining formal alliances.",
    "mechanic": "Skill in negotiation, de-escalating tensions, and maintaining formal alliances.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Diplomacy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nSkill in negotiation, de-escalating tensions, and maintaining formal alliances.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-disciplined",
    "name": "Disciplined",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Conditioned obedience to command structures and flawless execution of standard operating procedures.",
    "description": "Conditioned obedience to command structures and flawless execution of standard operating procedures.",
    "mechanics": "Conditioned obedience to command structures and flawless execution of standard operating procedures.",
    "mechanic": "Conditioned obedience to command structures and flawless execution of standard operating procedures.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Disciplined\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nConditioned obedience to command structures and flawless execution of standard operating procedures.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-empathy",
    "name": "Empathy",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Intuitive emotional resonance that perceives the underlying drives and moods of sapient beings and creatures.",
    "description": "Intuitive emotional resonance that perceives the underlying drives and moods of sapient beings and creatures.",
    "mechanics": "Intuitive emotional resonance that perceives the underlying drives and moods of sapient beings and creatures.",
    "mechanic": "Intuitive emotional resonance that perceives the underlying drives and moods of sapient beings and creatures.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Empathy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nIntuitive emotional resonance that perceives the underlying drives and moods of sapient beings and creatures.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-entertainment-skill",
    "name": "Entertainment Skill",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Talent in performance arts, music, athletics, gaming, or high-stakes social recreation.",
    "description": "Talent in performance arts, music, athletics, gaming, or high-stakes social recreation.",
    "mechanics": "Talent in performance arts, music, athletics, gaming, or high-stakes social recreation.",
    "mechanic": "Talent in performance arts, music, athletics, gaming, or high-stakes social recreation.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Entertainment Skill\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nTalent in performance arts, music, athletics, gaming, or high-stakes social recreation.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-environmental-awareness",
    "name": "Environmental Awareness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Attuned to ambient shifts in barometric pressure, water currents, temperature, and atmospheric toxicity.",
    "description": "Attuned to ambient shifts in barometric pressure, water currents, temperature, and atmospheric toxicity.",
    "mechanics": "Attuned to ambient shifts in barometric pressure, water currents, temperature, and atmospheric toxicity.",
    "mechanic": "Attuned to ambient shifts in barometric pressure, water currents, temperature, and atmospheric toxicity.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Environmental Awareness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nAttuned to ambient shifts in barometric pressure, water currents, temperature, and atmospheric toxicity.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-green-thumb",
    "name": "Green Thumb",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Natural talent for nurturing plants and making them thrive even in harsh soil.",
    "description": "Natural talent for nurturing plants and making them thrive even in harsh soil.",
    "mechanics": "Natural talent for nurturing plants and making them thrive even in harsh soil.",
    "mechanic": "Natural talent for nurturing plants and making them thrive even in harsh soil.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Green Thumb\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nNatural talent for nurturing plants and making them thrive even in harsh soil.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-honor-bound",
    "name": "Honor-Bound",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Devotion to comrades and code of duty; willing to endure hardship for the unit.",
    "description": "Devotion to comrades and code of duty; willing to endure hardship for the unit.",
    "mechanics": "Devotion to comrades and code of duty; willing to endure hardship for the unit.",
    "mechanic": "Devotion to comrades and code of duty; willing to endure hardship for the unit.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Honor-Bound\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nDevotion to comrades and code of duty; willing to endure hardship for the unit.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-independence",
    "name": "Independence",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Self-reliant problem solving in the cold vacuum where help is light-years away.",
    "description": "Self-reliant problem solving in the cold vacuum where help is light-years away.",
    "mechanics": "Self-reliant problem solving in the cold vacuum where help is light-years away.",
    "mechanic": "Self-reliant problem solving in the cold vacuum where help is light-years away.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Independence\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nSelf-reliant problem solving in the cold vacuum where help is light-years away.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-intellectualism",
    "name": "Intellectualism",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Formal academic pedagogy and comprehensive theoretical mastery in advanced sciences.",
    "description": "Formal academic pedagogy and comprehensive theoretical mastery in advanced sciences.",
    "mechanics": "Formal academic pedagogy and comprehensive theoretical mastery in advanced sciences.",
    "mechanic": "Formal academic pedagogy and comprehensive theoretical mastery in advanced sciences.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Intellectualism\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nFormal academic pedagogy and comprehensive theoretical mastery in advanced sciences.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-intuition",
    "name": "Intuition",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "A preternatural sixth sense for impending ambushes, environmental collapses, and traps.",
    "description": "A preternatural sixth sense for impending ambushes, environmental collapses, and traps.",
    "mechanics": "A preternatural sixth sense for impending ambushes, environmental collapses, and traps.",
    "mechanic": "A preternatural sixth sense for impending ambushes, environmental collapses, and traps.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Intuition\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nA preternatural sixth sense for impending ambushes, environmental collapses, and traps.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-leadership",
    "name": "Leadership",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Inspirational command presence that organizes groups and rallies morale.",
    "description": "Inspirational command presence that organizes groups and rallies morale.",
    "mechanics": "Inspirational command presence that organizes groups and rallies morale.",
    "mechanic": "Inspirational command presence that organizes groups and rallies morale.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Leadership\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nInspirational command presence that organizes groups and rallies morale.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-lifestyle-preferences",
    "name": "Lifestyle Preferences",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Refined aesthetic tastes and familiarity with high-society etiquette and luxury commerce.",
    "description": "Refined aesthetic tastes and familiarity with high-society etiquette and luxury commerce.",
    "mechanics": "Refined aesthetic tastes and familiarity with high-society etiquette and luxury commerce.",
    "mechanic": "Refined aesthetic tastes and familiarity with high-society etiquette and luxury commerce.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Lifestyle Preferences\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nRefined aesthetic tastes and familiarity with high-society etiquette and luxury commerce.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-loyal",
    "name": "Loyal",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Unwavering commitment that rejects subversion, psychological coercion, and bribery.",
    "description": "Unwavering commitment that rejects subversion, psychological coercion, and bribery.",
    "mechanics": "Unwavering commitment that rejects subversion, psychological coercion, and bribery.",
    "mechanic": "Unwavering commitment that rejects subversion, psychological coercion, and bribery.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Loyal\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nUnwavering commitment that rejects subversion, psychological coercion, and bribery.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-management",
    "name": "Management",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Skill in organizing resort logistics, hospitality staff, entertainment venues, and guest services.",
    "description": "Skill in organizing resort logistics, hospitality staff, entertainment venues, and guest services.",
    "mechanics": "Skill in organizing resort logistics, hospitality staff, entertainment venues, and guest services.",
    "mechanic": "Skill in organizing resort logistics, hospitality staff, entertainment venues, and guest services.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Management\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nSkill in organizing resort logistics, hospitality staff, entertainment venues, and guest services.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mechanical-aptitude",
    "name": "Mechanical Aptitude",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Innate comprehension of heavy machinery, hydraulics, conveyor grids, and turbines.",
    "description": "Innate comprehension of heavy machinery, hydraulics, conveyor grids, and turbines.",
    "mechanics": "Innate comprehension of heavy machinery, hydraulics, conveyor grids, and turbines.",
    "mechanic": "Innate comprehension of heavy machinery, hydraulics, conveyor grids, and turbines.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Mechanical Aptitude\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nInnate comprehension of heavy machinery, hydraulics, conveyor grids, and turbines.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mental-toughness",
    "name": "Mental Toughness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Psychological resilience against isolation, sensory deprivation, fear, and pain.",
    "description": "Psychological resilience against isolation, sensory deprivation, fear, and pain.",
    "mechanics": "Psychological resilience against isolation, sensory deprivation, fear, and pain.",
    "mechanic": "Psychological resilience against isolation, sensory deprivation, fear, and pain.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Mental Toughness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPsychological resilience against isolation, sensory deprivation, fear, and pain.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mentorship",
    "name": "Mentorship",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Patient pedagogical wisdom that accelerates the learning and focus of pupils and companions.",
    "description": "Patient pedagogical wisdom that accelerates the learning and focus of pupils and companions.",
    "mechanics": "Patient pedagogical wisdom that accelerates the learning and focus of pupils and companions.",
    "mechanic": "Patient pedagogical wisdom that accelerates the learning and focus of pupils and companions.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Mentorship\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPatient pedagogical wisdom that accelerates the learning and focus of pupils and companions.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-milspec-gear",
    "name": "Milspec Gear",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Issued military-grade armor, sidearms, and tactical field gear.",
    "description": "Issued military-grade armor, sidearms, and tactical field gear.",
    "mechanics": "Issued military-grade armor, sidearms, and tactical field gear.",
    "mechanic": "Issued military-grade armor, sidearms, and tactical field gear.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Milspec Gear\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nIssued military-grade armor, sidearms, and tactical field gear.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-non-combat-focus",
    "name": "Non-Combat Focus",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Concentrated mastery in civic vocations, gourmet culinary arts, or fine craftsmanship.",
    "description": "Concentrated mastery in civic vocations, gourmet culinary arts, or fine craftsmanship.",
    "mechanics": "Concentrated mastery in civic vocations, gourmet culinary arts, or fine craftsmanship.",
    "mechanic": "Concentrated mastery in civic vocations, gourmet culinary arts, or fine craftsmanship.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Non-Combat Focus\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nConcentrated mastery in civic vocations, gourmet culinary arts, or fine craftsmanship.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-open-mindedness",
    "name": "Open-Mindedness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Philosophical tolerance that bridges deep cultural, religious, and alien divides.",
    "description": "Philosophical tolerance that bridges deep cultural, religious, and alien divides.",
    "mechanics": "Philosophical tolerance that bridges deep cultural, religious, and alien divides.",
    "mechanic": "Philosophical tolerance that bridges deep cultural, religious, and alien divides.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Open-Mindedness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPhilosophical tolerance that bridges deep cultural, religious, and alien divides.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-optimistic",
    "name": "Optimistic",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "An unshakeable positive demeanor that inspires resilience in bleak moments.",
    "description": "An unshakeable positive demeanor that inspires resilience in bleak moments.",
    "mechanics": "An unshakeable positive demeanor that inspires resilience in bleak moments.",
    "mechanic": "An unshakeable positive demeanor that inspires resilience in bleak moments.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Optimistic\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nAn unshakeable positive demeanor that inspires resilience in bleak moments.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-peaceful-nature",
    "name": "Peaceful Nature",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Radiates serene composure that disarms hostility and calms tense standoffs.",
    "description": "Radiates serene composure that disarms hostility and calms tense standoffs.",
    "mechanics": "Radiates serene composure that disarms hostility and calms tense standoffs.",
    "mechanic": "Radiates serene composure that disarms hostility and calms tense standoffs.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Peaceful Nature\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nRadiates serene composure that disarms hostility and calms tense standoffs.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-persistence",
    "name": "Persistence",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Tireless determination that runs countless trials until a breakthrough is achieved.",
    "description": "Tireless determination that runs countless trials until a breakthrough is achieved.",
    "mechanics": "Tireless determination that runs countless trials until a breakthrough is achieved.",
    "mechanic": "Tireless determination that runs countless trials until a breakthrough is achieved.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Persistence\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nTireless determination that runs countless trials until a breakthrough is achieved.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-physical-endurance",
    "name": "Physical Endurance",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "High tolerance for atmospheric toxins, extreme temperatures, and caloric deprivation.",
    "description": "High tolerance for atmospheric toxins, extreme temperatures, and caloric deprivation.",
    "mechanics": "High tolerance for atmospheric toxins, extreme temperatures, and caloric deprivation.",
    "mechanic": "High tolerance for atmospheric toxins, extreme temperatures, and caloric deprivation.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Physical Endurance\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nHigh tolerance for atmospheric toxins, extreme temperatures, and caloric deprivation.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-physical-strength",
    "name": "Physical Strength",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Musculoskeletal conditioning built through rigorous manual labor and heavy lifting.",
    "description": "Musculoskeletal conditioning built through rigorous manual labor and heavy lifting.",
    "mechanics": "Musculoskeletal conditioning built through rigorous manual labor and heavy lifting.",
    "mechanic": "Musculoskeletal conditioning built through rigorous manual labor and heavy lifting.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Physical Strength\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nMusculoskeletal conditioning built through rigorous manual labor and heavy lifting.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-pilot-skills",
    "name": "Pilot Skills",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Practiced control of specialized terrain, atmospheric, or orbital transport craft.",
    "description": "Practiced control of specialized terrain, atmospheric, or orbital transport craft.",
    "mechanics": "Practiced control of specialized terrain, atmospheric, or orbital transport craft.",
    "mechanic": "Practiced control of specialized terrain, atmospheric, or orbital transport craft.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Pilot Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPracticed control of specialized terrain, atmospheric, or orbital transport craft.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-practicality",
    "name": "Practicality",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Focuses on utilitarian efficiency, cutting through abstract theories to deliver results.",
    "description": "Focuses on utilitarian efficiency, cutting through abstract theories to deliver results.",
    "mechanics": "Focuses on utilitarian efficiency, cutting through abstract theories to deliver results.",
    "mechanic": "Focuses on utilitarian efficiency, cutting through abstract theories to deliver results.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Practicality\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nFocuses on utilitarian efficiency, cutting through abstract theories to deliver results.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-problem-solving",
    "name": "Problem Solving",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Exceptional critical thinking and analytical troubleshooting under duress.",
    "description": "Exceptional critical thinking and analytical troubleshooting under duress.",
    "mechanics": "Exceptional critical thinking and analytical troubleshooting under duress.",
    "mechanic": "Exceptional critical thinking and analytical troubleshooting under duress.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Problem Solving\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nExceptional critical thinking and analytical troubleshooting under duress.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-resource-management",
    "name": "Resource Management",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Meticulous rationing of food, water, battery cells, and structural spare parts.",
    "description": "Meticulous rationing of food, water, battery cells, and structural spare parts.",
    "mechanics": "Meticulous rationing of food, water, battery cells, and structural spare parts.",
    "mechanic": "Meticulous rationing of food, water, battery cells, and structural spare parts.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Resource Management\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nMeticulous rationing of food, water, battery cells, and structural spare parts.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-resourcefulness",
    "name": "Resourcefulness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Makes the most of scarce tools, improvising creative solutions under pressure.",
    "description": "Makes the most of scarce tools, improvising creative solutions under pressure.",
    "mechanics": "Makes the most of scarce tools, improvising creative solutions under pressure.",
    "mechanic": "Makes the most of scarce tools, improvising creative solutions under pressure.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Resourcefulness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nMakes the most of scarce tools, improvising creative solutions under pressure.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-risk-taking",
    "name": "Risk-Taking",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Willingness to gamble on razor-thin safety margins to accomplish difficult goals.",
    "description": "Willingness to gamble on razor-thin safety margins to accomplish difficult goals.",
    "mechanics": "Willingness to gamble on razor-thin safety margins to accomplish difficult goals.",
    "mechanic": "Willingness to gamble on razor-thin safety margins to accomplish difficult goals.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Risk-Taking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nWillingness to gamble on razor-thin safety margins to accomplish difficult goals.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-scientific-knowledge",
    "name": "Scientific Knowledge",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Practical applied science in xenobiology, geology, and atmospheric terraforming.",
    "description": "Practical applied science in xenobiology, geology, and atmospheric terraforming.",
    "mechanics": "Practical applied science in xenobiology, geology, and atmospheric terraforming.",
    "mechanic": "Practical applied science in xenobiology, geology, and atmospheric terraforming.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Scientific Knowledge\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPractical applied science in xenobiology, geology, and atmospheric terraforming.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-sea-piloting",
    "name": "Sea Piloting",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Mastery over hydrofoils, submersibles, surface skiffs, and massive oceanic platforms.",
    "description": "Mastery over hydrofoils, submersibles, surface skiffs, and massive oceanic platforms.",
    "mechanics": "Mastery over hydrofoils, submersibles, surface skiffs, and massive oceanic platforms.",
    "mechanic": "Mastery over hydrofoils, submersibles, surface skiffs, and massive oceanic platforms.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Sea Piloting\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nMastery over hydrofoils, submersibles, surface skiffs, and massive oceanic platforms.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-shared-wisdom",
    "name": "Shared Wisdom",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Offers profound insight that elevates the actions of comrades.",
    "description": "Offers profound insight that elevates the actions of comrades.",
    "mechanics": "Offers profound insight that elevates the actions of comrades.",
    "mechanic": "Offers profound insight that elevates the actions of comrades.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Shared Wisdom\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nOffers profound insight that elevates the actions of comrades.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-smooth-talking",
    "name": "Smooth Talking",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Charismatic conversational flow that disarms suspicion and charms conversational partners.",
    "description": "Charismatic conversational flow that disarms suspicion and charms conversational partners.",
    "mechanics": "Charismatic conversational flow that disarms suspicion and charms conversational partners.",
    "mechanic": "Charismatic conversational flow that disarms suspicion and charms conversational partners.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Smooth Talking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nCharismatic conversational flow that disarms suspicion and charms conversational partners.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-social-skills",
    "name": "Social Skills",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Navigates dense cultural melting pots, high-rise galas, and underground speakeasies with ease.",
    "description": "Navigates dense cultural melting pots, high-rise galas, and underground speakeasies with ease.",
    "mechanics": "Navigates dense cultural melting pots, high-rise galas, and underground speakeasies with ease.",
    "mechanic": "Navigates dense cultural melting pots, high-rise galas, and underground speakeasies with ease.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Social Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nNavigates dense cultural melting pots, high-rise galas, and underground speakeasies with ease.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-specialized-knowledge",
    "name": "Specialized Knowledge",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Deep technical expertise in metallurgy, industrial chemistry, or structural fabrication.",
    "description": "Deep technical expertise in metallurgy, industrial chemistry, or structural fabrication.",
    "mechanics": "Deep technical expertise in metallurgy, industrial chemistry, or structural fabrication.",
    "mechanic": "Deep technical expertise in metallurgy, industrial chemistry, or structural fabrication.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Specialized Knowledge\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nDeep technical expertise in metallurgy, industrial chemistry, or structural fabrication.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-spiritual-awareness",
    "name": "Spiritual Awareness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Attuned to metaphysical resonances, ley conduits, and unseen psychic currents.",
    "description": "Attuned to metaphysical resonances, ley conduits, and unseen psychic currents.",
    "mechanics": "Attuned to metaphysical resonances, ley conduits, and unseen psychic currents.",
    "mechanic": "Attuned to metaphysical resonances, ley conduits, and unseen psychic currents.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Spiritual Awareness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nAttuned to metaphysical resonances, ley conduits, and unseen psychic currents.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-strategic",
    "name": "Strategic",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Battlefield tactical assessment and mission operation planning.",
    "description": "Battlefield tactical assessment and mission operation planning.",
    "mechanics": "Battlefield tactical assessment and mission operation planning.",
    "mechanic": "Battlefield tactical assessment and mission operation planning.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Strategic\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nBattlefield tactical assessment and mission operation planning.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-street-fighting",
    "name": "Street Fighting",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Dirty fighting techniques optimized for claustrophobic alleys, elevator cabs, and crowded subway cars.",
    "description": "Dirty fighting techniques optimized for claustrophobic alleys, elevator cabs, and crowded subway cars.",
    "mechanics": "Dirty fighting techniques optimized for claustrophobic alleys, elevator cabs, and crowded subway cars.",
    "mechanic": "Dirty fighting techniques optimized for claustrophobic alleys, elevator cabs, and crowded subway cars.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Street Fighting\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nDirty fighting techniques optimized for claustrophobic alleys, elevator cabs, and crowded subway cars.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-streetwise",
    "name": "Streetwise",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Knows who controls each block, how to evade gang tolls, and where to fence hot cargo.",
    "description": "Knows who controls each block, how to evade gang tolls, and where to fence hot cargo.",
    "mechanics": "Knows who controls each block, how to evade gang tolls, and where to fence hot cargo.",
    "mechanic": "Knows who controls each block, how to evade gang tolls, and where to fence hot cargo.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Streetwise\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nKnows who controls each block, how to evade gang tolls, and where to fence hot cargo.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-studious",
    "name": "Studious",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Deep immersion in research databases, academic journals, and historical archives.",
    "description": "Deep immersion in research databases, academic journals, and historical archives.",
    "mechanics": "Deep immersion in research databases, academic journals, and historical archives.",
    "mechanic": "Deep immersion in research databases, academic journals, and historical archives.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Studious\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nDeep immersion in research databases, academic journals, and historical archives.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-survival-skills",
    "name": "Survival Skills",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Honed instincts for foraging, navigating wilderness, and finding shelter in hostile terrain.",
    "description": "Honed instincts for foraging, navigating wilderness, and finding shelter in hostile terrain.",
    "mechanics": "Honed instincts for foraging, navigating wilderness, and finding shelter in hostile terrain.",
    "mechanic": "Honed instincts for foraging, navigating wilderness, and finding shelter in hostile terrain.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Survival Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nHoned instincts for foraging, navigating wilderness, and finding shelter in hostile terrain.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-sustainable-practices",
    "name": "Sustainable Practices",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Deep understanding of ecological balance, crop rotation, and water conservation.",
    "description": "Deep understanding of ecological balance, crop rotation, and water conservation.",
    "mechanics": "Deep understanding of ecological balance, crop rotation, and water conservation.",
    "mechanic": "Deep understanding of ecological balance, crop rotation, and water conservation.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Sustainable Practices\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nDeep understanding of ecological balance, crop rotation, and water conservation.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-teamwork",
    "name": "Teamwork",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Practiced coordination in gang work, shift labor, and complex multi-person tasks.",
    "description": "Practiced coordination in gang work, shift labor, and complex multi-person tasks.",
    "mechanics": "Practiced coordination in gang work, shift labor, and complex multi-person tasks.",
    "mechanic": "Practiced coordination in gang work, shift labor, and complex multi-person tasks.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Teamwork\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPracticed coordination in gang work, shift labor, and complex multi-person tasks.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-tech-savvy",
    "name": "Tech-Savvy",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Intimate familiarity with consumer neural nets, public datagrids, and ubiquitous urban tech.",
    "description": "Intimate familiarity with consumer neural nets, public datagrids, and ubiquitous urban tech.",
    "mechanics": "Intimate familiarity with consumer neural nets, public datagrids, and ubiquitous urban tech.",
    "mechanic": "Intimate familiarity with consumer neural nets, public datagrids, and ubiquitous urban tech.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Tech-Savvy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nIntimate familiarity with consumer neural nets, public datagrids, and ubiquitous urban tech.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technical-skills",
    "name": "Technical Skills",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Practical hands-on maintenance for hardware, wiring, and mechanical assemblies.",
    "description": "Practical hands-on maintenance for hardware, wiring, and mechanical assemblies.",
    "mechanics": "Practical hands-on maintenance for hardware, wiring, and mechanical assemblies.",
    "mechanic": "Practical hands-on maintenance for hardware, wiring, and mechanical assemblies.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Technical Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPractical hands-on maintenance for hardware, wiring, and mechanical assemblies.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-toughness",
    "name": "Toughness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Physical endurance and psychological grit hardened by harsh living conditions.",
    "description": "Physical endurance and psychological grit hardened by harsh living conditions.",
    "mechanics": "Physical endurance and psychological grit hardened by harsh living conditions.",
    "mechanic": "Physical endurance and psychological grit hardened by harsh living conditions.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Toughness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPhysical endurance and psychological grit hardened by harsh living conditions.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-urban-survival",
    "name": "Urban Survival",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Parkour roof-running, subway tunneling, and vanishing into thick metropolitan crowds.",
    "description": "Parkour roof-running, subway tunneling, and vanishing into thick metropolitan crowds.",
    "mechanics": "Parkour roof-running, subway tunneling, and vanishing into thick metropolitan crowds.",
    "mechanic": "Parkour roof-running, subway tunneling, and vanishing into thick metropolitan crowds.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Urban Survival\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nParkour roof-running, subway tunneling, and vanishing into thick metropolitan crowds.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-zero-g-acclimation",
    "name": "Zero-G Acclimation",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Total bodily familiarity with microgravity, spin gravity, and vacuum suits.",
    "description": "Total bodily familiarity with microgravity, spin gravity, and vacuum suits.",
    "mechanics": "Total bodily familiarity with microgravity, spin gravity, and vacuum suits.",
    "mechanic": "Total bodily familiarity with microgravity, spin gravity, and vacuum suits.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Zero-G Acclimation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nTotal bodily familiarity with microgravity, spin gravity, and vacuum suits.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  }
];

export const ALL_CANONICAL_TRAITS = [
  {
    "id": "trait-adaptability",
    "name": "Adaptability",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Quickly adjusts to new environments, changing protocols, and unexpected physical conditions.",
    "description": "Quickly adjusts to new environments, changing protocols, and unexpected physical conditions.",
    "mechanics": "Quickly adjusts to new environments, changing protocols, and unexpected physical conditions.",
    "mechanic": "Quickly adjusts to new environments, changing protocols, and unexpected physical conditions.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Adaptability\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nQuickly adjusts to new environments, changing protocols, and unexpected physical conditions.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-adapted",
    "name": "Adapted",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "No penalties or Damage from one set environment type. Multiple.",
    "description": "No penalties or Damage from one set environment type. Multiple.",
    "mechanics": "No penalties or Damage from one set environment type. Multiple.",
    "mechanic": "No penalties or Damage from one set environment type. Multiple.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Adapted\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nNo penalties or Damage from one set environment type. Multiple.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-adaptive-features",
    "name": "Adaptive Features",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "May change between specific features during a Light Rest. Ranked.",
    "description": "May change between specific features during a Light Rest. Ranked.",
    "mechanics": "May change between specific features during a Light Rest. Ranked.",
    "mechanic": "May change between specific features during a Light Rest. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Adaptive Features\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nMay change between specific features during a Light Rest. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-adaptive-skill-set",
    "name": "Adaptive Skill Set",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "4 point bonus allotted in a pool. Ranked.",
    "description": "4 point bonus allotted in a pool. Ranked.",
    "mechanics": "4 point bonus allotted in a pool. Ranked.",
    "mechanic": "4 point bonus allotted in a pool. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Adaptive Skill Set\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n4 point bonus allotted in a pool. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-additional-limbs",
    "name": "Additional Limbs",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Another pair of prehensile limbs; Arms, Tentacles or other.",
    "description": "Another pair of prehensile limbs; Arms, Tentacles or other.",
    "mechanics": "Another pair of prehensile limbs; Arms, Tentacles or other.",
    "mechanic": "Another pair of prehensile limbs; Arms, Tentacles or other.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Additional Limbs\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAnother pair of prehensile limbs; Arms, Tentacles or other.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-adventurous-spirit",
    "name": "Adventurous Spirit",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Fearless enthusiasm for venturing beyond established perimeter fences into uncharted wilds.",
    "description": "Fearless enthusiasm for venturing beyond established perimeter fences into uncharted wilds.",
    "mechanics": "Fearless enthusiasm for venturing beyond established perimeter fences into uncharted wilds.",
    "mechanic": "Fearless enthusiasm for venturing beyond established perimeter fences into uncharted wilds.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Adventurous Spirit\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nFearless enthusiasm for venturing beyond established perimeter fences into uncharted wilds.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-ageless",
    "name": "Ageless",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Does not suffer penalties nor show any signs of aging.",
    "description": "Does not suffer penalties nor show any signs of aging.",
    "mechanics": "Does not suffer penalties nor show any signs of aging.",
    "mechanic": "Does not suffer penalties nor show any signs of aging.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Ageless\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDoes not suffer penalties nor show any signs of aging.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-aggressiveness",
    "name": "Aggressiveness",
    "category": "traits",
    "trait_type": "Combat",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Decisive tactical aggression in combat, granting +1 bonus to intimidation and breach actions.",
    "description": "Decisive tactical aggression in combat, granting +1 bonus to intimidation and breach actions.",
    "mechanics": "Decisive tactical aggression in combat, granting +1 bonus to intimidation and breach actions.",
    "mechanic": "Decisive tactical aggression in combat, granting +1 bonus to intimidation and breach actions.",
    "rules": "Basic Combat (1 BP).",
    "special_rules": "Basic Combat (1 BP).",
    "modifiers": [
      {
        "target": "Intimidation",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Intimidation"
      },
      {
        "target": "Breach",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Breach"
      }
    ],
    "body": "# Aggressiveness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Combat\n**BP Cost**: 1\n\n## Description\nDecisive tactical aggression in combat, granting +1 bonus to intimidation and breach actions.",
    "notes": "[Modifier] +1 to Intimidation\n[Modifier] +1 to Breach\n[Rule] Basic Combat (1 BP).",
    "notesList": [
      "[Modifier] +1 to Intimidation",
      "[Modifier] +1 to Breach",
      "[Rule] Basic Combat (1 BP)."
    ]
  },
  {
    "id": "trait-all-around-vision",
    "name": "All-Around Vision",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+4 racial bonus on Perception checks and immune to flanking.",
    "description": "+4 racial bonus on Perception checks and immune to flanking.",
    "mechanics": "+4 racial bonus on Perception checks and immune to flanking.",
    "mechanic": "+4 racial bonus on Perception checks and immune to flanking.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# All-Around Vision\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+4 racial bonus on Perception checks and immune to flanking.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-alter-form-adv",
    "name": "Alter Form (Adv)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Base Category, Change Appearance (+5 Disguise)/gender/adjust minor traits.",
    "description": "Base Category, Change Appearance (+5 Disguise)/gender/adjust minor traits.",
    "mechanics": "Base Category, Change Appearance (+5 Disguise)/gender/adjust minor traits.",
    "mechanic": "Base Category, Change Appearance (+5 Disguise)/gender/adjust minor traits.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Alter Form (Adv)\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nBase Category, Change Appearance (+5 Disguise)/gender/adjust minor traits.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-alter-form-basic",
    "name": "Alter Form (Basic)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Base Category, Change Appearance only (+5 to Disguise).",
    "description": "Base Category, Change Appearance only (+5 to Disguise).",
    "mechanics": "Base Category, Change Appearance only (+5 to Disguise).",
    "mechanic": "Base Category, Change Appearance only (+5 to Disguise).",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Disguise",
        "type": "skill",
        "value": 5,
        "mode": "inherent",
        "description": "+5 to Disguise"
      }
    ],
    "body": "# Alter Form (Basic)\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nBase Category, Change Appearance only (+5 to Disguise).",
    "notes": "[Modifier] +5 to Disguise\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +5 to Disguise",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-alter-form-elite",
    "name": "Alter Form (Elite)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Base Category, Change Appearance (+10 Disguise)/gender/adjust minor traits.",
    "description": "Base Category, Change Appearance (+10 Disguise)/gender/adjust minor traits.",
    "mechanics": "Base Category, Change Appearance (+10 Disguise)/gender/adjust minor traits.",
    "mechanic": "Base Category, Change Appearance (+10 Disguise)/gender/adjust minor traits.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Alter Form (Elite)\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nBase Category, Change Appearance (+10 Disguise)/gender/adjust minor traits.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-alternate-form",
    "name": "Alternate Form",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "An additional ‘Natural’ Form.",
    "description": "An additional ‘Natural’ Form.",
    "mechanics": "An additional ‘Natural’ Form.",
    "mechanic": "An additional ‘Natural’ Form.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Alternate Form\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAn additional ‘Natural’ Form.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-amphibious",
    "name": "Amphibious",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Breathe Air and Water equally well, +10 to Swim Speed.",
    "description": "Breathe Air and Water equally well, +10 to Swim Speed.",
    "mechanics": "Breathe Air and Water equally well, +10 to Swim Speed.",
    "mechanic": "Breathe Air and Water equally well, +10 to Swim Speed.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Swim Speed",
        "type": "skill",
        "value": 10,
        "mode": "inherent",
        "description": "+10 to Swim Speed"
      }
    ],
    "body": "# Amphibious\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nBreathe Air and Water equally well, +10 to Swim Speed.",
    "notes": "[Modifier] +10 to Swim Speed\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +10 to Swim Speed",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-analytical",
    "name": "Analytical",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to analyze data and information to make informed decisions",
    "description": "Ability to analyze data and information to make informed decisions",
    "mechanics": "Ability to analyze data and information to make informed decisions",
    "mechanic": "Ability to analyze data and information to make informed decisions",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Analytical\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to analyze data and information to make informed decisions",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-analytical-thinking",
    "name": "Analytical Thinking",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Systematic data deconstruction, statistical pattern recognition, and logical analysis.",
    "description": "Systematic data deconstruction, statistical pattern recognition, and logical analysis.",
    "mechanics": "Systematic data deconstruction, statistical pattern recognition, and logical analysis.",
    "mechanic": "Systematic data deconstruction, statistical pattern recognition, and logical analysis.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Analytical Thinking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nSystematic data deconstruction, statistical pattern recognition, and logical analysis.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-animal-husbandry",
    "name": "Animal Husbandry",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Expertise in raising and caring for livestock, understanding animal behavior and nutrition.",
    "description": "Expertise in raising and caring for livestock, understanding animal behavior and nutrition.",
    "mechanics": "Expertise in raising and caring for livestock, understanding animal behavior and nutrition.",
    "mechanic": "Expertise in raising and caring for livestock, understanding animal behavior and nutrition.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Animal Husbandry\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nExpertise in raising and caring for livestock, understanding animal behavior and nutrition.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-appraisal",
    "name": "Appraisal",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants have the ability to accurately assess the value of items, whether it's rare artifacts, technology, or resources. They can quickly determine the worth of goods and negotiate fair prices.",
    "description": "Merchants have the ability to accurately assess the value of items, whether it's rare artifacts, technology, or resources. They can quickly determine the worth of goods and negotiate fair prices.",
    "mechanics": "Merchants have the ability to accurately assess the value of items, whether it's rare artifacts, technology, or resources. They can quickly determine the worth of goods and negotiate fair prices.",
    "mechanic": "Merchants have the ability to accurately assess the value of items, whether it's rare artifacts, technology, or resources. They can quickly determine the worth of goods and negotiate fair prices.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Appraisal\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants have the ability to accurately assess the value of items, whether it's rare artifacts, technology, or resources. They can quickly determine the worth of goods and negotiate fair prices.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-aquatic",
    "name": "Aquatic",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+4 racial bonus on Swim checks and may take 10 on swimming checks.",
    "description": "+4 racial bonus on Swim checks and may take 10 on swimming checks.",
    "mechanics": "+4 racial bonus on Swim checks and may take 10 on swimming checks.",
    "mechanic": "+4 racial bonus on Swim checks and may take 10 on swimming checks.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Aquatic\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+4 racial bonus on Swim checks and may take 10 on swimming checks.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-aquatic-construction",
    "name": "Aquatic Construction",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Skilled in engineering watertight hulls, flotilla moorings, and submerged habitats.",
    "description": "Skilled in engineering watertight hulls, flotilla moorings, and submerged habitats.",
    "mechanics": "Skilled in engineering watertight hulls, flotilla moorings, and submerged habitats.",
    "mechanic": "Skilled in engineering watertight hulls, flotilla moorings, and submerged habitats.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Aquatic Construction\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nSkilled in engineering watertight hulls, flotilla moorings, and submerged habitats.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-aquatic-strength",
    "name": "Aquatic Strength",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+1 size category for Combat, Strength or other checks while in water.",
    "description": "+1 size category for Combat, Strength or other checks while in water.",
    "mechanics": "+1 size category for Combat, Strength or other checks while in water.",
    "mechanic": "+1 size category for Combat, Strength or other checks while in water.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Aquatic Strength\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+1 size category for Combat, Strength or other checks while in water.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-attention-to-detail",
    "name": "Attention to Detail",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Meticulous observation that spots minute anomalies, data flaws, and sensory inconsistencies.",
    "description": "Meticulous observation that spots minute anomalies, data flaws, and sensory inconsistencies.",
    "mechanics": "Meticulous observation that spots minute anomalies, data flaws, and sensory inconsistencies.",
    "mechanic": "Meticulous observation that spots minute anomalies, data flaws, and sensory inconsistencies.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Attention to Detail\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nMeticulous observation that spots minute anomalies, data flaws, and sensory inconsistencies.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-attention-to-safety",
    "name": "Attention to Safety",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Awareness of safety protocols and ensuring that their creations are safe to use",
    "description": "Awareness of safety protocols and ensuring that their creations are safe to use",
    "mechanics": "Awareness of safety protocols and ensuring that their creations are safe to use",
    "mechanic": "Awareness of safety protocols and ensuring that their creations are safe to use",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Attention to Safety\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAwareness of safety protocols and ensuring that their creations are safe to use",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-autotroph",
    "name": "Autotroph",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Does not require food/drink, may eat/digest elixirs for effects.",
    "description": "Does not require food/drink, may eat/digest elixirs for effects.",
    "mechanics": "Does not require food/drink, may eat/digest elixirs for effects.",
    "mechanic": "Does not require food/drink, may eat/digest elixirs for effects.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Autotroph\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDoes not require food/drink, may eat/digest elixirs for effects.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-b-e",
    "name": "B&E",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Experience with breaking and entering into secure locations",
    "description": "Experience with breaking and entering into secure locations",
    "mechanics": "Experience with breaking and entering into secure locations",
    "mechanic": "Experience with breaking and entering into secure locations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# B&E\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nExperience with breaking and entering into secure locations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-background",
    "name": "Background",
    "category": "traits",
    "trait_type": "Common Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Select additional training from another secondary Occupation fitting backstory.",
    "description": "Select additional training from another secondary Occupation fitting backstory.",
    "mechanics": "Select additional training from another secondary Occupation fitting backstory.",
    "mechanic": "Select additional training from another secondary Occupation fitting backstory.",
    "rules": "Basic Common Occupational Trait (1 BP).",
    "special_rules": "Basic Common Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Background\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Common Occupational Trait\n**BP Cost**: 1\n\n## Description\nSelect additional training from another secondary Occupation fitting backstory.",
    "notes": "[Rule] Basic Common Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Common Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-blind-sense",
    "name": "Blind Sense",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Sense unseen objects in a 30 ft Radius or Cone of 60 ft.",
    "description": "Sense unseen objects in a 30 ft Radius or Cone of 60 ft.",
    "mechanics": "Sense unseen objects in a 30 ft Radius or Cone of 60 ft.",
    "mechanic": "Sense unseen objects in a 30 ft Radius or Cone of 60 ft.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Blind Sense\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nSense unseen objects in a 30 ft Radius or Cone of 60 ft.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-blind-sight",
    "name": "Blind Sight",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Accurately target unseen objects in a 30 ft Radius or 60 ft Cone.",
    "description": "Accurately target unseen objects in a 30 ft Radius or 60 ft Cone.",
    "mechanics": "Accurately target unseen objects in a 30 ft Radius or 60 ft Cone.",
    "mechanic": "Accurately target unseen objects in a 30 ft Radius or 60 ft Cone.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Blind Sight\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nAccurately target unseen objects in a 30 ft Radius or 60 ft Cone.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-bodyform-adaptation",
    "name": "Bodyform Adaptation",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Physiology shifts to be compatible with the new environment.",
    "description": "Physiology shifts to be compatible with the new environment.",
    "mechanics": "Physiology shifts to be compatible with the new environment.",
    "mechanic": "Physiology shifts to be compatible with the new environment.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Adaptation\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nPhysiology shifts to be compatible with the new environment.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-appendages",
    "name": "Bodyform Appendages",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Shapechange to gain additional limbs (2 arms, legs, tentacles, wings, or fins).",
    "description": "Shapechange to gain additional limbs (2 arms, legs, tentacles, wings, or fins).",
    "mechanics": "Shapechange to gain additional limbs (2 arms, legs, tentacles, wings, or fins).",
    "mechanic": "Shapechange to gain additional limbs (2 arms, legs, tentacles, wings, or fins).",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Appendages\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nShapechange to gain additional limbs (2 arms, legs, tentacles, wings, or fins).",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-armor",
    "name": "Bodyform Armor",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Shapechange to gain a protective layer.",
    "description": "Shapechange to gain a protective layer.",
    "mechanics": "Shapechange to gain a protective layer.",
    "mechanic": "Shapechange to gain a protective layer.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Armor\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nShapechange to gain a protective layer.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-armor-options",
    "name": "Bodyform Armor Options",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Upgraded Bodyform Armor, +1 option slot. Ranked.",
    "description": "Upgraded Bodyform Armor, +1 option slot. Ranked.",
    "mechanics": "Upgraded Bodyform Armor, +1 option slot. Ranked.",
    "mechanic": "Upgraded Bodyform Armor, +1 option slot. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Armor Options\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nUpgraded Bodyform Armor, +1 option slot. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-heavy-armor",
    "name": "Bodyform Heavy Armor",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Shapechange to gain a heavy protective layer (Doubles Bodyform Armor bonus to DR).",
    "description": "Shapechange to gain a heavy protective layer (Doubles Bodyform Armor bonus to DR).",
    "mechanics": "Shapechange to gain a heavy protective layer (Doubles Bodyform Armor bonus to DR).",
    "mechanic": "Shapechange to gain a heavy protective layer (Doubles Bodyform Armor bonus to DR).",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Bodyform Heavy Armor\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nShapechange to gain a heavy protective layer (Doubles Bodyform Armor bonus to DR).",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-bodyform-mutation",
    "name": "Bodyform Mutation",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Adjust to a Racial Trait of which prerequisites are possessed. Ranked.",
    "description": "Adjust to a Racial Trait of which prerequisites are possessed. Ranked.",
    "mechanics": "Adjust to a Racial Trait of which prerequisites are possessed. Ranked.",
    "mechanic": "Adjust to a Racial Trait of which prerequisites are possessed. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Mutation\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAdjust to a Racial Trait of which prerequisites are possessed. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-sizing",
    "name": "Bodyform Sizing",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Shapechange to alter size category 1 step up or down.",
    "description": "Shapechange to alter size category 1 step up or down.",
    "mechanics": "Shapechange to alter size category 1 step up or down.",
    "mechanic": "Shapechange to alter size category 1 step up or down.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Sizing\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nShapechange to alter size category 1 step up or down.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-structure",
    "name": "Bodyform Structure",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Adjust Physical Abilities in equal trade. Once per day for the entire day. Ranked.",
    "description": "Adjust Physical Abilities in equal trade. Once per day for the entire day. Ranked.",
    "mechanics": "Adjust Physical Abilities in equal trade. Once per day for the entire day. Ranked.",
    "mechanic": "Adjust Physical Abilities in equal trade. Once per day for the entire day. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Structure\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAdjust Physical Abilities in equal trade. Once per day for the entire day. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-weapon-options",
    "name": "Bodyform Weapon Options",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Upgraded Bodyform Weapons, +1 option slot. Ranked.",
    "description": "Upgraded Bodyform Weapons, +1 option slot. Ranked.",
    "mechanics": "Upgraded Bodyform Weapons, +1 option slot. Ranked.",
    "mechanic": "Upgraded Bodyform Weapons, +1 option slot. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Weapon Options\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nUpgraded Bodyform Weapons, +1 option slot. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bodyform-weapons",
    "name": "Bodyform Weapons",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Shapechange to gain ‘Natural Weaponry’ based on Size",
    "description": "Shapechange to gain ‘Natural Weaponry’ based on Size",
    "mechanics": "Shapechange to gain ‘Natural Weaponry’ based on Size",
    "mechanic": "Shapechange to gain ‘Natural Weaponry’ based on Size",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Bodyform Weapons\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nShapechange to gain ‘Natural Weaponry’ based on Size",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-bonded-terrain",
    "name": "Bonded Terrain",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 dodge bonus to AC when in a specific terrain type.",
    "description": "+2 dodge bonus to AC when in a specific terrain type.",
    "mechanics": "+2 dodge bonus to AC when in a specific terrain type.",
    "mechanic": "+2 dodge bonus to AC when in a specific terrain type.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Bonded Terrain\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 dodge bonus to AC when in a specific terrain type.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-bonus-feature",
    "name": "Bonus Feature",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Members of this race select one extra feature of their choice.",
    "description": "Members of this race select one extra feature of their choice.",
    "mechanics": "Members of this race select one extra feature of their choice.",
    "mechanic": "Members of this race select one extra feature of their choice.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Bonus Feature\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nMembers of this race select one extra feature of their choice.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-botanical-knowledge",
    "name": "Botanical Knowledge",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Extensive knowledge of plants, crops, and agricultural cultivation techniques.",
    "description": "Extensive knowledge of plants, crops, and agricultural cultivation techniques.",
    "mechanics": "Extensive knowledge of plants, crops, and agricultural cultivation techniques.",
    "mechanic": "Extensive knowledge of plants, crops, and agricultural cultivation techniques.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Botanical Knowledge\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nExtensive knowledge of plants, crops, and agricultural cultivation techniques.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-brutal",
    "name": "Brutal",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Growths/Spurs doubling Str damage bonus to natural damage (Lethal).",
    "description": "Growths/Spurs doubling Str damage bonus to natural damage (Lethal).",
    "mechanics": "Growths/Spurs doubling Str damage bonus to natural damage (Lethal).",
    "mechanic": "Growths/Spurs doubling Str damage bonus to natural damage (Lethal).",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Brutal\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nGrowths/Spurs doubling Str damage bonus to natural damage (Lethal).",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-business-acumen",
    "name": "Business Acumen",
    "category": "traits",
    "trait_type": "Mental",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Keen understanding of market dynamics, trade valuation, credit arbitration, and contract law.",
    "description": "Keen understanding of market dynamics, trade valuation, credit arbitration, and contract law.",
    "mechanics": "Keen understanding of market dynamics, trade valuation, credit arbitration, and contract law.",
    "mechanic": "Keen understanding of market dynamics, trade valuation, credit arbitration, and contract law.",
    "rules": "Basic Mental (1 BP).",
    "special_rules": "Basic Mental (1 BP).",
    "modifiers": [],
    "body": "# Business Acumen\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Mental\n**BP Cost**: 1\n\n## Description\nKeen understanding of market dynamics, trade valuation, credit arbitration, and contract law.",
    "notes": "[Rule] Basic Mental (1 BP).",
    "notesList": [
      "[Rule] Basic Mental (1 BP)."
    ]
  },
  {
    "id": "trait-camouflage",
    "name": "Camouflage",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Choose a favored terrain type. +4 bonus on Stealth checks within that terrain.",
    "description": "Choose a favored terrain type. +4 bonus on Stealth checks within that terrain.",
    "mechanics": "Choose a favored terrain type. +4 bonus on Stealth checks within that terrain.",
    "mechanic": "Choose a favored terrain type. +4 bonus on Stealth checks within that terrain.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Stealth",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Stealth"
      }
    ],
    "body": "# Camouflage\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nChoose a favored terrain type. +4 bonus on Stealth checks within that terrain.",
    "notes": "[Modifier] +4 to Stealth\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +4 to Stealth",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-cat-s-luck",
    "name": "Cat's Luck",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Once per Long Rest make a Reflex Check at Advantage.",
    "description": "Once per Long Rest make a Reflex Check at Advantage.",
    "mechanics": "Once per Long Rest make a Reflex Check at Advantage.",
    "mechanic": "Once per Long Rest make a Reflex Check at Advantage.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Cat's Luck\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nOnce per Long Rest make a Reflex Check at Advantage.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-caution",
    "name": "Caution",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Cautious and prefer to avoid unnecessary risks, especially when dealing with others",
    "description": "Cautious and prefer to avoid unnecessary risks, especially when dealing with others",
    "mechanics": "Cautious and prefer to avoid unnecessary risks, especially when dealing with others",
    "mechanic": "Cautious and prefer to avoid unnecessary risks, especially when dealing with others",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Caution\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nCautious and prefer to avoid unnecessary risks, especially when dealing with others",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-cave-dweller",
    "name": "Cave Dweller",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+4 bonus on Survival checks made underground.",
    "description": "+4 bonus on Survival checks made underground.",
    "mechanics": "+4 bonus on Survival checks made underground.",
    "mechanic": "+4 bonus on Survival checks made underground.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Survival",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Survival"
      }
    ],
    "body": "# Cave Dweller\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+4 bonus on Survival checks made underground.",
    "notes": "[Modifier] +4 to Survival\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +4 to Survival",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-chameleon",
    "name": "Chameleon",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Changes color, +5 Stealth or may take 10 on Stealth checks.",
    "description": "Changes color, +5 Stealth or may take 10 on Stealth checks.",
    "mechanics": "Changes color, +5 Stealth or may take 10 on Stealth checks.",
    "mechanic": "Changes color, +5 Stealth or may take 10 on Stealth checks.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Chameleon\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nChanges color, +5 Stealth or may take 10 on Stealth checks.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-charismatic",
    "name": "Charismatic",
    "category": "traits",
    "trait_type": "Social",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Natural charm and magnetism that puts strangers at ease and bolsters leadership checks.",
    "description": "Natural charm and magnetism that puts strangers at ease and bolsters leadership checks.",
    "mechanics": "Natural charm and magnetism that puts strangers at ease and bolsters leadership checks.",
    "mechanic": "Natural charm and magnetism that puts strangers at ease and bolsters leadership checks.",
    "rules": "Basic Social (1 BP).",
    "special_rules": "Basic Social (1 BP).",
    "modifiers": [],
    "body": "# Charismatic\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Social\n**BP Cost**: 1\n\n## Description\nNatural charm and magnetism that puts strangers at ease and bolsters leadership checks.",
    "notes": "[Rule] Basic Social (1 BP).",
    "notesList": [
      "[Rule] Basic Social (1 BP)."
    ]
  },
  {
    "id": "trait-chloroplast",
    "name": "Chloroplast",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Gain sustenance from and Double Healing rate while in daylight equivalent light.",
    "description": "Gain sustenance from and Double Healing rate while in daylight equivalent light.",
    "mechanics": "Gain sustenance from and Double Healing rate while in daylight equivalent light.",
    "mechanic": "Gain sustenance from and Double Healing rate while in daylight equivalent light.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Chloroplast\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nGain sustenance from and Double Healing rate while in daylight equivalent light.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-collaboration",
    "name": "Collaboration",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Peer-review synergy and interdisciplinary communication across research teams.",
    "description": "Peer-review synergy and interdisciplinary communication across research teams.",
    "mechanics": "Peer-review synergy and interdisciplinary communication across research teams.",
    "mechanic": "Peer-review synergy and interdisciplinary communication across research teams.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Collaboration\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPeer-review synergy and interdisciplinary communication across research teams.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-combat-skills",
    "name": "Combat Skills",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Brutal self-defense instincts developed against predatory wildlife and raiders.",
    "description": "Brutal self-defense instincts developed against predatory wildlife and raiders.",
    "mechanics": "Brutal self-defense instincts developed against predatory wildlife and raiders.",
    "mechanic": "Brutal self-defense instincts developed against predatory wildlife and raiders.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Combat Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nBrutal self-defense instincts developed against predatory wildlife and raiders.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-combat-trained",
    "name": "Combat Trained",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Standard military drills covering marksmanship, close-quarters combat, and fireteam movement.",
    "description": "Standard military drills covering marksmanship, close-quarters combat, and fireteam movement.",
    "mechanics": "Standard military drills covering marksmanship, close-quarters combat, and fireteam movement.",
    "mechanic": "Standard military drills covering marksmanship, close-quarters combat, and fireteam movement.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Combat Trained\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nStandard military drills covering marksmanship, close-quarters combat, and fireteam movement.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-combat-training",
    "name": "Combat Training",
    "category": "traits",
    "trait_type": "Combat",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Extensive formal training in tactical firearms, CQB weapon drills, and battlefield maneuvering.",
    "description": "Extensive formal training in tactical firearms, CQB weapon drills, and battlefield maneuvering.",
    "mechanics": "Extensive formal training in tactical firearms, CQB weapon drills, and battlefield maneuvering.",
    "mechanic": "Extensive formal training in tactical firearms, CQB weapon drills, and battlefield maneuvering.",
    "rules": "Basic Combat (2 BP).",
    "special_rules": "Basic Combat (2 BP).",
    "modifiers": [],
    "body": "# Combat Training\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Combat\n**BP Cost**: 2\n\n## Description\nExtensive formal training in tactical firearms, CQB weapon drills, and battlefield maneuvering.",
    "notes": "[Rule] Basic Combat (2 BP).",
    "notesList": [
      "[Rule] Basic Combat (2 BP)."
    ]
  },
  {
    "id": "trait-communication",
    "name": "Communication",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Effective communicators, able to convey complex ideas and information clearly and persuasively.",
    "description": "Effective communicators, able to convey complex ideas and information clearly and persuasively.",
    "mechanics": "Effective communicators, able to convey complex ideas and information clearly and persuasively.",
    "mechanic": "Effective communicators, able to convey complex ideas and information clearly and persuasively.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Communication\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nEffective communicators, able to convey complex ideas and information clearly and persuasively.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-community-building",
    "name": "Community Building",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Values community solidarity and possesses skills in building and maintaining relationships among local groups.",
    "description": "Values community solidarity and possesses skills in building and maintaining relationships among local groups.",
    "mechanics": "Values community solidarity and possesses skills in building and maintaining relationships among local groups.",
    "mechanic": "Values community solidarity and possesses skills in building and maintaining relationships among local groups.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Community Building\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nValues community solidarity and possesses skills in building and maintaining relationships among local groups.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-confident",
    "name": "Confident",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Comfortable in the spotlight",
    "description": "Comfortable in the spotlight",
    "mechanics": "Comfortable in the spotlight",
    "mechanic": "Comfortable in the spotlight",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Confident\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nComfortable in the spotlight",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-conflict-resolution",
    "name": "Conflict resolution",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to resolve conflicts effectively and find solutions that satisfy all parties involved",
    "description": "Ability to resolve conflicts effectively and find solutions that satisfy all parties involved",
    "mechanics": "Ability to resolve conflicts effectively and find solutions that satisfy all parties involved",
    "mechanic": "Ability to resolve conflicts effectively and find solutions that satisfy all parties involved",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Conflict resolution\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to resolve conflicts effectively and find solutions that satisfy all parties involved",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-constriction",
    "name": "Constriction",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Grants Improved and Greater Grapple, Crushing damage is 2x Unarmed.",
    "description": "Grants Improved and Greater Grapple, Crushing damage is 2x Unarmed.",
    "mechanics": "Grants Improved and Greater Grapple, Crushing damage is 2x Unarmed.",
    "mechanic": "Grants Improved and Greater Grapple, Crushing damage is 2x Unarmed.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Constriction\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nGrants Improved and Greater Grapple, Crushing damage is 2x Unarmed.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-contacts",
    "name": "Contacts",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Extensive rolodex of street informants, corporate fixers, bar owners, and dockworkers.",
    "description": "Extensive rolodex of street informants, corporate fixers, bar owners, and dockworkers.",
    "mechanics": "Extensive rolodex of street informants, corporate fixers, bar owners, and dockworkers.",
    "mechanic": "Extensive rolodex of street informants, corporate fixers, bar owners, and dockworkers.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Contacts\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nExtensive rolodex of street informants, corporate fixers, bar owners, and dockworkers.",
    "notes": "[Rule] Basic Origin Trait (1 BP).\n[Prerequisite] Charisma 1",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP).",
      "[Prerequisite] Charisma 1"
    ]
  },
  {
    "id": "trait-continuous-learning",
    "name": "Continuous Learning",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Has a thirst for knowledge and is committed to lifelong learning.",
    "description": "Has a thirst for knowledge and is committed to lifelong learning.",
    "mechanics": "Has a thirst for knowledge and is committed to lifelong learning.",
    "mechanic": "Has a thirst for knowledge and is committed to lifelong learning.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Continuous Learning\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHas a thirst for knowledge and is committed to lifelong learning.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-cool",
    "name": "Cool",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to remain calm and focused even in high-pressure situations",
    "description": "Able to remain calm and focused even in high-pressure situations",
    "mechanics": "Able to remain calm and focused even in high-pressure situations",
    "mechanic": "Able to remain calm and focused even in high-pressure situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Cool\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to remain calm and focused even in high-pressure situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-craftsman",
    "name": "Craftsman",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 to Specific Vocation.",
    "description": "+2 to Specific Vocation.",
    "mechanics": "+2 to Specific Vocation.",
    "mechanic": "+2 to Specific Vocation.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Specific Vocation",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Specific Vocation"
      }
    ],
    "body": "# Craftsman\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 to Specific Vocation.",
    "notes": "[Modifier] +2 to Specific Vocation\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Specific Vocation",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-creative",
    "name": "Creative",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Skilled at coming up with new ideas",
    "description": "Skilled at coming up with new ideas",
    "mechanics": "Skilled at coming up with new ideas",
    "mechanic": "Skilled at coming up with new ideas",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Creative\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nSkilled at coming up with new ideas",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-creativity",
    "name": "Creativity",
    "category": "traits",
    "trait_type": "Mental",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ingenious problem solving and out-of-the-box thinking when crafting, engineering, or improvising solutions.",
    "description": "Ingenious problem solving and out-of-the-box thinking when crafting, engineering, or improvising solutions.",
    "mechanics": "Ingenious problem solving and out-of-the-box thinking when crafting, engineering, or improvising solutions.",
    "mechanic": "Ingenious problem solving and out-of-the-box thinking when crafting, engineering, or improvising solutions.",
    "rules": "Basic Mental (1 BP).",
    "special_rules": "Basic Mental (1 BP).",
    "modifiers": [],
    "body": "# Creativity\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Mental\n**BP Cost**: 1\n\n## Description\nIngenious problem solving and out-of-the-box thinking when crafting, engineering, or improvising solutions.",
    "notes": "[Rule] Basic Mental (1 BP).",
    "notesList": [
      "[Rule] Basic Mental (1 BP)."
    ]
  },
  {
    "id": "trait-critical-thinking",
    "name": "Critical thinking",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Possess strong critical thinking skills.",
    "description": "Possess strong critical thinking skills.",
    "mechanics": "Possess strong critical thinking skills.",
    "mechanic": "Possess strong critical thinking skills.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Critical thinking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nPossess strong critical thinking skills.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-cultural-awareness",
    "name": "Cultural Awareness",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants are culturally aware and sensitive. They understand different customs, traditions, and etiquette, allowing them to navigate diverse markets and build relationships with customers from various backgrounds.",
    "description": "Merchants are culturally aware and sensitive. They understand different customs, traditions, and etiquette, allowing them to navigate diverse markets and build relationships with customers from various backgrounds.",
    "mechanics": "Merchants are culturally aware and sensitive. They understand different customs, traditions, and etiquette, allowing them to navigate diverse markets and build relationships with customers from various backgrounds.",
    "mechanic": "Merchants are culturally aware and sensitive. They understand different customs, traditions, and etiquette, allowing them to navigate diverse markets and build relationships with customers from various backgrounds.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Cultural Awareness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants are culturally aware and sensitive. They understand different customs, traditions, and etiquette, allowing them to navigate diverse markets and build relationships with customers from various backgrounds.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-cunning",
    "name": "Cunning",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Rely on their wits and cunning to achieve their objectives, often using deception and misdirection to outsmart their enemies",
    "description": "Rely on their wits and cunning to achieve their objectives, often using deception and misdirection to outsmart their enemies",
    "mechanics": "Rely on their wits and cunning to achieve their objectives, often using deception and misdirection to outsmart their enemies",
    "mechanic": "Rely on their wits and cunning to achieve their objectives, often using deception and misdirection to outsmart their enemies",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Cunning\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nRely on their wits and cunning to achieve their objectives, often using deception and misdirection to outsmart their enemies",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-curiosity",
    "name": "Curiosity",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "An insatiable drive to explore the unknown, analyze anomalous phenomena, and investigate new discoveries.",
    "description": "An insatiable drive to explore the unknown, analyze anomalous phenomena, and investigate new discoveries.",
    "mechanics": "An insatiable drive to explore the unknown, analyze anomalous phenomena, and investigate new discoveries.",
    "mechanic": "An insatiable drive to explore the unknown, analyze anomalous phenomena, and investigate new discoveries.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Curiosity\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nAn insatiable drive to explore the unknown, analyze anomalous phenomena, and investigate new discoveries.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-dark-sight",
    "name": "Dark Sight",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Clear vision in all levels of Light or Darkness (UV, seeing luminescence).",
    "description": "Clear vision in all levels of Light or Darkness (UV, seeing luminescence).",
    "mechanics": "Clear vision in all levels of Light or Darkness (UV, seeing luminescence).",
    "mechanic": "Clear vision in all levels of Light or Darkness (UV, seeing luminescence).",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dark Sight\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nClear vision in all levels of Light or Darkness (UV, seeing luminescence).",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-deception",
    "name": "Deception",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Disguise, impersonation, and deception",
    "description": "Disguise, impersonation, and deception",
    "mechanics": "Disguise, impersonation, and deception",
    "mechanic": "Disguise, impersonation, and deception",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Deception\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nDisguise, impersonation, and deception",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-defensive-training",
    "name": "Defensive Training",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+2 dodge bonus to Defense.",
    "description": "+2 dodge bonus to Defense.",
    "mechanics": "+2 dodge bonus to Defense.",
    "mechanic": "+2 dodge bonus to Defense.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Defensive Training\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+2 dodge bonus to Defense.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-digitigrade-ungulated",
    "name": "Digitigrade / Ungulated",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+10 Movement Speed and +4 Stability, Special pants and Boots needed.",
    "description": "+10 Movement Speed and +4 Stability, Special pants and Boots needed.",
    "mechanics": "+10 Movement Speed and +4 Stability, Special pants and Boots needed.",
    "mechanic": "+10 Movement Speed and +4 Stability, Special pants and Boots needed.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "move-walk",
        "type": "combat",
        "value": 10,
        "mode": "inherent",
        "description": "+10 Movement"
      }
    ],
    "body": "# Digitigrade / Ungulated\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+10 Movement Speed and +4 Stability, Special pants and Boots needed.",
    "notes": "[Modifier] +10 Movement\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +10 Movement",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-diplomacy",
    "name": "Diplomacy",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Skill in negotiation, de-escalating tensions, and maintaining formal alliances.",
    "description": "Skill in negotiation, de-escalating tensions, and maintaining formal alliances.",
    "mechanics": "Skill in negotiation, de-escalating tensions, and maintaining formal alliances.",
    "mechanic": "Skill in negotiation, de-escalating tensions, and maintaining formal alliances.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Diplomacy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nSkill in negotiation, de-escalating tensions, and maintaining formal alliances.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-discipline",
    "name": "Discipline",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Disciplined and able to follow orders without question, even in high-pressure situations",
    "description": "Disciplined and able to follow orders without question, even in high-pressure situations",
    "mechanics": "Disciplined and able to follow orders without question, even in high-pressure situations",
    "mechanic": "Disciplined and able to follow orders without question, even in high-pressure situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Discipline\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nDisciplined and able to follow orders without question, even in high-pressure situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-disciplined",
    "name": "Disciplined",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Conditioned obedience to command structures and flawless execution of standard operating procedures.",
    "description": "Conditioned obedience to command structures and flawless execution of standard operating procedures.",
    "mechanics": "Conditioned obedience to command structures and flawless execution of standard operating procedures.",
    "mechanic": "Conditioned obedience to command structures and flawless execution of standard operating procedures.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Disciplined\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nConditioned obedience to command structures and flawless execution of standard operating procedures.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-draconic",
    "name": "Draconic",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Access to purchase various Dragon Traits",
    "description": "Access to purchase various Dragon Traits",
    "mechanics": "Access to purchase various Dragon Traits",
    "mechanic": "Access to purchase various Dragon Traits",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Draconic\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nAccess to purchase various Dragon Traits",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-dragon-apotheosis",
    "name": "Dragon Apotheosis",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Gain Type Specific Ability and access to Advanced Dragon Abilities. Req: Dragon Form.",
    "description": "Gain Type Specific Ability and access to Advanced Dragon Abilities. Req: Dragon Form.",
    "mechanics": "Gain Type Specific Ability and access to Advanced Dragon Abilities. Req: Dragon Form.",
    "mechanic": "Gain Type Specific Ability and access to Advanced Dragon Abilities. Req: Dragon Form.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Dragon Apotheosis\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nGain Type Specific Ability and access to Advanced Dragon Abilities. Req: Dragon Form.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-dragon-breath",
    "name": "Dragon Breath",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Breath Weapon - 30 ft Cone or 60 ft Line of Energy [Str x d8 in Dmg].",
    "description": "Breath Weapon - 30 ft Cone or 60 ft Line of Energy [Str x d8 in Dmg].",
    "mechanics": "Breath Weapon - 30 ft Cone or 60 ft Line of Energy [Str x d8 in Dmg].",
    "mechanic": "Breath Weapon - 30 ft Cone or 60 ft Line of Energy [Str x d8 in Dmg].",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Dragon Breath\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nBreath Weapon - 30 ft Cone or 60 ft Line of Energy [Str x d8 in Dmg].",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-dragon-eyes",
    "name": "Dragon Eyes",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Choose from Low-Light Vision line (Dark, Ether, Thermal). Multiple.",
    "description": "Choose from Low-Light Vision line (Dark, Ether, Thermal). Multiple.",
    "mechanics": "Choose from Low-Light Vision line (Dark, Ether, Thermal). Multiple.",
    "mechanic": "Choose from Low-Light Vision line (Dark, Ether, Thermal). Multiple.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dragon Eyes\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nChoose from Low-Light Vision line (Dark, Ether, Thermal). Multiple.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-dragon-form",
    "name": "Dragon Form",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Alternate Form of a Large size Dragon",
    "description": "Alternate Form of a Large size Dragon",
    "mechanics": "Alternate Form of a Large size Dragon",
    "mechanic": "Alternate Form of a Large size Dragon",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dragon Form\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAlternate Form of a Large size Dragon",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-dragon-might",
    "name": "Dragon Might",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Lift Objects and Grapple as if 1 size category larger. Req: Dragonkin, Str 4.",
    "description": "Lift Objects and Grapple as if 1 size category larger. Req: Dragonkin, Str 4.",
    "mechanics": "Lift Objects and Grapple as if 1 size category larger. Req: Dragonkin, Str 4.",
    "mechanic": "Lift Objects and Grapple as if 1 size category larger. Req: Dragonkin, Str 4.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dragon Might\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nLift Objects and Grapple as if 1 size category larger. Req: Dragonkin, Str 4.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-dragon-mind",
    "name": "Dragon Mind",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Make any Mental Resistance checks with Advantage. Req: Dragonkin, Wis 2.",
    "description": "Make any Mental Resistance checks with Advantage. Req: Dragonkin, Wis 2.",
    "mechanics": "Make any Mental Resistance checks with Advantage. Req: Dragonkin, Wis 2.",
    "mechanic": "Make any Mental Resistance checks with Advantage. Req: Dragonkin, Wis 2.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dragon Mind\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nMake any Mental Resistance checks with Advantage. Req: Dragonkin, Wis 2.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-dragon-senses",
    "name": "Dragon Senses",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Make Awareness Checks with Advantage. Req: Dragonkin, Awareness 11.",
    "description": "Make Awareness Checks with Advantage. Req: Dragonkin, Awareness 11.",
    "mechanics": "Make Awareness Checks with Advantage. Req: Dragonkin, Awareness 11.",
    "mechanic": "Make Awareness Checks with Advantage. Req: Dragonkin, Awareness 11.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Dragon Senses\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nMake Awareness Checks with Advantage. Req: Dragonkin, Awareness 11.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-dragon-wings",
    "name": "Dragon Wings",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Grow Leathery Wings - Fly Speed of 3x Ground Speed. Req: Dragonkin, Exoskeleton.",
    "description": "Grow Leathery Wings - Fly Speed of 3x Ground Speed. Req: Dragonkin, Exoskeleton.",
    "mechanics": "Grow Leathery Wings - Fly Speed of 3x Ground Speed. Req: Dragonkin, Exoskeleton.",
    "mechanic": "Grow Leathery Wings - Fly Speed of 3x Ground Speed. Req: Dragonkin, Exoskeleton.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Dragon Wings\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nGrow Leathery Wings - Fly Speed of 3x Ground Speed. Req: Dragonkin, Exoskeleton.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-emissary",
    "name": "Emissary",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Once per day make a check at advantage for Bluff or Diplomacy.",
    "description": "Once per day make a check at advantage for Bluff or Diplomacy.",
    "mechanics": "Once per day make a check at advantage for Bluff or Diplomacy.",
    "mechanic": "Once per day make a check at advantage for Bluff or Diplomacy.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Emissary\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nOnce per day make a check at advantage for Bluff or Diplomacy.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-emotional-intelligence",
    "name": "Emotional intelligence",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to understand and manage their own emotions effectively, and read the emotions of others and respond appropriately to different emotional states",
    "description": "Ability to understand and manage their own emotions effectively, and read the emotions of others and respond appropriately to different emotional states",
    "mechanics": "Ability to understand and manage their own emotions effectively, and read the emotions of others and respond appropriately to different emotional states",
    "mechanic": "Ability to understand and manage their own emotions effectively, and read the emotions of others and respond appropriately to different emotional states",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Emotional intelligence\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to understand and manage their own emotions effectively, and read the emotions of others and respond appropriately to different emotional states",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-empathy",
    "name": "Empathy",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Intuitive emotional resonance that perceives the underlying drives and moods of sapient beings and creatures.",
    "description": "Intuitive emotional resonance that perceives the underlying drives and moods of sapient beings and creatures.",
    "mechanics": "Intuitive emotional resonance that perceives the underlying drives and moods of sapient beings and creatures.",
    "mechanic": "Intuitive emotional resonance that perceives the underlying drives and moods of sapient beings and creatures.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Empathy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nIntuitive emotional resonance that perceives the underlying drives and moods of sapient beings and creatures.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-energetic",
    "name": "Energetic",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "High levels of energy and enthusiasm",
    "description": "High levels of energy and enthusiasm",
    "mechanics": "High levels of energy and enthusiasm",
    "mechanic": "High levels of energy and enthusiasm",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Energetic\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHigh levels of energy and enthusiasm",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-energized-breath",
    "name": "Energized Breath",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Focus energy into breath weapon to roll damage at advantage, 1/2 damage is magic.",
    "description": "Focus energy into breath weapon to roll damage at advantage, 1/2 damage is magic.",
    "mechanics": "Focus energy into breath weapon to roll damage at advantage, 1/2 damage is magic.",
    "mechanic": "Focus energy into breath weapon to roll damage at advantage, 1/2 damage is magic.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Energized Breath\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nFocus energy into breath weapon to roll damage at advantage, 1/2 damage is magic.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-energy-absorption",
    "name": "Energy Absorption",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Heals 20% of damage ignored. Ranked. Req: Energy Immunity.",
    "description": "Heals 20% of damage ignored. Ranked. Req: Energy Immunity.",
    "mechanics": "Heals 20% of damage ignored. Ranked. Req: Energy Immunity.",
    "mechanic": "Heals 20% of damage ignored. Ranked. Req: Energy Immunity.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Energy Absorption\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nHeals 20% of damage ignored. Ranked. Req: Energy Immunity.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-energy-immunity",
    "name": "Energy Immunity",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Completely Immune to specific Energy Damage. Req: Sta 2, DR 20 vs specific Energy.",
    "description": "Completely Immune to specific Energy Damage. Req: Sta 2, DR 20 vs specific Energy.",
    "mechanics": "Completely Immune to specific Energy Damage. Req: Sta 2, DR 20 vs specific Energy.",
    "mechanic": "Completely Immune to specific Energy Damage. Req: Sta 2, DR 20 vs specific Energy.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Energy Immunity\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nCompletely Immune to specific Energy Damage. Req: Sta 2, DR 20 vs specific Energy.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-energy-resist",
    "name": "Energy Resist",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "DR 10 vs Chosen Type (Pyro, Cryo, Sonic, Voltic, Corrosive). Multiple/Ranked.",
    "description": "DR 10 vs Chosen Type (Pyro, Cryo, Sonic, Voltic, Corrosive). Multiple/Ranked.",
    "mechanics": "DR 10 vs Chosen Type (Pyro, Cryo, Sonic, Voltic, Corrosive). Multiple/Ranked.",
    "mechanic": "DR 10 vs Chosen Type (Pyro, Cryo, Sonic, Voltic, Corrosive). Multiple/Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Energy Resist\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDR 10 vs Chosen Type (Pyro, Cryo, Sonic, Voltic, Corrosive). Multiple/Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-enhanced-abilities",
    "name": "Enhanced Abilities",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may be able to temporarily enhance their physical or mental abilities to go beyond what is considered normal for their species or race.",
    "description": "Adepts may be able to temporarily enhance their physical or mental abilities to go beyond what is considered normal for their species or race.",
    "mechanics": "Adepts may be able to temporarily enhance their physical or mental abilities to go beyond what is considered normal for their species or race.",
    "mechanic": "Adepts may be able to temporarily enhance their physical or mental abilities to go beyond what is considered normal for their species or race.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Enhanced Abilities\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may be able to temporarily enhance their physical or mental abilities to go beyond what is considered normal for their species or race.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-entertainment-skill",
    "name": "Entertainment Skill",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Talent in performance arts, music, athletics, gaming, or high-stakes social recreation.",
    "description": "Talent in performance arts, music, athletics, gaming, or high-stakes social recreation.",
    "mechanics": "Talent in performance arts, music, athletics, gaming, or high-stakes social recreation.",
    "mechanic": "Talent in performance arts, music, athletics, gaming, or high-stakes social recreation.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Entertainment Skill\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nTalent in performance arts, music, athletics, gaming, or high-stakes social recreation.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-environmental-awareness",
    "name": "Environmental Awareness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Attuned to ambient shifts in barometric pressure, water currents, temperature, and atmospheric toxicity.",
    "description": "Attuned to ambient shifts in barometric pressure, water currents, temperature, and atmospheric toxicity.",
    "mechanics": "Attuned to ambient shifts in barometric pressure, water currents, temperature, and atmospheric toxicity.",
    "mechanic": "Attuned to ambient shifts in barometric pressure, water currents, temperature, and atmospheric toxicity.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Environmental Awareness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nAttuned to ambient shifts in barometric pressure, water currents, temperature, and atmospheric toxicity.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-ether-sight",
    "name": "Ether Sight",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "See the Invisible, Phased (other-dimensional energies) and Bioluminescence Auras.",
    "description": "See the Invisible, Phased (other-dimensional energies) and Bioluminescence Auras.",
    "mechanics": "See the Invisible, Phased (other-dimensional energies) and Bioluminescence Auras.",
    "mechanic": "See the Invisible, Phased (other-dimensional energies) and Bioluminescence Auras.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Ether Sight\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nSee the Invisible, Phased (other-dimensional energies) and Bioluminescence Auras.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-ethical-awareness",
    "name": "Ethical awareness",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "May have a strong sense of ethics and corporate responsibility.",
    "description": "May have a strong sense of ethics and corporate responsibility.",
    "mechanics": "May have a strong sense of ethics and corporate responsibility.",
    "mechanic": "May have a strong sense of ethics and corporate responsibility.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Ethical awareness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMay have a strong sense of ethics and corporate responsibility.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-ethical-conduct",
    "name": "Ethical conduct",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adheres to ethical standards in research and work.",
    "description": "Adheres to ethical standards in research and work.",
    "mechanics": "Adheres to ethical standards in research and work.",
    "mechanic": "Adheres to ethical standards in research and work.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Ethical conduct\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdheres to ethical standards in research and work.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-exoskeleton-heavy",
    "name": "Exoskeleton (Heavy)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "DR (Strength +2) x4: Str 4, Obvious, Special Clothing - Heavy Plating or Shell.",
    "description": "DR (Strength +2) x4: Str 4, Obvious, Special Clothing - Heavy Plating or Shell.",
    "mechanics": "DR (Strength +2) x4: Str 4, Obvious, Special Clothing - Heavy Plating or Shell.",
    "mechanic": "DR (Strength +2) x4: Str 4, Obvious, Special Clothing - Heavy Plating or Shell.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Exoskeleton (Heavy)\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nDR (Strength +2) x4: Str 4, Obvious, Special Clothing - Heavy Plating or Shell.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-exoskeleton-light",
    "name": "Exoskeleton (Light)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "DR (Strength +2) x3: Str 3, Noticeable, Special Clothing - Heavy Scales or Plating.",
    "description": "DR (Strength +2) x3: Str 3, Noticeable, Special Clothing - Heavy Scales or Plating.",
    "mechanics": "DR (Strength +2) x3: Str 3, Noticeable, Special Clothing - Heavy Scales or Plating.",
    "mechanic": "DR (Strength +2) x3: Str 3, Noticeable, Special Clothing - Heavy Scales or Plating.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Exoskeleton (Light)\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDR (Strength +2) x3: Str 3, Noticeable, Special Clothing - Heavy Scales or Plating.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-exoskeleton-partial",
    "name": "Exoskeleton (Partial)",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "DR (Strength +2) x2: Str 2, Concealable - Leathery or Scaled.",
    "description": "DR (Strength +2) x2: Str 2, Concealable - Leathery or Scaled.",
    "mechanics": "DR (Strength +2) x2: Str 2, Concealable - Leathery or Scaled.",
    "mechanic": "DR (Strength +2) x2: Str 2, Concealable - Leathery or Scaled.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Exoskeleton (Partial)\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nDR (Strength +2) x2: Str 2, Concealable - Leathery or Scaled.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-expertise",
    "name": "Expertise",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "In-depth knowledge and experience in a particular area",
    "description": "In-depth knowledge and experience in a particular area",
    "mechanics": "In-depth knowledge and experience in a particular area",
    "mechanic": "In-depth knowledge and experience in a particular area",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Expertise\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nIn-depth knowledge and experience in a particular area",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-fans",
    "name": "Fans",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Has a loyal following of fans",
    "description": "Has a loyal following of fans",
    "mechanics": "Has a loyal following of fans",
    "mechanic": "Has a loyal following of fans",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Fans\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHas a loyal following of fans",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-fast-heal",
    "name": "Fast Heal",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Daily Recovery of Health and Vitality during a Light Rest (repeatable).",
    "description": "Daily Recovery of Health and Vitality during a Light Rest (repeatable).",
    "mechanics": "Daily Recovery of Health and Vitality during a Light Rest (repeatable).",
    "mechanic": "Daily Recovery of Health and Vitality during a Light Rest (repeatable).",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Fast Heal\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDaily Recovery of Health and Vitality during a Light Rest (repeatable).",
    "notes": "[Rule] Advanced Species Trait (2 BP).\n[Prerequisite] Stamina 2",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP).",
      "[Prerequisite] Stamina 2"
    ]
  },
  {
    "id": "trait-fearlessness",
    "name": "Fearlessness",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Seem fearless and willing to take risks in order to achieve their goals",
    "description": "Seem fearless and willing to take risks in order to achieve their goals",
    "mechanics": "Seem fearless and willing to take risks in order to achieve their goals",
    "mechanic": "Seem fearless and willing to take risks in order to achieve their goals",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Fearlessness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nSeem fearless and willing to take risks in order to achieve their goals",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-fellow-artists",
    "name": "Fellow Artists",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Has close relationships with other performers",
    "description": "Has close relationships with other performers",
    "mechanics": "Has close relationships with other performers",
    "mechanic": "Has close relationships with other performers",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Fellow Artists\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHas close relationships with other performers",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-fey-affinity",
    "name": "Fey Affinity",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Animals treat character as Trusting & Neutral, Friendly.",
    "description": "Animals treat character as Trusting & Neutral, Friendly.",
    "mechanics": "Animals treat character as Trusting & Neutral, Friendly.",
    "mechanic": "Animals treat character as Trusting & Neutral, Friendly.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Fey Affinity\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAnimals treat character as Trusting & Neutral, Friendly.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-fiend-affinity",
    "name": "Fiend Affinity",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Animals treat character as a Predator & Dangerous, Wary.",
    "description": "Animals treat character as a Predator & Dangerous, Wary.",
    "mechanics": "Animals treat character as a Predator & Dangerous, Wary.",
    "mechanic": "Animals treat character as a Predator & Dangerous, Wary.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Fiend Affinity\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAnimals treat character as a Predator & Dangerous, Wary.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-financial-expertise",
    "name": "Financial expertise",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Strong understanding of financial management, budgeting, and investment strategies.",
    "description": "Strong understanding of financial management, budgeting, and investment strategies.",
    "mechanics": "Strong understanding of financial management, budgeting, and investment strategies.",
    "mechanic": "Strong understanding of financial management, budgeting, and investment strategies.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Financial expertise\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nStrong understanding of financial management, budgeting, and investment strategies.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-flexibility",
    "name": "Flexibility",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to adapt to changing circumstances and adjust plans and strategies as needed",
    "description": "Ability to adapt to changing circumstances and adjust plans and strategies as needed",
    "mechanics": "Ability to adapt to changing circumstances and adjust plans and strategies as needed",
    "mechanic": "Ability to adapt to changing circumstances and adjust plans and strategies as needed",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Flexibility\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to adapt to changing circumstances and adjust plans and strategies as needed",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-flight",
    "name": "Flight",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Flight Speed of 2x Ground Speed and Average Maneuverability, uses Acrobatics skill.",
    "description": "Flight Speed of 2x Ground Speed and Average Maneuverability, uses Acrobatics skill.",
    "mechanics": "Flight Speed of 2x Ground Speed and Average Maneuverability, uses Acrobatics skill.",
    "mechanic": "Flight Speed of 2x Ground Speed and Average Maneuverability, uses Acrobatics skill.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Flight\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nFlight Speed of 2x Ground Speed and Average Maneuverability, uses Acrobatics skill.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-focused-study",
    "name": "Focused Study",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gain Skill Focus in a skill of their choice.",
    "description": "Gain Skill Focus in a skill of their choice.",
    "mechanics": "Gain Skill Focus in a skill of their choice.",
    "mechanic": "Gain Skill Focus in a skill of their choice.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Focused Study\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nGain Skill Focus in a skill of their choice.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-freedom",
    "name": "Freedom",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Values independence and self-expression",
    "description": "Values independence and self-expression",
    "mechanics": "Values independence and self-expression",
    "mechanic": "Values independence and self-expression",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Freedom\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nValues independence and self-expression",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-frenzy",
    "name": "Frenzy",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).",
    "description": "1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).",
    "mechanics": "1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).",
    "mechanic": "1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Frenzy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n1/day, whenever taking damage, fly into frenzy for 1 min (+2 Con/Str, –2 AC).",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-fun",
    "name": "Fun",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Values having a good time and making others happy",
    "description": "Values having a good time and making others happy",
    "mechanics": "Values having a good time and making others happy",
    "mechanic": "Values having a good time and making others happy",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Fun\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nValues having a good time and making others happy",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-gifted-linguist",
    "name": "Gifted Linguist",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+4 racial bonus on Linguistics checks.",
    "description": "+4 racial bonus on Linguistics checks.",
    "mechanics": "+4 racial bonus on Linguistics checks.",
    "mechanic": "+4 racial bonus on Linguistics checks.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Gifted Linguist\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+4 racial bonus on Linguistics checks.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-greedy-eye",
    "name": "Greedy Eye",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+4 bonus on all Appraise checks.",
    "description": "+4 bonus on all Appraise checks.",
    "mechanics": "+4 bonus on all Appraise checks.",
    "mechanic": "+4 bonus on all Appraise checks.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Appraise",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Appraise"
      }
    ],
    "body": "# Greedy Eye\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+4 bonus on all Appraise checks.",
    "notes": "[Modifier] +4 to Appraise\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +4 to Appraise",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-green-thumb",
    "name": "Green Thumb",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Natural talent for nurturing plants and making them thrive even in harsh soil.",
    "description": "Natural talent for nurturing plants and making them thrive even in harsh soil.",
    "mechanics": "Natural talent for nurturing plants and making them thrive even in harsh soil.",
    "mechanic": "Natural talent for nurturing plants and making them thrive even in harsh soil.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Green Thumb\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nNatural talent for nurturing plants and making them thrive even in harsh soil.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-guile",
    "name": "Guile",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Good at devising clever solutions",
    "description": "Good at devising clever solutions",
    "mechanics": "Good at devising clever solutions",
    "mechanic": "Good at devising clever solutions",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Guile\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nGood at devising clever solutions",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-hacking",
    "name": "Hacking",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Experience with hacking into computer systems and stealing information",
    "description": "Experience with hacking into computer systems and stealing information",
    "mechanics": "Experience with hacking into computer systems and stealing information",
    "mechanic": "Experience with hacking into computer systems and stealing information",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Hacking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nExperience with hacking into computer systems and stealing information",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-hardy",
    "name": "Hardy",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 racial bonus on saving throws against poison, spells, and spell-like abilities.",
    "description": "+2 racial bonus on saving throws against poison, spells, and spell-like abilities.",
    "mechanics": "+2 racial bonus on saving throws against poison, spells, and spell-like abilities.",
    "mechanic": "+2 racial bonus on saving throws against poison, spells, and spell-like abilities.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Hardy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 racial bonus on saving throws against poison, spells, and spell-like abilities.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-healthy",
    "name": "Healthy",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+4 bonus on Fortitude saves against disease and poison",
    "description": "+4 bonus on Fortitude saves against disease and poison",
    "mechanics": "+4 bonus on Fortitude saves against disease and poison",
    "mechanic": "+4 bonus on Fortitude saves against disease and poison",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Fortitude",
        "type": "save",
        "value": 4,
        "mode": "inherent",
        "description": "+4 on Fortitude Checks"
      }
    ],
    "body": "# Healthy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+4 bonus on Fortitude saves against disease and poison",
    "notes": "[Modifier] +4 on Fortitude Checks\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +4 on Fortitude Checks",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-heightened-senses",
    "name": "Heightened Senses",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may have enhanced senses, allowing them to perceive the world in ways that others cannot. This could include heightened vision, hearing, smell, or even the ability to sense energy or auras.",
    "description": "Adepts may have enhanced senses, allowing them to perceive the world in ways that others cannot. This could include heightened vision, hearing, smell, or even the ability to sense energy or auras.",
    "mechanics": "Adepts may have enhanced senses, allowing them to perceive the world in ways that others cannot. This could include heightened vision, hearing, smell, or even the ability to sense energy or auras.",
    "mechanic": "Adepts may have enhanced senses, allowing them to perceive the world in ways that others cannot. This could include heightened vision, hearing, smell, or even the ability to sense energy or auras.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Heightened Senses\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may have enhanced senses, allowing them to perceive the world in ways that others cannot. This could include heightened vision, hearing, smell, or even the ability to sense energy or auras.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-hexapedal",
    "name": "Hexapedal",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Six legged, +8 Stability, +20 movement speed. Special Accommodations.",
    "description": "Six legged, +8 Stability, +20 movement speed. Special Accommodations.",
    "mechanics": "Six legged, +8 Stability, +20 movement speed. Special Accommodations.",
    "mechanic": "Six legged, +8 Stability, +20 movement speed. Special Accommodations.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [
      {
        "target": "move-walk",
        "type": "combat",
        "value": 20,
        "mode": "inherent",
        "description": "+20 movement"
      }
    ],
    "body": "# Hexapedal\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nSix legged, +8 Stability, +20 movement speed. Special Accommodations.",
    "notes": "[Modifier] +20 movement\n[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Modifier] +20 movement",
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-high-pay",
    "name": "High Pay",
    "category": "traits",
    "trait_type": "Common Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Higher compensation and retainer fees for elite vocational service.",
    "description": "Higher compensation and retainer fees for elite vocational service.",
    "mechanics": "Higher compensation and retainer fees for elite vocational service.",
    "mechanic": "Higher compensation and retainer fees for elite vocational service.",
    "rules": "Basic Common Occupational Trait (1 BP).",
    "special_rules": "Basic Common Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# High Pay\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Common Occupational Trait\n**BP Cost**: 1\n\n## Description\nHigher compensation and retainer fees for elite vocational service.",
    "notes": "[Rule] Basic Common Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Common Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-high-social-standing",
    "name": "High social standing",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Often have a high social standing, which grants them access to better resources, connections, and opportunities.",
    "description": "Often have a high social standing, which grants them access to better resources, connections, and opportunities.",
    "mechanics": "Often have a high social standing, which grants them access to better resources, connections, and opportunities.",
    "mechanic": "Often have a high social standing, which grants them access to better resources, connections, and opportunities.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# High social standing\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nOften have a high social standing, which grants them access to better resources, connections, and opportunities.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-hive-connection",
    "name": "Hive Connection",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Allows members to mentally share information on different levels (Special).",
    "description": "Allows members to mentally share information on different levels (Special).",
    "mechanics": "Allows members to mentally share information on different levels (Special).",
    "mechanic": "Allows members to mentally share information on different levels (Special).",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Hive Connection\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAllows members to mentally share information on different levels (Special).",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-honor-bound",
    "name": "Honor-Bound",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Devotion to comrades and code of duty; willing to endure hardship for the unit.",
    "description": "Devotion to comrades and code of duty; willing to endure hardship for the unit.",
    "mechanics": "Devotion to comrades and code of duty; willing to endure hardship for the unit.",
    "mechanic": "Devotion to comrades and code of duty; willing to endure hardship for the unit.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Honor-Bound\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nDevotion to comrades and code of duty; willing to endure hardship for the unit.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-immortal",
    "name": "Immortal",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Cannot die of Natural Causes, nor suffer damage from Poisons/Diseases. Req: Ageless.",
    "description": "Cannot die of Natural Causes, nor suffer damage from Poisons/Diseases. Req: Ageless.",
    "mechanics": "Cannot die of Natural Causes, nor suffer damage from Poisons/Diseases. Req: Ageless.",
    "mechanic": "Cannot die of Natural Causes, nor suffer damage from Poisons/Diseases. Req: Ageless.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Immortal\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nCannot die of Natural Causes, nor suffer damage from Poisons/Diseases. Req: Ageless.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-independence",
    "name": "Independence",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Self-reliant problem solving in the cold vacuum where help is light-years away.",
    "description": "Self-reliant problem solving in the cold vacuum where help is light-years away.",
    "mechanics": "Self-reliant problem solving in the cold vacuum where help is light-years away.",
    "mechanic": "Self-reliant problem solving in the cold vacuum where help is light-years away.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Independence\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nSelf-reliant problem solving in the cold vacuum where help is light-years away.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-integrated",
    "name": "Integrated",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+1 bonus on Bluff, Disguise, and Knowledge (local) checks.",
    "description": "+1 bonus on Bluff, Disguise, and Knowledge (local) checks.",
    "mechanics": "+1 bonus on Bluff, Disguise, and Knowledge (local) checks.",
    "mechanic": "+1 bonus on Bluff, Disguise, and Knowledge (local) checks.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Bluff",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Bluff"
      }
    ],
    "body": "# Integrated\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+1 bonus on Bluff, Disguise, and Knowledge (local) checks.",
    "notes": "[Modifier] +1 to Bluff\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +1 to Bluff",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-integrity",
    "name": "Integrity",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Honest and trustworthy, able to maintain a high level of integrity in their work",
    "description": "Honest and trustworthy, able to maintain a high level of integrity in their work",
    "mechanics": "Honest and trustworthy, able to maintain a high level of integrity in their work",
    "mechanic": "Honest and trustworthy, able to maintain a high level of integrity in their work",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Integrity\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHonest and trustworthy, able to maintain a high level of integrity in their work",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-intellectualism",
    "name": "Intellectualism",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Formal academic pedagogy and comprehensive theoretical mastery in advanced sciences.",
    "description": "Formal academic pedagogy and comprehensive theoretical mastery in advanced sciences.",
    "mechanics": "Formal academic pedagogy and comprehensive theoretical mastery in advanced sciences.",
    "mechanic": "Formal academic pedagogy and comprehensive theoretical mastery in advanced sciences.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Intellectualism\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nFormal academic pedagogy and comprehensive theoretical mastery in advanced sciences.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-intuition",
    "name": "Intuition",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "A preternatural sixth sense for impending ambushes, environmental collapses, and traps.",
    "description": "A preternatural sixth sense for impending ambushes, environmental collapses, and traps.",
    "mechanics": "A preternatural sixth sense for impending ambushes, environmental collapses, and traps.",
    "mechanic": "A preternatural sixth sense for impending ambushes, environmental collapses, and traps.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Intuition\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nA preternatural sixth sense for impending ambushes, environmental collapses, and traps.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-investigation",
    "name": "Investigation",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gathering information, analyzing data, and conducting surveillance",
    "description": "Gathering information, analyzing data, and conducting surveillance",
    "mechanics": "Gathering information, analyzing data, and conducting surveillance",
    "mechanic": "Gathering information, analyzing data, and conducting surveillance",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Investigation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nGathering information, analyzing data, and conducting surveillance",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-jack-of-all-trades",
    "name": "Jack-of-All-Trades",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Possess a wide range of skills and knowledge, allowing them to adapt to various situations and fill multiple roles within a group",
    "description": "Possess a wide range of skills and knowledge, allowing them to adapt to various situations and fill multiple roles within a group",
    "mechanics": "Possess a wide range of skills and knowledge, allowing them to adapt to various situations and fill multiple roles within a group",
    "mechanic": "Possess a wide range of skills and knowledge, allowing them to adapt to various situations and fill multiple roles within a group",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Jack-of-All-Trades\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nPossess a wide range of skills and knowledge, allowing them to adapt to various situations and fill multiple roles within a group",
    "notes": "[Rule] Basic Occupational Trait (1 BP).\n[Prerequisite] Intellect 2",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP).",
      "[Prerequisite] Intellect 2"
    ]
  },
  {
    "id": "trait-keen-observation",
    "name": "Keen Observation",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Scouts have a keen eye and sharp mind, allowing them to solve mysteries, observe new species, and recognize important details in their surroundings.",
    "description": "Scouts have a keen eye and sharp mind, allowing them to solve mysteries, observe new species, and recognize important details in their surroundings.",
    "mechanics": "Scouts have a keen eye and sharp mind, allowing them to solve mysteries, observe new species, and recognize important details in their surroundings.",
    "mechanic": "Scouts have a keen eye and sharp mind, allowing them to solve mysteries, observe new species, and recognize important details in their surroundings.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Keen Observation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nScouts have a keen eye and sharp mind, allowing them to solve mysteries, observe new species, and recognize important details in their surroundings.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-languages",
    "name": "Languages",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Fluency in multiple languages",
    "description": "Fluency in multiple languages",
    "mechanics": "Fluency in multiple languages",
    "mechanic": "Fluency in multiple languages",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Languages\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nFluency in multiple languages",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-leadership",
    "name": "Leadership",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Inspirational command presence that organizes groups and rallies morale.",
    "description": "Inspirational command presence that organizes groups and rallies morale.",
    "mechanics": "Inspirational command presence that organizes groups and rallies morale.",
    "mechanic": "Inspirational command presence that organizes groups and rallies morale.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Leadership\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nInspirational command presence that organizes groups and rallies morale.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-lifestyle-preferences",
    "name": "Lifestyle Preferences",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Refined aesthetic tastes and familiarity with high-society etiquette and luxury commerce.",
    "description": "Refined aesthetic tastes and familiarity with high-society etiquette and luxury commerce.",
    "mechanics": "Refined aesthetic tastes and familiarity with high-society etiquette and luxury commerce.",
    "mechanic": "Refined aesthetic tastes and familiarity with high-society etiquette and luxury commerce.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Lifestyle Preferences\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nRefined aesthetic tastes and familiarity with high-society etiquette and luxury commerce.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-linguistics",
    "name": "Linguistics",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants often possess linguistic skills, enabling them to communicate with customers and suppliers who speak different languages. This skill can help them expand their reach and negotiate better deals.",
    "description": "Merchants often possess linguistic skills, enabling them to communicate with customers and suppliers who speak different languages. This skill can help them expand their reach and negotiate better deals.",
    "mechanics": "Merchants often possess linguistic skills, enabling them to communicate with customers and suppliers who speak different languages. This skill can help them expand their reach and negotiate better deals.",
    "mechanic": "Merchants often possess linguistic skills, enabling them to communicate with customers and suppliers who speak different languages. This skill can help them expand their reach and negotiate better deals.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Linguistics\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants often possess linguistic skills, enabling them to communicate with customers and suppliers who speak different languages. This skill can help them expand their reach and negotiate better deals.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-logistics",
    "name": "Logistics",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants have a strong understanding of logistics and supply chain management. They can efficiently transport goods, manage inventory, and optimize distribution to maximize efficiency and minimize costs.",
    "description": "Merchants have a strong understanding of logistics and supply chain management. They can efficiently transport goods, manage inventory, and optimize distribution to maximize efficiency and minimize costs.",
    "mechanics": "Merchants have a strong understanding of logistics and supply chain management. They can efficiently transport goods, manage inventory, and optimize distribution to maximize efficiency and minimize costs.",
    "mechanic": "Merchants have a strong understanding of logistics and supply chain management. They can efficiently transport goods, manage inventory, and optimize distribution to maximize efficiency and minimize costs.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Logistics\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants have a strong understanding of logistics and supply chain management. They can efficiently transport goods, manage inventory, and optimize distribution to maximize efficiency and minimize costs.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-longevity",
    "name": "Longevity",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Effectively doubles age categories.",
    "description": "Effectively doubles age categories.",
    "mechanics": "Effectively doubles age categories.",
    "mechanic": "Effectively doubles age categories.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Longevity\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nEffectively doubles age categories.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-low-light-vision",
    "name": "Low Light Vision",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "See twice as well in low light, Improved Spectrum Vision (lower IR and UV).",
    "description": "See twice as well in low light, Improved Spectrum Vision (lower IR and UV).",
    "mechanics": "See twice as well in low light, Improved Spectrum Vision (lower IR and UV).",
    "mechanic": "See twice as well in low light, Improved Spectrum Vision (lower IR and UV).",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Low Light Vision\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nSee twice as well in low light, Improved Spectrum Vision (lower IR and UV).",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-loyal",
    "name": "Loyal",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Unwavering commitment that rejects subversion, psychological coercion, and bribery.",
    "description": "Unwavering commitment that rejects subversion, psychological coercion, and bribery.",
    "mechanics": "Unwavering commitment that rejects subversion, psychological coercion, and bribery.",
    "mechanic": "Unwavering commitment that rejects subversion, psychological coercion, and bribery.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Loyal\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nUnwavering commitment that rejects subversion, psychological coercion, and bribery.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-loyalty",
    "name": "Loyalty",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "While they may appear to be loners, drifters/vagabonds can develop strong bonds of loyalty with a select few individuals or groups",
    "description": "While they may appear to be loners, drifters/vagabonds can develop strong bonds of loyalty with a select few individuals or groups",
    "mechanics": "While they may appear to be loners, drifters/vagabonds can develop strong bonds of loyalty with a select few individuals or groups",
    "mechanic": "While they may appear to be loners, drifters/vagabonds can develop strong bonds of loyalty with a select few individuals or groups",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Loyalty\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nWhile they may appear to be loners, drifters/vagabonds can develop strong bonds of loyalty with a select few individuals or groups",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-lucky-greater",
    "name": "Lucky, Greater",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+2 racial bonus on all saving throws.",
    "description": "+2 racial bonus on all saving throws.",
    "mechanics": "+2 racial bonus on all saving throws.",
    "mechanic": "+2 racial bonus on all saving throws.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Lucky, Greater\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+2 racial bonus on all saving throws.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-lucky-lesser",
    "name": "Lucky, Lesser",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+1 racial bonus on all saving throws.",
    "description": "+1 racial bonus on all saving throws.",
    "mechanics": "+1 racial bonus on all saving throws.",
    "mechanic": "+1 racial bonus on all saving throws.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Lucky, Lesser\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+1 racial bonus on all saving throws.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-machine-affinity",
    "name": "Machine Affinity",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Natural aptitude for working with machinery and tools",
    "description": "Natural aptitude for working with machinery and tools",
    "mechanics": "Natural aptitude for working with machinery and tools",
    "mechanic": "Natural aptitude for working with machinery and tools",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Machine Affinity\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nNatural aptitude for working with machinery and tools",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-management",
    "name": "Management",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Skill in organizing resort logistics, hospitality staff, entertainment venues, and guest services.",
    "description": "Skill in organizing resort logistics, hospitality staff, entertainment venues, and guest services.",
    "mechanics": "Skill in organizing resort logistics, hospitality staff, entertainment venues, and guest services.",
    "mechanic": "Skill in organizing resort logistics, hospitality staff, entertainment venues, and guest services.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Management\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nSkill in organizing resort logistics, hospitality staff, entertainment venues, and guest services.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-martial-arts-mastery",
    "name": "Martial Arts Mastery",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Many adepts are highly skilled in martial arts, using their physical prowess and combat techniques to overcome opponents. They may have trained in various styles and have a deep understanding of the body's mechanics.",
    "description": "Many adepts are highly skilled in martial arts, using their physical prowess and combat techniques to overcome opponents. They may have trained in various styles and have a deep understanding of the body's mechanics.",
    "mechanics": "Many adepts are highly skilled in martial arts, using their physical prowess and combat techniques to overcome opponents. They may have trained in various styles and have a deep understanding of the body's mechanics.",
    "mechanic": "Many adepts are highly skilled in martial arts, using their physical prowess and combat techniques to overcome opponents. They may have trained in various styles and have a deep understanding of the body's mechanics.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Martial Arts Mastery\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMany adepts are highly skilled in martial arts, using their physical prowess and combat techniques to overcome opponents. They may have trained in various styles and have a deep understanding of the body's mechanics.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-master-tinker",
    "name": "Master Tinker",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+2 bonus on Disable Device and Engineering.",
    "description": "+2 bonus on Disable Device and Engineering.",
    "mechanics": "+2 bonus on Disable Device and Engineering.",
    "mechanic": "+2 bonus on Disable Device and Engineering.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [
      {
        "target": "Disable Device",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Disable Device"
      },
      {
        "target": "Engineering",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Engineering"
      }
    ],
    "body": "# Master Tinker\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+2 bonus on Disable Device and Engineering.",
    "notes": "[Modifier] +2 to Disable Device\n[Modifier] +2 to Engineering\n[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Modifier] +2 to Disable Device",
      "[Modifier] +2 to Engineering",
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-mastery-of-a-discipline",
    "name": "Mastery of a Discipline",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may specialize in a specific discipline or school of thought. They have honed their abilities within this discipline and can utilize them more effectively.",
    "description": "Adepts may specialize in a specific discipline or school of thought. They have honed their abilities within this discipline and can utilize them more effectively.",
    "mechanics": "Adepts may specialize in a specific discipline or school of thought. They have honed their abilities within this discipline and can utilize them more effectively.",
    "mechanic": "Adepts may specialize in a specific discipline or school of thought. They have honed their abilities within this discipline and can utilize them more effectively.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Mastery of a Discipline\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may specialize in a specific discipline or school of thought. They have honed their abilities within this discipline and can utilize them more effectively.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mecha-physics",
    "name": "Mecha-Physics",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Comprehensive understanding of physics",
    "description": "Comprehensive understanding of physics",
    "mechanics": "Comprehensive understanding of physics",
    "mechanic": "Comprehensive understanding of physics",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Mecha-Physics\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nComprehensive understanding of physics",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mechanical-aptitude",
    "name": "Mechanical Aptitude",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Innate comprehension of heavy machinery, hydraulics, conveyor grids, and turbines.",
    "description": "Innate comprehension of heavy machinery, hydraulics, conveyor grids, and turbines.",
    "mechanics": "Innate comprehension of heavy machinery, hydraulics, conveyor grids, and turbines.",
    "mechanic": "Innate comprehension of heavy machinery, hydraulics, conveyor grids, and turbines.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Mechanical Aptitude\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nInnate comprehension of heavy machinery, hydraulics, conveyor grids, and turbines.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mental-resilience",
    "name": "Mental Resilience",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Withstand psychological challenges",
    "description": "Withstand psychological challenges",
    "mechanics": "Withstand psychological challenges",
    "mechanic": "Withstand psychological challenges",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Mental Resilience\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nWithstand psychological challenges",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mental-toughness",
    "name": "Mental Toughness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Psychological resilience against isolation, sensory deprivation, fear, and pain.",
    "description": "Psychological resilience against isolation, sensory deprivation, fear, and pain.",
    "mechanics": "Psychological resilience against isolation, sensory deprivation, fear, and pain.",
    "mechanic": "Psychological resilience against isolation, sensory deprivation, fear, and pain.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Mental Toughness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPsychological resilience against isolation, sensory deprivation, fear, and pain.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mentorship",
    "name": "Mentorship",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Patient pedagogical wisdom that accelerates the learning and focus of pupils and companions.",
    "description": "Patient pedagogical wisdom that accelerates the learning and focus of pupils and companions.",
    "mechanics": "Patient pedagogical wisdom that accelerates the learning and focus of pupils and companions.",
    "mechanic": "Patient pedagogical wisdom that accelerates the learning and focus of pupils and companions.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Mentorship\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPatient pedagogical wisdom that accelerates the learning and focus of pupils and companions.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-metacognition",
    "name": "Metacognition",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Aware of own cognitive abilities and strategies.",
    "description": "Aware of own cognitive abilities and strategies.",
    "mechanics": "Aware of own cognitive abilities and strategies.",
    "mechanic": "Aware of own cognitive abilities and strategies.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Metacognition\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAware of own cognitive abilities and strategies.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-milspec-gear",
    "name": "Milspec Gear",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Issued military-grade armor, sidearms, and tactical field gear.",
    "description": "Issued military-grade armor, sidearms, and tactical field gear.",
    "mechanics": "Issued military-grade armor, sidearms, and tactical field gear.",
    "mechanic": "Issued military-grade armor, sidearms, and tactical field gear.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Milspec Gear\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nIssued military-grade armor, sidearms, and tactical field gear.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-mind-speech",
    "name": "Mind Speech",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Telepathic Communication to one subject within 500 ft. Ranked.",
    "description": "Telepathic Communication to one subject within 500 ft. Ranked.",
    "mechanics": "Telepathic Communication to one subject within 500 ft. Ranked.",
    "mechanic": "Telepathic Communication to one subject within 500 ft. Ranked.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Mind Speech\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nTelepathic Communication to one subject within 500 ft. Ranked.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-mobility",
    "name": "Mobility",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Often on the move, traveling from place to place and exploring new territories",
    "description": "Often on the move, traveling from place to place and exploring new territories",
    "mechanics": "Often on the move, traveling from place to place and exploring new territories",
    "mechanic": "Often on the move, traveling from place to place and exploring new territories",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 4,
        "mode": "inherent",
        "description": "+4 defense"
      }
    ],
    "body": "# Mobility\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nOften on the move, traveling from place to place and exploring new territories",
    "notes": "[Modifier] +4 defense\n[Rule] Basic Occupational Trait (1 BP).\n[Prerequisite] Agi 2, Dodge",
    "notesList": [
      "[Modifier] +4 defense",
      "[Rule] Basic Occupational Trait (1 BP).",
      "[Prerequisite] Agi 2, Dodge"
    ]
  },
  {
    "id": "trait-mystical-or-spiritual-connection",
    "name": "Mystical or Spiritual Connection",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may have a deep connection to mystical or spiritual forces. They may draw power from these sources having a heightened awareness of the unseen world.",
    "description": "Adepts may have a deep connection to mystical or spiritual forces. They may draw power from these sources having a heightened awareness of the unseen world.",
    "mechanics": "Adepts may have a deep connection to mystical or spiritual forces. They may draw power from these sources having a heightened awareness of the unseen world.",
    "mechanic": "Adepts may have a deep connection to mystical or spiritual forces. They may draw power from these sources having a heightened awareness of the unseen world.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Mystical or Spiritual Connection\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may have a deep connection to mystical or spiritual forces. They may draw power from these sources having a heightened awareness of the unseen world.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-natural-armor",
    "name": "Natural Armor",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 natural armor bonus.",
    "description": "+2 natural armor bonus.",
    "mechanics": "+2 natural armor bonus.",
    "mechanic": "+2 natural armor bonus.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Natural Armor\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 natural armor bonus.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-natural-weapons",
    "name": "Natural Weapons",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "A Claw, Fang, Horn or other attack form.",
    "description": "A Claw, Fang, Horn or other attack form.",
    "mechanics": "A Claw, Fang, Horn or other attack form.",
    "mechanic": "A Claw, Fang, Horn or other attack form.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Natural Weapons\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nA Claw, Fang, Horn or other attack form.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-navigation",
    "name": "Navigation",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Scouts have excellent navigational skills, both in space and on planetary surfaces. They can plot courses, read maps, and use navigational tools effectively.",
    "description": "Scouts have excellent navigational skills, both in space and on planetary surfaces. They can plot courses, read maps, and use navigational tools effectively.",
    "mechanics": "Scouts have excellent navigational skills, both in space and on planetary surfaces. They can plot courses, read maps, and use navigational tools effectively.",
    "mechanic": "Scouts have excellent navigational skills, both in space and on planetary surfaces. They can plot courses, read maps, and use navigational tools effectively.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Navigation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nScouts have excellent navigational skills, both in space and on planetary surfaces. They can plot courses, read maps, and use navigational tools effectively.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-negotiation",
    "name": "Negotiation",
    "category": "traits",
    "trait_type": "Social",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adept at bargaining, contract dispute resolution, diplomacy, and finding mutually agreeable compromise.",
    "description": "Adept at bargaining, contract dispute resolution, diplomacy, and finding mutually agreeable compromise.",
    "mechanics": "Adept at bargaining, contract dispute resolution, diplomacy, and finding mutually agreeable compromise.",
    "mechanic": "Adept at bargaining, contract dispute resolution, diplomacy, and finding mutually agreeable compromise.",
    "rules": "Basic Social (1 BP).",
    "special_rules": "Basic Social (1 BP).",
    "modifiers": [],
    "body": "# Negotiation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Social\n**BP Cost**: 1\n\n## Description\nAdept at bargaining, contract dispute resolution, diplomacy, and finding mutually agreeable compromise.",
    "notes": "[Rule] Basic Social (1 BP).",
    "notesList": [
      "[Rule] Basic Social (1 BP)."
    ]
  },
  {
    "id": "trait-networking",
    "name": "Networking",
    "category": "traits",
    "trait_type": "Social",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "A wide network of professional and informal contacts across industries, syndicates, and governments for information and resource gathering.",
    "description": "A wide network of professional and informal contacts across industries, syndicates, and governments for information and resource gathering.",
    "mechanics": "A wide network of professional and informal contacts across industries, syndicates, and governments for information and resource gathering.",
    "mechanic": "A wide network of professional and informal contacts across industries, syndicates, and governments for information and resource gathering.",
    "rules": "Basic Social (2 BP).",
    "special_rules": "Basic Social (2 BP).",
    "modifiers": [],
    "body": "# Networking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Social\n**BP Cost**: 2\n\n## Description\nA wide network of professional and informal contacts across industries, syndicates, and governments for information and resource gathering.",
    "notes": "[Rule] Basic Social (2 BP).",
    "notesList": [
      "[Rule] Basic Social (2 BP)."
    ]
  },
  {
    "id": "trait-nimble-appendages",
    "name": "Nimble Appendages",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Usable as ‘main-hand’ with no penalties. Req: Additional Limbs/Tail.",
    "description": "Usable as ‘main-hand’ with no penalties. Req: Additional Limbs/Tail.",
    "mechanics": "Usable as ‘main-hand’ with no penalties. Req: Additional Limbs/Tail.",
    "mechanic": "Usable as ‘main-hand’ with no penalties. Req: Additional Limbs/Tail.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Nimble Appendages\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nUsable as ‘main-hand’ with no penalties. Req: Additional Limbs/Tail.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-non-combat-focus",
    "name": "Non-Combat Focus",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Concentrated mastery in civic vocations, gourmet culinary arts, or fine craftsmanship.",
    "description": "Concentrated mastery in civic vocations, gourmet culinary arts, or fine craftsmanship.",
    "mechanics": "Concentrated mastery in civic vocations, gourmet culinary arts, or fine craftsmanship.",
    "mechanic": "Concentrated mastery in civic vocations, gourmet culinary arts, or fine craftsmanship.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Non-Combat Focus\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nConcentrated mastery in civic vocations, gourmet culinary arts, or fine craftsmanship.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-non-living",
    "name": "Non-Living",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Undead, Elementals and others not classified as Living by normal standards.",
    "description": "Undead, Elementals and others not classified as Living by normal standards.",
    "mechanics": "Undead, Elementals and others not classified as Living by normal standards.",
    "mechanic": "Undead, Elementals and others not classified as Living by normal standards.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Non-Living\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nUndead, Elementals and others not classified as Living by normal standards.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-observant",
    "name": "Observant",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Alert and observant, constantly scanning the area for potential threats",
    "description": "Alert and observant, constantly scanning the area for potential threats",
    "mechanics": "Alert and observant, constantly scanning the area for potential threats",
    "mechanic": "Alert and observant, constantly scanning the area for potential threats",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Observant\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAlert and observant, constantly scanning the area for potential threats",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-open-mindedness",
    "name": "Open-Mindedness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Philosophical tolerance that bridges deep cultural, religious, and alien divides.",
    "description": "Philosophical tolerance that bridges deep cultural, religious, and alien divides.",
    "mechanics": "Philosophical tolerance that bridges deep cultural, religious, and alien divides.",
    "mechanic": "Philosophical tolerance that bridges deep cultural, religious, and alien divides.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Open-Mindedness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPhilosophical tolerance that bridges deep cultural, religious, and alien divides.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-optimistic",
    "name": "Optimistic",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "An unshakeable positive demeanor that inspires resilience in bleak moments.",
    "description": "An unshakeable positive demeanor that inspires resilience in bleak moments.",
    "mechanics": "An unshakeable positive demeanor that inspires resilience in bleak moments.",
    "mechanic": "An unshakeable positive demeanor that inspires resilience in bleak moments.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Optimistic\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nAn unshakeable positive demeanor that inspires resilience in bleak moments.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-patagia",
    "name": "Patagia",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gliding speed of 2x Ground speed, uses Acrobatics skill. Special Top Clothing.",
    "description": "Gliding speed of 2x Ground speed, uses Acrobatics skill. Special Top Clothing.",
    "mechanics": "Gliding speed of 2x Ground speed, uses Acrobatics skill. Special Top Clothing.",
    "mechanic": "Gliding speed of 2x Ground speed, uses Acrobatics skill. Special Top Clothing.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Patagia\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nGliding speed of 2x Ground speed, uses Acrobatics skill. Special Top Clothing.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-patience",
    "name": "Patience",
    "category": "traits",
    "trait_type": "Mental",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Methodical and disciplined mental focus that excels during extended research, stakeouts, and precision crafting.",
    "description": "Methodical and disciplined mental focus that excels during extended research, stakeouts, and precision crafting.",
    "mechanics": "Methodical and disciplined mental focus that excels during extended research, stakeouts, and precision crafting.",
    "mechanic": "Methodical and disciplined mental focus that excels during extended research, stakeouts, and precision crafting.",
    "rules": "Basic Mental (1 BP).",
    "special_rules": "Basic Mental (1 BP).",
    "modifiers": [],
    "body": "# Patience\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Mental\n**BP Cost**: 1\n\n## Description\nMethodical and disciplined mental focus that excels during extended research, stakeouts, and precision crafting.",
    "notes": "[Rule] Basic Mental (1 BP).",
    "notesList": [
      "[Rule] Basic Mental (1 BP)."
    ]
  },
  {
    "id": "trait-peaceful-nature",
    "name": "Peaceful Nature",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Radiates serene composure that disarms hostility and calms tense standoffs.",
    "description": "Radiates serene composure that disarms hostility and calms tense standoffs.",
    "mechanics": "Radiates serene composure that disarms hostility and calms tense standoffs.",
    "mechanic": "Radiates serene composure that disarms hostility and calms tense standoffs.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Peaceful Nature\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nRadiates serene composure that disarms hostility and calms tense standoffs.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-persistence",
    "name": "Persistence",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Tireless determination that runs countless trials until a breakthrough is achieved.",
    "description": "Tireless determination that runs countless trials until a breakthrough is achieved.",
    "mechanics": "Tireless determination that runs countless trials until a breakthrough is achieved.",
    "mechanic": "Tireless determination that runs countless trials until a breakthrough is achieved.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Persistence\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nTireless determination that runs countless trials until a breakthrough is achieved.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-persuasion",
    "name": "Persuasion",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Convincing others to cooperate, negotiation, deception, and diplomacy",
    "description": "Convincing others to cooperate, negotiation, deception, and diplomacy",
    "mechanics": "Convincing others to cooperate, negotiation, deception, and diplomacy",
    "mechanic": "Convincing others to cooperate, negotiation, deception, and diplomacy",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Persuasion\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nConvincing others to cooperate, negotiation, deception, and diplomacy",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-physical-and-mental-resilience",
    "name": "Physical and mental resilience",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to endure harsh conditions or high-stress situations",
    "description": "Ability to endure harsh conditions or high-stress situations",
    "mechanics": "Ability to endure harsh conditions or high-stress situations",
    "mechanic": "Ability to endure harsh conditions or high-stress situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Physical and mental resilience\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to endure harsh conditions or high-stress situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-physical-endurance",
    "name": "Physical Endurance",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "High tolerance for atmospheric toxins, extreme temperatures, and caloric deprivation.",
    "description": "High tolerance for atmospheric toxins, extreme temperatures, and caloric deprivation.",
    "mechanics": "High tolerance for atmospheric toxins, extreme temperatures, and caloric deprivation.",
    "mechanic": "High tolerance for atmospheric toxins, extreme temperatures, and caloric deprivation.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Physical Endurance\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nHigh tolerance for atmospheric toxins, extreme temperatures, and caloric deprivation.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-physical-fitness",
    "name": "Physical Fitness",
    "category": "traits",
    "trait_type": "Physical",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Superior cardiovascular endurance, stamina, and physical conditioning, granting bonuses on long-distance athletics checks.",
    "description": "Superior cardiovascular endurance, stamina, and physical conditioning, granting bonuses on long-distance athletics checks.",
    "mechanics": "Superior cardiovascular endurance, stamina, and physical conditioning, granting bonuses on long-distance athletics checks.",
    "mechanic": "Superior cardiovascular endurance, stamina, and physical conditioning, granting bonuses on long-distance athletics checks.",
    "rules": "Basic Physical (1 BP).",
    "special_rules": "Basic Physical (1 BP).",
    "modifiers": [],
    "body": "# Physical Fitness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Physical\n**BP Cost**: 1\n\n## Description\nSuperior cardiovascular endurance, stamina, and physical conditioning, granting bonuses on long-distance athletics checks.",
    "notes": "[Rule] Basic Physical (1 BP).",
    "notesList": [
      "[Rule] Basic Physical (1 BP)."
    ]
  },
  {
    "id": "trait-physical-prowess",
    "name": "Physical Prowess",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Physically fit and strong, can endure long periods of physical activity and combat",
    "description": "Physically fit and strong, can endure long periods of physical activity and combat",
    "mechanics": "Physically fit and strong, can endure long periods of physical activity and combat",
    "mechanic": "Physically fit and strong, can endure long periods of physical activity and combat",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Physical Prowess\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nPhysically fit and strong, can endure long periods of physical activity and combat",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-physical-strength",
    "name": "Physical Strength",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Musculoskeletal conditioning built through rigorous manual labor and heavy lifting.",
    "description": "Musculoskeletal conditioning built through rigorous manual labor and heavy lifting.",
    "mechanics": "Musculoskeletal conditioning built through rigorous manual labor and heavy lifting.",
    "mechanic": "Musculoskeletal conditioning built through rigorous manual labor and heavy lifting.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Physical Strength\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nMusculoskeletal conditioning built through rigorous manual labor and heavy lifting.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-pilot",
    "name": "Pilot",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Most field scouts are pilots, as they need to navigate and operate spacecraft or other vehicles during their explorations.",
    "description": "Most field scouts are pilots, as they need to navigate and operate spacecraft or other vehicles during their explorations.",
    "mechanics": "Most field scouts are pilots, as they need to navigate and operate spacecraft or other vehicles during their explorations.",
    "mechanic": "Most field scouts are pilots, as they need to navigate and operate spacecraft or other vehicles during their explorations.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Pilot\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMost field scouts are pilots, as they need to navigate and operate spacecraft or other vehicles during their explorations.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-pilot-skills",
    "name": "Pilot Skills",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Practiced control of specialized terrain, atmospheric, or orbital transport craft.",
    "description": "Practiced control of specialized terrain, atmospheric, or orbital transport craft.",
    "mechanics": "Practiced control of specialized terrain, atmospheric, or orbital transport craft.",
    "mechanic": "Practiced control of specialized terrain, atmospheric, or orbital transport craft.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Pilot Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPracticed control of specialized terrain, atmospheric, or orbital transport craft.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-powerful-charge",
    "name": "Powerful Charge",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Charge deals twice the number of damage dice plus 1-1/2 times Str bonus.",
    "description": "Charge deals twice the number of damage dice plus 1-1/2 times Str bonus.",
    "mechanics": "Charge deals twice the number of damage dice plus 1-1/2 times Str bonus.",
    "mechanic": "Charge deals twice the number of damage dice plus 1-1/2 times Str bonus.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Powerful Charge\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nCharge deals twice the number of damage dice plus 1-1/2 times Str bonus.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-practicality",
    "name": "Practicality",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Focuses on utilitarian efficiency, cutting through abstract theories to deliver results.",
    "description": "Focuses on utilitarian efficiency, cutting through abstract theories to deliver results.",
    "mechanics": "Focuses on utilitarian efficiency, cutting through abstract theories to deliver results.",
    "mechanic": "Focuses on utilitarian efficiency, cutting through abstract theories to deliver results.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Practicality\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nFocuses on utilitarian efficiency, cutting through abstract theories to deliver results.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-prehensile-limbs",
    "name": "Prehensile Limbs",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Fully Prehensile tentacles/off-hands/limbs, make certain checks with Advantage.",
    "description": "Fully Prehensile tentacles/off-hands/limbs, make certain checks with Advantage.",
    "mechanics": "Fully Prehensile tentacles/off-hands/limbs, make certain checks with Advantage.",
    "mechanic": "Fully Prehensile tentacles/off-hands/limbs, make certain checks with Advantage.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Prehensile Limbs\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nFully Prehensile tentacles/off-hands/limbs, make certain checks with Advantage.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-prehensile-tail",
    "name": "Prehensile Tail",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+2 to Climbing and Balance checks and usable as an off-hand. Special Pants.",
    "description": "+2 to Climbing and Balance checks and usable as an off-hand. Special Pants.",
    "mechanics": "+2 to Climbing and Balance checks and usable as an off-hand. Special Pants.",
    "mechanic": "+2 to Climbing and Balance checks and usable as an off-hand. Special Pants.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [
      {
        "target": "Climbing",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Climbing"
      },
      {
        "target": "Balance",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Balance"
      }
    ],
    "body": "# Prehensile Tail\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+2 to Climbing and Balance checks and usable as an off-hand. Special Pants.",
    "notes": "[Modifier] +2 to Climbing\n[Modifier] +2 to Balance\n[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Modifier] +2 to Climbing",
      "[Modifier] +2 to Balance",
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-problem-solving",
    "name": "Problem Solving",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Exceptional critical thinking and analytical troubleshooting under duress.",
    "description": "Exceptional critical thinking and analytical troubleshooting under duress.",
    "mechanics": "Exceptional critical thinking and analytical troubleshooting under duress.",
    "mechanic": "Exceptional critical thinking and analytical troubleshooting under duress.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Problem Solving\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nExceptional critical thinking and analytical troubleshooting under duress.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-problem-solving-skills",
    "name": "Problem-Solving Skills",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Strong analytical and problem-solving skills",
    "description": "Strong analytical and problem-solving skills",
    "mechanics": "Strong analytical and problem-solving skills",
    "mechanic": "Strong analytical and problem-solving skills",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Problem-Solving Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nStrong analytical and problem-solving skills",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-product-knowledge",
    "name": "Product Knowledge",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants have in-depth knowledge about the products they sell. They understand their features, benefits, and potential uses, allowing them to effectively market and sell their goods.",
    "description": "Merchants have in-depth knowledge about the products they sell. They understand their features, benefits, and potential uses, allowing them to effectively market and sell their goods.",
    "mechanics": "Merchants have in-depth knowledge about the products they sell. They understand their features, benefits, and potential uses, allowing them to effectively market and sell their goods.",
    "mechanic": "Merchants have in-depth knowledge about the products they sell. They understand their features, benefits, and potential uses, allowing them to effectively market and sell their goods.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Product Knowledge\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants have in-depth knowledge about the products they sell. They understand their features, benefits, and potential uses, allowing them to effectively market and sell their goods.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-professionalism",
    "name": "Professionalism",
    "category": "traits",
    "trait_type": "Common Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Recognized industry standing and professional reliability.",
    "description": "Recognized industry standing and professional reliability.",
    "mechanics": "Recognized industry standing and professional reliability.",
    "mechanic": "Recognized industry standing and professional reliability.",
    "rules": "Basic Common Occupational Trait (1 BP).",
    "special_rules": "Basic Common Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Professionalism\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Common Occupational Trait\n**BP Cost**: 1\n\n## Description\nRecognized industry standing and professional reliability.",
    "notes": "[Rule] Basic Common Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Common Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-quadruped",
    "name": "Quadruped",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Four legged, +4 Stability, +10 movement speed. Special Accommodations.",
    "description": "Four legged, +4 Stability, +10 movement speed. Special Accommodations.",
    "mechanics": "Four legged, +4 Stability, +10 movement speed. Special Accommodations.",
    "mechanic": "Four legged, +4 Stability, +10 movement speed. Special Accommodations.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [
      {
        "target": "move-walk",
        "type": "combat",
        "value": 10,
        "mode": "inherent",
        "description": "+10 movement"
      }
    ],
    "body": "# Quadruped\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nFour legged, +4 Stability, +10 movement speed. Special Accommodations.",
    "notes": "[Modifier] +10 movement\n[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Modifier] +10 movement",
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-quick-reactions",
    "name": "Quick Reactions",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Use double Agility score to calculate base Initiative. Req: Racial Agility +1.",
    "description": "Use double Agility score to calculate base Initiative. Req: Racial Agility +1.",
    "mechanics": "Use double Agility score to calculate base Initiative. Req: Racial Agility +1.",
    "mechanic": "Use double Agility score to calculate base Initiative. Req: Racial Agility +1.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Quick Reactions\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nUse double Agility score to calculate base Initiative. Req: Racial Agility +1.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-quick-thinking",
    "name": "Quick Thinking",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Think on their feet, make split-second decisions, and adapt to rapidly changing situations",
    "description": "Think on their feet, make split-second decisions, and adapt to rapidly changing situations",
    "mechanics": "Think on their feet, make split-second decisions, and adapt to rapidly changing situations",
    "mechanic": "Think on their feet, make split-second decisions, and adapt to rapidly changing situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Quick Thinking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nThink on their feet, make split-second decisions, and adapt to rapidly changing situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-rapid-response",
    "name": "Rapid Response",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to respond quickly to threats and can act decisively in high-pressure situations",
    "description": "Able to respond quickly to threats and can act decisively in high-pressure situations",
    "mechanics": "Able to respond quickly to threats and can act decisively in high-pressure situations",
    "mechanic": "Able to respond quickly to threats and can act decisively in high-pressure situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Rapid Response\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to respond quickly to threats and can act decisively in high-pressure situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-reach",
    "name": "Reach",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Reach of 10 feet.",
    "description": "Reach of 10 feet.",
    "mechanics": "Reach of 10 feet.",
    "mechanic": "Reach of 10 feet.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Reach\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nReach of 10 feet.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-reduced-sustenance",
    "name": "Reduced Sustenance",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Eat and drink half typical.",
    "description": "Eat and drink half typical.",
    "mechanics": "Eat and drink half typical.",
    "mechanic": "Eat and drink half typical.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Reduced Sustenance\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nEat and drink half typical.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-regeneration",
    "name": "Regeneration",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Will regrow lost Limbs and Organs with recovery of Health.",
    "description": "Will regrow lost Limbs and Organs with recovery of Health.",
    "mechanics": "Will regrow lost Limbs and Organs with recovery of Health.",
    "mechanic": "Will regrow lost Limbs and Organs with recovery of Health.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Regeneration\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nWill regrow lost Limbs and Organs with recovery of Health.",
    "notes": "[Rule] Elite Species Trait (4 BP).\n[Prerequisite] Fast Heal, Sta 4",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP).",
      "[Prerequisite] Fast Heal, Sta 4"
    ]
  },
  {
    "id": "trait-relentless",
    "name": "Relentless",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 bonus on combat maneuver checks made to bull rush or overrun an opponent.",
    "description": "+2 bonus on combat maneuver checks made to bull rush or overrun an opponent.",
    "mechanics": "+2 bonus on combat maneuver checks made to bull rush or overrun an opponent.",
    "mechanic": "+2 bonus on combat maneuver checks made to bull rush or overrun an opponent.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Combat maneuver",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Combat maneuver"
      }
    ],
    "body": "# Relentless\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 bonus on combat maneuver checks made to bull rush or overrun an opponent.",
    "notes": "[Modifier] +2 to Combat maneuver\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Combat maneuver",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-resistant",
    "name": "Resistant",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "+2 racial bonus on saving throws against mind-affecting effects and poison.",
    "description": "+2 racial bonus on saving throws against mind-affecting effects and poison.",
    "mechanics": "+2 racial bonus on saving throws against mind-affecting effects and poison.",
    "mechanic": "+2 racial bonus on saving throws against mind-affecting effects and poison.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Resistant\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\n+2 racial bonus on saving throws against mind-affecting effects and poison.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-resource-management",
    "name": "Resource Management",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Meticulous rationing of food, water, battery cells, and structural spare parts.",
    "description": "Meticulous rationing of food, water, battery cells, and structural spare parts.",
    "mechanics": "Meticulous rationing of food, water, battery cells, and structural spare parts.",
    "mechanic": "Meticulous rationing of food, water, battery cells, and structural spare parts.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Resource Management\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nMeticulous rationing of food, water, battery cells, and structural spare parts.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-resourceful",
    "name": "Resourceful",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to make weapons out of anything and can adapt to new situations quickly",
    "description": "Able to make weapons out of anything and can adapt to new situations quickly",
    "mechanics": "Able to make weapons out of anything and can adapt to new situations quickly",
    "mechanic": "Able to make weapons out of anything and can adapt to new situations quickly",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Resourceful\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to make weapons out of anything and can adapt to new situations quickly",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-resourcefulness",
    "name": "Resourcefulness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Makes the most of scarce tools, improvising creative solutions under pressure.",
    "description": "Makes the most of scarce tools, improvising creative solutions under pressure.",
    "mechanics": "Makes the most of scarce tools, improvising creative solutions under pressure.",
    "mechanic": "Makes the most of scarce tools, improvising creative solutions under pressure.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Resourcefulness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nMakes the most of scarce tools, improvising creative solutions under pressure.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-risk-management",
    "name": "Risk Management",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Merchants are skilled at assessing and managing risks. They can anticipate potential challenges and develop contingency plans to mitigate losses.   *+1 Karma Point* #",
    "description": "Merchants are skilled at assessing and managing risks. They can anticipate potential challenges and develop contingency plans to mitigate losses.   *+1 Karma Point* #",
    "mechanics": "Merchants are skilled at assessing and managing risks. They can anticipate potential challenges and develop contingency plans to mitigate losses.   *+1 Karma Point* #",
    "mechanic": "Merchants are skilled at assessing and managing risks. They can anticipate potential challenges and develop contingency plans to mitigate losses.   *+1 Karma Point* #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [
      {
        "target": "Karma",
        "type": "karma",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Karma Pool"
      }
    ],
    "body": "# Risk Management\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nMerchants are skilled at assessing and managing risks. They can anticipate potential challenges and develop contingency plans to mitigate losses.   *+1 Karma Point* #",
    "notes": "[Modifier] +1 to Karma Pool\n[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Modifier] +1 to Karma Pool",
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-risk-taking",
    "name": "Risk-Taking",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Willingness to gamble on razor-thin safety margins to accomplish difficult goals.",
    "description": "Willingness to gamble on razor-thin safety margins to accomplish difficult goals.",
    "mechanics": "Willingness to gamble on razor-thin safety margins to accomplish difficult goals.",
    "mechanic": "Willingness to gamble on razor-thin safety margins to accomplish difficult goals.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Risk-Taking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nWillingness to gamble on razor-thin safety margins to accomplish difficult goals.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-rock-throwing",
    "name": "Rock Throwing",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Range increment 60ft. Damage 2d6 + 1.5 Str. Req: Large.",
    "description": "Range increment 60ft. Damage 2d6 + 1.5 Str. Req: Large.",
    "mechanics": "Range increment 60ft. Damage 2d6 + 1.5 Str. Req: Large.",
    "mechanic": "Range increment 60ft. Damage 2d6 + 1.5 Str. Req: Large.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Rock Throwing\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nRange increment 60ft. Damage 2d6 + 1.5 Str. Req: Large.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-runner",
    "name": "Runner",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+4 racial bonus on saves to avoid fatigue/exhaustion/ill effects from running",
    "description": "+4 racial bonus on saves to avoid fatigue/exhaustion/ill effects from running",
    "mechanics": "+4 racial bonus on saves to avoid fatigue/exhaustion/ill effects from running",
    "mechanic": "+4 racial bonus on saves to avoid fatigue/exhaustion/ill effects from running",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Athletics",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Athletics"
      }
    ],
    "body": "# Runner\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+4 racial bonus on saves to avoid fatigue/exhaustion/ill effects from running",
    "notes": "[Modifier] +2 to Athletics\n[Rule] Basic Species Trait (1 BP).\n[Prerequisite] Strength 1, Agility 1, Stamina 1",
    "notesList": [
      "[Modifier] +2 to Athletics",
      "[Rule] Basic Species Trait (1 BP).",
      "[Prerequisite] Strength 1, Agility 1, Stamina 1"
    ]
  },
  {
    "id": "trait-scavenging",
    "name": "Scavenging",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Excel at scavenging and salvaging useful items from abandoned places or wreckage, making the most out of limited resources",
    "description": "Excel at scavenging and salvaging useful items from abandoned places or wreckage, making the most out of limited resources",
    "mechanics": "Excel at scavenging and salvaging useful items from abandoned places or wreckage, making the most out of limited resources",
    "mechanic": "Excel at scavenging and salvaging useful items from abandoned places or wreckage, making the most out of limited resources",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Scavenging\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nExcel at scavenging and salvaging useful items from abandoned places or wreckage, making the most out of limited resources",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-scent",
    "name": "Scent",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Identify by smell, +4 to Track and Medical Diagnosis (as Analytical Sense of Smell).",
    "description": "Identify by smell, +4 to Track and Medical Diagnosis (as Analytical Sense of Smell).",
    "mechanics": "Identify by smell, +4 to Track and Medical Diagnosis (as Analytical Sense of Smell).",
    "mechanic": "Identify by smell, +4 to Track and Medical Diagnosis (as Analytical Sense of Smell).",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Scent\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nIdentify by smell, +4 to Track and Medical Diagnosis (as Analytical Sense of Smell).",
    "notes": "[Rule] Basic Species Trait (1 BP).\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP).",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "trait-scientific-knowledge",
    "name": "Scientific Knowledge",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Practical applied science in xenobiology, geology, and atmospheric terraforming.",
    "description": "Practical applied science in xenobiology, geology, and atmospheric terraforming.",
    "mechanics": "Practical applied science in xenobiology, geology, and atmospheric terraforming.",
    "mechanic": "Practical applied science in xenobiology, geology, and atmospheric terraforming.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Scientific Knowledge\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPractical applied science in xenobiology, geology, and atmospheric terraforming.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-sea-piloting",
    "name": "Sea Piloting",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Mastery over hydrofoils, submersibles, surface skiffs, and massive oceanic platforms.",
    "description": "Mastery over hydrofoils, submersibles, surface skiffs, and massive oceanic platforms.",
    "mechanics": "Mastery over hydrofoils, submersibles, surface skiffs, and massive oceanic platforms.",
    "mechanic": "Mastery over hydrofoils, submersibles, surface skiffs, and massive oceanic platforms.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Sea Piloting\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nMastery over hydrofoils, submersibles, surface skiffs, and massive oceanic platforms.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-self-revivifying",
    "name": "Self Revivifying",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "1/day attempt to resurrect. Cost: 1 Karma, Con Check Diff 20. Req: Immortal.",
    "description": "1/day attempt to resurrect. Cost: 1 Karma, Con Check Diff 20. Req: Immortal.",
    "mechanics": "1/day attempt to resurrect. Cost: 1 Karma, Con Check Diff 20. Req: Immortal.",
    "mechanic": "1/day attempt to resurrect. Cost: 1 Karma, Con Check Diff 20. Req: Immortal.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [
      {
        "target": "Karma",
        "type": "karma",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Karma Pool"
      }
    ],
    "body": "# Self Revivifying\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\n1/day attempt to resurrect. Cost: 1 Karma, Con Check Diff 20. Req: Immortal.",
    "notes": "[Modifier] +1 to Karma Pool\n[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Modifier] +1 to Karma Pool",
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-self-preservation",
    "name": "Self-preservation",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Criminals may be skilled at protecting themselves and avoiding capture by law enforcement",
    "description": "Criminals may be skilled at protecting themselves and avoiding capture by law enforcement",
    "mechanics": "Criminals may be skilled at protecting themselves and avoiding capture by law enforcement",
    "mechanic": "Criminals may be skilled at protecting themselves and avoiding capture by law enforcement",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Self-preservation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nCriminals may be skilled at protecting themselves and avoiding capture by law enforcement",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-self-sufficiency",
    "name": "Self-sufficiency",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Often self-sufficient and able to take care of themselves without relying on others",
    "description": "Often self-sufficient and able to take care of themselves without relying on others",
    "mechanics": "Often self-sufficient and able to take care of themselves without relying on others",
    "mechanic": "Often self-sufficient and able to take care of themselves without relying on others",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Self-sufficiency\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nOften self-sufficient and able to take care of themselves without relying on others",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-semi-corporeal",
    "name": "Semi-Corporeal",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "DR30 vs physical, able to Phase through solid matter, Solidify at will.",
    "description": "DR30 vs physical, able to Phase through solid matter, Solidify at will.",
    "mechanics": "DR30 vs physical, able to Phase through solid matter, Solidify at will.",
    "mechanic": "DR30 vs physical, able to Phase through solid matter, Solidify at will.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Semi-Corporeal\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nDR30 vs physical, able to Phase through solid matter, Solidify at will.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-shadow-affinity",
    "name": "Shadow Affinity",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gain +5 to Stealth when in Shadowy or Dim area.",
    "description": "Gain +5 to Stealth when in Shadowy or Dim area.",
    "mechanics": "Gain +5 to Stealth when in Shadowy or Dim area.",
    "mechanic": "Gain +5 to Stealth when in Shadowy or Dim area.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Stealth when in Shadowy or Dim area",
        "type": "skill",
        "value": 5,
        "mode": "inherent",
        "description": "+5 to Stealth when in Shadowy or Dim area"
      }
    ],
    "body": "# Shadow Affinity\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nGain +5 to Stealth when in Shadowy or Dim area.",
    "notes": "[Modifier] +5 to Stealth when in Shadowy or Dim area\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +5 to Stealth when in Shadowy or Dim area",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-shadow-blending",
    "name": "Shadow Blending",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Attacks made against members in dim light have 30% miss chance.",
    "description": "Attacks made against members in dim light have 30% miss chance.",
    "mechanics": "Attacks made against members in dim light have 30% miss chance.",
    "mechanic": "Attacks made against members in dim light have 30% miss chance.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Shadow Blending\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nAttacks made against members in dim light have 30% miss chance.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-shards-of-the-past",
    "name": "Shards of the Past",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Pick two skills. Gain +2 racial bonus on both. Represents past lives.",
    "description": "Pick two skills. Gain +2 racial bonus on both. Represents past lives.",
    "mechanics": "Pick two skills. Gain +2 racial bonus on both. Represents past lives.",
    "mechanic": "Pick two skills. Gain +2 racial bonus on both. Represents past lives.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Shards of the Past\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nPick two skills. Gain +2 racial bonus on both. Represents past lives.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-shared-wisdom",
    "name": "Shared Wisdom",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Offers profound insight that elevates the actions of comrades.",
    "description": "Offers profound insight that elevates the actions of comrades.",
    "mechanics": "Offers profound insight that elevates the actions of comrades.",
    "mechanic": "Offers profound insight that elevates the actions of comrades.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Shared Wisdom\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nOffers profound insight that elevates the actions of comrades.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-silent-hunter",
    "name": "Silent Hunter",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Reduce Stealth penalty for moving by 5 / Stealth checks while running at –20",
    "description": "Reduce Stealth penalty for moving by 5 / Stealth checks while running at –20",
    "mechanics": "Reduce Stealth penalty for moving by 5 / Stealth checks while running at –20",
    "mechanic": "Reduce Stealth penalty for moving by 5 / Stealth checks while running at –20",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Silent Hunter\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nReduce Stealth penalty for moving by 5 / Stealth checks while running at –20",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-silver-tongued",
    "name": "Silver Tongued",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 bonus on Diplomacy and Bluff. Can shift attitude up to three steps.",
    "description": "+2 bonus on Diplomacy and Bluff. Can shift attitude up to three steps.",
    "mechanics": "+2 bonus on Diplomacy and Bluff. Can shift attitude up to three steps.",
    "mechanic": "+2 bonus on Diplomacy and Bluff. Can shift attitude up to three steps.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Diplomacy",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Diplomacy"
      },
      {
        "target": "Bluff",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Bluff"
      }
    ],
    "body": "# Silver Tongued\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 bonus on Diplomacy and Bluff. Can shift attitude up to three steps.",
    "notes": "[Modifier] +2 to Diplomacy\n[Modifier] +2 to Bluff\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Diplomacy",
      "[Modifier] +2 to Bluff",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-skill-bonus",
    "name": "Skill Bonus",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gain +2 racial bonus to divide amongst noted skills.",
    "description": "Gain +2 racial bonus to divide amongst noted skills.",
    "mechanics": "Gain +2 racial bonus to divide amongst noted skills.",
    "mechanic": "Gain +2 racial bonus to divide amongst noted skills.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Skill Bonus\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nGain +2 racial bonus to divide amongst noted skills.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-sleepless",
    "name": "Sleepless",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Does not require sleep, may rest to regain metaphysical energy.",
    "description": "Does not require sleep, may rest to regain metaphysical energy.",
    "mechanics": "Does not require sleep, may rest to regain metaphysical energy.",
    "mechanic": "Does not require sleep, may rest to regain metaphysical energy.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Sleepless\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nDoes not require sleep, may rest to regain metaphysical energy.",
    "notes": "[Rule] Advanced Species Trait (2 BP).\n[Prerequisite] Synthetic, Elf, or Special",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP).",
      "[Prerequisite] Synthetic, Elf, or Special"
    ]
  },
  {
    "id": "trait-smooth",
    "name": "Smooth",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Criminals may be charming and persuasive, able to talk their way out of difficult situations",
    "description": "Criminals may be charming and persuasive, able to talk their way out of difficult situations",
    "mechanics": "Criminals may be charming and persuasive, able to talk their way out of difficult situations",
    "mechanic": "Criminals may be charming and persuasive, able to talk their way out of difficult situations",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Smooth\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nCriminals may be charming and persuasive, able to talk their way out of difficult situations",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-smooth-talking",
    "name": "Smooth Talking",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Charismatic conversational flow that disarms suspicion and charms conversational partners.",
    "description": "Charismatic conversational flow that disarms suspicion and charms conversational partners.",
    "mechanics": "Charismatic conversational flow that disarms suspicion and charms conversational partners.",
    "mechanic": "Charismatic conversational flow that disarms suspicion and charms conversational partners.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Smooth Talking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nCharismatic conversational flow that disarms suspicion and charms conversational partners.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-sneaky",
    "name": "Sneaky",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 racial bonus on Stealth checks.",
    "description": "+2 racial bonus on Stealth checks.",
    "mechanics": "+2 racial bonus on Stealth checks.",
    "mechanic": "+2 racial bonus on Stealth checks.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Sneaky\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 racial bonus on Stealth checks.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-sociable",
    "name": "Sociable",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Diplomacy check to change attitude fails by 5 or more, try again within 24 hours.",
    "description": "Diplomacy check to change attitude fails by 5 or more, try again within 24 hours.",
    "mechanics": "Diplomacy check to change attitude fails by 5 or more, try again within 24 hours.",
    "mechanic": "Diplomacy check to change attitude fails by 5 or more, try again within 24 hours.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Sociable\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nDiplomacy check to change attitude fails by 5 or more, try again within 24 hours.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-social-skills",
    "name": "Social Skills",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Navigates dense cultural melting pots, high-rise galas, and underground speakeasies with ease.",
    "description": "Navigates dense cultural melting pots, high-rise galas, and underground speakeasies with ease.",
    "mechanics": "Navigates dense cultural melting pots, high-rise galas, and underground speakeasies with ease.",
    "mechanic": "Navigates dense cultural melting pots, high-rise galas, and underground speakeasies with ease.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Social Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nNavigates dense cultural melting pots, high-rise galas, and underground speakeasies with ease.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-special-ability",
    "name": "Special Ability",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may have access to unique powers or techniques that set them apart from other characters. These could include energy manipulation, telekinesis, elemental control, or advanced hacking abilities.   May be taken multiple times for a different Special Ability.",
    "description": "Adepts may have access to unique powers or techniques that set them apart from other characters. These could include energy manipulation, telekinesis, elemental control, or advanced hacking abilities.   May be taken multiple times for a different Special Ability.",
    "mechanics": "Adepts may have access to unique powers or techniques that set them apart from other characters. These could include energy manipulation, telekinesis, elemental control, or advanced hacking abilities.   May be taken multiple times for a different Special Ability.",
    "mechanic": "Adepts may have access to unique powers or techniques that set them apart from other characters. These could include energy manipulation, telekinesis, elemental control, or advanced hacking abilities.   May be taken multiple times for a different Special Ability.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Special Ability\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may have access to unique powers or techniques that set them apart from other characters. These could include energy manipulation, telekinesis, elemental control, or advanced hacking abilities.   May be taken multiple times for a different Special Ability.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Basic Occupational Trait (1 BP).\n[Prerequisite] None (though usually tied to Species or Origin).",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Basic Occupational Trait (1 BP).",
      "[Prerequisite] None (though usually tied to Species or Origin)."
    ]
  },
  {
    "id": "trait-special-equipment",
    "name": "Special Equipment",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts may have access to specialized equipment or tools that enhance their abilities. This could include advanced weapons, cybernetic enhancements, or artifacts with unique properties.",
    "description": "Adepts may have access to specialized equipment or tools that enhance their abilities. This could include advanced weapons, cybernetic enhancements, or artifacts with unique properties.",
    "mechanics": "Adepts may have access to specialized equipment or tools that enhance their abilities. This could include advanced weapons, cybernetic enhancements, or artifacts with unique properties.",
    "mechanic": "Adepts may have access to specialized equipment or tools that enhance their abilities. This could include advanced weapons, cybernetic enhancements, or artifacts with unique properties.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Special Equipment\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts may have access to specialized equipment or tools that enhance their abilities. This could include advanced weapons, cybernetic enhancements, or artifacts with unique properties.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-specialized-knowledge",
    "name": "Specialized Knowledge",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Deep technical expertise in metallurgy, industrial chemistry, or structural fabrication.",
    "description": "Deep technical expertise in metallurgy, industrial chemistry, or structural fabrication.",
    "mechanics": "Deep technical expertise in metallurgy, industrial chemistry, or structural fabrication.",
    "mechanic": "Deep technical expertise in metallurgy, industrial chemistry, or structural fabrication.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Specialized Knowledge\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nDeep technical expertise in metallurgy, industrial chemistry, or structural fabrication.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-specialized-skills",
    "name": "Specialized Skills",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Adepts are often highly skilled in specific areas, such as combat, technology, or mystical arts. They may have extensive training and knowledge in their chosen field, allowing them to excel in their profession.",
    "description": "Adepts are often highly skilled in specific areas, such as combat, technology, or mystical arts. They may have extensive training and knowledge in their chosen field, allowing them to excel in their profession.",
    "mechanics": "Adepts are often highly skilled in specific areas, such as combat, technology, or mystical arts. They may have extensive training and knowledge in their chosen field, allowing them to excel in their profession.",
    "mechanic": "Adepts are often highly skilled in specific areas, such as combat, technology, or mystical arts. They may have extensive training and knowledge in their chosen field, allowing them to excel in their profession.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Specialized Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAdepts are often highly skilled in specific areas, such as combat, technology, or mystical arts. They may have extensive training and knowledge in their chosen field, allowing them to excel in their profession.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-spiritual-awareness",
    "name": "Spiritual Awareness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Attuned to metaphysical resonances, ley conduits, and unseen psychic currents.",
    "description": "Attuned to metaphysical resonances, ley conduits, and unseen psychic currents.",
    "mechanics": "Attuned to metaphysical resonances, ley conduits, and unseen psychic currents.",
    "mechanic": "Attuned to metaphysical resonances, ley conduits, and unseen psychic currents.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Spiritual Awareness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nAttuned to metaphysical resonances, ley conduits, and unseen psychic currents.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-stable-footed",
    "name": "Stable Footed",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+4 racial Stability bonus while standing on the ground.",
    "description": "+4 racial Stability bonus while standing on the ground.",
    "mechanics": "+4 racial Stability bonus while standing on the ground.",
    "mechanic": "+4 racial Stability bonus while standing on the ground.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Stable Footed\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+4 racial Stability bonus while standing on the ground.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-stalker",
    "name": "Stalker",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Gain +2 bonus to Perception and Stealth checks versus one target.",
    "description": "Gain +2 bonus to Perception and Stealth checks versus one target.",
    "mechanics": "Gain +2 bonus to Perception and Stealth checks versus one target.",
    "mechanic": "Gain +2 bonus to Perception and Stealth checks versus one target.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Perception",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Perception"
      },
      {
        "target": "Stealth",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Stealth"
      }
    ],
    "body": "# Stalker\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nGain +2 bonus to Perception and Stealth checks versus one target.",
    "notes": "[Modifier] +2 to Perception\n[Modifier] +2 to Stealth\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Perception",
      "[Modifier] +2 to Stealth",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-static-bonus-feat",
    "name": "Static Bonus Feat",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Choose one feat with no prerequisites. All members gain this feat as a bonus feat.",
    "description": "Choose one feat with no prerequisites. All members gain this feat as a bonus feat.",
    "mechanics": "Choose one feat with no prerequisites. All members gain this feat as a bonus feat.",
    "mechanic": "Choose one feat with no prerequisites. All members gain this feat as a bonus feat.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Static Bonus Feat\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nChoose one feat with no prerequisites. All members gain this feat as a bonus feat.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-stealth",
    "name": "Stealth",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Operating covertly, sneaking, hiding, and remaining undetected",
    "description": "Operating covertly, sneaking, hiding, and remaining undetected",
    "mechanics": "Operating covertly, sneaking, hiding, and remaining undetected",
    "mechanic": "Operating covertly, sneaking, hiding, and remaining undetected",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Stealth\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nOperating covertly, sneaking, hiding, and remaining undetected",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-strategic",
    "name": "Strategic",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Battlefield tactical assessment and mission operation planning.",
    "description": "Battlefield tactical assessment and mission operation planning.",
    "mechanics": "Battlefield tactical assessment and mission operation planning.",
    "mechanic": "Battlefield tactical assessment and mission operation planning.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Strategic\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nBattlefield tactical assessment and mission operation planning.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-strategic-thinking",
    "name": "Strategic thinking",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Skilled at developing long-term plans and strategies to achieve their goals.",
    "description": "Skilled at developing long-term plans and strategies to achieve their goals.",
    "mechanics": "Skilled at developing long-term plans and strategies to achieve their goals.",
    "mechanic": "Skilled at developing long-term plans and strategies to achieve their goals.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Strategic thinking\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nSkilled at developing long-term plans and strategies to achieve their goals.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-street-fighting",
    "name": "Street Fighting",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Dirty fighting techniques optimized for claustrophobic alleys, elevator cabs, and crowded subway cars.",
    "description": "Dirty fighting techniques optimized for claustrophobic alleys, elevator cabs, and crowded subway cars.",
    "mechanics": "Dirty fighting techniques optimized for claustrophobic alleys, elevator cabs, and crowded subway cars.",
    "mechanic": "Dirty fighting techniques optimized for claustrophobic alleys, elevator cabs, and crowded subway cars.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Street Fighting\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nDirty fighting techniques optimized for claustrophobic alleys, elevator cabs, and crowded subway cars.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-street-smarts",
    "name": "Street Smarts",
    "category": "traits",
    "trait_type": "Social",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Familiarity with underworld hierarchy, shadow markets, slang, and avoiding law enforcement radar.",
    "description": "Familiarity with underworld hierarchy, shadow markets, slang, and avoiding law enforcement radar.",
    "mechanics": "Familiarity with underworld hierarchy, shadow markets, slang, and avoiding law enforcement radar.",
    "mechanic": "Familiarity with underworld hierarchy, shadow markets, slang, and avoiding law enforcement radar.",
    "rules": "Basic Social (1 BP).",
    "special_rules": "Basic Social (1 BP).",
    "modifiers": [],
    "body": "# Street Smarts\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Social\n**BP Cost**: 1\n\n## Description\nFamiliarity with underworld hierarchy, shadow markets, slang, and avoiding law enforcement radar.",
    "notes": "[Rule] Basic Social (1 BP).",
    "notesList": [
      "[Rule] Basic Social (1 BP)."
    ]
  },
  {
    "id": "trait-streetwise",
    "name": "Streetwise",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Knows who controls each block, how to evade gang tolls, and where to fence hot cargo.",
    "description": "Knows who controls each block, how to evade gang tolls, and where to fence hot cargo.",
    "mechanics": "Knows who controls each block, how to evade gang tolls, and where to fence hot cargo.",
    "mechanic": "Knows who controls each block, how to evade gang tolls, and where to fence hot cargo.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Streetwise\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nKnows who controls each block, how to evade gang tolls, and where to fence hot cargo.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-studious",
    "name": "Studious",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Deep immersion in research databases, academic journals, and historical archives.",
    "description": "Deep immersion in research databases, academic journals, and historical archives.",
    "mechanics": "Deep immersion in research databases, academic journals, and historical archives.",
    "mechanic": "Deep immersion in research databases, academic journals, and historical archives.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Studious\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nDeep immersion in research databases, academic journals, and historical archives.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-survival",
    "name": "Survival",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to survive in harsh environments, such as deserts or post-apocalyptic wastelands, by finding food, water, and shelter",
    "description": "Ability to survive in harsh environments, such as deserts or post-apocalyptic wastelands, by finding food, water, and shelter",
    "mechanics": "Ability to survive in harsh environments, such as deserts or post-apocalyptic wastelands, by finding food, water, and shelter",
    "mechanic": "Ability to survive in harsh environments, such as deserts or post-apocalyptic wastelands, by finding food, water, and shelter",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Survival\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to survive in harsh environments, such as deserts or post-apocalyptic wastelands, by finding food, water, and shelter",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-survival-skills",
    "name": "Survival Skills",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Honed instincts for foraging, navigating wilderness, and finding shelter in hostile terrain.",
    "description": "Honed instincts for foraging, navigating wilderness, and finding shelter in hostile terrain.",
    "mechanics": "Honed instincts for foraging, navigating wilderness, and finding shelter in hostile terrain.",
    "mechanic": "Honed instincts for foraging, navigating wilderness, and finding shelter in hostile terrain.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Survival Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nHoned instincts for foraging, navigating wilderness, and finding shelter in hostile terrain.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-sustainable-practices",
    "name": "Sustainable Practices",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Deep understanding of ecological balance, crop rotation, and water conservation.",
    "description": "Deep understanding of ecological balance, crop rotation, and water conservation.",
    "mechanics": "Deep understanding of ecological balance, crop rotation, and water conservation.",
    "mechanic": "Deep understanding of ecological balance, crop rotation, and water conservation.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Sustainable Practices\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nDeep understanding of ecological balance, crop rotation, and water conservation.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-swarming",
    "name": "Swarming",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Two members can share same square. If attacking same foe, considered flanking.",
    "description": "Two members can share same square. If attacking same foe, considered flanking.",
    "mechanics": "Two members can share same square. If attacking same foe, considered flanking.",
    "mechanic": "Two members can share same square. If attacking same foe, considered flanking.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Swarming\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nTwo members can share same square. If attacking same foe, considered flanking.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-synthetic-armor-options",
    "name": "Synthetic Armor Options",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Armor and Armor Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "description": "Armor and Armor Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "mechanics": "Armor and Armor Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "mechanic": "Armor and Armor Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Synthetic Armor Options\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nArmor and Armor Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-synthetic-aux-core",
    "name": "Synthetic Aux Core",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Revivification without loss of Karma/Exp. Not traumatic. Req: Synthetic, TL4.",
    "description": "Revivification without loss of Karma/Exp. Not traumatic. Req: Synthetic, TL4.",
    "mechanics": "Revivification without loss of Karma/Exp. Not traumatic. Req: Synthetic, TL4.",
    "mechanic": "Revivification without loss of Karma/Exp. Not traumatic. Req: Synthetic, TL4.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Synthetic Aux Core\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nRevivification without loss of Karma/Exp. Not traumatic. Req: Synthetic, TL4.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-synthetic-exotic-opt",
    "name": "Synthetic Exotic Opt",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Synthetic version of a Racial Trait or Special Feature. Req: Synthetic, Multiple.",
    "description": "Synthetic version of a Racial Trait or Special Feature. Req: Synthetic, Multiple.",
    "mechanics": "Synthetic version of a Racial Trait or Special Feature. Req: Synthetic, Multiple.",
    "mechanic": "Synthetic version of a Racial Trait or Special Feature. Req: Synthetic, Multiple.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Synthetic Exotic Opt\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nSynthetic version of a Racial Trait or Special Feature. Req: Synthetic, Multiple.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-synthetic-tech-assim",
    "name": "Synthetic Tech Assim",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Able to absorb, power and use technological devices. Req: Synthetic, TL5.",
    "description": "Able to absorb, power and use technological devices. Req: Synthetic, TL5.",
    "mechanics": "Able to absorb, power and use technological devices. Req: Synthetic, TL5.",
    "mechanic": "Able to absorb, power and use technological devices. Req: Synthetic, TL5.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Synthetic Tech Assim\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nAble to absorb, power and use technological devices. Req: Synthetic, TL5.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-synthetic-weapon-options",
    "name": "Synthetic Weapon Options",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Weapons and Weapon Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "description": "Weapons and Weapon Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "mechanics": "Weapons and Weapon Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "mechanic": "Weapons and Weapon Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Synthetic Weapon Options\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nWeapons and Weapon Upgrades available as Augmentations. Req: Synthetic, TL2.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-tail",
    "name": "Tail",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 to Trip and Balance Checks and usable as a Club.",
    "description": "+2 to Trip and Balance Checks and usable as a Club.",
    "mechanics": "+2 to Trip and Balance Checks and usable as a Club.",
    "mechanic": "+2 to Trip and Balance Checks and usable as a Club.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [
      {
        "target": "Trip",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Trip"
      },
      {
        "target": "Balance",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Balance"
      }
    ],
    "body": "# Tail\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 to Trip and Balance Checks and usable as a Club.",
    "notes": "[Modifier] +2 to Trip\n[Modifier] +2 to Balance\n[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Trip",
      "[Modifier] +2 to Balance",
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-team-player",
    "name": "Team Player",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Ability to communicate effectively and collaborate with others",
    "description": "Ability to communicate effectively and collaborate with others",
    "mechanics": "Ability to communicate effectively and collaborate with others",
    "mechanic": "Ability to communicate effectively and collaborate with others",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Team Player\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAbility to communicate effectively and collaborate with others",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-team-oriented",
    "name": "Team-Oriented",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to work in teams and coordinate their efforts to achieve their objectives",
    "description": "Able to work in teams and coordinate their efforts to achieve their objectives",
    "mechanics": "Able to work in teams and coordinate their efforts to achieve their objectives",
    "mechanic": "Able to work in teams and coordinate their efforts to achieve their objectives",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Team-Oriented\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to work in teams and coordinate their efforts to achieve their objectives",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-teamwork",
    "name": "Teamwork",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Practiced coordination in gang work, shift labor, and complex multi-person tasks.",
    "description": "Practiced coordination in gang work, shift labor, and complex multi-person tasks.",
    "mechanics": "Practiced coordination in gang work, shift labor, and complex multi-person tasks.",
    "mechanic": "Practiced coordination in gang work, shift labor, and complex multi-person tasks.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Teamwork\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPracticed coordination in gang work, shift labor, and complex multi-person tasks.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-tech-savvy",
    "name": "Tech-Savvy",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Intimate familiarity with consumer neural nets, public datagrids, and ubiquitous urban tech.",
    "description": "Intimate familiarity with consumer neural nets, public datagrids, and ubiquitous urban tech.",
    "mechanics": "Intimate familiarity with consumer neural nets, public datagrids, and ubiquitous urban tech.",
    "mechanic": "Intimate familiarity with consumer neural nets, public datagrids, and ubiquitous urban tech.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Tech-Savvy\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nIntimate familiarity with consumer neural nets, public datagrids, and ubiquitous urban tech.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technical-knowledge",
    "name": "Technical Knowledge",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Deep understanding of the technical aspects of their craft, including knowledge of materials, tools, and techniques",
    "description": "Deep understanding of the technical aspects of their craft, including knowledge of materials, tools, and techniques",
    "mechanics": "Deep understanding of the technical aspects of their craft, including knowledge of materials, tools, and techniques",
    "mechanic": "Deep understanding of the technical aspects of their craft, including knowledge of materials, tools, and techniques",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Technical Knowledge\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nDeep understanding of the technical aspects of their craft, including knowledge of materials, tools, and techniques",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technical-skills",
    "name": "Technical Skills",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Practical hands-on maintenance for hardware, wiring, and mechanical assemblies.",
    "description": "Practical hands-on maintenance for hardware, wiring, and mechanical assemblies.",
    "mechanics": "Practical hands-on maintenance for hardware, wiring, and mechanical assemblies.",
    "mechanic": "Practical hands-on maintenance for hardware, wiring, and mechanical assemblies.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Technical Skills\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPractical hands-on maintenance for hardware, wiring, and mechanical assemblies.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technological-aptitude",
    "name": "Technological Aptitude",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Natural aptitude for understanding and operating advanced technology",
    "description": "Natural aptitude for understanding and operating advanced technology",
    "mechanics": "Natural aptitude for understanding and operating advanced technology",
    "mechanic": "Natural aptitude for understanding and operating advanced technology",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Technological Aptitude\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nNatural aptitude for understanding and operating advanced technology",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technological-innovation",
    "name": "Technological innovation",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to create, adapt, and improve technology in novel ways.",
    "description": "Able to create, adapt, and improve technology in novel ways.",
    "mechanics": "Able to create, adapt, and improve technology in novel ways.",
    "mechanic": "Able to create, adapt, and improve technology in novel ways.",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Technological innovation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to create, adapt, and improve technology in novel ways.",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technological-proficiency",
    "name": "Technological proficiency",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Proficiency in advanced technology",
    "description": "Proficiency in advanced technology",
    "mechanics": "Proficiency in advanced technology",
    "mechanic": "Proficiency in advanced technology",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Technological proficiency\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nProficiency in advanced technology",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-technology",
    "name": "Technology",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Familiarity with advanced technologies, including hacking, surveillance equipment, and advanced weapons",
    "description": "Familiarity with advanced technologies, including hacking, surveillance equipment, and advanced weapons",
    "mechanics": "Familiarity with advanced technologies, including hacking, surveillance equipment, and advanced weapons",
    "mechanic": "Familiarity with advanced technologies, including hacking, surveillance equipment, and advanced weapons",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Technology\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nFamiliarity with advanced technologies, including hacking, surveillance equipment, and advanced weapons",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-terrain-expert",
    "name": "Terrain Expert",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Scouts have knacks that allow them to improve their efficiency in specific terrains, which may be taken multiple times for different terrain types.   *+2 to Stealth, Survival and Defense in chosen Terrain* #",
    "description": "Scouts have knacks that allow them to improve their efficiency in specific terrains, which may be taken multiple times for different terrain types.   *+2 to Stealth, Survival and Defense in chosen Terrain* #",
    "mechanics": "Scouts have knacks that allow them to improve their efficiency in specific terrains, which may be taken multiple times for different terrain types.   *+2 to Stealth, Survival and Defense in chosen Terrain* #",
    "mechanic": "Scouts have knacks that allow them to improve their efficiency in specific terrains, which may be taken multiple times for different terrain types.   *+2 to Stealth, Survival and Defense in chosen Terrain* #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [
      {
        "target": "Stealth",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Stealth"
      }
    ],
    "body": "# Terrain Expert\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nScouts have knacks that allow them to improve their efficiency in specific terrains, which may be taken multiple times for different terrain types.   *+2 to Stealth, Survival and Defense in chosen Terrain* #",
    "notes": "[Modifier] +2 to Stealth\n[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 to Stealth",
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-thermal-sight",
    "name": "Thermal Sight",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "See Infra-Red/heat patterns, track passage of a warm target without light.",
    "description": "See Infra-Red/heat patterns, track passage of a warm target without light.",
    "mechanics": "See Infra-Red/heat patterns, track passage of a warm target without light.",
    "mechanic": "See Infra-Red/heat patterns, track passage of a warm target without light.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Thermal Sight\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nSee Infra-Red/heat patterns, track passage of a warm target without light.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-time-management",
    "name": "Time Management",
    "category": "traits",
    "trait_type": "Mental",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Mastery of operational logistics, prioritizing tasks, and maximizing productivity during downtime.",
    "description": "Mastery of operational logistics, prioritizing tasks, and maximizing productivity during downtime.",
    "mechanics": "Mastery of operational logistics, prioritizing tasks, and maximizing productivity during downtime.",
    "mechanic": "Mastery of operational logistics, prioritizing tasks, and maximizing productivity during downtime.",
    "rules": "Basic Mental (1 BP).",
    "special_rules": "Basic Mental (1 BP).",
    "modifiers": [],
    "body": "# Time Management\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Mental\n**BP Cost**: 1\n\n## Description\nMastery of operational logistics, prioritizing tasks, and maximizing productivity during downtime.",
    "notes": "[Rule] Basic Mental (1 BP).",
    "notesList": [
      "[Rule] Basic Mental (1 BP)."
    ]
  },
  {
    "id": "trait-toughness",
    "name": "Toughness",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Physical endurance and psychological grit hardened by harsh living conditions.",
    "description": "Physical endurance and psychological grit hardened by harsh living conditions.",
    "mechanics": "Physical endurance and psychological grit hardened by harsh living conditions.",
    "mechanic": "Physical endurance and psychological grit hardened by harsh living conditions.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Toughness\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nPhysical endurance and psychological grit hardened by harsh living conditions.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-trade-tools",
    "name": "Trade Tools",
    "category": "traits",
    "trait_type": "Common Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Standard occupational gear, specialized toolkits, and field equipment.",
    "description": "Standard occupational gear, specialized toolkits, and field equipment.",
    "mechanics": "Standard occupational gear, specialized toolkits, and field equipment.",
    "mechanic": "Standard occupational gear, specialized toolkits, and field equipment.",
    "rules": "Basic Common Occupational Trait (1 BP).",
    "special_rules": "Basic Common Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Trade Tools\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Common Occupational Trait\n**BP Cost**: 1\n\n## Description\nStandard occupational gear, specialized toolkits, and field equipment.",
    "notes": "[Rule] Basic Common Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Common Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-travel",
    "name": "Travel",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Piloting spacecraft, driving ground vehicles, and navigating through unfamiliar terrain   *+2 Piloting and Navigation*  #",
    "description": "Piloting spacecraft, driving ground vehicles, and navigating through unfamiliar terrain   *+2 Piloting and Navigation*  #",
    "mechanics": "Piloting spacecraft, driving ground vehicles, and navigating through unfamiliar terrain   *+2 Piloting and Navigation*  #",
    "mechanic": "Piloting spacecraft, driving ground vehicles, and navigating through unfamiliar terrain   *+2 Piloting and Navigation*  #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Travel\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nPiloting spacecraft, driving ground vehicles, and navigating through unfamiliar terrain   *+2 Piloting and Navigation*  #",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-treespeech",
    "name": "Treespeech",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Ability to converse with plants.",
    "description": "Ability to converse with plants.",
    "mechanics": "Ability to converse with plants.",
    "mechanic": "Ability to converse with plants.",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Treespeech\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nAbility to converse with plants.",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-unpredictability",
    "name": "Unpredictability",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Unpredictable in their actions and decisions, making them both intriguing allies and formidable adversaries   *+2 Initiative* #",
    "description": "Unpredictable in their actions and decisions, making them both intriguing allies and formidable adversaries   *+2 Initiative* #",
    "mechanics": "Unpredictable in their actions and decisions, making them both intriguing allies and formidable adversaries   *+2 Initiative* #",
    "mechanic": "Unpredictable in their actions and decisions, making them both intriguing allies and formidable adversaries   *+2 Initiative* #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [
      {
        "target": "initiative-mod",
        "type": "combat",
        "value": 2,
        "mode": "inherent",
        "description": "+2 Initiative"
      }
    ],
    "body": "# Unpredictability\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nUnpredictable in their actions and decisions, making them both intriguing allies and formidable adversaries   *+2 Initiative* #",
    "notes": "[Modifier] +2 Initiative\n[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Modifier] +2 Initiative",
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-urban-survival",
    "name": "Urban Survival",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Parkour roof-running, subway tunneling, and vanishing into thick metropolitan crowds.",
    "description": "Parkour roof-running, subway tunneling, and vanishing into thick metropolitan crowds.",
    "mechanics": "Parkour roof-running, subway tunneling, and vanishing into thick metropolitan crowds.",
    "mechanic": "Parkour roof-running, subway tunneling, and vanishing into thick metropolitan crowds.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Urban Survival\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nParkour roof-running, subway tunneling, and vanishing into thick metropolitan crowds.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  },
  {
    "id": "trait-urbanite",
    "name": "Urbanite",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "+2 racial bonus on Diplomacy and Sense Motive checks.",
    "description": "+2 racial bonus on Diplomacy and Sense Motive checks.",
    "mechanics": "+2 racial bonus on Diplomacy and Sense Motive checks.",
    "mechanic": "+2 racial bonus on Diplomacy and Sense Motive checks.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Urbanite\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\n+2 racial bonus on Diplomacy and Sense Motive checks.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-vampiric-power",
    "name": "Vampiric Power",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Gain point in Physical Ability per 2 points of Sta drained (Lethal at 3+Sta).",
    "description": "Gain point in Physical Ability per 2 points of Sta drained (Lethal at 3+Sta).",
    "mechanics": "Gain point in Physical Ability per 2 points of Sta drained (Lethal at 3+Sta).",
    "mechanic": "Gain point in Physical Ability per 2 points of Sta drained (Lethal at 3+Sta).",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Vampiric Power\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nGain point in Physical Ability per 2 points of Sta drained (Lethal at 3+Sta).",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-venom",
    "name": "Venom",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Advanced",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Hemotoxic (Str/Sta) / Neurotoxic (Agility/Sensory) / Cytotoxic (Tissue Corrosive)",
    "description": "Hemotoxic (Str/Sta) / Neurotoxic (Agility/Sensory) / Cytotoxic (Tissue Corrosive)",
    "mechanics": "Hemotoxic (Str/Sta) / Neurotoxic (Agility/Sensory) / Cytotoxic (Tissue Corrosive)",
    "mechanic": "Hemotoxic (Str/Sta) / Neurotoxic (Agility/Sensory) / Cytotoxic (Tissue Corrosive)",
    "rules": "Advanced Species Trait (2 BP).",
    "special_rules": "Advanced Species Trait (2 BP).",
    "modifiers": [],
    "body": "# Venom\n\n**Category**: TRAITS\n**Tier**: Advanced\n**Type**: Species Trait\n**BP Cost**: 2\n\n## Description\nHemotoxic (Str/Sta) / Neurotoxic (Agility/Sensory) / Cytotoxic (Tissue Corrosive)",
    "notes": "[Rule] Advanced Species Trait (2 BP).",
    "notesList": [
      "[Rule] Advanced Species Trait (2 BP)."
    ]
  },
  {
    "id": "trait-venues",
    "name": "Venues",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Has strong ties to certain performance venues   *+2 Equipment (Hideout) and +1 Wealth* #",
    "description": "Has strong ties to certain performance venues   *+2 Equipment (Hideout) and +1 Wealth* #",
    "mechanics": "Has strong ties to certain performance venues   *+2 Equipment (Hideout) and +1 Wealth* #",
    "mechanic": "Has strong ties to certain performance venues   *+2 Equipment (Hideout) and +1 Wealth* #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [
      {
        "target": "Wealth",
        "type": "wealth",
        "value": 1,
        "mode": "inherent",
        "description": "+1 Wealth Score"
      }
    ],
    "body": "# Venues\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nHas strong ties to certain performance venues   *+2 Equipment (Hideout) and +1 Wealth* #",
    "notes": "[Modifier] +1 Wealth Score\n[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Modifier] +1 Wealth Score",
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-versatile",
    "name": "Versatile",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Able to operate in a variety of environments, including underwater and in zero-gravity",
    "description": "Able to operate in a variety of environments, including underwater and in zero-gravity",
    "mechanics": "Able to operate in a variety of environments, including underwater and in zero-gravity",
    "mechanic": "Able to operate in a variety of environments, including underwater and in zero-gravity",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Versatile\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nAble to operate in a variety of environments, including underwater and in zero-gravity",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-versatility",
    "name": "Versatility",
    "category": "traits",
    "trait_type": "General",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 2,
    "costs": {
      "bp": 2
    },
    "is_ranked": false,
    "desc": "Adaptable skill set allowing the character to perform a wide variety of tasks without specialized tools or preparation.",
    "description": "Adaptable skill set allowing the character to perform a wide variety of tasks without specialized tools or preparation.",
    "mechanics": "Adaptable skill set allowing the character to perform a wide variety of tasks without specialized tools or preparation.",
    "mechanic": "Adaptable skill set allowing the character to perform a wide variety of tasks without specialized tools or preparation.",
    "rules": "Basic General (2 BP).",
    "special_rules": "Basic General (2 BP).",
    "modifiers": [],
    "body": "# Versatility\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: General\n**BP Cost**: 2\n\n## Description\nAdaptable skill set allowing the character to perform a wide variety of tasks without specialized tools or preparation.",
    "notes": "[Rule] Basic General (2 BP).",
    "notesList": [
      "[Rule] Basic General (2 BP)."
    ]
  },
  {
    "id": "trait-water-sense",
    "name": "Water-Sense",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Blindsense 30 feet against creatures touching the same body of water.",
    "description": "Blindsense 30 feet against creatures touching the same body of water.",
    "mechanics": "Blindsense 30 feet against creatures touching the same body of water.",
    "mechanic": "Blindsense 30 feet against creatures touching the same body of water.",
    "rules": "Basic Species Trait (1 BP).",
    "special_rules": "Basic Species Trait (1 BP).",
    "modifiers": [],
    "body": "# Water-Sense\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Species Trait\n**BP Cost**: 1\n\n## Description\nBlindsense 30 feet against creatures touching the same body of water.",
    "notes": "[Rule] Basic Species Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Species Trait (1 BP)."
    ]
  },
  {
    "id": "trait-well-equipped",
    "name": "Well-Equipped",
    "category": "traits",
    "trait_type": "Occupational Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Equipped with the latest technology and weaponry   *+2 Equipment* #",
    "description": "Equipped with the latest technology and weaponry   *+2 Equipment* #",
    "mechanics": "Equipped with the latest technology and weaponry   *+2 Equipment* #",
    "mechanic": "Equipped with the latest technology and weaponry   *+2 Equipment* #",
    "rules": "Basic Occupational Trait (1 BP).",
    "special_rules": "Basic Occupational Trait (1 BP).",
    "modifiers": [],
    "body": "# Well-Equipped\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Occupational Trait\n**BP Cost**: 1\n\n## Description\nEquipped with the latest technology and weaponry   *+2 Equipment* #",
    "notes": "[Rule] Basic Occupational Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Occupational Trait (1 BP)."
    ]
  },
  {
    "id": "trait-wyrm-senses",
    "name": "Wyrm Senses",
    "category": "traits",
    "trait_type": "Species Trait",
    "trait_tier": "Elite",
    "classification": "Physical",
    "type": "Physical",
    "bp": 4,
    "costs": {
      "bp": 4
    },
    "is_ranked": false,
    "desc": "Take Features from any Acute Sense Line. Req: Dragon Apotheosis.",
    "description": "Take Features from any Acute Sense Line. Req: Dragon Apotheosis.",
    "mechanics": "Take Features from any Acute Sense Line. Req: Dragon Apotheosis.",
    "mechanic": "Take Features from any Acute Sense Line. Req: Dragon Apotheosis.",
    "rules": "Elite Species Trait (4 BP).",
    "special_rules": "Elite Species Trait (4 BP).",
    "modifiers": [],
    "body": "# Wyrm Senses\n\n**Category**: TRAITS\n**Tier**: Elite\n**Type**: Species Trait\n**BP Cost**: 4\n\n## Description\nTake Features from any Acute Sense Line. Req: Dragon Apotheosis.",
    "notes": "[Rule] Elite Species Trait (4 BP).",
    "notesList": [
      "[Rule] Elite Species Trait (4 BP)."
    ]
  },
  {
    "id": "trait-zero-g-acclimation",
    "name": "Zero-G Acclimation",
    "category": "traits",
    "trait_type": "Origin Trait",
    "trait_tier": "Basic",
    "classification": "Physical",
    "type": "Physical",
    "bp": 1,
    "costs": {
      "bp": 1
    },
    "is_ranked": false,
    "desc": "Total bodily familiarity with microgravity, spin gravity, and vacuum suits.",
    "description": "Total bodily familiarity with microgravity, spin gravity, and vacuum suits.",
    "mechanics": "Total bodily familiarity with microgravity, spin gravity, and vacuum suits.",
    "mechanic": "Total bodily familiarity with microgravity, spin gravity, and vacuum suits.",
    "rules": "Basic Origin Trait (1 BP).",
    "special_rules": "Basic Origin Trait (1 BP).",
    "modifiers": [],
    "body": "# Zero-G Acclimation\n\n**Category**: TRAITS\n**Tier**: Basic\n**Type**: Origin Trait\n**BP Cost**: 1\n\n## Description\nTotal bodily familiarity with microgravity, spin gravity, and vacuum suits.",
    "notes": "[Rule] Basic Origin Trait (1 BP).",
    "notesList": [
      "[Rule] Basic Origin Trait (1 BP)."
    ]
  }
];

// DEFAULT_SPECIES_TRAITS contains all traits to ensure 100% resolution across species, origins, and occupations
export const DEFAULT_SPECIES_TRAITS = ALL_CANONICAL_TRAITS;

export const getTraitById = (id) => ALL_CANONICAL_TRAITS.find(t => t.id === id);
