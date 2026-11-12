/**
 * ════════════════════════════════════════════════════════════════════════════════
 * CORTEX EXEMPLAR, BENCHMARK & REVERSE DEPENDENCY ENGINE
 * Zero-latency statistical peer benchmarking, non-destructive exemplar seeding,
 * and reverse relational impact scanning across live Omnicortex `dbData`.
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { normalizeStudioDomainKey } from '../studioPlaybooks.js';
import { ALL_CANONICAL_SKILLS, buildNormalizedSkillsCatalog } from '../../../../data/skillsData.js';
import { DEFAULT_FEATURES, buildNormalizedFeaturesCatalog } from '../../../../data/featuresData.js';
import { ALL_PILLAR_TRAITS, ALL_SPECIES_TRAITS } from '../../../../data/speciesTraitsData.js';
import { DEFAULT_ARCHETYPES } from '../../../../data/archetypesData.js';
import { DEFAULT_GEAR } from '../../../../data/gearData.js';

const CANONICAL_DOMAIN_FALLBACKS = {
  skills: ALL_CANONICAL_SKILLS,
  features: DEFAULT_FEATURES,
  traits: ALL_PILLAR_TRAITS,
  trait: ALL_SPECIES_TRAITS,
  archetypes: DEFAULT_ARCHETYPES,
  gear: DEFAULT_GEAR
};

const flattenGroupedSkillsIfNeeded = (val) => {
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'object') {
    const out = [];
    Object.values(val).forEach((groupList) => {
      if (!Array.isArray(groupList)) return;
      groupList.forEach((entry) => {
        if (entry && Array.isArray(entry.skills)) {
          out.push(...entry.skills);
        } else if (entry && typeof entry === 'object' && (entry.name || entry.id)) {
          out.push(entry);
        }
      });
    });
    return out;
  }
  return [];
};

const mergeUniqueByName = (primary = [], fallback = []) => {
  if (!fallback || fallback.length === 0) return primary;
  if (!primary || primary.length === 0) return fallback;
  const seen = new Set();
  const merged = [];
  for (const item of [...primary, ...fallback]) {
    if (!item || typeof item !== 'object') continue;
    const k = String(item.name || item.title || item.id || '').trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    merged.push(item);
  }
  return merged;
};

const DOMAIN_CATALOG_CANDIDATES = {
  weaponry: ['weaponry', 'weapons'],
  armoring: ['armoring', 'armor'],
  augmentations: ['augmentations', 'cybernetics'],
  gear: ['gear', 'equipment', 'personal_property'],
  mecha: ['mecha', 'vehicles'],
  architecture: ['architecture', 'facilities'],
  other: ['other', 'other_property'],
  species: ['species'],
  trait: ['trait', 'species_traits'],
  traits: ['traits'],
  species_lineage: ['species_lineage'],
  species_type: ['species_type'],
  species_size: ['species_size'],
  species_movement: ['species_movement'],
  factions: ['factions'],
  origins: ['origins'],
  occupations: ['occupations'],
  archetypes: ['archetypes'],
  skills: ['skills'],
  features: ['features'],
  disadvantages: ['disadvantages', 'species_disadvantages'],
  invocations: ['invocations', 'invocation'],
  special_abilities: ['special_abilities'],
  'meta-tech': ['meta-tech', 'gear', 'weaponry'],
  disciplines: ['disciplines'],
  modular_characters: ['modular_characters'],
  companions: ['companions'],
  planetary_design: ['planetary_design', 'world'],
  world: ['world', 'planetary_design'],
  universe: ['universe'],
  setting: ['setting'],
  philosophy: ['philosophy'],
  scene: ['scene'],
  societies: ['societies'],
  compendium: ['compendium'],
  user_guide: ['user_guide', 'compendium'],
  rules: ['rules', 'compendium'],
  conditions: ['conditions'],
  damage_types: ['damage_types'],
  maneuvers: ['maneuvers'],
  synthesis: ['synthesis']
};

const extractNumber = (val) => {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const m = val.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
    if (m) return parseFloat(m[0]);
  }
  return null;
};

const computeMedian = (nums) => {
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10;
};

/**
 * Resolves the live `dbData` array for a given Omnicortex/Codex domain key,
 * merging canonical seed catalogs for skills, features, traits, archetypes, and gear
 * so interactive catalog pickers are always populated offline and online.
 */
