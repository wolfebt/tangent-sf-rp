/**
 * @file FoundryIngestion.ts
 * @description Stage 4.1: Cloud payload retrieval and dependency resolution.
 * Fetches the SceneManifest from Story Foundry, resolves deep links, and commands
 * the OPFS Service Worker to pre-warm the cache for critical assets before dropping
 * the loading screen.
 */

export interface SceneInteractiveObject {
  id: string;
  name: string;
  type: 'terminal' | 'bulkhead' | 'hazard_emitter' | 'loot_container' | 'sensor_beacon';
  x: number;
  y: number;
  storyElementId?: string; // Story Foundry tie-in (clue, objective, script)
  omnicortexGearId?: string; // Omnicortex compendium tie-in
  state?: Record<string, any>;
}

export interface SceneManifest {
  id: string;
  name: string;
  description: string;
  scaleTier?: string; // Encounter, Overland, Planetary, etc.
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
    isPersona?: boolean;
  }[];
  interactiveObjects?: SceneInteractiveObject[];
}

export class FoundryIngestion {
  private endpointUrl: string;
  private authToken: string;

  constructor(endpointUrl: string = '', authToken: string = '') {
    this.endpointUrl = endpointUrl;
    this.authToken = authToken;
  }

  public setCredentials(endpointUrl: string, authToken: string) {
    this.endpointUrl = endpointUrl;
    this.authToken = authToken;
  }

  /**
   * Fetches the overarching scene data authored in Story Foundry.
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
   * Extracts heavy binary URLs (maps, audio, tokens) and pre-warms cache.
   */
  public async preWarmCache(manifest: SceneManifest): Promise<void> {
    console.log('[Foundry Ingestion] Analyzing manifest for cache pre-warming...');
    
    const assetUrls = new Set<string>();
    
    if (manifest.environment?.baseMapUrl) assetUrls.add(manifest.environment.baseMapUrl);
    if (manifest.environment?.ambientAudioUrl) assetUrls.add(manifest.environment.ambientAudioUrl);
    
    manifest.entities?.forEach(entity => {
      if (entity.tokenImageUrl) assetUrls.add(entity.tokenImageUrl);
    });

    const urlsToCache = Array.from(assetUrls);
    console.log(`[Foundry Ingestion] Queuing ${urlsToCache.length} assets for OPFS pre-fetch.`);

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PRE_FETCH_ASSETS',
        payload: urlsToCache
      });
    } else if (typeof fetch !== 'undefined') {
      await Promise.all(urlsToCache.map(url => fetch(url).catch(() => null)));
    }
  }
}
