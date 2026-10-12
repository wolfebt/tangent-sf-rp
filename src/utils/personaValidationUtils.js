import { StorageService } from '../services/storageService.js';

export const FOLIO_TOMBSTONES_KEY = 'folio_deleted_personas';

export const getFolioTombstones = () => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(FOLIO_TOMBSTONES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addFolioTombstone = (docIdOrChar) => {
  if (!docIdOrChar) return;
  try {
    const current = getFolioTombstones();
    const set = new Set(current.map(id => (id ? id.toString().trim() : '')).filter(Boolean));

    const extractIds = (item) => {
      if (!item) return;
      if (typeof item === 'object') {
        const id1 = item['character-doc-id']?.toString()?.trim();
        const id2 = item.id?.toString()?.trim();
        const id3 = item['char-id']?.toString()?.trim();
        const id4 = item['doc-id']?.toString()?.trim();
        const id5 = item.character_doc_id?.toString()?.trim();
        if (id1) set.add(id1);
        if (id2) set.add(id2);
        if (id3) set.add(id3);
        if (id4) set.add(id4);
        if (id5) set.add(id5);
      } else {
        const str = item.toString().trim();
        if (str) set.add(str);
      }
    };

    if (Array.isArray(docIdOrChar)) {
      docIdOrChar.forEach(extractIds);
    } else {
      extractIds(docIdOrChar);
    }

    const updated = Array.from(set);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FOLIO_TOMBSTONES_KEY, JSON.stringify(updated));
    }
    StorageService.setItem(FOLIO_TOMBSTONES_KEY, updated);
  } catch (e) {}
};

export const removeFolioTombstones = (ids) => {
  if (!ids) return;
  try {
    const toRemove = new Set((Array.isArray(ids) ? ids : [ids]).map(x => (x ? x.toString().trim().toLowerCase() : '')).filter(Boolean));
    if (toRemove.size === 0) return;
    const current = getFolioTombstones();
    const updated = current.filter(x => !toRemove.has((x ? x.toString().trim().toLowerCase() : '')));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FOLIO_TOMBSTONES_KEY, JSON.stringify(updated));
    }
    StorageService.setItem(FOLIO_TOMBSTONES_KEY, updated);
  } catch (e) {}
};

export const clearFolioTombstones = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(FOLIO_TOMBSTONES_KEY);
    }
    StorageService.removeItem(FOLIO_TOMBSTONES_KEY);
  } catch (e) {}
};

export const isFolioPersonaDeleted = (docIdOrChar, tombstones = null) => {
  if (!docIdOrChar) return false;
  if (typeof docIdOrChar === 'object' && docIdOrChar.isDeleted === true) return true;

  const list = tombstones || getFolioTombstones();
  if (!list || list.length === 0) return false;
  const set = new Set(list.map(id => (id ? id.toString().trim() : '')).filter(Boolean));
  const lowerSet = new Set(list.map(id => (id ? id.toString().trim().toLowerCase() : '')).filter(Boolean));

  if (typeof docIdOrChar === 'object') {
    const candidates = [
      docIdOrChar['character-doc-id'],
      docIdOrChar.id,
      docIdOrChar['char-id'],
      docIdOrChar['doc-id'],
      docIdOrChar.character_doc_id
    ].map(x => (x ? x.toString().trim() : '')).filter(Boolean);

    for (const c of candidates) {
      if (set.has(c) || lowerSet.has(c.toLowerCase())) return true;
    }
    return false;
  }

  const rawStr = docIdOrChar.toString().trim();
  return set.has(rawStr) || lowerSet.has(rawStr.toLowerCase());
};

/**
 * Checks if a persona is an untouched, empty template ghost
 * (blank or default name, no attributes, skills, concept, species, or backstory customization).
 */
export const isPersonaEmptyTemplate = (char) => {
  if (!char || typeof char !== 'object') return true;

  const name = (char['char-name'] || char.name || '').trim();
  const isDefaultName = !name || name.toLowerCase() === 'unnamed persona' || name.toLowerCase() === 'unnamed operative';

  const hasConcept = Boolean(char['char-concept'] && char['char-concept'].trim() && char['char-concept'].trim().toLowerCase() !== 'unnamed persona' && char['char-concept'].trim().toLowerCase() !== 'unnamed operative');
  const hasArchetype = Boolean(char['char-archetype'] && char['char-archetype'].trim());
  const hasSpecies = Boolean(char['char-species'] && char['char-species'].trim());
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

  const hasAllocations = Boolean(
    (char.speciesAllocations && (
      Object.keys(char.speciesAllocations.skills || {}).length > 0 ||
      Object.keys(char.speciesAllocations.attributes || {}).length > 0 ||
      (char.speciesAllocations.traits || []).length > 0 ||
      (char.speciesAllocations.features || []).length > 0
    )) ||
    (char.archetypeAllocations && (
      Object.keys(char.archetypeAllocations.skills || {}).length > 0 ||
      Object.keys(char.archetypeAllocations.attributes || {}).length > 0 ||
      (char.archetypeAllocations.features || []).length > 0
    )) ||
    (char.occuAllocations && (
      Object.keys(char.occuAllocations.skills || {}).length > 0 ||
      (char.occuAllocations.traits || []).length > 0 ||
      (char.occuAllocations.features || []).length > 0
    )) ||
    (char.originAllocations && (
      Object.keys(char.originAllocations.skills || {}).length > 0 ||
      (char.originAllocations.traits || []).length > 0 ||
      (char.originAllocations.features || []).length > 0
    )) ||
    (char.factionAllocations && (
      Object.keys(char.factionAllocations.skills || {}).length > 0 ||
      (char.factionAllocations.traits || []).length > 0 ||
      (char.factionAllocations.features || []).length > 0
    ))
  );

  if (isDefaultName && !hasConcept && !hasArchetype && !hasSpecies && !hasOccu && !hasFaction && !hasOrigin && !hasBackstory && !hasMotive && !hasAttrAlloc && !hasSkills && !hasAttacks && !hasFeatures && !hasAllocations) {
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
