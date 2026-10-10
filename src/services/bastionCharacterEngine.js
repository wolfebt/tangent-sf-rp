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
import { DEFAULT_GEAR } from '../data/gearData.js';
import { DEFAULT_AUGMENTATIONS } from '../data/augmentationsData.js';
import { DEFAULT_MECHA } from '../data/mechaData.js';
import { DEFAULT_ARCHITECTURE } from '../data/architectureData.js';
import { DEFAULT_OTHER_PROPERTY } from '../data/otherPropertyData.js';
import { syncIdentitySettingLevels } from '../engines/tangentIdentityEngine.js';

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
    const def = DEFAULT_ARCHETYPES[0] || {};
    return [{ archetype: def, item: def, name: def.name || 'The Sentinel', id: def.id, score: 100, rationale: 'Default Sentinel Archetype', isTopPick: true }];
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
      item: arch,
      name: arch.name || arch.title || arch.id,
      id: arch.id,
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
export const getSpeciesRecommendations = (archetype, prompt = '', speciesList = DEFAULT_SPECIES, count = 4, faction = null, origin = null, occupation = null) => {
  if (!Array.isArray(speciesList) || speciesList.length === 0) {
    const def = DEFAULT_SPECIES[0] || {};
    return [{ species: def, item: def, name: def.name || 'Human (Base)', id: def.id || 'species-human-base', score: 100, rationale: 'Canonical Species', isTopPick: true }];
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

    // Faction demographic alignment
    if (faction && Array.isArray(faction.recommended_species) && faction.recommended_species.length > 0) {
      for (const rec of faction.recommended_species) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (spName.includes(recClean) || recClean.includes(spName)) {
          score += 65;
          reasons.push(`Canonically recommended species for ${faction.name || 'faction'}`);
          break;
        }
      }
    }

    // Faction Guidance Keywords
    if (faction?.keywords) {
      const kwList = String(faction.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (spName.includes(kw) || (sp.description && sp.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with faction directive '${kw}'`);
          break;
        }
      }
    }

    // Faction Negative Keywords / Railguards
    if (faction?.negative_keywords) {
      const negList = String(faction.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (spName.includes(negKw) || (sp.description && sp.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with faction constraint '${negKw}'`);
          break;
        }
      }
    }

    // Origin demographic alignment
    if (origin && Array.isArray(origin.recommended_species) && origin.recommended_species.length > 0) {
      for (const rec of origin.recommended_species) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (spName.includes(recClean) || recClean.includes(spName)) {
          score += 65;
          reasons.push(`Canonically recommended species for ${origin.name || 'origin'} homeworld`);
          break;
        }
      }
    }

    // Origin Guidance Keywords
    if (origin?.keywords) {
      const kwList = String(origin.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (spName.includes(kw) || (sp.description && sp.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with origin directive '${kw}'`);
          break;
        }
      }
    }

    // Origin Negative Keywords / Railguards
    if (origin?.negative_keywords) {
      const negList = String(origin.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (spName.includes(negKw) || (sp.description && sp.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with origin constraint '${negKw}'`);
          break;
        }
      }
    }

    // Occupation demographic alignment
    if (occupation && Array.isArray(occupation.recommended_species) && occupation.recommended_species.length > 0) {
      for (const rec of occupation.recommended_species) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (spName.includes(recClean) || recClean.includes(spName)) {
          score += 65;
          reasons.push(`Canonically recommended species for ${occupation.name || 'occupation'} vocation`);
          break;
        }
      }
    }

    // Occupation Guidance Keywords
    if (occupation?.keywords) {
      const kwList = String(occupation.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (spName.includes(kw) || (sp.description && sp.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with occupation directive '${kw}'`);
          break;
        }
      }
    }

    // Occupation Negative Keywords / Railguards
    if (occupation?.negative_keywords) {
      const negList = String(occupation.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (spName.includes(negKw) || (sp.description && sp.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with occupation constraint '${negKw}'`);
          break;
        }
      }
    }

    // Species Guidance Keywords: ADD WEIGHT
    if (sp.keywords) {
      const kwList = String(sp.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (pLower.includes(kw) || (archetype?.core_concept && archetype.core_concept.toLowerCase().includes(kw))) {
          score += 35;
          reasons.push(`Thematic keyword alignment '${kw}' (+weight)`);
        }
      }
    }

    // Species Negative Keywords / Railguards: REDUCE WEIGHT
    if (sp.negative_keywords) {
      const negList = String(sp.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (pLower.includes(negKw) || (archetype?.core_concept && archetype.core_concept.toLowerCase().includes(negKw))) {
          score -= 85;
          reasons.push(`Railguard constraint penalty '${negKw}' (-weight)`);
        }
      }
    }

    if (reasons.length === 0) {
      reasons.push(`Canonical lineage profile`);
    }

    return {
      species: sp,
      item: sp,
      name: sp.name || sp.title || sp.id,
      id: sp.id,
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
export const selectPillarSpecies = (archetype, prompt = '', speciesList = DEFAULT_SPECIES, faction = null, origin = null, occupation = null) => {
  if (!Array.isArray(speciesList) || speciesList.length === 0) {
    return DEFAULT_SPECIES[0];
  }
  const recs = getSpeciesRecommendations(archetype, prompt, speciesList, 1, faction, origin, occupation);
  return recs[0]?.species || DEFAULT_SPECIES[0];
};

/**
 * 3. Get Ranked Canonical Faction Recommendations
 * Aligns with Archetype's recommended_factions or prompt.
 */
export const getFactionRecommendations = (archetype, prompt = '', factionsList = DEFAULT_FACTIONS, count = 4, species = null, origin = null, occupation = null) => {
  if (!Array.isArray(factionsList) || factionsList.length === 0) {
    const def = DEFAULT_FACTIONS[0] || {};
    return [{ faction: def, item: def, name: def.name || def.title || def.id || 'Faction', id: def.id, score: 100, rationale: 'Canonical Faction', isTopPick: true }];
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

    // Priority: Check Species' recommended_factions
    if (Array.isArray(species?.recommended_factions) && species.recommended_factions.length > 0) {
      for (const rec of species.recommended_factions) {
        const recLower = String(rec).toLowerCase();
        const recClean = recLower.replace(/\s*\(.*\)/, '').trim();
        const fn = (fac.name || fac.title || fac.id || '').toLowerCase();
        if (fn.includes(recClean) || recClean.includes(fn)) {
          score += 65;
          reasons.push(`Recommended lineage faction for ${species.name || 'species'}`);
          break;
        }
      }
    }

    // Species Guidance Keywords
    if (species?.keywords) {
      const kwList = String(species.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (fName.includes(kw) || (fac.description && fac.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with species directive '${kw}'`);
          break;
        }
      }
    }

    // Species Negative Keywords / Railguards
    if (species?.negative_keywords) {
      const negList = String(species.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (fName.includes(negKw) || (fac.description && fac.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with species constraint '${negKw}'`);
          break;
        }
      }
    }

    // Priority: Check Faction's recommended_species
    if (species && Array.isArray(fac.recommended_species) && fac.recommended_species.length > 0) {
      const spName = (species.name || species.title || species.id || '').toLowerCase();
      for (const rec of fac.recommended_species) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (spName.includes(recClean) || recClean.includes(spName)) {
          score += 65;
          reasons.push(`Canonically aligns with ${species.name || 'species'} demographic`);
          break;
        }
      }
    }

    // Priority: Check Origin's recommended_factions
    if (origin && Array.isArray(origin.recommended_factions) && origin.recommended_factions.length > 0) {
      for (const rec of origin.recommended_factions) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (fName.includes(recClean) || recClean.includes(fName)) {
          score += 65;
          reasons.push(`Canonically affiliated faction for ${origin.name || 'origin'} homeworld`);
          break;
        }
      }
    }

    // Priority: Check Faction's recommended_origins
    if (origin && Array.isArray(fac.recommended_origins) && fac.recommended_origins.length > 0) {
      const oName = (origin.name || origin.title || origin.id || '').toLowerCase();
      for (const rec of fac.recommended_origins) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (oName.includes(recClean) || recClean.includes(oName)) {
          score += 65;
          reasons.push(`Canonically aligns with ${origin.name || 'origin'} territorial influence`);
          break;
        }
      }
    }

    // Origin Guidance Keywords
    if (origin?.keywords) {
      const kwList = String(origin.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (fName.includes(kw) || (fac.description && fac.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with origin directive '${kw}'`);
          break;
        }
      }
    }

    // Origin Negative Keywords / Railguards
    if (origin?.negative_keywords) {
      const negList = String(origin.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (fName.includes(negKw) || (fac.description && fac.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with origin constraint '${negKw}'`);
          break;
        }
      }
    }

    // Priority: Check Occupation's recommended_factions
    if (occupation && Array.isArray(occupation.recommended_factions) && occupation.recommended_factions.length > 0) {
      for (const rec of occupation.recommended_factions) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (fName.includes(recClean) || recClean.includes(fName)) {
          score += 65;
          reasons.push(`Canonically recommended faction for ${occupation.name || 'occupation'} vocation`);
          break;
        }
      }
    }

    // Priority: Check Faction's recommended_occupations
    if (occupation && Array.isArray(fac.recommended_occupations) && fac.recommended_occupations.length > 0) {
      const ocName = (occupation.name || occupation.title || occupation.id || '').toLowerCase();
      for (const rec of fac.recommended_occupations) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (ocName.includes(recClean) || recClean.includes(ocName)) {
          score += 65;
          reasons.push(`Canonically aligns with ${occupation.name || 'occupation'} professional doctrine`);
          break;
        }
      }
    }

    // Occupation Guidance Keywords
    if (occupation?.keywords) {
      const kwList = String(occupation.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (fName.includes(kw) || (fac.description && fac.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with occupation directive '${kw}'`);
          break;
        }
      }
    }

    // Occupation Negative Keywords / Railguards
    if (occupation?.negative_keywords) {
      const negList = String(occupation.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (fName.includes(negKw) || (fac.description && fac.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with occupation constraint '${negKw}'`);
          break;
        }
      }
    }

    // Faction Guidance Keywords: ADD WEIGHT
    if (fac.keywords) {
      const kwList = String(fac.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (pLower.includes(kw) || (archetype?.core_concept && archetype.core_concept.toLowerCase().includes(kw)) || (species?.name && species.name.toLowerCase().includes(kw))) {
          score += 25;
          reasons.push(`Faction directive alignment '${kw}' (+weight)`);
          break;
        }
      }
    }

    // Faction Negative Keywords / Railguards: REDUCE WEIGHT
    if (fac.negative_keywords) {
      const negList = String(fac.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (pLower.includes(negKw) || (archetype?.core_concept && archetype.core_concept.toLowerCase().includes(negKw))) {
          score -= 90;
          reasons.push(`Faction railguard constraint penalty '${negKw}' (-weight)`);
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
      item: fac,
      name: fac.name || fac.title || fac.id,
      id: fac.id,
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
 * Aligns with Archetype's and Species' recommended_factions or prompt.
 */
export const selectPillarFaction = (archetype, prompt = '', factionsList = DEFAULT_FACTIONS, species = null, origin = null, occupation = null) => {
  if (!Array.isArray(factionsList) || factionsList.length === 0) {
    return DEFAULT_FACTIONS[0];
  }
  const recs = getFactionRecommendations(archetype, prompt, factionsList, 1, species, origin, occupation);
  return recs[0]?.faction || DEFAULT_FACTIONS[0];
};

/**
 * 4. Get Ranked Canonical Origin Recommendations
 * Aligns with Archetype's recommended_origins or prompt.
 */
export const getOriginRecommendations = (archetype, prompt = '', originsList = DEFAULT_ORIGINS, count = 4, species = null, faction = null, occupation = null) => {
  if (!Array.isArray(originsList) || originsList.length === 0) {
    const def = DEFAULT_ORIGINS[0] || {};
    return [{ origin: def, item: def, name: def.name || def.title || def.id || 'Origin', id: def.id, score: 100, rationale: 'Canonical Origin', isTopPick: true }];
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

    // Priority: Check Species' recommended_origins
    if (Array.isArray(species?.recommended_origins) && species.recommended_origins.length > 0) {
      for (const rec of species.recommended_origins) {
        const recLower = String(rec).toLowerCase().trim();
        const on = (orig.name || orig.title || orig.id || '').toLowerCase();
        if (on === recLower || on.includes(recLower) || recLower.includes(on)) {
          score += 65;
          reasons.push(`Recommended homeworld origin for ${species.name || 'species'}`);
          break;
        }
      }
    }

    // Priority: Check Faction's recommended_origins
    if (Array.isArray(faction?.recommended_origins) && faction.recommended_origins.length > 0) {
      for (const rec of faction.recommended_origins) {
        const recLower = String(rec).toLowerCase().trim();
        const on = (orig.name || orig.title || orig.id || '').toLowerCase();
        if (on === recLower || on.includes(recLower) || recLower.includes(on)) {
          score += 65;
          reasons.push(`Recommended planetary origin for ${faction.name || 'faction'}`);
          break;
        }
      }
    }

    // Faction Guidance Keywords
    if (faction?.keywords) {
      const kwList = String(faction.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (oName.includes(kw) || (orig.description && orig.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with faction directive '${kw}'`);
          break;
        }
      }
    }

    // Faction Negative Keywords / Railguards
    if (faction?.negative_keywords) {
      const negList = String(faction.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (oName.includes(negKw) || (orig.description && orig.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with faction constraint '${negKw}'`);
          break;
        }
      }
    }

    // Species Guidance Keywords
    if (species?.keywords) {
      const kwList = String(species.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (oName.includes(kw) || (orig.description && orig.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with species directive '${kw}'`);
          break;
        }
      }
    }

    // Species Negative Keywords / Railguards
    if (species?.negative_keywords) {
      const negList = String(species.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (oName.includes(negKw) || (orig.description && orig.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with species constraint '${negKw}'`);
          break;
        }
      }
    }

    // Priority: Check Origin's recommended_species
    if (species && Array.isArray(orig.recommended_species) && orig.recommended_species.length > 0) {
      const spName = (species.name || species.title || species.id || '').toLowerCase();
      for (const rec of orig.recommended_species) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (spName.includes(recClean) || recClean.includes(spName)) {
          score += 65;
          reasons.push(`Canonically aligns with ${species.name || 'species'} homeworld demographic`);
          break;
        }
      }
    }

    // Priority: Check Origin's recommended_factions
    if (faction && Array.isArray(orig.recommended_factions) && orig.recommended_factions.length > 0) {
      const fName = (faction.name || faction.title || faction.id || '').toLowerCase();
      for (const rec of orig.recommended_factions) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (fName.includes(recClean) || recClean.includes(fName)) {
          score += 65;
          reasons.push(`Canonically aligns with ${faction.name || 'faction'} jurisdiction`);
          break;
        }
      }
    }

    // Priority: Check Occupation's recommended_origins
    if (occupation && Array.isArray(occupation.recommended_origins) && occupation.recommended_origins.length > 0) {
      for (const rec of occupation.recommended_origins) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (oName.includes(recClean) || recClean.includes(oName)) {
          score += 65;
          reasons.push(`Canonically recommended origin for ${occupation.name || 'occupation'} vocation`);
          break;
        }
      }
    }

    // Priority: Check Origin's recommended_occupations
    if (occupation && Array.isArray(orig.recommended_occupations) && orig.recommended_occupations.length > 0) {
      const ocName = (occupation.name || occupation.title || occupation.id || '').toLowerCase();
      for (const rec of orig.recommended_occupations) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (ocName.includes(recClean) || recClean.includes(ocName)) {
          score += 65;
          reasons.push(`Canonically aligns with ${occupation.name || 'occupation'} professional environment`);
          break;
        }
      }
    }

    // Occupation Guidance Keywords
    if (occupation?.keywords) {
      const kwList = String(occupation.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (oName.includes(kw) || (orig.description && orig.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with occupation directive '${kw}'`);
          break;
        }
      }
    }

    // Occupation Negative Keywords / Railguards
    if (occupation?.negative_keywords) {
      const negList = String(occupation.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (oName.includes(negKw) || (orig.description && orig.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with occupation constraint '${negKw}'`);
          break;
        }
      }
    }

    // Origin Guidance Keywords: ADD WEIGHT
    if (orig.keywords) {
      const kwList = String(orig.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (pLower.includes(kw) || (archetype?.core_concept && archetype.core_concept.toLowerCase().includes(kw)) || (species?.name && species.name.toLowerCase().includes(kw))) {
          score += 25;
          reasons.push(`Origin directive alignment '${kw}' (+weight)`);
          break;
        }
      }
    }

    // Origin Negative Keywords / Railguards: REDUCE WEIGHT
    if (orig.negative_keywords) {
      const negList = String(orig.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (pLower.includes(negKw) || (archetype?.core_concept && archetype.core_concept.toLowerCase().includes(negKw))) {
          score -= 90;
          reasons.push(`Origin railguard constraint penalty '${negKw}' (-weight)`);
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
      item: orig,
      name: orig.name || orig.title || orig.id,
      id: orig.id,
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
 * Aligns with Archetype's, Species', and Faction's recommended_origins or prompt.
 */
export const selectPillarOrigin = (archetype, prompt = '', originsList = DEFAULT_ORIGINS, species = null, faction = null, occupation = null) => {
  if (!Array.isArray(originsList) || originsList.length === 0) {
    return DEFAULT_ORIGINS[0];
  }
  const recs = getOriginRecommendations(archetype, prompt, originsList, 1, species, faction, occupation);
  return recs[0]?.origin || DEFAULT_ORIGINS[0];
};

/**
 * 5. Get Ranked Canonical Occupation Recommendations
 * Aligns with Archetype's and Species' recommended_occupations or prompt.
 */
export const getOccupationRecommendations = (archetype, prompt = '', occupationsList = DEFAULT_OCCUPATIONS, count = 4, species = null, faction = null, origin = null) => {
  if (!Array.isArray(occupationsList) || occupationsList.length === 0) {
    const def = DEFAULT_OCCUPATIONS[0] || {};
    return [{ occupation: def, item: def, name: def.name || def.title || def.id || 'Occupation', id: def.id, score: 100, rationale: 'Canonical Occupation', isTopPick: true }];
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

    // Priority: Check Species' recommended_occupations
    if (Array.isArray(species?.recommended_occupations) && species.recommended_occupations.length > 0) {
      for (const rec of species.recommended_occupations) {
        const recLower = String(rec).toLowerCase().trim();
        const ocn = (occu.name || occu.title || occu.id || '').toLowerCase();
        if (ocn === recLower || ocn.includes(recLower) || recLower.includes(ocn)) {
          score += 65;
          reasons.push(`Recommended cultural career for ${species.name || 'species'}`);
          break;
        }
      }
    }

    // Priority: Check Faction's recommended_occupations
    if (Array.isArray(faction?.recommended_occupations) && faction.recommended_occupations.length > 0) {
      for (const rec of faction.recommended_occupations) {
        const recLower = String(rec).toLowerCase().trim();
        const ocn = (occu.name || occu.title || occu.id || '').toLowerCase();
        if (ocn === recLower || ocn.includes(recLower) || recLower.includes(ocn)) {
          score += 65;
          reasons.push(`Recommended profession for ${faction.name || 'faction'}`);
          break;
        }
      }
    }

    // Priority: Check Origin's recommended_occupations
    if (origin && Array.isArray(origin.recommended_occupations) && origin.recommended_occupations.length > 0) {
      for (const rec of origin.recommended_occupations) {
        const recLower = String(rec).toLowerCase().trim();
        const ocn = (occu.name || occu.title || occu.id || '').toLowerCase();
        if (ocn === recLower || ocn.includes(recLower) || recLower.includes(ocn)) {
          score += 65;
          reasons.push(`Recommended profession for ${origin.name || 'origin'} homeworld`);
          break;
        }
      }
    }

    // Faction Guidance Keywords
    if (faction?.keywords) {
      const kwList = String(faction.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (ocName.includes(kw) || (occu.description && occu.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with faction directive '${kw}'`);
          break;
        }
      }
    }

    // Faction Negative Keywords / Railguards
    if (faction?.negative_keywords) {
      const negList = String(faction.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (ocName.includes(negKw) || (occu.description && occu.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with faction constraint '${negKw}'`);
          break;
        }
      }
    }

    // Origin Guidance Keywords
    if (origin?.keywords) {
      const kwList = String(origin.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (ocName.includes(kw) || (occu.description && occu.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with origin directive '${kw}'`);
          break;
        }
      }
    }

    // Origin Negative Keywords / Railguards
    if (origin?.negative_keywords) {
      const negList = String(origin.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (ocName.includes(negKw) || (occu.description && occu.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with origin constraint '${negKw}'`);
          break;
        }
      }
    }

    // Species Guidance Keywords
    if (species?.keywords) {
      const kwList = String(species.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (ocName.includes(kw) || (occu.description && occu.description.toLowerCase().includes(kw))) {
          score += 20;
          reasons.push(`Aligns with species directive '${kw}'`);
          break;
        }
      }
    }

    // Species Negative Keywords / Railguards
    if (species?.negative_keywords) {
      const negList = String(species.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (ocName.includes(negKw) || (occu.description && occu.description.toLowerCase().includes(negKw))) {
          score -= 100;
          reasons.push(`Railguard penalty: conflicts with species constraint '${negKw}'`);
          break;
        }
      }
    }

    // Priority: Check Occupation's recommended_species
    if (species && Array.isArray(occu.recommended_species) && occu.recommended_species.length > 0) {
      const spName = (species.name || species.title || species.id || '').toLowerCase();
      for (const rec of occu.recommended_species) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (spName.includes(recClean) || recClean.includes(spName)) {
          score += 65;
          reasons.push(`Canonically aligns with ${species.name || 'species'} demographic`);
          break;
        }
      }
    }

    // Priority: Check Occupation's recommended_factions
    if (faction && Array.isArray(occu.recommended_factions) && occu.recommended_factions.length > 0) {
      const fName = (faction.name || faction.title || faction.id || '').toLowerCase();
      for (const rec of occu.recommended_factions) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (fName.includes(recClean) || recClean.includes(fName)) {
          score += 65;
          reasons.push(`Canonically affiliated career for ${faction.name || 'faction'}`);
          break;
        }
      }
    }

    // Priority: Check Occupation's recommended_origins
    if (origin && Array.isArray(occu.recommended_origins) && occu.recommended_origins.length > 0) {
      const oName = (origin.name || origin.title || origin.id || '').toLowerCase();
      for (const rec of occu.recommended_origins) {
        const recClean = String(rec).toLowerCase().replace(/\s*\(.*\)/, '').trim();
        if (oName.includes(recClean) || recClean.includes(oName)) {
          score += 65;
          reasons.push(`Canonically recommended profession for ${origin.name || 'origin'} homeworld`);
          break;
        }
      }
    }

    // Occupation Guidance Keywords: ADD WEIGHT
    if (occu.keywords) {
      const kwList = String(occu.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kwList) {
        if (pLower.includes(kw) || (archetype?.core_concept && archetype.core_concept.toLowerCase().includes(kw)) || (species?.name && species.name.toLowerCase().includes(kw))) {
          score += 25;
          reasons.push(`Occupation directive alignment '${kw}' (+weight)`);
          break;
        }
      }
    }

    // Occupation Negative Keywords / Railguards: REDUCE WEIGHT
    if (occu.negative_keywords) {
      const negList = String(occu.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const negKw of negList) {
        if (pLower.includes(negKw) || (archetype?.core_concept && archetype.core_concept.toLowerCase().includes(negKw))) {
          score -= 90;
          reasons.push(`Occupation railguard constraint penalty '${negKw}' (-weight)`);
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
      item: occu,
      name: occu.name || occu.title || occu.id,
      id: occu.id,
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
 * Aligns with Archetype's, Species', and Faction's recommended_occupations or prompt.
 */
export const selectPillarOccupation = (archetype, prompt = '', occupationsList = DEFAULT_OCCUPATIONS, species = null, faction = null, origin = null) => {
  if (!Array.isArray(occupationsList) || occupationsList.length === 0) {
    return DEFAULT_OCCUPATIONS[0];
  }
  const recs = getOccupationRecommendations(archetype, prompt, occupationsList, 1, species, faction, origin);
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
  skillsList = ALL_CANONICAL_SKILLS,
  techLevel,
  metaLevel
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

    const charTl = Number(techLevel ?? faction?.tech_level ?? faction?.tl ?? 3) || 3;
    const charMl = Number(metaLevel ?? faction?.meta_level ?? faction?.ml ?? 0) || 0;
    const combinedDirectives = [
      species?.keywords, faction?.keywords, origin?.keywords, occupation?.keywords
    ].filter(Boolean).join(' ').toLowerCase();
    const combinedRailguards = [
      species?.negative_keywords, faction?.negative_keywords, origin?.negative_keywords, occupation?.negative_keywords
    ].filter(Boolean).join(' ').toLowerCase();

    // Score and sort list by resonance score
    const scoredItems = list.map(raw => {
      const canon = findCanonicalSkill(typeof raw === 'object' ? (raw.skill || raw.name) : raw);
      let score = 0;
      if (canon) {
        const aTl = canon.recommended_tl || [];
        const aMl = canon.recommended_ml || [];
        if (aTl.some(t => String(t).includes(String(charTl)))) score += 30;
        if (aMl.some(m => String(m).includes(String(charMl)))) score += 20;
        if (canon.keywords && combinedDirectives.includes(String(canon.keywords).toLowerCase())) score += 25;
        if (canon.negative_keywords && combinedDirectives.includes(String(canon.negative_keywords).toLowerCase())) score -= 50;
        if (combinedRailguards && combinedRailguards.includes((canon.name || '').toLowerCase())) score -= 80;
      }
      return { raw, canon, score };
    }).sort((a, b) => b.score - a.score);

    let pointsLeft = totalPoints;
    const count = Math.min(scoredItems.length, 5);
    const baseRank = Math.floor(totalPoints / count);

    for (let i = 0; i < count; i++) {
      if (pointsLeft <= 0) break;
      const { canon, score } = scoredItems[i];
      if (canon) {
        // Enforce creation cap of 6 ranks per skill from a single background pool
        // Penalized skills (negative score) are capped lower (max 2-3) to reflect railguards
        const scoreCap = score < -20 ? 2 : (score < 0 ? 3 : 6);
        const scoreBonus = score >= 20 ? 1 : 0;
        const desiredRank = i === count - 1 ? pointsLeft : Math.min(baseRank + scoreBonus, pointsLeft);
        const allocRank = Math.max(1, Math.min(desiredRank, scoreCap, pointsLeft));

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
  if (species && Array.isArray(species.recommended_skills)) {
    species.recommended_skills.forEach(sk => {
      const rawName = typeof sk === 'object' ? (sk.name || sk.id) : sk;
      const canon = findCanonicalSkill(rawName);
      if (canon) {
        speciesAllocations.skills[canon.name] = (speciesAllocations.skills[canon.name] || 0) + 2;
      }
    });
  }

  // Faction Recommended Skills
  if (faction && Array.isArray(faction.recommended_skills)) {
    faction.recommended_skills.forEach(sk => {
      const rawName = typeof sk === 'object' ? (sk.name || sk.id) : sk;
      const canon = findCanonicalSkill(rawName);
      if (canon) {
        factionAllocations.skills[canon.name] = (factionAllocations.skills[canon.name] || 0) + 2;
      }
    });
  }

  // Origin Recommended Skills
  if (origin && Array.isArray(origin.recommended_skills)) {
    origin.recommended_skills.forEach(sk => {
      const rawName = typeof sk === 'object' ? (sk.name || sk.id) : sk;
      const canon = findCanonicalSkill(rawName);
      if (canon) {
        originAllocations.skills[canon.name] = (originAllocations.skills[canon.name] || 0) + 2;
      }
    });
  }

  // Occupation Recommended Skills
  if (occupation && Array.isArray(occupation.recommended_skills)) {
    occupation.recommended_skills.forEach(sk => {
      const rawName = typeof sk === 'object' ? (sk.name || sk.id) : sk;
      const canon = findCanonicalSkill(rawName);
      if (canon) {
        occuAllocations.skills[canon.name] = (occuAllocations.skills[canon.name] || 0) + 2;
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
      baseAttr: canon.baseAttr || 'attr-intellect',
      recommended_tl: canon.recommended_tl || [],
      recommended_ml: canon.recommended_ml || [],
      keywords: canon.keywords || '',
      negative_keywords: canon.negative_keywords || '',
      tech_level: canon.tech_level ?? 0,
      meta_level: canon.meta_level ?? 0
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
  traitsList = ALL_CANONICAL_TRAITS,
  techLevel = 3,
  metaLevel = 0
}) => {
  const finalTraits = [];
  const finalFeatures = [];
  const seenTraits = new Set();
  const seenFeatures = new Set();

  const charTl = Number(techLevel ?? faction?.tech_level ?? 3) || 3;
  const charMl = Number(metaLevel ?? faction?.meta_level ?? 0) || 0;
  const combinedDirectives = [
    species?.keywords, faction?.keywords, origin?.keywords, occupation?.keywords
  ].filter(Boolean).join(' ').toLowerCase();
  const combinedRailguards = [
    species?.negative_keywords, faction?.negative_keywords, origin?.negative_keywords, occupation?.negative_keywords
  ].filter(Boolean).join(' ').toLowerCase();

  const scoreFeature = (rawFeat) => {
    const rawName = typeof rawFeat === 'object' ? (rawFeat.name || rawFeat.id) : rawFeat;
    const cleanName = String(rawName).replace(/^feature-/i, '').replace(/[-_]/g, ' ').trim().toLowerCase();
    const detail = featuresList.find(f => (f.name || f.id || '').toLowerCase() === cleanName) || {};

    let score = 0;
    const fTl = detail.recommended_tl || [];
    const fMl = detail.recommended_ml || [];
    if (fTl.some(t => String(t).includes(String(charTl)))) score += 30;
    if (fMl.some(m => String(m).includes(String(charMl)))) score += 20;
    if (detail.keywords && combinedDirectives.includes(String(detail.keywords).toLowerCase())) score += 25;
    if (detail.negative_keywords && combinedDirectives.includes(String(detail.negative_keywords).toLowerCase())) score -= 50;
    if (combinedRailguards && combinedRailguards.includes((detail.name || '').toLowerCase())) score -= 80;

    return score;
  };

  const pickBestFeature = (rawFeatsList) => {
    if (!Array.isArray(rawFeatsList) || rawFeatsList.length === 0) return null;
    if (rawFeatsList.length === 1) return rawFeatsList[0];
    const sorted = [...rawFeatsList].sort((a, b) => scoreFeature(b) - scoreFeature(a));
    return sorted[0];
  };

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
      mechanic: detail.mechanic || detail.description || '',
      recommended_tl: detail.recommended_tl || [],
      recommended_ml: detail.recommended_ml || [],
      keywords: detail.keywords || '',
      negative_keywords: detail.negative_keywords || '',
      tech_level: detail.tech_level ?? 0,
      meta_level: detail.meta_level ?? 0
    });
  };

  // 1. Species Inherent Traits & Features
  if (species && Array.isArray(species.inherent_features)) {
    species.inherent_features.forEach(f => {
      const str = typeof f === 'object' ? (f.name || f.id) : String(f);
      addTrait(str, 'species', 'Species Inherent', 0, true);
    });
  }
  if (species && Array.isArray(species.recommended_features)) {
    species.recommended_features.forEach(feat => {
      const str = typeof feat === 'object' ? (feat.name || feat.id) : String(feat);
      addFeature(str, 'species', 'Species Feature', 2, true);
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

  // 5. Faction Recommended Features (evaluated via TL/ML resonance and directives)
  if (faction) {
    const rawFeats = faction.recommended_features || faction.bonus_features || [];
    const recFeats = Array.isArray(rawFeats)
      ? rawFeats
      : (typeof rawFeats === 'string' ? rawFeats.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : []);
    const best = pickBestFeature(recFeats);
    if (best) {
      addFeature(best, 'faction', 'Faction Feature', 2, true);
    }
  }

  // 6. Origin Recommended Features (evaluated via TL/ML resonance and directives)
  if (origin) {
    const rawFeats = origin.recommended_features || [];
    const recFeats = Array.isArray(rawFeats)
      ? rawFeats
      : (typeof rawFeats === 'string' ? rawFeats.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : []);
    const best = pickBestFeature(recFeats);
    if (best) {
      addFeature(best, 'origin', 'Origin Feature', 2, true);
    }
  }

  // 7. Occupation Recommended Features (evaluated via TL/ML resonance and directives)
  if (occupation) {
    const rawFeats = occupation.recommended_features || [];
    const recFeats = Array.isArray(rawFeats)
      ? rawFeats
      : (typeof rawFeats === 'string' ? rawFeats.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : []);
    const best = pickBestFeature(recFeats);
    if (best) {
      addFeature(best, 'occupation', 'Occupation Feature', 2, true);
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
  metaLevel = 0,
  weaponryList = DEFAULT_WEAPONRY,
  armoringList = DEFAULT_ARMORING,
  gearList = DEFAULT_GEAR,
  augmentationsList = DEFAULT_AUGMENTATIONS,
  mechaList = DEFAULT_MECHA,
  architectureList = DEFAULT_ARCHITECTURE,
  otherList = DEFAULT_OTHER_PROPERTY
}) => {
  const tl = Number(techLevel) || 3;
  const ml = Number(metaLevel) || 0;
  const weapons = [];
  const armor = [];
  const gear = [];
  const augmentations = [];
  const mecha = [];
  const architecture = [];
  const other = [];

  // Tactical classification based on Archetype tactical role / concept
  const concept = (archetype?.core_concept || '').toLowerCase();
  const role = (archetype?.tactical_role || '').toLowerCase();
  const occuName = (occupation?.name || '').toLowerCase();

  const combinedDirectives = [
    species?.keywords, faction?.keywords, occupation?.keywords
  ].filter(Boolean).join(' ').toLowerCase();

  const combinedRailguards = [
    species?.negative_keywords, faction?.negative_keywords, occupation?.negative_keywords
  ].filter(Boolean).join(' ').toLowerCase();

  // Weapon Scoring Heuristic (TL & ML resonance, keywords weight, negative keywords railguards)
  const scoreWeapon = (w) => {
    let score = 0;
    const wTl = Array.isArray(w.recommended_tl) ? w.recommended_tl : (typeof w.recommended_tl === 'string' ? w.recommended_tl.split(/[,;\n]+/).map(s => s.trim()) : []);
    const wMl = Array.isArray(w.recommended_ml) ? w.recommended_ml : (typeof w.recommended_ml === 'string' ? w.recommended_ml.split(/[,;\n]+/).map(s => s.trim()) : []);
    const itemTl = Number(w.tech_level ?? w.tl ?? 3);
    const itemMl = Number(w.meta_level ?? w.ml ?? 0);

    // TL Resonance
    if (wTl.some(t => String(t).toLowerCase().includes(String(tl)))) {
      score += 35;
    } else if (itemTl <= tl) {
      score += 15;
    } else {
      score -= 40;
    }

    // ML Resonance
    if (wMl.some(m => String(m).toLowerCase().includes(String(ml)))) {
      score += 25;
    } else if (itemMl === ml) {
      score += 10;
    }

    // Directives / Keywords (+Weight)
    if (w.keywords) {
      const kws = String(w.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kws) {
        if (combinedDirectives.includes(kw) || concept.includes(kw) || role.includes(kw) || occuName.includes(kw)) {
          score += 30;
          break;
        }
      }
    }

    // Negative Keywords / Railguards (-Weight)
    if (w.negative_keywords) {
      const negs = String(w.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const neg of negs) {
        if (combinedDirectives.includes(neg) || concept.includes(neg) || role.includes(neg) || occuName.includes(neg)) {
          score -= 60;
          break;
        }
      }
    }

    // Character railguards check
    if (combinedRailguards) {
      const wpnName = (w.name || '').toLowerCase();
      if (combinedRailguards.includes(wpnName)) {
        score -= 80;
      }
    }

    return score;
  };

  // Weapon selection from weaponryList calibrated to role and resonance
  const validWeapons = weaponryList.filter(w => (Number(w.tech_level ?? w.tl) || 3) <= Math.max(1, tl));

  let primaryCandidates = [];
  let secondaryCandidates = [];

  if (role.includes('ranged') || concept.includes('ranged') || occuName.includes('soldier') || role.includes('sniper')) {
    primaryCandidates = validWeapons.filter(w => w.name?.toLowerCase().includes('rifle') || w.name?.toLowerCase().includes('plasma'));
    secondaryCandidates = validWeapons.filter(w => w.name?.toLowerCase().includes('pistol'));
  } else if (role.includes('tank') || concept.includes('melee') || role.includes('frontline')) {
    primaryCandidates = validWeapons.filter(w => w.name?.toLowerCase().includes('blade') || w.name?.toLowerCase().includes('sword') || w.name?.toLowerCase().includes('hammer'));
    secondaryCandidates = validWeapons.filter(w => w.name?.toLowerCase().includes('shotgun') || w.name?.toLowerCase().includes('pistol'));
  } else {
    // Infiltrator / Diplomat / Savant
    primaryCandidates = validWeapons.filter(w => w.name?.toLowerCase().includes('pistol') || w.name?.toLowerCase().includes('dagger'));
    secondaryCandidates = validWeapons.filter(w => w.name?.toLowerCase().includes('knife') || w.name?.toLowerCase().includes('holdout') || w.name?.toLowerCase().includes('pistol'));
  }

  primaryCandidates.sort((a, b) => scoreWeapon(b) - scoreWeapon(a));
  secondaryCandidates.sort((a, b) => scoreWeapon(b) - scoreWeapon(a));
  const sortedAllWeapons = [...validWeapons].sort((a, b) => scoreWeapon(b) - scoreWeapon(a));

  const primaryWeapon = primaryCandidates[0] || sortedAllWeapons[0] || null;
  const secondaryWeapon = secondaryCandidates.find(w => w.name !== primaryWeapon?.name) || sortedAllWeapons.find(w => w.name !== primaryWeapon?.name) || null;

  if (primaryWeapon) {
    weapons.push({
      id: primaryWeapon.id || `wpn_${Date.now()}_1`,
      name: primaryWeapon.name,
      damage: primaryWeapon.damage || '2d6',
      damage_type: primaryWeapon.damage_type || 'Kinetic',
      range: primaryWeapon.range || '10/30/60',
      tl: primaryWeapon.tech_level ?? primaryWeapon.tl ?? tl,
      ml: primaryWeapon.meta_level ?? primaryWeapon.ml ?? ml,
      recommended_tl: primaryWeapon.recommended_tl || [`TL ${primaryWeapon.tech_level ?? primaryWeapon.tl ?? tl}`],
      recommended_ml: primaryWeapon.recommended_ml || [`ML ${primaryWeapon.meta_level ?? primaryWeapon.ml ?? ml}`],
      keywords: primaryWeapon.keywords || '',
      negative_keywords: primaryWeapon.negative_keywords || '',
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
      tl: secondaryWeapon.tech_level ?? secondaryWeapon.tl ?? tl,
      ml: secondaryWeapon.meta_level ?? secondaryWeapon.ml ?? ml,
      recommended_tl: secondaryWeapon.recommended_tl || [`TL ${secondaryWeapon.tech_level ?? secondaryWeapon.tl ?? tl}`],
      recommended_ml: secondaryWeapon.recommended_ml || [`ML ${secondaryWeapon.meta_level ?? secondaryWeapon.ml ?? ml}`],
      keywords: secondaryWeapon.keywords || '',
      negative_keywords: secondaryWeapon.negative_keywords || '',
      qty: 1
    });
  }

  // Armor Scoring Heuristic (TL & ML resonance, keywords weight, negative keywords railguards)
  const scoreArmor = (a) => {
    let score = 0;
    const aTl = Array.isArray(a.recommended_tl) ? a.recommended_tl : (typeof a.recommended_tl === 'string' ? a.recommended_tl.split(/[,;\n]+/).map(s => s.trim()) : []);
    const aMl = Array.isArray(a.recommended_ml) ? a.recommended_ml : (typeof a.recommended_ml === 'string' ? a.recommended_ml.split(/[,;\n]+/).map(s => s.trim()) : []);
    const itemTl = Number(a.tech_level ?? a.tl ?? 3);
    const itemMl = Number(a.meta_level ?? a.ml ?? 0);

    // TL Resonance
    if (aTl.some(t => String(t).toLowerCase().includes(String(tl)))) {
      score += 35;
    } else if (itemTl <= tl) {
      score += 15;
    } else {
      score -= 40;
    }

    // ML Resonance
    if (aMl.some(m => String(m).toLowerCase().includes(String(ml)))) {
      score += 25;
    } else if (itemMl === ml) {
      score += 10;
    }

    // Directives / Keywords (+Weight)
    if (a.keywords) {
      const kws = String(a.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kws) {
        if (combinedDirectives.includes(kw) || concept.includes(kw) || role.includes(kw) || occuName.includes(kw)) {
          score += 30;
          break;
        }
      }
    }

    // Negative Keywords / Railguards (-Weight)
    if (a.negative_keywords) {
      const negs = String(a.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const neg of negs) {
        if (combinedDirectives.includes(neg) || concept.includes(neg) || role.includes(neg) || occuName.includes(neg)) {
          score -= 60;
          break;
        }
      }
    }

    // Character railguards check
    if (combinedRailguards) {
      const armName = (a.name || '').toLowerCase();
      if (combinedRailguards.includes(armName)) {
        score -= 80;
      }
    }

    return score;
  };

  // Armor selection from armoringList calibrated to role, directives, and resonance
  const validArmor = armoringList.filter(a => (Number(a.tech_level ?? a.tl) || 3) <= Math.max(1, tl));

  let armorCandidates = [];
  if (role.includes('tank') || concept.includes('defense') || occuName.includes('soldier') || role.includes('frontline')) {
    armorCandidates = validArmor.filter(a => a.name?.toLowerCase().includes('combat') || a.name?.toLowerCase().includes('heavy') || a.name?.toLowerCase().includes('plate'));
  } else {
    armorCandidates = validArmor.filter(a => a.name?.toLowerCase().includes('jacket') || a.name?.toLowerCase().includes('light') || a.name?.toLowerCase().includes('weave') || a.name?.toLowerCase().includes('vest'));
  }

  armorCandidates.sort((a, b) => scoreArmor(b) - scoreArmor(a));
  const sortedAllArmor = [...validArmor].sort((a, b) => scoreArmor(b) - scoreArmor(a));
  const chosenArmor = armorCandidates[0] || sortedAllArmor[0] || null;

  if (chosenArmor) {
    armor.push({
      id: chosenArmor.id || `arm_${Date.now()}_1`,
      name: chosenArmor.name,
      dr: chosenArmor.dr || 8,
      durability: chosenArmor.durability || '20',
      tl: chosenArmor.tech_level ?? chosenArmor.tl ?? tl,
      ml: chosenArmor.meta_level ?? chosenArmor.ml ?? ml,
      recommended_tl: chosenArmor.recommended_tl || [`TL ${chosenArmor.tech_level ?? chosenArmor.tl ?? tl}`],
      recommended_ml: chosenArmor.recommended_ml || [`ML ${chosenArmor.meta_level ?? chosenArmor.ml ?? ml}`],
      keywords: chosenArmor.keywords || '',
      negative_keywords: chosenArmor.negative_keywords || '',
      qty: 1
    });
  }

  // Gear Scoring Heuristic (TL & ML resonance, keywords weight, negative keywords railguards)
  const scoreGearItem = (item) => {
    let score = 0;
    const gTl = Array.isArray(item.recommended_tl) ? item.recommended_tl : (typeof item.recommended_tl === 'string' ? item.recommended_tl.split(/[,;\n]+/).map(s => s.trim()) : []);
    const gMl = Array.isArray(item.recommended_ml) ? item.recommended_ml : (typeof item.recommended_ml === 'string' ? item.recommended_ml.split(/[,;\n]+/).map(s => s.trim()) : []);
    const itemTl = Number(item.tech_level ?? item.tl ?? 3);
    const itemMl = Number(item.meta_level ?? item.ml ?? 0);

    // TL Resonance
    if (gTl.some(t => String(t).toLowerCase().includes(String(tl)))) {
      score += 35;
    } else if (itemTl <= tl) {
      score += 15;
    } else {
      score -= 40;
    }

    // ML Resonance
    if (gMl.some(m => String(m).toLowerCase().includes(String(ml)))) {
      score += 25;
    } else if (itemMl === ml) {
      score += 10;
    }

    // Directives / Keywords (+Weight)
    if (item.keywords) {
      const kws = String(item.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kws) {
        if (combinedDirectives.includes(kw) || concept.includes(kw) || role.includes(kw) || occuName.includes(kw)) {
          score += 30;
          break;
        }
      }
    }

    // Negative Keywords / Railguards (-Weight)
    if (item.negative_keywords) {
      const negs = String(item.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const neg of negs) {
        if (combinedDirectives.includes(neg) || concept.includes(neg) || role.includes(neg) || occuName.includes(neg)) {
          score -= 60;
          break;
        }
      }
    }

    // Character railguards check
    if (combinedRailguards) {
      const itemName = (item.name || '').toLowerCase();
      if (combinedRailguards.includes(itemName)) {
        score -= 80;
      }
    }

    return score;
  };

  // Tactical Gear Kit calibrated to Occupation & resonant gear
  const baselineGear = [
    { name: `TL-${tl} Field Comm-Link`, qty: 1, weight: 0.5, notes: 'Secure encrypted planetary transmission', keywords: 'comms, encryption, planetary', negative_keywords: 'primitive' },
    { name: `TL-${tl} Standard Trauma Medkit`, qty: 1, weight: 2, notes: 'Stabilizes critical injuries', keywords: 'medical, trauma, healing', negative_keywords: 'toxic' },
    { name: `TL-${tl} Multi-Optics Scanner`, qty: 1, weight: 1, notes: 'Infrared and biosignature tracking', keywords: 'scanner, sensor, recon, tracking', negative_keywords: 'blind' }
  ];

  if (occuName.includes('pilot') || occuName.includes('engineer')) {
    baselineGear.push({ name: `TL-${tl} Diagnostics Toolset`, qty: 1, weight: 3, notes: 'Vehicle and avionics repairs', keywords: 'toolset, repair, mechanics, engineering', negative_keywords: 'primitive' });
  } else if (occuName.includes('agent') || occuName.includes('spy')) {
    baselineGear.push({ name: `TL-${tl} Cyberdeck Interface Cable`, qty: 1, weight: 0.5, notes: 'Direct terminal bypass', keywords: 'cyberdeck, intrusion, hacking, covert', negative_keywords: 'heavy' });
  }

  // If gearList provided with matching items, incorporate resonant items
  if (Array.isArray(gearList) && gearList.length > 0) {
    const scoredList = gearList.map(g => ({ item: g, score: scoreGearItem(g) })).filter(g => g.score > 0);
    scoredList.sort((a, b) => b.score - a.score);
    for (const scored of scoredList.slice(0, 2)) {
      if (!baselineGear.some(b => b.name.toLowerCase() === (scored.item.name || '').toLowerCase())) {
        baselineGear.push({
          id: scored.item.id,
          name: scored.item.name,
          qty: 1,
          weight: Number(scored.item.weight) || 1,
          notes: scored.item.description || scored.item.mechanic || '',
          tl: scored.item.tech_level ?? scored.item.tl ?? tl,
          ml: scored.item.meta_level ?? scored.item.ml ?? ml,
          recommended_tl: scored.item.recommended_tl,
          recommended_ml: scored.item.recommended_ml,
          keywords: scored.item.keywords,
          negative_keywords: scored.item.negative_keywords
        });
      }
    }
  }

  baselineGear.forEach((g, idx) => {
    gear.push({
      id: g.id || `gear_${Date.now()}_${idx}`,
      name: g.name,
      qty: g.qty || 1,
      weight: g.weight || 1,
      notes: g.notes || '',
      tl: g.tl ?? tl,
      ml: g.ml ?? ml,
      recommended_tl: g.recommended_tl || [`TL ${g.tl ?? tl}`],
      recommended_ml: g.recommended_ml || [`ML ${g.ml ?? ml}`],
      keywords: g.keywords || '',
      negative_keywords: g.negative_keywords || ''
    });
  });

  // Augmentation Scoring Heuristic (TL & ML resonance, keywords weight, negative keywords railguards)
  const scoreAugmentation = (aug) => {
    let score = 0;
    const aTl = Array.isArray(aug.recommended_tl) ? aug.recommended_tl : (typeof aug.recommended_tl === 'string' ? aug.recommended_tl.split(/[,;\n]+/).map(s => s.trim()) : []);
    const aMl = Array.isArray(aug.recommended_ml) ? aug.recommended_ml : (typeof aug.recommended_ml === 'string' ? aug.recommended_ml.split(/[,;\n]+/).map(s => s.trim()) : []);
    const itemTl = Number(aug.tech_level ?? aug.tl ?? 3);
    const itemMl = Number(aug.meta_level ?? aug.ml ?? 0);

    // TL Resonance
    if (aTl.some(t => String(t).toLowerCase().includes(String(tl)))) {
      score += 35;
    } else if (itemTl <= tl) {
      score += 15;
    } else {
      score -= 40;
    }

    // ML Resonance
    if (aMl.some(m => String(m).toLowerCase().includes(String(ml)))) {
      score += 25;
    } else if (itemMl === ml) {
      score += 10;
    }

    // Directives / Keywords (+Weight)
    if (aug.keywords) {
      const kws = String(aug.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kws) {
        if (combinedDirectives.includes(kw) || concept.includes(kw) || role.includes(kw) || occuName.includes(kw)) {
          score += 30;
          break;
        }
      }
    }

    // Negative Keywords / Railguards (-Weight)
    if (aug.negative_keywords) {
      const negs = String(aug.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const neg of negs) {
        if (combinedDirectives.includes(neg) || concept.includes(neg) || role.includes(neg) || occuName.includes(neg)) {
          score -= 60;
          break;
        }
      }
    }

    // Character railguards check
    if (combinedRailguards) {
      const augName = (aug.name || '').toLowerCase();
      if (combinedRailguards.includes(augName)) {
        score -= 80;
      }
    }

    return score;
  };

  const wantsCyberware = /cyber|augment|implant|bionic|neural|synth|overclock|transhuman|coprocessor|dermal|infiltrat|reflex/i.test(`${concept} ${role} ${occuName} ${combinedDirectives}`);
  const validAugmentations = (augmentationsList || []).filter(aug => (Number(aug.tech_level ?? aug.tl) || 3) <= Math.max(1, tl));

  if (wantsCyberware && validAugmentations.length > 0) {
    const sortedAugs = [...validAugmentations].sort((a, b) => scoreAugmentation(b) - scoreAugmentation(a));
    const chosenAug = sortedAugs[0];
    if (chosenAug && scoreAugmentation(chosenAug) > -50) {
      augmentations.push({
        id: chosenAug.id || `aug_${Date.now()}_1`,
        name: chosenAug.name,
        category: chosenAug.category || chosenAug.augmentation_type || 'augmentations',
        location: chosenAug.location || chosenAug.body_location || 'Systemic',
        tl: chosenAug.tech_level ?? chosenAug.tl ?? tl,
        ml: chosenAug.meta_level ?? chosenAug.ml ?? ml,
        recommended_tl: chosenAug.recommended_tl || [`TL ${chosenAug.tech_level ?? chosenAug.tl ?? tl}`],
        recommended_ml: chosenAug.recommended_ml || [`ML ${chosenAug.meta_level ?? chosenAug.ml ?? ml}`],
        keywords: chosenAug.keywords || '',
        negative_keywords: chosenAug.negative_keywords || '',
        qty: 1
      });
    }
  }

  // Mecha Scoring Heuristic (TL & ML resonance, keywords weight, negative keywords railguards)
  const scoreMecha = (m) => {
    let score = 0;
    const mTl = Array.isArray(m.recommended_tl) ? m.recommended_tl : (typeof m.recommended_tl === 'string' ? m.recommended_tl.split(/[,;\n]+/).map(s => s.trim()) : []);
    const mMl = Array.isArray(m.recommended_ml) ? m.recommended_ml : (typeof m.recommended_ml === 'string' ? m.recommended_ml.split(/[,;\n]+/).map(s => s.trim()) : []);
    const itemTl = Number(m.tech_level ?? m.tl ?? 3);
    const itemMl = Number(m.meta_level ?? m.ml ?? 0);

    // TL Resonance
    if (mTl.some(t => String(t).toLowerCase().includes(String(tl)))) {
      score += 35;
    } else if (itemTl <= tl) {
      score += 15;
    } else {
      score -= 40;
    }

    // ML Resonance
    if (mMl.some(mItem => String(mItem).toLowerCase().includes(String(ml)))) {
      score += 25;
    } else if (itemMl === ml) {
      score += 10;
    }

    // Directives / Keywords (+Weight)
    if (m.keywords) {
      const kws = String(m.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kws) {
        if (combinedDirectives.includes(kw) || concept.includes(kw) || role.includes(kw) || occuName.includes(kw)) {
          score += 30;
          break;
        }
      }
    }

    // Negative Keywords / Railguards (-Weight)
    if (m.negative_keywords) {
      const negs = String(m.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const neg of negs) {
        if (combinedDirectives.includes(neg) || concept.includes(neg) || role.includes(neg) || occuName.includes(neg)) {
          score -= 60;
          break;
        }
      }
    }

    // Character railguards check
    if (combinedRailguards) {
      const mechaName = (m.name || '').toLowerCase();
      if (combinedRailguards.includes(mechaName)) {
        score -= 80;
      }
    }

    return score;
  };

  const wantsMecha = /mecha|pilot|walker|chassis|vehicle|tank|cockpit|armor frame/i.test(`${concept} ${role} ${occuName} ${combinedDirectives}`);
  const validMecha = (mechaList || []).filter(m => (Number(m.tech_level ?? m.tl) || 3) <= Math.max(1, tl));

  if (wantsMecha && validMecha.length > 0) {
    const sortedMecha = [...validMecha].sort((a, b) => scoreMecha(b) - scoreMecha(a));
    const chosenMecha = sortedMecha[0];
    if (chosenMecha && scoreMecha(chosenMecha) > -50) {
      mecha.push({
        id: chosenMecha.id || `mecha_${Date.now()}_1`,
        name: chosenMecha.name,
        size: chosenMecha.size || 'Large',
        frame: chosenMecha.frame || 'Walker',
        sp: chosenMecha.sp || 100,
        dr: chosenMecha.dr || 10,
        tl: chosenMecha.tech_level ?? chosenMecha.tl ?? tl,
        ml: chosenMecha.meta_level ?? chosenMecha.ml ?? ml,
        recommended_tl: chosenMecha.recommended_tl || [`TL ${chosenMecha.tech_level ?? chosenMecha.tl ?? tl}`],
        recommended_ml: chosenMecha.recommended_ml || [`ML ${chosenMecha.meta_level ?? chosenMecha.ml ?? ml}`],
        keywords: chosenMecha.keywords || '',
        negative_keywords: chosenMecha.negative_keywords || '',
        qty: 1
      });
    }
  }

  // Architecture Scoring Heuristic (TL & ML resonance, keywords weight, negative keywords railguards)
  const scoreArchitecture = (arch) => {
    let score = 0;
    const aTl = Array.isArray(arch.recommended_tl) ? arch.recommended_tl : (typeof arch.recommended_tl === 'string' ? arch.recommended_tl.split(/[,;\n]+/).map(s => s.trim()) : []);
    const aMl = Array.isArray(arch.recommended_ml) ? arch.recommended_ml : (typeof arch.recommended_ml === 'string' ? arch.recommended_ml.split(/[,;\n]+/).map(s => s.trim()) : []);
    const itemTl = Number(arch.tech_level ?? arch.tl ?? 3);
    const itemMl = Number(arch.meta_level ?? arch.ml ?? 0);

    // TL Resonance
    if (aTl.some(t => String(t).toLowerCase().includes(String(tl)))) {
      score += 35;
    } else if (itemTl <= tl) {
      score += 15;
    } else {
      score -= 40;
    }

    // ML Resonance
    if (aMl.some(mItem => String(mItem).toLowerCase().includes(String(ml)))) {
      score += 25;
    } else if (itemMl === ml) {
      score += 10;
    }

    // Directives / Keywords (+Weight)
    if (arch.keywords) {
      const kws = String(arch.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kws) {
        if (combinedDirectives.includes(kw) || concept.includes(kw) || role.includes(kw) || occuName.includes(kw)) {
          score += 30;
          break;
        }
      }
    }

    // Negative Keywords / Railguards (-Weight)
    if (arch.negative_keywords) {
      const negs = String(arch.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const neg of negs) {
        if (combinedDirectives.includes(neg) || concept.includes(neg) || role.includes(neg) || occuName.includes(neg)) {
          score -= 60;
          break;
        }
      }
    }

    // Character railguards check
    if (combinedRailguards) {
      const archName = (arch.name || '').toLowerCase();
      if (combinedRailguards.includes(archName)) {
        score -= 80;
      }
    }

    return score;
  };

  const wantsArchitecture = /architect|builder|stronghold|habitat|outpost|facility|laboratory|safehouse|hideout|station|bunker|estate|citadel|refinery|workshop|armory/i.test(`${concept} ${role} ${occuName} ${combinedDirectives}`);
  const validArchitecture = (architectureList || []).filter(arch => (Number(arch.tech_level ?? arch.tl) || 3) <= Math.max(1, tl));

  if (wantsArchitecture && validArchitecture.length > 0) {
    const sortedArchitecture = [...validArchitecture].sort((a, b) => scoreArchitecture(b) - scoreArchitecture(a));
    const chosenArchitecture = sortedArchitecture[0];
    if (chosenArchitecture && scoreArchitecture(chosenArchitecture) > -50) {
      architecture.push({
        id: chosenArchitecture.id || `arch_${Date.now()}_1`,
        name: chosenArchitecture.name,
        category: chosenArchitecture.category || 'architecture',
        style: chosenArchitecture.style || 'Standard',
        sp: chosenArchitecture.sp || 500,
        dr: chosenArchitecture.dr || 15,
        tl: chosenArchitecture.tech_level ?? chosenArchitecture.tl ?? tl,
        ml: chosenArchitecture.meta_level ?? chosenArchitecture.ml ?? ml,
        recommended_tl: chosenArchitecture.recommended_tl || [`TL ${chosenArchitecture.tech_level ?? chosenArchitecture.tl ?? tl}`],
        recommended_ml: chosenArchitecture.recommended_ml || [`ML ${chosenArchitecture.meta_level ?? chosenArchitecture.ml ?? ml}`],
        keywords: chosenArchitecture.keywords || '',
        negative_keywords: chosenArchitecture.negative_keywords || '',
        qty: 1
      });
    }
  }

  // Other Property / Personal Property Scoring Heuristic (TL & ML resonance, keywords weight, negative keywords railguards)
  const scoreOtherItem = (item) => {
    let score = 0;
    const oTl = Array.isArray(item.recommended_tl) ? item.recommended_tl : (typeof item.recommended_tl === 'string' ? item.recommended_tl.split(/[,;\n]+/).map(s => s.trim()) : []);
    const oMl = Array.isArray(item.recommended_ml) ? item.recommended_ml : (typeof item.recommended_ml === 'string' ? item.recommended_ml.split(/[,;\n]+/).map(s => s.trim()) : []);
    const itemTl = Number(item.tech_level ?? item.tl ?? 2);
    const itemMl = Number(item.meta_level ?? item.ml ?? 0);

    // TL Resonance
    if (oTl.some(t => String(t).toLowerCase().includes(String(tl)))) {
      score += 35;
    } else if (itemTl <= tl) {
      score += 15;
    } else {
      score -= 40;
    }

    // ML Resonance
    if (oMl.some(mItem => String(mItem).toLowerCase().includes(String(ml)))) {
      score += 25;
    } else if (itemMl === ml) {
      score += 10;
    }

    // Directives / Keywords (+Weight)
    if (item.keywords) {
      const kws = String(item.keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of kws) {
        if (combinedDirectives.includes(kw) || concept.includes(kw) || role.includes(kw) || occuName.includes(kw)) {
          score += 30;
          break;
        }
      }
    }

    // Negative Keywords / Railguards (-Weight)
    if (item.negative_keywords) {
      const negs = String(item.negative_keywords).split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
      for (const neg of negs) {
        if (combinedDirectives.includes(neg) || concept.includes(neg) || role.includes(neg) || occuName.includes(neg)) {
          score -= 60;
          break;
        }
      }
    }

    // Character railguards check
    if (combinedRailguards) {
      const itemName = (item.name || '').toLowerCase();
      if (combinedRailguards.includes(itemName)) {
        score -= 80;
      }
    }

    return score;
  };

  const validOther = (otherList || []).filter(item => (Number(item.tech_level ?? item.tl) || 2) <= Math.max(1, tl));
  if (validOther.length > 0) {
    const scoredOther = validOther.map(item => ({ item, score: scoreOtherItem(item) })).filter(s => s.score > -30);
    scoredOther.sort((a, b) => b.score - a.score);
    for (const scored of scoredOther.slice(0, 3)) {
      other.push({
        id: scored.item.id || `other_${Date.now()}_${other.length + 1}`,
        name: scored.item.name,
        category: scored.item.category || 'other',
        weight: Number(scored.item.weight) || 1,
        tl: scored.item.tech_level ?? scored.item.tl ?? tl,
        ml: scored.item.meta_level ?? scored.item.ml ?? ml,
        recommended_tl: scored.item.recommended_tl || [`TL ${scored.item.tech_level ?? scored.item.tl ?? tl}`],
        recommended_ml: scored.item.recommended_ml || [`ML ${scored.item.meta_level ?? scored.item.ml ?? ml}`],
        keywords: scored.item.keywords || '',
        negative_keywords: scored.item.negative_keywords || '',
        qty: 1
      });
    }
  }

  return { weapons, armor, gear, augmentations, mecha, architecture, other };
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
  skills = [],
  features = [],
  gear = [],
  weapons = [],
  armor = [],
  augmentations = [],
  mecha = [],
  architecture = [],
  other = [],
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
    appearance: `${spName} physiology tailored with functional ${ocName} tactical attire bearing subtle ${fName} insignia.`,
    aiDirectives: {
      thematicWeights: Array.from(new Set([
        ...(species?.keywords ? String(species.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []),
        ...(faction?.keywords ? String(faction.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []),
        ...(origin?.keywords ? String(origin.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []),
        ...(occupation?.keywords ? String(occupation.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []),
        ...(Array.isArray(skills) ? skills.flatMap(s => s?.keywords ? String(s.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(features) ? features.flatMap(f => f?.keywords ? String(f.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(gear) ? gear.flatMap(g => g?.keywords ? String(g.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(weapons) ? weapons.flatMap(w => w?.keywords ? String(w.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(armor) ? armor.flatMap(a => a?.keywords ? String(a.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(augmentations) ? augmentations.flatMap(a => a?.keywords ? String(a.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(mecha) ? mecha.flatMap(m => m?.keywords ? String(m.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(architecture) ? architecture.flatMap(a => a?.keywords ? String(a.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(other) ? other.flatMap(o => o?.keywords ? String(o.keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : [])
      ])),
      negativeRailguards: Array.from(new Set([
        ...(species?.negative_keywords ? String(species.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []),
        ...(faction?.negative_keywords ? String(faction.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []),
        ...(origin?.negative_keywords ? String(origin.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []),
        ...(occupation?.negative_keywords ? String(occupation.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []),
        ...(Array.isArray(skills) ? skills.flatMap(s => s?.negative_keywords ? String(s.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(features) ? features.flatMap(f => f?.negative_keywords ? String(f.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(gear) ? gear.flatMap(g => g?.negative_keywords ? String(g.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(weapons) ? weapons.flatMap(w => w?.negative_keywords ? String(w.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(armor) ? armor.flatMap(a => a?.negative_keywords ? String(a.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(augmentations) ? augmentations.flatMap(a => a?.negative_keywords ? String(a.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(mecha) ? mecha.flatMap(m => m?.negative_keywords ? String(m.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(architecture) ? architecture.flatMap(a => a?.negative_keywords ? String(a.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : []),
        ...(Array.isArray(other) ? other.flatMap(o => o?.negative_keywords ? String(o.negative_keywords).split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : []) : [])
      ]))
    }
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

  // BP Costs according to compendium 1.00 / 1.01: TL3 is baseline (0 CP); 10 CP/BP per level difference
  const attrBPCost = totalRawAttrPoints * 5;
  const speciesBPCost = Number(species?.cp ?? species?.costs?.bp ?? 0) || 0;
  const tlBPCost = (tl - 3) * 10;

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
    metaLevel: 0,
    weaponryList: dbData.weaponry || DEFAULT_WEAPONRY,
    armoringList: dbData.armoring || DEFAULT_ARMORING,
    gearList: dbData.gear && dbData.gear.length > 0 ? dbData.gear : DEFAULT_GEAR
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
  const gearList = dbData.gear && dbData.gear.length > 0 ? dbData.gear : DEFAULT_GEAR;
  const augmentationsList = dbData.augmentations && dbData.augmentations.length > 0 ? dbData.augmentations : DEFAULT_AUGMENTATIONS;
  const mechaList = dbData.mecha && dbData.mecha.length > 0 ? dbData.mecha : DEFAULT_MECHA;
  const architectureList = dbData.architecture && dbData.architecture.length > 0 ? dbData.architecture : DEFAULT_ARCHITECTURE;
  const otherList = dbData.other && dbData.other.length > 0 ? dbData.other : DEFAULT_OTHER_PROPERTY;

  // 1. Pillar 1: Archetype (The Anchor)
  const archetype = preferredArchetype
    ? (archetypesList.find(a => a.name === preferredArchetype || a.id === preferredArchetype) || findClosestArchetype(prompt, archetypesList))
    : findClosestArchetype(prompt, archetypesList);

  const occuHint = preferredOccupation
    ? (occupationsList.find(oc => oc.name === preferredOccupation || oc.id === preferredOccupation) || null)
    : null;

  // 2. Pillar 2: Species
  const species = preferredSpecies
    ? (speciesList.find(s => s.name === preferredSpecies || s.id === preferredSpecies) || selectPillarSpecies(archetype, prompt, speciesList, null, null, occuHint))
    : selectPillarSpecies(archetype, prompt, speciesList, null, null, occuHint);

  // 3. Pillar 3: Faction
  const faction = preferredFaction
    ? (factionsList.find(f => f.name === preferredFaction || f.id === preferredFaction) || selectPillarFaction(archetype, prompt, factionsList, species, null, occuHint))
    : selectPillarFaction(archetype, prompt, factionsList, species, null, occuHint);

  // 4. Pillar 4: Origin
  const origin = preferredOrigin
    ? (originsList.find(o => o.name === preferredOrigin || o.id === preferredOrigin) || selectPillarOrigin(archetype, prompt, originsList, species, faction, occuHint))
    : selectPillarOrigin(archetype, prompt, originsList, species, faction, occuHint);

  // 5. Pillar 5: Occupation
  const occupation = preferredOccupation
    ? (occupationsList.find(oc => oc.name === preferredOccupation || oc.id === preferredOccupation) || selectPillarOccupation(archetype, prompt, occupationsList, species, faction, origin))
    : selectPillarOccupation(archetype, prompt, occupationsList, species, faction, origin);

  // Derive rules ledger and all aspects strictly from these 5 pillars
  const rulesLedger = calculateRulesLedger({
    archetype,
    species,
    faction,
    origin,
    occupation,
    techLevel,
    rawAttributes,
    dbData: { skills: skillsList, features: featuresList, traits: traitsList, weaponry: weaponryList, armoringList, gear: gearList, augmentationsList, mecha: mechaList, architecture: architectureList, other: otherList }
  });

  const attrData = derivePillarAttributes({ archetype, species });
  const activeRawAttrs = rawAttributes ? { ...rawAttributes } : attrData.rawAttributes;
  const finalAttrs = rulesLedger.finalAttributes;

  const skillData = derivePillarSkills({ archetype, species, faction, origin, occupation, skillsList, techLevel, metaLevel: 3 });
  const traitFeatData = derivePillarTraitsAndFeatures({ archetype, species, faction, origin, occupation, featuresList, traitsList, techLevel, metaLevel: 3 });
  const propertyData = derivePillarProperty({ archetype, occupation, faction, species, techLevel, metaLevel: 0, weaponryList, armoringList, gearList, augmentationsList, mechaList, architectureList, otherList });
  const narrativeData = derivePillarNarrative({ archetype, species, faction, origin, occupation, skills: skillData.finalSkillsList, features: traitFeatData.features, gear: propertyData.gear, weapons: propertyData.weapons, armor: propertyData.armor, augmentations: propertyData.augmentations, mecha: propertyData.mecha, architecture: propertyData.architecture, other: propertyData.other, prompt });

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
    'base-tech-level': 3,
    'base-meta-level': 3,
    'tech-level': techLevel || 3,
    'magic-level': 3,
    'meta-level': 3,
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
    augmentations: propertyData.augmentations || [],
    mecha: propertyData.mecha || [],
    architecture: propertyData.architecture || [],
    other: propertyData.other || [],

    notes: [{ text: `[BASTION SYNTHESIS PROTOCOL]\nGenerated via 5 Canonical Pillars:\n- Archetype: ${archetype.name}\n- Species: ${species.name}\n- Faction: ${faction.name}\n- Origin: ${origin.name}\n- Occupation: ${occupation.name}\n\n${narrativeData.backstory}` }]
  };

  const syncedCharacterPayload = syncIdentitySettingLevels(characterPayload, dbData);

  return {
    success: true,
    character: syncedCharacterPayload,
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
      gearCount: propertyData.gear.length,
      augmentationsCount: propertyData.augmentations?.length || 0,
      mechaCount: propertyData.mecha?.length || 0,
      architectureCount: propertyData.architecture?.length || 0
    }
  };
};
