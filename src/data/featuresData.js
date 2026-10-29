/**
 * Canonical Features Database for Tangent SF RP
 * Auto-generated from src/data/omnicortex/features/
 * Total Features: 241
 */

export const FEATURE_CATEGORIES = [
  "Ability",
  "Combat",
  "Discipline",
  "General",
  "Karma",
  "Skill",
  "Special"
];

export const DEFAULT_FEATURES = [
  {
    "id": "ability-environmental-adaptation",
    "name": "Environmental Adaptation",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character's physiology adapts rapidly to hostile ecological extremes, including vacuum exposure, thermal shifts, and high radiation.",
    "mechanic": "The character suffers no penalties or exhaustion from extreme planetary temperatures (intense desert heat up to 60°C or sub-zero arctic cold down to -40°C) without special gear. When exposed to explosive decompression, thin atmospheres, or hard vacuum, they can sustain life without permanent lung damage or unconsciousness for up to 5 rounds (1 minute) by entering a controlled metabolic stasis.",
    "rules": "",
    "special_rules": "",
    "body": "# Environmental Adaptation\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nWhether evolved in brutal frontier climates, engineered through genetic optimization, or tempered by void exploration, the character easily survives hazardous atmospheric, thermal, and barometric conditions.\n\n## Mechanics & Benefit\nThe character suffers no penalties or exhaustion from extreme planetary temperatures (intense desert heat up to 60°C or sub-zero arctic cold down to -40°C) without special gear. When exposed to explosive decompression, thin atmospheres, or hard vacuum, they can sustain life without permanent lung damage or unconsciousness for up to 5 rounds (1 minute) by entering a controlled metabolic stasis.",
    "full_text": "# Environmental Adaptation\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nWhether evolved in brutal frontier climates, engineered through genetic optimization, or tempered by void exploration, the character easily survives hazardous atmospheric, thermal, and barometric conditions.\n\n## Mechanics & Benefit\nThe character suffers no penalties or exhaustion from extreme planetary temperatures (intense desert heat up to 60°C or sub-zero arctic cold down to -40°C) without special gear. When exposed to explosive decompression, thin atmospheres, or hard vacuum, they can sustain life without permanent lung damage or unconsciousness for up to 5 rounds (1 minute) by entering a controlled metabolic stasis.",
    "mechanics": "The character suffers no penalties or exhaustion from extreme planetary temperatures (intense desert heat up to 60°C or sub-zero arctic cold down to -40°C) without special gear. When exposed to explosive decompression, thin atmospheres, or hard vacuum, they can sustain life without permanent lung damage or unconsciousness for up to 5 rounds (1 minute) by entering a controlled metabolic stasis.",
    "notes": "",
    "notesList": []
  },
  {
    "id": "ability-evasiveness",
    "name": "Evasiveness",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Must possess the base Feature for the chosen Save (Lightning Reflexes, Great Fortitude, or Iron Will).",
    "prerequisite_text": "Must possess the base Feature for the chosen Save (Lightning Reflexes, Great Fortitude, or Iron Will).",
    "modifiers": [],
    "description": "The character is adept at avoiding the brunt of area attacks or resisting the full efficacy of potent effects.",
    "mechanic": "When subjected to an effect that allows a **Resistance Check** for **Partial Effect** (commonly taking half damage on a success), a successful check instead results in **No Effect** (or zero damage).  \n  * *Usage:* If a dragon breathes fire (Reflex for half), a character with Evasiveness (Reflex) takes *no damage* if they succeed on the roll.",
    "rules": "This feature acts as a **\\[Multiple\\]** selection. You must purchase it separately for Reflex, Fortitude, or Will.",
    "special_rules": "This feature acts as a **\\[Multiple\\]** selection. You must purchase it separately for Reflex, Fortitude, or Will.",
    "body": "# Evasiveness\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Must possess the base Feature for the chosen Save (Lightning Reflexes, Great Fortitude, or Iron Will).\n\n## Description\nThe character is adept at avoiding the brunt of area attacks or resisting the full efficacy of potent effects.\n\n## Mechanics & Benefit\nWhen subjected to an effect that allows a **Resistance Check** for **Partial Effect** (commonly taking half damage on a success), a successful check instead results in **No Effect** (or zero damage).  \n  * *Usage:* If a dragon breathes fire (Reflex for half), a character with Evasiveness (Reflex) takes *no damage* if they succeed on the roll.\n\n## Special Rules\nThis feature acts as a **\\[Multiple\\]** selection. You must purchase it separately for Reflex, Fortitude, or Will.",
    "full_text": "# Evasiveness\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Must possess the base Feature for the chosen Save (Lightning Reflexes, Great Fortitude, or Iron Will).\n\n## Description\nThe character is adept at avoiding the brunt of area attacks or resisting the full efficacy of potent effects.\n\n## Mechanics & Benefit\nWhen subjected to an effect that allows a **Resistance Check** for **Partial Effect** (commonly taking half damage on a success), a successful check instead results in **No Effect** (or zero damage).  \n  * *Usage:* If a dragon breathes fire (Reflex for half), a character with Evasiveness (Reflex) takes *no damage* if they succeed on the roll.\n\n## Special Rules\nThis feature acts as a **\\[Multiple\\]** selection. You must purchase it separately for Reflex, Fortitude, or Will.",
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
    "bp": 3,
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
    "prerequisites": "Stamina 1",
    "prerequisite_text": "Stamina 1",
    "modifiers": [
      {
        "target": "Fortitude",
        "type": "save",
        "value": 2,
        "mode": "inherent",
        "description": "+2 on Fortitude Checks"
      }
    ],
    "description": "Through vigorous conditioning or natural hardiness, the character has developed a profound resistance to physical ailments. Their body fights off toxins and trauma with exceptional efficiency.",
    "mechanic": "Gain a **\\+2 bonus** on all **Fortitude Checks**.  \n  * *Usage:* This applies to resisting poisons, diseases, radiation, physical fatigue, and metabolic hazards.",
    "rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Stamina score. The bonuses stack (e.g., Rank 2 grants a \\+4 total bonus).",
    "special_rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Stamina score. The bonuses stack (e.g., Rank 2 grants a \\+4 total bonus).",
    "body": "# Great Fortitude\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThrough vigorous conditioning or natural hardiness, the character has developed a profound resistance to physical ailments. Their body fights off toxins and trauma with exceptional efficiency.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Fortitude Checks**.  \n  * *Usage:* This applies to resisting poisons, diseases, radiation, physical fatigue, and metabolic hazards.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Stamina score. The bonuses stack (e.g., Rank 2 grants a \\+4 total bonus).",
    "full_text": "# Great Fortitude\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThrough vigorous conditioning or natural hardiness, the character has developed a profound resistance to physical ailments. Their body fights off toxins and trauma with exceptional efficiency.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Fortitude Checks**.  \n  * *Usage:* This applies to resisting poisons, diseases, radiation, physical fatigue, and metabolic hazards.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Stamina score. The bonuses stack (e.g., Rank 2 grants a \\+4 total bonus).",
    "mechanics": "Gain a **\\+2 bonus** on all **Fortitude Checks**.  \n  * *Usage:* This applies to resisting poisons, diseases, radiation, physical fatigue, and metabolic hazards.",
    "notes": "[Modifier] +2 on Fortitude Checks\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...\n[Prerequisite] Stamina 1",
    "notesList": [
      "[Modifier] +2 on Fortitude Checks",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Evasiveness (in the specific Save type).",
    "prerequisite_text": "Evasiveness (in the specific Save type).",
    "modifiers": [],
    "description": "Even when the character fails to avoid a danger entirely, their resilience or speed ensures they never take the full brunt of the impact.",
    "mechanic": "When subjected to an effect that allows a Resistance Check for Partial Effect, a **Failed Check** results in only the **Partial Effect** (half damage/effect), rather than the full effect.  \n  * *Usage:* Combined with Evasiveness, this means the character takes *no damage* on a successful save, and only *half damage* on a failed save.",
    "rules": "Prerequisite: Evasiveness (in the specific Save type)..",
    "special_rules": "Prerequisite: Evasiveness (in the specific Save type)..",
    "body": "# Improved Evasiveness\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Evasiveness (in the specific Save type).\n\n## Description\nEven when the character fails to avoid a danger entirely, their resilience or speed ensures they never take the full brunt of the impact.\n\n## Mechanics & Benefit\nWhen subjected to an effect that allows a Resistance Check for Partial Effect, a **Failed Check** results in only the **Partial Effect** (half damage/effect), rather than the full effect.  \n  * *Usage:* Combined with Evasiveness, this means the character takes *no damage* on a successful save, and only *half damage* on a failed save.",
    "full_text": "# Improved Evasiveness\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Evasiveness (in the specific Save type).\n\n## Description\nEven when the character fails to avoid a danger entirely, their resilience or speed ensures they never take the full brunt of the impact.\n\n## Mechanics & Benefit\nWhen subjected to an effect that allows a Resistance Check for Partial Effect, a **Failed Check** results in only the **Partial Effect** (half damage/effect), rather than the full effect.  \n  * *Usage:* Combined with Evasiveness, this means the character takes *no damage* on a successful save, and only *half damage* on a failed save.",
    "mechanics": "When subjected to an effect that allows a Resistance Check for Partial Effect, a **Failed Check** results in only the **Partial Effect** (half damage/effect), rather than the full effect.  \n  * *Usage:* Combined with Evasiveness, this means the character takes *no damage* on a successful save, and only *half damage* on a failed save.",
    "notes": "[Rule] Prerequisite: Evasiveness (in the specific Save type)..\n[Prerequisite] Evasiveness (in the specific Save type).",
    "notesList": [
      "[Rule] Prerequisite: Evasiveness (in the specific Save type)..",
      "[Prerequisite] Evasiveness (in the specific Save type)."
    ]
  },
  {
    "id": "ability-improved-tolerance",
    "name": "Improved Tolerance",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Tolerance (in the specific type).",
    "prerequisite_text": "Tolerance (in the specific type).",
    "modifiers": [],
    "description": "The character's recovery rate is supernatural. They can shake off debilitating effects in a fraction of the time it takes others.",
    "mechanic": "The time interval between periodic Resistance Checks to end an ongoing effect is reduced to **1/4 the typical time**.  \n  * *Usage:* A paralysis effect that allows a save once per round might allow this character to save at the start *and* end of their turn (GM discretion on granular timing), or simply recover four times faster from long-term ailments.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "rules": "Prerequisite: Tolerance (in the specific type)..",
    "special_rules": "Prerequisite: Tolerance (in the specific type)..",
    "body": "# Improved Tolerance\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Tolerance (in the specific type).\n\n## Description\nThe character's recovery rate is supernatural. They can shake off debilitating effects in a fraction of the time it takes others.\n\n## Mechanics & Benefit\nThe time interval between periodic Resistance Checks to end an ongoing effect is reduced to **1/4 the typical time**.  \n  * *Usage:* A paralysis effect that allows a save once per round might allow this character to save at the start *and* end of their turn (GM discretion on granular timing), or simply recover four times faster from long-term ailments.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "full_text": "# Improved Tolerance\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Tolerance (in the specific type).\n\n## Description\nThe character's recovery rate is supernatural. They can shake off debilitating effects in a fraction of the time it takes others.\n\n## Mechanics & Benefit\nThe time interval between periodic Resistance Checks to end an ongoing effect is reduced to **1/4 the typical time**.  \n  * *Usage:* A paralysis effect that allows a save once per round might allow this character to save at the start *and* end of their turn (GM discretion on granular timing), or simply recover four times faster from long-term ailments.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "mechanics": "The time interval between periodic Resistance Checks to end an ongoing effect is reduced to **1/4 the typical time**.  \n  * *Usage:* A paralysis effect that allows a save once per round might allow this character to save at the start *and* end of their turn (GM discretion on granular timing), or simply recover four times faster from long-term ailments.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "notes": "[Rule] Prerequisite: Tolerance (in the specific type)..\n[Prerequisite] Tolerance (in the specific type).",
    "notesList": [
      "[Rule] Prerequisite: Tolerance (in the specific type)..",
      "[Prerequisite] Tolerance (in the specific type)."
    ]
  },
  {
    "id": "ability-incredible-fortitude",
    "name": "Incredible Fortitude",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Great Fortitude, Stamina 2",
    "prerequisite_text": "Great Fortitude, Stamina 2",
    "modifiers": [
      {
        "target": "Fortitude",
        "type": "save_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Fortitude Checks"
      }
    ],
    "description": "The character's physical resilience is legendary. When subjected to physical stress that would cripple a normal being, they find a reserve of strength to persevere.",
    "mechanic": "You may roll all **Fortitude Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Fortitude save.",
    "rules": "This does not replace the bonus from Great Fortitude; you add the bonus to the highest die result.",
    "special_rules": "This does not replace the bonus from Great Fortitude; you add the bonus to the highest die result.",
    "body": "# Incredible Fortitude\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Great Fortitude, Stamina 2\n\n## Description\nThe character's physical resilience is legendary. When subjected to physical stress that would cripple a normal being, they find a reserve of strength to persevere.\n\n## Mechanics & Benefit\nYou may roll all **Fortitude Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Fortitude save.\n\n## Special Rules\nThis does not replace the bonus from Great Fortitude; you add the bonus to the highest die result.",
    "full_text": "# Incredible Fortitude\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Great Fortitude, Stamina 2\n\n## Description\nThe character's physical resilience is legendary. When subjected to physical stress that would cripple a normal being, they find a reserve of strength to persevere.\n\n## Mechanics & Benefit\nYou may roll all **Fortitude Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Fortitude save.\n\n## Special Rules\nThis does not replace the bonus from Great Fortitude; you add the bonus to the highest die result.",
    "mechanics": "You may roll all **Fortitude Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Fortitude save.",
    "notes": "[Modifier] Advantage on Fortitude Checks\n[Rule] This does not replace the bonus from Great Fortitude; you add the bonus to the highest die result.\n[Prerequisite] Great Fortitude, Stamina 2",
    "notesList": [
      "[Modifier] Advantage on Fortitude Checks",
      "[Rule] This does not replace the bonus from Great Fortitude; you add the bonus to the highest die result.",
      "[Prerequisite] Great Fortitude, Stamina 2"
    ]
  },
  {
    "id": "ability-indomitable-will",
    "name": "Indomitable Will",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Iron Will, Wisdom 2",
    "prerequisite_text": "Iron Will, Wisdom 2",
    "modifiers": [
      {
        "target": "Will",
        "type": "save_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Will Checks"
      }
    ],
    "description": "The character's mind is an immovable object. Attempts to control or break their spirit are met with absolute defiance.",
    "mechanic": "You may roll all **Will Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Will save.",
    "rules": "Prerequisite: Iron Will, Wisdom 2.",
    "special_rules": "Prerequisite: Iron Will, Wisdom 2.",
    "body": "# Indomitable Will\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Iron Will, Wisdom 2\n\n## Description\nThe character's mind is an immovable object. Attempts to control or break their spirit are met with absolute defiance.\n\n## Mechanics & Benefit\nYou may roll all **Will Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Will save.",
    "full_text": "# Indomitable Will\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Iron Will, Wisdom 2\n\n## Description\nThe character's mind is an immovable object. Attempts to control or break their spirit are met with absolute defiance.\n\n## Mechanics & Benefit\nYou may roll all **Will Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Will save.",
    "mechanics": "You may roll all **Will Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Will save.",
    "notes": "[Modifier] Advantage on Will Checks\n[Rule] Prerequisite: Iron Will, Wisdom 2.\n[Prerequisite] Iron Will, Wisdom 2",
    "notesList": [
      "[Modifier] Advantage on Will Checks",
      "[Rule] Prerequisite: Iron Will, Wisdom 2.",
      "[Prerequisite] Iron Will, Wisdom 2"
    ]
  },
  {
    "id": "ability-insightful-reason",
    "name": "Insightful Reason",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "bp": 3,
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
    "prerequisites": "Intellect 1",
    "prerequisite_text": "Intellect 1",
    "modifiers": [
      {
        "target": "Logic",
        "type": "save",
        "value": 2,
        "mode": "inherent",
        "description": "+2 on Logic Checks"
      }
    ],
    "description": "The character has a sharp, analytical mind capable of making rapid deductions and seeing through complex deceptions or puzzles.",
    "mechanic": "Gain a **\\+2 bonus** on all **Logic Checks**.  \n  * *Usage:* This applies to solving puzzles, cryptanalysis, deduction, resisting illusions (disbelieving), and navigating complex bureaucratic or logical labyrinths.",
    "rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Intellect score.",
    "special_rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Intellect score.",
    "body": "# Insightful Reason\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 1\n\n## Description\nThe character has a sharp, analytical mind capable of making rapid deductions and seeing through complex deceptions or puzzles.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Logic Checks**.  \n  * *Usage:* This applies to solving puzzles, cryptanalysis, deduction, resisting illusions (disbelieving), and navigating complex bureaucratic or logical labyrinths.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Intellect score.",
    "full_text": "# Insightful Reason\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 1\n\n## Description\nThe character has a sharp, analytical mind capable of making rapid deductions and seeing through complex deceptions or puzzles.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Logic Checks**.  \n  * *Usage:* This applies to solving puzzles, cryptanalysis, deduction, resisting illusions (disbelieving), and navigating complex bureaucratic or logical labyrinths.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Intellect score.",
    "mechanics": "Gain a **\\+2 bonus** on all **Logic Checks**.  \n  * *Usage:* This applies to solving puzzles, cryptanalysis, deduction, resisting illusions (disbelieving), and navigating complex bureaucratic or logical labyrinths.",
    "notes": "[Modifier] +2 on Logic Checks\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...\n[Prerequisite] Intellect 1",
    "notesList": [
      "[Modifier] +2 on Logic Checks",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Insightful Reason, Intellect 2",
    "prerequisite_text": "Insightful Reason, Intellect 2",
    "modifiers": [
      {
        "target": "Logic",
        "type": "check_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Logic Checks"
      }
    ],
    "description": "The character experiences flashes of brilliance and intuitive leaps of logic that allow them to solve the unsolvable.",
    "mechanic": "You may roll all **Logic Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when performing tasks requiring deduction or complex reasoning.",
    "rules": "Prerequisite: Insightful Reason, Intellect 2.",
    "special_rules": "Prerequisite: Insightful Reason, Intellect 2.",
    "body": "# Inspired Reason\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Insightful Reason, Intellect 2\n\n## Description\nThe character experiences flashes of brilliance and intuitive leaps of logic that allow them to solve the unsolvable.\n\n## Mechanics & Benefit\nYou may roll all **Logic Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when performing tasks requiring deduction or complex reasoning.",
    "full_text": "# Inspired Reason\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Insightful Reason, Intellect 2\n\n## Description\nThe character experiences flashes of brilliance and intuitive leaps of logic that allow them to solve the unsolvable.\n\n## Mechanics & Benefit\nYou may roll all **Logic Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when performing tasks requiring deduction or complex reasoning.",
    "mechanics": "You may roll all **Logic Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when performing tasks requiring deduction or complex reasoning.",
    "notes": "[Modifier] Advantage on Logic Checks\n[Rule] Prerequisite: Insightful Reason, Intellect 2.\n[Prerequisite] Insightful Reason, Intellect 2",
    "notesList": [
      "[Modifier] Advantage on Logic Checks",
      "[Rule] Prerequisite: Insightful Reason, Intellect 2.",
      "[Prerequisite] Insightful Reason, Intellect 2"
    ]
  },
  {
    "id": "ability-inspiring-personality",
    "name": "Inspiring Personality",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "bp": 3,
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
    "prerequisite_text": "Charisma 1",
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
    "body": "# Inspiring Personality\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character possesses a magnetic presence or an innate understanding of social dynamics. They navigate social hierarchies and interactions with practiced ease.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Etiquette Checks**.  \n  * *Usage:* This applies to making first impressions, avoiding social faux pas, navigating formal gatherings, and interacting with high-status NPCs without causing offense.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Charisma score.",
    "full_text": "# Inspiring Personality\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character possesses a magnetic presence or an innate understanding of social dynamics. They navigate social hierarchies and interactions with practiced ease.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Etiquette Checks**.  \n  * *Usage:* This applies to making first impressions, avoiding social faux pas, navigating formal gatherings, and interacting with high-status NPCs without causing offense.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Charisma score.",
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
    "bp": 3,
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
    "prerequisites": "Wisdom 1",
    "prerequisite_text": "Wisdom 1",
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
    "body": "# Iron Will\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character possesses a mind like a fortress. They are stubborn, focused, and resistant to fear, manipulation, or psychological trauma.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Will Checks**.  \n  * *Usage:* This applies to resisting Fear effects, Mind Control, Charm, Domination, and psychological torture or intimidation.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Wisdom score.",
    "full_text": "# Iron Will\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character possesses a mind like a fortress. They are stubborn, focused, and resistant to fear, manipulation, or psychological trauma.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Will Checks**.  \n  * *Usage:* This applies to resisting Fear effects, Mind Control, Charm, Domination, and psychological torture or intimidation.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Wisdom score.",
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
    "bp": 3,
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
    "prerequisites": "Agility 1",
    "prerequisite_text": "Agility 1",
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
    "body": "# Lightning Reflexes\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character reacts to danger before they are consciously aware of it. Their nerves are wire-taut, allowing them to dodge blasts, catch falling objects, or keep their footing on shifting ground.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Reflex Checks**.  \n  * *Usage:* This applies to dodging Area of Effect (AoE) attacks (explosions, breath weapons), maintaining balance, and avoiding sudden traps.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Agility score.",
    "full_text": "# Lightning Reflexes\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character reacts to danger before they are consciously aware of it. Their nerves are wire-taut, allowing them to dodge blasts, catch falling objects, or keep their footing on shifting ground.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Reflex Checks**.  \n  * *Usage:* This applies to dodging Area of Effect (AoE) attacks (explosions, breath weapons), maintaining balance, and avoiding sudden traps.\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Agility score.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Potent Might, Strength 2",
    "prerequisite_text": "Potent Might, Strength 2",
    "modifiers": [
      {
        "target": "Might",
        "type": "check_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Might Checks"
      }
    ],
    "description": "In moments of intense physical exertion, the character can summon a surge of adrenaline to perform feats of herculean power.",
    "mechanic": "You may roll all **Might Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when testing Strength against an obstacle or opponent.",
    "rules": "Prerequisite: Potent Might, Strength 2.",
    "special_rules": "Prerequisite: Potent Might, Strength 2.",
    "body": "# Mighty Surge\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Potent Might, Strength 2\n\n## Description\nIn moments of intense physical exertion, the character can summon a surge of adrenaline to perform feats of herculean power.\n\n## Mechanics & Benefit\nYou may roll all **Might Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when testing Strength against an obstacle or opponent.",
    "full_text": "# Mighty Surge\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Potent Might, Strength 2\n\n## Description\nIn moments of intense physical exertion, the character can summon a surge of adrenaline to perform feats of herculean power.\n\n## Mechanics & Benefit\nYou may roll all **Might Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when testing Strength against an obstacle or opponent.",
    "mechanics": "You may roll all **Might Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when testing Strength against an obstacle or opponent.",
    "notes": "[Modifier] Advantage on Might Checks\n[Rule] Prerequisite: Potent Might, Strength 2.\n[Prerequisite] Potent Might, Strength 2",
    "notesList": [
      "[Modifier] Advantage on Might Checks",
      "[Rule] Prerequisite: Potent Might, Strength 2.",
      "[Prerequisite] Potent Might, Strength 2"
    ]
  },
  {
    "id": "ability-motivating-persona",
    "name": "Motivating Persona",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Inspiring Personality, Charisma 2",
    "prerequisite_text": "Inspiring Personality, Charisma 2",
    "modifiers": [
      {
        "target": "Etiquette",
        "type": "check_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Etiquette Checks"
      }
    ],
    "description": "The character's presence is commanding and uplifting. When they speak, others listen, and their social grace is capable of turning hostile negotiations into alliances.",
    "mechanic": "You may roll all **Etiquette Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) during social maneuvering and protocol checks.",
    "rules": "Prerequisite: Inspiring Personality, Charisma 2.",
    "special_rules": "Prerequisite: Inspiring Personality, Charisma 2.",
    "body": "# Motivating Persona\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Inspiring Personality, Charisma 2\n\n## Description\nThe character's presence is commanding and uplifting. When they speak, others listen, and their social grace is capable of turning hostile negotiations into alliances.\n\n## Mechanics & Benefit\nYou may roll all **Etiquette Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) during social maneuvering and protocol checks.",
    "full_text": "# Motivating Persona\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Inspiring Personality, Charisma 2\n\n## Description\nThe character's presence is commanding and uplifting. When they speak, others listen, and their social grace is capable of turning hostile negotiations into alliances.\n\n## Mechanics & Benefit\nYou may roll all **Etiquette Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) during social maneuvering and protocol checks.",
    "mechanics": "You may roll all **Etiquette Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) during social maneuvering and protocol checks.",
    "notes": "[Modifier] Advantage on Etiquette Checks\n[Rule] Prerequisite: Inspiring Personality, Charisma 2.\n[Prerequisite] Inspiring Personality, Charisma 2",
    "notesList": [
      "[Modifier] Advantage on Etiquette Checks",
      "[Rule] Prerequisite: Inspiring Personality, Charisma 2.",
      "[Prerequisite] Inspiring Personality, Charisma 2"
    ]
  },
  {
    "id": "ability-potent-might",
    "name": "Potent Might",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "bp": 3,
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
    "prerequisites": "Strength 1",
    "prerequisite_text": "Strength 1",
    "modifiers": [
      {
        "target": "Might",
        "type": "save",
        "value": 2,
        "mode": "inherent",
        "description": "+2 on Might Checks"
      }
    ],
    "description": "The character knows how to apply their strength for maximum leverage and impact. Whether forcing open a blast door or holding back a crushing weight, they are far more effective than their muscle mass alone suggests.",
    "mechanic": "Gain a **\\+2 bonus** on all **Might Checks**.  \n  * *Usage:* This applies to breaking objects, lifting heavy loads, forcing doors, and resisting physical containment (such as grappling or webs). *Note: This does not apply to Attack or Damage rolls.*",
    "rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Strength score.",
    "special_rules": "This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Strength score.",
    "body": "# Potent Might\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 1\n\n## Description\nThe character knows how to apply their strength for maximum leverage and impact. Whether forcing open a blast door or holding back a crushing weight, they are far more effective than their muscle mass alone suggests.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Might Checks**.  \n  * *Usage:* This applies to breaking objects, lifting heavy loads, forcing doors, and resisting physical containment (such as grappling or webs). *Note: This does not apply to Attack or Damage rolls.*\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Strength score.",
    "full_text": "# Potent Might\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 1\n\n## Description\nThe character knows how to apply their strength for maximum leverage and impact. Whether forcing open a blast door or holding back a crushing weight, they are far more effective than their muscle mass alone suggests.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** on all **Might Checks**.  \n  * *Usage:* This applies to breaking objects, lifting heavy loads, forcing doors, and resisting physical containment (such as grappling or webs). *Note: This does not apply to Attack or Damage rolls.*\n\n## Special Rules\nThis feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the character's Strength score.",
    "mechanics": "Gain a **\\+2 bonus** on all **Might Checks**.  \n  * *Usage:* This applies to breaking objects, lifting heavy loads, forcing doors, and resisting physical containment (such as grappling or webs). *Note: This does not apply to Attack or Damage rolls.*",
    "notes": "[Modifier] +2 on Might Checks\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **Ranked**. It may be purchased multiple times, up to a maximum rank equal to the ch...\n[Prerequisite] Strength 1",
    "notesList": [
      "[Modifier] +2 on Might Checks",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Lightning Reflexes, Agility 2",
    "prerequisite_text": "Lightning Reflexes, Agility 2",
    "modifiers": [
      {
        "target": "Reflex",
        "type": "save_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Reflex Checks"
      }
    ],
    "description": "The character moves with a fluid, almost precognitive grace. They can weave through a hail of fire or debris with effortless speed.",
    "mechanic": "You may roll all **Reflex Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Reflex save.",
    "rules": "Prerequisite: Lightning Reflexes, Agility 2.",
    "special_rules": "Prerequisite: Lightning Reflexes, Agility 2.",
    "body": "# Superb Reflexes\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Lightning Reflexes, Agility 2\n\n## Description\nThe character moves with a fluid, almost precognitive grace. They can weave through a hail of fire or debris with effortless speed.\n\n## Mechanics & Benefit\nYou may roll all **Reflex Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Reflex save.",
    "full_text": "# Superb Reflexes\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Lightning Reflexes, Agility 2\n\n## Description\nThe character moves with a fluid, almost precognitive grace. They can weave through a hail of fire or debris with effortless speed.\n\n## Mechanics & Benefit\nYou may roll all **Reflex Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Reflex save.",
    "mechanics": "You may roll all **Reflex Checks** with **Advantage**.  \n  * *Usage:* Roll 2d10 with Advantage (roll twice and keep the highest result) when making a Reflex save.",
    "notes": "[Modifier] Advantage on Reflex Checks\n[Rule] Prerequisite: Lightning Reflexes, Agility 2.\n[Prerequisite] Lightning Reflexes, Agility 2",
    "notesList": [
      "[Modifier] Advantage on Reflex Checks",
      "[Rule] Prerequisite: Lightning Reflexes, Agility 2.",
      "[Prerequisite] Lightning Reflexes, Agility 2"
    ]
  },
  {
    "id": "ability-tolerance",
    "name": "Tolerance",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Stamina 1 (for Physical) or Wisdom 1 (for Mental).",
    "prerequisite_text": "Stamina 1 (for Physical) or Wisdom 1 (for Mental).",
    "modifiers": [],
    "description": "The character's metabolism or psyche processes ongoing trauma much faster than the average being.",
    "mechanic": "When suffering from an ongoing effect (such as poison, disease, paralysis, or mental domination) that allows periodic Resistance Checks to end the effect (e.g., \"save every minute\"), the time interval between checks is reduced to **1/2 the typical time**.  \n  * *Usage:* A poison that normally allows a save once per hour allows this character to save every 30 minutes.",
    "rules": "This feature acts as a **\\[Multiple\\]** selection. You must choose Physical Tolerance (Fortitude) or Mental Tolerance (Will).",
    "special_rules": "This feature acts as a **\\[Multiple\\]** selection. You must choose Physical Tolerance (Fortitude) or Mental Tolerance (Will).",
    "body": "# Tolerance\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1 (for Physical) or Wisdom 1 (for Mental).\n\n## Description\nThe character's metabolism or psyche processes ongoing trauma much faster than the average being.\n\n## Mechanics & Benefit\nWhen suffering from an ongoing effect (such as poison, disease, paralysis, or mental domination) that allows periodic Resistance Checks to end the effect (e.g., \"save every minute\"), the time interval between checks is reduced to **1/2 the typical time**.  \n  * *Usage:* A poison that normally allows a save once per hour allows this character to save every 30 minutes.\n\n## Special Rules\nThis feature acts as a **\\[Multiple\\]** selection. You must choose Physical Tolerance (Fortitude) or Mental Tolerance (Will).",
    "full_text": "# Tolerance\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1 (for Physical) or Wisdom 1 (for Mental).\n\n## Description\nThe character's metabolism or psyche processes ongoing trauma much faster than the average being.\n\n## Mechanics & Benefit\nWhen suffering from an ongoing effect (such as poison, disease, paralysis, or mental domination) that allows periodic Resistance Checks to end the effect (e.g., \"save every minute\"), the time interval between checks is reduced to **1/2 the typical time**.  \n  * *Usage:* A poison that normally allows a save once per hour allows this character to save every 30 minutes.\n\n## Special Rules\nThis feature acts as a **\\[Multiple\\]** selection. You must choose Physical Tolerance (Fortitude) or Mental Tolerance (Will).",
    "mechanics": "When suffering from an ongoing effect (such as poison, disease, paralysis, or mental domination) that allows periodic Resistance Checks to end the effect (e.g., \"save every minute\"), the time interval between checks is reduced to **1/2 the typical time**.  \n  * *Usage:* A poison that normally allows a save once per hour allows this character to save every 30 minutes.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature acts as a **\\[Multiple\\]** selection. You must choose Physical Tolerance (Fortitude) or...\n[Prerequisite] Stamina 1 (for Physical) or Wisdom 1 (for Mental).",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature acts as a **\\[Multiple\\]** selection. You must choose Physical Tolerance (Fortitude) or...",
      "[Prerequisite] Stamina 1 (for Physical) or Wisdom 1 (for Mental)."
    ]
  },
  {
    "id": "ability-toxic-resistance",
    "name": "Toxic Resistance",
    "category": "Ability",
    "type": "ability",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "Fortitude",
        "type": "save",
        "value": 3,
        "mode": "inherent",
        "description": "+3 on Fortitude Checks"
      }
    ],
    "description": "The character's physiology metabolizes or neutralizes poisons, venoms, neurotoxins, and biochemical agents with superior efficiency.",
    "mechanic": "The character receives a **+3 bonus on Fortitude saving throws** against all ingested, inhaled, contact, or injury-delivered toxins, poisons, and biochemical radiation. Additionally, successful saves against damaging poisons eliminate all secondary effects, and failed saves deal half the normal initial damage.",
    "rules": "",
    "special_rules": "",
    "body": "# Toxic Resistance\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses an aggressively robust lymphatic and metabolic filter system, enabling them to resist corrosive gases, virulent toxins, and predatory venoms.\n\n## Mechanics & Benefit\nThe character receives a **+3 bonus on Fortitude saving throws** against all ingested, inhaled, contact, or injury-delivered toxins, poisons, and biochemical radiation. Additionally, successful saves against damaging poisons eliminate all secondary effects, and failed saves deal half the normal initial damage.",
    "full_text": "# Toxic Resistance\n\n**Category**: Ability Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses an aggressively robust lymphatic and metabolic filter system, enabling them to resist corrosive gases, virulent toxins, and predatory venoms.\n\n## Mechanics & Benefit\nThe character receives a **+3 bonus on Fortitude saving throws** against all ingested, inhaled, contact, or injury-delivered toxins, poisons, and biochemical radiation. Additionally, successful saves against damaging poisons eliminate all secondary effects, and failed saves deal half the normal initial damage.",
    "mechanics": "The character receives a **+3 bonus on Fortitude saving throws** against all ingested, inhaled, contact, or injury-delivered toxins, poisons, and biochemical radiation. Additionally, successful saves against damaging poisons eliminate all secondary effects, and failed saves deal half the normal initial damage.",
    "notes": "[Modifier] +3 on Fortitude Checks",
    "notesList": [
      "[Modifier] +3 on Fortitude Checks"
    ]
  },
  {
    "id": "combat-agile-wrestling",
    "name": "Agile Wrestling",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1, Unarmed Combat 1",
    "prerequisite_text": "Agility 1, Unarmed Combat 1",
    "modifiers": [],
    "description": "The character utilizes leverage, flexibility, and technique rather than brute force to control opponents in close quarters.",
    "mechanic": "You may use your **Agility** modifier instead of your Strength modifier when making Grapple Checks (both to initiate and maintain a grapple).",
    "rules": "This applies to the grapple check only; damage dealt while grappling is still calculated using Strength unless another feature modifies it.",
    "special_rules": "This applies to the grapple check only; damage dealt while grappling is still calculated using Strength unless another feature modifies it.",
    "body": "# Agile Wrestling\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1, Unarmed Combat 1\n\n## Description\nThe character utilizes leverage, flexibility, and technique rather than brute force to control opponents in close quarters.\n\n## Mechanics & Benefit\nYou may use your **Agility** modifier instead of your Strength modifier when making Grapple Checks (both to initiate and maintain a grapple).\n\n## Special Rules\nThis applies to the grapple check only; damage dealt while grappling is still calculated using Strength unless another feature modifies it.",
    "full_text": "# Agile Wrestling\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1, Unarmed Combat 1\n\n## Description\nThe character utilizes leverage, flexibility, and technique rather than brute force to control opponents in close quarters.\n\n## Mechanics & Benefit\nYou may use your **Agility** modifier instead of your Strength modifier when making Grapple Checks (both to initiate and maintain a grapple).\n\n## Special Rules\nThis applies to the grapple check only; damage dealt while grappling is still calculated using Strength unless another feature modifies it.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 2",
    "prerequisite_text": "Agility 2",
    "modifiers": [],
    "description": "The character is naturally gifted or intensely trained to use both hands with equal proficiency.",
    "mechanic": "You suffer no penalties for using your off-hand. This eliminates the standard penalty for using a weapon in the secondary hand.  \n* **Purpose:** Essential for characters wishing to dual-wield effectively without suffering severe accuracy penalties.",
    "rules": "Prerequisite: Agility 2.",
    "special_rules": "Prerequisite: Agility 2.",
    "body": "# Ambidextrous\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2\n\n## Description\nThe character is naturally gifted or intensely trained to use both hands with equal proficiency.\n\n## Mechanics & Benefit\nYou suffer no penalties for using your off-hand. This eliminates the standard penalty for using a weapon in the secondary hand.  \n* **Purpose:** Essential for characters wishing to dual-wield effectively without suffering severe accuracy penalties.",
    "full_text": "# Ambidextrous\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2\n\n## Description\nThe character is naturally gifted or intensely trained to use both hands with equal proficiency.\n\n## Mechanics & Benefit\nYou suffer no penalties for using your off-hand. This eliminates the standard penalty for using a weapon in the secondary hand.  \n* **Purpose:** Essential for characters wishing to dual-wield effectively without suffering severe accuracy penalties.",
    "mechanics": "You suffer no penalties for using your off-hand. This eliminates the standard penalty for using a weapon in the secondary hand.  \n* **Purpose:** Essential for characters wishing to dual-wield effectively without suffering severe accuracy penalties.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awareness 1",
    "prerequisite_text": "Awareness 1",
    "modifiers": [
      {
        "target": "Strike",
        "type": "check_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Strike Checks"
      }
    ],
    "description": "The character has learned to fight using auditory cues, air pressure, and instinct, allowing them to engage unseen enemies.",
    "mechanic": "When fighting a target that is concealed, invisible, or obscured (darkness/fog), you may roll your Strike check with **Advantage** to counter the miss chance or penalty usually imposed by the concealment.",
    "rules": "You do not lose your Agility bonus to Defense when attacked by an invisible attacker in melee.",
    "special_rules": "You do not lose your Agility bonus to Defense when attacked by an invisible attacker in melee.",
    "body": "# Blind-Fight\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 1\n\n## Description\nThe character has learned to fight using auditory cues, air pressure, and instinct, allowing them to engage unseen enemies.\n\n## Mechanics & Benefit\nWhen fighting a target that is concealed, invisible, or obscured (darkness/fog), you may roll your Strike check with **Advantage** to counter the miss chance or penalty usually imposed by the concealment.\n\n## Special Rules\nYou do not lose your Agility bonus to Defense when attacked by an invisible attacker in melee.",
    "full_text": "# Blind-Fight\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 1\n\n## Description\nThe character has learned to fight using auditory cues, air pressure, and instinct, allowing them to engage unseen enemies.\n\n## Mechanics & Benefit\nWhen fighting a target that is concealed, invisible, or obscured (darkness/fog), you may roll your Strike check with **Advantage** to counter the miss chance or penalty usually imposed by the concealment.\n\n## Special Rules\nYou do not lose your Agility bonus to Defense when attacked by an invisible attacker in melee.",
    "mechanics": "When fighting a target that is concealed, invisible, or obscured (darkness/fog), you may roll your Strike check with **Advantage** to counter the miss chance or penalty usually imposed by the concealment.",
    "notes": "[Modifier] Advantage on Strike Checks\n[Rule] You do not lose your Agility bonus to Defense when attacked by an invisible attacker in melee.\n[Prerequisite] Awareness 1",
    "notesList": [
      "[Modifier] Advantage on Strike Checks",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Strength 2",
    "prerequisite_text": "Strength 2",
    "modifiers": [],
    "description": "The character dominates the space around them, making it impossible for enemies to slip by without engaging.",
    "mechanic": "Enemies cannot move through your threatened area or move past you without engaging in a contest of Strength (Opposed Might Check). If they fail, their movement ends immediately in the square adjacent to you.",
    "rules": "Prerequisite: Strength 2.",
    "special_rules": "Prerequisite: Strength 2.",
    "body": "# Blockade\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 2\n\n## Description\nThe character dominates the space around them, making it impossible for enemies to slip by without engaging.\n\n## Mechanics & Benefit\nEnemies cannot move through your threatened area or move past you without engaging in a contest of Strength (Opposed Might Check). If they fail, their movement ends immediately in the square adjacent to you.",
    "full_text": "# Blockade\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 2\n\n## Description\nThe character dominates the space around them, making it impossible for enemies to slip by without engaging.\n\n## Mechanics & Benefit\nEnemies cannot move through your threatened area or move past you without engaging in a contest of Strength (Opposed Might Check). If they fail, their movement ends immediately in the square adjacent to you.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Ballistic, Energy, or Heavy Weapon Skill Rank 2",
    "prerequisite_text": "Ballistic, Energy, or Heavy Weapon Skill Rank 2",
    "modifiers": [],
    "description": "The character is trained in controlling the recoil and spray of automatic weaponry to maximize accuracy or saturation.",
    "mechanic": "Reduces the penalty for Auto-Fire modes by 2\\.  \n  * **Short Burst:** When firing a Short Burst (3 rounds), you gain **\\+2 Strike** (normally \\+1).  \n  * **Spray:** You reduce the penalty for wide-angle spraying.",
    "rules": "Prerequisite: Ballistic, Energy, or Heavy Weapon Skill Rank 2.",
    "special_rules": "Prerequisite: Ballistic, Energy, or Heavy Weapon Skill Rank 2.",
    "body": "# Burst Attack\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Ballistic, Energy, or Heavy Weapon Skill Rank 2\n\n## Description\nThe character is trained in controlling the recoil and spray of automatic weaponry to maximize accuracy or saturation.\n\n## Mechanics & Benefit\nReduces the penalty for Auto-Fire modes by 2\\.  \n  * **Short Burst:** When firing a Short Burst (3 rounds), you gain **\\+2 Strike** (normally \\+1).  \n  * **Spray:** You reduce the penalty for wide-angle spraying.",
    "full_text": "# Burst Attack\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Ballistic, Energy, or Heavy Weapon Skill Rank 2\n\n## Description\nThe character is trained in controlling the recoil and spray of automatic weaponry to maximize accuracy or saturation.\n\n## Mechanics & Benefit\nReduces the penalty for Auto-Fire modes by 2\\.  \n  * **Short Burst:** When firing a Short Burst (3 rounds), you gain **\\+2 Strike** (normally \\+1).  \n  * **Spray:** You reduce the penalty for wide-angle spraying.",
    "mechanics": "Reduces the penalty for Auto-Fire modes by 2\\.  \n  * **Short Burst:** When firing a Short Burst (3 rounds), you gain **\\+2 Strike** (normally \\+1).  \n  * **Spray:** You reduce the penalty for wide-angle spraying.",
    "notes": "[Rule] Prerequisite: Ballistic, Energy, or Heavy Weapon Skill Rank 2.\n[Prerequisite] Ballistic, Energy, or Heavy Weapon Skill Rank 2",
    "notesList": [
      "[Rule] Prerequisite: Ballistic, Energy, or Heavy Weapon Skill Rank 2.",
      "[Prerequisite] Ballistic, Energy, or Heavy Weapon Skill Rank 2"
    ]
  },
  {
    "id": "combat-channel-smite",
    "name": "Channel Smite",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awakened (Energy), Attune 1",
    "prerequisite_text": "Awakened (Energy), Attune 1",
    "modifiers": [],
    "description": "A technique often used by battle-mages or paladins, channeling raw metaphysical energy through a physical vessel.",
    "mechanic": "As a Standard Action, you may cast a touch-range Invocation (Spell) and deliver it through a melee weapon attack. If the melee attack hits, the target suffers the weapon damage *plus* the effect of the Invocation.",
    "rules": "If the attack misses, the Invocation energy is dissipated and lost.",
    "special_rules": "If the attack misses, the Invocation energy is dissipated and lost.",
    "body": "# Channel Smite\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awakened (Energy), Attune 1\n\n## Description\nA technique often used by battle-mages or paladins, channeling raw metaphysical energy through a physical vessel.\n\n## Mechanics & Benefit\nAs a Standard Action, you may cast a touch-range Invocation (Spell) and deliver it through a melee weapon attack. If the melee attack hits, the target suffers the weapon damage *plus* the effect of the Invocation.\n\n## Special Rules\nIf the attack misses, the Invocation energy is dissipated and lost.",
    "full_text": "# Channel Smite\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awakened (Energy), Attune 1\n\n## Description\nA technique often used by battle-mages or paladins, channeling raw metaphysical energy through a physical vessel.\n\n## Mechanics & Benefit\nAs a Standard Action, you may cast a touch-range Invocation (Spell) and deliver it through a melee weapon attack. If the melee attack hits, the target suffers the weapon damage *plus* the effect of the Invocation.\n\n## Special Rules\nIf the attack misses, the Invocation energy is dissipated and lost.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Attune 1",
    "prerequisite_text": "Attune 1",
    "modifiers": [
      {
        "target": "Concentration",
        "type": "save",
        "value": 4,
        "mode": "inherent",
        "description": "+4 on Concentration Checks"
      },
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 4,
        "mode": "inherent",
        "description": "+4 Defense"
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
    "rules": "Prerequisite: Attune 1.",
    "special_rules": "Prerequisite: Attune 1.",
    "body": "# Combat Casting\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Attune 1\n\n## Description\nThe character is trained to focus on metaphysical weaving even in the chaos of melee.\n\n## Mechanics & Benefit\nYou gain a **\\+4 bonus** to Defense against Attacks of Opportunity caused by casting or using Invocations in a threatened square. You also gain a \\+4 bonus to Concentration checks to maintain powers when taking damage.",
    "full_text": "# Combat Casting\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Attune 1\n\n## Description\nThe character is trained to focus on metaphysical weaving even in the chaos of melee.\n\n## Mechanics & Benefit\nYou gain a **\\+4 bonus** to Defense against Attacks of Opportunity caused by casting or using Invocations in a threatened square. You also gain a \\+4 bonus to Concentration checks to maintain powers when taking damage.",
    "mechanics": "You gain a **\\+4 bonus** to Defense against Attacks of Opportunity caused by casting or using Invocations in a threatened square. You also gain a \\+4 bonus to Concentration checks to maintain powers when taking damage.",
    "notes": "[Modifier] +4 on Concentration Checks\n[Modifier] +4 Defense\n[Modifier] +4 to Concentration\n[Rule] Prerequisite: Attune 1.\n[Prerequisite] Attune 1",
    "notesList": [
      "[Modifier] +4 on Concentration Checks",
      "[Modifier] +4 Defense",
      "[Modifier] +4 to Concentration",
      "[Rule] Prerequisite: Attune 1.",
      "[Prerequisite] Attune 1"
    ]
  },
  {
    "id": "combat-combat-expertise",
    "name": "Combat Expertise",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intellect 2",
    "prerequisite_text": "Intellect 2",
    "modifiers": [],
    "description": "The character fights with superior tactical caution, sacrificing aggression for protection.",
    "mechanic": "When you declare an attack action, you may choose a number up to your Combat Skill Rank. Subtract that number from your **Strike** (Attack) and add it to your **Defense** until the start of your next turn.",
    "rules": "Prerequisite: Intellect 2.",
    "special_rules": "Prerequisite: Intellect 2.",
    "body": "# Combat Expertise\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 2\n\n## Description\nThe character fights with superior tactical caution, sacrificing aggression for protection.\n\n## Mechanics & Benefit\nWhen you declare an attack action, you may choose a number up to your Combat Skill Rank. Subtract that number from your **Strike** (Attack) and add it to your **Defense** until the start of your next turn.",
    "full_text": "# Combat Expertise\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 2\n\n## Description\nThe character fights with superior tactical caution, sacrificing aggression for protection.\n\n## Mechanics & Benefit\nWhen you declare an attack action, you may choose a number up to your Combat Skill Rank. Subtract that number from your **Strike** (Attack) and add it to your **Defense** until the start of your next turn.",
    "mechanics": "When you declare an attack action, you may choose a number up to your Combat Skill Rank. Subtract that number from your **Strike** (Attack) and add it to your **Defense** until the start of your next turn.",
    "notes": "[Rule] Prerequisite: Intellect 2.\n[Prerequisite] Intellect 2",
    "notesList": [
      "[Rule] Prerequisite: Intellect 2.",
      "[Prerequisite] Intellect 2"
    ]
  },
  {
    "id": "combat-combat-reflexes",
    "name": "Combat Reflexes",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1",
    "prerequisite_text": "Agility 1",
    "modifiers": [],
    "description": "The character has exceptional peripheral awareness and reaction time, preventing enemies from exploiting blind spots.",
    "mechanic": "You cannot be **Flanked**. Enemies gain no bonus to Strike for positioning on opposite sides of you, and Sneak Attacks that rely on Flanking (but not Flat-Footed) fail to trigger.",
    "rules": "**Note:** This differs from standard d20 systems (where it grants extra AoOs); in Tangent, this is a defensive situational awareness feature.",
    "special_rules": "**Note:** This differs from standard d20 systems (where it grants extra AoOs); in Tangent, this is a defensive situational awareness feature.",
    "body": "# Combat Reflexes\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character has exceptional peripheral awareness and reaction time, preventing enemies from exploiting blind spots.\n\n## Mechanics & Benefit\nYou cannot be **Flanked**. Enemies gain no bonus to Strike for positioning on opposite sides of you, and Sneak Attacks that rely on Flanking (but not Flat-Footed) fail to trigger.\n\n## Special Rules\n**Note:** This differs from standard d20 systems (where it grants extra AoOs); in Tangent, this is a defensive situational awareness feature.",
    "full_text": "# Combat Reflexes\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character has exceptional peripheral awareness and reaction time, preventing enemies from exploiting blind spots.\n\n## Mechanics & Benefit\nYou cannot be **Flanked**. Enemies gain no bonus to Strike for positioning on opposite sides of you, and Sneak Attacks that rely on Flanking (but not Flat-Footed) fail to trigger.\n\n## Special Rules\n**Note:** This differs from standard d20 systems (where it grants extra AoOs); in Tangent, this is a defensive situational awareness feature.",
    "mechanics": "You cannot be **Flanked**. Enemies gain no bonus to Strike for positioning on opposite sides of you, and Sneak Attacks that rely on Flanking (but not Flat-Footed) fail to trigger.",
    "notes": "[Rule] **Note:** This differs from standard d20 systems (where it grants extra AoOs); in Tangent, this is a...\n[Prerequisite] Agility 1",
    "notesList": [
      "[Rule] **Note:** This differs from standard d20 systems (where it grants extra AoOs); in Tangent, this is a...",
      "[Prerequisite] Agility 1"
    ]
  },
  {
    "id": "combat-combat-skill-focus",
    "name": "Combat Skill Focus",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "prerequisites": "Chosen Combat Skill 1",
    "prerequisite_text": "Chosen Combat Skill 1",
    "modifiers": [],
    "description": "The character has dedicated extensive training and conditioning to a specific combat discipline, achieving superior accuracy and consistency with that fighting style.",
    "mechanic": "Gain a **\\+2 bonus** to a chosen Combat Skill (such as Marksmanship, Melee Weapons, Unarmed Combat, Heavy Weapons, or Gunnery).",
    "rules": "\\[Ranked / Multiple\\] This feature may be purchased once per Skill Stage in the chosen Combat Skill: Novice (1+), Trained (6+), Expert (11+), Master (16+), and Pinnacle (20), up to a maximum \\+10 bonus. It may also be purchased separately for different Combat Skills.",
    "special_rules": "\\[Ranked / Multiple\\] This feature may be purchased once per Skill Stage in the chosen Combat Skill: Novice (1+), Trained (6+), Expert (11+), Master (16+), and Pinnacle (20), up to a maximum \\+10 bonus. It may also be purchased separately for different Combat Skills.",
    "body": "# Combat Skill Focus\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Chosen Combat Skill 1\n\n## Description\nThe character has dedicated extensive training and conditioning to a specific combat discipline, achieving superior accuracy and consistency with that fighting style.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** to a chosen Combat Skill (such as Marksmanship, Melee Weapons, Unarmed Combat, Heavy Weapons, or Gunnery).\n\n## Special Rules\n\\[Ranked / Multiple\\] This feature may be purchased once per Skill Stage in the chosen Combat Skill: Novice (1+), Trained (6+), Expert (11+), Master (16+), and Pinnacle (20), up to a maximum \\+10 bonus. It may also be purchased separately for different Combat Skills.",
    "full_text": "# Combat Skill Focus\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Chosen Combat Skill 1\n\n## Description\nThe character has dedicated extensive training and conditioning to a specific combat discipline, achieving superior accuracy and consistency with that fighting style.\n\n## Mechanics & Benefit\nGain a **\\+2 bonus** to a chosen Combat Skill (such as Marksmanship, Melee Weapons, Unarmed Combat, Heavy Weapons, or Gunnery).\n\n## Special Rules\n\\[Ranked / Multiple\\] This feature may be purchased once per Skill Stage in the chosen Combat Skill: Novice (1+), Trained (6+), Expert (11+), Master (16+), and Pinnacle (20), up to a maximum \\+10 bonus. It may also be purchased separately for different Combat Skills.",
    "mechanics": "Gain a **\\+2 bonus** to a chosen Combat Skill (such as Marksmanship, Melee Weapons, Unarmed Combat, Heavy Weapons, or Gunnery).",
    "notes": "[Modifier] +2 competence bonus to chosen Combat Skill per stage\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Ranked / Multiple\\] This feature may be purchased once per Skill Stage in the chosen Combat Skill:...\n[Prerequisite] Chosen Combat Skill 1",
    "notesList": [
      "[Modifier] +2 competence bonus to chosen Combat Skill per stage",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] \\[Ranked / Multiple\\] This feature may be purchased once per Skill Stage in the chosen Combat Skill:...",
      "[Prerequisite] Chosen Combat Skill 1"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "combat_archaic",
        "combat_modern",
        "combat_advanced"
      ],
      "group_label": "Combat Skills",
      "max_skills": 1,
      "value": 2
    }
  },
  {
    "id": "combat-combat-specialist",
    "name": "Combat Specialist",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Combat Skill 6 (Trained)",
    "prerequisite_text": "Combat Skill 6 (Trained)",
    "modifiers": [],
    "description": "The character knows how to inflict maximum trauma with a specific class of weaponry.",
    "mechanic": "Increase the **Damage Die type** of one specific weapon group by one step (e.g., d6 becomes d8, d8 becomes d10).",
    "rules": "\\[Multiple\\] May be taken for different weapon groups.",
    "special_rules": "\\[Multiple\\] May be taken for different weapon groups.",
    "body": "# Combat Specialist\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Skill 6 (Trained)\n\n## Description\nThe character knows how to inflict maximum trauma with a specific class of weaponry.\n\n## Mechanics & Benefit\nIncrease the **Damage Die type** of one specific weapon group by one step (e.g., d6 becomes d8, d8 becomes d10).\n\n## Special Rules\n\\[Multiple\\] May be taken for different weapon groups.",
    "full_text": "# Combat Specialist\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Skill 6 (Trained)\n\n## Description\nThe character knows how to inflict maximum trauma with a specific class of weaponry.\n\n## Mechanics & Benefit\nIncrease the **Damage Die type** of one specific weapon group by one step (e.g., d6 becomes d8, d8 becomes d10).\n\n## Special Rules\n\\[Multiple\\] May be taken for different weapon groups.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Strength 2, Power Attack",
    "prerequisite_text": "Strength 2, Power Attack",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": -2,
        "mode": "inherent",
        "description": "-2 Defense"
      }
    ],
    "description": "The character delivers blows that shatter armor and resolve.",
    "mechanic": "As a Standard Action, make a single melee attack. If successful, the target suffers a **\\-2 penalty to Defense** (AC) for 1 round due to the staggering impact.",
    "rules": "Prerequisite: Strength 2, Power Attack.",
    "special_rules": "Prerequisite: Strength 2, Power Attack.",
    "body": "# Crushing Blow\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 2, Power Attack\n\n## Description\nThe character delivers blows that shatter armor and resolve.\n\n## Mechanics & Benefit\nAs a Standard Action, make a single melee attack. If successful, the target suffers a **\\-2 penalty to Defense** (AC) for 1 round due to the staggering impact.",
    "full_text": "# Crushing Blow\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 2, Power Attack\n\n## Description\nThe character delivers blows that shatter armor and resolve.\n\n## Mechanics & Benefit\nAs a Standard Action, make a single melee attack. If successful, the target suffers a **\\-2 penalty to Defense** (AC) for 1 round due to the staggering impact.",
    "mechanics": "As a Standard Action, make a single melee attack. If successful, the target suffers a **\\-2 penalty to Defense** (AC) for 1 round due to the staggering impact.",
    "notes": "[Penalty] -2 Defense\n[Rule] Prerequisite: Strength 2, Power Attack.\n[Prerequisite] Strength 2, Power Attack",
    "notesList": [
      "[Penalty] -2 Defense",
      "[Rule] Prerequisite: Strength 2, Power Attack.",
      "[Prerequisite] Strength 2, Power Attack"
    ]
  },
  {
    "id": "combat-dead-aim",
    "name": "Dead Aim",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Wisdom 3, Ranged 6",
    "prerequisite_text": "Wisdom 3, Ranged 6",
    "modifiers": [
      {
        "target": "Strike",
        "type": "combat",
        "value": 2,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Taking no movement during your turn",
        "description": "+2 to Strike with ranged weapons if remaining stationary"
      }
    ],
    "description": "The character trades mobility for extreme precision.",
    "mechanic": "If you do not move during your turn, you gain a **\\+2 bonus to Strike** with Ranged Weapons. This stacks with Aiming actions.",
    "rules": "Prerequisite: Wisdom 3, Ranged 6.",
    "special_rules": "Prerequisite: Wisdom 3, Ranged 6.",
    "body": "# Dead Aim\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 3, Ranged 6\n\n## Description\nThe character trades mobility for extreme precision.\n\n## Mechanics & Benefit\nIf you do not move during your turn, you gain a **\\+2 bonus to Strike** with Ranged Weapons. This stacks with Aiming actions.",
    "full_text": "# Dead Aim\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 3, Ranged 6\n\n## Description\nThe character trades mobility for extreme precision.\n\n## Mechanics & Benefit\nIf you do not move during your turn, you gain a **\\+2 bonus to Strike** with Ranged Weapons. This stacks with Aiming actions.",
    "mechanics": "If you do not move during your turn, you gain a **\\+2 bonus to Strike** with Ranged Weapons. This stacks with Aiming actions.",
    "notes": "[Modifier] +2 to Strike with ranged weapons if remaining stationary\n[Rule] Prerequisite: Wisdom 3, Ranged 6.\n[Prerequisite] Wisdom 3, Ranged 6",
    "notesList": [
      "[Modifier] +2 to Strike with ranged weapons if remaining stationary",
      "[Rule] Prerequisite: Wisdom 3, Ranged 6.",
      "[Prerequisite] Wisdom 3, Ranged 6"
    ]
  },
  {
    "id": "combat-defensive-combat-training",
    "name": "Defensive Combat Training",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Combat Skill 1",
    "prerequisite_text": "Combat Skill 1",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 4,
        "mode": "inherent",
        "description": "+4 Defense"
      },
      {
        "target": "Defense specifically against Combat Maneuvers Trip",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Defense specifically against Combat Maneuvers Trip"
      },
      {
        "target": "Disarm",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Disarm"
      },
      {
        "target": "Grapple",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Grapple"
      },
      {
        "target": "Bull Rush",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Bull Rush"
      }
    ],
    "description": "The character has trained to resist grappling and takedowns, using overall combat experience rather than just raw agility.",
    "mechanic": "You gain a **\\+4 Bonus to Defense** specifically against Combat Maneuvers (Trip, Disarm, Grapple, Bull Rush).",
    "rules": "Prerequisite: Combat Skill 1.",
    "special_rules": "Prerequisite: Combat Skill 1.",
    "body": "# Defensive Combat Training\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Skill 1\n\n## Description\nThe character has trained to resist grappling and takedowns, using overall combat experience rather than just raw agility.\n\n## Mechanics & Benefit\nYou gain a **\\+4 Bonus to Defense** specifically against Combat Maneuvers (Trip, Disarm, Grapple, Bull Rush).",
    "full_text": "# Defensive Combat Training\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Skill 1\n\n## Description\nThe character has trained to resist grappling and takedowns, using overall combat experience rather than just raw agility.\n\n## Mechanics & Benefit\nYou gain a **\\+4 Bonus to Defense** specifically against Combat Maneuvers (Trip, Disarm, Grapple, Bull Rush).",
    "mechanics": "You gain a **\\+4 Bonus to Defense** specifically against Combat Maneuvers (Trip, Disarm, Grapple, Bull Rush).",
    "notes": "[Modifier] +4 Defense\n[Modifier] +4 to Defense specifically against Combat Maneuvers Trip\n[Modifier] +4 to Disarm\n[Modifier] +4 to Grapple\n[Modifier] +4 to Bull Rush\n[Rule] Prerequisite: Combat Skill 1.\n[Prerequisite] Combat Skill 1",
    "notesList": [
      "[Modifier] +4 Defense",
      "[Modifier] +4 to Defense specifically against Combat Maneuvers Trip",
      "[Modifier] +4 to Disarm",
      "[Modifier] +4 to Grapple",
      "[Modifier] +4 to Bull Rush",
      "[Rule] Prerequisite: Combat Skill 1.",
      "[Prerequisite] Combat Skill 1"
    ]
  },
  {
    "id": "combat-deflect-arrows",
    "name": "Deflect Arrows",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 2, Unarmed 1",
    "prerequisite_text": "Agility 2, Unarmed 1",
    "modifiers": [],
    "description": "The character can knock aside projectiles with a weapon or free hand.",
    "mechanic": "Once per round, when you would normally be hit by a ranged weapon attack, you may make a Reflex Save (CR equal to the Attack Roll). If successful, you deflect the projectile and take **no damage**. You must be aware of the attack and not flat-footed.",
    "rules": "Prerequisite: Agility 2, Unarmed 1.",
    "special_rules": "Prerequisite: Agility 2, Unarmed 1.",
    "body": "# Deflect Arrows\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2, Unarmed 1\n\n## Description\nThe character can knock aside projectiles with a weapon or free hand.\n\n## Mechanics & Benefit\nOnce per round, when you would normally be hit by a ranged weapon attack, you may make a Reflex Save (CR equal to the Attack Roll). If successful, you deflect the projectile and take **no damage**. You must be aware of the attack and not flat-footed.",
    "full_text": "# Deflect Arrows\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2, Unarmed 1\n\n## Description\nThe character can knock aside projectiles with a weapon or free hand.\n\n## Mechanics & Benefit\nOnce per round, when you would normally be hit by a ranged weapon attack, you may make a Reflex Save (CR equal to the Attack Roll). If successful, you deflect the projectile and take **no damage**. You must be aware of the attack and not flat-footed.",
    "mechanics": "Once per round, when you would normally be hit by a ranged weapon attack, you may make a Reflex Save (CR equal to the Attack Roll). If successful, you deflect the projectile and take **no damage**. You must be aware of the attack and not flat-footed.",
    "notes": "[Rule] Prerequisite: Agility 2, Unarmed 1.\n[Prerequisite] Agility 2, Unarmed 1",
    "notesList": [
      "[Rule] Prerequisite: Agility 2, Unarmed 1.",
      "[Prerequisite] Agility 2, Unarmed 1"
    ]
  },
  {
    "id": "combat-dodge",
    "name": "Dodge",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1",
    "prerequisite_text": "Agility 1",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 1,
        "mode": "inherent",
        "description": "+1 Defense"
      }
    ],
    "description": "The character is adept at dodging blows.",
    "mechanic": "Gain a **\\+1 Dodge bonus to Defense**.",
    "rules": "Dodge bonuses stack with other Dodge bonuses (but not with themselves). This bonus is lost if you are Flat-Footed.",
    "special_rules": "Dodge bonuses stack with other Dodge bonuses (but not with themselves). This bonus is lost if you are Flat-Footed.",
    "body": "# Dodge\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character is adept at dodging blows.\n\n## Mechanics & Benefit\nGain a **\\+1 Dodge bonus to Defense**.\n\n## Special Rules\nDodge bonuses stack with other Dodge bonuses (but not with themselves). This bonus is lost if you are Flat-Footed.",
    "full_text": "# Dodge\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character is adept at dodging blows.\n\n## Mechanics & Benefit\nGain a **\\+1 Dodge bonus to Defense**.\n\n## Special Rules\nDodge bonuses stack with other Dodge bonuses (but not with themselves). This bonus is lost if you are Flat-Footed.",
    "mechanics": "Gain a **\\+1 Dodge bonus to Defense**.",
    "notes": "[Modifier] +1 Defense\n[Rule] Dodge bonuses stack with other Dodge bonuses (but not with themselves). This bonus is lost if you ar...\n[Prerequisite] Agility 1",
    "notesList": [
      "[Modifier] +1 Defense",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Two-Weapon Fighting, Strength 1",
    "prerequisite_text": "Two-Weapon Fighting, Strength 1",
    "modifiers": [],
    "description": "The character applies full strength to both weapons when dual-wielding.",
    "mechanic": "Add your full **Strength modifier** to damage rolls with your off-hand weapon (normally, off-hand weapons receive only 1/2 Strength modifier).",
    "rules": "Prerequisite: Two-Weapon Fighting, Strength 1.",
    "special_rules": "Prerequisite: Two-Weapon Fighting, Strength 1.",
    "body": "# Double Slice\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Two-Weapon Fighting, Strength 1\n\n## Description\nThe character applies full strength to both weapons when dual-wielding.\n\n## Mechanics & Benefit\nAdd your full **Strength modifier** to damage rolls with your off-hand weapon (normally, off-hand weapons receive only 1/2 Strength modifier).",
    "full_text": "# Double Slice\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Two-Weapon Fighting, Strength 1\n\n## Description\nThe character applies full strength to both weapons when dual-wielding.\n\n## Mechanics & Benefit\nAdd your full **Strength modifier** to damage rolls with your off-hand weapon (normally, off-hand weapons receive only 1/2 Strength modifier).",
    "mechanics": "Add your full **Strength modifier** to damage rolls with your off-hand weapon (normally, off-hand weapons receive only 1/2 Strength modifier).",
    "notes": "[Rule] Prerequisite: Two-Weapon Fighting, Strength 1.\n[Prerequisite] Two-Weapon Fighting, Strength 1",
    "notesList": [
      "[Rule] Prerequisite: Two-Weapon Fighting, Strength 1.",
      "[Prerequisite] Two-Weapon Fighting, Strength 1"
    ]
  },
  {
    "id": "combat-greater-disarm",
    "name": "Greater Disarm",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Improved Disarm",
    "prerequisite_text": "Improved Disarm",
    "modifiers": [],
    "description": "The character disarms with such force that the weapon is sent flying.",
    "mechanic": "When you successfully Disarm an opponent, the weapon is knocked **15 feet** away in a random direction (or one of your choice on a critical success), rather than falling at the opponent's feet.",
    "rules": "Prerequisite: Improved Disarm.",
    "special_rules": "Prerequisite: Improved Disarm.",
    "body": "# Greater Disarm\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Improved Disarm\n\n## Description\nThe character disarms with such force that the weapon is sent flying.\n\n## Mechanics & Benefit\nWhen you successfully Disarm an opponent, the weapon is knocked **15 feet** away in a random direction (or one of your choice on a critical success), rather than falling at the opponent's feet.",
    "full_text": "# Greater Disarm\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Improved Disarm\n\n## Description\nThe character disarms with such force that the weapon is sent flying.\n\n## Mechanics & Benefit\nWhen you successfully Disarm an opponent, the weapon is knocked **15 feet** away in a random direction (or one of your choice on a critical success), rather than falling at the opponent's feet.",
    "mechanics": "When you successfully Disarm an opponent, the weapon is knocked **15 feet** away in a random direction (or one of your choice on a critical success), rather than falling at the opponent's feet.",
    "notes": "[Rule] Prerequisite: Improved Disarm.\n[Prerequisite] Improved Disarm",
    "notesList": [
      "[Rule] Prerequisite: Improved Disarm.",
      "[Prerequisite] Improved Disarm"
    ]
  },
  {
    "id": "combat-greater-feint",
    "name": "Greater Feint",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Improved Feint",
    "prerequisite_text": "Improved Feint",
    "modifiers": [],
    "description": "The character's feints leave opponents completely off-balance.",
    "mechanic": "Enemies you successfully Feint lose their Agility bonus to Defense for **1 full round** (until the start of your next turn), allowing allies to also benefit from the opening.",
    "rules": "Prerequisite: Improved Feint.",
    "special_rules": "Prerequisite: Improved Feint.",
    "body": "# Greater Feint\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Improved Feint\n\n## Description\nThe character's feints leave opponents completely off-balance.\n\n## Mechanics & Benefit\nEnemies you successfully Feint lose their Agility bonus to Defense for **1 full round** (until the start of your next turn), allowing allies to also benefit from the opening.",
    "full_text": "# Greater Feint\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Improved Feint\n\n## Description\nThe character's feints leave opponents completely off-balance.\n\n## Mechanics & Benefit\nEnemies you successfully Feint lose their Agility bonus to Defense for **1 full round** (until the start of your next turn), allowing allies to also benefit from the opening.",
    "mechanics": "Enemies you successfully Feint lose their Agility bonus to Defense for **1 full round** (until the start of your next turn), allowing allies to also benefit from the opening.",
    "notes": "[Rule] Prerequisite: Improved Feint.\n[Prerequisite] Improved Feint",
    "notesList": [
      "[Rule] Prerequisite: Improved Feint.",
      "[Prerequisite] Improved Feint"
    ]
  },
  {
    "id": "combat-greater-trip",
    "name": "Greater Trip",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Improved Trip",
    "prerequisite_text": "Improved Trip",
    "modifiers": [],
    "description": "The character follows up a takedown with immediate punishment.",
    "mechanic": "Enemies you successfully Trip provoke an immediate **Attack of Opportunity** from you as they fall.",
    "rules": "Prerequisite: Improved Trip.",
    "special_rules": "Prerequisite: Improved Trip.",
    "body": "# Greater Trip\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Improved Trip\n\n## Description\nThe character follows up a takedown with immediate punishment.\n\n## Mechanics & Benefit\nEnemies you successfully Trip provoke an immediate **Attack of Opportunity** from you as they fall.",
    "full_text": "# Greater Trip\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Improved Trip\n\n## Description\nThe character follows up a takedown with immediate punishment.\n\n## Mechanics & Benefit\nEnemies you successfully Trip provoke an immediate **Attack of Opportunity** from you as they fall.",
    "mechanics": "Enemies you successfully Trip provoke an immediate **Attack of Opportunity** from you as they fall.",
    "notes": "[Rule] Prerequisite: Improved Trip.\n[Prerequisite] Improved Trip",
    "notesList": [
      "[Rule] Prerequisite: Improved Trip.",
      "[Prerequisite] Improved Trip"
    ]
  },
  {
    "id": "combat-greater-two-weapon-defense",
    "name": "Greater Two-Weapon Defense",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Greater Two-Weapon Fighting, Improved Two-Weapon Defense",
    "prerequisite_text": "Greater Two-Weapon Fighting, Improved Two-Weapon Defense",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 3,
        "mode": "inherent",
        "description": "+3 Shield bonus to Defense"
      }
    ],
    "description": "Superior defensive web of steel.",
    "mechanic": "The Shield bonus to Defense increases to **\\+3**.",
    "rules": "Prerequisite: Greater Two-Weapon Fighting, Improved Two-Weapon Defense.",
    "special_rules": "Prerequisite: Greater Two-Weapon Fighting, Improved Two-Weapon Defense.",
    "body": "# Greater Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Greater Two-Weapon Fighting, Improved Two-Weapon Defense\n\n## Description\nSuperior defensive web of steel.\n\n## Mechanics & Benefit\nThe Shield bonus to Defense increases to **\\+3**.",
    "full_text": "# Greater Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Greater Two-Weapon Fighting, Improved Two-Weapon Defense\n\n## Description\nSuperior defensive web of steel.\n\n## Mechanics & Benefit\nThe Shield bonus to Defense increases to **\\+3**.",
    "mechanics": "The Shield bonus to Defense increases to **\\+3**.",
    "notes": "[Modifier] +3 Shield bonus to Defense\n[Rule] Prerequisite: Greater Two-Weapon Fighting, Improved Two-Weapon Defense.\n[Prerequisite] Greater Two-Weapon Fighting, Improved Two-Weapon Defense",
    "notesList": [
      "[Modifier] +3 Shield bonus to Defense",
      "[Rule] Prerequisite: Greater Two-Weapon Fighting, Improved Two-Weapon Defense.",
      "[Prerequisite] Greater Two-Weapon Fighting, Improved Two-Weapon Defense"
    ]
  },
  {
    "id": "combat-greater-two-weapon-fighting",
    "name": "Greater Two-Weapon Fighting",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 4, Combat Skill 11, Improved Two-Weapon Fighting",
    "prerequisite_text": "Agility 4, Combat Skill 11, Improved Two-Weapon Fighting",
    "modifiers": [
      {
        "target": "Penalty",
        "type": "skill",
        "value": -10,
        "mode": "penalty",
        "description": "-10 to Penalty"
      }
    ],
    "description": "A blur of steel/energy.",
    "mechanic": "You gain a **third attack** with your off-hand weapon, at a **\\-10 penalty**.",
    "rules": "Prerequisite: Agility 4, Combat Skill 11, Improved Two-Weapon Fighting.",
    "special_rules": "Prerequisite: Agility 4, Combat Skill 11, Improved Two-Weapon Fighting.",
    "body": "# Greater Two-Weapon Fighting\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 4, Combat Skill 11, Improved Two-Weapon Fighting\n\n## Description\nA blur of steel/energy.\n\n## Mechanics & Benefit\nYou gain a **third attack** with your off-hand weapon, at a **\\-10 penalty**.",
    "full_text": "# Greater Two-Weapon Fighting\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 4, Combat Skill 11, Improved Two-Weapon Fighting\n\n## Description\nA blur of steel/energy.\n\n## Mechanics & Benefit\nYou gain a **third attack** with your off-hand weapon, at a **\\-10 penalty**.",
    "mechanics": "You gain a **third attack** with your off-hand weapon, at a **\\-10 penalty**.",
    "notes": "[Penalty] -10 to Penalty\n[Rule] Prerequisite: Agility 4, Combat Skill 11, Improved Two-Weapon Fighting.\n[Prerequisite] Agility 4, Combat Skill 11, Improved Two-Weapon Fighting",
    "notesList": [
      "[Penalty] -10 to Penalty",
      "[Rule] Prerequisite: Agility 4, Combat Skill 11, Improved Two-Weapon Fighting.",
      "[Prerequisite] Agility 4, Combat Skill 11, Improved Two-Weapon Fighting"
    ]
  },
  {
    "id": "combat-greater-vital-strike",
    "name": "Greater Vital Strike",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Improved Vital Strike, Combat Skill 16",
    "prerequisite_text": "Improved Vital Strike, Combat Skill 16",
    "modifiers": [],
    "description": "A killing blow delivered with perfect efficiency.",
    "mechanic": "As a Standard Action, make a single attack. Deal **four times (4x)** the weapon's damage dice.",
    "rules": "Prerequisite: Improved Vital Strike, Combat Skill 16.",
    "special_rules": "Prerequisite: Improved Vital Strike, Combat Skill 16.",
    "body": "# Greater Vital Strike\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Improved Vital Strike, Combat Skill 16\n\n## Description\nA killing blow delivered with perfect efficiency.\n\n## Mechanics & Benefit\nAs a Standard Action, make a single attack. Deal **four times (4x)** the weapon's damage dice.",
    "full_text": "# Greater Vital Strike\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Improved Vital Strike, Combat Skill 16\n\n## Description\nA killing blow delivered with perfect efficiency.\n\n## Mechanics & Benefit\nAs a Standard Action, make a single attack. Deal **four times (4x)** the weapon's damage dice.",
    "mechanics": "As a Standard Action, make a single attack. Deal **four times (4x)** the weapon's damage dice.",
    "notes": "[Rule] Prerequisite: Improved Vital Strike, Combat Skill 16.\n[Prerequisite] Improved Vital Strike, Combat Skill 16",
    "notesList": [
      "[Rule] Prerequisite: Improved Vital Strike, Combat Skill 16.",
      "[Prerequisite] Improved Vital Strike, Combat Skill 16"
    ]
  },
  {
    "id": "combat-grtr-weapon-specialization",
    "name": "Grtr. Weapon Specialization",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Imp. Weapon Specialization, Combat Skill 16",
    "prerequisite_text": "Imp. Weapon Specialization, Combat Skill 16",
    "modifiers": [
      {
        "target": "Dice of Damage total with the chosen weapon",
        "type": "skill",
        "value": 3,
        "mode": "inherent",
        "description": "+3 to Dice of Damage total with the chosen weapon"
      }
    ],
    "description": "Peerless lethality.",
    "mechanic": "Gain **\\+3 Dice of Damage** (total) with the chosen weapon.\n\n&nbsp;",
    "rules": "Prerequisite: Imp. Weapon Specialization, Combat Skill 16.",
    "special_rules": "Prerequisite: Imp. Weapon Specialization, Combat Skill 16.",
    "body": "# Grtr. Weapon Specialization\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Imp. Weapon Specialization, Combat Skill 16\n\n## Description\nPeerless lethality.\n\n## Mechanics & Benefit\nGain **\\+3 Dice of Damage** (total) with the chosen weapon.\n\n&nbsp;",
    "full_text": "# Grtr. Weapon Specialization\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Imp. Weapon Specialization, Combat Skill 16\n\n## Description\nPeerless lethality.\n\n## Mechanics & Benefit\nGain **\\+3 Dice of Damage** (total) with the chosen weapon.\n\n&nbsp;",
    "mechanics": "Gain **\\+3 Dice of Damage** (total) with the chosen weapon.\n\n&nbsp;",
    "notes": "[Modifier] +3 to Dice of Damage total with the chosen weapon\n[Rule] Prerequisite: Imp. Weapon Specialization, Combat Skill 16.\n[Prerequisite] Imp. Weapon Specialization, Combat Skill 16",
    "notesList": [
      "[Modifier] +3 to Dice of Damage total with the chosen weapon",
      "[Rule] Prerequisite: Imp. Weapon Specialization, Combat Skill 16.",
      "[Prerequisite] Imp. Weapon Specialization, Combat Skill 16"
    ]
  },
  {
    "id": "combat-imp-weapon-specialization",
    "name": "Imp. Weapon Specialization",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Weapon Specialization, Combat Skill 11",
    "prerequisite_text": "Weapon Specialization, Combat Skill 11",
    "modifiers": [
      {
        "target": "Dice of Damage total with the chosen weapon",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Dice of Damage total with the chosen weapon"
      }
    ],
    "description": "Lethal mastery.",
    "mechanic": "Gain **\\+2 Dice of Damage** (total) with the chosen weapon.",
    "rules": "Prerequisite: Weapon Specialization, Combat Skill 11.",
    "special_rules": "Prerequisite: Weapon Specialization, Combat Skill 11.",
    "body": "# Imp. Weapon Specialization\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Weapon Specialization, Combat Skill 11\n\n## Description\nLethal mastery.\n\n## Mechanics & Benefit\nGain **\\+2 Dice of Damage** (total) with the chosen weapon.",
    "full_text": "# Imp. Weapon Specialization\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Weapon Specialization, Combat Skill 11\n\n## Description\nLethal mastery.\n\n## Mechanics & Benefit\nGain **\\+2 Dice of Damage** (total) with the chosen weapon.",
    "mechanics": "Gain **\\+2 Dice of Damage** (total) with the chosen weapon.",
    "notes": "[Modifier] +2 to Dice of Damage total with the chosen weapon\n[Rule] Prerequisite: Weapon Specialization, Combat Skill 11.\n[Prerequisite] Weapon Specialization, Combat Skill 11",
    "notesList": [
      "[Modifier] +2 to Dice of Damage total with the chosen weapon",
      "[Rule] Prerequisite: Weapon Specialization, Combat Skill 11.",
      "[Prerequisite] Weapon Specialization, Combat Skill 11"
    ]
  },
  {
    "id": "combat-improved-disarm",
    "name": "Improved Disarm",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Combat Expertise",
    "prerequisite_text": "Combat Expertise",
    "modifiers": [
      {
        "target": "Disarm attempts",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Disarm attempts"
      }
    ],
    "description": "The character knows how to twist a weapon out of an opponent's grip safely.",
    "mechanic": "You gain a **\\+2 bonus** on Disarm attempts. Attempting to Disarm an opponent does not provoke an Attack of Opportunity.",
    "rules": "Prerequisite: Combat Expertise.",
    "special_rules": "Prerequisite: Combat Expertise.",
    "body": "# Improved Disarm\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Expertise\n\n## Description\nThe character knows how to twist a weapon out of an opponent's grip safely.\n\n## Mechanics & Benefit\nYou gain a **\\+2 bonus** on Disarm attempts. Attempting to Disarm an opponent does not provoke an Attack of Opportunity.",
    "full_text": "# Improved Disarm\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Expertise\n\n## Description\nThe character knows how to twist a weapon out of an opponent's grip safely.\n\n## Mechanics & Benefit\nYou gain a **\\+2 bonus** on Disarm attempts. Attempting to Disarm an opponent does not provoke an Attack of Opportunity.",
    "mechanics": "You gain a **\\+2 bonus** on Disarm attempts. Attempting to Disarm an opponent does not provoke an Attack of Opportunity.",
    "notes": "[Modifier] +2 to Disarm attempts\n[Rule] Prerequisite: Combat Expertise.\n[Prerequisite] Combat Expertise",
    "notesList": [
      "[Modifier] +2 to Disarm attempts",
      "[Rule] Prerequisite: Combat Expertise.",
      "[Prerequisite] Combat Expertise"
    ]
  },
  {
    "id": "combat-improved-feint",
    "name": "Improved Feint",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Combat Expertise, Bluff 1",
    "prerequisite_text": "Combat Expertise, Bluff 1",
    "modifiers": [],
    "description": "The character is a master of misdirection, capable of faking an attack faster than the eye can follow.",
    "mechanic": "You may make a Bluff check to Feint in combat as a **Move Action** (normally a Standard Action).  \n* **Purpose:** Allows you to Feint and Attack in the same round.",
    "rules": "Prerequisite: Combat Expertise, Bluff 1.",
    "special_rules": "Prerequisite: Combat Expertise, Bluff 1.",
    "body": "# Improved Feint\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Expertise, Bluff 1\n\n## Description\nThe character is a master of misdirection, capable of faking an attack faster than the eye can follow.\n\n## Mechanics & Benefit\nYou may make a Bluff check to Feint in combat as a **Move Action** (normally a Standard Action).  \n* **Purpose:** Allows you to Feint and Attack in the same round.",
    "full_text": "# Improved Feint\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Expertise, Bluff 1\n\n## Description\nThe character is a master of misdirection, capable of faking an attack faster than the eye can follow.\n\n## Mechanics & Benefit\nYou may make a Bluff check to Feint in combat as a **Move Action** (normally a Standard Action).  \n* **Purpose:** Allows you to Feint and Attack in the same round.",
    "mechanics": "You may make a Bluff check to Feint in combat as a **Move Action** (normally a Standard Action).  \n* **Purpose:** Allows you to Feint and Attack in the same round.",
    "notes": "[Rule] Prerequisite: Combat Expertise, Bluff 1.\n[Prerequisite] Combat Expertise, Bluff 1",
    "notesList": [
      "[Rule] Prerequisite: Combat Expertise, Bluff 1.",
      "[Prerequisite] Combat Expertise, Bluff 1"
    ]
  },
  {
    "id": "combat-improved-trip",
    "name": "Improved Trip",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Combat Expertise",
    "prerequisite_text": "Combat Expertise",
    "modifiers": [
      {
        "target": "Trip attempts",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Trip attempts"
      }
    ],
    "description": "The character knows how to unbalance opponents safely.",
    "mechanic": "You gain a **\\+2 bonus** on Trip attempts. Attempting to Trip an opponent does not provoke an Attack of Opportunity.",
    "rules": "Prerequisite: Combat Expertise.",
    "special_rules": "Prerequisite: Combat Expertise.",
    "body": "# Improved Trip\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Expertise\n\n## Description\nThe character knows how to unbalance opponents safely.\n\n## Mechanics & Benefit\nYou gain a **\\+2 bonus** on Trip attempts. Attempting to Trip an opponent does not provoke an Attack of Opportunity.",
    "full_text": "# Improved Trip\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Expertise\n\n## Description\nThe character knows how to unbalance opponents safely.\n\n## Mechanics & Benefit\nYou gain a **\\+2 bonus** on Trip attempts. Attempting to Trip an opponent does not provoke an Attack of Opportunity.",
    "mechanics": "You gain a **\\+2 bonus** on Trip attempts. Attempting to Trip an opponent does not provoke an Attack of Opportunity.",
    "notes": "[Modifier] +2 to Trip attempts\n[Rule] Prerequisite: Combat Expertise.\n[Prerequisite] Combat Expertise",
    "notesList": [
      "[Modifier] +2 to Trip attempts",
      "[Rule] Prerequisite: Combat Expertise.",
      "[Prerequisite] Combat Expertise"
    ]
  },
  {
    "id": "combat-improved-two-weapon-defense",
    "name": "Improved Two-Weapon Defense",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Improved Two-Weapon Fighting, Two-Weapon Defense",
    "prerequisite_text": "Improved Two-Weapon Fighting, Two-Weapon Defense",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 2,
        "mode": "inherent",
        "description": "+2 Shield bonus to Defense"
      }
    ],
    "description": "Enhanced parrying techniques.",
    "mechanic": "The Shield bonus to Defense increases to **\\+2**.",
    "rules": "Prerequisite: Improved Two-Weapon Fighting, Two-Weapon Defense.",
    "special_rules": "Prerequisite: Improved Two-Weapon Fighting, Two-Weapon Defense.",
    "body": "# Improved Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Improved Two-Weapon Fighting, Two-Weapon Defense\n\n## Description\nEnhanced parrying techniques.\n\n## Mechanics & Benefit\nThe Shield bonus to Defense increases to **\\+2**.",
    "full_text": "# Improved Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Improved Two-Weapon Fighting, Two-Weapon Defense\n\n## Description\nEnhanced parrying techniques.\n\n## Mechanics & Benefit\nThe Shield bonus to Defense increases to **\\+2**.",
    "mechanics": "The Shield bonus to Defense increases to **\\+2**.",
    "notes": "[Modifier] +2 Shield bonus to Defense\n[Rule] Prerequisite: Improved Two-Weapon Fighting, Two-Weapon Defense.\n[Prerequisite] Improved Two-Weapon Fighting, Two-Weapon Defense",
    "notesList": [
      "[Modifier] +2 Shield bonus to Defense",
      "[Rule] Prerequisite: Improved Two-Weapon Fighting, Two-Weapon Defense.",
      "[Prerequisite] Improved Two-Weapon Fighting, Two-Weapon Defense"
    ]
  },
  {
    "id": "combat-improved-two-weapon-fighting",
    "name": "Improved Two-Weapon Fighting",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 3, Combat Skill 6, Two-Weapon Fighting",
    "prerequisite_text": "Agility 3, Combat Skill 6, Two-Weapon Fighting",
    "modifiers": [
      {
        "target": "Penalty",
        "type": "skill",
        "value": -5,
        "mode": "penalty",
        "description": "-5 to Penalty"
      }
    ],
    "description": "The character's speed allows for more strikes with the off-hand.",
    "mechanic": "In addition to the standard single off-hand attack, you gain a **second attack** with your off-hand weapon, albeit at a **\\-5 penalty**.",
    "rules": "Prerequisite: Agility 3, Combat Skill 6, Two-Weapon Fighting.",
    "special_rules": "Prerequisite: Agility 3, Combat Skill 6, Two-Weapon Fighting.",
    "body": "# Improved Two-Weapon Fighting\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 3, Combat Skill 6, Two-Weapon Fighting\n\n## Description\nThe character's speed allows for more strikes with the off-hand.\n\n## Mechanics & Benefit\nIn addition to the standard single off-hand attack, you gain a **second attack** with your off-hand weapon, albeit at a **\\-5 penalty**.",
    "full_text": "# Improved Two-Weapon Fighting\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 3, Combat Skill 6, Two-Weapon Fighting\n\n## Description\nThe character's speed allows for more strikes with the off-hand.\n\n## Mechanics & Benefit\nIn addition to the standard single off-hand attack, you gain a **second attack** with your off-hand weapon, albeit at a **\\-5 penalty**.",
    "mechanics": "In addition to the standard single off-hand attack, you gain a **second attack** with your off-hand weapon, albeit at a **\\-5 penalty**.",
    "notes": "[Penalty] -5 to Penalty\n[Rule] Prerequisite: Agility 3, Combat Skill 6, Two-Weapon Fighting.\n[Prerequisite] Agility 3, Combat Skill 6, Two-Weapon Fighting",
    "notesList": [
      "[Penalty] -5 to Penalty",
      "[Rule] Prerequisite: Agility 3, Combat Skill 6, Two-Weapon Fighting.",
      "[Prerequisite] Agility 3, Combat Skill 6, Two-Weapon Fighting"
    ]
  },
  {
    "id": "combat-improved-vital-strike",
    "name": "Improved Vital Strike",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Vital Strike, Combat Skill 11",
    "prerequisite_text": "Vital Strike, Combat Skill 11",
    "modifiers": [],
    "description": "A precise strike that targets vital organs.",
    "mechanic": "As a Standard Action, make a single attack. Deal **three times (3x)** the weapon's damage dice.",
    "rules": "Prerequisite: Vital Strike, Combat Skill 11.",
    "special_rules": "Prerequisite: Vital Strike, Combat Skill 11.",
    "body": "# Improved Vital Strike\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Vital Strike, Combat Skill 11\n\n## Description\nA precise strike that targets vital organs.\n\n## Mechanics & Benefit\nAs a Standard Action, make a single attack. Deal **three times (3x)** the weapon's damage dice.",
    "full_text": "# Improved Vital Strike\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Vital Strike, Combat Skill 11\n\n## Description\nA precise strike that targets vital organs.\n\n## Mechanics & Benefit\nAs a Standard Action, make a single attack. Deal **three times (3x)** the weapon's damage dice.",
    "mechanics": "As a Standard Action, make a single attack. Deal **three times (3x)** the weapon's damage dice.",
    "notes": "[Rule] Prerequisite: Vital Strike, Combat Skill 11.\n[Prerequisite] Vital Strike, Combat Skill 11",
    "notesList": [
      "[Rule] Prerequisite: Vital Strike, Combat Skill 11.",
      "[Prerequisite] Vital Strike, Combat Skill 11"
    ]
  },
  {
    "id": "combat-mobility",
    "name": "Mobility",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 2, Dodge",
    "prerequisite_text": "Agility 2, Dodge",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 4,
        "mode": "inherent",
        "description": "+4 Defense"
      }
    ],
    "description": "The character moves through the battlefield with ease, weaving through threatened areas.",
    "mechanic": "You gain a **\\+4 Dodge bonus to Defense** against Attacks of Opportunity caused by moving out of or through a threatened square.",
    "rules": "Prerequisite: Agility 2, Dodge.",
    "special_rules": "Prerequisite: Agility 2, Dodge.",
    "body": "# Mobility\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2, Dodge\n\n## Description\nThe character moves through the battlefield with ease, weaving through threatened areas.\n\n## Mechanics & Benefit\nYou gain a **\\+4 Dodge bonus to Defense** against Attacks of Opportunity caused by moving out of or through a threatened square.",
    "full_text": "# Mobility\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2, Dodge\n\n## Description\nThe character moves through the battlefield with ease, weaving through threatened areas.\n\n## Mechanics & Benefit\nYou gain a **\\+4 Dodge bonus to Defense** against Attacks of Opportunity caused by moving out of or through a threatened square.",
    "mechanics": "You gain a **\\+4 Dodge bonus to Defense** against Attacks of Opportunity caused by moving out of or through a threatened square.",
    "notes": "[Modifier] +4 Defense\n[Rule] Prerequisite: Agility 2, Dodge.\n[Prerequisite] Agility 2, Dodge",
    "notesList": [
      "[Modifier] +4 Defense",
      "[Rule] Prerequisite: Agility 2, Dodge.",
      "[Prerequisite] Agility 2, Dodge"
    ]
  },
  {
    "id": "combat-multidextrous",
    "name": "Multidextrous",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Ambidextrous or Agility 4; Species with 3+ arms.",
    "prerequisite_text": "Ambidextrous or Agility 4; Species with 3+ arms.",
    "modifiers": [],
    "description": "Applicable to species with more than two arms, this feature allows the coordination of multiple limbs in concert.",
    "mechanic": "You suffer no penalties for using any of your off-hands. You may wield weapons in all available hands without the standard \"off-hand\" penalties to Strike.",
    "rules": "Prerequisite: Ambidextrous or Agility 4; Species with 3+ arms..",
    "special_rules": "Prerequisite: Ambidextrous or Agility 4; Species with 3+ arms..",
    "body": "# Multidextrous\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Ambidextrous or Agility 4; Species with 3+ arms.\n\n## Description\nApplicable to species with more than two arms, this feature allows the coordination of multiple limbs in concert.\n\n## Mechanics & Benefit\nYou suffer no penalties for using any of your off-hands. You may wield weapons in all available hands without the standard \"off-hand\" penalties to Strike.",
    "full_text": "# Multidextrous\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Ambidextrous or Agility 4; Species with 3+ arms.\n\n## Description\nApplicable to species with more than two arms, this feature allows the coordination of multiple limbs in concert.\n\n## Mechanics & Benefit\nYou suffer no penalties for using any of your off-hands. You may wield weapons in all available hands without the standard \"off-hand\" penalties to Strike.",
    "mechanics": "You suffer no penalties for using any of your off-hands. You may wield weapons in all available hands without the standard \"off-hand\" penalties to Strike.",
    "notes": "[Rule] Prerequisite: Ambidextrous or Agility 4; Species with 3+ arms..\n[Prerequisite] Ambidextrous or Agility 4; Species with 3+ arms.",
    "notesList": [
      "[Rule] Prerequisite: Ambidextrous or Agility 4; Species with 3+ arms..",
      "[Prerequisite] Ambidextrous or Agility 4; Species with 3+ arms."
    ]
  },
  {
    "id": "combat-perfect-two-weapon-defense",
    "name": "Perfect Two-Weapon Defense",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Perfect Two-Weapon Fighting, Greater Two-Weapon Defense",
    "prerequisite_text": "Perfect Two-Weapon Fighting, Greater Two-Weapon Defense",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 4,
        "mode": "inherent",
        "description": "+4 Shield bonus to Defense"
      }
    ],
    "description": "Impenetrable defense while dual-wielding.",
    "mechanic": "The Shield bonus to Defense increases to **\\+4**.",
    "rules": "Prerequisite: Perfect Two-Weapon Fighting, Greater Two-Weapon Defense.",
    "special_rules": "Prerequisite: Perfect Two-Weapon Fighting, Greater Two-Weapon Defense.",
    "body": "# Perfect Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Perfect Two-Weapon Fighting, Greater Two-Weapon Defense\n\n## Description\nImpenetrable defense while dual-wielding.\n\n## Mechanics & Benefit\nThe Shield bonus to Defense increases to **\\+4**.",
    "full_text": "# Perfect Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Perfect Two-Weapon Fighting, Greater Two-Weapon Defense\n\n## Description\nImpenetrable defense while dual-wielding.\n\n## Mechanics & Benefit\nThe Shield bonus to Defense increases to **\\+4**.",
    "mechanics": "The Shield bonus to Defense increases to **\\+4**.",
    "notes": "[Modifier] +4 Shield bonus to Defense\n[Rule] Prerequisite: Perfect Two-Weapon Fighting, Greater Two-Weapon Defense.\n[Prerequisite] Perfect Two-Weapon Fighting, Greater Two-Weapon Defense",
    "notesList": [
      "[Modifier] +4 Shield bonus to Defense",
      "[Rule] Prerequisite: Perfect Two-Weapon Fighting, Greater Two-Weapon Defense.",
      "[Prerequisite] Perfect Two-Weapon Fighting, Greater Two-Weapon Defense"
    ]
  },
  {
    "id": "combat-perfect-two-weapon-fighting",
    "name": "Perfect Two-Weapon Fighting",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 5, Combat Skill 16, Greater Two-Weapon Fighting",
    "prerequisite_text": "Agility 5, Combat Skill 16, Greater Two-Weapon Fighting",
    "modifiers": [
      {
        "target": "Penalty",
        "type": "skill",
        "value": -15,
        "mode": "penalty",
        "description": "-15 to Penalty"
      }
    ],
    "description": "Total mastery of dual-wielding.",
    "mechanic": "You gain a **fourth attack** with your off-hand weapon, at a **\\-15 penalty**.",
    "rules": "Prerequisite: Agility 5, Combat Skill 16, Greater Two-Weapon Fighting.",
    "special_rules": "Prerequisite: Agility 5, Combat Skill 16, Greater Two-Weapon Fighting.",
    "body": "# Perfect Two-Weapon Fighting\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 5, Combat Skill 16, Greater Two-Weapon Fighting\n\n## Description\nTotal mastery of dual-wielding.\n\n## Mechanics & Benefit\nYou gain a **fourth attack** with your off-hand weapon, at a **\\-15 penalty**.",
    "full_text": "# Perfect Two-Weapon Fighting\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 5, Combat Skill 16, Greater Two-Weapon Fighting\n\n## Description\nTotal mastery of dual-wielding.\n\n## Mechanics & Benefit\nYou gain a **fourth attack** with your off-hand weapon, at a **\\-15 penalty**.",
    "mechanics": "You gain a **fourth attack** with your off-hand weapon, at a **\\-15 penalty**.",
    "notes": "[Penalty] -15 to Penalty\n[Rule] Prerequisite: Agility 5, Combat Skill 16, Greater Two-Weapon Fighting.\n[Prerequisite] Agility 5, Combat Skill 16, Greater Two-Weapon Fighting",
    "notesList": [
      "[Penalty] -15 to Penalty",
      "[Rule] Prerequisite: Agility 5, Combat Skill 16, Greater Two-Weapon Fighting.",
      "[Prerequisite] Agility 5, Combat Skill 16, Greater Two-Weapon Fighting"
    ]
  },
  {
    "id": "combat-snatch-arrows",
    "name": "Snatch Arrows",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 4, Deflect Arrows",
    "prerequisite_text": "Agility 4, Deflect Arrows",
    "modifiers": [],
    "description": "The character can catch arrows, bolts, or thrown weapons out of the air.",
    "mechanic": "When using Deflect Arrows, if you have a free hand, you may catch the projectile instead of just deflecting it. You may immediately throw it back as a free attack (if it is a thrown weapon) or drop it.",
    "rules": "Prerequisite: Agility 4, Deflect Arrows.",
    "special_rules": "Prerequisite: Agility 4, Deflect Arrows.",
    "body": "# Snatch Arrows\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 4, Deflect Arrows\n\n## Description\nThe character can catch arrows, bolts, or thrown weapons out of the air.\n\n## Mechanics & Benefit\nWhen using Deflect Arrows, if you have a free hand, you may catch the projectile instead of just deflecting it. You may immediately throw it back as a free attack (if it is a thrown weapon) or drop it.",
    "full_text": "# Snatch Arrows\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 4, Deflect Arrows\n\n## Description\nThe character can catch arrows, bolts, or thrown weapons out of the air.\n\n## Mechanics & Benefit\nWhen using Deflect Arrows, if you have a free hand, you may catch the projectile instead of just deflecting it. You may immediately throw it back as a free attack (if it is a thrown weapon) or drop it.",
    "mechanics": "When using Deflect Arrows, if you have a free hand, you may catch the projectile instead of just deflecting it. You may immediately throw it back as a free attack (if it is a thrown weapon) or drop it.",
    "notes": "[Rule] Prerequisite: Agility 4, Deflect Arrows.\n[Prerequisite] Agility 4, Deflect Arrows",
    "notesList": [
      "[Rule] Prerequisite: Agility 4, Deflect Arrows.",
      "[Prerequisite] Agility 4, Deflect Arrows"
    ]
  },
  {
    "id": "combat-tech-interface",
    "name": "Tech Interface",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character possesses a specialized mental architecture or metaphysical link that allows them to bridge the gap between consciousness and advanced machinery. **Prerequisite:** Special (Character must have access to Meta-Tech, Psi-Tech, or Magi-Tech equipment). **Benefit:** You can pilot vehicles or operate computer systems using your Intellect score instead of Agility or other physical attributes, provided the device is appropriately designed with a neural or metaphysical interface. **Example:** A \"Technomancer\" with low physical coordination can pilot a starship or hack a high-security mainframe using their mind, performing actions with the speed of thought rather than manual dexterity. **Purpose:** To allow Intellect-focused characters to perform roles traditionally reliant on Agility, reflecting a seamless integration with complex systems. **Special:** This feature is \\[Multiple\\]. Each selection applies to a specific category of technology (e.g., Vehicles, Starships, or Network Systems). &nbsp;",
    "mechanic": "The character possesses a specialized mental architecture or metaphysical link that allows them to bridge the gap between consciousness and advanced machinery. **Prerequisite:** Special (Character must have access to Meta-Tech, Psi-Tech, or Magi-Tech equipment). **Benefit:** You can pilot vehicles or operate computer systems using your Intellect score instead of Agility or other physical attributes, provided the device is appropriately designed with a neural or metaphysical interface. **Example:** A \"Technomancer\" with low physical coordination can pilot a starship or hack a high-security mainframe using their mind, performing actions with the speed of thought rather than manual dexterity. **Purpose:** To allow Intellect-focused characters to perform roles traditionally reliant on Agility, reflecting a seamless integration with complex systems. **Special:** This feature is \\[Multiple\\]. Each selection applies to a specific category of technology (e.g., Vehicles, Starships, or Network Systems). &nbsp;",
    "rules": "Multiple selections allowed.",
    "special_rules": "Multiple selections allowed.",
    "body": "# Tech Interface\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses a specialized mental architecture or metaphysical link that allows them to bridge the gap between consciousness and advanced machinery. **Prerequisite:** Special (Character must have access to Meta-Tech, Psi-Tech, or Magi-Tech equipment). **Benefit:** You can pilot vehicles or operate computer systems using your Intellect score instead of Agility or other physical attributes, provided the device is appropriately designed with a neural or metaphysical interface. **Example:** A \"Technomancer\" with low physical coordination can pilot a starship or hack a high-security mainframe using their mind, performing actions with the speed of thought rather than manual dexterity. **Purpose:** To allow Intellect-focused characters to perform roles traditionally reliant on Agility, reflecting a seamless integration with complex systems. **Special:** This feature is \\[Multiple\\]. Each selection applies to a specific category of technology (e.g., Vehicles, Starships, or Network Systems). &nbsp;\n\n## Mechanics & Benefit\nThe character possesses a specialized mental architecture or metaphysical link that allows them to bridge the gap between consciousness and advanced machinery. **Prerequisite:** Special (Character must have access to Meta-Tech, Psi-Tech, or Magi-Tech equipment). **Benefit:** You can pilot vehicles or operate computer systems using your Intellect score instead of Agility or other physical attributes, provided the device is appropriately designed with a neural or metaphysical interface. **Example:** A \"Technomancer\" with low physical coordination can pilot a starship or hack a high-security mainframe using their mind, performing actions with the speed of thought rather than manual dexterity. **Purpose:** To allow Intellect-focused characters to perform roles traditionally reliant on Agility, reflecting a seamless integration with complex systems. **Special:** This feature is \\[Multiple\\]. Each selection applies to a specific category of technology (e.g., Vehicles, Starships, or Network Systems). &nbsp;",
    "full_text": "# Tech Interface\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses a specialized mental architecture or metaphysical link that allows them to bridge the gap between consciousness and advanced machinery. **Prerequisite:** Special (Character must have access to Meta-Tech, Psi-Tech, or Magi-Tech equipment). **Benefit:** You can pilot vehicles or operate computer systems using your Intellect score instead of Agility or other physical attributes, provided the device is appropriately designed with a neural or metaphysical interface. **Example:** A \"Technomancer\" with low physical coordination can pilot a starship or hack a high-security mainframe using their mind, performing actions with the speed of thought rather than manual dexterity. **Purpose:** To allow Intellect-focused characters to perform roles traditionally reliant on Agility, reflecting a seamless integration with complex systems. **Special:** This feature is \\[Multiple\\]. Each selection applies to a specific category of technology (e.g., Vehicles, Starships, or Network Systems). &nbsp;\n\n## Mechanics & Benefit\nThe character possesses a specialized mental architecture or metaphysical link that allows them to bridge the gap between consciousness and advanced machinery. **Prerequisite:** Special (Character must have access to Meta-Tech, Psi-Tech, or Magi-Tech equipment). **Benefit:** You can pilot vehicles or operate computer systems using your Intellect score instead of Agility or other physical attributes, provided the device is appropriately designed with a neural or metaphysical interface. **Example:** A \"Technomancer\" with low physical coordination can pilot a starship or hack a high-security mainframe using their mind, performing actions with the speed of thought rather than manual dexterity. **Purpose:** To allow Intellect-focused characters to perform roles traditionally reliant on Agility, reflecting a seamless integration with complex systems. **Special:** This feature is \\[Multiple\\]. Each selection applies to a specific category of technology (e.g., Vehicles, Starships, or Network Systems). &nbsp;",
    "mechanics": "The character possesses a specialized mental architecture or metaphysical link that allows them to bridge the gap between consciousness and advanced machinery. **Prerequisite:** Special (Character must have access to Meta-Tech, Psi-Tech, or Magi-Tech equipment). **Benefit:** You can pilot vehicles or operate computer systems using your Intellect score instead of Agility or other physical attributes, provided the device is appropriately designed with a neural or metaphysical interface. **Example:** A \"Technomancer\" with low physical coordination can pilot a starship or hack a high-security mainframe using their mind, performing actions with the speed of thought rather than manual dexterity. **Purpose:** To allow Intellect-focused characters to perform roles traditionally reliant on Agility, reflecting a seamless integration with complex systems. **Special:** This feature is \\[Multiple\\]. Each selection applies to a specific category of technology (e.g., Vehicles, Starships, or Network Systems). &nbsp;",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Two-Weapon Fighting",
    "prerequisite_text": "Two-Weapon Fighting",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 1,
        "mode": "inherent",
        "description": "+1 Defense"
      },
      {
        "target": "Shield bonus to Defense",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Shield bonus to Defense"
      }
    ],
    "description": "The character uses their off-hand weapon to parry and block.",
    "mechanic": "When wielding two weapons (or a double weapon), gain a **\\+1 Shield bonus to Defense**.",
    "rules": "Prerequisite: Two-Weapon Fighting.",
    "special_rules": "Prerequisite: Two-Weapon Fighting.",
    "body": "# Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Two-Weapon Fighting\n\n## Description\nThe character uses their off-hand weapon to parry and block.\n\n## Mechanics & Benefit\nWhen wielding two weapons (or a double weapon), gain a **\\+1 Shield bonus to Defense**.",
    "full_text": "# Two-Weapon Defense\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Two-Weapon Fighting\n\n## Description\nThe character uses their off-hand weapon to parry and block.\n\n## Mechanics & Benefit\nWhen wielding two weapons (or a double weapon), gain a **\\+1 Shield bonus to Defense**.",
    "mechanics": "When wielding two weapons (or a double weapon), gain a **\\+1 Shield bonus to Defense**.",
    "notes": "[Modifier] +1 Defense\n[Modifier] +1 to Shield bonus to Defense\n[Rule] Prerequisite: Two-Weapon Fighting.\n[Prerequisite] Two-Weapon Fighting",
    "notesList": [
      "[Modifier] +1 Defense",
      "[Modifier] +1 to Shield bonus to Defense",
      "[Rule] Prerequisite: Two-Weapon Fighting.",
      "[Prerequisite] Two-Weapon Fighting"
    ]
  },
  {
    "id": "combat-two-weapon-fighting",
    "name": "Two-Weapon Fighting",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 2, Combat Skill 2",
    "prerequisite_text": "Agility 2, Combat Skill 2",
    "modifiers": [
      {
        "target": "Strike",
        "type": "skill",
        "value": -2,
        "mode": "penalty",
        "description": "-2 to Strike"
      }
    ],
    "description": "The character is skilled in the art of using two weapons simultaneously, coordinating attacks to maintain offense while balancing defensive gaps.",
    "mechanic": "You suffer only a \\-2 penalty to Strike rolls when using an off-hand weapon (standard penalty is \\-4).  \n* **Purpose:** The foundation for all dual-wielding combat styles.",
    "rules": "Prerequisite: Agility 2, Combat Skill 2.",
    "special_rules": "Prerequisite: Agility 2, Combat Skill 2.",
    "body": "# Two-Weapon Fighting\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2, Combat Skill 2\n\n## Description\nThe character is skilled in the art of using two weapons simultaneously, coordinating attacks to maintain offense while balancing defensive gaps.\n\n## Mechanics & Benefit\nYou suffer only a \\-2 penalty to Strike rolls when using an off-hand weapon (standard penalty is \\-4).  \n* **Purpose:** The foundation for all dual-wielding combat styles.",
    "full_text": "# Two-Weapon Fighting\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2, Combat Skill 2\n\n## Description\nThe character is skilled in the art of using two weapons simultaneously, coordinating attacks to maintain offense while balancing defensive gaps.\n\n## Mechanics & Benefit\nYou suffer only a \\-2 penalty to Strike rolls when using an off-hand weapon (standard penalty is \\-4).  \n* **Purpose:** The foundation for all dual-wielding combat styles.",
    "mechanics": "You suffer only a \\-2 penalty to Strike rolls when using an off-hand weapon (standard penalty is \\-4).  \n* **Purpose:** The foundation for all dual-wielding combat styles.",
    "notes": "[Penalty] -2 to Strike\n[Rule] Prerequisite: Agility 2, Combat Skill 2.\n[Prerequisite] Agility 2, Combat Skill 2",
    "notesList": [
      "[Penalty] -2 to Strike",
      "[Rule] Prerequisite: Agility 2, Combat Skill 2.",
      "[Prerequisite] Agility 2, Combat Skill 2"
    ]
  },
  {
    "id": "combat-uncanny-dodge",
    "name": "Uncanny Dodge",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 4",
    "prerequisite_text": "Agility 4",
    "modifiers": [],
    "description": "The character reacts to danger before their senses fully process it.",
    "mechanic": "You retain your **Agility bonus to Defense** even if you are caught **Flat-Footed** or struck by an **Invisible attacker**.",
    "rules": "This does not negate the advantage an attacker gets from Feinting (see Greater Feint).",
    "special_rules": "This does not negate the advantage an attacker gets from Feinting (see Greater Feint).",
    "body": "# Uncanny Dodge\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 4\n\n## Description\nThe character reacts to danger before their senses fully process it.\n\n## Mechanics & Benefit\nYou retain your **Agility bonus to Defense** even if you are caught **Flat-Footed** or struck by an **Invisible attacker**.\n\n## Special Rules\nThis does not negate the advantage an attacker gets from Feinting (see Greater Feint).",
    "full_text": "# Uncanny Dodge\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 4\n\n## Description\nThe character reacts to danger before their senses fully process it.\n\n## Mechanics & Benefit\nYou retain your **Agility bonus to Defense** even if you are caught **Flat-Footed** or struck by an **Invisible attacker**.\n\n## Special Rules\nThis does not negate the advantage an attacker gets from Feinting (see Greater Feint).",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Combat Skill 6",
    "prerequisite_text": "Combat Skill 6",
    "modifiers": [],
    "description": "The character makes a single, devastatingly accurate attack rather than a flurry of blows.",
    "mechanic": "As a **Standard Action**, make a single attack at your highest bonus. If it hits, deal **two times (2x)** the weapon's damage dice.",
    "rules": "**Note:** Only the dice are multiplied, not the static bonuses (Strength, specialization, etc.).",
    "special_rules": "**Note:** Only the dice are multiplied, not the static bonuses (Strength, specialization, etc.).",
    "body": "# Vital Strike\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Skill 6\n\n## Description\nThe character makes a single, devastatingly accurate attack rather than a flurry of blows.\n\n## Mechanics & Benefit\nAs a **Standard Action**, make a single attack at your highest bonus. If it hits, deal **two times (2x)** the weapon's damage dice.\n\n## Special Rules\n**Note:** Only the dice are multiplied, not the static bonuses (Strength, specialization, etc.).",
    "full_text": "# Vital Strike\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Skill 6\n\n## Description\nThe character makes a single, devastatingly accurate attack rather than a flurry of blows.\n\n## Mechanics & Benefit\nAs a **Standard Action**, make a single attack at your highest bonus. If it hits, deal **two times (2x)** the weapon's damage dice.\n\n## Special Rules\n**Note:** Only the dice are multiplied, not the static bonuses (Strength, specialization, etc.).",
    "mechanics": "As a **Standard Action**, make a single attack at your highest bonus. If it hits, deal **two times (2x)** the weapon's damage dice.",
    "notes": "[Rule] **Note:** Only the dice are multiplied, not the static bonuses (Strength, specialization, etc.).\n[Prerequisite] Combat Skill 6",
    "notesList": [
      "[Rule] **Note:** Only the dice are multiplied, not the static bonuses (Strength, specialization, etc.).",
      "[Prerequisite] Combat Skill 6"
    ]
  },
  {
    "id": "combat-weapon-focus",
    "name": "Weapon Focus",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Combat Skill 1",
    "prerequisite_text": "Combat Skill 1",
    "modifiers": [
      {
        "target": "armor-dr",
        "type": "combat",
        "value": 1,
        "mode": "inherent",
        "description": "+1 DR"
      },
      {
        "target": "Strike with that weapon",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Strike with that weapon"
      },
      {
        "target": "Bleed damage",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Bleed damage"
      },
      {
        "target": "Stun CR",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Stun CR"
      }
    ],
    "description": "Extensive training with a specific weapon type (e.g., Laser Rifle, Longsword, Plasma Pistol).",
    "mechanic": "Choose a specific weapon. You gain **\\+1 to Strike** with that weapon.  \n* **Secondary Effect:** You also gain a specialized perk based on the weapon's damage type:  \n  * **Piercing:** \\+1 Penetration (ignores 1 DR).  \n  * **Slashing:** \\+1 Bleed damage.  \n  * **Bludgeoning:** \\+1 to Stun CR.",
    "rules": "\\[Multiple\\] May be taken for different weapons.",
    "special_rules": "\\[Multiple\\] May be taken for different weapons.",
    "body": "# Weapon Focus\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Skill 1\n\n## Description\nExtensive training with a specific weapon type (e.g., Laser Rifle, Longsword, Plasma Pistol).\n\n## Mechanics & Benefit\nChoose a specific weapon. You gain **\\+1 to Strike** with that weapon.  \n* **Secondary Effect:** You also gain a specialized perk based on the weapon's damage type:  \n  * **Piercing:** \\+1 Penetration (ignores 1 DR).  \n  * **Slashing:** \\+1 Bleed damage.  \n  * **Bludgeoning:** \\+1 to Stun CR.\n\n## Special Rules\n\\[Multiple\\] May be taken for different weapons.",
    "full_text": "# Weapon Focus\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Combat Skill 1\n\n## Description\nExtensive training with a specific weapon type (e.g., Laser Rifle, Longsword, Plasma Pistol).\n\n## Mechanics & Benefit\nChoose a specific weapon. You gain **\\+1 to Strike** with that weapon.  \n* **Secondary Effect:** You also gain a specialized perk based on the weapon's damage type:  \n  * **Piercing:** \\+1 Penetration (ignores 1 DR).  \n  * **Slashing:** \\+1 Bleed damage.  \n  * **Bludgeoning:** \\+1 to Stun CR.\n\n## Special Rules\n\\[Multiple\\] May be taken for different weapons.",
    "mechanics": "Choose a specific weapon. You gain **\\+1 to Strike** with that weapon.  \n* **Secondary Effect:** You also gain a specialized perk based on the weapon's damage type:  \n  * **Piercing:** \\+1 Penetration (ignores 1 DR).  \n  * **Slashing:** \\+1 Bleed damage.  \n  * **Bludgeoning:** \\+1 to Stun CR.",
    "notes": "[Modifier] +1 DR\n[Modifier] +1 to Strike with that weapon\n[Modifier] +1 to Bleed damage\n[Modifier] +1 to Stun CR\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Multiple\\] May be taken for different weapons.\n[Prerequisite] Combat Skill 1",
    "notesList": [
      "[Modifier] +1 DR",
      "[Modifier] +1 to Strike with that weapon",
      "[Modifier] +1 to Bleed damage",
      "[Modifier] +1 to Stun CR",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character is dangerous with anything—a bottle, a chair, or a rock.",
    "mechanic": "You suffer **no penalties** for using improvised Archaic weapons (normally \\-4).  \n* **Purpose:** Allows use of the environment as effective weaponry without training in specific weapon groups.\n\n---\n\n&nbsp;",
    "rules": "",
    "special_rules": "",
    "body": "# Weapon Improvisation\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is dangerous with anything—a bottle, a chair, or a rock.\n\n## Mechanics & Benefit\nYou suffer **no penalties** for using improvised Archaic weapons (normally \\-4).  \n* **Purpose:** Allows use of the environment as effective weaponry without training in specific weapon groups.\n\n---\n\n&nbsp;",
    "full_text": "# Weapon Improvisation\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is dangerous with anything—a bottle, a chair, or a rock.\n\n## Mechanics & Benefit\nYou suffer **no penalties** for using improvised Archaic weapons (normally \\-4).  \n* **Purpose:** Allows use of the environment as effective weaponry without training in specific weapon groups.\n\n---\n\n&nbsp;",
    "mechanics": "You suffer **no penalties** for using improvised Archaic weapons (normally \\-4).  \n* **Purpose:** Allows use of the environment as effective weaponry without training in specific weapon groups.\n\n---\n\n&nbsp;",
    "notes": "",
    "notesList": []
  },
  {
    "id": "combat-weapon-specialization",
    "name": "Weapon Specialization",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Weapon Focus (in chosen weapon), Combat Skill 6",
    "prerequisite_text": "Weapon Focus (in chosen weapon), Combat Skill 6",
    "modifiers": [
      {
        "target": "Die of Damage with the chosen weapon",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Die of Damage with the chosen weapon"
      },
      {
        "target": "Static",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Static"
      }
    ],
    "description": "The character knows how to inflict maximum damage with their chosen weapon.",
    "mechanic": "Gain **\\+1 Die of Damage** with the chosen weapon. (e.g., A 2d6 weapon becomes 3d6).",
    "rules": "\\[Multiple\\] This bonus is significantly stronger than standard d20 (+2 static), reflecting the Tangent system's damage scaling.",
    "special_rules": "\\[Multiple\\] This bonus is significantly stronger than standard d20 (+2 static), reflecting the Tangent system's damage scaling.",
    "body": "# Weapon Specialization\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Weapon Focus (in chosen weapon), Combat Skill 6\n\n## Description\nThe character knows how to inflict maximum damage with their chosen weapon.\n\n## Mechanics & Benefit\nGain **\\+1 Die of Damage** with the chosen weapon. (e.g., A 2d6 weapon becomes 3d6).\n\n## Special Rules\n\\[Multiple\\] This bonus is significantly stronger than standard d20 (+2 static), reflecting the Tangent system's damage scaling.",
    "full_text": "# Weapon Specialization\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Weapon Focus (in chosen weapon), Combat Skill 6\n\n## Description\nThe character knows how to inflict maximum damage with their chosen weapon.\n\n## Mechanics & Benefit\nGain **\\+1 Die of Damage** with the chosen weapon. (e.g., A 2d6 weapon becomes 3d6).\n\n## Special Rules\n\\[Multiple\\] This bonus is significantly stronger than standard d20 (+2 static), reflecting the Tangent system's damage scaling.",
    "mechanics": "Gain **\\+1 Die of Damage** with the chosen weapon. (e.g., A 2d6 weapon becomes 3d6).",
    "notes": "[Modifier] +1 to Die of Damage with the chosen weapon\n[Modifier] +2 to Static\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Multiple\\] This bonus is significantly stronger than standard d20 (+2 static), reflecting the Tang...\n[Prerequisite] Weapon Focus (in chosen weapon), Combat Skill 6",
    "notesList": [
      "[Modifier] +1 to Die of Damage with the chosen weapon",
      "[Modifier] +2 to Static",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] \\[Multiple\\] This bonus is significantly stronger than standard d20 (+2 static), reflecting the Tang...",
      "[Prerequisite] Weapon Focus (in chosen weapon), Combat Skill 6"
    ]
  },
  {
    "id": "combat-whirlwind-attack",
    "name": "Whirlwind Attack",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 2, Combat Expertise, Blitz Attack (Spring Attack)",
    "prerequisite_text": "Agility 2, Combat Expertise, Blitz Attack (Spring Attack)",
    "modifiers": [],
    "description": "A spinning dance of death that strikes everyone nearby.",
    "mechanic": "As a **Full Round Action**, you may make one melee attack against **every** foe within your reach.",
    "rules": "You forfeit any bonus attacks from high skill or other features when using this action; you make one strike per target.",
    "special_rules": "You forfeit any bonus attacks from high skill or other features when using this action; you make one strike per target.",
    "body": "# Whirlwind Attack\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2, Combat Expertise, Blitz Attack (Spring Attack)\n\n## Description\nA spinning dance of death that strikes everyone nearby.\n\n## Mechanics & Benefit\nAs a **Full Round Action**, you may make one melee attack against **every** foe within your reach.\n\n## Special Rules\nYou forfeit any bonus attacks from high skill or other features when using this action; you make one strike per target.",
    "full_text": "# Whirlwind Attack\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2, Combat Expertise, Blitz Attack (Spring Attack)\n\n## Description\nA spinning dance of death that strikes everyone nearby.\n\n## Mechanics & Benefit\nAs a **Full Round Action**, you may make one melee attack against **every** foe within your reach.\n\n## Special Rules\nYou forfeit any bonus attacks from high skill or other features when using this action; you make one strike per target.",
    "mechanics": "As a **Full Round Action**, you may make one melee attack against **every** foe within your reach.",
    "notes": "[Rule] You forfeit any bonus attacks from high skill or other features when using this action; you make one...\n[Prerequisite] Agility 2, Combat Expertise, Blitz Attack (Spring Attack)",
    "notesList": [
      "[Rule] You forfeit any bonus attacks from high skill or other features when using this action; you make one...",
      "[Prerequisite] Agility 2, Combat Expertise, Blitz Attack (Spring Attack)"
    ]
  },
  {
    "id": "discipline-aptitude",
    "name": "Aptitude",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Key Ability Score (Intellect, Wisdom, or Charisma) 1+",
    "prerequisite_text": "Key Ability Score (Intellect, Wisdom, or Charisma) 1+",
    "modifiers": [],
    "description": "The character possesses a natural affinity for specific metaphysical interactions, grasping the nuance of shaping energy more intuitively than others.",
    "mechanic": "Choose two specific **Discipline Skills** (e.g., *Thermal* and *Telekinetic*, or *Biomancy* and *Necromancy*). You gain a **\\+2 Bonus** to checks with those specific skills.  \n* **Purpose:** To demonstrate innate talent in specific areas of magic or psionics without necessarily having broad mastery.",
    "rules": "This feature is **\\[Multiple\\]**. It may be selected again to apply to two different Discipline skills.",
    "special_rules": "This feature is **\\[Multiple\\]**. It may be selected again to apply to two different Discipline skills.",
    "body": "# Aptitude\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Key Ability Score (Intellect, Wisdom, or Charisma) 1+\n\n## Description\nThe character possesses a natural affinity for specific metaphysical interactions, grasping the nuance of shaping energy more intuitively than others.\n\n## Mechanics & Benefit\nChoose two specific **Discipline Skills** (e.g., *Thermal* and *Telekinetic*, or *Biomancy* and *Necromancy*). You gain a **\\+2 Bonus** to checks with those specific skills.  \n* **Purpose:** To demonstrate innate talent in specific areas of magic or psionics without necessarily having broad mastery.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. It may be selected again to apply to two different Discipline skills.",
    "full_text": "# Aptitude\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Key Ability Score (Intellect, Wisdom, or Charisma) 1+\n\n## Description\nThe character possesses a natural affinity for specific metaphysical interactions, grasping the nuance of shaping energy more intuitively than others.\n\n## Mechanics & Benefit\nChoose two specific **Discipline Skills** (e.g., *Thermal* and *Telekinetic*, or *Biomancy* and *Necromancy*). You gain a **\\+2 Bonus** to checks with those specific skills.  \n* **Purpose:** To demonstrate innate talent in specific areas of magic or psionics without necessarily having broad mastery.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. It may be selected again to apply to two different Discipline skills.",
    "mechanics": "Choose two specific **Discipline Skills** (e.g., *Thermal* and *Telekinetic*, or *Biomancy* and *Necromancy*). You gain a **\\+2 Bonus** to checks with those specific skills.  \n* **Purpose:** To demonstrate innate talent in specific areas of magic or psionics without necessarily having broad mastery.",
    "notes": "[Modifier] +2 to Checks with those specific\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]**. It may be selected again to apply to two different Discipline skil...\n[Prerequisite] Key Ability Score (Intellect, Wisdom, or Charisma) 1+",
    "notesList": [
      "[Modifier] +2 to Checks with those specific",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]**. It may be selected again to apply to two different Discipline skil...",
      "[Prerequisite] Key Ability Score (Intellect, Wisdom, or Charisma) 1+"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "meta_dimension",
        "meta_energy",
        "meta_entropy",
        "meta_illusion",
        "meta_matter",
        "meta_mental"
      ],
      "group_label": "Discipline Skills",
      "max_skills": 2,
      "value": 2
    }
  },
  {
    "id": "discipline-awakened",
    "name": "Awakened",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "None (often taken at Character Creation).",
    "prerequisite_text": "None (often taken at Character Creation).",
    "modifiers": [],
    "description": "The character has opened their mind or soul to a greater reality. This is the fundamental \"spark\" required to use any form of metaphysics. Without this feature, a character cannot manipulate supernatural forces.",
    "mechanic": "You gain access to the **Attune** skill (the universal skill for channeling power) and **2 Discipline Skills** belonging to a specific **Metafocus Discipline** (e.g., Dimension, Energy, Entropy, Illusion, Matter, or Mental).  \n  * *Example:* Selecting *Awakened (Energy)* might grant access to *Attune*, *Elemental Focus*, and *Force Focus*.  \n* **Purpose:** The entry point for all mages, psychics, and super-powered beings.",
    "rules": "This feature is **\\[Multiple\\]**. Taking it a second time allows you to awaken a different Metafocus (e.g., adding *Entropy* to a character who already has *Energy*), granting access to that discipline's specific skills.",
    "special_rules": "This feature is **\\[Multiple\\]**. Taking it a second time allows you to awaken a different Metafocus (e.g., adding *Entropy* to a character who already has *Energy*), granting access to that discipline's specific skills.",
    "body": "# Awakened\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None (often taken at Character Creation).\n\n## Description\nThe character has opened their mind or soul to a greater reality. This is the fundamental \"spark\" required to use any form of metaphysics. Without this feature, a character cannot manipulate supernatural forces.\n\n## Mechanics & Benefit\nYou gain access to the **Attune** skill (the universal skill for channeling power) and **2 Discipline Skills** belonging to a specific **Metafocus Discipline** (e.g., Dimension, Energy, Entropy, Illusion, Matter, or Mental).  \n  * *Example:* Selecting *Awakened (Energy)* might grant access to *Attune*, *Elemental Focus*, and *Force Focus*.  \n* **Purpose:** The entry point for all mages, psychics, and super-powered beings.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. Taking it a second time allows you to awaken a different Metafocus (e.g., adding *Entropy* to a character who already has *Energy*), granting access to that discipline's specific skills.",
    "full_text": "# Awakened\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None (often taken at Character Creation).\n\n## Description\nThe character has opened their mind or soul to a greater reality. This is the fundamental \"spark\" required to use any form of metaphysics. Without this feature, a character cannot manipulate supernatural forces.\n\n## Mechanics & Benefit\nYou gain access to the **Attune** skill (the universal skill for channeling power) and **2 Discipline Skills** belonging to a specific **Metafocus Discipline** (e.g., Dimension, Energy, Entropy, Illusion, Matter, or Mental).  \n  * *Example:* Selecting *Awakened (Energy)* might grant access to *Attune*, *Elemental Focus*, and *Force Focus*.  \n* **Purpose:** The entry point for all mages, psychics, and super-powered beings.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. Taking it a second time allows you to awaken a different Metafocus (e.g., adding *Entropy* to a character who already has *Energy*), granting access to that discipline's specific skills.",
    "mechanics": "You gain access to the **Attune** skill (the universal skill for channeling power) and **2 Discipline Skills** belonging to a specific **Metafocus Discipline** (e.g., Dimension, Energy, Entropy, Illusion, Matter, or Mental).  \n  * *Example:* Selecting *Awakened (Energy)* might grant access to *Attune*, *Elemental Focus*, and *Force Focus*.  \n* **Purpose:** The entry point for all mages, psychics, and super-powered beings.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]**. Taking it a second time allows you to awaken a different Metafocus...\n[Prerequisite] None (often taken at Character Creation).",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]**. Taking it a second time allows you to awaken a different Metafocus...",
      "[Prerequisite] None (often taken at Character Creation)."
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "meta_dimension",
        "meta_energy",
        "meta_entropy",
        "meta_illusion",
        "meta_matter",
        "meta_mental"
      ],
      "group_label": "Discipline Skills",
      "max_skills": 2,
      "value": 2
    }
  },
  {
    "id": "discipline-balanced-center",
    "name": "Balanced Center",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Centering Expert, Discipline Expertise (in all currently used Disciplines)",
    "prerequisite_text": "Centering Expert, Discipline Expertise (in all currently used Disciplines)",
    "modifiers": [
      {
        "target": "Discipline",
        "type": "take_10",
        "value": 10,
        "mode": "competence",
        "isSituational": true,
        "condition": "In combat",
        "description": "May Take 10 on all Expertised Discipline skill checks in combat"
      }
    ],
    "description": "The character has achieved a perfect equilibrium between the channeling of power (Attune) and the shaping of it (Discipline).",
    "mechanic": "You may **Take 10** on **Discipline Skill Checks** even when threatened, distracted, or in combat.  \n* **Purpose:** Guarantees consistent Damage or Effect results. You no longer roll for power; you simply apply a reliable standard of devastation.",
    "rules": "Prerequisite: Centering Expert, Discipline Expertise (in all currently used Disciplines).",
    "special_rules": "Prerequisite: Centering Expert, Discipline Expertise (in all currently used Disciplines).",
    "body": "# Balanced Center\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Centering Expert, Discipline Expertise (in all currently used Disciplines)\n\n## Description\nThe character has achieved a perfect equilibrium between the channeling of power (Attune) and the shaping of it (Discipline).\n\n## Mechanics & Benefit\nYou may **Take 10** on **Discipline Skill Checks** even when threatened, distracted, or in combat.  \n* **Purpose:** Guarantees consistent Damage or Effect results. You no longer roll for power; you simply apply a reliable standard of devastation.",
    "full_text": "# Balanced Center\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Centering Expert, Discipline Expertise (in all currently used Disciplines)\n\n## Description\nThe character has achieved a perfect equilibrium between the channeling of power (Attune) and the shaping of it (Discipline).\n\n## Mechanics & Benefit\nYou may **Take 10** on **Discipline Skill Checks** even when threatened, distracted, or in combat.  \n* **Purpose:** Guarantees consistent Damage or Effect results. You no longer roll for power; you simply apply a reliable standard of devastation.",
    "mechanics": "You may **Take 10** on **Discipline Skill Checks** even when threatened, distracted, or in combat.  \n* **Purpose:** Guarantees consistent Damage or Effect results. You no longer roll for power; you simply apply a reliable standard of devastation.",
    "notes": "[Modifier] May Take 10 on all Expertised Discipline skill checks in combat\n[Rule] Prerequisite: Centering Expert, Discipline Expertise (in all currently used Disciplines).\n[Prerequisite] Centering Expert, Discipline Expertise (in all currently used Disciplines)",
    "notesList": [
      "[Modifier] May Take 10 on all Expertised Discipline skill checks in combat",
      "[Rule] Prerequisite: Centering Expert, Discipline Expertise (in all currently used Disciplines).",
      "[Prerequisite] Centering Expert, Discipline Expertise (in all currently used Disciplines)"
    ]
  },
  {
    "id": "discipline-centering",
    "name": "Centering",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Attune 6 (Trained), Key Ability Score 2",
    "prerequisite_text": "Attune 6 (Trained), Key Ability Score 2",
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
    "mechanic": "You gain a **\\+2 Bonus** to all **Attune Checks**.  \n* **Mechanics:** In Tangent, the **Attune Check** determines the **Challenge Rating (CR)** of the Saving Throw your targets must make. Therefore, this feature directly increases the difficulty of resisting your powers.  \n* **Purpose:** Essential for casters who want their spells to be difficult to resist.",
    "rules": "Prerequisite: Attune 6 (Trained), Key Ability Score 2.",
    "special_rules": "Prerequisite: Attune 6 (Trained), Key Ability Score 2.",
    "body": "# Centering\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Attune 6 (Trained), Key Ability Score 2\n\n## Description\nThe character has learned to stabilize their internal flow of energy, allowing them to channel power with greater control and intensity.\n\n## Mechanics & Benefit\nYou gain a **\\+2 Bonus** to all **Attune Checks**.  \n* **Mechanics:** In Tangent, the **Attune Check** determines the **Challenge Rating (CR)** of the Saving Throw your targets must make. Therefore, this feature directly increases the difficulty of resisting your powers.  \n* **Purpose:** Essential for casters who want their spells to be difficult to resist.",
    "full_text": "# Centering\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Attune 6 (Trained), Key Ability Score 2\n\n## Description\nThe character has learned to stabilize their internal flow of energy, allowing them to channel power with greater control and intensity.\n\n## Mechanics & Benefit\nYou gain a **\\+2 Bonus** to all **Attune Checks**.  \n* **Mechanics:** In Tangent, the **Attune Check** determines the **Challenge Rating (CR)** of the Saving Throw your targets must make. Therefore, this feature directly increases the difficulty of resisting your powers.  \n* **Purpose:** Essential for casters who want their spells to be difficult to resist.",
    "mechanics": "You gain a **\\+2 Bonus** to all **Attune Checks**.  \n* **Mechanics:** In Tangent, the **Attune Check** determines the **Challenge Rating (CR)** of the Saving Throw your targets must make. Therefore, this feature directly increases the difficulty of resisting your powers.  \n* **Purpose:** Essential for casters who want their spells to be difficult to resist.",
    "notes": "[Modifier] +2 to Attune\n[Rule] Prerequisite: Attune 6 (Trained), Key Ability Score 2.\n[Prerequisite] Attune 6 (Trained), Key Ability Score 2",
    "notesList": [
      "[Modifier] +2 to Attune",
      "[Rule] Prerequisite: Attune 6 (Trained), Key Ability Score 2.",
      "[Prerequisite] Attune 6 (Trained), Key Ability Score 2"
    ]
  },
  {
    "id": "discipline-centering-expert",
    "name": "Centering Expert",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Centering, Attune 11 (Expert), Key Ability Score 4",
    "prerequisite_text": "Centering, Attune 11 (Expert), Key Ability Score 4",
    "modifiers": [
      {
        "target": "meta-attune",
        "type": "skill",
        "value": 4,
        "mode": "competence",
        "description": "+4 to Attune Checks (Affecting DCs)"
      }
    ],
    "description": "The character has achieved a profound state of mental or spiritual equilibrium.",
    "mechanic": "The bonus to **Attune Checks** increases to **\\+4**.",
    "rules": "This replaces the bonus from *Centering*, it does not stack (it is an upgrade).",
    "special_rules": "This replaces the bonus from *Centering*, it does not stack (it is an upgrade).",
    "body": "# Centering Expert\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Centering, Attune 11 (Expert), Key Ability Score 4\n\n## Description\nThe character has achieved a profound state of mental or spiritual equilibrium.\n\n## Mechanics & Benefit\nThe bonus to **Attune Checks** increases to **\\+4**.\n\n## Special Rules\nThis replaces the bonus from *Centering*, it does not stack (it is an upgrade).",
    "full_text": "# Centering Expert\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Centering, Attune 11 (Expert), Key Ability Score 4\n\n## Description\nThe character has achieved a profound state of mental or spiritual equilibrium.\n\n## Mechanics & Benefit\nThe bonus to **Attune Checks** increases to **\\+4**.\n\n## Special Rules\nThis replaces the bonus from *Centering*, it does not stack (it is an upgrade).",
    "mechanics": "The bonus to **Attune Checks** increases to **\\+4**.",
    "notes": "[Modifier] +4 to Attune Checks (Affecting DCs)\n[Rule] This replaces the bonus from *Centering*, it does not stack (it is an upgrade).\n[Prerequisite] Centering, Attune 11 (Expert), Key Ability Score 4",
    "notesList": [
      "[Modifier] +4 to Attune Checks (Affecting DCs)",
      "[Rule] This replaces the bonus from *Centering*, it does not stack (it is an upgrade).",
      "[Prerequisite] Centering, Attune 11 (Expert), Key Ability Score 4"
    ]
  },
  {
    "id": "discipline-centering-master",
    "name": "Centering Master",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Centering Expert, Attune 16 (Master), Key Ability Score 6",
    "prerequisite_text": "Centering Expert, Attune 16 (Master), Key Ability Score 6",
    "modifiers": [
      {
        "target": "meta-attune",
        "type": "skill",
        "value": 6,
        "mode": "competence",
        "description": "+6 to Attune Checks (Affecting DCs)"
      }
    ],
    "description": "The character's control over their metaphysical connection is absolute; they are a conduit through which power flows without resistance.",
    "mechanic": "The bonus to **Attune Checks** increases to **\\+6**.",
    "rules": "Prerequisite: Centering Expert, Attune 16 (Master), Key Ability Score 6.",
    "special_rules": "Prerequisite: Centering Expert, Attune 16 (Master), Key Ability Score 6.",
    "body": "# Centering Master\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Centering Expert, Attune 16 (Master), Key Ability Score 6\n\n## Description\nThe character's control over their metaphysical connection is absolute; they are a conduit through which power flows without resistance.\n\n## Mechanics & Benefit\nThe bonus to **Attune Checks** increases to **\\+6**.",
    "full_text": "# Centering Master\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Centering Expert, Attune 16 (Master), Key Ability Score 6\n\n## Description\nThe character's control over their metaphysical connection is absolute; they are a conduit through which power flows without resistance.\n\n## Mechanics & Benefit\nThe bonus to **Attune Checks** increases to **\\+6**.",
    "mechanics": "The bonus to **Attune Checks** increases to **\\+6**.",
    "notes": "[Modifier] +6 to Attune Checks (Affecting DCs)\n[Rule] Prerequisite: Centering Expert, Attune 16 (Master), Key Ability Score 6.\n[Prerequisite] Centering Expert, Attune 16 (Master), Key Ability Score 6",
    "notesList": [
      "[Modifier] +6 to Attune Checks (Affecting DCs)",
      "[Rule] Prerequisite: Centering Expert, Attune 16 (Master), Key Ability Score 6.",
      "[Prerequisite] Centering Expert, Attune 16 (Master), Key Ability Score 6"
    ]
  },
  {
    "id": "discipline-discipline-empower",
    "name": "Discipline Empower",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Discipline Focus, Attune 6",
    "prerequisite_text": "Discipline Focus, Attune 6",
    "modifiers": [
      {
        "target": "The effective",
        "type": "skill",
        "value": 5,
        "mode": "inherent",
        "description": "+5 to The effective"
      }
    ],
    "description": "The character can hold and build a metaphysical charge over time, gathering ambient energy to unleash a single, overwhelming effect.",
    "mechanic": "You may increase the casting time of an Invocation to gather more energy. For every **Full Round** spent channeling (doing nothing but concentrating on the spell), you add **\\+1 Effect Die** (or \\+5 to the effective Skill Check result for non-damage spells) to the final release.  \n* **Limit:** You may channel for a number of rounds equal to your Constitution or Will modifier (whichever is higher). If interrupted (taking damage), you must make a Concentration (Attune) check or lose the energy.",
    "rules": "Prerequisite: Discipline Focus, Attune 6.",
    "special_rules": "Prerequisite: Discipline Focus, Attune 6.",
    "body": "# Discipline Empower\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Discipline Focus, Attune 6\n\n## Description\nThe character can hold and build a metaphysical charge over time, gathering ambient energy to unleash a single, overwhelming effect.\n\n## Mechanics & Benefit\nYou may increase the casting time of an Invocation to gather more energy. For every **Full Round** spent channeling (doing nothing but concentrating on the spell), you add **\\+1 Effect Die** (or \\+5 to the effective Skill Check result for non-damage spells) to the final release.  \n* **Limit:** You may channel for a number of rounds equal to your Constitution or Will modifier (whichever is higher). If interrupted (taking damage), you must make a Concentration (Attune) check or lose the energy.",
    "full_text": "# Discipline Empower\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Discipline Focus, Attune 6\n\n## Description\nThe character can hold and build a metaphysical charge over time, gathering ambient energy to unleash a single, overwhelming effect.\n\n## Mechanics & Benefit\nYou may increase the casting time of an Invocation to gather more energy. For every **Full Round** spent channeling (doing nothing but concentrating on the spell), you add **\\+1 Effect Die** (or \\+5 to the effective Skill Check result for non-damage spells) to the final release.  \n* **Limit:** You may channel for a number of rounds equal to your Constitution or Will modifier (whichever is higher). If interrupted (taking damage), you must make a Concentration (Attune) check or lose the energy.",
    "mechanics": "You may increase the casting time of an Invocation to gather more energy. For every **Full Round** spent channeling (doing nothing but concentrating on the spell), you add **\\+1 Effect Die** (or \\+5 to the effective Skill Check result for non-damage spells) to the final release.  \n* **Limit:** You may channel for a number of rounds equal to your Constitution or Will modifier (whichever is higher). If interrupted (taking damage), you must make a Concentration (Attune) check or lose the energy.",
    "notes": "[Modifier] +5 to The effective\n[Rule] Prerequisite: Discipline Focus, Attune 6.\n[Prerequisite] Discipline Focus, Attune 6",
    "notesList": [
      "[Modifier] +5 to The effective",
      "[Rule] Prerequisite: Discipline Focus, Attune 6.",
      "[Prerequisite] Discipline Focus, Attune 6"
    ]
  },
  {
    "id": "discipline-discipline-expertise",
    "name": "Discipline Expertise",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Discipline Focus (in the same skill), Discipline Skill 11 (Expert)",
    "prerequisite_text": "Discipline Focus (in the same skill), Discipline Skill 11 (Expert)",
    "modifiers": [],
    "description": "The character has mastered the nuances of a specific energy form.",
    "mechanic": "The bonus to the chosen Discipline Skill increases to **\\+4**.",
    "rules": "Prerequisite: Discipline Focus (in the same skill), Discipline Skill 11 (Expert).",
    "special_rules": "Prerequisite: Discipline Focus (in the same skill), Discipline Skill 11 (Expert).",
    "body": "# Discipline Expertise\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Discipline Focus (in the same skill), Discipline Skill 11 (Expert)\n\n## Description\nThe character has mastered the nuances of a specific energy form.\n\n## Mechanics & Benefit\nThe bonus to the chosen Discipline Skill increases to **\\+4**.",
    "full_text": "# Discipline Expertise\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Discipline Focus (in the same skill), Discipline Skill 11 (Expert)\n\n## Description\nThe character has mastered the nuances of a specific energy form.\n\n## Mechanics & Benefit\nThe bonus to the chosen Discipline Skill increases to **\\+4**.",
    "mechanics": "The bonus to the chosen Discipline Skill increases to **\\+4**.",
    "notes": "[Modifier] +4 with chosen Discipline Skill (Affecting Severity)\n[Rule] Prerequisite: Discipline Focus (in the same skill), Discipline Skill 11 (Expert).\n[Prerequisite] Discipline Focus (in the same skill), Discipline Skill 11 (Expert)",
    "notesList": [
      "[Modifier] +4 with chosen Discipline Skill (Affecting Severity)",
      "[Rule] Prerequisite: Discipline Focus (in the same skill), Discipline Skill 11 (Expert).",
      "[Prerequisite] Discipline Focus (in the same skill), Discipline Skill 11 (Expert)"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "meta_dimension",
        "meta_energy",
        "meta_entropy",
        "meta_illusion",
        "meta_matter",
        "meta_mental"
      ],
      "group_label": "Discipline Skills",
      "max_skills": 1,
      "value": 4
    }
  },
  {
    "id": "discipline-discipline-focus",
    "name": "Discipline Focus",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Chosen Discipline Skill 6 (Trained)",
    "prerequisite_text": "Chosen Discipline Skill 6 (Trained)",
    "modifiers": [],
    "description": "The character has specialized in shaping a specific type of energy or reality.",
    "mechanic": "Choose one Discipline Skill (e.g., *Summoning*, *Projection*, *Elemental*). You gain a **\\+2 Bonus** to checks made with that skill.  \n* **Mechanics:** In Tangent, the **Discipline Skill Check** determines the **Severity** (Damage, Duration, or Potency) of the effect. This feature directly increases the raw power of the ability.",
    "rules": "This feature is **\\[Multiple\\]**; you may take it for different Discipline skills.",
    "special_rules": "This feature is **\\[Multiple\\]**; you may take it for different Discipline skills.",
    "body": "# Discipline Focus\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Chosen Discipline Skill 6 (Trained)\n\n## Description\nThe character has specialized in shaping a specific type of energy or reality.\n\n## Mechanics & Benefit\nChoose one Discipline Skill (e.g., *Summoning*, *Projection*, *Elemental*). You gain a **\\+2 Bonus** to checks made with that skill.  \n* **Mechanics:** In Tangent, the **Discipline Skill Check** determines the **Severity** (Damage, Duration, or Potency) of the effect. This feature directly increases the raw power of the ability.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**; you may take it for different Discipline skills.",
    "full_text": "# Discipline Focus\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Chosen Discipline Skill 6 (Trained)\n\n## Description\nThe character has specialized in shaping a specific type of energy or reality.\n\n## Mechanics & Benefit\nChoose one Discipline Skill (e.g., *Summoning*, *Projection*, *Elemental*). You gain a **\\+2 Bonus** to checks made with that skill.  \n* **Mechanics:** In Tangent, the **Discipline Skill Check** determines the **Severity** (Damage, Duration, or Potency) of the effect. This feature directly increases the raw power of the ability.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**; you may take it for different Discipline skills.",
    "mechanics": "Choose one Discipline Skill (e.g., *Summoning*, *Projection*, *Elemental*). You gain a **\\+2 Bonus** to checks made with that skill.  \n* **Mechanics:** In Tangent, the **Discipline Skill Check** determines the **Severity** (Damage, Duration, or Potency) of the effect. This feature directly increases the raw power of the ability.",
    "notes": "[Modifier] +2 to Checks made with that\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]**; you may take it for different Discipline skills.\n[Prerequisite] Chosen Discipline Skill 6 (Trained)",
    "notesList": [
      "[Modifier] +2 to Checks made with that",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]**; you may take it for different Discipline skills.",
      "[Prerequisite] Chosen Discipline Skill 6 (Trained)"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "meta_dimension",
        "meta_energy",
        "meta_entropy",
        "meta_illusion",
        "meta_matter",
        "meta_mental"
      ],
      "group_label": "Discipline Skills",
      "max_skills": 1,
      "value": 2
    }
  },
  {
    "id": "discipline-discipline-mastery",
    "name": "Discipline Mastery",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Discipline Expertise (in the same skill), Discipline Skill 16 (Master)",
    "prerequisite_text": "Discipline Expertise (in the same skill), Discipline Skill 16 (Master)",
    "modifiers": [],
    "description": "The character is a virtuoso of their chosen art, capable of unleashing devastating power.",
    "mechanic": "The bonus to the chosen Discipline Skill increases to **\\+6**.",
    "rules": "Prerequisite: Discipline Expertise (in the same skill), Discipline Skill 16 (Master).",
    "special_rules": "Prerequisite: Discipline Expertise (in the same skill), Discipline Skill 16 (Master).",
    "body": "# Discipline Mastery\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Discipline Expertise (in the same skill), Discipline Skill 16 (Master)\n\n## Description\nThe character is a virtuoso of their chosen art, capable of unleashing devastating power.\n\n## Mechanics & Benefit\nThe bonus to the chosen Discipline Skill increases to **\\+6**.",
    "full_text": "# Discipline Mastery\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Discipline Expertise (in the same skill), Discipline Skill 16 (Master)\n\n## Description\nThe character is a virtuoso of their chosen art, capable of unleashing devastating power.\n\n## Mechanics & Benefit\nThe bonus to the chosen Discipline Skill increases to **\\+6**.",
    "mechanics": "The bonus to the chosen Discipline Skill increases to **\\+6**.",
    "notes": "[Modifier] +6 with chosen Discipline Skill (Affecting Severity)\n[Rule] Prerequisite: Discipline Expertise (in the same skill), Discipline Skill 16 (Master).\n[Prerequisite] Discipline Expertise (in the same skill), Discipline Skill 16 (Master)",
    "notesList": [
      "[Modifier] +6 with chosen Discipline Skill (Affecting Severity)",
      "[Rule] Prerequisite: Discipline Expertise (in the same skill), Discipline Skill 16 (Master).",
      "[Prerequisite] Discipline Expertise (in the same skill), Discipline Skill 16 (Master)"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "meta_dimension",
        "meta_energy",
        "meta_entropy",
        "meta_illusion",
        "meta_matter",
        "meta_mental"
      ],
      "group_label": "Discipline Skills",
      "max_skills": 1,
      "value": 6
    }
  },
  {
    "id": "discipline-empowered-strike",
    "name": "Empowered Strike",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "prerequisites": "Attune 6",
    "prerequisite_text": "Attune 6",
    "modifiers": [
      {
        "target": "Strike",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Strike"
      },
      {
        "target": "Etc",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Etc"
      }
    ],
    "description": "The character can infuse their physical attacks with raw metaphysical energy. This is the signature ability of \"Spellblades,\" \"Paladins,\" or \"Psychic Warriors.\"",
    "mechanic": "You may channel energy into a melee or ranged weapon attack. The attack gains **\\+1 to Strike** and **\\+1 to Damage**.  \n* **Effect:** The attack is considered **Enhanced** (Magical/Psionic) for the purpose of bypassing Damage Resistance (DR) that ignores mundane weapons.",
    "rules": "This feature is **\\[Ranked\\]**. You may take it multiple times (up to your Attune rank limit). Rank 2 would grant \\+2 Strike/Damage, etc.",
    "special_rules": "This feature is **\\[Ranked\\]**. You may take it multiple times (up to your Attune rank limit). Rank 2 would grant \\+2 Strike/Damage, etc.",
    "body": "# Empowered Strike\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Attune 6\n\n## Description\nThe character can infuse their physical attacks with raw metaphysical energy. This is the signature ability of \"Spellblades,\" \"Paladins,\" or \"Psychic Warriors.\"\n\n## Mechanics & Benefit\nYou may channel energy into a melee or ranged weapon attack. The attack gains **\\+1 to Strike** and **\\+1 to Damage**.  \n* **Effect:** The attack is considered **Enhanced** (Magical/Psionic) for the purpose of bypassing Damage Resistance (DR) that ignores mundane weapons.\n\n## Special Rules\nThis feature is **\\[Ranked\\]**. You may take it multiple times (up to your Attune rank limit). Rank 2 would grant \\+2 Strike/Damage, etc.",
    "full_text": "# Empowered Strike\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Attune 6\n\n## Description\nThe character can infuse their physical attacks with raw metaphysical energy. This is the signature ability of \"Spellblades,\" \"Paladins,\" or \"Psychic Warriors.\"\n\n## Mechanics & Benefit\nYou may channel energy into a melee or ranged weapon attack. The attack gains **\\+1 to Strike** and **\\+1 to Damage**.  \n* **Effect:** The attack is considered **Enhanced** (Magical/Psionic) for the purpose of bypassing Damage Resistance (DR) that ignores mundane weapons.\n\n## Special Rules\nThis feature is **\\[Ranked\\]**. You may take it multiple times (up to your Attune rank limit). Rank 2 would grant \\+2 Strike/Damage, etc.",
    "mechanics": "You may channel energy into a melee or ranged weapon attack. The attack gains **\\+1 to Strike** and **\\+1 to Damage**.  \n* **Effect:** The attack is considered **Enhanced** (Magical/Psionic) for the purpose of bypassing Damage Resistance (DR) that ignores mundane weapons.",
    "notes": "[Modifier] +2 to Strike\n[Modifier] +2 to Etc\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Ranked\\]**. You may take it multiple times (up to your Attune rank limit). Rank ...\n[Prerequisite] Attune 6",
    "notesList": [
      "[Modifier] +2 to Strike",
      "[Modifier] +2 to Etc",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Centering, Discipline Focus (in all currently used Disciplines)",
    "prerequisite_text": "Centering, Discipline Focus (in all currently used Disciplines)",
    "modifiers": [
      {
        "target": "meta-attune",
        "type": "take_10",
        "value": 10,
        "mode": "competence",
        "isSituational": true,
        "condition": "Distracted, threatened, or in combat",
        "description": "Take 10 on Attune checks under stress"
      }
    ],
    "description": "The character's concentration is so absolute that they can channel power reliably even in the heat of battle.",
    "mechanic": "You may **Take 10** on **Attune Checks** even when threatened, distracted, or in combat conditions.  \n* **Purpose:** Guarantees a consistent Save CR for your spells, removing the risk of a low roll making your spells easy to resist.",
    "rules": "Prerequisite: Centering, Discipline Focus (in all currently used Disciplines).",
    "special_rules": "Prerequisite: Centering, Discipline Focus (in all currently used Disciplines).",
    "body": "# Focused Center\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Centering, Discipline Focus (in all currently used Disciplines)\n\n## Description\nThe character's concentration is so absolute that they can channel power reliably even in the heat of battle.\n\n## Mechanics & Benefit\nYou may **Take 10** on **Attune Checks** even when threatened, distracted, or in combat conditions.  \n* **Purpose:** Guarantees a consistent Save CR for your spells, removing the risk of a low roll making your spells easy to resist.",
    "full_text": "# Focused Center\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Centering, Discipline Focus (in all currently used Disciplines)\n\n## Description\nThe character's concentration is so absolute that they can channel power reliably even in the heat of battle.\n\n## Mechanics & Benefit\nYou may **Take 10** on **Attune Checks** even when threatened, distracted, or in combat conditions.  \n* **Purpose:** Guarantees a consistent Save CR for your spells, removing the risk of a low roll making your spells easy to resist.",
    "mechanics": "You may **Take 10** on **Attune Checks** even when threatened, distracted, or in combat conditions.  \n* **Purpose:** Guarantees a consistent Save CR for your spells, removing the risk of a low roll making your spells easy to resist.",
    "notes": "[Modifier] Take 10 on Attune checks under stress\n[Rule] Prerequisite: Centering, Discipline Focus (in all currently used Disciplines).\n[Prerequisite] Centering, Discipline Focus (in all currently used Disciplines)",
    "notesList": [
      "[Modifier] Take 10 on Attune checks under stress",
      "[Rule] Prerequisite: Centering, Discipline Focus (in all currently used Disciplines).",
      "[Prerequisite] Centering, Discipline Focus (in all currently used Disciplines)"
    ]
  },
  {
    "id": "discipline-harmonious-center",
    "name": "Harmonious Center",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Centering Master, Discipline Mastery (in all currently used Disciplines)",
    "prerequisite_text": "Centering Master, Discipline Mastery (in all currently used Disciplines)",
    "modifiers": [
      {
        "target": "Discipline",
        "type": "check_advantage",
        "value": 1,
        "mode": "competence",
        "isSituational": true,
        "condition": "Attune and Mastered Discipline checks",
        "description": "Advantage on all Attune and Mastered Discipline checks (Roll 3d10, take best 2)"
      }
    ],
    "description": "The character exists in a state of flow with the universe. Power responds to their will instantly and perfectly.",
    "mechanic": "You roll **ALL** Metafocus Checks (Attune and Discipline) with **Advantage**.  \n* **Mechanics:** Roll 2d10 with Advantage for both your Accuracy/CR (Attune) and your Power/Severity (Discipline).",
    "rules": "Prerequisite: Centering Master, Discipline Mastery (in all currently used Disciplines).",
    "special_rules": "Prerequisite: Centering Master, Discipline Mastery (in all currently used Disciplines).",
    "body": "# Harmonious Center\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Centering Master, Discipline Mastery (in all currently used Disciplines)\n\n## Description\nThe character exists in a state of flow with the universe. Power responds to their will instantly and perfectly.\n\n## Mechanics & Benefit\nYou roll **ALL** Metafocus Checks (Attune and Discipline) with **Advantage**.  \n* **Mechanics:** Roll 2d10 with Advantage for both your Accuracy/CR (Attune) and your Power/Severity (Discipline).",
    "full_text": "# Harmonious Center\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Centering Master, Discipline Mastery (in all currently used Disciplines)\n\n## Description\nThe character exists in a state of flow with the universe. Power responds to their will instantly and perfectly.\n\n## Mechanics & Benefit\nYou roll **ALL** Metafocus Checks (Attune and Discipline) with **Advantage**.  \n* **Mechanics:** Roll 2d10 with Advantage for both your Accuracy/CR (Attune) and your Power/Severity (Discipline).",
    "mechanics": "You roll **ALL** Metafocus Checks (Attune and Discipline) with **Advantage**.  \n* **Mechanics:** Roll 2d10 with Advantage for both your Accuracy/CR (Attune) and your Power/Severity (Discipline).",
    "notes": "[Modifier] Advantage on all Attune and Mastered Discipline checks (Roll 3d10, take best 2)\n[Rule] Prerequisite: Centering Master, Discipline Mastery (in all currently used Disciplines).\n[Prerequisite] Centering Master, Discipline Mastery (in all currently used Disciplines)",
    "notesList": [
      "[Modifier] Advantage on all Attune and Mastered Discipline checks (Roll 3d10, take best 2)",
      "[Rule] Prerequisite: Centering Master, Discipline Mastery (in all currently used Disciplines).",
      "[Prerequisite] Centering Master, Discipline Mastery (in all currently used Disciplines)"
    ]
  },
  {
    "id": "discipline-special-ability",
    "name": "Special Ability",
    "category": "Discipline",
    "type": "discipline",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "None (though usually tied to Species or Origin).",
    "prerequisite_text": "None (though usually tied to Species or Origin).",
    "modifiers": [],
    "description": "The character possesses a singular, innate supernatural power that does not require the broad study of a Discipline. This represents things like a dragon's breath weapon, a mutant's teleportation, or a cyborg's built-in sonic scream.",
    "mechanic": "You gain the ability to use **one specific Invocation** (Spell/Power) at **Level 1**.  \n* **Mechanics:**  \n  * You do not need the *Awakened* feature or the parent Discipline Skill to use this.  \n  * This ability functions as a standalone Skill. You can advance it with Skill Points like any other skill (Novice, Trained, etc.) to increase its power.",
    "rules": "This feature is **\\[Multiple\\]**. You can take it multiple times to gain different isolated powers.",
    "special_rules": "This feature is **\\[Multiple\\]**. You can take it multiple times to gain different isolated powers.",
    "body": "# Special Ability\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None (though usually tied to Species or Origin).\n\n## Description\nThe character possesses a singular, innate supernatural power that does not require the broad study of a Discipline. This represents things like a dragon's breath weapon, a mutant's teleportation, or a cyborg's built-in sonic scream.\n\n## Mechanics & Benefit\nYou gain the ability to use **one specific Invocation** (Spell/Power) at **Level 1**.  \n* **Mechanics:**  \n  * You do not need the *Awakened* feature or the parent Discipline Skill to use this.  \n  * This ability functions as a standalone Skill. You can advance it with Skill Points like any other skill (Novice, Trained, etc.) to increase its power.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. You can take it multiple times to gain different isolated powers.",
    "full_text": "# Special Ability\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None (though usually tied to Species or Origin).\n\n## Description\nThe character possesses a singular, innate supernatural power that does not require the broad study of a Discipline. This represents things like a dragon's breath weapon, a mutant's teleportation, or a cyborg's built-in sonic scream.\n\n## Mechanics & Benefit\nYou gain the ability to use **one specific Invocation** (Spell/Power) at **Level 1**.  \n* **Mechanics:**  \n  * You do not need the *Awakened* feature or the parent Discipline Skill to use this.  \n  * This ability functions as a standalone Skill. You can advance it with Skill Points like any other skill (Novice, Trained, etc.) to increase its power.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. You can take it multiple times to gain different isolated powers.",
    "mechanics": "You gain the ability to use **one specific Invocation** (Spell/Power) at **Level 1**.  \n* **Mechanics:**  \n  * You do not need the *Awakened* feature or the parent Discipline Skill to use this.  \n  * This ability functions as a standalone Skill. You can advance it with Skill Points like any other skill (Novice, Trained, etc.) to increase its power.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Attune 6",
    "prerequisite_text": "Attune 6",
    "modifiers": [],
    "description": "The character's understanding of metaphysics is broad enough to bridge different sources of power. A wizard might tap into divine faith, or a psychic might calculate ley-lines like a mathematician.",
    "mechanic": "You may use a **Secondary Ability Score** to modify your **Attune Checks**.  \n  * *Example:* An Intellect-based caster (Mage) with this feature could choose to use their Wisdom modifier for Attune checks instead, perhaps representing a shift from logical weaving to intuitive feeling.  \n* **Purpose:** useful for characters with high stats in non-standard casting attributes, or to mitigate temporary Ability Damage to their primary casting stat.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "rules": "Prerequisite: Attune 6.",
    "special_rules": "Prerequisite: Attune 6.",
    "body": "# Versatile Source\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Attune 6\n\n## Description\nThe character's understanding of metaphysics is broad enough to bridge different sources of power. A wizard might tap into divine faith, or a psychic might calculate ley-lines like a mathematician.\n\n## Mechanics & Benefit\nYou may use a **Secondary Ability Score** to modify your **Attune Checks**.  \n  * *Example:* An Intellect-based caster (Mage) with this feature could choose to use their Wisdom modifier for Attune checks instead, perhaps representing a shift from logical weaving to intuitive feeling.  \n* **Purpose:** useful for characters with high stats in non-standard casting attributes, or to mitigate temporary Ability Damage to their primary casting stat.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "full_text": "# Versatile Source\n\n**Category**: Discipline Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Attune 6\n\n## Description\nThe character's understanding of metaphysics is broad enough to bridge different sources of power. A wizard might tap into divine faith, or a psychic might calculate ley-lines like a mathematician.\n\n## Mechanics & Benefit\nYou may use a **Secondary Ability Score** to modify your **Attune Checks**.  \n  * *Example:* An Intellect-based caster (Mage) with this feature could choose to use their Wisdom modifier for Attune checks instead, perhaps representing a shift from logical weaving to intuitive feeling.  \n* **Purpose:** useful for characters with high stats in non-standard casting attributes, or to mitigate temporary Ability Damage to their primary casting stat.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "mechanics": "You may use a **Secondary Ability Score** to modify your **Attune Checks**.  \n  * *Example:* An Intellect-based caster (Mage) with this feature could choose to use their Wisdom modifier for Attune checks instead, perhaps representing a shift from logical weaving to intuitive feeling.  \n* **Purpose:** useful for characters with high stats in non-standard casting attributes, or to mitigate temporary Ability Damage to their primary casting stat.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "notes": "[Rule] Prerequisite: Attune 6.\n[Prerequisite] Attune 6",
    "notesList": [
      "[Rule] Prerequisite: Attune 6.",
      "[Prerequisite] Attune 6"
    ]
  },
  {
    "id": "general-absolute-pitch",
    "name": "Absolute Pitch",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awareness 1, Perform 1",
    "prerequisite_text": "Awareness 1, Perform 1",
    "modifiers": [
      {
        "target": "Auditory matching",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Auditory matching"
      },
      {
        "target": "Impersonation vocal",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Impersonation vocal"
      },
      {
        "target": "Acoustic security bypass",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Acoustic security bypass"
      }
    ],
    "description": "The character possesses an exaggerated structural asymmetry in the planum temporale, allowing them to instantly identify, categorize, and perfectly recreate auditory frequencies without a reference tone.",
    "mechanic": "You can perfectly memorize and mimic voices, musical notes, or mechanical frequencies. You gain a +4 Bonus on checks involving auditory matching, impersonation (vocal), or acoustic security bypass.",
    "rules": "Prerequisite: Awareness 1, Perform 1.",
    "special_rules": "Prerequisite: Awareness 1, Perform 1.",
    "body": "# Absolute Pitch\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 1, Perform 1\n\n## Description\nThe character possesses an exaggerated structural asymmetry in the planum temporale, allowing them to instantly identify, categorize, and perfectly recreate auditory frequencies without a reference tone.\n\n## Mechanics & Benefit\nYou can perfectly memorize and mimic voices, musical notes, or mechanical frequencies. You gain a +4 Bonus on checks involving auditory matching, impersonation (vocal), or acoustic security bypass.",
    "full_text": "# Absolute Pitch\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 1, Perform 1\n\n## Description\nThe character possesses an exaggerated structural asymmetry in the planum temporale, allowing them to instantly identify, categorize, and perfectly recreate auditory frequencies without a reference tone.\n\n## Mechanics & Benefit\nYou can perfectly memorize and mimic voices, musical notes, or mechanical frequencies. You gain a +4 Bonus on checks involving auditory matching, impersonation (vocal), or acoustic security bypass.",
    "mechanics": "You can perfectly memorize and mimic voices, musical notes, or mechanical frequencies. You gain a +4 Bonus on checks involving auditory matching, impersonation (vocal), or acoustic security bypass.",
    "notes": "[Modifier] +4 to Auditory matching\n[Modifier] +4 to Impersonation vocal\n[Modifier] +4 to Acoustic security bypass\n[Rule] Prerequisite: Awareness 1, Perform 1.\n[Prerequisite] Awareness 1, Perform 1",
    "notesList": [
      "[Modifier] +4 to Auditory matching",
      "[Modifier] +4 to Impersonation vocal",
      "[Modifier] +4 to Acoustic security bypass",
      "[Rule] Prerequisite: Awareness 1, Perform 1.",
      "[Prerequisite] Awareness 1, Perform 1"
    ]
  },
  {
    "id": "general-acrobatic-steps",
    "name": "Acrobatic Steps",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Nimble Moves, Agility 3",
    "prerequisite_text": "Nimble Moves, Agility 3",
    "modifiers": [],
    "description": "The character bounds over debris and uneven ground.",
    "mechanic": "You ignore **30 feet** of difficult terrain penalties during movement. You may move at full speed while balancing on narrow surfaces.",
    "rules": "Prerequisite: Nimble Moves, Agility 3.",
    "special_rules": "Prerequisite: Nimble Moves, Agility 3.",
    "body": "# Acrobatic Steps\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Nimble Moves, Agility 3\n\n## Description\nThe character bounds over debris and uneven ground.\n\n## Mechanics & Benefit\nYou ignore **30 feet** of difficult terrain penalties during movement. You may move at full speed while balancing on narrow surfaces.",
    "full_text": "# Acrobatic Steps\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Nimble Moves, Agility 3\n\n## Description\nThe character bounds over debris and uneven ground.\n\n## Mechanics & Benefit\nYou ignore **30 feet** of difficult terrain penalties during movement. You may move at full speed while balancing on narrow surfaces.",
    "mechanics": "You ignore **30 feet** of difficult terrain penalties during movement. You may move at full speed while balancing on narrow surfaces.",
    "notes": "[Rule] Prerequisite: Nimble Moves, Agility 3.\n[Prerequisite] Nimble Moves, Agility 3",
    "notesList": [
      "[Rule] Prerequisite: Nimble Moves, Agility 3.",
      "[Prerequisite] Nimble Moves, Agility 3"
    ]
  },
  {
    "id": "general-algorithmic-cognition",
    "name": "Algorithmic Cognition",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Lightning Calculator, Intellect 4",
    "prerequisite_text": "Lightning Calculator, Intellect 4",
    "modifiers": [
      {
        "target": "Logic",
        "type": "check_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Logic Checks"
      }
    ],
    "description": "The character's brain bypasses standard working memory bottlenecks, allowing them to perform hypercalculia and extreme high-speed mental arithmetic natively.",
    "mechanic": "You may perform complex mathematical calculations, cryptanalysis, and algorithmic decryption as a Free Action instead of a Standard or Full Round Action. You gain Advantage on all Logic checks involving mathematics or codebreaking.",
    "rules": "Prerequisite: Lightning Calculator, Intellect 4.",
    "special_rules": "Prerequisite: Lightning Calculator, Intellect 4.",
    "body": "# Algorithmic Cognition\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Lightning Calculator, Intellect 4\n\n## Description\nThe character's brain bypasses standard working memory bottlenecks, allowing them to perform hypercalculia and extreme high-speed mental arithmetic natively.\n\n## Mechanics & Benefit\nYou may perform complex mathematical calculations, cryptanalysis, and algorithmic decryption as a Free Action instead of a Standard or Full Round Action. You gain Advantage on all Logic checks involving mathematics or codebreaking.",
    "full_text": "# Algorithmic Cognition\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Lightning Calculator, Intellect 4\n\n## Description\nThe character's brain bypasses standard working memory bottlenecks, allowing them to perform hypercalculia and extreme high-speed mental arithmetic natively.\n\n## Mechanics & Benefit\nYou may perform complex mathematical calculations, cryptanalysis, and algorithmic decryption as a Free Action instead of a Standard or Full Round Action. You gain Advantage on all Logic checks involving mathematics or codebreaking.",
    "mechanics": "You may perform complex mathematical calculations, cryptanalysis, and algorithmic decryption as a Free Action instead of a Standard or Full Round Action. You gain Advantage on all Logic checks involving mathematics or codebreaking.",
    "notes": "[Modifier] Advantage on Logic Checks\n[Rule] Prerequisite: Lightning Calculator, Intellect 4.\n[Prerequisite] Lightning Calculator, Intellect 4",
    "notesList": [
      "[Modifier] Advantage on Logic Checks",
      "[Rule] Prerequisite: Lightning Calculator, Intellect 4.",
      "[Prerequisite] Lightning Calculator, Intellect 4"
    ]
  },
  {
    "id": "general-analyze-weakness",
    "name": "Analyze Weakness",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Assessment",
    "prerequisite_text": "Assessment",
    "modifiers": [
      {
        "target": "Strike",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Strike"
      },
      {
        "target": "Damage against that specific target",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Damage against that specific target"
      }
    ],
    "description": "The character applies their assessment to combat, identifying chinks in armor or behavioral tics that can be exploited.",
    "mechanic": "As a Standard Action, make an **Assessment Check** opposed by the target's **Bluff Check**. For every 5 points by which your result exceeds the target's, you gain a cumulative **\\+1 bonus to Strike and Damage** against that specific target.",
    "rules": "This bonus lasts for the duration of the encounter or until the target successfully leaves your line of sight for more than 1 minute.",
    "special_rules": "This bonus lasts for the duration of the encounter or until the target successfully leaves your line of sight for more than 1 minute.",
    "body": "# Analyze Weakness\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Assessment\n\n## Description\nThe character applies their assessment to combat, identifying chinks in armor or behavioral tics that can be exploited.\n\n## Mechanics & Benefit\nAs a Standard Action, make an **Assessment Check** opposed by the target's **Bluff Check**. For every 5 points by which your result exceeds the target's, you gain a cumulative **\\+1 bonus to Strike and Damage** against that specific target.\n\n## Special Rules\nThis bonus lasts for the duration of the encounter or until the target successfully leaves your line of sight for more than 1 minute.",
    "full_text": "# Analyze Weakness\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Assessment\n\n## Description\nThe character applies their assessment to combat, identifying chinks in armor or behavioral tics that can be exploited.\n\n## Mechanics & Benefit\nAs a Standard Action, make an **Assessment Check** opposed by the target's **Bluff Check**. For every 5 points by which your result exceeds the target's, you gain a cumulative **\\+1 bonus to Strike and Damage** against that specific target.\n\n## Special Rules\nThis bonus lasts for the duration of the encounter or until the target successfully leaves your line of sight for more than 1 minute.",
    "mechanics": "As a Standard Action, make an **Assessment Check** opposed by the target's **Bluff Check**. For every 5 points by which your result exceeds the target's, you gain a cumulative **\\+1 bonus to Strike and Damage** against that specific target.",
    "notes": "[Modifier] +1 to Strike\n[Modifier] +1 to Damage against that specific target\n[Rule] This bonus lasts for the duration of the encounter or until the target successfully leaves your line...\n[Prerequisite] Assessment",
    "notesList": [
      "[Modifier] +1 to Strike",
      "[Modifier] +1 to Damage against that specific target",
      "[Rule] This bonus lasts for the duration of the encounter or until the target successfully leaves your line...",
      "[Prerequisite] Assessment"
    ]
  },
  {
    "id": "general-assessment",
    "name": "Assessment",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awareness 6, Sense Motive 6",
    "prerequisite_text": "Awareness 6, Sense Motive 6",
    "modifiers": [],
    "description": "The character has a practiced eye for sizing up opposition. By observing a target's stance, equipment, and demeanor, they can gauge the threat level.",
    "mechanic": "By observing a target for 1 full round, you can determine their relative threat level compared to yourself (Inferior, Equal, or Superior) and estimate their highest Skill Rank category (Novice, Trained, Expert, Master, Pinnacle).  \n* **Purpose:** Allows players to gauge if a fight is winnable before initiative is rolled.",
    "rules": "Prerequisite: Awareness 6, Sense Motive 6.",
    "special_rules": "Prerequisite: Awareness 6, Sense Motive 6.",
    "body": "# Assessment\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 6, Sense Motive 6\n\n## Description\nThe character has a practiced eye for sizing up opposition. By observing a target's stance, equipment, and demeanor, they can gauge the threat level.\n\n## Mechanics & Benefit\nBy observing a target for 1 full round, you can determine their relative threat level compared to yourself (Inferior, Equal, or Superior) and estimate their highest Skill Rank category (Novice, Trained, Expert, Master, Pinnacle).  \n* **Purpose:** Allows players to gauge if a fight is winnable before initiative is rolled.",
    "full_text": "# Assessment\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 6, Sense Motive 6\n\n## Description\nThe character has a practiced eye for sizing up opposition. By observing a target's stance, equipment, and demeanor, they can gauge the threat level.\n\n## Mechanics & Benefit\nBy observing a target for 1 full round, you can determine their relative threat level compared to yourself (Inferior, Equal, or Superior) and estimate their highest Skill Rank category (Novice, Trained, Expert, Master, Pinnacle).  \n* **Purpose:** Allows players to gauge if a fight is winnable before initiative is rolled.",
    "mechanics": "By observing a target for 1 full round, you can determine their relative threat level compared to yourself (Inferior, Equal, or Superior) and estimate their highest Skill Rank category (Novice, Trained, Expert, Master, Pinnacle).  \n* **Purpose:** Allows players to gauge if a fight is winnable before initiative is rolled.",
    "notes": "[Rule] Prerequisite: Awareness 6, Sense Motive 6.\n[Prerequisite] Awareness 6, Sense Motive 6",
    "notesList": [
      "[Rule] Prerequisite: Awareness 6, Sense Motive 6.",
      "[Prerequisite] Awareness 6, Sense Motive 6"
    ]
  },
  {
    "id": "general-benefit",
    "name": "Benefit (Authority)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Associated Occupation (Soldier, Constable, Agent)",
    "prerequisite_text": "Associated Occupation (Soldier, Constable, Agent)",
    "modifiers": [],
    "description": "The character holds a recognized rank within a law enforcement or military organization, granting them legal power and jurisdiction.",
    "mechanic": "You hold a specific rank.  \n  * *Rank 1:* Deputy / Corporal (Local jurisdiction).  \n  * *Rank 2:* Officer / Sergeant (Regional jurisdiction).  \n  * *Rank 3:* Marshal / Lieutenant (Planet-wide jurisdiction).  \n  * *Rank 4:* Agent / Commander (Interstellar/System-wide jurisdiction).  \n* **Mechanics:** Grants **\\+2 to Intimidate and Diplomacy** when interacting with law-abiding citizens or lower-ranking officials.",
    "rules": "Ranked selection. Prerequisite: Associated Occupation (Soldier, Constable, Agent).",
    "special_rules": "Ranked selection. Prerequisite: Associated Occupation (Soldier, Constable, Agent).",
    "body": "# Benefit (Authority)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Associated Occupation (Soldier, Constable, Agent)\n\n## Description\nThe character holds a recognized rank within a law enforcement or military organization, granting them legal power and jurisdiction.\n\n## Mechanics & Benefit\nYou hold a specific rank.  \n  * *Rank 1:* Deputy / Corporal (Local jurisdiction).  \n  * *Rank 2:* Officer / Sergeant (Regional jurisdiction).  \n  * *Rank 3:* Marshal / Lieutenant (Planet-wide jurisdiction).  \n  * *Rank 4:* Agent / Commander (Interstellar/System-wide jurisdiction).  \n* **Mechanics:** Grants **\\+2 to Intimidate and Diplomacy** when interacting with law-abiding citizens or lower-ranking officials.",
    "full_text": "# Benefit (Authority)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Associated Occupation (Soldier, Constable, Agent)\n\n## Description\nThe character holds a recognized rank within a law enforcement or military organization, granting them legal power and jurisdiction.\n\n## Mechanics & Benefit\nYou hold a specific rank.  \n  * *Rank 1:* Deputy / Corporal (Local jurisdiction).  \n  * *Rank 2:* Officer / Sergeant (Regional jurisdiction).  \n  * *Rank 3:* Marshal / Lieutenant (Planet-wide jurisdiction).  \n  * *Rank 4:* Agent / Commander (Interstellar/System-wide jurisdiction).  \n* **Mechanics:** Grants **\\+2 to Intimidate and Diplomacy** when interacting with law-abiding citizens or lower-ranking officials.",
    "mechanics": "You hold a specific rank.  \n  * *Rank 1:* Deputy / Corporal (Local jurisdiction).  \n  * *Rank 2:* Officer / Sergeant (Regional jurisdiction).  \n  * *Rank 3:* Marshal / Lieutenant (Planet-wide jurisdiction).  \n  * *Rank 4:* Agent / Commander (Interstellar/System-wide jurisdiction).  \n* **Mechanics:** Grants **\\+2 to Intimidate and Diplomacy** when interacting with law-abiding citizens or lower-ranking officials.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked selection. Prerequisite: Associated Occupation (Soldier, Constable, Agent).\n[Prerequisite] Associated Occupation (Soldier, Constable, Agent)",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked selection. Prerequisite: Associated Occupation (Soldier, Constable, Agent).",
      "[Prerequisite] Associated Occupation (Soldier, Constable, Agent)"
    ]
  },
  {
    "id": "general-benefit-authority",
    "name": "Benefit (Authority)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Special (Law Enforcement background)",
    "prerequisite_text": "Special (Law Enforcement background)",
    "modifiers": [],
    "description": "Legal enforcement authority granted by a governing body, planetary militia, or sector law enforcement agency.",
    "mechanic": "Grants legal authority, jurisdictional powers, and arrest rights within designated sectors (from Deputy to Sector Marshal / Special Agent).",
    "rules": "Ranked: Higher ranks grant wider planetary and interstellar jurisdiction.",
    "special_rules": "Ranked: Higher ranks grant wider planetary and interstellar jurisdiction.",
    "body": "# Benefit (Authority)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Special (Law Enforcement background)\n\n## Description\nLegal enforcement authority granted by a governing body, planetary militia, or sector law enforcement agency.\n\n## Mechanics & Benefit\nGrants legal authority, jurisdictional powers, and arrest rights within designated sectors (from Deputy to Sector Marshal / Special Agent).\n\n## Special Rules\nRanked: Higher ranks grant wider planetary and interstellar jurisdiction.",
    "full_text": "# Benefit (Authority)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Special (Law Enforcement background)\n\n## Description\nLegal enforcement authority granted by a governing body, planetary militia, or sector law enforcement agency.\n\n## Mechanics & Benefit\nGrants legal authority, jurisdictional powers, and arrest rights within designated sectors (from Deputy to Sector Marshal / Special Agent).\n\n## Special Rules\nRanked: Higher ranks grant wider planetary and interstellar jurisdiction.",
    "mechanics": "Grants legal authority, jurisdictional powers, and arrest rights within designated sectors (from Deputy to Sector Marshal / Special Agent).",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked: Higher ranks grant wider planetary and interstellar jurisdiction.\n[Prerequisite] Special (Law Enforcement background)",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked: Higher ranks grant wider planetary and interstellar jurisdiction.",
      "[Prerequisite] Special (Law Enforcement background)"
    ]
  },
  {
    "id": "general-benefit-clearance",
    "name": "Benefit (Clearance)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Vocation or Faction standing",
    "prerequisite_text": "Vocation or Faction standing",
    "modifiers": [],
    "description": "The character has official access to restricted information, government facilities, or corporate secrets.",
    "mechanic": "You possess a security key or biometric clearance.  \n  * *Rank 1:* Classified (Departmental info).  \n  * *Rank 2:* Secret (Mission-critical info).  \n  * *Rank 3:* Top Secret (Strategic info).  \n  * *Rank 4:* Black Badge (Existential threats / Black Ops).",
    "rules": "Ranked selection. Prerequisite: Vocation or Faction standing.",
    "special_rules": "Ranked selection. Prerequisite: Vocation or Faction standing.",
    "body": "# Benefit (Clearance)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Vocation or Faction standing\n\n## Description\nThe character has official access to restricted information, government facilities, or corporate secrets.\n\n## Mechanics & Benefit\nYou possess a security key or biometric clearance.  \n  * *Rank 1:* Classified (Departmental info).  \n  * *Rank 2:* Secret (Mission-critical info).  \n  * *Rank 3:* Top Secret (Strategic info).  \n  * *Rank 4:* Black Badge (Existential threats / Black Ops).",
    "full_text": "# Benefit (Clearance)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Vocation or Faction standing\n\n## Description\nThe character has official access to restricted information, government facilities, or corporate secrets.\n\n## Mechanics & Benefit\nYou possess a security key or biometric clearance.  \n  * *Rank 1:* Classified (Departmental info).  \n  * *Rank 2:* Secret (Mission-critical info).  \n  * *Rank 3:* Top Secret (Strategic info).  \n  * *Rank 4:* Black Badge (Existential threats / Black Ops).",
    "mechanics": "You possess a security key or biometric clearance.  \n  * *Rank 1:* Classified (Departmental info).  \n  * *Rank 2:* Secret (Mission-critical info).  \n  * *Rank 3:* Top Secret (Strategic info).  \n  * *Rank 4:* Black Badge (Existential threats / Black Ops).",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked selection. Prerequisite: Vocation or Faction standing.\n[Prerequisite] Vocation or Faction standing",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked selection. Prerequisite: Vocation or Faction standing.",
      "[Prerequisite] Vocation or Faction standing"
    ]
  },
  {
    "id": "general-benefit-equipment",
    "name": "Benefit (Equipment)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "prerequisites": "Membership in a Faction or Corp",
    "prerequisite_text": "Membership in a Faction or Corp",
    "modifiers": [],
    "description": "The character is sponsored by an organization that provides them with gear, rather than purchasing it with personal wealth.",
    "mechanic": "You are issued a package of gear that does not count against your personal Wealth or Debt.  \n  * *Rank 1:* Standard Kit (Personal Gear, Tools).  \n  * *Rank 2:* Tactical Package (Weapons, Armor).  \n  * *Rank 3:* Mobility Package (Personal Vehicle, Heavy Weapons).  \n  * *Rank 4:* Command Package (Starship, Base of Operations).",
    "rules": "Ranked selection. Multiple selections allowed. Prerequisite: Membership in a Faction or Corp.",
    "special_rules": "Ranked selection. Multiple selections allowed. Prerequisite: Membership in a Faction or Corp.",
    "body": "# Benefit (Equipment)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Membership in a Faction or Corp\n\n## Description\nThe character is sponsored by an organization that provides them with gear, rather than purchasing it with personal wealth.\n\n## Mechanics & Benefit\nYou are issued a package of gear that does not count against your personal Wealth or Debt.  \n  * *Rank 1:* Standard Kit (Personal Gear, Tools).  \n  * *Rank 2:* Tactical Package (Weapons, Armor).  \n  * *Rank 3:* Mobility Package (Personal Vehicle, Heavy Weapons).  \n  * *Rank 4:* Command Package (Starship, Base of Operations).",
    "full_text": "# Benefit (Equipment)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Membership in a Faction or Corp\n\n## Description\nThe character is sponsored by an organization that provides them with gear, rather than purchasing it with personal wealth.\n\n## Mechanics & Benefit\nYou are issued a package of gear that does not count against your personal Wealth or Debt.  \n  * *Rank 1:* Standard Kit (Personal Gear, Tools).  \n  * *Rank 2:* Tactical Package (Weapons, Armor).  \n  * *Rank 3:* Mobility Package (Personal Vehicle, Heavy Weapons).  \n  * *Rank 4:* Command Package (Starship, Base of Operations).",
    "mechanics": "You are issued a package of gear that does not count against your personal Wealth or Debt.  \n  * *Rank 1:* Standard Kit (Personal Gear, Tools).  \n  * *Rank 2:* Tactical Package (Weapons, Armor).  \n  * *Rank 3:* Mobility Package (Personal Vehicle, Heavy Weapons).  \n  * *Rank 4:* Command Package (Starship, Base of Operations).",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Ranked selection. Multiple selections allowed. Prerequisite: Membership in a Faction or Corp.\n[Prerequisite] Membership in a Faction or Corp",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Ranked selection. Multiple selections allowed. Prerequisite: Membership in a Faction or Corp.",
      "[Prerequisite] Membership in a Faction or Corp"
    ]
  },
  {
    "id": "general-benefit-identity",
    "name": "Benefit (Identity)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character has a meticulously crafted alternate persona, complete with background records, credit history, and identification.",
    "mechanic": "You gain one complete, verifiable Alternate Identity.  \n* **Mechanics:** Checks to uncover your true identity are made at **Disadvantage**. If the identity is \"burned\" (exposed), this feature is lost until a new one is purchased/established.",
    "rules": "Ranked selection.",
    "special_rules": "Ranked selection.",
    "body": "# Benefit (Identity)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has a meticulously crafted alternate persona, complete with background records, credit history, and identification.\n\n## Mechanics & Benefit\nYou gain one complete, verifiable Alternate Identity.  \n* **Mechanics:** Checks to uncover your true identity are made at **Disadvantage**. If the identity is \"burned\" (exposed), this feature is lost until a new one is purchased/established.",
    "full_text": "# Benefit (Identity)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has a meticulously crafted alternate persona, complete with background records, credit history, and identification.\n\n## Mechanics & Benefit\nYou gain one complete, verifiable Alternate Identity.  \n* **Mechanics:** Checks to uncover your true identity are made at **Disadvantage**. If the identity is \"burned\" (exposed), this feature is lost until a new one is purchased/established.",
    "mechanics": "You gain one complete, verifiable Alternate Identity.  \n* **Mechanics:** Checks to uncover your true identity are made at **Disadvantage**. If the identity is \"burned\" (exposed), this feature is lost until a new one is purchased/established.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked selection.",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked selection."
    ]
  },
  {
    "id": "general-benefit-immunity",
    "name": "Benefit (Immunity)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Special (usually High Status or Agent)",
    "prerequisite_text": "Special (usually High Status or Agent)",
    "modifiers": [],
    "description": "The character possesses a legal shield against prosecution for specific actions, usually granted by a government or mega-corp.",
    "mechanic": "* *Rank 1:* Order Immunity (Can claim \"Following Orders\" for minor infractions).  \n  * *Rank 2:* Diplomatic Immunity (Cannot be prosecuted by local planetary law).  \n  * *Rank 3:* Sanctioned (Authorized to commit felonies during mission parameters).  \n  * *Rank 4:* License to Kill (Authorized to execute targets at discretion).",
    "rules": "Ranked selection. Prerequisite: Special (usually High Status or Agent).",
    "special_rules": "Ranked selection. Prerequisite: Special (usually High Status or Agent).",
    "body": "# Benefit (Immunity)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Special (usually High Status or Agent)\n\n## Description\nThe character possesses a legal shield against prosecution for specific actions, usually granted by a government or mega-corp.\n\n## Mechanics & Benefit\n* *Rank 1:* Order Immunity (Can claim \"Following Orders\" for minor infractions).  \n  * *Rank 2:* Diplomatic Immunity (Cannot be prosecuted by local planetary law).  \n  * *Rank 3:* Sanctioned (Authorized to commit felonies during mission parameters).  \n  * *Rank 4:* License to Kill (Authorized to execute targets at discretion).",
    "full_text": "# Benefit (Immunity)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Special (usually High Status or Agent)\n\n## Description\nThe character possesses a legal shield against prosecution for specific actions, usually granted by a government or mega-corp.\n\n## Mechanics & Benefit\n* *Rank 1:* Order Immunity (Can claim \"Following Orders\" for minor infractions).  \n  * *Rank 2:* Diplomatic Immunity (Cannot be prosecuted by local planetary law).  \n  * *Rank 3:* Sanctioned (Authorized to commit felonies during mission parameters).  \n  * *Rank 4:* License to Kill (Authorized to execute targets at discretion).",
    "mechanics": "* *Rank 1:* Order Immunity (Can claim \"Following Orders\" for minor infractions).  \n  * *Rank 2:* Diplomatic Immunity (Cannot be prosecuted by local planetary law).  \n  * *Rank 3:* Sanctioned (Authorized to commit felonies during mission parameters).  \n  * *Rank 4:* License to Kill (Authorized to execute targets at discretion).",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked selection. Prerequisite: Special (usually High Status or Agent).\n[Prerequisite] Special (usually High Status or Agent)",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked selection. Prerequisite: Special (usually High Status or Agent).",
      "[Prerequisite] Special (usually High Status or Agent)"
    ]
  },
  {
    "id": "general-benefit-status",
    "name": "Benefit (Status)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Special",
    "prerequisite_text": "Special",
    "modifiers": [
      {
        "target": "Wealth",
        "type": "wealth",
        "value": 2,
        "mode": "inherent",
        "description": "+2 Wealth Score"
      }
    ],
    "description": "The character holds a title of nobility, corporate executive power, or high military command.",
    "mechanic": "You gain a Title (e.g., Duke, CEO, Admiral). You gain a **\\+2 Bonus to Wealth** checks.",
    "rules": "This acts as a \\[Ranked\\] feature; higher ranks denote higher titles and influence.",
    "special_rules": "This acts as a \\[Ranked\\] feature; higher ranks denote higher titles and influence.",
    "body": "# Benefit (Status)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Special\n\n## Description\nThe character holds a title of nobility, corporate executive power, or high military command.\n\n## Mechanics & Benefit\nYou gain a Title (e.g., Duke, CEO, Admiral). You gain a **\\+2 Bonus to Wealth** checks.\n\n## Special Rules\nThis acts as a \\[Ranked\\] feature; higher ranks denote higher titles and influence.",
    "full_text": "# Benefit (Status)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Special\n\n## Description\nThe character holds a title of nobility, corporate executive power, or high military command.\n\n## Mechanics & Benefit\nYou gain a Title (e.g., Duke, CEO, Admiral). You gain a **\\+2 Bonus to Wealth** checks.\n\n## Special Rules\nThis acts as a \\[Ranked\\] feature; higher ranks denote higher titles and influence.",
    "mechanics": "You gain a Title (e.g., Duke, CEO, Admiral). You gain a **\\+2 Bonus to Wealth** checks.",
    "notes": "[Modifier] +2 Wealth Score\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This acts as a \\[Ranked\\] feature; higher ranks denote higher titles and influence.\n[Prerequisite] Special",
    "notesList": [
      "[Modifier] +2 Wealth Score",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] This acts as a \\[Ranked\\] feature; higher ranks denote higher titles and influence.",
      "[Prerequisite] Special"
    ]
  },
  {
    "id": "general-benefit-wealth",
    "name": "Benefit (Wealth)",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "Wealth",
        "type": "wealth",
        "value": 3,
        "mode": "inherent",
        "description": "+3 Wealth Score"
      }
    ],
    "description": "The character is independently wealthy, possessing vast investments, inheritance, or liquid assets.",
    "mechanic": "Increase your **Wealth Score by \\+3**.  \n* **Purpose:** Allows purchasing of higher Tech Level gear or luxury items during character creation and downtime.",
    "rules": "Ranked selection.",
    "special_rules": "Ranked selection.",
    "body": "# Benefit (Wealth)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is independently wealthy, possessing vast investments, inheritance, or liquid assets.\n\n## Mechanics & Benefit\nIncrease your **Wealth Score by \\+3**.  \n* **Purpose:** Allows purchasing of higher Tech Level gear or luxury items during character creation and downtime.",
    "full_text": "# Benefit (Wealth)\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is independently wealthy, possessing vast investments, inheritance, or liquid assets.\n\n## Mechanics & Benefit\nIncrease your **Wealth Score by \\+3**.  \n* **Purpose:** Allows purchasing of higher Tech Level gear or luxury items during character creation and downtime.",
    "mechanics": "Increase your **Wealth Score by \\+3**.  \n* **Purpose:** Allows purchasing of higher Tech Level gear or luxury items during character creation and downtime.",
    "notes": "[Modifier] +3 Wealth Score\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked selection.",
    "notesList": [
      "[Modifier] +3 Wealth Score",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked selection."
    ]
  },
  {
    "id": "general-born-leader",
    "name": "Born Leader",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 3, Diplomacy 6",
    "prerequisite_text": "Charisma 3, Diplomacy 6",
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
    "body": "# Born Leader\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 3, Diplomacy 6\n\n## Description\nThe character attracts loyal followers and can manage a crew or organization effectively.\n\n## Mechanics & Benefit\nYou gain a number of **Followers** (NPCs) and potentially a **Cohort** (a loyal lieutenant). The number and quality depend on your Level and Charisma score. You gain a \\+2 bonus to Organization/Administration checks.",
    "full_text": "# Born Leader\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 3, Diplomacy 6\n\n## Description\nThe character attracts loyal followers and can manage a crew or organization effectively.\n\n## Mechanics & Benefit\nYou gain a number of **Followers** (NPCs) and potentially a **Cohort** (a loyal lieutenant). The number and quality depend on your Level and Charisma score. You gain a \\+2 bonus to Organization/Administration checks.",
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
    "id": "general-camouflage",
    "name": "Camouflage",
    "category": "General",
    "type": "general",
    "cp": 2,
    "bp": 2,
    "costs": {
      "cp": 2,
      "bp": 2,
      "credits": 0,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    },
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Stealth 1",
    "prerequisite_text": "Stealth 1",
    "modifiers": [],
    "description": "Passive adaptive coloration, light-draping contours, and texture mimicry grant a +4 bonus on Stealth checks in favored or shadowed terrain.",
    "mechanic": "Grants a +4 bonus on all Stealth checks when remaining stationary or moving at half speed through dim light, shadows, subterranean environments, or favored hunting terrain. Reduces the penalty for making Stealth checks while maneuvering around obstacles by 50%.",
    "rules": "",
    "special_rules": "",
    "body": "# Camouflage\n\n**Category**: General Features  \n**Cost**: 2 CP  \n**Prerequisites**: Stealth 1  \n\n## Description\nThe character possesses passive epidermal coloration, matte chitinous properties, or biological patterning that naturally blends into shadows, subterranean cave walls, metallic ship framing, or rocky terrain.\n\n## Mechanics & Benefit\n- **Stealth Competence**: Grants a **+4 bonus** on all Stealth checks when remaining stationary or moving at half speed through dim light, shadows, subterranean environments, or favored hunting terrain.\n- **Concealed Stalking**: Reduces the penalty for making Stealth checks while maneuvering around obstacles by 50%.",
    "full_text": "# Camouflage\n\n**Category**: General Features  \n**Cost**: 2 CP  \n**Prerequisites**: Stealth 1  \n\n## Description\nThe character possesses passive epidermal coloration, matte chitinous properties, or biological patterning that naturally blends into shadows, subterranean cave walls, metallic ship framing, or rocky terrain.\n\n## Mechanics & Benefit\n- **Stealth Competence**: Grants a **+4 bonus** on all Stealth checks when remaining stationary or moving at half speed through dim light, shadows, subterranean environments, or favored hunting terrain.\n- **Concealed Stalking**: Reduces the penalty for making Stealth checks while maneuvering around obstacles by 50%.",
    "mechanics": "Grants a +4 bonus on all Stealth checks when remaining stationary or moving at half speed through dim light, shadows, subterranean environments, or favored hunting terrain. Reduces the penalty for making Stealth checks while maneuvering around obstacles by 50%.",
    "keywords": "camouflage, stealth, concealment, shadow-blending, favored-terrain, infiltration",
    "negative_keywords": "conspicuous, fluorescent, glowing",
    "notes": "[Prerequisite] Stealth 1",
    "notesList": [
      "[Prerequisite] Stealth 1"
    ]
  },
  {
    "id": "general-climber",
    "name": "Climber",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Athletics 1",
    "prerequisite_text": "Athletics 1",
    "modifiers": [
      {
        "target": "Climb",
        "type": "take_10",
        "value": 10,
        "mode": "inherent",
        "description": "May take 10 on Climb Checks"
      }
    ],
    "description": "The character is at home on vertical surfaces, moving with the agility of a spider or monkey.",
    "mechanic": "You gain a **Climb Speed** equal to half your base speed. You may **Take 10** on Climb checks even when rushed or threatened. You retain your Agility bonus to Defense while climbing.",
    "rules": "Prerequisite: Athletics 1.",
    "special_rules": "Prerequisite: Athletics 1.",
    "body": "# Climber\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Athletics 1\n\n## Description\nThe character is at home on vertical surfaces, moving with the agility of a spider or monkey.\n\n## Mechanics & Benefit\nYou gain a **Climb Speed** equal to half your base speed. You may **Take 10** on Climb checks even when rushed or threatened. You retain your Agility bonus to Defense while climbing.",
    "full_text": "# Climber\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Athletics 1\n\n## Description\nThe character is at home on vertical surfaces, moving with the agility of a spider or monkey.\n\n## Mechanics & Benefit\nYou gain a **Climb Speed** equal to half your base speed. You may **Take 10** on Climb checks even when rushed or threatened. You retain your Agility bonus to Defense while climbing.",
    "mechanics": "You gain a **Climb Speed** equal to half your base speed. You may **Take 10** on Climb checks even when rushed or threatened. You retain your Agility bonus to Defense while climbing.",
    "notes": "[Modifier] May take 10 on Climb Checks\n[Rule] Prerequisite: Athletics 1.\n[Prerequisite] Athletics 1",
    "notesList": [
      "[Modifier] May take 10 on Climb Checks",
      "[Rule] Prerequisite: Athletics 1.",
      "[Prerequisite] Athletics 1"
    ]
  },
  {
    "id": "general-connected",
    "name": "Connected",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Charisma 1",
    "prerequisite_text": "Charisma 1",
    "modifiers": [],
    "description": "The character has friends in low (or high) places. They can call in favors for equipment, information, or safe houses.",
    "mechanic": "You have a network of contacts.  \n  * *Rank 1:* Street/Soldier level (Gangs, Grunts).  \n  * *Rank 2:* Management/Lieutenant level (Shop owners, Squad leaders).  \n  * *Rank 3:* Officer/Executive level (City officials, Corp VPs).  \n  * *Rank 4:* Boss/Director level (Planetary Governors, Crime Lords).  \n* **Mechanics:** Make a Charisma check to call in a favor. Difficulty depends on the size of the request.",
    "rules": "Ranked selection. Prerequisite: Charisma 1.",
    "special_rules": "Ranked selection. Prerequisite: Charisma 1.",
    "body": "# Connected\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character has friends in low (or high) places. They can call in favors for equipment, information, or safe houses.\n\n## Mechanics & Benefit\nYou have a network of contacts.  \n  * *Rank 1:* Street/Soldier level (Gangs, Grunts).  \n  * *Rank 2:* Management/Lieutenant level (Shop owners, Squad leaders).  \n  * *Rank 3:* Officer/Executive level (City officials, Corp VPs).  \n  * *Rank 4:* Boss/Director level (Planetary Governors, Crime Lords).  \n* **Mechanics:** Make a Charisma check to call in a favor. Difficulty depends on the size of the request.",
    "full_text": "# Connected\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character has friends in low (or high) places. They can call in favors for equipment, information, or safe houses.\n\n## Mechanics & Benefit\nYou have a network of contacts.  \n  * *Rank 1:* Street/Soldier level (Gangs, Grunts).  \n  * *Rank 2:* Management/Lieutenant level (Shop owners, Squad leaders).  \n  * *Rank 3:* Officer/Executive level (City officials, Corp VPs).  \n  * *Rank 4:* Boss/Director level (Planetary Governors, Crime Lords).  \n* **Mechanics:** Make a Charisma check to call in a favor. Difficulty depends on the size of the request.",
    "mechanics": "You have a network of contacts.  \n  * *Rank 1:* Street/Soldier level (Gangs, Grunts).  \n  * *Rank 2:* Management/Lieutenant level (Shop owners, Squad leaders).  \n  * *Rank 3:* Officer/Executive level (City officials, Corp VPs).  \n  * *Rank 4:* Boss/Director level (Planetary Governors, Crime Lords).  \n* **Mechanics:** Make a Charisma check to call in a favor. Difficulty depends on the size of the request.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked selection. Prerequisite: Charisma 1.\n[Prerequisite] Charisma 1",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked selection. Prerequisite: Charisma 1.",
      "[Prerequisite] Charisma 1"
    ]
  },
  {
    "id": "general-contacts",
    "name": "Contacts",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 1",
    "prerequisite_text": "Charisma 1",
    "modifiers": [],
    "description": "The character knows who to talk to. They don't necessarily have favors owed, but they know the flow of information.",
    "mechanic": "You may make **Gather Information** checks in **1/2 the typical time**.  \n* **Mechanics:** You have a specific reliable contact in a chosen field (Medical, Legal, Criminal) who provides information at **Advantage**.",
    "rules": "Prerequisite: Charisma 1.",
    "special_rules": "Prerequisite: Charisma 1.",
    "body": "# Contacts\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character knows who to talk to. They don't necessarily have favors owed, but they know the flow of information.\n\n## Mechanics & Benefit\nYou may make **Gather Information** checks in **1/2 the typical time**.  \n* **Mechanics:** You have a specific reliable contact in a chosen field (Medical, Legal, Criminal) who provides information at **Advantage**.",
    "full_text": "# Contacts\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character knows who to talk to. They don't necessarily have favors owed, but they know the flow of information.\n\n## Mechanics & Benefit\nYou may make **Gather Information** checks in **1/2 the typical time**.  \n* **Mechanics:** You have a specific reliable contact in a chosen field (Medical, Legal, Criminal) who provides information at **Advantage**.",
    "mechanics": "You may make **Gather Information** checks in **1/2 the typical time**.  \n* **Mechanics:** You have a specific reliable contact in a chosen field (Medical, Legal, Criminal) who provides information at **Advantage**.",
    "notes": "[Rule] Prerequisite: Charisma 1.\n[Prerequisite] Charisma 1",
    "notesList": [
      "[Rule] Prerequisite: Charisma 1.",
      "[Prerequisite] Charisma 1"
    ]
  },
  {
    "id": "general-coordinated-assist",
    "name": "Coordinated Assist",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Intellect 1",
    "prerequisite_text": "Intellect 1",
    "modifiers": [
      {
        "target": "Skill Synergy",
        "type": "synergy",
        "value": 1,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Aid Another actions",
        "description": "+1 bonus to ally check when assisting via Skill Synergy"
      }
    ],
    "description": "The character is a natural team player or squad leader, adept at setting up allies for success.",
    "mechanic": "When using the **Aid Another** action (Skill Synergy), you grant an additional **\\+1 Bonus** to your ally's check.",
    "rules": "This feature is \\[Ranked\\] by Intellect. (Rank 2 grants \\+2, etc.).",
    "special_rules": "This feature is \\[Ranked\\] by Intellect. (Rank 2 grants \\+2, etc.).",
    "body": "# Coordinated Assist\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 1\n\n## Description\nThe character is a natural team player or squad leader, adept at setting up allies for success.\n\n## Mechanics & Benefit\nWhen using the **Aid Another** action (Skill Synergy), you grant an additional **\\+1 Bonus** to your ally's check.\n\n## Special Rules\nThis feature is \\[Ranked\\] by Intellect. (Rank 2 grants \\+2, etc.).",
    "full_text": "# Coordinated Assist\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 1\n\n## Description\nThe character is a natural team player or squad leader, adept at setting up allies for success.\n\n## Mechanics & Benefit\nWhen using the **Aid Another** action (Skill Synergy), you grant an additional **\\+1 Bonus** to your ally's check.\n\n## Special Rules\nThis feature is \\[Ranked\\] by Intellect. (Rank 2 grants \\+2, etc.).",
    "mechanics": "When using the **Aid Another** action (Skill Synergy), you grant an additional **\\+1 Bonus** to your ally's check.",
    "notes": "[Modifier] +1 bonus to ally check when assisting via Skill Synergy\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This feature is \\[Ranked\\] by Intellect. (Rank 2 grants \\+2, etc.).\n[Prerequisite] Intellect 1",
    "notesList": [
      "[Modifier] +1 bonus to ally check when assisting via Skill Synergy",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Endurance",
    "prerequisite_text": "Endurance",
    "modifiers": [],
    "description": "The character is too stubborn or tough to die when they should.",
    "mechanic": "When your Health is reduced to 0 or lower (but not dead), you automatically **Stabilize**. You do not lose 1 HP per round. You may continue to take partial actions while at Death's Door, though you risk killing yourself if you take strenuous damage.",
    "rules": "Prerequisite: Endurance.",
    "special_rules": "Prerequisite: Endurance.",
    "body": "# Diehard\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Endurance\n\n## Description\nThe character is too stubborn or tough to die when they should.\n\n## Mechanics & Benefit\nWhen your Health is reduced to 0 or lower (but not dead), you automatically **Stabilize**. You do not lose 1 HP per round. You may continue to take partial actions while at Death's Door, though you risk killing yourself if you take strenuous damage.",
    "full_text": "# Diehard\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Endurance\n\n## Description\nThe character is too stubborn or tough to die when they should.\n\n## Mechanics & Benefit\nWhen your Health is reduced to 0 or lower (but not dead), you automatically **Stabilize**. You do not lose 1 HP per round. You may continue to take partial actions while at Death's Door, though you risk killing yourself if you take strenuous damage.",
    "mechanics": "When your Health is reduced to 0 or lower (but not dead), you automatically **Stabilize**. You do not lose 1 HP per round. You may continue to take partial actions while at Death's Door, though you risk killing yourself if you take strenuous damage.",
    "notes": "[Rule] Prerequisite: Endurance.\n[Prerequisite] Endurance",
    "notesList": [
      "[Rule] Prerequisite: Endurance.",
      "[Prerequisite] Endurance"
    ]
  },
  {
    "id": "general-distract",
    "name": "Distract",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 1 or Intellect 1",
    "prerequisite_text": "Charisma 1 or Intellect 1",
    "modifiers": [],
    "description": "The character can cause a diversion so potent that it leaves opponents vulnerable.",
    "mechanic": "As a Standard Action, make a Bluff or Engineering (for tech distraction) check vs. the Target’s Will.  \n* **Success:** The target's attention is totally consumed by the distraction. They are considered **Flat-Footed** against all attacks from characters other than you until the start of your next turn.",
    "rules": "Prerequisite: Charisma 1 or Intellect 1.",
    "special_rules": "Prerequisite: Charisma 1 or Intellect 1.",
    "body": "# Distract\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1 or Intellect 1\n\n## Description\nThe character can cause a diversion so potent that it leaves opponents vulnerable.\n\n## Mechanics & Benefit\nAs a Standard Action, make a Bluff or Engineering (for tech distraction) check vs. the Target’s Will.  \n* **Success:** The target's attention is totally consumed by the distraction. They are considered **Flat-Footed** against all attacks from characters other than you until the start of your next turn.",
    "full_text": "# Distract\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1 or Intellect 1\n\n## Description\nThe character can cause a diversion so potent that it leaves opponents vulnerable.\n\n## Mechanics & Benefit\nAs a Standard Action, make a Bluff or Engineering (for tech distraction) check vs. the Target’s Will.  \n* **Success:** The target's attention is totally consumed by the distraction. They are considered **Flat-Footed** against all attacks from characters other than you until the start of your next turn.",
    "mechanics": "As a Standard Action, make a Bluff or Engineering (for tech distraction) check vs. the Target’s Will.  \n* **Success:** The target's attention is totally consumed by the distraction. They are considered **Flat-Footed** against all attacks from characters other than you until the start of your next turn.",
    "notes": "[Rule] Prerequisite: Charisma 1 or Intellect 1.\n[Prerequisite] Charisma 1 or Intellect 1",
    "notesList": [
      "[Rule] Prerequisite: Charisma 1 or Intellect 1.",
      "[Prerequisite] Charisma 1 or Intellect 1"
    ]
  },
  {
    "id": "general-double-jointed",
    "name": "Double Jointed",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1",
    "prerequisite_text": "Agility 1",
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
    "rules": "Prerequisite: Agility 1.",
    "special_rules": "Prerequisite: Agility 1.",
    "body": "# Double Jointed\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character possesses extreme flexibility, able to dislocate joints or contort into impossible shapes.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** on Escape Artist checks and any check involving fitting into tight spaces.",
    "full_text": "# Double Jointed\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character possesses extreme flexibility, able to dislocate joints or contort into impossible shapes.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** on Escape Artist checks and any check involving fitting into tight spaces.",
    "mechanics": "Gain a **\\+4 Bonus** on Escape Artist checks and any check involving fitting into tight spaces.",
    "notes": "[Modifier] +4 to Escape Artist\n[Rule] Prerequisite: Agility 1.\n[Prerequisite] Agility 1",
    "notesList": [
      "[Modifier] +4 to Escape Artist",
      "[Rule] Prerequisite: Agility 1.",
      "[Prerequisite] Agility 1"
    ]
  },
  {
    "id": "general-dual-hemispheric-processing",
    "name": "Dual-Hemispheric Processing",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intellect 3, Special (Congenital Trait)",
    "prerequisite_text": "Intellect 3, Special (Congenital Trait)",
    "modifiers": [],
    "description": "Due to a congenital anomaly (such as the agenesis of the corpus callosum), the character's brain hemispheres operate with extreme independence. They can read two pages simultaneously and process localized data without global interference.",
    "mechanic": "You can read, scan, and process textual or visual information at 10x normal speed. Furthermore, you may perform two different mental tasks (e.g., hacking a terminal while calculating astrogation routes) without suffering a multi-tasking penalty.",
    "rules": "Prerequisite: Intellect 3, Special (Congenital Trait).",
    "special_rules": "Prerequisite: Intellect 3, Special (Congenital Trait).",
    "body": "# Dual-Hemispheric Processing\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 3, Special (Congenital Trait)\n\n## Description\nDue to a congenital anomaly (such as the agenesis of the corpus callosum), the character's brain hemispheres operate with extreme independence. They can read two pages simultaneously and process localized data without global interference.\n\n## Mechanics & Benefit\nYou can read, scan, and process textual or visual information at 10x normal speed. Furthermore, you may perform two different mental tasks (e.g., hacking a terminal while calculating astrogation routes) without suffering a multi-tasking penalty.",
    "full_text": "# Dual-Hemispheric Processing\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 3, Special (Congenital Trait)\n\n## Description\nDue to a congenital anomaly (such as the agenesis of the corpus callosum), the character's brain hemispheres operate with extreme independence. They can read two pages simultaneously and process localized data without global interference.\n\n## Mechanics & Benefit\nYou can read, scan, and process textual or visual information at 10x normal speed. Furthermore, you may perform two different mental tasks (e.g., hacking a terminal while calculating astrogation routes) without suffering a multi-tasking penalty.",
    "mechanics": "You can read, scan, and process textual or visual information at 10x normal speed. Furthermore, you may perform two different mental tasks (e.g., hacking a terminal while calculating astrogation routes) without suffering a multi-tasking penalty.",
    "notes": "[Rule] Prerequisite: Intellect 3, Special (Congenital Trait).\n[Prerequisite] Intellect 3, Special (Congenital Trait)",
    "notesList": [
      "[Rule] Prerequisite: Intellect 3, Special (Congenital Trait).",
      "[Prerequisite] Intellect 3, Special (Congenital Trait)"
    ]
  },
  {
    "id": "general-echolocation",
    "name": "Echolocation",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awareness 3, Must possess the Blindness flaw (or be visually deprived)",
    "prerequisite_text": "Awareness 3, Must possess the Blindness flaw (or be visually deprived)",
    "modifiers": [],
    "description": "Through extreme cross-modal neuroplasticity, the character's visual cortex has been repurposed to process auditory data, acting as a high-resolution biological sonar.",
    "mechanic": "By emitting sharp clicks, you gain Blindsight up to 60 feet. You ignore all concealment penalties caused by darkness, fog, or visual invisibility within this range. You cannot be Flanked by enemies within your sonar radius.",
    "rules": "Prerequisite: Awareness 3, Must possess the Blindness flaw (or be visually deprived).",
    "special_rules": "Prerequisite: Awareness 3, Must possess the Blindness flaw (or be visually deprived).",
    "body": "# Echolocation\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 3, Must possess the Blindness flaw (or be visually deprived)\n\n## Description\nThrough extreme cross-modal neuroplasticity, the character's visual cortex has been repurposed to process auditory data, acting as a high-resolution biological sonar.\n\n## Mechanics & Benefit\nBy emitting sharp clicks, you gain Blindsight up to 60 feet. You ignore all concealment penalties caused by darkness, fog, or visual invisibility within this range. You cannot be Flanked by enemies within your sonar radius.",
    "full_text": "# Echolocation\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 3, Must possess the Blindness flaw (or be visually deprived)\n\n## Description\nThrough extreme cross-modal neuroplasticity, the character's visual cortex has been repurposed to process auditory data, acting as a high-resolution biological sonar.\n\n## Mechanics & Benefit\nBy emitting sharp clicks, you gain Blindsight up to 60 feet. You ignore all concealment penalties caused by darkness, fog, or visual invisibility within this range. You cannot be Flanked by enemies within your sonar radius.",
    "mechanics": "By emitting sharp clicks, you gain Blindsight up to 60 feet. You ignore all concealment penalties caused by darkness, fog, or visual invisibility within this range. You cannot be Flanked by enemies within your sonar radius.",
    "notes": "[Rule] Prerequisite: Awareness 3, Must possess the Blindness flaw (or be visually deprived).\n[Prerequisite] Awareness 3, Must possess the Blindness flaw (or be visually deprived)",
    "notesList": [
      "[Rule] Prerequisite: Awareness 3, Must possess the Blindness flaw (or be visually deprived).",
      "[Prerequisite] Awareness 3, Must possess the Blindness flaw (or be visually deprived)"
    ]
  },
  {
    "id": "general-eidetic-constructor",
    "name": "Eidetic Constructor",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Eidetic Memory, Awareness 2",
    "prerequisite_text": "Eidetic Memory, Awareness 2",
    "modifiers": [
      {
        "target": "Navigation",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Navigation"
      },
      {
        "target": "Architecture",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Architecture"
      },
      {
        "target": "Tactical",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Tactical"
      }
    ],
    "description": "The character possesses unparalleled visual-spatial memory. They retain \"frozen frames\" of complex visual stimuli and can perfectly recreate them in physical space or memory.",
    "mechanic": "After observing an area, building, or object for 1 full round, you memorize its exact structural layout, dimensions, and structural columns. You gain a +4 Bonus to Navigation, Architecture, or Tactical checks involving that specific location.",
    "rules": "Prerequisite: Eidetic Memory, Awareness 2.",
    "special_rules": "Prerequisite: Eidetic Memory, Awareness 2.",
    "body": "# Eidetic Constructor\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Eidetic Memory, Awareness 2\n\n## Description\nThe character possesses unparalleled visual-spatial memory. They retain \"frozen frames\" of complex visual stimuli and can perfectly recreate them in physical space or memory.\n\n## Mechanics & Benefit\nAfter observing an area, building, or object for 1 full round, you memorize its exact structural layout, dimensions, and structural columns. You gain a +4 Bonus to Navigation, Architecture, or Tactical checks involving that specific location.",
    "full_text": "# Eidetic Constructor\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Eidetic Memory, Awareness 2\n\n## Description\nThe character possesses unparalleled visual-spatial memory. They retain \"frozen frames\" of complex visual stimuli and can perfectly recreate them in physical space or memory.\n\n## Mechanics & Benefit\nAfter observing an area, building, or object for 1 full round, you memorize its exact structural layout, dimensions, and structural columns. You gain a +4 Bonus to Navigation, Architecture, or Tactical checks involving that specific location.",
    "mechanics": "After observing an area, building, or object for 1 full round, you memorize its exact structural layout, dimensions, and structural columns. You gain a +4 Bonus to Navigation, Architecture, or Tactical checks involving that specific location.",
    "notes": "[Modifier] +4 to Navigation\n[Modifier] +4 to Architecture\n[Modifier] +4 to Tactical\n[Rule] Prerequisite: Eidetic Memory, Awareness 2.\n[Prerequisite] Eidetic Memory, Awareness 2",
    "notesList": [
      "[Modifier] +4 to Navigation",
      "[Modifier] +4 to Architecture",
      "[Modifier] +4 to Tactical",
      "[Rule] Prerequisite: Eidetic Memory, Awareness 2.",
      "[Prerequisite] Eidetic Memory, Awareness 2"
    ]
  },
  {
    "id": "general-eidetic-memory",
    "name": "Eidetic Memory",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intellect 2",
    "prerequisite_text": "Intellect 2",
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
    "rules": "Prerequisite: Intellect 2.",
    "special_rules": "Prerequisite: Intellect 2.",
    "body": "# Eidetic Memory\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 2\n\n## Description\nThe character remembers everything they see or read with fair accuracy.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** on Memory Checks. You may use **Knowledge Skills Untrained**, as you recall snippets of information you’ve encountered previously.",
    "full_text": "# Eidetic Memory\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 2\n\n## Description\nThe character remembers everything they see or read with fair accuracy.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** on Memory Checks. You may use **Knowledge Skills Untrained**, as you recall snippets of information you’ve encountered previously.",
    "mechanics": "Gain a **\\+4 Bonus** on Memory Checks. You may use **Knowledge Skills Untrained**, as you recall snippets of information you’ve encountered previously.",
    "notes": "[Modifier] +4 to Memory\n[Rule] Prerequisite: Intellect 2.\n[Prerequisite] Intellect 2",
    "notesList": [
      "[Modifier] +4 to Memory",
      "[Rule] Prerequisite: Intellect 2.",
      "[Prerequisite] Intellect 2"
    ]
  },
  {
    "id": "general-endurance",
    "name": "Endurance",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Stamina 1",
    "prerequisite_text": "Stamina 1",
    "modifiers": [
      {
        "target": "Endurance",
        "type": "save",
        "value": 4,
        "mode": "inherent",
        "description": "+4 on checks to resist physical exhaustion, suffocation, and starvation"
      }
    ],
    "description": "The character has exceptional cardiovascular health and stamina for long-term exertion.",
    "mechanic": "Gain a **\\+4 Bonus** on checks to resist non-lethal damage from exhaustion, starvation, thirst, or forced marches. You can hold your breath twice as long as normal.",
    "rules": "Prerequisite: Stamina 1.",
    "special_rules": "Prerequisite: Stamina 1.",
    "body": "# Endurance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThe character has exceptional cardiovascular health and stamina for long-term exertion.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** on checks to resist non-lethal damage from exhaustion, starvation, thirst, or forced marches. You can hold your breath twice as long as normal.",
    "full_text": "# Endurance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThe character has exceptional cardiovascular health and stamina for long-term exertion.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** on checks to resist non-lethal damage from exhaustion, starvation, thirst, or forced marches. You can hold your breath twice as long as normal.",
    "mechanics": "Gain a **\\+4 Bonus** on checks to resist non-lethal damage from exhaustion, starvation, thirst, or forced marches. You can hold your breath twice as long as normal.",
    "notes": "[Modifier] +4 on checks to resist physical exhaustion, suffocation, and starvation\n[Rule] Prerequisite: Stamina 1.\n[Prerequisite] Stamina 1",
    "notesList": [
      "[Modifier] +4 on checks to resist physical exhaustion, suffocation, and starvation",
      "[Rule] Prerequisite: Stamina 1.",
      "[Prerequisite] Stamina 1"
    ]
  },
  {
    "id": "general-extreme-endurance",
    "name": "Extreme Endurance",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Stamina 3",
    "prerequisite_text": "Stamina 3",
    "modifiers": [
      {
        "target": "Stamina",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Stamina"
      }
    ],
    "description": "A rare point mutation (like the EPOR gene) causes the character's bone marrow to overproduce red blood cells, granting them a permanently maximized oxygen-carrying capacity.",
    "mechanic": "You gain a +4 Bonus to all Stamina checks involving breath-holding, suffocation, or intense aerobic exertion. Your movement speed is not reduced when fatigued.",
    "rules": "Prerequisite: Stamina 3.",
    "special_rules": "Prerequisite: Stamina 3.",
    "body": "# Extreme Endurance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 3\n\n## Description\nA rare point mutation (like the EPOR gene) causes the character's bone marrow to overproduce red blood cells, granting them a permanently maximized oxygen-carrying capacity.\n\n## Mechanics & Benefit\nYou gain a +4 Bonus to all Stamina checks involving breath-holding, suffocation, or intense aerobic exertion. Your movement speed is not reduced when fatigued.",
    "full_text": "# Extreme Endurance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 3\n\n## Description\nA rare point mutation (like the EPOR gene) causes the character's bone marrow to overproduce red blood cells, granting them a permanently maximized oxygen-carrying capacity.\n\n## Mechanics & Benefit\nYou gain a +4 Bonus to all Stamina checks involving breath-holding, suffocation, or intense aerobic exertion. Your movement speed is not reduced when fatigued.",
    "mechanics": "You gain a +4 Bonus to all Stamina checks involving breath-holding, suffocation, or intense aerobic exertion. Your movement speed is not reduced when fatigued.",
    "notes": "[Modifier] +4 to Stamina\n[Rule] Prerequisite: Stamina 3.\n[Prerequisite] Stamina 3",
    "notesList": [
      "[Modifier] +4 to Stamina",
      "[Rule] Prerequisite: Stamina 3.",
      "[Prerequisite] Stamina 3"
    ]
  },
  {
    "id": "general-fast-heal",
    "name": "Fast Heal",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Stamina 2",
    "prerequisite_text": "Stamina 2",
    "modifiers": [],
    "description": "The character's metabolism repairs tissue at an accelerated rate.",
    "mechanic": "Your natural healing rate is **doubled**. You recover Vitality and Health twice as fast during Rest.",
    "rules": "This feature is \\[Ranked\\]. Rank 2 \\= 3x healing, Rank 3 \\= 4x healing.",
    "special_rules": "This feature is \\[Ranked\\]. Rank 2 \\= 3x healing, Rank 3 \\= 4x healing.",
    "body": "# Fast Heal\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 2\n\n## Description\nThe character's metabolism repairs tissue at an accelerated rate.\n\n## Mechanics & Benefit\nYour natural healing rate is **doubled**. You recover Vitality and Health twice as fast during Rest.\n\n## Special Rules\nThis feature is \\[Ranked\\]. Rank 2 \\= 3x healing, Rank 3 \\= 4x healing.",
    "full_text": "# Fast Heal\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 2\n\n## Description\nThe character's metabolism repairs tissue at an accelerated rate.\n\n## Mechanics & Benefit\nYour natural healing rate is **doubled**. You recover Vitality and Health twice as fast during Rest.\n\n## Special Rules\nThis feature is \\[Ranked\\]. Rank 2 \\= 3x healing, Rank 3 \\= 4x healing.",
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
    "bp": 3,
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
    "prerequisites": "Awareness 1",
    "prerequisite_text": "Awareness 1",
    "modifiers": [
      {
        "target": "social-manipulation-bluff",
        "type": "skill",
        "value": 2,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Against favored creature type",
        "description": "+2 to Bluff against chosen creature type"
      },
      {
        "target": "social-manipulation-insight",
        "type": "skill",
        "value": 2,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Against favored creature type",
        "description": "+2 to Insight against chosen creature type"
      },
      {
        "target": "mental-knowledges-survival",
        "type": "skill",
        "value": 2,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Against favored creature type",
        "description": "+2 to Survival against chosen creature type"
      }
    ],
    "description": "The character has studied a specific type of creature extensively, knowing their anatomy, tactics, and psychology.",
    "mechanic": "Choose a creature type (e.g., Humanoid \\[Human\\], Beast, Synthetic, Aberration). You gain a **\\+2 Bonus** to **Strike**, **Damage**, **Bluff**, **Insight**, and **Survival** checks against them.",
    "rules": "\\[Multiple\\] Can be taken for different creature types.",
    "special_rules": "\\[Multiple\\] Can be taken for different creature types.",
    "body": "# Favored Enemy\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 1\n\n## Description\nThe character has studied a specific type of creature extensively, knowing their anatomy, tactics, and psychology.\n\n## Mechanics & Benefit\nChoose a creature type (e.g., Humanoid \\[Human\\], Beast, Synthetic, Aberration). You gain a **\\+2 Bonus** to **Strike**, **Damage**, **Bluff**, **Insight**, and **Survival** checks against them.\n\n## Special Rules\n\\[Multiple\\] Can be taken for different creature types.",
    "full_text": "# Favored Enemy\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 1\n\n## Description\nThe character has studied a specific type of creature extensively, knowing their anatomy, tactics, and psychology.\n\n## Mechanics & Benefit\nChoose a creature type (e.g., Humanoid \\[Human\\], Beast, Synthetic, Aberration). You gain a **\\+2 Bonus** to **Strike**, **Damage**, **Bluff**, **Insight**, and **Survival** checks against them.\n\n## Special Rules\n\\[Multiple\\] Can be taken for different creature types.",
    "mechanics": "Choose a creature type (e.g., Humanoid \\[Human\\], Beast, Synthetic, Aberration). You gain a **\\+2 Bonus** to **Strike**, **Damage**, **Bluff**, **Insight**, and **Survival** checks against them.",
    "notes": "[Modifier] +2 to Bluff against chosen creature type\n[Modifier] +2 to Insight against chosen creature type\n[Modifier] +2 to Survival against chosen creature type\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Multiple\\] Can be taken for different creature types.\n[Prerequisite] Awareness 1",
    "notesList": [
      "[Modifier] +2 to Bluff against chosen creature type",
      "[Modifier] +2 to Insight against chosen creature type",
      "[Modifier] +2 to Survival against chosen creature type",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Will 3+",
    "prerequisite_text": "Will 3+",
    "modifiers": [],
    "description": "Whether through madness, conditioning, or bravery, the character is immune to terror.",
    "mechanic": "You are **Immune** to Fear effects (magical, psionic, or mundane intimidation).",
    "rules": "Prerequisite: Will 3+.",
    "special_rules": "Prerequisite: Will 3+.",
    "body": "# Fearless\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Will 3+\n\n## Description\nWhether through madness, conditioning, or bravery, the character is immune to terror.\n\n## Mechanics & Benefit\nYou are **Immune** to Fear effects (magical, psionic, or mundane intimidation).",
    "full_text": "# Fearless\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Will 3+\n\n## Description\nWhether through madness, conditioning, or bravery, the character is immune to terror.\n\n## Mechanics & Benefit\nYou are **Immune** to Fear effects (magical, psionic, or mundane intimidation).",
    "mechanics": "You are **Immune** to Fear effects (magical, psionic, or mundane intimidation).",
    "notes": "[Rule] Prerequisite: Will 3+.\n[Prerequisite] Will 3+",
    "notesList": [
      "[Rule] Prerequisite: Will 3+.",
      "[Prerequisite] Will 3+"
    ]
  },
  {
    "id": "general-hyperthymesia",
    "name": "Hyperthymesia",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Eidetic Memory, Wisdom 2",
    "prerequisite_text": "Eidetic Memory, Wisdom 2",
    "modifiers": [],
    "description": "Highly Superior Autobiographical Memory (HSAM). The character involuntarily and flawlessly records every moment of their life, immune to the standard reconstructive decay of memory.",
    "mechanic": "You automatically succeed on any Memory check related to events you have personally experienced. You are Immune to memory alteration, gaslighting, or mind-altering effects that attempt to erase or rewrite your past.",
    "rules": "Prerequisite: Eidetic Memory, Wisdom 2.",
    "special_rules": "Prerequisite: Eidetic Memory, Wisdom 2.",
    "body": "# Hyperthymesia\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Eidetic Memory, Wisdom 2\n\n## Description\nHighly Superior Autobiographical Memory (HSAM). The character involuntarily and flawlessly records every moment of their life, immune to the standard reconstructive decay of memory.\n\n## Mechanics & Benefit\nYou automatically succeed on any Memory check related to events you have personally experienced. You are Immune to memory alteration, gaslighting, or mind-altering effects that attempt to erase or rewrite your past.",
    "full_text": "# Hyperthymesia\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Eidetic Memory, Wisdom 2\n\n## Description\nHighly Superior Autobiographical Memory (HSAM). The character involuntarily and flawlessly records every moment of their life, immune to the standard reconstructive decay of memory.\n\n## Mechanics & Benefit\nYou automatically succeed on any Memory check related to events you have personally experienced. You are Immune to memory alteration, gaslighting, or mind-altering effects that attempt to erase or rewrite your past.",
    "mechanics": "You automatically succeed on any Memory check related to events you have personally experienced. You are Immune to memory alteration, gaslighting, or mind-altering effects that attempt to erase or rewrite your past.",
    "notes": "[Rule] Prerequisite: Eidetic Memory, Wisdom 2.\n[Prerequisite] Eidetic Memory, Wisdom 2",
    "notesList": [
      "[Rule] Prerequisite: Eidetic Memory, Wisdom 2.",
      "[Prerequisite] Eidetic Memory, Wisdom 2"
    ]
  },
  {
    "id": "general-hypoxia-tolerance",
    "name": "Hypoxia Tolerance",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Stamina 1",
    "prerequisite_text": "Stamina 1",
    "modifiers": [],
    "description": "Genetic variants (such as EPAS1/EGLN1) allow the character to thrive in environments with severely depleted oxygen without suffering altitude sickness or cardiovascular strain.",
    "mechanic": "You suffer no penalties for operating in high-altitude, low-oxygen, or thin-atmosphere environments. You require 50% less oxygen to survive than a standard member of your species.",
    "rules": "Prerequisite: Stamina 1.",
    "special_rules": "Prerequisite: Stamina 1.",
    "body": "# Hypoxia Tolerance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nGenetic variants (such as EPAS1/EGLN1) allow the character to thrive in environments with severely depleted oxygen without suffering altitude sickness or cardiovascular strain.\n\n## Mechanics & Benefit\nYou suffer no penalties for operating in high-altitude, low-oxygen, or thin-atmosphere environments. You require 50% less oxygen to survive than a standard member of your species.",
    "full_text": "# Hypoxia Tolerance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nGenetic variants (such as EPAS1/EGLN1) allow the character to thrive in environments with severely depleted oxygen without suffering altitude sickness or cardiovascular strain.\n\n## Mechanics & Benefit\nYou suffer no penalties for operating in high-altitude, low-oxygen, or thin-atmosphere environments. You require 50% less oxygen to survive than a standard member of your species.",
    "mechanics": "You suffer no penalties for operating in high-altitude, low-oxygen, or thin-atmosphere environments. You require 50% less oxygen to survive than a standard member of your species.",
    "notes": "[Rule] Prerequisite: Stamina 1.\n[Prerequisite] Stamina 1",
    "notesList": [
      "[Rule] Prerequisite: Stamina 1.",
      "[Prerequisite] Stamina 1"
    ]
  },
  {
    "id": "general-inventor",
    "name": "Inventor",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "A natural genius for engineering, jury-rigging, and prototyping novel technology, field modifications, and experimental devices.",
    "mechanic": "The character reduces the time required to build, upgrade, or modify weapons, armor, and gear by 50%. Once per session, they can jury-rig a temporary gadget or override an incompatible system with scrap parts, functioning reliably for a scene before breaking down.",
    "rules": "",
    "special_rules": "",
    "body": "# Inventor\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses an innate intuitive grasp of mechanical, electronic, and energetic principles, enabling them to fabricate bespoke solutions and jury-rig sophisticated hardware under impossible conditions.\n\n## Mechanics & Benefit\nThe character reduces the time required to build, upgrade, or modify weapons, armor, and gear by 50%. Once per session, they can jury-rig a temporary gadget or override an incompatible system with scrap parts, functioning reliably for a scene before breaking down.",
    "full_text": "# Inventor\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses an innate intuitive grasp of mechanical, electronic, and energetic principles, enabling them to fabricate bespoke solutions and jury-rig sophisticated hardware under impossible conditions.\n\n## Mechanics & Benefit\nThe character reduces the time required to build, upgrade, or modify weapons, armor, and gear by 50%. Once per session, they can jury-rig a temporary gadget or override an incompatible system with scrap parts, functioning reliably for a scene before breaking down.",
    "mechanics": "The character reduces the time required to build, upgrade, or modify weapons, armor, and gear by 50%. Once per session, they can jury-rig a temporary gadget or override an incompatible system with scrap parts, functioning reliably for a scene before breaking down.",
    "notes": "",
    "notesList": []
  },
  {
    "id": "general-jack-of-all-trades",
    "name": "Jack-of-all-trades",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intellect 2",
    "prerequisite_text": "Intellect 2",
    "modifiers": [
      {
        "target": "All Skills",
        "type": "untrained",
        "value": 0,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Untrained skill checks",
        "description": "May attempt any skill check untrained without suffering CR penalties"
      }
    ],
    "description": "The character has picked up a little bit of everything in their travels.",
    "mechanic": "You may attempt **any Skill check Untrained**, even those normally requiring training (like Medicine, Engineering, or Piloting).",
    "rules": "Prerequisite: Intellect 2.",
    "special_rules": "Prerequisite: Intellect 2.",
    "body": "# Jack-of-all-trades\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 2\n\n## Description\nThe character has picked up a little bit of everything in their travels.\n\n## Mechanics & Benefit\nYou may attempt **any Skill check Untrained**, even those normally requiring training (like Medicine, Engineering, or Piloting).",
    "full_text": "# Jack-of-all-trades\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 2\n\n## Description\nThe character has picked up a little bit of everything in their travels.\n\n## Mechanics & Benefit\nYou may attempt **any Skill check Untrained**, even those normally requiring training (like Medicine, Engineering, or Piloting).",
    "mechanics": "You may attempt **any Skill check Untrained**, even those normally requiring training (like Medicine, Engineering, or Piloting).",
    "notes": "[Modifier] May attempt any skill check untrained without suffering CR penalties\n[Rule] Prerequisite: Intellect 2.\n[Prerequisite] Intellect 2",
    "notesList": [
      "[Modifier] May attempt any skill check untrained without suffering CR penalties",
      "[Rule] Prerequisite: Intellect 2.",
      "[Prerequisite] Intellect 2"
    ]
  },
  {
    "id": "general-lactate-immunity",
    "name": "Lactate Immunity",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Endurance, Stamina 4",
    "prerequisite_text": "Endurance, Stamina 4",
    "modifiers": [],
    "description": "The character's physiology clears lactic acid so efficiently that they effectively never hit a lactate threshold. Their muscles do not burn or fail from prolonged standard exertion.",
    "mechanic": "You are Immune to physical fatigue caused by running, swimming, or aerobic exertion. You can travel continuously at a run for days without requiring rest, provided you remain calorically fueled and hydrated.",
    "rules": "Prerequisite: Endurance, Stamina 4.",
    "special_rules": "Prerequisite: Endurance, Stamina 4.",
    "body": "# Lactate Immunity\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Endurance, Stamina 4\n\n## Description\nThe character's physiology clears lactic acid so efficiently that they effectively never hit a lactate threshold. Their muscles do not burn or fail from prolonged standard exertion.\n\n## Mechanics & Benefit\nYou are Immune to physical fatigue caused by running, swimming, or aerobic exertion. You can travel continuously at a run for days without requiring rest, provided you remain calorically fueled and hydrated.",
    "full_text": "# Lactate Immunity\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Endurance, Stamina 4\n\n## Description\nThe character's physiology clears lactic acid so efficiently that they effectively never hit a lactate threshold. Their muscles do not burn or fail from prolonged standard exertion.\n\n## Mechanics & Benefit\nYou are Immune to physical fatigue caused by running, swimming, or aerobic exertion. You can travel continuously at a run for days without requiring rest, provided you remain calorically fueled and hydrated.",
    "mechanics": "You are Immune to physical fatigue caused by running, swimming, or aerobic exertion. You can travel continuously at a run for days without requiring rest, provided you remain calorically fueled and hydrated.",
    "notes": "[Rule] Prerequisite: Endurance, Stamina 4.\n[Prerequisite] Endurance, Stamina 4",
    "notesList": [
      "[Rule] Prerequisite: Endurance, Stamina 4.",
      "[Prerequisite] Endurance, Stamina 4"
    ]
  },
  {
    "id": "general-lightning-calculator",
    "name": "Lightning Calculator",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Intellect 1",
    "prerequisite_text": "Intellect 1",
    "modifiers": [],
    "description": "The character is a living computer, able to perform complex mathematics instantly.",
    "mechanic": "You perform mathematical calculations at **2x speed**. This applies to Astrogation, Engineering calculations, and Cryptography.",
    "rules": "Ranked selection. Prerequisite: Intellect 1.",
    "special_rules": "Ranked selection. Prerequisite: Intellect 1.",
    "body": "# Lightning Calculator\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 1\n\n## Description\nThe character is a living computer, able to perform complex mathematics instantly.\n\n## Mechanics & Benefit\nYou perform mathematical calculations at **2x speed**. This applies to Astrogation, Engineering calculations, and Cryptography.",
    "full_text": "# Lightning Calculator\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 1\n\n## Description\nThe character is a living computer, able to perform complex mathematics instantly.\n\n## Mechanics & Benefit\nYou perform mathematical calculations at **2x speed**. This applies to Astrogation, Engineering calculations, and Cryptography.",
    "mechanics": "You perform mathematical calculations at **2x speed**. This applies to Astrogation, Engineering calculations, and Cryptography.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked selection. Prerequisite: Intellect 1.\n[Prerequisite] Intellect 1",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked selection. Prerequisite: Intellect 1.",
      "[Prerequisite] Intellect 1"
    ]
  },
  {
    "id": "general-master-plan",
    "name": "Master Plan",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Logic 6, Intellect 3",
    "prerequisite_text": "Logic 6, Intellect 3",
    "modifiers": [],
    "description": "The character is a tactical genius who prepares for every eventuality.",
    "mechanic": "If you have time to prepare for an encounter (minimum 1 hour), make a **Logic Check**. For every point your result exceeds CR 10, you create a **Bonus Pool**.  \n* **Usage:** During the encounter, you can distribute these points to allies (as a free action) to add to their Attack rolls or Skill checks.",
    "rules": "Prerequisite: Logic 6, Intellect 3.",
    "special_rules": "Prerequisite: Logic 6, Intellect 3.",
    "body": "# Master Plan\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Logic 6, Intellect 3\n\n## Description\nThe character is a tactical genius who prepares for every eventuality.\n\n## Mechanics & Benefit\nIf you have time to prepare for an encounter (minimum 1 hour), make a **Logic Check**. For every point your result exceeds CR 10, you create a **Bonus Pool**.  \n* **Usage:** During the encounter, you can distribute these points to allies (as a free action) to add to their Attack rolls or Skill checks.",
    "full_text": "# Master Plan\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Logic 6, Intellect 3\n\n## Description\nThe character is a tactical genius who prepares for every eventuality.\n\n## Mechanics & Benefit\nIf you have time to prepare for an encounter (minimum 1 hour), make a **Logic Check**. For every point your result exceeds CR 10, you create a **Bonus Pool**.  \n* **Usage:** During the encounter, you can distribute these points to allies (as a free action) to add to their Attack rolls or Skill checks.",
    "mechanics": "If you have time to prepare for an encounter (minimum 1 hour), make a **Logic Check**. For every point your result exceeds CR 10, you create a **Bonus Pool**.  \n* **Usage:** During the encounter, you can distribute these points to allies (as a free action) to add to their Attack rolls or Skill checks.",
    "notes": "[Rule] Prerequisite: Logic 6, Intellect 3.\n[Prerequisite] Logic 6, Intellect 3",
    "notesList": [
      "[Rule] Prerequisite: Logic 6, Intellect 3.",
      "[Prerequisite] Logic 6, Intellect 3"
    ]
  },
  {
    "id": "general-mental-alacrity",
    "name": "Mental Alacrity",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intellect 2, Lightning Calculator",
    "prerequisite_text": "Intellect 2, Lightning Calculator",
    "modifiers": [],
    "description": "The character thinks at hyperspeed, allowing them to perform mental tasks while others are still reacting.",
    "mechanic": "You gain an additional **Mental Action** per round, provided you take no Physical actions that round.  \n  * *Usage:* Useful for issuing commands, hacking, scanning, or using purely mental Psionics.",
    "rules": "Prerequisite: Intellect 2, Lightning Calculator.",
    "special_rules": "Prerequisite: Intellect 2, Lightning Calculator.",
    "body": "# Mental Alacrity\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 2, Lightning Calculator\n\n## Description\nThe character thinks at hyperspeed, allowing them to perform mental tasks while others are still reacting.\n\n## Mechanics & Benefit\nYou gain an additional **Mental Action** per round, provided you take no Physical actions that round.  \n  * *Usage:* Useful for issuing commands, hacking, scanning, or using purely mental Psionics.",
    "full_text": "# Mental Alacrity\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 2, Lightning Calculator\n\n## Description\nThe character thinks at hyperspeed, allowing them to perform mental tasks while others are still reacting.\n\n## Mechanics & Benefit\nYou gain an additional **Mental Action** per round, provided you take no Physical actions that round.  \n  * *Usage:* Useful for issuing commands, hacking, scanning, or using purely mental Psionics.",
    "mechanics": "You gain an additional **Mental Action** per round, provided you take no Physical actions that round.  \n  * *Usage:* Useful for issuing commands, hacking, scanning, or using purely mental Psionics.",
    "notes": "[Rule] Prerequisite: Intellect 2, Lightning Calculator.\n[Prerequisite] Intellect 2, Lightning Calculator",
    "notesList": [
      "[Rule] Prerequisite: Intellect 2, Lightning Calculator.",
      "[Prerequisite] Intellect 2, Lightning Calculator"
    ]
  },
  {
    "id": "general-multiplexing",
    "name": "Multiplexing",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Mental Alacrity, Intellect 3",
    "prerequisite_text": "Mental Alacrity, Intellect 3",
    "modifiers": [
      {
        "target": "Additional Mental",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Additional Mental"
      }
    ],
    "description": "The character's mind can process multiple parallel streams of thought.",
    "mechanic": "Gain **\\+1 additional Mental Action** per round to your Mental Alacrity pool.",
    "rules": "\\[Ranked\\] Limited by Intellect modifier.",
    "special_rules": "\\[Ranked\\] Limited by Intellect modifier.",
    "body": "# Multiplexing\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Mental Alacrity, Intellect 3\n\n## Description\nThe character's mind can process multiple parallel streams of thought.\n\n## Mechanics & Benefit\nGain **\\+1 additional Mental Action** per round to your Mental Alacrity pool.\n\n## Special Rules\n\\[Ranked\\] Limited by Intellect modifier.",
    "full_text": "# Multiplexing\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Mental Alacrity, Intellect 3\n\n## Description\nThe character's mind can process multiple parallel streams of thought.\n\n## Mechanics & Benefit\nGain **\\+1 additional Mental Action** per round to your Mental Alacrity pool.\n\n## Special Rules\n\\[Ranked\\] Limited by Intellect modifier.",
    "mechanics": "Gain **\\+1 additional Mental Action** per round to your Mental Alacrity pool.",
    "notes": "[Modifier] +1 to Additional Mental\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] \\[Ranked\\] Limited by Intellect modifier.\n[Prerequisite] Mental Alacrity, Intellect 3",
    "notesList": [
      "[Modifier] +1 to Additional Mental",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] \\[Ranked\\] Limited by Intellect modifier.",
      "[Prerequisite] Mental Alacrity, Intellect 3"
    ]
  },
  {
    "id": "general-myostatin-hypertrophy",
    "name": "Myostatin Hypertrophy",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Strength 3, Stamina 2",
    "prerequisite_text": "Strength 3, Stamina 2",
    "modifiers": [
      {
        "target": "Might",
        "type": "save",
        "value": 2,
        "mode": "inherent",
        "description": "+2 on Might Checks"
      },
      {
        "target": "Athletics",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Athletics"
      }
    ],
    "description": "A homozygous mutation in the MSTN gene renders the myostatin protein non-functional, removing biological brakes on muscle fiber proliferation. The character possesses massive, dense musculature without needing to train.",
    "mechanic": "You gain a +2 Bonus to Might and Athletics checks. For the purposes of Grappling, lifting weight, and breaking objects, you are treated as if you are one Size Category larger.",
    "rules": "Prerequisite: Strength 3, Stamina 2.",
    "special_rules": "Prerequisite: Strength 3, Stamina 2.",
    "body": "# Myostatin Hypertrophy\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 3, Stamina 2\n\n## Description\nA homozygous mutation in the MSTN gene renders the myostatin protein non-functional, removing biological brakes on muscle fiber proliferation. The character possesses massive, dense musculature without needing to train.\n\n## Mechanics & Benefit\nYou gain a +2 Bonus to Might and Athletics checks. For the purposes of Grappling, lifting weight, and breaking objects, you are treated as if you are one Size Category larger.",
    "full_text": "# Myostatin Hypertrophy\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 3, Stamina 2\n\n## Description\nA homozygous mutation in the MSTN gene renders the myostatin protein non-functional, removing biological brakes on muscle fiber proliferation. The character possesses massive, dense musculature without needing to train.\n\n## Mechanics & Benefit\nYou gain a +2 Bonus to Might and Athletics checks. For the purposes of Grappling, lifting weight, and breaking objects, you are treated as if you are one Size Category larger.",
    "mechanics": "You gain a +2 Bonus to Might and Athletics checks. For the purposes of Grappling, lifting weight, and breaking objects, you are treated as if you are one Size Category larger.",
    "notes": "[Modifier] +2 on Might Checks\n[Modifier] +2 to Athletics\n[Rule] Prerequisite: Strength 3, Stamina 2.\n[Prerequisite] Strength 3, Stamina 2",
    "notesList": [
      "[Modifier] +2 on Might Checks",
      "[Modifier] +2 to Athletics",
      "[Rule] Prerequisite: Strength 3, Stamina 2.",
      "[Prerequisite] Strength 3, Stamina 2"
    ]
  },
  {
    "id": "general-natural-leader",
    "name": "Natural Leader",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 3, Diplomacy 6",
    "prerequisite_text": "Charisma 3, Diplomacy 6",
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
    "body": "# Natural Leader\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 3, Diplomacy 6\n\n## Description\nThe character attracts loyal followers and can manage a crew or organization effectively.\n\n## Mechanics & Benefit\nYou gain a number of **Followers** (NPCs) and potentially a **Cohort** (a loyal lieutenant). The number and quality depend on your Level and Charisma score. You gain a \\+2 bonus to Organization/Administration checks.",
    "full_text": "# Natural Leader\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 3, Diplomacy 6\n\n## Description\nThe character attracts loyal followers and can manage a crew or organization effectively.\n\n## Mechanics & Benefit\nYou gain a number of **Followers** (NPCs) and potentially a **Cohort** (a loyal lieutenant). The number and quality depend on your Level and Charisma score. You gain a \\+2 bonus to Organization/Administration checks.",
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
    "id": "general-nimble-moves",
    "name": "Nimble Moves",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 2",
    "prerequisite_text": "Agility 2",
    "modifiers": [],
    "description": "The character dances around obstacles that would slow others down.",
    "mechanic": "You ignore **10 feet** of difficult terrain penalties during your movement per round.",
    "rules": "Prerequisite: Agility 2.",
    "special_rules": "Prerequisite: Agility 2.",
    "body": "# Nimble Moves\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2\n\n## Description\nThe character dances around obstacles that would slow others down.\n\n## Mechanics & Benefit\nYou ignore **10 feet** of difficult terrain penalties during your movement per round.",
    "full_text": "# Nimble Moves\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2\n\n## Description\nThe character dances around obstacles that would slow others down.\n\n## Mechanics & Benefit\nYou ignore **10 feet** of difficult terrain penalties during your movement per round.",
    "mechanics": "You ignore **10 feet** of difficult terrain penalties during your movement per round.",
    "notes": "[Rule] Prerequisite: Agility 2.\n[Prerequisite] Agility 2",
    "notesList": [
      "[Rule] Prerequisite: Agility 2.",
      "[Prerequisite] Agility 2"
    ]
  },
  {
    "id": "general-nociceptor-dampening",
    "name": "Nociceptor Dampening",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Pain Tolerance, Stamina 2",
    "prerequisite_text": "Pain Tolerance, Stamina 2",
    "modifiers": [],
    "description": "A mutation in the transcription factors regulating peripheral pain signaling (such as ZFHX2) renders the character profoundly insensitive to noxious pain while retaining normal tactile sensation.",
    "mechanic": "You are Immune to non-lethal Stun damage, shock, and pain-compliance techniques (including torture). You do not suffer any negative mechanical modifiers from being severely wounded or burned. Drawback: You must make Awareness checks to notice if you are taking damage from environmental hazards (like standing on a hot surface).",
    "rules": "Prerequisite: Pain Tolerance, Stamina 2.",
    "special_rules": "Prerequisite: Pain Tolerance, Stamina 2.",
    "body": "# Nociceptor Dampening\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Pain Tolerance, Stamina 2\n\n## Description\nA mutation in the transcription factors regulating peripheral pain signaling (such as ZFHX2) renders the character profoundly insensitive to noxious pain while retaining normal tactile sensation.\n\n## Mechanics & Benefit\nYou are Immune to non-lethal Stun damage, shock, and pain-compliance techniques (including torture). You do not suffer any negative mechanical modifiers from being severely wounded or burned. Drawback: You must make Awareness checks to notice if you are taking damage from environmental hazards (like standing on a hot surface).",
    "full_text": "# Nociceptor Dampening\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Pain Tolerance, Stamina 2\n\n## Description\nA mutation in the transcription factors regulating peripheral pain signaling (such as ZFHX2) renders the character profoundly insensitive to noxious pain while retaining normal tactile sensation.\n\n## Mechanics & Benefit\nYou are Immune to non-lethal Stun damage, shock, and pain-compliance techniques (including torture). You do not suffer any negative mechanical modifiers from being severely wounded or burned. Drawback: You must make Awareness checks to notice if you are taking damage from environmental hazards (like standing on a hot surface).",
    "mechanics": "You are Immune to non-lethal Stun damage, shock, and pain-compliance techniques (including torture). You do not suffer any negative mechanical modifiers from being severely wounded or burned. Drawback: You must make Awareness checks to notice if you are taking damage from environmental hazards (like standing on a hot surface).",
    "notes": "[Rule] Prerequisite: Pain Tolerance, Stamina 2.\n[Prerequisite] Pain Tolerance, Stamina 2",
    "notesList": [
      "[Rule] Prerequisite: Pain Tolerance, Stamina 2.",
      "[Prerequisite] Pain Tolerance, Stamina 2"
    ]
  },
  {
    "id": "general-pain-tolerance",
    "name": "Pain Tolerance",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Tough, Stamina 2",
    "prerequisite_text": "Tough, Stamina 2",
    "modifiers": [
      {
        "target": "Stun",
        "type": "save_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Make Stun checks at Advantage (3d10 keep 2 highest)"
      }
    ],
    "description": "The character can function through agony that would incapacitate others.",
    "mechanic": "You make all **Stun Resistance Checks** at **Advantage**. You do not suffer penalty modifiers from being wounded or fatigued (though you still take the damage).",
    "rules": "Prerequisite: Tough, Stamina 2.",
    "special_rules": "Prerequisite: Tough, Stamina 2.",
    "body": "# Pain Tolerance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Tough, Stamina 2\n\n## Description\nThe character can function through agony that would incapacitate others.\n\n## Mechanics & Benefit\nYou make all **Stun Resistance Checks** at **Advantage**. You do not suffer penalty modifiers from being wounded or fatigued (though you still take the damage).",
    "full_text": "# Pain Tolerance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Tough, Stamina 2\n\n## Description\nThe character can function through agony that would incapacitate others.\n\n## Mechanics & Benefit\nYou make all **Stun Resistance Checks** at **Advantage**. You do not suffer penalty modifiers from being wounded or fatigued (though you still take the damage).",
    "mechanics": "You make all **Stun Resistance Checks** at **Advantage**. You do not suffer penalty modifiers from being wounded or fatigued (though you still take the damage).",
    "notes": "[Modifier] Make Stun checks at Advantage (3d10 keep 2 highest)\n[Rule] Prerequisite: Tough, Stamina 2.\n[Prerequisite] Tough, Stamina 2",
    "notesList": [
      "[Modifier] Make Stun checks at Advantage (3d10 keep 2 highest)",
      "[Rule] Prerequisite: Tough, Stamina 2.",
      "[Prerequisite] Tough, Stamina 2"
    ]
  },
  {
    "id": "general-perfect-balance",
    "name": "Perfect Balance",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Acrobatic Steps, Agility 4",
    "prerequisite_text": "Acrobatic Steps, Agility 4",
    "modifiers": [],
    "description": "The character has perfect equilibrium.",
    "mechanic": "You ignore **all** difficult terrain penalties. You are **Immune to the Prone condition** (you cannot be tripped or knocked down) unless you choose to be.",
    "rules": "Prerequisite: Acrobatic Steps, Agility 4.",
    "special_rules": "Prerequisite: Acrobatic Steps, Agility 4.",
    "body": "# Perfect Balance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Acrobatic Steps, Agility 4\n\n## Description\nThe character has perfect equilibrium.\n\n## Mechanics & Benefit\nYou ignore **all** difficult terrain penalties. You are **Immune to the Prone condition** (you cannot be tripped or knocked down) unless you choose to be.",
    "full_text": "# Perfect Balance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Acrobatic Steps, Agility 4\n\n## Description\nThe character has perfect equilibrium.\n\n## Mechanics & Benefit\nYou ignore **all** difficult terrain penalties. You are **Immune to the Prone condition** (you cannot be tripped or knocked down) unless you choose to be.",
    "mechanics": "You ignore **all** difficult terrain penalties. You are **Immune to the Prone condition** (you cannot be tripped or knocked down) unless you choose to be.",
    "notes": "[Rule] Prerequisite: Acrobatic Steps, Agility 4.\n[Prerequisite] Acrobatic Steps, Agility 4",
    "notesList": [
      "[Rule] Prerequisite: Acrobatic Steps, Agility 4.",
      "[Prerequisite] Acrobatic Steps, Agility 4"
    ]
  },
  {
    "id": "general-photographic-memory",
    "name": "Photographic Memory",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Eidetic Memory, Intellect 4",
    "prerequisite_text": "Eidetic Memory, Intellect 4",
    "modifiers": [],
    "description": "The character's mind is a perfect recorder. Visual and textual information is stored instantly and permanently.",
    "mechanic": "You recall images and texts perfectly. Study time for **Learning new Skills** is reduced by **50%**.",
    "rules": "Prerequisite: Eidetic Memory, Intellect 4.",
    "special_rules": "Prerequisite: Eidetic Memory, Intellect 4.",
    "body": "# Photographic Memory\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Eidetic Memory, Intellect 4\n\n## Description\nThe character's mind is a perfect recorder. Visual and textual information is stored instantly and permanently.\n\n## Mechanics & Benefit\nYou recall images and texts perfectly. Study time for **Learning new Skills** is reduced by **50%**.",
    "full_text": "# Photographic Memory\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Eidetic Memory, Intellect 4\n\n## Description\nThe character's mind is a perfect recorder. Visual and textual information is stored instantly and permanently.\n\n## Mechanics & Benefit\nYou recall images and texts perfectly. Study time for **Learning new Skills** is reduced by **50%**.",
    "mechanics": "You recall images and texts perfectly. Study time for **Learning new Skills** is reduced by **50%**.",
    "notes": "[Rule] Prerequisite: Eidetic Memory, Intellect 4.\n[Prerequisite] Eidetic Memory, Intellect 4",
    "notesList": [
      "[Rule] Prerequisite: Eidetic Memory, Intellect 4.",
      "[Prerequisite] Eidetic Memory, Intellect 4"
    ]
  },
  {
    "id": "general-quick",
    "name": "Quick",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1",
    "prerequisite_text": "Agility 1",
    "modifiers": [
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
    "rules": "Prerequisite: Agility 1.",
    "special_rules": "Prerequisite: Agility 1.",
    "body": "# Quick\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character is naturally fleet of foot.\n\n## Mechanics & Benefit\n**\\+10 feet** to Base Movement Speed and **\\+1 to Initiative**.",
    "full_text": "# Quick\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character is naturally fleet of foot.\n\n## Mechanics & Benefit\n**\\+10 feet** to Base Movement Speed and **\\+1 to Initiative**.",
    "mechanics": "**\\+10 feet** to Base Movement Speed and **\\+1 to Initiative**.",
    "notes": "[Modifier] +1 Initiative\n[Rule] Prerequisite: Agility 1.\n[Prerequisite] Agility 1",
    "notesList": [
      "[Modifier] +1 Initiative",
      "[Rule] Prerequisite: Agility 1.",
      "[Prerequisite] Agility 1"
    ]
  },
  {
    "id": "general-quicker",
    "name": "Quicker",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Quick, Agility 2",
    "prerequisite_text": "Quick, Agility 2",
    "modifiers": [
      {
        "target": "initiative-mod",
        "type": "combat",
        "value": 2,
        "mode": "inherent",
        "description": "+2 Initiative"
      }
    ],
    "description": "The character is exceptionally fast.",
    "mechanic": "**\\+20 feet** (total) to Base Movement Speed and **\\+2 to Initiative**.",
    "rules": "Prerequisite: Quick, Agility 2.",
    "special_rules": "Prerequisite: Quick, Agility 2.",
    "body": "# Quicker\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Quick, Agility 2\n\n## Description\nThe character is exceptionally fast.\n\n## Mechanics & Benefit\n**\\+20 feet** (total) to Base Movement Speed and **\\+2 to Initiative**.",
    "full_text": "# Quicker\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Quick, Agility 2\n\n## Description\nThe character is exceptionally fast.\n\n## Mechanics & Benefit\n**\\+20 feet** (total) to Base Movement Speed and **\\+2 to Initiative**.",
    "mechanics": "**\\+20 feet** (total) to Base Movement Speed and **\\+2 to Initiative**.",
    "notes": "[Modifier] +2 Initiative\n[Rule] Prerequisite: Quick, Agility 2.\n[Prerequisite] Quick, Agility 2",
    "notesList": [
      "[Modifier] +2 Initiative",
      "[Rule] Prerequisite: Quick, Agility 2.",
      "[Prerequisite] Quick, Agility 2"
    ]
  },
  {
    "id": "general-quickest",
    "name": "Quickest",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Quicker, Agility 3",
    "prerequisite_text": "Quicker, Agility 3",
    "modifiers": [
      {
        "target": "initiative-mod",
        "type": "combat",
        "value": 3,
        "mode": "inherent",
        "description": "+3 Initiative"
      }
    ],
    "description": "The character moves as a blur.",
    "mechanic": "**\\+30 feet** (total) to Base Movement Speed and **\\+3 to Initiative**.",
    "rules": "Prerequisite: Quicker, Agility 3.",
    "special_rules": "Prerequisite: Quicker, Agility 3.",
    "body": "# Quickest\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Quicker, Agility 3\n\n## Description\nThe character moves as a blur.\n\n## Mechanics & Benefit\n**\\+30 feet** (total) to Base Movement Speed and **\\+3 to Initiative**.",
    "full_text": "# Quickest\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Quicker, Agility 3\n\n## Description\nThe character moves as a blur.\n\n## Mechanics & Benefit\n**\\+30 feet** (total) to Base Movement Speed and **\\+3 to Initiative**.",
    "mechanics": "**\\+30 feet** (total) to Base Movement Speed and **\\+3 to Initiative**.",
    "notes": "[Modifier] +3 Initiative\n[Rule] Prerequisite: Quicker, Agility 3.\n[Prerequisite] Quicker, Agility 3",
    "notesList": [
      "[Modifier] +3 Initiative",
      "[Rule] Prerequisite: Quicker, Agility 3.",
      "[Prerequisite] Quicker, Agility 3"
    ]
  },
  {
    "id": "general-regeneration",
    "name": "Regeneration",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Fast Heal, Stamina 4",
    "prerequisite_text": "Fast Heal, Stamina 4",
    "modifiers": [],
    "description": "The character's body knits flesh back together in real-time.",
    "mechanic": "You recover **1 Health point per hour** automatically without resting, provided you are not dead. You can regrow lost limbs and organs over 1d4 weeks.",
    "rules": "Prerequisite: Fast Heal, Stamina 4.",
    "special_rules": "Prerequisite: Fast Heal, Stamina 4.",
    "body": "# Regeneration\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Fast Heal, Stamina 4\n\n## Description\nThe character's body knits flesh back together in real-time.\n\n## Mechanics & Benefit\nYou recover **1 Health point per hour** automatically without resting, provided you are not dead. You can regrow lost limbs and organs over 1d4 weeks.",
    "full_text": "# Regeneration\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Fast Heal, Stamina 4\n\n## Description\nThe character's body knits flesh back together in real-time.\n\n## Mechanics & Benefit\nYou recover **1 Health point per hour** automatically without resting, provided you are not dead. You can regrow lost limbs and organs over 1d4 weeks.",
    "mechanics": "You recover **1 Health point per hour** automatically without resting, provided you are not dead. You can regrow lost limbs and organs over 1d4 weeks.",
    "notes": "[Rule] Prerequisite: Fast Heal, Stamina 4.\n[Prerequisite] Fast Heal, Stamina 4",
    "notesList": [
      "[Rule] Prerequisite: Fast Heal, Stamina 4.",
      "[Prerequisite] Fast Heal, Stamina 4"
    ]
  },
  {
    "id": "general-runner",
    "name": "Runner",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Strength 1, Agility 1, Stamina 1",
    "prerequisite_text": "Strength 1, Agility 1, Stamina 1",
    "modifiers": [
      {
        "target": "Athletics",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Athletics"
      }
    ],
    "description": "The character is trained for speed and distance.",
    "mechanic": "You Run at **5x** your base speed (instead of 4x) and Sprint at **7x** (instead of 6x). You gain \\+2 to Athletics checks for running endurance.",
    "rules": "Prerequisite: Strength 1, Agility 1, Stamina 1.",
    "special_rules": "Prerequisite: Strength 1, Agility 1, Stamina 1.",
    "body": "# Runner\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 1, Agility 1, Stamina 1\n\n## Description\nThe character is trained for speed and distance.\n\n## Mechanics & Benefit\nYou Run at **5x** your base speed (instead of 4x) and Sprint at **7x** (instead of 6x). You gain \\+2 to Athletics checks for running endurance.",
    "full_text": "# Runner\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 1, Agility 1, Stamina 1\n\n## Description\nThe character is trained for speed and distance.\n\n## Mechanics & Benefit\nYou Run at **5x** your base speed (instead of 4x) and Sprint at **7x** (instead of 6x). You gain \\+2 to Athletics checks for running endurance.",
    "mechanics": "You Run at **5x** your base speed (instead of 4x) and Sprint at **7x** (instead of 6x). You gain \\+2 to Athletics checks for running endurance.",
    "notes": "[Modifier] +2 to Athletics\n[Rule] Prerequisite: Strength 1, Agility 1, Stamina 1.\n[Prerequisite] Strength 1, Agility 1, Stamina 1",
    "notesList": [
      "[Modifier] +2 to Athletics",
      "[Rule] Prerequisite: Strength 1, Agility 1, Stamina 1.",
      "[Prerequisite] Strength 1, Agility 1, Stamina 1"
    ]
  },
  {
    "id": "general-short-sleeper",
    "name": "Short Sleeper",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Stamina 1",
    "prerequisite_text": "Stamina 1",
    "modifiers": [
      {
        "target": "Saves against them",
        "type": "check_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Saves against them Checks"
      }
    ],
    "description": "A mutation in the DEC2 gene alters the character's circadian rhythm and orexin production. They experience highly concentrated, perfectly restorative sleep.",
    "mechanic": "You only require 4 hours of sleep to gain the full benefits of a Long Rest. You are highly resistant to magical or chemical sleep effects, gaining Advantage on saves against them.",
    "rules": "Prerequisite: Stamina 1.",
    "special_rules": "Prerequisite: Stamina 1.",
    "body": "# Short Sleeper\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nA mutation in the DEC2 gene alters the character's circadian rhythm and orexin production. They experience highly concentrated, perfectly restorative sleep.\n\n## Mechanics & Benefit\nYou only require 4 hours of sleep to gain the full benefits of a Long Rest. You are highly resistant to magical or chemical sleep effects, gaining Advantage on saves against them.",
    "full_text": "# Short Sleeper\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nA mutation in the DEC2 gene alters the character's circadian rhythm and orexin production. They experience highly concentrated, perfectly restorative sleep.\n\n## Mechanics & Benefit\nYou only require 4 hours of sleep to gain the full benefits of a Long Rest. You are highly resistant to magical or chemical sleep effects, gaining Advantage on saves against them.",
    "mechanics": "You only require 4 hours of sleep to gain the full benefits of a Long Rest. You are highly resistant to magical or chemical sleep effects, gaining Advantage on saves against them.",
    "notes": "[Modifier] Advantage on Saves against them Checks\n[Rule] Prerequisite: Stamina 1.\n[Prerequisite] Stamina 1",
    "notesList": [
      "[Modifier] Advantage on Saves against them Checks",
      "[Rule] Prerequisite: Stamina 1.",
      "[Prerequisite] Stamina 1"
    ]
  },
  {
    "id": "general-soar",
    "name": "Soar",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Flight capability (Species trait, cybernetic thrusters, or invocation), Acrobatics 1",
    "prerequisite_text": "Flight capability (Species trait, cybernetic thrusters, or invocation), Acrobatics 1",
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
    "body": "# Soar\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisites**: Flight capability, Acrobatics 1  \n\n## Description\nThe character has mastered aerial dynamics, thermals, and high-velocity flight maneuvers.\n\n## Mechanics & Benefit\n- **Aerial Multiplier Boost**: Increases the speed multiplier of **Surge / Soar** to **5x Flight Speed (10x Walk = 300 ft/rd)** and **Diving** to **9x Flight Speed (18x Walk = 540+ ft/rd)** without increasing action penalties.\n- **Aerobatic Mastery**: Gain **+2 bonus** on Acrobatics checks made to maintain flight maneuvers, execute dives, and perform controlled landings.",
    "full_text": "# Soar\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisites**: Flight capability, Acrobatics 1  \n\n## Description\nThe character has mastered aerial dynamics, thermals, and high-velocity flight maneuvers.\n\n## Mechanics & Benefit\n- **Aerial Multiplier Boost**: Increases the speed multiplier of **Surge / Soar** to **5x Flight Speed (10x Walk = 300 ft/rd)** and **Diving** to **9x Flight Speed (18x Walk = 540+ ft/rd)** without increasing action penalties.\n- **Aerobatic Mastery**: Gain **+2 bonus** on Acrobatics checks made to maintain flight maneuvers, execute dives, and perform controlled landings.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Athletics 1",
    "prerequisite_text": "Athletics 1",
    "modifiers": [
      {
        "target": "Athletics",
        "type": "take_10",
        "value": 10,
        "mode": "inherent",
        "description": "May take 10 on Athletics Checks"
      }
    ],
    "description": "The character is a strong swimmer.",
    "mechanic": "You gain a **Swim Speed** equal to half your base speed. You may **Take 10** on Swim checks even in stormy water. You can hold your breath for 3x Constitution score in rounds.",
    "rules": "Prerequisite: Athletics 1.",
    "special_rules": "Prerequisite: Athletics 1.",
    "body": "# Swimmer\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Athletics 1\n\n## Description\nThe character is a strong swimmer.\n\n## Mechanics & Benefit\nYou gain a **Swim Speed** equal to half your base speed. You may **Take 10** on Swim checks even in stormy water. You can hold your breath for 3x Constitution score in rounds.",
    "full_text": "# Swimmer\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Athletics 1\n\n## Description\nThe character is a strong swimmer.\n\n## Mechanics & Benefit\nYou gain a **Swim Speed** equal to half your base speed. You may **Take 10** on Swim checks even in stormy water. You can hold your breath for 3x Constitution score in rounds.",
    "mechanics": "You gain a **Swim Speed** equal to half your base speed. You may **Take 10** on Swim checks even in stormy water. You can hold your breath for 3x Constitution score in rounds.",
    "notes": "[Modifier] May take 10 on Athletics Checks\n[Rule] Prerequisite: Athletics 1.\n[Prerequisite] Athletics 1",
    "notesList": [
      "[Modifier] May take 10 on Athletics Checks",
      "[Rule] Prerequisite: Athletics 1.",
      "[Prerequisite] Athletics 1"
    ]
  },
  {
    "id": "general-synesthetic-savant",
    "name": "Synesthetic Savant",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intellect 2",
    "prerequisite_text": "Intellect 2",
    "modifiers": [
      {
        "target": "Memory",
        "type": "check_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Memory Checks"
      },
      {
        "target": "Disbelieve fake stimuli",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Disbelieve fake stimuli"
      }
    ],
    "description": "The character experiences profound, cross-modal sensory wiring (e.g., seeing numbers as colors and textures). This provides a permanent, involuntary mnemonic structure for data retention.",
    "mechanic": "You gain Advantage on all Memory checks, Knowledge retrieval, and cryptography. Your unique perception makes you highly resistant to visual illusions, granting a +2 Bonus to disbelieve fake stimuli.",
    "rules": "Prerequisite: Intellect 2.",
    "special_rules": "Prerequisite: Intellect 2.",
    "body": "# Synesthetic Savant\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 2\n\n## Description\nThe character experiences profound, cross-modal sensory wiring (e.g., seeing numbers as colors and textures). This provides a permanent, involuntary mnemonic structure for data retention.\n\n## Mechanics & Benefit\nYou gain Advantage on all Memory checks, Knowledge retrieval, and cryptography. Your unique perception makes you highly resistant to visual illusions, granting a +2 Bonus to disbelieve fake stimuli.",
    "full_text": "# Synesthetic Savant\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 2\n\n## Description\nThe character experiences profound, cross-modal sensory wiring (e.g., seeing numbers as colors and textures). This provides a permanent, involuntary mnemonic structure for data retention.\n\n## Mechanics & Benefit\nYou gain Advantage on all Memory checks, Knowledge retrieval, and cryptography. Your unique perception makes you highly resistant to visual illusions, granting a +2 Bonus to disbelieve fake stimuli.",
    "mechanics": "You gain Advantage on all Memory checks, Knowledge retrieval, and cryptography. Your unique perception makes you highly resistant to visual illusions, granting a +2 Bonus to disbelieve fake stimuli.",
    "notes": "[Modifier] Advantage on Memory Checks\n[Modifier] +2 to Disbelieve fake stimuli\n[Rule] Prerequisite: Intellect 2.\n[Prerequisite] Intellect 2",
    "notesList": [
      "[Modifier] Advantage on Memory Checks",
      "[Modifier] +2 to Disbelieve fake stimuli",
      "[Rule] Prerequisite: Intellect 2.",
      "[Prerequisite] Intellect 2"
    ]
  },
  {
    "id": "general-tetrachromacy",
    "name": "Tetrachromacy",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awareness 2, Special (Genetically Female, or engineered variant)",
    "prerequisite_text": "Awareness 2, Special (Genetically Female, or engineered variant)",
    "modifiers": [
      {
        "target": "Alertness",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Alertness"
      },
      {
        "target": "Investigation",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Investigation"
      },
      {
        "target": "Tracking",
        "type": "skill",
        "value": 4,
        "mode": "inherent",
        "description": "+4 to Tracking"
      }
    ],
    "description": "The presence of a fourth class of cone cell in the retina allows the character to perceive millions of hues invisible to a standard trichromatic human.",
    "mechanic": "You gain a +4 Bonus on Perception, Investigation, and Tracking checks that rely on visual details. You can instantly spot metameric camouflages (e.g., artificial foliage vs. real foliage, or subtle skin discoloration from poisons/shapeshifting).",
    "rules": "Prerequisite: Awareness 2, Special (Genetically Female, or engineered variant).",
    "special_rules": "Prerequisite: Awareness 2, Special (Genetically Female, or engineered variant).",
    "body": "# Tetrachromacy\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 2, Special (Genetically Female, or engineered variant)\n\n## Description\nThe presence of a fourth class of cone cell in the retina allows the character to perceive millions of hues invisible to a standard trichromatic human.\n\n## Mechanics & Benefit\nYou gain a +4 Bonus on Perception, Investigation, and Tracking checks that rely on visual details. You can instantly spot metameric camouflages (e.g., artificial foliage vs. real foliage, or subtle skin discoloration from poisons/shapeshifting).",
    "full_text": "# Tetrachromacy\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 2, Special (Genetically Female, or engineered variant)\n\n## Description\nThe presence of a fourth class of cone cell in the retina allows the character to perceive millions of hues invisible to a standard trichromatic human.\n\n## Mechanics & Benefit\nYou gain a +4 Bonus on Perception, Investigation, and Tracking checks that rely on visual details. You can instantly spot metameric camouflages (e.g., artificial foliage vs. real foliage, or subtle skin discoloration from poisons/shapeshifting).",
    "mechanics": "You gain a +4 Bonus on Perception, Investigation, and Tracking checks that rely on visual details. You can instantly spot metameric camouflages (e.g., artificial foliage vs. real foliage, or subtle skin discoloration from poisons/shapeshifting).",
    "notes": "[Modifier] +4 to Alertness\n[Modifier] +4 to Investigation\n[Modifier] +4 to Tracking\n[Rule] Prerequisite: Awareness 2, Special (Genetically Female, or engineered variant).\n[Prerequisite] Awareness 2, Special (Genetically Female, or engineered variant)",
    "notesList": [
      "[Modifier] +4 to Alertness",
      "[Modifier] +4 to Investigation",
      "[Modifier] +4 to Tracking",
      "[Rule] Prerequisite: Awareness 2, Special (Genetically Female, or engineered variant).",
      "[Prerequisite] Awareness 2, Special (Genetically Female, or engineered variant)"
    ]
  },
  {
    "id": "general-tough",
    "name": "Tough",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Stamina 1",
    "prerequisite_text": "Stamina 1",
    "modifiers": [
      {
        "target": "armor-dr",
        "type": "combat",
        "value": 5,
        "mode": "inherent",
        "description": "+5 DR"
      }
    ],
    "description": "The character has a high threshold for pain and minor trauma.",
    "mechanic": "You gain **Damage Resistance (DR) 5** specifically against **Non-Lethal** damage and Stun damage.",
    "rules": "Prerequisite: Stamina 1.",
    "special_rules": "Prerequisite: Stamina 1.",
    "body": "# Tough\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThe character has a high threshold for pain and minor trauma.\n\n## Mechanics & Benefit\nYou gain **Damage Resistance (DR) 5** specifically against **Non-Lethal** damage and Stun damage.",
    "full_text": "# Tough\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThe character has a high threshold for pain and minor trauma.\n\n## Mechanics & Benefit\nYou gain **Damage Resistance (DR) 5** specifically against **Non-Lethal** damage and Stun damage.",
    "mechanics": "You gain **Damage Resistance (DR) 5** specifically against **Non-Lethal** damage and Stun damage.",
    "notes": "[Modifier] +5 DR\n[Rule] Prerequisite: Stamina 1.\n[Prerequisite] Stamina 1",
    "notesList": [
      "[Modifier] +5 DR",
      "[Rule] Prerequisite: Stamina 1.",
      "[Prerequisite] Stamina 1"
    ]
  },
  {
    "id": "general-tracker",
    "name": "Tracker",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Wisdom 1",
    "prerequisite_text": "Wisdom 1",
    "modifiers": [],
    "description": "The character is an expert hunter.",
    "mechanic": "You can follow tracks using **Survival** or **Awareness** at **Full Movement Speed** without penalty (normally tracking reduces speed to half).",
    "rules": "Prerequisite: Wisdom 1.",
    "special_rules": "Prerequisite: Wisdom 1.",
    "body": "# Tracker\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character is an expert hunter.\n\n## Mechanics & Benefit\nYou can follow tracks using **Survival** or **Awareness** at **Full Movement Speed** without penalty (normally tracking reduces speed to half).",
    "full_text": "# Tracker\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character is an expert hunter.\n\n## Mechanics & Benefit\nYou can follow tracks using **Survival** or **Awareness** at **Full Movement Speed** without penalty (normally tracking reduces speed to half).",
    "mechanics": "You can follow tracks using **Survival** or **Awareness** at **Full Movement Speed** without penalty (normally tracking reduces speed to half).",
    "notes": "[Rule] Prerequisite: Wisdom 1.\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Rule] Prerequisite: Wisdom 1.",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "general-trance",
    "name": "Trance",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Wisdom 1",
    "prerequisite_text": "Wisdom 1",
    "modifiers": [],
    "description": "The character can enter a deep meditative state to conserve energy or feign death.",
    "mechanic": "You can voluntarily slow your heartbeat and metabolism. You consume 1/10th the oxygen and food. You can appear dead to casual inspection (Medicine check CR 20 to detect life).",
    "rules": "Prerequisite: Wisdom 1.",
    "special_rules": "Prerequisite: Wisdom 1.",
    "body": "# Trance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character can enter a deep meditative state to conserve energy or feign death.\n\n## Mechanics & Benefit\nYou can voluntarily slow your heartbeat and metabolism. You consume 1/10th the oxygen and food. You can appear dead to casual inspection (Medicine check CR 20 to detect life).",
    "full_text": "# Trance\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character can enter a deep meditative state to conserve energy or feign death.\n\n## Mechanics & Benefit\nYou can voluntarily slow your heartbeat and metabolism. You consume 1/10th the oxygen and food. You can appear dead to casual inspection (Medicine check CR 20 to detect life).",
    "mechanics": "You can voluntarily slow your heartbeat and metabolism. You consume 1/10th the oxygen and food. You can appear dead to casual inspection (Medicine check CR 20 to detect life).",
    "notes": "[Rule] Prerequisite: Wisdom 1.\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Rule] Prerequisite: Wisdom 1.",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "general-unbreakable-skeleton",
    "name": "Unbreakable Skeleton",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Tough, Stamina 3",
    "prerequisite_text": "Tough, Stamina 3",
    "modifiers": [
      {
        "target": "armor-dr",
        "type": "combat",
        "value": 5,
        "mode": "inherent",
        "description": "+5 DR"
      }
    ],
    "description": "A gain-of-function mutation in the LRP5 gene blocks inhibitory proteins, causing continuous, hyperactive bone formation. The character possesses a skeleton of extreme, unyielding density.",
    "mechanic": "You gain Damage Resistance (DR) 5 specifically against Bludgeoning, Crushing, and Falling damage. You are completely immune to effects that specifically fracture or break bones (such as the Cripple Sneak Attack feature). Because of your extreme bone density, your unarmed strikes deal an additional +1 Damage.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "rules": "Prerequisite: Tough, Stamina 3.",
    "special_rules": "Prerequisite: Tough, Stamina 3.",
    "body": "# Unbreakable Skeleton\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Tough, Stamina 3\n\n## Description\nA gain-of-function mutation in the LRP5 gene blocks inhibitory proteins, causing continuous, hyperactive bone formation. The character possesses a skeleton of extreme, unyielding density.\n\n## Mechanics & Benefit\nYou gain Damage Resistance (DR) 5 specifically against Bludgeoning, Crushing, and Falling damage. You are completely immune to effects that specifically fracture or break bones (such as the Cripple Sneak Attack feature). Because of your extreme bone density, your unarmed strikes deal an additional +1 Damage.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "full_text": "# Unbreakable Skeleton\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Tough, Stamina 3\n\n## Description\nA gain-of-function mutation in the LRP5 gene blocks inhibitory proteins, causing continuous, hyperactive bone formation. The character possesses a skeleton of extreme, unyielding density.\n\n## Mechanics & Benefit\nYou gain Damage Resistance (DR) 5 specifically against Bludgeoning, Crushing, and Falling damage. You are completely immune to effects that specifically fracture or break bones (such as the Cripple Sneak Attack feature). Because of your extreme bone density, your unarmed strikes deal an additional +1 Damage.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "mechanics": "You gain Damage Resistance (DR) 5 specifically against Bludgeoning, Crushing, and Falling damage. You are completely immune to effects that specifically fracture or break bones (such as the Cripple Sneak Attack feature). Because of your extreme bone density, your unarmed strikes deal an additional +1 Damage.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "notes": "[Modifier] +5 DR\n[Rule] Prerequisite: Tough, Stamina 3.\n[Prerequisite] Tough, Stamina 3",
    "notesList": [
      "[Modifier] +5 DR",
      "[Rule] Prerequisite: Tough, Stamina 3.",
      "[Prerequisite] Tough, Stamina 3"
    ]
  },
  {
    "id": "general-underworld-connections",
    "name": "Underworld Connections",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Streetwise 3",
    "prerequisite_text": "Streetwise 3",
    "modifiers": [
      {
        "target": "Streetwise",
        "type": "check_advantage",
        "value": 1,
        "mode": "inherent",
        "description": "Advantage on Streetwise Checks"
      }
    ],
    "description": "Access to illicit black market weapons, fences, and safehouses across all starports.",
    "mechanic": "The character maintains deep ties with smuggling syndicates, fences, and illegal arms dealers. They can source restricted, military, and black-market items without police interference, sell contraband merchandise at standard fence rates, and secure covert safehouses in most major civilized settlements.",
    "rules": "Characters with this feature ignore black market availability markups by 10% and gain Advantage on Streetwise checks to locate contraband or black-market contacts.",
    "special_rules": "Characters with this feature ignore black market availability markups by 10% and gain Advantage on Streetwise checks to locate contraband or black-market contacts.",
    "body": "# Underworld Connections\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Streetwise 3\n\n## Description\nAccess to illicit black market weapons, fences, and safehouses across all starports.\n\n## Mechanics & Benefit\nThe character maintains deep ties with smuggling syndicates, fences, and illegal arms dealers. They can source restricted, military, and black-market items without police interference, sell contraband merchandise at standard fence rates, and secure covert safehouses in most major civilized settlements.\n\n## Special Rules\nCharacters with this feature ignore black market availability markups by 10% and gain Advantage on Streetwise checks to locate contraband or black-market contacts.",
    "full_text": "# Underworld Connections\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Streetwise 3\n\n## Description\nAccess to illicit black market weapons, fences, and safehouses across all starports.\n\n## Mechanics & Benefit\nThe character maintains deep ties with smuggling syndicates, fences, and illegal arms dealers. They can source restricted, military, and black-market items without police interference, sell contraband merchandise at standard fence rates, and secure covert safehouses in most major civilized settlements.\n\n## Special Rules\nCharacters with this feature ignore black market availability markups by 10% and gain Advantage on Streetwise checks to locate contraband or black-market contacts.",
    "mechanics": "The character maintains deep ties with smuggling syndicates, fences, and illegal arms dealers. They can source restricted, military, and black-market items without police interference, sell contraband merchandise at standard fence rates, and secure covert safehouses in most major civilized settlements.",
    "notes": "[Modifier] Advantage on Streetwise Checks\n[Rule] Characters with this feature ignore black market availability markups by 10% and gain Advantage on S...\n[Prerequisite] Streetwise 3",
    "notesList": [
      "[Modifier] Advantage on Streetwise Checks",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character keeps their ear to the ground and knows a little bit about every local scene.",
    "mechanic": "Upon entering a new settlement or region, you may make an immediate **Gather Information** check for free to learn the local news, rumors, and power structure.",
    "rules": "",
    "special_rules": "",
    "body": "# Well Informed\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character keeps their ear to the ground and knows a little bit about every local scene.\n\n## Mechanics & Benefit\nUpon entering a new settlement or region, you may make an immediate **Gather Information** check for free to learn the local news, rumors, and power structure.",
    "full_text": "# Well Informed\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character keeps their ear to the ground and knows a little bit about every local scene.\n\n## Mechanics & Benefit\nUpon entering a new settlement or region, you may make an immediate **Gather Information** check for free to learn the local news, rumors, and power structure.",
    "mechanics": "Upon entering a new settlement or region, you may make an immediate **Gather Information** check for free to learn the local news, rumors, and power structure.",
    "notes": "",
    "notesList": []
  },
  {
    "id": "general-zero-g-training",
    "name": "Zero G Training",
    "category": "General",
    "type": "general",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 1",
    "prerequisite_text": "Agility 1",
    "modifiers": [
      {
        "target": "physical-acrobatics",
        "type": "skill",
        "value": 2,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Operating in Zero Gravity",
        "description": "+2 to Acrobatics when maneuvering in Zero-G; eliminates Zero-G penalties"
      }
    ],
    "description": "The character is trained to operate in microgravity environments without disorientation.",
    "mechanic": "You suffer **No Disadvantage** or penalties for operating in Zero Gravity. You gain a \\+2 bonus to Acrobatics when maneuvering in Zero-G.",
    "rules": "Prerequisite: Agility 1.",
    "special_rules": "Prerequisite: Agility 1.",
    "body": "# Zero G Training\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character is trained to operate in microgravity environments without disorientation.\n\n## Mechanics & Benefit\nYou suffer **No Disadvantage** or penalties for operating in Zero Gravity. You gain a \\+2 bonus to Acrobatics when maneuvering in Zero-G.",
    "full_text": "# Zero G Training\n\n**Category**: General Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 1\n\n## Description\nThe character is trained to operate in microgravity environments without disorientation.\n\n## Mechanics & Benefit\nYou suffer **No Disadvantage** or penalties for operating in Zero Gravity. You gain a \\+2 bonus to Acrobatics when maneuvering in Zero-G.",
    "mechanics": "You suffer **No Disadvantage** or penalties for operating in Zero Gravity. You gain a \\+2 bonus to Acrobatics when maneuvering in Zero-G.",
    "notes": "[Modifier] +2 to Acrobatics when maneuvering in Zero-G; eliminates Zero-G penalties\n[Rule] Prerequisite: Agility 1.\n[Prerequisite] Agility 1",
    "notesList": [
      "[Modifier] +2 to Acrobatics when maneuvering in Zero-G; eliminates Zero-G penalties",
      "[Rule] Prerequisite: Agility 1.",
      "[Prerequisite] Agility 1"
    ]
  },
  {
    "id": "karma-beginner-s-luck",
    "name": "Beginner's Luck",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "The Skill being attempted must be at **Rank 5 (Novice) or lower**.",
    "prerequisite_text": "The Skill being attempted must be at **Rank 5 (Novice) or lower**.",
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
    "mechanic": "You may spend **1 Karma Point** to gain **\\+5 Temporary Ranks** in a specific skill for the duration of the current scene or encounter.  \n  * *Mechanics:* This effectively treats an Untrained (Rank 0\\) character as a Novice (Rank 5), or a Novice as a Professional (Rank 6-10) for a short time.  \n* **Purpose:** Allows a character to fill a critical role (like piloting a shuttle or hacking a door) in an emergency even if they lack the background for it.",
    "rules": "Prerequisite: The Skill being attempted must be at **Rank 5 (Novice) or lower**..",
    "special_rules": "Prerequisite: The Skill being attempted must be at **Rank 5 (Novice) or lower**..",
    "body": "# Beginner's Luck\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: The Skill being attempted must be at **Rank 5 (Novice) or lower**.\n\n## Description\nThe character has an uncanny knack for succeeding at things they have no business doing. When inexperienced, they rely on instinct and fortune rather than training.\n\n## Mechanics & Benefit\nYou may spend **1 Karma Point** to gain **\\+5 Temporary Ranks** in a specific skill for the duration of the current scene or encounter.  \n  * *Mechanics:* This effectively treats an Untrained (Rank 0\\) character as a Novice (Rank 5), or a Novice as a Professional (Rank 6-10) for a short time.  \n* **Purpose:** Allows a character to fill a critical role (like piloting a shuttle or hacking a door) in an emergency even if they lack the background for it.",
    "full_text": "# Beginner's Luck\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: The Skill being attempted must be at **Rank 5 (Novice) or lower**.\n\n## Description\nThe character has an uncanny knack for succeeding at things they have no business doing. When inexperienced, they rely on instinct and fortune rather than training.\n\n## Mechanics & Benefit\nYou may spend **1 Karma Point** to gain **\\+5 Temporary Ranks** in a specific skill for the duration of the current scene or encounter.  \n  * *Mechanics:* This effectively treats an Untrained (Rank 0\\) character as a Novice (Rank 5), or a Novice as a Professional (Rank 6-10) for a short time.  \n* **Purpose:** Allows a character to fill a critical role (like piloting a shuttle or hacking a door) in an emergency even if they lack the background for it.",
    "mechanics": "You may spend **1 Karma Point** to gain **\\+5 Temporary Ranks** in a specific skill for the duration of the current scene or encounter.  \n  * *Mechanics:* This effectively treats an Untrained (Rank 0\\) character as a Novice (Rank 5), or a Novice as a Professional (Rank 6-10) for a short time.  \n* **Purpose:** Allows a character to fill a critical role (like piloting a shuttle or hacking a door) in an emergency even if they lack the background for it.",
    "notes": "[Modifier] +5 to Temporary Ranks in a specific\n[Penalty] -10 to For a short time\n[Modifier] +1 to Karma Pool\n[Rule] Prerequisite: The Skill being attempted must be at **Rank 5 (Novice) or lower**..\n[Prerequisite] The Skill being attempted must be at **Rank 5 (Novice) or lower**.",
    "notesList": [
      "[Modifier] +5 to Temporary Ranks in a specific",
      "[Penalty] -10 to For a short time",
      "[Modifier] +1 to Karma Pool",
      "[Rule] Prerequisite: The Skill being attempted must be at **Rank 5 (Novice) or lower**..",
      "[Prerequisite] The Skill being attempted must be at **Rank 5 (Novice) or lower**."
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "physical",
        "mental_general",
        "mental_knowledges",
        "mental_vocations",
        "social_expression",
        "social_manipulation",
        "combat_archaic",
        "combat_modern",
        "combat_advanced",
        "meta_general",
        "meta_dimension",
        "meta_energy",
        "meta_entropy",
        "meta_illusion",
        "meta_matter",
        "meta_mental"
      ],
      "group_label": "All Skills",
      "max_skills": 1,
      "value": 5
    }
  },
  {
    "id": "karma-believer",
    "name": "Believer",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Wisdom 1",
    "prerequisite_text": "Wisdom 1",
    "modifiers": [
      {
        "target": "All Skills",
        "type": "reroll",
        "value": 1,
        "mode": "karma",
        "isSituational": true,
        "condition": "Once per day",
        "description": "Reroll 1 failed skill check per day"
      }
    ],
    "description": "The character possesses a profound faith in a higher power, a philosophy, or a cosmic order. In times of need, they can draw upon this faith to guide their hand.",
    "mechanic": "**Once per day**, you may re-roll any single failed **Skill Check**.  \n  * *Mechanics:* This does **not** cost Karma Points. It is a daily ability refreshed after a Full Rest. You must accept the result of the second roll.",
    "rules": "This feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum rank is limited by your **Wisdom** score.",
    "special_rules": "This feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum rank is limited by your **Wisdom** score.",
    "body": "# Believer\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character possesses a profound faith in a higher power, a philosophy, or a cosmic order. In times of need, they can draw upon this faith to guide their hand.\n\n## Mechanics & Benefit\n**Once per day**, you may re-roll any single failed **Skill Check**.  \n  * *Mechanics:* This does **not** cost Karma Points. It is a daily ability refreshed after a Full Rest. You must accept the result of the second roll.\n\n## Special Rules\nThis feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum rank is limited by your **Wisdom** score.",
    "full_text": "# Believer\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character possesses a profound faith in a higher power, a philosophy, or a cosmic order. In times of need, they can draw upon this faith to guide their hand.\n\n## Mechanics & Benefit\n**Once per day**, you may re-roll any single failed **Skill Check**.  \n  * *Mechanics:* This does **not** cost Karma Points. It is a daily ability refreshed after a Full Rest. You must accept the result of the second roll.\n\n## Special Rules\nThis feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum rank is limited by your **Wisdom** score.",
    "mechanics": "**Once per day**, you may re-roll any single failed **Skill Check**.  \n  * *Mechanics:* This does **not** cost Karma Points. It is a daily ability refreshed after a Full Rest. You must accept the result of the second roll.",
    "notes": "[Modifier] Reroll 1 failed skill check per day\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum r...\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Modifier] Reroll 1 failed skill check per day",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Maximum Karma Pool of 4+",
    "prerequisite_text": "Maximum Karma Pool of 4+",
    "modifiers": [],
    "description": "The character leads a charmed life. Disasters that would doom others seem to miss them by inches.",
    "mechanic": "**Once per day**, if you roll a **Natural 1** (Fumble/Critical Failure), you may immediately re-roll it without spending a Karma Point.  \n  * *Mechanics:* This serves as a free \"safety net\" against catastrophic failure.",
    "rules": "Prerequisite: Maximum Karma Pool of 4+.",
    "special_rules": "Prerequisite: Maximum Karma Pool of 4+.",
    "body": "# Charmed\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Maximum Karma Pool of 4+\n\n## Description\nThe character leads a charmed life. Disasters that would doom others seem to miss them by inches.\n\n## Mechanics & Benefit\n**Once per day**, if you roll a **Natural 1** (Fumble/Critical Failure), you may immediately re-roll it without spending a Karma Point.  \n  * *Mechanics:* This serves as a free \"safety net\" against catastrophic failure.",
    "full_text": "# Charmed\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Maximum Karma Pool of 4+\n\n## Description\nThe character leads a charmed life. Disasters that would doom others seem to miss them by inches.\n\n## Mechanics & Benefit\n**Once per day**, if you roll a **Natural 1** (Fumble/Critical Failure), you may immediately re-roll it without spending a Karma Point.  \n  * *Mechanics:* This serves as a free \"safety net\" against catastrophic failure.",
    "mechanics": "**Once per day**, if you roll a **Natural 1** (Fumble/Critical Failure), you may immediately re-roll it without spending a Karma Point.  \n  * *Mechanics:* This serves as a free \"safety net\" against catastrophic failure.",
    "notes": "[Rule] Prerequisite: Maximum Karma Pool of 4+.\n[Prerequisite] Maximum Karma Pool of 4+",
    "notesList": [
      "[Rule] Prerequisite: Maximum Karma Pool of 4+.",
      "[Prerequisite] Maximum Karma Pool of 4+"
    ]
  },
  {
    "id": "karma-devout",
    "name": "Devout",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Believer, Charisma 1",
    "prerequisite_text": "Believer, Charisma 1",
    "modifiers": [],
    "description": "The character's faith is not just a belief system, but a fundamental force that strengthens their very being.",
    "mechanic": "**Once per day**, you may re-roll any single failed **Ability Check** (e.g., Strength check to lift rubble, Constitution check to hold breath).  \n  * *Mechanics:* This is separate from the *Believer* re-rolls. It applies to raw attribute checks, not Skill checks.",
    "rules": "This feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum rank is limited by your **Charisma** score.",
    "special_rules": "This feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum rank is limited by your **Charisma** score.",
    "body": "# Devout\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Believer, Charisma 1\n\n## Description\nThe character's faith is not just a belief system, but a fundamental force that strengthens their very being.\n\n## Mechanics & Benefit\n**Once per day**, you may re-roll any single failed **Ability Check** (e.g., Strength check to lift rubble, Constitution check to hold breath).  \n  * *Mechanics:* This is separate from the *Believer* re-rolls. It applies to raw attribute checks, not Skill checks.\n\n## Special Rules\nThis feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum rank is limited by your **Charisma** score.",
    "full_text": "# Devout\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Believer, Charisma 1\n\n## Description\nThe character's faith is not just a belief system, but a fundamental force that strengthens their very being.\n\n## Mechanics & Benefit\n**Once per day**, you may re-roll any single failed **Ability Check** (e.g., Strength check to lift rubble, Constitution check to hold breath).  \n  * *Mechanics:* This is separate from the *Believer* re-rolls. It applies to raw attribute checks, not Skill checks.\n\n## Special Rules\nThis feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum rank is limited by your **Charisma** score.",
    "mechanics": "**Once per day**, you may re-roll any single failed **Ability Check** (e.g., Strength check to lift rubble, Constitution check to hold breath).  \n  * *Mechanics:* This is separate from the *Believer* re-rolls. It applies to raw attribute checks, not Skill checks.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum r...\n[Prerequisite] Believer, Charisma 1",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] This feature is **\\[Ranked\\]**. Each additional rank allows an additional use per day. The maximum r...",
      "[Prerequisite] Believer, Charisma 1"
    ]
  },
  {
    "id": "karma-inspiration",
    "name": "Inspiration",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 2",
    "prerequisite_text": "Charisma 2",
    "modifiers": [],
    "description": "The character is the heart of the team. They can lend their own luck and determination to allies, spurring them on to greatness.",
    "mechanic": "You may spend your own **Karma Points** to grant a Karma Benefit to an **Ally**.  \n  * *Cost:* The cost is **1 KP (Transfer Cost) \\+ The Cost of the Effect**.  \n  * *Example:* To give an ally *Surge* (normally 1 KP), you spend 2 KP. To give an ally *Advantage* (\"I Got This\", normally 1 KP), you spend 2 KP.  \n* **Purpose:** Allows support characters to keep heavy hitters active or save allies from bad rolls.",
    "rules": "Prerequisite: Charisma 2.",
    "special_rules": "Prerequisite: Charisma 2.",
    "body": "# Inspiration\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character is the heart of the team. They can lend their own luck and determination to allies, spurring them on to greatness.\n\n## Mechanics & Benefit\nYou may spend your own **Karma Points** to grant a Karma Benefit to an **Ally**.  \n  * *Cost:* The cost is **1 KP (Transfer Cost) \\+ The Cost of the Effect**.  \n  * *Example:* To give an ally *Surge* (normally 1 KP), you spend 2 KP. To give an ally *Advantage* (\"I Got This\", normally 1 KP), you spend 2 KP.  \n* **Purpose:** Allows support characters to keep heavy hitters active or save allies from bad rolls.",
    "full_text": "# Inspiration\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character is the heart of the team. They can lend their own luck and determination to allies, spurring them on to greatness.\n\n## Mechanics & Benefit\nYou may spend your own **Karma Points** to grant a Karma Benefit to an **Ally**.  \n  * *Cost:* The cost is **1 KP (Transfer Cost) \\+ The Cost of the Effect**.  \n  * *Example:* To give an ally *Surge* (normally 1 KP), you spend 2 KP. To give an ally *Advantage* (\"I Got This\", normally 1 KP), you spend 2 KP.  \n* **Purpose:** Allows support characters to keep heavy hitters active or save allies from bad rolls.",
    "mechanics": "You may spend your own **Karma Points** to grant a Karma Benefit to an **Ally**.  \n  * *Cost:* The cost is **1 KP (Transfer Cost) \\+ The Cost of the Effect**.  \n  * *Example:* To give an ally *Surge* (normally 1 KP), you spend 2 KP. To give an ally *Advantage* (\"I Got This\", normally 1 KP), you spend 2 KP.  \n* **Purpose:** Allows support characters to keep heavy hitters active or save allies from bad rolls.",
    "notes": "[Rule] Prerequisite: Charisma 2.\n[Prerequisite] Charisma 2",
    "notesList": [
      "[Rule] Prerequisite: Charisma 2.",
      "[Prerequisite] Charisma 2"
    ]
  },
  {
    "id": "karma-karmic-blessing",
    "name": "Karmic Blessing",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "Karma",
        "type": "karma",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Karma Pool"
      }
    ],
    "description": "The character has a larger destiny than most. Fate has stockpiled more luck for them to use.",
    "mechanic": "Increase your **Maximum Karma Pool** by **\\+2 Points**.  \n  * *Default:* Characters typically start with 3 Max Karma. This feature raises that cap (e.g., to 5).  \n* **Limit:** Your total Maximum Karma Pool cannot exceed the sum of your Ability Scores (a very high ceiling, rarely reached).",
    "rules": "This feature is **\\[Multiple\\]**. You may take it multiple times to keep expanding your pool.",
    "special_rules": "This feature is **\\[Multiple\\]**. You may take it multiple times to keep expanding your pool.",
    "body": "# Karmic Blessing\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has a larger destiny than most. Fate has stockpiled more luck for them to use.\n\n## Mechanics & Benefit\nIncrease your **Maximum Karma Pool** by **\\+2 Points**.  \n  * *Default:* Characters typically start with 3 Max Karma. This feature raises that cap (e.g., to 5).  \n* **Limit:** Your total Maximum Karma Pool cannot exceed the sum of your Ability Scores (a very high ceiling, rarely reached).\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. You may take it multiple times to keep expanding your pool.",
    "full_text": "# Karmic Blessing\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has a larger destiny than most. Fate has stockpiled more luck for them to use.\n\n## Mechanics & Benefit\nIncrease your **Maximum Karma Pool** by **\\+2 Points**.  \n  * *Default:* Characters typically start with 3 Max Karma. This feature raises that cap (e.g., to 5).  \n* **Limit:** Your total Maximum Karma Pool cannot exceed the sum of your Ability Scores (a very high ceiling, rarely reached).\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. You may take it multiple times to keep expanding your pool.",
    "mechanics": "Increase your **Maximum Karma Pool** by **\\+2 Points**.  \n  * *Default:* Characters typically start with 3 Max Karma. This feature raises that cap (e.g., to 5).  \n* **Limit:** Your total Maximum Karma Pool cannot exceed the sum of your Ability Scores (a very high ceiling, rarely reached).",
    "notes": "[Modifier] +2 to Karma Pool\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]**. You may take it multiple times to keep expanding your pool.",
    "notesList": [
      "[Modifier] +2 to Karma Pool",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]**. You may take it multiple times to keep expanding your pool."
    ]
  },
  {
    "id": "karma-seize-initiative",
    "name": "Seize Initiative",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character reacts with blazing speed when chaos erupts, acting before the enemy can blink.",
    "mechanic": "You automatically go **First** in the initiative order, regardless of your Agility or roll.  \n  * *Conflict:* If multiple characters (allies or enemies) use this feature, they are ranked at the top of the order, sorted by their Agility scores.",
    "rules": "",
    "special_rules": "",
    "body": "# Seize Initiative\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character reacts with blazing speed when chaos erupts, acting before the enemy can blink.\n\n## Mechanics & Benefit\nYou automatically go **First** in the initiative order, regardless of your Agility or roll.  \n  * *Conflict:* If multiple characters (allies or enemies) use this feature, they are ranked at the top of the order, sorted by their Agility scores.",
    "full_text": "# Seize Initiative\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character reacts with blazing speed when chaos erupts, acting before the enemy can blink.\n\n## Mechanics & Benefit\nYou automatically go **First** in the initiative order, regardless of your Agility or roll.  \n  * *Conflict:* If multiple characters (allies or enemies) use this feature, they are ranked at the top of the order, sorted by their Agility scores.",
    "mechanics": "You automatically go **First** in the initiative order, regardless of your Agility or roll.  \n  * *Conflict:* If multiple characters (allies or enemies) use this feature, they are ranked at the top of the order, sorted by their Agility scores.",
    "notes": "",
    "notesList": []
  },
  {
    "id": "karma-surge",
    "name": "Surge",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character pushes their body and mind beyond standard limits, fitting more action into a moment than should be possible.",
    "mechanic": "You gain **1 additional Standard Action** this round.  \n  * *Usage:* This allows for a Move \\+ Attack \\+ Attack, or Move \\+ Cast Spell \\+ Attack. It breaks the standard action economy.",
    "rules": "",
    "special_rules": "",
    "body": "# Surge\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character pushes their body and mind beyond standard limits, fitting more action into a moment than should be possible.\n\n## Mechanics & Benefit\nYou gain **1 additional Standard Action** this round.  \n  * *Usage:* This allows for a Move \\+ Attack \\+ Attack, or Move \\+ Cast Spell \\+ Attack. It breaks the standard action economy.",
    "full_text": "# Surge\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character pushes their body and mind beyond standard limits, fitting more action into a moment than should be possible.\n\n## Mechanics & Benefit\nYou gain **1 additional Standard Action** this round.  \n  * *Usage:* This allows for a Move \\+ Attack \\+ Attack, or Move \\+ Cast Spell \\+ Attack. It breaks the standard action economy.",
    "mechanics": "You gain **1 additional Standard Action** this round.  \n  * *Usage:* This allows for a Move \\+ Attack \\+ Attack, or Move \\+ Cast Spell \\+ Attack. It breaks the standard action economy.",
    "notes": "",
    "notesList": []
  },
  {
    "id": "karma-true-faith",
    "name": "True Faith",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Believer, Devout",
    "prerequisite_text": "Believer, Devout",
    "modifiers": [],
    "description": "The character is a chosen vessel or a paragon of their belief. When they expend their spiritual energy, the universe bends to ensure their success.",
    "mechanic": "When you spend a **Karma Point** to modify an action that is directly in service of your Faith or ethos, the numeric effect is **Doubled**.  \n  * *Mechanics:* If a Karma spend would normally grant a \\+5 bonus, it grants \\+10. If the GM rules a Karma spend heals damage or reduces time, that amount is doubled. *Note: This does not double the number of dice rolled for Advantage, but significantly boosts flat modifiers.*",
    "rules": "Prerequisite: Believer, Devout.",
    "special_rules": "Prerequisite: Believer, Devout.",
    "body": "# True Faith\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Believer, Devout\n\n## Description\nThe character is a chosen vessel or a paragon of their belief. When they expend their spiritual energy, the universe bends to ensure their success.\n\n## Mechanics & Benefit\nWhen you spend a **Karma Point** to modify an action that is directly in service of your Faith or ethos, the numeric effect is **Doubled**.  \n  * *Mechanics:* If a Karma spend would normally grant a \\+5 bonus, it grants \\+10. If the GM rules a Karma spend heals damage or reduces time, that amount is doubled. *Note: This does not double the number of dice rolled for Advantage, but significantly boosts flat modifiers.*",
    "full_text": "# True Faith\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Believer, Devout\n\n## Description\nThe character is a chosen vessel or a paragon of their belief. When they expend their spiritual energy, the universe bends to ensure their success.\n\n## Mechanics & Benefit\nWhen you spend a **Karma Point** to modify an action that is directly in service of your Faith or ethos, the numeric effect is **Doubled**.  \n  * *Mechanics:* If a Karma spend would normally grant a \\+5 bonus, it grants \\+10. If the GM rules a Karma spend heals damage or reduces time, that amount is doubled. *Note: This does not double the number of dice rolled for Advantage, but significantly boosts flat modifiers.*",
    "mechanics": "When you spend a **Karma Point** to modify an action that is directly in service of your Faith or ethos, the numeric effect is **Doubled**.  \n  * *Mechanics:* If a Karma spend would normally grant a \\+5 bonus, it grants \\+10. If the GM rules a Karma spend heals damage or reduces time, that amount is doubled. *Note: This does not double the number of dice rolled for Advantage, but significantly boosts flat modifiers.*",
    "notes": "[Rule] Prerequisite: Believer, Devout.\n[Prerequisite] Believer, Devout",
    "notesList": [
      "[Rule] Prerequisite: Believer, Devout.",
      "[Prerequisite] Believer, Devout"
    ]
  },
  {
    "id": "karma-ultimate-effort",
    "name": "Ultimate Effort",
    "category": "Karma",
    "type": "karma",
    "cp": 3,
    "bp": 3,
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
    "prerequisites": "None (Must be assigned to a specific Trait/Skill/Attribute).",
    "prerequisite_text": "None (Must be assigned to a specific Trait/Skill/Attribute).",
    "modifiers": [],
    "description": "The character is a savant or master in a specific field. When they truly focus, failure is impossible.",
    "mechanic": "Treat a specific **Non-Combat** check as if you rolled a **Natural 20**.  \n  * *Mechanics:* You do not roll. You calculate the result as: 20 \\+ Skill Rank \\+ Attribute Mod \\+ Modifiers. This guarantees a critical success on almost any standard difficulty task.  \n* **Restriction:** This cannot be used for Attack rolls or Damage rolls. It is intended for heroic feats of strength, brilliant deductions, or masterful diplomacy.",
    "rules": "This feature is **\\[Multiple\\]**. You must select which trait it applies to when purchased (e.g., *Ultimate Effort: Engineering* or *Ultimate Effort: Strength*).\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "special_rules": "This feature is **\\[Multiple\\]**. You must select which trait it applies to when purchased (e.g., *Ultimate Effort: Engineering* or *Ultimate Effort: Strength*).\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "body": "# Ultimate Effort\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None (Must be assigned to a specific Trait/Skill/Attribute).\n\n## Description\nThe character is a savant or master in a specific field. When they truly focus, failure is impossible.\n\n## Mechanics & Benefit\nTreat a specific **Non-Combat** check as if you rolled a **Natural 20**.  \n  * *Mechanics:* You do not roll. You calculate the result as: 20 \\+ Skill Rank \\+ Attribute Mod \\+ Modifiers. This guarantees a critical success on almost any standard difficulty task.  \n* **Restriction:** This cannot be used for Attack rolls or Damage rolls. It is intended for heroic feats of strength, brilliant deductions, or masterful diplomacy.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. You must select which trait it applies to when purchased (e.g., *Ultimate Effort: Engineering* or *Ultimate Effort: Strength*).\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "full_text": "# Ultimate Effort\n\n**Category**: Karma Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None (Must be assigned to a specific Trait/Skill/Attribute).\n\n## Description\nThe character is a savant or master in a specific field. When they truly focus, failure is impossible.\n\n## Mechanics & Benefit\nTreat a specific **Non-Combat** check as if you rolled a **Natural 20**.  \n  * *Mechanics:* You do not roll. You calculate the result as: 20 \\+ Skill Rank \\+ Attribute Mod \\+ Modifiers. This guarantees a critical success on almost any standard difficulty task.  \n* **Restriction:** This cannot be used for Attack rolls or Damage rolls. It is intended for heroic feats of strength, brilliant deductions, or masterful diplomacy.\n\n## Special Rules\nThis feature is **\\[Multiple\\]**. You must select which trait it applies to when purchased (e.g., *Ultimate Effort: Engineering* or *Ultimate Effort: Strength*).\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "mechanics": "Treat a specific **Non-Combat** check as if you rolled a **Natural 20**.  \n  * *Mechanics:* You do not roll. You calculate the result as: 20 \\+ Skill Rank \\+ Attribute Mod \\+ Modifiers. This guarantees a critical success on almost any standard difficulty task.  \n* **Restriction:** This cannot be used for Attack rolls or Damage rolls. It is intended for heroic feats of strength, brilliant deductions, or masterful diplomacy.",
    "notes": "[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]**. You must select which trait it applies to when purchased (e.g., *U...\n[Prerequisite] None (Must be assigned to a specific Trait/Skill/Attribute).",
    "notesList": [
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]**. You must select which trait it applies to when purchased (e.g., *U...",
      "[Prerequisite] None (Must be assigned to a specific Trait/Skill/Attribute)."
    ]
  },
  {
    "id": "physical-wall-crawler",
    "name": "Wall-Crawler",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character can traverse vertical surfaces, sheer walls, and ceilings with ease using microscopic setae, specialized claws, or adhesive secretions.",
    "mechanic": "The character gains a Climb Speed equal to their normal Ground Movement Speed. They do not need to make Athletics checks to climb typical sheer surfaces unless under direct duress or navigating frictionless, polished materials. They retain their full Defense while climbing and can adhere to surfaces with at least two free limbs.",
    "rules": "",
    "special_rules": "",
    "body": "# Wall-Crawler\n\n**Category**: Physical Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses the uncanny physical adaptation to scale vertical inclines, sheer cliffs, and ceilings without specialized climbing gear.\n\n## Mechanics & Benefit\nThe character gains a Climb Speed equal to their normal Ground Movement Speed. They do not need to make Athletics checks to climb typical sheer surfaces unless under direct duress or navigating frictionless, polished materials. They retain their full Defense while climbing and can adhere to surfaces with at least two free limbs.",
    "full_text": "# Wall-Crawler\n\n**Category**: Physical Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses the uncanny physical adaptation to scale vertical inclines, sheer cliffs, and ceilings without specialized climbing gear.\n\n## Mechanics & Benefit\nThe character gains a Climb Speed equal to their normal Ground Movement Speed. They do not need to make Athletics checks to climb typical sheer surfaces unless under direct duress or navigating frictionless, polished materials. They retain their full Defense while climbing and can adhere to surfaces with at least two free limbs.",
    "mechanics": "The character gains a Climb Speed equal to their normal Ground Movement Speed. They do not need to make Athletics checks to climb typical sheer surfaces unless under direct duress or navigating frictionless, polished materials. They retain their full Defense while climbing and can adhere to surfaces with at least two free limbs.",
    "notes": "",
    "notesList": []
  },
  {
    "id": "sensory-night-vision",
    "name": "Night Vision",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "Your character can see in the dark, giving them an advantage in low-light and pitch-black conditions.",
    "mechanic": "The character ignores darkness and dim-light penalties to Awareness and Combat attack rolls within medium range (up to 30 meters). They can discern movement and shapes in total non-magical darkness as if it were daylight, though fine color details may be perceived in monochrome shades.",
    "rules": "",
    "special_rules": "",
    "body": "# Night Vision\n\n**Category**: Sensory Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nYour character can see in the dark, giving them an advantage in low-light conditions and deep shadows without requiring an external illumination source.\n\n## Mechanics & Benefit\nThe character ignores darkness and dim-light penalties to Awareness and Combat attack rolls within medium range (up to 30 meters). They can discern movement and shapes in total non-magical darkness as if it were daylight, though fine color details may be perceived in monochrome shades.",
    "full_text": "# Night Vision\n\n**Category**: Sensory Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nYour character can see in the dark, giving them an advantage in low-light conditions and deep shadows without requiring an external illumination source.\n\n## Mechanics & Benefit\nThe character ignores darkness and dim-light penalties to Awareness and Combat attack rolls within medium range (up to 30 meters). They can discern movement and shapes in total non-magical darkness as if it were daylight, though fine color details may be perceived in monochrome shades.",
    "mechanics": "The character ignores darkness and dim-light penalties to Awareness and Combat attack rolls within medium range (up to 30 meters). They can discern movement and shapes in total non-magical darkness as if it were daylight, though fine color details may be perceived in monochrome shades.",
    "notes": "",
    "notesList": []
  },
  {
    "id": "skill-ace-pilot",
    "name": "Ace Pilot",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Crack Pilot, Pilot 16",
    "prerequisite_text": "Crack Pilot, Pilot 16",
    "modifiers": [
      {
        "target": "physical-piloting",
        "type": "skill",
        "value": 6,
        "mode": "competence",
        "description": "+6 competence bonus to Piloting"
      }
    ],
    "description": "A legendary flyer whose maneuvers defy physics.",
    "mechanic": "Gain a **\\+6 Bonus** to Piloting checks. Increase Maximum Speed by **30%**.",
    "rules": "Prerequisite: Crack Pilot, Pilot 16.",
    "special_rules": "Prerequisite: Crack Pilot, Pilot 16.",
    "body": "# Ace Pilot\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Crack Pilot, Pilot 16\n\n## Description\nA legendary flyer whose maneuvers defy physics.\n\n## Mechanics & Benefit\nGain a **\\+6 Bonus** to Piloting checks. Increase Maximum Speed by **30%**.",
    "full_text": "# Ace Pilot\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Crack Pilot, Pilot 16\n\n## Description\nA legendary flyer whose maneuvers defy physics.\n\n## Mechanics & Benefit\nGain a **\\+6 Bonus** to Piloting checks. Increase Maximum Speed by **30%**.",
    "mechanics": "Gain a **\\+6 Bonus** to Piloting checks. Increase Maximum Speed by **30%**.",
    "notes": "[Modifier] +6 competence bonus to Piloting\n[Rule] Prerequisite: Crack Pilot, Pilot 16.\n[Prerequisite] Crack Pilot, Pilot 16",
    "notesList": [
      "[Modifier] +6 competence bonus to Piloting",
      "[Rule] Prerequisite: Crack Pilot, Pilot 16.",
      "[Prerequisite] Crack Pilot, Pilot 16"
    ]
  },
  {
    "id": "skill-aeronaut",
    "name": "Aeronaut",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Pilot (Unpowered) 1",
    "prerequisite_text": "Pilot (Unpowered) 1",
    "modifiers": [
      {
        "target": "physical-piloting",
        "type": "check_advantage",
        "value": 1,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Unpowered atmospheric flight (gliders, wingsuits)",
        "description": "Advantage on Pilot (Unpowered) checks (Roll 3d10, take best 2)"
      }
    ],
    "description": "The character is a specialist in unpowered or nature-assisted flight. They understand wind shears, thermals, and aerodynamics intuitively, whether using a glider, wingsuit, or natural wings.",
    "mechanic": "You may make all **Pilot (Unpowered)** checks with **Advantage**.  \n* **Purpose:** Essential for winged species or low-tech gliders to fly safely in dangerous weather conditions.",
    "rules": "Prerequisite: Pilot (Unpowered) 1.",
    "special_rules": "Prerequisite: Pilot (Unpowered) 1.",
    "body": "# Aeronaut\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Pilot (Unpowered) 1\n\n## Description\nThe character is a specialist in unpowered or nature-assisted flight. They understand wind shears, thermals, and aerodynamics intuitively, whether using a glider, wingsuit, or natural wings.\n\n## Mechanics & Benefit\nYou may make all **Pilot (Unpowered)** checks with **Advantage**.  \n* **Purpose:** Essential for winged species or low-tech gliders to fly safely in dangerous weather conditions.",
    "full_text": "# Aeronaut\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Pilot (Unpowered) 1\n\n## Description\nThe character is a specialist in unpowered or nature-assisted flight. They understand wind shears, thermals, and aerodynamics intuitively, whether using a glider, wingsuit, or natural wings.\n\n## Mechanics & Benefit\nYou may make all **Pilot (Unpowered)** checks with **Advantage**.  \n* **Purpose:** Essential for winged species or low-tech gliders to fly safely in dangerous weather conditions.",
    "mechanics": "You may make all **Pilot (Unpowered)** checks with **Advantage**.  \n* **Purpose:** Essential for winged species or low-tech gliders to fly safely in dangerous weather conditions.",
    "notes": "[Modifier] Advantage on Pilot (Unpowered) checks (Roll 3d10, take best 2)\n[Rule] Prerequisite: Pilot (Unpowered) 1.\n[Prerequisite] Pilot (Unpowered) 1",
    "notesList": [
      "[Modifier] Advantage on Pilot (Unpowered) checks (Roll 3d10, take best 2)",
      "[Rule] Prerequisite: Pilot (Unpowered) 1.",
      "[Prerequisite] Pilot (Unpowered) 1"
    ]
  },
  {
    "id": "skill-animal-affinity",
    "name": "Animal Affinity",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Animal Affinity\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has a natural bond with beasts, understanding their body language and instincts.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Survival** checks regarding Animal Handling, Riding, or Taming. You can alter an animal's attitude one step faster than normal.",
    "full_text": "# Animal Affinity\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has a natural bond with beasts, understanding their body language and instincts.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Survival** checks regarding Animal Handling, Riding, or Taming. You can alter an animal's attitude one step faster than normal.",
    "mechanics": "Gain a **\\+2 Bonus** to **Survival** checks regarding Animal Handling, Riding, or Taming. You can alter an animal's attitude one step faster than normal.",
    "notes": "[Modifier] +2 to Survival",
    "notesList": [
      "[Modifier] +2 to Survival"
    ]
  },
  {
    "id": "skill-artificer",
    "name": "Artificer",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Attune 11, Any Discipline 11, Any Crafting 11",
    "prerequisite_text": "Attune 11, Any Discipline 11, Any Crafting 11",
    "modifiers": [
      {
        "target": "mental-vocations-artificer",
        "type": "check_advantage",
        "value": 1,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Metacrafting and prototyping items",
        "description": "Advantage on Metacrafting and Prototyping checks (Roll 3d10, take best 2)"
      }
    ],
    "description": "The character combines engineering with metaphysics, capable of creating items that blur the line between technology and magic.",
    "mechanic": "All **Metacrafting** and **Prototyping** checks to create magical or psionic items are made with **Advantage**.  \n* **Mechanics:** drastically reduces the risk of wasting expensive materials when building enchantments.",
    "rules": "Prerequisite: Attune 11, Any Discipline 11, Any Crafting 11.",
    "special_rules": "Prerequisite: Attune 11, Any Discipline 11, Any Crafting 11.",
    "body": "# Artificer\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Attune 11, Any Discipline 11, Any Crafting 11\n\n## Description\nThe character combines engineering with metaphysics, capable of creating items that blur the line between technology and magic.\n\n## Mechanics & Benefit\nAll **Metacrafting** and **Prototyping** checks to create magical or psionic items are made with **Advantage**.  \n* **Mechanics:** drastically reduces the risk of wasting expensive materials when building enchantments.",
    "full_text": "# Artificer\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Attune 11, Any Discipline 11, Any Crafting 11\n\n## Description\nThe character combines engineering with metaphysics, capable of creating items that blur the line between technology and magic.\n\n## Mechanics & Benefit\nAll **Metacrafting** and **Prototyping** checks to create magical or psionic items are made with **Advantage**.  \n* **Mechanics:** drastically reduces the risk of wasting expensive materials when building enchantments.",
    "mechanics": "All **Metacrafting** and **Prototyping** checks to create magical or psionic items are made with **Advantage**.  \n* **Mechanics:** drastically reduces the risk of wasting expensive materials when building enchantments.",
    "notes": "[Modifier] Advantage on Metacrafting and Prototyping checks (Roll 3d10, take best 2)\n[Rule] Prerequisite: Attune 11, Any Discipline 11, Any Crafting 11.\n[Prerequisite] Attune 11, Any Discipline 11, Any Crafting 11",
    "notesList": [
      "[Modifier] Advantage on Metacrafting and Prototyping checks (Roll 3d10, take best 2)",
      "[Rule] Prerequisite: Attune 11, Any Discipline 11, Any Crafting 11.",
      "[Prerequisite] Attune 11, Any Discipline 11, Any Crafting 11"
    ]
  },
  {
    "id": "skill-artistic",
    "name": "Artistic",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character possesses a flare for the creative arts.",
    "mechanic": "Choose two **Performance** or **Vocation (Art/Craft)** sub-skills. Gain a **\\+2 Bonus** to both.",
    "rules": "",
    "special_rules": "",
    "body": "# Artistic\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses a flare for the creative arts.\n\n## Mechanics & Benefit\nChoose two **Performance** or **Vocation (Art/Craft)** sub-skills. Gain a **\\+2 Bonus** to both.",
    "full_text": "# Artistic\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses a flare for the creative arts.\n\n## Mechanics & Benefit\nChoose two **Performance** or **Vocation (Art/Craft)** sub-skills. Gain a **\\+2 Bonus** to both.",
    "mechanics": "Choose two **Performance** or **Vocation (Art/Craft)** sub-skills. Gain a **\\+2 Bonus** to both.",
    "notes": "[Modifier] +2 to Both",
    "notesList": [
      "[Modifier] +2 to Both"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "mental_vocations",
        "social_expression"
      ],
      "group_label": "Performance & Vocation Skills",
      "max_skills": 2,
      "value": 2
    }
  },
  {
    "id": "skill-attractive",
    "name": "Attractive",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Charisma 2",
    "prerequisite_text": "Charisma 2",
    "modifiers": [
      {
        "target": "social",
        "type": "skill",
        "value": 2,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Where physical appearance is a factor",
        "description": "+2 to Social checks where physical appearance is a factor"
      }
    ],
    "description": "The character possesses striking physical beauty or magnetic appeal that captures attention.",
    "mechanic": "Gain a **\\+2 Bonus** to all Social checks where physical appearance is a factor (e.g., Seduction, First Impressions).",
    "rules": "This feature is **\\[Ranked\\]** (Limited by Charisma score). Rank 2 grants \\+4, etc.",
    "special_rules": "This feature is **\\[Ranked\\]** (Limited by Charisma score). Rank 2 grants \\+4, etc.",
    "body": "# Attractive\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character possesses striking physical beauty or magnetic appeal that captures attention.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to all Social checks where physical appearance is a factor (e.g., Seduction, First Impressions).\n\n## Special Rules\nThis feature is **\\[Ranked\\]** (Limited by Charisma score). Rank 2 grants \\+4, etc.",
    "full_text": "# Attractive\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character possesses striking physical beauty or magnetic appeal that captures attention.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to all Social checks where physical appearance is a factor (e.g., Seduction, First Impressions).\n\n## Special Rules\nThis feature is **\\[Ranked\\]** (Limited by Charisma score). Rank 2 grants \\+4, etc.",
    "mechanics": "Gain a **\\+2 Bonus** to all Social checks where physical appearance is a factor (e.g., Seduction, First Impressions).",
    "notes": "[Modifier] +2 to Social checks where physical appearance is a factor\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This feature is **\\[Ranked\\]** (Limited by Charisma score). Rank 2 grants \\+4, etc.\n[Prerequisite] Charisma 2",
    "notesList": [
      "[Modifier] +2 to Social checks where physical appearance is a factor",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Biology, Botany, or Medicine Rank 11",
    "prerequisite_text": "Biology, Botany, or Medicine Rank 11",
    "modifiers": [
      {
        "target": "mental-knowledges-science",
        "type": "check_advantage",
        "value": 1,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Biotechnology prototyping and grafting",
        "description": "Advantage on Biotech Prototyping checks (Roll 3d10, take best 2)"
      }
    ],
    "description": "The character is an expert in the manipulation of living tissue and organic technology.",
    "mechanic": "All **Biotechnology Prototyping** and **Grafting** checks are made with **Advantage**.  \n* **Purpose:** Critical for installing bio-augmentations or growing organic starship components (Auluran/Tyranid style tech).",
    "rules": "Prerequisite: Biology, Botany, or Medicine Rank 11.",
    "special_rules": "Prerequisite: Biology, Botany, or Medicine Rank 11.",
    "body": "# Biotechnologist\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Biology, Botany, or Medicine Rank 11\n\n## Description\nThe character is an expert in the manipulation of living tissue and organic technology.\n\n## Mechanics & Benefit\nAll **Biotechnology Prototyping** and **Grafting** checks are made with **Advantage**.  \n* **Purpose:** Critical for installing bio-augmentations or growing organic starship components (Auluran/Tyranid style tech).",
    "full_text": "# Biotechnologist\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Biology, Botany, or Medicine Rank 11\n\n## Description\nThe character is an expert in the manipulation of living tissue and organic technology.\n\n## Mechanics & Benefit\nAll **Biotechnology Prototyping** and **Grafting** checks are made with **Advantage**.  \n* **Purpose:** Critical for installing bio-augmentations or growing organic starship components (Auluran/Tyranid style tech).",
    "mechanics": "All **Biotechnology Prototyping** and **Grafting** checks are made with **Advantage**.  \n* **Purpose:** Critical for installing bio-augmentations or growing organic starship components (Auluran/Tyranid style tech).",
    "notes": "[Modifier] Advantage on Biotech Prototyping checks (Roll 3d10, take best 2)\n[Rule] Prerequisite: Biology, Botany, or Medicine Rank 11.\n[Prerequisite] Biology, Botany, or Medicine Rank 11",
    "notesList": [
      "[Modifier] Advantage on Biotech Prototyping checks (Roll 3d10, take best 2)",
      "[Rule] Prerequisite: Biology, Botany, or Medicine Rank 11.",
      "[Prerequisite] Biology, Botany, or Medicine Rank 11"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "mental_vocations"
      ],
      "group_label": "Vocation Skills",
      "max_skills": 1,
      "value": 2
    }
  },
  {
    "id": "skill-coding-master",
    "name": "Coding Master",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Computer Specialist",
    "prerequisite_text": "Computer Specialist",
    "modifiers": [
      {
        "target": "mental-knowledges-computers",
        "type": "check_advantage",
        "value": 1,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Programming, slicing, or network tasks",
        "description": "Advantage on Computer tasks (Roll 3d10, take best 2)"
      }
    ],
    "description": "The character sees the matrix of the digital world.",
    "mechanic": "Perform all Computer tasks with **Advantage**.",
    "rules": "Prerequisite: Computer Specialist.",
    "special_rules": "Prerequisite: Computer Specialist.",
    "body": "# Coding Master\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Computer Specialist\n\n## Description\nThe character sees the matrix of the digital world.\n\n## Mechanics & Benefit\nPerform all Computer tasks with **Advantage**.",
    "full_text": "# Coding Master\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Computer Specialist\n\n## Description\nThe character sees the matrix of the digital world.\n\n## Mechanics & Benefit\nPerform all Computer tasks with **Advantage**.",
    "mechanics": "Perform all Computer tasks with **Advantage**.",
    "notes": "[Modifier] Advantage on Computer tasks (Roll 3d10, take best 2)\n[Rule] Prerequisite: Computer Specialist.\n[Prerequisite] Computer Specialist",
    "notesList": [
      "[Modifier] Advantage on Computer tasks (Roll 3d10, take best 2)",
      "[Rule] Prerequisite: Computer Specialist.",
      "[Prerequisite] Computer Specialist"
    ]
  },
  {
    "id": "skill-computer-specialist",
    "name": "Computer Specialist",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Computers 1",
    "prerequisite_text": "Computers 1",
    "modifiers": [
      {
        "target": "Computer tasks Hacking",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Computer tasks Hacking"
      },
      {
        "target": "Programming",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Programming"
      },
      {
        "target": "Hardware Repair",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Hardware Repair"
      }
    ],
    "description": "The character lives in the digital realm, navigating code as easily as walking down the street.",
    "mechanic": "Gain a **\\+2 Bonus** to all **Computer** tasks (Hacking, Programming, Hardware Repair).",
    "rules": "Prerequisite: Computers 1.",
    "special_rules": "Prerequisite: Computers 1.",
    "body": "# Computer Specialist\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Computers 1\n\n## Description\nThe character lives in the digital realm, navigating code as easily as walking down the street.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to all **Computer** tasks (Hacking, Programming, Hardware Repair).",
    "full_text": "# Computer Specialist\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Computers 1\n\n## Description\nThe character lives in the digital realm, navigating code as easily as walking down the street.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to all **Computer** tasks (Hacking, Programming, Hardware Repair).",
    "mechanics": "Gain a **\\+2 Bonus** to all **Computer** tasks (Hacking, Programming, Hardware Repair).",
    "notes": "[Modifier] +2 to Computer tasks Hacking\n[Modifier] +2 to Programming\n[Modifier] +2 to Hardware Repair\n[Rule] Prerequisite: Computers 1.\n[Prerequisite] Computers 1",
    "notesList": [
      "[Modifier] +2 to Computer tasks Hacking",
      "[Modifier] +2 to Programming",
      "[Modifier] +2 to Hardware Repair",
      "[Rule] Prerequisite: Computers 1.",
      "[Prerequisite] Computers 1"
    ]
  },
  {
    "id": "skill-crack-pilot",
    "name": "Crack Pilot",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Gifted Pilot, Pilot 11",
    "prerequisite_text": "Gifted Pilot, Pilot 11",
    "modifiers": [
      {
        "target": "physical-piloting",
        "type": "skill",
        "value": 4,
        "mode": "competence",
        "description": "+4 competence bonus to Piloting"
      }
    ],
    "description": "A veteran of many dogfights or races.",
    "mechanic": "Gain a **\\+4 Bonus** to Piloting checks. Increase Maximum Speed by **20%**.",
    "rules": "Prerequisite: Gifted Pilot, Pilot 11.",
    "special_rules": "Prerequisite: Gifted Pilot, Pilot 11.",
    "body": "# Crack Pilot\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Gifted Pilot, Pilot 11\n\n## Description\nA veteran of many dogfights or races.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** to Piloting checks. Increase Maximum Speed by **20%**.",
    "full_text": "# Crack Pilot\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Gifted Pilot, Pilot 11\n\n## Description\nA veteran of many dogfights or races.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** to Piloting checks. Increase Maximum Speed by **20%**.",
    "mechanics": "Gain a **\\+4 Bonus** to Piloting checks. Increase Maximum Speed by **20%**.",
    "notes": "[Modifier] +4 competence bonus to Piloting\n[Rule] Prerequisite: Gifted Pilot, Pilot 11.\n[Prerequisite] Gifted Pilot, Pilot 11",
    "notesList": [
      "[Modifier] +4 competence bonus to Piloting",
      "[Rule] Prerequisite: Gifted Pilot, Pilot 11.",
      "[Prerequisite] Gifted Pilot, Pilot 11"
    ]
  },
  {
    "id": "skill-deceitful",
    "name": "Deceitful",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Deceitful\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is a pathological or professional liar, skilled in misdirection and blending in.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Manipulation Skills** (Bluff, Disguise) and a **\\+1 Bonus** to **Etiquette** checks.",
    "full_text": "# Deceitful\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is a pathological or professional liar, skilled in misdirection and blending in.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Manipulation Skills** (Bluff, Disguise) and a **\\+1 Bonus** to **Etiquette** checks.",
    "mechanics": "Gain a **\\+2 Bonus** to **Manipulation Skills** (Bluff, Disguise) and a **\\+1 Bonus** to **Etiquette** checks.",
    "notes": "[Modifier] +2 to Manipulation\n[Modifier] +1 to Etiquette",
    "notesList": [
      "[Modifier] +2 to Manipulation",
      "[Modifier] +1 to Etiquette"
    ]
  },
  {
    "id": "skill-digital-expert",
    "name": "Digital Expert",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Computer Specialist",
    "prerequisite_text": "Computer Specialist",
    "modifiers": [],
    "description": "The character types at the speed of thought.",
    "mechanic": "You perform Computer-based tasks in **1/2 the typical time**.  \n* **Usage:** Allows a hacker to break a security lock in 3 seconds (1 action) rather than 6 seconds (Full Round), or write a program in hours instead of days.",
    "rules": "Prerequisite: Computer Specialist.",
    "special_rules": "Prerequisite: Computer Specialist.",
    "body": "# Digital Expert\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Computer Specialist\n\n## Description\nThe character types at the speed of thought.\n\n## Mechanics & Benefit\nYou perform Computer-based tasks in **1/2 the typical time**.  \n* **Usage:** Allows a hacker to break a security lock in 3 seconds (1 action) rather than 6 seconds (Full Round), or write a program in hours instead of days.",
    "full_text": "# Digital Expert\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Computer Specialist\n\n## Description\nThe character types at the speed of thought.\n\n## Mechanics & Benefit\nYou perform Computer-based tasks in **1/2 the typical time**.  \n* **Usage:** Allows a hacker to break a security lock in 3 seconds (1 action) rather than 6 seconds (Full Round), or write a program in hours instead of days.",
    "mechanics": "You perform Computer-based tasks in **1/2 the typical time**.  \n* **Usage:** Allows a hacker to break a security lock in 3 seconds (1 action) rather than 6 seconds (Full Round), or write a program in hours instead of days.",
    "notes": "[Rule] Prerequisite: Computer Specialist.\n[Prerequisite] Computer Specialist",
    "notesList": [
      "[Rule] Prerequisite: Computer Specialist.",
      "[Prerequisite] Computer Specialist"
    ]
  },
  {
    "id": "skill-educated",
    "name": "Educated",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Academics 5, Any Knowledge 5",
    "prerequisite_text": "Academics 5, Any Knowledge 5",
    "modifiers": [
      {
        "target": "mental-academics",
        "type": "skill",
        "value": 2,
        "mode": "competence",
        "description": "+2 competence bonus to Academics"
      },
      {
        "target": "Knowledge",
        "type": "skill",
        "value": 1,
        "mode": "competence",
        "description": "+1 competence bonus to all Knowledge Skills"
      }
    ],
    "description": "The character has received extensive formal schooling or possesses a voracious appetite for reading.",
    "mechanic": "Gain a **\\+2 Bonus** to **Academics** and a **\\+1 Bonus** to **ALL Knowledge Skills**.",
    "rules": "Prerequisite: Academics 5, Any Knowledge 5.",
    "special_rules": "Prerequisite: Academics 5, Any Knowledge 5.",
    "body": "# Educated\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Academics 5, Any Knowledge 5\n\n## Description\nThe character has received extensive formal schooling or possesses a voracious appetite for reading.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Academics** and a **\\+1 Bonus** to **ALL Knowledge Skills**.",
    "full_text": "# Educated\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Academics 5, Any Knowledge 5\n\n## Description\nThe character has received extensive formal schooling or possesses a voracious appetite for reading.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Academics** and a **\\+1 Bonus** to **ALL Knowledge Skills**.",
    "mechanics": "Gain a **\\+2 Bonus** to **Academics** and a **\\+1 Bonus** to **ALL Knowledge Skills**.",
    "notes": "[Modifier] +2 competence bonus to Academics\n[Modifier] +1 competence bonus to all Knowledge Skills\n[Rule] Prerequisite: Academics 5, Any Knowledge 5.\n[Prerequisite] Academics 5, Any Knowledge 5",
    "notesList": [
      "[Modifier] +2 competence bonus to Academics",
      "[Modifier] +1 competence bonus to all Knowledge Skills",
      "[Rule] Prerequisite: Academics 5, Any Knowledge 5.",
      "[Prerequisite] Academics 5, Any Knowledge 5"
    ]
  },
  {
    "id": "skill-entertaining",
    "name": "Entertaining",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Charisma 1",
    "prerequisite_text": "Charisma 1",
    "modifiers": [],
    "description": "The character is a born performer, capable of holding an audience's attention.",
    "mechanic": "Gain a **\\+1 Bonus** to **Any Performance Check**.",
    "rules": "This feature is **\\[Ranked\\]** (Limited by Charisma). Rank 3 would grant a \\+3 to all Performance types (Singing, Dancing, Acting, etc.).",
    "special_rules": "This feature is **\\[Ranked\\]** (Limited by Charisma). Rank 3 would grant a \\+3 to all Performance types (Singing, Dancing, Acting, etc.).",
    "body": "# Entertaining\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character is a born performer, capable of holding an audience's attention.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to **Any Performance Check**.\n\n## Special Rules\nThis feature is **\\[Ranked\\]** (Limited by Charisma). Rank 3 would grant a \\+3 to all Performance types (Singing, Dancing, Acting, etc.).",
    "full_text": "# Entertaining\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1\n\n## Description\nThe character is a born performer, capable of holding an audience's attention.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to **Any Performance Check**.\n\n## Special Rules\nThis feature is **\\[Ranked\\]** (Limited by Charisma). Rank 3 would grant a \\+3 to all Performance types (Singing, Dancing, Acting, etc.).",
    "mechanics": "Gain a **\\+1 Bonus** to **Any Performance Check**.",
    "notes": "[Modifier] +1 competence bonus to any Performance check\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] This feature is **\\[Ranked\\]** (Limited by Charisma). Rank 3 would grant a \\+3 to all Performance ty...\n[Prerequisite] Charisma 1",
    "notesList": [
      "[Modifier] +1 competence bonus to any Performance check",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] This feature is **\\[Ranked\\]** (Limited by Charisma). Rank 3 would grant a \\+3 to all Performance ty...",
      "[Prerequisite] Charisma 1"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "social_expression"
      ],
      "group_label": "Expression & Performance Skills",
      "max_skills": 1,
      "value": 1
    }
  },
  {
    "id": "skill-gearhead",
    "name": "Gearhead",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Engineering 1 or Mechanics 1",
    "prerequisite_text": "Engineering 1 or Mechanics 1",
    "modifiers": [
      {
        "target": "Mechanical-based Knowledge",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Mechanical-based Knowledge"
      },
      {
        "target": "Operation",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Operation"
      },
      {
        "target": "Repair",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Repair"
      }
    ],
    "description": "The character has an intuitive understanding of machinery, engines, and mechanical systems.",
    "mechanic": "Gain a **\\+2 Bonus** to all Mechanical-based **Knowledge**, **Operation**, and **Repair** checks.",
    "rules": "Prerequisite: Engineering 1 or Mechanics 1.",
    "special_rules": "Prerequisite: Engineering 1 or Mechanics 1.",
    "body": "# Gearhead\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Engineering 1 or Mechanics 1\n\n## Description\nThe character has an intuitive understanding of machinery, engines, and mechanical systems.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to all Mechanical-based **Knowledge**, **Operation**, and **Repair** checks.",
    "full_text": "# Gearhead\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Engineering 1 or Mechanics 1\n\n## Description\nThe character has an intuitive understanding of machinery, engines, and mechanical systems.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to all Mechanical-based **Knowledge**, **Operation**, and **Repair** checks.",
    "mechanics": "Gain a **\\+2 Bonus** to all Mechanical-based **Knowledge**, **Operation**, and **Repair** checks.",
    "notes": "[Modifier] +2 to Mechanical-based Knowledge\n[Modifier] +2 to Operation\n[Modifier] +2 to Repair\n[Rule] Prerequisite: Engineering 1 or Mechanics 1.\n[Prerequisite] Engineering 1 or Mechanics 1",
    "notesList": [
      "[Modifier] +2 to Mechanical-based Knowledge",
      "[Modifier] +2 to Operation",
      "[Modifier] +2 to Repair",
      "[Rule] Prerequisite: Engineering 1 or Mechanics 1.",
      "[Prerequisite] Engineering 1 or Mechanics 1"
    ]
  },
  {
    "id": "skill-gifted-pilot",
    "name": "Gifted Pilot",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Pilot 6",
    "prerequisite_text": "Pilot 6",
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
    "rules": "Prerequisite: Pilot 6.",
    "special_rules": "Prerequisite: Pilot 6.",
    "body": "# Gifted Pilot\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Pilot 6\n\n## Description\nThe character feels the vehicle as an extension of their own body.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to Piloting checks. Increase the **Maximum Speed** of any vehicle you pilot by **10%**.",
    "full_text": "# Gifted Pilot\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Pilot 6\n\n## Description\nThe character feels the vehicle as an extension of their own body.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to Piloting checks. Increase the **Maximum Speed** of any vehicle you pilot by **10%**.",
    "mechanics": "Gain a **\\+2 Bonus** to Piloting checks. Increase the **Maximum Speed** of any vehicle you pilot by **10%**.",
    "notes": "[Modifier] +2 to Piloting\n[Rule] Prerequisite: Pilot 6.\n[Prerequisite] Pilot 6",
    "notesList": [
      "[Modifier] +2 to Piloting",
      "[Rule] Prerequisite: Pilot 6.",
      "[Prerequisite] Pilot 6"
    ]
  },
  {
    "id": "skill-golden-smile",
    "name": "Golden Smile",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Silver Tongue, Charisma 2, Bluff 6, Diplomacy 6",
    "prerequisite_text": "Silver Tongue, Charisma 2, Bluff 6, Diplomacy 6",
    "modifiers": [
      {
        "target": "social-manipulation",
        "type": "take_10",
        "value": 10,
        "mode": "conditional",
        "isSituational": true,
        "condition": "High-stakes negotiation under stress",
        "description": "Take 10 or roll extra +1d10 wild die on Bluff and Diplomacy checks"
      }
    ],
    "description": "The character's charm is disarming and risky, but often rewarding.",
    "mechanic": "You may choose to **Take 10** on Bluff and Diplomacy checks, OR you may roll **2d10 with Advantage**, allowing for potentially higher highs but lower lows.",
    "rules": "Prerequisite: Silver Tongue, Charisma 2, Bluff 6, Diplomacy 6.",
    "special_rules": "Prerequisite: Silver Tongue, Charisma 2, Bluff 6, Diplomacy 6.",
    "body": "# Golden Smile\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Silver Tongue, Charisma 2, Bluff 6, Diplomacy 6\n\n## Description\nThe character's charm is disarming and risky, but often rewarding.\n\n## Mechanics & Benefit\nYou may choose to **Take 10** on Bluff and Diplomacy checks, OR you may roll **2d10 with Advantage**, allowing for potentially higher highs but lower lows.",
    "full_text": "# Golden Smile\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Silver Tongue, Charisma 2, Bluff 6, Diplomacy 6\n\n## Description\nThe character's charm is disarming and risky, but often rewarding.\n\n## Mechanics & Benefit\nYou may choose to **Take 10** on Bluff and Diplomacy checks, OR you may roll **2d10 with Advantage**, allowing for potentially higher highs but lower lows.",
    "mechanics": "You may choose to **Take 10** on Bluff and Diplomacy checks, OR you may roll **2d10 with Advantage**, allowing for potentially higher highs but lower lows.",
    "notes": "[Modifier] Take 10 or roll extra +1d10 wild die on Bluff and Diplomacy checks\n[Rule] Prerequisite: Silver Tongue, Charisma 2, Bluff 6, Diplomacy 6.\n[Prerequisite] Silver Tongue, Charisma 2, Bluff 6, Diplomacy 6",
    "notesList": [
      "[Modifier] Take 10 or roll extra +1d10 wild die on Bluff and Diplomacy checks",
      "[Rule] Prerequisite: Silver Tongue, Charisma 2, Bluff 6, Diplomacy 6.",
      "[Prerequisite] Silver Tongue, Charisma 2, Bluff 6, Diplomacy 6"
    ]
  },
  {
    "id": "skill-graceful",
    "name": "Graceful",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Graceful\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character moves with elegance and precision.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to all **Agility-based Non-Attack Skill checks** (Acrobatics, Stealth, Sleight of Hand) and **Reflex Checks**.",
    "full_text": "# Graceful\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character moves with elegance and precision.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to all **Agility-based Non-Attack Skill checks** (Acrobatics, Stealth, Sleight of Hand) and **Reflex Checks**.",
    "mechanics": "Gain a **\\+1 Bonus** to all **Agility-based Non-Attack Skill checks** (Acrobatics, Stealth, Sleight of Hand) and **Reflex Checks**.",
    "notes": "[Modifier] +1 to Agility-based Non-Attack",
    "notesList": [
      "[Modifier] +1 to Agility-based Non-Attack"
    ]
  },
  {
    "id": "skill-headstrong",
    "name": "Headstrong",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Headstrong\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is stubborn, loud, and forceful.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Bluff** and **Intimidate** checks, and a **\\+1 Bonus** to **Will Checks**.",
    "full_text": "# Headstrong\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is stubborn, loud, and forceful.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Bluff** and **Intimidate** checks, and a **\\+1 Bonus** to **Will Checks**.",
    "mechanics": "Gain a **\\+2 Bonus** to **Bluff** and **Intimidate** checks, and a **\\+1 Bonus** to **Will Checks**.",
    "notes": "[Modifier] +1 on Will Checks\n[Modifier] +2 to Bluff\n[Modifier] +2 to Intimidate",
    "notesList": [
      "[Modifier] +1 on Will Checks",
      "[Modifier] +2 to Bluff",
      "[Modifier] +2 to Intimidate"
    ]
  },
  {
    "id": "skill-influence",
    "name": "Influence",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 2",
    "prerequisite_text": "Charisma 2",
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
    "rules": "Prerequisite: Charisma 2.",
    "special_rules": "Prerequisite: Charisma 2.",
    "body": "# Influence\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character has significant social pull within their faction or community.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** to **Reputation** and **Favor** checks (a subset of Diplomacy used to acquire resources or assistance).",
    "full_text": "# Influence\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character has significant social pull within their faction or community.\n\n## Mechanics & Benefit\nGain a **\\+4 Bonus** to **Reputation** and **Favor** checks (a subset of Diplomacy used to acquire resources or assistance).",
    "mechanics": "Gain a **\\+4 Bonus** to **Reputation** and **Favor** checks (a subset of Diplomacy used to acquire resources or assistance).",
    "notes": "[Modifier] +4 to Reputation\n[Modifier] +4 to Favor\n[Rule] Prerequisite: Charisma 2.\n[Prerequisite] Charisma 2",
    "notesList": [
      "[Modifier] +4 to Reputation",
      "[Modifier] +4 to Favor",
      "[Rule] Prerequisite: Charisma 2.",
      "[Prerequisite] Charisma 2"
    ]
  },
  {
    "id": "skill-investigator",
    "name": "Investigator",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Investigator\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is trained to notice details and follow leads.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Investigation** and **Gather Information** checks.",
    "full_text": "# Investigator\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is trained to notice details and follow leads.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Investigation** and **Gather Information** checks.",
    "mechanics": "Gain a **\\+2 Bonus** to **Investigation** and **Gather Information** checks.",
    "notes": "[Modifier] +2 to Investigation\n[Modifier] +2 to Gather Information",
    "notesList": [
      "[Modifier] +2 to Investigation",
      "[Modifier] +2 to Gather Information"
    ]
  },
  {
    "id": "skill-linguist",
    "name": "Linguist",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Linguistics 1",
    "prerequisite_text": "Linguistics 1",
    "modifiers": [
      {
        "target": "Language",
        "type": "take_10",
        "value": 10,
        "mode": "inherent",
        "description": "May take 10 on Language Checks"
      },
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
    "rules": "Prerequisite: Linguistics 1.",
    "special_rules": "Prerequisite: Linguistics 1.",
    "body": "# Linguist\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Linguistics 1\n\n## Description\nThe character has an ear for dialects and syntax.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Language** checks. You may **Take 10** on Language checks to decipher writing even under stress.",
    "full_text": "# Linguist\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Linguistics 1\n\n## Description\nThe character has an ear for dialects and syntax.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Language** checks. You may **Take 10** on Language checks to decipher writing even under stress.",
    "mechanics": "Gain a **\\+2 Bonus** to **Language** checks. You may **Take 10** on Language checks to decipher writing even under stress.",
    "notes": "[Modifier] May take 10 on Language Checks\n[Modifier] +2 to Language\n[Rule] Prerequisite: Linguistics 1.\n[Prerequisite] Linguistics 1",
    "notesList": [
      "[Modifier] May take 10 on Language Checks",
      "[Modifier] +2 to Language",
      "[Rule] Prerequisite: Linguistics 1.",
      "[Prerequisite] Linguistics 1"
    ]
  },
  {
    "id": "skill-logical",
    "name": "Logical",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "Logic",
        "type": "save",
        "value": 2,
        "mode": "inherent",
        "description": "+2 on Logic Checks"
      },
      {
        "target": "Logic",
        "type": "save",
        "value": 10,
        "mode": "inherent",
        "description": "+10 on Logic Checks"
      },
      {
        "target": "Logic",
        "type": "take_10",
        "value": 10,
        "mode": "inherent",
        "description": "May take 10 on Logic Checks"
      }
    ],
    "description": "The character approaches problems with cold, hard rationality.",
    "mechanic": "Gain a **\\+2 Bonus** to **Logic Checks**. You may **Take 10** on Logic checks even under stress.",
    "rules": "",
    "special_rules": "",
    "body": "# Logical\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character approaches problems with cold, hard rationality.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Logic Checks**. You may **Take 10** on Logic checks even under stress.",
    "full_text": "# Logical\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character approaches problems with cold, hard rationality.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Logic Checks**. You may **Take 10** on Logic checks even under stress.",
    "mechanics": "Gain a **\\+2 Bonus** to **Logic Checks**. You may **Take 10** on Logic checks even under stress.",
    "notes": "[Modifier] +2 on Logic Checks\n[Modifier] +10 on Logic Checks\n[Modifier] May take 10 on Logic Checks",
    "notesList": [
      "[Modifier] +2 on Logic Checks",
      "[Modifier] +10 on Logic Checks",
      "[Modifier] May take 10 on Logic Checks"
    ]
  },
  {
    "id": "skill-magical-aptitude",
    "name": "Magical Aptitude",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "Attune",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Attune"
      },
      {
        "target": "Knowledge Metaphysics",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Knowledge Metaphysics"
      }
    ],
    "description": "The character has a knack for the arcane theory, even if they aren't a powerful caster.",
    "mechanic": "Gain a **\\+2 Bonus** to **Attune** checks and a **\\+1 Bonus** to **Knowledge (Metaphysics)**.",
    "rules": "",
    "special_rules": "",
    "body": "# Magical Aptitude\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has a knack for the arcane theory, even if they aren't a powerful caster.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Attune** checks and a **\\+1 Bonus** to **Knowledge (Metaphysics)**.",
    "full_text": "# Magical Aptitude\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has a knack for the arcane theory, even if they aren't a powerful caster.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Attune** checks and a **\\+1 Bonus** to **Knowledge (Metaphysics)**.",
    "mechanics": "Gain a **\\+2 Bonus** to **Attune** checks and a **\\+1 Bonus** to **Knowledge (Metaphysics)**.",
    "notes": "[Modifier] +2 to Attune\n[Modifier] +1 to Knowledge Metaphysics",
    "notesList": [
      "[Modifier] +2 to Attune",
      "[Modifier] +1 to Knowledge Metaphysics"
    ]
  },
  {
    "id": "skill-master-craftsman",
    "name": "Master Craftsman",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Crafting 6",
    "prerequisite_text": "Crafting 6",
    "modifiers": [],
    "description": "The character creates items of superior quality and durability.",
    "mechanic": "Gain a **\\+2 Bonus** to Crafting checks. When creating **Masterwork** items, you add **\\+2** to the CR limit of what you can create (allowing for more complex modifications).",
    "rules": "Prerequisite: Crafting 6.",
    "special_rules": "Prerequisite: Crafting 6.",
    "body": "# Master Craftsman\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Crafting 6\n\n## Description\nThe character creates items of superior quality and durability.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to Crafting checks. When creating **Masterwork** items, you add **\\+2** to the CR limit of what you can create (allowing for more complex modifications).",
    "full_text": "# Master Craftsman\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Crafting 6\n\n## Description\nThe character creates items of superior quality and durability.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to Crafting checks. When creating **Masterwork** items, you add **\\+2** to the CR limit of what you can create (allowing for more complex modifications).",
    "mechanics": "Gain a **\\+2 Bonus** to Crafting checks. When creating **Masterwork** items, you add **\\+2** to the CR limit of what you can create (allowing for more complex modifications).",
    "notes": "[Modifier] +2 to Crafting\n[Modifier] +2 to The CR limit of what you can create allowing for more complex modifications\n[Rule] Prerequisite: Crafting 6.\n[Prerequisite] Crafting 6",
    "notesList": [
      "[Modifier] +2 to Crafting",
      "[Modifier] +2 to The CR limit of what you can create allowing for more complex modifications",
      "[Rule] Prerequisite: Crafting 6.",
      "[Prerequisite] Crafting 6"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "mental_vocations"
      ],
      "group_label": "Crafting & Vocation Skills",
      "max_skills": 1,
      "value": 2
    }
  },
  {
    "id": "skill-medic",
    "name": "Medic",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Medicine 1",
    "prerequisite_text": "Medicine 1",
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
    "body": "# Medic\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Medicine 1\n\n## Description\nThe character is trained in emergency triage and trauma care.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to Medicine checks.\n\n## Special Rules\nYou may perform **First Aid** (stabilize a dying character) as a **Standard Action** rather than a Full Round Action.",
    "full_text": "# Medic\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Medicine 1\n\n## Description\nThe character is trained in emergency triage and trauma care.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to Medicine checks.\n\n## Special Rules\nYou may perform **First Aid** (stabilize a dying character) as a **Standard Action** rather than a Full Round Action.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "All Skills",
        "type": "time_modifier",
        "value": 1,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Extra time invested",
        "description": "+1 additional bonus per time stage invested in Meticulous Work"
      }
    ],
    "description": "The character is exceptionally thorough. When they take their time, they rarely fail.",
    "mechanic": "The bonus gained from taking extra time on a skill check is improved.  \n* **Mechanics:** For every \\+50% time added to a task, you gain a **\\+3 Bonus** (normally \\+2). This bonus scales with stages (+3, \\+6, \\+9 etc.).",
    "rules": "",
    "special_rules": "",
    "body": "# Meticulous\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is exceptionally thorough. When they take their time, they rarely fail.\n\n## Mechanics & Benefit\nThe bonus gained from taking extra time on a skill check is improved.  \n* **Mechanics:** For every \\+50% time added to a task, you gain a **\\+3 Bonus** (normally \\+2). This bonus scales with stages (+3, \\+6, \\+9 etc.).",
    "full_text": "# Meticulous\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is exceptionally thorough. When they take their time, they rarely fail.\n\n## Mechanics & Benefit\nThe bonus gained from taking extra time on a skill check is improved.  \n* **Mechanics:** For every \\+50% time added to a task, you gain a **\\+3 Bonus** (normally \\+2). This bonus scales with stages (+3, \\+6, \\+9 etc.).",
    "mechanics": "The bonus gained from taking extra time on a skill check is improved.  \n* **Mechanics:** For every \\+50% time added to a task, you gain a **\\+3 Bonus** (normally \\+2). This bonus scales with stages (+3, \\+6, \\+9 etc.).",
    "notes": "[Modifier] +1 additional bonus per time stage invested in Meticulous Work",
    "notesList": [
      "[Modifier] +1 additional bonus per time stage invested in Meticulous Work"
    ]
  },
  {
    "id": "skill-naturalist",
    "name": "Naturalist",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "Nature Knowledge",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Nature Knowledge"
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
    "rules": "",
    "special_rules": "",
    "body": "# Naturalist\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is at home in the wild.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Nature** (Knowledge) and **Survival** checks.",
    "full_text": "# Naturalist\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is at home in the wild.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Nature** (Knowledge) and **Survival** checks.",
    "mechanics": "Gain a **\\+2 Bonus** to **Nature** (Knowledge) and **Survival** checks.",
    "notes": "[Modifier] +2 to Nature Knowledge\n[Modifier] +2 to Survival",
    "notesList": [
      "[Modifier] +2 to Nature Knowledge",
      "[Modifier] +2 to Survival"
    ]
  },
  {
    "id": "skill-nimble-fingers",
    "name": "Nimble Fingers",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "Sleight of Hand",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Sleight of Hand"
      },
      {
        "target": "Disable Device Security",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Disable Device Security"
      },
      {
        "target": "Mechanics",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Mechanics"
      }
    ],
    "description": "The character has excellent manual dexterity for fine manipulation.",
    "mechanic": "Gain a **\\+2 Bonus** to **Sleight of Hand** and **Disable Device** (Security/Mechanics) checks.",
    "rules": "",
    "special_rules": "",
    "body": "# Nimble Fingers\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has excellent manual dexterity for fine manipulation.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Sleight of Hand** and **Disable Device** (Security/Mechanics) checks.",
    "full_text": "# Nimble Fingers\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has excellent manual dexterity for fine manipulation.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Sleight of Hand** and **Disable Device** (Security/Mechanics) checks.",
    "mechanics": "Gain a **\\+2 Bonus** to **Sleight of Hand** and **Disable Device** (Security/Mechanics) checks.",
    "notes": "[Modifier] +2 to Sleight of Hand\n[Modifier] +2 to Disable Device Security\n[Modifier] +2 to Mechanics",
    "notesList": [
      "[Modifier] +2 to Sleight of Hand",
      "[Modifier] +2 to Disable Device Security",
      "[Modifier] +2 to Mechanics"
    ]
  },
  {
    "id": "skill-perceptive",
    "name": "Perceptive",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "Alertness",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Alertness"
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
    "rules": "",
    "special_rules": "",
    "body": "# Perceptive\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character notices things others miss.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Perception** checks (Alertness) and a **\\+1 Bonus** to **Insight** checks.",
    "full_text": "# Perceptive\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character notices things others miss.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Perception** checks (Alertness) and a **\\+1 Bonus** to **Insight** checks.",
    "mechanics": "Gain a **\\+2 Bonus** to **Perception** checks (Alertness) and a **\\+1 Bonus** to **Insight** checks.",
    "notes": "[Modifier] +2 to Alertness\n[Modifier] +1 to Insight",
    "notesList": [
      "[Modifier] +2 to Alertness",
      "[Modifier] +1 to Insight"
    ]
  },
  {
    "id": "skill-persuasive",
    "name": "Persuasive",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Persuasive\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is convincing and compelling.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Diplomacy** and **Intimidate** checks.",
    "full_text": "# Persuasive\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is convincing and compelling.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Diplomacy** and **Intimidate** checks.",
    "mechanics": "Gain a **\\+2 Bonus** to **Diplomacy** and **Intimidate** checks.",
    "notes": "[Modifier] +2 to Diplomacy\n[Modifier] +2 to Intimidate",
    "notesList": [
      "[Modifier] +2 to Diplomacy",
      "[Modifier] +2 to Intimidate"
    ]
  },
  {
    "id": "skill-platinum-personality",
    "name": "Platinum Personality",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Golden Smile, Charisma 4, Bluff 11, Diplomacy 11",
    "prerequisite_text": "Golden Smile, Charisma 4, Bluff 11, Diplomacy 11",
    "modifiers": [
      {
        "target": "social-manipulation",
        "type": "check_advantage",
        "value": 1,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Bluff and Diplomacy interactions",
        "description": "Advantage on all Bluff and Diplomacy checks (Roll 3d10, take best 2)"
      }
    ],
    "description": "The character radiates trustworthiness and charisma.",
    "mechanic": "You may make all **Bluff** and **Diplomacy** checks with **Advantage**.",
    "rules": "Prerequisite: Golden Smile, Charisma 4, Bluff 11, Diplomacy 11.",
    "special_rules": "Prerequisite: Golden Smile, Charisma 4, Bluff 11, Diplomacy 11.",
    "body": "# Platinum Personality\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Golden Smile, Charisma 4, Bluff 11, Diplomacy 11\n\n## Description\nThe character radiates trustworthiness and charisma.\n\n## Mechanics & Benefit\nYou may make all **Bluff** and **Diplomacy** checks with **Advantage**.",
    "full_text": "# Platinum Personality\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Golden Smile, Charisma 4, Bluff 11, Diplomacy 11\n\n## Description\nThe character radiates trustworthiness and charisma.\n\n## Mechanics & Benefit\nYou may make all **Bluff** and **Diplomacy** checks with **Advantage**.",
    "mechanics": "You may make all **Bluff** and **Diplomacy** checks with **Advantage**.",
    "notes": "[Modifier] Advantage on all Bluff and Diplomacy checks (Roll 3d10, take best 2)\n[Rule] Prerequisite: Golden Smile, Charisma 4, Bluff 11, Diplomacy 11.\n[Prerequisite] Golden Smile, Charisma 4, Bluff 11, Diplomacy 11",
    "notesList": [
      "[Modifier] Advantage on all Bluff and Diplomacy checks (Roll 3d10, take best 2)",
      "[Rule] Prerequisite: Golden Smile, Charisma 4, Bluff 11, Diplomacy 11.",
      "[Prerequisite] Golden Smile, Charisma 4, Bluff 11, Diplomacy 11"
    ]
  },
  {
    "id": "skill-power-attack",
    "name": "Power Attack",
    "category": "Combat",
    "type": "combat",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Strength 2, Unarmed or Melee 6",
    "prerequisite_text": "Strength 2, Unarmed or Melee 6",
    "modifiers": [],
    "description": "The character sacrifices precision for raw force, trading attack accuracy for devastating damage.",
    "mechanic": "When declaring a melee attack, you may choose to take a penalty up to your Combat Skill Rank on your **Strike** (Attack) roll. You add this same amount as a bonus to your **Damage** roll. This choice is made before you roll your attack and lasts until the start of your next turn.",
    "rules": "This bonus to damage is considered a \"Power\" bonus, which may not stack with other features that grant generic bonus damage.",
    "special_rules": "This bonus to damage is considered a \"Power\" bonus, which may not stack with other features that grant generic bonus damage.",
    "body": "# Power Attack\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 2, Unarmed or Melee 6\n\n## Description\nThe character sacrifices precision for raw force, trading attack accuracy for devastating damage.\n\n## Mechanics & Benefit\nWhen declaring a melee attack, you may choose to take a penalty up to your Combat Skill Rank on your **Strike** (Attack) roll. You add this same amount as a bonus to your **Damage** roll. This choice is made before you roll your attack and lasts until the start of your next turn.\n\n## Special Rules\nThis bonus to damage is considered a \"Power\" bonus, which may not stack with other features that grant generic bonus damage.",
    "full_text": "# Power Attack\n\n**Category**: Combat Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Strength 2, Unarmed or Melee 6\n\n## Description\nThe character sacrifices precision for raw force, trading attack accuracy for devastating damage.\n\n## Mechanics & Benefit\nWhen declaring a melee attack, you may choose to take a penalty up to your Combat Skill Rank on your **Strike** (Attack) roll. You add this same amount as a bonus to your **Damage** roll. This choice is made before you roll your attack and lasts until the start of your next turn.\n\n## Special Rules\nThis bonus to damage is considered a \"Power\" bonus, which may not stack with other features that grant generic bonus damage.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Researcher\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character knows how to navigate data archives and libraries.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Academics** and **Library Use** checks.",
    "full_text": "# Researcher\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character knows how to navigate data archives and libraries.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Academics** and **Library Use** checks.",
    "mechanics": "Gain a **\\+2 Bonus** to **Academics** and **Library Use** checks.",
    "notes": "[Modifier] +2 to Academics\n[Modifier] +2 to Library Use",
    "notesList": [
      "[Modifier] +2 to Academics",
      "[Modifier] +2 to Library Use"
    ]
  },
  {
    "id": "skill-scholar",
    "name": "Scholar",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Scholar\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is an academic with a broad base of learning.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **ALL Knowledge Skills**.",
    "full_text": "# Scholar\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is an academic with a broad base of learning.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **ALL Knowledge Skills**.",
    "mechanics": "Gain a **\\+2 Bonus** to **ALL Knowledge Skills**.",
    "notes": "[Modifier] +2 to Knowledge",
    "notesList": [
      "[Modifier] +2 to Knowledge"
    ]
  },
  {
    "id": "skill-self-sufficient",
    "name": "Self Sufficient",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Self Sufficient\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character can take care of themselves in the wild without support.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Survival** checks and a **\\+1 Bonus** to **Fortitude** checks.",
    "full_text": "# Self Sufficient\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character can take care of themselves in the wild without support.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Survival** checks and a **\\+1 Bonus** to **Fortitude** checks.",
    "mechanics": "Gain a **\\+2 Bonus** to **Survival** checks and a **\\+1 Bonus** to **Fortitude** checks.",
    "notes": "[Modifier] +1 on Fortitude Checks\n[Modifier] +2 to Survival",
    "notesList": [
      "[Modifier] +1 on Fortitude Checks",
      "[Modifier] +2 to Survival"
    ]
  },
  {
    "id": "skill-silver-tongue",
    "name": "Silver Tongue",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 1, Diplomacy 1",
    "prerequisite_text": "Charisma 1, Diplomacy 1",
    "modifiers": [],
    "description": "The character knows exactly what to say to defuse a situation or make a friend.",
    "mechanic": "When using Diplomacy to change an NPC's attitude, you improve it by **one additional step** (e.g., Hostile becomes Indifferent instead of Unfriendly).",
    "rules": "Prerequisite: Charisma 1, Diplomacy 1.",
    "special_rules": "Prerequisite: Charisma 1, Diplomacy 1.",
    "body": "# Silver Tongue\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1, Diplomacy 1\n\n## Description\nThe character knows exactly what to say to defuse a situation or make a friend.\n\n## Mechanics & Benefit\nWhen using Diplomacy to change an NPC's attitude, you improve it by **one additional step** (e.g., Hostile becomes Indifferent instead of Unfriendly).",
    "full_text": "# Silver Tongue\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 1, Diplomacy 1\n\n## Description\nThe character knows exactly what to say to defuse a situation or make a friend.\n\n## Mechanics & Benefit\nWhen using Diplomacy to change an NPC's attitude, you improve it by **one additional step** (e.g., Hostile becomes Indifferent instead of Unfriendly).",
    "mechanics": "When using Diplomacy to change an NPC's attitude, you improve it by **one additional step** (e.g., Hostile becomes Indifferent instead of Unfriendly).",
    "notes": "[Rule] Prerequisite: Charisma 1, Diplomacy 1.\n[Prerequisite] Charisma 1, Diplomacy 1",
    "notesList": [
      "[Rule] Prerequisite: Charisma 1, Diplomacy 1.",
      "[Prerequisite] Charisma 1, Diplomacy 1"
    ]
  },
  {
    "id": "skill-skill-focus",
    "name": "Skill Focus",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "prerequisites": "Chosen Skill Rank 1",
    "prerequisite_text": "Chosen Skill Rank 1",
    "modifiers": [],
    "description": "The character has dedicated significant effort to mastering a specific skill.",
    "mechanic": "Gain a **\\+2 Bonus** to the chosen skill.",
    "rules": "This feature is **\\[Multiple\\]** and **\\[Ranked\\]**. You may purchase it again for the *same* skill each time you reach a new Skill Stage (Novice, Trained, Expert, Master) to stack the bonuses. (e.g., A Master (Rank 16\\) with 4 ranks of Skill Focus has a total \\+8 bonus from this feature).",
    "special_rules": "This feature is **\\[Multiple\\]** and **\\[Ranked\\]**. You may purchase it again for the *same* skill each time you reach a new Skill Stage (Novice, Trained, Expert, Master) to stack the bonuses. (e.g., A Master (Rank 16\\) with 4 ranks of Skill Focus has a total \\+8 bonus from this feature).",
    "body": "# Skill Focus\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Chosen Skill Rank 1\n\n## Description\nThe character has dedicated significant effort to mastering a specific skill.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to the chosen skill.\n\n## Special Rules\nThis feature is **\\[Multiple\\]** and **\\[Ranked\\]**. You may purchase it again for the *same* skill each time you reach a new Skill Stage (Novice, Trained, Expert, Master) to stack the bonuses. (e.g., A Master (Rank 16\\) with 4 ranks of Skill Focus has a total \\+8 bonus from this feature).",
    "full_text": "# Skill Focus\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Chosen Skill Rank 1\n\n## Description\nThe character has dedicated significant effort to mastering a specific skill.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to the chosen skill.\n\n## Special Rules\nThis feature is **\\[Multiple\\]** and **\\[Ranked\\]**. You may purchase it again for the *same* skill each time you reach a new Skill Stage (Novice, Trained, Expert, Master) to stack the bonuses. (e.g., A Master (Rank 16\\) with 4 ranks of Skill Focus has a total \\+8 bonus from this feature).",
    "mechanics": "Gain a **\\+2 Bonus** to the chosen skill.",
    "notes": "[Modifier] +2 to The chosen\n[Modifier] +8 to From this feature\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] This feature is **\\[Multiple\\]** and **\\[Ranked\\]**. You may purchase it again for the *same* skill ...\n[Prerequisite] Chosen Skill Rank 1",
    "notesList": [
      "[Modifier] +2 to The chosen",
      "[Modifier] +8 to From this feature",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] This feature is **\\[Multiple\\]** and **\\[Ranked\\]**. You may purchase it again for the *same* skill ...",
      "[Prerequisite] Chosen Skill Rank 1"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "physical",
        "mental_general",
        "mental_knowledges",
        "mental_vocations",
        "social_expression",
        "social_manipulation",
        "combat_archaic",
        "combat_modern",
        "combat_advanced",
        "meta_general",
        "meta_dimension",
        "meta_energy",
        "meta_entropy",
        "meta_illusion",
        "meta_matter",
        "meta_mental"
      ],
      "group_label": "All Skills",
      "max_skills": 1,
      "value": 2
    }
  },
  {
    "id": "skill-skill-mastery",
    "name": "Skill Mastery",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Skill Focus (any two), Focused Skills at Rank 11+ (Expert)",
    "prerequisite_text": "Skill Focus (any two), Focused Skills at Rank 11+ (Expert)",
    "modifiers": [
      {
        "target": "Focused Skills",
        "type": "take_10",
        "value": 10,
        "mode": "competence",
        "isSituational": true,
        "condition": "Mortal combat or severe stress",
        "description": "May Take 10 on all focused skills (Rank 11+) even in combat"
      }
    ],
    "description": "The character is so confident in their skills that they cannot fail under pressure.",
    "mechanic": "You may **Take 10** on checks with your Focused Skills even when rushed, threatened, or in combat.",
    "rules": "Prerequisite: Skill Focus (any two), Focused Skills at Rank 11+ (Expert).",
    "special_rules": "Prerequisite: Skill Focus (any two), Focused Skills at Rank 11+ (Expert).",
    "body": "# Skill Mastery\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Skill Focus (any two), Focused Skills at Rank 11+ (Expert)\n\n## Description\nThe character is so confident in their skills that they cannot fail under pressure.\n\n## Mechanics & Benefit\nYou may **Take 10** on checks with your Focused Skills even when rushed, threatened, or in combat.",
    "full_text": "# Skill Mastery\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Skill Focus (any two), Focused Skills at Rank 11+ (Expert)\n\n## Description\nThe character is so confident in their skills that they cannot fail under pressure.\n\n## Mechanics & Benefit\nYou may **Take 10** on checks with your Focused Skills even when rushed, threatened, or in combat.",
    "mechanics": "You may **Take 10** on checks with your Focused Skills even when rushed, threatened, or in combat.",
    "notes": "[Modifier] May Take 10 on all focused skills (Rank 11+) even in combat\n[Rule] Prerequisite: Skill Focus (any two), Focused Skills at Rank 11+ (Expert).\n[Prerequisite] Skill Focus (any two), Focused Skills at Rank 11+ (Expert)",
    "notesList": [
      "[Modifier] May Take 10 on all focused skills (Rank 11+) even in combat",
      "[Rule] Prerequisite: Skill Focus (any two), Focused Skills at Rank 11+ (Expert).",
      "[Prerequisite] Skill Focus (any two), Focused Skills at Rank 11+ (Expert)"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "physical",
        "mental_general",
        "mental_knowledges",
        "mental_vocations",
        "social_expression",
        "social_manipulation",
        "combat_archaic",
        "combat_modern",
        "combat_advanced",
        "meta_general",
        "meta_dimension",
        "meta_energy",
        "meta_entropy",
        "meta_illusion",
        "meta_matter",
        "meta_mental"
      ],
      "group_label": "Focused Skills",
      "max_skills": 1,
      "value": 2
    }
  },
  {
    "id": "skill-skill-specialization",
    "name": "Skill Specialization",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Chosen Skill Rank 6 (Trained)",
    "prerequisite_text": "Chosen Skill Rank 6 (Trained)",
    "modifiers": [],
    "description": "The character drills deep into a specific niche of a broad skill.",
    "mechanic": "Choose a sub-category of the skill (e.g., *Firearms: Sniping* or *Computers: Hacking*). You gain a separate pool of ranks in this specialization equal to your base skill rank (up to \\+10).  \n* **Mechanics:** When making a check in that specialization, you add your **Base Rank \\+ Specialization Rank**. This allows you to exceed the normal Skill Rank cap of 20 (reaching Pinnacle+).",
    "rules": "\\[Multiple\\] Can be taken for different skills or different sub-categories.",
    "special_rules": "\\[Multiple\\] Can be taken for different skills or different sub-categories.",
    "body": "# Skill Specialization\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Chosen Skill Rank 6 (Trained)\n\n## Description\nThe character drills deep into a specific niche of a broad skill.\n\n## Mechanics & Benefit\nChoose a sub-category of the skill (e.g., *Firearms: Sniping* or *Computers: Hacking*). You gain a separate pool of ranks in this specialization equal to your base skill rank (up to \\+10).  \n* **Mechanics:** When making a check in that specialization, you add your **Base Rank \\+ Specialization Rank**. This allows you to exceed the normal Skill Rank cap of 20 (reaching Pinnacle+).\n\n## Special Rules\n\\[Multiple\\] Can be taken for different skills or different sub-categories.",
    "full_text": "# Skill Specialization\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Chosen Skill Rank 6 (Trained)\n\n## Description\nThe character drills deep into a specific niche of a broad skill.\n\n## Mechanics & Benefit\nChoose a sub-category of the skill (e.g., *Firearms: Sniping* or *Computers: Hacking*). You gain a separate pool of ranks in this specialization equal to your base skill rank (up to \\+10).  \n* **Mechanics:** When making a check in that specialization, you add your **Base Rank \\+ Specialization Rank**. This allows you to exceed the normal Skill Rank cap of 20 (reaching Pinnacle+).\n\n## Special Rules\n\\[Multiple\\] Can be taken for different skills or different sub-categories.",
    "mechanics": "Choose a sub-category of the skill (e.g., *Firearms: Sniping* or *Computers: Hacking*). You gain a separate pool of ranks in this specialization equal to your base skill rank (up to \\+10).  \n* **Mechanics:** When making a check in that specialization, you add your **Base Rank \\+ Specialization Rank**. This allows you to exceed the normal Skill Rank cap of 20 (reaching Pinnacle+).",
    "notes": "[Modifier] Adds specialization level (+1 to +10) directly to narrow domain tasks\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Multiple\\] Can be taken for different skills or different sub-categories.\n[Prerequisite] Chosen Skill Rank 6 (Trained)",
    "notesList": [
      "[Modifier] Adds specialization level (+1 to +10) directly to narrow domain tasks",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] \\[Multiple\\] Can be taken for different skills or different sub-categories.",
      "[Prerequisite] Chosen Skill Rank 6 (Trained)"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "physical",
        "mental_general",
        "mental_knowledges",
        "mental_vocations",
        "social_expression",
        "social_manipulation",
        "combat_archaic",
        "combat_modern",
        "combat_advanced",
        "meta_general",
        "meta_dimension",
        "meta_energy",
        "meta_entropy",
        "meta_illusion",
        "meta_matter",
        "meta_mental"
      ],
      "group_label": "All Skills",
      "max_skills": 1,
      "value": 2
    }
  },
  {
    "id": "skill-social",
    "name": "Social",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Social\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is a social butterfly.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to **ALL Charisma Skills** and **Etiquette** checks.",
    "full_text": "# Social\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is a social butterfly.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to **ALL Charisma Skills** and **Etiquette** checks.",
    "mechanics": "Gain a **\\+1 Bonus** to **ALL Charisma Skills** and **Etiquette** checks.",
    "notes": "[Modifier] +1 to Charisma",
    "notesList": [
      "[Modifier] +1 to Charisma"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "physical",
        "mental_general",
        "mental_knowledges",
        "mental_vocations",
        "social_expression",
        "social_manipulation",
        "combat_archaic",
        "combat_modern",
        "combat_advanced",
        "meta_general",
        "meta_dimension",
        "meta_energy",
        "meta_entropy",
        "meta_illusion",
        "meta_matter",
        "meta_mental"
      ],
      "group_label": "All Skills",
      "max_skills": 1,
      "value": 1
    }
  },
  {
    "id": "skill-spacer",
    "name": "Spacer",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "Starship Operation Vocation",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Starship Operation Vocation"
      },
      {
        "target": "Pilot",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Pilot"
      },
      {
        "target": "Any Space Survival",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Any Space Survival"
      }
    ],
    "description": "The character was born or raised in the void; zero-g and vacuum are second nature.",
    "mechanic": "Gain a **\\+2 Bonus** to **Starship Operation** (Vocation/Pilot) and any **Space Survival** checks.",
    "rules": "",
    "special_rules": "",
    "body": "# Spacer\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character was born or raised in the void; zero-g and vacuum are second nature.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Starship Operation** (Vocation/Pilot) and any **Space Survival** checks.",
    "full_text": "# Spacer\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character was born or raised in the void; zero-g and vacuum are second nature.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Starship Operation** (Vocation/Pilot) and any **Space Survival** checks.",
    "mechanics": "Gain a **\\+2 Bonus** to **Starship Operation** (Vocation/Pilot) and any **Space Survival** checks.",
    "notes": "[Modifier] +2 to Starship Operation Vocation\n[Modifier] +2 to Pilot\n[Modifier] +2 to Any Space Survival",
    "notesList": [
      "[Modifier] +2 to Starship Operation Vocation",
      "[Modifier] +2 to Pilot",
      "[Modifier] +2 to Any Space Survival"
    ]
  },
  {
    "id": "skill-steady",
    "name": "Steady",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "Reflex",
        "type": "save",
        "value": 1,
        "mode": "inherent",
        "description": "+1 on Reflex Checks"
      },
      {
        "target": "physical-acrobatics",
        "type": "skill",
        "value": 2,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Balancing and ledge navigation",
        "description": "+2 to Acrobatics (Balancing)"
      },
      {
        "target": "physical-athletics",
        "type": "skill",
        "value": 2,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Hull and rock climbing",
        "description": "+2 to Athletics (Climbing)"
      }
    ],
    "description": "The character has excellent balance and steady hands.",
    "mechanic": "Gain a **\\+2 Bonus** to **Acrobatics** and **Athletics** (Balancing/Climbing) and a **\\+1 Bonus** to **Reflex** checks.",
    "rules": "",
    "special_rules": "",
    "body": "# Steady\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has excellent balance and steady hands.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Acrobatics** and **Athletics** (Balancing/Climbing) and a **\\+1 Bonus** to **Reflex** checks.",
    "full_text": "# Steady\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has excellent balance and steady hands.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Acrobatics** and **Athletics** (Balancing/Climbing) and a **\\+1 Bonus** to **Reflex** checks.",
    "mechanics": "Gain a **\\+2 Bonus** to **Acrobatics** and **Athletics** (Balancing/Climbing) and a **\\+1 Bonus** to **Reflex** checks.",
    "notes": "[Modifier] +1 on Reflex Checks\n[Modifier] +2 to Acrobatics (Balancing)\n[Modifier] +2 to Athletics (Climbing)",
    "notesList": [
      "[Modifier] +1 on Reflex Checks",
      "[Modifier] +2 to Acrobatics (Balancing)",
      "[Modifier] +2 to Athletics (Climbing)"
    ]
  },
  {
    "id": "skill-stealthy",
    "name": "Stealthy",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Agility 2",
    "prerequisite_text": "Agility 2",
    "modifiers": [
      {
        "target": "physical-stealth",
        "type": "skill",
        "value": 4,
        "mode": "competence",
        "description": "+4 to Stealth"
      },
      {
        "target": "physical-acrobatics",
        "type": "skill",
        "value": 2,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Escaping bonds and tight spaces",
        "description": "+2 to Escape Artist"
      },
      {
        "target": "social-expression-legerdemain",
        "type": "skill",
        "value": 2,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Concealing small items",
        "description": "+2 to Sleight of Hand"
      }
    ],
    "description": "The character is a shadow.",
    "mechanic": "Gain a **\\+2 Bonus** to **Escape Artist** and **Sleight of Hand**; Gain a **\\+4 Bonus** to **Stealth** checks.",
    "rules": "Prerequisite: Agility 2.",
    "special_rules": "Prerequisite: Agility 2.",
    "body": "# Stealthy\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2\n\n## Description\nThe character is a shadow.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Escape Artist** and **Sleight of Hand**; Gain a **\\+4 Bonus** to **Stealth** checks.",
    "full_text": "# Stealthy\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2\n\n## Description\nThe character is a shadow.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Escape Artist** and **Sleight of Hand**; Gain a **\\+4 Bonus** to **Stealth** checks.",
    "mechanics": "Gain a **\\+2 Bonus** to **Escape Artist** and **Sleight of Hand**; Gain a **\\+4 Bonus** to **Stealth** checks.",
    "notes": "[Modifier] +4 to Stealth\n[Modifier] +2 to Escape Artist\n[Modifier] +2 to Sleight of Hand\n[Rule] Prerequisite: Agility 2.\n[Prerequisite] Agility 2",
    "notesList": [
      "[Modifier] +4 to Stealth",
      "[Modifier] +2 to Escape Artist",
      "[Modifier] +2 to Sleight of Hand",
      "[Rule] Prerequisite: Agility 2.",
      "[Prerequisite] Agility 2"
    ]
  },
  {
    "id": "skill-stout",
    "name": "Stout",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Stout\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is built like a tank, broad and sturdy.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to **ALL Stamina & Constitution Skills**, as well as **Might** and **Fortitude** checks.",
    "full_text": "# Stout\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character is built like a tank, broad and sturdy.\n\n## Mechanics & Benefit\nGain a **\\+1 Bonus** to **ALL Stamina & Constitution Skills**, as well as **Might** and **Fortitude** checks.",
    "mechanics": "Gain a **\\+1 Bonus** to **ALL Stamina & Constitution Skills**, as well as **Might** and **Fortitude** checks.",
    "notes": "[Modifier] +1 to Stamina & Constitution",
    "notesList": [
      "[Modifier] +1 to Stamina & Constitution"
    ]
  },
  {
    "id": "skill-trustworthy",
    "name": "Trustworthy",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
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
    "rules": "",
    "special_rules": "",
    "body": "# Trustworthy\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has an honest face and a reliable demeanor.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Manipulation Skills** (Bluff/Diplomacy) and a **\\+1 Bonus** to **Culture** checks (fitting in).",
    "full_text": "# Trustworthy\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character has an honest face and a reliable demeanor.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to **Manipulation Skills** (Bluff/Diplomacy) and a **\\+1 Bonus** to **Culture** checks (fitting in).",
    "mechanics": "Gain a **\\+2 Bonus** to **Manipulation Skills** (Bluff/Diplomacy) and a **\\+1 Bonus** to **Culture** checks (fitting in).",
    "notes": "[Modifier] +2 to Manipulation\n[Modifier] +1 to Culture",
    "notesList": [
      "[Modifier] +2 to Manipulation",
      "[Modifier] +1 to Culture"
    ]
  },
  {
    "id": "skill-veiled-threat",
    "name": "Veiled Threat",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intimidate 6",
    "prerequisite_text": "Intimidate 6",
    "modifiers": [],
    "description": "The character can menace someone so subtly that bystanders don't notice, and the target is too scared to retaliate.",
    "mechanic": "When you use Intimidate to force a target to act, the target **does not become Hostile** toward you afterwards (they remain Indifferent or Unfriendly, but terrified). Bystanders must make an Insight check vs. your Intimidate to even realize a threat was made.",
    "rules": "Prerequisite: Intimidate 6.",
    "special_rules": "Prerequisite: Intimidate 6.",
    "body": "# Veiled Threat\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intimidate 6\n\n## Description\nThe character can menace someone so subtly that bystanders don't notice, and the target is too scared to retaliate.\n\n## Mechanics & Benefit\nWhen you use Intimidate to force a target to act, the target **does not become Hostile** toward you afterwards (they remain Indifferent or Unfriendly, but terrified). Bystanders must make an Insight check vs. your Intimidate to even realize a threat was made.",
    "full_text": "# Veiled Threat\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intimidate 6\n\n## Description\nThe character can menace someone so subtly that bystanders don't notice, and the target is too scared to retaliate.\n\n## Mechanics & Benefit\nWhen you use Intimidate to force a target to act, the target **does not become Hostile** toward you afterwards (they remain Indifferent or Unfriendly, but terrified). Bystanders must make an Insight check vs. your Intimidate to even realize a threat was made.",
    "mechanics": "When you use Intimidate to force a target to act, the target **does not become Hostile** toward you afterwards (they remain Indifferent or Unfriendly, but terrified). Bystanders must make an Insight check vs. your Intimidate to even realize a threat was made.",
    "notes": "[Rule] Prerequisite: Intimidate 6.\n[Prerequisite] Intimidate 6",
    "notesList": [
      "[Rule] Prerequisite: Intimidate 6.",
      "[Prerequisite] Intimidate 6"
    ]
  },
  {
    "id": "skill-versatile-curator",
    "name": "Versatile Curator",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Knowledge 6, Intellect 2",
    "prerequisite_text": "Knowledge 6, Intellect 2",
    "modifiers": [
      {
        "target": "Knowledges",
        "type": "virtual_ranks",
        "value": 1,
        "mode": "conditional",
        "isSituational": true,
        "condition": "1 rank per Intellect bonus > 1",
        "description": "Virtual ranks in Knowledge skills based on Intellect"
      }
    ],
    "description": "The character is a font of trivia and data.",
    "mechanic": "You gain \"Virtual Skills\" in the Knowledge category. For every point of Intellect Bonus you possess, you gain 1 Rank in a Knowledge skill you do not technically have, allowing you to make Trained checks.",
    "rules": "Prerequisite: Knowledge 6, Intellect 2.",
    "special_rules": "Prerequisite: Knowledge 6, Intellect 2.",
    "body": "# Versatile Curator\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Knowledge 6, Intellect 2\n\n## Description\nThe character is a font of trivia and data.\n\n## Mechanics & Benefit\nYou gain \"Virtual Skills\" in the Knowledge category. For every point of Intellect Bonus you possess, you gain 1 Rank in a Knowledge skill you do not technically have, allowing you to make Trained checks.",
    "full_text": "# Versatile Curator\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Knowledge 6, Intellect 2\n\n## Description\nThe character is a font of trivia and data.\n\n## Mechanics & Benefit\nYou gain \"Virtual Skills\" in the Knowledge category. For every point of Intellect Bonus you possess, you gain 1 Rank in a Knowledge skill you do not technically have, allowing you to make Trained checks.",
    "mechanics": "You gain \"Virtual Skills\" in the Knowledge category. For every point of Intellect Bonus you possess, you gain 1 Rank in a Knowledge skill you do not technically have, allowing you to make Trained checks.",
    "notes": "[Modifier] Virtual ranks in Knowledge skills based on Intellect\n[Rule] Prerequisite: Knowledge 6, Intellect 2.\n[Prerequisite] Knowledge 6, Intellect 2",
    "notesList": [
      "[Modifier] Virtual ranks in Knowledge skills based on Intellect",
      "[Rule] Prerequisite: Knowledge 6, Intellect 2.",
      "[Prerequisite] Knowledge 6, Intellect 2"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "mental_knowledges"
      ],
      "group_label": "Knowledge Skills",
      "max_skills": 1,
      "value": 1
    }
  },
  {
    "id": "skill-versatile-performer",
    "name": "Versatile Performer",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Perform 6, Intellect 2",
    "prerequisite_text": "Perform 6, Intellect 2",
    "modifiers": [],
    "description": "The character is a multi-talented artist.",
    "mechanic": "You gain \"Virtual Skills\" in the Performance category. For every point of Intellect Bonus, gain access to another Performance type (Singing, Dancing, Oratory) at your base rank.",
    "rules": "Prerequisite: Perform 6, Intellect 2.",
    "special_rules": "Prerequisite: Perform 6, Intellect 2.",
    "body": "# Versatile Performer\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Perform 6, Intellect 2\n\n## Description\nThe character is a multi-talented artist.\n\n## Mechanics & Benefit\nYou gain \"Virtual Skills\" in the Performance category. For every point of Intellect Bonus, gain access to another Performance type (Singing, Dancing, Oratory) at your base rank.",
    "full_text": "# Versatile Performer\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Perform 6, Intellect 2\n\n## Description\nThe character is a multi-talented artist.\n\n## Mechanics & Benefit\nYou gain \"Virtual Skills\" in the Performance category. For every point of Intellect Bonus, gain access to another Performance type (Singing, Dancing, Oratory) at your base rank.",
    "mechanics": "You gain \"Virtual Skills\" in the Performance category. For every point of Intellect Bonus, gain access to another Performance type (Singing, Dancing, Oratory) at your base rank.",
    "notes": "[Modifier] Virtual ranks in Performance skills based on Intellect\n[Rule] Prerequisite: Perform 6, Intellect 2.\n[Prerequisite] Perform 6, Intellect 2",
    "notesList": [
      "[Modifier] Virtual ranks in Performance skills based on Intellect",
      "[Rule] Prerequisite: Perform 6, Intellect 2.",
      "[Prerequisite] Perform 6, Intellect 2"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "social_expression"
      ],
      "group_label": "Expression & Performance Skills",
      "max_skills": 1,
      "value": 1
    }
  },
  {
    "id": "skill-versatile-professional",
    "name": "Versatile Professional",
    "category": "Skill",
    "type": "skill",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Vocation 6, Intellect 2",
    "prerequisite_text": "Vocation 6, Intellect 2",
    "modifiers": [
      {
        "target": "Vocations",
        "type": "virtual_ranks",
        "value": 1,
        "mode": "conditional",
        "isSituational": true,
        "condition": "1 rank per Intellect bonus > 1",
        "description": "Virtual ranks in Vocation skills based on Intellect"
      }
    ],
    "description": "The character knows every job on the crew.",
    "mechanic": "You gain \"Virtual Skills\" in the Vocation category. For every point of Intellect Bonus, gain access to a related Vocation sub-skill without spending CP.  \n  * *Example:* A Soldier with Int \\+2 might gain Virtual Ranks in *Armorer* and *Demolitions*.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "rules": "Prerequisite: Vocation 6, Intellect 2.",
    "special_rules": "Prerequisite: Vocation 6, Intellect 2.",
    "body": "# Versatile Professional\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Vocation 6, Intellect 2\n\n## Description\nThe character knows every job on the crew.\n\n## Mechanics & Benefit\nYou gain \"Virtual Skills\" in the Vocation category. For every point of Intellect Bonus, gain access to a related Vocation sub-skill without spending CP.  \n  * *Example:* A Soldier with Int \\+2 might gain Virtual Ranks in *Armorer* and *Demolitions*.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "full_text": "# Versatile Professional\n\n**Category**: Skill Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Vocation 6, Intellect 2\n\n## Description\nThe character knows every job on the crew.\n\n## Mechanics & Benefit\nYou gain \"Virtual Skills\" in the Vocation category. For every point of Intellect Bonus, gain access to a related Vocation sub-skill without spending CP.  \n  * *Example:* A Soldier with Int \\+2 might gain Virtual Ranks in *Armorer* and *Demolitions*.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "mechanics": "You gain \"Virtual Skills\" in the Vocation category. For every point of Intellect Bonus, gain access to a related Vocation sub-skill without spending CP.  \n  * *Example:* A Soldier with Int \\+2 might gain Virtual Ranks in *Armorer* and *Demolitions*.\n\n&nbsp;\n\n&nbsp;\n\n&nbsp;",
    "notes": "[Modifier] Virtual ranks in Vocation skills based on Intellect\n[Rule] Prerequisite: Vocation 6, Intellect 2.\n[Prerequisite] Vocation 6, Intellect 2",
    "notesList": [
      "[Modifier] Virtual ranks in Vocation skills based on Intellect",
      "[Rule] Prerequisite: Vocation 6, Intellect 2.",
      "[Prerequisite] Vocation 6, Intellect 2"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "group_pool",
      "group_keys": [
        "mental_vocations"
      ],
      "group_label": "Vocation Skills",
      "max_skills": 1,
      "value": 1
    }
  },
  {
    "id": "special-acute-sense",
    "name": "Acute Sense",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Awareness 1",
    "prerequisite_text": "Awareness 1",
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
    "body": "# Acute Sense\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 1\n\n## Description\nThe character possesses a specific sensory organ that is highly developed, far exceeding the baseline for their species. This could be eagle eyes, a bloodhound’s nose, or sensitive auditory receptors.\n\n## Mechanics & Benefit\nChoose one sense (Vision, Hearing, Smell, Taste, or Touch). You gain a **\\+2 Bonus** to **Awareness Checks** utilizing that sense.\n\n## Special Rules\n\\[Multiple\\] You may take this feature multiple times, applying it to a different sense each time.",
    "full_text": "# Acute Sense\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awareness 1\n\n## Description\nThe character possesses a specific sensory organ that is highly developed, far exceeding the baseline for their species. This could be eagle eyes, a bloodhound’s nose, or sensitive auditory receptors.\n\n## Mechanics & Benefit\nChoose one sense (Vision, Hearing, Smell, Taste, or Touch). You gain a **\\+2 Bonus** to **Awareness Checks** utilizing that sense.\n\n## Special Rules\n\\[Multiple\\] You may take this feature multiple times, applying it to a different sense each time.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Acute Sense (in the corresponding sense), Intellect 2",
    "prerequisite_text": "Acute Sense (in the corresponding sense), Intellect 2",
    "modifiers": [],
    "description": "The character’s senses function like a tricorder or forensic scanner. They don't just see or smell; they analyze chemical compositions, structural stress points, and thermal gradients naturally.",
    "mechanic": "When using your chosen Acute Sense, you gain specific, detailed scientific information. A smell isn't just \"almond-like\"; it is \"Cyanide, distinct trace.\"  \n* **Mechanics:** You may use **Perception** in place of **Investigation** or **Science** checks to identify substances or analyze clues if the sensory input is available.",
    "rules": "Prerequisite: Acute Sense (in the corresponding sense), Intellect 2.",
    "special_rules": "Prerequisite: Acute Sense (in the corresponding sense), Intellect 2.",
    "body": "# Analytical Sense\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Acute Sense (in the corresponding sense), Intellect 2\n\n## Description\nThe character’s senses function like a tricorder or forensic scanner. They don't just see or smell; they analyze chemical compositions, structural stress points, and thermal gradients naturally.\n\n## Mechanics & Benefit\nWhen using your chosen Acute Sense, you gain specific, detailed scientific information. A smell isn't just \"almond-like\"; it is \"Cyanide, distinct trace.\"  \n* **Mechanics:** You may use **Perception** in place of **Investigation** or **Science** checks to identify substances or analyze clues if the sensory input is available.",
    "full_text": "# Analytical Sense\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Acute Sense (in the corresponding sense), Intellect 2\n\n## Description\nThe character’s senses function like a tricorder or forensic scanner. They don't just see or smell; they analyze chemical compositions, structural stress points, and thermal gradients naturally.\n\n## Mechanics & Benefit\nWhen using your chosen Acute Sense, you gain specific, detailed scientific information. A smell isn't just \"almond-like\"; it is \"Cyanide, distinct trace.\"  \n* **Mechanics:** You may use **Perception** in place of **Investigation** or **Science** checks to identify substances or analyze clues if the sensory input is available.",
    "mechanics": "When using your chosen Acute Sense, you gain specific, detailed scientific information. A smell isn't just \"almond-like\"; it is \"Cyanide, distinct trace.\"  \n* **Mechanics:** You may use **Perception** in place of **Investigation** or **Science** checks to identify substances or analyze clues if the sensory input is available.",
    "notes": "[Rule] Prerequisite: Acute Sense (in the corresponding sense), Intellect 2.\n[Prerequisite] Acute Sense (in the corresponding sense), Intellect 2",
    "notesList": [
      "[Rule] Prerequisite: Acute Sense (in the corresponding sense), Intellect 2.",
      "[Prerequisite] Acute Sense (in the corresponding sense), Intellect 2"
    ]
  },
  {
    "id": "special-augmented",
    "name": "Augmented",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Available Technology Level (TL 3+)",
    "prerequisite_text": "Available Technology Level (TL 3+)",
    "modifiers": [],
    "description": "The character has undergone invasive surgery to replace or enhance biological systems with cybernetics, biotechnology, or magical prosthetics.",
    "mechanic": "You are compatible with **Standard Augmentations**.",
    "rules": "Upon taking this feature, you gain a \"credit\" of **6 Character Points (CP)** worth of Augmentations effectively for free (representing the initial suite of upgrades). Any cost beyond this must be paid with CP or Credits.",
    "special_rules": "Upon taking this feature, you gain a \"credit\" of **6 Character Points (CP)** worth of Augmentations effectively for free (representing the initial suite of upgrades). Any cost beyond this must be paid with CP or Credits.",
    "body": "# Augmented\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Available Technology Level (TL 3+)\n\n## Description\nThe character has undergone invasive surgery to replace or enhance biological systems with cybernetics, biotechnology, or magical prosthetics.\n\n## Mechanics & Benefit\nYou are compatible with **Standard Augmentations**.\n\n## Special Rules\nUpon taking this feature, you gain a \"credit\" of **6 Character Points (CP)** worth of Augmentations effectively for free (representing the initial suite of upgrades). Any cost beyond this must be paid with CP or Credits.",
    "full_text": "# Augmented\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Available Technology Level (TL 3+)\n\n## Description\nThe character has undergone invasive surgery to replace or enhance biological systems with cybernetics, biotechnology, or magical prosthetics.\n\n## Mechanics & Benefit\nYou are compatible with **Standard Augmentations**.\n\n## Special Rules\nUpon taking this feature, you gain a \"credit\" of **6 Character Points (CP)** worth of Augmentations effectively for free (representing the initial suite of upgrades). Any cost beyond this must be paid with CP or Credits.",
    "mechanics": "You are compatible with **Standard Augmentations**.",
    "notes": "[Rule] Upon taking this feature, you gain a \"credit\" of **6 Character Points (CP)** worth of Augmentations ...\n[Prerequisite] Available Technology Level (TL 3+)",
    "notesList": [
      "[Rule] Upon taking this feature, you gain a \"credit\" of **6 Character Points (CP)** worth of Augmentations ...",
      "[Prerequisite] Available Technology Level (TL 3+)"
    ]
  },
  {
    "id": "special-biotechnology",
    "name": "Biotechnology",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awakened (Psychic) OR Tech Level 4+ society.",
    "prerequisite_text": "Awakened (Psychic) OR Tech Level 4+ society.",
    "modifiers": [],
    "description": "The character is trained or naturally adapted to use \"Living Technology\"—grown items, symbiotic armor, and genetically engineered tools (common among Aulurans and Tyranid-like factions).",
    "mechanic": "You can imprint, operate, and heal Living Technology. Without this feature, Biotech items treat the user as a foreign body and may not function or may even attack the user.",
    "rules": "Prerequisite: Awakened (Psychic) OR Tech Level 4+ society..",
    "special_rules": "Prerequisite: Awakened (Psychic) OR Tech Level 4+ society..",
    "body": "# Biotechnology\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awakened (Psychic) OR Tech Level 4+ society.\n\n## Description\nThe character is trained or naturally adapted to use \"Living Technology\"—grown items, symbiotic armor, and genetically engineered tools (common among Aulurans and Tyranid-like factions).\n\n## Mechanics & Benefit\nYou can imprint, operate, and heal Living Technology. Without this feature, Biotech items treat the user as a foreign body and may not function or may even attack the user.",
    "full_text": "# Biotechnology\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awakened (Psychic) OR Tech Level 4+ society.\n\n## Description\nThe character is trained or naturally adapted to use \"Living Technology\"—grown items, symbiotic armor, and genetically engineered tools (common among Aulurans and Tyranid-like factions).\n\n## Mechanics & Benefit\nYou can imprint, operate, and heal Living Technology. Without this feature, Biotech items treat the user as a foreign body and may not function or may even attack the user.",
    "mechanics": "You can imprint, operate, and heal Living Technology. Without this feature, Biotech items treat the user as a foreign body and may not function or may even attack the user.",
    "notes": "[Rule] Prerequisite: Awakened (Psychic) OR Tech Level 4+ society..\n[Prerequisite] Awakened (Psychic) OR Tech Level 4+ society.",
    "notesList": [
      "[Rule] Prerequisite: Awakened (Psychic) OR Tech Level 4+ society..",
      "[Prerequisite] Awakened (Psychic) OR Tech Level 4+ society."
    ]
  },
  {
    "id": "special-bleed",
    "name": "Bleed",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Sneak Attack",
    "prerequisite_text": "Sneak Attack",
    "modifiers": [],
    "description": "A dirty fighting technique that opens veins or severs lines.",
    "mechanic": "When you deal Sneak Attack damage, the target also takes **1 point of Bleed damage** per die of Sneak Attack. This damage persists every round until healed/repaired.",
    "rules": "Prerequisite: Sneak Attack.",
    "special_rules": "Prerequisite: Sneak Attack.",
    "body": "# Bleed\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nA dirty fighting technique that opens veins or severs lines.\n\n## Mechanics & Benefit\nWhen you deal Sneak Attack damage, the target also takes **1 point of Bleed damage** per die of Sneak Attack. This damage persists every round until healed/repaired.",
    "full_text": "# Bleed\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nA dirty fighting technique that opens veins or severs lines.\n\n## Mechanics & Benefit\nWhen you deal Sneak Attack damage, the target also takes **1 point of Bleed damage** per die of Sneak Attack. This damage persists every round until healed/repaired.",
    "mechanics": "When you deal Sneak Attack damage, the target also takes **1 point of Bleed damage** per die of Sneak Attack. This damage persists every round until healed/repaired.",
    "notes": "[Rule] Prerequisite: Sneak Attack.\n[Prerequisite] Sneak Attack",
    "notesList": [
      "[Rule] Prerequisite: Sneak Attack.",
      "[Prerequisite] Sneak Attack"
    ]
  },
  {
    "id": "special-blind",
    "name": "Blind",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Sneak Attack",
    "prerequisite_text": "Sneak Attack",
    "modifiers": [],
    "description": "A precision strike to the eyes or sensors.",
    "mechanic": "You may trade your Sneak Attack damage dice to inflict the **Blinded** condition on the target for 1d4 rounds.",
    "rules": "Prerequisite: Sneak Attack.",
    "special_rules": "Prerequisite: Sneak Attack.",
    "body": "# Blind\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nA precision strike to the eyes or sensors.\n\n## Mechanics & Benefit\nYou may trade your Sneak Attack damage dice to inflict the **Blinded** condition on the target for 1d4 rounds.",
    "full_text": "# Blind\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nA precision strike to the eyes or sensors.\n\n## Mechanics & Benefit\nYou may trade your Sneak Attack damage dice to inflict the **Blinded** condition on the target for 1d4 rounds.",
    "mechanics": "You may trade your Sneak Attack damage dice to inflict the **Blinded** condition on the target for 1d4 rounds.",
    "notes": "[Rule] Prerequisite: Sneak Attack.\n[Prerequisite] Sneak Attack",
    "notesList": [
      "[Rule] Prerequisite: Sneak Attack.",
      "[Prerequisite] Sneak Attack"
    ]
  },
  {
    "id": "special-bonded",
    "name": "Bonded",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Charisma 2",
    "prerequisite_text": "Charisma 2",
    "modifiers": [],
    "description": "The character shares a profound, supernatural connection with another specific being.",
    "mechanic": "You possess a **Tele-Empathic** link with another character (PC or NPC) who also possesses this feature. You can sense their strong emotions and general physical state (pain, unconsciousness) regardless of distance.",
    "rules": "Prerequisite: Charisma 2.",
    "special_rules": "Prerequisite: Charisma 2.",
    "body": "# Bonded\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character shares a profound, supernatural connection with another specific being.\n\n## Mechanics & Benefit\nYou possess a **Tele-Empathic** link with another character (PC or NPC) who also possesses this feature. You can sense their strong emotions and general physical state (pain, unconsciousness) regardless of distance.",
    "full_text": "# Bonded\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma 2\n\n## Description\nThe character shares a profound, supernatural connection with another specific being.\n\n## Mechanics & Benefit\nYou possess a **Tele-Empathic** link with another character (PC or NPC) who also possesses this feature. You can sense their strong emotions and general physical state (pain, unconsciousness) regardless of distance.",
    "mechanics": "You possess a **Tele-Empathic** link with another character (PC or NPC) who also possesses this feature. You can sense their strong emotions and general physical state (pain, unconsciousness) regardless of distance.",
    "notes": "[Rule] Prerequisite: Charisma 2.\n[Prerequisite] Charisma 2",
    "notesList": [
      "[Rule] Prerequisite: Charisma 2.",
      "[Prerequisite] Charisma 2"
    ]
  },
  {
    "id": "special-companion",
    "name": "Companion",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "prerequisites": "Charisma",
    "prerequisite_text": "Charisma",
    "modifiers": [],
    "description": "The character has a loyal follower, pet, droid, or mount.",
    "mechanic": "You gain a loyal NPC ally built with **40 Character Points**.",
    "rules": "\\[Ranked\\] Taking this feature again can either upgrade the existing companion (adding \\+40 CP) or gain a second companion.",
    "special_rules": "\\[Ranked\\] Taking this feature again can either upgrade the existing companion (adding \\+40 CP) or gain a second companion.",
    "body": "# Companion\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma\n\n## Description\nThe character has a loyal follower, pet, droid, or mount.\n\n## Mechanics & Benefit\nYou gain a loyal NPC ally built with **40 Character Points**.\n\n## Special Rules\n\\[Ranked\\] Taking this feature again can either upgrade the existing companion (adding \\+40 CP) or gain a second companion.",
    "full_text": "# Companion\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Charisma\n\n## Description\nThe character has a loyal follower, pet, droid, or mount.\n\n## Mechanics & Benefit\nYou gain a loyal NPC ally built with **40 Character Points**.\n\n## Special Rules\n\\[Ranked\\] Taking this feature again can either upgrade the existing companion (adding \\+40 CP) or gain a second companion.",
    "mechanics": "You gain a loyal NPC ally built with **40 Character Points**.",
    "notes": "[Modifier] +40 to Gain a second companion\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Ranked\\] Taking this feature again can either upgrade the existing companion (adding \\+40 CP) or g...\n[Prerequisite] Charisma",
    "notesList": [
      "[Modifier] +40 to Gain a second companion",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] \\[Ranked\\] Taking this feature again can either upgrade the existing companion (adding \\+40 CP) or g...",
      "[Prerequisite] Charisma"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "single",
      "options": [
        "Tactical Drone (Synthetic Recon/Assault Platform)",
        "Bio-Construct / Cyber-Beast (Engineered Organic Companion)",
        "Executive Cohort (Loyal Lieutenant / Specialist Officer)",
        "Metaphysical Guide (Aetheric / Entropic Manifestation)",
        "Field Automaton (Heavy Security / Logistics Android)"
      ]
    }
  },
  {
    "id": "special-cripple",
    "name": "Cripple",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Sneak Attack",
    "prerequisite_text": "Sneak Attack",
    "modifiers": [],
    "description": "A brutal strike to the arms or weapon systems.",
    "mechanic": "You may trade your Sneak Attack damage dice to force the target to drop their weapon or disable one of their arms/manipulators.",
    "rules": "Prerequisite: Sneak Attack.",
    "special_rules": "Prerequisite: Sneak Attack.",
    "body": "# Cripple\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nA brutal strike to the arms or weapon systems.\n\n## Mechanics & Benefit\nYou may trade your Sneak Attack damage dice to force the target to drop their weapon or disable one of their arms/manipulators.",
    "full_text": "# Cripple\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nA brutal strike to the arms or weapon systems.\n\n## Mechanics & Benefit\nYou may trade your Sneak Attack damage dice to force the target to drop their weapon or disable one of their arms/manipulators.",
    "mechanics": "You may trade your Sneak Attack damage dice to force the target to drop their weapon or disable one of their arms/manipulators.",
    "notes": "[Rule] Prerequisite: Sneak Attack.\n[Prerequisite] Sneak Attack",
    "notesList": [
      "[Rule] Prerequisite: Sneak Attack.",
      "[Prerequisite] Sneak Attack"
    ]
  },
  {
    "id": "special-danger-sense",
    "name": "Danger Sense",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Wisdom 1",
    "prerequisite_text": "Wisdom 1",
    "modifiers": [
      {
        "target": "mental-general-alertness",
        "type": "check_advantage",
        "value": 1,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Surprise checks and trap avoidance",
        "description": "Advantage on Surprise checks and checks to avoid traps (Roll 3d10, take best 2)"
      }
    ],
    "description": "A \"sixth sense\" or spidey-sense that warns of immediate peril.",
    "mechanic": "You make all **Surprise Checks** and checks to avoid traps at **Advantage**. You are never truly \"unaware\" of direct danger, allowing you to act in the Surprise round.",
    "rules": "Prerequisite: Wisdom 1.",
    "special_rules": "Prerequisite: Wisdom 1.",
    "body": "# Danger Sense\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nA \"sixth sense\" or spidey-sense that warns of immediate peril.\n\n## Mechanics & Benefit\nYou make all **Surprise Checks** and checks to avoid traps at **Advantage**. You are never truly \"unaware\" of direct danger, allowing you to act in the Surprise round.",
    "full_text": "# Danger Sense\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nA \"sixth sense\" or spidey-sense that warns of immediate peril.\n\n## Mechanics & Benefit\nYou make all **Surprise Checks** and checks to avoid traps at **Advantage**. You are never truly \"unaware\" of direct danger, allowing you to act in the Surprise round.",
    "mechanics": "You make all **Surprise Checks** and checks to avoid traps at **Advantage**. You are never truly \"unaware\" of direct danger, allowing you to act in the Surprise round.",
    "notes": "[Modifier] Advantage on Surprise checks and checks to avoid traps (Roll 3d10, take best 2)\n[Rule] Prerequisite: Wisdom 1.\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Modifier] Advantage on Surprise checks and checks to avoid traps (Roll 3d10, take best 2)",
      "[Rule] Prerequisite: Wisdom 1.",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "special-darksight",
    "name": "Darksight",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character sees using thermal or other non-visible spectrums.",
    "mechanic": "You can see in total darkness up to 60 feet.  \n* **Limitation:** This vision is typically black and white or monochromatic (e.g., heat vision).",
    "rules": "",
    "special_rules": "",
    "body": "# Darksight\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character sees using thermal or other non-visible spectrums.\n\n## Mechanics & Benefit\nYou can see in total darkness up to 60 feet.  \n* **Limitation:** This vision is typically black and white or monochromatic (e.g., heat vision).",
    "full_text": "# Darksight\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character sees using thermal or other non-visible spectrums.\n\n## Mechanics & Benefit\nYou can see in total darkness up to 60 feet.  \n* **Limitation:** This vision is typically black and white or monochromatic (e.g., heat vision).",
    "mechanics": "You can see in total darkness up to 60 feet.  \n* **Limitation:** This vision is typically black and white or monochromatic (e.g., heat vision).",
    "notes": "",
    "notesList": []
  },
  {
    "id": "special-dwarfism",
    "name": "Dwarfism",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Species Trait or Flaw",
    "prerequisite_text": "Species Trait or Flaw",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": 1,
        "mode": "inherent",
        "description": "+1 Defense"
      },
      {
        "target": "Strike",
        "type": "skill",
        "value": 1,
        "mode": "inherent",
        "description": "+1 to Strike"
      }
    ],
    "description": "The character is significantly smaller than the average for their species.",
    "mechanic": "Your Size Category decreases by one step (e.g., Medium to Small).  \n* **Mechanics:** Gain **\\+1 to Defense**, **\\+4 to Stealth**, and **\\+1 to Strike**. Decrease lifting/carrying capacity and movement speed (typically \\-10ft).",
    "rules": "Prerequisite: Species Trait or Flaw.",
    "special_rules": "Prerequisite: Species Trait or Flaw.",
    "body": "# Dwarfism\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Species Trait or Flaw\n\n## Description\nThe character is significantly smaller than the average for their species.\n\n## Mechanics & Benefit\nYour Size Category decreases by one step (e.g., Medium to Small).  \n* **Mechanics:** Gain **\\+1 to Defense**, **\\+4 to Stealth**, and **\\+1 to Strike**. Decrease lifting/carrying capacity and movement speed (typically \\-10ft).",
    "full_text": "# Dwarfism\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Species Trait or Flaw\n\n## Description\nThe character is significantly smaller than the average for their species.\n\n## Mechanics & Benefit\nYour Size Category decreases by one step (e.g., Medium to Small).  \n* **Mechanics:** Gain **\\+1 to Defense**, **\\+4 to Stealth**, and **\\+1 to Strike**. Decrease lifting/carrying capacity and movement speed (typically \\-10ft).",
    "mechanics": "Your Size Category decreases by one step (e.g., Medium to Small).  \n* **Mechanics:** Gain **\\+1 to Defense**, **\\+4 to Stealth**, and **\\+1 to Strike**. Decrease lifting/carrying capacity and movement speed (typically \\-10ft).",
    "notes": "[Modifier] +1 Defense\n[Modifier] +1 to Strike\n[Rule] Prerequisite: Species Trait or Flaw.\n[Prerequisite] Species Trait or Flaw",
    "notesList": [
      "[Modifier] +1 Defense",
      "[Modifier] +1 to Strike",
      "[Rule] Prerequisite: Species Trait or Flaw.",
      "[Prerequisite] Species Trait or Flaw"
    ]
  },
  {
    "id": "special-eldritch-heritage",
    "name": "Eldritch Heritage",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None (Background)",
    "prerequisite_text": "None (Background)",
    "modifiers": [],
    "description": "The character carries the blood of dragons, demons, fey, or gods.",
    "mechanic": "You gain a specific **Bloodline Power** or minor supernatural trait associated with your ancestor (e.g., minor energy resistance, claws, or a cantrip-level spell usable at will).",
    "rules": "Prerequisite: None (Background).",
    "special_rules": "Prerequisite: None (Background).",
    "body": "# Eldritch Heritage\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None (Background)\n\n## Description\nThe character carries the blood of dragons, demons, fey, or gods.\n\n## Mechanics & Benefit\nYou gain a specific **Bloodline Power** or minor supernatural trait associated with your ancestor (e.g., minor energy resistance, claws, or a cantrip-level spell usable at will).",
    "full_text": "# Eldritch Heritage\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None (Background)\n\n## Description\nThe character carries the blood of dragons, demons, fey, or gods.\n\n## Mechanics & Benefit\nYou gain a specific **Bloodline Power** or minor supernatural trait associated with your ancestor (e.g., minor energy resistance, claws, or a cantrip-level spell usable at will).",
    "mechanics": "You gain a specific **Bloodline Power** or minor supernatural trait associated with your ancestor (e.g., minor energy resistance, claws, or a cantrip-level spell usable at will).",
    "notes": "[Rule] Prerequisite: None (Background).\n[Prerequisite] None (Background)",
    "notesList": [
      "[Rule] Prerequisite: None (Background).",
      "[Prerequisite] None (Background)"
    ]
  },
  {
    "id": "special-energy-resistance",
    "name": "Energy Resistance",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character's physiology is resistant to a specific form of energy (Fire, Cold, Electricity, Acid, Sonic).",
    "mechanic": "Gain **Resistance 5** against one chosen energy type. (Subtract 5 from all damage of that type).",
    "rules": "\\[Ranked\\] Stacks to Resistance 10, 15, etc., eventually becoming Immunity.",
    "special_rules": "\\[Ranked\\] Stacks to Resistance 10, 15, etc., eventually becoming Immunity.",
    "body": "# Energy Resistance\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character's physiology is resistant to a specific form of energy (Fire, Cold, Electricity, Acid, Sonic).\n\n## Mechanics & Benefit\nGain **Resistance 5** against one chosen energy type. (Subtract 5 from all damage of that type).\n\n## Special Rules\n\\[Ranked\\] Stacks to Resistance 10, 15, etc., eventually becoming Immunity.",
    "full_text": "# Energy Resistance\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character's physiology is resistant to a specific form of energy (Fire, Cold, Electricity, Acid, Sonic).\n\n## Mechanics & Benefit\nGain **Resistance 5** against one chosen energy type. (Subtract 5 from all damage of that type).\n\n## Special Rules\n\\[Ranked\\] Stacks to Resistance 10, 15, etc., eventually becoming Immunity.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Heavy Augmentations, Stamina 4",
    "prerequisite_text": "Heavy Augmentations, Stamina 4",
    "modifiers": [],
    "description": "The character is more machine (or bio-construct) than original being. They have replaced the majority of their biological functions.",
    "mechanic": "You may undergo **Full Body Conversion**. You may install systems that alter your Size category or basic physiology (e.g., tank treads instead of legs). You gain an additional **6 CP** worth of Augmentations.",
    "rules": "Prerequisite: Heavy Augmentations, Stamina 4.",
    "special_rules": "Prerequisite: Heavy Augmentations, Stamina 4.",
    "body": "# Extreme Augmentations\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Heavy Augmentations, Stamina 4\n\n## Description\nThe character is more machine (or bio-construct) than original being. They have replaced the majority of their biological functions.\n\n## Mechanics & Benefit\nYou may undergo **Full Body Conversion**. You may install systems that alter your Size category or basic physiology (e.g., tank treads instead of legs). You gain an additional **6 CP** worth of Augmentations.",
    "full_text": "# Extreme Augmentations\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Heavy Augmentations, Stamina 4\n\n## Description\nThe character is more machine (or bio-construct) than original being. They have replaced the majority of their biological functions.\n\n## Mechanics & Benefit\nYou may undergo **Full Body Conversion**. You may install systems that alter your Size category or basic physiology (e.g., tank treads instead of legs). You gain an additional **6 CP** worth of Augmentations.",
    "mechanics": "You may undergo **Full Body Conversion**. You may install systems that alter your Size category or basic physiology (e.g., tank treads instead of legs). You gain an additional **6 CP** worth of Augmentations.",
    "notes": "[Rule] Prerequisite: Heavy Augmentations, Stamina 4.\n[Prerequisite] Heavy Augmentations, Stamina 4",
    "notesList": [
      "[Rule] Prerequisite: Heavy Augmentations, Stamina 4.",
      "[Prerequisite] Heavy Augmentations, Stamina 4"
    ]
  },
  {
    "id": "special-familiar",
    "name": "Familiar",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Bonded, Companion, Awakened",
    "prerequisite_text": "Bonded, Companion, Awakened",
    "modifiers": [
      {
        "target": "Character Points",
        "type": "skill",
        "value": 20,
        "mode": "inherent",
        "description": "+20 to Character Points"
      }
    ],
    "description": "The companion is not just a pet, but a metaphysical extension of the character's will.",
    "mechanic": "Your Companion gains **\\+20 Character Points**. You always know the exact direction and distance to your familiar.",
    "rules": "Prerequisite: Bonded, Companion, Awakened.",
    "special_rules": "Prerequisite: Bonded, Companion, Awakened.",
    "body": "# Familiar\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Bonded, Companion, Awakened\n\n## Description\nThe companion is not just a pet, but a metaphysical extension of the character's will.\n\n## Mechanics & Benefit\nYour Companion gains **\\+20 Character Points**. You always know the exact direction and distance to your familiar.",
    "full_text": "# Familiar\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Bonded, Companion, Awakened\n\n## Description\nThe companion is not just a pet, but a metaphysical extension of the character's will.\n\n## Mechanics & Benefit\nYour Companion gains **\\+20 Character Points**. You always know the exact direction and distance to your familiar.",
    "mechanics": "Your Companion gains **\\+20 Character Points**. You always know the exact direction and distance to your familiar.",
    "notes": "[Modifier] +20 to Character Points\n[Rule] Prerequisite: Bonded, Companion, Awakened.\n[Prerequisite] Bonded, Companion, Awakened",
    "notesList": [
      "[Modifier] +20 to Character Points",
      "[Rule] Prerequisite: Bonded, Companion, Awakened.",
      "[Prerequisite] Bonded, Companion, Awakened"
    ]
  },
  {
    "id": "special-giant",
    "name": "Giant",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Species Trait",
    "prerequisite_text": "Species Trait",
    "modifiers": [
      {
        "target": "defense-mod",
        "type": "combat",
        "value": -1,
        "mode": "inherent",
        "description": "-1 Defense"
      },
      {
        "target": "Strength",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Strength"
      },
      {
        "target": "Increased Reach threat range",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Increased Reach threat range"
      },
      {
        "target": "Higher carrying capacity",
        "type": "skill",
        "value": 2,
        "mode": "inherent",
        "description": "+2 to Higher carrying capacity"
      },
      {
        "target": "Stealth",
        "type": "skill",
        "value": -4,
        "mode": "penalty",
        "description": "-4 to Stealth"
      }
    ],
    "description": "The character is significantly larger than the average for their species.",
    "mechanic": "Your Size Category increases by one step (e.g., Medium to Large).  \n* **Mechanics:** Gain **\\+2 Strength**, increased Reach (threat range), and higher carrying capacity. Suffer **\\-1 to Defense** and **\\-4 to Stealth**.",
    "rules": "Prerequisite: Species Trait.",
    "special_rules": "Prerequisite: Species Trait.",
    "body": "# Giant\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Species Trait\n\n## Description\nThe character is significantly larger than the average for their species.\n\n## Mechanics & Benefit\nYour Size Category increases by one step (e.g., Medium to Large).  \n* **Mechanics:** Gain **\\+2 Strength**, increased Reach (threat range), and higher carrying capacity. Suffer **\\-1 to Defense** and **\\-4 to Stealth**.",
    "full_text": "# Giant\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Species Trait\n\n## Description\nThe character is significantly larger than the average for their species.\n\n## Mechanics & Benefit\nYour Size Category increases by one step (e.g., Medium to Large).  \n* **Mechanics:** Gain **\\+2 Strength**, increased Reach (threat range), and higher carrying capacity. Suffer **\\-1 to Defense** and **\\-4 to Stealth**.",
    "mechanics": "Your Size Category increases by one step (e.g., Medium to Large).  \n* **Mechanics:** Gain **\\+2 Strength**, increased Reach (threat range), and higher carrying capacity. Suffer **\\-1 to Defense** and **\\-4 to Stealth**.",
    "notes": "[Penalty] -1 Defense\n[Modifier] +2 to Strength\n[Modifier] +2 to Increased Reach threat range\n[Modifier] +2 to Higher carrying capacity\n[Penalty] -4 to Stealth\n[Rule] Prerequisite: Species Trait.\n[Prerequisite] Species Trait",
    "notesList": [
      "[Penalty] -1 Defense",
      "[Modifier] +2 to Strength",
      "[Modifier] +2 to Increased Reach threat range",
      "[Modifier] +2 to Higher carrying capacity",
      "[Penalty] -4 to Stealth",
      "[Rule] Prerequisite: Species Trait.",
      "[Prerequisite] Species Trait"
    ]
  },
  {
    "id": "special-heavy-augmentations",
    "name": "Heavy Augmentations",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Augmented, Stamina 2",
    "prerequisite_text": "Augmented, Stamina 2",
    "modifiers": [],
    "description": "The character has replaced significant portions of their body with industrial or military-grade hardware. These modifications are often bulky, obvious, and not designed for social integration.",
    "mechanic": "You may install **Heavy** class Augmentations (which often have higher DR or Strength bonuses but may impose social penalties). You gain an additional **6 CP** worth of Augmentations.",
    "rules": "Prerequisite: Augmented, Stamina 2.",
    "special_rules": "Prerequisite: Augmented, Stamina 2.",
    "body": "# Heavy Augmentations\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Augmented, Stamina 2\n\n## Description\nThe character has replaced significant portions of their body with industrial or military-grade hardware. These modifications are often bulky, obvious, and not designed for social integration.\n\n## Mechanics & Benefit\nYou may install **Heavy** class Augmentations (which often have higher DR or Strength bonuses but may impose social penalties). You gain an additional **6 CP** worth of Augmentations.",
    "full_text": "# Heavy Augmentations\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Augmented, Stamina 2\n\n## Description\nThe character has replaced significant portions of their body with industrial or military-grade hardware. These modifications are often bulky, obvious, and not designed for social integration.\n\n## Mechanics & Benefit\nYou may install **Heavy** class Augmentations (which often have higher DR or Strength bonuses but may impose social penalties). You gain an additional **6 CP** worth of Augmentations.",
    "mechanics": "You may install **Heavy** class Augmentations (which often have higher DR or Strength bonuses but may impose social penalties). You gain an additional **6 CP** worth of Augmentations.",
    "notes": "[Rule] Prerequisite: Augmented, Stamina 2.\n[Prerequisite] Augmented, Stamina 2",
    "notesList": [
      "[Rule] Prerequisite: Augmented, Stamina 2.",
      "[Prerequisite] Augmented, Stamina 2"
    ]
  },
  {
    "id": "special-hobble",
    "name": "Hobble",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Sneak Attack",
    "prerequisite_text": "Sneak Attack",
    "modifiers": [],
    "description": "A hamstringing strike to the legs or motive systems.",
    "mechanic": "When you deal Sneak Attack damage, the target's **Movement Speed is reduced by 50%**. A second successful Hobble immobilizes them.",
    "rules": "Prerequisite: Sneak Attack.",
    "special_rules": "Prerequisite: Sneak Attack.",
    "body": "# Hobble\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nA hamstringing strike to the legs or motive systems.\n\n## Mechanics & Benefit\nWhen you deal Sneak Attack damage, the target's **Movement Speed is reduced by 50%**. A second successful Hobble immobilizes them.",
    "full_text": "# Hobble\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Sneak Attack\n\n## Description\nA hamstringing strike to the legs or motive systems.\n\n## Mechanics & Benefit\nWhen you deal Sneak Attack damage, the target's **Movement Speed is reduced by 50%**. A second successful Hobble immobilizes them.",
    "mechanics": "When you deal Sneak Attack damage, the target's **Movement Speed is reduced by 50%**. A second successful Hobble immobilizes them.",
    "notes": "[Rule] Prerequisite: Sneak Attack.\n[Prerequisite] Sneak Attack",
    "notesList": [
      "[Rule] Prerequisite: Sneak Attack.",
      "[Prerequisite] Sneak Attack"
    ]
  },
  {
    "id": "special-life-support",
    "name": "Life Support",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character can survive in environments hostile to their biology.",
    "mechanic": "You can breathe and function comfortably in a specific non-native environment.  \n* **Options:** *Aquatic* (Breathe water), *Atmospheric* (Breathe exotic gas mixes), *Vacuum* (Can survive in void for limited time/hold breath 10x longer).",
    "rules": "Multiple selections allowed.",
    "special_rules": "Multiple selections allowed.",
    "body": "# Life Support\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character can survive in environments hostile to their biology.\n\n## Mechanics & Benefit\nYou can breathe and function comfortably in a specific non-native environment.  \n* **Options:** *Aquatic* (Breathe water), *Atmospheric* (Breathe exotic gas mixes), *Vacuum* (Can survive in void for limited time/hold breath 10x longer).",
    "full_text": "# Life Support\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character can survive in environments hostile to their biology.\n\n## Mechanics & Benefit\nYou can breathe and function comfortably in a specific non-native environment.  \n* **Options:** *Aquatic* (Breathe water), *Atmospheric* (Breathe exotic gas mixes), *Vacuum* (Can survive in void for limited time/hold breath 10x longer).",
    "mechanics": "You can breathe and function comfortably in a specific non-native environment.  \n* **Options:** *Aquatic* (Breathe water), *Atmospheric* (Breathe exotic gas mixes), *Vacuum* (Can survive in void for limited time/hold breath 10x longer).",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Multiple selections allowed.",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Multiple selections allowed."
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "single",
      "options": [
        "Aquatic (Breathe underwater, resist hydrostatic pressure up to 50 atm)",
        "Atmospheric (Breathe methane, ammonia, CO2, and toxic atmospheric mixes)",
        "Vacuum Sustenance (Sustain life in hard vacuum for up to 10 minutes)",
        "Low-Oxygen / Hypobaric (Function unimpeded in razor-thin alpine atmospheres)",
        "Bio-Filter / Contagion Seal (Lungs/spiracles filter all airborne pathogens and spores)"
      ]
    }
  },
  {
    "id": "special-low-light-vision",
    "name": "Low Light Vision",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character's eyes magnify ambient light.",
    "mechanic": "You can see in dim light (starlight, moonlight) as clearly as if it were bright daylight. You interpret color normally. You still cannot see in absolute darkness.",
    "rules": "",
    "special_rules": "",
    "body": "# Low Light Vision\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character's eyes magnify ambient light.\n\n## Mechanics & Benefit\nYou can see in dim light (starlight, moonlight) as clearly as if it were bright daylight. You interpret color normally. You still cannot see in absolute darkness.",
    "full_text": "# Low Light Vision\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character's eyes magnify ambient light.\n\n## Mechanics & Benefit\nYou can see in dim light (starlight, moonlight) as clearly as if it were bright daylight. You interpret color normally. You still cannot see in absolute darkness.",
    "mechanics": "You can see in dim light (starlight, moonlight) as clearly as if it were bright daylight. You interpret color normally. You still cannot see in absolute darkness.",
    "notes": "",
    "notesList": []
  },
  {
    "id": "special-mind-link",
    "name": "Mind Link",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Familiar or Bonded",
    "prerequisite_text": "Familiar or Bonded",
    "modifiers": [
      {
        "target": "Character Points",
        "type": "skill",
        "value": 10,
        "mode": "inherent",
        "description": "+10 to Character Points"
      }
    ],
    "description": "The bond deepens into a direct mental highway.",
    "mechanic": "Your Companion gains **\\+10 Character Points**. You possess a full **Telepathic Link** with the companion. You may share Knowledge Skills; if one knows a fact or language, the other can access it instantly.",
    "rules": "Prerequisite: Familiar or Bonded.",
    "special_rules": "Prerequisite: Familiar or Bonded.",
    "body": "# Mind Link\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Familiar or Bonded\n\n## Description\nThe bond deepens into a direct mental highway.\n\n## Mechanics & Benefit\nYour Companion gains **\\+10 Character Points**. You possess a full **Telepathic Link** with the companion. You may share Knowledge Skills; if one knows a fact or language, the other can access it instantly.",
    "full_text": "# Mind Link\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Familiar or Bonded\n\n## Description\nThe bond deepens into a direct mental highway.\n\n## Mechanics & Benefit\nYour Companion gains **\\+10 Character Points**. You possess a full **Telepathic Link** with the companion. You may share Knowledge Skills; if one knows a fact or language, the other can access it instantly.",
    "mechanics": "Your Companion gains **\\+10 Character Points**. You possess a full **Telepathic Link** with the companion. You may share Knowledge Skills; if one knows a fact or language, the other can access it instantly.",
    "notes": "[Modifier] +10 to Character Points\n[Rule] Prerequisite: Familiar or Bonded.\n[Prerequisite] Familiar or Bonded",
    "notesList": [
      "[Modifier] +10 to Character Points",
      "[Rule] Prerequisite: Familiar or Bonded.",
      "[Prerequisite] Familiar or Bonded"
    ]
  },
  {
    "id": "special-natural-weapons",
    "name": "Natural Weapons",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "The character possesses claws, fangs, horns, or a tail striker.",
    "mechanic": "You are always armed. Your Unarmed Strikes deal Lethal damage and the damage die is increased.  \n  * *Small/Medium:* 1d4 or 1d6 damage.  \n  * *Large:* 1d8 damage.",
    "rules": "\\[Ranked\\] Can be taken to increase the damage die size.",
    "special_rules": "\\[Ranked\\] Can be taken to increase the damage die size.",
    "body": "# Natural Weapons\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses claws, fangs, horns, or a tail striker.\n\n## Mechanics & Benefit\nYou are always armed. Your Unarmed Strikes deal Lethal damage and the damage die is increased.  \n  * *Small/Medium:* 1d4 or 1d6 damage.  \n  * *Large:* 1d8 damage.\n\n## Special Rules\n\\[Ranked\\] Can be taken to increase the damage die size.",
    "full_text": "# Natural Weapons\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character possesses claws, fangs, horns, or a tail striker.\n\n## Mechanics & Benefit\nYou are always armed. Your Unarmed Strikes deal Lethal damage and the damage die is increased.  \n  * *Small/Medium:* 1d4 or 1d6 damage.  \n  * *Large:* 1d8 damage.\n\n## Special Rules\n\\[Ranked\\] Can be taken to increase the damage die size.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [],
    "description": "Through physiological adaptation, neural dampening, or synthetic resilience, the character does not register subdual trauma, stun effects, or pain-based incapacitation.",
    "mechanic": "You are completely immune to **Non-Lethal Damage**. Attacks or hazards that deal exclusively Non-Lethal or Stun damage inflict 0 damage to you (though secondary physical or environmental effects still apply normally).",
    "rules": "",
    "special_rules": "",
    "body": "# Non-Lethal Immunity\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThrough physiological adaptation, neural dampening, or synthetic resilience, the character does not register subdual trauma, stun effects, or pain-based incapacitation.\n\n## Mechanics & Benefit\nYou are completely immune to **Non-Lethal Damage**. Attacks or hazards that deal exclusively Non-Lethal or Stun damage inflict 0 damage to you (though secondary physical or environmental effects still apply normally).",
    "full_text": "# Non-Lethal Immunity\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThrough physiological adaptation, neural dampening, or synthetic resilience, the character does not register subdual trauma, stun effects, or pain-based incapacitation.\n\n## Mechanics & Benefit\nYou are completely immune to **Non-Lethal Damage**. Attacks or hazards that deal exclusively Non-Lethal or Stun damage inflict 0 damage to you (though secondary physical or environmental effects still apply normally).",
    "mechanics": "You are completely immune to **Non-Lethal Damage**. Attacks or hazards that deal exclusively Non-Lethal or Stun damage inflict 0 damage to you (though secondary physical or environmental effects still apply normally).",
    "notes": "",
    "notesList": []
  },
  {
    "id": "special-rage",
    "name": "Rage",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "None",
    "prerequisite_text": "None",
    "modifiers": [
      {
        "target": "Will",
        "type": "save",
        "value": 2,
        "mode": "inherent",
        "description": "+2 on Will Checks"
      },
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
    "rules": "Ranked selection.",
    "special_rules": "Ranked selection.",
    "body": "# Rage\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character can tap into a primal fury, ignoring safety for raw power.\n\n## Mechanics & Benefit\nAs a Free Action, enter a Rage.  \n  * **Gain:** \\+2 Strength, \\+2 Stamina (and temporary Health), \\+2 Will.  \n  * **Suffer:** \\-2 Defense. You cannot use skills requiring patience or concentration (most Mental/Tech skills).  \n  * **Duration:** Rounds equal to 4 \\+ New Stamina Mod. Ends in fatigue.",
    "full_text": "# Rage\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: None\n\n## Description\nThe character can tap into a primal fury, ignoring safety for raw power.\n\n## Mechanics & Benefit\nAs a Free Action, enter a Rage.  \n  * **Gain:** \\+2 Strength, \\+2 Stamina (and temporary Health), \\+2 Will.  \n  * **Suffer:** \\-2 Defense. You cannot use skills requiring patience or concentration (most Mental/Tech skills).  \n  * **Duration:** Rounds equal to 4 \\+ New Stamina Mod. Ends in fatigue.",
    "mechanics": "As a Free Action, enter a Rage.  \n  * **Gain:** \\+2 Strength, \\+2 Stamina (and temporary Health), \\+2 Will.  \n  * **Suffer:** \\-2 Defense. You cannot use skills requiring patience or concentration (most Mental/Tech skills).  \n  * **Duration:** Rounds equal to 4 \\+ New Stamina Mod. Ends in fatigue.",
    "notes": "[Modifier] +2 on Will Checks\n[Penalty] -2 Defense\n[Rule] Ranked: Bonus stacks with additional purchases\n[Rule] Ranked selection.",
    "notesList": [
      "[Modifier] +2 on Will Checks",
      "[Penalty] -2 Defense",
      "[Rule] Ranked: Bonus stacks with additional purchases",
      "[Rule] Ranked selection."
    ]
  },
  {
    "id": "special-resistance",
    "name": "Resistance",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Stamina 1",
    "prerequisite_text": "Stamina 1",
    "modifiers": [],
    "description": "The character has a fortified immune system or supernatural resilience.",
    "mechanic": "Gain a **\\+2 Bonus** to saves against a specific hazard category: **Disease**, **Poison**, **Radiation**, or **Magic**.",
    "rules": "\\[Multiple\\] Can be taken for different hazards.",
    "special_rules": "\\[Multiple\\] Can be taken for different hazards.",
    "body": "# Resistance\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThe character has a fortified immune system or supernatural resilience.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to saves against a specific hazard category: **Disease**, **Poison**, **Radiation**, or **Magic**.\n\n## Special Rules\n\\[Multiple\\] Can be taken for different hazards.",
    "full_text": "# Resistance\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Stamina 1\n\n## Description\nThe character has a fortified immune system or supernatural resilience.\n\n## Mechanics & Benefit\nGain a **\\+2 Bonus** to saves against a specific hazard category: **Disease**, **Poison**, **Radiation**, or **Magic**.\n\n## Special Rules\n\\[Multiple\\] Can be taken for different hazards.",
    "mechanics": "Gain a **\\+2 Bonus** to saves against a specific hazard category: **Disease**, **Poison**, **Radiation**, or **Magic**.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] \\[Multiple\\] Can be taken for different hazards.\n[Prerequisite] Stamina 1",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] \\[Multiple\\] Can be taken for different hazards.",
      "[Prerequisite] Stamina 1"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "single",
      "options": [
        "Disease (Biological pathogens, plagues, cellular rot)",
        "Poison (Venoms, neurotoxins, synthetic chemical agents)",
        "Radiation (Ionizing fallout, stellar radiation, nuclear wash)",
        "Magic / Metaphysical Hazards (Aetheric backlash, psychic fallout, cursed zones)"
      ]
    }
  },
  {
    "id": "special-scent",
    "name": "Scent",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Wisdom 1",
    "prerequisite_text": "Wisdom 1",
    "modifiers": [],
    "description": "The character can detect creatures and objects by smell alone.",
    "mechanic": "You can detect opponents within 30 feet by sense of smell. You can track creatures using **Survival** based on scent trails.",
    "rules": "Prerequisite: Wisdom 1.",
    "special_rules": "Prerequisite: Wisdom 1.",
    "body": "# Scent\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character can detect creatures and objects by smell alone.\n\n## Mechanics & Benefit\nYou can detect opponents within 30 feet by sense of smell. You can track creatures using **Survival** based on scent trails.",
    "full_text": "# Scent\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Wisdom 1\n\n## Description\nThe character can detect creatures and objects by smell alone.\n\n## Mechanics & Benefit\nYou can detect opponents within 30 feet by sense of smell. You can track creatures using **Survival** based on scent trails.",
    "mechanics": "You can detect opponents within 30 feet by sense of smell. You can track creatures using **Survival** based on scent trails.",
    "notes": "[Rule] Prerequisite: Wisdom 1.\n[Prerequisite] Wisdom 1",
    "notesList": [
      "[Rule] Prerequisite: Wisdom 1.",
      "[Prerequisite] Wisdom 1"
    ]
  },
  {
    "id": "special-self-sustaining",
    "name": "Self-Sustaining",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Synthetic, Plant, or Undead traits",
    "prerequisite_text": "Synthetic, Plant, or Undead traits",
    "modifiers": [],
    "description": "The character does not require standard biological fuel.",
    "mechanic": "You do not need to eat or drink. You may rely on solar power, a battery recharge, or magical energy, but you are immune to starvation and dehydration mechanics.",
    "rules": "Prerequisite: Synthetic, Plant, or Undead traits.",
    "special_rules": "Prerequisite: Synthetic, Plant, or Undead traits.",
    "body": "# Self-Sustaining\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Synthetic, Plant, or Undead traits\n\n## Description\nThe character does not require standard biological fuel.\n\n## Mechanics & Benefit\nYou do not need to eat or drink. You may rely on solar power, a battery recharge, or magical energy, but you are immune to starvation and dehydration mechanics.",
    "full_text": "# Self-Sustaining\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Synthetic, Plant, or Undead traits\n\n## Description\nThe character does not require standard biological fuel.\n\n## Mechanics & Benefit\nYou do not need to eat or drink. You may rely on solar power, a battery recharge, or magical energy, but you are immune to starvation and dehydration mechanics.",
    "mechanics": "You do not need to eat or drink. You may rely on solar power, a battery recharge, or magical energy, but you are immune to starvation and dehydration mechanics.",
    "notes": "[Rule] Prerequisite: Synthetic, Plant, or Undead traits.\n[Prerequisite] Synthetic, Plant, or Undead traits",
    "notesList": [
      "[Rule] Prerequisite: Synthetic, Plant, or Undead traits.",
      "[Prerequisite] Synthetic, Plant, or Undead traits"
    ]
  },
  {
    "id": "special-sense",
    "name": "Sense",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Awakened or Species Trait",
    "prerequisite_text": "Awakened or Species Trait",
    "modifiers": [],
    "description": "The character can sense a specific type of energy or presence.",
    "mechanic": "You can detect a specific aura (Evil, Magic, Life, Tech, Heat) within a **20 ft Radius** or a **40 ft Cone**. This requires active concentration (Standard Action).",
    "rules": "Multiple selections allowed. Prerequisite: Awakened or Species Trait.",
    "special_rules": "Multiple selections allowed. Prerequisite: Awakened or Species Trait.",
    "body": "# Sense\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awakened or Species Trait\n\n## Description\nThe character can sense a specific type of energy or presence.\n\n## Mechanics & Benefit\nYou can detect a specific aura (Evil, Magic, Life, Tech, Heat) within a **20 ft Radius** or a **40 ft Cone**. This requires active concentration (Standard Action).",
    "full_text": "# Sense\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awakened or Species Trait\n\n## Description\nThe character can sense a specific type of energy or presence.\n\n## Mechanics & Benefit\nYou can detect a specific aura (Evil, Magic, Life, Tech, Heat) within a **20 ft Radius** or a **40 ft Cone**. This requires active concentration (Standard Action).",
    "mechanics": "You can detect a specific aura (Evil, Magic, Life, Tech, Heat) within a **20 ft Radius** or a **40 ft Cone**. This requires active concentration (Standard Action).",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Multiple selections allowed. Prerequisite: Awakened or Species Trait.\n[Prerequisite] Awakened or Species Trait",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Multiple selections allowed. Prerequisite: Awakened or Species Trait.",
      "[Prerequisite] Awakened or Species Trait"
    ]
  },
  {
    "id": "special-sense-uncontrolled",
    "name": "Sense, Uncontrolled",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": true,
    "prerequisites": "Special",
    "prerequisite_text": "Special",
    "modifiers": [],
    "description": "The character is constantly bombarded by sensory input.",
    "mechanic": "As *Sense*, but the range increases to **30 ft Radius / 60 ft Cone**.  \n* **Drawback:** It is always active (\"Always On\"). In areas with overwhelming presence of the sensed type (e.g., sensing Magic in a wizard's tower), the GM may impose distraction penalties.",
    "rules": "Multiple selections allowed. Prerequisite: Special.",
    "special_rules": "Multiple selections allowed. Prerequisite: Special.",
    "body": "# Sense, Uncontrolled\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Special\n\n## Description\nThe character is constantly bombarded by sensory input.\n\n## Mechanics & Benefit\nAs *Sense*, but the range increases to **30 ft Radius / 60 ft Cone**.  \n* **Drawback:** It is always active (\"Always On\"). In areas with overwhelming presence of the sensed type (e.g., sensing Magic in a wizard's tower), the GM may impose distraction penalties.",
    "full_text": "# Sense, Uncontrolled\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Special\n\n## Description\nThe character is constantly bombarded by sensory input.\n\n## Mechanics & Benefit\nAs *Sense*, but the range increases to **30 ft Radius / 60 ft Cone**.  \n* **Drawback:** It is always active (\"Always On\"). In areas with overwhelming presence of the sensed type (e.g., sensing Magic in a wizard's tower), the GM may impose distraction penalties.",
    "mechanics": "As *Sense*, but the range increases to **30 ft Radius / 60 ft Cone**.  \n* **Drawback:** It is always active (\"Always On\"). In areas with overwhelming presence of the sensed type (e.g., sensing Magic in a wizard's tower), the GM may impose distraction penalties.",
    "notes": "[Rule] Multiple: May be purchased separately for different categories/types\n[Rule] Multiple selections allowed. Prerequisite: Special.\n[Prerequisite] Special",
    "notesList": [
      "[Rule] Multiple: May be purchased separately for different categories/types",
      "[Rule] Multiple selections allowed. Prerequisite: Special.",
      "[Prerequisite] Special"
    ]
  },
  {
    "id": "special-shared-senses",
    "name": "Shared Senses",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Familiar or Bonded",
    "prerequisite_text": "Familiar or Bonded",
    "modifiers": [
      {
        "target": "Character Points",
        "type": "skill",
        "value": 10,
        "mode": "inherent",
        "description": "+10 to Character Points"
      }
    ],
    "description": "The character can project their consciousness into their bond-mate.",
    "mechanic": "Your Companion gains **\\+10 Character Points**. As a Standard Action, you can shift your sensory input to perceive through your companion's eyes/ears/senses. While doing so, your own body is blind/deaf.",
    "rules": "Prerequisite: Familiar or Bonded.",
    "special_rules": "Prerequisite: Familiar or Bonded.",
    "body": "# Shared Senses\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Familiar or Bonded\n\n## Description\nThe character can project their consciousness into their bond-mate.\n\n## Mechanics & Benefit\nYour Companion gains **\\+10 Character Points**. As a Standard Action, you can shift your sensory input to perceive through your companion's eyes/ears/senses. While doing so, your own body is blind/deaf.",
    "full_text": "# Shared Senses\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Familiar or Bonded\n\n## Description\nThe character can project their consciousness into their bond-mate.\n\n## Mechanics & Benefit\nYour Companion gains **\\+10 Character Points**. As a Standard Action, you can shift your sensory input to perceive through your companion's eyes/ears/senses. While doing so, your own body is blind/deaf.",
    "mechanics": "Your Companion gains **\\+10 Character Points**. As a Standard Action, you can shift your sensory input to perceive through your companion's eyes/ears/senses. While doing so, your own body is blind/deaf.",
    "notes": "[Modifier] +10 to Character Points\n[Rule] Prerequisite: Familiar or Bonded.\n[Prerequisite] Familiar or Bonded",
    "notesList": [
      "[Modifier] +10 to Character Points",
      "[Rule] Prerequisite: Familiar or Bonded.",
      "[Prerequisite] Familiar or Bonded"
    ]
  },
  {
    "id": "special-sleepless",
    "name": "Sleepless",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Synthetic, Elf, or Special",
    "prerequisite_text": "Synthetic, Elf, or Special",
    "modifiers": [],
    "description": "The character does not require sleep cycles (though they may need downtime for system diagnostics or meditation).",
    "mechanic": "You are **Immune** to magical sleep effects. You do not need 8 hours of sleep; you remain conscious during rest periods, though you must still engage in light activity to gain the benefits of a Long Rest.",
    "rules": "Prerequisite: Synthetic, Elf, or Special.",
    "special_rules": "Prerequisite: Synthetic, Elf, or Special.",
    "body": "# Sleepless\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Synthetic, Elf, or Special\n\n## Description\nThe character does not require sleep cycles (though they may need downtime for system diagnostics or meditation).\n\n## Mechanics & Benefit\nYou are **Immune** to magical sleep effects. You do not need 8 hours of sleep; you remain conscious during rest periods, though you must still engage in light activity to gain the benefits of a Long Rest.",
    "full_text": "# Sleepless\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Synthetic, Elf, or Special\n\n## Description\nThe character does not require sleep cycles (though they may need downtime for system diagnostics or meditation).\n\n## Mechanics & Benefit\nYou are **Immune** to magical sleep effects. You do not need 8 hours of sleep; you remain conscious during rest periods, though you must still engage in light activity to gain the benefits of a Long Rest.",
    "mechanics": "You are **Immune** to magical sleep effects. You do not need 8 hours of sleep; you remain conscious during rest periods, though you must still engage in light activity to gain the benefits of a Long Rest.",
    "notes": "[Rule] Prerequisite: Synthetic, Elf, or Special.\n[Prerequisite] Synthetic, Elf, or Special",
    "notesList": [
      "[Rule] Prerequisite: Synthetic, Elf, or Special.",
      "[Prerequisite] Synthetic, Elf, or Special"
    ]
  },
  {
    "id": "special-sneak-attack",
    "name": "Sneak Attack",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_multiple": false,
    "prerequisites": "Agility 2, Stealth 1",
    "prerequisite_text": "Agility 2, Stealth 1",
    "modifiers": [],
    "description": "The character knows exactly where to strike to deal maximum damage to a vulnerable target.",
    "mechanic": "If you attack a target that is **Flat-Footed** or **Flanked**, you deal extra damage.  \n* **Mechanics:** Add your **Intellect Modifier** \\+ **1d6 extra damage** to the roll.",
    "rules": "\\[Ranked\\] Each additional rank adds \\+1d6 to the damage.",
    "special_rules": "\\[Ranked\\] Each additional rank adds \\+1d6 to the damage.",
    "body": "# Sneak Attack\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2, Stealth 1\n\n## Description\nThe character knows exactly where to strike to deal maximum damage to a vulnerable target.\n\n## Mechanics & Benefit\nIf you attack a target that is **Flat-Footed** or **Flanked**, you deal extra damage.  \n* **Mechanics:** Add your **Intellect Modifier** \\+ **1d6 extra damage** to the roll.\n\n## Special Rules\n\\[Ranked\\] Each additional rank adds \\+1d6 to the damage.",
    "full_text": "# Sneak Attack\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Agility 2, Stealth 1\n\n## Description\nThe character knows exactly where to strike to deal maximum damage to a vulnerable target.\n\n## Mechanics & Benefit\nIf you attack a target that is **Flat-Footed** or **Flanked**, you deal extra damage.  \n* **Mechanics:** Add your **Intellect Modifier** \\+ **1d6 extra damage** to the roll.\n\n## Special Rules\n\\[Ranked\\] Each additional rank adds \\+1d6 to the damage.",
    "mechanics": "If you attack a target that is **Flat-Footed** or **Flanked**, you deal extra damage.  \n* **Mechanics:** Add your **Intellect Modifier** \\+ **1d6 extra damage** to the roll.",
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
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Intellect 3, Technology (Knowledge) 11",
    "prerequisite_text": "Intellect 3, Technology (Knowledge) 11",
    "modifiers": [],
    "description": "The character is ahead of the curve, understanding technology that shouldn't exist yet. For a character to advance in their (TL Tech Level) they will require different fields of advanced study, the feature will need to be selected multiple times for various fields (minimum of five).",
    "mechanic": "You treat your effective **Tech Level** as one step higher for the purposes of crafting, repairing, or understanding advanced artifacts in a specific field of study.  \n  * Agriculture  \n  * Architecture  \n  * Biotechnology  \n  * Commerce  \n  * Communication  \n  * Devices  \n  * Education  \n  * Energy  \n  * Manufacturing  \n  * Materials  \n  * Medicine  \n  * Meta Sciences  \n  * Science  \n  * Society  \n  * Synthetic Intelligence  \n  * Transportation  \n  * Weaponry",
    "rules": "Prerequisite: Intellect 3, Technology (Knowledge) 11.",
    "special_rules": "Prerequisite: Intellect 3, Technology (Knowledge) 11.",
    "body": "# Technologist\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 3, Technology (Knowledge) 11\n\n## Description\nThe character is ahead of the curve, understanding technology that shouldn't exist yet. For a character to advance in their (TL Tech Level) they will require different fields of advanced study, the feature will need to be selected multiple times for various fields (minimum of five).\n\n## Mechanics & Benefit\nYou treat your effective **Tech Level** as one step higher for the purposes of crafting, repairing, or understanding advanced artifacts in a specific field of study.  \n  * Agriculture  \n  * Architecture  \n  * Biotechnology  \n  * Commerce  \n  * Communication  \n  * Devices  \n  * Education  \n  * Energy  \n  * Manufacturing  \n  * Materials  \n  * Medicine  \n  * Meta Sciences  \n  * Science  \n  * Society  \n  * Synthetic Intelligence  \n  * Transportation  \n  * Weaponry",
    "full_text": "# Technologist\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Intellect 3, Technology (Knowledge) 11\n\n## Description\nThe character is ahead of the curve, understanding technology that shouldn't exist yet. For a character to advance in their (TL Tech Level) they will require different fields of advanced study, the feature will need to be selected multiple times for various fields (minimum of five).\n\n## Mechanics & Benefit\nYou treat your effective **Tech Level** as one step higher for the purposes of crafting, repairing, or understanding advanced artifacts in a specific field of study.  \n  * Agriculture  \n  * Architecture  \n  * Biotechnology  \n  * Commerce  \n  * Communication  \n  * Devices  \n  * Education  \n  * Energy  \n  * Manufacturing  \n  * Materials  \n  * Medicine  \n  * Meta Sciences  \n  * Science  \n  * Society  \n  * Synthetic Intelligence  \n  * Transportation  \n  * Weaponry",
    "mechanics": "You treat your effective **Tech Level** as one step higher for the purposes of crafting, repairing, or understanding advanced artifacts in a specific field of study.  \n  * Agriculture  \n  * Architecture  \n  * Biotechnology  \n  * Commerce  \n  * Communication  \n  * Devices  \n  * Education  \n  * Energy  \n  * Manufacturing  \n  * Materials  \n  * Medicine  \n  * Meta Sciences  \n  * Science  \n  * Society  \n  * Synthetic Intelligence  \n  * Transportation  \n  * Weaponry",
    "notes": "[Rule] Prerequisite: Intellect 3, Technology (Knowledge) 11.\n[Prerequisite] Intellect 3, Technology (Knowledge) 11",
    "notesList": [
      "[Rule] Prerequisite: Intellect 3, Technology (Knowledge) 11.",
      "[Prerequisite] Intellect 3, Technology (Knowledge) 11"
    ],
    "modifier_options": {
      "enabled": true,
      "mode": "single",
      "group_label": "Field of Study",
      "options": [
        {
          "id": "tl-agri",
          "label": "Agriculture"
        },
        {
          "id": "tl-arch",
          "label": "Architecture"
        },
        {
          "id": "tl-biotech",
          "label": "Biotechnology"
        },
        {
          "id": "tl-commerce",
          "label": "Commerce"
        },
        {
          "id": "tl-comm",
          "label": "Communication"
        },
        {
          "id": "tl-devices",
          "label": "Devices"
        },
        {
          "id": "tl-edu",
          "label": "Education"
        },
        {
          "id": "tl-energy",
          "label": "Energy"
        },
        {
          "id": "tl-mfg",
          "label": "Manufacturing"
        },
        {
          "id": "tl-materials",
          "label": "Materials"
        },
        {
          "id": "tl-med",
          "label": "Medicine"
        },
        {
          "id": "tl-metasci",
          "label": "Meta Sciences"
        },
        {
          "id": "tl-sci",
          "label": "Science"
        },
        {
          "id": "tl-society",
          "label": "Society"
        },
        {
          "id": "tl-ai",
          "label": "Synthetic Intelligence"
        },
        {
          "id": "tl-trans",
          "label": "Transportation"
        },
        {
          "id": "tl-weapons",
          "label": "Weaponry"
        }
      ]
    }
  },
  {
    "id": "special-telepathy",
    "name": "Telepathy",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Awakened (Mental) or Species Trait",
    "prerequisite_text": "Awakened (Mental) or Species Trait",
    "modifiers": [],
    "description": "The character can communicate mind-to-mind.",
    "mechanic": "You can communicate mentally with any intelligent lifeform within **Range** (usually 100ft \\+).  \n* **Constraint:** You must be aware of the subject. If they are unwilling, you cannot force communication without using Discipline powers. Language barriers still apply unless you have the *Universal Translator* power.",
    "rules": "Prerequisite: Awakened (Mental) or Species Trait.",
    "special_rules": "Prerequisite: Awakened (Mental) or Species Trait.",
    "body": "# Telepathy\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awakened (Mental) or Species Trait\n\n## Description\nThe character can communicate mind-to-mind.\n\n## Mechanics & Benefit\nYou can communicate mentally with any intelligent lifeform within **Range** (usually 100ft \\+).  \n* **Constraint:** You must be aware of the subject. If they are unwilling, you cannot force communication without using Discipline powers. Language barriers still apply unless you have the *Universal Translator* power.",
    "full_text": "# Telepathy\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Awakened (Mental) or Species Trait\n\n## Description\nThe character can communicate mind-to-mind.\n\n## Mechanics & Benefit\nYou can communicate mentally with any intelligent lifeform within **Range** (usually 100ft \\+).  \n* **Constraint:** You must be aware of the subject. If they are unwilling, you cannot force communication without using Discipline powers. Language barriers still apply unless you have the *Universal Translator* power.",
    "mechanics": "You can communicate mentally with any intelligent lifeform within **Range** (usually 100ft \\+).  \n* **Constraint:** You must be aware of the subject. If they are unwilling, you cannot force communication without using Discipline powers. Language barriers still apply unless you have the *Universal Translator* power.",
    "notes": "[Rule] Prerequisite: Awakened (Mental) or Species Trait.\n[Prerequisite] Awakened (Mental) or Species Trait",
    "notesList": [
      "[Rule] Prerequisite: Awakened (Mental) or Species Trait.",
      "[Prerequisite] Awakened (Mental) or Species Trait"
    ]
  },
  {
    "id": "special-uncanny-sense",
    "name": "Uncanny Sense",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Acute Sense (in the corresponding sense)",
    "prerequisite_text": "Acute Sense (in the corresponding sense)",
    "modifiers": [
      {
        "target": "mental-general-alertness",
        "type": "check_advantage",
        "value": 1,
        "mode": "conditional",
        "isSituational": true,
        "condition": "Checks relying on chosen acute sense",
        "description": "Advantage on Awareness checks relying on chosen sense (Roll 3d10, take best 2)"
      }
    ],
    "description": "The character’s senses are so sharp they verge on precognition. It is nearly impossible to hide from them.",
    "mechanic": "You roll all **Awareness Checks** using the chosen sense with **Advantage**.",
    "rules": "Prerequisite: Acute Sense (in the corresponding sense).",
    "special_rules": "Prerequisite: Acute Sense (in the corresponding sense).",
    "body": "# Uncanny Sense\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Acute Sense (in the corresponding sense)\n\n## Description\nThe character’s senses are so sharp they verge on precognition. It is nearly impossible to hide from them.\n\n## Mechanics & Benefit\nYou roll all **Awareness Checks** using the chosen sense with **Advantage**.",
    "full_text": "# Uncanny Sense\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Acute Sense (in the corresponding sense)\n\n## Description\nThe character’s senses are so sharp they verge on precognition. It is nearly impossible to hide from them.\n\n## Mechanics & Benefit\nYou roll all **Awareness Checks** using the chosen sense with **Advantage**.",
    "mechanics": "You roll all **Awareness Checks** using the chosen sense with **Advantage**.",
    "notes": "[Modifier] Advantage on Awareness checks relying on chosen sense (Roll 3d10, take best 2)\n[Rule] Prerequisite: Acute Sense (in the corresponding sense).\n[Prerequisite] Acute Sense (in the corresponding sense)",
    "notesList": [
      "[Modifier] Advantage on Awareness checks relying on chosen sense (Roll 3d10, take best 2)",
      "[Rule] Prerequisite: Acute Sense (in the corresponding sense).",
      "[Prerequisite] Acute Sense (in the corresponding sense)"
    ]
  },
  {
    "id": "special-wild-speech",
    "name": "Wild Speech",
    "category": "Special",
    "type": "special",
    "cp": 3,
    "bp": 3,
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
    "is_ranked": false,
    "is_multiple": false,
    "prerequisites": "Nature Affinity, Fey, or Druidic training",
    "prerequisite_text": "Nature Affinity, Fey, or Druidic training",
    "modifiers": [],
    "description": "The character can speak with the beasts of the wild.",
    "mechanic": "You can communicate with animals (Beast type) as if you shared a language. You can use **Social Skills** (Diplomacy, Bluff, Intimidate) on animals with no penalty.\n\n&nbsp;\n\n&nbsp;",
    "rules": "Prerequisite: Nature Affinity, Fey, or Druidic training.",
    "special_rules": "Prerequisite: Nature Affinity, Fey, or Druidic training.",
    "body": "# Wild Speech\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Nature Affinity, Fey, or Druidic training\n\n## Description\nThe character can speak with the beasts of the wild.\n\n## Mechanics & Benefit\nYou can communicate with animals (Beast type) as if you shared a language. You can use **Social Skills** (Diplomacy, Bluff, Intimidate) on animals with no penalty.\n\n&nbsp;\n\n&nbsp;",
    "full_text": "# Wild Speech\n\n**Category**: Special Features  \n**Cost**: 3 CP (2 CP if Suggested Feature, minimum 1 CP)  \n**Prerequisite**: Nature Affinity, Fey, or Druidic training\n\n## Description\nThe character can speak with the beasts of the wild.\n\n## Mechanics & Benefit\nYou can communicate with animals (Beast type) as if you shared a language. You can use **Social Skills** (Diplomacy, Bluff, Intimidate) on animals with no penalty.\n\n&nbsp;\n\n&nbsp;",
    "mechanics": "You can communicate with animals (Beast type) as if you shared a language. You can use **Social Skills** (Diplomacy, Bluff, Intimidate) on animals with no penalty.\n\n&nbsp;\n\n&nbsp;",
    "notes": "[Rule] Prerequisite: Nature Affinity, Fey, or Druidic training.\n[Prerequisite] Nature Affinity, Fey, or Druidic training",
    "notesList": [
      "[Rule] Prerequisite: Nature Affinity, Fey, or Druidic training.",
      "[Prerequisite] Nature Affinity, Fey, or Druidic training"
    ]
  }
];

export const getFeatureById = (id) => DEFAULT_FEATURES.find(f => f.id === id);

export const getFeaturesByCategory = (category) => 
  DEFAULT_FEATURES.filter(f => (f.category || '').toLowerCase() === (category || '').toLowerCase());

/**
 * Enriches a feature object with all canonical metadata (category, type, CP,
 * description, mechanic, rules, prerequisites, modifiers, keywords, TL, ML)
 * for Codex Matrix editing, Folio sheet rendering, or Omnicortex DBM inspection.
 */
export const getEnrichedFeatureData = (rawInput) => {
  if (!rawInput) return null;
  const feature = typeof rawInput === 'object' ? rawInput : { name: String(rawInput) };
  const isGenId = (s) => /\d{10,}(?:[-_\s]+[a-z0-9]{2,10})?/i.test(String(s || ''));
  const normKey = (s) => String(s || '')
    .trim()
    .toLowerCase()
    .replace(/^(?:feature|trait|ability|combat|discipline|general|karma|skill|special)[-_]/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const rawId = !isGenId(feature.id) ? (feature.id || '').toString().trim() : '';
  const cleanId = rawId.replace(/^(feature|trait)-/i, '').toLowerCase();
  const rawName = !isGenId(feature.name || feature.title) ? (feature.name || feature.title || '').toString().trim() : '';
  const normId = normKey(rawId);
  const normName = normKey(rawName);

  const canonical = DEFAULT_FEATURES.find(f => {
    const fId = (f.id || '').toString().trim().toLowerCase();
    const fCleanId = fId.replace(/^(feature|trait)-/i, '');
    const fName = (f.name || f.title || '').toString().trim().toLowerCase();
    const fNormId = normKey(fId);
    const fNormName = normKey(fName);
    return (rawId && (fId === rawId.toLowerCase() || fName === rawId.toLowerCase())) ||
           (cleanId && fCleanId === cleanId) ||
           (rawName && (fName === rawName.toLowerCase() || fId === rawName.toLowerCase())) ||
           (normId && (fNormId === normId || fNormName === normId)) ||
           (normName && (fNormName === normName || fNormId === normName));
  });

  const isSlugOrGenName = !rawName || /^(?:feature|trait|ability|combat|discipline|general|karma|skill|special)[-_]/i.test(rawName) || isGenId(rawName);
  const name = (!isSlugOrGenName && (!canonical?.name || normKey(rawName) !== normKey(canonical.name)))
    ? rawName
    : (canonical?.name || canonical?.title || (rawName ? rawName.replace(/^(?:feature|trait)[-_]/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Feature'));
  const category = feature.category || canonical?.category || 'General';
  const type = feature.type || canonical?.type || category.toLowerCase();
  const id = (rawId && !isGenId(rawId)) ? rawId : (canonical?.id || feature.id || `feature-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

  const cp = feature.cp !== undefined ? Number(feature.cp) : (canonical?.cp !== undefined ? Number(canonical.cp) : 3);
  const bp = feature.bp !== undefined ? Number(feature.bp) : (canonical?.bp !== undefined ? Number(canonical.bp) : cp);

  const rawDesc = (feature.description || feature.desc || '').toString().trim();
  const isCorruptedDesc = !rawDesc || /\b\d{10,}\b/.test(rawDesc) || /is an innate .* granted by this species lineage/i.test(rawDesc);
  const cleanRawDesc = isCorruptedDesc
    ? ''
    : rawDesc.replace(/\s+#+\s*$/, '').replace(/\s*\*([^*]+)\*\s*$/, '').trim();
  const description = cleanRawDesc || canonical?.description || '';
  const mechanic = feature.mechanic || feature.mechanics || canonical?.mechanic || canonical?.mechanics || '';
  const rules = feature.rules || feature.special_rules || canonical?.rules || canonical?.special_rules || '';
  const prerequisites = feature.prerequisites || feature.prerequisite || canonical?.prerequisites || canonical?.prerequisite || 'None';
  const modifiers = Array.isArray(feature.modifiers) && feature.modifiers.length > 0 
    ? feature.modifiers 
    : (Array.isArray(canonical?.modifiers) ? canonical.modifiers : []);

  const keywords = feature.keywords || canonical?.keywords || `${name.toLowerCase()}, ${category.toLowerCase()}`;
  const negative_keywords = feature.negative_keywords || canonical?.negative_keywords || '';
  const tech_level = feature.tech_level !== undefined ? feature.tech_level : (canonical?.tech_level ?? 0);
  const meta_level = feature.meta_level !== undefined ? feature.meta_level : (canonical?.meta_level ?? 0);

  return {
    ...(canonical || {}),
    ...feature,
    id,
    name,
    category,
    type,
    cp,
    bp,
    costs: {
      cp,
      bp,
      credits: 0,
      nodes: 0,
      sockets: 0,
      strain: 0,
      focus: 0,
      ap: 0,
      ...(canonical?.costs || {}),
      ...(feature.costs || {})
    },
    acquisition_type: feature.acquisition_type || canonical?.acquisition_type || (
      ((feature.multi ?? canonical?.multi) || (feature.is_multiple ?? canonical?.is_multiple)) && 
      ((feature.staged ?? canonical?.staged) || (feature.is_ranked ?? canonical?.is_ranked))
        ? 'Multi/Staged'
        : ((feature.staged ?? canonical?.staged) || (feature.is_ranked ?? canonical?.is_ranked))
        ? 'Staged'
        : ((feature.multi ?? canonical?.multi) || (feature.is_multiple ?? canonical?.is_multiple))
        ? 'Multiple'
        : 'Basic'
    ),
    feature_mode: feature.feature_mode || canonical?.feature_mode || feature.acquisition_type || canonical?.acquisition_type || (
      ((feature.multi ?? canonical?.multi) || (feature.is_multiple ?? canonical?.is_multiple)) && 
      ((feature.staged ?? canonical?.staged) || (feature.is_ranked ?? canonical?.is_ranked))
        ? 'Multi/Staged'
        : ((feature.staged ?? canonical?.staged) || (feature.is_ranked ?? canonical?.is_ranked))
        ? 'Staged'
        : ((feature.multi ?? canonical?.multi) || (feature.is_multiple ?? canonical?.is_multiple))
        ? 'Multiple'
        : 'Basic'
    ),
    is_ranked: feature.is_ranked !== undefined ? Boolean(feature.is_ranked) : (feature.staged !== undefined ? Boolean(feature.staged) : Boolean(canonical?.is_ranked || canonical?.staged)),
    max_rank: feature.max_rank || canonical?.max_rank || ((feature.is_ranked || feature.staged || canonical?.is_ranked || canonical?.staged) ? 5 : undefined),
    is_multiple: feature.is_multiple !== undefined ? Boolean(feature.is_multiple) : (feature.multi !== undefined ? Boolean(feature.multi) : Boolean(canonical?.is_multiple || canonical?.multi)),
    multi: feature.multi !== undefined ? Boolean(feature.multi) : (feature.is_multiple !== undefined ? Boolean(feature.is_multiple) : Boolean(canonical?.multi || canonical?.is_multiple)),
    staged: feature.staged !== undefined ? Boolean(feature.staged) : (feature.is_ranked !== undefined ? Boolean(feature.is_ranked) : Boolean(canonical?.staged || canonical?.is_ranked)),
    prerequisites,
    modifiers,
    modifier_options: feature.modifier_options || canonical?.modifier_options || {
      enabled: false,
      mode: 'single',
      value: 2,
      options: []
    },
    selected_option_id: feature.selected_option_id || canonical?.selected_option_id || '',
    selected_skills: Array.isArray(feature.selected_skills) ? feature.selected_skills : (Array.isArray(canonical?.selected_skills) ? canonical.selected_skills : []),
    description,
    mechanic,
    rules,
    special_rules: rules,
    keywords,
    negative_keywords,
    tech_level,
    meta_level,
    tl: tech_level,
    ml: meta_level,
    notes: feature.notes || canonical?.notes || '',
    notesList: Array.isArray(feature.notesList) ? feature.notesList : (Array.isArray(canonical?.notesList) ? canonical.notesList : [])
  };
};
