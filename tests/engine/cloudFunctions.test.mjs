/**
 * @file cloudFunctions.test.mjs
 * @description Unit & Contract Test Suite for Firebase Cloud Functions (functions/index.js).
 * Validates getLiveKitToken (CORS, method guards, Bearer auth, anti-spoofing identity binding,
 * GM/Admin override, HS256 JWT cryptographic signing) and geminiProxy (auth, validation, upstream forwarding).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import Module from 'node:module';

// Mock state for firebase-admin and firebase-functions before loading functions/index.js
let mockVerifyIdTokenImpl = async (token) => {
  if (token === 'valid-player-token') {
    return { uid: 'player-uid-123', name: 'Operative Vance', email: 'vance@tangent.rpg' };
  }
  if (token === 'valid-gm-token') {
    return { uid: 'gm-uid-999', name: 'Architect Prime', role: 'GM', admin: true };
  }
  throw new Error('Firebase ID token has expired or is invalid.');
};

let mockFunctionsConfig = {
  livekit: {
    api_key: 'LK_TEST_API_KEY',
    api_secret: 'LK_TEST_SUPER_SECRET_KEY_32_BYTES'
  },
  gemini: {
    key: 'GEMINI_TEST_API_KEY'
  }
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'firebase-admin') {
    return {
      initializeApp: () => {},
      auth: () => ({
        verifyIdToken: (token) => mockVerifyIdTokenImpl(token)
      })
    };
  }
  if (request === 'firebase-functions') {
    return {
      config: () => mockFunctionsConfig,
      https: {
        onRequest: (handler) => handler
      }
    };
  }
  return originalLoad.apply(this, arguments);
};

const { getLiveKitToken, geminiProxy } = await import('../../functions/index.js');

/**
 * Helper to create Express-like mock req/res pairs
 */
