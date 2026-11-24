/**
 * @file mapWorkerExportService.ts
 * @description Main-thread coordinator for non-blocking map snapshot export.
 * Dispatches rasterization to mapExportWorker (OffscreenCanvas) when supported,
 * and falls back cleanly to MapGraphicsCompiler in headless/legacy runtimes.
 */

import { MapGraphicsCompiler } from '../engine/compilers/MapGraphicsCompiler.ts';
import type { MapExportWorkerRequest, MapExportWorkerResponse } from '../workers/mapExportWorker.ts';

export interface WorkerMapExportOptions {
  widthCells: number;
  heightCells: number;
  pixelsPerGrid?: number;
  sourceGridSize?: number;
  backgroundColor?: string;
  enableWallShadows?: boolean;
  terrains?: Array<Record<string, any>>;
  underlays?: Array<Record<string, any>>;
  objects?: Array<Record<string, any>>;
  tokens?: Array<Record<string, any>>;
  texts?: Array<Record<string, any>>;
  walls?: Array<Record<string, any>>;
  lights?: Array<Record<string, any>>;
  format?: 'image/png' | 'image/webp';
  quality?: number;
  timeoutMs?: number;
}

export interface WorkerMapExportResult {
  dataUrl: string;
  usedWorker: boolean;
  fallbackReason?: string;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader did not produce a string data URL.'));
        }
      };
      reader.onerror = () => reject(reader.error || new Error('FileReader failed.'));
      reader.readAsDataURL(blob);
    });
  }
  return Promise.reject(new Error('FileReader unavailable.'));
}

export async function exportMapWithWorker(
  options: WorkerMapExportOptions
): Promise<WorkerMapExportResult> {
  const format = options.format ?? 'image/png';
  const quality = options.quality ?? 0.92;
  const pixelsPerGrid = Math.max(10, Number(options.pixelsPerGrid ?? options.sourceGridSize ?? 64));
  const widthCells = Math.max(1, Number(options.widthCells || 20));
  const heightCells = Math.max(1, Number(options.heightCells || 20));
  const width = Math.min(8192, Math.round(widthCells * pixelsPerGrid));
  const height = Math.min(8192, Math.round(heightCells * pixelsPerGrid));
  const timeoutMs = Math.max(1000, Number(options.timeoutMs ?? 12000));

  const runFallback = async (reason: string): Promise<WorkerMapExportResult> => {
      const compileOptions: Record<string, any> = {
      widthCells,
      heightCells,
      pixelsPerGrid,
      terrains: options.terrains || [],
      underlays: options.underlays || [],
      objects: options.objects || [],
      tokens: options.tokens || [],
      texts: options.texts || [],
      walls: options.walls || [],
      lights: options.lights || []
    };
    if (options.sourceGridSize !== undefined) {
      compileOptions.sourceGridSize = options.sourceGridSize;
    }
    if (options.backgroundColor !== undefined) {
      compileOptions.backgroundColor = options.backgroundColor;
    }
    const dataUrl = await MapGraphicsCompiler.compileToDataUrlAsync(
      compileOptions as any,
      format,
      quality
    );
    return {
      dataUrl,
      usedWorker: false,
      fallbackReason: reason
    };
  };

  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') {
    return runFallback('Worker or OffscreenCanvas unsupported in current environment.');
  }

  let worker: Worker | null = null;
  try {
    worker = new Worker(new URL('../workers/mapExportWorker.ts', import.meta.url), {
      type: 'module'
    });
  } catch (err: any) {
    return runFallback(err?.message || 'Failed to instantiate mapExportWorker.');
  }

  const requestId = `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

  try {
    const workerBlob = await new Promise<Blob>((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error(`Map export worker timed out after ${timeoutMs}ms.`));
        }
      }, timeoutMs);

      worker!.onmessage = (ev: MessageEvent<MapExportWorkerResponse>) => {
        const res = ev.data;
        if (!res || res.id !== requestId) return;
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          if (res.ok && res.blob) {
            resolve(res.blob);
          } else {
            reject(new Error(res.error || 'Worker reported export failure.'));
          }
        }
      };

      worker!.onerror = (ev: ErrorEvent) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(new Error(ev?.message || 'Map export worker crashed.'));
        }
      };

      const reqPayload: MapExportWorkerRequest = {
        id: requestId,
        width,
        height,
        gridSize: pixelsPerGrid,
        sourceGridSize: options.sourceGridSize ?? pixelsPerGrid,
        enableWallShadows: options.enableWallShadows ?? true,
        terrains: options.terrains || [],
        underlays: options.underlays || [],
        objects: options.objects || [],
        tokens: options.tokens || [],
        texts: options.texts || [],
        walls: options.walls || [],
        lights: options.lights || [],
        format,
        quality
      };
      if (options.backgroundColor !== undefined) {
        reqPayload.backgroundColor = options.backgroundColor;
      }
      worker!.postMessage(reqPayload);
    });

    const dataUrl = await blobToDataUrl(workerBlob);
    return { dataUrl, usedWorker: true };
  } catch (err: any) {
    return runFallback(err?.message || 'Worker export fell back to main-thread compiler.');
  } finally {
    try {
      worker?.terminate();
    } catch {
      // Ignore worker termination cleanup error
    }
  }
}
