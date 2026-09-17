/**
 * @file livekitTokenService.js
 * @description Generates signed LiveKit JWT access tokens for rooms & squads using standard Web Crypto.
 * Supports direct client generation for zero-server instant connection or custom backend endpoints.
 */

// Safe access to import.meta.env in Vite
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

export const LIVEKIT_CONFIG = {
  url: env.VITE_LIVEKIT_URL || '',
  apiKey: env.VITE_LIVEKIT_API_KEY || '',
  apiSecret: env.VITE_LIVEKIT_API_SECRET || '',
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
 * Generates a signed LiveKit Access Token JWT using Web Crypto API (HMAC-SHA256)
 * @param {Object} options
 * @param {string} options.roomName - Name of the voice room or squad channel
 * @param {string} options.identity - Unique participant user ID
 * @param {string} [options.name] - Display name / persona name
 * @param {Object} [options.metadata] - Extra metadata (avatar, role, species, etc.)
 * @param {number} [options.ttlSeconds=14400] - Token expiration in seconds (default 4 hours)
 * @returns {Promise<string>} Signed JWT token
 */
export async function generateLiveKitToken({
  roomName,
  identity,
  name,
  metadata,
  ttlSeconds = 14400
}) {
  if (!roomName) throw new Error('LiveKit roomName is required');
  if (!identity) throw new Error('LiveKit participant identity is required');

  // If a dedicated backend token endpoint is provided, use it
  if (LIVEKIT_CONFIG.tokenEndpoint) {
    try {
      const resp = await fetch(LIVEKIT_CONFIG.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, identity, name, metadata })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.token) return data.token;
      }
    } catch (err) {
      console.warn('[LiveKit Token] Token endpoint failed, falling back to local signer:', err);
    }
  }

  const apiKey = LIVEKIT_CONFIG.apiKey;
  const apiSecret = LIVEKIT_CONFIG.apiSecret;

  if (!apiKey || !apiSecret) {
    throw new Error('LiveKit credentials missing (VITE_LIVEKIT_API_KEY / VITE_LIVEKIT_API_SECRET)');
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: apiKey,
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
    enc.encode(apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await subtleCrypto.sign('HMAC', cryptoKey, enc.encode(dataToSign));
  const encodedSignature = bufferToBase64Url(signatureBuffer);

  return `${dataToSign}.${encodedSignature}`;
}

export function getLiveKitServerUrl() {
  return LIVEKIT_CONFIG.url;
}

export function isLiveKitConfigured() {
  return Boolean(LIVEKIT_CONFIG.url && LIVEKIT_CONFIG.apiKey && LIVEKIT_CONFIG.apiSecret);
}

export default {
  generateLiveKitToken,
  getLiveKitServerUrl,
  isLiveKitConfigured,
  LIVEKIT_CONFIG
};