function createMockHttpContext({ method = 'POST', headers = {}, body = {} } = {}) {
  const responseHeaders = {};
  let statusCode = 200;
  let responseBody = null;

  const req = {
    method,
    headers,
    body
  };

  const res = {
    set(key, val) {
      responseHeaders[key] = val;
      return this;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    send(payload) {
      responseBody = payload;
      return this;
    },
    json(payload) {
      responseBody = payload;
      return this;
    },
    getStatusCode: () => statusCode,
    getBody: () => responseBody,
    getHeaders: () => responseHeaders
  };

  return { req, res };
}

test('Cloud Functions [getLiveKitToken]: Handles CORS OPTIONS preflight and rejects non-POST methods', async () => {
  const optCtx = createMockHttpContext({ method: 'OPTIONS' });
  await getLiveKitToken(optCtx.req, optCtx.res);
  assert.equal(optCtx.res.getStatusCode(), 204);
  assert.equal(optCtx.res.getHeaders()['Access-Control-Allow-Origin'], '*');

  const getCtx = createMockHttpContext({ method: 'GET' });
  await getLiveKitToken(getCtx.req, getCtx.res);
  assert.equal(getCtx.res.getStatusCode(), 405);
  assert.match(getCtx.res.getBody().error, /Method not allowed/i);
});

test('Cloud Functions [getLiveKitToken]: Rejects missing, malformed, or invalid Bearer tokens with 401', async () => {
  // Missing header
  const noAuth = createMockHttpContext({ method: 'POST', body: { roomName: 'stage-alpha' } });
  await getLiveKitToken(noAuth.req, noAuth.res);
  assert.equal(noAuth.res.getStatusCode(), 401);

  // Malformed header
  const badScheme = createMockHttpContext({
    method: 'POST',
    headers: { authorization: 'Basic abc123' },
    body: { roomName: 'stage-alpha' }
  });
  await getLiveKitToken(badScheme.req, badScheme.res);
  assert.equal(badScheme.res.getStatusCode(), 401);

  // Expired/invalid token
  const invalidTok = createMockHttpContext({
    method: 'POST',
    headers: { authorization: 'Bearer invalid-token' },
    body: { roomName: 'stage-alpha' }
  });
  await getLiveKitToken(invalidTok.req, invalidTok.res);
  assert.equal(invalidTok.res.getStatusCode(), 401);
});

test('Cloud Functions [getLiveKitToken]: Enforces mandatory roomName and prevents non-admin identity spoofing', async () => {
  // Missing roomName -> 400
  const missingRoom = createMockHttpContext({
    method: 'POST',
    headers: { authorization: 'Bearer valid-player-token' },
    body: {}
  });
  await getLiveKitToken(missingRoom.req, missingRoom.res);
  assert.equal(missingRoom.res.getStatusCode(), 400);

  // Standard player attempting to spoof another user's identity
  const spoofAttempt = createMockHttpContext({
    method: 'POST',
    headers: { authorization: 'Bearer valid-player-token' },
    body: {
      roomName: 'tactical-sector-7',
      identity: 'spoofed-admin-uid',
      metadata: { squad: 'Vanguard' }
    }
  });
  await getLiveKitToken(spoofAttempt.req, spoofAttempt.res);
  assert.equal(spoofAttempt.res.getStatusCode(), 200);

  const body = spoofAttempt.res.getBody();
  assert.equal(body.identity, 'player-uid-123', 'Non-privileged user must be bound strictly to their own Firebase UID');
  assert.equal(body.roomName, 'tactical-sector-7');

  // Verify JWT structure and HMAC-SHA256 cryptographic signature
  const parts = body.token.split('.');
  assert.equal(parts.length, 3, 'LiveKit token must be a 3-part JWT');

  const [headerB64, payloadB64, signatureB64] = parts;
  const expectedSig = crypto
    .createHmac('sha256', 'LK_TEST_SUPER_SECRET_KEY_32_BYTES')
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  assert.equal(signatureB64, expectedSig, 'JWT HMAC-SHA256 signature must be cryptographically valid');

  const decodedPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
  assert.equal(decodedPayload.iss, 'LK_TEST_API_KEY');
  assert.equal(decodedPayload.sub, 'player-uid-123');
  assert.equal(decodedPayload.video.room, 'tactical-sector-7');
  assert.equal(decodedPayload.video.roomJoin, true);
  assert.equal(decodedPayload.metadata, JSON.stringify({ squad: 'Vanguard' }));
});

test('Cloud Functions [getLiveKitToken]: Allows GM/Admin role to override identity for NPC/bot broadcasting', async () => {
  const gmCtx = createMockHttpContext({
    method: 'POST',
    headers: { authorization: 'Bearer valid-gm-token' },
    body: {
      roomName: 'tactical-sector-7',
      identity: 'npc-bastion-director'
    }
  });
  await getLiveKitToken(gmCtx.req, gmCtx.res);
  assert.equal(gmCtx.res.getStatusCode(), 200);
  assert.equal(gmCtx.res.getBody().identity, 'npc-bastion-director');
});

test('Cloud Functions [geminiProxy]: Validates auth, prompt parameter, and forwards structured payload to Gemini API', async () => {
  const origFetch = globalThis.fetch;
  let capturedUrl = null;
  let capturedInit = null;

  globalThis.fetch = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return {
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Tactical mission debrief synthesized.' }] } }]
      })
    };
  };

  try {
    // Missing prompt -> 400
    const noPrompt = createMockHttpContext({
      method: 'POST',
      headers: { authorization: 'Bearer valid-player-token' },
      body: { model: 'gemini-2.5-flash' }
    });
    await geminiProxy(noPrompt.req, noPrompt.res);
    assert.equal(noPrompt.res.getStatusCode(), 400);

    // Valid request with systemInstruction
    const validReq = createMockHttpContext({
      method: 'POST',
      headers: { authorization: 'Bearer valid-player-token' },
      body: {
        prompt: 'Summarize Round 4 combat log.',
        model: 'gemini-2.5-flash',
        systemInstruction: 'You are BASTION, the tactical AI arbitrator.',
        reportType: 'combat_recap'
      }
    });
    await geminiProxy(validReq.req, validReq.res);
    assert.equal(validReq.res.getStatusCode(), 200);
    assert.ok(capturedUrl.includes('models/gemini-2.5-flash:generateContent?key=GEMINI_TEST_API_KEY'));

    const sentPayload = JSON.parse(capturedInit.body);
    assert.equal(sentPayload.contents[0].parts[0].text, 'Summarize Round 4 combat log.');
    assert.equal(sentPayload.systemInstruction.parts[0].text, 'You are BASTION, the tactical AI arbitrator.');
    assert.equal(
      validReq.res.getBody().candidates[0].content.parts[0].text,
      'Tactical mission debrief synthesized.'
    );
  } finally {
    globalThis.fetch = origFetch;
  }
});
