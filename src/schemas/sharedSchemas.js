/**
 * TANGENT SFF RP: Canonical Unified Cross-Module Schema & Adapters
 * Provides seamless bidirectional data transformation between:
 * 1. Omnicortex DBM Catalog Items
 * 2. Story Foundry Creative Elements
 * 3. Persona Folio Characters & Operatives
 * 4. Battlemap Tactical Tokens
 */

import { z } from 'zod';

// Canonical Core Attribute Keys
export const CANONICAL_ATTRIBUTES = [
  'strength',
  'agility',
  'stamina',
  'intellect',
  'perception',
  'presence',
  'tech',
  'willpower',
  'charisma',
  'metaphysics',
  'luck',
  'karma'
];

/**
 * Standardizes an entity name across formats ('name', 'char-name', 'title', 'label')
 */
export function extractCanonicalName(entity = {}) {
  return entity.name || entity['char-name'] || entity.title || entity.label || 'Unnamed Entity';
}

/**
 * Converts an Omnicortex DBM Item into a Story Foundry Element
 */
export function dbmItemToFoundryElement(dbmItem = {}, categoryKey = 'compendium') {
  const name = extractCanonicalName(dbmItem);
  return {
    id: dbmItem.id || `elem_${categoryKey}_${Date.now()}`,
    type: categoryKey === 'species' ? 'Species' : categoryKey === 'occupations' ? 'Occupation' : categoryKey === 'factions' ? 'Faction' : 'Lore',
    title: name,
    content: dbmItem.description || dbmItem.content || dbmItem.summary || '',
    fields: {
      tl: dbmItem.tl || dbmItem.techLevel || 3,
      ml: dbmItem.ml || dbmItem.metaLevel || 0,
      cost: dbmItem.cost || dbmItem.price || 0,
      category: categoryKey,
      tags: dbmItem.tags || [categoryKey],
      ...dbmItem
    },
    updatedAt: new Date().toISOString()
  };
}

/**
 * Converts a Story Foundry Element into an Omnicortex DBM Item
 */
export function foundryElementToDbmItem(foundryElement = {}) {
  const fields = foundryElement.fields || {};
  return {
    id: foundryElement.id || `dbm_${Date.now()}`,
    name: foundryElement.title || 'Untitled Item',
    description: foundryElement.content || '',
    tl: fields.tl !== undefined ? fields.tl : 3,
    ml: fields.ml !== undefined ? fields.ml : 0,
    cost: fields.cost || 0,
    tags: fields.tags || [foundryElement.type || 'compendium'],
    updatedAt: new Date().toISOString(),
    ...fields
  };
}

/**
 * Converts a Persona Folio Character into a Story Foundry Persona Element
 */
