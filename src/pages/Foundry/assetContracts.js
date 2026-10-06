/**
 * @file assetContracts.js
 * @description Standardized read-only access contracts for foundational asset modules
 * (Map Editor, Element Forge, Weaver) used by STAGE and cross-module bridges.
 * Guarantees that STAGE never directly couples to asset editor internals.
 */

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../../context/CampaignContext';

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

/**
 * Contract for accessing Story Elements assets.
 */
export function useElementAssets() {
  const navigate = useNavigate();
  const { elementsCatalog, setEditingElement } = useStory();

  const list = useMemo(() => {
    return Array.isArray(elementsCatalog) ? elementsCatalog : [];
  }, [elementsCatalog]);

  const getById = useCallback((elementId) => {
    if (!elementId) return null;
    return list.find(el => el.id === elementId) || null;
  }, [list]);

  const openInEditor = useCallback((elementId, returnTo = 'stage') => {
    const targetUrl = elementId
      ? `/foundry/elements?elementId=${encodeURIComponent(elementId)}&returnTo=${encodeURIComponent(returnTo)}`
      : `/foundry/elements?returnTo=${encodeURIComponent(returnTo)}`;
    navigate(targetUrl);
  }, [navigate]);

  return {
    list,
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
