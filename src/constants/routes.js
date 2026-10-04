/**
 * @file routes.js
 * @description Canonical application route definitions and matchers.
 */

export const ROUTES = {
  HOME: '/',
  CODEX: '/codex',
  COMPENDIUM: '/compendium',
  DBM: '/dbm',
  FOLIO: '/folio',
  FOUNDRY: '/foundry',
  FOUNDRY_HUB: '/foundry/hub',
  FOUNDRY_MISSION_CONTROL: '/foundry/mission-control',
  FOUNDRY_LIVE: '/foundry/live',
  FOUNDRY_LIVE_STUDIO: '/foundry/live-studio',
  FOUNDRY_MAP: '/foundry/map',
  FOUNDRY_ADE: '/foundry/ade',
  STAGE: '/stage',
  COMMS: '/comms',
  TEAMS: '/teams'
};

export function isAdeLiveStudioRoute(pathname = '', search = '') {
  if (search && (search.includes('tab=stage') || search.includes('live-studio'))) return true;
  return (
    pathname.startsWith('/foundry/live') ||
    pathname.startsWith('/foundry/live-studio') ||
    pathname.startsWith('/ade-stage') ||
    pathname === '/live-studio'
  );
}

export function isAdeHubRoute(pathname = '', isStage = false, search = '') {
  if (isStage || isAdeLiveStudioRoute(pathname, search)) return false;
  if (search && search.includes('view=') && !search.includes('view=mission_control')) return false;
  return (
    pathname === '/foundry' ||
    pathname === '/foundry/' ||
    pathname.startsWith('/foundry/hub') ||
    pathname.startsWith('/foundry/mission-control')
  );
}

export function isStoryFoundryRoute(pathname = '', isStage = false, search = '') {
  if (isStage || isAdeLiveStudioRoute(pathname, search) || isAdeHubRoute(pathname, isStage, search)) return false;
  return (
    pathname.startsWith('/foundry') ||
    pathname.startsWith('/ade') ||
    pathname.startsWith('/story-foundry')
  );
}
