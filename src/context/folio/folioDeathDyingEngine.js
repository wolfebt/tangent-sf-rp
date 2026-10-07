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
  const applyCharacterDamage = useCallback(async (heroIdOrOptions, maybeOptions = {}) => {
    let heroId = typeof heroIdOrOptions === 'string' ? heroIdOrOptions : null;
    let options = (typeof heroIdOrOptions === 'object' && heroIdOrOptions !== null) ? heroIdOrOptions : maybeOptions;

    const {
      incomingDamage = 0,
      isNonLethal = false,
      isCritical = false,
      isConcussive = false,
      isDirectHealth = false,
      isDirectVitality = false,
      attemptedReduction = false,
      armorDR = 0
    } = options || {};

    const targetId = heroId || options?.heroId || options?.characterId || options?.id || characterData?.['character-doc-id'] || characterData?.id;
    const matchesTarget = (c) => {
      if (!c) return false;
      if (!targetId || targetId === 'active') return true;
      const cDocId = c['character-doc-id'] || c.id;
      if (cDocId === targetId || c.id === targetId) return true;
      if (typeof targetId === 'string' && cDocId && targetId.startsWith(cDocId + '-')) return true;
      return false;
    };

    const target = (personaRoster || []).find(matchesTarget) || (matchesTarget(characterData) ? characterData : null) || characterData;
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

    let result;
    if (isDirectHealth && !isSynthetic) {
      const netDamage = Math.max(0, Number(incomingDamage) || 0);
      const newHealth = Math.max(0, currentHealth - netDamage);
      const atDeathsDoor = newHealth <= 0 && currentVitality <= 0;
      const dead = atDeathsDoor && (target.death_clock !== undefined && target.death_clock !== null && Number(target.death_clock) <= 0);
      result = {
        newVitality: currentVitality,
        newHealth,
        newStructure: 0,
        damageSoaked: 0,
        netDamage,
        vitalityDamage: 0,
        healthDamage: currentHealth - newHealth,
        damageAbsorbed: 0,
        atDeathsDoor,
        dead,
        comatose: atDeathsDoor,
        deathClock: atDeathsDoor ? (target.death_clock || Math.max(1, staTotal || 1)) : null
      };
    } else if (isDirectVitality && !isSynthetic) {
      const netDamage = Math.max(0, Number(incomingDamage) || 0);
      const newVitality = Math.max(0, currentVitality - netDamage);
      const atDeathsDoor = currentHealth <= 0 && newVitality <= 0;
      result = {
        newVitality,
        newHealth: currentHealth,
        newStructure: 0,
        damageSoaked: 0,
        netDamage,
        vitalityDamage: currentVitality - newVitality,
        healthDamage: 0,
        damageAbsorbed: 0,
        atDeathsDoor,
        dead: false,
        comatose: atDeathsDoor,
        deathClock: atDeathsDoor ? (target.death_clock || Math.max(1, staTotal || 1)) : null
      };
    } else {
      result = applyDamageToEntity({
        currentVitality,
        currentHealth,
        currentStructure,
        isSynthetic,
        incomingDamage,
        isNonLethal,
        isCritical,
        isConcussive,
        attemptedReduction,
        toughness: attemptedReduction ? toughness : 0,
        armorDR: attemptedReduction ? armorDR : 0,
        staminaScore: staTotal,
        isAtDeathsDoor,
        deathClockCurrent
      });
    }

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
        await updateCharacterStructure(targetId, result.newStructure);
      }
    } else {
      updates.current_vitality = result.newVitality;
      updates.current_health = result.newHealth;
      if (updateCharacterVitality) {
        await updateCharacterVitality(targetId, result.newVitality);
      }
      if (updateCharacterHealth) {
        await updateCharacterHealth(targetId, result.newHealth);
      }
    }

    setPersonaRoster(prev => {
      const updated = prev.map(c => matchesTarget(c) ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (matchesTarget(characterData) || !targetId || targetId === 'active') {
      setCharacterData(prev => ({ ...prev, ...updates }));
    }

    const effectiveSyncId = target['character-doc-id'] || target.id || targetId;
    if (effectiveSyncId && effectiveSyncId !== 'active') {
      await syncPersonaToFirestore(effectiveSyncId, updates);
    }

    return result;
  }, [personaRoster, characterData, derivedStats?.isSynthetic, updateCharacterStructure, updateCharacterVitality, updateCharacterHealth, setPersonaRoster, setCharacterData]);

  const stabilizeCharacter = useCallback(async (heroIdOrOptions, maybeOptions = {}) => {
    let heroId = typeof heroIdOrOptions === 'string' ? heroIdOrOptions : null;
    let options = (typeof heroIdOrOptions === 'object' && heroIdOrOptions !== null) ? heroIdOrOptions : maybeOptions;

    const targetId = heroId || options?.heroId || options?.characterId || options?.id || characterData?.['character-doc-id'] || characterData?.id;
    const matchesTarget = (c) => {
      if (!c) return false;
      if (!targetId || targetId === 'active') return true;
      const cDocId = c['character-doc-id'] || c.id;
      if (cDocId === targetId || c.id === targetId) return true;
      if (typeof targetId === 'string' && cDocId && targetId.startsWith(cDocId + '-')) return true;
      return false;
    };

    const target = (personaRoster || []).find(matchesTarget) || (matchesTarget(characterData) ? characterData : null) || characterData;
    if (!target) return null;

    const {
      medicineCheckRoll = 0,
      isMedicineSuccess = false,
      hasHealingEffect = false,
      force = false
    } = options || {};

    // If caller triggered direct stabilization without check roll, or explicit force/healing flag
    const effectiveSuccess = force || isMedicineSuccess || hasHealingEffect || (medicineCheckRoll === 0 && !isMedicineSuccess && !hasHealingEffect);

    const result = stabilizeEntity({
      medicineCheckRoll,
      isMedicineSuccess: effectiveSuccess || isMedicineSuccess,
      hasHealingEffect: effectiveSuccess || hasHealingEffect
    });

    if (result.stabilized) {
      const updates = {
        is_stabilized: true,
        is_at_deaths_door: false,
        is_comatose: false,
        death_clock: null
      };

      setPersonaRoster(prev => {
        const updated = prev.map(c => matchesTarget(c) ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
        StorageService.setItem('personaRoster', updated);
        return updated;
      });

      if (matchesTarget(characterData) || !targetId || targetId === 'active') {
        setCharacterData(prev => ({ ...prev, ...updates }));
      }

      const effectiveSyncId = target['character-doc-id'] || target.id || targetId;
      if (effectiveSyncId && effectiveSyncId !== 'active') {
        await syncPersonaToFirestore(effectiveSyncId, updates);
      }
    }
    return result;
  }, [personaRoster, characterData, setPersonaRoster, setCharacterData]);

  const advanceCharacterDeathTurn = useCallback(async (heroIdOrOptions, maybeOptions = {}) => {
    let heroId = typeof heroIdOrOptions === 'string' ? heroIdOrOptions : null;
    let options = (typeof heroIdOrOptions === 'object' && heroIdOrOptions !== null) ? heroIdOrOptions : maybeOptions;

    const targetId = heroId || options?.heroId || options?.characterId || options?.id || characterData?.['character-doc-id'] || characterData?.id;
    const matchesTarget = (c) => {
      if (!c) return false;
      if (!targetId || targetId === 'active') return true;
      const cDocId = c['character-doc-id'] || c.id;
      if (cDocId === targetId || c.id === targetId) return true;
      if (typeof targetId === 'string' && cDocId && targetId.startsWith(cDocId + '-')) return true;
      return false;
    };

    const target = (personaRoster || []).find(matchesTarget) || (matchesTarget(characterData) ? characterData : null) || characterData;
    if (!target) return null;

    const staScore = target['attr-stamina'] ? parseInt(target['attr-stamina'], 10) : 0;
    const currentClock = target.death_clock !== undefined && target.death_clock !== null
      ? Number(target.death_clock)
      : calculateDeathClock(staScore);

    const result = advanceDeathClock({ currentClock, isStabilized: Boolean(target.is_stabilized) });

    const updates = {
      death_clock: result.currentClock,
      is_dead: result.dead,
      is_at_deaths_door: !result.dead && !result.isStabilized
    };

    setPersonaRoster(prev => {
      const updated = prev.map(c => matchesTarget(c) ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (matchesTarget(characterData) || !targetId || targetId === 'active') {
      setCharacterData(prev => ({ ...prev, ...updates }));
    }

    const effectiveSyncId = target['character-doc-id'] || target.id || targetId;
    if (effectiveSyncId && effectiveSyncId !== 'active') {
      await syncPersonaToFirestore(effectiveSyncId, updates);
    }
    return result;
  }, [personaRoster, characterData, setPersonaRoster, setCharacterData]);

  const revivifyCharacter = useCallback(async (heroIdOrOptions, maybeOptions = {}) => {
    let heroId = typeof heroIdOrOptions === 'string' ? heroIdOrOptions : null;
    let options = (typeof heroIdOrOptions === 'object' && heroIdOrOptions !== null) ? heroIdOrOptions : maybeOptions;
    const { revivedHealth = 1 } = options || {};

    const targetId = heroId || options?.heroId || options?.characterId || options?.id || characterData?.['character-doc-id'] || characterData?.id;
    const matchesTarget = (c) => {
      if (!c) return false;
      if (!targetId || targetId === 'active') return true;
      const cDocId = c['character-doc-id'] || c.id;
      if (cDocId === targetId || c.id === targetId) return true;
      if (typeof targetId === 'string' && cDocId && targetId.startsWith(cDocId + '-')) return true;
      return false;
    };

    const target = (personaRoster || []).find(matchesTarget) || (matchesTarget(characterData) ? characterData : null) || characterData;
    if (!target) return null;

    const result = revivifyEntity({ characterData: target, revivedHealth });
    const isSynthetic = target.isSynthetic || 
      String(target['char-species'] || '').toLowerCase().includes('synthetic') ||
      String(target['char-species'] || '').toLowerCase().includes('mekan');

    const updates = {
      current_health: isSynthetic ? 0 : Math.max(1, Number(revivedHealth) || 1),
      current_structure: isSynthetic ? Math.max(1, Number(revivedHealth) || 1) : target.current_structure,
      is_dead: false,
      is_at_deaths_door: false,
      death_clock: null,
      is_stabilized: true,
      is_comatose: false,
      karma: 0,
      experience_debt: (target.experience_debt || 0) + (result.penalties?.totalExperienceDebt || 5)
    };

    if (isSynthetic && updateCharacterStructure) {
      await updateCharacterStructure(targetId, updates.current_structure);
    } else if (!isSynthetic && updateCharacterHealth) {
      await updateCharacterHealth(targetId, updates.current_health);
    }

    setPersonaRoster(prev => {
      const updated = prev.map(c => matchesTarget(c) ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
      StorageService.setItem('personaRoster', updated);
      return updated;
    });

    if (matchesTarget(characterData) || !targetId || targetId === 'active') {
      setCharacterData(prev => ({ ...prev, ...updates }));
    }

    const effectiveSyncId = target['character-doc-id'] || target.id || targetId;
    if (effectiveSyncId && effectiveSyncId !== 'active') {
      await syncPersonaToFirestore(effectiveSyncId, updates);
    }
    return result;
  }, [personaRoster, characterData, setPersonaRoster, setCharacterData, updateCharacterStructure, updateCharacterHealth]);

  return {
    applyCharacterDamage,
    stabilizeCharacter,
    advanceCharacterDeathTurn,
    revivifyCharacter
  };
};
