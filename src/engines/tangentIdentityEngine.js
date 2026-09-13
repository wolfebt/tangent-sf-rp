/**
 * Tangent SF RP — Identity Transition & Trait Synchronization Engine
 * 
 * Manages full lifecycle transitions when a persona's core identity pillars change:
 * - Archetype (80 CP chassis, essential skills, signature features)
 * - Species (inherent traits, size/type, attribute adjustments, movement speeds, skill bonuses)
 * - Occupation (career traits, professional skill packages, tech levels, SP allocations)
 * - Origin (homeworld traits, society skill packages, SP allocations)
 * - Faction (benefits, social strengths, hindrances/disadvantages, allegiance traits)
 */

import { DEFAULT_SPECIES } from '../data/speciesData.js';
import { DEFAULT_ARCHETYPES } from '../data/archetypesData.js';
import { DEFAULT_OCCUPATIONS } from '../data/occupationsData.js';
import { DEFAULT_ORIGINS } from '../data/originsData.js';
import { DEFAULT_FACTIONS } from '../data/factionsData.js';
import { ALL_CANONICAL_SKILLS } from '../data/skillsData.js';
import { DEFAULT_FEATURES } from '../data/featuresData.js';
import { ALL_CANONICAL_TRAITS } from '../data/speciesTraitsData.js';
import { enrichItemWithModifiers } from './tangentModifierEngine.js';

export const PRIMARY_TO_SUB_ATTR_MAP = {
  'attr-strength': 'attr-might',
  'attr-agility': 'attr-reflex',
  'attr-stamina': 'attr-fortitude',
  'attr-intellect': 'attr-logic',
  'attr-wisdom': 'attr-will',
  'attr-charisma': 'attr-etiquette'
};

export const normalizeTraitString = (trait) => {
  if (!trait) return '';
  const raw = typeof trait === 'object' ? (trait.name || trait.title || trait.id || '') : String(trait);
  const cleaned = raw.replace(/^(trait|feature|hindrance|disadvantage)-/i, '').replace(/[-_]/g, ' ').trim();
  return cleaned.replace(/\b\w/g, c => c.toUpperCase());
};

export const mapToAttrKey = (name) => {
  if (!name) return null;
  const lower = String(name).toLowerCase().trim();
  if (lower.startsWith('attr-')) return lower;
  if (lower.includes('strength') || lower.includes('might')) return 'attr-strength';
  if (lower.includes('agility') || lower.includes('reflex')) return 'attr-agility';
  if (lower.includes('stamina') || lower.includes('constitution') || lower.includes('fortitude')) return 'attr-stamina';
  if (lower.includes('intellect') || lower.includes('logic') || lower.includes('reason')) return 'attr-intellect';
  if (lower.includes('wisdom') || lower.includes('will')) return 'attr-wisdom';
  if (lower.includes('charisma') || lower.includes('etiquette')) return 'attr-charisma';
  return null;
};

export const parseSettingLevel = (val, defaultVal = null) => {
  if (val === undefined || val === null || val === '') return defaultVal;
  if (typeof val === 'number') return Math.min(5, Math.max(0, Math.round(val)));
  const match = String(val).match(/\d+/);
  if (!match) return defaultVal;
  const num = parseInt(match[0], 10);
  if (isNaN(num)) return defaultVal;
  return Math.min(5, Math.max(0, num));
};


export const removeOrDecrementSkill = (characterData, skillNameOrId, rankToDeduct, canonicalSkillsList = ALL_CANONICAL_SKILLS) => {
  const deduct = parseInt(rankToDeduct, 10) || 0;
  if (!skillNameOrId || deduct <= 0) return characterData;
  const rawStr = String(skillNameOrId).trim();
  const sNameLower = rawStr.toLowerCase();

  let innerName = rawStr;
  const parenMatch = rawStr.match(/^([^(]+)\(([^)]+)\)$/);
  if (parenMatch) {
    innerName = parenMatch[2].trim();
  } else {
    innerName = rawStr.replace(/^(knowledge|vocation|discipline|metafocus)\s*[-:]?\s*/i, '').trim();
  }
  const cleanId = rawStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const innerCleanId = innerName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const innerNameLower = innerName.toLowerCase();

  const canonSkill = canonicalSkillsList.find(s => {
    const n = (s.name || '').toLowerCase();
    const idWithoutPrefix = (s.id || '').replace(/^[a-z]+-/, '');
    return n === sNameLower || s.id === cleanId || idWithoutPrefix === cleanId ||
           n === innerNameLower || s.id === innerCleanId || idWithoutPrefix === innerCleanId;
  });

  const canonicalId = (canonSkill?.id || innerCleanId || cleanId).replace(/^skill-/, '');
  const shortId = canonicalId.replace(/^[a-z]+-/, '');
  const legacyId = cleanId.replace(/^skill-/, '');
  const cleanShortId = legacyId.replace(/^[a-z]+-/, '');

  const idCandidates = new Set([
    canonicalId,
    shortId,
    legacyId,
    cleanShortId,
    innerCleanId
  ].filter(Boolean));

  const updated = { ...characterData };
  let currentRank = 0;
  for (const cid of idCandidates) {
    const rKey = `skill-${cid}-rank`;
    if (updated[rKey] !== undefined && updated[rKey] !== null) {
      const val = parseInt(updated[rKey], 10);
      if (!isNaN(val) && val > currentRank) {
        currentRank = val;
      }
    }
  }

  const newRank = Math.max(0, currentRank - deduct);

  if (newRank > 0) {
    for (const cid of idCandidates) {
      const rKey = `skill-${cid}-rank`;
      if (updated[rKey] !== undefined || cid === canonicalId || cid === legacyId) {
        updated[rKey] = newRank;
      }
    }
  } else {
    for (const cid of idCandidates) {
      const keysToDelete = [
        `skill-${cid}-rank`,
        `skill-${cid}-base`,
        `skill-${cid}-mod`,
        `skill-${cid}-name`,
        `skill-${cid}-group`,
        `skill-${cid}-subcategory`
      ];
      keysToDelete.forEach(k => delete updated[k]);
    }
  }
  return updated;
};

export const removeOrDecrementAttribute = (characterData, attrNameOrKey, pointsToDeduct) => {
  const deduct = parseInt(pointsToDeduct, 10) || 0;
  if (!attrNameOrKey || deduct <= 0) return characterData;
  const cleanKey = mapToAttrKey(attrNameOrKey);
  if (!cleanKey) return characterData;

  const updated = { ...characterData };
  const currentVal = parseInt(updated[cleanKey] || 0, 10);
  const newVal = Math.max(0, currentVal - deduct);
  updated[cleanKey] = newVal;

  const subKey = PRIMARY_TO_SUB_ATTR_MAP[cleanKey];
  if (subKey) {
    const oldBase = (currentVal * 2) + 2;
    const newBase = (newVal * 2) + 2;
    const rawSub = updated[subKey] !== undefined && updated[subKey] !== null && updated[subKey] !== '' ? parseInt(updated[subKey], 10) : null;
    const hasExplicitSub = rawSub !== null && !isNaN(rawSub) && rawSub > 0;
    const currentSubVal = hasExplicitSub ? rawSub : oldBase;
    const subDelta = currentSubVal - oldBase;
    const newSubVal = Math.max(2, newBase + subDelta);

    updated[subKey] = newSubVal;
    if (subKey === 'attr-logic') updated['attr-reason'] = newSubVal;
    if (subKey === 'attr-will') updated['attr-willpower'] = newSubVal;
  }
  return updated;
};

