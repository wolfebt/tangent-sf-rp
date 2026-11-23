const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();

/**
 * Base64URL helper
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Helper to verify Firebase ID token from Authorization header
 */
async function authenticateRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or malformed Authorization header. Expected Bearer <token>.');
  }
  const idToken = authHeader.split('Bearer ')[1].trim();
  if (!idToken) {
    throw new Error('Unauthorized: Empty Bearer token provided.');
  }
  return await admin.auth().verifyIdToken(idToken);
}

/**
 * CORS allowlist helper for Cloud Functions
 */
function getAllowedCorsOrigins() {
  const origins = new Set();
  const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'tangent-rpg-dbm';
  if (projectId) {
    origins.add(`https://${projectId}.web.app`);
    origins.add(`https://${projectId}.firebaseapp.com`);
  }
  if (process.env.ALLOWED_CORS_ORIGINS) {
    process.env.ALLOWED_CORS_ORIGINS.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((o) => origins.add(o));
  }
  return origins;
}

function isOriginAllowed(origin) {
  if (!origin || typeof origin !== 'string') return false;
  const trimmed = origin.trim();
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/i.test(trimmed)) {
    return true;
  }
  return getAllowedCorsOrigins().has(trimmed);
}

function applyCorsHeaders(req, res, methods = 'POST, OPTIONS', headers = 'Content-Type, Authorization') {
  res.set('Vary', 'Origin');
  const requestOrigin = req.headers?.origin;
  if (requestOrigin && isOriginAllowed(requestOrigin)) {
    res.set('Access-Control-Allow-Origin', requestOrigin);
  }
  res.set('Access-Control-Allow-Methods', methods);
  res.set('Access-Control-Allow-Headers', headers);
}

/**
 * Cloud Function: getLiveKitToken
 * Securely signs LiveKit JWT tokens server-side for authenticated users only.
 */
exports.getLiveKitToken = functions.https.onRequest(async (req, res) => {
  applyCorsHeaders(req, res, 'POST, OPTIONS', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // 1. Authenticate caller
  let decodedUser;
  try {
    decodedUser = await authenticateRequest(req);
  } catch (authErr) {
    return res.status(401).json({ error: authErr.message || 'Authentication required' });
  }

  if (!checkUserRateLimit(decodedUser.uid)) {
    return res.status(429).json({ error: 'Rate limit exceeded (max 60 requests/minute per user).' });
  }

  let apiKey = '';
  let apiSecret = '';
  try {
    const { roomName, name, metadata, ttlSeconds = 14400 } = req.body || {};
    const safeTtlSeconds = Math.min(Math.max(Number(ttlSeconds) || 14400, 60), 86400);

    const safeRoomName = typeof roomName === 'string' ? roomName.trim() : '';
    if (!safeRoomName || !/^[a-zA-Z0-9._:-]{1,128}$/.test(safeRoomName)) {
      return res.status(400).json({ error: 'Invalid or missing parameter: roomName must be 1-128 safe characters.' });
    }

    if (name !== undefined && (typeof name !== 'string' || name.length > 128)) {
      return res.status(400).json({ error: 'Invalid parameter: name exceeds 128 characters.' });
    }

    const serializedMetadata = metadata !== undefined
      ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata))
      : '';
    if (serializedMetadata.length > 2048) {
      return res.status(400).json({ error: 'Invalid parameter: metadata exceeds 2048 characters.' });
    }

    // Bind identity strictly to the authenticated user's Firebase UID.
    // If identity is provided in body, only allow override if user has admin/GM role.
    const isPrivileged = !!(decodedUser.admin || decodedUser.role === 'admin' || decodedUser.role === 'GM');
    const identity = (isPrivileged && req.body?.identity) ? String(req.body.identity) : decodedUser.uid;

    // Room membership ACL check for scoped group/campaign rooms when Firestore is available
    if (!isPrivileged && typeof admin.firestore === 'function') {
      const db = admin.firestore();
      if (safeRoomName.startsWith('group_chan_') || safeRoomName.startsWith('group_')) {
        const groupId = safeRoomName.replace(/^group_(?:chan_)?/, '');
        if (groupId) {
          const groupSnap = await db.collection('game_groups').doc(groupId).get();
          if (groupSnap.exists) {
            const gData = groupSnap.data() || {};
            const members = Array.isArray(gData.members) ? gData.members : [];
            const coArchs = Array.isArray(gData.coArchitects) ? gData.coArchitects : [];
            if (gData.creatorId !== decodedUser.uid && !members.includes(decodedUser.uid) && !coArchs.includes(decodedUser.uid)) {
              return res.status(403).json({ error: 'Forbidden: Not a member of the target group room.' });
            }
          }
        }
      } else if (safeRoomName.startsWith('campaign_')) {
        const campaignId = safeRoomName.replace(/^campaign_/, '');
        if (campaignId) {
          const campSnap = await db.collection('Campaigns').doc(campaignId).get();
          if (campSnap.exists) {
            const cData = campSnap.data() || {};
            const memberIds = Array.isArray(cData.memberIds) ? cData.memberIds : [];
            if (cData.ownerId !== decodedUser.uid && !memberIds.includes(decodedUser.uid)) {
              return res.status(403).json({ error: 'Forbidden: Not a member of the target campaign room.' });
            }
          }
        }
      }
    }

    apiKey = process.env.LIVEKIT_API_KEY || functions.config().livekit?.api_key || '';
    apiSecret = process.env.LIVEKIT_API_SECRET || functions.config().livekit?.api_secret || '';

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Server configuration error: LiveKit credentials missing.' });
    }

    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: apiKey,
      sub: String(identity),
      nbf: now - 5,
      exp: now + safeTtlSeconds,
      video: {
        room: safeRoomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true
      },
      name: name || decodedUser.name || decodedUser.email || identity
    };

    if (serializedMetadata) {
      payload.metadata = serializedMetadata;
    }

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const hmac = crypto.createHmac('sha256', apiSecret);
    hmac.update(signatureInput);
    const signature = hmac.digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const token = `${signatureInput}.${signature}`;

    return res.status(200).json({
      token,
      roomName: safeRoomName,
      identity,
      expiresAt: now + safeTtlSeconds
    });
  } catch (err) {
    const safeMsg = redactSecret(redactSecret(err?.message || 'Internal server error', apiSecret), apiKey);
    console.error('Error generating LiveKit token:', safeMsg);
    return res.status(500).json({ error: safeMsg });
  }
});

