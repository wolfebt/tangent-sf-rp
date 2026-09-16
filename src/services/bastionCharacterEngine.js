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
 * 1. Get Ranked Canonical Archetype Recommendations
 * Evaluates the user's prompt against canonical archetypes in DEFAULT_ARCHETYPES.
 * Returns top N recommendations with scores, rationale, and role details.
 */
export const getArchetypeRecommendations = (prompt = '', archetypesList = DEFAULT_ARCHETYPES, count = 4) => {
  if (!Array.isArray(archetypesList) || archetypesList.length === 0) {
    return [{ archetype: DEFAULT_ARCHETYPES[0], score: 100, rationale: 'Default Sentinel Archetype', isTopPick: true }];
  }

  const cleanPrompt = String(prompt || '').trim();
  const promptLower = cleanPrompt.toLowerCase();
  const promptTokens = cleanTokens(promptLower);

  const scored = archetypesList.map(arch => {
    let score = 0;
    const reasons = [];
    const nameLower = (arch.name || '').toLowerCase();
    const cleanName = nameLower.replace(/^the\s+/, '').trim();
    const conceptLower = (arch.core_concept || '').toLowerCase();
    const roleLower = (arch.tactical_role || '').toLowerCase();
    const summaryLower = (arch.summary || '').toLowerCase();
    const sphereLower = (arch.sphere || '').toLowerCase();

    // Check direct trope alias first
    for (const [trope, archName] of Object.entries(CONCEPT_ARCHETYPE_MAP)) {
      if ((promptTokens.includes(trope) || promptLower.includes(trope.replace('_', ' '))) && arch.name === archName) {
        score += 85;
        reasons.push(`Direct trope match for "${trope}"`);
      }
    }

    // Direct name match (e.g. "Sniper" or "The Sniper")
    if (cleanPrompt && (promptLower.includes(cleanName) || promptLower.includes(nameLower))) {
      score += 100;
      reasons.push(`Direct name match with "${arch.name}"`);
    }

    // Token matches in core concept / role
    let tokenMatches = 0;
    for (const token of promptTokens) {
      if (cleanName.includes(token)) { score += 30; tokenMatches++; }
      if (conceptLower.includes(token)) { score += 15; tokenMatches++; }
      if (roleLower.includes(token)) { score += 12; tokenMatches++; }
      if (summaryLower.includes(token)) { score += 8; }
      if (sphereLower.includes(token)) { score += 5; }

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

    if (tokenMatches > 0 && reasons.length === 0) {
      reasons.push(`Aligns with tactical role: ${arch.tactical_role || arch.sphere}`);
    }

    // Baseline score if no tokens matched to provide diverse options
    if (score === 0) {
      if (arch.name === 'The Vanguard' || arch.name === 'The Sentinel' || arch.name === 'The Ghost' || arch.name === 'The Operative') {
        score = 10;
      } else {
        score = 1;
      }
      reasons.push(`${arch.sphere || 'General'} Sphere chassis with ${arch.tactical_role || 'versatile capability'}`);
    }

    return {
      archetype: arch,
      score,
      rationale: reasons.join('; ') || `${arch.sphere} Sphere (${arch.tactical_role || 'Specialist'})`
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, Math.max(1, count));
  return results.map((item, idx) => ({
    ...item,
    isTopPick: idx === 0
  }));
};

/**
 * 1. Find the Closest Canonical Archetype
 * Evaluates the user's prompt against all 100 canonical archetypes in DEFAULT_ARCHETYPES.
 */
export const findClosestArchetype = (prompt, archetypesList = DEFAULT_ARCHETYPES) => {
  if (!Array.isArray(archetypesList) || archetypesList.length === 0) {
    return DEFAULT_ARCHETYPES[0];
  }
  const recs = getArchetypeRecommendations(prompt, archetypesList, 1);
  return recs[0]?.archetype || DEFAULT_ARCHETYPES[0];
};

/**
 * 2. Get Ranked Canonical Species Recommendations
 * Grounded in the selected Archetype and user prompt.
 */
export const getSpeciesRecommendations = (archetype, prompt = '', speciesList = DEFAULT_SPECIES, count = 4) => {
  if (!Array.isArray(speciesList) || speciesList.length === 0) {
    return [{ species: DEFAULT_SPECIES[0], score: 100, rationale: 'Canonical Species', isTopPick: true }];
  }

  const pLower = (prompt || '').toLowerCase();
  const primAttr = (archetype?.primary_attribute || '').toLowerCase();
  const secAttr = (archetype?.secondary_attribute || '').toLowerCase();

  const scored = speciesList.map(sp => {
    let score = 0;
    const reasons = [];
    const spName = (sp.name || sp.title || '').toLowerCase();
    const cleanSp = spName.replace(/\s*\(.*\)/, '').trim();

    // Explicit prompt mention
    if (pLower && (pLower.includes(spName) || (cleanSp.length > 3 && pLower.includes(cleanSp)))) {
      score += 150;
      reasons.push(`Explicitly requested in concept prompt`);
    }

    // Lineage keywords in prompt
    if (pLower.includes('elf') || pLower.includes('elven') || pLower.includes('aeld')) {
      if (sp.name?.includes('Celestine') || sp.name?.includes('Alterian') || sp.parent_species === 'Aeld') {
        score += 90;
        reasons.push(`Elven/Aeld lineage synergy`);
      }
    }
    if (pLower.includes('robot') || pLower.includes('android') || pLower.includes('synth') || pLower.includes('cyborg')) {
      if (sp.name?.toLowerCase().includes('android') || sp.id?.includes('synth')) {
        score += 90;
        reasons.push(`Synthetic chassis synergy`);
      }
    }
    if (pLower.includes('cat') || pLower.includes('feline') || pLower.includes('auluran')) {
      if (sp.name?.toLowerCase().includes('auluran')) {
        score += 90;
        reasons.push(`Auluran feline synergy`);
      }
    }
    if (pLower.includes('bug') || pLower.includes('insect') || pLower.includes('kitin')) {
      if (sp.name?.toLowerCase().includes('kitin')) {
        score += 90;
        reasons.push(`Kitin insectoid synergy`);
      }
    }

    // Attribute modifier synergy with Archetype
    const mods = [];
    if (Array.isArray(sp.inherent_attribute_modifiers)) {
      sp.inherent_attribute_modifiers.forEach(m => {
        const aName = typeof m === 'object' ? (m.attribute || m.name) : String(m);
        const bonus = typeof m === 'object' ? (m.bonus ?? m.value ?? 1) : 1;
        mods.push(`${bonus > 0 ? '+' : ''}${bonus} ${aName}`);
        const low = String(aName).toLowerCase();
        if (primAttr && low.includes(primAttr)) {
          score += 40;
          reasons.push(`Inherent bonus matches archetype primary attribute (${archetype?.primary_attribute})`);
        } else if (secAttr && low.includes(secAttr)) {
          score += 25;
          reasons.push(`Inherent bonus matches archetype secondary attribute (${archetype?.secondary_attribute})`);
        }
      });
    }

    // Archetype key attribute alignment fallbacks
    if (primAttr.includes('intellect') || primAttr.includes('wisdom')) {
      if (sp.name === 'Celestine (Alterian)' || sp.name?.includes('Alterian')) {
        score += 30;
        if (!reasons.some(r => r.includes('primary attribute'))) {
          reasons.push(`Strong mental aptitude aligns with ${archetype?.name}`);
        }
      }
    }
    if (primAttr.includes('agility')) {
      if (sp.name?.includes('Auluran - Koda') || sp.name?.includes('Human - Spacer')) {
        score += 30;
        if (!reasons.some(r => r.includes('primary attribute'))) {
          reasons.push(`Agile reflex profile enhances ${archetype?.name}`);
        }
      }
    }

    // Human (Base) universal versatility
    if (sp.name === 'Human (Base)' || sp.id === 'species-human-base') {
      score += 20;
      if (reasons.length === 0) {
        reasons.push(`Versatile adaptable baseline suited for any archetype`);
      }
    }

    if (reasons.length === 0) {
      reasons.push(`Canonical lineage profile`);
    }

    return {
      species: sp,
      score,
      attributeModifiersSummary: mods.join(', ') || 'Baseline (+0)',
      inherentTraits: Array.isArray(sp.inherent_features) ? sp.inherent_features.map(f => typeof f === 'object' ? f.name : f) : [],
      rationale: reasons.join('; ')
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, Math.max(1, count));
  return results.map((item, idx) => ({
    ...item,
    isTopPick: idx === 0
  }));
};

/**
 * 2. Select Canonical Species
 * Grounded in the closest Archetype and user prompt.
 */
export const selectPillarSpecies = (archetype, prompt = '', speciesList = DEFAULT_SPECIES) => {
  if (!Array.isArray(speciesList) || speciesList.length === 0) {
    return DEFAULT_SPECIES[0];
  }
  const recs = getSpeciesRecommendations(archetype, prompt, speciesList, 1);
  return recs[0]?.species || DEFAULT_SPECIES[0];
};

/**
 * 3. Get Ranked Canonical Faction Recommendations
 * Aligns with Archetype's recommended_factions or prompt.
 */
export const getFactionRecommendations = (archetype, prompt = '', factionsList = DEFAULT_FACTIONS, count = 4) => {
  if (!Array.isArray(factionsList) || factionsList.length === 0) {
    return [{ faction: DEFAULT_FACTIONS[0], score: 100, rationale: 'Canonical Faction', isTopPick: true }];
  }

  const pLower = (prompt || '').toLowerCase();
  const scored = factionsList.map(fac => {
    let score = 0;
    const reasons = [];
    const fName = (fac.name || fac.title || '').toLowerCase();

    // Check prompt for direct faction mentions
    if (fName.length > 3 && pLower.includes(fName)) {
      score += 150;
      reasons.push(`Explicitly mentioned in concept prompt`);
    }

    // Priority: Check Archetype's recommended_factions
    if (Array.isArray(archetype?.recommended_factions) && archetype.recommended_factions.length > 0) {
      for (const rec of archetype.recommended_factions) {
        const recLower = String(rec).toLowerCase();
        const recClean = recLower.replace(/\s*\(.*\)/, '').trim();
        const fn = (fac.name || fac.title || fac.id || '').toLowerCase();
        if (fn.includes(recClean) || recClean.includes(fn)) {
          score += 70;
          reasons.push(`Canonically recommended for ${archetype.name}`);
          break;
        }
      }
    }

    // Major factions default
    if (fName.includes('syndicat') || fac.id === 'syndicate-corps') {
      score += 15;
    } else if (fName.includes('dynasty')) {
      score += 12;
    }

    if (reasons.length === 0) {
      reasons.push(`Major interstellar faction offering a 20 SP training package`);
    }

    const skillPackage = fac.skill_package || fac.skills || ['Computers', 'Diplomacy', 'Knowledge (Culture)'];

    return {
      faction: fac,
      score,
      skillPackage,
      rationale: reasons.join('; ')
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, Math.max(1, count));
  return results.map((item, idx) => ({
    ...item,
    isTopPick: idx === 0
  }));
};

/**
 * 3. Select Canonical Faction
 * Aligns with Archetype's recommended_factions or prompt.
 */
export const selectPillarFaction = (archetype, prompt = '', factionsList = DEFAULT_FACTIONS) => {
  if (!Array.isArray(factionsList) || factionsList.length === 0) {
    return DEFAULT_FACTIONS[0];
  }
  const recs = getFactionRecommendations(archetype, prompt, factionsList, 1);
  return recs[0]?.faction || DEFAULT_FACTIONS[0];
};

/**
 * 4. Get Ranked Canonical Origin Recommendations
 * Aligns with Archetype's recommended_origins or prompt.
 */
export const getOriginRecommendations = (archetype, prompt = '', originsList = DEFAULT_ORIGINS, count = 4) => {
  if (!Array.isArray(originsList) || originsList.length === 0) {
    return [{ origin: DEFAULT_ORIGINS[0], score: 100, rationale: 'Canonical Origin', isTopPick: true }];
  }

  const pLower = (prompt || '').toLowerCase();
  const scored = originsList.map(orig => {
    let score = 0;
    const reasons = [];
    const oName = (orig.name || orig.title || '').toLowerCase();

    // Check prompt for origin mentions
    if (oName.length > 3 && pLower.includes(oName)) {
      score += 150;
      reasons.push(`Explicitly mentioned in concept prompt`);
    }

    // Priority: Check Archetype's recommended_origins
    if (Array.isArray(archetype?.recommended_origins) && archetype.recommended_origins.length > 0) {
      for (const rec of archetype.recommended_origins) {
        const recLower = String(rec).toLowerCase().trim();
        const on = (orig.name || orig.title || orig.id || '').toLowerCase();
        if (on === recLower || on.includes(recLower) || recLower.includes(on)) {
          score += 70;
          reasons.push(`Canonically recommended origin for ${archetype.name}`);
          break;
        }
      }
    }

    if (oName === 'urban' || orig.id === 'origin-urban') {
      score += 15;
    } else if (oName.includes('colony') || oName.includes('spacer')) {
      score += 10;
    }

    if (reasons.length === 0) {
      reasons.push(`Homeworld foundation granting 20 SP society skills and 2 traits`);
    }

    return {
      origin: orig,
      score,
      skills: orig.society_skills || orig.skills || ['Alertness', 'Athletics'],
      traits: orig.traits || [],
      rationale: reasons.join('; ')
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, Math.max(1, count));
  return results.map((item, idx) => ({
    ...item,
    isTopPick: idx === 0
  }));
};

/**
 * 4. Select Canonical Origin
 * Aligns with Archetype's recommended_origins or prompt.
 */
export const selectPillarOrigin = (archetype, prompt = '', originsList = DEFAULT_ORIGINS) => {
  if (!Array.isArray(originsList) || originsList.length === 0) {
    return DEFAULT_ORIGINS[0];
  }
  const recs = getOriginRecommendations(archetype, prompt, originsList, 1);
  return recs[0]?.origin || DEFAULT_ORIGINS[0];
};

/**
 * 5. Get Ranked Canonical Occupation Recommendations
 * Aligns with Archetype's recommended_occupations or prompt.
 */
export const getOccupationRecommendations = (archetype, prompt = '', occupationsList = DEFAULT_OCCUPATIONS, count = 4) => {
  if (!Array.isArray(occupationsList) || occupationsList.length === 0) {
    return [{ occupation: DEFAULT_OCCUPATIONS[0], score: 100, rationale: 'Canonical Occupation', isTopPick: true }];
  }

  const pLower = (prompt || '').toLowerCase();
  const scored = occupationsList.map(occu => {
    let score = 0;
    const reasons = [];
    const ocName = (occu.name || occu.title || '').toLowerCase();

    // Check prompt for occupation mentions
    if (ocName.length > 3 && pLower.includes(ocName)) {
      score += 150;
      reasons.push(`Explicitly mentioned in concept prompt`);
    }

    // Priority: Check Archetype's recommended_occupations
    if (Array.isArray(archetype?.recommended_occupations) && archetype.recommended_occupations.length > 0) {
      for (const rec of archetype.recommended_occupations) {
        const recLower = String(rec).toLowerCase().trim();
        const ocn = (occu.name || occu.title || occu.id || '').toLowerCase();
        if (ocn === recLower || ocn.includes(recLower) || recLower.includes(ocn)) {
          score += 70;
          reasons.push(`Canonically recommended career for ${archetype.name}`);
          break;
        }
      }
    }

    if (ocName === 'soldier' || occu.id === 'occupation-soldier') {
      score += 15;
    } else if (ocName.includes('agent') || ocName.includes('specialist')) {
      score += 10;
    }

    if (reasons.length === 0) {
      reasons.push(`Career granting 20 SP professional skills, 2 traits, and features`);
    }

    return {
      occupation: occu,
      score,
      skills: occu.professional_skills || occu.skills || ['Tactics', 'Heavy Weapons'],
      traits: occu.traits || [],
      rationale: reasons.join('; ')
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, Math.max(1, count));
  return results.map((item, idx) => ({
    ...item,
    isTopPick: idx === 0
  }));
};

/**
 * 5. Select Canonical Occupation
 * Aligns with Archetype's recommended_occupations or prompt.
 */
export const selectPillarOccupation = (archetype, prompt = '', occupationsList = DEFAULT_OCCUPATIONS) => {
  if (!Array.isArray(occupationsList) || occupationsList.length === 0) {
    return DEFAULT_OCCUPATIONS[0];
  }
  const recs = getOccupationRecommendations(archetype, prompt, occupationsList, 1);
  return recs[0]?.occupation || DEFAULT_OCCUPATIONS[0];
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
 * 6. Calculate Canonical Rules Ledger (User-in-the-loop validation & 150 BP economics)
 * Enforces:
 * - 150 BP starting budget
 * - Raw attributes cost 5 BP per point, cap at +4 raw at creation
 * - Sub-attributes: Base = 2 + (Primary * 2)
 * - 60 Free Skill Ranks: 20 SP Faction, 20 SP Origin, 20 SP Occupation packages
 * - Traits: Species inherent + 2 Origin + 2 Occupation
 * - Features: Archetype signature + recommended Faction + recommended Occupation
 * - Starting Property: Weapons, Armor, Gear calibrated to Tech Level
 */
export const calculateRulesLedger = ({
  archetype,
  species,
  faction,
  origin,
  occupation,
  techLevel = 3,
  rawAttributes = null,
  dbData = {}
}) => {
  const tl = Number(techLevel) || 3;
  const attrData = derivePillarAttributes({ archetype, species });

  // Base raw attributes (starts at 0, 5 BP per point, cap at 4 raw at creation)
  const baseRaw = rawAttributes ? { ...rawAttributes } : { ...attrData.rawAttributes };

  const validationErrors = [];
  let totalRawAttrPoints = 0;
  for (const [key, val] of Object.entries(baseRaw)) {
    const numericVal = Number(val) || 0;
    totalRawAttrPoints += numericVal;
    if (numericVal > 4) {
      validationErrors.push(`Raw attribute ${key.replace('attr-', '')} (${numericVal}) exceeds creation ceiling of +4.`);
    }
    if (numericVal < 0) {
      validationErrors.push(`Raw attribute ${key.replace('attr-', '')} cannot be negative.`);
    }
  }

  // BP Costs according to compendium 1.00 / 1.01
  const attrBPCost = totalRawAttrPoints * 5;
  const speciesBPCost = Number(species?.cp ?? species?.costs?.bp ?? 0) || 0;
  let tlBPCost = 0;
  if (tl === 4) tlBPCost = 10;
  else if (tl === 5) tlBPCost = 20;
  else if (tl < 3) tlBPCost = -10;

  const totalSpent = attrBPCost + speciesBPCost + tlBPCost;
  const bpRemaining = 150 - totalSpent;

  if (bpRemaining < 0) {
    validationErrors.push(`Point budget exceeded: ${totalSpent} BP spent out of 150 BP available.`);
  }

  // Derive final attributes with species modifiers
  const finalAttrs = {};
  for (const [key, baseVal] of Object.entries(baseRaw)) {
    const spMod = attrData.speciesModifiers[key] || 0;
    finalAttrs[key] = (Number(baseVal) || 0) + spMod;
  }

  // Sub-attributes canonical formula: Base = 2 + (Primary * 2)
  const might = ((finalAttrs['attr-strength'] || 0) * 2) + 2;
  const reflex = ((finalAttrs['attr-agility'] || 0) * 2) + 2;
  const fort = ((finalAttrs['attr-stamina'] || 0) * 2) + 2;
  const logic = ((finalAttrs['attr-intellect'] || 0) * 2) + 2;
  const will = ((finalAttrs['attr-wisdom'] || 0) * 2) + 2;
  const etiq = ((finalAttrs['attr-charisma'] || 0) * 2) + 2;

  const skillData = derivePillarSkills({
    archetype,
    species,
    faction,
    origin,
    occupation,
    skillsList: dbData.skills || ALL_CANONICAL_SKILLS
  });

  const traitFeatData = derivePillarTraitsAndFeatures({
    archetype,
    species,
    faction,
    origin,
    occupation,
    featuresList: dbData.features || DEFAULT_FEATURES,
    traitsList: dbData.traits || ALL_CANONICAL_TRAITS
  });

  const propertyData = derivePillarProperty({
    archetype,
    occupation,
    faction,
    species,
    techLevel: tl,
    weaponryList: dbData.weaponry || DEFAULT_WEAPONRY,
    armoringList: dbData.armoring || DEFAULT_ARMORING
  });

  return {
    startingBP: 150,
    bpSpent: totalSpent,
    bpRemaining,
    breakdown: {
      attributesCost: attrBPCost,
      speciesCost: speciesBPCost,
      techLevelCost: tlBPCost
    },
    rawAttributes: baseRaw,
    speciesModifiers: attrData.speciesModifiers,
    finalAttributes: {
      ...finalAttrs,
      'attr-might': might,
      'attr-reflex': reflex,
      'attr-fortitude': fort,
      'attr-logic': logic,
      'attr-reason': logic,
      'attr-wisdom': finalAttrs['attr-wisdom'] || 0,
      'attr-will': will,
      'attr-willpower': will,
      'attr-charisma': finalAttrs['attr-charisma'] || 0,
      'attr-etiquette': etiq
    },
    foundationPackages: {
      factionPool: {
        name: faction?.name || 'Faction',
        allocatedPoints: 20,
        skills: skillData.factionAllocations?.skills || {}
      },
      originPool: {
        name: origin?.name || 'Origin',
        allocatedPoints: 20,
        skills: skillData.originAllocations?.skills || {}
      },
      occupationPool: {
        name: occupation?.name || 'Occupation',
        allocatedPoints: 20,
        skills: skillData.occuAllocations?.skills || {}
      },
      totalSkillRanks: 60
    },
    traits: traitFeatData.traits,
    features: traitFeatData.features,
    property: propertyData,
    isRulesCompliant: validationErrors.length === 0,
    validationErrors
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
  rawAttributes = null,
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

  // Derive rules ledger and all aspects strictly from these 5 pillars
  const rulesLedger = calculateRulesLedger({
    archetype,
    species,
    faction,
    origin,
    occupation,
    techLevel,
    rawAttributes,
    dbData: { skills: skillsList, features: featuresList, traits: traitsList, weaponry: weaponryList, armoringList }
  });

  const attrData = derivePillarAttributes({ archetype, species });
  const activeRawAttrs = rawAttributes ? { ...rawAttributes } : attrData.rawAttributes;
  const finalAttrs = rulesLedger.finalAttributes;

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
    health: 30 + ((finalAttrs['attr-stamina'] || 0) * 2),
    vitality: 30 + ((finalAttrs['attr-stamina'] || 0) * 2),
    structure: 60,
    karma: 3,

    // Narrative & Pillar Identity
    ...narrativeData,

    // Attributes & Sub-Attributes
    ...finalAttrs,

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
    rawAttributes: activeRawAttrs,
    rulesLedger,
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
