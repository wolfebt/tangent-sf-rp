/**
 * @file compendiumSeedLoader.js
 * @description Hybrid static-asset + Node-sync loader for compendiumSeed.json.
 *   - In the browser / PWA: fetches `/data/compendiumSeed.json` on demand so the 4.5 MB
 *     compendium dataset never bloats any JavaScript bundle chunk.
 *   - In Node test / script runtimes: reads `src/data/compendiumSeed.json` synchronously via
 *     `process.getBuiltinModule('node:fs')` so synchronous callers remain 100% deterministic.
 */

let cachedSeed = null;
let inFlightPromise = null;
const subscribers = new Set();

function tryLoadNodeSync() {
  try {
    const proc = globalThis['process'];
    if (!proc || !proc.versions || !proc.versions.node) return null;
    if (typeof proc.getBuiltinModule !== 'function') return null;

    const fs = proc.getBuiltinModule('node:fs');
    const pathMod = proc.getBuiltinModule('node:path');
    const urlMod = proc.getBuiltinModule('node:url');
    if (!fs || !pathMod || !urlMod) return null;

    const currentDir = pathMod.dirname(urlMod.fileURLToPath(import.meta.url));
    const seedPath = pathMod.resolve(currentDir, '../data/compendiumSeed.json');
    if (!fs.existsSync(seedPath)) return null;

    const raw = fs.readFileSync(seedPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return null;
  }
}

function notifySubscribers(seedArray) {
  for (const listener of subscribers) {
    try {
      listener(seedArray);
    } catch {
      // Ignore subscriber errors
    }
  }
}

// Synchronous bootstrap in Node runtimes (no-op in browser builds)
cachedSeed = tryLoadNodeSync();

/**
 * Returns the currently cached compendium seed array synchronously.
 */
export function getCachedCompendiumSeed() {
  return Array.isArray(cachedSeed) ? cachedSeed : [];
}

/**
 * Returns true when the compendium dataset has been loaded and cached.
 */
export function isCompendiumSeedReady() {
  return Array.isArray(cachedSeed) && cachedSeed.length > 0;
}

/**
 * Subscribes to compendium dataset load completion events.
 */
export function subscribeCompendiumSeed(listener) {
  if (typeof listener !== 'function') return () => {};
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

/**
 * Fetches `/data/compendiumSeed.json` in the browser (or loads synchronously in Node)
 * with de-duplicated single-flight caching.
 */
export async function loadCompendiumSeed() {
  if (Array.isArray(cachedSeed) && cachedSeed.length > 0) {
    return cachedSeed;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    const nodeSync = tryLoadNodeSync();
    if (Array.isArray(nodeSync) && nodeSync.length > 0) {
      cachedSeed = nodeSync;
      notifySubscribers(cachedSeed);
      return cachedSeed;
    }

    if (typeof fetch === 'function') {
      try {
        const res = await fetch('/data/compendiumSeed.json');
        if (res.ok) {
          const parsed = await res.json();
          if (Array.isArray(parsed)) {
            cachedSeed = parsed;
            notifySubscribers(cachedSeed);
            return cachedSeed;
          }
        }
      } catch (err) {
        console.warn('[compendiumSeedLoader] Static asset fetch failed:', err);
      }
    }

    return Array.isArray(cachedSeed) ? cachedSeed : [];
  })().finally(() => {
    if (!Array.isArray(cachedSeed) || cachedSeed.length === 0) {
      inFlightPromise = null;
    }
  });

  return inFlightPromise;
}

/**
 * Non-blocking browser prefetch trigger if dataset is not yet cached.
 */
export function ensureCompendiumSeedPrefetched() {
  if (!isCompendiumSeedReady() && typeof window !== 'undefined' && typeof fetch === 'function') {
    loadCompendiumSeed().catch(() => {});
  }
}
