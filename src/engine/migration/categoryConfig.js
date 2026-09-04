/**
 * @file categoryConfig.js
 * @description Canonical 7-Tier Field Rendering Hierarchy & Category Configuration.
 * Enforces uniform ordering, grouping, and visual prioritization across all 35+ element schemas.
 */

export const HIERARCHY_TIERS = {
  TIER_1_IDENTITY: 1,
  TIER_2_VITALS: 2,
  TIER_3_ATTRIBUTES: 3,
  TIER_4_LOADOUT: 4,
  TIER_5_RELATIONS: 5,
  TIER_6_LORE: 6,
  TIER_7_METADATA: 7
};

export const TIER_DEFINITIONS = [
  {
    tier: HIERARCHY_TIERS.TIER_1_IDENTITY,
    name: 'Core Identity',
    description: 'Name, classification, archetype, and high-level premise.',
    fields: ['title', 'name', 'category', 'schemaType', 'summary', 'badge', 'icon']
  },
  {
    tier: HIERARCHY_TIERS.TIER_2_VITALS,
    name: 'Mechanical Vitals',
    description: 'HP, Kinetic/Energy Armor DR, Action Points, and movement rates.',
    fields: ['hp', 'maxHp', 'currentHp', 'kineticDr', 'energyDr', 'dr', 'ap', 'speed_ft', 'size']
  },
  {
    tier: HIERARCHY_TIERS.TIER_3_ATTRIBUTES,
    name: 'Attributes & Disciplines',
    description: 'Six core attributes, trained skill ranks, and Essence disciplines.',
    fields: ['attributes', 'skills', 'essenceRank', 'magicLevel', 'ml', 'traits']
  },
  {
    tier: HIERARCHY_TIERS.TIER_4_LOADOUT,
    name: 'Hardware & Loadout',
    description: 'Tech Level, equipped weapon profiles, cybernetics, and cargo/socket capacity.',
    fields: ['techLevel', 'tl', 'weapons', 'armor', 'gear', 'sockets', 'hardpoints', 'cargoCapacity']
  },
  {
    tier: HIERARCHY_TIERS.TIER_5_RELATIONS,
    name: 'Relational Graph',
    description: 'Linked factions, homeworlds, star systems, and associated NPC networks.',
    fields: ['factionId', 'speciesId', 'locationId', 'allies', 'adversaries', 'parentCampaign']
  },
  {
    tier: HIERARCHY_TIERS.TIER_6_LORE,
    name: 'Lore & Omnicortex Context',
    description: 'In-universe historical chronicles, classified intel, and atmospheric descriptions.',
    fields: ['content', 'canonicalLore', 'history', 'rumors', 'atmosphere', 'sensoryDirectives']
  },
  {
    tier: HIERARCHY_TIERS.TIER_7_METADATA,
    name: 'Metadata & Provenance',
    description: 'Author attribution, schema version, creation timestamp, and edit hash.',
    fields: ['id', 'creatorId', 'schemaVersion', 'createdAt', 'updatedAt', 'normalizedAt']
  }
];

/**
 * Returns the tier index (1-7) for a given field key.
 * @param {string} fieldKey - Field name
 * @returns {number} Tier number (1-7), defaults to 6 (Lore/Content)
 */
export function getFieldTier(fieldKey) {
  for (const def of TIER_DEFINITIONS) {
    if (def.fields.includes(fieldKey)) {
      return def.tier;
    }
  }
  return HIERARCHY_TIERS.TIER_6_LORE;
}

/**
 * Sorts an array of field keys according to the 7-tier canonical hierarchy.
 * @param {string[]} fieldKeys - List of field names
 * @returns {string[]} Sorted field keys
 */
export function sortFieldsByHierarchy(fieldKeys) {
  return [...fieldKeys].sort((a, b) => {
    const tierA = getFieldTier(a);
    const tierB = getFieldTier(b);
    if (tierA !== tierB) {
      return tierA - tierB;
    }
    return a.localeCompare(b);
  });
}

export default {
  HIERARCHY_TIERS,
  TIER_DEFINITIONS,
  getFieldTier,
  sortFieldsByHierarchy
};
