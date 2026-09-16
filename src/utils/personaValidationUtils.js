import { StorageService } from '../services/storageService';

export const FOLIO_TOMBSTONES_KEY = 'folio_deleted_personas';

export const getFolioTombstones = () => {
  try {
    const raw = localStorage.getItem(FOLIO_TOMBSTONES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addFolioTombstone = (docId) => {
  if (!docId) return;
  try {
    const current = getFolioTombstones();
    const set = new Set(current);
    set.add(docId.toString().trim());
    const updated = Array.from(set);
    localStorage.setItem(FOLIO_TOMBSTONES_KEY, JSON.stringify(updated));
    StorageService.setItem(FOLIO_TOMBSTONES_KEY, updated);
  } catch (e) {}
};

export const isFolioPersonaDeleted = (docId, tombstones = null) => {
  if (!docId) return false;
  const list = tombstones || getFolioTombstones();
  if (!list || list.length === 0) return false;
  return new Set(list).has(docId.toString().trim());
};

/**
 * Checks if a persona is an untouched, empty template ghost
 * (blank or default name, no attributes, skills, concept, species, or backstory customization).
 */
export const isPersonaEmptyTemplate = (char) => {
  if (!char || typeof char !== 'object') return true;

  const name = (char['char-name'] || char.name || '').trim();
  const isDefaultName = !name || name.toLowerCase() === 'unnamed operative';

  const hasConcept = Boolean(char['char-concept'] && char['char-concept'].trim() && char['char-concept'].trim().toLowerCase() !== 'unnamed operative');
  const hasArchetype = Boolean(char['char-archetype'] && char['char-archetype'].trim());
  const hasSpecies = Boolean(char['char-species'] && char['char-species'].trim() && char['char-species'] !== 'Human');
  const hasOccu = Boolean(char['char-occu'] && char['char-occu'].trim());
  const hasFaction = Boolean(char['char-faction'] && char['char-faction'].trim());
  const hasOrigin = Boolean(char['char-origin'] && char['char-origin'].trim());
  const hasBackstory = Boolean(char.backstory && char.backstory.trim());
  const hasMotive = Boolean(char['char-motive'] && char['char-motive'].trim());

  const primaryAttrs = ['attr-strength', 'attr-agility', 'attr-stamina', 'attr-intellect', 'attr-wisdom', 'attr-charisma'];
  const hasAttrAlloc = primaryAttrs.some(k => parseInt(char[k], 10) > 0);

  const hasSkills = Object.keys(char).some(k => k.startsWith('skill-') && k.endsWith('-rank') && parseInt(char[k], 10) > 0);
  const hasAttacks = Array.isArray(char.attacks) && char.attacks.length > 0;
  const hasFeatures = Array.isArray(char.features) && char.features.length > 0;

  if (isDefaultName && !hasConcept && !hasArchetype && !hasSpecies && !hasOccu && !hasFaction && !hasOrigin && !hasBackstory && !hasMotive && !hasAttrAlloc && !hasSkills && !hasAttacks && !hasFeatures) {
    return true;
  }
  return false;
};

/**
 * Resolves the cleanest user handle according to network standards:
 * 1. user.userHandle
 * 2. user.handle
 * 3. user.displayName (if not a raw email)
 * 4. user.email prefix
 * 5. fallback: 'Operator'
 */
export const getEffectiveUserHandle = (user) => {
  if (!user) return 'Operator';
  if (typeof user === 'string') {
    const trimmed = user.trim().replace(/^@/, '');
    return trimmed || 'Operator';
  }

  const rawHandle = user.userHandle || user.handle;
  if (rawHandle && typeof rawHandle === 'string' && rawHandle.trim()) {
    return rawHandle.trim().replace(/^@/, '');
  }

  const displayName = user.displayName;
  if (displayName && typeof displayName === 'string' && displayName.trim() && !displayName.includes('@')) {
    return displayName.trim().replace(/^@/, '');
  }

  const email = user.email;
  if (email && typeof email === 'string' && email.includes('@')) {
    const prefix = email.split('@')[0].trim().replace(/^@/, '');
    if (prefix) return prefix;
  }

  if (displayName && typeof displayName === 'string' && displayName.trim()) {
    return displayName.trim().replace(/^@/, '');
  }

  return 'Operator';
};
