import { writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * @typedef {Object} BatchOperation
 * @property {import('firebase/firestore').DocumentReference} ref - The Firestore document reference.
 * @property {Record<string, any>} data - The document payload to write.
 * @property {boolean} [merge=true] - Whether to merge with existing document fields.
 */

/**
 * Recursively removes any `undefined` values from objects or replaces them in arrays with null,
 * guaranteeing the payload complies with Firestore's strict data rules (which throw on any undefined).
 * @param {any} data
 * @returns {any}
 */
export function sanitizeFirestoreData(data) {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Date) return data.toISOString();

  if (Array.isArray(data)) {
    return data.map(item => (item === undefined ? null : sanitizeFirestoreData(item)));
  }

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = sanitizeFirestoreData(value);
    }
  }
  return clean;
}

/**
 * Commits an array of operations in safe chunks of 450 items (below the Firestore 500-op transaction limit).
 * Executes chunks sequentially to prevent network and memory bottlenecks.
 *
 * @param {BatchOperation[]} operations - List of document write operations.
 * @param {number} [chunkSize=450] - Number of operations per batch (max 500 allowed by Firestore).
 * @param {((completed: number, total: number) => void)} [onProgress] - Optional callback for tracking progress.
 * @returns {Promise<void>}
 */
export async function commitChunkedBatches(
  operations,
  chunkSize = 450,
  onProgress
) {
  if (!operations || operations.length === 0) return;

  const total = operations.length;
  const chunks = [];

  for (let i = 0; i < total; i += chunkSize) {
    chunks.push(operations.slice(i, i + chunkSize));
  }

  let completed = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const batch = writeBatch(db);

    chunk.forEach(({ ref, data, merge = true }) => {
      if (ref && data) {
        batch.set(ref, sanitizeFirestoreData(data), { merge });
      }
    });

    await batch.commit();
    completed += chunk.length;
    if (typeof onProgress === 'function') {
      onProgress(completed, total);
    }
  }
}
