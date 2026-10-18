import React, { lazy } from 'react';

/**
 * Enhanced React.lazy wrapper that handles deployment chunk invalidation.
 * When a user has an older version of the app open and navigates to a new lazy route
 * or opens a modal whose chunk hash has changed on the server, this detects the chunk
 * load failure and automatically reloads the page once to fetch the latest assets.
 */
export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const RELOAD_KEY = 'tangent_chunk_retry_timestamp';
    try {
      return await componentImport();
    } catch (error) {
      const isDynamicImportError =
        error?.name === 'TypeError' &&
        (error?.message?.includes('Failed to fetch dynamically imported module') ||
         error?.message?.includes('Expected a JavaScript-or-Wasm module script') ||
         error?.message?.includes('error loading dynamically imported module'));

      if (isDynamicImportError && typeof window !== 'undefined') {
        const lastReload = sessionStorage.getItem(RELOAD_KEY);
        const now = Date.now();
        // Prevent rapid reload loop if the bundle really is unavailable or network is down
        if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
          sessionStorage.setItem(RELOAD_KEY, now.toString());
          console.warn('[lazyWithRetry] Stale deployment chunk detected. Auto-refreshing application to load latest assets...');
          window.location.reload();
          // Return a pending promise to keep Suspense active while the browser reloads
          return new Promise(() => {});
        }
      }

      throw error;
    }
  });
}
