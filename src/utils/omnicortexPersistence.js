// ═══════════════════════════════════════════════════════════
// TANGENT SF RP — OMNICORTEX PERSISTENCE & MERGE ENGINE
// Authoritative local persistence and seed-merge mechanics
// for Omnicortex DBM, Asset Studio, and offline resilience.
// ═══════════════════════════════════════════════════════════

import { StorageService } from '../services/storageService.js';
import { DEFAULT_ARCHETYPES } from '../data/archetypesData.js';
import { DEFAULT_SPECIES } from '../data/speciesData.js';
import { DEFAULT_SPECIES_TYPES } from '../data/speciesTypesData.js';
import { DEFAULT_OCCUPATIONS } from '../data/occupationsData.js';
import { DEFAULT_ORIGINS } from '../data/originsData.js';
import { DEFAULT_FACTIONS } from '../data/factionsData.js';
import { DEFAULT_FEATURES } from '../data/featuresData.js';
import { ALL_SPECIES_TRAITS, ALL_PILLAR_TRAITS, ALL_CANONICAL_TRAITS } from '../data/speciesTraitsData.js';
import { ALL_CANONICAL_SKILLS } from '../data/skillsData.js';
import { DEFAULT_SPECIES_DISADVANTAGES } from '../data/speciesDisadvantagesData.js';
import { DEFAULT_WEAPONRY } from '../data/weaponryData.js';
import { DEFAULT_ARMORING } from '../data/armoringData.js';
import { DEFAULT_GEAR } from '../data/gearData.js';
import { DEFAULT_MECHA } from '../data/mechaData.js';
import { DEFAULT_ARCHITECTURE } from '../data/architectureData.js';
import { DEFAULT_OTHER_PROPERTY } from '../data/otherPropertyData.js';
import { DEFAULT_AUGMENTATIONS } from '../data/augmentationsData.js';
import { DEFAULT_INVOCATIONS } from '../data/invocationsData.js';
import { DEFAULT_SYNTHESIS } from '../data/synthesisData.js';
import { DEFAULT_SPECIES_SIZES } from '../data/speciesSizeData.js';
import { DEFAULT_SPECIES_MOVEMENT } from '../data/speciesMovementData.js';
import {
  DEFAULT_AUGMENTATION_TYPES,
  DEFAULT_BODY_LOCATIONS,
  DEFAULT_AREA_PATTERNS,
  DEFAULT_EFFECT_TYPES,
  DEFAULT_RANGES,
  DEFAULT_TARGET_SPECIFICATIONS,
  DEFAULT_CRITICAL_EFFECTS,
  DEFAULT_CRITICAL_SUCCESS_EFFECTS,
  DEFAULT_CRITICAL_FAILURE_EFFECTS,
  DEFAULT_MATERIALS,
  DEFAULT_RESISTANCES,
  DEFAULT_MODES,
  DEFAULT_SPECIALS,
  DEFAULT_AVAILABILITY,
  DEFAULT_GEAR_CATEGORIES,
  DEFAULT_CLASSIFICATIONS,
  DEFAULT_CREATORS,
  DEFAULT_DESIGNS,
  DEFAULT_COMPONENTS,
  DEFAULT_PREREQUISITES,
  DEFAULT_MODIFIERS,
  DEFAULT_SOCIETAL_ENTRIES,
  DEFAULT_TECHNOLOGY,
  DEFAULT_ECONOMATRIX,
  DEFAULT_CONDITIONS,
  DEFAULT_DAMAGE_TYPES,
  DEFAULT_DISCIPLINES,
  DEFAULT_MANEUVERS,
  DEFAULT_RULES,
  DEFAULT_MASTER_SOCIETIES
} from '../data/supportingCatalogsData.js';

import compendiumSeedData from '../data/compendiumSeed.json' with { type: 'json' };

let cachedCompendiumSeed = Array.isArray(compendiumSeedData) ? compendiumSeedData : [];
let compendiumSeedPromise = Promise.resolve(cachedCompendiumSeed);

export const loadCompendiumCatalog = async () => {
  if (cachedCompendiumSeed && cachedCompendiumSeed.length > 0) return cachedCompendiumSeed;
  return compendiumSeedPromise;
};

export const TOMBSTONES_KEY = 'omnicortex_deleted_entries';
export const CUSTOM_ENTRIES_KEY = 'omnicortex_custom_entries_v1';

export const getOmnicortexCustomEntries = () => {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(CUSTOM_ENTRIES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
  } catch (e) {
    return {};
  }
};

