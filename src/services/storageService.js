/**
 * Asynchronous, high-capacity IndexedDB key-value storage engine for Tangent SF RP.
 * Automatically falls back to localStorage if IndexedDB is unavailable or disabled (e.g., in private browsing).
 */

const DB_NAME = 'tangent_sff_rp_storage';
const DB_VERSION = 1;
const STORE_NAME = 'app_state_kv';

let dbInstance = null;

/**
 * Initializes and retrieves the singleton IndexedDB connection.
 */
export async function getDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;

        // Handle unexpected database close or version changes
        dbInstance.onversionchange = () => {
          if (dbInstance) {
            dbInstance.close();
            dbInstance = null;
          }
        };
        dbInstance.onclose = () => {
          dbInstance = null;
        };

        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.warn('[StorageService] IndexedDB open error:', event.target.error);
        reject(event.target.error || new Error('Failed to open IndexedDB'));
      };

      request.onblocked = () => {
        console.warn('[StorageService] IndexedDB open blocked by another tab or connection.');
      };
    } catch (err) {
      reject(err);
    }
  });
}

export const StorageService = {
  /**
   * Asynchronously retrieves an item from IndexedDB with transparent localStorage fallback.
   * @param {string} key - Unique key for the stored object
   * @param {*} [defaultValue=null] - Value to return if key does not exist
   * @returns {Promise<*>}
   */
  async getItem(key, defaultValue = null) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          if (req.result !== undefined && req.result !== null) {
            resolve(req.result);
          } else {
            // Check localStorage in case data was saved before migration
            try {
              const raw = localStorage.getItem(key);
              if (raw !== null) {
                try {
                  const parsed = JSON.parse(raw);
                  resolve(parsed);
                  return;
                } catch {
                  resolve(raw);
                  return;
                }
              }
            } catch {}
            resolve(defaultValue);
          }
        };

        req.onerror = () => {
          // Fallback to localStorage on transaction error
          try {
            const raw = localStorage.getItem(key);
            resolve(raw !== null ? JSON.parse(raw) : defaultValue);
          } catch {
            resolve(defaultValue);
          }
        };
      });
    } catch {
      // Fallback to localStorage if IndexedDB is inaccessible
      try {
        const raw = localStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : defaultValue;
      } catch {
        return defaultValue;
      }
    }
  },

  /**
   * Asynchronously persists an item to IndexedDB with localStorage fallback.
   * Directly stores structured objects without blocking synchronous JSON serialization.
   * @param {string} key - Unique key
   * @param {*} value - Data to store (objects, arrays, strings, numbers, blobs)
   * @returns {Promise<boolean>}
   */
  async setItem(key, value) {
    // Keep localStorage in sync synchronously for immediate boot availability
    try {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (lsErr) {
      // LocalStorage quota or serialization issue, IDB will still persist
    }

    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);

        req.onsuccess = () => resolve(true);
        req.onerror = (e) => {
          console.warn(`[StorageService] Error putting item for key "${key}":`, e.target.error);
          resolve(true);
        };
      });
    } catch {
      return true;
    }
  },

  /**
   * Deletes a key from IndexedDB and localStorage.
   * @param {string} key - Unique key to remove
   * @returns {Promise<void>}
   */
  async removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch {}

    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    } catch (e) {
      // Ignore IDB errors during deletion
    }
  },

  /**
   * Clears the entire app_state_kv store.
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
    } catch (e) {
      console.warn('[StorageService] Error clearing store:', e);
    }
  },

  /**
   * Retrieves estimated browser storage usage and quota in MB.
   * @returns {Promise<{quotaMB: number, usageMB: number, percentUsed: number}>}
   */
  async getStorageEstimate() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const { quota, usage } = await navigator.storage.estimate();
        const quotaMB = Math.round((quota || 0) / (1024 * 1024));
        const usageMB = Math.round((usage || 0) / (1024 * 1024));
        const percentUsed = quota ? Math.round((usage / quota) * 100) : 0;
        return { quotaMB, usageMB, percentUsed };
      } catch (e) {
        console.warn('[StorageService] Failed to get storage estimate:', e);
      }
    }
    return { quotaMB: 0, usageMB: 0, percentUsed: 0 };
  }
};

export default StorageService;
