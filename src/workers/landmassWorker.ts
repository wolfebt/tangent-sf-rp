/**
 * @file landmassWorker.ts
 * @description Off-thread Web Worker for heavy procedural planetary landmass generation.
 */

import { generateLandmassGrid } from '../pages/Foundry/MapMaker/map/landmassGenerator.js';

export interface LandmassWorkerRequest {
  id: string;
  params: Record<string, any>;
}

export interface LandmassWorkerResponse {
  id: string;
  ok: boolean;
  result?: any;
  error?: string;
}

if (typeof self !== 'undefined' && typeof (self as any).addEventListener === 'function') {
  self.addEventListener('message', (event: MessageEvent<LandmassWorkerRequest>) => {
    const data = event.data;
    if (!data || !data.id) return;
    try {
      const result = generateLandmassGrid(data.params || {});
      const resp: LandmassWorkerResponse = { id: data.id, ok: true, result };
      (self as any).postMessage(resp);
    } catch (err: any) {
      const resp: LandmassWorkerResponse = {
        id: data.id,
        ok: false,
        error: err?.message || 'Landmass worker failed'
      };
      (self as any).postMessage(resp);
    }
  });
}