/**
 * Per-user sliding-window rate limiter & secret redaction helper for geminiProxy
 */
const userRateLimitWindows = new Map();
const MAX_REQUESTS_PER_USER_PER_MINUTE = 60;
const MAX_PROXY_OUTPUT_TOKENS = 8192;
const MAX_PROXY_BODY_BYTES = 512 * 1024;
const ALLOWED_GEMINI_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest'
]);

function checkUserRateLimit(uid) {
  if (!uid) return false;
  const now = Date.now();
  if (userRateLimitWindows.size > 1000) {
    for (const [k, v] of userRateLimitWindows.entries()) {
      if (now - v.windowStart > 60000) {
        userRateLimitWindows.delete(k);
      }
    }
  }
  const entry = userRateLimitWindows.get(uid);
  if (!entry || now - entry.windowStart > 60000) {
    userRateLimitWindows.set(uid, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_USER_PER_MINUTE) {
    return false;
  }
  entry.count += 1;
  return true;
}

function sanitizeProxyTools(tools, decodedUser) {
  if (!Array.isArray(tools) || tools.length === 0) return undefined;
  const isPrivileged = !!(decodedUser?.admin || decodedUser?.role === 'admin' || decodedUser?.role === 'GM');
  if (isPrivileged) return tools;

  // Strict allowlist for standard users: permit only client-defined functionDeclarations
  const filtered = tools
    .map((tool) => {
      if (!tool || typeof tool !== 'object') return null;
      if (tool.functionDeclarations) {
        return { functionDeclarations: tool.functionDeclarations };
      }
      return null;
    })
    .filter(Boolean);

  return filtered.length > 0 ? filtered : undefined;
}

function sanitizeProxyGenerationConfig(generationConfig) {
  const sanitized = generationConfig && typeof generationConfig === 'object' ? { ...generationConfig } : {};
  if (sanitized.maxOutputTokens !== undefined) {
    const num = Number(sanitized.maxOutputTokens);
    sanitized.maxOutputTokens = Number.isFinite(num) && num > 0
      ? Math.min(Math.floor(num), MAX_PROXY_OUTPUT_TOKENS)
      : MAX_PROXY_OUTPUT_TOKENS;
  } else {
    sanitized.maxOutputTokens = MAX_PROXY_OUTPUT_TOKENS;
  }
  return sanitized;
}

function redactSecret(text, secret) {
  let clean = String(text || '');
  if (secret && typeof secret === 'string' && secret.length >= 6) {
    clean = clean.split(secret).join('[REDACTED_KEY]');
  }
  return clean.replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED_GEMINI_KEY]');
}

