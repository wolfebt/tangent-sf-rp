// ═══════════════════════════════════════════════════════════
// CORE ATTRIBUTES & ATTRIBUTE CHECKS (CANONICAL DEFINITIONS)
// ═══════════════════════════════════════════════════════════

export const CORE_ATTRIBUTES = {
  STR: {
    id: 'attr-strength',
    code: 'STR',
    name: 'Strength',
    checkName: 'Might',
    checkId: 'attr-might',
    costPerPoint: 5, // 5 CP per +1 increase
    startingMax: 4,  // Maximum +4 at character creation before species/aug modifiers
    paragonScore: 5, // Upper tier is 5 + species modifier
    averageScore: 0, // Baseline human average
    description: "Strength measures a character's physical power, force, and stability. It is a crucial ability for tasks that involve lifting heavy objects, breaking things, and engaging in melee combat. A character with high Strength can wield heavier weapons, grapple with opponents, and resist attempts to push or knock them down.",
    coreInfluences: [
      'Lifting and Carrying capacity',
      'Breaking Objects (doors, locks, weapons)',
      'Melee Combat damage and grappling/shoving'
    ],
    checkSummary: 'Might Check — tests of raw physical power (lifting heavy gates/boulders, bending prison bars, prying doors, breaking chains and smashing walls).'
  },
  AGI: {
    id: 'attr-agility',
    code: 'AGI',
    name: 'Agility',
    checkName: 'Reflex',
    checkId: 'attr-reflex',
    costPerPoint: 5,
    startingMax: 4,
    paragonScore: 5,
    averageScore: 0,
    description: "Agility measures a character's balance, coordination, and nimbleness. It is a crucial attribute for tasks that involve dodging attacks, performing acrobatic feats, and engaging in ranged combat. A character with high Agility can move swiftly, react quickly to danger, and accurately target opponents with ranged weapons.",
    coreInfluences: [
      'Dodging incoming melee and ranged attacks',
      'Acrobatics (jumping, climbing, balancing, tumbling)',
      'Ranged Combat accuracy, readying weapons, and balance'
    ],
    checkSummary: 'Reflex Check — reacting swiftly and precisely to unexpected events (avoiding AOE attacks/explosions, catching falling/thrown objects, acrobatic feats).'
  },
  STA: {
    id: 'attr-stamina',
    code: 'STA',
    name: 'Stamina',
    checkName: 'Fortitude',
    checkId: 'attr-fortitude',
    costPerPoint: 5,
    startingMax: 4,
    paragonScore: 5,
    averageScore: 0,
    description: "Stamina measures a character's endurance, resistance, and toughness. A character with high Stamina can endure prolonged exertion, tolerate more damaging injuries and resist the effects of fatigue, poison, and other debilitating conditions.",
    coreInfluences: [
      'Enduring Physical Hardship (running, swimming, hunger, thirst, sleep deprivation, extreme temperatures)',
      'Resistances to diseases, infections, and toxins',
      'Base Toughness and Vitality buffer'
    ],
    checkSummary: 'Fortitude Check — enduring physical hardships, biological hazards, toxins, extreme weather, and pushing through exhaustion, fatigue, and pain.'
  },
  INT: {
    id: 'attr-intellect',
    code: 'INT',
    name: 'Intellect',
    checkName: 'Reason',
    checkId: 'attr-reason',
    aliasCheckId: 'attr-logic',
    costPerPoint: 5,
    startingMax: 4,
    paragonScore: 5,
    averageScore: 0,
    description: "Intellect measures a character's reason, logic, and wits. It is a crucial attribute for tasks that involve problem-solving, deduction, and understanding complex information. A character with high Intellect can analyze situations quickly, come up with creative solutions, and excel in fields that require mental acuity.",
    coreInfluences: [
      'Problem-Solving (analyzing problems, identifying patterns, devising solutions)',
      'Deduction (investigations, uncovering hidden truths, predicting actions)',
      'Understanding Complex Information (technical manuals, scientific theories, ancient texts)'
    ],
    checkSummary: 'Reason Check — logical deduction, solving puzzles/riddles, deciphering codes and ancient languages, comprehending dense technical/scientific information.'
  },
  WIS: {
    id: 'attr-wisdom',
    code: 'WIS',
    name: 'Wisdom',
    checkName: 'Willpower',
    checkId: 'attr-willpower',
    aliasCheckId: 'attr-will',
    costPerPoint: 5,
    startingMax: 4,
    paragonScore: 5,
    averageScore: 0,
    description: "Wisdom measures a character's insight, intuition, and determination. It is a crucial attribute for tasks that involve sensing deception, resisting fear, and understanding the motivations of others. A character with high Wisdom can perceive hidden truths, remain calm in the face of danger, and make sound judgments even in difficult situations.",
    coreInfluences: [
      'Sensing Deception (detecting lies, inconsistencies, hidden agendas)',
      'Resisting Fear, panic, and emotional manipulation',
      'Understanding Motivations of others to find common ground and navigate social dynamics'
    ],
    checkSummary: "Willpower Check — mental fortitude, resilience, overcoming fear/panic/despair, resisting psychic mental manipulation/mind control, and maintaining focus under intense pressure."
  },
  CHA: {
    id: 'attr-charisma',
    code: 'CHA',
    name: 'Charisma',
    checkName: 'Etiquette',
    checkId: 'attr-etiquette',
    costPerPoint: 5,
    startingMax: 4,
    paragonScore: 5,
    averageScore: 0,
    description: "Charisma measures a character's confidence, assertiveness, and personal magnetism. It is a crucial attribute for tasks that involve persuasion, leadership, and social interaction. A character with high Charisma can influence and inspire others, negotiate effectively, and excel in roles that require social finesse.",
    coreInfluences: [
      'Persuasion (convincing, negotiating, and influencing others)',
      'Leadership (inspiring troops, boosting morale, commanding respect)',
      'Social Interaction (navigating social situations, making positive impressions, building rapport)'
    ],
    checkSummary: 'Etiquette Check — social finesse, tact, bartering and negotiating treaties/business deals, navigating formal receptions or rowdy taverns, and resolving social conflicts peacefully.'
  }
};

