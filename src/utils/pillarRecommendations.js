import { DEFAULT_ARCHETYPES } from '../data/archetypesData.js';
import { DEFAULT_SPECIES } from '../data/speciesData.js';
import { DEFAULT_OCCUPATIONS } from '../data/occupationsData.js';
import { DEFAULT_ORIGINS } from '../data/originsData.js';
import { DEFAULT_FACTIONS } from '../data/factionsData.js';
import { resolveCatalogItem } from '../engines/tangentIdentityEngine.js';

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
 * Known synonyms and knacks mapping archetype/background concepts to canonical features
 */
export const FEATURE_SYNONYMS = {
  'connections': ['connected', 'underworld connections', 'black market connections'],
  'connected': ['connections', 'underworld connections', 'black market connections'],
  'black market connections': ['underworld connections', 'connected', 'connections'],
  'underworld connections': ['black market connections', 'connected', 'connections'],
  'quick reflexes': ['lightning reflexes', 'combat reflexes'],
  'lightning reflexes': ['quick reflexes'],
  'field triage': ['medic'],
  'practiced pilot': ['crack pilot', 'gifted pilot', 'ace pilot'],
  'weapon master': ['weapon specialization', 'weapon focus'],
  'weapons expert': ['weapon specialization', 'weapon focus'],
  'market savvy': ['connected', 'silver tongue'],
  'cyber warfare': ['coding master', 'digital expert'],
  'digital ghost': ['digital expert', 'coding master'],
  'demolitionist': ['burst attack', 'heavy weapon mastery'],
  'acute senses': ['acute sense'],
  'acute sense': ['acute senses']
};

/**
 * Detects whether a string or category refers to a recognized feature group
 */
