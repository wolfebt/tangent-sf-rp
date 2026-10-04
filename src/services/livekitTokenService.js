/**
 * @file livekitTokenService.js
 * @description Generates signed LiveKit JWT access tokens for rooms & squads using standard Web Crypto.
 * Supports direct client generation for zero-server instant connection or custom backend endpoints.
 */

// Safe access to environment variables across Vite client and Node/test environments
const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env)
    ? process.env
    : {};

export const LIVEKIT_CONFIG = {
  url: env.VITE_LIVEKIT_URL || '',
  apiKey: env.VITE_LIVEKIT_API_KEY || '',
  // NOTE: apiSecret is strictly purged from client production bundles.
  // In Node/test runners, it can be assigned explicitly by unit tests.
  apiSecret: (typeof window === 'undefined' && typeof process !== 'undefined') ? (process.env.LIVEKIT_TEST_SIGNING_SECRET || '') : '',
  tokenEndpoint: env.VITE_LIVEKIT_TOKEN_ENDPOINT || ''
};

/**
 * Base64URL encoder compatible with browser and Node environments
 */
function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function stringToBase64Url(str) {
  const encoder = new TextEncoder();
  return bufferToBase64Url(encoder.encode(str));
}

/**
 * Generates a signed LiveKit Access Token JWT.
 * In production/browser, calls the authenticated backend tokenEndpoint.
 * In Node test environments, falls back to Web Crypto HMAC-SHA256 signing.
 * @param {Object} options
 * @param {string} options.roomName - Name of the voice room or squad channel
 * @param {string} options.identity - Unique participant user ID
 * @param {string} [options.name] - Display name / persona name
 * @param {Object} [options.metadata] - Extra metadata (avatar, role, species, etc.)
 * @param {number} [options.ttlSeconds=14400] - Token expiration in seconds (default 4 hours)
 * @param {string} [options.idToken] - Firebase ID token (optional, auto-detected in browser)
 * @returns {Promise<string>} Signed JWT token
 */
export async function generateLiveKitToken({
  roomName,
  identity,
  name,
  metadata,
  ttlSeconds = 14400,
  idToken
}) {
  if (!roomName) throw new Error('LiveKit roomName is required');
  if (!identity) throw new Error('LiveKit participant identity is required');

  const isBrowser = typeof window !== 'undefined';

  // 1. Resolve Firebase ID token if running in the browser
  let authToken = idToken;
  if (!authToken && isBrowser) {
    try {
      const { auth } = await import('../firebase');
      if (auth?.currentUser) {
        authToken = await auth.currentUser.getIdToken();
      }
    } catch (e) {
      console.warn('[LiveKit Token] Unable to retrieve Firebase ID token:', e);
    }
  }

  // 2. Production path: Backend token endpoint (e.g. Firebase Cloud Function)
  if (LIVEKIT_CONFIG.tokenEndpoint) {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const resp = await fetch(LIVEKIT_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ roomName, identity, name, metadata, ttlSeconds })
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.token) return data.token;
    } else {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || `Voice token uplink failed (HTTP ${resp.status})`);
    }
  }

  // 3. Isolated test runner fallback (Node.js unit tests only)
  const isTestEnv = !isBrowser || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test');
  const testSecret = LIVEKIT_CONFIG.apiSecret;

  if (isTestEnv && testSecret && LIVEKIT_CONFIG.apiKey) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: LIVEKIT_CONFIG.apiKey,
      sub: String(identity),
      nbf: now - 5,
      exp: now + ttlSeconds,
      video: {
        room: String(roomName),
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true
      },
      name: name || identity
    };

    if (metadata) {
      payload.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
    }

    const encodedHeader = stringToBase64Url(JSON.stringify(header));
    const encodedPayload = stringToBase64Url(JSON.stringify(payload));
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const subtleCrypto = (typeof window !== 'undefined' && window.crypto?.subtle) 
      ? window.crypto.subtle 
      : globalThis.crypto?.subtle;

    if (!subtleCrypto) {
      throw new Error('Web Crypto API (crypto.subtle) is not available in this environment');
    }

    const enc = new TextEncoder();
    const cryptoKey = await subtleCrypto.importKey(
      'raw',
      enc.encode(testSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await subtleCrypto.sign('HMAC', cryptoKey, enc.encode(dataToSign));
    const encodedSignature = bufferToBase64Url(signatureBuffer);

    return `${dataToSign}.${encodedSignature}`;
  }

  // If in browser and no token endpoint configured or reached
  if (isBrowser) {
    throw new Error('LiveKit token endpoint is not configured. Please contact the Terran Net Architect.');
  }

  throw new Error('LiveKit credentials missing or test secret unavailable.');
}

export function getLiveKitServerUrl() {
  return LIVEKIT_CONFIG.url;
}

export function isLiveKitConfigured() {
  const isBrowser = typeof window !== 'undefined';
  if (isBrowser) {
    return Boolean(LIVEKIT_CONFIG.url && LIVEKIT_CONFIG.tokenEndpoint);
  }
  return Boolean(LIVEKIT_CONFIG.url && (LIVEKIT_CONFIG.tokenEndpoint || (LIVEKIT_CONFIG.apiKey && LIVEKIT_CONFIG.apiSecret)));
}

export default {
  generateLiveKitToken,
  getLiveKitServerUrl,
  isLiveKitConfigured,
  LIVEKIT_CONFIG
};
