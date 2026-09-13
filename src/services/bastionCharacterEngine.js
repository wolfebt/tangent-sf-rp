/**
 * @file bastionCharacterEngine.js
 * @description Master BASTION AI Character Synthesis Engine
 * 
 * Rules Protocol:
 * If a character is created by BASTION, it MUST use aspects from the canonical game database
 * and NOT make entirely new content.
 * 
 * The synthesis strictly proceeds through the 5 Pillars in order:
 * 1. Archetype: Closest canonical archetype from DEFAULT_ARCHETYPES.
 * 2. Species: Canonical species from DEFAULT_SPECIES fitting archetype/concept.
 * 3. Faction: Canonical faction from DEFAULT_FACTIONS (prioritizing archetype's recommended factions).
 * 4. Origin: Canonical origin from DEFAULT_ORIGINS (prioritizing archetype's recommended origins).
 * 5. Occupation: Canonical occupation from DEFAULT_OCCUPATIONS (prioritizing archetype's recommended occupations).
 * 
 * All secondary assets (attributes, skills, features, traits, property/equipment, and narrative)
 * are derived directly from these 5 pillars.
 */

import { DEFAULT_ARCHETYPES } from '../data/archetypesData.js';
import { DEFAULT_SPECIES } from '../data/speciesData.js';
import { DEFAULT_FACTIONS } from '../data/factionsData.js';
import { DEFAULT_ORIGINS } from '../data/originsData.js';
import { DEFAULT_OCCUPATIONS } from '../data/occupationsData.js';
import { ALL_CANONICAL_SKILLS } from '../data/skillsData.js';
import { DEFAULT_FEATURES } from '../data/featuresData.js';
import { ALL_CANONICAL_TRAITS } from '../data/speciesTraitsData.js';
import { DEFAULT_WEAPONRY } from '../data/weaponryData.js';
import { DEFAULT_ARMORING } from '../data/armoringData.js';

/**
 * Standard string normalization for token comparisons
 */
const cleanTokens = (str) => {
  if (!str) return [];
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
};

/**
 * Maps attribute name to canonical folio attribute key
 */
const mapToAttrKey = (name) => {
  if (!name) return 'attr-strength';
  const lower = String(name).toLowerCase().trim();
  if (lower.startsWith('attr-')) return lower;
  if (lower.includes('strength') || lower.includes('might')) return 'attr-strength';
  if (lower.includes('agility') || lower.includes('reflex')) return 'attr-agility';
  if (lower.includes('stamina') || lower.includes('fortitude') || lower.includes('con')) return 'attr-stamina';
  if (lower.includes('intellect') || lower.includes('logic') || lower.includes('reason')) return 'attr-intellect';
  if (lower.includes('wisdom') || lower.includes('will')) return 'attr-wisdom';
  if (lower.includes('charisma') || lower.includes('etiquette') || lower.includes('social')) return 'attr-charisma';
  return 'attr-strength';
};

export const CONCEPT_ARCHETYPE_MAP = {
  sniper: 'The Ghost',
  marksman: 'The Ghost',
  sharpshooter: 'The Ghost',
  hacker: 'The Decker',
  netrunner: 'The Decker',
  bounty_hunter: 'The Manhunter',
  gunslinger: 'The Quick-draw',
  pilot: 'The Ace',
  healer: 'The Field Medic',
  doctor: 'The Field Medic',
  medic: 'The Field Medic',
  blacksmith: 'The Armorer',
  crafter: 'The Maker',
  engineer: 'The Technician',
  tank: 'The Shock Trooper',
  paladin: 'The Protector',
  defender: 'The Protector',
  assassin: 'The Silent Blade',
  thief: 'The Shadow-stepper',
  rogue: 'The Shadow-stepper',
  pirate: 'The Privateer',
  smuggler: 'The Smuggler',
  diplomat: 'The Envoy',
  ambassador: 'The Envoy',
  spy: 'The Operative',
  infiltrator: 'The Ghost',
  detective: 'The Detective',
  scientist: 'The Biologist',
  sorcerer: 'The Magus',
  wizard: 'The Magus',
  mage: 'The Magus',
  priest: 'The Priest',
  shaman: 'The Spirit-walker',
  psionic: 'The Mystic',
  commander: 'The Commander'
};

/**
 * 1. Find the Closest Canonical Archetype
 * Evaluates the user's prompt against all 100 canonical archetypes in DEFAULT_ARCHETYPES.
 */
