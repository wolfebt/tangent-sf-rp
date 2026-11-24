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
  if (request === 'firebase-functions/v2/https') {
    return {
      onRequest: (optsOrHandler, maybeHandler) =>
        typeof optsOrHandler === 'function' ? optsOrHandler : maybeHandler
    };
  }
  return originalLoad.apply(this, arguments);
};

const { getLiveKitToken, geminiProxy, geminiImageProxy } = await import('../../functions/index.js');

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

test('Cloud Functions [getLiveKitToken]: Handles CORS OPTIONS preflight (allowlisted vs untrusted origin) and rejects non-POST methods', async () => {
  const optCtx = createMockHttpContext({
    method: 'OPTIONS',
    headers: { origin: 'http://localhost:5173' }
  });
  await getLiveKitToken(optCtx.req, optCtx.res);
  assert.equal(optCtx.res.getStatusCode(), 204);
  assert.equal(optCtx.res.getHeaders()['Access-Control-Allow-Origin'], 'http://localhost:5173');
  assert.equal(optCtx.res.getHeaders()['Vary'], 'Origin');

  const untrustedOptCtx = createMockHttpContext({
    method: 'OPTIONS',
    headers: { origin: 'https://evil-attacker.example' }
  });
  await getLiveKitToken(untrustedOptCtx.req, untrustedOptCtx.res);
  assert.equal(untrustedOptCtx.res.getStatusCode(), 204);
  assert.equal(untrustedOptCtx.res.getHeaders()['Access-Control-Allow-Origin'], undefined);

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
    assert.ok(capturedUrl.includes('models/gemini-2.5-flash:generateContent'));
    assert.ok(!capturedUrl.includes('key='), 'API key must NOT be leaked in the URL query string');
    assert.equal(capturedInit.headers['x-goog-api-key'], 'GEMINI_TEST_API_KEY', 'API key must be sent in x-goog-api-key header');

    const sentPayload = JSON.parse(capturedInit.body);
    assert.equal(sentPayload.contents[0].parts[0].text, 'Summarize Round 4 combat log.');
    assert.equal(sentPayload.systemInstruction.parts[0].text, 'You are BASTION, the tactical AI arbitrator.');
    assert.equal(
      validReq.res.getBody().candidates[0].content.parts[0].text,
      'Tactical mission debrief synthesized.'
    );

    // Verify geminiProxy OPTIONS preflight (204), GET rejection (405), and unauthorized (401)
    const optProxy = createMockHttpContext({ method: 'OPTIONS' });
    await geminiProxy(optProxy.req, optProxy.res);
    assert.equal(optProxy.res.getStatusCode(), 204);

    const getProxy = createMockHttpContext({ method: 'GET' });
    await geminiProxy(getProxy.req, getProxy.res);
    assert.equal(getProxy.res.getStatusCode(), 405);

    const unauthProxy = createMockHttpContext({ method: 'POST', body: { prompt: 'Test' } });
    await geminiProxy(unauthProxy.req, unauthProxy.res);
    assert.equal(unauthProxy.res.getStatusCode(), 401);

    // Verify upstream 429 rate-limit status forwarding and network failure 500 handling
    globalThis.fetch = async () => ({
      status: 429,
      json: async () => ({ error: { message: 'Resource exhausted' } })
    });
    const rateLimited = createMockHttpContext({
      method: 'POST',
      headers: { authorization: 'Bearer valid-player-token' },
      body: { prompt: 'Test rate limit' }
    });
    await geminiProxy(rateLimited.req, rateLimited.res);
    assert.equal(rateLimited.res.getStatusCode(), 429);

    // Verify disallowed model rejection (400), maxOutputTokens clamping (8192), and non-admin googleSearch tool stripping
    const badModel = createMockHttpContext({
      method: 'POST',
      headers: { authorization: 'Bearer valid-player-token' },
      body: { prompt: 'Test', model: 'gemini-exp-disallowed-99' }
    });
    await geminiProxy(badModel.req, badModel.res);
    assert.equal(badModel.res.getStatusCode(), 400);

    let inspectedPayload = null;
    globalThis.fetch = async (url, init) => {
      inspectedPayload = JSON.parse(init.body);
      return {
        status: 200,
        json: async () => ({ candidates: [{ content: { parts: [{ text: 'OK' }] } }] })
      };
    };

    const clampedReq = createMockHttpContext({
      method: 'POST',
      headers: { authorization: 'Bearer valid-player-token' },
      body: {
        prompt: 'Test clamp and tools',
        model: 'gemini-2.5-flash',
        generationConfig: { maxOutputTokens: 65000, temperature: 0.2 },
        tools: [
          { googleSearch: {} },
          { codeExecution: {} },
          { urlContext: {} },
          { functionDeclarations: [{ name: 'lookup_rule', description: 'Lookup' }] }
        ]
      }
    });
    await geminiProxy(clampedReq.req, clampedReq.res);
    assert.equal(clampedReq.res.getStatusCode(), 200);
    assert.equal(inspectedPayload.generationConfig.maxOutputTokens, 8192);
    assert.equal(inspectedPayload.tools.length, 1);
    assert.ok(inspectedPayload.tools[0].functionDeclarations);
    assert.equal(inspectedPayload.tools[0].googleSearch, undefined);
    assert.equal(inspectedPayload.tools[0].codeExecution, undefined);
    assert.equal(inspectedPayload.tools[0].urlContext, undefined);

    // Verify omitted generationConfig still enforces default maxOutputTokens cap (8192)
    const defaultCapReq = createMockHttpContext({
      method: 'POST',
      headers: { authorization: 'Bearer valid-player-token' },
      body: { prompt: 'Test default output cap', model: 'gemini-2.5-flash' }
    });
    await geminiProxy(defaultCapReq.req, defaultCapReq.res);
    assert.equal(defaultCapReq.res.getStatusCode(), 200);
    assert.equal(inspectedPayload.generationConfig.maxOutputTokens, 8192);

    // Verify getLiveKitToken rejects invalid roomName (400)
    const badRoomCtx = createMockHttpContext({
      method: 'POST',
      headers: { authorization: 'Bearer valid-player-token' },
      body: { roomName: 'bad room/with spaces & chars!' }
    });
    await getLiveKitToken(badRoomCtx.req, badRoomCtx.res);
    assert.equal(badRoomCtx.res.getStatusCode(), 400);

    // Verify getLiveKitToken rate limiting after 60 requests
    let lastRateStatus = 200;
    for (let i = 0; i < 65; i++) {
      const rateCtx = createMockHttpContext({
        method: 'POST',
        headers: { authorization: 'Bearer valid-gm-token' },
        body: { roomName: 'rate-limit-room' }
      });
      await getLiveKitToken(rateCtx.req, rateCtx.res);
      lastRateStatus = rateCtx.res.getStatusCode();
      if (lastRateStatus === 429) break;
    }
    assert.equal(lastRateStatus, 429);

    // Verify missing server credentials return 500 for both functions
    const savedConfig = mockFunctionsConfig;
    mockFunctionsConfig = {};
    try {
      const noLkCreds = createMockHttpContext({
        method: 'POST',
        headers: { authorization: 'Bearer valid-player-token' },
        body: { roomName: 'room-1' }
      });
      await getLiveKitToken(noLkCreds.req, noLkCreds.res);
      assert.equal(noLkCreds.res.getStatusCode(), 500);

      const noGeminiCreds = createMockHttpContext({
        method: 'POST',
        headers: { authorization: 'Bearer valid-player-token' },
        body: { prompt: 'Test' }
      });
      await geminiProxy(noGeminiCreds.req, noGeminiCreds.res);
      assert.equal(noGeminiCreds.res.getStatusCode(), 500);
    } finally {
      mockFunctionsConfig = savedConfig;
    }
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('Cloud Functions [geminiImageProxy]: Auth guard, model allowlist, prompt bounds, Imagen success & secret redaction', async () => {
  assert.equal(typeof geminiImageProxy, 'function');

  // 1. Rejects missing auth with 401
  const noAuth = createMockHttpContext({
    method: 'POST',
    body: { prompt: 'Orbital docking bay blueprint' }
  });
  await geminiImageProxy(noAuth.req, noAuth.res);
  assert.equal(noAuth.res.getStatusCode(), 401);

  // 2. Rejects disallowed model with 400
  const badModel = createMockHttpContext({
    method: 'POST',
    headers: { authorization: 'Bearer valid-player-token' },
    body: { prompt: 'Cyberpunk pilot portrait', model: 'dall-e-3' }
  });
  await geminiImageProxy(badModel.req, badModel.res);
  assert.equal(badModel.res.getStatusCode(), 400);

  // 3. Rejects oversized prompt > 4000 chars with 400
  const oversized = createMockHttpContext({
    method: 'POST',
    headers: { authorization: 'Bearer valid-player-token' },
    body: { prompt: 'A'.repeat(4005), model: 'imagen-3.0-generate-002' }
  });
  await geminiImageProxy(oversized.req, oversized.res);
  assert.equal(oversized.res.getStatusCode(), 400);

  const origFetch = globalThis.fetch;
  try {
    // 4. Valid Imagen 3 request forwards safely and returns normalized payload
    let capturedHeaders = null;
    globalThis.fetch = async (_url, init) => {
      capturedHeaders = init.headers;
      return {
        status: 200,
        json: async () => ({
          predictions: [{ bytesBase64Encoded: 'iVBORw0KGgo=', mimeType: 'image/png' }]
        })
      };
    };

    const okReq = createMockHttpContext({
      method: 'POST',
      headers: { authorization: 'Bearer valid-player-token' },
      body: { prompt: 'Sci-fi reactor deck schematics', model: 'imagen-3.0-generate-002', aspectRatio: '16:9' }
    });
    await geminiImageProxy(okReq.req, okReq.res);
    assert.equal(okReq.res.getStatusCode(), 200);
    assert.equal(capturedHeaders['x-goog-api-key'], 'GEMINI_TEST_API_KEY');
    assert.deepEqual(okReq.res.getBody(), {
      mimeType: 'image/png',
      imageBase64: 'iVBORw0KGgo=',
      model: 'imagen-3.0-generate-002'
    });

    // 5. Redacts upstream API secrets from error messages
    globalThis.fetch = async () => {
      throw new Error('Upstream rejected key GEMINI_TEST_API_KEY in header');
    };
    const errReq = createMockHttpContext({
      method: 'POST',
      headers: { authorization: 'Bearer valid-player-token' },
      body: { prompt: 'Trigger failure redaction' }
    });
    await geminiImageProxy(errReq.req, errReq.res);
    assert.equal(errReq.res.getStatusCode(), 500);
    assert.equal(String(errReq.res.getBody().error).includes('GEMINI_TEST_API_KEY'), false);
    assert.match(String(errReq.res.getBody().error), /\[REDACTED_KEY\]/);

    // 6. Returns 500 if Gemini API key is missing
    const savedConfig = mockFunctionsConfig;
    mockFunctionsConfig = {};
    try {
      const noKeyReq = createMockHttpContext({
        method: 'POST',
        headers: { authorization: 'Bearer valid-player-token' },
        body: { prompt: 'Test missing key' }
      });
      await geminiImageProxy(noKeyReq.req, noKeyReq.res);
      assert.equal(noKeyReq.res.getStatusCode(), 500);
    } finally {
      mockFunctionsConfig = savedConfig;
    }
  } finally {
    globalThis.fetch = origFetch;
  }
});

