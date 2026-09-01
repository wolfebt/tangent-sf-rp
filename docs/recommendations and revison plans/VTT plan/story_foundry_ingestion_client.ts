/**
 * @file FoundryIngestion.ts
 * @description Stage 4.1: Cloud payload retrieval and dependency resolution.
 * Fetches the SceneManifest from Story Foundry, resolves deep links, and commands
 * the OPFS Service Worker to pre-warm the cache for critical assets before dropping
 * the loading screen.
 */

export interface SceneManifest {
  id: string;
  name: string;
  description: string;
  environment: {
    baseMapUrl: string;
    weatherEffects: string[];
    ambientAudioUrl: string;
  };
  entities: {
    dbmId: string; // Links to Tangent DBM actor
    initialX: number;
    initialY: number;
    tokenImageUrl: string;
  }[];
}

export class FoundryIngestion {
  private endpointUrl: string;
  private authToken: string;

  constructor(endpointUrl: string, authToken: string) {
    this.endpointUrl = endpointUrl;
    this.authToken = authToken;
  }

  /**
   * Fetches the overarching scene data authored by the GM in Story Foundry.
   */
  public async fetchSceneManifest(sceneId: string): Promise<SceneManifest> {
    console.log(`[Foundry Ingestion] Requesting Scene Manifest: ${sceneId}...`);
    
    try {
      const response = await fetch(`${this.endpointUrl}/scenes/${sceneId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      const manifest: SceneManifest = await response.json();
      console.log(`[Foundry Ingestion] Manifest '${manifest.name}' successfully parsed.`);
      
      return manifest;
    } catch (error) {
      console.error('[Foundry Ingestion] Failed to fetch manifest:', error);
      throw error;
    }
  }

  /**
   * Extracts all heavy binary URLs (maps, audio, tokens) and commands the 
   * Service Worker to aggressively pre-fetch them into the OPFS cache.
   */
  public async preWarmCache(manifest: SceneManifest): Promise<void> {
    console.log('[Foundry Ingestion] Analyzing manifest for cache pre-warming...');
    
    const assetUrls = new Set<string>();
    
    // Extract map and audio
    if (manifest.environment.baseMapUrl) assetUrls.add(manifest.environment.baseMapUrl);
    if (manifest.environment.ambientAudioUrl) assetUrls.add(manifest.environment.ambientAudioUrl);
    
    // Extract all unique token imagery
    manifest.entities.forEach(entity => {
      if (entity.tokenImageUrl) assetUrls.add(entity.tokenImageUrl);
    });

    const urlsToCache = Array.from(assetUrls);
    console.log(`[Foundry Ingestion] Queuing ${urlsToCache.length} assets for OPFS pre-fetch.`);

    // Dispatch a message to the active Service Worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PRE_FETCH_ASSETS',
        payload: urlsToCache
      });
    } else {
      console.warn('[Foundry Ingestion] Service Worker not controlling the page. Pre-fetching fallback to browser cache.');
      // Fallback: manually fetch to populate standard browser disk cache
      await Promise.all(urlsToCache.map(url => fetch(url).catch(() => null)));
    }
  }
}