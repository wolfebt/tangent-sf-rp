/**
 * @file assetHubUtils.js
 * @description Headless utility functions for Asset Hub normalization and linking.
 */

export const normalizeLinkedAssets = (rawList = [], catalog = []) => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(item => {
    if (typeof item === 'string') {
      const found = catalog.find(e => e.id === item);
      return {
        assetId: item,
        assetTitle: found?.title || found?.name || 'Untitled Asset',
        assetType: found?.type || 'Element',
        importance: 'typical',
        annotation: ''
      };
    }
    const found = catalog.find(e => e.id === item.assetId);
    return {
      assetId: item.assetId,
      assetTitle: item.assetTitle || found?.title || found?.name || 'Untitled Asset',
      assetType: item.assetType || found?.type || 'Element',
      importance: item.importance || 'typical',
      annotation: item.annotation || ''
    };
  });
};
