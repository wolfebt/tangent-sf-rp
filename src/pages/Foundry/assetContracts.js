/**
 * @file assetContracts.js
 * @description Standardized read-only access contracts for foundational asset modules
 * (Map Editor, Element Forge, Weaver) used by STAGE and cross-module bridges.
 * Guarantees that STAGE never directly couples to asset editor internals.
 */

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../../context/CampaignContext';
import { useDBM } from '../../context/DBMContext';
import { useFolio } from '../../context/FolioContext';
import { buildUnifiedAdeCatalog } from '../../utils/cortexAdeAssetBridge';

/**
 * Recursively flattens a scenario tree into a single array.
 */
export function flattenScenariosTree(nodes = []) {
  if (!Array.isArray(nodes)) return [];
  let result = [];
  for (const node of nodes) {
    if (!node) continue;
    result.push(node);
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      result = result.concat(flattenScenariosTree(node.children));
    }
  }
  return result;
}

/**
 * Contract for accessing Map assets.
 */
export function useMapAssets() {
  const navigate = useNavigate();
  const { mapsCatalog, universeState } = useStory();

  const list = useMemo(() => {
    const combined = [...(mapsCatalog || []), ...(universeState?.maps || [])];
    const seen = new Set();
    return combined.filter(map => {
      if (!map || !map.id || seen.has(map.id)) return false;
      seen.add(map.id);
      return true;
    });
  }, [mapsCatalog, universeState?.maps]);

  const getById = useCallback((mapId) => {
    if (!mapId) return null;
    return list.find(m => m.id === mapId) || null;
  }, [list]);

  const openInEditor = useCallback((mapId, returnTo = 'stage') => {
    const targetUrl = mapId 
      ? `/foundry/map?mapId=${encodeURIComponent(mapId)}&returnTo=${encodeURIComponent(returnTo)}`
      : `/foundry/map?returnTo=${encodeURIComponent(returnTo)}`;
    navigate(targetUrl);
  }, [navigate]);

  return {
    list,
    getById,
    openInEditor
  };
}

const EMPTY_ARRAY = [];
const EMPTY_OBJ = {};

/**
 * Contract for accessing unified Story Module + OmniCortex + Folio + MCM Elements assets.
 */
export function useElementAssets() {
  const navigate = useNavigate();
  const { elementsCatalog } = useStory() || EMPTY_OBJ;
  const { dbData = EMPTY_OBJ } = useDBM() || EMPTY_OBJ;
  const { roster: folioRoster = EMPTY_ARRAY, personaRoster = EMPTY_ARRAY, publicPersonas = EMPTY_ARRAY } = useFolio() || EMPTY_OBJ;

  const liveFolio = useMemo(
    () => (Array.isArray(folioRoster) && folioRoster.length > 0 ? folioRoster : (Array.isArray(personaRoster) ? personaRoster : EMPTY_ARRAY)),
    [folioRoster, personaRoster]
  );

  const list = useMemo(() => {
    return buildUnifiedAdeCatalog({
      elementsCatalog: Array.isArray(elementsCatalog) ? elementsCatalog : EMPTY_ARRAY,
      dbData,
      folioRoster: liveFolio,
      publicPersonas: Array.isArray(publicPersonas) ? publicPersonas : EMPTY_ARRAY
    });
  }, [elementsCatalog, dbData, liveFolio, publicPersonas]);

  const moduleList = useMemo(() => {
    return Array.isArray(elementsCatalog) ? elementsCatalog : [];
  }, [elementsCatalog]);

  const getById = useCallback((elementId) => {
    if (!elementId) return null;
    return list.find(el => el.id === elementId || el.dbmId === elementId || el.folioDocId === elementId) || null;
  }, [list]);

  const openInEditor = useCallback((elementId, returnTo = 'stage') => {
    const targetUrl = elementId
      ? `/foundry/elements?elementId=${encodeURIComponent(elementId)}&returnTo=${encodeURIComponent(returnTo)}`
      : `/foundry/elements?returnTo=${encodeURIComponent(returnTo)}`;
    navigate(targetUrl);
  }, [navigate]);

  return {
    list,
    moduleList,
    getById,
    openInEditor
  };
}

/**
 * Contract for accessing Weaver narrative assets (scenarios, beats, story projects).
 */
export function useStoryAssets() {
  const navigate = useNavigate();
  const { universeState, activeScenarioId, setActiveScenarioId } = useStory();

  const flatScenarios = useMemo(() => {
    return flattenScenariosTree(universeState?.scenarios || []);
  }, [universeState?.scenarios]);

  const list = flatScenarios;

  const getById = useCallback((scenarioId) => {
    if (!scenarioId) return null;
    return flatScenarios.find(s => s.id === scenarioId) || null;
  }, [flatScenarios]);

  const openInEditor = useCallback((scenarioId, returnTo = 'stage') => {
    if (scenarioId && setActiveScenarioId) {
      setActiveScenarioId(scenarioId);
    }
    const targetUrl = scenarioId
      ? `/foundry/scenarios?scenarioId=${encodeURIComponent(scenarioId)}&returnTo=${encodeURIComponent(returnTo)}`
      : `/foundry/scenarios?returnTo=${encodeURIComponent(returnTo)}`;
    navigate(targetUrl);
  }, [navigate, setActiveScenarioId]);

  return {
    story: universeState,
    list,
    activeScenarioId,
    getById,
    openInEditor
  };
}