/**
 * Resolves an item from either the active database cache or the canonical default catalog.
 */
export const resolveCatalogItem = (colKey, itemInput, dbData = {}) => {
  if (!itemInput) return null;
  if (typeof itemInput === 'object' && itemInput !== null && (itemInput.name || itemInput.title || itemInput.id)) {
    return itemInput;
  }

  const queryStr = String(itemInput).trim().toLowerCase();
  if (!queryStr) return null;

  const getCatalog = () => {
    switch (colKey) {
      case 'species':
        return (dbData.species && dbData.species.length > 0) ? dbData.species : DEFAULT_SPECIES;
      case 'archetypes':
      case 'archetype':
        return (dbData.archetypes && dbData.archetypes.length > 0) ? dbData.archetypes : DEFAULT_ARCHETYPES;
      case 'occupations':
      case 'occupation':
        return (dbData.occupations && dbData.occupations.length > 0) ? dbData.occupations : DEFAULT_OCCUPATIONS;
      case 'origins':
      case 'origin':
        return (dbData.origins && dbData.origins.length > 0) ? dbData.origins : DEFAULT_ORIGINS;
      case 'factions':
      case 'faction':
        return (dbData.factions && dbData.factions.length > 0) ? dbData.factions : DEFAULT_FACTIONS;
      default:
        return dbData[colKey] || [];
    }
  };

  const list = getCatalog();
  // 1. Exact match by name, title, or id
  let found = list.find(item => {
    const name = (item.name || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const id = (item.id || '').toLowerCase();
    return name === queryStr || title === queryStr || id === queryStr || id.replace(/^[a-z]+-/, '') === queryStr;
  });

  // 2. Prefix or substring match (e.g. "Human" -> "Human (Base)")
  if (!found) {
    found = list.find(item => {
      const name = (item.name || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      return name.startsWith(`${queryStr} `) || name.startsWith(`${queryStr}(`) || title.startsWith(`${queryStr} `) || title.startsWith(`${queryStr}(`);
    });
  }

  return found || { name: String(itemInput) };
};

/**
 * Applies a Species transition to character data.
 * Removes previous species traits, restores/adjusts movement modes, removes old skill mods,
 * and attaches new species inherent features, movement, and specific bonuses.
 */
export const applySpeciesTransition = (characterData, newSpeciesInput, dbData = {}) => {
  const currentSpeciesName = characterData['char-species'] || '';
  const prevSpeciesObj = resolveCatalogItem('species', currentSpeciesName, dbData);
  const newSpeciesObj = newSpeciesInput ? resolveCatalogItem('species', newSpeciesInput, dbData) : null;
  const newSpeciesName = newSpeciesObj ? (newSpeciesObj.name || newSpeciesObj.title || String(newSpeciesInput)) : '';

  let updated = { ...characterData, 'char-species': newSpeciesName };
  const allSkillsList = (dbData.skills && dbData.skills.length > 0) ? dbData.skills : ALL_CANONICAL_SKILLS;

  // 1. Revert previous species inherent attribute modifiers
  if (prevSpeciesObj && Array.isArray(prevSpeciesObj.inherent_attribute_modifiers)) {
    prevSpeciesObj.inherent_attribute_modifiers.forEach(m => {
      const attr = typeof m === 'object' ? (m.attribute || m.name) : String(m).split(/[:+(]/)[0].trim();
      const bonus = typeof m === 'object' ? (m.bonus ?? m.value ?? 1) : (parseInt(String(m).replace(/[^0-9-]/g, ''), 10) || 1);
      if (attr) {
        updated = removeOrDecrementAttribute(updated, attr, bonus);
      }
    });
  }

  // 2. Revert previous speciesAllocations (attributes & skills)
  if (characterData.speciesAllocations) {
    const prevAlloc = characterData.speciesAllocations;
    if (prevAlloc.attributes) {
      Object.entries(prevAlloc.attributes).forEach(([attrKey, pts]) => {
        updated = removeOrDecrementAttribute(updated, attrKey, pts);
      });
    }
    if (prevAlloc.skills) {
      Object.entries(prevAlloc.skills).forEach(([skName, rank]) => {
        updated = removeOrDecrementSkill(updated, skName, rank, allSkillsList);
      });
    }
  }

  // 3. Collect names/identifiers of old species traits to clean up
  const oldSpeciesTraitNames = new Set();
  if (characterData.speciesAllocations?.traits && Array.isArray(characterData.speciesAllocations.traits)) {
    characterData.speciesAllocations.traits.forEach(t => {
      oldSpeciesTraitNames.add(normalizeTraitString(t).toLowerCase());
      oldSpeciesTraitNames.add(String(t).toLowerCase());
    });
  }
  if (characterData.speciesAllocations?.features && Array.isArray(characterData.speciesAllocations.features)) {
    characterData.speciesAllocations.features.forEach(f => {
      oldSpeciesTraitNames.add(normalizeTraitString(f).toLowerCase());
      oldSpeciesTraitNames.add(String(f).toLowerCase());
    });
  }
  if (prevSpeciesObj) {
    if (Array.isArray(prevSpeciesObj.inherent_features)) {
      prevSpeciesObj.inherent_features.forEach(f => {
        const name = typeof f === 'object' ? (f.name || f.title || f.id) : String(f);
        if (name) {
          oldSpeciesTraitNames.add(normalizeTraitString(name).toLowerCase());
          oldSpeciesTraitNames.add(name.toLowerCase());
        }
      });
    }
    if (Array.isArray(prevSpeciesObj.traits) || Array.isArray(prevSpeciesObj.trait)) {
      const tList = prevSpeciesObj.traits || prevSpeciesObj.trait;
      tList.forEach(t => {
        const name = typeof t === 'object' ? (t.name || t.title || t.id) : String(t);
        if (name) {
          oldSpeciesTraitNames.add(normalizeTraitString(name).toLowerCase());
          oldSpeciesTraitNames.add(name.toLowerCase());
        }
      });
    }
    if (Array.isArray(prevSpeciesObj.modifiers)) {
      prevSpeciesObj.modifiers.forEach(m => {
        if (m.type === 'feature' && m.target) {
          oldSpeciesTraitNames.add(normalizeTraitString(m.target).toLowerCase());
          oldSpeciesTraitNames.add(m.target.toLowerCase());
        }
      });
    }
  }

  // 4. Clean features array
  const currentFeatures = Array.isArray(updated.features) ? updated.features : [];
  const filteredFeatures = currentFeatures.filter(f => {
    if (!f) return false;
    const fCat = typeof f === 'object' ? (f.category || f.source || '') : '';
    const fSource = typeof f === 'object' ? (f.source || '') : '';
    const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
    const normName = normalizeTraitString(fName).toLowerCase();
    const rawName = fName.toLowerCase();

    if (fSource === 'species' || fCat === 'Species Inherent' || fCat === 'Species' || fCat === 'Species Trait' || fCat === 'Species Feature') {
      return false;
    }
    if (oldSpeciesTraitNames.has(normName) || oldSpeciesTraitNames.has(rawName)) {
      return false;
    }
    return true;
  });

  // 5. Clean traits array
  const currentTraits = Array.isArray(updated.traits) ? updated.traits : [];
  const filteredTraits = currentTraits.filter(t => {
    if (!t) return false;
    const tCat = typeof t === 'object' ? (t.category || t.source || '') : '';
    const tSource = typeof t === 'object' ? (t.source || '') : '';
    const tName = typeof t === 'object' ? (t.name || t.title || t.id || '') : String(t);
    const normName = normalizeTraitString(tName).toLowerCase();
    const rawName = tName.toLowerCase();

    if (tSource === 'species' || tCat === 'Species Inherent' || tCat === 'Species' || tCat === 'Species Trait' || tCat === 'Species Feature') {
      return false;
    }
    if (oldSpeciesTraitNames.has(normName) || oldSpeciesTraitNames.has(rawName)) {
      return false;
    }
    return true;
  });

  // 6. Clean disadvantages and hindrances
  const currentDisadvantages = Array.isArray(updated.disadvantages) ? updated.disadvantages : [];
  const filteredDisadvantages = currentDisadvantages.filter(d => {
    if (!d) return false;
    const dCat = typeof d === 'object' ? (d.category || d.source || '') : '';
    const dSource = typeof d === 'object' ? (d.source || '') : '';
    if (dSource === 'species' || dCat === 'Species Disadvantage' || dCat === 'Species') {
      return false;
    }
    return true;
  });

  const currentHindrances = Array.isArray(updated.hindrances) ? updated.hindrances : [];
  const filteredHindrances = currentHindrances.filter(h => {
    if (!h) return false;
    const hCat = typeof h === 'object' ? (h.category || h.source || '') : '';
    const hSource = typeof h === 'object' ? (h.source || '') : '';
    if (hSource === 'species' || hCat === 'Species Disadvantage' || hCat === 'Species') {
      return false;
    }
    return true;
  });

  // 7. Revert old species skill bonuses
  if (prevSpeciesObj && Array.isArray(prevSpeciesObj.specific_skill_bonuses)) {
    prevSpeciesObj.specific_skill_bonuses.forEach(b => {
      const sName = typeof b === 'object' ? (b.skill || b.name || '') : String(b).split(/[:+(]/)[0].trim();
      const sBonus = typeof b === 'object' ? (b.bonus ?? b.value ?? 1) : 1;
      if (sName) {
        const cleanId = sName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const sNameLower = sName.trim().toLowerCase();
        const canonSkill = ALL_CANONICAL_SKILLS.find(s => {
          const n = (s.name || '').toLowerCase();
          const idWithoutPrefix = (s.id || '').replace(/^[a-z]+-/, '');
          return n === sNameLower || s.id === cleanId || idWithoutPrefix === cleanId;
        });
        const canonicalId = canonSkill?.id || cleanId;
        const canonKey = `skill-${canonicalId}-mod`;
        const legacyKey = `skill-${cleanId}-mod`;

        if (updated[canonKey] !== undefined) {
          const currentMod = parseInt(updated[canonKey] || 0, 10);
          updated[canonKey] = Math.max(0, currentMod - sBonus);
        }
        if (canonKey !== legacyKey && updated[legacyKey] !== undefined) {
          const currentMod = parseInt(updated[legacyKey] || 0, 10);
          updated[legacyKey] = Math.max(0, currentMod - sBonus);
        }
      }
    });
  }

  updated.traits = filteredTraits;
  updated.hindrances = filteredHindrances;
  updated.speciesAllocations = { skills: {}, traits: [], features: [], attributes: {} };

  // 8. Apply New Species (if selected)
  if (newSpeciesObj && newSpeciesName) {
    // Add inherent features
    const newFeaturesToAdd = [];
    const addedNames = new Set(filteredFeatures.map(f => (typeof f === 'object' ? (f.name || f.title) : String(f)).toLowerCase()));

    const getStandaloneCost = (rawName) => {
      if (!rawName) return 3;
      const lower = String(rawName).toLowerCase().trim();
      const clean = normalizeTraitString(rawName).toLowerCase();
      
      const foundTrait = ALL_CANONICAL_TRAITS.find(t => {
        const tName = (t.name || t.id || '').toLowerCase();
        return tName === lower || tName === clean || t.id === rawName;
      });
      if (foundTrait) return foundTrait.bp || 1;

      const foundFeat = DEFAULT_FEATURES.find(f => {
        const fName = (f.name || f.id || '').toLowerCase();
        return fName === lower || fName === clean || f.id === rawName;
      });
      if (foundFeat) return foundFeat.cp || 3;

      if (lower.includes('awakened')) return 3;
      return 3;
    };

    const addInherentFeat = (rawName, desc = '') => {
      if (!rawName) return;
      const cleanTitle = normalizeTraitString(rawName);
      if (!addedNames.has(cleanTitle.toLowerCase()) && !addedNames.has(String(rawName).toLowerCase())) {
        addedNames.add(cleanTitle.toLowerCase());
        const standalone = getStandaloneCost(rawName);
        const rawFeatObj = {
          id: `feat_sp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: cleanTitle,
          category: 'Species Inherent',
          source: 'species',
          sourceName: newSpeciesName,
          cp: 0,
          standaloneCp: standalone,
          description: desc || `Inherent trait granted by ${newSpeciesName}.`
        };
        newFeaturesToAdd.push(enrichItemWithModifiers(rawFeatObj));
      }
    };

    if (Array.isArray(newSpeciesObj.inherent_features)) {
      newSpeciesObj.inherent_features.forEach(f => {
        const name = typeof f === 'object' ? (f.name || f.title || f.id) : String(f);
        const desc = typeof f === 'object' ? (f.description || f.mechanic || '') : '';
        addInherentFeat(name, desc);
      });
    }

    if (Array.isArray(newSpeciesObj.modifiers)) {
      newSpeciesObj.modifiers.forEach(m => {
        if (m.type === 'feature' && m.mode === 'inherent' && m.target) {
          addInherentFeat(m.target, m.description || `Inherent trait: ${m.target}`);
        }
      });
    }

    updated.features = [...filteredFeatures, ...newFeaturesToAdd];
    updated.disadvantages = filteredDisadvantages;

    // Movement Modes
    const moveArray = Array.isArray(newSpeciesObj.movement) ? newSpeciesObj.movement : [];
    const spText = JSON.stringify(newSpeciesObj).toLowerCase();
    updated['move-walk'] = 30;
    updated['move-climb'] = (moveArray.some(m => String(m).includes('climb')) || spText.includes('climber') || spText.includes('arboreal')) ? 30 : 0;
    updated['move-swim'] = (moveArray.some(m => String(m).includes('swim')) || spText.includes('aquatic') || spText.includes('amphibious')) ? 30 : 0;
    updated['move-fly'] = (moveArray.some(m => String(m).includes('fly') || String(m).includes('wing')) || spText.includes('flight') || spText.includes('winged')) ? 40 : 0;
    updated['move-burrow'] = (moveArray.some(m => String(m).includes('burrow')) || spText.includes('burrow')) ? 20 : 0;
    updated['move-flicker'] = (moveArray.some(m => String(m).includes('flicker')) || spText.includes('flicker')) ? 30 : 0;

    // Specific Skill Bonuses
    if (Array.isArray(newSpeciesObj.specific_skill_bonuses)) {
      newSpeciesObj.specific_skill_bonuses.forEach(b => {
        const sName = typeof b === 'object' ? (b.skill || b.name || '') : String(b).split(/[:+(]/)[0].trim();
        const sBonus = typeof b === 'object' ? (b.bonus ?? b.value ?? 1) : 1;
        if (sName) {
          const cleanId = sName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const sNameLower = sName.trim().toLowerCase();
          const canonSkill = ALL_CANONICAL_SKILLS.find(s => {
            const n = (s.name || '').toLowerCase();
            const idWithoutPrefix = (s.id || '').replace(/^[a-z]+-/, '');
            return n === sNameLower || s.id === cleanId || idWithoutPrefix === cleanId;
          });
          const canonicalId = canonSkill?.id || cleanId;
          const canonKey = `skill-${canonicalId}-mod`;
          const legacyKey = `skill-${cleanId}-mod`;

          updated[canonKey] = (parseInt(updated[canonKey] || 0, 10)) + sBonus;
          if (canonKey !== legacyKey) {
            updated[legacyKey] = (parseInt(updated[legacyKey] || 0, 10)) + sBonus;
          }
        }
      });
    }

    // Inherent Attribute Modifiers
    if (Array.isArray(newSpeciesObj.inherent_attribute_modifiers)) {
      newSpeciesObj.inherent_attribute_modifiers.forEach(m => {
        const attr = typeof m === 'object' ? (m.attribute || m.name) : String(m).split(/[:+(]/)[0].trim();
        const bonus = typeof m === 'object' ? (m.bonus ?? m.value ?? 1) : (parseInt(String(m).replace(/[^0-9-]/g, ''), 10) || 1);
        const cleanKey = mapToAttrKey(attr);
        if (cleanKey) {
          const cur = parseInt(updated[cleanKey] || 0, 10);
          const nextVal = Math.max(0, cur + bonus);
          updated[cleanKey] = nextVal;
          const subKey = PRIMARY_TO_SUB_ATTR_MAP[cleanKey];
          if (subKey) {
            const oldBase = (cur * 2) + 2;
            const newBase = (nextVal * 2) + 2;
            const rawSub = updated[subKey] !== undefined && updated[subKey] !== null && updated[subKey] !== '' ? parseInt(updated[subKey], 10) : null;
            const hasExplicitSub = rawSub !== null && !isNaN(rawSub) && rawSub > 0;
            const curSub = hasExplicitSub ? rawSub : oldBase;
            const subDelta = curSub - oldBase;
            const nextSub = Math.max(2, newBase + subDelta);
            updated[subKey] = nextSub;
            if (subKey === 'attr-logic') updated['attr-reason'] = nextSub;
            if (subKey === 'attr-will') updated['attr-willpower'] = nextSub;
          }
        }
      });
    }

    // Setting Tiers: Tech Level & Meta Level (0-5, non-stacking highest from species and faction)
    const factionObj = resolveCatalogItem('factions', updated['char-faction'], dbData);
    const speciesTL = parseSettingLevel(newSpeciesObj.tech_level ?? newSpeciesObj.techLevel, null);
    const speciesML = parseSettingLevel(newSpeciesObj.meta_level ?? newSpeciesObj.metaLevel, null);
    const factionTL = parseSettingLevel(factionObj?.tech_level ?? factionObj?.techLevel, null);
    const factionML = parseSettingLevel(factionObj?.meta_level ?? factionObj?.metaLevel, null);

    if (speciesTL !== null || factionTL !== null) {
      updated['tech-level'] = Math.min(5, Math.max(0, Math.max(speciesTL ?? 3, factionTL ?? 3)));
    }
    if (speciesML !== null || factionML !== null) {
      updated['magic-level'] = Math.min(5, Math.max(0, Math.max(speciesML ?? 0, factionML ?? 0)));
    }
  } else {
    // Clearing species
    updated.features = filteredFeatures;
    updated.disadvantages = filteredDisadvantages;
    updated['move-walk'] = 30;
    updated['move-climb'] = 0;
    updated['move-swim'] = 0;
    updated['move-fly'] = 0;
    updated['move-burrow'] = 0;
    updated['move-flicker'] = 0;

    const factionObj = resolveCatalogItem('factions', updated['char-faction'], dbData);
    const factionTL = parseSettingLevel(factionObj?.tech_level ?? factionObj?.techLevel, null);
    const factionML = parseSettingLevel(factionObj?.meta_level ?? factionObj?.metaLevel, null);
    if (factionTL !== null) {
      updated['tech-level'] = factionTL;
    }
    if (factionML !== null) {
      updated['magic-level'] = factionML;
    }
  }

  return updated;
};

/**
 * Applies an Archetype transition to character data.
 * Cleans up old archetype essential skills, attribute points, signature features,
 * and optionally applies the 80 CP pre-build.
 */
export const applyArchetypeTransition = (characterData, newArchetypeInput, dbData = {}, options = {}) => {
  const currentArchetypeName = characterData['char-archetype'] || '';
  const prevArchetypeObj = resolveCatalogItem('archetypes', currentArchetypeName, dbData);
  const newArchetypeObj = newArchetypeInput ? resolveCatalogItem('archetypes', newArchetypeInput, dbData) : null;
  const newArchetypeName = newArchetypeObj ? (newArchetypeObj.name || newArchetypeObj.title || String(newArchetypeInput)) : '';

  let updated = { ...characterData, 'char-archetype': newArchetypeName };
  const allSkillsList = (dbData.skills && dbData.skills.length > 0) ? dbData.skills : ALL_CANONICAL_SKILLS;

  // 1. Revert previous Archetype skills
  const prevArchAlloc = characterData.archetypeAllocations;
  if (prevArchAlloc?.skills) {
    Object.entries(prevArchAlloc.skills).forEach(([skName, rank]) => {
      updated = removeOrDecrementSkill(updated, skName, rank, allSkillsList);
    });
  } else if (prevArchetypeObj && Array.isArray(prevArchetypeObj.essential_skills)) {
    prevArchetypeObj.essential_skills.forEach((skNameRaw, idx) => {
      const defaultRank = idx < 4 ? 6 : 3;
      updated = removeOrDecrementSkill(updated, skNameRaw, defaultRank, allSkillsList);
    });
  }

  // 2. Revert previous Archetype attribute points
  if (prevArchAlloc?.attributes) {
    Object.entries(prevArchAlloc.attributes).forEach(([attrKey, pts]) => {
      updated = removeOrDecrementAttribute(updated, attrKey, pts);
    });
  } else if (prevArchetypeObj) {
    const prevPrimKey = mapToAttrKey(prevArchetypeObj.primary_attribute);
    const prevSecKey = mapToAttrKey(prevArchetypeObj.secondary_attribute);
    if (prevPrimKey) updated = removeOrDecrementAttribute(updated, prevPrimKey, 3);
    if (prevSecKey) updated = removeOrDecrementAttribute(updated, prevSecKey, 2);
  }

  // 3. Identify old archetype signature feature names
  const oldSigNames = new Set();
  if (prevArchAlloc?.features && Array.isArray(prevArchAlloc.features)) {
    prevArchAlloc.features.forEach(f => {
      const name = typeof f === 'object' ? (f.name || f.title || f.id) : String(f);
      if (name) {
        oldSigNames.add(normalizeTraitString(name).toLowerCase());
        oldSigNames.add(name.toLowerCase());
      }
    });
  }
  if (prevArchetypeObj && Array.isArray(prevArchetypeObj.signature_features)) {
    prevArchetypeObj.signature_features.forEach(f => {
      const name = typeof f === 'object' ? (f.name || f.title || f.id) : String(f);
      if (name) {
        oldSigNames.add(normalizeTraitString(name).toLowerCase());
        oldSigNames.add(name.toLowerCase());
      }
    });
  }

  // 4. Clean features and traits
  const currentFeatures = Array.isArray(updated.features) ? updated.features : [];
  const filteredFeatures = currentFeatures.filter(f => {
    if (!f) return false;
    const fCat = typeof f === 'object' ? (f.category || f.source || '') : '';
    const fSource = typeof f === 'object' ? (f.source || '') : '';
    const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
    const normName = normalizeTraitString(fName).toLowerCase();
    const rawName = fName.toLowerCase();

    if (fSource === 'archetype' || fCat === 'Archetype Signature' || fCat === 'Archetype' || fCat === 'Archetype Feature') {
      return false;
    }
    if (oldSigNames.has(normName) || oldSigNames.has(rawName)) {
      return false;
    }
    return true;
  });

  const currentTraits = Array.isArray(updated.traits) ? updated.traits : [];
  const filteredTraits = currentTraits.filter(t => {
    if (!t) return false;
    const tCat = typeof t === 'object' ? (t.category || t.source || '') : '';
    const tSource = typeof t === 'object' ? (t.source || '') : '';
    const tName = typeof t === 'object' ? (t.name || t.title || t.id || '') : String(t);
    const normName = normalizeTraitString(tName).toLowerCase();
    const rawName = tName.toLowerCase();

    if (tSource === 'archetype' || tCat === 'Archetype Signature' || tCat === 'Archetype' || tCat === 'Archetype Feature') {
      return false;
    }
    if (oldSigNames.has(normName) || oldSigNames.has(rawName)) {
      return false;
    }
    return true;
  });

  updated.features = filteredFeatures;
  updated.traits = filteredTraits;
  updated.archetypeAllocations = { skills: {}, attributes: {}, features: [] };

  // 5. If new archetype selected, apply traits and optional pre-build chassis
  if (newArchetypeObj && newArchetypeName) {
    const shouldApplyPreBuild = Boolean(options.applyPreBuild);
    const newArchAlloc = {
      attributes: {},
      skills: {},
      features: []
    };

    if (shouldApplyPreBuild) {
      const primAttr = newArchetypeObj.primary_attribute || 'Strength';
      const secAttr = newArchetypeObj.secondary_attribute || 'Agility';
      const primKey = mapToAttrKey(primAttr) || 'attr-strength';
      const secKey = mapToAttrKey(secAttr) || 'attr-agility';

      // Primary & Secondary Attributes (+3 / +2)
      const curPrim = parseInt(updated[primKey] || 0, 10);
      const nextPrim = curPrim + 3;
      updated[primKey] = nextPrim;
      const subPrim = PRIMARY_TO_SUB_ATTR_MAP[primKey];
      if (subPrim) {
        updated[subPrim] = (nextPrim * 2) + 2;
        if (subPrim === 'attr-logic') updated['attr-reason'] = (nextPrim * 2) + 2;
        if (subPrim === 'attr-will') updated['attr-willpower'] = (nextPrim * 2) + 2;
      }
      newArchAlloc.attributes[primKey] = 3;

      const curSec = parseInt(updated[secKey] || 0, 10);
      const nextSec = curSec + 2;
      updated[secKey] = nextSec;
      const subSec = PRIMARY_TO_SUB_ATTR_MAP[secKey];
      if (subSec) {
        updated[subSec] = (nextSec * 2) + 2;
        if (subSec === 'attr-logic') updated['attr-reason'] = (nextSec * 2) + 2;
        if (subSec === 'attr-will') updated['attr-willpower'] = (nextSec * 2) + 2;
      }
      newArchAlloc.attributes[secKey] = 2;

      // Concept & Role defaults
      if (!updated['char-concept'] || updated['char-concept'].trim() === '' || updated['char-concept'] === 'Unnamed Operative') {
        updated['char-concept'] = newArchetypeObj.core_concept || newArchetypeName;
      }
      if (!updated['char-motive'] || updated['char-motive'].trim() === '') {
        updated['char-motive'] = newArchetypeObj.tactical_role || '';
      }

      // Essential Skills
      const essentialSkills = Array.isArray(newArchetypeObj.essential_skills) ? newArchetypeObj.essential_skills : [];
      essentialSkills.forEach((skNameRaw, idx) => {
        const rawStr = String(skNameRaw).trim();
        const lowerRaw = rawStr.toLowerCase();
        const candidatePrefix = rawStr.replace(/\s*\(.*\)/, '').trim().toLowerCase();

        const skObj = allSkillsList.find(s => {
          const sName = (s.name || '').toLowerCase();
          return sName === lowerRaw || sName === candidatePrefix;
        });

        const finalSkillName = skObj?.name || rawStr;
        const cleanId = (skObj?.id || `skill-${finalSkillName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`).replace(/^skill-/, '');
        const rank = idx < 4 ? 6 : 3;
        const baseAttr = skObj?.baseAttr || primKey;

        const canonRankKey = `skill-${cleanId}-rank`;
        const currentRank = parseInt(updated[canonRankKey] || 0, 10);
        const nextRank = Math.max(rank, currentRank + rank);

        updated[`skill-${cleanId}-rank`] = nextRank;
        updated[`skill-${cleanId}-base`] = baseAttr;
        updated[`skill-${cleanId}-name`] = finalSkillName;
        if (skObj?.group) updated[`skill-${cleanId}-group`] = skObj.group;
        if (skObj?.subcategory) updated[`skill-${cleanId}-subcategory`] = skObj.subcategory;

        newArchAlloc.skills[finalSkillName] = rank;
      });
    }

    // Attach signature features
    const sigFeatures = Array.isArray(newArchetypeObj.signature_features) ? newArchetypeObj.signature_features : [];
    const newFeaturesToAdd = [];
    const seenFeats = new Set(filteredFeatures.map(f => (typeof f === 'object' ? (f.name || f.title) : String(f)).toLowerCase()));

    sigFeatures.forEach(feat => {
      const featName = typeof feat === 'object' ? (feat.name || feat.title || feat.id) : String(feat);
      const cleanTitle = normalizeTraitString(featName);
      if (!seenFeats.has(cleanTitle.toLowerCase()) && !seenFeats.has(featName.toLowerCase())) {
        seenFeats.add(cleanTitle.toLowerCase());
        const rawFeatObj = {
          id: `feat_arch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: cleanTitle,
          category: 'Archetype Signature',
          source: 'archetype',
          sourceName: newArchetypeName,
          cp: 2,
          description: typeof feat === 'object' ? (feat.description || `Signature feature granted by ${newArchetypeName} archetype.`) : `Signature feature granted by ${newArchetypeName} archetype.`
        };
        newFeaturesToAdd.push(enrichItemWithModifiers(rawFeatObj));
        newArchAlloc.features.push(cleanTitle);
      }
    });

    updated.features = [...filteredFeatures, ...newFeaturesToAdd];
    updated.archetypeAllocations = newArchAlloc;
  }

  return updated;
};

/**
 * Applies an Occupation transition to character data.
 * Cleans up old occupation traits, resets occupation allocations, and updates career data.
 */
export const applyOccupationTransition = (characterData, newOccupationInput, dbData = {}) => {
  const currentOccuName = characterData['char-occu'] || '';
  const prevOccuObj = resolveCatalogItem('occupations', currentOccuName, dbData);
  const newOccuObj = newOccupationInput ? resolveCatalogItem('occupations', newOccupationInput, dbData) : null;
  const newOccuName = newOccuObj ? (newOccuObj.name || newOccuObj.title || String(newOccupationInput)) : '';

  let updated = { ...characterData, 'char-occu': newOccuName };
  const allSkillsList = (dbData.skills && dbData.skills.length > 0) ? dbData.skills : ALL_CANONICAL_SKILLS;

  // 1. Revert previous occupation allocated skills
  if (characterData.occuAllocations?.skills) {
    Object.entries(characterData.occuAllocations.skills).forEach(([skName, rank]) => {
      updated = removeOrDecrementSkill(updated, skName, rank, allSkillsList);
    });
  }

  // 2. Old Occupation Trait names
  const oldOccuTraitNames = new Set();
  if (characterData.occuAllocations?.traits && Array.isArray(characterData.occuAllocations.traits)) {
    characterData.occuAllocations.traits.forEach(t => {
      oldOccuTraitNames.add(normalizeTraitString(t).toLowerCase());
      oldOccuTraitNames.add(String(t).toLowerCase());
    });
  }
  if (characterData.occuAllocations?.features && Array.isArray(characterData.occuAllocations.features)) {
    characterData.occuAllocations.features.forEach(f => {
      oldOccuTraitNames.add(normalizeTraitString(f).toLowerCase());
      oldOccuTraitNames.add(String(f).toLowerCase());
    });
  }
  if (prevOccuObj) {
    const rawTraits = prevOccuObj.traits || prevOccuObj.trait || [];
    rawTraits.forEach(t => {
      const name = typeof t === 'object' ? (t.name || t.title || t.id) : String(t);
      if (name) {
        oldOccuTraitNames.add(normalizeTraitString(name).toLowerCase());
        oldOccuTraitNames.add(name.toLowerCase());
      }
    });
  }

  // 3. Clean features and traits arrays
  const currentFeatures = Array.isArray(updated.features) ? updated.features : [];
  updated.features = currentFeatures.filter(f => {
    if (!f) return false;
    const fCat = typeof f === 'object' ? (f.category || f.source || '') : '';
    const fSource = typeof f === 'object' ? (f.source || '') : '';
    const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
    const normName = normalizeTraitString(fName).toLowerCase();
    const rawName = fName.toLowerCase();

    if (fSource === 'occupation' || fCat === 'Occupation Trait' || fCat === 'Occupational Trait' || fCat === 'Occupation Feature' || fCat === 'Occupation') {
      return false;
    }
    if (oldOccuTraitNames.has(normName) || oldOccuTraitNames.has(rawName)) {
      return false;
    }
    return true;
  });

  const currentTraits = Array.isArray(updated.traits) ? updated.traits : [];
  updated.traits = currentTraits.filter(t => {
    if (!t) return false;
    const tCat = typeof t === 'object' ? (t.category || t.source || '') : '';
    const tSource = typeof t === 'object' ? (t.source || '') : '';
    const tName = typeof t === 'object' ? (t.name || t.title || t.id || '') : String(t);
    const normName = normalizeTraitString(tName).toLowerCase();
    const rawName = tName.toLowerCase();

    if (tSource === 'occupation' || fCat === 'Occupation Trait' || fCat === 'Occupational Trait' || fCat === 'Occupation Feature' || fCat === 'Occupation') {
      return false;
    }
    if (oldOccuTraitNames.has(normName) || oldOccuTraitNames.has(rawName)) {
      return false;
    }
    return true;
  });

  updated['char-occu-traits'] = [];
  updated.occu_traits = [];
  updated.occuAllocations = { skills: {}, traits: [], features: [] };

  return updated;
};

/**
 * Applies an Origin transition to character data.
 * Cleans up old homeworld traits, resets origin allocations, and updates origin data.
 */
export const applyOriginTransition = (characterData, newOriginInput, dbData = {}) => {
  const currentOriginName = characterData['char-origin'] || '';
  const prevOriginObj = resolveCatalogItem('origins', currentOriginName, dbData);
  const newOriginObj = newOriginInput ? resolveCatalogItem('origins', newOriginInput, dbData) : null;
  const newOriginName = newOriginObj ? (newOriginObj.name || newOriginObj.title || String(newOriginInput)) : '';

  let updated = { ...characterData, 'char-origin': newOriginName };
  const allSkillsList = (dbData.skills && dbData.skills.length > 0) ? dbData.skills : ALL_CANONICAL_SKILLS;

  // 1. Revert previous origin allocated skills
  if (characterData.originAllocations?.skills) {
    Object.entries(characterData.originAllocations.skills).forEach(([skName, rank]) => {
      updated = removeOrDecrementSkill(updated, skName, rank, allSkillsList);
    });
  }

  // 2. Old Origin Trait names
  const oldOriginTraitNames = new Set();
  if (characterData.originAllocations?.traits && Array.isArray(characterData.originAllocations.traits)) {
    characterData.originAllocations.traits.forEach(t => {
      oldOriginTraitNames.add(normalizeTraitString(t).toLowerCase());
      oldOriginTraitNames.add(String(t).toLowerCase());
    });
  }
  if (characterData.originAllocations?.features && Array.isArray(characterData.originAllocations.features)) {
    characterData.originAllocations.features.forEach(f => {
      oldOriginTraitNames.add(normalizeTraitString(f).toLowerCase());
      oldOriginTraitNames.add(String(f).toLowerCase());
    });
  }
  if (prevOriginObj) {
    const rawTraits = prevOriginObj.traits || prevOriginObj.trait || [];
    rawTraits.forEach(t => {
      const name = typeof t === 'object' ? (t.name || t.title || t.id) : String(t);
      if (name) {
        oldOriginTraitNames.add(normalizeTraitString(name).toLowerCase());
        oldOriginTraitNames.add(name.toLowerCase());
      }
    });
  }

  // 3. Clean features and traits arrays
  const currentFeatures = Array.isArray(updated.features) ? updated.features : [];
  updated.features = currentFeatures.filter(f => {
    if (!f) return false;
    const fCat = typeof f === 'object' ? (f.category || f.source || '') : '';
    const fSource = typeof f === 'object' ? (f.source || '') : '';
    const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
    const normName = normalizeTraitString(fName).toLowerCase();
    const rawName = fName.toLowerCase();

    if (fSource === 'origin' || fCat === 'Origin Trait' || fCat === 'Origin Feature' || fCat === 'Origin') {
      return false;
    }
    if (oldOriginTraitNames.has(normName) || oldOriginTraitNames.has(rawName)) {
      return false;
    }
    return true;
  });

  const currentTraits = Array.isArray(updated.traits) ? updated.traits : [];
  updated.traits = currentTraits.filter(t => {
    if (!t) return false;
    const tCat = typeof t === 'object' ? (t.category || t.source || '') : '';
    const tSource = typeof t === 'object' ? (t.source || '') : '';
    const tName = typeof t === 'object' ? (t.name || t.title || t.id || '') : String(t);
    const normName = normalizeTraitString(tName).toLowerCase();
    const rawName = tName.toLowerCase();

    if (tSource === 'origin' || tCat === 'Origin Trait' || tCat === 'Origin Feature' || tCat === 'Origin') {
      return false;
    }
    if (oldOriginTraitNames.has(normName) || oldOriginTraitNames.has(rawName)) {
      return false;
    }
    return true;
  });

  updated['char-origin-traits'] = [];
  updated.origin_traits = [];
  updated.originAllocations = { skills: {}, traits: [], features: [] };

  return updated;
};

/**
 * Applies a Faction transition to character data.
 * Cleans up old faction benefits, social strengths, and hindrances/disadvantages.
 * Attaches new guaranteed faction benefits and hindrances.
 */
export const applyFactionTransition = (characterData, newFactionInput, dbData = {}) => {
  const currentFactionName = characterData['char-faction'] || '';
  const prevFactionObj = resolveCatalogItem('factions', currentFactionName, dbData);
  const newFactionObj = newFactionInput ? resolveCatalogItem('factions', newFactionInput, dbData) : null;
  const newFactionName = newFactionObj ? (newFactionObj.name || newFactionObj.title || String(newFactionInput)) : '';

  let updated = { ...characterData, 'char-faction': newFactionName };
  const allSkillsList = (dbData.skills && dbData.skills.length > 0) ? dbData.skills : ALL_CANONICAL_SKILLS;

  // 1. Revert previous faction allocated skills
  if (characterData.factionAllocations?.skills) {
    Object.entries(characterData.factionAllocations.skills).forEach(([skName, rank]) => {
      updated = removeOrDecrementSkill(updated, skName, rank, allSkillsList);
    });
  }

  // 2. Old Faction Benefit & Hindrance names
  const oldFactionBenefits = new Set();
  const oldFactionHindrances = new Set();

  if (characterData.factionAllocations?.traits && Array.isArray(characterData.factionAllocations.traits)) {
    characterData.factionAllocations.traits.forEach(t => {
      oldFactionBenefits.add(normalizeTraitString(t).toLowerCase());
      oldFactionBenefits.add(String(t).toLowerCase());
    });
  }
  if (characterData.factionAllocations?.features && Array.isArray(characterData.factionAllocations.features)) {
    characterData.factionAllocations.features.forEach(f => {
      oldFactionBenefits.add(normalizeTraitString(f).toLowerCase());
      oldFactionBenefits.add(String(f).toLowerCase());
    });
  }

  if (prevFactionObj) {
    const rawBonus = prevFactionObj.bonus_features || prevFactionObj.bonusFeatures || prevFactionObj.benefits;
    if (Array.isArray(rawBonus)) {
      rawBonus.forEach(b => {
        const n = typeof b === 'object' ? (b.name || b.id) : String(b);
        oldFactionBenefits.add(n.toLowerCase());
        oldFactionBenefits.add(normalizeTraitString(n).toLowerCase());
      });
    }
    if (prevFactionObj.social_strengths) {
      oldFactionBenefits.add(String(prevFactionObj.social_strengths).toLowerCase());
    }

    const rawHind = prevFactionObj.hindrances || prevFactionObj.disadvantages || prevFactionObj.social_weaknesses;
    if (Array.isArray(rawHind)) {
      rawHind.forEach(h => {
        const n = typeof h === 'object' ? (h.name || h.id) : String(h);
        oldFactionHindrances.add(n.toLowerCase());
        oldFactionHindrances.add(normalizeTraitString(n).toLowerCase());
      });
    }
  }

  // 3. Clean features and traits
  const currentFeatures = Array.isArray(updated.features) ? updated.features : [];
  updated.features = currentFeatures.filter(f => {
    if (!f) return false;
    const fCat = typeof f === 'object' ? (f.category || f.source || '') : '';
    const fSource = typeof f === 'object' ? (f.source || '') : '';
    const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
    const normName = normalizeTraitString(fName).toLowerCase();
    const rawName = fName.toLowerCase();

    if (fSource === 'faction' || fCat === 'Faction Feature' || fCat === 'Faction Benefit' || fCat === 'Faction Trait' || fCat === 'Faction') {
      return false;
    }
    if (oldFactionBenefits.has(normName) || oldFactionBenefits.has(rawName)) {
      return false;
    }
    return true;
  });

  const currentTraits = Array.isArray(updated.traits) ? updated.traits : [];
  updated.traits = currentTraits.filter(t => {
    if (!t) return false;
    const tCat = typeof t === 'object' ? (t.category || t.source || '') : '';
    const tSource = typeof t === 'object' ? (t.source || '') : '';
    const tName = typeof t === 'object' ? (t.name || t.title || t.id || '') : String(t);
    const normName = normalizeTraitString(tName).toLowerCase();
    const rawName = tName.toLowerCase();

    if (tSource === 'faction' || tCat === 'Faction Feature' || tCat === 'Faction Benefit' || tCat === 'Faction Trait' || tCat === 'Faction') {
      return false;
    }
    if (oldFactionBenefits.has(normName) || oldFactionBenefits.has(rawName)) {
      return false;
    }
    return true;
  });

  // 4. Clean disadvantages and hindrances
  const currentDisadvantages = Array.isArray(updated.disadvantages) ? updated.disadvantages : [];
  updated.disadvantages = currentDisadvantages.filter(d => {
    if (!d) return false;
    const dCat = typeof d === 'object' ? (d.category || d.source || '') : '';
    const dSource = typeof d === 'object' ? (d.source || '') : '';
    const dName = typeof d === 'object' ? (d.name || d.title || d.id || '') : String(d);
    const normName = normalizeTraitString(dName).toLowerCase();
    const rawName = dName.toLowerCase();

    if (dSource === 'faction' || dCat === 'Faction Hindrance' || dCat === 'Faction Disadvantage' || dCat === 'Faction') {
      return false;
    }
    if (oldFactionHindrances.has(normName) || oldFactionHindrances.has(rawName)) {
      return false;
    }
    return true;
  });

  const currentHindrances = Array.isArray(updated.hindrances) ? updated.hindrances : [];
  updated.hindrances = currentHindrances.filter(h => {
    if (!h) return false;
    const hCat = typeof h === 'object' ? (h.category || h.source || '') : '';
    const hSource = typeof h === 'object' ? (h.source || '') : '';
    const hName = typeof h === 'object' ? (h.name || h.title || h.id || '') : String(h);
    const normName = normalizeTraitString(hName).toLowerCase();
    const rawName = hName.toLowerCase();

    if (hSource === 'faction' || hCat === 'Faction Hindrance' || hCat === 'Faction Disadvantage' || hCat === 'Faction') {
      return false;
    }
    if (oldFactionHindrances.has(normName) || oldFactionHindrances.has(rawName)) {
      return false;
    }
    return true;
  });

  // 5. Attach new Faction Benefits and Hindrances (if any)
  const newFeaturesToAdd = [];
  const newDisadvantagesToAdd = [];

  if (newFactionObj && newFactionName) {
    const rawBonus = newFactionObj.bonus_features || newFactionObj.bonusFeatures || newFactionObj.benefits;
    if (Array.isArray(rawBonus)) {
      rawBonus.forEach(b => {
        const bName = typeof b === 'object' ? (b.name || b.title || b.id) : String(b);
        if (bName) {
          const rawFeatObj = {
            id: `feat_fac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: normalizeTraitString(bName),
            category: 'Faction Feature',
            source: 'faction',
            sourceName: newFactionName,
            cp: 0,
            description: typeof b === 'object' ? (b.description || `Granted by ${newFactionName}.`) : `Granted by ${newFactionName}.`
          };
          newFeaturesToAdd.push(enrichItemWithModifiers(rawFeatObj));
        }
      });
    }

    const rawHind = newFactionObj.hindrances || newFactionObj.disadvantages || newFactionObj.social_weaknesses;
    if (Array.isArray(rawHind)) {
      rawHind.forEach(h => {
        const hName = typeof h === 'object' ? (h.name || h.title || h.id) : String(h);
        if (hName) {
          const refundVal = (typeof h === 'object' && (h.cp !== undefined ? h.cp : (h.refundBP !== undefined ? h.refundBP : (h.bp !== undefined ? h.bp : 3)))) || 3;
          const rawDisObj = {
            id: `dis_fac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: normalizeTraitString(hName),
            category: 'Faction Hindrance',
            source: 'faction',
            sourceName: newFactionName,
            bp: refundVal,
            cp: refundVal,
            refundBP: refundVal,
            description: typeof h === 'object' ? (h.description || `Faction allegiance restriction of ${newFactionName}.`) : `Faction restriction of ${newFactionName}.`
          };
          newDisadvantagesToAdd.push(enrichItemWithModifiers(rawDisObj));
        }
      });
    }
  }

  updated.features = [...updated.features, ...newFeaturesToAdd];
  updated.disadvantages = [...updated.disadvantages, ...newDisadvantagesToAdd];
  updated.factionAllocations = { skills: {}, traits: [], features: [] };

  // Setting Tiers: Tech Level & Meta Level (0-5, non-stacking highest from species and faction)
  const speciesObj = resolveCatalogItem('species', updated['char-species'], dbData);
  const factionTL = parseSettingLevel(newFactionObj?.tech_level ?? newFactionObj?.techLevel, null);
  const factionML = parseSettingLevel(newFactionObj?.meta_level ?? newFactionObj?.metaLevel, null);
  const speciesTL = parseSettingLevel(speciesObj?.tech_level ?? speciesObj?.techLevel, null);
  const speciesML = parseSettingLevel(speciesObj?.meta_level ?? speciesObj?.metaLevel, null);

  if (factionTL !== null || speciesTL !== null) {
    updated['tech-level'] = Math.min(5, Math.max(0, Math.max(factionTL ?? 3, speciesTL ?? 3)));
  } else if (!newFactionObj) {
    updated['tech-level'] = speciesTL ?? 3;
  }

  if (factionML !== null || speciesML !== null) {
    updated['magic-level'] = Math.min(5, Math.max(0, Math.max(factionML ?? 0, speciesML ?? 0)));
  } else if (!newFactionObj) {
    updated['magic-level'] = speciesML ?? 1;
  }

  return updated;
};

/**
 * Universal dispatcher for any of the 5 identity field changes (and secondary fields).
 */
export const applyIdentityFieldTransition = (characterData, fieldKey, newValue, dbData = {}, options = {}) => {
  switch (fieldKey) {
    case 'char-species':
      return applySpeciesTransition(characterData, newValue, dbData);
    case 'char-archetype':
      return applyArchetypeTransition(characterData, newValue, dbData, options);
    case 'char-occu':
      return applyOccupationTransition(characterData, newValue, dbData);
    case 'char-secondary-occu': {
      const updated = { ...characterData, 'char-secondary-occu': newValue ? String(newValue) : '' };
      return updated;
    }
    case 'char-origin':
      return applyOriginTransition(characterData, newValue, dbData);
    case 'char-secondary-origin': {
      const updated = { ...characterData, 'char-secondary-origin': newValue ? String(newValue) : '' };
      return updated;
    }
    case 'char-faction':
      return applyFactionTransition(characterData, newValue, dbData);
    default:
      return { ...characterData, [fieldKey]: newValue };
  }
};