export const saveOmnicortexCustomEntry = (catKey, item) => {
  if (!catKey || !item) return;
  const docId = (item.id || '').toString().trim();
  if (!docId) return;

  try {
    const all = getOmnicortexCustomEntries();
    const catMap = all[catKey] || {};
    catMap[docId.toLowerCase()] = item;
    all[catKey] = catMap;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CUSTOM_ENTRIES_KEY, JSON.stringify(all));
    }
    if (typeof StorageService !== 'undefined' && StorageService?.setItem) {
      StorageService.setItem(CUSTOM_ENTRIES_KEY, all);
    }
  } catch (e) {
    console.warn('[omnicortexPersistence] Failed to persist custom entry to local storage:', e);
  }
};

export const removeOmnicortexCustomEntry = (catKey, docId) => {
  if (!docId) return;
  const idStr = docId.toString().trim().toLowerCase();
  try {
    const all = getOmnicortexCustomEntries();
    if (catKey && all[catKey]) {
      delete all[catKey][idStr];
    } else {
      Object.keys(all).forEach(k => {
        if (all[k] && all[k][idStr]) {
          delete all[k][idStr];
        }
      });
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CUSTOM_ENTRIES_KEY, JSON.stringify(all));
    }
    if (typeof StorageService !== 'undefined' && StorageService?.setItem) {
      StorageService.setItem(CUSTOM_ENTRIES_KEY, all);
    }
  } catch (e) {}
};

export const getOmnicortexTombstones = () => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(TOMBSTONES_KEY);
    if (!raw) return [];
    let list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    // Auto-heal: Purge any accidental tombstone for Coalition of Independent Worlds or canonical names
    const purged = list.filter(item => {
      const lower = (item || '').toString().toLowerCase().trim();
      return lower !== 'coalition of independent worlds' && lower !== 'faction-coalition';
    });
    if (purged.length !== list.length) {
      localStorage.setItem(TOMBSTONES_KEY, JSON.stringify(purged));
      if (typeof StorageService !== 'undefined' && StorageService?.setItem) {
        StorageService.setItem(TOMBSTONES_KEY, purged);
      }
    }
    return purged;
  } catch (e) {
    return [];
  }
};

export const addOmnicortexTombstone = (docId) => {
  try {
    if (!docId) return;
    const current = getOmnicortexTombstones();
    const set = new Set(current);
    set.add(docId.toString().toLowerCase().trim());
    const updated = Array.from(set);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOMBSTONES_KEY, JSON.stringify(updated));
    }
    if (typeof StorageService !== 'undefined' && StorageService?.setItem) {
      StorageService.setItem(TOMBSTONES_KEY, updated);
    }
  } catch (e) {}
};

export const removeOmnicortexTombstones = (identifiers) => {
  try {
    const toRemove = Array.isArray(identifiers) ? identifiers : [identifiers];
    const toRemoveSet = new Set(toRemove.map(x => (x || '').toString().toLowerCase().trim()).filter(Boolean));
    if (toRemoveSet.size === 0) return;
    const current = getOmnicortexTombstones();
    const updated = current.filter(item => !toRemoveSet.has((item || '').toString().toLowerCase().trim()));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOMBSTONES_KEY, JSON.stringify(updated));
    }
    if (typeof StorageService !== 'undefined' && StorageService?.setItem) {
      StorageService.setItem(TOMBSTONES_KEY, updated);
    }
  } catch (e) {}
};

export const clearOmnicortexTombstones = (catKey = null) => {
  try {
    if (!catKey) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(TOMBSTONES_KEY);
      }
      if (typeof StorageService !== 'undefined' && StorageService?.removeItem) {
        StorageService.removeItem(TOMBSTONES_KEY);
      }
    } else {
      const seeds = getFallbackSeedForCategory(catKey);
      if (seeds && seeds.length > 0) {
        const identifiers = seeds.flatMap(s => [s.id, s.name, s.title]).filter(Boolean);
        removeOmnicortexTombstones(identifiers);
      }
    }
  } catch (e) {}
};

export const isOmnicortexDeleted = (item, tombstones = null) => {
  if (!item) return false;
  const list = tombstones || getOmnicortexTombstones();
  if (!list || list.length === 0) return false;
  const set = new Set(list);
  const id = (item.id || '').toString().toLowerCase().trim();
  return Boolean(id && set.has(id));
};

