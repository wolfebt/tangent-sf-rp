/**
 * @file OPFSCacheWorker.ts
 * @description Stage 4.2: Binary caching and aggressive network mitigation for Stage assets.
 * Intercepts network requests for heavy assets (.webp, .png, .mp3, .ogg, .webm) and caches them 
 * directly into the Origin Private File System (OPFS) via async FileSystem APIs.
 */

const CACHE_DIRECTORY_NAME = 'tangent_vtt_assets';
const CACHEABLE_EXTENSIONS = ['.webp', '.png', '.mp3', '.ogg', '.webm'];

export function getMimeType(filename: string): string {
  if (filename.endsWith('.webp')) return 'image/webp';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.mp3')) return 'audio/mpeg';
  if (filename.endsWith('.ogg')) return 'audio/ogg';
  if (filename.endsWith('.webm')) return 'video/webm';
  return 'application/octet-stream';
}

export async function cacheAssetInOPFS(urlStr: string, data: ArrayBuffer): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.getDirectory) return false;
    const rootDir = await navigator.storage.getDirectory();
    const assetDir = await rootDir.getDirectoryHandle(CACHE_DIRECTORY_NAME, { create: true });
    const url = new URL(urlStr, typeof location !== 'undefined' ? location.origin : 'http://localhost');
    const fileName = url.pathname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    
    const fileHandle = await assetDir.getFileHandle(fileName, { create: true });
    const writable = await (fileHandle as any).createWritable();
    await writable.write(data);
    await writable.close();
    return true;
  } catch (err) {
    console.warn('[OPFS Cache] Failed to cache asset:', err);
    return false;
  }
}

export async function getAssetFromOPFS(urlStr: string): Promise<Blob | null> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.getDirectory) return null;
    const rootDir = await navigator.storage.getDirectory();
    const assetDir = await rootDir.getDirectoryHandle(CACHE_DIRECTORY_NAME, { create: true });
    const url = new URL(urlStr, typeof location !== 'undefined' ? location.origin : 'http://localhost');
    const fileName = url.pathname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    
    const fileHandle = await assetDir.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return file;
  } catch (err) {
    return null; // Cache miss
  }
}

export { CACHEABLE_EXTENSIONS, CACHE_DIRECTORY_NAME };
