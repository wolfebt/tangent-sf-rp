import { useCallback } from 'react';
import { StorageService } from '../../services/storageService';
import { syncPersonaToFirestore } from './folioDeathDyingEngine';

/**
 * Hook providing Karma & Plot Point actions for FolioContext
 */
export const useFolioKarma = ({
  personaRoster,
  setPersonaRoster,
  characterData,
  setCharacterData,
  derivedStats,
  awardExperience
}) => {
  const updateCharacterKarma = useCallback(async (heroId, newKarma) => {
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

    const charisma = parseInt(target['attr-charisma'] || target.attr_charisma || 10, 10);
    const maxKarmaDebt = (matchesTarget(characterData) || targetId === 'active')
      ? derivedStats?.maxKarmaDebt ?? 5
      : Math.max(1, charisma + 1);
    const maxKarma = (matchesTarget(characterData) || targetId === 'active')
      ? derivedStats?.maxKarma ?? 3
      : Math.max(0, parseInt(target.maxKarma || 3, 10));

    const clampedKarma = Math.max(-maxKarmaDebt, Math.min(maxKarma, parseInt(newKarma, 10) || 0));

    setPersonaRoster(prev => {
      const updated = prev.map(c => {
        if (matchesTarget(c)) {
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

    if (matchesTarget(characterData) || targetId === 'active') {
      setCharacterData(prev => ({
        ...prev,
        karma: clampedKarma
      }));
    }

    if (matchedDocId && matchedDocId !== 'active') {
      await syncPersonaToFirestore(matchedDocId, { karma: clampedKarma });
    }

    return clampedKarma;
  }, [personaRoster, characterData, derivedStats?.maxKarma, derivedStats?.maxKarmaDebt, setPersonaRoster, setCharacterData]);

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
      ? derivedStats?.maxKarma ?? 3
      : Math.max(0, parseInt(target.maxKarma || 3, 10));

    return await updateCharacterKarma(targetId, maxK);
  }, [personaRoster, characterData, derivedStats?.maxKarma, updateCharacterKarma]);

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
    if (!awardExperience) return results;
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
      const cur = parseInt(prev.karma ?? (derivedStats?.maxKarma ?? 3), 10) || 0;
      const minAllowed = -(derivedStats?.maxKarmaDebt ?? 5);
      const next = Math.max(minAllowed, cur - amount);
      return { ...prev, karma: next };
    });
  }, [derivedStats?.maxKarma, derivedStats?.maxKarmaDebt, setCharacterData]);

  const gainKarma = useCallback((amount = 1) => {
    setCharacterData(prev => {
      const cur = parseInt(prev.karma ?? 0, 10) || 0;
      const maxAllowed = derivedStats?.maxKarma ?? 3;
      const next = Math.min(maxAllowed, cur + amount);
      return { ...prev, karma: next };
    });
  }, [derivedStats?.maxKarma, setCharacterData]);

  const resetKarmaToMax = useCallback(() => {
    setCharacterData(prev => ({
      ...prev,
      karma: derivedStats?.maxKarma ?? 3
    }));
  }, [derivedStats?.maxKarma, setCharacterData]);

  const spendPlotPoint = useCallback((amount = 1) => {
    setCharacterData(prev => {
      const cur = Math.max(0, parseInt(prev['plot-points'] || 0, 10));
      return { ...prev, 'plot-points': Math.max(0, cur - amount) };
    });
  }, [setCharacterData]);

  const gainPlotPoint = useCallback((amount = 1) => {
    setCharacterData(prev => {
      const cur = Math.max(0, parseInt(prev['plot-points'] || 0, 10));
      return { ...prev, 'plot-points': cur + amount };
    });
  }, [setCharacterData]);

  return {
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
  };
};
