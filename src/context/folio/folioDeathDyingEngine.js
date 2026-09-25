import { useCallback } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { StorageService } from '../../services/storageService';
import { 
  applyDamageToEntity, 
  stabilizeEntity, 
  advanceDeathClock, 
  revivifyEntity, 
  calculateDeathClock 
} from '../../engines/tangentEntityEngines';

/**
 * Sync helper for updating persona document in Firestore if logged in
 */
export const syncPersonaToFirestore = async (heroId, updates) => {
  const user = auth.currentUser;
  if (!user || !heroId || heroId === 'active') return;
  try {
    const docRef = doc(db, `users/${user.uid}/personas`, heroId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      await setDoc(docRef, { ...snapshot.data(), ...updates, updatedAt: new Date().toISOString() });
    }
  } catch (err) {
    console.warn(`Failed to sync persona ${heroId} to Firestore:`, err.message);
  }
};

/**
 * Hook providing Death & Dying actions for FolioContext
 */
export const useFolioDeathDying = ({
  personaRoster,
  setPersonaRoster,
  characterData,
  setCharacterData,
  derivedStats,
  updateCharacterStructure,
  updateCharacterVitality,
  updateCharacterHealth
}) => {
  const applyCharacterDamage = useCallback(async (heroId, {
    incomingDamage = 0,
    isNonLethal = false,
    isCritical = false,
    isConcussive = false,
    attemptedReduction = true,
    armorDR = 0
  } = {}) => {
    const targetId = heroId || characterData['character-doc-id'] || characterData.id;
    const target = (personaRoster || []).find(c => targetId && (c['character-doc-id'] === targetId || c.id === targetId)) || characterData;
    if (!target) return null;

    const staTotal = target['attr-stamina'] ? parseInt(target['attr-stamina'], 10) : 0;
    const toughness = staTotal; // Stamina determines base Toughness

    const isSynthetic = derivedStats?.isSynthetic || 
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
      if (updateCharacterStructure) {
        await updateCharacterStructure(heroId, result.newStructure);
      }
    } else {
      if (result.newVitality !== currentVitality && updateCharacterVitality) {
        updates.current_vitality = result.newVitality;
        await updateCharacterVitality(heroId, result.newVitality);
      }
      if (result.newHealth !== currentHealth && updateCharacterHealth) {
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

    if (heroId) {
      await syncPersonaToFirestore(heroId, updates);
    }

    return result;
  }, [personaRoster, characterData, derivedStats?.isSynthetic, updateCharacterStructure, updateCharacterVitality, updateCharacterHealth, setPersonaRoster, setCharacterData]);

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

      if (heroId) {
        await syncPersonaToFirestore(heroId, updates);
      }
    }
    return result;
  }, [personaRoster, characterData, setPersonaRoster, setCharacterData]);

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

    if (heroId) {
      await syncPersonaToFirestore(heroId, updates);
    }
    return result;
  }, [personaRoster, characterData, setPersonaRoster, setCharacterData]);

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
      experience_debt: result.penalties?.totalExperienceDebt || 0
    };

    setPersonaRoster(prev => {
      const updated = prev.map(c => (c['character-doc-id'] === heroId || c.id === heroId) ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (characterData['character-doc-id'] === heroId || characterData.id === heroId) {
      setCharacterData(prev => ({ ...prev, ...updates }));
    }

    if (heroId) {
      await syncPersonaToFirestore(heroId, updates);
    }
    return result;
  }, [personaRoster, characterData, setPersonaRoster, setCharacterData]);

  return {
    applyCharacterDamage,
    stabilizeCharacter,
    advanceCharacterDeathTurn,
    revivifyCharacter
  };
};
