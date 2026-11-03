import { useCallback } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { StorageService } from '../../services/storageService';
import { 
  applyDamageToEntity, 
  stabilizeEntity, 
  advanceDeathClock, 
  revivifyEntity, 
  calculateDeathClock,
  calculateStabilityPoints
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

    const staBase = target['attr-stamina'] ? parseInt(target['attr-stamina'], 10) : 0;
    const staMod = target['attr-stamina-mod'] ? parseInt(target['attr-stamina-mod'], 10) : 0;
    const staTotal = Math.max(0, staBase + staMod);
    const toughness = derivedStats?.toughness ?? staTotal; // Stamina determines base Toughness

    const isSynthetic = derivedStats?.isSynthetic || 
      String(target['char-species'] || '').toLowerCase().includes('synthetic') ||
      String(target['char-species'] || '').toLowerCase().includes('mekan');

    const currentHealth = target.current_health !== undefined ? parseInt(target.current_health, 10) : parseInt(target.health || 30, 10);
    const currentVitality = target.current_vitality !== undefined ? parseInt(target.current_vitality, 10) : parseInt(target.vitality || 30, 10);
    const currentStructure = target.current_structure !== undefined ? parseInt(target.current_structure, 10) : (currentHealth + currentVitality);
    const inMortalityState = Boolean(target.in_mortality_state || target.is_at_deaths_door || currentHealth <= 0);
    const stabilityCurrent = target.stability_points !== undefined && target.stability_points !== null
      ? target.stability_points
      : (target.death_clock !== undefined ? target.death_clock : undefined);

    let result;
    if (isDirectHealth && !isSynthetic) {
      const netDamage = Math.max(0, Number(incomingDamage) || 0);
      const remHealth = currentHealth - netDamage;
      const newHealth = Math.max(0, remHealth);
      const excessToStability = remHealth < 0 ? Math.abs(remHealth) : 0;
      const entersMortality = newHealth <= 0;
      const stabilityMax = calculateStabilityPoints(staTotal);
      const startingStability = stabilityCurrent !== undefined && stabilityCurrent !== null
        ? Math.min(Number(stabilityCurrent), stabilityMax)
        : stabilityMax;
      const stabilityPoints = entersMortality ? Math.max(0, startingStability - excessToStability) : null;
      const dead = entersMortality && ((inMortalityState && netDamage >= stabilityMax) || (stabilityPoints !== null && stabilityPoints <= 0));
      result = {
        newVitality: currentVitality,
        newHealth,
        newStructure: 0,
        damageSoaked: 0,
        netDamage,
        vitalityDamage: 0,
        healthDamage: currentHealth - newHealth,
        damageAbsorbed: 0,
        inMortalityState: entersMortality,
        atDeathsDoor: entersMortality,
        dead,
        comatose: entersMortality,
        stabilityPoints: dead ? 0 : stabilityPoints,
        stabilityMax,
        deathClock: dead ? 0 : stabilityPoints
      };
    } else if (isDirectVitality && !isSynthetic) {
      const netDamage = Math.max(0, Number(incomingDamage) || 0);
      const newVitality = Math.max(0, currentVitality - netDamage);
      const entersMortality = currentHealth <= 0;
      const stabilityMax = calculateStabilityPoints(staTotal);
      const activeStability = entersMortality ? (stabilityCurrent ?? stabilityMax) : null;
      result = {
        newVitality,
        newHealth: currentHealth,
        newStructure: 0,
        damageSoaked: 0,
        netDamage,
        vitalityDamage: currentVitality - newVitality,
        healthDamage: 0,
        damageAbsorbed: 0,
        inMortalityState: entersMortality,
        atDeathsDoor: entersMortality,
        dead: false,
        comatose: entersMortality,
        stabilityPoints: activeStability,
        stabilityMax,
        deathClock: activeStability
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
        armorDR: attemptedReduction ? (armorDR || derivedStats?.effectiveArmorRating || 0) : 0,
        staminaScore: staTotal,
        isAtDeathsDoor: inMortalityState,
        inMortalityState,
        deathClockCurrent: stabilityCurrent,
        stabilityCurrent
      });
    }

    const updates = {
      in_mortality_state: Boolean(result.inMortalityState ?? result.atDeathsDoor),
      is_at_deaths_door: Boolean(result.atDeathsDoor),
      stability_points: result.stabilityPoints ?? result.deathClock,
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
      medicineCheckRoll,
      isMedicineSuccess = false,
      hasHealingEffect = false,
      force = false
    } = options || {};

    // Auto-stabilize only if caller triggered direct stabilization without a check roll, or passed an explicit force/healing/success flag
    const hasExplicitRoll = medicineCheckRoll !== undefined && medicineCheckRoll !== null;
    const effectiveSuccess = force || isMedicineSuccess || hasHealingEffect || (!hasExplicitRoll && !isMedicineSuccess && !hasHealingEffect);

    const result = stabilizeEntity({
      medicineCheckRoll: hasExplicitRoll ? medicineCheckRoll : 0,
      isMedicineSuccess: effectiveSuccess || isMedicineSuccess,
      hasHealingEffect: effectiveSuccess || hasHealingEffect
    });

    if (result.stabilized) {
      const updates = {
        is_stabilized: true,
        in_mortality_state: false,
        is_at_deaths_door: false,
        is_comatose: false,
        stability_points: null,
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

    const staBase = target['attr-stamina'] ? parseInt(target['attr-stamina'], 10) : 0;
    const staMod = target['attr-stamina-mod'] ? parseInt(target['attr-stamina-mod'], 10) : 0;
    const staScore = Math.max(0, staBase + staMod);
    const currentClock = target.stability_points !== undefined && target.stability_points !== null
      ? Number(target.stability_points)
      : (target.death_clock !== undefined && target.death_clock !== null
        ? Number(target.death_clock)
        : calculateDeathClock(staScore));

    const result = advanceDeathClock({
      currentClock,
      stabilityPoints: currentClock,
      isStabilized: Boolean(target.is_stabilized),
      fortitudeSaveRoll: options?.fortitudeSaveRoll,
      roundsDowned: options?.roundsDowned ?? 0
    });

    const updates = {
      stability_points: result.stabilityPoints ?? result.currentClock,
      death_clock: result.currentClock,
      is_dead: result.dead,
      is_stabilized: Boolean(result.isStabilized),
      in_mortality_state: !result.dead && !result.isStabilized,
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
      in_mortality_state: false,
      is_at_deaths_door: false,
      stability_points: null,
      death_clock: null,
      is_stabilized: true,
      is_comatose: false,
      active_conditions: result.updatedData?.active_conditions || ['Exhausted'],
      conditions: result.updatedData?.conditions || ['Exhausted'],
      karma: 0,
      experience_debt: result.updatedData?.experience_debt ?? ((Number(target.experience_debt) || 0) + 5)
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