export const CORE_ATTRIBUTES_LIST = Object.values(CORE_ATTRIBUTES);

export const ATTRIBUTE_CHECKS = {
  Might: {
    id: 'attr-might',
    name: 'Might',
    attributeCode: 'STR',
    attributeName: 'Strength',
    attributeId: 'attr-strength',
    costPerPoint: 1, // 1 BP per +1 point to increase separately
    baseFormula: '2 + (Strength × 2)',
    description: 'Tests of raw physical power. Lifting heavy objects, bending bars, prying open doors, breaking chains, smashing walls.',
    example: 'Strength +3 vs metal bar CR 15: Base score 8 (2 + 2×3). Needs 7+ on 2d10.'
  },
  Reflex: {
    id: 'attr-reflex',
    name: 'Reflex',
    attributeCode: 'AGI',
    attributeName: 'Agility',
    attributeId: 'attr-agility',
    costPerPoint: 1,
    baseFormula: '2 + (Agility × 2)',
    description: 'Reacting swiftly and precisely. Dodging area attacks/explosions, catching falling objects, intercepting moving targets, acrobatic feats.',
    example: 'Agility +3 vs explosion CR 15: Base score 8 (2 + 2×3). Needs 7+ on 2d10.'
  },
  Fortitude: {
    id: 'attr-fortitude',
    name: 'Fortitude',
    attributeCode: 'STA',
    attributeName: 'Stamina',
    attributeId: 'attr-stamina',
    costPerPoint: 1,
    baseFormula: '2 + (Stamina × 2)',
    description: 'Enduring hardships and toxins. Resisting poisons, venoms, and diseases; coping with extreme environments; pushing through exhaustion and fatigue.',
    example: 'Stamina +4 vs neurotoxin CR 18: Base score 10 (2 + 2×4). Needs 8+ on 2d10.'
  },
  Reason: {
    id: 'attr-reason',
    aliasId: 'attr-logic',
    name: 'Reason',
    attributeCode: 'INT',
    attributeName: 'Intellect',
    attributeId: 'attr-intellect',
    costPerPoint: 1,
    baseFormula: '2 + (Intellect × 2)',
    description: 'Logical deduction and problem-solving. Cracking riddles, deciphering cryptic codes and languages, comprehending dense technical manuals.',
    example: 'Intellect +4 vs riddle CR 20: Base score 10 (2 + 2×4). Needs 10+ on 2d10.'
  },
  Willpower: {
    id: 'attr-willpower',
    aliasId: 'attr-will',
    name: 'Willpower',
    attributeCode: 'WIS',
    attributeName: 'Wisdom',
    attributeId: 'attr-wisdom',
    costPerPoint: 1,
    baseFormula: '2 + (Wisdom × 2)',
    description: 'Mental fortitude and resilience. Resisting terror/fear, breaking free from mind control or psychic manipulation, maintaining deep focus under stress.',
    example: 'Wisdom +5 vs psychic suggestion CR 15: Base score 12 (2 + 2×5). Needs 3+ on 2d10.'
  },
  Etiquette: {
    id: 'attr-etiquette',
    name: 'Etiquette',
    attributeCode: 'CHA',
    attributeName: 'Charisma',
    attributeId: 'attr-charisma',
    costPerPoint: 1,
    baseFormula: '2 + (Charisma × 2)',
    description: 'Navigating social situations with tact. Haggling and high-stakes negotiation, fitting into high society or underworld gatherings, de-escalating disputes.',
    example: 'Charisma +5 at diplomatic reception CR 15: Base score 12 (2 + 2×5). Needs 3+ on 2d10.'
  }
};