export function folioCharacterToFoundryPersona(character = {}) {
  const name = character['char-name'] || character.name || 'Operative';
  const speciesStr = String(character['char-species'] || character.species || '').toLowerCase();
  const archetypeStr = String(character['char-archetype'] || character.archetype || '').toLowerCase();
  const isSynthetic = Boolean(
    character.isSynthetic ?? character.is_synthetic ?? (
      speciesStr.includes('synthetic') || speciesStr.includes('mekan') || 
      speciesStr.includes('construct') || speciesStr.includes('golem') || 
      speciesStr.includes('ooze') || speciesStr.includes('undead') ||
      speciesStr.includes('mecha') || speciesStr.includes('robot') || speciesStr.includes('drone') ||
      archetypeStr.includes('synthetic')
    )
  );

  let curHealth = null;
  let maxHealth = null;
  let curVitality = null;
  let maxVitality = null;
  let curStructure = null;
  let maxStructure = null;

  if (isSynthetic) {
    const rawStruct = character.structure ?? character.max_structure ?? character['max-structure'];
    const fallback = (parseInt(character.health || 30, 10) + parseInt(character.vitality || 30, 10)) || 60;
    maxStructure = parseInt(rawStruct !== undefined && rawStruct !== null ? rawStruct : fallback, 10);
    curStructure = character.current_structure ?? character['current-structure'] ?? character.structure?.current ?? maxStructure;
  } else {
    curHealth = character.current_health ?? character['current-health'] ?? character.health?.current ?? (typeof character.health === 'number' ? character.health : 30);
    maxHealth = character.max_health ?? character['max-health'] ?? character.health?.max ?? (typeof character.health === 'number' ? character.health : 30);
    curVitality = character.current_vitality ?? character['current-vitality'] ?? character.vitality?.current ?? (typeof character.vitality === 'number' ? character.vitality : 30);
    maxVitality = character.max_vitality ?? character['max-vitality'] ?? character.vitality?.max ?? (typeof character.vitality === 'number' ? character.vitality : 30);
  }

  return {
    id: character['character-doc-id'] || character.id || `elem_persona_${Date.now()}`,
    type: 'Persona',
    title: name,
    content: character['narrative-backstory'] || character.backstory || '',
    stats: {
      health: maxHealth,
      vitality: maxVitality,
      structure: maxStructure,
      current_health: curHealth,
      current_vitality: curVitality,
      current_structure: curStructure,
      isSynthetic
    },
    fields: {
      'char-name': name,
      'char-species': character['char-species'] || character.species || 'Human',
      'char-occu': character['char-occu'] || character.occupation || 'Operative',
      'char-origin': character['char-origin'] || character.origin || 'Core World',
      'char-faction': character['char-faction'] || character.faction || 'Independent',
      isSynthetic,
      current_health: curHealth,
      'current-health': curHealth,
      max_health: maxHealth,
      'max-health': maxHealth,
      current_vitality: curVitality,
      'current-vitality': curVitality,
      max_vitality: maxVitality,
      'max-vitality': maxVitality,
      current_structure: curStructure,
      'current-structure': curStructure,
      max_structure: maxStructure,
      'max-structure': maxStructure,
      karma: character.karma !== undefined ? character.karma : 3,
      earned_ap: character.earned_ap || 0,
      available_ap: character.available_ap || 0,
      avatarUrl: character.avatarUrl || null,
      ...character
    },
    updatedAt: new Date().toISOString()
  };
}

/**
 * Converts a Story Foundry Persona Element into a Persona Folio Character format
 */
export function foundryPersonaToFolioCharacter(personaElement = {}) {
  const fields = personaElement.fields || {};
  const stats = personaElement.stats || {};
  const name = fields['char-name'] || personaElement.title || 'Operative';
  const speciesStr = String(fields['char-species'] || '').toLowerCase();
  const isSynthetic = Boolean(fields.isSynthetic ?? stats.isSynthetic ?? (
    speciesStr.includes('synthetic') || speciesStr.includes('mekan') || 
    speciesStr.includes('construct') || speciesStr.includes('golem') || 
    speciesStr.includes('ooze') || speciesStr.includes('undead') ||
    speciesStr.includes('mecha') || speciesStr.includes('robot') || speciesStr.includes('drone')
  ));

  let curHealth = null;
  let maxHealth = null;
  let curVitality = null;
  let maxVitality = null;
  let curStructure = null;
  let maxStructure = null;

  if (isSynthetic) {
    maxStructure = stats.structure ?? fields.max_structure ?? fields['max-structure'] ?? 60;
    curStructure = stats.current_structure ?? fields.current_structure ?? fields['current-structure'] ?? maxStructure;
  } else {
    curHealth = stats.current_health ?? fields.current_health ?? fields['current-health'] ?? 30;
    maxHealth = stats.health ?? fields.max_health ?? fields['max-health'] ?? fields.health ?? 30;
    curVitality = stats.current_vitality ?? fields.current_vitality ?? fields['current-vitality'] ?? 30;
    maxVitality = stats.vitality ?? fields.max_vitality ?? fields['max-vitality'] ?? fields.vitality ?? 30;
  }

  return {
    id: personaElement.id || `char_${Date.now()}`,
    'character-doc-id': personaElement.id || `char_${Date.now()}`,
    'char-name': name,
    'char-species': fields['char-species'] || 'Human',
    'char-occu': fields['char-occu'] || 'Operative',
    'char-origin': fields['char-origin'] || 'Core World',
    'char-faction': fields['char-faction'] || 'Independent',
    'narrative-backstory': personaElement.content || fields['narrative-backstory'] || '',
    isSynthetic,
    current_health: curHealth,
    'current-health': curHealth,
    max_health: maxHealth,
    'max-health': maxHealth,
    health: maxHealth,
    current_vitality: curVitality,
    'current-vitality': curVitality,
    max_vitality: maxVitality,
    'max-vitality': maxVitality,
    vitality: maxVitality,
    current_structure: curStructure,
    'current-structure': curStructure,
    max_structure: maxStructure,
    'max-structure': maxStructure,
    structure: maxStructure,
    karma: fields.karma !== undefined ? fields.karma : 3,
    maxKarma: fields.maxKarma || 3,
    earned_ap: fields.earned_ap || 0,
    available_ap: fields.available_ap || 0,
    avatarUrl: fields.avatarUrl || null,
    updatedAt: new Date().toISOString(),
    ...fields
  };
}

