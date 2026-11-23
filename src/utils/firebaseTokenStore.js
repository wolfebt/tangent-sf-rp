/**
 * @file firebaseTokenStore.js
 * @description In-memory store and on-demand refresher for Firebase ID tokens.
 * Prevents exposing authentication Bearer JWTs in persistent browser localStorage.
 */

let inMemoryFirebaseIdToken = '';

export function setInMemoryFirebaseIdToken(token) {
  inMemoryFirebaseIdToken = typeof token === 'string' ? token.trim() : '';
}

export function getInMemoryFirebaseIdToken() {
  return inMemoryFirebaseIdToken;
}

/** @param {any} [authInstance=null] */
export function hasInMemoryFirebaseIdToken(authInstance = null) {
  if (authInstance?.currentUser) return true;
  return inMemoryFirebaseIdToken.length > 15;
}

/**
 * @param {any} [authInstance=null]
 * @param {boolean} [forceRefresh=false]
 */
export async function getFreshFirebaseIdToken(authInstance = null, forceRefresh = false) {
  try {
    if (authInstance?.currentUser && typeof authInstance.currentUser.getIdToken === 'function') {
      const token = await authInstance.currentUser.getIdToken(forceRefresh);
      if (token) {
        inMemoryFirebaseIdToken = token;
        return token;
      }
    }
  } catch (err) {
    console.warn('[FirebaseTokenStore] Failed to fetch fresh ID token:', err);
  }
  return inMemoryFirebaseIdToken || null;
}
