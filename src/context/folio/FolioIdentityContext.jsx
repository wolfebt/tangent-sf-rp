import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { db, auth, isFirestoreQuotaExhausted, handleFirestoreQuotaError } from '../../firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, deleteDoc, arrayUnion } from 'firebase/firestore';
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
import { getEnrichedTraitData } from '../../data/speciesTraitsData';
import {
  formatSpeciesTrait,
  isGeneratedTraitId,
  isCorruptedTraitDescription,
  cleanTraitDescriptionText,
  extractInlineMarkdownMechanic,
  normalizeTraitLookupKey,
  cleanTraitName
} from '../../utils/speciesDisplayUtils';
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
  'base-tech-level': 3,
  'base-meta-level': 3,
  'tech-level': 3,
  'magic-level': 3,
  'meta-level': 3,
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
  archetypeAllocations: { skills: {}, attributes: {}, traits: [], features: [] },
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

  const healTraitOrFeatureEntry = (item, isTraitArray = true) => {
    if (!item || typeof item !== 'object') return item;
    const rawName = String(item.name || item.title || '').trim();
    const rawDesc = String(item.description || item.desc || '').trim();
    const isTraitLike = isTraitArray ||
      String(item.category || item.trait_type || '').toLowerCase().includes('trait') ||
      /^(?:trait|feature)[-_]/i.test(rawName);
    if (!isTraitLike) return item;

    const needsNameHeal = !rawName || /^(?:trait|feature)[-_]/i.test(rawName) || isGeneratedTraitId(rawName);
    const needsDescHeal = isCorruptedTraitDescription(rawDesc) || /\s+#+\s*$/.test(rawDesc) || /\*[^*]+\*\s*#*$/.test(rawDesc);
    const enriched = getEnrichedTraitData(item) || {};
    const formatted = formatSpeciesTrait(item);
    const bestCanonicalName = (enriched.name && !/^(?:trait|feature)[-_]/i.test(enriched.name) && !isGeneratedTraitId(enriched.name))
      ? enriched.name
      : ((formatted?.name && formatted.name !== 'Species Adaptation') ? formatted.name : '');
    const needsPunctuationSync = Boolean(bestCanonicalName && rawName !== bestCanonicalName && normalizeTraitLookupKey(rawName) === normalizeTraitLookupKey(bestCanonicalName));

    if (!needsNameHeal && !needsDescHeal && !needsPunctuationSync) return item;

    const finalName = (needsNameHeal || needsPunctuationSync)
      ? (bestCanonicalName || cleanTraitName(rawName) || rawName)
      : rawName;
    const inlineMech = extractInlineMarkdownMechanic(rawDesc);
    const finalMech = item.mechanic || item.mechanics || enriched.mechanic || formatted?.mechanic || inlineMech || '';
    const finalDesc = cleanTraitDescriptionText(
      (!isCorruptedTraitDescription(rawDesc) ? rawDesc : '') || enriched.description || formatted?.description || '',
      finalMech
    );
    const finalId = (!isGeneratedTraitId(item.id) && item.id) || (!isGeneratedTraitId(enriched.id) && enriched.id) || (!isGeneratedTraitId(formatted?.id) && formatted?.id) || item.id;

    return {
      ...item,
      id: finalId,
      name: finalName,
      description: finalDesc,
      ...(item.desc !== undefined ? { desc: finalDesc } : {}),
      ...(finalMech ? { mechanic: finalMech, mechanics: finalMech } : {})
    };
  };

  if (Array.isArray(result.traits)) {
    result.traits = result.traits.map(t => healTraitOrFeatureEntry(t, true));
  }
  if (Array.isArray(result.features)) {
    result.features = result.features.map(f => healTraitOrFeatureEntry(f, false));
  }

  return result;
};

export const DEFAULT_IDENTITY_FALLBACK = {
  characterData: DEFAULT_CHARACTER,
  setCharacterData: () => {},
  activeCharacter: {
    name: 'Operative',
    archetype: 'Operative',
    species: 'Alterian',
    techLevel: 3,
    magicLevel: 3
  },
  activePersona: DEFAULT_CHARACTER,
  activeHeroName: 'Operative',
  updateField: () => {},
  activeTab: 'identity',
  setActiveTab: () => {},
  viewMode: 'builder',
  setViewMode: () => {},
  isCharacterSelected: false,
  setIsCharacterSelected: () => {},
  personaRoster: [],
  roster: [],
  saveCurrentToRoster: () => {},
  switchRosterCharacter: () => {},
  deleteRosterCharacter: () => {},
  duplicateRosterCharacter: () => {},
  togglePersonaNetworkEngaged: () => {},
  togglePersonaVttLock: () => {},
  handleNewCharacter: () => {},
  handleSaveLocal: () => {},
  handleLoadLocal: () => {},
  handleLoadCloud: () => {},
  handleExportAsStoryElement: () => {},
  triggerSave: () => {},
  cloudSaveStatus: 'idle',
  lastSavedTime: null,
  updateRosterCharacterNote: () => {},
  applySpeciesAdjustments: () => {},
  applyArchetypeChassis: () => {},
  applyOccupationAdjustments: () => {},
  applyOriginAdjustments: () => {},
  applyFactionAdjustments: () => {},
  applyIdentitySelection: () => {},
  applyGuidedCharacter: async () => null,
  isLocked: false,
  folioPhase: 'creation',
  isReadyForVTT: false,
  allowPlayerOverride: false,
  isPlayerOverride: false,
  isFolioLockedOut: false,
  lockPersona: () => {},
  unlockPersona: () => {},
  setPersonaAllowPlayerOverride: () => {},
  clonePersonaVariant: () => {},
  recordTrackedModification: () => {},
  reviewTrackedModification: () => {},
  revertTrackedModification: () => {},
  applyVTTStatusConditions: () => {},
  trackedModifications: []
};