/**
 * Converts a Battlemap Token into a lightweight Folio character representation
 */
export function tokenToFolioCharacter(token = {}) {
  const stats = token.stats || {};
  const isSynthetic = Boolean(token.isSynthetic || token.is_synthetic || stats.isSynthetic || Boolean(token.structure || stats.structure));

  let curHealth = null;
  let maxHealth = null;
  let curVitality = null;
  let maxVitality = null;
  let curStructure = null;
  let maxStructure = null;

  if (isSynthetic) {
    maxStructure = stats.max_structure ?? stats.structure?.max ?? stats.structure ?? token.structure?.max ?? token.max_structure ?? token['max-structure'] ?? token.structure ?? 60;
    curStructure = stats.current_structure ?? stats.structure?.current ?? token.structure?.current ?? token.current_structure ?? token['current-structure'] ?? maxStructure;
  } else {
    curHealth = stats.current_health ?? stats.current_hp ?? stats.health?.current ?? stats.hp?.current ?? token.health?.current ?? token.hp?.current ?? token.current_health ?? token['current-health'] ?? 30;
    maxHealth = stats.health ?? stats.max_health ?? stats.health?.max ?? stats.hp?.max ?? token.health?.max ?? token.hp?.max ?? token.max_health ?? token['max-health'] ?? token.health ?? 30;
    curVitality = stats.current_vitality ?? stats.vitality?.current ?? token.vitality?.current ?? token.current_vitality ?? token['current-vitality'] ?? 30;
    maxVitality = stats.vitality ?? stats.max_vitality ?? stats.vitality?.max ?? token.vitality?.max ?? token.max_vitality ?? token['max-vitality'] ?? token.vitality ?? 30;
  }

  return {
    id: token.linkedHeroId || token.id,
    'character-doc-id': token.linkedHeroId || token.id,
    'char-name': token.label || token.name || 'Unit',
    isSynthetic,
    current_health: curHealth,
    'current-health': curHealth,
    max_health: maxHealth,
    'max-health': maxHealth,
    health: maxHealth,
    current_vitality: curVitality,
    'current-vitality': curVitality,
    max_vitality: maxVitality,
    'max-vitality': maxVitality,
    vitality: maxVitality,
    current_structure: curStructure,
    'current-structure': curStructure,
    max_structure: maxStructure,
    'max-structure': maxStructure,
    structure: maxStructure,
    toughness: token.toughness || stats.toughness || 0,
    defense: token.defense || stats.defense || 12,
    karma: token.karma !== undefined ? token.karma : 3,
    avatarUrl: token.avatarUrl || null
  };
}

/**
 * Extracts and normalizes hero tactical statistics for map tokens and battle cards
 */