export const ATTRIBUTE_CHECKS_LIST = Object.values(ATTRIBUTE_CHECKS);

export const NON_ATTRIBUTE_FLAW = {
  id: 'feat-non-attribute',
  name: 'Non-Attribute Flaw',
  bpRefund: 25,
  description: 'A character completely lacking a core attribute (e.g. a stationary AI construct lacking STR/AGI or simple automata lacking INT/WIS/CHA). Automatically fails all actions and checks associated with that attribute.',
  examples: [
    'Stationary Intellect Construct lacking Strength and Agility',
    'Simple Automata Mecha running basic scripts lacking Intellect, Wisdom, or Charisma'
  ]
};

export const SKILL_SYNERGY_EXAMPLES = [
  {
    skills: 'Perception and Willpower',
    context: 'Illusion / Deception',
    description: "Keen Perception helps see through trickery, granting a synergy bonus to Willpower Check against mental illusions."
  },
  {
    skills: 'Technology and Fortitude',
    context: 'Technological Hazard',
    description: "Knowledge of Technology allows taking proper precautions against radiation leaks or malfunctioning reactors, granting a synergy bonus to Fortitude Check."
  },
  {
    skills: 'Medicine and Fortitude',
    context: 'Disease and Poison',
    description: "Medical expertise aids Fortitude Check to fight off diseases, biological toxins, and long-term effects of illnesses."
  },
  {
    skills: 'Athletics and Reflex',
    context: 'Sudden Danger / Hazard',
    description: "Athletic conditioning and physical coordination grant a synergy bonus to Reflex Check to avoid traps, collapsing terrain, or incoming area attacks."
  },
  {
    skills: 'Linguistics and Reason',
    context: 'Ancient Inscriptions / Cryptanalysis',
    description: "For every 5 points scored over DC 10 on a Linguistics check, a +1 bonus is added to the Reason check to decipher cryptic texts."
  }
];

export const calculateAttributeCheckBase = (score = 0) => 2 + (Number(score || 0) * 2);
export const calculateAttributeCost = (score = 0) => Number(score || 0) * 5;
export const calculateAttributeCheckCost = (ranks = 0) => Number(ranks || 0) * 1;

// ═══════════════════════════════════════════════════════════
// SUB-ABILITIES: PERCEPTION & DETECTION CHECKS
// ═══════════════════════════════════════════════════════════

