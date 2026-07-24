import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { characterSchema } from '../components/Folio/schema';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

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
    return DEFAULT_CHARACTER;
  });

  // Character Roster State
  const [personaRoster, setPersonaRoster] = useState(() => {
    try {
      const saved = localStorage.getItem('personaRoster');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load character roster:', e);
    }
    return [];
  });

  // Sync roster to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('personaRoster', JSON.stringify(personaRoster));
    } catch (e) {
      console.error('Failed to save character roster:', e);
    }
  }, [personaRoster]);

  // Derived Stats Auto-Calculation
  const derivedStats = useMemo(() => {
    const stamina = parseInt(characterData['attr-stamina'] || 0, 10);
    const fortitude = parseInt(characterData['attr-fortitude'] || (stamina * 2 + 2), 10);
    const wisdom = parseInt(characterData['attr-wisdom'] || 0, 10);
    const will = parseInt(characterData['attr-will'] || (wisdom * 2 + 2), 10);
    const magicLevel = parseInt(characterData['magic-level'] || 1, 10);

    const calculatedHealth = 30 + (fortitude > 2 ? (fortitude - 2) * 2 : 0);
    const calculatedVitality = 30 + (will > 2 ? (will - 2) * 2 : 0);
    const calculatedKarma = 3 + (magicLevel > 1 ? magicLevel - 1 : 0);

    return {
      health: calculatedHealth,
      vitality: calculatedVitality,
      karma: calculatedKarma
    };
  }, [
    characterData['attr-stamina'],
    characterData['attr-fortitude'],
    characterData['attr-wisdom'],
    characterData['attr-will'],
    characterData['magic-level']
  ]);

  // Automatically keep health/vitality/karma synchronized if unmodified
  useEffect(() => {
    setCharacterData(prev => {
      if (
        prev.health !== derivedStats.health ||
        prev.vitality !== derivedStats.vitality ||
        prev.karma !== derivedStats.karma
      ) {
        return {
          ...prev,
          health: derivedStats.health,
          vitality: derivedStats.vitality,
          karma: derivedStats.karma
        };
      }
      return prev;
    });
  }, [derivedStats]);

  // Roster Management Actions
  const saveCurrentToRoster = useCallback(() => {
    const name = characterData['char-name'] || 'Unnamed Operative';
    const docId = characterData['character-doc-id'] || `char_${Date.now()}`;
    const updatedData = { ...characterData, 'character-doc-id': docId, updatedAt: new Date().toISOString() };
    
    setPersonaRoster(prev => {
      const idx = prev.findIndex(c => c['character-doc-id'] === docId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedData;
        return next;
      }
      return [...prev, updatedData];
    });
  }, [characterData]);

  const switchRosterCharacter = useCallback((docId) => {
    const found = personaRoster.find(c => c['character-doc-id'] === docId);
    if (found) {
      setCharacterData(found);
    }
  }, [personaRoster]);

  const deleteRosterCharacter = useCallback((docId) => {
    setPersonaRoster(prev => prev.filter(c => c['character-doc-id'] !== docId));
  }, []);

  const duplicateRosterCharacter = useCallback((docId) => {
    const found = personaRoster.find(c => c['character-doc-id'] === docId);
    if (found) {
      const newDocId = `char_${Date.now()}`;
      const clone = {
        ...found,
        'character-doc-id': newDocId,
        'char-name': `${found['char-name'] || 'Unnamed'} (Copy)`,
        updatedAt: new Date().toISOString()
      };
      setPersonaRoster(prev => [...prev, clone]);
    }
  }, [personaRoster]);

  // Sync to localStorage and sessionStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem('personaFolioData', JSON.stringify(characterData));
      sessionStorage.setItem('personaFolioData', JSON.stringify(characterData));
    } catch (e) {
      console.error('Failed to save persona folio state to storage', e);
    }
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
  const handleAddItem = useCallback((key, item) => {
    setCharacterData((prev) => {
      const currentList = Array.isArray(prev[key]) ? prev[key] : [];
      return {
        ...prev,
        [key]: [...currentList, item]
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
    setCharacterData(DEFAULT_CHARACTER);
    localStorage.removeItem('personaFolioData');
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

  // Firestore Save Persona to Cloud
  const handleSaveCloud = async () => {
    const user = auth.currentUser;
    const userId = user ? user.uid : 'anonymous';
    const name = characterData['char-name'] || 'UNNAMED';
    const docId = characterData['character-doc-id'] || `${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;

    try {
      const updatedData = { ...characterData, 'character-doc-id': docId };
      const docRef = doc(db, `users/${userId}/personas`, docId);
      await setDoc(docRef, updatedData);
      updateField('character-doc-id', docId);
      alert(`Persona "${name}" saved to cloud successfully!`);
    } catch (err) {
      console.error('Error saving persona to cloud:', err);
      alert(`Cloud Save failed: ${err.message}`);
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
      specializationRanksCost -
      disadvantageRefund
    );

    const remainingCP = startingCP - spentCP;

    // Helper to extract point pools for identity selections
    const extractPoolsFromIdentity = (identityVal, typeKey) => {
      const pools = [];
      if (!identityVal) return pools;

      const itemObj = typeof identityVal === 'object' ? identityVal : null;
      if (itemObj) {
        if (itemObj.bonus_skill_points) pools.push({ name: 'Bonus Skill Points', awarded: itemObj.bonus_skill_points, type: 'SP' });
        if (itemObj.bonus_feature_points) pools.push({ name: 'Bonus Feature Points', awarded: itemObj.bonus_feature_points, type: 'FP' });
        if (itemObj.bonus_skill_choices) pools.push({ name: 'Bonus Skill Choices', awarded: itemObj.bonus_skill_choices, type: 'Choice' });
        if (itemObj.bonus_feature_choices) pools.push({ name: 'Bonus Feature Choices', awarded: itemObj.bonus_feature_choices, type: 'Choice' });
        if (Array.isArray(itemObj.pools)) {
          itemObj.pools.forEach(p => pools.push(p));
        }
      }

      const customPoolKey = `char-${typeKey}-pools`;
      if (Array.isArray(characterData[customPoolKey])) {
        characterData[customPoolKey].forEach(p => pools.push(p));
      }

      return pools;
    };

    const identityPools = {
      occupation: {
        title: 'Occupation',
        name: typeof characterData['char-occu'] === 'object' ? (characterData['char-occu'].name || 'Selected') : (characterData['char-occu'] || 'Not Selected'),
        pools: extractPoolsFromIdentity(characterData['char-occu'], 'occu')
      },
      origin: {
        title: 'Origin',
        name: typeof characterData['char-origin'] === 'object' ? (characterData['char-origin'].name || 'Selected') : (characterData['char-origin'] || 'Not Selected'),
        pools: extractPoolsFromIdentity(characterData['char-origin'], 'origin')
      },
      faction: {
        title: 'Faction',
        name: typeof characterData['char-faction'] === 'object' ? (characterData['char-faction'].name || 'Selected') : (characterData['char-faction'] || 'Not Selected'),
        pools: extractPoolsFromIdentity(characterData['char-faction'], 'faction')
      },
      species: {
        title: 'Species',
        name: typeof characterData['char-species'] === 'object' ? (characterData['char-species'].name || 'Selected') : (characterData['char-species'] || 'Not Selected'),
        pools: extractPoolsFromIdentity(characterData['char-species'], 'species')
      }
    };

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
  }, [characterData]);

  // Top level computed spent CP
  const computeSpentCP = useCallback(() => {
    return economyBreakdown.spentCP;
  }, [economyBreakdown]);

  return (
    <FolioContext.Provider
      value={{
        characterData,
        updateField,
        handleAddItem,
        handleAddSkill,
        handleDeleteSkill,
        handleAddSpecialization,
        handleUpdateSpecialization,
        handleDeleteSpecialization,
        handleNewCharacter,
        handleSaveLocal,
        handleLoadLocal,
        handleSaveCloud,
        handleLoadCloud,
        computeSpentCP,
        economyBreakdown,
        derivedStats,
        personaRoster,
        saveCurrentToRoster,
        switchRosterCharacter,
        deleteRosterCharacter,
        duplicateRosterCharacter
      }}
    >
      {children}
    </FolioContext.Provider>
  );
};
