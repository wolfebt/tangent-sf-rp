import { resolveFolioMenu } from './folioResolver.js';
import { resolveCortexMenu } from './cortexResolver.js';
import { resolveAdeMenu } from './adeResolver.js';
import { resolveStageMenu } from './stageResolver.js';
import { resolveGlobalMenu } from './globalResolver.js';

/**
 * Master context menu resolver that maps context metadata, DOM hierarchies,
 * and active application routes to category-appropriate actions and AI co-pilots.
 */
export function resolveContextMenu(context, appState, handlers) {
  const { zone, subcategory, pathname = window?.location?.pathname || '/' } = context;

  let domain = 'global';
  let categoryBadge = 'SYSTEM';
  let title = context.entityTitle || '';

  // 1. Explicit Zone or Route Classification
  if (zone === 'folio' || pathname.startsWith('/folio') || pathname.startsWith('/roster')) {
    domain = 'folio';
    categoryBadge = `FOLIO // ${(subcategory || 'OPERATIVE').toUpperCase()}`;
    const items = resolveFolioMenu(context, appState, handlers);
    return { domain, categoryBadge, title, items };
  }

  if (zone === 'cortex' || zone === 'dbm' || pathname.startsWith('/dbm')) {
    domain = 'cortex';
    categoryBadge = `CORTEX // ${(subcategory || 'DATABASE').toUpperCase()}`;
    const items = resolveCortexMenu(context, appState, handlers);
    return { domain, categoryBadge, title, items };
  }

  if (zone === 'ade' || zone === 'foundry' || pathname.startsWith('/foundry') || pathname.startsWith('/ade')) {
    domain = 'ade';
    categoryBadge = `ADE // ${(subcategory || 'STUDIO').toUpperCase()}`;
    const items = resolveAdeMenu(context, appState, handlers);
    return { domain, categoryBadge, title, items };
  }

  if (zone === 'stage' || zone === 'vtt' || pathname.startsWith('/stage') || pathname.startsWith('/vtt')) {
    domain = 'stage';
    categoryBadge = `STAGE // ${(subcategory || 'TACTICAL').toUpperCase()}`;
    const items = resolveStageMenu(context, appState, handlers);
    return { domain, categoryBadge, title, items };
  }

  // Fallback to Global
  if (pathname.startsWith('/compendium') || pathname.startsWith('/rules')) {
    categoryBadge = 'COMPENDIUM // CODEX';
  } else if (pathname.startsWith('/comms') || pathname.startsWith('/network') || pathname.startsWith('/chat')) {
    categoryBadge = 'NET // COMMS';
  } else if (pathname.startsWith('/codex')) {
    categoryBadge = 'CODEX // INGEST';
  }

  const items = resolveGlobalMenu(context, appState, handlers);
  return { domain, categoryBadge, title, items };
}

export default resolveContextMenu;
