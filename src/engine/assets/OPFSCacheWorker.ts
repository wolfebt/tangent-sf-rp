/**
 * @file OPFSCacheWorker.ts
 * @description Local high-speed binary/dataURL cache backed by the browser's
 * Origin Private File System (OPFS), with automatic IndexedDB and in-memory
 * fallbacks for browsers without OPFS or headless Node test runtimes.
 */

const OPFS_CACHE_DIR = 'tangent_asset_binaries';
const IDB_NAME = 'tangent_asset_binary_cache';
const IDB_STORE = 'binaries';
const OPFS_PREFIX = 'opfs://';

const memoryCache = new Map<string, string>();

export function isOpfsHandle(url?: string | null): boolean {
  return typeof url === 'string' && url.startsWith(OPFS_PREFIX);
}

export function toOpfsHandle(key: string): string {
  const clean = sanitizeCacheKey(key);
  return `${OPFS_PREFIX}${clean}`;
}

export function fromOpfsHandle(handleOrKey: string): string {
  return handleOrKey.startsWith(OPFS_PREFIX)
    ? sanitizeCacheKey(handleOrKey.slice(OPFS_PREFIX.length))
    : sanitizeCacheKey(handleOrKey);
}

function sanitizeCacheKey(rawKey: string): string {
  const cleaned = String(rawKey || 'asset')
    .trim()
    .replace(/\.\.+/g, '_')
    .replace(/[^A-Za-z0-9._-]+/g, '_');
  return cleaned || `asset_${Date.now()}`;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  }
  const buf = await blob.arrayBuffer();
  const maybeBuffer = typeof globalThis !== 'undefined' ? (globalThis as any).Buffer : undefined;
  if (maybeBuffer) {
    const b64 = maybeBuffer.from(buf).toString('base64');
    return `data:${blob.type || 'application/octet-stream'};base64,${b64}`;
  }
  return '';
}

async function getOpfsDir(): Promise<FileSystemDirectoryHandle | null> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.getDirectory) {
      return null;
    }
    const root = await navigator.storage.getDirectory();
    return await root.getDirectoryHandle(OPFS_CACHE_DIR, { create: true });
  } catch {
    return null;
  }
}

function openIdb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbPut(key: string, value: string): Promise<boolean> {
  const db = await openIdb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { db.close(); resolve(false); };
    } catch {
      db.close();
      resolve(false);
    }
  });
}

async function idbGet(key: string): Promise<string | null> {
  const db = await openIdb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => {
        const val = typeof req.result === 'string' ? req.result : null;
        db.close();
        resolve(val);
      };
      req.onerror = () => { db.close(); resolve(null); };
    } catch {
      db.close();
      resolve(null);
    }
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openIdb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(key);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); resolve(); };
    } catch {
      db.close();
      resolve();
    }
  });
}

async function idbKeys(): Promise<string[]> {
  const db = await openIdb();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).getAllKeys();
      req.onsuccess = () => {
        const keys = Array.isArray(req.result) ? req.result.map(String) : [];
        db.close();
        resolve(keys);
      };
      req.onerror = () => { db.close(); resolve([]); };
    } catch {
      db.close();
      resolve([]);
    }
  });
}

/**
 * Stores a binary Blob or data URL in OPFS (falling back to IndexedDB, then memory)
 * and returns its compact `opfs://` handle.
 */
export async function putAssetBinary(key: string, dataUrlOrBlob: string | Blob): Promise<string> {
  const cleanKey = fromOpfsHandle(key);
  const serialized = typeof dataUrlOrBlob === 'string'
    ? dataUrlOrBlob
    : await blobToDataUrl(dataUrlOrBlob);

  memoryCache.set(cleanKey, serialized);

  const dir = await getOpfsDir();
  if (dir) {
    try {
      const fileHandle = await dir.getFileHandle(cleanKey, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(serialized);
      await writable.close();
      return toOpfsHandle(cleanKey);
    } catch {
      // Fall through to IndexedDB
    }
  }

  await idbPut(cleanKey, serialized);
  return toOpfsHandle(cleanKey);
}

/**
 * Retrieves a cached data URL by key or `opfs://` handle.
 */
export async function getAssetBinary(keyOrHandle: string): Promise<string | null> {
  const cleanKey = fromOpfsHandle(keyOrHandle);
  if (memoryCache.has(cleanKey)) {
    return memoryCache.get(cleanKey) || null;
  }

  const dir = await getOpfsDir();
  if (dir) {
    try {
      const fileHandle = await dir.getFileHandle(cleanKey);
      const file = await fileHandle.getFile();
      const text = await file.text();
      if (text) {
        memoryCache.set(cleanKey, text);
        return text;
      }
    } catch {
      // Fall through to IndexedDB
    }
  }

  const fromIdb = await idbGet(cleanKey);
  if (fromIdb) {
    memoryCache.set(cleanKey, fromIdb);
    return fromIdb;
  }
  return null;
}

/**
 * Removes an entry from OPFS, IndexedDB, and in-memory cache.
 */
export async function deleteAssetBinary(keyOrHandle: string): Promise<void> {
  const cleanKey = fromOpfsHandle(keyOrHandle);
  memoryCache.delete(cleanKey);

  const dir = await getOpfsDir();
  if (dir) {
    try {
      await dir.removeEntry(cleanKey);
    } catch {
      // Ignore missing entry
    }
  }

  await idbDelete(cleanKey);
}

/**
 * Lists all cached binary keys across OPFS / IndexedDB / memory.
 */
export async function listAssetBinaryKeys(): Promise<string[]> {
  const keys = new Set<string>(memoryCache.keys());

  const dir = await getOpfsDir();
  if (dir && typeof (dir as any).keys === 'function') {
    try {
      for await (const name of (dir as any).keys()) {
        keys.add(String(name));
      }
    } catch {
      // Ignore enumeration errors
    }
  }

  const fromIdb = await idbKeys();
  for (const k of fromIdb) {
    keys.add(k);
  }

  return Array.from(keys);
}

export const OPFSCache = {
  isOpfsHandle,
  toOpfsHandle,
  fromOpfsHandle,
  putAssetBinary,
  getAssetBinary,
  deleteAssetBinary,
  listAssetBinaryKeys
};

export default OPFSCache;