export const filterInitialData = (dataList, catKey = null) => {
  const tombstones = getOmnicortexTombstones();
  if (!catKey) {
    return (dataList || []).filter(item => !isOmnicortexDeleted(item, tombstones));
  }
  return mergeSeedsWithDocs(dataList, catKey, tombstones);
};

export const mergeSeedsWithDocs = (docsList, catKey, tombstones = null) => {
  const currentTombstones = tombstones || getOmnicortexTombstones();
  if (catKey === 'compendium' || catKey === 'rules_codex') {
    const canonicalSeeds = getFallbackSeedForCategory('compendium');
    if (canonicalSeeds && canonicalSeeds.length > 0) {
      const customEntries = getOmnicortexCustomEntries()[catKey] || getOmnicortexCustomEntries()['compendium'] || {};
      const customById = new Map();
      Object.values(customEntries).forEach(entry => {
        if (entry && entry.id && !isOmnicortexDeleted(entry, currentTombstones)) {
          customById.set(entry.id.toString().toLowerCase().trim(), entry);
        }
      });
      (docsList || []).forEach(doc => {
        if (doc && doc.id && (doc.isCustom || doc.is_custom || String(doc.id).startsWith('entry_')) && !isOmnicortexDeleted(doc, currentTombstones)) {
          const dId = doc.id.toString().toLowerCase().trim();
          if (!customById.has(dId)) {
            customById.set(dId, doc);
          }
        }
      });

      const seedIds = new Set();
      const mergedSeeds = canonicalSeeds
        .filter(seed => !isOmnicortexDeleted(seed, currentTombstones))
        .map(seed => {
          const sId = (seed.id || '').toString().toLowerCase().trim();
          if (sId) seedIds.add(sId);
          return (sId && customById.has(sId)) ? { ...seed, ...customById.get(sId) } : seed;
        });

      const appendedCustom = [];
      customById.forEach((entry, cId) => {
        if (!seedIds.has(cId)) {
          appendedCustom.push(entry);
        }
      });

      return [...mergedSeeds, ...appendedCustom];
    }
  }
  let items = (docsList || []).filter(i => {
    if (isOmnicortexDeleted(i, currentTombstones)) return false;
    if (catKey === 'features') {
      if (i.trait_type === 'Species Trait' || i.category === 'Species Trait' || i.type === 'species_trait') return false;
      const cpVal = Number(i.cp ?? i.bp ?? 3);
      if ([1, 2, 4].includes(cpVal) && i.category !== 'Suggested Feature') return false;
    }
    if (catKey === 'trait' || catKey === 'species_traits') {
      if (['Origin Trait', 'Occupational Trait', 'Signature Trait', 'Archetype Trait', 'Faction Trait'].includes(i.trait_type)) return false;
    }
    if (catKey === 'traits') {
      if (i.trait_type === 'Species Trait') return false;
      if (String(i.id || '').startsWith('trait-') && !['Origin Trait', 'Occupational Trait', 'Signature Trait', 'Archetype Trait', 'Faction Trait'].includes(i.trait_type)) return false;
    }
    return true;
  });

  // Retrieve locally saved custom entries / modifications for this category
  const customEntries = catKey ? (getOmnicortexCustomEntries()[catKey] || {}) : {};
  const customEntryMap = new Map();
  Object.values(customEntries).forEach(entry => {
    if (entry && !isOmnicortexDeleted(entry, currentTombstones)) {
      if (entry.id) {
        customEntryMap.set(entry.id.toString().toLowerCase().trim(), entry);
      }
      if (entry.name) {
        customEntryMap.set(entry.name.toString().toLowerCase().trim(), entry);
      }
    }
  });

  // If a document was modified locally, prioritize the local custom entry
  items = items.map(doc => {
    if (!doc || typeof doc !== 'object') return doc;
    let resolvedDoc = doc;
    const docId = (doc.id || '').toString().toLowerCase().trim();
    if (docId && customEntryMap.has(docId)) {
      const customDoc = customEntryMap.get(docId);
      const docTime = doc.updatedAt ? new Date(doc.updatedAt).getTime() : 0;
      const customTime = customDoc.updatedAt ? new Date(customDoc.updatedAt).getTime() : 0;
      resolvedDoc = (customTime >= docTime) ? customDoc : doc;
    } else {
      const docName = (doc.name || '').toString().toLowerCase().trim();
      if (docName && customEntryMap.has(docName)) {
        const customDoc = customEntryMap.get(docName);
        const docTime = doc.updatedAt ? new Date(doc.updatedAt).getTime() : 0;
        const customTime = customDoc.updatedAt ? new Date(customDoc.updatedAt).getTime() : 0;
        resolvedDoc = (customTime >= docTime) ? customDoc : doc;
      }
    }
    if (catKey === 'traits' && resolvedDoc.trait_type === 'Signature Trait') {
      resolvedDoc = { ...resolvedDoc, trait_type: 'Archetype Trait' };
    }
    return resolvedDoc;
  });

  const fallbackSeeds = getFallbackSeedForCategory(catKey);
  if (fallbackSeeds && fallbackSeeds.length > 0) {
    const normalizeShortName = (val) =>
      String(val || '')
        .toLowerCase()
        .replace(/\s*\(.*?\)\s*/g, '')
        .replace(/\s+human$/i, '')
        .trim();

    const seedMap = new Map();
    fallbackSeeds.forEach(seed => {
      if (seed.id) {
        const sId = seed.id.toString().toLowerCase().trim();
        seedMap.set(sId, seed);
      }
      if (seed.name) {
        const sName = seed.name.toString().toLowerCase().trim();
        seedMap.set(sName, seed);
        const shortName = normalizeShortName(sName);
        if (shortName && !seedMap.has(shortName)) {
          seedMap.set(shortName, seed);
        }
      }
      if (seed.title) {
        const sTitle = seed.title.toString().toLowerCase().trim();
        seedMap.set(sTitle, seed);
        const shortTitle = normalizeShortName(sTitle);
        if (shortTitle && !seedMap.has(shortTitle)) {
          seedMap.set(shortTitle, seed);
        }
      }
    });

    // Hydrate existing docs with newly added schema fields and recommendations if missing or empty in Firestore/local storage
    items = items.map(doc => {
      if (!doc || typeof doc !== 'object') return doc;
      const docId = (doc.id || '').toString().toLowerCase().trim();
      // If doc is a local custom entry, preserve user's exact customized content without seed backfills
      if (docId && customEntryMap.has(docId)) return doc;

      const docName = (doc.name || '').toString().toLowerCase().trim();
      const docTitle = (doc.title || '').toString().toLowerCase().trim();
      const shortDocName = normalizeShortName(docName || docTitle);
      const matchingSeed = seedMap.get(docId) ||
        (docName ? seedMap.get(docName) : null) ||
        (docTitle ? seedMap.get(docTitle) : null) ||
        (shortDocName ? seedMap.get(shortDocName) : null);
      if (!matchingSeed) return doc;

      let enriched = { ...doc };

      // Array fields to backfill if empty or missing in the doc
      const arrayFields = [
        'recommended_factions',
        'recommended_origins',
        'recommended_occupations',
        'recommended_species',
        'recommended_skills',
        'recommended_features',
        'recommended_tl',
        'recommended_ml',
        'inherent_attribute_modifiers',
        'specific_skill_bonuses',
        'bonus_skill_choices',
        'inherent_features',
        'bonus_feature_choices',
        'signature_traits',
        'traits',
        'species_traits',
        'movement_modes',
        'movement',
        'disadvantages',
        'hindrances'
      ];

      for (const field of arrayFields) {
        const docVal = doc[field];
        const seedVal = matchingSeed[field];
        const hasDocVal = Array.isArray(docVal) ? docVal.length > 0 : Boolean(docVal);
        const hasSeedVal = Array.isArray(seedVal) ? seedVal.length > 0 : Boolean(seedVal);
        if (!hasDocVal && hasSeedVal) {
          enriched[field] = seedVal;
        }
      }

      if ((catKey === 'species' || catKey === 'char-species') && matchingSeed) {
        if (!enriched.type && matchingSeed.type) enriched.type = matchingSeed.type;
        if (!enriched.species_type && (matchingSeed.species_type || matchingSeed.type)) {
          enriched.species_type = matchingSeed.species_type || matchingSeed.type;
        }
        if (!enriched.size && matchingSeed.size) enriched.size = matchingSeed.size;
        if (!enriched.species_size && (matchingSeed.species_size || matchingSeed.size)) {
          enriched.species_size = matchingSeed.species_size || matchingSeed.size;
        }
        if (!enriched.social_stigma && (matchingSeed.social_stigma || matchingSeed.stigma)) {
          enriched.social_stigma = matchingSeed.social_stigma || matchingSeed.stigma;
        }
        if ((!enriched.bonus_attribute_points || Number(enriched.bonus_attribute_points) === 0) && Number(matchingSeed.bonus_attribute_points) > 0) {
          enriched.bonus_attribute_points = matchingSeed.bonus_attribute_points;
        }
        if ((!enriched.bonus_skills || Number(enriched.bonus_skills) === 0) && Number(matchingSeed.bonus_skills) > 0) {
          enriched.bonus_skills = matchingSeed.bonus_skills;
        }
        if ((!enriched.bonus_features || Number(enriched.bonus_features) === 0) && Number(matchingSeed.bonus_features) > 0) {
          enriched.bonus_features = matchingSeed.bonus_features;
        }
        if ((!Array.isArray(enriched.modifiers) || enriched.modifiers.length === 0) && Array.isArray(matchingSeed.modifiers) && matchingSeed.modifiers.length > 0) {
          enriched.modifiers = matchingSeed.modifiers;
        }
        if ((!enriched.cp || Number(enriched.cp) === 0) && Number(matchingSeed.cp) > 0) {
          enriched.cp = matchingSeed.cp;
          enriched.bp = matchingSeed.bp ?? matchingSeed.cp;
          enriched.cp_cost = matchingSeed.cp_cost ?? matchingSeed.cp;
          enriched.costs = { ...(matchingSeed.costs || {}), ...(enriched.costs || {}), cp: matchingSeed.cp, bp: matchingSeed.bp ?? matchingSeed.cp };
        }
        if (docId === 'species-gene-digon') {
          enriched.size = matchingSeed.size;
          enriched.modifiers = matchingSeed.modifiers;
          enriched.cp = matchingSeed.cp;
          enriched.bp = matchingSeed.bp;
          enriched.cp_cost = matchingSeed.cp_cost;
          enriched.costs = matchingSeed.costs;
        }
      }

      // String fields to backfill if empty or missing in the doc
      const stringFields = [
        'keywords',
        'negative_keywords',
        'discipline',
        'sphere',
        'subdiscipline',
        'stigma',
        'homeworld'
      ];

      for (const field of stringFields) {
        const docVal = (doc[field] !== undefined && doc[field] !== null) ? String(doc[field]).trim() : '';
        const seedVal = (matchingSeed[field] !== undefined && matchingSeed[field] !== null) ? String(matchingSeed[field]).trim() : '';
        if (!docVal && seedVal) {
          enriched[field] = matchingSeed[field];
        }
      }

      if (catKey === 'skills' && matchingSeed) {
        enriched.description = matchingSeed.description || enriched.description;
        enriched.governing_attribute = matchingSeed.governing_attribute || enriched.governing_attribute;
        enriched.mechanic = matchingSeed.mechanic || enriched.mechanic;
        enriched.specialties = matchingSeed.specialties || enriched.specialties;
        enriched.specialty_details = matchingSeed.specialty_details || enriched.specialty_details;
        enriched.full_text = matchingSeed.full_text || enriched.full_text;
        enriched.type = matchingSeed.type || enriched.type;
        enriched.subtype = matchingSeed.subtype || matchingSeed.subcategory || enriched.subtype;
        enriched.subcategory = matchingSeed.subcategory || enriched.subcategory;
        enriched.categoryLabel = matchingSeed.categoryLabel || enriched.categoryLabel;
      }

      if (catKey === 'features' && matchingSeed) {
        enriched.description = matchingSeed.description || enriched.description;
        enriched.mechanic = matchingSeed.mechanic || enriched.mechanic;
        enriched.mechanics = matchingSeed.mechanics || matchingSeed.mechanic || enriched.mechanics;
        enriched.rules = matchingSeed.rules !== undefined ? matchingSeed.rules : enriched.rules;
        enriched.special_rules = matchingSeed.special_rules !== undefined ? matchingSeed.special_rules : enriched.special_rules;
        enriched.prerequisites = matchingSeed.prerequisites || enriched.prerequisites;
        enriched.prerequisite_text = matchingSeed.prerequisite_text || matchingSeed.prerequisites || enriched.prerequisite_text;
        enriched.body = matchingSeed.body || enriched.body;
        enriched.full_text = matchingSeed.full_text || matchingSeed.body || enriched.full_text;
        enriched.category = matchingSeed.category || enriched.category;
        enriched.type = matchingSeed.type || enriched.type;
        enriched.cp = matchingSeed.cp ?? enriched.cp ?? 3;
        enriched.bp = matchingSeed.bp ?? enriched.bp ?? 3;
        enriched.is_ranked = matchingSeed.is_ranked ?? enriched.is_ranked;
        enriched.is_multiple = matchingSeed.is_multiple ?? enriched.is_multiple;
        enriched.modifiers = (Array.isArray(matchingSeed.modifiers) && matchingSeed.modifiers.length > 0)
          ? matchingSeed.modifiers
          : enriched.modifiers;
        enriched.notes = matchingSeed.notes !== undefined ? matchingSeed.notes : enriched.notes;
        enriched.notesList = matchingSeed.notesList || enriched.notesList;
      }

      if (['weaponry', 'weapons', 'armoring', 'armor', 'gear', 'equipment', 'mecha', 'architecture', 'other', 'augmentations'].includes(catKey) && matchingSeed) {
        const docCredits = Number(doc.costs?.credits || doc.cost || 0);
        const seedCredits = Number(matchingSeed.costs?.credits || matchingSeed.cost || 0);
        const docHasValidDc = doc.craft_dc !== undefined && doc.craft_dc !== null && doc.craft_dc !== '' && (Number(doc.craft_dc) > 0 || seedCredits <= 10);

        if (!docHasValidDc || (docCredits === 0 && seedCredits > 0)) {
          enriched.craft_dc = matchingSeed.craft_dc ?? matchingSeed.design_dc ?? enriched.craft_dc;
          enriched.design_dc = matchingSeed.design_dc ?? matchingSeed.craft_dc ?? enriched.design_dc;
          enriched.base_dc = matchingSeed.base_dc ?? matchingSeed.craft_dc ?? enriched.base_dc;
          enriched.cost = seedCredits || enriched.cost;
          enriched.costs = {
            ...(matchingSeed.costs || {}),
            ...(doc.costs || {}),
            credits: seedCredits || docCredits
          };
        }

        if ((!enriched.tech_level || Number(enriched.tech_level) === 0) && matchingSeed.tech_level) {
          enriched.tech_level = matchingSeed.tech_level;
        }
        if ((!enriched.sockets || !enriched.sockets.max) && matchingSeed.sockets?.max > 0) {
          enriched.sockets = { ...matchingSeed.sockets, ...(doc.sockets || {}), max: matchingSeed.sockets.max };
        }
        if (catKey === 'weaponry' || catKey === 'weapons') {
          enriched.weapon_type = matchingSeed.weapon_type || enriched.weapon_type;
          enriched.classification = matchingSeed.classification || enriched.classification;
          enriched.damage = matchingSeed.damage || enriched.damage;
          enriched.damage_type = matchingSeed.damage_type || enriched.damage_type;
          enriched.range = matchingSeed.range || enriched.range;
          enriched.ammo = matchingSeed.ammo || enriched.ammo;
          enriched.ammunition = matchingSeed.ammunition || enriched.ammunition;
          enriched.wielding = matchingSeed.wielding || enriched.wielding;
          enriched.size = matchingSeed.size || enriched.size;
          enriched.special = matchingSeed.special || enriched.special;
          enriched.description = matchingSeed.description || enriched.description;
          enriched.mechanic = matchingSeed.mechanic || enriched.mechanic;
        }
        if (catKey === 'armoring' || catKey === 'armor') {
          enriched.category = matchingSeed.category || enriched.category;
          enriched.armor_class = matchingSeed.armor_class || matchingSeed.category || enriched.armor_class;
          enriched.armor_type = matchingSeed.armor_type || enriched.armor_type;
          enriched.dr = matchingSeed.dr ?? enriched.dr;
          enriched.sp = matchingSeed.sp ?? enriched.sp;
          enriched.durability = matchingSeed.durability ?? enriched.durability;
          enriched.body_locations = matchingSeed.body_locations || enriched.body_locations;
          enriched.coverage = matchingSeed.coverage || enriched.coverage;
          enriched.mobility_penalty = matchingSeed.mobility_penalty ?? enriched.mobility_penalty;
          enriched.description = matchingSeed.description || enriched.description;
          enriched.mechanic = matchingSeed.mechanic || enriched.mechanic;
        }
        if (catKey === 'gear' || catKey === 'equipment' || catKey === 'mecha' || catKey === 'architecture' || catKey === 'other') {
          enriched.description = matchingSeed.description || enriched.description;
          enriched.mechanic = matchingSeed.mechanic || enriched.mechanic;
          enriched.sp = matchingSeed.sp ?? enriched.sp;
          enriched.dr = matchingSeed.dr ?? enriched.dr;
        }
        if (catKey === 'augmentations') {
          enriched.nodes = matchingSeed.nodes ?? enriched.nodes;
          enriched.location = matchingSeed.location || enriched.location;
          enriched.body_location = matchingSeed.body_location || matchingSeed.location || enriched.body_location;
          enriched.subcategory = matchingSeed.subcategory || enriched.subcategory;
          if (matchingSeed.costs?.nodes > 0 && !(enriched.costs?.nodes > 0)) {
            enriched.costs = { ...(matchingSeed.costs || {}), ...(enriched.costs || {}), nodes: matchingSeed.costs.nodes };
          }
          if (matchingSeed.costs?.cp > 0 && !(enriched.costs?.cp > 0)) {
            enriched.costs = { ...(matchingSeed.costs || {}), ...(enriched.costs || {}), cp: matchingSeed.costs.cp, bp: matchingSeed.costs.bp ?? matchingSeed.costs.cp };
          }
        }
      }

      if (catKey === 'compendium' && matchingSeed) {
        enriched.description = matchingSeed.description;
        enriched.name = matchingSeed.name || enriched.name;
        enriched.fileName = matchingSeed.fileName || enriched.fileName;
        enriched.relPath = matchingSeed.relPath || enriched.relPath;
        enriched.subfolder = matchingSeed.subfolder || enriched.subfolder;
        enriched.isMasterDoc = matchingSeed.isMasterDoc ?? enriched.isMasterDoc;
        enriched.masterDocId = matchingSeed.masterDocId || enriched.masterDocId;
        enriched.category = matchingSeed.category || enriched.category;
        enriched.entry_type = matchingSeed.entry_type || enriched.entry_type;
        enriched.parent = matchingSeed.parent || enriched.parent;
        enriched.order = matchingSeed.order ?? enriched.order;
        enriched.mechanic = (matchingSeed.mechanic !== undefined ? matchingSeed.mechanic : enriched.mechanic) || '';
        enriched.guide = (matchingSeed.guide !== undefined ? matchingSeed.guide : enriched.guide) || '';
        enriched.note = (matchingSeed.note !== undefined ? matchingSeed.note : enriched.note) || '';
        if (typeof enriched.mechanic === 'string' && enriched.mechanic.startsWith('See full canonical text')) enriched.mechanic = '';
        if (typeof enriched.guide === 'string' && enriched.guide.includes('in the game rules library for complete')) enriched.guide = '';
        if (typeof enriched.note === 'string' && enriched.note.includes('Complete, unabridged source of truth')) enriched.note = '';
        enriched.tags = matchingSeed.tags || enriched.tags;
        enriched.updatedAt = matchingSeed.updatedAt || enriched.updatedAt;
      }

      return enriched;
    });

    if (catKey === 'compendium' && fallbackSeeds.length > 0) {
      const allowedSeedIds = new Set(fallbackSeeds.map(s => (s.id || '').toString().toLowerCase().trim()));
      items = items.filter(item => {
        const id = (item.id || '').toString().toLowerCase().trim();
        return allowedSeedIds.has(id) || customEntryMap.has(id) || Boolean(item.isCustom || item.is_custom || id.startsWith('entry_'));
      });
    }

    const existingIds = new Set(items.map(i => (i.id || '').toString().toLowerCase().trim()));
    const missingSeeds = fallbackSeeds.filter(seed => {
      if (isOmnicortexDeleted(seed, currentTombstones)) return false;
      const sId = (seed.id || '').toString().toLowerCase().trim();
      if (sId && existingIds.has(sId)) return false;
      return true;
    }).map(seed => {
      const sId = (seed.id || '').toString().toLowerCase().trim();
      if (sId && customEntryMap.has(sId)) {
        return customEntryMap.get(sId);
      }
      const sName = (seed.name || '').toString().toLowerCase().trim();
      if (sName && customEntryMap.has(sName)) {
        return customEntryMap.get(sName);
      }
      return seed;
    });

    if (missingSeeds.length > 0) {
      items = [...items, ...missingSeeds];
    }
  }

  // Any custom entries that were not in docsList or seeds (e.g. brand new custom species created by user)
  const allCurrentIds = new Set(items.map(i => (i.id || '').toString().toLowerCase().trim()));
  Object.values(customEntries).forEach(entry => {
    if (!entry || isOmnicortexDeleted(entry, currentTombstones)) return;
    const entryId = (entry.id || '').toString().toLowerCase().trim();
    if (entryId && !allCurrentIds.has(entryId)) {
      items.push(entry);
      allCurrentIds.add(entryId);
    }
  });

  return items;
};

