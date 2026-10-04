import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collectionGroup, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { useFolioIdentity } from './FolioIdentityContext';
import { useFolioStats } from './FolioStatsContext';
import { enrichItemWithModifiers } from '../../engines/tangentModifierEngine';
import { createAttackFromWeapon, createArmorFromItem } from '../../utils/combatUtils';
import { attachCreatorTag } from '../../utils/creatorUtils';
import { showToast } from '../ToastContext';

export const FolioInventoryContext = createContext(null);

export const useFolioInventory = () => {
  const context = useContext(FolioInventoryContext);
  if (!context) {
    console.warn('[useFolioInventory] Hook called outside of FolioInventorySliceProvider. Returning fallback empty state.');
    return {};
  }
  return context;
};

export const FolioInventorySliceProvider = ({ children }) => {
  const { 
    characterData, 
    setCharacterData, 
    triggerSave, 
    personaRoster, 
    setPersonaRoster, 
    setIsReadOnly, 
    setActiveTab,
    saveCurrentToRoster 
  } = useFolioIdentity();
  
  const { getAttrTotal } = useFolioStats();

  const [publicCatalog, setPublicCatalog] = useState([]);

  // Add Item Handler with automatic synchronization between Inventory and Active Combat
  const handleAddItem = useCallback((key, item) => {
    const finalItem = ['features', 'traits', 'hindrances', 'disadvantages'].includes(key)
      ? enrichItemWithModifiers(item)
      : item;

    setCharacterData((prev) => {
      const currentList = Array.isArray(prev[key]) ? prev[key] : [];
      const updates = {
        [key]: [...currentList, finalItem]
      };

      // 1. Weaponry to Active Offensive Attacks synchronization
      if (['weapons', 'weaponry', 'guns', 'melee'].includes(key)) {
        const currentAttacks = Array.isArray(prev.attacks) ? [...prev.attacks] : [];
        const itemName = (typeof item === 'object' ? (item.name || item.title) : String(item || '')).trim().toLowerCase();
        const itemId = typeof item === 'object' ? item.id : null;
        const alreadyInAttacks = currentAttacks.some(a => {
          if (itemId && (a.weaponId === itemId || a.id === itemId || a.id === `atk_${itemId}`)) return true;
          return itemName && (a.name || '').trim().toLowerCase() === itemName;
        });

        if (!alreadyInAttacks) {
          const newAttack = createAttackFromWeapon(item, prev, getAttrTotal || (() => 0));
          updates.attacks = [...currentAttacks, newAttack];
        }
      }

      // 2. Armoring to Active Defensive Armor synchronization
      if (['armoring', 'armor', 'defenses', 'shields'].includes(key)) {
        const currentArmors = Array.isArray(prev.armor) ? [...prev.armor] : [];
        const itemName = (typeof item === 'object' ? (item.name || item.title) : String(item || '')).trim().toLowerCase();
        const itemId = typeof item === 'object' ? item.id : null;
        const alreadyInArmor = currentArmors.some(a => {
          if (itemId && (a.armorId === itemId || a.id === itemId || a.id === `armor_${itemId}`)) return true;
          return itemName && (a.name || '').trim().toLowerCase() === itemName;
        });

        if (!alreadyInArmor) {
          const newArmor = createArmorFromItem(item);
          updates.armor = [...currentArmors, newArmor];
        }
      }

      // 3. Attacks to Weaponry reverse synchronization
      if (key === 'attacks') {
        const currentWeapons = Array.isArray(prev.weapons) ? [...prev.weapons] : [];
        const itemName = (typeof item === 'object' ? (item.name || item.title) : String(item || '')).trim().toLowerCase();
        const alreadyInWeapons = currentWeapons.some(w => (w.name || w.title || '').trim().toLowerCase() === itemName);
        if (!alreadyInWeapons && itemName) {
          const newWeapon = {
            id: (typeof item === 'object' && item.weaponId) ? item.weaponId : `weapon_${Date.now()}`,
            name: typeof item === 'object' ? (item.name || 'Weapon') : String(item),
            category: 'weaponry',
            damage: typeof item === 'object' ? (item.damage || '') : '',
            damage_type: typeof item === 'object' ? (item.type || '') : '',
            score: typeof item === 'object' ? (item.score || '') : '',
            notes: typeof item === 'object' ? (item.notes || '') : '',
            cp: typeof item === 'object' ? (item.cp || 0) : 0,
            qty: 1
          };
          updates.weapons = [...currentWeapons, newWeapon];
        }
      }

      return {
        ...prev,
        ...updates
      };
    });
    triggerSave();
  }, [getAttrTotal, setCharacterData, triggerSave]);

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
    triggerSave();
  }, [setCharacterData, triggerSave]);

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
    triggerSave();
  }, [setCharacterData, triggerSave]);

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
    triggerSave();
  }, [setCharacterData, triggerSave]);

  // Companion and Cohort handlers
  const handleAddCompanion = useCallback((companion) => {
    if (!companion) return;
    const newCompanion = {
      id: companion.id || `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: companion.name || 'New Companion',
      chassisType: companion.chassisType || 'biological',
      formPackageId: companion.formPackageId || 'predator',
      functionPackageId: companion.functionPackageId || 'guardian',
      rank: companion.rank || 1,
      bpBudget: companion.bpBudget || 40,
      bpSpent: companion.bpSpent || 40,
      size: companion.size || 'Medium',
      role: companion.role || 'Guardian',
      commandMode: companion.commandMode || 'direct',
      commandTether: companion.commandTether || 'Voice / Visual (50ft)',
      vitals: {
        current_hp: companion.vitals?.current_hp ?? 25,
        max_hp: companion.vitals?.max_hp ?? 25,
        vitality: companion.vitals?.vitality ?? 25,
        max_vitality: companion.vitals?.max_vitality ?? 25,
        structure: companion.vitals?.structure ?? 0,
        max_structure: companion.vitals?.max_structure ?? 0,
        essence: companion.vitals?.essence ?? 0,
        max_essence: companion.vitals?.max_essence ?? 0
      },
      attributes: companion.attributes || {
        strength: 0,
        agility: 0,
        stamina: 0,
        intellect: 0,
        wisdom: 0,
        charisma: 0
      },
      armor: companion.armor || { dr: 2, kinetic: 2, energy: 2 },
      speed: companion.speed || 10,
      attacks: Array.isArray(companion.attacks) ? companion.attacks : [],
      skills: Array.isArray(companion.skills) ? companion.skills : [],
      features: Array.isArray(companion.features) ? companion.features : [],
      disadvantages: Array.isArray(companion.disadvantages) ? companion.disadvantages : [],
      protocols: Array.isArray(companion.protocols) ? companion.protocols : [],
      sockets: Array.isArray(companion.sockets) ? companion.sockets : [],
      mounts: Array.isArray(companion.mounts) ? companion.mounts : [],
      is_deployed: companion.is_deployed ?? false,
      notes: companion.notes || ''
    };

    setCharacterData(prev => ({
      ...prev,
      companions: [...(prev.companions || []), newCompanion]
    }));
    triggerSave();
  }, [setCharacterData, triggerSave]);

  const handleUpdateCompanion = useCallback((companionId, updates) => {
    if (!companionId) return;
    setCharacterData(prev => ({
      ...prev,
      companions: (prev.companions || []).map(comp => 
        comp.id === companionId ? { ...comp, ...updates } : comp
      )
    }));
    triggerSave();
  }, [setCharacterData, triggerSave]);

  const handleDeleteCompanion = useCallback((companionId) => {
    if (!companionId) return;
    setCharacterData(prev => ({
      ...prev,
      companions: (prev.companions || []).filter(comp => comp.id !== companionId)
    }));
    triggerSave();
  }, [setCharacterData, triggerSave]);

  const handleToggleDeployCompanion = useCallback((companionId) => {
    if (!companionId) return;
    setCharacterData(prev => ({
      ...prev,
      companions: (prev.companions || []).map(comp => {
        if (comp.id === companionId) {
          const nextDeployed = !comp.is_deployed;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('companion-deploy-toggle', {
              detail: {
                companionId,
                companion: { ...comp, is_deployed: nextDeployed },
                parentOperativeId: prev['character-doc-id'] || prev.id,
                parentOperativeName: prev['char-name'] || 'Operative',
                is_deployed: nextDeployed
              }
            }));
          }
          return { ...comp, is_deployed: nextDeployed };
        }
        return comp;
      })
    }));
    triggerSave();
  }, [setCharacterData, triggerSave]);

  // Public Persona Visibility & Cloning
  const togglePersonaVisibility = useCallback(async (docId, targetIsPublic) => {
    const user = auth.currentUser;
    const currentDocId = characterData['character-doc-id'];

    const foundInRoster = (personaRoster || []).find(c => c['character-doc-id'] === docId);
    const baseObj = (currentDocId === docId || !currentDocId) ? characterData : (foundInRoster || {});

    const updated = attachCreatorTag({
      ...baseObj,
      'character-doc-id': docId,
      isPublic: targetIsPublic,
      ownerUid: user ? user.uid : 'local',
      updatedAt: new Date().toISOString()
    }, typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '', user);
    
    if (currentDocId === docId || !currentDocId) {
      setCharacterData(updated);
    }

    if (setPersonaRoster) {
      setPersonaRoster(prev => prev.map(c => {
        if (c['character-doc-id'] === docId) {
          return updated;
        }
        return c;
      }));
    }

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
  }, [characterData, personaRoster, setCharacterData, setPersonaRoster]);

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
    const cloned = attachCreatorTag(rawCloned, typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '', user);

    setCharacterData(cloned);
    if (setIsReadOnly) setIsReadOnly(false);
    if (setActiveTab) setActiveTab('identity');

    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }

    if (saveCurrentToRoster) {
      saveCurrentToRoster(cloned);
    }
    showToast({ type: 'success', text: `Successfully cloned "${name}" to your local operative roster.` });
  }, [characterData, saveCurrentToRoster, setActiveTab, setCharacterData, setIsReadOnly]);

  // Load public catalog on mount
  useEffect(() => {
    let isMounted = true;
    const loadPublic = async () => {
      try {
        const q = query(collectionGroup(db, 'personas'), where('isPublic', '==', true));
        const snap = await getDocs(q);
        if (isMounted) {
          const items = snap.docs.map(d => ({ ...d.data(), 'character-doc-id': d.id }));
          setPublicCatalog(items);
        }
      } catch (e) {
        // Silently tolerate offline or unauthenticated catalog reads
      }
    };
    loadPublic();
    return () => { isMounted = false; };
  }, []);

  const value = {
    handleAddItem,
    addItemToInventory,
    addAbility,
    handleUpdateItem,
    companions: characterData.companions || [],
    handleAddCompanion,
    handleUpdateCompanion,
    handleDeleteCompanion,
    handleToggleDeployCompanion,
    publicCatalog,
    togglePersonaVisibility,
    clonePublicPersona
  };

  return (
    <FolioInventoryContext.Provider value={value}>
      {children}
    </FolioInventoryContext.Provider>
  );
};
