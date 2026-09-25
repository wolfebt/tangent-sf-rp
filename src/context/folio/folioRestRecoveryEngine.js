import { useCallback } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { StorageService } from '../../services/storageService';
import { executeRestCycle, resetDailyRests } from '../../engines/tangentRestEngine';
import { syncPersonaToFirestore } from './folioDeathDyingEngine';

/**
 * Hook providing Rest & Recovery actions for FolioContext
 */
export const useFolioRestRecovery = ({
  personaRoster,
  setPersonaRoster,
  characterData,
  setCharacterData
}) => {
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

    if (targetId && targetId !== 'active') {
      await syncPersonaToFirestore(targetId, updates);
    }

    return result;
  }, [personaRoster, characterData, setPersonaRoster, setCharacterData]);

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

    if (targetId && targetId !== 'active') {
      await syncPersonaToFirestore(targetId, updates);
    }

    return resetDailyRests();
  }, [characterData, setPersonaRoster, setCharacterData]);

  return {
    takeCharacterRest,
    resetDailyCharacterRests
  };
};