export const findClosestArchetype = (prompt, archetypesList = DEFAULT_ARCHETYPES) => {
  if (!Array.isArray(archetypesList) || archetypesList.length === 0) {
    return DEFAULT_ARCHETYPES[0];
  }

  const cleanPrompt = String(prompt || '').trim();
  if (!cleanPrompt) {
    // Default to a balanced Sentinel or Operative if empty
    return archetypesList.find(a => a.name === 'The Vanguard' || a.name === 'The Sentinel' || a.id === 'archetype-vanguard') || archetypesList[0];
  }

  const promptLower = cleanPrompt.toLowerCase();
  const promptTokens = cleanTokens(promptLower);

  // Check direct trope alias first
  for (const [trope, archName] of Object.entries(CONCEPT_ARCHETYPE_MAP)) {
    if (promptTokens.includes(trope) || promptLower.includes(trope.replace('_', ' '))) {
      const matched = archetypesList.find(a => a.name === archName);
      if (matched && !promptTokens.includes('operative') && !archetypesList.some(a => promptTokens.includes(a.name.toLowerCase().replace(/^the\s+/, '')))) {
        return matched;
      }
    }
  }

  let bestMatch = archetypesList[0];
  let highestScore = -1;

  for (const arch of archetypesList) {
    let score = 0;
    const nameLower = (arch.name || '').toLowerCase();
    const cleanName = nameLower.replace(/^the\s+/, '').trim();
    const conceptLower = (arch.core_concept || '').toLowerCase();
    const roleLower = (arch.tactical_role || '').toLowerCase();
    const summaryLower = (arch.summary || '').toLowerCase();
    const sphereLower = (arch.sphere || '').toLowerCase();

    // Direct name match (e.g. "Sniper" or "The Sniper")
    if (promptLower.includes(cleanName) || promptLower.includes(nameLower)) {
      score += 100;
    }

    // Token matches in core concept / role
    for (const token of promptTokens) {
      if (cleanName.includes(token)) score += 30;
      if (conceptLower.includes(token)) score += 15;
      if (roleLower.includes(token)) score += 12;
      if (summaryLower.includes(token)) score += 8;
      if (sphereLower.includes(token)) score += 5;

      // Essential skills keyword matches
      if (Array.isArray(arch.essential_skills)) {
        for (const skill of arch.essential_skills) {
          if (String(skill).toLowerCase().includes(token)) {
            score += 10;
          }
        }
      }

      // Recommended occupation keyword matches
      if (Array.isArray(arch.recommended_occupations)) {
        for (const occu of arch.recommended_occupations) {
          if (String(occu).toLowerCase().includes(token)) {
            score += 8;
          }
        }
      }

      // Recommended origin keyword matches
      if (Array.isArray(arch.recommended_origins)) {
        for (const orig of arch.recommended_origins) {
          if (String(orig).toLowerCase().includes(token)) {
            score += 8;
          }
        }
      }

      // Recommended faction keyword matches
      if (Array.isArray(arch.recommended_factions)) {
        for (const fac of arch.recommended_factions) {
          if (String(fac).toLowerCase().includes(token)) {
            score += 8;
          }
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = arch;
    }
  }

  return bestMatch;
};

/**
 * 2. Select Canonical Species
 * Grounded in the closest Archetype and user prompt.
 */
export const selectPillarSpecies = (archetype, prompt = '', speciesList = DEFAULT_SPECIES) => {
  const pLower = (prompt || '').toLowerCase();

  // Check if prompt explicitly requested a canonical species
  for (const sp of speciesList) {
    const spName = (sp.name || sp.title || '').toLowerCase();
    const cleanSp = spName.replace(/\s*\(.*\)/, '').trim();
    if (pLower.includes(spName) || (cleanSp.length > 3 && pLower.includes(cleanSp))) {
      return sp;
    }
  }

  // Common lineage aliases in prompt
  if (pLower.includes('elf') || pLower.includes('elven') || pLower.includes('aeld')) {
    const elven = speciesList.find(s => s.name?.includes('Celestine') || s.name?.includes('Alterian') || s.parent_species === 'Aeld');
    if (elven) return elven;
  }
  if (pLower.includes('robot') || pLower.includes('android') || pLower.includes('synth') || pLower.includes('cyborg')) {
    const synth = speciesList.find(s => s.name?.toLowerCase().includes('android') || s.id?.includes('synth'));
    if (synth) return synth;
  }
  if (pLower.includes('cat') || pLower.includes('feline') || pLower.includes('auluran')) {
    const aulu = speciesList.find(s => s.name?.toLowerCase().includes('auluran'));
    if (aulu) return aulu;
  }
  if (pLower.includes('bug') || pLower.includes('insect') || pLower.includes('kitin')) {
    const kit = speciesList.find(s => s.name?.toLowerCase().includes('kitin'));
    if (kit) return kit;
  }

  // If archetype has key attributes, align species strengths
  const primAttr = (archetype?.primary_attribute || '').toLowerCase();
  if (primAttr.includes('intellect') || primAttr.includes('wisdom')) {
    const mindSp = speciesList.find(s => s.name === 'Celestine (Alterian)' || s.name?.includes('Alterian'));
    if (mindSp) return mindSp;
  }
  if (primAttr.includes('agility')) {
    const agiSp = speciesList.find(s => s.name?.includes('Auluran - Koda') || s.name?.includes('Human - Spacer'));
    if (agiSp) return agiSp;
  }

  // Default to versatile Human (Base)
  return speciesList.find(s => s.name === 'Human (Base)' || s.id === 'species-human-base') || speciesList[0];
};

/**
 * 3. Select Canonical Faction
 * Aligns with Archetype's recommended_factions or prompt.
 */
export const selectPillarFaction = (archetype, prompt = '', factionsList = DEFAULT_FACTIONS) => {
  const pLower = (prompt || '').toLowerCase();

  // Check prompt for direct faction mentions
  for (const fac of factionsList) {
    const fName = (fac.name || fac.title || '').toLowerCase();
    if (fName.length > 3 && pLower.includes(fName)) {
      return fac;
    }
  }

  // Priority: Check Archetype's recommended_factions
  if (Array.isArray(archetype?.recommended_factions) && archetype.recommended_factions.length > 0) {
    for (const rec of archetype.recommended_factions) {
      const recLower = String(rec).toLowerCase();
      const recClean = recLower.replace(/\s*\(.*\)/, '').trim();

      const matched = factionsList.find(f => {
        const fn = (f.name || f.title || f.id || '').toLowerCase();
        return fn.includes(recClean) || recClean.includes(fn);
      });
      if (matched) return matched;
    }
  }

  // Default to major central polity: Incorporated Planetary Syndication or Dracon Dynasty
  return factionsList.find(f => f.name?.includes('Syndicat') || f.id === 'syndicate-corps') ||
         factionsList.find(f => f.name?.includes('Dynasty')) ||
         factionsList[0];
};

/**
 * 4. Select Canonical Origin
 * Aligns with Archetype's recommended_origins or prompt.
 */
export const selectPillarOrigin = (archetype, prompt = '', originsList = DEFAULT_ORIGINS) => {
  const pLower = (prompt || '').toLowerCase();

  // Check prompt for origin mentions
  for (const orig of originsList) {
    const oName = (orig.name || orig.title || '').toLowerCase();
    if (oName.length > 3 && pLower.includes(oName)) {
      return orig;
    }
  }

  // Priority: Check Archetype's recommended_origins
  if (Array.isArray(archetype?.recommended_origins) && archetype.recommended_origins.length > 0) {
    for (const rec of archetype.recommended_origins) {
      const recLower = String(rec).toLowerCase().trim();
      const matched = originsList.find(o => {
        const on = (o.name || o.title || o.id || '').toLowerCase();
        return on === recLower || on.includes(recLower) || recLower.includes(on);
      });
      if (matched) return matched;
    }
  }

  // Default to Urban or Colony
  return originsList.find(o => o.name === 'Urban' || o.id === 'origin-urban') ||
         originsList.find(o => o.name === 'Colony') ||
         originsList[0];
};

/**
 * 5. Select Canonical Occupation
 * Aligns with Archetype's recommended_occupations or prompt.
 */
export const selectPillarOccupation = (archetype, prompt = '', occupationsList = DEFAULT_OCCUPATIONS) => {
  const pLower = (prompt || '').toLowerCase();

  // Check prompt for occupation mentions
  for (const occu of occupationsList) {
    const ocName = (occu.name || occu.title || '').toLowerCase();
    if (ocName.length > 3 && pLower.includes(ocName)) {
      return occu;
    }
  }

  // Priority: Check Archetype's recommended_occupations
  if (Array.isArray(archetype?.recommended_occupations) && archetype.recommended_occupations.length > 0) {
    for (const rec of archetype.recommended_occupations) {
      const recLower = String(rec).toLowerCase().trim();
      const matched = occupationsList.find(o => {
        const ocn = (o.name || o.title || o.id || '').toLowerCase();
        return ocn === recLower || ocn.includes(recLower) || recLower.includes(ocn);
      });
      if (matched) return matched;
    }
  }

  // Default to Soldier or Operative or Infiltrator
  return occupationsList.find(o => o.name === 'Soldier' || o.id === 'occupation-soldier') ||
         occupationsList.find(o => o.name === 'Agent') ||
         occupationsList[0];
};

/**
 * Derives Core Primary Attributes & Sub-Attributes based on Archetype and Species
 */
export const derivePillarAttributes = ({ archetype, species }) => {
  const primKey = mapToAttrKey(archetype?.primary_attribute || 'Strength');
  const secKey = mapToAttrKey(archetype?.secondary_attribute || 'Agility');

  // Base raw scores (Starts at 0, 5 BP per point)
  // Archetype grants +3 Primary (15 BP) and +2 Secondary (10 BP)
  // Complementary: +1 to Stamina or Wisdom for survival (5 BP)
  const baseScores = {
    'attr-strength': 0,
    'attr-agility': 0,
    'attr-stamina': 0,
    'attr-intellect': 0,
    'attr-wisdom': 0,
    'attr-charisma': 0
  };

  baseScores[primKey] = (baseScores[primKey] || 0) + 3;
  baseScores[secKey] = (baseScores[secKey] || 0) + 2;

  // Add 1 point to stamina if not already allocated for vitals buffer
  if (baseScores['attr-stamina'] === 0) {
    baseScores['attr-stamina'] = 1;
  }

  // Apply Species inherent attribute modifiers
  const speciesMods = {};
  if (species && Array.isArray(species.inherent_attribute_modifiers)) {
    species.inherent_attribute_modifiers.forEach(m => {
      const aName = typeof m === 'object' ? (m.attribute || m.name) : String(m);
      const bonus = typeof m === 'object' ? (m.bonus ?? m.value ?? 1) : 1;
      const k = mapToAttrKey(aName);
      if (k) speciesMods[k] = (speciesMods[k] || 0) + bonus;
    });
  } else if (species && Array.isArray(species.modifiers)) {
    species.modifiers.forEach(m => {
      if (m.type === 'attribute' && m.target) {
        const k = mapToAttrKey(m.target);
        if (k) speciesMods[k] = (speciesMods[k] || 0) + (m.value || 1);
      }
    });
  }

  const finalAttrs = {};
  for (const [key, baseVal] of Object.entries(baseScores)) {
    const spBonus = speciesMods[key] || 0;
    // Cap raw attribute at 4 (canonical creation ceiling)
    finalAttrs[key] = Math.min(4, baseVal) + spBonus;
  }

  // Canonical Sub-Attribute Derivation: Base = 2 + (Primary * 2)
  const might = (finalAttrs['attr-strength'] * 2) + 2;
  const reflex = (finalAttrs['attr-agility'] * 2) + 2;
  const fort = (finalAttrs['attr-stamina'] * 2) + 2;
  const logic = (finalAttrs['attr-intellect'] * 2) + 2;
  const will = (finalAttrs['attr-wisdom'] * 2) + 2;
  const etiq = (finalAttrs['attr-charisma'] * 2) + 2;

  return {
    rawAttributes: baseScores,
    speciesModifiers: speciesMods,
    finalAttributes: {
      ...finalAttrs,
      'attr-might': might,
      'attr-reflex': reflex,
      'attr-fortitude': fort,
      'attr-logic': logic,
      'attr-reason': logic,
      'attr-wisdom': finalAttrs['attr-wisdom'],
      'attr-will': will,
      'attr-willpower': will,
      'attr-charisma': finalAttrs['attr-charisma'],
      'attr-etiquette': etiq
    }
  };
};

/**
 * Derives Skills based strictly on the 5 Pillars:
 * - Faction: 20 SP dedicated pool
 * - Origin: 20 SP dedicated pool
 * - Occupation: 20 SP dedicated pool
 * - Archetype: Essential skills
 * - Species: Inherent bonus skills
 */
export const derivePillarSkills = ({
  archetype,
  species,
  faction,
  origin,
  occupation,
  skillsList = ALL_CANONICAL_SKILLS
}) => {
  const factionAllocations = { skills: {} };
  const originAllocations = { skills: {} };
  const occuAllocations = { skills: {} };
  const speciesAllocations = { skills: {} };
  const generalAllocations = { skills: {} };

  // Helper to find canonical skill by name or substring
  const findCanonicalSkill = (rawName) => {
    if (!rawName) return null;
    const clean = String(rawName).trim();
    const cleanLower = clean.toLowerCase();
    const innerClean = clean.replace(/^(knowledge|vocation|discipline|metafocus)\s*[-:]?\s*/i, '').replace(/[()]/g, '').trim().toLowerCase();

    return skillsList.find(s => {
      const sName = (s.name || '').toLowerCase();
      return sName === cleanLower || sName === innerClean ||
             sName.includes(innerClean) || innerClean.includes(sName);
    }) || null;
  };

  // Helper to distribute 20 points across an array of skill names (max 6 ranks per skill at creation)
  const distributePoolPoints = (rawSkillList, allocationTarget, totalPoints = 20) => {
    const list = Array.isArray(rawSkillList) ? rawSkillList.filter(Boolean) : [];
    if (list.length === 0) return;

    let pointsLeft = totalPoints;
    const count = Math.min(list.length, 5);
    const baseRank = Math.floor(totalPoints / count);

    for (let i = 0; i < count; i++) {
      if (pointsLeft <= 0) break;
      const raw = list[i];
      const canon = findCanonicalSkill(typeof raw === 'object' ? (raw.skill || raw.name) : raw);
      if (canon) {
        const allocRank = i === count - 1 ? pointsLeft : Math.min(baseRank, pointsLeft, 6);
        allocationTarget.skills[canon.name] = (allocationTarget.skills[canon.name] || 0) + allocRank;
        pointsLeft -= allocRank;
      }
    }
  };

  // 1. Faction Pool (20 SP)
  const factionSkills = faction?.skill_package || faction?.skills || [
    'Computers', 'Knowledge (Culture)', 'Diplomacy', 'Knowledge (Technology)'
  ];
  distributePoolPoints(factionSkills, factionAllocations, 20);

  // 2. Origin Pool (20 SP)
  const originSkills = origin?.society_skills || origin?.skills || [
    'Alertness', 'Athletics', 'Knowledge (Survival)', 'Piloting'
  ];
  distributePoolPoints(originSkills, originAllocations, 20);

  // 3. Occupation Pool (20 SP)
  const occuSkills = occupation?.professional_skills || occupation?.skills || [
    'Tactics', 'Heavy Weapons', 'Melee', 'Athletics'
  ];
  distributePoolPoints(occuSkills, occuAllocations, 20);

  // 4. Species Bonus Skills (if present)
  if (species && Array.isArray(species.specific_skill_bonuses)) {
    species.specific_skill_bonuses.forEach(sb => {
      const canon = findCanonicalSkill(sb.skill);
      if (canon) {
        speciesAllocations.skills[canon.name] = (speciesAllocations.skills[canon.name] || 0) + (sb.bonus || 2);
      }
    });
  }

  // 5. Archetype Essential Skills (Trained ranks)
  if (archetype && Array.isArray(archetype.essential_skills)) {
    archetype.essential_skills.forEach((sk, idx) => {
      const canon = findCanonicalSkill(sk);
      if (canon) {
        const r = idx < 2 ? 5 : 3;
        generalAllocations.skills[canon.name] = Math.max(generalAllocations.skills[canon.name] || 0, r);
      }
    });
  }

  // Combine and deduplicate skills
  const combined = {};
  const mergeToCombined = (pool) => {
    Object.entries(pool.skills || {}).forEach(([sName, sRank]) => {
      combined[sName] = (combined[sName] || 0) + sRank;
    });
  };

  mergeToCombined(factionAllocations);
  mergeToCombined(originAllocations);
  mergeToCombined(occuAllocations);
  mergeToCombined(speciesAllocations);
  mergeToCombined(generalAllocations);

  // Build structured array and flat bindings
  const finalSkillsList = [];
  const flatBindings = {};

  Object.entries(combined).forEach(([name, rank], i) => {
    const canon = findCanonicalSkill(name) || {
      name,
      id: `skill-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      baseAttr: 'attr-intellect'
    };

    const cappedRank = Math.min(11, Math.max(1, rank)); // Hard cap 11 at creation
    finalSkillsList.push({
      id: `skill_${i}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      name,
      rank: cappedRank,
      baseAttr: canon.baseAttr || 'attr-intellect'
    });

    const cleanId = (canon.id || `skill-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`).replace(/^skill-/, '');
    flatBindings[`skill-${cleanId}-rank`] = cappedRank;
    flatBindings[`skill-${cleanId}-base`] = canon.baseAttr || 'attr-intellect';
    flatBindings[`skill-${cleanId}-mod`] = 0;
    flatBindings[`skill-${cleanId}-name`] = name;
    if (canon.group) flatBindings[`skill-${cleanId}-group`] = canon.group;
    if (canon.subcategory) flatBindings[`skill-${cleanId}-subcategory`] = canon.subcategory;
  });

  return {
    factionAllocations,
    originAllocations,
    occuAllocations,
    speciesAllocations,
    generalAllocations,
    finalSkillsList,
    flatBindings
  };
};

/**
 * Derives Traits and Features grounded in the 5 Pillars
 */
export const derivePillarTraitsAndFeatures = ({
  archetype,
  species,
  faction,
  origin,
  occupation,
  featuresList = DEFAULT_FEATURES,
  traitsList = ALL_CANONICAL_TRAITS
}) => {
  const finalTraits = [];
  const finalFeatures = [];
  const seenTraits = new Set();
  const seenFeatures = new Set();

  const addTrait = (name, source, category, bp = 0, isGranted = true) => {
    if (!name) return;
    const cleanName = String(name).replace(/^trait-/i, '').replace(/[-_]/g, ' ').trim();
    const lookup = cleanName.toLowerCase();
    if (seenTraits.has(lookup)) return;
    seenTraits.add(lookup);

    const detail = traitsList.find(t => (t.name || t.id || '').toLowerCase() === lookup) || {};
    finalTraits.push({
      id: detail.id || `trait_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: detail.name || cleanName.replace(/\b\w/g, c => c.toUpperCase()),
      category: detail.category || category || 'General',
      trait_type: detail.trait_type || category || 'General',
      source,
      bp: isGranted ? 0 : (detail.bp || 1),
      isGranted,
      description: detail.description || detail.mechanics || `Trait granted by ${source}.`
    });
  };

  const addFeature = (name, source, category, cp = 3, isGranted = true) => {
    if (!name) return;
    const cleanName = String(name).replace(/^feature-/i, '').replace(/[-_]/g, ' ').trim();
    const lookup = cleanName.toLowerCase();
    if (seenFeatures.has(lookup)) return;
    seenFeatures.add(lookup);

    const detail = featuresList.find(f => (f.name || f.id || '').toLowerCase() === lookup) || {};
    finalFeatures.push({
      id: detail.id || `feat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: detail.name || cleanName.replace(/\b\w/g, c => c.toUpperCase()),
      category: detail.category || category || 'General',
      source,
      cp: isGranted ? 0 : (detail.cp || cp),
      isGranted,
      description: detail.description || detail.mechanic || `Feature granted by ${source}.`,
      mechanic: detail.mechanic || detail.description || ''
    });
  };

  // 1. Species Inherent Traits & Features
  if (species && Array.isArray(species.inherent_features)) {
    species.inherent_features.forEach(f => {
      const str = typeof f === 'object' ? (f.name || f.id) : String(f);
      addTrait(str, 'species', 'Species Inherent', 0, true);
    });
  }

  // 2. Origin Traits (Select 2 from Origin's traits list)
  if (origin && Array.isArray(origin.traits)) {
    const originPicks = origin.traits.slice(0, 2);
    originPicks.forEach(t => {
      addTrait(typeof t === 'object' ? (t.name || t.id) : t, 'origin', 'Origin Trait', 0, true);
    });
  }

  // 3. Occupation Traits (Select 2 from Occupation's traits list)
  if (occupation && Array.isArray(occupation.traits)) {
    const occuPicks = occupation.traits.slice(0, 2);
    occuPicks.forEach(t => {
      addTrait(typeof t === 'object' ? (t.name || t.id) : t, 'occupation', 'Occupation Trait', 0, true);
    });
  }

  // 4. Archetype Signature Features
  if (archetype && Array.isArray(archetype.signature_features)) {
    archetype.signature_features.forEach(feat => {
      addFeature(typeof feat === 'object' ? (feat.name || feat.id) : feat, 'archetype', 'Archetype Signature', 2, true);
    });
  }

  // 5. Faction Recommended Features
  if (faction) {
    const recFeats = faction.recommended_features || faction.bonus_features || [];
    if (Array.isArray(recFeats) && recFeats.length > 0) {
      addFeature(recFeats[0], 'faction', 'Faction Feature', 2, true);
    }
  }

  // 6. Occupation Recommended Features
  if (occupation) {
    const occuFeats = occupation.recommended_features || [];
    if (Array.isArray(occuFeats) && occuFeats.length > 0) {
      addFeature(occuFeats[0], 'occupation', 'Occupation Feature', 2, true);
    }
  }

  return {
    traits: finalTraits,
    features: finalFeatures
  };
};

/**
 * Derives Starting Property (Weapons, Armor, Gear) grounded in Pillars and Tech Level
 */
export const derivePillarProperty = ({
  archetype,
  occupation,
  faction,
  species,
  techLevel = 3,
  weaponryList = DEFAULT_WEAPONRY,
  armoringList = DEFAULT_ARMORING
}) => {
  const tl = Number(techLevel) || 3;
  const weapons = [];
  const armor = [];
  const gear = [];

  // Tactical classification based on Archetype tactical role / concept
  const concept = (archetype?.core_concept || '').toLowerCase();
  const role = (archetype?.tactical_role || '').toLowerCase();
  const occuName = (occupation?.name || '').toLowerCase();

  // Weapon selection from DEFAULT_WEAPONRY
  const validWeapons = weaponryList.filter(w => (Number(w.tech_level) || 3) <= Math.max(1, tl));

  let primaryWeapon = null;
  let secondaryWeapon = null;

  if (role.includes('ranged') || concept.includes('ranged') || occuName.includes('soldier') || role.includes('sniper')) {
    primaryWeapon = validWeapons.find(w => w.name?.toLowerCase().includes('rifle') || w.name?.toLowerCase().includes('plasma')) || validWeapons[0];
    secondaryWeapon = validWeapons.find(w => w.name?.toLowerCase().includes('pistol')) || validWeapons[1];
  } else if (role.includes('tank') || concept.includes('melee') || role.includes('frontline')) {
    primaryWeapon = validWeapons.find(w => w.name?.toLowerCase().includes('blade') || w.name?.toLowerCase().includes('sword') || w.name?.toLowerCase().includes('hammer')) || validWeapons[0];
    secondaryWeapon = validWeapons.find(w => w.name?.toLowerCase().includes('shotgun') || w.name?.toLowerCase().includes('pistol')) || validWeapons[1];
  } else {
    // Infiltrator / Diplomat / Savant
    primaryWeapon = validWeapons.find(w => w.name?.toLowerCase().includes('pistol') || w.name?.toLowerCase().includes('dagger')) || validWeapons[0];
  }

  if (primaryWeapon) {
    weapons.push({
      id: primaryWeapon.id || `wpn_${Date.now()}_1`,
      name: primaryWeapon.name,
      damage: primaryWeapon.damage || '2d6',
      damage_type: primaryWeapon.damage_type || 'Kinetic',
      range: primaryWeapon.range || '10/30/60',
      tl: primaryWeapon.tech_level || tl,
      qty: 1
    });
  }

  if (secondaryWeapon && secondaryWeapon.name !== primaryWeapon?.name) {
    weapons.push({
      id: secondaryWeapon.id || `wpn_${Date.now()}_2`,
      name: secondaryWeapon.name,
      damage: secondaryWeapon.damage || '1d8',
      damage_type: secondaryWeapon.damage_type || 'Kinetic',
      range: secondaryWeapon.range || '5/15/30',
      tl: secondaryWeapon.tech_level || tl,
      qty: 1
    });
  }

  // Armor selection from DEFAULT_ARMORING
  const validArmor = armoringList.filter(a => (Number(a.tech_level) || 3) <= Math.max(1, tl));
  let chosenArmor = null;

  if (role.includes('tank') || concept.includes('defense') || occuName.includes('soldier')) {
    chosenArmor = validArmor.find(a => a.name?.toLowerCase().includes('combat') || a.name?.toLowerCase().includes('heavy')) || validArmor[0];
  } else {
    chosenArmor = validArmor.find(a => a.name?.toLowerCase().includes('jacket') || a.name?.toLowerCase().includes('light') || a.name?.toLowerCase().includes('weave')) || validArmor[0];
  }

  if (chosenArmor) {
    armor.push({
      id: chosenArmor.id || `arm_${Date.now()}_1`,
      name: chosenArmor.name,
      dr: chosenArmor.dr || 8,
      durability: chosenArmor.durability || '20',
      tl: chosenArmor.tech_level || tl,
      qty: 1
    });
  }

  // Tactical Gear Kit calibrated to Occupation
  const gearItems = [
    { name: `TL-${tl} Field Comm-Link`, qty: 1, weight: 0.5, notes: 'Secure encrypted planetary transmission' },
    { name: `TL-${tl} Standard Trauma Medkit`, qty: 1, weight: 2, notes: 'Stabilizes critical injuries' },
    { name: `TL-${tl} Multi-Optics Scanner`, qty: 1, weight: 1, notes: 'Infrared and biosignature tracking' }
  ];

  if (occuName.includes('pilot') || occuName.includes('engineer')) {
    gearItems.push({ name: `TL-${tl} Diagnostics Toolset`, qty: 1, weight: 3, notes: 'Vehicle and avionics repairs' });
  } else if (occuName.includes('agent') || occuName.includes('spy')) {
    gearItems.push({ name: `TL-${tl} Cyberdeck Interface Cable`, qty: 1, weight: 0.5, notes: 'Direct terminal bypass' });
  }

  gearItems.forEach((g, idx) => {
    gear.push({
      id: `gear_${Date.now()}_${idx}`,
      name: g.name,
      qty: g.qty,
      weight: g.weight,
      notes: g.notes,
      tl
    });
  });

  return { weapons, armor, gear };
};

/**
 * Derives Lore and Narrative Fields Grounded Strictly in the 5 Pillars
 */
export const derivePillarNarrative = ({
  archetype,
  species,
  faction,
  origin,
  occupation,
  prompt = ''
}) => {
  const aName = archetype?.name || 'Operative';
  const spName = species?.name || 'Human (Base)';
  const fName = faction?.name || 'Independent';
  const oName = origin?.name || 'Urban';
  const ocName = occupation?.name || 'Specialist';

  // Generate an evocative designation
  const cleanArch = aName.replace(/^The\s+/, '');
  const charName = `${cleanArch} of ${oName}`;

  const concept = `${spName} ${cleanArch} trained as a ${ocName}, serving the interests of the ${fName}.`;
  const summary = `A ${spName} ${ocName} hailing from the ${oName} frontier, embodying the principles of ${aName} under ${fName} doctrine.`;
  const motive = archetype?.tactical_role || `Protecting squad assets and executing ${fName} objectives across the Reach.`;
  
  const backstory = `Born and forged within the demanding environment of a ${oName} habitat, this ${spName} operative recognized early on their natural aptitude as ${aName}.\n\n` +
    `Pursuing professional certification as a ${ocName}, they attracted the strategic attention of the ${fName}. ` +
    `Through rigorous training and adherence to faction protocols, they have honed their capabilities to operate seamlessly across high-threat science fantasy conflict zones, ` +
    `relying on proven equipment, disciplined reflex conditioning, and the foundational wisdom of their heritage.`;

  return {
    'char-name': charName,
    'char-concept': concept,
    'char-archetype': aName,
    'char-species': spName,
    'char-faction': fName,
    'char-origin': oName,
    'char-occu': ocName,
    role: archetype?.tactical_role || cleanArch,
    summary,
    'char-motive': motive,
    backstory,
    appearance: `${spName} physiology tailored with functional ${ocName} tactical attire bearing subtle ${fName} insignia.`
  };
};

/**
 * Master Synthesis Function: synthesizeCharacterWithBastion
 * Combines all 5 Pillars and derives complete, validated character data.
 */
export const synthesizeCharacterWithBastion = ({
  prompt = '',
  preferredArchetype = null,
  preferredSpecies = null,
  preferredFaction = null,
  preferredOrigin = null,
  preferredOccupation = null,
  techLevel = 3,
  dbData = {}
}) => {
  const archetypesList = dbData.archetypes && dbData.archetypes.length > 0 ? dbData.archetypes : DEFAULT_ARCHETYPES;
  const speciesList = dbData.species && dbData.species.length > 0 ? dbData.species : DEFAULT_SPECIES;
  const factionsList = dbData.factions && dbData.factions.length > 0 ? dbData.factions : DEFAULT_FACTIONS;
  const originsList = dbData.origins && dbData.origins.length > 0 ? dbData.origins : DEFAULT_ORIGINS;
  const occupationsList = dbData.occupations && dbData.occupations.length > 0 ? dbData.occupations : DEFAULT_OCCUPATIONS;
  const skillsList = dbData.skills && dbData.skills.length > 0 ? dbData.skills : ALL_CANONICAL_SKILLS;
  const featuresList = dbData.features && dbData.features.length > 0 ? dbData.features : DEFAULT_FEATURES;
  const traitsList = dbData.traits && dbData.traits.length > 0 ? dbData.traits : ALL_CANONICAL_TRAITS;
  const weaponryList = dbData.weaponry && dbData.weaponry.length > 0 ? dbData.weaponry : DEFAULT_WEAPONRY;
  const armoringList = dbData.armoring && dbData.armoring.length > 0 ? dbData.armoring : DEFAULT_ARMORING;

  // 1. Pillar 1: Archetype (The Anchor)
  const archetype = preferredArchetype
    ? (archetypesList.find(a => a.name === preferredArchetype || a.id === preferredArchetype) || findClosestArchetype(prompt, archetypesList))
    : findClosestArchetype(prompt, archetypesList);

  // 2. Pillar 2: Species
  const species = preferredSpecies
    ? (speciesList.find(s => s.name === preferredSpecies || s.id === preferredSpecies) || selectPillarSpecies(archetype, prompt, speciesList))
    : selectPillarSpecies(archetype, prompt, speciesList);

  // 3. Pillar 3: Faction
  const faction = preferredFaction
    ? (factionsList.find(f => f.name === preferredFaction || f.id === preferredFaction) || selectPillarFaction(archetype, prompt, factionsList))
    : selectPillarFaction(archetype, prompt, factionsList);

  // 4. Pillar 4: Origin
  const origin = preferredOrigin
    ? (originsList.find(o => o.name === preferredOrigin || o.id === preferredOrigin) || selectPillarOrigin(archetype, prompt, originsList))
    : selectPillarOrigin(archetype, prompt, originsList);

  // 5. Pillar 5: Occupation
  const occupation = preferredOccupation
    ? (occupationsList.find(oc => oc.name === preferredOccupation || oc.id === preferredOccupation) || selectPillarOccupation(archetype, prompt, occupationsList))
    : selectPillarOccupation(archetype, prompt, occupationsList);

  // Derive all aspects strictly from these 5 pillars
  const attrData = derivePillarAttributes({ archetype, species });
  const skillData = derivePillarSkills({ archetype, species, faction, origin, occupation, skillsList });
  const traitFeatData = derivePillarTraitsAndFeatures({ archetype, species, faction, origin, occupation, featuresList, traitsList });
  const propertyData = derivePillarProperty({ archetype, occupation, faction, species, techLevel, weaponryList, armoringList });
  const narrativeData = derivePillarNarrative({ archetype, species, faction, origin, occupation, prompt });

  const docId = `char_bastion_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Enriched background allocation objects for seamless compatibility with Guided Creator pools
  const enrichedOriginAllocations = {
    skills: { ...(skillData.originAllocations?.skills || {}) },
    traits: traitFeatData.traits.filter(t => t.source === 'origin').map(t => t.name),
    features: []
  };

  const enrichedFactionAllocations = {
    skills: { ...(skillData.factionAllocations?.skills || {}) },
    traits: traitFeatData.traits.filter(t => t.source === 'faction').map(t => t.name),
    features: traitFeatData.features.filter(f => f.source === 'faction').map(f => f.name)
  };

  const enrichedOccuAllocations = {
    skills: { ...(skillData.occuAllocations?.skills || {}) },
    traits: traitFeatData.traits.filter(t => t.source === 'occupation').map(t => t.name),
    features: traitFeatData.features.filter(f => f.source === 'occupation').map(f => f.name)
  };

  const enrichedSpeciesAllocations = {
    skills: { ...(skillData.speciesAllocations?.skills || {}) },
    traits: traitFeatData.traits.filter(t => t.source === 'species').map(t => t.name),
    features: traitFeatData.features.filter(f => f.source === 'species').map(f => f.name),
    attributes: {}
  };

  const enrichedGeneralAllocations = {
    skills: { ...(skillData.generalAllocations?.skills || {}) },
    traits: traitFeatData.traits.filter(t => t.source === 'general').map(t => t.name),
    features: traitFeatData.features.filter(f => f.source === 'archetype' || f.source === 'general').map(f => f.name)
  };

  // Assemble canonical Folio character payload
  const characterPayload = {
    'character-doc-id': docId,
    'starting-cp': 150,
    'tech-level': techLevel || 3,
    'magic-level': 0,
    health: 30 + ((attrData.finalAttributes['attr-stamina'] || 0) * 2),
    vitality: 30 + ((attrData.finalAttributes['attr-stamina'] || 0) * 2),
    structure: 60,
    karma: 3,

    // Narrative & Pillar Identity
    ...narrativeData,

    // Attributes & Sub-Attributes
    ...attrData.finalAttributes,

    // Skill Allocations & Bindings
    speciesAllocations: enrichedSpeciesAllocations,
    originAllocations: enrichedOriginAllocations,
    factionAllocations: enrichedFactionAllocations,
    occuAllocations: enrichedOccuAllocations,
    generalAllocations: enrichedGeneralAllocations,
    skills: skillData.finalSkillsList,
    ...skillData.flatBindings,

    // Structured Assets
    traits: traitFeatData.traits,
    features: traitFeatData.features,
    weapons: propertyData.weapons,
    armor: propertyData.armor,
    gear: propertyData.gear,

    notes: [{ text: `[BASTION SYNTHESIS PROTOCOL]\nGenerated via 5 Canonical Pillars:\n- Archetype: ${archetype.name}\n- Species: ${species.name}\n- Faction: ${faction.name}\n- Origin: ${origin.name}\n- Occupation: ${occupation.name}\n\n${narrativeData.backstory}` }]
  };

  return {
    success: true,
    character: characterPayload,
    rawAttributes: attrData.rawAttributes,
    pillars: {
      archetype,
      species,
      faction,
      origin,
      occupation
    },
    allocationsReport: {
      skillsCount: skillData.finalSkillsList.length,
      traitsCount: traitFeatData.traits.length,
      featuresCount: traitFeatData.features.length,
      weaponsCount: propertyData.weapons.length,
      armorCount: propertyData.armor.length,
      gearCount: propertyData.gear.length
    }
  };
};