export const extractCategoryKeywords = (rawStr) => {
  const s = String(rawStr || '').toLowerCase().trim();
  const matched = new Set();

  const CATEGORY_MAP = [
    { key: 'combat', patterns: ['combat feature', 'combat features', 'combat'] },
    { key: 'ability', patterns: ['ability feature', 'ability features', 'physical feature', 'physical features', 'ability', 'physical'] },
    { key: 'social', patterns: ['social feature', 'social features', 'social'] },
    { key: 'mental', patterns: ['mental feature', 'mental features', 'mental'] },
    { key: 'karma', patterns: ['karma feature', 'karma features', 'karma'] },
    { key: 'skill', patterns: ['skill feature', 'skill features', 'skill knacks', 'skill'] },
    { key: 'general', patterns: ['general feature', 'general features', 'any feature', 'any features', 'general'] },
    { key: 'discipline', patterns: ['discipline feature', 'discipline features', 'discipline', 'meta feature', 'meta features', 'metaphysics', 'meta'] },
    { key: 'meta', patterns: ['meta feature', 'meta features', 'discipline feature', 'discipline features', 'metaphysics', 'discipline', 'meta'] },
    { key: 'exotic', patterns: ['exotic feature', 'exotic features', 'exotic'] },
    { key: 'special', patterns: ['special ability', 'special abilities', 'special feature', 'special features', 'special', 'racial feature', 'racial features', 'racial or special'] },
    { key: 'acute senses', patterns: ['acute sense', 'acute senses', 'senses line', 'sensory features', 'sensory feature', 'sensory'] },
    { key: 'augmentation', patterns: ['augmentation feature', 'augmentation features', 'augmentation', 'cybernetics', 'aug'] },
    { key: 'hindrance', patterns: ['hindrance', 'disadvantage', 'flaw'] }
  ];

  for (const entry of CATEGORY_MAP) {
    for (const pat of entry.patterns) {
      if (s === pat || s.includes(pat)) {
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

    // Also register known synonyms for this feature
    const synonyms = FEATURE_SYNONYMS[clean];
    if (Array.isArray(synonyms)) {
      synonyms.forEach(syn => {
        featSet.add(syn);
        featSet.add(syn.replace(/\s+/g, ''));
      });
    }
  }

  // Also extract category group patterns if applicable
  const detectedCats = extractCategoryKeywords(rawStr);
  detectedCats.forEach(c => catSet.add(c));

  // If it's an object with category/type, record that category
  if (typeof rawItem === 'object') {
    if (rawItem.category) {
      const c = String(rawItem.category).toLowerCase().replace(/feature|features/g, '').trim();
      if (c) {
        catSet.add(c);
        const moreCats = extractCategoryKeywords(c);
        moreCats.forEach(mc => catSet.add(mc));
      }
    }
    if (rawItem.type) {
      const t = String(rawItem.type).toLowerCase().replace(/feature|features/g, '').trim();
      if (t) {
        catSet.add(t);
        const moreCats = extractCategoryKeywords(t);
        moreCats.forEach(mc => catSet.add(mc));
      }
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
    const arch = resolveCatalogItem('archetypes', archName) || DEFAULT_ARCHETYPES.find(a => (a.name || a.id || '').toLowerCase() === String(archName).toLowerCase());
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
    const spec = resolveCatalogItem('species', specName) || DEFAULT_SPECIES.find(s => (s.name || s.title || s.id || '').toLowerCase() === String(specName).toLowerCase());
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
    const occu = resolveCatalogItem('occupations', occuName) || DEFAULT_OCCUPATIONS.find(o => (o.name || o.id || '').toLowerCase() === String(occuName).toLowerCase());
    if (occu) {
      if (Array.isArray(occu.recommended_features)) {
        occu.recommended_features.forEach(f => addEntryToPillarSet(occuFeatures, occuCategories, f));
      }
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
    const orig = resolveCatalogItem('origins', origName) || DEFAULT_ORIGINS.find(o => (o.name || o.id || '').toLowerCase() === String(origName).toLowerCase());
    if (orig) {
      if (Array.isArray(orig.recommended_features)) {
        orig.recommended_features.forEach(f => addEntryToPillarSet(origFeatures, origCategories, f));
      }
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
    const fac = resolveCatalogItem('factions', facName) || DEFAULT_FACTIONS.find(f => (f.name || f.id || '').toLowerCase().includes(String(facName).toLowerCase()) || String(facName).toLowerCase().includes((f.name || f.id || '').toLowerCase()));
    if (fac) {
      if (Array.isArray(fac.recommended_features)) {
        fac.recommended_features.forEach(f => addEntryToPillarSet(facFeatures, facCategories, f));
      }
      if (Array.isArray(fac.bonus_features)) {
        fac.bonus_features.forEach(f => addEntryToPillarSet(facFeatures, facCategories, f));
      }
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
/**
 * Checks if a specific feature, trait, or category group is recommended by a pillar.
 * Returns boolean for basic match, or detailed object when returnDetails is true.
 */
export const checkItemMatchesPillar = (pillarData, itemOrGroup, returnDetails = false) => {
  if (!pillarData || (!pillarData.features.size && !pillarData.categories.size) || !itemOrGroup) {
    return returnDetails ? { matches: false, count: 0, reasons: [] } : false;
  }

  const { features, categories } = pillarData;
  const reasons = [];

  // 1. If checking a Category Group string (e.g. group.type === 'Combat' or 'Combat Features')
  if (typeof itemOrGroup === 'string') {
    const sClean = normalizeFeatureLookup(itemOrGroup);
    const sNoSpace = sClean.replace(/\s+/g, '');
    let matched = false;

    if (features.has(sClean) || features.has(sNoSpace)) {
      matched = true;
      reasons.push('exact_feature');
    }

    const synonyms = FEATURE_SYNONYMS[sClean] || [];
    for (const syn of synonyms) {
      if (features.has(syn) || features.has(syn.replace(/\s+/g, ''))) {
        matched = true;
        reasons.push('synonym_feature');
        break;
      }
    }

    const detected = extractCategoryKeywords(itemOrGroup);
    for (const d of detected) {
      if (categories.has(d)) {
        matched = true;
        reasons.push(`category_${d}`);
        break;
      }
    }

    if (!matched) {
      for (const f of features) {
        if (f.length >= 4 && (sClean.includes(f) || f.includes(sClean))) {
          matched = true;
          reasons.push('fuzzy_feature');
          break;
        }
      }
    }

    if (returnDetails) {
      return { matches: matched, count: reasons.length > 0 ? 1 : 0, reasons };
    }
    return matched;
  }

  // 2. Object item
  const rawName = itemOrGroup.name || itemOrGroup.title || itemOrGroup.id || '';
  const cleanName = normalizeFeatureLookup(rawName);
  const cleanNoSpace = cleanName.replace(/\s+/g, '');
  const rawId = normalizeFeatureLookup(itemOrGroup.id || '');

  let hasIndividualMatch = false;

  // Exact feature match
  if (features.has(cleanName) || features.has(cleanNoSpace) || (rawId && features.has(rawId))) {
    hasIndividualMatch = true;
    reasons.push('individual_exact');
  }

  // Check synonyms
  if (!hasIndividualMatch) {
    const synonyms = FEATURE_SYNONYMS[cleanName] || [];
    for (const syn of synonyms) {
      if (features.has(syn) || features.has(syn.replace(/\s+/g, ''))) {
        hasIndividualMatch = true;
        reasons.push('individual_synonym');
        break;
      }
    }
  }

  // Substring fuzzy match
  if (!hasIndividualMatch) {
    for (const f of features) {
      if (f.length >= 4) {
        if (cleanName === f || (cleanName.startsWith(f) && f.length >= 4) || (f.startsWith(cleanName) && cleanName.length >= 4)) {
          hasIndividualMatch = true;
          reasons.push('individual_fuzzy');
          break;
        }
      }
    }
  }

  // Category / Group match
  let hasCategoryMatch = false;
  const itemCategory = (itemOrGroup.category || itemOrGroup.type || itemOrGroup.groupLabel || '').toLowerCase();
  const isCategoryGroup = itemOrGroup.type === 'Category Group' || (itemOrGroup.id && String(itemOrGroup.id).startsWith('cat_'));

  if (isCategoryGroup) {
    const cats = extractCategoryKeywords(rawName);
    for (const c of cats) {
      if (categories.has(c)) {
        hasCategoryMatch = true;
        reasons.push(`category_${c}`);
        break;
      }
    }
  } else if (itemCategory) {
    const cleanCat = itemCategory.replace(/features|feature/gi, '').trim().toLowerCase();
    if (categories.has(cleanCat)) {
      hasCategoryMatch = true;
      reasons.push(`category_${cleanCat}`);
    } else {
      const cats = extractCategoryKeywords(itemCategory);
      for (const c of cats) {
        if (categories.has(c)) {
          hasCategoryMatch = true;
          reasons.push(`category_${c}`);
          break;
        }
      }
    }
    // Acute Senses check
    if (!hasCategoryMatch && categories.has('acute senses') && cleanName.includes('acute')) {
      hasCategoryMatch = true;
      reasons.push('category_acute_senses');
    }
  }

  // A pillar can provide up to 2 distinct discount sources: individual recommendation + category recommendation
  let count = 0;
  if (hasIndividualMatch) count += 1;
  if (hasCategoryMatch) count += 1;

  if (returnDetails) {
    return {
      matches: count > 0,
      count,
      hasIndividualMatch,
      hasCategoryMatch,
      reasons
    };
  }

  return count > 0;
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
    const matchResult = checkItemMatchesPillar(pData, itemOrGroup, true);
    if (matchResult && matchResult.matches) {
      const sourceName = characterData?.[theme.charKey] || pData?.source || theme.label;
      const details = [];
      if (matchResult.hasIndividualMatch) details.push('Individually Recommended');
      if (matchResult.hasCategoryMatch) details.push('Recommended Category');
      const detailLabel = details.length > 0 ? `${sourceName} (${details.join(', ')})` : sourceName;

      list.push({
        id: theme.id,
        name: theme.label,
        detail: detailLabel,
        dotClass: theme.dotClass,
        badgeClass: theme.badgeClass,
        textClass: theme.textClass,
        discountCount: matchResult.count || 1,
        hasIndividualMatch: matchResult.hasIndividualMatch,
        hasCategoryMatch: matchResult.hasCategoryMatch,
        tooltip: `Recommended by ${theme.label}: ${detailLabel}`
      });
    }
  }

  return list;
};

/**
 * Calculates effective CP cost for a feature:
 * - Base cost is 3 CP (or feature.cp / costs.bp if specified)
 * - Each qualifying recommendation source (individual feature recommendation or recommended category across pillars)
 *   applies a -1 CP discount, stacking cumulatively down to the strict 1 CP minimum cost.
 * - Returns { baseCost, finalCost, totalDiscount, isDiscounted, recommendations }
 */
export const getFeatureDiscountedCost = (feature, pillarSets, characterData) => {
  if (!feature) {
    return { baseCost: 3, finalCost: 3, totalDiscount: 0, isDiscounted: false, recommendations: [] };
  }

  const rawCost = typeof feature === 'object'
    ? (feature.cp !== undefined ? feature.cp : (feature.costs?.bp !== undefined ? feature.costs.bp : 3))
    : 3;
  const baseCost = isNaN(Number(rawCost)) ? 3 : Number(rawCost);

  const recs = getPillarFeatureRecommendations(feature, pillarSets, characterData);
  
  // Total cumulative discounts = sum of discountCount from each recommending pillar
  const totalDiscounts = recs.reduce((sum, r) => sum + (r.discountCount || 1), 0);

  const finalCost = totalDiscounts > 0 ? Math.max(1, baseCost - totalDiscounts) : baseCost;
  const totalDiscount = baseCost - finalCost;
  const isDiscounted = totalDiscount > 0;

  return {
    baseCost,
    finalCost,
    cost: finalCost,
    totalDiscount,
    discountCount: totalDiscounts,
    isDiscounted,
    recommendations: recs
  };
};