export const PERCEPTION_RULES = {
  id: 'sub-ability-perception',
  name: 'Perception',
  type: 'Sub-Ability',
  derivedFrom: ['Intellect', 'Wisdom'],
  baseFormula: 'Intellect + Wisdom',
  description: "Perception is a sub-ability derived from a character's Intellect and Wisdom scores. This attribute reflects a character's overall awareness and their ability to perceive and interpret their surroundings. It plays a vital role in various detection checks throughout the game, impacting a character's ability to notice details, spot hidden dangers, and understand the subtleties of their environment.\n\nThe base score for Perception is calculated by adding the character's Intellect and Wisdom scores together. This combined value represents their innate sensory acuity, mental focus, and intuitive awareness. However, Perception is not used in isolation. In most situations, it's combined with specific skills to determine a character's success in different types of detection checks.",
  defaultCheck: {
    name: 'Default Detection Check',
    skill: 'Alertness',
    skillCategory: 'Mental',
    formula: 'Perception Base + Alertness (Rank + Mod)',
    description: "In most standard situations, where a character is simply trying to be aware of their surroundings and notice anything out of the ordinary, their Perception base score is combined with their Alertness skill. This represents a general awareness and the ability to spot visual, auditory, or other sensory cues that might indicate something important or unusual."
  },
  focusedTypes: [
    {
      id: 'meta',
      name: 'Meta',
      skill: 'Attune',
      skillCategory: 'Metafocus',
      formula: 'Perception Base + Attune (Rank + Mod)',
      description: "When dealing with Meta effects (such as magic, psychic powers, or other supernatural phenomena), the Attune skill is added to the Perception base score. This allows the character to detect and analyze these subtle energies, and utilize Metafocus-based sensory abilities."
    },
    {
      id: 'social',
      name: 'Social',
      skill: 'Insight',
      skillCategory: 'Social',
      formula: 'Perception Base + Insight (Rank + Mod)',
      description: "When trying to \"read\" other characters and understand their intentions, the Insight skill is added to the Perception base score. This represents the ability to pick up on subtle social cues, body language, and vocal tones to discern hidden emotions, motivations, and potential deceptions."
    },
    {
      id: 'technical',
      name: 'Technical',
      skill: 'Technology',
      skillCategory: 'Mental (Knowledge)',
      formula: 'Perception Base + Technology (Rank + Mod)',
      description: "When analyzing technology or using certain technological sensory devices, the Technology (Knowledge) skill is added to the Perception base score. This reflects the character's understanding of how technology works and their ability to better identify its functions, strengths, and weaknesses."
    }
  ],
  modifiers: {
    description: "The Game Master (GM) may apply additional modifiers to Perception checks based on the specific circumstances of the situation. These modifiers can reflect factors such as visibility, distance, the nature of the thing being detected, and any other relevant environmental or situational factors."
  },
  example: "A character with an Intellect score of +2 and a Wisdom score of +1 has a Perception base score of 3. If they are trying to notice a hidden trap, they would make an Alertness check with a modifier of +3. However, if they are trying to locate an item using magical means, they would make an Attune check with a modifier of +3 instead. While a check for a social situation will be added to Insight as checks for analyzing tech will use Technology (Knowledge)."
};

export const calculatePerceptionBase = (intellectScore = 0, wisdomScore = 0) => {
  return (Number(intellectScore) || 0) + (Number(wisdomScore) || 0);
};

export const calculatePerceptionCheck = (intellectScore = 0, wisdomScore = 0, skillRank = 0, skillMod = 0) => {
  return calculatePerceptionBase(intellectScore, wisdomScore) + (Number(skillRank) || 0) + (Number(skillMod) || 0);
};

export const calculatePerceptionSuite = ({
  intellect = 0,
  wisdom = 0,
  alertnessRank = 0,
  alertnessMod = 0,
  attuneRank = 0,
  attuneMod = 0,
  insightRank = 0,
  insightMod = 0,
  techRank = 0,
  techMod = 0
} = {}) => {
  const base = calculatePerceptionBase(intellect, wisdom);
  return {
    base,
    alertness: base + (Number(alertnessRank) || 0) + (Number(alertnessMod) || 0),
    meta: base + (Number(attuneRank) || 0) + (Number(attuneMod) || 0),
    social: base + (Number(insightRank) || 0) + (Number(insightMod) || 0),
    technical: base + (Number(techRank) || 0) + (Number(techMod) || 0)
  };
};
