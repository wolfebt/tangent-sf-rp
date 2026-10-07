import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { db, auth } from '../../firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useDBM } from '../DBMContext';
import { attachCreatorTag } from '../../utils/creatorUtils';
import { StorageService } from '../../services/storageService';
import { AudioService } from '../../services/audioService';
import { 
  isStoryElementData, 
  convertPersonaElementToFolio, 
  exportStoryElementJSON 
} from '../../utils/personaBridge';
import { 
  sanitizeSubAttributes 
} from '../../utils/attributeUtils';
import { 
  applySpeciesTransition,
  applyArchetypeTransition,
  applyOccupationTransition,
  applyOriginTransition,
  applyFactionTransition,
  applyIdentityFieldTransition
} from '../../engines/tangentEntityEngines';
import { 
  FOLIO_TOMBSTONES_KEY, 
  getFolioTombstones, 
  addFolioTombstone, 
  isFolioPersonaDeleted, 
  isPersonaEmptyTemplate,
  getEffectiveUserHandle 
} from '../../utils/personaValidationUtils';
import { ALL_CANONICAL_SKILLS } from '../../data/skillsData';
import { showToast } from '../ToastContext';
import { showConfirm } from '../ConfirmContext';

export const DEFAULT_CHARACTER = {
  'character-doc-id': '',
  isPublic: false,
  networkEngaged: false,
  isNetworkEngaged: false,
  authorHandle: '',
  ownerUid: '',
  'char-name': '',
  'char-concept': '',
  'char-archetype': '',
  'char-species': '',
  'char-occu': '',
  'char-secondary-occu': '',
  'char-origin': '',
  'char-secondary-origin': '',
  'char-faction': '',
  'char-age': '',
  'char-gender': '',
  'char-height': '',
  'char-weight': '',
  'char-style': '',
  'char-motive': '',
  'attr-strength': 0,
  'attr-might': 2,
  'attr-agility': 0,
  'attr-reflex': 2,
  'attr-stamina': 0,
  'attr-fortitude': 2,
  'attr-intellect': 0,
  'attr-logic': 2,
  'attr-reason': 2,
  'attr-wisdom': 0,
  'attr-will': 2,
  'attr-willpower': 2,
  'attr-charisma': 0,
  'attr-etiquette': 2,
  'starting-cp': 150,
  'tech-level': 3,
  'magic-level': 1,
  'health': 30,
  'vitality': 30,
  'structure': 60,
  'karma': 3,
  'light_rests_today': 0,
  'last_rest_type': '',
  'last_rest_timestamp': '',
  traits: [],
  features: [],
  disadvantages: [],
  hindrances: [],
  augmentations: [],
  awakened: [],
  invocations: [],
  special_abilities: [],
  attacks: [],
  armor: [],
  gear: [],
  weapons: [],
  weaponry: [],
  armoring: [],
  mecha: [],
  companions: [],
  architecture: [],
  other: [],
  specializations: [],
  notes: [{ text: '' }],
  folio_phase: 'development',
  is_locked: false,
  is_ready_for_vtt: false,
  locked_at: null,
  player_override: false,
  override_at: null,
  active_conditions: [],
  tracked_modifications: [],
  archetypeAllocations: { skills: {}, attributes: {}, features: [] },
  speciesAllocations: { skills: {}, attributes: {}, traits: [], features: [] },
  occuAllocations: { skills: {}, traits: [], features: [] },
  originAllocations: { skills: {}, traits: [], features: [] },
  factionAllocations: { skills: {}, traits: [], features: [] }
};