export const FolioIdentityContext = globalThis.__TANGENT_FOLIO_IDENTITY_CONTEXT__ || (globalThis.__TANGENT_FOLIO_IDENTITY_CONTEXT__ = createContext(DEFAULT_IDENTITY_FALLBACK));

export const useFolioIdentity = () => {
  const ctx = useContext(FolioIdentityContext);
  if (!ctx) {
    console.warn('[useFolioIdentity] Called outside FolioIdentitySliceProvider. Returning fallback state.');
    return DEFAULT_IDENTITY_FALLBACK;
  }
  return ctx;
};

export const FolioIdentitySliceProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(auth?.currentUser || null);
  const [activeTab, setActiveTab] = useState('identity');
  const [viewMode, setViewMode] = useState('builder'); // 'builder' | 'play' | 'preview'
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
        if (parsed && !isFolioPersonaDeleted(parsed, tombstones) && !isPersonaEmptyTemplate(parsed)) {
          if (!parsed['character-doc-id']) {
            parsed['character-doc-id'] = parsed.id || `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          }
          return sanitizeSubAttributes(sanitizeCharacterSkills(parsed));
        }
      }
      const savedRoster = localStorage.getItem('personaRoster') || localStorage.getItem('tangent_folio_roster');
      if (savedRoster) {
        const parsedRoster = JSON.parse(savedRoster);
        if (Array.isArray(parsedRoster)) {
          const firstValid = parsedRoster.find(c => !isFolioPersonaDeleted(c, tombstones) && !isPersonaEmptyTemplate(c));
          if (firstValid) {
            return sanitizeSubAttributes(sanitizeCharacterSkills(firstValid));
          }
        }
      }
    } catch (e) {
      console.warn('Error reading saved character, using default:', e);
    }
    const defId = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return sanitizeSubAttributes({ 
      ...DEFAULT_CHARACTER,
      'character-doc-id': defId,
      id: defId
    });
  });

  const [personaRoster, setPersonaRoster] = useState(() => {
    try {
      const tombstones = getFolioTombstones();
      const savedRoster = localStorage.getItem('personaRoster') || localStorage.getItem('tangent_folio_roster');
      if (savedRoster) {
        const parsed = JSON.parse(savedRoster);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed
            .filter(c => !isFolioPersonaDeleted(c, tombstones) && !isPersonaEmptyTemplate(c))
            .map(c => sanitizeSubAttributes(sanitizeCharacterSkills(c)));
          if (filtered.length !== parsed.length) {
            localStorage.setItem('personaRoster', JSON.stringify(filtered));
            localStorage.setItem('tangent_folio_roster', JSON.stringify(filtered));
            StorageService.setItem('personaRoster', filtered);
          }
          return filtered;
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

  // ─────────────────────────────────────────────────────────────
  // CLOUD SYNC: Realtime Multi-Device Persona & Tombstone Engine
  // ─────────────────────────────────────────────────────────────
  const isInitialCloudSyncCompleteRef = useRef(false);
  const cloudSaveTimeoutRef = useRef(null);

  // Debounced auto-sync to Firestore for active character edits
  const saveToCloudDebounced = useCallback((targetData) => {
    const user = auth?.currentUser;
    if (!user?.uid || !targetData || isFirestoreQuotaExhausted()) return;
    const docId = targetData['character-doc-id'] || targetData.id;
    if (!docId) return;

    const tombstones = getFolioTombstones();
    if (isFolioPersonaDeleted(targetData, tombstones) || isFolioPersonaDeleted(docId, tombstones) || isPersonaEmptyTemplate(targetData)) {
      return;
    }

    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
    }

    cloudSaveTimeoutRef.current = setTimeout(async () => {
      if (isFirestoreQuotaExhausted()) {
        setCloudSaveStatus('saved');
        return;
      }
      try {
        setCloudSaveStatus('saving');
        const ref = doc(db, 'users', user.uid, 'personas', docId);
        const finalized = attachCreatorTag({
          ...targetData,
          'character-doc-id': docId,
          ownerUid: user.uid,
          _cloudSynced: true,
          updatedAt: new Date().toISOString()
        }, typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '', user);
        await setDoc(ref, finalized, { merge: true });
        setCloudSaveStatus('saved');
        setLastSavedTime(new Date());
      } catch (err) {
        if (handleFirestoreQuotaError(err)) {
          setCloudSaveStatus('saved');
          return;
        }
        setCloudSaveStatus('error');
      }
    }, 1200);
  }, []);

  // Real-time bidirectional synchronization with Firestore
  useEffect(() => {
    const user = currentUser;
    if (!user?.uid || !db || isFirestoreQuotaExhausted()) {
      isInitialCloudSyncCompleteRef.current = false;
      return;
    }

    setCloudSaveStatus('loading');

    // 1. Subscribe to User Document for Cloud Tombstones (deletions across devices)
    const userDocRef = doc(db, 'users', user.uid);
    const userUnsub = onSnapshot(userDocRef, (userSnap) => {
      if (userSnap.exists()) {
        const uData = userSnap.data();
        if (Array.isArray(uData.deletedPersonaIds) && uData.deletedPersonaIds.length > 0) {
          addFolioTombstone(uData.deletedPersonaIds);
          // Immediately purge any deleted personas from local state
          setPersonaRoster(prev => {
            const currentTombstones = getFolioTombstones();
            const clean = prev.filter(p => !isFolioPersonaDeleted(p, currentTombstones));
            if (clean.length !== prev.length) {
              StorageService.setItem('personaRoster', clean);
              try {
                localStorage.setItem('personaRoster', JSON.stringify(clean));
                localStorage.setItem('tangent_folio_roster', JSON.stringify(clean));
              } catch (e) {}
              return clean;
            }
            return prev;
          });
        }
      }
    }, (err) => {
      handleFirestoreQuotaError(err);
    });

    // 2. Real-time Subscriptions to User's Persona Dossiers
    const personasColRef = collection(db, 'users', user.uid, 'personas');
    const personasUnsub = onSnapshot(personasColRef, (snap) => {
      const tombstones = getFolioTombstones();
      const cloudDocs = snap.docs.map(d => ({
        ...d.data(),
        'character-doc-id': d.id,
        id: d.id,
        _cloudSynced: true
      }));

      // A. Identify any tombstoned documents that still linger in Firestore and delete them
      cloudDocs.forEach(c => {
        if (isFolioPersonaDeleted(c, tombstones)) {
          deleteDoc(doc(db, 'users', user.uid, 'personas', c['character-doc-id'])).catch(() => {});
        }
      });

      // B. Filter valid cloud personas
      const validCloudPersonas = cloudDocs
        .filter(c => !isFolioPersonaDeleted(c, tombstones) && !isPersonaEmptyTemplate(c))
        .map(c => sanitizeSubAttributes(sanitizeCharacterSkills(c)));

      // C. Reconcile with local storage offline drafts (personas never synced to cloud)
      let mergedRoster = [...validCloudPersonas];
      try {
        const rawLocal = localStorage.getItem('personaRoster') || localStorage.getItem('tangent_folio_roster');
        const localList = rawLocal ? JSON.parse(rawLocal) : [];
        if (Array.isArray(localList) && localList.length > 0) {
          localList.forEach(localChar => {
            const localId = localChar['character-doc-id'] || localChar.id;
            const isAlreadyInCloud = validCloudPersonas.some(c => c['character-doc-id'] === localId || c.id === localId);
            const wasEverSynced = Boolean(localChar._cloudSynced || localChar.ownerUid === user.uid);

            if (!isAlreadyInCloud && !wasEverSynced && !isFolioPersonaDeleted(localChar, tombstones) && !isPersonaEmptyTemplate(localChar)) {
              const tagged = attachCreatorTag({
                ...localChar,
                'character-doc-id': localId || `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                ownerUid: user.uid,
                _cloudSynced: true,
                updatedAt: new Date().toISOString()
              }, typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '', user);

              const uploadId = tagged['character-doc-id'];
              setDoc(doc(db, 'users', user.uid, 'personas', uploadId), tagged, { merge: true }).catch(() => {});
              mergedRoster.push(tagged);
            }
          });
        }
      } catch (e) {
        console.warn('[FolioIdentity] Error reconciling local drafts:', e);
      }

      // D. Update Persona Roster State and persist to local cache
      setPersonaRoster(mergedRoster);
      StorageService.setItem('personaRoster', mergedRoster);
      try {
        localStorage.setItem('personaRoster', JSON.stringify(mergedRoster));
        localStorage.setItem('tangent_folio_roster', JSON.stringify(mergedRoster));
      } catch (e) {}

      // E. Reconcile Active Character
      setCharacterData(cur => {
        const curDocId = cur ? (cur['character-doc-id'] || cur.id) : null;
        const currentTombstones = getFolioTombstones();
        const isCurDeleted = !cur || isFolioPersonaDeleted(cur, currentTombstones) || (curDocId && isFolioPersonaDeleted(curDocId, currentTombstones));
        const isCurEmpty = isPersonaEmptyTemplate(cur);

        // If currently active character was deleted or is a blank uncustomized template
        if (isCurDeleted || (isCurEmpty && mergedRoster.length > 0)) {
          const defaultId = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const replacement = mergedRoster.length > 0
            ? mergedRoster[0]
            : sanitizeSubAttributes({
                ...DEFAULT_CHARACTER,
                'character-doc-id': defaultId,
                id: defaultId
              });

          StorageService.setItem('personaFolioData', replacement);
          try {
            localStorage.setItem('personaFolioData', JSON.stringify(replacement));
            localStorage.setItem('tangent_folio_character', JSON.stringify(replacement));
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.removeItem('personaFolioData');
            }
          } catch (e) {}
          return replacement;
        }

        // If the active character is in the cloud roster, update with latest cloud state
        const matching = curDocId ? mergedRoster.find(p => p['character-doc-id'] === curDocId || p.id === curDocId) : null;
        if (matching) {
          const merged = sanitizeSubAttributes(sanitizeCharacterSkills({ ...cur, ...matching }));
          StorageService.setItem('personaFolioData', merged);
          try {
            localStorage.setItem('personaFolioData', JSON.stringify(merged));
            localStorage.setItem('tangent_folio_character', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        }

        // If current character has ownerUid === user.uid but is NOT in mergedRoster,
        // and initial cloud sync is complete, it means it was deleted on another device!
        if (cur?.ownerUid === user.uid && !mergedRoster.some(p => p['character-doc-id'] === curDocId || p.id === curDocId)) {
          const defaultId = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const replacement = mergedRoster.length > 0
            ? mergedRoster[0]
            : sanitizeSubAttributes({
                ...DEFAULT_CHARACTER,
                'character-doc-id': defaultId,
                id: defaultId
              });
          StorageService.setItem('personaFolioData', replacement);
          try {
            localStorage.setItem('personaFolioData', JSON.stringify(replacement));
            localStorage.setItem('tangent_folio_character', JSON.stringify(replacement));
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.removeItem('personaFolioData');
            }
          } catch (e) {}
          return replacement;
        }

        return cur;
      });

      isInitialCloudSyncCompleteRef.current = true;
      setCloudSaveStatus('saved');
    }, (err) => {
      if (handleFirestoreQuotaError(err)) {
        setCloudSaveStatus('saved');
        return;
      }
      setCloudSaveStatus('error');
    });

    return () => {
      userUnsub();
      personasUnsub();
      if (cloudSaveTimeoutRef.current) {
        clearTimeout(cloudSaveTimeoutRef.current);
      }
    };
  }, [currentUser]);

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

    const docId = target['character-doc-id'] || target.id;
    if (!docId) return;

    // CRITICAL: Block save if target persona is tombstoned / deleted or an empty template
    const tombstones = getFolioTombstones();
    if (isFolioPersonaDeleted(target, tombstones) || isFolioPersonaDeleted(docId, tombstones)) {
      return;
    }

    try {
      StorageService.setItem('personaFolioData', target);
      localStorage.setItem('personaFolioData', JSON.stringify(target));
      localStorage.setItem('tangent_folio_character', JSON.stringify(target));
      setLastSavedTime(new Date());
    } catch (e) {
      console.warn('[FolioIdentity] Local save failed:', e);
    }

    // Maintain & synchronize persona identity pillars and allocations in personaRoster
    setPersonaRoster(prev => {
      const cleanPrev = prev.filter(p => !isFolioPersonaDeleted(p, tombstones));
      const idx = cleanPrev.findIndex(p => (p['character-doc-id'] === docId || (p.id && p.id === docId)));
      let next;
      if (idx >= 0) {
        next = [...cleanPrev];
        next[idx] = { ...cleanPrev[idx], ...target };
      } else {
        const hasContent = Boolean(target['char-name'] || target['char-species'] || target['char-archetype'] || target['char-occu']);
        if (!hasContent || isPersonaEmptyTemplate(target)) return cleanPrev;
        next = [...cleanPrev, target];
      }
      StorageService.setItem('personaRoster', next);
      try {
        localStorage.setItem('personaRoster', JSON.stringify(next));
        localStorage.setItem('tangent_folio_roster', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (!isPersonaEmptyTemplate(target)) {
      saveToCloudDebounced(target);
    }
  }, [characterData, saveToCloudDebounced]);

  // Auto-heal legacy baked species modifiers, residual archetype attributes, and corrupted trait slugs/descriptions on live state / HMR reload
  useEffect(() => {
    if (!characterData) return;
    if (characterData._needsCloudHealSave) {
      const { _needsCloudHealSave, ...cleanHealed } = sanitizeCharacterSkills(characterData);
      const finalized = { ...cleanHealed, _attrHealedV3: true, _traitsHealedV1: true };
      setCharacterData(finalized);
      triggerSave(finalized);
      return;
    }
    if (!characterData._attrHealedV3 || !characterData._traitsHealedV1) {
      const traitSanitized = sanitizeCharacterSkills(characterData);
      const healed = sanitizeSubAttributes(traitSanitized);
      const traitsChanged = JSON.stringify(traitSanitized.traits) !== JSON.stringify(characterData.traits) ||
                            JSON.stringify(traitSanitized.features) !== JSON.stringify(characterData.features);
      if (healed !== traitSanitized || traitsChanged || !characterData._traitsHealedV1) {
        const { _needsCloudHealSave, ...cleanHealed } = healed;
        const finalized = { ...cleanHealed, _attrHealedV3: true, _traitsHealedV1: true };
        setCharacterData(finalized);
        if (_needsCloudHealSave || traitsChanged) {
          triggerSave(finalized);
        }
      }
    }
  }, [characterData, triggerSave]);

  const updateField = useCallback((field, value) => {
    setCharacterData(prev => {
      // 1. If updating identity selection
      if (['char-species', 'char-archetype', 'char-occu', 'char-secondary-occu', 'char-origin', 'char-secondary-origin', 'char-faction'].includes(field)) {
        const transitionOpts = field === 'char-archetype' && value ? { applyPreBuild: true } : {};
        const transitioned = applyIdentityFieldTransition(prev, field, value, dbData, transitionOpts);
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

      // 4. Setting Tiers (Tech Level & Meta Level / Magic Level synchronization)
      if (field === 'magic-level' || field === 'meta-level') {
        const valNum = Math.min(5, Math.max(0, parseInt(value, 10) || 0));
        const updated = { ...prev, 'magic-level': valNum, 'meta-level': valNum };
        const sanitized = sanitizeSubAttributes(updated);
        triggerSave(sanitized);
        return sanitized;
      }

      if (field === 'tech-level') {
        const valNum = Math.min(5, Math.max(0, parseInt(value, 10) || 0));
        const updated = { ...prev, 'tech-level': valNum };
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
    techLevel: characterData['tech-level'] ?? 3,
    magicLevel: characterData['magic-level'] ?? characterData['meta-level'] ?? 3,
    metaLevel: characterData['meta-level'] ?? characterData['magic-level'] ?? 3,
    character_doc_id: characterData['character-doc-id'] || characterData.id || ''
  }), [characterData]);

  // Roster methods
  const saveCurrentToRoster = useCallback(async (charToSave = null) => {
    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
    }

    const target = charToSave || characterData;
    const docId = target['character-doc-id'] || target.id || `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tombstones = getFolioTombstones();
    if (isFolioPersonaDeleted(target, tombstones) || isFolioPersonaDeleted(docId, tombstones)) {
      console.warn('[FolioIdentity] Save aborted: Persona is deleted/tombstoned:', docId);
      return null;
    }
    const user = auth.currentUser;
    const rawData = {
      ...target,
      'character-doc-id': docId,
      ownerUid: user ? user.uid : 'local',
      _cloudSynced: Boolean(user?.uid),
      updatedAt: new Date().toISOString()
    };
    const finalized = attachCreatorTag(rawData, typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '', user);

    StorageService.setItem('personaFolioData', finalized);
    try {
      localStorage.setItem('personaFolioData', JSON.stringify(finalized));
      localStorage.setItem('tangent_folio_character', JSON.stringify(finalized));
    } catch (e) {}

    setPersonaRoster(prev => {
      const cleanPrev = prev.filter(p => !isFolioPersonaDeleted(p, tombstones));
      const idx = cleanPrev.findIndex(p => (p['character-doc-id'] === docId || (p.id && p.id === docId)));
      let next;
      if (idx >= 0) {
        next = [...cleanPrev];
        next[idx] = finalized;
      } else {
        next = [...cleanPrev, finalized];
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
        console.warn('[FolioIdentity] Cloud save error:', err);
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
    const tombstones = getFolioTombstones();
    if (isFolioPersonaDeleted(docId, tombstones)) {
      console.warn('[FolioIdentity] Cannot switch to deleted persona:', docId);
      return;
    }

    if (characterData && (characterData['character-doc-id'] || characterData.id)) {
      const curDocId = characterData['character-doc-id'] || characterData.id;
      if (curDocId === docId) {
        setActiveTab(prev => (prev === 'catalog' ? 'identity' : prev));
        return;
      }
      if (!isFolioPersonaDeleted(characterData, tombstones) && !isFolioPersonaDeleted(curDocId, tombstones) && !isPersonaEmptyTemplate(characterData)) {
        setPersonaRoster(prev => {
          const cleanPrev = prev.filter(p => !isFolioPersonaDeleted(p, tombstones));
          const idx = cleanPrev.findIndex(p => (p['character-doc-id'] === curDocId || p.id === curDocId));
          let next;
          if (idx >= 0) {
            next = [...cleanPrev];
            next[idx] = { ...cleanPrev[idx], ...characterData };
          } else {
            next = [...cleanPrev, characterData];
          }
          StorageService.setItem('personaRoster', next);
          try {
            localStorage.setItem('personaRoster', JSON.stringify(next));
            localStorage.setItem('tangent_folio_roster', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      }
    }

    let found = personaRoster.find(p => (p['character-doc-id'] === docId || p.id === docId) && !isFolioPersonaDeleted(p, tombstones));
    if (!found) {
      try {
        const saved = JSON.parse(localStorage.getItem('personaRoster') || '[]');
        if (Array.isArray(saved)) {
          found = saved.find(p => (p['character-doc-id'] === docId || p.id === docId) && !isFolioPersonaDeleted(p, tombstones));
        }
      } catch (e) {}
    }
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
  }, [personaRoster, characterData]);

  const deleteRosterCharacter = useCallback(async (docIdOrChar) => {
    if (!docIdOrChar) return;
    const targetObj = typeof docIdOrChar === 'object' ? docIdOrChar : null;
    const rawId = targetObj ? (targetObj['character-doc-id'] || targetObj.id || targetObj['char-id'] || targetObj['doc-id']) : docIdOrChar.toString().trim();
    if (!rawId) return;

    // Collect all possible ID variants for this persona
    const allIds = new Set([rawId]);
    if (targetObj) {
      if (targetObj['character-doc-id']) allIds.add(targetObj['character-doc-id']);
      if (targetObj.id) allIds.add(targetObj.id);
      if (targetObj['char-id']) allIds.add(targetObj['char-id']);
      if (targetObj['doc-id']) allIds.add(targetObj['doc-id']);
      if (targetObj.character_doc_id) allIds.add(targetObj.character_doc_id);
    }

    // Also look up in current personaRoster for matching entry to collect any additional aliases
    personaRoster.forEach(p => {
      const pDocId = p['character-doc-id'];
      const pId = p.id;
      if ((pDocId && allIds.has(pDocId)) || (pId && allIds.has(pId))) {
        if (pDocId) allIds.add(pDocId);
        if (pId) allIds.add(pId);
      }
    });

    const idsList = Array.from(allIds).filter(Boolean);

    // 1. Tombstone all known IDs locally
    addFolioTombstone(idsList);
    const currentTombstones = getFolioTombstones();

    // 2. Remove from roster and persist immediately
    const nextRoster = personaRoster.filter(p => {
      const pDocId = p['character-doc-id'];
      const pId = p.id;
      return !isFolioPersonaDeleted(p, currentTombstones) && !allIds.has(pDocId) && !allIds.has(pId);
    });

    setPersonaRoster(nextRoster);
    StorageService.setItem('personaRoster', nextRoster);
    try {
      localStorage.setItem('personaRoster', JSON.stringify(nextRoster));
      localStorage.setItem('tangent_folio_roster', JSON.stringify(nextRoster));
    } catch (e) {}

    // 3. Clear active characterData if the deleted persona is currently loaded!
    setCharacterData(cur => {
      const curDocId = cur ? (cur['character-doc-id'] || cur.id) : null;
      const isCurDeleted = !cur || isFolioPersonaDeleted(cur, currentTombstones) || allIds.has(curDocId);

      if (isCurDeleted) {
        const defaultId = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const validRemaining = nextRoster.filter(c => !isFolioPersonaDeleted(c, currentTombstones) && !isPersonaEmptyTemplate(c));
        const replacement = validRemaining.length > 0
          ? sanitizeSubAttributes(sanitizeCharacterSkills(validRemaining[0]))
          : sanitizeSubAttributes({
              ...DEFAULT_CHARACTER,
              'character-doc-id': defaultId,
              id: defaultId
            });

        try {
          localStorage.setItem('personaFolioData', JSON.stringify(replacement));
          localStorage.setItem('tangent_folio_character', JSON.stringify(replacement));
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('personaFolioData');
          }
          StorageService.setItem('personaFolioData', replacement);
        } catch (e) {}

        return replacement;
      }

      return cur;
    });

    // 4. Delete from Firestore AND record tombstone in user doc
    const user = auth.currentUser;
    if (user?.uid) {
      idsList.forEach(id => {
        deleteDoc(doc(db, 'users', user.uid, 'personas', id)).catch(() => {});
        deleteDoc(doc(db, 'lft_personas', `lft_${id}`)).catch(() => {});
      });

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDocUpdate = {
          deletedPersonaIds: arrayUnion(...idsList)
        };
        if (nextRoster.length === 0) {
          userDocUpdate.personas = [];
          userDocUpdate.currentPersona = null;
        } else {
          userDocUpdate.personas = nextRoster.map(c => ({
            id: c['character-doc-id'] || c.id,
            'character-doc-id': c['character-doc-id'] || c.id,
            name: c['char-name'] || c.name || 'Persona',
            species: c['char-species'] || c.species || 'Human',
            role: c['char-concept'] || c.role || c['char-occu'] || 'Specialist',
            avatar: c.avatar || null
          }));
        }
        await setDoc(userRef, userDocUpdate, { merge: true });
      } catch (err) {
        console.warn('[FolioIdentity] Failed to update cloud tombstones:', err);
      }
    }

    // 5. Broadcast deletion event across tabs & windows
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('persona-deleted', { detail: { docId: rawId, ids: idsList } }));
    }

    showToast({ type: 'info', title: 'Persona Removed', message: 'Persona deleted from roster.' });
  }, [personaRoster]);

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
    const docId = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const blank = sanitizeSubAttributes({
      ...DEFAULT_CHARACTER,
      'char-name': 'New Operative',
      'character-doc-id': docId,
      id: docId,
      isNewBlank: true
    });
    setCharacterData(blank);
    StorageService.setItem('personaFolioData', blank);
    try {
      localStorage.setItem('personaFolioData', JSON.stringify(blank));
      localStorage.setItem('tangent_folio_character', JSON.stringify(blank));
    } catch (e) {}

    const tombstones = getFolioTombstones();
    setPersonaRoster(prev => {
      const cleanPrev = prev.filter(p => !isFolioPersonaDeleted(p, tombstones));
      const next = [...cleanPrev, blank];
      StorageService.setItem('personaRoster', next);
      try {
        localStorage.setItem('personaRoster', JSON.stringify(next));
        localStorage.setItem('tangent_folio_roster', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setActiveTab('identity');
    AudioService.playTerminalBeep(1000, 0.03);
    return docId;
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
      const tombstones = getFolioTombstones();
      const docs = snap.docs
        .map(d => ({ ...d.data(), 'character-doc-id': d.id }))
        .filter(c => !isFolioPersonaDeleted(c, tombstones) && !isPersonaEmptyTemplate(c))
        .map(c => sanitizeSubAttributes(sanitizeCharacterSkills(c)));

      setPersonaRoster(docs);
      StorageService.setItem('personaRoster', docs);
      try {
        localStorage.setItem('personaRoster', JSON.stringify(docs));
        localStorage.setItem('tangent_folio_roster', JSON.stringify(docs));
      } catch (e) {}
      setCloudSaveStatus('saved');
    } catch (e) {
      setCloudSaveStatus('error');
    }
  }, []);

  // Listen for persona-deleted events across the app
  useEffect(() => {
    const handlePersonaDeleted = (e) => {
      const deletedId = e?.detail?.docId;
      const ids = Array.isArray(e?.detail?.ids) ? e.detail.ids : (deletedId ? [deletedId] : []);
      if (ids.length === 0) return;
      const idsSet = new Set(ids);
      const tombstones = getFolioTombstones();
      setPersonaRoster(prev => prev.filter(p => !isFolioPersonaDeleted(p, tombstones) && !idsSet.has(p['character-doc-id']) && !idsSet.has(p.id)));

      // Also reset active characterData if deleted
      setCharacterData(cur => {
        const curDocId = cur ? (cur['character-doc-id'] || cur.id) : null;
        if (cur && (idsSet.has(curDocId) || isFolioPersonaDeleted(cur, tombstones))) {
          const defaultId = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const replacement = sanitizeSubAttributes({
            ...DEFAULT_CHARACTER,
            'character-doc-id': defaultId,
            id: defaultId
          });
          try {
            localStorage.setItem('personaFolioData', JSON.stringify(replacement));
            localStorage.setItem('tangent_folio_character', JSON.stringify(replacement));
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.removeItem('personaFolioData');
            }
            StorageService.setItem('personaFolioData', replacement);
          } catch (err) {}
          return replacement;
        }
        return cur;
      });
    };

    window.addEventListener('persona-deleted', handlePersonaDeleted);
    return () => window.removeEventListener('persona-deleted', handlePersonaDeleted);
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
    setCharacterData(prev => {
      const transitioned = applySpeciesTransition(prev, spName, dbData);
      triggerSave(transitioned);
      return transitioned;
    });
  }, [dbData, triggerSave]);

  const applyArchetypeChassis = useCallback((archName) => {
    setCharacterData(prev => {
      const transitioned = applyArchetypeTransition(prev, archName, dbData, { applyPreBuild: true });
      triggerSave(transitioned);
      return transitioned;
    });
  }, [dbData, triggerSave]);

  const applyOccupationAdjustments = useCallback((occuName) => {
    setCharacterData(prev => {
      const transitioned = applyOccupationTransition(prev, occuName, dbData);
      triggerSave(transitioned);
      return transitioned;
    });
  }, [dbData, triggerSave]);

  const applyOriginAdjustments = useCallback((origName) => {
    setCharacterData(prev => {
      const transitioned = applyOriginTransition(prev, origName, dbData);
      triggerSave(transitioned);
      return transitioned;
    });
  }, [dbData, triggerSave]);

  const applyFactionAdjustments = useCallback((facName) => {
    setCharacterData(prev => {
      const transitioned = applyFactionTransition(prev, facName, dbData);
      triggerSave(transitioned);
      return transitioned;
    });
  }, [dbData, triggerSave]);

  const applyIdentitySelection = useCallback((field, val, options = {}) => {
    setCharacterData(prev => {
      const transitioned = applyIdentityFieldTransition(prev, field, val, dbData, options);
      triggerSave(transitioned);
      return transitioned;
    });
  }, [dbData, triggerSave]);

  const applyGuidedCharacter = useCallback(async (draft) => {
    if (!draft) return null;
    const sanitized = sanitizeSubAttributes(sanitizeCharacterSkills(draft));
    setCharacterData(sanitized);
    const saved = await saveCurrentToRoster(sanitized);
    return saved;
  }, [saveCurrentToRoster]);

  // VTT Lifecycle & Lock Controls
  const isLocked = Boolean(characterData.is_locked);
  const folioPhase = characterData.folio_phase || 'development';
  const isReadyForVTT = Boolean(characterData.is_ready_for_vtt);
  const allowPlayerOverride = Boolean(characterData.player_override || characterData.allow_player_override);
  const isPlayerOverride = allowPlayerOverride;
  const isFolioLockedOut = isLocked && !allowPlayerOverride;

  // Synchronize viewMode with Persona Locking lifecycle
  useEffect(() => {
    if (isLocked) {
      setViewMode('play');
    }
  }, [isLocked]);

  useEffect(() => {
    const handleSetViewMode = (e) => {
      if (e?.detail) setViewMode(e.detail);
    };
    window.addEventListener('set-folio-view-mode', handleSetViewMode);
    return () => window.removeEventListener('set-folio-view-mode', handleSetViewMode);
  }, []);

  const lockPersona = useCallback(() => {
    updateField('is_locked', true);
    updateField('locked_at', new Date().toISOString());
    updateField('folio_phase', 'tactical');
    setViewMode('play');
    showToast({ type: 'info', title: 'Persona Sealed', message: 'Persona is now locked for VTT tactical play.' });
  }, [updateField]);

  const unlockPersona = useCallback(() => {
    updateField('is_locked', false);
    updateField('folio_phase', 'development');
    setViewMode('builder');
    showToast({ type: 'info', title: 'Persona Unlocked', message: 'Persona is in open development mode.' });
  }, [updateField]);

  const togglePersonaVttLock = useCallback(async (docId, forceValue) => {
    const user = auth.currentUser;
    const currentDocId = characterData['character-doc-id'] || characterData.id;

    let targetIsLocked;
    setPersonaRoster(prev => {
      const target = prev.find(p => (p['character-doc-id'] === docId || p.id === docId));
      const currentLocked = Boolean(target?.is_locked || target?.folio_phase === 'locked' || target?.folio_phase === 'tactical');
      targetIsLocked = typeof forceValue === 'boolean' ? forceValue : !currentLocked;

      const next = prev.map(p => {
        if (p['character-doc-id'] === docId || p.id === docId) {
          return {
            ...p,
            is_locked: targetIsLocked,
            folio_phase: targetIsLocked ? 'tactical' : 'development',
            locked_at: targetIsLocked ? new Date().toISOString() : null,
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
          is_locked: targetIsLocked,
          folio_phase: targetIsLocked ? 'tactical' : 'development',
          locked_at: targetIsLocked ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        };
        StorageService.setItem('personaFolioData', nextChar);
        try {
          localStorage.setItem('personaFolioData', JSON.stringify(nextChar));
          localStorage.setItem('tangent_folio_character', JSON.stringify(nextChar));
        } catch (e) {}
        return nextChar;
      });
      if (targetIsLocked) {
        setViewMode('play');
      } else {
        setViewMode('builder');
      }
    }

    if (user?.uid) {
      try {
        const ref = doc(db, 'users', user.uid, 'personas', docId);
        await setDoc(ref, {
          is_locked: targetIsLocked,
          folio_phase: targetIsLocked ? 'tactical' : 'development',
          locked_at: targetIsLocked ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Failed to update persona VTT lock in firestore:', err);
      }
    }

    AudioService.playTerminalBeep(targetIsLocked ? 1300 : 900, 0.03);
    showToast({
      type: targetIsLocked ? 'success' : 'info',
      title: targetIsLocked ? 'Persona Locked for VTT' : 'Persona Unlocked',
      message: targetIsLocked ? 'Persona is sealed and VTT-ready.' : 'Persona is unlocked in builder mode.'
    });
  }, [characterData, updateField]);

  const setPersonaAllowPlayerOverride = useCallback((allow) => {
    const val = Boolean(allow);
    updateField('player_override', val);
    updateField('allow_player_override', val);
  }, [updateField]);

  const clonePersonaVariant = useCallback((label = 'Variant') => {
    duplicateRosterCharacter(characterData['character-doc-id']);
  }, [duplicateRosterCharacter, characterData]);

  const recordTrackedModification = useCallback((mod) => {
    const list = characterData.tracked_modifications || [];
    const entry = {
      ...mod,
      oldValue: mod?.oldValue !== undefined ? mod.oldValue : mod?.previousValue,
      previousValue: mod?.previousValue !== undefined ? mod.previousValue : mod?.oldValue,
      status: mod?.status || mod?.reviewStatus || 'pending',
      reviewStatus: mod?.reviewStatus || mod?.status || 'pending',
      id: `mod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    updateField('tracked_modifications', [entry, ...list]);
  }, [characterData, updateField]);

  const reviewTrackedModification = useCallback((modId, status) => {
    const list = (characterData.tracked_modifications || []).map(m =>
      m.id === modId ? { ...m, status, reviewStatus: status, reviewedAt: new Date().toISOString() } : m
    );
    updateField('tracked_modifications', list);
  }, [characterData, updateField]);

  const revertTrackedModification = useCallback((modId) => {
    const target = (characterData.tracked_modifications || []).find(m => m.id === modId);
    const prevVal = target?.oldValue !== undefined ? target.oldValue : target?.previousValue;
    if (target && target.field && prevVal !== undefined) {
      updateField(target.field, prevVal);
    }
    const filtered = (characterData.tracked_modifications || []).filter(m => m.id !== modId);
    updateField('tracked_modifications', filtered);
  }, [characterData, updateField]);

  const applyVTTStatusConditions = useCallback((conditions) => {
    updateField('active_conditions', Array.isArray(conditions) ? conditions : []);
  }, [updateField]);

  const value = useMemo(() => ({
    characterData,
    setCharacterData,
    activeCharacter,
    activePersona: characterData,
    activeHeroName: activeCharacter.name,
    updateField,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    isCharacterSelected,
    setIsCharacterSelected,
    personaRoster,
    roster: personaRoster,
    saveCurrentToRoster,
    switchRosterCharacter,
    deleteRosterCharacter,
    duplicateRosterCharacter,
    togglePersonaNetworkEngaged,
    togglePersonaVttLock,
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
    trackedModifications: characterData?.tracked_modifications || []
  }), [
    characterData,
    setCharacterData,
    activeCharacter,
    updateField,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    isCharacterSelected,
    setIsCharacterSelected,
    personaRoster,
    saveCurrentToRoster,
    switchRosterCharacter,
    deleteRosterCharacter,
    duplicateRosterCharacter,
    togglePersonaNetworkEngaged,
    togglePersonaVttLock,
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
    applyVTTStatusConditions
  ]);

  return (
    <FolioIdentityContext.Provider value={value}>
      {children}
    </FolioIdentityContext.Provider>
  );
};
