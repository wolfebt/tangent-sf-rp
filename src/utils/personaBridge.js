/**
 * Universal Persona Bridge for TANGENT SF RP React Project (Persona Folio & MCM)
 * Provides 100% loss-free bidirectional conversion between:
 *  - Modular Character Matrix (MCM) records & configurations
 *  - Persona Folio character sheets
 *  - Story Foundry (ADE) Persona Elements
 *  - Virtual Tabletop (VTT) Unique Manageable Combat Units
 */

import {
  THREAT_TIER_CHASSIS,
  COMPETENCY_ROLES,
  DESIGNATIONS,
  BOSS_TYPES,
  SPECIES_SIZES
} from '../constants/index.js';
import { calculateNPCCombatBlock } from '../engines/tangentEntityEngines.js';
import { ALL_CANONICAL_SKILLS, resolveCanonicalSkillAlias } from '../data/skillsData.js';

/**
 * Canonical Persona Folio Narrative Sections shared across:
 *  - Persona Folio (`NarrativeTab.jsx`)
 *  - Codex Modular Character Matrix (`ModularStatBlockConfigurator.jsx`)
 *  - Story Foundry Modular Character Assembler (`ModularCharacterAssembler.jsx`)
 *  - Story Foundry Persona Element Editor (`EditElementModal.jsx`)
 */
export const FOLIO_NARRATIVE_SECTIONS = [
  {
    id: 'profile',
    title: 'Profile & Identity',
    fields: [
      { id: 'role', label: 'Role in Story', placeholder: 'Quest Giver, Rival, Fixer...', aliasKeys: ['roleInStory'] },
      { id: 'char-concept', label: 'Persona Archetype / Concept', placeholder: 'Archetype...', aliasKeys: ['archetype', 'concept'] },
      { id: 'summary', label: 'One-Sentence Summary', placeholder: 'Summary...', aliasKeys: ['oneLinePitch', 'description'], span2: true },
      { id: 'char-motive', label: 'Core Motivation', placeholder: 'What drives this persona...', aliasKeys: ['motive', 'goalsMotivations'] },
      { id: 'primaryConflict', label: 'Primary Conflict/Goal', placeholder: 'Conflict...', aliasKeys: [] },
      { id: 'nicknames', label: 'Nicknames / Aliases', placeholder: 'Aliases...', aliasKeys: [] },
      { id: 'socialClass', label: 'Social Class & Status', placeholder: 'Social class...', aliasKeys: [] },
      { id: 'currentResidence', label: 'Current Residence', placeholder: 'Residence...', aliasKeys: [] }
    ]
  },
  {
    id: 'physicality',
    title: 'Physicality & Persona',
    fields: [
      { id: 'appearance', label: 'Physical Description', placeholder: 'Physical appearance, cybernetics...', aliasKeys: ['physicalDescription'], span2: true },
      { id: 'voice', label: 'Voice & Speech', placeholder: 'Speech pattern...', aliasKeys: [] },
      { id: 'clothing', label: 'Typical Clothing Style', placeholder: 'Clothing...', aliasKeys: ['char-style'] },
      { id: 'mannerisms', label: 'Mannerisms & Body Language', placeholder: 'Mannerisms...', aliasKeys: ['personalityMannerisms', 'voiceMannerisms'] },
      { id: 'positiveTraits', label: 'Positive Traits', placeholder: 'Positive...', aliasKeys: ['strengthsFlaws'] },
      { id: 'negativeTraits', label: 'Negative Traits / Flaws', placeholder: 'Negative...', aliasKeys: [] },
      { id: 'likesDislikes', label: 'Likes & Dislikes', placeholder: 'Likes and dislikes...', aliasKeys: [] },
      { id: 'hobbies', label: 'Hobbies & Skills', placeholder: 'Hobbies...', aliasKeys: [] },
      { id: 'personalityType', label: 'Personality Type', placeholder: 'Type...', aliasKeys: [] }
    ]
  },
  {
    id: 'history',
    title: 'History & Backstory',
    fields: [
      { id: 'backstory', label: 'Detailed Backstory', placeholder: 'History...', aliasKeys: ['backgroundHistory'], span2: true },
      { id: 'definingTrauma', label: 'Defining Trauma / Wound', placeholder: 'Trauma...', aliasKeys: [] },
      { id: 'greatestAccomplishment', label: 'Greatest Accomplishment(s)', placeholder: 'Accomplishment...', aliasKeys: [] },
      { id: 'childhoodEvents', label: 'Childhood & Adolescence Events', placeholder: 'Childhood...', aliasKeys: [] },
      { id: 'keyRelationships', label: 'Key Relationships & Dynamics', placeholder: 'Relationships...', aliasKeys: ['relationships'] },
      { id: 'romanticHistory', label: 'Romantic History & Philosophy', placeholder: 'Romance...', aliasKeys: [] }
    ]
  },
  {
    id: 'psychology',
    title: 'Psychology & Metanarrative',
    fields: [
      { id: 'worldview', label: 'Worldview & Ethics', placeholder: 'Worldview...', aliasKeys: [], span2: true },
      { id: 'theLie', label: 'The Lie They Believe', placeholder: 'Lie...', aliasKeys: [] },
      { id: 'theTruth', label: 'The Truth They Must Learn', placeholder: 'Truth...', aliasKeys: [] },
      { id: 'deepestFear', label: 'Deepest Fear & Secret', placeholder: 'Fear/Secret...', aliasKeys: [] },
      { id: 'goals', label: 'External Goal vs Internal Need', placeholder: 'Want vs Need...', aliasKeys: [], span2: true },
      { id: 'stakes', label: 'Stakes & Persona Arc', placeholder: 'Stakes...', aliasKeys: [] },
      { id: 'plotHooks', label: 'Plot Connection & Motives', placeholder: 'How they launch or start new adventures...', aliasKeys: [], span2: true },
      { id: 'tags', label: 'Tags', placeholder: 'Tags...', aliasKeys: ['keywords'] }
    ]
  }
];

export const isPersonaFolioData = (data) => {
  if (!data || typeof data !== 'object') return false;
  return Boolean(
    data['char-name'] !== undefined ||
    data['character-doc-id'] !== undefined ||
    data['starting-cp'] !== undefined ||
    data['attr-strength'] !== undefined ||
    (Array.isArray(data.features) && Array.isArray(data.attacks))
  );
};

export const isMcmCharacterData = (data) => {
  if (!data || typeof data !== 'object') return false;
  const fields = data.fields || {};
  return Boolean(
    data.threat_tier !== undefined ||
    data.threatTier !== undefined ||
    data.mcmTier !== undefined ||
    data.competency_role !== undefined ||
    data.competencyRole !== undefined ||
    data.mcmRole !== undefined ||
    data.isMcmOrigin ||
    data.sourceCollection === 'modular_characters' ||
    data.personaSubcategory === 'mcm' ||
    fields.mcmTier !== undefined ||
    fields.mcmRole !== undefined ||
    fields.personaSubcategory === 'mcm'
  );
};

export const isStoryElementData = (data) => {
  if (!data || typeof data !== 'object') return false;
  if ((data.type === 'TangentStoryElement' || data.type === 'TangentStoryComponent') && (data.element || data.component)) {
    return true;
  }
  return Boolean(data.id && data.title && data.type);
};

const safeJsonStringify = (val, indent = 2) => {
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val, null, indent);
  } catch (e) {
    return '';
  }
};

const safeJsonParse = (val, defaultVal = []) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

const ROLE_ALIAS_MAP = {
  tank: 'Tank',
  brute: 'Brute',
  meleedps: 'MeleeDPS',
  striker: 'MeleeDPS',
  'melee dps': 'MeleeDPS',
  rangeddps: 'RangedDPS',
  gunslinger: 'RangedDPS',
  'ranged dps': 'RangedDPS',
  sniper: 'Sniper',
  mobilityspecialist: 'MobilitySpecialist',
  skirmisher: 'MobilitySpecialist',
  flank: 'Flank',
  infiltrator: 'Flank',
  combativemetauser: 'CombativeMetaUser',
  blaster: 'CombativeMetaUser',
  'meta-user': 'CombativeMetaUser',
  buffer: 'Buffer',
  support: 'Buffer',
  leader: 'Leader',
  commander: 'Leader',
  debuffer: 'Debuffer',
  controller: 'Debuffer',
  technician: 'Technician',
  scholar: 'Technician'
};

export const resolveCompetencyRoleKey = (roleInput = 'Tank') => {
  if (!roleInput) return 'Tank';
  const raw = String(roleInput).trim();
  if (COMPETENCY_ROLES[raw]) return raw;
  const lower = raw.toLowerCase();
  if (ROLE_ALIAS_MAP[lower]) return ROLE_ALIAS_MAP[lower];
  const matchedEntry = Object.entries(COMPETENCY_ROLES).find(([, def]) => {
    const defName = (def.name || '').toLowerCase();
    return defName === lower || defName.includes(lower) || lower.includes(def.id.toLowerCase());
  });
  return matchedEntry ? matchedEntry[0] : 'Tank';
};

export const resolveBossTypeKey = (bossInput = 'Standard') => {
  if (!bossInput) return 'Standard';
  const raw = String(bossInput).trim();
  if (BOSS_TYPES[raw]) return raw;
  const lower = raw.toLowerCase();
  if (lower.includes('minion')) return 'Minion';
  if (lower.includes('mastermind') || lower.includes('solo')) return 'Mastermind';
  if (lower.includes('boss') || lower.includes('mini-boss') || lower.includes('major')) return 'Boss';
  return 'Standard';
};

export const resolveDesignationKey = (desigInput = 'Adversary') => {
  if (!desigInput) return 'Adversary';
  const raw = String(desigInput).trim();
  if (DESIGNATIONS[raw]) return raw;
  const lower = raw.toLowerCase();
  if (lower.includes('ally') || lower.includes('friendly')) return 'Ally';
  if (lower.includes('companion') || lower.includes('pet') || lower.includes('drone')) return 'Companion';
  if (lower.includes('neutral') || lower.includes('civilian') || lower.includes('bystander')) return 'Neutral';
  return 'Adversary';
};

const parseNumericCP = (cpRaw, tier = 3) => {
  if (typeof cpRaw === 'number' && !isNaN(cpRaw)) return Math.max(50, cpRaw);
  const str = String(cpRaw || '');
  const match = str.match(/(\d+)/);
  if (match) return Math.max(50, parseInt(match[1], 10));
  return Math.max(50, 50 + (Number(tier) || 3) * 25);
};

