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

  const updated = { ...characterData, 'char-species': newSpeciesName };

  // 1. Collect names/identifiers of old species traits to clean up
  const oldSpeciesTraitNames = new Set();
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

  // 2. Clean features array
  const currentFeatures = Array.isArray(characterData.features) ? characterData.features : [];
  const filteredFeatures = currentFeatures.filter(f => {
    if (!f) return false;
    const fCat = typeof f === 'object' ? (f.category || f.source || '') : '';
    const fSource = typeof f === 'object' ? (f.source || '') : '';
    const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
    const normName = normalizeTraitString(fName).toLowerCase();
    const rawName = fName.toLowerCase();

    // If explicitly tagged as species
    if (fSource === 'species' || fCat === 'Species Inherent' || fCat === 'Species' || fCat === 'Species Trait') {
      return false;
    }
    // If it matches one of the old species' known traits
    if (oldSpeciesTraitNames.has(normName) || oldSpeciesTraitNames.has(rawName)) {
      return false;
    }
    return true;
  });

  // 3. Clean disadvantages array
  const currentDisadvantages = Array.isArray(characterData.disadvantages) ? characterData.disadvantages : [];
  const filteredDisadvantages = currentDisadvantages.filter(d => {
    if (!d) return false;
    const dCat = typeof d === 'object' ? (d.category || d.source || '') : '';
    const dSource = typeof d === 'object' ? (d.source || '') : '';
    if (dSource === 'species' || dCat === 'Species Disadvantage' || dCat === 'Species') {
      return false;
    }
    return true;
  });

  // 4. Revert old species skill bonuses
  if (prevSpeciesObj && Array.isArray(prevSpeciesObj.specific_skill_bonuses)) {
    prevSpeciesObj.specific_skill_bonuses.forEach(b => {
      const sName = typeof b === 'object' ? (b.skill || b.name || '') : String(b).split(/[:+(]/)[0].trim();
      const sBonus = typeof b === 'object' ? (b.bonus ?? b.value ?? 1) : 1;
      if (sName) {
        const cleanId = sName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const key = `skill-${cleanId}-mod`;
        if (updated[key] !== undefined) {
          const currentMod = parseInt(updated[key] || 0, 10);
          updated[key] = Math.max(0, currentMod - sBonus);
        }
      }
    });
  }

  // 5. Apply New Species (if selected)
  if (newSpeciesObj && newSpeciesName) {
    // Add inherent features
    const newFeaturesToAdd = [];
    const addedNames = new Set(filteredFeatures.map(f => (typeof f === 'object' ? (f.name || f.title) : String(f)).toLowerCase()));

    const addInherentFeat = (rawName, desc = '') => {
      if (!rawName) return;
      const cleanTitle = normalizeTraitString(rawName);
      if (!addedNames.has(cleanTitle.toLowerCase()) && !addedNames.has(String(rawName).toLowerCase())) {
        addedNames.add(cleanTitle.toLowerCase());
        newFeaturesToAdd.push({
          id: `feat_sp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: cleanTitle,
          category: 'Species Inherent',
          source: 'species',
          sourceName: newSpeciesName,
          cp: 0,
          description: desc || `Inherent trait granted by ${newSpeciesName}.`
        });
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
          const key = `skill-${cleanId}-mod`;
          updated[key] = (parseInt(updated[key] || 0, 10)) + sBonus;
        }
      });
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
  }

  return updated;
};

/**
 * Applies an Archetype transition to character data.
 * Cleans up old archetype signature features and optionally applies the 80 CP pre-build.
 */
export const applyArchetypeTransition = (characterData, newArchetypeInput, dbData = {}, options = {}) => {
  const currentArchetypeName = characterData['char-archetype'] || '';
  const prevArchetypeObj = resolveCatalogItem('archetypes', currentArchetypeName, dbData);
  const newArchetypeObj = newArchetypeInput ? resolveCatalogItem('archetypes', newArchetypeInput, dbData) : null;
  const newArchetypeName = newArchetypeObj ? (newArchetypeObj.name || newArchetypeObj.title || String(newArchetypeInput)) : '';

  const updated = { ...characterData, 'char-archetype': newArchetypeName };

  // 1. Identify old archetype signature feature names
  const oldSigNames = new Set();
  if (prevArchetypeObj && Array.isArray(prevArchetypeObj.signature_features)) {
    prevArchetypeObj.signature_features.forEach(f => {
      const name = typeof f === 'object' ? (f.name || f.title || f.id) : String(f);
      if (name) {
        oldSigNames.add(normalizeTraitString(name).toLowerCase());
        oldSigNames.add(name.toLowerCase());
      }
    });
  }

  // 2. Clean features
  const currentFeatures = Array.isArray(characterData.features) ? characterData.features : [];
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

  updated.features = filteredFeatures;

  // 3. If new archetype selected, apply traits and optional pre-build chassis
  if (newArchetypeObj && newArchetypeName) {
    const shouldApplyPreBuild = Boolean(options.applyPreBuild);

    if (shouldApplyPreBuild) {
      const primAttr = newArchetypeObj.primary_attribute || 'Strength';
      const secAttr = newArchetypeObj.secondary_attribute || 'Agility';

      const mapToAttrKey = (name) => {
        if (!name) return null;
        const lower = name.toLowerCase().trim();
        if (lower.includes('strength') || lower.includes('might')) return 'attr-strength';
        if (lower.includes('agility') || lower.includes('reflex')) return 'attr-agility';
        if (lower.includes('stamina') || lower.includes('constitution') || lower.includes('fortitude')) return 'attr-stamina';
        if (lower.includes('intellect') || lower.includes('logic')) return 'attr-intellect';
        if (lower.includes('wisdom') || lower.includes('will')) return 'attr-wisdom';
        if (lower.includes('charisma') || lower.includes('etiquette')) return 'attr-charisma';
        return null;
      };

      const primKey = mapToAttrKey(primAttr) || 'attr-strength';
      const secKey = mapToAttrKey(secAttr) || 'attr-agility';

      // Primary & Secondary Attributes (+3 / +2)
      const allPrimaryKeys = ['attr-strength', 'attr-agility', 'attr-stamina', 'attr-intellect', 'attr-wisdom', 'attr-charisma'];
      allPrimaryKeys.forEach(pk => {
        let pVal = 0;
        if (pk === primKey) pVal = 3;
        else if (pk === secKey) pVal = 2;
        updated[pk] = pVal;

        const subKey = PRIMARY_TO_SUB_ATTR_MAP[pk];
        if (subKey) {
          updated[subKey] = (pVal * 2) + 2;
        }
      });

      // Concept & Role defaults
      if (!updated['char-concept'] || updated['char-concept'].trim() === '' || updated['char-concept'] === 'Unnamed Operative') {
        updated['char-concept'] = newArchetypeObj.core_concept || newArchetypeName;
      }
      if (!updated['char-motive'] || updated['char-motive'].trim() === '') {
        updated['char-motive'] = newArchetypeObj.tactical_role || '';
      }

      // Essential Skills
      const essentialSkills = Array.isArray(newArchetypeObj.essential_skills) ? newArchetypeObj.essential_skills : [];
      const allSkillsList = (dbData.skills && dbData.skills.length > 0) ? dbData.skills : ALL_CANONICAL_SKILLS;

      essentialSkills.forEach((skNameRaw, idx) => {
        const rawStr = String(skNameRaw).trim();
        const lowerRaw = rawStr.toLowerCase();
        const candidatePrefix = rawStr.replace(/\s*\(.*\)/, '').trim().toLowerCase();

        const skObj = allSkillsList.find(s => {
          const sName = (s.name || '').toLowerCase();
          return sName === lowerRaw || sName === candidatePrefix;
        });

        const finalSkillName = skObj?.name || rawStr;
        const cleanId = (skObj?.id || `skill-${finalSkillName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`).replace('skill-', '');
        const rank = idx < 4 ? 6 : 3;
        const baseAttr = skObj?.baseAttr || primKey;

        updated[`skill-${cleanId}-rank`] = rank;
        updated[`skill-${cleanId}-base`] = baseAttr;
        updated[`skill-${cleanId}-name`] = finalSkillName;
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
        newFeaturesToAdd.push({
          id: `feat_arch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: cleanTitle,
          category: 'Archetype Signature',
          source: 'archetype',
          sourceName: newArchetypeName,
          cp: 2,
          description: typeof feat === 'object' ? (feat.description || `Signature feature granted by ${newArchetypeName} archetype.`) : `Signature feature granted by ${newArchetypeName} archetype.`
        });
      }
    });

    updated.features = [...filteredFeatures, ...newFeaturesToAdd];
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

  const updated = { ...characterData, 'char-occu': newOccuName };

  // 1. Old Occupation Trait names
  const oldOccuTraitNames = new Set();
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

  // 2. Clean features
  const currentFeatures = Array.isArray(characterData.features) ? characterData.features : [];
  const filteredFeatures = currentFeatures.filter(f => {
    if (!f) return false;
    const fCat = typeof f === 'object' ? (f.category || f.source || '') : '';
    const fSource = typeof f === 'object' ? (f.source || '') : '';
    const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
    const normName = normalizeTraitString(fName).toLowerCase();
    const rawName = fName.toLowerCase();

    if (fSource === 'occupation' || fCat === 'Occupation Trait' || fCat === 'Occupation') {
      return false;
    }
    if (oldOccuTraitNames.has(normName) || oldOccuTraitNames.has(rawName)) {
      return false;
    }
    return true;
  });

  updated.features = filteredFeatures;
  updated['char-occu-traits'] = [];
  updated.occu_traits = [];
  updated.occuAllocations = { skills: {}, features: [] };

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

  const updated = { ...characterData, 'char-origin': newOriginName };

  // 1. Old Origin Trait names
  const oldOriginTraitNames = new Set();
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

  // 2. Clean features
  const currentFeatures = Array.isArray(characterData.features) ? characterData.features : [];
  const filteredFeatures = currentFeatures.filter(f => {
    if (!f) return false;
    const fCat = typeof f === 'object' ? (f.category || f.source || '') : '';
    const fSource = typeof f === 'object' ? (f.source || '') : '';
    const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
    const normName = normalizeTraitString(fName).toLowerCase();
    const rawName = fName.toLowerCase();

    if (fSource === 'origin' || fCat === 'Origin Trait' || fCat === 'Origin') {
      return false;
    }
    if (oldOriginTraitNames.has(normName) || oldOriginTraitNames.has(rawName)) {
      return false;
    }
    return true;
  });

  updated.features = filteredFeatures;
  updated['char-origin-traits'] = [];
  updated.origin_traits = [];
  updated.originAllocations = { skills: {}, features: [] };

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

  const updated = { ...characterData, 'char-faction': newFactionName };

  // 1. Old Faction Benefit & Hindrance names
  const oldFactionBenefits = new Set();
  const oldFactionHindrances = new Set();

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

  // 2. Clean features
  const currentFeatures = Array.isArray(characterData.features) ? characterData.features : [];
  const filteredFeatures = currentFeatures.filter(f => {
    if (!f) return false;
    const fCat = typeof f === 'object' ? (f.category || f.source || '') : '';
    const fSource = typeof f === 'object' ? (f.source || '') : '';
    const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
    const normName = normalizeTraitString(fName).toLowerCase();
    const rawName = fName.toLowerCase();

    if (fSource === 'faction' || fCat === 'Faction Feature' || fCat === 'Faction Benefit' || fCat === 'Faction') {
      return false;
    }
    if (oldFactionBenefits.has(normName) || oldFactionBenefits.has(rawName)) {
      return false;
    }
    return true;
  });

  // 3. Clean disadvantages
  const currentDisadvantages = Array.isArray(characterData.disadvantages) ? characterData.disadvantages : [];
  const filteredDisadvantages = currentDisadvantages.filter(d => {
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

  // 4. Attach new Faction Benefits and Hindrances (if any)
  const newFeaturesToAdd = [];
  const newDisadvantagesToAdd = [];

  if (newFactionObj && newFactionName) {
    const rawBonus = newFactionObj.bonus_features || newFactionObj.bonusFeatures || newFactionObj.benefits;
    if (Array.isArray(rawBonus)) {
      rawBonus.forEach(b => {
        const bName = typeof b === 'object' ? (b.name || b.title || b.id) : String(b);
        if (bName) {
          newFeaturesToAdd.push({
            id: `feat_fac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: normalizeTraitString(bName),
            category: 'Faction Feature',
            source: 'faction',
            sourceName: newFactionName,
            cp: 0,
            description: typeof b === 'object' ? (b.description || `Granted by ${newFactionName}.`) : `Granted by ${newFactionName}.`
          });
        }
      });
    }

    const rawHind = newFactionObj.hindrances || newFactionObj.disadvantages || newFactionObj.social_weaknesses;
    if (Array.isArray(rawHind)) {
      rawHind.forEach(h => {
        const hName = typeof h === 'object' ? (h.name || h.title || h.id) : String(h);
        if (hName) {
          newDisadvantagesToAdd.push({
            id: `dis_fac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: normalizeTraitString(hName),
            category: 'Faction Hindrance',
            source: 'faction',
            sourceName: newFactionName,
            bp: 3,
            description: typeof h === 'object' ? (h.description || `Faction allegiance restriction of ${newFactionName}.`) : `Faction restriction of ${newFactionName}.`
          });
        }
      });
    }
  }

  updated.features = [...filteredFeatures, ...newFeaturesToAdd];
  updated.disadvantages = [...filteredDisadvantages, ...newDisadvantagesToAdd];
  updated.factionAllocations = { skills: {}, features: [] };

  return updated;
};

/**
 * Universal dispatcher for any of the 5 identity field changes.
 */
export const applyIdentityFieldTransition = (characterData, fieldKey, newValue, dbData = {}, options = {}) => {
  switch (fieldKey) {
    case 'char-species':
      return applySpeciesTransition(characterData, newValue, dbData);
    case 'char-archetype':
      return applyArchetypeTransition(characterData, newValue, dbData, options);
    case 'char-occu':
      return applyOccupationTransition(characterData, newValue, dbData);
    case 'char-origin':
      return applyOriginTransition(characterData, newValue, dbData);
    case 'char-faction':
      return applyFactionTransition(characterData, newValue, dbData);
    default:
      return { ...characterData, [fieldKey]: newValue };
  }
};