export function extractHeroStats(hero = {}) {
  const speciesStr = String(hero['char-species'] || hero.species || '').toLowerCase();
  const archetypeStr = String(hero['char-archetype'] || hero.archetype || '').toLowerCase();
  const isSynthetic = Boolean(
    hero.isSynthetic ?? hero.is_synthetic ?? (
      speciesStr.includes('synthetic') || speciesStr.includes('mekan') || 
      speciesStr.includes('construct') || speciesStr.includes('golem') || 
      speciesStr.includes('ooze') || speciesStr.includes('undead') ||
      speciesStr.includes('mecha') || speciesStr.includes('robot') || speciesStr.includes('drone') ||
      archetypeStr.includes('synthetic')
    )
  );

  const defense = parseInt(hero.derived_defense || ((hero['attr-reflex'] !== undefined && hero['attr-reflex'] !== null) ? parseInt(hero['attr-reflex'], 10) + 10 : 12), 10);
  const actionPoints = parseInt(hero.derived_ap || 3, 10);
  const agility = parseInt(hero['attr-agility'] ?? hero.attr_agility ?? 0, 10);
  const stamina = parseInt(hero['attr-stamina'] ?? hero.attr_stamina ?? 0, 10);
  const toughness = stamina;

  if (isSynthetic) {
    const rawStructure = hero.structure ?? hero.max_structure ?? hero['max-structure'] ?? hero.derived_max_structure;
    const fallbackStructure = parseInt((hero.health || 30), 10) + parseInt((hero.vitality || 30), 10);
    const maxStructure = parseInt(rawStructure !== undefined && rawStructure !== null ? rawStructure : fallbackStructure, 10) || 60;
    const currentStructure = hero.current_structure !== undefined && hero.current_structure !== null
      ? parseInt(hero.current_structure, 10)
      : (hero['current-structure'] !== undefined && hero['current-structure'] !== null ? parseInt(hero['current-structure'], 10) : maxStructure);

    return {
      heroId: hero['character-doc-id'] || hero.id,
      name: hero['char-name'] || hero.name || 'Unnamed Hero',
      avatarUrl: hero.avatarUrl || hero.imageUrl || null,
      maxHealth: null,
      currentHealth: null,
      maxVitality: null,
      currentVitality: null,
      maxStructure,
      currentStructure,
      health: null,
      vitality: null,
      structure: { current: currentStructure, max: maxStructure },
      defense,
      actionPoints,
      agility,
      stamina,
      toughness,
      isSynthetic: true,
      karma: parseInt(hero.karma !== undefined ? hero.karma : 3, 10),
      maxKarma: parseInt(hero.maxKarma || 3, 10),
      charisma: parseInt(hero['attr-charisma'] ?? hero.attr_charisma ?? 0, 10),
      earned_ap: parseInt(hero.earned_ap || 0, 10),
      available_ap: parseInt(hero.available_ap || hero.earned_ap || 0, 10)
    };
  } else {
    const maxHealth = parseInt(hero.health || hero.derived_max_hp || 30, 10);
    const currentHealth = hero.current_health !== undefined && hero.current_health !== null
      ? parseInt(hero.current_health, 10)
      : (hero.current_hp !== undefined && hero.current_hp !== null ? parseInt(hero.current_hp, 10) : (hero['current-health'] !== undefined ? parseInt(hero['current-health'], 10) : maxHealth));
    const maxVitality = parseInt(hero.vitality || hero.derived_max_vitality || 30, 10);
    const currentVitality = hero.current_vitality !== undefined && hero.current_vitality !== null
      ? parseInt(hero.current_vitality, 10)
      : (hero['current-vitality'] !== undefined ? parseInt(hero['current-vitality'], 10) : maxVitality);

    return {
      heroId: hero['character-doc-id'] || hero.id,
      name: hero['char-name'] || hero.name || 'Unnamed Hero',
      avatarUrl: hero.avatarUrl || hero.imageUrl || null,
      maxHealth,
      currentHealth,
      maxVitality,
      currentVitality,
      maxStructure: null,
      currentStructure: null,
      health: { current: currentHealth, max: maxHealth },
      vitality: { current: currentVitality, max: maxVitality },
      structure: null,
      defense,
      actionPoints,
      agility,
      stamina,
      toughness,
      isSynthetic: false,
      karma: parseInt(hero.karma !== undefined ? hero.karma : 3, 10),
      maxKarma: parseInt(hero.maxKarma || 3, 10),
      charisma: parseInt(hero['attr-charisma'] ?? hero.attr_charisma ?? 0, 10),
      earned_ap: parseInt(hero.earned_ap || 0, 10),
      available_ap: parseInt(hero.available_ap || hero.earned_ap || 0, 10)
    };
  }
}

export default {
  CANONICAL_ATTRIBUTES,
  extractCanonicalName,
  dbmItemToFoundryElement,
  foundryElementToDbmItem,
  folioCharacterToFoundryPersona,
  foundryPersonaToFolioCharacter,
  tokenToFolioCharacter,
  extractHeroStats
};
