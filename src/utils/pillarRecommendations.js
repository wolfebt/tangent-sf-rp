import { DEFAULT_ARCHETYPES } from '../data/archetypesData.js';
import { DEFAULT_SPECIES } from '../data/speciesData.js';
import { DEFAULT_OCCUPATIONS } from '../data/occupationsData.js';
import { DEFAULT_ORIGINS } from '../data/originsData.js';
import { DEFAULT_FACTIONS } from '../data/factionsData.js';

/**
 * Canonical visual theme tokens for the 5 Identity Pillars
 * Archetype: Amber | Species: Cyan | Occupation: Sky | Origin: Emerald | Faction: Purple
 */
export const PILLAR_THEMES = {
  archetype: {
    id: 'archetype',
    label: 'Archetype',
    charKey: 'char-archetype',
    colorHex: '#f59e0b',
    dotClass: 'bg-amber-400 border border-amber-300/80 shadow-[0_0_5px_rgba(245,158,11,0.7)]',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
    textClass: 'text-amber-300'
  },
  species: {
    id: 'species',
    label: 'Species',
    charKey: 'char-species',
    colorHex: '#22d3ee',
    dotClass: 'bg-cyan-400 border border-cyan-300/80 shadow-[0_0_5px_rgba(34,211,238,0.7)]',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-600/70',
    textClass: 'text-cyan-300'
  },
  occupation: {
    id: 'occupation',
    label: 'Occupation',
    charKey: 'char-occu',
    colorHex: '#38bdf8',
    dotClass: 'bg-sky-400 border border-sky-300/80 shadow-[0_0_5px_rgba(56,189,248,0.7)]',
    badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-600/70',
    textClass: 'text-sky-300'
  },
  origin: {
    id: 'origin',
    label: 'Origin',
    charKey: 'char-origin',
    colorHex: '#34d399',
    dotClass: 'bg-emerald-400 border border-emerald-300/80 shadow-[0_0_5px_rgba(52,211,153,0.7)]',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70',
    textClass: 'text-emerald-300'
  },
  faction: {
    id: 'faction',
    label: 'Faction',
    charKey: 'char-faction',
    colorHex: '#c084fc',
    dotClass: 'bg-purple-400 border border-purple-300/80 shadow-[0_0_5px_rgba(192,132,252,0.7)]',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-600/70',
    textClass: 'text-purple-300'
  }
};

/**
 * Standardize feature and trait identifiers/names for resilient matching
 */
export const normalizeFeatureLookup = (raw) => {
  if (!raw) return '';
  const str = typeof raw === 'object' ? (raw.name || raw.title || raw.id || '') : String(raw);
  return str
    .replace(/^(feature|trait|hindrance|disadvantage)-/i, '')
    .replace(/[-_]/g, ' ')
    .trim()
    .toLowerCase();
};

/**
 * Detects whether a string or category refers to a recognized feature group
 */
export const extractCategoryKeywords = (rawStr) => {
  const s = String(rawStr || '').toLowerCase();
  const matched = new Set();

  const CATEGORY_MAP = [
    { key: 'combat', patterns: ['combat feature', 'combat features', 'combat'] },
    { key: 'ability', patterns: ['ability feature', 'ability features', 'physical feature', 'physical features', 'ability'] },
    { key: 'social', patterns: ['social feature', 'social features', 'social'] },
    { key: 'mental', patterns: ['mental feature', 'mental features', 'mental'] },
    { key: 'karma', patterns: ['karma feature', 'karma features', 'karma'] },
    { key: 'skill', patterns: ['skill feature', 'skill features', 'skill knacks'] },
    { key: 'general', patterns: ['general feature', 'general features', 'any feature', 'any features', 'general'] },
    { key: 'meta', patterns: ['meta feature', 'meta features', 'discipline feature', 'discipline features', 'metaphysics'] },
    { key: 'exotic', patterns: ['exotic feature', 'exotic features', 'exotic'] },
    { key: 'special', patterns: ['special ability', 'special abilities', 'special feature', 'special features'] },
    { key: 'acute senses', patterns: ['acute sense', 'acute senses', 'senses line'] }
  ];

  for (const entry of CATEGORY_MAP) {
    for (const pat of entry.patterns) {
      if (s.includes(pat)) {
        matched.add(entry.key);
        break;
      }
    }
  }

  return Array.from(matched);
};

