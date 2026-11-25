/**
 * @file assetHubUtils.js
 * @description Headless utility functions for Asset Hub normalization and linking.
 */

export const normalizeLinkedAssets = (rawList = [], catalog = []) => {
  if (!Array.isArray(rawList)) return [];
  const catalogById = new Map();
  if (Array.isArray(catalog)) {
    for (const entry of catalog) {
      if (entry?.id) {
        catalogById.set(entry.id, entry);
      }
    }
  }

  const seen = new Set();
  const normalized = [];

  for (const item of rawList) {
    if (!item) continue;
    const isString = typeof item === 'string';
    const assetId = isString ? item.trim() : item.assetId;
    if (!assetId || seen.has(assetId)) continue;
    seen.add(assetId);

    const found = catalogById.get(assetId);
    if (isString) {
      normalized.push({
        assetId,
        assetTitle: found?.title || found?.name || 'Untitled Asset',
        assetType: found?.type || 'Element',
        importance: 'typical',
        annotation: ''
      });
    } else {
      normalized.push({
        assetId,
        assetTitle: item.assetTitle || found?.title || found?.name || 'Untitled Asset',
        assetType: item.assetType || found?.type || 'Element',
        importance: item.importance || 'typical',
        annotation: item.annotation || ''
      });
    }
  }

  return normalized;
};
