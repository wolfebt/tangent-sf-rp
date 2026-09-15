/**
 * Canonical Features & Traits Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/features/
 * Total Features: 219
 */

export const FEATURE_CATEGORIES = [
  "Ability",
  "Combat",
  "Discipline",
  "Meta",
  "General",
  "Skill",
  "Karma",
  "Special",
  "Physical",
  "Social",
  "Augmentation",
  "Hindrance"
];

export const DEFAULT_FEATURES = [
  {
    "id": "ability-evasiveness",
    "name": "Evasiveness",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Must possess the base Feature for the chosen Save (Lightning Reflexes, Great Fortitude, or Iron Will).",
    "modifiers": [],
    "description": "The character is adept at avoiding the brunt of area attacks or resisting the full efficacy of potent effects.",
    "mechanic": "When subjected to an effect that allows a **Resistance Check** for **Partial Effect** (commonly taking half damage on a success), a successful check instead results in **No Effect** (or zero damage).  \n  * *Usage:* If a dragon breathes fire (Reflex for half), a character with Evasiveness (Reflex) takes *no damage* if they succeed on the roll.",
    "rules": "This feature acts as a **\\[Multiple\\]** selection. You must purchase it separately for Reflex, Fortitude, or Will.",
    "special_rules": "This feature acts as a **\\[Multiple\\]** selection. You must purchase it separately for Reflex, Fortitude, or Will.",
    "body": "# Evasiveness\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Must possess the base Feature for the chosen Save (Lightning Reflexes, Great Fortitude, or Iron Will).\n\n## Description\nThe character is adept at avoiding the brunt of area attacks or resisting the full efficacy of potent effects.\n\n## Mechanics & Benefit\nWhen subjected to an effect that allows a **Resistance Check** for **Partial Effect** (commonly taking half damage on a success), a successful check instead results in **No Effect** (or zero damage).  \n  * *Usage:* If a dragon breathes fire (Reflex for half), a character with Evasiveness (Reflex) takes *no damage* if they succeed on the roll.\n\n## Special Rules\nThis feature acts as a **\\[Multiple\\]** selection. You must purchase it separately for Reflex, Fortitude, or Will.",
    "mechanics": "When subjected to an effect that allows a **Resistance Check** for **Partial Effect** (commonly taking half damage on a success), a successful check instead results in **No Effect** (or zero damage).  \n  * *Usage:* If a dragon breathes fire (Reflex for half), a character with Evasiveness (Reflex) takes *no damage* if they succeed on the roll.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature acts as a **\\[Multiple\\]** selection. You must purchase it separately for Reflex, Forti...\n[Prerequisite] Must possess the base Feature for the chosen Save (Lightning Reflexes, Great Fortitude, or Iron Will).",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature acts as a **\\[Multiple\\]** selection. You must purchase it separately for Reflex, Forti...",
      "[Prerequisite] Must possess the base Feature for the chosen Save (Lightning Reflexes, Great Fortitude, or Iron Will)."
    ]
  },
  {
    "id": "ability-great-fortitude",
    "name": "Great Fortitude",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "Stamina 1",
    "modifiers": [
      {
        "target": "Fortitude",
        "type": "save",
        "value": 2,
        "mode": "inherent",
        "description": "+2 on Fortitude Checks"
      },
      {
        "target": "Tal bonus",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Tal bonus"
      }
    ],
    "description": "Through vigorous conditioning or natural hardiness, the character has developed a profound resistance to physical ailments. Their body fights off toxins and trauma with exceptional efficiency.",
    "mechanic": "Gain a **\\+2 bonus** on all **Fortitude Checks**.  \n  * *Usage:* This applies to resisting poisons, diseases, radiation, physical fatigue, and metabolic hazards.",
    "rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Stamina score. The bonuses stack (e.g., Rank 2 grants a \\+4 total bonus).",
    "special_rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Stamina score. The bonuses stack (e.g., Rank 2 grants a \\+4 total bonus).",
    "body": "# Great Fortitude\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThrough vigorous conditioning or natural hardiness, the character has developed a profound resistance to physical ailments. Their body fights off toxins and trauma with exceptional efficiency.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Fortitude Checks**.  \n  * *Usage:* This applies to resisting poisons, diseases, radiation, physical fatigue, and metabolic hazards.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Stamina score. The bonuses stack (e.g., Rank 2 grants a \\+4 total bonus).",
    "mechanics": "Gain a **\\+2 bonus** on all **Fortitude Checks**.  \n  * *Usage:* This applies to resisting poisons, diseases, radiation, physical fatigue, and metabolic hazards.",
    "notes": "[Modifier] +2 on Fortitude Checks\n[Modifier] +4 to Tal bonus\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...\n[Prerequisite] Stamina 1",
    "notesList": [
      "[Modifier] +2 on Fortitude Checks",
      "[Modifier] +4 to Tal bonus",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...",
      "[Prerequisite] Stamina 1"
    ]
  },
  {
    "id": "ability-improved-evasiveness",
    "name": "Improved Evasiveness",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Evasiveness",
    "modifiers": [],
    "description": "Improved Evasiveness is a Ability Feature: Failed check is still a partial success (resulting in less effect, generally 1/2).",
    "mechanic": "Failed check is still a partial success (resulting in less effect, generally 1/2).",
    "rules": "Prerequisite: Evasiveness.",
    "special_rules": "Prerequisite: Evasiveness.",
    "body": "# Improved Evasiveness\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Evasiveness\n\n## Description\nImproved Evasiveness is a Ability Feature: Failed check is still a partial success (resulting in less effect, generally 1/2).\n\n## Mechanics & Benefit\nFailed check is still a partial success (resulting in less effect, generally 1/2).",
    "mechanics": "Failed check is still a partial success (resulting in less effect, generally 1/2).",
    "notes": "[Rule] Prerequisite: Evasiveness.\n[Prerequisite] Evasiveness",
    "notesList": [
      "[Rule] Prerequisite: Evasiveness.",
      "[Prerequisite] Evasiveness"
    ]
  },
  {
    "id": "ability-improved-tolerance",
    "name": "Improved Tolerance",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Tolerance",
    "modifiers": [],
    "description": "Improved Tolerance is a Ability Feature: Additional Resistance Checks made in 1/4 typical time for most effects.",
    "mechanic": "Additional Resistance Checks made in 1/4 typical time for most effects.",
    "rules": "Prerequisite: Tolerance.",
    "special_rules": "Prerequisite: Tolerance.",
    "body": "# Improved Tolerance\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Tolerance\n\n## Description\nImproved Tolerance is a Ability Feature: Additional Resistance Checks made in 1/4 typical time for most effects.\n\n## Mechanics & Benefit\nAdditional Resistance Checks made in 1/4 typical time for most effects.",
    "mechanics": "Additional Resistance Checks made in 1/4 typical time for most effects.",
    "notes": "[Rule] Prerequisite: Tolerance.\n[Prerequisite] Tolerance",
    "notesList": [
      "[Rule] Prerequisite: Tolerance.",
      "[Prerequisite] Tolerance"
    ]
  },
  {
    "id": "ability-incredible-fortitude",
    "name": "Incredible Fortitude",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Great Fortitude",
    "modifiers": [
      {
        "target": "Fortitude",
        "type": "save_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Fortitude Checks"
      }
    ],
    "description": "Incredible Fortitude is a Ability Feature: Roll Fortitude checks with Advantage",
    "mechanic": "Roll Fortitude checks with Advantage",
    "rules": "Prerequisite: Great Fortitude.",
    "special_rules": "Prerequisite: Great Fortitude.",
    "body": "# Incredible Fortitude\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Great Fortitude\n\n## Description\nIncredible Fortitude is a Ability Feature: Roll Fortitude checks with Advantage\n\n## Mechanics & Benefit\nRoll Fortitude checks with Advantage",
    "mechanics": "Roll Fortitude checks with Advantage",
    "notes": "[Modifier] Advantage on Fortitude Checks\n[Rule] Prerequisite: Great Fortitude.\n[Prerequisite] Great Fortitude",
    "notesList": [
      "[Modifier] Advantage on Fortitude Checks",
      "[Rule] Prerequisite: Great Fortitude.",
      "[Prerequisite] Great Fortitude"
    ]
  },
  {
    "id": "ability-indomitable-will",
    "name": "Indomitable Will",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Iron Will",
    "modifiers": [
      {
        "target": "Will",
        "type": "save_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Will Checks"
      }
    ],
    "description": "Indomitable Will is a Ability Feature: Roll Will checks with Advantage",
    "mechanic": "Roll Will checks with Advantage",
    "rules": "Prerequisite: Iron Will.",
    "special_rules": "Prerequisite: Iron Will.",
    "body": "# Indomitable Will\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Iron Will\n\n## Description\nIndomitable Will is a Ability Feature: Roll Will checks with Advantage\n\n## Mechanics & Benefit\nRoll Will checks with Advantage",
    "mechanics": "Roll Will checks with Advantage",
    "notes": "[Modifier] Advantage on Will Checks\n[Rule] Prerequisite: Iron Will.\n[Prerequisite] Iron Will",
    "notesList": [
      "[Modifier] Advantage on Will Checks",
      "[Rule] Prerequisite: Iron Will.",
      "[Prerequisite] Iron Will"
    ]
  },
  {
    "id": "ability-insightful-reason",
    "name": "Insightful Reason",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "Intellect 1",
    "modifiers": [
      {
        "target": "Logic",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Logic"
      }
    ],
    "description": "The character has a sharp, analytical mind capable of making rapid deductions and seeing through complex deceptions or puzzles.",
    "mechanic": "Gain a **\\+2 bonus** on all **Logic Checks**.  \n  * *Usage:* This applies to solving puzzles, cryptanalysis, deduction, resisting illusions (disbelieving), and navigating complex bureaucratic or logical labyrinths.",
    "rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Intellect score.",
    "special_rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Intellect score.",
    "body": "# Insightful Reason\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Intellect 1\n\n## Description\nThe character has a sharp, analytical mind capable of making rapid deductions and seeing through complex deceptions or puzzles.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Logic Checks**.  \n  * *Usage:* This applies to solving puzzles, cryptanalysis, deduction, resisting illusions (disbelieving), and navigating complex bureaucratic or logical labyrinths.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Intellect score.",
    "mechanics": "Gain a **\\+2 bonus** on all **Logic Checks**.  \n  * *Usage:* This applies to solving puzzles, cryptanalysis, deduction, resisting illusions (disbelieving), and navigating complex bureaucratic or logical labyrinths.",
    "notes": "[Modifier] +2 to Logic\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...\n[Prerequisite] Intellect 1",
    "notesList": [
      "[Modifier] +2 to Logic",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...",
      "[Prerequisite] Intellect 1"
    ]
  },
  {
    "id": "ability-inspired-reason",
    "name": "Inspired Reason",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Insightful Reason",
    "modifiers": [],
    "description": "Inspired Reason is a Ability Feature: Roll Logic checks with Advantage",
    "mechanic": "Roll Logic checks with Advantage",
    "rules": "Prerequisite: Insightful Reason.",
    "special_rules": "Prerequisite: Insightful Reason.",
    "body": "# Inspired Reason\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Insightful Reason\n\n## Description\nInspired Reason is a Ability Feature: Roll Logic checks with Advantage\n\n## Mechanics & Benefit\nRoll Logic checks with Advantage",
    "mechanics": "Roll Logic checks with Advantage",
    "notes": "[Rule] Prerequisite: Insightful Reason.\n[Prerequisite] Insightful Reason",
    "notesList": [
      "[Rule] Prerequisite: Insightful Reason.",
      "[Prerequisite] Insightful Reason"
    ]
  },
  {
    "id": "ability-inspiring-personality",
    "name": "Inspiring Personality",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "Charisma 1",
    "modifiers": [
      {
        "target": "Etiquette",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Etiquette"
      }
    ],
    "description": "The character possesses a magnetic presence or an innate understanding of social dynamics. They navigate social hierarchies and interactions with practiced ease.",
    "mechanic": "Gain a **\\+2 bonus** on all **Etiquette Checks**.  \n  * *Usage:* This applies to making first impressions, avoiding social faux pas, navigating formal gatherings, and interacting with high-status NPCs without causing offense.",
    "rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Charisma score.",
    "special_rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Charisma score.",
    "body": "# Inspiring Personality\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character possesses a magnetic presence or an innate understanding of social dynamics. They navigate social hierarchies and interactions with practiced ease.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Etiquette Checks**.  \n  * *Usage:* This applies to making first impressions, avoiding social faux pas, navigating formal gatherings, and interacting with high-status NPCs without causing offense.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Charisma score.",
    "mechanics": "Gain a **\\+2 bonus** on all **Etiquette Checks**.  \n  * *Usage:* This applies to making first impressions, avoiding social faux pas, navigating formal gatherings, and interacting with high-status NPCs without causing offense.",
    "notes": "[Modifier] +2 to Etiquette\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...\n[Prerequisite] Charisma 1",
    "notesList": [
      "[Modifier] +2 to Etiquette",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...",
      "[Prerequisite] Charisma 1"
    ]
  },
  {
    "id": "ability-iron-will",
    "name": "Iron Will",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "Wisdom 1",
    "modifiers": [
      {
        "target": "Will",
        "type": "save",
        "value": 2,
        "mode": "inherent",
        "description": "+2 on Will Checks"
      }
    ],
    "description": "The character possesses a mind like a fortress. They are stubborn, focused, and resistant to fear, manipulation, or psychological trauma.",
    "mechanic": "Gain a **\\+2 bonus** on all **Will Checks**.  \n  * *Usage:* This applies to resisting Fear effects, Mind Control, Charm, Domination, and psychological torture or intimidation.",
    "rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Wisdom score.",
    "special_rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Wisdom score.",
    "body": "# Iron Will\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character possesses a mind like a fortress. They are stubborn, focused, and resistant to fear, manipulation, or psychological trauma.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Will Checks**.  \n  * *Usage:* This applies to resisting Fear effects, Mind Control, Charm, Domination, and psychological torture or intimidation.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Wisdom score.",
    "mechanics": "Gain a **\\+2 bonus** on all **Will Checks**.  \n  * *Usage:* This applies to resisting Fear effects, Mind Control, Charm, Domination, and psychological torture or intimidation.",
    "notes": "[Modifier] +2 on Will Checks\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Modifier] +2 on Will Checks",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "ability-lightning-reflexes",
    "name": "Lightning Reflexes",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "Agility 1",
    "modifiers": [
      {
        "target": "Reflex",
        "type": "save",
        "value": 2,
        "mode": "inherent",
        "description": "+2 on Reflex Checks"
      }
    ],
    "description": "The character reacts to danger before they are consciously aware of it. Their nerves are wire-taut, allowing them to dodge blasts, catch falling objects, or keep their footing on shifting ground.",
    "mechanic": "Gain a **\\+2 bonus** on all **Reflex Checks**.  \n  * *Usage:* This applies to dodging Area of Effect (AoE) attacks (explosions, breath weapons), maintaining balance, and avoiding sudden traps.",
    "rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Agility score.",
    "special_rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Agility score.",
    "body": "# Lightning Reflexes\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character reacts to danger before they are consciously aware of it. Their nerves are wire-taut, allowing them to dodge blasts, catch falling objects, or keep their footing on shifting ground.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Reflex Checks**.  \n  * *Usage:* This applies to dodging Area of Effect (AoE) attacks (explosions, breath weapons), maintaining balance, and avoiding sudden traps.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Agility score.",
    "mechanics": "Gain a **\\+2 bonus** on all **Reflex Checks**.  \n  * *Usage:* This applies to dodging Area of Effect (AoE) attacks (explosions, breath weapons), maintaining balance, and avoiding sudden traps.",
    "notes": "[Modifier] +2 on Reflex Checks\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...\n[Prerequisite] Agility 1",
    "notesList": [
      "[Modifier] +2 on Reflex Checks",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...",
      "[Prerequisite] Agility 1"
    ]
  },
  {
    "id": "ability-mighty-surge",
    "name": "Mighty Surge",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Potent Might",
    "modifiers": [],
    "description": "Mighty Surge is a Ability Feature: Roll Might checks with Advantage",
    "mechanic": "Roll Might checks with Advantage",
    "rules": "Prerequisite: Potent Might.",
    "special_rules": "Prerequisite: Potent Might.",
    "body": "# Mighty Surge\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Potent Might\n\n## Description\nMighty Surge is a Ability Feature: Roll Might checks with Advantage\n\n## Mechanics & Benefit\nRoll Might checks with Advantage",
    "mechanics": "Roll Might checks with Advantage",
    "notes": "[Rule] Prerequisite: Potent Might.\n[Prerequisite] Potent Might",
    "notesList": [
      "[Rule] Prerequisite: Potent Might.",
      "[Prerequisite] Potent Might"
    ]
  },
  {
    "id": "ability-motivating-persona",
    "name": "Motivating Persona",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Inspiring Personality",
    "modifiers": [],
    "description": "Motivating Persona is a Ability Feature: Roll Etiquette checks with Advantage",
    "mechanic": "Roll Etiquette checks with Advantage",
    "rules": "Prerequisite: Inspiring Personality.",
    "special_rules": "Prerequisite: Inspiring Personality.",
    "body": "# Motivating Persona\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Inspiring Personality\n\n## Description\nMotivating Persona is a Ability Feature: Roll Etiquette checks with Advantage\n\n## Mechanics & Benefit\nRoll Etiquette checks with Advantage",
    "mechanics": "Roll Etiquette checks with Advantage",
    "notes": "[Rule] Prerequisite: Inspiring Personality.\n[Prerequisite] Inspiring Personality",
    "notesList": [
      "[Rule] Prerequisite: Inspiring Personality.",
      "[Prerequisite] Inspiring Personality"
    ]
  },
  {
    "id": "ability-potent-might",
    "name": "Potent Might",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "Strength 1",
    "modifiers": [
      {
        "target": "Might",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Might"
      }
    ],
    "description": "The character knows how to apply their strength for maximum leverage and impact. Whether forcing open a blast door or holding back a crushing weight, they are far more effective than their muscle mass alone suggests.",
    "mechanic": "Gain a **\\+2 bonus** on all **Might Checks**.  \n  * *Usage:* This applies to breaking objects, lifting heavy loads, forcing doors, and resisting physical containment (such as grappling or webs). *Note: This does not apply to Attack or Damage rolls.*",
    "rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Strength score.",
    "special_rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Strength score.",
    "body": "# Potent Might\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Strength 1\n\n## Description\nThe character knows how to apply their strength for maximum leverage and impact. Whether forcing open a blast door or holding back a crushing weight, they are far more effective than their muscle mass alone suggests.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Might Checks**.  \n  * *Usage:* This applies to breaking objects, lifting heavy loads, forcing doors, and resisting physical containment (such as grappling or webs). *Note: This does not apply to Attack or Damage rolls.*\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Strength score.",
    "mechanics": "Gain a **\\+2 bonus** on all **Might Checks**.  \n  * *Usage:* This applies to breaking objects, lifting heavy loads, forcing doors, and resisting physical containment (such as grappling or webs). *Note: This does not apply to Attack or Damage rolls.*",
    "notes": "[Modifier] +2 to Might\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...\n[Prerequisite] Strength 1",
    "notesList": [
      "[Modifier] +2 to Might",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...",
      "[Prerequisite] Strength 1"
    ]
  },
  {
    "id": "ability-superb-reflexes",
    "name": "Superb Reflexes",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Lightning Reflexes",
    "modifiers": [
      {
        "target": "Reflex",
        "type": "save_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Reflex Checks"
      }
    ],
    "description": "Superb Reflexes is a Ability Feature: Roll Reflex checks with Advantage",
    "mechanic": "Roll Reflex checks with Advantage",
    "rules": "Prerequisite: Lightning Reflexes.",
    "special_rules": "Prerequisite: Lightning Reflexes.",
    "body": "# Superb Reflexes\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Lightning Reflexes\n\n## Description\nSuperb Reflexes is a Ability Feature: Roll Reflex checks with Advantage\n\n## Mechanics & Benefit\nRoll Reflex checks with Advantage",
    "mechanics": "Roll Reflex checks with Advantage",
    "notes": "[Modifier] Advantage on Reflex Checks\n[Rule] Prerequisite: Lightning Reflexes.\n[Prerequisite] Lightning Reflexes",
    "notesList": [
      "[Modifier] Advantage on Reflex Checks",
      "[Rule] Prerequisite: Lightning Reflexes.",
      "[Prerequisite] Lightning Reflexes"
    ]
  },
  {
    "id": "ability-tolerance",
    "name": "Tolerance",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Stamina 1 (for Physical) or Wisdom 1 (for Mental).",
    "modifiers": [],
    "description": "The character's metabolism or psyche processes ongoing trauma much faster than the average being.",
    "mechanic": "When suffering from an ongoing effect (such as poison, disease, paralysis, or mental domination) that allows periodic Resistance Checks to end the effect (e.g., \"save every minute\"), the time interval between checks is reduced to **1/2 the typical time**.  \n  * *Usage:* A poison that normally allows a save once per hour allows this character to save every 30 minutes.",
    "rules": "This feature acts as a **\\[Multiple\\]** selection. You must choose Physical Tolerance (Fortitude) or Mental Tolerance (Will).",
    "special_rules": "This feature acts as a **\\[Multiple\\]** selection. You must choose Physical Tolerance (Fortitude) or Mental Tolerance (Will).",
    "body": "# Tolerance\n\n**Category**: Ability Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Stamina 1 (for Physical) or Wisdom 1 (for Mental).\n\n## Description\nThe character's metabolism or psyche processes ongoing trauma much faster than the average being.\n\n## Mechanics & Benefit\nWhen suffering from an ongoing effect (such as poison, disease, paralysis, or mental domination) that allows periodic Resistance Checks to end the effect (e.g., \"save every minute\"), the time interval between checks is reduced to **1/2 the typical time**.  \n  * *Usage:* A poison that normally allows a save once per hour allows this character to save every 30 minutes.\n\n## Special Rules\nThis feature acts as a **\\[Multiple\\]** selection. You must choose Physical Tolerance (Fortitude) or Mental Tolerance (Will).",
    "mechanics": "When suffering from an ongoing effect (such as poison, disease, paralysis, or mental domination) that allows periodic Resistance Checks to end the effect (e.g., \"save every minute\"), the time interval between checks is reduced to **1/2 the typical time**.  \n  * *Usage:* A poison that normally allows a save once per hour allows this character to save every 30 minutes.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature acts as a **\\[Multiple\\]** selection. You must choose Physical Tolerance (Fortitude) or...\n[Prerequisite] Stamina 1 (for Physical) or Wisdom 1 (for Mental).",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature acts as a **\\[Multiple\\]** selection. You must choose Physical Tolerance (Fortitude) or...",
      "[Prerequisite] Stamina 1 (for Physical) or Wisdom 1 (for Mental)."
    ]
  },
  {
    "id": "combat-agile-wrestling",
    "name": "Agile Wrestling",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1, Unarmed Combat 1",
    "modifiers": [],
    "description": "The character utilizes leverage, flexibility, and technique rather than brute force to control opponents in close quarters.",
    "mechanic": "You may use your **Agility** modifier instead of your Strength modifier when making Grapple Checks (both to initiate and maintain a grapple).",
    "rules": "This applies to the grapple check only; damage dealt while grappling is still calculated using Strength unless another feature modifies it.",
    "special_rules": "This applies to the grapple check only; damage dealt while grappling is still calculated using Strength unless another feature modifies it.",
    "body": "# Agile Wrestling\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 1, Unarmed Combat 1\n\n## Description\nThe character utilizes leverage, flexibility, and technique rather than brute force to control opponents in close quarters.\n\n## Mechanics & Benefit\nYou may use your **Agility** modifier instead of your Strength modifier when making Grapple Checks (both to initiate and maintain a grapple).\n\n## Special Rules\nThis applies to the grapple check only; damage dealt while grappling is still calculated using Strength unless another feature modifies it.",
    "mechanics": "You may use your **Agility** modifier instead of your Strength modifier when making Grapple Checks (both to initiate and maintain a grapple).",
    "notes": "[Rule] This applies to the grapple check only; damage dealt while grappling is still calculated using Stren...\n[Prerequisite] Agility 1, Unarmed Combat 1",
    "notesList": [
      "[Rule] This applies to the grapple check only; damage dealt while grappling is still calculated using Stren...",
      "[Prerequisite] Agility 1, Unarmed Combat 1"
    ]
  },
  {
    "id": "combat-ambidextrous",
    "name": "Ambidextrous",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 2",
    "modifiers": [],
    "description": "The character is naturally gifted or intensely trained to use both hands with equal proficiency.",
    "mechanic": "You suffer no penalties for using your off-hand. This eliminates the standard penalty for using a weapon in the secondary hand.",
    "rules": "Prerequisite: Agility 2.",
    "special_rules": "Prerequisite: Agility 2.",
    "body": "# Ambidextrous\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 2\n\n## Description\nThe character is naturally gifted or intensely trained to use both hands with equal proficiency.\n\n## Mechanics & Benefit\nYou suffer no penalties for using your off-hand. This eliminates the standard penalty for using a weapon in the secondary hand.",
    "mechanics": "You suffer no penalties for using your off-hand. This eliminates the standard penalty for using a weapon in the secondary hand.",
    "notes": "[Rule] Prerequisite: Agility 2.\n[Prerequisite] Agility 2",
    "notesList": [
      "[Rule] Prerequisite: Agility 2.",
      "[Prerequisite] Agility 2"
    ]
  },
  {
    "id": "combat-blind-fight",
    "name": "Blind-Fight",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awareness 1",
    "modifiers": [],
    "description": "The character has learned to fight using auditory cues, air pressure, and instinct, allowing them to engage unseen enemies.",
    "mechanic": "When fighting a target that is concealed, invisible, or obscured (darkness/fog), you may roll your Strike check with **Advantage** to counter the miss chance or penalty usually imposed by the concealment.",
    "rules": "You do not lose your Agility bonus to Defense when attacked by an invisible attacker in melee.",
    "special_rules": "You do not lose your Agility bonus to Defense when attacked by an invisible attacker in melee.",
    "body": "# Blind-Fight\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Awareness 1\n\n## Description\nThe character has learned to fight using auditory cues, air pressure, and instinct, allowing them to engage unseen enemies.\n\n## Mechanics & Benefit\nWhen fighting a target that is concealed, invisible, or obscured (darkness/fog), you may roll your Strike check with **Advantage** to counter the miss chance or penalty usually imposed by the concealment.\n\n## Special Rules\nYou do not lose your Agility bonus to Defense when attacked by an invisible attacker in melee.",
    "mechanics": "When fighting a target that is concealed, invisible, or obscured (darkness/fog), you may roll your Strike check with **Advantage** to counter the miss chance or penalty usually imposed by the concealment.",
    "notes": "[Rule] You do not lose your Agility bonus to Defense when attacked by an invisible attacker in melee.\n[Prerequisite] Awareness 1",
    "notesList": [
      "[Rule] You do not lose your Agility bonus to Defense when attacked by an invisible attacker in melee.",
      "[Prerequisite] Awareness 1"
    ]
  },
  {
    "id": "combat-blockade",
    "name": "Blockade",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Strength 2",
    "modifiers": [],
    "description": "The character dominates the space around them, making it impossible for enemies to slip by without engaging.",
    "mechanic": "Enemies cannot move through your threatened area or move past you without engaging in a contest of Strength (Opposed Might Check). If they fail, their movement ends immediately in the square adjacent to you.",
    "rules": "Prerequisite: Strength 2.",
    "special_rules": "Prerequisite: Strength 2.",
    "body": "# Blockade\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Strength 2\n\n## Description\nThe character dominates the space around them, making it impossible for enemies to slip by without engaging.\n\n## Mechanics & Benefit\nEnemies cannot move through your threatened area or move past you without engaging in a contest of Strength (Opposed Might Check). If they fail, their movement ends immediately in the square adjacent to you.",
    "mechanics": "Enemies cannot move through your threatened area or move past you without engaging in a contest of Strength (Opposed Might Check). If they fail, their movement ends immediately in the square adjacent to you.",
    "notes": "[Rule] Prerequisite: Strength 2.\n[Prerequisite] Strength 2",
    "notesList": [
      "[Rule] Prerequisite: Strength 2.",
      "[Prerequisite] Strength 2"
    ]
  },
  {
    "id": "combat-burst-attack",
    "name": "Burst Attack",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Ballistic, Energy, or Heavy Weapon Skill Rank 2",
    "modifiers": [],
    "description": "The character is trained in controlling the recoil and spray of automatic weaponry to maximize accuracy or saturation.",
    "mechanic": "Reduces the penalty for Auto-Fire modes by 2\\.  \n  * **Short Burst:** When firing a Short Burst (3 rounds), you gain **\\+2 Strike** (normally \\+1).  \n  * **Spray:** You reduce the penalty for wide-angle spraying.",
    "rules": "Ballistic, Energy, or Heavy Weapon 22",
    "special_rules": "Ballistic, Energy, or Heavy Weapon 22",
    "body": "# Burst Attack\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Ballistic, Energy, or Heavy Weapon Skill Rank 2\n\n## Description\nThe character is trained in controlling the recoil and spray of automatic weaponry to maximize accuracy or saturation.\n\n## Mechanics & Benefit\nReduces the penalty for Auto-Fire modes by 2\\.  \n  * **Short Burst:** When firing a Short Burst (3 rounds), you gain **\\+2 Strike** (normally \\+1).  \n  * **Spray:** You reduce the penalty for wide-angle spraying.\n\n## Special Rules\nBallistic, Energy, or Heavy Weapon 22",
    "mechanics": "Reduces the penalty for Auto-Fire modes by 2\\.  \n  * **Short Burst:** When firing a Short Burst (3 rounds), you gain **\\+2 Strike** (normally \\+1).  \n  * **Spray:** You reduce the penalty for wide-angle spraying.",
    "notes": "[Rule] Ballistic, Energy, or Heavy Weapon 22\n[Prerequisite] Ballistic, Energy, or Heavy Weapon Skill Rank 2",
    "notesList": [
      "[Rule] Ballistic, Energy, or Heavy Weapon 22",
      "[Prerequisite] Ballistic, Energy, or Heavy Weapon Skill Rank 2"
    ]
  },
  {
    "id": "combat-channel-smite",
    "name": "Channel Smite",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awakened (Energy), Attune 1",
    "modifiers": [],
    "description": "A technique often used by battle-mages or paladins, channeling raw metaphysical energy through a physical vessel.",
    "mechanic": "As a Standard Action, you may cast a touch-range Invocation (Spell) and deliver it through a melee weapon attack. If the melee attack hits, the target suffers the weapon damage *plus* the effect of the Invocation.",
    "rules": "If the attack misses, the Invocation energy is dissipated and lost.",
    "special_rules": "If the attack misses, the Invocation energy is dissipated and lost.",
    "body": "# Channel Smite\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Awakened (Energy), Attune 1\n\n## Description\nA technique often used by battle-mages or paladins, channeling raw metaphysical energy through a physical vessel.\n\n## Mechanics & Benefit\nAs a Standard Action, you may cast a touch-range Invocation (Spell) and deliver it through a melee weapon attack. If the melee attack hits, the target suffers the weapon damage *plus* the effect of the Invocation.\n\n## Special Rules\nIf the attack misses, the Invocation energy is dissipated and lost.",
    "mechanics": "As a Standard Action, you may cast a touch-range Invocation (Spell) and deliver it through a melee weapon attack. If the melee attack hits, the target suffers the weapon damage *plus* the effect of the Invocation.",
    "notes": "[Rule] If the attack misses, the Invocation energy is dissipated and lost.\n[Prerequisite] Awakened (Energy), Attune 1",
    "notesList": [
      "[Rule] If the attack misses, the Invocation energy is dissipated and lost.",
      "[Prerequisite] Awakened (Energy), Attune 1"
    ]
  },
  {
    "id": "combat-combat-casting",
    "name": "Combat Casting",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Attune 1",
    "modifiers": [
      {
        "target": "Concentration",
        "type": "save",
        "value": 4,
        "mode": "inherent",
        "description": "+4 on Concentration Checks"
      },
      {
        "target": "Concentration",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Concentration"
      }
    ],
    "description": "The character is trained to focus on metaphysical weaving even in the chaos of melee.",
    "mechanic": "You gain a **\\+4 bonus** to Defense against Attacks of Opportunity caused by casting or using Invocations in a threatened square. You also gain a \\+4 bonus to Concentration checks to maintain powers when taking damage.",
    "rules": "24",
    "special_rules": "24",
    "body": "# Combat Casting\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Attune 1\n\n## Description\nThe character is trained to focus on metaphysical weaving even in the chaos of melee.\n\n## Mechanics & Benefit\nYou gain a **\\+4 bonus** to Defense against Attacks of Opportunity caused by casting or using Invocations in a threatened square. You also gain a \\+4 bonus to Concentration checks to maintain powers when taking damage.\n\n## Special Rules\n24",
    "mechanics": "You gain a **\\+4 bonus** to Defense against Attacks of Opportunity caused by casting or using Invocations in a threatened square. You also gain a \\+4 bonus to Concentration checks to maintain powers when taking damage.",
    "notes": "[Modifier] +4 on Concentration Checks\n[Modifier] +4 to Concentration\n[Rule] 24\n[Prerequisite] Attune 1",
    "notesList": [
      "[Modifier] +4 on Concentration Checks",
      "[Modifier] +4 to Concentration",
      "[Rule] 24",
      "[Prerequisite] Attune 1"
    ]
  },
  {
    "id": "combat-combat-expertise",
    "name": "Combat Expertise",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intellect 2",
    "modifiers": [],
    "description": "The character fights with superior tactical caution, sacrificing aggression for protection.",
    "mechanic": "When you declare an attack action, you may choose a number up to your Combat Skill Rank. Subtract that number from your **Strike** (Attack) and add it to your **Defense** until the start of your next turn.",
    "rules": "You forfeit any bonus attacks from high skill or other features when using this action; you make one strike per target.",
    "special_rules": "You forfeit any bonus attacks from high skill or other features when using this action; you make one strike per target.",
    "body": "# Combat Expertise\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Intellect 2\n\n## Description\nThe character fights with superior tactical caution, sacrificing aggression for protection.\n\n## Mechanics & Benefit\nWhen you declare an attack action, you may choose a number up to your Combat Skill Rank. Subtract that number from your **Strike** (Attack) and add it to your **Defense** until the start of your next turn.\n\n## Special Rules\nYou forfeit any bonus attacks from high skill or other features when using this action; you make one strike per target.",
    "mechanics": "When you declare an attack action, you may choose a number up to your Combat Skill Rank. Subtract that number from your **Strike** (Attack) and add it to your **Defense** until the start of your next turn.",
    "notes": "[Rule] You forfeit any bonus attacks from high skill or other features when using this action; you make one...\n[Prerequisite] Intellect 2",
    "notesList": [
      "[Rule] You forfeit any bonus attacks from high skill or other features when using this action; you make one...",
      "[Prerequisite] Intellect 2"
    ]
  },
  {
    "id": "combat-combat-reflexes",
    "name": "Combat Reflexes",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1",
    "modifiers": [],
    "description": "The character has exceptional peripheral awareness and reaction time, preventing enemies from exploiting blind spots.",
    "mechanic": "You cannot be **Flanked**. Enemies gain no bonus to Strike for positioning on opposite sides of you, and Sneak Attacks that rely on Flanking (but not Flat-Footed) fail to trigger.",
    "rules": "33",
    "special_rules": "33",
    "body": "# Combat Reflexes\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character has exceptional peripheral awareness and reaction time, preventing enemies from exploiting blind spots.\n\n## Mechanics & Benefit\nYou cannot be **Flanked**. Enemies gain no bonus to Strike for positioning on opposite sides of you, and Sneak Attacks that rely on Flanking (but not Flat-Footed) fail to trigger.\n\n## Special Rules\n33",
    "mechanics": "You cannot be **Flanked**. Enemies gain no bonus to Strike for positioning on opposite sides of you, and Sneak Attacks that rely on Flanking (but not Flat-Footed) fail to trigger.",
    "notes": "[Rule] 33\n[Prerequisite] Agility 1",
    "notesList": [
      "[Rule] 33",
      "[Prerequisite] Agility 1"
    ]
  },
  {
    "id": "combat-combat-skill-focus",
    "name": "Combat Skill Focus",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Chosen Skill 1",
    "modifiers": [],
    "description": "Combat Skill Focus is a Combat Feature: Bonus of +2 and may be purchased per skill stage.",
    "mechanic": "Bonus of \\+2 and may be purchased per skill stage.",
    "rules": "Multiple 34",
    "special_rules": "Multiple 34",
    "body": "# Combat Skill Focus\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Chosen Skill 1\n\n## Description\nCombat Skill Focus is a Combat Feature: Bonus of \\+2 and may be purchased per skill stage.\n\n## Mechanics & Benefit\nBonus of \\+2 and may be purchased per skill stage.\n\n## Special Rules\nMultiple 34",
    "mechanics": "Bonus of \\+2 and may be purchased per skill stage.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Multiple 34\n[Prerequisite] Chosen Skill 1",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Multiple 34",
      "[Prerequisite] Chosen Skill 1"
    ]
  },
  {
    "id": "combat-combat-specialist",
    "name": "Combat Specialist",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Combat Skill 6 (Trained)",
    "modifiers": [],
    "description": "The character knows how to inflict maximum trauma with a specific class of weaponry.",
    "mechanic": "Increase the **Damage Die type** of one specific weapon group by one step (e.g., d6 becomes d8, d8 becomes d10).",
    "rules": "\\[Multiple\\] May be taken for different weapon groups.",
    "special_rules": "\\[Multiple\\] May be taken for different weapon groups.",
    "body": "# Combat Specialist\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Combat Skill 6 (Trained)\n\n## Description\nThe character knows how to inflict maximum trauma with a specific class of weaponry.\n\n## Mechanics & Benefit\nIncrease the **Damage Die type** of one specific weapon group by one step (e.g., d6 becomes d8, d8 becomes d10).\n\n## Special Rules\n\\[Multiple\\] May be taken for different weapon groups.",
    "mechanics": "Increase the **Damage Die type** of one specific weapon group by one step (e.g., d6 becomes d8, d8 becomes d10).",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Multiple\\] May be taken for different weapon groups.\n[Prerequisite] Combat Skill 6 (Trained)",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] \\[Multiple\\] May be taken for different weapon groups.",
      "[Prerequisite] Combat Skill 6 (Trained)"
    ]
  },
  {
    "id": "combat-crushing-blow",
    "name": "Crushing Blow",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "-",
    "modifiers": [],
    "description": "Crushing Blow is a Combat Feature: Reduce opponent's AC.",
    "mechanic": "Reduce opponent's AC.",
    "rules": "36",
    "special_rules": "36",
    "body": "# Crushing Blow\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: \\-\n\n## Description\nCrushing Blow is a Combat Feature: Reduce opponent's AC.\n\n## Mechanics & Benefit\nReduce opponent's AC.\n\n## Special Rules\n36",
    "mechanics": "Reduce opponent's AC.",
    "notes": "[Rule] 36\n[Prerequisite] -",
    "notesList": [
      "[Rule] 36",
      "[Prerequisite] -"
    ]
  },
  {
    "id": "combat-dead-aim",
    "name": "Dead Aim",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Wisdom 3, Ranged 6",
    "modifiers": [
      {
        "target": "Strike with Ranged Weapons",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Strike with Ranged Weapons"
      }
    ],
    "description": "The character trades mobility for extreme precision.",
    "mechanic": "If you do not move during your turn, you gain a **\\+2 bonus to Strike** with Ranged Weapons. This stacks with Aiming actions.",
    "rules": "37",
    "special_rules": "37",
    "body": "# Dead Aim\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Wisdom 3, Ranged 6\n\n## Description\nThe character trades mobility for extreme precision.\n\n## Mechanics & Benefit\nIf you do not move during your turn, you gain a **\\+2 bonus to Strike** with Ranged Weapons. This stacks with Aiming actions.\n\n## Special Rules\n37",
    "mechanics": "If you do not move during your turn, you gain a **\\+2 bonus to Strike** with Ranged Weapons. This stacks with Aiming actions.",
    "notes": "[Modifier] +2 to Strike with Ranged Weapons\n[Rule] 37\n[Prerequisite] Wisdom 3, Ranged 6",
    "notesList": [
      "[Modifier] +2 to Strike with Ranged Weapons",
      "[Rule] 37",
      "[Prerequisite] Wisdom 3, Ranged 6"
    ]
  },
  {
    "id": "combat-defensive-combat-training",
    "name": "Defensive Combat Training",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Combat Skill 1",
    "modifiers": [],
    "description": "The character has trained to resist grappling and takedowns, using overall combat experience rather than just raw agility.",
    "mechanic": "You gain a **\\+4 Bonus to Defense** specifically against Combat Maneuvers (Trip, Disarm, Grapple, Bull Rush).",
    "rules": "38",
    "special_rules": "38",
    "body": "# Defensive Combat Training\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Combat Skill 1\n\n## Description\nThe character has trained to resist grappling and takedowns, using overall combat experience rather than just raw agility.\n\n## Mechanics & Benefit\nYou gain a **\\+4 Bonus to Defense** specifically against Combat Maneuvers (Trip, Disarm, Grapple, Bull Rush).\n\n## Special Rules\n38",
    "mechanics": "You gain a **\\+4 Bonus to Defense** specifically against Combat Maneuvers (Trip, Disarm, Grapple, Bull Rush).",
    "notes": "[Rule] 38\n[Prerequisite] Combat Skill 1",
    "notesList": [
      "[Rule] 38",
      "[Prerequisite] Combat Skill 1"
    ]
  },
  {
    "id": "combat-deflect-arrows",
    "name": "Deflect Arrows",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 2, Unarmed 1",
    "modifiers": [],
    "description": "The character can knock aside projectiles with a weapon or free hand.",
    "mechanic": "Once per round, when you would normally be hit by a ranged weapon attack, you may make a Reflex Save (DC equal to the Attack Roll). If successful, you deflect the projectile and take **no damage**. You must be aware of the attack and not flat-footed.",
    "rules": "39",
    "special_rules": "39",
    "body": "# Deflect Arrows\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 2, Unarmed 1\n\n## Description\nThe character can knock aside projectiles with a weapon or free hand.\n\n## Mechanics & Benefit\nOnce per round, when you would normally be hit by a ranged weapon attack, you may make a Reflex Save (DC equal to the Attack Roll). If successful, you deflect the projectile and take **no damage**. You must be aware of the attack and not flat-footed.\n\n## Special Rules\n39",
    "mechanics": "Once per round, when you would normally be hit by a ranged weapon attack, you may make a Reflex Save (DC equal to the Attack Roll). If successful, you deflect the projectile and take **no damage**. You must be aware of the attack and not flat-footed.",
    "notes": "[Rule] 39\n[Prerequisite] Agility 2, Unarmed 1",
    "notesList": [
      "[Rule] 39",
      "[Prerequisite] Agility 2, Unarmed 1"
    ]
  },
  {
    "id": "combat-dodge",
    "name": "Dodge",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1",
    "modifiers": [],
    "description": "The character is adept at dodging blows.",
    "mechanic": "Gain a **\\+1 Dodge bonus to Defense**.",
    "rules": "Dodge bonuses stack with other Dodge bonuses (but not with themselves). This bonus is lost if you are Flat-Footed.",
    "special_rules": "Dodge bonuses stack with other Dodge bonuses (but not with themselves). This bonus is lost if you are Flat-Footed.",
    "body": "# Dodge\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character is adept at dodging blows.\n\n## Mechanics & Benefit\nGain a **\\+1 Dodge bonus to Defense**.\n\n## Special Rules\nDodge bonuses stack with other Dodge bonuses (but not with themselves). This bonus is lost if you are Flat-Footed.",
    "mechanics": "Gain a **\\+1 Dodge bonus to Defense**.",
    "notes": "[Rule] Dodge bonuses stack with other Dodge bonuses (but not with themselves). This bonus is lost if you ar...\n[Prerequisite] Agility 1",
    "notesList": [
      "[Rule] Dodge bonuses stack with other Dodge bonuses (but not with themselves). This bonus is lost if you ar...",
      "[Prerequisite] Agility 1"
    ]
  },
  {
    "id": "combat-double-slice",
    "name": "Double Slice",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Two-Weapon Fighting",
    "modifiers": [],
    "description": "Double Slice is a Combat Feature: Add your Str bonus to off-hand damage rolls.",
    "mechanic": "Add your Str bonus to off-hand damage rolls.",
    "rules": "43",
    "special_rules": "43",
    "body": "# Double Slice\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Two-Weapon Fighting\n\n## Description\nDouble Slice is a Combat Feature: Add your Str bonus to off-hand damage rolls.\n\n## Mechanics & Benefit\nAdd your Str bonus to off-hand damage rolls.\n\n## Special Rules\n43",
    "mechanics": "Add your Str bonus to off-hand damage rolls.",
    "notes": "[Rule] 43\n[Prerequisite] Two-Weapon Fighting",
    "notesList": [
      "[Rule] 43",
      "[Prerequisite] Two-Weapon Fighting"
    ]
  },
  {
    "id": "combat-greater-disarm",
    "name": "Greater Disarm",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Improved Disarm",
    "modifiers": [],
    "description": "Greater Disarm is a Combat Feature: Disarmed weapons are knocked away from your enemy.",
    "mechanic": "Disarmed weapons are knocked away from your enemy.",
    "rules": "27",
    "special_rules": "27",
    "body": "# Greater Disarm\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Improved Disarm\n\n## Description\nGreater Disarm is a Combat Feature: Disarmed weapons are knocked away from your enemy.\n\n## Mechanics & Benefit\nDisarmed weapons are knocked away from your enemy.\n\n## Special Rules\n27",
    "mechanics": "Disarmed weapons are knocked away from your enemy.",
    "notes": "[Rule] 27\n[Prerequisite] Improved Disarm",
    "notesList": [
      "[Rule] 27",
      "[Prerequisite] Improved Disarm"
    ]
  },
  {
    "id": "combat-greater-feint",
    "name": "Greater Feint",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Improved Feint",
    "modifiers": [],
    "description": "Greater Feint is a Combat Feature: Enemies you feint lose their Agi bonus for 1 round.",
    "mechanic": "Enemies you feint lose their Agi bonus for 1 round.",
    "rules": "29",
    "special_rules": "29",
    "body": "# Greater Feint\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Improved Feint\n\n## Description\nGreater Feint is a Combat Feature: Enemies you feint lose their Agi bonus for 1 round.\n\n## Mechanics & Benefit\nEnemies you feint lose their Agi bonus for 1 round.\n\n## Special Rules\n29",
    "mechanics": "Enemies you feint lose their Agi bonus for 1 round.",
    "notes": "[Rule] 29\n[Prerequisite] Improved Feint",
    "notesList": [
      "[Rule] 29",
      "[Prerequisite] Improved Feint"
    ]
  },
  {
    "id": "combat-greater-trip",
    "name": "Greater Trip",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Improved Trip",
    "modifiers": [],
    "description": "Greater Trip is a Combat Feature: Enemies you trip provoke attacks of opportunity.",
    "mechanic": "Enemies you trip provoke attacks of opportunity.",
    "rules": "31",
    "special_rules": "31",
    "body": "# Greater Trip\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Improved Trip\n\n## Description\nGreater Trip is a Combat Feature: Enemies you trip provoke attacks of opportunity.\n\n## Mechanics & Benefit\nEnemies you trip provoke attacks of opportunity.\n\n## Special Rules\n31",
    "mechanics": "Enemies you trip provoke attacks of opportunity.",
    "notes": "[Rule] 31\n[Prerequisite] Improved Trip",
    "notesList": [
      "[Rule] 31",
      "[Prerequisite] Improved Trip"
    ]
  },
  {
    "id": "combat-greater-two-weapon-defense",
    "name": "Greater Two-Weapon Defense",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Grtr. Two-Weapon Fighting",
    "modifiers": [],
    "description": "Greater Two-Weapon Defense is a Combat Feature: +3 shield bonus to defense when fighting with two weapons.",
    "mechanic": "\\+3 shield bonus to defense when fighting with two weapons.",
    "rules": "49",
    "special_rules": "49",
    "body": "# Greater Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Grtr. Two-Weapon Fighting\n\n## Description\nGreater Two-Weapon Defense is a Combat Feature: \\+3 shield bonus to defense when fighting with two weapons.\n\n## Mechanics & Benefit\n\\+3 shield bonus to defense when fighting with two weapons.\n\n## Special Rules\n49",
    "mechanics": "\\+3 shield bonus to defense when fighting with two weapons.",
    "notes": "[Rule] 49\n[Prerequisite] Grtr. Two-Weapon Fighting",
    "notesList": [
      "[Rule] 49",
      "[Prerequisite] Grtr. Two-Weapon Fighting"
    ]
  },
  {
    "id": "combat-greater-two-weapon-fighting",
    "name": "Greater Two-Weapon Fighting",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agi 4, Skill 11",
    "modifiers": [],
    "description": "Greater Two-Weapon Fighting is a Combat Feature: Gain a third off-hand attack.",
    "mechanic": "Gain a third off-hand attack.",
    "rules": "45",
    "special_rules": "45",
    "body": "# Greater Two-Weapon Fighting\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agi 4, Skill 11\n\n## Description\nGreater Two-Weapon Fighting is a Combat Feature: Gain a third off-hand attack.\n\n## Mechanics & Benefit\nGain a third off-hand attack.\n\n## Special Rules\n45",
    "mechanics": "Gain a third off-hand attack.",
    "notes": "[Rule] 45\n[Prerequisite] Agi 4, Skill 11",
    "notesList": [
      "[Rule] 45",
      "[Prerequisite] Agi 4, Skill 11"
    ]
  },
  {
    "id": "combat-greater-vital-strike",
    "name": "Greater Vital Strike",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Improved Vital Strike, Skill 16",
    "modifiers": [],
    "description": "Greater Vital Strike is a Combat Feature: Deal four times the normal damage on a single attack.",
    "mechanic": "Deal four times the normal damage on a single attack.",
    "rules": "54",
    "special_rules": "54",
    "body": "# Greater Vital Strike\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Improved Vital Strike, Skill 16\n\n## Description\nGreater Vital Strike is a Combat Feature: Deal four times the normal damage on a single attack.\n\n## Mechanics & Benefit\nDeal four times the normal damage on a single attack.\n\n## Special Rules\n54",
    "mechanics": "Deal four times the normal damage on a single attack.",
    "notes": "[Rule] 54\n[Prerequisite] Improved Vital Strike, Skill 16",
    "notesList": [
      "[Rule] 54",
      "[Prerequisite] Improved Vital Strike, Skill 16"
    ]
  },
  {
    "id": "combat-grtr-weapon-specialization",
    "name": "Grtr. Weapon Specialization",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Imp. Weapon Spec, Skill 16",
    "modifiers": [],
    "description": "Grtr. Weapon Specialization is a Combat Feature: +3d damage with one weapon type.",
    "mechanic": "\\+3d damage with one weapon type.",
    "rules": "59",
    "special_rules": "59",
    "body": "# Grtr. Weapon Specialization\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Imp. Weapon Spec, Skill 16\n\n## Description\nGrtr. Weapon Specialization is a Combat Feature: \\+3d damage with one weapon type.\n\n## Mechanics & Benefit\n\\+3d damage with one weapon type.\n\n## Special Rules\n59",
    "mechanics": "\\+3d damage with one weapon type.",
    "notes": "[Rule] 59\n[Prerequisite] Imp. Weapon Spec, Skill 16",
    "notesList": [
      "[Rule] 59",
      "[Prerequisite] Imp. Weapon Spec, Skill 16"
    ]
  },
  {
    "id": "combat-imp-weapon-specialization",
    "name": "Imp. Weapon Specialization",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Weapon Spec, Skill 11",
    "modifiers": [],
    "description": "Imp. Weapon Specialization is a Combat Feature: +2d damage with one weapon type.",
    "mechanic": "\\+2d damage with one weapon type.",
    "rules": "58",
    "special_rules": "58",
    "body": "# Imp. Weapon Specialization\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Weapon Spec, Skill 11\n\n## Description\nImp. Weapon Specialization is a Combat Feature: \\+2d damage with one weapon type.\n\n## Mechanics & Benefit\n\\+2d damage with one weapon type.\n\n## Special Rules\n58",
    "mechanics": "\\+2d damage with one weapon type.",
    "notes": "[Rule] 58\n[Prerequisite] Weapon Spec, Skill 11",
    "notesList": [
      "[Rule] 58",
      "[Prerequisite] Weapon Spec, Skill 11"
    ]
  },
  {
    "id": "combat-improved-disarm",
    "name": "Improved Disarm",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Combat Expertise",
    "modifiers": [
      {
        "target": "Disarm attempts",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Disarm attempts"
      }
    ],
    "description": "Improved Disarm is a Combat Feature: +2 bonus on disarm attempts, no attack of opportunity.",
    "mechanic": "\\+2 bonus on disarm attempts, no attack of opportunity.",
    "rules": "26",
    "special_rules": "26",
    "body": "# Improved Disarm\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Combat Expertise\n\n## Description\nImproved Disarm is a Combat Feature: \\+2 bonus on disarm attempts, no attack of opportunity.\n\n## Mechanics & Benefit\n\\+2 bonus on disarm attempts, no attack of opportunity.\n\n## Special Rules\n26",
    "mechanics": "\\+2 bonus on disarm attempts, no attack of opportunity.",
    "notes": "[Modifier] +2 to Disarm attempts\n[Rule] 26\n[Prerequisite] Combat Expertise",
    "notesList": [
      "[Modifier] +2 to Disarm attempts",
      "[Rule] 26",
      "[Prerequisite] Combat Expertise"
    ]
  },
  {
    "id": "combat-improved-feint",
    "name": "Improved Feint",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Combat Expertise",
    "modifiers": [],
    "description": "Improved Feint is a Combat Feature: Feint as a move action.",
    "mechanic": "Feint as a move action.",
    "rules": "28",
    "special_rules": "28",
    "body": "# Improved Feint\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Combat Expertise\n\n## Description\nImproved Feint is a Combat Feature: Feint as a move action.\n\n## Mechanics & Benefit\nFeint as a move action.\n\n## Special Rules\n28",
    "mechanics": "Feint as a move action.",
    "notes": "[Rule] 28\n[Prerequisite] Combat Expertise",
    "notesList": [
      "[Rule] 28",
      "[Prerequisite] Combat Expertise"
    ]
  },
  {
    "id": "combat-improved-trip",
    "name": "Improved Trip",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Combat Expertise",
    "modifiers": [
      {
        "target": "Trip attempts",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Trip attempts"
      }
    ],
    "description": "Improved Trip is a Combat Feature: +2 bonus on trip attempts, no attack of opportunity.",
    "mechanic": "\\+2 bonus on trip attempts, no attack of opportunity.",
    "rules": "30",
    "special_rules": "30",
    "body": "# Improved Trip\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Combat Expertise\n\n## Description\nImproved Trip is a Combat Feature: \\+2 bonus on trip attempts, no attack of opportunity.\n\n## Mechanics & Benefit\n\\+2 bonus on trip attempts, no attack of opportunity.\n\n## Special Rules\n30",
    "mechanics": "\\+2 bonus on trip attempts, no attack of opportunity.",
    "notes": "[Modifier] +2 to Trip attempts\n[Rule] 30\n[Prerequisite] Combat Expertise",
    "notesList": [
      "[Modifier] +2 to Trip attempts",
      "[Rule] 30",
      "[Prerequisite] Combat Expertise"
    ]
  },
  {
    "id": "combat-improved-two-weapon-defense",
    "name": "Improved Two-Weapon Defense",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Imp. Two-Weapon Fighting",
    "modifiers": [],
    "description": "Improved Two-Weapon Defense is a Combat Feature: +2 shield bonus to defense when fighting with two weapons.",
    "mechanic": "\\+2 shield bonus to defense when fighting with two weapons.",
    "rules": "48",
    "special_rules": "48",
    "body": "# Improved Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Imp. Two-Weapon Fighting\n\n## Description\nImproved Two-Weapon Defense is a Combat Feature: \\+2 shield bonus to defense when fighting with two weapons.\n\n## Mechanics & Benefit\n\\+2 shield bonus to defense when fighting with two weapons.\n\n## Special Rules\n48",
    "mechanics": "\\+2 shield bonus to defense when fighting with two weapons.",
    "notes": "[Rule] 48\n[Prerequisite] Imp. Two-Weapon Fighting",
    "notesList": [
      "[Rule] 48",
      "[Prerequisite] Imp. Two-Weapon Fighting"
    ]
  },
  {
    "id": "combat-improved-two-weapon-fighting",
    "name": "Improved Two-Weapon Fighting",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agi 3, Skill 6",
    "modifiers": [],
    "description": "Improved Two-Weapon Fighting is a Combat Feature: Gain second off-hand attack.",
    "mechanic": "Gain second off-hand attack.",
    "rules": "44",
    "special_rules": "44",
    "body": "# Improved Two-Weapon Fighting\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agi 3, Skill 6\n\n## Description\nImproved Two-Weapon Fighting is a Combat Feature: Gain second off-hand attack.\n\n## Mechanics & Benefit\nGain second off-hand attack.\n\n## Special Rules\n44",
    "mechanics": "Gain second off-hand attack.",
    "notes": "[Rule] 44\n[Prerequisite] Agi 3, Skill 6",
    "notesList": [
      "[Rule] 44",
      "[Prerequisite] Agi 3, Skill 6"
    ]
  },
  {
    "id": "combat-improved-vital-strike",
    "name": "Improved Vital Strike",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Vital Strike, Skill 11",
    "modifiers": [],
    "description": "Improved Vital Strike is a Combat Feature: Deal three times the normal damage on a single attack.",
    "mechanic": "Deal three times the normal damage on a single attack.",
    "rules": "53",
    "special_rules": "53",
    "body": "# Improved Vital Strike\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Vital Strike, Skill 11\n\n## Description\nImproved Vital Strike is a Combat Feature: Deal three times the normal damage on a single attack.\n\n## Mechanics & Benefit\nDeal three times the normal damage on a single attack.\n\n## Special Rules\n53",
    "mechanics": "Deal three times the normal damage on a single attack.",
    "notes": "[Rule] 53\n[Prerequisite] Vital Strike, Skill 11",
    "notesList": [
      "[Rule] 53",
      "[Prerequisite] Vital Strike, Skill 11"
    ]
  },
  {
    "id": "combat-mobility",
    "name": "Mobility",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agi 2, Dodge",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 4,
        "mode": "inherent",
        "description": "+4 defense"
      }
    ],
    "description": "Mobility is a Combat Feature: +4 defense against attacks of opportunity from movement.",
    "mechanic": "\\+4 defense against attacks of opportunity from movement.",
    "rules": "42",
    "special_rules": "42",
    "body": "# Mobility\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agi 2, Dodge\n\n## Description\nMobility is a Combat Feature: \\+4 defense against attacks of opportunity from movement.\n\n## Mechanics & Benefit\n\\+4 defense against attacks of opportunity from movement.\n\n## Special Rules\n42",
    "mechanics": "\\+4 defense against attacks of opportunity from movement.",
    "notes": "[Modifier] +4 defense\n[Rule] 42\n[Prerequisite] Agi 2, Dodge",
    "notesList": [
      "[Modifier] +4 defense",
      "[Rule] 42",
      "[Prerequisite] Agi 2, Dodge"
    ]
  },
  {
    "id": "combat-multidextrous",
    "name": "Multidextrous",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Ambidextrous or Agi 4",
    "modifiers": [],
    "description": "Multidextrous is a Combat Feature: No Off-Handed Penalty with Multiple Limbs.",
    "mechanic": "No Off-Handed Penalty with Multiple Limbs.",
    "rules": "Prerequisite: Ambidextrous or Agi 4.",
    "special_rules": "Prerequisite: Ambidextrous or Agi 4.",
    "body": "# Multidextrous\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Ambidextrous or Agi 4\n\n## Description\nMultidextrous is a Combat Feature: No Off-Handed Penalty with Multiple Limbs.\n\n## Mechanics & Benefit\nNo Off-Handed Penalty with Multiple Limbs.",
    "mechanics": "No Off-Handed Penalty with Multiple Limbs.",
    "notes": "[Rule] Prerequisite: Ambidextrous or Agi 4.\n[Prerequisite] Ambidextrous or Agi 4",
    "notesList": [
      "[Rule] Prerequisite: Ambidextrous or Agi 4.",
      "[Prerequisite] Ambidextrous or Agi 4"
    ]
  },
  {
    "id": "combat-natural-leader",
    "name": "Natural Leader",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 3, Diplomacy 6",
    "modifiers": [
      {
        "target": "Organization",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Organization"
      },
      {
        "target": "Administration",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Administration"
      }
    ],
    "description": "The character attracts loyal followers and can manage a crew or organization effectively.",
    "mechanic": "You gain a number of **Followers** (NPCs) and potentially a **Cohort** (a loyal lieutenant). The number and quality depend on your Level and Charisma score. You gain a \\+2 bonus to Organization/Administration checks.",
    "rules": "Prerequisite: Charisma 3, Diplomacy 6.",
    "special_rules": "Prerequisite: Charisma 3, Diplomacy 6.",
    "body": "# Natural Leader\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Charisma 3, Diplomacy 6\n\n## Description\nThe character attracts loyal followers and can manage a crew or organization effectively.\n\n## Mechanics & Benefit\nYou gain a number of **Followers** (NPCs) and potentially a **Cohort** (a loyal lieutenant). The number and quality depend on your Level and Charisma score. You gain a \\+2 bonus to Organization/Administration checks.",
    "mechanics": "You gain a number of **Followers** (NPCs) and potentially a **Cohort** (a loyal lieutenant). The number and quality depend on your Level and Charisma score. You gain a \\+2 bonus to Organization/Administration checks.",
    "notes": "[Modifier] +2 to Organization\n[Modifier] +2 to Administration\n[Rule] Prerequisite: Charisma 3, Diplomacy 6.\n[Prerequisite] Charisma 3, Diplomacy 6",
    "notesList": [
      "[Modifier] +2 to Organization",
      "[Modifier] +2 to Administration",
      "[Rule] Prerequisite: Charisma 3, Diplomacy 6.",
      "[Prerequisite] Charisma 3, Diplomacy 6"
    ]
  },
  {
    "id": "combat-perfect-two-weapon-defense",
    "name": "Perfect Two-Weapon Defense",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Perfect Two-Weapon Fighting",
    "modifiers": [],
    "description": "Perfect Two-Weapon Defense is a Combat Feature: +4 shield bonus to defense when fighting with two weapons.",
    "mechanic": "\\+4 shield bonus to defense when fighting with two weapons.",
    "rules": "50",
    "special_rules": "50",
    "body": "# Perfect Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Perfect Two-Weapon Fighting\n\n## Description\nPerfect Two-Weapon Defense is a Combat Feature: \\+4 shield bonus to defense when fighting with two weapons.\n\n## Mechanics & Benefit\n\\+4 shield bonus to defense when fighting with two weapons.\n\n## Special Rules\n50",
    "mechanics": "\\+4 shield bonus to defense when fighting with two weapons.",
    "notes": "[Rule] 50\n[Prerequisite] Perfect Two-Weapon Fighting",
    "notesList": [
      "[Rule] 50",
      "[Prerequisite] Perfect Two-Weapon Fighting"
    ]
  },
  {
    "id": "combat-perfect-two-weapon-fighting",
    "name": "Perfect Two-Weapon Fighting",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agi 5, Skill 16",
    "modifiers": [],
    "description": "Perfect Two-Weapon Fighting is a Combat Feature: Gain a fourth off-hand attack.",
    "mechanic": "Gain a fourth off-hand attack.",
    "rules": "46",
    "special_rules": "46",
    "body": "# Perfect Two-Weapon Fighting\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agi 5, Skill 16\n\n## Description\nPerfect Two-Weapon Fighting is a Combat Feature: Gain a fourth off-hand attack.\n\n## Mechanics & Benefit\nGain a fourth off-hand attack.\n\n## Special Rules\n46",
    "mechanics": "Gain a fourth off-hand attack.",
    "notes": "[Rule] 46\n[Prerequisite] Agi 5, Skill 16",
    "notesList": [
      "[Rule] 46",
      "[Prerequisite] Agi 5, Skill 16"
    ]
  },
  {
    "id": "combat-snatch-arrows",
    "name": "Snatch Arrows",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agi 4, Deflect Arrows",
    "modifiers": [],
    "description": "Snatch Arrows is a Combat Feature: Catch a ranged attack.",
    "mechanic": "Catch a ranged attack.",
    "rules": "40",
    "special_rules": "40",
    "body": "# Snatch Arrows\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agi 4, Deflect Arrows\n\n## Description\nSnatch Arrows is a Combat Feature: Catch a ranged attack.\n\n## Mechanics & Benefit\nCatch a ranged attack.\n\n## Special Rules\n40",
    "mechanics": "Catch a ranged attack.",
    "notes": "[Rule] 40\n[Prerequisite] Agi 4, Deflect Arrows",
    "notesList": [
      "[Rule] 40",
      "[Prerequisite] Agi 4, Deflect Arrows"
    ]
  },
  {
    "id": "combat-tech-interface",
    "name": "Tech Interface",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character possesses a specialized mental architecture or metaphysical link that allows them to bridge the gap between consciousness and advanced machinery.",
    "mechanic": "Special benefit.",
    "rules": "Multiple selections allowed.",
    "special_rules": "Multiple selections allowed.",
    "body": "# Tech Interface\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses a specialized mental architecture or metaphysical link that allows them to bridge the gap between consciousness and advanced machinery.\n\n## Mechanics & Benefit\nSpecial benefit.",
    "mechanics": "Special benefit.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Multiple selections allowed.",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Multiple selections allowed."
    ]
  },
  {
    "id": "combat-two-weapon-defense",
    "name": "Two-Weapon Defense",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Two-Weapon Fighting",
    "modifiers": [],
    "description": "The character uses their off-hand weapon to parry and block.",
    "mechanic": "When wielding two weapons (or a double weapon), gain a **\\+1 Shield bonus to Defense**.",
    "rules": "47",
    "special_rules": "47",
    "body": "# Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Two-Weapon Fighting\n\n## Description\nThe character uses their off-hand weapon to parry and block.\n\n## Mechanics & Benefit\nWhen wielding two weapons (or a double weapon), gain a **\\+1 Shield bonus to Defense**.\n\n## Special Rules\n47",
    "mechanics": "When wielding two weapons (or a double weapon), gain a **\\+1 Shield bonus to Defense**.",
    "notes": "[Rule] 47\n[Prerequisite] Two-Weapon Fighting",
    "notesList": [
      "[Rule] 47",
      "[Prerequisite] Two-Weapon Fighting"
    ]
  },
  {
    "id": "combat-uncanny-dodge",
    "name": "Uncanny Dodge",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 4",
    "modifiers": [],
    "description": "The character reacts to danger before their senses fully process it.",
    "mechanic": "You retain your **Agility bonus to Defense** even if you are caught **Flat-Footed** or struck by an **Invisible attacker**.",
    "rules": "This does not negate the advantage an attacker gets from Feinting (see Greater Feint).",
    "special_rules": "This does not negate the advantage an attacker gets from Feinting (see Greater Feint).",
    "body": "# Uncanny Dodge\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 4\n\n## Description\nThe character reacts to danger before their senses fully process it.\n\n## Mechanics & Benefit\nYou retain your **Agility bonus to Defense** even if you are caught **Flat-Footed** or struck by an **Invisible attacker**.\n\n## Special Rules\nThis does not negate the advantage an attacker gets from Feinting (see Greater Feint).",
    "mechanics": "You retain your **Agility bonus to Defense** even if you are caught **Flat-Footed** or struck by an **Invisible attacker**.",
    "notes": "[Rule] This does not negate the advantage an attacker gets from Feinting (see Greater Feint).\n[Prerequisite] Agility 4",
    "notesList": [
      "[Rule] This does not negate the advantage an attacker gets from Feinting (see Greater Feint).",
      "[Prerequisite] Agility 4"
    ]
  },
  {
    "id": "combat-vital-strike",
    "name": "Vital Strike",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Combat Skill 6",
    "modifiers": [],
    "description": "The character makes a single, devastatingly accurate attack rather than a flurry of blows.",
    "mechanic": "As a **Standard Action**, make a single attack at your highest bonus. If it hits, deal **two times (2x)** the weapon's damage dice.",
    "rules": "52",
    "special_rules": "52",
    "body": "# Vital Strike\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Combat Skill 6\n\n## Description\nThe character makes a single, devastatingly accurate attack rather than a flurry of blows.\n\n## Mechanics & Benefit\nAs a **Standard Action**, make a single attack at your highest bonus. If it hits, deal **two times (2x)** the weapon's damage dice.\n\n## Special Rules\n52",
    "mechanics": "As a **Standard Action**, make a single attack at your highest bonus. If it hits, deal **two times (2x)** the weapon's damage dice.",
    "notes": "[Rule] 52\n[Prerequisite] Combat Skill 6",
    "notesList": [
      "[Rule] 52",
      "[Prerequisite] Combat Skill 6"
    ]
  },
  {
    "id": "combat-weapon-focus",
    "name": "Weapon Focus",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Combat Skill 1",
    "modifiers": [
      {
        "target": "Strike with that weapon",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Strike with that weapon"
      }
    ],
    "description": "Extensive training with a specific weapon type (e.g., Laser Rifle, Longsword, Plasma Pistol).",
    "mechanic": "Choose a specific weapon. You gain **\\+1 to Strike** with that weapon.",
    "rules": "\\[Multiple\\] May be taken for different weapons.",
    "special_rules": "\\[Multiple\\] May be taken for different weapons.",
    "body": "# Weapon Focus\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Combat Skill 1\n\n## Description\nExtensive training with a specific weapon type (e.g., Laser Rifle, Longsword, Plasma Pistol).\n\n## Mechanics & Benefit\nChoose a specific weapon. You gain **\\+1 to Strike** with that weapon.\n\n## Special Rules\n\\[Multiple\\] May be taken for different weapons.",
    "mechanics": "Choose a specific weapon. You gain **\\+1 to Strike** with that weapon.",
    "notes": "[Modifier] +1 to Strike with that weapon\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Multiple\\] May be taken for different weapons.\n[Prerequisite] Combat Skill 1",
    "notesList": [
      "[Modifier] +1 to Strike with that weapon",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] \\[Multiple\\] May be taken for different weapons.",
      "[Prerequisite] Combat Skill 1"
    ]
  },
  {
    "id": "combat-weapon-improvisation",
    "name": "Weapon Improvisation",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character is dangerous with anything—a bottle, a chair, or a rock.",
    "mechanic": "You suffer **no penalties** for using improvised Archaic weapons (normally \\-4).",
    "rules": "56",
    "special_rules": "56",
    "body": "# Weapon Improvisation\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character is dangerous with anything—a bottle, a chair, or a rock.\n\n## Mechanics & Benefit\nYou suffer **no penalties** for using improvised Archaic weapons (normally \\-4).\n\n## Special Rules\n56",
    "mechanics": "You suffer **no penalties** for using improvised Archaic weapons (normally \\-4).",
    "notes": "[Rule] 56",
    "notesList": [
      "[Rule] 56"
    ]
  },
  {
    "id": "combat-weapon-specialization",
    "name": "Weapon Specialization",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Weapon Focus, Skill 6",
    "modifiers": [],
    "description": "Weapon Specialization is a Combat Feature: +1d damage with one weapon type.",
    "mechanic": "\\+1d damage with one weapon type.",
    "rules": "Multiple 57",
    "special_rules": "Multiple 57",
    "body": "# Weapon Specialization\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Weapon Focus, Skill 6\n\n## Description\nWeapon Specialization is a Combat Feature: \\+1d damage with one weapon type.\n\n## Mechanics & Benefit\n\\+1d damage with one weapon type.\n\n## Special Rules\nMultiple 57",
    "mechanics": "\\+1d damage with one weapon type.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Multiple 57\n[Prerequisite] Weapon Focus, Skill 6",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Multiple 57",
      "[Prerequisite] Weapon Focus, Skill 6"
    ]
  },
  {
    "id": "combat-whirlwind-attack",
    "name": "Whirlwind Attack",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agi 2, Combat Expertise, Blitz Attack",
    "modifiers": [],
    "description": "Whirlwind Attack is a Combat Feature: Make one melee attack against all foes within reach.",
    "mechanic": "Make one melee attack against all foes within reach.",
    "rules": "32",
    "special_rules": "32",
    "body": "# Whirlwind Attack\n\n**Category**: Combat Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agi 2, Combat Expertise, Blitz Attack\n\n## Description\nWhirlwind Attack is a Combat Feature: Make one melee attack against all foes within reach.\n\n## Mechanics & Benefit\nMake one melee attack against all foes within reach.\n\n## Special Rules\n32",
    "mechanics": "Make one melee attack against all foes within reach.",
    "notes": "[Rule] 32\n[Prerequisite] Agi 2, Combat Expertise, Blitz Attack",
    "notesList": [
      "[Rule] 32",
      "[Prerequisite] Agi 2, Combat Expertise, Blitz Attack"
    ]
  },
  {
    "id": "discipline-aptitude",
    "name": "Aptitude",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Key Ability Score (Intellect, Wisdom, or Charisma) 1+",
    "modifiers": [
      {
        "target": "Checks with those specific",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Checks with those specific"
      }
    ],
    "description": "The character possesses a natural affinity for specific metaphysical interactions, grasping the nuance of shaping energy more intuitively than others.",
    "mechanic": "Choose two specific **Discipline Skills** (e.g., *Thermal* and *Telekinetic*, or *Biomancy* and *Necromancy*). You gain a **\\+2 Bonus** to checks with those specific skills.",
    "rules": "This feature is **\\[Multiple\\]**. It may be selected again to apply to two different Discipline skills.",
    "special_rules": "This feature is **\\[Multiple\\]**. It may be selected again to apply to two different Discipline skills.",
    "body": "# Aptitude\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Key Ability Score (Intellect, Wisdom, or Charisma) 1+\n\n## Description\nThe character possesses a natural affinity for specific metaphysical interactions, grasping the nuance of shaping energy more intuitively than others.\n\n## Mechanics & Benefit\nChoose two specific **Discipline Skills** (e.g., *Thermal* and *Telekinetic*, or *Biomancy* and *Necromancy*). You gain a **\\+2 Bonus** to checks with those specific skills.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. It may be selected again to apply to two different Discipline skills.",
    "mechanics": "Choose two specific **Discipline Skills** (e.g., *Thermal* and *Telekinetic*, or *Biomancy* and *Necromancy*). You gain a **\\+2 Bonus** to checks with those specific skills.",
    "notes": "[Modifier] +2 to Checks with those specific\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]**. It may be selected again to apply to two different Discipline skil...\n[Prerequisite] Key Ability Score (Intellect, Wisdom, or Charisma) 1+",
    "notesList": [
      "[Modifier] +2 to Checks with those specific",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]**. It may be selected again to apply to two different Discipline skil...",
      "[Prerequisite] Key Ability Score (Intellect, Wisdom, or Charisma) 1+"
    ]
  },
  {
    "id": "discipline-awakened",
    "name": "Awakened",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "None (often taken at Character Creation).",
    "modifiers": [],
    "description": "The character has opened their mind or soul to a greater reality. This is the fundamental \"spark\" required to use any form of metaphysics. Without this feature, a character cannot manipulate supernatural forces.",
    "mechanic": "You gain access to the **Attune** skill (the universal skill for channeling power) and **2 Discipline Skills** belonging to a specific **Metafocus Discipline** (e.g., Dimension, Energy, Entropy, Illusion, Matter, or Mental).  \n  * *Example:* Selecting *Awakened (Energy)* might grant access to *Attune*, *Elemental Focus*, and *Force Focus*.",
    "rules": "This feature is **\\[Multiple\\]**. Taking it a second time allows you to awaken a different Metafocus (e.g., adding *Entropy* to a character who already has *Energy*), granting access to that discipline's specific skills.",
    "special_rules": "This feature is **\\[Multiple\\]**. Taking it a second time allows you to awaken a different Metafocus (e.g., adding *Entropy* to a character who already has *Energy*), granting access to that discipline's specific skills.",
    "body": "# Awakened\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None (often taken at Character Creation).\n\n## Description\nThe character has opened their mind or soul to a greater reality. This is the fundamental \"spark\" required to use any form of metaphysics. Without this feature, a character cannot manipulate supernatural forces.\n\n## Mechanics & Benefit\nYou gain access to the **Attune** skill (the universal skill for channeling power) and **2 Discipline Skills** belonging to a specific **Metafocus Discipline** (e.g., Dimension, Energy, Entropy, Illusion, Matter, or Mental).  \n  * *Example:* Selecting *Awakened (Energy)* might grant access to *Attune*, *Elemental Focus*, and *Force Focus*.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. Taking it a second time allows you to awaken a different Metafocus (e.g., adding *Entropy* to a character who already has *Energy*), granting access to that discipline's specific skills.",
    "mechanics": "You gain access to the **Attune** skill (the universal skill for channeling power) and **2 Discipline Skills** belonging to a specific **Metafocus Discipline** (e.g., Dimension, Energy, Entropy, Illusion, Matter, or Mental).  \n  * *Example:* Selecting *Awakened (Energy)* might grant access to *Attune*, *Elemental Focus*, and *Force Focus*.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]**. Taking it a second time allows you to awaken a different Metafocus...\n[Prerequisite] None (often taken at Character Creation).",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]**. Taking it a second time allows you to awaken a different Metafocus...",
      "[Prerequisite] None (often taken at Character Creation)."
    ]
  },
  {
    "id": "discipline-balanced-center",
    "name": "Balanced Center",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Centering Exp, Discipline Exp",
    "modifiers": [],
    "description": "Balanced Center is a Discipline Feature: May take 10 with all Discipline Checks Expertised.",
    "mechanic": "May take 10 with all Discipline Checks Expertised.",
    "rules": "71",
    "special_rules": "71",
    "body": "# Balanced Center\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Centering Exp, Discipline Exp\n\n## Description\nBalanced Center is a Discipline Feature: May take 10 with all Discipline Checks Expertised.\n\n## Mechanics & Benefit\nMay take 10 with all Discipline Checks Expertised.\n\n## Special Rules\n71",
    "mechanics": "May take 10 with all Discipline Checks Expertised.",
    "notes": "[Rule] 71\n[Prerequisite] Centering Exp, Discipline Exp",
    "notesList": [
      "[Rule] 71",
      "[Prerequisite] Centering Exp, Discipline Exp"
    ]
  },
  {
    "id": "discipline-centering",
    "name": "Centering",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Attune 6 (Trained), Key Ability Score 2",
    "modifiers": [
      {
        "target": "Attune",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Attune"
      }
    ],
    "description": "The character has learned to stabilize their internal flow of energy, allowing them to channel power with greater control and intensity.",
    "mechanic": "You gain a **\\+2 Bonus** to all **Attune Checks**.",
    "rules": "This replaces the bonus from *Centering*, it does not stack (it is an upgrade).\n\n  ### \n\n  ## **Centering Master**\n\n  **Description:** The character's control over their metaphysical connection is absolute; they are a conduit through which power flows without resistance.",
    "special_rules": "This replaces the bonus from *Centering*, it does not stack (it is an upgrade).\n\n  ### \n\n  ## **Centering Master**\n\n  **Description:** The character's control over their metaphysical connection is absolute; they are a conduit through which power flows without resistance.",
    "body": "# Centering\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Attune 6 (Trained), Key Ability Score 2\n\n## Description\nThe character has learned to stabilize their internal flow of energy, allowing them to channel power with greater control and intensity.\n\n## Mechanics & Benefit\nYou gain a **\\+2 Bonus** to all **Attune Checks**.\n\n## Special Rules\nThis replaces the bonus from *Centering*, it does not stack (it is an upgrade).\n\n  ### \n\n  ## **Centering Master**\n\n  **Description:** The character's control over their metaphysical connection is absolute; they are a conduit through which power flows without resistance.",
    "mechanics": "You gain a **\\+2 Bonus** to all **Attune Checks**.",
    "notes": "[Modifier] +2 to Attune\n[Rule] This replaces the bonus from *Centering*, it does not stack (it is an upgrade).\n\n  ### \n\n  ## **Cent...\n[Prerequisite] Attune 6 (Trained), Key Ability Score 2",
    "notesList": [
      "[Modifier] +2 to Attune",
      "[Rule] This replaces the bonus from *Centering*, it does not stack (it is an upgrade).\n\n  ### \n\n  ## **Cent...",
      "[Prerequisite] Attune 6 (Trained), Key Ability Score 2"
    ]
  },
  {
    "id": "discipline-centering-expert",
    "name": "Centering Expert",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Attune 11, Key Ability 4",
    "modifiers": [],
    "description": "Centering Expert is a Discipline Feature: +4 Attune Checks (Affecting DCs).",
    "mechanic": "\\+4 Attune Checks (Affecting DCs).",
    "rules": "63",
    "special_rules": "63",
    "body": "# Centering Expert\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Attune 11, Key Ability 4\n\n## Description\nCentering Expert is a Discipline Feature: \\+4 Attune Checks (Affecting DCs).\n\n## Mechanics & Benefit\n\\+4 Attune Checks (Affecting DCs).\n\n## Special Rules\n63",
    "mechanics": "\\+4 Attune Checks (Affecting DCs).",
    "notes": "[Rule] 63\n[Prerequisite] Attune 11, Key Ability 4",
    "notesList": [
      "[Rule] 63",
      "[Prerequisite] Attune 11, Key Ability 4"
    ]
  },
  {
    "id": "discipline-centering-master",
    "name": "Centering Master",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Attune 16, Key Ability 6",
    "modifiers": [],
    "description": "Centering Master is a Discipline Feature: +6 Attune Checks (Affecting DCs).",
    "mechanic": "\\+6 Attune Checks (Affecting DCs).",
    "rules": "64",
    "special_rules": "64",
    "body": "# Centering Master\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Attune 16, Key Ability 6\n\n## Description\nCentering Master is a Discipline Feature: \\+6 Attune Checks (Affecting DCs).\n\n## Mechanics & Benefit\n\\+6 Attune Checks (Affecting DCs).\n\n## Special Rules\n64",
    "mechanics": "\\+6 Attune Checks (Affecting DCs).",
    "notes": "[Rule] 64\n[Prerequisite] Attune 16, Key Ability 6",
    "notesList": [
      "[Rule] 64",
      "[Prerequisite] Attune 16, Key Ability 6"
    ]
  },
  {
    "id": "discipline-discipline-empower",
    "name": "Discipline Empower",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Discipline Focus, Attune 6",
    "modifiers": [],
    "description": "Discipline Empower is a Discipline Feature: Longer channeling time for additional energy each round.",
    "mechanic": "Longer channeling time for additional energy each round.",
    "rules": "68",
    "special_rules": "68",
    "body": "# Discipline Empower\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Discipline Focus, Attune 6\n\n## Description\nDiscipline Empower is a Discipline Feature: Longer channeling time for additional energy each round.\n\n## Mechanics & Benefit\nLonger channeling time for additional energy each round.\n\n## Special Rules\n68",
    "mechanics": "Longer channeling time for additional energy each round.",
    "notes": "[Rule] 68\n[Prerequisite] Discipline Focus, Attune 6",
    "notesList": [
      "[Rule] 68",
      "[Prerequisite] Discipline Focus, Attune 6"
    ]
  },
  {
    "id": "discipline-discipline-expertise",
    "name": "Discipline Expertise",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Discipline Focus, Skill 11",
    "modifiers": [],
    "description": "Discipline Expertise is a Discipline Feature: +4 with chosen Discipline Skill (Affecting Severity).",
    "mechanic": "\\+4 with chosen Discipline Skill (Affecting Severity).",
    "rules": "66",
    "special_rules": "66",
    "body": "# Discipline Expertise\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Discipline Focus, Skill 11\n\n## Description\nDiscipline Expertise is a Discipline Feature: \\+4 with chosen Discipline Skill (Affecting Severity).\n\n## Mechanics & Benefit\n\\+4 with chosen Discipline Skill (Affecting Severity).\n\n## Special Rules\n66",
    "mechanics": "\\+4 with chosen Discipline Skill (Affecting Severity).",
    "notes": "[Rule] 66\n[Prerequisite] Discipline Focus, Skill 11",
    "notesList": [
      "[Rule] 66",
      "[Prerequisite] Discipline Focus, Skill 11"
    ]
  },
  {
    "id": "discipline-discipline-focus",
    "name": "Discipline Focus",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Chosen Discipline Skill 6 (Trained)",
    "modifiers": [
      {
        "target": "Checks made with that",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Checks made with that"
      }
    ],
    "description": "The character has specialized in shaping a specific type of energy or reality.",
    "mechanic": "Choose one Discipline Skill (e.g., *Summoning*, *Projection*, *Elemental*). You gain a **\\+2 Bonus** to checks made with that skill.",
    "rules": "This feature is **\\[Multiple\\]**; you may take it for different Discipline skills.",
    "special_rules": "This feature is **\\[Multiple\\]**; you may take it for different Discipline skills.",
    "body": "# Discipline Focus\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Chosen Discipline Skill 6 (Trained)\n\n## Description\nThe character has specialized in shaping a specific type of energy or reality.\n\n## Mechanics & Benefit\nChoose one Discipline Skill (e.g., *Summoning*, *Projection*, *Elemental*). You gain a **\\+2 Bonus** to checks made with that skill.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**; you may take it for different Discipline skills.",
    "mechanics": "Choose one Discipline Skill (e.g., *Summoning*, *Projection*, *Elemental*). You gain a **\\+2 Bonus** to checks made with that skill.",
    "notes": "[Modifier] +2 to Checks made with that\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]**; you may take it for different Discipline skills.\n[Prerequisite] Chosen Discipline Skill 6 (Trained)",
    "notesList": [
      "[Modifier] +2 to Checks made with that",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]**; you may take it for different Discipline skills.",
      "[Prerequisite] Chosen Discipline Skill 6 (Trained)"
    ]
  },
  {
    "id": "discipline-discipline-mastery",
    "name": "Discipline Mastery",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Discipline Expertise, Skill 16",
    "modifiers": [],
    "description": "Discipline Mastery is a Discipline Feature: +6 with chosen Discipline Skill (Affecting Severity).",
    "mechanic": "\\+6 with chosen Discipline Skill (Affecting Severity).",
    "rules": "67",
    "special_rules": "67",
    "body": "# Discipline Mastery\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Discipline Expertise, Skill 16\n\n## Description\nDiscipline Mastery is a Discipline Feature: \\+6 with chosen Discipline Skill (Affecting Severity).\n\n## Mechanics & Benefit\n\\+6 with chosen Discipline Skill (Affecting Severity).\n\n## Special Rules\n67",
    "mechanics": "\\+6 with chosen Discipline Skill (Affecting Severity).",
    "notes": "[Rule] 67\n[Prerequisite] Discipline Expertise, Skill 16",
    "notesList": [
      "[Rule] 67",
      "[Prerequisite] Discipline Expertise, Skill 16"
    ]
  },
  {
    "id": "discipline-empowered-strike",
    "name": "Empowered Strike",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "Attune 6",
    "modifiers": [
      {
        "target": "Damage",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Damage"
      }
    ],
    "description": "The character can infuse their physical attacks with raw metaphysical energy. This is the signature ability of \"Spellblades,\" \"Paladins,\" or \"Psychic Warriors.\"",
    "mechanic": "You may channel energy into a melee or ranged weapon attack. The attack gains **\\+1 to Strike** and **\\+1 to Damage**.",
    "rules": "This feature is **\\[Ranked\\]**. You may take it multiple times (up to your Attune rank limit). Rank 2 would grant \\+2 Strike/Damage, etc.",
    "special_rules": "This feature is **\\[Ranked\\]**. You may take it multiple times (up to your Attune rank limit). Rank 2 would grant \\+2 Strike/Damage, etc.",
    "body": "# Empowered Strike\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Attune 6\n\n## Description\nThe character can infuse their physical attacks with raw metaphysical energy. This is the signature ability of \"Spellblades,\" \"Paladins,\" or \"Psychic Warriors.\"\n\n## Mechanics & Benefit\nYou may channel energy into a melee or ranged weapon attack. The attack gains **\\+1 to Strike** and **\\+1 to Damage**.\n\n## Special Rules\nThis feature is **\\[Ranked\\]**. You may take it multiple times (up to your Attune rank limit). Rank 2 would grant \\+2 Strike/Damage, etc.",
    "mechanics": "You may channel energy into a melee or ranged weapon attack. The attack gains **\\+1 to Strike** and **\\+1 to Damage**.",
    "notes": "[Modifier] +1 to Damage\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Ranked\\]**. You may take it multiple times (up to your Attune rank limit). Rank ...\n[Prerequisite] Attune 6",
    "notesList": [
      "[Modifier] +1 to Damage",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Ranked\\]**. You may take it multiple times (up to your Attune rank limit). Rank ...",
      "[Prerequisite] Attune 6"
    ]
  },
  {
    "id": "discipline-focused-center",
    "name": "Focused Center",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Centering, Discipline Focus (in all currently used Disciplines)",
    "modifiers": [],
    "description": "The character's concentration is so absolute that they can channel power reliably even in the heat of battle.",
    "mechanic": "You may **Take 10** on **Attune Checks** even when threatened, distracted, or in combat conditions.",
    "rules": "70",
    "special_rules": "70",
    "body": "# Focused Center\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Centering, Discipline Focus (in all currently used Disciplines)\n\n## Description\nThe character's concentration is so absolute that they can channel power reliably even in the heat of battle.\n\n## Mechanics & Benefit\nYou may **Take 10** on **Attune Checks** even when threatened, distracted, or in combat conditions.\n\n## Special Rules\n70",
    "mechanics": "You may **Take 10** on **Attune Checks** even when threatened, distracted, or in combat conditions.",
    "notes": "[Rule] 70\n[Prerequisite] Centering, Discipline Focus (in all currently used Disciplines)",
    "notesList": [
      "[Rule] 70",
      "[Prerequisite] Centering, Discipline Focus (in all currently used Disciplines)"
    ]
  },
  {
    "id": "discipline-harmonious-center",
    "name": "Harmonious Center",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Centering Mst, Discipline Mst",
    "modifiers": [],
    "description": "Harmonious Center is a Discipline Feature: All Checks with Advantage with all Disciplines Mastered.",
    "mechanic": "All Checks with Advantage with all Disciplines Mastered.",
    "rules": "72",
    "special_rules": "72",
    "body": "# Harmonious Center\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Centering Mst, Discipline Mst\n\n## Description\nHarmonious Center is a Discipline Feature: All Checks with Advantage with all Disciplines Mastered.\n\n## Mechanics & Benefit\nAll Checks with Advantage with all Disciplines Mastered.\n\n## Special Rules\n72",
    "mechanics": "All Checks with Advantage with all Disciplines Mastered.",
    "notes": "[Rule] 72\n[Prerequisite] Centering Mst, Discipline Mst",
    "notesList": [
      "[Rule] 72",
      "[Prerequisite] Centering Mst, Discipline Mst"
    ]
  },
  {
    "id": "discipline-special-ability",
    "name": "Special Ability",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "None (though usually tied to Species or Origin).",
    "modifiers": [],
    "description": "The character possesses a singular, innate supernatural power that does not require the broad study of a Discipline. This represents things like a dragon's breath weapon, a mutant's teleportation, or a cyborg's built-in sonic scream.",
    "mechanic": "You gain the ability to use **one specific Invocation** (Spell/Power) at **Level 1**.",
    "rules": "This feature is **\\[Multiple\\]**. You can take it multiple times to gain different isolated powers.",
    "special_rules": "This feature is **\\[Multiple\\]**. You can take it multiple times to gain different isolated powers.",
    "body": "# Special Ability\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None (though usually tied to Species or Origin).\n\n## Description\nThe character possesses a singular, innate supernatural power that does not require the broad study of a Discipline. This represents things like a dragon's breath weapon, a mutant's teleportation, or a cyborg's built-in sonic scream.\n\n## Mechanics & Benefit\nYou gain the ability to use **one specific Invocation** (Spell/Power) at **Level 1**.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. You can take it multiple times to gain different isolated powers.",
    "mechanics": "You gain the ability to use **one specific Invocation** (Spell/Power) at **Level 1**.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]**. You can take it multiple times to gain different isolated powers.\n[Prerequisite] None (though usually tied to Species or Origin).",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]**. You can take it multiple times to gain different isolated powers.",
      "[Prerequisite] None (though usually tied to Species or Origin)."
    ]
  },
  {
    "id": "discipline-versatile-source",
    "name": "Versatile Source",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Attune 6",
    "modifiers": [],
    "description": "The character's understanding of metaphysics is broad enough to bridge different sources of power. A wizard might tap into divine faith, or a psychic might calculate ley-lines like a mathematician.",
    "mechanic": "You may use a **Secondary Ability Score** to modify your **Attune Checks**.  \n  * *Example:* An Intellect-based caster (Mage) with this feature could choose to use their Wisdom modifier for Attune checks instead, perhaps representing a shift from logical weaving to intuitive feeling.",
    "rules": "74",
    "special_rules": "74",
    "body": "# Versatile Source\n\n**Category**: Discipline Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Attune 6\n\n## Description\nThe character's understanding of metaphysics is broad enough to bridge different sources of power. A wizard might tap into divine faith, or a psychic might calculate ley-lines like a mathematician.\n\n## Mechanics & Benefit\nYou may use a **Secondary Ability Score** to modify your **Attune Checks**.  \n  * *Example:* An Intellect-based caster (Mage) with this feature could choose to use their Wisdom modifier for Attune checks instead, perhaps representing a shift from logical weaving to intuitive feeling.\n\n## Special Rules\n74",
    "mechanics": "You may use a **Secondary Ability Score** to modify your **Attune Checks**.  \n  * *Example:* An Intellect-based caster (Mage) with this feature could choose to use their Wisdom modifier for Attune checks instead, perhaps representing a shift from logical weaving to intuitive feeling.",
    "notes": "[Rule] 74\n[Prerequisite] Attune 6",
    "notesList": [
      "[Rule] 74",
      "[Prerequisite] Attune 6"
    ]
  },
  {
    "id": "general-acrobatic-steps",
    "name": "Acrobatic Steps",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agi 3, Nimble Moves",
    "modifiers": [],
    "description": "Acrobatic Steps is a General Feature: Ignore 30 feet of difficult terrain when you move.",
    "mechanic": "Ignore 30 feet of difficult terrain when you move.",
    "rules": "105",
    "special_rules": "105",
    "body": "# Acrobatic Steps\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agi 3, Nimble Moves\n\n## Description\nAcrobatic Steps is a General Feature: Ignore 30 feet of difficult terrain when you move.\n\n## Mechanics & Benefit\nIgnore 30 feet of difficult terrain when you move.\n\n## Special Rules\n105",
    "mechanics": "Ignore 30 feet of difficult terrain when you move.",
    "notes": "[Rule] 105\n[Prerequisite] Agi 3, Nimble Moves",
    "notesList": [
      "[Rule] 105",
      "[Prerequisite] Agi 3, Nimble Moves"
    ]
  },
  {
    "id": "general-analyze-weakness",
    "name": "Analyze Weakness",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Assessment",
    "modifiers": [],
    "description": "Analyze Weakness is a General Feature: +1 bonus vs target per 5 points of success (Assessment vs Bluff).",
    "mechanic": "\\+1 bonus vs target per 5 points of success (Assessment vs Bluff).",
    "rules": "76",
    "special_rules": "76",
    "body": "# Analyze Weakness\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Assessment\n\n## Description\nAnalyze Weakness is a General Feature: \\+1 bonus vs target per 5 points of success (Assessment vs Bluff).\n\n## Mechanics & Benefit\n\\+1 bonus vs target per 5 points of success (Assessment vs Bluff).\n\n## Special Rules\n76",
    "mechanics": "\\+1 bonus vs target per 5 points of success (Assessment vs Bluff).",
    "notes": "[Rule] 76\n[Prerequisite] Assessment",
    "notesList": [
      "[Rule] 76",
      "[Prerequisite] Assessment"
    ]
  },
  {
    "id": "general-assessment",
    "name": "Assessment",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awareness 6, Sense Motive 6",
    "modifiers": [],
    "description": "The character has a practiced eye for sizing up opposition. By observing a target's stance, equipment, and demeanor, they can gauge the threat level.",
    "mechanic": "By observing a target for 1 full round, you can determine their relative threat level compared to yourself (Inferior, Equal, or Superior) and estimate their highest Skill Rank category (Novice, Trained, Expert, Master, Pinnacle).",
    "rules": "This bonus lasts for the duration of the encounter or until the target successfully leaves your line of sight for more than 1 minute.",
    "special_rules": "This bonus lasts for the duration of the encounter or until the target successfully leaves your line of sight for more than 1 minute.",
    "body": "# Assessment\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Awareness 6, Sense Motive 6\n\n## Description\nThe character has a practiced eye for sizing up opposition. By observing a target's stance, equipment, and demeanor, they can gauge the threat level.\n\n## Mechanics & Benefit\nBy observing a target for 1 full round, you can determine their relative threat level compared to yourself (Inferior, Equal, or Superior) and estimate their highest Skill Rank category (Novice, Trained, Expert, Master, Pinnacle).\n\n## Special Rules\nThis bonus lasts for the duration of the encounter or until the target successfully leaves your line of sight for more than 1 minute.",
    "mechanics": "By observing a target for 1 full round, you can determine their relative threat level compared to yourself (Inferior, Equal, or Superior) and estimate their highest Skill Rank category (Novice, Trained, Expert, Master, Pinnacle).",
    "notes": "[Rule] This bonus lasts for the duration of the encounter or until the target successfully leaves your line...\n[Prerequisite] Awareness 6, Sense Motive 6",
    "notesList": [
      "[Rule] This bonus lasts for the duration of the encounter or until the target successfully leaves your line...",
      "[Prerequisite] Awareness 6, Sense Motive 6"
    ]
  },
  {
    "id": "general-benefit-authority",
    "name": "Benefit (Authority)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Special (Law Enforcement background)",
    "modifiers": [],
    "description": "Legal enforcement authority granted by a governing body, planetary militia, or sector law enforcement agency.",
    "mechanic": "Grants legal authority, jurisdictional powers, and arrest rights within designated sectors (from Deputy to Sector Marshal / Special Agent).",
    "rules": "Ranked: Higher ranks grant wider planetary and interstellar jurisdiction.",
    "special_rules": "Ranked: Higher ranks grant wider planetary and interstellar jurisdiction.",
    "body": "# Benefit (Authority)\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Special (Law Enforcement background)\n\n## Description\nLegal enforcement authority granted by a governing body, planetary militia, or sector law enforcement agency.\n\n## Mechanics & Benefit\nGrants legal authority, jurisdictional powers, and arrest rights within designated sectors (from Deputy to Sector Marshal / Special Agent).\n\n## Special Rules\nRanked: Higher ranks grant wider planetary and interstellar jurisdiction.",
    "mechanics": "Grants legal authority, jurisdictional powers, and arrest rights within designated sectors (from Deputy to Sector Marshal / Special Agent).",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked: Higher ranks grant wider planetary and interstellar jurisdiction.\n[Prerequisite] Special (Law Enforcement background)",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked: Higher ranks grant wider planetary and interstellar jurisdiction.",
      "[Prerequisite] Special (Law Enforcement background)"
    ]
  },
  {
    "id": "general-benefit",
    "name": "Benefit (Authority)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Associated Occupation (Soldier, Constable, Agent)",
    "modifiers": [],
    "description": "The character holds a recognized rank within a law enforcement or military organization, granting them legal power and jurisdiction.",
    "mechanic": "You hold a specific rank.  \n  * *Rank 1:* Deputy / Corporal (Local jurisdiction).  \n  * *Rank 2:* Officer / Sergeant (Regional jurisdiction).  \n  * *Rank 3:* Marshal / Lieutenant (Planet-wide jurisdiction).  \n  * *Rank 4:* Agent / Commander (Interstellar/System-wide jurisdiction).",
    "rules": "77",
    "special_rules": "77",
    "body": "# Benefit (Authority)\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Associated Occupation (Soldier, Constable, Agent)\n\n## Description\nThe character holds a recognized rank within a law enforcement or military organization, granting them legal power and jurisdiction.\n\n## Mechanics & Benefit\nYou hold a specific rank.  \n  * *Rank 1:* Deputy / Corporal (Local jurisdiction).  \n  * *Rank 2:* Officer / Sergeant (Regional jurisdiction).  \n  * *Rank 3:* Marshal / Lieutenant (Planet-wide jurisdiction).  \n  * *Rank 4:* Agent / Commander (Interstellar/System-wide jurisdiction).\n\n## Special Rules\n77",
    "mechanics": "You hold a specific rank.  \n  * *Rank 1:* Deputy / Corporal (Local jurisdiction).  \n  * *Rank 2:* Officer / Sergeant (Regional jurisdiction).  \n  * *Rank 3:* Marshal / Lieutenant (Planet-wide jurisdiction).  \n  * *Rank 4:* Agent / Commander (Interstellar/System-wide jurisdiction).",
    "notes": "[Rule] 77\n[Prerequisite] Associated Occupation (Soldier, Constable, Agent)",
    "notesList": [
      "[Rule] 77",
      "[Prerequisite] Associated Occupation (Soldier, Constable, Agent)"
    ]
  },
  {
    "id": "general-benefit-clearance",
    "name": "Benefit (Clearance)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Special (Military or Corporate standing)",
    "modifiers": [],
    "description": "Official security clearance granting access to classified databases, restricted orbital facilities, and top-secret projects.",
    "mechanic": "Access to classified intelligence and restricted facilities (Classified -> Secret -> Top Secret -> Black Badge).",
    "rules": "Ranked: Higher ranks unlock access to military compartmentalized programs.",
    "special_rules": "Ranked: Higher ranks unlock access to military compartmentalized programs.",
    "body": "# Benefit (Clearance)\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Special (Military or Corporate standing)\n\n## Description\nOfficial security clearance granting access to classified databases, restricted orbital facilities, and top-secret projects.\n\n## Mechanics & Benefit\nAccess to classified intelligence and restricted facilities (Classified -> Secret -> Top Secret -> Black Badge).\n\n## Special Rules\nRanked: Higher ranks unlock access to military compartmentalized programs.",
    "mechanics": "Access to classified intelligence and restricted facilities (Classified -> Secret -> Top Secret -> Black Badge).",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked: Higher ranks unlock access to military compartmentalized programs.\n[Prerequisite] Special (Military or Corporate standing)",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked: Higher ranks unlock access to military compartmentalized programs.",
      "[Prerequisite] Special (Military or Corporate standing)"
    ]
  },
  {
    "id": "general-benefit-equipment",
    "name": "Benefit (Equipment)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "Special (Organizational sponsorship)",
    "modifiers": [],
    "description": "Issued or subsidized organizational hardware, specialized field kits, armored vehicles, or scout starships.",
    "mechanic": "Character receives supplied gear, military ordnance, or access to an organization-owned vehicle/vessel.",
    "rules": "Ranked: Rank 1 grants personal gear kits, Rank 3 grants tactical combat vehicles, Rank 5 grants a scout starship.",
    "special_rules": "Ranked: Rank 1 grants personal gear kits, Rank 3 grants tactical combat vehicles, Rank 5 grants a scout starship.",
    "body": "# Benefit (Equipment)\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Special (Organizational sponsorship)\n\n## Description\nIssued or subsidized organizational hardware, specialized field kits, armored vehicles, or scout starships.\n\n## Mechanics & Benefit\nCharacter receives supplied gear, military ordnance, or access to an organization-owned vehicle/vessel.\n\n## Special Rules\nRanked: Rank 1 grants personal gear kits, Rank 3 grants tactical combat vehicles, Rank 5 grants a scout starship.",
    "mechanics": "Character receives supplied gear, military ordnance, or access to an organization-owned vehicle/vessel.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Ranked: Rank 1 grants personal gear kits, Rank 3 grants tactical combat vehicles, Rank 5 grants a sc...\n[Prerequisite] Special (Organizational sponsorship)",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Ranked: Rank 1 grants personal gear kits, Rank 3 grants tactical combat vehicles, Rank 5 grants a sc...",
      "[Prerequisite] Special (Organizational sponsorship)"
    ]
  },
  {
    "id": "general-benefit-identity",
    "name": "Benefit (Identity)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [],
    "description": "A fully established, legally recognized alternate identity complete with planetary biometric records and credit histories.",
    "mechanic": "Grants 1 complete, legally verifiable cover identity per rank, bypassing basic biometric and customs scrutiny.",
    "rules": "Ranked: Each purchase adds an additional established cover identity.",
    "special_rules": "Ranked: Each purchase adds an additional established cover identity.",
    "body": "# Benefit (Identity)\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nA fully established, legally recognized alternate identity complete with planetary biometric records and credit histories.\n\n## Mechanics & Benefit\nGrants 1 complete, legally verifiable cover identity per rank, bypassing basic biometric and customs scrutiny.\n\n## Special Rules\nRanked: Each purchase adds an additional established cover identity.",
    "mechanics": "Grants 1 complete, legally verifiable cover identity per rank, bypassing basic biometric and customs scrutiny.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked: Each purchase adds an additional established cover identity.",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked: Each purchase adds an additional established cover identity."
    ]
  },
  {
    "id": "general-benefit-immunity",
    "name": "Benefit (Immunity)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Special (Diplomatic or Imperial decree)",
    "modifiers": [],
    "description": "Legal immunity from prosecution under local planetary laws, customs tariffs, or extraterritorial arrest warrants.",
    "mechanic": "Grants legal immunity (from Diplomatic Immunity to Inquisitorial License to Kill).",
    "rules": "Special: Requires sovereign or diplomatic faction affiliation.",
    "special_rules": "Special: Requires sovereign or diplomatic faction affiliation.",
    "body": "# Benefit (Immunity)\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Special (Diplomatic or Imperial decree)\n\n## Description\nLegal immunity from prosecution under local planetary laws, customs tariffs, or extraterritorial arrest warrants.\n\n## Mechanics & Benefit\nGrants legal immunity (from Diplomatic Immunity to Inquisitorial License to Kill).\n\n## Special Rules\nSpecial: Requires sovereign or diplomatic faction affiliation.",
    "mechanics": "Grants legal immunity (from Diplomatic Immunity to Inquisitorial License to Kill).",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Special: Requires sovereign or diplomatic faction affiliation.\n[Prerequisite] Special (Diplomatic or Imperial decree)",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Special: Requires sovereign or diplomatic faction affiliation.",
      "[Prerequisite] Special (Diplomatic or Imperial decree)"
    ]
  },
  {
    "id": "general-benefit-status",
    "name": "Benefit (Status)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Special (Aristocratic or Corporate lineage)",
    "modifiers": [
      {
        "target": "Wealth",
        "type": "wealth",
        "value": 2,
        "mode": "inherent",
        "description": "+2 Wealth Score"
      }
    ],
    "description": "High social standing, aristocratic titles, noble rank, executive board standing, and associated wealth stipends.",
    "mechanic": "Grants significant social influence, aristocratic privilege, and +2 Wealth score per rank.",
    "rules": "Ranked: Higher ranks represent titles from Baron/Director to Archon/Grand Duke.",
    "special_rules": "Ranked: Higher ranks represent titles from Baron/Director to Archon/Grand Duke.",
    "body": "# Benefit (Status)\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Special (Aristocratic or Corporate lineage)\n\n## Description\nHigh social standing, aristocratic titles, noble rank, executive board standing, and associated wealth stipends.\n\n## Mechanics & Benefit\nGrants significant social influence, aristocratic privilege, and +2 Wealth score per rank.\n\n## Special Rules\nRanked: Higher ranks represent titles from Baron/Director to Archon/Grand Duke.",
    "mechanics": "Grants significant social influence, aristocratic privilege, and +2 Wealth score per rank.",
    "notes": "[Modifier] +2 Wealth Score\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked: Higher ranks represent titles from Baron/Director to Archon/Grand Duke.\n[Prerequisite] Special (Aristocratic or Corporate lineage)",
    "notesList": [
      "[Modifier] +2 Wealth Score",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked: Higher ranks represent titles from Baron/Director to Archon/Grand Duke.",
      "[Prerequisite] Special (Aristocratic or Corporate lineage)"
    ]
  },
  {
    "id": "general-benefit-wealth",
    "name": "Benefit (Wealth)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [],
    "description": "Substantial personal financial reserves, passive dividend income, and liquid capital assets.",
    "mechanic": "Permanently increases character's Wealth score by +3 per purchase.",
    "rules": "Ranked: May be purchased multiple times to represent vast commercial fortunes.",
    "special_rules": "Ranked: May be purchased multiple times to represent vast commercial fortunes.",
    "body": "# Benefit (Wealth)\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nSubstantial personal financial reserves, passive dividend income, and liquid capital assets.\n\n## Mechanics & Benefit\nPermanently increases character's Wealth score by +3 per purchase.\n\n## Special Rules\nRanked: May be purchased multiple times to represent vast commercial fortunes.",
    "mechanics": "Permanently increases character's Wealth score by +3 per purchase.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked: May be purchased multiple times to represent vast commercial fortunes.",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked: May be purchased multiple times to represent vast commercial fortunes."
    ]
  },
  {
    "id": "general-born-leader",
    "name": "Born Leader",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Special",
    "modifiers": [],
    "description": "Born Leader is a General Feature: Gain Followers.",
    "mechanic": "Gain Followers.",
    "rules": "99",
    "special_rules": "99",
    "body": "# Born Leader\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Special\n\n## Description\nBorn Leader is a General Feature: Gain Followers.\n\n## Mechanics & Benefit\nGain Followers.\n\n## Special Rules\n99",
    "mechanics": "Gain Followers.",
    "notes": "[Rule] 99\n[Prerequisite] Special",
    "notesList": [
      "[Rule] 99",
      "[Prerequisite] Special"
    ]
  },
  {
    "id": "general-climber",
    "name": "Climber",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1, Athletics 1",
    "modifiers": [
      {
        "target": "Athletics  Climbing",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Athletics  Climbing"
      }
    ],
    "description": "The character is a master mountaineer and vertical surface scaler.",
    "mechanic": "- **Speed Multiplier Boost**: Increases all Climbing speeds without affecting action penalties:\n  - **Standard Climbing**: Moves at full **Base Walking Speed (1x = 30 ft/rd)** on standard surfaces.\n  - **Scaling Pace**: Moves at **2x Base Speed (60 ft/rd)**.\n  - **Fast Ascent Pace**: Moves at **3x Base Speed (90 ft/rd)**.\n  - **Fast Descent Pace**: Moves at **6x Base Speed (180 ft/rd)**.\n- **Grip & Balance**: Gain **+2 bonus** to Athletics (Climbing) checks and avoid fall damage on successful descent checks.",
    "rules": "Prerequisite: Agility 1, Athletics 1.",
    "special_rules": "Prerequisite: Agility 1, Athletics 1.",
    "body": "# Climber\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisites**: Agility 1, Athletics 1  \n\n## Description\nThe character is an expert climber capable of rapid ascent, surface scaling, and controlled vertical descent.\n\n## Mechanics & Benefit\n- **Speed Multiplier Boost**: Increases all Climbing speeds without affecting action penalties:\n  - **Standard Climbing**: Moves at full **Base Walking Speed (1x = 30 ft/rd)** on standard surfaces.\n  - **Scaling Pace**: Moves at **2x Base Speed (60 ft/rd)**.\n  - **Fast Ascent Pace**: Moves at **3x Base Speed (90 ft/rd)**.\n  - **Fast Descent Pace**: Moves at **6x Base Speed (180 ft/rd)**.\n- **Grip & Balance**: Gain **+2 bonus** to Athletics (Climbing) checks and avoid fall damage on successful descent checks.",
    "mechanics": "- **Speed Multiplier Boost**: Increases all Climbing speeds without affecting action penalties:\n  - **Standard Climbing**: Moves at full **Base Walking Speed (1x = 30 ft/rd)** on standard surfaces.\n  - **Scaling Pace**: Moves at **2x Base Speed (60 ft/rd)**.\n  - **Fast Ascent Pace**: Moves at **3x Base Speed (90 ft/rd)**.\n  - **Fast Descent Pace**: Moves at **6x Base Speed (180 ft/rd)**.\n- **Grip & Balance**: Gain **+2 bonus** to Athletics (Climbing) checks and avoid fall damage on successful descent checks.",
    "notes": "[Modifier] +2 to Athletics  Climbing\n[Rule] Prerequisite: Agility 1, Athletics 1.\n[Prerequisite] Agility 1, Athletics 1",
    "notesList": [
      "[Modifier] +2 to Athletics  Climbing",
      "[Rule] Prerequisite: Agility 1, Athletics 1.",
      "[Prerequisite] Agility 1, Athletics 1"
    ]
  },
  {
    "id": "general-connected",
    "name": "Connected",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Charisma 1",
    "modifiers": [],
    "description": "The character has friends in low (or high) places. They can call in favors for equipment, information, or safe houses.",
    "mechanic": "You have a network of contacts.  \n  * *Rank 1:* Street/Soldier level (Gangs, Grunts).  \n  * *Rank 2:* Management/Lieutenant level (Shop owners, Squad leaders).  \n  * *Rank 3:* Officer/Executive level (City officials, Corp VPs).  \n  * *Rank 4:* Boss/Director level (Planetary Governors, Crime Lords).",
    "rules": "This feature is Ranked (up to Rank 4). Each additional rank purchased expands the reach, authority, and influence of your network of contacts.",
    "special_rules": "This feature is Ranked (up to Rank 4). Each additional rank purchased expands the reach, authority, and influence of your network of contacts.",
    "body": "# Connected\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character has friends in low (or high) places. They can call in favors for equipment, information, or safe houses.\n\n## Mechanics & Benefit\nYou have a network of contacts.  \n  * *Rank 1:* Street/Soldier level (Gangs, Grunts).  \n  * *Rank 2:* Management/Lieutenant level (Shop owners, Squad leaders).  \n  * *Rank 3:* Officer/Executive level (City officials, Corp VPs).  \n  * *Rank 4:* Boss/Director level (Planetary Governors, Crime Lords).\n\n## Special Rules\nThis feature is Ranked (up to Rank 4). Each additional rank purchased expands the reach, authority, and influence of your network of contacts.",
    "mechanics": "You have a network of contacts.  \n  * *Rank 1:* Street/Soldier level (Gangs, Grunts).  \n  * *Rank 2:* Management/Lieutenant level (Shop owners, Squad leaders).  \n  * *Rank 3:* Officer/Executive level (City officials, Corp VPs).  \n  * *Rank 4:* Boss/Director level (Planetary Governors, Crime Lords).",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This feature is Ranked (up to Rank 4). Each additional rank purchased expands the reach, authority, ...\n[Prerequisite] Charisma 1",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] This feature is Ranked (up to Rank 4). Each additional rank purchased expands the reach, authority, ...",
      "[Prerequisite] Charisma 1"
    ]
  },
  {
    "id": "general-contacts",
    "name": "Contacts",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 1",
    "modifiers": [],
    "description": "The character knows who to talk to. They don't necessarily have favors owed, but they know the flow of information.",
    "mechanic": "You may make **Gather Information** checks in **1/2 the typical time**.",
    "rules": "85",
    "special_rules": "85",
    "body": "# Contacts\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character knows who to talk to. They don't necessarily have favors owed, but they know the flow of information.\n\n## Mechanics & Benefit\nYou may make **Gather Information** checks in **1/2 the typical time**.\n\n## Special Rules\n85",
    "mechanics": "You may make **Gather Information** checks in **1/2 the typical time**.",
    "notes": "[Rule] 85\n[Prerequisite] Charisma 1",
    "notesList": [
      "[Rule] 85",
      "[Prerequisite] Charisma 1"
    ]
  },
  {
    "id": "general-coordinated-assist",
    "name": "Coordinated Assist",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Intellect 1",
    "modifiers": [],
    "description": "The character is a natural team player or squad leader, adept at setting up allies for success.",
    "mechanic": "When using the **Aid Another** action (Skill Synergy), you grant an additional **\\+1 Bonus** to your ally's check.",
    "rules": "This feature is \\[Ranked\\] by Intellect. (Rank 2 grants \\+2, etc.).",
    "special_rules": "This feature is \\[Ranked\\] by Intellect. (Rank 2 grants \\+2, etc.).",
    "body": "# Coordinated Assist\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Intellect 1\n\n## Description\nThe character is a natural team player or squad leader, adept at setting up allies for success.\n\n## Mechanics & Benefit\nWhen using the **Aid Another** action (Skill Synergy), you grant an additional **\\+1 Bonus** to your ally's check.\n\n## Special Rules\nThis feature is \\[Ranked\\] by Intellect. (Rank 2 grants \\+2, etc.).",
    "mechanics": "When using the **Aid Another** action (Skill Synergy), you grant an additional **\\+1 Bonus** to your ally's check.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This feature is \\[Ranked\\] by Intellect. (Rank 2 grants \\+2, etc.).\n[Prerequisite] Intellect 1",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] This feature is \\[Ranked\\] by Intellect. (Rank 2 grants \\+2, etc.).",
      "[Prerequisite] Intellect 1"
    ]
  },
  {
    "id": "general-diehard",
    "name": "Diehard",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Endurance",
    "modifiers": [],
    "description": "Diehard is a General Feature: Automatically stabilize when dying.",
    "mechanic": "Automatically stabilize when dying.",
    "rules": "93",
    "special_rules": "93",
    "body": "# Diehard\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Endurance\n\n## Description\nDiehard is a General Feature: Automatically stabilize when dying.\n\n## Mechanics & Benefit\nAutomatically stabilize when dying.\n\n## Special Rules\n93",
    "mechanics": "Automatically stabilize when dying.",
    "notes": "[Rule] 93\n[Prerequisite] Endurance",
    "notesList": [
      "[Rule] 93",
      "[Prerequisite] Endurance"
    ]
  },
  {
    "id": "general-distract",
    "name": "Distract",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 1 or Intellect 1",
    "modifiers": [],
    "description": "The character can cause a diversion so potent that it leaves opponents vulnerable.",
    "mechanic": "As a Standard Action, make a Bluff or Engineering (for tech distraction) check vs. the Target’s Will.",
    "rules": "88",
    "special_rules": "88",
    "body": "# Distract\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Charisma 1 or Intellect 1\n\n## Description\nThe character can cause a diversion so potent that it leaves opponents vulnerable.\n\n## Mechanics & Benefit\nAs a Standard Action, make a Bluff or Engineering (for tech distraction) check vs. the Target’s Will.\n\n## Special Rules\n88",
    "mechanics": "As a Standard Action, make a Bluff or Engineering (for tech distraction) check vs. the Target’s Will.",
    "notes": "[Rule] 88\n[Prerequisite] Charisma 1 or Intellect 1",
    "notesList": [
      "[Rule] 88",
      "[Prerequisite] Charisma 1 or Intellect 1"
    ]
  },
  {
    "id": "general-double-jointed",
    "name": "Double Jointed",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1",
    "modifiers": [
      {
        "target": "Escape Artist",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Escape Artist"
      }
    ],
    "description": "The character possesses extreme flexibility, able to dislocate joints or contort into impossible shapes.",
    "mechanic": "Gain a **\\+4 Bonus** on Escape Artist checks and any check involving fitting into tight spaces.",
    "rules": "89",
    "special_rules": "89",
    "body": "# Double Jointed\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character possesses extreme flexibility, able to dislocate joints or contort into impossible shapes.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** on Escape Artist checks and any check involving fitting into tight spaces.\n\n## Special Rules\n89",
    "mechanics": "Gain a **\\+4 Bonus** on Escape Artist checks and any check involving fitting into tight spaces.",
    "notes": "[Modifier] +4 to Escape Artist\n[Rule] 89\n[Prerequisite] Agility 1",
    "notesList": [
      "[Modifier] +4 to Escape Artist",
      "[Rule] 89",
      "[Prerequisite] Agility 1"
    ]
  },
  {
    "id": "general-eidetic-memory",
    "name": "Eidetic Memory",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intellect 2",
    "modifiers": [
      {
        "target": "Memory",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Memory"
      }
    ],
    "description": "The character remembers everything they see or read with fair accuracy.",
    "mechanic": "Gain a **\\+4 Bonus** on Memory Checks. You may use **Knowledge Skills Untrained**, as you recall snippets of information you’ve encountered previously.",
    "rules": "90",
    "special_rules": "90",
    "body": "# Eidetic Memory\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Intellect 2\n\n## Description\nThe character remembers everything they see or read with fair accuracy.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** on Memory Checks. You may use **Knowledge Skills Untrained**, as you recall snippets of information you’ve encountered previously.\n\n## Special Rules\n90",
    "mechanics": "Gain a **\\+4 Bonus** on Memory Checks. You may use **Knowledge Skills Untrained**, as you recall snippets of information you’ve encountered previously.",
    "notes": "[Modifier] +4 to Memory\n[Rule] 90\n[Prerequisite] Intellect 2",
    "notesList": [
      "[Modifier] +4 to Memory",
      "[Rule] 90",
      "[Prerequisite] Intellect 2"
    ]
  },
  {
    "id": "general-endurance",
    "name": "Endurance",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Stamina 1",
    "modifiers": [],
    "description": "The character has exceptional cardiovascular health and stamina for long-term exertion.",
    "mechanic": "Gain a **\\+4 Bonus** on checks to resist non-lethal damage from exhaustion, starvation, thirst, or forced marches. You can hold your breath twice as long as normal.",
    "rules": "92",
    "special_rules": "92",
    "body": "# Endurance\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThe character has exceptional cardiovascular health and stamina for long-term exertion.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** on checks to resist non-lethal damage from exhaustion, starvation, thirst, or forced marches. You can hold your breath twice as long as normal.\n\n## Special Rules\n92",
    "mechanics": "Gain a **\\+4 Bonus** on checks to resist non-lethal damage from exhaustion, starvation, thirst, or forced marches. You can hold your breath twice as long as normal.",
    "notes": "[Rule] 92\n[Prerequisite] Stamina 1",
    "notesList": [
      "[Rule] 92",
      "[Prerequisite] Stamina 1"
    ]
  },
  {
    "id": "general-fast-heal",
    "name": "Fast Heal",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Stamina 2",
    "modifiers": [],
    "description": "The character's metabolism repairs tissue at an accelerated rate.",
    "mechanic": "Your natural healing rate is **doubled**. You recover Vitality and Health twice as fast during Rest.",
    "rules": "This feature is \\[Ranked\\]. Rank 2 \\= 3x healing, Rank 3 \\= 4x healing.",
    "special_rules": "This feature is \\[Ranked\\]. Rank 2 \\= 3x healing, Rank 3 \\= 4x healing.",
    "body": "# Fast Heal\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Stamina 2\n\n## Description\nThe character's metabolism repairs tissue at an accelerated rate.\n\n## Mechanics & Benefit\nYour natural healing rate is **doubled**. You recover Vitality and Health twice as fast during Rest.\n\n## Special Rules\nThis feature is \\[Ranked\\]. Rank 2 \\= 3x healing, Rank 3 \\= 4x healing.",
    "mechanics": "Your natural healing rate is **doubled**. You recover Vitality and Health twice as fast during Rest.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This feature is \\[Ranked\\]. Rank 2 \\= 3x healing, Rank 3 \\= 4x healing.\n[Prerequisite] Stamina 2",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] This feature is \\[Ranked\\]. Rank 2 \\= 3x healing, Rank 3 \\= 4x healing.",
      "[Prerequisite] Stamina 2"
    ]
  },
  {
    "id": "general-favored-enemy",
    "name": "Favored Enemy",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "Awareness 1",
    "modifiers": [
      {
        "target": "Strike",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Strike"
      }
    ],
    "description": "The character has studied a specific type of creature extensively, knowing their anatomy, tactics, and psychology.",
    "mechanic": "Choose a creature type (e.g., Humanoid \\[Human\\], Beast, Synthetic, Aberration). You gain a **\\+2 Bonus** to **Strike**, **Damage**, **Bluff**, **Insight**, and **Survival** checks against them.",
    "rules": "\\[Multiple\\] Can be taken for different creature types.",
    "special_rules": "\\[Multiple\\] Can be taken for different creature types.",
    "body": "# Favored Enemy\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Awareness 1\n\n## Description\nThe character has studied a specific type of creature extensively, knowing their anatomy, tactics, and psychology.\n\n## Mechanics & Benefit\nChoose a creature type (e.g., Humanoid \\[Human\\], Beast, Synthetic, Aberration). You gain a **\\+2 Bonus** to **Strike**, **Damage**, **Bluff**, **Insight**, and **Survival** checks against them.\n\n## Special Rules\n\\[Multiple\\] Can be taken for different creature types.",
    "mechanics": "Choose a creature type (e.g., Humanoid \\[Human\\], Beast, Synthetic, Aberration). You gain a **\\+2 Bonus** to **Strike**, **Damage**, **Bluff**, **Insight**, and **Survival** checks against them.",
    "notes": "[Modifier] +2 to Strike\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Multiple\\] Can be taken for different creature types.\n[Prerequisite] Awareness 1",
    "notesList": [
      "[Modifier] +2 to Strike",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] \\[Multiple\\] Can be taken for different creature types.",
      "[Prerequisite] Awareness 1"
    ]
  },
  {
    "id": "general-fearless",
    "name": "Fearless",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Will 3+",
    "modifiers": [],
    "description": "Whether through madness, conditioning, or bravery, the character is immune to terror.",
    "mechanic": "You are **Immune** to Fear effects (magical, psionic, or mundane intimidation).",
    "rules": "97",
    "special_rules": "97",
    "body": "# Fearless\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Will 3+\n\n## Description\nWhether through madness, conditioning, or bravery, the character is immune to terror.\n\n## Mechanics & Benefit\nYou are **Immune** to Fear effects (magical, psionic, or mundane intimidation).\n\n## Special Rules\n97",
    "mechanics": "You are **Immune** to Fear effects (magical, psionic, or mundane intimidation).",
    "notes": "[Rule] 97\n[Prerequisite] Will 3+",
    "notesList": [
      "[Rule] 97",
      "[Prerequisite] Will 3+"
    ]
  },
  {
    "id": "general-jack-of-all-trades",
    "name": "Jack-of-all-trades",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intellect 2",
    "modifiers": [],
    "description": "The character has picked up a little bit of everything in their travels.",
    "mechanic": "You may attempt **any Skill check Untrained**, even those normally requiring training (like Medicine, Engineering, or Piloting).",
    "rules": "98",
    "special_rules": "98",
    "body": "# Jack-of-all-trades\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Intellect 2\n\n## Description\nThe character has picked up a little bit of everything in their travels.\n\n## Mechanics & Benefit\nYou may attempt **any Skill check Untrained**, even those normally requiring training (like Medicine, Engineering, or Piloting).\n\n## Special Rules\n98",
    "mechanics": "You may attempt **any Skill check Untrained**, even those normally requiring training (like Medicine, Engineering, or Piloting).",
    "notes": "[Rule] 98\n[Prerequisite] Intellect 2",
    "notesList": [
      "[Rule] 98",
      "[Prerequisite] Intellect 2"
    ]
  },
  {
    "id": "general-lightning-calculator",
    "name": "Lightning Calculator",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Intellect 1",
    "modifiers": [],
    "description": "The character is a living computer, able to perform complex mathematics instantly.",
    "mechanic": "You perform mathematical calculations at **2x speed**. This applies to Astrogation, Engineering calculations, and Cryptography.",
    "rules": "\\[Ranked\\] Limited by Intellect modifier.",
    "special_rules": "\\[Ranked\\] Limited by Intellect modifier.",
    "body": "# Lightning Calculator\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Intellect 1\n\n## Description\nThe character is a living computer, able to perform complex mathematics instantly.\n\n## Mechanics & Benefit\nYou perform mathematical calculations at **2x speed**. This applies to Astrogation, Engineering calculations, and Cryptography.\n\n## Special Rules\n\\[Ranked\\] Limited by Intellect modifier.",
    "mechanics": "You perform mathematical calculations at **2x speed**. This applies to Astrogation, Engineering calculations, and Cryptography.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] \\[Ranked\\] Limited by Intellect modifier.\n[Prerequisite] Intellect 1",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] \\[Ranked\\] Limited by Intellect modifier.",
      "[Prerequisite] Intellect 1"
    ]
  },
  {
    "id": "general-master-plan",
    "name": "Master Plan",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Logic 6, Intellect 3",
    "modifiers": [],
    "description": "The character is a tactical genius who prepares for every eventuality.",
    "mechanic": "If you have time to prepare for an encounter (minimum 1 hour), make a **Logic Check**. For every point your result exceeds DC 10, you create a **Bonus Pool**.",
    "rules": "103",
    "special_rules": "103",
    "body": "# Master Plan\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Logic 6, Intellect 3\n\n## Description\nThe character is a tactical genius who prepares for every eventuality.\n\n## Mechanics & Benefit\nIf you have time to prepare for an encounter (minimum 1 hour), make a **Logic Check**. For every point your result exceeds DC 10, you create a **Bonus Pool**.\n\n## Special Rules\n103",
    "mechanics": "If you have time to prepare for an encounter (minimum 1 hour), make a **Logic Check**. For every point your result exceeds DC 10, you create a **Bonus Pool**.",
    "notes": "[Rule] 103\n[Prerequisite] Logic 6, Intellect 3",
    "notesList": [
      "[Rule] 103",
      "[Prerequisite] Logic 6, Intellect 3"
    ]
  },
  {
    "id": "general-mental-alacrity",
    "name": "Mental Alacrity",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Lightning Calc, Trance, Int 2",
    "modifiers": [],
    "description": "Mental Alacrity is a General Feature: Gain additional Mental Action if doing nothing physical.",
    "mechanic": "Gain additional Mental Action if doing nothing physical.",
    "rules": "101",
    "special_rules": "101",
    "body": "# Mental Alacrity\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Lightning Calc, Trance, Int 2\n\n## Description\nMental Alacrity is a General Feature: Gain additional Mental Action if doing nothing physical.\n\n## Mechanics & Benefit\nGain additional Mental Action if doing nothing physical.\n\n## Special Rules\n101",
    "mechanics": "Gain additional Mental Action if doing nothing physical.",
    "notes": "[Rule] 101\n[Prerequisite] Lightning Calc, Trance, Int 2",
    "notesList": [
      "[Rule] 101",
      "[Prerequisite] Lightning Calc, Trance, Int 2"
    ]
  },
  {
    "id": "general-multiplexing",
    "name": "Multiplexing",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Mental Alacrity, Int 3",
    "modifiers": [],
    "description": "Multiplexing is a General Feature: +1 Mental Action to Mental Alacrity.",
    "mechanic": "\\+1 Mental Action to Mental Alacrity.",
    "rules": "Ranked (Int) 102",
    "special_rules": "Ranked (Int) 102",
    "body": "# Multiplexing\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Mental Alacrity, Int 3\n\n## Description\nMultiplexing is a General Feature: \\+1 Mental Action to Mental Alacrity.\n\n## Mechanics & Benefit\n\\+1 Mental Action to Mental Alacrity.\n\n## Special Rules\nRanked (Int) 102",
    "mechanics": "\\+1 Mental Action to Mental Alacrity.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked (Int) 102\n[Prerequisite] Mental Alacrity, Int 3",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked (Int) 102",
      "[Prerequisite] Mental Alacrity, Int 3"
    ]
  },
  {
    "id": "general-nimble-moves",
    "name": "Nimble Moves",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 2",
    "modifiers": [],
    "description": "The character dances around obstacles that would slow others down.",
    "mechanic": "You ignore **10 feet** of difficult terrain penalties during your movement per round.",
    "rules": "104",
    "special_rules": "104",
    "body": "# Nimble Moves\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 2\n\n## Description\nThe character dances around obstacles that would slow others down.\n\n## Mechanics & Benefit\nYou ignore **10 feet** of difficult terrain penalties during your movement per round.\n\n## Special Rules\n104",
    "mechanics": "You ignore **10 feet** of difficult terrain penalties during your movement per round.",
    "notes": "[Rule] 104\n[Prerequisite] Agility 2",
    "notesList": [
      "[Rule] 104",
      "[Prerequisite] Agility 2"
    ]
  },
  {
    "id": "general-pain-tolerance",
    "name": "Pain Tolerance",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Tough, Sta 2",
    "modifiers": [],
    "description": "Pain Tolerance is a General Feature: Make Stun checks at Advantage.",
    "mechanic": "Make Stun checks at Advantage.",
    "rules": "108",
    "special_rules": "108",
    "body": "# Pain Tolerance\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Tough, Sta 2\n\n## Description\nPain Tolerance is a General Feature: Make Stun checks at Advantage.\n\n## Mechanics & Benefit\nMake Stun checks at Advantage.\n\n## Special Rules\n108",
    "mechanics": "Make Stun checks at Advantage.",
    "notes": "[Rule] 108\n[Prerequisite] Tough, Sta 2",
    "notesList": [
      "[Rule] 108",
      "[Prerequisite] Tough, Sta 2"
    ]
  },
  {
    "id": "general-perfect-balance",
    "name": "Perfect Balance",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agi 4, Acrobatic Steps",
    "modifiers": [],
    "description": "Perfect Balance is a General Feature: Ignore any difficult terrain when you move.",
    "mechanic": "Ignore any difficult terrain when you move.",
    "rules": "106",
    "special_rules": "106",
    "body": "# Perfect Balance\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agi 4, Acrobatic Steps\n\n## Description\nPerfect Balance is a General Feature: Ignore any difficult terrain when you move.\n\n## Mechanics & Benefit\nIgnore any difficult terrain when you move.\n\n## Special Rules\n106",
    "mechanics": "Ignore any difficult terrain when you move.",
    "notes": "[Rule] 106\n[Prerequisite] Agi 4, Acrobatic Steps",
    "notesList": [
      "[Rule] 106",
      "[Prerequisite] Agi 4, Acrobatic Steps"
    ]
  },
  {
    "id": "general-photographic-memory",
    "name": "Photographic Memory",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Eidetic Memory, Int 4",
    "modifiers": [],
    "description": "Photographic Memory is a General Feature: Learn skill in 1/2 time and perfect recall of texts/images.",
    "mechanic": "Learn skill in 1/2 time and perfect recall of texts/images.",
    "rules": "91",
    "special_rules": "91",
    "body": "# Photographic Memory\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Eidetic Memory, Int 4\n\n## Description\nPhotographic Memory is a General Feature: Learn skill in 1/2 time and perfect recall of texts/images.\n\n## Mechanics & Benefit\nLearn skill in 1/2 time and perfect recall of texts/images.\n\n## Special Rules\n91",
    "mechanics": "Learn skill in 1/2 time and perfect recall of texts/images.",
    "notes": "[Rule] 91\n[Prerequisite] Eidetic Memory, Int 4",
    "notesList": [
      "[Rule] 91",
      "[Prerequisite] Eidetic Memory, Int 4"
    ]
  },
  {
    "id": "general-quick",
    "name": "Quick",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1",
    "modifiers": [
      {
        "target": "Initiative",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Initiative"
      },
      {
        "target": "initiative-mod",
        "type": "combat",
        "value": 1,
        "mode": "inherent",
        "description": "+1 Initiative"
      }
    ],
    "description": "The character is naturally fleet of foot.",
    "mechanic": "**\\+10 feet** to Base Movement Speed and **\\+1 to Initiative**.",
    "rules": "114",
    "special_rules": "114",
    "body": "# Quick\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character is naturally fleet of foot.\n\n## Mechanics & Benefit\n**\\+10 feet** to Base Movement Speed and **\\+1 to Initiative**.\n\n## Special Rules\n114",
    "mechanics": "**\\+10 feet** to Base Movement Speed and **\\+1 to Initiative**.",
    "notes": "[Modifier] +1 to Initiative\n[Modifier] +1 Initiative\n[Rule] 114\n[Prerequisite] Agility 1",
    "notesList": [
      "[Modifier] +1 to Initiative",
      "[Modifier] +1 Initiative",
      "[Rule] 114",
      "[Prerequisite] Agility 1"
    ]
  },
  {
    "id": "general-quicker",
    "name": "Quicker",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Quick, Agi 2",
    "modifiers": [
      {
        "target": "move-walk",
        "type": "combat",
        "value": 20,
        "mode": "inherent",
        "description": "+20 Movement"
      },
      {
        "target": "initiative-mod",
        "type": "combat",
        "value": 2,
        "mode": "inherent",
        "description": "+2 Initiative"
      }
    ],
    "description": "Quicker is a General Feature: +20 to Movement Speed and +2 Initiative.",
    "mechanic": "\\+20 to Movement Speed and \\+2 Initiative.",
    "rules": "115",
    "special_rules": "115",
    "body": "# Quicker\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Quick, Agi 2\n\n## Description\nQuicker is a General Feature: \\+20 to Movement Speed and \\+2 Initiative.\n\n## Mechanics & Benefit\n\\+20 to Movement Speed and \\+2 Initiative.\n\n## Special Rules\n115",
    "mechanics": "\\+20 to Movement Speed and \\+2 Initiative.",
    "notes": "[Modifier] +20 Movement\n[Modifier] +2 Initiative\n[Rule] 115\n[Prerequisite] Quick, Agi 2",
    "notesList": [
      "[Modifier] +20 Movement",
      "[Modifier] +2 Initiative",
      "[Rule] 115",
      "[Prerequisite] Quick, Agi 2"
    ]
  },
  {
    "id": "general-quickest",
    "name": "Quickest",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Quicker, Agi 3",
    "modifiers": [
      {
        "target": "move-walk",
        "type": "combat",
        "value": 30,
        "mode": "inherent",
        "description": "+30 Movement"
      },
      {
        "target": "initiative-mod",
        "type": "combat",
        "value": 3,
        "mode": "inherent",
        "description": "+3 Initiative"
      }
    ],
    "description": "Quickest is a General Feature: +30 to Movement Speed and +3 Initiative.",
    "mechanic": "\\+30 to Movement Speed and \\+3 Initiative.",
    "rules": "116",
    "special_rules": "116",
    "body": "# Quickest\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Quicker, Agi 3\n\n## Description\nQuickest is a General Feature: \\+30 to Movement Speed and \\+3 Initiative.\n\n## Mechanics & Benefit\n\\+30 to Movement Speed and \\+3 Initiative.\n\n## Special Rules\n116",
    "mechanics": "\\+30 to Movement Speed and \\+3 Initiative.",
    "notes": "[Modifier] +30 Movement\n[Modifier] +3 Initiative\n[Rule] 116\n[Prerequisite] Quicker, Agi 3",
    "notesList": [
      "[Modifier] +30 Movement",
      "[Modifier] +3 Initiative",
      "[Rule] 116",
      "[Prerequisite] Quicker, Agi 3"
    ]
  },
  {
    "id": "general-regeneration",
    "name": "Regeneration",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Fast Heal, Sta 4",
    "modifiers": [],
    "description": "Regeneration is a General Feature: Heal 1 HP / Hour. Regrow lost limbs.",
    "mechanic": "Heal 1 HP / Hour. Regrow lost limbs.",
    "rules": "95",
    "special_rules": "95",
    "body": "# Regeneration\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Fast Heal, Sta 4\n\n## Description\nRegeneration is a General Feature: Heal 1 HP / Hour. Regrow lost limbs.\n\n## Mechanics & Benefit\nHeal 1 HP / Hour. Regrow lost limbs.\n\n## Special Rules\n95",
    "mechanics": "Heal 1 HP / Hour. Regrow lost limbs.",
    "notes": "[Rule] 95\n[Prerequisite] Fast Heal, Sta 4",
    "notesList": [
      "[Rule] 95",
      "[Prerequisite] Fast Heal, Sta 4"
    ]
  },
  {
    "id": "general-runner",
    "name": "Runner",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Strength 1, Agility 1, Stamina 1",
    "modifiers": [
      {
        "target": "Athletics",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Athletics"
      }
    ],
    "description": "The character is trained for exceptional land speed and endurance.",
    "mechanic": "- **Pace Multiplier Increase**: Increases the movement speed multiple of **Running** to **5x** (instead of 4x) and **Sprinting** to **7x** (instead of 6x) base walking speed without increasing action penalties.\n- **Endurance Bonus**: Gain a **+2 bonus** to Athletics checks made to avoid fatigue from running and sprinting.",
    "rules": "Prerequisite: Strength 1, Agility 1, Stamina 1.",
    "special_rules": "Prerequisite: Strength 1, Agility 1, Stamina 1.",
    "body": "# Runner\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisites**: Strength 1, Agility 1, Stamina 1  \n\n## Description\nThe character is trained for exceptional land speed, endurance pacing, and swift tactical relocation.\n\n## Mechanics & Benefit\n- **Pace Multiplier Increase**: Increases the movement speed multiple of **Running** to **5x** (instead of 4x) and **Sprinting** to **7x** (instead of 6x) base walking speed without increasing action penalties.\n- **Endurance Bonus**: Gain a **+2 bonus** to Athletics checks made to avoid fatigue from running and sprinting.",
    "mechanics": "- **Pace Multiplier Increase**: Increases the movement speed multiple of **Running** to **5x** (instead of 4x) and **Sprinting** to **7x** (instead of 6x) base walking speed without increasing action penalties.\n- **Endurance Bonus**: Gain a **+2 bonus** to Athletics checks made to avoid fatigue from running and sprinting.",
    "notes": "[Modifier] +2 to Athletics\n[Rule] Prerequisite: Strength 1, Agility 1, Stamina 1.\n[Prerequisite] Strength 1, Agility 1, Stamina 1",
    "notesList": [
      "[Modifier] +2 to Athletics",
      "[Rule] Prerequisite: Strength 1, Agility 1, Stamina 1.",
      "[Prerequisite] Strength 1, Agility 1, Stamina 1"
    ]
  },
  {
    "id": "general-soar",
    "name": "Soar",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Flight capability (Species trait, cybernetic thrusters, or invocation), Acrobatics 1",
    "modifiers": [
      {
        "target": "Acrobatics",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Acrobatics"
      }
    ],
    "description": "The character has mastered aerial dynamics, thermals, and high-velocity flight maneuvers.",
    "mechanic": "- **Aerial Multiplier Boost**: Increases the speed multiplier of **Surge / Soar** to **5x Flight Speed (10x Walk = 300 ft/rd)** and **Diving** to **9x Flight Speed (18x Walk = 540+ ft/rd)** without increasing action penalties.\n- **Aerobatic Mastery**: Gain **+2 bonus** on Acrobatics checks made to maintain flight maneuvers, execute dives, and perform controlled landings.",
    "rules": "Prerequisite: Flight capability (Species trait, cybernetic thrusters, or invocation), Acrobatics 1.",
    "special_rules": "Prerequisite: Flight capability (Species trait, cybernetic thrusters, or invocation), Acrobatics 1.",
    "body": "# Soar\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisites**: Flight capability, Acrobatics 1  \n\n## Description\nThe character has mastered aerial dynamics, thermals, and high-velocity flight maneuvers.\n\n## Mechanics & Benefit\n- **Aerial Multiplier Boost**: Increases the speed multiplier of **Surge / Soar** to **5x Flight Speed (10x Walk = 300 ft/rd)** and **Diving** to **9x Flight Speed (18x Walk = 540+ ft/rd)** without increasing action penalties.\n- **Aerobatic Mastery**: Gain **+2 bonus** on Acrobatics checks made to maintain flight maneuvers, execute dives, and perform controlled landings.",
    "mechanics": "- **Aerial Multiplier Boost**: Increases the speed multiplier of **Surge / Soar** to **5x Flight Speed (10x Walk = 300 ft/rd)** and **Diving** to **9x Flight Speed (18x Walk = 540+ ft/rd)** without increasing action penalties.\n- **Aerobatic Mastery**: Gain **+2 bonus** on Acrobatics checks made to maintain flight maneuvers, execute dives, and perform controlled landings.",
    "notes": "[Modifier] +2 to Acrobatics\n[Rule] Prerequisite: Flight capability (Species trait, cybernetic thrusters, or invocation), Acrobatics 1.\n[Prerequisite] Flight capability (Species trait, cybernetic thrusters, or invocation), Acrobatics 1",
    "notesList": [
      "[Modifier] +2 to Acrobatics",
      "[Rule] Prerequisite: Flight capability (Species trait, cybernetic thrusters, or invocation), Acrobatics 1.",
      "[Prerequisite] Flight capability (Species trait, cybernetic thrusters, or invocation), Acrobatics 1"
    ]
  },
  {
    "id": "general-swimmer",
    "name": "Swimmer",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Athletics 1",
    "modifiers": [
      {
        "target": "Athletics  Swimming",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Athletics  Swimming"
      }
    ],
    "description": "The character is an adept aquatic swimmer capable of high sustained speeds.",
    "mechanic": "- **Speed Multiplier Boost**: Increases all Swimming speeds without affecting action penalties:\n  - **Standard Swimming**: Moves at full **Base Walking Speed (1x = 30 ft/rd)** instead of half speed.\n  - **Glide Pace**: Moves at **2x Base Speed (60 ft/rd)**.\n  - **Stroke Pace**: Moves at **3x Base Speed (90 ft/rd)**.\n- **Aquatic Focus**: Gain **+2 bonus** to Athletics (Swimming) checks and double breath-holding capacity.",
    "rules": "Prerequisite: Athletics 1.",
    "special_rules": "Prerequisite: Athletics 1.",
    "body": "# Swimmer\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisites**: Athletics 1  \n\n## Description\nThe character is an adept aquatic swimmer capable of high sustained speeds and extended submersion.\n\n## Mechanics & Benefit\n- **Speed Multiplier Boost**: Increases all Swimming speeds without affecting action penalties:\n  - **Standard Swimming**: Moves at full **Base Walking Speed (1x = 30 ft/rd)** instead of half speed.\n  - **Glide Pace**: Moves at **2x Base Speed (60 ft/rd)**.\n  - **Stroke Pace**: Moves at **3x Base Speed (90 ft/rd)**.\n- **Aquatic Focus**: Gain **+2 bonus** to Athletics (Swimming) checks and double breath-holding capacity.",
    "mechanics": "- **Speed Multiplier Boost**: Increases all Swimming speeds without affecting action penalties:\n  - **Standard Swimming**: Moves at full **Base Walking Speed (1x = 30 ft/rd)** instead of half speed.\n  - **Glide Pace**: Moves at **2x Base Speed (60 ft/rd)**.\n  - **Stroke Pace**: Moves at **3x Base Speed (90 ft/rd)**.\n- **Aquatic Focus**: Gain **+2 bonus** to Athletics (Swimming) checks and double breath-holding capacity.",
    "notes": "[Modifier] +2 to Athletics  Swimming\n[Rule] Prerequisite: Athletics 1.\n[Prerequisite] Athletics 1",
    "notesList": [
      "[Modifier] +2 to Athletics  Swimming",
      "[Rule] Prerequisite: Athletics 1.",
      "[Prerequisite] Athletics 1"
    ]
  },
  {
    "id": "general-tough",
    "name": "Tough",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Stamina 1",
    "modifiers": [],
    "description": "The character has a high threshold for pain and minor trauma.",
    "mechanic": "You gain **Damage Resistance (DR) 5** specifically against **Non-Lethal** damage and Stun damage.",
    "rules": "107",
    "special_rules": "107",
    "body": "# Tough\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThe character has a high threshold for pain and minor trauma.\n\n## Mechanics & Benefit\nYou gain **Damage Resistance (DR) 5** specifically against **Non-Lethal** damage and Stun damage.\n\n## Special Rules\n107",
    "mechanics": "You gain **Damage Resistance (DR) 5** specifically against **Non-Lethal** damage and Stun damage.",
    "notes": "[Rule] 107\n[Prerequisite] Stamina 1",
    "notesList": [
      "[Rule] 107",
      "[Prerequisite] Stamina 1"
    ]
  },
  {
    "id": "general-tracker",
    "name": "Tracker",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Wisdom 1",
    "modifiers": [],
    "description": "The character is an expert hunter.",
    "mechanic": "You can follow tracks using **Survival** or **Awareness** at **Full Movement Speed** without penalty (normally tracking reduces speed to half).",
    "rules": "112",
    "special_rules": "112",
    "body": "# Tracker\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character is an expert hunter.\n\n## Mechanics & Benefit\nYou can follow tracks using **Survival** or **Awareness** at **Full Movement Speed** without penalty (normally tracking reduces speed to half).\n\n## Special Rules\n112",
    "mechanics": "You can follow tracks using **Survival** or **Awareness** at **Full Movement Speed** without penalty (normally tracking reduces speed to half).",
    "notes": "[Rule] 112\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Rule] 112",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "general-trance",
    "name": "Trance",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Wisdom 1",
    "modifiers": [],
    "description": "The character can enter a deep meditative state to conserve energy or feign death.",
    "mechanic": "You can voluntarily slow your heartbeat and metabolism. You consume 1/10th the oxygen and food. You can appear dead to casual inspection (Medicine check DC 20 to detect life).",
    "rules": "110",
    "special_rules": "110",
    "body": "# Trance\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character can enter a deep meditative state to conserve energy or feign death.\n\n## Mechanics & Benefit\nYou can voluntarily slow your heartbeat and metabolism. You consume 1/10th the oxygen and food. You can appear dead to casual inspection (Medicine check DC 20 to detect life).\n\n## Special Rules\n110",
    "mechanics": "You can voluntarily slow your heartbeat and metabolism. You consume 1/10th the oxygen and food. You can appear dead to casual inspection (Medicine check DC 20 to detect life).",
    "notes": "[Rule] 110\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Rule] 110",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "general-underworld-connections",
    "name": "Underworld Connections",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Streetwise 3",
    "modifiers": [],
    "description": "Access to illicit black market weapons, fences, and safehouses across all starports.",
    "mechanic": "The character maintains deep ties with smuggling syndicates, fences, and illegal arms dealers. They can source restricted, military, and black-market items without police interference, sell contraband merchandise at standard fence rates, and secure covert safehouses in most major civilized settlements.",
    "rules": "Characters with this feature ignore black market availability markups by 10% and gain Advantage on Streetwise checks to locate contraband or black-market contacts.",
    "special_rules": "Characters with this feature ignore black market availability markups by 10% and gain Advantage on Streetwise checks to locate contraband or black-market contacts.",
    "body": "# Underworld Connections\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Streetwise 3\n\n## Description\nAccess to illicit black market weapons, fences, and safehouses across all starports.\n\n## Mechanics & Benefit\nThe character maintains deep ties with smuggling syndicates, fences, and illegal arms dealers. They can source restricted, military, and black-market items without police interference, sell contraband merchandise at standard fence rates, and secure covert safehouses in most major civilized settlements.\n\n## Special Rules\nCharacters with this feature ignore black market availability markups by 10% and gain Advantage on Streetwise checks to locate contraband or black-market contacts.",
    "mechanics": "The character maintains deep ties with smuggling syndicates, fences, and illegal arms dealers. They can source restricted, military, and black-market items without police interference, sell contraband merchandise at standard fence rates, and secure covert safehouses in most major civilized settlements.",
    "notes": "[Rule] Characters with this feature ignore black market availability markups by 10% and gain Advantage on S...\n[Prerequisite] Streetwise 3",
    "notesList": [
      "[Rule] Characters with this feature ignore black market availability markups by 10% and gain Advantage on S...",
      "[Prerequisite] Streetwise 3"
    ]
  },
  {
    "id": "general-well-informed",
    "name": "Well Informed",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character keeps their ear to the ground and knows a little bit about every local scene.",
    "mechanic": "Upon entering a new settlement or region, you may make an immediate **Gather Information** check for free to learn the local news, rumors, and power structure.",
    "rules": "113",
    "special_rules": "113",
    "body": "# Well Informed\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character keeps their ear to the ground and knows a little bit about every local scene.\n\n## Mechanics & Benefit\nUpon entering a new settlement or region, you may make an immediate **Gather Information** check for free to learn the local news, rumors, and power structure.\n\n## Special Rules\n113",
    "mechanics": "Upon entering a new settlement or region, you may make an immediate **Gather Information** check for free to learn the local news, rumors, and power structure.",
    "notes": "[Rule] 113",
    "notesList": [
      "[Rule] 113"
    ]
  },
  {
    "id": "general-zero-g-training",
    "name": "Zero G Training",
    "category": "General",
    "type": "general",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1",
    "modifiers": [
      {
        "target": "Acrobatics when maneuvering in Zero-G",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Acrobatics when maneuvering in Zero-G"
      }
    ],
    "description": "The character is trained to operate in microgravity environments without disorientation.",
    "mechanic": "You suffer **No Disadvantage** or penalties for operating in Zero Gravity. You gain a \\+2 bonus to Acrobatics when maneuvering in Zero-G.\n\n# **KARMA FEATURES**\n\n# **KARMA FEATURES**\n\nManipulation of luck, faith, and the Karma pool.\n\n| FEATURE NAME | PREREQUISITE | BENEFIT / EFFECT | SPECIAL / NOTES |\n| :---- | :---- | :---- | :---- |\n| **Beginner's Luck** | Skill Rank \\< 6 | Gain 5 Temporary Skill ranks for the scene (Cost: 1 KP). | 118 |\n| **Believer** | \\- | Call upon one’s Faith for a Skill reroll once per day. | Ranked (Wis) 119  |\n| **Devout** | Believer | Call upon one’s Faith for an Ability Check reroll once per day. | Ranked (Cha) 120  |\n| **True Faith** | Believer, Devout | Double effects from any Karma points on behalf of their Faith. | 121 |\n| **Charmed** | Karma 4 | Re-roll 1 Fumble 1/day (without spending Karma Point). | 122 |\n| **Inspiration** | \\- | Spend a Karma Point to benefit an ally (1kp \\+ cost). | 123 |\n| **Karmic Blessing** | \\- | \\+2 maximum Karma points. | Multiple 124  |\n| **Seize Initiative** | \\- | Go first in combat (Cost: 1 KP). | 125 |\n| **Surge** | \\- | 1 extra action in a round (Cost: 1 KP). | 126 |\n| **Ultimate Effort** | \\- | Make 20 on check for 1 chosen trait (Cost: 1 KP). | Multiple 127  |\n\nKarma Features represent a character's destiny, luck, divine favor, or sheer force of will. They allow players to manipulate the game mechanics in moments of crisis, spending **Karma Points (KP)** or daily uses to alter outcomes.",
    "rules": "117",
    "special_rules": "117",
    "body": "# Zero G Training\n\n**Category**: General Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character is trained to operate in microgravity environments without disorientation.\n\n## Mechanics & Benefit\nYou suffer **No Disadvantage** or penalties for operating in Zero Gravity. You gain a \\+2 bonus to Acrobatics when maneuvering in Zero-G.\n\n# **KARMA FEATURES**\n\n# **KARMA FEATURES**\n\nManipulation of luck, faith, and the Karma pool.\n\n| FEATURE NAME | PREREQUISITE | BENEFIT / EFFECT | SPECIAL / NOTES |\n| :---- | :---- | :---- | :---- |\n| **Beginner's Luck** | Skill Rank \\< 6 | Gain 5 Temporary Skill ranks for the scene (Cost: 1 KP). | 118 |\n| **Believer** | \\- | Call upon one’s Faith for a Skill reroll once per day. | Ranked (Wis) 119  |\n| **Devout** | Believer | Call upon one’s Faith for an Ability Check reroll once per day. | Ranked (Cha) 120  |\n| **True Faith** | Believer, Devout | Double effects from any Karma points on behalf of their Faith. | 121 |\n| **Charmed** | Karma 4 | Re-roll 1 Fumble 1/day (without spending Karma Point). | 122 |\n| **Inspiration** | \\- | Spend a Karma Point to benefit an ally (1kp \\+ cost). | 123 |\n| **Karmic Blessing** | \\- | \\+2 maximum Karma points. | Multiple 124  |\n| **Seize Initiative** | \\- | Go first in combat (Cost: 1 KP). | 125 |\n| **Surge** | \\- | 1 extra action in a round (Cost: 1 KP). | 126 |\n| **Ultimate Effort** | \\- | Make 20 on check for 1 chosen trait (Cost: 1 KP). | Multiple 127  |\n\nKarma Features represent a character's destiny, luck, divine favor, or sheer force of will. They allow players to manipulate the game mechanics in moments of crisis, spending **Karma Points (KP)** or daily uses to alter outcomes.\n\n## Special Rules\n117",
    "mechanics": "You suffer **No Disadvantage** or penalties for operating in Zero Gravity. You gain a \\+2 bonus to Acrobatics when maneuvering in Zero-G.\n\n# **KARMA FEATURES**\n\n# **KARMA FEATURES**\n\nManipulation of luck, faith, and the Karma pool.\n\n| FEATURE NAME | PREREQUISITE | BENEFIT / EFFECT | SPECIAL / NOTES |\n| :---- | :---- | :---- | :---- |\n| **Beginner's Luck** | Skill Rank \\< 6 | Gain 5 Temporary Skill ranks for the scene (Cost: 1 KP). | 118 |\n| **Believer** | \\- | Call upon one’s Faith for a Skill reroll once per day. | Ranked (Wis) 119  |\n| **Devout** | Believer | Call upon one’s Faith for an Ability Check reroll once per day. | Ranked (Cha) 120  |\n| **True Faith** | Believer, Devout | Double effects from any Karma points on behalf of their Faith. | 121 |\n| **Charmed** | Karma 4 | Re-roll 1 Fumble 1/day (without spending Karma Point). | 122 |\n| **Inspiration** | \\- | Spend a Karma Point to benefit an ally (1kp \\+ cost). | 123 |\n| **Karmic Blessing** | \\- | \\+2 maximum Karma points. | Multiple 124  |\n| **Seize Initiative** | \\- | Go first in combat (Cost: 1 KP). | 125 |\n| **Surge** | \\- | 1 extra action in a round (Cost: 1 KP). | 126 |\n| **Ultimate Effort** | \\- | Make 20 on check for 1 chosen trait (Cost: 1 KP). | Multiple 127  |\n\nKarma Features represent a character's destiny, luck, divine favor, or sheer force of will. They allow players to manipulate the game mechanics in moments of crisis, spending **Karma Points (KP)** or daily uses to alter outcomes.",
    "notes": "[Modifier] +2 to Acrobatics when maneuvering in Zero-G\n[Rule] 117\n[Prerequisite] Agility 1",
    "notesList": [
      "[Modifier] +2 to Acrobatics when maneuvering in Zero-G",
      "[Rule] 117",
      "[Prerequisite] Agility 1"
    ]
  },
  {
    "id": "karma-beginner-s-luck",
    "name": "Beginner's Luck",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "The Skill being attempted must be at **Rank 5 (Novice) or lower**.",
    "modifiers": [
      {
        "target": "Karma",
        "type": "karma",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Karma Pool"
      }
    ],
    "description": "The character has an uncanny knack for succeeding at things they have no business doing. When inexperienced, they rely on instinct and fortune rather than training.",
    "mechanic": "You may spend **1 Karma Point** to gain **\\+5 Temporary Ranks** in a specific skill for the duration of the current scene or encounter.  \n  * *Mechanics:* This effectively treats an Untrained (Rank 0\\) character as a Novice (Rank 5), or a Novice as a Professional (Rank 6-10) for a short time.",
    "rules": "118",
    "special_rules": "118",
    "body": "# Beginner's Luck\n\n**Category**: Karma Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: The Skill being attempted must be at **Rank 5 (Novice) or lower**.\n\n## Description\nThe character has an uncanny knack for succeeding at things they have no business doing. When inexperienced, they rely on instinct and fortune rather than training.\n\n## Mechanics & Benefit\nYou may spend **1 Karma Point** to gain **\\+5 Temporary Ranks** in a specific skill for the duration of the current scene or encounter.  \n  * *Mechanics:* This effectively treats an Untrained (Rank 0\\) character as a Novice (Rank 5), or a Novice as a Professional (Rank 6-10) for a short time.\n\n## Special Rules\n118",
    "mechanics": "You may spend **1 Karma Point** to gain **\\+5 Temporary Ranks** in a specific skill for the duration of the current scene or encounter.  \n  * *Mechanics:* This effectively treats an Untrained (Rank 0\\) character as a Novice (Rank 5), or a Novice as a Professional (Rank 6-10) for a short time.",
    "notes": "[Modifier] +1 to Karma Pool\n[Rule] 118\n[Prerequisite] The Skill being attempted must be at **Rank 5 (Novice) or lower**.",
    "notesList": [
      "[Modifier] +1 to Karma Pool",
      "[Rule] 118",
      "[Prerequisite] The Skill being attempted must be at **Rank 5 (Novice) or lower**."
    ]
  },
  {
    "id": "karma-believer",
    "name": "Believer",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Wisdom 1",
    "modifiers": [],
    "description": "The character possesses a profound faith in a higher power, a philosophy, or a cosmic order. In times of need, they can draw upon this faith to guide their hand.",
    "mechanic": "**Once per day**, you may re-roll any single failed **Skill Check**.  \n  * *Mechanics:* This does **not** cost Karma Points. It is a daily ability refreshed after a Full Rest. You must accept the result of the second roll.",
    "rules": "This feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum rank is limited by your **Wisdom** score.",
    "special_rules": "This feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum rank is limited by your **Wisdom** score.",
    "body": "# Believer\n\n**Category**: Karma Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character possesses a profound faith in a higher power, a philosophy, or a cosmic order. In times of need, they can draw upon this faith to guide their hand.\n\n## Mechanics & Benefit\n**Once per day**, you may re-roll any single failed **Skill Check**.  \n  * *Mechanics:* This does **not** cost Karma Points. It is a daily ability refreshed after a Full Rest. You must accept the result of the second roll.\n\n## Special Rules\nThis feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum rank is limited by your **Wisdom** score.",
    "mechanics": "**Once per day**, you may re-roll any single failed **Skill Check**.  \n  * *Mechanics:* This does **not** cost Karma Points. It is a daily ability refreshed after a Full Rest. You must accept the result of the second roll.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum r...\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] This feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum r...",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "karma-charmed",
    "name": "Charmed",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Maximum Karma Pool of 4+",
    "modifiers": [],
    "description": "The character leads a charmed life. Disasters that would doom others seem to miss them by inches.",
    "mechanic": "**Once per day**, if you roll a **Natural 1** (Fumble/Critical Failure), you may immediately re-roll it without spending a Karma Point.  \n  * *Mechanics:* This serves as a free \"safety net\" against catastrophic failure.",
    "rules": "122",
    "special_rules": "122",
    "body": "# Charmed\n\n**Category**: Karma Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Maximum Karma Pool of 4+\n\n## Description\nThe character leads a charmed life. Disasters that would doom others seem to miss them by inches.\n\n## Mechanics & Benefit\n**Once per day**, if you roll a **Natural 1** (Fumble/Critical Failure), you may immediately re-roll it without spending a Karma Point.  \n  * *Mechanics:* This serves as a free \"safety net\" against catastrophic failure.\n\n## Special Rules\n122",
    "mechanics": "**Once per day**, if you roll a **Natural 1** (Fumble/Critical Failure), you may immediately re-roll it without spending a Karma Point.  \n  * *Mechanics:* This serves as a free \"safety net\" against catastrophic failure.",
    "notes": "[Rule] 122\n[Prerequisite] Maximum Karma Pool of 4+",
    "notesList": [
      "[Rule] 122",
      "[Prerequisite] Maximum Karma Pool of 4+"
    ]
  },
  {
    "id": "karma-devout",
    "name": "Devout",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Believer",
    "modifiers": [],
    "description": "Devout is a Karma Feature: Call upon one’s Faith for an Ability Check reroll once per day.",
    "mechanic": "Call upon one’s Faith for an Ability Check reroll once per day.",
    "rules": "Ranked (Cha) 120",
    "special_rules": "Ranked (Cha) 120",
    "body": "# Devout\n\n**Category**: Karma Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Believer\n\n## Description\nDevout is a Karma Feature: Call upon one’s Faith for an Ability Check reroll once per day.\n\n## Mechanics & Benefit\nCall upon one’s Faith for an Ability Check reroll once per day.\n\n## Special Rules\nRanked (Cha) 120",
    "mechanics": "Call upon one’s Faith for an Ability Check reroll once per day.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked (Cha) 120\n[Prerequisite] Believer",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked (Cha) 120",
      "[Prerequisite] Believer"
    ]
  },
  {
    "id": "karma-inspiration",
    "name": "Inspiration",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 2",
    "modifiers": [],
    "description": "The character is the heart of the team. They can lend their own luck and determination to allies, spurring them on to greatness.",
    "mechanic": "You may spend your own **Karma Points** to grant a Karma Benefit to an **Ally**.  \n  * *Cost:* The cost is **1 KP (Transfer Cost) \\+ The Cost of the Effect**.  \n  * *Example:* To give an ally *Surge* (normally 1 KP), you spend 2 KP. To give an ally *Advantage* (\"I Got This\", normally 1 KP), you spend 2 KP.",
    "rules": "123",
    "special_rules": "123",
    "body": "# Inspiration\n\n**Category**: Karma Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character is the heart of the team. They can lend their own luck and determination to allies, spurring them on to greatness.\n\n## Mechanics & Benefit\nYou may spend your own **Karma Points** to grant a Karma Benefit to an **Ally**.  \n  * *Cost:* The cost is **1 KP (Transfer Cost) \\+ The Cost of the Effect**.  \n  * *Example:* To give an ally *Surge* (normally 1 KP), you spend 2 KP. To give an ally *Advantage* (\"I Got This\", normally 1 KP), you spend 2 KP.\n\n## Special Rules\n123",
    "mechanics": "You may spend your own **Karma Points** to grant a Karma Benefit to an **Ally**.  \n  * *Cost:* The cost is **1 KP (Transfer Cost) \\+ The Cost of the Effect**.  \n  * *Example:* To give an ally *Surge* (normally 1 KP), you spend 2 KP. To give an ally *Advantage* (\"I Got This\", normally 1 KP), you spend 2 KP.",
    "notes": "[Rule] 123\n[Prerequisite] Charisma 2",
    "notesList": [
      "[Rule] 123",
      "[Prerequisite] Charisma 2"
    ]
  },
  {
    "id": "karma-karmic-blessing",
    "name": "Karmic Blessing",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character has a larger destiny than most. Fate has stockpiled more luck for them to use.",
    "mechanic": "Increase your **Maximum Karma Pool** by **+1 Point** per rank of this feature.  \n  * *Default:* Characters start with 3 Max Karma Points by default. This feature raises that cap by +1 per rank taken.",
    "rules": "This feature is **[Ranked / Multiple]**. You may take it multiple times to keep expanding your pool by +1 point per rank.",
    "special_rules": "This feature is **[Ranked / Multiple]**. You may take it multiple times to keep expanding your pool by +1 point per rank.",
    "body": "# Karmic Blessing\n\n**Category**: Karma Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character has a larger destiny than most. Fate has stockpiled more luck for them to use.\n\n## Mechanics & Benefit\nIncrease your **Maximum Karma Pool** by **+1 Point** per rank of this feature.  \n  * *Default:* Characters start with 3 Max Karma Points by default. This feature raises that cap by +1 per rank taken.\n\n## Special Rules\nThis feature is **[Ranked / Multiple]**. You may take it multiple times to keep expanding your pool by +1 point per rank.",
    "mechanics": "Increase your **Maximum Karma Pool** by **+1 Point** per rank of this feature.  \n  * *Default:* Characters start with 3 Max Karma Points by default. This feature raises that cap by +1 per rank taken.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **[Ranked / Multiple]**. You may take it multiple times to keep expanding your pool ...",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **[Ranked / Multiple]**. You may take it multiple times to keep expanding your pool ..."
    ]
  },
  {
    "id": "karma-seize-initiative",
    "name": "Seize Initiative",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "-",
    "modifiers": [],
    "description": "The character reacts with blazing speed when chaos erupts, acting before the enemy can blink.",
    "mechanic": "You automatically go **First** in the initiative order, regardless of your Agility or roll.  \n  * *Conflict:* If multiple characters (allies or enemies) use this feature, they are ranked at the top of the order, sorted by their Agility scores.",
    "rules": "125",
    "special_rules": "125",
    "body": "# Seize Initiative\n\n**Category**: Karma Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: \\-\n\n## Description\nThe character reacts with blazing speed when chaos erupts, acting before the enemy can blink.\n\n## Mechanics & Benefit\nYou automatically go **First** in the initiative order, regardless of your Agility or roll.  \n  * *Conflict:* If multiple characters (allies or enemies) use this feature, they are ranked at the top of the order, sorted by their Agility scores.\n\n## Special Rules\n125",
    "mechanics": "You automatically go **First** in the initiative order, regardless of your Agility or roll.  \n  * *Conflict:* If multiple characters (allies or enemies) use this feature, they are ranked at the top of the order, sorted by their Agility scores.",
    "notes": "[Rule] 125\n[Prerequisite] -",
    "notesList": [
      "[Rule] 125",
      "[Prerequisite] -"
    ]
  },
  {
    "id": "karma-surge",
    "name": "Surge",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "-",
    "modifiers": [],
    "description": "The character pushes their body and mind beyond standard limits, fitting more action into a moment than should be possible.",
    "mechanic": "You gain **1 additional Standard Action** this round.  \n  * *Usage:* This allows for a Move \\+ Attack \\+ Attack, or Move \\+ Cast Spell \\+ Attack. It breaks the standard action economy.",
    "rules": "126",
    "special_rules": "126",
    "body": "# Surge\n\n**Category**: Karma Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: \\-\n\n## Description\nThe character pushes their body and mind beyond standard limits, fitting more action into a moment than should be possible.\n\n## Mechanics & Benefit\nYou gain **1 additional Standard Action** this round.  \n  * *Usage:* This allows for a Move \\+ Attack \\+ Attack, or Move \\+ Cast Spell \\+ Attack. It breaks the standard action economy.\n\n## Special Rules\n126",
    "mechanics": "You gain **1 additional Standard Action** this round.  \n  * *Usage:* This allows for a Move \\+ Attack \\+ Attack, or Move \\+ Cast Spell \\+ Attack. It breaks the standard action economy.",
    "notes": "[Rule] 126\n[Prerequisite] -",
    "notesList": [
      "[Rule] 126",
      "[Prerequisite] -"
    ]
  },
  {
    "id": "karma-true-faith",
    "name": "True Faith",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Believer, Devout",
    "modifiers": [],
    "description": "True Faith is a Karma Feature: Double effects from any Karma points on behalf of their Faith.",
    "mechanic": "Double effects from any Karma points on behalf of their Faith.",
    "rules": "121",
    "special_rules": "121",
    "body": "# True Faith\n\n**Category**: Karma Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Believer, Devout\n\n## Description\nTrue Faith is a Karma Feature: Double effects from any Karma points on behalf of their Faith.\n\n## Mechanics & Benefit\nDouble effects from any Karma points on behalf of their Faith.\n\n## Special Rules\n121",
    "mechanics": "Double effects from any Karma points on behalf of their Faith.",
    "notes": "[Rule] 121\n[Prerequisite] Believer, Devout",
    "notesList": [
      "[Rule] 121",
      "[Prerequisite] Believer, Devout"
    ]
  },
  {
    "id": "karma-ultimate-effort",
    "name": "Ultimate Effort",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "None (Must be assigned to a specific Trait/Skill/Attribute).",
    "modifiers": [
      {
        "target": "Will",
        "type": "save",
        "value": 1,
        "mode": "inherent",
        "description": "+1 on Will Checks"
      },
      {
        "target": "Etiquette",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Etiquette"
      },
      {
        "target": "Knowledge",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Knowledge"
      },
      {
        "target": "Metaphysics Knowledge",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Metaphysics Knowledge"
      },
      {
        "target": "Mastercrafting",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Mastercrafting"
      }
    ],
    "description": "The character is a savant or master in a specific field. When they truly focus, failure is impossible.",
    "mechanic": "Treat a specific **Non-Combat** check as if you rolled a **Natural 20**.  \n  * *Mechanics:* You do not roll. You calculate the result as: 20 \\+ Skill Rank \\+ Attribute Mod \\+ Modifiers. This guarantees a critical success on almost any standard difficulty task.",
    "rules": "This feature is **\\[Multiple\\]**. You must select which trait it applies to when purchased (e.g., *Ultimate Effort: Engineering* or *Ultimate Effort: Strength*).\n\n# **SKILL FEATURES**\n\n# **SKILL FEATURES**\n\nBonuses and specialized uses for skills.\n\n| FEATURE NAME | PREREQUISITE | BENEFIT / EFFECT | SPECIAL / NOTES |\n| :---- | :---- | :---- | :---- |\n| **Aeronaut** | Pilot (Unpowered) 1 | Make Unpowered Pilot checks at Advantage. | 128 |\n| **Animal Affinity** | \\- | \\+2 Handle and Ride animals (Survival). | 129 |\n| **Artificer** | Attune 11, Discipline 11, Craft 11 | Metacraft Prototyping checks made with Advantage. | 130 |\n| **Artistic** | \\- | \\+2 to 2 Performance or Vocation Subskills. | 131 |\n| **Attractive** | Cha 2 | \\+2 Social checks for physical appeal. | Ranked (Cha) 132  |\n| **Biotechnologist** | Bio/Botany/Med 11 | Biotechnology Prototyping with Advantage. | 133 |\n| **Computer Specialist** | \\- | \\+2 All Computer Tasks. | 134 |\n| **Digital Expert** | Computer Specialist | Perform Computer Tasks in 1/2 time. | 135 |\n| **Coding Master** | Computer Specialist | Perform Computer Tasks at Advantage. | 136 |\n| **Deceitful** | \\- | \\+2 Manipulation Skills and \\+1 to Etiquette checks. | 137 |\n| **Educated** | Academics 5, Knowledge 5 | \\+2 Academics and \\+1 to all Knowledge Skills. | 138 |\n| **Entertaining** | Cha 1 | \\+1 Any Performance Check. | Ranked (Cha) 139  |\n| **Gearhead** | \\- | \\+2 All Mechanical based Knowledge, Operation, Repair checks. | 140 |\n| **Gifted Pilot** | Pilot 6 | \\+2 Piloting, \\+10% to Maximum Vehicle Speed. | 141 |\n| **Crack Pilot** | Gifted Pilot, Pilot 11 | \\+4 Piloting, \\+20% to Maximum Vehicle Speed. | 142 |\n| **Ace Pilot** | Crack Pilot, Pilot 16 | \\+6 Piloting, \\+30% to Maximum Vehicle Speed. | 143 |\n| **Graceful** | \\- | \\+1 All Agi based non-attack skill checks and Reflex checks. | 144 |\n| **Headstrong** | \\- | \\+2 Bluff, Intimidate checks and \\+1 to Will checks. | 145 |\n| **Influence** | Cha 2 | \\+4 Reputation and Favor checks (Diplomacy). | 146 |\n| **Investigator** | \\- | \\+2 Investigation and Gather Information checks. | 147 |\n| **Linguist** | \\- | \\+2 Language, may take 10 on Language checks. | 148 |\n| **Logical** | \\- | \\+2 Logic Checks and may take 10 on Logic Checks. | 149 |\n| **Magical Aptitude** | \\- | \\+2 Attune and \\+1 to Metaphysics Knowledge checks. | 150 |\n| **Master Craftsman** | Crafting 6 | \\+2 Crafting Checks and \\+2 to Mastercrafting. | 151 |\n| **Medic** | \\- | \\+2 Medicine, First Aid is a Standard Action. | 152 |\n| **Meticulous** | \\- | Meticulous Skill bonuses increase by 1 per stage. | 153 |\n| **Naturalist** | \\- | \\+2 Nature and Survival checks. | 154 |\n| **Nimble Fingers** | \\- | \\+2 Sleight of Hand and Disable Device (Security) checks. | 155 |\n| **Persuasive** | \\- | \\+2 Diplomacy and Intimidate checks. | 156 |\n| **Perceptive** | \\- | \\+2 Perception checks and \\+1 Insight checks. | 157 |\n| **Researcher** | \\- | \\+2 Academics and Library Use checks. | 158 |\n| **Scholar** | \\- | \\+2 All Knowledge Skills. | 159 |\n| **Self Sufficient** | \\- | \\+2 Survival and \\+1 Fortitude checks. | 160 |\n| **Silver Tongue** | Cha 1, Diplomacy 1 | Adjust Diplomacy checks by additional step. | 161 |\n| **Golden Smile** | Silver Tongue, Cha 2, Dip/Bluff 6 | Take 10 or add d10 to Bluff and Diplomacy checks. | 162 |\n| **Platinum Personality** | Golden Smile, Cha 4, Dip/Bluff 11 | Make Bluff and Diplomacy Checks with Advantage. | 163 |\n| **Skill Focus** | Chosen Skill 1 | Bonus of \\+2 and may be gained at each skill stage. | Multiple 164  |\n| **Skill Mastery** | Skill Focus (2), Rank 11+ | Take 10 with ALL skills at 11+ with Skill Focus. | 165 |\n| **Skill Specialization** | Chosen Skill 1 | Enable a path of expertise which adds to base skill (up to 10 levels). | Multiple 166  |\n| **Social** | \\- | \\+1 ALL Cha Skills and Etiquette checks. | 167 |\n| **Spacer** | \\- | \\+2 All Starship and any Space Survival checks. | 168 |\n| **Steady** | \\- | \\+2 Acrobatics, Athletics and \\+1 Ref checks. | 169 |\n| **Stealthy** | \\- | \\+2 Escape Artist, Sleight of Hand checks and \\+4 Stealth. | 170 |\n| **Stout** | \\- | \\+1 ALL Sta & Con Skills and Might & Fortitude Checks. | 171 |\n| **Trustworthy** | \\- | \\+2 Manipulation Skills and \\+1 Culture checks. | 172 |\n| **Veiled Threat** | \\- | Target doesn't become hostile after Intimidation. | 173 |\n| **Versatile Curator** | Knowledge 6, Int 2 | Virtual skills as additional Knowledge skills (1 per Int \\> 1). | 174 |\n| **Versatile Performer** | Perform 6, Int 2 | Virtual skills as additional Perform skills (1 per Int \\> 1). | 175 |\n| **Versatile Professional** | Vocation 6, Int 2 | Virtual skills as additional Vocation skills (1 per Int \\> 1). | 176 |",
    "special_rules": "This feature is **\\[Multiple\\]**. You must select which trait it applies to when purchased (e.g., *Ultimate Effort: Engineering* or *Ultimate Effort: Strength*).\n\n# **SKILL FEATURES**\n\n# **SKILL FEATURES**\n\nBonuses and specialized uses for skills.\n\n| FEATURE NAME | PREREQUISITE | BENEFIT / EFFECT | SPECIAL / NOTES |\n| :---- | :---- | :---- | :---- |\n| **Aeronaut** | Pilot (Unpowered) 1 | Make Unpowered Pilot checks at Advantage. | 128 |\n| **Animal Affinity** | \\- | \\+2 Handle and Ride animals (Survival). | 129 |\n| **Artificer** | Attune 11, Discipline 11, Craft 11 | Metacraft Prototyping checks made with Advantage. | 130 |\n| **Artistic** | \\- | \\+2 to 2 Performance or Vocation Subskills. | 131 |\n| **Attractive** | Cha 2 | \\+2 Social checks for physical appeal. | Ranked (Cha) 132  |\n| **Biotechnologist** | Bio/Botany/Med 11 | Biotechnology Prototyping with Advantage. | 133 |\n| **Computer Specialist** | \\- | \\+2 All Computer Tasks. | 134 |\n| **Digital Expert** | Computer Specialist | Perform Computer Tasks in 1/2 time. | 135 |\n| **Coding Master** | Computer Specialist | Perform Computer Tasks at Advantage. | 136 |\n| **Deceitful** | \\- | \\+2 Manipulation Skills and \\+1 to Etiquette checks. | 137 |\n| **Educated** | Academics 5, Knowledge 5 | \\+2 Academics and \\+1 to all Knowledge Skills. | 138 |\n| **Entertaining** | Cha 1 | \\+1 Any Performance Check. | Ranked (Cha) 139  |\n| **Gearhead** | \\- | \\+2 All Mechanical based Knowledge, Operation, Repair checks. | 140 |\n| **Gifted Pilot** | Pilot 6 | \\+2 Piloting, \\+10% to Maximum Vehicle Speed. | 141 |\n| **Crack Pilot** | Gifted Pilot, Pilot 11 | \\+4 Piloting, \\+20% to Maximum Vehicle Speed. | 142 |\n| **Ace Pilot** | Crack Pilot, Pilot 16 | \\+6 Piloting, \\+30% to Maximum Vehicle Speed. | 143 |\n| **Graceful** | \\- | \\+1 All Agi based non-attack skill checks and Reflex checks. | 144 |\n| **Headstrong** | \\- | \\+2 Bluff, Intimidate checks and \\+1 to Will checks. | 145 |\n| **Influence** | Cha 2 | \\+4 Reputation and Favor checks (Diplomacy). | 146 |\n| **Investigator** | \\- | \\+2 Investigation and Gather Information checks. | 147 |\n| **Linguist** | \\- | \\+2 Language, may take 10 on Language checks. | 148 |\n| **Logical** | \\- | \\+2 Logic Checks and may take 10 on Logic Checks. | 149 |\n| **Magical Aptitude** | \\- | \\+2 Attune and \\+1 to Metaphysics Knowledge checks. | 150 |\n| **Master Craftsman** | Crafting 6 | \\+2 Crafting Checks and \\+2 to Mastercrafting. | 151 |\n| **Medic** | \\- | \\+2 Medicine, First Aid is a Standard Action. | 152 |\n| **Meticulous** | \\- | Meticulous Skill bonuses increase by 1 per stage. | 153 |\n| **Naturalist** | \\- | \\+2 Nature and Survival checks. | 154 |\n| **Nimble Fingers** | \\- | \\+2 Sleight of Hand and Disable Device (Security) checks. | 155 |\n| **Persuasive** | \\- | \\+2 Diplomacy and Intimidate checks. | 156 |\n| **Perceptive** | \\- | \\+2 Perception checks and \\+1 Insight checks. | 157 |\n| **Researcher** | \\- | \\+2 Academics and Library Use checks. | 158 |\n| **Scholar** | \\- | \\+2 All Knowledge Skills. | 159 |\n| **Self Sufficient** | \\- | \\+2 Survival and \\+1 Fortitude checks. | 160 |\n| **Silver Tongue** | Cha 1, Diplomacy 1 | Adjust Diplomacy checks by additional step. | 161 |\n| **Golden Smile** | Silver Tongue, Cha 2, Dip/Bluff 6 | Take 10 or add d10 to Bluff and Diplomacy checks. | 162 |\n| **Platinum Personality** | Golden Smile, Cha 4, Dip/Bluff 11 | Make Bluff and Diplomacy Checks with Advantage. | 163 |\n| **Skill Focus** | Chosen Skill 1 | Bonus of \\+2 and may be gained at each skill stage. | Multiple 164  |\n| **Skill Mastery** | Skill Focus (2), Rank 11+ | Take 10 with ALL skills at 11+ with Skill Focus. | 165 |\n| **Skill Specialization** | Chosen Skill 1 | Enable a path of expertise which adds to base skill (up to 10 levels). | Multiple 166  |\n| **Social** | \\- | \\+1 ALL Cha Skills and Etiquette checks. | 167 |\n| **Spacer** | \\- | \\+2 All Starship and any Space Survival checks. | 168 |\n| **Steady** | \\- | \\+2 Acrobatics, Athletics and \\+1 Ref checks. | 169 |\n| **Stealthy** | \\- | \\+2 Escape Artist, Sleight of Hand checks and \\+4 Stealth. | 170 |\n| **Stout** | \\- | \\+1 ALL Sta & Con Skills and Might & Fortitude Checks. | 171 |\n| **Trustworthy** | \\- | \\+2 Manipulation Skills and \\+1 Culture checks. | 172 |\n| **Veiled Threat** | \\- | Target doesn't become hostile after Intimidation. | 173 |\n| **Versatile Curator** | Knowledge 6, Int 2 | Virtual skills as additional Knowledge skills (1 per Int \\> 1). | 174 |\n| **Versatile Performer** | Perform 6, Int 2 | Virtual skills as additional Perform skills (1 per Int \\> 1). | 175 |\n| **Versatile Professional** | Vocation 6, Int 2 | Virtual skills as additional Vocation skills (1 per Int \\> 1). | 176 |",
    "body": "# Ultimate Effort\n\n**Category**: Karma Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None (Must be assigned to a specific Trait/Skill/Attribute).\n\n## Description\nThe character is a savant or master in a specific field. When they truly focus, failure is impossible.\n\n## Mechanics & Benefit\nTreat a specific **Non-Combat** check as if you rolled a **Natural 20**.  \n  * *Mechanics:* You do not roll. You calculate the result as: 20 \\+ Skill Rank \\+ Attribute Mod \\+ Modifiers. This guarantees a critical success on almost any standard difficulty task.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. You must select which trait it applies to when purchased (e.g., *Ultimate Effort: Engineering* or *Ultimate Effort: Strength*).\n\n# **SKILL FEATURES**\n\n# **SKILL FEATURES**\n\nBonuses and specialized uses for skills.\n\n| FEATURE NAME | PREREQUISITE | BENEFIT / EFFECT | SPECIAL / NOTES |\n| :---- | :---- | :---- | :---- |\n| **Aeronaut** | Pilot (Unpowered) 1 | Make Unpowered Pilot checks at Advantage. | 128 |\n| **Animal Affinity** | \\- | \\+2 Handle and Ride animals (Survival). | 129 |\n| **Artificer** | Attune 11, Discipline 11, Craft 11 | Metacraft Prototyping checks made with Advantage. | 130 |\n| **Artistic** | \\- | \\+2 to 2 Performance or Vocation Subskills. | 131 |\n| **Attractive** | Cha 2 | \\+2 Social checks for physical appeal. | Ranked (Cha) 132  |\n| **Biotechnologist** | Bio/Botany/Med 11 | Biotechnology Prototyping with Advantage. | 133 |\n| **Computer Specialist** | \\- | \\+2 All Computer Tasks. | 134 |\n| **Digital Expert** | Computer Specialist | Perform Computer Tasks in 1/2 time. | 135 |\n| **Coding Master** | Computer Specialist | Perform Computer Tasks at Advantage. | 136 |\n| **Deceitful** | \\- | \\+2 Manipulation Skills and \\+1 to Etiquette checks. | 137 |\n| **Educated** | Academics 5, Knowledge 5 | \\+2 Academics and \\+1 to all Knowledge Skills. | 138 |\n| **Entertaining** | Cha 1 | \\+1 Any Performance Check. | Ranked (Cha) 139  |\n| **Gearhead** | \\- | \\+2 All Mechanical based Knowledge, Operation, Repair checks. | 140 |\n| **Gifted Pilot** | Pilot 6 | \\+2 Piloting, \\+10% to Maximum Vehicle Speed. | 141 |\n| **Crack Pilot** | Gifted Pilot, Pilot 11 | \\+4 Piloting, \\+20% to Maximum Vehicle Speed. | 142 |\n| **Ace Pilot** | Crack Pilot, Pilot 16 | \\+6 Piloting, \\+30% to Maximum Vehicle Speed. | 143 |\n| **Graceful** | \\- | \\+1 All Agi based non-attack skill checks and Reflex checks. | 144 |\n| **Headstrong** | \\- | \\+2 Bluff, Intimidate checks and \\+1 to Will checks. | 145 |\n| **Influence** | Cha 2 | \\+4 Reputation and Favor checks (Diplomacy). | 146 |\n| **Investigator** | \\- | \\+2 Investigation and Gather Information checks. | 147 |\n| **Linguist** | \\- | \\+2 Language, may take 10 on Language checks. | 148 |\n| **Logical** | \\- | \\+2 Logic Checks and may take 10 on Logic Checks. | 149 |\n| **Magical Aptitude** | \\- | \\+2 Attune and \\+1 to Metaphysics Knowledge checks. | 150 |\n| **Master Craftsman** | Crafting 6 | \\+2 Crafting Checks and \\+2 to Mastercrafting. | 151 |\n| **Medic** | \\- | \\+2 Medicine, First Aid is a Standard Action. | 152 |\n| **Meticulous** | \\- | Meticulous Skill bonuses increase by 1 per stage. | 153 |\n| **Naturalist** | \\- | \\+2 Nature and Survival checks. | 154 |\n| **Nimble Fingers** | \\- | \\+2 Sleight of Hand and Disable Device (Security) checks. | 155 |\n| **Persuasive** | \\- | \\+2 Diplomacy and Intimidate checks. | 156 |\n| **Perceptive** | \\- | \\+2 Perception checks and \\+1 Insight checks. | 157 |\n| **Researcher** | \\- | \\+2 Academics and Library Use checks. | 158 |\n| **Scholar** | \\- | \\+2 All Knowledge Skills. | 159 |\n| **Self Sufficient** | \\- | \\+2 Survival and \\+1 Fortitude checks. | 160 |\n| **Silver Tongue** | Cha 1, Diplomacy 1 | Adjust Diplomacy checks by additional step. | 161 |\n| **Golden Smile** | Silver Tongue, Cha 2, Dip/Bluff 6 | Take 10 or add d10 to Bluff and Diplomacy checks. | 162 |\n| **Platinum Personality** | Golden Smile, Cha 4, Dip/Bluff 11 | Make Bluff and Diplomacy Checks with Advantage. | 163 |\n| **Skill Focus** | Chosen Skill 1 | Bonus of \\+2 and may be gained at each skill stage. | Multiple 164  |\n| **Skill Mastery** | Skill Focus (2), Rank 11+ | Take 10 with ALL skills at 11+ with Skill Focus. | 165 |\n| **Skill Specialization** | Chosen Skill 1 | Enable a path of expertise which adds to base skill (up to 10 levels). | Multiple 166  |\n| **Social** | \\- | \\+1 ALL Cha Skills and Etiquette checks. | 167 |\n| **Spacer** | \\- | \\+2 All Starship and any Space Survival checks. | 168 |\n| **Steady** | \\- | \\+2 Acrobatics, Athletics and \\+1 Ref checks. | 169 |\n| **Stealthy** | \\- | \\+2 Escape Artist, Sleight of Hand checks and \\+4 Stealth. | 170 |\n| **Stout** | \\- | \\+1 ALL Sta & Con Skills and Might & Fortitude Checks. | 171 |\n| **Trustworthy** | \\- | \\+2 Manipulation Skills and \\+1 Culture checks. | 172 |\n| **Veiled Threat** | \\- | Target doesn't become hostile after Intimidation. | 173 |\n| **Versatile Curator** | Knowledge 6, Int 2 | Virtual skills as additional Knowledge skills (1 per Int \\> 1). | 174 |\n| **Versatile Performer** | Perform 6, Int 2 | Virtual skills as additional Perform skills (1 per Int \\> 1). | 175 |\n| **Versatile Professional** | Vocation 6, Int 2 | Virtual skills as additional Vocation skills (1 per Int \\> 1). | 176 |",
    "mechanics": "Treat a specific **Non-Combat** check as if you rolled a **Natural 20**.  \n  * *Mechanics:* You do not roll. You calculate the result as: 20 \\+ Skill Rank \\+ Attribute Mod \\+ Modifiers. This guarantees a critical success on almost any standard difficulty task.",
    "notes": "[Modifier] +1 on Will Checks\n[Modifier] +1 to Etiquette\n[Modifier] +1 to Knowledge\n[Modifier] +1 to Metaphysics Knowledge\n[Modifier] +2 to Mastercrafting\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]**. You must select which trait it applies to when purchased (e.g., *U...\n[Prerequisite] None (Must be assigned to a specific Trait/Skill/Attribute).",
    "notesList": [
      "[Modifier] +1 on Will Checks",
      "[Modifier] +1 to Etiquette",
      "[Modifier] +1 to Knowledge",
      "[Modifier] +1 to Metaphysics Knowledge",
      "[Modifier] +2 to Mastercrafting",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]**. You must select which trait it applies to when purchased (e.g., *U...",
      "[Prerequisite] None (Must be assigned to a specific Trait/Skill/Attribute)."
    ]
  },
  {
    "id": "skill-ace-pilot",
    "name": "Ace Pilot",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Crack Pilot, Pilot 16",
    "modifiers": [],
    "description": "Ace Pilot is a Skill Feature: +6 Piloting, +30% to Maximum Vehicle Speed.",
    "mechanic": "\\+6 Piloting, \\+30% to Maximum Vehicle Speed.",
    "rules": "143",
    "special_rules": "143",
    "body": "# Ace Pilot\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Crack Pilot, Pilot 16\n\n## Description\nAce Pilot is a Skill Feature: \\+6 Piloting, \\+30% to Maximum Vehicle Speed.\n\n## Mechanics & Benefit\n\\+6 Piloting, \\+30% to Maximum Vehicle Speed.\n\n## Special Rules\n143",
    "mechanics": "\\+6 Piloting, \\+30% to Maximum Vehicle Speed.",
    "notes": "[Rule] 143\n[Prerequisite] Crack Pilot, Pilot 16",
    "notesList": [
      "[Rule] 143",
      "[Prerequisite] Crack Pilot, Pilot 16"
    ]
  },
  {
    "id": "skill-aeronaut",
    "name": "Aeronaut",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Pilot (Unpowered) 1",
    "modifiers": [],
    "description": "The character is a specialist in unpowered or nature-assisted flight. They understand wind shears, thermals, and aerodynamics intuitively, whether using a glider, wingsuit, or natural wings.",
    "mechanic": "You may make all **Pilot (Unpowered)** checks with **Advantage**.",
    "rules": "128",
    "special_rules": "128",
    "body": "# Aeronaut\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Pilot (Unpowered) 1\n\n## Description\nThe character is a specialist in unpowered or nature-assisted flight. They understand wind shears, thermals, and aerodynamics intuitively, whether using a glider, wingsuit, or natural wings.\n\n## Mechanics & Benefit\nYou may make all **Pilot (Unpowered)** checks with **Advantage**.\n\n## Special Rules\n128",
    "mechanics": "You may make all **Pilot (Unpowered)** checks with **Advantage**.",
    "notes": "[Rule] 128\n[Prerequisite] Pilot (Unpowered) 1",
    "notesList": [
      "[Rule] 128",
      "[Prerequisite] Pilot (Unpowered) 1"
    ]
  },
  {
    "id": "skill-animal-affinity",
    "name": "Animal Affinity",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Survival",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Survival"
      }
    ],
    "description": "The character has a natural bond with beasts, understanding their body language and instincts.",
    "mechanic": "Gain a **\\+2 Bonus** to **Survival** checks regarding Animal Handling, Riding, or Taming. You can alter an animal's attitude one step faster than normal.",
    "rules": "129",
    "special_rules": "129",
    "body": "# Animal Affinity\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character has a natural bond with beasts, understanding their body language and instincts.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Survival** checks regarding Animal Handling, Riding, or Taming. You can alter an animal's attitude one step faster than normal.\n\n## Special Rules\n129",
    "mechanics": "Gain a **\\+2 Bonus** to **Survival** checks regarding Animal Handling, Riding, or Taming. You can alter an animal's attitude one step faster than normal.",
    "notes": "[Modifier] +2 to Survival\n[Rule] 129",
    "notesList": [
      "[Modifier] +2 to Survival",
      "[Rule] 129"
    ]
  },
  {
    "id": "skill-artificer",
    "name": "Artificer",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Attune 11, Any Discipline 11, Any Crafting 11",
    "modifiers": [],
    "description": "The character combines engineering with metaphysics, capable of creating items that blur the line between technology and magic.",
    "mechanic": "All **Metacrafting** and **Prototyping** checks to create magical or psionic items are made with **Advantage**.",
    "rules": "130",
    "special_rules": "130",
    "body": "# Artificer\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Attune 11, Any Discipline 11, Any Crafting 11\n\n## Description\nThe character combines engineering with metaphysics, capable of creating items that blur the line between technology and magic.\n\n## Mechanics & Benefit\nAll **Metacrafting** and **Prototyping** checks to create magical or psionic items are made with **Advantage**.\n\n## Special Rules\n130",
    "mechanics": "All **Metacrafting** and **Prototyping** checks to create magical or psionic items are made with **Advantage**.",
    "notes": "[Rule] 130\n[Prerequisite] Attune 11, Any Discipline 11, Any Crafting 11",
    "notesList": [
      "[Rule] 130",
      "[Prerequisite] Attune 11, Any Discipline 11, Any Crafting 11"
    ]
  },
  {
    "id": "skill-artistic",
    "name": "Artistic",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Both",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Both"
      }
    ],
    "description": "The character possesses a flare for the creative arts.",
    "mechanic": "Choose two **Performance** or **Vocation (Art/Craft)** sub-skills. Gain a **\\+2 Bonus** to both.",
    "rules": "131",
    "special_rules": "131",
    "body": "# Artistic\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses a flare for the creative arts.\n\n## Mechanics & Benefit\nChoose two **Performance** or **Vocation (Art/Craft)** sub-skills. Gain a **\\+2 Bonus** to both.\n\n## Special Rules\n131",
    "mechanics": "Choose two **Performance** or **Vocation (Art/Craft)** sub-skills. Gain a **\\+2 Bonus** to both.",
    "notes": "[Modifier] +2 to Both\n[Rule] 131",
    "notesList": [
      "[Modifier] +2 to Both",
      "[Rule] 131"
    ]
  },
  {
    "id": "skill-attractive",
    "name": "Attractive",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Charisma 2",
    "modifiers": [
      {
        "target": "Social",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Social"
      }
    ],
    "description": "The character possesses striking physical beauty or magnetic appeal that captures attention.",
    "mechanic": "Gain a **\\+2 Bonus** to all Social checks where physical appearance is a factor (e.g., Seduction, First Impressions).",
    "rules": "This feature is **\\[Ranked\\]** (Limited by Charisma score). Rank 2 grants \\+4, etc.",
    "special_rules": "This feature is **\\[Ranked\\]** (Limited by Charisma score). Rank 2 grants \\+4, etc.",
    "body": "# Attractive\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character possesses striking physical beauty or magnetic appeal that captures attention.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to all Social checks where physical appearance is a factor (e.g., Seduction, First Impressions).\n\n## Special Rules\nThis feature is **\\[Ranked\\]** (Limited by Charisma score). Rank 2 grants \\+4, etc.",
    "mechanics": "Gain a **\\+2 Bonus** to all Social checks where physical appearance is a factor (e.g., Seduction, First Impressions).",
    "notes": "[Modifier] +2 to Social\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This feature is **\\[Ranked\\]** (Limited by Charisma score). Rank 2 grants \\+4, etc.\n[Prerequisite] Charisma 2",
    "notesList": [
      "[Modifier] +2 to Social",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] This feature is **\\[Ranked\\]** (Limited by Charisma score). Rank 2 grants \\+4, etc.",
      "[Prerequisite] Charisma 2"
    ]
  },
  {
    "id": "skill-biotechnologist",
    "name": "Biotechnologist",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Biology, Botany, or Medicine Rank 11",
    "modifiers": [],
    "description": "The character is an expert in the manipulation of living tissue and organic technology.",
    "mechanic": "All **Biotechnology Prototyping** and **Grafting** checks are made with **Advantage**.",
    "rules": "133",
    "special_rules": "133",
    "body": "# Biotechnologist\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Biology, Botany, or Medicine Rank 11\n\n## Description\nThe character is an expert in the manipulation of living tissue and organic technology.\n\n## Mechanics & Benefit\nAll **Biotechnology Prototyping** and **Grafting** checks are made with **Advantage**.\n\n## Special Rules\n133",
    "mechanics": "All **Biotechnology Prototyping** and **Grafting** checks are made with **Advantage**.",
    "notes": "[Rule] 133\n[Prerequisite] Biology, Botany, or Medicine Rank 11",
    "notesList": [
      "[Rule] 133",
      "[Prerequisite] Biology, Botany, or Medicine Rank 11"
    ]
  },
  {
    "id": "skill-coding-master",
    "name": "Coding Master",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Computer Specialist",
    "modifiers": [],
    "description": "Coding Master is a Skill Feature: Perform Computer Tasks at Advantage.",
    "mechanic": "Perform Computer Tasks at Advantage.",
    "rules": "136",
    "special_rules": "136",
    "body": "# Coding Master\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Computer Specialist\n\n## Description\nCoding Master is a Skill Feature: Perform Computer Tasks at Advantage.\n\n## Mechanics & Benefit\nPerform Computer Tasks at Advantage.\n\n## Special Rules\n136",
    "mechanics": "Perform Computer Tasks at Advantage.",
    "notes": "[Rule] 136\n[Prerequisite] Computer Specialist",
    "notesList": [
      "[Rule] 136",
      "[Prerequisite] Computer Specialist"
    ]
  },
  {
    "id": "skill-computer-specialist",
    "name": "Computer Specialist",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Computers 1",
    "modifiers": [
      {
        "target": "Computer tasks  Hacking",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Computer tasks  Hacking"
      }
    ],
    "description": "The character lives in the digital realm, navigating code as easily as walking down the street.",
    "mechanic": "Gain a **\\+2 Bonus** to all **Computer** tasks (Hacking, Programming, Hardware Repair).",
    "rules": "134",
    "special_rules": "134",
    "body": "# Computer Specialist\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Computers 1\n\n## Description\nThe character lives in the digital realm, navigating code as easily as walking down the street.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to all **Computer** tasks (Hacking, Programming, Hardware Repair).\n\n## Special Rules\n134",
    "mechanics": "Gain a **\\+2 Bonus** to all **Computer** tasks (Hacking, Programming, Hardware Repair).",
    "notes": "[Modifier] +2 to Computer tasks  Hacking\n[Rule] 134\n[Prerequisite] Computers 1",
    "notesList": [
      "[Modifier] +2 to Computer tasks  Hacking",
      "[Rule] 134",
      "[Prerequisite] Computers 1"
    ]
  },
  {
    "id": "skill-crack-pilot",
    "name": "Crack Pilot",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Gifted Pilot, Pilot 11",
    "modifiers": [],
    "description": "Crack Pilot is a Skill Feature: +4 Piloting, +20% to Maximum Vehicle Speed.",
    "mechanic": "\\+4 Piloting, \\+20% to Maximum Vehicle Speed.",
    "rules": "142",
    "special_rules": "142",
    "body": "# Crack Pilot\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Gifted Pilot, Pilot 11\n\n## Description\nCrack Pilot is a Skill Feature: \\+4 Piloting, \\+20% to Maximum Vehicle Speed.\n\n## Mechanics & Benefit\n\\+4 Piloting, \\+20% to Maximum Vehicle Speed.\n\n## Special Rules\n142",
    "mechanics": "\\+4 Piloting, \\+20% to Maximum Vehicle Speed.",
    "notes": "[Rule] 142\n[Prerequisite] Gifted Pilot, Pilot 11",
    "notesList": [
      "[Rule] 142",
      "[Prerequisite] Gifted Pilot, Pilot 11"
    ]
  },
  {
    "id": "skill-deceitful",
    "name": "Deceitful",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Manipulation",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Manipulation"
      },
      {
        "target": "Etiquette",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Etiquette"
      }
    ],
    "description": "The character is a pathological or professional liar, skilled in misdirection and blending in.",
    "mechanic": "Gain a **\\+2 Bonus** to **Manipulation Skills** (Bluff, Disguise) and a **\\+1 Bonus** to **Etiquette** checks.",
    "rules": "137",
    "special_rules": "137",
    "body": "# Deceitful\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character is a pathological or professional liar, skilled in misdirection and blending in.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Manipulation Skills** (Bluff, Disguise) and a **\\+1 Bonus** to **Etiquette** checks.\n\n## Special Rules\n137",
    "mechanics": "Gain a **\\+2 Bonus** to **Manipulation Skills** (Bluff, Disguise) and a **\\+1 Bonus** to **Etiquette** checks.",
    "notes": "[Modifier] +2 to Manipulation\n[Modifier] +1 to Etiquette\n[Rule] 137",
    "notesList": [
      "[Modifier] +2 to Manipulation",
      "[Modifier] +1 to Etiquette",
      "[Rule] 137"
    ]
  },
  {
    "id": "skill-digital-expert",
    "name": "Digital Expert",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Computer Specialist",
    "modifiers": [],
    "description": "Digital Expert is a Skill Feature: Perform Computer Tasks in 1/2 time.",
    "mechanic": "Perform Computer Tasks in 1/2 time.",
    "rules": "135",
    "special_rules": "135",
    "body": "# Digital Expert\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Computer Specialist\n\n## Description\nDigital Expert is a Skill Feature: Perform Computer Tasks in 1/2 time.\n\n## Mechanics & Benefit\nPerform Computer Tasks in 1/2 time.\n\n## Special Rules\n135",
    "mechanics": "Perform Computer Tasks in 1/2 time.",
    "notes": "[Rule] 135\n[Prerequisite] Computer Specialist",
    "notesList": [
      "[Rule] 135",
      "[Prerequisite] Computer Specialist"
    ]
  },
  {
    "id": "skill-educated",
    "name": "Educated",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Academics 5, Any Knowledge 5",
    "modifiers": [
      {
        "target": "Knowledge",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Knowledge"
      }
    ],
    "description": "The character has received extensive formal schooling or possesses a voracious appetite for reading.",
    "mechanic": "Gain a **\\+2 Bonus** to **Academics** and a **\\+1 Bonus** to **ALL Knowledge Skills**.",
    "rules": "138",
    "special_rules": "138",
    "body": "# Educated\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Academics 5, Any Knowledge 5\n\n## Description\nThe character has received extensive formal schooling or possesses a voracious appetite for reading.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Academics** and a **\\+1 Bonus** to **ALL Knowledge Skills**.\n\n## Special Rules\n138",
    "mechanics": "Gain a **\\+2 Bonus** to **Academics** and a **\\+1 Bonus** to **ALL Knowledge Skills**.",
    "notes": "[Modifier] +1 to Knowledge\n[Rule] 138\n[Prerequisite] Academics 5, Any Knowledge 5",
    "notesList": [
      "[Modifier] +1 to Knowledge",
      "[Rule] 138",
      "[Prerequisite] Academics 5, Any Knowledge 5"
    ]
  },
  {
    "id": "skill-entertaining",
    "name": "Entertaining",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Charisma 1",
    "modifiers": [
      {
        "target": "Any Performance",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Any Performance"
      },
      {
        "target": "Performance types  Singing",
        "type": "skill",
        "value": 3,
        "mode": "inherent",
        "description": "+3 to Performance types  Singing"
      }
    ],
    "description": "The character is a born performer, capable of holding an audience's attention.",
    "mechanic": "Gain a **\\+1 Bonus** to **Any Performance Check**.",
    "rules": "This feature is **\\[Ranked\\]** (Limited by Charisma). Rank 3 would grant a \\+3 to all Performance types (Singing, Dancing, Acting, etc.).",
    "special_rules": "This feature is **\\[Ranked\\]** (Limited by Charisma). Rank 3 would grant a \\+3 to all Performance types (Singing, Dancing, Acting, etc.).",
    "body": "# Entertaining\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character is a born performer, capable of holding an audience's attention.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to **Any Performance Check**.\n\n## Special Rules\nThis feature is **\\[Ranked\\]** (Limited by Charisma). Rank 3 would grant a \\+3 to all Performance types (Singing, Dancing, Acting, etc.).",
    "mechanics": "Gain a **\\+1 Bonus** to **Any Performance Check**.",
    "notes": "[Modifier] +1 to Any Performance\n[Modifier] +3 to Performance types  Singing\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This feature is **\\[Ranked\\]** (Limited by Charisma). Rank 3 would grant a \\+3 to all Performance ty...\n[Prerequisite] Charisma 1",
    "notesList": [
      "[Modifier] +1 to Any Performance",
      "[Modifier] +3 to Performance types  Singing",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] This feature is **\\[Ranked\\]** (Limited by Charisma). Rank 3 would grant a \\+3 to all Performance ty...",
      "[Prerequisite] Charisma 1"
    ]
  },
  {
    "id": "skill-gearhead",
    "name": "Gearhead",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Engineering 1 or Mechanics 1",
    "modifiers": [
      {
        "target": "Mechanical-based Knowledge",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Mechanical-based Knowledge"
      }
    ],
    "description": "The character has an intuitive understanding of machinery, engines, and mechanical systems.",
    "mechanic": "Gain a **\\+2 Bonus** to all Mechanical-based **Knowledge**, **Operation**, and **Repair** checks.",
    "rules": "140",
    "special_rules": "140",
    "body": "# Gearhead\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Engineering 1 or Mechanics 1\n\n## Description\nThe character has an intuitive understanding of machinery, engines, and mechanical systems.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to all Mechanical-based **Knowledge**, **Operation**, and **Repair** checks.\n\n## Special Rules\n140",
    "mechanics": "Gain a **\\+2 Bonus** to all Mechanical-based **Knowledge**, **Operation**, and **Repair** checks.",
    "notes": "[Modifier] +2 to Mechanical-based Knowledge\n[Rule] 140\n[Prerequisite] Engineering 1 or Mechanics 1",
    "notesList": [
      "[Modifier] +2 to Mechanical-based Knowledge",
      "[Rule] 140",
      "[Prerequisite] Engineering 1 or Mechanics 1"
    ]
  },
  {
    "id": "skill-gifted-pilot",
    "name": "Gifted Pilot",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Pilot 6",
    "modifiers": [
      {
        "target": "Piloting",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Piloting"
      }
    ],
    "description": "The character feels the vehicle as an extension of their own body.",
    "mechanic": "Gain a **\\+2 Bonus** to Piloting checks. Increase the **Maximum Speed** of any vehicle you pilot by **10%**.",
    "rules": "141",
    "special_rules": "141",
    "body": "# Gifted Pilot\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Pilot 6\n\n## Description\nThe character feels the vehicle as an extension of their own body.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to Piloting checks. Increase the **Maximum Speed** of any vehicle you pilot by **10%**.\n\n## Special Rules\n141",
    "mechanics": "Gain a **\\+2 Bonus** to Piloting checks. Increase the **Maximum Speed** of any vehicle you pilot by **10%**.",
    "notes": "[Modifier] +2 to Piloting\n[Rule] 141\n[Prerequisite] Pilot 6",
    "notesList": [
      "[Modifier] +2 to Piloting",
      "[Rule] 141",
      "[Prerequisite] Pilot 6"
    ]
  },
  {
    "id": "skill-golden-smile",
    "name": "Golden Smile",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Silver Tongue, Cha 2, Dip/Bluff 6",
    "modifiers": [],
    "description": "Golden Smile is a Skill Feature: Take 10 or add d10 to Bluff and Diplomacy checks.",
    "mechanic": "Take 10 or add d10 to Bluff and Diplomacy checks.",
    "rules": "162",
    "special_rules": "162",
    "body": "# Golden Smile\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Silver Tongue, Cha 2, Dip/Bluff 6\n\n## Description\nGolden Smile is a Skill Feature: Take 10 or add d10 to Bluff and Diplomacy checks.\n\n## Mechanics & Benefit\nTake 10 or add d10 to Bluff and Diplomacy checks.\n\n## Special Rules\n162",
    "mechanics": "Take 10 or add d10 to Bluff and Diplomacy checks.",
    "notes": "[Rule] 162\n[Prerequisite] Silver Tongue, Cha 2, Dip/Bluff 6",
    "notesList": [
      "[Rule] 162",
      "[Prerequisite] Silver Tongue, Cha 2, Dip/Bluff 6"
    ]
  },
  {
    "id": "skill-graceful",
    "name": "Graceful",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Agility-based Non-Attack",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Agility-based Non-Attack"
      }
    ],
    "description": "The character moves with elegance and precision.",
    "mechanic": "Gain a **\\+1 Bonus** to all **Agility-based Non-Attack Skill checks** (Acrobatics, Stealth, Sleight of Hand) and **Reflex Checks**.",
    "rules": "144",
    "special_rules": "144",
    "body": "# Graceful\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character moves with elegance and precision.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to all **Agility-based Non-Attack Skill checks** (Acrobatics, Stealth, Sleight of Hand) and **Reflex Checks**.\n\n## Special Rules\n144",
    "mechanics": "Gain a **\\+1 Bonus** to all **Agility-based Non-Attack Skill checks** (Acrobatics, Stealth, Sleight of Hand) and **Reflex Checks**.",
    "notes": "[Modifier] +1 to Agility-based Non-Attack\n[Rule] 144",
    "notesList": [
      "[Modifier] +1 to Agility-based Non-Attack",
      "[Rule] 144"
    ]
  },
  {
    "id": "skill-headstrong",
    "name": "Headstrong",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Will",
        "type": "save",
        "value": 1,
        "mode": "inherent",
        "description": "+1 on Will Checks"
      },
      {
        "target": "Bluff",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Bluff"
      },
      {
        "target": "Intimidate",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Intimidate"
      }
    ],
    "description": "The character is stubborn, loud, and forceful.",
    "mechanic": "Gain a **\\+2 Bonus** to **Bluff** and **Intimidate** checks, and a **\\+1 Bonus** to **Will Checks**.",
    "rules": "145",
    "special_rules": "145",
    "body": "# Headstrong\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character is stubborn, loud, and forceful.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Bluff** and **Intimidate** checks, and a **\\+1 Bonus** to **Will Checks**.\n\n## Special Rules\n145",
    "mechanics": "Gain a **\\+2 Bonus** to **Bluff** and **Intimidate** checks, and a **\\+1 Bonus** to **Will Checks**.",
    "notes": "[Modifier] +1 on Will Checks\n[Modifier] +2 to Bluff\n[Modifier] +2 to Intimidate\n[Rule] 145",
    "notesList": [
      "[Modifier] +1 on Will Checks",
      "[Modifier] +2 to Bluff",
      "[Modifier] +2 to Intimidate",
      "[Rule] 145"
    ]
  },
  {
    "id": "skill-influence",
    "name": "Influence",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 2",
    "modifiers": [
      {
        "target": "Reputation",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Reputation"
      },
      {
        "target": "Favor",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Favor"
      }
    ],
    "description": "The character has significant social pull within their faction or community.",
    "mechanic": "Gain a **\\+4 Bonus** to **Reputation** and **Favor** checks (a subset of Diplomacy used to acquire resources or assistance).",
    "rules": "146",
    "special_rules": "146",
    "body": "# Influence\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character has significant social pull within their faction or community.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** to **Reputation** and **Favor** checks (a subset of Diplomacy used to acquire resources or assistance).\n\n## Special Rules\n146",
    "mechanics": "Gain a **\\+4 Bonus** to **Reputation** and **Favor** checks (a subset of Diplomacy used to acquire resources or assistance).",
    "notes": "[Modifier] +4 to Reputation\n[Modifier] +4 to Favor\n[Rule] 146\n[Prerequisite] Charisma 2",
    "notesList": [
      "[Modifier] +4 to Reputation",
      "[Modifier] +4 to Favor",
      "[Rule] 146",
      "[Prerequisite] Charisma 2"
    ]
  },
  {
    "id": "skill-investigator",
    "name": "Investigator",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Investigation",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Investigation"
      },
      {
        "target": "Gather Information",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Gather Information"
      }
    ],
    "description": "The character is trained to notice details and follow leads.",
    "mechanic": "Gain a **\\+2 Bonus** to **Investigation** and **Gather Information** checks.",
    "rules": "147",
    "special_rules": "147",
    "body": "# Investigator\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character is trained to notice details and follow leads.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Investigation** and **Gather Information** checks.\n\n## Special Rules\n147",
    "mechanics": "Gain a **\\+2 Bonus** to **Investigation** and **Gather Information** checks.",
    "notes": "[Modifier] +2 to Investigation\n[Modifier] +2 to Gather Information\n[Rule] 147",
    "notesList": [
      "[Modifier] +2 to Investigation",
      "[Modifier] +2 to Gather Information",
      "[Rule] 147"
    ]
  },
  {
    "id": "skill-linguist",
    "name": "Linguist",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Linguistics 1",
    "modifiers": [
      {
        "target": "Language",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Language"
      }
    ],
    "description": "The character has an ear for dialects and syntax.",
    "mechanic": "Gain a **\\+2 Bonus** to **Language** checks. You may **Take 10** on Language checks to decipher writing even under stress.",
    "rules": "148",
    "special_rules": "148",
    "body": "# Linguist\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Linguistics 1\n\n## Description\nThe character has an ear for dialects and syntax.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Language** checks. You may **Take 10** on Language checks to decipher writing even under stress.\n\n## Special Rules\n148",
    "mechanics": "Gain a **\\+2 Bonus** to **Language** checks. You may **Take 10** on Language checks to decipher writing even under stress.",
    "notes": "[Modifier] +2 to Language\n[Rule] 148\n[Prerequisite] Linguistics 1",
    "notesList": [
      "[Modifier] +2 to Language",
      "[Rule] 148",
      "[Prerequisite] Linguistics 1"
    ]
  },
  {
    "id": "skill-logical",
    "name": "Logical",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Logic",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Logic"
      }
    ],
    "description": "The character approaches problems with cold, hard rationality.",
    "mechanic": "Gain a **\\+2 Bonus** to **Logic Checks**. You may **Take 10** on Logic checks even under stress.",
    "rules": "149",
    "special_rules": "149",
    "body": "# Logical\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character approaches problems with cold, hard rationality.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Logic Checks**. You may **Take 10** on Logic checks even under stress.\n\n## Special Rules\n149",
    "mechanics": "Gain a **\\+2 Bonus** to **Logic Checks**. You may **Take 10** on Logic checks even under stress.",
    "notes": "[Modifier] +2 to Logic\n[Rule] 149",
    "notesList": [
      "[Modifier] +2 to Logic",
      "[Rule] 149"
    ]
  },
  {
    "id": "skill-magical-aptitude",
    "name": "Magical Aptitude",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Attune",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Attune"
      },
      {
        "target": "Knowledge  Metaphysics",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Knowledge  Metaphysics"
      }
    ],
    "description": "The character has a knack for the arcane theory, even if they aren't a powerful caster.",
    "mechanic": "Gain a **\\+2 Bonus** to **Attune** checks and a **\\+1 Bonus** to **Knowledge (Metaphysics)**.",
    "rules": "150",
    "special_rules": "150",
    "body": "# Magical Aptitude\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character has a knack for the arcane theory, even if they aren't a powerful caster.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Attune** checks and a **\\+1 Bonus** to **Knowledge (Metaphysics)**.\n\n## Special Rules\n150",
    "mechanics": "Gain a **\\+2 Bonus** to **Attune** checks and a **\\+1 Bonus** to **Knowledge (Metaphysics)**.",
    "notes": "[Modifier] +2 to Attune\n[Modifier] +1 to Knowledge  Metaphysics\n[Rule] 150",
    "notesList": [
      "[Modifier] +2 to Attune",
      "[Modifier] +1 to Knowledge  Metaphysics",
      "[Rule] 150"
    ]
  },
  {
    "id": "skill-master-craftsman",
    "name": "Master Craftsman",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Crafting 6",
    "modifiers": [
      {
        "target": "Crafting",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Crafting"
      }
    ],
    "description": "The character creates items of superior quality and durability.",
    "mechanic": "Gain a **\\+2 Bonus** to Crafting checks. When creating **Masterwork** items, you add **\\+2** to the DC limit of what you can create (allowing for more complex modifications).",
    "rules": "151",
    "special_rules": "151",
    "body": "# Master Craftsman\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Crafting 6\n\n## Description\nThe character creates items of superior quality and durability.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to Crafting checks. When creating **Masterwork** items, you add **\\+2** to the DC limit of what you can create (allowing for more complex modifications).\n\n## Special Rules\n151",
    "mechanics": "Gain a **\\+2 Bonus** to Crafting checks. When creating **Masterwork** items, you add **\\+2** to the DC limit of what you can create (allowing for more complex modifications).",
    "notes": "[Modifier] +2 to Crafting\n[Rule] 151\n[Prerequisite] Crafting 6",
    "notesList": [
      "[Modifier] +2 to Crafting",
      "[Rule] 151",
      "[Prerequisite] Crafting 6"
    ]
  },
  {
    "id": "skill-medic",
    "name": "Medic",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Medicine 1",
    "modifiers": [
      {
        "target": "Medicine",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Medicine"
      }
    ],
    "description": "The character is trained in emergency triage and trauma care.",
    "mechanic": "Gain a **\\+2 Bonus** to Medicine checks.",
    "rules": "You may perform **First Aid** (stabilize a dying character) as a **Standard Action** rather than a Full Round Action.",
    "special_rules": "You may perform **First Aid** (stabilize a dying character) as a **Standard Action** rather than a Full Round Action.",
    "body": "# Medic\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Medicine 1\n\n## Description\nThe character is trained in emergency triage and trauma care.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to Medicine checks.\n\n## Special Rules\nYou may perform **First Aid** (stabilize a dying character) as a **Standard Action** rather than a Full Round Action.",
    "mechanics": "Gain a **\\+2 Bonus** to Medicine checks.",
    "notes": "[Modifier] +2 to Medicine\n[Rule] You may perform **First Aid** (stabilize a dying character) as a **Standard Action** rather than a F...\n[Prerequisite] Medicine 1",
    "notesList": [
      "[Modifier] +2 to Medicine",
      "[Rule] You may perform **First Aid** (stabilize a dying character) as a **Standard Action** rather than a F...",
      "[Prerequisite] Medicine 1"
    ]
  },
  {
    "id": "skill-meticulous",
    "name": "Meticulous",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character is exceptionally thorough. When they take their time, they rarely fail.",
    "mechanic": "The bonus gained from taking extra time on a skill check is improved.",
    "rules": "153",
    "special_rules": "153",
    "body": "# Meticulous\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character is exceptionally thorough. When they take their time, they rarely fail.\n\n## Mechanics & Benefit\nThe bonus gained from taking extra time on a skill check is improved.\n\n## Special Rules\n153",
    "mechanics": "The bonus gained from taking extra time on a skill check is improved.",
    "notes": "[Rule] 153",
    "notesList": [
      "[Rule] 153"
    ]
  },
  {
    "id": "skill-naturalist",
    "name": "Naturalist",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Nature  Knowledge",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Nature  Knowledge"
      },
      {
        "target": "Survival",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Survival"
      }
    ],
    "description": "The character is at home in the wild.",
    "mechanic": "Gain a **\\+2 Bonus** to **Nature** (Knowledge) and **Survival** checks.",
    "rules": "154",
    "special_rules": "154",
    "body": "# Naturalist\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character is at home in the wild.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Nature** (Knowledge) and **Survival** checks.\n\n## Special Rules\n154",
    "mechanics": "Gain a **\\+2 Bonus** to **Nature** (Knowledge) and **Survival** checks.",
    "notes": "[Modifier] +2 to Nature  Knowledge\n[Modifier] +2 to Survival\n[Rule] 154",
    "notesList": [
      "[Modifier] +2 to Nature  Knowledge",
      "[Modifier] +2 to Survival",
      "[Rule] 154"
    ]
  },
  {
    "id": "skill-nimble-fingers",
    "name": "Nimble Fingers",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character has excellent manual dexterity for fine manipulation.",
    "mechanic": "Gain a **\\+2 Bonus** to **Sleight of Hand** and **Disable Device** (Security/Mechanics) checks.",
    "rules": "155",
    "special_rules": "155",
    "body": "# Nimble Fingers\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character has excellent manual dexterity for fine manipulation.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Sleight of Hand** and **Disable Device** (Security/Mechanics) checks.\n\n## Special Rules\n155",
    "mechanics": "Gain a **\\+2 Bonus** to **Sleight of Hand** and **Disable Device** (Security/Mechanics) checks.",
    "notes": "[Rule] 155",
    "notesList": [
      "[Rule] 155"
    ]
  },
  {
    "id": "skill-perceptive",
    "name": "Perceptive",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Perception",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Perception"
      },
      {
        "target": "Insight",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Insight"
      }
    ],
    "description": "The character notices things others miss.",
    "mechanic": "Gain a **\\+2 Bonus** to **Perception** checks (Alertness) and a **\\+1 Bonus** to **Insight** checks.",
    "rules": "157",
    "special_rules": "157",
    "body": "# Perceptive\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character notices things others miss.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Perception** checks (Alertness) and a **\\+1 Bonus** to **Insight** checks.\n\n## Special Rules\n157",
    "mechanics": "Gain a **\\+2 Bonus** to **Perception** checks (Alertness) and a **\\+1 Bonus** to **Insight** checks.",
    "notes": "[Modifier] +2 to Perception\n[Modifier] +1 to Insight\n[Rule] 157",
    "notesList": [
      "[Modifier] +2 to Perception",
      "[Modifier] +1 to Insight",
      "[Rule] 157"
    ]
  },
  {
    "id": "skill-persuasive",
    "name": "Persuasive",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Diplomacy",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Diplomacy"
      },
      {
        "target": "Intimidate",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Intimidate"
      }
    ],
    "description": "The character is convincing and compelling.",
    "mechanic": "Gain a **\\+2 Bonus** to **Diplomacy** and **Intimidate** checks.",
    "rules": "156",
    "special_rules": "156",
    "body": "# Persuasive\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character is convincing and compelling.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Diplomacy** and **Intimidate** checks.\n\n## Special Rules\n156",
    "mechanics": "Gain a **\\+2 Bonus** to **Diplomacy** and **Intimidate** checks.",
    "notes": "[Modifier] +2 to Diplomacy\n[Modifier] +2 to Intimidate\n[Rule] 156",
    "notesList": [
      "[Modifier] +2 to Diplomacy",
      "[Modifier] +2 to Intimidate",
      "[Rule] 156"
    ]
  },
  {
    "id": "skill-platinum-personality",
    "name": "Platinum Personality",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Golden Smile, Cha 4, Dip/Bluff 11",
    "modifiers": [],
    "description": "Platinum Personality is a Skill Feature: Make Bluff and Diplomacy Checks with Advantage.",
    "mechanic": "Make Bluff and Diplomacy Checks with Advantage.",
    "rules": "163",
    "special_rules": "163",
    "body": "# Platinum Personality\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Golden Smile, Cha 4, Dip/Bluff 11\n\n## Description\nPlatinum Personality is a Skill Feature: Make Bluff and Diplomacy Checks with Advantage.\n\n## Mechanics & Benefit\nMake Bluff and Diplomacy Checks with Advantage.\n\n## Special Rules\n163",
    "mechanics": "Make Bluff and Diplomacy Checks with Advantage.",
    "notes": "[Rule] 163\n[Prerequisite] Golden Smile, Cha 4, Dip/Bluff 11",
    "notesList": [
      "[Rule] 163",
      "[Prerequisite] Golden Smile, Cha 4, Dip/Bluff 11"
    ]
  },
  {
    "id": "skill-power-attack",
    "name": "Power Attack",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Strength 2, Unarmed or Melee 6",
    "modifiers": [],
    "description": "The character sacrifices precision for raw force, trading attack accuracy for devastating damage.",
    "mechanic": "When declaring a melee attack, you may choose to take a penalty up to your Combat Skill Rank on your **Strike** (Attack) roll. You add this same amount as a bonus to your **Damage** roll. This choice is made before you roll your attack and lasts until the start of your next turn.",
    "rules": "This bonus to damage is considered a \"Power\" bonus, which may not stack with other features that grant generic bonus damage.",
    "special_rules": "This bonus to damage is considered a \"Power\" bonus, which may not stack with other features that grant generic bonus damage.",
    "body": "# Power Attack\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Strength 2, Unarmed or Melee 6\n\n## Description\nThe character sacrifices precision for raw force, trading attack accuracy for devastating damage.\n\n## Mechanics & Benefit\nWhen declaring a melee attack, you may choose to take a penalty up to your Combat Skill Rank on your **Strike** (Attack) roll. You add this same amount as a bonus to your **Damage** roll. This choice is made before you roll your attack and lasts until the start of your next turn.\n\n## Special Rules\nThis bonus to damage is considered a \"Power\" bonus, which may not stack with other features that grant generic bonus damage.",
    "mechanics": "When declaring a melee attack, you may choose to take a penalty up to your Combat Skill Rank on your **Strike** (Attack) roll. You add this same amount as a bonus to your **Damage** roll. This choice is made before you roll your attack and lasts until the start of your next turn.",
    "notes": "[Rule] This bonus to damage is considered a \"Power\" bonus, which may not stack with other features that gra...\n[Prerequisite] Strength 2, Unarmed or Melee 6",
    "notesList": [
      "[Rule] This bonus to damage is considered a \"Power\" bonus, which may not stack with other features that gra...",
      "[Prerequisite] Strength 2, Unarmed or Melee 6"
    ]
  },
  {
    "id": "skill-researcher",
    "name": "Researcher",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Academics",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Academics"
      },
      {
        "target": "Library Use",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Library Use"
      }
    ],
    "description": "The character knows how to navigate data archives and libraries.",
    "mechanic": "Gain a **\\+2 Bonus** to **Academics** and **Library Use** checks.",
    "rules": "158",
    "special_rules": "158",
    "body": "# Researcher\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character knows how to navigate data archives and libraries.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Academics** and **Library Use** checks.\n\n## Special Rules\n158",
    "mechanics": "Gain a **\\+2 Bonus** to **Academics** and **Library Use** checks.",
    "notes": "[Modifier] +2 to Academics\n[Modifier] +2 to Library Use\n[Rule] 158",
    "notesList": [
      "[Modifier] +2 to Academics",
      "[Modifier] +2 to Library Use",
      "[Rule] 158"
    ]
  },
  {
    "id": "skill-scholar",
    "name": "Scholar",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Knowledge",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Knowledge"
      }
    ],
    "description": "The character is an academic with a broad base of learning.",
    "mechanic": "Gain a **\\+2 Bonus** to **ALL Knowledge Skills**.",
    "rules": "159",
    "special_rules": "159",
    "body": "# Scholar\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character is an academic with a broad base of learning.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **ALL Knowledge Skills**.\n\n## Special Rules\n159",
    "mechanics": "Gain a **\\+2 Bonus** to **ALL Knowledge Skills**.",
    "notes": "[Modifier] +2 to Knowledge\n[Rule] 159",
    "notesList": [
      "[Modifier] +2 to Knowledge",
      "[Rule] 159"
    ]
  },
  {
    "id": "skill-self-sufficient",
    "name": "Self Sufficient",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Fortitude",
        "type": "save",
        "value": 1,
        "mode": "inherent",
        "description": "+1 on Fortitude Checks"
      },
      {
        "target": "Survival",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Survival"
      }
    ],
    "description": "The character can take care of themselves in the wild without support.",
    "mechanic": "Gain a **\\+2 Bonus** to **Survival** checks and a **\\+1 Bonus** to **Fortitude** checks.",
    "rules": "160",
    "special_rules": "160",
    "body": "# Self Sufficient\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character can take care of themselves in the wild without support.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Survival** checks and a **\\+1 Bonus** to **Fortitude** checks.\n\n## Special Rules\n160",
    "mechanics": "Gain a **\\+2 Bonus** to **Survival** checks and a **\\+1 Bonus** to **Fortitude** checks.",
    "notes": "[Modifier] +1 on Fortitude Checks\n[Modifier] +2 to Survival\n[Rule] 160",
    "notesList": [
      "[Modifier] +1 on Fortitude Checks",
      "[Modifier] +2 to Survival",
      "[Rule] 160"
    ]
  },
  {
    "id": "skill-silver-tongue",
    "name": "Silver Tongue",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 1, Diplomacy 1",
    "modifiers": [],
    "description": "The character knows exactly what to say to defuse a situation or make a friend.",
    "mechanic": "When using Diplomacy to change an NPC's attitude, you improve it by **one additional step** (e.g., Hostile becomes Indifferent instead of Unfriendly).",
    "rules": "161",
    "special_rules": "161",
    "body": "# Silver Tongue\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Charisma 1, Diplomacy 1\n\n## Description\nThe character knows exactly what to say to defuse a situation or make a friend.\n\n## Mechanics & Benefit\nWhen using Diplomacy to change an NPC's attitude, you improve it by **one additional step** (e.g., Hostile becomes Indifferent instead of Unfriendly).\n\n## Special Rules\n161",
    "mechanics": "When using Diplomacy to change an NPC's attitude, you improve it by **one additional step** (e.g., Hostile becomes Indifferent instead of Unfriendly).",
    "notes": "[Rule] 161\n[Prerequisite] Charisma 1, Diplomacy 1",
    "notesList": [
      "[Rule] 161",
      "[Prerequisite] Charisma 1, Diplomacy 1"
    ]
  },
  {
    "id": "skill-skill-focus",
    "name": "Skill Focus",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "Chosen Skill Rank 1",
    "modifiers": [
      {
        "target": "The chosen",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to The chosen"
      }
    ],
    "description": "The character has dedicated significant effort to mastering a specific skill.",
    "mechanic": "Gain a **\\+2 Bonus** to the chosen skill.",
    "rules": "This feature is **\\[Multiple\\]** and **\\[Ranked\\]**. You may purchase it again for the *same* skill each time you reach a new Skill Stage (Novice, Trained, Expert, Master) to stack the bonuses. (e.g., A Master (Rank 16\\) with 4 ranks of Skill Focus has a total \\+8 bonus from this feature).",
    "special_rules": "This feature is **\\[Multiple\\]** and **\\[Ranked\\]**. You may purchase it again for the *same* skill each time you reach a new Skill Stage (Novice, Trained, Expert, Master) to stack the bonuses. (e.g., A Master (Rank 16\\) with 4 ranks of Skill Focus has a total \\+8 bonus from this feature).",
    "body": "# Skill Focus\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Chosen Skill Rank 1\n\n## Description\nThe character has dedicated significant effort to mastering a specific skill.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to the chosen skill.\n\n## Special Rules\nThis feature is **\\[Multiple\\]** and **\\[Ranked\\]**. You may purchase it again for the *same* skill each time you reach a new Skill Stage (Novice, Trained, Expert, Master) to stack the bonuses. (e.g., A Master (Rank 16\\) with 4 ranks of Skill Focus has a total \\+8 bonus from this feature).",
    "mechanics": "Gain a **\\+2 Bonus** to the chosen skill.",
    "notes": "[Modifier] +2 to The chosen\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]** and **\\[Ranked\\]**. You may purchase it again for the *same* skill ...\n[Prerequisite] Chosen Skill Rank 1",
    "notesList": [
      "[Modifier] +2 to The chosen",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]** and **\\[Ranked\\]**. You may purchase it again for the *same* skill ...",
      "[Prerequisite] Chosen Skill Rank 1"
    ]
  },
  {
    "id": "skill-skill-mastery",
    "name": "Skill Mastery",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Skill Focus (2), Rank 11+",
    "modifiers": [],
    "description": "Skill Mastery is a Skill Feature: Take 10 with ALL skills at 11+ with Skill Focus.",
    "mechanic": "Take 10 with ALL skills at 11+ with Skill Focus.",
    "rules": "165",
    "special_rules": "165",
    "body": "# Skill Mastery\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Skill Focus (2), Rank 11+\n\n## Description\nSkill Mastery is a Skill Feature: Take 10 with ALL skills at 11+ with Skill Focus.\n\n## Mechanics & Benefit\nTake 10 with ALL skills at 11+ with Skill Focus.\n\n## Special Rules\n165",
    "mechanics": "Take 10 with ALL skills at 11+ with Skill Focus.",
    "notes": "[Rule] 165\n[Prerequisite] Skill Focus (2), Rank 11+",
    "notesList": [
      "[Rule] 165",
      "[Prerequisite] Skill Focus (2), Rank 11+"
    ]
  },
  {
    "id": "skill-skill-specialization",
    "name": "Skill Specialization",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Chosen Skill Rank 6 (Trained)",
    "modifiers": [],
    "description": "The character drills deep into a specific niche of a broad skill.",
    "mechanic": "Choose a sub-category of the skill (e.g., *Firearms: Sniping* or *Computers: Hacking*). You gain a separate pool of ranks in this specialization equal to your base skill rank (up to \\+10).",
    "rules": "\\[Multiple\\] Can be taken for different skills or different sub-categories.",
    "special_rules": "\\[Multiple\\] Can be taken for different skills or different sub-categories.",
    "body": "# Skill Specialization\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Chosen Skill Rank 6 (Trained)\n\n## Description\nThe character drills deep into a specific niche of a broad skill.\n\n## Mechanics & Benefit\nChoose a sub-category of the skill (e.g., *Firearms: Sniping* or *Computers: Hacking*). You gain a separate pool of ranks in this specialization equal to your base skill rank (up to \\+10).\n\n## Special Rules\n\\[Multiple\\] Can be taken for different skills or different sub-categories.",
    "mechanics": "Choose a sub-category of the skill (e.g., *Firearms: Sniping* or *Computers: Hacking*). You gain a separate pool of ranks in this specialization equal to your base skill rank (up to \\+10).",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Multiple\\] Can be taken for different skills or different sub-categories.\n[Prerequisite] Chosen Skill Rank 6 (Trained)",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] \\[Multiple\\] Can be taken for different skills or different sub-categories.",
      "[Prerequisite] Chosen Skill Rank 6 (Trained)"
    ]
  },
  {
    "id": "skill-social",
    "name": "Social",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Charisma",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Charisma"
      }
    ],
    "description": "The character is a social butterfly.",
    "mechanic": "Gain a **\\+1 Bonus** to **ALL Charisma Skills** and **Etiquette** checks.",
    "rules": "167",
    "special_rules": "167",
    "body": "# Social\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character is a social butterfly.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to **ALL Charisma Skills** and **Etiquette** checks.\n\n## Special Rules\n167",
    "mechanics": "Gain a **\\+1 Bonus** to **ALL Charisma Skills** and **Etiquette** checks.",
    "notes": "[Modifier] +1 to Charisma\n[Rule] 167",
    "notesList": [
      "[Modifier] +1 to Charisma",
      "[Rule] 167"
    ]
  },
  {
    "id": "skill-spacer",
    "name": "Spacer",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character was born or raised in the void; zero-g and vacuum are second nature.",
    "mechanic": "Gain a **\\+2 Bonus** to **Starship Operation** (Vocation/Pilot) and any **Space Survival** checks.",
    "rules": "168",
    "special_rules": "168",
    "body": "# Spacer\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character was born or raised in the void; zero-g and vacuum are second nature.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Starship Operation** (Vocation/Pilot) and any **Space Survival** checks.\n\n## Special Rules\n168",
    "mechanics": "Gain a **\\+2 Bonus** to **Starship Operation** (Vocation/Pilot) and any **Space Survival** checks.",
    "notes": "[Rule] 168",
    "notesList": [
      "[Rule] 168"
    ]
  },
  {
    "id": "skill-steady",
    "name": "Steady",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Reflex",
        "type": "save",
        "value": 1,
        "mode": "inherent",
        "description": "+1 on Reflex Checks"
      }
    ],
    "description": "The character has excellent balance and steady hands.",
    "mechanic": "Gain a **\\+2 Bonus** to **Acrobatics** and **Athletics** (Balancing/Climbing) and a **\\+1 Bonus** to **Reflex** checks.",
    "rules": "169",
    "special_rules": "169",
    "body": "# Steady\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character has excellent balance and steady hands.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Acrobatics** and **Athletics** (Balancing/Climbing) and a **\\+1 Bonus** to **Reflex** checks.\n\n## Special Rules\n169",
    "mechanics": "Gain a **\\+2 Bonus** to **Acrobatics** and **Athletics** (Balancing/Climbing) and a **\\+1 Bonus** to **Reflex** checks.",
    "notes": "[Modifier] +1 on Reflex Checks\n[Rule] 169",
    "notesList": [
      "[Modifier] +1 on Reflex Checks",
      "[Rule] 169"
    ]
  },
  {
    "id": "skill-stealthy",
    "name": "Stealthy",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 2",
    "modifiers": [
      {
        "target": "Stealth",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Stealth"
      }
    ],
    "description": "The character is a shadow.",
    "mechanic": "Gain a **\\+2 Bonus** to **Escape Artist** and **Sleight of Hand**; Gain a **\\+4 Bonus** to **Stealth** checks.",
    "rules": "170",
    "special_rules": "170",
    "body": "# Stealthy\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 2\n\n## Description\nThe character is a shadow.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Escape Artist** and **Sleight of Hand**; Gain a **\\+4 Bonus** to **Stealth** checks.\n\n## Special Rules\n170",
    "mechanics": "Gain a **\\+2 Bonus** to **Escape Artist** and **Sleight of Hand**; Gain a **\\+4 Bonus** to **Stealth** checks.",
    "notes": "[Modifier] +4 to Stealth\n[Rule] 170\n[Prerequisite] Agility 2",
    "notesList": [
      "[Modifier] +4 to Stealth",
      "[Rule] 170",
      "[Prerequisite] Agility 2"
    ]
  },
  {
    "id": "skill-stout",
    "name": "Stout",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Stamina & Constitution",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Stamina & Constitution"
      }
    ],
    "description": "The character is built like a tank, broad and sturdy.",
    "mechanic": "Gain a **\\+1 Bonus** to **ALL Stamina & Constitution Skills**, as well as **Might** and **Fortitude** checks.",
    "rules": "171",
    "special_rules": "171",
    "body": "# Stout\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character is built like a tank, broad and sturdy.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to **ALL Stamina & Constitution Skills**, as well as **Might** and **Fortitude** checks.\n\n## Special Rules\n171",
    "mechanics": "Gain a **\\+1 Bonus** to **ALL Stamina & Constitution Skills**, as well as **Might** and **Fortitude** checks.",
    "notes": "[Modifier] +1 to Stamina & Constitution\n[Rule] 171",
    "notesList": [
      "[Modifier] +1 to Stamina & Constitution",
      "[Rule] 171"
    ]
  },
  {
    "id": "skill-trustworthy",
    "name": "Trustworthy",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "Manipulation",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Manipulation"
      },
      {
        "target": "Culture",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Culture"
      }
    ],
    "description": "The character has an honest face and a reliable demeanor.",
    "mechanic": "Gain a **\\+2 Bonus** to **Manipulation Skills** (Bluff/Diplomacy) and a **\\+1 Bonus** to **Culture** checks (fitting in).",
    "rules": "172",
    "special_rules": "172",
    "body": "# Trustworthy\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character has an honest face and a reliable demeanor.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Manipulation Skills** (Bluff/Diplomacy) and a **\\+1 Bonus** to **Culture** checks (fitting in).\n\n## Special Rules\n172",
    "mechanics": "Gain a **\\+2 Bonus** to **Manipulation Skills** (Bluff/Diplomacy) and a **\\+1 Bonus** to **Culture** checks (fitting in).",
    "notes": "[Modifier] +2 to Manipulation\n[Modifier] +1 to Culture\n[Rule] 172",
    "notesList": [
      "[Modifier] +2 to Manipulation",
      "[Modifier] +1 to Culture",
      "[Rule] 172"
    ]
  },
  {
    "id": "skill-veiled-threat",
    "name": "Veiled Threat",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intimidate 6",
    "modifiers": [],
    "description": "The character can menace someone so subtly that bystanders don't notice, and the target is too scared to retaliate.",
    "mechanic": "When you use Intimidate to force a target to act, the target **does not become Hostile** toward you afterwards (they remain Indifferent or Unfriendly, but terrified). Bystanders must make an Insight check vs. your Intimidate to even realize a threat was made.",
    "rules": "173",
    "special_rules": "173",
    "body": "# Veiled Threat\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Intimidate 6\n\n## Description\nThe character can menace someone so subtly that bystanders don't notice, and the target is too scared to retaliate.\n\n## Mechanics & Benefit\nWhen you use Intimidate to force a target to act, the target **does not become Hostile** toward you afterwards (they remain Indifferent or Unfriendly, but terrified). Bystanders must make an Insight check vs. your Intimidate to even realize a threat was made.\n\n## Special Rules\n173",
    "mechanics": "When you use Intimidate to force a target to act, the target **does not become Hostile** toward you afterwards (they remain Indifferent or Unfriendly, but terrified). Bystanders must make an Insight check vs. your Intimidate to even realize a threat was made.",
    "notes": "[Rule] 173\n[Prerequisite] Intimidate 6",
    "notesList": [
      "[Rule] 173",
      "[Prerequisite] Intimidate 6"
    ]
  },
  {
    "id": "skill-versatile-curator",
    "name": "Versatile Curator",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Knowledge 6, Intellect 2",
    "modifiers": [],
    "description": "The character is a font of trivia and data.",
    "mechanic": "You gain \"Virtual Skills\" in the Knowledge category. For every point of Intellect Bonus you possess, you gain 1 Rank in a Knowledge skill you do not technically have, allowing you to make Trained checks.",
    "rules": "174",
    "special_rules": "174",
    "body": "# Versatile Curator\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Knowledge 6, Intellect 2\n\n## Description\nThe character is a font of trivia and data.\n\n## Mechanics & Benefit\nYou gain \"Virtual Skills\" in the Knowledge category. For every point of Intellect Bonus you possess, you gain 1 Rank in a Knowledge skill you do not technically have, allowing you to make Trained checks.\n\n## Special Rules\n174",
    "mechanics": "You gain \"Virtual Skills\" in the Knowledge category. For every point of Intellect Bonus you possess, you gain 1 Rank in a Knowledge skill you do not technically have, allowing you to make Trained checks.",
    "notes": "[Rule] 174\n[Prerequisite] Knowledge 6, Intellect 2",
    "notesList": [
      "[Rule] 174",
      "[Prerequisite] Knowledge 6, Intellect 2"
    ]
  },
  {
    "id": "skill-versatile-performer",
    "name": "Versatile Performer",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Perform 6, Intellect 2",
    "modifiers": [],
    "description": "The character is a multi-talented artist.",
    "mechanic": "You gain \"Virtual Skills\" in the Performance category. For every point of Intellect Bonus, gain access to another Performance type (Singing, Dancing, Oratory) at your base rank.",
    "rules": "175",
    "special_rules": "175",
    "body": "# Versatile Performer\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Perform 6, Intellect 2\n\n## Description\nThe character is a multi-talented artist.\n\n## Mechanics & Benefit\nYou gain \"Virtual Skills\" in the Performance category. For every point of Intellect Bonus, gain access to another Performance type (Singing, Dancing, Oratory) at your base rank.\n\n## Special Rules\n175",
    "mechanics": "You gain \"Virtual Skills\" in the Performance category. For every point of Intellect Bonus, gain access to another Performance type (Singing, Dancing, Oratory) at your base rank.",
    "notes": "[Rule] 175\n[Prerequisite] Perform 6, Intellect 2",
    "notesList": [
      "[Rule] 175",
      "[Prerequisite] Perform 6, Intellect 2"
    ]
  },
  {
    "id": "skill-versatile-professional",
    "name": "Versatile Professional",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Vocation 6, Intellect 2",
    "modifiers": [
      {
        "target": "Awareness",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Awareness"
      }
    ],
    "description": "The character knows every job on the crew.",
    "mechanic": "You gain \"Virtual Skills\" in the Vocation category. For every point of Intellect Bonus, gain access to a related Vocation sub-skill without spending BP.  \n  * *Example:* A Soldier with Int \\+2 might gain Virtual Ranks in *Armorer* and *Demolitions*.\n\n# **SPECIAL FEATURES**\n\n# **SPECIAL FEATURES**\n\nSpecies traits, supernatural senses, and augmentations.\n\n| FEATURE NAME | PREREQUISITE | BENEFIT / EFFECT | SPECIAL / NOTES |\n| :---- | :---- | :---- | :---- |\n| **Acute Sense** | \\- | \\+2 to Awareness Checks with chosen sense. |    |\n| **Analytical Sense** | Acute Sense | Gain specific and detailed information from sense. |    |\n| **Uncanny Sense** | Acute Sense | Roll Awareness Checks with chosen sense at Advantage. |    |\n| **Augmented** | \\- | Cybernetic / Biological / Meta Improvements. |    |\n| **Heavy Augmentations** | Augmented | More Intensive Replacements and Enhancements. |    |\n| **Extreme Augmentations** | Heavy Augmented | Replaces a majority of biological components. |    |\n| **Biotechnology** | Awakened or TL4 | Imprinting, using and manipulating Living Technology. |    |\n| **Bonded** | \\- | Tele-Empathic connection with another. |    |\n| **Companion** | Cha | Bio, Tech or other 40BP Companion. | Rank, Multi |\n| **Familiar** | Companion | Empathically linked; know location/state |   |\n| **Mind Link** | Companion | Telepathic link; share skills/knowledge |    |\n| **Shared Senses** | Companion | Gain the senses of and sense through the other |    |\n| **Danger Sense** | Wis 1 | Surprise Checks are made with Advantage. |    |\n| **Dwarfism** | \\- | Smaller than normal size (one category smaller). |    |\n| **Eldritch Heritage** | \\- | Gain a Bloodline Power (Sorcerer/Meta). |    |\n| **Energy Resistance** | \\- | Resistance 5 vs chosen Energy Type. | Rank (up to Immun)    |\n| **Giant** | \\- | Larger than normal size (one category larger). |    |\n| **Life Support** | \\- | Breathe in a non-native environment (Water, Gas, etc). | Multi |\n| **Low Light Vision** | \\- | See in dim light as if bright light. |    |\n| **Darksight** | \\- | See in darkness (Black and White only). |    |\n| **Natural Weapons** | \\- | Armed with Claws, Fangs, Horns etc. | Rank |\n| **Rage** | \\- | \\+2 Str/Con/Will, \\-2 AC, No mental skills. | Rank |\n| **Resistance** | \\- | \\+2 vs Disease, Poison, Magic, etc. | Multi |\n| **Scent** | \\- | Detect opponents by smell (Wisdom Check). |    |\n| **Self-Sustaining** | \\- | Do not need to eat or drink. |    |\n| **Sleepless** | \\- | Do not need to sleep (immunity to sleep effects). |    |\n| **Sense** | Special Ability | Sense 20 ft Radius or a 40 ft Cone (Evil, Magic, etc). | Multi |\n| **Sense, Uncontrolled** | \\- | As Sense, but no off switch; 30 ft Radius / 60 ft Cone. | Multi |\n| **Sneak Attack** | Agi 2, Stealth 1 | Add Int and 1 extra die to damage if target flat footed. | Rank |\n| **Bleed** | Sneak Attack | Cause 1 point Bleed Damage per die of Sneak Attack. |    |\n| **Blind** | Sneak Attack | Direct attack to a target's Sense. |  |\n| **Cripple** | Sneak Attack | Cause severe damage to a target's limb. |  |\n| **Hobble** | Sneak Attack | Reduce a target’s speed by 50% (immobilize on 2nd). |  |\n| **Technologist** | Special | Improved Technology Level in a field of study. | Multi (5+/advance) |\n| **Telepathy** | Special Ability | Mental Communication with any intelligent lifeform. |  |\n| **Wild Speech** | \\- | Communicate with animals. |  |\n\nSpecial Features are often restricted by Species, Origin, or Technology Level. They represent biological realities or extensive body modification rather than simple training.",
    "rules": "176",
    "special_rules": "176",
    "body": "# Versatile Professional\n\n**Category**: Skill Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Vocation 6, Intellect 2\n\n## Description\nThe character knows every job on the crew.\n\n## Mechanics & Benefit\nYou gain \"Virtual Skills\" in the Vocation category. For every point of Intellect Bonus, gain access to a related Vocation sub-skill without spending BP.  \n  * *Example:* A Soldier with Int \\+2 might gain Virtual Ranks in *Armorer* and *Demolitions*.\n\n# **SPECIAL FEATURES**\n\n# **SPECIAL FEATURES**\n\nSpecies traits, supernatural senses, and augmentations.\n\n| FEATURE NAME | PREREQUISITE | BENEFIT / EFFECT | SPECIAL / NOTES |\n| :---- | :---- | :---- | :---- |\n| **Acute Sense** | \\- | \\+2 to Awareness Checks with chosen sense. |    |\n| **Analytical Sense** | Acute Sense | Gain specific and detailed information from sense. |    |\n| **Uncanny Sense** | Acute Sense | Roll Awareness Checks with chosen sense at Advantage. |    |\n| **Augmented** | \\- | Cybernetic / Biological / Meta Improvements. |    |\n| **Heavy Augmentations** | Augmented | More Intensive Replacements and Enhancements. |    |\n| **Extreme Augmentations** | Heavy Augmented | Replaces a majority of biological components. |    |\n| **Biotechnology** | Awakened or TL4 | Imprinting, using and manipulating Living Technology. |    |\n| **Bonded** | \\- | Tele-Empathic connection with another. |    |\n| **Companion** | Cha | Bio, Tech or other 40BP Companion. | Rank, Multi |\n| **Familiar** | Companion | Empathically linked; know location/state |   |\n| **Mind Link** | Companion | Telepathic link; share skills/knowledge |    |\n| **Shared Senses** | Companion | Gain the senses of and sense through the other |    |\n| **Danger Sense** | Wis 1 | Surprise Checks are made with Advantage. |    |\n| **Dwarfism** | \\- | Smaller than normal size (one category smaller). |    |\n| **Eldritch Heritage** | \\- | Gain a Bloodline Power (Sorcerer/Meta). |    |\n| **Energy Resistance** | \\- | Resistance 5 vs chosen Energy Type. | Rank (up to Immun)    |\n| **Giant** | \\- | Larger than normal size (one category larger). |    |\n| **Life Support** | \\- | Breathe in a non-native environment (Water, Gas, etc). | Multi |\n| **Low Light Vision** | \\- | See in dim light as if bright light. |    |\n| **Darksight** | \\- | See in darkness (Black and White only). |    |\n| **Natural Weapons** | \\- | Armed with Claws, Fangs, Horns etc. | Rank |\n| **Rage** | \\- | \\+2 Str/Con/Will, \\-2 AC, No mental skills. | Rank |\n| **Resistance** | \\- | \\+2 vs Disease, Poison, Magic, etc. | Multi |\n| **Scent** | \\- | Detect opponents by smell (Wisdom Check). |    |\n| **Self-Sustaining** | \\- | Do not need to eat or drink. |    |\n| **Sleepless** | \\- | Do not need to sleep (immunity to sleep effects). |    |\n| **Sense** | Special Ability | Sense 20 ft Radius or a 40 ft Cone (Evil, Magic, etc). | Multi |\n| **Sense, Uncontrolled** | \\- | As Sense, but no off switch; 30 ft Radius / 60 ft Cone. | Multi |\n| **Sneak Attack** | Agi 2, Stealth 1 | Add Int and 1 extra die to damage if target flat footed. | Rank |\n| **Bleed** | Sneak Attack | Cause 1 point Bleed Damage per die of Sneak Attack. |    |\n| **Blind** | Sneak Attack | Direct attack to a target's Sense. |  |\n| **Cripple** | Sneak Attack | Cause severe damage to a target's limb. |  |\n| **Hobble** | Sneak Attack | Reduce a target’s speed by 50% (immobilize on 2nd). |  |\n| **Technologist** | Special | Improved Technology Level in a field of study. | Multi (5+/advance) |\n| **Telepathy** | Special Ability | Mental Communication with any intelligent lifeform. |  |\n| **Wild Speech** | \\- | Communicate with animals. |  |\n\nSpecial Features are often restricted by Species, Origin, or Technology Level. They represent biological realities or extensive body modification rather than simple training.\n\n## Special Rules\n176",
    "mechanics": "You gain \"Virtual Skills\" in the Vocation category. For every point of Intellect Bonus, gain access to a related Vocation sub-skill without spending BP.  \n  * *Example:* A Soldier with Int \\+2 might gain Virtual Ranks in *Armorer* and *Demolitions*.\n\n# **SPECIAL FEATURES**\n\n# **SPECIAL FEATURES**\n\nSpecies traits, supernatural senses, and augmentations.\n\n| FEATURE NAME | PREREQUISITE | BENEFIT / EFFECT | SPECIAL / NOTES |\n| :---- | :---- | :---- | :---- |\n| **Acute Sense** | \\- | \\+2 to Awareness Checks with chosen sense. |    |\n| **Analytical Sense** | Acute Sense | Gain specific and detailed information from sense. |    |\n| **Uncanny Sense** | Acute Sense | Roll Awareness Checks with chosen sense at Advantage. |    |\n| **Augmented** | \\- | Cybernetic / Biological / Meta Improvements. |    |\n| **Heavy Augmentations** | Augmented | More Intensive Replacements and Enhancements. |    |\n| **Extreme Augmentations** | Heavy Augmented | Replaces a majority of biological components. |    |\n| **Biotechnology** | Awakened or TL4 | Imprinting, using and manipulating Living Technology. |    |\n| **Bonded** | \\- | Tele-Empathic connection with another. |    |\n| **Companion** | Cha | Bio, Tech or other 40BP Companion. | Rank, Multi |\n| **Familiar** | Companion | Empathically linked; know location/state |   |\n| **Mind Link** | Companion | Telepathic link; share skills/knowledge |    |\n| **Shared Senses** | Companion | Gain the senses of and sense through the other |    |\n| **Danger Sense** | Wis 1 | Surprise Checks are made with Advantage. |    |\n| **Dwarfism** | \\- | Smaller than normal size (one category smaller). |    |\n| **Eldritch Heritage** | \\- | Gain a Bloodline Power (Sorcerer/Meta). |    |\n| **Energy Resistance** | \\- | Resistance 5 vs chosen Energy Type. | Rank (up to Immun)    |\n| **Giant** | \\- | Larger than normal size (one category larger). |    |\n| **Life Support** | \\- | Breathe in a non-native environment (Water, Gas, etc). | Multi |\n| **Low Light Vision** | \\- | See in dim light as if bright light. |    |\n| **Darksight** | \\- | See in darkness (Black and White only). |    |\n| **Natural Weapons** | \\- | Armed with Claws, Fangs, Horns etc. | Rank |\n| **Rage** | \\- | \\+2 Str/Con/Will, \\-2 AC, No mental skills. | Rank |\n| **Resistance** | \\- | \\+2 vs Disease, Poison, Magic, etc. | Multi |\n| **Scent** | \\- | Detect opponents by smell (Wisdom Check). |    |\n| **Self-Sustaining** | \\- | Do not need to eat or drink. |    |\n| **Sleepless** | \\- | Do not need to sleep (immunity to sleep effects). |    |\n| **Sense** | Special Ability | Sense 20 ft Radius or a 40 ft Cone (Evil, Magic, etc). | Multi |\n| **Sense, Uncontrolled** | \\- | As Sense, but no off switch; 30 ft Radius / 60 ft Cone. | Multi |\n| **Sneak Attack** | Agi 2, Stealth 1 | Add Int and 1 extra die to damage if target flat footed. | Rank |\n| **Bleed** | Sneak Attack | Cause 1 point Bleed Damage per die of Sneak Attack. |    |\n| **Blind** | Sneak Attack | Direct attack to a target's Sense. |  |\n| **Cripple** | Sneak Attack | Cause severe damage to a target's limb. |  |\n| **Hobble** | Sneak Attack | Reduce a target’s speed by 50% (immobilize on 2nd). |  |\n| **Technologist** | Special | Improved Technology Level in a field of study. | Multi (5+/advance) |\n| **Telepathy** | Special Ability | Mental Communication with any intelligent lifeform. |  |\n| **Wild Speech** | \\- | Communicate with animals. |  |\n\nSpecial Features are often restricted by Species, Origin, or Technology Level. They represent biological realities or extensive body modification rather than simple training.",
    "notes": "[Modifier] +2 to Awareness\n[Rule] 176\n[Prerequisite] Vocation 6, Intellect 2",
    "notesList": [
      "[Modifier] +2 to Awareness",
      "[Rule] 176",
      "[Prerequisite] Vocation 6, Intellect 2"
    ]
  },
  {
    "id": "special-acute-sense",
    "name": "Acute Sense",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Awareness 1",
    "modifiers": [
      {
        "target": "Awareness",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Awareness"
      }
    ],
    "description": "The character possesses a specific sensory organ that is highly developed, far exceeding the baseline for their species. This could be eagle eyes, a bloodhound’s nose, or sensitive auditory receptors.",
    "mechanic": "Choose one sense (Vision, Hearing, Smell, Taste, or Touch). You gain a **\\+2 Bonus** to **Awareness Checks** utilizing that sense.",
    "rules": "\\[Multiple\\] You may take this feature multiple times, applying it to a different sense each time.",
    "special_rules": "\\[Multiple\\] You may take this feature multiple times, applying it to a different sense each time.",
    "body": "# Acute Sense\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Awareness 1\n\n## Description\nThe character possesses a specific sensory organ that is highly developed, far exceeding the baseline for their species. This could be eagle eyes, a bloodhound’s nose, or sensitive auditory receptors.\n\n## Mechanics & Benefit\nChoose one sense (Vision, Hearing, Smell, Taste, or Touch). You gain a **\\+2 Bonus** to **Awareness Checks** utilizing that sense.\n\n## Special Rules\n\\[Multiple\\] You may take this feature multiple times, applying it to a different sense each time.",
    "mechanics": "Choose one sense (Vision, Hearing, Smell, Taste, or Touch). You gain a **\\+2 Bonus** to **Awareness Checks** utilizing that sense.",
    "notes": "[Modifier] +2 to Awareness\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Multiple\\] You may take this feature multiple times, applying it to a different sense each time.\n[Prerequisite] Awareness 1",
    "notesList": [
      "[Modifier] +2 to Awareness",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] \\[Multiple\\] You may take this feature multiple times, applying it to a different sense each time.",
      "[Prerequisite] Awareness 1"
    ]
  },
  {
    "id": "special-analytical-sense",
    "name": "Analytical Sense",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Acute Sense",
    "modifiers": [],
    "description": "Analytical Sense is a Special Feature: Gain specific and detailed information from sense.",
    "mechanic": "Gain specific and detailed information from sense.",
    "rules": "178",
    "special_rules": "178",
    "body": "# Analytical Sense\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Acute Sense\n\n## Description\nAnalytical Sense is a Special Feature: Gain specific and detailed information from sense.\n\n## Mechanics & Benefit\nGain specific and detailed information from sense.\n\n## Special Rules\n178",
    "mechanics": "Gain specific and detailed information from sense.",
    "notes": "[Rule] 178\n[Prerequisite] Acute Sense",
    "notesList": [
      "[Rule] 178",
      "[Prerequisite] Acute Sense"
    ]
  },
  {
    "id": "special-augmented",
    "name": "Augmented",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Available Technology Level (TL 3+)",
    "modifiers": [],
    "description": "The character has undergone invasive surgery to replace or enhance biological systems with cybernetics, biotechnology, or magical prosthetics.",
    "mechanic": "You are compatible with **Standard Augmentations**.",
    "rules": "Upon taking this feature, you gain a \"credit\" of **6 Build Points (BP)** worth of Augmentations effectively for free (representing the initial suite of upgrades). Any cost beyond this must be paid with BP or Credits.",
    "special_rules": "Upon taking this feature, you gain a \"credit\" of **6 Build Points (BP)** worth of Augmentations effectively for free (representing the initial suite of upgrades). Any cost beyond this must be paid with BP or Credits.",
    "body": "# Augmented\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Available Technology Level (TL 3+)\n\n## Description\nThe character has undergone invasive surgery to replace or enhance biological systems with cybernetics, biotechnology, or magical prosthetics.\n\n## Mechanics & Benefit\nYou are compatible with **Standard Augmentations**.\n\n## Special Rules\nUpon taking this feature, you gain a \"credit\" of **6 Build Points (BP)** worth of Augmentations effectively for free (representing the initial suite of upgrades). Any cost beyond this must be paid with BP or Credits.",
    "mechanics": "You are compatible with **Standard Augmentations**.",
    "notes": "[Rule] Upon taking this feature, you gain a \"credit\" of **6 Build Points (BP)** worth of Augmentations effe...\n[Prerequisite] Available Technology Level (TL 3+)",
    "notesList": [
      "[Rule] Upon taking this feature, you gain a \"credit\" of **6 Build Points (BP)** worth of Augmentations effe...",
      "[Prerequisite] Available Technology Level (TL 3+)"
    ]
  },
  {
    "id": "special-biotechnology",
    "name": "Biotechnology",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awakened (Psychic) OR Tech Level 4+ society.",
    "modifiers": [],
    "description": "The character is trained or naturally adapted to use \"Living Technology\"—grown items, symbiotic armor, and genetically engineered tools (common among Aulurans and Tyranid-like factions).",
    "mechanic": "You can imprint, operate, and heal Living Technology. Without this feature, Biotech items treat the user as a foreign body and may not function or may even attack the user.",
    "rules": "183",
    "special_rules": "183",
    "body": "# Biotechnology\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Awakened (Psychic) OR Tech Level 4+ society.\n\n## Description\nThe character is trained or naturally adapted to use \"Living Technology\"—grown items, symbiotic armor, and genetically engineered tools (common among Aulurans and Tyranid-like factions).\n\n## Mechanics & Benefit\nYou can imprint, operate, and heal Living Technology. Without this feature, Biotech items treat the user as a foreign body and may not function or may even attack the user.\n\n## Special Rules\n183",
    "mechanics": "You can imprint, operate, and heal Living Technology. Without this feature, Biotech items treat the user as a foreign body and may not function or may even attack the user.",
    "notes": "[Rule] 183\n[Prerequisite] Awakened (Psychic) OR Tech Level 4+ society.",
    "notesList": [
      "[Rule] 183",
      "[Prerequisite] Awakened (Psychic) OR Tech Level 4+ society."
    ]
  },
  {
    "id": "special-bleed",
    "name": "Bleed",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Sneak Attack",
    "modifiers": [],
    "description": "Bleed is a Special Feature: Cause 1 point Bleed Damage per die of Sneak Attack.",
    "mechanic": "Cause 1 point Bleed Damage per die of Sneak Attack.",
    "rules": "207",
    "special_rules": "207",
    "body": "# Bleed\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nBleed is a Special Feature: Cause 1 point Bleed Damage per die of Sneak Attack.\n\n## Mechanics & Benefit\nCause 1 point Bleed Damage per die of Sneak Attack.\n\n## Special Rules\n207",
    "mechanics": "Cause 1 point Bleed Damage per die of Sneak Attack.",
    "notes": "[Rule] 207\n[Prerequisite] Sneak Attack",
    "notesList": [
      "[Rule] 207",
      "[Prerequisite] Sneak Attack"
    ]
  },
  {
    "id": "special-blind",
    "name": "Blind",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Sneak Attack",
    "modifiers": [],
    "description": "Blind is a Special Feature: Direct attack to a target's Sense.",
    "mechanic": "Direct attack to a target's Sense.",
    "rules": "208",
    "special_rules": "208",
    "body": "# Blind\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nBlind is a Special Feature: Direct attack to a target's Sense.\n\n## Mechanics & Benefit\nDirect attack to a target's Sense.\n\n## Special Rules\n208",
    "mechanics": "Direct attack to a target's Sense.",
    "notes": "[Rule] 208\n[Prerequisite] Sneak Attack",
    "notesList": [
      "[Rule] 208",
      "[Prerequisite] Sneak Attack"
    ]
  },
  {
    "id": "special-bonded",
    "name": "Bonded",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 2",
    "modifiers": [],
    "description": "The character shares a profound, supernatural connection with another specific being.",
    "mechanic": "You possess a **Tele-Empathic** link with another character (PC or NPC) who also possesses this feature. You can sense their strong emotions and general physical state (pain, unconsciousness) regardless of distance.",
    "rules": "184",
    "special_rules": "184",
    "body": "# Bonded\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character shares a profound, supernatural connection with another specific being.\n\n## Mechanics & Benefit\nYou possess a **Tele-Empathic** link with another character (PC or NPC) who also possesses this feature. You can sense their strong emotions and general physical state (pain, unconsciousness) regardless of distance.\n\n## Special Rules\n184",
    "mechanics": "You possess a **Tele-Empathic** link with another character (PC or NPC) who also possesses this feature. You can sense their strong emotions and general physical state (pain, unconsciousness) regardless of distance.",
    "notes": "[Rule] 184\n[Prerequisite] Charisma 2",
    "notesList": [
      "[Rule] 184",
      "[Prerequisite] Charisma 2"
    ]
  },
  {
    "id": "special-companion",
    "name": "Companion",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "cp": 3,
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": true,
    "prerequisites": "Charisma 1",
    "modifiers": [],
    "description": "The character has unlocked access to a loyal companion, bio-construct, tactical drone, or metaphysical cohort.",
    "mechanic": "Purchasing this feature unlocks access to the Modular Companion Matrix and grants a loyal cohort constructed with **40 Character Points (CP)** (15 CP Form Package + 25 CP Function Package).",
    "rules": "**[Ranked / Multiple Purchases]**: You may purchase this feature multiple times:\n- **Additional Companion Unit**: Each new purchase of the Companion feature allows you to unlock and construct an additional separate 40 CP Companion.\n- **Enhanced Build Budget**: Alternatively, taking an additional rank in an existing companion grants **+10 CP** to that companion's build budget (Rank 1: 40 CP, Rank 2: 50 CP, Rank 3: 60 CP, etc.).",
    "special_rules": "**[Ranked / Multiple Purchases]**: You may purchase this feature multiple times:\n- **Additional Companion Unit**: Each new purchase of the Companion feature allows you to unlock and construct an additional separate 40 CP Companion.\n- **Enhanced Build Budget**: Alternatively, taking an additional rank in an existing companion grants **+10 CP** to that companion's build budget (Rank 1: 40 CP, Rank 2: 50 CP, Rank 3: 60 CP, etc.).",
    "body": "# Companion\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1\n\n## Description\nAs with Metaphysics (Awakened) and Augmentations (Augmented), access to Companions must be unlocked by purchasing the **Companion** feature. The character gains a loyal follower, bio-engineered beast, combat drone, or metaphysical spirit-guide.\n\n## Mechanics & Benefit\nPurchasing this feature unlocks access to the Modular Companion Matrix and grants a loyal cohort constructed with **40 Character Points (CP)** (15 CP Form Package + 25 CP Function Package).\n\n## Special Rules\n**[Ranked / Multiple Purchases]**: You may purchase this feature multiple times:\n- **Additional Companion Unit**: Each new purchase of the Companion feature allows you to unlock and construct an additional separate 40 CP Companion.\n- **Enhanced Build Budget**: Alternatively, taking an additional rank in an existing companion grants **+10 CP** to that companion's build budget (Rank 1: 40 CP, Rank 2: 50 CP, Rank 3: 60 CP, etc.).",
    "mechanics": "Purchasing this feature unlocks access to the Modular Companion Matrix and grants a loyal cohort constructed with **40 Character Points (CP)** (15 CP Form Package + 25 CP Function Package).",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] **[Ranked / Multiple Purchases]**: You may purchase this feature multiple times:\n- **Additional Comp...\n[Prerequisite] Charisma 1",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] **[Ranked / Multiple Purchases]**: You may purchase this feature multiple times:\n- **Additional Comp...",
      "[Prerequisite] Charisma 1"
    ]
  },
  {
    "id": "special-cripple",
    "name": "Cripple",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Sneak Attack",
    "modifiers": [],
    "description": "Cripple is a Special Feature: Cause severe damage to a target's limb.",
    "mechanic": "Cause severe damage to a target's limb.",
    "rules": "209",
    "special_rules": "209",
    "body": "# Cripple\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nCripple is a Special Feature: Cause severe damage to a target's limb.\n\n## Mechanics & Benefit\nCause severe damage to a target's limb.\n\n## Special Rules\n209",
    "mechanics": "Cause severe damage to a target's limb.",
    "notes": "[Rule] 209\n[Prerequisite] Sneak Attack",
    "notesList": [
      "[Rule] 209",
      "[Prerequisite] Sneak Attack"
    ]
  },
  {
    "id": "special-danger-sense",
    "name": "Danger Sense",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Wisdom 1",
    "modifiers": [],
    "description": "A \"sixth sense\" or spidey-sense that warns of immediate peril.",
    "mechanic": "You make all **Surprise Checks** and checks to avoid traps at **Advantage**. You are never truly \"unaware\" of direct danger, allowing you to act in the Surprise round.",
    "rules": "189",
    "special_rules": "189",
    "body": "# Danger Sense\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nA \"sixth sense\" or spidey-sense that warns of immediate peril.\n\n## Mechanics & Benefit\nYou make all **Surprise Checks** and checks to avoid traps at **Advantage**. You are never truly \"unaware\" of direct danger, allowing you to act in the Surprise round.\n\n## Special Rules\n189",
    "mechanics": "You make all **Surprise Checks** and checks to avoid traps at **Advantage**. You are never truly \"unaware\" of direct danger, allowing you to act in the Surprise round.",
    "notes": "[Rule] 189\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Rule] 189",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "special-darksight",
    "name": "Darksight",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character sees using thermal or other non-visible spectrums.",
    "mechanic": "You can see in total darkness up to 60 feet.",
    "rules": "196",
    "special_rules": "196",
    "body": "# Darksight\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character sees using thermal or other non-visible spectrums.\n\n## Mechanics & Benefit\nYou can see in total darkness up to 60 feet.\n\n## Special Rules\n196",
    "mechanics": "You can see in total darkness up to 60 feet.",
    "notes": "[Rule] 196",
    "notesList": [
      "[Rule] 196"
    ]
  },
  {
    "id": "special-dwarfism",
    "name": "Dwarfism",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Species Trait or Flaw",
    "modifiers": [],
    "description": "The character is significantly smaller than the average for their species.",
    "mechanic": "Your Size Category decreases by one step (e.g., Medium to Small).",
    "rules": "190",
    "special_rules": "190",
    "body": "# Dwarfism\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Species Trait or Flaw\n\n## Description\nThe character is significantly smaller than the average for their species.\n\n## Mechanics & Benefit\nYour Size Category decreases by one step (e.g., Medium to Small).\n\n## Special Rules\n190",
    "mechanics": "Your Size Category decreases by one step (e.g., Medium to Small).",
    "notes": "[Rule] 190\n[Prerequisite] Species Trait or Flaw",
    "notesList": [
      "[Rule] 190",
      "[Prerequisite] Species Trait or Flaw"
    ]
  },
  {
    "id": "special-eldritch-heritage",
    "name": "Eldritch Heritage",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None (Background)",
    "modifiers": [],
    "description": "The character carries the blood of dragons, demons, fey, or gods.",
    "mechanic": "You gain a specific **Bloodline Power** or minor supernatural trait associated with your ancestor (e.g., minor energy resistance, claws, or a cantrip-level spell usable at will).",
    "rules": "191",
    "special_rules": "191",
    "body": "# Eldritch Heritage\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None (Background)\n\n## Description\nThe character carries the blood of dragons, demons, fey, or gods.\n\n## Mechanics & Benefit\nYou gain a specific **Bloodline Power** or minor supernatural trait associated with your ancestor (e.g., minor energy resistance, claws, or a cantrip-level spell usable at will).\n\n## Special Rules\n191",
    "mechanics": "You gain a specific **Bloodline Power** or minor supernatural trait associated with your ancestor (e.g., minor energy resistance, claws, or a cantrip-level spell usable at will).",
    "notes": "[Rule] 191\n[Prerequisite] None (Background)",
    "notesList": [
      "[Rule] 191",
      "[Prerequisite] None (Background)"
    ]
  },
  {
    "id": "special-energy-resistance",
    "name": "Energy Resistance",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character's physiology is resistant to a specific form of energy (Fire, Cold, Electricity, Acid, Sonic).",
    "mechanic": "Gain **Resistance 5** against one chosen energy type. (Subtract 5 from all damage of that type).",
    "rules": "\\[Ranked\\] Stacks to Resistance 10, 15, etc., eventually becoming Immunity.",
    "special_rules": "\\[Ranked\\] Stacks to Resistance 10, 15, etc., eventually becoming Immunity.",
    "body": "# Energy Resistance\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character's physiology is resistant to a specific form of energy (Fire, Cold, Electricity, Acid, Sonic).\n\n## Mechanics & Benefit\nGain **Resistance 5** against one chosen energy type. (Subtract 5 from all damage of that type).\n\n## Special Rules\n\\[Ranked\\] Stacks to Resistance 10, 15, etc., eventually becoming Immunity.",
    "mechanics": "Gain **Resistance 5** against one chosen energy type. (Subtract 5 from all damage of that type).",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] \\[Ranked\\] Stacks to Resistance 10, 15, etc., eventually becoming Immunity.",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] \\[Ranked\\] Stacks to Resistance 10, 15, etc., eventually becoming Immunity."
    ]
  },
  {
    "id": "special-extreme-augmentations",
    "name": "Extreme Augmentations",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Heavy Augmentations, Stamina 4",
    "modifiers": [],
    "description": "The character is more machine (or bio-construct) than original being. They have replaced the majority of their biological functions.",
    "mechanic": "You may undergo Full Body Conversion. You may install systems that alter your Size category or basic physiology (e.g., tank treads instead of legs). You gain an additional 6 BP worth of Augmentations.",
    "rules": "Grants an additional 6 BP worth of Augmentations for free (+18 BP cumulative credit). Permits Full Body Conversion (FBC) chassis and radical physiological structural alterations.",
    "special_rules": "Grants an additional 6 BP worth of Augmentations for free (+18 BP cumulative credit). Permits Full Body Conversion (FBC) chassis and radical physiological structural alterations.",
    "body": "# Extreme Augmentations\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Heavy Augmentations, Stamina 4\n\n## Description\nThe character is more machine (or bio-construct) than original being. They have replaced the majority of biological functions.\n\n## Mechanics & Benefit\nYou may undergo Full Body Conversion. You may install systems that alter your Size category or basic physiology (e.g., tank treads instead of legs). You gain an additional 6 BP worth of Augmentations.\n\n## Special Rules\nGrants an additional 6 BP worth of Augmentations for free (+18 BP cumulative credit). Permits Full Body Conversion (FBC) chassis and radical physiological structural alterations.",
    "mechanics": "You may undergo Full Body Conversion. You may install systems that alter your Size category or basic physiology (e.g., tank treads instead of legs). You gain an additional 6 BP worth of Augmentations.",
    "notes": "[Rule] Grants an additional 6 BP worth of Augmentations for free (+18 BP cumulative credit). Permits Full B...\n[Prerequisite] Heavy Augmentations, Stamina 4",
    "notesList": [
      "[Rule] Grants an additional 6 BP worth of Augmentations for free (+18 BP cumulative credit). Permits Full B...",
      "[Prerequisite] Heavy Augmentations, Stamina 4"
    ]
  },
  {
    "id": "special-familiar",
    "name": "Familiar",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Companion",
    "modifiers": [],
    "description": "Familiar is a Special Feature: Empathically linked; know location/state (+20BP to Companion).",
    "mechanic": "Empathically linked; know location/state (+20BP to Companion).",
    "rules": "186",
    "special_rules": "186",
    "body": "# Familiar\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Companion\n\n## Description\nFamiliar is a Special Feature: Empathically linked; know location/state (+20BP to Companion).\n\n## Mechanics & Benefit\nEmpathically linked; know location/state (+20BP to Companion).\n\n## Special Rules\n186",
    "mechanics": "Empathically linked; know location/state (+20BP to Companion).",
    "notes": "[Rule] 186\n[Prerequisite] Companion",
    "notesList": [
      "[Rule] 186",
      "[Prerequisite] Companion"
    ]
  },
  {
    "id": "special-giant",
    "name": "Giant",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Species Trait",
    "modifiers": [],
    "description": "The character is significantly larger than the average for their species.",
    "mechanic": "Your Size Category increases by one step (e.g., Medium to Large).",
    "rules": "193",
    "special_rules": "193",
    "body": "# Giant\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Species Trait\n\n## Description\nThe character is significantly larger than the average for their species.\n\n## Mechanics & Benefit\nYour Size Category increases by one step (e.g., Medium to Large).\n\n## Special Rules\n193",
    "mechanics": "Your Size Category increases by one step (e.g., Medium to Large).",
    "notes": "[Rule] 193\n[Prerequisite] Species Trait",
    "notesList": [
      "[Rule] 193",
      "[Prerequisite] Species Trait"
    ]
  },
  {
    "id": "special-heavy-augmentations",
    "name": "Heavy Augmentations",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Augmented, Stamina 2",
    "modifiers": [],
    "description": "The character has replaced significant portions of their body with industrial or military-grade hardware. These modifications are often bulky, obvious, and not designed for social integration.",
    "mechanic": "You may install Heavy class Augmentations (which often have higher DR or Strength bonuses but may impose social penalties). You gain an additional 6 BP worth of Augmentations.",
    "rules": "Grants an additional 6 BP worth of Augmentations for free (+12 BP cumulative credit). Unlocks compatibility with Heavy class cybernetic and biomechanical hardware.",
    "special_rules": "Grants an additional 6 BP worth of Augmentations for free (+12 BP cumulative credit). Unlocks compatibility with Heavy class cybernetic and biomechanical hardware.",
    "body": "# Heavy Augmentations\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Augmented, Stamina 2\n\n## Description\nThe character has replaced significant portions of their body with industrial or military-grade hardware. These modifications are often bulky, obvious, and not designed for social integration.\n\n## Mechanics & Benefit\nYou may install Heavy class Augmentations (which often have higher DR or Strength bonuses but may impose social penalties). You gain an additional 6 BP worth of Augmentations.\n\n## Special Rules\nGrants an additional 6 BP worth of Augmentations for free (+12 BP cumulative credit). Unlocks compatibility with Heavy class cybernetic and biomechanical hardware.",
    "mechanics": "You may install Heavy class Augmentations (which often have higher DR or Strength bonuses but may impose social penalties). You gain an additional 6 BP worth of Augmentations.",
    "notes": "[Rule] Grants an additional 6 BP worth of Augmentations for free (+12 BP cumulative credit). Unlocks compat...\n[Prerequisite] Augmented, Stamina 2",
    "notesList": [
      "[Rule] Grants an additional 6 BP worth of Augmentations for free (+12 BP cumulative credit). Unlocks compat...",
      "[Prerequisite] Augmented, Stamina 2"
    ]
  },
  {
    "id": "special-hobble",
    "name": "Hobble",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Sneak Attack",
    "modifiers": [],
    "description": "Hobble is a Special Feature: Reduce a target’s speed by 50% (immobilize on 2nd).",
    "mechanic": "Reduce a target’s speed by 50% (immobilize on 2nd).",
    "rules": "210",
    "special_rules": "210",
    "body": "# Hobble\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nHobble is a Special Feature: Reduce a target’s speed by 50% (immobilize on 2nd).\n\n## Mechanics & Benefit\nReduce a target’s speed by 50% (immobilize on 2nd).\n\n## Special Rules\n210",
    "mechanics": "Reduce a target’s speed by 50% (immobilize on 2nd).",
    "notes": "[Rule] 210\n[Prerequisite] Sneak Attack",
    "notesList": [
      "[Rule] 210",
      "[Prerequisite] Sneak Attack"
    ]
  },
  {
    "id": "special-life-support",
    "name": "Life Support",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character can survive in environments hostile to their biology.",
    "mechanic": "You can breathe and function comfortably in a specific non-native environment.",
    "rules": "Multiple 194",
    "special_rules": "Multiple 194",
    "body": "# Life Support\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character can survive in environments hostile to their biology.\n\n## Mechanics & Benefit\nYou can breathe and function comfortably in a specific non-native environment.\n\n## Special Rules\nMultiple 194",
    "mechanics": "You can breathe and function comfortably in a specific non-native environment.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Multiple 194",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Multiple 194"
    ]
  },
  {
    "id": "special-low-light-vision",
    "name": "Low Light Vision",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character's eyes magnify ambient light.",
    "mechanic": "You can see in dim light (starlight, moonlight) as clearly as if it were bright daylight. You interpret color normally. You still cannot see in absolute darkness.",
    "rules": "195",
    "special_rules": "195",
    "body": "# Low Light Vision\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character's eyes magnify ambient light.\n\n## Mechanics & Benefit\nYou can see in dim light (starlight, moonlight) as clearly as if it were bright daylight. You interpret color normally. You still cannot see in absolute darkness.\n\n## Special Rules\n195",
    "mechanics": "You can see in dim light (starlight, moonlight) as clearly as if it were bright daylight. You interpret color normally. You still cannot see in absolute darkness.",
    "notes": "[Rule] 195",
    "notesList": [
      "[Rule] 195"
    ]
  },
  {
    "id": "special-mind-link",
    "name": "Mind Link",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Companion",
    "modifiers": [],
    "description": "Mind Link is a Special Feature: Telepathic link; share skills/knowledge (+10BP to Companion).",
    "mechanic": "Telepathic link; share skills/knowledge (+10BP to Companion).",
    "rules": "187",
    "special_rules": "187",
    "body": "# Mind Link\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Companion\n\n## Description\nMind Link is a Special Feature: Telepathic link; share skills/knowledge (+10BP to Companion).\n\n## Mechanics & Benefit\nTelepathic link; share skills/knowledge (+10BP to Companion).\n\n## Special Rules\n187",
    "mechanics": "Telepathic link; share skills/knowledge (+10BP to Companion).",
    "notes": "[Rule] 187\n[Prerequisite] Companion",
    "notesList": [
      "[Rule] 187",
      "[Prerequisite] Companion"
    ]
  },
  {
    "id": "special-natural-weapons",
    "name": "Natural Weapons",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [],
    "description": "The character possesses claws, fangs, horns, or a tail striker.",
    "mechanic": "You are always armed. Your Unarmed Strikes deal Lethal damage and the damage die is increased.  \n  * *Small/Medium:* 1d4 or 1d6 damage.  \n  * *Large:* 1d8 damage.",
    "rules": "\\[Ranked\\] Can be taken to increase the damage die size.",
    "special_rules": "\\[Ranked\\] Can be taken to increase the damage die size.",
    "body": "# Natural Weapons\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses claws, fangs, horns, or a tail striker.\n\n## Mechanics & Benefit\nYou are always armed. Your Unarmed Strikes deal Lethal damage and the damage die is increased.  \n  * *Small/Medium:* 1d4 or 1d6 damage.  \n  * *Large:* 1d8 damage.\n\n## Special Rules\n\\[Ranked\\] Can be taken to increase the damage die size.",
    "mechanics": "You are always armed. Your Unarmed Strikes deal Lethal damage and the damage die is increased.  \n  * *Small/Medium:* 1d4 or 1d6 damage.  \n  * *Large:* 1d8 damage.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] \\[Ranked\\] Can be taken to increase the damage die size.",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] \\[Ranked\\] Can be taken to increase the damage die size."
    ]
  },
  {
    "id": "special-non-lethal-immunity",
    "name": "Non-Lethal Immunity",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "-",
    "modifiers": [],
    "description": "Non-Lethal Immunity is a Special Feature: Immune to Non-Lethal Damage.",
    "mechanic": "Immune to Non-Lethal Damage.",
    "rules": "198",
    "special_rules": "198",
    "body": "# Non-Lethal Immunity\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: \\-\n\n## Description\nNon-Lethal Immunity is a Special Feature: Immune to Non-Lethal Damage.\n\n## Mechanics & Benefit\nImmune to Non-Lethal Damage.\n\n## Special Rules\n198",
    "mechanics": "Immune to Non-Lethal Damage.",
    "notes": "[Rule] 198\n[Prerequisite] -",
    "notesList": [
      "[Rule] 198",
      "[Prerequisite] -"
    ]
  },
  {
    "id": "special-rage",
    "name": "Rage",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "None",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": -2,
        "mode": "inherent",
        "description": "-2 Defense"
      }
    ],
    "description": "The character can tap into a primal fury, ignoring safety for raw power.",
    "mechanic": "As a Free Action, enter a Rage.  \n  * **Gain:** \\+2 Strength, \\+2 Stamina (and temporary Health), \\+2 Will.  \n  * **Suffer:** \\-2 Defense. You cannot use skills requiring patience or concentration (most Mental/Tech skills).  \n  * **Duration:** Rounds equal to 4 \\+ New Stamina Mod. Ends in fatigue.",
    "rules": "Ranked 199",
    "special_rules": "Ranked 199",
    "body": "# Rage\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: None\n\n## Description\nThe character can tap into a primal fury, ignoring safety for raw power.\n\n## Mechanics & Benefit\nAs a Free Action, enter a Rage.  \n  * **Gain:** \\+2 Strength, \\+2 Stamina (and temporary Health), \\+2 Will.  \n  * **Suffer:** \\-2 Defense. You cannot use skills requiring patience or concentration (most Mental/Tech skills).  \n  * **Duration:** Rounds equal to 4 \\+ New Stamina Mod. Ends in fatigue.\n\n## Special Rules\nRanked 199",
    "mechanics": "As a Free Action, enter a Rage.  \n  * **Gain:** \\+2 Strength, \\+2 Stamina (and temporary Health), \\+2 Will.  \n  * **Suffer:** \\-2 Defense. You cannot use skills requiring patience or concentration (most Mental/Tech skills).  \n  * **Duration:** Rounds equal to 4 \\+ New Stamina Mod. Ends in fatigue.",
    "notes": "[Penalty] -2 Defense\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked 199",
    "notesList": [
      "[Penalty] -2 Defense",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked 199"
    ]
  },
  {
    "id": "special-resistance",
    "name": "Resistance",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Stamina 1",
    "modifiers": [],
    "description": "The character has a fortified immune system or supernatural resilience.",
    "mechanic": "Gain a **\\+2 Bonus** to saves against a specific hazard category: **Disease**, **Poison**, **Radiation**, or **Magic**.",
    "rules": "\\[Multiple\\] Can be taken for different hazards.",
    "special_rules": "\\[Multiple\\] Can be taken for different hazards.",
    "body": "# Resistance\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThe character has a fortified immune system or supernatural resilience.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to saves against a specific hazard category: **Disease**, **Poison**, **Radiation**, or **Magic**.\n\n## Special Rules\n\\[Multiple\\] Can be taken for different hazards.",
    "mechanics": "Gain a **\\+2 Bonus** to saves against a specific hazard category: **Disease**, **Poison**, **Radiation**, or **Magic**.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Multiple\\] Can be taken for different hazards.\n[Prerequisite] Stamina 1",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] \\[Multiple\\] Can be taken for different hazards.",
      "[Prerequisite] Stamina 1"
    ]
  },
  {
    "id": "special-scent",
    "name": "Scent",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Wisdom 1",
    "modifiers": [],
    "description": "The character can detect creatures and objects by smell alone.",
    "mechanic": "You can detect opponents within 30 feet by sense of smell. You can track creatures using **Survival** based on scent trails.",
    "rules": "201",
    "special_rules": "201",
    "body": "# Scent\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character can detect creatures and objects by smell alone.\n\n## Mechanics & Benefit\nYou can detect opponents within 30 feet by sense of smell. You can track creatures using **Survival** based on scent trails.\n\n## Special Rules\n201",
    "mechanics": "You can detect opponents within 30 feet by sense of smell. You can track creatures using **Survival** based on scent trails.",
    "notes": "[Rule] 201\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Rule] 201",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "special-self-sustaining",
    "name": "Self-Sustaining",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Synthetic, Plant, or Undead traits",
    "modifiers": [],
    "description": "The character does not require standard biological fuel.",
    "mechanic": "You do not need to eat or drink. You may rely on solar power, a battery recharge, or magical energy, but you are immune to starvation and dehydration mechanics.",
    "rules": "202",
    "special_rules": "202",
    "body": "# Self-Sustaining\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Synthetic, Plant, or Undead traits\n\n## Description\nThe character does not require standard biological fuel.\n\n## Mechanics & Benefit\nYou do not need to eat or drink. You may rely on solar power, a battery recharge, or magical energy, but you are immune to starvation and dehydration mechanics.\n\n## Special Rules\n202",
    "mechanics": "You do not need to eat or drink. You may rely on solar power, a battery recharge, or magical energy, but you are immune to starvation and dehydration mechanics.",
    "notes": "[Rule] 202\n[Prerequisite] Synthetic, Plant, or Undead traits",
    "notesList": [
      "[Rule] 202",
      "[Prerequisite] Synthetic, Plant, or Undead traits"
    ]
  },
  {
    "id": "special-sense",
    "name": "Sense",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Awakened or Species Trait",
    "modifiers": [],
    "description": "The character can sense a specific type of energy or presence.",
    "mechanic": "You can detect a specific aura (Evil, Magic, Life, Tech, Heat) within a **20 ft Radius** or a **40 ft Cone**. This requires active concentration (Standard Action).",
    "rules": "Multiple 204",
    "special_rules": "Multiple 204",
    "body": "# Sense\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Awakened or Species Trait\n\n## Description\nThe character can sense a specific type of energy or presence.\n\n## Mechanics & Benefit\nYou can detect a specific aura (Evil, Magic, Life, Tech, Heat) within a **20 ft Radius** or a **40 ft Cone**. This requires active concentration (Standard Action).\n\n## Special Rules\nMultiple 204",
    "mechanics": "You can detect a specific aura (Evil, Magic, Life, Tech, Heat) within a **20 ft Radius** or a **40 ft Cone**. This requires active concentration (Standard Action).",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Multiple 204\n[Prerequisite] Awakened or Species Trait",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Multiple 204",
      "[Prerequisite] Awakened or Species Trait"
    ]
  },
  {
    "id": "special-sense-uncontrolled",
    "name": "Sense, Uncontrolled",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Special",
    "modifiers": [],
    "description": "The character is constantly bombarded by sensory input.",
    "mechanic": "As *Sense*, but the range increases to **30 ft Radius / 60 ft Cone**.",
    "rules": "Multiple 205",
    "special_rules": "Multiple 205",
    "body": "# Sense, Uncontrolled\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Special\n\n## Description\nThe character is constantly bombarded by sensory input.\n\n## Mechanics & Benefit\nAs *Sense*, but the range increases to **30 ft Radius / 60 ft Cone**.\n\n## Special Rules\nMultiple 205",
    "mechanics": "As *Sense*, but the range increases to **30 ft Radius / 60 ft Cone**.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Multiple 205\n[Prerequisite] Special",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Multiple 205",
      "[Prerequisite] Special"
    ]
  },
  {
    "id": "special-shared-senses",
    "name": "Shared Senses",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Companion",
    "modifiers": [],
    "description": "Shared Senses is a Special Feature: Gain the senses of and sense through the other (+10BP to Companion).",
    "mechanic": "Gain the senses of and sense through the other (+10BP to Companion).",
    "rules": "188",
    "special_rules": "188",
    "body": "# Shared Senses\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Companion\n\n## Description\nShared Senses is a Special Feature: Gain the senses of and sense through the other (+10BP to Companion).\n\n## Mechanics & Benefit\nGain the senses of and sense through the other (+10BP to Companion).\n\n## Special Rules\n188",
    "mechanics": "Gain the senses of and sense through the other (+10BP to Companion).",
    "notes": "[Rule] 188\n[Prerequisite] Companion",
    "notesList": [
      "[Rule] 188",
      "[Prerequisite] Companion"
    ]
  },
  {
    "id": "special-sleepless",
    "name": "Sleepless",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Synthetic, Elf, or Special",
    "modifiers": [],
    "description": "The character does not require sleep cycles (though they may need downtime for system diagnostics or meditation).",
    "mechanic": "You are **Immune** to magical sleep effects. You do not need 8 hours of sleep; you remain conscious during rest periods, though you must still engage in light activity to gain the benefits of a Long Rest.",
    "rules": "203",
    "special_rules": "203",
    "body": "# Sleepless\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Synthetic, Elf, or Special\n\n## Description\nThe character does not require sleep cycles (though they may need downtime for system diagnostics or meditation).\n\n## Mechanics & Benefit\nYou are **Immune** to magical sleep effects. You do not need 8 hours of sleep; you remain conscious during rest periods, though you must still engage in light activity to gain the benefits of a Long Rest.\n\n## Special Rules\n203",
    "mechanics": "You are **Immune** to magical sleep effects. You do not need 8 hours of sleep; you remain conscious during rest periods, though you must still engage in light activity to gain the benefits of a Long Rest.",
    "notes": "[Rule] 203\n[Prerequisite] Synthetic, Elf, or Special",
    "notesList": [
      "[Rule] 203",
      "[Prerequisite] Synthetic, Elf, or Special"
    ]
  },
  {
    "id": "special-sneak-attack",
    "name": "Sneak Attack",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": true,
    "max_rank": 4,
    "is_multiple": false,
    "prerequisites": "Agility 2, Stealth 1",
    "modifiers": [],
    "description": "The character knows exactly where to strike to deal maximum damage to a vulnerable target.",
    "mechanic": "If you attack a target that is **Flat-Footed** or **Flanked**, you deal extra damage.",
    "rules": "\\[Ranked\\] Each additional rank adds \\+1d6 to the damage.",
    "special_rules": "\\[Ranked\\] Each additional rank adds \\+1d6 to the damage.",
    "body": "# Sneak Attack\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Agility 2, Stealth 1\n\n## Description\nThe character knows exactly where to strike to deal maximum damage to a vulnerable target.\n\n## Mechanics & Benefit\nIf you attack a target that is **Flat-Footed** or **Flanked**, you deal extra damage.\n\n## Special Rules\n\\[Ranked\\] Each additional rank adds \\+1d6 to the damage.",
    "mechanics": "If you attack a target that is **Flat-Footed** or **Flanked**, you deal extra damage.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] \\[Ranked\\] Each additional rank adds \\+1d6 to the damage.\n[Prerequisite] Agility 2, Stealth 1",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] \\[Ranked\\] Each additional rank adds \\+1d6 to the damage.",
      "[Prerequisite] Agility 2, Stealth 1"
    ]
  },
  {
    "id": "special-technologist",
    "name": "Technologist",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intellect 3, Technology (Knowledge) 11",
    "modifiers": [],
    "description": "The character is ahead of the curve, understanding technology that shouldn't exist yet. For a character to advance in their (TL Tech Level) they will require different fields of advanced study, the feature will need to be selected multiple times for various fields (minimum of five).",
    "mechanic": "You treat your effective **Tech Level** as one step higher for the purposes of crafting, repairing, or understanding advanced artifacts in a specific field of study.  \n  * Agriculture  \n  * Architecture  \n  * Biotechnology  \n  * Commerce  \n  * Communication  \n  * Devices  \n  * Education  \n  * Energy  \n  * Manufacturing  \n  * Materials  \n  * Medicine  \n  * Meta Sciences  \n  * Science  \n  * Society  \n  * Synthetic Intelligence  \n  * Transportation  \n  * Weaponry",
    "rules": "211",
    "special_rules": "211",
    "body": "# Technologist\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Intellect 3, Technology (Knowledge) 11\n\n## Description\nThe character is ahead of the curve, understanding technology that shouldn't exist yet. For a character to advance in their (TL Tech Level) they will require different fields of advanced study, the feature will need to be selected multiple times for various fields (minimum of five).\n\n## Mechanics & Benefit\nYou treat your effective **Tech Level** as one step higher for the purposes of crafting, repairing, or understanding advanced artifacts in a specific field of study.  \n  * Agriculture  \n  * Architecture  \n  * Biotechnology  \n  * Commerce  \n  * Communication  \n  * Devices  \n  * Education  \n  * Energy  \n  * Manufacturing  \n  * Materials  \n  * Medicine  \n  * Meta Sciences  \n  * Science  \n  * Society  \n  * Synthetic Intelligence  \n  * Transportation  \n  * Weaponry\n\n## Special Rules\n211",
    "mechanics": "You treat your effective **Tech Level** as one step higher for the purposes of crafting, repairing, or understanding advanced artifacts in a specific field of study.  \n  * Agriculture  \n  * Architecture  \n  * Biotechnology  \n  * Commerce  \n  * Communication  \n  * Devices  \n  * Education  \n  * Energy  \n  * Manufacturing  \n  * Materials  \n  * Medicine  \n  * Meta Sciences  \n  * Science  \n  * Society  \n  * Synthetic Intelligence  \n  * Transportation  \n  * Weaponry",
    "notes": "[Rule] 211\n[Prerequisite] Intellect 3, Technology (Knowledge) 11",
    "notesList": [
      "[Rule] 211",
      "[Prerequisite] Intellect 3, Technology (Knowledge) 11"
    ]
  },
  {
    "id": "special-telepathy",
    "name": "Telepathy",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awakened (Mental) or Species Trait",
    "modifiers": [],
    "description": "The character can communicate mind-to-mind.",
    "mechanic": "You can communicate mentally with any intelligent lifeform within **Range** (usually 100ft \\+).",
    "rules": "212",
    "special_rules": "212",
    "body": "# Telepathy\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Awakened (Mental) or Species Trait\n\n## Description\nThe character can communicate mind-to-mind.\n\n## Mechanics & Benefit\nYou can communicate mentally with any intelligent lifeform within **Range** (usually 100ft \\+).\n\n## Special Rules\n212",
    "mechanics": "You can communicate mentally with any intelligent lifeform within **Range** (usually 100ft \\+).",
    "notes": "[Rule] 212\n[Prerequisite] Awakened (Mental) or Species Trait",
    "notesList": [
      "[Rule] 212",
      "[Prerequisite] Awakened (Mental) or Species Trait"
    ]
  },
  {
    "id": "special-uncanny-sense",
    "name": "Uncanny Sense",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Acute Sense",
    "modifiers": [],
    "description": "Uncanny Sense is a Special Feature: Roll Awareness Checks with chosen sense at Advantage.",
    "mechanic": "Roll Awareness Checks with chosen sense at Advantage.",
    "rules": "179",
    "special_rules": "179",
    "body": "# Uncanny Sense\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Acute Sense\n\n## Description\nUncanny Sense is a Special Feature: Roll Awareness Checks with chosen sense at Advantage.\n\n## Mechanics & Benefit\nRoll Awareness Checks with chosen sense at Advantage.\n\n## Special Rules\n179",
    "mechanics": "Roll Awareness Checks with chosen sense at Advantage.",
    "notes": "[Rule] 179\n[Prerequisite] Acute Sense",
    "notesList": [
      "[Rule] 179",
      "[Prerequisite] Acute Sense"
    ]
  },
  {
    "id": "special-wild-speech",
    "name": "Wild Speech",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "costs": {
      "bp": 3,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Nature Affinity, Fey, or Druidic training",
    "modifiers": [],
    "description": "The character can speak with the beasts of the wild.",
    "mechanic": "You can communicate with animals (Beast type) as if you shared a language. You can use **Social Skills** (Diplomacy, Bluff, Intimidate) on animals with no penalty.",
    "rules": "213",
    "special_rules": "213",
    "body": "# Wild Speech\n\n**Category**: Special Features  \n**Cost**: 3 BP (2 BP if Suggested Feature, minimum 1 BP)  \n**Prerequisite**: Nature Affinity, Fey, or Druidic training\n\n## Description\nThe character can speak with the beasts of the wild.\n\n## Mechanics & Benefit\nYou can communicate with animals (Beast type) as if you shared a language. You can use **Social Skills** (Diplomacy, Bluff, Intimidate) on animals with no penalty.\n\n## Special Rules\n213",
    "mechanics": "You can communicate with animals (Beast type) as if you shared a language. You can use **Social Skills** (Diplomacy, Bluff, Intimidate) on animals with no penalty.",
    "notes": "[Rule] 213\n[Prerequisite] Nature Affinity, Fey, or Druidic training",
    "notesList": [
      "[Rule] 213",
      "[Prerequisite] Nature Affinity, Fey, or Druidic training"
    ]
  }
];

export const getFeatureById = (id) => DEFAULT_FEATURES.find(f => f.id === id);

export const getFeaturesByCategory = (category) => 
  DEFAULT_FEATURES.filter(f => (f.category || '').toLowerCase() === (category || '').toLowerCase());
