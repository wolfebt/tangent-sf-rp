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

  // Add Custom Skill Handler
  const handleAddSkill = useCallback((skill) => {
    setCharacterData((prev) => ({
      ...prev,
      [`skill-${skill.id}-rank`]: 1,
      [`skill-${skill.id}-base`]: skill.baseAttr
    }));
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

    // 1. Primary Attributes (5 CP per point)
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
        itemizedList.push({ category: 'Primary Attr', item: name, val: `${val} Base`, cost: `${cost} CP` });
      }
    });

    // 2. Sub-Attributes (Base = Primary * 2 + 2; 2 CP per purchased point above base)
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
      const val = parseInt(characterData[id] || 0, 10);
      const pVal = parseInt(characterData[primaryId] || 0, 10);
      const calculatedBase = (pVal * 2) + 2;
      if (val > calculatedBase) {
        const extra = val - calculatedBase;
        const cost = extra * 2;
        subAttrCost += cost;
        itemizedList.push({ category: 'Sub-Attr', item: name, val: `+${extra} above Base (${calculatedBase})`, cost: `${cost} CP` });
      }
    });

    // 3. Disadvantages (Yields CP Refunds)
    let disadvantageRefund = 0;
    const disadvantages = Array.isArray(characterData.disadvantages) ? characterData.disadvantages : [];
    disadvantages.forEach((dis) => {
      const name = typeof dis === 'object' ? dis.name : dis;
      const val = typeof dis === 'object' && dis.cp ? parseInt(dis.cp, 10) : 3; // Default refund 3 CP per flaw
      disadvantageRefund += val;
      itemizedList.push({ category: 'Disadvantage', item: name, val: 'Flaw Refund', cost: `-${val} CP` });
    });

    // 4. Features & Abilities
    let featuresCost = 0;
    const features = Array.isArray(characterData.features) ? characterData.features : [];
    features.forEach((feat) => {
      const name = typeof feat === 'object' ? feat.name : feat;
      const cost = typeof feat === 'object' && feat.cp ? parseInt(feat.cp, 10) : 3;
      featuresCost += cost;
      itemizedList.push({ category: 'Feature', item: name, val: 'Perk', cost: `${cost} CP` });
    });

    // 5. Special Abilities & Disciplines
    let specialAbilitiesCost = 0;
    const specAbilities = Array.isArray(characterData.special_abilities) ? characterData.special_abilities : [];
    specAbilities.forEach((sa) => {
      const name = typeof sa === 'object' ? sa.name : sa;
      const cost = 5; // Default 5 CP per special ability
      specialAbilitiesCost += cost;
      itemizedList.push({ category: 'Special Ability', item: name, val: 'Innate Power', cost: `${cost} CP` });
    });

    let awakenedCost = 0;
    const awakenedList = Array.isArray(characterData.awakened) ? characterData.awakened : [];
    awakenedList.forEach((dis) => {
      const name = typeof dis === 'object' ? dis.name : dis;
      const cost = 5;
      awakenedCost += cost;
      itemizedList.push({ category: 'Awakened Discipline', item: name, val: 'Magic Domain', cost: `${cost} CP` });
    });

    // 6. Skills Total CP
    let skillRanksCost = 0;
    Object.keys(characterData).forEach((key) => {
      if (key.startsWith('skill-') && key.endsWith('-rank')) {
        const rank = parseInt(characterData[key] || 0, 10);
        if (rank > 0) {
          const skillName = key.replace('skill-', '').replace('-rank', '').replace(/-/g, ' ');
          const cost = rank * 1; // 1 CP per rank default
          skillRanksCost += cost;
          itemizedList.push({ category: 'Skill Rank', item: skillName, val: `${rank} Ranks`, cost: `${cost} CP` });
        }
      }
    });

    const spentCP = primaryAttrCost + subAttrCost + featuresCost + specialAbilitiesCost + awakenedCost + skillRanksCost - disadvantageRefund;
    const remainingCP = startingCP - spentCP;

    // Standard SP & FP Pool Data
    const spPools = {
      any: { total: 10, used: Math.min(10, Math.floor(skillRanksCost / 2)) },
      physical: { total: 0, used: 0 },
      mental: { total: 0, used: 0 },
      social: { total: 0, used: 0 },
      combat: { total: 5, used: 0 },
      meta: { total: 0, used: 0 }
    };

    const fpPools = {
      any: { total: 3, used: Math.min(3, features.length) },
      ability: { total: 0, used: 0 },
      combat: { total: 0, used: 0 },
      meta: { total: 0, used: 0 },
      general: { total: 0, used: 0 },
      karma: { total: 0, used: 0 },
      skill: { total: 0, used: 0 },
      exotic: { total: 0, used: 0 }
    };

    const bonusCounters = {
      skillChoices: 2,
      featureChoices: 1,
      disciplines: { current: awakenedList.length, max: 3 },
      specialAbilities: { current: specAbilities.length, max: 5 }
    };

    return {
      startingCP,
      spentCP,
      remainingCP,
      primaryAttrCost,
      subAttrCost,
      skillRanksCost,
      featuresCost,
      disadvantageRefund,
      specialAbilitiesCost,
      awakenedCost,
      spPools,
      fpPools,
      bonusCounters,
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
        handleNewCharacter,
        handleSaveLocal,
        handleLoadLocal,
        handleSaveCloud,
        handleLoadCloud,
        computeSpentCP,
        economyBreakdown
      }}
    >
      {children}
    </FolioContext.Provider>
  );
};
