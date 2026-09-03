/**
 * Metaphysics & Invocation Resolver Utilities for Tangent SF RP
 * Maps Invocations to canonical disciplines, sub-skills, and paired meta skill IDs.
 */

// Canonical mapping of Metaphysics Disciplines and their paired skills
export const METAPHYSICS_SKILL_MAP = {
  dimension: {
    discipline: 'Dimension',
    primarySkill: 'meta-summoning',
    subSkills: {
      summoning: 'meta-summoning',
      teleport: 'meta-teleport'
    }
  },
  energy: {
    discipline: 'Energy',
    primarySkill: 'meta-elemental',
    subSkills: {
      elemental: 'meta-elemental',
      force: 'meta-force'
    }
  },
  entropy: {
    discipline: 'Entropy',
    primarySkill: 'meta-chaos',
    subSkills: {
      chaos: 'meta-chaos',
      order: 'meta-order'
    }
  },
  illusion: {
    discipline: 'Illusion',
    primarySkill: 'meta-phantasm',
    subSkills: {
      phantasm: 'meta-phantasm',
      shadow: 'meta-shadow'
    }
  },
  matter: {
    discipline: 'Matter',
    primarySkill: 'meta-enhancement',
    subSkills: {
      enhancement: 'meta-enhancement',
      transmutation: 'meta-transmutation'
    }
  },
  mental: {
    discipline: 'Mental',
    primarySkill: 'meta-projection',
    subSkills: {
      projection: 'meta-projection',
      sense: 'meta-sense'
    }
  }
};

// Direct sub-skill name to skill ID lookup
export const SUB_SKILL_TO_META_SKILL = {
  summoning: { id: 'meta-summoning', name: 'Summoning', discipline: 'Dimension' },
  teleport: { id: 'meta-teleport', name: 'Teleport', discipline: 'Dimension' },
  elemental: { id: 'meta-elemental', name: 'Elemental', discipline: 'Energy' },
  force: { id: 'meta-force', name: 'Force', discipline: 'Energy' },
  chaos: { id: 'meta-chaos', name: 'Chaos', discipline: 'Entropy' },
  order: { id: 'meta-order', name: 'Order', discipline: 'Entropy' },
  phantasm: { id: 'meta-phantasm', name: 'Phantasm', discipline: 'Illusion' },
  shadow: { id: 'meta-shadow', name: 'Shadow', discipline: 'Illusion' },
  enhancement: { id: 'meta-enhancement', name: 'Enhancement', discipline: 'Matter' },
  transmutation: { id: 'meta-transmutation', name: 'Transmutation', discipline: 'Matter' },
  projection: { id: 'meta-projection', name: 'Projection', discipline: 'Mental' },
  sense: { id: 'meta-sense', name: 'Sense', discipline: 'Mental' }
};

// Composite invocations mapping to primary requisite meta skill
export const COMPOSITE_INVOCATION_SKILL_MAP = {
  'accelerated decay': { id: 'meta-chaos', name: 'Chaos', discipline: 'Entropy', subSkill: 'Chaos' },
  'construct intelligence': { id: 'meta-projection', name: 'Projection', discipline: 'Mental', subSkill: 'Projection' },
  'flesh crafting': { id: 'meta-transmutation', name: 'Transmutation', discipline: 'Matter', subSkill: 'Transmutation' },
  'life transfer': { id: 'meta-order', name: 'Order', discipline: 'Entropy', subSkill: 'Order' },
  'living spell construct': { id: 'meta-force', name: 'Force', discipline: 'Energy', subSkill: 'Force' },
  'machine spirit interface': { id: 'meta-sense', name: 'Sense', discipline: 'Mental', subSkill: 'Sense' },
  'plasma forging': { id: 'meta-elemental', name: 'Elemental', discipline: 'Energy', subSkill: 'Elemental' },
  'shadow step assault': { id: 'meta-teleport', name: 'Teleport', discipline: 'Dimension', subSkill: 'Teleport' },
  'spatial labyrinth': { id: 'meta-summoning', name: 'Summoning', discipline: 'Dimension', subSkill: 'Summoning' },
  'temporal stasis': { id: 'meta-order', name: 'Order', discipline: 'Entropy', subSkill: 'Order' }
};

