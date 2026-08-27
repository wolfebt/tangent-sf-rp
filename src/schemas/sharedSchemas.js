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
  return {
    id: character['character-doc-id'] || character.id || `elem_persona_${Date.now()}`,
    type: 'Persona',
    title: name,
    content: character['narrative-backstory'] || character.backstory || '',
    fields: {
      'char-name': name,
      'char-species': character['char-species'] || character.species || 'Human',
      'char-occu': character['char-occu'] || character.occupation || 'Operative',
      'char-origin': character['char-origin'] || character.origin || 'Core World',
      'char-faction': character['char-faction'] || character.faction || 'Independent',
      'current-health': character['current-health'] || character.health?.current || 30,
      'max-health': character['max-health'] || character.health?.max || 30,
      'current-vitality': character['current-vitality'] || character.vitality?.current || 30,
      'max-vitality': character['max-vitality'] || character.vitality?.max || 30,
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
  const name = fields['char-name'] || personaElement.title || 'Operative';
  return {
    id: personaElement.id || `char_${Date.now()}`,
    'character-doc-id': personaElement.id || `char_${Date.now()}`,
    'char-name': name,
    'char-species': fields['char-species'] || 'Human',
    'char-occu': fields['char-occu'] || 'Operative',
    'char-origin': fields['char-origin'] || 'Core World',
    'char-faction': fields['char-faction'] || 'Independent',
    'narrative-backstory': personaElement.content || fields['narrative-backstory'] || '',
    'current-health': fields['current-health'] || 30,
    'max-health': fields['max-health'] || 30,
    'current-vitality': fields['current-vitality'] || 30,
    'max-vitality': fields['max-vitality'] || 30,
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
  return {
    id: token.linkedHeroId || token.id,
    'character-doc-id': token.linkedHeroId || token.id,
    'char-name': token.label || 'Unit',
    'current-health': token.health?.current ?? token.hp?.current ?? 30,
    'max-health': token.health?.max ?? token.hp?.max ?? 30,
    'current-vitality': token.vitality?.current ?? 30,
    'max-vitality': token.vitality?.max ?? 30,
    'current-structure': token.structure?.current ?? 60,
    'max-structure': token.structure?.max ?? 60,
    isSynthetic: token.isSynthetic || Boolean(token.structure),
    toughness: token.toughness || 0,
    defense: token.defense || 12,
    karma: token.karma !== undefined ? token.karma : 3,
    avatarUrl: token.avatarUrl || null
  };
}

export default {
  CANONICAL_ATTRIBUTES,
  extractCanonicalName,
  dbmItemToFoundryElement,
  foundryElementToDbmItem,
  folioCharacterToFoundryPersona,
  foundryPersonaToFolioCharacter,
  tokenToFolioCharacter
};