/**
 * Add a raw item or string to a pillar's recommendation set and category set
 */
const addEntryToPillarSet = (featSet, catSet, rawItem) => {
  if (!rawItem) return;
  const rawStr = typeof rawItem === 'object' ? (rawItem.name || rawItem.title || rawItem.id || '') : String(rawItem);
  const clean = normalizeFeatureLookup(rawStr);
  if (clean) {
    featSet.add(clean);
    featSet.add(clean.replace(/\s+/g, ''));
  }

  // Also extract category group patterns if applicable
  const detectedCats = extractCategoryKeywords(rawStr);
  detectedCats.forEach(c => catSet.add(c));

  // If it's an object with category/type, record that category
  if (typeof rawItem === 'object') {
    if (rawItem.category) {
      const c = String(rawItem.category).toLowerCase().replace(/feature|features/g, '').trim();
      if (c) catSet.add(c);
    }
    if (rawItem.type) {
      const t = String(rawItem.type).toLowerCase().replace(/feature|features/g, '').trim();
      if (t) catSet.add(t);
    }
  }
};

/**
 * Extracts recommended feature sets and category group sets for all 5 Identity Pillars
 */
export const extractPillarFeatureSets = (characterData) => {
  if (!characterData) {
    return {
      archetype: { features: new Set(), categories: new Set(), source: '' },
      species: { features: new Set(), categories: new Set(), source: '' },
      occupation: { features: new Set(), categories: new Set(), source: '' },
      origin: { features: new Set(), categories: new Set(), source: '' },
      faction: { features: new Set(), categories: new Set(), source: '' }
    };
  }

  // 1. Archetype
  const archFeatures = new Set();
  const archCategories = new Set();
  const archName = characterData['char-archetype'];
  if (archName) {
    const arch = DEFAULT_ARCHETYPES.find(a => (a.name || a.id || '').toLowerCase() === String(archName).toLowerCase());
    if (arch) {
      if (Array.isArray(arch.signature_features)) {
        arch.signature_features.forEach(f => addEntryToPillarSet(archFeatures, archCategories, f));
      }
      if (Array.isArray(arch.features)) {
        arch.features.forEach(f => addEntryToPillarSet(archFeatures, archCategories, f));
      }
      if (Array.isArray(arch.recommended_features)) {
        arch.recommended_features.forEach(f => addEntryToPillarSet(archFeatures, archCategories, f));
      }
    }
  }

  // 2. Species
  const specFeatures = new Set();
  const specCategories = new Set();
  const specName = characterData['char-species'];
  if (specName) {
    const spec = DEFAULT_SPECIES.find(s => (s.name || s.title || s.id || '').toLowerCase() === String(specName).toLowerCase());
    if (spec) {
      if (Array.isArray(spec.inherent_features)) {
        spec.inherent_features.forEach(f => addEntryToPillarSet(specFeatures, specCategories, f));
      }
      if (Array.isArray(spec.recommended_features)) {
        spec.recommended_features.forEach(f => addEntryToPillarSet(specFeatures, specCategories, f));
      }
      if (Array.isArray(spec.bonus_feature_choices)) {
        spec.bonus_feature_choices.forEach(f => addEntryToPillarSet(specFeatures, specCategories, f));
      }
      if (Array.isArray(spec.features)) {
        spec.features.forEach(f => addEntryToPillarSet(specFeatures, specCategories, f));
      }
      if (Array.isArray(spec.traits)) {
        spec.traits.forEach(t => addEntryToPillarSet(specFeatures, specCategories, t));
      }
    }
  }
  const specAllocFeats = characterData.speciesAllocations?.features;
  if (Array.isArray(specAllocFeats)) {
    specAllocFeats.forEach(f => addEntryToPillarSet(specFeatures, specCategories, f));
  }
  const specAllocTraits = characterData.speciesAllocations?.traits;
  if (Array.isArray(specAllocTraits)) {
    specAllocTraits.forEach(t => addEntryToPillarSet(specFeatures, specCategories, t));
  }

  // 3. Occupation
  const occuFeatures = new Set();
  const occuCategories = new Set();
  const occuName = characterData['char-occu'];
  if (occuName) {
    const occu = DEFAULT_OCCUPATIONS.find(o => (o.name || o.id || '').toLowerCase() === String(occuName).toLowerCase());
    if (occu) {
      if (Array.isArray(occu.features)) {
        occu.features.forEach(f => addEntryToPillarSet(occuFeatures, occuCategories, f));
      }
      if (Array.isArray(occu.traits)) {
        occu.traits.forEach(t => addEntryToPillarSet(occuFeatures, occuCategories, t));
      }
    }
  }
  const occuAllocFeats = characterData.occuAllocations?.features;
  if (Array.isArray(occuAllocFeats)) {
    occuAllocFeats.forEach(f => addEntryToPillarSet(occuFeatures, occuCategories, f));
  }
  const occuAllocTraits = characterData.occuAllocations?.traits;
  if (Array.isArray(occuAllocTraits)) {
    occuAllocTraits.forEach(t => addEntryToPillarSet(occuFeatures, occuCategories, t));
  }

  // 4. Origin
  const origFeatures = new Set();
  const origCategories = new Set();
  const origName = characterData['char-origin'];
  if (origName) {
    const orig = DEFAULT_ORIGINS.find(o => (o.name || o.id || '').toLowerCase() === String(origName).toLowerCase());
    if (orig) {
      if (Array.isArray(orig.features)) {
        orig.features.forEach(f => addEntryToPillarSet(origFeatures, origCategories, f));
      }
      if (Array.isArray(orig.traits)) {
        orig.traits.forEach(t => addEntryToPillarSet(origFeatures, origCategories, t));
      }
    }
  }
  const origAllocFeats = characterData.originAllocations?.features;
  if (Array.isArray(origAllocFeats)) {
    origAllocFeats.forEach(f => addEntryToPillarSet(origFeatures, origCategories, f));
  }
  const origAllocTraits = characterData.originAllocations?.traits;
  if (Array.isArray(origAllocTraits)) {
    origAllocTraits.forEach(t => addEntryToPillarSet(origFeatures, origCategories, t));
  }

  // 5. Faction
  const facFeatures = new Set();
  const facCategories = new Set();
  const facName = characterData['char-faction'];
  if (facName) {
    const fac = DEFAULT_FACTIONS.find(f => (f.name || f.id || '').toLowerCase().includes(String(facName).toLowerCase()) || String(facName).toLowerCase().includes((f.name || f.id || '').toLowerCase()));
    if (fac) {
      if (Array.isArray(fac.features)) {
        fac.features.forEach(f => addEntryToPillarSet(facFeatures, facCategories, f));
      }
      if (Array.isArray(fac.traits)) {
        fac.traits.forEach(t => addEntryToPillarSet(facFeatures, facCategories, t));
      }
      if (Array.isArray(fac.skill_package)) {
        fac.skill_package.forEach(sp => addEntryToPillarSet(facFeatures, facCategories, sp));
      }
    }
  }
  const facAllocFeats = characterData.factionAllocations?.features;
  if (Array.isArray(facAllocFeats)) {
    facAllocFeats.forEach(f => addEntryToPillarSet(facFeatures, facCategories, f));
  }
  const facAllocTraits = characterData.factionAllocations?.traits;
  if (Array.isArray(facAllocTraits)) {
    facAllocTraits.forEach(t => addEntryToPillarSet(facFeatures, facCategories, t));
  }

  return {
    archetype: { features: archFeatures, categories: archCategories, source: archName || 'Archetype' },
    species: { features: specFeatures, categories: specCategories, source: specName || 'Species' },
    occupation: { features: occuFeatures, categories: occuCategories, source: occuName || 'Occupation' },
    origin: { features: origFeatures, categories: origCategories, source: origName || 'Origin' },
    faction: { features: facFeatures, categories: facCategories, source: facName || 'Faction' }
  };
};