/**
 * Resolves the relative meta skill ID, skill name, discipline, and sub-skill for an Invocation.
 *
 * @param {object|string} invocation
 * @returns {object} { baseSkillId, skillName, discipline, subSkill }
 */
export function resolveMetaSkillForInvocation(invocation) {
  if (!invocation) {
    return {
      baseSkillId: 'meta-attune',
      skillName: 'Attune',
      discipline: 'General',
      subSkill: 'Attune'
    };
  }

  const invObj = typeof invocation === 'object' ? invocation : { name: String(invocation) };
  const nameLower = (invObj.name || invObj.title || '').toLowerCase().trim();

  // 1. Direct check in known composite invocations map
  if (COMPOSITE_INVOCATION_SKILL_MAP[nameLower]) {
    const composite = COMPOSITE_INVOCATION_SKILL_MAP[nameLower];
    return {
      baseSkillId: composite.id,
      skillName: composite.name,
      discipline: invObj.discipline || composite.discipline,
      subSkill: composite.subSkill
    };
  }

  // 2. Direct baseSkillId already present on object
  if (invObj.baseSkillId && invObj.baseSkillId.startsWith('meta-')) {
    const cleanSub = invObj.baseSkillId.replace('meta-', '');
    const metaInfo = SUB_SKILL_TO_META_SKILL[cleanSub];
    return {
      baseSkillId: invObj.baseSkillId,
      skillName: metaInfo?.name || invObj.subSkill || cleanSub,
      discipline: metaInfo?.discipline || invObj.discipline || 'General',
      subSkill: invObj.subSkill || metaInfo?.name || cleanSub
    };
  }

  // 3. Extract subSkill from explicit property or classification regex in body/description
  let extractedSubSkill = invObj.subSkill || invObj.sub_skill || null;
  let extractedDiscipline = invObj.discipline || null;

  const textToScan = `${invObj.body || ''} ${invObj.description || ''}`;
  if (!extractedSubSkill && textToScan) {
    const classificationMatch = textToScan.match(/Classification:\s*([A-Za-z]+)\s*\(([^)]+)\)/i);
    if (classificationMatch) {
      if (!extractedDiscipline) extractedDiscipline = classificationMatch[1].trim();
      extractedSubSkill = classificationMatch[2].trim();
    }
  }

  // 4. Match extractedSubSkill against SUB_SKILL_TO_META_SKILL
  if (extractedSubSkill) {
    const subClean = extractedSubSkill.toLowerCase().trim();
    if (SUB_SKILL_TO_META_SKILL[subClean]) {
      const match = SUB_SKILL_TO_META_SKILL[subClean];
      return {
        baseSkillId: match.id,
        skillName: match.name,
        discipline: extractedDiscipline || match.discipline,
        subSkill: match.name
      };
    }
  }

  // 5. Fallback based on discipline
  if (extractedDiscipline) {
    const discClean = extractedDiscipline.toLowerCase().split('+')[0].split(/[\s,]+/)[0].trim();
    const discConfig = METAPHYSICS_SKILL_MAP[discClean];
    if (discConfig) {
      const subSkillKey = Object.keys(discConfig.subSkills)[0];
      const skillId = discConfig.subSkills[subSkillKey];
      return {
        baseSkillId: skillId,
        skillName: subSkillKey.charAt(0).toUpperCase() + subSkillKey.slice(1),
        discipline: discConfig.discipline,
        subSkill: subSkillKey.charAt(0).toUpperCase() + subSkillKey.slice(1)
      };
    }
  }

  // 6. Default to Attune if no discipline matched
  return {
    baseSkillId: 'meta-attune',
    skillName: 'Attune',
    discipline: 'General',
    subSkill: 'Attune'
  };
}