export const sanitizeCharacterSkills = (charData) => {
  if (!charData || typeof charData !== 'object') return charData;
  const result = { ...charData };

  const PHANTOM_KEYS = [
    'skill-knowledge-rank', 'skill-knowledge-name', 'skill-knowledge-base', 'skill-knowledge-mod', 'skill-knowledge-group', 'skill-knowledge-subcategory',
    'skill-knowledges-rank', 'skill-knowledges-name', 'skill-knowledges-base', 'skill-knowledges-mod', 'skill-knowledges-group', 'skill-knowledges-subcategory',
    'skill-vocation-rank', 'skill-vocation-name', 'skill-vocation-base', 'skill-vocation-mod', 'skill-vocation-group', 'skill-vocation-subcategory',
    'skill-vocations-rank', 'skill-vocations-name', 'skill-vocations-base', 'skill-vocations-mod', 'skill-vocations-group', 'skill-vocations-subcategory',
    'skill-discipline-rank', 'skill-discipline-name', 'skill-discipline-base', 'skill-discipline-mod', 'skill-discipline-group', 'skill-discipline-subcategory',
    'skill-disciplines-rank', 'skill-disciplines-name', 'skill-disciplines-base', 'skill-disciplines-mod', 'skill-disciplines-group', 'skill-disciplines-subcategory',
    'skill-metafocus-rank', 'skill-metafocus-name', 'skill-metafocus-base', 'skill-metafocus-mod', 'skill-metafocus-group', 'skill-metafocus-subcategory',
    'skill-mind-rank', 'skill-mind-name', 'skill-mind-base', 'skill-mind-mod', 'skill-mind-group', 'skill-mind-subcategory',
    'skill-energy-rank', 'skill-energy-name', 'skill-energy-base', 'skill-energy-mod', 'skill-energy-group', 'skill-energy-subcategory',
    'skill-entropy-rank', 'skill-entropy-name', 'skill-entropy-base', 'skill-entropy-mod', 'skill-entropy-group', 'skill-entropy-subcategory',
    'skill-matter-rank', 'skill-matter-name', 'skill-matter-base', 'skill-matter-mod', 'skill-matter-group', 'skill-matter-subcategory',
    'skill-dimension-rank', 'skill-dimension-name', 'skill-dimension-base', 'skill-dimension-mod', 'skill-dimension-group', 'skill-dimension-subcategory',
    'skill-illusion-rank', 'skill-illusion-name', 'skill-illusion-base', 'skill-illusion-mod', 'skill-illusion-group', 'skill-illusion-subcategory',
  ];

  PHANTOM_KEYS.forEach(k => {
    delete result[k];
  });

  Object.keys(result).forEach(key => {
    if (key.startsWith('skill-') && key.endsWith('-rank')) {
      const rawId = key.replace('skill-', '').replace('-rank', '');
      if (rawId.startsWith('knowledge-') || rawId.startsWith('vocation-')) {
        const innerName = rawId.replace(/^(knowledge|vocation)-/, '');
        const canon = ALL_CANONICAL_SKILLS.find(s => {
          const n = (s.name || '').toLowerCase();
          const clean = n.replace(/[^a-z0-9]/g, '');
          const idClean = (s.id || '').replace(/^[a-z]+-/, '').replace(/[^a-z0-9]/g, '');
          const innerClean = innerName.replace(/[^a-z0-9]/g, '');
          return clean === innerClean || idClean === innerClean;
        });

        if (canon) {
          const rankVal = parseInt(result[key], 10) || 0;
          if (rankVal > 0 && !result[`skill-${canon.id}-rank`]) {
            result[`skill-${canon.id}-rank`] = rankVal;
          }
          delete result[key];
          delete result[`skill-${rawId}-name`];
          delete result[`skill-${rawId}-base`];
          delete result[`skill-${rawId}-mod`];
          delete result[`skill-${rawId}-group`];
          delete result[`skill-${rawId}-subcategory`];
        }
      }
    }
  });

  return result;
};

export const FolioIdentityContext = createContext(null);

export const useFolioIdentity = () => {
  const ctx = useContext(FolioIdentityContext);
  if (!ctx) {
    console.warn('[useFolioIdentity] Called outside FolioIdentitySliceProvider.');
    return {};
  }
  return ctx;
};

