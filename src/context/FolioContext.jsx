import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { characterSchema } from '../components/Folio/schema';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, deleteDoc, collectionGroup, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { attachCreatorTag } from '../utils/creatorUtils';
import { useDBM } from './DBMContext';
import { StorageService } from '../services/storageService';
import { 
  isStoryElementData, 
  convertPersonaElementToFolio, 
  exportStoryElementJSON 
} from '../utils/personaBridge';
import { 
  applyDamageToEntity,
  stabilizeEntity,
  advanceDeathClock,
  revivifyEntity,
  calculateDeathClock,
  calculateExperiencePool,
  applyExperienceAward,
  validateExperienceSpend,
  settleExperienceDebt,
  applySpeciesTransition,
  applyArchetypeTransition,
  applyOccupationTransition,
  applyOriginTransition,
  applyFactionTransition,
  applyIdentityFieldTransition,
  resolveCatalogItem,
  calculateFullSpeciesCost,
  getSpeciesComponentDataset,
  formatGrantedCost
} from '../engines/tangentEntityEngines';
import { DEATH_AND_DYING_RULES, EXPERIENCE_RULES } from '../engines/tangentConstants';
import { executeRestCycle, resetDailyRests, getSpeciesRestProfile } from '../engines/tangentRestEngine';
import { ALL_CANONICAL_SKILLS } from '../data/skillsData';

const ATTR_NAME_TO_ID = {
  strength: 'attr-strength',
  might: 'attr-might',
  agility: 'attr-agility',
  reflex: 'attr-reflex',
  stamina: 'attr-stamina',
  constitution: 'attr-stamina',
  fortitude: 'attr-fortitude',
  intellect: 'attr-intellect',
  reason: 'attr-logic',
  logic: 'attr-logic',
  wisdom: 'attr-wisdom',
  willpower: 'attr-will',
  will: 'attr-will',
  charisma: 'attr-charisma',
  etiquette: 'attr-etiquette'
};

export const PRIMARY_TO_SUB_ATTR = {
  'attr-strength': 'attr-might',
  'attr-agility': 'attr-reflex',
  'attr-stamina': 'attr-fortitude',
  'attr-intellect': 'attr-logic',
  'attr-wisdom': 'attr-will',
  'attr-charisma': 'attr-etiquette'
};

export const SUB_TO_PRIMARY_ATTR = {
  'attr-might': 'attr-strength',
  'attr-reflex': 'attr-agility',
  'attr-fortitude': 'attr-stamina',
  'attr-logic': 'attr-intellect',
  'attr-reason': 'attr-intellect',
  'attr-will': 'attr-wisdom',
  'attr-willpower': 'attr-wisdom',
  'attr-etiquette': 'attr-charisma'
};

const FolioContext = createContext(null);

export const useFolio = () => {
  const context = useContext(FolioContext);
  if (!context) {
    throw new Error('useFolio must be used within a FolioProvider');
  }
  return context;
};

const DEFAULT_CHARACTER = {
  'character-doc-id': '',
  isPublic: false,
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
  architecture: [],
  other: [],
  specializations: [],
  notes: [{ text: '' }]
};

const FOLIO_TOMBSTONES_KEY = 'folio_deleted_personas';

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

