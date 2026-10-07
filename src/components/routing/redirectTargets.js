/**
 * @file redirectTargets.js
 * @description Pure URL builders behind the shared router redirect components.
 * Kept JSX-free so the Node test runner can import and verify them directly.
 */

/**
 * Appends the current query string to a canonical path.
 * @param {string} to - Canonical target path (e.g. '/foundry/map').
 * @param {string} [search] - Current location.search ('?a=1' or 'a=1').
 */
export const buildSearchPreservingTarget = (to, search = '') => {
  if (!search) return to;
  const clean = search.startsWith('?') ? search : `?${search}`;
  return clean === '?' ? to : `${to}${clean}`;
};

/**
 * Builds the canonical Story Foundry URL for a legacy sub-route.
 * Existing `view` / `tab` query params always win over the alias defaults, so deep links are never overwritten.
 * `view === 'mission_control'` is the Foundry default and is expressed by omitting `view`.
 * @param {{ view?: string, tab?: string }} defaults
 * @param {string} [search] - Current location.search.
 */
export const buildFoundryRedirectTarget = ({ view, tab } = {}, search = '') => {
  const params = new URLSearchParams(search);
  if (view && !params.has('view') && view !== 'mission_control') {
    params.set('view', view);
  }
  if (tab && !params.has('tab')) {
    params.set('tab', tab);
  }
  const qs = params.toString();
  return `/foundry${qs ? `?${qs}` : ''}`;
};
