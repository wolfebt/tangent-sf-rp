/**
 * @file OPFSCacheWorker.ts
 * @description Stage 4.2: Binary caching and aggressive network mitigation.
 * Intercepts network requests for heavy assets (.webp, .mp3) and caches them 
 * directly into the Origin Private File System (OPFS) via async FileSystem APIs.
 * Note: This script runs in the ServiceWorkerGlobalScope.
 */

/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

const CACHE_DIRECTORY_NAME = 'tangent_vtt_assets';
const CACHEABLE_EXTENSIONS = ['.webp', '.png', '.mp3', '.ogg', '.webm'];

// Eviction threshold (e.g., 500MB). In a production environment, this would 
// be checked periodically and implement an LRU (Least Recently Used) policy.
const MAX_OPFS_QUOTA_MB = 500; 

self.addEventListener('install', (event) => {
  console.log('[OPFS Cache Worker] Installed. Skipping waiting phase.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[OPFS Cache Worker] Activated and claiming clients.');
  event.waitUntil(self.clients.claim());
});

/**
 * Message listener for aggressive pre-fetching directed by FoundryIngestion.ts
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRE_FETCH_ASSETS') {
    const urls: string[] = event.data.payload;
    console.log(`[OPFS Cache Worker] Pre-fetching ${urls.length} assets in background.`);
    
    urls.forEach(async (url) => {
      try {
        await handleAssetRequest(new Request(url));
      } catch (err) {
        console.warn(`[OPFS Cache Worker] Pre-fetch failed for ${url}`, err);
      }
    });
  }
});

/**
 * Intercepts all fetch requests made by the VTT browser tab.
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only intercept GET requests for specific media extensions
  const isCacheable = CACHEABLE_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
  
  if (event.request.method === 'GET' && isCacheable) {
    event.respondWith(handleAssetRequest(event.request));
  }
});

/**
 * Checks OPFS for the file. If missing, fetches from network, saves to OPFS, and returns it.
 */
async function handleAssetRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  // Sanitize the filename to be used in OPFS
  const fileName = url.pathname.replace(/[^a-zA-Z0-9.\-]/g, '_');

  try {
    const rootDir = await navigator.storage.getDirectory();
    
    // Attempt to open the directory (create if it doesn't exist)
    const assetDir = await rootDir.getDirectoryHandle(CACHE_DIRECTORY_NAME, { create: true });

    try {
      // 1. CACHE HIT: Try to get the file from OPFS
      const fileHandle = await assetDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      
      console.log(`[OPFS Cache Worker] Cache HIT: Served ${fileName} from OPFS.`);
      
      // Determine correct mime type
      const mimeType = getMimeType(fileName);
      return new Response(file, { headers: { 'Content-Type': mimeType } });

    } catch (e) {
      // 2. CACHE MISS: File not found in OPFS, fetch from network
      console.log(`[OPFS Cache Worker] Cache MISS: Fetching ${fileName} from network.`);
      
      const networkResponse = await fetch(request);
      
      if (!networkResponse.ok) throw new Error('Network fetch failed');
      
      // Clone response because we need to return one and consume the other for saving
      const responseToCache = networkResponse.clone();
      const arrayBuffer = await responseToCache.arrayBuffer();

      // Write to OPFS async
      try {
        const fileHandle = await assetDir.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(arrayBuffer);
        await writable.close();
        console.log(`[OPFS Cache Worker] Successfully cached ${fileName} to OPFS.`);
      } catch (writeErr) {
        console.error(`[OPFS Cache Worker] Failed to write ${fileName} to OPFS:`, writeErr);
      }

      return networkResponse;
    }

  } catch (error) {
    console.error(`[OPFS Cache Worker] Fatal error processing ${url.pathname}:`, error);
    // Absolute fallback: just fetch it from the network
    return fetch(request);
  }
}

function getMimeType(filename: string): string {
  if (filename.endsWith('.webp')) return 'image/webp';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.mp3')) return 'audio/mpeg';
  if (filename.endsWith('.ogg')) return 'audio/ogg';
  if (filename.endsWith('.webm')) return 'video/webm';
  return 'application/octet-stream';
}