export const FolioProvider = ({ children }) => {
  // Master Character Form State initialized from localStorage/sessionStorage if available
  const [characterData, setCharacterData] = useState(() => {
    try {
      const tombstones = getFolioTombstones();
      const saved = localStorage.getItem('personaFolioData') || sessionStorage.getItem('personaFolioData');
      if (saved) {
        const parsed = characterSchema.parse(JSON.parse(saved));
        if (!isFolioPersonaDeleted(parsed['character-doc-id'], tombstones)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse saved persona data:', e);
    }
    return attachCreatorTag(DEFAULT_CHARACTER, typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '');
  });

  const dbContext = useDBM() || {};
  const dbData = dbContext.dbData || {};

  // Cloud Save Status state: 'saved' | 'saving' | 'offline' | 'error'
  const [cloudSaveStatus, setCloudSaveStatus] = useState('saved');
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [publicCatalog, setPublicCatalog] = useState([]);
  
  // Active Game Session & Tactical Integrity Lock State
  const [isGMConfirmed, setIsGMConfirmed] = useState(false);
  const [activeGameOverride, setActiveGameOverride] = useState(null);

  // Character Roster State — primary source is Firestore; StorageService/IndexedDB is secondary offline cache
  const [personaRoster, setPersonaRoster] = useState(() => {
    try {
      const tombstones = getFolioTombstones();
      const saved = localStorage.getItem('personaRoster');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(c => !isFolioPersonaDeleted(c['character-doc-id'], tombstones));
        }
      }
    } catch (e) {
      console.warn('Failed to load character roster from localStorage cache:', e);
    }
    return [];
  });

  // Asynchronous StorageService hydration on initial mount
  useEffect(() => {
    let isMounted = true;
    async function hydrateCacheFromStorage() {
      try {
        const tombstones = getFolioTombstones();
        const [cachedRoster, cachedCharacter] = await Promise.all([
          StorageService.getItem('personaRoster'),
          StorageService.getItem('personaFolioData')
        ]);

        if (!isMounted) return;

        if (Array.isArray(cachedRoster) && cachedRoster.length > 0) {
          const validRoster = cachedRoster.filter(c => !isFolioPersonaDeleted(c['character-doc-id'], tombstones));
          setPersonaRoster(validRoster);
          localStorage.setItem('personaRoster', JSON.stringify(validRoster));
        }

        if (cachedCharacter && typeof cachedCharacter === 'object') {
          try {
            const parsed = characterSchema.parse(cachedCharacter);
            if (!isFolioPersonaDeleted(parsed['character-doc-id'], tombstones)) {
              setCharacterData(prev => {
                // Only hydrate if active character is currently empty/default
                if (!prev['char-name'] && !prev['character-doc-id']) {
                  return parsed;
                }
                return prev;
              });
            }
          } catch (e) {
            console.warn('[FolioContext] Saved character failed schema parse during hydration:', e);
          }
        }
      } catch (err) {
        console.warn('[FolioContext] Failed to hydrate cache from StorageService:', err);
      }
    }

    hydrateCacheFromStorage();
    return () => {
      isMounted = false;
    };
  }, []);

  // Check URL query parameters for direct public persona view (?user=UID&id=PERSONAID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetUid = params.get('user');
    const targetDocId = params.get('id');

    if (targetUid && targetDocId) {
      const docRef = doc(db, `users/${targetUid}/personas`, targetDocId);
      getDoc(docRef).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const isOwner = auth.currentUser && auth.currentUser.uid === targetUid;
          if (data.isPublic || isOwner) {
            const parsed = characterSchema.parse(data);
            setCharacterData(parsed);
            setIsReadOnly(!isOwner);
          } else {
            alert('This persona is private and cannot be viewed.');
          }
        } else {
          alert('Requested persona document was not found.');
        }
      }).catch((err) => {
        console.warn('Failed to fetch public persona:', err);
      });
    }
  }, []);

  // Real-time Firestore listener for persona roster
  // Uses onAuthStateChanged so we wait for async Firebase Auth to resolve
  useEffect(() => {
    let firestoreUnsub = null;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      // Clean up any previous Firestore listener if user changed
      if (firestoreUnsub) {
        firestoreUnsub();
        firestoreUnsub = null;
      }

      if (!user) {
        setCloudSaveStatus('offline');
        return;
      }

      // User is authenticated — subscribe to their persona roster in Firestore
      const personasRef = collection(db, `users/${user.uid}/personas`);
      firestoreUnsub = onSnapshot(personasRef, (snapshot) => {
        const tombstones = getFolioTombstones();
        const personas = snapshot.docs
          .map(d => ({ ...d.data(), 'character-doc-id': d.id, ownerUid: user.uid }))
          .filter(p => !isFolioPersonaDeleted(p['character-doc-id'], tombstones));
        setPersonaRoster(personas);
        // Mirror to StorageService & localStorage as offline cache
        StorageService.setItem('personaRoster', personas);
        try {
          localStorage.setItem('personaRoster', JSON.stringify(personas));
        } catch (e) {}
      }, (err) => {
        console.warn('Firestore personas listener error:', err.message);
      });
    });

    // Cleanup both listeners on unmount
    return () => {
      authUnsub();
      if (firestoreUnsub) firestoreUnsub();
    };
  }, []);

  // EVENT-DRIVEN CLOUD SAVE
  const characterDataRef = React.useRef(characterData);
  useEffect(() => {
    characterDataRef.current = characterData;
  }, [characterData]);

  const saveTimeoutRef = React.useRef(null);
  
  const triggerSave = useCallback((immediate = false) => {
    if (isReadOnly) return; // Read-only mode prevents overwriting public sheets

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const executeSave = async () => {
      const user = auth.currentUser;
      if (!user) {
        setCloudSaveStatus('offline');
        return;
      }

      const currentData = characterDataRef.current;
      const docId = currentData['character-doc-id'];
      
      // Do not save if character has been deleted or has no document ID
      if (!docId || isFolioPersonaDeleted(docId)) {
        return;
      }

      setCloudSaveStatus('saving');

      try {
        const rawData = {
          ...currentData,
          'character-doc-id': docId,
          updatedAt: new Date().toISOString()
        };
        const updatedData = attachCreatorTag(rawData, localStorage.getItem('userHandle'), user);

        const docRef = doc(db, `users/${user.uid}/personas`, docId);
        await setDoc(docRef, updatedData);

        setCloudSaveStatus('saved');
        setLastSavedTime(new Date());
      } catch (err) {
        console.error('Cloud save failed:', err);
        setCloudSaveStatus('error');
      }
    };

    if (immediate) {
      executeSave();
    } else {
      saveTimeoutRef.current = setTimeout(executeSave, 1000); // 1-second debounce
    }
  }, [isReadOnly]);

  // Page Visibility & Focus auto-save
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerSave(true); // immediate save when tab is hidden or page closed
      }
    };
    const handleBlur = () => {
      triggerSave(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [triggerSave]);

  // Comprehensive Identity & Modifier Calculation Engine
  const computedModifiers = useMemo(() => {
    const attributeMods = {
      'attr-strength': 0,
      'attr-might': 0,
      'attr-agility': 0,
      'attr-reflex': 0,
      'attr-stamina': 0,
      'attr-fortitude': 0,
      'attr-intellect': 0,
      'attr-logic': 0,
      'attr-wisdom': 0,
      'attr-will': 0,
      'attr-charisma': 0,
      'attr-etiquette': 0
    };

    const combatMods = {
      'initiative-mod': 0,
      'defense-mod': 0,
      'attack-mod': 0,
      'move-walk': 0,
      'move-swim': 0,
      'move-climb': 0,
      'move-fly': 0
    };

    const skillMods = {};

    const resolveItem = (key, colName) => {
      const val = characterData[key];
      if (!val) return null;
      if (typeof val === 'object' && val !== null) return val;
      return resolveCatalogItem(colName, val, dbData);
    };

    const processIdentity = (identityItem, identityKey, identityTitle) => {
      const pools = [];
      const activeModifiers = [];
      if (!identityItem) return { title: identityTitle, name: 'Not Selected', pools, activeModifiers };

      const name = typeof identityItem === 'object' ? (identityItem.name || identityItem.title || 'Selected') : String(identityItem);

      if (typeof identityItem === 'object') {
        // 1. Inherent Attribute Modifiers (Set values per attribute or sub-attribute)
        const inherentAttrMods = identityItem.inherent_attribute_modifiers || identityItem.specific_attribute_bonuses;
        if (Array.isArray(inherentAttrMods) && inherentAttrMods.length > 0) {
          inherentAttrMods.forEach(b => {
            const aName = typeof b === 'object' ? (b.attribute || b.name || '') : String(b).split(/[:+(]/)[0].trim();
            const aVal = typeof b === 'object' ? (b.bonus ?? b.value ?? 1) : (parseInt(String(b).replace(/[^0-9-]/g, ''), 10) || 1);
            if (aName) {
              const cleanName = aName.toLowerCase().trim();
              const attrKeyMap = {
                'strength': 'attr-strength',
                'might': 'attr-might',
                'agility': 'attr-agility',
                'reflex': 'attr-reflex',
                'stamina': 'attr-stamina',
                'fortitude': 'attr-fortitude',
                'constitution': 'attr-fortitude',
                'intellect': 'attr-intellect',
                'logic': 'attr-logic',
                'wisdom': 'attr-wisdom',
                'will': 'attr-will',
                'charisma': 'attr-charisma',
                'etiquette': 'attr-etiquette'
              };
              const targetKey = attrKeyMap[cleanName] || (cleanName.startsWith('attr-') ? cleanName : `attr-${cleanName}`);
              if (attributeMods[targetKey] !== undefined) {
                attributeMods[targetKey] = (attributeMods[targetKey] || 0) + aVal;
              }
              activeModifiers.push({ name: `[${identityTitle}: ${name}] ${aName} ${aVal >= 0 ? '+' : ''}${aVal}`, target: aName.toUpperCase(), value: aVal, type: 'Attribute' });
              pools.push({ name: `Inherent Attr: ${aName} (${aVal >= 0 ? '+' : ''}${aVal})`, awarded: aVal, type: 'Inherent Attr' });
            }
          });
        }

        // Direct Bonus Attribute Point Pools
        const bonusAttrPts = parseInt(identityItem.bonus_attribute_points, 10);
        if (!isNaN(bonusAttrPts) && bonusAttrPts !== 0) {
          pools.push({ name: 'Bonus Attribute Points (ANY)', awarded: bonusAttrPts, type: 'Attr Points' });
        }
        const bonusAttrPhys = parseInt(identityItem.bonus_attribute_points_physical, 10);
        if (!isNaN(bonusAttrPhys) && bonusAttrPhys !== 0) {
          pools.push({ name: 'Bonus PHYSICAL Attribute Points (STR, AGI, STA)', awarded: bonusAttrPhys, type: 'Physical Attr' });
        }
        const bonusAttrMent = parseInt(identityItem.bonus_attribute_points_mental, 10);
        if (!isNaN(bonusAttrMent) && bonusAttrMent !== 0) {
          pools.push({ name: 'Bonus MENTAL Attribute Points (INT, WIS, CHA)', awarded: bonusAttrMent, type: 'Mental Attr' });
        }
        const bonusAttrPrim = parseInt(identityItem.bonus_attribute_points_primary, 10);
        if (!isNaN(bonusAttrPrim) && bonusAttrPrim !== 0) {
          pools.push({ name: 'Bonus Primary Attribute Points', awarded: bonusAttrPrim, type: 'Primary Attr' });
        }
        const bonusAttrSub = parseInt(identityItem.bonus_attribute_points_sub, 10);
        if (!isNaN(bonusAttrSub) && bonusAttrSub !== 0) {
          pools.push({ name: 'Bonus Sub-Attribute Points', awarded: bonusAttrSub, type: 'Sub-Attr' });
        }
        const bonusAttrChoices = parseInt(identityItem.bonus_attribute_choices, 10);
        if (!isNaN(bonusAttrChoices) && bonusAttrChoices !== 0) {
          pools.push({ name: 'Bonus Attribute Choices', awarded: bonusAttrChoices, type: 'Choice' });
        }
        if (Array.isArray(identityItem.bonus_attribute_options) && identityItem.bonus_attribute_options.length > 0) {
          const optNames = identityItem.bonus_attribute_options.map(o => typeof o === 'object' ? (o.name || o.id) : o).join(', ');
          pools.push({ name: `Bonus Attribute Options Pool (${optNames})`, awarded: bonusAttrChoices || identityItem.bonus_attribute_options.length, type: 'Attr Pool' });
        }

        // 2. Direct Bonus Skill Fields & Specific Skill Bonuses
        const rawSkillPts = identityItem.bonus_skills !== undefined && typeof identityItem.bonus_skills !== 'object'
          ? identityItem.bonus_skills
          : identityItem.bonus_skill_points;
        const bonusSkillPts = parseInt(rawSkillPts, 10);
        if (!isNaN(bonusSkillPts) && bonusSkillPts !== 0) {
          pools.push({ name: 'Bonus Skill Points', awarded: bonusSkillPts, type: 'Skill Points' });
        }
        if (Array.isArray(identityItem.bonus_skill_choices) && identityItem.bonus_skill_choices.length > 0) {
          const choiceNames = identityItem.bonus_skill_choices.map(s => typeof s === 'object' ? (s.name || s.id) : s).join(', ');
          pools.push({ name: `Bonus Skill Choices Pool (${choiceNames})`, awarded: bonusSkillPts || identityItem.bonus_skill_choices.length, type: 'Skill Pool' });
        } else {
          const bonusSkillChoices = parseInt(identityItem.bonus_skill_choices, 10);
          if (!isNaN(bonusSkillChoices) && bonusSkillChoices !== 0) {
            pools.push({ name: 'Bonus Skill Choices', awarded: bonusSkillChoices, type: 'Choice' });
          }
        }

        // Specific Skill Bonuses (Set values per skill)
        if (Array.isArray(identityItem.specific_skill_bonuses) && identityItem.specific_skill_bonuses.length > 0) {
          identityItem.specific_skill_bonuses.forEach(b => {
            const sName = typeof b === 'object' ? (b.skill || b.name || '') : String(b).split(/[:+(]/)[0].trim();
            const sVal = typeof b === 'object' ? (b.bonus ?? b.value ?? 1) : (parseInt(String(b).replace(/[^0-9-]/g, ''), 10) || 1);
            if (sName) {
              const targetKey = sName.toLowerCase().trim();
              skillMods[targetKey] = (skillMods[targetKey] || 0) + sVal;
              activeModifiers.push({ name: `[${identityTitle}: ${name}] ${sName} +${sVal}`, target: sName.toUpperCase(), value: sVal, type: 'Skill' });
              pools.push({ name: `Set Skill: ${sName} (+${sVal})`, awarded: sVal, type: 'Set Skill' });
            }
          });
        }

        ['physical', 'mental', 'social', 'combat', 'meta'].forEach(cat => {
          const catPts = parseInt(identityItem[`bonus_skill_points_${cat}`], 10);
          if (!isNaN(catPts) && catPts !== 0) {
            pools.push({ name: `Bonus ${cat.charAt(0).toUpperCase() + cat.slice(1)} Skill Points`, awarded: catPts, type: `${cat.toUpperCase()} SP` });
          }
        });

        // 3. Direct Bonus Features, Inherent Features & Disciplines
        const rawFeatPts = identityItem.bonus_features !== undefined && typeof identityItem.bonus_features !== 'object'
          ? identityItem.bonus_features
          : identityItem.bonus_feature_points;
        const bonusFeatPts = parseInt(rawFeatPts, 10);
        if (!isNaN(bonusFeatPts) && bonusFeatPts !== 0) {
          pools.push({ name: 'Bonus Feature Points', awarded: bonusFeatPts, type: 'Feature Points' });
        }
        if (Array.isArray(identityItem.bonus_feature_choices) && identityItem.bonus_feature_choices.length > 0) {
          const featNames = identityItem.bonus_feature_choices.map(f => typeof f === 'object' ? (f.name || f.id) : f).join(', ');
          pools.push({ name: `Bonus Feature Choices Pool (${featNames})`, awarded: bonusFeatPts || identityItem.bonus_feature_choices.length, type: 'Feature Pool' });
        } else {
          const bonusFeatChoices = parseInt(identityItem.bonus_feature_choices, 10);
          if (!isNaN(bonusFeatChoices) && bonusFeatChoices !== 0) {
            pools.push({ name: 'Bonus Feature Choices', awarded: bonusFeatChoices, type: 'Choice' });
          }
        }

        // Background-specific Skill Package Pools (20 SP canonical baseline)
        if (identityItem.society_skills || identityKey === 'origin') {
          const sPts = parseInt(identityItem.skill_points || 20, 10);
          pools.push({ name: 'Society Skill Point Pool', awarded: sPts, type: 'Skill Points' });
        }
        if (identityItem.professional_skills || identityKey === 'occu') {
          const sPts = parseInt(identityItem.skill_points || 20, 10);
          pools.push({ name: 'Professional Skill Package Pool', awarded: sPts, type: 'Skill Points' });
        }
        if (identityItem.skill_package || identityKey === 'faction') {
          const sPts = parseInt(identityItem.skill_points || 20, 10);
          pools.push({ name: 'Faction Skill Package Pool', awarded: sPts, type: 'Skill Points' });
        }

        // Background-specific Trait Pools (1-2 traits canonical baseline for Origins & Occupations)
        if ((identityItem.traits || identityItem.trait || identityKey === 'origin' || identityKey === 'occu') && !pools.some(p => p.name.includes('Traits Pool'))) {
          const tCount = parseInt(identityItem.bonus_traits || identityItem.bonus_features || 2, 10);
          pools.push({ name: `${identityTitle} Career/Homeworld Traits Pool`, awarded: tCount, type: 'Trait Pool' });
        }
        // Background-specific Feature / Benefit Pools (1-2 features canonical baseline for Factions)
        if ((identityItem.features || identityItem.benefits || identityItem.bonus_features || identityKey === 'faction') && !pools.some(p => p.name.includes('Features & Benefits Pool'))) {
          const fCount = parseInt(identityItem.bonus_features || 2, 10);
          pools.push({ name: `${identityTitle} Features & Benefits Pool`, awarded: fCount, type: 'Feature Pool' });
        }

        // Inherent Guaranteed Traits / Features
        if (Array.isArray(identityItem.inherent_features) && identityItem.inherent_features.length > 0) {
          const inhNames = identityItem.inherent_features.map(f => typeof f === 'object' ? (f.name || f.id) : f).join(', ');
          pools.push({ name: `Inherent Assets (${inhNames})`, awarded: identityItem.inherent_features.length, type: 'Inherent' });
        }

        ['ability', 'combat', 'meta', 'general', 'karma', 'skill', 'exotic'].forEach(featCat => {
          const fPts = parseInt(identityItem[`bonus_feature_points_${featCat}`], 10);
          if (!isNaN(fPts) && fPts !== 0) {
            pools.push({ name: `Bonus ${featCat.charAt(0).toUpperCase() + featCat.slice(1)} Feature Points`, awarded: fPts, type: `${featCat.toUpperCase()} FP` });
          }
        });
        const bonusDisc = parseInt(identityItem.bonus_disciplines, 10);
        if (!isNaN(bonusDisc) && bonusDisc !== 0) {
          pools.push({ name: 'Bonus Disciplines', awarded: bonusDisc, type: 'Disciplines' });
        }
        const bonusSA = parseInt(identityItem.bonus_special_abilities, 10);
        if (!isNaN(bonusSA) && bonusSA !== 0) {
          pools.push({ name: 'Bonus Special Abilities', awarded: bonusSA, type: 'Special Abilities' });
        }

        const allModifiers = dbData.modifier || [];

        // Helper to process a modifier reference (object or string) with optional prefix
        const applyModifier = (modRef, prefix = '') => {
          let modObj = null;
          if (typeof modRef === 'object' && modRef !== null) {
            modObj = modRef;
          } else if (typeof modRef === 'string') {
            modObj = allModifiers.find(m => 
              (m.name && m.name.toLowerCase() === modRef.toLowerCase()) || 
              m.id === modRef
            ) || { name: modRef };
          }

          if (!modObj) return;

          const aspect = (modObj.aspect || '').toLowerCase();
          const subtype = (modObj.aspect_subtype || '').toLowerCase().trim();
          const val = parseInt(modObj.value ?? 1, 10) || 1;
          const baseModName = modObj.name || `${subtype || aspect || 'Bonus'} Mod`;
          const modName = prefix ? `${prefix} ${baseModName}` : baseModName;

          if (aspect === 'attribute') {
            if (subtype === 'any' || subtype === 'any attribute' || modObj.bonus_scope === 'any' || !subtype) {
              pools.push({ name: `${modName} (ANY)`, awarded: val, type: 'Attr Points' });
            } else if (subtype === 'any primary attribute') {
              pools.push({ name: `${modName} (Primary)`, awarded: val, type: 'Primary Attr' });
            } else if (subtype === 'any sub-attribute') {
              pools.push({ name: `${modName} (Sub-Attr)`, awarded: val, type: 'Sub-Attr' });
            } else {
              const targetAttrId = ATTR_NAME_TO_ID[subtype];
              if (targetAttrId && attributeMods[targetAttrId] !== undefined) {
                attributeMods[targetAttrId] += val;
                activeModifiers.push({ name: modName, target: subtype.toUpperCase(), value: val, type: 'Attribute' });
              } else {
                pools.push({ name: modName, awarded: val, type: 'Attribute Mod' });
              }
            }
          } else if (aspect === 'skill') {
            if (subtype === 'any' || subtype.startsWith('any') || modObj.bonus_scope === 'any' || !subtype) {
              pools.push({ name: `${modName} (${subtype || 'ANY'})`, awarded: val, type: 'Skill Points' });
            } else {
              skillMods[subtype] = (skillMods[subtype] || 0) + val;
              activeModifiers.push({ name: modName, target: subtype.toUpperCase(), value: val, type: 'Skill' });
            }
          } else if (aspect === 'combat') {
            if (subtype === 'any' || subtype === 'any combat stat' || modObj.bonus_scope === 'any' || !subtype) {
              pools.push({ name: `${modName} (Combat)`, awarded: val, type: 'Combat Points' });
            } else {
              if (subtype.includes('initiative')) combatMods['initiative-mod'] += val;
              else if (subtype.includes('movement') || subtype.includes('walk')) combatMods['move-walk'] += val;
              else combatMods['defense-mod'] += val;
              activeModifiers.push({ name: modName, target: subtype.toUpperCase(), value: val, type: 'Combat' });
            }
          } else if (aspect === 'feature') {
            if (subtype === 'any' || subtype.startsWith('any') || modObj.bonus_scope === 'any' || !subtype) {
              pools.push({ name: `${modName} (${subtype || 'ANY'})`, awarded: val, type: 'Feature Points' });
            } else {
              activeModifiers.push({ name: modName, target: subtype.toUpperCase(), value: val, type: 'Feature' });
            }
          } else if (aspect === 'other') {
            if (subtype === 'any' || !subtype) {
              pools.push({ name: `${modName} (ANY)`, awarded: val, type: 'Points' });
            } else {
              activeModifiers.push({ name: modName, target: subtype.toUpperCase(), value: val, type: 'Other' });
            }
          } else {
            if (val) {
              pools.push({ name: modName, awarded: val, type: 'Bonus' });
            }
          }
        };

        // 4. Resolve attached direct modifiers (legacy and modern)
        const modRefs = Array.isArray(identityItem.modifier) ? identityItem.modifier : (identityItem.modifier ? [identityItem.modifier] : []);
        modRefs.forEach(modRef => applyModifier(modRef));

        // 4b. Resolve modern consolidated modifiers array [{ target, type, value, mode }]
        if (Array.isArray(identityItem.modifiers) && identityItem.modifiers.length > 0) {
          identityItem.modifiers.forEach(mod => {
            if (!mod || typeof mod !== 'object') return;
            const target = (mod.target || '').trim();
            const type = (mod.type || 'other').toLowerCase();
            const mode = (mod.mode || 'inherent').toLowerCase();
            const val = parseInt(mod.value ?? 1, 10) || 0;
            if (!target) return;

            const modDesc = `[${identityTitle}: ${name}] ${target} ${val >= 0 ? '+' : ''}${val}`;

            if (type === 'attribute') {
              const lowerTarget = target.toLowerCase();
              const attrKeyMap = {
                'strength': 'attr-strength', 'might': 'attr-might',
                'agility': 'attr-agility', 'reflex': 'attr-reflex',
                'stamina': 'attr-stamina', 'fortitude': 'attr-fortitude', 'constitution': 'attr-fortitude',
                'intellect': 'attr-intellect', 'logic': 'attr-logic',
                'wisdom': 'attr-wisdom', 'will': 'attr-will',
                'charisma': 'attr-charisma', 'etiquette': 'attr-etiquette'
              };
              const targetKey = attrKeyMap[lowerTarget] || (lowerTarget.startsWith('attr-') ? lowerTarget : `attr-${lowerTarget}`);

              if (mode === 'inherent' && attributeMods[targetKey] !== undefined) {
                attributeMods[targetKey] = (attributeMods[targetKey] || 0) + val;
                activeModifiers.push({ name: modDesc, target: target.toUpperCase(), value: val, type: 'Attribute' });
                pools.push({ name: `Inherent Attr: ${target} (${val >= 0 ? '+' : ''}${val})`, awarded: val, type: 'Inherent Attr' });
              } else if (mode === 'bonus_pool' || lowerTarget.includes('any attribute') || lowerTarget.includes('any')) {
                pools.push({ name: `${modDesc} (Attribute Pool)`, awarded: val || 1, type: 'Attr Points' });
              } else if (mode === 'choice_pool') {
                pools.push({ name: `Attribute Choice: ${target}`, awarded: val || 1, type: 'Choice' });
              } else if (attributeMods[targetKey] !== undefined) {
                attributeMods[targetKey] = (attributeMods[targetKey] || 0) + val;
                activeModifiers.push({ name: modDesc, target: target.toUpperCase(), value: val, type: 'Attribute' });
              }
            } else if (type === 'skill') {
              const cleanSkill = target.toLowerCase().trim();
              if (mode === 'inherent') {
                skillMods[cleanSkill] = (skillMods[cleanSkill] || 0) + val;
                activeModifiers.push({ name: modDesc, target: target.toUpperCase(), value: val, type: 'Skill' });
                pools.push({ name: `Set Skill: ${target} (+${val})`, awarded: val, type: 'Set Skill' });
              } else if (mode === 'bonus_pool' || cleanSkill.includes('general skill pool') || cleanSkill.includes('any skill') || cleanSkill.includes('any')) {
                pools.push({ name: `${target} (Skill Pool)`, awarded: val, type: 'Skill Points' });
              } else if (mode === 'choice_pool') {
                pools.push({ name: `Skill Choice: ${target}`, awarded: val || 1, type: 'Skill Choice' });
              } else {
                skillMods[cleanSkill] = (skillMods[cleanSkill] || 0) + val;
                activeModifiers.push({ name: modDesc, target: target.toUpperCase(), value: val, type: 'Skill' });
              }
            } else if (type === 'feature') {
              if (mode === 'inherent') {
                pools.push({ name: `Inherent Feature: ${target}`, awarded: 1, type: 'Inherent' });
                activeModifiers.push({ name: modDesc, target: target.toUpperCase(), value: val || 1, type: 'Feature' });
              } else if (mode === 'bonus_pool' || target.toLowerCase().includes('feature pool')) {
                pools.push({ name: `${target}`, awarded: val, type: 'Feature Points' });
              } else if (mode === 'choice_pool') {
                pools.push({ name: `Feature Choice: ${target}`, awarded: val || 1, type: 'Choice' });
              } else if (mode === 'recommended') {
                pools.push({ name: `Recommended Feature: ${target}`, awarded: val || 1, type: 'Recommended' });
              }
            } else if (type === 'combat') {
              const lowerTarget = target.toLowerCase();
              if (lowerTarget.includes('initiative')) combatMods['initiative-mod'] += val;
              else if (lowerTarget.includes('movement') || lowerTarget.includes('walk') || lowerTarget.includes('speed')) combatMods['move-walk'] += val;
              else combatMods['defense-mod'] += val;
              activeModifiers.push({ name: modDesc, target: target.toUpperCase(), value: val, type: 'Combat' });
            } else {
              if (val) {
                pools.push({ name: modDesc, awarded: val, type: 'Bonus' });
              }
            }
          });
        }

        // 5. Resolve attached species traits (multiple selection traits)
        const rawTraits = identityItem.trait || identityItem.traits || [];
        const traitList = Array.isArray(rawTraits) ? rawTraits : (rawTraits ? [rawTraits] : []);
        const allTraits = dbData.trait || [];

        traitList.forEach(tRef => {
          let tObj = null;
          if (typeof tRef === 'object' && tRef !== null) {
            tObj = tRef;
          } else if (typeof tRef === 'string') {
            tObj = allTraits.find(t => 
              (t.name && t.name.toLowerCase() === tRef.toLowerCase()) || 
              t.id === tRef
            ) || { name: tRef };
          }
          if (!tObj) return;

          const tName = tObj.name || tObj.id || 'Trait';

          // Process modifiers attached to this trait
          const tModRefs = Array.isArray(tObj.modifier) ? tObj.modifier : (tObj.modifier ? [tObj.modifier] : []);
          tModRefs.forEach(modRef => applyModifier(modRef, `[Trait: ${tName}]`));

          // Check direct point bonuses on the trait itself
          const tAttrPts = parseInt(tObj.bonus_attribute_points, 10);
          if (!isNaN(tAttrPts) && tAttrPts !== 0) {
            pools.push({ name: `[Trait: ${tName}] Bonus Attribute Points`, awarded: tAttrPts, type: 'Attr Points' });
          }
          const tSkillPts = parseInt(tObj.bonus_skill_points, 10);
          if (!isNaN(tSkillPts) && tSkillPts !== 0) {
            pools.push({ name: `[Trait: ${tName}] Bonus Skill Points`, awarded: tSkillPts, type: 'Skill Points' });
          }
          const tFeatPts = parseInt(tObj.bonus_feature_points, 10);
          if (!isNaN(tFeatPts) && tFeatPts !== 0) {
            pools.push({ name: `[Trait: ${tName}] Bonus Feature Points`, awarded: tFeatPts, type: 'Feature Points' });
          }
        });

        // 6. Resolve attached species subcategories (types, sizes, movements)
        const resolveSubComponent = (fieldKey, colKey, labelPrefix) => {
          const rawItems = identityItem[fieldKey] || [];
          const items = Array.isArray(rawItems) ? rawItems : (rawItems ? [rawItems] : []);
          const allCol = dbData[colKey] || [];

          items.forEach(ref => {
            let itemObj = null;
            if (typeof ref === 'object' && ref !== null) {
              itemObj = ref;
            } else if (typeof ref === 'string') {
              itemObj = allCol.find(c => 
                (c.name && c.name.toLowerCase() === ref.toLowerCase()) || 
                c.id === ref
              ) || { name: ref };
            }
            if (!itemObj) return;

            const iName = itemObj.name || itemObj.id || labelPrefix;
            const iModRefs = Array.isArray(itemObj.modifier) ? itemObj.modifier : (itemObj.modifier ? [itemObj.modifier] : []);
            iModRefs.forEach(modRef => applyModifier(modRef, `[${labelPrefix}: ${iName}]`));
          });
        };

        resolveSubComponent('type', 'species_type', 'Type');
        resolveSubComponent('size', 'species_size', 'Size');
        resolveSubComponent('movement', 'species_movement', 'Movement');
      }

      // Check for custom pools attached to characterData
      const customPoolKey = `char-${identityKey}-pools`;
      if (Array.isArray(characterData[customPoolKey])) {
        characterData[customPoolKey].forEach(p => pools.push(p));
      }

      return {
        title: identityTitle,
        name,
        pools,
        activeModifiers
      };
    };

    const speciesObj = resolveItem('char-species', 'species');
    const occuObj = resolveItem('char-occu', 'occupations');
    const originObj = resolveItem('char-origin', 'origins');
    const factionObj = resolveItem('char-faction', 'factions');
    const archetypeObj = resolveItem('char-archetype', 'archetypes');

    const identityPools = {
      species: processIdentity(speciesObj, 'species', 'Species'),
      occupation: processIdentity(occuObj, 'occu', 'Occupation'),
      origin: processIdentity(originObj, 'origin', 'Origin'),
      faction: processIdentity(factionObj, 'faction', 'Faction'),
      archetype: processIdentity(archetypeObj, 'archetype', 'Archetype')
    };

    // Also process features for active modifiers
    const featsList = Array.isArray(characterData.features) ? characterData.features : [];
    const allModifiers = dbData.modifier || [];
    featsList.forEach(feat => {
      if (typeof feat === 'object' && feat.modifier) {
        const modRefs = Array.isArray(feat.modifier) ? feat.modifier : [feat.modifier];
        modRefs.forEach(modRef => {
          let modObj = typeof modRef === 'object' ? modRef : allModifiers.find(m => m.name === modRef || m.id === modRef);
          if (modObj && modObj.aspect === 'attribute') {
            const subtype = (modObj.aspect_subtype || '').toLowerCase().trim();
            const targetAttrId = ATTR_NAME_TO_ID[subtype];
            const val = parseInt(modObj.value ?? 1, 10) || 1;
            if (targetAttrId && attributeMods[targetAttrId] !== undefined) {
              attributeMods[targetAttrId] += val;
            }
          }
        });
      }
    });

    return {
      attributeMods,
      combatMods,
      skillMods,
      identityPools
    };
  }, [
    characterData['char-archetype'],
    characterData['char-species'],
    characterData['char-occu'],
    characterData['char-origin'],
    characterData['char-faction'],
    characterData.features,
    dbData
  ]);

  // Helper to get dynamic sub-attribute base: (Current Primary Attribute * 2) + 2
  const getSubAttrBase = useCallback((subKey, data = characterData) => {
    const primaryKey = SUB_TO_PRIMARY_ATTR[subKey];
    if (!primaryKey) return 2;
    const pVal = parseInt(data[primaryKey] || 0, 10);
    return (pVal * 2) + 2;
  }, [characterData]);

  // Attribute Mod & Total Calculation Helpers
  const getAttrMod = useCallback((attrId) => {
    const userMod = parseInt(characterData[`${attrId}-mod`] || 0, 10) || 0;
    const identityMod = computedModifiers.attributeMods[attrId] || 0;
    return userMod + identityMod;
  }, [characterData, computedModifiers.attributeMods]);

  const getAttrTotal = useCallback((attrId) => {
    let val;
    if (SUB_TO_PRIMARY_ATTR[attrId]) {
      const primaryKey = SUB_TO_PRIMARY_ATTR[attrId];
      const pVal = parseInt(characterData[primaryKey] || 0, 10);
      const base = (pVal * 2) + 2;
      const hasExplicit = characterData[attrId] !== undefined && characterData[attrId] !== null && characterData[attrId] !== '';
      val = hasExplicit ? (parseInt(characterData[attrId], 10) || 0) : base;
    } else {
      val = parseInt(characterData[attrId] || 0, 10) || 0;
    }
    return val + getAttrMod(attrId);
  }, [characterData, getAttrMod]);

  // Derived Stats Auto-Calculation
  const derivedStats = useMemo(() => {
    const staminaBase = parseInt(characterData['attr-stamina'] || 0, 10);
    const staminaMod = getAttrMod('attr-stamina');
    const stamina = staminaBase + staminaMod;

    // In Tangent, Stamina directly determines base Toughness to reduce wound damage point-for-point
    const toughness = stamina;

    const fortitudeBase = parseInt(characterData['attr-fortitude'] || (staminaBase * 2 + 2), 10);
    const fortitudeMod = getAttrMod('attr-fortitude');
    const fortitude = fortitudeBase + fortitudeMod;

    const wisdomBase = parseInt(characterData['attr-wisdom'] || 0, 10);
    const wisdomMod = getAttrMod('attr-wisdom');
    const wisdom = wisdomBase + wisdomMod;

    const willBase = parseInt(characterData['attr-will'] || (wisdomBase * 2 + 2), 10);
    const willMod = getAttrMod('attr-will');
    const will = willBase + willMod;

    const chaBase = parseInt(characterData['attr-charisma'] || 0, 10);
    const chaMod = getAttrMod('attr-charisma');
    const charisma = chaBase + chaMod;
    // Debt limit in Tangent RPG is Charisma score + 1
    const maxKarmaDebt = Math.max(1, charisma + 1);

    const magicLevel = parseInt(characterData['magic-level'] || 1, 10);

    // Canonical Tangent starting base values: 30 Vitality and 30 Health
    const baseHealth = 30;
    const baseVitality = 30;
    
    // Canonical Tangent starting Karma: 3 points by default
    const baseKarma = 3;

    // Karmic Blessing feature increases maximum Karma Pool by +1 point per rank
    let karmicBlessingBonus = 0;
    const featuresList = Array.isArray(characterData.features) ? characterData.features : [];
    featuresList.forEach(f => {
      const name = (typeof f === 'string' ? f : (f?.name || f?.id || '')).toLowerCase();
      if (name.includes('karmic blessing')) {
        const ranks = typeof f === 'object' && f?.rank ? Math.max(1, parseInt(f.rank, 10) || 1) : 1;
        karmicBlessingBonus += ranks;
      } else if (name.includes('independence') || name.includes('optimistic') || name.includes('persistence') || name.includes('risk-taking')) {
        karmicBlessingBonus += 1;
      }
    });

    // Hindrances such as Unlucky reduce maximum Karma pool
    let hindranceKarmaPenalty = 0;
    const disadvantagesList = Array.isArray(characterData.disadvantages) ? characterData.disadvantages : [];
    disadvantagesList.forEach(d => {
      const name = (typeof d === 'string' ? d : (d?.name || d?.id || '')).toLowerCase();
      if (name.includes('unlucky')) {
        const bp = typeof d === 'object' && d?.bp ? parseInt(d.bp, 10) : 3;
        if (bp >= 9) hindranceKarmaPenalty += 6;
        else if (bp >= 6) hindranceKarmaPenalty += 4;
        else hindranceKarmaPenalty += 2;
      }
    });

    const maxKarma = Math.max(0, baseKarma + karmicBlessingBonus - hindranceKarmaPenalty);

    // Suggested maximum at character creation is 60 each
    const maxAllowed = 60;
    
    const currentHealth = parseInt(characterData['health'], 10);
    const currentVitality = parseInt(characterData['vitality'], 10);

    let purchasedHealth = 0;
    if (!isNaN(currentHealth) && currentHealth > baseHealth) {
      purchasedHealth = currentHealth - baseHealth;
    }

    let purchasedVitality = 0;
    if (!isNaN(currentVitality) && currentVitality > baseVitality) {
      purchasedVitality = currentVitality - baseVitality;
    }

    // Structure is calculated by combining Vitality and Health for non-typical anatomies
    const speciesStr = String(characterData['char-species'] || '').toLowerCase();
    const archetypeStr = String(characterData['char-archetype'] || '').toLowerCase();
    const isSynthetic = speciesStr.includes('synthetic') ||
      speciesStr.includes('mekan') ||
      speciesStr.includes('construct') ||
      speciesStr.includes('golem') ||
      speciesStr.includes('ooze') ||
      speciesStr.includes('undead') ||
      speciesStr.includes('mecha') ||
      speciesStr.includes('elemental') ||
      archetypeStr.includes('synthetic');

    const totalStructure = (isNaN(currentHealth) ? baseHealth : currentHealth) + (isNaN(currentVitality) ? baseVitality : currentVitality);

    const speciesRestProfile = getSpeciesRestProfile(characterData);
    const lightRestsToday = parseInt(characterData.light_rests_today || 0, 10);

    return {
      health: baseHealth,
      vitality: baseVitality,
      maxHealth: isNaN(currentHealth) ? baseHealth : Math.max(baseHealth, currentHealth),
      maxVitality: isNaN(currentVitality) ? baseVitality : Math.max(baseVitality, currentVitality),
      karma: maxKarma,
      maxKarma,
      maxKarmaDebt,
      toughness,
      structure: totalStructure,
      isSynthetic,
      maxAllowed,
      purchasedHealth,
      purchasedVitality,
      speciesRestProfile,
      lightRestsToday,
      maxLightRests: 4
    };

  }, [
    characterData['attr-stamina'],
    characterData['attr-fortitude'],
    characterData['attr-wisdom'],
    characterData['attr-will'],
    characterData['attr-charisma'],
    characterData['char-species'],
    characterData['char-archetype'],
    characterData['magic-level'],
    characterData['health'],
    characterData['vitality'],
    characterData.features,
    characterData.disadvantages,
    getAttrMod
  ]);

  // Automatically keep health/vitality/structure/karma synchronized if unmodified (or below base)
  useEffect(() => {
    setCharacterData(prev => {
      let needsUpdate = false;
      const updates = {};
      
      const currentHealth = parseInt(prev.health, 10);
      if (isNaN(currentHealth) || currentHealth < derivedStats.health) {
        updates.health = derivedStats.health;
        needsUpdate = true;
      }
      
      const currentVitality = parseInt(prev.vitality, 10);
      if (isNaN(currentVitality) || currentVitality < derivedStats.vitality) {
        updates.vitality = derivedStats.vitality;
        needsUpdate = true;
      }

      const currentStructure = parseInt(prev.structure, 10);
      if (isNaN(currentStructure) || currentStructure !== derivedStats.structure) {
        updates.structure = derivedStats.structure;
        needsUpdate = true;
      }
      
      const currentKarma = parseInt(prev.karma, 10);
      if (isNaN(currentKarma)) {
        updates.karma = derivedStats.maxKarma;
        needsUpdate = true;
      }

      const currentPlotPoints = parseInt(prev['plot-points'], 10);
      if (isNaN(currentPlotPoints)) {
        updates['plot-points'] = 0;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  }, [derivedStats.health, derivedStats.vitality, derivedStats.structure, derivedStats.maxKarma]);

  // Roster Management Actions
  const saveCurrentToRoster = useCallback(async () => {
    const user = auth.currentUser;
    const name = characterData['char-name'] || 'Unnamed Operative';
    const docId = characterData['character-doc-id'] || `char_${Date.now()}`;
    const rawData = {
      ...characterData,
      'character-doc-id': docId,
      ownerUid: user ? user.uid : 'local',
      updatedAt: new Date().toISOString()
    };
    const updatedData = attachCreatorTag(rawData, localStorage.getItem('userHandle'), user);

    // Optimistic local update
    setPersonaRoster(prev => {
      const idx = prev.findIndex(c => c['character-doc-id'] === docId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedData;
        return next;
      }
      return [...prev, updatedData];
    });

    if (updatedData.isPublic) {
      setPublicCatalog(prev => {
        const filtered = prev.filter(c => c['character-doc-id'] !== docId);
        return [updatedData, ...filtered];
      });
    }

    updateField('character-doc-id', docId);

    // Persist to Firestore
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, docId);
        await setDoc(docRef, updatedData);
      } catch (err) {
        console.warn('Firestore roster save failed (local update applied):', err.message);
      }
    }
  }, [characterData]);

  const switchRosterCharacter = useCallback((docId) => {
    const found = personaRoster.find(c => c['character-doc-id'] === docId);
    if (found) {
      setCharacterData(found);
      setIsReadOnly(false);
    }
  }, [personaRoster]);

  const togglePersonaVisibility = useCallback(async (docId, targetIsPublic) => {
    const user = auth.currentUser;
    const currentDocId = characterData['character-doc-id'];

    const foundInRoster = personaRoster.find(c => c['character-doc-id'] === docId);
    const baseObj = (currentDocId === docId || !currentDocId) ? characterData : (foundInRoster || {});

    const updated = attachCreatorTag({
      ...baseObj,
      'character-doc-id': docId,
      isPublic: targetIsPublic,
      ownerUid: user ? user.uid : 'local',
      updatedAt: new Date().toISOString()
    }, localStorage.getItem('userHandle'), user);
    
    if (currentDocId === docId || !currentDocId) {
      setCharacterData(updated);
    }

    setPersonaRoster(prev => prev.map(c => {
      if (c['character-doc-id'] === docId) {
        return updated;
      }
      return c;
    }));

    setPublicCatalog(prev => {
      const filtered = prev.filter(c => c['character-doc-id'] !== docId);
      if (targetIsPublic) {
        return [updated, ...filtered];
      }
      return filtered;
    });

    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, docId);
        await setDoc(docRef, updated);
      } catch (err) {
        console.warn('Failed to update persona visibility in cloud:', err);
      }
    }
  }, [characterData, personaRoster]);

  const clonePublicPersona = useCallback(() => {
    const user = auth.currentUser;
    const name = characterData['char-name'] || 'Cloned Operative';
    const newDocId = `char_${Date.now()}`;
    const rawCloned = {
      ...characterData,
      'character-doc-id': newDocId,
      'char-name': `${name} (Copy)`,
      isPublic: false,
      ownerUid: user ? user.uid : 'local',
      updatedAt: new Date().toISOString()
    };
    const cloned = attachCreatorTag(rawCloned, localStorage.getItem('userHandle'), user);

    setCharacterData(cloned);
    setIsReadOnly(false);

    if (window.history.replaceState) {
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }

    // Save cloned character to local roster & cloud
    saveCurrentToRoster();
    alert(`Successfully cloned "${name}" to your local operative roster!`);
  }, [characterData, saveCurrentToRoster]);

  const loadPublicPersonas = useCallback(async () => {
    let cloudPublicItems = [];
    try {
      const q = query(collectionGroup(db, 'personas'), where('isPublic', '==', true));
      const snap = await getDocs(q);
      cloudPublicItems = snap.docs.map(d => {
        const data = d.data();
        const pathSegments = d.ref.path.split('/');
        const ownerUid = pathSegments[1] || data.ownerUid || '';
        return {
          ...data,
          'character-doc-id': d.id,
          ownerUid
        };
      });
    } catch (err) {
      console.warn('Failed to load public personas via collectionGroup query:', err);
    }

    const localPublic = personaRoster.filter(c => c.isPublic === true);
    const map = new Map(cloudPublicItems.map(item => [item['character-doc-id'], item]));
    localPublic.forEach(item => {
      if (!map.has(item['character-doc-id'])) {
        map.set(item['character-doc-id'], item);
      }
    });

    const merged = Array.from(map.values());
    setPublicCatalog(merged);
    return merged;
  }, [personaRoster]);

  const deleteRosterCharacter = useCallback(async (docId) => {
    const targetId = docId || characterData['character-doc-id'];
    
    // Clear any pending debounced auto-save timer immediately
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (!targetId) {
      const resetChar = {
        ...DEFAULT_CHARACTER,
        'character-doc-id': `char_${Date.now()}`
      };
      characterDataRef.current = resetChar;
      setCharacterData(resetChar);
      StorageService.removeItem('personaFolioData');
      sessionStorage.removeItem('personaFolioData');
      localStorage.removeItem('personaFolioData');
      setIsReadOnly(false);
      return;
    }

    // Persist to tombstones immediately so no background query or cache restores it
    addFolioTombstone(targetId);

    // 1. Filter out from personaRoster state & StorageService/localStorage caches
    const updatedRoster = personaRoster.filter(c => c['character-doc-id'] !== targetId);
    setPersonaRoster(updatedRoster);
    StorageService.setItem('personaRoster', updatedRoster);
    try {
      localStorage.setItem('personaRoster', JSON.stringify(updatedRoster));
    } catch (e) {}

    // 2. Filter out from publicCatalog state
    setPublicCatalog(prev => prev.filter(c => c['character-doc-id'] !== targetId));

    // 3. Reset or switch characterData if the active character is being deleted
    if (characterData['character-doc-id'] === targetId) {
      if (updatedRoster.length > 0) {
        const nextChar = updatedRoster[0];
        characterDataRef.current = nextChar;
        setCharacterData(nextChar);
        StorageService.setItem('personaFolioData', nextChar);
        try {
          sessionStorage.setItem('personaFolioData', JSON.stringify(nextChar));
          localStorage.setItem('personaFolioData', JSON.stringify(nextChar));
        } catch (e) {}
      } else {
        const resetChar = {
          ...DEFAULT_CHARACTER,
          'character-doc-id': `char_${Date.now()}`
        };
        characterDataRef.current = resetChar;
        setCharacterData(resetChar);
        StorageService.removeItem('personaFolioData');
        sessionStorage.removeItem('personaFolioData');
        localStorage.removeItem('personaFolioData');
      }
      setIsReadOnly(false);
    }

    // 4. Delete document from Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, targetId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('Firestore delete failed (local removal applied):', err.message);
      }
    }
  }, [characterData, personaRoster]);

  const duplicateRosterCharacter = useCallback(async (docId) => {
    const found = personaRoster.find(c => c['character-doc-id'] === docId);
    if (found) {
      const newDocId = `char_${Date.now()}`;
      const clone = {
        ...found,
        'character-doc-id': newDocId,
        'char-name': `${found['char-name'] || 'Unnamed'} (Copy)`,
        updatedAt: new Date().toISOString()
      };
      // Optimistic local add
      const updatedRoster = [...personaRoster, clone];
      setPersonaRoster(updatedRoster);
      StorageService.setItem('personaRoster', updatedRoster);
      try {
        localStorage.setItem('personaRoster', JSON.stringify(updatedRoster));
      } catch (e) {}

      // Persist duplicate to Firestore
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, `users/${user.uid}/personas`, newDocId);
          await setDoc(docRef, clone);
        } catch (err) {
          console.warn('Firestore duplicate save failed (local add applied):', err.message);
        }
      }
    }
  }, [personaRoster]);

  // Sync to StorageService, localStorage, and sessionStorage on state change
  useEffect(() => {
    const docId = characterData?.['character-doc-id'];
    if (docId && isFolioPersonaDeleted(docId)) {
      return;
    }

    StorageService.setItem('personaFolioData', characterData);
    try {
      sessionStorage.setItem('personaFolioData', JSON.stringify(characterData));
      localStorage.setItem('personaFolioData', JSON.stringify(characterData));
    } catch (e) {}

    // Auto-sync active character updates into personaRoster and trigger debounced cloud save
    if (docId) {
      setPersonaRoster(prev => {
        const idx = prev.findIndex(c => c['character-doc-id'] === docId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = characterData;
          StorageService.setItem('personaRoster', next);
          try {
            localStorage.setItem('personaRoster', JSON.stringify(next));
          } catch (e) {}
          return next;
        }
        return prev;
      });
      triggerSave(false);
    }
  }, [characterData, triggerSave]);

  // Active Game State Evaluation
  const isInActiveGame = useMemo(() => {
    if (activeGameOverride !== null) return activeGameOverride;
    return Boolean(characterData?.inActiveGame || characterData?.activeGameSession || characterData?.activeGameId);
  }, [characterData?.inActiveGame, characterData?.activeGameSession, characterData?.activeGameId, activeGameOverride]);

  const activeGameSession = useMemo(() => {
    if (!isInActiveGame) return null;
    return {
      inActiveGame: true,
      gameName: characterData?.activeGameName || 'VTT Tactical Campaign',
      squadName: characterData?.activeSquadName || 'Active Fireteam',
      gmHandle: characterData?.activeGameGM || 'Game Master',
      sessionStartedAt: characterData?.activeGameStartedAt || characterData?.updatedAt || new Date().toISOString()
    };
  }, [isInActiveGame, characterData]);

  // Set / Toggle active game state
  const setInActiveGame = useCallback((inGame, details = {}) => {
    const isEngaged = Boolean(inGame);
    setActiveGameOverride(isEngaged);
    setCharacterData(prev => {
      const updated = {
        ...prev,
        inActiveGame: isEngaged,
        activeGameName: isEngaged ? (details.gameName || details.name || prev.activeGameName || 'VTT Tactical Campaign') : '',
        activeSquadName: isEngaged ? (details.squadName || prev.activeSquadName || 'Active Fireteam') : '',
        activeGameGM: isEngaged ? (details.gmHandle || details.gm || prev.activeGameGM || 'Game Master') : '',
        activeGameStartedAt: isEngaged ? (details.startedAt || prev.activeGameStartedAt || new Date().toISOString()) : '',
        updatedAt: new Date().toISOString()
      };
      return updated;
    });

    setPersonaRoster(prev => prev.map(c => {
      if (c['character-doc-id'] === characterData['character-doc-id']) {
        return {
          ...c,
          inActiveGame: isEngaged,
          activeGameName: isEngaged ? (details.gameName || details.name || c.activeGameName || 'VTT Tactical Campaign') : '',
          activeSquadName: isEngaged ? (details.squadName || c.activeSquadName || 'Active Fireteam') : '',
          activeGameGM: isEngaged ? (details.gmHandle || details.gm || c.activeGameGM || 'Game Master') : '',
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
  }, [characterData]);

  const toggleActiveGameLock = useCallback((details = {}) => {
    setInActiveGame(!isInActiveGame, details);
  }, [isInActiveGame, setInActiveGame]);

  // List of protected game statistics
  const isProtectedGameStat = useCallback((key) => {
    if (!key || typeof key !== 'string') return false;
    if (key.startsWith('attr-')) return true;
    if (key.startsWith('skill-') && (key.endsWith('-rank') || key.endsWith('-base') || key.endsWith('-mod'))) return true;
    if (['starting-cp', 'health', 'vitality', 'structure', 'magic-level', 'tech-level'].includes(key)) return true;
    if (['char-species', 'char-archetype'].includes(key)) return true;
    return false;
  }, []);

  // GM Confirmed update to alter statistics during active game
  const applyGMConfirmedUpdate = useCallback((key, value, reason = 'GM Confirmed Adjustment') => {
    const oldVal = characterDataRef.current?.[key];
    const logEntry = {
      timestamp: new Date().toISOString(),
      field: key,
      oldValue: oldVal,
      newValue: value,
      reason
    };

    setCharacterData(prev => {
      const existingLogs = Array.isArray(prev.gm_audit_log) ? prev.gm_audit_log : [];
      return {
        ...prev,
        [key]: value,
        gm_audit_log: [logEntry, ...existingLogs.slice(0, 49)],
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  // Field updater with primary attribute auto-sync to sub-attributes & Active Game Lockdown
  const updateField = useCallback((key, value) => {
    // If character is in an active game session and the field is a protected game stat without GM confirmation
    if (isInActiveGame && !isGMConfirmed && isProtectedGameStat(key)) {
      console.warn(`[Folio Integrity Lock]: Cannot alter game statistic "${key}" while persona is in an active game without GM confirmation.`);
      alert(`🔒 ACTIVE GAME INTEGRITY LOCK: Game statistic "${key}" cannot be altered while the persona is in an active game session.\n\nTo modify game statistics, apply changes via GM Experience (AP) awards, Karma adjustments, VTT Combat Vitals, or request a GM confirmed override.`);
      return;
    }

    // If updating identity selection (species, archetype, occupation, origin, faction), automatically transition traits & modifications
    if (['char-species', 'char-archetype', 'char-occu', 'char-origin', 'char-faction'].includes(key)) {
      setCharacterData((prev) => applyIdentityFieldTransition(prev, key, value, dbData));
      return;
    }

    // If updating a skill rank, clamp max to 20
    if (typeof key === 'string' && key.startsWith('skill-') && key.endsWith('-rank')) {
      const clampedVal = Math.min(20, Math.max(0, parseInt(value, 10) || 0));
      setCharacterData((prev) => ({
        ...prev,
        [key]: clampedVal
      }));
      return;
    }

    // If updating a primary attribute, automatically shift the base of its paired sub-attribute
    if (PRIMARY_TO_SUB_ATTR[key]) {
      const subKey = PRIMARY_TO_SUB_ATTR[key];
      const newPrimaryVal = parseInt(value, 10) || 0;
      setCharacterData((prev) => {
        const oldPrimaryVal = parseInt(prev[key] || 0, 10);
        const oldBase = (oldPrimaryVal * 2) + 2;
        const newBase = (newPrimaryVal * 2) + 2;
        const hasExplicitSub = prev[subKey] !== undefined && prev[subKey] !== null && prev[subKey] !== '';
        const currentSubVal = hasExplicitSub ? parseInt(prev[subKey], 10) : oldBase;
        const delta = currentSubVal - oldBase;
        const newSubVal = newBase + delta;

        return {
          ...prev,
          [key]: newPrimaryVal,
          [subKey]: newSubVal
        };
      });
      return;
    }

    setCharacterData((prev) => ({
      ...prev,
      [key]: value
    }));
  }, [isInActiveGame, isGMConfirmed, isProtectedGameStat, dbData]);

  // 80 CP Archetype Pre-build Application Engine
  const applyArchetypeChassis = useCallback((archetypeInput) => {
    if (!archetypeInput) return;
    setCharacterData(prev => applyArchetypeTransition(prev, archetypeInput, dbData, { applyPreBuild: true }));
  }, [dbData]);

  // Full Species Adjustments Application Engine
  const applySpeciesAdjustments = useCallback((speciesInput) => {
    if (!speciesInput) return;
    setCharacterData(prev => applySpeciesTransition(prev, speciesInput, dbData));
  }, [dbData]);

  // Full Occupation Adjustments Application Engine
  const applyOccupationAdjustments = useCallback((occupationInput) => {
    if (!occupationInput) return;
    setCharacterData(prev => applyOccupationTransition(prev, occupationInput, dbData));
  }, [dbData]);

  // Full Origin Adjustments Application Engine
  const applyOriginAdjustments = useCallback((originInput) => {
    if (!originInput) return;
    setCharacterData(prev => applyOriginTransition(prev, originInput, dbData));
  }, [dbData]);

  // Full Faction Adjustments Application Engine
  const applyFactionAdjustments = useCallback((factionInput) => {
    if (!factionInput) return;
    setCharacterData(prev => applyFactionTransition(prev, factionInput, dbData));
  }, [dbData]);

  // Universal Identity Selection Transition Engine
  const applyIdentitySelection = useCallback((fieldKey, itemValue, options = {}) => {
    setCharacterData(prev => applyIdentityFieldTransition(prev, fieldKey, itemValue, dbData, options));
  }, [dbData]);

  // Identity Pool Allocation Helpers (Skills, Features, Attributes)
  const allocatePoolSkillRank = useCallback((poolKey, skillName, newRank, delta, maxSP = 20) => {
    if (!skillName || !poolKey) return;
    const cleanId = skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const rankKey = `skill-${cleanId}-rank`;
    const nameKey = `skill-${cleanId}-name`;

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, features: [] };
      const currentSkills = { ...(pool.skills || {}) };
      const currentRankInPool = parseInt(currentSkills[skillName] || 0, 10);
      const targetRankInPool = Math.max(0, parseInt(newRank, 10) || 0);
      const actualDelta = targetRankInPool - currentRankInPool;

      if (targetRankInPool > 0) {
        currentSkills[skillName] = targetRankInPool;
      } else {
        delete currentSkills[skillName];
      }

      const currentGlobalRank = parseInt(prev[rankKey] || 0, 10);
      const newGlobalRank = Math.min(20, Math.max(0, currentGlobalRank + actualDelta));

      return {
        ...prev,
        [poolKey]: {
          ...pool,
          skills: currentSkills
        },
        [rankKey]: newGlobalRank,
        [nameKey]: prev[nameKey] || skillName
      };
    });
  }, []);

  const togglePoolTrait = useCallback((poolKey, traitName, traitDetail = {}, maxTraits = 2) => {
    if (!traitName || !poolKey) return;
    const cleanTitle = normalizeTraitName(traitName);

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentTraits = [...(pool.traits || [])];
      const isAlreadySelected = currentTraits.some(t => normalizeTraitName(t).toLowerCase() === cleanTitle.toLowerCase() || String(t).toLowerCase() === traitName.toLowerCase());

      let updatedPoolTraits;
      let updatedGlobalTraits = Array.isArray(prev.traits) ? [...prev.traits] : [];

      if (isAlreadySelected) {
        updatedPoolTraits = currentTraits.filter(t => normalizeTraitName(t).toLowerCase() !== cleanTitle.toLowerCase() && String(t).toLowerCase() !== traitName.toLowerCase());
        updatedGlobalTraits = updatedGlobalTraits.filter(t => {
          const tName = typeof t === 'object' ? (t.name || t.title || t.id) : String(t);
          return normalizeTraitName(tName).toLowerCase() !== cleanTitle.toLowerCase() && tName.toLowerCase() !== traitName.toLowerCase();
        });
      } else {
        if (currentTraits.length >= maxTraits) {
          alert(`Maximum of ${maxTraits} traits already selected in this pool.`);
          return prev;
        }
        updatedPoolTraits = [...currentTraits, cleanTitle];
        const newTraitObj = {
          id: traitDetail.id || `trait_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: cleanTitle,
          category: traitDetail.category || traitDetail.trait_type || (poolKey === 'originAllocations' ? 'Origin Trait' : poolKey === 'occuAllocations' ? 'Occupation Trait' : 'Species Trait'),
          trait_type: traitDetail.trait_type || (poolKey === 'originAllocations' ? 'Origin Trait' : poolKey === 'occuAllocations' ? 'Occupational Trait' : 'Species Trait'),
          trait_tier: traitDetail.trait_tier || traitDetail.tier || 'Basic',
          classification: traitDetail.classification || 'Physical',
          source: poolKey.replace('Allocations', ''),
          description: traitDetail.description || traitDetail.desc || traitDetail.mechanics || '',
          bp: traitDetail.bp !== undefined ? traitDetail.bp : 1
        };
        updatedGlobalTraits.push(newTraitObj);
      }

      return {
        ...prev,
        [poolKey]: {
          ...pool,
          traits: updatedPoolTraits
        },
        traits: updatedGlobalTraits
      };
    });
  }, []);

  const removePoolTrait = useCallback((poolKey, traitName) => {
    if (!traitName || !poolKey) return;
    const cleanTitle = normalizeTraitName(traitName);

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentTraits = Array.isArray(pool.traits) ? pool.traits : [];
      const updatedPoolTraits = currentTraits.filter(t => normalizeTraitName(t).toLowerCase() !== cleanTitle.toLowerCase() && String(t).toLowerCase() !== traitName.toLowerCase());
      
      const currentGlobalTraits = Array.isArray(prev.traits) ? prev.traits : [];
      const updatedGlobalTraits = currentGlobalTraits.filter(t => {
        const tName = typeof t === 'object' ? (t.name || t.title || t.id) : String(t);
        return normalizeTraitName(tName).toLowerCase() !== cleanTitle.toLowerCase() && tName.toLowerCase() !== traitName.toLowerCase();
      });

      return {
        ...prev,
        [poolKey]: {
          ...pool,
          traits: updatedPoolTraits
        },
        traits: updatedGlobalTraits
      };
    });
  }, []);

  const togglePoolFeature = useCallback((poolKey, featureName, featureDetail = {}, maxFeatures = 2) => {
    if (!featureName || !poolKey) return;
    const cleanTitle = normalizeTraitName(featureName);

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentFeats = [...(pool.features || [])];
      const isAlreadySelected = currentFeats.some(f => normalizeTraitName(f).toLowerCase() === cleanTitle.toLowerCase() || String(f).toLowerCase() === featureName.toLowerCase());

      let updatedPoolFeats;
      let updatedGlobalFeats = Array.isArray(prev.features) ? [...prev.features] : [];

      if (isAlreadySelected) {
        updatedPoolFeats = currentFeats.filter(f => normalizeTraitName(f).toLowerCase() !== cleanTitle.toLowerCase() && String(f).toLowerCase() !== featureName.toLowerCase());
        updatedGlobalFeats = updatedGlobalFeats.filter(f => {
          const fName = typeof f === 'object' ? (f.name || f.title || f.id) : String(f);
          return normalizeTraitName(fName).toLowerCase() !== cleanTitle.toLowerCase() && fName.toLowerCase() !== featureName.toLowerCase();
        });
      } else {
        if (currentFeats.length >= maxFeatures) {
          alert(`Maximum of ${maxFeatures} features already selected in this pool.`);
          return prev;
        }
        updatedPoolFeats = [...currentFeats, cleanTitle];
        const newFeatObj = {
          id: featureDetail.id || `feat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: cleanTitle,
          category: featureDetail.category || (poolKey === 'factionAllocations' ? 'Faction Feature' : poolKey === 'speciesAllocations' ? 'Species Feature' : 'General Feature'),
          source: poolKey.replace('Allocations', ''),
          description: featureDetail.description || featureDetail.mechanic || '',
          cp: featureDetail.cp !== undefined ? featureDetail.cp : 3
        };
        updatedGlobalFeats.push(newFeatObj);
      }

      return {
        ...prev,
        [poolKey]: {
          ...pool,
          features: updatedPoolFeats
        },
        features: updatedGlobalFeats
      };
    });
  }, []);

  const removePoolFeature = useCallback((poolKey, featureName) => {
    if (!featureName || !poolKey) return;
    const cleanTitle = normalizeTraitName(featureName);

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentFeats = Array.isArray(pool.features) ? pool.features : [];
      const updatedPoolFeats = currentFeats.filter(f => normalizeTraitName(f).toLowerCase() !== cleanTitle.toLowerCase() && String(f).toLowerCase() !== featureName.toLowerCase());
      
      const currentGlobalFeats = Array.isArray(prev.features) ? prev.features : [];
      const updatedGlobalFeats = currentGlobalFeats.filter(f => {
        const fName = typeof f === 'object' ? (f.name || f.title || f.id) : String(f);
        return normalizeTraitName(fName).toLowerCase() !== cleanTitle.toLowerCase() && fName.toLowerCase() !== featureName.toLowerCase();
      });

      return {
        ...prev,
        [poolKey]: {
          ...pool,
          features: updatedPoolFeats
        },
        features: updatedGlobalFeats
      };
    });
  }, []);

  const allocatePoolAttribute = useCallback((poolKey, attrId, delta, maxPoints = 1) => {
    if (!attrId || !poolKey) return;
    const cleanAttrKey = attrId.startsWith('attr-') ? attrId : `attr-${attrId.toLowerCase()}`;

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, features: [], attributes: {} };
      const currentAttrs = { ...(pool.attributes || {}) };
      const currentValInPool = parseInt(currentAttrs[cleanAttrKey] || 0, 10);
      const totalSpent = Object.values(currentAttrs).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);

      if (delta > 0 && totalSpent >= maxPoints) {
        alert(`All ${maxPoints} bonus attribute points in this pool have already been assigned.`);
        return prev;
      }
      if (delta < 0 && currentValInPool <= 0) {
        return prev;
      }

      const newValInPool = currentValInPool + delta;
      if (newValInPool > 0) {
        currentAttrs[cleanAttrKey] = newValInPool;
      } else {
        delete currentAttrs[cleanAttrKey];
      }

      const currentGlobalVal = parseInt(prev[cleanAttrKey] || 0, 10);
      const newGlobalVal = Math.max(0, currentGlobalVal + delta);

      let subUpdates = {};
      if (PRIMARY_TO_SUB_ATTR[cleanAttrKey]) {
        const subKey = PRIMARY_TO_SUB_ATTR[cleanAttrKey];
        const oldBase = (currentGlobalVal * 2) + 2;
        const newBase = (newGlobalVal * 2) + 2;
        const hasExplicitSub = prev[subKey] !== undefined && prev[subKey] !== null && prev[subKey] !== '';
        const currentSubVal = hasExplicitSub ? parseInt(prev[subKey], 10) : oldBase;
        const subDelta = currentSubVal - oldBase;
        subUpdates[subKey] = newBase + subDelta;
      }

      return {
        ...prev,
        [poolKey]: {
          ...pool,
          attributes: currentAttrs
        },
        [cleanAttrKey]: newGlobalVal,
        ...subUpdates
      };
    });
  }, []);

  // Add Item Handler
  // Add Item Handler
  const handleAddItem = useCallback((key, item) => {
    setCharacterData((prev) => {
      const currentList = Array.isArray(prev[key]) ? prev[key] : [];
      return {
        ...prev,
        [key]: [...currentList, item]
      };
    });
  }, []);

  // Omnicortex DBM Cross-Module Item Importer: Add Item to Inventory
  const addItemToInventory = useCallback((item) => {
    if (!item || !item.name) return;
    const rawCat = (item.category || item.categoryKey || 'gear').toLowerCase();
    
    let targetKey = 'gear';
    if (['weapons', 'weaponry', 'weapon', 'guns', 'melee'].includes(rawCat)) {
      targetKey = 'weapons';
    } else if (['armor', 'armoring', 'defenses', 'shields'].includes(rawCat)) {
      targetKey = 'armoring';
    } else if (['mecha', 'vehicle', 'vehicles', 'starship'].includes(rawCat)) {
      targetKey = 'mecha';
    } else if (['other', 'misc'].includes(rawCat)) {
      targetKey = 'other';
    } else {
      targetKey = 'gear';
    }

    const cpCost = parseInt(item.cpCost ?? item.cp ?? item.cost_cp ?? 0, 10) || 0;
    const normalizedItem = {
      id: item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: item.name,
      category: targetKey,
      damage: item.damage || '',
      score: item.score || item.attack || '',
      armor: item.armor || item.resistance || 0,
      resistance: item.resistance || item.armor || '',
      weight: item.weight || item.wt || 1,
      techLevel: item.techLevel || item.tl || 1,
      cp: cpCost,
      cost: cpCost,
      description: item.description || item.notes || '',
      notes: item.notes || item.description || '',
      ...item
    };

    setCharacterData(prev => {
      const currentList = Array.isArray(prev[targetKey]) ? [...prev[targetKey]] : [];
      currentList.push(normalizedItem);

      const updates = { [targetKey]: currentList };

      // If weapon has damage, also register in attacks list if not already present
      if (targetKey === 'weapons' || normalizedItem.damage) {
        const currentAttacks = Array.isArray(prev.attacks) ? [...prev.attacks] : [];
        const alreadyInAttacks = currentAttacks.some(a => (a.name || '').toLowerCase() === normalizedItem.name.toLowerCase());
        if (!alreadyInAttacks) {
          currentAttacks.push({
            id: `atk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: normalizedItem.name,
            score: normalizedItem.score || '+0',
            damage: normalizedItem.damage || '1d10',
            type: normalizedItem.type || 'Physical',
            notes: `TL ${normalizedItem.techLevel || 1}${normalizedItem.notes ? ` • ${normalizedItem.notes}` : ''}`
          });
          updates.attacks = currentAttacks;
        }
      }

      // If armor has resistance, also register in armor array if not already present
      if (targetKey === 'armoring' || targetKey === 'armor' || normalizedItem.armor || normalizedItem.resistance) {
        const currentArmorList = Array.isArray(prev.armor) ? [...prev.armor] : [];
        const alreadyInArmor = currentArmorList.some(a => (a.name || '').toLowerCase() === normalizedItem.name.toLowerCase());
        if (!alreadyInArmor) {
          currentArmorList.push({
            name: normalizedItem.name,
            resistance: String(normalizedItem.armor || normalizedItem.resistance || '0'),
            type: normalizedItem.type || 'Standard',
            notes: `TL ${normalizedItem.techLevel || 1}`
          });
          updates.armor = currentArmorList;
        }
      }

      return {
        ...prev,
        ...updates
      };
    });
  }, []);

  // Omnicortex DBM Cross-Module Power Importer: Add Ability / Power
  const addAbility = useCallback((ability) => {
    if (!ability || !ability.name) return;
    const rawType = (ability.type || ability.category || ability.categoryKey || 'special_abilities').toLowerCase();
    
    let targetKey = 'special_abilities';
    if (['psionics', 'psionic', 'psi', 'invocations', 'invocation', 'magic', 'spells'].includes(rawType)) {
      targetKey = 'invocations';
    } else if (['cybernetics', 'cyberware', 'augmentations', 'augmentation', 'bioware'].includes(rawType)) {
      targetKey = 'augmentations';
    } else if (['awakened', 'discipline', 'disciplines'].includes(rawType)) {
      targetKey = 'awakened';
    } else if (['features', 'feature', 'perks', 'perk', 'traits', 'trait'].includes(rawType)) {
      targetKey = 'features';
    } else {
      targetKey = 'special_abilities';
    }

    const cpCost = parseInt(ability.cpCost ?? ability.cp ?? ability.cost_cp ?? 5, 10) || 0;
    const normalizedAbility = {
      id: ability.id || `power_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: ability.name,
      type: targetKey,
      metaLevel: ability.metaLevel || ability.level || ability.ml || 1,
      apCost: ability.apCost || ability.ap || 2,
      damage: ability.damage || '',
      description: ability.description || ability.notes || '',
      cp: cpCost,
      cost: cpCost,
      ...ability
    };

    setCharacterData(prev => {
      const currentList = Array.isArray(prev[targetKey]) ? [...prev[targetKey]] : [];
      currentList.push(normalizedAbility);
      return {
        ...prev,
        [targetKey]: currentList
      };
    });
  }, []);


  // Update Item Handler (by index)
  const handleUpdateItem = useCallback((key, index, item) => {
    setCharacterData((prev) => {
      const currentList = Array.isArray(prev[key]) ? [...prev[key]] : [];
      if (index >= 0 && index < currentList.length) {
        currentList[index] = item;
      } else {
        currentList.push(item);
      }
      return {
        ...prev,
        [key]: currentList
      };
    });
  }, []);

  // Add Custom Skill Handler (max level 20)
  const handleAddSkill = useCallback((skill) => {
    const rankVal = Math.min(20, Math.max(0, parseInt(skill.rank ?? 1, 10)));
    setCharacterData((prev) => ({
      ...prev,
      [`skill-${skill.id}-name`]: skill.name,
      [`skill-${skill.id}-rank`]: rankVal,
      [`skill-${skill.id}-base`]: skill.baseAttr,
      [`skill-${skill.id}-group`]: skill.group,
      [`skill-${skill.id}-subcategory`]: skill.subcategory || 'General'
    }));
  }, []);

  // Delete Custom Skill Handler
  const handleDeleteSkill = useCallback((skillId) => {
    setCharacterData((prev) => {
      const next = { ...prev };
      delete next[`skill-${skillId}-rank`];
      delete next[`skill-${skillId}-base`];
      delete next[`skill-${skillId}-mod`];
      delete next[`skill-${skillId}-name`];
      delete next[`skill-${skillId}-group`];
      delete next[`skill-${skillId}-subcategory`];
      if (Array.isArray(next.specializations)) {
        next.specializations = next.specializations.filter(s => s.baseSkillId !== skillId);
      }
      return next;
    });
  }, []);

  // Specialization Handlers (max level 10)
  const handleAddSpecialization = useCallback((spec) => {
    const rankVal = Math.min(10, Math.max(0, parseInt(spec.rank ?? 1, 10)));
    const newSpec = {
      id: spec.id || `spec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: spec.name || 'New Specialization',
      baseSkillId: spec.baseSkillId || '',
      rank: rankVal,
      mod: parseInt(spec.mod || 0, 10),
      category: spec.category || ''
    };
    setCharacterData((prev) => {
      const current = Array.isArray(prev.specializations) ? prev.specializations : [];
      return {
        ...prev,
        specializations: [...current, newSpec]
      };
    });
  }, []);

  // Specialization Handlers (max level 10)
  const handleUpdateSpecialization = useCallback((specId, field, value) => {
    setCharacterData((prev) => {
      const current = Array.isArray(prev.specializations) ? prev.specializations : [];
      return {
        ...prev,
        specializations: current.map((s) => {
          if (s.id === specId) {
            let updatedVal = value;
            if (field === 'rank') {
              updatedVal = Math.min(10, Math.max(0, parseInt(value, 10) || 0));
            } else if (field === 'mod') {
              updatedVal = parseInt(value, 10) || 0;
            }
            return { ...s, [field]: updatedVal };
          }
          return s;
        })
      };
    });
  }, []);

  const handleDeleteSpecialization = useCallback((specId) => {
    setCharacterData((prev) => {
      const current = Array.isArray(prev.specializations) ? prev.specializations : [];
      return {
        ...prev,
        specializations: current.filter((s) => s.id !== specId)
      };
    });
  }, []);

  // Reset / New Character
  const handleNewCharacter = useCallback(() => {
    const newName = window.prompt("Enter character name:", "Unnamed Operative");
    if (newName === null) return;
    const user = auth.currentUser;
    const raw = {
      ...DEFAULT_CHARACTER,
      'char-name': newName || 'Unnamed Operative',
      'character-doc-id': `char_${Date.now()}`
    };
    const newChar = attachCreatorTag(raw, localStorage.getItem('userHandle'), user);
    setCharacterData(newChar);
    StorageService.removeItem('personaFolioData');
    sessionStorage.removeItem('personaFolioData');
  }, []);

  // Local Save JSON
  const handleSaveLocal = () => {
    const name = characterData['char-name'] || 'persona_folio';
    const fileName = `${name.replace(/\s+/g, '_')}_Persona.json`;
    const dataStr = JSON.stringify(characterData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Local Load JSON (Supports native Folio JSON and Story Foundry Story Elements)
  const handleLoadLocal = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let rawData = JSON.parse(e.target.result);
        if (isStoryElementData(rawData)) {
          rawData = convertPersonaElementToFolio(rawData);
        }
        const validatedData = characterSchema.parse(rawData);
        setCharacterData(validatedData);
      } catch (err) {
        if (err?.name === 'ZodError') {
          const errorMsgs = err.issues.map(issue => `${issue.path.join('.') || 'root'}: ${issue.message}`).join('\n');
          alert(`Invalid persona folio JSON file:\n\n${errorMsgs}`);
        } else {
          alert('Invalid persona folio JSON file. Please ensure it is valid JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  // Export as Story Foundry Persona Element JSON
  const handleExportAsStoryElement = () => {
    exportStoryElementJSON(characterData);
  };


  const applyGuidedCharacter = (draftData) => {
    try {
      const validatedData = characterSchema.parse(draftData);
      setCharacterData(validatedData);
      return true;
    } catch (err) {
      console.error("Invalid guided character data:", err);
      if (err?.name === 'ZodError') {
        const errorMsgs = err.issues.map(issue => `${issue.path.join('.') || 'root'}: ${issue.message}`).join('\n');
        alert(`Failed to apply generated character. Validation errors:\n\n${errorMsgs}`);
      } else {
        alert("Failed to apply generated character. Check console for details.");
      }
      return false;
    }
  };

  // Firestore Load Persona from Cloud
  const handleLoadCloud = async (docId) => {
    const user = auth.currentUser;
    const userId = user ? user.uid : 'anonymous';
    try {
      const docRef = doc(db, `users/${userId}/personas`, docId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = characterSchema.parse(snapshot.data());
        setCharacterData(data);
        alert(`Loaded persona "${data['char-name'] || docId}" from cloud.`);
      } else {
        alert('Persona document not found in cloud storage.');
      }
    } catch (err) {
      console.error('Error loading persona from cloud:', err);
      alert(`Cloud Load failed: ${err.message}`);
    }
  };

  // Comprehensive Character Point & Pool Economy Calculation
  const economyBreakdown = useMemo(() => {
    const startingCP = parseInt(characterData['starting-cp'] || 150, 10);
    const itemizedList = [];

    // Helper for safe CP extraction
    const getItemCP = (item, defaultCost = 0) => {
      if (typeof item === 'object' && item !== null) {
        if (item.cp !== undefined && item.cp !== null && item.cp !== '') {
          return parseInt(item.cp, 10) || 0;
        }
        if (item.cost !== undefined && item.cost !== null && item.cost !== '') {
          return parseInt(item.cost, 10) || 0;
        }
        if (item.cost_cp !== undefined && item.cost_cp !== null && item.cost_cp !== '') {
          return parseInt(item.cost_cp, 10) || 0;
        }
      }
      if (typeof item === 'number') return item;
      return defaultCost;
    };

    // 1. Identity Selections (Species, Occupation, Origin, Faction, Archetype)
    let identityCost = 0;
    let speciesCostBreakdown = null;

    // Species Package
    const speciesRaw = characterData['char-species'];
    if (speciesRaw) {
      const spCost = calculateFullSpeciesCost(speciesRaw, dbData);
      speciesCostBreakdown = spCost;
      identityCost += spCost.totalCost;
      itemizedList.push({
        category: 'Species Package',
        item: spCost.speciesName || String(speciesRaw),
        val: spCost.summaryText || `${spCost.totalCost} CP Package`,
        costVal: spCost.totalCost,
        cost: `${spCost.totalCost} CP`,
        breakdown: spCost.breakdown,
        itemized: spCost.itemized
      });
    } else {
      itemizedList.push({
        category: 'Species Package',
        item: 'None Selected',
        val: '0 CP Baseline',
        costVal: 0,
        cost: '0 CP'
      });
    }

    // Other Identity selections (Archetype, Occupation, Origin, Faction)
    const otherIdentities = [
      { key: 'char-archetype', label: 'Archetype', defaultVal: 'Archetype Chassis (80 CP Blueprint)' },
      { key: 'char-occu', label: 'Occupation', defaultVal: 'Career Package (20 SP Pool)' },
      { key: 'char-origin', label: 'Origin', defaultVal: 'Homeworld Package (20 SP Pool)' },
      { key: 'char-faction', label: 'Faction', defaultVal: 'Allegiance Package (20 SP Pool)' }
    ];

    otherIdentities.forEach(({ key, label, defaultVal }) => {
      const val = characterData[key];
      const name = typeof val === 'object' ? (val.name || val.title || '') : String(val || '');
      const cost = val ? getItemCP(val, 0) : 0;
      identityCost += cost;
      itemizedList.push({
        category: label,
        item: name || 'None Selected',
        val: name ? (typeof val === 'object' && val.summary ? val.summary : defaultVal) : 'Optional Selection',
        costVal: cost,
        cost: `${cost} CP`
      });
    });

    // Secondary Origin & Occupation if present
    const secOrigin = characterData['char-secondary-origin'] || characterData['char-origin-secondary'];
    if (secOrigin) {
      itemizedList.push({
        category: 'Secondary Origin',
        item: String(secOrigin),
        val: 'Expanded Homeworld Heritage (0 CP)',
        costVal: 0,
        cost: '0 CP'
      });
    }
    const secOccu = characterData['char-secondary-occu'] || characterData['char-background-occu'] || characterData['char-occu-secondary'];
    if (secOccu) {
      itemizedList.push({
        category: 'Secondary Occupation',
        item: String(secOccu),
        val: 'Dual Career Background (0 CP)',
        costVal: 0,
        cost: '0 CP'
      });
    }

    // 2. Primary Attributes & Species Granted Attribute Modifiers
    let primaryAttrCost = 0;
    const primaryAttrs = [
      { name: 'Strength', id: 'attr-strength', code: 'STR' },
      { name: 'Agility', id: 'attr-agility', code: 'AGI' },
      { name: 'Stamina', id: 'attr-stamina', code: 'STA' },
      { name: 'Intellect', id: 'attr-intellect', code: 'INT' },
      { name: 'Wisdom', id: 'attr-wisdom', code: 'WIS' },
      { name: 'Charisma', id: 'attr-charisma', code: 'CHA' }
    ];

    // Track purchased attribute points
    primaryAttrs.forEach(({ name, id }) => {
      const val = parseInt(characterData[id] || 0, 10);
      const cost = val * 5;
      primaryAttrCost += cost;
      itemizedList.push({
        category: 'Primary Attr',
        item: `${name} (Purchased)`,
        val: val > 0 ? `${val} Purchased Point${val > 1 ? 's' : ''}` : '0 Base Purchased',
        costVal: cost,
        cost: `${cost} CP`
      });
    });

    // Inherent Attribute Modifiers granted by Species Package
    if (speciesCostBreakdown?.itemized?.attributes && Array.isArray(speciesCostBreakdown.itemized.attributes)) {
      speciesCostBreakdown.itemized.attributes.forEach(attrMod => {
        const attrCode = (attrMod.attr || '').toUpperCase();
        const attrObj = primaryAttrs.find(p => p.code === attrCode || p.name.toUpperCase() === attrCode) || { name: attrMod.attr };
        const bonus = attrMod.value || 1;
        const standalone = Math.abs(attrMod.bp !== undefined ? attrMod.bp : (bonus * 5));
        itemizedList.push({
          category: 'Species Granted Attr',
          item: `${attrObj.name} (${bonus > 0 ? `+${bonus}` : bonus})`,
          val: `Granted by ${speciesCostBreakdown.speciesName} (Included in Package)`,
          costVal: 0,
          cost: formatGrantedCost(0, standalone, 'CP'),
          standaloneCost: standalone
        });
      });
    }

    // 3. Attribute Checks / Sub-Attributes (Base = Primary * 2 + 2; 1 CP per purchased point above/below base)
    let subAttrCost = 0;
    const subAttrs = [
      { name: 'Might', id: 'attr-might', primaryId: 'attr-strength' },
      { name: 'Reflex', id: 'attr-reflex', primaryId: 'attr-agility' },
      { name: 'Fortitude', id: 'attr-fortitude', primaryId: 'attr-stamina' },
      { name: 'Reason', id: 'attr-logic', aliasId: 'attr-reason', primaryId: 'attr-intellect' },
      { name: 'Willpower', id: 'attr-will', aliasId: 'attr-willpower', primaryId: 'attr-wisdom' },
      { name: 'Etiquette', id: 'attr-etiquette', primaryId: 'attr-charisma' }
    ];

    subAttrs.forEach(({ name, id, aliasId, primaryId }) => {
      const pVal = parseInt(characterData[primaryId] || 0, 10);
      const calculatedBase = (pVal * 2) + 2;

      const hasExplicitVal = (characterData[id] !== undefined && characterData[id] !== null && characterData[id] !== '') ||
                            (aliasId && characterData[aliasId] !== undefined && characterData[aliasId] !== null && characterData[aliasId] !== '');
      const rawVal = characterData[id] !== undefined && characterData[id] !== null && characterData[id] !== ''
        ? parseInt(characterData[id], 10)
        : (aliasId ? parseInt(characterData[aliasId], 10) : 0);

      const val = (hasExplicitVal && rawVal !== 0 && !isNaN(rawVal)) ? rawVal : calculatedBase;
      const extra = val - calculatedBase;

      if (extra !== 0) {
        const cost = extra * 1;
        subAttrCost += cost;
        itemizedList.push({
          category: 'Attribute Check',
          item: `${name} (${extra >= 0 ? '+' : ''}${extra})`,
          val: `${extra >= 0 ? '+' : ''}${extra} rel. Base (${calculatedBase})`,
          costVal: cost,
          cost: `${cost} CP`
        });
      } else {
        itemizedList.push({
          category: 'Attribute Check',
          item: `${name} (Base)`,
          val: `Base Check Score (${calculatedBase})`,
          costVal: 0,
          cost: '0 CP'
        });
      }
    });

    // 4. Movement Modes & Species Locomotion
    const groundWalk = characterData['move-walk'] !== undefined && characterData['move-walk'] !== null && characterData['move-walk'] !== ''
      ? parseInt(characterData['move-walk'], 10)
      : 30;
    itemizedList.push({
      category: 'Movement Mode',
      item: `Ground Walk (${groundWalk} ft)`,
      val: 'Standard Ground Locomotion',
      costVal: 0,
      cost: '0 CP'
    });

    const otherMovementKeys = [
      { key: 'move-swim', name: 'Swim', baseBP: 2 },
      { key: 'move-climb', name: 'Climb', baseBP: 2 },
      { key: 'move-fly', name: 'Fly', baseBP: 4 },
      { key: 'move-burrow', name: 'Burrow', baseBP: 2 },
      { key: 'move-flicker', name: 'Flicker', baseBP: 2 }
    ];

    otherMovementKeys.forEach(({ key, name, baseBP }) => {
      const spd = parseInt(characterData[key] || 0, 10);
      if (spd > 0) {
        const isFromSpecies = speciesCostBreakdown && (
          (speciesCostBreakdown.speeds && speciesCostBreakdown.speeds[name.toLowerCase()] > 0) ||
          (speciesCostBreakdown.breakdown?.movementBP > 0) ||
          (Array.isArray(speciesCostBreakdown.speciesObj?.movement) && speciesCostBreakdown.speciesObj.movement.some(m => String(m).toLowerCase().includes(name.toLowerCase())))
        );
        if (isFromSpecies) {
          itemizedList.push({
            category: 'Species Movement',
            item: `${name} (${spd} ft)`,
            val: `Granted by ${speciesCostBreakdown.speciesName} (Included in Package)`,
            costVal: 0,
            cost: formatGrantedCost(0, baseBP, 'CP'),
            standaloneCost: baseBP
          });
        } else {
          itemizedList.push({
            category: 'Movement Mode',
            item: `${name} (${spd} ft)`,
            val: `${name} Locomotion Mode`,
            costVal: 0,
            cost: '0 CP'
          });
        }
      }
    });

    // 5. Hindrances / Disadvantages (Yields CP Refunds unless from Species Package)
    let disadvantageRefund = 0;
    const hindrancesList = (Array.isArray(characterData.hindrances) && characterData.hindrances.length > 0)
      ? characterData.hindrances
      : (Array.isArray(characterData.disadvantages) ? characterData.disadvantages : []);

    hindrancesList.forEach((dis) => {
      const name = typeof dis === 'object' ? (dis.name || dis.title || 'Unnamed Hindrance') : String(dis);
      const isSpeciesDis = typeof dis === 'object' && (
        dis.source === 'species' || 
        dis.category === 'Species Disadvantage' || 
        dis.category === 'Species' ||
        (speciesCostBreakdown?.itemized?.disadvantages?.some(sd => (sd.name || '').toLowerCase() === name.toLowerCase()))
      );

      if (isSpeciesDis) {
        const refVal = typeof dis === 'object' ? (dis.refundBP || dis.bp || 3) : 3;
        itemizedList.push({
          category: 'Species Disadvantage',
          item: name,
          val: `Inherent to ${speciesCostBreakdown?.speciesName || 'Species'} (Refund included in species cost)`,
          costVal: 0,
          cost: formatGrantedCost(0, -Math.abs(refVal), 'CP'),
          standaloneCost: -Math.abs(refVal)
        });
      } else {
        const cpVal = getItemCP(dis, 3);
        disadvantageRefund += cpVal;
        itemizedList.push({
          category: 'Hindrance',
          item: name,
          val: 'Character Hindrance Refund',
          costVal: -cpVal,
          cost: `-${cpVal} CP`
        });
      }
    });

    // 6. Features & Perks (Standard 3 CP; Occupation Recommended Features get -1 CP discount = 2 CP; Species Features = 0 [standalone])
    let featuresCost = 0;
    const occuName = characterData['char-occu'];
    const occuItem = occuName ? resolveCatalogItem('occupations', occuName, dbData) : null;
    const occuRecFeatNames = new Set(
      (Array.isArray(occuItem?.recommended_features) ? occuItem.recommended_features : (Array.isArray(occuItem?.features) ? occuItem.features : []))
        .map(f => (typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f)).toLowerCase().trim())
    );

    const features = Array.isArray(characterData.features) ? characterData.features : [];
    features.forEach((feat) => {
      const name = typeof feat === 'object' ? (feat.name || feat.title || 'Unnamed Feature') : String(feat);
      const cleanName = name.toLowerCase().trim();
      const isSpeciesFeat = typeof feat === 'object' && (
        feat.source === 'species' ||
        feat.category === 'Species Inherent' ||
        feat.category === 'Species' ||
        feat.category === 'Species Trait' ||
        (speciesCostBreakdown?.itemized?.traits?.some(st => (st.name || '').toLowerCase() === cleanName))
      );

      if (isSpeciesFeat) {
        const standalone = (typeof feat === 'object' && feat.standaloneCp !== undefined)
          ? feat.standaloneCp
          : ((typeof feat === 'object' && feat.bp !== undefined) ? feat.bp : 3);
        itemizedList.push({
          category: 'Species Inherent Feature',
          item: name,
          val: `Granted by ${speciesCostBreakdown?.speciesName || 'Species'} (Included in Package)`,
          costVal: 0,
          cost: formatGrantedCost(0, standalone, 'CP'),
          standaloneCost: standalone
        });
      } else {
        const isOccuRecommended = occuRecFeatNames.has(cleanName);
        const defaultCost = isOccuRecommended ? 2 : 3;
        const cost = getItemCP(feat, defaultCost);
        featuresCost += cost;
        itemizedList.push({
          category: isOccuRecommended ? 'Recommended Feature' : 'Feature',
          item: name,
          val: isOccuRecommended ? 'Occupation Recommended (-1 CP Discount)' : ((typeof feat === 'object' && feat.type) ? feat.type : 'Perk'),
          costVal: cost,
          cost: `${cost} CP`
        });
      }
    });

    // 7. Traits (characterData.traits)
    let traitsCost = 0;
    const traitsList = Array.isArray(characterData.traits) ? characterData.traits : [];
    traitsList.forEach((trait) => {
      const name = typeof trait === 'object' ? (trait.name || trait.title || 'Unnamed Trait') : String(trait);
      const isSpeciesTrait = typeof trait === 'object' && (
        trait.source === 'species' ||
        trait.category === 'Species Inherent' ||
        trait.category === 'Species' ||
        trait.category === 'Species Trait'
      );

      if (isSpeciesTrait) {
        const standalone = (typeof trait === 'object' && trait.bp !== undefined)
          ? trait.bp
          : ((typeof trait === 'object' && trait.standaloneCp !== undefined) ? trait.standaloneCp : 1);
        itemizedList.push({
          category: 'Species Trait',
          item: name,
          val: `Inherent to ${speciesCostBreakdown?.speciesName || 'Species'} (Included in Package)`,
          costVal: 0,
          cost: formatGrantedCost(0, standalone, 'CP'),
          standaloneCost: standalone
        });
      } else {
        const cost = getItemCP(trait, 1);
        traitsCost += cost;
        itemizedList.push({
          category: 'Trait',
          item: name,
          val: (typeof trait === 'object' && trait.type) ? trait.type : 'Trait Purchase',
          costVal: cost,
          cost: `${cost} CP`
        });
      }
    });

    // 8. Special Abilities
    let specialAbilitiesCost = 0;
    const specAbilities = Array.isArray(characterData.special_abilities) ? characterData.special_abilities : [];
    specAbilities.forEach((sa) => {
      const name = typeof sa === 'object' ? (sa.name || 'Unnamed Ability') : sa;
      const isSpeciesSA = typeof sa === 'object' && (sa.source === 'species' || sa.category?.includes('Species'));
      if (isSpeciesSA) {
        itemizedList.push({
          category: 'Species Special Ability',
          item: name,
          val: `Granted by ${speciesCostBreakdown?.speciesName || 'Species'} (Included in Package)`,
          costVal: 0,
          cost: formatGrantedCost(0, 5, 'CP'),
          standaloneCost: 5
        });
      } else {
        const cost = getItemCP(sa, 5);
        specialAbilitiesCost += cost;
        itemizedList.push({
          category: 'Special Ability',
          item: name,
          val: 'Innate Power',
          costVal: cost,
          cost: `${cost} CP`
        });
      }
    });

    // 9. Awakened Disciplines
    let awakenedCost = 0;
    const awakenedList = Array.isArray(characterData.awakened) ? characterData.awakened : [];
    awakenedList.forEach((awk) => {
      const name = typeof awk === 'object' ? (awk.name || 'Unnamed Discipline') : awk;
      const isSpeciesAwk = typeof awk === 'object' && (awk.source === 'species' || awk.category?.includes('Species'));
      if (isSpeciesAwk) {
        itemizedList.push({
          category: 'Species Awakened Discipline',
          item: name,
          val: `Granted by ${speciesCostBreakdown?.speciesName || 'Species'} (Included in Package)`,
          costVal: 0,
          cost: formatGrantedCost(0, 3, 'CP'),
          standaloneCost: 3
        });
      } else {
        const cost = getItemCP(awk, 5);
        awakenedCost += cost;
        itemizedList.push({
          category: 'Awakened Discipline',
          item: name,
          val: 'Magic Domain',
          costVal: cost,
          cost: `${cost} CP`
        });
      }
    });

    // 10. Invocations
    let invocationsCost = 0;
    const invocationsList = Array.isArray(characterData.invocations) ? characterData.invocations : [];
    invocationsList.forEach((inv) => {
      const name = typeof inv === 'object' ? (inv.name || 'Unnamed Invocation') : inv;
      const cost = getItemCP(inv, 0);
      invocationsCost += cost;
      itemizedList.push({
        category: 'Invocation',
        item: name,
        val: 'Spell / Ritual',
        costVal: cost,
        cost: `${cost} CP`
      });
    });

    // 11. Augmentations
    let augmentationsCost = 0;
    const augmentationsList = Array.isArray(characterData.augmentations) ? characterData.augmentations : [];
    augmentationsList.forEach((aug) => {
      const name = typeof aug === 'object' ? (aug.name || 'Unnamed Augmentation') : aug;
      const cost = getItemCP(aug, 0);
      augmentationsCost += cost;
      itemizedList.push({
        category: 'Augmentation',
        item: name,
        val: (typeof aug === 'object' && aug.type) ? aug.type : 'Cyberware',
        costVal: cost,
        cost: `${cost} CP`
      });
    });

    // 12. Personal Property / Gear / Weapons / Armor / Mecha / Other
    let equipmentCost = 0;
    const equipCategories = [
      { key: 'gear', category: 'Gear' },
      { key: 'weapons', category: 'Weaponry' },
      { key: 'armor', category: 'Armoring' },
      { key: 'mecha', category: 'Mecha' },
      { key: 'other', category: 'Other Property' }
    ];

    equipCategories.forEach(({ key, category }) => {
      const list = Array.isArray(characterData[key]) ? characterData[key] : [];
      list.forEach((item) => {
        const name = typeof item === 'object' ? (item.name || 'Unnamed Item') : item;
        const cost = getItemCP(item, 0);
        equipmentCost += cost;
        itemizedList.push({
          category,
          item: name,
          val: 'Item Purchase',
          costVal: cost,
          cost: `${cost} CP`
        });
      });
    });

    // 13. Skills: Species Granted Bonuses & General Point Buy
    // Inherent Skill Bonuses from Species Package
    if (speciesCostBreakdown?.speciesObj?.specific_skill_bonuses && Array.isArray(speciesCostBreakdown.speciesObj.specific_skill_bonuses)) {
      speciesCostBreakdown.speciesObj.specific_skill_bonuses.forEach(b => {
        const sName = typeof b === 'object' ? (b.skill || b.name || '') : String(b).split(/[:+(]/)[0].trim();
        const sBonus = typeof b === 'object' ? (b.bonus ?? b.value ?? 1) : 1;
        if (sName) {
          itemizedList.push({
            category: 'Species Skill Bonus',
            item: `${sName} (+${sBonus})`,
            val: `Granted by ${speciesCostBreakdown.speciesName} (Included in Package)`,
            costVal: 0,
            cost: formatGrantedCost(0, sBonus, 'CP'),
            standaloneCost: sBonus
          });
        }
      });
    }

    let skillRanksCost = 0;
    Object.keys(characterData).forEach((key) => {
      if (key.startsWith('skill-') && key.endsWith('-rank')) {
        const rawRank = parseInt(characterData[key] || 0, 10);
        const rank = Math.min(20, Math.max(0, rawRank)); // Max level 20 cap
        if (rank > 0) {
          const skillId = key.replace('skill-', '').replace('-rank', '');
          const storedName = characterData[`skill-${skillId}-name`];
          const skillName = storedName || skillId.replace(/-/g, ' ');
          const cost = rank * 1; // 1 CP per rank default
          skillRanksCost += cost;
          itemizedList.push({
            category: 'Skill Rank',
            item: skillName,
            val: `${rank} Ranks`,
            costVal: cost,
            cost: `${cost} CP`
          });
        }
      }
    });

    let specializationRanksCost = 0;
    const specializations = Array.isArray(characterData.specializations) ? characterData.specializations : [];
    specializations.forEach((spec) => {
      const rawRank = typeof spec === 'object' ? parseInt(spec.rank || 0, 10) : 0;
      const rank = Math.min(10, Math.max(0, rawRank)); // Max level 10 cap
      if (rank > 0) {
        const specName = typeof spec === 'object' ? (spec.name || 'Unnamed Spec') : 'Unnamed Spec';
        const cost = typeof spec === 'object' && spec.cp !== undefined ? parseInt(spec.cp, 10) : rank * 1;
        specializationRanksCost += cost;
        itemizedList.push({
          category: 'Specialization',
          item: specName,
          val: `${rank} Levels`,
          costVal: cost,
          cost: `${cost} CP`
        });
      }
    });

    // 14. Purchased Stats Cost (Health & Vitality)
    let purchasedStatsCost = 0;
    if (derivedStats.purchasedHealth > 0) {
      const cost = Math.ceil(derivedStats.purchasedHealth / 5);
      purchasedStatsCost += cost;
      itemizedList.push({
        category: 'Purchased Stat',
        item: 'Bonus Health',
        val: `+${derivedStats.purchasedHealth} Health`,
        costVal: cost,
        cost: `${cost} CP`
      });
    }

    if (derivedStats.purchasedVitality > 0) {
      const cost = Math.ceil(derivedStats.purchasedVitality / 5);
      purchasedStatsCost += cost;
      itemizedList.push({
        category: 'Purchased Stat',
        item: 'Bonus Vitality',
        val: `+${derivedStats.purchasedVitality} Vitality`,
        costVal: cost,
        cost: `${cost} CP`
      });
    }

    // Calculate Total Spent CP
    const spentCP = (
      identityCost +
      primaryAttrCost +
      subAttrCost +
      featuresCost +
      traitsCost +
      specialAbilitiesCost +
      awakenedCost +
      invocationsCost +
      augmentationsCost +
      equipmentCost +
      skillRanksCost +
      specializationRanksCost +
      purchasedStatsCost -
      disadvantageRefund
    );

    const earnedAP = Math.max(0, parseInt(characterData.earned_ap || 0, 10));
    const experienceDebt = Math.max(0, parseInt(characterData.experience_debt || 0, 10));
    const totalBudget = startingCP + earnedAP;
    const remainingCP = totalBudget - spentCP;
    const availableAP = Math.max(0, earnedAP - Math.max(0, spentCP - startingCP));

    const identityPools = computedModifiers.identityPools;

    return {
      startingCP,
      earnedAP,
      totalBudget,
      spentCP,
      remainingCP,
      availableAP,
      experienceDebt,
      experienceAwards: Array.isArray(characterData.experience_awards) ? characterData.experience_awards : [],
      experienceSpends: Array.isArray(characterData.experience_spends) ? characterData.experience_spends : [],
      primaryAttrCost,
      subAttrCost,
      skillRanksCost,
      specializationRanksCost,
      featuresCost,
      traitsCost,
      disadvantageRefund,
      specialAbilitiesCost,
      awakenedCost,
      identityPools,
      speciesCostBreakdown,
      itemizedList
    };
  }, [characterData, derivedStats, computedModifiers.identityPools, dbData]);

  const updateRosterCharacterNote = useCallback(async (docId, noteText) => {
    const updatedNotes = [{ text: noteText }];
    setPersonaRoster(prev => prev.map(c => {
      if (c['character-doc-id'] === docId) {
        return { ...c, notes: updatedNotes, updatedAt: new Date().toISOString() };
      }
      return c;
    }));

    if (characterData['character-doc-id'] === docId) {
      setCharacterData(prev => ({ ...prev, notes: updatedNotes }));
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, docId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const existingData = snapshot.data();
          await setDoc(docRef, { ...existingData, notes: updatedNotes, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to update character note in Firestore:', err.message);
      }
    }
  }, [characterData]);

  const updateCharacterHealth = useCallback(async (heroId, newHealth) => {
    if (!heroId) return;
    const clampedHealth = Math.max(0, parseInt(newHealth, 10) || 0);

    setPersonaRoster(prev => {
      const updated = prev.map(c => {
        if (c['character-doc-id'] === heroId || c.id === heroId) {
          return {
            ...c,
            current_health: clampedHealth,
            current_hp: clampedHealth, // backward compatibility
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (characterData['character-doc-id'] === heroId || characterData.id === heroId) {
      setCharacterData(prev => ({
        ...prev,
        current_health: clampedHealth,
        current_hp: clampedHealth
      }));
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, heroId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const existingData = snapshot.data();
          await setDoc(docRef, { ...existingData, current_health: clampedHealth, current_hp: clampedHealth, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to sync character Health to Firestore:', err.message);
      }
    }
  }, [characterData]);

  const updateCharacterVitality = useCallback(async (heroId, newVitality) => {
    if (!heroId) return;
    const clampedVitality = Math.max(0, parseInt(newVitality, 10) || 0);

    setPersonaRoster(prev => {
      const updated = prev.map(c => {
        if (c['character-doc-id'] === heroId || c.id === heroId) {
          return {
            ...c,
            current_vitality: clampedVitality,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (characterData['character-doc-id'] === heroId || characterData.id === heroId) {
      setCharacterData(prev => ({
        ...prev,
        current_vitality: clampedVitality
      }));
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, heroId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const existingData = snapshot.data();
          await setDoc(docRef, { ...existingData, current_vitality: clampedVitality, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to sync character Vitality to Firestore:', err.message);
      }
    }
  }, [characterData]);

  const updateCharacterStructure = useCallback(async (heroId, newStructure) => {
    if (!heroId) return;
    const clampedStructure = Math.max(0, parseInt(newStructure, 10) || 0);

    setPersonaRoster(prev => {
      const updated = prev.map(c => {
        if (c['character-doc-id'] === heroId || c.id === heroId) {
          return {
            ...c,
            current_structure: clampedStructure,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (characterData['character-doc-id'] === heroId || characterData.id === heroId) {
      setCharacterData(prev => ({
        ...prev,
        current_structure: clampedStructure
      }));
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, heroId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const existingData = snapshot.data();
          await setDoc(docRef, { ...existingData, current_structure: clampedStructure, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to sync character Structure to Firestore:', err.message);
      }
    }
  }, [characterData]);

  const applyCharacterDamage = useCallback(async (heroId, {
    incomingDamage = 0,
    isNonLethal = false,
    isCritical = false,
    isConcussive = false,
    attemptedReduction = true,
    armorDR = 0
  } = {}) => {
    const target = (personaRoster || []).find(c => c['character-doc-id'] === heroId || c.id === heroId) ||
      (characterData['character-doc-id'] === heroId || characterData.id === heroId ? characterData : null);
    if (!target) return null;

    const staTotal = target['attr-stamina'] ? parseInt(target['attr-stamina'], 10) : 0;
    const toughness = staTotal; // Stamina determines base Toughness

    const isSynthetic = derivedStats.isSynthetic || 
      String(target['char-species'] || '').toLowerCase().includes('synthetic') ||
      String(target['char-species'] || '').toLowerCase().includes('mekan');

    const currentHealth = target.current_health !== undefined ? parseInt(target.current_health, 10) : parseInt(target.health || 30, 10);
    const currentVitality = target.current_vitality !== undefined ? parseInt(target.current_vitality, 10) : parseInt(target.vitality || 30, 10);
    const currentStructure = target.current_structure !== undefined ? parseInt(target.current_structure, 10) : (currentHealth + currentVitality);
    const isAtDeathsDoor = Boolean(target.is_at_deaths_door || (currentHealth <= 0 && currentVitality <= 0));
    const deathClockCurrent = target.death_clock !== undefined ? target.death_clock : undefined;

    const result = applyDamageToEntity({
      currentVitality,
      currentHealth,
      currentStructure,
      isSynthetic,
      incomingDamage,
      isNonLethal,
      isCritical,
      isConcussive,
      attemptedReduction,
      toughness,
      armorDR,
      staminaScore: staTotal,
      isAtDeathsDoor,
      deathClockCurrent
    });

    const updates = {
      is_at_deaths_door: result.atDeathsDoor,
      death_clock: result.deathClock,
      is_comatose: result.comatose,
      is_dead: result.dead,
      is_stabilized: result.atDeathsDoor ? false : (target.is_stabilized || false)
    };

    if (isSynthetic) {
      updates.current_structure = result.newStructure;
      await updateCharacterStructure(heroId, result.newStructure);
    } else {
      if (result.newVitality !== currentVitality) {
        updates.current_vitality = result.newVitality;
        await updateCharacterVitality(heroId, result.newVitality);
      }
      if (result.newHealth !== currentHealth) {
        updates.current_health = result.newHealth;
        await updateCharacterHealth(heroId, result.newHealth);
      }
    }

    setPersonaRoster(prev => {
      const updated = prev.map(c => {
        if (c['character-doc-id'] === heroId || c.id === heroId) {
          return { ...c, ...updates, updatedAt: new Date().toISOString() };
        }
        return c;
      });
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (characterData['character-doc-id'] === heroId || characterData.id === heroId) {
      setCharacterData(prev => ({ ...prev, ...updates }));
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, heroId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const existingData = snapshot.data();
          await setDoc(docRef, { ...existingData, ...updates, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to sync Death & Dying state to Firestore:', err.message);
      }
    }

    return result;
  }, [personaRoster, characterData, derivedStats.isSynthetic, updateCharacterStructure, updateCharacterVitality, updateCharacterHealth]);

  // Backward-compatible alias
  const updateCharacterHp = updateCharacterHealth;

  // ═══════════════════════════════════════════════════════════
  // DEATH & DYING ACTIONS (CANONICAL ENGINE INTEGRATION)
  // ═══════════════════════════════════════════════════════════

  const stabilizeCharacter = useCallback(async (heroId, { medicineCheckRoll = 0, isMedicineSuccess = false, hasHealingEffect = false } = {}) => {
    const target = (personaRoster || []).find(c => c['character-doc-id'] === heroId || c.id === heroId) ||
      (characterData['character-doc-id'] === heroId || characterData.id === heroId ? characterData : null);
    if (!target) return null;

    const result = stabilizeEntity({ medicineCheckRoll, isMedicineSuccess, hasHealingEffect });
    if (result.stabilized) {
      const updates = {
        is_stabilized: true,
        is_at_deaths_door: false,
        is_comatose: false,
        death_clock: null
      };

      setPersonaRoster(prev => {
        const updated = prev.map(c => (c['character-doc-id'] === heroId || c.id === heroId) ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
        StorageService.setItem('personaRoster', updated);
        return updated;
      });

      if (characterData['character-doc-id'] === heroId || characterData.id === heroId) {
        setCharacterData(prev => ({ ...prev, ...updates }));
      }

      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, `users/${user.uid}/personas`, heroId);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            await setDoc(docRef, { ...snapshot.data(), ...updates, updatedAt: new Date().toISOString() });
          }
        } catch (err) {
          console.warn('Failed to sync stabilization to Firestore:', err.message);
        }
      }
    }
    return result;
  }, [personaRoster, characterData]);

  const advanceCharacterDeathTurn = useCallback(async (heroId) => {
    const target = (personaRoster || []).find(c => c['character-doc-id'] === heroId || c.id === heroId) ||
      (characterData['character-doc-id'] === heroId || characterData.id === heroId ? characterData : null);
    if (!target) return null;

    const currentClock = target.death_clock !== undefined ? target.death_clock : calculateDeathClock(target['attr-stamina']);
    const result = advanceDeathClock({ currentClock, isStabilized: target.is_stabilized });

    const updates = {
      death_clock: result.currentClock,
      is_dead: result.dead,
      is_at_deaths_door: !result.dead && !result.isStabilized
    };

    setPersonaRoster(prev => {
      const updated = prev.map(c => (c['character-doc-id'] === heroId || c.id === heroId) ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (characterData['character-doc-id'] === heroId || characterData.id === heroId) {
      setCharacterData(prev => ({ ...prev, ...updates }));
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, heroId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          await setDoc(docRef, { ...snapshot.data(), ...updates, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to sync death turn to Firestore:', err.message);
      }
    }
    return result;
  }, [personaRoster, characterData]);

  const revivifyCharacter = useCallback(async (heroId, { revivedHealth = 1 } = {}) => {
    const target = (personaRoster || []).find(c => c['character-doc-id'] === heroId || c.id === heroId) ||
      (characterData['character-doc-id'] === heroId || characterData.id === heroId ? characterData : null);
    if (!target) return null;

    const result = revivifyEntity({ characterData: target, revivedHealth });
    const updates = {
      current_health: Math.max(1, Number(revivedHealth) || 1),
      is_dead: false,
      is_at_deaths_door: false,
      death_clock: null,
      is_stabilized: true,
      is_comatose: false,
      karma: 0,
      experience_debt: result.penalties.totalExperienceDebt
    };

    setPersonaRoster(prev => {
      const updated = prev.map(c => (c['character-doc-id'] === heroId || c.id === heroId) ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (characterData['character-doc-id'] === heroId || characterData.id === heroId) {
      setCharacterData(prev => ({ ...prev, ...updates }));
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, heroId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          await setDoc(docRef, { ...snapshot.data(), ...updates, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to sync revivification to Firestore:', err.message);
      }
    }
    return result;
  }, [personaRoster, characterData]);

  const awardExperience = useCallback(async (heroId, awardDetails = {}) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id || 'active';
    const target = (personaRoster || []).find(c => c['character-doc-id'] === targetId || c.id === targetId) ||
      (characterData['character-doc-id'] === targetId || characterData.id === targetId ? characterData : null);
    if (!target) return null;

    const result = applyExperienceAward(target, awardDetails);
    const updatedData = { ...result.updatedData, updatedAt: new Date().toISOString() };

    setPersonaRoster(prev => {
      const updated = prev.map(c => (c['character-doc-id'] === targetId || c.id === targetId) ? updatedData : c);
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (characterData['character-doc-id'] === targetId || characterData.id === targetId || targetId === 'active') {
      setCharacterData(prev => ({ ...prev, ...updatedData }));
    }

    const user = auth.currentUser;
    if (user && targetId && targetId !== 'active') {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, targetId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          await setDoc(docRef, { ...snapshot.data(), ...updatedData });
        }
      } catch (err) {
        console.warn('Failed to sync award experience to Firestore:', err.message);
      }
    }
    return result;
  }, [personaRoster, characterData]);

  const payExperienceDebt = useCallback(async (heroId, amount = 1) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id || 'active';
    const target = (personaRoster || []).find(c => c['character-doc-id'] === targetId || c.id === targetId) ||
      (characterData['character-doc-id'] === targetId || characterData.id === targetId ? characterData : null);
    if (!target) return null;

    const result = settleExperienceDebt({ characterData: target, apAmount: amount });
    const updatedData = { ...result.updatedData, updatedAt: new Date().toISOString() };

    setPersonaRoster(prev => {
      const updated = prev.map(c => (c['character-doc-id'] === targetId || c.id === targetId) ? updatedData : c);
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (characterData['character-doc-id'] === targetId || characterData.id === targetId || targetId === 'active') {
      setCharacterData(prev => ({ ...prev, ...updatedData }));
    }

    const user = auth.currentUser;
    if (user && targetId && targetId !== 'active') {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, targetId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          await setDoc(docRef, { ...snapshot.data(), ...updatedData });
        }
      } catch (err) {
        console.warn('Failed to sync XP debt to Firestore:', err.message);
      }
    }
    return result;
  }, [personaRoster, characterData]);

  // ═══════════════════════════════════════════════════════════
  // REST & RECOVERY ACTIONS (CANONICAL ENGINE INTEGRATION)
  // ═══════════════════════════════════════════════════════════

  const takeCharacterRest = useCallback(async (heroId, { restType = 'light', activityTier = 'nap', interruptions = 0, isSecondWind = false } = {}) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id || 'active';
    const target = (personaRoster || []).find(c => c['character-doc-id'] === targetId || c.id === targetId) || 
      (characterData['character-doc-id'] === targetId || characterData.id === targetId || targetId === 'active' ? characterData : null);
    
    if (!target) return { success: false, error: 'Character not found' };

    const currentRestsToday = target.light_rests_today !== undefined ? parseInt(target.light_rests_today, 10) : (characterData.light_rests_today || 0);

    const result = executeRestCycle({
      character: target,
      restType,
      activityTier,
      interruptions,
      currentLightRestsToday: currentRestsToday,
      isSecondWind
    });

    if (!result.success) {
      return result;
    }

    const updates = {
      current_vitality: result.newVitality,
      light_rests_today: result.newLightRestsToday,
      last_rest_type: result.restType,
      last_rest_timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update roster state
    setPersonaRoster(prev => {
      const updated = prev.map(c => {
        if (c['character-doc-id'] === targetId || c.id === targetId) {
          return { ...c, ...updates };
        }
        return c;
      });
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    // Update active characterData if target is currently loaded
    if (characterData['character-doc-id'] === targetId || characterData.id === targetId || targetId === 'active') {
      setCharacterData(prev => ({
        ...prev,
        ...updates
      }));
    }

    // Persist to Firestore if logged in
    const user = auth.currentUser;
    if (user && targetId && targetId !== 'active') {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, targetId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const existingData = snapshot.data();
          await setDoc(docRef, { ...existingData, ...updates });
        }
      } catch (err) {
        console.warn('Failed to sync character rest to Firestore:', err.message);
      }
    }

    return result;
  }, [personaRoster, characterData]);

  const resetDailyCharacterRests = useCallback(async (heroId) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id || 'active';
    const updates = {
      light_rests_today: 0,
      updatedAt: new Date().toISOString()
    };

    setPersonaRoster(prev => {
      const updated = prev.map(c => {
        if (c['character-doc-id'] === targetId || c.id === targetId) {
          return { ...c, ...updates };
        }
        return c;
      });
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (characterData['character-doc-id'] === targetId || characterData.id === targetId || targetId === 'active') {
      setCharacterData(prev => ({
        ...prev,
        ...updates
      }));
    }

    const user = auth.currentUser;
    if (user && targetId && targetId !== 'active') {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, targetId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const existingData = snapshot.data();
          await setDoc(docRef, { ...existingData, ...updates });
        }
      } catch (err) {
        console.warn('Failed to sync reset daily rests to Firestore:', err.message);
      }
    }

    return resetDailyRests();
  }, [characterData]);

  // Top level computed spent CP
  const computeSpentCP = useCallback(() => {
    return economyBreakdown.spentCP;
  }, [economyBreakdown]);

  // Dynamically compute which movement modes are currently enabled for the character
  const enabledMovementModes = useMemo(() => {
    const modes = new Set(['walk']); // Ground walk is always enabled as base

    // Check characterData explicit move-* fields
    ['swim', 'climb', 'fly', 'burrow', 'flicker'].forEach(mode => {
      const val = parseInt(characterData[`move-${mode}`] || 0, 10);
      if (val > 0) modes.add(mode);
    });

    // Check species movement
    const speciesVal = characterData['char-species'];
    const speciesObj = typeof speciesVal === 'object' ? speciesVal : (dbData.species || []).find(s => (s.name || s.id || '').toLowerCase() === String(speciesVal || '').toLowerCase());
    if (speciesObj) {
      const moveArray = Array.isArray(speciesObj.movement) ? speciesObj.movement : [];
      const moveStr = JSON.stringify(speciesObj).toLowerCase();
      if (moveArray.some(m => String(m).includes('swim')) || moveStr.includes('swim') || moveStr.includes('aquatic') || moveStr.includes('amphibious')) modes.add('swim');
      if (moveArray.some(m => String(m).includes('climb')) || moveStr.includes('climb') || moveStr.includes('arboreal')) modes.add('climb');
      if (moveArray.some(m => String(m).includes('fly') || String(m).includes('wing')) || moveStr.includes('flight') || moveStr.includes('winged') || moveStr.includes('aerial')) modes.add('fly');
      if (moveArray.some(m => String(m).includes('burrow')) || moveStr.includes('burrow')) modes.add('burrow');
      if (moveArray.some(m => String(m).includes('flicker') || String(m).includes('phase')) || moveStr.includes('flicker') || moveStr.includes('teleport')) modes.add('flicker');
    }

    // Check features, traits, and augmentations
    const allFeats = [
      ...(Array.isArray(characterData.features) ? characterData.features : []),
      ...(Array.isArray(characterData.augmentations) ? characterData.augmentations : []),
      ...(Array.isArray(characterData.awakened) ? characterData.awakened : [])
    ];

    allFeats.forEach(f => {
      const name = (typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f)).toLowerCase();
      const desc = (typeof f === 'object' ? (f.description || f.mechanic || '') : '').toLowerCase();
      const combined = `${name} ${desc}`;

      if (combined.includes('swim') || combined.includes('amphibious') || combined.includes('aquatic')) modes.add('swim');
      if (combined.includes('climb') || combined.includes('climber') || combined.includes('arboreal')) modes.add('climb');
      if (combined.includes('fly') || combined.includes('flight') || combined.includes('wings') || combined.includes('winged') || combined.includes('jetpack') || combined.includes('aerial')) modes.add('fly');
      if (combined.includes('burrow') || combined.includes('tunneler') || combined.includes('burrowing')) modes.add('burrow');
      if (combined.includes('flicker') || combined.includes('phase shift') || combined.includes('dimension') || combined.includes('teleport') || combined.includes('blink')) modes.add('flicker');
    });

    return Array.from(modes);
  }, [characterData, dbData.species]);

  // ═══════════════════════════════════════════════════════════
  // KARMA & FATE ECONOMY ACTIONS (CHARACTER & PARTY LINKED)
  // ═══════════════════════════════════════════════════════════

  const updateCharacterKarma = useCallback(async (heroId, newKarma) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id || 'active';
    const target = (personaRoster || []).find(c => c['character-doc-id'] === targetId || c.id === targetId) ||
      (characterData['character-doc-id'] === targetId || characterData.id === targetId || targetId === 'active' ? characterData : null);
    if (!target) return null;

    const charisma = parseInt(target['attr-charisma'] || target.attr_charisma || 10, 10);
    const maxKarmaDebt = (targetId === (characterData['character-doc-id'] || characterData.id || 'active'))
      ? derivedStats.maxKarmaDebt
      : Math.max(1, charisma + 1);
    const maxKarma = (targetId === (characterData['character-doc-id'] || characterData.id || 'active'))
      ? derivedStats.maxKarma
      : Math.max(0, parseInt(target.maxKarma || 3, 10));

    const clampedKarma = Math.max(-maxKarmaDebt, Math.min(maxKarma, parseInt(newKarma, 10) || 0));

    setPersonaRoster(prev => {
      const updated = prev.map(c => {
        if (c['character-doc-id'] === targetId || c.id === targetId) {
          return {
            ...c,
            karma: clampedKarma,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (characterData['character-doc-id'] === targetId || characterData.id === targetId || targetId === 'active') {
      setCharacterData(prev => ({
        ...prev,
        karma: clampedKarma
      }));
    }

    const user = auth.currentUser;
    if (user && targetId && targetId !== 'active') {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, targetId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          await setDoc(docRef, { ...snapshot.data(), karma: clampedKarma, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to sync character Karma to Firestore:', err.message);
      }
    }

    return clampedKarma;
  }, [personaRoster, characterData, derivedStats.maxKarma, derivedStats.maxKarmaDebt]);

  const awardCharacterKarma = useCallback(async (heroId, amount = 1, reason = 'Heroic Action') => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id || 'active';
    const target = (personaRoster || []).find(c => c['character-doc-id'] === targetId || c.id === targetId) ||
      (characterData['character-doc-id'] === targetId || characterData.id === targetId || targetId === 'active' ? characterData : null);
    if (!target) return null;

    const currentKarma = parseInt(target.karma !== undefined ? target.karma : (derivedStats?.maxKarma ?? 3), 10) || 0;
    const nextKarma = currentKarma + amount;
    const finalKarma = await updateCharacterKarma(targetId, nextKarma);
    return { heroId: targetId, oldKarma: currentKarma, newKarma: finalKarma, amount, reason };
  }, [personaRoster, characterData, derivedStats?.maxKarma, updateCharacterKarma]);

  const resetCharacterKarma = useCallback(async (heroId) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id || 'active';
    const target = (personaRoster || []).find(c => c['character-doc-id'] === targetId || c.id === targetId) ||
      (characterData['character-doc-id'] === targetId || characterData.id === targetId || targetId === 'active' ? characterData : null);
    if (!target) return null;

    const maxK = (targetId === (characterData['character-doc-id'] || characterData.id || 'active'))
      ? derivedStats.maxKarma
      : Math.max(0, parseInt(target.maxKarma || 3, 10));

    return await updateCharacterKarma(targetId, maxK);
  }, [personaRoster, characterData, derivedStats.maxKarma, updateCharacterKarma]);

  const awardPartyKarma = useCallback(async (heroIds = [], amount = 1, reason = 'Party Heroic Award') => {
    const results = [];
    for (const id of heroIds) {
      if (id) {
        const res = await awardCharacterKarma(id, amount, reason);
        if (res) results.push(res);
      }
    }
    return results;
  }, [awardCharacterKarma]);

  const awardPartyExperience = useCallback(async (heroIds = [], awardDetails = {}) => {
    const results = [];
    for (const id of heroIds) {
      if (id) {
        const res = await awardExperience(id, awardDetails);
        if (res) results.push(res);
      }
    }
    return results;
  }, [awardExperience]);

  const spendKarma = useCallback((amount = 1) => {
    setCharacterData(prev => {
      const cur = parseInt(prev.karma ?? derivedStats.maxKarma, 10) || 0;
      const minAllowed = -derivedStats.maxKarmaDebt;
      const next = Math.max(minAllowed, cur - amount);
      return { ...prev, karma: next };
    });
  }, [derivedStats.maxKarma, derivedStats.maxKarmaDebt]);

  const gainKarma = useCallback((amount = 1) => {
    setCharacterData(prev => {
      const cur = parseInt(prev.karma ?? 0, 10) || 0;
      const maxAllowed = derivedStats.maxKarma;
      const next = Math.min(maxAllowed, cur + amount);
      return { ...prev, karma: next };
    });
  }, [derivedStats.maxKarma]);

  const resetKarmaToMax = useCallback(() => {
    setCharacterData(prev => ({
      ...prev,
      karma: derivedStats.maxKarma
    }));
  }, [derivedStats.maxKarma]);

  const spendPlotPoint = useCallback((amount = 1) => {
    setCharacterData(prev => {
      const cur = Math.max(0, parseInt(prev['plot-points'] || 0, 10));
      return { ...prev, 'plot-points': Math.max(0, cur - amount) };
    });
  }, []);

  const gainPlotPoint = useCallback((amount = 1) => {
    setCharacterData(prev => {
      const cur = Math.max(0, parseInt(prev['plot-points'] || 0, 10));
      return { ...prev, 'plot-points': cur + amount };
    });
  }, []);

  // Active character summary alias for cross-module integration
  const activeCharacter = useMemo(() => ({
    id: characterData['character-doc-id'] || characterData.id || 'char_active',
    name: characterData['char-name'] || 'Active Hero',
    concept: characterData['char-concept'] || '',
    archetype: characterData['char-archetype'] || '',
    species: characterData['char-species'] || '',
    occupation: characterData['char-occu'] || '',
    health: characterData.health || derivedStats.health,
    vitality: characterData.vitality || derivedStats.vitality,
    karma: characterData.karma !== undefined ? characterData.karma : derivedStats.maxKarma,
    plotPoints: characterData['plot-points'] || 0,
    remainingCP: economyBreakdown.remainingCP,
    startingCP: economyBreakdown.startingCP,
    spentCP: economyBreakdown.spentCP,
    data: characterData
  }), [characterData, derivedStats, economyBreakdown]);

  return (
    <FolioContext.Provider
      value={{
        characterData,
        activeCharacter,
        activeHeroName: activeCharacter.name,
        updateField,
        handleAddItem,
        addItemToInventory,
        addAbility,
        handleUpdateItem,
        handleAddSkill,
        handleDeleteSkill,
        handleAddSpecialization,
        handleUpdateSpecialization,
        handleDeleteSpecialization,
        handleNewCharacter,
        handleSaveLocal,
        handleLoadLocal,
        handleExportAsStoryElement,
        triggerSave,
        handleLoadCloud,
        computeSpentCP,
        economyBreakdown,
        derivedStats,
        computedModifiers,
        getAttrMod,
        getAttrTotal,
        getSubAttrBase,
        enabledMovementModes,
        applyArchetypeChassis,
        applySpeciesAdjustments,
        calculateFullSpeciesCost,
        speciesComponentData: getSpeciesComponentDataset(),
        applyOccupationAdjustments,
        applyOriginAdjustments,
        applyFactionAdjustments,
        applyIdentitySelection,
        allocatePoolSkillRank,
        togglePoolTrait,
        removePoolTrait,
        togglePoolFeature,
        removePoolFeature,
        allocatePoolAttribute,
        personaRoster,
        roster: personaRoster,
        saveCurrentToRoster,
        switchRosterCharacter,
        deleteRosterCharacter,
        duplicateRosterCharacter,
        cloudSaveStatus,
        lastSavedTime,
        updateRosterCharacterNote,
        updateCharacterHealth,
        updateCharacterVitality,
        updateCharacterStructure,
        applyCharacterDamage,
        updateCharacterHp,
        stabilizeCharacter,
        advanceCharacterDeathTurn,
        revivifyCharacter,
        awardExperience,
        payExperienceDebt,
        experienceRules: EXPERIENCE_RULES,
        deathAndDyingRules: DEATH_AND_DYING_RULES,
        takeCharacterRest,
        resetDailyCharacterRests,
        updateCharacterKarma,
        awardCharacterKarma,
        resetCharacterKarma,
        awardPartyKarma,
        awardPartyExperience,
        spendKarma,
        gainKarma,
        resetKarmaToMax,
        spendPlotPoint,
        gainPlotPoint,
        isInActiveGame,
        activeGameSession,
        setInActiveGame,
        toggleActiveGameLock,
        applyGMConfirmedUpdate,
        isGMConfirmed,
        setIsGMConfirmed,
        isProtectedGameStat,
        isReadOnly,
        publicCatalog,
        togglePersonaVisibility,
        clonePublicPersona,
        loadPublicPersonas,
        applyGuidedCharacter,
        dbData
      }}
    >
      {children}
    </FolioContext.Provider>
  );
};