const normalizeListItems = (input, defaultSource = 'MCM') => {
  if (!input) return [];
  const parsed = typeof input === 'string' ? safeJsonParse(input, null) : input;
  if (Array.isArray(parsed)) {
    return parsed
      .filter(Boolean)
      .map((item, idx) => {
        if (typeof item === 'object') {
          return {
            id: item.id || `item_${idx}_${ (item.name || item.title || 'entry').toLowerCase().replace(/[^a-z0-9]+/g, '_') }`,
            name: item.name || item.title || 'Entry',
            ...item
          };
        }
        const text = String(item).trim();
        return {
          id: `item_${idx}_${text.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
          name: text,
          description: '',
          source: defaultSource
        };
      });
  }
  if (typeof input === 'string' && input.trim()) {
    return input
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `item_${idx}_${text.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        name: text,
        description: '',
        source: defaultSource
      }));
  }
  return [];
};

/**
 * Converts any Modular Character Matrix (MCM) record, configurator state, or ADE MCM element
 * into a 100% complete, mechanically valid Persona Folio character sheet (`characterData`).
 * Preserves all 5 Identity Pillars, 6 Primary + 12 Sub-Attributes, Canonical Skills,
 * Features/Traits/Hindrances/Augmentations/Invocations, Weapons/Armor/Gear/Attacks,
 * Narrative & Psychological fields, and VTT Unit combat readiness.
 */
export const convertMcmToFolioPersona = (mcmInput = {}, options = {}) => {
  if (!mcmInput || typeof mcmInput !== 'object') return null;

  const rawRecord = (mcmInput.type === 'TangentStoryElement' && mcmInput.element) ? mcmInput.element : mcmInput;
  const fields = rawRecord.fields || {};
  const attachedPersona = rawRecord.personaData || rawRecord.persona_data || {};

  const parseNum = (val, fallback = 0) => {
    if (val === undefined || val === null || val === '') return fallback;
    const n = Number(val);
    return isNaN(n) ? fallback : Math.round(n);
  };

  // 1. Resolve Core MCM Matrix Coordinates
  const tierRaw = rawRecord.threat_tier ?? rawRecord.threatTier ?? rawRecord.mcmTier ?? fields.mcmTier ?? fields.threatTier ?? attachedPersona.mcmTier ?? attachedPersona.threatTier ?? 3;
  const tier = Math.max(0, Math.min(20, parseNum(tierRaw, 3)));
  const chassis = THREAT_TIER_CHASSIS[tier] || THREAT_TIER_CHASSIS[3];

  const roleKey = resolveCompetencyRoleKey(
    rawRecord.competency_role || rawRecord.competencyRole || rawRecord.mcmRole || fields.mcmRole || fields.competencyRole || attachedPersona.mcmRole || attachedPersona.competencyRole || rawRecord.role || fields.role || 'Tank'
  );
  const roleDef = COMPETENCY_ROLES[roleKey] || COMPETENCY_ROLES.Tank;

  const bossTypeKey = resolveBossTypeKey(
    rawRecord.boss_type || rawRecord.bossType || rawRecord.mcmBossType || fields.mcmBossType || fields.bossType || attachedPersona.mcmBossType || attachedPersona.bossType || 'Standard'
  );

  const designationKey = resolveDesignationKey(
    rawRecord.designation || rawRecord.mcmDesignation || fields.mcmDesignation || fields.designation || attachedPersona.mcmDesignation || attachedPersona.designation || 'Adversary'
  );

  const sizeCategory = rawRecord.size_category || rawRecord.sizeCategory || rawRecord['char-size'] || rawRecord.size || fields['char-size'] || fields.sizeCategory || fields.size || attachedPersona['char-size'] || 'Medium';

  const speciesName = rawRecord['char-species'] || rawRecord.species || fields['char-species'] || fields.species || attachedPersona['char-species'] || (rawRecord.is_synthetic || rawRecord.isSynthetic ? 'Synthetic' : 'Human');
  const archetypeName = rawRecord['char-archetype'] || rawRecord.archetype || fields['char-archetype'] || fields.archetype || attachedPersona['char-archetype'] || 'Everyman';
  const originName = rawRecord['char-origin'] || rawRecord.origin || fields['char-origin'] || fields.origin || attachedPersona['char-origin'] || '';
  const secondaryOriginName = rawRecord['char-secondary-origin'] || rawRecord.secondaryOrigin || fields['char-secondary-origin'] || attachedPersona['char-secondary-origin'] || '';
  const occuName = rawRecord['char-occu'] || rawRecord.occupation || rawRecord.occu || fields['char-occu'] || fields.occupation || attachedPersona['char-occu'] || roleDef.name.replace(/^The\s+/i, '').replace(/\s*\(.*\)/, '');
  const secondaryOccuName = rawRecord['char-secondary-occu'] || rawRecord.secondaryOccupation || fields['char-secondary-occu'] || attachedPersona['char-secondary-occu'] || '';
  const factionName = rawRecord['char-faction'] || rawRecord.faction || fields['char-faction'] || fields.faction || attachedPersona['char-faction'] || '';

  const isSynthetic = Boolean(
    rawRecord.is_synthetic ?? rawRecord.isSynthetic ?? fields.isSynthetic ?? attachedPersona.isSynthetic ?? (
      String(speciesName).toLowerCase().includes('synthetic') ||
      String(speciesName).toLowerCase().includes('mekan') ||
      String(speciesName).toLowerCase().includes('construct') ||
      String(archetypeName).toLowerCase().includes('synthetic')
    )
  );

  // 2. Compute Canonical NPC Combat Block
  const combatBlock = calculateNPCCombatBlock({
    tier,
    role: roleKey,
    bossType: bossTypeKey,
    size: SPECIES_SIZES[sizeCategory] ? sizeCategory : 'Medium',
    designation: designationKey,
    isSynthetic
  });

  // 3. Derive 6 Primary Attributes & 12 Sub-Attributes
  // Use explicit attributes if provided, otherwise derive from Role primaryAttrs & Tier attributeBonus
  const primaryAttrNames = (roleDef.primaryAttrs || ['Stamina', 'Strength']).map(a => {
    const lower = String(a).toLowerCase();
    if (lower === 'precision') return 'wisdom';
    return lower;
  });

  const baseAttrBonus = combatBlock.attributeBonus ?? chassis.attrBonus ?? 1;
  const secondaryBonus = Math.max(0, Math.floor(baseAttrBonus * 0.6));
  const tertiaryBonus = Math.max(0, Math.floor(baseAttrBonus * 0.3));

  const getDefaultAttr = (attrKey) => {
    const clean = attrKey.replace('attr-', '');
    if (primaryAttrNames[0] === clean) return baseAttrBonus;
    if (primaryAttrNames.includes(clean)) return Math.max(1, baseAttrBonus);
    if (clean === 'stamina' || clean === 'agility') return secondaryBonus;
    return tertiaryBonus;
  };

  const explicitAttrs = rawRecord.attributes || fields.attributes || {};
  const resolvePrimaryAttr = (attrKey, shortKey) => {
    const candidates = [
      rawRecord[attrKey],
      rawRecord[attrKey.replace('-', '_')],
      explicitAttrs[attrKey],
      explicitAttrs[shortKey],
      fields[attrKey],
      attachedPersona[attrKey]
    ];
    for (const c of candidates) {
      if (c !== undefined && c !== null && c !== '') {
        const parsed = Number(c);
        if (!isNaN(parsed)) return Math.round(parsed);
      }
    }
    return getDefaultAttr(attrKey);
  };

  const attrStrength = resolvePrimaryAttr('attr-strength', 'str');
  const attrAgility = resolvePrimaryAttr('attr-agility', 'agi');
  const attrStamina = resolvePrimaryAttr('attr-stamina', 'sta');
  const attrIntellect = resolvePrimaryAttr('attr-intellect', 'int');
  const attrWisdom = resolvePrimaryAttr('attr-wisdom', 'wis');
  const attrCharisma = resolvePrimaryAttr('attr-charisma', 'cha');

  const resolveSubAttr = (subKey, primaryVal) => {
    const defaultSub = 2 + (primaryVal * 2);
    const candidates = [
      rawRecord[subKey],
      rawRecord[subKey.replace('-', '_')],
      explicitAttrs[subKey],
      fields[subKey],
      attachedPersona[subKey]
    ];
    for (const c of candidates) {
      if (c !== undefined && c !== null && c !== '') {
        const parsed = Number(c);
        if (!isNaN(parsed)) return Math.max(defaultSub, Math.round(parsed));
      }
    }
    return defaultSub;
  };

  const attrMight = resolveSubAttr('attr-might', attrStrength);
  const attrReflex = resolveSubAttr('attr-reflex', attrAgility);
  const attrFortitude = resolveSubAttr('attr-fortitude', attrStamina);
  const attrLogic = resolveSubAttr('attr-logic', attrIntellect);
  const attrWill = resolveSubAttr('attr-will', attrWisdom);
  const attrEtiquette = resolveSubAttr('attr-etiquette', attrCharisma);

  // 4. Resolve Survival Pools (Vitality, Health, Structure)
  const resolvedHealth = isSynthetic
    ? 0
    : parseNum(rawRecord.health ?? rawRecord.max_health ?? fields.health ?? attachedPersona.health, combatBlock.health || 30);
  const resolvedVitality = isSynthetic
    ? 0
    : parseNum(rawRecord.vitality ?? rawRecord.max_vitality ?? fields.vitality ?? attachedPersona.vitality, combatBlock.vitality || 30);
  const resolvedStructure = isSynthetic
    ? parseNum(rawRecord.structure_points ?? rawRecord.structure ?? rawRecord.max_structure ?? fields.structure ?? attachedPersona.structure, combatBlock.structurePoints || 60)
    : parseNum(rawRecord.structure ?? fields.structure ?? attachedPersona.structure, 60);

  const currentHealth = isSynthetic ? 0 : parseNum(rawRecord.current_health ?? fields.current_health ?? attachedPersona.current_health, resolvedHealth);
  const currentVitality = isSynthetic ? 0 : parseNum(rawRecord.current_vitality ?? fields.current_vitality ?? attachedPersona.current_vitality, resolvedVitality);
  const currentStructure = isSynthetic ? parseNum(rawRecord.current_structure ?? fields.current_structure ?? attachedPersona.current_structure, resolvedStructure) : resolvedStructure;

  // 5. Resolve Canonical Skill Ranks (Role keySkills + explicit skills)
  const skillEntries = {};
  const generalAllocationsSkills = {};

  // First carry over any existing `skill-*-rank` keys from attachedPersona, fields, or rawRecord
  [attachedPersona, fields, rawRecord].forEach((src) => {
    if (!src || typeof src !== 'object') return;
    Object.keys(src).forEach((k) => {
      if (k.startsWith('skill-')) {
        if (k.endsWith('-rank') || k.endsWith('-mod')) {
          const r = parseNum(src[k], 0);
          if (r > 0) skillEntries[k] = r;
        } else {
          skillEntries[k] = src[k];
        }
      }
    });
  });

  // Also map Role keySkills to canonical skill IDs if not already set higher
  const roleKeySkills = Array.isArray(rawRecord.key_skills || rawRecord.keySkills)
    ? (rawRecord.key_skills || rawRecord.keySkills)
    : (roleDef.keySkills || ['Defense', 'Athletics']);

  roleKeySkills.forEach((skillName, index) => {
    const resolvedSkill = resolveCanonicalSkillAlias(skillName) ||
      ALL_CANONICAL_SKILLS.find(s => s.name.toLowerCase() === String(skillName).toLowerCase() || s.id.toLowerCase().endsWith(`-${String(skillName).toLowerCase().replace(/\s+/g, '-')}`));
    const skillId = resolvedSkill ? resolvedSkill.id : `combat-${String(skillName).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const rankKey = `skill-${skillId}-rank`;
    const targetRank = index === 0 ? combatBlock.primarySkillRank : combatBlock.secondarySkillRank;
    if (!skillEntries[rankKey] || skillEntries[rankKey] < targetRank) {
      skillEntries[rankKey] = targetRank;
      generalAllocationsSkills[skillId] = Math.min(11, targetRank);
    }
  });

  // Map explicit `skills` object or array if present
  const rawSkillsMap = rawRecord.skills || fields.skills;
  if (rawSkillsMap && typeof rawSkillsMap === 'object' && !Array.isArray(rawSkillsMap)) {
    Object.entries(rawSkillsMap).forEach(([sName, sVal]) => {
      const resolvedSkill = resolveCanonicalSkillAlias(sName);
      const skillId = resolvedSkill ? resolvedSkill.id : sName;
      const rankKey = skillId.startsWith('skill-') ? skillId : `skill-${skillId}-rank`;
      const rankNum = parseNum(sVal, combatBlock.secondarySkillRank);
      if (rankNum > 0) {
        skillEntries[rankKey] = rankNum;
        generalAllocationsSkills[skillId.replace(/^skill-/, '').replace(/-rank$/, '')] = Math.min(11, rankNum);
      }
    });
  } else if (Array.isArray(rawSkillsMap)) {
    rawSkillsMap.forEach((sItem) => {
      const sName = typeof sItem === 'object' ? (sItem.id || sItem.name) : String(sItem);
      const sRank = typeof sItem === 'object' ? parseNum(sItem.rank ?? sItem.level, combatBlock.secondarySkillRank) : combatBlock.secondarySkillRank;
      const resolvedSkill = resolveCanonicalSkillAlias(sName);
      const skillId = resolvedSkill ? resolvedSkill.id : String(sName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      skillEntries[`skill-${skillId}-rank`] = sRank;
      generalAllocationsSkills[skillId] = Math.min(11, sRank);
    });
  }

  // 6. Resolve Features, Traits, Hindrances, Augmentations, Invocations & Loadout
  const featuresList = normalizeListItems(rawRecord.features ?? fields.features ?? attachedPersona.features, 'MCM');
  const roleFeatureText = rawRecord.role_feature || rawRecord.roleFeature || fields.roleFeature || roleDef.feature;
  if (roleFeatureText) {
    const roleFeatName = String(roleFeatureText).split('(')[0].trim();
    const alreadyHasRoleFeat = featuresList.some(f => (f.name || '').toLowerCase().includes(roleFeatName.toLowerCase()));
    if (!alreadyHasRoleFeat) {
      featuresList.unshift({
        id: `feat_mcm_role_${roleKey.toLowerCase()}`,
        name: roleFeatName,
        description: String(roleFeatureText),
        mechanic: String(roleFeatureText),
        cp: 0,
        source: `MCM Role (${roleDef.name})`
      });
    }
  }

  const traitsList = normalizeListItems(rawRecord.traits ?? fields.traits ?? attachedPersona.traits, 'Species / MCM');
  const disadvantagesList = normalizeListItems(
    rawRecord.disadvantages ?? rawRecord.hindrances ?? fields.disadvantages ?? fields.hindrances ?? attachedPersona.disadvantages ?? attachedPersona.hindrances,
    'MCM'
  );
  const augmentationsList = normalizeListItems(rawRecord.augmentations ?? fields.augmentations ?? attachedPersona.augmentations, 'MCM');
  const invocationsList = normalizeListItems(rawRecord.invocations ?? fields.invocations ?? attachedPersona.invocations, 'MCM');
  const awakenedList = normalizeListItems(rawRecord.awakened ?? fields.awakened ?? attachedPersona.awakened, 'MCM');
  const specialAbilitiesList = normalizeListItems(rawRecord.special_abilities ?? fields.special_abilities ?? attachedPersona.special_abilities, 'MCM');
  const specializationsList = normalizeListItems(rawRecord.specializations ?? fields.specializations ?? attachedPersona.specializations, 'MCM');

  const weaponsList = normalizeListItems(rawRecord.weapons ?? rawRecord.weaponry ?? fields.weapons ?? fields.weaponry ?? attachedPersona.weapons, 'MCM Loadout');
  const armorList = normalizeListItems(rawRecord.armor ?? rawRecord.armoring ?? fields.armor ?? fields.armoring ?? attachedPersona.armor, 'MCM Loadout');
  const gearList = normalizeListItems(rawRecord.gear ?? rawRecord.equipment ?? fields.gear ?? attachedPersona.gear, 'MCM Loadout');
  const mechaList = normalizeListItems(rawRecord.mecha ?? fields.mecha ?? attachedPersona.mecha, 'MCM Loadout');
  const companionsList = normalizeListItems(rawRecord.companions ?? fields.companions ?? attachedPersona.companions, 'MCM');

  const expectedDR = parseNum(
    rawRecord.expected_dr ?? rawRecord.armor_dr ?? rawRecord.armorDR ?? fields.armorDR ?? fields.armor_dr ?? attachedPersona.armor_dr,
    combatBlock.expectedDR ?? chassis.dr ?? 0
  );

  // Ensure armor list reflects MCM expected DR if no explicit armor item is present
  if (armorList.length === 0 && expectedDR > 0) {
    armorList.push({
      id: `armor_mcm_tier_${tier}`,
      name: `Tier ${tier} Tactical Protection`,
      dr: expectedDR,
      armor_dr: expectedDR,
      equipped: true,
      description: `Standard Tier ${tier} (${chassis.narrativeRank}) protective kit providing DR ${expectedDR}.`,
      source: 'MCM Chassis'
    });
  }

  // Synthesize ready-to-roll VTT attacks from explicit attacks, weapons, or Role + Tier defaults
  let attacksList = normalizeListItems(rawRecord.attacks ?? fields.attacks ?? attachedPersona.attacks, 'MCM Combat');
  if (attacksList.length === 0 && weaponsList.length > 0) {
    attacksList = weaponsList.map((w, idx) => ({
      id: w.id || `atk_wpn_${idx}`,
      name: w.name || w.title || 'Primary Weapon',
      bonus: w.attack_bonus ?? w.bonus ?? combatBlock.attackBonus,
      attack_bonus: w.attack_bonus ?? w.bonus ?? combatBlock.attackBonus,
      damage: w.damage || w.dmg || `${Math.max(1, Math.ceil((tier + 1) / 3))}d8+${ Math.max(0, attrStrength) }`,
      damage_type: w.damage_type || w.damageType || 'kinetic',
      range: w.range || (roleKey.includes('Ranged') || roleKey === 'Sniper' ? '100 ft' : 'Melee'),
      notes: w.description || w.notes || ''
    }));
  }
  if (attacksList.length === 0) {
    const isRangedRole = roleKey === 'RangedDPS' || roleKey === 'Sniper' || roleKey === 'Debuffer' || roleKey === 'Technician';
    const isMetaRole = roleKey === 'CombativeMetaUser' || roleKey === 'Buffer';
    const diceCount = Math.max(1, Math.min(6, Math.ceil((tier + 2) / 3)));
    const dmgMod = isMetaRole ? attrIntellect : (isRangedRole ? attrAgility : attrStrength);
    attacksList.push({
      id: `atk_mcm_default_${roleKey.toLowerCase()}`,
      name: isMetaRole ? 'Esoteric Focus Blast' : (isRangedRole ? 'Tactical Ranged Strike' : 'Tactical Close Strike'),
      bonus: combatBlock.attackBonus,
      attack_bonus: combatBlock.attackBonus,
      damage: `${diceCount}d8${dmgMod > 0 ? `+${dmgMod}` : ''}`,
      damage_type: isMetaRole ? 'energy' : 'kinetic',
      range: isMetaRole ? '60 ft' : (isRangedRole ? '120 ft' : 'Melee (5 ft)'),
      notes: `${roleDef.name} signature attack`
    });
  }

  // 7. Narrative & Identity Metadata
  const charName = rawRecord['char-name'] || rawRecord.name || rawRecord.title || fields['char-name'] || attachedPersona['char-name'] || 'Unnamed MCM Unit';
  const docId = options.newDocId
    ? `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    : (rawRecord['character-doc-id'] || attachedPersona['character-doc-id'] || rawRecord.id || `char_mcm_${Date.now()}`);

  const tacticalBehaviors = Array.isArray(rawRecord.tactical_behaviors || rawRecord.tacticalBehaviors || fields.tacticalBehaviors)
    ? (rawRecord.tactical_behaviors || rawRecord.tacticalBehaviors || fields.tacticalBehaviors)
    : (typeof (rawRecord.tactical_behaviors || fields.tacticalBehaviors) === 'string' && (rawRecord.tactical_behaviors || fields.tacticalBehaviors).trim()
        ? (rawRecord.tactical_behaviors || fields.tacticalBehaviors).split(',').map(s => s.trim()).filter(Boolean)
        : []);

  const startingCp = parseNumericCP(rawRecord['starting-cp'] ?? fields['starting-cp'] ?? attachedPersona['starting-cp'] ?? chassis.cp, tier);
  const imageUrl = rawRecord.imageUrl || rawRecord.image_url || rawRecord.avatarUrl || rawRecord.portrait || fields.portrait || attachedPersona.imageUrl || attachedPersona.portrait || '';
  const tokenUrl = rawRecord.tokenUrl || rawRecord.token || fields.token || attachedPersona.tokenUrl || attachedPersona.token || imageUrl || '';

  const folioPersona = {
    ...attachedPersona,
    id: docId,
    'character-doc-id': docId,
    sourceMcmId: rawRecord.id || rawRecord.sourceMcmId || attachedPersona.sourceMcmId || docId,
    isMcmOrigin: true,
    personaSubcategory: options.targetFolio ? 'folio' : (rawRecord.personaSubcategory || fields.personaSubcategory || 'mcm'),
    is_locked: Boolean(options.isLocked ?? rawRecord.is_locked ?? fields.is_locked ?? true),
    is_ready_for_vtt: true,

    // 5-Pillar Identity
    'char-name': charName,
    'char-species': speciesName,
    'char-archetype': archetypeName,
    'char-origin': originName,
    'char-secondary-origin': secondaryOriginName,
    'char-occu': occuName,
    'char-secondary-occu': secondaryOccuName,
    'char-faction': factionName,
    'char-size': sizeCategory,
    'char-concept': rawRecord['char-concept'] || rawRecord.concept || fields['char-concept'] || attachedPersona['char-concept'] || `${chassis.narrativeRank} ${roleDef.name.replace(/^The\s+/i, '')}`,
    'char-motive': rawRecord['char-motive'] || rawRecord.motive || fields['char-motive'] || attachedPersona['char-motive'] || '',
    'char-age': String(rawRecord['char-age'] ?? rawRecord.age ?? fields['char-age'] ?? attachedPersona['char-age'] ?? ''),
    'char-gender': rawRecord['char-gender'] || rawRecord.gender || fields['char-gender'] || attachedPersona['char-gender'] || '',
    'char-height': rawRecord['char-height'] || rawRecord.height || fields['char-height'] || attachedPersona['char-height'] || '',
    'char-weight': rawRecord['char-weight'] || rawRecord.weight || fields['char-weight'] || attachedPersona['char-weight'] || '',
    'char-style': rawRecord['char-style'] || rawRecord.style || fields['char-style'] || attachedPersona['char-style'] || '',

    // MCM Matrix Coordinates & Derived Tactical Block
    mcmTier: tier,
    threatTier: tier,
    threat_tier: tier,
    narrativeRank: combatBlock.narrativeRank || chassis.narrativeRank,
    mcmDesignation: designationKey,
    designation: designationKey,
    mcmRole: roleKey,
    competencyRole: roleKey,
    competency_role: roleKey,
    mcmBossType: bossTypeKey,
    bossType: bossTypeKey,
    boss_type: bossTypeKey,
    mcmChassis: `Tier ${tier}: ${chassis.narrativeRank}`,
    tacticalBehaviors,
    tactical_behaviors: tacticalBehaviors,
    npcRoutine: rawRecord.npcRoutine || fields.npcRoutine || attachedPersona.npcRoutine || '',
    vttScript: rawRecord.vttScript || fields.vttScript || attachedPersona.vttScript || '',

    // Economy & Setting Levels
    'starting-cp': startingCp,
    'base-tech-level': parseNum(rawRecord['base-tech-level'] ?? rawRecord.tech_level ?? rawRecord.tl ?? fields['tech-level'] ?? attachedPersona['base-tech-level'], 3),
    'base-meta-level': parseNum(rawRecord['base-meta-level'] ?? rawRecord.meta_level ?? rawRecord.ml ?? fields['meta-level'] ?? attachedPersona['base-meta-level'], 3),
    'tech-level': parseNum(rawRecord['tech-level'] ?? rawRecord.tech_level ?? rawRecord.tl ?? fields['tech-level'] ?? attachedPersona['tech-level'], 3),
    'magic-level': parseNum(rawRecord['magic-level'] ?? rawRecord.meta_level ?? rawRecord.ml ?? fields['magic-level'] ?? attachedPersona['magic-level'], 3),
    'meta-level': parseNum(rawRecord['meta-level'] ?? rawRecord.meta_level ?? rawRecord.ml ?? fields['meta-level'] ?? attachedPersona['meta-level'], 3),

    // Survival & Combat Vitals
    isSynthetic,
    is_synthetic: isSynthetic,
    health: resolvedHealth,
    max_health: resolvedHealth,
    current_health: currentHealth,
    vitality: resolvedVitality,
    max_vitality: resolvedVitality,
    current_vitality: currentVitality,
    structure: resolvedStructure,
    max_structure: resolvedStructure,
    current_structure: currentStructure,
    armor_dr: expectedDR,
    armorDR: expectedDR,
    stamina_dr: attrStamina,
    toughness: attrStamina,
    derived_defense: parseNum(rawRecord.defense_dc ?? rawRecord.defenseDC ?? fields.defense_dc, combatBlock.defenseDC),
    defense_dc: parseNum(rawRecord.defense_dc ?? rawRecord.defenseDC ?? fields.defense_dc, combatBlock.defenseDC),
    attack_bonus: parseNum(rawRecord.attack_bonus ?? rawRecord.attackBonus ?? fields.attack_bonus, combatBlock.attackBonus),
    derived_ap: parseNum(rawRecord.actions_per_round ?? rawRecord.actionsPerRound ?? fields.actions, combatBlock.actionsPerRound),
    actions_per_round: parseNum(rawRecord.actions_per_round ?? rawRecord.actionsPerRound ?? fields.actions, combatBlock.actionsPerRound),
    'initiative-mod': parseNum(rawRecord.initiative_bonus ?? rawRecord['initiative-mod'] ?? fields['initiative-mod'], combatBlock.initiative),
    speed_ft: parseNum(rawRecord.speed_ft ?? rawRecord.speed ?? fields.speed, combatBlock.speed || 30),
    saves: rawRecord.saving_throws || rawRecord.saves || combatBlock.saves,
    karma: parseNum(rawRecord.karma ?? fields.karma ?? attachedPersona.karma, bossTypeKey === 'Mastermind' ? 5 : (bossTypeKey === 'Boss' ? 3 : 1)),
    'plot-points': parseNum(rawRecord['plot-points'] ?? fields['plot-points'] ?? attachedPersona['plot-points'], 0),

    // 6 Primary Attributes & 12 Sub-Attributes
    'attr-strength': attrStrength,
    'attr-might': attrMight,
    'attr-agility': attrAgility,
    'attr-reflex': attrReflex,
    'attr-stamina': attrStamina,
    'attr-fortitude': attrFortitude,
    'attr-intellect': attrIntellect,
    'attr-logic': attrLogic,
    'attr-wisdom': attrWisdom,
    'attr-will': attrWill,
    'attr-charisma': attrCharisma,
    'attr-etiquette': attrEtiquette,

    // Identity Allocation Pools
    speciesAllocations: safeJsonParse(fields.speciesAllocations, attachedPersona.speciesAllocations || {}),
    occuAllocations: safeJsonParse(fields.occuAllocations, attachedPersona.occuAllocations || {}),
    originAllocations: safeJsonParse(fields.originAllocations, attachedPersona.originAllocations || {}),
    factionAllocations: safeJsonParse(fields.factionAllocations, attachedPersona.factionAllocations || {}),
    archetypeAllocations: safeJsonParse(fields.archetypeAllocations, attachedPersona.archetypeAllocations || {}),
    generalAllocations: safeJsonParse(fields.generalAllocations, attachedPersona.generalAllocations || {
      skills: generalAllocationsSkills
    }),
    featureSkillSelections: safeJsonParse(fields.featureSkillSelections, attachedPersona.featureSkillSelections || {}),
    traitSkillSelections: safeJsonParse(fields.traitSkillSelections, attachedPersona.traitSkillSelections || {}),
    tracked_modifications: safeJsonParse(fields.tracked_modifications, attachedPersona.tracked_modifications || []),
    sub_attr_purchases: safeJsonParse(fields.sub_attr_purchases, attachedPersona.sub_attr_purchases || {}),

    // Canonical Skills
    ...skillEntries,

    // Aspect & Loadout Arrays
    specializations: specializationsList,
    features: featuresList,
    traits: traitsList,
    disadvantages: disadvantagesList,
    hindrances: disadvantagesList,
    augmentations: augmentationsList,
    awakened: awakenedList,
    invocations: invocationsList,
    special_abilities: specialAbilitiesList,
    attacks: attacksList,
    weapons: weaponsList,
    weaponry: weaponsList,
    armor: armorList,
    armoring: armorList,
    gear: gearList,
    mecha: mechaList,
    architecture: normalizeListItems(rawRecord.architecture ?? fields.architecture ?? attachedPersona.architecture, 'MCM'),
    companions: companionsList,
    other: normalizeListItems(rawRecord.other ?? fields.other ?? attachedPersona.other, 'MCM'),
    notes: Array.isArray(rawRecord.notes) ? rawRecord.notes : [{ text: rawRecord.description || fields.summary || '' }],

    // Narrative & Soul (All Persona Folio Narrative Sections + Prose & Lore)
    role: rawRecord.role || fields.role || fields.roleInStory || attachedPersona.role || `${designationKey} (${roleDef.name})`,
    summary: rawRecord.description || rawRecord.summary || fields.summary || fields.oneLinePitch || attachedPersona.summary || `${chassis.narrativeRank} ${speciesName} ${occuName}`,
    primaryConflict: rawRecord.primaryConflict || fields.primaryConflict || attachedPersona.primaryConflict || '',
    nicknames: rawRecord.nicknames || fields.nicknames || attachedPersona.nicknames || '',
    socialClass: rawRecord.socialClass || fields.socialClass || attachedPersona.socialClass || '',
    currentResidence: rawRecord.currentResidence || fields.currentResidence || attachedPersona.currentResidence || '',
    appearance: rawRecord.appearance || fields.appearance || fields.physicalDescription || attachedPersona.appearance || '',
    voice: rawRecord.voice || fields.voice || attachedPersona.voice || '',
    clothing: rawRecord.clothing || rawRecord['char-style'] || fields.clothing || fields['char-style'] || attachedPersona.clothing || attachedPersona['char-style'] || '',
    mannerisms: rawRecord.mannerisms || fields.mannerisms || fields.personalityMannerisms || attachedPersona.mannerisms || '',
    positiveTraits: rawRecord.positiveTraits || fields.positiveTraits || fields.strengthsFlaws || attachedPersona.positiveTraits || '',
    negativeTraits: rawRecord.negativeTraits || fields.negativeTraits || attachedPersona.negativeTraits || '',
    likesDislikes: rawRecord.likesDislikes || fields.likesDislikes || attachedPersona.likesDislikes || '',
    hobbies: rawRecord.hobbies || fields.hobbies || attachedPersona.hobbies || '',
    personalityType: rawRecord.personalityType || fields.personalityType || attachedPersona.personalityType || '',
    backstory: rawRecord.backstory || fields.backstory || fields.backgroundHistory || attachedPersona.backstory || '',
    definingTrauma: rawRecord.definingTrauma || fields.definingTrauma || attachedPersona.definingTrauma || '',
    greatestAccomplishment: rawRecord.greatestAccomplishment || fields.greatestAccomplishment || attachedPersona.greatestAccomplishment || '',
    childhoodEvents: rawRecord.childhoodEvents || fields.childhoodEvents || attachedPersona.childhoodEvents || '',
    keyRelationships: rawRecord.keyRelationships || fields.keyRelationships || fields.relationships || attachedPersona.keyRelationships || '',
    romanticHistory: rawRecord.romanticHistory || fields.romanticHistory || attachedPersona.romanticHistory || '',
    worldview: rawRecord.worldview || fields.worldview || attachedPersona.worldview || '',
    theLie: rawRecord.theLie || fields.theLie || attachedPersona.theLie || '',
    theTruth: rawRecord.theTruth || fields.theTruth || attachedPersona.theTruth || '',
    deepestFear: rawRecord.deepestFear || fields.deepestFear || attachedPersona.deepestFear || '',
    goals: rawRecord.goals || fields.goals || fields.goalsMotivations || attachedPersona.goals || '',
    stakes: rawRecord.stakes || fields.stakes || attachedPersona.stakes || '',
    plotHooks: rawRecord.plotHooks || fields.plotHooks || attachedPersona.plotHooks || '',
    tags: rawRecord.tags || rawRecord.keywords || fields.tags || attachedPersona.tags || `MCM, Tier ${tier}, ${designationKey}, ${roleKey}`,
    content: rawRecord.content || rawRecord.narrativeProse || fields.narrativeProse || attachedPersona.content || attachedPersona.narrativeProse || '',
    narrativeProse: rawRecord.narrativeProse || rawRecord.content || fields.narrativeProse || attachedPersona.narrativeProse || attachedPersona.content || '',

    // Custom Fields & AIME 3-Tier Architecture + Scripting
    customFields: Array.isArray(rawRecord.customFields)
      ? rawRecord.customFields
      : (Array.isArray(fields.customFields)
          ? fields.customFields
          : safeJsonParse(fields.customFields, Array.isArray(attachedPersona.customFields) ? attachedPersona.customFields : [])),
    guidance: (rawRecord.guidance && typeof rawRecord.guidance === 'object')
      ? rawRecord.guidance
      : safeJsonParse(fields.guidance, (attachedPersona.guidance && typeof attachedPersona.guidance === 'object') ? attachedPersona.guidance : {}),
    assetHub: Array.isArray(rawRecord.assetHub)
      ? rawRecord.assetHub
      : safeJsonParse(fields.assetHub, Array.isArray(attachedPersona.assetHub) ? attachedPersona.assetHub : []),
    vttScriptActive: String(rawRecord.vttScriptActive ?? fields.vttScriptActive ?? attachedPersona.vttScriptActive ?? Boolean(rawRecord.vttScript || fields.vttScript || attachedPersona.vttScript)),
    relationsStance: rawRecord.relationsStance || fields.relationsStance || attachedPersona.relationsStance || (designationKey === 'Adversary' ? 'Hostile' : 'Friendly'),
    vipTarget: rawRecord.vipTarget || fields.vipTarget || attachedPersona.vipTarget || '',
    rivalTarget: rawRecord.rivalTarget || fields.rivalTarget || attachedPersona.rivalTarget || '',
    primaryTriggers: rawRecord.primaryTriggers || fields.primaryTriggers || attachedPersona.primaryTriggers || '',
    secondaryTriggers: rawRecord.secondaryTriggers || fields.secondaryTriggers || attachedPersona.secondaryTriggers || '',
    triggerLogic: rawRecord.triggerLogic || fields.triggerLogic || attachedPersona.triggerLogic || 'OR',
    speakerFilter: rawRecord.speakerFilter || fields.speakerFilter || attachedPersona.speakerFilter || 'any',
    triggerRegex: rawRecord.triggerRegex || fields.triggerRegex || attachedPersona.triggerRegex || '',
    loreScanPriority: parseNum(rawRecord.loreScanPriority ?? fields.loreScanPriority ?? attachedPersona.loreScanPriority, 50),
    loreBudgetTokens: parseNum(rawRecord.loreBudgetTokens ?? fields.loreBudgetTokens ?? attachedPersona.loreBudgetTokens, 250),
    loreRequireCondition: rawRecord.loreRequireCondition || fields.loreRequireCondition || attachedPersona.loreRequireCondition || '',
    loreSuppressCondition: rawRecord.loreSuppressCondition || fields.loreSuppressCondition || attachedPersona.loreSuppressCondition || '',
    keywords: rawRecord.keywords || fields.keywords || attachedPersona.keywords || '',
    negative_keywords: rawRecord.negative_keywords || fields.negative_keywords || attachedPersona.negative_keywords || '',

    // Media
    imageUrl,
    portrait: imageUrl,
    tokenUrl,
    token: tokenUrl,
    standee: rawRecord.standee || fields.standee || attachedPersona.standee || '',
    media: rawRecord.media || attachedPersona.media || {
      portrait: { url: imageUrl },
      token: { url: tokenUrl }
    },
    updatedAt: new Date().toISOString()
  };

  folioPersona.vttUnitData = buildVttUnitFromPersona(folioPersona);
  return folioPersona;
};

/**
 * Converts a Persona Folio character (`characterData`) into a complete Omnicortex
 * `modular_characters` (MCM) record so Folio characters and MCM records are 100% round-trip compatible.
 */
export const convertFolioToMcmRecord = (folioChar = {}, options = {}) => {
  if (!folioChar || typeof folioChar !== 'object') return null;

  const parseNum = (val, fallback = 0) => {
    if (val === undefined || val === null || val === '') return fallback;
    const n = Number(val);
    return isNaN(n) ? fallback : Math.round(n);
  };

  const startingCp = parseNum(folioChar['starting-cp'], 150);
  const inferredTier = Math.max(0, Math.min(20, Math.round((startingCp - 50) / 25)));
  const tier = parseNum(folioChar.mcmTier ?? folioChar.threatTier ?? folioChar.threat_tier, inferredTier);
  const roleKey = resolveCompetencyRoleKey(folioChar.mcmRole || folioChar.competencyRole || folioChar.competency_role || folioChar.role || 'Tank');
  const bossTypeKey = resolveBossTypeKey(folioChar.mcmBossType || folioChar.bossType || folioChar.boss_type || 'Standard');
  const designationKey = resolveDesignationKey(folioChar.mcmDesignation || folioChar.designation || 'Ally');
  const sizeCategory = folioChar['char-size'] || folioChar.size_category || folioChar.size || 'Medium';
  const speciesName = folioChar['char-species'] || folioChar.species || 'Human';
  const isSynthetic = Boolean(
    folioChar.isSynthetic ?? folioChar.is_synthetic ?? String(speciesName).toLowerCase().includes('synthetic')
  );

  const combatBlock = calculateNPCCombatBlock({
    tier,
    role: roleKey,
    bossType: bossTypeKey,
    size: SPECIES_SIZES[sizeCategory] ? sizeCategory : 'Medium',
    designation: designationKey,
    agility: parseNum(folioChar['attr-agility'], null),
    isSynthetic
  });

  const skillsMap = {};
  Object.keys(folioChar).forEach((k) => {
    if (k.startsWith('skill-') && k.endsWith('-rank')) {
      const rank = parseNum(folioChar[k], 0);
      if (rank > 0) {
        const cleanSkillId = k.replace(/^skill-/, '').replace(/-rank$/, '');
        skillsMap[cleanSkillId] = rank;
      }
    }
  });

  const recordId = options.id || folioChar.sourceMcmId || folioChar['character-doc-id'] || folioChar.id || `mcm_${Date.now()}`;
  const charName = folioChar['char-name'] || folioChar.name || folioChar.title || 'Unnamed Persona';

  const mcmRecord = {
    id: recordId,
    'character-doc-id': folioChar['character-doc-id'] || recordId,
    name: charName,
    title: charName,
    category: designationKey,
    designation: designationKey,
    threat_tier: tier,
    threatTier: tier,
    narrative_rank: combatBlock.narrativeRank,
    competency_role: roleKey,
    competencyRole: roleKey,
    boss_type: bossTypeKey,
    bossType: bossTypeKey,
    size_category: sizeCategory,
    sizeCategory: sizeCategory,
    is_synthetic: isSynthetic,
    isSynthetic: isSynthetic,

    // 5-Pillar Identity
    'char-species': speciesName,
    species: speciesName,
    'char-archetype': folioChar['char-archetype'] || folioChar.archetype || 'Everyman',
    archetype: folioChar['char-archetype'] || folioChar.archetype || 'Everyman',
    'char-origin': folioChar['char-origin'] || folioChar.origin || '',
    origin: folioChar['char-origin'] || folioChar.origin || '',
    'char-secondary-origin': folioChar['char-secondary-origin'] || '',
    'char-occu': folioChar['char-occu'] || folioChar.occupation || '',
    occupation: folioChar['char-occu'] || folioChar.occupation || '',
    'char-secondary-occu': folioChar['char-secondary-occu'] || '',
    'char-faction': folioChar['char-faction'] || folioChar.faction || '',
    faction: folioChar['char-faction'] || folioChar.faction || '',
    'char-concept': folioChar['char-concept'] || '',
    'char-motive': folioChar['char-motive'] || '',

    // Survival & Combat Stats
    vitality: isSynthetic ? 0 : parseNum(folioChar.vitality ?? folioChar.max_vitality, combatBlock.vitality),
    health: isSynthetic ? 0 : parseNum(folioChar.health ?? folioChar.max_health, combatBlock.health),
    structure_points: isSynthetic ? parseNum(folioChar.structure ?? folioChar.max_structure, combatBlock.structurePoints) : parseNum(folioChar.structure, 60),
    defense_dc: parseNum(folioChar.derived_defense ?? folioChar.defense_dc, combatBlock.defenseDC),
    attack_bonus: parseNum(folioChar.attack_bonus, combatBlock.attackBonus),
    expected_dr: parseNum(folioChar.armor_dr ?? folioChar.armorDR, combatBlock.expectedDR),
    initiative_bonus: parseNum(folioChar['initiative-mod'], combatBlock.initiative),
    actions_per_round: parseNum(folioChar.derived_ap ?? folioChar.actions_per_round, combatBlock.actionsPerRound),
    tactical_speed: `${parseNum(folioChar.speed_ft, combatBlock.speed || 30)} ft/rnd`,
    saving_throws: folioChar.saves || combatBlock.saves,

    // 6 Primary + 12 Sub-Attributes
    'attr-strength': parseNum(folioChar['attr-strength'], 0),
    'attr-might': parseNum(folioChar['attr-might'], 2),
    'attr-agility': parseNum(folioChar['attr-agility'], 0),
    'attr-reflex': parseNum(folioChar['attr-reflex'], 2),
    'attr-stamina': parseNum(folioChar['attr-stamina'], 0),
    'attr-fortitude': parseNum(folioChar['attr-fortitude'], 2),
    'attr-intellect': parseNum(folioChar['attr-intellect'], 0),
    'attr-logic': parseNum(folioChar['attr-logic'], 2),
    'attr-wisdom': parseNum(folioChar['attr-wisdom'], 0),
    'attr-will': parseNum(folioChar['attr-will'], 2),
    'attr-charisma': parseNum(folioChar['attr-charisma'], 0),
    'attr-etiquette': parseNum(folioChar['attr-etiquette'], 2),
    attributes: {
      str: parseNum(folioChar['attr-strength'], 0),
      agi: parseNum(folioChar['attr-agility'], 0),
      sta: parseNum(folioChar['attr-stamina'], 0),
      int: parseNum(folioChar['attr-intellect'], 0),
      wis: parseNum(folioChar['attr-wisdom'], 0),
      cha: parseNum(folioChar['attr-charisma'], 0)
    },

    // Skills & Aspects
    skills: skillsMap,
    key_skills: Object.keys(skillsMap).slice(0, 5),
    features: Array.isArray(folioChar.features) ? folioChar.features : [],
    traits: Array.isArray(folioChar.traits) ? folioChar.traits : [],
    disadvantages: Array.isArray(folioChar.disadvantages) ? folioChar.disadvantages : [],
    hindrances: Array.isArray(folioChar.hindrances || folioChar.disadvantages) ? (folioChar.hindrances || folioChar.disadvantages) : [],
    augmentations: Array.isArray(folioChar.augmentations) ? folioChar.augmentations : [],
    invocations: Array.isArray(folioChar.invocations) ? folioChar.invocations : [],
    awakened: Array.isArray(folioChar.awakened) ? folioChar.awakened : [],
    special_abilities: Array.isArray(folioChar.special_abilities) ? folioChar.special_abilities : [],
    specializations: Array.isArray(folioChar.specializations) ? folioChar.specializations : [],
    weapons: Array.isArray(folioChar.weapons) ? folioChar.weapons : [],
    armor: Array.isArray(folioChar.armor) ? folioChar.armor : [],
    gear: Array.isArray(folioChar.gear) ? folioChar.gear : [],
    mecha: Array.isArray(folioChar.mecha) ? folioChar.mecha : [],
    companions: Array.isArray(folioChar.companions) ? folioChar.companions : [],
    attacks: Array.isArray(folioChar.attacks) ? folioChar.attacks : [],

    // Narrative, Custom Fields, Scripting & AIME 3-Tier Architecture
    description: folioChar.summary || folioChar.backstory || `${combatBlock.narrativeRank} ${speciesName}`,
    role: folioChar.role || '',
    summary: folioChar.summary || '',
    primaryConflict: folioChar.primaryConflict || '',
    nicknames: folioChar.nicknames || '',
    socialClass: folioChar.socialClass || '',
    currentResidence: folioChar.currentResidence || '',
    appearance: folioChar.appearance || '',
    voice: folioChar.voice || '',
    clothing: folioChar.clothing || folioChar['char-style'] || '',
    mannerisms: folioChar.mannerisms || '',
    positiveTraits: folioChar.positiveTraits || '',
    negativeTraits: folioChar.negativeTraits || '',
    likesDislikes: folioChar.likesDislikes || '',
    hobbies: folioChar.hobbies || '',
    personalityType: folioChar.personalityType || '',
    backstory: folioChar.backstory || '',
    definingTrauma: folioChar.definingTrauma || '',
    greatestAccomplishment: folioChar.greatestAccomplishment || '',
    childhoodEvents: folioChar.childhoodEvents || '',
    keyRelationships: folioChar.keyRelationships || '',
    romanticHistory: folioChar.romanticHistory || '',
    worldview: folioChar.worldview || '',
    theLie: folioChar.theLie || '',
    theTruth: folioChar.theTruth || '',
    deepestFear: folioChar.deepestFear || '',
    goals: folioChar.goals || '',
    stakes: folioChar.stakes || '',
    plotHooks: folioChar.plotHooks || '',
    tags: folioChar.tags || '',
    content: folioChar.content || folioChar.narrativeProse || '',
    narrativeProse: folioChar.narrativeProse || folioChar.content || '',
    customFields: Array.isArray(folioChar.customFields) ? folioChar.customFields : [],
    guidance: (folioChar.guidance && typeof folioChar.guidance === 'object') ? folioChar.guidance : {},
    assetHub: Array.isArray(folioChar.assetHub) ? folioChar.assetHub : [],
    vttScript: folioChar.vttScript || '',
    vttScriptActive: String(folioChar.vttScriptActive ?? Boolean(folioChar.vttScript)),
    relationsStance: folioChar.relationsStance || 'Hostile',
    vipTarget: folioChar.vipTarget || '',
    rivalTarget: folioChar.rivalTarget || '',
    primaryTriggers: folioChar.primaryTriggers || '',
    secondaryTriggers: folioChar.secondaryTriggers || '',
    triggerLogic: folioChar.triggerLogic || 'OR',
    speakerFilter: folioChar.speakerFilter || 'any',
    triggerRegex: folioChar.triggerRegex || '',
    loreScanPriority: parseNum(folioChar.loreScanPriority, 50),
    loreBudgetTokens: parseNum(folioChar.loreBudgetTokens, 250),
    loreRequireCondition: folioChar.loreRequireCondition || '',
    loreSuppressCondition: folioChar.loreSuppressCondition || '',
    keywords: folioChar.keywords || '',
    negative_keywords: folioChar.negative_keywords || '',
    tactical_behaviors: Array.isArray(folioChar.tacticalBehaviors || folioChar.tactical_behaviors) ? (folioChar.tacticalBehaviors || folioChar.tactical_behaviors) : [],
    imageUrl: folioChar.imageUrl || folioChar.portrait || '',
    tokenUrl: folioChar.tokenUrl || folioChar.token || folioChar.imageUrl || '',
    tech_level: parseNum(folioChar['tech-level'], 3),
    meta_level: parseNum(folioChar['meta-level'], 3),
    is_ready_for_vtt: true,
    personaData: { ...folioChar },
    updatedAt: new Date().toISOString()
  };

  mcmRecord.vttUnitData = buildVttUnitFromPersona(folioChar);
  return mcmRecord;
};

/**
 * Produces a guaranteed-complete Virtual Tabletop (VTT) Unit / StaticEntity payload
 * from any Folio Persona, MCM Character, or ADE Story Persona Element.
 * Generates a unique unit instance ID when `options.uniqueInstance !== false` so multiple
 * copies of an NPC or template act as independent, manageable units on the VTT canvas.
 */
export const buildVttUnitFromPersona = (personaOrElement = {}, options = {}) => {
  if (!personaOrElement || typeof personaOrElement !== 'object') return null;

  const raw = (personaOrElement.type === 'TangentStoryElement' && personaOrElement.element)
    ? personaOrElement.element
    : personaOrElement;
  const fields = raw.fields || {};
  const pData = raw.personaData || raw.persona_data || {};

  const parseNum = (val, fallback = 0) => {
    if (val === undefined || val === null || val === '') return fallback;
    const n = Number(val);
    return isNaN(n) ? fallback : Math.round(n);
  };

  const baseDocId = raw['character-doc-id'] || pData['character-doc-id'] || raw.character_doc_id || raw.sourcePersonaId || raw.id || `persona_${Date.now()}`;
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const unitId = options.unitId || (options.uniqueInstance === false ? baseDocId : `unit_${baseDocId}_${uniqueSuffix}`);

  const name = raw['char-name'] || raw.name || raw.title || fields['char-name'] || pData['char-name'] || 'Combat Unit';
  const species = raw['char-species'] || raw.species || fields['char-species'] || fields.species || pData['char-species'] || 'Human';
  const archetype = raw['char-archetype'] || raw.archetype || fields['char-archetype'] || pData['char-archetype'] || raw['char-concept'] || fields['char-concept'] || 'Combatant';
  const occupation = raw['char-occu'] || raw.occupation || fields['char-occu'] || pData['char-occu'] || '';
  const faction = raw['char-faction'] || raw.faction || fields['char-faction'] || pData['char-faction'] || '';
  const origin = raw['char-origin'] || raw.origin || fields['char-origin'] || pData['char-origin'] || '';

  const isSynthetic = Boolean(
    raw.isSynthetic ?? raw.is_synthetic ?? fields.isSynthetic ?? pData.isSynthetic ?? (
      String(species).toLowerCase().includes('synthetic') ||
      String(species).toLowerCase().includes('mekan') ||
      String(species).toLowerCase().includes('construct') ||
      String(species).toLowerCase().includes('golem') ||
      String(species).toLowerCase().includes('undead') ||
      String(archetype).toLowerCase().includes('synthetic')
    )
  );

  const tier = Math.max(0, Math.min(20, parseNum(
    raw.threat_tier ?? raw.threatTier ?? raw.mcmTier ?? fields.mcmTier ?? fields.threatTier ?? pData.mcmTier ?? pData.threatTier,
    Math.max(0, Math.min(20, Math.round((parseNum(raw['starting-cp'] ?? fields['starting-cp'] ?? pData['starting-cp'], 150) - 50) / 25)))
  )));

  const roleKey = resolveCompetencyRoleKey(
    raw.competency_role || raw.competencyRole || raw.mcmRole || fields.mcmRole || pData.mcmRole || raw.role || fields.role || 'Tank'
  );
  const bossTypeKey = resolveBossTypeKey(
    raw.boss_type || raw.bossType || raw.mcmBossType || fields.mcmBossType || pData.mcmBossType || 'Standard'
  );
  const designationKey = resolveDesignationKey(
    raw.designation || raw.mcmDesignation || fields.mcmDesignation || pData.mcmDesignation || (raw.isMcmOrigin ? 'Adversary' : 'Ally')
  );
  const sizeCategory = raw['char-size'] || raw.size_category || raw.sizeCategory || fields['char-size'] || pData['char-size'] || 'Medium';

  const npcDefaults = calculateNPCCombatBlock({
    tier,
    role: roleKey,
    bossType: bossTypeKey,
    size: SPECIES_SIZES[sizeCategory] ? sizeCategory : 'Medium',
    designation: designationKey,
    isSynthetic
  });

  // Attributes
  const str = parseNum(raw['attr-strength'] ?? fields['attr-strength'] ?? pData['attr-strength'] ?? raw.attributes?.str, npcDefaults.attributeBonus);
  const agi = parseNum(raw['attr-agility'] ?? fields['attr-agility'] ?? pData['attr-agility'] ?? raw.attributes?.agi, npcDefaults.attributeBonus);
  const sta = parseNum(raw['attr-stamina'] ?? fields['attr-stamina'] ?? pData['attr-stamina'] ?? raw.attributes?.sta, npcDefaults.attributeBonus);
  const int = parseNum(raw['attr-intellect'] ?? fields['attr-intellect'] ?? pData['attr-intellect'] ?? raw.attributes?.int, Math.floor(npcDefaults.attributeBonus * 0.6));
  const wis = parseNum(raw['attr-wisdom'] ?? fields['attr-wisdom'] ?? pData['attr-wisdom'] ?? raw.attributes?.wis, Math.floor(npcDefaults.attributeBonus * 0.6));
  const cha = parseNum(raw['attr-charisma'] ?? fields['attr-charisma'] ?? pData['attr-charisma'] ?? raw.attributes?.cha, Math.floor(npcDefaults.attributeBonus * 0.5));

  const might = parseNum(raw['attr-might'] ?? fields['attr-might'] ?? pData['attr-might'], 2 + str * 2);
  const reflex = parseNum(raw['attr-reflex'] ?? fields['attr-reflex'] ?? pData['attr-reflex'], 2 + agi * 2);
  const fortitude = parseNum(raw['attr-fortitude'] ?? fields['attr-fortitude'] ?? pData['attr-fortitude'], 2 + sta * 2);
  const logic = parseNum(raw['attr-logic'] ?? fields['attr-logic'] ?? pData['attr-logic'], 2 + int * 2);
  const will = parseNum(raw['attr-will'] ?? fields['attr-will'] ?? pData['attr-will'], 2 + wis * 2);
  const etiquette = parseNum(raw['attr-etiquette'] ?? fields['attr-etiquette'] ?? pData['attr-etiquette'], 2 + cha * 2);

  // Vitals
  const baseHealth = isSynthetic
    ? 0
    : parseNum(raw.base_health ?? raw.health ?? raw.max_health ?? fields.health ?? pData.health, npcDefaults.health || 30);
  const baseVitality = isSynthetic
    ? 0
    : parseNum(raw.base_vitality ?? raw.vitality ?? raw.max_vitality ?? fields.vitality ?? pData.vitality, npcDefaults.vitality || 30);
  const baseStructure = isSynthetic
    ? parseNum(raw.base_structure ?? raw.structure_points ?? raw.structure ?? raw.max_structure ?? fields.structure ?? pData.structure, npcDefaults.structurePoints || 60)
    : parseNum(raw.base_structure ?? raw.structure ?? fields.structure ?? pData.structure, 60);

  const currentHealth = isSynthetic
    ? 0
    : parseNum(raw.current_health ?? raw.current_hp ?? fields.current_health ?? pData.current_health, baseHealth);
  const currentVitality = isSynthetic
    ? 0
    : parseNum(raw.current_vitality ?? fields.current_vitality ?? pData.current_vitality, baseVitality);
  const currentStructure = isSynthetic
    ? parseNum(raw.current_structure ?? fields.current_structure ?? pData.current_structure, baseStructure)
    : baseStructure;

  // Armor DR & Stamina Toughness DR
  const armorList = normalizeListItems(raw.armor ?? raw.armoring ?? fields.armor ?? fields.armoring ?? pData.armor, 'Loadout');
  const highestArmorItemDr = armorList.reduce((maxDr, item) => {
    const itemDr = parseNum(item?.dr ?? item?.armor_dr ?? item?.damage_reduction, 0);
    return Math.max(maxDr, itemDr);
  }, 0);
  const armorDr = Math.max(
    highestArmorItemDr,
    parseNum(raw.armor_dr ?? raw.armorDR ?? raw.expected_dr ?? fields.armorDR ?? fields.armor_dr ?? pData.armor_dr, npcDefaults.expectedDR || 0)
  );
  const staminaDr = parseNum(
    raw.stamina_dr ?? raw.toughness ?? fields.stamina_dr ?? fields.toughness ?? pData.stamina_dr,
    isSynthetic ? 0 : Math.max(0, sta)
  );

  const defenseDc = parseNum(
    raw.defense_dc ?? raw.defenseDC ?? raw.derived_defense ?? fields.defense_dc ?? pData.derived_defense,
    npcDefaults.defenseDC || (10 + reflex)
  );
  const attackBonus = parseNum(
    raw.attack_bonus ?? raw.attackBonus ?? fields.attack_bonus ?? pData.attack_bonus,
    npcDefaults.attackBonus || (Math.max(str, agi) + 4)
  );
  const actionsPerRound = parseNum(
    raw.actions_per_round ?? raw.actionsPerRound ?? raw.derived_ap ?? fields.actions ?? pData.derived_ap,
    npcDefaults.actionsPerRound || 2
  );
  const initiativeMod = parseNum(
    raw.initiative_mod ?? raw.initiative_bonus ?? raw['initiative-mod'] ?? fields['initiative-mod'] ?? pData['initiative-mod'],
    npcDefaults.initiative || agi
  );
  const speedFt = parseNum(
    raw.speed_ft ?? (typeof raw.tactical_speed === 'string' ? parseInt(raw.tactical_speed, 10) : raw.speed) ?? fields.speed ?? pData.speed_ft,
    npcDefaults.speed || 30
  );

  // Skills map for VTT checks
  const skillsMap = { ...(raw.skills && typeof raw.skills === 'object' && !Array.isArray(raw.skills) ? raw.skills : {}) };
  [pData, fields, raw].forEach((src) => {
    if (!src || typeof src !== 'object') return;
    Object.keys(src).forEach((k) => {
      if (k.startsWith('skill-') && k.endsWith('-rank')) {
        const rank = parseNum(src[k], 0);
        if (rank > 0) {
          const skillId = k.replace(/^skill-/, '').replace(/-rank$/, '');
          skillsMap[skillId] = rank;
        }
      }
    });
  });
  if (Object.keys(skillsMap).length === 0 && Array.isArray(npcDefaults.keySkills)) {
    npcDefaults.keySkills.forEach((sk, idx) => {
      const canonical = resolveCanonicalSkillAlias(sk);
      const key = canonical ? canonical.id : String(sk).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      skillsMap[key] = idx === 0 ? npcDefaults.primarySkillRank : npcDefaults.secondarySkillRank;
    });
  }

  // Attacks & Weapons
  const weaponsList = normalizeListItems(raw.weapons ?? raw.weaponry ?? fields.weapons ?? fields.weaponry ?? pData.weapons, 'Loadout');
  let attacksList = normalizeListItems(raw.attacks ?? fields.attacks ?? pData.attacks, 'Combat');
  if (attacksList.length === 0 && weaponsList.length > 0) {
    attacksList = weaponsList.map((w, idx) => ({
      id: w.id || `atk_${idx}`,
      name: w.name || w.title || 'Weapon Strike',
      bonus: parseNum(w.attack_bonus ?? w.bonus, attackBonus),
      attack_bonus: parseNum(w.attack_bonus ?? w.bonus, attackBonus),
      damage: w.damage || w.dmg || '2d8',
      damage_type: w.damage_type || 'kinetic',
      range: w.range || 'Melee / Ranged'
    }));
  }
  if (attacksList.length === 0) {
    const diceCount = Math.max(1, Math.min(6, Math.ceil((tier + 2) / 3)));
    attacksList.push({
      id: 'atk_default_primary',
      name: 'Primary Tactical Strike',
      bonus: attackBonus,
      attack_bonus: attackBonus,
      damage: `${diceCount}d8+${Math.max(0, Math.max(str, agi))}`,
      damage_type: 'kinetic',
      range: 'Standard'
    });
  }

  const imageUrl = raw.tokenUrl || raw.image_url || raw.imageUrl || raw.avatarUrl || raw.portrait ||
    fields.token || fields.portrait || pData.tokenUrl || pData.imageUrl || pData.portrait ||
    pData.media?.token?.url || pData.media?.portrait?.url || null;

  const position = options.position || {
    x: parseNum(raw.x, 350),
    y: parseNum(raw.y, 350)
  };

  return {
    id: unitId,
    unit_id: unitId,
    character_doc_id: baseDocId,
    source_persona_id: baseDocId,
    adeStoryElementId: raw.adeStoryElementId || raw.id || baseDocId,
    name,
    label: name,
    image_url: imageUrl,
    avatarUrl: imageUrl,
    icon: raw.icon || (designationKey === 'Adversary' ? '👾' : '🧙‍♂️'),
    designation: designationKey,
    allegiance: designationKey.toLowerCase(),
    is_persona: true,
    is_mcm_unit: Boolean(raw.isMcmOrigin || raw.personaSubcategory === 'mcm' || fields.personaSubcategory === 'mcm'),
    is_ready_for_vtt: true,
    is_synthetic: isSynthetic,
    threat_tier: tier,
    competency_role: roleKey,
    boss_type: bossTypeKey,
    role: raw.role || fields.role || `${designationKey} (${roleKey})`,
    species,
    archetype,
    occupation,
    origin,
    faction,
    size_category: sizeCategory,
    size_modifier: SPECIES_SIZES[sizeCategory]?.combatMod || 0,
    tech_level: parseNum(raw.tech_level ?? raw['tech-level'] ?? fields['tech-level'] ?? pData['tech-level'], 3),
    meta_level: parseNum(raw.meta_level ?? raw['meta-level'] ?? fields['meta-level'] ?? pData['meta-level'], 3),

    // Vitals
    base_hp: isSynthetic ? baseStructure : baseHealth,
    base_health: baseHealth,
    base_vitality: baseVitality,
    base_structure: baseStructure,
    current_hp: isSynthetic ? currentStructure : currentHealth,
    current_health: currentHealth,
    current_vitality: currentVitality,
    current_structure: currentStructure,

    // Combat Defenses & Action Economy
    armor_dr: armorDr,
    stamina_dr: staminaDr,
    defense_dc: defenseDc,
    attack_bonus: attackBonus,
    actions_per_round: actionsPerRound,
    initiative_mod: initiativeMod,
    speed_ft: speedFt,
    karma: parseNum(raw.karma ?? fields.karma ?? pData.karma, 3),
    saves: raw.saves || raw.saving_throws || {
      fortitude: fortitude + 8,
      reflex: reflex + 8,
      will: will + 8
    },

    // Attributes & Skills
    attributes: {
      'attr-strength': str,
      'attr-might': might,
      'attr-agility': agi,
      'attr-reflex': reflex,
      'attr-stamina': sta,
      'attr-fortitude': fortitude,
      'attr-intellect': int,
      'attr-logic': logic,
      'attr-wisdom': wis,
      'attr-will': will,
      'attr-charisma': cha,
      'attr-etiquette': etiquette
    },
    skills: skillsMap,

    // Tactical Loadout & Abilities
    attacks: attacksList,
    weapons: weaponsList,
    armor: armorList,
    gear: normalizeListItems(raw.gear ?? fields.gear ?? pData.gear, 'Loadout'),
    features: normalizeListItems(raw.features ?? fields.features ?? pData.features, 'Feature'),
    traits: normalizeListItems(raw.traits ?? fields.traits ?? pData.traits, 'Trait'),
    disadvantages: normalizeListItems(raw.disadvantages ?? raw.hindrances ?? fields.disadvantages ?? pData.disadvantages, 'Hindrance'),
    augmentations: normalizeListItems(raw.augmentations ?? fields.augmentations ?? pData.augmentations, 'Augmentation'),
    invocations: normalizeListItems(raw.invocations ?? fields.invocations ?? pData.invocations, 'Invocation'),
    tactical_behaviors: Array.isArray(raw.tactical_behaviors || raw.tacticalBehaviors || fields.tacticalBehaviors)
      ? (raw.tactical_behaviors || raw.tacticalBehaviors || fields.tacticalBehaviors)
      : [],
    vtt_script: raw.vttScript || fields.vttScript || pData.vttScript || '',
    storySummary: raw.summary || fields.summary || pData.summary || raw.content || '',
    dialogueHook: fields.plotHooks || fields.dialogue || pData.plotHooks || '',
    conditions: Array.isArray(raw.conditions || raw.active_conditions) ? (raw.conditions || raw.active_conditions) : [],
    x: position.x,
    y: position.y
  };
};

export const convertFolioToPersonaElement = (folioData, options = {}) => {
  if (!folioData || typeof folioData !== 'object') return null;

  const charName = folioData['char-name'] || folioData.name || folioData.title || 'Unnamed Persona';
  const elementId = options.id || `elem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const vttUnitData = buildVttUnitFromPersona(folioData, { uniqueInstance: false });

  const fields = {
    // Subcategory & MCM Alignment Metadata
    'personaSubcategory': folioData.personaSubcategory || (folioData.isMcmOrigin ? 'mcm' : 'folio'),
    'mcmTier': String(folioData.mcmTier ?? folioData.threatTier ?? vttUnitData?.threat_tier ?? 3),
    'mcmDesignation': folioData.mcmDesignation || folioData.designation || vttUnitData?.designation || 'Ally',
    'mcmRole': folioData.mcmRole || folioData.competencyRole || vttUnitData?.competency_role || 'Tank',
    'mcmBossType': folioData.mcmBossType || folioData.bossType || vttUnitData?.boss_type || 'Standard',
    'mcmChassis': folioData.mcmChassis || `Tier ${folioData.mcmTier ?? vttUnitData?.threat_tier ?? 3}`,
    'armorDR': String(folioData.armor_dr ?? folioData.armorDR ?? vttUnitData?.armor_dr ?? 0),
    'defense_dc': String(folioData.derived_defense ?? folioData.defense_dc ?? vttUnitData?.defense_dc ?? 12),
    'attack_bonus': String(folioData.attack_bonus ?? vttUnitData?.attack_bonus ?? 4),
    'actions': String(folioData.derived_ap ?? folioData.actions_per_round ?? vttUnitData?.actions_per_round ?? 2),
    'speed': String(folioData.speed_ft ?? vttUnitData?.speed_ft ?? 30),
    'isSynthetic': Boolean(folioData.isSynthetic ?? folioData.is_synthetic ?? vttUnitData?.is_synthetic),
    'tacticalBehaviors': Array.isArray(folioData.tacticalBehaviors) ? folioData.tacticalBehaviors.join(', ') : (folioData.tacticalBehaviors || ''),
    'npcRoutine': folioData.npcRoutine || '',
    'vttScript': folioData.vttScript || '',

    // Narrative: Overview
    'role': folioData.role || '',
    'char-concept': folioData['char-concept'] || '',
    'summary': folioData.summary || '',
    'char-motive': folioData['char-motive'] || '',
    'primaryConflict': folioData.primaryConflict || '',

    // Narrative: Profile: Vitals & 5 Pillars
    'char-name': charName,
    'nicknames': folioData.nicknames || '',
    'char-age': String(folioData['char-age'] ?? ''),
    'char-gender': folioData['char-gender'] || '',
    'char-species': folioData['char-species'] || '',
    'char-archetype': folioData['char-archetype'] || '',
    'char-occu': folioData['char-occu'] || '',
    'char-secondary-occu': folioData['char-secondary-occu'] || '',
    'socialClass': folioData.socialClass || '',
    'char-origin': folioData['char-origin'] || '',
    'char-secondary-origin': folioData['char-secondary-origin'] || '',
    'char-faction': folioData['char-faction'] || '',
    'char-size': folioData['char-size'] || 'Medium',
    'currentResidence': folioData.currentResidence || '',

    // Narrative: Profile: Physicality
    'appearance': folioData.appearance || '',
    'char-height': folioData['char-height'] || '',
    'char-weight': folioData['char-weight'] || '',
    'voice': folioData.voice || '',
    'char-style': folioData['char-style'] || folioData.clothing || '',
    'mannerisms': folioData.mannerisms || '',

    // Narrative: Profile: Personality
    'positiveTraits': folioData.positiveTraits || '',
    'negativeTraits': folioData.negativeTraits || '',
    'likesDislikes': folioData.likesDislikes || '',
    'hobbies': folioData.hobbies || '',
    'personalityType': folioData.personalityType || '',

    // Narrative: Backstory
    'backstory': folioData.backstory || '',
    'definingTrauma': folioData.definingTrauma || '',
    'greatestAccomplishment': folioData.greatestAccomplishment || '',
    'childhoodEvents': folioData.childhoodEvents || '',
    'keyRelationships': folioData.keyRelationships || '',

    // Narrative: Psychology
    'worldview': folioData.worldview || '',
    'theLie': folioData.theLie || '',
    'theTruth': folioData.theTruth || '',
    'deepestFear': folioData.deepestFear || '',
    'goals': folioData.goals || '',
    'stakes': folioData.stakes || '',

    // Narrative: Genre & Connections
    'stats': folioData.stats || '',
    'plotHooks': folioData.plotHooks || '',
    'romanticHistory': folioData.romanticHistory || '',
    'tags': Array.isArray(folioData.tags) ? folioData.tags.join(', ') : (folioData.tags || ''),
    'narrativeProse': folioData.narrativeProse || folioData.content || '',

    // AIME Layer 2 Core Traits Alias Sync
    'name': charName,
    'archetype': folioData['char-concept'] || folioData['char-archetype'] || '',
    'oneLinePitch': folioData.summary || '',
    'physicalDescription': folioData.appearance || '',
    'personalityMannerisms': folioData.mannerisms || '',
    'backgroundHistory': folioData.backstory || '',
    'goalsMotivations': folioData['char-motive'] || folioData.goals || '',
    'strengthsFlaws': folioData.positiveTraits || '',
    'roleInStory': folioData.role || '',
    'relationships': folioData.keyRelationships || '',

    // Scripting, Relations & Dynamic Lorebook
    'vttScriptActive': String(folioData.vttScriptActive ?? Boolean(folioData.vttScript)),
    'relationsStance': folioData.relationsStance || 'Hostile',
    'vipTarget': folioData.vipTarget || '',
    'rivalTarget': folioData.rivalTarget || '',
    'primaryTriggers': folioData.primaryTriggers || '',
    'secondaryTriggers': folioData.secondaryTriggers || '',
    'triggerLogic': folioData.triggerLogic || 'OR',
    'speakerFilter': folioData.speakerFilter || 'any',
    'triggerRegex': folioData.triggerRegex || '',
    'loreScanPriority': String(folioData.loreScanPriority ?? 50),
    'loreBudgetTokens': String(folioData.loreBudgetTokens ?? 250),
    'loreRequireCondition': folioData.loreRequireCondition || '',
    'loreSuppressCondition': folioData.loreSuppressCondition || '',
    'keywords': folioData.keywords || '',
    'negative_keywords': folioData.negative_keywords || '',

    // Mechanics: Vitals & Attributes
    'starting-cp': String(folioData['starting-cp'] ?? 150),
    'base-tech-level': String(folioData['base-tech-level'] ?? 3),
    'base-meta-level': String(folioData['base-meta-level'] ?? 3),
    'tech-level': String(folioData['tech-level'] ?? 3),
    'magic-level': String(folioData['magic-level'] ?? folioData['meta-level'] ?? 3),
    'meta-level': String(folioData['meta-level'] ?? folioData['magic-level'] ?? 3),
    'health': String(folioData.health ?? 30),
    'vitality': String(folioData.vitality ?? 30),
    'structure': String(folioData.structure ?? 60),
    'karma': String(folioData.karma ?? 3),
    'plot-points': String(folioData['plot-points'] ?? 0),
    'initiative-mod': String(folioData['initiative-mod'] ?? 0),

    'attr-strength': String(folioData['attr-strength'] ?? 0),
    'attr-might': String(folioData['attr-might'] ?? 2),
    'attr-agility': String(folioData['attr-agility'] ?? 0),
    'attr-reflex': String(folioData['attr-reflex'] ?? 2),
    'attr-stamina': String(folioData['attr-stamina'] ?? 0),
    'attr-fortitude': String(folioData['attr-fortitude'] ?? 2),
    'attr-intellect': String(folioData['attr-intellect'] ?? 0),
    'attr-logic': String(folioData['attr-logic'] ?? 2),
    'attr-wisdom': String(folioData['attr-wisdom'] ?? 0),
    'attr-will': String(folioData['attr-will'] ?? 2),
    'attr-charisma': String(folioData['attr-charisma'] ?? 0),
    'attr-etiquette': String(folioData['attr-etiquette'] ?? 2),

    // Identity Pillar Allocation Pools & Skill Choices
    'speciesAllocations': safeJsonStringify(folioData.speciesAllocations || {}),
    'occuAllocations': safeJsonStringify(folioData.occuAllocations || {}),
    'originAllocations': safeJsonStringify(folioData.originAllocations || {}),
    'factionAllocations': safeJsonStringify(folioData.factionAllocations || {}),
    'archetypeAllocations': safeJsonStringify(folioData.archetypeAllocations || {}),
    'generalAllocations': safeJsonStringify(folioData.generalAllocations || {}),
    'featureSkillSelections': safeJsonStringify(folioData.featureSkillSelections || {}),
    'traitSkillSelections': safeJsonStringify(folioData.traitSkillSelections || {}),
    'tracked_modifications': safeJsonStringify(folioData.tracked_modifications || []),
    'sub_attr_purchases': safeJsonStringify(folioData.sub_attr_purchases || {}),

    // Mechanics: Lists & JSON
    'specializations': safeJsonStringify(folioData.specializations || []),
    'features': safeJsonStringify(folioData.features || []),
    'traits': safeJsonStringify(folioData.traits || []),
    'disadvantages': safeJsonStringify(folioData.disadvantages || []),
    'hindrances': safeJsonStringify(folioData.hindrances || folioData.disadvantages || []),
    'augmentations': safeJsonStringify(folioData.augmentations || []),
    'awakened': safeJsonStringify(folioData.awakened || []),
    'invocations': safeJsonStringify(folioData.invocations || []),
    'special_abilities': safeJsonStringify(folioData.special_abilities || []),
    'attacks': safeJsonStringify(folioData.attacks || vttUnitData?.attacks || []),
    'armor': safeJsonStringify(folioData.armor || []),
    'gear': safeJsonStringify(folioData.gear || []),
    'weapons': safeJsonStringify(folioData.weapons || []),
    'weaponry': safeJsonStringify(folioData.weaponry || folioData.weapons || []),
    'armoring': safeJsonStringify(folioData.armoring || folioData.armor || []),
    'mecha': safeJsonStringify(folioData.mecha || []),
    'architecture': safeJsonStringify(folioData.architecture || []),
    'companions': safeJsonStringify(folioData.companions || []),
    'other': safeJsonStringify(folioData.other || []),
    'notes': safeJsonStringify(folioData.notes || [])
  };

  Object.keys(folioData).forEach(key => {
    if (key.startsWith('skill-')) {
      fields[key] = typeof folioData[key] === 'object' ? safeJsonStringify(folioData[key]) : String(folioData[key]);
    }
  });

  let content = folioData.content || '';
  if (!content) {
    const conceptLine = folioData['char-concept'] ? `<strong>Archetype:</strong> ${folioData['char-concept']}<br/>` : '';
    const speciesLine = folioData['char-species'] ? `<strong>Species:</strong> ${folioData['char-species']} | ` : '';
    const occuLine = folioData['char-occu'] ? `<strong>Occupation:</strong> ${folioData['char-occu']}<br/>` : '';
    const summaryLine = folioData.summary ? `<p><em>"${folioData.summary}"</em></p>` : '';
    const backstoryLine = folioData.backstory ? `<h4>Backstory</h4><p>${folioData.backstory.replace(/\n/g, '<br/>')}</p>` : '';
    content = `<h3>${charName}</h3><p>${speciesLine}${occuLine}${conceptLine}</p>${summaryLine}${backstoryLine}`;
  }

  return {
    id: elementId,
    title: charName,
    type: 'Persona',
    content: content,
    imageUrl: folioData.imageUrl || folioData.portrait || '',
    fields: fields,
    customFields: Array.isArray(folioData.customFields) ? folioData.customFields : [],
    guidance: (folioData.guidance && typeof folioData.guidance === 'object') ? folioData.guidance : {},
    assetHub: Array.isArray(folioData.assetHub) ? folioData.assetHub : [],
    linkedElements: (Array.isArray(folioData.assetHub) ? folioData.assetHub : []).map(a => a.assetId || a),
    children: [],
    personaData: { ...folioData, 'char-name': charName, vttUnitData },
    vttUnitData,
    isReadyForVtt: true,
    authorHandle: folioData.authorHandle || '',
    ownerUid: folioData.ownerUid || 'local',
    updatedAt: new Date().toISOString()
  };
};

export const convertPersonaElementToFolio = (element) => {
  if (!element || typeof element !== 'object') return null;

  const rawElement = (element.type === 'TangentStoryElement' && element.element) ? element.element : element;
  const fields = rawElement.fields || {};
  const attachedFolio = rawElement.personaData || {};

  // If this is an MCM record or MCM-subcategorized element without full Folio attributes, run convertMcmToFolioPersona first
  if (isMcmCharacterData(rawElement) && attachedFolio['attr-strength'] === undefined && fields['attr-strength'] === undefined) {
    return convertMcmToFolioPersona(rawElement, { targetFolio: true });
  }

  const parseNum = (val, defaultVal = 0) => {
    if (val === undefined || val === null || val === '') return defaultVal;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defaultVal : parsed;
  };

  const name = fields['char-name'] || rawElement.title || attachedFolio['char-name'] || 'Unnamed Persona';

  const folioResult = {
    ...attachedFolio,
    'character-doc-id': attachedFolio['character-doc-id'] || rawElement.id || `char_${Date.now()}`,
    isPublic: Boolean(attachedFolio.isPublic),
    authorHandle: rawElement.authorHandle || attachedFolio.authorHandle || '',
    contributors: attachedFolio.contributors || [],
    ownerUid: rawElement.ownerUid || attachedFolio.ownerUid || '',

    // Identity & 5 Pillars
    'char-name': name,
    'char-concept': fields['char-concept'] || attachedFolio['char-concept'] || '',
    'char-archetype': fields['char-archetype'] || attachedFolio['char-archetype'] || '',
    'char-species': fields['char-species'] || attachedFolio['char-species'] || '',
    'char-occu': fields['char-occu'] || attachedFolio['char-occu'] || '',
    'char-secondary-occu': fields['char-secondary-occu'] || attachedFolio['char-secondary-occu'] || '',
    'char-origin': fields['char-origin'] || attachedFolio['char-origin'] || '',
    'char-secondary-origin': fields['char-secondary-origin'] || attachedFolio['char-secondary-origin'] || '',
    'char-faction': fields['char-faction'] || attachedFolio['char-faction'] || '',
    'char-size': fields['char-size'] || attachedFolio['char-size'] || 'Medium',
    'char-age': fields['char-age'] || attachedFolio['char-age'] || '',
    'char-gender': fields['char-gender'] || attachedFolio['char-gender'] || '',
    'char-height': fields['char-height'] || attachedFolio['char-height'] || '',
    'char-weight': fields['char-weight'] || attachedFolio['char-weight'] || '',
    'char-style': fields['char-style'] || attachedFolio['char-style'] || '',
    'char-motive': fields['char-motive'] || attachedFolio['char-motive'] || '',

    // MCM Alignment Metadata
    mcmTier: parseNum(fields.mcmTier ?? attachedFolio.mcmTier ?? attachedFolio.threatTier, 3),
    threatTier: parseNum(fields.mcmTier ?? attachedFolio.threatTier ?? attachedFolio.mcmTier, 3),
    mcmDesignation: fields.mcmDesignation || attachedFolio.mcmDesignation || attachedFolio.designation || 'Ally',
    designation: fields.mcmDesignation || attachedFolio.designation || attachedFolio.mcmDesignation || 'Ally',
    mcmRole: fields.mcmRole || attachedFolio.mcmRole || attachedFolio.competencyRole || 'Tank',
    competencyRole: fields.mcmRole || attachedFolio.competencyRole || attachedFolio.mcmRole || 'Tank',
    mcmBossType: fields.mcmBossType || attachedFolio.mcmBossType || attachedFolio.bossType || 'Standard',
    bossType: fields.mcmBossType || attachedFolio.bossType || attachedFolio.mcmBossType || 'Standard',
    tacticalBehaviors: Array.isArray(fields.tacticalBehaviors)
      ? fields.tacticalBehaviors
      : (typeof fields.tacticalBehaviors === 'string' && fields.tacticalBehaviors.trim()
          ? fields.tacticalBehaviors.split(',').map(s => s.trim()).filter(Boolean)
          : (attachedFolio.tacticalBehaviors || [])),
    npcRoutine: fields.npcRoutine || attachedFolio.npcRoutine || '',
    vttScript: fields.vttScript || attachedFolio.vttScript || '',
    is_ready_for_vtt: true,

    // Identity Pillar Allocation Pools & Skill Selections
    speciesAllocations: safeJsonParse(fields.speciesAllocations, attachedFolio.speciesAllocations || {}),
    occuAllocations: safeJsonParse(fields.occuAllocations, attachedFolio.occuAllocations || {}),
    originAllocations: safeJsonParse(fields.originAllocations, attachedFolio.originAllocations || {}),
    factionAllocations: safeJsonParse(fields.factionAllocations, attachedFolio.factionAllocations || {}),
    archetypeAllocations: safeJsonParse(fields.archetypeAllocations, attachedFolio.archetypeAllocations || {}),
    generalAllocations: safeJsonParse(fields.generalAllocations, attachedFolio.generalAllocations || {}),
    featureSkillSelections: safeJsonParse(fields.featureSkillSelections, attachedFolio.featureSkillSelections || {}),
    traitSkillSelections: safeJsonParse(fields.traitSkillSelections, attachedFolio.traitSkillSelections || {}),
    tracked_modifications: safeJsonParse(fields.tracked_modifications, attachedFolio.tracked_modifications || []),
    sub_attr_purchases: safeJsonParse(fields.sub_attr_purchases, attachedFolio.sub_attr_purchases || {}),

    // Vitals & Core Stats
    'starting-cp': parseNum(fields['starting-cp'] ?? attachedFolio['starting-cp'], 150),
    'base-tech-level': parseNum(fields['base-tech-level'] ?? attachedFolio['base-tech-level'], 3),
    'base-meta-level': parseNum(fields['base-meta-level'] ?? attachedFolio['base-meta-level'], 3),
    'tech-level': parseNum(fields['tech-level'] ?? attachedFolio['tech-level'], 3),
    'magic-level': parseNum(fields['magic-level'] ?? attachedFolio['magic-level'] ?? fields['meta-level'] ?? attachedFolio['meta-level'], 3),
    'meta-level': parseNum(fields['meta-level'] ?? attachedFolio['meta-level'] ?? fields['magic-level'] ?? attachedFolio['magic-level'], 3),
    'health': parseNum(fields.health ?? attachedFolio.health, 30),
    'vitality': parseNum(fields.vitality ?? attachedFolio.vitality, 30),
    'structure': parseNum(fields.structure ?? attachedFolio.structure, 60),
    'current_health': parseNum(fields.current_health ?? attachedFolio.current_health ?? fields.health ?? attachedFolio.health, 30),
    'current_vitality': parseNum(fields.current_vitality ?? attachedFolio.current_vitality ?? fields.vitality ?? attachedFolio.vitality, 30),
    'current_structure': parseNum(fields.current_structure ?? attachedFolio.current_structure ?? fields.structure ?? attachedFolio.structure, 60),
    'armor_dr': parseNum(fields.armorDR ?? fields.armor_dr ?? attachedFolio.armor_dr, 0),
    'karma': parseNum(fields.karma ?? attachedFolio.karma, 3),
    'plot-points': parseNum(fields['plot-points'] ?? attachedFolio['plot-points'], 0),
    'initiative-mod': parseNum(fields['initiative-mod'] ?? attachedFolio['initiative-mod'], 0),
    earned_ap: parseNum(fields.earned_ap ?? attachedFolio.earned_ap, 0),
    spent_ap: parseNum(fields.spent_ap ?? attachedFolio.spent_ap, 0),
    experience_debt: parseNum(fields.experience_debt ?? attachedFolio.experience_debt, 0),
    is_locked: Boolean(fields.is_locked ?? attachedFolio.is_locked ?? false),

    // 12 Attributes
    'attr-strength': parseNum(fields['attr-strength'] ?? attachedFolio['attr-strength'], 0),
    'attr-might': parseNum(fields['attr-might'] ?? attachedFolio['attr-might'], 2),
    'attr-agility': parseNum(fields['attr-agility'] ?? attachedFolio['attr-agility'], 0),
    'attr-reflex': parseNum(fields['attr-reflex'] ?? attachedFolio['attr-reflex'], 2),
    'attr-stamina': parseNum(fields['attr-stamina'] ?? attachedFolio['attr-stamina'], 0),
    'attr-fortitude': parseNum(fields['attr-fortitude'] ?? attachedFolio['attr-fortitude'], 2),
    'attr-intellect': parseNum(fields['attr-intellect'] ?? attachedFolio['attr-intellect'], 0),
    'attr-logic': parseNum(fields['attr-logic'] ?? attachedFolio['attr-logic'], 2),
    'attr-wisdom': parseNum(fields['attr-wisdom'] ?? attachedFolio['attr-wisdom'], 0),
    'attr-will': parseNum(fields['attr-will'] ?? attachedFolio['attr-will'], 2),
    'attr-charisma': parseNum(fields['attr-charisma'] ?? attachedFolio['attr-charisma'], 0),
    'attr-etiquette': parseNum(fields['attr-etiquette'] ?? attachedFolio['attr-etiquette'], 2),

    // Narrative & Lore (Synced with Persona Folio & AIME Layer 2 Core Traits)
    role: fields.role || fields.roleInStory || attachedFolio.role || '',
    summary: fields.summary || fields.oneLinePitch || attachedFolio.summary || '',
    primaryConflict: fields.primaryConflict || attachedFolio.primaryConflict || '',
    nicknames: fields.nicknames || attachedFolio.nicknames || '',
    socialClass: fields.socialClass || attachedFolio.socialClass || '',
    currentResidence: fields.currentResidence || attachedFolio.currentResidence || '',
    appearance: fields.appearance || fields.physicalDescription || attachedFolio.appearance || '',
    voice: fields.voice || attachedFolio.voice || '',
    clothing: fields.clothing || fields['char-style'] || attachedFolio.clothing || attachedFolio['char-style'] || '',
    mannerisms: fields.mannerisms || fields.personalityMannerisms || attachedFolio.mannerisms || '',
    positiveTraits: fields.positiveTraits || fields.strengthsFlaws || attachedFolio.positiveTraits || '',
    negativeTraits: fields.negativeTraits || attachedFolio.negativeTraits || '',
    likesDislikes: fields.likesDislikes || attachedFolio.likesDislikes || '',
    hobbies: fields.hobbies || attachedFolio.hobbies || '',
    personalityType: fields.personalityType || attachedFolio.personalityType || '',
    backstory: fields.backstory || fields.backgroundHistory || attachedFolio.backstory || '',
    definingTrauma: fields.definingTrauma || attachedFolio.definingTrauma || '',
    greatestAccomplishment: fields.greatestAccomplishment || attachedFolio.greatestAccomplishment || '',
    childhoodEvents: fields.childhoodEvents || attachedFolio.childhoodEvents || '',
    keyRelationships: fields.keyRelationships || fields.relationships || attachedFolio.keyRelationships || '',
    worldview: fields.worldview || attachedFolio.worldview || '',
    theLie: fields.theLie || attachedFolio.theLie || '',
    theTruth: fields.theTruth || attachedFolio.theTruth || '',
    deepestFear: fields.deepestFear || attachedFolio.deepestFear || '',
    goals: fields.goals || fields.goalsMotivations || attachedFolio.goals || '',
    stakes: fields.stakes || attachedFolio.stakes || '',
    stats: fields.stats || attachedFolio.stats || '',
    plotHooks: fields.plotHooks || attachedFolio.plotHooks || '',
    romanticHistory: fields.romanticHistory || attachedFolio.romanticHistory || '',
    tags: fields.tags || fields.keywords || attachedFolio.tags || '',
    content: rawElement.content || fields.narrativeProse || attachedFolio.content || attachedFolio.narrativeProse || '',
    narrativeProse: fields.narrativeProse || rawElement.content || attachedFolio.narrativeProse || attachedFolio.content || '',

    // Custom Fields, Scripting & AIME 3-Tier Architecture
    customFields: Array.isArray(rawElement.customFields)
      ? rawElement.customFields
      : safeJsonParse(fields.customFields, Array.isArray(attachedFolio.customFields) ? attachedFolio.customFields : []),
    guidance: (rawElement.guidance && typeof rawElement.guidance === 'object')
      ? rawElement.guidance
      : safeJsonParse(fields.guidance, (attachedFolio.guidance && typeof attachedFolio.guidance === 'object') ? attachedFolio.guidance : {}),
    assetHub: Array.isArray(rawElement.assetHub)
      ? rawElement.assetHub
      : safeJsonParse(fields.assetHub, Array.isArray(attachedFolio.assetHub) ? attachedFolio.assetHub : []),
    vttScriptActive: String(fields.vttScriptActive ?? attachedFolio.vttScriptActive ?? Boolean(fields.vttScript || attachedFolio.vttScript)),
    relationsStance: fields.relationsStance || attachedFolio.relationsStance || 'Hostile',
    vipTarget: fields.vipTarget || attachedFolio.vipTarget || '',
    rivalTarget: fields.rivalTarget || attachedFolio.rivalTarget || '',
    primaryTriggers: fields.primaryTriggers || attachedFolio.primaryTriggers || '',
    secondaryTriggers: fields.secondaryTriggers || attachedFolio.secondaryTriggers || '',
    triggerLogic: fields.triggerLogic || attachedFolio.triggerLogic || 'OR',
    speakerFilter: fields.speakerFilter || attachedFolio.speakerFilter || 'any',
    triggerRegex: fields.triggerRegex || attachedFolio.triggerRegex || '',
    loreScanPriority: parseNum(fields.loreScanPriority ?? attachedFolio.loreScanPriority, 50),
    loreBudgetTokens: parseNum(fields.loreBudgetTokens ?? attachedFolio.loreBudgetTokens, 250),
    loreRequireCondition: fields.loreRequireCondition || attachedFolio.loreRequireCondition || '',
    loreSuppressCondition: fields.loreSuppressCondition || attachedFolio.loreSuppressCondition || '',
    keywords: fields.keywords || attachedFolio.keywords || '',
    negative_keywords: fields.negative_keywords || attachedFolio.negative_keywords || '',

    // Structured Arrays & Media
    specializations: safeJsonParse(fields.specializations, attachedFolio.specializations || []),
    features: safeJsonParse(fields.features, attachedFolio.features || []),
    traits: safeJsonParse(fields.traits, attachedFolio.traits || []),
    disadvantages: safeJsonParse(fields.disadvantages, attachedFolio.disadvantages || []),
    hindrances: safeJsonParse(fields.hindrances, attachedFolio.hindrances || attachedFolio.disadvantages || []),
    augmentations: safeJsonParse(fields.augmentations, attachedFolio.augmentations || []),
    awakened: safeJsonParse(fields.awakened, attachedFolio.awakened || []),
    invocations: safeJsonParse(fields.invocations, attachedFolio.invocations || []),
    special_abilities: safeJsonParse(fields.special_abilities, attachedFolio.special_abilities || []),
    attacks: safeJsonParse(fields.attacks, attachedFolio.attacks || []),
    armor: safeJsonParse(fields.armor, attachedFolio.armor || []),
    gear: safeJsonParse(fields.gear, attachedFolio.gear || []),
    weapons: safeJsonParse(fields.weapons, attachedFolio.weapons || []),
    weaponry: safeJsonParse(fields.weaponry, attachedFolio.weaponry || attachedFolio.weapons || []),
    armoring: safeJsonParse(fields.armoring, attachedFolio.armoring || attachedFolio.armor || []),
    mecha: safeJsonParse(fields.mecha, attachedFolio.mecha || []),
    architecture: safeJsonParse(fields.architecture, attachedFolio.architecture || []),
    companions: safeJsonParse(fields.companions, attachedFolio.companions || []),
    other: safeJsonParse(fields.other, attachedFolio.other || []),
    notes: safeJsonParse(fields.notes, attachedFolio.notes || [{ text: '' }]),
    media: safeJsonParse(fields.media, attachedFolio.media || {}),
    imageUrl: rawElement.imageUrl || fields.portrait || attachedFolio.imageUrl || attachedFolio.portrait || '',
    portrait: fields.portrait || attachedFolio.portrait || rawElement.imageUrl || '',
    token: fields.token || attachedFolio.token || '',
    standee: fields.standee || attachedFolio.standee || '',
    gallery: safeJsonParse(fields.gallery, attachedFolio.gallery || [])
  };

  const allKeys = new Set([...Object.keys(attachedFolio), ...Object.keys(fields)]);
  allKeys.forEach(key => {
    if (key.startsWith('skill-')) {
      const val = fields[key] !== undefined ? fields[key] : attachedFolio[key];
      if (key.endsWith('-rank') || key.endsWith('-mod')) {
        folioResult[key] = parseNum(val, 0);
      } else {
        folioResult[key] = val;
      }
    }
  });

  folioResult.vttUnitData = buildVttUnitFromPersona(folioResult, { uniqueInstance: false });
  return folioResult;
};

export const sendMcmToFolioRoster = (mcmEntry, options = {}) => {
  if (!mcmEntry) return null;
  const folioPersona = convertMcmToFolioPersona(mcmEntry, {
    targetFolio: true,
    newDocId: options.createCopy !== false,
    isLocked: Boolean(options.lockForVtt)
  });
  if (!folioPersona) return null;

  folioPersona.folio_phase = options.lockForVtt ? 'tactical' : 'development';
  folioPersona.is_locked = Boolean(options.lockForVtt);
  folioPersona.is_ready_for_vtt = true;
  folioPersona.updatedAt = new Date().toISOString();

  try {
    if (typeof localStorage !== 'undefined') {
      const existingRaw = localStorage.getItem('personaRoster') || localStorage.getItem('tangent_folio_roster');
      let roster = [];
      if (existingRaw) {
        try {
          const parsed = JSON.parse(existingRaw);
          if (Array.isArray(parsed)) roster = parsed;
        } catch (e) {}
      }
      const docId = folioPersona['character-doc-id'] || folioPersona.id;
      const idx = roster.findIndex(p => (p['character-doc-id'] === docId || p.id === docId));
      if (idx >= 0) {
        roster[idx] = folioPersona;
      } else {
        roster.push(folioPersona);
      }
      localStorage.setItem('personaRoster', JSON.stringify(roster));
      localStorage.setItem('tangent_folio_roster', JSON.stringify(roster));
      if (options.activateInFolio !== false) {
        localStorage.setItem('personaFolioData', JSON.stringify(folioPersona));
        localStorage.setItem('tangent_folio_character', JSON.stringify(folioPersona));
        localStorage.setItem('tangent_pending_folio_import', JSON.stringify({
          persona: folioPersona,
          lockForVtt: Boolean(options.lockForVtt),
          activeTab: options.activeTab || 'identity',
          timestamp: Date.now()
        }));
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tangent-import-mcm-to-folio', {
        detail: {
          persona: folioPersona,
          options
        }
      }));
    }
  } catch (err) {
    console.warn('[personaBridge] Failed to persist MCM to Folio roster:', err);
  }

  return folioPersona;
};

export const exportStoryElementJSON = (characterData) => {
  if (!characterData) return;
  const elementObj = convertFolioToPersonaElement(characterData);
  const name = characterData['char-name'] || 'persona';
  const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
  const fileName = `${cleanName}-persona.json`;

  const payload = {
    type: "TangentStoryElement",
    version: "2.0",
    element: elementObj,
    linkedMap: null
  };

  const dataStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
