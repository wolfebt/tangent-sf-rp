import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { characterSchema } from '../components/Folio/schema';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, deleteDoc, collectionGroup, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { attachCreatorTag } from '../utils/creatorUtils';
import { useDBM } from './DBMContext';
import { StorageService } from '../services/storageService';

const ATTR_NAME_TO_ID = {
  strength: 'attr-strength',
  might: 'attr-might',
  agility: 'attr-agility',
  reflex: 'attr-reflex',
  stamina: 'attr-stamina',
  constitution: 'attr-stamina',
  fortitude: 'attr-fortitude',
  intellect: 'attr-intellect',
  logic: 'attr-logic',
  wisdom: 'attr-wisdom',
  will: 'attr-will',
  charisma: 'attr-charisma',
  etiquette: 'attr-etiquette'
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
  'char-species': '',
  'char-occu': '',
  'char-origin': '',
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
  'karma': 3,
  features: [],
  disadvantages: [],
  augmentations: [],
  awakened: [],
  invocations: [],
  special_abilities: [],
  attacks: [],
  armor: [],
  gear: [],
  weapons: [],
  armoring: [],
  mecha: [],
  other: [],
  specializations: [],
  notes: [{ text: '' }]
};

export const FolioProvider = ({ children }) => {
  // Master Character Form State initialized from localStorage/sessionStorage if available
  const [characterData, setCharacterData] = useState(() => {
    try {
      const saved = localStorage.getItem('personaFolioData') || sessionStorage.getItem('personaFolioData');
      if (saved) {
        return characterSchema.parse(JSON.parse(saved));
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

  // Character Roster State — primary source is Firestore; StorageService/IndexedDB is secondary offline cache
  const [personaRoster, setPersonaRoster] = useState(() => {
    try {
      const saved = localStorage.getItem('personaRoster');
      if (saved) return JSON.parse(saved);
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
        const [cachedRoster, cachedCharacter] = await Promise.all([
          StorageService.getItem('personaRoster'),
          StorageService.getItem('personaFolioData')
        ]);

        if (!isMounted) return;

        if (Array.isArray(cachedRoster) && cachedRoster.length > 0) {
          setPersonaRoster(cachedRoster);
        }

        if (cachedCharacter && typeof cachedCharacter === 'object') {
          try {
            const parsed = characterSchema.parse(cachedCharacter);
            setCharacterData(prev => {
              // Only hydrate if active character is currently empty/default
              if (!prev['char-name'] && !prev['character-doc-id']) {
                return parsed;
              }
              return prev;
            });
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
        const personas = snapshot.docs.map(d => ({ ...d.data(), 'character-doc-id': d.id, ownerUid: user.uid }));
        setPersonaRoster(personas);
        // Mirror to StorageService as offline cache
        StorageService.setItem('personaRoster', personas);
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
    }

    const executeSave = async () => {
      const user = auth.currentUser;
      if (!user) {
        setCloudSaveStatus('offline');
        return;
      }

      setCloudSaveStatus('saving');

      try {
        const currentData = characterDataRef.current;
        const docId = currentData['character-doc-id'] || `char_${Date.now()}`;
        const rawData = {
          ...currentData,
          'character-doc-id': docId,
          updatedAt: new Date().toISOString()
        };
        const updatedData = attachCreatorTag(rawData, localStorage.getItem('userHandle'), user);

        if (!currentData['character-doc-id']) {
          setCharacterData(prev => ({ ...prev, 'character-doc-id': docId }));
        }

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
      const list = dbData[colName] || [];
      const match = list.find(item => 
        (item.name && item.name.toLowerCase() === String(val).toLowerCase()) ||
        item.id === val
      );
      return match || { name: String(val) };
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

        // Inherent Guaranteed Features
        if (Array.isArray(identityItem.inherent_features) && identityItem.inherent_features.length > 0) {
          const inhNames = identityItem.inherent_features.map(f => typeof f === 'object' ? (f.name || f.id) : f).join(', ');
          pools.push({ name: `Inherent Traits (${inhNames})`, awarded: identityItem.inherent_features.length, type: 'Inherent' });
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

        // 4. Resolve attached direct modifiers
        const modRefs = Array.isArray(identityItem.modifier) ? identityItem.modifier : (identityItem.modifier ? [identityItem.modifier] : []);
        modRefs.forEach(modRef => applyModifier(modRef));

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

    const identityPools = {
      species: processIdentity(speciesObj, 'species', 'Species'),
      occupation: processIdentity(occuObj, 'occu', 'Occupation'),
      origin: processIdentity(originObj, 'origin', 'Origin'),
      faction: processIdentity(factionObj, 'faction', 'Faction')
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
    characterData['char-species'],
    characterData['char-occu'],
    characterData['char-origin'],
    characterData['char-faction'],
    characterData.features,
    dbData
  ]);

  // Attribute Mod & Total Calculation Helpers
  const getAttrMod = useCallback((attrId) => {
    const userMod = parseInt(characterData[`${attrId}-mod`] || 0, 10) || 0;
    const identityMod = computedModifiers.attributeMods[attrId] || 0;
    return userMod + identityMod;
  }, [characterData, computedModifiers.attributeMods]);

  const getAttrTotal = useCallback((attrId) => {
    const val = parseInt(characterData[attrId] || 0, 10) || 0;
    return val + getAttrMod(attrId);
  }, [characterData, getAttrMod]);

  // Derived Stats Auto-Calculation
  const derivedStats = useMemo(() => {
    const staminaBase = parseInt(characterData['attr-stamina'] || 0, 10);
    const staminaMod = getAttrMod('attr-stamina');
    const stamina = staminaBase + staminaMod;

    const fortitudeBase = parseInt(characterData['attr-fortitude'] || (staminaBase * 2 + 2), 10);
    const fortitudeMod = getAttrMod('attr-fortitude');
    const fortitude = fortitudeBase + fortitudeMod;

    const wisdomBase = parseInt(characterData['attr-wisdom'] || 0, 10);
    const wisdomMod = getAttrMod('attr-wisdom');
    const wisdom = wisdomBase + wisdomMod;

    const willBase = parseInt(characterData['attr-will'] || (wisdomBase * 2 + 2), 10);
    const willMod = getAttrMod('attr-will');
    const will = willBase + willMod;

    const magicLevel = parseInt(characterData['magic-level'] || 1, 10);

    const baseHealth = 30 + (fortitude > 2 ? (fortitude - 2) * 2 : 0);
    const baseVitality = 30 + (will > 2 ? (will - 2) * 2 : 0);
    const baseKarma = 3 + (magicLevel > 1 ? magicLevel - 1 : 0);

    const maxAllowed = 60 + (5 * Math.max(0, stamina));
    
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

    return {
      health: baseHealth,
      vitality: baseVitality,
      karma: baseKarma,
      maxAllowed,
      purchasedHealth,
      purchasedVitality
    };
  }, [
    characterData['attr-stamina'],
    characterData['attr-fortitude'],
    characterData['attr-wisdom'],
    characterData['attr-will'],
    characterData['magic-level'],
    characterData['health'],
    characterData['vitality'],
    getAttrMod
  ]);

  // Automatically keep health/vitality/karma synchronized if unmodified (or below base)
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
      
      const currentKarma = parseInt(prev.karma, 10);
      if (isNaN(currentKarma) || currentKarma !== derivedStats.karma) {
        updates.karma = derivedStats.karma;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  }, [derivedStats.health, derivedStats.vitality, derivedStats.karma]);

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
    
    if (!targetId) {
      setCharacterData({
        ...DEFAULT_CHARACTER,
        'character-doc-id': `char_${Date.now()}`
      });
      StorageService.removeItem('personaFolioData');
      sessionStorage.removeItem('personaFolioData');
      setIsReadOnly(false);
      return;
    }

    // 1. Filter out from personaRoster state & StorageService cache
    const updatedRoster = personaRoster.filter(c => c['character-doc-id'] !== targetId);
    setPersonaRoster(updatedRoster);
    StorageService.setItem('personaRoster', updatedRoster);

    // 2. Filter out from publicCatalog state
    setPublicCatalog(prev => prev.filter(c => c['character-doc-id'] !== targetId));

    // 3. Reset or switch characterData if the active character is being deleted
    if (characterData['character-doc-id'] === targetId) {
      if (updatedRoster.length > 0) {
        setCharacterData(updatedRoster[0]);
      } else {
        setCharacterData({
          ...DEFAULT_CHARACTER,
          'character-doc-id': `char_${Date.now()}`
        });
      }
      StorageService.removeItem('personaFolioData');
      sessionStorage.removeItem('personaFolioData');
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

  // Sync to StorageService and sessionStorage on state change
  useEffect(() => {
    StorageService.setItem('personaFolioData', characterData);
    try {
      sessionStorage.setItem('personaFolioData', JSON.stringify(characterData));
    } catch (e) {}
  }, [characterData]);

  // Field updater
  const updateField = useCallback((key, value) => {
    // If updating a skill rank, clamp max to 20
    if (typeof key === 'string' && key.startsWith('skill-') && key.endsWith('-rank')) {
      const clampedVal = Math.min(20, Math.max(0, parseInt(value, 10) || 0));
      setCharacterData((prev) => ({
        ...prev,
        [key]: clampedVal
      }));
      return;
    }
    setCharacterData((prev) => ({
      ...prev,
      [key]: value
    }));
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

  // Local Load JSON
  const handleLoadLocal = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawData = JSON.parse(e.target.result);
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

    // 1. Identity Selections (Species, Occupation, Origin, Faction)
    const identityEntries = [
      { key: 'char-species', label: 'Species' },
      { key: 'char-occu', label: 'Occupation' },
      { key: 'char-origin', label: 'Origin' },
      { key: 'char-faction', label: 'Faction' }
    ];

    let identityCost = 0;
    identityEntries.forEach(({ key, label }) => {
      const val = characterData[key];
      if (val) {
        const name = typeof val === 'object' ? (val.name || val.title || '') : val;
        if (name && name.trim()) {
          const cost = getItemCP(val, 0);
          const hasExplicitCP = typeof val === 'object' && (val.cp !== undefined || val.cost !== undefined || val.cost_cp !== undefined);
          if (cost !== 0 || hasExplicitCP) {
            identityCost += cost;
            itemizedList.push({
              category: label,
              item: name,
              val: 'Identity Selection',
              costVal: cost,
              cost: `${cost} CP`
            });
          }
        }
      }
    });

    // 2. Primary Attributes (5 CP per point allocated above 0)
    let primaryAttrCost = 0;
    const primaryAttrs = [
      { name: 'Strength', id: 'attr-strength' },
      { name: 'Agility', id: 'attr-agility' },
      { name: 'Stamina', id: 'attr-stamina' },
      { name: 'Intellect', id: 'attr-intellect' },
      { name: 'Wisdom', id: 'attr-wisdom' },
      { name: 'Charisma', id: 'attr-charisma' }
    ];

    primaryAttrs.forEach(({ name, id }) => {
      const val = parseInt(characterData[id] || 0, 10);
      if (val > 0) {
        const cost = val * 5;
        primaryAttrCost += cost;
        itemizedList.push({
          category: 'Primary Attr',
          item: name,
          val: `${val} Base`,
          costVal: cost,
          cost: `${cost} CP`
        });
      }
    });

    // 3. Sub-Attributes (Base = Primary * 2 + 2; 2 CP per purchased point above/below base)
    let subAttrCost = 0;
    const subAttrs = [
      { name: 'Might', id: 'attr-might', primaryId: 'attr-strength' },
      { name: 'Reflex', id: 'attr-reflex', primaryId: 'attr-agility' },
      { name: 'Fortitude', id: 'attr-fortitude', primaryId: 'attr-stamina' },
      { name: 'Logic', id: 'attr-logic', primaryId: 'attr-intellect' },
      { name: 'Will', id: 'attr-will', primaryId: 'attr-wisdom' },
      { name: 'Etiquette', id: 'attr-etiquette', primaryId: 'attr-charisma' }
    ];

    subAttrs.forEach(({ name, id, primaryId }) => {
      const pVal = parseInt(characterData[primaryId] || 0, 10);
      const calculatedBase = (pVal * 2) + 2;

      const hasExplicitVal = characterData[id] !== undefined && characterData[id] !== null && characterData[id] !== '';
      const rawVal = parseInt(characterData[id], 10);

      // If unset or 0 when calculatedBase > 0, sub-attribute defaults to calculatedBase
      const val = (hasExplicitVal && rawVal !== 0) ? rawVal : calculatedBase;
      const extra = val - calculatedBase;

      if (extra !== 0) {
        const cost = extra * 2;
        subAttrCost += cost;
        itemizedList.push({
          category: 'Sub-Attr',
          item: name,
          val: `${extra >= 0 ? '+' : ''}${extra} rel. Base (${calculatedBase})`,
          costVal: cost,
          cost: `${cost} CP`
        });
      }
    });

    // 4. Disadvantages (Yields CP Refunds)
    let disadvantageRefund = 0;
    const disadvantages = Array.isArray(characterData.disadvantages) ? characterData.disadvantages : [];
    disadvantages.forEach((dis) => {
      const name = typeof dis === 'object' ? (dis.name || 'Unnamed Flaw') : dis;
      const cpVal = getItemCP(dis, 3); // Default refund 3 CP per flaw if unspecified
      disadvantageRefund += cpVal;
      itemizedList.push({
        category: 'Disadvantage',
        item: name,
        val: 'Flaw Refund',
        costVal: -cpVal,
        cost: `-${cpVal} CP`
      });
    });

    // 5. Features & Perks
    let featuresCost = 0;
    const features = Array.isArray(characterData.features) ? characterData.features : [];
    features.forEach((feat) => {
      const name = typeof feat === 'object' ? (feat.name || 'Unnamed Feature') : feat;
      const cost = getItemCP(feat, 3); // Default 3 CP per perk if unspecified
      featuresCost += cost;
      itemizedList.push({
        category: 'Feature',
        item: name,
        val: (typeof feat === 'object' && feat.type) ? feat.type : 'Perk',
        costVal: cost,
        cost: `${cost} CP`
      });
    });

    // 6. Special Abilities
    let specialAbilitiesCost = 0;
    const specAbilities = Array.isArray(characterData.special_abilities) ? characterData.special_abilities : [];
    specAbilities.forEach((sa) => {
      const name = typeof sa === 'object' ? (sa.name || 'Unnamed Ability') : sa;
      const cost = getItemCP(sa, 5); // Default 5 CP per special ability if unspecified
      specialAbilitiesCost += cost;
      itemizedList.push({
        category: 'Special Ability',
        item: name,
        val: 'Innate Power',
        costVal: cost,
        cost: `${cost} CP`
      });
    });

    // 7. Awakened Disciplines
    let awakenedCost = 0;
    const awakenedList = Array.isArray(characterData.awakened) ? characterData.awakened : [];
    awakenedList.forEach((awk) => {
      const name = typeof awk === 'object' ? (awk.name || 'Unnamed Discipline') : awk;
      const cost = getItemCP(awk, 5);
      awakenedCost += cost;
      itemizedList.push({
        category: 'Awakened Discipline',
        item: name,
        val: 'Magic Domain',
        costVal: cost,
        cost: `${cost} CP`
      });
    });

    // 8. Invocations
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

    // 9. Augmentations
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

    // 10. Personal Property / Gear / Weapons / Armor / Mecha / Other
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

    // 11. Skills & Specializations Ranks CP
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

    // 12. Purchased Stats Cost (Health & Vitality)
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

    const remainingCP = startingCP - spentCP;

    const identityPools = computedModifiers.identityPools;

    return {
      startingCP,
      spentCP,
      remainingCP,
      primaryAttrCost,
      subAttrCost,
      skillRanksCost,
      specializationRanksCost,
      featuresCost,
      disadvantageRefund,
      specialAbilitiesCost,
      awakenedCost,
      identityPools,
      itemizedList
    };
  }, [characterData, derivedStats, computedModifiers.identityPools]);

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

  // Backward-compatible alias
  const updateCharacterHp = updateCharacterHealth;

  // Top level computed spent CP
  const computeSpentCP = useCallback(() => {
    return economyBreakdown.spentCP;
  }, [economyBreakdown]);

  // Active character summary alias for cross-module integration
  const activeCharacter = useMemo(() => ({
    id: characterData['character-doc-id'] || characterData.id || 'char_active',
    name: characterData['char-name'] || 'Active Hero',
    concept: characterData['char-concept'] || '',
    species: characterData['char-species'] || '',
    occupation: characterData['char-occu'] || '',
    health: characterData.health || derivedStats.health,
    vitality: characterData.vitality || derivedStats.vitality,
    karma: characterData.karma || derivedStats.karma,
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
        triggerSave,
        handleLoadCloud,
        computeSpentCP,
        economyBreakdown,
        derivedStats,
        computedModifiers,
        getAttrMod,
        getAttrTotal,
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
        updateCharacterHp,
        isReadOnly,
        publicCatalog,
        togglePersonaVisibility,
        clonePublicPersona,
        loadPublicPersonas
      }}
    >
      {children}
    </FolioContext.Provider>
  );
};