/**
 * Checks if a specific feature, trait, or category group is recommended by a pillar
 */
export const checkItemMatchesPillar = (pillarData, itemOrGroup) => {
  if (!pillarData || (!pillarData.features.size && !pillarData.categories.size) || !itemOrGroup) {
    return false;
  }

  const { features, categories } = pillarData;

  // 1. If checking a Category Group string (e.g. group.type === 'Combat' or 'Combat Features')
  if (typeof itemOrGroup === 'string') {
    const sClean = normalizeFeatureLookup(itemOrGroup);
    const sNoSpace = sClean.replace(/\s+/g, '');
    if (features.has(sClean) || features.has(sNoSpace)) return true;

    const detected = extractCategoryKeywords(itemOrGroup);
    for (const d of detected) {
      if (categories.has(d)) return true;
    }

    for (const f of features) {
      if (f.length >= 4 && (sClean.includes(f) || f.includes(sClean))) return true;
    }
    return false;
  }

  // 2. Object item
  const rawName = itemOrGroup.name || itemOrGroup.title || itemOrGroup.id || '';
  const cleanName = normalizeFeatureLookup(rawName);
  const cleanNoSpace = cleanName.replace(/\s+/g, '');
  const rawId = normalizeFeatureLookup(itemOrGroup.id || '');

  // Exact feature match
  if (features.has(cleanName) || features.has(cleanNoSpace) || (rawId && features.has(rawId))) {
    return true;
  }

  // Substring fuzzy match
  for (const f of features) {
    if (f.length >= 4) {
      if (cleanName === f || (cleanName.startsWith(f) && f.length >= 4) || (f.startsWith(cleanName) && cleanName.length >= 4)) {
        return true;
      }
    }
  }

  // Category / Group match
  const itemCategory = (itemOrGroup.category || itemOrGroup.type || itemOrGroup.groupLabel || '').toLowerCase();
  const isCategoryGroup = itemOrGroup.type === 'Category Group' || (itemOrGroup.id && String(itemOrGroup.id).startsWith('cat_'));

  if (isCategoryGroup) {
    const cats = extractCategoryKeywords(rawName);
    for (const c of cats) {
      if (categories.has(c)) return true;
    }
  } else if (itemCategory) {
    const cats = extractCategoryKeywords(itemCategory);
    for (const c of cats) {
      if (categories.has(c)) return true;
    }
    // Acute Senses check
    if (categories.has('acute senses') && cleanName.includes('acute')) {
      return true;
    }
  }

  return false;
};

/**
 * Returns an array of recommending pillar descriptors for any feature or feature group
 */
export const getPillarFeatureRecommendations = (itemOrGroup, pillarSets, characterData) => {
  if (!pillarSets || !itemOrGroup) return [];

  const list = [];
  const pillarKeys = ['archetype', 'species', 'occupation', 'origin', 'faction'];

  for (const pKey of pillarKeys) {
    const pData = pillarSets[pKey];
    const theme = PILLAR_THEMES[pKey];
    if (checkItemMatchesPillar(pData, itemOrGroup)) {
      const sourceName = characterData?.[theme.charKey] || pData?.source || theme.label;
      list.push({
        id: theme.id,
        name: theme.label,
        detail: sourceName,
        dotClass: theme.dotClass,
        badgeClass: theme.badgeClass,
        textClass: theme.textClass,
        tooltip: `Recommended by ${theme.label}: ${sourceName}`
      });
    }
  }

  return list;
};
