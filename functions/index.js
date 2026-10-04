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
 * Cloud Function: getLiveKitToken
 * Securely signs LiveKit JWT tokens server-side for authenticated users only.
 */
exports.getLiveKitToken = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

  try {
    const { roomName, name, metadata, ttlSeconds = 14400 } = req.body || {};

    if (!roomName) {
      return res.status(400).json({ error: 'Missing required parameter: roomName is mandatory.' });
    }

    // Bind identity strictly to the authenticated user's Firebase UID.
    // If identity is provided in body, only allow override if user has admin/GM role.
    const isPrivileged = !!(decodedUser.admin || decodedUser.role === 'admin' || decodedUser.role === 'GM');
    const identity = (isPrivileged && req.body?.identity) ? String(req.body.identity) : decodedUser.uid;

    const apiKey = process.env.LIVEKIT_API_KEY || functions.config().livekit?.api_key;
    const apiSecret = process.env.LIVEKIT_API_SECRET || functions.config().livekit?.api_secret;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Server configuration error: LiveKit credentials missing.' });
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
      name: name || decodedUser.name || decodedUser.email || identity
    };

    if (metadata) {
      payload.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
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
      roomName,
      identity,
      expiresAt: now + ttlSeconds
    });
  } catch (err) {
    console.error('Error generating LiveKit token:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * Cloud Function: geminiProxy
 * Secure gateway for Google Gemini GenAI calls (dedicated to automated reporting).
 * Requires authenticated caller.
 */
exports.geminiProxy = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

  try {
    const geminiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key;
    if (!geminiKey) {
      return res.status(500).json({ error: 'Server configuration error: Gemini API key missing.' });
    }

    const { prompt, model = 'gemini-1.5-flash', systemInstruction, reportType } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required for reporting generation.' });
    }

    console.log(`[geminiProxy] Generating report (${reportType || 'general'}) for user: ${decodedUser.uid}`);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {})
    };

    const fetchResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await fetchResponse.json();
    return res.status(fetchResponse.status).json(data);
  } catch (err) {
    console.error('Error proxying Gemini API reporting request:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