export const getFallbackSeedForCategory = (catK) => {
  if (catK === 'compendium' || catK === 'rules_codex') return cachedCompendiumSeed || [];
  if (catK === 'archetypes' || catK === 'char-archetype') return DEFAULT_ARCHETYPES;
  if (catK === 'species' || catK === 'char-species') return DEFAULT_SPECIES;
  if (catK === 'species_type') return DEFAULT_SPECIES_TYPES;
  if (catK === 'species_size') return DEFAULT_SPECIES_SIZES;
  if (catK === 'species_movement') return DEFAULT_SPECIES_MOVEMENT;
  if (catK === 'occupations' || catK === 'char-occu') return DEFAULT_OCCUPATIONS;
  if (catK === 'origins' || catK === 'char-origin') return DEFAULT_ORIGINS;
  if (catK === 'factions' || catK === 'char-faction') return DEFAULT_FACTIONS;
  if (catK === 'features') return DEFAULT_FEATURES;
  if (catK === 'trait' || catK === 'species_traits') return ALL_SPECIES_TRAITS;
  if (catK === 'traits') return ALL_PILLAR_TRAITS;
  if (catK === 'skills') return ALL_CANONICAL_SKILLS;
  if (catK === 'disadvantages') return DEFAULT_SPECIES_DISADVANTAGES;
  if (catK === 'weaponry' || catK === 'weapons') return DEFAULT_WEAPONRY;
  if (catK === 'armoring' || catK === 'armor') return DEFAULT_ARMORING;
  if (catK === 'gear' || catK === 'equipment') return DEFAULT_GEAR;
  if (catK === 'mecha') return DEFAULT_MECHA;
  if (catK === 'architecture') return DEFAULT_ARCHITECTURE;
  if (catK === 'other' || catK === 'other_property') return DEFAULT_OTHER_PROPERTY;
  if (catK === 'augmentations') return DEFAULT_AUGMENTATIONS;
  if (catK === 'invocations') return DEFAULT_INVOCATIONS;
  if (catK === 'synthesis') return DEFAULT_SYNTHESIS;

  // Supporting & Developer Reference Categories
  if (catK === 'disciplines' || catK === 'discipline') return DEFAULT_DISCIPLINES;
  if (catK === 'augmentation_type') return DEFAULT_AUGMENTATION_TYPES;
  if (catK === 'body_location') return DEFAULT_BODY_LOCATIONS;
  if (catK === 'area') return DEFAULT_AREA_PATTERNS;
  if (catK === 'effect') return DEFAULT_EFFECT_TYPES;
  if (catK === 'range') return DEFAULT_RANGES;
  if (catK === 'target') return DEFAULT_TARGET_SPECIFICATIONS;
  if (catK === 'critical_effect') return DEFAULT_CRITICAL_EFFECTS;
  if (catK === 'critical_success_effect') return DEFAULT_CRITICAL_SUCCESS_EFFECTS;
  if (catK === 'critical_failure_effect') return DEFAULT_CRITICAL_FAILURE_EFFECTS;
  if (catK === 'material') return DEFAULT_MATERIALS;
  if (catK === 'resistance') return DEFAULT_RESISTANCES;
  if (catK === 'mode') return DEFAULT_MODES;
  if (catK === 'special') return DEFAULT_SPECIALS;
  if (catK === 'availability') return DEFAULT_AVAILABILITY;
  if (catK === 'gear_category') return DEFAULT_GEAR_CATEGORIES;
  if (catK === 'classification') return DEFAULT_CLASSIFICATIONS;
  if (catK === 'creator') return DEFAULT_CREATORS;
  if (catK === 'design') return DEFAULT_DESIGNS;
  if (catK === 'component') return DEFAULT_COMPONENTS;
  if (catK === 'prerequisite' || catK === 'prerequisites') return DEFAULT_PREREQUISITES;
  if (catK === 'modifier' || catK === 'modifiers') return DEFAULT_MODIFIERS;
  if (catK === 'technology') return DEFAULT_TECHNOLOGY;
  if (catK === 'economatrix') return DEFAULT_ECONOMATRIX;
  if (catK === 'rules') return DEFAULT_RULES;
  if (catK === 'conditions') return DEFAULT_CONDITIONS;
  if (catK === 'damage_types') return DEFAULT_DAMAGE_TYPES;
  if (catK === 'maneuvers') return DEFAULT_MANEUVERS;
  if (catK && typeof catK === 'string' && catK.startsWith('society_')) {
    return DEFAULT_SOCIETAL_ENTRIES.filter(e => e.category === catK || e.sphere_key === catK);
  }
  if (catK === 'societies') return DEFAULT_MASTER_SOCIETIES;

  return [];
};