export const FolioIdentitySliceProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(auth?.currentUser || null);
  const [activeTab, setActiveTab] = useState('identity');
  const isCharacterSelected = Boolean(activeTab && activeTab !== 'catalog');
  const setIsCharacterSelected = useCallback((selected) => {
    if (!selected) {
      setActiveTab('catalog');
    } else if (activeTab === 'catalog') {
      setActiveTab('identity');
    }
  }, [activeTab]);
  const [cloudSaveStatus, setCloudSaveStatus] = useState('idle');
  const [lastSavedTime, setLastSavedTime] = useState(null);

  const dbContext = useDBM() || {};
  const dbData = dbContext.dbData || {};

  const [characterData, setCharacterData] = useState(() => {
    try {
      const tombstones = getFolioTombstones();
      const saved = localStorage.getItem('personaFolioData') || sessionStorage.getItem('personaFolioData') || localStorage.getItem('tangent_folio_character');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && !isFolioPersonaDeleted(parsed['character-doc-id'], tombstones) && !isPersonaEmptyTemplate(parsed)) {
          return sanitizeSubAttributes(sanitizeCharacterSkills(parsed));
        }
      }
      const savedRoster = localStorage.getItem('personaRoster') || localStorage.getItem('tangent_folio_roster');
      if (savedRoster) {
        const parsedRoster = JSON.parse(savedRoster);
        if (Array.isArray(parsedRoster)) {
          const firstValid = parsedRoster.find(c => !isFolioPersonaDeleted(c['character-doc-id'], tombstones) && !isPersonaEmptyTemplate(c));
          if (firstValid) {
            return sanitizeSubAttributes(sanitizeCharacterSkills(firstValid));
          }
        }
      }
    } catch (e) {
      console.warn('Error reading saved character, using default:', e);
    }
    return sanitizeSubAttributes({ ...DEFAULT_CHARACTER });
  });

  const [personaRoster, setPersonaRoster] = useState(() => {
    try {
      const tombstones = getFolioTombstones();
      const savedRoster = localStorage.getItem('personaRoster') || localStorage.getItem('tangent_folio_roster');
      if (savedRoster) {
        const parsed = JSON.parse(savedRoster);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter(c => !isFolioPersonaDeleted(c['character-doc-id'], tombstones) && !isPersonaEmptyTemplate(c))
            .map(c => sanitizeSubAttributes(sanitizeCharacterSkills(c)));
        }
      }
    } catch (e) {
      console.warn('Error reading saved roster:', e);
    }
    return [];
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setCurrentUser(u));
    return () => unsub();
  }, []);

  const triggerSave = useCallback((overrideData = null) => {
    // Guard against DOM / React Events (e.g. onBlur={triggerSave}) being passed as overrideData
    const isEvent = Boolean(
      overrideData && (
        typeof overrideData.preventDefault === 'function' ||
        typeof overrideData.stopPropagation === 'function' ||
        overrideData.nativeEvent !== undefined ||
        overrideData.target !== undefined ||
        overrideData._reactName !== undefined
      )
    );
    const target = (!isEvent && overrideData && typeof overrideData === 'object') ? overrideData : characterData;
    if (!target || typeof target !== 'object' || isEvent) return;

    try {
      StorageService.setItem('personaFolioData', target);
      localStorage.setItem('personaFolioData', JSON.stringify(target));
      localStorage.setItem('tangent_folio_character', JSON.stringify(target));
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.warn('[FolioIdentity] Local save failed:', e);
    }
  }, [characterData]);

  const updateField = useCallback((field, value) => {
    setCharacterData(prev => {
      // 1. If updating identity selection
      if (['char-species', 'char-archetype', 'char-occu', 'char-secondary-occu', 'char-origin', 'char-secondary-origin', 'char-faction'].includes(field)) {
        const transitioned = applyIdentityFieldTransition(prev, field, value, dbData);
        triggerSave(transitioned);
        return transitioned;
      }

      // 2. If updating skill rank, clamp to 20
      if (typeof field === 'string' && field.startsWith('skill-') && field.endsWith('-rank')) {
        const clampedVal = Math.min(20, Math.max(0, parseInt(value, 10) || 0));
        const updated = { ...prev, [field]: clampedVal };
        triggerSave(updated);
        return updated;
      }

      // 3. Primary attribute auto-shift to sub-attributes
      const PRIMARY_TO_SUB = {
        'attr-strength': 'attr-might',
        'attr-agility': 'attr-reflex',
        'attr-stamina': 'attr-fortitude',
        'attr-intellect': 'attr-logic',
        'attr-wisdom': 'attr-will',
        'attr-charisma': 'attr-etiquette'
      };

      if (PRIMARY_TO_SUB[field]) {
        const subKey = PRIMARY_TO_SUB[field];
        const newPrimaryVal = parseInt(value, 10) || 0;
        const oldPrimaryVal = parseInt(prev[field] || 0, 10);
        const oldBase = (oldPrimaryVal * 2) + 2;
        const newBase = (newPrimaryVal * 2) + 2;
        const rawSub = prev[subKey] !== undefined && prev[subKey] !== null && prev[subKey] !== '' ? parseInt(prev[subKey], 10) : null;
        const hasExplicitSub = rawSub !== null && !isNaN(rawSub) && rawSub > 0;
        const currentSubVal = hasExplicitSub ? rawSub : oldBase;
        const subDelta = currentSubVal - oldBase;
        const newSubVal = newBase + subDelta;

        const subUpdates = { [subKey]: newSubVal };
        if (subKey === 'attr-logic') subUpdates['attr-reason'] = newSubVal;
        if (subKey === 'attr-will') subUpdates['attr-willpower'] = newSubVal;

        const updated = {
          ...prev,
          [field]: newPrimaryVal,
          ...subUpdates
        };
        const sanitized = sanitizeSubAttributes(updated);
        triggerSave(sanitized);
        return sanitized;
      }

      const updated = { ...prev, [field]: value };
      const sanitized = sanitizeSubAttributes(updated);
      triggerSave(sanitized);
      return sanitized;
    });
  }, [dbData, triggerSave]);

  const activeCharacter = useMemo(() => ({
    name: characterData['char-name'] || 'Operative',
    archetype: characterData['char-archetype'] || 'Operative',
    species: characterData['char-species'] || 'Alterian',
    techLevel: characterData['tech-level'] || 3,
    magicLevel: characterData['magic-level'] || 1,
    character_doc_id: characterData['character-doc-id'] || characterData.id || ''
  }), [characterData]);

  // Roster methods
  const saveCurrentToRoster = useCallback(async (charToSave = null) => {
    const target = charToSave || characterData;
    const docId = target['character-doc-id'] || `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user = auth.currentUser;
    const rawData = {
      ...target,
      'character-doc-id': docId,
      ownerUid: user ? user.uid : 'local',
      updatedAt: new Date().toISOString()
    };
    const finalized = attachCreatorTag(rawData, typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '', user);

    StorageService.setItem('personaFolioData', finalized);
    try {
      localStorage.setItem('personaFolioData', JSON.stringify(finalized));
      localStorage.setItem('tangent_folio_character', JSON.stringify(finalized));
    } catch (e) {}

    setPersonaRoster(prev => {
      const idx = prev.findIndex(p => (p['character-doc-id'] === docId || (p.id && p.id === docId)));
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = finalized;
      } else {
        next = [...prev, finalized];
      }
      StorageService.setItem('personaRoster', next);
      try {
        localStorage.setItem('personaRoster', JSON.stringify(next));
        localStorage.setItem('tangent_folio_roster', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (user?.uid) {
      setCloudSaveStatus('saving');
      try {
        const ref = doc(db, 'users', user.uid, 'personas', docId);
        await setDoc(ref, finalized, { merge: true });
        setCloudSaveStatus('saved');
        setLastSavedTime(new Date());
      } catch (err) {
        setCloudSaveStatus('error');
      }
    } else {
      setCloudSaveStatus('offline');
      setLastSavedTime(new Date());
    }

    showToast({ type: 'success', title: 'Persona Saved', message: `Saved "${finalized['char-name'] || 'Operative'}" to Roster.` });
    return finalized;
  }, [characterData]);

  const switchRosterCharacter = useCallback((docId) => {
    const found = personaRoster.find(p => p['character-doc-id'] === docId || p.id === docId);
    if (!found) return;
    const sanitized = sanitizeSubAttributes(sanitizeCharacterSkills(found));
    setCharacterData(sanitized);
    StorageService.setItem('personaFolioData', sanitized);
    try {
      localStorage.setItem('personaFolioData', JSON.stringify(sanitized));
      localStorage.setItem('tangent_folio_character', JSON.stringify(sanitized));
    } catch (e) {}
    setActiveTab(prev => (prev === 'catalog' ? 'identity' : prev));
    AudioService.playTerminalBeep(1200, 0.02);
  }, [personaRoster]);

  const deleteRosterCharacter = useCallback((docId) => {
    setPersonaRoster(prev => {
      const next = prev.filter(p => p['character-doc-id'] !== docId && p.id !== docId);
      StorageService.setItem('personaRoster', next);
      try {
        localStorage.setItem('personaRoster', JSON.stringify(next));
        localStorage.setItem('tangent_folio_roster', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    const user = auth.currentUser;
    if (user?.uid) {
      deleteDoc(doc(db, 'users', user.uid, 'personas', docId)).catch(() => {});
    }
    addFolioTombstone(docId);
    showToast({ type: 'info', title: 'Persona Removed', message: 'Persona deleted from roster.' });
  }, []);

  const duplicateRosterCharacter = useCallback((docId) => {
    const found = personaRoster.find(p => p['character-doc-id'] === docId || p.id === docId);
    if (!found) return;
    const newId = `char_${Date.now()}`;
    const clone = {
      ...found,
      'character-doc-id': newId,
      'char-name': `${found['char-name'] || 'Operative'} (Copy)`,
      updatedAt: new Date().toISOString()
    };
    setPersonaRoster(prev => {
      const next = [...prev, clone];
      StorageService.setItem('personaRoster', next);
      try {
        localStorage.setItem('personaRoster', JSON.stringify(next));
        localStorage.setItem('tangent_folio_roster', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    showToast({ type: 'success', title: 'Persona Duplicated', message: `Cloned "${clone['char-name']}".` });
  }, [personaRoster]);

  const togglePersonaNetworkEngaged = useCallback(async (docId, forceValue) => {
    const user = auth.currentUser;
    const currentDocId = characterData['character-doc-id'] || characterData.id;

    let targetIsEngaged;
    setPersonaRoster(prev => {
      const target = prev.find(p => (p['character-doc-id'] === docId || p.id === docId));
      const currentEngaged = Boolean(target?.networkEngaged ?? target?.isNetworkEngaged);
      targetIsEngaged = typeof forceValue === 'boolean' ? forceValue : !currentEngaged;

      const next = prev.map(p => {
        if (p['character-doc-id'] === docId || p.id === docId) {
          return {
            ...p,
            networkEngaged: targetIsEngaged,
            isNetworkEngaged: targetIsEngaged,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });

      StorageService.setItem('personaRoster', next);
      try {
        localStorage.setItem('personaRoster', JSON.stringify(next));
        localStorage.setItem('tangent_folio_roster', JSON.stringify(next));
      } catch (e) {}

      return next;
    });

    if (currentDocId === docId) {
      setCharacterData(prev => {
        const nextChar = {
          ...prev,
          networkEngaged: targetIsEngaged,
          isNetworkEngaged: targetIsEngaged,
          updatedAt: new Date().toISOString()
        };
        StorageService.setItem('personaFolioData', nextChar);
        try {
          localStorage.setItem('personaFolioData', JSON.stringify(nextChar));
          localStorage.setItem('tangent_folio_character', JSON.stringify(nextChar));
        } catch (e) {}
        return nextChar;
      });
    }

    if (user?.uid) {
      try {
        const ref = doc(db, 'users', user.uid, 'personas', docId);
        await setDoc(ref, {
          networkEngaged: targetIsEngaged,
          isNetworkEngaged: targetIsEngaged,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Failed to update persona network flag in firestore:', err);
      }
    }

    AudioService.playTerminalBeep(targetIsEngaged ? 1400 : 900, 0.03);
    showToast({
      type: targetIsEngaged ? 'success' : 'info',
      title: targetIsEngaged ? 'Network Engaged' : 'Network Disengaged',
      message: targetIsEngaged 
        ? 'Persona flagged to engage and broadcast on the Terran Data Network.' 
        : 'Persona disengaged from network broadcast.'
    });

    window.dispatchEvent(new CustomEvent('persona-network-status-changed', {
      detail: { docId, networkEngaged: targetIsEngaged }
    }));

    return targetIsEngaged;
  }, [characterData]);

  const handleNewCharacter = useCallback(() => {
    const blank = sanitizeSubAttributes({
      ...DEFAULT_CHARACTER,
      'character-doc-id': `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    });
    setCharacterData(blank);
    StorageService.setItem('personaFolioData', blank);
    try {
      localStorage.setItem('personaFolioData', JSON.stringify(blank));
      localStorage.setItem('tangent_folio_character', JSON.stringify(blank));
    } catch (e) {}
    setActiveTab('identity');
    AudioService.playTerminalBeep(1000, 0.03);
  }, []);

  const handleSaveLocal = useCallback(() => {
    saveCurrentToRoster();
  }, [saveCurrentToRoster]);

  const handleLoadLocal = useCallback((importedJson) => {
    try {
      let rawData = typeof importedJson === 'string' ? JSON.parse(importedJson) : importedJson;
      if (isStoryElementData(rawData)) {
        rawData = convertPersonaElementToFolio(rawData);
      }
      const sanitized = sanitizeSubAttributes(sanitizeCharacterSkills(rawData));
      setCharacterData(sanitized);
      StorageService.setItem('personaFolioData', sanitized);
      try {
        localStorage.setItem('personaFolioData', JSON.stringify(sanitized));
        localStorage.setItem('tangent_folio_character', JSON.stringify(sanitized));
      } catch (e) {}
      setActiveTab('identity');
      showToast({ type: 'success', title: 'Import Successful', message: 'Persona loaded from JSON file.' });
    } catch (e) {
      showToast({ type: 'error', title: 'Import Failed', message: e.message });
    }
  }, []);

  const handleLoadCloud = useCallback(async () => {
    const user = auth.currentUser;
    if (!user?.uid) return;
    try {
      setCloudSaveStatus('loading');
      const snap = await getDocs(collection(db, 'users', user.uid, 'personas'));
      const docs = snap.docs.map(d => ({ ...d.data(), 'character-doc-id': d.id }));
      if (docs.length > 0) {
        setPersonaRoster(docs);
        StorageService.setItem('personaRoster', docs);
        try {
          localStorage.setItem('personaRoster', JSON.stringify(docs));
          localStorage.setItem('tangent_folio_roster', JSON.stringify(docs));
        } catch (e) {}
      }
      setCloudSaveStatus('saved');
    } catch (e) {
      setCloudSaveStatus('error');
    }
  }, []);

  const handleExportAsStoryElement = useCallback(() => {
    return exportStoryElementJSON(characterData);
  }, [characterData]);

  const updateRosterCharacterNote = useCallback((docId, note) => {
    setPersonaRoster(prev => {
      const next = prev.map(p => (p['character-doc-id'] === docId || p.id === docId) ? { ...p, rosterNote: note } : p);
      StorageService.setItem('personaRoster', next);
      try {
        localStorage.setItem('personaRoster', JSON.stringify(next));
        localStorage.setItem('tangent_folio_roster', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // Identity Transitions
  const applySpeciesAdjustments = useCallback((spName) => {
    setCharacterData(prev => applySpeciesTransition(prev, spName));
  }, []);

  const applyArchetypeChassis = useCallback((archName) => {
    setCharacterData(prev => applyArchetypeTransition(prev, archName));
  }, []);

  const applyOccupationAdjustments = useCallback((occuName, isSecondary = false) => {
    setCharacterData(prev => applyOccupationTransition(prev, occuName, isSecondary));
  }, []);

  const applyOriginAdjustments = useCallback((origName, isSecondary = false) => {
    setCharacterData(prev => applyOriginTransition(prev, origName, isSecondary));
  }, []);

  const applyFactionAdjustments = useCallback((facName) => {
    setCharacterData(prev => applyFactionTransition(prev, facName));
  }, []);

  const applyIdentitySelection = useCallback((field, val) => {
    setCharacterData(prev => applyIdentityFieldTransition(prev, field, val));
  }, []);

  const applyGuidedCharacter = useCallback((draft) => {
    if (!draft) return;
    const sanitized = sanitizeSubAttributes(sanitizeCharacterSkills(draft));
    setCharacterData(sanitized);
    triggerSave(sanitized);
  }, [triggerSave]);

  // VTT Lifecycle & Lock Controls
  const isLocked = Boolean(characterData.is_locked);
  const folioPhase = characterData.folio_phase || 'development';
  const isReadyForVTT = Boolean(characterData.is_ready_for_vtt);
  const allowPlayerOverride = Boolean(characterData.player_override);
  const isPlayerOverride = allowPlayerOverride;
  const isFolioLockedOut = isLocked && !allowPlayerOverride;

  const lockPersona = useCallback(() => {
    updateField('is_locked', true);
    updateField('locked_at', new Date().toISOString());
    updateField('folio_phase', 'tactical');
    showToast({ type: 'info', title: 'Persona Sealed', message: 'Persona is now locked for VTT tactical play.' });
  }, [updateField]);

  const unlockPersona = useCallback(() => {
    updateField('is_locked', false);
    updateField('folio_phase', 'development');
    showToast({ type: 'info', title: 'Persona Unlocked', message: 'Persona is in open development mode.' });
  }, [updateField]);

  const setPersonaAllowPlayerOverride = useCallback((allow) => {
    updateField('player_override', Boolean(allow));
  }, [updateField]);

  const clonePersonaVariant = useCallback((label = 'Variant') => {
    duplicateRosterCharacter(characterData['character-doc-id']);
  }, [duplicateRosterCharacter, characterData]);

  const recordTrackedModification = useCallback((mod) => {
    const list = characterData.tracked_modifications || [];
    const entry = { ...mod, id: `mod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString() };
    updateField('tracked_modifications', [entry, ...list]);
  }, [characterData, updateField]);

  const reviewTrackedModification = useCallback((modId, status) => {
    const list = (characterData.tracked_modifications || []).map(m => m.id === modId ? { ...m, reviewStatus: status } : m);
    updateField('tracked_modifications', list);
  }, [characterData, updateField]);

  const revertTrackedModification = useCallback((modId) => {
    const target = (characterData.tracked_modifications || []).find(m => m.id === modId);
    if (target && target.field && target.previousValue !== undefined) {
      updateField(target.field, target.previousValue);
    }
    const filtered = (characterData.tracked_modifications || []).filter(m => m.id !== modId);
    updateField('tracked_modifications', filtered);
  }, [characterData, updateField]);

  const applyVTTStatusConditions = useCallback((conditions) => {
    updateField('active_conditions', Array.isArray(conditions) ? conditions : []);
  }, [updateField]);

  const value = {
    characterData,
    setCharacterData,
    activeCharacter,
    activeHeroName: activeCharacter.name,
    updateField,
    activeTab,
    setActiveTab,
    isCharacterSelected,
    setIsCharacterSelected,
    personaRoster,
    roster: personaRoster,
    saveCurrentToRoster,
    switchRosterCharacter,
    deleteRosterCharacter,
    duplicateRosterCharacter,
    togglePersonaNetworkEngaged,
    handleNewCharacter,
    handleSaveLocal,
    handleLoadLocal,
    handleLoadCloud,
    handleExportAsStoryElement,
    triggerSave,
    cloudSaveStatus,
    lastSavedTime,
    updateRosterCharacterNote,
    applySpeciesAdjustments,
    applyArchetypeChassis,
    applyOccupationAdjustments,
    applyOriginAdjustments,
    applyFactionAdjustments,
    applyIdentitySelection,
    applyGuidedCharacter,
    isLocked,
    folioPhase,
    isReadyForVTT,
    allowPlayerOverride,
    isPlayerOverride,
    isFolioLockedOut,
    lockPersona,
    unlockPersona,
    setPersonaAllowPlayerOverride,
    clonePersonaVariant,
    recordTrackedModification,
    reviewTrackedModification,
    revertTrackedModification,
    applyVTTStatusConditions,
    trackedModifications: characterData.tracked_modifications || []
  };

  return (
    <FolioIdentityContext.Provider value={value}>
      {children}
    </FolioIdentityContext.Provider>
  );
};