/**
 * Cloud Function: geminiProxy
 * Secure gateway for Google Gemini GenAI calls (dedicated to automated reporting).
 * Requires authenticated caller.
 */
exports.geminiProxy = functions.https.onRequest(async (req, res) => {
  applyCorsHeaders(req, res, 'POST, OPTIONS', 'Content-Type, Authorization, X-Firebase-AppCheck');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // 1. Authenticate caller
  let decodedUser;
  try {
    decodedUser = await authenticateRequest(req);
  } catch (authErr) {
    return res.status(401).json({ error: authErr.message || 'Authentication required for reporting generation' });
  }

  // Optional / enforced Firebase App Check verification
  const appCheckToken = req.headers?.['x-firebase-appcheck'];
  if (process.env.ENFORCE_APP_CHECK === 'true' && !appCheckToken) {
    return res.status(401).json({ error: 'App Check token required.' });
  }
  if (appCheckToken && typeof admin.appCheck === 'function') {
    try {
      await admin.appCheck().verifyToken(String(appCheckToken));
    } catch {
      return res.status(401).json({ error: 'Invalid App Check token.' });
    }
  }

  if (!checkUserRateLimit(decodedUser.uid)) {
    return res.status(429).json({ error: 'Rate limit exceeded (max 60 requests/minute per user).' });
  }

  let geminiKey = '';
  try {
    geminiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key || '';
    if (!geminiKey) {
      return res.status(500).json({ error: 'Server configuration error: Gemini API key missing.' });
    }

    const rawBodyString = JSON.stringify(req.body || {});
    if (Buffer.byteLength(rawBodyString, 'utf8') > MAX_PROXY_BODY_BYTES) {
      return res.status(413).json({ error: 'Payload exceeds maximum allowed size (512 KB).' });
    }

    const {
      prompt,
      contents,
      model = 'gemini-2.5-flash',
      systemInstruction,
      generationConfig,
      tools,
      reportType
    } = req.body || {};

    const hasContents = Array.isArray(contents) && contents.length > 0;
    if (!prompt && !hasContents) {
      return res.status(400).json({ error: 'Prompt is required for reporting generation.' });
    }

    const safeModel = String(model || 'gemini-2.5-flash').trim();
    if (!/^gemini-[a-zA-Z0-9._-]+$/.test(safeModel) || !ALLOWED_GEMINI_MODELS.has(safeModel)) {
      return res.status(400).json({ error: 'Invalid or disallowed Gemini model identifier.' });
    }

    const safeGenerationConfig = sanitizeProxyGenerationConfig(generationConfig);
    const safeTools = sanitizeProxyTools(tools, decodedUser);

    console.log(`[geminiProxy] Generating report (${reportType || 'general'}) for user: ${decodedUser.uid}`);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(safeModel)}:generateContent`;
    const normalizedSystemInstruction = systemInstruction
      ? (typeof systemInstruction === 'string' ? { parts: [{ text: systemInstruction }] } : systemInstruction)
      : undefined;

    const payload = {
      contents: hasContents ? contents : [{ parts: [{ text: prompt }] }],
      ...(normalizedSystemInstruction ? { systemInstruction: normalizedSystemInstruction } : {}),
      ...(safeGenerationConfig ? { generationConfig: safeGenerationConfig } : {}),
      ...(safeTools ? { tools: safeTools } : {})
    };

    const fetchInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey
      },
      body: JSON.stringify(payload)
    };
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      fetchInit.signal = AbortSignal.timeout(45000);
    }

    const fetchResponse = await fetch(endpoint, fetchInit);

    let data;
    if (typeof fetchResponse.text === 'function') {
      const rawText = await fetchResponse.text();
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        return res.status(502).json({
          error: redactSecret(`Upstream Gemini returned non-JSON response (HTTP ${fetchResponse.status})`, geminiKey)
        });
      }
    } else {
      data = await fetchResponse.json();
    }

    if (data?.error?.message) {
      data = {
        ...data,
        error: {
          ...data.error,
          message: redactSecret(data.error.message, geminiKey)
        }
      };
    }

    return res.status(fetchResponse.status).json(data);
  } catch (err) {
    const safeMsg = redactSecret(err?.message || 'Internal server error', geminiKey);
    console.error('Error proxying Gemini API reporting request:', safeMsg);
    return res.status(500).json({ error: safeMsg });
  }
});
