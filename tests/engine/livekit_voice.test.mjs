/**
 * @file livekit_voice.test.mjs
 * @description Automated verification for LiveKit Web Crypto token generator and room validation
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLiveKitToken, isLiveKitConfigured, getLiveKitServerUrl, LIVEKIT_CONFIG } from '../../src/services/livekitTokenService.js';

// Safely load local .env if available
if (typeof process !== 'undefined' && process.loadEnvFile) {
  try {
    process.loadEnvFile();
  } catch {
    // .env not present in CI/test runner; fallback mock configuration used below
  }
}

// Provide test fallback config so unit test can run in isolated CI environments without live secrets
LIVEKIT_CONFIG.url = LIVEKIT_CONFIG.url || process.env.VITE_LIVEKIT_URL || 'wss://mock-livekit.tangent-rpg.test';
LIVEKIT_CONFIG.apiKey = LIVEKIT_CONFIG.apiKey || process.env.VITE_LIVEKIT_API_KEY || 'test_mock_api_key_123';
LIVEKIT_CONFIG.apiSecret = LIVEKIT_CONFIG.apiSecret || process.env.VITE_LIVEKIT_API_SECRET || 'test_mock_api_secret_32_byte_string_for_crypto_hmac';

test('LiveKit Token Service: Configuration check', () => {
  assert.equal(isLiveKitConfigured(), true, 'LiveKit must be configured with URL, Key, and Secret');
  const url = getLiveKitServerUrl();
  assert.ok(url.startsWith('wss://'), 'LiveKit URL must be a valid wss:// protocol');
});

test('LiveKit Token Service: JWT Token Generation format & payload validation', async () => {
  const roomName = 'squad_omega_test';
  const identity = 'usr_test_agent_123';
  const name = 'Operative Vance';
  const metadata = { role: 'Ghost Infiltrator', species: 'Alterian' };

  const token = await generateLiveKitToken({
    roomName,
    identity,
    name,
    metadata,
    ttlSeconds: 7200
  });

  assert.ok(typeof token === 'string', 'Token should be a string');
  const parts = token.split('.');
  assert.equal(parts.length, 3, 'JWT must contain exactly 3 parts separated by dots');

  // Decode header
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  assert.equal(header.alg, 'HS256');
  assert.equal(header.typ, 'JWT');

  // Decode payload
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  assert.equal(payload.sub, identity);
  assert.equal(payload.name, name);
  assert.equal(payload.video?.room, roomName);
  assert.equal(payload.video?.roomJoin, true);
  assert.equal(payload.video?.canPublish, true);
  assert.equal(payload.video?.canSubscribe, true);
  assert.deepEqual(JSON.parse(payload.metadata), metadata);
});
