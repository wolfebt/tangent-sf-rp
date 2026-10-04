import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { StorageService } from '../../services/storageService';
import { useFolioIdentity } from './FolioIdentityContext';
import { useFolioStats } from './FolioStatsContext';
import { useFolioDeathDying } from './folioDeathDyingEngine';
import { useFolioRestRecovery } from './folioRestRecoveryEngine';
import { useFolioKarma } from './folioKarmaEngine';
import { DEATH_AND_DYING_RULES, EXPERIENCE_RULES } from '../../engines/tangentConstants';
import { applyExperienceAward, settleExperienceDebt } from '../../engines/tangentEntityEngines';

export const FolioVitalsContext = createContext(null);

export const useFolioVitals = () => {
  const context = useContext(FolioVitalsContext);
  if (!context) {
    console.warn('[useFolioVitals] Hook called outside of FolioVitalsSliceProvider. Returning fallback empty state.');
    return {};
  }
  return context;
};

export const FolioVitalsSliceProvider = ({ children }) => {
  const { 
    characterData, 
    setCharacterData, 
    personaRoster, 
    setPersonaRoster, 
    triggerSave,
    isReadOnly
  } = useFolioIdentity();

  const { derivedStats } = useFolioStats();

  // Active Game Session & Tactical Integrity Lock State
  const [isGMConfirmed, setIsGMConfirmed] = useState(false);
  const [activeGameOverride, setActiveGameOverride] = useState(null);

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
      teamName: characterData?.activeTeamName || characterData?.activeSquadName || 'Active Fireteam',
      squadName: characterData?.activeTeamName || characterData?.activeSquadName || 'Active Fireteam',
      gmHandle: characterData?.activeGameGM || 'Game Master',
      sessionStartedAt: characterData?.activeGameStartedAt || characterData?.updatedAt || new Date().toISOString()
    };
  }, [isInActiveGame, characterData]);

  // Set / Toggle active game state
  const setInActiveGame = useCallback((inGame, details = {}) => {
    const isEngaged = Boolean(inGame);
    setActiveGameOverride(isEngaged);
    setCharacterData(prev => {
      const teamVal = isEngaged ? (details.teamName || details.squadName || prev.activeTeamName || prev.activeSquadName || 'Active Fireteam') : '';
      const updated = {
        ...prev,
        inActiveGame: isEngaged,
        activeGameName: isEngaged ? (details.gameName || details.name || prev.activeGameName || 'VTT Tactical Campaign') : '',
        activeTeamName: teamVal,
        activeSquadName: teamVal,
        activeGameGM: isEngaged ? (details.gmHandle || details.gm || prev.activeGameGM || 'Game Master') : '',
        activeGameStartedAt: isEngaged ? (details.startedAt || prev.activeGameStartedAt || new Date().toISOString()) : '',
        updatedAt: new Date().toISOString()
      };
      return updated;
    });

    if (setPersonaRoster) {
      setPersonaRoster(prev => prev.map(c => {
        if (c['character-doc-id'] === characterData['character-doc-id']) {
          const teamVal = isEngaged ? (details.teamName || details.squadName || c.activeTeamName || c.activeSquadName || 'Active Fireteam') : '';
          return {
            ...c,
            inActiveGame: isEngaged,
            activeGameName: isEngaged ? (details.gameName || details.name || c.activeGameName || 'VTT Tactical Campaign') : '',
            activeTeamName: teamVal,
            activeSquadName: teamVal,
            activeGameGM: isEngaged ? (details.gmHandle || details.gm || c.activeGameGM || 'Game Master') : '',
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      }));
    }
  }, [characterData, setCharacterData, setPersonaRoster]);

  const toggleActiveGameLock = useCallback((details = {}) => {
    setInActiveGame(!isInActiveGame, details);
  }, [isInActiveGame, setInActiveGame]);

  // List of dynamic operational statistics that change during active play
  const isDynamicOperationalStat = useCallback((key) => {
    if (!key || typeof key !== 'string') return false;
    const DYNAMIC_KEYS = new Set([
      'karma',
      'plot-points',
      'earned_ap',
      'spent_ap',
      'experience_debt',
      'experience_awards',
      'experience_spends',
      'current_vitality',
      'current_health',
      'current_structure',
      'current_essence',
      'is_dead',
      'is_at_deaths_door',
      'death_clock',
      'death_rounds_remaining',
      'notes',
      'conditions',
      'wounds',
      'injuries'
    ]);
    return DYNAMIC_KEYS.has(key);
  }, []);

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
    const oldVal = characterData?.[key];
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
  }, [characterData, setCharacterData]);

  // Health, Vitality, Structure Updaters
  const updateCharacterHealth = useCallback(async (heroId, newHealth) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id;
    const clampedHealth = Math.max(0, parseInt(newHealth, 10) || 0);

    const matchesTarget = (c) => {
      if (!c || !targetId) return false;
      const cId = c['character-doc-id'] || c.id;
      if (cId === targetId || c.id === targetId) return true;
      if (typeof targetId === 'string' && cId && targetId.startsWith(cId + '-')) return true;
      return false;
    };

    let matchedDocId = targetId;

    if (setPersonaRoster) {
      setPersonaRoster(prev => {
        const updated = prev.map(c => {
          if (matchesTarget(c)) {
            matchedDocId = c['character-doc-id'] || c.id || targetId;
            return {
              ...c,
              current_health: clampedHealth,
              current_hp: clampedHealth,
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        });
        StorageService.setItem('personaRoster', updated);
        return updated;
      });
    }

    const isActive = !heroId || characterData['character-doc-id'] === targetId || characterData.id === targetId || targetId === 'active' || (typeof targetId === 'string' && characterData['character-doc-id'] && targetId.startsWith(characterData['character-doc-id'] + '-'));
    if (isActive) {
      setCharacterData(prev => ({
        ...prev,
        current_health: clampedHealth,
        current_hp: clampedHealth
      }));
    }

    const user = auth.currentUser;
    const persistentId = matchedDocId !== 'active' ? matchedDocId : (characterData['character-doc-id'] || characterData.id);
    if (user && persistentId) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, persistentId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const existingData = snapshot.data();
          await setDoc(docRef, { ...existingData, current_health: clampedHealth, current_hp: clampedHealth, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to sync character Health to Firestore:', err.message);
      }
    }
  }, [characterData, setCharacterData, setPersonaRoster]);

  const updateCharacterVitality = useCallback(async (heroId, newVitality) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id;
    const clampedVitality = Math.max(0, parseInt(newVitality, 10) || 0);

    const matchesTarget = (c) => {
      if (!c || !targetId) return false;
      const cId = c['character-doc-id'] || c.id;
      if (cId === targetId || c.id === targetId) return true;
      if (typeof targetId === 'string' && cId && targetId.startsWith(cId + '-')) return true;
      return false;
    };

    let matchedDocId = targetId;

    if (setPersonaRoster) {
      setPersonaRoster(prev => {
        const updated = prev.map(c => {
          if (matchesTarget(c)) {
            matchedDocId = c['character-doc-id'] || c.id || targetId;
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
    }

    const isActive = !heroId || characterData['character-doc-id'] === targetId || characterData.id === targetId || targetId === 'active' || (typeof targetId === 'string' && characterData['character-doc-id'] && targetId.startsWith(characterData['character-doc-id'] + '-'));
    if (isActive) {
      setCharacterData(prev => ({
        ...prev,
        current_vitality: clampedVitality
      }));
    }

    const user = auth.currentUser;
    const persistentId = matchedDocId !== 'active' ? matchedDocId : (characterData['character-doc-id'] || characterData.id);
    if (user && persistentId) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, persistentId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const existingData = snapshot.data();
          await setDoc(docRef, { ...existingData, current_vitality: clampedVitality, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to sync character Vitality to Firestore:', err.message);
      }
    }
  }, [characterData, setCharacterData, setPersonaRoster]);

  const updateCharacterStructure = useCallback(async (heroId, newStructure) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id;
    const clampedStructure = Math.max(0, parseInt(newStructure, 10) || 0);

    if (setPersonaRoster) {
      setPersonaRoster(prev => {
        const updated = prev.map(c => {
          if (targetId && (c['character-doc-id'] === targetId || c.id === targetId)) {
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
    }

    setCharacterData(prev => ({
      ...prev,
      current_structure: clampedStructure
    }));

    const user = auth.currentUser;
    if (user && targetId) {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, targetId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const existingData = snapshot.data();
          await setDoc(docRef, { ...existingData, current_structure: clampedStructure, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Failed to sync character Structure to Firestore:', err.message);
      }
    }
  }, [characterData, setCharacterData, setPersonaRoster]);

  const updateCharacterHp = updateCharacterHealth;

  // Modular Death & Dying Actions
  const {
    applyCharacterDamage,
    stabilizeCharacter,
    advanceCharacterDeathTurn,
    revivifyCharacter
  } = useFolioDeathDying({
    personaRoster: personaRoster || [],
    setPersonaRoster,
    characterData,
    setCharacterData,
    derivedStats: derivedStats || {},
    updateCharacterStructure,
    updateCharacterVitality,
    updateCharacterHealth
  });

  // Experience and AP
  const awardExperience = useCallback(async (heroId, awardDetails = {}, maybeReason) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id || 'active';
    const matchesTarget = (c) => {
      if (!c || !targetId) return false;
      const cId = c['character-doc-id'] || c.id;
      if (cId === targetId || c.id === targetId) return true;
      if (typeof targetId === 'string' && cId && targetId.startsWith(cId + '-')) return true;
      return false;
    };

    const target = (personaRoster || []).find(matchesTarget) ||
      (matchesTarget(characterData) || targetId === 'active' ? characterData : null);
    if (!target) return null;

    const matchedDocId = target['character-doc-id'] || target.id || targetId;

    const normalizedAward = (typeof awardDetails === 'number')
      ? { amount: awardDetails, reason: maybeReason || 'Experience Award' }
      : awardDetails;

    const result = applyExperienceAward(target, normalizedAward);
    const updatedData = { ...result.updatedData, updatedAt: new Date().toISOString() };

    if (setPersonaRoster) {
      setPersonaRoster(prev => {
        const updated = prev.map(c => matchesTarget(c) ? { ...c, ...updatedData } : c);
        StorageService.setItem('personaRoster', updated);
        return updated;
      });
    }

    if (matchesTarget(characterData) || targetId === 'active') {
      setCharacterData(prev => ({ ...prev, ...updatedData }));
    }

    const user = auth.currentUser;
    if (user && matchedDocId && matchedDocId !== 'active') {
      try {
        const docRef = doc(db, `users/${user.uid}/personas`, matchedDocId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          await setDoc(docRef, { ...snapshot.data(), ...updatedData });
        }
      } catch (err) {
        console.warn('Failed to sync award experience to Firestore:', err.message);
      }
    }
    return result;
  }, [personaRoster, characterData, setPersonaRoster, setCharacterData]);

  const payExperienceDebt = useCallback(async (heroId, amount = 1) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id || 'active';
    const target = (personaRoster || []).find(c => c['character-doc-id'] === targetId || c.id === targetId) ||
      (characterData['character-doc-id'] === targetId || characterData.id === targetId ? characterData : null);
    if (!target) return null;

    const result = settleExperienceDebt({ characterData: target, apAmount: amount });
    const updatedData = { ...result.updatedData, updatedAt: new Date().toISOString() };

    if (setPersonaRoster) {
      setPersonaRoster(prev => {
        const updated = prev.map(c => (c['character-doc-id'] === targetId || c.id === targetId) ? updatedData : c);
        StorageService.setItem('personaRoster', updated);
        return updated;
      });
    }

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
  }, [personaRoster, characterData, setPersonaRoster, setCharacterData]);

  // Rest and Recovery
  const {
    takeCharacterRest,
    resetDailyCharacterRests
  } = useFolioRestRecovery({
    personaRoster: personaRoster || [],
    setPersonaRoster,
    characterData,
    setCharacterData
  });

  // Karma & Plot Points
  const {
    updateCharacterKarma,
    awardCharacterKarma,
    resetCharacterKarma,
    awardPartyKarma,
    awardPartyExperience,
    spendKarma,
    gainKarma,
    resetKarmaToMax,
    spendPlotPoint,
    gainPlotPoint
  } = useFolioKarma({
    personaRoster: personaRoster || [],
    setPersonaRoster,
    characterData,
    setCharacterData,
    derivedStats: derivedStats || {},
    awardExperience
  });

  const value = {
    updateCharacterHealth,
    updateCharacterVitality,
    updateCharacterStructure,
    updateCharacterHp,
    applyCharacterDamage,
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
    isDynamicOperationalStat,
    isReadOnly
  };

  return (
    <FolioVitalsContext.Provider value={value}>
      {children}
    </FolioVitalsContext.Provider>
  );
};