export function resolveCatalogForDomain(rawKey, dbData = {}) {
  const key = normalizeStudioDomainKey(rawKey);
  const candidates = DOMAIN_CATALOG_CANDIDATES[key] || [key];
  const canonicalFallback = CANONICAL_DOMAIN_FALLBACKS[key] || [];

  let liveItems = [];
  if (dbData && typeof dbData === 'object') {
    for (const cand of candidates) {
      const rawVal = dbData[cand];
      const extracted = key === 'skills' ? flattenGroupedSkillsIfNeeded(rawVal) : (Array.isArray(rawVal) ? rawVal : []);
      if (extracted.length > 0) {
        liveItems = extracted;
        break;
      }
    }
    if (liveItems.length === 0 && Array.isArray(dbData[rawKey])) {
      liveItems = dbData[rawKey];
    }
  }

  if (key === 'skills') {
    return buildNormalizedSkillsCatalog(liveItems, { includeSkillGroups: true });
  }
  if (key === 'features') {
    return buildNormalizedFeaturesCatalog(liveItems, { includeFeatureGroups: true });
  }
  return liveItems.length > 0 ? liveItems : canonicalFallback;
}

/**
 * Ranks and retrieves the closest canonical Omnicortex exemplars matching the active draft.
 */
export function findComparableCortexExemplars(formData = {}, rawKey = 'gear', dbData = {}, limit = 6) {
  const key = normalizeStudioDomainKey(rawKey);
  const catalog = resolveCatalogForDomain(key, dbData);
  if (!catalog.length) return [];

  const selfId = String(formData.id || '').toLowerCase().trim();
  const targetTL = extractNumber(formData.tech_level ?? formData.tl);
  const targetML = extractNumber(formData.meta_level ?? formData.ml);
  const targetCR = extractNumber(formData.craft_dc ?? formData.design_dc ?? formData.manifestation_dc ?? formData.dc);
  const targetLineage = String(formData.parent_species || '').toLowerCase().trim();
  const targetDiscipline = String(formData.discipline || '').toLowerCase().trim();
  const targetCategory = String(formData.category || formData.type || formData.habitat || formData.competencyRole || formData.role || '').toLowerCase().trim();
  const queryWords = String(formData.name || formData.description || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);

  const scored = [];

  for (const item of catalog) {
    if (!item || typeof item !== 'object') continue;
    const itemId = String(item.id || '').toLowerCase().trim();
    if (selfId && itemId === selfId) continue;

    let score = 10; // Base inclusion score so empty drafts still surface top canonical exemplars
    const reasons = [];

    const itemTL = extractNumber(item.tech_level ?? item.tl);
    if (targetTL !== null && itemTL !== null) {
      const diff = Math.abs(targetTL - itemTL);
      if (diff === 0) {
        score += 25;
        reasons.push(`TL ${itemTL}`);
      } else if (diff === 1) {
        score += 10;
      } else {
        score -= diff * 4;
      }
    }

    const itemML = extractNumber(item.meta_level ?? item.ml);
    if (targetML !== null && itemML !== null && (targetML > 0 || itemML > 0)) {
      const diff = Math.abs(targetML - itemML);
      if (diff === 0) {
        score += 18;
        if (itemML > 0) reasons.push(`ML ${itemML}`);
      } else if (diff === 1) {
        score += 6;
      }
    }

    if (targetLineage && String(item.parent_species || '').toLowerCase().includes(targetLineage.slice(0, 5))) {
      score += 30;
      reasons.push('Same Lineage');
    }

    if (targetDiscipline && String(item.discipline || '').toLowerCase() === targetDiscipline) {
      score += 30;
      reasons.push(item.discipline);
    }

    const itemCat = String(item.category || item.type || item.habitat || item.competencyRole || item.role || '').toLowerCase();
    if (targetCategory && itemCat && (itemCat.includes(targetCategory) || targetCategory.includes(itemCat))) {
      score += 22;
      reasons.push('Same Class');
    }

    const itemCR = extractNumber(item.craft_dc ?? item.design_dc ?? item.manifestation_dc ?? item.dc ?? item.costs?.dc);
    if (targetCR !== null && itemCR !== null) {
      const diff = Math.abs(targetCR - itemCR);
      if (diff <= 2) {
        score += 16;
        reasons.push(`CR ${itemCR}`);
      } else if (diff <= 5) {
        score += 8;
      }
    }

    if (queryWords.length > 0) {
      const hay = `${item.name || ''} ${item.title || ''} ${item.description || ''}`.toLowerCase();
      for (const w of queryWords) {
        if (hay.includes(w)) score += 6;
      }
    }

    scored.push({
      item,
      score,
      matchReasons: reasons.slice(0, 3)
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(1, limit));
}

/**
 * Computes statistical medians and ranges across comparable Cortex records.
 */
export function computeCortexStepBenchmarks(exemplars = [], rawKey = 'gear', fullCatalogCount = null) {
  const records = exemplars.map((e) => e?.item || e).filter(Boolean);
  const key = normalizeStudioDomainKey(rawKey);
  if (!records.length) {
    return {
      peerCount: 0,
      catalogCount: fullCatalogCount ?? 0,
      metrics: []
    };
  }

  const crs = [];
  const cps = [];
  const credits = [];
  const sockets = [];
  const drs = [];
  const damages = new Map();

  for (const r of records) {
    const cr = extractNumber(r.craft_dc ?? r.design_dc ?? r.manifestation_dc ?? r.dc ?? r.costs?.dc);
    if (cr !== null && cr > 0) crs.push(cr);

    const cp = extractNumber(r.cp ?? r.cost_cp ?? r.costs?.cp ?? r.costs?.bp ?? r.bp_chassis);
    if (cp !== null) cps.push(cp);

    const crVal = extractNumber(r.price ?? r.cost_credits ?? r.credits ?? r.costs?.credits ?? r.tsc_market_value);
    if (crVal !== null && crVal > 0) credits.push(crVal);

    const sock = extractNumber(r.total_sockets ?? r.sockets?.total ?? r.sockets_total);
    if (sock !== null && sock >= 0) sockets.push(sock);

    const dr = extractNumber(r.armorDR ?? r.armor_dr ?? r.dr ?? r.armor ?? r.resistance_value);
    if (dr !== null && dr > 0) drs.push(dr);

    if (typeof r.damage === 'string' && r.damage.trim()) {
      const cleanDmg = r.damage.trim().split(/\s+/)[0];
      damages.set(cleanDmg, (damages.get(cleanDmg) || 0) + 1);
    }
  }

  const metrics = [];

  if (crs.length > 0) {
    metrics.push({
      key: 'cr',
      label: key === 'invocations' || key === 'special_abilities' ? 'Median Cast CR' : 'Peer Cost/Craft CR',
      value: `CR ${computeMedian(crs)}`,
      sub: `Range ${Math.min(...crs)}–${Math.max(...crs)}`
    });
  }

  if (credits.length > 0) {
    const medCr = Math.round(computeMedian(credits));
    metrics.push({
      key: 'credits',
      label: 'Peer Market Value',
      value: `${medCr.toLocaleString()} Cr`,
      sub: `${Math.min(...credits).toLocaleString()}–${Math.max(...credits).toLocaleString()} Cr`
    });
  }

  if (cps.length > 0 && !['weaponry', 'armoring', 'gear', 'other'].includes(key)) {
    metrics.push({
      key: 'cp',
      label: 'Peer CP Budget',
      value: `${computeMedian(cps)} CP`,
      sub: `Range ${Math.min(...cps)}–${Math.max(...cps)} CP`
    });
  }

  if (damages.size > 0) {
    const topDamage = [...damages.entries()].sort((a, b) => b[1] - a[1])[0][0];
    metrics.push({
      key: 'damage',
      label: 'Typical Damage',
      value: topDamage,
      sub: `${damages.size} dice profile${damages.size === 1 ? '' : 's'}`
    });
  }

  if (drs.length > 0) {
    metrics.push({
      key: 'dr',
      label: 'Peer Armor DR',
      value: `DR ${computeMedian(drs)}`,
      sub: `Range ${Math.min(...drs)}–${Math.max(...drs)}`
    });
  }

  if (sockets.length > 0) {
    metrics.push({
      key: 'sockets',
      label: 'Typical Sockets',
      value: `${computeMedian(sockets)} Sock`,
      sub: `Range ${Math.min(...sockets)}–${Math.max(...sockets)}`
    });
  }

  return {
    peerCount: records.length,
    catalogCount: fullCatalogCount ?? records.length,
    metrics: metrics.slice(0, 4)
  };
}

/**
 * Scans Omnicortex collections to discover reverse dependencies referencing `targetItem`.
 */
export function findReverseCortexDependencies(targetItem = {}, rawDomainKey = '', dbData = {}, maxResults = 24) {
  if (!dbData || typeof dbData !== 'object') {
    return { totalCount: 0, byCollection: {}, sampleMatches: [] };
  }

  const targetName = String(targetItem.name || targetItem.title || '').trim().toLowerCase();
  const targetId = String(targetItem.id || '').trim().toLowerCase();
  if (!targetName && !targetId) {
    return { totalCount: 0, byCollection: {}, sampleMatches: [] };
  }

  const selfCollection = normalizeStudioDomainKey(rawDomainKey);
  const SCAN_COLLECTIONS = [
    'species',
    'factions',
    'origins',
    'occupations',
    'archetypes',
    'skills',
    'features',
    'traits',
    'disadvantages',
    'invocations',
    'special_abilities',
    'weaponry',
    'armoring',
    'augmentations',
    'gear',
    'mecha',
    'architecture',
    'modular_characters',
    'companions',
    'planetary_design',
    'world',
    'setting',
    'scene'
  ];

  let totalCount = 0;
  const byCollection = {};
  const sampleMatches = [];

  for (const col of SCAN_COLLECTIONS) {
    const entries = dbData[col];
    if (!Array.isArray(entries) || !entries.length) continue;

    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;
      if (col === selfCollection && String(entry.id || '').toLowerCase() === targetId) continue;

      // Fast serialized token check across relational arrays/strings
      const serialized = JSON.stringify(entry).toLowerCase();
      const matched =
        (targetId && targetId.length >= 4 && serialized.includes(`"${targetId}"`)) ||
        (targetName && targetName.length >= 3 && (
          serialized.includes(`"${targetName}"`) ||
          serialized.includes(targetName)
        ));

      if (matched) {
        totalCount += 1;
        byCollection[col] = (byCollection[col] || 0) + 1;
        if (sampleMatches.length < maxResults) {
          sampleMatches.push({
            id: entry.id,
            name: entry.name || entry.title || entry.id,
            collection: col
          });
        }
      }
    }
  }

  return {
    totalCount,
    byCollection,
    sampleMatches
  };
}

/**
 * Produces a non-destructive seed payload from a canonical Cortex exemplar.
 * Preserves user's entered `name` if already customized unless `overwriteIdentity` is true.
 */
export function buildSeedFromExemplar(exemplar = {}, currentFormData = {}, options = {}) {
  const { overwriteIdentity = false } = options;
  const safeCurrent = currentFormData && typeof currentFormData === 'object' ? currentFormData : {};
  const clone = JSON.parse(JSON.stringify(exemplar || {}));
  delete clone.id;
  delete clone.createdAt;
  delete clone.updatedAt;

  const existingName = String(safeCurrent.name || '').trim();
  const baseExemplarName = exemplar.name || exemplar.title || 'Blueprint';

  return {
    ...safeCurrent,
    ...clone,
    id: safeCurrent.id || undefined,
    name: (!overwriteIdentity && existingName) ? existingName : `${baseExemplarName} (Variant)`,
    seededFromExemplarId: exemplar.id || baseExemplarName
  };
}
